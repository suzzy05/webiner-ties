import { randomUUID } from 'node:crypto'
import type { VenueType } from '@/data/mockEvents'
import { mockEvents } from '@/data/mockEvents'
import { buildDefaultRsvpQuestions } from './defaultRsvpForm'
import { getDb } from './db'

function normalizeTag(t: string) {
  return t.trim().toLowerCase()
}

function nowIso() {
  return new Date().toISOString()
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ListedEvent = {
  id: string
  slug: string
  title: string
  summary: string
  descriptionMd: string
  coverImageUrl: string | null
  venueType: VenueType
  meetingUrl: string | null
  locationText: string | null
  mapsEmbedUrl: string | null
  mapsLinkUrl: string | null
  startAt: string
  endAt: string | null
  timezone: string
  capacity: number | null
  isPublished: boolean
  organizer: { handle: string; name: string; bio?: string; website?: string }
  tagList: string[]
  _count: { rsvps: number }
}

export type ListEventsInput = {
  q?: string
  tag?: string
  venue?: VenueType
  after?: Date
  before?: Date
  take?: number
  includeUnpublished?: boolean
}

export type CreateEventInput = {
  title: string
  summary: string
  descriptionMd: string
  coverImageUrl?: string | null
  tags: string[]
  venueType: VenueType
  meetingUrl?: string | null
  locationText?: string | null
  mapsEmbedUrl?: string | null
  mapsLinkUrl?: string | null
  startAt: string
  endAt?: string | null
  timezone: string
  capacity?: number | null
  isPublished?: boolean
  organizerHandle: string
  organizerName: string
  organizerBio?: string | null
  organizerWebsite?: string | null
  slug?: string
}

export type UpdateEventInput = Partial<CreateEventInput>

// ── Seeding ───────────────────────────────────────────────────────────────────

let seeded = false

async function ensureSeeded() {
  if (seeded) return
  const db = await getDb()

  const countResult = await db.execute(`SELECT COUNT(*) as c FROM events`)
  const count = Number((countResult.rows[0] as any).c)
  if (count > 0) {
    seeded = true
    return
  }

  const now = nowIso()
  for (const e of mockEvents.filter((ev) => ev.published)) {
    const id = randomUUID()
    const tagsCsv = e.tags.map(normalizeTag).join(',')

    await db.execute({
      sql: `INSERT OR IGNORE INTO organizers (handle, name, bio, website, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [e.organizer.handle, e.organizer.name, e.organizer.bio ?? null, e.organizer.website ?? null, now, now],
    })

    await db.execute({
      sql: `INSERT OR IGNORE INTO events
              (id, slug, title, summary, description_md, poster_url, tags_csv,
               venue_type, meeting_url, location_text, maps_embed_url, maps_link_url,
               start_at, end_at, timezone, capacity, is_published,
               organizer_handle, organizer_name, organizer_bio, organizer_website,
               created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id, e.slug, e.title, e.summary, e.descriptionMd, e.coverImageUrl ?? null, tagsCsv,
        e.venueType, e.meetingUrl ?? null, e.locationText ?? null, null, null,
        e.startAt.toISOString(), e.endAt?.toISOString() ?? null, e.timezone,
        null, 1,
        e.organizer.handle, e.organizer.name, e.organizer.bio ?? null, e.organizer.website ?? null,
        now, now,
      ],
    })

    // Tags
    for (const tag of e.tags.map(normalizeTag)) {
      await db.execute({ sql: `INSERT OR IGNORE INTO tags (name) VALUES (?)`, args: [tag] })
      await db.execute({
        sql: `INSERT OR IGNORE INTO event_tags (event_id, tag_name) VALUES (?, ?)`,
        args: [id, tag],
      })
    }

    // Seed default RSVP questions for this event
    await seedQuestionsForEvent(id)
  }

  seeded = true
}

async function seedQuestionsForEvent(eventId: string) {
  const db = await getDb()
  const existing = await db.execute({
    sql: `SELECT COUNT(*) as c FROM rsvp_questions WHERE event_id = ?`,
    args: [eventId],
  })
  if (Number((existing.rows[0] as any).c) > 0) return

  const now = nowIso()
  const questions = buildDefaultRsvpQuestions()
  for (const q of questions) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO rsvp_questions
              (id, event_id, step, ord, key, label, field_type, required, options_json, placeholder, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        q.id, eventId, q.step, q.ord, q.key, q.label, q.fieldType,
        q.required ? 1 : 0,
        q.options ? JSON.stringify(q.options) : null,
        q.placeholder ?? null,
        now,
      ],
    })
  }
}

// ── Row mapper ────────────────────────────────────────────────────────────────

function rowToEvent(row: any): ListedEvent {
  const tagsCsv: string = row.tags_csv ?? ''
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary),
    descriptionMd: String(row.description_md),
    coverImageUrl: row.poster_url ? String(row.poster_url) : null,
    venueType: String(row.venue_type) as VenueType,
    meetingUrl: row.meeting_url ? String(row.meeting_url) : null,
    locationText: row.location_text ? String(row.location_text) : null,
    mapsEmbedUrl: row.maps_embed_url ? String(row.maps_embed_url) : null,
    mapsLinkUrl: row.maps_link_url ? String(row.maps_link_url) : null,
    startAt: String(row.start_at),
    endAt: row.end_at ? String(row.end_at) : null,
    timezone: String(row.timezone),
    capacity: row.capacity != null ? Number(row.capacity) : null,
    isPublished: row.is_published === 1 || row.is_published === true,
    organizer: {
      handle: String(row.organizer_handle),
      name: String(row.organizer_name),
      bio: row.organizer_bio ? String(row.organizer_bio) : undefined,
      website: row.organizer_website ? String(row.organizer_website) : undefined,
    },
    tagList: tagsCsv
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean),
    _count: { rsvps: Number(row.rsvp_count ?? 0) },
  }
}

// ── Public queries ─────────────────────────────────────────────────────────────

export async function listEvents(input: ListEventsInput = {}): Promise<ListedEvent[]> {
  await ensureSeeded()
  const db = await getDb()

  const take = Math.min(Math.max(input.take ?? 30, 1), 100)

  let sql = `
    SELECT e.*,
      (SELECT COUNT(*) FROM rsvp_submissions WHERE event_id = e.id) AS rsvp_count
    FROM events e
    WHERE 1=1
  `
  const args: any[] = []

  if (!input.includeUnpublished) {
    sql += ` AND e.is_published = 1`
  }
  if (input.venue) {
    sql += ` AND e.venue_type = ?`
    args.push(input.venue)
  }
  if (input.after) {
    sql += ` AND e.start_at >= ?`
    args.push(input.after.toISOString())
  }
  if (input.before) {
    sql += ` AND e.start_at <= ?`
    args.push(input.before.toISOString())
  }
  if (input.tag) {
    sql += ` AND e.id IN (SELECT event_id FROM event_tags WHERE tag_name = ?)`
    args.push(normalizeTag(input.tag))
  }
  if (input.q) {
    const q = `%${input.q.trim().toLowerCase()}%`
    sql += ` AND (LOWER(e.title) LIKE ? OR LOWER(e.summary) LIKE ? OR LOWER(e.tags_csv) LIKE ?)`
    args.push(q, q, q)
  }

  sql += ` ORDER BY e.start_at ASC LIMIT ?`
  args.push(take)

  const result = await db.execute({ sql, args })
  return result.rows.map(rowToEvent)
}

export async function getEventBySlug(slug: string): Promise<ListedEvent | null> {
  await ensureSeeded()
  const db = await getDb()

  const result = await db.execute({
    sql: `SELECT e.*,
            (SELECT COUNT(*) FROM rsvp_submissions WHERE event_id = e.id) AS rsvp_count
          FROM events e WHERE e.slug = ? AND e.is_published = 1`,
    args: [slug],
  })

  if (!result.rows.length) return null
  return rowToEvent(result.rows[0])
}

export async function getEventById(id: string): Promise<ListedEvent | null> {
  await ensureSeeded()
  const db = await getDb()

  const result = await db.execute({
    sql: `SELECT e.*,
            (SELECT COUNT(*) FROM rsvp_submissions WHERE event_id = e.id) AS rsvp_count
          FROM events e WHERE e.id = ?`,
    args: [id],
  })

  if (!result.rows.length) return null
  return rowToEvent(result.rows[0])
}

// ── RSVP form ─────────────────────────────────────────────────────────────────

export async function getRsvpFormForEvent(eventId: string) {
  await seedQuestionsForEvent(eventId)
  const db = await getDb()

  const result = await db.execute({
    sql: `SELECT * FROM rsvp_questions WHERE event_id = ? ORDER BY step, ord`,
    args: [eventId],
  })

  return result.rows.map((row: any) => ({
    id: String(row.id),
    step: String(row.step),
    ord: Number(row.ord),
    key: row.key ? String(row.key) : null,
    label: String(row.label),
    fieldType: String(row.field_type),
    required: row.required === 1 || row.required === true,
    options: row.options_json ? (JSON.parse(String(row.options_json)) as string[]) : null,
    placeholder: row.placeholder ? String(row.placeholder) : null,
  }))
}

// ── RSVP submission ───────────────────────────────────────────────────────────

function generateTicketId(): string {
  const chunk = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TV-${chunk}`
}

export async function createRsvp(input: {
  eventSlug: string
  answers: Record<string, unknown>
  structured: {
    fullName: string
    email: string
    whatsapp: string
    role: string
    org: string
    country: string
    city: string
    heardFrom: string
    hopeToLearn: string
  }
}) {
  await ensureSeeded()
  const db = await getDb()

  const event = await getEventBySlug(input.eventSlug)
  if (!event) return { ok: false as const, code: 'NOT_FOUND' as const }

  // Validate required questions
  const questions = await getRsvpFormForEvent(event.id)
  const requiredIds = new Set(questions.filter((q) => q.required).map((q) => q.id))
  for (const qid of requiredIds) {
    if (input.answers[qid] == null || String(input.answers[qid]).trim() === '') {
      return { ok: false as const, code: 'INVALID' as const }
    }
  }

  // Duplicate email check
  const emailLower = input.structured.email.trim().toLowerCase()
  const dup = await db.execute({
    sql: `SELECT id FROM rsvp_submissions WHERE event_id = ? AND LOWER(email) = ?`,
    args: [event.id, emailLower],
  })
  if (dup.rows.length) return { ok: false as const, code: 'ALREADY_REGISTERED' as const }

  // Generate unique ticket ID
  let ticketId = generateTicketId()
  for (let i = 0; i < 5; i++) {
    const collision = await db.execute({
      sql: `SELECT id FROM rsvp_submissions WHERE ticket_id = ?`,
      args: [ticketId],
    })
    if (!collision.rows.length) break
    ticketId = generateTicketId()
  }

  const submissionId = randomUUID()
  const createdAt = nowIso()

  await db.execute({
    sql: `INSERT INTO rsvp_submissions
            (id, event_id, ticket_id, created_at,
             full_name, email, whatsapp, role, org, country, city, heard_from, hope_to_learn)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      submissionId, event.id, ticketId, createdAt,
      input.structured.fullName.trim(),
      emailLower,
      input.structured.whatsapp.trim(),
      input.structured.role.trim(),
      input.structured.org.trim(),
      input.structured.country.trim(),
      input.structured.city.trim(),
      input.structured.heardFrom.trim(),
      input.structured.hopeToLearn.trim(),
    ],
  })

  // Store per-question answers
  for (const [qid, val] of Object.entries(input.answers)) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO rsvp_answers (submission_id, question_id, value) VALUES (?, ?, ?)`,
      args: [submissionId, qid, val == null ? '' : String(val)],
    }).catch(() => null) // question_id FK may not exist for unknown keys — ignore
  }

  return { ok: true as const, ticketId, createdAt }
}

// ── Admin CRUD ─────────────────────────────────────────────────────────────────

export async function createEvent(input: CreateEventInput): Promise<{ id: string; slug: string }> {
  await ensureSeeded()
  const db = await getDb()

  const id = randomUUID()
  const now = nowIso()
  const tagsCsv = input.tags.map(normalizeTag).join(',')

  await db.execute({
    sql: `INSERT OR IGNORE INTO organizers (handle, name, bio, website, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [input.organizerHandle, input.organizerName, input.organizerBio ?? null, input.organizerWebsite ?? null, now, now],
  })

  await db.execute({
    sql: `INSERT INTO events
            (id, slug, title, summary, description_md, poster_url, tags_csv,
             venue_type, meeting_url, location_text, maps_embed_url, maps_link_url,
             start_at, end_at, timezone, capacity, is_published,
             organizer_handle, organizer_name, organizer_bio, organizer_website,
             created_at, updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      id, input.slug ?? slugify(input.title), input.title, input.summary, input.descriptionMd,
      input.coverImageUrl ?? null, tagsCsv,
      input.venueType, input.meetingUrl ?? null, input.locationText ?? null,
      input.mapsEmbedUrl ?? null, input.mapsLinkUrl ?? null,
      input.startAt, input.endAt ?? null, input.timezone,
      input.capacity ?? null, input.isPublished ? 1 : 0,
      input.organizerHandle, input.organizerName, input.organizerBio ?? null, input.organizerWebsite ?? null,
      now, now,
    ],
  })

  // Tags
  for (const tag of input.tags.map(normalizeTag)) {
    await db.execute({ sql: `INSERT OR IGNORE INTO tags (name) VALUES (?)`, args: [tag] })
    await db.execute({
      sql: `INSERT OR IGNORE INTO event_tags (event_id, tag_name) VALUES (?, ?)`,
      args: [id, tag],
    })
  }

  // Seed default RSVP questions
  await seedQuestionsForEvent(id)

  return { id, slug: input.slug ?? slugify(input.title) }
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<boolean> {
  const db = await getDb()
  const now = nowIso()

  const fields: string[] = []
  const args: any[] = []

  if (input.title !== undefined) { fields.push('title = ?'); args.push(input.title) }
  if (input.summary !== undefined) { fields.push('summary = ?'); args.push(input.summary) }
  if (input.descriptionMd !== undefined) { fields.push('description_md = ?'); args.push(input.descriptionMd) }
  if (input.coverImageUrl !== undefined) { fields.push('poster_url = ?'); args.push(input.coverImageUrl) }
  if (input.venueType !== undefined) { fields.push('venue_type = ?'); args.push(input.venueType) }
  if (input.meetingUrl !== undefined) { fields.push('meeting_url = ?'); args.push(input.meetingUrl) }
  if (input.locationText !== undefined) { fields.push('location_text = ?'); args.push(input.locationText) }
  if (input.mapsEmbedUrl !== undefined) { fields.push('maps_embed_url = ?'); args.push(input.mapsEmbedUrl) }
  if (input.mapsLinkUrl !== undefined) { fields.push('maps_link_url = ?'); args.push(input.mapsLinkUrl) }
  if (input.startAt !== undefined) { fields.push('start_at = ?'); args.push(input.startAt) }
  if (input.endAt !== undefined) { fields.push('end_at = ?'); args.push(input.endAt) }
  if (input.timezone !== undefined) { fields.push('timezone = ?'); args.push(input.timezone) }
  if (input.capacity !== undefined) { fields.push('capacity = ?'); args.push(input.capacity) }
  if (input.isPublished !== undefined) { fields.push('is_published = ?'); args.push(input.isPublished ? 1 : 0) }
  if (input.organizerName !== undefined) { fields.push('organizer_name = ?'); args.push(input.organizerName) }
  if (input.organizerBio !== undefined) { fields.push('organizer_bio = ?'); args.push(input.organizerBio) }
  if (input.organizerWebsite !== undefined) { fields.push('organizer_website = ?'); args.push(input.organizerWebsite) }

  if (input.tags !== undefined) {
    const tagsCsv = input.tags.map(normalizeTag).join(',')
    fields.push('tags_csv = ?')
    args.push(tagsCsv)

    await db.execute({ sql: `DELETE FROM event_tags WHERE event_id = ?`, args: [id] })
    for (const tag of input.tags.map(normalizeTag)) {
      await db.execute({ sql: `INSERT OR IGNORE INTO tags (name) VALUES (?)`, args: [tag] })
      await db.execute({
        sql: `INSERT OR IGNORE INTO event_tags (event_id, tag_name) VALUES (?, ?)`,
        args: [id, tag],
      })
    }
  }

  if (!fields.length) return true

  fields.push('updated_at = ?')
  args.push(now, id)

  const result = await db.execute({
    sql: `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
    args,
  })

  return (result.rowsAffected ?? 0) > 0
}

export async function deleteEvent(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.execute({ sql: `DELETE FROM events WHERE id = ?`, args: [id] })
  return (result.rowsAffected ?? 0) > 0
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

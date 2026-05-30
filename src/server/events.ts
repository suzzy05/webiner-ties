import { randomUUID } from 'node:crypto'
import { getDb } from './db'
import { mockEvents } from '@/data/mockEvents'
import type { VenueType } from '@/data/mockEvents'
import { buildDefaultRsvpQuestions } from './defaultRsvpForm'
import { createRsvpSubmission } from './rsvps'

function nowIso() {
  return new Date().toISOString()
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase()
}

function labelToKey(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_+|_+$)+/g, '')
}

// Shared SELECT columns for all event queries (avoids e.* / JOIN column conflicts).
const EVENT_SELECT = `
  e.id,
  e.slug,
  e.title,
  e.summary,
  e.description_md,
  e.poster_url,
  e.venue_type,
  e.meeting_url,
  e.location_text,
  e.maps_embed_url,
  e.maps_link_url,
  e.start_at,
  e.end_at,
  e.timezone,
  e.capacity,
  e.is_published,
  e.organizer_handle,
  e.created_at,
  e.updated_at,
  COALESCE(o.name,    e.organizer_name)    AS organizer_name,
  COALESCE(o.bio,     e.organizer_bio)     AS organizer_bio,
  COALESCE(o.website, e.organizer_website) AS organizer_website,
  GROUP_CONCAT(et.tag_name)                AS tag_list,
  (SELECT COUNT(*) FROM rsvp_submissions s WHERE s.event_id = e.id) AS rsvps
`

const EVENT_JOINS = `
  LEFT JOIN organizers o  ON o.handle   = e.organizer_handle
  LEFT JOIN event_tags et ON et.event_id = e.id
`

let seedPromise: Promise<void> | null = null

async function ensureSeeded() {
  if (seedPromise) return seedPromise
  seedPromise = (async () => {
    const db = await getDb()
    const count = await db.execute('SELECT COUNT(*) as n FROM events')
    const n = Number((count.rows[0] as any)?.n ?? 0)
    if (n > 0) return

    for (const e of mockEvents) {
      if (!e.published) continue
      const id = randomUUID()
      const createdAt = nowIso()
      const tagsCsv = e.tags.map(normalizeTag).filter(Boolean).join(',')

      // Upsert organizer.
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO organizers (handle, name, bio, website, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          e.organizer.handle,
          e.organizer.name,
          e.organizer.bio ?? null,
          e.organizer.website ?? null,
          createdAt,
          createdAt,
        ],
      })

      // Insert event.
      await db.execute({
        sql: `
          INSERT INTO events (
            id, slug, title, summary, description_md, poster_url, tags_csv,
            venue_type, meeting_url, location_text, maps_embed_url, maps_link_url,
            start_at, end_at, timezone, capacity, is_published,
            organizer_handle, organizer_name, organizer_bio, organizer_website,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          e.slug,
          e.title,
          e.summary,
          e.descriptionMd,
          e.coverImageUrl ?? null,
          tagsCsv,
          e.venueType,
          e.meetingUrl ?? null,
          e.locationText ?? null,
          null,
          null,
          e.startAt.toISOString(),
          e.endAt ? e.endAt.toISOString() : null,
          e.timezone,
          null,
          e.published ? 1 : 0,
          e.organizer.handle,
          e.organizer.name,
          e.organizer.bio ?? null,
          e.organizer.website ?? null,
          createdAt,
          createdAt,
        ],
      })

      // Insert tags.
      for (const tagName of tagsCsv.split(',').filter(Boolean)) {
        await db.execute({ sql: `INSERT OR IGNORE INTO tags (name) VALUES (?)`, args: [tagName] })
        await db.execute({
          sql: `INSERT OR IGNORE INTO event_tags (event_id, tag_name) VALUES (?, ?)`,
          args: [id, tagName],
        })
      }

      // Insert tickets.
      for (let i = 0; i < e.tickets.length; i++) {
        const t = e.tickets[i]!
        await db.execute({
          sql: `
            INSERT INTO tickets (id, event_id, name, description, price_in_paise, quantity, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [t.id, id, t.name, t.description ?? null, t.priceInPaise, null, i, createdAt],
        })
      }

      await insertDefaultQuestions(id)
    }
  })().catch((err) => {
    seedPromise = null
    throw err
  })

  return seedPromise
}

async function insertDefaultQuestions(eventId: string) {
  const db = await getDb()
  const existing = await db.execute({
    sql: 'SELECT COUNT(*) as n FROM rsvp_questions WHERE event_id = ?',
    args: [eventId],
  })
  const n = Number((existing.rows[0] as any)?.n ?? 0)
  if (n > 0) return

  const createdAt = nowIso()
  const questions = buildDefaultRsvpQuestions()
  for (const q of questions) {
    await db.execute({
      sql: `
        INSERT INTO rsvp_questions (id, event_id, step, ord, key, label, field_type, required, options_json, placeholder, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        q.id,
        eventId,
        q.step,
        q.ord,
        q.key,
        q.label,
        q.fieldType,
        q.required ? 1 : 0,
        q.options ? JSON.stringify(q.options) : null,
        q.placeholder ?? null,
        createdAt,
      ],
    })
  }
}

function rowToEvent(row: any) {
  const tagList = row.tag_list
    ? String(row.tag_list)
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean)
    : []
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary),
    descriptionMd: String(row.description_md),
    coverImageUrl: row.poster_url ? String(row.poster_url) : null,
    tagList,
    startAt: new Date(String(row.start_at)),
    endAt: row.end_at ? new Date(String(row.end_at)) : null,
    timezone: String(row.timezone),
    venueType: row.venue_type as VenueType,
    meetingUrl: row.meeting_url ? String(row.meeting_url) : null,
    locationText: row.location_text ? String(row.location_text) : null,
    mapsEmbedUrl: row.maps_embed_url ? String(row.maps_embed_url) : null,
    mapsLinkUrl: row.maps_link_url ? String(row.maps_link_url) : null,
    capacity: row.capacity != null ? Number(row.capacity) : null,
    isPublished: Number(row.is_published ?? 1) === 1,
    organizer: {
      handle: String(row.organizer_handle),
      name: String(row.organizer_name ?? ''),
      bio: row.organizer_bio ? String(row.organizer_bio) : null,
      website: row.organizer_website ? String(row.organizer_website) : null,
    },
    _count: { rsvps: Number(row.rsvps ?? 0) || 0 },
  }
}

export type ListedEvent = Awaited<ReturnType<typeof listEvents>>[number]

export type ListEventsInput = {
  q?: string
  tag?: string
  venue?: VenueType
  after?: Date
  before?: Date
  take?: number
}

export async function listEvents(input: ListEventsInput = {}) {
  await ensureSeeded()
  const db = await getDb()

  const take = Math.min(Math.max(input.take ?? 30, 1), 100)
  const q = input.q?.trim().toLowerCase()
  const tag = input.tag ? normalizeTag(input.tag) : undefined

  const where: string[] = []
  const args: any[] = []

  if (input.venue) {
    where.push('e.venue_type = ?')
    args.push(input.venue)
  }
  if (input.after) {
    where.push('e.start_at >= ?')
    args.push(input.after.toISOString())
  }
  if (input.before) {
    where.push('e.start_at <= ?')
    args.push(input.before.toISOString())
  }
  if (q) {
    where.push(
      `(LOWER(e.title) LIKE ? OR LOWER(e.summary) LIKE ? OR LOWER(COALESCE(e.location_text,'')) LIKE ? OR LOWER(e.tags_csv) LIKE ?)`,
    )
    const like = `%${q}%`
    args.push(like, like, like, like)
  }
  if (tag) {
    // Use event_tags for accurate tag matching instead of LIKE on CSV.
    where.push(
      `EXISTS (SELECT 1 FROM event_tags _et WHERE _et.event_id = e.id AND _et.tag_name = ?)`,
    )
    args.push(tag)
  }

  const sql = `
    SELECT ${EVENT_SELECT}
    FROM events e
    ${EVENT_JOINS}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY e.id
    ORDER BY e.start_at ASC
    LIMIT ?
  `

  const rs = await db.execute({ sql, args: [...args, take] })
  return rs.rows.map((r) => rowToEvent(r as any))
}

export async function getEventBySlug(slug: string) {
  await ensureSeeded()
  const db = await getDb()

  const rs = await db.execute({
    sql: `
      SELECT ${EVENT_SELECT}
      FROM events e
      ${EVENT_JOINS}
      WHERE e.slug = ?
      GROUP BY e.id
      LIMIT 1
    `,
    args: [slug],
  })

  const row = rs.rows[0]
  if (!row) return null
  return rowToEvent(row as any)
}

export async function getTicketsForEvent(eventId: string) {
  await ensureSeeded()
  const db = await getDb()
  const rs = await db.execute({
    sql: `
      SELECT id, name, description, price_in_paise, quantity, sort_order
      FROM tickets
      WHERE event_id = ?
      ORDER BY sort_order ASC
    `,
    args: [eventId],
  })
  return rs.rows.map((r: any) => ({
    id: String(r.id),
    name: String(r.name),
    description: r.description ? String(r.description) : null,
    priceInPaise: Number(r.price_in_paise ?? 0),
    quantity: r.quantity != null ? Number(r.quantity) : null,
    sortOrder: Number(r.sort_order ?? 0),
  }))
}

export async function getRsvpFormForEvent(eventId: string) {
  await ensureSeeded()
  const db = await getDb()
  const rs = await db.execute({
    sql: `
      SELECT id, step, ord, key, label, field_type, required, options_json, placeholder
      FROM rsvp_questions
      WHERE event_id = ?
      ORDER BY step ASC, ord ASC
    `,
    args: [eventId],
  })

  return rs.rows.map((r: any) => ({
    id: String(r.id),
    step: String(r.step),
    ord: Number(r.ord ?? 0),
    key: r.key ? String(r.key) : null,
    label: String(r.label),
    fieldType: String(r.field_type),
    required: Number(r.required ?? 1) === 1,
    options: r.options_json ? (JSON.parse(String(r.options_json)) as string[]) : undefined,
    placeholder: r.placeholder ? String(r.placeholder) : undefined,
  }))
}

export async function addRsvpQuestionToEvent(
  eventId: string,
  input: {
    step: 'personal' | 'professional' | 'final'
    ord: number
    label: string
    fieldType: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea'
    required: boolean
    options?: string[]
    placeholder?: string
    key?: string | null
  },
) {
  await ensureSeeded()
  const db = await getDb()
  const createdAt = nowIso()
  const id = randomUUID()
  const key = input.key ?? labelToKey(input.label)

  await db.execute({
    sql: `
      INSERT INTO rsvp_questions (id, event_id, step, ord, key, label, field_type, required, options_json, placeholder, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      eventId,
      input.step,
      input.ord,
      key,
      input.label,
      input.fieldType,
      input.required ? 1 : 0,
      input.options ? JSON.stringify(input.options) : null,
      input.placeholder ?? null,
      createdAt,
    ],
  })

  return { id }
}

export async function createEvent(input: {
  title: string
  summary: string
  descriptionMd: string
  posterUrl?: string | null
  tags: string[]
  venueType: VenueType
  meetingUrl?: string | null
  locationText?: string | null
  mapsEmbedUrl?: string | null
  mapsLinkUrl?: string | null
  startAt: Date
  endAt?: Date | null
  timezone: string
  capacity?: number | null
  organizer?: {
    handle: string
    name: string
    bio?: string | null
    website?: string | null
  }
}) {
  await ensureSeeded()
  const db = await getDb()

  const id = randomUUID()
  const createdAt = nowIso()

  const base = input.title
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
  const slug = `${base}-${id.slice(0, 6)}`
  const tagsCsv = input.tags.map(normalizeTag).filter(Boolean).join(',')

  const org = input.organizer ?? {
    handle: 'tiesverse',
    name: 'Tiesverse',
    bio: 'Webinars, meetups, and live learning for the Tiesverse community.',
    website: 'https://tiesverse.com',
  }

  // Upsert organizer.
  await db.execute({
    sql: `
      INSERT OR IGNORE INTO organizers (handle, name, bio, website, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [org.handle, org.name, org.bio ?? null, org.website ?? null, createdAt, createdAt],
  })

  await db.execute({
    sql: `
      INSERT INTO events (
        id, slug, title, summary, description_md, poster_url, tags_csv,
        venue_type, meeting_url, location_text, maps_embed_url, maps_link_url,
        start_at, end_at, timezone, capacity, is_published,
        organizer_handle, organizer_name, organizer_bio, organizer_website,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      slug,
      input.title,
      input.summary,
      input.descriptionMd,
      input.posterUrl ?? null,
      tagsCsv,
      input.venueType,
      input.meetingUrl ?? null,
      input.locationText ?? null,
      input.mapsEmbedUrl ?? null,
      input.mapsLinkUrl ?? null,
      input.startAt.toISOString(),
      input.endAt ? input.endAt.toISOString() : null,
      input.timezone,
      input.capacity ?? null,
      1,
      org.handle,
      org.name,
      org.bio ?? null,
      org.website ?? null,
      createdAt,
      createdAt,
    ],
  })

  // Insert tags.
  for (const tagName of tagsCsv.split(',').filter(Boolean)) {
    await db.execute({ sql: `INSERT OR IGNORE INTO tags (name) VALUES (?)`, args: [tagName] })
    await db.execute({
      sql: `INSERT OR IGNORE INTO event_tags (event_id, tag_name) VALUES (?, ?)`,
      args: [id, tagName],
    })
  }

  await insertDefaultQuestions(id)

  return { id, slug }
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
  const event = await getEventBySlug(input.eventSlug)
  if (!event) return { ok: false as const, code: 'NOT_FOUND' as const }

  const db = await getDb()
  const existing = await db.execute({
    sql: 'SELECT 1 FROM rsvp_submissions WHERE event_id = ? AND LOWER(email) = LOWER(?) LIMIT 1',
    args: [event.id, input.structured.email.trim()],
  })
  if ((existing.rows?.length ?? 0) > 0) {
    return { ok: false as const, code: 'ALREADY_REGISTERED' as const }
  }

  const questions = await getRsvpFormForEvent(event.id)
  const requiredIds = new Set(questions.filter((q) => q.required).map((q) => q.id))
  for (const qid of requiredIds) {
    if (input.answers[qid] == null || String(input.answers[qid]).trim() === '') {
      return { ok: false as const, code: 'INVALID' as const }
    }
  }

  const submission = await createRsvpSubmission({
    eventId: event.id,
    answers: input.answers,
    structured: input.structured,
  })

  return { ok: true as const, ticketId: submission.ticketId, createdAt: submission.createdAt }
}

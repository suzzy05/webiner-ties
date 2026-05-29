import { randomUUID } from 'node:crypto'
import { getDb } from './db'
import { mockEvents } from '@/data/mockEvents'
import type { VenueType } from '@/data/mockEvents'
import { buildDefaultRsvpQuestions } from './defaultRsvpForm'
import { getRsvpCount, createRsvpSubmission } from './rsvps'

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
      const updatedAt = createdAt

      await db.execute({
        sql: `
          INSERT INTO events (
            id,
            slug,
            title,
            summary,
            description_md,
            poster_url,
            tags_csv,
            venue_type,
            meeting_url,
            location_text,
            maps_embed_url,
            maps_link_url,
            start_at,
            end_at,
            timezone,
            organizer_handle,
            organizer_name,
            organizer_bio,
            organizer_website,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          e.slug,
          e.title,
          e.summary,
          e.descriptionMd,
          e.coverImageUrl ?? null,
          e.tags.join(','),
          e.venueType,
          e.meetingUrl ?? null,
          e.locationText ?? null,
          null,
          null,
          e.startAt.toISOString(),
          e.endAt ? e.endAt.toISOString() : null,
          e.timezone,
          e.organizer.handle,
          e.organizer.name,
          e.organizer.bio ?? null,
          e.organizer.website ?? null,
          createdAt,
          updatedAt,
        ],
      })

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
        INSERT INTO rsvp_questions (
          id,
          event_id,
          step,
          ord,
          key,
          label,
          field_type,
          required,
          options_json,
          placeholder,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

export type ListEventsInput = {
  q?: string
  tag?: string
  venue?: VenueType
  after?: Date
  before?: Date
  take?: number
}

export type ListedEvent = Awaited<ReturnType<typeof listEvents>>[number]

function rowToEvent(row: any) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary),
    descriptionMd: String(row.description_md),
    coverImageUrl: row.poster_url ? String(row.poster_url) : null,
    tags: String(row.tags_csv ?? ''),
    tagList: String(row.tags_csv ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    startAt: new Date(String(row.start_at)),
    endAt: row.end_at ? new Date(String(row.end_at)) : null,
    timezone: String(row.timezone),
    venueType: row.venue_type as VenueType,
    meetingUrl: row.meeting_url ? String(row.meeting_url) : null,
    locationText: row.location_text ? String(row.location_text) : null,
    mapsEmbedUrl: row.maps_embed_url ? String(row.maps_embed_url) : null,
    mapsLinkUrl: row.maps_link_url ? String(row.maps_link_url) : null,
    organizer: {
      handle: String(row.organizer_handle),
      name: String(row.organizer_name),
      bio: row.organizer_bio ? String(row.organizer_bio) : null,
      website: row.organizer_website ? String(row.organizer_website) : null,
    },
    _count: { rsvps: Number(row.rsvps ?? 0) || 0 },
  }
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
      '(LOWER(e.title) LIKE ? OR LOWER(e.summary) LIKE ? OR LOWER(e.tags_csv) LIKE ? OR LOWER(COALESCE(e.location_text, \'\')) LIKE ?)',
    )
    const like = `%${q}%`
    args.push(like, like, like, like)
  }
  if (tag) {
    where.push('LOWER(e.tags_csv) LIKE ?')
    args.push(`%${tag}%`)
  }

  const sql = `
    SELECT
      e.*,
      (SELECT COUNT(*) FROM rsvp_submissions s WHERE s.event_id = e.id) as rsvps
    FROM events e
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
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
      SELECT
        e.*,
        (SELECT COUNT(*) FROM rsvp_submissions s WHERE s.event_id = e.id) as rsvps
      FROM events e
      WHERE e.slug = ?
      LIMIT 1
    `,
    args: [slug],
  })

  const row = rs.rows[0]
  if (!row) return null
  return rowToEvent(row as any)
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
      INSERT INTO rsvp_questions (
        id, event_id, step, ord, key, label, field_type, required, options_json, placeholder, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
}) {
  await ensureSeeded()
  const db = await getDb()

  const id = randomUUID()
  const createdAt = nowIso()
  const updatedAt = createdAt

  // Slug: use a deterministic base + suffix to avoid collisions.
  const base = input.title
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  const slug = `${base}-${id.slice(0, 6)}`
  const tagsCsv = input.tags.map(normalizeTag).filter(Boolean).join(',')

  await db.execute({
    sql: `
      INSERT INTO events (
        id,
        slug,
        title,
        summary,
        description_md,
        poster_url,
        tags_csv,
        venue_type,
        meeting_url,
        location_text,
        maps_embed_url,
        maps_link_url,
        start_at,
        end_at,
        timezone,
        organizer_handle,
        organizer_name,
        organizer_bio,
        organizer_website,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      'tiesverse',
      'Tiesverse',
      'Webinars, meetups, and live learning for the Tiesverse community.',
      'https://tiesverse.com',
      createdAt,
      updatedAt,
    ],
  })

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

  // Very small validation: prevent duplicate email per event.
  const db = await getDb()
  const existing = await db.execute({
    sql: 'SELECT 1 FROM rsvp_submissions WHERE event_id = ? AND LOWER(email) = LOWER(?) LIMIT 1',
    args: [event.id, input.structured.email.trim()],
  })
  if ((existing.rows?.length ?? 0) > 0) {
    return { ok: false as const, code: 'ALREADY_REGISTERED' as const }
  }

  const questions = await getRsvpFormForEvent(event.id)
  const requiredIds = new Set(
    questions.filter((q) => q.required).map((q) => q.id),
  )
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

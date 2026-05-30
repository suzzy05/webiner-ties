import { randomUUID } from 'node:crypto'
import type { VenueType } from '@/data/mockEvents'
import { buildDefaultRsvpQuestions } from './defaultRsvpForm'
import {
  createStoreRsvp,
  ensureSeededJsonStore,
  getStoreEventBySlug,
  listStoreEvents,
  listStoreRsvpsForEvent,
} from './jsonStore'

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase()
}

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
  organizer: {
    handle: string
    name: string
    bio?: string
    website?: string
  }
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
}

export async function listEvents(input: ListEventsInput = {}) {
  await ensureSeededJsonStore()

  const take = Math.min(Math.max(input.take ?? 30, 1), 100)
  const q = input.q?.trim().toLowerCase()
  const tag = input.tag ? normalizeTag(input.tag) : undefined

  const all = await listStoreEvents()

  const filtered = all
    .filter((e) => e.isPublished)
    .filter((e) => (input.venue ? e.venueType === input.venue : true))
    .filter((e) => (input.after ? new Date(e.startAt).getTime() >= input.after.getTime() : true))
    .filter((e) => (input.before ? new Date(e.startAt).getTime() <= input.before.getTime() : true))
    .filter((e) => {
      if (!q) return true
      const hay = `${e.title} ${e.summary} ${e.locationText ?? ''} ${e.tagList.join(',')}`.toLowerCase()
      return hay.includes(q)
    })
    .filter((e) => {
      if (!tag) return true
      return e.tagList.map(normalizeTag).includes(tag)
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  const slice = filtered.slice(0, take)

  const withCounts: ListedEvent[] = []
  for (const e of slice) {
    const rsvps = await listStoreRsvpsForEvent(e.id)
    withCounts.push({
      id: e.id,
      slug: e.slug,
      title: e.title,
      summary: e.summary,
      descriptionMd: e.descriptionMd,
      coverImageUrl: e.coverImageUrl,
      venueType: e.venueType,
      meetingUrl: e.meetingUrl,
      locationText: e.locationText,
      mapsEmbedUrl: e.mapsEmbedUrl,
      mapsLinkUrl: e.mapsLinkUrl,
      startAt: e.startAt,
      endAt: e.endAt,
      timezone: e.timezone,
      capacity: e.capacity,
      organizer: e.organizer,
      tagList: e.tagList,
      _count: { rsvps: rsvps.length },
    })
  }

  return withCounts
}

export async function getEventBySlug(slug: string) {
  await ensureSeededJsonStore()
  const e = await getStoreEventBySlug(slug)
  if (!e || !e.isPublished) return null
  const rsvps = await listStoreRsvpsForEvent(e.id)
  const event: ListedEvent = {
    id: e.id,
    slug: e.slug,
    title: e.title,
    summary: e.summary,
    descriptionMd: e.descriptionMd,
    coverImageUrl: e.coverImageUrl,
    venueType: e.venueType,
    meetingUrl: e.meetingUrl,
    locationText: e.locationText,
    mapsEmbedUrl: e.mapsEmbedUrl,
    mapsLinkUrl: e.mapsLinkUrl,
    startAt: e.startAt,
    endAt: e.endAt,
    timezone: e.timezone,
    capacity: e.capacity,
    organizer: e.organizer,
    tagList: e.tagList,
    _count: { rsvps: rsvps.length },
  }
  return event
}

export async function getRsvpFormForEvent(_eventId: string) {
  const defaults = buildDefaultRsvpQuestions()
  return defaults.map((q) => ({
    id: q.id,
    step: q.step,
    ord: q.ord,
    key: q.key,
    label: q.label,
    fieldType: q.fieldType,
    required: q.required,
    options: q.options ?? null,
    placeholder: q.placeholder ?? null,
  }))
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

  const questions = await getRsvpFormForEvent(event.id)
  const requiredIds = new Set(questions.filter((q) => q.required).map((q) => q.id))
  for (const qid of requiredIds) {
    if (input.answers[qid] == null || String(input.answers[qid]).trim() === '') {
      return { ok: false as const, code: 'INVALID' as const }
    }
  }

  const result = await createStoreRsvp({
    eventId: event.id,
    structured: input.structured,
    answers: input.answers,
  })

  if (result.ok) return { ok: true as const, ticketId: result.ticketId, createdAt: result.createdAt }
  return { ok: false as const, code: 'ALREADY_REGISTERED' as const }
}

export async function createEvent(_input: any) {
  // No admin surface: keep API out of scope for now.
  return { id: randomUUID(), slug: 'new-event' }
}


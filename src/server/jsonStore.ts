import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { mockEvents, type VenueType } from '@/data/mockEvents'
import type { Organizer } from '@/data/mockEvents'

type StoreEvent = {
  id: string
  slug: string
  title: string
  summary: string
  descriptionMd: string
  coverImageUrl: string | null
  tagList: string[]
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
  organizer: Organizer
  createdAt: string
  updatedAt: string
}

type StoreRsvp = {
  id: string
  eventId: string
  ticketId: string
  createdAt: string
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
  answers: Record<string, string>
}

type Store = {
  version: 1
  events: StoreEvent[]
  rsvps: StoreRsvp[]
}

const STORE_PATH = '.data/store.json'

function nowIso() {
  return new Date().toISOString()
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase()
}

function ticketId() {
  const chunk = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TV-${chunk}`
}

async function ensureDir() {
  await mkdir('.data', { recursive: true }).catch(() => null)
}

async function readStore(): Promise<Store> {
  await ensureDir()
  const raw = await readFile(STORE_PATH, 'utf-8').catch(() => '')
  if (!raw.trim()) return { version: 1, events: [], rsvps: [] }
  try {
    const parsed = JSON.parse(raw) as Store
    if (parsed?.version !== 1) return { version: 1, events: [], rsvps: [] }
    return {
      version: 1,
      events: Array.isArray(parsed.events) ? parsed.events : [],
      rsvps: Array.isArray(parsed.rsvps) ? parsed.rsvps : [],
    }
  } catch {
    return { version: 1, events: [], rsvps: [] }
  }
}

async function writeStore(store: Store) {
  await ensureDir()
  const json = JSON.stringify(store, null, 2)
  await writeFile(STORE_PATH, json, 'utf-8')
}

let cached: Store | null = null
let loadPromise: Promise<Store> | null = null

async function loadStore(): Promise<Store> {
  if (cached) return cached
  if (!loadPromise) {
    loadPromise = (async () => {
      const store = await readStore()
      cached = store
      return store
    })().finally(() => {
      loadPromise = null
    })
  }
  return loadPromise
}

async function persist() {
  if (!cached) return
  await writeStore(cached)
}

export async function ensureSeededJsonStore() {
  const store = await loadStore()
  if (store.events.length) return

  const createdAt = nowIso()
  const seeded: StoreEvent[] = mockEvents
    .filter((e) => e.published)
    .map((e) => ({
      id: randomUUID(),
      slug: e.slug,
      title: e.title,
      summary: e.summary,
      descriptionMd: e.descriptionMd,
      coverImageUrl: e.coverImageUrl ?? null,
      tagList: e.tags.map(normalizeTag).filter(Boolean),
      venueType: e.venueType,
      meetingUrl: e.meetingUrl ?? null,
      locationText: e.locationText ?? null,
      mapsEmbedUrl: null,
      mapsLinkUrl: null,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt ? e.endAt.toISOString() : null,
      timezone: e.timezone,
      capacity: null,
      isPublished: true,
      organizer: e.organizer,
      createdAt,
      updatedAt: createdAt,
    }))

  store.events = seeded
  await persist()
}

export async function listStoreEvents() {
  await ensureSeededJsonStore()
  const store = await loadStore()
  return store.events.slice()
}

export async function getStoreEventBySlug(slug: string) {
  await ensureSeededJsonStore()
  const store = await loadStore()
  return store.events.find((e) => e.slug === slug) ?? null
}

export async function listStoreRsvpsForEvent(eventId: string) {
  const store = await loadStore()
  return store.rsvps.filter((r) => r.eventId === eventId).slice()
}

export async function createStoreRsvp(input: {
  eventId: string
  structured: StoreRsvp['structured']
  answers: Record<string, unknown>
}) {
  const store = await loadStore()

  const email = input.structured.email.trim().toLowerCase()
  const exists = store.rsvps.some(
    (r) => r.eventId === input.eventId && r.structured.email.trim().toLowerCase() === email,
  )
  if (exists) return { ok: false as const, code: 'ALREADY_REGISTERED' as const }

  let tid = ticketId()
  for (let i = 0; i < 3; i++) {
    const collision = store.rsvps.some((r) => r.ticketId === tid)
    if (!collision) break
    tid = ticketId()
  }

  const createdAt = nowIso()
  const submission: StoreRsvp = {
    id: randomUUID(),
    eventId: input.eventId,
    ticketId: tid,
    createdAt,
    structured: input.structured,
    answers: Object.fromEntries(
      Object.entries(input.answers ?? {}).map(([k, v]) => [k, v == null ? '' : String(v)]),
    ),
  }

  store.rsvps.unshift(submission)
  await persist()
  return { ok: true as const, ticketId: tid, createdAt }
}


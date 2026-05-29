import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthed } from '@/server/adminAuth'
import { createEvent, listEvents } from '@/server/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const schema = z.object({
  title: z.string().min(3).max(140),
  summary: z.string().min(3).max(280),
  descriptionMd: z.string().min(1).max(20_000),
  posterUrl: z.string().url().optional().nullable(),
  tagsCsv: z.string().optional().default(''),
  venueType: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
  meetingUrl: z.string().url().optional().nullable(),
  locationText: z.string().optional().nullable(),
  mapsEmbedUrl: z.string().url().optional().nullable(),
  mapsLinkUrl: z.string().url().optional().nullable(),
  startAt: z.string().min(1),
  endAt: z.string().optional().nullable(),
  timezone: z.string().min(1).default('Asia/Kolkata'),
})

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const events = await listEvents({ take: 200 })
  return NextResponse.json({ events })
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const tags = parsed.data.tagsCsv
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const startAt = new Date(parsed.data.startAt)
  if (Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ error: 'Invalid startAt' }, { status: 400 })
  }
  const endAt = parsed.data.endAt ? new Date(parsed.data.endAt) : null
  if (parsed.data.endAt && endAt && Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: 'Invalid endAt' }, { status: 400 })
  }

  const created = await createEvent({
    title: parsed.data.title,
    summary: parsed.data.summary,
    descriptionMd: parsed.data.descriptionMd,
    posterUrl: parsed.data.posterUrl ?? null,
    tags,
    venueType: parsed.data.venueType,
    meetingUrl: parsed.data.meetingUrl ?? null,
    locationText: parsed.data.locationText ?? null,
    mapsEmbedUrl: parsed.data.mapsEmbedUrl ?? null,
    mapsLinkUrl: parsed.data.mapsLinkUrl ?? null,
    startAt,
    endAt: endAt ?? null,
    timezone: parsed.data.timezone,
  })

  return NextResponse.json({ ok: true, event: created }, { status: 201 })
}

import { z } from 'zod'
import { getEventById, updateEvent, deleteEvent } from '@/server/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const event = await getEventById(id)
  if (!event) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ event })
}

const urlOrNull = z.string().nullable().optional()

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  summary: z.string().min(3).max(500).optional(),
  descriptionMd: z.string().optional(),
  coverImageUrl: urlOrNull,
  tags: z.array(z.string()).optional(),
  venueType: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']).optional(),
  meetingUrl: urlOrNull,
  locationText: z.string().nullable().optional(),
  startAt: z.string().min(1).optional(),
  endAt: z.string().nullable().optional(),
  timezone: z.string().min(1).optional(),
  capacity: z.number().int().positive().nullable().optional(),
  isPublished: z.boolean().optional(),
  organizerName: z.string().min(1).max(120).optional(),
  organizerBio: z.string().nullable().optional(),
  organizerWebsite: urlOrNull,
})

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation error', issues: parsed.error.issues }, { status: 400 })
  }

  const ok = await updateEvent(id, parsed.data)
  if (!ok) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ ok: true })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const ok = await deleteEvent(id)
  if (!ok) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ ok: true })
}

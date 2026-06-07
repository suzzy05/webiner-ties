import { z } from 'zod'
import { listAllEventsAdmin } from '@/server/admin'
import { createEvent } from '@/server/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const events = await listAllEventsAdmin()
  return Response.json({ events })
}

const urlOrNull = z.string().nullable().optional()

const createSchema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().min(3).max(500),
  descriptionMd: z.string().default(''),
  coverImageUrl: urlOrNull,
  tags: z.array(z.string()).default([]),
  venueType: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
  meetingUrl: urlOrNull,
  locationText: z.string().nullable().optional(),
  startAt: z.string().min(1),
  endAt: z.string().nullable().optional(),
  timezone: z.string().min(1),
  capacity: z.number().int().positive().nullable().optional(),
  isPublished: z.boolean().default(false),
  organizerHandle: z.string().min(1).max(64),
  organizerName: z.string().min(1).max(120),
  organizerBio: z.string().nullable().optional(),
  organizerWebsite: urlOrNull,
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation error', issues: parsed.error.issues }, { status: 400 })
  }

  const result = await createEvent(parsed.data)
  return Response.json(result, { status: 201 })
}

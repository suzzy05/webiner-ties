import { z } from 'zod'
import { createRsvp } from '@/server/events'

export const dynamic = 'force-dynamic'

const schema = z.object({
  structured: z.object({
    fullName: z.string().min(2).max(140),
    email: z.string().email(),
    whatsapp: z.string().min(6).max(32),
    role: z.string().min(1).max(80),
    org: z.string().min(1).max(140),
    country: z.string().min(1).max(80),
    city: z.string().min(1).max(80),
    heardFrom: z.string().min(1).max(120),
    hopeToLearn: z.string().min(1).max(2000),
  }),
  // Dynamic answers keyed by question id.
  answers: z.record(z.string(), z.unknown()).default({}),
})

export async function POST(
  req: Request,
  ctx: RouteContext<'/api/events/[slug]/rsvps'>,
) {
  const { slug } = await ctx.params
  const body = await req.json()
  const input = schema.parse(body)

  const result = await createRsvp({
    eventSlug: slug,
    answers: input.answers,
    structured: input.structured,
  })
  if (result.ok) {
    return Response.json(
      { ok: true, ticketId: result.ticketId, createdAt: result.createdAt },
      { status: 201 },
    )
  }
  if (result.code === 'NOT_FOUND') {
    return Response.json({ error: 'Event not found' }, { status: 404 })
  }
  if (result.code === 'ALREADY_REGISTERED') {
    return Response.json({ error: 'Already registered with this email' }, { status: 409 })
  }
  if (result.code === 'INVALID') {
    return Response.json({ error: 'Invalid RSVP' }, { status: 400 })
  }
  return Response.json({ error: 'Could not RSVP' }, { status: 400 })
}

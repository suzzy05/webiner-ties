import { z } from 'zod'
import { createRsvp, getEventBySlug } from '@/server/events'
import { sendRegistrationConfirmation } from '@/lib/email'
import { formatInTimeZone } from 'date-fns-tz'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  answers: z.record(z.string(), z.unknown()).default({}),
})

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }

  const result = await createRsvp({
    eventSlug: slug,
    answers: parsed.data.answers,
    structured: parsed.data.structured,
  })

  if (!result.ok) {
    if (result.code === 'NOT_FOUND') return Response.json({ error: 'Event not found' }, { status: 404 })
    if (result.code === 'ALREADY_REGISTERED') return Response.json({ error: 'Already registered with this email' }, { status: 409 })
    return Response.json({ error: 'Registration failed' }, { status: 400 })
  }

  // Send confirmation email (non-blocking)
  getEventBySlug(slug).then((event) => {
    if (!event) return
    const tz = event.timezone
    const startAt = new Date(event.startAt)
    sendRegistrationConfirmation({
      to: parsed.data.structured.email,
      toName: parsed.data.structured.fullName,
      eventTitle: event.title,
      eventDate: formatInTimeZone(startAt, tz, 'MMMM d, yyyy'),
      eventTime: `${formatInTimeZone(startAt, tz, 'HH:mm')} ${tz}`,
      venueType: event.venueType,
      locationText: event.locationText,
      meetingUrl: event.meetingUrl,
      ticketId: result.ticketId,
    }).catch(console.error)
  }).catch(console.error)

  return Response.json(
    { ok: true, ticketId: result.ticketId, createdAt: result.createdAt },
    { status: 201 },
  )
}

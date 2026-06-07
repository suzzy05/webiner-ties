import { listRsvpsForEvent, getRegistrationsByDay } from '@/server/rsvps'
import { getEventById } from '@/server/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const event = await getEventById(id)
  if (!event) return Response.json({ error: 'Not found' }, { status: 404 })

  const [registrants, byDay] = await Promise.all([
    listRsvpsForEvent(id),
    getRegistrationsByDay(id),
  ])

  return Response.json({ registrants, byDay, total: registrants.length })
}

import { getEventBySlug } from '@/server/events'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  ctx: RouteContext<'/api/events/[slug]'>,
) {
  const { slug } = await ctx.params
  const event = await getEventBySlug(slug)
  if (!event) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ event })
}

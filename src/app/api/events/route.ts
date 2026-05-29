import { listEvents } from '@/server/events'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? undefined
  const tag = searchParams.get('tag') ?? undefined
  const venue = (searchParams.get('venue') ?? undefined) as
    | 'ONLINE'
    | 'IN_PERSON'
    | 'HYBRID'
    | undefined

  const events = await listEvents({ q, tag, venue, take: 100 })
  return Response.json({ events })
}

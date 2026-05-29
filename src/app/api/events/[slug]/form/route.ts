import { NextResponse } from 'next/server'
import { getEventBySlug, getRsvpFormForEvent } from '@/server/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const questions = await getRsvpFormForEvent(event.id)
  return NextResponse.json({ event: { id: event.id, slug: event.slug }, questions })
}

import { NextResponse } from 'next/server'
import { isAdminAuthed } from '@/server/adminAuth'
import { listRsvpsForEvent } from '@/server/rsvps'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const rsvps = await listRsvpsForEvent(id)
  return NextResponse.json({ rsvps })
}

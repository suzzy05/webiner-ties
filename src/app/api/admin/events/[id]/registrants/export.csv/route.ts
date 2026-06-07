import { listRsvpsForEvent } from '@/server/rsvps'
import { getEventById } from '@/server/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toRow(cells: string[]): string {
  return cells.map(csvEscape).join(',')
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const event = await getEventById(id)
  if (!event) return new Response('Not found', { status: 404 })

  const registrants = await listRsvpsForEvent(id)

  const header = toRow([
    '#', 'Ticket ID', 'Full Name', 'Email', 'WhatsApp',
    'Role', 'Org / University', 'Country', 'City',
    'How they heard', 'What they hope to learn', 'Registered at',
  ])

  const rows = registrants.map((r, i) =>
    toRow([
      String(i + 1),
      r.ticket_id,
      r.full_name,
      r.email,
      r.whatsapp,
      r.role,
      r.org,
      r.country,
      r.city,
      r.heard_from,
      r.hope_to_learn,
      r.created_at,
    ]),
  )

  const csv = [header, ...rows].join('\r\n')
  const filename = `${event.slug}-registrants-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

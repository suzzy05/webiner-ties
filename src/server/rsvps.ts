import { getDb } from './db'

export async function getRsvpCount(eventId: string): Promise<number> {
  const db = await getDb()
  const result = await db.execute({
    sql: `SELECT COUNT(*) as c FROM rsvp_submissions WHERE event_id = ?`,
    args: [eventId],
  })
  return Number((result.rows[0] as any).c ?? 0)
}

export async function listAttendeesForEvent(eventId: string, take = 12) {
  const db = await getDb()
  const result = await db.execute({
    sql: `SELECT full_name, created_at FROM rsvp_submissions
          WHERE event_id = ?
          ORDER BY created_at DESC
          LIMIT ?`,
    args: [eventId, Math.min(50, Math.max(1, take))],
  })
  return result.rows.map((r: any) => ({
    fullName: String(r.full_name),
    createdAt: String(r.created_at),
  }))
}

export async function listRsvpsForEvent(eventId: string) {
  const db = await getDb()
  const result = await db.execute({
    sql: `SELECT id, ticket_id, created_at, full_name, email, whatsapp,
                 role, org, country, city, heard_from, hope_to_learn
          FROM rsvp_submissions
          WHERE event_id = ?
          ORDER BY created_at DESC`,
    args: [eventId],
  })
  return result.rows.map((r: any) => ({
    id: String(r.id),
    ticket_id: String(r.ticket_id),
    created_at: String(r.created_at),
    full_name: String(r.full_name),
    email: String(r.email),
    whatsapp: String(r.whatsapp ?? ''),
    role: String(r.role ?? ''),
    org: String(r.org ?? ''),
    country: String(r.country ?? ''),
    city: String(r.city ?? ''),
    heard_from: String(r.heard_from ?? ''),
    hope_to_learn: String(r.hope_to_learn ?? ''),
  }))
}

export async function getRegistrationsByDay(
  eventId: string,
): Promise<Array<{ date: string; count: number }>> {
  const db = await getDb()
  const result = await db.execute({
    sql: `SELECT SUBSTR(created_at, 1, 10) as date, COUNT(*) as count
          FROM rsvp_submissions
          WHERE event_id = ?
          GROUP BY SUBSTR(created_at, 1, 10)
          ORDER BY date ASC`,
    args: [eventId],
  })
  return result.rows.map((r: any) => ({
    date: String(r.date),
    count: Number(r.count),
  }))
}

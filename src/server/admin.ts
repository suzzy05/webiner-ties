import { getDb } from './db'
import { listEvents } from './events'

export type AdminStats = {
  totalEvents: number
  publishedEvents: number
  draftEvents: number
  totalRegistrations: number
  upcomingEvents: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = await getDb()

  const [eventsResult, regResult] = await Promise.all([
    db.execute({
      sql: `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN is_published = 1 AND start_at >= ? THEN 1 ELSE 0 END) as upcoming
      FROM events`,
      args: [new Date().toISOString()],
    }),
    db.execute(`SELECT COUNT(*) as c FROM rsvp_submissions`),
  ])

  const row = eventsResult.rows[0] as any
  const regRow = regResult.rows[0] as any

  return {
    totalEvents: Number(row.total ?? 0),
    publishedEvents: Number(row.published ?? 0),
    draftEvents: Number(row.draft ?? 0),
    totalRegistrations: Number(regRow.c ?? 0),
    upcomingEvents: Number(row.upcoming ?? 0),
  }
}

export async function listAllEventsAdmin() {
  return listEvents({ take: 100, includeUnpublished: true })
}

export async function getRecentRegistrations(limit = 10) {
  const db = await getDb()
  const result = await db.execute({
    sql: `SELECT rs.ticket_id, rs.full_name, rs.email, rs.created_at,
                 e.id as event_id, e.title as event_title, e.slug as event_slug
          FROM rsvp_submissions rs
          JOIN events e ON e.id = rs.event_id
          ORDER BY rs.created_at DESC
          LIMIT ?`,
    args: [limit],
  })
  return result.rows.map((r: any) => ({
    ticketId: String(r.ticket_id),
    fullName: String(r.full_name),
    email: String(r.email),
    createdAt: String(r.created_at),
    eventId: String(r.event_id),
    eventTitle: String(r.event_title),
    eventSlug: String(r.event_slug),
  }))
}

export async function getRegistrationTrendLastDays(days = 30) {
  const db = await getDb()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const result = await db.execute({
    sql: `SELECT SUBSTR(created_at, 1, 10) as date, COUNT(*) as count
          FROM rsvp_submissions
          WHERE created_at >= ?
          GROUP BY SUBSTR(created_at, 1, 10)
          ORDER BY date ASC`,
    args: [since],
  })
  return result.rows.map((r: any) => ({
    date: String(r.date),
    count: Number(r.count),
  }))
}

import { randomUUID } from 'node:crypto'
import { getDb } from './db'

function nowIso() {
  return new Date().toISOString()
}

function ticketId() {
  // Human-friendly enough for demo/admin, still unique.
  // Example: TV-9F3K8Q
  const chunk = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TV-${chunk}`
}

export async function getRsvpCount(eventId: string) {
  const db = await getDb()
  const rs = await db.execute({
    sql: 'SELECT COUNT(*) as n FROM rsvp_submissions WHERE event_id = ?',
    args: [eventId],
  })
  const n = Number((rs.rows[0] as any)?.n ?? 0)
  return Number.isFinite(n) ? n : 0
}

export async function listRsvpsForEvent(eventId: string) {
  const db = await getDb()
  const rs = await db.execute({
    sql: `
      SELECT
        id,
        ticket_id,
        created_at,
        full_name,
        email,
        whatsapp,
        role,
        org,
        country,
        city,
        heard_from,
        hope_to_learn
      FROM rsvp_submissions
      WHERE event_id = ?
      ORDER BY created_at DESC
      LIMIT 500
    `,
    args: [eventId],
  })
  const submissions = rs.rows as any[]
  if (submissions.length === 0) return []

  const ids = submissions.map((r) => String((r as any).id))
  const placeholders = ids.map(() => '?').join(', ')
  const ans = await db.execute({
    sql: `SELECT submission_id, question_id, value FROM rsvp_answers WHERE submission_id IN (${placeholders})`,
    args: ids,
  })

  const bySubmission = new Map<string, Record<string, string>>()
  for (const row of ans.rows as any[]) {
    const sid = String(row.submission_id)
    const qid = String(row.question_id)
    const v = row.value == null ? '' : String(row.value)
    const obj = bySubmission.get(sid) ?? {}
    obj[qid] = v
    bySubmission.set(sid, obj)
  }

  return submissions.map((s: any) => ({
    ...s,
    answers: bySubmission.get(String(s.id)) ?? {},
  }))
}

export async function createRsvpSubmission(input: {
  eventId: string
  answers: Record<string, unknown>
  structured: {
    fullName: string
    email: string
    whatsapp: string
    role: string
    org: string
    country: string
    city: string
    heardFrom: string
    hopeToLearn: string
  }
}) {
  const db = await getDb()
  const submissionId = randomUUID()

  // If collisions happen (unlikely), we can retry.
  let tid = ticketId()
  for (let i = 0; i < 3; i++) {
    const exists = await db.execute({
      sql: 'SELECT 1 FROM rsvp_submissions WHERE ticket_id = ? LIMIT 1',
      args: [tid],
    })
    if ((exists.rows?.length ?? 0) === 0) break
    tid = ticketId()
  }

  const createdAt = nowIso()

  await db.execute({
    sql: `
      INSERT INTO rsvp_submissions (
        id,
        event_id,
        ticket_id,
        created_at,
        full_name,
        email,
        whatsapp,
        role,
        org,
        country,
        city,
        heard_from,
        hope_to_learn
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      submissionId,
      input.eventId,
      tid,
      createdAt,
      input.structured.fullName,
      input.structured.email,
      input.structured.whatsapp,
      input.structured.role,
      input.structured.org,
      input.structured.country,
      input.structured.city,
      input.structured.heardFrom,
      input.structured.hopeToLearn,
    ],
  })

  // Store extra / custom answers.
  const entries = Object.entries(input.answers)
  for (const [questionId, value] of entries) {
    await db.execute({
      sql: `
        INSERT OR REPLACE INTO rsvp_answers (submission_id, question_id, value)
        VALUES (?, ?, ?)
      `,
      args: [submissionId, questionId, value == null ? null : String(value)],
    })
  }

  return { submissionId, ticketId: tid, createdAt }
}

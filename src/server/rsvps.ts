import { listStoreRsvpsForEvent } from './jsonStore'

export async function getRsvpCount(eventId: string) {
  const rsvps = await listStoreRsvpsForEvent(eventId)
  return rsvps.length
}

export async function listAttendeesForEvent(eventId: string, take = 12) {
  const rsvps = await listStoreRsvpsForEvent(eventId)
  return rsvps
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, Math.max(0, Math.min(50, take)))
    .map((r) => ({ fullName: r.structured.fullName.trim(), createdAt: r.createdAt }))
}

export async function listRsvpsForEvent(eventId: string) {
  const rsvps = await listStoreRsvpsForEvent(eventId)
  return rsvps.map((r) => ({
    id: r.id,
    ticket_id: r.ticketId,
    created_at: r.createdAt,
    full_name: r.structured.fullName,
    email: r.structured.email,
    whatsapp: r.structured.whatsapp,
    role: r.structured.role,
    org: r.structured.org,
    country: r.structured.country,
    city: r.structured.city,
    heard_from: r.structured.heardFrom,
    hope_to_learn: r.structured.hopeToLearn,
    answers: r.answers,
  }))
}


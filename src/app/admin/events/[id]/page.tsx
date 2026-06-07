import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatInTimeZone } from 'date-fns-tz'
import { getEventById } from '@/server/events'
import { listRsvpsForEvent, getRegistrationsByDay } from '@/server/rsvps'
import { EventForm } from '../EventForm'
import { MiniBarChart } from '../../MiniBarChart'
import { RegistrantsTable } from './RegistrantsTable'

export const dynamic = 'force-dynamic'

export default async function AdminEventDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const event = await getEventById(id)
  if (!event) notFound()

  const [registrants, byDay] = await Promise.all([
    listRsvpsForEvent(id),
    getRegistrationsByDay(id),
  ])

  const tz = event.timezone
  const startAt = new Date(event.startAt)

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/events" className="text-sm text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]">
          ← Events
        </Link>
        <h1 className="flex-1 text-2xl font-semibold text-[color:var(--ink)] truncate">{event.title}</h1>
        {!event.isPublished && (
          <span className="rounded px-2 py-0.5 text-xs font-semibold bg-white/05 text-[color:var(--ink-muted)]">DRAFT</span>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat label="Registrations" value={registrants.length} accent />
        <MiniStat label="Capacity" value={event.capacity != null ? `${registrants.length} / ${event.capacity}` : '∞'} />
        <MiniStat label="Date" value={formatInTimeZone(startAt, tz, 'MMM d, yyyy')} />
        <MiniStat label="Time" value={formatInTimeZone(startAt, tz, 'HH:mm z')} />
      </div>

      {/* Edit form */}
      <div className="mb-10">
        <h2 className="mb-4 text-base font-semibold text-[color:var(--ink)]">Edit event</h2>
        <EventForm mode="edit" event={event} />
      </div>

      {/* Registrations section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[color:var(--ink)]">
          Registrations ({registrants.length})
        </h2>
        {registrants.length > 0 && (
          <a
            href={`/api/admin/events/${id}/registrants/export.csv`}
            className="tv-btn px-4 py-2 text-xs"
          >
            Export CSV
          </a>
        )}
      </div>

      {byDay.length > 0 && (
        <div className="mb-6 rounded-2xl border border-white/08 bg-[color:var(--card)] p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--ink-muted)]">
            Sign-ups over time
          </h3>
          <MiniBarChart data={byDay} />
        </div>
      )}

      <div className="rounded-2xl border border-white/08 bg-[color:var(--card)] overflow-hidden">
        {registrants.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[color:var(--ink-muted)]">No registrations yet.</p>
        ) : (
          <RegistrantsTable registrants={registrants} />
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/08 bg-[color:var(--card)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? 'text-[color:var(--ink-highlight)]' : 'text-[color:var(--ink)]'}`}>
        {value}
      </p>
    </div>
  )
}

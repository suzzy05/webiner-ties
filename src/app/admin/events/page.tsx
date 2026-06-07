import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import { listAllEventsAdmin } from '@/server/admin'
import { DeleteEventButton } from './DeleteEventButton'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const events = await listAllEventsAdmin()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--ink)]">Events</h1>
          <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
            {events.length} total · {events.filter((e) => e.isPublished).length} published
          </p>
        </div>
        <Link href="/admin/events/new" className="tv-btn tv-btn-primary px-5 py-2.5 text-sm">
          + New event
        </Link>
      </div>

      <div className="rounded-2xl border border-white/08 bg-[color:var(--card)] overflow-hidden">
        {events.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[color:var(--ink-muted)]">No events yet.</p>
            <Link href="/admin/events/new" className="mt-4 inline-block tv-btn tv-btn-primary px-5 py-2.5 text-sm">
              Create your first event
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/06">
                <Th>Title</Th>
                <Th>Date</Th>
                <Th>Venue</Th>
                <Th>Status</Th>
                <Th className="text-right">RSVPs</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const startAt = new Date(e.startAt)
                const dateStr = formatInTimeZone(startAt, e.timezone, 'MMM d, yyyy HH:mm')
                const isPast = startAt < new Date()

                return (
                  <tr key={e.id} className="border-b border-white/04 last:border-0 hover:bg-white/02">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/events/${e.id}`}
                        className="font-medium text-[color:var(--ink)] hover:text-[color:var(--ink-highlight)]"
                      >
                        {e.title}
                      </Link>
                      {e.tagList.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {e.tagList.slice(0, 3).map((t) => (
                            <span key={t} className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-white/05 text-[color:var(--ink-muted)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[color:var(--ink-muted)]">
                      <span className={isPast ? 'opacity-50' : ''}>{dateStr}</span>
                    </td>
                    <td className="px-6 py-4">
                      <VenueBadge type={e.venueType} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge published={e.isPublished} />
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[color:var(--ink)]">
                      {e._count.rsvps}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/events/${e.slug}`}
                          target="_blank"
                          className="text-xs text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/events/${e.id}`}
                          className="text-xs text-[color:var(--ink-highlight)] hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteEventButton id={e.id} title={e.title} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)] ${className ?? ''}`}>
      {children}
    </th>
  )
}

function VenueBadge({ type }: { type: string }) {
  const map = { ONLINE: 'Online', IN_PERSON: 'In person', HYBRID: 'Hybrid' }
  return (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-white/05 text-[color:var(--ink-muted)]">
      {map[type as keyof typeof map] ?? type}
    </span>
  )
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        published
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-white/05 text-[color:var(--ink-muted)]'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

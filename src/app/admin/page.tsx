import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import { getAdminStats, getRecentRegistrations, getRegistrationTrendLastDays } from '@/server/admin'
import { MiniBarChart } from './MiniBarChart'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [stats, recent, trend] = await Promise.all([
    getAdminStats(),
    getRecentRegistrations(10),
    getRegistrationTrendLastDays(30),
  ])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--ink)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Overview of your webinars and registrations.</p>
        </div>
        <Link href="/admin/events/new" className="tv-btn tv-btn-primary px-5 py-2.5 text-sm">
          + New event
        </Link>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total events" value={stats.totalEvents} />
        <StatCard label="Published" value={stats.publishedEvents} />
        <StatCard label="Upcoming" value={stats.upcomingEvents} accent />
        <StatCard label="Registrations" value={stats.totalRegistrations} accent />
      </div>

      {/* Registration trend chart */}
      <div className="mb-8 rounded-2xl border border-white/08 bg-[color:var(--card)] p-6">
        <h2 className="mb-4 text-sm font-semibold text-[color:var(--ink)]">Registrations — last 30 days</h2>
        {trend.length ? (
          <MiniBarChart data={trend} />
        ) : (
          <p className="text-sm text-[color:var(--ink-muted)]">No registrations yet.</p>
        )}
      </div>

      {/* Recent registrations */}
      <div className="rounded-2xl border border-white/08 bg-[color:var(--card)]">
        <div className="flex items-center justify-between border-b border-white/06 px-6 py-4">
          <h2 className="text-sm font-semibold text-[color:var(--ink)]">Recent registrations</h2>
          <Link href="/admin/events" className="text-xs text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]">
            View all events
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-6 py-8 text-sm text-[color:var(--ink-muted)]">No registrations yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/05">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Event</Th>
                <Th>Ticket</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.ticketId} className="border-b border-white/04 last:border-0 hover:bg-white/02">
                  <Td>{r.fullName}</Td>
                  <Td className="text-[color:var(--ink-muted)]">{r.email}</Td>
                  <Td>
                    <Link
                      href={`/admin/events/${r.eventId}`}
                      className="text-[color:var(--ink-highlight)] hover:underline"
                    >
                      {r.eventTitle.length > 40 ? r.eventTitle.slice(0, 40) + '…' : r.eventTitle}
                    </Link>
                  </Td>
                  <Td className="font-mono text-xs">{r.ticketId}</Td>
                  <Td className="text-[color:var(--ink-muted)]">
                    {formatInTimeZone(new Date(r.createdAt), 'UTC', 'MMM d, HH:mm')}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/08 bg-[color:var(--card)] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? 'text-[color:var(--ink-highlight)]' : 'text-[color:var(--ink)]'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-3 text-[color:var(--ink)] ${className ?? ''}`}>{children}</td>
}

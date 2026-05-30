import Link from 'next/link'
import { listEvents } from '@/server/events'
import { EventCard } from '@/components/EventCard'
import { CategoryCard } from '@/components/CategoryCard'
import { FeaturedEventCard } from '@/components/FeaturedEventCard'
import { categories, featuredEvents } from '@/data/homeDiscover'

export default async function Page() {
  const now = new Date()
  const events = await listEvents({ take: 80 })

  const upcoming = events
    .filter((event) => new Date(event.startAt).getTime() >= now.getTime())
    .slice(0, 9)
  const recent = events
    .filter((event) => new Date(event.startAt).getTime() < now.getTime())
    .slice(0, 4)

  const live = events
    .filter((event) => {
      const s = new Date(event.startAt).getTime()
      const e = event.endAt ? new Date(event.endAt).getTime() : s + 60 * 60 * 1000
      return s <= now.getTime() && now.getTime() < e
    })
    .slice(0, 6)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-0">
      <section className="mb-14 overflow-hidden rounded-[32px] border border-white/08 bg-[color:var(--card)]" style={{boxShadow:'0 1px 0 rgba(255,255,255,0.05) inset, 0 32px 80px rgba(0,0,0,0.45)'}}>
        <div className="relative p-8 sm:p-14">
          {/* Multi-layer ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_20%_-10%,rgba(228,213,160,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_110%,rgba(120,100,200,0.06),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="relative">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-6xl">
              Webinars &amp; events by{' '}
              <span className="tv-highlight">.tiesverse</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[color:var(--ink-muted)] sm:text-lg">
              Find what&apos;s next. RSVP fast. Show up with a friendly crowd.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/discover" className="tv-btn tv-btn-primary px-7 py-3 text-[15px]">
                <span className="material-symbols-outlined text-[18px]">explore</span>
                Explore events
              </Link>
              <Link href="/discover?tag=webinar" className="tv-btn px-6 py-3">
                Webinars
              </Link>
              <Link href="/discover?tag=meetup" className="tv-btn px-6 py-3">
                Meetups
              </Link>
              <Link href="/discover?venue=ONLINE" className="tv-btn px-6 py-3">
                Online only
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Upcoming</h2>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Pick a session and grab your spot.</p>
          </div>
          <Link href="/discover" className="text-sm font-medium text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]">
            See all
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.length ? (
            upcoming.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] p-6 text-sm text-[color:var(--ink-muted)]">
              No upcoming events yet.
            </div>
          )}
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Live now</h2>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Join while it’s happening.</p>
          </div>
          <Link href="/discover" className="text-sm font-medium text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]">
            Explore
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {live.length ? (
            live.map((event) => <EventCard key={`live-${event.id}`} event={event} />)
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] p-6 text-sm text-[color:var(--ink-muted)]">
              No live events right now.
            </div>
          )}
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Browse by category</h2>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Tap a category to filter events.</p>
          </div>
          <Link href="/discover" className="text-sm font-medium text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]">
            All filters
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.key} category={c} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Featured events</h2>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Handpicked sessions worth bookmarking.</p>
          </div>
          <Link href="/discover" className="text-sm font-medium text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]">
            Browse
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.slice(0, 6).map((e) => (
            <FeaturedEventCard key={e.key} event={e} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--ink)]">Recently hosted</h2>
          <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Missed one? Catch the recap on the event page.</p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.length ? (
            recent.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] p-6 text-sm text-[color:var(--ink-muted)]">
              Past events will appear here.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

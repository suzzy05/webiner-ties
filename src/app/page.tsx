import Link from 'next/link'
import { Container } from '@/components/Container'
import { FeaturedEventCard } from '@/components/FeaturedEventCard'
import { LocalEventsExplorer } from '@/components/LocalEventsExplorer'
import { HeroCollage } from '@/components/HeroCollage'
import { categories, featuredEvents, regions } from '@/data/homeDiscover'
import { formatEventDateTime } from '@/lib/format'
import { listEvents } from '@/server/events'

/**
 * Home page
 *
 * Design goal:
 * - Keep the layout rhythm and spacing from the provided 100x reference.
 * - Keep Tiesverse palette (white + orange) and avoid "marketing wall of text".
 * - Make the primary story obvious: see events → RSVP → get a ticket.
 */
export default async function Page() {
  const now = new Date()

  const upcoming = await listEvents({ after: now, take: 6 })

  const published = await listEvents({ take: 100 })

  const ongoing = published
    .filter((event) => {
      if (event.startAt.getTime() > now.getTime()) return false
      const endAt = event.endAt
        ? event.endAt
        : new Date(event.startAt.getTime() + 60 * 60_000)
      return endAt.getTime() > now.getTime()
    })
    .slice(0, 4)

  return (
    <>
      {/* HERO */}
      <section>
        <Container className="py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <div>
              <div className="tv-kicker text-xs font-semibold text-[color:var(--ink-muted)]">
                tiesverse events
              </div>

              <h1 className="tv-display mt-4 text-5xl font-semibold leading-[0.95] tracking-tight text-[color:var(--ink)] sm:text-6xl">
                Discover sessions that
                <br />
                <span className="text-[color:var(--brand)]">move you forward</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm text-[color:var(--ink-muted)] sm:text-base">
                Upcoming webinars, workshops, and meetups from the Tiesverse
                community. RSVP fast and get a ticket instantly.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/discover"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--brand)] px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--brand-600)]"
                >
                  Explore events
                </Link>
              </div>

              {/* Ongoing + Upcoming */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="tv-card tv-card-muted p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="tv-kicker text-[10px] font-semibold text-[color:var(--ink-muted)]">
                      Ongoing
                    </div>
                    <Link
                      href="/discover"
                      className="text-xs font-semibold text-[color:var(--brand)] hover:underline"
                    >
                      See all
                    </Link>
                  </div>

                  <div className="mt-3 space-y-3">
                    {ongoing.length === 0 ? (
                      <div className="text-sm text-[color:var(--ink-muted)]">
                        No live events right now.
                      </div>
                    ) : (
                      ongoing.map((event) => (
                        <Link
                          key={event.slug}
                          href={`/events/${event.slug}`}
                          className="tv-card group block bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                                {event.title}
                              </div>
                              <div className="mt-1 text-xs text-[color:var(--ink-muted)]">
                                Live now ·{' '}
                                {event.venueType === 'ONLINE' ? 'Online' : 'Offline'}
                              </div>
                            </div>
                            <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-2 py-1 text-[10px] font-semibold text-[color:var(--brand)]">
                              LIVE
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <div className="tv-card tv-card-muted p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="tv-kicker text-[10px] font-semibold text-[color:var(--ink-muted)]">
                      Upcoming
                    </div>
                    <Link
                      href="/discover"
                      className="text-xs font-semibold text-[color:var(--brand)] hover:underline"
                    >
                      See all
                    </Link>
                  </div>

                  <div className="mt-3 space-y-3">
                    {upcoming.length === 0 ? (
                      <div className="text-sm text-[color:var(--ink-muted)]">
                        No upcoming events yet.
                      </div>
                    ) : (
                      upcoming.slice(0, 4).map((event) => (
                        <Link
                          key={event.slug}
                          href={`/events/${event.slug}`}
                          className="tv-card group block bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="truncate text-sm font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                            {event.title}
                          </div>
                          <div className="mt-1 text-xs text-[color:var(--ink-muted)]">
                            {formatEventDateTime({
                              startAt: new Date(event.startAt),
                              endAt: event.endAt ? new Date(event.endAt) : null,
                              timezone: event.timezone,
                            })}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <HeroCollage />
          </div>
        </Container>
      </section>

      <div className="tv-divider" />

      {/* CATEGORIES + LOCAL */}
      <section>
        <Container className="py-14">
          <div className="text-center">
            <div className="tv-display text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">
              Browse by category
              <br />
              <span className="text-[color:var(--brand)]">then refine</span>
            </div>
            <p className="mt-3 text-sm text-[color:var(--ink-muted)]">
              Start broad, then use tags and venue type to narrow down.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.key}
                href={`/discover?tag=${encodeURIComponent(
                  category.discoverTag ?? category.key,
                )}`}
                className="tv-card group flex items-center gap-3 px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--paper-muted)]">
                  <category.icon
                    className="h-5 w-5 text-[color:var(--brand)]"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                    {category.title}
                  </div>
                  <div className="text-xs text-[color:var(--ink-muted)]">
                    Filter by tag
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <div className="tv-kicker text-xs font-semibold text-[color:var(--ink-muted)]">
              local events
            </div>
            <h2 className="tv-display mt-3 text-2xl font-semibold text-[color:var(--ink)]">
              Explore by region
            </h2>
            <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
              A small demo list for now. Wire this to real geo later.
            </p>
            <LocalEventsExplorer regions={regions} className="mt-6" />
          </div>
        </Container>
      </section>

      <div className="tv-divider" />

      {/* FEATURED EVENTS */}
      <section>
        <Container className="py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="tv-kicker text-xs font-semibold text-[color:var(--ink-muted)]">
                featured
              </div>
              <h2 className="tv-display mt-3 text-2xl font-semibold text-[color:var(--ink)]">
                Featured events
              </h2>
              <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
                A few highlights to start with.
              </p>
            </div>
            <Link
              href="/discover"
              className="text-sm font-semibold text-[color:var(--brand)] hover:underline"
            >
              See all
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <FeaturedEventCard key={event.key} event={event} />
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}


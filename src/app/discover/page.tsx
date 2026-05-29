import { Container } from '@/components/Container'
import { DiscoverControls } from '@/components/DiscoverControls'
import { EventCard } from '@/components/EventCard'
import { listEvents } from '@/server/events'

type SearchParams = Record<string, string | string[] | undefined>

function first(sp: SearchParams, key: string) {
  const v = sp[key]
  if (Array.isArray(v)) return v[0]
  return v
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  const q = first(sp, 'q')?.toString()
  const tag = first(sp, 'tag')?.toString()
  const venue = first(sp, 'venue')?.toString() as
    | 'ONLINE'
    | 'IN_PERSON'
    | 'HYBRID'
    | undefined

  const events = await listEvents({ q, tag, venue, take: 60 })

  return (
    <Container className="py-10">
      <h1 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
        Browse events
      </h1>
      <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
        Search events and webinars by title, tags, and venue type.
      </p>

      <div className="tv-card tv-card-muted mt-6 p-5 shadow-sm">
        <DiscoverControls />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {events.length === 0 ? (
          <div className="tv-card tv-card-muted p-8 text-sm text-[color:var(--ink-muted)]">
            No results. Try clearing filters or searching a different tag.
          </div>
        ) : (
          events.map((e) => <EventCard key={e.slug} event={e} />)
        )}
      </div>
    </Container>
  )
}

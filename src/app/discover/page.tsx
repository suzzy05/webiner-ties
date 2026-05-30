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
    <Container className="py-12">
      <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--ink)]">
        Discover Events
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[color:var(--ink-muted)]">
        Browse upcoming Tiesverse webinars and events.
      </p>

      <div className="tv-card mt-8 rounded-[24px] p-5">
        <DiscoverControls />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {events.length === 0 ? (
          <div className="tv-card rounded-[24px] p-8 text-sm text-[color:var(--ink-muted)]">
            No results. Try clearing filters or searching a different tag.
          </div>
        ) : (
          events.map((e) => <EventCard key={e.slug} event={e} />)
        )}
      </div>
    </Container>
  )
}

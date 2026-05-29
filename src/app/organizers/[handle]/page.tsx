import Link from 'next/link'
import { Container } from '@/components/Container'
import { EventCard } from '@/components/EventCard'
import { listEvents } from '@/server/events'

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params

  const events = await listEvents({ take: 100 })
  const filtered = events.filter((e) => e.organizer.handle === handle)
  const organizer = filtered[0]?.organizer

  if (!organizer) {
    return (
      <Container className="py-16">
        <h1 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
          Not found
        </h1>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Organizer does not exist.
        </p>
        <div className="mt-6">
          <Link
            href="/discover"
            className="text-sm font-semibold text-[color:var(--brand)] hover:underline"
          >
            Back to events
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-10">
      <div className="tv-card tv-card-muted p-6 shadow-sm">
        <div className="text-sm text-[color:var(--ink-muted)]">Organizer</div>
        <h1 className="tv-display mt-2 text-3xl font-semibold text-[color:var(--ink)]">
          {organizer.name}
        </h1>
        {organizer.bio ? (
          <p className="mt-3 text-sm text-[color:var(--ink-muted)]">
            {organizer.bio}
          </p>
        ) : null}
        {organizer.website ? (
          <div className="mt-4">
            <a
              href={organizer.website}
              className="text-sm font-semibold text-[color:var(--brand)] hover:underline"
            >
              {organizer.website}
            </a>
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {filtered.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
    </Container>
  )
}

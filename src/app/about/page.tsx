import { Container } from '@/components/Container'

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
        About
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[color:var(--ink-muted)]">
        Tiesverse Events is a lightweight discovery experience for webinars and
        community events. It’s intentionally minimal: fast listings, clean
        detail pages, and a simple RSVP flow.
      </p>

      <div className="tv-card tv-card-muted mt-6 p-6 text-sm text-[color:var(--ink-muted)] shadow-sm">
        <div className="font-semibold text-[color:var(--ink)]">Design goals</div>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>White + orange palette, no heavy chrome.</li>
          <li>Optimized for scanning: title, date/time, summary, tags.</li>
          <li>Backend included via Route Handlers (no DB yet).</li>
        </ul>
      </div>
    </Container>
  )
}


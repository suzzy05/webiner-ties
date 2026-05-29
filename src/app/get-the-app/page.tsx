import { Container } from '@/components/Container'

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
        Get the app
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[color:var(--ink-muted)]">
        Placeholder page for mobile download links. If you have Android / iOS
        store URLs, I’ll add real buttons and tracking.
      </p>
    </Container>
  )
}


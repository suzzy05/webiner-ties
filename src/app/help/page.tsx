import { Container } from '@/components/Container'

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
        Help
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[color:var(--ink-muted)]">
        Placeholder page. Common next steps: FAQ, contact links, and a short
        “How to host an event” guide.
      </p>
    </Container>
  )
}


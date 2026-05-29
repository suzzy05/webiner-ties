import { Container } from '@/components/Container'

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
        Pricing
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[color:var(--ink-muted)]">
        Placeholder page. If your senior wants pricing, tell me the tiers and
        what’s included and I’ll build it cleanly (with good copy).
      </p>
    </Container>
  )
}


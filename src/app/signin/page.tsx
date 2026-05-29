import { Container } from '@/components/Container'

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
        Sign in
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[color:var(--ink-muted)]">
        Placeholder page. The app works without accounts right now. When you’re
        ready, we can add auth (email magic link, Google, etc.).
      </p>
    </Container>
  )
}


import { Container } from '@/components/Container'

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
        Project docs
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[color:var(--ink-muted)]">
        The docs in this repo are meant to read like a human wrote them, not a
        generator. If something feels unclear, tell me what your senior cares
        about and I’ll tighten it up.
      </p>

      <div className="tv-card tv-card-muted mt-6 p-6 text-sm text-[color:var(--ink-muted)] shadow-sm">
        <div className="font-semibold text-[color:var(--ink)]">Quick start</div>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Copy `.env.example` to `.env` (optional).</li>
          <li>Edit events in `src/data/mockEvents.ts`.</li>
          <li>Run `npm run dev` and open `http://localhost:3000`.</li>
        </ol>
      </div>
    </Container>
  )
}


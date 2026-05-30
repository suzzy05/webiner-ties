import Link from 'next/link'
import { Container } from './Container'

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-highest)]">
      <Container className="flex flex-col gap-10 py-12 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md">
          <div className="font-display text-xl font-extrabold uppercase tracking-tight text-[color:var(--on-surface)]">
            Tiesverse
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)]">
            &copy; {new Date().getFullYear()} TIESVERSE. WEBINARS FOR TEAMS AND COMMUNITIES.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 md:gap-10">
          <Link
            className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-tertiary-fixed-variant)] hover:text-[color:var(--primary)]"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-tertiary-fixed-variant)] hover:text-[color:var(--primary)]"
            href="#"
          >
            Privacy Protocol
          </Link>
          <Link
            className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-tertiary-fixed-variant)] hover:text-[color:var(--primary)]"
            href="#"
          >
            Editorial Standards
          </Link>
          <Link
            className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-tertiary-fixed-variant)] hover:text-[color:var(--primary)]"
            href="#"
          >
            Contact
          </Link>
        </div>
      </Container>
    </footer>
  )
}

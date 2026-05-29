import Link from 'next/link'
import { Container } from './Container'
import { TiesverseMark } from './TiesverseMark'

export function SiteHeader() {
  return (
    <header className="bg-[color:var(--paper)]">
      <Container className="flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center">
          <TiesverseMark subtitle="EVENTS" />
        </Link>
      </Container>
      <div className="tv-divider" />
    </header>
  )
}

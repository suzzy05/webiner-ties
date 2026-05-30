'use client'

import Link from 'next/link'
import { Container } from './Container'
import { HeaderClock } from './HeaderClock'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/07 bg-[#09090b]/75 backdrop-blur-xl backdrop-saturate-150">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/30 to-transparent" />

      <Container className="flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="tv-header-logo">
            <span className="tv-header-logo-dot">.</span>tiesverse
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <div className="hidden sm:block">
            <HeaderClock />
          </div>
          <nav className="flex items-center gap-2">
            <Link
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-[color:var(--ink-muted)] transition-colors hover:text-[color:var(--ink)] hover:bg-white/05"
              href="/"
            >
              Discover
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  )
}

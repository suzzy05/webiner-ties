'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from './Container'
import { HeaderClock } from './HeaderClock'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-white/07 bg-[#09090b]/75 backdrop-blur-xl backdrop-saturate-150">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/30 to-transparent" />

      <Container className="flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="tv-header-logo">
            <span className="tv-header-logo-dot">.</span>tiesverse
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <HeaderClock />
          </div>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'text-[color:var(--accent)] bg-[color:var(--accent-dim)]'
                      : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-white/05',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <ThemeToggle />
        </div>
      </Container>
    </header>
  )
}

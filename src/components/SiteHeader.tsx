'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { Container } from './Container'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b-2 border-[color:var(--on-background)] bg-[color:var(--background)]',
        scrolled ? 'tv-hard-shadow-sm' : null,
      )}
    >
      <Container className="flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-baseline gap-3"
        >
          <span className="[font-family:var(--font-logo)] text-[20px] font-bold tracking-tight text-[color:var(--on-background)] sm:text-[22px]">
            <span className="text-[color:var(--on-background)]">.</span>
            <span className="text-[color:var(--primary)]">ties</span>
            <span className="text-[color:var(--on-background)]">verse</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--on-background)] opacity-70">
            Events
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/discover"
            className="border-b-2 border-[color:var(--primary)] pb-1 text-[15px] font-semibold text-[color:var(--primary)]"
          >
            Explore
          </Link>
          <Link
            href="/discover"
            className="pb-1 text-[15px] font-semibold text-[color:var(--on-background)] opacity-70 hover:text-[color:var(--primary)]"
          >
            Schedule
          </Link>
          <Link
            href="/organizers/tiesverse"
            className="pb-1 text-[15px] font-semibold text-[color:var(--on-background)] opacity-70 hover:text-[color:var(--primary)]"
          >
            Network
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="tv-hard-shadow-sm hidden select-none items-center bg-[color:var(--primary)] px-6 py-2 text-[15px] font-semibold text-[color:var(--on-primary)] active:translate-x-[2px] active:translate-y-[2px] lg:inline-flex"
          >
            Host a Webinar
          </Link>
          <span className="material-symbols-outlined cursor-pointer text-[color:var(--on-background)]">
            search
          </span>
          <span className="material-symbols-outlined cursor-pointer text-[color:var(--on-background)] md:hidden">
            menu
          </span>
        </div>
      </Container>
    </header>
  )
}

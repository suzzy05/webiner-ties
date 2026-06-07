import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

export const metadata: Metadata = {
  title: { default: 'Admin — Tiesverse', template: '%s | Admin — Tiesverse' },
  robots: 'noindex,nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <nav className="border-b border-white/08 bg-[color:var(--card)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-semibold text-[color:var(--ink-highlight)]">Tiesverse</span>
              <span className="rounded bg-white/08 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--ink-muted)]">
                Admin
              </span>
            </Link>
            <div className="hidden items-center gap-1 sm:flex">
              <NavLink href="/admin">Dashboard</NavLink>
              <NavLink href="/admin/events">Events</NavLink>
            </div>
          </div>
          <LogoutButton />
        </div>
      </nav>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-[color:var(--ink-muted)] transition-colors hover:bg-white/06 hover:text-[color:var(--ink)]"
    >
      {children}
    </Link>
  )
}

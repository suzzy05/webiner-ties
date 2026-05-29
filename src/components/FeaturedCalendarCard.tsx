'use client'

import { useMemo, useState } from 'react'
import type { FeaturedCalendar } from '@/data/homeDiscover'
import { cn } from '@/lib/cn'

type Status = 'idle' | 'subscribed'

function storageKey(key: string) {
  return `tiesverse:calendar:${key}`
}

/**
 * "Featured calendar" card with a lightweight subscribe interaction.
 * This is UI-only: we store the preference in localStorage for now.
 */
export function FeaturedCalendarCard(props: {
  calendar: FeaturedCalendar
  className?: string
}) {
  const key = useMemo(() => storageKey(props.calendar.key), [props.calendar.key])
  const [status, setStatus] = useState<Status>(() => {
    if (typeof window === 'undefined') return 'idle'
    try {
      const v = localStorage.getItem(key)
      return v === 'subscribed' ? 'subscribed' : 'idle'
    } catch {
      return 'idle'
    }
  })

  const toggle = () => {
    const next: Status = status === 'subscribed' ? 'idle' : 'subscribed'
    setStatus(next)
    try {
      localStorage.setItem(key, next === 'subscribed' ? 'subscribed' : '')
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn(
        'tv-card tv-card-muted p-5 shadow-sm',
        props.className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-[color:var(--stroke)]">
            <span className="text-sm font-semibold text-[color:var(--ink)]">
              {props.calendar.title.slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[color:var(--ink)]">
              {props.calendar.title}
            </div>
            {props.calendar.badge ? (
              <div className="mt-1 inline-flex rounded-full border border-[color:var(--stroke)] bg-white px-2 py-0.5 text-[11px] text-[color:var(--ink-muted)]">
                {props.calendar.badge}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          className={cn(
            'inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium ring-1 transition',
            status === 'subscribed'
              ? 'bg-[color:var(--brand)] text-white ring-[color:var(--brand)] hover:bg-[color:var(--brand-600)]'
              : 'bg-white text-[color:var(--ink)] ring-[color:var(--stroke-strong)] hover:bg-[color:var(--paper-muted)]',
          )}
        >
          {status === 'subscribed' ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-[color:var(--ink-muted)]">
        {props.calendar.description}
      </p>
    </div>
  )
}

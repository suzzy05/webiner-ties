'use client'

import { useEffect, useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from './Input'
import { cn } from '@/lib/cn'
import { kvGet, kvSet } from '@/lib/indexedDb'

function setParam(params: URLSearchParams, key: string, value: string) {
  if (!value) params.delete(key)
  else params.set(key, value)
}

export function DiscoverControls(props: { className?: string }) {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const q = sp.get('q') ?? ''
  const tag = sp.get('tag') ?? ''
  const venue = sp.get('venue') ?? ''

  const disabled = isPending

  const push = (next: URLSearchParams) => {
    startTransition(() => {
      const qs = next.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  const tagPlaceholder = useMemo(() => 'e.g. tech, ai, meetup', [])

  useEffect(() => {
    const hasAny = Boolean(q || tag || venue)
    if (hasAny) {
      kvSet('discover:lastFilters', { q, tag, venue }).catch(() => null)
      return
    }

    let cancelled = false
    ;(async () => {
      const saved = await kvGet<{ q: string; tag: string; venue: string }>('discover:lastFilters')
      if (cancelled) return
      if (!saved) return
      const next = new URLSearchParams(sp)
      setParam(next, 'q', saved.q ?? '')
      setParam(next, 'tag', saved.tag ?? '')
      setParam(next, 'venue', saved.venue ?? '')
      const qs = next.toString()
      if (qs) router.replace(`${pathname}?${qs}`)
    })().catch(() => null)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={cn('grid gap-3 sm:grid-cols-3', props.className)}>
      <div className="sm:col-span-2">
        <label className="mb-1 tv-label">Search</label>
        <Input
          value={q}
          disabled={disabled}
          placeholder="Search events, webinars, tags…"
          onChange={(e) => {
            const next = new URLSearchParams(sp)
            setParam(next, 'q', e.target.value)
            push(next)
            kvSet('discover:lastFilters', { q: e.target.value, tag, venue }).catch(() => null)
          }}
        />
      </div>

      <div>
        <label className="mb-1 tv-label">Venue</label>
        <select
          value={venue}
          disabled={disabled}
          onChange={(e) => {
            const next = new URLSearchParams(sp)
            setParam(next, 'venue', e.target.value)
            push(next)
            kvSet('discover:lastFilters', { q, tag, venue: e.target.value }).catch(() => null)
          }}
          className="tv-input"
        >
          <option value="">Any</option>
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In-person</option>
          <option value="HYBRID">Hybrid</option>
        </select>
      </div>

      <div className="sm:col-span-3">
        <label className="mb-1 tv-label">Tag</label>
        <Input
          value={tag}
          disabled={disabled}
          placeholder={tagPlaceholder}
          onChange={(e) => {
            const next = new URLSearchParams(sp)
            setParam(next, 'tag', e.target.value)
            push(next)
            kvSet('discover:lastFilters', { q, tag: e.target.value, venue }).catch(() => null)
          }}
        />
        <div className="mt-1 text-xs text-[color:var(--ink-muted)]">
          Tip: try <span className="font-medium text-[color:var(--ink)]">webinar</span>,{' '}
          <span className="font-medium text-[color:var(--ink)]">product</span>, or{' '}
          <span className="font-medium text-[color:var(--ink)]">meetup</span>.
        </div>
      </div>
    </div>
  )
}


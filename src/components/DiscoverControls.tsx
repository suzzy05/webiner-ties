'use client'

import { useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from './Input'
import { cn } from '@/lib/cn'

function setParam(params: URLSearchParams, key: string, value: string) {
  if (!value) params.delete(key)
  else params.set(key, value)
}

/**
 * Client-side filter controls for `/discover`.
 *
 * We keep this as a Client Component because it depends on URL state and
 * interactive inputs. The page itself stays server-rendered for fast load.
 */
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

  return (
    <div className={cn('grid gap-3 sm:grid-cols-3', props.className)}>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-[color:var(--ink-muted)]">
          Search
        </label>
        <Input
          value={q}
          disabled={disabled}
          placeholder="Search events, webinars, tags…"
          onChange={(e) => {
            const next = new URLSearchParams(sp)
            setParam(next, 'q', e.target.value)
            push(next)
          }}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[color:var(--ink-muted)]">
          Venue
        </label>
        <select
          value={venue}
          disabled={disabled}
          onChange={(e) => {
            const next = new URLSearchParams(sp)
            setParam(next, 'venue', e.target.value)
            push(next)
          }}
          className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
        >
          <option value="">Any</option>
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In-person</option>
          <option value="HYBRID">Hybrid</option>
        </select>
      </div>
      <div className="sm:col-span-3">
        <label className="mb-1 block text-xs font-medium text-[color:var(--ink-muted)]">
          Tag
        </label>
        <Input
          value={tag}
          disabled={disabled}
          placeholder={tagPlaceholder}
          onChange={(e) => {
            const next = new URLSearchParams(sp)
            setParam(next, 'tag', e.target.value)
            push(next)
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

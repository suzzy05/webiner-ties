'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Region } from '@/data/homeDiscover'

function pickDefault(regions: Region[]) {
  if (regions.length === 0) return null
  return regions[0]
}

/**
 * Local/region explorer used on the homepage.
 *
 * This is deliberately data-driven:
 * - No stock photos
 * - No random counts
 * - Regions and cities come from `src/data/homeDiscover.ts`
 */
export function LocalEventsExplorer(props: {
  regions: Region[]
  className?: string
}) {
  const defaultRegion = useMemo(() => pickDefault(props.regions), [props.regions])
  const [activeKey, setActiveKey] = useState<string>(defaultRegion?.key ?? '')

  const active = useMemo(() => {
    return props.regions.find((r) => r.key === activeKey) ?? defaultRegion
  }, [activeKey, defaultRegion, props.regions])

  if (!active) return null

  return (
    <div className={cn('w-full', props.className)}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {props.regions.map((r) => {
          const isActive = r.key === active.key
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => setActiveKey(r.key)}
              className={cn(
                'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-[color:var(--brand)] bg-[color:var(--brand)] text-white'
                  : 'border-[color:var(--stroke)] bg-white text-[color:var(--ink-muted)] hover:bg-[color:var(--paper-muted)] hover:text-[color:var(--ink)]',
              )}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {active.cities.map((c) => (
          <Link
            key={c.name}
            href={`/discover?q=${encodeURIComponent(c.name)}`}
            className="tv-card group flex items-center justify-between gap-3 px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-10 w-10 rounded-2xl border border-[color:var(--stroke)] bg-[color:color-mix(in_oklab,var(--brand),white_88%)]" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                  {c.name}
                </div>
                <div className="text-xs text-[color:var(--ink-muted)]">
                  Browse events near you
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[color:var(--brand)]">
              View →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}


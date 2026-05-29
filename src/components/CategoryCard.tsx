import Link from 'next/link'
import type { Category } from '@/data/homeDiscover'
import { cn } from '@/lib/cn'

/**
 * A small, scan-friendly category tile.
 * It routes to `/discover` with a `tag` prefilled to keep the UX simple.
 */
export function CategoryCard(props: { category: Category; className?: string }) {
  const Icon = props.category.icon

  return (
    <Link
      href={`/discover?tag=${encodeURIComponent(props.category.discoverTag ?? props.category.key)}`}
      className={cn(
        'tv-card tv-card-muted flex items-center gap-4 px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        props.className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-[color:var(--stroke)]">
        <Icon className="h-5 w-5 text-[color:var(--brand)]" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[color:var(--ink)]">
          {props.category.title}
        </div>
        <div className="mt-0.5 truncate text-xs text-[color:var(--ink-muted)]">
          Explore {props.category.title.toLowerCase()} events
        </div>
      </div>
    </Link>
  )
}

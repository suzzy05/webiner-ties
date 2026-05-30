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
        'tv-card tv-card-hover flex items-center gap-4 rounded-[22px] px-5 py-4 transition-all hover:-translate-y-0.5',
        props.className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[color:var(--surface-container-highest)]">
        <Icon className="h-5 w-5 text-[color:var(--ink-highlight)]" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[color:var(--ink)]">
          {props.category.title}
        </div>
        <div className="mt-0.5 truncate text-xs text-[color:var(--ink-muted)]">
          Browse {props.category.title.toLowerCase()}
        </div>
      </div>
    </Link>
  )
}

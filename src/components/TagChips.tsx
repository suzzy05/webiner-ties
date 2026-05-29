import { cn } from '@/lib/cn'

export function TagChips(props: {
  tags: string[]
  className?: string
  max?: number
}) {
  const max = props.max ?? 4
  const shown = props.tags.slice(0, max)
  const remaining = props.tags.length - shown.length

  if (shown.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', props.className)}>
      {shown.map((t) => (
        <span
          key={t}
          className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-2.5 py-1 text-xs text-[color:var(--ink-muted)]"
        >
          {t}
        </span>
      ))}
      {remaining > 0 ? (
        <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-2.5 py-1 text-xs text-[color:var(--ink-muted)]">
          +{remaining}
        </span>
      ) : null}
    </div>
  )
}

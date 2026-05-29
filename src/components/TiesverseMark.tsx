import { cn } from '@/lib/cn'

/**
 * A lightweight wordmark-style logo.
 *
 * We keep it as text (not an image) so it stays crisp, themeable, and easy to
 * tweak without introducing asset pipelines.
 */
export function TiesverseMark(props: { className?: string; subtitle?: string }) {
  return (
    <div className={cn('leading-none select-none', props.className)}>
      <div className="flex items-baseline font-bold tracking-tight">
        <span className="text-[18px] text-[color:var(--ink)]">.</span>
        <span className="text-[18px] text-[color:var(--brand)]">ties</span>
        <span className="text-[18px] text-[color:var(--ink)]">verse</span>
      </div>
      {props.subtitle ? (
        <div className="mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-[color:var(--ink-muted)] uppercase">
          {props.subtitle}
        </div>
      ) : null}
    </div>
  )
}

import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-[color:var(--paper)]'

const variants = {
  solid:
    'bg-[color:var(--brand)] text-white shadow-sm hover:bg-[color:var(--brand-600)]',
  outline:
    'border border-[color:var(--stroke-strong)] bg-transparent text-[color:var(--ink)] hover:bg-[color:var(--paper-muted)]',
  ghost: 'text-[color:var(--ink)] hover:bg-[color:var(--paper-muted)]',
} as const

export function Button({
  className,
  variant = 'solid',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
}) {
  return (
    <button
      className={cn(base, variants[variant], 'h-10 px-4 py-2', className)}
      {...props}
    />
  )
}

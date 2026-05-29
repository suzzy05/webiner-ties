import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none placeholder:text-[color:var(--ink-muted)] focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]',
        className,
      )}
      {...props}
    />
  )
}

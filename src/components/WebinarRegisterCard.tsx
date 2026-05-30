'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { RegistrationModal } from '@/components/RegistrationModal'

export function WebinarRegisterCard(props: {
  eventSlug: string
  title: string
  dateLine: string
  timeLine: string
  priceLabel: string
  badge?: string
  footnote?: string
  ctaLabel?: string
  href?: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ctaLabel = props.ctaLabel ?? 'Next Step'
  const href = props.href ?? null

  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-[28px] border border-white/10 bg-[color:var(--surface-container-highest)]',
          props.className,
        )}
      >
        <div className="px-6 pb-6 pt-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="h-1 rounded-full bg-[color:var(--ink-highlight)]" />
            <div className="h-1 rounded-full bg-white/10" />
            <div className="h-1 rounded-full bg-white/10" />
          </div>

          <h3 className="mt-6 text-xl font-semibold text-[color:var(--ink)]">Personal Info</h3>
          <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Let&apos;s start with the basics.</p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] px-4 py-3 text-sm text-[color:var(--ink-muted)]">
              Enter your full name
            </div>
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] px-4 py-3 text-sm text-[color:var(--ink-muted)]">
              Enter your email
            </div>
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] px-4 py-3 text-sm text-[color:var(--ink-muted)]">
              Include country code (e.g. +91)
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/10 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="tv-label">Ticket price</div>
              <div className="mt-1 text-lg font-semibold text-[color:var(--ink)]">{props.priceLabel}</div>
            </div>
            {href ? (
              <a href={href} className="tv-btn tv-btn-primary px-7 py-3">
                {ctaLabel}
              </a>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsOpen(true)
                }}
                className="tv-btn tv-btn-primary px-7 py-3"
              >
                {ctaLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen ? (
        <RegistrationModal
          eventSlug={props.eventSlug}
          title={props.title}
          dateStr={props.dateLine}
          timeStr={props.timeLine}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  )
}

'use client'

import { useState } from 'react'
import { RegistrationModal } from './RegistrationModal'
import { cn } from '@/lib/cn'

/**
 * Event detail CTA.
 *
 * For now every event is treated like a "free RSVP" (no payments). Once you
 * add tickets later, this can become "Starting from ₹…" etc.
 */
export function RegisterButton(props: {
  eventSlug: string
  title: string
  dateStr: string
  timeStr: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={cn('tv-card tv-card-muted p-5 shadow-sm', props.className)}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="tv-kicker text-[10px] font-semibold text-[color:var(--ink-muted)]">
              Admission
            </div>
            <div className="mt-1 text-2xl font-bold text-[color:var(--ink)]">
              Free
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsOpen(true)
            }}
            className="rounded-full border border-[color:var(--brand)] bg-white px-6 py-2.5 text-sm font-semibold text-[color:var(--brand)] shadow-sm transition-colors hover:bg-[color:color-mix(in_oklab,var(--brand),white_85%)]"
          >
            Register
          </button>
        </div>
      </div>

      {isOpen ? (
        <RegistrationModal
          eventSlug={props.eventSlug}
          title={props.title}
          dateStr={props.dateStr}
          timeStr={props.timeStr}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  )
}


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
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className={cn(
          'border-2 border-[color:var(--on-background)] bg-[color:var(--surface)] p-6 shadow-[8px_8px_0px_0px_rgba(141,23,0,1)]',
          props.className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)]">
              Price
            </p>
            <h2 className="mt-2 font-display text-[36px] font-extrabold uppercase tracking-tighter text-[color:var(--primary)]">
              {props.priceLabel}
            </h2>
          </div>
          {props.badge ? (
            <div className="bg-[color:var(--primary-container)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--on-primary)]">
              {props.badge}
            </div>
          ) : null}
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[color:var(--primary)]">
              calendar_today
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)]">
                Date
              </p>
              <p className="text-[16px] font-bold text-[color:var(--on-background)]">
                {props.dateLine}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[color:var(--primary)]">
              schedule
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)]">
                Time
              </p>
              <p className="text-[16px] font-bold text-[color:var(--on-background)]">
                {props.timeLine}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(true)
          }}
          className="group flex w-full items-center justify-center gap-4 border-2 border-[color:var(--on-background)] bg-[color:var(--secondary-container)] py-6 text-[20px] font-semibold uppercase text-[color:var(--on-secondary-fixed)] shadow-[4px_4px_0px_0px_rgba(27,28,27,1)] transition-all duration-300 hover:bg-[color:var(--primary)] hover:text-[color:var(--on-primary)] active:shadow-none"
        >
          Register Now
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>

        {props.footnote ? (
          <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)] opacity-60">
            {props.footnote}
          </p>
        ) : null}
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

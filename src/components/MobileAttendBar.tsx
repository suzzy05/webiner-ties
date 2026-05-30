'use client'

import { useState } from 'react'
import { RegistrationModal } from './RegistrationModal'

export function MobileAttendBar(props: {
  eventSlug: string
  title: string
  dateStr: string
  timeStr: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Sticky bottom bar — mobile only */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Gradient fade above the bar */}
        <div className="pointer-events-none absolute inset-x-0 top-[-40px] h-10 bg-gradient-to-t from-[#09090b]/80 to-transparent" />

        <div
          className="relative flex items-center gap-3 border-t px-4 py-3"
          style={{
            background: 'rgba(9,9,11,0.92)',
            borderColor: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Left: event info */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[color:var(--ink-muted)]">
              Webinar
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-[color:var(--ink)] truncate leading-snug">
              {props.title}
            </p>
            <p className="text-[11px] text-[color:var(--ink-muted)] mt-0.5">{props.dateStr}</p>
          </div>

          {/* Right: CTA */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-xl px-5 py-3 text-[14px] font-bold"
            style={{
              background: 'var(--accent)',
              color: '#09090b',
              boxShadow: '0 2px 16px rgba(228,213,160,0.25)',
            }}
          >
            Attend
          </button>
        </div>
      </div>

      {open ? (
        <RegistrationModal
          eventSlug={props.eventSlug}
          title={props.title}
          dateStr={props.dateStr}
          timeStr={props.timeStr}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { RegistrationPanel } from './RegistrationPanel'

export function AttendWebinarCard(props: {
  eventSlug: string
  title: string
  dateLine: string
  timeLine: string
  venueType: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  locationText?: string | null
  className?: string
}) {
  const [mode, setMode] = useState<'details' | 'form'>('details')

  const venueLabel = useMemo(() => {
    if (props.venueType === 'ONLINE') return 'Virtual'
    if (props.venueType === 'IN_PERSON') return 'In person'
    return 'Hybrid'
  }, [props.venueType])

  return (
    <div className={cn('overflow-hidden rounded-[28px] border border-white/10 bg-[color:var(--surface-container-highest)]', props.className)}>
      {mode === 'details' ? (
        <div className="px-6 pb-6 pt-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="h-1 rounded-full bg-[color:var(--ink-highlight)]" />
            <div className="h-1 rounded-full bg-white/10" />
            <div className="h-1 rounded-full bg-white/10" />
          </div>

          <h3 className="mt-6 text-xl font-semibold text-[color:var(--ink)]">Webinar Details</h3>
          <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Date, time, and how to join.</p>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] px-4 py-3">
              <div className="tv-label">Date</div>
              <div className="mt-1 text-sm font-medium text-[color:var(--ink)]">{props.dateLine}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] px-4 py-3">
              <div className="tv-label">Time</div>
              <div className="mt-1 text-sm font-medium text-[color:var(--ink)]">{props.timeLine}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[color:var(--card)] px-4 py-3">
              <div className="tv-label">Location</div>
              <div className="mt-1 text-sm font-medium text-[color:var(--ink)]">
                {props.locationText ? props.locationText : venueLabel}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="tv-label">Ticket price</div>
                <div className="mt-1 text-lg font-semibold text-[color:var(--ink)]">FREE</div>
              </div>
              <button type="button" onClick={() => setMode('form')} className="tv-btn tv-btn-primary px-7 py-3">
                Attend webinar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <RegistrationPanel
            eventSlug={props.eventSlug}
            title={props.title}
            dateStr={props.dateLine}
            timeStr={props.timeLine}
            onDone={() => {}}
          />
          <div className="mt-3">
            <button type="button" onClick={() => setMode('details')} className="tv-btn w-full py-3">
              Back to details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

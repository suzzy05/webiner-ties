'use client'

import { useMemo, useState, useTransition } from 'react'

type Status =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string }

/**
 * Minimal RSVP form.
 *
 * Note:
 * RSVPs are stored in the app database (see `src/server/rsvps.ts`).
 */
export function RsvpForm(props: { eventSlug: string }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [isPending, startTransition] = useTransition()

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }, [email])

  const submit = () => {
    startTransition(async () => {
      setStatus({ kind: 'saving' })
      const res = await fetch(`/api/events/${props.eventSlug}/rsvps`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok) {
        setStatus({
          kind: 'error',
          message: json?.error ?? 'Could not RSVP. Please try again.',
        })
        return
      }
      setStatus({ kind: 'ok' })
    })
  }

  if (status.kind === 'ok') {
    return (
      <div className="rsvp-simple-card">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/25">
            <span className="material-symbols-outlined text-[22px] text-emerald-400">check_circle</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[color:var(--ink)]">You&apos;re in!</p>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
              Your spot has been reserved.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rsvp-simple-card">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--accent-dim)]">
          <span className="material-symbols-outlined text-[18px] text-[color:var(--accent)]">event_available</span>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[color:var(--ink)]">Quick RSVP</p>
          <p className="text-xs text-[color:var(--ink-muted)]">Reserve your spot instantly</p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Name field */}
        <div className="rsvp-field">
          <label htmlFor="rsvp-name">
            Name <span className="font-normal text-[color:var(--ink-subtle)] normal-case tracking-normal" style={{fontSize:'0.65rem'}}>(optional)</span>
          </label>
          <input
            id="rsvp-name"
            value={name}
            disabled={isPending}
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
            className="tv-input"
          />
        </div>

        {/* Email field */}
        <div className="rsvp-field">
          <label htmlFor="rsvp-email">
            Email <span className="rsvp-required">*</span>
          </label>
          <input
            id="rsvp-email"
            value={email}
            disabled={isPending}
            placeholder="you@example.com"
            inputMode="email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="tv-input"
          />
        </div>

        {/* Error state */}
        {status.kind === 'error' ? (
          <div className="rsvp-error">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{status.message}</span>
          </div>
        ) : null}

        {/* Submit button */}
        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={submit}
          className="tv-btn tv-btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Reserving…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Reserve my spot
            </>
          )}
        </button>
      </div>
    </div>
  )
}

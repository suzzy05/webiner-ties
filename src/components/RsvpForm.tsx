'use client'

import { useMemo, useState, useTransition } from 'react'
import { Button } from './Button'
import { Input } from './Input'

type Status =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string }

/**
 * Minimal RSVP form.
 *
 * Note:
 * RSVPs are stored in-memory on the server right now (see `src/server/rsvps.ts`),
 * so the count resets when the dev server restarts.
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

  return (
    <div className="tv-card tv-card-muted p-5 shadow-sm">
      <div className="text-sm font-semibold text-[color:var(--ink)]">RSVP</div>
      <div className="mt-1 text-sm text-[color:var(--ink-muted)]">
        Quick demo RSVP. This project doesn’t send emails yet.
      </div>

      <div className="mt-4 grid gap-3">
        <Input
          value={name}
          disabled={isPending}
          placeholder="Name (optional)"
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          value={email}
          disabled={isPending}
          placeholder="Email"
          inputMode="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button disabled={!canSubmit || isPending} onClick={submit}>
          {isPending ? 'Saving…' : 'Reserve spot'}
        </Button>

        {status.kind === 'ok' ? (
          <div className="rounded-xl border border-emerald-600/30 bg-emerald-500/10 p-3 text-sm text-emerald-900">
            RSVP saved (for this dev server session).
          </div>
        ) : null}
        {status.kind === 'error' ? (
          <div className="rounded-xl border border-rose-600/30 bg-rose-500/10 p-3 text-sm text-rose-900">
            {status.message}
          </div>
        ) : null}
      </div>
    </div>
  )
}


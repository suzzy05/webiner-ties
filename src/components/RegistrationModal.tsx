'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type FieldType = 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea'
type Step = 'personal' | 'professional' | 'final' | 'ticket'

type Question = {
  id: string
  step: Step | string
  ord: number
  key: string | null
  label: string
  fieldType: FieldType
  required: boolean
  options?: string[]
  placeholder?: string
}

function StepPill(props: {
  label: string
  active: boolean
  done: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
        props.active
          ? 'border-[color:var(--brand)] bg-[color:color-mix(in_oklab,var(--brand),white_88%)] text-[color:var(--brand)]'
          : 'border-[color:var(--stroke)] bg-white text-[color:var(--ink-muted)] hover:bg-[color:var(--paper-muted)]',
      )}
    >
      {props.done ? (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--brand)] text-white">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      ) : (
        <span className="h-2 w-2 rounded-full bg-[color:var(--stroke-strong)]" />
      )}
      {props.label}
    </button>
  )
}

function inputClassName() {
  return 'h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none placeholder:text-[color:var(--ink-muted)] focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]'
}

function textareaClassName() {
  return 'min-h-28 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] shadow-sm outline-none placeholder:text-[color:var(--ink-muted)] focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]'
}

function keyToStructuredKey(key: string) {
  // Keys are stored in DB for default questions.
  // We map to the payload expected by the RSVP endpoint.
  switch (key) {
    case 'full_name':
      return 'fullName'
    case 'email':
      return 'email'
    case 'whatsapp':
      return 'whatsapp'
    case 'role':
      return 'role'
    case 'org':
      return 'org'
    case 'country':
      return 'country'
    case 'city':
      return 'city'
    case 'heard_from':
      return 'heardFrom'
    case 'hope_to_learn':
      return 'hopeToLearn'
    default:
      return null
  }
}

export function RegistrationModal(props: {
  eventSlug: string
  title: string
  dateStr: string
  timeStr: string
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>('personal')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [ticket, setTicket] = useState<{
    ticketId: string
    createdAt: string
  } | null>(null)
  const [loadErr, setLoadErr] = useState<string>('')
  const [submitErr, setSubmitErr] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const grouped = useMemo(() => {
    const by: Record<string, Question[]> = {}
    for (const q of questions) {
      const s = q.step || 'final'
      by[s] = by[s] ?? []
      by[s].push(q)
    }
    for (const k of Object.keys(by)) {
      by[k] = by[k].slice().sort((a, b) => a.ord - b.ord)
    }
    return by
  }, [questions])

  const steps: Step[] = ['personal', 'professional', 'final', 'ticket']

  const isDone = (s: Step) => {
    if (s === 'ticket') return ticket != null
    const idx = steps.indexOf(step)
    return steps.indexOf(s) < idx
  }

  const currentQuestions = useMemo(() => {
    if (step === 'ticket') return []
    return grouped[step] ?? []
  }, [grouped, step])

  const missingRequired = useMemo(() => {
    if (step === 'ticket') return []
    return currentQuestions
      .filter((q) => q.required)
      .filter((q) => (answers[q.id] ?? '').trim() === '')
  }, [answers, currentQuestions, step])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [props])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch(`/api/events/${props.eventSlug}/form`)
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok) {
        if (cancelled) return
        setLoadErr(json?.error ?? 'Could not load RSVP form.')
        return
      }
      const qs = (json?.questions ?? []) as Question[]
      if (cancelled) return
      setQuestions(qs)
      const initial: Record<string, string> = {}
      for (const q of qs) initial[q.id] = ''
      setAnswers(initial)
    })()
    return () => {
      cancelled = true
    }
  }, [props.eventSlug])

  const setValue = (id: string, v: string) => {
    setAnswers((prev) => ({ ...prev, [id]: v }))
  }

  const canNext = step === 'ticket' ? false : missingRequired.length === 0

  const next = () => {
    if (step === 'personal') return setStep('professional')
    if (step === 'professional') return setStep('final')
    if (step === 'final') return setStep('ticket')
  }

  const back = () => {
    if (step === 'professional') return setStep('personal')
    if (step === 'final') return setStep('professional')
    if (step === 'ticket') return setStep('final')
  }

  const submit = () => {
    setSubmitErr('')
    startTransition(async () => {
      // Build structured payload from keys.
      const structured: any = {}
      for (const q of questions) {
        if (!q.key) continue
        const sk = keyToStructuredKey(q.key)
        if (!sk) continue
        structured[sk] = (answers[q.id] ?? '').trim()
      }

      const res = await fetch(`/api/events/${props.eventSlug}/rsvps`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ structured, answers }),
      })
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok) {
        setSubmitErr(json?.error ?? 'Could not submit RSVP.')
        return
      }
      setTicket({ ticketId: String(json.ticketId), createdAt: String(json.createdAt) })
    })
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close modal"
        onClick={props.onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div className="relative mx-auto flex min-h-screen max-w-[980px] items-center justify-center p-4 sm:p-8">
        <div className="tv-card w-full overflow-hidden shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-5 py-4">
            <div className="min-w-0">
              <div className="tv-kicker text-[10px] font-semibold text-[color:var(--ink-muted)]">
                {props.dateStr} · {props.timeStr}
              </div>
              <div className="truncate text-sm font-semibold text-[color:var(--ink)]">
                {props.title}
              </div>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--stroke)] bg-white text-[color:var(--ink)] shadow-sm transition-colors hover:bg-[color:var(--paper-muted)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <StepPill
                label="Personal"
                active={step === 'personal'}
                done={isDone('personal')}
                onClick={() => setStep('personal')}
              />
              <StepPill
                label="Professional"
                active={step === 'professional'}
                done={isDone('professional')}
                onClick={() => setStep('professional')}
              />
              <StepPill
                label="Final"
                active={step === 'final'}
                done={isDone('final')}
                onClick={() => setStep('final')}
              />
              <StepPill
                label="Ticket"
                active={step === 'ticket'}
                done={ticket != null}
                onClick={() => setStep('ticket')}
              />
            </div>
          </div>

          <div className="px-5 pb-5 pt-4">
            {loadErr ? (
              <div className="rounded-xl border border-rose-600/30 bg-rose-500/10 p-3 text-sm text-rose-900">
                {loadErr}
              </div>
            ) : null}

            {step !== 'ticket' ? (
              <div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {currentQuestions.map((q) => (
                    <div key={q.id} className={q.fieldType === 'textarea' ? 'sm:col-span-2' : ''}>
                      <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                        {q.label}
                        {q.required ? <span className="text-[color:var(--brand)]"> *</span> : null}
                      </label>

                      {q.fieldType === 'select' ? (
                        <select
                          value={answers[q.id] ?? ''}
                          onChange={(e) => setValue(q.id, e.target.value)}
                          className={inputClassName()}
                        >
                          <option value="">Select…</option>
                          {(q.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : q.fieldType === 'textarea' ? (
                        <textarea
                          value={answers[q.id] ?? ''}
                          onChange={(e) => setValue(q.id, e.target.value)}
                          className={textareaClassName()}
                          placeholder={q.placeholder}
                        />
                      ) : (
                        <input
                          value={answers[q.id] ?? ''}
                          onChange={(e) => setValue(q.id, e.target.value)}
                          type={q.fieldType === 'tel' ? 'tel' : q.fieldType}
                          className={inputClassName()}
                          placeholder={q.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {submitErr ? (
                  <div className="mt-5 rounded-xl border border-rose-600/30 bg-rose-500/10 p-3 text-sm text-rose-900">
                    {submitErr}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 'ticket' ? (
              <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-start">
                <div className="tv-card tv-card-muted p-5 shadow-sm">
                  <div className="text-sm font-semibold text-[color:var(--ink)]">
                    Your ticket
                  </div>
                  <div className="mt-2 text-sm text-[color:var(--ink-muted)]">
                    {ticket ? 'Booking confirmed.' : 'Submit the form to generate a ticket.'}
                  </div>

                  <div className="mt-4 tv-divider" />

                  <div className="mt-4 space-y-2 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
                        Ticket ID
                      </div>
                      <div className="mt-1 font-semibold text-[color:var(--ink)]">
                        {ticket ? ticket.ticketId : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
                        Event
                      </div>
                      <div className="mt-1 font-semibold text-[color:var(--ink)]">
                        {props.title}
                      </div>
                      <div className="mt-1 text-xs text-[color:var(--ink-muted)]">
                        {props.dateStr} · {props.timeStr}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 tv-divider" />

                  <div className="mt-4 text-xs text-[color:var(--ink-muted)]">
                    Tip: keep this ticket id for entry verification.
                  </div>
                </div>

                <div className="tv-card p-5 shadow-sm">
                  <div className="text-sm font-semibold text-[color:var(--ink)]">
                    Confirm &amp; book
                  </div>
                  <div className="mt-2 text-sm text-[color:var(--ink-muted)]">
                    We store your details in the local SQL database for this demo.
                  </div>

                  <button
                    type="button"
                    disabled={isPending || ticket != null}
                    onClick={submit}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--brand-600)] disabled:opacity-45"
                  >
                    {ticket ? 'Booked' : isPending ? 'Booking…' : 'Complete booking'}
                  </button>

                  {ticket ? (
                    <button
                      type="button"
                      onClick={props.onClose}
                      className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-[color:var(--stroke)] bg-white px-6 text-sm font-semibold text-[color:var(--ink)] shadow-sm transition-colors hover:bg-[color:var(--paper-muted)]"
                    >
                      Close
                    </button>
                  ) : null}

                  {submitErr ? (
                    <div className="mt-4 rounded-xl border border-rose-600/30 bg-rose-500/10 p-3 text-sm text-rose-900">
                      {submitErr}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[color:var(--stroke)] bg-white px-5 py-4">
            <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
              {missingRequired.length > 0
                ? `Missing ${missingRequired.length} required field(s)`
                : 'All set'}
            </div>
            <div className="flex items-center gap-2">
              {step !== 'personal' ? (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--stroke)] bg-white px-4 text-sm font-semibold text-[color:var(--ink)] shadow-sm transition-colors hover:bg-[color:var(--paper-muted)]"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Back
                </button>
              ) : null}

              {step !== 'ticket' ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canNext || questions.length === 0}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--brand)] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--brand-600)] disabled:opacity-45"
                >
                  Next
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

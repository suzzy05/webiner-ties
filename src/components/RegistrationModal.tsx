'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { createPortal } from 'react-dom'

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

function keyToStructuredKey(key: string) {
  switch (key) {
    case 'full_name': return 'fullName'
    case 'email': return 'email'
    case 'whatsapp': return 'whatsapp'
    case 'role': return 'role'
    case 'org': return 'org'
    case 'country': return 'country'
    case 'city': return 'city'
    case 'heard_from': return 'heardFrom'
    case 'hope_to_learn': return 'hopeToLearn'
    default: return null
  }
}

function inputClassName() { return 'tv-input' }
function textareaClassName() { return 'tv-input h-auto min-h-32 py-3' }

/** Simple deterministic barcode from a string value */
function TicketBarcode({ value }: { value: string }) {
  const chars = value.replace(/\s/g, '').slice(0, 28)
  const segments: Array<{ isBar: boolean; w: number }> = [{ isBar: false, w: 4 }]
  for (let i = 0; i < chars.length; i++) {
    const c = chars.charCodeAt(i)
    segments.push({ isBar: true, w: (c % 3) + 1 })
    segments.push({ isBar: false, w: ((c >> 2) % 2) + 1 })
  }
  segments.push({ isBar: false, w: 4 })
  const totalW = segments.reduce((s, seg) => s + seg.w, 0)
  let x = 0
  const bars: Array<{ x: number; w: number }> = []
  for (const seg of segments) {
    if (seg.isBar) bars.push({ x, w: seg.w })
    x += seg.w
  }
  return (
    <svg width="100%" height="52" viewBox={`0 0 ${totalW} 44`} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={44} fill="#111" />)}
    </svg>
  )
}

function StepBlock(props: { index: number; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn('rsvp-step-btn', props.active ? 'active' : null)}
    >
      <span className="rsvp-step-num">{props.index + 1}</span>
      {props.label}
    </button>
  )
}

export function RegistrationModal(props: {
  eventSlug: string
  title: string
  dateStr: string
  timeStr: string
  onClose: () => void
}) {
  const [isShown, setIsShown] = useState(false)
  const [step, setStep] = useState<Step>('personal')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [ticket, setTicket] = useState<{ ticketId: string; createdAt: string } | null>(null)
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

  const primarySteps: Step[] = ['personal', 'professional', 'final']
  const activePrimaryStep: Step = step === 'ticket' ? 'final' : step

  const stepTitle =
    step === 'personal' ? 'Personal Details'
    : step === 'professional' ? 'Professional Details'
    : step === 'final' ? 'Goals'
    : 'Confirmation'

  const currentQuestions = useMemo(() => {
    if (step === 'ticket') return []
    return grouped[step] ?? []
  }, [grouped, step])

  const missingRequired = useMemo(() => {
    if (step === 'ticket') return []
    return currentQuestions.filter((q) => q.required).filter((q) => (answers[q.id] ?? '').trim() === '')
  }, [answers, currentQuestions, step])

  const canNext = missingRequired.length === 0 && currentQuestions.length > 0
  const ticketId = ticket?.ticketId ?? '—'

  const attendeeName = useMemo(() => {
    const q = questions.find((q) => q.key === 'full_name')
    return q ? (answers[q.id] ?? '').trim() : ''
  }, [questions, answers])

  const attendeeEmail = useMemo(() => {
    const q = questions.find((q) => q.key === 'email')
    return q ? (answers[q.id] ?? '').trim() : ''
  }, [questions, answers])

  function setValue(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function next() {
    if (!canNext) return
    if (step === 'personal') setStep('professional')
    else if (step === 'professional') setStep('final')
    else if (step === 'final') submit()
  }

  const requestClose = useCallback(() => {
    setIsShown(false)
    window.setTimeout(() => props.onClose(), 220)
  }, [props.onClose])

  async function submit() {
    setSubmitErr('')
    startTransition(async () => {
      const structured: Record<string, string> = {}
      for (const q of questions) {
        const key = q.key ? keyToStructuredKey(q.key) : null
        if (!key) continue
        structured[key] = (answers[q.id] ?? '').trim()
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
      setStep('ticket')
    })
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') requestClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [requestClose])

  useEffect(() => {
    const id = window.setTimeout(() => setIsShown(true), 10)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadErr('')
      try {
        const res = await fetch(`/api/events/${props.eventSlug}/form`)
        const json = (await res.json().catch(() => null)) as any
        if (!res.ok) throw new Error(json?.error ?? 'Could not load RSVP form.')
        if (cancelled) return
        setQuestions((json?.questions ?? []) as Question[])
      } catch (err: any) {
        if (cancelled) return
        setLoadErr(err?.message ?? 'Could not load RSVP form.')
      }
    })()
    return () => { cancelled = true }
  }, [props.eventSlug])

  const modal = (
    <div
      className="fixed inset-0 z-[1000]"
      onClick={(e) => { if (e.target === e.currentTarget) requestClose() }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/65" />

      <div className="relative flex min-h-screen w-full items-stretch justify-end p-0 sm:p-4">
        <div
          className={cn(
            'relative w-full max-h-[100vh] overflow-hidden rounded-none border border-white/10 bg-[color:var(--card)] shadow-[0_24px_80px_rgba(0,0,0,0.70)] transition-transform duration-300 ease-out sm:max-h-[calc(100vh-32px)] sm:rounded-[28px] sm:w-[520px]',
            isShown ? 'translate-x-0' : 'translate-x-full',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-[color:var(--ink)] transition-colors hover:bg-black/50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Step tabs — hidden on ticket confirmation */}
          {step !== 'ticket' ? (
            <div className="rsvp-steps sticky top-0 z-10">
              <StepBlock index={0} label="PERSONAL" active={activePrimaryStep === 'personal'} onClick={() => setStep('personal')} />
              <StepBlock index={1} label="PROFESSIONAL" active={activePrimaryStep === 'professional'} onClick={() => setStep('professional')} />
              <StepBlock index={2} label="GOALS" active={activePrimaryStep === 'final'} onClick={() => setStep('final')} />
            </div>
          ) : null}

          {/* Scrollable content */}
          <div className="tv-scrollbar relative max-h-[100vh] overflow-y-auto overflow-x-hidden p-5 sm:p-8" style={{ maxHeight: step === 'ticket' ? '100vh' : 'calc(100vh - 56px)' }}>

            {/* ── Form steps ── */}
            {step !== 'ticket' ? (
              <div>
                <div className="mb-2 text-sm text-[color:var(--ink-muted)]">{props.dateStr}</div>
                <div className="mb-8 text-[18px] font-semibold text-[color:var(--ink)] sm:text-[20px]">{props.title}</div>

                {loadErr ? (
                  <div className="rsvp-error mb-6">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{loadErr}</span>
                  </div>
                ) : null}

                <div className="space-y-2 mb-8">
                  <h2 className="text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">{stepTitle}</h2>
                  <div className="h-[2px] w-10 rounded-full bg-[color:var(--accent)]" />
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {currentQuestions.map((q) => (
                    <div key={q.id} className="rsvp-field">
                      <label>
                        {q.label}
                        {q.required ? <span className="rsvp-required">*</span> : null}
                      </label>
                      {q.fieldType === 'select' ? (
                        <select value={answers[q.id] ?? ''} onChange={(e) => setValue(q.id, e.target.value)} className={inputClassName()}>
                          <option value="">Select...</option>
                          {(q.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : q.fieldType === 'textarea' ? (
                        <textarea value={answers[q.id] ?? ''} onChange={(e) => setValue(q.id, e.target.value)} className={textareaClassName()} placeholder={q.placeholder} />
                      ) : (
                        <input value={answers[q.id] ?? ''} onChange={(e) => setValue(q.id, e.target.value)} type={q.fieldType === 'tel' ? 'tel' : q.fieldType} className={inputClassName()} placeholder={q.placeholder} />
                      )}
                      {missingRequired.some((m) => m.id === q.id) ? (
                        <div className="text-xs text-[color:var(--accent)]">This field is required</div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {submitErr ? (
                  <div className="rsvp-error mt-6">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{submitErr}</span>
                  </div>
                ) : null}

                <div className="mt-8 flex flex-col gap-3">
                  {/* Back button on non-first steps */}
                  {step !== 'personal' ? (
                    <button
                      type="button"
                      onClick={() => setStep(primarySteps[Math.max(0, primarySteps.indexOf(step) - 1)] ?? 'personal')}
                      disabled={isPending}
                      className="tv-btn w-full py-3.5 disabled:opacity-50"
                    >
                      Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canNext || questions.length === 0 || isPending}
                    className="tv-btn tv-btn-primary w-full py-3.5 disabled:opacity-40"
                  >
                    {isPending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        Submitting…
                      </>
                    ) : step === 'final' ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        Register Now
                      </>
                    ) : (
                      <>
                        Continue
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {/* ── Ticket confirmation ── */}
            {step === 'ticket' && ticket ? (
              <div className="flex flex-col items-center pt-4 pb-2">
                {/* White physical ticket card */}
                <div className="tv-ticket-card w-full max-w-sm">
                  {/* Header section */}
                  <div className="tv-ticket-section text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <h2 className="text-[22px] font-bold text-[#0d0d0d] tracking-tight">Thank you!</h2>
                    <p className="mt-1 text-[13px] text-[rgba(0,0,0,0.5)]">Your ticket has been issued successfully</p>
                  </div>

                  <hr className="tv-ticket-dashes" />

                  {/* Ticket ID + Amount */}
                  <div className="tv-ticket-section grid grid-cols-2 gap-4">
                    <div>
                      <div className="tv-ticket-label">Ticket ID</div>
                      <div className="tv-ticket-value text-[13px]">{ticketId}</div>
                    </div>
                    <div className="text-right">
                      <div className="tv-ticket-label">Amount</div>
                      <div className="tv-ticket-value">FREE</div>
                    </div>
                  </div>

                  <hr className="tv-ticket-dashes" />

                  {/* Attendee + Status */}
                  <div className="tv-ticket-section grid grid-cols-2 gap-4">
                    <div>
                      <div className="tv-ticket-label">Attendee</div>
                      <div className="tv-ticket-value">{attendeeName || 'Guest'}</div>
                    </div>
                    <div className="text-right">
                      <div className="tv-ticket-label">Status</div>
                      <div className="tv-ticket-confirmed text-[15px]">Confirmed</div>
                    </div>
                  </div>

                  <hr className="tv-ticket-dashes" />

                  {/* WhatsApp CTA */}
                  <div className="tv-ticket-section">
                    <p className="text-[13px] text-[rgba(0,0,0,0.65)] leading-relaxed">
                      <strong className="text-[#0d0d0d]">You&apos;re in.</strong> Join our WhatsApp community for session updates — access details will land in your inbox shortly.
                    </p>
                    <button className="tv-ticket-whatsapp-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Join WhatsApp Community
                    </button>
                  </div>

                  <hr className="tv-ticket-dashes" />

                  {/* Barcode */}
                  <div className="tv-ticket-section pt-4 pb-5">
                    <TicketBarcode value={ticketId} />
                    <p className="mt-2 text-center text-[11px] font-mono text-[rgba(0,0,0,0.4)] tracking-wider">{ticketId}</p>
                  </div>
                </div>

                {/* Close button outside card */}
                <button type="button" onClick={requestClose} className="tv-ticket-close-btn">
                  Close Ticket
                </button>
              </div>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}

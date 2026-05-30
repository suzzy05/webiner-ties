'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
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

function inputClassName() {
  return 'w-full border-[3px] border-[color:var(--on-background)] bg-white p-3 sm:p-4 font-display text-[16px] sm:text-[20px] font-semibold uppercase tracking-tight text-[color:var(--on-background)] outline-none placeholder:text-[color:var(--surface-dim)] transition-shadow focus:shadow-[6px_6px_0px_0px_#1b1c1b]'
}

function textareaClassName() {
  return 'min-h-32 sm:min-h-36 w-full border-[3px] border-[color:var(--on-background)] bg-white p-3 sm:p-4 font-display text-[16px] sm:text-[20px] font-semibold uppercase tracking-tight text-[color:var(--on-background)] outline-none placeholder:text-[color:var(--surface-dim)] transition-shadow focus:shadow-[6px_6px_0px_0px_#1b1c1b]'
}

function StepBlock(props: {
  index: number
  label: string
  active: boolean
  onClick: () => void
  rightBorder?: boolean
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        'p-4 text-left transition-colors',
        props.rightBorder ? 'border-r-[3px] border-[color:var(--on-background)]' : null,
        props.active
          ? 'bg-[color:var(--brand-orange)] text-white'
          : 'bg-[color:var(--surface-container-low)] text-[color:var(--on-surface-variant)] hover:bg-[color:var(--surface-container-high)]',
      )}
    >
      <span className={cn('text-xs font-bold uppercase tracking-[0.1em]', props.active ? 'opacity-80' : 'opacity-60')}>
        STEP {String(props.index + 1).padStart(2, '0')}
      </span>
      <span className="mt-1 block text-[14px] font-bold uppercase tracking-tight">
        {props.label}
      </span>
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
    step === 'personal'
      ? 'Personal Details'
      : step === 'professional'
        ? 'Professional Details'
        : step === 'final'
          ? 'Goals'
          : 'Confirmation'

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

  const canNext = missingRequired.length === 0 && currentQuestions.length > 0
  const ticketId = ticket?.ticketId ?? '—'

  function setValue(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function next() {
    if (!canNext) return
    if (step === 'personal') setStep('professional')
    else if (step === 'professional') setStep('final')
    else if (step === 'final') setStep('ticket')
  }

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
    })
  }

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
    return () => {
      cancelled = true
    }
  }, [props.eventSlug])

  const modal = (
    <div
      className="fixed inset-0 z-[1000]"
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose()
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/45" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[760px] items-center justify-center p-2 sm:p-6">
        <div
          className="relative w-full max-h-[calc(100vh-24px)] overflow-visible border-[3px] border-[color:var(--on-background)] bg-white tv-neo-shadow sm:max-h-[calc(100vh-64px)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute right-0 top-0 z-30 hidden translate-x-[18%] -translate-y-[20%] rotate-12 border-[3px] border-[color:var(--on-background)] bg-[color:var(--primary)] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-primary)] md:block">
            LIMITED ACCESS
          </div>

          <button
            type="button"
            onClick={props.onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center border-[3px] border-[color:var(--on-background)] bg-white text-[color:var(--on-background)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#1b1c1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="sticky top-0 z-10 grid grid-cols-3 border-b-[3px] border-[color:var(--on-background)]">
            <StepBlock
              index={0}
              label="PERSONAL"
              active={activePrimaryStep === 'personal'}
              onClick={() => setStep('personal')}
              rightBorder
            />
            <StepBlock
              index={1}
              label="PROFESSIONAL"
              active={activePrimaryStep === 'professional'}
              onClick={() => setStep('professional')}
              rightBorder
            />
            <StepBlock
              index={2}
              label="GOALS"
              active={activePrimaryStep === 'final'}
              onClick={() => setStep('final')}
            />
          </div>

          <div className="tv-scrollbar relative max-h-[calc(100vh-110px)] overflow-y-auto overflow-x-hidden p-4 sm:max-h-[calc(100vh-150px)] sm:p-8">
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)]">
                {props.dateStr} · {props.timeStr}
              </div>
              <div className="mt-2 text-[18px] font-semibold text-[color:var(--on-background)] sm:text-[20px]">
                {props.title}
              </div>
            </div>

            {loadErr ? (
              <div className="border-[3px] border-[color:var(--on-background)] bg-[color:var(--surface-container-low)] p-4 text-sm text-[color:var(--on-background)]">
                {loadErr}
              </div>
            ) : null}

            {step !== 'ticket' ? (
              <div>
                <div className="space-y-2">
                  <h2 className="font-display text-[22px] font-extrabold uppercase text-[color:var(--on-background)] sm:text-[28px]">
                    {stepTitle}
                  </h2>
                  <div className="h-1 w-12 bg-[color:var(--brand-orange)]" />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6">
                  {currentQuestions.map((q) => (
                    <div key={q.id} className="group flex flex-col gap-1">
                      <label className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-background)] group-focus-within:text-[color:var(--brand-orange)]">
                        {q.label}
                        {q.required ? <span className="text-[color:var(--brand-orange)]"> *</span> : null}
                      </label>

                      {q.fieldType === 'select' ? (
                        <select
                          value={answers[q.id] ?? ''}
                          onChange={(e) => setValue(q.id, e.target.value)}
                          className={inputClassName()}
                        >
                          <option value="">Select...</option>
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
                  <div className="mt-6 border-[3px] border-rose-700 bg-rose-500/10 p-4 text-sm text-rose-900">
                    {submitErr}
                  </div>
                ) : null}

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canNext || questions.length === 0}
                    className="group flex w-full items-center justify-center gap-4 border-[3px] border-[color:var(--on-background)] bg-[color:var(--brand-orange)] py-6 font-display text-[28px] font-extrabold uppercase text-white transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#1b1c1b] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-45"
                  >
                    Continue
                    <span className="material-symbols-outlined font-bold transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            {step === 'ticket' ? (
              <div>
                <div className="space-y-2">
                  <h2 className="font-display text-[22px] font-extrabold uppercase text-[color:var(--on-background)] sm:text-[28px]">
                    Ticket
                  </h2>
                  <div className="h-1 w-12 bg-[color:var(--brand-orange)]" />
                </div>

                <div className="mt-8 grid gap-6">
                  <div className="tv-ticket-shadow overflow-hidden border-2 border-[color:var(--on-background)] bg-[color:var(--surface)]">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2px_220px]">
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]">
                              Admit one
                            </p>
                            <h3 className="mt-3 font-display text-[28px] font-extrabold uppercase tracking-tighter text-[color:var(--on-background)]">
                              {props.title}
                            </h3>
                            <p className="mt-3 text-[16px] text-[color:var(--on-surface-variant)]">
                              {props.dateStr} · {props.timeStr}
                            </p>
                          </div>
                          <div className="hidden lg:block text-right">
                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)]">
                              Status
                            </p>
                            <p className="mt-2 text-[16px] font-semibold uppercase text-[color:var(--on-background)]">
                              {ticket ? 'Registered' : 'Pending'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="border-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-low)] p-4">
                            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]">
                              Ticket ID
                            </div>
                            <div className="mt-2 text-[16px] font-semibold uppercase tracking-widest text-[color:var(--on-background)]">
                              {ticketId}
                            </div>
                          </div>
                          <div className="border-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-low)] p-4">
                            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]">
                              Access level
                            </div>
                            <div className="mt-2 text-[16px] font-semibold uppercase text-[color:var(--on-background)]">
                              Full broadcast
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative hidden lg:block overflow-hidden bg-[color:var(--on-background)]">
                        <div className="absolute inset-y-0 left-[-10px] w-5 tv-ticket-perforation opacity-20" />
                      </div>

                      <div className="relative border-t-2 border-[color:var(--on-background)] p-6 lg:border-t-0">
                        <div className="absolute left-0 right-0 top-[-10px] h-5 tv-ticket-perforation rotate-90 opacity-20 lg:hidden" />
                        <div className="text-center">
                          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)]">
                            Admit one
                          </p>
                          <div className="mx-auto mt-4 h-40 w-40 bg-[color:var(--on-background)] p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt="QR code"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-09xssiYGylD1KiL6BcOWz8E7GJnSHt1t0LXe03mLXSqnawhMErW_7ILjaLgtJfk-dpf8AwZFBgDQSen-NVemT88B8hBGZZCtFkhb3hpuW04TmORz6fOi921dS264x00gR8x9TQZMYY75SPBPYCL_Jzx54WVfz0NwPemldSvduhyGly4W4feTJFmyjGA-dJUMQkBC7v76lm6iTMECTFXbBMhuv46aZ2lONpwWCpbvIGnJk78-BYma7pU8q2ep1bSr1e_O3qZ1w0ei"
                              className="h-full w-full object-cover grayscale invert"
                            />
                          </div>
                          <p className="mt-4 text-[14px] font-semibold uppercase tracking-widest text-[color:var(--on-background)]">
                            ID: {ticketId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPending || ticket != null}
                    onClick={submit}
                    className="group flex w-full items-center justify-center gap-4 border-[3px] border-[color:var(--on-background)] bg-[color:var(--brand-orange)] py-6 font-display text-[28px] font-extrabold uppercase text-white transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#1b1c1b] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-45"
                  >
                    {ticket ? 'Registered' : isPending ? 'Submitting...' : 'Register Now'}
                    <span className="material-symbols-outlined font-bold transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={props.onClose}
                    className="w-full border-[3px] border-[color:var(--on-background)] bg-white py-4 text-[15px] font-bold uppercase tracking-[0.1em] text-[color:var(--on-background)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#1b1c1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
                  >
                    Close
                  </button>

                  {submitErr ? (
                    <div className="border-[3px] border-rose-700 bg-rose-500/10 p-4 text-sm text-rose-900">
                      {submitErr}
                    </div>
                  ) : null}
                </div>
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

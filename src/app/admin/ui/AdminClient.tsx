'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'

type AdminEvent = {
  id: string
  slug: string
  title: string
  summary: string
  venueType: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  startAt: string
  timezone: string
  _count: { rsvps: number }
}

type Question = {
  id: string
  step: string
  ord: number
  key: string | null
  label: string
  fieldType: string
  required: boolean
  options?: string[]
  placeholder?: string
}

type RsvpRow = {
  id: string
  ticket_id: string
  created_at: string
  full_name: string
  email: string
  whatsapp: string | null
  role: string | null
  org: string | null
  country: string | null
  city: string | null
  heard_from: string | null
  hope_to_learn: string | null
  answers?: Record<string, string>
}

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AdminClient() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const active = useMemo(
    () => events.find((e) => e.id === activeId) ?? null,
    [activeId, events],
  )

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string>('')

  // Create event form
  const [title, setTitle] = useState('New Webinar')
  const [summary, setSummary] = useState('A short summary for the listing.')
  const [descriptionMd, setDescriptionMd] = useState(
    '## About\n\nWrite a human description here.\n\n- What you will learn\n- Who this is for\n',
  )
  const [posterUrl, setPosterUrl] = useState<string>('')
  const [tagsCsv, setTagsCsv] = useState('webinar, tiesverse')
  const [venueType, setVenueType] = useState<'ONLINE' | 'IN_PERSON' | 'HYBRID'>(
    'ONLINE',
  )
  const [meetingUrl, setMeetingUrl] = useState('')
  const [locationText, setLocationText] = useState('')
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState('')
  const [mapsLinkUrl, setMapsLinkUrl] = useState('')
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  const [startAt, setStartAt] = useState(() => toLocalInputValue(new Date()))
  const [endAt, setEndAt] = useState('')

  // Questions
  const [questions, setQuestions] = useState<Question[]>([])
  const [qStep, setQStep] = useState<'personal' | 'professional' | 'final'>(
    'personal',
  )
  const [qOrd, setQOrd] = useState(50)
  const [qLabel, setQLabel] = useState('')
  const [qType, setQType] = useState<
    'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea'
  >('text')
  const [qRequired, setQRequired] = useState(true)
  const [qOptionsCsv, setQOptionsCsv] = useState('')
  const [qPlaceholder, setQPlaceholder] = useState('')

  const [rsvps, setRsvps] = useState<RsvpRow[]>([])
  const [selectedRsvpId, setSelectedRsvpId] = useState<string>('')

  const questionLabelById = useMemo(() => {
    const map = new Map<string, string>()
    for (const q of questions) map.set(q.id, q.label)
    return map
  }, [questions])

  const selectedRsvp = useMemo(() => {
    return rsvps.find((r) => r.id === selectedRsvpId) ?? null
  }, [rsvps, selectedRsvpId])

  const loadEvents = async () => {
    setLoading(true)
    setErr('')
    const res = await fetch('/api/admin/events')
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) {
      setLoading(false)
      setErr(json?.error ?? 'Could not load events.')
      return
    }
    setEvents(json.events ?? [])
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents()
  }, [])

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.reload()
  }

  const create = async () => {
    setLoading(true)
    setErr('')
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title,
        summary,
        descriptionMd,
        posterUrl: posterUrl.trim() || null,
        tagsCsv,
        venueType,
        meetingUrl: meetingUrl.trim() || null,
        locationText: locationText.trim() || null,
        mapsEmbedUrl: mapsEmbedUrl.trim() || null,
        mapsLinkUrl: mapsLinkUrl.trim() || null,
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : null,
        timezone,
      }),
    })
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) {
      setLoading(false)
      setErr(json?.error ?? 'Could not create event.')
      return
    }
    await loadEvents()
    setLoading(false)
  }

  const loadQuestions = async (eventId: string) => {
    const res = await fetch(`/api/admin/events/${eventId}/questions`)
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) return
    setQuestions(json.questions ?? [])
  }

  const addQuestion = async () => {
    if (!active) return
    const res = await fetch(`/api/admin/events/${active.id}/questions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        step: qStep,
        ord: qOrd,
        label: qLabel,
        fieldType: qType,
        required: qRequired,
        optionsCsv: qOptionsCsv,
        placeholder: qPlaceholder || undefined,
      }),
    })
    if (!res.ok) return
    setQLabel('')
    setQOptionsCsv('')
    setQPlaceholder('')
    await loadQuestions(active.id)
  }

  const loadRsvps = async (eventId: string) => {
    const res = await fetch(`/api/admin/events/${eventId}/rsvps`)
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) return
    setRsvps(json.rsvps ?? [])
    setSelectedRsvpId('')
  }

  const openEvent = (eventId: string) => {
    setActiveId(eventId)
    void loadQuestions(eventId)
    void loadRsvps(eventId)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
      <div className="space-y-6">
        <div className="tv-card tv-card-muted p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[color:var(--ink)]">
                Create a webinar
              </div>
              <div className="mt-1 text-sm text-[color:var(--ink-muted)]">
                This saves to the local SQL database.
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)] shadow-sm hover:bg-[color:var(--paper-muted)]"
            >
              Log out
            </button>
          </div>

          {err ? (
            <div className="mt-4 rounded-xl border border-rose-600/30 bg-rose-500/10 p-3 text-sm text-rose-900">
              {err}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                Name
              </label>
              <input
                className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                Short description (listing)
              </label>
              <input
                className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                Poster (URL)
              </label>
              <input
                className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                  Start
                </label>
                <input
                  type="datetime-local"
                  className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                  End (optional)
                </label>
                <input
                  type="datetime-local"
                  className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                  Timezone
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                  Mode
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm font-semibold text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                  value={venueType}
                  onChange={(e) =>
                    setVenueType(e.target.value as any)
                  }
                >
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">Offline</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            {venueType !== 'IN_PERSON' ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                  Meeting link (optional)
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            ) : null}

            {venueType !== 'ONLINE' ? (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                    Location text
                  </label>
                  <input
                    className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="Venue + city"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                    Google Maps embed URL (optional)
                  </label>
                  <input
                    className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                    value={mapsEmbedUrl}
                    onChange={(e) => setMapsEmbedUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/embed?..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                    Google Maps share link (optional)
                  </label>
                  <input
                    className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                    value={mapsLinkUrl}
                    onChange={(e) => setMapsLinkUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                Tags (comma separated)
              </label>
              <input
                className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                value={tagsCsv}
                onChange={(e) => setTagsCsv(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                Detailed description (Markdown)
              </label>
              <textarea
                className="min-h-40 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                value={descriptionMd}
                onChange={(e) => setDescriptionMd(e.target.value)}
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={create}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--brand)] px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--brand-600)] disabled:opacity-45"
            >
              {loading ? 'Saving…' : 'Create event'}
            </button>
          </div>
        </div>

        <div className="tv-card tv-card-muted p-6 shadow-sm">
          <div className="text-sm font-semibold text-[color:var(--ink)]">
            Events
          </div>
          <div className="mt-1 text-sm text-[color:var(--ink-muted)]">
            Select one to edit questions and view RSVPs.
          </div>

          <div className="mt-5 grid gap-2">
            {events.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => openEvent(e.id)}
                className={`tv-card flex w-full items-center justify-between gap-3 px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  activeId === e.id ? 'border-[color:var(--brand)]' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[color:var(--ink)]">
                    {e.title}
                  </div>
                  <div className="mt-1 text-xs text-[color:var(--ink-muted)]">
                    {new Date(e.startAt).toLocaleString()} · {e.venueType}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[color:var(--stroke)] bg-white px-2 py-0.5 text-[11px] font-semibold text-[color:var(--ink-muted)]">
                    {e._count.rsvps} RSVPs
                  </span>
                  <span className="text-xs font-semibold text-[color:var(--brand)]">
                    Open →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="tv-card tv-card-muted p-6 shadow-sm">
          <div className="text-sm font-semibold text-[color:var(--ink)]">
            RSVP questions
          </div>
          <div className="mt-1 text-sm text-[color:var(--ink-muted)]">
            Default questions are added automatically. Add custom fields below.
          </div>

          {!active ? (
            <div className="mt-5 text-sm text-[color:var(--ink-muted)]">
              Select an event.
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-2">
                {questions.map((q) => (
                  <div key={q.id} className="tv-card bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[color:var(--ink)]">
                          {q.label}
                        </div>
                        <div className="mt-1 text-xs text-[color:var(--ink-muted)]">
                          {q.step} · order {q.ord} · {q.fieldType}{' '}
                          {q.required ? '· required' : ''}
                        </div>
                      </div>
                      <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--ink-muted)]">
                        {q.key ?? '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 tv-divider" />

              <div className="mt-6 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                      Step
                    </label>
                    <select
                      className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm font-semibold text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                      value={qStep}
                      onChange={(e) => setQStep(e.target.value as any)}
                    >
                      <option value="personal">Personal</option>
                      <option value="professional">Professional</option>
                      <option value="final">Final</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                      Order
                    </label>
                    <input
                      type="number"
                      className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                      value={qOrd}
                      onChange={(e) => setQOrd(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                    Field label
                  </label>
                  <input
                    className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                    value={qLabel}
                    onChange={(e) => setQLabel(e.target.value)}
                    placeholder="e.g. GitHub profile"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                      Field type
                    </label>
                    <select
                      className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm font-semibold text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                      value={qType}
                      onChange={(e) => setQType(e.target.value as any)}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="number">Number</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Dropdown</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
                      <input
                        type="checkbox"
                        checked={qRequired}
                        onChange={(e) => setQRequired(e.target.checked)}
                      />
                      Required
                    </label>
                  </div>
                </div>

                {qType === 'select' ? (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                      Dropdown options (comma separated)
                    </label>
                    <input
                      className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                      value={qOptionsCsv}
                      onChange={(e) => setQOptionsCsv(e.target.value)}
                      placeholder="Option A, Option B, Option C"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
                    Placeholder (optional)
                  </label>
                  <input
                    className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
                    value={qPlaceholder}
                    onChange={(e) => setQPlaceholder(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  disabled={!qLabel.trim()}
                  onClick={addQuestion}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--brand)] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--brand-600)] disabled:opacity-45"
                >
                  Add question
                </button>
              </div>
            </>
          )}
        </div>

        <div className="tv-card tv-card-muted p-6 shadow-sm">
          <div className="text-sm font-semibold text-[color:var(--ink)]">
            RSVPs
          </div>
          <div className="mt-1 text-sm text-[color:var(--ink-muted)]">
            {active ? `Entries for: ${active.title}` : 'Select an event.'}
          </div>

          {active ? (
            <div className="mt-5 overflow-auto">
              <table className="w-full min-w-[820px] text-left text-xs">
                <thead>
                  <tr className="text-[color:var(--ink-muted)]">
                    <th className="pb-2 pr-3 font-semibold">Ticket</th>
                    <th className="pb-2 pr-3 font-semibold">Name</th>
                    <th className="pb-2 pr-3 font-semibold">Email</th>
                    <th className="pb-2 pr-3 font-semibold">WhatsApp</th>
                    <th className="pb-2 pr-3 font-semibold">Role</th>
                    <th className="pb-2 pr-3 font-semibold">City</th>
                    <th className="pb-2 pr-3 font-semibold">Heard from</th>
                    <th className="pb-2 pr-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((r) => (
                    <tr
                      key={r.id}
                      className={cn(
                        'border-t border-[color:var(--stroke)]',
                        selectedRsvpId === r.id ? 'bg-white' : '',
                      )}
                    >
                      <td className="py-2 pr-3 font-semibold text-[color:var(--ink)]">
                        <button
                          type="button"
                          onClick={() => setSelectedRsvpId(r.id)}
                          className="hover:underline"
                        >
                          {r.ticket_id}
                        </button>
                      </td>
                      <td className="py-2 pr-3 text-[color:var(--ink)]">{r.full_name}</td>
                      <td className="py-2 pr-3 text-[color:var(--ink)]">{r.email}</td>
                      <td className="py-2 pr-3 text-[color:var(--ink)]">
                        {r.whatsapp ?? '—'}
                      </td>
                      <td className="py-2 pr-3 text-[color:var(--ink)]">{r.role ?? '—'}</td>
                      <td className="py-2 pr-3 text-[color:var(--ink)]">{r.city ?? '—'}</td>
                      <td className="py-2 pr-3 text-[color:var(--ink)]">
                        {r.heard_from ?? '—'}
                      </td>
                      <td className="py-2 pr-3 text-[color:var(--ink-muted)]">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {rsvps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-sm text-[color:var(--ink-muted)]">
                        No RSVPs yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}

          {active && selectedRsvp ? (
            <div className="mt-6 tv-card bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[color:var(--ink)]">
                    Ticket {selectedRsvp.ticket_id}
                  </div>
                  <div className="mt-1 text-xs text-[color:var(--ink-muted)]">
                    {new Date(selectedRsvp.created_at).toLocaleString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRsvpId('')}
                  className="text-xs font-semibold text-[color:var(--brand)] hover:underline"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
                    Name
                  </div>
                  <div className="mt-1 text-sm text-[color:var(--ink)]">
                    {selectedRsvp.full_name}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
                    Email
                  </div>
                  <div className="mt-1 text-sm text-[color:var(--ink)]">
                    {selectedRsvp.email}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
                    WhatsApp
                  </div>
                  <div className="mt-1 text-sm text-[color:var(--ink)]">
                    {selectedRsvp.whatsapp ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
                    Role
                  </div>
                  <div className="mt-1 text-sm text-[color:var(--ink)]">
                    {selectedRsvp.role ?? '—'}
                  </div>
                </div>
              </div>

              <div className="mt-5 tv-divider" />

              <div className="mt-5">
                <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
                  Answers
                </div>
                <div className="mt-3 grid gap-2">
                  {Object.entries(selectedRsvp.answers ?? {}).length === 0 ? (
                    <div className="text-sm text-[color:var(--ink-muted)]">
                      No answers stored.
                    </div>
                  ) : (
                    Object.entries(selectedRsvp.answers ?? {}).map(([qid, v]) => (
                      <div key={qid} className="tv-card tv-card-muted p-3">
                        <div className="text-xs font-semibold text-[color:var(--ink-muted)]">
                          {questionLabelById.get(qid) ?? qid}
                        </div>
                        <div className="mt-1 text-sm text-[color:var(--ink)]">
                          {v || '—'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

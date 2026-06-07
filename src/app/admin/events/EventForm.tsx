'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ListedEvent } from '@/server/events'

type FormData = {
  title: string
  summary: string
  descriptionMd: string
  coverImageUrl: string
  tags: string
  venueType: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  meetingUrl: string
  locationText: string
  startAt: string
  endAt: string
  timezone: string
  capacity: string
  isPublished: boolean
  organizerHandle: string
  organizerName: string
  organizerBio: string
  organizerWebsite: string
}

function toLocalDatetimeValue(isoStr: string): string {
  // Convert ISO string to datetime-local input value (YYYY-MM-DDTHH:mm)
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 16)
}

function fromLocalDatetimeValue(val: string, tz: string): string {
  if (!val) return ''
  return new Date(val).toISOString()
}

const TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles',
  'America/Chicago', 'Europe/London', 'Europe/Paris', 'Asia/Singapore',
  'Asia/Dubai', 'Australia/Sydney',
]

export function EventForm({
  mode,
  event,
}: {
  mode: 'create' | 'edit'
  event?: ListedEvent
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState<FormData>({
    title: event?.title ?? '',
    summary: event?.summary ?? '',
    descriptionMd: event?.descriptionMd ?? '',
    coverImageUrl: event?.coverImageUrl ?? '',
    tags: event?.tagList.join(', ') ?? '',
    venueType: event?.venueType ?? 'ONLINE',
    meetingUrl: event?.meetingUrl ?? '',
    locationText: event?.locationText ?? '',
    startAt: toLocalDatetimeValue(event?.startAt ?? ''),
    endAt: toLocalDatetimeValue(event?.endAt ?? ''),
    timezone: event?.timezone ?? 'Asia/Kolkata',
    capacity: event?.capacity != null ? String(event.capacity) : '',
    isPublished: event?.isPublished ?? false,
    organizerHandle: event?.organizer.handle ?? 'tiesverse',
    organizerName: event?.organizer.name ?? '',
    organizerBio: event?.organizer.bio ?? '',
    organizerWebsite: event?.organizer.website ?? '',
  })

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const setChecked = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.checked }))

  const submit = () => {
    startTransition(async () => {
      setError('')
      setSuccess('')

      const tags = form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        descriptionMd: form.descriptionMd.trim(),
        coverImageUrl: form.coverImageUrl.trim() || null,
        tags,
        venueType: form.venueType,
        meetingUrl: form.meetingUrl.trim() || null,
        locationText: form.locationText.trim() || null,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : '',
        endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
        timezone: form.timezone,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        isPublished: form.isPublished,
        organizerHandle: form.organizerHandle.trim() || 'tiesverse',
        organizerName: form.organizerName.trim(),
        organizerBio: form.organizerBio.trim() || null,
        organizerWebsite: form.organizerWebsite.trim() || null,
      }

      const url = mode === 'edit' && event ? `/api/admin/events/${event.id}` : '/api/admin/events'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        const issues = json?.issues as Array<{ path: string[]; message: string }> | undefined
        if (issues?.length) {
          const detail = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
          setError(`Validation failed:\n${detail}`)
        } else {
          setError(json?.error ?? 'Something went wrong.')
        }
        return
      }

      if (mode === 'create') {
        router.push('/admin/events')
      } else {
        setSuccess('Saved successfully.')
        router.refresh()
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Basic info */}
        <Section title="Basic info">
          <Field label="Title" required>
            <input value={form.title} onChange={set('title')} className="tv-input" placeholder="Webinar title" />
          </Field>
          <Field label="Summary (shown on cards)" required>
            <textarea value={form.summary} onChange={set('summary')} className="tv-input min-h-20 py-3" placeholder="One or two sentences describing the event" />
          </Field>
          <Field label="Description (Markdown)">
            <textarea value={form.descriptionMd} onChange={set('descriptionMd')} className="tv-input min-h-48 py-3 font-mono text-sm" placeholder="## About this event&#10;&#10;Full details, agenda, speakers..." />
          </Field>
          <Field label="Cover image URL">
            <input value={form.coverImageUrl} onChange={set('coverImageUrl')} className="tv-input" placeholder="https://..." type="url" />
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={form.tags} onChange={set('tags')} className="tv-input" placeholder="webinar, product, qa" />
          </Field>
        </Section>

        {/* Schedule */}
        <Section title="Schedule">
          <Field label="Venue type" required>
            <select value={form.venueType} onChange={set('venueType')} className="tv-input">
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In person</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date & time" required>
              <input type="datetime-local" value={form.startAt} onChange={set('startAt')} className="tv-input" />
            </Field>
            <Field label="End date & time">
              <input type="datetime-local" value={form.endAt} onChange={set('endAt')} className="tv-input" />
            </Field>
          </div>
          <Field label="Timezone" required>
            <select value={form.timezone} onChange={set('timezone')} className="tv-input">
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </Field>

          {(form.venueType === 'ONLINE' || form.venueType === 'HYBRID') && (
            <Field label="Meeting URL">
              <input value={form.meetingUrl} onChange={set('meetingUrl')} className="tv-input" placeholder="https://meet.google.com/..." type="url" />
            </Field>
          )}
          {(form.venueType === 'IN_PERSON' || form.venueType === 'HYBRID') && (
            <Field label="Location">
              <input value={form.locationText} onChange={set('locationText')} className="tv-input" placeholder="Venue name, city" />
            </Field>
          )}
        </Section>

        {/* Organizer */}
        <Section title="Organizer">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Handle (URL-safe slug)" required>
              <input value={form.organizerHandle} onChange={set('organizerHandle')} className="tv-input" placeholder="tiesverse" />
            </Field>
            <Field label="Display name" required>
              <input value={form.organizerName} onChange={set('organizerName')} className="tv-input" placeholder="Tiesverse" />
            </Field>
          </div>
          <Field label="Bio">
            <textarea value={form.organizerBio} onChange={set('organizerBio')} className="tv-input min-h-20 py-3" placeholder="Short description of the organizer" />
          </Field>
          <Field label="Website">
            <input value={form.organizerWebsite} onChange={set('organizerWebsite')} className="tv-input" placeholder="https://tiesverse.com" type="url" />
          </Field>
        </Section>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Section title="Publish settings">
          <Field label="Capacity (leave blank for unlimited)">
            <input value={form.capacity} onChange={set('capacity')} className="tv-input" type="number" min={1} placeholder="e.g. 200" />
          </Field>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={setChecked('isPublished')}
              className="h-4 w-4 rounded border-white/20"
            />
            <span className="text-sm text-[color:var(--ink)]">Published (visible to public)</span>
          </label>
        </Section>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
            {success}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="tv-btn tv-btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving…' : mode === 'create' ? 'Create event' : 'Save changes'}
        </button>

        {mode === 'edit' && event && (
          <a
            href={`/events/${event.slug}`}
            target="_blank"
            className="tv-btn w-full py-3 text-center block text-sm"
          >
            View public page
          </a>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/08 bg-[color:var(--card)] p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[color:var(--ink-muted)]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[color:var(--ink-muted)]">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

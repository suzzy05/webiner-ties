import { EventForm } from '../EventForm'

export default function NewEventPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[color:var(--ink)]">Create event</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Fill in the details below to publish a new webinar.</p>
      </div>
      <EventForm mode="create" />
    </div>
  )
}

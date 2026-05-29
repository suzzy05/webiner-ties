import Link from 'next/link'
import { Calendar, Clock, MapPin, Users, Video } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { Container } from '@/components/Container'
import { TagChips } from '@/components/TagChips'
import { getEventBySlug } from '@/server/events'
import { EventAboutTabs } from '@/components/EventAboutTabs'
import { GoogleMapEmbed } from '@/components/GoogleMapEmbed'
import { RegisterButton } from '@/components/RegisterButton'

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    return (
      <Container className="py-20">
        <h1 className="tv-display text-3xl font-semibold text-[color:var(--ink)]">
          Event not found
        </h1>
        <p className="mt-3 text-sm text-[color:var(--ink-muted)]">
          That event doesn&apos;t exist or is not published.
        </p>
        <Link
          href="/discover"
          className="mt-6 inline-block text-sm font-semibold text-[color:var(--brand)] hover:underline"
        >
          ← Back to events
        </Link>
      </Container>
    )
  }

  const startAt = new Date(event.startAt)
  const endAt = event.endAt ? new Date(event.endAt) : null
  const tz = event.timezone

  const dateStr = formatInTimeZone(startAt, tz, 'EEE, MMM d yyyy')
  const startTimeStr = formatInTimeZone(startAt, tz, 'h:mm a')
  const endTimeStr = endAt ? formatInTimeZone(endAt, tz, 'h:mm a') : null
  const timeStr = endTimeStr
    ? `${startTimeStr} – ${endTimeStr} (${tz})`
    : `${startTimeStr} (${tz})`

  const isOnline = event.venueType === 'ONLINE'

  return (
    <Container className="py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          <Link
            href="/discover"
            className="text-sm font-semibold text-[color:var(--brand)] hover:underline"
          >
            ← Back to events
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ink-muted)]">
            <Users className="h-4 w-4 opacity-70" aria-hidden="true" />
            Public event
          </div>

          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[color:var(--ink)] sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-3 text-sm text-[color:var(--ink-muted)] sm:text-base">
            {event.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[color:var(--ink-muted)]">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 opacity-70" aria-hidden="true" />
              {dateStr}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 opacity-70" aria-hidden="true" />
              {timeStr}
            </span>
          </div>

          <div className="my-8 h-px bg-[color:var(--stroke)]" />

          <section aria-labelledby="host-heading">
            <h2
              id="host-heading"
              className="text-base font-semibold text-[color:var(--ink)]"
            >
              Hosted by
            </h2>
            <Link
              href={`/organizers/${event.organizer.handle}`}
              className="group mt-4 inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-[color:var(--stroke-strong)] bg-white text-lg font-bold text-[color:var(--brand)] shadow-sm transition-transform group-hover:scale-105">
                {event.organizer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--brand)]">
                  {event.organizer.name}
                </div>
                <span className="mt-1 inline-flex rounded-full border border-[color:var(--stroke)] bg-[color:var(--paper-muted)] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[color:var(--ink-muted)]">
                  ORGANIZER
                </span>
              </div>
            </Link>
          </section>

          <div className="my-8 h-px bg-[color:var(--stroke)]" />

          {event.locationText ? (
            <section aria-labelledby="location-heading">
              <h2
                id="location-heading"
                className="text-base font-semibold text-[color:var(--ink)]"
              >
                Location
              </h2>

              <div className="mt-2 flex items-start gap-2 text-sm text-[color:var(--ink-muted)]">
                {isOnline ? (
                  <Video className="mt-0.5 h-4 w-4 flex-none opacity-70" aria-hidden="true" />
                ) : (
                  <MapPin className="mt-0.5 h-4 w-4 flex-none opacity-70" aria-hidden="true" />
                )}
                <span>{event.locationText}</span>
              </div>

              {!isOnline ? (
                <GoogleMapEmbed
                  location={event.locationText}
                  embedUrl={event.mapsEmbedUrl}
                  mapsLinkUrl={event.mapsLinkUrl}
                  height={240}
                  className="mt-4"
                />
              ) : null}

              {isOnline && event.meetingUrl ? (
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--brand)] hover:underline"
                >
                  Join meeting link →
                </a>
              ) : null}

              <div className="my-8 h-px bg-[color:var(--stroke)]" />
            </section>
          ) : null}

          <section aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="text-base font-semibold text-[color:var(--ink)]"
            >
              About the event
            </h2>
            <EventAboutTabs descriptionMd={event.descriptionMd} />
          </section>

          {event.tagList.length > 0 ? (
            <TagChips className="mt-10" tags={event.tagList} max={8} />
          ) : null}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="tv-card overflow-hidden shadow-sm">
            {event.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="w-full object-cover"
              />
            ) : (
              <div className="relative flex min-h-64 items-center justify-center overflow-hidden bg-[color:var(--paper-muted)] p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(255,99,67,0.38),transparent_60%)]" />
                <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(17,17,17,0.18)_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 text-center">
                  <div className="tv-display text-3xl font-semibold leading-tight tracking-tight text-[color:var(--ink)]">
                    {event.title}
                  </div>
                  <div className="mt-4 text-sm text-[color:var(--ink-muted)]">
                    {dateStr}
                  </div>
                  <div className="mt-1 text-xs text-[color:var(--ink-muted)]">
                    {timeStr}
                  </div>
                </div>
              </div>
            )}
          </div>

          <RegisterButton
            eventSlug={event.slug}
            title={event.title}
            dateStr={dateStr}
            timeStr={timeStr}
          />
        </div>
      </div>
    </Container>
  )
}

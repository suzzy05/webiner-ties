import Link from 'next/link'
import Image from 'next/image'
import { formatInTimeZone } from 'date-fns-tz'
import { getEventBySlug, listEvents } from '@/server/events'
import { listAttendeesForEvent } from '@/server/rsvps'
import { WebinarDetailTabs } from '@/components/WebinarDetailTabs'
import { AttendWebinarCard } from '@/components/AttendWebinarCard'
import { GoogleMapEmbed } from '@/components/GoogleMapEmbed'

const fallbackCover =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCNINWMeTnXggEasf0fwENTtE6QN4mYeD3Ga-lqmqHbtHhTzB26iZZyc3p93b-GmzWET5bPJHp9Zijy3mKYhaumUXBuDaIpBSXkNUuE5boOYl-Kn1DqUCjoZSFWfQQ-b5tqHwznkZ3vMa8pTeuDcGQJNEi6xo4vbLF90StX21T98iBr6BXt593923r2csrBTo4evSnrHG32kLVvlZ0xXAIIllLDLl1KjO9lrnqsbb1rjlFeLCcK0uYFBRp3lJJPu-mW7zEDzLWZ7eCJ'

function formatPrice(paise: number) {
  if (!Number.isFinite(paise) || paise <= 0) return 'FREE'
  const inr = paise / 100
  return `₹${inr.toFixed(2)}`
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const event = await getEventBySlug(slug)

  const now = new Date()

  if (!event) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-0">
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--ink)]">
          Webinar not found
        </h1>
        <p className="mt-4 text-[16px] text-[color:var(--ink-muted)]">
          That webinar doesn&apos;t exist or is not published.
        </p>
        <Link
          href="/discover"
          className="mt-8 inline-flex text-sm font-medium text-[color:var(--ink-highlight)] hover:opacity-90"
        >
          Back to explore
        </Link>
      </main>
    )
  }

  const startAt = new Date(event.startAt)
  const endAt = event.endAt ? new Date(event.endAt) : null
  const tz = event.timezone
  const showMap = event.venueType !== 'ONLINE' && Boolean(event.locationText)

  const dateLine = formatInTimeZone(startAt, tz, 'MMMM d, yyyy').toUpperCase()
  const startTimeStr = formatInTimeZone(startAt, tz, 'HH:mm')
  const endTimeStr = endAt ? formatInTimeZone(endAt, tz, 'HH:mm') : null
  const timeLine = endTimeStr
    ? `${startTimeStr} - ${endTimeStr} ${tz}`.toUpperCase()
    : `${startTimeStr} ${tz}`.toUpperCase()

  const priceLabel = 'FREE'
  const badge = 'FREE ACCESS'

  const details = [
    { label: 'Venue', value: event.venueType === 'ONLINE' ? 'Online' : event.venueType === 'IN_PERSON' ? 'In person' : 'Hybrid' },
    { label: 'Timezone', value: tz },
    { label: 'Location', value: event.locationText ?? (event.venueType === 'ONLINE' ? 'Online' : '') },
    { label: 'RSVPs', value: String(event._count.rsvps ?? 0) },
  ]

  const upcoming = (await listEvents({ after: startAt, take: 6 }))
    .filter((e) => e.slug !== event.slug)
    .slice(0, 3)

  const attendees = await listAttendeesForEvent(event.id, 12)

  const attendeeInitials = (name: string) => {
    const cleaned = name.trim()
    if (!cleaned) return '?'
    const parts = cleaned.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] ?? '?'
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
    return `${first}${second}`.toUpperCase()
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-0">
      {/* ─── Ambient background driven by poster colors ─── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Poster image blurred and tinted — the ambient source */}
        <Image
          alt=""
          src={event.coverImageUrl ?? fallbackCover}
          fill
          className="object-cover blur-[80px] opacity-20 saturate-200 scale-110"
          sizes="100vw"
          priority={false}
        />
        {/* Dark overlay with warm crown glow at top */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/60 via-[#09090b]/80 to-[#09090b]/97" />
        {/* Warm gold top accent — matches brand */}
        <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(228,213,160,0.11),transparent_65%)]" />
        {/* Soft edge vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_40px_rgba(9,9,11,0.85)]" />
      </div>

      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-12 md:col-span-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[28px] border border-white/10 bg-[color:var(--card)]">
            <Image
              alt={event.title}
              src={event.coverImageUrl ?? fallbackCover}
              fill
              className="object-cover transition-all duration-700 ease-in-out hover:scale-[1.01]"
              sizes="(min-width: 1024px) 66vw, 100vw"
              priority
            />
          </div>

          <div className="mt-6 rounded-[28px] border border-white/8 bg-[color:var(--card)]/90 p-6 backdrop-blur-sm">
            <p className="tv-label">{event.tagList[0]?.toUpperCase() ?? 'WEBINAR'}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
              {event.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[color:var(--ink-muted)]">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/07 bg-white/04 px-3 py-1.5">
                <span className="material-symbols-outlined text-[16px] text-[color:var(--accent)]">event</span>
                {dateLine}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/07 bg-white/04 px-3 py-1.5">
                <span className="material-symbols-outlined text-[16px] text-[color:var(--accent)]">schedule</span>
                {timeLine}
              </span>
            </div>
          </div>

          <div className="mt-10 pb-10">
            <WebinarDetailTabs
              descriptionMd={event.descriptionMd}
              details={details}
              speaker={{
                name: event.organizer.name.toUpperCase(),
                title: `HOST, ${event.organizer.name.toUpperCase()}`,
              }}
              className="tv-card rounded-[28px] p-6"
            />
          </div>
        </div>

        <aside className="col-span-12 space-y-6 md:col-span-4 md:sticky md:top-[100px]">
          <AttendWebinarCard
            eventSlug={event.slug}
            title={event.title}
            dateLine={dateLine}
            timeLine={timeLine}
            venueType={event.venueType}
            locationText={event.locationText}
          />

          {showMap && event.locationText ? (
            <div className="rounded-[28px] border border-white/10 bg-[color:var(--card)] p-4">
              <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Location
              </h5>
              <GoogleMapEmbed
                location={event.locationText}
                embedUrl={event.mapsEmbedUrl}
                mapsLinkUrl={event.mapsLinkUrl}
                height={220}
                variant="hard"
              />
            </div>
          ) : null}

          <div className="rounded-[28px] border border-white/10 bg-[color:var(--card)] p-4">
            <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
              <span className="material-symbols-outlined text-[16px]">group</span>
              Attendees
            </h5>
            {attendees.length ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {attendees.slice(0, 5).map((a) => (
                      <div
                        key={`${a.createdAt}-${a.fullName}`}
                        title={a.fullName}
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[color:var(--surface-container-high)] text-[11px] font-semibold text-[color:var(--ink)]"
                      >
                        {attendeeInitials(a.fullName)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[color:var(--ink-muted)]">
                    {Number(event._count.rsvps ?? 0)} attending
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {attendees.slice(0, 10).map((a) => (
                    <div
                      key={`row-${a.createdAt}-${a.fullName}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[color:var(--card)] px-3 py-2"
                    >
                      <div className="min-w-0 text-sm font-medium text-[color:var(--ink)]">
                        <span className="truncate">{a.fullName}</span>
                      </div>
                      <span className="tv-label shrink-0 pl-3">RSVP</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[color:var(--surface-container-highest)] p-4 text-sm text-[color:var(--ink-muted)]">
                Be the first to RSVP.
              </div>
            )}
          </div>
        </aside>
      </div>

      <section className="mt-10 border-t border-white/10 pt-10">
        <h2 className="mb-10 text-xl font-semibold text-[color:var(--ink)]">
          Upcoming Webinars
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {upcoming.map((item) => (
            <Link key={item.slug} href={`/events/${item.slug}`} className="group">
              <div className="relative mb-4 aspect-video overflow-hidden rounded-[22px] border border-white/10 bg-[color:var(--card)]">
                <Image
                  alt={item.title}
                  src={item.coverImageUrl ?? fallbackCover}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-all duration-500 group-hover:scale-[1.01]"
                />
              </div>
              <span className="tv-label">
                {item.tagList[0]?.toUpperCase() ?? 'WEBINAR'}
              </span>
              <h3 className="mt-2 text-[18px] font-semibold text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--ink-highlight)]">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

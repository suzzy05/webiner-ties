import Link from 'next/link'
import Image from 'next/image'
import { formatInTimeZone } from 'date-fns-tz'
import { getEventBySlug, listEvents } from '@/server/events'
import { WebinarDetailTabs } from '@/components/WebinarDetailTabs'
import { WebinarRegisterCard } from '@/components/WebinarRegisterCard'
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
        <h1 className="font-display text-[28px] font-extrabold uppercase tracking-tighter text-[color:var(--on-background)]">
          Webinar not found
        </h1>
        <p className="mt-4 text-[16px] text-[color:var(--on-surface-variant)]">
          That webinar doesn&apos;t exist or is not published.
        </p>
        <Link
          href="/discover"
          className="mt-8 inline-flex border-b-2 border-[color:var(--primary)] pb-1 text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]"
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

  const statusLabel =
    startAt.getTime() <= now.getTime() && (!endAt || endAt.getTime() > now.getTime())
      ? 'LIVE'
      : 'UPCOMING'

  const dateLine = formatInTimeZone(startAt, tz, 'MMMM d, yyyy').toUpperCase()
  const startTimeStr = formatInTimeZone(startAt, tz, 'HH:mm')
  const endTimeStr = endAt ? formatInTimeZone(endAt, tz, 'HH:mm') : null
  const timeLine = endTimeStr
    ? `${startTimeStr} - ${endTimeStr} ${tz}`.toUpperCase()
    : `${startTimeStr} ${tz}`.toUpperCase()

  const priceLabel = 'FREE'
  const badge = 'FREE ACCESS'

  const series = event.tagList[0] ? `SERIES: ${event.tagList[0].toUpperCase()}` : 'SERIES: WEBINARS'

  const details = [
    { label: 'Venue', value: event.venueType === 'ONLINE' ? 'Online' : event.venueType === 'IN_PERSON' ? 'In person' : 'Hybrid' },
    { label: 'Timezone', value: tz },
    { label: 'Location', value: event.locationText ?? (event.venueType === 'ONLINE' ? 'Online' : '') },
    { label: 'RSVPs', value: String(event._count.rsvps ?? 0) },
  ]

  const upcoming = (await listEvents({ after: startAt, take: 6 }))
    .filter((e) => e.slug !== event.slug)
    .slice(0, 3)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-0">
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 md:col-span-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden border-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-highest)]">
            <Image
              alt={event.title}
              src={event.coverImageUrl ?? fallbackCover}
              fill
              className="object-cover grayscale transition-all duration-700 ease-in-out hover:grayscale-0"
              sizes="(min-width: 1024px) 66vw, 100vw"
              priority
            />
            <div className="absolute right-0 top-0 flex items-center gap-2 bg-[color:var(--secondary-container)] px-6 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-secondary-fixed)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--on-secondary-fixed)]" />
              {statusLabel}
            </div>
          </div>

          <div className="-mt-10 relative z-10 max-w-[90%] border-2 border-[color:var(--on-background)] bg-[color:var(--background)] p-6 md:max-w-[80%]">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]">
              {series}
            </p>
            <h1 className="mt-3 font-display text-[44px] font-extrabold uppercase leading-none tracking-tighter text-[color:var(--on-background)] sm:text-[64px]">
              {event.title}
            </h1>
          </div>

          <div className="mt-10 pb-10">
            <WebinarDetailTabs
              descriptionMd={event.descriptionMd}
              details={details}
              speaker={{
                name: event.organizer.name.toUpperCase(),
                title: `HOST, ${event.organizer.name.toUpperCase()}`,
              }}
            />
          </div>
        </div>

        <aside className="col-span-12 space-y-6 md:col-span-4 md:sticky md:top-[100px]">
          <WebinarRegisterCard
            eventSlug={event.slug}
            title={event.title}
            dateLine={dateLine}
            timeLine={timeLine}
            priceLabel={priceLabel}
            badge={badge}
            footnote="INCLUDES SESSION RECORDING & FOLLOW-UP EMAIL"
          />

          {showMap && event.locationText ? (
            <div className="border-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-low)] p-4">
              <h5 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em]">
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

          <div className="border-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-low)] p-4">
            <h5 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em]">
              <span className="material-symbols-outlined text-[16px]">group</span>
              Network Stats
            </h5>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full border border-[color:var(--on-background)] bg-slate-300" />
                <div className="h-8 w-8 rounded-full border border-[color:var(--on-background)] bg-slate-400" />
                <div className="h-8 w-8 rounded-full border border-[color:var(--on-background)] bg-slate-500" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]">
                +{Math.max(12, Number(event._count.rsvps ?? 0))} Attending
              </span>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-10 border-t-2 border-[color:var(--on-background)] pt-10">
        <h2 className="mb-10 inline-block border-b-4 border-[color:var(--primary)] font-display text-[28px] font-extrabold uppercase tracking-tighter">
          Upcoming Webinars
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {upcoming.map((item) => (
            <Link key={item.slug} href={`/events/${item.slug}`} className="group">
              <div className="relative mb-4 aspect-video overflow-hidden border border-[color:var(--on-background)] bg-[color:var(--surface-container-high)]">
                <Image
                  alt={item.title}
                  src={item.coverImageUrl ?? fallbackCover}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]">
                {item.tagList[0]?.toUpperCase() ?? 'WEBINAR'}
              </span>
              <h3 className="mt-2 text-[20px] font-semibold uppercase tracking-tight text-[color:var(--on-background)] transition-colors group-hover:text-[color:var(--primary)]">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

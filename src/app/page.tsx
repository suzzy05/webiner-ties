import Link from 'next/link'
import Image from 'next/image'
import { listEvents } from '@/server/events'

export default async function Page() {
  const now = new Date()
  const allEvents = await listEvents({ take: 40 })

  const liveEvents = allEvents.filter((event) => {
    if (event.startAt.getTime() > now.getTime()) return false
    const endAt = event.endAt ? event.endAt : new Date(event.startAt.getTime() + 60 * 60_000)
    return endAt.getTime() > now.getTime()
  })

  const upcomingEvents = allEvents.filter((event) => event.startAt.getTime() >= now.getTime())

  const bentoPrimary = liveEvents[0] ?? upcomingEvents[0] ?? null
  const bentoSecondary = upcomingEvents.slice(0, 2)

  const disciplines = [
    { icon: 'rocket_launch', title: 'Product', sessions: 'New releases and demos' },
    { icon: 'shield', title: 'Security', sessions: 'Security and compliance' },
    { icon: 'groups', title: 'Leadership', sessions: 'Teams and strategy' },
    { icon: 'school', title: 'Training', sessions: 'Workshops and learning' },
  ]

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-0">
      <section className="relative grid grid-cols-12 gap-6 overflow-hidden pb-24 pt-10">
        <div className="relative z-10 col-span-12 md:col-span-8">
          <h1 className="font-display text-[44px] font-extrabold uppercase leading-none tracking-tighter sm:text-[64px]">
            WEBINAR <br />
            <span className="text-[color:var(--primary-container)]">REGISTRATION</span> <br />
            FOR YOUR COMPANY <br />
            <span className="bg-[color:var(--on-background)] px-1 text-[color:var(--background)]">
              AUDIENCE
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[16px] text-[color:var(--on-surface-variant)]">
            Publish webinars, collect RSVPs, and deliver a smooth attendee experience from signup to replay.
          </p>
        </div>

        <div className="z-20 col-span-12 self-end md:col-span-4 md:-ml-10 md:-mb-6">
          <div className="tv-hard-shadow border-2 border-[color:var(--on-background)] bg-[color:var(--secondary-container)] p-10">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-secondary-fixed)]">
              HOST WEBINARS
            </p>
            <p className="mt-4 text-[18px] font-bold leading-relaxed text-[color:var(--on-secondary-fixed)]">
              Create a branded registration page, gather attendee details, and go live with confidence.
            </p>
            <Link
              href="/discover"
              className="group mt-6 flex w-full items-center justify-between bg-[color:var(--on-background)] px-6 py-4 text-[15px] font-semibold text-[color:var(--background)]"
            >
              EXPLORE WEBINARS
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 -z-0 h-full w-2/3 opacity-10">
          <Image
            alt="Architectural background"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnM25QdJPT2k7lkSY0H6WcDB57bRGqF-wKZ0Yo31FWm0QHDcxR3R8TEynvw7E733oDaQub4wF9quhm5h79Tf7hPlv3d60bDfslp1T9ILycmadXpxmotU23wg9zGbxrcrbGCqhS3W_KBcasyTovpSGVGN18QSSy1GCjqt0sIkdFxzZ1QrLa6pQ-0zsgD76maIAiWWDrNND9DyTxWJLwcsR0ZKqRtz6xti2YjS29OdYikG7yj6GgCCyfL-l1dlEDwRfJQzRyySLV4ee0"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 66vw, 100vw"
            priority
          />
        </div>
      </section>

      <section className="border-t-2 border-[color:var(--on-background)] py-10">
        <div className="flex items-end justify-between gap-6">
          <h2 className="flex items-center gap-3 font-display text-[28px] font-extrabold uppercase tracking-tighter">
            <span className="h-3 w-3 animate-pulse rounded-full bg-[color:var(--primary)]" />
            Live Now
          </h2>
          <Link
            href="/discover"
            className="border-b-2 border-[color:var(--primary)] pb-1 text-xs font-bold uppercase tracking-[0.1em]"
          >
            VIEW WEBINAR SCHEDULE
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-12 gap-6">
          {bentoPrimary ? (
            <Link
              href={`/events/${bentoPrimary.slug}`}
              className="tv-hard-shadow-sm col-span-12 flex flex-col border-2 border-[color:var(--on-background)] md:flex-row lg:col-span-7"
            >
              <div className="relative aspect-square w-full overflow-hidden border-b-2 border-[color:var(--on-background)] md:aspect-auto md:w-1/2 md:border-b-0 md:border-r-2">
                <Image
                  className="tv-grayscale-hover object-cover"
                  alt={bentoPrimary.title}
                  src={
                    bentoPrimary.coverImageUrl ??
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCj3PHnqChL1XGKHJYzRMsoWs5yyEMUnvNHNFrCOTI24gjCVBpNhxuSeyqKni1KhX_olKpGlCnRsxnWZj7gMsKaHGP0-sLTZYpmvVWZfsGdL1CCz6aoFJhX1VaZ6O94xcq3oZTKjC7Xntj_FOKALS63mksHTahvwBDp8h76OGXXdhOE_3HBT-AlcabluHG08_YCPPceVQdPu3GD0J141oeYz_F0I4pMLsTcbOsVgDb1APPxZwjJVazaLhO2pQV4kaTRQDnrnSbePwHQ'
                  }
                  fill
                  sizes="(min-width: 1024px) 35vw, 100vw"
                />
              </div>
                <div className="flex w-full flex-col justify-between bg-[color:var(--surface)] p-6 md:w-1/2">
                  <div>
                    <span className="bg-[color:var(--primary)] px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-primary)]">
                      {bentoPrimary.tagList[0]?.toUpperCase() ?? 'LIVE'}
                    </span>
                    <h3 className="mt-4 text-[20px] font-semibold leading-snug">
                      {bentoPrimary.title}
                    </h3>
                    <p className="mt-2 text-[16px] text-[color:var(--on-surface-variant)]">
                      Hosted by: {bentoPrimary.organizer.name}
                    </p>
                  </div>
                  <div className="mt-10 flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.1em]">
                      {Math.max(bentoPrimary._count.rsvps, 1)} ATTENDEES
                    </span>
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full border-2 border-[color:var(--background)] bg-[color:var(--surface-container-high)]" />
                      <div className="h-8 w-8 rounded-full border-2 border-[color:var(--background)] bg-[color:var(--surface-container-highest)]" />
                    </div>
                  </div>
                </div>
            </Link>
          ) : (
            <div className="tv-hard-shadow-sm col-span-12 border-2 border-[color:var(--on-background)] p-6 lg:col-span-7">
              <div className="text-sm text-[color:var(--on-surface-variant)]">
                No live webinars yet. Publish one in the admin panel.
              </div>
            </div>
          )}

          <div className="col-span-12 grid grid-rows-2 gap-6 lg:col-span-5">
            {bentoSecondary.length ? (
              bentoSecondary.map((event, idx) => (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className="flex items-center gap-4 border-2 border-[color:var(--on-background)] p-4 transition-colors hover:bg-[color:var(--surface-container-high)]"
                >
                  <div
                    className={idx === 0
                      ? 'flex h-24 w-24 flex-none items-center justify-center bg-[color:var(--on-background)] text-[color:var(--background)]'
                      : 'flex h-24 w-24 flex-none items-center justify-center bg-[color:var(--secondary-container)] text-[color:var(--on-secondary-fixed)]'}
                  >
                    <span className="material-symbols-outlined text-4xl">
                      {idx === 0 ? 'architecture' : 'hub'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]">
                      UPCOMING
                    </p>
                    <h4 className="mt-2 text-[20px] font-semibold leading-tight">
                      {event.title}
                    </h4>
                  </div>
                </Link>
              ))
            ) : (
              <div className="row-span-2 flex items-center border-2 border-[color:var(--on-background)] p-6 text-sm text-[color:var(--on-surface-variant)]">
                Add upcoming webinars to populate this section.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-10">
        <h2 className="mb-10 font-display text-[28px] font-extrabold uppercase tracking-tighter">
          Browse Topics
        </h2>

        <div className="grid grid-cols-2 border-l-2 border-t-2 border-[color:var(--on-background)] md:grid-cols-4">
          {disciplines.map((discipline) => (
            <Link
              key={discipline.title}
              href={`/discover?q=${encodeURIComponent(discipline.title)}`}
              className="group border-b-2 border-r-2 border-[color:var(--on-background)] p-10 transition-colors hover:bg-[color:var(--primary)] hover:text-[color:var(--on-primary)]"
            >
              <span className="material-symbols-outlined mb-6 block text-4xl">
                {discipline.icon}
              </span>
              <h5 className="text-[20px] font-semibold uppercase">{discipline.title}</h5>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] opacity-60">
                {discipline.sessions}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10 py-10">
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="font-display text-[28px] font-extrabold uppercase tracking-tighter">
              Global Presence
            </h2>
            <p className="mt-4 text-[16px] text-[color:var(--on-surface-variant)]">
              Run webinars across time zones with a consistent experience for attendees everywhere.
            </p>
            <ul className="mt-10 space-y-4">
              {['EUROPEAN HUB / BERLIN', 'AMERICAS NODE / NEW YORK', 'APAC CLUSTER / SINGAPORE'].map(
                (label, idx) => (
                  <li
                    key={label}
                    className="flex items-center gap-4 border-b border-[color:var(--outline-editorial)] pb-2"
                  >
                    <span className="text-[20px] font-semibold text-[color:var(--primary)]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.1em]">
                      {label}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="tv-hard-shadow relative aspect-video overflow-hidden border-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-low)]">
              <div className="absolute inset-0 opacity-30 grayscale">
                <Image
                  className="object-cover"
                  alt="Global node map"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUuBOIQpfBu4jC-DbkvlTIRrHtjPDlG3EAfA6-ZVinpBavwiVT7sWsm8sPiV_kf3MVYvQ9yTxicYlIjSsblNuB4y9b83Gc1veeRmhtTGrm5erU7r5sHikT1VNA3LMy6Ivcrx2tvhIi8JyZ-IaJgUIrrgC710i4bpneThOEpPbdruIAEWBY0vOlxBXtcWP-ApNK58x-YrctyaKxw9bo2k1R_ZGaHKHFgreNZnV9BGPbQIdciaEyClK9NmB-RurbwYHz_xkpJHY7Djvv"
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
              </div>

              <div className="absolute right-6 top-6 flex items-center gap-4 border-2 border-[color:var(--on-background)] bg-[color:var(--background)] p-4">
                <div className="h-4 w-4 rounded-full bg-[color:var(--primary)]" />
                <span className="text-xs font-bold uppercase tracking-[0.1em]">
                  ACTIVE NODES: 2,491
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

import { Calendar, Clock, MapPin, Video } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { FeaturedEvent } from '@/data/homeDiscover'
import { cn } from '@/lib/cn'

export function FeaturedEventCard(props: { event: FeaturedEvent; className?: string }) {
  const { event } = props

  return (
    <Link
      href={`/events/${event.key}`}
      className={cn(
        'tv-card group block overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--card-hover)]',
        props.className,
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/10 bg-black/20">
        {event.posterUrl ? (
          <Image
            alt={event.title}
            src={event.posterUrl}
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,251,212,0.12),transparent_55%),radial-gradient(circle_at_75%_30%,rgba(255,251,212,0.06),transparent_60%)]" />
        )}

        {event.badge ? (
          <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--ink)] backdrop-blur">
            {event.badge}
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="tv-kicker text-[10px] font-semibold tracking-wider text-[color:var(--ink-muted)]">
          Featured · {event.organizer}
        </div>

        <div className="mt-3">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-[color:var(--ink)] transition-colors duration-150 group-hover:text-[color:var(--ink-highlight)]">
            {event.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-[color:var(--ink-muted)]">
            {event.description}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--ink-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 flex-none opacity-60" aria-hidden="true" />
              {event.time}
            </span>
            <span className="opacity-50">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 flex-none opacity-60" aria-hidden="true" />
              {event.date}
            </span>
            {event.venueType ? (
              <>
                <span className="opacity-50">•</span>
                <span className="flex items-center gap-1 font-medium text-[color:var(--ink)]">
                  {event.venueType === 'ONLINE' ? (
                    <>
                      <Video className="h-3.5 w-3.5 flex-none opacity-70" aria-hidden="true" />
                      Online
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3.5 w-3.5 flex-none opacity-70" aria-hidden="true" />
                      <span className="max-w-[150px] truncate" title={event.locationText ?? 'In-person'}>
                        {event.locationText || 'In-person'}
                      </span>
                    </>
                  )}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}


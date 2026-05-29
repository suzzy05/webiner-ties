import { Calendar, Clock, MapPin, Video } from 'lucide-react'
import Link from 'next/link'
import type { FeaturedEvent } from '@/data/homeDiscover'
import { cn } from '@/lib/cn'

/**
 * A light, paper-like featured event card.
 *
 * Design note:
 * We purposely avoid "glass" effects and heavy gradients. The goal is to match
 * the crisp, high-contrast feel of the 100x-style reference while keeping the
 * Tiesverse palette (white + orange).
 */
export function FeaturedEventCard(props: {
  event: FeaturedEvent
  className?: string
}) {
  const { event } = props

  return (
    <Link
      href={`/events/${event.key}`}
      className={cn(
        'tv-card group block p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-l-4 border-l-[color:var(--brand)]',
        props.className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="tv-kicker text-[10px] font-semibold tracking-wider text-[color:var(--ink-muted)]">
          Featured · {event.organizer}
        </div>
        {event.badge ? (
          <span className="rounded-full bg-[color:var(--brand)] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            {event.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[color:var(--ink)] transition-colors duration-150 group-hover:text-[color:var(--brand)]">
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
                    <span
                      className="max-w-[150px] truncate"
                      title={event.locationText ?? 'In-person'}
                    >
                      {event.locationText || 'In-person'}
                    </span>
                  </>
                )}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  )
}


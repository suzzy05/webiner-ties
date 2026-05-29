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
        'tv-card group block overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        props.className,
      )}
    >
      <div className="relative h-32 bg-[color:var(--paper-muted)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(255,99,67,0.38),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_75%,rgba(17,17,17,0.08),transparent_55%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(17,17,17,0.18)_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--stroke-strong)] bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
            <span className="tv-display text-2xl leading-none text-[color:var(--brand)]">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {event.badge ? (
          <span className="absolute right-3 top-3 rounded-full bg-[color:var(--brand)] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            {event.badge}
          </span>
        ) : null}
      </div>

      <div className="p-4">
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

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-[color:var(--stroke)] pt-3">
          <span className="text-xs text-[color:var(--ink-muted)]">
            by{' '}
            <span className="font-medium text-[color:var(--ink)]">
              {event.organizer}
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}


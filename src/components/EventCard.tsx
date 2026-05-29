import Link from 'next/link'
import { Calendar, MapPin, Video } from 'lucide-react'
import type { ListedEvent } from '@/server/events'
import { formatEventDateTime } from '@/lib/format'
import { TagChips } from './TagChips'
import { cn } from '@/lib/cn'

/**
 * Primary listing card used on `/discover` and organizer pages.
 *
 * Style goal:
 * Crisp "paper" surfaces with orange accents (no glass, no neon gradients).
 */
export function EventCard(props: { event: ListedEvent; className?: string }) {
  const { event } = props
  const isOnline = event.venueType === 'ONLINE'

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        'tv-card group block overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        props.className,
      )}
    >
      <div className="relative h-28 bg-[color:var(--paper-muted)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(255,99,67,0.38),transparent_60%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(17,17,17,0.18)_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-[color:var(--brand)]" />

        <div className="absolute inset-0 flex items-center gap-3 px-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--stroke-strong)] bg-white shadow-sm">
            <span className="tv-display text-xl leading-none text-[color:var(--brand)]">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="tv-kicker text-[10px] font-semibold text-[color:var(--ink-muted)]">
              {isOnline ? 'Online' : 'In person'}
            </div>
            <div className="truncate text-xs font-medium text-[color:var(--ink)]">
              {event.organizer.name}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[color:var(--ink)] transition-colors duration-150 group-hover:text-[color:var(--brand)]">
          {event.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-[color:var(--ink-muted)]">
          {event.summary}
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--ink-muted)]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 flex-none opacity-60" aria-hidden="true" />
            {formatEventDateTime({
              startAt: new Date(event.startAt),
              endAt: event.endAt ? new Date(event.endAt) : null,
              timezone: event.timezone,
            })}
          </span>
          <span className="opacity-50">•</span>
          <span className="flex items-center gap-1 font-medium text-[color:var(--ink)]">
            {isOnline ? (
              <>
                <Video className="h-3.5 w-3.5 flex-none opacity-70" aria-hidden="true" />
                Online
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 flex-none opacity-70" aria-hidden="true" />
                <span
                  className="max-w-[220px] truncate"
                  title={event.locationText ?? 'In-person'}
                >
                  {event.locationText || 'In-person'}
                </span>
              </>
            )}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-[color:var(--stroke)] pt-3">
          <TagChips tags={event.tagList} />
          <span className="text-xs text-[color:var(--ink-muted)]">
            {event._count.rsvps}{' '}
            <span className="text-[color:var(--ink)]">RSVPs</span>
          </span>
        </div>
      </div>
    </Link>
  )
}


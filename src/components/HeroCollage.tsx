import { cn } from '@/lib/cn'

type Bubble = {
  name: string
  role: string
  message: string
  accent?: boolean
}

const BUBBLES: Bubble[] = [
  {
    name: 'Tiesverse Events',
    role: 'Feed',
    message: 'New event: Fireside Chat • Bengaluru • 2:00 PM',
  },
  {
    name: 'Organizer',
    role: 'Host',
    message: 'Quick reminder: add the meeting link before publishing.',
  },
  {
    name: 'Attendee',
    role: 'RSVP',
    message: 'Booked my spot. See you there!',
    accent: true,
  },
  {
    name: 'Tiesverse Events',
    role: 'Feed',
    message: 'Tip: filter by tag = webinar to find upcoming online sessions.',
  },
]

/**
 * Right-side hero collage.
 *
 * It's "inspired by" the reference layout: a dark panel that looks like a live
 * community feed. We keep it fully local (no external images) so it loads fast
 * and avoids stock-photo energy.
 */
export function HeroCollage(props: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[22px] bg-[#0b0b0b] text-white shadow-sm',
        props.className,
      )}
    >
      {/* Dotted / grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:14px_14px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,99,67,0.35),transparent_55%)]" />

      {/* Feed cards */}
      <div className="relative p-5">
        <div className="tv-kicker text-[10px] font-semibold text-white/60">
          Live feed (demo)
        </div>
        <div className="mt-2 text-sm font-semibold text-white/85">
          What people see when they browse
        </div>

        <div className="mt-4 space-y-3">
          {BUBBLES.map((b, idx) => (
            <div
              key={`${b.name}-${idx}`}
              className={cn(
                'rounded-xl border bg-white/95 p-3 text-black shadow-sm',
                b.accent
                  ? 'border-[color:var(--brand)]'
                  : 'border-white/15',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 flex-none items-center justify-center rounded-full text-[10px] font-semibold',
                    b.accent
                      ? 'bg-[color:var(--brand)] text-white'
                      : 'bg-black/10 text-black/70',
                  )}
                  aria-hidden="true"
                >
                  Photo
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <div className="text-xs font-semibold text-black">
                      {b.name}
                    </div>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black/60">
                      {b.role}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-black/75">{b.message}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

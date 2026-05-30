/**
 * GoogleMapEmbed
 *
 * - If `embedUrl` is provided, we render it as-is.
 * - Otherwise we build an embed URL from `location`.
 *
 * Renders a "View on Google Maps" link underneath the iframe for deep-linking.
 */

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

function buildSrc(location: string): string {
  const encoded = encodeURIComponent(location)
  if (API_KEY) {
    // Embed API v1 — most reliable, requires Maps Embed API enabled in GCP.
    return `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encoded}&zoom=15`
  }
  // Fallback: classic embed (no key needed).
  return `https://maps.google.com/maps?q=${encoded}&t=&z=15&output=embed`
}

export function GoogleMapEmbed(props: {
  location: string
  embedUrl?: string | null
  mapsLinkUrl?: string | null
  height?: number
  variant?: 'soft' | 'hard'
  className?: string
}) {
  const src = props.embedUrl || buildSrc(props.location)
  const mapsLink =
    props.mapsLinkUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.location)}`

  const variant = props.variant ?? 'soft'
  const frameClassName =
    variant === 'hard'
      ? 'overflow-hidden border-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-high)]'
      : 'overflow-hidden rounded-2xl border border-[color:var(--stroke)] shadow-sm'

  return (
    <div className={props.className}>
      <div className={frameClassName}>
        <iframe
          src={src}
          width="100%"
          height={props.height ?? 220}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block"
          title={`Map showing ${props.location}`}
        />
      </div>
      <a
        href={mapsLink}
        target="_blank"
        rel="noreferrer"
        className={
          variant === 'hard'
            ? 'mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)] hover:underline'
            : 'mt-2 inline-flex items-center gap-1 text-xs font-medium text-[color:var(--brand)] hover:underline'
        }
      >
        View on Google Maps →
      </a>
    </div>
  )
}


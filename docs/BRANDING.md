# Branding + Theming Guide

This repo is set up so a designer/dev can rebrand it quickly without hunting
through dozens of files.

## Colors (palette tokens)

All core colors are CSS variables defined in:

- `src/app/globals.css`

Key tokens:

- `--brand` / `--brand-600` / `--brand-700`: the orange accent and hover states
- `--paper` / `--paper-muted`: page surfaces (cards, sections)
- `--ink` / `--ink-muted`: text colors
- `--stroke` / `--stroke-strong`: borders and dividers

Rule of thumb:

- Update variables, not individual components.
- Components should reference tokens (e.g. `var(--brand)`), not hard-coded hex.

## Typography (fonts)

Fonts are configured in:

- `src/app/layout.tsx`

This app uses:

- Body font: `Inter` (variable `--font-body`)
- Display font: `Bebas Neue` (variable `--font-display`)

To change typography:

1. Swap the `next/font/google` imports in `src/app/layout.tsx`
2. Keep the CSS variables (`--font-body`, `--font-display`) the same
3. Confirm headings (`.tv-display`) still look balanced after the change

## Logo / Wordmark

Header logo is a small React component:

- `src/components/TiesverseMark.tsx`

If you need the real brand logo:

- Replace `TiesverseMark` with an SVG (preferred) or `next/image`
- Keep it a single component so the rest of the layout stays unchanged

The header wrapper lives in:

- `src/components/SiteHeader.tsx`

## Layout + Component style

Most pages use the same set of building blocks:

- `tv-shell`, `tv-outer` (page framing)
- `tv-card`, `tv-card-muted` (surfaces)
- `tv-divider` (section separators)
- `tv-kicker`, `tv-display` (type rhythm)

Those utilities are defined in:

- `src/app/globals.css`

If you want to match a new design system:

- Start by adjusting the CSS tokens and these utility classes.
- Only then tweak individual components (cards, buttons, forms).

## Quick checklist (rebrand in ~15 minutes)

1. Update CSS variables in `src/app/globals.css`
2. Swap fonts in `src/app/layout.tsx` (optional)
3. Replace `src/components/TiesverseMark.tsx` with the official logo/wordmark
4. Verify:
   - Home (`/`)
   - Listing (`/discover`)
   - Event details (`/events/[slug]`)
   - Admin (`/admin`)


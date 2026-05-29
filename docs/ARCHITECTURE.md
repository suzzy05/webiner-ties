# Architecture

This app uses **Next.js App Router** for UI routes, and **Route Handlers** for
backend endpoints.

## High-level

- UI: `src/app/*`
- UI components: `src/components/*`
- Server/data layer: `src/server/*`
- Local SQL database (SQLite): `.data/tiesverse.db`
- Seed content source (first run only): `src/data/mockEvents.ts`

## Routes

- `GET /` - landing page with highlights
- `GET /discover` - searchable listing
- `GET /events/[slug]` - event details + ticket modal
- `GET /organizers/[handle]` - organizer page

## Backend (Route Handlers)

- `GET /api/events` - list events (supports `q`, `tag`, `venue` query params)
- `GET /api/events/[slug]` - event detail JSON
- `POST /api/events/[slug]/rsvps` - create RSVP (public)

## Data model (today)

There is a database (local-only).

- Events + RSVP submissions are stored in a file-backed SQLite DB via `@libsql/client`.
- Default seed data is inserted from `src/data/mockEvents.ts` only when the DB is empty.

## Notes on rendering

- Pages are Server Components by default.
- Interactivity is isolated to small Client Components:
  - `src/components/DiscoverControls.tsx`
  - `src/components/RegistrationModal.tsx`
  - `src/components/RsvpForm.tsx`

## When you add a database later

Keep the public API shape stable (`/api/events/*`) and swap `src/server/events.ts`
to read/write from the DB instead of `src/data/mockEvents.ts`.

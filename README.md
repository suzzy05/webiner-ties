# Tiesverse Events

An events + webinar discovery site for **Tiesverse** (white + orange branding),
built with **React** and **Next.js (App Router)**.

This repo uses a **local file-backed SQLite database** by default, so you can
iterate like a real product without needing any hosted infra.

Important: the UI is inspired by modern event discovery patterns, but it is
**not** meant to be a pixel-perfect copy of any third-party website.

## What you get

- `/discover` listing with search + venue + tag filtering
- Event detail pages at `/events/[slug]` (Markdown descriptions)
- RSVP endpoint (demo storage, no email sending yet)
- JSON API endpoints under `/api/events/*`
- Admin panel at `/admin` (create events, manage RSVP questions, view RSVPs)

## Quick start

1. Create `.env` (optional):
   - Copy `.env.example` -> `.env`
   - Set `NEXT_PUBLIC_SITE_URL` if you care about canonical metadata in prod.
   - Set `ADMIN_PASSWORD` to access `/admin`.

2. Run the dev server:
   - `npm run dev`
   - Open `http://localhost:3000`

## Local SQL database

By default the app uses a file-backed SQLite database at:

- `.data/tiesverse.db`

You can change it with `DATABASE_URL` (see `.env.example`).

To reset everything locally, stop the dev server and delete `.data/tiesverse.db`.

## Editing events

There are two ways to iterate:

1) Use the admin panel (recommended)

- Open `http://localhost:3000/admin`
- Sign in with `ADMIN_PASSWORD`
- Create events, edit RSVP questions, and view RSVPs

2) Edit the seed file (first-run defaults only)

The app seeds the database from:

- `src/data/mockEvents.ts`

If your local DB is empty, those events are inserted on first run. After that,
the DB becomes the source of truth.

## Scripts

- `npm run dev` - dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - ESLint
- `npm run format` - Prettier check
- `npm run typecheck` - TypeScript typecheck

## Docs

- `docs/ARCHITECTURE.md` - code + data flow overview
- `docs/API.md` - endpoints + examples
- `docs/BRANDING.md` - where to change logo/colors/typography quickly

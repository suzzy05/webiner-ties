# Low-Level Design — Tiesverse Webinar Platform

**Last updated:** 2026-05-30  
**Stack:** Next.js 16 (App Router) · TypeScript · Turso (LibSQL/SQLite) · Tailwind CSS v4  
**Database:** Turso cloud — `libsql://tiesverse-webinar-krisjscott.aws-ap-south-1.turso.io`

---

## 1. System Overview

Tiesverse Webinar is a public-facing event discovery and registration platform. It lets anyone browse upcoming webinars/meetups, RSVP with a multi-step form, and receive a confirmation ticket ID. Admins can create events and view all registrations through a password-protected panel.

### Key capabilities

| Capability | Who | Mechanism |
|---|---|---|
| Browse & filter events | Public | `/discover`, `/` |
| View event detail + register | Public | `/events/[slug]` |
| Submit RSVP | Public | `POST /api/events/[slug]/rsvps` |
| Create events | Admin | `POST /api/admin/events` |
| View registrations | Admin | `GET /api/admin/events/[id]/rsvps` |
| Add RSVP questions | Admin | `POST /api/admin/events/[id]/questions` |

---

## 2. Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.2.6 | App Router, Node.js runtime |
| Language | TypeScript | 6.x | Strict mode |
| Database client | @libsql/client | 0.17.x | Works with both local SQLite file and Turso cloud |
| Cloud database | Turso (LibSQL) | — | SQLite-compatible, edge replicas |
| Validation | Zod | 4.x | API request validation |
| Styling | Tailwind CSS | 4.x | With `@tailwindcss/postcss` |
| Date formatting | date-fns + date-fns-tz | 4.x / 3.x | Timezone-aware formatting |
| Icons | lucide-react | 1.x | — |
| Markdown | react-markdown | 10.x | Event descriptions |
| Class merging | clsx + tailwind-merge | — | `cn()` utility |

---

## 3. Directory Structure

```
src/
├── app/                          # Next.js App Router pages and API routes
│   ├── layout.tsx                # Root layout (fonts, header, footer)
│   ├── page.tsx                  # Homepage — hero + featured events
│   ├── discover/page.tsx         # Filterable event listing
│   ├── events/[slug]/page.tsx    # Event detail + RSVP modal
│   ├── organizers/[handle]/page.tsx
│   ├── admin/
│   │   ├── page.tsx              # Admin shell (server component)
│   │   └── ui/
│   │       ├── AdminClient.tsx   # Admin dashboard (client component)
│   │       └── AdminLogin.tsx    # Login form
│   ├── api/
│   │   ├── events/
│   │   │   ├── route.ts                    # GET  /api/events
│   │   │   └── [slug]/
│   │   │       ├── route.ts                # GET  /api/events/[slug]
│   │   │       ├── form/route.ts           # GET  /api/events/[slug]/form
│   │   │       └── rsvps/route.ts          # POST /api/events/[slug]/rsvps
│   │   └── admin/
│   │       ├── events/
│   │       │   ├── route.ts                # GET/POST /api/admin/events
│   │       │   └── [id]/
│   │       │       ├── rsvps/route.ts      # GET  /api/admin/events/[id]/rsvps
│   │       │       └── questions/route.ts  # GET/POST /api/admin/events/[id]/questions
│   │       ├── login/route.ts              # POST /api/admin/login
│   │       └── logout/route.ts            # POST /api/admin/logout
│   └── [about|pricing|signin|docs|help|get-the-app]/page.tsx
│
├── components/                   # Shared React components
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── EventCard.tsx
│   ├── FeaturedEventCard.tsx
│   ├── FeaturedCalendarCard.tsx
│   ├── CategoryCard.tsx
│   ├── DiscoverControls.tsx
│   ├── LocalEventsExplorer.tsx
│   ├── RegisterButton.tsx
│   ├── RegistrationModal.tsx
│   ├── RsvpForm.tsx
│   ├── WebinarRegisterCard.tsx
│   ├── WebinarDetailTabs.tsx
│   ├── EventAboutTabs.tsx
│   ├── TagChips.tsx
│   ├── GoogleMapEmbed.tsx
│   ├── HeaderClock.tsx
│   ├── HeroCollage.tsx
│   ├── TiesverseMark.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Container.tsx
│
├── server/                       # Server-only modules (never imported client-side)
│   ├── db.ts                     # DB client singleton + schema init + migrations
│   ├── events.ts                 # Event + RSVP form query functions
│   ├── rsvps.ts                  # RSVP submission query functions
│   ├── adminAuth.ts              # Admin cookie auth helper
│   └── defaultRsvpForm.ts        # Default RSVP question definitions
│
├── data/
│   ├── mockEvents.ts             # Seed data + shared TypeScript types
│   └── homeDiscover.ts           # Static data for homepage discover section
│
└── lib/
    ├── cn.ts                     # clsx + tailwind-merge utility
    ├── format.ts                 # formatEventDateTime helper
    └── slug.ts                   # slugify helper
```

---

## 4. Database Design

### 4.1 Technology choice — Turso (LibSQL)

The project uses `@libsql/client` which is Turso's own library. In development the client connects to a local SQLite file (`file:./.data/tiesverse.db`). In production it connects to the Turso cloud database via `DATABASE_URL` + `DATABASE_AUTH_TOKEN`. No code changes are needed to switch between the two — only environment variables differ.

### 4.2 Schema

#### `organizers`
Stores organizer profiles. Extracted from the inline `events` columns so a single profile update touches one row.

```sql
CREATE TABLE organizers (
  handle     TEXT PRIMARY KEY,          -- e.g. 'tiesverse'
  name       TEXT NOT NULL,
  bio        TEXT,
  website    TEXT,
  created_at TEXT NOT NULL,             -- ISO 8601
  updated_at TEXT NOT NULL
);
```

#### `events`
Core event metadata. `organizer_name/bio/website` columns are kept for backward compatibility — canonical organizer data is in the `organizers` table.

```sql
CREATE TABLE events (
  id                TEXT PRIMARY KEY,   -- UUID
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  summary           TEXT NOT NULL,
  description_md    TEXT NOT NULL,
  poster_url        TEXT,
  tags_csv          TEXT NOT NULL DEFAULT '',  -- kept for full-text search; canonical = event_tags
  venue_type        TEXT NOT NULL,      -- 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  meeting_url       TEXT,
  location_text     TEXT,
  maps_embed_url    TEXT,
  maps_link_url     TEXT,
  start_at          TEXT NOT NULL,      -- ISO 8601
  end_at            TEXT,
  timezone          TEXT NOT NULL,      -- IANA tz e.g. 'Asia/Kolkata'
  capacity          INTEGER,            -- NULL = unlimited
  is_published      INTEGER NOT NULL DEFAULT 1,  -- 0 | 1
  organizer_handle  TEXT NOT NULL,      -- FK to organizers.handle
  organizer_name    TEXT NOT NULL DEFAULT '',    -- denormalised copy (backward compat)
  organizer_bio     TEXT,
  organizer_website TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
```

#### `tags`
Tag name registry. Each unique tag name exists exactly once.

```sql
CREATE TABLE tags (
  name TEXT PRIMARY KEY                 -- lowercase, e.g. 'webinar'
);
```

#### `event_tags`
Many-to-many join between events and tags. Enables accurate tag filtering without LIKE on CSV.

```sql
CREATE TABLE event_tags (
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL REFERENCES tags(name) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_name)
);
```

#### `tickets`
Ticket types per event (free or paid). A single event can have multiple ticket tiers.

```sql
CREATE TABLE tickets (
  id             TEXT PRIMARY KEY,      -- UUID (generated; mock 'general' IDs are not globally unique)
  event_id       TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,         -- e.g. 'General Admission'
  description    TEXT,
  price_in_paise INTEGER NOT NULL DEFAULT 0,  -- 0 = free
  quantity       INTEGER,               -- NULL = unlimited
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL
);
```

#### `rsvp_questions`
Dynamic form fields per event. Supports 3 steps (personal / professional / final) and 6 field types.

```sql
CREATE TABLE rsvp_questions (
  id           TEXT PRIMARY KEY,        -- UUID
  event_id     TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  step         TEXT NOT NULL,           -- 'personal' | 'professional' | 'final'
  ord          INTEGER NOT NULL,        -- display order within step (10, 20, 30…)
  key          TEXT,                    -- machine key e.g. 'full_name'
  label        TEXT NOT NULL,           -- display label
  field_type   TEXT NOT NULL,           -- 'text'|'email'|'tel'|'number'|'select'|'textarea'
  required     INTEGER NOT NULL DEFAULT 1,  -- 0 | 1
  options_json TEXT,                    -- JSON array of strings; only for field_type='select'
  placeholder  TEXT,
  created_at   TEXT NOT NULL
);
```

#### `rsvp_submissions`
One row per registration. Structured fields mirror the default form questions. `ticket_id` is the human-readable confirmation code (e.g. `TV-XDI67Q`).

```sql
CREATE TABLE rsvp_submissions (
  id            TEXT PRIMARY KEY,       -- UUID (internal)
  event_id      TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_id_ref TEXT REFERENCES tickets(id) ON DELETE SET NULL,
  ticket_id     TEXT NOT NULL UNIQUE,   -- TV-XXXXXX confirmation code
  created_at    TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  whatsapp      TEXT,
  role          TEXT,
  org           TEXT,
  country       TEXT,
  city          TEXT,
  heard_from    TEXT,
  hope_to_learn TEXT
);
```

#### `rsvp_answers`
Answers to custom (non-default) questions. Keyed by submission + question ID.

```sql
CREATE TABLE rsvp_answers (
  submission_id TEXT NOT NULL REFERENCES rsvp_submissions(id) ON DELETE CASCADE,
  question_id   TEXT NOT NULL REFERENCES rsvp_questions(id)   ON DELETE CASCADE,
  value         TEXT,
  PRIMARY KEY (submission_id, question_id)
);
```

### 4.3 Entity Relationship Diagram

```
organizers
    │ 1
    │ has many
    ▼ N
  events ──────────── event_tags ──── tags
    │                                 (name PK)
    │ 1
    │ has many
    ▼ N
  tickets
    │
    │ referenced by
    ▼
  rsvp_submissions ◄─ rsvp_answers ──► rsvp_questions
  (per event)           (per submission)   (per event)
```

### 4.4 Indexes

| Index name | Table | Columns | Purpose |
|---|---|---|---|
| `idx_events_start_at` | events | `start_at` | Default date-sorted listing |
| `idx_events_published` | events | `is_published, start_at` | Filter published + sort |
| `idx_events_organizer` | events | `organizer_handle` | Organizer profile page |
| `idx_event_tags_event` | event_tags | `event_id` | Tags lookup per event |
| `idx_event_tags_tag` | event_tags | `tag_name` | Events lookup per tag |
| `idx_tickets_event` | tickets | `event_id, sort_order` | Ordered ticket list per event |
| `idx_questions_event` | rsvp_questions | `event_id, step, ord` | Ordered form per event |
| `idx_submissions_event` | rsvp_submissions | `event_id, created_at DESC` | Admin RSVP list |
| `idx_submissions_email` | rsvp_submissions | `event_id, email` | Duplicate email check |

### 4.5 Migration strategy

All schema creation and migrations run inside `initDb()` in `src/server/db.ts` on the first request after server start. The approach is fully automatic — no CLI migration tool is needed.

- **Fresh DB:** `CREATE TABLE IF NOT EXISTS` creates all tables correctly.
- **Existing DB (schema changes):** `ALTER TABLE … ADD COLUMN` statements with `.catch(() => null)` silently skip already-existing columns.
- **Data migrations:** `INSERT OR IGNORE` populates the `organizers` table from inline event columns, and splits `tags_csv` into `tags` + `event_tags` rows.

---

## 5. API Design

All routes are under `src/app/api/`. Response format is JSON. Error responses follow `{ error: string }`.

### 5.1 Public Event API

#### `GET /api/events`
Returns a list of events. Supports filtering.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `q` | string | Full-text search on title, summary, location, tags |
| `tag` | string | Exact tag match via `event_tags` table |
| `venue` | `ONLINE \| IN_PERSON \| HYBRID` | Venue type filter |

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "slug": "event-slug",
      "title": "...",
      "summary": "...",
      "descriptionMd": "...",
      "coverImageUrl": null,
      "tagList": ["webinar", "product"],
      "startAt": "2026-07-05T06:00:00.000Z",
      "endAt": "2026-07-05T07:00:00.000Z",
      "timezone": "Asia/Kolkata",
      "venueType": "ONLINE",
      "meetingUrl": "https://...",
      "locationText": null,
      "mapsEmbedUrl": null,
      "mapsLinkUrl": null,
      "capacity": null,
      "isPublished": true,
      "organizer": { "handle": "tiesverse", "name": "Tiesverse", "bio": "...", "website": "..." },
      "_count": { "rsvps": 42 }
    }
  ]
}
```

---

#### `GET /api/events/[slug]`
Returns a single event by slug. Returns `404` if not found.

**Response:** `{ "event": <EventObject> }`

---

#### `GET /api/events/[slug]/form`
Returns the RSVP form definition for an event (event ID + ordered question list).

**Response:**
```json
{
  "event": { "id": "uuid", "slug": "event-slug" },
  "questions": [
    {
      "id": "uuid",
      "step": "personal",
      "ord": 10,
      "key": "full_name",
      "label": "Full name",
      "fieldType": "text",
      "required": true,
      "placeholder": "Your name"
    }
  ]
}
```

---

#### `POST /api/events/[slug]/rsvps`
Submits an RSVP for an event.

**Request body:**
```json
{
  "structured": {
    "fullName": "string",
    "email": "string (email)",
    "whatsapp": "string",
    "role": "string",
    "org": "string",
    "country": "string",
    "city": "string",
    "heardFrom": "string",
    "hopeToLearn": "string"
  },
  "answers": {
    "<question_id>": "answer value"
  }
}
```

**Validation (Zod schema):** All `structured` fields validated with min/max lengths. `answers` is a free `Record<string, unknown>`.

**Server-side checks (in order):**
1. Event must exist → `404`
2. Email must not already be registered for this event → `409`
3. All required questions must have non-empty answers → `400`

**Success response (201):**
```json
{ "ok": true, "ticketId": "TV-XDI67Q", "createdAt": "2026-05-30T08:28:02.839Z" }
```

**Error responses:**

| Status | Body | Condition |
|---|---|---|
| 404 | `{ "error": "Event not found" }` | Slug doesn't exist |
| 409 | `{ "error": "Already registered with this email" }` | Duplicate email per event |
| 400 | `{ "error": "Invalid RSVP" }` | Missing required answer |

---

### 5.2 Admin API

All admin routes check `isAdminAuthed()` and return `401` if not authenticated.

> **Note:** `isAdminAuthed()` in `src/server/adminAuth.ts` currently returns `true` unconditionally (stub). The login/logout routes are implemented and set a `tv_admin` httpOnly cookie — the auth check just needs to be wired to read that cookie.

#### `GET /api/admin/events`
Returns all events (up to 200) with RSVP counts.

#### `POST /api/admin/events`
Creates a new event. Upserts the Tiesverse organizer and seeds default RSVP questions.

**Request body schema:**

| Field | Type | Notes |
|---|---|---|
| `title` | string (3–140) | Required |
| `summary` | string (3–280) | Required |
| `descriptionMd` | string (max 20,000) | Required |
| `posterUrl` | URL \| null | Optional |
| `tagsCsv` | string | Comma-separated tags |
| `venueType` | `ONLINE \| IN_PERSON \| HYBRID` | Required |
| `meetingUrl` | URL \| null | Optional |
| `locationText` | string \| null | Optional |
| `mapsEmbedUrl` | URL \| null | Optional |
| `mapsLinkUrl` | URL \| null | Optional |
| `startAt` | ISO date string | Required |
| `endAt` | ISO date string \| null | Optional |
| `timezone` | IANA tz string | Default: `Asia/Kolkata` |

**Success response (201):** `{ "ok": true, "event": { "id": "uuid", "slug": "..." } }`

---

#### `GET /api/admin/events/[id]/rsvps`
Returns all RSVP submissions for an event (latest first, up to 500), including custom answer values.

**Response:**
```json
{
  "rsvps": [
    {
      "id": "uuid",
      "ticket_id": "TV-XDI67Q",
      "created_at": "...",
      "full_name": "Test User",
      "email": "...",
      "whatsapp": "...",
      "role": "...",
      "org": "...",
      "country": "...",
      "city": "...",
      "heard_from": "...",
      "hope_to_learn": "...",
      "answers": { "<question_id>": "value" }
    }
  ]
}
```

---

#### `GET /api/admin/events/[id]/questions`
Returns all RSVP form questions for an event.

#### `POST /api/admin/events/[id]/questions`
Adds a custom question to an event's RSVP form.

**Request body:**

| Field | Type |
|---|---|
| `step` | `personal \| professional \| final` |
| `ord` | integer (1–10000) |
| `label` | string (2–140) |
| `fieldType` | `text \| email \| tel \| number \| select \| textarea` |
| `required` | boolean |
| `optionsCsv` | string (for select fields) |
| `placeholder` | string (optional) |

---

#### `POST /api/admin/login`
Validates the `ADMIN_PASSWORD` env var against the submitted password. Sets a `tv_admin` httpOnly cookie on success (12-hour expiry, `secure` in production).

#### `POST /api/admin/logout`
Clears the `tv_admin` cookie by setting `maxAge: 0`.

---

## 6. Server Layer

### `src/server/db.ts` — DB client and schema init

Single exported function: `getDb()`.

- Returns a singleton `@libsql/client` `Client` instance.
- On first call, creates the local `.data/` directory (for file: URLs) and calls `initDb()`.
- `initDb()` runs `CREATE TABLE IF NOT EXISTS` for all 7 tables, backward-compatible `ALTER TABLE … ADD COLUMN` migrations, data migrations (organizers backfill, tags split), and index creation.
- `DATABASE_AUTH_TOKEN` env var is passed to `createClient()` — undefined for local file DB (ignored by the client), required for Turso cloud.

```
getDb()
  └── ensureLocalDir(url)        — mkdir .data/ for file: URLs
  └── createClient({ url, authToken })
  └── initDb(client)
        ├── CREATE TABLE organizers
        ├── CREATE TABLE events
        ├── ALTER TABLE events ADD COLUMN capacity / is_published
        ├── CREATE TABLE tags, event_tags, tickets
        ├── CREATE TABLE rsvp_questions, rsvp_submissions, rsvp_answers
        ├── Data migration: organizers ← events
        ├── Data migration: event_tags ← events.tags_csv (JS loop)
        └── CREATE INDEX (×9)
```

---

### `src/server/events.ts` — Event queries

| Export | Type | Description |
|---|---|---|
| `listEvents(input)` | async fn | Filtered + paginated event list. JOINs organizers + event_tags. Supports `q`, `tag`, `venue`, `after`, `before`, `take`. |
| `getEventBySlug(slug)` | async fn | Single event by slug. Same JOIN. Returns `null` if not found. |
| `getTicketsForEvent(eventId)` | async fn | Ordered ticket list for an event. |
| `getRsvpFormForEvent(eventId)` | async fn | All RSVP questions for an event, ordered by step + ord. |
| `addRsvpQuestionToEvent(eventId, input)` | async fn | Inserts a new custom question. |
| `createEvent(input)` | async fn | Creates event, upserts organizer, inserts tags + event_tags, seeds default questions. |
| `createRsvp(input)` | async fn | Validates + delegates to `createRsvpSubmission`. Returns typed result union. |
| `ListedEvent` | type | Return type of a single element from `listEvents()`. |
| `ListEventsInput` | type | Input type for `listEvents()`. |

**`ensureSeeded()`** (internal): Runs once on the first query. If the `events` table is empty, inserts all `mockEvents` with organizers, tags, tickets, and default RSVP questions.

**`rowToEvent()`** (internal): Maps a raw DB row (with JOINed organizer columns and `GROUP_CONCAT(tag_name)`) into the typed event shape returned by all public functions.

**Tag query pattern:**
- General search (`q`): uses `LOWER(e.tags_csv) LIKE ?` (simple, acceptable for broad text search)
- Dedicated tag filter: uses `EXISTS (SELECT 1 FROM event_tags WHERE event_id = e.id AND tag_name = ?)` — accurate, no false positives from substring matching

---

### `src/server/rsvps.ts` — RSVP submission queries

| Export | Description |
|---|---|
| `getRsvpCount(eventId)` | Count of submissions for an event. |
| `listRsvpsForEvent(eventId)` | All submissions + their custom answers (up to 500). |
| `createRsvpSubmission(input)` | Inserts submission row + all answer rows. Generates `TV-XXXXXX` ticket ID (retries up to 3× on collision). |

**Ticket ID generation:** `TV-` prefix + 6 random alphanumeric chars (`Math.random().toString(36).slice(2, 8).toUpperCase()`). Collision probability is negligible at current scale.

---

### `src/server/adminAuth.ts` — Authentication

| Export | Description |
|---|---|
| `isAdminAuthed()` | **Currently returns `true` unconditionally (stub).** Needs to be wired to read the `tv_admin` cookie and compare it to `ADMIN_PASSWORD`. |
| `adminCookieName()` | Returns the cookie name `'tv_admin'`. |

**To complete auth:** Uncomment and restore the `cookies()` import from `next/headers` and validate `cookies().get(COOKIE_NAME)?.value === process.env.ADMIN_PASSWORD`.

---

### `src/server/defaultRsvpForm.ts` — Default question set

`buildDefaultRsvpQuestions()` returns 9 `RsvpQuestionInput` objects (new UUIDs each call):

| Step | Field | Key | Type |
|---|---|---|---|
| personal | Full name | `full_name` | text |
| personal | Email address | `email` | email |
| personal | WhatsApp number | `whatsapp` | tel |
| professional | Current role | `role` | select |
| professional | Affiliated org / university | `org` | text |
| professional | Country | `country` | text |
| professional | City | `city` | text |
| final | How did you hear about us? | `heard_from` | select |
| final | What do you hope to learn? | `hope_to_learn` | textarea |

---

## 7. Frontend Architecture

### Pages

| Route | Type | Description |
|---|---|---|
| `/` | Server component | Hero, featured events, discover section |
| `/discover` | Server component | Full filterable listing via `DiscoverControls` |
| `/events/[slug]` | Server component | Event detail, register button, map |
| `/organizers/[handle]` | Server component | Organizer profile + their events |
| `/admin` | Server + Client | Login gate → admin dashboard |
| `/about`, `/pricing`, `/signin`, `/docs`, `/help`, `/get-the-app` | Static | Marketing / info pages |

### Key components

| Component | Description |
|---|---|
| `SiteHeader` | Nav with logo, links, clock |
| `EventCard` | Compact event card with tag chips, date, venue badge |
| `FeaturedEventCard` | Larger card for hero/featured sections |
| `DiscoverControls` | Client-side filter bar (venue, tag, search) |
| `RegisterButton` | Opens `RegistrationModal` on click |
| `RegistrationModal` | Full-screen modal wrapping `RsvpForm` |
| `RsvpForm` | Multi-step form driven by questions from `/api/events/[slug]/form` |
| `WebinarRegisterCard` | Sidebar card on event detail page |
| `GoogleMapEmbed` | Iframe map for in-person events |
| `TagChips` | Renders event tag list |
| `HeaderClock` | Live clock in header (client component) |

### Data flow — RSVP registration

```
User clicks "Register"
  → RegisterButton opens RegistrationModal
  → RsvpForm fetches GET /api/events/[slug]/form
  → Renders questions grouped by step (personal → professional → final)
  → On final submit: POST /api/events/[slug]/rsvps
      → Server: dedup check → required answer validation → createRsvpSubmission()
  → Success: show ticket ID (TV-XXXXXX) to user
```

---

## 8. Environment Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | No | `file:./.data/tiesverse.db` | Turso URL for production; SQLite file path for local dev |
| `DATABASE_AUTH_TOKEN` | Production only | — | Turso auth token. Ignored for `file:` URLs. |
| `ADMIN_PASSWORD` | Yes | — | Password for `/admin` login |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Canonical URL for metadata |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | — | Google Maps Embed API key for in-person events |

### Local development
```
DATABASE_URL=file:./.data/tiesverse.db   ← default; no auth token needed
```

### Production (Turso)
```
DATABASE_URL=libsql://tiesverse-webinar-krisjscott.aws-ap-south-1.turso.io
DATABASE_AUTH_TOKEN=<token from: turso db tokens create tiesverse-webinar>
```

---

## 9. Known Limitations & Future Work

| Area | Current state | Recommended fix |
|---|---|---|
| **Admin auth** | `isAdminAuthed()` always returns `true` | Restore cookie read in `adminAuth.ts` |
| **RSVP validation** | Required-field check uses question IDs from DB; structured fields validated only by Zod | Add server-side cross-check that structured fields match required questions with matching keys |
| **Ticket ID collisions** | Retries 3× on collision; `TV-XXXXXX` has ~2B space | Sufficient at current scale; swap to UUID-based if volume exceeds ~100K tickets |
| **`tags_csv` retained** | Kept as a backward-compat column and used in full-text search | Could be dropped once FTS is moved fully to `event_tags` |
| **No image upload** | `poster_url` / `coverImageUrl` accepts any URL string | Add Cloudflare R2 or Supabase Storage for managed uploads |
| **Admin creates events only as `tiesverse` organizer** | `createEvent` hardcodes the organizer; `organizer` input param is optional | Expose organizer selector in admin UI |
| **No pagination on admin RSVP list** | Hard-capped at 500 rows | Add cursor-based pagination when events grow large |
| **No email confirmation** | Ticket ID is shown on screen only | Integrate Resend / SendGrid to email ticket on RSVP success |

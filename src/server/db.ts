import { createClient, type Client } from '@libsql/client'
import { mkdir } from 'node:fs/promises'

let client: Client | null = null
let initPromise: Promise<void> | null = null

function dbUrl() {
  return process.env.DATABASE_URL ?? 'file:./.data/tiesverse.db'
}

async function ensureLocalDir(url: string) {
  if (!url.startsWith('file:')) return
  const path = url.replace(/^file:/, '')
  const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  if (idx <= 0) return
  const dir = path.slice(0, idx)
  if (!dir) return
  await mkdir(dir, { recursive: true }).catch(() => null)
}

async function initDb(c: Client) {
  await c.execute('PRAGMA foreign_keys = ON;')

  // ── Tables ─────────────────────────────────────────────────────────────────

  await c.execute(`
    CREATE TABLE IF NOT EXISTS organizers (
      handle     TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      bio        TEXT,
      website    TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id                TEXT PRIMARY KEY,
      slug              TEXT NOT NULL UNIQUE,
      title             TEXT NOT NULL,
      summary           TEXT NOT NULL,
      description_md    TEXT NOT NULL,
      poster_url        TEXT,
      tags_csv          TEXT NOT NULL DEFAULT '',
      venue_type        TEXT NOT NULL,
      meeting_url       TEXT,
      location_text     TEXT,
      maps_embed_url    TEXT,
      maps_link_url     TEXT,
      start_at          TEXT NOT NULL,
      end_at            TEXT,
      timezone          TEXT NOT NULL,
      capacity          INTEGER,
      is_published      INTEGER NOT NULL DEFAULT 1,
      organizer_handle  TEXT NOT NULL,
      organizer_name    TEXT NOT NULL DEFAULT '',
      organizer_bio     TEXT,
      organizer_website TEXT,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );
  `)

  // Migrations for columns added after initial schema.
  await c.execute(`ALTER TABLE events ADD COLUMN capacity INTEGER;`).catch(() => null)
  await c.execute(`ALTER TABLE events ADD COLUMN is_published INTEGER NOT NULL DEFAULT 1;`).catch(() => null)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      name TEXT PRIMARY KEY
    );
  `)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS event_tags (
      event_id TEXT NOT NULL,
      tag_name TEXT NOT NULL,
      PRIMARY KEY (event_id, tag_name),
      FOREIGN KEY (event_id) REFERENCES events(id)  ON DELETE CASCADE,
      FOREIGN KEY (tag_name) REFERENCES tags(name)  ON DELETE CASCADE
    );
  `)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS tickets (
      id             TEXT PRIMARY KEY,
      event_id       TEXT NOT NULL,
      name           TEXT NOT NULL,
      description    TEXT,
      price_in_paise INTEGER NOT NULL DEFAULT 0,
      quantity       INTEGER,
      sort_order     INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS rsvp_questions (
      id           TEXT PRIMARY KEY,
      event_id     TEXT NOT NULL,
      step         TEXT NOT NULL,
      ord          INTEGER NOT NULL,
      key          TEXT,
      label        TEXT NOT NULL,
      field_type   TEXT NOT NULL,
      required     INTEGER NOT NULL DEFAULT 1,
      options_json TEXT,
      placeholder  TEXT,
      created_at   TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `)

  // Backward-compatible migrations for rsvp_questions.
  await c.execute(`ALTER TABLE rsvp_questions ADD COLUMN key TEXT;`).catch(() => null)
  await c.execute(`
    UPDATE rsvp_questions
    SET key =
      CASE
        WHEN key IS NOT NULL AND key <> '' THEN key
        WHEN LOWER(label) = 'full name'                   THEN 'full_name'
        WHEN LOWER(label) = 'email address'               THEN 'email'
        WHEN LOWER(label) = 'whatsapp number'             THEN 'whatsapp'
        WHEN LOWER(label) = 'current role'                THEN 'role'
        WHEN LOWER(label) = 'affiliated org / university' THEN 'org'
        WHEN LOWER(label) = 'country'                     THEN 'country'
        WHEN LOWER(label) = 'city'                        THEN 'city'
        WHEN LOWER(label) = 'how did you hear about us?'  THEN 'heard_from'
        WHEN LOWER(label) = 'what do you hope to learn?'  THEN 'hope_to_learn'
        ELSE key
      END
    WHERE key IS NULL OR key = '';
  `)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS rsvp_submissions (
      id            TEXT PRIMARY KEY,
      event_id      TEXT NOT NULL,
      ticket_id_ref TEXT,
      ticket_id     TEXT NOT NULL UNIQUE,
      created_at    TEXT NOT NULL,
      full_name     TEXT NOT NULL,
      email         TEXT NOT NULL,
      whatsapp      TEXT,
      role          TEXT,
      org           TEXT,
      country       TEXT,
      city          TEXT,
      heard_from    TEXT,
      hope_to_learn TEXT,
      FOREIGN KEY (event_id)      REFERENCES events(id)  ON DELETE CASCADE,
      FOREIGN KEY (ticket_id_ref) REFERENCES tickets(id) ON DELETE SET NULL
    );
  `)

  await c.execute(`ALTER TABLE rsvp_submissions ADD COLUMN ticket_id_ref TEXT;`).catch(() => null)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS rsvp_answers (
      submission_id TEXT NOT NULL,
      question_id   TEXT NOT NULL,
      value         TEXT,
      PRIMARY KEY (submission_id, question_id),
      FOREIGN KEY (submission_id) REFERENCES rsvp_submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id)   REFERENCES rsvp_questions(id)   ON DELETE CASCADE
    );
  `)

  // ── Data migrations ────────────────────────────────────────────────────────

  // Populate organizers from inline events columns (idempotent via INSERT OR IGNORE).
  await c.execute(`
    INSERT OR IGNORE INTO organizers (handle, name, bio, website, created_at, updated_at)
    SELECT organizer_handle, organizer_name, organizer_bio, organizer_website, created_at, updated_at
    FROM events
    WHERE organizer_handle IS NOT NULL AND organizer_name != '';
  `)

  // Populate tags + event_tags from tags_csv (SQLite has no split(), must be done in JS).
  const tagRows = await c.execute(
    `SELECT id, tags_csv FROM events WHERE tags_csv IS NOT NULL AND tags_csv != ''`,
  )
  for (const row of tagRows.rows) {
    const eventId = String((row as any).id)
    const tagNames = String((row as any).tags_csv ?? '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    for (const tagName of tagNames) {
      await c.execute({ sql: `INSERT OR IGNORE INTO tags (name) VALUES (?)`, args: [tagName] })
      await c
        .execute({
          sql: `INSERT OR IGNORE INTO event_tags (event_id, tag_name) VALUES (?, ?)`,
          args: [eventId, tagName],
        })
        .catch(() => null)
    }
  }

  // ── Indexes ────────────────────────────────────────────────────────────────

  await c.execute(`CREATE INDEX IF NOT EXISTS idx_events_start_at   ON events(start_at);`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_events_published   ON events(is_published, start_at);`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_events_organizer   ON events(organizer_handle);`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_event_tags_event   ON event_tags(event_id);`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_event_tags_tag     ON event_tags(tag_name);`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_tickets_event      ON tickets(event_id, sort_order);`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_questions_event    ON rsvp_questions(event_id, step, ord);`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_submissions_event  ON rsvp_submissions(event_id, created_at DESC);`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_submissions_email  ON rsvp_submissions(event_id, email);`)
}

export async function getDb() {
  if (!client) {
    const url = dbUrl()
    await ensureLocalDir(url)
    client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
  }

  if (!initPromise) {
    initPromise = initDb(client).catch((err) => {
      initPromise = null
      throw err
    })
  }
  await initPromise
  return client
}

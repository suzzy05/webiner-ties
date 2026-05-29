import { createClient, type Client } from '@libsql/client'
import { mkdir } from 'node:fs/promises'

let client: Client | null = null
let initPromise: Promise<void> | null = null

function dbUrl() {
  // Use a file-backed DB by default (dummy local SQL database).
  // You can override with a different file path (or a remote libsql url) via env.
  return process.env.DATABASE_URL ?? 'file:./.data/tiesverse.db'
}

async function ensureLocalDir(url: string) {
  // For `file:` URLs we create a local folder so the DB can be written.
  // This is a no-op for other URL schemes.
  if (!url.startsWith('file:')) return
  // `file:./.data/tiesverse.db` -> `./.data`
  const path = url.replace(/^file:/, '')
  const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  if (idx <= 0) return
  const dir = path.slice(0, idx)
  if (!dir) return
  await mkdir(dir, { recursive: true }).catch(() => null)
}

async function initDb(c: Client) {
  // Enable FK constraints for this connection (SQLite defaults to OFF).
  await c.execute('PRAGMA foreign_keys = ON;')

  await c.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      description_md TEXT NOT NULL,
      poster_url TEXT,
      tags_csv TEXT NOT NULL DEFAULT '',
      venue_type TEXT NOT NULL,
      meeting_url TEXT,
      location_text TEXT,
      maps_embed_url TEXT,
      maps_link_url TEXT,
      start_at TEXT NOT NULL,
      end_at TEXT,
      timezone TEXT NOT NULL,
      organizer_handle TEXT NOT NULL,
      organizer_name TEXT NOT NULL,
      organizer_bio TEXT,
      organizer_website TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS rsvp_questions (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      step TEXT NOT NULL,
      ord INTEGER NOT NULL,
      key TEXT,
      label TEXT NOT NULL,
      field_type TEXT NOT NULL,
      required INTEGER NOT NULL DEFAULT 1,
      options_json TEXT,
      placeholder TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `)

  // Backwards-compatible migration (in case the table existed before we added `key`).
  await c
    .execute(`ALTER TABLE rsvp_questions ADD COLUMN key TEXT;`)
    .catch(() => null)

  // Best-effort backfill for older rows (created before we had the `key` column).
  // This keeps the RSVP flow working even if the DB already exists.
  await c.execute(`
    UPDATE rsvp_questions
    SET key =
      CASE
        WHEN key IS NOT NULL AND key <> '' THEN key
        WHEN LOWER(label) = 'full name' THEN 'full_name'
        WHEN LOWER(label) = 'email address' THEN 'email'
        WHEN LOWER(label) = 'whatsapp number' THEN 'whatsapp'
        WHEN LOWER(label) = 'current role' THEN 'role'
        WHEN LOWER(label) = 'affiliated org / university' THEN 'org'
        WHEN LOWER(label) = 'country' THEN 'country'
        WHEN LOWER(label) = 'city' THEN 'city'
        WHEN LOWER(label) = 'how did you hear about us?' THEN 'heard_from'
        WHEN LOWER(label) = 'what do you hope to learn?' THEN 'hope_to_learn'
        ELSE key
      END
    WHERE key IS NULL OR key = '';
  `)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS rsvp_submissions (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      ticket_id TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT,
      role TEXT,
      org TEXT,
      country TEXT,
      city TEXT,
      heard_from TEXT,
      hope_to_learn TEXT,
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `)

  await c.execute(`
    CREATE TABLE IF NOT EXISTS rsvp_answers (
      submission_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      value TEXT,
      PRIMARY KEY(submission_id, question_id),
      FOREIGN KEY(submission_id) REFERENCES rsvp_submissions(id) ON DELETE CASCADE,
      FOREIGN KEY(question_id) REFERENCES rsvp_questions(id) ON DELETE CASCADE
    );
  `)

  await c.execute(`
    CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
  `)

  await c.execute(`
    CREATE INDEX IF NOT EXISTS idx_questions_event ON rsvp_questions(event_id, step, ord);
  `)

  await c.execute(`
    CREATE INDEX IF NOT EXISTS idx_submissions_event ON rsvp_submissions(event_id, created_at DESC);
  `)
}

/**
 * Returns the singleton DB client and ensures tables exist.
 *
 * We keep the implementation intentionally small:
 * this is a "dummy" local SQL DB for development and demos, not a full-blown
 * production persistence layer.
 */
export async function getDb() {
  if (!client) {
    const url = dbUrl()
    await ensureLocalDir(url)
    client = createClient({ url })
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

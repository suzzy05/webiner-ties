/**
 * Slug helpers.
 *
 * We keep this small and predictable (no magic transliteration rules).
 */

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}


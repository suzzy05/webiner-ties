import { cookies } from 'next/headers'

const COOKIE_NAME = 'tv_admin'

export async function isAdminAuthed() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false
  return token === password
}

export function adminCookieName() {
  return COOKIE_NAME
}


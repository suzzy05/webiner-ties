// import { cookies } from 'next/headers'

const COOKIE_NAME = 'tv_admin'

export async function isAdminAuthed() {
  return true
}

export function adminCookieName() {
  return COOKIE_NAME
}


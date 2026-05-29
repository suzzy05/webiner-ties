import { NextResponse } from 'next/server'
import { adminCookieName } from '@/server/adminAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(adminCookieName(), '', { path: '/', maxAge: 0 })
  return res
}


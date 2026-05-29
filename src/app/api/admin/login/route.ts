import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminCookieName } from '@/server/adminAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const schema = z.object({
  password: z.string().min(1),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const input = schema.safeParse(body)
  if (!input.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD is not set' },
      { status: 500 },
    )
  }

  if (input.data.password !== expected) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(adminCookieName(), expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return res
}


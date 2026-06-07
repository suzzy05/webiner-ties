import { checkPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const password: string = body?.password ?? ''

  if (!password || !(await checkPassword(password))) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await createSessionToken()

  const res = Response.json({ ok: true })
  res.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  )
  return res
}

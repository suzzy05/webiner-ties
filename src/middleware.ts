import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'tv_admin_session'

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return buf
}

async function isValidAdminToken(token: string): Promise<boolean> {
  const dotIdx = token.lastIndexOf('.')
  if (dotIdx < 0) return false
  const payload = token.slice(0, dotIdx)
  const sigHex = token.slice(dotIdx + 1)

  try {
    const secret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? 'insecure'
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBytes(sigHex),
      new TextEncoder().encode(payload),
    )
    if (!valid) return false

    const exp = parseInt(payload.split(':')[1] ?? '0', 10)
    return Date.now() / 1000 < exp
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only gate /admin routes (not /admin/login itself)
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/login/' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (token && (await isValidAdminToken(token))) {
    return NextResponse.next()
  }

  // API routes return 401; page routes redirect to login
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL('/admin/login', req.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

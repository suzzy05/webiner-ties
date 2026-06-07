const COOKIE_NAME = 'tv_admin_session'
const SESSION_DURATION_SECS = 7 * 24 * 60 * 60

function getSecret(): string {
  return process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? 'insecure-fallback'
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

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

export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECS
  const payload = `admin:${exp}`
  const key = await getHmacKey(getSecret())
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${bytesToHex(sig)}`
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const dotIdx = token.lastIndexOf('.')
  if (dotIdx < 0) return false
  const payload = token.slice(0, dotIdx)
  const sigHex = token.slice(dotIdx + 1)

  try {
    const key = await getHmacKey(getSecret())
    const valid = await globalThis.crypto.subtle.verify(
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

export { COOKIE_NAME }

export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD ?? ''
  if (!expected || expected === 'change-me') return false

  // Timing-safe comparison: HMAC both strings with a random ephemeral key
  const key = await globalThis.crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const enc = new TextEncoder()
  const [inputSig, expectedSig] = await Promise.all([
    globalThis.crypto.subtle.sign('HMAC', key, enc.encode(input)),
    globalThis.crypto.subtle.sign('HMAC', key, enc.encode(expected)),
  ])
  const a = new Uint8Array(inputSig)
  const b = new Uint8Array(expectedSig)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

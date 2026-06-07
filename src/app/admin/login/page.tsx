'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/admin'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const submit = () => {
    startTransition(async () => {
      setError('')
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push(from)
        router.refresh()
      } else {
        setError('Incorrect password. Try again.')
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-[color:var(--ink-highlight)]">TIESVERSE</p>
          <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">Admin access</h1>
          <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Enter your admin password to continue.</p>
        </div>

        <div className="rounded-2xl border border-white/08 bg-[color:var(--card)] p-6">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              disabled={isPending}
              autoFocus
              className="tv-input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={!password || isPending}
            className="tv-btn tv-btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

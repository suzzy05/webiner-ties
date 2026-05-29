'use client'

import { useState } from 'react'

export function AdminLogin() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!password.trim()) {
      setStatus('error')
      setMessage('Password is required.')
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as any
        setStatus('error')
        setMessage(json?.error ?? 'Could not sign in.')
        return
      }
      window.location.reload()
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message ?? 'Network error occurred.')
    }
  }

  return (
    <form onSubmit={submit} className="tv-card tv-card-muted max-w-md p-6 shadow-sm">
      <div className="text-sm font-semibold text-[color:var(--ink)]">
        Admin sign-in
      </div>
      <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
        Set `ADMIN_PASSWORD` in your `.env` to access this page.
      </p>

      <div className="mt-5">
        <label className="mb-1 block text-xs font-semibold text-[color:var(--ink-muted)]">
          Password
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="h-10 w-full rounded-lg border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--ink)] shadow-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--brand),white_70%)]"
        />
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--brand)] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--brand-600)]"
      >
        {status === 'loading' ? 'Signing in…' : 'Sign in'}
      </button>

      {status === 'error' ? (
        <div className="mt-4 rounded-xl border border-rose-600/30 bg-rose-500/10 p-3 text-sm text-rose-900">
          {message}
        </div>
      ) : null}
    </form>
  )
}


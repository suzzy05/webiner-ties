'use client'

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg px-3 py-1.5 text-sm text-[color:var(--ink-muted)] transition-colors hover:bg-white/06 hover:text-[color:var(--ink)]"
    >
      Sign out
    </button>
  )
}

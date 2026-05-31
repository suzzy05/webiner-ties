'use client'

import { useState } from 'react'

export function ThemeToggle() {
  // The inline script in layout.tsx sets data-theme before React hydrates,
  // so reading from the DOM here gives the correct initial value on the client.
  // On the server, document is undefined, so we default to 'dark'.
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof document === 'undefined') return 'dark'
    return (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') ?? 'dark'
  })

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('tv-theme', next)
  }

  return (
    <button
      onClick={toggle}
      className="tv-btn px-3 py-2 text-sm"
      aria-label={theme === 'dark' ? 'Switch to cappuccino light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Cappuccino light mode' : 'Dark mode'}
      suppressHydrationWarning
    >
      <span
        className="material-symbols-outlined text-[18px] leading-none"
        suppressHydrationWarning
      >
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  )
}

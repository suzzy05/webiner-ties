'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

function formatNow() {
  const d = new Date()
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
  const tz = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'short',
  })
    .formatToParts(d)
    .find((p) => p.type === 'timeZoneName')?.value
  return tz ? `${time} ${tz}` : time
}

export function HeaderClock() {
  const [value, setValue] = useState<string>(() => formatNow())

  useEffect(() => {
    const id = setInterval(() => setValue(formatNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={cn('text-xs text-[color:var(--ink-muted)]')}>{value}</div>
  )
}

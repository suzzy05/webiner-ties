'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/cn'

type Tab = 'description' | 'photos'

export function EventAboutTabs({ descriptionMd }: { descriptionMd: string }) {
  const [tab, setTab] = useState<Tab>('description')

  return (
    <div>
      {/* Pill tab switcher */}
      <div className="mt-4 flex gap-2">
        {(['description', 'photos'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full border px-5 py-1.5 text-sm font-semibold capitalize transition-colors',
              tab === t
                ? 'border-[color:var(--brand)] bg-[color:var(--brand)] text-white'
                : 'border-[color:var(--stroke)] bg-white text-[color:var(--ink-muted)] hover:bg-[color:var(--paper-muted)] hover:text-[color:var(--ink)]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'description' && (
        <div className="markdown mt-6 text-sm leading-relaxed text-[color:var(--ink)]">
          <ReactMarkdown>{descriptionMd}</ReactMarkdown>
        </div>
      )}
      {tab === 'photos' && (
        <p className="mt-6 text-sm italic text-[color:var(--ink-muted)]">
          No photos uploaded yet.
        </p>
      )}
    </div>
  )
}

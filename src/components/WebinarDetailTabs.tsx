'use client'

import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/cn'

type Tab = 'desc' | 'details' | 'speakers'

export function WebinarDetailTabs(props: {
  descriptionMd: string
  details: Array<{ label: string; value: string }>
  speaker: { name: string; title: string; imageUrl?: string | null }
  className?: string
}) {
  const [tab, setTab] = useState<Tab>('desc')

  const tabButton = (key: Tab, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setTab(key)}
      className={cn(
        'px-6 py-4 text-sm font-semibold border-b-2 transition-all',
        tab === key
          ? 'border-[color:var(--ink-highlight)] text-[color:var(--ink)]'
          : 'border-transparent text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]',
      )}
    >
      {label}
    </button>
  )

  const normalizedDetails = useMemo(
    () =>
      props.details
        .filter((item) => item.value.trim())
        .map((item) => ({ ...item, label: item.label.toUpperCase() })),
    [props.details],
  )

  return (
    <div className={props.className}>
      <div className="flex border-b border-white/10">
        {tabButton('desc', 'Description')}
        {tabButton('details', 'Details')}
        {tabButton('speakers', 'Speakers')}
      </div>

      {tab === 'desc' ? (
        <div className="mt-6 space-y-6 animate-in fade-in duration-500">
          <div className="text-[16px] leading-relaxed text-[color:var(--ink-muted)]">
            <ReactMarkdown>{props.descriptionMd}</ReactMarkdown>
          </div>
        </div>
      ) : null}

      {tab === 'details' ? (
        <div className="mt-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 gap-1">
            {normalizedDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-6 border-b border-white/10 py-4"
              >
                <span className="tv-label">
                  {item.label}
                </span>
                <span className="text-[16px] font-semibold text-[color:var(--ink)]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'speakers' ? (
        <div className="mt-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 flex-none overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--card)]" />
            <div>
              <div className="text-[18px] font-semibold text-[color:var(--ink)]">
                {props.speaker.name}
              </div>
              <div className="mt-2 text-sm font-medium text-[color:var(--ink-muted)]">
                {props.speaker.title}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


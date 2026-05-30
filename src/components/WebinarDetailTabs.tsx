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
        'px-6 py-4 text-[15px] font-semibold uppercase border-b-4 transition-all',
        tab === key
          ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
          : 'border-transparent text-[color:var(--on-surface-variant)] hover:text-[color:var(--primary)]',
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
      <div className="flex border-b-2 border-[color:var(--outline-editorial)]">
        {tabButton('desc', 'Description')}
        {tabButton('details', 'Details')}
        {tabButton('speakers', 'Speakers')}
      </div>

      {tab === 'desc' ? (
        <div className="mt-6 space-y-6 animate-in fade-in duration-500">
          <div className="text-[18px] leading-relaxed text-[color:var(--on-surface-variant)]">
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
                className="flex items-start justify-between gap-6 border-b border-[color:var(--outline-editorial)] py-4"
              >
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--on-surface-variant)]">
                  {item.label}
                </span>
                <span className="text-[16px] font-semibold text-[color:var(--on-background)]">
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
            <div className="h-24 w-24 flex-none overflow-hidden border-2 border-[color:var(--on-background)] bg-[color:var(--surface-container-high)]" />
            <div>
              <div className="text-[20px] font-semibold uppercase tracking-tight text-[color:var(--on-background)]">
                {props.speaker.name}
              </div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]">
                {props.speaker.title}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


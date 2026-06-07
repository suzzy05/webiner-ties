'use client'

import { useState } from 'react'
import { formatInTimeZone } from 'date-fns-tz'

type Registrant = {
  id: string
  ticket_id: string
  created_at: string
  full_name: string
  email: string
  whatsapp: string
  role: string
  org: string
  country: string
  city: string
  heard_from: string
  hope_to_learn: string
}

export function RegistrantsTable({ registrants }: { registrants: Registrant[] }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = registrants.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.org.toLowerCase().includes(q) ||
      r.ticket_id.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="border-b border-white/06 px-6 py-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="tv-input w-full max-w-sm text-sm"
          placeholder="Search by name, email, org, ticket…"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/05">
              <Th>#</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>WhatsApp</Th>
              <Th>Role</Th>
              <Th>Org / Uni</Th>
              <Th>Country</Th>
              <Th>Ticket</Th>
              <Th>Registered</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-sm text-[color:var(--ink-muted)]">
                  No results.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <>
                  <tr
                    key={r.id}
                    className="border-b border-white/04 last:border-0 hover:bg-white/02 cursor-pointer"
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    <Td className="text-[color:var(--ink-muted)]">{i + 1}</Td>
                    <Td className="font-medium">{r.full_name}</Td>
                    <Td className="text-[color:var(--ink-muted)]">{r.email}</Td>
                    <Td className="text-[color:var(--ink-muted)]">{r.whatsapp || '—'}</Td>
                    <Td>{r.role || '—'}</Td>
                    <Td>{r.org || '—'}</Td>
                    <Td>{r.country ? `${r.city ? r.city + ', ' : ''}${r.country}` : '—'}</Td>
                    <Td className="font-mono text-xs text-[color:var(--ink-highlight)]">{r.ticket_id}</Td>
                    <Td className="text-[color:var(--ink-muted)] whitespace-nowrap">
                      {formatInTimeZone(new Date(r.created_at), 'UTC', 'MMM d, HH:mm')}
                    </Td>
                  </tr>
                  {expanded === r.id && (
                    <tr key={`${r.id}-expanded`} className="bg-white/02 border-b border-white/04">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Detail label="How they heard" value={r.heard_from} />
                          <Detail label="What they hope to learn" value={r.hope_to_learn} />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[color:var(--ink-muted)] whitespace-nowrap">
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-[color:var(--ink)] ${className ?? ''}`}>{children}</td>
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[color:var(--ink-muted)]">{label}</p>
      <p className="mt-0.5 text-sm text-[color:var(--ink)]">{value || '—'}</p>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/Container'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Tiesverse — the community behind the webinars.',
}

const stats = [
  { value: '40+', label: 'Webinars hosted' },
  { value: '8k+', label: 'Registered attendees' },
  { value: '12',  label: 'Topic categories' },
  { value: '30+', label: 'Expert speakers' },
]

const values = [
  {
    icon: 'diversity_3',
    title: 'Community first',
    body: 'Every event is built around genuine learning and connection — not lead gen. No upsells, no noise.',
  },
  {
    icon: 'open_in_new',
    title: 'Always open',
    body: 'Our webinars are free or pay-what-you-can. Knowledge shouldn\'t have a paywall.',
  },
  {
    icon: 'check_circle',
    title: 'Quality over quantity',
    body: 'We\'d rather host fewer, well-prepared sessions than flood your calendar with filler.',
  },
  {
    icon: 'handshake',
    title: 'Speaker respect',
    body: 'We treat every speaker as a collaborator — not a content resource. Their time matters.',
  },
]

const team = [
  {
    name: 'Arjun Mehta',
    role: 'Founder & Host',
    bio: 'Connector by nature. Runs the community, curates speakers, and occasionally asks way too many questions live.',
  },
  {
    name: 'Priya Nair',
    role: 'Head of Programs',
    bio: 'Keeps events on time, on topic, and actually useful. Responsible for the post-event follow-ups you actually read.',
  },
  {
    name: 'Ravi Shankar',
    role: 'Tech & Platform',
    bio: 'Keeps the infrastructure humming so you can RSVP without a three-step login ritual.',
  },
]

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-0">

      {/* Hero */}
      <section className="mb-16">
        <p className="tv-section-label mb-4">About us</p>
        <h1 className="tv-display max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
          A corner of the internet where{' '}
          <span className="tv-highlight">real conversations</span> happen.
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[color:var(--ink-muted)]">
          Tiesverse is a community-run platform for webinars, workshops, and live discussions.
          We bring together practitioners, learners, and curious minds — no polished decks required.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/discover" className="tv-btn tv-btn-primary px-6 py-3 text-[15px]">
            <span className="material-symbols-outlined text-[18px]">explore</span>
            Browse events
          </Link>
          <Link href="/contact" className="tv-btn px-6 py-3 text-[15px]">
            Get in touch
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="tv-card p-6 text-center">
              <div className="tv-display text-3xl font-bold text-[color:var(--accent)]">{s.value}</div>
              <div className="mt-1 text-sm text-[color:var(--ink-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mb-16">
        <div className="tv-card tv-card-glow p-8 sm:p-10">
          <p className="tv-section-label mb-4">Our story</p>
          <h2 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
            Started as a Slack thread. Became something bigger.
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[color:var(--ink-muted)]">
            <p>
              In 2022, a group of professionals kept asking the same question in various community chats:
              &ldquo;Is there a good webinar on this topic?&rdquo; Half the time the answer was no.
              The other half, the event existed but nobody knew about it.
            </p>
            <p>
              So we started hosting our own. Short, focused, no-fluff sessions with people who actually
              do the work. The response was immediate — turns out a lot of people are hungry for
              conversations that skip the slide deck and get to the point.
            </p>
            <p>
              Tiesverse grew from there. Today we run webinars across technology, design, business,
              and career development, all under one roof with a simple RSVP and no account required.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <p className="tv-section-label mb-2">What we stand for</p>
        <h2 className="tv-display mb-8 text-2xl font-semibold text-[color:var(--ink)]">Our values</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="tv-card tv-card-hover p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--accent-dim)]">
                <span className="material-symbols-outlined text-[20px] text-[color:var(--accent)]">{v.icon}</span>
              </div>
              <h3 className="mb-2 font-semibold text-[color:var(--ink)]">{v.title}</h3>
              <p className="text-sm leading-relaxed text-[color:var(--ink-muted)]">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-16">
        <p className="tv-section-label mb-2">The people</p>
        <h2 className="tv-display mb-8 text-2xl font-semibold text-[color:var(--ink)]">Who runs this</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="tv-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--accent-dim)] text-lg font-bold text-[color:var(--accent)]">
                {member.name.charAt(0)}
              </div>
              <div className="font-semibold text-[color:var(--ink)]">{member.name}</div>
              <div className="tv-section-label mt-0.5 mb-3 normal-case tracking-normal text-[0.72rem]">{member.role}</div>
              <p className="text-sm leading-relaxed text-[color:var(--ink-muted)]">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="tv-card rounded-[24px] p-8 text-center sm:p-12" style={{ background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)' }}>
          <p className="tv-section-label mb-3">Join the community</p>
          <h2 className="tv-display text-2xl font-semibold text-[color:var(--ink)]">
            Got a topic you want to see covered?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[color:var(--ink-muted)]">
            We actively take suggestions for webinar topics and speaker nominations.
            Drop us a message — if there&apos;s enough interest, we&apos;ll make it happen.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="tv-btn tv-btn-primary px-7 py-3">
              Suggest a topic
            </Link>
            <Link href="/discover" className="tv-btn px-6 py-3">
              See upcoming events
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}

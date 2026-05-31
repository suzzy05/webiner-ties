import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/Container'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Tiesverse team.',
}

const faqs = [
  {
    q: 'How do I RSVP for a webinar?',
    a: 'Find an event on the Discover page, open the detail page, and click Register. No account needed — just your name and email.',
  },
  {
    q: 'Are the webinars recorded?',
    a: 'Most sessions are recorded. Check the event page after it ends — recordings are usually posted within 48 hours.',
  },
  {
    q: 'Can I propose a speaker or topic?',
    a: 'Absolutely. Use the form on this page and select "Speaker proposal" as the subject. We review all suggestions.',
  },
  {
    q: 'I want to host a webinar with Tiesverse — how?',
    a: 'We collaborate with organisations and individuals who want to reach our community. Reach out via the contact form and we\'ll set up a quick call.',
  },
]

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-0">

      {/* Header */}
      <section className="mb-14">
        <p className="tv-section-label mb-4">Contact</p>
        <h1 className="tv-display max-w-2xl text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
          We&apos;d love to hear from you.
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[color:var(--ink-muted)]">
          Questions, feedback, speaker proposals, or just a hello — send it over.
          We typically respond within one business day.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

        {/* Contact form */}
        <div className="lg:col-span-3">
          <div className="tv-card p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-[color:var(--ink)]">Send a message</h2>
            <form className="space-y-5" action="#" method="POST">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rsvp-field">
                  <label htmlFor="contact-name">
                    Name <span className="rsvp-required">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="tv-input"
                  />
                </div>
                <div className="rsvp-field">
                  <label htmlFor="contact-email">
                    Email <span className="rsvp-required">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="tv-input"
                  />
                </div>
              </div>

              <div className="rsvp-field">
                <label htmlFor="contact-subject">Subject</label>
                <select id="contact-subject" name="subject" className="tv-input">
                  <option value="">Select a topic…</option>
                  <option value="general">General question</option>
                  <option value="rsvp">RSVP / registration help</option>
                  <option value="speaker">Speaker proposal</option>
                  <option value="host">Host a webinar with us</option>
                  <option value="feedback">Feedback on an event</option>
                  <option value="other">Something else</option>
                </select>
              </div>

              <div className="rsvp-field">
                <label htmlFor="contact-message">
                  Message <span className="rsvp-required">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us what's on your mind…"
                  className="tv-input"
                />
              </div>

              <button type="submit" className="tv-btn tv-btn-primary w-full py-3 text-[15px]">
                <span className="material-symbols-outlined text-[18px]">send</span>
                Send message
              </button>

              <p className="text-center text-xs text-[color:var(--ink-muted)]">
                We&apos;ll only use your email to reply to this message.
              </p>
            </form>
          </div>
        </div>

        {/* Side info */}
        <div className="space-y-5 lg:col-span-2">

          {/* Direct contact */}
          <div className="tv-card p-6">
            <h3 className="mb-4 font-semibold text-[color:var(--ink)]">Direct channels</h3>
            <div className="space-y-4">
              <a
                href="mailto:hello@tiesverse.com"
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[color:var(--accent-dim)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-dim)]">
                  <span className="material-symbols-outlined text-[18px] text-[color:var(--accent)]">mail</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[color:var(--ink)]">Email us</div>
                  <div className="text-xs text-[color:var(--ink-muted)]">hello@tiesverse.com</div>
                </div>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[color:var(--accent-dim)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-dim)]">
                  <span className="material-symbols-outlined text-[18px] text-[color:var(--accent)]">forum</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[color:var(--ink)]">Community chat</div>
                  <div className="text-xs text-[color:var(--ink-muted)]">Join our Discord server</div>
                </div>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[color:var(--accent-dim)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-dim)]">
                  <span className="material-symbols-outlined text-[18px] text-[color:var(--accent)]">alternate_email</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[color:var(--ink)]">Twitter / X</div>
                  <div className="text-xs text-[color:var(--ink-muted)]">@tiesverse</div>
                </div>
              </a>
            </div>
          </div>

          {/* Response time */}
          <div className="tv-card tv-card-glow p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[color:var(--accent)]">schedule</span>
              <span className="font-semibold text-[color:var(--ink)]">Response time</span>
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--ink-muted)]">
              We read every message. Expect a reply within{' '}
              <span className="font-medium text-[color:var(--ink)]">1–2 business days</span>.
              For urgent event issues, email directly.
            </p>
          </div>

        </div>
      </div>

      {/* FAQ */}
      <section className="mt-16">
        <p className="tv-section-label mb-2">Common questions</p>
        <h2 className="tv-display mb-8 text-2xl font-semibold text-[color:var(--ink)]">FAQs</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.q} className="tv-card tv-card-hover p-6">
              <div className="mb-2 font-semibold text-[color:var(--ink)]">{item.q}</div>
              <p className="text-sm leading-relaxed text-[color:var(--ink-muted)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-12 text-center">
        <p className="text-sm text-[color:var(--ink-muted)]">
          Just want to explore?{' '}
          <Link href="/discover" className="font-medium text-[color:var(--accent)] underline underline-offset-2 hover:no-underline">
            Browse upcoming webinars →
          </Link>
        </p>
      </section>

    </main>
  )
}

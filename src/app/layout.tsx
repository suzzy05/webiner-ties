import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { Inter, Bebas_Neue } from 'next/font/google'

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const display = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: '400',
})

export const metadata: Metadata = {
  title: {
    default: 'Tiesverse Events',
    template: '%s - Tiesverse Events',
  },
  description: 'Discover webinars and events from Tiesverse.',
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} antialiased`}>
        <div className="tv-outer">
          <div className="tv-shell">
            <SiteHeader />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}

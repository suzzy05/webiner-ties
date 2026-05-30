import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { Chivo, Libre_Franklin, Poppins } from 'next/font/google'

const body = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const display = Chivo({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
})

const logo = Poppins({
  subsets: ['latin'],
  variable: '--font-logo',
  display: 'swap',
  weight: ['600', '700'],
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
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${body.variable} ${display.variable} ${logo.variable} antialiased`}>
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

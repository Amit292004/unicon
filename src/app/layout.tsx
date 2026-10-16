import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { PwaClientWrapper } from '@/components/pwa/pwa-client-wrapper'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'UNICON',
    template: '%s | UNICON',
  },
  description: 'The student community platform for your college — notices, academics, lost & found, transport, and more.',
  keywords: ['college', 'students', 'campus', 'notices', 'academics', 'lost and found', 'transport', 'pwa'],
  authors: [{ name: 'UNICON' }],
  robots: 'noindex, nofollow', // private platform
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UNICON',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f1a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <PwaClientWrapper>
          {children}
        </PwaClientWrapper>
      </body>
    </html>
  )
}


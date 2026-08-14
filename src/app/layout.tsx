import type { Metadata, Viewport } from 'next'
import { GeistPixelCircle } from 'geist/font/pixel'
import '@silk-hq/components/unlayered-styles.css'
import '@/styles/globals.scss'

export const metadata: Metadata = {
  title: 'Party Menu',
  description: 'Order drinks and have fun at the party!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Party Menu',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistPixelCircle.variable} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}

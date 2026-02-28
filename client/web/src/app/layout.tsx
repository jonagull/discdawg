import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/Header'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://discdawg.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'DiscDawg – Flight data for your disc',
  description:
    'A puck that attaches to your disc. Track speed, hyzer, anhyzer, and distance. Sync to your phone and improve your game.',
  openGraph: {
    title: 'DiscDawg – Flight data for your disc',
    description:
      'A puck that attaches to your disc. Track speed, hyzer, anhyzer, and distance. Sync to your phone and improve your game.',
    type: 'website',
    images: [{ url: '/assets/logo.png', width: 1200, height: 630, alt: 'DiscDawg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiscDawg – Flight data for your disc',
    description:
      'A puck that attaches to your disc. Track speed, hyzer, anhyzer, and distance. Sync to your phone and improve your game.',
  },
  icons: {
    icon: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}

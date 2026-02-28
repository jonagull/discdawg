import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'DiscDawg – Flight data for your disc',
  description:
    'A puck that attaches to your disc. Track speed, hyzer, anhyzer, and distance. Sync to your phone and improve your game.',
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

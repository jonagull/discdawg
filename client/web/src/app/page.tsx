'use client'

import Link from 'next/link'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Gauge,
  Move,
  Route,
  BarChart3,
  CircleDot,
  Smartphone,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/40 to-background py-20 sm:py-28">
        <ContentWrapper size="lg" className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Know your throw.
          </h1>
          <p className="mt-4 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto">
            Flight data for your disc. Track speed, angle, distance—and improve your game.
          </p>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            A small puck that attaches to your disc. Throw like you always do. DiscDawg records
            every throw and syncs to your phone over Bluetooth.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="#waitlist">Get notified</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>
        </ContentWrapper>
      </section>

      {/* What you get */}
      <section className="py-16 sm:py-24" id="features">
        <ContentWrapper size="lg">
          <h2 className="text-3xl font-bold text-center mb-4">What you get</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Real flight data from every throw, so you can see exactly how you&apos;re performing.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 bg-muted/30">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Gauge className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Speed</CardTitle>
                <CardDescription>
                  Release speed and flight velocity so you know how much power you&apos;re putting
                  on the disc.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-muted/30">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Move className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Angle</CardTitle>
                <CardDescription>
                  Hyzer and anhyzer at release. See if you&apos;re flipping, holding, or turning
                  the way you want.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-muted/30">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Route className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Distance</CardTitle>
                <CardDescription>
                  How far each throw actually went. Track consistency and max distance over time.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-muted/30">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Stats over time</CardTitle>
                <CardDescription>
                  Session and long-term stats. Spot patterns and see your game improve.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </ContentWrapper>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-muted/30" id="how-it-works">
        <ContentWrapper size="lg">
          <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Three steps. No extra gear. Just attach, throw, and sync.
          </p>
          <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                1
              </div>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-background border text-muted-foreground">
                <CircleDot className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-semibold">Attach</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Clip the DiscDawg puck to your disc. Lightweight; throw as usual.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                2
              </div>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-background border text-muted-foreground">
                <Route className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-semibold">Throw</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Play your round. DiscDawg records flight data on every throw.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                3
              </div>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-background border text-muted-foreground">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-semibold">Sync</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Open the app and sync over Bluetooth. Your stats, ready to review.
              </p>
            </div>
          </div>
        </ContentWrapper>
      </section>

      {/* Why it matters */}
      <section className="py-16 sm:py-24">
        <ContentWrapper size="md" className="text-center">
          <h2 className="text-3xl font-bold mb-6">See how you&apos;re really throwing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guessing only gets you so far. DiscDawg gives you real numbers—speed, angle, distance—so
            you can track progress, spot what&apos;s working, and improve your game round after
            round.
          </p>
        </ContentWrapper>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 border-t bg-muted/30" id="waitlist">
        <ContentWrapper size="md" className="text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to know your throw?</h2>
          <p className="text-muted-foreground mb-8">
            Join the waitlist and we&apos;ll notify you when DiscDawg is available.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href="mailto:hello@discdawg.com?subject=Waitlist">Get notified</Link>
          </Button>
        </ContentWrapper>
      </section>
    </div>
  )
}

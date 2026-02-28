'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeInSection } from '@/components/FadeInSection'
import { Gauge, Move, Route, BarChart3, CircleDot, Smartphone } from 'lucide-react'

export default function Home() {
  const [logoError, setLogoError] = useState(false)
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`min-h-screen ${showStickyCta ? 'pb-16' : ''}`}>
      {/* Hero - 50/50 split on desktop: logo left half, text right half */}
      <section className="border-b bg-gradient-to-b from-muted/40 to-background py-16 sm:py-24 lg:py-20">
        <ContentWrapper size="lg" className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-10 xl:gap-14 lg:items-center">
          {/* Left half - logo fills column, scales with viewport */}
          <div className="flex justify-center items-center min-h-[180px] sm:min-h-[200px] lg:min-h-[320px] xl:min-h-[400px] 2xl:min-h-[480px] lg:py-8">
            {!logoError && (
              <Image
                src="/assets/logo.png"
                alt="DiscDawg"
                width={1000}
                height={300}
                className="h-20 w-auto sm:h-24 lg:h-[320px] xl:h-[400px] 2xl:h-[480px] lg:w-auto lg:max-w-full lg:object-contain"
                onError={() => setLogoError(true)}
                priority
              />
            )}
          </div>
          {/* Right half - text and CTAs */}
          <div className="text-center lg:text-left mt-6 lg:mt-0">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-5xl xl:text-6xl">Know your throw.</h1>
            <p className="mt-4 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto lg:mx-0">
              Flight data for your disc. Track speed, angle, distance—and improve your game.
            </p>
            <p className="mt-5 text-muted-foreground max-w-xl mx-auto lg:mx-0">
              A small puck that attaches to your disc. Throw like you always do. DiscDawg records every throw and syncs
              to your phone over Bluetooth.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-base">
                <Link href="#waitlist">Get notified</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>
          </div>
        </ContentWrapper>
      </section>

      {/* Sticky CTA - appears after scrolling past hero */}
      {showStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur py-3 px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <ContentWrapper size="lg" className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm font-medium text-center sm:text-left">Ready to know your throw?</p>
            <Button asChild size="sm" className="shrink-0">
              <Link href="#waitlist">Join waitlist</Link>
            </Button>
          </ContentWrapper>
        </div>
      )}

      {/* What you get */}
      <section className="py-16 sm:py-24" id="features">
        <FadeInSection>
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
                    Release speed and flight velocity so you know how much power you&apos;re putting on the disc.
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
                    Hyzer and anhyzer at release. See if you&apos;re flipping, holding, or turning the way you want.
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
        </FadeInSection>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-muted/30" id="how-it-works">
        <FadeInSection>
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
        </FadeInSection>
      </section>

      {/* Why it matters */}
      <section className="py-16 sm:py-24">
        <FadeInSection>
          <ContentWrapper size="md" className="text-center">
            <h2 className="text-3xl font-bold mb-6">See how you&apos;re really throwing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Guessing only gets you so far. DiscDawg gives you real numbers—speed, angle, distance—so you can track
              progress, spot what&apos;s working, and improve your game round after round.
            </p>
          </ContentWrapper>
        </FadeInSection>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 border-t bg-muted/30" id="waitlist">
        <FadeInSection>
          <ContentWrapper size="md" className="text-center">
            <h2 className="text-2xl font-bold mb-2 sm:text-3xl">Ready to know your throw?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join the waitlist and we&apos;ll notify you when DiscDawg is available. Be the first to get early access.
            </p>
            <WaitlistForm />
            <p className="text-xs text-muted-foreground mt-4">No spam. Unsubscribe anytime.</p>
          </ContentWrapper>
        </FadeInSection>
      </section>
    </div>
  )
}

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = 'DiscDawg waitlist'
    const body = email ? `I'd like to join the waitlist.\n\nEmail: ${email}` : "I'd like to join the waitlist."
    window.location.href = `mailto:hello@discdawg.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="flex h-11 w-full rounded-md border border-input bg-background px-4 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
      />
      <Button type="submit" size="lg" className="text-base shrink-0">
        Join waitlist
      </Button>
    </form>
  )
}

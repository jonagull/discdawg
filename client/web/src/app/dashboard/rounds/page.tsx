'use client'

import Link from 'next/link'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRounds } from '../data/hooks'

export default function RoundsPage() {
  const rounds = useRounds()

  return (
    <ContentWrapper size="xl" className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Rounds</h1>
        <p className="mt-1 text-muted-foreground">Sessions and rounds. Click a round to see its throws.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rounds.map(round => {
          const count = round.throwIds.length
          return (
            <Link key={round.id} href={`/dashboard/rounds/${round.id}`}>
              <Card className="border-0 bg-background shadow-sm hover:bg-muted/30 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{round.name}</CardTitle>
                  <CardDescription>{round.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {count} throw{count !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </ContentWrapper>
  )
}

'use client'

import { use } from 'react'
import Link from 'next/link'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRound } from '../../data/hooks'
import { useThrows } from '../../data/hooks'

export default function RoundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const round = useRound(id)
  const allThrows = useThrows()

  if (!round) {
    return (
      <ContentWrapper size="xl" className="py-8">
        <p className="text-muted-foreground">Round not found.</p>
        <Link href="/dashboard/rounds" className="text-primary hover:underline mt-2 inline-block">
          Back to Rounds
        </Link>
      </ContentWrapper>
    )
  }

  const roundThrows = round.throwIds.map(tid => allThrows.find(t => t.id === tid)).filter(Boolean) as typeof allThrows

  return (
    <ContentWrapper size="xl" className="py-8">
      <div className="mb-6">
        <Link href="/dashboard/rounds" className="text-sm text-muted-foreground hover:text-foreground">
          ← Rounds
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{round.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {round.date} · {roundThrows.length} throws
        </p>
      </div>

      <Card className="border-0 bg-background shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Throws in this round</CardTitle>
          <CardDescription>Click a throw to see detail and orientation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Speed</th>
                  <th className="pb-3 pr-4 font-medium">Distance</th>
                  <th className="pb-3 font-medium">Angle</th>
                </tr>
              </thead>
              <tbody>
                {roundThrows.map(t => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                      <Link href={`/dashboard/throws/${t.id}`} className="text-muted-foreground hover:text-foreground">
                        {t.date}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 tabular-nums font-medium">{t.speed} mph</td>
                    <td className="py-3 pr-4 tabular-nums">{t.distance} ft</td>
                    <td className="py-3">{t.angle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </ContentWrapper>
  )
}

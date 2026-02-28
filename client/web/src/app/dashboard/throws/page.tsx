'use client'

import Link from 'next/link'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useThrows } from '../data/hooks'

export default function ThrowsPage() {
  const throws = useThrows()

  return (
    <ContentWrapper size="xl" className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">All throws</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of every throw synced from your DiscDawg. Click a row for detail and orientation.
        </p>
      </div>

      <Card className="border-0 bg-background shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Throw history</CardTitle>
          <CardDescription>
            {throws.length} throws (mock data). Replace useThrows() in data/hooks.ts with API for live data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Session</th>
                  <th className="pb-3 pr-4 font-medium">Speed</th>
                  <th className="pb-3 pr-4 font-medium">Distance</th>
                  <th className="pb-3 font-medium">Angle</th>
                </tr>
              </thead>
              <tbody>
                {throws.map(t => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                      <Link href={`/dashboard/throws/${t.id}`} className="text-muted-foreground hover:text-foreground">
                        {t.date}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{t.sessionName}</td>
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

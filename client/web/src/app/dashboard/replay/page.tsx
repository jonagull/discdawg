'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useThrows, useThrow } from '../data/hooks'
import { OrientationChart } from '../components/OrientationChart'

export default function ReplayPage() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('throw')
  const throws = useThrows()
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? throws[0]?.id ?? null)
  const selectedThrow = useThrow(selectedId)

  const selectOptions = useMemo(
    () => throws.map(t => ({ id: t.id, label: `${t.date} — ${t.speed} mph, ${t.distance} ft, ${t.angle}` })),
    [throws]
  )

  return (
    <ContentWrapper size="lg" className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shot replay</h1>
        <p className="mt-1 text-muted-foreground">
          Select a throw to see orientation over time. 3D path when GNSS is available.
        </p>
      </div>

      <Card className="border-0 bg-background shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-base">Select throw</CardTitle>
          <CardDescription>Choose a throw to view roll, pitch, yaw from IMU (mock data).</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={selectedId ?? ''}
            onChange={e => setSelectedId(e.target.value || null)}
            className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">— Select —</option>
            {selectOptions.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedThrow && (
        <Card className="border-0 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Orientation over time</CardTitle>
            <CardDescription>
              {selectedThrow.date} · {selectedThrow.speed} mph, {selectedThrow.distance} ft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrientationChart samples={selectedThrow.samples} height={260} />
          </CardContent>
        </Card>
      )}

      {!selectedThrow && throws.length === 0 && (
        <Card className="border-0 bg-background shadow-sm border-2 border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No throws yet. Sync from your DiscDawg or add mock data in dashboard/data/mockData.ts.
          </CardContent>
        </Card>
      )}
    </ContentWrapper>
  )
}

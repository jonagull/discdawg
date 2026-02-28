'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useThrows, useThrow } from '../data/hooks'
import { OrientationChart } from '../components/OrientationChart'

export default function ComparePage() {
  const searchParams = useSearchParams()
  const throw1Id = searchParams.get('throw1') ?? null
  const throw2Id = searchParams.get('throw2') ?? null
  const throws = useThrows()
  const [selected1, setSelected1] = useState<string | null>(throw1Id)
  const [selected2, setSelected2] = useState<string | null>(throw2Id)

  const t1 = useThrow(selected1)
  const t2 = useThrow(selected2)

  const options = useMemo(() => throws.map(t => ({ id: t.id, label: `${t.date} — ${t.speed} mph` })), [throws])

  return (
    <ContentWrapper size="xl" className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Compare throws</h1>
        <p className="mt-1 text-muted-foreground">
          Select two throws to compare side-by-side (mock data). Replace with API in data/hooks.ts for live.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Throw 1</label>
          <select
            value={selected1 ?? ''}
            onChange={e => setSelected1(e.target.value || null)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">— Select —</option>
            {options.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Throw 2</label>
          <select
            value={selected2 ?? ''}
            onChange={e => setSelected2(e.target.value || null)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">— Select —</option>
            {options.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {t1 ? (
          <Card className="border-0 bg-background shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Throw 1</CardTitle>
              <CardDescription>
                {t1.date} · {t1.sessionName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Speed</span>
                  <br />
                  <span className="font-medium tabular-nums">{t1.speed} mph</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Distance</span>
                  <br />
                  <span className="font-medium tabular-nums">{t1.distance} ft</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Angle</span>
                  <br />
                  <span className="font-medium">{t1.angle}</span>
                </div>
              </div>
              <OrientationChart samples={t1.samples} height={180} />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-background shadow-sm border-2 border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">Select throw 1</CardContent>
          </Card>
        )}
        {t2 ? (
          <Card className="border-0 bg-background shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Throw 2</CardTitle>
              <CardDescription>
                {t2.date} · {t2.sessionName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Speed</span>
                  <br />
                  <span className="font-medium tabular-nums">{t2.speed} mph</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Distance</span>
                  <br />
                  <span className="font-medium tabular-nums">{t2.distance} ft</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Angle</span>
                  <br />
                  <span className="font-medium">{t2.angle}</span>
                </div>
              </div>
              <OrientationChart samples={t2.samples} height={180} />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-background shadow-sm border-2 border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">Select throw 2</CardContent>
          </Card>
        )}
      </div>
    </ContentWrapper>
  )
}

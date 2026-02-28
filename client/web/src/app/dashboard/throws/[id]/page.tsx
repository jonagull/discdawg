'use client'

import { use } from 'react'
import Link from 'next/link'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useThrow } from '../../data/hooks'
import { OrientationChart } from '../../components/OrientationChart'

export default function ThrowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const throwData = useThrow(id)

  if (!throwData) {
    return (
      <ContentWrapper size="xl" className="py-8">
        <p className="text-muted-foreground">Throw not found.</p>
        <Link href="/dashboard/throws" className="text-primary hover:underline mt-2 inline-block">
          Back to Throws
        </Link>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper size="xl" className="py-8">
      <div className="mb-6">
        <Link href="/dashboard/throws" className="text-sm text-muted-foreground hover:text-foreground">
          ← Throws
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Throw {throwData.id}</h1>
        <p className="mt-1 text-muted-foreground">
          {throwData.date} · {throwData.sessionName}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Speed, distance, release angle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed</span>
              <span className="font-medium tabular-nums">{throwData.speed} mph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium tabular-nums">{throwData.distance} ft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Angle</span>
              <span className="font-medium">{throwData.angle}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
            <CardDescription>Replay or compare this throw</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link
              href={`/dashboard/replay?throw=${throwData.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View in Shot replay →
            </Link>
            <Link
              href={`/dashboard/compare?throw1=${throwData.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Compare with another →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-background shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-base">Orientation over time</CardTitle>
          <CardDescription>Roll, pitch, yaw from IMU (mock data). Replace with live when API is ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrientationChart samples={throwData.samples} height={220} />
        </CardContent>
      </Card>
    </ContentWrapper>
  )
}

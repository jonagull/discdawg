'use client'

import { useAuthCheck, useAuthStore } from '@shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Gauge,
  Route,
  Calendar,
  TrendingUp,
  Move,
  Activity,
} from 'lucide-react'

// Mock stats – replace with API when ready
const MOCK_STATS = {
  totalThrows: 1247,
  topSpeedMph: 62,
  maxDistanceFt: 412,
  sessionsThisWeek: 4,
  sessionsThisMonth: 18,
  averageSpeedMph: 48,
  hyzerPercent: 58,
  anhyzerPercent: 28,
  flatPercent: 14,
  lastSevenDays: [
    { day: 'Mon', throws: 42 },
    { day: 'Tue', throws: 0 },
    { day: 'Wed', throws: 89 },
    { day: 'Thu', throws: 31 },
    { day: 'Fri', throws: 0 },
    { day: 'Sat', throws: 156 },
    { day: 'Sun', throws: 68 },
  ],
  recentThrows: [
    { speed: 58, distance: 387, angle: 'Hyzer' },
    { speed: 61, distance: 401, angle: 'Flat' },
    { speed: 55, distance: 352, angle: 'Anhyzer' },
    { speed: 62, distance: 412, angle: 'Hyzer' },
    { speed: 59, distance: 378, angle: 'Hyzer' },
  ],
}

const maxThrowsInWeek = Math.max(...MOCK_STATS.lastSevenDays.map(d => d.throws), 1)

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()
  useAuthCheck()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <ContentWrapper size="xl" className="py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your stats</h1>
          <p className="mt-1 text-muted-foreground">
            Flight data from your DiscDawg. All time and recent activity.
          </p>
        </div>

        {/* Top-level stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 bg-background shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total throws
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">
                {MOCK_STATS.totalThrows.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-background shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top speed
              </CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{MOCK_STATS.topSpeedMph}</div>
              <p className="text-xs text-muted-foreground mt-1">mph</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-background shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Max distance
              </CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{MOCK_STATS.maxDistanceFt}</div>
              <p className="text-xs text-muted-foreground mt-1">ft</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-background shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{MOCK_STATS.sessionsThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Second row: averages + angle mix */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="border-0 bg-background shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Averages
              </CardTitle>
              <CardDescription>Typical performance across your throws</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">Avg speed</span>
                <span className="text-xl font-semibold tabular-nums">
                  {MOCK_STATS.averageSpeedMph} mph
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">Sessions this week</span>
                <span className="text-xl font-semibold tabular-nums">
                  {MOCK_STATS.sessionsThisWeek}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-background shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Move className="h-4 w-4" />
                Release angle mix
              </CardTitle>
              <CardDescription>Hyzer vs anhyzer vs flat (all throws)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Hyzer</span>
                    <span className="font-medium tabular-nums">{MOCK_STATS.hyzerPercent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${MOCK_STATS.hyzerPercent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Anhyzer</span>
                    <span className="font-medium tabular-nums">{MOCK_STATS.anhyzerPercent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${MOCK_STATS.anhyzerPercent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Flat</span>
                    <span className="font-medium tabular-nums">{MOCK_STATS.flatPercent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/50"
                      style={{ width: `${MOCK_STATS.flatPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* This week activity bars */}
        <Card className="border-0 bg-background shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-base">Throws this week</CardTitle>
            <CardDescription>Daily throw count (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {MOCK_STATS.lastSevenDays.map(({ day, throws }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex justify-center">
                    <div
                      className="w-full max-w-8 rounded-t bg-primary transition-all"
                      style={{
                        height: `${Math.max((throws / maxThrowsInWeek) * 80, throws > 0 ? 8 : 0)}px`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{throws}</span>
                  <span className="text-xs font-medium text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent throws table */}
        <Card className="border-0 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent throws</CardTitle>
            <CardDescription>Last 5 throws — speed, distance, release angle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Speed</th>
                    <th className="pb-3 font-medium">Distance</th>
                    <th className="pb-3 font-medium">Angle</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STATS.recentThrows.map((t, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 tabular-nums font-medium">{t.speed} mph</td>
                      <td className="py-3 tabular-nums">{t.distance} ft</td>
                      <td className="py-3">{t.angle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </ContentWrapper>
    </div>
  )
}

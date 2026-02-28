'use client'

import type { FlightSample } from '../types'
import { cn } from '@/lib/utils'

interface OrientationChartProps {
  samples: FlightSample[]
  className?: string
  height?: number
}

const COLORS = { r: 'var(--chart-1)', p: 'var(--chart-2)', y: 'var(--chart-3)' }

export function OrientationChart({ samples, className, height = 200 }: OrientationChartProps) {
  if (!samples.length) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border bg-muted/20 text-sm text-muted-foreground',
          className
        )}
        style={{ height }}
      >
        No orientation data
      </div>
    )
  }

  const padding = { top: 12, right: 12, bottom: 24, left: 40 }
  const width = 400
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  const tMax = Math.max(...samples.map(s => s.t), 1)
  const allValues = samples.flatMap(s => [s.r, s.p, s.y])
  const valMin = Math.min(...allValues)
  const valMax = Math.max(...allValues)
  const valRange = valMax - valMin || 1
  const valPad = valRange * 0.1

  const scaleT = (t: number) => padding.left + (t / tMax) * innerWidth
  const scaleV = (v: number) =>
    padding.top + innerHeight - ((v - valMin + valPad) / (valRange + 2 * valPad)) * innerHeight

  const path = (key: 'r' | 'p' | 'y') =>
    samples.map((s, i) => `${i === 0 ? 'M' : 'L'} ${scaleT(s.t)} ${scaleV(s[key])}`).join(' ')

  return (
    <div className={cn('overflow-x-auto', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-0" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="grid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.06" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(q => (
          <line
            key={q}
            x1={padding.left}
            y1={padding.top + innerHeight * (1 - q)}
            x2={width - padding.right}
            y2={padding.top + innerHeight * (1 - q)}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeDasharray="2 2"
          />
        ))}
        {/* Curves */}
        <path
          d={path('r')}
          fill="none"
          stroke={COLORS.r}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path('p')}
          fill="none"
          stroke={COLORS.p}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path('y')}
          fill="none"
          stroke={COLORS.y}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Labels */}
        <text
          x={padding.left - 8}
          y={padding.top + innerHeight / 2}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-muted-foreground text-[10px]"
        >
          °
        </text>
        <text x={width / 2} y={height - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          Time (ms)
        </text>
      </svg>
      <div className="flex gap-4 mt-2 justify-center text-xs text-muted-foreground">
        <span style={{ color: COLORS.r }}>— Roll</span>
        <span style={{ color: COLORS.p }}>— Pitch</span>
        <span style={{ color: COLORS.y }}>— Yaw</span>
      </div>
    </div>
  )
}

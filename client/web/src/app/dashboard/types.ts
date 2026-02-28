/**
 * Dashboard data types. Shape these to match your future API so switching to live data is a drop-in.
 */

export interface FlightSample {
  t: number // ms from throw start
  r: number // roll (deg)
  p: number // pitch (deg)
  y: number // yaw (deg)
}

export interface Throw {
  id: string
  date: string
  dateSort: string // ISO or sortable for ordering
  speed: number // mph
  distance: number // ft
  angle: 'Hyzer' | 'Flat' | 'Anhyzer'
  sessionId: string
  sessionName: string
  samples: FlightSample[]
}

export interface Round {
  id: string
  name: string
  date: string
  dateSort: string
  throwIds: string[]
}

export interface ReleaseQuality {
  consistencyPercent: number
  hyzerPercent: number
  anhyzerPercent: number
  flatPercent: number
}

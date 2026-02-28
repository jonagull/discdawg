/**
 * Mock data for dashboard. Replace with API calls in data/hooks.ts when backend is ready.
 * Keep the same shapes as types.ts so components need no changes.
 */

import type { FlightSample, Throw, Round, ReleaseQuality } from '../types'

function generateMockSamples(durationMs = 6500, sampleRate = 50): FlightSample[] {
  const stepMs = Math.floor(1000 / sampleRate)
  const samples: FlightSample[] = []
  for (let t = 0; t < durationMs; t += stepMs) {
    const phase = t / durationMs
    const r = 18 * Math.sin(phase * 3.5 * Math.PI) + 10 * (1 - phase)
    const p = -7 + 16 * Math.sin(phase * 2.2 * Math.PI)
    const y = 380 * phase + 45 * Math.sin(phase * 8)
    samples.push({ t, r: Math.round(r * 100) / 100, p: Math.round(p * 100) / 100, y: Math.round(y * 100) / 100 })
  }
  return samples
}

const mockSamples = generateMockSamples()

export const MOCK_THROWS: Throw[] = [
  {
    id: '1',
    date: 'Today, 2:34 PM',
    dateSort: '2025-02-28T14:34:00',
    speed: 62,
    distance: 412,
    angle: 'Hyzer',
    sessionId: 'r1',
    sessionName: 'Morning round',
    samples: mockSamples,
  },
  {
    id: '2',
    date: 'Today, 2:28 PM',
    dateSort: '2025-02-28T14:28:00',
    speed: 59,
    distance: 378,
    angle: 'Hyzer',
    sessionId: 'r1',
    sessionName: 'Morning round',
    samples: mockSamples,
  },
  {
    id: '3',
    date: 'Today, 2:21 PM',
    dateSort: '2025-02-28T14:21:00',
    speed: 61,
    distance: 401,
    angle: 'Flat',
    sessionId: 'r1',
    sessionName: 'Morning round',
    samples: mockSamples,
  },
  {
    id: '4',
    date: 'Yesterday, 4:15 PM',
    dateSort: '2025-02-27T16:15:00',
    speed: 55,
    distance: 352,
    angle: 'Anhyzer',
    sessionId: 'r2',
    sessionName: 'Practice',
    samples: mockSamples,
  },
  {
    id: '5',
    date: 'Yesterday, 4:08 PM',
    dateSort: '2025-02-27T16:08:00',
    speed: 58,
    distance: 387,
    angle: 'Hyzer',
    sessionId: 'r2',
    sessionName: 'Practice',
    samples: mockSamples,
  },
  {
    id: '6',
    date: 'Yesterday, 3:52 PM',
    dateSort: '2025-02-27T15:52:00',
    speed: 57,
    distance: 365,
    angle: 'Flat',
    sessionId: 'r2',
    sessionName: 'Practice',
    samples: mockSamples,
  },
  {
    id: '7',
    date: 'Wed, 1:20 PM',
    dateSort: '2025-02-26T13:20:00',
    speed: 60,
    distance: 395,
    angle: 'Hyzer',
    sessionId: 'r3',
    sessionName: 'League',
    samples: mockSamples,
  },
  {
    id: '8',
    date: 'Wed, 1:14 PM',
    dateSort: '2025-02-26T13:14:00',
    speed: 54,
    distance: 341,
    angle: 'Anhyzer',
    sessionId: 'r3',
    sessionName: 'League',
    samples: mockSamples,
  },
  {
    id: '9',
    date: 'Wed, 1:05 PM',
    dateSort: '2025-02-26T13:05:00',
    speed: 63,
    distance: 418,
    angle: 'Hyzer',
    sessionId: 'r3',
    sessionName: 'League',
    samples: mockSamples,
  },
  {
    id: '10',
    date: 'Tue, 5:45 PM',
    dateSort: '2025-02-25T17:45:00',
    speed: 56,
    distance: 358,
    angle: 'Flat',
    sessionId: 'r4',
    sessionName: 'Casual',
    samples: mockSamples,
  },
]

export const MOCK_ROUNDS: Round[] = [
  { id: 'r1', name: 'Morning round', date: 'Today', dateSort: '2025-02-28', throwIds: ['1', '2', '3'] },
  { id: 'r2', name: 'Practice', date: 'Yesterday', dateSort: '2025-02-27', throwIds: ['4', '5', '6'] },
  { id: 'r3', name: 'League', date: 'Wed', dateSort: '2025-02-26', throwIds: ['7', '8', '9'] },
  { id: 'r4', name: 'Casual', date: 'Tue', dateSort: '2025-02-25', throwIds: ['10'] },
]

export const MOCK_RELEASE_QUALITY: ReleaseQuality = {
  consistencyPercent: 78,
  hyzerPercent: 58,
  anhyzerPercent: 28,
  flatPercent: 14,
}

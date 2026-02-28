/**
 * Data hooks for dashboard. Currently return mock data.
 * To go live: replace the return values with API calls (e.g. useQuery from your API client).
 * Component code can stay unchanged; only these hooks need to call the backend.
 */

import { MOCK_THROWS, MOCK_ROUNDS, MOCK_RELEASE_QUALITY } from './mockData'
import type { Throw, Round, ReleaseQuality } from '../types'

export function useThrows(): Throw[] {
  // TODO: replace with e.g. const { data } = useQuery({ queryKey: ['throws'], queryFn: api.getThrows }); return data ?? [];
  return MOCK_THROWS
}

export function useThrow(id: string | null): Throw | null {
  // TODO: replace with useQuery(['throw', id], () => api.getThrow(id)) when id is set
  if (!id) return null
  return MOCK_THROWS.find(t => t.id === id) ?? null
}

export function useRounds(): Round[] {
  // TODO: replace with useQuery(['rounds'], api.getRounds)
  return MOCK_ROUNDS
}

export function useRound(id: string | null): Round | null {
  // TODO: replace with useQuery(['round', id], () => api.getRound(id))
  if (!id) return null
  return MOCK_ROUNDS.find(r => r.id === id) ?? null
}

export function useReleaseQuality(): ReleaseQuality {
  // TODO: replace with useQuery(['releaseQuality'], api.getReleaseQuality) or derive from throws
  return MOCK_RELEASE_QUALITY
}

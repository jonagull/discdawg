# Dashboard data layer

- **mockData.ts** – Mock throws, rounds, and release quality. Used when no backend is connected.
- **hooks.ts** – `useThrows()`, `useThrow(id)`, `useRounds()`, `useRound(id)`, `useReleaseQuality()`.

## Switching to live data

1. Add API client functions that return the same shapes as in `../types.ts` (Throw, Round, ReleaseQuality).
2. In **hooks.ts**, replace each hook body with a `useQuery` (or similar) that calls your API. Keep the same return types so dashboard components need no changes.
3. Remove or bypass imports from `mockData.ts` when the API is available (e.g. feature flag or env).

Example for one hook:

```ts
// Before (mock)
export function useThrows(): Throw[] {
  return MOCK_THROWS
}

// After (live)
export function useThrows(): Throw[] {
  const { data } = useQuery({ queryKey: ['throws'], queryFn: () => api.getThrows() })
  return data ?? []
}
```

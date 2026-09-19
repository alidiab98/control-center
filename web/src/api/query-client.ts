import { QueryClient } from '@tanstack/react-query'

/**
 * Live updates arrive as events, so queries do not poll. Retries are off: a failed call should
 * surface the error state straight away, which is also what `?mockFail=` is there to exercise.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  })
}

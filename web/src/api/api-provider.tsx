import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { ApiContext } from './api-context.js'
import type { ApiRuntime } from './api-context.js'
import { createMockClient } from './mock/mock-client.js'
import { parseRuntimeConfig } from './runtime-config.js'

export interface ApiProviderProps {
  /** Overrides the client, used by tests. Production code lets the provider build the mock. */
  runtime?: ApiRuntime
  search?: string
  children: ReactNode
}

/**
 * The only place that knows which client the app talks to. Swapping the mock for the real
 * HTTP and WebSocket client in the backend phase touches this file and nothing else.
 */
export function ApiProvider({ runtime, search, children }: ApiProviderProps) {
  const value = useMemo<ApiRuntime>(() => {
    if (runtime !== undefined) return runtime

    const config = parseRuntimeConfig(search ?? window.location.search)
    const bootTime = new Date()
    return { client: createMockClient(config, bootTime).client, mode: config.mockMode, bootTime }
  }, [runtime, search])

  return <ApiContext value={value}>{children}</ApiContext>
}

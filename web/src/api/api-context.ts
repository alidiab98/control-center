import type { ApiClient } from '@control-center/shared'
import { createContext } from 'react'
import type { MockMode } from './runtime-config.js'

export interface ApiRuntime {
  client: ApiClient
  mode: MockMode
  /** The moment the client was created. In static mode the whole app reads time from here. */
  bootTime: Date
}

export const ApiContext = createContext<ApiRuntime | null>(null)

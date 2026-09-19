import type { ApiClient } from '@control-center/shared'
import { use } from 'react'
import { ApiContext } from './api-context.js'
import type { ApiRuntime } from './api-context.js'

export function useApiRuntime(): ApiRuntime {
  const runtime = use(ApiContext)
  if (runtime === null) throw new Error('useApiRuntime must be used inside <ApiProvider>')
  return runtime
}

export function useApi(): ApiClient {
  return useApiRuntime().client
}

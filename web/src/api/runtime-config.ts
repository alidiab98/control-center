import { apiMethodNameSchema } from '@control-center/shared'
import type { ApiMethodName } from '@control-center/shared'
import { z } from 'zod'

/**
 * URL-driven mock configuration (SPEC section 7). Parsed with zod like every other value that
 * crosses a boundary (CLAUDE.md rule 2).
 *
 * - `?mock=static` turns off the simulator and artificial latency; every e2e test uses it.
 * - `?mock=live` (the default) runs the simulator.
 * - `?mockFail=getQueue,sendMessage` makes those methods reject, to exercise error states.
 */
export const mockModeSchema = z.enum(['live', 'static'])
export type MockMode = z.infer<typeof mockModeSchema>

export interface RuntimeConfig {
  mockMode: MockMode
  failingMethods: ReadonlySet<ApiMethodName>
}

const methodListSchema = z
  .string()
  .transform((value) => value.split(','))
  .pipe(z.array(apiMethodNameSchema))

export function parseRuntimeConfig(search: string): RuntimeConfig {
  const params = new URLSearchParams(search)

  let mockMode: MockMode = 'live'
  const rawMode = params.get('mock')
  if (rawMode !== null) {
    const parsed = mockModeSchema.safeParse(rawMode)
    if (parsed.success) mockMode = parsed.data
    else console.warn(`Ignoring unknown ?mock=${rawMode}; using "live".`)
  }

  let failingMethods: ApiMethodName[] = []
  const rawFail = params.get('mockFail')
  if (rawFail !== null) {
    const parsed = methodListSchema.safeParse(rawFail.trim())
    if (parsed.success) failingMethods = parsed.data
    else console.warn(`Ignoring unknown ?mockFail=${rawFail}; no methods will fail.`)
  }

  return { mockMode, failingMethods: new Set(failingMethods) }
}

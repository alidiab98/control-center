import type { ApiMethodName } from '@control-center/shared'
import type { RuntimeConfig } from '../runtime-config.js'

const MIN_DELAY_MS = 150
const MAX_DELAY_MS = 400

export class MockFailure extends Error {
  constructor(readonly method: ApiMethodName) {
    super(`mock failure: ${method}`)
    this.name = 'MockFailure'
  }
}

export interface MockTiming {
  /** Waits, then either rejects (when the method is in `?mockFail=`) or produces the result. */
  settle: <T>(method: ApiMethodName, produce: () => T) => Promise<T>
}

export function createTiming(config: RuntimeConfig): MockTiming {
  const staticMode = config.mockMode === 'static'

  const wait = async (): Promise<void> => {
    if (staticMode) return
    const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  return {
    settle: async (method, produce) => {
      await wait()
      // Checked before producing, so a failing method never mutates the store.
      if (config.failingMethods.has(method)) throw new MockFailure(method)
      return produce()
    },
  }
}

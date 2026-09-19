import type { ApiClient } from '@control-center/shared'
import type { RuntimeConfig } from '../runtime-config.js'
import { createHomeClient } from './client-home.js'
import { createTaskClient } from './client-tasks.js'
import { createTelegramClient } from './client-telegram.js'
import { createTiming } from './latency.js'
import { createSimulator } from './simulator.js'
import { createMockStore } from './store.js'
import type { MockStore } from './store.js'

export interface MockClient {
  client: ApiClient
  /** Exposed for unit tests; the app only ever touches `client`. */
  store: MockStore
}

/**
 * The in-memory implementation of the whole contract (SPEC section 7). Mutations change the
 * store and emit the matching events, so optimistic UI is reconciled by the event that follows.
 */
export function createMockClient(config: RuntimeConfig, now = new Date()): MockClient {
  const staticMode = config.mockMode === 'static'
  const timing = createTiming(config)

  const store = createMockStore({ now, staticMode })
  const simulator = staticMode ? undefined : createSimulator(store)

  const client: ApiClient = {
    ...createHomeClient(store, timing),
    ...createTaskClient(store, timing),
    ...createTelegramClient(store, timing),
    subscribe: (handler) => {
      const unsubscribe = store.subscribe(handler)
      // The simulator only runs while something is listening.
      simulator?.start()
      return () => {
        unsubscribe()
        if (!store.hasSubscribers()) simulator?.stop()
      }
    },
  }

  return { client, store }
}

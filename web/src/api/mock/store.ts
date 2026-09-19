import type {
  AgentSession,
  ServerEvent,
  ServerEventHandler,
  Task,
  TimelineEvent,
  Unsubscribe,
} from '@control-center/shared'
import { createFixtures } from './fixtures/index.js'
import type { MockData } from './fixtures/index.js'

export interface TimelineFlags {
  attention?: boolean
  automation?: boolean
}

export interface MockStoreOptions {
  /** Frozen reference time; fixtures and generated timestamps hang off it in static mode. */
  now: Date
  staticMode: boolean
}

export interface MockStore {
  readonly data: MockData
  /** Frozen in static mode, real time in live mode. */
  clock: () => Date
  emit: (event: ServerEvent) => void
  subscribe: (handler: ServerEventHandler) => Unsubscribe
  hasSubscribers: () => boolean
  nextId: (prefix: string) => string
  updateAgent: (agentId: string, patch: Partial<AgentSession>) => AgentSession | undefined
  updateTask: (taskId: string, patch: Partial<Task>) => Task | undefined
  removeQueueItems: (predicate: (itemId: string) => boolean) => void
  addTimelineEvent: (taskId: string | null, text: string, flags?: TimelineFlags) => TimelineEvent
}

export function createMockStore(options: MockStoreOptions): MockStore {
  const data = createFixtures(options.now)
  const handlers = new Set<ServerEventHandler>()
  let counter = 0

  const clock = (): Date => (options.staticMode ? options.now : new Date())

  const emit = (event: ServerEvent): void => {
    for (const handler of [...handlers]) handler(event)
  }

  const store: MockStore = {
    data,
    clock,
    emit,

    subscribe: (handler) => {
      handlers.add(handler)
      return () => {
        handlers.delete(handler)
      }
    },

    hasSubscribers: () => handlers.size > 0,

    nextId: (prefix) => {
      counter += 1
      return `${prefix}-${String(counter)}`
    },

    updateAgent: (agentId, patch) => {
      const index = data.agents.findIndex((agent) => agent.id === agentId)
      const current = data.agents[index]
      if (current === undefined) return undefined
      const next: AgentSession = { ...current, ...patch }
      data.agents[index] = next
      emit({ type: 'agent.updated', agent: next })
      return next
    },

    updateTask: (taskId, patch) => {
      const index = data.tasks.findIndex((task) => task.id === taskId)
      const current = data.tasks[index]
      if (current === undefined) return undefined
      const next: Task = { ...current, ...patch, updatedAt: clock().toISOString() }
      data.tasks[index] = next
      emit({ type: 'task.updated', task: next })
      return next
    },

    removeQueueItems: (predicate) => {
      const removed = data.queue.filter((item) => predicate(item.id))
      data.queue = data.queue.filter((item) => !predicate(item.id))
      for (const item of removed) emit({ type: 'queue.removed', itemId: item.id })
    },

    addTimelineEvent: (taskId, text, flags = {}) => {
      const event: TimelineEvent = {
        id: store.nextId('tl'),
        taskId,
        at: clock().toISOString(),
        text,
        attention: flags.attention ?? false,
        automation: flags.automation ?? false,
      }
      data.timeline.push(event)
      emit({ type: 'timeline.added', event })
      return event
    },
  }

  return store
}

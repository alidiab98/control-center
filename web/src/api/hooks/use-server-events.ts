import { serverEventSchema } from '@control-center/shared'
import type {
  AgentSession,
  QueueItem,
  ServerEvent,
  Task,
  TgChat,
  TgMessage,
  TimelineEvent,
} from '@control-center/shared'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useApi } from '../use-api.js'
import { queryKeys } from '../query-keys.js'

const isSameLocalDay = (iso: string, now: Date): boolean => {
  const at = new Date(iso)
  return (
    at.getFullYear() === now.getFullYear() &&
    at.getMonth() === now.getMonth() &&
    at.getDate() === now.getDate()
  )
}

/**
 * Adds or replaces an entry in a list the cache already holds. A list that has not been
 * fetched yet is left alone: seeding it from a single event would leave a one-item list on
 * screen until it went stale, and the next fetch returns the event anyway.
 */
const upsertIfLoaded = <T extends { id: string }>(
  list: T[] | undefined,
  next: T,
): T[] | undefined => {
  if (list === undefined) return undefined
  return list.some((item) => item.id === next.id)
    ? list.map((item) => (item.id === next.id ? next : item))
    : [...list, next]
}

/**
 * Applies one live event to the query cache. Exported so it can be unit tested without React,
 * and so the real WebSocket client can reuse it unchanged.
 *
 * `now` decides what counts as today for the automations list; it is a parameter so tests do
 * not depend on the wall clock.
 */
export function applyServerEvent(
  queryClient: QueryClient,
  event: ServerEvent,
  now: Date = new Date(),
): void {
  switch (event.type) {
    case 'queue.added': {
      queryClient.setQueryData<QueueItem[]>(queryKeys.queue, (current) =>
        upsertIfLoaded(current, event.item),
      )
      return
    }
    case 'queue.removed': {
      queryClient.setQueryData<QueueItem[]>(queryKeys.queue, (current) =>
        (current ?? []).filter((item) => item.id !== event.itemId),
      )
      return
    }
    case 'agent.updated': {
      queryClient.setQueryData<AgentSession[]>(queryKeys.agents, (current) =>
        upsertIfLoaded(current, event.agent),
      )
      return
    }
    case 'task.updated': {
      queryClient.setQueryData<Task>(queryKeys.task(event.task.id), event.task)
      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (current) =>
        upsertIfLoaded(current, event.task),
      )
      // Holds a single task, so it needs its own updater rather than the list one.
      queryClient.setQueriesData<Task | null>({ queryKey: ['task-by-key'] }, (current) =>
        current?.id === event.task.id ? event.task : current,
      )
      return
    }
    case 'timeline.added': {
      queryClient.setQueryData<TimelineEvent[]>(queryKeys.timeline(event.event.taskId), (current) =>
        upsertIfLoaded(current, event.event),
      )
      // The list is today's automations: a replayed or late event from another day belongs
      // to neither half of that phrase.
      if (event.event.automation && isSameLocalDay(event.event.at, now)) {
        queryClient.setQueryData<TimelineEvent[]>(queryKeys.automationsToday, (current) =>
          upsertIfLoaded(current, event.event),
        )
      }
      return
    }
    case 'tg.message': {
      queryClient.setQueryData<TgMessage[]>(queryKeys.messages(event.message.chatId), (current) =>
        upsertIfLoaded(current, event.message),
      )
      for (const taskId of event.message.linkedTaskIds) {
        queryClient.setQueryData<TgMessage[]>(queryKeys.linkedMessages(taskId), (current) =>
          upsertIfLoaded(current, event.message),
        )
      }
      return
    }
    case 'tg.chat.updated': {
      queryClient.setQueryData<TgChat[]>(queryKeys.chats, (current) =>
        upsertIfLoaded(current, event.chat),
      )
      return
    }
    case 'deploy.updated': {
      queryClient.setQueryData(queryKeys.deploySlot, event.slot)
      return
    }
    case 'stats.updated': {
      queryClient.setQueryData(queryKeys.stats, event.stats)
      return
    }
  }
}

export interface ServerEventsHandle {
  /**
   * Throws away everything the cache holds and refetches what is on screen. The mock never
   * needs it; the real client will call it after a dropped WebSocket reconnects, because
   * events missed while offline cannot be replayed.
   */
  resync: () => void
}

/** Subscribes once and keeps the cache in step with the server. */
export function useServerEvents(): ServerEventsHandle {
  const api = useApi()
  const queryClient = useQueryClient()

  useEffect(() => {
    return api.subscribe((event) => {
      // Events cross a boundary, so they are parsed like any other input.
      const parsed = serverEventSchema.safeParse(event)
      if (!parsed.success) {
        console.warn('Dropping malformed server event', parsed.error.issues)
        return
      }
      applyServerEvent(queryClient, parsed.data)
    })
  }, [api, queryClient])

  const resync = useCallback(() => {
    void queryClient.invalidateQueries()
  }, [queryClient])

  return { resync }
}

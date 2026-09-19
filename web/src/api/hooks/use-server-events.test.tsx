import type { AgentSession, QueueItem, ServerEvent, Task, TgChat } from '@control-center/shared'
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiProvider } from '../api-provider.js'
import type { ApiRuntime } from '../api-context.js'
import { createMockClient } from '../mock/mock-client.js'
import { AGENT_IDS, CHAT_IDS } from '../mock/fixtures/index.js'
import { createQueryClient } from '../query-client.js'
import { queryKeys } from '../query-keys.js'
import { parseRuntimeConfig } from '../runtime-config.js'
import { applyServerEvent, useServerEvents } from './use-server-events.js'

const NOW = new Date('2026-09-19T11:12:00')

const queueItem = (id: string, priority: number): QueueItem => ({
  id,
  kind: 'mention',
  createdAt: NOW.toISOString(),
  taskId: null,
  agentId: null,
  chatId: CHAT_IDS.dev,
  messageId: null,
  title: 'Ольга → you',
  detail: 'когда посмотришь?',
  priority,
})

describe('applyServerEvent', () => {
  it('adds and removes queue items', () => {
    const queryClient = createQueryClient()
    queryClient.setQueryData<QueueItem[]>(queryKeys.queue, [])

    applyServerEvent(queryClient, { type: 'queue.added', item: queueItem('q-1', 30) })
    expect(queryClient.getQueryData<QueueItem[]>(queryKeys.queue)).toHaveLength(1)

    applyServerEvent(queryClient, { type: 'queue.removed', itemId: 'q-1' })
    expect(queryClient.getQueryData<QueueItem[]>(queryKeys.queue)).toHaveLength(0)
  })

  it('replaces an agent in place instead of appending a duplicate', () => {
    const queryClient = createQueryClient()
    const agent: AgentSession = {
      id: AGENT_IDS.st398,
      taskId: 'task-st-398',
      tmuxSession: 'st-398',
      state: 'running',
      stateSince: NOW.toISOString(),
      lastActivity: 'editing QueueWorker.php',
      pending: null,
      diffStat: null,
      testsPassed: null,
    }
    queryClient.setQueryData<AgentSession[]>(queryKeys.agents, [agent])

    applyServerEvent(queryClient, {
      type: 'agent.updated',
      agent: { ...agent, lastActivity: 'running the test suite' },
    })

    const agents = queryClient.getQueryData<AgentSession[]>(queryKeys.agents)
    expect(agents).toHaveLength(1)
    expect(agents?.[0]?.lastActivity).toBe('running the test suite')
  })

  it('updates the by-key lookup, which holds one task and not a list', () => {
    const queryClient = createQueryClient()
    const task: Task = {
      id: 'task-st-412',
      projectId: 'prj-transcribe',
      key: 'ST-412',
      title: 'Export fails on files over 2 hours',
      description: '',
      status: 'in_progress',
      priority: 'high',
      assignee: 'you',
      branch: null,
      worktreePath: null,
      trackedSeconds: 0,
      origin: { kind: 'tracker' },
      updatedAt: NOW.toISOString(),
    }
    const byKey = queryKeys.taskByKey('prj-transcribe', 'ST-412')
    queryClient.setQueryData<Task | null>(byKey, task)
    queryClient.setQueryData<Task[]>(queryKeys.tasks('prj-transcribe'), [task])

    expect(() => {
      applyServerEvent(queryClient, { type: 'task.updated', task: { ...task, status: 'review' } })
    }).not.toThrow()

    expect(queryClient.getQueryData<Task | null>(byKey)).toMatchObject({
      key: 'ST-412',
      status: 'review',
    })
    expect(queryClient.getQueryData<Task[]>(queryKeys.tasks('prj-transcribe'))).toHaveLength(1)
    expect(queryClient.getQueryData<Task>(queryKeys.task(task.id))?.status).toBe('review')
  })

  it('leaves a by-key entry for another task alone', () => {
    const queryClient = createQueryClient()
    const other: Task = {
      id: 'task-st-398',
      projectId: 'prj-transcribe',
      key: 'ST-398',
      title: 'Retry queue for failed jobs',
      description: '',
      status: 'in_progress',
      priority: 'normal',
      assignee: 'you',
      branch: null,
      worktreePath: null,
      trackedSeconds: 0,
      origin: { kind: 'tracker' },
      updatedAt: NOW.toISOString(),
    }
    const byKey = queryKeys.taskByKey('prj-transcribe', 'ST-398')
    queryClient.setQueryData<Task | null>(byKey, other)

    applyServerEvent(queryClient, {
      type: 'task.updated',
      task: { ...other, id: 'task-st-412', key: 'ST-412', status: 'review' },
    })

    expect(queryClient.getQueryData<Task | null>(byKey)).toMatchObject({ key: 'ST-398' })
  })

  it('updates a chat and writes stats and the deploy slot straight through', () => {
    const queryClient = createQueryClient()
    const chat: TgChat = {
      id: CHAT_IDS.dev,
      title: 'Dev team',
      kind: 'group',
      memberCount: 8,
      unread: 4,
      lastMessagePreview: 'есть сроки?',
      lastMessageAt: NOW.toISOString(),
      initials: 'DT',
    }
    queryClient.setQueryData<TgChat[]>(queryKeys.chats, [chat])

    applyServerEvent(queryClient, { type: 'tg.chat.updated', chat: { ...chat, unread: 0 } })
    expect(queryClient.getQueryData<TgChat[]>(queryKeys.chats)?.[0]?.unread).toBe(0)

    applyServerEvent(queryClient, {
      type: 'stats.updated',
      stats: { trackedTodaySeconds: 100, agentCount: 8, maxParallelAgents: 8 },
    })
    expect(queryClient.getQueryData(queryKeys.stats)).toMatchObject({ agentCount: 8 })
  })
})

function renderWithProviders(ui: ReactNode, runtime: ApiRuntime) {
  const queryClient = createQueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ApiProvider runtime={runtime}>{ui}</ApiProvider>
    </QueryClientProvider>,
  )
  return queryClient
}

function makeRuntime(): ApiRuntime {
  const { client } = createMockClient(parseRuntimeConfig('?mock=static'), NOW)
  return { client, mode: 'static', bootTime: NOW }
}

describe('useServerEvents', () => {
  it('applies events that arrive from the client', async () => {
    const runtime = makeRuntime()

    function Probe() {
      useServerEvents()
      const queue = useQuery({
        queryKey: queryKeys.queue,
        queryFn: () => runtime.client.getQueue(),
      })
      return <p>items: {queue.data?.length ?? 0}</p>
    }

    renderWithProviders(<Probe />, runtime)
    await screen.findByText('items: 6')

    await runtime.client.markRead(CHAT_IDS.dev)
    await runtime.client.resolvePermission(AGENT_IDS.st412, 'allow_once')

    await waitFor(() => {
      expect(screen.getByText('items: 5')).toBeInTheDocument()
    })
  })

  it('resync invalidates every query', async () => {
    const runtime = makeRuntime()
    let resync: (() => void) | undefined

    function Probe() {
      resync = useServerEvents().resync
      return null
    }

    const queryClient = renderWithProviders(<Probe />, runtime)
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    queryClient.setQueryData(queryKeys.queue, [])
    queryClient.setQueryData(queryKeys.chats, [])

    resync?.()

    expect(invalidate).toHaveBeenCalledTimes(1)
    expect(invalidate).toHaveBeenCalledWith()
    await waitFor(() => {
      expect(queryClient.getQueryState(queryKeys.queue)?.isInvalidated).toBe(true)
      expect(queryClient.getQueryState(queryKeys.chats)?.isInvalidated).toBe(true)
    })
  })

  it('drops a malformed event instead of writing it to the cache', async () => {
    const base = makeRuntime()
    let emit: ((event: ServerEvent) => void) | undefined
    const runtime: ApiRuntime = {
      ...base,
      client: {
        ...base.client,
        subscribe: (handler) => {
          emit = handler
          return () => {
            emit = undefined
          }
        },
      },
    }

    function Probe() {
      useServerEvents()
      return null
    }

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const queryClient = renderWithProviders(<Probe />, runtime)
    queryClient.setQueryData<QueueItem[]>(queryKeys.queue, [queueItem('q-1', 30)])

    await waitFor(() => {
      expect(emit).toBeDefined()
    })
    emit?.({ type: 'queue.added', item: { id: 'q-2' } } as unknown as ServerEvent)

    expect(queryClient.getQueryData<QueueItem[]>(queryKeys.queue)).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith('Dropping malformed server event', expect.anything())
    warn.mockRestore()
  })
})

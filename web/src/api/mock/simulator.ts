import type { QueueItem, TgMessage } from '@control-center/shared'
import { CHAT_IDS, TASK_IDS } from './fixtures/index.js'
import type { MockStore } from './store.js'

const MIN_INTERVAL_MS = 10_000
const MAX_INTERVAL_MS = 20_000

/** Upper bound so a long-running live session does not grow the queue without limit. */
const MAX_QUEUE_LENGTH = 9

const ACTIVITIES = [
  'reading ExportService.php',
  'running the test suite',
  'writing a migration',
  'checking the nightly log',
  'updating the API docs',
]

export interface Simulator {
  start: () => void
  stop: () => void
}

/**
 * Live mode only: every 10 to 20 seconds, one plausible event (SPEC section 7).
 * Static mode never starts it, so e2e runs see a still world.
 */
export function createSimulator(store: MockStore): Simulator {
  let timer: ReturnType<typeof setTimeout> | undefined
  let step = 0

  const nudgeAgent = (): void => {
    const running = store.data.agents.filter((agent) => agent.state === 'running')
    const agent = running[step % Math.max(1, running.length)]
    if (agent === undefined) return
    store.updateAgent(agent.id, {
      lastActivity: ACTIVITIES[step % ACTIVITIES.length] ?? 'working',
    })
  }

  const addTimeline = (): void => {
    store.addTimelineEvent(TASK_IDS.st412, 'Agent wrote a new test for long exports')
  }

  const incomingMessage = (): void => {
    const chat = store.data.chats.find((candidate) => candidate.id === CHAT_IDS.dev)
    if (chat === undefined) return

    const message: TgMessage = {
      id: store.nextId('msg-sim'),
      chatId: chat.id,
      senderName: 'Ольга',
      isOwn: false,
      at: new Date().toISOString(),
      text: 'проверила ещё раз на стейдже, падает только на длинных',
      photo: null,
      replyTo: null,
      linkedTaskIds: [],
    }
    store.data.messages.push(message)
    store.emit({ type: 'tg.message', message })

    const next = {
      ...chat,
      unread: chat.unread + 1,
      lastMessagePreview: `${message.senderName}: ${message.text}`,
      lastMessageAt: message.at,
    }
    store.data.chats = store.data.chats.map((item) => (item.id === chat.id ? next : item))
    store.emit({ type: 'tg.chat.updated', chat: next })
  }

  const addMention = (): void => {
    if (store.data.queue.length >= MAX_QUEUE_LENGTH) return
    const item: QueueItem = {
      id: store.nextId('queue-sim'),
      kind: 'mention',
      createdAt: new Date().toISOString(),
      taskId: null,
      agentId: null,
      chatId: CHAT_IDS.dev,
      messageId: null,
      title: 'Ольга → you',
      detail: 'когда сможешь посмотреть экспорт?',
      priority: 35,
    }
    store.data.queue.push(item)
    store.emit({ type: 'queue.added', item })
  }

  const finishAgent = (): void => {
    const agent = store.data.agents.find((candidate) => candidate.state === 'running')
    if (agent === undefined || store.data.queue.length >= MAX_QUEUE_LENGTH) return

    store.updateAgent(agent.id, {
      state: 'review',
      stateSince: new Date().toISOString(),
      lastActivity: 'waiting for review',
      testsPassed: true,
    })
    const item: QueueItem = {
      id: store.nextId('queue-sim'),
      kind: 'review',
      createdAt: new Date().toISOString(),
      taskId: agent.taskId,
      agentId: agent.id,
      chatId: null,
      messageId: null,
      title: 'Diff ready · tests passed',
      detail: 'auto-review found nothing',
      priority: 45,
    }
    store.data.queue.push(item)
    store.emit({ type: 'queue.added', item })
  }

  const steps = [nudgeAgent, addTimeline, incomingMessage, nudgeAgent, addMention, finishAgent]

  const schedule = (): void => {
    const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS)
    timer = setTimeout(() => {
      steps[step % steps.length]?.()
      step += 1
      schedule()
    }, delay)
  }

  return {
    start: () => {
      if (timer === undefined) schedule()
    },
    stop: () => {
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
    },
  }
}

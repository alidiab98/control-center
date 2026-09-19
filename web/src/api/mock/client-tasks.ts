import type { ApiClient, Task, TrackerStatus } from '@control-center/shared'
import type { MockTiming } from './latency.js'
import type { MockStore } from './store.js'

type TaskClient = Pick<
  ApiClient,
  | 'getTasks'
  | 'getTask'
  | 'getTimeline'
  | 'getAllowedTransitions'
  | 'transitionTask'
  | 'addTrackerComment'
  | 'getLinkedMessages'
  | 'createTaskFromMessage'
>

const TRANSITIONS: Record<TrackerStatus, TrackerStatus[]> = {
  open: ['in_progress'],
  in_progress: ['review', 'open'],
  review: ['testing', 'in_progress'],
  testing: ['done', 'in_progress'],
  done: [],
}

const notFound = (what: string, id: string): Error => new Error(`${what} not found: ${id}`)

const byTime = (a: { at: string }, b: { at: string }): number => Date.parse(a.at) - Date.parse(b.at)

export function createTaskClient(store: MockStore, timing: MockTiming): TaskClient {
  const { data } = store

  const requireTask = (taskId: string): Task => {
    const task = data.tasks.find((candidate) => candidate.id === taskId)
    if (task === undefined) throw notFound('task', taskId)
    return task
  }

  const nextTaskKey = (): string => {
    const numbers = data.tasks.map((task) => Number.parseInt(task.key.split('-')[1] ?? '0', 10))
    return `ST-${String(Math.max(0, ...numbers) + 1)}`
  }

  return {
    getTasks: (projectId) =>
      timing.settle('getTasks', () => data.tasks.filter((task) => task.projectId === projectId)),

    getTask: (taskId) => timing.settle('getTask', () => ({ ...requireTask(taskId) })),

    getTimeline: (taskId) =>
      timing.settle('getTimeline', () =>
        // Events with a null taskId belong to no task, so they never appear here.
        data.timeline
          .filter((event) => event.taskId !== null && event.taskId === taskId)
          .sort(byTime),
      ),

    getAllowedTransitions: (taskId) =>
      timing.settle('getAllowedTransitions', () => [...TRANSITIONS[requireTask(taskId).status]]),

    transitionTask: (taskId, to) =>
      timing.settle('transitionTask', () => {
        const task = requireTask(taskId)
        if (!TRANSITIONS[task.status].includes(to)) {
          throw new Error(`transition not allowed: ${task.status} -> ${to}`)
        }
        const next = store.updateTask(taskId, { status: to })
        if (next === undefined) throw notFound('task', taskId)
        store.addTimelineEvent(taskId, `Tracker → ${to.replace('_', ' ')}`, { automation: true })
        return next
      }),

    addTrackerComment: (taskId, text) =>
      timing.settle('addTrackerComment', () => {
        requireTask(taskId)
        store.addTimelineEvent(taskId, `Comment added: ${text}`)
      }),

    getLinkedMessages: (taskId) =>
      timing.settle('getLinkedMessages', () =>
        data.messages.filter((message) => message.linkedTaskIds.includes(taskId)).sort(byTime),
      ),

    createTaskFromMessage: (chatId, messageId) =>
      timing.settle('createTaskFromMessage', () => {
        const message = data.messages.find(
          (candidate) => candidate.id === messageId && candidate.chatId === chatId,
        )
        if (message === undefined) throw notFound('message', messageId)

        const project = data.projects[0]
        if (project === undefined) throw new Error('no project in the mock store')

        const task: Task = {
          id: store.nextId('task'),
          projectId: project.id,
          key: nextTaskKey(),
          title: message.text.slice(0, 60),
          description: message.text,
          status: 'open',
          priority: 'normal',
          assignee: 'you',
          branch: null,
          worktreePath: null,
          trackedSeconds: 0,
          origin: { kind: 'telegram', chatId, messageId },
          updatedAt: store.clock().toISOString(),
        }
        data.tasks.push(task)
        store.emit({ type: 'task.updated', task })

        const linked = { ...message, linkedTaskIds: [...message.linkedTaskIds, task.id] }
        data.messages = data.messages.map((item) => (item.id === message.id ? linked : item))
        store.emit({ type: 'tg.message', message: linked })

        store.addTimelineEvent(task.id, 'Task created from Telegram message')
        return task
      }),
  }
}

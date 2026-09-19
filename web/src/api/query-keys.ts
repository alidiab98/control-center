import type { ID } from '@control-center/shared'

/** One place for every query key, so cache updates and invalidation cannot drift apart. */
export const queryKeys = {
  projects: ['projects'] as const,
  queue: ['queue'] as const,
  agents: ['agents'] as const,
  stats: ['stats'] as const,
  deploySlot: ['deploy-slot'] as const,
  automationsToday: ['automations-today'] as const,
  tasks: (projectId: ID) => ['tasks', projectId] as const,
  task: (taskId: ID) => ['task', taskId] as const,
  /** Own root: routes address tasks by key, and this entry holds a single task, not a list. */
  taskByKey: (projectId: ID, key: string) => ['task-by-key', projectId, key] as const,
  timeline: (taskId: ID) => ['timeline', taskId] as const,
  allowedTransitions: (taskId: ID) => ['allowed-transitions', taskId] as const,
  linkedMessages: (taskId: ID) => ['linked-messages', taskId] as const,
  chats: ['chats'] as const,
  messages: (chatId: ID) => ['messages', chatId] as const,
} as const

import { z } from 'zod'
import { idSchema } from './domain.js'
import type {
  AgentSession,
  DeploySlot,
  ID,
  Project,
  QueueItem,
  Stats,
  Task,
  TgChat,
  TgMessage,
  TimelineEvent,
  TrackerStatus,
} from './domain.js'
import type { ServerEventHandler, Unsubscribe } from './events.js'

export * from './events.js'

/** Context a prompt can carry, SPEC section 6. */
export const contextRefSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('tracker_description') }),
  z.object({ kind: z.literal('telegram_thread') }),
  z.object({ kind: z.literal('related_task'), taskId: idSchema }),
  z.object({ kind: z.literal('log_error'), text: z.string() }),
])
export type ContextRef = z.infer<typeof contextRefSchema>

export type PermissionDecision = 'allow_once' | 'deny'
export type PlanDecision = 'approve' | 'reject'

export interface SendMessageInput {
  text: string
  replyToId?: ID
  image?: File
}

/**
 * The backend contract, SPEC section 6. The mock in `web/src/api/mock/` implements it today;
 * the HTTP + WebSocket client will implement the same interface in the backend phase.
 */
export interface ApiClient {
  // projects
  getProjects: () => Promise<Project[]>

  // home
  getQueue: () => Promise<QueueItem[]>
  getAgents: () => Promise<AgentSession[]>
  getStats: () => Promise<Stats>
  getDeploySlot: () => Promise<DeploySlot>
  /** Timeline events flagged as automation that happened today, across every task. */
  getAutomationsToday: () => Promise<TimelineEvent[]>

  // agent actions
  resolvePermission: (agentId: ID, decision: PermissionDecision) => Promise<void>
  resolvePlan: (agentId: ID, decision: PlanDecision, note?: string) => Promise<void>
  answerQuestion: (agentId: ID, text: string) => Promise<void>
  sendPrompt: (agentId: ID, text: string, contextRefs: ContextRef[]) => Promise<void>
  restartAgent: (agentId: ID) => Promise<void>
  startAgent: (taskId: ID) => Promise<AgentSession>

  // tasks
  getTasks: (projectId: ID) => Promise<Task[]>
  getTask: (taskId: ID) => Promise<Task>
  getTimeline: (taskId: ID) => Promise<TimelineEvent[]>
  getAllowedTransitions: (taskId: ID) => Promise<TrackerStatus[]>
  transitionTask: (taskId: ID, to: TrackerStatus) => Promise<Task>
  addTrackerComment: (taskId: ID, text: string) => Promise<void>
  getLinkedMessages: (taskId: ID) => Promise<TgMessage[]>
  createTaskFromMessage: (chatId: ID, messageId: ID) => Promise<Task>

  // telegram
  getWorkFolderChats: () => Promise<TgChat[]>
  getMessages: (chatId: ID, beforeId?: ID) => Promise<TgMessage[]>
  sendMessage: (chatId: ID, input: SendMessageInput) => Promise<TgMessage>
  markRead: (chatId: ID) => Promise<void>

  // live
  subscribe: (handler: ServerEventHandler) => Unsubscribe
}

/** Method names of the contract, used by the mock's failure injection (`?mockFail=`). */
export type ApiMethodName = keyof ApiClient

export const API_METHOD_NAMES = [
  'getProjects',
  'getQueue',
  'getAgents',
  'getStats',
  'getDeploySlot',
  'getAutomationsToday',
  'resolvePermission',
  'resolvePlan',
  'answerQuestion',
  'sendPrompt',
  'restartAgent',
  'startAgent',
  'getTasks',
  'getTask',
  'getTimeline',
  'getAllowedTransitions',
  'transitionTask',
  'addTrackerComment',
  'getLinkedMessages',
  'createTaskFromMessage',
  'getWorkFolderChats',
  'getMessages',
  'sendMessage',
  'markRead',
  'subscribe',
] as const satisfies readonly ApiMethodName[]

export const apiMethodNameSchema = z.enum(API_METHOD_NAMES)

type UnlistedApiMethod = Exclude<ApiMethodName, (typeof API_METHOD_NAMES)[number]>

/** Compile-time guard: adding a method to ApiClient without listing it above breaks here. */
export const ALL_API_METHODS_LISTED: [UnlistedApiMethod] extends [never] ? true : never = true

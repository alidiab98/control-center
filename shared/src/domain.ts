import { z } from 'zod'

/**
 * Domain model, SPEC section 5.
 *
 * Schemas are the source of truth; the exported types are inferred from them so the two can
 * never drift. Everything crossing a boundary is parsed with one of these (CLAUDE.md rule 2).
 */

export type ID = string
export type ISODate = string

export const idSchema = z.string().min(1)
export const isoDateSchema = z.iso.datetime({ offset: true })

export const projectSchema = z.object({
  id: idSchema,
  name: z.string(),
  repoPath: z.string(),
  trackerQueue: z.string(),
  tgFolderId: z.int().nullable(),
})
export type Project = z.infer<typeof projectSchema>

export const trackerStatusSchema = z.enum(['open', 'in_progress', 'review', 'testing', 'done'])
export type TrackerStatus = z.infer<typeof trackerStatusSchema>

export const taskPrioritySchema = z.enum(['low', 'normal', 'high', 'critical'])
export type TaskPriority = z.infer<typeof taskPrioritySchema>

export const taskOriginSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('tracker') }),
  z.object({ kind: z.literal('telegram'), chatId: idSchema, messageId: idSchema }),
])
export type TaskOrigin = z.infer<typeof taskOriginSchema>

export const taskSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  /** Tracker key, for example "ST-412". */
  key: z.string(),
  title: z.string(),
  description: z.string(),
  status: trackerStatusSchema,
  priority: taskPrioritySchema,
  assignee: z.string(),
  branch: z.string().nullable(),
  worktreePath: z.string().nullable(),
  trackedSeconds: z.int().nonnegative(),
  origin: taskOriginSchema,
  updatedAt: isoDateSchema,
})
export type Task = z.infer<typeof taskSchema>

export const agentStateSchema = z.enum([
  'starting',
  'running',
  'needs_permission',
  'needs_plan_approval',
  'needs_answer',
  'review',
  'stalled',
  'done',
])
export type AgentState = z.infer<typeof agentStateSchema>

export const pendingRequestSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('permission'), command: z.string(), scope: z.string() }),
  z.object({ kind: z.literal('plan'), summary: z.string(), steps: z.array(z.string()) }),
  z.object({ kind: z.literal('question'), text: z.string() }),
])
export type PendingRequest = z.infer<typeof pendingRequestSchema>

export const diffStatSchema = z.object({
  added: z.int().nonnegative(),
  removed: z.int().nonnegative(),
})
export type DiffStat = z.infer<typeof diffStatSchema>

export const agentSessionSchema = z.object({
  id: idSchema,
  taskId: idSchema,
  tmuxSession: z.string(),
  state: agentStateSchema,
  stateSince: isoDateSchema,
  /** Human-readable current activity, for example "editing QueueWorker.php". */
  lastActivity: z.string(),
  pending: pendingRequestSchema.nullable(),
  diffStat: diffStatSchema.nullable(),
  testsPassed: z.boolean().nullable(),
})
export type AgentSession = z.infer<typeof agentSessionSchema>

export const queueItemKindSchema = z.enum([
  'permission',
  'plan',
  'question',
  'review',
  'stalled',
  'mention',
])
export type QueueItemKind = z.infer<typeof queueItemKindSchema>

export const queueItemSchema = z.object({
  id: idSchema,
  kind: queueItemKindSchema,
  createdAt: isoDateSchema,
  taskId: idSchema.nullable(),
  agentId: idSchema.nullable(),
  chatId: idSchema.nullable(),
  messageId: idSchema.nullable(),
  title: z.string(),
  detail: z.string(),
  /** Lower sorts higher in the "Needs you" list. */
  priority: z.int(),
})
export type QueueItem = z.infer<typeof queueItemSchema>

export const timelineEventSchema = z.object({
  id: idSchema,
  /** Null for events that belong to no single task, such as the standup draft. */
  taskId: idSchema.nullable(),
  at: isoDateSchema,
  text: z.string(),
  attention: z.boolean(),
  /** Something the system did on its own, as opposed to a step you took. */
  automation: z.boolean(),
})
export type TimelineEvent = z.infer<typeof timelineEventSchema>

export const deploySlotSchema = z.object({
  currentTaskKey: z.string().nullable(),
  deployedAt: isoDateSchema.nullable(),
  nextTaskKey: z.string().nullable(),
})
export type DeploySlot = z.infer<typeof deploySlotSchema>

export const tgChatKindSchema = z.enum(['group', 'user', 'bot'])
export type TgChatKind = z.infer<typeof tgChatKindSchema>

export const tgChatSchema = z.object({
  id: idSchema,
  title: z.string(),
  kind: tgChatKindSchema,
  memberCount: z.int().nonnegative().nullable(),
  unread: z.int().nonnegative(),
  lastMessagePreview: z.string(),
  lastMessageAt: isoDateSchema,
  initials: z.string(),
})
export type TgChat = z.infer<typeof tgChatSchema>

export const tgPhotoSchema = z.object({
  thumbUrl: z.string(),
  width: z.int().positive(),
  height: z.int().positive(),
})
export type TgPhoto = z.infer<typeof tgPhotoSchema>

export const tgReplyToSchema = z.object({
  messageId: idSchema,
  senderName: z.string(),
  preview: z.string(),
})
export type TgReplyTo = z.infer<typeof tgReplyToSchema>

export const tgMessageSchema = z.object({
  id: idSchema,
  chatId: idSchema,
  senderName: z.string(),
  isOwn: z.boolean(),
  at: isoDateSchema,
  text: z.string(),
  photo: tgPhotoSchema.nullable(),
  replyTo: tgReplyToSchema.nullable(),
  linkedTaskIds: z.array(idSchema),
})
export type TgMessage = z.infer<typeof tgMessageSchema>

export const statsSchema = z.object({
  trackedTodaySeconds: z.int().nonnegative(),
  agentCount: z.int().nonnegative(),
  maxParallelAgents: z.int().nonnegative(),
})
export type Stats = z.infer<typeof statsSchema>

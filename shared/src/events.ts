import { z } from 'zod'
import {
  agentSessionSchema,
  deploySlotSchema,
  idSchema,
  queueItemSchema,
  statsSchema,
  taskSchema,
  tgChatSchema,
  tgMessageSchema,
  timelineEventSchema,
} from './domain.js'

/**
 * Live events, SPEC section 6. The mock emits these; the real backend will push the same
 * shapes over a WebSocket. All mutations are optimistic in the UI and reconciled by the
 * event that follows.
 */
export const serverEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('queue.added'), item: queueItemSchema }),
  z.object({ type: z.literal('queue.removed'), itemId: idSchema }),
  z.object({ type: z.literal('agent.updated'), agent: agentSessionSchema }),
  z.object({ type: z.literal('task.updated'), task: taskSchema }),
  z.object({ type: z.literal('timeline.added'), event: timelineEventSchema }),
  z.object({ type: z.literal('tg.message'), message: tgMessageSchema }),
  z.object({ type: z.literal('tg.chat.updated'), chat: tgChatSchema }),
  z.object({ type: z.literal('deploy.updated'), slot: deploySlotSchema }),
  z.object({ type: z.literal('stats.updated'), stats: statsSchema }),
])
export type ServerEvent = z.infer<typeof serverEventSchema>

export type ServerEventType = ServerEvent['type']

export type ServerEventHandler = (event: ServerEvent) => void

/** Returned by `ApiClient.subscribe`; calling it stops delivery. */
export type Unsubscribe = () => void

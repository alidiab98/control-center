import type {
  AgentSession,
  DeploySlot,
  Project,
  QueueItem,
  Stats,
  Task,
  TgChat,
  TgMessage,
  TimelineEvent,
} from '@control-center/shared'
import { createAgents } from './agents.js'
import { createProjects } from './project.js'
import { createQueue } from './queue.js'
import { createDeploySlot, createStats } from './stats.js'
import { createTasks } from './tasks.js'
import { createChats, createMessages } from './telegram.js'
import { createTimeline } from './timeline.js'

export interface MockData {
  projects: Project[]
  tasks: Task[]
  agents: AgentSession[]
  queue: QueueItem[]
  timeline: TimelineEvent[]
  chats: TgChat[]
  messages: TgMessage[]
  stats: Stats
  deploySlot: DeploySlot
}

/**
 * Everything the mock knows, reproduced from the three design screenshots. Timestamps are
 * relative to `now`, which the store freezes when it is created.
 */
export function createFixtures(now: Date): MockData {
  return {
    projects: createProjects(),
    tasks: createTasks(now),
    agents: createAgents(now),
    queue: createQueue(now),
    timeline: createTimeline(now),
    chats: createChats(now),
    messages: createMessages(now),
    stats: createStats(),
    deploySlot: createDeploySlot(now),
  }
}

export { PLACEHOLDER_PHOTO } from './telegram.js'
export { AGENT_IDS, CHAT_IDS, MESSAGE_IDS, PROJECT_ID, TASK_IDS } from './ids.js'

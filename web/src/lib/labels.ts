import type { AgentState, QueueItemKind, TrackerStatus } from '@control-center/shared'

const TRACKER_STATUS: Record<TrackerStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  review: 'Review',
  testing: 'Testing',
  done: 'Done',
}

/** Short state word shown next to an agent row, matching the design screenshots. */
const AGENT_STATE: Record<AgentState, string> = {
  starting: 'starting',
  running: 'running',
  needs_permission: 'permission',
  needs_plan_approval: 'plan',
  needs_answer: 'question',
  review: 'review',
  stalled: 'stalled',
  done: 'done',
}

const QUEUE_KIND: Record<QueueItemKind, string> = {
  permission: 'PERMISSION',
  plan: 'PLAN',
  question: 'QUESTION',
  review: 'REVIEW',
  stalled: 'STALLED',
  mention: 'MENTION',
}

export const trackerStatusLabel = (status: TrackerStatus): string => TRACKER_STATUS[status]
export const agentStateLabel = (state: AgentState): string => AGENT_STATE[state]
export const queueKindLabel = (kind: QueueItemKind): string => QUEUE_KIND[kind]

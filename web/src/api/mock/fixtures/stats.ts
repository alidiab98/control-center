import type { DeploySlot, Stats } from '@control-center/shared'
import { atTimeDaysAgo } from './time.js'

/** Top bar: "Tracked today 4h 12m · Agents 7". */
export const createStats = (): Stats => ({
  trackedTodaySeconds: 15_120,
  agentCount: 7,
  maxParallelAgents: 8,
})

/** Sidebar footer: "ST-398 · deployed 14:20 · next: ST-405". */
export const createDeploySlot = (now: Date): DeploySlot => ({
  currentTaskKey: 'ST-398',
  deployedAt: atTimeDaysAgo(now, 1, 14, 20),
  nextTaskKey: 'ST-405',
})

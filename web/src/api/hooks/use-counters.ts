import { useAgents, useQueue } from './use-home.js'
import { useProjectTasks } from './use-tasks.js'
import { useUnreadCount } from './use-telegram.js'

export interface NavCounters {
  queue: number | undefined
  agents: number | undefined
  tasks: number | undefined
  telegram: number | undefined
}

/**
 * The four live counters in the sidebar. Undefined while a query is still loading, so the
 * nav can leave the slot empty instead of flashing a zero.
 */
export function useNavCounters(): NavCounters {
  const queue = useQueue()
  const agents = useAgents()
  const tasks = useProjectTasks()
  const unread = useUnreadCount()

  return {
    queue: queue.data?.length,
    agents: agents.data?.length,
    tasks: tasks.data?.length,
    telegram: unread,
  }
}

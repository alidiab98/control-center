import { useAgents, useQueue } from './use-home.js'
import { useProjectTasks } from './use-tasks.js'
import { useWorkFolderChats } from './use-telegram.js'

export interface CounterState {
  /** Undefined while loading or after an error. */
  value: number | undefined
  isError: boolean
}

export interface NavCounters {
  queue: CounterState
  agents: CounterState
  tasks: CounterState
  telegram: CounterState
}

/** The four live counters in the sidebar (SPEC section 8.1). */
export function useNavCounters(): NavCounters {
  const queue = useQueue()
  const agents = useAgents()
  const tasks = useProjectTasks()
  const chats = useWorkFolderChats()

  return {
    queue: { value: queue.data?.length, isError: queue.isError },
    agents: { value: agents.data?.length, isError: agents.isError },
    tasks: { value: tasks.data?.length, isError: tasks.isError },
    telegram: {
      value: chats.data?.reduce((sum, chat) => sum + chat.unread, 0),
      isError: chats.isError,
    },
  }
}

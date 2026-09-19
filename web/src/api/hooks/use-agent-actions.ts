import type {
  ContextRef,
  ID,
  PermissionDecision,
  PlanDecision,
  QueueItem,
} from '@control-center/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useApi } from '../use-api.js'
import { queryKeys } from '../query-keys.js'

/**
 * Agent actions. Each one removes the queue item it answers straight away and puts it back if
 * the call fails, which is the behaviour SPEC section 8.2 asks for. The event that follows
 * reconciles whatever the optimistic edit got wrong.
 */

interface QueueSnapshot {
  previous: QueueItem[] | undefined
}

function dropQueueItems(
  queryClient: QueryClient,
  matches: (item: QueueItem) => boolean,
): QueueSnapshot {
  const previous = queryClient.getQueryData<QueueItem[]>(queryKeys.queue)
  if (previous !== undefined) {
    queryClient.setQueryData<QueueItem[]>(
      queryKeys.queue,
      previous.filter((item) => !matches(item)),
    )
  }
  return { previous }
}

function restoreQueue(queryClient: QueryClient, snapshot: QueueSnapshot | undefined): void {
  if (snapshot?.previous !== undefined) {
    queryClient.setQueryData<QueueItem[]>(queryKeys.queue, snapshot.previous)
  }
}

function useAgentMutation<TVariables extends { agentId: ID }, TResult = void>(
  run: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient()

  return useMutation<TResult, Error, TVariables, QueueSnapshot>({
    mutationFn: run,
    onMutate: (variables) =>
      Promise.resolve(dropQueueItems(queryClient, (item) => item.agentId === variables.agentId)),
    onError: (_error, _variables, context) => {
      restoreQueue(queryClient, context)
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.queue }),
        queryClient.invalidateQueries({ queryKey: queryKeys.agents }),
      ])
    },
  })
}

export function useResolvePermission() {
  const api = useApi()
  return useAgentMutation<{ agentId: ID; decision: PermissionDecision }>(({ agentId, decision }) =>
    api.resolvePermission(agentId, decision),
  )
}

export function useResolvePlan() {
  const api = useApi()
  return useAgentMutation<{ agentId: ID; decision: PlanDecision; note?: string }>(
    ({ agentId, decision, note }) => api.resolvePlan(agentId, decision, note),
  )
}

export function useAnswerQuestion() {
  const api = useApi()
  return useAgentMutation<{ agentId: ID; text: string }>(({ agentId, text }) =>
    api.answerQuestion(agentId, text),
  )
}

export function useRestartAgent() {
  const api = useApi()
  return useAgentMutation<{ agentId: ID }>(({ agentId }) => api.restartAgent(agentId))
}

export function useSendPrompt() {
  const api = useApi()
  return useAgentMutation<{ agentId: ID; text: string; contextRefs: ContextRef[] }>(
    ({ agentId, text, contextRefs }) => api.sendPrompt(agentId, text, contextRefs),
  )
}

export function useStartAgent() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: { taskId: ID }) => api.startAgent(taskId),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.agents }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      ])
    },
  })
}

/** Removes a queue item that no agent owns, such as a Telegram mention. */
export function useDismissQueueItem() {
  const queryClient = useQueryClient()
  return (itemId: ID): void => {
    dropQueueItems(queryClient, (item) => item.id === itemId)
  }
}

import type { ID, TrackerStatus } from '@control-center/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../use-api.js'
import { queryKeys } from '../query-keys.js'

export function useTransitionTask(taskId: ID | undefined) {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ to }: { to: TrackerStatus }) => api.transitionTask(taskId ?? '', to),
    onSettled: async () => {
      if (taskId === undefined) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.allowedTransitions(taskId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.timeline(taskId) }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['task-by-key'] }),
      ])
    },
  })
}

export function useAddTrackerComment(taskId: ID | undefined) {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ text }: { text: string }) => api.addTrackerComment(taskId ?? '', text),
    onSettled: async () => {
      if (taskId !== undefined) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.timeline(taskId) })
      }
    },
  })
}

export function useCreateTaskFromMessage() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chatId, messageId }: { chatId: ID; messageId: ID }) =>
      api.createTaskFromMessage(chatId, messageId),
    onSettled: async (task) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      await queryClient.invalidateQueries({ queryKey: ['task-by-key'] })
      if (task !== undefined) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.linkedMessages(task.id) })
      }
    },
  })
}

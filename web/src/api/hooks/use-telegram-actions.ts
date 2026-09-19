import type { ID, TgMessage } from '@control-center/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../use-api.js'
import { queryKeys } from '../query-keys.js'

export interface SendMessageVariables {
  chatId: ID
  text: string
  replyToId?: ID
  image?: File
}

/**
 * Sending is optimistic: the message appears at once with a pending id and is replaced by the
 * real one when the call returns, or removed again if it fails (SPEC section 8.3).
 */
export function useSendMessage() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation<TgMessage, Error, SendMessageVariables, { pendingId: string }>({
    mutationFn: ({ chatId, text, replyToId, image }) =>
      api.sendMessage(chatId, {
        text,
        ...(replyToId !== undefined && { replyToId }),
        ...(image !== undefined && { image }),
      }),

    onMutate: (variables) => {
      const pendingId = `pending-${String(Date.now())}`
      const key = queryKeys.messages(variables.chatId)
      const optimistic: TgMessage = {
        id: pendingId,
        chatId: variables.chatId,
        senderName: 'You',
        isOwn: true,
        at: new Date().toISOString(),
        text: variables.text,
        photo: null,
        replyTo: null,
        linkedTaskIds: [],
      }
      queryClient.setQueryData<TgMessage[]>(key, (current) => [...(current ?? []), optimistic])
      return Promise.resolve({ pendingId })
    },

    onError: (_error, variables, context) => {
      if (context === undefined) return
      queryClient.setQueryData<TgMessage[]>(queryKeys.messages(variables.chatId), (current) =>
        (current ?? []).filter((message) => message.id !== context.pendingId),
      )
    },

    onSuccess: (message, variables, context) => {
      queryClient.setQueryData<TgMessage[]>(queryKeys.messages(variables.chatId), (current) =>
        (current ?? []).map((item) => (item.id === context.pendingId ? message : item)),
      )
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chats })
    },
  })
}

export function useMarkRead() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chatId }: { chatId: ID }) => api.markRead(chatId),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chats })
    },
  })
}

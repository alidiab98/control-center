import { tgMessageSchema } from '@control-center/shared'
import type { ID, TgMessage } from '@control-center/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-keys.js'
import { useApi } from '../use-api.js'

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

/**
 * Loads the page of messages before the oldest one held, and prepends it to the same cache
 * entry `useMessages` reads. Keeping one entry means live messages still land in the list
 * while older history is paged in (SPEC section 8.3, "loads older on scroll-up").
 *
 * An empty result means the top of the history has been reached.
 */
export function useLoadOlderMessages(chatId: ID | undefined) {
  const api = useApi()
  const queryClient = useQueryClient()
  const key = queryKeys.messages(chatId ?? 'unknown')

  return useMutation<TgMessage[]>({
    mutationFn: async () => {
      const current = queryClient.getQueryData<TgMessage[]>(key)
      const oldest = current?.[0]
      if (chatId === undefined || oldest === undefined) return []
      return tgMessageSchema.array().parse(await api.getMessages(chatId, oldest.id))
    },

    onSuccess: (older) => {
      if (older.length === 0) return
      queryClient.setQueryData<TgMessage[]>(key, (current) => {
        const known = new Set((current ?? []).map((message) => message.id))
        return [...older.filter((message) => !known.has(message.id)), ...(current ?? [])]
      })
    },
  })
}

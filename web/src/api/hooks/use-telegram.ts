import { tgChatSchema, tgMessageSchema } from '@control-center/shared'
import type { ID } from '@control-center/shared'
import { useQuery } from '@tanstack/react-query'
import { useApi } from '../use-api.js'
import { queryKeys } from '../query-keys.js'

export function useWorkFolderChats() {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.chats,
    queryFn: async () => tgChatSchema.array().parse(await api.getWorkFolderChats()),
  })
}

export function useMessages(chatId: ID | undefined) {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.messages(chatId ?? 'unknown'),
    queryFn: async () => tgMessageSchema.array().parse(await api.getMessages(chatId ?? '')),
    enabled: chatId !== undefined,
  })
}

/**
 * Sum of unread across the work folder: the Telegram counter in the sidebar.
 * Undefined while the chats are still loading.
 */
export function useUnreadCount(): number | undefined {
  const chats = useWorkFolderChats()
  return chats.data?.reduce((sum, chat) => sum + chat.unread, 0)
}

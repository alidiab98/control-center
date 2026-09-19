import type { ApiClient, TgChat, TgMessage } from '@control-center/shared'
import { PLACEHOLDER_PHOTO } from './fixtures/index.js'
import type { MockTiming } from './latency.js'
import type { MockStore } from './store.js'

type TelegramClient = Pick<
  ApiClient,
  'getWorkFolderChats' | 'getMessages' | 'sendMessage' | 'markRead'
>

const PAGE_SIZE = 20

const byTime = (a: { at: string }, b: { at: string }): number => Date.parse(a.at) - Date.parse(b.at)

export function createTelegramClient(store: MockStore, timing: MockTiming): TelegramClient {
  const { data } = store

  const chatMessages = (chatId: string): TgMessage[] =>
    data.messages.filter((message) => message.chatId === chatId).sort(byTime)

  const touchChat = (chatId: string, patch: Partial<TgChat>): void => {
    const index = data.chats.findIndex((chat) => chat.id === chatId)
    const current = data.chats[index]
    if (current === undefined) throw new Error(`chat not found: ${chatId}`)
    const next = { ...current, ...patch }
    data.chats[index] = next
    store.emit({ type: 'tg.chat.updated', chat: next })
  }

  return {
    getWorkFolderChats: () =>
      timing.settle('getWorkFolderChats', () =>
        [...data.chats].sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt)),
      ),

    getMessages: (chatId, beforeId) =>
      timing.settle('getMessages', () => {
        const all = chatMessages(chatId)
        const end = beforeId === undefined ? all.length : all.findIndex((m) => m.id === beforeId)
        const upTo = end < 0 ? all.length : end
        return all.slice(Math.max(0, upTo - PAGE_SIZE), upTo)
      }),

    sendMessage: (chatId, input) =>
      timing.settle('sendMessage', () => {
        const replyTarget =
          input.replyToId === undefined
            ? undefined
            : data.messages.find((message) => message.id === input.replyToId)

        const message: TgMessage = {
          id: store.nextId('msg'),
          chatId,
          senderName: 'You',
          isOwn: true,
          at: store.clock().toISOString(),
          text: input.text,
          photo:
            input.image === undefined
              ? null
              : { thumbUrl: PLACEHOLDER_PHOTO, width: 320, height: 180 },
          replyTo:
            replyTarget === undefined
              ? null
              : {
                  messageId: replyTarget.id,
                  senderName: replyTarget.senderName,
                  preview: replyTarget.text.slice(0, 60),
                },
          linkedTaskIds: [],
        }

        data.messages.push(message)
        store.emit({ type: 'tg.message', message })
        touchChat(chatId, {
          lastMessagePreview: `You: ${input.text}`,
          lastMessageAt: message.at,
        })
        return message
      }),

    markRead: (chatId) =>
      timing.settle('markRead', () => {
        touchChat(chatId, { unread: 0 })
      }),
  }
}

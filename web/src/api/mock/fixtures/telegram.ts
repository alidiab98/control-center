import type { TgChat, TgMessage } from '@control-center/shared'
import { CHAT_IDS, MESSAGE_IDS, TASK_IDS } from './ids.js'
import { daysAgo, minutesAgo } from './time.js'

/**
 * A placeholder thumbnail. Fixtures never carry real screenshots or real chat content;
 * the people here are invented, as in the design mockups.
 */
export const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">' +
      '<rect width="320" height="180" fill="#1a1d23" stroke="#2c313a"/>' +
      '<text x="160" y="96" fill="#a3a6ad" font-family="monospace" font-size="12" ' +
      'text-anchor="middle">[photo: screenshot of the 504 error]</text></svg>',
  )

/** Six chats in the work folder; unread 4 + 2 + 1 puts the sidebar Telegram counter at 7. */
export function createChats(now: Date): TgChat[] {
  return [
    {
      id: CHAT_IDS.dev,
      title: 'Dev team',
      kind: 'group',
      memberCount: 8,
      unread: 4,
      lastMessagePreview: 'Дмитрий: есть сроки? клиент спрашивает',
      lastMessageAt: minutesAgo(now, 6),
      initials: 'DT',
    },
    {
      id: CHAT_IDS.releases,
      title: 'Релизы',
      kind: 'group',
      memberCount: 5,
      unread: 2,
      lastMessagePreview: 'Ольга: выкатываем в четверг после обеда',
      lastMessageAt: minutesAgo(now, 32),
      initials: 'Р',
    },
    {
      id: CHAT_IDS.dmitry,
      title: 'Дмитрий',
      kind: 'user',
      memberCount: null,
      unread: 1,
      lastMessagePreview: 'скинь, пожалуйста, ссылку на ветку',
      lastMessageAt: minutesAgo(now, 60),
      initials: 'Д',
    },
    {
      id: CHAT_IDS.support,
      title: 'Поддержка',
      kind: 'group',
      memberCount: 4,
      unread: 0,
      lastMessagePreview: 'клиент не может скачать субтитры',
      lastMessageAt: minutesAgo(now, 102),
      initials: 'П',
    },
    {
      id: CHAT_IDS.olga,
      title: 'Ольга',
      kind: 'user',
      memberCount: null,
      unread: 0,
      lastMessagePreview: 'You: ок, проверю в понедельник',
      lastMessageAt: daysAgo(now, 4),
      initials: 'О',
    },
    {
      id: CHAT_IDS.alerts,
      title: 'Alerts bot',
      kind: 'bot',
      memberCount: null,
      unread: 0,
      lastMessagePreview: 'disk usage 81% on prod',
      lastMessageAt: daysAgo(now, 4),
      initials: 'AB',
    },
  ]
}

/** The Dev team thread from the telegram screenshot, plus a few messages in the other chats. */
export function createMessages(now: Date): TgMessage[] {
  return [
    {
      id: MESSAGE_IDS.devExportFails,
      chatId: CHAT_IDS.dev,
      senderName: 'Дмитрий',
      isOwn: false,
      at: minutesAgo(now, 84),
      text: 'экспорт падает на длинных файлах, клиент прислал запись на 2:40',
      photo: null,
      replyTo: null,
      linkedTaskIds: [TASK_IDS.st412],
    },
    {
      id: MESSAGE_IDS.devReproduced,
      chatId: CHAT_IDS.dev,
      senderName: 'Ольга',
      isOwn: false,
      at: minutesAgo(now, 81),
      text: 'воспроизвела на dev, 504 через 60 секунд',
      photo: { thumbUrl: PLACEHOLDER_PHOTO, width: 320, height: 180 },
      replyTo: {
        messageId: MESSAGE_IDS.devExportFails,
        senderName: 'Дмитрий',
        preview: 'экспорт падает на длинных файлах',
      },
      linkedTaskIds: [TASK_IDS.st412],
    },
    {
      id: MESSAGE_IDS.devTaskCreated,
      chatId: CHAT_IDS.dev,
      senderName: 'You',
      isOwn: true,
      at: minutesAgo(now, 71),
      text: 'беру, завёл ST-412',
      photo: null,
      replyTo: null,
      linkedTaskIds: [TASK_IDS.st412],
    },
    {
      id: MESSAGE_IDS.devDeadline,
      chatId: CHAT_IDS.dev,
      senderName: 'Дмитрий',
      isOwn: false,
      at: minutesAgo(now, 6),
      text: 'есть сроки? клиент спрашивает',
      photo: null,
      replyTo: null,
      linkedTaskIds: [TASK_IDS.st412],
    },
    {
      id: 'msg-releases-1',
      chatId: CHAT_IDS.releases,
      senderName: 'Ольга',
      isOwn: false,
      at: minutesAgo(now, 32),
      text: 'выкатываем в четверг после обеда',
      photo: null,
      replyTo: null,
      linkedTaskIds: [],
    },
    {
      id: 'msg-dmitry-1',
      chatId: CHAT_IDS.dmitry,
      senderName: 'Дмитрий',
      isOwn: false,
      at: minutesAgo(now, 60),
      text: 'скинь, пожалуйста, ссылку на ветку',
      photo: null,
      replyTo: null,
      linkedTaskIds: [],
    },
    {
      id: 'msg-support-1',
      chatId: CHAT_IDS.support,
      senderName: 'Поддержка',
      isOwn: false,
      at: minutesAgo(now, 102),
      text: 'клиент не может скачать субтитры',
      photo: null,
      replyTo: null,
      linkedTaskIds: [],
    },
    {
      id: 'msg-olga-1',
      chatId: CHAT_IDS.olga,
      senderName: 'You',
      isOwn: true,
      at: daysAgo(now, 4),
      text: 'ок, проверю в понедельник',
      photo: null,
      replyTo: null,
      linkedTaskIds: [],
    },
    {
      id: 'msg-alerts-1',
      chatId: CHAT_IDS.alerts,
      senderName: 'Alerts bot',
      isOwn: false,
      at: daysAgo(now, 4),
      text: 'disk usage 81% on prod',
      photo: null,
      replyTo: null,
      linkedTaskIds: [],
    },
  ]
}

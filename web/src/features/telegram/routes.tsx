import type { RouteObject } from 'react-router-dom'
import { TelegramPage } from './telegram-page.js'

export const telegramRoutes: RouteObject[] = [
  { path: 'telegram', element: <TelegramPage /> },
  { path: 'telegram/:chatId', element: <TelegramPage /> },
]

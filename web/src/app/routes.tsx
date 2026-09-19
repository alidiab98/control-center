import type { RouteObject } from 'react-router-dom'
import { homeRoutes } from '@/features/home/routes.js'
import { taskRoutes } from '@/features/task/routes.js'
import { telegramRoutes } from '@/features/telegram/routes.js'
import { AppShell } from './app-shell.js'
import { HomeLayout } from './home-layout.js'
import { NotBuiltYetPage } from './not-built-yet-page.js'
import { NotFoundPage } from './not-found-page.js'

/**
 * Each feature exports its own route array, so F1, F2 and F3 can add screens without
 * touching this file.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { element: <HomeLayout />, children: homeRoutes },
      ...telegramRoutes,
      ...taskRoutes,
      {
        path: 'agents',
        element: <NotBuiltYetPage title="Agents board" milestone="a later milestone" />,
      },
      {
        path: 'deploy',
        element: <NotBuiltYetPage title="Deploy & logs" milestone="the backend phase" />,
      },
      {
        path: 'search',
        element: <NotBuiltYetPage title="Search & memory" milestone="the backend phase" />,
      },
      {
        path: 'reports',
        element: <NotBuiltYetPage title="Reports" milestone="the backend phase" />,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

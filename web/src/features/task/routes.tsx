import type { RouteObject } from 'react-router-dom'
import { TaskPage } from './task-page.js'
import { TasksPage } from './tasks-page.js'

export const taskRoutes: RouteObject[] = [
  { path: 'tasks', element: <TasksPage /> },
  { path: 'tasks/:key', element: <TaskPage /> },
]

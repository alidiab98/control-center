import type { RouteObject } from 'react-router-dom'
import { HomePage } from './home-page.js'

/** Home owns everything under "/". The shell only wraps it with the top bar. */
export const homeRoutes: RouteObject[] = [{ index: true, element: <HomePage /> }]

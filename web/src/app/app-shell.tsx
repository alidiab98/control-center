import { Outlet } from 'react-router-dom'
import { useServerEvents } from '@/api/index.js'
import { Sidebar } from './sidebar.js'

/** Sidebar plus the content area, and the one place that subscribes to live events. */
export function AppShell() {
  useServerEvents()

  return (
    <div className="flex min-h-screen min-w-[1280px] bg-bg text-text">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}

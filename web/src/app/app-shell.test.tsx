import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ApiProvider, createQueryClient, parseRuntimeConfig } from '@/api/index.js'
import type { ApiRuntime } from '@/api/index.js'
import { createMockClient } from '@/api/mock/mock-client.js'
import { routes } from './routes.js'

const NOW = new Date('2026-09-19T11:12:00')

function renderApp(initialPath = '/', search = '?mock=static') {
  const { client } = createMockClient(parseRuntimeConfig(search), NOW)
  const runtime: ApiRuntime = { client, mode: 'static', bootTime: NOW }
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ApiProvider runtime={runtime}>
        <RouterProvider router={router} />
      </ApiProvider>
    </QueryClientProvider>,
  )
}

describe('app shell', () => {
  it('renders the brand and all seven nav entries', async () => {
    renderApp()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    for (const label of [
      'Queue',
      'Agents board',
      'Tasks',
      'Telegram',
      'Deploy & logs',
      'Search & memory',
      'Reports',
    ]) {
      expect(within(nav).getByRole('link', { name: new RegExp(`^${label}`) })).toBeInTheDocument()
    }
    expect(await screen.findByText('ST-398')).toBeInTheDocument()
  })

  it('shows live counters from the mock', async () => {
    renderApp()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    expect(await within(nav).findByRole('link', { name: 'Queue 6' })).toBeInTheDocument()
    expect(await within(nav).findByRole('link', { name: 'Agents board 7' })).toBeInTheDocument()
    expect(await within(nav).findByRole('link', { name: 'Tasks 12' })).toBeInTheDocument()
    expect(await within(nav).findByRole('link', { name: 'Telegram 7' })).toBeInTheDocument()
  })

  it('updates a counter when an event arrives, without a reload', async () => {
    const { client } = createMockClient(parseRuntimeConfig('?mock=static'), NOW)
    const runtime: ApiRuntime = { client, mode: 'static', bootTime: NOW }
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <ApiProvider runtime={runtime}>
          <RouterProvider router={router} />
        </ApiProvider>
      </QueryClientProvider>,
    )

    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(await within(nav).findByRole('link', { name: 'Queue 6' })).toBeInTheDocument()

    await client.resolvePermission('agent-st-412', 'allow_once')
    expect(await within(nav).findByRole('link', { name: 'Queue 5' })).toBeInTheDocument()
  })

  it('shows the home top bar with tracked time and an inert command input', async () => {
    renderApp()

    expect(await screen.findByText('4h 12m')).toBeInTheDocument()
    expect(screen.getByLabelText('Run a command')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'New agent' })).toBeDisabled()
  })

  it('routes to each screen', async () => {
    renderApp('/telegram')
    expect(await screen.findByRole('heading', { name: 'Work folder' })).toBeInTheDocument()
  })

  it('shows "Not built yet" for the four unbuilt screens', async () => {
    for (const [path, heading] of [
      ['/agents', 'Agents board'],
      ['/deploy', 'Deploy & logs'],
      ['/search', 'Search & memory'],
      ['/reports', 'Reports'],
    ] as const) {
      const view = renderApp(path)
      expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
      expect(screen.getByText(/Not built yet/)).toBeInTheDocument()
      view.unmount()
    }
  })

  it('navigates with the keyboard and keeps the mock mode in the URL', async () => {
    renderApp('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })

    await userEvent.click(within(nav).getByRole('link', { name: /^Tasks/ }))
    expect(await screen.findByRole('heading', { name: 'Tasks' })).toBeInTheDocument()
  })

  it('shows an error state when a call fails', async () => {
    renderApp('/', '?mock=static&mockFail=getDeploySlot')
    expect(await screen.findByText('Slot unavailable')).toBeInTheDocument()
  })
})

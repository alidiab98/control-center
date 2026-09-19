import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import type { ApiRuntime } from '../api-context.js'
import { ApiProvider } from '../api-provider.js'
import { TASK_IDS } from '../mock/fixtures/index.js'
import { createMockClient } from '../mock/mock-client.js'
import type { MockStore } from '../mock/store.js'
import { createQueryClient } from '../query-client.js'
import { parseRuntimeConfig } from '../runtime-config.js'
import { useAutomationsToday } from './use-home.js'
import { useServerEvents } from './use-server-events.js'

const NOW = new Date('2026-09-19T11:12:00')

function setup(search = '?mock=static'): { runtime: ApiRuntime; store: MockStore } {
  const { client, store } = createMockClient(parseRuntimeConfig(search), NOW)
  return { runtime: { client, mode: 'static', bootTime: NOW }, store }
}

function renderWith(ui: ReactNode, runtime: ApiRuntime) {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <ApiProvider runtime={runtime}>{ui}</ApiProvider>
    </QueryClientProvider>,
  )
}

function Automations() {
  useServerEvents()
  const { data, isPending, isError } = useAutomationsToday()
  if (isPending) return <p>loading</p>
  if (isError) return <p>failed</p>
  return (
    <ul>
      {data.map((event) => (
        <li key={event.id}>{event.text}</li>
      ))}
    </ul>
  )
}

describe('useAutomationsToday', () => {
  it('lists the three automations from the home screenshot', async () => {
    const { runtime } = setup()
    renderWith(<Automations />, runtime)

    expect(
      await screen.findByText('ST-405 auto-review finished, 1 risk flagged'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('ST-398 moved to In progress when its agent started'),
    ).toBeInTheDocument()
    expect(screen.getByText("Standup draft ready from today's events")).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('grows when an automation arrives live, without a refetch', async () => {
    const { runtime, store } = setup()
    renderWith(<Automations />, runtime)
    await screen.findByText("Standup draft ready from today's events")

    store.addTimelineEvent(TASK_IDS.st412, 'Agent wrote a new test for long exports', {
      automation: true,
    })

    expect(await screen.findByText('Agent wrote a new test for long exports')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('ignores a live event that a person caused', async () => {
    const { runtime, store } = setup()
    renderWith(<Automations />, runtime)
    await screen.findByText("Standup draft ready from today's events")

    store.addTimelineEvent(TASK_IDS.st412, 'Permission allowed by you')

    expect(screen.queryByText('Permission allowed by you')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('surfaces a failure so the error state can render', async () => {
    const { runtime } = setup('?mock=static&mockFail=getAutomationsToday')
    renderWith(<Automations />, runtime)

    expect(await screen.findByText('failed')).toBeInTheDocument()
  })
})

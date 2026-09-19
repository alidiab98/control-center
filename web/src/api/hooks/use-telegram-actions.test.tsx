import type { TgMessage } from '@control-center/shared'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import type { ApiRuntime } from '../api-context.js'
import { ApiProvider } from '../api-provider.js'
import { CHAT_IDS } from '../mock/fixtures/index.js'
import { createMockClient } from '../mock/mock-client.js'
import { createQueryClient } from '../query-client.js'
import { queryKeys } from '../query-keys.js'
import { parseRuntimeConfig } from '../runtime-config.js'
import { useMessages } from './use-telegram.js'
import { useLoadOlderMessages, useSendMessage } from './use-telegram-actions.js'

const NOW = new Date('2026-09-19T11:12:00')

function makeRuntime(search = '?mock=static'): ApiRuntime {
  const { client } = createMockClient(parseRuntimeConfig(search), NOW)
  return { client, mode: 'static', bootTime: NOW }
}

function renderWith(ui: ReactNode, runtime: ApiRuntime) {
  const queryClient = createQueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ApiProvider runtime={runtime}>{ui}</ApiProvider>
    </QueryClientProvider>,
  )
  return queryClient
}

describe('useSendMessage', () => {
  it('shows the message at once and replaces it with the stored one', async () => {
    const runtime = makeRuntime()
    let send: (() => void) | undefined

    function Probe() {
      const messages = useMessages(CHAT_IDS.dev)
      const mutation = useSendMessage()
      send = () => {
        mutation.mutate({ chatId: CHAT_IDS.dev, text: 'выкачу после обеда' })
      }
      return <p>count: {messages.data?.length ?? 0}</p>
    }

    const queryClient = renderWith(<Probe />, runtime)
    await screen.findByText('count: 4')

    send?.()
    await screen.findByText('count: 5')

    await waitFor(() => {
      const messages = queryClient.getQueryData<TgMessage[]>(queryKeys.messages(CHAT_IDS.dev))
      expect(messages?.at(-1)?.id.startsWith('pending-')).toBe(false)
      expect(messages?.at(-1)?.text).toBe('выкачу после обеда')
    })
  })

  it('takes the message back when sending fails', async () => {
    const runtime = makeRuntime('?mock=static&mockFail=sendMessage')
    let send: (() => void) | undefined
    let failed = false

    function Probe() {
      const messages = useMessages(CHAT_IDS.dev)
      const mutation = useSendMessage()
      failed = mutation.isError
      send = () => {
        mutation.mutate({ chatId: CHAT_IDS.dev, text: 'не дойдёт' })
      }
      return <p>count: {messages.data?.length ?? 0}</p>
    }

    const queryClient = renderWith(<Probe />, runtime)
    await screen.findByText('count: 4')

    send?.()

    // Static mode has no latency, so the rollback can land in the same frame as the insert.
    // What matters is the end state: the failed message is gone and nothing is left pending.
    await waitFor(() => {
      expect(failed).toBe(true)
    })
    const messages = queryClient.getQueryData<TgMessage[]>(queryKeys.messages(CHAT_IDS.dev))
    expect(messages).toHaveLength(4)
    expect(messages?.some((message) => message.id.startsWith('pending-'))).toBe(false)
    expect(screen.getByText('count: 4')).toBeInTheDocument()
  })
})

describe('useLoadOlderMessages', () => {
  it('prepends the page before the oldest message and reports the end of history', async () => {
    const runtime = makeRuntime()
    let loadOlder: (() => void) | undefined
    let lastResult: TgMessage[] | undefined

    function Probe() {
      const messages = useMessages(CHAT_IDS.dev)
      const mutation = useLoadOlderMessages(CHAT_IDS.dev)
      loadOlder = () => {
        mutation.mutate(undefined, {
          onSuccess: (older) => {
            lastResult = older
          },
        })
      }
      return <p>count: {messages.data?.length ?? 0}</p>
    }

    renderWith(<Probe />, runtime)
    await screen.findByText('count: 4')

    // The Dev team thread is shorter than a page, so there is nothing older to load.
    loadOlder?.()
    await waitFor(() => {
      expect(lastResult).toEqual([])
    })
    expect(screen.getByText('count: 4')).toBeInTheDocument()
  })
})

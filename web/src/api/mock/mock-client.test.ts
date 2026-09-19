import type { ServerEvent } from '@control-center/shared'
import { describe, expect, it } from 'vitest'
import { parseRuntimeConfig } from '../runtime-config.js'
import { AGENT_IDS, CHAT_IDS, MESSAGE_IDS, PROJECT_ID, TASK_IDS } from './fixtures/index.js'
import { createMockClient } from './mock-client.js'

const NOW = new Date('2026-09-19T11:12:00')

function setup(search = '?mock=static') {
  const { client, store } = createMockClient(parseRuntimeConfig(search), NOW)
  const events: ServerEvent[] = []
  const unsubscribe = client.subscribe((event) => events.push(event))
  return { client, store, events, unsubscribe }
}

describe('reads', () => {
  it('sorts the queue by priority', async () => {
    const { client } = setup()
    const queue = await client.getQueue()
    expect(queue.map((item) => item.kind)).toEqual([
      'permission',
      'plan',
      'mention',
      'review',
      'question',
      'stalled',
    ])
  })

  it('returns the tasks of a project and one task by id', async () => {
    const { client } = setup()
    expect(await client.getTasks(PROJECT_ID)).toHaveLength(12)
    expect((await client.getTask(TASK_IDS.st412)).key).toBe('ST-412')
  })

  it('rejects for an unknown task', async () => {
    const { client } = setup()
    await expect(client.getTask('nope')).rejects.toThrow('task not found: nope')
  })

  it('orders chats by last message and pages messages oldest first', async () => {
    const { client } = setup()
    const chats = await client.getWorkFolderChats()
    expect(chats[0]?.title).toBe('Dev team')

    const messages = await client.getMessages(CHAT_IDS.dev)
    expect(messages.map((message) => message.id)).toEqual([
      MESSAGE_IDS.devExportFails,
      MESSAGE_IDS.devReproduced,
      MESSAGE_IDS.devTaskCreated,
      MESSAGE_IDS.devDeadline,
    ])
  })

  it('lists only the transitions Tracker allows', async () => {
    const { client } = setup()
    expect(await client.getAllowedTransitions(TASK_IDS.st412)).toEqual(['review', 'open'])
  })
})

describe('agent actions', () => {
  it('resolvePermission removes the queue item and moves the agent to running', async () => {
    const { client, events } = setup()

    await client.resolvePermission(AGENT_IDS.st412, 'allow_once')

    expect(events.map((event) => event.type)).toEqual([
      'queue.removed',
      'agent.updated',
      'timeline.added',
    ])
    const queue = await client.getQueue()
    expect(queue.some((item) => item.kind === 'permission')).toBe(false)

    const agents = await client.getAgents()
    const agent = agents.find((candidate) => candidate.id === AGENT_IDS.st412)
    expect(agent).toMatchObject({ state: 'running', pending: null })
  })

  it('resolvePlan records the note when the plan is sent back', async () => {
    const { client, events } = setup()
    await client.resolvePlan(AGENT_IDS.st420, 'reject', 'split step 2')

    const timeline = events.find((event) => event.type === 'timeline.added')
    expect(timeline?.type === 'timeline.added' && timeline.event.text).toContain('split step 2')
  })

  it('startAgent adds a session and updates the agent count', async () => {
    const { client, events } = setup()
    const agent = await client.startAgent(TASK_IDS.st430)

    expect(agent.state).toBe('starting')
    expect((await client.getAgents()).length).toBe(8)
    expect((await client.getStats()).agentCount).toBe(8)
    expect(events.some((event) => event.type === 'stats.updated')).toBe(true)
  })
})

describe('tasks and telegram', () => {
  it('transitionTask refuses a transition Tracker would not allow', async () => {
    const { client } = setup()
    await expect(client.transitionTask(TASK_IDS.st412, 'done')).rejects.toThrow(
      'transition not allowed',
    )
  })

  it('transitionTask updates the task and the timeline', async () => {
    const { client, events } = setup()
    const task = await client.transitionTask(TASK_IDS.st412, 'review')

    expect(task.status).toBe('review')
    expect(events.map((event) => event.type)).toEqual(['task.updated', 'timeline.added'])
  })

  it('createTaskFromMessage links the message to the new task', async () => {
    const { client } = setup()
    const task = await client.createTaskFromMessage(CHAT_IDS.dmitry, 'msg-dmitry-1')

    expect(task.key).toBe('ST-431')
    expect(task.origin).toEqual({
      kind: 'telegram',
      chatId: CHAT_IDS.dmitry,
      messageId: 'msg-dmitry-1',
    })
    expect(await client.getLinkedMessages(task.id)).toHaveLength(1)
  })

  it('sendMessage appends an own message and refreshes the chat', async () => {
    const { client, events } = setup()
    const message = await client.sendMessage(CHAT_IDS.dev, {
      text: 'фикс готов, выкачу на dev',
      replyToId: MESSAGE_IDS.devDeadline,
    })

    expect(message.isOwn).toBe(true)
    expect(message.replyTo?.senderName).toBe('Дмитрий')
    expect(events.map((event) => event.type)).toEqual(['tg.message', 'tg.chat.updated'])

    const chats = await client.getWorkFolderChats()
    expect(chats[0]?.lastMessagePreview).toContain('фикс готов')
  })

  it('markRead clears the unread badge', async () => {
    const { client } = setup()
    await client.markRead(CHAT_IDS.dev)
    const chats = await client.getWorkFolderChats()
    expect(chats.find((chat) => chat.id === CHAT_IDS.dev)?.unread).toBe(0)
  })
})

describe('failure injection', () => {
  it('rejects the named method and leaves the store untouched', async () => {
    const { client } = setup('?mock=static&mockFail=resolvePermission')

    await expect(client.resolvePermission(AGENT_IDS.st412, 'allow_once')).rejects.toThrow(
      'mock failure: resolvePermission',
    )
    expect((await client.getQueue()).some((item) => item.kind === 'permission')).toBe(true)
  })

  it('fails several methods at once and ignores unknown names', async () => {
    const { client } = setup('?mock=static&mockFail=getQueue,getAgents')
    await expect(client.getQueue()).rejects.toThrow('mock failure: getQueue')
    await expect(client.getAgents()).rejects.toThrow('mock failure: getAgents')

    const clean = setup('?mock=static&mockFail=notAMethod')
    await expect(clean.client.getQueue()).resolves.toHaveLength(6)
  })
})

describe('subscriptions', () => {
  it('stops delivering after unsubscribe', async () => {
    const { client, events, unsubscribe } = setup()
    unsubscribe()

    await client.markRead(CHAT_IDS.dev)
    expect(events).toHaveLength(0)
  })
})

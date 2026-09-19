import {
  agentSessionSchema,
  deploySlotSchema,
  projectSchema,
  queueItemSchema,
  statsSchema,
  taskSchema,
  tgChatSchema,
  tgMessageSchema,
  timelineEventSchema,
} from '@control-center/shared'
import { describe, expect, it } from 'vitest'
import { createFixtures } from './fixtures/index.js'

const fixtures = createFixtures(new Date('2026-09-19T11:12:00'))

describe('fixtures parse against the shared schemas', () => {
  it('parses every collection', () => {
    expect(() => {
      projectSchema.array().parse(fixtures.projects)
      taskSchema.array().parse(fixtures.tasks)
      agentSessionSchema.array().parse(fixtures.agents)
      queueItemSchema.array().parse(fixtures.queue)
      timelineEventSchema.array().parse(fixtures.timeline)
      tgChatSchema.array().parse(fixtures.chats)
      tgMessageSchema.array().parse(fixtures.messages)
      statsSchema.parse(fixtures.stats)
      deploySlotSchema.parse(fixtures.deploySlot)
    }).not.toThrow()
  })
})

describe('fixtures reproduce the design screenshots', () => {
  it('has the counts the sidebar shows', () => {
    expect(fixtures.queue).toHaveLength(6)
    expect(fixtures.agents).toHaveLength(7)
    expect(fixtures.tasks).toHaveLength(12)
    expect(fixtures.chats.reduce((sum, chat) => sum + chat.unread, 0)).toBe(7)
  })

  it('splits the agents the way the header summarises them', () => {
    const byState = (state: string): number =>
      fixtures.agents.filter((agent) => agent.state === state).length

    expect(byState('running')).toBe(2)
    expect(
      byState('needs_permission') + byState('needs_plan_approval') + byState('needs_answer'),
    ).toBe(3)
    expect(byState('review')).toBe(1)
    expect(byState('stalled')).toBe(1)
  })

  it('keeps every queue item pointing at something that exists', () => {
    const taskIds = new Set(fixtures.tasks.map((task) => task.id))
    const agentIds = new Set(fixtures.agents.map((agent) => agent.id))
    const chatIds = new Set(fixtures.chats.map((chat) => chat.id))

    for (const item of fixtures.queue) {
      if (item.taskId !== null) expect(taskIds).toContain(item.taskId)
      if (item.agentId !== null) expect(agentIds).toContain(item.agentId)
      if (item.chatId !== null) expect(chatIds).toContain(item.chatId)
    }
  })

  it('gives every agent a task and every message a chat', () => {
    const taskIds = new Set(fixtures.tasks.map((task) => task.id))
    const chatIds = new Set(fixtures.chats.map((chat) => chat.id))

    for (const agent of fixtures.agents) expect(taskIds).toContain(agent.taskId)
    for (const message of fixtures.messages) expect(chatIds).toContain(message.chatId)
  })

  it('tracks 4h 12m today and reports seven agents', () => {
    expect(fixtures.stats.trackedTodaySeconds).toBe(15_120)
    expect(fixtures.stats.agentCount).toBe(fixtures.agents.length)
    expect(fixtures.deploySlot).toMatchObject({ currentTaskKey: 'ST-398', nextTaskKey: 'ST-405' })
  })
})

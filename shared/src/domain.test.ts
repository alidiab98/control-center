import { describe, expect, it } from 'vitest'
import {
  agentSessionSchema,
  deploySlotSchema,
  queueItemSchema,
  taskSchema,
  tgChatSchema,
  tgMessageSchema,
  timelineEventSchema,
} from './domain.js'

const iso = '2026-09-19T10:02:00.000Z'

describe('taskSchema', () => {
  const task = {
    id: 't-412',
    projectId: 'p-1',
    key: 'ST-412',
    title: 'Export fails on files over 2 hours',
    description: 'long export times out',
    status: 'in_progress',
    priority: 'high',
    assignee: 'you',
    branch: 'fix/ST-412-long-export',
    worktreePath: '~/wt/st-412',
    trackedSeconds: 4080,
    origin: { kind: 'telegram', chatId: 'c-dev', messageId: 'm-1' },
    updatedAt: iso,
  }

  it('accepts a task created from a telegram message', () => {
    expect(taskSchema.parse(task)).toMatchObject({ key: 'ST-412' })
  })

  it('accepts a tracker origin without chat fields', () => {
    expect(taskSchema.parse({ ...task, origin: { kind: 'tracker' } }).origin.kind).toBe('tracker')
  })

  it('rejects an unknown status', () => {
    expect(taskSchema.safeParse({ ...task, status: 'archived' }).success).toBe(false)
  })

  it('rejects a telegram origin missing its message', () => {
    expect(
      taskSchema.safeParse({ ...task, origin: { kind: 'telegram', chatId: 'c-dev' } }).success,
    ).toBe(false)
  })

  it('rejects a non-ISO updatedAt', () => {
    expect(taskSchema.safeParse({ ...task, updatedAt: '19.09.2026' }).success).toBe(false)
  })
})

describe('agentSessionSchema', () => {
  const agent = {
    id: 'a-412',
    taskId: 't-412',
    tmuxSession: 'st-412',
    state: 'needs_permission',
    stateSince: iso,
    lastActivity: 'wants: migrate/up',
    pending: {
      kind: 'permission',
      command: 'php yii migrate/up --interactive=0',
      scope: 'local DB',
    },
    diffStat: { added: 86, removed: 12 },
    testsPassed: true,
  }

  it('accepts a session waiting for permission', () => {
    expect(agentSessionSchema.parse(agent).pending?.kind).toBe('permission')
  })

  it('accepts null pending, diffStat and testsPassed', () => {
    const idle = { ...agent, state: 'running', pending: null, diffStat: null, testsPassed: null }
    expect(agentSessionSchema.parse(idle).pending).toBeNull()
  })

  it('rejects a pending request with the wrong payload for its kind', () => {
    const wrong = { ...agent, pending: { kind: 'question', command: 'x' } }
    expect(agentSessionSchema.safeParse(wrong).success).toBe(false)
  })
})

describe('queueItemSchema', () => {
  it('accepts a mention that has no task or agent', () => {
    const item = {
      id: 'q-3',
      kind: 'mention',
      createdAt: iso,
      taskId: null,
      agentId: null,
      chatId: 'c-dev',
      messageId: 'm-9',
      title: 'Dmitry -> you',
      detail: 'check the export please',
      priority: 30,
    }
    expect(queueItemSchema.parse(item).kind).toBe('mention')
  })

  it('rejects a fractional priority', () => {
    const item = {
      id: 'q-4',
      kind: 'review',
      createdAt: iso,
      taskId: 't-405',
      agentId: 'a-405',
      chatId: null,
      messageId: null,
      title: 'Diff ready',
      detail: 'tests passed',
      priority: 1.5,
    }
    expect(queueItemSchema.safeParse(item).success).toBe(false)
  })
})

describe('telegram schemas', () => {
  it('accepts a chat with an unread count', () => {
    const chat = {
      id: 'c-dev',
      title: 'Dev team',
      kind: 'group',
      memberCount: 8,
      unread: 4,
      lastMessagePreview: 'any deadline?',
      lastMessageAt: iso,
      initials: 'DT',
    }
    expect(tgChatSchema.parse(chat).unread).toBe(4)
  })

  it('accepts a message with a photo and a reply quote', () => {
    const message = {
      id: 'm-2',
      chatId: 'c-dev',
      senderName: 'Olga',
      isOwn: false,
      at: iso,
      text: 'reproduced on dev',
      photo: { thumbUrl: '/mock/504.png', width: 320, height: 180 },
      replyTo: { messageId: 'm-1', senderName: 'Dmitry', preview: 'export fails' },
      linkedTaskIds: ['t-412'],
    }
    expect(tgMessageSchema.parse(message).linkedTaskIds).toEqual(['t-412'])
  })

  it('rejects a photo with a zero width', () => {
    const message = {
      id: 'm-3',
      chatId: 'c-dev',
      senderName: 'Olga',
      isOwn: false,
      at: iso,
      text: '',
      photo: { thumbUrl: '/mock/504.png', width: 0, height: 180 },
      replyTo: null,
      linkedTaskIds: [],
    }
    expect(tgMessageSchema.safeParse(message).success).toBe(false)
  })
})

describe('deploySlotSchema', () => {
  it('accepts an empty slot', () => {
    const slot = { currentTaskKey: null, deployedAt: null, nextTaskKey: null }
    expect(deploySlotSchema.parse(slot).currentTaskKey).toBeNull()
  })
})

describe('timelineEventSchema', () => {
  const event = {
    id: 'tl-1',
    taskId: 't-412',
    at: iso,
    text: 'ST-405 auto-review finished, 1 risk flagged',
    attention: true,
    automation: true,
  }

  it('accepts an automation entry', () => {
    expect(timelineEventSchema.parse(event).automation).toBe(true)
  })

  it('rejects an entry without the automation flag', () => {
    const { automation, ...rest } = event
    expect(automation).toBe(true)
    expect(timelineEventSchema.safeParse(rest).success).toBe(false)
  })
})

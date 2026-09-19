import { describe, expect, it } from 'vitest'
import { serverEventSchema } from './events.js'

const iso = '2026-09-19T10:02:00.000Z'

describe('serverEventSchema', () => {
  it('accepts a queue removal', () => {
    const event = serverEventSchema.parse({ type: 'queue.removed', itemId: 'q-1' })
    expect(event.type).toBe('queue.removed')
  })

  it('accepts a timeline addition', () => {
    const event = {
      type: 'timeline.added',
      event: { id: 'e-1', taskId: 't-412', at: iso, text: 'Tests: 41 passed', attention: false },
    }
    expect(serverEventSchema.parse(event).type).toBe('timeline.added')
  })

  it('rejects an unknown event type', () => {
    expect(serverEventSchema.safeParse({ type: 'agent.exploded', agentId: 'a-1' }).success).toBe(
      false,
    )
  })

  it('rejects a known event type with the wrong payload', () => {
    expect(
      serverEventSchema.safeParse({ type: 'stats.updated', stats: { agentCount: 7 } }).success,
    ).toBe(false)
  })

  it('narrows to the payload of the matching member', () => {
    const event = serverEventSchema.parse({
      type: 'deploy.updated',
      slot: { currentTaskKey: 'ST-398', deployedAt: iso, nextTaskKey: 'ST-405' },
    })
    if (event.type !== 'deploy.updated') throw new Error('expected a deploy event')
    expect(event.slot.currentTaskKey).toBe('ST-398')
  })
})

import type { AgentSession, ApiClient } from '@control-center/shared'
import type { MockTiming } from './latency.js'
import type { MockStore } from './store.js'

type HomeClient = Pick<
  ApiClient,
  | 'getProjects'
  | 'getQueue'
  | 'getAgents'
  | 'getStats'
  | 'getDeploySlot'
  | 'getAutomationsToday'
  | 'resolvePermission'
  | 'resolvePlan'
  | 'answerQuestion'
  | 'sendPrompt'
  | 'restartAgent'
  | 'startAgent'
>

const notFound = (what: string, id: string): Error => new Error(`${what} not found: ${id}`)

/** Home data plus the agent actions the queue triggers (SPEC sections 6 and 8.2). */
export function createHomeClient(store: MockStore, timing: MockTiming): HomeClient {
  const { data } = store

  const dropQueueItemsFor = (agentId: string): void => {
    const ids = new Set(data.queue.filter((item) => item.agentId === agentId).map((i) => i.id))
    store.removeQueueItems((id) => ids.has(id))
  }

  const settleAgent = (
    agentId: string,
    patch: Partial<AgentSession>,
    timelineText: string,
  ): void => {
    const agent = data.agents.find((candidate) => candidate.id === agentId)
    if (agent === undefined) throw notFound('agent', agentId)

    dropQueueItemsFor(agentId)
    store.updateAgent(agentId, { stateSince: store.clock().toISOString(), ...patch })
    store.addTimelineEvent(agent.taskId, timelineText)
  }

  return {
    getProjects: () => timing.settle('getProjects', () => [...data.projects]),
    getQueue: () =>
      timing.settle('getQueue', () =>
        [...data.queue].sort(
          (a, b) => a.priority - b.priority || Date.parse(a.createdAt) - Date.parse(b.createdAt),
        ),
      ),
    getAgents: () => timing.settle('getAgents', () => [...data.agents]),
    getStats: () => timing.settle('getStats', () => ({ ...data.stats })),
    getDeploySlot: () => timing.settle('getDeploySlot', () => ({ ...data.deploySlot })),

    getAutomationsToday: () =>
      timing.settle('getAutomationsToday', () => {
        const startOfToday = new Date(store.clock())
        startOfToday.setHours(0, 0, 0, 0)

        return data.timeline
          .filter((event) => event.automation && Date.parse(event.at) >= startOfToday.getTime())
          .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
      }),

    resolvePermission: (agentId, decision) =>
      timing.settle('resolvePermission', () => {
        settleAgent(
          agentId,
          {
            state: 'running',
            pending: null,
            lastActivity:
              decision === 'allow_once' ? 'running the command' : 'looking for another way',
          },
          decision === 'allow_once' ? 'Permission allowed by you' : 'Permission denied by you',
        )
      }),

    resolvePlan: (agentId, decision, note) =>
      timing.settle('resolvePlan', () => {
        const rejected = `Plan sent back by you${note === undefined ? '' : `: ${note}`}`
        settleAgent(
          agentId,
          {
            state: 'running',
            pending: null,
            lastActivity:
              decision === 'approve' ? 'working through the plan' : 'reworking the plan',
          },
          decision === 'approve' ? 'Plan approved by you' : rejected,
        )
      }),

    answerQuestion: (agentId, text) =>
      timing.settle('answerQuestion', () => {
        settleAgent(
          agentId,
          { state: 'running', pending: null, lastActivity: 'continuing after your answer' },
          `You answered: ${text}`,
        )
      }),

    sendPrompt: (agentId, text, contextRefs) =>
      timing.settle('sendPrompt', () => {
        const context = contextRefs.length === 0 ? '' : ` (+${String(contextRefs.length)} context)`
        settleAgent(
          agentId,
          { state: 'running', pending: null, lastActivity: 'working on your prompt' },
          `Prompt sent${context}: ${text}`,
        )
      }),

    restartAgent: (agentId) =>
      timing.settle('restartAgent', () => {
        settleAgent(
          agentId,
          { state: 'starting', pending: null, lastActivity: 'restarting the session' },
          'Agent restarted by you',
        )
      }),

    startAgent: (taskId) =>
      timing.settle('startAgent', () => {
        const task = data.tasks.find((candidate) => candidate.id === taskId)
        if (task === undefined) throw notFound('task', taskId)

        const agent: AgentSession = {
          id: store.nextId('agent'),
          taskId,
          tmuxSession: task.key.toLowerCase(),
          state: 'starting',
          stateSince: store.clock().toISOString(),
          lastActivity: 'starting the session',
          pending: null,
          diffStat: null,
          testsPassed: null,
        }
        data.agents.push(agent)
        store.emit({ type: 'agent.updated', agent })

        data.stats = { ...data.stats, agentCount: data.agents.length }
        store.emit({ type: 'stats.updated', stats: data.stats })
        store.addTimelineEvent(taskId, `Agent started for ${task.key}`, { automation: true })
        return agent
      }),
  }
}

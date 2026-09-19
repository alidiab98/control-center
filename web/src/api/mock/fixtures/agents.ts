import type { AgentSession } from '@control-center/shared'
import { AGENT_IDS, TASK_IDS } from './ids.js'
import { minutesAgo } from './time.js'

/** The seven sessions in the agents column: 2 running, 3 waiting, 1 review, 1 stalled. */
export function createAgents(now: Date): AgentSession[] {
  return [
    {
      id: AGENT_IDS.st398,
      taskId: TASK_IDS.st398,
      tmuxSession: 'st-398',
      state: 'running',
      stateSince: minutesAgo(now, 12),
      lastActivity: 'editing QueueWorker.php',
      pending: null,
      diffStat: { added: 64, removed: 9 },
      testsPassed: null,
    },
    {
      id: AGENT_IDS.st422,
      taskId: TASK_IDS.st422,
      tmuxSession: 'st-422',
      state: 'running',
      stateSince: minutesAgo(now, 4),
      lastActivity: 'reading logs via logreader',
      pending: null,
      diffStat: null,
      testsPassed: null,
    },
    {
      id: AGENT_IDS.st412,
      taskId: TASK_IDS.st412,
      tmuxSession: 'st-412',
      state: 'needs_permission',
      stateSince: minutesAgo(now, 2),
      lastActivity: 'wants: migrate/up',
      pending: {
        kind: 'permission',
        command: 'php yii migrate/up --interactive=0',
        scope: 'local DB',
      },
      diffStat: { added: 86, removed: 12 },
      testsPassed: true,
    },
    {
      id: AGENT_IDS.st420,
      taskId: TASK_IDS.st420,
      tmuxSession: 'st-420',
      state: 'needs_plan_approval',
      stateSince: minutesAgo(now, 6),
      lastActivity: 'plan mode',
      pending: {
        kind: 'plan',
        summary: 'Return speaker labels from the transcript endpoint',
        steps: [
          'Add a speaker column to the segments table',
          'Fill it from the diarisation output',
          'Expose it in the transcript serializer',
          'Update the API docs',
          'Add a regression test for two speakers',
        ],
      },
      diffStat: null,
      testsPassed: null,
    },
    {
      id: AGENT_IDS.st417,
      taskId: TASK_IDS.st417,
      tmuxSession: 'st-417',
      state: 'needs_answer',
      stateSince: minutesAgo(now, 25),
      lastActivity: 'asked a question',
      pending: {
        kind: 'question',
        text: 'Keep the old endpoint for backward compatibility?',
      },
      diffStat: { added: 31, removed: 18 },
      testsPassed: null,
    },
    {
      id: AGENT_IDS.st405,
      taskId: TASK_IDS.st405,
      tmuxSession: 'st-405',
      state: 'review',
      stateSince: minutesAgo(now, 18),
      lastActivity: 'waiting for review',
      pending: null,
      diffStat: { added: 124, removed: 31 },
      testsPassed: true,
    },
    {
      id: AGENT_IDS.st409,
      taskId: TASK_IDS.st409,
      tmuxSession: 'st-409',
      state: 'stalled',
      stateSince: minutesAgo(now, 41),
      lastActivity: 'last: running test suite',
      pending: null,
      diffStat: { added: 12, removed: 4 },
      testsPassed: null,
    },
  ]
}

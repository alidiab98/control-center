import type { TimelineEvent } from '@control-center/shared'
import { TASK_IDS } from './ids.js'
import { minutesAgo } from './time.js'

/**
 * The ST-412 timeline from the task screenshot, plus the three "Automations today" lines from
 * the home screenshot. Only those three carry `automation: true`, so the home list shows
 * exactly what the design draws.
 */
export function createTimeline(now: Date): TimelineEvent[] {
  return [
    {
      id: 'tl-412-1',
      taskId: TASK_IDS.st412,
      at: minutesAgo(now, 70),
      text: 'Task created from Telegram message',
      attention: false,
      automation: false,
    },
    {
      id: 'tl-412-2',
      taskId: TASK_IDS.st412,
      at: minutesAgo(now, 69),
      text: 'Worktree and branch created',
      attention: false,
      automation: false,
    },
    {
      id: 'tl-412-3',
      taskId: TASK_IDS.st412,
      at: minutesAgo(now, 68),
      text: 'Agent started in plan mode · Tracker → In progress',
      attention: false,
      automation: false,
    },
    {
      id: 'tl-412-4',
      taskId: TASK_IDS.st412,
      at: minutesAgo(now, 61),
      text: 'Plan approved by you',
      attention: false,
      automation: false,
    },
    {
      id: 'tl-412-5',
      taskId: TASK_IDS.st412,
      at: minutesAgo(now, 20),
      text: 'Tests: 41 passed',
      attention: false,
      automation: false,
    },
    {
      id: 'tl-412-6',
      taskId: TASK_IDS.st412,
      at: minutesAgo(now, 2),
      text: 'Permission requested: migrate/up',
      attention: true,
      automation: false,
    },
    {
      id: 'tl-398-1',
      taskId: TASK_IDS.st398,
      at: minutesAgo(now, 12),
      text: 'ST-398 moved to In progress when its agent started',
      attention: false,
      automation: true,
    },
    {
      id: 'tl-405-1',
      taskId: TASK_IDS.st405,
      at: minutesAgo(now, 18),
      text: 'ST-405 auto-review finished, 1 risk flagged',
      attention: true,
      automation: true,
    },
    {
      id: 'tl-409-1',
      taskId: TASK_IDS.st409,
      at: minutesAgo(now, 41),
      text: 'No output from the agent for 40 minutes',
      attention: true,
      automation: false,
    },
    {
      // Not tied to one task; hung off the deployed task until TimelineEvent.taskId can be null.
      id: 'tl-standup-1',
      taskId: TASK_IDS.st398,
      at: minutesAgo(now, 8),
      text: "Standup draft ready from today's events",
      attention: false,
      automation: true,
    },
  ]
}

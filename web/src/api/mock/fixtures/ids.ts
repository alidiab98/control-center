/** Stable fixture ids, shared by the task, agent, queue and telegram fixtures. */
export const PROJECT_ID = 'prj-transcribe'

export const TASK_IDS = {
  st398: 'task-st-398',
  st401: 'task-st-401',
  st405: 'task-st-405',
  st409: 'task-st-409',
  st412: 'task-st-412',
  st414: 'task-st-414',
  st417: 'task-st-417',
  st420: 'task-st-420',
  st422: 'task-st-422',
  st425: 'task-st-425',
  st428: 'task-st-428',
  st430: 'task-st-430',
} as const

export const AGENT_IDS = {
  st398: 'agent-st-398',
  st405: 'agent-st-405',
  st409: 'agent-st-409',
  st412: 'agent-st-412',
  st417: 'agent-st-417',
  st420: 'agent-st-420',
  st422: 'agent-st-422',
} as const

export const CHAT_IDS = {
  dev: 'chat-dev-team',
  releases: 'chat-releases',
  dmitry: 'chat-dmitry',
  support: 'chat-support',
  olga: 'chat-olga',
  alerts: 'chat-alerts-bot',
} as const

export const MESSAGE_IDS = {
  devExportFails: 'msg-dev-1',
  devReproduced: 'msg-dev-2',
  devTaskCreated: 'msg-dev-3',
  devDeadline: 'msg-dev-4',
} as const

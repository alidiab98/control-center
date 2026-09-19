# Control Center — specification (frontend phase)

## 1. Purpose

A local web app for one developer who does almost all coding through Claude Code,
tracks work in Yandex Tracker, and talks to the team in Telegram. Goal: never leave this app
during a working day.

Core ideas:

- The **task** is the central object. A Tracker issue, a git worktree, agent sessions,
  terminals, linked Telegram messages and a timeline all hang off it.
- The **attention queue** is the home screen: one prioritized list of everything that needs the
  user right now. Agents call the user; the user does not poll agents.
- Telegram is a **plain, simple client for the work folder**: list chats, read, reply, send an image.
  No AI triage in that screen.
- Everything that happens is an **event**. The timeline, live updates and later reports come from events.

## 2. Phase plan

Frontend first, against a mock that has the exact shape of the future backend.
The `ApiClient` interface and event types in `shared/` ARE the backend contract.

| Milestone | Scope                                                                                                               | Agents   |
| --------- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| F0        | Scaffold, tokens, app shell, `shared/` contract, mock API + event simulator, test harness                           | 1        |
| F1        | Home: attention queue + agents list, live via mock events                                                           | parallel |
| F2        | Telegram work folder screen                                                                                         | parallel |
| F3        | Task workspace (Tracker panel, timeline, tabs, prompt composer, linked thread). Terminal is a placeholder component | parallel |
| F4        | Real terminal: xterm.js + minimal `server/` pty bridge over WebSocket (only real backend piece in this phase)       | 1        |
| F5        | Command palette (Cmd+K), keyboard navigation, project switcher                                                      | 1        |
| F6        | User lives in it for a few days on mock data, change list, then backend phase starts                                | —        |

F1, F2, F3 run in parallel in separate git worktrees. Each owns only its feature folder.

## 3. Stack

- Node LTS, npm workspaces: `shared`, `web`, `server` (empty until F4), `e2e`.
- `web`: React, Vite, TypeScript strict, Tailwind, React Router, TanStack Query, zod. xterm.js in F4.
- Tests: Vitest + Testing Library (unit), Playwright (e2e).
- ESLint (typescript-eslint strict) + Prettier.
- Exact dependency versions.

## 4. Design

Screenshots in `docs/design/`: `home.png`, `task.png`, `telegram.png`. Match layout,
density and hierarchy. UI language: English. Chat content may be any language (Russian in fixtures).

Tokens (define in Tailwind theme, use by name only):

| Token         | Value   | Use                                                    |
| ------------- | ------- | ------------------------------------------------------ |
| bg            | #121418 | app background                                         |
| rail          | #15181d | sidebar, terminal tab bar                              |
| panel         | #1a1d23 | cards, inputs                                          |
| panel-2       | #20242b | active nav item, chips                                 |
| term          | #0c0e11 | terminal background                                    |
| border        | #2c313a | default borders                                        |
| border-strong | #3a404b | secondary buttons                                      |
| text          | #e8e6e1 | primary text                                           |
| text-2        | #c9cbd1 | secondary text                                         |
| muted         | #a3a6ad | captions, meta                                         |
| attention     | #e3a53f | needs-you state, primary buttons (text on it: #1a1408) |
| ok            | #56bfae | running state, other people's names                    |
| idle          | #6b707a | stalled dot                                            |

Fonts: IBM Plex Sans (UI), IBM Plex Mono (task keys, times, paths, terminal). Self-host via `@fontsource`.
Radius: 8px controls, 10px cards, 12px message bubbles. Controls are 44px tall.
No gradients, no emoji, no icon library needed in this phase.

Layout: fixed left sidebar 208px (brand, nav with counters, dev-slot widget at the bottom),
content area to the right. Minimum supported width 1280px. No mobile layout in this phase.

## 5. Domain model (`shared/src/domain.ts`, each with a zod schema)

```ts
type ID = string
type ISODate = string

interface Project {
  id: ID
  name: string
  repoPath: string
  trackerQueue: string
  tgFolderId: number | null
}

type TrackerStatus = 'open' | 'in_progress' | 'review' | 'testing' | 'done'

interface Task {
  id: ID
  projectId: ID
  key: string // "ST-412"
  title: string
  description: string
  status: TrackerStatus
  priority: 'low' | 'normal' | 'high' | 'critical'
  assignee: string
  branch: string | null
  worktreePath: string | null
  trackedSeconds: number
  origin: { kind: 'tracker' } | { kind: 'telegram'; chatId: ID; messageId: ID }
  updatedAt: ISODate
}

type AgentState =
  | 'starting'
  | 'running'
  | 'needs_permission'
  | 'needs_plan_approval'
  | 'needs_answer'
  | 'review'
  | 'stalled'
  | 'done'

interface AgentSession {
  id: ID
  taskId: ID
  tmuxSession: string
  state: AgentState
  stateSince: ISODate
  lastActivity: string // "editing QueueWorker.php"
  pending: PendingRequest | null
  diffStat: { added: number; removed: number } | null
  testsPassed: boolean | null
}

type PendingRequest =
  | { kind: 'permission'; command: string; scope: string }
  | { kind: 'plan'; summary: string; steps: string[] }
  | { kind: 'question'; text: string }

type QueueItemKind = 'permission' | 'plan' | 'question' | 'review' | 'stalled' | 'mention'

interface QueueItem {
  id: ID
  kind: QueueItemKind
  createdAt: ISODate
  taskId: ID | null
  agentId: ID | null
  chatId: ID | null
  messageId: ID | null
  title: string
  detail: string
  priority: number // lower = higher in the list
}

interface TimelineEvent {
  id: ID
  taskId: ID
  at: ISODate
  text: string
  attention: boolean
}

interface DeploySlot {
  currentTaskKey: string | null
  deployedAt: ISODate | null
  nextTaskKey: string | null
}

interface TgChat {
  id: ID
  title: string
  kind: 'group' | 'user' | 'bot'
  memberCount: number | null
  unread: number
  lastMessagePreview: string
  lastMessageAt: ISODate
  initials: string
}

interface TgMessage {
  id: ID
  chatId: ID
  senderName: string
  isOwn: boolean
  at: ISODate
  text: string
  photo: { thumbUrl: string; width: number; height: number } | null
  replyTo: { messageId: ID; senderName: string; preview: string } | null
  linkedTaskIds: ID[]
}

interface Stats {
  trackedTodaySeconds: number
  agentCount: number
  maxParallelAgents: number
}
```

## 6. API contract (`shared/src/api.ts`)

```ts
interface ApiClient {
  // home
  getQueue(): Promise<QueueItem[]>
  getAgents(): Promise<AgentSession[]>
  getStats(): Promise<Stats>
  getDeploySlot(): Promise<DeploySlot>

  // agent actions
  resolvePermission(agentId: ID, decision: 'allow_once' | 'deny'): Promise<void>
  resolvePlan(agentId: ID, decision: 'approve' | 'reject', note?: string): Promise<void>
  answerQuestion(agentId: ID, text: string): Promise<void>
  sendPrompt(agentId: ID, text: string, contextRefs: ContextRef[]): Promise<void>
  restartAgent(agentId: ID): Promise<void>
  startAgent(taskId: ID): Promise<AgentSession>

  // tasks
  getTasks(projectId: ID): Promise<Task[]>
  getTask(taskId: ID): Promise<Task>
  getTimeline(taskId: ID): Promise<TimelineEvent[]>
  getAllowedTransitions(taskId: ID): Promise<TrackerStatus[]>
  transitionTask(taskId: ID, to: TrackerStatus): Promise<Task>
  addTrackerComment(taskId: ID, text: string): Promise<void>
  getLinkedMessages(taskId: ID): Promise<TgMessage[]>
  createTaskFromMessage(chatId: ID, messageId: ID): Promise<Task>

  // telegram
  getWorkFolderChats(): Promise<TgChat[]>
  getMessages(chatId: ID, beforeId?: ID): Promise<TgMessage[]>
  sendMessage(chatId: ID, input: { text: string; replyToId?: ID; image?: File }): Promise<TgMessage>
  markRead(chatId: ID): Promise<void>

  // live
  subscribe(handler: (e: ServerEvent) => void): () => void
}

type ContextRef =
  | { kind: 'tracker_description' }
  | { kind: 'telegram_thread' }
  | { kind: 'related_task'; taskId: ID }
  | { kind: 'log_error'; text: string }

type ServerEvent =
  | { type: 'queue.added'; item: QueueItem }
  | { type: 'queue.removed'; itemId: ID }
  | { type: 'agent.updated'; agent: AgentSession }
  | { type: 'task.updated'; task: Task }
  | { type: 'timeline.added'; event: TimelineEvent }
  | { type: 'tg.message'; message: TgMessage }
  | { type: 'tg.chat.updated'; chat: TgChat }
  | { type: 'deploy.updated'; slot: DeploySlot }
  | { type: 'stats.updated'; stats: Stats }
```

All mutations are optimistic in the UI and reconciled by the following event.

## 7. Mock layer (`web/src/api/mock/`)

- In-memory store seeded from fixtures that reproduce the design screenshots (same tasks, agents, chats).
- Implements `ApiClient` fully. Mutations change the store and emit the matching `ServerEvent`s
  (e.g. `resolvePermission` removes the queue item and moves the agent to `running`).
- Artificial latency 150–400 ms. Every method can be forced to fail via `?mockFail=<method>` to exercise error states.
- **Simulator** (`?mock=live`, default in dev): every 10–20 s emits a plausible event (agent finishes, new mention, new message).
- **Static mode** (`?mock=static`): no simulator, no random latency. Used by all e2e tests.
- The active client is provided through React context, so swapping in the real HTTP/WS client later touches one file.

## 8. Screens and acceptance criteria

### 8.1 App shell (F0)

- Sidebar with nav: Queue, Agents board, Tasks, Telegram, Deploy & logs, Search & memory, Reports. Counters on Queue, Agents, Tasks, Telegram come from the API and update live.
- Routes: `/` (home), `/tasks/:key`, `/telegram`, `/telegram/:chatId`. Other nav items route to a "Not built yet" page.
- Top bar on home: command input (inert until F5), tracked-today, agent count, "New agent" button (inert).
- Dev-slot widget in the sidebar footer.
- Loading, empty and error states exist for every data region.

### 8.2 Home (F1)

- Left: "Needs you" queue sorted by `priority` then age. The first item is visually emphasized.
- Each item shows kind tag, task key or chat, age (live-updating), title, detail, and two actions depending on kind:
  permission → Allow once / Deny; plan → Approve / Edit plan; mention → Reply / Create task;
  review → Open diff / Send back; question → Answer / Open session; stalled → Open session / Restart.
- Acting on an item removes it optimistically; failure restores it with an inline error.
- Right: agents list with state dot, key, title, last activity, worktree, state + duration. Row click opens the task.
- Below it: "Automations today" list (from timeline events flagged as automation — mock only for now).
- New events from the simulator appear without reload; nothing jumps under the cursor (insertions do not shift the focused item).

### 8.3 Telegram (F2)

- Chat list = work folder only, ordered by last message, with unread badge, preview, time, search filter.
- Conversation: messages grouped by day, own messages right-aligned, photos shown as thumbnails, reply quotes shown above a message.
- Selecting a message reveals actions: Reply, Copy, Create task.
- Composer: text, reply-to bar with cancel, image attach via button, clipboard paste and drag-and-drop, image chip with remove, Enter sends, Shift+Enter newline.
- Sending is optimistic with a pending state; failure shows retry.
- Opening a chat marks it read. "Open in Telegram app" link in the header.
- Scroll: opens at the bottom, loads older on scroll-up, stays pinned to bottom only if already at bottom when a message arrives.

### 8.4 Task workspace (F3)

- Header: back to queue, key, title, status pill, branch, worktree, tracked time, origin. Buttons: transition (only allowed transitions), Deploy to dev (inert).
- Left column: Tracker card (description, fields, Add comment) and Timeline (live).
- Center: tabs Terminal / Diff / Plan / Server logs. Terminal tab hosts a `TerminalPane` component — a static placeholder in F3, real in F4. Diff, Plan, Logs show mock content.
- Pending-request bar under the terminal when the agent has a `pending` request, with the same actions as the queue.
- Prompt composer with context chips (toggle on/off) and Send. Dictate button inert.
- Right column: Telegram messages linked to this task, with a simple reply box (same send behaviour as 8.3, no image).

### 8.5 Terminal (F4)

- `server/`: minimal Fastify + ws + node-pty. `GET /term/:session` upgrades to WS and attaches to `tmux new-session -A -s <session>`. Binds to 127.0.0.1 only. Requires a token from `.env` on the WS URL.
- `TerminalPane`: xterm.js with fit addon, resize propagation, scrollback, copy/paste, reconnect on drop, multiple named terminals per task as sub-tabs.
- Closing the browser tab never kills the tmux session.

### 8.6 Command palette and keyboard (F5)

- Cmd+K opens palette: go to task by key/title, go to chat, go to screen, run action on the focused queue item.
- Home: J/K move focus, Enter opens, A = primary action, D = secondary. Esc closes overlays. Shortcuts never fire while typing in an input.

## 9. Out of scope for this phase

Real Tracker, Telegram and Claude Code integration, SQLite, hooks, auth beyond the terminal token,
mobile layout, AI drafts, auto-review, reports. They come in the backend phase, implementing the same `ApiClient`.

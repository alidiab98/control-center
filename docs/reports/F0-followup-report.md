# F0 follow-up: automations and parallel-safe ports

Date: 2026-09-19. Branch: `main`. Two changes on top of F0, before F1, F2 and F3 start.

## 1. Automations today

**Contract (approved).** `TimelineEvent` gains `automation: boolean`, and `ApiClient` gains
`getAutomationsToday(): Promise<TimelineEvent[]>`, which returns today's automation events
across every task. The method is in `API_METHOD_NAMES`, so `?mockFail=getAutomationsToday`
works like any other method.

**Mock.** Exactly three fixture events carry the flag, and they are the three lines the home
screenshot lists: ST-398 moving to In progress, the ST-405 auto-review, and the standup draft.
The mock also flags what the system raises at runtime: an agent starting, a Tracker transition,
and the simulator's own entry. Anything a person does stays unflagged, so allowing a permission
or adding a comment never shows up as an automation. "Today" is measured from midnight on the
store's clock, which is frozen in static mode.

**Web.** `useAutomationsToday()` reads the list. The reconciler appends any incoming
`timeline.added` event with `automation: true` **and** dated today to that cache, so the list
grows live without a refetch while a replayed or late event from another day stays out. The
day is decided by a `now` parameter rather than the wall clock, so tests do not drift.

While adding that check, the same class of problem turned up across the reconciler: every list
updater used to seed an empty cache from a single event, which would leave a one-item queue or
timeline on screen until it went stale. Lists that have not been fetched are now left alone;
the fetch that follows contains the event anyway. Single entities, such as a task or the stats,
are still written straight through.

**Tests.** Schema accepts and rejects the flag; fixtures carry exactly three automations; the
mock returns them oldest first and excludes earlier days; a Tracker transition is recorded as an
automation while a comment is not; the reconciler adds automations and ignores the rest; and the
hook renders the three lines, grows on a live automation, ignores a manual event, and surfaces a
forced failure.

## 2. `CC_PORT` for parallel worktrees

`CC_PORT` (default 5173) now sets the Vite dev server port and Playwright's `baseURL` and
`webServer` command. `strictPort` is on, so a collision fails with "Port NNNN is already in use"
rather than moving to the next free port, and a value that is not an integer between 1024 and
65535 fails with a message naming `CC_PORT`. When `CC_PORT` is set, Playwright does not reuse a
server that is already running: each run starts and owns its own, so one worktree can never test
another worktree's build. Documented in `CLAUDE.md` under Commands.

`web/tsconfig.json` now includes Node types, because `vite.config.ts` reads `process.env`. To
keep them out of browser code, lint bans `process`, `Buffer` and `__dirname` in `web/src/**`.
The alternative, a second tsconfig wired by project references, would force `composite` and
therefore emit.

### Behaviour checked by hand

| Check                                                  | Result                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `CC_PORT=5199 npm run e2e`                             | 17 passed                                                                 |
| `CC_PORT=abc npm run e2e`                              | fails with `CC_PORT must be an integer between 1024 and 65535, got "abc"` |
| Second dev server on a taken port                      | exits 1 with `Port 5199 is already in use`                                |
| Playwright with `CC_PORT` set against a running server | refuses to reuse it and fails                                             |

## Verification

Captured output, unedited apart from stripping terminal colour codes.

```
$ npm run typecheck

> control-center@0.0.0 typecheck
> npm run typecheck --workspaces --if-present


> @control-center/shared@0.0.0 typecheck
> tsc --noEmit -p tsconfig.json


> @control-center/web@0.0.0 typecheck
> tsc --noEmit -p tsconfig.json


> @control-center/e2e@0.0.0 typecheck
> tsc --noEmit -p tsconfig.json


$ npm run lint

> control-center@0.0.0 lint
> eslint .


$ npm run test

> control-center@0.0.0 test
> vitest run


 RUN  v5.0.1 /Users/alidiab/projects/control-center


 Test Files  13 passed (13)
      Tests  102 passed (102)
   Start at  14:35:07
   Duration  830ms (environment 59%, tests 13%, transform 11%, setup 9%, import 9%, worker 1%)


$ npm run e2e

> control-center@0.0.0 e2e
> playwright test --config e2e/playwright.config.ts


Running 17 tests using 9 workers

  ✓   8 [chromium] › e2e/tests/navigation.spec.ts:31:5 › routes › /deploy says it is not built yet (509ms)
  ✓   1 [chromium] › e2e/tests/counters.spec.ts:23:1 › a counter falls back to a marker when its call fails (555ms)
  ✓   2 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › /telegram loads its screen (578ms)
  ✓   6 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › /tasks/ST-412 loads its screen (578ms)
  ✓   5 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › / loads its screen (571ms)
  ✓   3 [chromium] › e2e/tests/counters.spec.ts:14:1 › sidebar counters match the fixtures (579ms)
  ✓   9 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › /tasks loads its screen (732ms)
  ✓   4 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › /telegram/chat-dev-team loads its screen (734ms)
  ✓   7 [chromium] › e2e/tests/navigation.spec.ts:31:5 › routes › /agents says it is not built yet (764ms)
  ✓  10 [chromium] › e2e/tests/navigation.spec.ts:31:5 › routes › /search says it is not built yet (372ms)
  ✓  11 [chromium] › e2e/tests/navigation.spec.ts:31:5 › routes › /reports says it is not built yet (450ms)
  ✓  12 [chromium] › e2e/tests/navigation.spec.ts:38:3 › routes › an unknown address explains itself (457ms)
  ✓  14 [chromium] › e2e/tests/shell.spec.ts:11:3 › app shell › renders the brand, the nav and the dev slot (506ms)
  ✓  15 [chromium] › e2e/tests/shell.spec.ts:32:3 › app shell › shows the home top bar, inert until later milestones (504ms)
  ✓  13 [chromium] › e2e/tests/navigation.spec.ts:44:3 › routes › clicking through the nav keeps the shell in place (553ms)
  ✓  17 [chromium] › e2e/tests/shell.spec.ts:44:3 › app shell › is operable from the keyboard (443ms)
  ✓  16 [chromium] › e2e/tests/shell.spec.ts:39:3 › app shell › renders the error state when a call is forced to fail (595ms)

  17 passed (2.1s)

$ CC_PORT=5199 npm run e2e

> control-center@0.0.0 e2e
> playwright test --config e2e/playwright.config.ts


Running 17 tests using 9 workers

  ✓   5 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › /tasks loads its screen (484ms)
  ✓   7 [chromium] › e2e/tests/navigation.spec.ts:31:5 › routes › /deploy says it is not built yet (495ms)
  ✓   4 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › / loads its screen (633ms)
  ✓   2 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › /telegram/chat-dev-team loads its screen (677ms)
  ✓   1 [chromium] › e2e/tests/counters.spec.ts:23:1 › a counter falls back to a marker when its call fails (692ms)
  ✓   9 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › /telegram loads its screen (701ms)
  ✓   8 [chromium] › e2e/tests/navigation.spec.ts:31:5 › routes › /agents says it is not built yet (689ms)
  ✓   3 [chromium] › e2e/tests/counters.spec.ts:14:1 › sidebar counters match the fixtures (775ms)
  ✓   6 [chromium] › e2e/tests/navigation.spec.ts:23:5 › routes › /tasks/ST-412 loads its screen (770ms)
  ✓  10 [chromium] › e2e/tests/navigation.spec.ts:31:5 › routes › /search says it is not built yet (478ms)
  ✓  11 [chromium] › e2e/tests/navigation.spec.ts:31:5 › routes › /reports says it is not built yet (483ms)
  ✓  12 [chromium] › e2e/tests/navigation.spec.ts:38:3 › routes › an unknown address explains itself (379ms)
  ✓  15 [chromium] › e2e/tests/shell.spec.ts:32:3 › app shell › shows the home top bar, inert until later milestones (476ms)
  ✓  14 [chromium] › e2e/tests/shell.spec.ts:11:3 › app shell › renders the brand, the nav and the dev slot (490ms)
  ✓  17 [chromium] › e2e/tests/shell.spec.ts:44:3 › app shell › is operable from the keyboard (451ms)
  ✓  13 [chromium] › e2e/tests/navigation.spec.ts:44:3 › routes › clicking through the nav keeps the shell in place (563ms)
  ✓  16 [chromium] › e2e/tests/shell.spec.ts:39:3 › app shell › renders the error state when a call is forced to fail (654ms)

  17 passed (2.2s)
```

## Worth a second opinion

1. **The standup automation is attached to ST-398.** "Standup draft ready from today's events"
   belongs to no task, but `TimelineEvent.taskId` is not nullable, so it hangs off the deployed
   task. Proposed, not committed: `taskId: ID | null`.
2. **Automations come back oldest first.** The mockup's own order is neither chronological nor
   reverse, so it was read as arbitrary and time order won. If the screenshot order matters,
   say so and the fixtures can carry explicit ordering instead.
3. **"Today" depends on the clock.** A live session running past midnight will empty the list
   until new automations arrive. That is what the method name promises, but it is worth knowing
   before someone reports it as a bug.

## Addendum: three decisions applied

Your answers to the three open points, all on `main` and green.

**1. `TimelineEvent.taskId` is now `ID | null`.** The standup draft is detached from ST-398 and
carries `taskId: null`. `getTimeline(taskId)` never returns a task-less event, and the
reconciler skips the per-task timeline cache entirely when an incoming event has no task, so no
task screen can ever show one. `getAutomationsToday()` includes them. Tests cover the schema
accepting null and still rejecting a missing field, the fixture being task-less, every task
timeline excluding it in the mock, and the reconciler adding a task-less live automation to the
automations list while leaving the task timeline untouched.

**2. Automations read newest first.** The mock sorts descending and the reconciler prepends a
live automation rather than appending it, replacing in place when it already holds that id.
Order is asserted in the mock test and in the hook test, which also checks that an automation
arriving live lands at the top.

**3. Midnight behaviour accepted.** Recorded in `docs/decisions.md`: "today" follows the local
calendar day, so a session left open past midnight shows an empty list until new automations
arrive.

The suite is now 102 unit tests and 17 Playwright tests, green on the default port and on
`CC_PORT=5199`.

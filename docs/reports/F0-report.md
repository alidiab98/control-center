# F0 — scaffold: report

Date: 2026-09-19. Branch: `main`. Commits: six, each one green before the next.

## What was built

**Workspaces.** npm workspaces `shared`, `web`, `server` (empty, README only) and `e2e`, on
Node 26 with exact dependency pins and a dependency-free pre-commit hook that runs typecheck
and lint.

**`shared/` — the contract.** Every domain type of SPEC section 5 and every event of section 6,
written as zod schemas with the TypeScript types inferred from them, so validation and types
cannot drift. `ApiClient` carries one approved addition, `getProjects()`, plus a list of method
names that the mock's failure injection validates against, guarded by a compile-time
exhaustiveness check.

**Design tokens and primitives.** SPEC section 4 tokens live in a Tailwind v4 `@theme` block;
components name them and never write hex. IBM Plex Sans and Mono are self-hosted. `web/src/lib/`
holds the pure formatters (`formatAge`, `formatClock`, `formatDuration`, `formatDayLabel`) and
the shared label maps. `web/src/ui/` holds Button, IconButton, Input, Textarea, Card, Tag, Chip,
Badge, Avatar, StateDot, StatusPill, Tabs, and the loading, empty, error and `DataRegion` states.

**Mock layer.** Fixtures reproduce the three screenshots: 12 tasks, 7 agent sessions, 6 queue
items, the ST-412 timeline and 6 work-folder chats. Every timestamp hangs off the moment the
store is created, so the ages in the design are the ages the app renders. Mutations change the
store and emit the matching events. `?mock=static` removes the simulator and the latency,
`?mockFail=<method>` makes any method reject without mutating, and the simulator emits a
plausible event every 10 to 20 seconds while something is listening.

**API layer.** One hook per contract method, reads and writes, so F1, F2 and F3 never need to
add files under `web/src/api/`. Responses are parsed with the shared schemas at the boundary.
Agent actions remove their queue item optimistically and restore it on failure. Live events are
parsed and applied to the query cache, and `useServerEvents()` exposes `resync()` for the real
WebSocket client to call after a reconnect. `useNow()` freezes time in static mode.

**Shell.** Fixed 208px rail with brand, seven nav entries, four live counters and the dev-slot
widget; the home top bar with tracked time, agent count and the two inert controls; routes
composed from per-feature route arrays; a "Not built yet" page for the four unbuilt screens and
a not-found page. Home, Telegram and Task ship as placeholders for F1, F2 and F3.

## Final file tree

Tracked files only; `node_modules`, build output and Playwright reports are ignored.

```
control-center/
├─ .githooks/
│  └─ pre-commit
├─ docs/
│  ├─ design/
│  │  ├─ home.png
│  │  ├─ task.png
│  │  └─ telegram.png
│  ├─ prompts/
│  │  └─ F0-scaffold.md
│  ├─ decisions.md
│  └─ SPEC.md
├─ e2e/
│  ├─ tests/
│  │  ├─ counters.spec.ts
│  │  ├─ navigation.spec.ts
│  │  └─ shell.spec.ts
│  ├─ package.json
│  ├─ playwright.config.ts
│  └─ tsconfig.json
├─ server/
│  ├─ package.json
│  └─ README.md
├─ shared/
│  ├─ src/
│  │  ├─ api.ts
│  │  ├─ domain.test.ts
│  │  ├─ domain.ts
│  │  ├─ events.test.ts
│  │  ├─ events.ts
│  │  └─ index.ts
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ vitest.config.ts
├─ web/
│  ├─ src/
│  │  ├─ api/
│  │  │  ├─ hooks/
│  │  │  │  ├─ use-agent-actions.ts
│  │  │  │  ├─ use-counters.ts
│  │  │  │  ├─ use-home.ts
│  │  │  │  ├─ use-server-events.test.tsx
│  │  │  │  ├─ use-server-events.ts
│  │  │  │  ├─ use-task-actions.ts
│  │  │  │  ├─ use-tasks.ts
│  │  │  │  ├─ use-telegram-actions.ts
│  │  │  │  └─ use-telegram.ts
│  │  │  ├─ mock/
│  │  │  │  ├─ fixtures/
│  │  │  │  │  ├─ agents.ts
│  │  │  │  │  ├─ ids.ts
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  ├─ project.ts
│  │  │  │  │  ├─ queue.ts
│  │  │  │  │  ├─ stats.ts
│  │  │  │  │  ├─ tasks.ts
│  │  │  │  │  ├─ telegram.ts
│  │  │  │  │  ├─ time.ts
│  │  │  │  │  └─ timeline.ts
│  │  │  │  ├─ client-home.ts
│  │  │  │  ├─ client-tasks.ts
│  │  │  │  ├─ client-telegram.ts
│  │  │  │  ├─ fixtures.test.ts
│  │  │  │  ├─ latency.ts
│  │  │  │  ├─ mock-client.test.ts
│  │  │  │  ├─ mock-client.ts
│  │  │  │  ├─ simulator.ts
│  │  │  │  └─ store.ts
│  │  │  ├─ api-context.ts
│  │  │  ├─ api-provider.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ query-client.ts
│  │  │  ├─ query-keys.ts
│  │  │  ├─ runtime-config.ts
│  │  │  ├─ use-api.ts
│  │  │  └─ use-now.ts
│  │  ├─ app/
│  │  │  ├─ app-shell.test.tsx
│  │  │  ├─ app-shell.tsx
│  │  │  ├─ app.tsx
│  │  │  ├─ dev-slot-widget.tsx
│  │  │  ├─ home-layout.tsx
│  │  │  ├─ home-top-bar.tsx
│  │  │  ├─ nav-items.ts
│  │  │  ├─ not-built-yet-page.tsx
│  │  │  ├─ not-found-page.tsx
│  │  │  ├─ routes.tsx
│  │  │  └─ sidebar.tsx
│  │  ├─ features/
│  │  │  ├─ home/
│  │  │  │  ├─ home-page.tsx
│  │  │  │  └─ routes.tsx
│  │  │  ├─ task/
│  │  │  │  ├─ routes.tsx
│  │  │  │  ├─ task-page.tsx
│  │  │  │  └─ tasks-page.tsx
│  │  │  └─ telegram/
│  │  │     ├─ routes.tsx
│  │  │     └─ telegram-page.tsx
│  │  ├─ lib/
│  │  │  ├─ errors.ts
│  │  │  ├─ format.test.ts
│  │  │  ├─ format.ts
│  │  │  ├─ index.ts
│  │  │  └─ labels.ts
│  │  ├─ ui/
│  │  │  ├─ avatar.test.tsx
│  │  │  ├─ avatar.tsx
│  │  │  ├─ badge.tsx
│  │  │  ├─ button.test.tsx
│  │  │  ├─ button.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ chip.tsx
│  │  │  ├─ cn.ts
│  │  │  ├─ data-region.test.tsx
│  │  │  ├─ data-region.tsx
│  │  │  ├─ empty-state.tsx
│  │  │  ├─ error-state.tsx
│  │  │  ├─ icon-button.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ input.tsx
│  │  │  ├─ loading-state.tsx
│  │  │  ├─ state-dot.tsx
│  │  │  ├─ status-pill.tsx
│  │  │  ├─ tabs.test.tsx
│  │  │  ├─ tabs.tsx
│  │  │  ├─ tag.tsx
│  │  │  └─ textarea.tsx
│  │  ├─ index.css
│  │  └─ main.tsx
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  └─ vitest.setup.ts
├─ .gitignore
├─ .npmrc
├─ .nvmrc
├─ .prettierignore
├─ .prettierrc.json
├─ CLAUDE.md
├─ eslint.config.js
├─ package-lock.json
├─ package.json
├─ tsconfig.base.json
├─ tsconfig.json
└─ vitest.config.ts
```

## Verification

All four commands were run from a clean tree, in this order, and all four passed.

```
$ npm run typecheck
> @control-center/shared@0.0.0 typecheck
> tsc --noEmit -p tsconfig.json
> @control-center/web@0.0.0 typecheck
> tsc --noEmit -p tsconfig.json
> @control-center/e2e@0.0.0 typecheck
> tsc --noEmit -p tsconfig.json

$ npm run lint
> eslint .
(no output)

$ npm run test
 RUN  v5.0.1 /Users/alidiab/projects/control-center
 Test Files  11 passed (11)
      Tests  78 passed (78)
   Duration  778ms

$ npm run e2e
Running 17 tests using 9 workers
  17 passed (2.2s)
```

Unit tests cover the schemas, the formatters, the UI primitives, the fixtures against the
schemas, the mock's behaviour (including failure injection and unsubscribe) and the event
reconciler including `resync`. The 17 Playwright tests cover the shell, all seven nav routes,
the four "Not built yet" screens, an unknown address, keyboard navigation, the error state
under `?mockFail=` and the counters matching the fixtures.

Two checks were run by hand and are not part of the suite:

- Live mode: with `?mock=live`, the Telegram counter moved from 7 to 8 about 50 seconds in,
  with no reload, driven by the simulator.
- `node-pty` 1.1.0 on Node 26.7.0: installs from its bundled arm64 prebuild and spawns a pty.
  Two caveats for F4 are recorded in `docs/decisions.md`.

## Deviations from the task text

1. **The fixture-parse test lives in `web/src/api/mock/fixtures.test.ts`, not in `shared/`.**
   Item 2 of the task asks for it in `shared/`, but the fixtures live in `web/` (SPEC section 7)
   and `shared/` may not depend on `web/`. `shared/` has its own schema tests with inline
   samples instead.
2. **Telegram counter reads 7, not the 23 in the home mockup.** Agreed with you before
   implementation: the counter is the sum of unread across the work folder, and the chat-list
   badges stay exactly as drawn (4 + 2 + 1).
3. **`getProjects()` was added to `ApiClient`.** Approved as part of this task, because the
   sidebar cannot count tasks without knowing the project. `useProjects()` and
   `useCurrentProject()` wrap it; there is no hardcoded project id anywhere.
4. **The home top bar lives in the shell, not in `features/home`.** SPEC section 8.1 assigns it
   to F0, so it sits in `web/src/app/` and wraps the home route. F1 owns only the page below it.
5. **Docs housekeeping.** The task prompt moved to `docs/prompts/F0-scaffold.md` and SPEC
   section 4 now names the real screenshot files. Both were approved.

## Toolchain fallbacks

None. Every pinned version installed and ran together, so no tool had to drop a major version.
Three things had to be adjusted, none of them a version change:

- TypeScript is pinned to 6.0.3 rather than 7.0.2, because `typescript-eslint` declares
  `typescript >=4.8.4 <6.1.0`. TypeScript 7 would mean no type-aware linting at all.
- The Vite dev server binds `127.0.0.1` explicitly: its default `localhost` resolved to IPv6
  only here, and Playwright's IPv4 base URL timed out against it.
- Playwright 1.63 needs Chromium revision 1243, which had to be downloaded once with
  `npx playwright install chromium`. A fresh machine will need the same.

## Things I was unsure about

1. **"New agent" and the command input are rendered disabled.** They are inert until later
   milestones, and disabled makes that visible, but the design draws the button in full amber.
   Say the word and they can look enabled and do nothing instead.
2. **The dev slot's "deployed 14:20" is yesterday at 14:20.** The mockup shows a time later
   than its own "now", so a same-day timestamp would read as being in the future.
3. **Project naming in the fixtures.** The screenshots never name the project, so it is
   "Transcribe" with the `ST` queue, inferred from the task titles.
4. **Simulator cadence.** It stops when nothing is subscribed and caps the queue at nine items,
   so a session left open overnight does not accumulate hundreds of entries. Neither rule is in
   the spec.

## Ready for F1, F2 and F3

The three feature tasks can each work inside `web/src/features/<name>/` alone:

- Data comes from hooks in `web/src/api/` — one per contract method, reads and writes.
- Live updates already land in the query cache; nothing to wire up.
- Ages, clocks and durations come from `web/src/lib/format.ts`; state and status words from
  `web/src/lib/labels.ts`.
- Visual parts come from `web/src/ui/`, including the loading, empty and error states.
- Routes are added inside each feature's own `routes.tsx`.
- Tests: `*.test.tsx` for vitest, `*.spec.ts` for Playwright against `?mock=static`.

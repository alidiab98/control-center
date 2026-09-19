# Control Center — rules for agents

Local, single-user web app: one place to run Claude Code agents, move Yandex Tracker
tasks, and use the Telegram work folder. Read `docs/SPEC.md` before any work.
Design references are in `docs/design/` (screenshots). Match them.

## Current phase

FRONTEND-FIRST. The backend does not exist yet. The web app talks only to the
`ApiClient` interface in `shared/`, implemented for now by the mock in `web/src/api/mock/`.
Do not build server code unless the task says so.

## Repo layout

- `shared/` domain types, zod schemas, `ApiClient` interface, WS event types. No runtime deps except zod.
- `web/` React + Vite + TypeScript + Tailwind app.
- `server/` later. Fastify + better-sqlite3 + ws + node-pty.
- `e2e/` Playwright tests.
- `docs/` SPEC.md, design screenshots, decisions log.

## Hard rules

1. TypeScript strict. No `any`, no `@ts-ignore`, no non-null `!` without a comment explaining why.
2. Every value crossing a boundary (API response, WS event, localStorage, URL params) is parsed with a zod schema from `shared/`.
3. Components never import mock data or fixtures. They only use hooks from `web/src/api/`.
4. `shared/` is a contract. Do not change it as a side effect of a feature task. If a change is
   needed, stop, describe the change, and wait for approval.
5. Stay inside the folders your task names. Do not refactor unrelated code.
6. No new dependency without a one-line justification in `docs/decisions.md`. Install with exact versions (no `^` or `~`).
7. A task is NOT done until all of these pass, and you have run them yourself:
   `npm run typecheck && npm run lint && npm run test && npm run e2e`
8. Every screen or feature ships with at least one Playwright test covering its acceptance criteria.
   Tests run against the mock in static mode (`?mock=static`) so they are deterministic.
9. Commit after each green step. Conventional commits (`feat:`, `fix:`, `test:`, `chore:`). Never commit red.
10. Never put secrets, tokens, or real chat content in the repo, fixtures, or logs. Fixtures use invented names.
11. Accessibility basics: real `button` / `a` / `input` + `label`, visible focus ring, full keyboard operation.
12. If something in the spec is ambiguous or seems wrong, ask. Do not guess and do not silently deviate.

## Conventions

- Feature folders: `web/src/features/<name>/` own their components, hooks, and tests.
- Shared UI primitives live in `web/src/ui/`. Design tokens only via Tailwind theme (no raw hex in components).
- State: server state via TanStack Query, live updates by applying WS events to the query cache.
  Local UI state with `useState`; add Zustand only for cross-feature UI state (command palette, selection).
- File names kebab-case, components PascalCase, one component per file.
- Keep files under ~250 lines. Split when larger.

## Commands

- `npm run dev` start everything needed for the current phase
- `npm run typecheck` tsc across all workspaces
- `npm run lint` eslint
- `npm run test` vitest (unit)
- `npm run e2e` playwright (headless)
- `npm run format` prettier write / `npm run format:check` verify

A dependency-free pre-commit hook in `.githooks/pre-commit` runs typecheck + lint.
It is enabled by the root `prepare` script (`git config core.hooksPath .githooks`),
so a plain `npm install` wires it up.

## When you finish a task

Reply with: what changed, what you tested and the result, anything you were unsure about,
and any `shared/` change you think is needed (as a proposal, not a commit).

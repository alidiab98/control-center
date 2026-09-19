# F0 — scaffold (one agent, plan mode first)

Read `CLAUDE.md` and `docs/SPEC.md` fully, and look at the screenshots in `docs/design/`.

Build milestone F0 only:

1. npm workspaces: `shared`, `web`, `e2e` (+ empty `server` with a README). Root scripts: `dev`, `typecheck`, `lint`, `test`, `e2e`.
2. `shared/`: all domain types with zod schemas (SPEC §5), `ApiClient`, `ContextRef`, `ServerEvent` (SPEC §6). Unit tests that the fixtures parse against the schemas.
3. `web/`: Vite + React + TS strict + Tailwind with the tokens from SPEC §4 as theme values, self-hosted IBM Plex Sans/Mono, React Router, TanStack Query, API context provider.
4. Mock layer per SPEC §7: store, fixtures reproducing the three screenshots, full `ApiClient` implementation, simulator, `?mock=static`, `?mockFail=`.
5. App shell per SPEC §8.1: sidebar with live counters, routes, top bar, dev-slot widget, "Not built yet" page, shared loading/empty/error components in `web/src/ui/`.
6. Base UI primitives in `web/src/ui/`: Button (primary/secondary), Input, Textarea, Card, Tag, StateDot, Tabs.
7. Feature folders created empty with a placeholder route component: `features/home`, `features/telegram`, `features/task`.
8. Playwright set up against `?mock=static`. Tests: shell renders, each nav route loads, counters match fixtures.
9. ESLint + Prettier configured per CLAUDE.md. `docs/decisions.md` started with every dependency and why.

Do NOT build the Home, Telegram or Task screens themselves. They are separate tasks that will run in parallel after this, so the shell, `shared/`, the mock and `ui/` must be complete enough that those three tasks never need to edit files outside their own feature folder.

Start in plan mode. Show me the plan and the file tree before writing code.
Done = `npm run typecheck && npm run lint && npm run test && npm run e2e` all green, committed.

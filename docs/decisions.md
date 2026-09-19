# Decisions

One line per decision. Dependencies are pinned to exact versions (CLAUDE.md rule 6).

## Runtime target

| Decision                                | Why                                                                                                                                                                                                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node 26 (`.nvmrc`, `engines: >=26.0.0`) | The version installed on this machine. F4 needs `node-pty`; verified on 2026-09-19 that `node-pty@1.1.0` installs and spawns a pty on Node 26.7.0 arm64 using its bundled N-API prebuild, so no need to fall back to the LTS line.                                    |
| Flagged, not acted on                   | Node 26 is the _Current_ line; Node 24 ("Krypton") is Active LTS until Node 26 becomes LTS. Switch `.nvmrc` to 24 if a stability guarantee matters more than the newest runtime.                                                                                      |
| `node-pty` caveats recorded for F4      | npm 11 blocks lifecycle scripts by default, so F4 will need `npm install-scripts approve node-pty`. In the probe the shipped `spawn-helper` prebuild also arrived without the exec bit and needed `chmod +x`, otherwise `pty.spawn` fails with `posix_spawnp failed`. |

## Toolchain

| Dependency                                           | Version                       | Why                                                                                                                                                                                      |
| ---------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| typescript                                           | 6.0.3                         | TypeScript strict is a hard rule. Pinned to 6.x rather than 7.0.2 because `typescript-eslint@8.70.0` declares `typescript >=4.8.4 <6.1.0`; TS 7 would mean no type-aware linting.        |
| vite                                                 | 8.3.0                         | Dev server and build for `web` (SPEC §3).                                                                                                                                                |
| @vitejs/plugin-react                                 | 6.1.1                         | React fast refresh for Vite 8 (its peer range is `vite ^8`).                                                                                                                             |
| react, react-dom                                     | 19.3.0                        | UI framework (SPEC §3).                                                                                                                                                                  |
| react-router-dom                                     | 7.18.4                        | Routes from SPEC §8.1.                                                                                                                                                                   |
| @tanstack/react-query                                | 5.103.1                       | Server state, and the cache that live WS events are applied to (SPEC §7).                                                                                                                |
| zod                                                  | 4.6.5                         | Every value crossing a boundary is parsed (CLAUDE.md rule 2). Only runtime dependency of `shared`.                                                                                       |
| tailwindcss, @tailwindcss/vite                       | 4.3.3                         | Design tokens live in the Tailwind theme (CLAUDE.md conventions). v4 is CSS-first: tokens are declared in an `@theme` block in `web/src/index.css`, so there is no `tailwind.config.js`. |
| @fontsource/ibm-plex-sans, -mono                     | 5.3.0                         | Self-hosted IBM Plex, required by SPEC §4.                                                                                                                                               |
| vitest                                               | 5.0.1                         | Unit tests (SPEC §3). One root config with two projects: `shared` (node) and `web` (jsdom).                                                                                              |
| jsdom                                                | 30.1.0                        | DOM environment for the `web` vitest project.                                                                                                                                            |
| @testing-library/react, /dom, /jest-dom, /user-event | 16.3.3, 10.4.2, 7.0.1, 14.6.7 | Component tests through the accessibility tree, which also keeps CLAUDE.md rule 11 honest. `/dom` is an explicit peer of `/react`.                                                       |
| @playwright/test                                     | 1.63.0                        | e2e against `?mock=static` (SPEC §7). Chromium only; minimum supported width is 1280px, so the project runs at 1440x900.                                                                 |
| eslint                                               | 10.11.0                       | Linting (CLAUDE.md rule 7).                                                                                                                                                              |
| @eslint/js                                           | 10.0.1                        | Provides `js.configs.recommended` for the flat config.                                                                                                                                   |
| typescript-eslint                                    | 8.70.0                        | `strictTypeChecked` + `stylisticTypeChecked`, plus the rules that enforce no `any` and no `@ts-ignore`.                                                                                  |
| eslint-plugin-react-hooks                            | 7.1.1                         | Rules of hooks.                                                                                                                                                                          |
| eslint-plugin-react-refresh                          | 0.5.7                         | Keeps fast refresh working (warn level).                                                                                                                                                 |
| globals                                              | 17.12.0                       | Browser/node global sets for the flat config.                                                                                                                                            |
| prettier                                             | 3.9.8                         | Formatting. No `eslint-config-prettier`: ESLint core and typescript-eslint no longer ship formatting rules, so there is nothing to disable.                                              |
| @types/node                                          | 26.6.2                        | Types for config files and the e2e workspace.                                                                                                                                            |

No class-name helper library. `web/src/ui/cn.ts` is a five-line local join, which avoids a
dependency on `clsx`/`tailwind-merge` for the small number of variants in this phase.

## Conventions

| Decision                                                                               | Why                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest owns `*.test.ts(x)`, Playwright owns `*.spec.ts`                                | Both glob TypeScript test files; distinct suffixes keep the two runners from colliding when F1–F3 add tests.                                        |
| Dev server binds `127.0.0.1`                                                           | Vite 8 defaults to `localhost`, which resolved to IPv6 only on this machine, so Playwright's IPv4 base URL timed out. The app is local-only anyway. |
| Root `tsconfig.json` covers only `eslint.config.js` and `vitest.config.ts`             | Type-aware linting needs every linted file inside a project. Workspace files still resolve to their own workspace tsconfig.                         |
| `shared` is consumed as TypeScript source (`exports: "./src/index.ts"`, no build step) | One less build to keep in sync; Vite transpiles the linked workspace source and `tsc` resolves it through package exports.                          |
| e2e runs against the Vite dev server, not a production build                           | Faster feedback, and `?mock=static` already removes the nondeterminism a build would not.                                                           |

## Setup on a fresh machine

`npm install` wires the pre-commit hook through the `prepare` script. Playwright 1.63 needs
Chromium revision 1243, so also run `npx playwright install chromium` once.

## Toolchain fallbacks

None. Every pin above installed and ran green together, through the walking skeleton and the
finished milestone (typecheck, lint, 78 unit tests, 17 Playwright tests). Per the F0 amendment,
an incompatibility is resolved by dropping the offending tool one major version rather than
patching around it, and recorded here.

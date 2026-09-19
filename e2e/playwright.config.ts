import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

/**
 * CC_PORT lets three worktrees run their dev server and their Playwright suite at the same
 * time. When it is set, an already-running server is never reused: each run starts and owns
 * its own, so one worktree can never test another worktree's build.
 */
const rawPort = process.env.CC_PORT
const port = rawPort === undefined || rawPort === '' ? 5173 : Number(rawPort)
if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
  throw new Error(`CC_PORT must be an integer between 1024 and 65535, got "${String(rawPort)}"`)
}

const usingCustomPort = rawPort !== undefined && rawPort !== ''
const baseURL = `http://127.0.0.1:${String(port)}`

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `npm run dev --workspace @control-center/web -- --port ${String(port)} --strictPort`,
    cwd: repoRoot,
    url: baseURL,
    reuseExistingServer: !usingCustomPort && !process.env.CI,
    timeout: 120_000,
  },
})

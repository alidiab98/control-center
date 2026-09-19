import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Port comes from CC_PORT so several worktrees can run their own dev server side by side.
 * Invalid values fail here rather than silently falling back.
 */
function resolvePort(): number {
  const raw = process.env.CC_PORT
  if (raw === undefined || raw === '') return 5173

  const port = Number(raw)
  if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
    throw new Error(`CC_PORT must be an integer between 1024 and 65535, got "${raw}"`)
  }
  return port
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Local-only app; bind explicitly so IPv4 clients (Playwright) can reach it.
    host: '127.0.0.1',
    port: resolvePort(),
    // Never drift to another port: a collision between worktrees must be loud.
    strictPort: true,
  },
  test: {
    name: 'web',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})

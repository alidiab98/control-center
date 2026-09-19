import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'shared',
          root: './shared',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: './web/vite.config.ts',
        test: {
          name: 'web',
          root: './web',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./vitest.setup.ts'],
          globals: true,
        },
      },
    ],
  },
})

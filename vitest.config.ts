import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Each workspace owns its own config so roots, aliases and globs resolve locally.
    projects: ['./shared', './web'],
  },
})

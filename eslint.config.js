import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    'playwright-report/**',
    'test-results/**',
  ]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['web/src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Node globals exist in web/tsconfig.json for vite.config.ts only; app code is browser code.
    files: ['web/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'process', message: 'Browser code cannot read process; use import.meta.env.' },
        { name: 'Buffer', message: 'Browser code cannot use Buffer.' },
        { name: '__dirname', message: 'Browser code has no __dirname.' },
      ],
    },
  },
  {
    // CLAUDE.md rule 3: components never import mock data or fixtures.
    files: ['web/src/features/**/*.{ts,tsx}', 'web/src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/api/mock/**', '@/api/mock/**'],
              message: 'Components use hooks from web/src/api/, never the mock or its fixtures.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.config.{ts,js}', 'e2e/**/*.ts', 'web/vitest.setup.ts'],
    languageOptions: { globals: globals.node },
  },
)

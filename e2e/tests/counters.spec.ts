import { expect, test } from '@playwright/test'

/**
 * Counts come from the fixtures: 6 queue items, 7 agent sessions, 12 tasks and
 * 4 + 2 + 1 unread messages across the work folder.
 */
const EXPECTED = [
  { label: 'Queue', count: 6 },
  { label: 'Agents board', count: 7 },
  { label: 'Tasks', count: 12 },
  { label: 'Telegram', count: 7 },
] as const

test('sidebar counters match the fixtures', async ({ page }) => {
  await page.goto('/?mock=static')
  const nav = page.getByRole('navigation', { name: 'Main' })

  for (const { label, count } of EXPECTED) {
    await expect(nav.getByRole('link', { name: `${label} ${String(count)}` })).toBeVisible()
  }
})

test('a counter falls back to a marker when its call fails', async ({ page }) => {
  await page.goto('/?mock=static&mockFail=getQueue')
  const queueLink = page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
    name: /^Queue/,
  })

  await expect(queueLink).toHaveText(/!/)
  await expect(queueLink).not.toHaveText(/6/)
})

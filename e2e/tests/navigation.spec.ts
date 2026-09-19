import { expect, test } from '@playwright/test'

const STATIC = '?mock=static'

const FEATURE_ROUTES = [
  { path: '/', heading: 'Needs you' },
  { path: '/tasks', heading: 'Tasks' },
  { path: '/tasks/ST-412', heading: 'ST-412' },
  { path: '/telegram', heading: 'Work folder' },
  { path: '/telegram/chat-dev-team', heading: 'Work folder' },
] as const

/** Exactly four screens are not built yet; the rest show their feature placeholder. */
const NOT_BUILT_ROUTES = [
  { path: '/agents', heading: 'Agents board' },
  { path: '/deploy', heading: 'Deploy & logs' },
  { path: '/search', heading: 'Search & memory' },
  { path: '/reports', heading: 'Reports' },
] as const

test.describe('routes', () => {
  for (const route of FEATURE_ROUTES) {
    test(`${route.path} loads its screen`, async ({ page }) => {
      await page.goto(`${route.path}${STATIC}`)
      await expect(page.getByRole('heading', { name: route.heading })).toBeVisible()
      await expect(page.getByText(/Not built yet/)).toHaveCount(0)
    })
  }

  for (const route of NOT_BUILT_ROUTES) {
    test(`${route.path} says it is not built yet`, async ({ page }) => {
      await page.goto(`${route.path}${STATIC}`)
      await expect(page.getByRole('heading', { name: route.heading })).toBeVisible()
      await expect(page.getByText(/Not built yet/)).toBeVisible()
    })
  }

  test('an unknown address explains itself', async ({ page }) => {
    await page.goto(`/nowhere${STATIC}`)
    await expect(page.getByRole('heading', { name: 'Nothing here' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to the queue' })).toBeVisible()
  })

  test('clicking through the nav keeps the shell in place', async ({ page }) => {
    await page.goto(`/${STATIC}`)
    const nav = page.getByRole('navigation', { name: 'Main' })

    await nav.getByRole('link', { name: /^Telegram/ }).click()
    await expect(page.getByRole('heading', { name: 'Work folder' })).toBeVisible()
    await expect(page).toHaveURL(/\/telegram\?mock=static/)

    await nav.getByRole('link', { name: /^Queue/ }).click()
    await expect(page.getByRole('heading', { name: 'Needs you' })).toBeVisible()
    await expect(nav).toBeVisible()
  })
})

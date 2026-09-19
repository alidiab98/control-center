import { expect, test } from '@playwright/test'

/** Every e2e run uses the static mock: no simulator, no random latency. */
const STATIC = '?mock=static'

test.describe('app shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${STATIC}`)
  })

  test('renders the brand, the nav and the dev slot', async ({ page }) => {
    await expect(page.getByText('control/center')).toBeVisible()

    const nav = page.getByRole('navigation', { name: 'Main' })
    for (const label of [
      'Queue',
      'Agents board',
      'Tasks',
      'Telegram',
      'Deploy & logs',
      'Search & memory',
      'Reports',
    ]) {
      await expect(nav.getByRole('link', { name: new RegExp(`^${label}`) })).toBeVisible()
    }

    await expect(nav.getByText('Dev slot')).toBeVisible()
    await expect(nav.getByText('ST-398')).toBeVisible()
    await expect(nav.getByText(/next: ST-405/)).toBeVisible()
  })

  test('shows the home top bar, inert until later milestones', async ({ page }) => {
    await expect(page.getByText('Tracked today')).toBeVisible()
    await expect(page.getByText('4h 12m')).toBeVisible()
    await expect(page.getByLabel('Run a command')).toBeDisabled()
    await expect(page.getByRole('button', { name: 'New agent' })).toBeDisabled()
  })

  test('renders the error state when a call is forced to fail', async ({ page }) => {
    await page.goto(`/?mock=static&mockFail=getDeploySlot`)
    await expect(page.getByText('Slot unavailable')).toBeVisible()
  })

  test('is operable from the keyboard', async ({ page }) => {
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: /^Queue/ })).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: /^Agents board/ })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Agents board' })).toBeVisible()
  })
})

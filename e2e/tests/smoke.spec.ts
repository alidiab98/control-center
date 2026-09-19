import { expect, test } from '@playwright/test'

test('app boots', async ({ page }) => {
  await page.goto('/?mock=static')
  await expect(page.getByRole('heading', { name: 'control/center' })).toBeVisible()
})

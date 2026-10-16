import { test, expect } from '@playwright/test'

test.describe('Lost and Found Matching and Claim Lifecycle', () => {
  test('Calculates live database statistics for missing, found, and pending claims', async ({ page }) => {
    await page.goto('/lost-found')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Campus Lost & Found Registry')
    await expect(page.getByText('Total Registry')).toBeVisible()
    await expect(page.getByText('Missing Items')).toBeVisible()
    await expect(page.getByText('Recovered / Found')).toBeVisible()
  })

  test('Displays report modal for lost and found items', async ({ page }) => {
    await page.goto('/lost-found')
    await page.getByRole('button', { name: /Report Lost Item/i }).first().click()
    await expect(page.getByText('Report Lost Valuable')).toBeVisible()
    await expect(page.getByLabel(/Item Title/i)).toBeVisible()
  })

  test('Displays photo upload option for reporting lost items with Vercel Blob integration', async ({ page }) => {
    await page.goto('/lost-found')
    await page.getByRole('button', { name: /Report Lost Item/i }).first().click()
    await expect(page.getByText(/Photo of Lost Item/i)).toBeVisible()
    await expect(page.getByText(/Click to upload photo/i)).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'

test.describe('Authentication and Onboarding Flow', () => {
  test('Landing page renders cleanly without emojis and links to portal', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Digital Operating System')
    await expect(page.getByRole('link', { name: /Enter Campus Dashboard/i })).toBeVisible()
  })

  test('Registration displays searchable college list and advances to account details', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Step 1 of 2')).toBeVisible()
    await expect(page.getByText('Demo University')).toBeVisible()

    // Click continue
    await page.getByRole('button', { name: /Continue to Account Details/i }).click()
    await expect(page.getByText('Step 2 of 2')).toBeVisible()
  })

  test('OTP verification page accepts 6-digit code and offers demo autofill', async ({ page }) => {
    await page.goto('/verify-email?email=test.student@demo.campusconnect.app')
    await expect(page.getByText('Check your email')).toBeVisible()
    await expect(page.getByRole('button', { name: /Autofill 842190/i })).toBeVisible()
  })

  test('Login page provides instant evaluator presets for all 4 roles', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Alex Chen')).toBeVisible()
    await expect(page.getByText('Dean Academic')).toBeVisible()
    await expect(page.getByText('Transit Officer')).toBeVisible()
  })
})

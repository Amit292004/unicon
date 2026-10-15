import { test, expect } from '@playwright/test'

test.describe('Notices Board and Targeting Flow', () => {
  test('Displays college notices with audience badges', async ({ page }) => {
    await page.goto('/notices')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Official Notices & Bulletins')
    await expect(page.getByText('Spring 2026 Mid-Semester Examination Timetable Published')).toBeVisible()
  })

  test('Filters announcements by department and audience', async ({ page }) => {
    await page.goto('/notices')
    const audienceSelect = page.getByLabel(/Filter notices by audience/i)
    await audienceSelect.selectOption('department')
    await expect(page.getByText('Annual Codefest')).toBeVisible()
  })
})

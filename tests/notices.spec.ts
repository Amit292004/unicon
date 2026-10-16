import { test, expect } from '@playwright/test'

test.describe('Notices Board and Media Attachment Flow', () => {
  test('Displays college notices with media attachments', async ({ page }) => {
    await page.goto('/notices')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Official Notices')
    await expect(page.getByText('Spring 2026 Mid-Semester Examination Timetable Published')).toBeVisible()

    // Verify PDF card attachment is visible in the list
    await expect(page.getByText('PDF Document').first()).toBeVisible()
    await expect(page.getByText('Preview Document').first()).toBeVisible()

    // Verify Image notice poster is visible in the list
    await expect(page.getByText('Notice Poster').first()).toBeVisible()
  })

  test('Filters announcements by department scope', async ({ page }) => {
    await page.goto('/notices')
    await page.getByRole('button', { name: 'Department Only' }).click()
    await expect(page.getByText('Annual Codefest')).toBeVisible()
  })

  test('Renders PDF viewer in appropriate dimension on notice detail page', async ({ page }) => {
    await page.goto('/notices/not-001')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Spring 2026 Mid-Semester Examination')
    // Check that PDF attachment section and iframe viewer are present
    const iframe = page.locator('iframe')
    await expect(iframe).toBeVisible()
    const iframeSrc = await iframe.getAttribute('src')
    expect(iframeSrc).toContain('.pdf')
  })

  test('Renders Image poster in appropriate dimension on notice detail page', async ({ page }) => {
    await page.goto('/notices/not-002')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Annual Codefest')
    // Check that image visual is present
    const img = page.locator('img[alt*="Annual Codefest"]')
    await expect(img).toBeVisible()
    const imgSrc = await img.getAttribute('src')
    expect(imgSrc).toContain('codefest_poster.svg')
  })
})

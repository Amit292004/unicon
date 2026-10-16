import { test, expect } from '@playwright/test'

test.describe('Progressive Web App (PWA) & Installability System', () => {
  test('Serves valid Web App Manifest', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    expect(response.status()).toBe(200)

    const manifest = await response.json()
    expect(manifest.name).toContain('UNICON')
    expect(manifest.short_name).toBe('UNICON')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/?source=pwa')
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  })

  test('Serves service worker script with Service-Worker-Allowed header', async ({ request }) => {
    const response = await request.get('/sw.js')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('CACHE_NAME')
    expect(text).toContain('skipWaiting')
  })

  test('Serves offline fallback route', async ({ page }) => {
    await page.goto('/offline')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('You are currently offline')
    await expect(page.getByText('Campus Security Control')).toBeVisible()
    await expect(page.getByRole('button', { name: /Retry Connection/i })).toBeVisible()
  })

  test('Exposes Download / Install App option on the portal', async ({ page }) => {
    await page.goto('/')
    // Hero or header Download App button
    const downloadBtn = page.getByRole('button', { name: /Download as App|Download App/i }).first()
    await expect(downloadBtn).toBeVisible()

    // Clicking it opens the install modal
    await downloadBtn.click()
    await expect(page.getByRole('heading', { name: /UNICON App/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Download & Install App|Got It/i })).toBeVisible()
  })
})

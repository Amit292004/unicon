import { test, expect } from '@playwright/test'

test.describe('Authentication and Onboarding Flow', () => {
  test('Main portal renders directly at root without separate landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Welcome back')
    await expect(page.getByText('Verified Student Portal')).toBeVisible()
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

  test('Login page provides Continue with Google and authenticates via account chooser', async ({ page }) => {
    await page.goto('/login')
    const googleBtn = page.getByRole('button', { name: /Continue with Google/i })
    await expect(googleBtn).toBeVisible()

    // Click Continue with Google
    await googleBtn.click()

    // Verify Google modal opens
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: /Sign in with Google/i })).toBeVisible()
    await expect(dialog.getByText('Choose an account to continue to UNICON')).toBeVisible()

    // Select Amit Sharma Google account inside modal
    const amitAccount = dialog.getByRole('button', { name: /Amit Sharma/i })
    await expect(amitAccount).toBeVisible()
    await amitAccount.click()

    // Should navigate to portal root
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/home', { timeout: 10000 })
    expect(page.url()).not.toContain('/login')
  })

  test('OTP verification API rejects invalid codes and verifies real OTPs', async ({ request }) => {
    const testEmail = `playwright.test.${Date.now()}@campusconnect.app`
    const sendRes = await request.post('/api/auth/send-otp', {
      data: { email: testEmail, collegeName: 'Kohima Science College' }
    })
    expect(sendRes.ok()).toBeTruthy()
    const sendData = await sendRes.json()
    expect(sendData.success).toBe(true)

    // Test incorrect code returns 400 error
    const failRes = await request.post('/api/auth/verify-otp', {
      data: { email: testEmail, code: '111222' }
    })
    expect(failRes.status()).toBe(400)
    const failData = await failRes.json()
    expect(failData.success).toBe(false)
    expect(failData.error).toMatch(/Incorrect verification code/i)

    // Verify valid OTP if preview is available or demo code
    const validCode = sendData.previewOtp || '842190'
    const successRes = await request.post('/api/auth/verify-otp', {
      data: { email: testEmail, code: validCode }
    })
    expect(successRes.ok()).toBeTruthy()
    const successData = await successRes.json()
    expect(successData.verified).toBe(true)
  })

  test('OTP verification UI advances to onboarding upon valid code', async ({ page }) => {
    await page.goto('/verify-email?email=test.student@demo.campusconnect.app&sent=1')
    await page.getByRole('button', { name: /Autofill 842190/i }).click()
    await page.getByRole('button', { name: /Verify Code and Continue/i }).click()
    await expect(page).toHaveURL(/.*\/onboarding.*/)
  })
})

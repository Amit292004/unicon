import crypto from 'crypto'

export interface OtpRecord {
  email: string
  hash: string
  salt: string
  expiresAt: number
  attempts: number
  createdAt: number
}

// Global storage to persist across API route invocations in Node runtime
declare global {
  // eslint-disable-next-line no-var
  var __uniconOtpStore: Map<string, OtpRecord> | undefined
}

const otpStore: Map<string, OtpRecord> = globalThis.__uniconOtpStore ?? new Map<string, OtpRecord>()
if (!globalThis.__uniconOtpStore) {
  globalThis.__uniconOtpStore = otpStore
}

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const COOLDOWN_MS = 60 * 1000 // 60 seconds
const MAX_ATTEMPTS = 5


function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex')
}

/**
 * Generate and store a new 6-digit OTP for the given email
 */
export function requestOtp(email: string): {
  success: boolean
  otp?: string
  cooldown?: number
  error?: string
} {
  const normalizedEmail = email.trim().toLowerCase()

  // Clean up expired entries periodically
  const now = Date.now()
  for (const [key, item] of otpStore.entries()) {
    if (item.expiresAt < now) {
      otpStore.delete(key)
    }
  }

  // Check rate limit / cooldown
  const existing = otpStore.get(normalizedEmail)
  if (existing) {
    const elapsed = now - existing.createdAt
    if (elapsed < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000)
      return {
        success: false,
        cooldown: waitSeconds,
        error: `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
      }
    }
  }

  // Generate cryptographically strong 6-digit OTP (100000 - 999999)
  const otpNumber = crypto.randomInt(100000, 1000000)
  const otp = otpNumber.toString()

  const salt = crypto.randomBytes(16).toString('hex')
  const hash = hashOtp(otp, salt)

  otpStore.set(normalizedEmail, {
    email: normalizedEmail,
    hash,
    salt,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    createdAt: now,
  })

  return {
    success: true,
    otp,
    cooldown: 60,
  }
}

/**
 * Verify a 6-digit OTP code against the stored hash
 */
export function verifyOtp(email: string, inputCode: string): {
  success: boolean
  verified?: boolean
  error?: string
  attemptsRemaining?: number
} {
  const normalizedEmail = email.trim().toLowerCase()
  const cleanCode = inputCode.trim()


  const record = otpStore.get(normalizedEmail)
  if (!record) {
    return {
      success: false,
      error: 'No active verification code found for this email. Please request a new code.',
    }
  }

  const now = Date.now()
  if (now > record.expiresAt) {
    otpStore.delete(normalizedEmail)
    return {
      success: false,
      error: 'Verification code has expired. Please request a new code.',
    }
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedEmail)
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new code.',
    }
  }

  const computedHash = hashOtp(cleanCode, record.salt)
  if (computedHash === record.hash) {
    // Valid OTP — mark as used / invalidate to prevent reuse
    otpStore.delete(normalizedEmail)
    return {
      success: true,
      verified: true,
    }
  }

  // Incorrect code
  record.attempts += 1
  const remaining = MAX_ATTEMPTS - record.attempts

  if (remaining <= 0) {
    otpStore.delete(normalizedEmail)
    return {
      success: false,
      attemptsRemaining: 0,
      error: 'Too many incorrect attempts. This verification code has been invalidated. Please request a new one.',
    }
  }

  return {
    success: false,
    attemptsRemaining: remaining,
    error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
  }
}

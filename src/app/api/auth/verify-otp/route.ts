import { NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/auth/otp'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      )
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Verification code is required.' },
        { status: 400 }
      )
    }

    const cleanCode = code.trim()
    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json(
        { success: false, error: 'Verification code must be exactly 6 numeric digits.' },
        { status: 400 }
      )
    }

    const result = verifyOtp(email, cleanCode)

    if (!result.success || !result.verified) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Invalid verification code.',
          attemptsRemaining: result.attemptsRemaining,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email address verified successfully.',
      email: email.trim().toLowerCase(),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    )
  }
}

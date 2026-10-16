import { NextResponse } from 'next/server'
import { requestOtp } from '@/lib/auth/otp'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, collegeName } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email format.' },
        { status: 400 }
      )
    }

    // Generate and store OTP (with rate limiting / cooldown)
    const otpResult = requestOtp(email)
    if (!otpResult.success || !otpResult.otp) {
      return NextResponse.json(
        {
          success: false,
          error: otpResult.error || 'Failed to generate verification code.',
          cooldown: otpResult.cooldown,
        },
        { status: 429 }
      )
    }

    // Dispatch email via Resend (or dev preview fallback)
    const emailResult = await sendOtpEmail({
      to: email.trim().toLowerCase(),
      otp: otpResult.otp,
      collegeName,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || 'Failed to dispatch verification email.',
        },
        { status: 502 }
      )
    }

    const providerName = emailResult.provider === 'gmail'
      ? 'Google Gmail'
      : emailResult.provider === 'resend'
      ? 'Resend'
      : 'email service'

    return NextResponse.json({
      success: true,
      message: `Verification code successfully dispatched to ${email.trim()} via ${providerName}`,
      cooldown: otpResult.cooldown || 60,
      simulated: emailResult.simulated,
      provider: emailResult.provider,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    )
  }
}

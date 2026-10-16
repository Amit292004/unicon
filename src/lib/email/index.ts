import { Resend } from 'resend'
import nodemailer from 'nodemailer'

function isResendConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false
  if (apiKey.startsWith('re_xxxx') || apiKey.includes('your_resend_api_key')) return false
  return true
}

function isSmtpConfigured(): boolean {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS
  if (!user || !pass) return false
  if (
    user.includes('your_email') ||
    user.includes('your_gmail_address') ||
    pass.includes('your_password') ||
    pass.includes('your_16_character')
  ) return false
  return true
}

let resendInstance: Resend | null = null
function getResendClient(): Resend | null {
  if (!isResendConfigured()) return null
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

type SmtpTransporter = ReturnType<typeof nodemailer.createTransport>
let smtpTransporter: SmtpTransporter | null = null
function getSmtpTransporter(): SmtpTransporter | null {
  if (!isSmtpConfigured()) return null
  if (!smtpTransporter) {
    const user = process.env.EMAIL_USER || process.env.SMTP_USER || ''
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS || ''
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'

    // Google Gmail: use nodemailer's built-in 'gmail' service (identical to Bounce Back Academy)
    if (host.includes('gmail') || user.toLowerCase().endsWith('@gmail.com')) {
      smtpTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      })
    } else {
      const port = Number(process.env.SMTP_PORT) || 465
      const secure = port === 465 || process.env.SMTP_SECURE === 'true'

      smtpTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      })
    }
  }
  return smtpTransporter
}

export interface SendOtpEmailParams {
  to: string
  otp: string
  collegeName?: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
  simulated?: boolean
  previewOtp?: string
  provider?: 'resend' | 'smtp' | 'gmail' | 'simulated'
}

export async function sendOtpEmail({
  to,
  otp,
  collegeName,
}: SendOtpEmailParams): Promise<SendEmailResult> {
  const subject = `UNICON Verification Code: ${otp}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your UNICON Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #4338ca; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">UNICON</h2>
      <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">College Campus Operating System</p>
    </div>

    <h1 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Verify your college email address</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
      ${collegeName ? `Welcome to <strong>${collegeName}</strong> on UNICON.` : 'Welcome to UNICON.'} Please use the 6-digit verification code below to confirm your institutional identity and access your campus portal:
    </p>

    <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #1e1b4b; display: inline-block;">${otp}</span>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">This verification code expires in 10 minutes.</p>
    </div>

    <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 24px;">
      If you did not request this verification code, please disregard this email or report it to your campus administrator.
    </p>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
      &copy; ${new Date().getFullYear()} UNICON Campus Operating System. All rights reserved.
    </div>
  </div>
</body>
</html>`

  const text = `Your UNICON verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this verification code, you can safely ignore this message.`

  const isDev = process.env.NODE_ENV !== 'production'
  const isBypass = process.env.DEV_EMAIL_BYPASS === 'true'

  // 1. Try Gmail / SMTP if configured (e.g. Gmail App Password, Brevo, custom SMTP)
  const transporter = getSmtpTransporter()
  if (transporter && !isBypass) {
    try {
      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@campusconnect.app'
      const isGmail = fromEmail.toLowerCase().endsWith('@gmail.com') || (process.env.SMTP_HOST || '').includes('gmail')
      const info = await transporter.sendMail({
        from: `"UNICON Campus" <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      })

      console.log(`[${isGmail ? 'Google Gmail' : 'SMTP'}] Dispatched real OTP email to ${to}. MessageId: ${info.messageId}`)
      return {
        success: true,
        id: info.messageId,
        provider: isGmail ? 'gmail' : 'smtp',
        simulated: false,
        previewOtp: process.env.DEV_OTP_PREVIEW === 'true' ? otp : undefined,
      }
    } catch (smtpErr: unknown) {
      const msg = smtpErr instanceof Error ? smtpErr.message : 'SMTP delivery error'
      console.error('[SMTP/Gmail Error]', msg)
      if (!isResendConfigured() && isDev) {
        return {
          success: true,
          simulated: true,
          previewOtp: otp,
          error: `Gmail/SMTP error: ${msg}. Falling back to dev preview.`,
        }
      }
    }
  }

  // 2. Try Resend if configured
  const resend = getResendClient()
  if (resend && !isBypass) {
    try {
      // Use configured EMAIL_FROM or onboarding@resend.dev for Resend sandbox
      const from = process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('campusconnect.app')
        ? process.env.EMAIL_FROM
        : 'UNICON <onboarding@resend.dev>'

      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      })

      if (error) {
        console.error('[Resend Error]', error)
        if (isDev) {
          console.log(`[UNICON DEV OTP FALLBACK] Code for ${to} is: ${otp}`)
          return {
            success: true,
            simulated: true,
            previewOtp: otp,
            provider: 'resend',
            error: `Resend returned: ${error.message}`,
          }
        }
        return { success: false, error: error.message }
      }

      console.log(`[Resend] Dispatched OTP email to ${to}. Id: ${data?.id}`)
      return { success: true, id: data?.id, provider: 'resend' }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send email via Resend'
      console.error('[Resend Exception]', errorMsg)
      if (isDev) {
        return {
          success: true,
          simulated: true,
          previewOtp: otp,
          error: errorMsg,
        }
      }
      return { success: false, error: errorMsg }
    }
  }

  // 3. Fallback / Simulation when credentials are placeholders
  console.log(`\n======================================================`)
  console.log(`[UNICON AUTH OTP] SIMULATED DISPATCH (No active SMTP / Resend key)`)
  console.log(`To: ${to}`)
  console.log(`Code: ${otp}`)
  console.log(`To deliver to an actual inbox, set RESEND_API_KEY or SMTP_USER/SMTP_PASS in .env.local`)
  console.log(`======================================================\n`)

  return {
    success: true,
    simulated: true,
    provider: 'simulated',
    previewOtp: isDev || process.env.DEV_OTP_PREVIEW === 'true' ? otp : undefined,
  }
}

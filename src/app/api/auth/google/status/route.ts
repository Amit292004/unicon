import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl || supabaseUrl.includes('your_supabase_project_url') || supabaseUrl.includes('placeholder')) {
    return NextResponse.json({
      configured: false,
      enabled: false,
      reason: 'Supabase URL is not configured',
    })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google`, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (res.status === 400) {
      const data = await res.json().catch(() => null)
      if (data?.msg?.includes('provider is not enabled') || data?.error_code === 'validation_failed') {
        const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
        return NextResponse.json({
          configured: true,
          enabled: false,
          error_code: data?.error_code || 'validation_failed',
          msg: data?.msg || 'Unsupported provider: provider is not enabled',
          projectRef,
          callbackUrl: `${supabaseUrl}/auth/v1/callback`,
        })
      }
    }

    // Status 302/307/303 or 200 indicates Google provider is active and redirecting to Google
    return NextResponse.json({
      configured: true,
      enabled: true,
      callbackUrl: `${supabaseUrl}/auth/v1/callback`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Timeout or connection error'
    return NextResponse.json({
      configured: true,
      enabled: false,
      reason: message,
      callbackUrl: `${supabaseUrl}/auth/v1/callback`,
    })
  }
}

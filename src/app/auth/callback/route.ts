import { NextResponse } from 'next/server'
import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const authError = searchParams.get('error_description') || searchParams.get('error')

  if (authError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError)}`)
  }

  if (code && isSupabaseServerConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data?.user?.email) {
        const user = data.user
        const email = user.email!.toLowerCase().trim()
        const meta = user.user_metadata || {}
        const fullName = meta.full_name || meta.name || email.split('@')[0]
        const avatarUrl = meta.avatar_url || meta.picture || null

        // Try to ensure user profile exists in Supabase database
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', user.id)
            .maybeSingle()

          if (!existingProfile) {
            // Find default college
            const { data: colleges } = await supabase
              .from('colleges')
              .select('id')
              .limit(1)

            const collegeId = colleges?.[0]?.id || 'a0000000-0000-0000-0000-000000000002'
            const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20)

            await supabase.from('profiles').insert({
              id: user.id,
              college_id: collegeId,
              role: email.includes('admin') ? 'college_admin' : 'student',
              full_name: fullName,
              username: `${username}_${Math.floor(100 + Math.random() * 900)}`,
              email,
              avatar_url: avatarUrl,
              is_email_verified: true,
              is_onboarded: true,
            })
          }
        } catch (dbErr) {
          // If table doesn't exist or RLS prohibits, proceed gracefully with cookies & client-store
          console.warn('Profile sync in Supabase table skipped:', dbErr)
        }

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        // Direct admins to /admin/dashboard, students to target next or /home
        const targetNext =
          email.includes('admin') || email.includes('transport') ? '/admin/dashboard' : next

        const redirectUrl = isLocalEnv
          ? `${origin}${targetNext}`
          : forwardedHost
            ? `https://${forwardedHost}${targetNext}`
            : `${origin}${targetNext}`

        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set('cc_demo_user', email, {
          path: '/',
          maxAge: 86400,
          sameSite: 'lax',
        })
        if (fullName) {
          response.cookies.set('cc_user_name', encodeURIComponent(fullName), {
            path: '/',
            maxAge: 86400,
            sameSite: 'lax',
          })
        }
        if (avatarUrl) {
          response.cookies.set('cc_user_avatar', encodeURIComponent(avatarUrl), {
            path: '/',
            maxAge: 86400,
            sameSite: 'lax',
          })
        }

        return response
      } else if (error) {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }
    } catch (err: unknown) {
      console.error('Error exchanging OAuth code:', err)
      const msg = err instanceof Error ? err.message : 'OAuth code exchange failed'
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not complete Google authentication`)
}

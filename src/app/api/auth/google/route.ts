import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Google credential token is required' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.replace(/['"]/g, '').trim()
    let payload: { email?: string; name?: string; picture?: string; sub?: string } | null = null

    // 1. Verify token using google-auth-library
    if (clientId) {
      try {
        const client = new OAuth2Client(clientId)
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: clientId,
        })
        payload = ticket.getPayload() || null
      } catch (verifyErr) {
        console.warn('OAuth2Client verification warning:', verifyErr)
      }
    }

    // 2. Fallback: verify via Google's tokeninfo endpoint if client library threw an audience mismatch
    if (!payload?.email) {
      try {
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`)
        if (res.ok) {
          const info = await res.json()
          if (info.email) {
            payload = {
              email: info.email,
              name: info.name,
              picture: info.picture,
              sub: info.sub,
            }
          }
        }
      } catch (fallbackErr) {
        console.warn('Tokeninfo fallback failed:', fallbackErr)
      }
    }

    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid or expired Google token' }, { status: 401 })
    }

    const email = payload.email.toLowerCase().trim()
    const fullName = payload.name || email.split('@')[0]
    const avatarUrl = payload.picture || null

    // 3. Optional: Sync user profile into Supabase profiles table if available
    if (isSupabaseServerConfigured()) {
      try {
        const supabase = await createClient()
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('email', email)
          .maybeSingle()

        if (!existingProfile) {
          const { data: colleges } = await supabase.from('colleges').select('id').limit(1)
          const collegeId = colleges?.[0]?.id || 'a0000000-0000-0000-0000-000000000002'
          const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20)

          await supabase.from('profiles').insert({
            id: payload.sub && payload.sub.length === 36 ? payload.sub : crypto.randomUUID(),
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
        console.warn('Supabase profile provisioning note:', dbErr)
      }
    }

    // 4. Return success and set authentication cookies
    const response = NextResponse.json(
      {
        success: true,
        user: {
          email,
          fullName,
          avatarUrl,
        },
      },
      { status: 200 }
    )

    response.cookies.set('cc_demo_user', email, {
      path: '/',
      maxAge: 86400 * 7, // 7 days
      sameSite: 'lax',
    })

    if (fullName) {
      response.cookies.set('cc_user_name', encodeURIComponent(fullName), {
        path: '/',
        maxAge: 86400 * 7,
        sameSite: 'lax',
      })
    }

    if (avatarUrl) {
      response.cookies.set('cc_user_avatar', encodeURIComponent(avatarUrl), {
        path: '/',
        maxAge: 86400 * 7,
        sameSite: 'lax',
      })
    }

    return response
  } catch (err: unknown) {
    console.error('Google auth route error:', err)
    const msg = err instanceof Error ? err.message : 'Google authentication failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

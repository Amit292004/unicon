import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isValidSupabaseUrl(url?: string): boolean {
  if (!url) return false
  if (url.includes('your_supabase_project_url') || url.includes('your-project')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase credentials are not set or are placeholder, allow demo session cookie
  if (!isValidSupabaseUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key')) {
    const demoUserCookie = request.cookies.get('cc_demo_user')?.value
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register') ||
      request.nextUrl.pathname.startsWith('/verify-email')

    const isProtectedRoute =
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/register') &&
      !request.nextUrl.pathname.startsWith('/verify-email') &&
      !request.nextUrl.pathname.startsWith('/onboarding') &&
      !request.nextUrl.pathname.startsWith('/api') &&
      request.nextUrl.pathname !== '/'

    if (demoUserCookie && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      url.search = ''
      return NextResponse.redirect(url)
    }

    if (!demoUserCookie && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      supabaseUrl ?? '',
      supabaseAnonKey ?? '',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const demoUserCookie = request.cookies.get('cc_demo_user')?.value
    const activeUser = user || demoUserCookie

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register') ||
      request.nextUrl.pathname.startsWith('/verify-email')

    const isProtectedRoute =
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/register') &&
      !request.nextUrl.pathname.startsWith('/verify-email') &&
      !request.nextUrl.pathname.startsWith('/onboarding') &&
      !request.nextUrl.pathname.startsWith('/api') &&
      request.nextUrl.pathname !== '/'

    if (activeUser && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      url.search = ''
      return NextResponse.redirect(url)
    }

    if (!activeUser && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
  } catch (err) {
    console.warn('Supabase middleware warning:', err)
  }

  return supabaseResponse
}

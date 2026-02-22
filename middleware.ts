import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // getSession() lit le cookie localement sans appel réseau → fiable sur Edge
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const { pathname } = request.nextUrl

    // Routes publiques
    const publicPaths = ['/auth']
    if (publicPaths.some((p) => pathname.startsWith(p))) {
      if (session) {
        return NextResponse.redirect(new URL('/catalogue', request.url))
      }
      return supabaseResponse
    }

    // Routes protégées
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    return supabaseResponse
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api).*)',
  ],
}

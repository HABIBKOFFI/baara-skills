import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Routes publiques — pas de protection
  const publicPaths = ['/auth']
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // Si déjà connecté, rediriger vers le catalogue
    if (user) {
      return NextResponse.redirect(new URL('/catalogue', request.url))
    }
    return supabaseResponse
  }

  // Routes protégées — rediriger vers /auth si non connecté
  if (!user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Vérifier le rôle pour les routes recruteur et admin
  if (pathname.startsWith('/recruteur') || pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (pathname.startsWith('/recruteur') && profile?.role !== 'recruteur' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/catalogue', request.url))
    }

    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/catalogue', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api).*)',
  ],
}

import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware léger sans @supabase/ssr — compatible Edge runtime Vercel.
 * La clé Supabase au format sb_publishable_... n'est pas un JWT et cause
 * un crash silencieux dans @supabase/ssr. On vérifie simplement la présence
 * du cookie de session Supabase (sb-*-auth-token).
 * La vérification réelle du token JWT se fait dans chaque page/API via getUser().
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Chercher le cookie de session Supabase (format: sb-<projectRef>-auth-token)
  const cookies = request.cookies.getAll()
  const isAuthenticated = cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token') && c.value
  )

  const publicPaths = ['/auth']
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  // Déjà connecté → rediriger depuis /auth vers le catalogue
  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL('/catalogue', request.url))
  }

  // Non connecté → rediriger vers /auth
  if (!isPublic && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api).*)',
  ],
}

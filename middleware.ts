import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['en', 'fr', 'es', 'sq']
const defaultLocale = 'en'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const protectedRoutes = ['/dashboard', '/profile', '/submissions', '/settings']
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Extract locale from path
  const pathnameLocale = locales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const pathWithoutLocale = pathnameLocale
    ? pathname.slice(`/${pathnameLocale}`.length) || '/'
    : pathname

  // Check if route requires protection
  const isProtectedRoute = protectedRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  )

  // 1. Apply intl middleware for locale routing
  const intlResponse = intlMiddleware(request)

  // 2. Refresh Supabase session using the intl response
  const { supabaseResponse, user } = await updateSession(request, intlResponse)

  if (isProtectedRoute && !user) {
    const locale = pathnameLocale || defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', pathname)

    // Create redirect response but MUST use the refreshed cookies
    const redirectResponse = NextResponse.redirect(loginUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // Break potential loops: if user is logged in but redirected to login with an error,
  // allow them to see the login page (likely due to missing profile or other issue)
  const hasErrorParam = request.nextUrl.searchParams.has('error') || request.nextUrl.searchParams.has('message')

  if (isAuthRoute && user && !hasErrorParam) {
    const locale = pathnameLocale || defaultLocale
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url)

    // Create redirect response but MUST use the refreshed cookies
    const redirectResponse = NextResponse.redirect(dashboardUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|sw\\.js|manifest\\.json).*)',
  ],
}

/**
 * Next.js Middleware - Authentication & Route Protection
 * 
 * This middleware runs on every request matching the configured paths.
 * It handles:
 * - Supabase authentication session management
 * - Cookie-based auth state synchronization
 * - Protected route access control
 * - Automatic redirects for authenticated/unauthenticated users
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware function that protects routes and manages authentication
 * 
 * Flow:
 * 1. Creates Supabase client with cookie handlers
 * 2. Checks user authentication status
 * 3. Redirects based on route and auth state
 * 
 * @param request - The incoming Next.js request object
 * @returns NextResponse with appropriate redirect or continuation
 */
export async function middleware(request: NextRequest) {
  // Initialize response object that will be modified with auth cookies
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create Supabase server client with cookie management
  // This ensures auth state is properly synchronized across requests
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies from the incoming request
        getAll() {
          return request.cookies.getAll()
        },
        // Set cookies on both request and response for proper auth state
        setAll(cookiesToSet) {
          // Update request cookies for current request
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          // Create new response with updated request
          supabaseResponse = NextResponse.next({
            request,
          })
          // Set cookies on response for client
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fetch the current authenticated user from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // PROTECTION RULE 1: Redirect unauthenticated users away from protected routes
  // If user is not logged in and trying to access dashboard, redirect to login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // PROTECTION RULE 2: Redirect authenticated users away from auth pages
  // If user is logged in and trying to access login/signup, redirect to dashboard
  // Only applies to GET requests to avoid interfering with form submissions
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) && request.method === 'GET') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow request to proceed with updated auth cookies
  return supabaseResponse
}

/**
 * Middleware configuration
 * Specifies which routes this middleware should run on
 * 
 * Matcher patterns:
 * - /dashboard/:path* - All dashboard routes (protected)
 * - /login - Login page (redirect if authenticated)
 * - /signup - Signup page (redirect if authenticated)
 */
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}

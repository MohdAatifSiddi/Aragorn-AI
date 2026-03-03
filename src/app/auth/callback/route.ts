/**
 * Authentication Callback Route
 * 
 * Handles OAuth callback from Supabase authentication flow.
 * This route is called after successful authentication with OAuth providers
 * (Google, GitHub, etc.) or magic link email verification.
 * 
 * Flow:
 * 1. Extract authorization code from URL params
 * 2. Exchange code for session with Supabase
 * 3. Redirect to dashboard (or custom 'next' URL)
 * 4. Handle errors by redirecting to login with error message
 * 
 * @route GET /auth/callback?code={code}&next={redirect_url}
 * @see https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * GET handler for OAuth callback
 * 
 * Query parameters:
 * - code: Authorization code from OAuth provider (required)
 * - next: Optional redirect URL after successful auth (defaults to /dashboard)
 * 
 * @returns Redirect to dashboard or login page with error
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Get custom redirect URL or default to dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  // If authorization code is present, exchange it for a session
  if (code) {
    const supabase = await createClient()
    
    // Exchange the authorization code for a user session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    // If successful, redirect to the intended destination
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If no code or exchange failed, redirect to login with error message
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}

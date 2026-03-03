/**
 * Supabase Server Client Factory
 * 
 * Creates Supabase clients for server-side operations (Server Components, API Routes).
 * Uses Next.js cookies() API for authentication state management.
 * 
 * Key Features:
 * - Server-side rendering (SSR) compatible
 * - Cookie-based session management
 * - Automatic session refresh
 * - Works with Next.js middleware
 * 
 * Usage:
 * ```typescript
 * const supabase = await createClient();
 * const { data } = await supabase.from('table').select();
 * ```
 * 
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client configured for server-side use
 * 
 * This client:
 * - Reads auth cookies from Next.js request
 * - Updates cookies when auth state changes
 * - Handles session refresh automatically
 * - Works in Server Components and API Routes
 * 
 * @returns Promise<SupabaseClient> - Configured Supabase client
 */
export async function createClient() {
  // Get Next.js cookie store (async in App Router)
  const cookieStore = await cookies()

  // Create Supabase client with cookie handlers
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies from the request
        getAll() {
          return cookieStore.getAll()
        },
        // Update cookies when auth state changes
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions (which we do in src/middleware.ts).
          }
        },
      },
    }
  )
}

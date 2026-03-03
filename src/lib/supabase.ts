/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for client-side operations (Client Components, browser).
 * This is a singleton instance shared across the application.
 * 
 * Key Features:
 * - Client-side rendering (CSR) compatible
 * - Automatic session management in browser
 * - Real-time subscriptions support
 * - OAuth authentication support
 * 
 * Usage:
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 * 
 * // Query data
 * const { data } = await supabase.from('table').select();
 * 
 * // Real-time subscription
 * supabase.channel('changes').on('postgres_changes', ...).subscribe();
 * 
 * // OAuth login
 * await supabase.auth.signInWithOAuth({ provider: 'google' });
 * ```
 * 
 * @see https://supabase.com/docs/reference/javascript/initializing
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Singleton Supabase client instance for browser use
 * 
 * This client:
 * - Manages auth state in browser storage
 * - Handles automatic token refresh
 * - Supports real-time subscriptions
 * - Works in Client Components only
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Server Actions Module
 * 
 * This module contains server-side actions for authentication and user management.
 * All functions are marked with 'use server' directive for Next.js server actions.
 * 
 * @module actions
 * @requires next/cache
 * @requires next/navigation
 * @requires @/lib/supabase-server
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

/**
 * Login Action
 * 
 * Authenticates a user with email and password using Supabase Auth.
 * On successful login, revalidates the dashboard layout cache.
 * 
 * @async
 * @function login
 * @param {FormData} formData - Form data containing email and password
 * @returns {Promise<{error?: string, success?: boolean}>} Result object with error or success flag
 * 
 * @example
 * const result = await login(formData);
 * if (result.error) {
 *   console.error(result.error);
 * }
 */
export async function login(formData: FormData) {
  // Initialize Supabase client
  const supabase = await createClient()

  // Extract credentials from form data
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Attempt to sign in with Supabase Auth
  const { error } = await supabase.auth.signInWithPassword(data)

  // Handle authentication errors
  if (error) {
    return { error: error.message }
  }

  // Revalidate dashboard cache to reflect authenticated state
  revalidatePath('/dashboard', 'layout')
  
  return { success: true }
}

/**
 * Signup Action
 * 
 * Registers a new user with email and password using Supabase Auth.
 * Sends a confirmation email with a callback URL for email verification.
 * 
 * @async
 * @function signup
 * @param {FormData} formData - Form data containing email and password
 * @returns {Promise<{error?: string, success?: boolean}>} Result object with error or success flag
 * 
 * @example
 * const result = await signup(formData);
 * if (result.success) {
 *   // Show success message to check email
 * }
 */
export async function signup(formData: FormData) {
  // Initialize Supabase client
  const supabase = await createClient()

  // Extract credentials from form data
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Attempt to create new user account
  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      // Set email redirect URL for verification callback
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    }
  })

  // Handle signup errors
  if (error) {
    return { error: error.message }
  }

  // Revalidate root layout cache
  revalidatePath('/', 'layout')
  
  return { success: true }
}

/**
 * Logout Action
 * 
 * Signs out the current user and clears their session.
 * Revalidates the root layout cache to reflect logged-out state.
 * 
 * @async
 * @function logout
 * @returns {Promise<{success: boolean}>} Result object with success flag
 * 
 * @example
 * const result = await logout();
 * if (result.success) {
 *   router.push('/login');
 * }
 */
export async function logout() {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Sign out the current user
  await supabase.auth.signOut()
  
  // Revalidate root layout cache
  revalidatePath('/', 'layout')
  
  return { success: true }
}

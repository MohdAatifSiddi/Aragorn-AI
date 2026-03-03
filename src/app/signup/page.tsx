/**
 * Signup Page
 * 
 * User registration page for creating new Aragorn AI accounts.
 * 
 * Features:
 * - Email/password registration
 * - OAuth provider support (GitHub, Azure)
 * - Email verification flow
 * - Clean, minimal design matching login page
 * - Decorative background elements
 * - Link to login page for existing users
 * 
 * @page /signup
 */

import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
import { Construction } from "lucide-react";

/**
 * SignupPage Component
 * Renders the registration page with authentication form
 */
export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements - Mirrored from login page */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
      
      {/* Brand Logo - Top left corner with link to home */}
      <div className="absolute top-10 left-10 z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-zinc-900/80 rounded-xl group-hover:scale-110 transition-transform">
            <Construction className="h-5 w-5 text-blue-500" />
          </div>
          <span className="text-sm font-bold tracking-[0.3em] uppercase text-white/80 group-hover:text-white transition-colors">Aragorn AI</span>
        </Link>
      </div>
      
      {/* Main Content - Authentication Form in signup mode */}
      <div className="w-full relative z-10">
        <AuthForm mode="signup" />
      </div>

      {/* Footer - Version indicator */}
      <div className="absolute bottom-10 text-[10px] uppercase tracking-[0.5em] text-zinc-800 font-bold select-none pointer-events-none">
        Secure Auth • v4.2.0
      </div>
    </main>
  );
}

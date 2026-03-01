"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { login, signup } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Construction, Mail, Lock, ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      if (mode === "signup") {
        const result = await signup(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Check your email for confirmation!");
        }
      } else {
        const result = await login(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Welcome back!");
          router.push("/dashboard");
          router.refresh();
        }
      }
    });
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            }
        });
        if (error) throw error;
    } catch (error: any) {
        toast.error(error.message || "OAuth error");
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[360px] mx-auto space-y-8"
    >
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-3xl shadow-2xl shadow-blue-600/30">
                <Construction className="h-8 w-8 text-white" />
            </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-[0.1em]">
          {mode === "login" ? "Welcome" : "Sign Up"}
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
          {mode === "login" 
            ? "Aragorn AI Construction Platform" 
            : "Enterprise Construction Intelligence"}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-600 ml-1">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="user@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-900/30 border-zinc-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 h-14 pl-12 rounded-2xl transition-all text-white placeholder:text-zinc-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-600 ml-1">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-900/30 border-zinc-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 h-14 pl-12 rounded-2xl transition-all text-white placeholder:text-zinc-800"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <>
              {mode === "login" ? "Sign In" : "Get Started"}
              <ArrowRight className="ml-2 h-3 w-3" />
            </>
          )}
        </Button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-900" />
        </div>
        <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-widest">
          <span className="bg-[#050505] px-4 text-zinc-700">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
            variant="outline" 
            onClick={() => handleOAuth('github')}
            className="h-12 border-zinc-800 hover:bg-zinc-900 rounded-2xl text-[9px] uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-2"
        >
          <Github className="h-4 w-4" />
          Github
        </Button>
        <Button 
            variant="outline" 
            className="h-12 border-zinc-800 hover:bg-zinc-900 rounded-2xl text-[9px] uppercase font-bold tracking-widest text-zinc-500"
        >
          Azure
        </Button>
      </div>

      <div className="pt-8 text-center">
        {mode === "login" ? (
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:text-white transition-colors ml-1 underline underline-offset-4">Create One</Link>
          </p>
        ) : (
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:text-white transition-colors ml-1 underline underline-offset-4">Sign In</Link>
          </p>
        )}
      </div>
    </motion.div>
  );
}

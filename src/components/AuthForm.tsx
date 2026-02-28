"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Construction, Loader2 } from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success("Check your email for confirmation!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 text-white shadow-2xl">
      <CardHeader className="space-y-4 flex flex-col items-center">
        <div className="p-3 bg-blue-600 rounded-2xl">
          <Construction className="h-8 w-8 text-white" />
        </div>
        <div className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight uppercase">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-zinc-500">
            {mode === "login" 
              ? "Login to access your site dashboard." 
              : "Register your site to begin edge monitoring."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold opacity-70">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800 focus:ring-blue-600 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest font-bold opacity-70">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800 focus:ring-blue-600 h-12"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 transition-colors rounded-full font-bold uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            {mode === "login" ? "Login" : "Register"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm opacity-60">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-500 hover:underline font-bold">Sign Up</Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 hover:underline font-bold">Login</Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
import { Construction } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-cover bg-center relative overflow-hidden" 
      style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070')" }}
    >
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Construction className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tighter uppercase text-white">Aragorn</span>
        </Link>
      </div>
      
      <AuthForm mode="login" />
    </main>
  );
}

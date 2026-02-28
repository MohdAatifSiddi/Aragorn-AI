import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
import { Construction } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
      
      <div className="absolute top-10 left-10 z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-zinc-900/80 rounded-xl group-hover:scale-110 transition-transform">
            <Construction className="h-5 w-5 text-blue-500" />
          </div>
          <span className="text-sm font-bold tracking-[0.3em] uppercase text-white/80 group-hover:text-white transition-colors">Aragorn AI</span>
        </Link>
      </div>
      
      <div className="w-full relative z-10">
        <AuthForm mode="login" />
      </div>

      <div className="absolute bottom-10 text-[10px] uppercase tracking-[0.5em] text-zinc-800 font-bold select-none pointer-events-none">
        Secure Auth • v4.2.0
      </div>
    </main>
  );
}

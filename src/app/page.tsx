"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Construction, ShieldCheck, Zap, Globe, PackageCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const sections = [
    {
      id: "hero",
      title: "Aragorn AI",
      subtitle: "Edge-first Construction Intelligence",
      description: "Optimizing safety, time, and cost with on-device AI.",
      cta: "Get Started",
      ctaLink: "/signup",
      bg: "bg-zinc-950",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070", // Construction site
    },
    {
      id: "safety",
      title: "PPE & Safety",
      subtitle: "Zero Compromise on Site Safety",
      description: "Real-time PPE detection and hazard monitoring directly at the edge.",
      cta: "Explore Safety Features",
      ctaLink: "/dashboard",
      bg: "bg-zinc-900",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1974", // Safety helmet
    },
    {
      id: "progress",
      title: "Zone Progress",
      subtitle: "Visual Completion Tracking",
      description: "Automated progress estimation for every floor and zone.",
      cta: "View Progress Demo",
      ctaLink: "/dashboard",
      bg: "bg-zinc-950",
      image: "https://images.unsplash.com/photo-1590348697110-6395b458b68a?auto=format&fit=crop&q=80&w=2070", // Building structure
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-blue-600/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-sm bg-black/10">
        <Link href="/" className="flex items-center gap-2 group">
          <Construction className="h-6 w-6 text-blue-500 transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold tracking-tighter uppercase">Aragorn</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest opacity-80">
          <Link href="#safety" className="hover:opacity-100 transition-opacity">Safety</Link>
          <Link href="#progress" className="hover:opacity-100 transition-opacity">Progress</Link>
          <Link href="#materials" className="hover:opacity-100 transition-opacity">Materials</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">Login</Link>
          <Button asChild variant="outline" className="rounded-full border-white/20 hover:bg-white hover:text-black transition-all px-6 py-2 h-auto text-xs uppercase tracking-widest font-bold">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Sections */}
      <main className="snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth no-scrollbar">
        {sections.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className="snap-start relative h-screen w-full flex flex-col items-center justify-between py-24 px-6 overflow-hidden"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10s] scale-105 hover:scale-100"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${section.image}')` }}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative z-10 text-center space-y-2 mt-12"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">{section.title}</h1>
              <p className="text-lg md:text-xl text-zinc-300 font-medium">{section.subtitle}</p>
              <p className="text-sm md:text-base text-zinc-400 max-w-md mx-auto opacity-70">{section.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative z-10 w-full max-w-xs flex flex-col gap-4 mb-8"
            >
              <Button asChild className="rounded-full bg-white text-black hover:bg-zinc-200 transition-colors py-6 text-sm font-bold uppercase tracking-widest h-auto">
                <Link href={section.ctaLink}>{section.cta}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 bg-black/20 backdrop-blur-md hover:bg-white/10 text-white transition-colors py-6 text-sm font-bold uppercase tracking-widest h-auto">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
              
              {idx < sections.length - 1 && (
                <div className="flex justify-center mt-8">
                  <motion.div 
                    animate={{ y: [0, 10, 0] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="cursor-pointer"
                    onClick={() => {
                       document.getElementById(sections[idx+1].id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <ChevronDown className="h-8 w-8 text-white/50" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </section>
        ))}

        {/* Features Grid Section */}
        <section id="materials" className="snap-start relative min-h-screen w-full bg-zinc-950 py-32 px-6 md:px-12 flex flex-col items-center">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Enterprise Capabilities</h2>
                <p className="text-zinc-500 max-w-2xl mx-auto">Scalable AI tools designed for the unique challenges of construction sites in the Indian context.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
                {[
                    { icon: ShieldCheck, title: "Edge PPE Detection", desc: "Identify safety non-compliance in real-time without constant cloud dependency." },
                    { icon: TrendingUp, title: "Progress Estimation", desc: "Zone-level tracking using computer vision to provide granular project status." },
                    { icon: PackageCheck, title: "Material Verification", desc: "Automated OCR and object detection to cross-reference inventory with manifests." },
                    { icon: Zap, title: "Low-Latency Alerts", desc: "Immediate notifications via SMS, WhatsApp, and push for critical site incidents." },
                    { icon: Globe, title: "Multilingual ASR", desc: "Support for Hindi, Urdu, and English voice commands and reporting." },
                    { icon: Construction, title: "Offline-First Sync", desc: "Adaptive bandwidth usage ensures data integrity in low-connectivity zones." },
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 hover:border-blue-500/50 transition-colors group"
                    >
                        <feature.icon className="h-10 w-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-2 uppercase tracking-tighter">{feature.title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>

            <footer className="mt-32 w-full pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 text-xs uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                    <Construction className="h-4 w-4" />
                    <span>© 2026 Aragorn AI</span>
                </div>
                <div className="flex gap-8">
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Legal</Link>
                    <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                </div>
            </footer>
        </section>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

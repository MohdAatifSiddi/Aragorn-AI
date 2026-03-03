/**
 * Landing Page Component
 * 
 * Marketing homepage for Aragorn AI Construction Intelligence platform.
 * Features a modern, immersive design with scroll-based animations.
 * 
 * Key Sections:
 * 1. Hero - Main value proposition
 * 2. Safety Vision - Edge-based PPE detection
 * 3. Project Velocity - Predictive progress tracking
 * 4. Features - Enterprise capabilities showcase
 * 
 * Design Features:
 * - Snap scrolling for smooth section transitions
 * - Parallax background images
 * - Framer Motion animations
 * - Responsive layout
 * - Premium minimalist aesthetic
 * 
 * @page / (root)
 */

"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ChevronDown, 
  Construction, 
  ShieldCheck, 
  Zap, 
  Globe, 
  PackageCheck, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  HardHat,
  MonitorCheck,
  Cpu,
  BarChart3,
  Layers3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

/**
 * LandingPage Component
 * Main marketing page with scroll-based sections
 */
export default function LandingPage() {
  // Reference to container for scroll tracking
  const containerRef = useRef(null);
  
  // Track scroll progress for animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Define marketing sections with content and imagery
  const sections = [
    {
      id: "hero",
      title: "Aragorn AI",
      subtitle: "Edge-First Construction Intelligence",
      description: "Autonomous site monitoring, safety indexing, and progress velocity tracking on a global scale.",
      cta: "Experience Intelligence",
      ctaLink: "/signup",
      bg: "bg-[#050505]",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070",
    },
    {
      id: "safety",
      title: "Edge Vision Safety",
      subtitle: "Zero-Latency Hazard Detection",
      description: "On-device PPE verification and restricted zone monitoring using computer vision at the edge.",
      cta: "Explore Safety Protocols",
      ctaLink: "/login",
      bg: "bg-[#0a0a0a]",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1974",
    },
    {
      id: "velocity",
      title: "Project Velocity",
      subtitle: "Predictive Progress Tracking",
      description: "Automated progress estimation for every sector. Predictive AI identifies bottlenecks before they occur.",
      cta: "View Velocity Demo",
      ctaLink: "/login",
      bg: "bg-[#050505]",
      image: "https://images.unsplash.com/photo-1590348697110-6395b458b68a?auto=format&fit=crop&q=80&w=2070",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* Premium Minimalist Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 md:px-16 backdrop-blur-md bg-black/5 border-b border-white/[0.03]">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="p-2 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
            <Construction className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-[0.4em] uppercase text-white/90">Aragorn AI</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <Link href="#safety" className="hover:text-white transition-colors">Safety Vision</Link>
          <Link href="#velocity" className="hover:text-white transition-colors">Project Velocity</Link>
          <Link href="#features" className="hover:text-white transition-colors">Enterprise</Link>
          <Link href="#contact" className="hover:text-white transition-colors">Global Ops</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Sign In</Link>
          <Button asChild className="rounded-full bg-white text-black hover:bg-zinc-200 transition-all px-8 py-2 h-10 text-[10px] uppercase tracking-widest font-bold shadow-xl active:scale-[0.98]">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Main Experience */}
      <main ref={containerRef} className="snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth no-scrollbar relative">
        {sections.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className="snap-start relative h-screen w-full flex flex-col items-center justify-between py-32 px-8 overflow-hidden"
          >
            {/* Background Content */}
            <div className="absolute inset-0 z-0">
               <motion.div 
                 className="absolute inset-0 bg-cover bg-center"
                 style={{ 
                   backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.85)), url('${section.image}')`
                 }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="relative z-10 text-center space-y-4 mt-16"
            >
              <motion.h1 
                className="text-5xl md:text-8xl font-bold tracking-tighter text-white uppercase"
              >
                {section.title}
              </motion.h1>
              <p className="text-xl md:text-2xl text-zinc-300 font-medium tracking-tight max-w-2xl mx-auto">{section.subtitle}</p>
              <div className="h-1 w-24 bg-blue-600 mx-auto mt-8 opacity-40 rounded-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="relative z-10 w-full max-w-sm flex flex-col gap-6 mb-12"
            >
               <div className="text-center space-y-8">
                  <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed opacity-70 px-4">{section.description}</p>
                  
                  <div className="flex flex-col gap-4">
                    <Button asChild className="rounded-full bg-white text-black hover:bg-zinc-200 transition-all py-8 text-[11px] font-bold uppercase tracking-[0.2em] h-auto shadow-2xl group active:scale-[0.98]">
                      <Link href={section.ctaLink} className="flex items-center gap-3">
                        {section.cta}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-zinc-800 bg-zinc-900/30 backdrop-blur-xl hover:bg-zinc-800 text-white transition-all py-8 text-[11px] font-bold uppercase tracking-[0.2em] h-auto active:scale-[0.98]">
                      <Link href="/login">Explore Dashboard</Link>
                    </Button>
                  </div>
               </div>
              
              {idx < sections.length - 1 && (
                <div className="flex justify-center mt-12">
                  <motion.div 
                    animate={{ y: [0, 8, 0] }} 
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="cursor-pointer p-4 rounded-full bg-zinc-900/30 border border-white/[0.03]"
                    onClick={() => {
                       document.getElementById(sections[idx+1].id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <ChevronDown className="h-6 w-6 text-zinc-500" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </section>
        ))}

        {/* Feature Experience Section */}
        <section id="features" className="snap-start relative min-h-screen w-full bg-[#050505] py-40 px-8 md:px-24 flex flex-col items-center">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                <div className="space-y-12 text-left">
                    <div className="space-y-4">
                        <span className="bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-full text-[10px] uppercase font-bold tracking-[0.3em] px-5 py-1.5 h-auto w-fit">Enterprise Core</span>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">Autonomous Construction Intelligence</h2>
                    </div>
                    <p className="text-zinc-400 text-xl leading-relaxed max-w-xl">
                        Integrated hardware-software stack designed for high-risk environments. 
                        Our edge vision units process site data locally, ensuring safety and velocity 
                        even in offline-heavy construction zones.
                    </p>
                    <div className="grid grid-cols-2 gap-8 pt-8">
                        <div className="space-y-2">
                            <p className="text-3xl font-bold text-white tracking-tighter">98.4%</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">PPE Detection Accuracy</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-3xl font-bold text-white tracking-tighter">0.02s</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">Edge Response Latency</p>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-full border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 px-12 py-8 text-[11px] font-bold uppercase tracking-[0.2em] h-auto shadow-2xl">
                        Download Whitepaper
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative">
                    {/* Decorative Element */}
                    <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    {[
                        { icon: ShieldAlert, title: "Risk Mitigation", desc: "Automated alert dispatch for high-risk safety violations." },
                        { icon: Cpu, title: "Edge Processing", desc: "Local inference reduces cloud bandwidth and latency by 90%." },
                        { icon: Layers3, title: "Multilingual ASR", desc: "Natural language reporting in Hindi, Urdu, and English." },
                        { icon: MonitorCheck, title: "Material Ledger", desc: "Visual verification of site inventory and manifests." },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15, duration: 1 }}
                            className="bg-zinc-900/20 p-10 rounded-[40px] border border-white/[0.03] hover:border-blue-500/20 hover:bg-zinc-900/40 transition-all group backdrop-blur-md shadow-2xl relative"
                        >
                            <div className="p-4 bg-zinc-900/50 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
                                <feature.icon className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="text-sm font-bold mb-3 uppercase tracking-[0.2em] text-white/90">{feature.title}</h3>
                            <p className="text-zinc-500 text-[13px] leading-relaxed font-medium">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <footer className="mt-60 w-full pt-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-12 opacity-40 text-[9px] font-bold uppercase tracking-[0.4em]">
                <div className="flex items-center gap-4">
                    <Construction className="h-4 w-4 text-blue-600" />
                    <span>Aragorn AI Platform © 2026</span>
                </div>
                <div className="flex flex-wrap justify-center gap-10">
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Legal</Link>
                    <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
                    <Link href="#" className="hover:text-white transition-colors">Systems Status</Link>
                </div>
            </footer>
        </section>
      </main>

      <style jsx global>{`
        @font-face {
            font-family: 'Gotham';
            src: local('Arial');
        }

        body {
            background-color: #050505;
            font-family: 'Gotham', sans-serif;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        * {
            scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

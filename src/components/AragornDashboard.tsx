"use client";

import React, { useState, useEffect, useCallback } from "react";
import { logout } from "@/app/actions";
import { 
  ShieldCheck, 
  Construction, 
  AlertTriangle, 
  HardHat, 
  Layers, 
  TrendingUp,
  Globe,
  Camera,
  PackageCheck,
  LogOut,
  MapPin,
  Loader2,
  ChevronRight,
  User,
  Zap,
  Clock,
  History,
  Activity,
  Scan,
  Maximize2,
  RefreshCcw,
  ArrowRight,
  LayoutDashboard,
  Box,
  BrainCircuit,
  Settings
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";

export default function AragornDashboard() {
  const [lang, setLang] = useState<'en' | 'hi' | 'ur'>('en');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [detections, setDetections] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [siteStats, setSiteStats] = useState<any>(null);
  const router = useRouter();

  const fetchSiteDetails = useCallback(async (siteId: string) => {
    try {
      const [zonesRes, alertsRes, materialsRes, statsRes, detectionsRes, siteStatsRes] = await Promise.all([
        supabase.from('zones').select('*').eq('site_id', siteId),
        supabase.from('alerts').select('*').eq('site_id', siteId).order('created_at', { ascending: false }).limit(50),
        supabase.from('material_verifications').select('*').eq('site_id', siteId).order('created_at', { ascending: false }),
        supabase.from('project_stats').select('*').eq('site_id', siteId).order('date', { ascending: true }),
        supabase.from('detections').select('*, zones(name, site_id)').eq('zones.site_id', siteId).order('created_at', { ascending: false }).limit(50),
        fetch(`/api/stats?siteId=${siteId}`).then(r => r.json())
      ]);

      if (zonesRes.data) setZones(zonesRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (materialsRes.data) setMaterials(materialsRes.data);
      if (statsRes.data) setStats(statsRes.data);
      if (detectionsRes.data) setDetections(detectionsRes.data);
      if (siteStatsRes.success) setSiteStats(siteStatsRes.stats);
    } catch (error) {
      console.error("Error fetching site details:", error);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: sitesData, error: sitesError } = await supabase.from('sites').select('*').order('created_at', { ascending: false });
      if (sitesError) throw sitesError;

      if (sitesData && sitesData.length > 0) {
        setSites(sitesData);
        setSelectedSite(sitesData[0]);
        await fetchSiteDetails(sitesData[0].id);
      } else {
        // Site doesn't exist? Show a prompt to seed demo site or create one.
        toast.info("No active sites. You might need to provision a demo site.");
      }
    } catch (error: any) {
      console.error("Error fetching initial data:", error);
      toast.error("Connectivity issue. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [fetchSiteDetails, router]);

  useEffect(() => {
    setMounted(true);
    fetchInitialData();

    const alertsChannel = supabase
      .channel('realtime-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        setAlerts(prev => [payload.new, ...prev]);
        toast.error(`NEW ALERT: ${payload.new.message}`, {
          description: `Severity: ${payload.new.severity.toUpperCase()}`,
          duration: 5000,
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'detections' }, (payload) => {
        setDetections(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'zones' }, (payload) => {
        setZones(prev => prev.map(z => z.id === payload.new.id ? payload.new : z));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
    };
  }, [fetchInitialData]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push("/login");
      router.refresh();
    }
  };

  const refreshData = () => {
    if (selectedSite) fetchSiteDetails(selectedSite.id);
    toast.success("Syncing Edge Data...");
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-20 w-20 rounded-3xl border-2 border-blue-600/20 border-t-blue-600"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Construction className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-white font-bold text-xs uppercase tracking-[0.6em] ml-2">Aragorn Edge Vision</p>
            <p className="text-zinc-700 text-[9px] uppercase tracking-widest animate-pulse">Initializing Secure Pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  const translations = {
    en: {
      title: "Aragorn AI",
      tagline: "Construction Intelligence",
      safety: "Safety Index",
      progress: "Total Progress",
      activeZones: "Active Sectors",
      alerts: "Critical Alerts",
      zoneProgress: "Zone Progress Tracking",
      realtimeFeed: "Edge Vision Stream",
      detections: "Detections Log",
      recentActivity: "Recent Activity",
      aiInsights: "Predictive Intelligence",
      recommendation: "Predicted delay in Foundations due to monsoon rainfall. Recommendation: Accelerate structural steel supply chain orders.",
      viewFull: "View Detailed Report",
      complianceTrend: "Compliance Trend",
      growth: "+4.2% improvement",
      last24: "Last 24h",
      materials: "Material Ledger",
      matID: "ID",
      matItem: "Material",
      matQty: "Quantity",
      matStatus: "Status",
      velocity: "Progress Velocity (mps)",
    },
    hi: {
      title: "अरागोन एआई",
      tagline: "निर्माण बुद्धिमत्ता",
      safety: "सुरक्षा सूचकांक",
      progress: "कुल प्रगति",
      activeZones: "सक्रिय क्षेत्र",
      alerts: "महत्वपूर्ण अलर्ट",
      zoneProgress: "क्षेत्रवार प्रगति ट्रैकिंग",
      realtimeFeed: "एज विजन स्ट्रीम",
      detections: "डिटेक्शन लॉग",
      recentActivity: "हाल की गतिविधि",
      aiInsights: "भविष्य कहनेवाला बुद्धिमत्ता",
      recommendation: "मानसून की बारिश के कारण फाउंडेशन में देरी की भविष्यवाणी। सिफारिश: संरचनात्मक स्टील आपूर्ति श्रृंखला के आदेशों में तेजी लाएं।",
      viewFull: "विस्तृत रिपोर्ट देखें",
      complianceTrend: "अनुपालन रुझान",
      growth: "+4.2% सुधार",
      last24: "पिछले 24 घंटे",
      materials: "सामग्री लेजर",
      matID: "आईडी",
      matItem: "सामग्री",
      matQty: "मात्रा",
      matStatus: "स्थिति",
      velocity: "प्रगति वेग (मीटर/सेकंड)",
    },
    ur: {
      title: "اراگون AI",
      tagline: "تعمیراتی ذہانت",
      safety: "حفاظتی انڈیکس",
      progress: "کل پیشرفت",
      activeZones: "فعال شعبے",
      alerts: "اہم الرٹس",
      zoneProgress: "زون کی پیشرفت سے باخبر رہنا",
      realtimeFeed: "ایج ویژن سٹریم",
      detections: "ڈیٹیکشن لاگ",
      recentActivity: "حالیہ سرگرمی",
      aiInsights: "پیشن گوئی کی بصیرت",
      recommendation: "مون سون کی بارش کی وجہ سے فاؤنڈیشن میں تاخیر کی پیش گوئی۔ سفارش: سٹرکچرل سٹیل سپلائی چین کے آرڈرز کو تیز کریں۔",
      viewFull: "تفصیلی رپورٹ دیکھیں",
      complianceTrend: "تعمیل کا رجحان",
      growth: "+4.2٪ بہتری",
      last24: "پچھلے 24 گھنٹے",
      materials: "مادی لیجر",
      matID: "آئی ڈی",
      matItem: "مواد",
      matQty: "مقدار",
      matStatus: "حیثیت",
      velocity: "پیشرفت کی رفتار (میٹر فی سیکنڈ)",
    }
  };

  const t = translations[lang];

  // Use real-time stats from API if available, otherwise fallback to database stats
  const currentSafety = siteStats?.overallSafetyScore || 
    (stats.length > 0 ? stats[stats.length - 1].safety_compliance_percent : 96);
  const avgProgress = zones.length > 0 ? Math.round(zones.reduce((acc, z) => acc + z.progress_percent, 0) / zones.length) : 0;
  const activeZonesCount = zones.filter(z => z.status === 'active').length;
  const highAlerts = siteStats?.highAlerts || alerts.filter(a => a.severity === 'high' && !a.is_resolved).length;
  const totalImagesAnalyzed = siteStats?.totalImages || 0;
  const totalPersonsDetected = siteStats?.totalPersonsDetected || 0;

  return (
    <div className={`min-h-screen bg-[#050505] p-4 md:p-8 ${lang === 'ur' ? 'rtl' : 'ltr'} font-sans antialiased text-white selection:bg-blue-600/30`}>
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Navigation / Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 p-4 rounded-3xl shadow-2xl shadow-blue-600/20 cursor-pointer"
            >
              <Construction className="h-6 w-6 text-white" />
            </motion.div>
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase flex items-center gap-4">
                  {t.title}
                  <span className="text-[9px] uppercase tracking-[0.4em] border border-zinc-800 text-zinc-500 bg-zinc-900/50 px-4 py-1 rounded-full">Enterprise Link</span>
                </h1>
              <div className="flex items-center gap-3">
                <MapPin className="h-3 w-3 text-blue-500" />
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">{selectedSite?.name || "Global"} • {selectedSite?.location || "India"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-full border border-zinc-800/50">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLang('en')}
                    className={`rounded-full px-5 text-[9px] font-bold uppercase tracking-widest h-8 transition-all ${lang === 'en' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}
                >
                    EN
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLang('hi')}
                    className={`rounded-full px-5 text-[9px] font-bold uppercase tracking-widest h-8 transition-all ${lang === 'hi' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}
                >
                    HI
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLang('ur')}
                    className={`rounded-full px-5 text-[9px] font-bold uppercase tracking-widest h-8 transition-all ${lang === 'ur' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}
                >
                    UR
                </Button>
            </div>

              <Button 
                variant="outline" 
                onClick={refreshData}
                className="rounded-full border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 h-10 w-10 p-0 transition-transform active:rotate-180 duration-500"
              >
                <RefreshCcw className="h-4 w-4 text-zinc-400" />
              </Button>

              <Button 
                variant="outline" 
                onClick={async () => {
                    if (!selectedSite) return;
                    toast.info("Triggering Edge Simulation...");
                    try {
                        const event_type = ['PPE', 'PROGRESS', 'MATERIAL'][Math.floor(Math.random() * 3)];
                        let payload = {};
                        let zoneId = zones[Math.floor(Math.random() * zones.length)]?.id;
                        
                        if (event_type === 'PPE') {
                            payload = {
                                violation: "NO_HELMET",
                                severity: "high",
                                details: "Visual identification of worker without hard hat.",
                                confidence: 0.98
                            };
                        } else if (event_type === 'PROGRESS') {
                            payload = {
                                progress_percent: Math.min(100, (zones.find(z => z.id === zoneId)?.progress_percent || 0) + 10),
                                zone_name: zones.find(z => z.id === zoneId)?.name
                            };
                        } else {
                            const materials = ["Structural Steel", "Portland Cement", "Copper Wiring"];
                            payload = {
                                name: materials[Math.floor(Math.random() * materials.length)],
                                quantity: "5 Tons",
                                status: "verified"
                            };
                        }

                        const res = await fetch('/api/edge/ingest', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                siteId: selectedSite.id,
                                zoneId,
                                type: event_type,
                                payload
                            })
                        });
                        const data = await res.json();
                        if (data.success) toast.success(`Edge Event: ${event_type} Reported`);
                        else toast.error(data.error);
                    } catch (e) {
                        toast.error("Failed to trigger simulation");
                    }
                }}
                className="rounded-full border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 px-5 text-[9px] font-bold uppercase tracking-widest h-10 flex items-center gap-2"
              >
                <Zap className="h-3 w-3 text-blue-500" />
                Simulate Edge
              </Button>

              <div className="flex items-center gap-4 bg-zinc-900/80 p-1.5 pr-6 rounded-full border border-zinc-800 shadow-2xl ml-auto">
               <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px] shadow-lg shadow-blue-600/20">
                 {user?.email?.[0].toUpperCase()}
               </div>
               <div className="hidden sm:block">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{user?.email?.split('@')[0]}</p>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.1em]">Site Admin</p>
               </div>
               <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 rounded-full text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column - Stats & Main Visuals */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Real-time KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t.safety, value: `${currentSafety}%`, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10", trend: currentSafety >= 90 ? "EXCELLENT" : currentSafety >= 70 ? "GOOD" : "NEEDS ATTENTION", subtitle: `${totalImagesAnalyzed} images analyzed` },
                    { label: t.progress, value: `${avgProgress}%`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+2.1%", subtitle: `${activeZonesCount} active zones` },
                    { label: "Workers Detected", value: totalPersonsDetected, icon: HardHat, color: "text-zinc-400", bg: "bg-zinc-400/10", trend: "TRACKED", subtitle: "Total from images" },
                    { label: t.alerts, value: alerts.filter(a => !a.is_resolved).length, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", trend: highAlerts > 0 ? `${highAlerts} CRITICAL` : "STABLE", subtitle: `${siteStats?.violations || 0} violations` }
                ].map((kpi, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 transition-all cursor-default group border-none shadow-2xl">
                            <CardContent className="p-7 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className={`${kpi.bg} ${kpi.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <kpi.icon size={20} />
                                    </div>
                                    <span className={`text-[9px] font-bold tracking-widest uppercase ${kpi.trend.includes('+') ? 'text-green-500' : kpi.trend === 'STABLE' ? 'text-zinc-600' : 'text-red-500'}`}>
                                        {kpi.trend}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{kpi.label}</h3>
                                    <p className="text-3xl font-bold tracking-tighter text-white">{kpi.value}</p>
                                    {kpi.subtitle && (
                                        <p className="text-[9px] text-zinc-700 uppercase tracking-widest">{kpi.subtitle}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Site Vision & Analytics Tabs */}
            <Tabs defaultValue="vision" className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <TabsList className="bg-zinc-900/50 p-1.5 rounded-full border border-zinc-800/50 h-14 w-fit">
                        <TabsTrigger value="vision" className="rounded-full px-8 h-full data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                            <Camera size={14} className="mr-3" />
                            {t.realtimeFeed}
                        </TabsTrigger>
                        <TabsTrigger value="progress" className="rounded-full px-8 h-full data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                            <Box size={14} className="mr-3" />
                            {t.zoneProgress}
                        </TabsTrigger>
                        <TabsTrigger value="ledger" className="rounded-full px-8 h-full data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                            <History size={14} className="mr-3" />
                            Site Logs
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-zinc-600 pr-4">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                        Edge Node: Active
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="vision" key="vision" className="m-0 focus-visible:outline-none">
                        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                            <Card className="bg-black border-zinc-900 overflow-hidden relative shadow-3xl group border-none">
                                <div className="aspect-video relative bg-zinc-950">
                                    {/* Vision Overlay HUD */}
                                    <div className="absolute inset-0 z-10 pointer-events-none p-10 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-red-600 text-white text-[9px] font-bold uppercase px-4 py-1.5 rounded-sm tracking-widest animate-pulse">Live Stream</div>
                                                    <span className="text-white text-[11px] font-mono tracking-widest uppercase font-bold">{zones[2]?.name || "Sector 03"} • NODE_VISION_4K</span>
                                                </div>
                                                <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-[0.2em]">RTSP://SITE_LINK.ENC • 4.2 Gbps • H.265</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="bg-zinc-900/80 backdrop-blur-md p-3 rounded-xl border border-white/5 flex flex-col items-end">
                                                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">FPS</span>
                                                    <span className="text-blue-500 font-mono text-sm">59.8</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="bg-black/60 backdrop-blur-xl p-5 rounded-2xl border border-white/5 space-y-4 max-w-[200px]">
                                                <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Detection Matrix</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-mono">
                                                        <span className="text-zinc-400">HUMANS</span>
                                                        <span className="text-white">12</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-mono">
                                                        <span className="text-zinc-400">HAZARDS</span>
                                                        <span className="text-green-500">0</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-mono">
                                                        <span className="text-zinc-400">PPE_OK</span>
                                                        <span className="text-blue-500">100%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <Button size="sm" className="h-10 bg-white text-black hover:bg-zinc-200 rounded-full text-[9px] font-bold uppercase tracking-widest px-8 shadow-2xl transition-all">Capture Frame</Button>
                                                <Button size="icon" variant="outline" className="h-10 w-10 border-zinc-800 bg-black/40 text-white rounded-full"><Maximize2 size={16} /></Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vision Body */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Scanning Visualizer */}
                                        <div className="w-full h-full relative opacity-40">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0,transparent_100%)]" />
                                            <div className="absolute top-1/4 left-1/3 w-[300px] h-[400px] border border-blue-500/20 rounded-[40px] flex items-center justify-center">
                                                <div className="text-[10px] font-mono text-blue-500 animate-pulse uppercase tracking-[0.4em]">Tracking Entity #419</div>
                                            </div>
                                        </div>
                                        <div className="text-zinc-900 font-bold text-[11px] uppercase tracking-[1em] opacity-30 select-none">Aragorn Edge Vision Proxy</div>
                                    </div>

                                    {/* Scan Line */}
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-[scan_8s_linear_infinite]" />
                                </div>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="progress" key="progress" className="m-0 focus-visible:outline-none">
                        <Card className="bg-zinc-900/20 border-zinc-800 border-none shadow-3xl p-10">
                            <div className="space-y-10">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-[0.1em]">Site Completion Matrix</h3>
                                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">Real-time photogrammetric estimation</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-4xl font-bold text-white tracking-tighter">{avgProgress}%</p>
                                        <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Project Average</p>
                                    </div>
                                </div>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={zones} layout="vertical" margin={{ left: 0, right: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis dataKey="name" type="category" width={100} fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b', fontWeight: 'bold'}} />
                                            <Tooltip 
                                                cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                                contentStyle={{ borderRadius: '20px', background: '#0a0a0a', border: '1px solid #18181b', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '15px' }}
                                            />
                                            <Bar dataKey="progress_percent" radius={[0, 20, 20, 0]} barSize={25} name="Completion %">
                                                {zones.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ledger" key="ledger" className="m-0 focus-visible:outline-none">
                        <Card className="bg-zinc-900/20 border-none shadow-3xl overflow-hidden">
                            <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-950/80 sticky top-0 z-10">
                                        <tr className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-600 border-b border-zinc-900">
                                            <th className="px-10 py-6">Event Context</th>
                                            <th className="px-10 py-6">Sector</th>
                                            <th className="px-10 py-6">Confidence</th>
                                            <th className="px-10 py-6">Timestamp</th>
                                            <th className="px-10 py-6 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900/50">
                                        {detections.map((det) => (
                                            <tr key={det.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-2 w-2 rounded-full ${det.severity === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                        <div className="space-y-1">
                                                            <p className="text-[11px] font-bold text-white uppercase tracking-tight">{det.type.replace('_', ' ')}</p>
                                                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{det.details?.issue || 'Detected'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{det.zones?.name || 'Unknown'}</td>
                                                <td className="px-10 py-6 font-mono text-[10px] text-blue-500">{(det.details?.confidence * 100 || 94).toFixed(1)}%</td>
                                                <td className="px-10 py-6 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(det.created_at))} ago</td>
                                                  <td className="px-10 py-6 text-right">
                                                      <span className={`text-[8px] uppercase tracking-widest border border-zinc-800 bg-zinc-900 px-3 py-1 rounded-full ${det.severity === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                                                          {det.severity}
                                                      </span>
                                                  </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            {/* Image Upload Section */}
            {selectedSite && (
              <ImageUpload 
                siteId={selectedSite.id} 
                zoneId={zones[0]?.id}
                onUploadComplete={(result) => {
                  // Refresh data after successful analysis
                  if (result?.refresh || result?.success) {
                    fetchSiteDetails(selectedSite.id);
                    toast.success("Dashboard updated with latest analysis");
                  }
                }}
              />
            )}

            {/* Velocity Trends */}
            <Card className="bg-zinc-900/20 border-none shadow-3xl p-10">
                <div className="space-y-10">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-[0.1em]">{t.velocity}</h3>
                            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">Predictive vs actual project velocity</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-600" />
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full border border-zinc-700 border-dashed" />
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">AI Target</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                <XAxis 
                                    dataKey="date" 
                                    fontSize={9} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{fill: '#3f3f46', fontWeight: 'bold'}}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })} 
                                />
                                <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#3f3f46', fontWeight: 'bold'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', background: '#0a0a0a', border: '1px solid #18181b', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '15px' }}
                                />
                                <Area type="monotone" dataKey="actual_velocity_mps" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorActual)" name="Actual velocity" />
                                <Line type="monotone" dataKey="predicted_velocity_mps" stroke="#27272a" strokeWidth={3} strokeDasharray="8 8" dot={false} name="AI Prediction" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>
          </div>

          {/* Right Column - AI Insights & Alerts */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* AI Predictive Intelligence Section */}
            <motion.div whileHover={{ y: -5 }}>
                <Card className="bg-blue-600 text-white border-none shadow-3xl shadow-blue-600/20 p-1">
                    <div className="bg-[#050505]/10 p-10 rounded-[40px] relative overflow-hidden">
                        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 blur-[60px] rounded-full pointer-events-none" />
                        
                        <div className="relative z-10 space-y-10">
                            <div className="flex justify-between items-center">
                                <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                                    <BrainCircuit size={24} className="text-white" />
                                </div>
                                <span className="bg-white/20 text-white border border-white/20 text-[8px] uppercase tracking-widest font-bold px-4 h-7 flex items-center justify-center rounded-full">Autonomous Mode</span>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">{t.aiInsights}</h3>
                                <p className="text-2xl md:text-3xl font-bold tracking-tight leading-[1.1]">
                                    {t.recommendation}
                                </p>
                            </div>

                            <div className="pt-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Aragorn LLM Engine • Analyzing Trends</span>
                                </div>
                                <Button className="w-full h-16 bg-white text-blue-600 hover:bg-zinc-100 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all transform hover:scale-[1.02]">
                                    Resolve Strategic Conflict
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Critical Real-time Alerts */}
            <Card className="bg-zinc-900/20 border-none shadow-3xl overflow-hidden">
                <CardHeader className="p-10 border-b border-zinc-900 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                            <AlertTriangle size={18} className="text-red-500" />
                            {t.alerts}
                        </CardTitle>
                    </div>
                    {alerts.length > 0 && <span className="bg-red-500/10 text-red-500 text-[8px] font-bold uppercase px-3 py-1 rounded-sm animate-pulse">{alerts.length} Active</span>}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[550px] overflow-y-auto no-scrollbar">
                        {alerts.length > 0 ? alerts.map((alert, i) => (
                            <div key={alert.id} className="p-10 border-b border-zinc-900/50 last:border-0 hover:bg-white/[0.02] transition-colors relative group">
                                <div className="flex gap-8">
                                    <div className={`h-14 w-14 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:scale-110 ${
                                        alert.severity === 'high' ? 'bg-red-600 text-white' : 
                                        alert.severity === 'medium' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                                    }`}>
                                        {alert.type === 'safety' ? <HardHat size={22} /> : 
                                         alert.type === 'progress' ? <Construction size={22} /> : <PackageCheck size={22} />}
                                    </div>
                                    <div className="space-y-3 pt-1">
                                        <p className="text-[13px] font-bold tracking-tight text-white leading-tight pr-10">{alert.message}</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(alert.created_at))} ago</span>
                                            <span className={`bg-zinc-900 border border-zinc-800 text-[8px] font-bold uppercase px-2 h-5 tracking-widest flex items-center rounded-full ${alert.severity === 'high' ? 'text-red-500' : 'text-zinc-500'}`}>{alert.severity}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" className="absolute top-10 right-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-white text-[9px] font-bold uppercase tracking-widest">
                                    Ignore
                                </Button>
                            </div>
                        )) : (
                            <div className="py-32 text-center text-zinc-800 uppercase tracking-[0.8em] font-bold text-[10px]">No Active Violations</div>
                        )}
                    </div>
                    <Button variant="ghost" className="w-full rounded-none h-20 text-[10px] uppercase font-bold tracking-[0.3em] text-zinc-700 hover:bg-white/5 border-t border-zinc-900">
                        Historical Log Archive
                    </Button>
                </CardContent>
            </Card>

            {/* Site Inventory Status */}
            <Card className="bg-zinc-900/20 border-none shadow-3xl p-10">
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 text-white">
                            <PackageCheck size={18} className="text-blue-500" />
                            {t.materials}
                        </h3>
                        <Button variant="ghost" className="h-auto p-0 text-[9px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white">Expand</Button>
                    </div>
                    <div className="space-y-6">
                        {materials.slice(0, 3).map((mat, i) => (
                            <div key={i} className="flex justify-between items-center bg-zinc-950/40 p-5 rounded-2xl border border-white/5 group hover:border-blue-500/20 transition-all">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">{mat.material_name}</p>
                                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{mat.quantity}</p>
                                </div>
                                <span className={`bg-zinc-900 border border-zinc-800 text-[8px] font-bold uppercase px-3 h-7 tracking-widest flex items-center rounded-full ${mat.status === 'verified' ? 'text-green-500' : 'text-red-500'}`}>
                                    {mat.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

          </div>
        </div>

        {/* Global Footer Overlay */}
        <footer className="pt-20 pb-10 flex flex-col md:flex-row justify-between items-center gap-10 opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-600">
                <Construction size={14} className="text-blue-600" />
                <span>Aragorn AI Construction Platform © 2026</span>
            </div>
            <div className="flex gap-10 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                <a href="#" className="hover:text-blue-500 transition-colors">Safety Protocol</a>
                <a href="#" className="hover:text-blue-500 transition-colors">Edge Documentation</a>
                <a href="#" className="hover:text-blue-500 transition-colors">System Health</a>
            </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100vh); }
          100% { transform: translateY(0); }
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .rtl {
          direction: rtl;
        }
        .ltr {
          direction: ltr;
        }

        @font-face {
            font-family: 'Tesla';
            src: local('Gotham'), local('Arial');
        }

        body {
            background-color: #050505;
            color: white;
        }

        .shadow-3xl {
            box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  );
}

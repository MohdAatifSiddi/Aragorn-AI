"use client";

import React, { useState, useEffect } from "react";
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
  RefreshCcw
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchInitialData();

    // Set up realtime subscriptions
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
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: sitesData, error: sitesError } = await supabase.from('sites').select('*');
      if (sitesError) throw sitesError;

      if (sitesData && sitesData.length > 0) {
        setSites(sitesData);
        setSelectedSite(sitesData[0]);
        await fetchSiteDetails(sitesData[0].id);
      } else {
        // Fallback for demo: ensure we have something to show
        toast.info("No sites found. Initializing demo site...");
        const demoSiteId = "1d1c2a8c-b6fa-4dc9-b09c-109d15f86750";
        const { data: site } = await supabase.from('sites').select('*').eq('id', demoSiteId).single();
        if (site) {
          setSites([site]);
          setSelectedSite(site);
          await fetchSiteDetails(site.id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching initial data:", error);
      toast.error("Connectivity issue. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteDetails = async (siteId: string) => {
    const [zonesRes, alertsRes, materialsRes, statsRes, detectionsRes] = await Promise.all([
      supabase.from('zones').select('*').eq('site_id', siteId),
      supabase.from('alerts').select('*').eq('site_id', siteId).order('created_at', { ascending: false }),
      supabase.from('material_verifications').select('*').eq('site_id', siteId).order('created_at', { ascending: false }),
      supabase.from('project_stats').select('*').eq('site_id', siteId).order('date', { ascending: true }),
      supabase.from('detections').select('*, zones(name)').order('created_at', { ascending: false }).limit(20)
    ]);

    if (zonesRes.data) setZones(zonesRes.data);
    if (alertsRes.data) setAlerts(alertsRes.data);
    if (materialsRes.data) setMaterials(materialsRes.data);
    if (statsRes.data) setStats(statsRes.data);
    if (detectionsRes.data) setDetections(detectionsRes.data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const refreshData = () => {
    if (selectedSite) fetchSiteDetails(selectedSite.id);
    toast.success("Dashboard Refreshed");
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Construction className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-sm uppercase tracking-[0.5em] mb-2">Aragorn AI</p>
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest animate-pulse">Establishing Secure Edge Link</p>
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
      recommendation: "Predicted delay in Zone 3 due to supply chain bottleneck. Recommendation: Reallocate labor to Zone 1 finishing to maintain velocity.",
      viewFull: "View Detailed Report",
      complianceTrend: "Compliance Trend",
      growth: "+2.1% improvement",
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
      recommendation: "सप्लाई चेन की बाधा के कारण जोन 3 में देरी की भविष्यवाणी। सिफारिश: गति बनाए रखने के लिए श्रमिकों को जोन 1 फिनिशिंग में पुन: आवंटित करें।",
      viewFull: "विस्तृत रिपोर्ट देखें",
      complianceTrend: "अनुपालन रुझान",
      growth: "+2.1% सुधार",
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
      recommendation: "سپلائی چین کی رکاوٹ کی وجہ سے زون 3 میں تاخیر کی پیش گوئی۔ سفارش: رفتار کو برقرار رکھنے کے لیے لیبر کو زون 1 کی فنشنگ میں دوبارہ منتقل کریں۔",
      viewFull: "تفصیلی رپورٹ دیکھیں",
      complianceTrend: "تعمیل کا رجحان",
      growth: "+2.1٪ بہتری",
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

  const currentSafety = stats.length > 0 ? stats[stats.length - 1].safety_compliance_percent : 0;
  const avgProgress = zones.length > 0 ? Math.round(zones.reduce((acc, z) => acc + z.progress_percent, 0) / zones.length) : 0;
  const activeZonesCount = zones.filter(z => z.status === 'active').length;
  const highAlerts = alerts.filter(a => a.severity === 'high' && !a.is_resolved).length;

  return (
    <div className={`min-h-screen bg-[#0a0a0a] p-4 md:p-8 ${lang === 'ur' ? 'rtl' : 'ltr'} font-sans antialiased selection:bg-blue-500/30 text-white`}>
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className={`flex items-center gap-5 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-600/20"
            >
              <Construction className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase flex items-center gap-3">
                {t.title}
                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.3em] border-white/10 text-zinc-400 bg-white/5 px-3">Edge v2.0</Badge>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-3 w-3 text-blue-500" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{selectedSite?.name || t.tagline} • {selectedSite?.location || 'India'}</p>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 w-full md:w-auto ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              className="rounded-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 h-10 w-10 p-0"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLang(lang === 'en' ? 'hi' : lang === 'hi' ? 'ur' : 'en')}
              className="flex items-center gap-3 rounded-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 shadow-sm px-6 h-10 text-[10px] font-bold uppercase tracking-widest"
            >
              <Globe className="h-4 w-4 text-blue-500" />
              {lang === 'en' ? "English" : lang === 'hi' ? "हिंदी" : "اردو"}
            </Button>
            
            <div className="flex items-center gap-3 bg-zinc-900/80 p-1.5 pr-4 rounded-full border border-zinc-800 shadow-xl ml-auto md:ml-0">
               <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[10px]">
                 {user?.email?.[0].toUpperCase()}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 truncate max-w-[120px]">{user?.email?.split('@')[0]}</span>
               <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="h-7 w-7 rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { title: t.safety, value: `${currentSafety}%`, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10", progress: currentSafety },
            { title: t.progress, value: `${avgProgress}%`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", progress: avgProgress },
            { title: t.activeZones, value: `${activeZonesCount}`, icon: Layers, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Operational Zones" },
            { title: t.alerts, value: alerts.filter(a => !a.is_resolved).length.toString().padStart(2, '0'), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", badge: highAlerts > 0 ? `${highAlerts} High` : null }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-none bg-zinc-900/50 hover:bg-zinc-900 transition-all border border-white/5 shadow-2xl overflow-hidden group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                      <div className={`${stat.bg} ${stat.color} p-2 rounded-xl`}>
                        <stat.icon size={22} />
                      </div>
                      {stat.badge && <Badge variant="destructive" className="animate-pulse text-[8px] uppercase tracking-widest px-2">{stat.badge}</Badge>}
                  </div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">{stat.title}</h3>
                  <div className="text-3xl font-bold tracking-tighter text-white">{stat.value}</div>
                  
                  {stat.progress !== undefined ? (
                    <div className="mt-5 space-y-2">
                        <Progress value={stat.progress} className="h-1 bg-white/5" indicatorClassName={stat.color.replace('text', 'bg')} />
                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                          <span>0%</span>
                          <span>Target 100%</span>
                        </div>
                    </div>
                  ) : (
                    <div className="mt-5 text-[9px] text-zinc-500 flex items-center gap-2 uppercase font-bold tracking-widest">
                        <Activity size={12} className="text-blue-500" />
                        {stat.desc || "Live Data Stream"}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Zone Progress Card */}
            <Card className="border-none bg-zinc-900/40 border border-white/5 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Construction size={18} className="text-blue-500" />
                    {t.zoneProgress}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white">Zones</Button>
                   <Button variant="ghost" size="sm" className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white">Filters</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zones} layout="vertical" margin={{ left: 0, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={100} fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#71717a', fontWeight: 'bold'}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.02)'}}
                        contentStyle={{ borderRadius: '16px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="progress_percent" radius={[0, 12, 12, 0]} barSize={22} name="Progress %">
                        {zones.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Vision Feed & Logs Section */}
            <Tabs defaultValue="feed" className="w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <TabsList className="bg-zinc-900 p-1 rounded-full border border-white/5 h-12 flex">
                  <TabsTrigger value="feed" className="rounded-full px-8 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 text-[10px] uppercase font-bold tracking-widest transition-all">
                    <Camera size={14} className="mr-2" />
                    {t.realtimeFeed}
                  </TabsTrigger>
                  <TabsTrigger value="detections" className="rounded-full px-8 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 text-[10px] uppercase font-bold tracking-widest transition-all">
                    <Scan size={14} className="mr-2" />
                    {t.detections}
                  </TabsTrigger>
                  <TabsTrigger value="materials" className="rounded-full px-8 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 text-[10px] uppercase font-bold tracking-widest transition-all">
                    <PackageCheck size={14} className="mr-2" />
                    {t.materials}
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                   Edge Status: Optimal
                </div>
              </div>

              <AnimatePresence mode="wait">
                <TabsContent value="feed" key="feed">
                   <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                      <Card className="border-none bg-black overflow-hidden relative shadow-2xl group border border-white/5">
                        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent">
                           <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <Badge className="bg-red-600 hover:bg-red-700 text-[9px] uppercase tracking-widest px-3 py-1 animate-pulse border-none">Live Vision Feed</Badge>
                                <span className="text-white text-[10px] font-mono tracking-widest uppercase font-bold">{zones[1]?.name || "Zone 2"} • NODE_X_09</span>
                              </div>
                              <p className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-bold">Latency: 42ms • Resolution: 4K • RTSP_OVER_SSL</p>
                           </div>
                           <div className="flex gap-2">
                              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white border-none"><Maximize2 size={14} /></Button>
                           </div>
                        </div>

                        <div className="aspect-video relative flex items-center justify-center bg-zinc-950/50">
                            {/* Scanning Line Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent h-1/3 w-full top-0 animate-[scan_6s_linear_infinite]" />
                            
                            {/* HUD Overlay */}
                            <div className="absolute top-1/4 left-1/4 w-40 h-56 border border-blue-500/30 rounded-lg p-2 flex flex-col justify-between backdrop-blur-[1px]">
                               <div className="flex flex-col gap-1">
                                  <span className="bg-blue-600 text-[8px] text-white px-2 py-0.5 rounded-sm uppercase font-bold tracking-tighter w-fit">PERSON_ID: #209</span>
                                  <span className="text-blue-400 text-[8px] font-mono">CONF: 98.4%</span>
                               </div>
                               <div className="text-[8px] font-mono text-blue-300">PPE_STATUS: <span className="text-green-400">VERIFIED</span></div>
                            </div>

                            <div className="absolute bottom-1/3 right-1/3 w-32 h-44 border border-red-500/30 rounded-lg p-2 flex flex-col justify-between backdrop-blur-[1px] bg-red-500/5">
                               <div className="flex flex-col gap-1">
                                  <span className="bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-sm uppercase font-bold tracking-tighter w-fit">VIOLATION: NO_VEST</span>
                                  <span className="text-red-400 text-[8px] font-mono">CONF: 91.2%</span>
                               </div>
                               <div className="text-[8px] font-mono text-red-300">ALERT_DISPATCHED: <span className="animate-pulse">YES</span></div>
                            </div>

                            <div className="text-zinc-800 font-mono text-[10px] tracking-[0.6em] uppercase select-none opacity-20">Aragorn Edge Vision Proxy</div>
                        </div>

                        <div className="p-6 bg-zinc-900 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                           <div className="flex gap-3 w-full md:w-auto">
                              <Button size="sm" className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[10px] uppercase font-bold tracking-widest px-6 shadow-lg shadow-blue-600/20 border-none transition-transform active:scale-95">Recalibrate Sensors</Button>
                              <Button size="sm" variant="outline" className="h-10 border-white/10 text-zinc-400 hover:bg-white hover:text-black rounded-full text-[10px] uppercase font-bold tracking-widest px-6 transition-all">Capture Snapshot</Button>
                           </div>
                           <div className="flex items-center gap-6 text-zinc-500 text-[9px] font-mono tracking-[0.2em] uppercase font-bold">
                              <span>32.190° N</span>
                              <div className="h-1 w-1 rounded-full bg-zinc-700" />
                              <span>74.120° E</span>
                           </div>
                        </div>
                      </Card>
                   </motion.div>
                </TabsContent>

                <TabsContent value="detections" key="detections">
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <Card className="border-none bg-zinc-900/40 border border-white/5 shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 px-6 py-5">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <History size={16} className="text-blue-500" />
                            Site Detections Archive
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                           <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                              <table className="w-full text-left">
                                <thead className="bg-black/20 sticky top-0 z-10">
                                  <tr className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500 border-b border-white/5">
                                    <th className="px-6 py-4">Detection Type</th>
                                    <th className="px-6 py-4">Zone</th>
                                    <th className="px-6 py-4">Confidence</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Time</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {detections.length > 0 ? detections.map((det) => (
                                    <tr key={det.id} className="hover:bg-white/5 transition-colors group">
                                      <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-bold uppercase tracking-tight text-white">{det.type.replace('_', ' ')}</span>
                                          <span className="text-[9px] text-zinc-500 font-medium">{det.details?.issue || 'Object detected'}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{det.zones?.name || 'Unknown Zone'}</td>
                                      <td className="px-6 py-4 font-mono text-[10px] text-blue-500">{(det.details?.confidence * 100 || 94).toFixed(1)}%</td>
                                      <td className="px-6 py-4">
                                        <Badge variant="outline" className={`text-[8px] uppercase tracking-widest border-none px-0 ${det.severity === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                                          {det.severity}
                                        </Badge>
                                      </td>
                                      <td className="px-6 py-4 text-right text-[10px] text-zinc-600 font-bold">{formatDistanceToNow(new Date(det.created_at))} ago</td>
                                    </tr>
                                  )) : (
                                    <tr>
                                      <td colSpan={5} className="py-20 text-center text-xs text-zinc-600 uppercase tracking-widest font-bold opacity-30">Waiting for detection events...</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                           </div>
                        </CardContent>
                      </Card>
                   </motion.div>
                </TabsContent>

                <TabsContent value="materials" key="materials">
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <Card className="border-none bg-zinc-900/40 border border-white/5 shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 px-6 py-5">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <PackageCheck size={16} className="text-blue-500" />
                            Inventory & Material Verification
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                           <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                              <table className="w-full text-left">
                                <thead className="bg-black/20 sticky top-0 z-10">
                                  <tr className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500 border-b border-white/5">
                                    <th className="px-6 py-4">{t.matID}</th>
                                    <th className="px-6 py-4">{t.matItem}</th>
                                    <th className="px-6 py-4">{t.matQty}</th>
                                    <th className="px-6 py-4">{t.matStatus}</th>
                                    <th className="px-6 py-4 text-right">Log Time</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {materials.length > 0 ? materials.map((item) => (
                                    <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                      <td className="px-6 py-4 font-mono text-[10px] opacity-30">{item.id.slice(0, 8)}</td>
                                      <td className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white">{item.material_name}</td>
                                      <td className="px-6 py-4 text-xs font-bold text-zinc-500">{item.quantity}</td>
                                      <td className="px-6 py-4">
                                        <Badge variant="outline" 
                                               className={`text-[8px] uppercase tracking-widest h-6 px-3 rounded-full font-bold border-none ${item.status === 'verified' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                          {item.status}
                                        </Badge>
                                      </td>
                                      <td className="px-6 py-4 text-right text-[10px] text-zinc-600 font-bold">{formatDistanceToNow(new Date(item.created_at))} ago</td>
                                    </tr>
                                  )) : (
                                    <tr>
                                      <td colSpan={5} className="py-20 text-center text-xs text-zinc-600 uppercase tracking-widest font-bold opacity-30">No material verifications recorded</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                           </div>
                        </CardContent>
                      </Card>
                   </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>

            {/* Velocity Trend Section */}
            <Card className="border-none bg-zinc-900/40 border border-white/5 shadow-2xl">
                <CardHeader className="border-b border-white/5 pb-6">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <TrendingUp size={18} className="text-blue-500" />
                    {t.velocity}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-10">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{fill: '#52525b', fontWeight: 'bold'}}
                          tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })} 
                        />
                        <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b', fontWeight: 'bold'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="actual_velocity_mps" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" name="Actual MPS" />
                        <Line type="monotone" dataKey="predicted_velocity_mps" stroke="#52525b" strokeWidth={2} strokeDasharray="6 6" dot={false} name="AI Predicted" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
            </Card>
          </div>

          {/* Right Content (Sidebar) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Predictive AI Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="bg-blue-600 text-white border-none shadow-2xl shadow-blue-600/30 relative overflow-hidden group p-1">
                 <div className="bg-white/10 p-7 rounded-[calc(var(--radius)-4px)] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{backgroundImage: 'repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 15px)', backgroundSize: '20px 20px'}} />
                    
                    <div className="relative z-10">
                      <div className="bg-white/20 w-fit p-2.5 rounded-xl mb-6 backdrop-blur-md">
                          <Zap size={22} className="text-white fill-white" />
                      </div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-4">{t.aiInsights}</h3>
                      <p className="text-xl md:text-2xl leading-tight font-bold mb-10 tracking-tight">
                          {t.recommendation}
                      </p>
                      
                      <div className="space-y-6">
                          <div className="flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-blue-300 animate-ping" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">AWS Bedrock Engine • Active</span>
                          </div>
                          <Button variant="secondary" className="w-full h-12 text-[10px] uppercase tracking-[0.2em] font-bold bg-white text-blue-600 hover:bg-zinc-100 border-none rounded-full shadow-2xl transition-all transform hover:scale-[1.02]">
                            {t.viewFull}
                          </Button>
                      </div>
                    </div>
                 </div>
              </Card>
            </motion.div>

            {/* Critical Alerts Card */}
            <Card className="border-none bg-zinc-900/40 border border-white/5 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 px-6 py-5">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                  <AlertTriangle size={18} className="text-red-500" />
                  {t.alerts}
                </CardTitle>
                {alerts.filter(a => !a.is_resolved).length > 0 && (
                   <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] uppercase tracking-widest animate-pulse px-2">{alerts.filter(a => !a.is_resolved).length} Unresolved</Badge>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                  {alerts.length > 0 ? alerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="p-6 flex gap-5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group relative">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105 ${
                        alert.severity === 'high' ? 'bg-red-600 text-white' : 
                        alert.severity === 'medium' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {alert.type === 'safety' ? <HardHat size={22} /> : 
                         alert.type === 'progress' ? <Construction size={22} /> : <PackageCheck size={22} />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="text-[13px] font-bold tracking-tight text-white leading-tight pr-8">{alert.message}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(alert.created_at))} ago</span>
                          <div className="h-1 w-1 rounded-full bg-zinc-800" />
                          <Badge variant="secondary" className="text-[8px] uppercase tracking-widest h-4 px-2 rounded-sm bg-zinc-800 border-none font-bold text-zinc-400">{alert.severity}</Badge>
                        </div>
                        
                        <Button variant="ghost" className="absolute top-6 right-6 h-auto p-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-white text-[9px] font-bold uppercase tracking-widest">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="py-24 text-center text-xs text-zinc-600 uppercase tracking-widest font-bold opacity-30">All systems clear</div>
                  )}
                </div>
                <Button variant="ghost" className="w-full rounded-t-none text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold py-6 hover:bg-white/5 border-t border-white/5 transition-all">
                  Archive History
                </Button>
              </CardContent>
            </Card>

            {/* Compliance Trend Line Chart */}
            <Card className="border-none bg-zinc-900/40 border border-white/5 shadow-2xl">
              <CardHeader className="px-6 pt-6">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                  <ShieldCheck size={18} className="text-green-500" />
                  {t.complianceTrend}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="h-[140px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats}>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="safety_compliance_percent" 
                        stroke="#10b981" 
                        strokeWidth={4} 
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }} 
                        name="Compliance %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-bold">
                  <div className="flex items-center gap-2 text-green-500">
                    <TrendingUp size={12} />
                    {t.growth}
                  </div>
                  <div className="text-zinc-600">{t.last24}</div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(300%); }
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
          text-align: right;
        }
        .ltr {
          direction: ltr;
          text-align: left;
        }
      `}</style>
    </div>
  );
}

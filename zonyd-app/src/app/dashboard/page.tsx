'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Music, Wallet, PieChart, Users, Globe, 
  Sparkles, Link as LinkIcon, Settings, HeadphonesIcon,
  Search, Bell, Plus, ChevronRight, PlayCircle, SplitSquareVertical,
  Megaphone, CreditCard, TrendingUp, DollarSign, BarChart3, Share2, Zap, Loader2, MoreVertical,
  Activity, ShieldCheck, MapPin, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Los datos se cargarán dinámicamente del backend
const data: any[] = [];

import { authFetch } from '@/lib/api';

export default function DashboardPage() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [stats, setStats] = useState({
    revenue: 0,
    streams: 0,
    activeReleases: 0,
    nextPayout: 0
  });
  const [recentReleases, setRecentReleases] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsData, releasesData] = await Promise.all([
        authFetch('/api/stats'),
        authFetch('/api/releases')
      ]);
      
      if (statsData) {
        setStats({
          revenue: statsData.revenue || 0,
          streams: statsData.streams || 0,
          activeReleases: statsData.activeReleases || 0,
          nextPayout: statsData.nextPayout || 0
        });
      }

      if (Array.isArray(releasesData)) {
        setRecentReleases(releasesData.slice(0, 5));
      } else {
        setRecentReleases([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 selection:bg-[#4F8CFF] selection:text-white pb-4 md:pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 HEADER PREMIUM */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
           <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-white">Dashboard</h1>
           <p className="text-[#A1A1AA] text-xs md:text-sm mt-1">Bienvenido de nuevo. Tu arsenal está listo.</p>
        </div>

        <Link href="/dashboard/releases/new" className="hidden sm:block">
           <Button className="bg-[#FF9F0A] text-black font-black px-6 md:px-10 h-12 md:h-14 rounded-2xl shadow-xl shadow-[#FF9F0A]/20 hover:scale-105 transition-all group text-sm">
              <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" /> NUEVO LANZAMIENTO
           </Button>
        </Link>
      </div>

      {/* 📊 KPI GRID — 2 cols en mobile, 4 en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
         <MetricCard title="Ingresos Totales" value={`$${stats.revenue.toLocaleString()}`} change="+14.5%" trend="up" icon={<DollarSign className="text-[#32D74B]" size={18} />} />
         <MetricCard title="Streams Totales" value="1.2M" change="+22.1%" trend="up" icon={<Activity className="text-[#4F8CFF]" size={18} />} />
         <MetricCard title="SmartLinks Activos" value="24" change="+3" trend="up" icon={<LinkIcon className="text-[#FF9F0A]" size={18} />} />
         <MetricCard title="Próximo Pago" value={`$${stats.nextPayout.toLocaleString()}`} change="Money Monday" trend="none" icon={<Wallet className="text-[#BF5AF2]" size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 📈 COLUMNA PRINCIPAL (8/12) */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Gráfico de Performance */}
           <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
              <CardHeader className="bg-black/20 p-6 border-b border-white/5 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Rendimiento Semanal</CardTitle>
                    <p className="text-[10px] text-[#A1A1AA] mt-1">Streaming Global - Datos en tiempo real</p>
                 </div>
                 <BarChart3 className="text-[#4F8CFF]" size={18} />
              </CardHeader>
              <CardContent className="p-8 h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#3A3A3C', fontWeight: 700}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#3A3A3C', fontWeight: 700}} />
                       <Tooltip contentStyle={{backgroundColor: '#0B0B0F', border: '1px solid #232733', borderRadius: '12px'}} />
                       <Area type="monotone" dataKey="streams" stroke="#4F8CFF" strokeWidth={4} fill="url(#colorStreams)" animationDuration={2000} />
                    </AreaChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           {/* Lanzamientos Recientes */}
           <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
              <CardHeader className="border-b border-white/5 p-6 bg-black/20">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-[#A1A1AA]">Catálogo Reciente</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 {recentReleases.length === 0 ? (
                    <div className="p-12 text-center">
                       <Music size={40} className="text-[#232733] mx-auto mb-4 opacity-20" />
                       <p className="text-[#232733] font-black uppercase tracking-[0.2em]">Cero lanzamientos detectados</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {recentReleases.map((rel, i) => (
                          <div key={i} className="p-5 hover:bg-white/5 transition-all flex items-center justify-between group">
                             <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/5 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                   <img src={rel.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&h=100&fit=crop"} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="font-bold text-white text-base group-hover:text-[#FF9F0A] transition-colors">{rel.title}</p>
                                   <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-black mt-1">Lanzado: {new Date(rel.createdAt).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-[#A1A1AA] hover:text-[#FF9F0A] rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(`https://zonyd.com/release/${rel.id}`);
                                    alert('Enlace de lanzamiento copiado al portapapeles');
                                  }}
                                >
                                   <Share2 size={16} />
                                </Button>
                                <StatusBadge status={rel.status} />
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* 🏁 COLUMNA LATERAL (4/12) - FASE 7 */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Pipeline de Producción */}
           <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl border-t-4 border-t-[#4F8CFF]">
              <CardHeader className="bg-black/20 p-6 border-b border-white/5">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Producción en Vivo</CardTitle>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tracking</span>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <PipelineStep label="Validación de Audio" status="complete" icon={<Music size={14} />} />
                 <PipelineStep label="Auditoría Copyright" status="complete" icon={<ShieldCheck size={14} />} />
                 <PipelineStep label="Empaquetado DDEX" status="loading" icon={<Zap size={14} />} />
                 <PipelineStep label="Carga a Tiendas" status="pending" icon={<Globe size={14} />} />
                 
                 <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-black uppercase text-[#A1A1AA] mb-2">
                       <span>Progreso Total</span>
                       <span>65%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-blue-500 to-[#7B61FF] w-[65%] rounded-full shadow-[0_0_10px_rgba(79,140,255,0.4)]" />
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* Live Activity Widget */}
           <Card className="bg-gradient-to-br from-[#0B0B0F] to-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden relative group border-r-4 border-r-[#FF9F0A]">
              <CardHeader className="p-6 pb-2">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-[#FF9F0A]">Actividad de Fans</CardTitle>
              </CardHeader>
               <CardContent className="p-6">
                 <div className="text-center py-6 text-[#A1A1AA]">
                   <Globe className="mx-auto mb-2 opacity-20" size={24} />
                   <p className="text-xs">No hay actividad reciente.</p>
                 </div>
               </CardContent>
           </Card>

           <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#7B61FF] to-[#4F8CFF] text-white shadow-2xl shadow-[#7B61FF]/20 relative overflow-hidden group cursor-pointer" onClick={() => setIsAIOpen(true)}>
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
                 <Sparkles size={100} />
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">AI Recommendation</p>
                 <h3 className="text-xl font-black italic leading-tight">"Tu audiencia en TikTok crece un 15% más rápido."</h3>
                 <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase">VER ESTRATEGIA <ChevronRight size={14} /></div>
              </div>
           </div>
        </div>
      </div>

      {/* Floating AI Assistant Bubble */}
      <AIAssistant isOpen={isAIOpen} setIsOpen={setIsAIOpen} />
    </div>
  );
}

function PipelineStep({ label, status, icon }: any) {
  const getStatusColor = () => {
    if (status === 'complete') return 'text-blue-500';
    if (status === 'loading') return 'text-[#FF9F0A]';
    return 'text-[#232733]';
  };

  const getStatusIcon = () => {
    if (status === 'complete') return <CheckCircle2 size={12} className="text-blue-500" />;
    if (status === 'loading') return <Loader2 size={12} className="text-[#FF9F0A] animate-spin" />;
    return <div className="w-1.5 h-1.5 rounded-full bg-[#232733]" />;
  };

  return (
    <div className="flex items-center gap-4">
       <div className={`p-2.5 rounded-xl bg-black/40 border border-white/5 ${getStatusColor()} shadow-inner`}>
          {icon}
       </div>
       <div className="flex-1">
          <p className={`text-[10px] font-black uppercase tracking-widest ${status === 'pending' ? 'text-[#232733]' : 'text-[#A1A1AA]'}`}>{label}</p>
       </div>
       <div className="shrink-0">
          {getStatusIcon()}
       </div>
    </div>
  );
}

function LiveItem({ location, action, avatar, time, dimmed = false }: any) {
  return (
    <div className={`flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10 ${dimmed ? 'opacity-40 hover:opacity-100' : ''}`}>
       <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
          <img src={avatar} className="w-full h-full object-cover" />
       </div>
       <div className="min-w-0">
          <p className="text-[10px] text-white font-bold italic truncate">Un fan en <span className="text-[#FF9F0A]">{location}</span></p>
          <p className="text-[9px] text-[#A1A1AA] mt-0.5">{action}</p>
       </div>
       <div className="ml-auto flex flex-col items-end gap-1">
          <Activity size={12} className={dimmed ? 'text-[#232733]' : 'text-[#FF9F0A] animate-pulse'} />
          <span className="text-[7px] font-black uppercase text-[#232733]">{time}</span>
       </div>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon }: any) {
  return (
    <Card className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 hover:border-[#4F8CFF]/30 transition-all group shadow-xl">
       <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-xl bg-white/5 transition-colors group-hover:bg-white/10">
             {icon}
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-[#32D74B]' : trend === 'down' ? 'text-[#FF453A]' : 'text-[#A1A1AA]'}`}>
             {change} {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingUp size={12} className="rotate-180" /> : null}
          </div>
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
       </div>
    </Card>
  );
}

function AIAssistant({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await authFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg })
      });
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Lo siento, mi conexión con el servidor de IA se ha interrumpido.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-[#151821] border border-[#7B61FF]/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col">
          <div className="bg-gradient-to-r from-[#7B61FF] to-[#4F8CFF] p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">Zonyd AI</p>
                <p className="text-[9px] text-white/70">Co-Manager Online</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full">
              <ChevronRight className="rotate-90" size={16} />
            </Button>
          </div>
          
          <div className="p-4 h-80 overflow-y-auto space-y-4 bg-[#0B0B0F]/50 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'ai' 
                ? 'bg-[#151821] border border-white/5 text-[#A1A1AA] rounded-tl-none mr-8' 
                : 'bg-[#7B61FF] text-white rounded-tr-none ml-8'
              }`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-1 p-2">
                <div className="w-1.5 h-1.5 bg-[#7B61FF] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-[#7B61FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-[#7B61FF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-[#0B0B0F]/50 flex gap-2 shrink-0">
            <input 
              type="text" 
              placeholder="Pregunta a Zonyd AI..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-[#151821] border border-[#232733] rounded-full px-4 py-2 text-xs outline-none focus:border-[#7B61FF] transition-all text-white"
            />
            <Button onClick={handleSend} size="icon" className="bg-[#7B61FF] rounded-full w-8 h-8 shrink-0">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-[#7B61FF] shadow-[0_0_30px_rgba(123,97,255,0.4)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <ChevronRight className="rotate-90" size={28} /> : <Sparkles size={28} />}
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'DRAFT': 'bg-[#A1A1AA]/10 text-[#A1A1AA] border-[#A1A1AA]/20',
    'PROCESSING': 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20 animate-pulse',
    'PENDING_APPROVAL': 'bg-[#4F8CFF]/10 text-[#4F8CFF] border-[#4F8CFF]/20',
    'APPROVED': 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20',
    'LIVE': 'bg-[#34C759] text-black font-black border-transparent shadow-[0_0_15px_rgba(52,199,89,0.4)]',
    'REJECTED': 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${styles[status] || styles['DRAFT']}`}>
      {status === 'PENDING_APPROVAL' ? 'REVISIÓN' : 
       status === 'PROCESSING' ? 'PROCESANDO' : 
       status === 'LIVE' ? 'EN TIENDAS' : status}
    </span>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Globe, 
  Users, 
  TrendingUp, 
  Zap, 
  Smartphone, 
  Layout, 
  ArrowUpRight,
  MapPin,
  Music,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const DATA_BY_RANGE: any = {
  '1 Semana': [
    { name: 'Lun', streams: 4500, prev: 3200 },
    { name: 'Mar', streams: 5200, prev: 3800 },
    { name: 'Mie', streams: 4800, prev: 4100 },
    { name: 'Jue', streams: 6100, prev: 4500 },
    { name: 'Vie', streams: 8500, prev: 6200 },
    { name: 'Sab', streams: 9200, prev: 7100 },
    { name: 'Dom', streams: 7800, prev: 5900 },
  ],
  '15 Días': [
    { name: 'D1', streams: 12000, prev: 10000 },
    { name: 'D4', streams: 15000, prev: 13000 },
    { name: 'D8', streams: 14000, prev: 15000 },
    { name: 'D12', streams: 19000, prev: 16000 },
    { name: 'D15', streams: 25000, prev: 18000 },
  ],
  '1 Mes': [
    { name: 'Sem 1', streams: 35000, prev: 30000 },
    { name: 'Sem 2', streams: 42000, prev: 38000 },
    { name: 'Sem 3', streams: 38000, prev: 40000 },
    { name: 'Sem 4', streams: 55000, prev: 45000 },
  ],
  '1 Año': [
    { name: 'Ene', streams: 120000, prev: 90000 },
    { name: 'Mar', streams: 150000, prev: 130000 },
    { name: 'May', streams: 180000, prev: 160000 },
    { name: 'Jul', streams: 220000, prev: 190000 },
    { name: 'Sep', streams: 280000, prev: 240000 },
    { name: 'Nov', streams: 350000, prev: 290000 },
  ],
  'Totales': [
    { name: '2023', streams: 1200000, prev: 800000 },
    { name: '2024', streams: 4500000, prev: 1200000 },
    { name: '2025', streams: 8900000, prev: 4500000 },
  ]
};

const PLATFORM_DATA = [
  { name: 'Spotify', value: 45, color: '#1DB954' },
  { name: 'Apple Music', value: 25, color: '#FA243C' },
  { name: 'TikTok', value: 20, color: '#00F2EA' },
  { name: 'YouTube', value: 10, color: '#FF0000' },
];

const TOP_LOCATIONS = [
  { city: 'Ciudad de México', country: 'MX', percentage: 32, color: '#FF9F0A' },
  { city: 'Madrid', country: 'ES', percentage: 18, color: '#FF453A' },
  { city: 'Bogotá', country: 'CO', percentage: 15, color: '#32D74B' },
  { city: 'Santiago', country: 'CL', percentage: 12, color: '#007AFF' },
  { city: 'Buenos Aires', country: 'AR', percentage: 10, color: '#5E5CE6' },
];

import { authFetch } from '@/lib/api';

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'streams' | 'listeners' | 'saves'>('streams');
  const [timeRange, setTimeRange] = useState('1 Semana');
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [apiStats, setApiStats] = useState<any>(null);

  const chartData = DATA_BY_RANGE[timeRange] || DATA_BY_RANGE['1 Semana'];

  const RANGES = ['1 Semana', '15 Días', '1 Mes', '1 Año', 'Totales'];

  useEffect(() => {
    setIsMounted(true);
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await authFetch('/api/stats');
      setApiStats(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  if (!isMounted) return <div className="p-8 h-screen bg-[#0B0B0F]" />;

  return (
    <div className="p-8 space-y-10 selection:bg-[#4F8CFF] selection:text-white pb-20">
      
      {/* 🚀 HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/10 flex items-center justify-center border border-[#4F8CFF]/20 shadow-[0_0_20px_rgba(79,140,255,0.1)]">
                 <BarChart3 className="text-[#4F8CFF]" size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Analíticas Pro</h1>
           </div>
           <p className="text-[#A1A1AA] text-sm">Visión 360° de tu impacto en el ecosistema digital.</p>
        </div>

        <div className="flex gap-2 relative">
           <div className="relative">
              <Button 
                onClick={() => setIsRangeOpen(!isRangeOpen)}
                variant="outline" 
                className={`border-[#232733] bg-[#151821] text-xs font-black rounded-xl h-12 px-6 transition-all uppercase tracking-widest ${isRangeOpen ? 'border-[#4F8CFF] text-[#4F8CFF]' : 'text-white hover:border-white/20'}`}
              >
                 <Calendar size={16} className="mr-3" /> {timeRange}
              </Button>

              {isRangeOpen && (
                <div className="absolute top-[110%] right-0 w-48 bg-[#151821] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
                   {RANGES.map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setTimeRange(range);
                          setIsRangeOpen(false);
                          // Aquí podrías disparar una recarga de datos real
                        }}
                        className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${timeRange === range ? 'bg-[#4F8CFF] text-white' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'}`}
                      >
                         {range}
                      </button>
                   ))}
                </div>
              )}
           </div>

           <Button className="bg-[#4F8CFF] text-white font-black px-6 h-12 rounded-xl shadow-lg shadow-[#4F8CFF]/20 hover:scale-105 transition-all">
              <Download size={16} className="mr-2" /> EXPORTAR PDF
           </Button>
        </div>
      </div>

      {/* 📊 KEY PERFORMANCE INDICATORS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard title="Total Streams" value="1.2M" change="+12.5%" trend="up" icon={<Music className="text-[#4F8CFF]" size={18} />} />
         <MetricCard title="Oyentes Mensuales" value="85.4K" change="+5.2%" trend="up" icon={<Users className="text-[#FF9F0A]" size={18} />} />
         <MetricCard title="Guardados (Saves)" value="12.1K" change="-1.4%" trend="down" icon={<Sparkles className="text-[#BF5AF2]" size={18} />} />
         <MetricCard title="Alcance Viral" value="4.2M" change="+24.8%" trend="up" icon={<Zap className="text-[#FFD60A]" size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 📈 MAIN CHART: STREAMING TREND */}
        <Card className="lg:col-span-8 bg-[#151821] border-[#232733] rounded-3xl overflow-hidden shadow-2xl relative">
           <CardHeader className="bg-black/20 p-6 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Rendimiento Global</CardTitle>
                 <CardDescription className="text-[10px] text-[#A1A1AA]">Comparativa de reproducciones contra el periodo anterior.</CardDescription>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setActiveMetric('streams')} className={`px-4 py-1 rounded-full text-[9px] font-black uppercase transition-all ${activeMetric === 'streams' ? 'bg-[#4F8CFF] text-white' : 'bg-white/5 text-[#A1A1AA] hover:text-white'}`}>Streams</button>
                 <button onClick={() => setActiveMetric('listeners')} className={`px-4 py-1 rounded-full text-[9px] font-black uppercase transition-all ${activeMetric === 'listeners' ? 'bg-[#4F8CFF] text-white' : 'bg-white/5 text-[#A1A1AA] hover:text-white'}`}>Oyentes</button>
              </div>
           </CardHeader>
           <CardContent className="p-8">
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#232733" vertical={false} />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fill: '#3A3A3C', fontSize: 10, fontWeight: 700}} 
                         dy={10}
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fill: '#3A3A3C', fontSize: 10, fontWeight: 700}}
                       />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0B0B0F', borderColor: '#232733', borderRadius: '12px', color: '#fff' }}
                         itemStyle={{ color: '#4F8CFF', fontSize: '12px', fontWeight: 'bold' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="streams" 
                         stroke="#4F8CFF" 
                         strokeWidth={4} 
                         fillOpacity={1} 
                         fill="url(#colorStreams)" 
                         animationDuration={2000}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="prev" 
                         stroke="#A1A1AA" 
                         strokeWidth={2} 
                         strokeDasharray="5 5" 
                         fill="transparent" 
                         animationDuration={2000}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </CardContent>
        </Card>

        {/* 📱 PLATFORM BREAKDOWN */}
        <Card className="lg:col-span-4 bg-[#151821] border-[#232733] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
           <CardHeader className="bg-black/20 p-6 border-b border-white/5">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Dominancia Digital</CardTitle>
              <CardDescription className="text-[10px] text-[#A1A1AA]">Distribución por plataforma de streaming.</CardDescription>
           </CardHeader>
           <CardContent className="p-8 flex-1 flex flex-col justify-center">
              <div className="h-[200px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={PLATFORM_DATA}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                       >
                          {PLATFORM_DATA.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white italic">100%</span>
                    <span className="text-[8px] text-[#A1A1AA] uppercase font-black">Market Share</span>
                 </div>
              </div>
              <div className="space-y-4 mt-8">
                 {PLATFORM_DATA.map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between group cursor-default">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color }} />
                          <span className="text-xs font-bold text-[#A1A1AA] group-hover:text-white transition-colors">{platform.name}</span>
                       </div>
                       <span className="text-xs font-black text-white italic">{platform.value}%</span>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 🗺️ GEOGRAPHIC IMPACT */}
        <Card className="lg:col-span-7 bg-[#151821] border-[#232733] rounded-3xl overflow-hidden shadow-2xl">
           <CardHeader className="bg-black/20 p-6 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Zonas de Influencia</CardTitle>
                 <CardDescription className="text-[10px] text-[#A1A1AA]">Ciudades con mayor densidad de reproducciones.</CardDescription>
              </div>
              <MapPin className="text-[#FF453A]" size={18} />
           </CardHeader>
           <CardContent className="p-8 space-y-6">
              {TOP_LOCATIONS.map((loc) => (
                <div key={loc.city} className="space-y-2">
                   <div className="flex justify-between items-end">
                      <div>
                         <span className="text-xs font-black text-white uppercase italic">{loc.city}</span>
                         <span className="text-[10px] text-[#A1A1AA] ml-2 font-bold">{loc.country}</span>
                      </div>
                      <span className="text-xs font-black text-[#4F8CFF] italic">{loc.percentage}%</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${loc.percentage}%`, backgroundColor: loc.color }} 
                      />
                   </div>
                </div>
              ))}
           </CardContent>
        </Card>

        {/* 🧠 ZONYD AI INSIGHTS CARD */}
        <div className="lg:col-span-5">
           <Card className="bg-gradient-to-br from-[#1E1E26] to-[#151821] border-[#232733] rounded-3xl overflow-hidden shadow-2xl h-full border-l-4 border-l-[#4F8CFF] relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Sparkles size={120} className="text-[#4F8CFF]" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/20 flex items-center justify-center border border-[#4F8CFF]/30">
                       <Zap className="text-[#4F8CFF]" size={20} fill="currentColor" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-white uppercase italic">Zonyd AI Co-Manager</h3>
                       <p className="text-[10px] text-[#4F8CFF] font-bold uppercase tracking-widest">Análisis Predictivo Activado</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <InsightItem 
                      text="Tus streams en Madrid han subido un 18%. Recomendamos una campaña de Meta Ads enfocada en esta zona para el próximo viernes." 
                    />
                    <InsightItem 
                      text="El 65% de tus oyentes descubren tu música a través de TikTok. El audio de 'Neon Nights' tiene potencial viral en Brasil." 
                    />
                    <InsightItem 
                      text="Los oyentes nocturnos (10PM - 2AM) son tu nicho más fiel. Considera un lanzamiento sorpresa en este horario." 
                    />
                 </div>

                 <Button className="w-full bg-[#151821] border border-white/10 hover:border-[#4F8CFF]/50 text-white font-black text-[10px] uppercase h-12 rounded-xl mt-4 transition-all">
                    SOLICITAR ESTRATEGIA COMPLETA
                 </Button>
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon }: any) {
  return (
    <Card className="bg-[#151821] border-[#232733] rounded-3xl p-6 hover:border-[#4F8CFF]/30 transition-all group shadow-xl">
       <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-xl bg-white/5 transition-colors group-hover:bg-white/10">
             {icon}
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-[#32D74B]' : 'text-[#FF453A]'}`}>
             {change} {trend === 'up' ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          </div>
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
       </div>
    </Card>
  );
}

function InsightItem({ text }: { text: string }) {
  return (
    <div className="flex gap-4 items-start p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-default group/item">
       <div className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF] mt-1.5 shrink-0 group-hover/item:scale-150 transition-transform" />
       <p className="text-xs text-[#A1A1AA] leading-relaxed group-hover/item:text-white transition-colors">{text}</p>
    </div>
  );
}

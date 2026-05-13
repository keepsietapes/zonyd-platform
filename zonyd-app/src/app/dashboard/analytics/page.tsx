'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Globe, Users, Zap, Music, Download, Calendar, Sparkles, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { authFetch } from '@/lib/api';

const RANGES = ['1 Semana', '15 Días', '1 Mes', '1 Año'];
const PLATFORM_COLORS: Record<string, string> = { 'Spotify': '#1DB954', 'Apple Music': '#FA243C', 'TikTok': '#00F2EA', 'YouTube': '#FF0000' };

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('1 Semana');
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalStreams: 0, monthlyListeners: 0, saves: 0, viralReach: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [topLocations, setTopLocations] = useState<any[]>([]);

  useEffect(() => { setIsMounted(true); fetchAnalytics(); }, []);
  useEffect(() => { if (isMounted) fetchAnalytics(); }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch(`/api/analytics?range=${encodeURIComponent(timeRange)}`);
      if (data) {
        setKpis({ totalStreams: data.totalStreams || 0, monthlyListeners: data.monthlyListeners || 0, saves: data.saves || 0, viralReach: data.viralReach || 0 });
        setChartData(Array.isArray(data.chart) ? data.chart : []);
        setPlatformData(Array.isArray(data.platforms) ? data.platforms : []);
        setTopLocations(Array.isArray(data.locations) ? data.locations : []);
      }
    } catch (err) { console.error('Error fetching analytics:', err); }
    finally { setIsLoading(false); }
  };

  const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K` : n.toLocaleString();
  const hasData = kpis.totalStreams > 0;

  if (!isMounted) return <div className="p-8 h-screen bg-[#0B0B0F]" />;

  const EmptyState = ({ icon: Icon, msg }: any) => (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Icon size={40} className="text-[#232733]" />
      <p className="text-[10px] font-black text-[#3A3A3C] uppercase tracking-widest">{msg}</p>
    </div>
  );

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/10 flex items-center justify-center border border-[#4F8CFF]/20">
              <BarChart3 className="text-[#4F8CFF]" size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Analíticas Pro</h1>
          </div>
          <p className="text-[#A1A1AA] text-sm">Visión 360° de tu impacto en el ecosistema digital.</p>
        </div>
        <div className="flex gap-2 relative">
          <div className="relative">
            <Button onClick={() => setIsRangeOpen(!isRangeOpen)} variant="outline" className="border-[#232733] bg-[#151821] text-xs font-black rounded-xl h-12 px-6 uppercase tracking-widest text-white hover:border-white/20">
              <Calendar size={16} className="mr-3" /> {timeRange}
            </Button>
            {isRangeOpen && (
              <div className="absolute top-[110%] right-0 w-48 bg-[#151821] border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {RANGES.map(r => (
                  <button key={r} onClick={() => { setTimeRange(r); setIsRangeOpen(false); }} className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${timeRange === r ? 'bg-[#4F8CFF] text-white' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'}`}>{r}</button>
                ))}
              </div>
            )}
          </div>
          <Button disabled={!hasData} className="bg-[#4F8CFF] text-white font-black px-6 h-12 rounded-xl disabled:opacity-40">
            <Download size={16} className="mr-2" /> EXPORTAR PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Streams', value: fmt(kpis.totalStreams), icon: <Music className="text-[#4F8CFF]" size={18} /> },
          { title: 'Oyentes Mensuales', value: fmt(kpis.monthlyListeners), icon: <Users className="text-[#FF9F0A]" size={18} /> },
          { title: 'Guardados (Saves)', value: fmt(kpis.saves), icon: <Sparkles className="text-[#BF5AF2]" size={18} /> },
          { title: 'Alcance Viral', value: fmt(kpis.viralReach), icon: <Zap className="text-[#FFD60A]" size={18} /> },
        ].map(card => (
          <Card key={card.title} className="bg-[#151821] border-[#232733] rounded-3xl p-6 hover:border-[#4F8CFF]/30 transition-all shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-white/5">{card.icon}</div>
              {!hasData && <span className="text-[9px] font-black text-[#3A3A3C] uppercase">Sin datos</span>}
            </div>
            <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">{card.title}</p>
            <p className={`text-3xl font-black italic tracking-tighter mt-1 ${!hasData ? 'text-[#232733]' : 'text-white'}`}>{hasData ? card.value : '—'}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main chart */}
        <Card className="lg:col-span-8 bg-[#151821] border-[#232733] rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="bg-black/20 p-6 border-b border-white/5">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Rendimiento Global</CardTitle>
            <CardDescription className="text-[10px] text-[#A1A1AA]">Reproducciones en el período seleccionado.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#4F8CFF]/30 border-t-[#4F8CFF] rounded-full animate-spin" />
                </div>
              ) : chartData.length === 0 ? (
                <EmptyState icon={BarChart3} msg="Sin datos de streaming — distribuye tu primera canción" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232733" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#3A3A3C', fontSize: 10, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#3A3A3C', fontSize: 10, fontWeight: 700}} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B0B0F', borderColor: '#232733', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="streams" stroke="#4F8CFF" strokeWidth={4} fillOpacity={1} fill="url(#colorStreams)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform breakdown */}
        <Card className="lg:col-span-4 bg-[#151821] border-[#232733] rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="bg-black/20 p-6 border-b border-white/5">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Dominancia Digital</CardTitle>
            <CardDescription className="text-[10px] text-[#A1A1AA]">Distribución por plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {platformData.length === 0 ? (
              <EmptyState icon={Globe} msg="Sin datos de plataformas aún" />
            ) : (
              <>
                <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={platformData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                        {platformData.map((e: any, i: number) => <Cell key={i} fill={PLATFORM_COLORS[e.name] || '#4F8CFF'} stroke="none" />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white italic">100%</span>
                    <span className="text-[8px] text-[#A1A1AA] uppercase font-black">Market Share</span>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  {platformData.map((p: any) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p.name] || '#4F8CFF' }} />
                        <span className="text-xs font-bold text-[#A1A1AA]">{p.name}</span>
                      </div>
                      <span className="text-xs font-black text-white italic">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Locations */}
      <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden shadow-2xl">
        <CardHeader className="bg-black/20 p-6 border-b border-white/5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Zonas de Influencia</CardTitle>
            <CardDescription className="text-[10px] text-[#A1A1AA]">Ciudades con mayor densidad de reproducciones.</CardDescription>
          </div>
          <MapPin className="text-[#FF453A]" size={18} />
        </CardHeader>
        <CardContent className="p-8">
          {topLocations.length === 0 ? (
            <EmptyState icon={MapPin} msg="Los datos geográficos aparecerán con tus primeras reproducciones" />
          ) : (
            <div className="space-y-6">
              {topLocations.map((loc: any) => (
                <div key={loc.city} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-black text-white uppercase italic">{loc.city}</span>
                      <span className="text-[10px] text-[#A1A1AA] ml-2 font-bold">{loc.country}</span>
                    </div>
                    <span className="text-xs font-black text-[#4F8CFF] italic">{loc.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#4F8CFF]" style={{ width: `${loc.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

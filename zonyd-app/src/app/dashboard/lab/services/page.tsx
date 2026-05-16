'use client';

import { useState } from 'react';
import { 
  Sparkles, Megaphone, Palette, Globe2, Ticket, 
  MessageSquare, Music, Camera, Zap, TrendingUp,
  Loader2, CheckCircle2, ChevronRight, Bot
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

const AGENTS = [
  { id: 'content', name: 'Content Factory', icon: Camera, color: '#E4405F', desc: 'Genera guiones y estrategias de contenido post-lanzamiento.', endpoint: '/api/lab/content/factory', method: 'POST', params: ['artistName', 'genre', 'platform'] },
  { id: 'trend', name: 'Trend Hunter', icon: TrendingUp, color: '#00F2FE', desc: 'Analiza tendencias virales actuales por género.', endpoint: '/api/lab/trend/hunter', method: 'GET', params: ['genre'] },
  { id: 'release', name: 'Release Command', icon: Zap, color: '#FF9F0A', desc: 'Optimiza la metadata y la narrativa de tu lanzamiento.', endpoint: '/api/lab/release/command', method: 'POST', params: ['artistName', 'trackName', 'genre'] },
  { id: 'predictor', name: 'Release Predictor', icon: Sparkles, color: '#34C759', desc: 'Predice el rendimiento de tu lanzamiento en la primera semana.', endpoint: '/api/lab/release/predictor', method: 'GET', params: ['artistName'] },
  { id: 'playlist', name: 'Playlist Attack', icon: Music, color: '#1DB954', desc: 'Genera pitches ultra-optimizados para curadores de Spotify.', endpoint: '/api/lab/playlist/attack', method: 'POST', params: ['artistName', 'trackName', 'genre'] },
  { id: 'visionary', name: 'Visionary', icon: Palette, color: '#FF3366', desc: 'Conceptos visuales y dirección de arte para portadas y videoclips.', endpoint: '/api/lab/visionary', method: 'POST', params: ['artistName', 'genre', 'trackMood'] },
  { id: 'growth', name: 'Growth Engine', icon: Megaphone, color: '#4F8CFF', desc: 'Estrategia de Ads (Meta/TikTok) para maximizar ROI.', endpoint: '/api/lab/growth', method: 'POST', params: ['genre', 'budget'] },
  { id: 'sync', name: 'Sync Bridge', icon: Globe2, color: '#8A2BE2', desc: 'Prepara tu música para oportunidades de cine y TV (Sync).', endpoint: '/api/lab/sync', method: 'POST', params: ['trackName', 'genre'] },
  { id: 'booking', name: 'Live Circuit', icon: Ticket, color: '#FFD700', desc: 'Pitches automáticos para promotores y festivales.', endpoint: '/api/lab/booking', method: 'POST', params: ['artistName', 'genre', 'region'] },
  { id: 'community', name: 'Fan Grid', icon: MessageSquare, color: '#00FA9A', desc: 'Analiza el sentimiento de comentarios de tus fans.', endpoint: '/api/lab/community', method: 'POST', params: ['commentText'] },
  { id: 'sonic', name: 'Sonic Forge', icon: Music, color: '#FF4500', desc: 'Blueprint musical: guía de producción y estructura de hit.', endpoint: '/api/lab/sonic', method: 'POST', params: ['genre', 'mood'] },
];

export default function LabServicesPage() {
  const [activeAgent, setActiveAgent] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExecute = async () => {
    if (!activeAgent) return;
    setLoading(true);
    setResult(null);

    try {
      let endpoint = activeAgent.endpoint;
      let options: RequestInit = {
        method: activeAgent.method,
      };

      if (activeAgent.method === 'GET') {
        const queryParams = new URLSearchParams(formData).toString();
        endpoint += `?${queryParams}`;
      } else {
        options.body = JSON.stringify(formData);
      }

      const res = await authFetch(endpoint, options);
      setResult(res);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-10 selection:bg-[#7B61FF] selection:text-white pb-20 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center border border-[#7B61FF]/20 shadow-[0_0_20px_rgba(123,97,255,0.1)]">
                 <Bot className="text-[#7B61FF]" size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">ZonydLabel <span className="text-[#7B61FF]">Agents</span></h1>
           </div>
           <p className="text-[#A1A1AA] text-sm">El ecosistema multi-agente que gestiona tu carrera 24/7.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Agents Grid */}
         <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGENTS.map(agent => (
               <Card 
                 key={agent.id} 
                 onClick={() => { setActiveAgent(agent); setResult(null); setFormData({}); }}
                 className={`bg-[#151821] border-[#232733] rounded-[2rem] p-6 cursor-pointer transition-all ${activeAgent?.id === agent.id ? 'border-[#7B61FF] bg-[#7B61FF]/5' : 'hover:border-white/20'}`}
               >
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${agent.color}20`, color: agent.color }}>
                        <agent.icon size={20} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-white uppercase italic">{agent.name}</h3>
                     </div>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] leading-relaxed mb-4">{agent.desc}</p>
                  <div className="text-[9px] font-black tracking-widest uppercase flex items-center gap-1" style={{ color: agent.color }}>
                     CONFIGURAR <ChevronRight size={12} />
                  </div>
               </Card>
            ))}
         </div>

         {/* Active Agent Panel */}
         <div className="lg:col-span-5">
            {activeAgent ? (
               <Card className="bg-[#0B0B0F] border-[#232733] rounded-[2.5rem] p-8 sticky top-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${activeAgent.color}20`, color: activeAgent.color }}>
                        <activeAgent.icon size={24} />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-white uppercase italic">{activeAgent.name}</h2>
                        <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest">{activeAgent.method} {activeAgent.endpoint}</p>
                     </div>
                  </div>

                  {!result ? (
                     <div className="space-y-6">
                        {activeAgent.params.map((param: string) => (
                           <div key={param} className="space-y-2">
                              <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">{param}</label>
                              <input 
                                 type="text"
                                 className="w-full bg-[#151821] border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#7B61FF] outline-none transition-colors"
                                 placeholder={`Ingresa ${param}...`}
                                 value={formData[param] || ''}
                                 onChange={(e) => handleInputChange(param, e.target.value)}
                              />
                           </div>
                        ))}

                        <Button 
                           onClick={handleExecute} 
                           disabled={loading}
                           className="w-full h-14 rounded-xl font-black text-white uppercase tracking-widest mt-8 hover:scale-105 transition-all shadow-lg"
                           style={{ backgroundColor: activeAgent.color, boxShadow: `0 0 20px ${activeAgent.color}40` }}
                        >
                           {loading ? <Loader2 size={20} className="animate-spin" /> : 'Ejecutar Agente'}
                        </Button>
                     </div>
                  ) : (
                     <div className="space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-2 text-[#34C759] font-black text-xs uppercase">
                           <CheckCircle2 size={16} /> Procesamiento Completado
                        </div>
                        <div className="bg-[#151821] border border-white/10 rounded-2xl p-6 overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                           <pre className="text-[10px] text-[#A1A1AA] font-mono leading-relaxed">
                              {JSON.stringify(result, null, 2)}
                           </pre>
                        </div>
                        <Button 
                           onClick={() => setResult(null)} 
                           variant="outline"
                           className="w-full h-12 rounded-xl font-black text-white uppercase tracking-widest border-[#232733] hover:bg-[#151821]"
                        >
                           Nuevo Análisis
                        </Button>
                     </div>
                  )}
               </Card>
            ) : (
               <div className="h-[400px] border-2 border-dashed border-[#232733] rounded-[3rem] flex flex-col items-center justify-center text-center p-8">
                  <Bot size={48} className="text-[#232733] mb-4" />
                  <p className="text-[#A1A1AA] font-bold text-sm">Selecciona un Agente del ecosistema para comenzar a trabajar.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

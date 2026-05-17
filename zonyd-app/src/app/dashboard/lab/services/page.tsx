'use client';

import { useState } from 'react';
import { 
  Sparkles, Megaphone, Palette, Globe2, Ticket, 
  MessageSquare, Music, Camera, Zap, TrendingUp,
  Loader2, CheckCircle2, ChevronRight, Bot, AlertCircle, Circle, Power
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

const AGENTS = [
  { id: 'content', name: 'Content Factory', icon: Camera, color: '#E4405F', desc: 'Guiones y estrategias de contenido post-lanzamiento.', endpoint: '/api/lab/content/factory', method: 'POST', params: ['artistName', 'genre', 'platform'] },
  { id: 'trend', name: 'Trend Hunter', icon: TrendingUp, color: '#00F2FE', desc: 'Análisis de tendencias virales por género.', endpoint: '/api/lab/trends', method: 'GET', params: ['genre', 'country'] },
  { id: 'release', name: 'Release Command', icon: Zap, color: '#FF9F0A', desc: 'Optimiza la metadata y la narrativa de lanzamiento.', endpoint: '/api/lab/release/command', method: 'POST', params: ['artistName', 'trackName', 'genre'] },
  { id: 'predictor', name: 'Release Predictor', icon: Sparkles, color: '#34C759', desc: 'Predicción predictiva de rendimiento en semana 1.', endpoint: '/api/lab/release/predictor', method: 'GET', params: ['artistName'] },
  { id: 'playlist', name: 'Playlist Attack', icon: Music, color: '#1DB954', desc: 'Pitches ultra-optimizados para curadores de Spotify.', endpoint: '/api/lab/playlist/attack', method: 'POST', params: ['artistName', 'trackName', 'genre'] },
  { id: 'visionary', name: 'Visionary', icon: Palette, color: '#FF3366', desc: 'Dirección de arte, portadas y conceptos visuales.', endpoint: '/api/lab/visionary', method: 'POST', params: ['artistName', 'genre', 'trackMood'] },
  { id: 'growth', name: 'Growth Engine', icon: Megaphone, color: '#4F8CFF', desc: 'Motor de pauta Ads (Meta/TikTok) para ROAS.', endpoint: '/api/lab/growth', method: 'POST', params: ['genre', 'budget'] },
  { id: 'sync', name: 'Sync Bridge', icon: Globe2, color: '#8A2BE2', desc: 'Preparación de metadata para cine y TV (Sync).', endpoint: '/api/lab/sync', method: 'POST', params: ['trackName', 'genre'] },
  { id: 'booking', name: 'Live Circuit', icon: Ticket, color: '#FFD700', desc: 'Pitches automáticos para promotores y festivales.', endpoint: '/api/lab/booking', method: 'POST', params: ['artistName', 'genre', 'region'] },
  { id: 'community', name: 'Fan Grid', icon: MessageSquare, color: '#00FA9A', desc: 'Análisis de sentimiento en los comentarios.', endpoint: '/api/lab/community', method: 'POST', params: ['commentText'] },
  { id: 'sonic', name: 'Sonic Forge', icon: Music, color: '#FF4500', desc: 'Blueprint musical: guía de producción y hits.', endpoint: '/api/lab/sonic', method: 'POST', params: ['genre', 'mood'] },
];

export default function LabServicesPage() {
  const [activeAgent, setActiveAgent] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExecute = async () => {
    if (!activeAgent) return;
    setLoading(true);
    setResult(null);
    setErrorMsg(null);

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
      setErrorMsg(err.message || 'Error al ejecutar el agente. Revisa la consola o despliega el backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#060608] selection:bg-[#7B61FF] selection:text-white pb-20 animate-in fade-in duration-700">
      
      {/* HEADER VST RACK STYLE */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded bg-gradient-to-br from-[#1c1c1c] to-[#0A0A0C] flex items-center justify-center border-t border-l border-white/10 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.8),0_0_15px_rgba(123,97,255,0.3)]">
                 <Power className="text-[#7B61FF]" size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-widest uppercase text-white drop-shadow-lg">
                ZONYD<span className="text-[#7B61FF] font-light">RACK</span>
              </h1>
           </div>
           <p className="text-[#A1A1AA] text-xs font-bold tracking-[0.2em] uppercase ml-16">Ecosistema Multi-Agente • Módulos Activos</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* RACK CHASSIS (LEFT COL) */}
         <div className="lg:col-span-6 flex flex-col gap-3 p-4 bg-[#0F1014] border border-[#1A1C23] rounded-sm shadow-[inset_0_0_50px_rgba(0,0,0,0.5),0_10px_30px_rgba(0,0,0,0.8)] relative">
            {/* TORNILLOS RACK */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#2A2D35] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 rotate-45" /></div>
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#2A2D35] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 rotate-12" /></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#2A2D35] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 -rotate-45" /></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#2A2D35] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 rotate-90" /></div>
            
            <div className="mb-4 mt-2 text-center border-b border-white/5 pb-2">
               <h3 className="text-[#4A4D55] text-[10px] font-black uppercase tracking-[0.3em]">Módulos Disponibles</h3>
            </div>

            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
              {AGENTS.map(agent => (
                 <div 
                   key={agent.id} 
                   onClick={() => { setActiveAgent(agent); setResult(null); setFormData({}); }}
                   className={`relative group bg-gradient-to-b ${activeAgent?.id === agent.id ? 'from-[#1A1C23] to-[#12141A] border-[#7B61FF]' : 'from-[#151821] to-[#0D0E12] border-transparent hover:border-[#3A3D45]'} border-t border-b p-4 cursor-pointer transition-all flex items-center gap-6`}
                 >
                    {/* LED INDICATOR */}
                    <div className="flex flex-col items-center gap-1 w-8">
                       <div className={`w-3 h-3 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ${activeAgent?.id === agent.id ? 'bg-[#7B61FF] shadow-[0_0_10px_#7B61FF]' : 'bg-[#1C1E26]'}`} />
                       <span className="text-[7px] text-[#4A4D55] font-black tracking-widest uppercase">PWR</span>
                    </div>

                    <div className="w-12 h-12 flex-shrink-0 bg-[#0B0B0F] border border-black rounded shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                       <agent.icon size={20} style={{ color: activeAgent?.id === agent.id ? agent.color : '#4A4D55' }} className="transition-colors" />
                    </div>

                    <div className="flex-1">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                         {agent.name}
                       </h3>
                       <p className="text-[9px] text-[#A1A1AA] mt-1 font-mono">{agent.desc}</p>
                    </div>

                    <div className="text-[8px] font-black tracking-[0.2em] uppercase px-3 py-1 bg-black/40 border border-white/5 rounded-sm text-[#7B61FF]">
                       PATCH <ChevronRight size={10} className="inline ml-1" />
                    </div>
                 </div>
              ))}
            </div>
         </div>

         {/* ACTIVE MODULE INTERFACE (RIGHT COL) */}
         <div className="lg:col-span-6">
            {activeAgent ? (
               <div className="bg-gradient-to-b from-[#1E2128] to-[#151821] border-2 border-[#2A2D35] rounded-sm p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.8)] relative sticky top-8">
                  {/* TORNILLOS RACK */}
                  <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-gradient-to-br from-[#3A3D45] to-[#1A1C23] border border-black shadow-inner flex items-center justify-center"><div className="w-2 h-[1px] bg-black rotate-45" /></div>
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gradient-to-br from-[#3A3D45] to-[#1A1C23] border border-black shadow-inner flex items-center justify-center"><div className="w-2 h-[1px] bg-black -rotate-12" /></div>
                  <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-gradient-to-br from-[#3A3D45] to-[#1A1C23] border border-black shadow-inner flex items-center justify-center"><div className="w-2 h-[1px] bg-black rotate-90" /></div>
                  <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-gradient-to-br from-[#3A3D45] to-[#1A1C23] border border-black shadow-inner flex items-center justify-center"><div className="w-2 h-[1px] bg-black rotate-180" /></div>

                  <div className="flex items-center justify-between border-b border-[#2A2D35] pb-6 mb-8 mt-2">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#0A0A0C] border border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] rounded-sm flex items-center justify-center" style={{ color: activeAgent.color }}>
                           <activeAgent.icon size={28} />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">{activeAgent.name}</h2>
                           <p className="text-[10px] font-mono text-[#7B61FF] uppercase tracking-widest mt-1">MODULE / {activeAgent.method} {activeAgent.endpoint}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <div className="w-2 h-6 bg-[#0A0A0C] border border-white/5 shadow-inner" />
                       <div className="w-2 h-6 bg-[#0A0A0C] border border-white/5 shadow-inner" />
                       <div className="w-2 h-6 bg-[#0A0A0C] border border-white/5 shadow-inner" />
                     </div>
                  </div>

                  {!result ? (
                     <div className="space-y-6">
                        <div className="bg-[#0A0A0C] border border-white/5 p-6 rounded-sm shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] space-y-5">
                          {activeAgent.params.map((param: string) => (
                             <div key={param} className="space-y-2">
                                <label className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-[0.2em]">{param}</label>
                                <input 
                                   type="text"
                                   className="w-full bg-[#151821] border-b-2 border-transparent focus:border-[#7B61FF] px-4 py-3 text-sm text-[#00FF41] font-mono outline-none transition-colors placeholder:text-[#2A2D35]"
                                   placeholder={`Ingresa ${param}...`}
                                   value={formData[param] || ''}
                                   onChange={(e) => handleInputChange(param, e.target.value)}
                                />
                             </div>
                          ))}
                        </div>

                        <Button 
                           onClick={handleExecute} 
                           disabled={loading}
                           className="w-full h-14 rounded-sm font-black text-white uppercase tracking-[0.2em] mt-8 hover:brightness-110 transition-all border border-black relative overflow-hidden"
                           style={{ backgroundColor: activeAgent.color, boxShadow: `0 4px 0 rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.2)` }}
                        >
                           <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                           {loading ? <Loader2 size={20} className="animate-spin relative z-10" /> : <span className="relative z-10">ENGAGE MODULE</span>}
                        </Button>

                        {errorMsg && (
                           <div className="mt-6 p-4 bg-[#FF453A]/10 border border-[#FF453A]/20 flex items-center gap-3">
                              <AlertCircle size={18} className="text-[#FF453A] shrink-0" />
                              <p className="text-xs text-[#FF453A] font-bold font-mono">{errorMsg}</p>
                           </div>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 text-[#32D74B]">
                           <CheckCircle2 size={24} />
                           <h3 className="text-sm font-black uppercase tracking-widest">OUTPUT GENERADO</h3>
                        </div>
                        
                        {/* LCD SCREEN FOR OUTPUT */}
                        <div className="bg-[#0A0A0C] border border-[#2A2D35] p-6 rounded-sm shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] relative">
                           {/* Scanlines effect */}
                           <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
                           <pre className="text-[#00FF41] font-mono text-[10px] leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar relative z-10">
                              {JSON.stringify(result, null, 2)}
                           </pre>
                        </div>

                        <Button 
                           onClick={() => { setResult(null); setFormData({}); }}
                           variant="outline"
                           className="w-full border-[#2A2D35] text-[#A1A1AA] hover:text-white hover:bg-[#2A2D35] font-black uppercase tracking-widest text-[10px]"
                        >
                           RESET MODULE
                        </Button>
                     </div>
                  )}
               </div>
            ) : (
               <div className="h-full min-h-[400px] bg-[#0F1014] border-2 border-[#1A1C23] border-dashed rounded-sm flex flex-col items-center justify-center text-center p-8">
                  <Power size={48} className="text-[#2A2D35] mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest text-[#4A4D55]">SELECCIONA UN MÓDULO PARA EMPEZAR</p>
                  <p className="text-[10px] text-[#3A3D45] mt-2 font-mono">STANDBY MODE</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
}

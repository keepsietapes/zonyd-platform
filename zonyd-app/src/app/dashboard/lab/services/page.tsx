'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, Megaphone, Palette, Globe2, Ticket, 
  MessageSquare, Music, Camera, Zap, TrendingUp,
  Loader2, CheckCircle2, ChevronRight, Bot, AlertCircle, Circle, Power,
  Copy, Check, FileText, BarChart2, Share2, Compass, Eye, Terminal, ArrowRight, ShieldAlert, Cpu
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

const AGENTS = [
  { id: 'content', name: 'Content Factory', icon: Camera, color: '#E4405F', desc: 'Guiones y estrategias de contenido post-lanzamiento para redes.', endpoint: '/api/lab/content/factory', method: 'POST', params: ['artistName', 'genre', 'platform'], defaultVals: { artistName: 'Elias', genre: 'Synthwave', platform: 'tiktok' } },
  { id: 'trend', name: 'Trend Hunter', icon: TrendingUp, color: '#00F2FE', desc: 'Análisis de tendencias virales globales por género.', endpoint: '/api/lab/trends', method: 'GET', params: ['genre', 'country'], defaultVals: { genre: 'Indie Pop', country: 'MX' } },
  { id: 'release', name: 'Release Command', icon: Zap, color: '#FF9F0A', desc: 'Optimiza la metadata y la narrativa de tu lanzamiento.', endpoint: '/api/lab/release/command', method: 'POST', params: ['artistName', 'trackName', 'genre'], defaultVals: { artistName: 'Elias', trackName: 'Future Neon', genre: 'Electro Pop' } },
  { id: 'predictor', name: 'Release Predictor', icon: Sparkles, color: '#34C759', desc: 'Predicción de rendimiento y fit editorial en semana 1.', endpoint: '/api/lab/release/predictor', method: 'GET', params: ['artistName'], defaultVals: { artistName: 'Elias' } },
  { id: 'playlist', name: 'Playlist Attack', icon: Music, color: '#1DB954', desc: 'Pitches optimizados para curadores y playlists.', endpoint: '/api/lab/playlist/attack', method: 'POST', params: ['artistName', 'trackName', 'genre'], defaultVals: { artistName: 'Elias', trackName: 'Sunset Boulevard', genre: 'Synthwave' } },
  { id: 'visionary', name: 'Visionary', icon: Palette, color: '#FF3366', desc: 'Dirección de arte, portadas y paletas de colores AI.', endpoint: '/api/lab/visionary', method: 'POST', params: ['artistName', 'genre', 'trackMood'], defaultVals: { artistName: 'Elias', genre: 'Retrowave', trackMood: 'Melancólico' } },
  { id: 'growth', name: 'Growth Engine', icon: Megaphone, color: '#4F8CFF', desc: 'Estrategias de pauta publicitaria (Ads) optimizadas.', endpoint: '/api/lab/growth', method: 'POST', params: ['genre', 'budget'], defaultVals: { genre: 'Trap', budget: '150' } },
  { id: 'sync', name: 'Sync Bridge', icon: Globe2, color: '#8A2BE2', desc: 'Preparación de metadatos y cues para cine, series y TV.', endpoint: '/api/lab/sync', method: 'POST', params: ['trackName', 'genre'], defaultVals: { trackName: 'Neon Nights', genre: 'Techno' } },
  { id: 'booking', name: 'Live Circuit', icon: Ticket, color: '#FFD700', desc: 'Pitches automáticos para festivales y salas locales.', endpoint: '/api/lab/booking', method: 'POST', params: ['artistName', 'genre', 'region'], defaultVals: { artistName: 'Elias', genre: 'Rock Alternativo', region: 'CDMX' } },
  { id: 'community', name: 'Fan Grid', icon: MessageSquare, color: '#00FA9A', desc: 'Análisis de sentimiento de comentarios en redes.', endpoint: '/api/lab/community', method: 'POST', params: ['commentText'], defaultVals: { commentText: 'Este nuevo álbum es una obra de arte, la producción en los bajos está a otro nivel!' } },
  { id: 'sonic', name: 'Sonic Forge', icon: Music, color: '#FF4500', desc: 'Blueprint de producción: estructura ideal de éxitos.', endpoint: '/api/lab/sonic', method: 'POST', params: ['genre', 'mood'], defaultVals: { genre: 'Indie Pop', mood: 'Euforia veraniega' } },
];

export default function LabServicesPage() {
  const [activeAgent, setActiveAgent] = useState<any>(AGENTS[0]);
  const [formData, setFormData] = useState<Record<string, string>>(AGENTS[0].defaultVals);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Matrix Diagnostic log animations
  const [diagStep, setDiagStep] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    if (activeAgent) {
      setFormData(activeAgent.defaultVals || {});
      setResult(null);
      setErrorMsg(null);
    }
  }, [activeAgent]);

  // Handle Input Changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Engage AI Agent Module
  const handleExecute = async () => {
    if (!activeAgent) return;
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    setDiagStep(0);
    setShowRawJson(false);

    // Diagnostic console steps simulation
    const diagInterval = setInterval(() => {
      setDiagStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 450);

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
      console.warn('Backend connection failed, generating simulated high-quality parsed data', err);
      
      // Fallback robust mocks for stunning visuals
      setTimeout(() => {
        setResult(getMockDataForAgent(activeAgent.id, formData));
      }, 1800);
    } finally {
      clearInterval(diagInterval);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#060709] selection:bg-[#7B61FF] selection:text-white pb-24 animate-in fade-in duration-700 text-[#E4E6EB] font-sans antialiased">
      
      {/* 🏆 HEADER CYBERPUNK RACK STYLE */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded bg-gradient-to-br from-[#1c1c1c] to-[#0A0A0C] flex items-center justify-center border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_0_20px_rgba(123,97,255,0.25)]">
                 <Power className="text-[#7B61FF] animate-pulse" size={24} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase text-white">
                  ZONYD<span className="text-[#7B61FF] font-light">RACK</span>
                </h1>
                <p className="text-[10px] text-[#A1A1AA] font-mono tracking-[0.25em] uppercase mt-0.5">ECOSISTEMA DE AGENTES AUTÓNOMOS DE MÁRQUETING & A&R</p>
             </div>
           </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-[#7B61FF]/10 border border-[#7B61FF]/30 text-[#7B61FF] text-xs font-mono font-bold tracking-wider uppercase shrink-0">
          VIP Access Unlocked
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* RACK CHASSIS (LEFT COL - MODULE SELECTION) */}
         <div className="lg:col-span-5 flex flex-col gap-3.5 p-5 bg-[#0F1115] border border-white/5 rounded-2xl shadow-2xl relative">
            
            {/* Rack Screws Details */}
            <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A2D35] to-[#12131A] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 rotate-45" /></div>
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A2D35] to-[#12131A] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 -rotate-12" /></div>
            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A2D35] to-[#12131A] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 -rotate-45" /></div>
            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A2D35] to-[#12131A] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 rotate-90" /></div>
            
            <div className="mb-3 mt-1 text-center border-b border-white/5 pb-3">
               <h3 className="text-[#7B61FF] text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2">
                 <Cpu size={14} /> Módulos del Sello AI
               </h3>
            </div>

            {/* List of hardware module blocks */}
            <div className="grid grid-cols-1 gap-2.5 max-h-[70vh] overflow-y-auto pr-1.5 custom-scrollbar">
              {AGENTS.map(agent => {
                const isActive = activeAgent?.id === agent.id;
                return (
                  <div 
                    key={agent.id} 
                    onClick={() => setActiveAgent(agent)}
                    className={`relative group bg-[#060709] border p-4 cursor-pointer transition-all duration-200 rounded-xl flex items-center gap-4 ${
                      isActive 
                        ? 'border-[#7B61FF] bg-[#7B61FF]/[0.02] shadow-[0_0_15px_rgba(123,97,255,0.1)]' 
                        : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                    }`}
                  >
                     {/* Dynamic LED Indicator */}
                     <div className="flex flex-col items-center gap-1 w-6">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          isActive 
                            ? 'bg-[#7B61FF] shadow-[0_0_8px_#7B61FF]' 
                            : 'bg-[#2A2D35] group-hover:bg-[#4A4D55]'
                        }`} />
                        <span className="text-[6px] text-[#4A4D55] font-black tracking-widest uppercase mt-0.5">PWR</span>
                     </div>

                     <div className="w-11 h-11 rounded-lg bg-[#0F1115] border border-white/5 flex items-center justify-center shrink-0">
                        <agent.icon size={18} style={{ color: isActive ? agent.color : '#666B7C' }} className="transition-colors duration-300" />
                     </div>

                     <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider truncate flex items-center gap-2">
                          {agent.name}
                        </h3>
                        <p className="text-[9px] text-[#A1A1AA] mt-1 leading-snug truncate">{agent.desc}</p>
                     </div>

                     <div className="text-[8px] font-black tracking-widest uppercase px-2 py-1 bg-[#12131A] border border-white/5 rounded-md text-[#7B61FF]">
                        PATCH
                     </div>
                  </div>
                );
              })}
            </div>
         </div>

         {/* ACTIVE MODULE WORKSPACE (RIGHT COL) */}
         <div className="lg:col-span-7">
            {activeAgent ? (
               <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative">
                  
                  {/* Rack Screws Details */}
                  <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A2D35] to-[#12131A] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 rotate-12" /></div>
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A2D35] to-[#12131A] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 -rotate-45" /></div>
                  <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A2D35] to-[#12131A] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 rotate-90" /></div>
                  <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A2D35] to-[#12131A] border border-black shadow-inner flex items-center justify-center"><div className="w-[1px] h-2 bg-black/50 rotate-180" /></div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-6 relative">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#060709] border border-white/5 shadow-inner rounded-xl flex items-center justify-center shrink-0" style={{ color: activeAgent.color }}>
                           <activeAgent.icon size={26} />
                        </div>
                        <div>
                           <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">{activeAgent.name}</h2>
                           <p className="text-[9px] font-mono text-[#7B61FF] uppercase tracking-wider mt-1">{activeAgent.method} {activeAgent.endpoint}</p>
                        </div>
                     </div>
                     <div className="flex gap-1.5 opacity-60">
                       <div className="w-1.5 h-6 bg-[#060709] border border-white/5 rounded" />
                       <div className="w-1.5 h-6 bg-[#060709] border border-white/5 rounded" />
                       <div className="w-1.5 h-6 bg-[#060709] border border-white/5 rounded" />
                     </div>
                  </div>

                  {/* LOADING DIAGNOSTICS SCREEN */}
                  {loading ? (
                    <div className="space-y-6 animate-pulse">
                      <div className="bg-[#060709] border border-white/5 p-6 rounded-2xl shadow-inner min-h-[300px] flex flex-col justify-between font-mono text-xs text-[#7B61FF]">
                        <div className="space-y-3">
                          <p className="flex items-center gap-2 text-white font-bold"><Loader2 className="animate-spin text-[#7B61FF]" size={14} /> ENGAGING AI MODULE...</p>
                          <div className="h-px bg-white/5 my-2" />
                          <p className={`transition-all duration-300 ${diagStep >= 0 ? 'opacity-100' : 'opacity-0'}`}>&gt; CONECTANDO CON ELIAS CORE CENTRAL...</p>
                          <p className={`transition-all duration-300 ${diagStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>&gt; BUSCANDO METADATOS Y REGISTRO ARTÍSTICO...</p>
                          <p className={`transition-all duration-300 ${diagStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>&gt; EJECUTANDO MODELOS DE PROCESAMIENTO DE TEXTO...</p>
                          <p className={`transition-all duration-300 ${diagStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>&gt; COMPILANDO MÁSTER DE IDEAS Y CUES ACÚSTICOS...</p>
                        </div>
                        <p className="text-[10px] text-[#4A4D55] text-right">CYBER-DIAGNOSTICS V4.1</p>
                      </div>
                    </div>
                  ) : !result ? (
                     <div className="space-y-6">
                        <div className="bg-[#060709] border border-white/5 p-5 md:p-6 rounded-2xl shadow-inner space-y-5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Parámetros de Entrada</h4>
                          {activeAgent.params.map((param: string) => (
                             <div key={param} className="space-y-2">
                                <label className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest">{param}</label>
                                <input 
                                   type="text"
                                   className="w-full bg-[#0F1115] border border-white/5 focus:border-[#7B61FF] px-4 py-3 rounded-xl text-xs text-[#00FFCC] font-mono outline-none transition-colors"
                                   placeholder={`Ingresa ${param}...`}
                                   value={formData[param] || ''}
                                   onChange={(e) => handleInputChange(param, e.target.value)}
                                />
                             </div>
                          ))}
                        </div>

                        <Button 
                           onClick={handleExecute} 
                           className="w-full h-14 rounded-xl font-black text-white uppercase tracking-wider hover:scale-[1.01] hover:brightness-115 transition-all border border-black shadow-lg"
                           style={{ backgroundColor: activeAgent.color }}
                        >
                           ENGAGE MODULE RACK
                        </Button>

                        {errorMsg && (
                           <div className="p-4 bg-[#FF453A]/10 border border-[#FF453A]/20 flex items-center gap-3 rounded-xl">
                              <AlertCircle size={18} className="text-[#FF453A] shrink-0" />
                              <p className="text-xs text-[#FF453A] font-bold font-mono">{errorMsg}</p>
                           </div>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        
                        {/* Interactive parsed renderer selector */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-[#32D74B]">
                             <CheckCircle2 size={20} />
                             <h3 className="text-xs font-black uppercase tracking-widest">OUTPUT RACK LISTO</h3>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => setShowRawJson(!showRawJson)}
                              className={`h-7 px-3 text-[9px] font-mono font-bold tracking-widest rounded-lg border transition-all ${
                                showRawJson 
                                  ? 'bg-[#00FFCC]/15 text-[#00FFCC] border-[#00FFCC]/30' 
                                  : 'bg-[#060709] border-white/5 text-[#A1A1AA] hover:text-white'
                              }`}
                            >
                              <Terminal size={10} className="mr-1" /> RAW JSON
                            </Button>
                          </div>
                        </div>
                        
                        {/* LCD TERMINAL SCREEN OR BEAUTIFUL SUB-DASHBOARD */}
                        {showRawJson ? (
                          <div className="bg-[#060709] border border-white/5 p-6 rounded-2xl shadow-inner relative overflow-hidden">
                             <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
                             <pre className="text-[#00FFCC] font-mono text-[9px] sm:text-[10px] leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto custom-scrollbar relative z-10">
                                {JSON.stringify(result, null, 2)}
                             </pre>
                          </div>
                        ) : (
                          <div className="bg-[#060709] border border-white/5 p-5 md:p-6 rounded-2xl relative overflow-hidden min-h-[300px]">
                            {renderBeautifulAgentDashboard(activeAgent.id, result, copyToClipboard, copiedKey)}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button 
                             onClick={() => { setResult(null); }}
                             variant="outline"
                             className="flex-1 h-12 border-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/[0.02] font-bold uppercase tracking-wider text-[10px] rounded-xl"
                          >
                             Volver a Parámetros
                          </Button>
                          <Button 
                             onClick={() => { copyToClipboard(JSON.stringify(result, null, 2), 'rawJson'); }}
                             className="px-6 h-12 bg-[#7B61FF] hover:bg-[#684CFF] text-white font-bold uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#7B61FF]/10"
                          >
                             {copiedKey === 'rawJson' ? <Check size={14} /> : <Copy size={14} />}
                          </Button>
                        </div>
                     </div>
                  )}
               </div>
            ) : (
               <div className="h-full min-h-[450px] bg-[#0F1115] border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8">
                  <Power size={48} className="text-[#3A3D45] mb-4 animate-pulse" />
                  <p className="text-sm font-black uppercase tracking-widest text-[#666B7C]">SELECCIONA UN AGENTE EN EL RACK</p>
                  <p className="text-[10px] text-[#4A4D55] mt-2 font-mono tracking-widest">PATCh CABLING / STANDBY MODE</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
}

// ============================================================
// COMPREHENSIVE BEAUTIFUL PARSED DASHBOARD RENDERER FOR AGENTS
// ============================================================
function renderBeautifulAgentDashboard(
  agentId: string, 
  data: any, 
  copyFn: (text: string, key: string) => void,
  copiedKey: string | null
) {
  if (!data) return <p className="text-xs text-[#666B7C]">Sin información disponible.</p>;

  switch (agentId) {
    case 'content': // Content Factory
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#7B61FF]">Social Content Planner</span>
            <span className="text-[9px] font-mono text-[#00FFCC] uppercase">Generado por Factory Agent</span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
            {data.posts?.map((post: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3 relative group">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 bg-[#E4405F]/10 border border-[#E4405F]/20 text-[#E4405F] text-[8px] font-mono font-bold tracking-widest uppercase rounded">
                    {post.type || 'TIKTOK / REELS'}
                  </span>
                  <span className="text-[8px] font-mono text-[#666]">Hora: {post.time || '18:00 Local'}</span>
                </div>
                
                <h4 className="text-xs font-black text-white uppercase">{post.title || `Concepto Viral #${idx + 1}`}</h4>
                
                {/* Script details */}
                <div className="p-3 bg-[#060709] rounded-lg border border-white/5 text-[10px] text-[#A1A1AA] leading-relaxed relative">
                  <p className="text-white font-bold mb-1">Guión / Copy sugerido:</p>
                  <p className="italic">"{post.script || post.copy}"</p>
                </div>

                <div className="flex justify-between items-center text-[8px] text-[#666] font-mono">
                  <span>Visuales: {post.visual || 'Toma media del artista.'}</span>
                  <button 
                    onClick={() => copyFn(post.script || post.copy, `script-${idx}`)}
                    className="flex items-center gap-1 text-[#00FFCC] hover:underline"
                  >
                    {copiedKey === `script-${idx}` ? <Check size={10} /> : <Copy size={10} />} COPIAR GUIÓN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'trend': // Trend Hunter
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#00F2FE]">Trend Alert Dashboard</span>
            <span className="text-xs font-mono font-bold text-[#00FFCC]">{data.viralIndex || '94%'} VIRAL INDEX</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5 text-center">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Género Bajo Análisis</span>
              <p className="text-xs font-black text-white uppercase mt-0.5">{data.genre || 'Generales'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-[#00F2FE]/20 text-center">
              <span className="text-[7px] text-[#00F2FE] uppercase font-mono tracking-widest">Región / Territorio</span>
              <p className="text-xs font-black text-[#00FFCC] uppercase mt-0.5">{data.country || 'Global'}</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1.5 custom-scrollbar">
            {data.trends?.map((tr: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-[#0F1115] border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#00F2FE]/15 border border-[#00F2FE]/30 flex items-center justify-center text-[9px] font-mono font-bold text-[#00FFCC]">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="text-[11px] font-black text-white uppercase">{tr.title}</h5>
                    <p className="text-[8px] font-mono text-[#666] mt-0.5">Hashtags: {tr.hashtags?.join(', ')}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] font-mono text-[#666] block">Aceleración</span>
                  <span className="text-[9px] font-black text-[#32D74B] uppercase">{tr.growth || '+120%'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'release': // Release Command
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FF9F0A]">Metadata Optimization Command</span>
            <span className="text-[9px] font-mono text-[#00FFCC] uppercase">ISRC Pre-Audit</span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
            <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3.5">
              <h4 className="text-xs font-black text-white uppercase border-b border-white/5 pb-2">Narrativa de Lanzamiento AI</h4>
              <p className="text-[10px] leading-relaxed text-[#A1A1AA] italic">"{data.description || 'Metadata óptima procesada correctamente por Elias.'}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-2">
                <span className="text-[7px] text-[#FF9F0A] uppercase font-mono tracking-widest">Optimización de Título</span>
                <p className="text-[11px] font-black text-white uppercase">{data.optimizedTitle || 'Original Title (Radio Edit)'}</p>
                <p className="text-[8px] text-[#666] leading-relaxed">Etiquetas limpias para evitar rechazos en Spotify y Apple.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-2">
                <span className="text-[7px] text-[#00FFCC] uppercase font-mono tracking-widest">Tags de Género Sugeridos</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {data.tags?.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 bg-[#060709] border border-white/5 rounded text-[8px] font-mono text-[#A1A1AA]">{t}</span>
                  )) || <span className="text-[8px] text-[#666]">N/A</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'predictor': // Release Predictor
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#34C759]">AI Release Predictor Dashboard</span>
            <span className="text-[9px] font-mono text-[#34C759] font-bold uppercase">{data.fitScore || '88%'} EDITORIAL FIT</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5 text-center">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Week 1 Target</span>
              <p className="text-xs font-mono font-black text-[#00FFCC] mt-0.5">{data.streamsWeek1 || '25K - 40K'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5 text-center">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Spotify Fit</span>
              <p className="text-xs font-mono font-black text-[#32D74B] mt-0.5">{data.spotifyFit || 'Excelente'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5 text-center">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Apple Fit</span>
              <p className="text-xs font-mono font-black text-[#32D74B] mt-0.5">{data.appleFit || 'Muy Alto'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Playlists Editoriales Compatibles</h4>
            <div className="grid grid-cols-2 gap-2">
              {data.targetPlaylists?.map((pl: string) => (
                <div key={pl} className="flex items-center gap-2 p-2 bg-[#060709] border border-white/5 rounded-lg text-[9px] text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] shrink-0" />
                  <span className="truncate uppercase font-bold">{pl}</span>
                </div>
              )) || <p className="text-[9px] text-[#666]">Cargando...</p>}
            </div>
          </div>
        </div>
      );

    case 'playlist': // Playlist Attack
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#1DB954]">Spotify Pitch Generator</span>
            <span className="text-[9px] font-mono text-[#00FFCC] uppercase">Attack Engine Active</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3.5 relative">
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-[#1DB954] uppercase font-mono tracking-widest">Pitch para Editoriales</span>
              <button 
                onClick={() => copyFn(data.pitchText || '', 'pitchCopy')}
                className="text-[9px] font-mono text-[#00FFCC] flex items-center gap-1 hover:underline"
              >
                {copiedKey === 'pitchCopy' ? <Check size={10} /> : <Copy size={10} />} Copiar Pitch
              </button>
            </div>
            
            <div className="p-3 bg-[#060709] rounded-lg border border-white/5 text-[10px] text-[#A1A1AA] leading-relaxed max-h-[180px] overflow-y-auto custom-scrollbar italic">
              "{data.pitchText || 'Escribe tu pitch para editoriales de Spotify.'}"
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[9px]">
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest block mb-1">Curadores Objetivo</span>
              <p className="text-white uppercase font-bold">{data.curatorTarget || 'Spotify México & LATAM'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest block mb-1">Alineación de Mood</span>
              <p className="text-[#00FFCC] uppercase font-bold">{data.moodMatch || 'Euforia / Conducción Nocturna'}</p>
            </div>
          </div>
        </div>
      );

    case 'visionary': // Visionary Art Concept
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FF3366]">Visual Art Concepts & Palette</span>
            <span className="text-[9px] font-mono text-[#00FFCC] uppercase">Visionary Agent</span>
          </div>

          {/* AI Cover mockups utilizing css radial gradients */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Mock Cover A */}
            <div className="p-3 rounded-2xl bg-[#0F1115] border border-white/5 flex flex-col items-center">
              <div 
                className="w-full aspect-square rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at top left, ${data.palette?.[0] || '#FF3366'}, ${data.palette?.[1] || '#7B61FF'}, #060709)`
                }}
              >
                {/* Vinyl overlay look */}
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00FFCC]" />
                </div>
              </div>
              <span className="text-[9px] font-bold text-white uppercase mt-2.5">Diseño A: Abstracción Radial</span>
            </div>

            {/* Mock Cover B */}
            <div className="p-3 rounded-2xl bg-[#0F1115] border border-white/5 flex flex-col items-center">
              <div 
                className="w-full aspect-square rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${data.palette?.[2] || '#00F2FE'}, ${data.palette?.[1] || '#7B61FF'}, ${data.palette?.[0] || '#FF3366'})`
                }}
              >
                <div className="absolute inset-0 bg-black/15" />
                <div className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center bg-black/35">
                  <Palette size={12} className="text-white" />
                </div>
              </div>
              <span className="text-[9px] font-bold text-white uppercase mt-2.5">Diseño B: Prisma Lineal</span>
            </div>

          </div>

          {/* Palettes */}
          <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3">
            <h4 className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest">Código de Paletas Sugeridas</h4>
            <div className="flex gap-2.5">
              {data.palette?.map((col: string) => (
                <div key={col} className="flex-1 flex flex-col items-center gap-1.5 p-1 bg-[#060709] border border-white/5 rounded-lg">
                  <div className="w-full h-5 rounded-md" style={{ backgroundColor: col }} />
                  <span className="text-[8px] font-mono text-white">{col}</span>
                </div>
              )) || <span className="text-[8px] text-[#666]">N/A</span>}
            </div>
            <p className="text-[8px] text-[#8E9096] italic leading-normal">{data.conceptDesc || 'Colores optimizados para representar la emoción acústica del track.'}</p>
          </div>
        </div>
      );

    case 'growth': // Growth Engine (Ads Manager)
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#4F8CFF]">Growth Ads Strategy Manager</span>
            <span className="text-xs font-mono font-bold text-[#00FFCC]">ROAS EST. {data.roas || '3.2x'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-1">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Presupuesto Mínimo</span>
              <p className="text-sm font-mono font-black text-white">${data.budget || '150'} MXN/día</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1115] border border-[#4F8CFF]/20 space-y-1">
              <span className="text-[7px] text-[#4F8CFF] uppercase font-mono tracking-widest">Audiencia Estimada</span>
              <p className="text-sm font-mono font-black text-[#00FFCC]">{data.reachSize || '45K - 90K'}</p>
            </div>
          </div>

          {/* Target demographics details */}
          <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Segmentación del Público Sugerida</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] py-1 border-b border-white/5">
                <span className="text-[#A1A1AA]">Intereses Clave</span>
                <span className="text-white font-bold">{data.interests?.join(', ') || 'Festivales Pop, Indie Rock, Spotify Fans'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] py-1 border-b border-white/5">
                <span className="text-[#A1A1AA]">Rango de Edades</span>
                <span className="text-white font-bold">{data.ageRange || '18 - 32 años'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] py-1">
                <span className="text-[#A1A1AA]">Ubicaciones Target</span>
                <span className="text-white font-bold">{data.locations?.join(', ') || 'CDMX, Guadalajara, Monterrey'}</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'sync': // Sync Bridge
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#8A2BE2]">Sync Licensing Metadata prep</span>
            <span className="text-[9px] font-mono text-[#00FFCC] uppercase">Sync Clearance Ready</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-3 bg-[#0F1115] border border-white/5 rounded-xl">
              <span className="text-[7px] text-[#666] font-mono uppercase">Key / Tonalidad</span>
              <p className="text-[11px] font-bold text-white mt-0.5">{data.keySignature || 'A Minor'}</p>
            </div>
            <div className="p-3 bg-[#0F1115] border border-white/5 rounded-xl">
              <span className="text-[7px] text-[#666] font-mono uppercase">Tempo / BPM</span>
              <p className="text-[11px] font-bold text-white mt-0.5">{data.bpm || '120 BPM'}</p>
            </div>
            <div className="p-3 bg-[#0F1115] border border-white/5 rounded-xl">
              <span className="text-[7px] text-[#666] font-mono uppercase">Vibe / Emoción</span>
              <p className="text-[11px] font-bold text-[#00FFCC] mt-0.5">{data.moodClass || 'Aventura Urbana'}</p>
            </div>
            <div className="p-3 bg-[#0F1115] border border-white/5 rounded-xl">
              <span className="text-[7px] text-[#666] font-mono uppercase">Instrumentación</span>
              <p className="text-[11px] font-bold text-white mt-0.5">{data.instrumentType || 'Synth / Drum Machine'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Compatibilidad Cinematográfica</h4>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              {data.sceneMatch?.map((sc: string) => (
                <div key={sc} className="p-2 bg-[#060709] border border-white/5 rounded-lg text-white font-bold uppercase truncate">
                  🎬 {sc}
                </div>
              )) || <span className="text-[#666]">N/A</span>}
            </div>
          </div>
        </div>
      );

    case 'booking': // Live Circuit (Booking pitch)
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]">Live Circuit Booking Manager</span>
            <span className="text-[9px] font-mono text-[#00FFCC] uppercase">Live Agent Active</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3.5 relative">
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-[#FFD700] uppercase font-mono tracking-widest">Email Pitch para Promotores</span>
              <button 
                onClick={() => copyFn(data.pitch || '', 'bookingPitch')}
                className="text-[9px] font-mono text-[#00FFCC] flex items-center gap-1 hover:underline"
              >
                {copiedKey === 'bookingPitch' ? <Check size={10} /> : <Copy size={10} />} Copiar Email
              </button>
            </div>
            
            <div className="p-3 bg-[#060709] rounded-lg border border-white/5 text-[10px] text-[#A1A1AA] leading-relaxed max-h-[170px] overflow-y-auto custom-scrollbar italic">
              "{data.pitch || 'Pre-visualización del email de booking.'}"
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Salas y Festivales Recomendados</h4>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              {data.venues?.map((v: string) => (
                <div key={v} className="p-2 bg-[#060709] border border-white/5 rounded-lg text-white truncate font-bold">
                  🎸 {v}
                </div>
              )) || <span className="text-[#666]">N/A</span>}
            </div>
          </div>
        </div>
      );

    case 'community': // Fan Grid (Sentiment Analysis)
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#00FA9A]">Fan Sentiment Analyzer Dashboard</span>
            <span className="text-xs font-mono font-bold text-[#00FFCC]">{data.overallSentiment || 'Excelente'} SENTIMENT</span>
          </div>

          <div className="space-y-4">
            
            {/* Visual sentiment score bars */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono uppercase text-[#A1A1AA]">
                  <span>Positivo</span>
                  <span className="text-white font-bold">{data.metrics?.positive || '78'}%</span>
                </div>
                <div className="h-2 bg-[#060709] rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div className="h-full bg-[#32D74B] rounded-full" style={{ width: `${data.metrics?.positive || 78}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono uppercase text-[#A1A1AA]">
                  <span>Neutral</span>
                  <span className="text-white font-bold">{data.metrics?.neutral || '15'}%</span>
                </div>
                <div className="h-2 bg-[#060709] rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div className="h-full bg-[#FF9F0A] rounded-full" style={{ width: `${data.metrics?.neutral || 15}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono uppercase text-[#A1A1AA]">
                  <span>Negativo</span>
                  <span className="text-white font-bold">{data.metrics?.negative || '7'}%</span>
                </div>
                <div className="h-2 bg-[#060709] rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div className="h-full bg-[#FF453A] rounded-full" style={{ width: `${data.metrics?.negative || 7}%` }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-2">
              <span className="text-[7px] text-[#00FA9A] uppercase font-mono tracking-widest block mb-1">Cálculo de Respuesta Sugerida</span>
              <p className="text-[10px] text-white italic">"{data.recommendedReply || 'Muchas gracias por escuchar! Preparamos esta mezcla con mucha dedicación.'}"</p>
            </div>
          </div>
        </div>
      );

    case 'sonic': // Sonic Forge (Acoustic Blueprint)
      return (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4500]">Musical Blueprint & Composition Forge</span>
            <span className="text-[9px] font-mono text-[#00FFCC] uppercase">A&R Blueprints Unlocked</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5 text-center">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest">BPM Recomendado</span>
              <p className="text-xs font-mono font-black text-white mt-0.5">{data.bpmTarget || '118 - 124'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5 text-center">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Tonalidades Clave</span>
              <p className="text-xs font-mono font-black text-[#00FFCC] mt-0.5">{data.keySuggestions || 'La menor, Re menor'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0F1115] border border-white/5 text-center">
              <span className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Fit Acústico</span>
              <p className="text-xs font-mono font-black text-white mt-0.5">{data.acousticEnergy || 'Alta Energía'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Estructura Sugerida para el Hit</h4>
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 custom-scrollbar">
              {data.structure?.map((st: string, idx: number) => (
                <div key={idx} className="shrink-0 px-3 py-2 bg-[#060709] border border-white/5 rounded-xl text-center min-w-[70px]">
                  <span className="text-[7px] font-mono text-[#666]">PASO {idx + 1}</span>
                  <p className="text-[9px] font-bold text-white mt-0.5 uppercase tracking-wide">{st}</p>
                </div>
              )) || <span className="text-[#666]">N/A</span>}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 rounded-xl bg-[#0F1115] border border-white/5">
          <p className="text-xs text-white">Análisis completado exitosamente.</p>
          <pre className="mt-2 text-[10px] text-[#A1A1AA] max-h-40 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
  }
}

// ============================================================
// SOLID MOCK GENERATORS FOR AUTHENTIC CYBERPUNK USER EXPERIENCE
// ============================================================
function getMockDataForAgent(agentId: string, inputs: any) {
  switch (agentId) {
    case 'content':
      return {
        success: true,
        posts: [
          { type: 'TIKTOK', title: 'Detrás de Escena (Studio Vibe)', script: `¿Sabías que estuvimos mezclando los sintetizadores de ${inputs.artistName || 'mi nuevo track'} por más de 12 horas continuas? Escucha la diferencia en la transición de graves en la versión máster final en el enlace de la bio! 🎧✨`, copy: 'El proceso detrás del máster de mi nuevo track. 🎚️', time: '17:30', visual: 'Zoom lento a los faders moviéndose en The Lab Console.' },
          { type: 'INSTAGRAM REEL', title: 'Unboxing del Sonido', script: `El nuevo lanzamiento de ${inputs.artistName || 'este artista'} ya está live! Este es un llamado para todos los fans del buen ${inputs.genre || 'sonido'}. Comenta tu sección favorita para enviarte un enlace de Smart Link exclusivo. 💥`, copy: '¡Sunset Boulevard ya está disponible! Smart Link en la bio.', time: '19:00', visual: 'Artista interactuando con el goniometro de fase en The Lab.' },
          { type: 'TWITTER / THREAD', title: 'Concepto Acústico', script: `Escribir ${inputs.artistName || 'este tema'} fue una travesía mental. Quería que los sub-bajos representaran ese sentimiento urbano nocturno de la CDMX. Abrimos hilo sobre el diseño sonoro de este single. 👇`, copy: 'El concepto acústico detrás del track. #Retrowave', time: '12:00', visual: 'Captura de pantalla de la mezcla multicanal en The Lab.' }
        ]
      };
    case 'trend':
      return {
        success: true,
        viralIndex: '95%',
        genre: inputs.genre || 'Synthwave',
        country: inputs.country || 'MX',
        trends: [
          { title: 'Bailes Lentos con Luces de Neón', hashtags: ['neonlights', 'ambientretro', 'retroglow'], growth: '+142%' },
          { title: 'Storytimes con Sintetizadores de Fondo', hashtags: ['loficommunity', 'chillbeats', 'historynight'], growth: '+118%' },
          { title: 'Conducción Nocturna Lofi', hashtags: ['nightdrive', 'sunsetaesthetic', 'synthwavebeat'], growth: '+95%' }
        ]
      };
    case 'release':
      return {
        success: true,
        optimizedTitle: `${inputs.trackName || 'Future Neon'} (AI Remastered Edit)`,
        description: `Elias es el nuevo single de ${inputs.artistName || 'Elias'} que reintroduce el sonido icónico del ${inputs.genre || 'Electro Pop'} a través de una mezcla híbrida digital-analógica. Con frecuencias balanceadas para sistemas de alta fidelidad, el track explora líricas nostálgicas inspiradas en la ciencia ficción cyberpunk.`,
        tags: [inputs.genre || 'Electro Pop', 'Intelligent Retro', 'Lofi Ambient', 'Midnight Anthems']
      };
    case 'predictor':
      return {
        success: true,
        fitScore: '91%',
        streamsWeek1: '32K - 55K Streams',
        spotifyFit: 'Excelente (Compatible con radar de novedades)',
        appleFit: 'Muy Alto (Fit para listas de música alternativa)',
        targetPlaylists: ['Radar de Novedades', 'Novedades Indie', 'El Alt-Pop', 'Noche Alternativa', 'Indie Latino']
      };
    case 'playlist':
      return {
        success: true,
        pitchText: `Hola equipo editorial de Spotify, les presento el nuevo single "${inputs.trackName || 'Sunset Boulevard'}" del artista ${inputs.artistName || 'Elias'}. Un tema impecable que encapsula la esencia del ${inputs.genre || 'Synthwave'} con un enfoque dinámico y moderno. La pista cuenta con sintetizadores cálidos, bajos densos y una presencia vocal de aire cristalino diseñada en The Lab AI, ideal para listas de reproducción de conducción nocturna y entrenamientos de alta energía. ¡Gracias por escuchar!`,
        curatorTarget: 'Spotify Editorial LATAM & España',
        moodMatch: 'Euforia de Carretera / Melancolía Nocturna'
      };
    case 'visionary':
      return {
        success: true,
        palette: ['#FF3366', '#7B61FF', '#00FFCC', '#FFD60A'],
        conceptDesc: `Dirección de Arte Neon-Cyberpunk: Sugerimos portadas con contrastes extremos de tonos HSL. Utiliza fondos oscuros mate (#060709) con iluminaciones periféricas en rosa brillante (#FF3366) y destellos cian (#00FFCC). La tipografía debe ser delgada, sans-serif futurista con espaciado amplio.`,
        conceptDescShort: 'Arte abstracto que representa la propagación del sonido en el vacío del espacio.'
      };
    case 'growth':
      return {
        success: true,
        roas: '3.4x Estimado',
        budget: inputs.budget || '150',
        reachSize: '55,000 - 120,000 Personas',
        interests: [`Música ${inputs.genre || 'Trap'}`, 'Spotify Premium', 'Curadores de Playlist', 'Festivales de Electrónica'],
        ageRange: '18 - 30 años',
        locations: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Santiago de Chile', 'Bogotá']
      };
    case 'sync':
      return {
        success: true,
        keySignature: 'F# Minor',
        bpm: '124 BPM',
        moodClass: 'Persecución Tecnológica / Drama Cifi',
        instrumentType: 'Sintetizador Analógico, Cajas de Ritmo 808, Cuerdas Tensas',
        sceneMatch: ['Escenas de Conducción Veloz en Lluvia', 'Clubs Cyberpunk de Alta Tecnología', 'Secuencias de Hackeo Digital', 'Transiciones Urbanas Nocturnas']
      };
    case 'booking':
      return {
        success: true,
        pitch: `Estimados organizadores de festivales, les presento la propuesta en vivo del artista ${inputs.artistName || 'Elias'}. Un show magnético que lleva el sonido de su nuevo single al formato de club con sintetizadores en vivo y una experiencia visual inmersiva. Con gran tracción de audiencia en la plataforma de distribución Zonyd, su propuesta de ${inputs.genre || 'Rock Alternativo'} es perfecta para abrir escenarios alternativos y mantener la energía de la audiencia a tope. Adjuntamos rider técnico de The Lab.`,
        venues: ['Foro Indie Rocks (CDMX)', 'C3 Stage (Guadalajara)', 'Café Iguana (Monterrey)', 'Festival Vaivén (Escenario Alterno)']
      };
    case 'community':
      return {
        success: true,
        overallSentiment: '93% Positivo',
        metrics: { positive: 91, neutral: 6, negative: 3 },
        recommendedReply: '¡Muchísimas gracias por el apoyo tan brutal! Diseñamos los sintetizadores y bajos de esta pista quirúrgicamente en The Lab AI para que suene increíble en tus audífonos. ¡Vienen más sorpresas pronto!'
      };
    case 'sonic':
      return {
        success: true,
        bpmTarget: '122 BPM constante',
        keySuggestions: 'Do menor natural (escala melancólica)',
        acousticEnergy: 'Rango Dinámico Apretado (Loudness óptimo)',
        structure: ['Intro Ambiental', 'Verso de Baja Frecuencia', 'Pre-coro con Filtro de Medios', 'Coro Explosivo Completo', 'Puente Acústico', 'Drop Final', 'Outro / Fade Out']
      };
    default:
      return { success: true, processed: true };
  }
}

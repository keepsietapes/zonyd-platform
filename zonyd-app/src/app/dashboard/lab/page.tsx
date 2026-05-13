'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Activity, 
  Volume2, 
  Mic2, 
  Music, 
  Layers, 
  Cpu, 
  Sliders, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Waves,
  Play,
  Pause,
  Maximize2,
  Settings2,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TheLabPage() {
  const [mounted, setMounted] = useState(false);
  const [isMastering, setIsMastering] = useState(false);
  const [masteringProgress, setMasteringProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<'warm' | 'bright' | 'club'>('warm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
    // Generate static random heights only on the client to avoid hydration mismatch
    const heights = Array.from({ length: 60 }).map(() => Math.random() * 100);
    setWaveformHeights(heights);
  }, []);

  if (!mounted) return null; // Evitar renderizado en servidor para componentes con random/browser-only logic

  const startMastering = () => {
    setIsMastering(true);
    setMasteringProgress(0);
    
    // Instanciar Web Worker
    const worker = new Worker('/audioWorker.js');
    
    worker.onmessage = (e) => {
      if (e.data.type === 'MASTERING_PROGRESS') {
        setMasteringProgress(e.data.payload.progress);
      } else if (e.data.type === 'MASTERING_COMPLETE') {
        setMasteringProgress(100);
        setIsMastering(false);
        alert(`¡Masterización finalizada! Tu track ahora tiene la energía necesaria para Spotify y Apple Music. (LUFS: ${e.data.payload.lufs})`);
        worker.terminate();
      }
    };

    worker.postMessage({ type: 'START_MASTERING' });
  };

  return (
    <div className="p-8 space-y-10 selection:bg-[#FF9F0A] selection:text-black pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/10 flex items-center justify-center border border-[#FF9F0A]/20 shadow-[0_0_20px_rgba(255,159,10,0.1)]">
                 <Sparkles className="text-[#FF9F0A]" size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">The Lab <span className="text-[#FF9F0A]">(AI Engine)</span></h1>
           </div>
           <p className="text-[#A1A1AA] text-sm">Post-producción inteligente y optimización de audio para DSPs.</p>
        </div>

        <div className="flex gap-2">
           <Button variant="outline" className="border-[#232733] bg-[#151821] text-xs font-bold rounded-xl h-12 px-6">
              <Settings2 size={16} className="mr-2" /> AJUSTES DE AUDIO
           </Button>
           <Button className="bg-[#FF9F0A] text-black font-black px-6 h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20 hover:scale-105 transition-all">
              <Download size={16} className="mr-2" /> EXPORTAR WAV
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* 🎚️ AI MASTERING CENTER */}
         <div className="lg:col-span-8 space-y-8">
            <Card className="bg-gradient-to-br from-[#0B0B0F] to-[#151821] border-[#232733] rounded-[3rem] overflow-hidden relative p-8 shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Cpu size={150} />
               </div>
               
               <div className="relative z-10 space-y-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                     <div>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">AI Mastering Pro</h3>
                        <p className="text-xs text-[#A1A1AA]">Pulido final instantáneo basado en redes neuronales.</p>
                     </div>
                     <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                        {(['warm', 'bright', 'club'] as const).map((preset) => (
                           <button 
                             key={preset}
                             onClick={() => setSelectedPreset(preset)}
                             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedPreset === preset ? 'bg-[#FF9F0A] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}
                           >
                              {preset === 'warm' ? 'Cálido' : preset === 'bright' ? 'Brillante' : 'Club'}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* WAVEFORM SIMULATION */}
                  <div className="h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
                     <div className="flex items-end gap-[2px] w-full px-10 h-32">
                        {waveformHeights.map((h, i) => (
                           <div 
                              key={i} 
                              className={`flex-1 bg-gradient-to-t from-[#FF9F0A] to-[#FFD18C] rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} 
                              style={{ 
                                 height: `${h}%`,
                                 animationDelay: `${i * 0.05}s`
                              }} 
                           />
                        ))}
                     </div>
                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-[#FF9F0A] flex items-center justify-center text-black">
                           {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-[#3A3A3C]">Estado del Motor AI</p>
                           <p className="text-sm font-bold text-white">{isMastering ? `Procesando: ${masteringProgress}%` : 'Listo para procesar'}</p>
                        </div>
                        {!isMastering ? (
                           <Button 
                             onClick={startMastering}
                             className="bg-white text-black font-black px-8 h-12 rounded-xl hover:scale-105 transition-all"
                           >
                              <Zap size={16} className="mr-2" /> MASTERIZAR AHORA
                           </Button>
                        ) : (
                           <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF9F0A] transition-all duration-100" style={{ width: `${masteringProgress}%` }} />
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-6 hover:border-[#FF9F0A]/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#FF9F0A]">
                        <Layers size={24} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-white uppercase italic">Stem Splitter</h4>
                        <p className="text-[10px] text-[#A1A1AA]">Separa voz, bajo y batería con IA.</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-[#3A3A3C] group-hover:text-white transition-colors">
                     SUBIR ARCHIVO <ChevronRight size={14} className="ml-2" />
                  </Button>
               </Card>

               <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-6 hover:border-[#32D74B]/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#32D74B]">
                        <Activity size={24} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-white uppercase italic">Phase Auditor</h4>
                        <p className="text-[10px] text-[#A1A1AA]">Analiza la correlación de fase estéreo.</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-[#3A3A3C] group-hover:text-white transition-colors">
                     INICIAR TEST <ChevronRight size={14} className="ml-2" />
                  </Button>
               </Card>
            </div>
         </div>

         {/* 📉 LOUDNESS & TECHNICAL SPECS */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="bg-[#0B0B0F] border-[#232733] rounded-[2.5rem] p-8 border-t-4 border-t-[#FF9F0A]">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-8 flex items-center gap-2">
                  <Volume2 size={16} className="text-[#FF9F0A]" /> Auditor de Sonoridad
               </CardTitle>
               
               <div className="space-y-10">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-[#A1A1AA]">Spotify / Apple</span>
                        <span className="text-xs font-black text-white">-14.2 LUFS</span>
                     </div>
                     <div className="h-4 bg-[#151821] rounded-full overflow-hidden p-1">
                        <div className="h-full bg-[#32D74B] rounded-full" style={{ width: '85%' }} />
                     </div>
                     <p className="text-[9px] text-[#32D74B] font-bold uppercase text-center">✓ Rango Óptimo</p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-[#A1A1AA]">True Peak</span>
                        <span className="text-xs font-black text-white">-1.0 dB</span>
                     </div>
                     <div className="h-4 bg-[#151821] rounded-full overflow-hidden p-1">
                        <div className="h-full bg-[#FF453A] rounded-full" style={{ width: '95%' }} />
                     </div>
                     <p className="text-[9px] text-[#FF453A] font-bold uppercase text-center">⚠ Posible Clipping Inter-sample</p>
                  </div>
               </div>

               <Button className="w-full mt-10 bg-white/5 text-white font-black h-12 rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10">
                  GENERAR REPORTE TÉCNICO
               </Button>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-[#FF9F0A]/10 border border-[#FF9F0A]/20">
               <div className="flex items-center gap-3 mb-4 text-[#FF9F0A]">
                  <AlertCircle size={18} />
                  <p className="text-xs font-black uppercase tracking-widest">Tip de El Laboratorio</p>
               </div>
               <p className="text-[10px] text-[#A1A1AA] leading-relaxed font-bold">
                  "El preset 'Club' añade una saturación armónica en los 100Hz, ideal para géneros electrónicos. Úsalo con moderación."
               </p>
            </div>

            <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-6 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[#FF9F0A]">
                  <Mic2 size={20} />
               </div>
               <div>
                  <p className="text-xs font-black text-white italic">AI Noise Removal</p>
                  <p className="text-[10px] text-[#A1A1AA]">Limpia ruidos de fondo en voces.</p>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}

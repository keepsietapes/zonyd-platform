'use client';

import { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { authFetch } from '@/lib/api';

export default function TheLabPage() {
  const [mounted, setMounted] = useState(false);
  const [isMastering, setIsMastering] = useState(false);
  const [masteringProgress, setMasteringProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<'warm' | 'bright' | 'club'>('warm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isStemProcessing, setIsStemProcessing] = useState(false);
  const [stemResult, setStemResult] = useState<any>(null);
  const [isPhaseProcessing, setIsPhaseProcessing] = useState(false);
  const [phaseResult, setPhaseResult] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const heights = Array.from({ length: 60 }).map(() => Math.random() * 100);
    setWaveformHeights(heights);
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!mounted) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
      startMastering(selectedFile);
    }
  };

  const startMastering = async (audioFile: File) => {
    setIsMastering(true);
    setMasteringProgress(10);
    setAnalysisResult(null);
    const progressInterval = setInterval(() => {
      setMasteringProgress(p => p < 88 ? p + 6 : p);
    }, 500);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('genre', selectedPreset);
      const data = await authFetch('/api/lab/spectral/analyze', {
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      setMasteringProgress(100);
      setAnalysisResult(data);
      setTimeout(() => setIsMastering(false), 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      alert(`Error al analizar audio: ${err.message}`);
      setIsMastering(false);
      setMasteringProgress(0);
    }
  };

  const handleStemSplit = async () => {
    if (!file) { alert('Primero selecciona un archivo de audio.'); return; }
    setIsStemProcessing(true);
    setStemResult(null);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const data = await authFetch('/api/lab/stems/split', { method: 'POST', body: formData });
      setStemResult(data);
    } catch (err: any) {
      alert(`Error en Stem Splitter: ${err.message}`);
    } finally {
      setIsStemProcessing(false);
    }
  };

  const handlePhaseAudit = async () => {
    if (!file) { alert('Primero selecciona un archivo de audio.'); return; }
    setIsPhaseProcessing(true);
    setPhaseResult(null);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const data = await authFetch('/api/lab/phase/analyze', { method: 'POST', body: formData });
      setPhaseResult(data);
    } catch (err: any) {
      alert(`Error en Phase Auditor: ${err.message}`);
    } finally {
      setIsPhaseProcessing(false);
    }
  };

  const handleExportWav = async () => {
    if (!file) { alert('Primero selecciona un archivo de audio para exportar.'); return; }
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('preset', selectedPreset);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/lab/export/wav`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Error al exportar WAV');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, '')}_master_${selectedPreset}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error al exportar: ${err.message}`);
    }
  };

  const handleTechnicalReport = () => {
    if (!analysisResult) { alert('Primero analiza un archivo de audio.'); return; }
    const report = [
      `REPORTE TÉCNICO DE AUDIO — ZONYD LAB`,
      `Archivo: ${file?.name || 'N/A'}`,
      `Preset aplicado: ${selectedPreset.toUpperCase()}`,
      `---`,
      `LUFS Integrado: ${analysisResult?.metrics?.integrated_lufs?.toFixed(2) ?? 'N/A'} LUFS`,
      `True Peak: ${analysisResult?.metrics?.true_peak_db?.toFixed(2) ?? 'N/A'} dBTP`,
      `Cumple Spotify/Apple: ${analysisResult?.compliance?.spotify ? 'SÍ' : 'NO'}`,
      `---`,
      `Recomendaciones IA:`,
      analysisResult?.recommendations || 'Sin recomendaciones adicionales.',
    ].join('\n');
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_tecnico_zonyd_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
           <Link href="/dashboard/lab/console">
             <Button variant="outline" className="border-[#232733] bg-[#151821] text-xs font-bold rounded-xl h-12 px-6">
               <Settings2 size={16} className="mr-2" /> AJUSTES DE AUDIO
             </Button>
           </Link>
           <Button onClick={handleExportWav} className="bg-[#FF9F0A] text-black font-black px-6 h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20 hover:scale-105 transition-all">
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

                  {/* WAVEFORM + AUDIO REAL */}
                  {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}
                  <div className="h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center group cursor-pointer" onClick={togglePlay}>
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
                     {!audioUrl && (
                       <div className="absolute bottom-4 left-0 right-0 text-center">
                         <p className="text-[10px] text-[#3A3A3C] font-black uppercase tracking-widest">Selecciona un archivo para previsualizar</p>
                       </div>
                     )}
                  </div>

                  <div className="space-y-6">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-[#3A3A3C]">Estado del Motor AI</p>
                           <p className="text-sm font-bold text-white">{isMastering ? `Procesando: ${masteringProgress}%` : 'Listo para procesar'}</p>
                        </div>
                        {!isMastering ? (
                            <div className="flex gap-4">
                               <Link href="/dashboard/lab/console">
                                 <Button 
                                   variant="outline"
                                   className="border-[#FF9F0A] text-[#FF9F0A] font-black px-6 h-12 rounded-xl hover:bg-[#FF9F0A]/10 transition-all"
                                 >
                                   <Maximize2 size={16} className="mr-2" /> FULL CONSOLE
                                 </Button>
                               </Link>
                               <input 
                                 type="file" 
                                 id="audioUpload" 
                                 className="hidden" 
                                 accept="audio/*" 
                                 onChange={handleFileChange} 
                               />
                               <Button 
                                 onClick={() => document.getElementById('audioUpload')?.click()}
                                 className="bg-white text-black font-black px-8 h-12 rounded-xl hover:scale-105 transition-all"
                               >
                                 <Zap size={16} className="mr-2" /> SELECCIONAR AUDIO
                               </Button>
                            </div>
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
               <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-6 hover:border-[#FF9F0A]/30 transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#FF9F0A]">
                        <Layers size={24} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-white uppercase italic">Stem Splitter</h4>
                        <p className="text-[10px] text-[#A1A1AA]">Separa voz, bajo, batería e instrumentos con IA.</p>
                     </div>
                  </div>
                  {stemResult && (
                    <div className="mb-4 p-3 bg-black/40 rounded-xl border border-[#FF9F0A]/20 text-[10px] text-[#A1A1AA] space-y-1">
                      {Object.entries(stemResult).map(([k, v]: any) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-white font-bold capitalize">{k}</span>
                          <a href={v} download className="text-[#FF9F0A] hover:underline">Descargar</a>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button onClick={handleStemSplit} disabled={isStemProcessing} className="w-full bg-[#FF9F0A]/10 hover:bg-[#FF9F0A]/20 text-[#FF9F0A] text-[10px] font-black uppercase tracking-widest border border-[#FF9F0A]/30">
                     {isStemProcessing ? <Loader2 size={14} className="animate-spin mr-2" /> : <ChevronRight size={14} className="mr-2" />}
                     {isStemProcessing ? 'PROCESANDO...' : (file ? 'SEPARAR STEMS' : 'SELECCIONAR AUDIO PRIMERO')}
                  </Button>
               </Card>

               <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-6 hover:border-[#32D74B]/30 transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#32D74B]">
                        <Activity size={24} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-white uppercase italic">Phase Auditor</h4>
                        <p className="text-[10px] text-[#A1A1AA]">Correlación de fase estéreo y compatibilidad mono.</p>
                     </div>
                  </div>
                  {phaseResult && (
                    <div className="mb-4 p-3 bg-black/40 rounded-xl border border-[#32D74B]/20 text-[10px] text-[#A1A1AA] space-y-1">
                      <p><span className="text-white font-bold">Correlación:</span> {phaseResult.correlation?.toFixed(3) ?? 'N/A'}</p>
                      <p><span className="text-white font-bold">Estado Mono:</span> {phaseResult.monoCompatible ? '✓ Compatible' : '⚠ Problemas detectados'}</p>
                      {phaseResult.recommendation && <p className="italic text-[#A1A1AA]">{phaseResult.recommendation}</p>}
                    </div>
                  )}
                  <Button onClick={handlePhaseAudit} disabled={isPhaseProcessing} className="w-full bg-[#32D74B]/10 hover:bg-[#32D74B]/20 text-[#32D74B] text-[10px] font-black uppercase tracking-widest border border-[#32D74B]/30">
                     {isPhaseProcessing ? <Loader2 size={14} className="animate-spin mr-2" /> : <ChevronRight size={14} className="mr-2" />}
                     {isPhaseProcessing ? 'ANALIZANDO...' : (file ? 'INICIAR ANÁLISIS DE FASE' : 'SELECCIONAR AUDIO PRIMERO')}
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
                        <span className="text-xs font-black text-white">{analysisResult?.metrics?.integrated_lufs ? `${analysisResult.metrics.integrated_lufs.toFixed(1)} LUFS` : '-14.2 LUFS'}</span>
                     </div>
                     <div className="h-4 bg-[#151821] rounded-full overflow-hidden p-1">
                        <div className={`h-full rounded-full ${analysisResult?.compliance?.spotify ? 'bg-[#32D74B]' : 'bg-[#FF453A]'}`} style={{ width: analysisResult ? '100%' : '85%' }} />
                     </div>
                     <p className={`text-[9px] font-bold uppercase text-center ${analysisResult?.compliance?.spotify ? 'text-[#32D74B]' : 'text-[#FF453A]'}`}>
                        {analysisResult?.compliance?.spotify ? '✓ Rango Óptimo' : '⚠ Requiere Ajuste'}
                     </p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-[#A1A1AA]">True Peak</span>
                        <span className="text-xs font-black text-white">{analysisResult?.metrics?.true_peak_db ? `${analysisResult.metrics.true_peak_db.toFixed(1)} dB` : '-1.0 dB'}</span>
                     </div>
                     <div className="h-4 bg-[#151821] rounded-full overflow-hidden p-1">
                        <div className={`h-full rounded-full ${analysisResult?.metrics?.true_peak_db > -1.0 ? 'bg-[#FF453A]' : 'bg-[#32D74B]'}`} style={{ width: analysisResult ? '100%' : '95%' }} />
                     </div>
                     <p className={`text-[9px] font-bold uppercase text-center ${analysisResult?.metrics?.true_peak_db > -1.0 ? 'text-[#FF453A]' : 'text-[#32D74B]'}`}>
                        {analysisResult?.metrics?.true_peak_db > -1.0 ? '⚠ Posible Clipping Inter-sample' : '✓ Sin Clipping'}
                     </p>
                  </div>
               </div>

               {analysisResult?.recommendations && (
                 <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                   <p className="text-xs text-white italic">Recomendación IA:</p>
                   <p className="text-[11px] text-[#A1A1AA] mt-2 whitespace-pre-line">{analysisResult.recommendations}</p>
                 </div>
               )}

               <Button onClick={handleTechnicalReport} className="w-full mt-10 bg-white/5 text-white font-black h-12 rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2">
                  <FileText size={14} /> GENERAR REPORTE TÉCNICO
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

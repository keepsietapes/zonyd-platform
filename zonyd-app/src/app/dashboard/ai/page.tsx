'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Zap, 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  Bot,
  ArrowRight,
  Lock,
  Camera,
  Music2,
  Globe,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ZonydAIPage() {
  const [isPro, setIsPro] = useState(false); // Simulación de Plan
  const [query, setQuery] = useState('');

  // Si el usuario es FREE, mostramos el Paywall
  if (!isPro) {
    return (
      <div className="p-8 h-full flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[#0B0B0F]/40 backdrop-blur-md z-10" />
        
        {/* Contenido Difuminado de Fondo */}
        <div className="w-full max-w-5xl opacity-20 pointer-events-none filter blur-sm">
           <div className="h-64 bg-[#151821] rounded-3xl mb-8" />
           <div className="grid grid-cols-2 gap-8">
              <div className="h-96 bg-[#151821] rounded-3xl" />
              <div className="h-96 bg-[#151821] rounded-3xl" />
           </div>
        </div>

        {/* Paywall Card */}
        <Card className="relative z-20 w-full max-w-lg bg-[#151821] border-[#7B61FF]/50 shadow-[0_0_100px_rgba(123,97,255,0.2)] rounded-[2.5rem] overflow-hidden p-8 text-center border-2">
           <div className="w-20 h-20 bg-[#7B61FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#7B61FF]/20">
              <Lock className="text-[#7B61FF]" size={32} />
           </div>
           <h2 className="text-3xl font-black text-white mb-4 uppercase italic">Contenido Exclusivo Pro</h2>
           <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8 px-4">
              El **AI Command Center** utiliza modelos de lenguaje masivos y análisis de datos en tiempo real para optimizar tu carrera. Esta función solo está disponible para miembros **Pro** y **Label**.
           </p>
           
           <div className="space-y-4 mb-8 text-left bg-black/40 p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 text-xs text-white/80">
                 <Sparkles size={14} className="text-[#7B61FF]" /> Estrategias de Marketing Personalizadas
              </div>
              <div className="flex items-center gap-3 text-xs text-white/80">
                 <ShieldCheck size={14} className="text-[#34C759]" /> Auditoría de Copyright Preventiva
              </div>
              <div className="flex items-center gap-3 text-xs text-white/80">
                 <TrendingUp size={14} className="text-[#4F8CFF]" /> Predicciones de Streams y Revenue
              </div>
           </div>

           <Button 
              onClick={() => setIsPro(true)}
              className="w-full bg-[#7B61FF] hover:bg-[#7B61FF]/90 text-white font-black h-14 rounded-2xl text-lg shadow-xl shadow-[#7B61FF]/20 group"
           >
              DESBLOQUEAR AHORA <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
           </Button>
           <p className="mt-4 text-[10px] text-[#A1A1AA] uppercase font-black tracking-widest">Desde $9.99 USD / mes</p>
        </Card>
      </div>
    );
  }

  // Si el usuario es PRO, mostramos el Dashboard de IA
  return (
    <div className="p-8 h-full space-y-8 animate-in fade-in duration-1000">
      
      {/* AI Header with Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <div className="relative p-10 rounded-[2.5rem] overflow-hidden border border-[#7B61FF]/30 bg-[#0B0B0F] shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B61FF]/10 blur-[100px] -mr-32 -mt-32" />
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 max-w-xl">
                     <div className="flex items-center gap-2 text-[#7B61FF] font-black text-xs uppercase tracking-[0.4em]">
                        <Zap size={14} className="fill-[#7B61FF]" /> Sistema Operativo IA v2.0
                     </div>
                     <h1 className="text-4xl font-black tracking-tighter text-white leading-tight italic">
                        ZONYD COMMAND CENTER
                     </h1>
                     <p className="text-[#A1A1AA] text-sm leading-relaxed">
                        Tu identidad digital está siendo analizada. Vincula tus redes para que **Zonyd AI** acceda a métricas profundas y optimice tu próximo lanzamiento.
                     </p>
                  </div>
                  <div className="flex flex-col gap-3">
                     <SocialLink icon={<Music2 size={16} />} label="Spotify Linked" color="#1DB954" />
                     <SocialLink icon={<Camera size={16} />} label="IG Connected" color="#E4405F" />
                     <SocialLink icon={<Globe size={16} />} label="TikTok Synced" color="#00F2FE" />
                  </div>
               </div>
            </div>

            {/* AI Chat Area */}
            <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-2xl">
               <div className="bg-black/20 p-4 border-b border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#7B61FF] flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(123,97,255,0.5)]">
                     <Bot size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-widest italic">Análisis en tiempo real activo</span>
               </div>
               <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div className="flex gap-4">
                     <div className="bg-[#1c1f2a] p-4 rounded-2xl rounded-tl-none border border-white/5 text-xs text-[#A1A1AA] leading-relaxed max-w-[80%]">
                        He analizado tus últimos 30 días en **TikTok**. Tu canción "Neon Nights" está siendo usada por creadores en el sector de "Gaming". Recomendamos potenciar esa vertical.
                     </div>
                  </div>
                  <div className="flex gap-4 justify-end">
                     <div className="bg-[#7B61FF] p-4 rounded-2xl rounded-tr-none text-xs text-white font-medium max-w-[80%]">
                        ¿Qué hashtags debo usar para atraer más gamers?
                     </div>
                  </div>
               </div>
               <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
                  <input type="text" placeholder="Escribe a tu Co-Manager..." className="flex-1 bg-[#0B0B0F] border border-[#232733] rounded-full px-6 py-4 text-xs outline-none focus:border-[#7B61FF] transition-all text-white" />
                  <Button className="w-12 h-12 bg-[#7B61FF] rounded-full shrink-0"><Send size={18} /></Button>
               </div>
            </Card>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-6">
            <Card className="bg-[#151821] border-[#232733] rounded-3xl p-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] mb-4">Métricas de Influencia IA</h3>
               <div className="space-y-6">
                  <StatRow label="Virilidad Estimada" value="78%" color="#7B61FF" />
                  <StatRow label="Optimización Metadatos" value="92%" color="#34C759" />
                  <StatRow label="Discovery Rate" value="45%" color="#FF9F0A" />
               </div>
            </Card>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#7B61FF]/20 to-transparent border border-[#7B61FF]/30">
               <div className="flex items-center gap-2 text-white font-black text-xs uppercase mb-3">
                  <Info size={14} className="text-[#7B61FF]" /> Nota de Motor
               </div>
               <p className="text-[10px] text-[#A1A1AA] leading-relaxed italic">
                  Este módulo es impulsado por **Gemini 2.0 Pro** de Google DeepMind. Zonyd procesa los datos mediante un motor de **RAG Dinámico** para asegurar que las tendencias tengan menos de 1 hora de retraso.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function SocialLink({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 rounded-xl group cursor-pointer hover:border-white/20 transition-all">
       <div style={{ color }} className="group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{label}</span>
       <CheckCircle2 size={12} className="text-[#34C759] ml-auto" />
    </div>
  );
}

function StatRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-[#A1A1AA] uppercase">{label}</span>
          <span className="text-sm font-black text-white">{value}</span>
       </div>
       <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: value, backgroundColor: color }} />
       </div>
    </div>
  );
}

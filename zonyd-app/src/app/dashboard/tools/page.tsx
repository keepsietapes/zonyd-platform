'use client';

import { useState } from 'react';
import { 
  Calculator, 
  RefreshCw, 
  Music2, 
  FileAudio, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Globe,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ToolsPage() {
  const [calcStreams, setCalcStreams] = useState(100000);
  
  // Cálculo aproximado de regalías ($0.004 por stream promedio)
  const estimatedRevenue = (calcStreams * 0.004).toFixed(2);

  const TOOLS = [
    {
      title: 'Calculadora de Royalties',
      desc: 'Estima tus ingresos brutos basados en streams proyectados en Spotify/Apple Music.',
      icon: <Calculator className="text-[#FF9F0A]" />,
      action: 'CALCULAR AHORA',
      isInteractive: true
    },
    {
      title: 'Conversor de Audio Pro',
      desc: 'Convierte archivos WAV a MP3 (320kbps) o FLAC manteniendo los metadatos ISRC.',
      icon: <RefreshCw className="text-[#4F8CFF]" />,
      action: 'SUBIR ARCHIVO',
      requiresPro: true
    },
    {
      title: 'Generador de Press Kit',
      desc: 'Crea un Media Kit profesional en PDF con tus fotos, bio y links de redes sociales.',
      icon: <FileAudio className="text-[#34C759]" />,
      action: 'GENERAR PDF',
    },
    {
      title: 'Buscador de ISRC',
      desc: 'Valida o recupera códigos ISRC registrados globalmente para tus tracks.',
      icon: <Music2 className="text-[#7B61FF]" />,
      action: 'BUSCAR CÓDIGO',
    }
  ];

  return (
    <div className="p-8 space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                 <Zap className="text-white" size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Herramientas</h1>
           </div>
           <p className="text-[#A1A1AA] text-sm">Utilidades técnicas para optimizar tu flujo de trabajo musical.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Herramientas Principales */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map((tool, i) => (
            <Card key={i} className="bg-[#151821] border-[#232733] rounded-3xl p-8 hover:border-white/20 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <h3 className="text-lg font-black text-white uppercase italic mb-2 tracking-tight">{tool.title}</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8">{tool.desc}</p>
              
              {tool.isInteractive && tool.title === 'Calculadora de Royalties' ? (
                <div className="space-y-4 mb-8">
                  <input 
                    type="range" 
                    min="1000" 
                    max="1000000" 
                    step="1000"
                    value={calcStreams}
                    onChange={(e) => setCalcStreams(parseInt(e.target.value))}
                    className="w-full accent-[#FF9F0A]"
                  />
                  <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-[#A1A1AA] uppercase">Ingreso Est.</span>
                    <span className="text-xl font-black text-[#34C759] tracking-tighter">${estimatedRevenue} USD</span>
                  </div>
                  <p className="text-[9px] text-[#3A3A3C] uppercase font-bold text-center">Basado en {calcStreams.toLocaleString()} streams</p>
                </div>
              ) : null}

              <Button className="w-full bg-white/5 border border-white/10 text-white font-black h-12 rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10">
                {tool.action} {tool.requiresPro && <span className="ml-2 text-[#FF9F0A]">(PRO)</span>}
              </Button>
            </Card>
          ))}
        </div>

        {/* Sidebar Tips */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="bg-gradient-to-br from-[#151821] to-[#0B0B0F] border-[#232733] rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="text-[#4F8CFF]" size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Zonyd Global Network</h3>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8">
                Como miembro de Zonyd, tienes acceso a descuentos exclusivos en servicios de terceros como <strong className="text-white">SubmitHub</strong>, <strong className="text-white">Groover</strong> y <strong className="text-white">SoundCloud Pro</strong>.
              </p>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-white">Groover Pack</span>
                    <span className="text-[10px] text-[#34C759] font-black">-15% OFF</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-white">SubmitHub Credits</span>
                    <span className="text-[10px] text-[#34C759] font-black">5 FREE</span>
                 </div>
              </div>
           </Card>

           <div className="p-8 rounded-[2.5rem] bg-[#FF9F0A]/5 border border-[#FF9F0A]/20">
              <div className="flex items-center gap-3 mb-4 text-[#FF9F0A]">
                 <TrendingUp size={18} />
                 <p className="text-xs font-black uppercase tracking-widest">Tip de Carrera</p>
              </div>
              <p className="text-[10px] text-[#A1A1AA] leading-relaxed italic">
                "No esperes al día del lanzamiento para crear tu Press Kit. Tenlo listo 3 semanas antes para enviar a blogs y curadores."
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}

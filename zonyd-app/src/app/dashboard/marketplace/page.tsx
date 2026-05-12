'use client';

import { useState } from 'react';
import { 
  ShoppingBag, 
  Globe, 
  FileCheck, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Zap, 
  Play, 
  ListMusic, 
  Film, 
  Tv, 
  Gamepad2, 
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  ShieldCheck,
  Share2,
  ExternalLink,
  Video,
  FileSearch
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SYNC_OPPORTUNITIES = [
  { id: 1, type: 'Film', client: 'Netflix Original', budget: '$5,000 - $8,000', genre: 'Cinematic / Orchestral', deadline: '2 days left', icon: <Film size={18} /> },
  { id: 2, type: 'Ad', client: 'Nike Global Campaign', budget: '$12,000+', genre: 'Hip Hop / High Energy', deadline: '5 days left', icon: <Tv size={18} /> },
  { id: 3, type: 'Gaming', client: 'Ubisoft Project X', budget: '$2,500 - $4,000', genre: 'Electronic / Cyberpunk', deadline: '12h left', icon: <Gamepad2 size={18} /> },
];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'Film' | 'Gaming' | 'Ad'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);

  const handleGenerateMediaKit = () => {
    setIsGeneratingKit(true);
    setTimeout(() => {
      setIsGeneratingKit(false);
      alert('¡Media Kit Automático generado! Enlace profesional: https://zonyd.com/kit/budd-artist (Copiado al portapapeles)');
      navigator.clipboard.writeText('https://zonyd.com/kit/budd-artist');
    }, 1500);
  };

  const filteredOpportunities = SYNC_OPPORTUNITIES.filter(opp => {
    const matchesSearch = opp.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         opp.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || opp.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePostular = (client: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('¡Propuesta enviada con éxito a ' + client + '! Tu track está en revisión por el supervisor musical.');
    }, 2000);
  };

  return (
    <div className="p-8 space-y-10 selection:bg-[#FF9F0A] selection:text-black pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/10 flex items-center justify-center border border-[#FF9F0A]/20 shadow-[0_0_20px_rgba(255,159,10,0.1)]">
                 <ShoppingBag className="text-[#FF9F0A]" size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Marketplace <span className="text-[#FF9F0A]">& Sync</span></h1>
           </div>
           <p className="text-[#A1A1AA] text-sm">Monetiza tu música a través de licencias para cine, TV y publicidad.</p>
        </div>

        <div className="flex flex-wrap gap-2">
           <Button 
             onClick={handleGenerateMediaKit}
             disabled={isGeneratingKit}
             variant="outline" 
             className="border-[#FF9F0A] text-[#FF9F0A] font-black px-6 h-12 rounded-xl hover:bg-[#FF9F0A] hover:text-black transition-all"
           >
              {isGeneratingKit ? <Zap className="animate-spin mr-2" /> : <Share2 size={16} className="mr-2" />} 
              MEDIA KIT IA
           </Button>
           <Button 
             onClick={() => alert('Abriendo Librería de Masters de alta fidelidad...')}
             className="bg-white text-black font-black px-6 h-12 rounded-xl hover:scale-105 transition-all"
           >
              <ListMusic size={16} className="mr-2" /> GESTIONAR MASTERS
           </Button>
           <Button 
             onClick={() => alert('Iniciando proceso de postulación rápida (Quick-Sync)...')}
             className="bg-[#FF9F0A] text-black font-black px-6 h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20 hover:scale-105 transition-all"
           >
              <Zap size={16} className="mr-2" /> ENVIAR TRACK
           </Button>
        </div>
      </div>

      {/* 📊 MARKETPLACE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 flex items-center justify-between group cursor-pointer hover:border-[#FF9F0A]/30 transition-all">
            <div>
               <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-1">Oportunidades de Sync</p>
               <h3 className="text-3xl font-black text-white italic">142</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FF9F0A]/5 flex items-center justify-center text-[#FF9F0A] group-hover:scale-110 transition-transform">
               <ArrowUpRight size={24} />
            </div>
         </div>
         <div className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 flex items-center justify-between group cursor-pointer hover:border-[#4F8CFF]/30 transition-all">
            <div>
               <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-1">Licencias Activas</p>
               <h3 className="text-3xl font-black text-white italic">8</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#4F8CFF]/5 flex items-center justify-center text-[#4F8CFF] group-hover:scale-110 transition-transform">
               <FileCheck size={24} />
            </div>
         </div>
         <div className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 flex items-center justify-between group cursor-pointer hover:border-[#32D74B]/30 transition-all">
            <div>
               <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-1">Ingresos por Licencias</p>
               <h3 className="text-3xl font-black text-[#32D74B] italic">$14,250</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#32D74B]/5 flex items-center justify-center text-[#32D74B] group-hover:scale-110 transition-transform">
               <CheckCircle2 size={24} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* 🎬 SYNC FEED */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
               <div className="flex bg-[#151821] p-1 rounded-xl border border-white/5 w-full sm:w-auto">
                  {(['all', 'Film', 'Ad', 'Gaming'] as const).map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#FF9F0A] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}
                     >
                        {cat === 'all' ? 'Todos' : cat}
                     </button>
                  ))}
               </div>
               <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3C]" size={14} />
                  <input 
                    type="text" 
                    placeholder="Buscar marca o género..." 
                    className="w-full bg-[#151821] border border-[#232733] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-[#FF9F0A] transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-4">
               {filteredOpportunities.length === 0 ? (
                  <div className="py-20 text-center bg-[#151821] rounded-[2rem] border border-dashed border-[#232733]">
                     <ShoppingBag className="mx-auto mb-4 text-[#232733]" size={40} />
                     <p className="text-[#3A3A3C] font-black uppercase tracking-widest">No hay oportunidades coincidentes</p>
                  </div>
               ) : (
                  filteredOpportunities.map((opp) => (
                     <Card key={opp.id} className="bg-[#151821] border-[#232733] rounded-[2rem] overflow-hidden hover:border-[#FF9F0A]/40 transition-all group p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[#FF9F0A] shadow-inner shrink-0">
                              {opp.icon}
                           </div>
                           <div className="flex-1 text-center sm:text-left">
                              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-[#FF9F0A] bg-[#FF9F0A]/10 px-2 py-0.5 rounded">{opp.type}</span>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-[#A1A1AA]">{opp.deadline}</span>
                              </div>
                              <h4 className="text-lg font-black text-white italic">{opp.client}</h4>
                              <p className="text-xs text-[#A1A1AA] mt-1">Busca: <span className="text-white font-bold">{opp.genre}</span></p>
                           </div>
                           <div className="text-center sm:text-right shrink-0">
                              <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-1">Presupuesto</p>
                              <p className="text-xl font-black text-[#32D74B]">{opp.budget}</p>
                              <Button 
                                onClick={() => handlePostular(opp.client)}
                                disabled={isSubmitting}
                                className="mt-4 bg-white text-black font-black text-[10px] h-9 rounded-lg px-6 uppercase group-hover:bg-[#FF9F0A] transition-colors"
                              >
                                 {isSubmitting ? 'Enviando...' : 'Postular Track'}
                              </Button>
                           </div>
                        </div>
                     </Card>
                  ))
               )}
            </div>
         </div>

         {/* 🛠️ ASSET AUDITOR & AI SYNC */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="bg-[#0B0B0F] border-[#232733] rounded-[2.5rem] overflow-hidden p-8 border-b-4 border-b-[#FF9F0A] shadow-2xl">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-[#FF9F0A]" size={16} /> Auditoría de Masters
               </CardTitle>
               <p className="text-[10px] text-[#A1A1AA] leading-relaxed mb-6">
                  Para ser elegible para Sync, tus tracks deben tener metadatos completos y stems disponibles.
               </p>
               <div className="space-y-4">
                  <AssetStatus label="Instrumentales" status="complete" onClick={() => alert('Archivo instrumental validado correctamente.')} />
                  <AssetStatus label="Letras (Lyrics)" status="pending" onClick={() => alert('Faltan letras sincronizadas. Sube un archivo .LRC para completar.')} />
                  <AssetStatus label="Stems de Mezcla" status="pending" onClick={() => alert('No hemos detectado los stems de batería, bajo, voces y melodía. Sube un .ZIP con los stems.')} />
                  <AssetStatus label="Metadatos ISRC/UPC" status="complete" onClick={() => alert('Metadatos de propiedad intelectual verificados.')} />
               </div>
               <Button 
                 onClick={() => alert('Abriendo editor de catálogo para corregir activos faltantes...')}
                 variant="outline" className="w-full mt-8 border-[#232733] text-[10px] font-black uppercase tracking-widest hover:bg-white/5 h-12 rounded-xl"
               >
                  COMPLETAR CATÁLOGO
               </Button>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#7B61FF] to-[#4F8CFF] text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => alert('Abriendo Zonyd Sync Agent...')}>
               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
                  <Sparkles size={80} />
               </div>
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Zonyd Sync Agent</p>
                  <h3 className="text-xl font-black italic leading-tight">"Tu track 'Midnight Drive' es 92% compatible con la campaña de Nike."</h3>
                  <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase">APLICAR CON IA <ArrowUpRight size={14} /></div>
               </div>
            </div>

            <Card 
               className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-6 hover:bg-white/5 cursor-pointer transition-all group"
               onClick={() => alert('Reproduciendo Video Tutorial: "Cómo dominar el Marketplace de Sincronización"...')}
            >
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[#FF9F0A] group-hover:scale-110 transition-transform">
                     <Video size={20} />
                  </div>
                  <div>
                     <p className="text-xs font-black text-white italic group-hover:text-[#FF9F0A] transition-colors">Tutorial Marketplace</p>
                     <p className="text-[10px] text-[#A1A1AA]">Aprende cómo cerrar tu primer Sync.</p>
                  </div>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}

function AssetStatus({ label, status, onClick }: { label: string, status: 'complete' | 'pending', onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 cursor-pointer transition-all"
    >
       <span className="text-[11px] font-bold text-[#A1A1AA]">{label}</span>
       {status === 'complete' ? (
          <CheckCircle2 size={14} className="text-[#32D74B]" />
       ) : (
          <AlertCircle size={14} className="text-[#FF453A]" />
       )}
    </div>
  );
}

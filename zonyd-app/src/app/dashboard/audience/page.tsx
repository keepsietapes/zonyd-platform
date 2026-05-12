'use client';

import { useState } from 'react';
import { 
  Users, 
  Mail, 
  Zap, 
  Search, 
  Filter, 
  Download, 
  Star, 
  Gift, 
  MessageSquare,
  Globe,
  TrendingUp,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Music,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MOCK_FANS = [
  { id: 1, name: 'Alex Rivera', email: 'alex.r@mail.com', location: 'CDMX, MX', engagement: 98, lastSeen: '2 min ago', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&h=100&fit=crop' },
  { id: 2, name: 'Sofia Chen', email: 'sofi.c@music.io', location: 'Madrid, ES', engagement: 85, lastSeen: '1h ago', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&fit=crop' },
  { id: 3, name: 'Marco Rossi', email: 'm.rossi@web.it', location: 'Milan, IT', engagement: 72, lastSeen: '5h ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&fit=crop' },
  { id: 4, name: 'Elena Petrova', email: 'elena.p@global.com', location: 'Berlin, DE', engagement: 92, lastSeen: 'Just now', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&fit=crop' },
];

export default function AudiencePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'loyal' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [preSaveEnabled, setPreSaveEnabled] = useState(true);
  const [isLaunchingAirdrop, setIsLaunchingAirdrop] = useState(false);

  const filteredFans = MOCK_FANS.filter(fan => {
    const matchesSearch = fan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         fan.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'loyal') return matchesSearch && fan.engagement >= 85;
    if (activeTab === 'new') return matchesSearch && fan.lastSeen.includes('now') || fan.lastSeen.includes('min');
    return matchesSearch;
  });

  const handleLaunchAirdrop = () => {
    setIsLaunchingAirdrop(true);
    setTimeout(() => {
      setIsLaunchingAirdrop(false);
      alert('¡Airdrop de Recompensa enviado con éxito a tus ' + filteredFans.length + ' fans seleccionados!');
    }, 2000);
  };

  return (
    <div className="p-8 space-y-10 selection:bg-[#4F8CFF] selection:text-white pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/10 flex items-center justify-center border border-[#4F8CFF]/20">
                 <Users className="text-[#4F8CFF]" size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Audiencia</h1>
           </div>
           <p className="text-[#A1A1AA] text-sm">Gestiona tu base de fans y crea conexiones directas.</p>
        </div>

        <div className="flex gap-2">
           <Button 
             onClick={handleLaunchAirdrop}
             disabled={isLaunchingAirdrop}
             className="bg-[#FF9F0A] text-black font-black px-6 h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20 hover:scale-105 transition-all"
           >
              {isLaunchingAirdrop ? <Loader2 className="animate-spin mr-2" /> : <Zap size={16} className="mr-2" />} 
              {isLaunchingAirdrop ? 'ENVIANDO...' : 'LANZAR AIRDROP'}
           </Button>
           <Button 
             onClick={() => alert('Abriendo centro de mensajería directa...')}
             variant="outline" className="border-[#232733] bg-[#151821] text-xs font-bold rounded-xl h-12 px-6"
           >
              <Mail size={16} className="mr-2" /> COMUNICAR
           </Button>
        </div>
      </div>

      {/* 📊 AUDIENCE KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <Users size={80} />
            </div>
            <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Fans Totales</p>
            <h3 className="text-4xl font-black text-white italic">12,450</h3>
            <div className="flex items-center gap-1 text-[10px] text-[#32D74B] font-bold mt-2">
               <TrendingUp size={12} /> +12% este mes
            </div>
         </Card>
         <Card className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <Star size={80} className="text-[#FF9F0A]" />
            </div>
            <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Fans Leales (Superfans)</p>
            <h3 className="text-4xl font-black text-[#FF9F0A] italic">842</h3>
            <p className="text-[10px] text-[#A1A1AA] mt-2">Engagement &gt; 80%</p>
         </Card>
         <Card className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <Globe size={80} className="text-[#4F8CFF]" />
            </div>
            <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Alcance Global</p>
            <h3 className="text-4xl font-black text-white italic">42 <span className="text-sm font-normal text-[#A1A1AA]">Países</span></h3>
            <p className="text-[10px] text-[#A1A1AA] mt-2">Top: México, España, USA</p>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* 👥 FAN CRM TABLE */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex bg-[#151821] p-1 rounded-xl border border-white/5">
                  <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-[#232733] text-white shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Todos</button>
                  <button onClick={() => setActiveTab('loyal')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'loyal' ? 'bg-[#FF9F0A] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Leales</button>
               </div>
               <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3C]" size={14} />
                  <input 
                    type="text" 
                    placeholder="Buscar fan..." 
                    className="w-full bg-[#151821] border border-[#232733] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-[#4F8CFF] transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>

            <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-black/40 border-b border-white/5">
                        <tr>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Fan</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Ubicación</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Engagement</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Última Actividad</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest text-right">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {filteredFans.length === 0 ? (
                           <tr>
                              <td colSpan={5} className="px-6 py-20 text-center text-[#3A3A3C] font-black uppercase tracking-widest">
                                 No se encontraron fans
                              </td>
                           </tr>
                        ) : (
                           filteredFans.map((fan) => (
                              <tr key={fan.id} className="hover:bg-white/5 transition-colors group">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
                                          <img src={fan.avatar} className="w-full h-full object-cover" alt="" />
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-white">{fan.name}</p>
                                          <p className="text-[9px] text-[#A1A1AA]">{fan.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <p className="text-[10px] font-bold text-[#A1A1AA] flex items-center gap-1">
                                       <Globe size={10} /> {fan.location}
                                    </p>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                       <div className="h-1 w-16 bg-[#232733] rounded-full overflow-hidden">
                                          <div className="h-full bg-gradient-to-r from-[#4F8CFF] to-[#7B61FF]" style={{ width: `${fan.engagement}%` }} />
                                       </div>
                                       <span className="text-[10px] font-black text-white">{fan.engagement}%</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-[10px] font-bold text-[#A1A1AA]">{fan.lastSeen}</span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <Button 
                                      onClick={() => alert('Iniciando chat privado con ' + fan.name)}
                                      variant="ghost" size="icon" className="text-[#3A3A3C] hover:text-white rounded-full"
                                    >
                                       <MessageSquare size={16} />
                                    </Button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>

         {/* 🎁 AIRDROP & ENGAGEMENT TOOLS */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="bg-gradient-to-br from-[#0B0B0F] to-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden relative group p-8">
               <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#FF9F0A]/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform" />
               <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF9F0A]/10 flex items-center justify-center mb-6 border border-[#FF9F0A]/20">
                     <Gift className="text-[#FF9F0A]" size={28} />
                  </div>
                  <h3 className="text-xl font-black text-white italic tracking-tighter mb-2">Airdrop de Recompensa</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8">
                     Envía contenido exclusivo (Demos, Behind the scenes, Merch) a tus <span className="text-white font-bold">842 Superfans</span> automáticamente.
                  </p>
                  <Button 
                    onClick={() => alert('Abriendo editor de Airdrops para Superfans...')}
                    className="w-full bg-[#FF9F0A] text-black font-black h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20"
                  >
                     CONFIGURAR REGALO
                  </Button>
               </div>
            </Card>

            <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden p-8 border-t-4 border-t-[#4F8CFF]">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-[#4F8CFF]" size={16} /> Verificación de Fan
               </CardTitle>
               <div className="space-y-6">
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-[#4F8CFF]/20 flex items-center justify-center text-[#4F8CFF]">
                        <Music size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Habilitar Pre-save Reward</p>
                        <p className="text-[9px] text-[#A1A1AA]">Acceso a carpetas exclusivas post pre-save.</p>
                     </div>
                     <div 
                       onClick={() => setPreSaveEnabled(!preSaveEnabled)}
                       className={`ml-auto w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${preSaveEnabled ? 'bg-[#4F8CFF]' : 'bg-[#232733]'}`}
                     >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${preSaveEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                     </div>
                  </div>
               </div>
            </Card>

            <div className="p-6 rounded-[2rem] bg-[#7B61FF]/10 border border-[#7B61FF]/20 flex items-center gap-4 group cursor-pointer hover:bg-[#7B61FF]/20 transition-all">
               <Zap className="text-[#7B61FF]" size={24} fill="currentColor" />
               <div>
                  <p className="text-xs font-black text-white uppercase italic tracking-tighter">Zonyd AI Tip</p>
                  <p className="text-[10px] text-[#A1A1AA] font-bold">"Los fans en Berlín están interactuando un 20% más con tus historias."</p>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

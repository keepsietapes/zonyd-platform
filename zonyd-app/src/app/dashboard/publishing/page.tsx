'use client';

import { useState } from 'react';
import { 
  FileText, 
  Scale, 
  ShieldCheck, 
  Globe, 
  Video, 
  Music, 
  PenTool, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Plus,
  Lock,
  Gavel
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MOCK_IP_STATS = [
  { label: 'Obras Registradas', value: '42', icon: <Music size={16} /> },
  { label: 'Regalías Editoriales', value: '$1,240.50', icon: <Globe size={16} /> },
  { label: 'Reclamaciones ID', value: '8', icon: <Video size={16} /> },
];

const SONG_REGISTRATIONS = [
  { id: 1, title: 'Neon Lights', artist: 'Budd Artist', pro: 'SACM', status: 'Registered', date: 'Oct 12, 2025' },
  { id: 2, title: 'Midnight Drive', artist: 'Budd Artist', pro: 'ASCAP', status: 'Pending', date: 'Jan 05, 2026' },
  { id: 3, title: 'Slow Burn', artist: 'Budd Artist', pro: 'BMI', status: 'Registered', date: 'Aug 22, 2025' },
];

export default function PublishingPage() {
  const [activeTab, setActiveTab] = useState<'works' | 'lyrics' | 'legal'>('works');

  return (
    <div className="p-8 space-y-10 selection:bg-[#FFD700] selection:text-black pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/20 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                 <Scale className="text-[#FFD700]" size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Publishing <span className="text-[#FFD700]">& Rights</span></h1>
           </div>
           <p className="text-[#A1A1AA] text-sm">Protección global y administración de tu propiedad intelectual.</p>
        </div>

        <div className="flex gap-2">
           <Button variant="outline" className="border-[#232733] bg-[#151821] text-xs font-bold rounded-xl h-12 px-6 hover:border-[#FFD700]/50 transition-all">
              <ShieldCheck size={16} className="mr-2" /> CONTENT ID WHITELIST
           </Button>
           <Button className="bg-white text-black font-black px-6 h-12 rounded-xl shadow-lg hover:scale-105 transition-all">
              <Plus size={16} className="mr-2" /> REGISTRAR OBRA
           </Button>
        </div>
      </div>

      {/* 📊 IP STATS QUICK LOOK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_IP_STATS.map((stat, i) => (
          <Card key={i} className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 flex items-center gap-4 hover:bg-white/5 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[#FFD700]">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-[#3A3A3C] uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* ⚖️ REGISTRATION TABLE */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex bg-[#151821] p-1 rounded-xl border border-white/5">
                  <button onClick={() => setActiveTab('works')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'works' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Obras</button>
                  <button onClick={() => setActiveTab('lyrics')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'lyrics' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Letras</button>
                  <button onClick={() => setActiveTab('legal')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'legal' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Legal</button>
               </div>
            </div>

            <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-black/40 border-b border-white/5">
                        <tr>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Obra Musical</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">PRO</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Estado</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest text-right">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {SONG_REGISTRATIONS.map((song) => (
                           <tr key={song.id} className="hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4">
                                 <div>
                                    <p className="text-xs font-black text-white">{song.title}</p>
                                    <p className="text-[9px] text-[#A1A1AA] uppercase font-bold tracking-tighter">{song.artist}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="text-[10px] font-black text-white bg-white/5 px-2 py-1 rounded border border-white/10 uppercase">{song.pro}</span>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`flex items-center gap-1 text-[10px] font-bold ${song.status === 'Registered' ? 'text-[#32D74B]' : 'text-[#FF9F0A]'}`}>
                                    {song.status === 'Registered' ? <CheckCircle2 size={10} /> : <Clock size={10} />} {song.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Button variant="ghost" size="icon" className="text-[#3A3A3C] hover:text-white rounded-full">
                                    <ExternalLink size={16} />
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>

            {/* 📰 LEGAL VAULT */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#151821] to-[#0B0B0F] border border-[#232733] shadow-2xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <Lock size={120} />
               </div>
               <div className="relative z-10">
                  <h3 className="text-xl font-black text-white italic tracking-tighter mb-2">Bóveda Legal (Contracts)</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8 max-w-md">
                     Acceso seguro a contratos de cesión de derechos, licencias de sincronización y acuerdos de co-autoría.
                  </p>
                  <Button variant="outline" className="border-white/10 text-white font-black h-12 rounded-xl px-8 hover:bg-white hover:text-black transition-all">
                     ABRIR BÓVEDA
                  </Button>
               </div>
            </div>
         </div>

         {/* 🔔 PRO ACTIONS */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-8">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-8 flex items-center gap-2">
                  <Globe size={16} className="text-[#FFD700]" /> Sociedades de Gestión
               </CardTitle>
               <div className="space-y-4">
                  <PROCard name="SACM" region="México" status="Linked" />
                  <PROCard name="ASCAP" region="USA" status="Not Linked" />
                  <PROCard name="BMI" region="USA" status="Not Linked" />
                  <PROCard name="SGAE" region="España" status="Not Linked" />
               </div>
               <Button variant="ghost" className="w-full mt-8 text-[10px] font-black uppercase tracking-widest text-[#3A3A3C] hover:text-white">
                  Ver Más Sociedades <ChevronRight size={14} />
               </Button>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-[#FFD700]/10 border border-[#FFD700]/20">
               <div className="flex items-center gap-3 mb-4 text-[#FFD700]">
                  <Gavel size={18} />
                  <p className="text-xs font-black uppercase tracking-widest">Consejo Legal IA</p>
               </div>
               <p className="text-[10px] text-[#A1A1AA] leading-relaxed font-bold">
                  "Asegúrate de registrar los arreglos por separado si contienen elementos melódicos nuevos. Esto duplica tus fuentes de ingresos por Publishing."
               </p>
            </div>
         </div>

      </div>
    </div>
  );
}

function PROCard({ name, region, status }: { name: string, region: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#FFD700]/30 transition-all cursor-pointer">
       <div>
          <p className="text-xs font-black text-white">{name}</p>
          <p className="text-[9px] text-[#A1A1AA] font-bold">{region}</p>
       </div>
       <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${status === 'Linked' ? 'bg-[#32D74B] text-black' : 'bg-[#3A3A3C] text-white'}`}>
          {status}
       </span>
    </div>
  );
}

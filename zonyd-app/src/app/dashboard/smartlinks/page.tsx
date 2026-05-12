'use client';

import { useState } from 'react';
import { 
  Plus, 
  Link as LinkIcon, 
  Share2, 
  MousePointer2, 
  Zap,
  ChevronDown,
  Search,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const INITIAL_LINKS = [
  { id: 1, title: 'All Eyez on Me', artist: 'Budd Artist', clicks: 1240, type: 'SmartLink', status: 'Live', cover: 'https://upload.wikimedia.org/wikipedia/en/1/16/Alleyezonme.jpg' },
  { id: 2, title: 'Neon Nights', artist: 'The Mavericks', clicks: 450, type: 'Pre-save', status: 'Upcoming', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&h=200&fit=crop' }
];

const STORES = [
  { name: 'Spotify', icon: '🎧' },
  { name: 'Apple Music', icon: '🍎' },
  { name: 'YouTube', icon: '📺' },
  { name: 'TikTok', icon: '🎵' }
];

export default function SmartLinksPage() {
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [selectedLink, setSelectedLink] = useState(INITIAL_LINKS[0]);

  return (
    <div className="p-8 space-y-10 selection:bg-[#4F8CFF] selection:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">SmartLinks</h1>
           <p className="text-[#A1A1AA] text-sm">Puentes inteligentes entre tu música y tus fans.</p>
        </div>
        <Button 
          onClick={() => {
            const newLink = {
              id: Date.now(),
              title: 'Nuevo SmartLink',
              artist: 'Budd Artist',
              clicks: 0,
              type: 'SmartLink',
              status: 'DRAFT',
              cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&h=200&fit=crop'
            };
            setLinks([newLink, ...links]);
            alert('¡SmartLink creado con éxito! Ahora puedes personalizarlo.');
          }}
          className="bg-[#FF9F0A] text-black font-black px-8 h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20"
        >
          <Plus className="mr-2" size={20} /> CREAR SMARTLINK
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-xs font-black text-[#A1A1AA] uppercase tracking-widest">Tus Enlaces Activos</h3>
          </div>
          
          {links.map((link) => (
            <Card 
              key={link.id} 
              onClick={() => setSelectedLink(link)}
              className={`glass-panel border-white/5 bg-[#151821]/30 cursor-pointer transition-all hover:bg-[#151821]/50 ${selectedLink.id === link.id ? 'ring-2 ring-[#4F8CFF] border-transparent bg-[#151821]/80' : ''}`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                   <img src={link.cover} alt={link.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{link.title}</h4>
                  <p className="text-xs text-[#A1A1AA]">{link.artist}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${link.status === 'Live' ? 'bg-[#34C759]/20 text-[#34C759]' : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'}`}>
                      {link.status}
                    </span>
                    <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1"><MousePointer2 size={10} /> {link.clicks} clics</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="text-[#A1A1AA] hover:text-white"
                     onClick={(e) => {
                       e.stopPropagation();
                       navigator.clipboard.writeText(`https://zn.dy/${link.id}`);
                       alert('Enlace corto copiado al portapapeles');
                     }}
                   >
                     <Share2 size={18} />
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="text-[#A1A1AA] hover:text-white"
                     onClick={(e) => {
                       e.stopPropagation();
                       alert('Abriendo editor de SmartLink...');
                     }}
                   >
                     <MoreVertical size={18} />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="p-6 rounded-2xl bg-[#7B61FF]/10 border border-[#7B61FF]/20 mt-8 flex gap-4">
             <Zap className="text-[#7B61FF]" size={24} />
             <div>
                <p className="text-sm font-bold text-white mb-1">Zonyd AI Tip</p>
                <p className="text-xs text-[#A1A1AA] italic">"Los SmartLinks con dominios personalizados aumentan los clics un 24%."</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center sticky top-8 h-fit pb-10">
          <div className="relative w-[300px] aspect-[9/19] bg-[#0B0B0F] rounded-[3rem] border-[8px] border-[#151821] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="h-full w-full relative flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-b from-[#151821] to-[#0B0B0F] z-0" />
              <img src={selectedLink.cover} className="absolute top-0 left-0 w-full h-80 object-cover blur-2xl opacity-40 z-0" />
              <div className="relative z-10 p-6 pt-12 flex flex-col items-center">
                <div className="w-40 h-40 rounded-xl shadow-2xl border border-white/10 overflow-hidden mb-6">
                  <img src={selectedLink.cover} className="w-full h-full object-cover" />
                </div>
                <div className="text-center mb-8">
                  <h2 className="text-lg font-black text-white">{selectedLink.title}</h2>
                  <p className="text-[10px] text-[#A1A1AA] font-bold mt-1 uppercase tracking-widest">{selectedLink.artist}</p>
                </div>
                <div className="w-full space-y-2">
                  {STORES.map((store) => (
                    <div key={store.name} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-3"><span className="text-lg">{store.icon}</span><span className="text-[10px] font-bold text-white">{store.name}</span></div>
                      <Button size="sm" variant="outline" className="h-6 text-[9px] font-black border-white/20">ESCUCHAR</Button>
                    </div>
                  ))}
                </div>
                <div className="mt-10 flex flex-col items-center gap-2 opacity-50 pb-8">
                   <p className="text-[8px] font-bold text-[#A1A1AA] tracking-[0.3em] uppercase">Powered by Zonyd</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#151821] rounded-b-2xl z-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

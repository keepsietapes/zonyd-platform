'use client';

import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, Share2, MousePointer2, Zap, MoreVertical, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

const STORES = [
  { name: 'Spotify', icon: '🎧' },
  { name: 'Apple Music', icon: '🍎' },
  { name: 'YouTube', icon: '📺' },
  { name: 'TikTok', icon: '🎵' },
];

export default function SmartLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch('/api/smartlinks');
      if (Array.isArray(data) && data.length > 0) {
        setLinks(data);
        setSelectedLink(data[0]);
      } else {
        setLinks([]);
        setSelectedLink(null);
      }
    } catch (err) {
      console.error('Error fetching smartlinks:', err);
      setLinks([]);
    } finally { setIsLoading(false); }
  };

  const handleCreateLink = async () => {
    setIsCreating(true);
    try {
      const data = await authFetch('/api/smartlinks', { method: 'POST', body: JSON.stringify({ title: 'Nuevo SmartLink' }) });
      if (data) {
        alert('¡SmartLink creado! Ahora puedes personalizarlo.');
        fetchLinks();
      }
    } catch (err) {
      alert('Error al crear el SmartLink. Intenta nuevamente.');
    } finally { setIsCreating(false); }
  };

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">SmartLinks</h1>
          <p className="text-[#A1A1AA] text-sm">Puentes inteligentes entre tu música y tus fans.</p>
        </div>
        <Button
          onClick={handleCreateLink}
          disabled={isCreating}
          className="bg-[#FF9F0A] text-black font-black px-8 h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20"
        >
          {isCreating ? <Loader2 className="animate-spin mr-2" size={18} /> : <Plus className="mr-2" size={20} />}
          CREAR SMARTLINK
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-2 border-[#FF9F0A]/30 border-t-[#FF9F0A] rounded-full animate-spin" />
        </div>
      ) : links.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-[#151821] border border-[#232733] flex items-center justify-center">
            <LinkIcon size={40} className="text-[#232733]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Sin SmartLinks aún</h3>
            <p className="text-sm text-[#A1A1AA] mt-2 max-w-md">
              Crea tu primer SmartLink para conectar tu música con tus fans en todas las plataformas digitales desde un solo enlace.
            </p>
          </div>
          <Button
            onClick={handleCreateLink}
            disabled={isCreating}
            className="bg-[#FF9F0A] text-black font-black px-8 h-12 rounded-xl"
          >
            <Plus className="mr-2" size={18} /> CREAR MI PRIMER SMARTLINK
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-black text-[#A1A1AA] uppercase tracking-widest px-2">Tus Enlaces Activos</h3>
            {links.map((link) => (
              <Card
                key={link.id}
                onClick={() => setSelectedLink(link)}
                className={`bg-[#151821]/30 border-white/5 cursor-pointer transition-all hover:bg-[#151821]/50 ${selectedLink?.id === link.id ? 'ring-2 ring-[#4F8CFF] border-transparent bg-[#151821]/80' : ''}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-[#232733] flex items-center justify-center">
                    {link.coverUrl ? <img src={link.coverUrl} alt={link.title} className="w-full h-full object-cover" /> : <LinkIcon size={24} className="text-[#3A3A3C]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{link.title}</h4>
                    <p className="text-xs text-[#A1A1AA]">{link.artistName || '—'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${link.status === 'Live' ? 'bg-[#34C759]/20 text-[#34C759]' : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'}`}>{link.status || 'Draft'}</span>
                      <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1"><MousePointer2 size={10} /> {link.clicks || 0} clics</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`https://zn.dy/${link.id}`); alert('Enlace copiado'); }}>
                      <Share2 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white" onClick={e => { e.stopPropagation(); alert('Editor de SmartLink próximamente...'); }}>
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

          {/* Phone preview */}
          <div className="lg:col-span-5 flex justify-center sticky top-8 h-fit pb-10">
            <div className="relative w-[300px] aspect-[9/19] bg-[#0B0B0F] rounded-[3rem] border-[8px] border-[#151821] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="h-full w-full relative flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-b from-[#151821] to-[#0B0B0F] z-0" />
                {selectedLink?.coverUrl && <img src={selectedLink.coverUrl} className="absolute top-0 left-0 w-full h-80 object-cover blur-2xl opacity-40 z-0" />}
                <div className="relative z-10 p-6 pt-12 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-xl shadow-2xl border border-white/10 overflow-hidden mb-6 bg-[#232733] flex items-center justify-center">
                    {selectedLink?.coverUrl ? <img src={selectedLink.coverUrl} className="w-full h-full object-cover" /> : <LinkIcon size={40} className="text-[#3A3A3C]" />}
                  </div>
                  <div className="text-center mb-8">
                    <h2 className="text-lg font-black text-white">{selectedLink?.title || 'Mi SmartLink'}</h2>
                    <p className="text-[10px] text-[#A1A1AA] font-bold mt-1 uppercase tracking-widest">{selectedLink?.artistName || '—'}</p>
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
      )}
    </div>
  );
}

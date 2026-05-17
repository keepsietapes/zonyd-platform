'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Link as LinkIcon, Share2, MousePointer2, Zap, Loader2, Save, Sparkles, AlertCircle, Play, Upload, Trash2 } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Estados de edición del SmartLink seleccionado
  const [editTitle, setEditTitle] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editStatus, setEditStatus] = useState('Draft');
  const [editSpotify, setEditSpotify] = useState('');
  const [editApple, setEditApple] = useState('');
  const [editYoutube, setEditYoutube] = useState('');
  const [editTiktok, setEditTiktok] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  // Sincronizar estados de edición cuando cambia el SmartLink seleccionado
  useEffect(() => {
    if (selectedLink) {
      setEditTitle(selectedLink.title || '');
      setEditCoverUrl(selectedLink.coverUrl || '');
      setEditStatus(selectedLink.status || 'Draft');
      
      const stores = selectedLink.stores || [];
      setEditSpotify(stores.find((s: any) => s.name === 'Spotify')?.url || '');
      setEditApple(stores.find((s: any) => s.name === 'Apple Music')?.url || '');
      setEditYoutube(stores.find((s: any) => s.name === 'YouTube')?.url || '');
      setEditTiktok(stores.find((s: any) => s.name === 'TikTok')?.url || '');
    } else {
      setEditTitle('');
      setEditCoverUrl('');
      setEditStatus('Draft');
      setEditSpotify('');
      setEditApple('');
      setEditYoutube('');
      setEditTiktok('');
    }
  }, [selectedLink]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setIsCreating(true);
    try {
      const data = await authFetch('/api/smartlinks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Nuevo SmartLink',
          coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop',
          stores: [
            { name: 'Spotify', url: '' },
            { name: 'Apple Music', url: '' },
            { name: 'YouTube', url: '' },
            { name: 'TikTok', url: '' }
          ]
        })
      });
      if (data) {
        alert('¡SmartLink creado! Ahora puedes personalizarlo en el panel de edición.');
        await fetchLinks();
      }
    } catch (err) {
      alert('Error al crear el SmartLink. Intenta nuevamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveLink = async () => {
    if (!selectedLink) return;
    setIsSaving(true);
    try {
      const updatedStores = [
        { name: 'Spotify', url: editSpotify },
        { name: 'Apple Music', url: editApple },
        { name: 'YouTube', url: editYoutube },
        { name: 'TikTok', url: editTiktok },
      ];

      const data = await authFetch(`/api/smartlinks/${selectedLink.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle,
          coverUrl: editCoverUrl,
          status: editStatus,
          stores: updatedStores
        })
      });

      if (data) {
        alert('¡SmartLink guardado correctamente!');
        setLinks(prev => prev.map(l => l.id === data.id ? data : l));
        setSelectedLink(data);
      }
    } catch (err) {
      alert('Error al guardar el SmartLink. Revisa la conexión.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!selectedLink) return;
    if (!confirm('¿Estás seguro de eliminar este SmartLink? Esta acción no se puede deshacer.')) return;
    
    try {
      const data = await authFetch(`/api/smartlinks/${selectedLink.id}`, { method: 'DELETE' });
      if (data?.success) {
        alert('SmartLink eliminado.');
        setLinks(prev => prev.filter(l => l.id !== selectedLink.id));
        setSelectedLink(null);
      }
    } catch (err) {
      alert('Error al eliminar. Revisa la conexión.');
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      // Intentar subir al backend S3
      const formData = new FormData();
      formData.append('file', file);
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setEditCoverUrl(data.url || data.imageUrl || data.fileUrl);
      } else {
        throw new Error('Upload failed');
      }
    } catch {
      // Fallback: previsualización local con base64
      const reader = new FileReader();
      reader.onloadend = () => setEditCoverUrl(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getStoreUrl = (name: string) => {
    if (name === 'Spotify') return editSpotify;
    if (name === 'Apple Music') return editApple;
    if (name === 'YouTube') return editYoutube;
    if (name === 'TikTok') return editTiktok;
    return '';
  };

  return (
    <div className="p-8 space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/10 flex items-center justify-center border border-[#4F8CFF]/20 shadow-[0_0_20px_rgba(79,140,255,0.15)]">
              <LinkIcon className="text-[#4F8CFF]" size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">SmartLinks</h1>
          </div>
          <p className="text-[#A1A1AA] text-sm">Puentes inteligentes entre tu música y tus fans en todas las tiendas digitales.</p>
        </div>
        <Button
          onClick={handleCreateLink}
          disabled={isCreating}
          className="bg-[#FF9F0A] text-black font-black px-8 h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20 hover:scale-105 transition-all"
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
          
          {/* Editor & List Panel */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* List panel */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#A1A1AA] uppercase tracking-widest px-2">Tus Enlaces Activos</h3>
              <div className="grid grid-cols-1 gap-3">
                {links.map((link) => (
                  <Card
                    key={link.id}
                    onClick={() => setSelectedLink(link)}
                    className={`bg-[#151821]/30 border-white/5 cursor-pointer transition-all hover:bg-[#151821]/50 ${selectedLink?.id === link.id ? 'ring-2 ring-[#FF9F0A] border-transparent bg-[#151821]/80' : ''}`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#232733] flex items-center justify-center">
                        {link.coverUrl ? <img src={link.coverUrl} alt={link.title} className="w-full h-full object-cover" /> : <LinkIcon size={24} className="text-[#3A3A3C]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate text-sm">{link.title}</h4>
                        <p className="text-[10px] text-[#A1A1AA] uppercase font-black tracking-wider">{link.artistName || 'Artista'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[8px] font-black px-2.5 py-0.5 rounded ${link.status === 'Live' ? 'bg-[#34C759]/20 text-[#34C759]' : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'}`}>{link.status || 'Draft'}</span>
                          <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1"><MousePointer2 size={10} /> {link.clicks || 0} clics</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`https://zn.dy/${link.id}`); alert('¡Enlace SmartLink copiado al portapapeles!'); }}>
                          <Share2 size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Customization form */}
            {selectedLink && (
              <Card className="bg-gradient-to-br from-[#0B0B0F] to-[#151821] border-[#232733] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles size={120} />
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter mb-1">Editor de SmartLink</h3>
                    <p className="text-xs text-[#A1A1AA]">Personaliza la apariencia y los destinos de tu puente digital.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-wider">Título del Enlace</label>
                      <input 
                        type="text" 
                        className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FF9F0A] transition-all"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-wider">Estado de Publicación</label>
                      <select 
                        className="w-full bg-[#151821] border border-[#232733] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FF9F0A] transition-all"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="Draft">Draft (Borrador)</option>
                        <option value="Live">Live (Publicado)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-wider">Portada (Imagen)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FF9F0A] transition-all"
                        value={editCoverUrl}
                        onChange={(e) => setEditCoverUrl(e.target.value)}
                        placeholder="Pegar URL de imagen o subir archivo"
                      />
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="bg-[#151821] border border-[#232733] text-white hover:bg-white/5 font-bold text-xs rounded-xl px-4 shrink-0 flex items-center gap-1"
                      >
                        {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {isUploadingImage ? 'SUBIENDO...' : 'SUBIR'}
                      </Button>
                    </div>
                    {editCoverUrl && (
                      <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                        <img src={editCoverUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Destinos de Tiendas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1">🟢 Spotify URL</label>
                        <input 
                          type="text" 
                          className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FF9F0A] transition-all"
                          value={editSpotify}
                          onChange={(e) => setEditSpotify(e.target.value)}
                          placeholder="https://open.spotify.com/..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1">🔴 Apple Music URL</label>
                        <input 
                          type="text" 
                          className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FF9F0A] transition-all"
                          value={editApple}
                          onChange={(e) => setEditApple(e.target.value)}
                          placeholder="https://music.apple.com/..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1">📺 YouTube URL</label>
                        <input 
                          type="text" 
                          className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FF9F0A] transition-all"
                          value={editYoutube}
                          onChange={(e) => setEditYoutube(e.target.value)}
                          placeholder="https://youtube.com/..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1">🎵 TikTok URL</label>
                        <input 
                          type="text" 
                          className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FF9F0A] transition-all"
                          value={editTiktok}
                          onChange={(e) => setEditTiktok(e.target.value)}
                          placeholder="https://tiktok.com/..."
                        />
                      </div>

                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-3 border-t border-white/5 mt-6">
                    <Button
                      onClick={handleDeleteLink}
                      variant="outline"
                      className="border-[#FF453A] text-[#FF453A] font-black px-6 h-12 rounded-xl hover:bg-[#FF453A]/10 transition-all flex items-center gap-2"
                    >
                      <Trash2 size={16} /> ELIMINAR
                    </Button>
                    <Button
                      onClick={handleSaveLink}
                      disabled={isSaving}
                      className="bg-[#FF9F0A] text-black font-black px-6 h-12 rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-[#FF9F0A]/20"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="p-6 rounded-[2rem] bg-[#7B61FF]/10 border border-[#7B61FF]/20 flex gap-4">
              <Zap className="text-[#7B61FF] shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-white mb-1">Zonyd AI Tip</p>
                <p className="text-xs text-[#A1A1AA] italic">"Los SmartLinks con portadas vibrantes y enlaces de Spotify / Apple Music completos tienen una conversión superior al 85% de clics directos."</p>
              </div>
            </div>
          </div>

          {/* Virtual Phone Preview */}
          <div className="lg:col-span-5 flex justify-center sticky top-8 h-fit pb-10">
            <div className="relative w-[310px] aspect-[9/19] bg-[#050507] rounded-[3.2rem] border-[10px] border-[#151821] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden">
              <div className="h-full w-full relative flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-b from-[#151821] to-[#0B0B0F] z-0" />
                
                {editCoverUrl && (
                  <img src={editCoverUrl} className="absolute top-0 left-0 w-full h-[60%] object-cover blur-3xl opacity-30 z-0" alt="blur-bg" />
                )}

                <div className="relative z-10 p-6 pt-10 flex flex-col items-center h-full overflow-y-auto custom-scrollbar">
                  <div className="w-36 h-36 rounded-2xl shadow-2xl border border-white/10 overflow-hidden mb-6 bg-[#232733] flex items-center justify-center shrink-0">
                    {editCoverUrl ? (
                      <img src={editCoverUrl} className="w-full h-full object-cover" alt="cover" />
                    ) : (
                      <LinkIcon size={32} className="text-[#3A3A3C]" />
                    )}
                  </div>
                  
                  <div className="text-center mb-6 shrink-0 w-full">
                    <h2 className="text-base font-black text-white truncate px-2">{editTitle || 'Mi SmartLink'}</h2>
                    <p className="text-[9px] text-[#FF9F0A] font-black mt-1 uppercase tracking-[0.2em]">{selectedLink?.artistName || 'Artista Principal'}</p>
                  </div>

                  <div className="w-full space-y-2.5">
                    {STORES.map((store) => {
                      const url = getStoreUrl(store.name);
                      return (
                        <div 
                          key={store.name} 
                          onClick={() => url && window.open(url, '_blank')}
                          className={`flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl hover:bg-black/60 transition-all cursor-pointer group ${!url ? 'opacity-30' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{store.icon}</span>
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{store.name}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`h-7 text-[8px] font-black rounded-lg ${url ? 'border-[#FF9F0A] text-[#FF9F0A] hover:bg-[#FF9F0A] hover:text-black' : 'border-white/10 text-white/40'}`} 
                            disabled={!url}
                          >
                            {url ? 'ESCUCHAR' : 'NO DISPO'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-8 flex flex-col items-center gap-1 opacity-40 shrink-0">
                    <p className="text-[7px] font-black text-[#A1A1AA] tracking-[0.4em] uppercase">Powered by Zonyd</p>
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

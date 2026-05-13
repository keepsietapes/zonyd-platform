'use client';

import { useState, useEffect } from 'react';
import { Download, Share2, Zap, CheckCircle2, Layers, Sparkles, ArrowDownToLine, Layout, Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

// Brand resources de Zonyd — son estáticos porque son activos de la marca, no datos del usuario
const BRAND_RESOURCES = [
  { name: 'Isotipo Zonyd (Neon)', type: 'SVG / PNG' },
  { name: 'Logo Completo (White)', type: 'SVG' },
  { name: 'Badge "Distribuido por Zonyd"', type: 'PNG' },
];

export default function MarketingHubPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'feed' | 'stories'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch('/api/marketing/assets');
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching marketing assets:', err);
      setAssets([]);
    } finally { setIsLoading(false); }
  };

  const filteredAssets = assets.filter(a => activeTab === 'all' || a.category === activeTab);
  const hasAssets = assets.length > 0;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center border border-[#7B61FF]/20">
              <Layers className="text-[#7B61FF]" size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Marketing Hub</h1>
          </div>
          <p className="text-[#A1A1AA] text-sm">Tu arsenal visual listo para la dominación global.</p>
        </div>
        <Button
          variant="outline"
          disabled={!hasAssets}
          className="border-[#232733] bg-[#151821] text-xs font-bold rounded-xl h-12 px-6 disabled:opacity-40"
          onClick={() => { navigator.clipboard.writeText('https://zonyd.com/press-kit'); alert('Enlace del Press Kit copiado'); }}
        >
          <Share2 size={16} className="mr-2" /> COMPARTIR KIT
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Asset Gallery */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-2 p-1 bg-[#151821] rounded-2xl w-fit border border-white/5">
            {(['all', 'feed', 'stories'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#7B61FF] text-white' : 'text-[#A1A1AA] hover:text-white'}`}>
                {tab === 'all' ? 'Todos' : tab === 'feed' ? 'Feed' : 'Stories'}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-2 border-[#7B61FF]/30 border-t-[#7B61FF] rounded-full animate-spin" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-[#151821] border border-[#232733] flex items-center justify-center">
                <ImageIcon size={40} className="text-[#232733]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Sin activos de marketing</h3>
                <p className="text-sm text-[#A1A1AA] mt-2 max-w-md">
                  Tus banners, stories y artes de lanzamiento aparecerán aquí una vez que distribuyas tu primera canción.
                </p>
              </div>
              <Button onClick={() => alert('Generando nuevo formato con Zonyd AI...')} className="bg-[#7B61FF] text-white font-black px-8 h-12 rounded-xl">
                <Zap size={18} className="mr-2" /> GENERAR CON IA
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAssets.map((asset: any) => (
                <Card key={asset.id} className="group overflow-hidden bg-[#151821] border-white/5 transition-all hover:border-[#7B61FF]/50 shadow-2xl">
                  <div className="aspect-video md:aspect-square relative overflow-hidden bg-black">
                    <img src={asset.previewUrl} alt={asset.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <Button className="w-full bg-[#7B61FF] hover:bg-[#7B61FF]/90 text-white font-black rounded-xl" onClick={() => alert(`Descargando "${asset.name}"...`)}>
                        <ArrowDownToLine size={18} className="mr-2" /> DESCARGAR {asset.format}
                      </Button>
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter">{asset.size}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-white text-sm">{asset.name}</h4>
                    <p className="text-[10px] text-[#A1A1AA] font-bold mt-1 uppercase tracking-widest">{asset.platform}</p>
                  </CardContent>
                </Card>
              ))}

              {/* Slot para crear */}
              <div onClick={() => alert('Generando nuevo formato con Zonyd AI...')} className="border-2 border-dashed border-[#232733] rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:border-[#7B61FF]/30 hover:bg-[#7B61FF]/5 cursor-pointer group text-center">
                <div className="w-12 h-12 rounded-full bg-[#151821] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layout className="text-[#A1A1AA] group-hover:text-[#7B61FF]" size={24} />
                </div>
                <h5 className="font-bold text-white text-sm">Crear Nuevo Formato</h5>
                <p className="text-[10px] text-[#A1A1AA] mt-1">Genera un asset personalizado con IA</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Card */}
          <Card className="bg-gradient-to-br from-[#7B61FF] to-[#4F8CFF] border-none text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
              <Sparkles size={100} />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md"><Zap size={20} className="fill-white" /></div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">IA Co-Manager</span>
              </div>
              <h3 className="text-lg font-black leading-tight mb-4">
                {hasAssets ? '"Tu música está lista para el mundo."' : '"Distribuye tu primera canción para desbloquear insights de marketing."'}
              </h3>
              <Button className="w-full bg-white text-[#7B61FF] font-black rounded-xl hover:bg-white/90" onClick={() => alert('Programador de posts próximamente...')}>
                PROGRAMAR POST
              </Button>
            </CardContent>
          </Card>

          {/* Brand Kit */}
          <Card className="bg-[#151821] border-[#232733] rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-[#232733] bg-black/20">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-[#A1A1AA]">Zonyd Brand Kit</CardTitle>
              <CardDescription className="text-[10px]">Usa nuestra marca para potenciar la tuya.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {BRAND_RESOURCES.map((res, i) => (
                <div key={i} onClick={() => alert(`Descargando: ${res.name}`)} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer border-b border-[#232733]/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/5">
                      <img src="/logo.png" className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" alt="" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{res.name}</p>
                      <p className="text-[9px] text-[#A1A1AA] uppercase font-black">{res.type}</p>
                    </div>
                  </div>
                  <Download size={16} className="text-[#A1A1AA] group-hover:text-white" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

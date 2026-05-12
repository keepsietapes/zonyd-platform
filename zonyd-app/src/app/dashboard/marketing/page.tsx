'use client';

import { useState } from 'react';
import { 
  Download, 
  Image as ImageIcon, 
  Share2, 
  Camera, 
  MessageCircle, 
  PlayCircle, 
  Zap, 
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowDownToLine,
  Layout
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MARKETING_ASSETS = [
  { id: 1, category: 'feed', name: 'Banner Lanzamiento - Feed', size: '1080x1080', format: 'PNG', platform: 'Instagram Feed', preview: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&fit=crop' },
  { id: 2, category: 'stories', name: 'Promo Story - Vertical', size: '1080x1920', format: 'JPG', platform: 'Instagram Stories', preview: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&h=700&fit=crop' },
  { id: 3, category: 'feed', name: 'YouTube Thumbnail Pro', size: '1920x1080', format: 'PNG', platform: 'YouTube', preview: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&h=300&fit=crop' },
];

const BRAND_RESOURCES = [
  { name: 'Isotipo Zonyd (Neon)', type: 'SVG / PNG' },
  { name: 'Logo Completo (White)', type: 'SVG' },
  { name: 'Badge "Distribuido por Zonyd"', type: 'PNG' },
];

export default function MarketingHubPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'feed' | 'stories'>('all');

  return (
    <div className="p-8 space-y-10 selection:bg-[#7B61FF] selection:text-white">
      {/* Header */}
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

        <div className="flex gap-2">
           <Button 
             variant="outline" 
             className="border-[#232733] bg-[#151821] text-xs font-bold rounded-xl h-12 px-6"
             onClick={() => {
               navigator.clipboard.writeText('https://zonyd.com/press-kit/budd-artist');
               alert('Enlace del Press Kit copiado al portapapeles');
             }}
           >
              <Share2 size={16} className="mr-2" /> COMPARTIR KIT
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content: Asset Gallery */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tabs / Filters */}
          <div className="flex items-center gap-2 p-1 bg-[#151821] rounded-2xl w-fit border border-white/5">
             <button onClick={() => setActiveTab('all')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-[#7B61FF] text-white' : 'text-[#A1A1AA] hover:text-white'}`}>Todos</button>
             <button onClick={() => setActiveTab('feed')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-[#7B61FF] text-white' : 'text-[#A1A1AA] hover:text-white'}`}>Feed</button>
             <button onClick={() => setActiveTab('stories')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stories' ? 'bg-[#7B61FF] text-white' : 'text-[#A1A1AA] hover:text-white'}`}>Stories</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {MARKETING_ASSETS.filter(asset => activeTab === 'all' || asset.category === activeTab).map((asset) => (
               <Card key={asset.id} className="group overflow-hidden bg-[#151821] border-white/5 transition-all hover:border-[#7B61FF]/50 shadow-2xl">
                  <div className="aspect-video md:aspect-square relative overflow-hidden bg-black">
                     <img src={asset.preview} alt={asset.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <Button 
                          className="w-full bg-[#7B61FF] hover:bg-[#7B61FF]/90 text-white font-black rounded-xl"
                          onClick={() => {
                            alert(`Iniciando descarga de "${asset.name}"...`);
                          }}
                        >
                           <ArrowDownToLine size={18} className="mr-2" /> DESCARGAR {asset.format}
                        </Button>
                     </div>
                     <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">{asset.size}</span>
                     </div>
                  </div>
                  <CardContent className="p-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <h4 className="font-bold text-white text-sm">{asset.name}</h4>
                           <p className="text-[10px] text-[#A1A1AA] font-bold mt-1 uppercase tracking-widest">{asset.platform}</p>
                        </div>
                        <div className="flex gap-1">
                           {asset.platform.includes('Instagram') && <Camera size={14} className="text-pink-500" />}
                           {asset.platform.includes('YouTube') && <PlayCircle size={14} className="text-red-500" />}
                        </div>
                     </div>
                  </CardContent>
               </Card>
             ))}

             {/* Add New Slot */}
             <div 
                onClick={() => alert('¡Generando nuevo formato con Zonyd AI...\nSeleccionando dimensiones óptimas para TikTok.')}
                className="border-2 border-dashed border-[#232733] rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:border-[#7B61FF]/30 hover:bg-[#7B61FF]/5 cursor-pointer group text-center"
             >
                <div className="w-12 h-12 rounded-full bg-[#151821] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Layout className="text-[#A1A1AA] group-hover:text-[#7B61FF]" size={24} />
                </div>
                <h5 className="font-bold text-white text-sm">Crear Nuevo Formato</h5>
                <p className="text-[10px] text-[#A1A1AA] mt-1">Genera un asset personalizado con IA</p>
             </div>
          </div>
        </div>

        {/* Sidebar Sidebar: AI Recommendations & Brand Kit */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Optimizer Card */}
          <Card className="bg-gradient-to-br from-[#7B61FF] to-[#4F8CFF] border-none text-white overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
                <Sparkles size={100} />
             </div>
             <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                      <Zap size={20} className="fill-white" />
                   </div>
                   <span className="text-xs font-black uppercase tracking-[0.2em]">IA Co-Manager</span>
                </div>
                <h3 className="text-lg font-black leading-tight mb-4">
                   "Hoy el engagement para artistas de tu género es alto en TikTok."
                </h3>
                <p className="text-xs text-white/80 leading-relaxed mb-6">
                   Recomendamos publicar el <strong>Banner Vertical</strong> en Reels ahora mismo para maximizar el pre-save.
                </p>
                <Button 
                   className="w-full bg-white text-[#7B61FF] font-black rounded-xl hover:bg-white/90"
                   onClick={() => alert('¡Post programado con éxito!')}
                >
                   PROGRAMAR POST
                </Button>
             </CardContent>
          </Card>

          {/* Brand Resources Section */}
          <Card className="bg-[#151821] border-[#232733] rounded-2xl overflow-hidden">
             <CardHeader className="border-b border-[#232733] bg-black/20">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-[#A1A1AA]">Zonyd Brand Kit</CardTitle>
                <CardDescription className="text-[10px]">Usa nuestra marca para potenciar la tuya.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
                {BRAND_RESOURCES.map((res, i) => (
                  <div 
                    key={i} 
                    onClick={() => alert(`Iniciando descarga de recurso de marca: ${res.name}`)}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer border-b border-[#232733]/50 last:border-0"
                   >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/5">
                           <img src="/logo.png" className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" />
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

          {/* Verification Status */}
          <div className="p-6 rounded-2xl bg-[#151821] border border-[#232733] flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center border border-[#34C759]/20">
                <CheckCircle2 className="text-[#34C759]" size={24} />
             </div>
             <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">Kit de Prensa Listo</p>
                <p className="text-[10px] text-[#A1A1AA]">Actualizado hace 2 horas</p>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

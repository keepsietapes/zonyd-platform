'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Globe, FileCheck, ArrowUpRight, Search, Zap, ListMusic, Film, Tv, Gamepad2, CheckCircle2, AlertCircle, Sparkles, Download, ShieldCheck, Share2, Video, Loader2 } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'Film' | 'Gaming' | 'Ad'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estado dinámico
  const [kpis, setKpis] = useState({ opportunities: 0, activeLicenses: 0, licenseIncome: 0 });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [auditStatus, setAuditStatus] = useState<any>({ instrumentals: false, lyrics: false, stems: false, metadata: false });

  useEffect(() => { fetchMarketplace(); }, []);

  const fetchMarketplace = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch('/api/marketplace');
      if (data) {
        setKpis({ opportunities: data.opportunities?.length || 0, activeLicenses: data.activeLicenses || 0, licenseIncome: data.licenseIncome || 0 });
        setOpportunities(Array.isArray(data.opportunities) ? data.opportunities : []);
        if (data.auditStatus) setAuditStatus(data.auditStatus);
      }
    } catch (err) { console.error('Error fetching marketplace:', err); }
    finally { setIsLoading(false); }
  };

  const [sendingTrack, setSendingTrack] = useState(false);

  const handleGenerateMediaKit = async () => {
    setIsGeneratingKit(true);
    try {
      // Obtenemos datos del artista para el media kit
      const artistData = await authFetch('/api/me').catch(() => null);
      const analyticsData = await authFetch('/api/analytics?range=1%20Mes').catch(() => null);

      const kitContent = [
        `═══════════════════════════════════════════`,
        `          MEDIA KIT — ZONYD PLATFORM       `,
        `═══════════════════════════════════════════`,
        ``,
        `ARTISTA: ${artistData?.artist?.stageName || 'N/A'}`,
        `GÉNEROS: ${artistData?.artist?.genres || 'N/A'}`,
        `PAÍS: ${artistData?.artist?.country || 'N/A'}`,
        ``,
        `── MÉTRICAS DE STREAMING ──────────────────`,
        `Total Streams: ${analyticsData?.totalStreams?.toLocaleString() || '0'}`,
        `Oyentes Mensuales: ${analyticsData?.monthlyListeners?.toLocaleString() || '0'}`,
        `Alcance Estimado: ${analyticsData?.estimatedReach?.toLocaleString() || '0'}`,
        `Zonyd Score: ${analyticsData?.zonydScore || 'N/A'}`,
        ``,
        `── PLATAFORMAS CONECTADAS ─────────────────`,
        `Spotify: ${artistData?.artist?.spotifyUrl ? '✓ Vinculado' : '✗ No conectado'}`,
        `Instagram: ${artistData?.artist?.instagramUrl ? '✓ Vinculado' : '✗ No conectado'}`,
        `TikTok: ${artistData?.artist?.tiktokUrl ? '✓ Vinculado' : '✗ No conectado'}`,
        ``,
        `── CONTACTO ──────────────────────────────`,
        `Email: ${artistData?.user?.email || 'N/A'}`,
        `Plataforma: https://zonyd.pages.dev`,
        ``,
        `Generado por Zonyd Platform — ${new Date().toLocaleString('es-MX')}`,
      ].join('\n');

      const blob = new Blob([kitContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MediaKit_${artistData?.artist?.stageName || 'Artista'}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating media kit:', err);
      alert('Error al generar Media Kit. Verifica tu conexión.');
    } finally {
      setIsGeneratingKit(false);
    }
  };

  const handleSendTrack = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setSendingTrack(true);
      try {
        const formData = new FormData();
        formData.append('audio', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
        await authFetch('/api/upload', { method: 'POST', body: formData });
        alert(`✓ Track "${file.name}" enviado exitosamente al catálogo. Ahora puedes postularlo a oportunidades de Sync.`);
        fetchMarketplace();
      } catch (err: any) {
        alert(`Error al subir track: ${err.message}`);
      } finally {
        setSendingTrack(false);
      }
    };
    input.click();
  };

  const filteredOpp = opportunities.filter(o => {
    const q = searchQuery.toLowerCase();
    return (o.client?.toLowerCase().includes(q) || o.genre?.toLowerCase().includes(q)) && (activeCategory === 'all' || o.type === activeCategory);
  });

  const handlePostular = (client: string) => {
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); alert(`¡Propuesta enviada a ${client}! Tu track está en revisión.`); }, 2000);
  };

  const TYPE_ICONS: Record<string, any> = { Film: Film, Ad: Tv, Gaming: Gamepad2 };

  return (
    <div className="p-8 space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/10 flex items-center justify-center border border-[#FF9F0A]/20">
              <ShoppingBag className="text-[#FF9F0A]" size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Marketplace <span className="text-[#FF9F0A]">&amp; Sync</span></h1>
          </div>
          <p className="text-[#A1A1AA] text-sm">Monetiza tu música a través de licencias para cine, TV y publicidad.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerateMediaKit} disabled={isGeneratingKit} variant="outline" className="border-[#FF9F0A] text-[#FF9F0A] font-black px-6 h-12 rounded-xl hover:bg-[#FF9F0A] hover:text-black transition-all">
            {isGeneratingKit ? <Loader2 className="animate-spin mr-2" size={16} /> : <Share2 size={16} className="mr-2" />} MEDIA KIT IA
          </Button>
          <Button className="bg-white text-black font-black px-6 h-12 rounded-xl hover:scale-105 transition-all" onClick={() => window.location.href = '/dashboard/lab'}>
            <ListMusic size={16} className="mr-2" /> GESTIONAR MASTERS
          </Button>
          <Button className="bg-[#FF9F0A] text-black font-black px-6 h-12 rounded-xl shadow-lg" onClick={handleSendTrack} disabled={sendingTrack}>
            {sendingTrack ? <Loader2 className="animate-spin mr-2" size={16} /> : <Zap size={16} className="mr-2" />} ENVIAR TRACK
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Oportunidades de Sync', value: kpis.opportunities, icon: <ArrowUpRight size={24} />, color: '#FF9F0A' },
          { label: 'Licencias Activas', value: kpis.activeLicenses, icon: <FileCheck size={24} />, color: '#4F8CFF' },
          { label: 'Ingresos por Licencias', value: `$${kpis.licenseIncome.toLocaleString()}`, icon: <CheckCircle2 size={24} />, color: '#32D74B', isGreen: true },
        ].map(stat => (
          <div key={stat.label} className="bg-[#151821] border border-[#232733] rounded-[2rem] p-6 flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-black italic ${stat.isGreen && kpis.licenseIncome > 0 ? 'text-[#32D74B]' : kpis.opportunities > 0 ? 'text-white' : 'text-[#232733]'}`}>
                {typeof stat.value === 'number' && stat.value === 0 ? '—' : stat.value}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${stat.color}10`, color: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sync feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
            <div className="flex bg-[#151821] p-1 rounded-xl border border-white/5 w-full sm:w-auto">
              {(['all', 'Film', 'Ad', 'Gaming'] as const).map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#FF9F0A] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3C]" size={14} />
              <input type="text" placeholder="Buscar marca o género..." className="w-full bg-[#151821] border border-[#232733] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-[#FF9F0A] outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#FF9F0A]/30 border-t-[#FF9F0A] rounded-full animate-spin" /></div>
          ) : filteredOpp.length === 0 ? (
            <div className="py-24 text-center bg-[#151821] rounded-[2rem] border border-dashed border-[#232733]">
              <ShoppingBag className="mx-auto mb-4 text-[#232733]" size={40} />
              <p className="text-[11px] font-black text-[#3A3A3C] uppercase tracking-widest">
                {opportunities.length === 0 ? 'Sin oportunidades de sync disponibles' : 'No hay oportunidades coincidentes'}
              </p>
              <p className="text-[10px] text-[#3A3A3C] mt-2">Las oportunidades de Sync aparecerán cuando tu catálogo esté listo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOpp.map((opp: any) => {
                const IconComp = TYPE_ICONS[opp.type] || Film;
                return (
                  <Card key={opp.id} className="bg-[#151821] border-[#232733] rounded-[2rem] hover:border-[#FF9F0A]/40 transition-all group p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[#FF9F0A] shrink-0">
                        <IconComp size={18} />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase text-[#FF9F0A] bg-[#FF9F0A]/10 px-2 py-0.5 rounded">{opp.type}</span>
                          <span className="text-[9px] font-black uppercase text-[#A1A1AA]">{opp.deadline}</span>
                        </div>
                        <h4 className="text-lg font-black text-white italic">{opp.client}</h4>
                        <p className="text-xs text-[#A1A1AA] mt-1">Busca: <span className="text-white font-bold">{opp.genre}</span></p>
                      </div>
                      <div className="text-center sm:text-right shrink-0">
                        <p className="text-[10px] font-black text-[#A1A1AA] uppercase mb-1">Presupuesto</p>
                        <p className="text-xl font-black text-[#32D74B]">{opp.budget}</p>
                        <Button onClick={() => handlePostular(opp.client)} disabled={isSubmitting} className="mt-4 bg-white text-black font-black text-[10px] h-9 rounded-lg px-6 group-hover:bg-[#FF9F0A] transition-colors">
                          {isSubmitting ? 'Enviando...' : 'Postular Track'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-[#0B0B0F] border-[#232733] rounded-[2.5rem] p-8 border-b-4 border-b-[#FF9F0A] shadow-2xl">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-[#FF9F0A]" size={16} /> Auditoría de Masters
            </CardTitle>
            <p className="text-[10px] text-[#A1A1AA] leading-relaxed mb-6">
              Para ser elegible para Sync, tus tracks deben tener metadatos completos y stems disponibles.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Instrumentales', key: 'instrumentals' },
                { label: 'Letras (Lyrics)', key: 'lyrics' },
                { label: 'Stems de Mezcla', key: 'stems' },
                { label: 'Metadatos ISRC/UPC', key: 'metadata' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[11px] font-bold text-[#A1A1AA]">{item.label}</span>
                  {auditStatus[item.key] ? <CheckCircle2 size={14} className="text-[#32D74B]" /> : <AlertCircle size={14} className="text-[#FF453A]" />}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-8 border-[#232733] text-[10px] font-black uppercase tracking-widest hover:bg-white/5 h-12 rounded-xl" onClick={() => window.location.href = '/dashboard/releases'}>
              COMPLETAR CATÁLOGO
            </Button>
          </Card>

          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#7B61FF] to-[#4F8CFF] text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => alert('Zonyd Sync Agent próximamente...')}>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
              <Sparkles size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Zonyd Sync Agent</p>
              <h3 className="text-xl font-black italic leading-tight">
                {opportunities.length > 0 ? '"Tu catálogo está siendo analizado para oportunidades Sync."' : '"Completa tu catálogo para que el Sync Agent encuentre oportunidades."'}
              </h3>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase">APLICAR CON IA <ArrowUpRight size={14} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

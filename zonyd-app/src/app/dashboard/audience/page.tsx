'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Zap, Search, Star, Gift, MessageSquare, Globe, TrendingUp, ShieldCheck, Music, Loader2 } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

export default function AudiencePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'loyal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [preSaveEnabled, setPreSaveEnabled] = useState(false);
  const [isLaunchingAirdrop, setIsLaunchingAirdrop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estado dinámico
  const [kpis, setKpis] = useState({ totalFans: 0, superfans: 0, countries: 0 });
  const [fans, setFans] = useState<any[]>([]);

  useEffect(() => { fetchAudience(); }, []);

  const fetchAudience = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch('/api/audience');
      if (data) {
        setKpis({ totalFans: data.totalFans || 0, superfans: data.superfans || 0, countries: data.countries || 0 });
        setFans(Array.isArray(data.fans) ? data.fans : []);
      }
    } catch (err) { console.error('Error fetching audience:', err); }
    finally { setIsLoading(false); }
  };

  const filteredFans = fans.filter(fan => {
    const q = searchQuery.toLowerCase();
    const matchSearch = fan.name?.toLowerCase().includes(q) || fan.email?.toLowerCase().includes(q);
    if (activeTab === 'loyal') return matchSearch && (fan.engagement || 0) >= 85;
    return matchSearch;
  });

  const handleLaunchAirdrop = () => {
    if (kpis.superfans === 0) { alert('Aún no tienes Superfans. Distribye música y conecta con tu audiencia primero.'); return; }
    setIsLaunchingAirdrop(true);
    setTimeout(() => {
      setIsLaunchingAirdrop(false);
      alert(`¡Airdrop enviado a ${kpis.superfans} Superfans!`);
    }, 2000);
  };

  const hasData = kpis.totalFans > 0;

  return (
    <div className="p-8 space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/10 flex items-center justify-center border border-[#4F8CFF]/20"><Users className="text-[#4F8CFF]" size={20} /></div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Audiencia</h1>
          </div>
          <p className="text-[#A1A1AA] text-sm">Gestiona tu base de fans y crea conexiones directas.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleLaunchAirdrop} disabled={isLaunchingAirdrop || !hasData} className="bg-[#FF9F0A] text-black font-black px-6 h-12 rounded-xl shadow-lg disabled:opacity-40">
            {isLaunchingAirdrop ? <Loader2 className="animate-spin mr-2" size={16} /> : <Zap size={16} className="mr-2" />}
            {isLaunchingAirdrop ? 'ENVIANDO...' : 'LANZAR AIRDROP'}
          </Button>
          <Button variant="outline" className="border-[#232733] bg-[#151821] text-xs font-bold rounded-xl h-12 px-6" onClick={() => alert('Centro de mensajería próximamente...')}>
            <Mail size={16} className="mr-2" /> COMUNICAR
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#151821] border-[#232733] rounded-[2rem] p-6">
          <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Fans Totales</p>
          <h3 className={`text-4xl font-black italic ${hasData ? 'text-white' : 'text-[#232733]'}`}>{hasData ? kpis.totalFans.toLocaleString() : '—'}</h3>
          {!hasData && <p className="text-[10px] text-[#3A3A3C] mt-2">Distribuye música para ganar fans</p>}
        </Card>
        <Card className="bg-[#151821] border-[#232733] rounded-[2rem] p-6">
          <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Fans Leales (Superfans)</p>
          <h3 className={`text-4xl font-black italic ${hasData ? 'text-[#FF9F0A]' : 'text-[#232733]'}`}>{hasData ? kpis.superfans.toLocaleString() : '—'}</h3>
          {hasData && <p className="text-[10px] text-[#A1A1AA] mt-2">Engagement &gt; 80%</p>}
        </Card>
        <Card className="bg-[#151821] border-[#232733] rounded-[2rem] p-6">
          <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Alcance Global</p>
          <h3 className={`text-4xl font-black italic ${hasData ? 'text-white' : 'text-[#232733]'}`}>
            {hasData ? <>{kpis.countries} <span className="text-sm font-normal text-[#A1A1AA]">Países</span></> : '—'}
          </h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Fan CRM */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex bg-[#151821] p-1 rounded-xl border border-white/5">
              <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-[#232733] text-white shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Todos</button>
              <button onClick={() => setActiveTab('loyal')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'loyal' ? 'bg-[#FF9F0A] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Leales</button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3C]" size={14} />
              <input type="text" placeholder="Buscar fan..." className="w-full bg-[#151821] border border-[#232733] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-[#4F8CFF] outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
            {isLoading ? (
              <div className="p-16 flex justify-center"><div className="w-8 h-8 border-2 border-[#4F8CFF]/30 border-t-[#4F8CFF] rounded-full animate-spin" /></div>
            ) : filteredFans.length === 0 ? (
              <div className="p-16 text-center">
                <Users size={40} className="text-[#232733] mx-auto mb-4" />
                <p className="text-[11px] font-black text-[#3A3A3C] uppercase tracking-widest">
                  {searchQuery ? 'No se encontraron fans' : 'Aún no tienes fans registrados'}
                </p>
                <p className="text-[10px] text-[#3A3A3C] mt-2">Tu audiencia crecerá conforme distribuyas música y actives Pre-saves</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/40 border-b border-white/5">
                    <tr>
                      {['Fan', 'Ubicación', 'Engagement', 'Última Actividad', 'Acción'].map(h => (
                        <th key={h} className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredFans.map((fan: any) => (
                      <tr key={fan.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#232733] flex items-center justify-center text-sm font-black text-white border border-white/10">
                              {fan.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-xs font-black text-white">{fan.name}</p>
                              <p className="text-[9px] text-[#A1A1AA]">{fan.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><p className="text-[10px] font-bold text-[#A1A1AA] flex items-center gap-1"><Globe size={10} /> {fan.location || '—'}</p></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-16 bg-[#232733] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#4F8CFF] to-[#7B61FF]" style={{ width: `${fan.engagement || 0}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-white">{fan.engagement || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-[10px] font-bold text-[#A1A1AA]">{fan.lastSeen || '—'}</span></td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="text-[#3A3A3C] hover:text-white rounded-full" onClick={() => alert(`Mensaje a ${fan.name} próximamente...`)}>
                            <MessageSquare size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Tools */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-gradient-to-br from-[#0B0B0F] to-[#151821] border-[#232733] rounded-[2.5rem] p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FF9F0A]/10 flex items-center justify-center mb-6 border border-[#FF9F0A]/20">
              <Gift className="text-[#FF9F0A]" size={28} />
            </div>
            <h3 className="text-xl font-black text-white italic tracking-tighter mb-2">Airdrop de Recompensa</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8">
              Envía contenido exclusivo (Demos, Behind the scenes, Merch) a tus{' '}
              <span className="text-white font-bold">{hasData ? `${kpis.superfans} Superfans` : 'Superfans'}</span> automáticamente.
            </p>
            <Button onClick={() => alert('Editor de Airdrops próximamente...')} className="w-full bg-[#FF9F0A] text-black font-black h-12 rounded-xl">
              CONFIGURAR REGALO
            </Button>
          </Card>

          <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-8 border-t-4 border-t-[#4F8CFF]">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-[#4F8CFF]" size={16} /> Verificación de Fan
            </CardTitle>
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#4F8CFF]/20 flex items-center justify-center text-[#4F8CFF]">
                <Music size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Habilitar Pre-save Reward</p>
                <p className="text-[9px] text-[#A1A1AA]">Acceso a carpetas exclusivas post pre-save.</p>
              </div>
              <div onClick={() => setPreSaveEnabled(!preSaveEnabled)} className={`ml-auto w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${preSaveEnabled ? 'bg-[#4F8CFF]' : 'bg-[#232733]'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${preSaveEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

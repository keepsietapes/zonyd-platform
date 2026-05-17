'use client';

import { useState, useEffect } from 'react';
import { FileText, Scale, ShieldCheck, Globe, Video, Music, CheckCircle2, Clock, ChevronRight, ExternalLink, Plus, Lock, Gavel, Loader2, X, AlertTriangle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

const PRO_SOCIETIES = [
  { name: 'SACM', region: 'México', url: 'https://www.sacm.org.mx', registrationUrl: 'https://www.sacm.org.mx/Servicios/Afiliate' },
  { name: 'ASCAP', region: 'USA', url: 'https://www.ascap.com', registrationUrl: 'https://www.ascap.com/music-creators/join' },
  { name: 'BMI', region: 'USA', url: 'https://www.bmi.com', registrationUrl: 'https://www.bmi.com/affiliations/entry/songwriter' },
  { name: 'SGAE', region: 'España', url: 'https://www.sgae.es', registrationUrl: 'https://www.sgae.es/autores-editores/alta-online/' },
];

// Modal de registro de obra
function RegisterWorkModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [title, setTitle] = useState('');
  const [coAuthors, setCoAuthors] = useState('');
  const [pro, setPro] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { alert('El título de la obra es requerido.'); return; }
    setIsSaving(true);
    try {
      const data = await authFetch('/api/publishing/works', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          coAuthors: coAuthors ? coAuthors.split(',').map(s => s.trim()).filter(Boolean) : [],
          pro: pro.trim() || null,
          lyrics: lyrics.trim() || null,
        }),
      });
      if (data?.success) {
        onSave(data.work);
        onClose();
      } else {
        alert(data?.error || 'Error al registrar la obra.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#151821] border border-[#FFD700]/30 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Registrar Obra Musical</h2>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white transition-colors"><X size={20} /></button>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Título de la Obra *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nombre del tema o composición"
              className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFD700] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Co-Autores (separados por coma)</label>
            <input
              type="text"
              value={coAuthors}
              onChange={e => setCoAuthors(e.target.value)}
              placeholder="Ej: Juan Pérez, María García"
              className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFD700] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Sociedad PRO (SACM, ASCAP, BMI...)</label>
            <input
              type="text"
              value={pro}
              onChange={e => setPro(e.target.value)}
              placeholder="Ej: SACM"
              className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFD700] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Letra (opcional, para registro de copyright)</label>
            <textarea
              rows={4}
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              placeholder="Pega aquí la letra de la canción..."
              className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFD700] outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-[#232733] text-[#A1A1AA] h-12 rounded-xl">Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 bg-[#FFD700] text-black font-black h-12 rounded-xl hover:bg-[#FFD700]/90"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus size={16} className="mr-2" />}
              REGISTRAR OBRA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublishingPage() {
  const [activeTab, setActiveTab] = useState<'works' | 'lyrics' | 'legal'>('works');
  const [isLoading, setIsLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [linkedSociety, setLinkedSociety] = useState<string | null>(null);
  const [isLinkingSociety, setIsLinkingSociety] = useState<string | null>(null);

  const [kpis, setKpis] = useState({ registeredWorks: 0, editorialRoyalties: 0, contentIdClaims: 0 });
  const [works, setWorks] = useState<any[]>([]);
  const [linkedSocieties, setLinkedSocieties] = useState<string[]>([]);

  useEffect(() => { fetchPublishing(); }, []);

  const fetchPublishing = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch('/api/publishing');
      if (data) {
        setKpis({ registeredWorks: data.registeredWorks || 0, editorialRoyalties: data.editorialRoyalties || 0, contentIdClaims: data.contentIdClaims || 0 });
        setWorks(Array.isArray(data.works) ? data.works : []);
        const socs = Array.isArray(data.linkedSocieties) ? data.linkedSocieties : [];
        setLinkedSocieties(socs);
        if (socs.length > 0) setLinkedSociety(socs[0]);
      }
    } catch (err) { console.error('Error fetching publishing:', err); }
    finally { setIsLoading(false); }
  };

  const handleWorkAdded = (newWork: any) => {
    setWorks(prev => [newWork, ...prev]);
    setKpis(prev => ({ ...prev, registeredWorks: prev.registeredWorks + 1 }));
  };

  const handleLinkSociety = async (society: string) => {
    const ipiNumber = prompt(`Introduce tu número IPI/CAE de compositor para ${society} (Opcional — deja en blanco para vincular solo la sociedad):`);
    if (ipiNumber === null) return; // User cancelled
    
    setIsLinkingSociety(society);
    try {
      const data = await authFetch('/api/publishing/society', {
        method: 'PATCH',
        body: JSON.stringify({ society }),
      });
      if (data?.success) {
        setLinkedSocieties([society]);
        setLinkedSociety(society);
        if (ipiNumber.trim()) {
          localStorage.setItem(`zonyd_ipi_${society}`, ipiNumber.trim());
          alert(`¡Sociedad ${society} vinculada con éxito!\nCódigo CAE/IPI guardado: ${ipiNumber.trim()}`);
        } else {
          alert(`¡Sociedad ${society} vinculada con éxito!`);
        }
      }
    } catch (err: any) {
      alert(`Error al vincular sociedad: ${err.message}`);
    } finally {
      setIsLinkingSociety(null);
    }
  };

  const handleUnlinkSociety = async (society: string) => {
    if (!confirm(`¿Estás seguro de que deseas desvincular tu sociedad de gestión ${society}?`)) return;
    setIsLinkingSociety(society);
    try {
      const data = await authFetch('/api/publishing/society', {
        method: 'PATCH',
        body: JSON.stringify({ society: null }),
      });
      if (data?.success) {
        setLinkedSocieties([]);
        setLinkedSociety(null);
        localStorage.removeItem(`zonyd_ipi_${society}`);
        alert(`¡Sociedad ${society} desvinculada con éxito!`);
      }
    } catch (err: any) {
      alert(`Error al desvincular sociedad: ${err.message}`);
    } finally {
      setIsLinkingSociety(null);
    }
  };

  const handleContentIdWhitelist = () => {
    const artistId = works[0]?.artist || 'mi-artista';
    const msg = `Content ID Whitelist\n\nEsta función permite proteger tus obras ante reclamaciones automáticas de YouTube Content ID y similares.\n\nPara activarla:\n1. Registra tus obras en la pestaña "Obras"\n2. Zonyd enviará automáticamente tu catálogo al sistema de Content ID\n3. Cualquier reclamación ilegítima será disputada en tu nombre\n\nObras registradas: ${works.length}\nEstado: ${works.length > 0 ? 'Activo — catálogo protegido' : 'Pendiente — registra tus obras primero'}`;
    alert(msg);
  };

  const handleExportLegal = () => {
    const content = [
      `BÓVEDA LEGAL — ZONYD PLATFORM`,
      `Fecha: ${new Date().toLocaleString('es-MX')}`,
      ``,
      `OBRAS REGISTRADAS (${works.length}):`,
      ...works.map((w, i) => `${i + 1}. "${w.title}" | PRO: ${w.pro || 'N/A'} | Estado: ${w.status} | ISRC: ${w.isrc || 'N/A'}`),
      ``,
      `SOCIEDAD VINCULADA: ${linkedSociety || 'Ninguna'}`,
      `REGALÍAS EDITORIALES: $${kpis.editorialRoyalties.toFixed(2)} USD`,
      ``,
      `NOTA LEGAL: Este documento fue generado automáticamente por Zonyd Platform.`,
      `El artista mantiene el 100% de los derechos de propiedad intelectual de sus masters.`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BóvedaLegal_Zonyd_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasData = kpis.registeredWorks > 0;

  return (
    <div className="p-8 space-y-10 pb-20 animate-in fade-in duration-700">
      {showRegisterModal && (
        <RegisterWorkModal onClose={() => setShowRegisterModal(false)} onSave={handleWorkAdded} />
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/20">
              <Scale className="text-[#FFD700]" size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Publishing <span className="text-[#FFD700]">&amp; Rights</span></h1>
          </div>
          <p className="text-[#A1A1AA] text-sm">Protección global y administración de tu propiedad intelectual.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-[#232733] bg-[#151821] text-xs font-bold rounded-xl h-12 px-6 hover:border-[#FFD700]/50 transition-all"
            onClick={handleContentIdWhitelist}
          >
            <ShieldCheck size={16} className="mr-2" /> CONTENT ID WHITELIST
          </Button>
          <Button
            className="bg-white text-black font-black px-6 h-12 rounded-xl hover:scale-105 transition-all"
            onClick={() => setShowRegisterModal(true)}
          >
            <Plus size={16} className="mr-2" /> REGISTRAR OBRA
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Obras Registradas', value: kpis.registeredWorks > 0 ? kpis.registeredWorks.toString() : '—', icon: <Music size={16} /> },
          { label: 'Regalías Editoriales', value: kpis.editorialRoyalties > 0 ? `$${kpis.editorialRoyalties.toFixed(2)}` : '—', icon: <Globe size={16} /> },
          { label: 'Reclamaciones ID', value: kpis.contentIdClaims > 0 ? kpis.contentIdClaims.toString() : '—', icon: <Video size={16} /> },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#151821] border-[#232733] rounded-[2rem] p-6 flex items-center gap-4 hover:bg-white/5 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[#FFD700]">{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black text-[#3A3A3C] uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black ${hasData ? 'text-white' : 'text-[#232733]'}`}>{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Works table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex bg-[#151821] p-1 rounded-xl border border-white/5">
              {(['works', 'lyrics', 'legal'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#FFD700] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>
                  {tab === 'works' ? 'Obras' : tab === 'lyrics' ? 'Letras' : 'Legal'}
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
            {activeTab === 'legal' ? (
              <div className="p-8 text-center space-y-6">
                <AlertTriangle size={40} className="text-[#FFD700] mx-auto" />
                <div>
                  <h3 className="text-lg font-black text-white italic tracking-tighter">Bóveda Legal (Contracts)</h3>
                  <p className="text-xs text-[#A1A1AA] mt-2 max-w-md mx-auto">
                    Aquí encontrarás todos tus contratos de cesión de derechos, licencias de sincronización y acuerdos de co-autoría.
                    Puedes descargar un resumen de tu portafolio legal.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button className="bg-[#FFD700] text-black font-black h-12 rounded-xl" onClick={handleExportLegal}>
                    <Download size={14} className="mr-2" /> EXPORTAR PDF
                  </Button>
                  <Button variant="outline" className="border-[#232733] text-white h-12 rounded-xl" onClick={() => window.open('https://calendly.com', '_blank')}>
                    <ExternalLink size={14} className="mr-2" /> CONSULTAR ABOGADO
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="p-16 flex justify-center"><div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" /></div>
            ) : works.length === 0 ? (
              <div className="p-16 text-center">
                <FileText size={40} className="text-[#232733] mx-auto mb-4" />
                <p className="text-[11px] font-black text-[#3A3A3C] uppercase tracking-widest">Sin obras registradas</p>
                <p className="text-[10px] text-[#3A3A3C] mt-2">Registra tus composiciones para proteger tu propiedad intelectual</p>
                <Button className="mt-6 bg-[#FFD700] text-black font-black px-6 h-10 rounded-xl text-xs" onClick={() => setShowRegisterModal(true)}>
                  <Plus size={14} className="mr-2" /> REGISTRAR PRIMERA OBRA
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {activeTab === 'lyrics' ? (
                  <div className="p-8 space-y-4">
                    {works.filter(w => w.lyrics).map((w: any) => (
                      <div key={w.id} className="p-4 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-xs font-black text-white mb-2">"{w.title}"</p>
                        <p className="text-[10px] text-[#A1A1AA] whitespace-pre-line leading-relaxed">{w.lyrics}</p>
                      </div>
                    ))}
                    {works.filter(w => w.lyrics).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-[10px] text-[#3A3A3C]">Ninguna obra tiene letra registrada todavía.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-black/40 border-b border-white/5">
                      <tr>
                        {['Obra Musical', 'PRO', 'Estado', 'Acción'].map(h => (
                          <th key={h} className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {works.map((song: any) => (
                        <tr key={song.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-xs font-black text-white">{song.title}</p>
                            <p className="text-[9px] text-[#A1A1AA] uppercase font-bold">{song.artist}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black text-white bg-white/5 px-2 py-1 rounded border border-white/10 uppercase">{song.pro || '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1 text-[10px] font-bold ${song.status === 'Registered' ? 'text-[#32D74B]' : 'text-[#FF9F0A]'}`}>
                              {song.status === 'Registered' ? <CheckCircle2 size={10} /> : <Clock size={10} />} {song.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="text-[#3A3A3C] hover:text-white rounded-full" onClick={() => alert(`ISRC: ${song.isrc || 'No asignado'}`)}>
                              <ExternalLink size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </Card>

          {/* Legal Vault */}
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#151821] to-[#0B0B0F] border border-[#232733] shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Lock size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white italic tracking-tighter mb-2">Bóveda Legal (Contracts)</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8 max-w-md">
                Acceso seguro a contratos de cesión de derechos, licencias de sincronización y acuerdos de co-autoría.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="border-white/10 text-white font-black h-12 rounded-xl px-8 hover:bg-white hover:text-black transition-all" onClick={handleExportLegal}>
                  <Download size={14} className="mr-2" /> EXPORTAR BÓVEDA
                </Button>
                <Button variant="outline" className="border-[#FFD700]/30 text-[#FFD700] font-black h-12 rounded-xl px-6 hover:bg-[#FFD700]/10 transition-all" onClick={handleContentIdWhitelist}>
                  <ShieldCheck size={14} className="mr-2" /> CONTENT ID STATUS
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* PRO Societies */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-8">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-8 flex items-center gap-2">
              <Globe size={16} className="text-[#FFD700]" /> Sociedades de Gestión
            </CardTitle>
            <div className="space-y-4">
              {PRO_SOCIETIES.map(pro => {
                const isLinked = linkedSocieties.includes(pro.name);
                const isLinking = isLinkingSociety === pro.name;
                const savedIpi = typeof window !== 'undefined' ? localStorage.getItem(`zonyd_ipi_${pro.name}`) : null;
                return (
                  <div key={pro.name} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isLinked ? 'bg-[#FFD700]/10 border-[#FFD700]/40' : 'bg-white/5 border-white/5 hover:border-[#FFD700]/30'}`}>
                    <div>
                      <p className="text-xs font-black text-white">{pro.name}</p>
                      <p className="text-[9px] text-[#A1A1AA] font-bold">{pro.region}</p>
                      {isLinked && savedIpi && (
                        <p className="text-[8px] font-mono text-[#FFD700] mt-1 bg-[#FFD700]/10 px-1.5 py-0.5 rounded inline-block">IPI: {savedIpi}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isLinked ? (
                        <>
                          <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-[#32D74B] text-black">Linked</span>
                          <button
                            onClick={() => handleUnlinkSociety(pro.name)}
                            disabled={!!isLinkingSociety}
                            className="text-[8px] font-black uppercase px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            DESVINCULAR
                          </button>
                          <a href={pro.url} target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-white transition-colors">
                            <ExternalLink size={12} />
                          </a>
                        </>
                      ) : (
                        <button
                          onClick={() => handleLinkSociety(pro.name)}
                          disabled={!!isLinkingSociety}
                          className="text-[8px] font-black uppercase px-2 py-1 rounded bg-[#3A3A3C] text-white hover:bg-[#FFD700] hover:text-black transition-all disabled:opacity-50"
                        >
                          {isLinking ? <Loader2 size={10} className="animate-spin" /> : 'VINCULAR'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[9px] text-[#A1A1AA]">Para registrarte como compositor, visita el sitio oficial de tu sociedad:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRO_SOCIETIES.map(s => (
                  <a key={s.name} href={s.registrationUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[8px] font-black text-[#FFD700] hover:underline">
                    {s.name} ↗
                  </a>
                ))}
              </div>
            </div>
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

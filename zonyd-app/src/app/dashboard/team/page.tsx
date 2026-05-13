'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldCheck, History, UserCircle, ChevronRight, Trash2, Lock, Search, CheckCircle2 } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

export default function TeamPage() {
  const [isInviting, setIsInviting] = useState(false);
  const [isLabelMode, setIsLabelMode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Estado dinámico — sin datos predeterminados
  const [team, setTeam] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch('/api/team');
      if (data) {
        setTeam(Array.isArray(data.members) ? data.members : []);
        setActivityLog(Array.isArray(data.activity) ? data.activity : []);
      }
    } catch (err) { console.error('Error fetching team:', err); }
    finally { setIsLoading(false); }
  };

  const handleInvite = async () => {
    setIsInviting(true);
    try {
      await authFetch('/api/team/invite', { method: 'POST', body: JSON.stringify({ email: '' }) });
      alert('¡Invitación enviada!');
      setShowInviteModal(false);
      fetchTeam();
    } catch (err) {
      alert('Error al enviar la invitación.');
    } finally { setIsInviting(false); }
  };

  const filteredTeam = team.filter(m => m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20"><ShieldCheck className="text-white" size={20} /></div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Equipo <span className="text-white/30">&amp; Roles</span></h1>
          </div>
          <p className="text-[#A1A1AA] text-sm">Gestiona quién tiene acceso a tu catálogo y finanzas.</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="bg-white text-black font-black px-6 h-12 rounded-xl shadow-lg hover:scale-105 transition-all">
          <UserPlus size={16} className="mr-2" /> INVITAR MIEMBRO
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Team list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Miembros Activos</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3C]" size={14} />
              <input type="text" placeholder="Buscar en el equipo..." className="w-full bg-[#151821] border border-[#232733] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-white/50 outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
            {isLoading ? (
              <div className="p-16 flex justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
            ) : filteredTeam.length === 0 ? (
              <div className="p-16 text-center">
                <Users size={40} className="text-[#232733] mx-auto mb-4" />
                <p className="text-[11px] font-black text-[#3A3A3C] uppercase tracking-widest">
                  {searchQuery ? 'No se encontraron miembros' : 'Sin miembros en el equipo'}
                </p>
                <p className="text-[10px] text-[#3A3A3C] mt-2">Invita a tu manager, contador o colaboradores para gestionar tu carrera juntos</p>
                <Button onClick={() => setShowInviteModal(true)} className="mt-6 bg-white text-black font-black px-6 h-10 rounded-xl text-xs">
                  <UserPlus size={14} className="mr-2" /> INVITAR PRIMER MIEMBRO
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/40 border-b border-white/5">
                    <tr>
                      {['Miembro', 'Rol', 'Estado', 'Acción'].map(h => (
                        <th key={h} className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTeam.map((member: any) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#232733] flex items-center justify-center text-sm font-black text-white border border-white/10">
                              {member.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-xs font-black text-white">{member.name}</p>
                              <p className="text-[9px] text-[#A1A1AA]">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${member.role === 'Owner' ? 'bg-white text-black' : 'bg-white/5 text-[#A1A1AA]'}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#32D74B]">
                            <CheckCircle2 size={10} /> {member.status || 'Activo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button disabled={member.role === 'Owner'} variant="ghost" size="icon" className="text-[#3A3A3C] hover:text-[#FF453A] rounded-full" onClick={() => confirm(`¿Eliminar a ${member.name}?`) && fetchTeam()}>
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Label Mode */}
          <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative group overflow-hidden ${isLabelMode ? 'bg-gradient-to-br from-[#FF9F0A]/20 to-black border-[#FF9F0A]/40' : 'bg-gradient-to-br from-[#151821] to-[#0B0B0F] border-[#232733]'}`}>
            <div className={`absolute top-0 right-0 p-8 transition-all duration-700 ${isLabelMode ? 'opacity-20 scale-125' : 'opacity-5'}`}>
              {isLabelMode ? <ShieldCheck size={120} className="text-[#FF9F0A]" /> : <UserCircle size={120} />}
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full animate-pulse ${isLabelMode ? 'bg-[#FF9F0A]' : 'bg-[#A1A1AA]'}`} />
                <h3 className="text-xl font-black text-white italic tracking-tighter">{isLabelMode ? 'Sello Discográfico Activo' : 'Modo Sello (Label)'}</h3>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8 max-w-md">
                {isLabelMode ? 'Estás operando como Administrador de Sello. Puedes añadir catálogos externos y gestionar múltiples artistas.' : 'Gestiona múltiples artistas desde un solo panel. El Modo Sello te permite cambiar de perfil sin cerrar sesión.'}
              </p>
              <Button onClick={() => setIsLabelMode(!isLabelMode)} variant={isLabelMode ? 'default' : 'outline'} className={`font-black h-12 rounded-xl px-8 transition-all ${isLabelMode ? 'bg-[#FF9F0A] text-black border-none' : 'border-white/10 text-white hover:bg-white hover:text-black'}`}>
                {isLabelMode ? 'VOLVER A MODO ARTISTA' : 'ACTIVAR MODO SELLO'}
              </Button>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-8">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-8 flex items-center gap-2">
              <History size={16} className="text-[#A1A1AA]" /> Registro de Actividad
            </CardTitle>
            {activityLog.length === 0 ? (
              <div className="text-center py-8">
                <History size={32} className="text-[#232733] mx-auto mb-3" />
                <p className="text-[10px] font-black text-[#3A3A3C] uppercase tracking-widest">Sin actividad registrada</p>
                <p className="text-[9px] text-[#3A3A3C] mt-1">Las acciones del equipo aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-8">
                {activityLog.map((log: any) => (
                  <div key={log.id} className="relative pl-6 border-l border-white/5">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-white/20" />
                    <p className="text-[11px] font-black text-white">{log.user}</p>
                    <p className="text-[10px] text-[#A1A1AA] mt-1 leading-relaxed">{log.action}</p>
                    <p className="text-[9px] text-[#3A3A3C] mt-2 font-bold uppercase">{log.time}</p>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" className="w-full mt-8 text-[10px] font-black uppercase tracking-widest text-[#3A3A3C] hover:text-white">
              Ver Todo el Historial <ChevronRight size={14} />
            </Button>
          </Card>

          <div className="p-8 rounded-[2.5rem] bg-[#FF453A]/10 border border-[#FF453A]/20">
            <div className="flex items-center gap-3 mb-4 text-[#FF453A]">
              <Lock size={18} />
              <p className="text-xs font-black uppercase tracking-widest">Seguridad del Equipo</p>
            </div>
            <p className="text-[10px] text-[#A1A1AA] leading-relaxed font-bold">
              La autenticación de dos factores (2FA) es obligatoria para todos los miembros con rol de "Manager" o superior.
            </p>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="bg-[#0B0B0F] border-[#232733] w-full max-w-lg rounded-[3rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">Invitar Colaborador</h2>
              <p className="text-xs text-[#A1A1AA]">El invitado recibirá un acceso restringido a tu Workspace.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3A3A3C]">Email del Invitado</label>
                <input type="email" placeholder="ejemplo@management.com" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3A3A3C]">Rol y Permisos</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:border-white transition-all group">
                    <p className="text-xs font-bold text-white">Manager</p>
                    <p className="text-[9px] text-[#A1A1AA] mt-1">Control total de catálogo y marketing.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:border-[#FF9F0A] transition-all group">
                    <p className="text-xs font-bold text-white">Contador</p>
                    <p className="text-[9px] text-[#A1A1AA] mt-1">Solo acceso a finanzas y reportes.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[#FF453A]/10 rounded-[2rem] border border-[#FF453A]/20 flex gap-4">
                <Lock className="text-[#FF453A] shrink-0" size={20} />
                <div>
                  <p className="text-xs font-black text-white italic uppercase tracking-tighter">Seguridad Obligatoria (2FA)</p>
                  <p className="text-[10px] text-[#A1A1AA] leading-relaxed">Este invitado deberá configurar autenticación antes de acceder.</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={() => setShowInviteModal(false)} variant="ghost" className="flex-1 text-[#A1A1AA] font-black uppercase text-[10px]">CANCELAR</Button>
                <Button onClick={handleInvite} disabled={isInviting} className="flex-1 bg-white text-black font-black h-14 rounded-2xl">
                  {isInviting ? 'ENVIANDO...' : 'ENVIAR INVITACIÓN'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

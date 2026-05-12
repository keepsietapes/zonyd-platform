'use client';

import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  MoreVertical, 
  Mail, 
  History, 
  UserCircle, 
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MOCK_TEAM = [
  { id: 1, name: 'Buda (Budd Artist)', email: 'buda@artist.io', role: 'Owner', status: 'Active', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&h=100&fit=crop' },
  { id: 2, name: 'Marco Valente', email: 'marco@management.com', role: 'Manager', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&fit=crop' },
  { id: 3, name: 'Sarah Accountant', email: 'finance@zonyd.com', role: 'Accountant', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&fit=crop' },
];

const ACTIVITY_LOG = [
  { id: 1, user: 'Buda', action: 'Uploaded new track "Neon Lights"', time: '2h ago' },
  { id: 2, user: 'Marco Valente', action: 'Approved royalty split for "Midnight Drive"', time: '5h ago' },
  { id: 3, user: 'Sarah Accountant', action: 'Requested a withdrawal of $1,200', time: '1 day ago' },
];

export default function TeamPage() {
  const [isInviting, setIsInviting] = useState(false);
  const [isLabelMode, setIsLabelMode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInvite = () => {
    setIsInviting(true);
    setTimeout(() => {
      setIsInviting(false);
      setShowInviteModal(false);
      alert('¡Enlace de Invitación Pro generado! Enviando correo a tu colaborador con acceso restringido al perfil de artista.');
    }, 2000);
  };

  const toggleLabelMode = () => {
    setIsLabelMode(!isLabelMode);
    if (!isLabelMode) {
      alert('Modo Sello Activado: Ahora puedes añadir y gestionar múltiples artistas desde este panel central.');
    }
  };

  return (
    <div className="p-8 space-y-10 selection:bg-white selection:text-black pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                 <ShieldCheck className="text-white" size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Equipo <span className="text-white/30">& Roles</span></h1>
           </div>
           <p className="text-[#A1A1AA] text-sm">Gestiona quién tiene acceso a tu catálogo y finanzas.</p>
        </div>

        <div className="flex gap-2">
           <Button 
             onClick={() => setShowInviteModal(true)}
             className="bg-white text-black font-black px-6 h-12 rounded-xl shadow-lg hover:scale-105 transition-all"
           >
              <UserPlus size={16} className="mr-2" /> INVITAR MIEMBRO
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* 👥 TEAM LIST */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Miembros Activos</h3>
               <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3C]" size={14} />
                  <input 
                    type="text" 
                    placeholder="Buscar en el equipo..." 
                    className="w-full bg-[#151821] border border-[#232733] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-white/50 transition-all outline-none"
                  />
               </div>
            </div>

            <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-black/40 border-b border-white/5">
                        <tr>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Miembro</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Rol</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">Estado</th>
                           <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest text-right">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {MOCK_TEAM.map((member) => (
                           <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
                                       <img src={member.avatar} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                       <p className="text-xs font-black text-white">{member.name}</p>
                                       <p className="text-[9px] text-[#A1A1AA]">{member.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${
                                    member.role === 'Owner' ? 'bg-white text-black' : 'bg-white/5 text-[#A1A1AA]'
                                 }`}>
                                    {member.role}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="flex items-center gap-1 text-[10px] font-bold text-[#32D74B]">
                                    <CheckCircle2 size={10} /> {member.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Button 
                                   disabled={member.role === 'Owner'}
                                   variant="ghost" size="icon" className="text-[#3A3A3C] hover:text-[#FF453A] rounded-full"
                                   onClick={() => alert('¿Estás seguro de que deseas eliminar a ' + member.name + '?')}
                                 >
                                    <Trash2 size={16} />
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>

            {/* 🏷️ LABEL MODE (Artist Switcher) */}
            <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative group overflow-hidden ${
               isLabelMode 
               ? 'bg-gradient-to-br from-[#FF9F0A]/20 to-black border-[#FF9F0A]/40' 
               : 'bg-gradient-to-br from-[#151821] to-[#0B0B0F] border-[#232733]'
            }`}>
               <div className={`absolute top-0 right-0 p-8 transition-all duration-700 ${isLabelMode ? 'opacity-20 scale-125' : 'opacity-5'}`}>
                  {isLabelMode ? <ShieldCheck size={120} className="text-[#FF9F0A]" /> : <UserCircle size={120} />}
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <div className={`w-3 h-3 rounded-full animate-pulse ${isLabelMode ? 'bg-[#FF9F0A]' : 'bg-[#A1A1AA]'}`} />
                     <h3 className="text-xl font-black text-white italic tracking-tighter">
                        {isLabelMode ? 'Sello Discográfico Activo' : 'Modo Sello (Label)'}
                     </h3>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8 max-w-md">
                     {isLabelMode 
                        ? 'Estás operando como Administrador de Sello. Puedes añadir catálogos externos y gestionar múltiples artistas.' 
                        : 'Gestiona múltiples artistas desde un solo panel. El Modo Sello te permite cambiar de perfil sin cerrar sesión.'}
                  </p>
                  <Button 
                    onClick={toggleLabelMode}
                    variant={isLabelMode ? 'default' : 'outline'}
                    className={`font-black h-12 rounded-xl px-8 transition-all ${
                       isLabelMode 
                       ? 'bg-[#FF9F0A] text-black border-none' 
                       : 'border-white/10 text-white hover:bg-white hover:text-black'
                    }`}
                  >
                     {isLabelMode ? 'VOLVER A MODO ARTISTA' : 'ACTIVAR MODO SELLO'}
                  </Button>
               </div>
            </div>
         </div>

         {/* 🕒 ACTIVITY FEED */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] p-8">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-white mb-8 flex items-center gap-2">
                  <History size={16} className="text-[#A1A1AA]" /> Registro de Actividad
               </CardTitle>
               <div className="space-y-8">
                  {ACTIVITY_LOG.map((log) => (
                     <div key={log.id} className="relative pl-6 border-l border-white/5">
                        <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-white/20" />
                        <p className="text-[11px] font-black text-white">{log.user}</p>
                        <p className="text-[10px] text-[#A1A1AA] mt-1 leading-relaxed">{log.action}</p>
                        <p className="text-[9px] text-[#3A3A3C] mt-2 font-bold uppercase">{log.time}</p>
                     </div>
                  ))}
               </div>
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

      {/* 📧 INVITE MODAL OVERLAY */}
      {showInviteModal && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <Card className="bg-[#0B0B0F] border-[#232733] w-full max-w-lg rounded-[3rem] p-10 relative overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]">
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
                           <p className="text-xs font-bold text-white group-hover:text-white">Manager</p>
                           <p className="text-[9px] text-[#A1A1AA] mt-1">Control total de catálogo y marketing.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:border-[#FF9F0A] transition-all group">
                           <p className="text-xs font-bold text-white">Contador</p>
                           <p className="text-[9px] text-[#A1A1AA] mt-1 text-[#FF9F0A]">Solo acceso a finanzas y reportes.</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-[#FF453A]/10 rounded-[2rem] border border-[#FF453A]/20 space-y-4">
                     <div className="flex gap-4">
                        <Lock className="text-[#FF453A] shrink-0" size={20} />
                        <div>
                           <p className="text-xs font-black text-white italic uppercase tracking-tighter">Seguridad Obligatoria (2FA)</p>
                           <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                              Este invitado **DEBERÁ** configurar autenticación por PIN o App (Authy/Google Authenticator) antes de acceder. Tu seguridad es nuestra prioridad.
                           </p>
                        </div>
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

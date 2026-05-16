'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Music, 
  DollarSign, 
  Activity, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'releases' | 'logs'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingReleases: 0,
    totalRevenue: 0,
    activeDistributions: 0
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingReleases, setPendingReleases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // En un entorno real, estos serían endpoints protegidos por middleware RBAC
      const [statsRes, logsRes, usersRes, releasesRes] = await Promise.all([
        authFetch('/api/admin/stats'),
        authFetch('/api/admin/logs'),
        authFetch('/api/admin/users'),
        authFetch('/api/admin/releases?status=PENDING_APPROVAL')
      ]);

      if (statsRes) setStats(statsRes);
      if (logsRes) setLogs(logsRes);
      if (usersRes) setUsers(usersRes);
      if (releasesRes) setPendingReleases(releasesRes);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRelease = async (id: string) => {
    if (!confirm('¿Seguro que deseas aprobar este lanzamiento para distribución real?')) return;
    try {
      await authFetch(`/api/admin/releases/${id}/approve`, { method: 'POST' });
      alert('Lanzamiento aprobado y paquete DDEX generado.');
      fetchAdminData();
    } catch (err) {
      alert('Error al aprobar lanzamiento.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[#FF9F0A]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 selection:bg-[#FF9F0A] selection:text-white">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
            <ShieldCheck className="text-[#FF9F0A]" size={32} /> Zonyd Control <span className="text-xs bg-[#FF9F0A] text-black px-2 py-1 rounded non-italic">MASTER</span>
          </h1>
          <p className="text-[#A1A1AA] text-sm mt-2">Panel central de operaciones, auditoría y distribución global.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchAdminData} variant="outline" className="border-white/10 text-white hover:bg-white/5">
            RECARGAR DATOS
          </Button>
          <Button className="bg-[#FF9F0A] text-black font-black" onClick={() => {
            const csvRows = [
              ['Email', 'Rol', 'Plan', 'Fecha Registro'],
              ...users.map((u: any) => [u.email, u.role, u.artistProfiles?.[0]?.plan || 'N/A', new Date(u.createdAt).toLocaleDateString()])
            ];
            const csv = csvRows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zonyd_reporte_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            DESCARGAR REPORTES
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Usuarios Totales" value={stats.totalUsers} icon={<Users className="text-blue-400" />} trend="+12 este mes" />
        <StatCard title="Pendientes Aprobación" value={stats.pendingReleases} icon={<Clock className="text-[#FF9F0A]" />} trend="Acción requerida" alert />
        <StatCard title="Ingresos Globales" value={`$${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="text-green-400" />} trend="Total acumulado" />
        <StatCard title="Distribuciones Live" value={stats.activeDistributions} icon={<Activity className="text-purple-400" />} trend="Sincronizado" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-px">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Vista General" />
        <TabButton active={activeTab === 'releases'} onClick={() => setActiveTab('releases')} label="Lanzamientos" badge={pendingReleases.length > 0 ? pendingReleases.length.toString() : undefined} />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Usuarios y Planes" />
        <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Bitácora de Sistema" />
      </div>

      {/* Content Sections */}
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden">
                <CardHeader className="bg-black/20 p-6 border-b border-white/5">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Últimos Lanzamientos Pendientes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingReleases.length === 0 ? (
                    <div className="p-12 text-center text-[#A1A1AA] space-y-4">
                      <CheckCircle2 className="mx-auto text-[#34C759]/40" size={48} />
                      <p className="text-sm">Todo al día. No hay lanzamientos esperando aprobación.</p>
                    </div>
                  ) : (
                    pendingReleases.map((release) => (
                      <ReleaseRow key={release.id} release={release} onApprove={() => handleApproveRelease(release.id)} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden">
                <CardHeader className="bg-black/20 p-6 border-b border-white/5">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Actividad Reciente (Bitácora)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {logs.slice(0, 8).map((log, i) => (
                      <LogItem key={i} log={log} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'releases' && (
           <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden">
             <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={18} />
                    <input type="text" placeholder="Buscar por UPC, Artista o Título..." className="w-full bg-black/40 border border-[#232733] rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#FF9F0A] outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-white/5 text-[10px] font-black uppercase"><Filter size={14} className="mr-2" /> Filtrar</Button>
                    <Button variant="outline" className="border-white/5 text-[10px] font-black uppercase"><Download size={14} className="mr-2" /> Exportar CSV</Button>
                  </div>
                </div>

                {/* Pipeline de Distribución Manual */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                  {[
                    { label: 'Borrador', color: '#A1A1AA', status: 'DRAFT' },
                    { label: 'Pendiente', color: '#FF9F0A', status: 'PENDING_APPROVAL' },
                    { label: 'Aprobado', color: '#4F8CFF', status: 'APPROVED' },
                    { label: 'Distribuido', color: '#34C759', status: 'DISTRIBUTED' },
                    { label: 'Live en DSPs', color: '#1DB954', status: 'LIVE' },
                  ].map((s) => (
                    <div key={s.status} className="p-3 rounded-xl border border-white/5 bg-black/20 text-center cursor-pointer hover:border-[#FF9F0A]/30 transition-all">
                      <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}40` }} />
                      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: s.color }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tabla de releases */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-black/40 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Release</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Artista</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">UPC</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Estado</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Fecha</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em] text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingReleases.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-[#A1A1AA]">
                            <CheckCircle2 className="mx-auto mb-4 text-[#34C759]/30" size={48} />
                            <p className="text-sm font-bold">No hay releases pendientes de gestión.</p>
                            <p className="text-xs text-[#3A3A3C] mt-1">Los nuevos lanzamientos de artistas aparecerán aquí.</p>
                          </td>
                        </tr>
                      ) : (
                        pendingReleases.map((release: any) => (
                          <tr key={release.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                                  {release.coverUrl ? (
                                    <img src={release.coverUrl} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Music size={16} className="text-white/20" /></div>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-white truncate max-w-[180px]">{release.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#A1A1AA]">{release.artist?.stageName || '—'}</td>
                            <td className="px-6 py-4 text-[10px] font-mono text-[#A1A1AA]">{release.upc || 'Pendiente'}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                                release.status === 'LIVE' ? 'bg-[#1DB954]/20 text-[#1DB954]' :
                                release.status === 'DISTRIBUTED' ? 'bg-[#34C759]/20 text-[#34C759]' :
                                release.status === 'APPROVED' ? 'bg-[#4F8CFF]/20 text-[#4F8CFF]' :
                                release.status === 'PENDING_APPROVAL' ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]' :
                                release.status === 'REJECTED' ? 'bg-[#FF453A]/20 text-[#FF453A]' :
                                'bg-white/5 text-[#A1A1AA]'
                              }`}>{release.status}</span>
                            </td>
                            <td className="px-6 py-4 text-[10px] text-[#A1A1AA]">{new Date(release.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {release.status === 'PENDING_APPROVAL' && (
                                  <>
                                    <Button onClick={() => handleApproveRelease(release.id)} size="sm" className="bg-[#34C759] hover:bg-[#34C759]/90 text-white text-[9px] font-black h-8 px-3 uppercase">Aprobar</Button>
                                    <Button size="sm" variant="outline" className="border-[#FF453A]/30 text-[#FF453A] hover:bg-[#FF453A]/10 text-[9px] font-black h-8 px-3 uppercase">Rechazar</Button>
                                  </>
                                )}
                                {release.status === 'APPROVED' && (
                                  <Button size="sm" className="bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white text-[9px] font-black h-8 px-3 uppercase">
                                    Marcar Distribuido
                                  </Button>
                                )}
                                {release.status === 'DISTRIBUTED' && (
                                  <Button size="sm" className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white text-[9px] font-black h-8 px-3 uppercase">
                                    Confirmar Live
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-[#A1A1AA] hover:text-white h-8 px-2">
                                  <Eye size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </CardContent>
           </Card>
        )}

        {activeTab === 'users' && (
          <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden">
            <CardHeader className="bg-black/20 p-6 border-b border-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Usuarios y Planes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {users.length === 0 ? (
                <div className="p-12 text-center text-[#A1A1AA]">
                  <Users className="mx-auto mb-4 text-[#232733]" size={48} />
                  <p className="text-sm">No hay usuarios registrados aún.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 border-b border-white/5">
                      <tr>
                        {['Usuario', 'Rol', 'Plan', 'Artista', 'Registro'].map(h => (
                          <th key={h} className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-white">{u.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${
                              u.role === 'ADMIN' ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]' : 'bg-white/5 text-[#A1A1AA]'
                            }`}>{u.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${
                              u.artistProfiles?.[0]?.plan === 'LABEL' ? 'bg-[#7B61FF]/20 text-[#7B61FF]' :
                              u.artistProfiles?.[0]?.plan === 'PRO' ? 'bg-[#4F8CFF]/20 text-[#4F8CFF]' :
                              'bg-white/5 text-[#A1A1AA]'
                            }`}>{u.artistProfiles?.[0]?.plan || 'FREE'}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-[#A1A1AA]">{u.artistProfiles?.[0]?.stageName || '—'}</td>
                          <td className="px-6 py-4 text-[10px] text-[#A1A1AA]">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'logs' && (
          <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden">
            <CardHeader className="bg-black/20 p-6 border-b border-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Bitácora de Sistema</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <div className="p-12 text-center text-[#A1A1AA]">
                  <Activity className="mx-auto mb-4 text-[#232733]" size={48} />
                  <p className="text-sm">No hay eventos registrados en la bitácora.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 border-b border-white/5">
                      <tr>
                        {['Acción', 'Usuario', 'Detalles', 'Fecha'].map(h => (
                          <th key={h} className="px-6 py-4 text-[9px] font-black text-[#3A3A3C] uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.map((log: any, i: number) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black text-[#FF9F0A] uppercase">{log.action}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-[#A1A1AA]">{log.user?.email || '—'}</td>
                          <td className="px-6 py-4 text-[10px] text-[#A1A1AA] max-w-xs truncate">
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                          </td>
                          <td className="px-6 py-4 text-[10px] text-[#A1A1AA]">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

    </div>
  );
}

function StatCard({ title, value, icon, trend, alert }: { title: string, value: any, icon: React.ReactNode, trend: string, alert?: boolean }) {
  return (
    <Card className={`bg-[#151821] border-[#232733] rounded-3xl p-6 transition-all hover:border-[#FF9F0A]/30 ${alert ? 'border-[#FF9F0A]/20 shadow-[0_0_20px_rgba(255,159,10,0.05)]' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        <div className={`text-[10px] font-black uppercase px-2 py-1 rounded ${alert ? 'bg-[#FF9F0A]/10 text-[#FF9F0A]' : 'bg-white/5 text-[#A1A1AA]'}`}>
          {trend}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest mt-1">{title}</p>
      </div>
    </Card>
  );
}

function TabButton({ active, onClick, label, badge }: { active: boolean, onClick: () => void, label: string, badge?: string | number }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-4 text-xs font-black uppercase tracking-widest relative transition-all ${active ? 'text-[#FF9F0A]' : 'text-[#A1A1AA] hover:text-white'}`}
    >
      <div className="flex items-center gap-2">
        {label}
        {badge && <span className="bg-[#FF9F0A] text-black text-[9px] px-1.5 py-0.5 rounded-full">{badge}</span>}
      </div>
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF9F0A] rounded-t-full shadow-[0_0_10px_rgba(255,159,10,0.5)]" />}
    </button>
  );
}

function ReleaseRow({ release, onApprove }: { release: any, onApprove: () => void }) {
  return (
    <div className="p-6 border-b border-white/5 hover:bg-black/10 transition-colors flex items-center justify-between group">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 overflow-hidden relative group-hover:border-[#FF9F0A]/30 transition-all">
          {release.coverUrl ? (
            <img src={release.coverUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Music size={24} className="text-white/20" /></div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white group-hover:text-[#FF9F0A] transition-colors">{release.title}</h4>
          <p className="text-xs text-[#A1A1AA] mt-0.5">{release.artist?.stageName || 'Artista Desconocido'}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded text-[#A1A1AA] uppercase tracking-widest">{release.genre}</span>
            <span className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Recibido hoy</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="border-white/5 text-[10px] font-black uppercase h-10 hover:bg-white/5">Inspeccionar</Button>
        <Button onClick={onApprove} className="bg-[#34C759] hover:bg-[#34C759]/90 text-white font-black px-6 h-10 text-[10px] uppercase tracking-widest shadow-lg shadow-[#34C759]/10">Aprobar Entrega</Button>
      </div>
    </div>
  );
}

function LogItem({ log }: { log: any }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <div className="w-2 h-2 rounded-full bg-[#FF9F0A] shadow-[0_0_10px_rgba(255,159,10,0.5)]" />
        <div className="w-px h-full bg-white/5 mx-auto mt-2" />
      </div>
      <div>
        <p className="text-xs font-bold text-white leading-tight">{log.action}</p>
        <p className="text-[10px] text-[#A1A1AA] mt-1">{log.details}</p>
        <p className="text-[9px] text-[#A1A1AA]/50 uppercase mt-1">Hace 5 minutos</p>
      </div>
    </div>
  );
}

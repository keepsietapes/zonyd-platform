'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Music, 
  BarChart3, 
  Wallet, 
  Link as LinkIcon, 
  Megaphone, 
  Sparkles, 
  Settings, 
  LogOut, 
  Bell, 
  User,
  Users,
  Search,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  FileText,
  Plus,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

// ============================================================
// TIPOS
// ============================================================
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  isOpen?: boolean;
  badge?: string;
}

// ============================================================
// CONFIGURACIÓN DE NAVEGACIÓN UNIFICADA
// ============================================================
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',     href: '/dashboard',                  section: 'main' },
  { icon: Music,           label: 'Lanzamientos',  href: '/dashboard/releases/new',     section: 'main' },
  { icon: BarChart3,       label: 'Analíticas',    href: '/dashboard/analytics',        section: 'main' },
  { icon: Wallet,          label: 'Finanzas',      href: '/dashboard/royalties',        section: 'main' },
  { icon: User,            label: 'Perfil',        href: '/dashboard/settings',         section: 'main' },
  // Marketing
  { icon: LinkIcon,        label: 'Smart Links',   href: '/dashboard/smartlinks',       section: 'marketing' },
  { icon: Users,           label: 'Audiencia',     href: '/dashboard/audience',         section: 'marketing' },
  { icon: Globe,           label: 'Marketplace',   href: '/dashboard/marketplace',      section: 'marketing' },
  { icon: Sparkles,        label: 'The Lab (AI)',  href: '/dashboard/lab',              section: 'marketing', highlight: true, requiresPro: true },
  { icon: ShieldCheck,     label: 'Zonyd Label',   href: '/dashboard/lab/services',     section: 'marketing', highlight: true },
  { icon: Megaphone,       label: 'Herramientas',  href: '/dashboard/tools',            section: 'marketing' },
  { icon: Zap,             label: 'Zonyd AI',      href: '/dashboard/ai',               section: 'marketing', highlight: true },
  // Organización
  { icon: User,            label: 'Equipo',        href: '/dashboard/team',             section: 'org' },
  { icon: Settings,        label: 'Ajustes',       href: '/dashboard/settings',         section: 'org' },
  // Admin
  { icon: FileText,        label: 'Publishing',    href: '/dashboard/publishing',       section: 'admin' },
  { icon: ShieldCheck,     label: 'Zonyd Control', href: '/dashboard/admin',            section: 'admin', adminOnly: true },
];

// Items para el Bottom Tab (mobile) — los 5 más importantes
const BOTTOM_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Inicio',   href: '/dashboard' },
  { icon: Music,           label: 'Música',   href: '/dashboard/releases/new' },
  { icon: Plus,            label: '',         href: '/dashboard/releases/new', isCTA: true },
  { icon: BarChart3,       label: 'Stats',    href: '/dashboard/analytics' },
  { icon: User,            label: 'Perfil',   href: '/dashboard/settings' },
];

// ============================================================
// LAYOUT PRINCIPAL
// ============================================================
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('midnight');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('Artista');
  const [userPlan, setUserPlan] = useState('FREE');
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Cargar datos del usuario ──────────────────────────────
  useEffect(() => {
    const getUserData = async () => {
      // Si ya estamos en /onboarding, no redirigir (evita el bucle)
      if (pathname === '/onboarding') return;

      // Si ya completó el onboarding anteriormente, no volver a verificar
      const onboardingDone = localStorage.getItem('zonyd_onboarding_complete');

      try {
        const { authFetch } = await import('@/lib/api');
        const res = await authFetch('/api/user/me');

        if (!res) return; // 401 o fallo de red — no redirigir

        const profile = res.artistProfiles?.[0];

        // Solo redirigir al onboarding si NO tiene perfil Y no ha completado antes
        if (!profile && res.role !== 'ADMIN' && res.role !== 'SUPERADMIN' && !onboardingDone) {
          router.push('/onboarding');
          return;
        }

        // Si tiene perfil, marcar onboarding como completo
        if (profile) {
          localStorage.setItem('zonyd_onboarding_complete', 'true');
        }

        if (profile?.stageName) {
          setDisplayName(profile.stageName);
        } else if (res.email) {
          const namePart = res.email.split('@')[0];
          setDisplayName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }

        if (profile?.plan) {
          setUserPlan(profile.plan);
        }

        setUserEmail(res.email || '');

        if (res.role === 'ADMIN' || res.role === 'SUPERADMIN' || res.role === 'LABEL') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error cargando layout data:', err);
      }
    };
    getUserData();
  }, [pathname]);

  // ── Tema persistente ──────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem('zonyd-theme') || 'midnight';
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('zonyd-theme') || 'midnight';
      setActiveTheme(currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
    };

    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('theme-sync', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('theme-sync', handleThemeChange);
    };
  }, []);

  // ── Cerrar menú mobile al cambiar de ruta ────────────────
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex flex-col h-dvh bg-[#0B0B0F] overflow-hidden">
      
      {/* ── THEME ENGINE ─────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{__html: `
        [data-theme="graphite"] .bg-\\[\\#0B0B0F\\] { background-color: #111112 !important; }
        [data-theme="graphite"] .bg-\\[\\#151821\\] { background-color: #1C1C1E !important; }
        [data-theme="graphite"] .border-\\[\\#232733\\] { border-color: #2C2C2E !important; }
        [data-theme="royal"] .bg-\\[\\#0B0B0F\\] { background-color: #0A0514 !important; }
        [data-theme="royal"] .bg-\\[\\#151821\\] { background-color: #150A21 !important; }
        [data-theme="royal"] .border-\\[\\#232733\\] { border-color: #2D1B4E !important; }
      `}} />

      {/* ══════════════════════════════════════════════════════
          HEADER — Full Width (Desktop + Mobile)
         ══════════════════════════════════════════════════════ */}
      <header className="shrink-0 h-16 md:h-20 border-b border-[#232733] bg-[#0B0B0F]/90 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-30 safe-top">
        
        {/* Logo + Toggle */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center">
            <img src="/logo.png" alt="Zonyd" className="h-8 md:h-10 w-auto object-contain" />
          </Link>
          
          {/* Sidebar toggle — solo desktop */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex p-2 hover:bg-white/5 rounded-lg text-[#A1A1AA] transition-colors icon-sm"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Search — desktop */}
          <div className="hidden lg:flex items-center bg-[#151821] border border-[#232733] rounded-full px-4 py-2 w-72 gap-3 group focus-within:border-[#FF9F0A] transition-all ml-2">
            <Search size={14} className="text-[#A1A1AA] group-focus-within:text-[#FF9F0A] shrink-0" />
            <input 
              type="search" 
              placeholder="Buscar tracks, ISRC..." 
              className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-[#3A3A3C]"
              style={{ fontSize: '14px' }} // Override para desktop
            />
          </div>
        </div>

        {/* Acciones del Header */}
        <div className="flex items-center gap-2 md:gap-4 relative">
          
          {/* Search icon — mobile */}
          <button className="md:hidden p-2 text-[#A1A1AA] hover:text-white transition-colors icon-sm" aria-label="Buscar">
            <Search size={18} />
          </button>

          {/* Notificaciones */}
          <div className="relative">
            <button 
              onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); setHasNotifications(false); }}
              className={`p-2.5 rounded-full border border-[#232733] transition-all relative ${isNotificationsOpen ? 'bg-[#FF9F0A] border-[#FF9F0A] text-black' : 'text-[#A1A1AA] hover:border-white/20'}`}
              aria-label="Notificaciones"
            >
              <Bell size={18} />
              {hasNotifications && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF453A] rounded-full border-2 border-[#0B0B0F] animate-pulse" />}
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-12 right-0 w-[90vw] max-w-sm bg-[#151821] border border-[#232733] rounded-3xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <span className="text-xs font-black uppercase tracking-widest text-white">Notificaciones</span>
                  <button onClick={() => setIsNotificationsOpen(false)} className="icon-sm flex items-center justify-center"><X size={14} className="text-[#A1A1AA]" /></button>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar p-4">
                  <div className="text-center py-6 text-[#A1A1AA]">
                    <Bell className="mx-auto mb-2 opacity-20" size={24} />
                    <p className="text-xs">No tienes notificaciones nuevas.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Perfil */}
          <div className="relative">
            <button 
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
              className="flex items-center gap-2 p-1 pr-2 hover:bg-white/5 rounded-full transition-all"
              aria-label="Perfil"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-white italic uppercase tracking-wider leading-none">{displayName}</p>
                <p className="text-[9px] text-[#FF9F0A] font-bold uppercase leading-none mt-0.5">Plan {userPlan}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-[#FF9F0A] to-[#FF453A] p-0.5 shadow-lg shadow-[#FF9F0A]/10 shrink-0">
                <div className="w-full h-full rounded-full bg-[#0B0B0F] flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute top-14 right-0 w-64 bg-[#151821] border border-[#232733] rounded-3xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col gap-1">
                  <span className="text-xs font-black text-white uppercase tracking-wider">{displayName}</span>
                  <span className="text-[10px] text-[#A1A1AA] truncate">{userEmail}</span>
                </div>
                <div className="py-2">
                  <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors">
                    <Settings size={16} /> Configuración
                  </Link>
                  {userPlan !== 'LABEL' && (
                    <Link href="/dashboard/settings?tab=billing" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#A1A1AA] hover:text-[#FF9F0A] hover:bg-white/5 transition-colors">
                      <Sparkles size={16} /> Mejorar a Label
                    </Link>
                  )}
                </div>
                <div className="p-2 border-t border-white/5">
                  <button 
                    onClick={() => { setShowLogoutConfirm(true); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#FF453A] hover:bg-[#FF453A]/10 rounded-xl transition-colors"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          BODY — Sidebar (desktop) + Content
         ══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ── SIDEBAR — Solo Desktop ────────────────────────── */}
        <aside 
          className={`hidden md:flex ${isSidebarOpen ? 'w-64' : 'w-[72px]'} transition-all duration-300 ease-in-out border-r border-[#232733] flex-col z-20 bg-[#0B0B0F] shrink-0`}
        >
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
            <SidebarSection title="Principal" isOpen={isSidebarOpen}>
              {NAV_ITEMS.filter(i => i.section === 'main' && i.href !== '/dashboard/settings' && i.href !== '/dashboard/royalties').map(item => (
                <SidebarItem key={item.href} icon={<item.icon size={18} />} label={item.label} href={item.href} active={pathname === item.href} isOpen={isSidebarOpen} />
              ))}
              <SidebarItem icon={<Wallet size={18} />} label="Finanzas" href="/dashboard/royalties" active={pathname === '/dashboard/royalties'} isOpen={isSidebarOpen} />
            </SidebarSection>
            
            {/* Solo mostrar Marketing si no es plan FREE o si son herramientas básicas */}
            <SidebarSection title="Marketing" isOpen={isSidebarOpen}>
              {NAV_ITEMS.filter(i => i.section === 'marketing').map(item => {
                // Ocultar The Lab si no es PRO o LABEL
                if (item.label === 'The Lab (AI)' && userPlan === 'FREE') return null;
                return (
                  <SidebarItem 
                    key={item.href} 
                    icon={<item.icon size={18} className={(item as any).highlight ? 'text-[#FF9F0A]' : ''} />} 
                    label={item.label} 
                    href={item.href} 
                    active={pathname === item.href} 
                    isOpen={isSidebarOpen} 
                  />
                );
              })}
            </SidebarSection>

            <SidebarSection title="Organización" isOpen={isSidebarOpen}>
              {/* Ocultar Equipo si no es LABEL */}
              {userPlan === 'LABEL' && (
                <SidebarItem icon={<User size={18} />} label="Equipo" href="/dashboard/team" active={pathname === '/dashboard/team'} isOpen={isSidebarOpen} />
              )}
              <SidebarItem icon={<Settings size={18} />} label="Ajustes" href="/dashboard/settings" active={pathname === '/dashboard/settings'} isOpen={isSidebarOpen} />
            </SidebarSection>

            <SidebarSection title="Administración" isOpen={isSidebarOpen}>
              {NAV_ITEMS.filter(i => i.section === 'admin' && (!i.adminOnly || isAdmin)).map(item => (
                <SidebarItem key={item.href} icon={<item.icon size={18} />} label={item.label} href={item.href} active={pathname === item.href} isOpen={isSidebarOpen} />
              ))}
            </SidebarSection>
          </nav>
        </aside>

        {/* ── CONTENT ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-transparent relative custom-scrollbar pb-safe md:pb-0">
          {children}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════
          BOTTOM NAVIGATION — Solo Mobile
         ══════════════════════════════════════════════════════ */}
      <nav className="bottom-nav flex md:hidden items-center justify-around px-2">
        {BOTTOM_NAV_ITEMS.map((item, i) => {
          const isActive = pathname === item.href && !item.isCTA;
          
          if (item.isCTA) {
            return (
              <Link 
                key={i} 
                href={item.href}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FF9F0A] shadow-lg shadow-[#FF9F0A]/30 -mt-4 active:scale-95 transition-transform"
                aria-label="Nuevo Lanzamiento"
              >
                <Plus size={22} className="text-black" />
              </Link>
            );
          }

          return (
            <Link
              key={i}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors flex-1 ${
                isActive ? 'text-[#FF9F0A]' : 'text-[#3A3A3C] hover:text-[#A1A1AA]'
              }`}
              aria-label={item.label}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-[#FF9F0A]" />}
            </Link>
          );
        })}
      </nav>

      {/* ══════════════════════════════════════════════════════
          MOBILE MENU — Drawer
         ══════════════════════════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0B0B0F] border-r border-[#232733] safe-top overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <img src="/logo.png" alt="Zonyd" className="h-8 object-contain" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#A1A1AA] icon-sm"><X size={18} /></button>
            </div>
            <nav className="p-4 space-y-6">
              {/* Perfil en drawer */}
              <div className="flex items-center gap-3 p-3 bg-[#151821] rounded-2xl border border-[#232733]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF9F0A] to-[#FF453A] p-0.5">
                  <div className="w-full h-full rounded-full bg-[#0B0B0F] flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase">{displayName}</p>
                  <p className="text-[9px] text-[#A1A1AA] truncate max-w-[150px]">{userEmail}</p>
                </div>
              </div>
              
              {/* Nav items */}
              {[
                { title: 'Principal', items: NAV_ITEMS.filter(i => i.section === 'main') },
                { title: 'Marketing', items: NAV_ITEMS.filter(i => i.section === 'marketing') },
                { title: 'Organización', items: NAV_ITEMS.filter(i => i.section === 'org') },
              ].map(({ title, items }) => (
                <div key={title} className="space-y-1">
                  <p className="text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em] px-3 mb-2">{title}</p>
                  {items.map(item => (
                    <Link 
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${pathname === item.href ? 'bg-[#FF9F0A] text-black' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'}`}
                    >
                      <item.icon size={16} />
                      <span className="text-sm font-bold">{item.label}</span>
                    </Link>
                  ))}
                </div>
              ))}

              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => { setShowLogoutConfirm(true); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-[#FF453A] hover:bg-[#FF453A]/10 rounded-xl transition-colors"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL LOGOUT
         ══════════════════════════════════════════════════════ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative w-full max-w-sm bg-[#151821] border border-[#232733] rounded-[32px] p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-[#FF453A]/10 flex items-center justify-center mb-6 mx-auto">
              <AlertCircle size={32} className="text-[#FF453A]" />
            </div>
            <h3 className="text-xl font-black text-white text-center mb-2 italic uppercase tracking-tight">¿Cerrar Sesión?</h3>
            <p className="text-sm text-[#A1A1AA] text-center mb-8 leading-relaxed">
              Los cambios no guardados en <span className="text-white font-bold">The Lab</span> se perderán.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleLogout}
                className="h-12 bg-[#FF453A] text-white hover:bg-[#FF453A]/90 font-black uppercase tracking-widest text-xs rounded-2xl"
              >
                Sí, Salir de Zonyd
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowLogoutConfirm(false)}
                className="h-12 text-[#A1A1AA] hover:text-white font-bold rounded-2xl"
              >
                Quedarme
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function SidebarItem({ icon, label, href, active, isOpen }: NavItemProps) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        active 
        ? 'bg-[#FF9F0A] text-black shadow-lg shadow-[#FF9F0A]/10' 
        : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
      }`}
      title={!isOpen ? label : undefined}
    >
      <div className={`shrink-0 ${active ? 'text-black' : 'group-hover:scale-110 transition-transform'}`}>
        {icon}
      </div>
      {isOpen && <span className="text-sm font-bold tracking-tight truncate">{label}</span>}
    </Link>
  );
}

function SidebarSection({ title, children, isOpen }: { title: string; children: React.ReactNode; isOpen?: boolean }) {
  return (
    <div className="space-y-1">
      {isOpen && <p className="px-3 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em] mb-2">{title}</p>}
      {children}
    </div>
  );
}

function NotificationItem({ icon, title, desc, time }: { icon: React.ReactNode; title: string; desc: string; time: string }) {
  return (
    <div className="p-4 border-b border-white/5 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-bold text-white">{title}</p>
          <p className="text-[10px] text-[#A1A1AA] leading-relaxed">{desc}</p>
          <p className="text-[9px] text-[#3A3A3C] uppercase font-bold">{time}</p>
        </div>
      </div>
    </div>
  );
}

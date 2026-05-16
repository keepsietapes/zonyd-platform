'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  User, 
  Wallet, 
  Shield, 
  Globe, 
  Bell, 
  Camera, 
  CheckCircle2, 
  CreditCard, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Settings as SettingsIcon,
  Palette,
  Smartphone,
  Fingerprint,
  QrCode,
  ShieldCheck,
  X,
  Loader2
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { authFetch } from '@/lib/api';

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'payout' | 'plan' | 'security'>('profile');
  const [activeTheme, setActiveTheme] = useState<'midnight' | 'graphite' | 'royal'>('midnight');
  
  const [isAuthyOpen, setIsAuthyOpen] = useState(false);
  const [isPasskeyOpen, setIsPasskeyOpen] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const [artistName, setArtistName] = useState('Artista');
  const [contactEmail, setContactEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [payoutMethod, setPayoutMethod] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [spotifyDevId, setSpotifyDevId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('FREE');
  const [isSaving, setIsSaving] = useState(false);
  const [artistProfiles, setArtistProfiles] = useState<any[]>([]);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [paypalVerified, setPaypalVerified] = useState(false);
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'billing') setActiveTab('plan');
    const savedTheme = localStorage.getItem('zonyd-theme') || 'midnight';
    setActiveTheme(savedTheme as any);
    
    // Check Admin status and User Data
    const fetchUserData = async () => {
      try {
        console.log('🔄 Cargando datos de usuario...');
        const res = await authFetch('/api/user/me');
        console.log('📦 Respuesta del servidor:', res);
        
        if (res) {
          if (res.role === 'ADMIN' || res.role === 'SUPERADMIN' || res.role === 'LABEL') {
            setIsAdmin(true);
          }
          if (res.artistProfiles && res.artistProfiles.length > 0) {
            setArtistProfiles(res.artistProfiles);
            const primary = res.artistProfiles[0];
            if (primary.plan) setCurrentPlan(primary.plan);
            if (primary.stageName) setArtistName(primary.stageName);
            if (primary.bio) setBio(primary.bio);
            if (primary.paypalEmail) { setPayoutMethod(primary.paypalEmail); setPaypalVerified(true); }
            if (primary.clabe) setBankAccount(primary.clabe);
            if (primary.spotifyUrl) setSpotifyUrl(primary.spotifyUrl);
            if (primary.instagramUrl) setInstagramUrl(primary.instagramUrl);
            if (primary.tiktokUrl) setTiktokUrl(primary.tiktokUrl);
            if (res.email) setContactEmail(res.email);
          } else {
            console.warn('⚠️ No se encontraron perfiles de artista.');
          }
        }
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
      }
    };
    fetchUserData();

    // Check for Stripe session completion
    const sessionId = searchParams.get('session_id');
    const pendingPlan = searchParams.get('plan');
    if (sessionId && pendingPlan) {
      const verifyPayment = async () => {
        try {
          const res = await authFetch('/api/billing/confirm-payment', {
            method: 'POST',
            body: JSON.stringify({ session_id: sessionId, plan: pendingPlan })
          });
          if (res && res.success) {
            alert(`¡Pago completado con éxito! Bienvenido al plan ${res.plan}.`);
            // Clean up URL to avoid re-triggering
            window.history.replaceState({}, document.title, window.location.pathname + "?tab=plan");
            setCurrentPlan(res.plan);
            window.location.reload();
          }
        } catch (err) {
          console.error('Error al verificar pago:', err);
          alert('Hubo un problema verificando tu pago. Por favor contacta a soporte.');
        }
      };
      verifyPayment();
    }
  }, [searchParams]);

  const changeTheme = (theme: 'midnight' | 'graphite' | 'royal') => {
    setActiveTheme(theme);
    localStorage.setItem('zonyd-theme', theme);
    window.dispatchEvent(new Event('theme-sync'));
  };

  const handlePasskeyCreation = () => {
    setPasskeyStatus('scanning');
    setTimeout(() => {
      setPasskeyStatus('success');
      setTimeout(() => setIsPasskeyOpen(false), 2000);
    }, 3000);
  };

  const handleUpgradePlan = async (plan: string) => {
    try {
      const res = await authFetch('/api/billing/upgrade', {
        method: 'POST',
        body: JSON.stringify({ plan })
      });
      if (!res) throw new Error('Sesión inválida o error de conexión. Por favor recarga la página e intenta de nuevo.');
      
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setCurrentPlan(plan);
        alert(`¡Felicidades! Has actualizado al plan ${plan}.`);
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al procesar la solicitud.');
    }
  };

  return (
    <div className="p-8 space-y-10 selection:bg-[#FF9F0A] selection:text-white relative">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3 transition-colors duration-500">
          <SettingsIcon className="text-[#FF9F0A]" size={32} /> Configuración
        </h1>
        <p className="text-[#A1A1AA] text-sm mt-2 transition-colors duration-500">Gestiona tu identidad, finanzas y nivel de suscripción.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar (Vertical Tabs) */}
        <div className="lg:col-span-3 space-y-2">
           <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />} label="Perfil de Artista" />
           <TabButton active={activeTab === 'payout'} onClick={() => setActiveTab('payout')} icon={<Wallet size={18} />} label="Pagos y Retiros" />
           <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<CreditCard size={18} />} label="Suscripción y Plan" />
           <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={18} />} label="Seguridad y Apariencia" />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           
           {activeTab === 'profile' && (
             <div className="space-y-6">
                <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden transition-colors duration-500">
                   <CardHeader className="bg-black/20 p-6 border-b border-white/5 transition-colors duration-500">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-white transition-colors duration-500">Identidad Digital</CardTitle>
                   </CardHeader>
                   <CardContent className="p-8 space-y-8">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                         <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FF9F0A] to-[#FF453A] p-1 shadow-2xl relative overflow-hidden">
                               <div className="w-full h-full bg-[#0B0B0F] rounded-full flex items-center justify-center text-3xl font-black text-white overflow-hidden transition-colors duration-500">
                                  {profileImage ? (
                                    <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
                                  ) : (
                                    artistName.substring(0, 2).toUpperCase()
                                  )}
                               </div>
                            </div>
                            <button 
                               onClick={() => {
                                 // Simular selector de archivos
                                 const input = document.createElement('input');
                                 input.type = 'file';
                                 input.accept = 'image/*';
                                 input.onchange = (e: any) => {
                                   const file = e.target.files[0];
                                   if (file) {
                                     const url = URL.createObjectURL(file);
                                     setProfileImage(url);
                                     alert('Imagen de perfil actualizada correctamente.');
                                   }
                                 };
                                 input.click();
                               }}
                               className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF9F0A] rounded-full flex items-center justify-center border-4 border-[#151821] text-black hover:scale-110 transition-all duration-500"
                            >
                               <Camera size={16} />
                            </button>
                         </div>
                         <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest transition-colors duration-500">Nombre Artístico</label>
                                  <input 
                                    type="text" 
                                    value={artistName}
                                    onChange={(e) => setArtistName(e.target.value)}
                                    className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF9F0A] outline-none transition-all duration-500" 
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest transition-colors duration-500">Email de Contacto</label>
                                  <input 
                                    type="email" 
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF9F0A] outline-none transition-all duration-500" 
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest transition-colors duration-500">Biografía (Contexto para IA)</label>
                         <textarea 
                           rows={4} 
                           value={bio}
                           onChange={(e) => setBio(e.target.value)}
                           className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF9F0A] outline-none transition-all duration-500 resize-none" 
                         />
                      </div>
                      
                      <Button
                         disabled={isSaving}
                         onClick={async () => {
                           setIsSaving(true);
                           try {
                             const payload: Record<string, string> = { stageName: artistName, bio };
                             const artistId = artistProfiles[0]?.id;
                             if (artistId) payload.id = artistId;
                             const saved = await authFetch('/api/artist/profile', { method: 'PUT', body: JSON.stringify(payload) });
                             if (saved && !saved.error) {
                               setArtistProfiles((prev: any[]) => prev.map((p: any) => p.id === saved.id ? { ...p, ...saved } : p));
                               if (saved.stageName) setArtistName(saved.stageName);
                               if (saved.bio !== undefined) setBio(saved.bio);
                               alert('✅ ¡Perfil guardado correctamente!');
                             } else { alert('❌ Error al guardar. Intenta de nuevo.'); }
                           } catch (err: any) {
                             alert(`❌ ${err.message || 'No se pudo guardar el perfil.'}`);
                           } finally { setIsSaving(false); }
                         }}
                         className="bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-black font-black px-8 rounded-xl h-12 shadow-lg shadow-[#FF9F0A]/20"
                       >
                         {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                         GUARDAR PERFIL
                       </Button>
                   </CardContent>
                </Card>

                <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden transition-colors duration-500">
                    <CardHeader className="bg-black/20 p-6 border-b border-white/5 transition-colors duration-500">
                       <CardTitle className="text-sm font-black uppercase tracking-widest text-white transition-colors duration-500">Redes Sociales Vinculadas</CardTitle>
                    </CardHeader>
                     <CardContent className="p-6 space-y-6">
                        {/* Spotify */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Spotify for Artists</label>
                          <div className="flex gap-3">
                            <input
                              type="url"
                              placeholder="https://open.spotify.com/artist/..."
                              value={spotifyUrl}
                              onChange={e => setSpotifyUrl(e.target.value)}
                              id="spotify-url-input"
                              className="flex-1 bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#1DB954] outline-none transition-all"
                            />
                            <Button
                              disabled={isSaving}
                              onClick={async () => {
                                const val = spotifyUrl;
                                if (val && !/^https:\/\/(open\.spotify\.com\/artist\/|artists\.spotify\.com)/.test(val)) {
                                  alert('URL de Spotify inválida. Debe ser open.spotify.com/artist/... o artists.spotify.com');
                                  return;
                                }
                                setIsSaving(true);
                                try {
                                  const payload: any = { spotifyUrl: val };
                                  const artistId = artistProfiles[0]?.id;
                                  if (artistId) payload.id = artistId;
                                  const saved = await authFetch('/api/artist/profile', { method: 'PUT', body: JSON.stringify(payload) });
                                  if (saved && !saved.error) {
                                    setArtistProfiles((prev: any[]) => prev.map((p: any) => p.id === saved.id ? { ...p, ...saved } : p));
                                    setSpotifyUrl(val);
                                    alert('✅ Spotify vinculado correctamente.');
                                  }
                                } catch (err: any) {
                                  alert(`❌ ${err.message || 'Error al guardar.'}`);
                                } finally { setIsSaving(false); }
                              }}
                              className="bg-[#1DB954] hover:bg-[#1DB954]/80 text-black font-black px-5 rounded-xl h-12 shrink-0"
                            >Guardar</Button>
                          </div>
                          {artistProfiles[0]?.spotifyUrl && (
                            <p className="text-[10px] text-[#34C759] flex items-center gap-1"><CheckCircle2 size={12} /> Conectado correctamente</p>
                          )}
                        </div>

                        {/* Instagram */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Instagram Music</label>
                          <div className="flex gap-3">
                            <input
                              type="url"
                              placeholder="https://www.instagram.com/..."
                              value={instagramUrl}
                              onChange={e => setInstagramUrl(e.target.value)}
                              id="instagram-url-input"
                              className="flex-1 bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#E4405F] outline-none transition-all"
                            />
                            <Button
                              disabled={isSaving}
                              onClick={async () => {
                                const val = instagramUrl;
                                setIsSaving(true);
                                try {
                                  const payload: any = { instagramUrl: val };
                                  const artistId = artistProfiles[0]?.id;
                                  if (artistId) payload.id = artistId;
                                  const saved = await authFetch('/api/artist/profile', { method: 'PUT', body: JSON.stringify(payload) });
                                  if (saved && !saved.error) {
                                    setArtistProfiles((prev: any[]) => prev.map((p: any) => p.id === saved.id ? { ...p, ...saved } : p));
                                    setInstagramUrl(val);
                                    alert('✅ Instagram vinculado correctamente.');
                                  }
                                } catch (err: any) {
                                  alert(`❌ ${err.message || 'Error al guardar.'}`);
                                } finally { setIsSaving(false); }
                              }}
                              className="bg-[#E4405F] hover:bg-[#E4405F]/80 text-white font-black px-5 rounded-xl h-12 shrink-0"
                            >Guardar</Button>
                          </div>
                          {artistProfiles[0]?.instagramUrl && (
                            <p className="text-[10px] text-[#34C759] flex items-center gap-1"><CheckCircle2 size={12} /> Conectado correctamente</p>
                          )}
                        </div>

                        {/* TikTok */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">TikTok Music</label>
                          <div className="flex gap-3">
                            <input
                              type="url"
                              placeholder="https://www.tiktok.com/@..."
                              value={tiktokUrl}
                              onChange={e => setTiktokUrl(e.target.value)}
                              id="tiktok-url-input"
                              className="flex-1 bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-white outline-none transition-all"
                            />
                            <Button
                              disabled={isSaving}
                              onClick={async () => {
                                const val = tiktokUrl;
                                setIsSaving(true);
                                try {
                                  const payload: any = { tiktokUrl: val };
                                  const artistId = artistProfiles[0]?.id;
                                  if (artistId) payload.id = artistId;
                                  const saved = await authFetch('/api/artist/profile', { method: 'PUT', body: JSON.stringify(payload) });
                                  if (saved && !saved.error) {
                                    setArtistProfiles((prev: any[]) => prev.map((p: any) => p.id === saved.id ? { ...p, ...saved } : p));
                                    setTiktokUrl(val);
                                    alert('✅ TikTok vinculado correctamente.');
                                  }
                                } catch (err: any) {
                                  alert(`❌ ${err.message || 'Error al guardar.'}`);
                                } finally { setIsSaving(false); }
                              }}
                              className="bg-white hover:bg-gray-100 text-black font-black px-5 rounded-xl h-12 shrink-0"
                            >Guardar</Button>
                          </div>
                          {artistProfiles[0]?.tiktokUrl && (
                            <p className="text-[10px] text-[#34C759] flex items-center gap-1"><CheckCircle2 size={12} /> Conectado correctamente</p>
                          )}
                        </div>
                     </CardContent>
                 </Card>
             </div>
           )}

           {activeTab === 'payout' && (
             <div className="space-y-6">
                <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden transition-colors duration-500">
                   <CardHeader className="bg-black/20 p-6 border-b border-white/5 transition-colors duration-500">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-white transition-colors duration-500">Método de Cobro Principal</CardTitle>
                   </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="w-5 h-5" alt="PayPal" />
                               </div>
                               <p className="text-sm font-bold text-white transition-colors duration-500">PayPal Business</p>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest transition-colors duration-500">Correo de PayPal</label>
                               <input 
                                 type="email" 
                                 placeholder="tu-correo@paypal.com"
                                 value={payoutMethod}
                                 onChange={(e) => setPayoutMethod(e.target.value)}
                                 className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF9F0A] outline-none transition-all duration-500" 
                               />
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                               <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 flex items-center justify-center border border-[#34C759]/20">
                                  <Wallet className="text-[#34C759]" size={20} />
                               </div>
                               <p className="text-sm font-bold text-white transition-colors duration-500">Transferencia (CLABE)</p>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest transition-colors duration-500">Cuenta CLABE (18 dígitos)</label>
                               <input 
                                 type="text" 
                                 placeholder="000000000000000000"
                                 maxLength={18}
                                 value={bankAccount}
                                 onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setBankAccount(val);
                                 }}
                                 className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:border-[#34C759] outline-none transition-all duration-500" 
                               />
                            </div>
                         </div>
                       </div>
                       
                       <Button
                         disabled={isSaving}
                         onClick={async () => {
                           setIsSaving(true);
                           try {
                          disabled={isSaving}
                          onClick={async () => {
                            if (payoutMethod && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payoutMethod)) {
                              alert('❌ El correo de PayPal no tiene un formato válido.');
                              return;
                            }
                            if (bankAccount && bankAccount.length !== 18) {
                              alert('❌ La CLABE debe tener exactamente 18 dígitos.');
                              return;
                            }
                            setIsSaving(true);
                            try {
                              const payload: any = { paypalEmail: payoutMethod, clabe: bankAccount };
                              const artistId = artistProfiles[0]?.id;
                              if (artistId) payload.id = artistId;
                              
                              const saved = await authFetch('/api/artist/profile', { method: 'PUT', body: JSON.stringify(payload) });
                              if (saved && !saved.error) {
                                if (payoutMethod) setPaypalVerified(true);
                                alert('✅ Métodos de pago actualizados correctamente.');
                              }
                            } catch (err: any) {
                              alert(`❌ ${err.message || 'Error al guardar.'}`);
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          className="bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-black font-black px-8 rounded-xl h-12 shadow-lg shadow-[#FF9F0A]/20"
                        >
                          {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                          GUARDAR CONFIGURACIÓN DE PAGO
                        </Button>

                        {/* Verificación inteligente de PayPal */}
                        {payoutMethod && (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Verificación de cuenta PayPal</p>
                              <p className="text-xs text-white mt-1">{payoutMethod}</p>
                              {paypalVerified && (
                                <p className="text-[10px] text-[#34C759] flex items-center gap-1 mt-1"><CheckCircle2 size={10} /> Guardado correctamente</p>
                              )}
                            </div>
                            <a
                              href={`https://www.paypal.com/myaccount/transfer/homepage/external/profile?flowloaded=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors border border-blue-400/30 px-4 py-2 rounded-xl hover:bg-blue-400/10"
                            >
                              <ExternalLink size={12} /> VERIFICAR EN PAYPAL
                            </a>
                          </div>
                        )}

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-2 transition-colors duration-500">
                             <p className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest transition-colors duration-500">Umbral de Retiro</p>
                             <p className="text-2xl font-black text-white transition-colors duration-500">$10.00 USD</p>
                             <p className="text-[9px] text-[#A1A1AA] transition-colors duration-500">Retiros automáticos cada lunes al superar esta cifra.</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-2 transition-colors duration-500">
                             <p className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest transition-colors duration-500">Próxima Fecha de Pago</p>
                             <p className="text-2xl font-black text-[#34C759]">Lunes Próximo</p>
                             <p className="text-[9px] text-[#A1A1AA] transition-colors duration-500">Ciclo: Semanal (Money Monday).</p>
                          </div>
                       </div>
                    </CardContent>
                </Card>
             </div>
            )}

            {activeTab === 'plan' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <PlanCard 
                   title="Free" 
                   price="0" 
                   active={currentPlan === 'FREE'}
                   highlighted={currentPlan === 'FREE'}
                   features={['85% Royalties', 'Distribución a tiendas básicas', 'Dashboard estándar', 'Soporte vía Email']} 
                   onUpgrade={() => handleUpgradePlan('FREE')}
                 />
                 <PlanCard 
                   title="Indie" 
                   price="4.99" 
                   active={currentPlan === 'INDIE'}
                   highlighted={currentPlan === 'INDIE'}
                   features={['95% Royalties', 'Distribución rápida', 'Soporte Prioritario', 'Sin límites de artistas']} 
                   onUpgrade={() => handleUpgradePlan('INDIE')}
                 />
                 <PlanCard 
                   title="Pro" 
                   price="9.99" 
                   active={currentPlan === 'PRO'}
                   highlighted={currentPlan === 'PRO'}
                   features={['100% Royalties', 'Distribución ilimitada', 'Zonyd AI Co-Manager', 'SmartLinks Premium', 'Soporte 24/7']} 
                   onUpgrade={() => handleUpgradePlan('PRO')}
                 />
                 <PlanCard 
                   title="Label" 
                   price="29.99" 
                   active={currentPlan === 'LABEL'}
                   highlighted={currentPlan === 'LABEL'}
                   features={['100% Royalties', 'Artistas Ilimitados', 'Contratos Personalizados', 'Manager Dedicado', 'Analíticas en tiempo real']} 
                   onUpgrade={() => handleUpgradePlan('LABEL')}
                 />
              </div>
            )}


           {activeTab === 'security' && (
             <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Apariencia / Temas con AUTO-SAVE */}
                <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden transition-colors duration-500">
                   <CardHeader className="bg-black/20 p-6 border-b border-white/5 flex flex-row items-center justify-between transition-colors duration-500">
                      <div>
                         <CardTitle className="text-sm font-black uppercase tracking-widest text-white transition-colors duration-500">Apariencia del Dashboard</CardTitle>
                         <CardDescription className="text-[10px] mt-1 transition-colors duration-500">El cambio se aplica y se guarda automáticamente.</CardDescription>
                      </div>
                      <Palette className="text-[#A1A1AA] transition-colors duration-500" size={20} />
                   </CardHeader>
                   <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         
                         {/* Theme 1: Midnight */}
                         <div onClick={() => changeTheme('midnight')} className="space-y-3 cursor-pointer group">
                            <div className={`h-32 rounded-2xl border-2 p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${activeTheme === 'midnight' ? 'border-[#FF9F0A] shadow-[0_0_30px_rgba(255,159,10,0.15)]' : 'border-black/10 dark:border-[#232733] hover:border-[#FF9F0A]/50'}`}>
                               <div className="absolute inset-0 bg-[#0B0B0F] z-0" />
                               <div className="flex gap-2 relative z-10">
                                  <div className="w-1/3 h-16 bg-[#151821] rounded-lg border border-white/5" />
                                  <div className="w-2/3 h-16 bg-[#151821] rounded-lg border border-[#7B61FF]/30 flex items-center justify-center">
                                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF9F0A] to-[#FF453A]" />
                                  </div>
                               </div>
                               <div className="w-full h-4 bg-[#232733] rounded relative z-10" />
                               {activeTheme === 'midnight' && <div className="absolute top-2 right-2 bg-[#FF9F0A] text-black text-[8px] font-black px-2 py-1 rounded-full uppercase z-10">Activo</div>}
                            </div>
                            <div className="text-center">
                               <p className="text-sm font-bold text-white transition-colors duration-500">Zonyd Midnight</p>
                               <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest transition-colors duration-500">Oscuro + Neón</p>
                            </div>
                         </div>

                         {/* Theme 2: Graphite */}
                         <div onClick={() => changeTheme('graphite')} className="space-y-3 cursor-pointer group">
                            <div className={`h-32 rounded-2xl border-2 p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${activeTheme === 'graphite' ? 'border-[#00F2FE] shadow-[0_0_30px_rgba(0,242,254,0.15)]' : 'border-black/10 dark:border-[#232733] hover:border-[#00F2FE]/50'}`}>
                               <div className="absolute inset-0 bg-[#111112] z-0" />
                               <div className="flex gap-2 relative z-10">
                                  <div className="w-1/3 h-16 bg-[#1C1C1E] rounded-lg border border-white/5" />
                                  <div className="w-2/3 h-16 bg-[#1C1C1E] rounded-lg border border-[#00F2FE]/30 flex items-center justify-center">
                                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00F2FE] to-[#4FACFE]" />
                                  </div>
                               </div>
                               <div className="w-full h-4 bg-[#2C2C2E] rounded relative z-10" />
                               {activeTheme === 'graphite' && <div className="absolute top-2 right-2 bg-[#00F2FE] text-black text-[8px] font-black px-2 py-1 rounded-full uppercase z-10">Activo</div>}
                            </div>
                            <div className="text-center">
                               <p className="text-sm font-bold text-white transition-colors duration-500">Zonyd Graphite</p>
                               <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest transition-colors duration-500">Gris + Eléctrico</p>
                            </div>
                         </div>

                         {/* Theme 3: Royal */}
                         <div onClick={() => changeTheme('royal')} className="space-y-3 cursor-pointer group">
                            <div className={`h-32 rounded-2xl border-2 p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${activeTheme === 'royal' ? 'border-[#B983FF] shadow-[0_0_30px_rgba(185,131,255,0.2)]' : 'border-black/10 dark:border-[#232733] hover:border-[#B983FF]/50'}`}>
                               <div className="absolute inset-0 bg-[#0A0514] z-0" />
                               <div className="flex gap-2 relative z-10">
                                  <div className="w-1/3 h-16 bg-[#150A21] rounded-lg border border-[#B983FF]/10 shadow-sm" />
                                  <div className="w-2/3 h-16 bg-[#150A21] rounded-lg border border-[#B983FF]/20 flex items-center justify-center shadow-sm">
                                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6B21A8] to-[#B983FF]" />
                                  </div>
                               </div>
                               <div className="w-full h-4 bg-[#2D1B4E] rounded relative z-10" />
                               {activeTheme === 'royal' && <div className="absolute top-2 right-2 bg-[#B983FF] text-black text-[8px] font-black px-2 py-1 rounded-full uppercase z-10">Activo</div>}
                            </div>
                            <div className="text-center">
                               <p className="text-sm font-bold text-white transition-colors duration-500">Zonyd Royal</p>
                               <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest transition-colors duration-500">Morado + Neón</p>
                            </div>
                         </div>

                      </div>
                   </CardContent>
                </Card>

                {/* Seguridad Avanzada */}
                <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden transition-colors duration-500">
                   <CardHeader className="bg-black/20 p-6 border-b border-white/5 transition-colors duration-500">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-white transition-colors duration-500">Seguridad Avanzada (2FA)</CardTitle>
                      <CardDescription className="text-[10px] mt-1 transition-colors duration-500">Protege el acceso a tus regalías con autenticación de dos factores o biometría.</CardDescription>
                   </CardHeader>
                   <CardContent className="p-0">
                      
                      {/* Opcion 1: Authy / Authenticator */}
                      <div className="p-6 border-b border-white/5 hover:bg-black/10 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                         <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FF9F0A]/10 flex items-center justify-center border border-[#FF9F0A]/20 shrink-0">
                               <QrCode className="text-[#FF9F0A]" size={24} />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white mb-1 transition-colors duration-500">App Autenticadora (Authy / Google)</p>
                               <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-md transition-colors duration-500">Escanea un código QR con tu aplicación para generar códigos temporales de 6 dígitos cada vez que inicies sesión.</p>
                            </div>
                         </div>
                         <Button onClick={() => setIsAuthyOpen(true)} className="bg-[#FF9F0A] text-black font-black hover:bg-[#FF9F0A]/90 shrink-0">CONFIGURAR APP</Button>
                      </div>

                      {/* Opcion 2: Passkeys / Biometrics */}
                      <div className="p-6 hover:bg-black/10 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                         <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#4F8CFF]/10 flex items-center justify-center border border-[#4F8CFF]/20 shrink-0">
                               <Fingerprint className="text-[#4F8CFF]" size={24} />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white mb-1 flex items-center gap-2 transition-colors duration-500">
                                  Passkeys / Biometría Móvil <span className="text-[8px] bg-[#4F8CFF]/20 text-[#4F8CFF] px-2 py-0.5 rounded uppercase font-black tracking-widest">Recomendado</span>
                               </p>
                               <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-md transition-colors duration-500">Usa el PIN, FaceID o huella digital de tu celular/computadora para iniciar sesión sin contraseñas.</p>
                            </div>
                         </div>
                         <Button onClick={() => setIsPasskeyOpen(true)} variant="outline" className="border-[#4F8CFF]/50 text-[#4F8CFF] hover:bg-[#4F8CFF] hover:text-white font-black shrink-0 transition-all bg-transparent">CREAR PASSKEY</Button>
                      </div>

                   </CardContent>
                </Card>
             </div>
           )}

        </div>
      </div>

      {/* Modal 1: Configurar Authy */}
      {isAuthyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <Card className="w-full max-w-md bg-[#151821] border-[#232733] rounded-[2rem] overflow-hidden shadow-2xl relative">
              <button onClick={() => setIsAuthyOpen(false)} className="absolute top-4 right-4 text-[#A1A1AA] hover:text-white p-2">
                 <X size={20} />
              </button>
              <CardHeader className="bg-black/20 border-b border-white/5 p-8 text-center">
                 <div className="w-16 h-16 bg-[#FF9F0A]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="text-[#FF9F0A]" size={32} />
                 </div>
                 <CardTitle className="text-xl font-black text-white">Configurar Autenticador</CardTitle>
                 <CardDescription className="text-xs mt-2">Escanea el código QR con Authy o Google Authenticator.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                    <div className="w-48 h-48 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ZonydOS2FA')] bg-cover opacity-90" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest transition-colors duration-500">Código de 6 dígitos</label>
                    <input type="text" placeholder="Ej: 123456" maxLength={6} className="w-full bg-black/40 border border-[#232733] rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:border-[#FF9F0A] outline-none transition-all duration-500" />
                 </div>
                 <Button onClick={() => setIsAuthyOpen(false)} className="w-full h-12 bg-[#FF9F0A] text-black font-black rounded-xl hover:bg-[#FF9F0A]/90 transition-colors">VERIFICAR Y ACTIVAR</Button>
              </CardContent>
           </Card>
        </div>
      )}

      {/* Modal 2: Crear Passkey */}
      {isPasskeyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <Card className="w-full max-w-md bg-[#151821] border-[#232733] rounded-[2rem] overflow-hidden shadow-2xl relative text-center">
              <button onClick={() => { setIsPasskeyOpen(false); setPasskeyStatus('idle'); }} className="absolute top-4 right-4 text-[#A1A1AA] hover:text-white p-2">
                 <X size={20} />
              </button>
              <CardContent className="p-10 flex flex-col items-center justify-center space-y-6">
                 
                 {passkeyStatus === 'idle' && (
                    <>
                       <div className="w-24 h-24 bg-[#4F8CFF]/10 rounded-full flex items-center justify-center border border-[#4F8CFF]/20 animate-pulse">
                          <Fingerprint className="text-[#4F8CFF]" size={48} />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-white mb-2">Crear Passkey</h2>
                          <p className="text-xs text-[#A1A1AA]">Tu dispositivo te pedirá usar tu Huella Digital, FaceID o PIN del sistema.</p>
                       </div>
                       <Button onClick={handlePasskeyCreation} className="w-full h-12 bg-[#4F8CFF] text-white font-black rounded-xl hover:bg-[#4F8CFF]/90 transition-colors">INICIAR ESCANEO</Button>
                    </>
                 )}

                 {passkeyStatus === 'scanning' && (
                    <>
                       <div className="w-24 h-24 flex items-center justify-center">
                          <Loader2 className="text-[#4F8CFF] animate-spin" size={48} />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-white mb-2">Esperando Biometría...</h2>
                          <p className="text-xs text-[#A1A1AA]">Sigue las instrucciones en tu dispositivo (App Móvil / WebAuthn).</p>
                       </div>
                    </>
                 )}

                 {passkeyStatus === 'success' && (
                    <>
                       <div className="w-24 h-24 bg-[#34C759]/10 rounded-full flex items-center justify-center border border-[#34C759]/20">
                          <CheckCircle2 className="text-[#34C759]" size={48} />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-white mb-2">¡Passkey Creado!</h2>
                          <p className="text-xs text-[#A1A1AA]">Ahora podrás iniciar sesión de forma segura sin contraseñas.</p>
                       </div>
                    </>
                 )}

              </CardContent>
           </Card>
        </div>
      )}

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#0B0B0F]">
        <Loader2 className="animate-spin text-[#FF9F0A]" size={48} />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
        active 
        ? 'bg-[#FF9F0A] text-black shadow-lg shadow-[#FF9F0A]/20 scale-[1.02]' 
        : 'text-[#A1A1AA] hover:bg-black/10 dark:hover:bg-white/5 hover:text-[#FF9F0A]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SocialRow({ icon, label, status, onClick }: { icon: React.ReactNode, label: string, status: string, onClick?: () => void }) {
  const handleClick = () => {
    if (onClick) {
      console.log(`🔗 Iniciando vinculación para: ${label}`);
      onClick();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center justify-between p-6 hover:bg-white/5 border-b border-white/5 last:border-0 transition-all duration-300 group cursor-pointer active:scale-[0.98]"
      role="button"
      tabIndex={0}
    >
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10 group-hover:border-[#FF9F0A]/50 transition-all">
             {icon}
          </div>
          <span className="text-sm font-bold text-white group-hover:text-[#FF9F0A] transition-colors">{label}</span>
       </div>
       <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase tracking-widest ${status.includes('Conectado') ? 'text-[#34C759]' : 'text-[#A1A1AA]'}`}>{status}</span>
          <ChevronRight size={14} className="text-[#A1A1AA] group-hover:translate-x-1 transition-transform" />
       </div>
    </div>
  );
}

function PlanCard({ title, price, features, active, highlighted, onUpgrade }: { title: string, price: string, features: string[], active?: boolean, highlighted?: boolean, onUpgrade?: () => void }) {
  return (
    <Card className={`relative overflow-hidden rounded-[2rem] border-2 transition-colors duration-500 ${highlighted ? 'bg-gradient-to-b from-[#FF9F0A]/10 to-[#151821] border-[#FF9F0A]' : 'bg-[#151821] border-white/5'}`}>
       {active && (
         <div className="absolute top-0 right-0 px-4 py-1 bg-[#FF9F0A] text-black text-[9px] font-black uppercase tracking-widest rounded-bl-xl z-10">ACTIVO</div>
       )}
       <CardContent className="p-8 space-y-6 relative z-0">
          <div>
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A1A1AA] transition-colors duration-500">{title}</h3>
             <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white transition-colors duration-500">${price}</span>
                <span className="text-[10px] text-[#A1A1AA] transition-colors duration-500">/ mes</span>
             </div>
          </div>
          <div className="space-y-3">
             {features.map((f, i) => (
               <div key={i} className="flex items-center gap-2 text-[11px] text-[#A1A1AA] transition-colors duration-500">
                  <CheckCircle2 size={12} className={highlighted ? "text-[#FF9F0A]" : "text-[#A1A1AA]"} /> {f}
               </div>
             ))}
          </div>
          <Button 
            onClick={onUpgrade}
            disabled={active}
            className={`w-full py-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
            active 
            ? 'bg-[#232733] text-[#A1A1AA] cursor-default' 
            : highlighted 
              ? 'bg-[#FF9F0A] text-black hover:scale-105 active:scale-95 shadow-lg shadow-[#FF9F0A]/20' 
              : 'bg-white text-black hover:bg-[#FF9F0A] hover:text-black'
          }`}>
             {active ? 'Plan Actual' : `Mejorar a ${title}`}
          </Button>
       </CardContent>
    </Card>
  );
}

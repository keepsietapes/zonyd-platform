'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Music, CheckCircle2 } from 'lucide-react';
import { authFetch } from '@/lib/api';

// Valida que una URL pertenezca a Spotify for Artists
function isValidSpotifyUrl(url: string) {
  if (!url) return true; // opcional
  return /^https:\/\/(open\.spotify\.com\/artist\/|artists\.spotify\.com)/.test(url);
}

// Valida que una URL pertenezca a Apple Music / iTunes
function isValidAppleMusicUrl(url: string) {
  if (!url) return true; // opcional
  return /^https:\/\/(music\.apple\.com|itunes\.apple\.com)/.test(url);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState('Tu Nombre');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [spotifyError, setSpotifyError] = useState('');
  const [appleMusicError, setAppleMusicError] = useState('');
  const [formData, setFormData] = useState({
    stageName: '',
    spotifyUrl: '',
    appleMusicUrl: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        const { authFetch } = await import('@/lib/api');
        const res = await authFetch('/api/user/me');
        if (res) {
          const profile = res.artistProfiles?.[0];
          if (profile || res.role === 'ADMIN' || res.role === 'SUPERADMIN' || res.role === 'LABEL') {
            console.log('[Onboarding] Usuario con perfil o rol administrativo, redirigiendo a dashboard.');
            router.push('/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('Error cargando perfil en onboarding:', err);
      }

      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;
      const namePart = user.user_metadata?.full_name || user.email.split('@')[0];
      setEmailSuggestion(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      setUserEmail(user.email);
      setUserName(namePart);
    };
    init();
  }, [router]);

  const handleSpotifyChange = (val: string) => {
    setFormData(prev => ({ ...prev, spotifyUrl: val }));
    if (val && !isValidSpotifyUrl(val)) {
      setSpotifyError('Debe ser una URL de open.spotify.com/artist/... o artists.spotify.com');
    } else {
      setSpotifyError('');
    }
  };

  const handleAppleMusicChange = (val: string) => {
    setFormData(prev => ({ ...prev, appleMusicUrl: val }));
    if (val && !isValidAppleMusicUrl(val)) {
      setAppleMusicError('Debe ser una URL de music.apple.com o itunes.apple.com');
    } else {
      setAppleMusicError('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar antes de enviar
    if (formData.spotifyUrl && !isValidSpotifyUrl(formData.spotifyUrl)) {
      setSpotifyError('URL de Spotify inválida.');
      return;
    }
    if (formData.appleMusicUrl && !isValidAppleMusicUrl(formData.appleMusicUrl)) {
      setAppleMusicError('URL de Apple Music inválida.');
      return;
    }

    setLoading(true);
    try {
      // 1. Guardar perfil artístico
      await authFetch('/api/artist/onboarding', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      // 2. Disparar correo de bienvenida DESPUÉS de guardar (sin sessionStorage para evitar omisiones)
      if (userEmail) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zonyd.com';
        fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, name: userName || formData.stageName })
        }).catch(err => console.warn('Email trigger failed (non-blocking):', err));
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al guardar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F] p-4 relative overflow-hidden">
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF9F0A]/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7B61FF]/10 blur-[150px]" />

      <Card className="w-full max-w-lg bg-[#151821] border-[#232733] shadow-2xl z-10 rounded-[2rem]">
        <CardHeader className="space-y-2 p-8 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF9F0A]/10 flex items-center justify-center border border-[#FF9F0A]/20 mb-2">
            <Music className="text-[#FF9F0A]" size={28} />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-white italic uppercase">
            Configura tu Perfil Artístico
          </CardTitle>
          <CardDescription className="text-[#A1A1AA] text-sm">
            Conecta tus perfiles existentes para sincronizar tu catálogo y estadísticas automáticamente.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Nombre artístico */}
            <div className="space-y-2">
              <Label htmlFor="stageName" className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
                Nombre Artístico <span className="text-[#FF453A]">*</span>
              </Label>
              <Input
                id="stageName"
                placeholder={`Ej. ${emailSuggestion}`}
                value={formData.stageName}
                onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                required
                className="bg-black/40 border-[#232733] focus:border-[#FF9F0A] text-white h-12 rounded-xl"
              />
              <p className="text-[10px] text-[#A1A1AA]">Este es el nombre que aparecerá en todas las tiendas (DSPs).</p>
            </div>

            {/* Spotify URL */}
            <div className="space-y-2">
              <Label htmlFor="spotifyUrl" className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
                URL de Spotify for Artists <span className="text-[#A1A1AA] normal-case font-normal">(Opcional)</span>
              </Label>
              <Input
                id="spotifyUrl"
                placeholder="https://open.spotify.com/artist/..."
                value={formData.spotifyUrl}
                onChange={(e) => handleSpotifyChange(e.target.value)}
                className={`bg-black/40 border-[#232733] focus:border-[#1DB954] text-white h-12 rounded-xl ${spotifyError ? 'border-[#FF453A]' : ''}`}
              />
              {spotifyError && <p className="text-[10px] text-[#FF453A]">{spotifyError}</p>}
              {!spotifyError && formData.spotifyUrl && isValidSpotifyUrl(formData.spotifyUrl) && (
                <p className="text-[10px] text-[#1DB954] flex items-center gap-1"><CheckCircle2 size={12} /> URL válida</p>
              )}
              <p className="text-[10px] text-[#A1A1AA]">Ayuda a mapear tu nueva música a tu perfil existente.</p>
            </div>

            {/* Apple Music URL */}
            <div className="space-y-2">
              <Label htmlFor="appleMusicUrl" className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
                URL de Apple Music / iTunes <span className="text-[#A1A1AA] normal-case font-normal">(Opcional)</span>
              </Label>
              <Input
                id="appleMusicUrl"
                placeholder="https://music.apple.com/us/artist/..."
                value={formData.appleMusicUrl}
                onChange={(e) => handleAppleMusicChange(e.target.value)}
                className={`bg-black/40 border-[#232733] focus:border-[#FC3C44] text-white h-12 rounded-xl ${appleMusicError ? 'border-[#FF453A]' : ''}`}
              />
              {appleMusicError && <p className="text-[10px] text-[#FF453A]">{appleMusicError}</p>}
              {!appleMusicError && formData.appleMusicUrl && isValidAppleMusicUrl(formData.appleMusicUrl) && (
                <p className="text-[10px] text-[#34C759] flex items-center gap-1"><CheckCircle2 size={12} /> URL válida</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !!spotifyError || !!appleMusicError}
              className="w-full h-12 bg-[#FF9F0A] text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#FF9F0A]/90 shadow-lg shadow-[#FF9F0A]/20"
            >
              {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> Sincronizando...</> : 'Completar y Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



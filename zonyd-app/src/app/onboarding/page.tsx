'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { authFetch } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState('Tu Nombre');
  const [formData, setFormData] = useState({
    stageName: '',
    spotifyUrl: '',
    appleMusicUrl: ''
  });

  // 📧 Generar sugerencia basada en el email
  useEffect(() => {
    const getSuggestion = async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const namePart = user.email.split('@')[0];
        const suggestion = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        setEmailSuggestion(suggestion);
      }
    };
    getSuggestion();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authFetch('/api/artist/onboarding', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al guardar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px]" />

      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-xl border-border shadow-2xl z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">
            Configura tu Perfil Artístico
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Conecta tus perfiles existentes para sincronizar tu catálogo y estadísticas automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="stageName">Nombre Artístico <span className="text-destructive">*</span></Label>
              <Input 
                id="stageName" 
                placeholder={`Ej. ${emailSuggestion}`} 
                value={formData.stageName}
                onChange={(e) => setFormData({...formData, stageName: e.target.value})}
                required
                className="bg-background border-border focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">Este es el nombre que aparecerá en todas las tiendas (DSPs).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spotifyUrl">URL de Spotify (Opcional)</Label>
              <Input 
                id="spotifyUrl" 
                placeholder="https://open.spotify.com/artist/..." 
                value={formData.spotifyUrl}
                onChange={(e) => setFormData({...formData, spotifyUrl: e.target.value})}
                className="bg-background border-border focus:border-green-500"
              />
              <p className="text-xs text-muted-foreground">Ayuda a mapear tu nueva música a tu perfil existente.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appleMusicUrl">URL de Apple Music (Opcional)</Label>
              <Input 
                id="appleMusicUrl" 
                placeholder="https://music.apple.com/us/artist/..." 
                value={formData.appleMusicUrl}
                onChange={(e) => setFormData({...formData, appleMusicUrl: e.target.value})}
                className="bg-background border-border focus:border-red-500"
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? 'Sincronizando...' : 'Completar y Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

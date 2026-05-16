'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2, KeyRound, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usePassword, setUsePassword] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
  }, [router]);

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/onboarding` }
      });
      if (error) throw error;
    } catch (error: any) {
      alert('Error de conexión: ' + error.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (usePassword) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` }
        });
        if (error) throw error;
        alert('¡Revisa tu correo! Hemos enviado un enlace mágico.');
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0B0F]">
      {/* Fondo Premium */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF9F0A]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7B61FF]/10 rounded-full blur-[120px]" />
      
      <Card className="w-full max-w-md glass-panel border-[#232733] shadow-2xl z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <img src="/logo.png" alt="Zonyd Logo" className="w-20 h-20 object-contain hover:scale-105 transition-transform" />
            </Link>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-white italic uppercase">
            Log in to Zonyd
          </CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            La plataforma definitiva para artistas y sellos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleOAuthLogin('google')} variant="outline" className="w-full bg-[#151821] border-[#232733] hover:bg-[#232733] text-white h-12 font-bold">
                Google
              </Button>
              <Button onClick={() => handleOAuthLogin('apple')} variant="outline" className="w-full bg-[#151821] border-[#232733] hover:bg-[#232733] text-white h-12 font-bold">
                Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><Separator className="bg-[#232733]" /></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-[#151821] px-4 text-[#A1A1AA] rounded-full">O continúa con email</span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3C]" size={16} />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="ejemplo@gmail.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#0B0B0F] border-[#232733] focus:border-[#FF9F0A] text-white pl-10 h-12"
                    required
                  />
                </div>
              </div>

              {usePassword && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Contraseña</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3C]" size={16} />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#0B0B0F] border-[#232733] focus:border-[#FF9F0A] text-white pl-10 h-12"
                      required
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full bg-[#FF9F0A] text-[#0B0B0F] hover:bg-[#FF9F0A]/90 h-12 font-black uppercase tracking-widest shadow-lg shadow-[#FF9F0A]/20" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : (usePassword ? 'Entrar ahora' : 'Enviar Enlace')}
              </Button>
            </form>

            <button 
              onClick={() => setUsePassword(!usePassword)}
              className="w-full text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#FF9F0A] transition-colors"
            >
              {usePassword ? 'Usar Enlace Mágico por Email' : 'Usar mi Contraseña'}
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 justify-center text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] pt-4">
          <Separator className="bg-[#232733] w-full" />
          <span>Secured by Supabase Shield 256-bit</span>
        </CardFooter>
      </Card>
    </div>
  );
}

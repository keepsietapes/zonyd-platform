'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Music, TrendingUp, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { authFetch } from '@/lib/api';

export default function LandingPage() {
  useEffect(() => {
    // Verificar si hay una sesión "huérfana" que el backend no reconoce
    const checkSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          // Si el ping falla, es que el secreto JWT no coincide
          const res = await authFetch('/api/stats');
          // authFetch ahora devuelve null en caso de 401
          if (res === null) {
            console.warn('Sesión no sincronizada con el backend. Limpiando...');
            await supabase.auth.signOut();
            localStorage.clear();
            window.location.reload(); // Forzamos recarga para limpiar el estado
          }
        } catch (err: any) {
          if (err?.message?.includes('401') || err?.message?.includes('AUTH_FAILED')) {
            console.warn('Sesión no sincronizada con el backend. Limpiando...');
            await supabase.auth.signOut();
            localStorage.clear();
            window.location.reload();
          }
        }
      }
    };
    checkSync();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-[#FF9F0A] selection:text-black">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF9F0A]/10 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#7B61FF]/10 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#232733] bg-[#0B0B0F]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Zonyd Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold tracking-tight">Zonyd</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#support" className="hover:text-white transition-colors">Support</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#A1A1AA] hover:text-white hover:bg-[#151821]">Log in</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#FF9F0A] text-[#0B0B0F] hover:bg-[#FF9F0A]/90 font-bold px-6 rounded-full">
                Start for free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151821] border border-[#232733] mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#34C759]"></span>
            <span className="text-xs font-medium text-[#A1A1AA]">Zonyd is now live</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8">
            The infrastructure for <br />
            <span className="text-gradient">modern music.</span>
          </h1>
          
          <p className="text-xl text-[#A1A1AA] max-w-2xl leading-relaxed mb-10">
            Distribuye a Spotify, Apple Music y TikTok en segundos. Gestiona tus regalías, 
            divide pagos automáticamente y analiza tu crecimiento con inteligencia artificial.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/login">
              <Button className="h-14 px-8 bg-white text-black hover:bg-gray-200 text-lg font-bold rounded-full w-full sm:w-auto">
                Start distributing <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="h-14 px-8 bg-[#151821] border-[#232733] hover:bg-[#232733] hover:text-white text-lg font-medium rounded-full w-full sm:w-auto">
              Contact Sales
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32">
          <FeatureCard 
            icon={<Music className="text-[#FF9F0A]" size={24} />}
            title="Global Distribution"
            desc="Llega a más de 150 tiendas digitales en todo el mundo con un solo clic. Calidad sin pérdida garantizada."
          />
          <FeatureCard 
            icon={<TrendingUp className="text-[#34C759]" size={24} />}
            title="Automated Royalties"
            desc="Splits automáticos, gestión de impuestos y pagos rápidos directos a tu cuenta bancaria."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-[#4F8CFF]" size={24} />}
            title="AI-Powered Analytics"
            desc="Entiende a tu audiencia con datos en tiempo real procesados por nuestro asistente inteligente."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-panel p-8 rounded-3xl group hover:border-[#FF9F0A]/30 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-[#0B0B0F] border border-[#232733] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-[#A1A1AA] leading-relaxed">{desc}</p>
    </div>
  );
}

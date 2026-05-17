'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Music, TrendingUp, ShieldCheck, Check, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { authFetch } from '@/lib/api';

export default function LandingPage() {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [waitlistCount, setWaitlistCount] = useState(127);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) return;
    
    setWaitlistStatus('loading');
    try {
      const { error } = await supabase
        .from('Notification')
        .insert({
          userId: 'waitlist',
          title: 'WAITLIST_SIGNUP',
          message: waitlistEmail,
          read: false,
        });
      
      if (error) throw error;
      setWaitlistStatus('success');
      setWaitlistCount(prev => prev + 1);
      setWaitlistEmail('');
    } catch (err) {
      console.error('Waitlist error:', err);
      setWaitlistStatus('success');
    }
  };

  useEffect(() => {
    if (window.location.hostname === 'app.zonyd.com') {
      window.location.href = '/login';
      return;
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-[#FF9F0A] selection:text-black font-sans">
      {/* Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF9F0A]/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#7B61FF]/10 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#232733] bg-[#0B0B0F]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Zonyd Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-black tracking-tighter uppercase italic">Zonyd</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-[#A1A1AA]">
            <Link href="#features" className="hover:text-white transition-colors">Características</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Planes</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-[#A1A1AA] hover:text-white hover:bg-[#151821]">Entrar</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#FF9F0A] text-[#0B0B0F] hover:bg-[#FF9F0A]/90 font-black text-[11px] uppercase tracking-widest px-6 rounded-xl h-11">
                Empezar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151821] border border-[#232733] mb-10">
            <span className="flex h-2 w-2 rounded-full bg-[#34C759]"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Zonyd is now live</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10 uppercase italic">
            Infraestructura para <br />
            <span className="text-[#FF9F0A]">música moderna.</span>
          </h1>
          
          <p className="text-xl text-[#A1A1AA] max-w-2xl leading-relaxed mb-12 font-medium">
            Distribuye a Spotify, Apple Music y TikTok en segundos. Gestiona tus regalías, 
            divide pagos automáticamente y analiza tu crecimiento con IA.
          </p>
          
          <div className="flex flex-col gap-6">
            {waitlistStatus === 'success' ? (
              <div className="flex items-center gap-4 px-8 py-6 bg-[#34C759]/10 border border-[#34C759]/30 rounded-[2rem] max-w-lg">
                <div className="w-12 h-12 rounded-full bg-[#34C759]/20 flex items-center justify-center shrink-0">
                  <Check className="text-[#34C759]" size={24} />
                </div>
                <div>
                  <p className="text-lg font-black text-white uppercase italic tracking-tighter">¡Estás dentro! 🎉</p>
                  <p className="text-xs text-[#A1A1AA] font-bold">Te avisaremos cuando tu acceso esté listo.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-4 max-w-xl">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="flex-1 h-16 px-8 bg-[#151821] border border-[#232733] rounded-2xl text-white placeholder:text-[#3A3A3C] focus:border-[#FF9F0A] outline-none text-base font-bold transition-all"
                />
                <Button 
                  type="submit" 
                  disabled={waitlistStatus === 'loading'}
                  className="h-16 px-10 bg-white text-black hover:bg-gray-200 text-[13px] font-black uppercase tracking-widest rounded-2xl shrink-0 disabled:opacity-50"
                >
                  {waitlistStatus === 'loading' ? 'Enviando...' : 'Unirme al Waitlist'}
                </Button>
              </form>
            )}
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex -space-x-3">
                {['🎵', '🎤', '🎹', '🎸'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-[#151821] border-4 border-[#0B0B0F] flex items-center justify-center text-sm shadow-xl">{emoji}</div>
                ))}
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#A1A1AA]">
                <span className="text-white">{waitlistCount}+ artistas</span> en lista de espera
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-[#232733]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Music className="text-[#FF9F0A]" size={28} />}
            title="Distribución Global"
            desc="Llega a más de 150 tiendas digitales con un solo clic. Calidad sin pérdida (WAV/FLAC) garantizada."
          />
          <FeatureCard 
            icon={<TrendingUp className="text-[#34C759]" size={28} />}
            title="Regalías Automatizadas"
            desc="Splits automáticos entre colaboradores. Gestionamos los pagos para que tú solo te encargues de crear."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-[#4F8CFF]" size={28} />}
            title="Zonyd AI Dashboard"
            desc="Entiende tus métricas reales y recibe estrategias de marketing personalizadas por nuestra IA."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-[#232733]">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6">Planes para <span className="text-[#FF9F0A]">cada etapa.</span></h2>
          <p className="text-[#A1A1AA] max-w-xl mx-auto font-bold uppercase text-[10px] tracking-[0.2em]">Sin cargos ocultos. Transparencia total.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PriceCard 
            title="Free" price="0" 
            features={[
              '85% Royalties Retenidos (15% Comisión)', 
              '1 Perfil de Artista Activo', 
              'Distribución a Tiendas Básicas (Spotify, Apple)', 
              'Zonyd AI (10 consultas semanales válidas)',
              '🛡️ Filtro Anti-Saludos (no consume cuota)',
              'Soporte vía email (soporte@zonyd.com)',
              '🔒 The Lab AI (Acceso Bloqueado)'
            ]} 
            cta="Empezar Ahora" 
          />
          <PriceCard 
            title="Indie" price="4.99" 
            features={[
              '85% Royalties Retenidos (15% Comisión)', 
              '1 Perfil de Artista Activo', 
              'Distribución Rápida (14 días)', 
              'Splits de Regalías Gratuitos',
              'Zonyd AI Co-Manager Ilimitado', 
              '🧪 The Lab AI Estándar (15 usos/mes)',
              'Soporte por ticket en la plataforma'
            ]} 
            cta="Suscribirse" 
          />
          <PriceCard 
            title="Pro" price="9.99" highlighted 
            features={[
              'Todo lo incluido en INDIE más:',
              '⭐ 100% de tus Royalties (0% Comisión)', 
              '⭐ Hasta 5 Artistas en Simultáneo', 
              'Distribución Exprés (48-72 horas)', 
              'Tiendas de nicho (Beatport y Traxsource)',
              'YouTube Content ID de Cortesía', 
              'SmartLinks Pro (+Meta y TikTok Pixels)', 
              '🧪 The Lab AI Completo (ILIMITADO)', 
              'Soporte VIP por Chat (< 2h en Vivo)'
            ]} 
            cta="Suscribirse" 
          />
          <PriceCard 
            title="Label" price="29.99" 
            features={[
              'Todo lo incluido en PRO más:',
              '👑 Sellos y Artistas ILIMITADOS', 
              'Carga Inmediata A&R (< 24 horas)', 
              'Gestión de Contratos Digitales y Splits', 
              'SmartLinks White-Label (Dominio Propio)', 
              '🧪 Cola de Audio VIP (Procesamiento Veloz)', 
              'Acceso completo a la API Zonyd',
              'Account Manager Dedicado (WhatsApp/Zoom)'
            ]} 
            cta="Suscribirse" 
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-32 border-t border-[#232733]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Preguntas Frecuentes</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: "¿Cuánto tarda en publicarse mi música?", a: "Spotify y Apple Music suelen procesar los lanzamientos en 24-48 horas. Recomendamos subir tu música 14 días antes para asegurar la inclusión en playlists editoriales." },
            { q: "¿Cómo recibo mis pagos?", a: "Pagamos mensualmente vía PayPal o transferencia bancaria directa (CLABE en México). El umbral mínimo de retiro es de $10 USD." },
            { q: "¿Soy dueño de mi música?", a: "Sí, el 100% de la propiedad intelectual de tus masters y letras te pertenece. Zonyd solo actúa como tu distribuidor y administrador." },
            { q: "¿Qué hace Zonyd AI?", a: "Nuestra IA analiza tus streams, demografía y tendencias de mercado para darte consejos específicos de cuándo lanzar, qué presupuesto invertir en marketing y cómo optimizar tus perfiles." }
          ].map((item, i) => (
            <div key={i} className="bg-[#151821] border border-[#232733] rounded-2xl overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="font-bold text-sm">{item.q}</span>
                <ChevronDown className={`text-[#FF9F0A] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} size={20} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-sm text-[#A1A1AA] leading-relaxed animate-in slide-in-from-top-2 duration-300">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#232733] bg-[#0B0B0F] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Zonyd" className="w-8 h-8" />
                <span className="text-lg font-black uppercase italic tracking-tighter">Zonyd</span>
              </div>
              <p className="text-[#A1A1AA] text-sm max-w-xs leading-relaxed mb-8">
                Empoderando a la próxima generación de artistas independientes con tecnología de punta y transparencia total.
              </p>
              <div className="flex items-center gap-4 text-[#3A3A3C]">
                <Facebook className="hover:text-white cursor-pointer transition-colors" size={20} />
                <Twitter className="hover:text-white cursor-pointer transition-colors" size={20} />
                <Instagram className="hover:text-white cursor-pointer transition-colors" size={20} />
                <Youtube className="hover:text-white cursor-pointer transition-colors" size={20} />
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-6">Plataforma</h4>
              <ul className="space-y-4 text-xs font-bold text-[#A1A1AA]">
                <li><Link href="/login" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-white">Distribución</Link></li>
                <li><Link href="/login" className="hover:text-white">Marketplace</Link></li>
                <li><Link href="/login" className="hover:text-white">SmartLinks</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-xs font-bold text-[#A1A1AA]">
                <li><Link href="/legal/terms" className="hover:text-white">Términos de Servicio</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="/legal/distribution-agreement" className="hover:text-white">Acuerdo de Distribución</Link></li>
                <li><Link href="/legal/copyright" className="hover:text-white">Copyright</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-[#232733] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-[#3A3A3C]">© 2026 Zonyd Platform. Todos los derechos reservados.</p>
            <p className="text-[10px] font-bold text-[#3A3A3C]">Hecho con ❤️ para la comunidad musical global.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#151821] border border-[#232733] p-8 rounded-[2.5rem] group hover:border-[#FF9F0A]/40 transition-all hover:-translate-y-2 duration-500 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">{title}</h3>
      <p className="text-sm text-[#A1A1AA] leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function PriceCard({ title, price, features, cta, highlighted = false }: { title: string, price: string, features: string[], cta: string, highlighted?: boolean }) {
  const isLabel = title.toLowerCase() === 'label';
  const isFree = title.toLowerCase() === 'free';
  const isIndie = title.toLowerCase() === 'indie';
  
  // Clean, high-contrast, modern styles with distinctive solid borders and backgrounds
  const cardStyles = highlighted 
    ? 'bg-[#1A1E29] text-white border-2 border-[#FF9F0A] scale-105 z-10 shadow-[0_15px_40px_rgba(255,159,10,0.15)]' 
    : isLabel 
      ? 'bg-[#151821] text-white border border-[#BF5AF2]/50 hover:border-[#BF5AF2] shadow-[0_10px_30px_rgba(191,90,242,0.05)] transition-all duration-300 scale-100 hover:scale-[1.02]' 
      : isIndie
        ? 'bg-[#151821] text-white border border-[#4F8CFF]/50 hover:border-[#4F8CFF] transition-all duration-300 scale-100 hover:scale-[1.02]'
        : 'bg-[#11131A] text-white border border-[#232733] hover:border-white/10 transition-all duration-300 scale-100 hover:scale-[1.02]';

  const checkColor = highlighted 
    ? 'text-[#FF9F0A]' 
    : isLabel 
      ? 'text-[#BF5AF2]' 
      : isIndie
        ? 'text-[#4F8CFF]'
        : 'text-[#A1A1AA]';

  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col ${cardStyles}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF9F0A] text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Más Popular</div>
      )}
      {isLabel && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#BF5AF2] to-[#7B61FF] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Elite Sello</div>
      )}
      <div className="mb-8">
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black tracking-tighter italic">${price}</span>
          <span className="text-[10px] font-bold opacity-60 uppercase">/ mes</span>
        </div>
      </div>
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => {
          const isHeader = f.includes('Todo lo incluido');
          const isStar = f.includes('⭐') || f.includes('👑');
          return (
            <li key={i} className={`flex items-start gap-3 text-xs ${isHeader ? 'font-black text-white mt-4 border-b border-white/5 pb-2 uppercase tracking-wider text-[10px]' : isStar ? 'font-bold text-white' : 'font-medium opacity-80'}`}>
              {!isHeader && <Check size={14} className={`${checkColor} mt-0.5 shrink-0`} />}
              <span>{f}</span>
            </li>
          );
        })}
      </ul>
      <Link href="/login">
        <Button className={`w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${highlighted ? 'bg-[#FF9F0A] text-black hover:bg-[#FF9F0A]/90' : isLabel ? 'bg-gradient-to-r from-[#BF5AF2] to-[#7B61FF] text-white hover:opacity-90' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
          {cta}
        </Button>
      </Link>
    </div>
  );
}

const Facebook = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const Twitter = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const Instagram = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const Youtube = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;

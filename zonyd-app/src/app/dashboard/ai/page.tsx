'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Bot,
  ArrowRight,
  Lock,
  Camera,
  Music2,
  Globe,
  Info,
  CheckCircle2,
  XCircle,
  Loader2,
  Link2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

export default function ZonydAIPage() {
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO' | 'LABEL'>('FREE');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Conexiones reales del usuario — false por defecto hasta que se verifique
  const [connections, setConnections] = useState({
    spotify: false,
    instagram: false,
    tiktok: false,
  });

  // Métricas de influencia — vacías por defecto
  const [metrics, setMetrics] = useState({
    viralidad: 0,
    metadatos: 0,
    discovery: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch('/api/artist/profile');
      if (data) {
        // Plan del usuario
        setUserPlan(data.plan || 'FREE');

        // Conexiones reales — solo true si el token OAuth existe en el backend
        setConnections({
          spotify: !!data.spotifyConnected,
          instagram: !!data.instagramConnected,
          tiktok: !!data.tiktokConnected,
        });

        // Métricas calculadas por el backend (0 si no hay datos)
        setMetrics({
          viralidad: data.metrics?.viralidad || 0,
          metadatos: data.metrics?.metadatos || 0,
          discovery: data.metrics?.discovery || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching AI profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!query.trim() || isTyping) return;
    const userMsg = query.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setIsTyping(true);
    try {
      const data = await authFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg }),
      });
      setMessages(prev => [...prev, { role: 'ai', text: data.response || 'Sin respuesta del servidor.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Lo siento, la conexión con el motor de IA se interrumpió. Intenta de nuevo.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Paywall para usuarios FREE
  if (!isLoading && userPlan === 'FREE') {
    return (
      <div className="p-8 h-full flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[#0B0B0F]/40 backdrop-blur-md z-10" />
        <div className="w-full max-w-5xl opacity-20 pointer-events-none filter blur-sm">
          <div className="h-64 bg-[#151821] rounded-3xl mb-8" />
          <div className="grid grid-cols-2 gap-8">
            <div className="h-96 bg-[#151821] rounded-3xl" />
            <div className="h-96 bg-[#151821] rounded-3xl" />
          </div>
        </div>
        <Card className="relative z-20 w-full max-w-lg bg-[#151821] border-[#7B61FF]/50 shadow-[0_0_100px_rgba(123,97,255,0.2)] rounded-[2.5rem] overflow-hidden p-8 text-center border-2">
          <div className="w-20 h-20 bg-[#7B61FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#7B61FF]/20">
            <Lock className="text-[#7B61FF]" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase italic">Contenido Exclusivo Pro</h2>
          <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8 px-4">
            El AI Command Center utiliza modelos de lenguaje y análisis de datos en tiempo real para optimizar tu carrera. Disponible para miembros <strong className="text-white">Pro</strong> y <strong className="text-white">Label</strong>.
          </p>
          <div className="space-y-4 mb-8 text-left bg-black/40 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 text-xs text-white/80"><Sparkles size={14} className="text-[#7B61FF]" /> Estrategias de Marketing Personalizadas</div>
            <div className="flex items-center gap-3 text-xs text-white/80"><ShieldCheck size={14} className="text-[#34C759]" /> Auditoría de Copyright Preventiva</div>
            <div className="flex items-center gap-3 text-xs text-white/80"><TrendingUp size={14} className="text-[#4F8CFF]" /> Predicciones de Streams y Revenue</div>
          </div>
          <Button className="w-full bg-[#7B61FF] hover:bg-[#7B61FF]/90 text-white font-black h-14 rounded-2xl text-lg shadow-xl shadow-[#7B61FF]/20 group">
            DESBLOQUEAR AHORA <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </Button>
          <p className="mt-4 text-[10px] text-[#A1A1AA] uppercase font-black tracking-widest">Desde $9.99 USD / mes</p>
        </Card>
      </div>
    );
  }

  const connectedCount = Object.values(connections).filter(Boolean).length;
  const hasMetrics = metrics.viralidad > 0;

  return (
    <div className="p-8 h-full space-y-8 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">

          {/* Header con estado real de conexiones */}
          <div className="relative p-10 rounded-[2.5rem] overflow-hidden border border-[#7B61FF]/30 bg-[#0B0B0F] shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B61FF]/10 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2 text-[#7B61FF] font-black text-xs uppercase tracking-[0.4em]">
                  <Zap size={14} className="fill-[#7B61FF]" /> Sistema Operativo IA v2.0
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white leading-tight italic">
                  ZONYD COMMAND CENTER
                </h1>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  {connectedCount === 0 
                    ? 'Vincula tus redes en Configuración para que Zonyd AI acceda a métricas profundas y optimice tu próximo lanzamiento.'
                    : `${connectedCount} red${connectedCount > 1 ? 'es' : ''} conectada${connectedCount > 1 ? 's' : ''}. Zonyd AI está analizando tu impacto digital.`
                  }
                </p>
              </div>

              {/* Conexiones — estado real del backend */}
              <div className="flex flex-col gap-3">
                <ConnectionBadge
                  icon={<Music2 size={16} />}
                  label="Spotify for Artists"
                  connected={connections.spotify}
                  color="#1DB954"
                  href="/dashboard/settings"
                />
                <ConnectionBadge
                  icon={<Camera size={16} />}
                  label="Instagram Music"
                  connected={connections.instagram}
                  color="#E4405F"
                  href="/dashboard/settings"
                />
                <ConnectionBadge
                  icon={<Globe size={16} />}
                  label="TikTok Music"
                  connected={connections.tiktok}
                  color="#00F2FE"
                  href="/dashboard/settings"
                />
              </div>
            </div>
          </div>

          {/* AI Chat */}
          <Card className="bg-[#151821] border-[#232733] rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-2xl">
            <div className="bg-black/20 p-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#7B61FF] flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(123,97,255,0.5)]">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <span className="text-xs font-black text-white uppercase tracking-widest italic">Zonyd AI Co-Manager</span>
                {connectedCount === 0 && (
                  <p className="text-[9px] text-[#FF9F0A] font-bold mt-0.5">Conecta una red social para análisis contextual</p>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#7B61FF]/10 flex items-center justify-center border border-[#7B61FF]/20">
                    <Sparkles size={28} className="text-[#7B61FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tight">Co-Manager listo</p>
                    <p className="text-[10px] text-[#A1A1AA] mt-1">
                      {connectedCount > 0 
                        ? 'Pregúntame sobre tu estrategia, hashtags o cuándo lanzar tu próximo single.'
                        : 'Conecta Spotify o Instagram para recibir análisis basados en tu actividad real.'
                      }
                    </p>
                  </div>
                  {connectedCount === 0 && (
                    <a href="/dashboard/settings" className="text-[10px] font-black text-[#7B61FF] uppercase tracking-widest flex items-center gap-2 hover:underline">
                      <Link2 size={12} /> Ir a Configuración para vincular redes
                    </a>
                  )}
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                      msg.role === 'ai' 
                        ? 'bg-[#1c1f2a] border border-white/5 text-[#A1A1AA] rounded-tl-none' 
                        : 'bg-[#7B61FF] text-white rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex gap-1 p-2">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-[#7B61FF] rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
              <input
                type="text"
                placeholder="Escribe a tu Co-Manager..."
                className="flex-1 bg-[#0B0B0F] border border-[#232733] rounded-full px-6 py-4 text-xs outline-none focus:border-[#7B61FF] transition-all text-white"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} disabled={isTyping || !query.trim()} className="w-12 h-12 bg-[#7B61FF] rounded-full shrink-0 disabled:opacity-40">
                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#151821] border-[#232733] rounded-3xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] mb-4">Métricas de Influencia IA</h3>
            {!hasMetrics ? (
              <div className="py-8 text-center">
                <TrendingUp size={32} className="text-[#232733] mx-auto mb-3" />
                <p className="text-[10px] font-black text-[#3A3A3C] uppercase tracking-widest">Sin datos aún</p>
                <p className="text-[9px] text-[#3A3A3C] mt-1">
                  {connectedCount === 0 
                    ? 'Conecta una red social para ver métricas'
                    : 'Las métricas se calcularán con tus primeros datos'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <StatRow label="Viralidad Estimada" value={`${metrics.viralidad}%`} color="#7B61FF" />
                <StatRow label="Optimización Metadatos" value={`${metrics.metadatos}%`} color="#34C759" />
                <StatRow label="Discovery Rate" value={`${metrics.discovery}%`} color="#FF9F0A" />
              </div>
            )}
          </Card>

          {/* Nota de motor */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#7B61FF]/20 to-transparent border border-[#7B61FF]/30">
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase mb-3">
              <Info size={14} className="text-[#7B61FF]" /> Nota de Motor
            </div>
            <p className="text-[10px] text-[#A1A1AA] leading-relaxed italic">
              Este módulo es impulsado por Gemini 2.0 Pro de Google DeepMind. Zonyd procesa los datos mediante un motor de RAG Dinámico para asegurar que las tendencias tengan menos de 1 hora de retraso.
            </p>
          </div>

          {/* Quick link a settings */}
          <a href="/dashboard/settings" className="block p-5 rounded-2xl bg-[#151821] border border-[#232733] hover:border-[#7B61FF]/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center border border-[#7B61FF]/20">
                <Link2 className="text-[#7B61FF]" size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-white group-hover:text-[#7B61FF] transition-colors">Conectar Redes Sociales</p>
                <p className="text-[9px] text-[#A1A1AA] mt-0.5">Spotify · Instagram · TikTok</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

// Badge de conexión — muestra estado real, no hardcodeado
function ConnectionBadge({ icon, label, connected, color, href }: { icon: React.ReactNode, label: string, connected: boolean, color: string, href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 rounded-xl group cursor-pointer hover:border-white/20 transition-all no-underline">
      <div style={{ color: connected ? color : '#3A3A3C' }} className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: connected ? 'rgba(255,255,255,0.8)' : '#3A3A3C' }}>
        {label}
      </span>
      {connected 
        ? <CheckCircle2 size={12} className="text-[#34C759] ml-auto" />
        : <XCircle size={12} className="text-[#3A3A3C] ml-auto" />
      }
    </a>
  );
}

function StatRow({ label, value, color }: { label: string, value: string, color: string }) {
  const numVal = parseInt(value);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-[#A1A1AA] uppercase">{label}</span>
        <span className="text-sm font-black text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: value, backgroundColor: color }} />
      </div>
    </div>
  );
}

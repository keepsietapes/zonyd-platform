'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, ChevronRight, ChevronLeft, X, Music, BarChart3, 
  Zap, ShieldCheck, Wallet, Bell, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TUTORIAL_STEPS = [
  {
    title: "Bienvenido a Zonyd OS 🚀",
    description: "¡El centro de mando de distribución y A&R impulsado por Inteligencia Artificial más avanzado del mercado! Vamos a guiarte por tus herramientas de élite para acelerar tu carrera musical.",
    icon: <Sparkles className="text-[#FF9F0A]" size={28} />,
    targetId: "tour-dashboard-header"
  },
  {
    title: "Lanzamiento Expreso 💿",
    description: "Sube tus pistas, configura el arte de portada y distribuye tu música a más de 150 tiendas digitales como Spotify, Apple Music y TikTok. ¡Nuestra IA validará los archivos antes de enviarlos!",
    icon: <Music className="text-[#34C759]" size={28} />,
    targetId: "tour-btn-new-release"
  },
  {
    title: "Arsenal Financiero & Streams 📊",
    description: "Aquí verás en tiempo real tus ingresos acumulados, regalías listas para cobrar, streams totales y SmartLinks activos. Transparencia absoluta y retiros rápidos en Money Mondays.",
    icon: <Wallet className="text-[#BF5AF2]" size={28} />,
    targetId: "tour-kpi-grid"
  },
  {
    title: "Gestión de Catálogo 🎵",
    description: "Visualiza tus álbumes y canciones lanzados, copia enlaces rápidos, descarga metadatos optimizados o edita tu portafolio musical en segundos.",
    icon: <Music className="text-[#4F8CFF]" size={28} />,
    targetId: "tour-recent-catalog"
  },
  {
    title: "Rastreo de Distribución ⚡",
    description: "Sigue en tiempo real la salud de tus lanzamientos. Validaciones de audio, filtros de copyright automáticos, empaquetado DDEX y carga final a tiendas sin misterios.",
    icon: <Zap className="text-[#FF9F0A]" size={28} />,
    targetId: "tour-live-pipeline"
  },
  {
    title: "IA Recomendadora Integrada 🧠",
    description: "Zonyd analiza las tendencias de reproducción globales y de tu catálogo para proponerte estrategias de pauta de anuncios y contenido viral en TikTok personalizadas.",
    icon: <Sparkles className="text-[#FF3366]" size={28} />,
    targetId: "tour-ai-banner"
  },
  {
    title: "Tu Co-Manager 24/7 💬",
    description: "Haz preguntas sobre contratos, estrategias de marketing, pitch a curadores de playlists o distribución. ¡Siempre activo para guiarte en el éxito!",
    icon: <Zap className="text-[#00FFCC]" size={28} />,
    targetId: "tour-ai-assistant"
  },
  {
    title: "The Lab & Herramientas AI 🧪",
    description: "Accede a nuestros generadores de guiones virales de TikTok, creadores de notas de prensa, optimizadores de letras, estimadores de ROAS y mucho más.",
    icon: <ShieldCheck className="text-[#FF9F0A]" size={28} />,
    targetId: "tour-nav-lab"
  },
  {
    title: "Notificaciones y Alertas 🔔",
    description: "Entérate al instante si tu lanzamiento fue aprobado, cuando recibas regalías o si hay nuevas tendencias musicales en el radar de Zonyd.",
    icon: <Bell className="text-[#4F8CFF]" size={28} />,
    targetId: "tour-notifications"
  }
];

export function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowDirection, setArrowDirection] = useState<'up' | 'down' | 'center'>('up');

  // Relaunch event listener
  useEffect(() => {
    const handleStartTour = () => {
      setIsVisible(true);
      setCurrentStep(0);
    };
    window.addEventListener('start-onboarding-tutorial', handleStartTour);
    
    // Auto start on first entry
    const hasSeenTutorial = localStorage.getItem('zonyd-onboarding-seen');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setCurrentStep(0);
      }, 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('start-onboarding-tutorial', handleStartTour);
    };
  }, []);

  // Update position when currentStep changes or window resizes
  useEffect(() => {
    if (!isVisible || currentStep === -1) return;

    const updatePosition = () => {
      const step = TUTORIAL_STEPS[currentStep];
      if (!step) return;

      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        
        // Spotlight placement
        setHighlightStyle({
          position: 'fixed',
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          borderRadius: '16px',
          border: '2px solid #FF9F0A',
          boxShadow: '0 0 0 9999px rgba(6, 7, 9, 0.8), 0 0 30px rgba(255, 159, 10, 0.6)',
          zIndex: 90,
          pointerEvents: 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        });

        // Smooth scroll target into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Tooltip placement logic
        if (window.innerWidth >= 768) {
          const tooltipWidth = 440;
          const tooltipHeight = 240;
          let top = rect.bottom + 20;
          let left = rect.left + rect.width / 2 - tooltipWidth / 2;
          let arrow = 'up';

          // Bound checks
          if (left < 20) left = 20;
          if (left + tooltipWidth > window.innerWidth - 20) {
            left = window.innerWidth - tooltipWidth - 20;
          }

          // If too low, position above instead
          if (top + tooltipHeight > window.innerHeight - 20) {
            top = rect.top - tooltipHeight - 20;
            arrow = 'down';
          }

          setTooltipStyle({
            position: 'fixed',
            top,
            left,
            width: tooltipWidth,
            zIndex: 100,
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          });
          setArrowDirection(arrow as any);
        } else {
          // Responsive mobile view (centered at the bottom)
          setTooltipStyle({
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '450px',
            zIndex: 100
          });
          setArrowDirection('center');
        }
      } else {
        // Fallback for non-existent target (e.g. not on the dashboard)
        setHighlightStyle({
          position: 'fixed',
          top: '0',
          left: '0',
          width: '0',
          height: '0',
          boxShadow: '0 0 0 9999px rgba(6, 7, 9, 0.85)',
          zIndex: 90
        });
        setTooltipStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '480px',
          zIndex: 100
        });
        setArrowDirection('center');
      }
    };

    // Delay slightly to allow any DOM transitions or route changes
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isVisible]);

  const handleFinish = () => {
    setIsVisible(false);
    localStorage.setItem('zonyd-onboarding-seen', 'true');
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isVisible || currentStep === -1) return null;

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <>
      {/* 1. Dynamic Spotlight Highlight Box */}
      <div style={highlightStyle} />

      {/* 2. Floating Cyberpunk Tooltip popover */}
      <Card 
        style={tooltipStyle} 
        className="bg-[#151821] border border-[#232733] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Pointer Arrow if not mobile / centered */}
        {arrowDirection === 'up' && (
          <div className="hidden md:block absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#151821] border-t border-l border-[#232733] rotate-45" />
        )}
        {arrowDirection === 'down' && (
          <div className="hidden md:block absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#151821] border-b border-r border-[#232733] rotate-45" />
        )}

        {/* Exit Button */}
        <button 
          onClick={handleFinish} 
          className="absolute top-5 right-5 text-[#A1A1AA] hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
          title="Saltar Tutorial"
        >
          <X size={18} />
        </button>

        <div className="flex gap-5 items-start">
          {/* Animated Icon Container */}
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
            {step.icon}
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            {/* Step Counter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-[#FF9F0A] uppercase tracking-[0.25em]">
                Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
              </span>
              <div className="w-1 h-1 rounded-full bg-[#3A3D45]" />
              <span className="text-[8px] font-mono text-[#A1A1AA] uppercase">
                Tour Guiado
              </span>
            </div>
            
            <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">
              {step.title}
            </h3>
            <p className="text-[#A1A1AA] text-xs leading-relaxed font-medium">
              {step.description}
            </p>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
          {/* Indicators */}
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-5 bg-[#FF9F0A]' : 'w-1 bg-[#232733]'
                }`} 
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button 
                onClick={prevStep}
                variant="ghost"
                size="sm"
                className="text-[#A1A1AA] hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-wider h-9 px-3 rounded-lg"
              >
                <ChevronLeft size={14} className="mr-1" /> Anterior
              </Button>
            )}

            <Button 
              onClick={nextStep}
              className="bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-black font-black uppercase tracking-wider text-[10px] h-9 px-4 rounded-lg shadow-md shadow-[#FF9F0A]/20 transition-all flex items-center gap-1"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Terminar' : 'Siguiente'}
              {currentStep < TUTORIAL_STEPS.length - 1 && <ChevronRight size={14} />}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

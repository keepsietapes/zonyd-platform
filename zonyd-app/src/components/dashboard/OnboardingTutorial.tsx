'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, X, Music, BarChart3, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TUTORIAL_STEPS = [
  {
    title: "Bienvenido a Zonyd OS",
    description: "Tu centro de comando para la dominación musical. Vamos a darte un tour rápido por las herramientas de élite que tienes a tu disposición.",
    icon: <Sparkles className="text-[#FF9F0A]" size={32} />,
    target: "header"
  },
  {
    title: "Analíticas en Tiempo Real",
    description: "Aquí verás el impacto global de tu música. Streams, ingresos y SmartLinks sincronizados directamente desde las tiendas.",
    icon: <BarChart3 className="text-[#4F8CFF]" size={32} />,
    target: "stats"
  },
  {
    title: "Despliegue de Lanzamientos",
    description: "Usa nuestro Release Manager para subir tu música a más de 150 tiendas. Zonyd AI validará tu audio y portada automáticamente.",
    icon: <Music className="text-[#34C759]" size={32} />,
    target: "releases"
  },
  {
    title: "The Lab & IA",
    description: "Potencia tu carrera con IA. Genera estrategias de marketing, analiza tendencias en TikTok y optimiza tus letras con un click.",
    icon: <Zap className="text-[#BF5AF2]" size={32} />,
    target: "ai"
  }
];

export function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('zonyd-onboarding-seen');
    if (!hasSeenTutorial) {
      setTimeout(() => {
        setIsVisible(true);
        setCurrentStep(0);
      }, 2000);
    }
  }, []);

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

  if (!isVisible || currentStep === -1) return null;

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-lg bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(255,159,10,0.1)] relative">
        <button onClick={handleFinish} className="absolute top-6 right-6 text-[#A1A1AA] hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-10 space-y-8">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5 animate-bounce-slow">
            {step.icon}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-[#FF9F0A] uppercase tracking-[0.3em]">Tutorial {currentStep + 1}/{TUTORIAL_STEPS.length}</span>
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{step.title}</h2>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">{step.description}</p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-1.5">
              {TUTORIAL_STEPS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-[#FF9F0A]' : 'w-2 bg-[#232733]'}`} />
              ))}
            </div>
            <Button 
              onClick={nextStep}
              className="bg-[#FF9F0A] text-black font-black px-8 rounded-xl h-12 shadow-lg shadow-[#FF9F0A]/20 hover:scale-105 transition-all"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? '¡EMPEZAR AHORA!' : 'SIGUIENTE'}
              <ChevronRight className="ml-2" size={18} />
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FF9F0A]/10 blur-[60px] rounded-full" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#7B61FF]/10 blur-[60px] rounded-full" />
      </Card>
    </div>
  );
}

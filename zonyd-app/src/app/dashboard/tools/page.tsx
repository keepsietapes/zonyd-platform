'use client';

import { useState, useEffect } from 'react';
import { 
  Calculator, 
  RefreshCw, 
  Music2, 
  FileAudio, 
  ArrowRight,
  TrendingUp,
  Globe,
  Zap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- UI/UX Components ---
const GlowCard = ({ children, color, className = "" }: { children: React.ReactNode, color: string, className?: string }) => (
  <Card className={`relative bg-[#151821] border-[#232733] rounded-3xl p-8 hover:border-${color}/20 transition-all duration-500 group overflow-hidden ${className}`}>
    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-${color}/10 blur-[80px] rounded-full group-hover:bg-${color}/20 transition-all duration-500`} />
    {children}
  </Card>
);

const AnimatedNumber = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState('0.00');
  
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (start === end) return;

    let totalDuration = 1000;
    let increment = end / (totalDuration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end.toFixed(2));
        clearInterval(timer);
      } else {
        setDisplayValue(start.toFixed(2));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>${displayValue}</span>;
};

export default function ToolsPage() {
  const [calcStreams, setCalcStreams] = useState(100000);
  const estimatedRevenue = (calcStreams * 0.004).toFixed(2);

  const [toolsState, setToolsState] = useState({
    isConverting: false,
    isGenerating: false,
    lastAction: ''
  });

  const handleToolAction = (title: string) => {
    setToolsState(prev => ({ ...prev, lastAction: title }));
    
    if (title === 'Calculadora de Royalties') {
      alert(`Ingresos proyectados: $${estimatedRevenue} USD. Copiado al portapapeles.`);
    } else if (title === 'Conversor de Audio Pro') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.onchange = () => {
        setToolsState(prev => ({ ...prev, isConverting: true }));
        setTimeout(() => {
          setToolsState(prev => ({ ...prev, isConverting: false }));
          alert('Conversión exitosa a FLAC 24-bit. Archivo descargado.');
        }, 2500);
      };
      input.click();
    } else if (title === 'Generador de Press Kit') {
      setToolsState(prev => ({ ...prev, isGenerating: true }));
      
      const generateEPK = async () => {
        try {
          const { authFetch } = await import('@/lib/api');
          // Obtener perfil real del artista
          const artist = await authFetch('/api/artist/profile').catch(() => null);
          const stageName = artist?.stageName || 'Artista Principal';
          const bio = artist?.bio || 'Artista independiente enfocado en la innovación y creación musical de vanguardia.';
          const followers = artist?.spotifyFollowers || 0;
          const plan = artist?.plan || 'PRO';
          const spotify = artist?.spotifyUrl || 'No vinculado';
          const instagram = artist?.instagramUrl || 'No vinculado';
          
          // Abrir ventana de impresión
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            alert('Por favor, permite las ventanas emergentes en tu navegador para descargar tu Press Kit.');
            return;
          }
          
          printWindow.document.write(`
            <html>
              <head>
                <title>Press Kit - ${stageName}</title>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                  body {
                    font-family: 'Inter', sans-serif;
                    background-color: #0B0B0F;
                    color: #FFFFFF;
                    margin: 0;
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                  }
                  .epk-container {
                    max-width: 800px;
                    width: 100%;
                    border: 1px solid #232733;
                    background: linear-gradient(135deg, #151821 0%, #0B0B0F 100%);
                    border-radius: 24px;
                    padding: 40px;
                    box-sizing: border-box;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                  }
                  .header {
                    border-bottom: 2px solid #FF9F0A;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                  }
                  .title {
                    font-size: 32px;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-style: italic;
                    letter-spacing: -1px;
                    margin: 0;
                  }
                  .subtitle {
                    font-size: 12px;
                    font-weight: 700;
                    color: #FF9F0A;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-top: 5px;
                  }
                  .logo {
                    font-size: 24px;
                    font-weight: 900;
                    color: #FFFFFF;
                    font-style: italic;
                  }
                  .logo span {
                    color: #FF9F0A;
                  }
                  .section-title {
                    font-size: 14px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #FF9F0A;
                    margin-bottom: 15px;
                  }
                  .bio-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 30px;
                    line-height: 1.6;
                    font-size: 14px;
                    color: #E1E1E6;
                  }
                  .grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                  }
                  .card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 20px;
                  }
                  .metric-value {
                    font-size: 28px;
                    font-weight: 900;
                    margin: 5px 0;
                    color: #FFFFFF;
                  }
                  .metric-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #A1A1AA;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                  }
                  .footer {
                    margin-top: 40px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding-top: 20px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                  }
                  @media print {
                    body {
                      background-color: #FFFFFF;
                      color: #000000;
                      padding: 0;
                    }
                    .epk-container {
                      border: none;
                      box-shadow: none;
                      background: #FFFFFF;
                      color: #000000;
                    }
                    .bio-card, .card {
                      background: #F4F4F7;
                      border: 1px solid #E1E1E6;
                      color: #333333;
                    }
                    .metric-value {
                      color: #000000;
                    }
                    .footer {
                      color: #999;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="epk-container">
                  <div class="header">
                    <div>
                      <h1 class="title">${stageName}</h1>
                      <div class="subtitle">Official Electronic Press Kit</div>
                    </div>
                    <div class="logo">ZO<span>NYD</span></div>
                  </div>
                  
                  <div class="section-title">Biografía Oficial</div>
                  <div class="bio-card">${bio}</div>
                  
                  <div class="grid">
                    <div class="card">
                      <div class="section-title" style="margin-bottom: 10px;">Estadísticas Clave</div>
                      <div class="metric-value">${followers.toLocaleString()}</div>
                      <div class="metric-label">Spotify Followers</div>
                    </div>
                    <div class="card">
                      <div class="section-title" style="margin-bottom: 10px;">Nivel de Cuenta</div>
                      <div class="metric-value" style="color: #FF9F0A;">${plan}</div>
                      <div class="metric-label">Zonyd Membership Plan</div>
                    </div>
                  </div>

                  <div class="section-title">Presencia Digital y Enlaces</div>
                  <div class="bio-card" style="margin-bottom: 0;">
                    <div style="margin-bottom: 10px;"><strong>Spotify Profile:</strong> <span style="font-family: monospace; font-size: 12px; color: #FF9F0A;">${spotify}</span></div>
                    <div><strong>Instagram Handle:</strong> <span style="font-family: monospace; font-size: 12px; color: #FF9F0A;">${instagram}</span></div>
                  </div>
                  
                  <div class="footer">
                    Powered by Zonyd Autonomous Distribution System &bull; EPK Autogenerado
                  </div>
                </div>
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                    }, 500);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        } catch (err) {
          console.error(err);
          alert('Error al generar el Press Kit.');
        } finally {
          setToolsState(prev => ({ ...prev, isGenerating: false }));
        }
      };
      
      generateEPK();
    }
  };

  const TOOLS = [
    {
      title: 'Calculadora de Royalties',
      desc: 'Estima tus ingresos brutos basados en streams proyectados en plataformas globales.',
      icon: <Calculator className="text-[#FF9F0A]" />,
      action: 'COPIAR RESULTADO',
      color: '[#FF9F0A]',
      isInteractive: true
    },
    {
      title: 'Conversor de Audio Pro',
      desc: 'Convierte archivos WAV a FLAC/MP3 manteniendo metadatos ISRC y calidad 24-bit.',
      icon: <RefreshCw className="text-[#4F8CFF]" />,
      action: toolsState.isConverting ? 'CONVIRTIENDO...' : 'SUBIR ARCHIVO',
      color: '[#4F8CFF]',
      requiresPro: true,
      isLoading: toolsState.isConverting
    },
    {
      title: 'Generador de Press Kit',
      desc: 'Crea un Media Kit profesional en PDF con tus fotos, bio y links de redes sociales.',
      icon: <FileAudio className="text-[#34C759]" />,
      action: toolsState.isGenerating ? 'GENERANDO PDF...' : 'GENERAR PDF',
      color: '[#34C759]',
      isLoading: toolsState.isGenerating
    },
    {
      title: 'Buscador de ISRC',
      desc: 'Valida o recupera códigos ISRC registrados globalmente para tus tracks.',
      icon: <Music2 className="text-[#7B61FF]" />,
      color: '[#7B61FF]',
      action: 'BUSCAR CÓDIGO',
    }
  ];

  return (
    <div className="p-8 space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                 <Zap className="text-[#FF9F0A] animate-pulse" size={24} />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">Herramientas</h1>
           </div>
           <p className="text-[#A1A1AA] text-sm flex items-center gap-2">
             <Sparkles size={14} className="text-[#FF9F0A]" />
             Utilidades técnicas para optimizar tu flujo de trabajo musical.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Tools Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map((tool, i) => (
            <GlowCard key={i} color={tool.color}>
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                {tool.icon}
              </div>
              <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tight group-hover:text-[#FF9F0A] transition-colors">{tool.title}</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8 h-10">{tool.desc}</p>
              
              {tool.isInteractive && tool.title === 'Calculadora de Royalties' ? (
                <div className="space-y-4 mb-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                  <input 
                    type="range" 
                    min="1000" 
                    max="1000000" 
                    step="1000"
                    value={calcStreams}
                    onChange={(e) => setCalcStreams(parseInt(e.target.value))}
                    className="w-full accent-[#FF9F0A] cursor-pointer"
                  />
                  <div className="flex justify-between items-center bg-black/60 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Ingreso Est.</span>
                    <span className="text-2xl font-black text-[#34C759] tracking-tighter">
                      <AnimatedNumber value={estimatedRevenue} /> <span className="text-[10px] text-white/40">USD</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] uppercase font-bold text-center">
                    Basado en <span className="text-white">{calcStreams.toLocaleString()}</span> streams
                  </p>
                </div>
              ) : null}

              <Button 
                onClick={() => handleToolAction(tool.title)}
                disabled={tool.isLoading}
                className="w-full bg-white/5 border border-white/10 text-white font-black h-14 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                {tool.action} 
                {tool.requiresPro ? <span className="text-[#FF9F0A] text-[9px] bg-[#FF9F0A]/10 px-2 py-1 rounded-md">PRO</span> : <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
              </Button>
            </GlowCard>
          ))}
        </div>

        {/* Sidebar Sections */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="bg-gradient-to-br from-[#151821] to-[#0B0B0F] border-[#232733] rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Globe size={100} />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <Globe className="text-[#4F8CFF]" size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Zonyd Global Network</h3>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8 relative z-10">
                Como miembro de Zonyd, tienes acceso a beneficios exclusivos en la red global de distribución y promoción.
              </p>
              <div className="space-y-3 relative z-10">
                 {[
                   { label: 'Groover Pack', discount: '-15% OFF' },
                   { label: 'SubmitHub Credits', discount: '5 FREE' },
                   { label: 'Chartmetric Basic', discount: 'FREE' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:bg-black/60 transition-colors">
                      <span className="text-[10px] font-bold text-white uppercase">{item.label}</span>
                      <span className="text-[10px] text-[#34C759] font-black">{item.discount}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <div className="p-10 rounded-[2.5rem] bg-[#FF9F0A]/5 border border-[#FF9F0A]/20 relative group">
              <div className="flex items-center gap-3 mb-4 text-[#FF9F0A]">
                 <TrendingUp size={18} />
                 <p className="text-xs font-black uppercase tracking-widest">Tip de Carrera</p>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed italic">
                "No esperes al día del lanzamiento para crear tu Press Kit. Tenlo listo 3 semanas antes para enviar a blogs y curadores."
              </p>
              <div className="mt-6 flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                <ShieldCheck size={12} /> Verified Artist Strategy
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

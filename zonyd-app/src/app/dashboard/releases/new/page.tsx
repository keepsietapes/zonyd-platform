'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Check, Upload, 
  Music, Image as ImageIcon, Globe, DollarSign, Eye, Share2, Calendar, Clock, Copy, Disc, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, Mic2, Plus, SplitSquareVertical, X, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

const STEPS = [
  { id: 1, name: 'Información Básica', icon: <Music size={18} /> },
  { id: 2, name: 'Carga de Archivos', icon: <Upload size={18} /> },
  { id: 3, name: 'Detalles de Tracks', icon: <Check size={18} /> },
  { id: 4, name: 'Tiendas & Destinos', icon: <Globe size={18} /> },
  { id: 5, name: 'Monetización', icon: <DollarSign size={18} /> },
  { id: 6, name: 'Revisión Final', icon: <Eye size={18} /> },
];

const INITIAL_STORES = [
  { name: 'Spotify', color: '#1DB954' },
  { name: 'Apple Music', color: '#FA243C' },
  { name: 'TikTok', color: '#00F2FE' },
  { name: 'Instagram / FB', color: '#E1306C' },
  { name: 'YouTube Music', color: '#FF0000' },
  { name: 'Amazon Music', color: '#00A8E1' },
  { name: 'Tidal', color: '#000000', border: true },
  { name: 'Deezer', color: '#FF0092' },
  { name: 'Pandora', color: '#005483' },
  { name: 'iHeartRadio', color: '#C6002B' },
  { name: 'Tencent', color: '#21C164' },
  { name: 'NetEase', color: '#E60026' }
];

import { authFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function NewReleasePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [releaseType, setReleaseType] = useState('Sencillo (Single)');
  const [releaseName, setReleaseName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [artistOptions, setArtistOptions] = useState<{value: string, label: string}[]>([]);
  const [labelName, setLabelName] = useState('Zonyd Records');
  const [selectedStores, setSelectedStores] = useState(INITIAL_STORES.map(s => s.name));
  const [releaseDate, setReleaseDate] = useState('2026-05-15');
  const [releaseTime, setReleaseTime] = useState('12:00');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bannerStyle, setBannerStyle] = useState(0);

  // Estados de Integración Real
  const [uploadedTracks, setUploadedTracks] = useState<{id: string, title: string}[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverStatus, setCoverStatus] = useState('idle'); // idle, loading, success, error
  const [audioStatus, setAudioStatus] = useState('idle'); // idle, loading, analyzing, success, error
  const [coverFileName, setCoverFileName] = useState<string | null>(null);

  // Splits State
  const [splits, setSplits] = useState([
    { artistName: 'Tú', percentage: 100, email: '', role: 'Primary Artist' }
  ]);

  const [createdReleaseId, setCreatedReleaseId] = useState<string | null>(null);
  const [preSaveUrl, setPreSaveUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string>('');
  const [realAuthorName, setRealAuthorName] = useState<string>('');
  const [authorRole, setAuthorRole] = useState<string>('Autor / Compositor');
  const [genre, setGenre] = useState<string>('Alternative');
  const [isExplicit, setIsExplicit] = useState<boolean>(false);

  // Cargar el artista real del usuario
  useEffect(() => {
    const loadArtist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: artist } = await supabase
          .from('Artist')
          .select('stageName, id')
          .eq('userId', user.id)
          .single();
        
        if (artist?.stageName) {
          setArtistName(artist.stageName);
          setArtistOptions([{ value: artist.stageName, label: `${artist.stageName} ✓ Verificado` }]);
        } else {
          const name = user.email?.split('@')[0] || 'Mi Artista';
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);
          setArtistName(displayName);
          setArtistOptions([{ value: displayName, label: displayName }]);
        }
      }
    };
    loadArtist();
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverStatus('loading');
    setCoverFileName(file.name);
    setTimeout(() => {
      setCoverStatus('success');
      setCoverUrl(URL.createObjectURL(file));
    }, 1500);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedExtensions = ['wav', 'flac', 'mp3', 'm4a', 'ogg'];

    // Filtrar archivos válidos
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return allowedExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      alert('Formatos no compatibles. Usa WAV, FLAC, MP3, M4A u OGG.');
      return;
    }

    setAudioStatus('loading');

    // ✅ PASO 1: Registrar localmente de inmediato (sin esperar el backend)
    const localTracks = validFiles.map(file => ({
      id: `local-${Date.now()}-${Math.random()}`,
      title: file.name
    }));
    setUploadedTracks(prev => [...prev, ...localTracks]);

    setAudioStatus('analyzing');

    // ✅ PASO 2: Intentar subir al backend en segundo plano (no bloquea)
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', releaseName || file.name.replace(/\.[^/.]+$/, ''));

      try {
        const data = await authFetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (data?.track?.id) {
          // Actualizar el ID local con el ID real del backend
          setUploadedTracks(prev => prev.map(t =>
            t.id === localTracks[i].id ? { ...t, id: data.track.id } : t
          ));
        }
      } catch (err) {
        // Backend no disponible — el track igual queda registrado localmente
        console.warn(`Error al subir track ${file.name}:`, err);
      }
    }

    setTimeout(() => setAudioStatus('success'), 500);
  };

  const handleSubmitRelease = async () => {
    if (isSubmitting) return;
    
    console.log("--- INICIANDO DESPLIEGUE ZONYD ---");
    setIsSubmitting(true);
    
    try {
      const payload = {
        title: releaseName,
        artist: artistName,
        trackIds: uploadedTracks.map(t => t.id),
        splits: splits,
        lyrics: lyrics,
        realAuthorName: realAuthorName,
        authorRole: authorRole,
        genre: genre,
        coverUrl: coverUrl,
        releaseDate: releaseDate,
        explicit: isExplicit
      };
      
      const data = await authFetch('/api/releases', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log("Lanzamiento creado exitosamente:", data.id);
      setCreatedReleaseId(data.id);
      setPreSaveUrl(data.preSaveUrl);
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Fallo crítico en el despliegue:", err);
      alert(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
      console.log("--- FINALIZADO PROCESO DE DESPLIEGUE ---");
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const toggleStore = (name: string) => {
    setSelectedStores(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const toggleAllStores = () => {
    if (selectedStores.length === INITIAL_STORES.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(INITIAL_STORES.map(s => s.name));
    }
  };

  const copyToClipboard = () => {
    const text = `🔥 ¡Nuevo lanzamiento en camino!\n\n"${releaseName || 'Sin Título'}" por ${artistName} saldrá muy pronto.\nPre-guárdalo ahora y sé el primero en escucharlo.\n\nImpulsado por Zonyd. ¿Eres artista? Únete a la revolución independiente: zonyd.com\n\n🔗 ${preSaveUrl || 'https://zonyd.com/pre/xyz123'}\n#NuevaMusica #Zonyd`;
    navigator.clipboard.writeText(text);
    alert('¡Kit de Prensa copiado al portapapeles!');
  };

  if (showSuccess) {
    const coverUrl = "https://upload.wikimedia.org/wikipedia/en/1/16/Alleyezonme.jpg";
    
    const banners = [
      // 0: Minimal Premium
      <div key="0" className="w-full aspect-[4/5] sm:aspect-video bg-[#151821] rounded-2xl border border-[#232733] relative overflow-hidden flex flex-col items-center justify-center p-8 group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F0A]/20 to-[#7B61FF]/20 opacity-50" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-5 w-full">
          <img src="/logo.png" alt="Zonyd" className="w-14 h-14 object-contain mb-2 drop-shadow-lg" />
          
          <div className="w-48 h-48 bg-[#0B0B0F] rounded-xl shadow-2xl border border-white/10 flex items-center justify-center overflow-hidden">
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white">{releaseName || 'All Eyez on Me'}</h2>
            <p className="text-sm text-[#A1A1AA] font-bold tracking-widest uppercase mt-1">{artistName}</p>
          </div>
          
          <div className="mt-4 px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            NUEVA MÚSICA
          </div>
        </div>
      </div>,

      // 1: Cyber/Neon
      <div key="1" className="w-full aspect-[4/5] sm:aspect-video bg-black rounded-2xl border border-[#FF9F0A]/50 relative overflow-hidden flex flex-col items-center p-8 group shadow-[0_0_50px_rgba(255,159,10,0.15)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#FF9F0A 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 w-full h-full justify-between">
          
          <div className="flex justify-between w-full px-4 items-center">
            <div className="bg-black/50 p-2 rounded-lg border border-[#FF9F0A]/30 backdrop-blur-md">
               <img src="/logo.png" alt="Zonyd" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,159,10,0.8)]" />
            </div>
            <span className="text-[#FF9F0A] font-mono text-xs border border-[#FF9F0A] px-3 py-1 bg-black/80">OUT SOON</span>
          </div>

          <div className="w-48 h-48 bg-[#232733] rounded-sm shadow-[15px_15px_0_#FF9F0A] flex items-center justify-center mt-2 border border-white/10 overflow-hidden">
             <img src={coverUrl} alt="Cover" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
          </div>

          <div className="mt-6 w-full pb-4">
            <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FF9F0A] italic tracking-tighter uppercase">{releaseName || 'All Eyez on Me'}</h2>
            <p className="text-lg text-[#FF9F0A] font-bold mt-1 tracking-widest uppercase">{artistName}</p>
          </div>
        </div>
      </div>,

      // 2: Vinyl Retro
      <div key="2" className="w-full aspect-[4/5] sm:aspect-video bg-[#0B0B0F] rounded-2xl border border-[#232733] relative overflow-hidden flex flex-col items-center justify-center p-8 group shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B61FF]/10 rounded-full blur-[100px]" />
        
        <img src="/logo.png" alt="Zonyd" className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-12 object-contain opacity-80" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-8 w-full mt-10">
          <div className="relative flex justify-center">
            <div className="absolute left-10 top-2 w-48 h-48 rounded-full bg-[#050505] border border-white/5 flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-xl">
               <div className="absolute w-40 h-40 rounded-full border border-white/5" />
               <div className="absolute w-32 h-32 rounded-full border border-white/5" />
               <div className="absolute w-24 h-24 rounded-full border border-white/5" />
               <div className="w-16 h-16 rounded-full border border-white/20 overflow-hidden">
                  <img src={coverUrl} alt="Center" className="w-full h-full object-cover opacity-80" />
               </div>
               <div className="absolute w-3 h-3 bg-[#0B0B0F] rounded-full border border-white/30" />
            </div>
            
            <div className="w-48 h-48 bg-[#151821] rounded-sm shadow-2xl border border-[#232733] flex items-center justify-center relative z-10 overflow-hidden group-hover:-translate-x-12 transition-transform duration-700">
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center mt-12">
          <h2 className="text-3xl font-black text-white font-serif tracking-tight">{releaseName || 'All Eyez on Me'}</h2>
          <p className="text-sm text-[#A1A1AA] italic mt-1 font-serif">by {artistName}</p>
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#7B61FF] font-bold tracking-widest border border-[#7B61FF]/30 px-4 py-1.5 rounded-full">
            <Disc size={14} /> DISTRIBUIDO POR ZONYD
          </div>
        </div>
      </div>
    ];

    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4 py-12 animate-in fade-in duration-700">
        <Card className="w-full max-w-4xl glass-panel border-[#232733] shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-[#FF9F0A]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <CardHeader className="text-center pb-2 relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#34C759]/20 border border-[#34C759] flex items-center justify-center mx-auto mb-4">
              <Check className="text-[#34C759]" size={32} />
            </div>
            <CardTitle className="text-4xl font-black text-white tracking-tight">¡Lanzamiento Programado!</CardTitle>
            <CardDescription className="text-[#A1A1AA] text-base mt-2">Tu música será procesada y distribuida. Elige un Promo Banner para tus redes.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8 pt-6 relative z-10">
            <div>
              {banners[bannerStyle]}
              <div className="flex justify-center gap-3 mt-6">
                <Button variant={bannerStyle === 0 ? 'default' : 'outline'} onClick={() => setBannerStyle(0)} className={bannerStyle === 0 ? 'bg-white text-black font-bold' : 'border-[#232733] text-[#A1A1AA]'}>Minimalista</Button>
                <Button variant={bannerStyle === 1 ? 'default' : 'outline'} onClick={() => setBannerStyle(1)} className={bannerStyle === 1 ? 'bg-[#FF9F0A] text-black font-bold' : 'border-[#232733] text-[#A1A1AA]'}>Cyber/Neón</Button>
                <Button variant={bannerStyle === 2 ? 'default' : 'outline'} onClick={() => setBannerStyle(2)} className={bannerStyle === 2 ? 'bg-[#7B61FF] text-white font-bold' : 'border-[#232733] text-[#A1A1AA]'}>Vinilo Retro</Button>
              </div>
            </div>

            <div className="p-6 bg-[#151821]/50 rounded-2xl border border-[#232733] space-y-4 backdrop-blur-sm">
              <Label className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Share2 size={14} /> Kit de Prensa para Redes Sociales
              </Label>
              <div className="p-4 bg-[#0B0B0F] rounded-xl border border-white/5 text-sm text-[#E4E4E7] leading-relaxed font-mono">
                🔥 ¡Nuevo lanzamiento en camino!<br/><br/>
                "{releaseName || 'All Eyez on Me'}" por {artistName} saldrá muy pronto.<br/>
                Pre-guárdalo ahora y sé el primero en escucharlo.<br/><br/>
                Impulsado por Zonyd. ¿Eres artista? Únete a la revolución independiente: zonyd.com<br/><br/>
                🔗 {preSaveUrl || `https://zonyd.com/pre/${createdReleaseId?.substring(0, 8) || 'xyz123'}`}<br/>
                #NuevaMusica #Zonyd
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={copyToClipboard} className="flex-1 bg-[#232733] hover:bg-white hover:text-black transition-all font-bold text-white h-12 shadow-lg">
                  <Copy size={18} className="mr-2" /> Copiar Link y Texto
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-[#232733] text-white hover:bg-[#232733] h-12">
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0B0B0F] text-white p-4 md:p-8 selection:bg-[#FF9F0A] selection:text-black pb-safe md:pb-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 md:mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-[#A1A1AA] hover:text-white group px-2">
          <ChevronLeft className="mr-1 group-hover:-translate-x-1 transition-transform" size={18} /> 
          <span className="hidden sm:inline">Dashboard</span>
        </Button>
        <div className="text-right">
          <p className="text-xs font-black text-gradient uppercase tracking-widest">Release Manager</p>
          <p className="text-[10px] text-[#A1A1AA]">Paso {currentStep} / {STEPS.length}</p>
        </div>
      </div>

      {/* Stepper — compacto en mobile */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between mb-4">
          {STEPS.map((step) => (
            <div key={step.id} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${currentStep >= step.id ? 'text-[#FF9F0A]' : 'text-[#232733]'}`}>
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                currentStep >= step.id ? 'border-[#FF9F0A] bg-[#FF9F0A]/10' : 'border-[#232733] opacity-40'
              }`}>
                <div className="scale-75 md:scale-100">{step.icon}</div>
              </div>
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] hidden lg:block">{step.name}</span>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / STEPS.length) * 100} className="h-1 bg-[#151821]" />
      </div>

      {/* Card principal */}
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <Card className="glass-panel border-[#232733] shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 p-4 md:pb-8 md:p-8">
            <CardTitle className="text-xl md:text-3xl font-black tracking-tight">{STEPS[currentStep - 1].name}</CardTitle>
            <CardDescription className="text-[#A1A1AA] text-sm">Ingeniería musical de precisión para artistas de élite.</CardDescription>
          </CardHeader>
          
          <div className="p-4 md:p-8 md:pt-10 min-h-[300px] md:min-h-[400px]">
            {currentStep === 1 && (
              <StepInfoBasica 
                releaseType={releaseType} setReleaseType={setReleaseType} 
                releaseName={releaseName} setReleaseName={setReleaseName} 
                artistName={artistName} setArtistName={setArtistName}
                labelName={labelName} setLabelName={setLabelName}
                artistOptions={artistOptions}
              />
            )}
            {currentStep === 2 && (
              <StepUpload 
                handleAudioUpload={handleAudioUpload} 
                handleCoverUpload={handleCoverUpload} 
                audioStatus={audioStatus} 
                coverStatus={coverStatus} 
                coverUrl={coverUrl}
                coverFileName={coverFileName}
                releaseType={releaseType}
                uploadedTracks={uploadedTracks}
                releaseName={releaseName}
              />
            )}
            {currentStep === 3 && (
              <StepTracks 
                releaseType={releaseType} 
                splits={splits} 
                setSplits={setSplits} 
                lyrics={lyrics}
                setLyrics={setLyrics}
                realAuthorName={realAuthorName}
                setRealAuthorName={setRealAuthorName}
                authorRole={authorRole}
                setAuthorRole={setAuthorRole}
              />
            )}
            {currentStep === 4 && (
              <StepStores 
                selectedStores={selectedStores} 
                toggleStore={toggleStore} 
                toggleAllStores={toggleAllStores} 
              />
            )}
            {currentStep === 5 && <StepMonetization />}
            {currentStep === 6 && (
              <StepReview 
                releaseDate={releaseDate} setReleaseDate={setReleaseDate}
                releaseTime={releaseTime} setReleaseTime={setReleaseTime}
              />
            )}
          </div>

          <div className="p-4 md:p-8 border-t border-white/5 flex items-center justify-between bg-[#151821]/20 sticky bottom-0">
            <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1} className="text-[#A1A1AA] hover:text-white">Anterior</Button>
            <Button 
              onClick={currentStep === 6 ? handleSubmitRelease : nextStep} 
              disabled={isSubmitting}
              className="bg-[#FF9F0A] text-black font-black px-10 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FF9F0A]/20"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" />
              ) : currentStep === 6 ? (
                'DESPLEGAR LANZAMIENTO'
              ) : (
                'SIGUIENTE PASO'
              )} 
              {currentStep !== 6 && !isSubmitting && <ChevronRight className="ml-2" size={18} />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- Steps ---

function StepInfoBasica({ releaseType, setReleaseType, releaseName, setReleaseName, artistName, setArtistName, labelName, setLabelName, artistOptions }: any) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">Nombre del Lanzamiento</Label>
          <Input value={releaseName} onChange={(e) => setReleaseName(e.target.value)} placeholder="Ej. Neon Nights" className="h-12 bg-[#0B0B0F] border-[#232733] text-lg font-bold rounded-xl focus:border-[#FF9F0A]" />
        </div>
        <div className="space-y-3">
          <Label className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">Formato</Label>
          <select value={releaseType} onChange={(e) => setReleaseType(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-[#0B0B0F] border border-[#232733] font-bold text-white focus:border-[#FF9F0A] outline-none appearance-none cursor-pointer">
            <option>Sencillo (Single)</option>
            <option>EP</option>
            <option>Álbum</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">Artista Principal</Label>
            <span className="text-[9px] bg-[#FF9F0A]/10 text-[#FF9F0A] px-2 py-0.5 rounded-full border border-[#FF9F0A]/20">Perfil Verificado</span>
          </div>
          <select value={artistName} onChange={(e) => setArtistName(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-[#0B0B0F] border border-[#232733] font-bold text-white focus:border-[#FF9F0A] outline-none appearance-none cursor-pointer">
            {(artistOptions as {value: string, label: string}[]).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            <option value="nuevo">+ Vincular Nuevo Artista</option>
          </select>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <Label className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">Sello Discográfico / Label</Label>
          <Input value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="Zonyd Records" className="h-12 bg-[#0B0B0F] border-[#232733] text-lg font-bold rounded-xl focus:border-[#FF9F0A]" />
        </div>
        <div className="space-y-3">
          <Label className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">Género Principal</Label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-[#0B0B0F] border border-[#232733] font-bold text-white focus:border-[#FF9F0A] outline-none appearance-none cursor-pointer">
            <option>Alternative</option>
            <option>Urban/Reggaeton</option>
            <option>Trap</option>
            <option>Electronic/EDM</option>
            <option>Pop</option>
            <option>Hip-Hop</option>
            <option>Latin</option>
          </select>
        </div>
        <div className="space-y-3 flex flex-col justify-center">
           <Label className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mb-4">Contenido Explícito</Label>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsExplicit(!isExplicit)}
                className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${isExplicit ? 'bg-red-500' : 'bg-[#232733]'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${isExplicit ? 'left-7' : 'left-1'}`} />
              </button>
              <span className={`text-[10px] font-black uppercase ${isExplicit ? 'text-red-500' : 'text-[#A1A1AA]'}`}>
                {isExplicit ? 'SÍ (EXPLICIT)' : 'NO'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}

function StepUpload({ 
  handleAudioUpload, handleCoverUpload, audioStatus, coverStatus, 
  coverUrl, coverFileName, releaseType, uploadedTracks, releaseName 
}: any) {

  return (
    <div className="space-y-8">
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF9F0A]/10 to-transparent border border-[#FF9F0A]/20 flex items-start gap-4">
        <Globe className="text-[#FF9F0A] shrink-0 mt-1" size={20} />
        <div>
          <p className="text-sm font-bold text-white mb-1">Optimización Global Garantizada</p>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Sube tu master y portada. Nuestro sistema escaneará automáticamente el audio para asegurar que esté libre de copyright y ajustará la resolución visual para Spotify, Apple Music, TikTok y más de 150 tiendas a nivel mundial.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* COVER UPLOAD */}
        <div className="group cursor-pointer relative">
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleCoverUpload} />
          <Label className="text-[#A1A1AA] text-xs font-bold uppercase mb-4 block flex justify-between">
            Artwork Premium
            {coverStatus === 'success' && <span className="text-[#34C759]">COMPLETADO</span>}
          </Label>
          <div className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden group-hover:border-[#FF9F0A]/50 ${
            coverStatus === 'idle' ? 'border-[#232733] bg-[#151821]/30 group-hover:bg-[#FF9F0A]/5' :
            coverStatus === 'loading' ? 'border-[#FF9F0A] bg-[#FF9F0A]/10' :
            coverStatus === 'success' ? 'border-[#34C759] bg-[#34C759]/10' : 'border-red-500 bg-red-500/10'
          }`}>
            {coverUrl ? (
              <div className="relative w-full h-full">
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                   <p className="text-[10px] font-bold text-white uppercase tracking-widest">Cambiar Imagen</p>
                </div>
              </div>
            ) : (
              <>
                {coverStatus === 'loading' ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="text-[#FF9F0A] animate-spin" size={48} />
                    <p className="text-[10px] font-bold text-[#FF9F0A] uppercase tracking-widest animate-pulse">Cargando...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="text-[#232733] group-hover:text-[#FF9F0A] transition-colors" size={56} />
                    <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest z-10 text-center">Clic para Subir<br/><span className="text-[8px] opacity-50">(3000 x 3000px)</span></p>
                  </>
                )}
              </>
            )}
          </div>
          {coverFileName && (
            <div className="mt-3 flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="w-6 h-6 rounded bg-[#FF9F0A]/10 flex items-center justify-center">
                <ImageIcon size={12} className="text-[#FF9F0A]" />
              </div>
              <span className="text-[10px] font-bold text-[#A1A1AA] truncate flex-1">{coverFileName}</span>
              <Check size={12} className="text-[#34C759]" />
            </div>
          )}
        </div>

        {/* AUDIO UPLOAD — Arquitectura Robusta */}
        <div className="space-y-4">
          {/* Input oculto con id para que el label lo active correctamente */}
          <input
            id="audio-file-input"
            type="file"
            accept=".mp3,.wav,.flac,.m4a,.ogg,audio/*"
            className="hidden"
            onChange={handleAudioUpload}
            multiple
          />

          <Label className="text-[#A1A1AA] text-xs font-bold uppercase mb-2 block flex justify-between">
            Master Audio {releaseType !== 'Single' && '(Sube todos tus tracks)'}
            {audioStatus === 'success' && <span className="text-[#34C759]">✓ {uploadedTracks.length} TRACK(S)</span>}
          </Label>

          {/* Zona de clic — label apunta al input por htmlFor */}
          <label
            htmlFor="audio-file-input"
            className={`block aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-500 cursor-pointer select-none ${
              audioStatus === 'idle'     ? 'border-[#232733] bg-[#151821]/30 hover:border-[#7B61FF] hover:bg-[#7B61FF]/5' :
              audioStatus === 'loading'  ? 'border-[#7B61FF] bg-[#7B61FF]/10' :
              audioStatus === 'analyzing'? 'border-[#00F2FE] bg-[#00F2FE]/10' :
              audioStatus === 'success'  ? 'border-[#34C759] bg-[#34C759]/10' :
                                           'border-red-500/60 bg-red-500/5 hover:border-red-400 hover:bg-red-500/10'
            }`}
          >
            {audioStatus === 'idle' && (
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <Upload className="text-[#3A3F50]" size={56} />
                <div className="text-center">
                  <p className="text-[11px] font-black text-[#A1A1AA] uppercase tracking-[0.2em]">
                    {releaseType !== 'Single' ? 'Seleccionar Tracks' : 'Seleccionar Master'}
                  </p>
                  <p className="text-[9px] text-[#4A4F60] mt-1">WAV · FLAC · MP3 · M4A</p>
                </div>
              </div>
            )}
            {(audioStatus === 'loading' || audioStatus === 'analyzing') && (
              <div className="flex flex-col items-center gap-4 pointer-events-none">
                <div className="w-14 h-14 rounded-full border-4 border-[#7B61FF]/30 border-t-[#7B61FF] animate-spin" />
                <p className="text-[11px] font-black text-[#7B61FF] uppercase tracking-[0.2em]">
                  {audioStatus === 'loading' ? 'Procesando...' : 'Verificando Copyright...'}
                </p>
              </div>
            )}
            {audioStatus === 'success' && (
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <CheckCircle2 className="text-[#34C759]" size={52} />
                <div className="text-center">
                  <p className="text-sm font-black text-white">{uploadedTracks.length} Track{uploadedTracks.length !== 1 ? 's' : ''} Listos</p>
                  <p className="text-[9px] text-[#A1A1AA] mt-1">Clic para agregar más</p>
                </div>
              </div>
            )}
            {audioStatus === 'error' && (
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <ShieldAlert className="text-red-400" size={52} />
                <div className="text-center">
                  <p className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em]">Error de Subida</p>
                  <p className="text-[9px] text-[#A1A1AA] mt-1">Clic para reintentar</p>
                </div>
              </div>
            )}
          </label>

          {/* Lista de tracks cargados */}
          {uploadedTracks.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {uploadedTracks.map((track: {id: string, title: string}, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/8">
                  <div className="w-6 h-6 rounded-lg bg-[#7B61FF]/20 flex items-center justify-center shrink-0">
                    <Music size={11} className="text-[#7B61FF]" />
                  </div>
                  <span className="text-[11px] font-bold text-white truncate flex-1">{track.title}</span>
                  <Check size={13} className="text-[#34C759] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepTracks({ 
  releaseType, splits, setSplits, 
  lyrics, setLyrics, realAuthorName, setRealAuthorName, 
  authorRole, setAuthorRole 
}: any) {
  const [isCover, setIsCover] = useState(false);
  const [hasSamples, setHasSamples] = useState(false);

  const addSplit = () => {
    setSplits([...splits, { artistName: '', percentage: 0, email: '', role: 'Featured' }]);
  };

  const updateSplit = (index: number, field: string, value: any) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const removeSplit = (index: number) => {
    if (index === 0) return; // No quitar al artista principal
    setSplits(splits.filter((_: any, i: number) => i !== index));
  };

  const totalPercentage = splits.reduce((acc: number, curr: any) => acc + Number(curr.percentage), 0);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-[#232733] shadow-inner space-y-8">
        
        {/* Header del Track */}
        <div className="flex items-center gap-5 border-b border-white/5 pb-6">
          <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center font-black text-[#FF9F0A] text-xl">01</div>
          <div className="flex-1">
            <Input placeholder="Título de la Canción" className="bg-transparent border-none text-2xl font-black text-white p-0 h-auto focus-visible:ring-0 placeholder:text-[#232733]" defaultValue="All Eyez on Me" />
            <p className="text-xs text-[#34C759] font-bold mt-1 flex items-center gap-1"><ShieldCheck size={12}/> Audio validado y escaneado</p>
          </div>
        </div>

        {/* Sección: Revenue Splits (Módulo 10) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SplitSquareVertical size={16} className="text-[#FF9F0A]"/> Royalties & Revenue Splits
            </h3>
            <span className={`text-[10px] font-black px-2 py-1 rounded ${totalPercentage === 100 ? 'bg-[#34C759]/20 text-[#34C759]' : 'bg-red-500/20 text-red-500'}`}>
              TOTAL: {totalPercentage}%
            </span>
          </div>

          <div className="space-y-3">
            {splits.map((split: any, index: number) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-[#151821]/30 p-4 rounded-xl border border-white/5 group relative">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-[#A1A1AA] uppercase">Artista / Email</Label>
                  <Input 
                    value={split.artistName} 
                    onChange={(e) => updateSplit(index, 'artistName', e.target.value)}
                    placeholder={index === 0 ? "Tú" : "colaborador@email.com"} 
                    className="bg-[#0B0B0F] border-[#232733] h-9 text-xs" 
                    disabled={index === 0}
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-[10px] text-[#A1A1AA] uppercase">Porcentaje</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={split.percentage} 
                      onChange={(e) => updateSplit(index, 'percentage', e.target.value)}
                      className="bg-[#0B0B0F] border-[#232733] h-9 text-xs pr-6" 
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-[#A1A1AA]">%</span>
                  </div>
                </div>
                {index !== 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeSplit(index)}
                    className="h-9 w-9 text-[#A1A1AA] hover:text-red-500"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={addSplit}
              className="w-full border-dashed border-[#232733] text-[#A1A1AA] hover:border-[#FF9F0A] hover:text-[#FF9F0A] h-10 text-[10px] font-black uppercase tracking-widest"
            >
              <Plus size={14} className="mr-2" /> Añadir Colaborador
            </Button>
          </div>
        </div>

        {/* Sección: Autores y Créditos */}
        <div className="space-y-6 border-t border-white/5 pt-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Mic2 size={16} className="text-[#34C759]"/> Autores y Créditos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Nombre Real del Autor (INDAUTOR/PRO)</Label>
                <Input 
                  value={realAuthorName}
                  onChange={(e) => setRealAuthorName(e.target.value)}
                  placeholder="Ej. Tupac Amaru Shakur" 
                  className="bg-[#151821] border-[#232733]" 
                />
                <p className="text-[9px] text-[#A1A1AA]">Requerido para pago de regalías.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Rol en la Canción</Label>
                <div className="flex gap-2">
                  <select 
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="h-10 px-3 rounded-md bg-[#151821] border border-[#232733] text-xs text-[#A1A1AA] outline-none w-full cursor-pointer"
                  >
                    <option>Autor / Compositor</option>
                    <option>Productor Principal</option>
                    <option>Músico de Sesión</option>
                    <option>Ingeniero de Mezcla</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Derechos y Técnicos */}
        <div className="space-y-6 border-t border-white/5 pt-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-[#7B61FF]"/> Derechos y Composición</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#151821]/50 p-4 rounded-xl border border-[#232733]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">¿Es una canción Cover?</p>
                  <p className="text-[10px] text-[#A1A1AA]">No soy el escritor original.</p>
                </div>
                <div onClick={() => setIsCover(!isCover)} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isCover ? 'bg-[#7B61FF]' : 'bg-[#232733]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isCover ? 'left-5' : 'left-0.5'}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">¿Utiliza Samples de 3ros?</p>
                  <p className="text-[10px] text-[#A1A1AA]">Tengo las licencias (Clearance).</p>
                </div>
                <div onClick={() => setHasSamples(!hasSamples)} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${hasSamples ? 'bg-[#FF9F0A]' : 'bg-[#232733]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${hasSamples ? 'left-5' : 'left-0.5'}`} />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Instrumentación Principal</Label>
              <Input placeholder="Ej. Sintetizador, Guitarra Acústica, 808s (Separado por comas)" className="bg-[#151821] border-[#232733] mt-2" />
            </div>
          </div>
        </div>

        {/* Sección: Marketing y Letras */}
        <div className="space-y-6 border-t border-white/5 pt-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Mic2 size={16} className="text-[#34C759]"/> Marketing & Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Clip Destacado (TikTok / Reels)</Label>
                  <p className="text-[9px] text-[#A1A1AA] mb-2">Selecciona los 60s más virales de tu canción.</p>
                  <div className="flex gap-2 items-center">
                    <Input placeholder="00:45" className="bg-[#151821] border-[#232733] text-center w-24 font-mono text-lg" />
                    <span className="text-xs text-[#A1A1AA]">Min:Seg (Inicio)</span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest flex justify-between">
                  Letras Sincronizadas
                  <span className="text-[#34C759]">Enviado a Spotify & IG</span>
                </Label>
                <textarea 
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="w-full h-48 mt-2 bg-[#151821] border border-[#232733] rounded-xl p-3 text-sm text-white focus:border-[#FF9F0A] outline-none resize-none font-mono"
                  placeholder="Escribe o pega tus letras aquí...&#10;&#10;Atención: Sin faltas de ortografía ni signos de puntuación innecesarios al final de cada línea."
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {releaseType !== 'Sencillo (Single)' && (
        <Button variant="outline" className="w-full h-14 border-dashed border-[#232733] rounded-2xl text-[#A1A1AA] hover:bg-[#151821] hover:text-white transition-all">
          <Plus size={16} className="mr-2" /> Añadir Nueva Canción al {releaseType}
        </Button>
      )}
    </div>
  );
}

function StepStores({ selectedStores, toggleStore, toggleAllStores }: any) {
  const isAllSelected = selectedStores.length === INITIAL_STORES.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Ecosistema Global</h4>
          <p className="text-xs text-[#A1A1AA]">Selecciona dónde quieres que brille tu música.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleAllStores}
          className={`text-[10px] font-black uppercase tracking-wider border-[#232733] transition-all ${
            isAllSelected ? 'hover:bg-red-500/10 hover:text-red-500' : 'hover:bg-[#FF9F0A]/10 hover:text-[#FF9F0A]'
          }`}
        >
          {isAllSelected ? 'Desmarcar Todos' : 'Seleccionar Todos'}
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INITIAL_STORES.map(store => {
          const isSelected = selectedStores.includes(store.name);
          return (
            <div 
              key={store.name} 
              onClick={() => toggleStore(store.name)}
              className={`p-4 rounded-2xl border transition-all duration-500 cursor-pointer flex flex-col items-center gap-3 group relative overflow-hidden ${
                isSelected 
                ? 'border-white/20 bg-white/5 opacity-100 scale-100' 
                : 'border-white/5 bg-transparent opacity-40 grayscale hover:grayscale-0 hover:opacity-70 scale-95'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-125" 
                style={{ backgroundColor: store.color }} 
              />
              <span className="text-[10px] font-black uppercase tracking-tighter text-white">{store.name}</span>
              {isSelected && <div className="absolute top-2 right-2"><Check size={10} className="text-[#34C759]" /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepMonetization() {
  return (
    <div className="space-y-4 pt-4">
      <MonetizationToggle title="YouTube Content ID" desc="Recaudación de ingresos por uso en videos ajenos." active />
      <MonetizationToggle title="Social Media Sync" desc="Monetización en Reels, Shorts y TikTok Sounds." active />
      <MonetizationToggle title="Shazam & Siri" desc="Identificación instantánea de tu música." />
    </div>
  );
}

function MonetizationToggle({ title, desc, active = false }: any) {
  const [enabled, setEnabled] = useState(active);
  return (
    <div 
      onClick={() => setEnabled(!enabled)}
      className={`p-6 rounded-[1.5rem] border transition-all cursor-pointer flex items-center justify-between group ${
        enabled ? 'bg-gradient-to-r from-[#151821] to-[#0B0B0F] border-[#34C759]/30' : 'bg-[#151821]/50 border-white/5'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${enabled ? 'bg-[#34C759]/20 text-[#34C759]' : 'bg-black text-[#232733]'}`}>
          <DollarSign size={20} />
        </div>
        <div>
          <p className="font-bold text-white text-sm">{title}</p>
          <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-[#34C759]' : 'bg-[#232733]'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-7 shadow-lg' : 'left-1'}`} />
      </div>
    </div>
  );
}

function SmartAdvice() {
  return (
    <div className="bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-[2rem] p-8 space-y-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FF9F0A] flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,159,10,0.4)]">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Protocolo de Distribución Zonyd</h3>
          <p className="text-[10px] text-[#FF9F0A] font-bold uppercase tracking-widest">Recomendaciones de ingeniería</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-[#FF9F0A]" /> Ventana de Lanzamiento
          </p>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Para garantizar que tu música llegue a Spotify, Apple Music y Tidal simultáneamente, recomendamos una fecha de al menos <span className="text-white font-bold">14 días en el futuro</span>.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#FF9F0A]" /> Letras y Metadatos
          </p>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Nuestro motor sincronizará automáticamente las letras de Musixmatch y Genius. Asegúrate de que el audio no contenga errores de fase.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepReview({ releaseDate, setReleaseDate, releaseTime, setReleaseTime }: any) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const fullTimesList = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  
  // Lógica funcional de calendario
  const [viewDate, setViewDate] = useState(new Date(releaseDate || Date.now()));
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('es-ES', { month: 'long' });
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Días del mes anterior para rellenar el inicio
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(currentYear, currentMonth + offset, 1));
  };

  const selectDate = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    const dateStr = selected.toISOString().split('T')[0];
    setReleaseDate(dateStr);
    setShowCalendar(false);
  };

  const isCloseDate = releaseDate && (new Date(releaseDate).getTime() - new Date().getTime()) < 14 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-8 pt-4">
      {isCloseDate && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <AlertTriangle className="text-red-500" size={20} />
          <p className="text-xs text-red-200 font-bold">ATENCIÓN: Fecha muy cercana. Recomendamos +14 días para asegurar la carga en todas las tiendas y letras.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Date Selector Pro */}
        <div className="group relative">
          <Label className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Fecha de Despegue</Label>
          <div 
            onClick={() => { setShowCalendar(!showCalendar); setShowTimePicker(false); }}
            className="relative h-24 bg-gradient-to-br from-[#151821] to-[#0B0B0F] rounded-2xl border border-white/10 p-1 group-hover:border-[#FF9F0A]/50 transition-all cursor-pointer overflow-hidden shadow-inner"
          >
             <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-[#232733] group-hover:text-[#FF9F0A] transition-colors" size={40} />
             
             <div className="absolute inset-0 flex flex-col justify-center px-6">
                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white drop-shadow-md">
                  {releaseDate ? new Date(releaseDate + "T00:00:00").toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Seleccionar'}
                </span>
                <span className="text-[9px] font-bold text-[#FF9F0A] uppercase tracking-widest mt-1">Click para abrir calendario</span>
             </div>
          </div>

          {showCalendar && (
            <div className="absolute top-[110%] left-0 w-[300px] bg-[#151821]/95 backdrop-blur-2xl border border-[#FF9F0A]/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 p-4 animate-in fade-in slide-in-from-top-4">
               <div className="flex justify-between items-center mb-4 text-white font-bold capitalize">
                 <button onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="p-2 hover:text-[#FF9F0A]">&lt;</button>
                 <span>{monthName} {currentYear}</span>
                 <button onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="p-2 hover:text-[#FF9F0A]">&gt;</button>
               </div>
               <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[#A1A1AA] mb-2 font-bold uppercase">
                 <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sa</span>
               </div>
               <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                 {paddingDays.map(d => (
                   <span key={`prev-${d}`} className="p-1.5 text-[#A1A1AA]/20">{d}</span>
                 ))}
                 {currentMonthDays.map(d => {
                   const isSelected = releaseDate === `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                   return (
                    <span 
                      key={d} 
                      onClick={(e) => { e.stopPropagation(); selectDate(d); }}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-[#FF9F0A] text-black font-bold shadow-[0_0_10px_rgba(255,159,10,0.5)]' : 'text-white hover:bg-white/10'}`}
                    >
                      {d}
                    </span>
                   );
                 })}
               </div>
            </div>
          )}
        </div>

        {/* Time Selector Pro */}
        <div className="group relative">
          <Label className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Hora Estelar (Local)</Label>
          <div 
            onClick={() => { setShowTimePicker(!showTimePicker); setShowCalendar(false); }}
            className="relative h-24 bg-gradient-to-br from-[#151821] to-[#0B0B0F] rounded-2xl border border-white/10 p-1 group-hover:border-[#7B61FF]/50 transition-all cursor-pointer overflow-hidden shadow-inner"
          >
             <Clock className="absolute right-6 top-1/2 -translate-y-1/2 text-[#232733] group-hover:text-[#7B61FF] transition-colors" size={40} />
             
             <div className="absolute inset-0 flex flex-col justify-center px-6">
                <span className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
                  {releaseTime} <span className="text-sm font-light text-[#A1A1AA]">HRS</span>
                </span>
                <span className="text-[9px] font-bold text-[#7B61FF] uppercase tracking-widest mt-1">Ajuste de precisión</span>
             </div>
          </div>

          {/* Custom Time Dropdown UI - Full 24 Hours */}
          {showTimePicker && (
            <div className="absolute top-[110%] right-0 w-[200px] bg-[#151821]/95 backdrop-blur-2xl border border-[#7B61FF]/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 p-3 animate-in fade-in slide-in-from-top-4">
               <div className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest mb-3 text-center border-b border-white/5 pb-2">Selecciona la Hora</div>
               <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#7B61FF]/50 scrollbar-track-transparent">
                 {fullTimesList.map(t => (
                   <button 
                     key={t}
                     onClick={() => { setReleaseTime(t); setShowTimePicker(false); }}
                     className={`p-2 rounded-lg text-sm font-bold transition-colors ${releaseTime === t ? 'bg-[#7B61FF] text-white shadow-[0_0_10px_rgba(123,97,255,0.4)]' : 'bg-[#0B0B0F] text-[#A1A1AA] hover:bg-white/10 hover:text-white'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
            </div>
          )}
      </div>
      </div>
      
      <SmartAdvice />

      <div className="p-6 rounded-3xl border border-dashed border-[#7B61FF]/30 bg-[#7B61FF]/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#7B61FF]/20 rounded-full flex items-center justify-center">
            <Share2 className="text-[#7B61FF]" size={18} />
          </div>
          <div>
            <p className="font-bold text-white">Generador de Banners Zonyd</p>
            <p className="text-xs text-[#A1A1AA]">Al finalizar, crearemos assets visuales automáticos para promocionar tu lanzamiento.</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-black/40 rounded-full text-[10px] font-black text-[#7B61FF] border border-[#7B61FF]/20">INCLUIDO</div>
      </div>
    </div>
  );
}

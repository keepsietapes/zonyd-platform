import React from 'react';
import { useReleaseStore } from '../store/useReleaseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Image as ImageIcon, FileText, Users, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import LabErrorBoundary from './LabErrorBoundary';

const steps = [
  { id: 1, title: 'Audio', icon: Music },
  { id: 2, title: 'Portada', icon: ImageIcon },
  { id: 3, title: 'Metadatos', icon: FileText },
  { id: 4, title: 'Splits', icon: Users },
  { id: 5, title: 'Revisión', icon: CheckCircle },
];

export default function ReleaseManager() {
  const { step, setStep, releaseData, updateReleaseData } = useReleaseStore();

  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const api = (await import('../services/api')).default;
      
      // 1. Pedir URL firmada al backend
      const { data } = await api.get(`/upload/presigned?fileName=${Date.now()}-${file.name}&contentType=${file.type}`);
      setUploadProgress(30);

      // 2. Subir directo a Cloudflare R2 usando la URL firmada
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', data.url, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(30 + (percent * 0.6)); // Escalar de 30% a 90%
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadProgress(100);
          
          // Guardar en el store dependiendo del tipo de archivo
          if (file.type.startsWith('image/')) {
            // Usar una URL local para la vista previa inmediata (Blob URL)
            const previewUrl = URL.createObjectURL(file);
            updateReleaseData({ coverUrl: previewUrl, coverFile: file.name });
          } else {

            updateReleaseData({ audioFile: file.name, uploadStatus: 'success' });
          }

          setTimeout(() => {
            setIsUploading(false);
            nextStep(); 
          }, 1000);

        } else {
          throw new Error('Error en la subida a R2');
        }
      };

      xhr.send(file);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo. Verifica tu conexión y configuración de Cloudflare.');
      setIsUploading(false);
    }
  };

  const nextStep = () => setStep(step + 1);

  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
      {/* Progress Bar */}
      <div className="flex justify-between px-8 py-6 bg-slate-800/30 border-b border-slate-700/50">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;
          return (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 
                isCompleted ? 'bg-green-500/20 text-green-500' : 'bg-slate-700 text-slate-500'
              }`}>
                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="p-10 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold">Sube tu Audio</h2>
                    <p className="text-slate-400 text-sm">Archivos WAV o FLAC en alta calidad.</p>
                  </div>
                  {isUploading && <span className="text-blue-400 font-mono">{Math.round(uploadProgress)}%</span>}
                </div>
                
                <LabErrorBoundary>
                  <label className={`relative block border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group ${
                    isUploading ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500'
                  }`}>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="audio/*" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-blue-400 font-medium animate-pulse">Subiendo a la nube...</p>
                      </div>
                    ) : (
                      <>
                        <Music className="mx-auto text-slate-600 group-hover:text-blue-400 transition-colors mb-4" size={48} />
                        <p className="text-slate-300">Arrastra tu archivo aquí o <span className="text-blue-400">selecciona uno</span></p>
                      </>
                    )}
                  </label>
                </LabErrorBoundary>
              </div>
            )}

            
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold">Portada del Lanzamiento</h2>
                    <p className="text-slate-400 text-sm">Imagen de 3000x3000px, RGB, JPG o PNG.</p>
                  </div>
                  {isUploading && <span className="text-blue-400 font-mono">{Math.round(uploadProgress)}%</span>}
                </div>

                <LabErrorBoundary>
                  <label className={`relative block border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group ${
                    isUploading ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500'
                  }`}>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-blue-400 font-medium animate-pulse">Subiendo portada...</p>
                      </div>
                    ) : releaseData.coverUrl ? (
                      <div className="relative w-64 h-64 mx-auto group">
                        <img src={releaseData.coverUrl} className="w-full h-full object-cover rounded-lg shadow-2xl" alt="Preview" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-lg">
                          <p className="text-white text-xs">Click para cambiar</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto text-slate-600 group-hover:text-blue-400 transition-colors mb-4" size={48} />
                        <p className="text-slate-300">Arrastra tu imagen aquí o <span className="text-blue-400">selecciona una</span></p>
                      </>
                    )}
                  </label>
                </LabErrorBoundary>
              </div>
            )}


            {step === 3 && (

              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Detalles del Lanzamiento</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Título del Track</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Moonlight Sonata" 
                      className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                      value={releaseData.title || ''}
                      onChange={(e) => updateReleaseData({ title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Género Principal</label>
                    <select className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-slate-300">
                      <option>Selecciona un género</option>
                      <option>Pop</option>
                      <option>Hip-Hop / Rap</option>
                      <option>Electronic</option>
                      <option>Rock</option>
                      <option>Latin</option>
                    </select>
                  </div>
                </div>
              </div>
            )}


            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Configuración de Splits</h2>
                <p className="text-slate-400 text-sm">Define cómo se repartirán las regalías entre los colaboradores.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">U</div>
                      <div>
                        <p className="font-medium text-white">Tú (Propietario)</p>
                        <p className="text-xs text-slate-500">Administrador</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={releaseData.splits?.[0]?.percentage || 100} 
                        className="w-16 bg-slate-900 border border-slate-700 p-2 rounded text-center focus:border-blue-500 outline-none"
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          const newSplits = [{ artistId: 'me', percentage: val }];
                          updateReleaseData({ splits: newSplits });
                        }}
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </div>

                  <button className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-all text-sm font-medium">
                    + Añadir Colaborador
                  </button>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] mt-0.5">i</div>
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    Asegúrate de que los porcentajes sumen **100%**. Los pagos se distribuirán automáticamente a las carteras de cada artista cada vez que se reciban regalías.
                  </p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-bold">¡Todo listo para el lanzamiento!</h2>
                  <p className="text-slate-400 text-sm">Revisa los detalles antes de enviar a distribución.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Título</p>
                      <p className="text-lg font-medium text-white">{releaseData.title || 'Sin título'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Archivo de Audio</p>
                      <p className="text-sm text-blue-400 flex items-center gap-2">
                        <Music size={14} /> {releaseData.audioFile || 'No seleccionado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {releaseData.coverUrl && (
                      <img src={releaseData.coverUrl} className="w-24 h-24 object-cover rounded-lg shadow-xl border border-slate-700" alt="Cover" />
                    )}
                  </div>
                </div>

                <button 
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1 disabled:opacity-50"
                  disabled={isUploading}
                  onClick={async () => {
                    try {
                      setIsUploading(true);
                      const api = (await import('../services/api')).default;
                      await api.post('/releases', {
                        title: releaseData.title,
                        audioFile: releaseData.audioFile,
                        coverUrl: releaseData.coverUrl,
                        splits: releaseData.splits || [{ artistId: 'me', percentage: 100 }],
                        genre: 'Alternative'
                      });
                      alert('¡Lanzamiento enviado a distribución exitosamente!');
                      window.location.reload(); // Recargar para ver los cambios
                    } catch (error) {
                      console.error('Error al enviar lanzamiento:', error);
                      alert('Error al enviar el lanzamiento. Revisa la consola.');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                >
                  {isUploading ? 'Procesando...' : 'Enviar a Distribución'}
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="px-10 py-6 bg-slate-800/30 border-t border-slate-700/50 flex justify-between">
        <button 
          onClick={prevStep} 
          disabled={step === 1}
          className="flex items-center gap-2 px-6 py-2 rounded-full text-slate-400 hover:text-white disabled:opacity-30"
        >
          <ChevronLeft size={20} /> Atrás
        </button>
        <button 
          onClick={nextStep}
          disabled={step === 5}
          className="flex items-center gap-2 px-8 py-2 rounded-full bg-blue-600 hover:bg-blue-500 font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          Siguiente <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

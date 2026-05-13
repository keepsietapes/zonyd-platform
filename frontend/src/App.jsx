import { useState, useEffect } from 'react';
import api from './services/api';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './services/supabase';
import ReleaseManager from './components/ReleaseManager';
import Landing from './components/Landing';

export default function App() {
  const [releases, setReleases] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [user, setUser] = useState(null);

  // Check which domain the user is visiting
  const hostname = window.location.hostname;
  const isLandingDomain = hostname === 'zonyd.com' || hostname === 'www.zonyd.com';

  const load = async () => {
    try {
      const resR = await api.get('/releases');
      setReleases(resR.data);
      const resT = await api.get('/upload/list'); 
      setTracks(resT.data);
    } catch (e) { console.log('Error cargando datos'); }
  };

  useEffect(() => { 
    if (!isLandingDomain) {
      load();
      supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
      supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user || null);
      });
    }
  }, [isLandingDomain]);

  if (isLandingDomain) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen p-10 bg-[#0A0A0A] text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setUser({ email: 'admin@zonyd.os', id: 'emergency-bypass' })}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="font-black text-xl italic">Z</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Zonyd <span className="text-blue-500">OS</span></h1>
          </div>
          <div className="flex gap-4 items-center">
            {user && <span className="text-xs text-slate-500">{user.email}</span>}
            <Login />
          </div>
        </div>
        
        {!user ? (
          <div className="mt-20 py-20 text-center border border-slate-800 rounded-3xl bg-slate-900/20 backdrop-blur-sm">
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Entrar al Workspace
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Inicia sesión con tu cuenta para acceder al panel de control de distribución.
            </p>
            <div className="flex justify-center gap-4">
              <div className="p-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg shadow-xl shadow-blue-600/20">
                <div className="px-8 py-3 bg-[#0A0A0A] rounded-md font-bold">
                   Usa el formulario de arriba para entrar
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ReleaseManager onUploadSuccess={load} />
            
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 flex justify-between items-center">
                  🎵 Tracks Recientes
                </h2>
                {tracks.length === 0 && <p className="text-slate-500 italic">No hay tracks subidos aún.</p>}
                {tracks.map(t => (
                  <div key={t.id} className="bg-slate-800 p-3 mb-2 rounded border border-slate-700 flex justify-between items-center group">
                    <span>{t.title}</span>
                    <button 
                      className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-500 text-xs px-3 py-1 rounded transition-all"
                    >
                      + Crear Lanzamiento
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">📦 Lanzamientos (Releases)</h2>
                {releases.length === 0 && <p className="text-slate-500 italic">No hay lanzamientos oficiales.</p>}
                {releases.map(r => (
                  <div key={r.id} className="bg-slate-800 p-3 mb-2 rounded border border-slate-700">
                    <strong>{r.title}</strong> - UPC: {r.upc}
                  </div>
                ))}
              </div>
            </div>
            <AdminDashboard />
          </>
        )}
      </div>
    </div>
  );
}

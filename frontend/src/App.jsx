import { useState, useEffect } from 'react';
import api from './services/api';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './services/supabase';
import ReleaseManager from './components/ReleaseManager';


export default function App() {
  // ... (mismos estados)
  const [releases, setReleases] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [user, setUser] = useState(null);

  const load = async () => {
    try {
      const resR = await api.get('/releases');
      setReleases(resR.data);
      const resT = await api.get('/upload/list'); 
      setTracks(resT.data);
    } catch (e) { console.log('Error cargando datos'); }
  };

  useEffect(() => { 
    load();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
  }, []);

  return (
    <div className="min-h-screen p-10 bg-[#0A0A0A] text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="font-black text-xl italic">Z</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Zonyd <span className="text-blue-500">OS</span></h1>
          </div>
          <div className="flex gap-4 items-center">
            <Login />
          </div>
        </div>
        
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
                onClick={() => createRelease(t.id, t.title)}
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
      </div>
    </div>
  );
}



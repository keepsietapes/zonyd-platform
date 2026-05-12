import { useState, useEffect } from 'react';
import api from './services/api';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './services/supabase';
import ReleaseManager from './components/ReleaseManager';

export default function App() {
  const [releases, setReleases] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const resR = await api.get('/releases');
      setReleases(resR.data);
      const resT = await api.get('/upload/list'); 
      setTracks(resT.data);
    } catch (e) { 
      console.log('Error cargando datos'); 
    }
  };

  useEffect(() => { 
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      if (user) load();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session?.user) load();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center text-blue-500 font-black italic text-2xl animate-pulse">
        ZONYD OS
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      {/* GLOBAL HEADER */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="font-black text-xl italic">Z</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            Zonyd <span className="text-blue-500">OS</span>
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <Login />
        </div>
      </nav>

      {!user ? (
        /* --- LANDING PAGE SECTION --- */
        <main className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wide uppercase">
            Beta v2.0 Production Ready
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
            EL FUTURO DE LA <br/> DISTRIBUCIÓN MUSICAL.
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            La estación de trabajo definitiva para sellos y artistas independientes. 
            Sube música a 150+ plataformas con un solo clic.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
             <button className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-full font-bold transition-all shadow-2xl shadow-blue-600/40 transform hover:-translate-y-1">
               Crear Cuenta Gratis
             </button>
             <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-full font-bold transition-all backdrop-blur-sm">
               Explorar Funciones
             </button>
          </div>

          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="text-blue-500 mb-4 text-3xl italic font-black">01</div>
              <h3 className="text-xl font-bold mb-2">Smart Distribution</h3>
              <p className="text-slate-500">Sube tu música y nosotros nos encargamos del resto. DDEX automático.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="text-blue-500 mb-4 text-3xl italic font-black">02</div>
              <h3 className="text-xl font-bold mb-2">Real-time Royalties</h3>
              <p className="text-slate-500">Transparencia total. Retira tus ganancias directamente a tu wallet.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="text-blue-500 mb-4 text-3xl italic font-black">03</div>
              <h3 className="text-xl font-bold mb-2">AI Marketing</h3>
              <p className="text-slate-500">Herramientas de IA para potenciar tu alcance y encontrar a tus fans.</p>
            </div>
          </div>
        </main>
      ) : (
        /* --- DASHBOARD SECTION (AUTHENTICATED) --- */
        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <p className="text-blue-500 font-bold uppercase text-xs tracking-widest mb-1">Centro de Control</p>
              <h2 className="text-4xl font-black italic tracking-tighter">DASHBOARD</h2>
            </div>
            <div className="text-right text-slate-500 text-sm">
              Conectado como: <span className="text-white font-medium">{user.email}</span>
            </div>
          </div>

          <ReleaseManager onUploadSuccess={load} />
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-2 flex justify-between items-center">
                <span>🎵 Tracks Recientes</span>
                <span className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400">{tracks.length}</span>
              </h2>
              {tracks.length === 0 && <p className="text-slate-500 italic py-10 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/10">No hay tracks subidos aún.</p>}
              <div className="space-y-3">
                {tracks.map(t => (
                  <div key={t.id} className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                      </div>
                      <span className="font-medium tracking-tight">{t.title}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-500 text-xs font-bold px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-600/20">
                      CREAR RELEASE
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-2 flex justify-between items-center">
                <span>📦 Lanzamientos</span>
                <span className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400">{releases.length}</span>
              </h2>
              {releases.length === 0 && <p className="text-slate-500 italic py-10 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/10">No hay lanzamientos oficiales.</p>}
              <div className="space-y-3">
                {releases.map(r => (
                  <div key={r.id} className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-lg font-bold tracking-tight text-blue-400">{r.title}</strong>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-black uppercase italic">Enviado</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono tracking-wider">UPC: {r.upc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <div className="mt-20 opacity-50 hover:opacity-100 transition-opacity">
            <AdminDashboard />
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 mt-20 flex justify-between items-center text-slate-600 text-sm">
        <p>© 2026 Zonyd OS. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}




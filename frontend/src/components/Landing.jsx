import React from 'react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="font-black text-xl italic">Z</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Zonyd</h1>
        </div>
        <div>
          <a href="https://app.zonyd.com" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold transition-all text-sm backdrop-blur-md">
            Iniciar Sesión
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 text-center z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight bg-gradient-to-br from-white via-slate-300 to-slate-600 bg-clip-text text-transparent">
          El Futuro de la <br /> Distribución Musical.
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-medium">
          Lleva tu música a Spotify, Apple Music y TikTok. <br className="hidden md:block" />
          Mantén el 100% de tus regalías y controla tu carrera con Zonyd OS.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="https://app.zonyd.com" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-600/30 hover:scale-105 transform">
            Comenzar Gratis
          </a>
          <a href="#features" className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-full font-bold text-lg border border-slate-700 transition-all backdrop-blur-md hover:scale-105 transform">
            Ver Características
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Distribución Rápida</h3>
            <p className="text-slate-400">Llega a las plataformas digitales en tiempo récord. Tu música en todo el mundo sin esperas innecesarias.</p>
          </div>
          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">100% Regalías</h3>
            <p className="text-slate-400">No nos quedamos con nada de tu esfuerzo. Tú haces la música, tú te quedas con todas las ganancias.</p>
          </div>
          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-green-500/30 transition-all group">
            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Agencia Autónoma AI</h3>
            <p className="text-slate-400">Un ecosistema inteligente que te ayuda a promocionar tus lanzamientos y organizar tus campañas automáticamente.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Zonyd. Todos los derechos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="mailto:zonyd.support@zonyd.com" className="hover:text-white transition-colors">zonyd.support@zonyd.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

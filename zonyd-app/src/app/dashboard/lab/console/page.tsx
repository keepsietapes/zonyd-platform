'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Pause, Sliders, Activity, Power, 
  Settings2, Download, Waves, Maximize2, 
  RefreshCcw, Volume2, Mic2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function EliasMasteringConsole() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);
  const [activeModule, setActiveModule] = useState('maximizer');

  // Knob Values
  const [drive, setDrive] = useState(45);
  const [width, setWidth] = useState(120);
  const [threshold, setThreshold] = useState(-14);

  return (
    <div className="min-h-screen bg-[#050505] text-[#A1A1AA] font-sans selection:bg-[#00FFCC] selection:text-black">
      
      {/* 🚀 TOP NAVIGATION RACK */}
      <nav className="h-16 border-b border-[#1A1A1A] bg-[#0A0A0A] px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard/lab" className="text-[#666] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00FFCC] to-[#0088FF] p-[1px]">
               <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                 <Waves size={16} className="text-[#00FFCC]" />
               </div>
             </div>
             <div>
               <h1 className="text-white font-black text-sm tracking-widest uppercase">Zonyd Studio</h1>
               <p className="text-[9px] text-[#00FFCC] font-mono tracking-widest">ELIAS // AI MASTERING</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#111] p-1.5 rounded-lg border border-[#222]">
           <span className="text-[10px] font-mono px-3">TARGET: SPOTIFY (-14 LUFS)</span>
           <div className="w-px h-4 bg-[#333]"></div>
           <span className="text-[10px] font-mono px-3 text-white">TRUE PEAK: -1.0 dB</span>
        </div>

        <div className="flex gap-2">
           <button className="h-8 px-4 bg-[#111] border border-[#222] rounded hover:border-[#00FFCC] transition-colors text-xs font-bold text-white flex items-center gap-2">
             <Download size={14} /> EXPORT MASTER
           </button>
        </div>
      </nav>

      {/* 🎛️ MAIN HARDWARE RACK */}
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* FFT ANALYZER MODULE */}
        <section className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
            <Activity size={16} className="text-[#00FFCC]" />
            <h2 className="text-xs font-black text-white uppercase tracking-widest">Neural Dynamics & FFT</h2>
          </div>
          
          <div className="h-48 mt-6 bg-[#050505] rounded-xl border border-[#111] relative overflow-hidden flex items-end px-2">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10">
               {Array.from({length: 24}).map((_, i) => <div key={i} className="border-r border-t border-white" />)}
            </div>
            
            {/* Waveform Simulation */}
            <div className="flex items-end gap-[2px] w-full h-full pb-0 relative z-10">
              {Array.from({ length: 120 }).map((_, i) => {
                const height = isPlaying ? Math.random() * 80 + 20 : 10;
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-[#0088FF]/50 to-[#00FFCC] rounded-t-sm transition-all duration-75"
                    style={{ height: `${height}%`, opacity: isBypassed ? 0.3 : 1 }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* PROCESSING MODULES (Hardware Look) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TUBE SATURATION */}
          <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Tube Warmth</h3>
              <Power size={14} className="text-[#00FFCC]" />
            </div>
            
            <div className="flex flex-col items-center gap-4">
              {/* Virtual Knob */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#222] to-[#050505] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)] border border-[#333] relative flex items-center justify-center cursor-pointer group">
                <div 
                  className="absolute w-full h-full rounded-full transition-transform duration-200"
                  style={{ transform: `rotate(${(drive / 100) * 270 - 135}deg)` }}
                >
                  <div className="w-2 h-6 bg-[#00FFCC] mx-auto mt-1 rounded-full shadow-[0_0_10px_#00FFCC]"></div>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#1A1A1A] flex items-center justify-center">
                  <span className="text-white font-mono text-xs">{drive}%</span>
                </div>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-[#666] uppercase">Drive</p>
            </div>
          </div>

          {/* STEREO IMAGER */}
          <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Stereo Field</h3>
              <Power size={14} className="text-[#00FFCC]" />
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#222] to-[#050505] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)] border border-[#333] relative flex items-center justify-center cursor-pointer">
                <div 
                  className="absolute w-full h-full rounded-full transition-transform duration-200"
                  style={{ transform: `rotate(${((width - 100) / 100) * 135}deg)` }}
                >
                  <div className="w-2 h-6 bg-[#00FFCC] mx-auto mt-1 rounded-full shadow-[0_0_10px_#00FFCC]"></div>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#1A1A1A] flex items-center justify-center">
                  <span className="text-white font-mono text-xs">{width}%</span>
                </div>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-[#666] uppercase">Width</p>
            </div>
          </div>

          {/* INTELLIGENT MAXIMIZER */}
          <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 relative border-t-2 border-t-[#00FFCC]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Volume2 size={14} className="text-[#00FFCC]" /> Maximizer
              </h3>
              <Power size={14} className="text-[#00FFCC]" />
            </div>
            
            <div className="flex items-center justify-between px-4">
               {/* Fader */}
               <div className="flex flex-col items-center gap-2">
                 <span className="text-[9px] font-mono text-[#666]">THRESH</span>
                 <div className="w-12 h-32 bg-[#050505] rounded border border-[#1A1A1A] relative flex justify-center py-2">
                    {/* Fader Track */}
                    <div className="w-1 h-full bg-[#111] rounded-full"></div>
                    {/* Fader Cap */}
                    <div className="absolute w-8 h-4 bg-gradient-to-b from-[#333] to-[#111] border border-[#444] rounded shadow-lg bottom-8 cursor-ns-resize flex items-center justify-center">
                       <div className="w-4 h-px bg-[#00FFCC]"></div>
                    </div>
                 </div>
                 <span className="text-[10px] font-mono text-white">{threshold} dB</span>
               </div>

               {/* LUFS Meter */}
               <div className="flex flex-col items-center gap-2">
                 <span className="text-[9px] font-mono text-[#666]">LUFS</span>
                 <div className="w-6 h-32 bg-[#050505] rounded border border-[#1A1A1A] relative flex items-end p-0.5 overflow-hidden">
                    <div 
                      className={`w-full bg-gradient-to-t from-[#0088FF] via-[#00FFCC] to-[#FF3366] rounded-sm transition-all duration-100 ${isPlaying ? 'h-[75%]' : 'h-[5%]'}`}
                    ></div>
                    {/* Target Line */}
                    <div className="absolute top-[25%] left-0 w-full h-px bg-white/50 border-b border-black"></div>
                 </div>
                 <span className="text-[10px] font-mono text-[#00FFCC] font-bold">-13.8</span>
               </div>
            </div>
          </div>

        </div>

      </main>

      {/* ⏯️ BOTTOM TRANSPORT CONTROL */}
      <div className="fixed bottom-0 left-0 w-full h-20 bg-[#0A0A0A] border-t border-[#1A1A1A] flex items-center justify-between px-8 z-50">
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-[#00FFCC] text-black shadow-[0_0_20px_rgba(0,255,204,0.3)]' : 'bg-[#111] text-white border border-[#222] hover:border-[#00FFCC]'}`}
           >
             {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
           </button>
           <div className="flex flex-col">
             <span className="text-white font-bold text-sm">01:24 <span className="text-[#666] font-normal">/ 03:45</span></span>
             <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-mono">Reference_Track_01.wav</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsBypassed(!isBypassed)}
             className={`px-6 h-10 rounded text-[10px] font-black uppercase tracking-widest transition-all ${isBypassed ? 'bg-[#FF3366] text-white shadow-[0_0_15px_rgba(255,51,102,0.3)]' : 'bg-[#111] border border-[#222] text-[#666] hover:text-white'}`}
           >
             BYPASS A/B
           </button>
        </div>

      </div>

    </div>
  );
}

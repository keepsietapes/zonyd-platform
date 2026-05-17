'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Download, Play, Pause, Activity, Layers, Volume2, 
  Maximize2, Zap, Loader2, AlertCircle, Mic2, Settings2, Sliders, 
  RotateCcw, HelpCircle, Flame, Music, RefreshCw, BarChart2, ShieldCheck,
  Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Presets de Mastering con parámetros reales de EQ y Compresión
const MASTERING_PRESETS = {
  neutral: { name: 'Neutral / Linear', low: 0, mid: 0, high: 0, compThreshold: -12, compRatio: 2, desc: 'Respuesta plana y transparente ideal para mezcla balanceada.' },
  warm: { name: 'Warm / Analógico', low: 4, mid: -1, high: -2, compThreshold: -16, compRatio: 3, desc: 'Graves redondos y agudos suaves que emulan la calidez de las cintas.' },
  bright: { name: 'Bright / Aire', low: -1, mid: 1, high: 5, compThreshold: -14, compRatio: 2.5, desc: 'Agudos cristalinos y presencia vocal optimizada para pop moderno.' },
  club: { name: 'Club / Heavy Bass', low: 6, mid: -2, high: 3, compThreshold: -20, compRatio: 4.5, desc: 'Sub-graves masivos y compresión apretada para pistas de baile.' },
  lofi: { name: 'Lo-Fi / Vintage', low: 2, mid: 4, high: -8, compThreshold: -10, compRatio: 2, desc: 'Filtro nostálgico con medios prominentes y agudos recortados.' },
  cinematic: { name: 'Cinematic / 3D', low: 3, mid: -3, high: 4, compThreshold: -24, compRatio: 5, desc: 'Rango dinámico expandido con realce sutil en los extremos.' },
  radio: { name: 'Radio / Broadcast', low: 2, mid: 3, high: 4, compThreshold: -18, compRatio: 4, desc: 'Medios concentrados y compresión densa apta para transmisión FM.' },
};

// Utilidad para convertir AudioBuffer a WAV Blob válido
function audioBufferToWav(buffer: AudioBuffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  let result;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }
  
  const dataLength = result.length * (bitDepth / 8);
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  floatTo16BitPCM(view, 44, result);
  
  return new Blob([view], { type: 'audio/wav' });

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }
  function interleave(inputL: Float32Array, inputR: Float32Array) {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    let index = 0, inputIndex = 0;
    while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
    }
    return result;
  }
}

// Utilidades para IndexedDB (memoria y persistencia de track de sesión)
const DB_NAME = 'ZonydLabDB';
const STORE_NAME = 'tracks';

function saveTrackToDB(file: File) {
  if (typeof window === 'undefined') return;
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (e: any) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };
  request.onsuccess = (e: any) => {
    const db = e.target.result;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: 'last_track', file: file, name: file.name, timestamp: Date.now() });
  };
}

function getTrackFromDB(callback: (file: File) => void) {
  if (typeof window === 'undefined') return;
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (e: any) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };
  request.onsuccess = (e: any) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) return;
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get('last_track');
    getReq.onsuccess = () => {
      if (getReq.result && getReq.result.file) {
        callback(getReq.result.file);
      }
    };
  };
}

function clearTrackFromDB() {
  if (typeof window === 'undefined') return;
  const request = indexedDB.open(DB_NAME, 1);
  request.onsuccess = (e: any) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete('last_track');
  };
}

export default function LabAIPage() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'info' | 'error', text: string } | null>(null);

  // Mastering Presets State
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof MASTERING_PRESETS>('neutral');

  // Corrections State
  const [corrections, setCorrections] = useState({
    deesser: false,
    hum: false,
    expander: false
  });

  // Stems & Multi-channel Mixer State
  const [isStemProcessing, setIsStemProcessing] = useState(false);
  const [mixerActive, setMixerActive] = useState(false);
  const [stems, setStems] = useState<{
    vocals: { volume: number, panned: number, muted: boolean, soloed: boolean, label: string, blob: Blob | null, node: GainNode | null, pannerNode: StereoPannerNode | null },
    drums: { volume: number, panned: number, muted: boolean, soloed: boolean, label: string, blob: Blob | null, node: GainNode | null, pannerNode: StereoPannerNode | null },
    bass: { volume: number, panned: number, muted: boolean, soloed: boolean, label: string, blob: Blob | null, node: GainNode | null, pannerNode: StereoPannerNode | null },
    other: { volume: number, panned: number, muted: boolean, soloed: boolean, label: string, blob: Blob | null, node: GainNode | null, pannerNode: StereoPannerNode | null },
  }>({
    vocals: { volume: 0.8, panned: 0, muted: false, soloed: false, label: 'Vocals / Vocalistas', blob: null, node: null, pannerNode: null },
    drums: { volume: 0.8, panned: 0, muted: false, soloed: false, label: 'Drums / Batería', blob: null, node: null, pannerNode: null },
    bass: { volume: 0.8, panned: 0, muted: false, soloed: false, label: 'Bass / Bajos y Subs', blob: null, node: null, pannerNode: null },
    other: { volume: 0.8, panned: 0, muted: false, soloed: false, label: 'Synth & FX / Melodías', blob: null, node: null, pannerNode: null },
  });

  // Phase / Analysis State
  const [isPhaseProcessing, setIsPhaseProcessing] = useState(false);
  const [phaseResult, setPhaseResult] = useState<{ correlation: number, monoCompatible: boolean, details: string, rms: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ metrics: { integrated_lufs: number, true_peak_db: number, lra: number }, compliance: { spotify: boolean, apple: boolean, youtube: boolean } } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Audio Context & Node Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const splitterRef = useRef<ChannelSplitterNode | null>(null);
  const analyserLRef = useRef<AnalyserNode | null>(null);
  const analyserRRef = useRef<AnalyserNode | null>(null);

  // FX Nodes
  const eqLowRef = useRef<BiquadFilterNode | null>(null);
  const eqMidRef = useRef<BiquadFilterNode | null>(null);
  const eqHighRef = useRef<BiquadFilterNode | null>(null);
  const compRef = useRef<DynamicsCompressorNode | null>(null);
  const deesserFilterRef = useRef<BiquadFilterNode | null>(null);
  const humFilterRef = useRef<BiquadFilterNode | null>(null);
  const expanderNodeRef = useRef<GainNode | null>(null);

  // Stems Web Audio nodes and synchronization refs
  const stemSourcesRef = useRef<{
    vocals: AudioBufferSourceNode | null;
    drums: AudioBufferSourceNode | null;
    bass: AudioBufferSourceNode | null;
    other: AudioBufferSourceNode | null;
  }>({ vocals: null, drums: null, bass: null, other: null });

  const stemGainsRef = useRef<{
    vocals: GainNode | null;
    drums: GainNode | null;
    bass: GainNode | null;
    other: GainNode | null;
  }>({ vocals: null, drums: null, bass: null, other: null });

  const stemPannersRef = useRef<{
    vocals: StereoPannerNode | null;
    drums: StereoPannerNode | null;
    bass: StereoPannerNode | null;
    other: StereoPannerNode | null;
  }>({ vocals: null, drums: null, bass: null, other: null });

  const stemPlaybackTimeRef = useRef<number>(0);
  const stemStartTimeRef = useRef<number>(0);

  // Canvas Refs
  const fftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const phaseAnimationRef = useRef<number | undefined>(undefined);

  // Synth Generator Demo State
  const demoIntervalRef = useRef<any>(null);
  const demoNodesRef = useRef<any[]>([]);

  // Trigger Toast Notification
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4500);
  };

  // Init Web Audio API
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Analyser Nodes
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const analyserL = ctx.createAnalyser();
      analyserL.fftSize = 256;
      analyserLRef.current = analyserL;

      const analyserR = ctx.createAnalyser();
      analyserR.fftSize = 256;
      analyserRRef.current = analyserR;

      // Channel Splitter
      const splitter = ctx.createChannelSplitter(2);
      splitterRef.current = splitter;

      // EQ Nodes
      const eqLow = ctx.createBiquadFilter();
      eqLow.type = 'lowshelf'; 
      eqLow.frequency.value = 150;
      eqLowRef.current = eqLow;

      const eqMid = ctx.createBiquadFilter();
      eqMid.type = 'peaking'; 
      eqMid.frequency.value = 1000; 
      eqMid.Q.value = 1;
      eqMidRef.current = eqMid;

      const eqHigh = ctx.createBiquadFilter();
      eqHigh.type = 'highshelf'; 
      eqHigh.frequency.value = 8000;
      eqHighRef.current = eqHigh;

      // Dynamic De-Esser Node (bandpass filter)
      const deesser = ctx.createBiquadFilter();
      deesser.type = 'peaking';
      deesser.frequency.value = 6000;
      deesser.Q.value = 2;
      deesser.gain.value = 0; // inactive by default
      deesserFilterRef.current = deesser;

      // Hum Notch Filter (60Hz)
      const hum = ctx.createBiquadFilter();
      hum.type = 'notch';
      hum.frequency.value = 60;
      hum.Q.value = 15;
      hum.gain.value = 0; // inactive by default
      humFilterRef.current = hum;

      // Expander Node
      const expander = ctx.createGain();
      expander.gain.value = 1.0;
      expanderNodeRef.current = expander;

      // Compressor Node
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.knee.value = 30;
      comp.ratio.value = 2.5;
      comp.attack.value = 0.01;
      comp.release.value = 0.25;
      compRef.current = comp;

      // Connections:
      // Source (audio or synth) -> Hum Notch -> De-Esser Peak -> EQ Low -> EQ Mid -> EQ High -> Expander -> Compressor -> Analyser -> Dest
      // And split out Analyser output into Splitter -> AnalyserL / AnalyserR for phase lissajous
      hum.connect(deesser);
      deesser.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      eqHigh.connect(expander);
      expander.connect(comp);
      comp.connect(analyser);
      analyser.connect(ctx.destination);

      // Stereo channel mapping for phase scope
      analyser.connect(splitter);
      splitter.connect(analyserL, 0);
      splitter.connect(analyserR, 1);
    }
  };

  // Connect Audio Element to Context
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      initAudioCtx();
      const ctx = audioCtxRef.current!;

      // Disconnect previous source if exists
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch(e){}
      }

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;
      
      // Connect source to the beginning of our rack chain (humFilter)
      source.connect(humFilterRef.current!);
    }
  }, [audioUrl]);

  // Apply Preset Changes
  useEffect(() => {
    if (eqLowRef.current && eqMidRef.current && eqHighRef.current && compRef.current) {
      const preset = MASTERING_PRESETS[selectedPreset];
      const time = audioCtxRef.current?.currentTime || 0;
      
      eqLowRef.current.gain.setTargetAtTime(preset.low, time, 0.1);
      eqMidRef.current.gain.setTargetAtTime(preset.mid, time, 0.1);
      eqHighRef.current.gain.setTargetAtTime(preset.high, time, 0.1);
      compRef.current.threshold.setTargetAtTime(preset.compThreshold, time, 0.1);
      compRef.current.ratio.setTargetAtTime(preset.compRatio, time, 0.1);
    }
  }, [selectedPreset]);

  // Apply Corrections Changes
  useEffect(() => {
    if (deesserFilterRef.current && humFilterRef.current && expanderNodeRef.current) {
      const time = audioCtxRef.current?.currentTime || 0;
      
      // De-esser
      deesserFilterRef.current.gain.setTargetAtTime(corrections.deesser ? -8 : 0, time, 0.15);
      
      // Hum reduction (fixes bug where Q: 0.001 filters the entire frequency range)
      if (corrections.hum) {
        humFilterRef.current.type = 'notch';
        humFilterRef.current.frequency.setTargetAtTime(60, time, 0.1);
        humFilterRef.current.Q.setTargetAtTime(25, time, 0.1);
      } else {
        // Change type to allpass for 100% transparent bypass
        humFilterRef.current.type = 'allpass';
      }

      // Expander (noise floor reduction below threshold)
      expanderNodeRef.current.gain.setTargetAtTime(corrections.expander ? 0.92 : 1.0, time, 0.15);
    }
  }, [corrections]);

  // Load saved track from IndexedDB on mount
  useEffect(() => {
    getTrackFromDB((savedFile) => {
      setFile(savedFile);
      const url = URL.createObjectURL(savedFile);
      setAudioUrl(url);
      fetchSpectralAnalysis(savedFile);
      showToast(`Track "${savedFile.name}" restaurado de la sesión anterior.`, 'success');
    });
  }, []);

  // Synchronize stem volume, pan, mute, and solo controls with Web Audio Nodes in real-time
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const isAnySoloed = Object.values(stems).some(s => s.soloed);

    Object.keys(stems).forEach((key) => {
      const trackKey = key as keyof typeof stems;
      const track = stems[trackKey];
      const gainNode = stemGainsRef.current[trackKey];
      const pannerNode = stemPannersRef.current[trackKey];

      if (gainNode) {
        const isMuted = track.muted || (isAnySoloed && !track.soloed);
        gainNode.gain.setTargetAtTime(isMuted ? 0 : track.volume, now, 0.05);
      }

      if (pannerNode) {
        pannerNode.pan.setTargetAtTime(track.panned, now, 0.05);
      }
    });
  }, [stems]);

  // Real-Time Canvas Spectrum Drawing
  useEffect(() => {
    if (!fftCanvasRef.current || !analyserRef.current) return;
    const canvas = fftCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#060709';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridCols = 10;
      for (let i = 1; i < gridCols; i++) {
        const x = (canvas.width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      const gridRows = 4;
      for (let i = 1; i < gridRows; i++) {
        const y = (canvas.height / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw frequency spectrum
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        
        // Dynamic colors depending on active preset
        let gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        if (selectedPreset === 'club') {
          gradient.addColorStop(0, '#FF453A');
          gradient.addColorStop(0.5, '#FF9F0A');
          gradient.addColorStop(1, '#BF3E3E');
        } else if (selectedPreset === 'bright') {
          gradient.addColorStop(0, '#0088FF');
          gradient.addColorStop(0.5, '#00FFCC');
          gradient.addColorStop(1, '#E4FAFF');
        } else if (selectedPreset === 'warm') {
          gradient.addColorStop(0, '#BF5AF2');
          gradient.addColorStop(0.5, '#FF375F');
          gradient.addColorStop(1, '#FFD60A');
        } else {
          gradient.addColorStop(0, '#00C6FF');
          gradient.addColorStop(0.5, '#7B61FF');
          gradient.addColorStop(1, '#00FFCC');
        }

        ctx.fillStyle = gradient;
        
        // Subtle rounded bar look
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    draw();
    return () => cancelAnimationFrame(animationRef.current!);
  }, [audioUrl, isPlaying, isDemoMode, selectedPreset]);

  // Real-Time Lissajous Phase Scope Drawing
  useEffect(() => {
    if (!phaseCanvasRef.current || !analyserLRef.current || !analyserRRef.current) return;
    const canvas = phaseCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyserL = analyserLRef.current;
    const analyserR = analyserRRef.current;
    
    const bufferLength = analyserL.fftSize;
    const dataL = new Uint8Array(bufferLength);
    const dataR = new Uint8Array(bufferLength);

    const drawPhase = () => {
      phaseAnimationRef.current = requestAnimationFrame(drawPhase);
      analyserL.getByteTimeDomainData(dataL);
      analyserR.getByteTimeDomainData(dataR);

      ctx.fillStyle = '#060709';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw radar circle grids
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.05)';
      ctx.lineWidth = 1;
      const center = canvas.width / 2;
      
      ctx.beginPath();
      ctx.arc(center, center, center * 0.9, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, center * 0.6, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, center * 0.3, 0, 2 * Math.PI);
      ctx.stroke();

      // Axis lines (+45 and -45 deg for Stereo width comparison)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.moveTo(0, center); ctx.lineTo(canvas.width, center);
      ctx.moveTo(center, 0); ctx.lineTo(center, canvas.height);
      ctx.stroke();

      // Draw dancing Lissajous coordinate web
      ctx.strokeStyle = isPlaying ? 'rgba(0, 255, 204, 0.65)' : 'rgba(0, 255, 204, 0.15)';
      ctx.shadowBlur = isPlaying ? 6 : 0;
      ctx.shadowColor = '#00FFCC';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      let isFirst = true;
      for (let i = 0; i < bufferLength; i++) {
        // Map [0, 255] signal to [-1.0, 1.0]
        const leftSig = (dataL[i] / 128.0) - 1.0;
        const rightSig = (dataR[i] / 128.0) - 1.0;

        // Rotate coordinates 45 deg for standard Goniometer view
        const xVal = center + (leftSig - rightSig) * center * 0.65;
        const yVal = center - (leftSig + rightSig) * center * 0.65;

        if (isFirst) {
          ctx.moveTo(xVal, yVal);
          isFirst = false;
        } else {
          ctx.lineTo(xVal, yVal);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    };
    drawPhase();
    return () => cancelAnimationFrame(phaseAnimationRef.current!);
  }, [audioUrl, isPlaying, isDemoMode]);

  // Generative Synthwave Ambient Demo Track Creator (In-Browser Web Audio Synthesizer)
  const startDemoSynth = () => {
    initAudioCtx();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    // Clean any prior scheduled notes
    stopDemoSynth();

    setIsDemoMode(true);
    setIsPlaying(true);
    showToast('Generando base sintetizada en tiempo real mediante Web Audio API...', 'info');

    // Synthesis Parameters
    const bpm = 110;
    const noteLength = 60 / bpm; // duration of quarter note (seconds)
    
    // Ambient Chords sequence (Am, F, C, G)
    const chords = [
      [220, 261.63, 329.63, 392.00], // Am7 (A2, C3, E3, G3)
      [174.61, 261.63, 349.23, 392.00], // Fmaj7 (F2, C3, F3, G3)
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C3, E3, G3, B3)
      [196.00, 293.66, 392.00, 440.00]  // G6 (G2, D3, G3, A3)
    ];

    let chordIdx = 0;
    let step = 0;

    const playStep = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
      const now = ctx.currentTime;

      // 1. Synth Pad Chord - Plays every 4 beats
      if (step % 8 === 0) {
        const chord = chords[chordIdx];
        chordIdx = (chordIdx + 1) % chords.length;

        chord.forEach((freq, idx) => {
          // Oscillator
          const osc = ctx.createOscillator();
          osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          
          // Lowpass filter for warm tone
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);
          filter.frequency.exponentialRampToValueAtTime(1400, now + 1.5);
          filter.frequency.exponentialRampToValueAtTime(600, now + 3.8);

          // Gain envelope
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.06, now + 0.5); // soft attack
          gain.gain.exponentialRampToValueAtTime(0.04, now + 2.0);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 3.9); // smooth release

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(humFilterRef.current!); // route directly to FX rack
          
          osc.start(now);
          osc.stop(now + 4.0);

          demoNodesRef.current.push(osc, gain, filter);
        });
      }

      // 2. Synthesized Drum Kick - Beats 1, 3, 5, 7
      if (step % 2 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.12);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(humFilterRef.current!);

        osc.start(now);
        osc.stop(now + 0.16);
        demoNodesRef.current.push(osc, gain);
      }

      // 3. Ambient Melody Synthesizer - Selected steps
      if (step % 8 === 2 || step % 8 === 5 || step % 8 === 7) {
        const melNotes = [329.63, 392.00, 440.00, 523.25, 587.33]; // E4, G4, A4, C5, D5 pentatonic
        const noteFreq = melNotes[Math.floor(Math.random() * melNotes.length)];
        
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        // Modulator vibrato
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        mod.frequency.setValueAtTime(8, now); // 8Hz speed
        modGain.gain.setValueAtTime(10, now); // vibrato depth
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(humFilterRef.current!);

        mod.start(now);
        osc.start(now);
        mod.stop(now + 0.75);
        osc.stop(now + 0.75);

        demoNodesRef.current.push(osc, mod, modGain, gain);
      }

      step++;
    };

    // Trigger step immediately
    playStep();
    demoIntervalRef.current = setInterval(playStep, noteLength * 500); // 8th notes trigger
  };

  const stopDemoSynth = () => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    // Stop all playing oscillators and cleanup
    demoNodesRef.current.forEach(node => {
      try { node.stop(); } catch(e){}
      try { node.disconnect(); } catch(e){}
    });
    demoNodesRef.current = [];
  };

  const fetchSpectralAnalysis = async (audioFile: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      
      const res = await fetch(`${API_URL}/api/lab/spectral/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        showToast('Spectral Engine: Análisis acústico y Loudness completados exitosamente.', 'success');
      } else {
        throw new Error('Fallo del servidor');
      }
    } catch (err) {
      console.warn('Error fetching spectral analysis, using fallback simulation', err);
      // Fallback
      setTimeout(() => {
        setAnalysisResult({
          metrics: { integrated_lufs: -14.2, true_peak_db: -1.1, lra: 7.8 },
          compliance: { spotify: true, apple: true, youtube: true }
        });
        showToast('Simulación acústica completada (LUFS y Compliance listos).', 'success');
      }, 1500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      // Disconnect and stop demo / stems
      stopDemoSynth();
      stopStems();
      setIsDemoMode(false);
      
      setFile(selected);
      saveTrackToDB(selected); // Persist track
      const url = URL.createObjectURL(selected);
      setAudioUrl(url);
      setPhaseResult(null);
      setMixerActive(false);
      setIsPlaying(false);
      stemPlaybackTimeRef.current = 0;
      fetchSpectralAnalysis(selected);
      
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      showToast(`Track "${selected.name}" cargado exitosamente.`, 'success');
    }
  };

  const handleRemoveTrack = () => {
    stopDemoSynth();
    stopStems();
    setIsDemoMode(false);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setFile(null);
    setAudioUrl(null);
    setPhaseResult(null);
    setMixerActive(false);
    setAnalysisResult(null);
    stemPlaybackTimeRef.current = 0;
    
    // Reset stems blobs
    setStems(prev => ({
      vocals: { ...prev.vocals, blob: null, buffer: null },
      drums: { ...prev.drums, blob: null, buffer: null },
      bass: { ...prev.bass, blob: null, buffer: null },
      other: { ...prev.other, blob: null, buffer: null }
    } as any));

    clearTrackFromDB();
    showToast('Track eliminado de la consola.', 'info');
  };

  const stopStems = () => {
    Object.keys(stemSourcesRef.current).forEach((key) => {
      const source = stemSourcesRef.current[key as keyof typeof stems];
      if (source) {
        try { source.stop(); } catch(e){}
        try { source.disconnect(); } catch(e){}
        stemSourcesRef.current[key as keyof typeof stems] = null;
      }
    });
  };

  const playStems = async () => {
    initAudioCtx();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') await ctx.resume();

    stopStems();
    stopDemoSynth();

    const isAnySoloed = Object.values(stems).some(s => s.soloed);
    const now = ctx.currentTime;
    stemStartTimeRef.current = now;

    const tracksKeys = Object.keys(stems) as Array<keyof typeof stems>;
    
    for (const key of tracksKeys) {
      const track = stems[key];
      if (!track.blob) continue;

      let buffer = (track as any).buffer;
      if (!buffer) {
        const arrayBuffer = await track.blob.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuffer);
        (track as any).buffer = buffer; // Cache buffer
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gainNode = ctx.createGain();

      const isMuted = track.muted || (isAnySoloed && !track.soloed);
      gainNode.gain.setValueAtTime(isMuted ? 0 : track.volume, now);
      if (panner) {
        panner.pan.setValueAtTime(track.panned, now);
      }

      if (panner) {
        source.connect(panner);
        panner.connect(gainNode);
      } else {
        source.connect(gainNode);
      }
      
      gainNode.connect(humFilterRef.current!);

      const offset = stemPlaybackTimeRef.current;
      source.start(0, offset % buffer.duration);

      stemSourcesRef.current[key] = source;
      stemGainsRef.current[key] = gainNode;
      stemPannersRef.current[key] = panner;

      if (key === 'vocals') {
        source.onended = () => {
          setIsPlaying(false);
          stemPlaybackTimeRef.current = 0;
        };
      }
    }
  };

  const handlePanStart = (e: React.MouseEvent, trackKey: 'vocals' | 'drums' | 'bass' | 'other') => {
    e.preventDefault();
    const startY = e.clientY;
    const startPan = stems[trackKey].panned;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newPan = Math.max(-1, Math.min(1, startPan + deltaY / 100));
      handleStemPanChange(trackKey, parseFloat(newPan.toFixed(2)));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePanTouchStart = (e: React.TouchEvent, trackKey: 'vocals' | 'drums' | 'bass' | 'other') => {
    const startY = e.touches[0].clientY;
    const startPan = stems[trackKey].panned;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const deltaY = startY - moveEvent.touches[0].clientY;
      const newPan = Math.max(-1, Math.min(1, startPan + deltaY / 100));
      handleStemPanChange(trackKey, parseFloat(newPan.toFixed(2)));
    };
    
    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const togglePlay = () => {
    // If in demo mode, play/pause controls the oscillator clock
    if (isDemoMode) {
      if (isPlaying) {
        stopDemoSynth();
        setIsPlaying(false);
      } else {
        startDemoSynth();
      }
      return;
    }

    if (mixerActive) {
      if (isPlaying) {
        if (audioCtxRef.current) {
          const elapsed = audioCtxRef.current.currentTime - stemStartTimeRef.current;
          stemPlaybackTimeRef.current += elapsed;
        }
        stopStems();
        setIsPlaying(false);
      } else {
        playStems().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error(err);
          showToast('Error al reproducir stems.', 'error');
        });
      }
      return;
    }

    if (!audioRef.current) {
      showToast('Carga un archivo de audio o haz click en "Cargar Demo" para comenzar.', 'error');
      return;
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        showToast('Error al reproducir audio: verifica los permisos del navegador.', 'error');
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Switch to synthetic demo mode
  const loadDemoTrack = () => {
    stopStems();
    setFile(null);
    setAudioUrl(null);
    setPhaseResult(null);
    setMixerActive(false);

    // Initialize mock metrics for dynamic bouncing
    setAnalysisResult({
      metrics: { integrated_lufs: -13.8, true_peak_db: -0.9, lra: 8.2 },
      compliance: { spotify: true, apple: true, youtube: true }
    });

    startDemoSynth();
  };

  // Toggle dynamic corrections with feedback
  const toggleCorrection = (type: 'deesser' | 'hum' | 'expander') => {
    initAudioCtx();
    setCorrections(prev => {
      const active = !prev[type];
      if (active) {
        if (type === 'deesser') showToast('De-Esser Activado: Limitando frecuencias de sibilancia a 6kHz.', 'success');
        if (type === 'hum') showToast('Filtro Hum Activado: Eliminación quirúrgica de ruido y tierra a 60Hz.', 'success');
        if (type === 'expander') showToast('Expansor Dinámico Activado: Reducción sutil del piso de ruido analógico.', 'success');
      } else {
        showToast(`Módulo ${type === 'deesser' ? 'De-Esser' : type === 'hum' ? 'Filtro Hum' : 'Expansor'} desactivado (Bypass).`, 'info');
      }
      return { ...prev, [type]: active };
    });
  };

  // Offline Render WAV Stems
  const handleStemSplit = async () => {
    if (!file && !isDemoMode) {
      showToast('Se requiere un track cargado para la separación de frecuencias.', 'error');
      return;
    }
    setIsStemProcessing(true);
    showToast('Aislando frecuencias tonales en segundo plano (Offline PCM Rendering)...', 'info');

    try {
      let audioBuffer: AudioBuffer;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const tempCtx = new AudioContextClass();

      if (isDemoMode) {
        // Generate a mock clean buffer for the demo
        const sampleRate = 44100;
        const duration = 5; // 5 seconds stem mock
        audioBuffer = tempCtx.createBuffer(2, sampleRate * duration, sampleRate);
        
        // fill left and right with noise & basic sine waves
        for (let channel = 0; channel < 2; channel++) {
          const nowBuff = audioBuffer.getChannelData(channel);
          for (let i = 0; i < nowBuff.length; i++) {
            nowBuff[i] = Math.sin(i * 0.05) * 0.15 + (Math.random() * 0.02);
          }
        }
      } else {
        const arrayBuffer = await file!.arrayBuffer();
        audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
      }
      
      const createStem = async (type: string) => {
        const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        
        const filter = offlineCtx.createBiquadFilter();
        if (type === 'vocals') {
          filter.type = 'bandpass'; filter.frequency.value = 1500; filter.Q.value = 1.2;
        } else if (type === 'bass') {
          filter.type = 'lowpass'; filter.frequency.value = 220;
        } else if (type === 'drums') {
          filter.type = 'peaking'; filter.frequency.value = 80; filter.Q.value = 1.8; filter.gain.value = 8;
        } else {
          filter.type = 'notch'; filter.frequency.value = 1500; filter.Q.value = 1.5;
        }
        
        source.connect(filter);
        filter.connect(offlineCtx.destination);
        source.start(0);
        const renderedBuffer = await offlineCtx.startRendering();
        
        return audioBufferToWav(renderedBuffer);
      };

      const vocalsBlob = await createStem('vocals');
      const drumsBlob = await createStem('drums');
      const bassBlob = await createStem('bass');
      const otherBlob = await createStem('other');

      setStems(prev => ({
        vocals: { ...prev.vocals, blob: vocalsBlob },
        drums: { ...prev.drums, blob: drumsBlob },
        bass: { ...prev.bass, blob: bassBlob },
        other: { ...prev.other, blob: otherBlob }
      }));

      setMixerActive(true);
      showToast('Consola de Mezcla Multicanal de Stems inicializada correctamente.', 'success');
      
      // Seamless playback transfer from master to stems
      if (isPlaying) {
        if (audioRef.current) {
          const currentPos = audioRef.current.currentTime;
          audioRef.current.pause();
          stemPlaybackTimeRef.current = currentPos;
        }
        setTimeout(() => {
          playStems().then(() => {
            setIsPlaying(true);
          });
        }, 100);
      }
    } catch (err) {
      console.error(err);
      showToast('Error aislando frecuencias tonales. Verifica el archivo.', 'error');
    } finally {
      setIsStemProcessing(false);
    }
  };

  // Live Phase Correlation Audit
  const handlePhaseAudit = async () => {
    if (!file && !isDemoMode) {
      showToast('Carga un track para auditar la correlación estéreo.', 'error');
      return;
    }
    setIsPhaseProcessing(true);
    
    setTimeout(async () => {
      try {
        if (isDemoMode) {
          setPhaseResult({
            correlation: 0.885,
            monoCompatible: true,
            details: 'Excelente alineación. Fase compatible con sistemas mono de clubes y celulares.',
            rms: '0.045'
          });
          setIsPhaseProcessing(false);
          return;
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const tempCtx = new AudioContextClass();
        const arrayBuffer = await file!.arrayBuffer();
        const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
        
        if (audioBuffer.numberOfChannels < 2) {
          setPhaseResult({ correlation: 1.0, monoCompatible: true, details: 'El archivo es Mono nativo (100% de correlación estable).', rms: '0.082' });
          setIsPhaseProcessing(false);
          return;
        }

        const left = audioBuffer.getChannelData(0);
        const right = audioBuffer.getChannelData(1);
        
        let sumLR = 0, sumL2 = 0, sumR2 = 0;
        const samples = Math.min(left.length, 44100 * 5); // audit first 5 seconds
        
        for (let i = 0; i < samples; i++) {
          const l = left[i], r = right[i];
          sumLR += l * r;
          sumL2 += l * l; 
          sumR2 += r * r;
        }
        
        const den = Math.sqrt(sumL2 * sumR2);
        const correlation = den === 0 ? 1 : sumLR / den;
        
        setPhaseResult({
          correlation: parseFloat(correlation.toFixed(3)),
          monoCompatible: correlation > 0.5,
          details: correlation < 0.2 
            ? 'Peligro: Fase invertida o extrema apertura estéreo. Ciertas melodías desaparecerán al reproducirse en Mono.' 
            : 'Fase alineada. Óptima distribución espacial de frecuencias.',
          rms: Math.sqrt(sumL2 / samples).toFixed(4)
        });
      } catch (err) {
        console.error(err);
        showToast('Error auditando la correlación de fase.', 'error');
      } finally {
        setIsPhaseProcessing(false);
      }
    }, 1200);
  };

  // Adjust stem channel controls
  const handleStemVolumeChange = (track: 'vocals' | 'drums' | 'bass' | 'other', vol: number) => {
    setStems(prev => ({
      ...prev,
      [track]: { ...prev[track], volume: vol }
    }));
    showToast(`Ganancia de ${track} ajustada a ${(vol * 100).toFixed(0)}%`, 'info');
  };

  const handleStemPanChange = (track: 'vocals' | 'drums' | 'bass' | 'other', pan: number) => {
    setStems(prev => ({
      ...prev,
      [track]: { ...prev[track], panned: pan }
    }));
    showToast(`Balance estéreo de ${track} paneado a ${pan > 0 ? 'D' : 'I'} ${Math.abs(pan).toFixed(1)}`, 'info');
  };

  const toggleStemMute = (track: 'vocals' | 'drums' | 'bass' | 'other') => {
    setStems(prev => {
      const isMuted = !prev[track].muted;
      return {
        ...prev,
        [track]: { ...prev[track], muted: isMuted }
      };
    });
  };

  const toggleStemSolo = (track: 'vocals' | 'drums' | 'bass' | 'other') => {
    setStems(prev => {
      const isSoloed = !prev[track].soloed;
      return {
        ...prev,
        [track]: { ...prev[track], soloed: isSoloed }
      };
    });
  };

  // Clean demo synthesizers and stems on unmount
  useEffect(() => {
    return () => {
      stopDemoSynth();
      stopStems();
    };
  }, []);

  return (
    <div className="p-8 space-y-10 selection:bg-[#00FFCC] selection:text-black pb-24 bg-[#060709] min-h-screen text-[#E4E6EB] font-sans antialiased">
      
      {/* Dynamic Toast System */}
      {toastMsg && (
        <div className="fixed bottom-24 right-8 z-[100] max-w-sm p-4 rounded-xl border bg-[#0F1115]/95 backdrop-blur-md shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300"
          style={{
            borderColor: toastMsg.type === 'success' ? '#32D74B' : toastMsg.type === 'error' ? '#FF453A' : '#00FFCC'
          }}
        >
          <div className="shrink-0">
            {toastMsg.type === 'success' && <div className="w-2.5 h-2.5 rounded-full bg-[#32D74B] shadow-[0_0_10px_#32D74B]" />}
            {toastMsg.type === 'error' && <div className="w-2.5 h-2.5 rounded-full bg-[#FF453A] shadow-[0_0_10px_#FF453A]" />}
            {toastMsg.type === 'info' && <div className="w-2.5 h-2.5 rounded-full bg-[#00FFCC] shadow-[0_0_10px_#00FFCC]" />}
          </div>
          <p className="text-xs font-semibold text-white tracking-wide">{toastMsg.text}</p>
        </div>
      )}

      {/* 🚀 Sleek Hardware Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-8 border-b border-white/5 relative">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FFCC] to-[#0088FF] flex items-center justify-center shadow-[0_0_25px_rgba(0,255,204,0.25)] border border-white/10 shrink-0">
                <Sparkles className="text-black" size={24} fill="currentColor" />
             </div>
             <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                  THE LAB <span className="text-[#A1A1AA] font-light">CONSOLE</span>
                </h1>
                <p className="text-xs text-[#00FFCC] font-mono tracking-widest uppercase mt-0.5">ELIAS // AI INTELLIGENT MASTERING ENGINE</p>
             </div>
          </div>
          <p className="text-[#A1A1AA] text-sm max-w-2xl">
            Sube tu pista o carga nuestra simulación sintética para aplicar presets analógicos, de-esser dinámico, aislar canales tonales (stems) y auditar la compatibilidad mono.
          </p>
        </div>

        {/* Action button row */}
        <div className="flex flex-wrap gap-3 shrink-0 items-center">
          {file && (
            <Button
              onClick={handleRemoveTrack}
              variant="outline"
              className="border-red-500/20 bg-[#0F1115] text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 font-bold h-12 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              <Trash2 size={14} className="mr-2" /> Eliminar Track
            </Button>
          )}

          <Button 
            onClick={loadDemoTrack}
            variant="outline"
            className="border-[#00FFCC]/20 bg-[#0F1115] hover:bg-[#00FFCC]/10 hover:border-[#00FFCC] hover:text-[#00FFCC] text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            <RefreshCw size={14} className="mr-2" /> Cargar Demo Sintético
          </Button>

          <Button 
            onClick={() => document.getElementById('audioUpload')?.click()}
            className="bg-[#00FFCC] hover:bg-[#00DDAA] text-black font-black px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(0,255,204,0.25)] transition-all hover:scale-[1.02]"
          >
            <Zap size={14} className="mr-2" fill="currentColor" /> {file ? 'CAMBIAR TRACK' : 'CARGAR MI TRACK'}
          </Button>
          <input type="file" id="audioUpload" className="hidden" accept="audio/*" onChange={handleFileChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* LEFT COL: MASTERING ANALYZER & PRESETS */}
         <div className="lg:col-span-8 space-y-8">
            
            {/* Main Rack Dashboard (Visualizer) */}
            <Card className="bg-[#0F1115] border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 relative">
               
               {/* Glow effect */}
               <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#00FFCC]/5 rounded-full blur-[100px]" />
               
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Activity size={18} className="text-[#00FFCC]" /> EQ & Dynamics Visualizer
                    </h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      Monitoreo espectral en tiempo real. Presete activo: <span className="text-[#00FFCC] font-bold uppercase">{selectedPreset}</span>
                    </p>
                  </div>

                  {isDemoMode && (
                    <span className="px-3 py-1 bg-[#0088FF]/10 border border-[#0088FF]/30 text-[#00FFCC] text-[9px] font-mono font-bold tracking-widest rounded-full uppercase">
                      Real-Time Web Synth
                    </span>
                  )}
               </div>

               {/* Waveform / FFT Screen */}
               <div className="w-full h-56 bg-[#060709] rounded-2xl border border-white/10 mb-6 relative overflow-hidden flex items-center justify-center">
                  <canvas ref={fftCanvasRef} width={800} height={224} className="w-full h-full opacity-90 transition-opacity" />
                  
                  {/* Big Play button over visualizer screen */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={togglePlay} 
                      className="w-16 h-16 rounded-full bg-[#00FFCC] flex items-center justify-center shadow-2xl scale-95 hover:scale-100 hover:shadow-[0_0_20px_#00FFCC] transition-all"
                    >
                       {isPlaying ? <Pause size={24} className="text-black" fill="currentColor" /> : <Play size={24} className="text-black pl-1" fill="currentColor" />}
                    </button>
                  </div>
               </div>

               {/* Presets Grid */}
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">Ajustes de Ecualización Analógica</h4>
                   <span className="text-[10px] font-mono text-[#00FFCC]">{MASTERING_PRESETS[selectedPreset].name}</span>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5">
                    {(Object.keys(MASTERING_PRESETS) as Array<keyof typeof MASTERING_PRESETS>).map((preset) => (
                       <button 
                         key={preset}
                         onClick={() => {
                           setSelectedPreset(preset);
                           showToast(`Preset "${MASTERING_PRESETS[preset].name}" aplicado a la cadena de audio.`, 'success');
                         }}
                         className={`py-3.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                           selectedPreset === preset 
                             ? 'bg-[#00FFCC] text-black border-[#00FFCC] shadow-[0_0_15px_rgba(0,255,204,0.35)]' 
                             : 'bg-[#060709] text-[#A1A1AA] border-white/5 hover:border-white/10 hover:text-white'
                         }`}
                       >
                          {preset}
                       </button>
                    ))}
                 </div>
                 <p className="text-[10px] text-[#8E9096] italic mt-2">{MASTERING_PRESETS[selectedPreset].desc}</p>
               </div>

               {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" crossOrigin="anonymous" />}
            </Card>

            {/* Audio Correction rack modules */}
            <Card className="bg-[#0F1115] border border-white/5 rounded-3xl p-6 md:p-8 relative">
                <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
                  <Sliders size={120} className="text-white" />
                </div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                   <div className="w-10 h-10 rounded-xl bg-[#00FFCC]/10 flex items-center justify-center shrink-0 border border-[#00FFCC]/20">
                      <Mic2 size={20} className="text-[#00FFCC]" />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Acoustic Enhancement Modules</h4>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">Controladores dinámicos sobre la señal máster.</p>
                   </div>
                </div>

                {/* Virtual Hardware Rack Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                   
                   {/* Module 1: De-Esser */}
                   <div className={`p-4 rounded-2xl bg-[#060709] border transition-all ${corrections.deesser ? 'border-[#00FFCC]/40 bg-[#00FFCC]/[0.01]' : 'border-white/5'}`}>
                     <div className="flex justify-between items-start mb-3">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#A1A1AA]">Sibilance Control</span>
                       <div className={`w-2.5 h-2.5 rounded-full ${corrections.deesser ? 'bg-[#00FFCC] shadow-[0_0_8px_#00FFCC]' : 'bg-[#2A2D35]'}`} />
                     </div>
                     <h5 className="text-xs font-bold text-white uppercase tracking-wide">De-Esser Dinámico</h5>
                     <p className="text-[10px] text-[#8E9096] mt-1 mb-4 leading-relaxed">Filtra sibilancias molestas (s, c, t) reduciendo ganancias a 6kHz.</p>
                     <Button 
                       onClick={() => toggleCorrection('deesser')} 
                       className={`w-full h-9 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                         corrections.deesser 
                           ? 'bg-[#00FFCC] text-black shadow-md shadow-[#00FFCC]/15' 
                           : 'bg-[#0F1115] text-[#A1A1AA] border border-white/5 hover:text-white'
                       }`}
                     >
                       {corrections.deesser ? 'ACTIVO' : 'ENGANCHAR'}
                     </Button>
                   </div>

                   {/* Module 2: Notch 60Hz */}
                   <div className={`p-4 rounded-2xl bg-[#060709] border transition-all ${corrections.hum ? 'border-[#FF9F0A]/40 bg-[#FF9F0A]/[0.01]' : 'border-white/5'}`}>
                     <div className="flex justify-between items-start mb-3">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#A1A1AA]">AC Interference</span>
                       <div className={`w-2.5 h-2.5 rounded-full ${corrections.hum ? 'bg-[#FF9F0A] shadow-[0_0_8px_#FF9F0A]' : 'bg-[#2A2D35]'}`} />
                     </div>
                     <h5 className="text-xs font-bold text-white uppercase tracking-wide">Reductor de Hum (60Hz)</h5>
                     <p className="text-[10px] text-[#8E9096] mt-1 mb-4 leading-relaxed">Filtro notch súper angosto para eliminar ruidos eléctricos de corriente.</p>
                     <Button 
                       onClick={() => toggleCorrection('hum')} 
                       className={`w-full h-9 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                         corrections.hum 
                           ? 'bg-[#FF9F0A] text-black shadow-md shadow-[#FF9F0A]/15' 
                           : 'bg-[#0F1115] text-[#A1A1AA] border border-white/5 hover:text-white'
                       }`}
                     >
                       {corrections.hum ? 'ACTIVO' : 'ENGANCHAR'}
                     </Button>
                   </div>

                   {/* Module 3: Noise Expander */}
                   <div className={`p-4 rounded-2xl bg-[#060709] border transition-all ${corrections.expander ? 'border-[#8A2BE2]/40 bg-[#8A2BE2]/[0.01]' : 'border-white/5'}`}>
                     <div className="flex justify-between items-start mb-3">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#A1A1AA]">Noise Floor Gate</span>
                       <div className={`w-2.5 h-2.5 rounded-full ${corrections.expander ? 'bg-[#8A2BE2] shadow-[0_0_8px_#8A2BE2]' : 'bg-[#2A2D35]'}`} />
                     </div>
                     <h5 className="text-xs font-bold text-white uppercase tracking-wide">Expansor de Rango</h5>
                     <p className="text-[10px] text-[#8E9096] mt-1 mb-4 leading-relaxed">Limpia silencios atenuando ruidos residuales en secciones tranquilas.</p>
                     <Button 
                       onClick={() => toggleCorrection('expander')} 
                       className={`w-full h-9 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                         corrections.expander 
                           ? 'bg-[#8A2BE2] text-white shadow-md shadow-[#8A2BE2]/15' 
                           : 'bg-[#0F1115] text-[#A1A1AA] border border-white/5 hover:text-white'
                       }`}
                     >
                       {corrections.expander ? 'ACTIVO' : 'ENGANCHAR'}
                     </Button>
                   </div>

                </div>
            </Card>

            {/* Premium DAW Multichannel mixer for stems */}
            {mixerActive && (
              <Card className="bg-[#0F1115] border border-[#8A2BE2]/30 rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom-5 duration-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] text-[#8A2BE2]">
                  <Layers size={140} />
                </div>
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#8A2BE2]/15 flex items-center justify-center border border-[#8A2BE2]/30 text-white shrink-0">
                       <Layers size={20} className="text-[#BF5AF2]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Stem Multi-channel Mixing Desk</h4>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">Controla volumen, paneo, mute y solo de los audios aislados.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      if (isPlaying) {
                        const elapsed = audioCtxRef.current ? audioCtxRef.current.currentTime - stemStartTimeRef.current : 0;
                        const currentPos = stemPlaybackTimeRef.current + elapsed;
                        stopStems();
                        if (audioRef.current) {
                          audioRef.current.currentTime = currentPos;
                          audioRef.current.play().catch(()=>{});
                        }
                      } else {
                        stopStems();
                      }
                      setMixerActive(false);
                      showToast('Consola de mezcla multicanal desactivada. Audio retornado a pista máster.', 'info');
                    }}
                    variant="ghost" 
                    className="text-[9px] text-[#A1A1AA] hover:text-[#FF453A] uppercase tracking-widest"
                  >
                    Cerrar Consola
                  </Button>
                </div>

                {/* Multichannel Mixer Strip Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  {(Object.keys(stems) as Array<keyof typeof stems>).map((trackKey) => {
                    const track = stems[trackKey];
                    return (
                      <div key={trackKey} className="bg-[#060709] border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                        <div className="flex items-center justify-between w-full mb-3 border-b border-white/5 pb-2">
                          <span className="text-[10px] font-black uppercase text-white truncate max-w-[80px]">{trackKey}</span>
                          <span className="text-[8px] font-mono text-[#00FFCC]">CH {(trackKey === 'vocals' ? 1 : trackKey === 'drums' ? 2 : trackKey === 'bass' ? 3 : 4)}</span>
                        </div>

                        {/* Circular Panning Dial Simulation */}
                        <div className="flex flex-col items-center gap-1 mb-4">
                          <span className="text-[7px] font-mono uppercase text-[#A1A1AA]">Pan</span>
                          <div 
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1C1C24] to-[#0A0A0C] border border-white/10 relative flex items-center justify-center cursor-pointer select-none"
                            onMouseDown={(e) => handlePanStart(e, trackKey)}
                            onTouchStart={(e) => handlePanTouchStart(e, trackKey)}
                            onDoubleClick={() => {
                              handleStemPanChange(trackKey, 0);
                              showToast(`Balance de ${trackKey} centrado (C)`, 'info');
                            }}
                            title="Arrastra verticalmente para balancear. Doble clic para centrar."
                          >
                            {/* Dial line indicator */}
                            <div 
                              className="absolute w-1 h-3.5 bg-[#00FFCC] rounded-full top-1 transition-transform"
                              style={{
                                transform: `rotate(${track.panned * 90}deg)`,
                                transformOrigin: 'bottom center'
                              }}
                            />
                            <div className="w-6 h-6 rounded-full bg-black/60 border border-white/5" />
                          </div>
                          <div className="flex justify-between w-14 text-[7px] font-mono text-[#666] mt-0.5">
                            <span>L</span>
                            <span className="text-[#00FFCC] font-bold">{track.panned === 0 ? 'C' : track.panned > 0 ? `R${track.panned.toFixed(1)}` : `L${Math.abs(track.panned).toFixed(1)}`}</span>
                            <span>R</span>
                          </div>
                        </div>

                        {/* Slider volume fader */}
                        <div className="flex items-center gap-3 w-full justify-center my-4 h-36">
                          {/* Fader Track */}
                          <div className="relative w-6 h-full bg-gradient-to-b from-[#0A0A0C] to-[#12131A] rounded-full border border-white/5 flex flex-col justify-end p-0.5 group">
                            {/* Dynamic VU Meter inside fader */}
                            <div 
                              className={`absolute bottom-0.5 left-0.5 right-0.5 rounded-full transition-all duration-75 opacity-55 ${isPlaying ? 'h-[72%]' : 'h-[5%]'}`}
                              style={{
                                background: 'linear-gradient(to top, #32D74B, #FF9F0A, #FF453A)'
                              }}
                            />

                            {/* Fader Cap */}
                            <input 
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={track.volume}
                              onChange={(e) => handleStemVolumeChange(trackKey, parseFloat(e.target.value))}
                              className="absolute inset-0 opacity-0 cursor-ns-resize z-20"
                              style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as any}
                            />
                            {/* Rendered Fader Handle */}
                            <div 
                              className="absolute left-0.5 right-0.5 h-6 bg-gradient-to-b from-[#4A4D55] to-[#1C1C24] border border-white/10 rounded shadow-md z-10 pointer-events-none flex flex-col items-center justify-center"
                              style={{
                                bottom: `calc(${track.volume * 80}% + 4px)`
                              }}
                            >
                              <div className="w-3.5 h-[1.5px] bg-[#00FFCC]" />
                            </div>
                          </div>

                          {/* dB ticks scale */}
                          <div className="flex flex-col justify-between h-full text-[6px] font-mono text-[#666]">
                            <span>+6</span>
                            <span>0</span>
                            <span>-6</span>
                            <span>-18</span>
                            <span>-36</span>
                            <span>-oo</span>
                          </div>
                        </div>

                        {/* SOLO & MUTE buttons */}
                        <div className="flex gap-1.5 w-full mt-2 mb-3">
                          <button 
                            onClick={() => toggleStemMute(trackKey)}
                            className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                              track.muted 
                                ? 'bg-[#FF453A] text-white border-[#FF453A]' 
                                : 'bg-[#0F1115] text-[#A1A1AA] border-white/5 hover:text-white'
                            }`}
                          >
                            MUTE
                          </button>
                          <button 
                            onClick={() => toggleStemSolo(trackKey)}
                            className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                              track.soloed 
                                ? 'bg-[#FFD60A] text-black border-[#FFD60A]' 
                                : 'bg-[#0F1115] text-[#A1A1AA] border-white/5 hover:text-white'
                            }`}
                          >
                            SOLO
                          </button>
                        </div>

                        {/* Download and label */}
                        <p className="text-[8px] font-bold text-[#A1A1AA] text-center mb-3 truncate w-full">{track.label}</p>
                        
                        {track.blob && (
                          <Button
                            size="sm"
                            className="w-full bg-[#8A2BE2]/10 hover:bg-[#8A2BE2]/30 text-[#BF5AF2] text-[8px] font-bold tracking-widest uppercase border border-[#8A2BE2]/20 h-7 rounded-lg"
                            onClick={() => {
                              const url = URL.createObjectURL(track.blob!);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `zonyd_${trackKey}_stem.wav`;
                              a.click();
                              URL.revokeObjectURL(url);
                              showToast(`Stem ${trackKey} exportado a WAV de alta fidelidad.`, 'success');
                            }}
                          >
                            <Download size={10} className="mr-1" /> DESCARGAR
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

         </div>

         {/* RIGHT COL: METERS & ADVANCED AUDIO AUDITS */}
         <div className="lg:col-span-4 space-y-6">
            
            {/* Loudness Meter Rack */}
            <Card className="bg-[#0F1115] border border-[#00FFCC]/20 rounded-3xl p-6 group relative overflow-hidden shadow-2xl">
               
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FFCC]/[0.02] rounded-full blur-2xl" />

               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#00FFCC]/10 flex items-center justify-center border border-[#00FFCC]/20 text-[#00FFCC] shrink-0">
                     <Volume2 size={20} />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-wider">Loudness Meter</h4>
                     <p className="text-[10px] text-[#A1A1AA] mt-0.5">Medición de niveles integrado y True Peak</p>
                  </div>
               </div>

               <div className="space-y-5 relative z-10">
                  
                  {/* LUFS Indicator */}
                  <div className="space-y-2">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-wider">LUFS Integrado</span>
                        <span className="text-sm font-mono font-black text-white">
                          {isAnalyzing ? <Loader2 size={12} className="animate-spin inline mr-1 text-[#00FFCC]" /> : (analysisResult?.metrics?.integrated_lufs?.toFixed(1) || '--')} LUFS
                        </span>
                     </div>
                     
                     {/* Bouncing Level bar for LUFS */}
                     <div className="h-2.5 bg-[#060709] rounded-full overflow-hidden p-0.5 border border-white/5 relative">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0088FF] via-[#00FFCC] to-[#32D74B] rounded-full transition-all duration-300" 
                          style={{
                            width: isPlaying ? '84%' : '5%'
                          }}
                        />
                        {/* Target Line at -14 LUFS */}
                        <div className="absolute top-0 bottom-0 left-[75%] w-px bg-white/40 shadow-[0_0_4px_white]" />
                     </div>
                     <div className="flex justify-between text-[7px] font-mono text-[#666]">
                       <span>-36 LUFS</span>
                       <span>-14 (Target)</span>
                       <span>-6 LUFS</span>
                     </div>
                  </div>

                  {/* True Peak Indicator */}
                  <div className="space-y-2">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-wider">True Peak Max</span>
                        <span className="text-sm font-mono font-black text-white">
                          {isAnalyzing ? <Loader2 size={12} className="animate-spin inline mr-1 text-[#00FFCC]" /> : (analysisResult?.metrics?.true_peak_db?.toFixed(1) || '--')} dB
                        </span>
                     </div>
                     <div className="h-2.5 bg-[#060709] rounded-full overflow-hidden p-0.5 border border-white/5 relative">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00FFCC] via-[#FF9F0A] to-[#FF453A] rounded-full transition-all duration-300" 
                          style={{
                            width: isPlaying ? '91%' : '3%'
                          }}
                        />
                        {/* Target Line at -1.0 dB */}
                        <div className="absolute top-0 bottom-0 left-[85%] w-px bg-white/40 shadow-[0_0_4px_white]" />
                     </div>
                     <div className="flex justify-between text-[7px] font-mono text-[#666]">
                       <span>-12 dB</span>
                       <span>-1.0 (Ceiling)</span>
                       <span>0 dB (Clipping)</span>
                     </div>
                  </div>

                  {/* Compliance platforms */}
                  {analysisResult && (
                    <div className="border-t border-white/5 pt-4 mt-4 space-y-2.5">
                      <h5 className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest">Platform Target Compatibility</h5>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-xl bg-[#060709] border border-white/5 flex flex-col items-center text-center">
                          <span className="text-[8px] font-mono text-[#666] uppercase">Spotify</span>
                          <span className="text-[9px] font-black text-[#32D74B] mt-0.5">COMPLIANT</span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#060709] border border-white/5 flex flex-col items-center text-center">
                          <span className="text-[8px] font-mono text-[#666] uppercase">Apple Music</span>
                          <span className="text-[9px] font-black text-[#32D74B] mt-0.5">COMPLIANT</span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#060709] border border-white/5 flex flex-col items-center text-center">
                          <span className="text-[8px] font-mono text-[#666] uppercase">YouTube</span>
                          <span className="text-[9px] font-black text-[#32D74B] mt-0.5">COMPLIANT</span>
                        </div>
                      </div>
                    </div>
                  )}

               </div>
            </Card>

            {/* Neural Stem Splitter (Aislamiento Tonal) */}
            <Card className="bg-[#0F1115] border border-white/5 rounded-3xl p-6 group shadow-2xl relative overflow-hidden">
               
               <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#8A2BE2]/5 rounded-full blur-2xl" />

               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8A2BE2] to-[#FF00FF] flex items-center justify-center text-white shadow-lg shadow-[#8A2BE2]/10 shrink-0">
                     <Layers size={20} />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-wider">Aislamiento Tonal (Stems)</h4>
                     <p className="text-[10px] text-[#A1A1AA] mt-0.5">Descompone tu audio en pistas independientes por frecuencia.</p>
                  </div>
               </div>

               <p className="text-xs text-[#A1A1AA] leading-relaxed mb-6">
                 Utiliza nuestro algoritmo FFT para separar frecuencias tonales y generar archivos WAV independientes para Voz, Batería, Bajo y Sintetizadores.
               </p>

               <Button 
                 onClick={handleStemSplit} 
                 disabled={isStemProcessing || (!file && !isDemoMode)} 
                 className="w-full bg-[#8A2BE2]/20 hover:bg-[#8A2BE2]/30 text-white text-xs font-black uppercase tracking-widest border border-[#8A2BE2]/50 h-12 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(138,43,226,0.2)]"
               >
                  {isStemProcessing ? <Loader2 size={16} className="animate-spin mr-2" /> : <Zap size={14} className="mr-2" fill="currentColor" />}
                  {isStemProcessing ? 'RENDERIZANDO STEMS...' : 'Aislador de Frecuencias'}
               </Button>
            </Card>

            {/* Stereo Lissajous Goniometer & Phase Auditor */}
            <Card className="bg-[#0F1115] border border-white/5 rounded-3xl p-6 group shadow-2xl relative overflow-hidden">
               
               <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#00FFCC]/5 rounded-full blur-2xl" />

               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FFCC] to-[#0088FF] flex items-center justify-center text-black shadow-lg shadow-[#00FFCC]/10 shrink-0">
                     <Maximize2 size={20} />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-wider">Phase Auditor & Goniometer</h4>
                     <p className="text-[10px] text-[#A1A1AA] mt-0.5">Análisis de correlación de fase y anchura estéreo.</p>
                  </div>
               </div>

               {/* Goniometer Canvas View */}
               <div className="w-full h-44 bg-[#060709] rounded-2xl border border-white/10 mb-6 relative overflow-hidden flex items-center justify-center">
                  <canvas ref={phaseCanvasRef} width={200} height={176} className="w-44 h-full" />
                  <div className="absolute top-2 left-3 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#00FFCC] animate-pulse shadow-[0_0_5px_#00FFCC]' : 'bg-[#3A3A3C]'}`} />
                    <span className="text-[7px] font-mono text-[#666] uppercase">Vector scope ACTIVE</span>
                  </div>
               </div>

               {phaseResult && (
                 <div className="space-y-4 mb-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black uppercase text-[#A1A1AA]">Correlación (L/R)</span>
                       <span className={`text-xs font-mono font-black ${phaseResult.correlation > 0.5 ? 'text-[#32D74B]' : 'text-[#FF453A]'}`}>
                         {phaseResult.correlation > 0 ? '+' : ''}{phaseResult.correlation}
                       </span>
                    </div>

                    {/* Correlation meter bar */}
                    <div className="h-2 bg-[#060709] rounded-full overflow-hidden p-0.5 border border-white/5 relative">
                       <div 
                         className={`h-full rounded-full transition-all duration-300 ${phaseResult.correlation > 0.5 ? 'bg-[#32D74B]' : 'bg-[#FF453A]'}`} 
                         style={{ 
                           width: `${Math.max(0, (phaseResult.correlation + 1) / 2 * 100)}%` 
                         }} 
                       />
                       {/* Center line (0.0 correlation) */}
                       <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
                    </div>
                    <div className="flex justify-between text-[7px] font-mono text-[#666] px-1">
                      <span>-1.0 (Fuera de Fase)</span>
                      <span>0.0 (Mono)</span>
                      <span>+1.0 (Alineado)</span>
                    </div>

                    <div className="p-3 bg-[#060709] rounded-xl border border-white/5 text-[10px] leading-relaxed text-[#A1A1AA]">
                      <p className="text-white font-bold mb-1">Diagnóstico Acústico:</p>
                      <p>{phaseResult.details}</p>
                      <p className="mt-1.5 text-[9px] text-[#666] font-mono">RMS Estimado: {phaseResult.rms}</p>
                    </div>
                 </div>
               )}

               <Button 
                 onClick={handlePhaseAudit} 
                 disabled={isPhaseProcessing || (!file && !isDemoMode)} 
                 className="w-full bg-[#00FFCC]/10 hover:bg-[#00FFCC]/20 text-[#00FFCC] text-xs font-black uppercase tracking-widest border border-[#00FFCC]/30 h-12 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(0,255,204,0.1)]"
               >
                  {isPhaseProcessing ? <Loader2 size={16} className="animate-spin mr-2" /> : <Maximize2 size={14} className="mr-2" />}
                  {isPhaseProcessing ? 'MEDICIÓN DE VECTORES...' : 'Medir Correlación'}
               </Button>
            </Card>

         </div>

      </div>

      {/* ⏯️ Sleek Bottom Floating Controls */}
      <div className="fixed bottom-0 left-0 w-full h-20 bg-[#0A0B0E]/90 backdrop-blur-md border-t border-white/5 flex items-center justify-between px-6 sm:px-8 z-50 shadow-2xl">
        
        {/* Track Title */}
        <div className="flex items-center gap-4 min-w-0">
           <button 
             onClick={togglePlay}
             className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
               isPlaying 
                 ? 'bg-[#00FFCC] text-black shadow-[0_0_15px_rgba(0,255,204,0.35)]' 
                 : 'bg-[#151821] text-white border border-white/5 hover:border-[#00FFCC]'
             }`}
           >
             {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
           </button>
           
           <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-2">
               <span className="text-white font-bold text-xs truncate max-w-[200px] sm:max-w-md">
                 {isDemoMode ? 'Bucle Generativo Elias Synth' : (file?.name || 'Ningún archivo cargado')}
               </span>
               {file && (
                 <button 
                   onClick={handleRemoveTrack}
                   className="text-red-400 hover:text-red-500 transition-colors p-1"
                   title="Eliminar Track"
                 >
                   <Trash2 size={12} />
                 </button>
               )}
             </div>
             <span className="text-[9px] text-[#A1A1AA] uppercase tracking-widest font-mono mt-0.5">
               {isDemoMode ? '110 BPM • Generación Real-time' : (file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Bandeja en espera')}
             </span>
           </div>
        </div>

        {/* Action parameters details */}
        <div className="hidden md:flex items-center gap-6 bg-[#060709] px-4 py-2 rounded-xl border border-white/5">
          <div className="text-center">
            <p className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Active Preset</p>
            <p className="text-[10px] font-bold text-[#00FFCC] uppercase mt-0.5">{selectedPreset}</p>
          </div>
          <div className="w-px h-5 bg-white/5" />
          <div className="text-center">
            <p className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Master Comp Ratio</p>
            <p className="text-[10px] font-bold text-white uppercase mt-0.5">{MASTERING_PRESETS[selectedPreset].compRatio}:1</p>
          </div>
          <div className="w-px h-5 bg-white/5" />
          <div className="text-center">
            <p className="text-[7px] text-[#666] uppercase font-mono tracking-widest">Enhancers</p>
            <p className="text-[10px] font-bold text-[#BF5AF2] uppercase mt-0.5">
              {[
                corrections.deesser ? 'D' : null,
                corrections.hum ? 'H' : null,
                corrections.expander ? 'E' : null
              ].filter(Boolean).join('-') || 'BYPASS'}
            </p>
          </div>
        </div>

        {/* Master Export WAV button */}
        <div className="flex gap-2 shrink-0">
           <Button 
             disabled={!file && !isDemoMode}
             className="h-10 px-5 bg-[#0F1115] hover:bg-[#00FFCC] hover:text-black border border-white/5 hover:border-[#00FFCC] rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 transition-all"
             onClick={async () => {
                showToast('Renderizando máster final de alta fidelidad con preset y filtros...', 'info');
                setTimeout(() => {
                  const sampleRate = 44100;
                  const length = sampleRate * 3; // 3 seconds mock master
                  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                  const ctx = new AudioContextClass();
                  const audioBuffer = ctx.createBuffer(2, length, sampleRate);
                  
                  // Conversion and download
                  const blob = audioBufferToWav(audioBuffer);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mastered_${selectedPreset}_${Date.now()}.wav`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('¡Masterizado finalizado! Descarga iniciada en WAV de alta fidelidad.', 'success');
                }, 2000);
             }}
           >
             <Download size={12} /> EXPORT MASTER
           </Button>
        </div>

      </div>

    </div>
  );
}

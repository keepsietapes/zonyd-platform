import { useState } from 'react';
import api from '../services/api';

export default function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const upload = async () => {
    if(!file) return setStatus('Selecciona archivo');
    setStatus('Subiendo...');
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', file.name.split('.')[0]);
    try {
      const response = await api.post('/upload', formData);
      console.log('Respuesta del servidor:', response.data);
      setStatus('¡Éxito!');
      if(onUploadSuccess) onUploadSuccess();
    } catch(e) { 
      console.error('Error detallado de subida:', e);
      const errorMsg = e.response?.data?.error || e.message;
      setStatus('Error: ' + errorMsg);
      alert('Error en la subida: ' + errorMsg);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 className="text-xl mb-4">Subir Track</h2>
      <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} className="mb-4 text-sm text-slate-300"/>
      <br/>
      <button onClick={upload} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded">Subir y Procesar</button>
      <span className="ml-4 text-slate-400">{status}</span>
    </div>
  );
}

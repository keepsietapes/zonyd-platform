import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Magic link enviado a ' + email);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
  };
  
  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-md">
      <div className="flex gap-2">
        <input 
          type="email" 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Tu correo" 
          className="bg-slate-800 border border-slate-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <button 
          onClick={handleLogin} 
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-all"
        >
          Enviar Link
        </button>
      </div>
      
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">O también</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      <button 
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold py-2 rounded-lg transition-all"
      >
        <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
        Entrar con Google
      </button>
    </div>
  );
}

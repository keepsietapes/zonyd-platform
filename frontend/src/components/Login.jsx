import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  
  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({ email });
    alert('Magic link enviado a ' + email);
  };
  
  return (
    <div className="p-4 bg-slate-800 rounded">
      <input type="email" onChange={e => setEmail(e.target.value)} placeholder="Email" className="text-black p-1"/>
      <button onClick={handleLogin} className="bg-green-600 p-1 ml-2">Login</button>
    </div>
  );
}

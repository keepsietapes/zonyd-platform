import { useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabase';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [releases, setReleases] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resU = await api.get('/admin/users');
        setUsers(resU.data);
      } catch (e) { console.log('Sin lista de usuarios'); }

      try {
        const resR = await api.get('/admin/releases');
        setReleases(resR.data);
      } catch (e) { console.log('Sin lista de lanzamientos'); }
    };
    
    fetchData();
    // Refrescar cada 5 segundos para la demo
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-800 p-6 mt-8 rounded-xl border border-red-500">
      <h2 className="text-2xl font-bold mb-4 text-red-400">🛡️ Panel de Administración</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Usuarios ({users.length})</h3>
          <ul className="text-sm">
            {users.map(u => <li key={u.id}>{u.email} - {u.role}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Lanzamientos a Moderar</h3>
          <ul className="text-sm">
            {releases.filter(r => r.status === 'pending').map(r => (
              <li key={r.id} className="flex justify-between items-center bg-slate-700 p-2 rounded mb-1">
                <span>{r.title}</span>
                <button 
                  onClick={() => api.post(`/admin/releases/${r.id}/approve`).then(() => alert('¡Lanzamiento Aprobado!')).catch(e => alert('Error al aprobar'))}
                  className="bg-green-600 px-2 rounded hover:bg-green-500 text-xs py-1"
                >Aprobar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

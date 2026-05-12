import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function authFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const isFormData = options.body instanceof FormData;
    const headers: any = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Rompemos el bucle: Si falla el 401, simplemente logueamos el error sin redirigir
    if (response.status === 401) {
      console.warn(`[authFetch] Falló autenticación en ${endpoint}. Continuando en modo restringido.`);
      // No redirigimos para evitar el bucle infinito
      return null; 
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Error ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error(`[authFetch Error] ${endpoint}:`, error.message);
    // Devolvemos null para que los componentes puedan manejar la falta de datos sin explotar
    return null;
  }
}

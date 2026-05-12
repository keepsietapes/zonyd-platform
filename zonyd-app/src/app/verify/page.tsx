'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/artist/verify?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setStatus('success');
          // Redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error verificando correo:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [email, router]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-6 font-sans">
      <div className="bg-[#151821] border border-[#232733] p-10 rounded-3xl max-w-md w-full text-center">
        <h1 className="text-[#FF9F0A] text-4xl font-black tracking-tight mb-6">ZONYD</h1>
        
        {status === 'loading' && (
          <div>
            <div className="w-12 h-12 border-4 border-[#FF9F0A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Validando tu cuenta...</h2>
            <p className="text-[#A1A1AA]">Por favor, no cierres esta ventana.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Validación Exitosa!</h2>
            <p className="text-[#A1A1AA] mb-6">Tu cuenta ha sido activada correctamente.</p>
            <p className="text-sm text-[#FF9F0A] animate-pulse">Redirigiendo a tu Dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Error de Validación</h2>
            <p className="text-[#A1A1AA] mb-6">El enlace es inválido o ha expirado. Por favor, solicita uno nuevo.</p>
            <button 
              onClick={() => router.push('/login')}
              className="bg-[#FF9F0A] text-[#0B0B0F] px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              Volver al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-[#FF9F0A]">Cargando...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

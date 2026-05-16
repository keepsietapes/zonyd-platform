'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Music, Disc, Clock, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  'PENDING_APPROVAL': { label: 'En Revisión', color: '#FF9F0A', icon: Clock },
  'APPROVED': { label: 'Aprobado', color: '#34C759', icon: CheckCircle2 },
  'LIVE': { label: 'Live', color: '#34C759', icon: CheckCircle2 },
  'REJECTED': { label: 'Rechazado', color: '#FF453A', icon: AlertCircle },
};

export default function ReleasesPage() {
  const router = useRouter();
  const [releases, setReleases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchReleases(); }, []);

  const fetchReleases = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch('/api/releases');
      if (Array.isArray(data)) {
        setReleases(data);
      } else {
        setReleases([]);
      }
    } catch (err) {
      console.error('Error fetching releases:', err);
      setReleases([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center border border-[#7B61FF]/20">
              <Disc className="text-[#7B61FF]" size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Mis <span className="text-[#7B61FF]">Lanzamientos</span></h1>
          </div>
          <p className="text-[#A1A1AA] text-sm">Gestiona tu catálogo musical y controla el estado de cada release.</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/releases/new')}
          className="bg-[#FF9F0A] text-black font-black px-8 h-12 rounded-xl shadow-lg shadow-[#FF9F0A]/20 hover:scale-105 transition-all"
        >
          <Plus size={18} className="mr-2" /> NUEVO LANZAMIENTO
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-[#FF9F0A]" size={32} />
        </div>
      ) : releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-[#151821] border border-[#232733] flex items-center justify-center">
            <Music size={40} className="text-[#232733]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Sin Lanzamientos</h3>
            <p className="text-sm text-[#A1A1AA] mt-2 max-w-md">
              Crea tu primer lanzamiento para comenzar a distribuir tu música en Spotify, Apple Music y más de 150 tiendas digitales.
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/releases/new')}
            className="bg-[#FF9F0A] text-black font-black px-8 h-12 rounded-xl"
          >
            <Plus className="mr-2" size={18} /> CREAR MI PRIMER LANZAMIENTO
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {releases.map((release) => {
            const statusInfo = STATUS_MAP[release.status] || STATUS_MAP['PENDING_APPROVAL'];
            const StatusIcon = statusInfo.icon;
            return (
              <Card key={release.id} className="bg-[#151821] border-[#232733] rounded-[2rem] overflow-hidden hover:border-[#7B61FF]/40 transition-all group cursor-pointer"
                onClick={() => router.push(`/dashboard/releases/new`)}
              >
                <div className="aspect-square bg-[#0B0B0F] flex items-center justify-center relative overflow-hidden">
                  {release.coverUrl && release.coverUrl !== 'https://zonyd.com/default-cover.png' ? (
                    <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#7B61FF]/20 to-[#FF9F0A]/10 flex items-center justify-center">
                      <Disc size={60} className="text-[#232733]" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full" style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}>
                      <StatusIcon size={10} className="inline mr-1" />{statusInfo.label}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h4 className="text-lg font-black text-white truncate italic">{release.title}</h4>
                  <p className="text-xs text-[#A1A1AA] mt-1">{release.genre || 'Sin género'}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] font-bold text-[#A1A1AA]">
                      {new Date(release.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[9px] font-black text-[#7B61FF] uppercase">
                      {release.upc || 'Sin UPC'}
                    </span>
                  </div>
                  {release.tracks && release.tracks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-[10px] text-[#A1A1AA]">{release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

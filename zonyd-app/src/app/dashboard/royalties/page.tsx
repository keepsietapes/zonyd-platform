'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Download, 
  Wallet, 
  CreditCard, 
  BarChart3, 
  Clock, 
  ChevronDown,
  BadgePercent,
  RefreshCcw,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock Data Generator para los filtros
const MOCK_DATA: any = {
  'Todos los Tracks': {
    '1M': [
      { name: 'Sem 1', earnings: 450 }, { name: 'Sem 2', earnings: 600 }, { name: 'Sem 3', earnings: 300 }, { name: 'Sem 4', earnings: 900 }
    ],
    '6M': [
      { name: 'Ene', earnings: 1200 }, { name: 'Feb', earnings: 2100 }, { name: 'Mar', earnings: 1800 }, { name: 'Abr', earnings: 2400 }, { name: 'May', earnings: 2100 }, { name: 'Jun', earnings: 3200 }
    ],
    '1Y': [
      { name: 'Q1', earnings: 4500 }, { name: 'Q2', earnings: 6200 }, { name: 'Q3', earnings: 5100 }, { name: 'Q4', earnings: 8900 }
    ]
  },
  'Track 1: All Eyez': {
    '1M': [{ name: 'S1', earnings: 200 }, { name: 'S2', earnings: 150 }, { name: 'S3', earnings: 400 }, { name: 'S4', earnings: 300 }],
    '6M': [{ name: 'Ene', earnings: 800 }, { name: 'Feb', earnings: 900 }, { name: 'Mar', earnings: 1100 }, { name: 'Abr', earnings: 1300 }, { name: 'May', earnings: 1200 }, { name: 'Jun', earnings: 1500 }],
    '1Y': [{ name: 'Q1', earnings: 2500 }, { name: 'Q2', earnings: 3000 }, { name: 'Q3', earnings: 2800 }, { name: 'Q4', earnings: 4000 }]
  },
  'Track 2: Neon Nights': {
    '1M': [{ name: 'S1', earnings: 50 }, { name: 'S2', earnings: 120 }, { name: 'S3', earnings: 80 }, { name: 'S4', earnings: 200 }],
    '6M': [{ name: 'Ene', earnings: 300 }, { name: 'Feb', earnings: 450 }, { name: 'Mar', earnings: 380 }, { name: 'Abr', earnings: 600 }, { name: 'May', earnings: 550 }, { name: 'Jun', earnings: 800 }],
    '1Y': [{ name: 'Q1', earnings: 1200 }, { name: 'Q2', earnings: 1800 }, { name: 'Q3', earnings: 1500 }, { name: 'Q4', earnings: 2500 }]
  }
};

import { authFetch } from '@/lib/api';

export default function RoyaltiesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free');

  const [balance, setBalance] = useState(0);
  const [withdrawing, setWithdrawing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y'>('6M');
  const [selectedTrack, setSelectedTrack] = useState('Todos los Tracks');
  const [showTrackDropdown, setShowTrackDropdown] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const data = await authFetch('/api/wallet/balance');
      if (data) {
        setBalance(data.balance || 0);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const activeData = useMemo(() => {
    return MOCK_DATA[selectedTrack][timeRange];
  }, [selectedTrack, timeRange]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await authFetch('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: balance })
      });
      
      alert('Retiro solicitado con éxito.');
      fetchBalance();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error de conexión.');
    } finally {
      setWithdrawing(false);
    }
  };

  const MIN_WITHDRAWAL = 10.00;

  return (
    <div className="p-8 space-y-10 selection:bg-[#FF9F0A] selection:text-black">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Cash Flow</h1>
           <p className="text-[#A1A1AA] text-sm">Analíticas de ingresos en tiempo real para tu catálogo.</p>
        </div>

        <div className="flex bg-[#151821] p-1 rounded-xl border border-white/5">
          <button onClick={() => setUserPlan('Free')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${userPlan === 'Free' ? 'bg-[#232733] text-white shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Starter</button>
          <button onClick={() => setUserPlan('Pro')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${userPlan === 'Pro' ? 'bg-[#FF9F0A] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>Pro (100%)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel border-white/5 bg-[#0B0B0F] overflow-visible">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
              <div className="relative w-full sm:w-auto">
                <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Filtrar por Lanzamiento</p>
                <div onClick={() => setShowTrackDropdown(!showTrackDropdown)} className="h-10 px-4 bg-[#151821] border border-[#232733] rounded-lg flex items-center justify-between min-w-[200px] cursor-pointer hover:border-[#FF9F0A]/50 transition-all text-sm font-bold">
                  <span className="flex items-center gap-2"><Search size={14} className="text-[#FF9F0A]" /> {selectedTrack}</span>
                  <ChevronDown size={14} className={`transition-transform ${showTrackDropdown ? 'rotate-180' : ''}`} />
                </div>
                {showTrackDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#151821] border border-[#232733] rounded-xl shadow-2xl z-50 overflow-hidden">
                    {Object.keys(MOCK_DATA).map(track => (
                      <div key={track} onClick={() => { setSelectedTrack(track); setShowTrackDropdown(false); }} className="px-4 py-3 text-sm hover:bg-[#FF9F0A] hover:text-black cursor-pointer font-bold transition-colors">
                        {track}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex bg-[#151821] p-1 rounded-lg border border-white/5 self-end">
                {['1M', '6M', '1Y'].map((range) => (
                  <button key={range} onClick={() => setTimeRange(range as any)} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${timeRange === range ? 'bg-[#FF9F0A] text-black' : 'text-[#A1A1AA] hover:text-white'}`}>
                    {range}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full pt-4">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF9F0A" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#FF9F0A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#232733" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A1A1AA', fontWeight: 'bold'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A1A1AA', fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{ backgroundColor: '#151821', border: '1px solid #232733', borderRadius: '12px' }} itemStyle={{ color: '#FF9F0A', fontSize: '12px', fontWeight: 'bold' }} labelStyle={{ color: '#A1A1AA' }} formatter={(value: any) => [`$${Number(value).toFixed(2)} USD`, 'Ingresos']} />
                      <Area type="monotone" dataKey="earnings" stroke="#FF9F0A" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="glass-panel border-white/5 bg-gradient-to-br from-[#151821] to-[#0B0B0F] shadow-2xl">
              <CardContent className="pt-6">
                <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-widest mb-4">Balance Generado</p>
                <h2 className="text-4xl font-black text-white">${balance.toFixed(2)} <span className="text-sm font-normal text-[#A1A1AA]">USD</span></h2>
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/5 bg-[#151821]/30">
              <CardContent className="pt-6">
                <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-widest mb-4">Streams del Periodo</p>
                <h2 className="text-4xl font-black text-white">{(activeData.reduce((acc: any, curr: any) => acc + curr.earnings, 0) * 230).toLocaleString()}</h2>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
           {/* 💳 WALLET PREMIUM */}
           <Card className="bg-[#FF9F0A] text-black rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-[#FF9F0A]/20 group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                 <Wallet size={120} fill="black" />
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-6">Balance Disponible</p>
                 <h2 className="text-5xl font-black italic tracking-tighter mb-8">${balance.toFixed(2)}</h2>
                 
                 <div className="space-y-3">
                    <Button 
                      onClick={handleWithdraw}
                      disabled={withdrawing || balance < MIN_WITHDRAWAL}
                      className="w-full bg-black text-white font-black h-14 rounded-2xl hover:bg-black/90 transition-all flex items-center justify-center gap-3"
                    >
                       {withdrawing ? <RefreshCcw className="animate-spin" size={20} /> : <ArrowUpRight size={20} />}
                       SOLICITAR RETIRO
                    </Button>
                    <p className="text-[9px] text-center font-bold uppercase opacity-60">Mínimo de retiro: $10.00 USD</p>
                 </div>
              </div>
           </Card>

           {/* 🤝 SPLIT MANAGER */}
           <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-xl">
              <CardHeader className="p-6 border-b border-white/5 bg-black/20 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-[#A1A1AA]">Splits Activos</CardTitle>
                 <BadgePercent size={16} className="text-[#FF9F0A]" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#FF9F0A] flex items-center justify-center text-[10px] font-black">YO</div>
                       <p className="text-[11px] font-bold text-white">Tú (Principal)</p>
                    </div>
                    <span className="text-xs font-black text-[#FF9F0A]">{userPlan === 'Free' ? '85%' : '100%'}</span>
                 </div>
                 <Button variant="ghost" className="w-full text-[10px] font-black text-[#FF9F0A] uppercase tracking-widest hover:bg-[#FF9F0A]/10 mt-2">
                    AÑADIR COLABORADOR
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* 🧾 HISTORIAL DE TRANSACCIONES */}
      <div className="space-y-6 pt-10">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-[#A1A1AA] uppercase tracking-[0.3em]">Historial de Pagos</h3>
            <Button variant="ghost" className="text-[10px] font-black text-[#FF9F0A] uppercase tracking-widest">Reporte DDEX</Button>
         </div>
         
         <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-black/40 border-b border-white/5">
                     <tr>
                        <th className="px-8 py-5 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Referencia</th>
                        <th className="px-8 py-5 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Fecha</th>
                        <th className="px-8 py-5 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Fuente</th>
                        <th className="px-8 py-5 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Monto</th>
                        <th className="px-8 py-5 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">Estado</th>
                        <th className="px-8 py-5 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em] text-right">Factura</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     <TransactionRow id="#ZN-9921" date="24 Mayo, 2024" source="Spotify Earnings" amount="1,450.00" status="paid" />
                     <TransactionRow id="#ZN-8812" date="12 Abril, 2024" source="Apple Music" amount="890.20" status="paid" />
                     <TransactionRow id="#ZN-7705" date="05 Marzo, 2024" source="TikTok Royalty" amount="312.50" status="pending" />
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
    </div>
  );
}

function TransactionRow({ id, date, source, amount, status }: any) {
   return (
      <tr className="hover:bg-white/5 transition-colors group">
         <td className="px-8 py-5 text-[11px] font-black text-white">{id}</td>
         <td className="px-8 py-5 text-[11px] font-bold text-[#A1A1AA]">{date}</td>
         <td className="px-8 py-5">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#FF9F0A] shadow-[0_0_5px_rgba(255,159,10,0.5)]" />
               <span className="text-[11px] font-black text-white">{source}</span>
            </div>
         </td>
         <td className="px-8 py-5 text-[11px] font-black text-white">${amount}</td>
         <td className="px-8 py-5">
            <span className={`text-[9px] font-black px-2 py-1 rounded ${status === 'paid' ? 'bg-[#32D74B]/20 text-[#32D74B]' : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'}`}>
               {status === 'paid' ? 'COMPLETADO' : 'PENDIENTE'}
            </span>
         </td>
         <td className="px-8 py-5 text-right">
            <Button 
               variant="ghost" 
               size="sm" 
               className="text-[#3A3A3C] hover:text-[#FF9F0A] group-hover:text-white transition-all"
               onClick={() => alert('Generando factura PDF...')}
            >
               <Download size={16} />
            </Button>
         </td>
      </tr>
   );
}

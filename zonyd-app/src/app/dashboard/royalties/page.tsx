'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, Download, Wallet, BadgePercent, RefreshCcw, Search, ChevronDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { authFetch } from '@/lib/api';

export default function RoyaltiesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [balance, setBalance] = useState(0);
  const [withdrawing, setWithdrawing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y'>('6M');
  const [chartData, setChartData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalStreams, setTotalStreams] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const MIN_WITHDRAWAL = 10.00;

  useEffect(() => { setIsMounted(true); fetchData(); }, []);
  useEffect(() => { if (isMounted) fetchData(); }, [timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [walletData, earningsData] = await Promise.all([
        authFetch('/api/wallet/balance'),
        authFetch(`/api/wallet/earnings?range=${timeRange}`),
      ]);
      if (walletData) setBalance(walletData.balance || 0);
      if (earningsData) {
        setChartData(Array.isArray(earningsData.chart) ? earningsData.chart : []);
        setTransactions(Array.isArray(earningsData.transactions) ? earningsData.transactions : []);
        setTotalStreams(earningsData.totalStreams || 0);
      }
    } catch (err) { console.error('Error fetching royalties:', err); }
    finally { setIsLoading(false); }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await authFetch('/api/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount: balance }) });
      alert('Retiro solicitado con éxito. Recibirás un correo de confirmación.');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al procesar el retiro. Intenta nuevamente.');
    } finally { setWithdrawing(false); }
  };

  const hasData = chartData.length > 0;

  return (
    <div className="p-8 space-y-10 selection:bg-[#FF9F0A] selection:text-black pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Cash Flow</h1>
          <p className="text-[#A1A1AA] text-sm">Analíticas de ingresos en tiempo real para tu catálogo.</p>
        </div>
        <div className="flex bg-[#151821] p-1 rounded-xl border border-white/5">
          {(['1M', '6M', '1Y'] as const).map(r => (
            <button key={r} onClick={() => setTimeRange(r)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === r ? 'bg-[#FF9F0A] text-black shadow-lg' : 'text-[#A1A1AA] hover:text-white'}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0B0B0F] border-[#232733] overflow-hidden">
            <CardHeader className="pb-4">
              <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Ingresos del Período</p>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#FF9F0A]/30 border-t-[#FF9F0A] rounded-full animate-spin" />
                  </div>
                ) : !hasData ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                    <BarChart3 size={48} className="text-[#232733]" />
                    <div>
                      <p className="text-[11px] font-black text-[#3A3A3C] uppercase tracking-widest">Sin ingresos registrados</p>
                      <p className="text-[10px] text-[#3A3A3C] mt-1">Los ingresos aparecerán 30–45 días después de tu primer lanzamiento</p>
                    </div>
                  </div>
                ) : (
                  isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF9F0A" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#FF9F0A" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#232733" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A1A1AA', fontWeight: 'bold'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A1A1AA', fontWeight: 'bold'}} />
                        <Tooltip contentStyle={{ backgroundColor: '#151821', border: '1px solid #232733', borderRadius: '12px' }} itemStyle={{ color: '#FF9F0A' }} formatter={(v: any) => [`$${Number(v).toFixed(2)} USD`, 'Ingresos']} />
                        <Area type="monotone" dataKey="earnings" stroke="#FF9F0A" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-[#151821] to-[#0B0B0F] border-[#232733] shadow-2xl">
              <CardContent className="pt-6">
                <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-widest mb-4">Balance Generado</p>
                <h2 className="text-4xl font-black text-white">${balance.toFixed(2)} <span className="text-sm font-normal text-[#A1A1AA]">USD</span></h2>
              </CardContent>
            </Card>
            <Card className="bg-[#151821]/30 border-[#232733]">
              <CardContent className="pt-6">
                <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-widest mb-4">Streams del Período</p>
                <h2 className="text-4xl font-black text-white">{totalStreams.toLocaleString()}</h2>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {/* Wallet */}
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

          {/* Split */}
          <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-xl">
            <CardHeader className="p-6 border-b border-white/5 bg-black/20 flex flex-row items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-[#A1A1AA]">Splits Activos</p>
              <BadgePercent size={16} className="text-[#FF9F0A]" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF9F0A] flex items-center justify-center text-[10px] font-black text-black">YO</div>
                  <p className="text-[11px] font-bold text-white">Tú (Principal)</p>
                </div>
                <span className="text-xs font-black text-[#FF9F0A]">100%</span>
              </div>
              <Button variant="ghost" className="w-full text-[10px] font-black text-[#FF9F0A] uppercase tracking-widest hover:bg-[#FF9F0A]/10 mt-2">
                AÑADIR COLABORADOR
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historial */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-[#A1A1AA] uppercase tracking-[0.3em]">Historial de Pagos</h3>
          <Button variant="ghost" disabled={transactions.length === 0} className="text-[10px] font-black text-[#FF9F0A] uppercase tracking-widest disabled:opacity-30">Reporte DDEX</Button>
        </div>
        <Card className="bg-[#151821] border-[#232733] rounded-[2.5rem] overflow-hidden shadow-2xl">
          {transactions.length === 0 ? (
            <div className="p-16 text-center">
              <DollarSign size={40} className="text-[#232733] mx-auto mb-4" />
              <p className="text-[11px] font-black text-[#3A3A3C] uppercase tracking-widest">Sin transacciones registradas</p>
              <p className="text-[10px] text-[#3A3A3C] mt-2">Tu historial de pagos aparecerá aquí una vez que recibas tus primeras regalías</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/40 border-b border-white/5">
                  <tr>
                    {['Referencia', 'Fecha', 'Fuente', 'Monto', 'Estado', 'Factura'].map(h => (
                      <th key={h} className="px-8 py-5 text-[9px] font-black text-[#3A3A3C] uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5 text-[11px] font-black text-white">#{tx.id}</td>
                      <td className="px-8 py-5 text-[11px] font-bold text-[#A1A1AA]">{new Date(tx.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td className="px-8 py-5 text-[11px] font-black text-white">{tx.source}</td>
                      <td className="px-8 py-5 text-[11px] font-black text-white">${Number(tx.amount).toFixed(2)}</td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black px-2 py-1 rounded ${tx.status === 'paid' ? 'bg-[#32D74B]/20 text-[#32D74B]' : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'}`}>
                          {tx.status === 'paid' ? 'COMPLETADO' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button variant="ghost" size="sm" className="text-[#3A3A3C] hover:text-[#FF9F0A]" onClick={() => alert('Generando factura PDF...')}>
                          <Download size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

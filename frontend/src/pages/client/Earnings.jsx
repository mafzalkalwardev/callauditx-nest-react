import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ClientEarnings = () => {
  const [data, setData] = useState(null);
  const [dailyChart, setDailyChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const earn = await analyticsAPI.getEarnings();
      const stats = await analyticsAPI.getDashboard();
      
      setData(earn);
      setDailyChart(stats.dailyChart || []);
    } catch (e) {
      console.warn("Could not fetch earnings ledger", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Aggregate totals
  const totalEarned = data?.history
    .filter(h => h.type === 'EARNING')
    .reduce((sum, h) => sum + h.amount, 0) || 0;

  const totalDeducted = data?.history
    .filter(h => h.type === 'DEDUCTION')
    .reduce((sum, h) => sum + h.amount, 0) || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Earnings & Compensation</h1>
        <p className="text-slate-400 text-sm mt-1">Review compensation ledger, system accuracy bonuses, and deduction statements.</p>
      </div>

      {/* Tally Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl filter group-hover:scale-105 transition-transform" />
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Audited Balance</span>
            <div className="p-2.5 rounded-xl bg-white/10 text-white shadow">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">${data?.balance?.toFixed(2) || '0.00'}</h3>
          <p className="text-xs text-blue-200 mt-2 font-medium">Auto-credited review payouts.</p>
        </div>

        {/* Total Earned */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/10 shadow">
            <ArrowUpRight className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Compensation</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">${totalEarned.toFixed(2)}</h3>
          </div>
        </div>

        {/* Deductions */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/10 shadow">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review Deductions</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">${totalDeducted.toFixed(2)}</h3>
          </div>
        </div>

      </div>

      {/* Main split: Daily Timeline vs History List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Earnings chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-slate-200 text-sm">Earnings Timeline (Past 7 Days)</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChart}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#earningsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick rates rules */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-extrabold text-slate-200 text-sm">Compensation Standards</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4 text-xs">
            <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200">Inbound review</h4>
                <p className="text-[10px] text-slate-500">Correct vs Invalidate</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400">+$0.70</span>
                <span className="text-[10px] text-red-400 block">-$2.30</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200">Appointment Booked</h4>
                <p className="text-[10px] text-slate-500">Correct vs Invalidate</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400">+$1.20</span>
                <span className="text-[10px] text-red-400 block">-$3.00</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200">Inventory Discussion</h4>
                <p className="text-[10px] text-slate-500">Correct vs Invalidate</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400">+$0.90</span>
                <span className="text-[10px] text-red-400 block">-$1.50</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Ledger statement list */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
        <h3 className="font-extrabold text-white text-base">Transactions Ledger Statement</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-extrabold">
                <th className="pb-3.5 pl-2">Description</th>
                <th className="pb-3.5">Audit Category</th>
                <th className="pb-3.5">Date</th>
                <th className="pb-3.5">Log Type</th>
                <th className="pb-3.5 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {data?.history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold">
                    No transactions logs recorded in ledger statement.
                  </td>
                </tr>
              ) : (
                data?.history.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-200">{log.description}</td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                        {log.categoryName}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 font-semibold">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[8px] uppercase ${
                        log.type === 'EARNING' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className={`py-4 text-right pr-2 font-extrabold ${
                      log.type === 'EARNING' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {log.type === 'EARNING' ? '+' : '-'}${log.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { analyticsAPI, recordingsAPI } from '../../services/api';
import { 
  Users, 
  Disc, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Clock,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsData = await analyticsAPI.getDashboard();
      const clientData = await analyticsAPI.getAdminClients();
      const recData = await recordingsAPI.list();
      
      setStats(statsData);
      setClients(clientData);
      setRecordings(recData.slice(0, 5));
    } catch (e) {
      console.warn("Could not load admin stats", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading platform telemetry metrics...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Registered Clients', value: clients.length, icon: Users, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/10' },
    { label: 'Global Call Volume', value: stats?.totalCalls || 0, icon: Disc, color: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/10' },
    { label: 'Platform Accuracy', value: `${stats?.avgAccuracy || 95}%`, icon: Sparkles, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/10' },
    { label: 'Flagged Reviews', value: stats?.flaggedReviewsCount || 0, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Operations Command</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide statistics, client activity, and global AI review accuracy monitoring.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl ${card.shadow} hover:border-slate-700/60 transition-all duration-300 relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-full blur-xl filter" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{card.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Daily timeline Area Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-500" />
          <h2 className="font-extrabold text-white text-base">Global Call Uploads Trend</h2>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.dailyChart || []}>
              <defs>
                <linearGradient id="globalTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="uploads" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#globalTrendGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Split lists: Client Manager vs Recent recordings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients list */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-5">
          <h3 className="font-extrabold text-white text-sm">Tenant Clients Activity</h3>
          
          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {clients.map((c) => (
              <div 
                key={c.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-200">{c.companyName}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Admin: {c.name} ({c.email})</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">${c.balance.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{c.totalCalls} Audited Calls</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Recent Reviews */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-5">
          <h3 className="font-extrabold text-white text-sm">Recent Platform-wide Reviews</h3>

          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {recordings.map((rec) => (
              <div 
                key={rec.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-200 truncate max-w-xs">{rec.originalName}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Client: {rec.client?.companyName || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded font-extrabold text-[8px] uppercase ${
                    rec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {rec.status}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold block mt-1">
                    {rec.aiReview ? `Acc: ${(rec.aiReview.reviewScore * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

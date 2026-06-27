import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { 
  TrendingUp, 
  Sparkles, 
  BarChart2, 
  PieChart as PieIcon, 
  Activity,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export const ClientAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await analyticsAPI.getDashboard();
      setData(stats);
    } catch (e) {
      console.warn("Could not load analytics", e);
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

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  const accuracyChart = [
    { name: 'AI Review Score', value: data?.avgAccuracy || 95 },
    { name: 'AI Confidence Score', value: data?.avgConfidence || 96 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Performance Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Deep metrics on AI accuracy, categories split, and call volume distribution.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 border border-slate-800 rounded-xl">
          {['7', '14', '30'].map((time) => (
            <button
              key={time}
              onClick={() => setTimeframe(time)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === time 
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last {time} Days
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-blue-600/15 text-blue-400 rounded-2xl border border-blue-500/10 shadow">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Audits</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{data?.totalCalls || 0}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-600/15 text-emerald-400 rounded-2xl border border-emerald-500/10 shadow">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Auditing Accuracy</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{data?.avgAccuracy || 95}%</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-purple-600/15 text-purple-400 rounded-2xl border border-purple-500/10 shadow">
            <Sparkles className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Avg Confidence</span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{data?.avgConfidence || 96}%</h3>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploads Trend Line */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-slate-200 text-sm">Call Reviews Trend</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyChart || []}>
                <defs>
                  <linearGradient id="uploadsTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#uploadsTrendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Split Pie */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-purple-500" />
            <h3 className="font-extrabold text-slate-200 text-sm">Category Distributions</h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {data?.categoryDistribution.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No distribution logs yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(data?.categoryDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart: Accuracy metrics */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-extrabold text-slate-200 text-sm">AI Accuracy & Confidence Timeline</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyChart}>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]}>
                  {accuracyChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

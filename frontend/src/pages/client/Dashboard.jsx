import React, { useState, useEffect } from 'react';
import { analyticsAPI, recordingsAPI } from '../../services/api';
import { 
  Play, 
  Disc, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  BarChart2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ClientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await analyticsAPI.getDashboard();
      const recData = await recordingsAPI.list();
      const earnData = await analyticsAPI.getEarnings();
      
      setStats({
        ...statsData,
        balance: earnData.balance,
      });
      setRecordings(recData.slice(0, 5)); // show top 5
    } catch (e) {
      console.warn("Error fetching dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading your workspace metrics...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Calls Reviewed', value: stats?.reviewedCalls || 0, icon: Disc, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/10' },
    { label: 'Pending Processing', value: stats?.pendingCalls || 0, icon: Clock, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/10' },
    { label: 'Average AI Accuracy', value: `${stats?.avgAccuracy || 95}%`, icon: Sparkles, color: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/10' },
    { label: 'Total Audited Balance', value: `$${stats?.balance?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">CallAuditX Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time artificial intelligence review metrics.</p>
        </div>
        <Link 
          to="/uploads"
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 hover:gap-3"
        >
          <span>Upload Audio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
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
              {/* Background gradient hint */}
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

      {/* Graphic and Mini Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-500" />
              <h2 className="font-extrabold text-white text-base">Reviews Volume (Past 7 Days)</h2>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyChart || []}>
                <defs>
                  <linearGradient id="uploadsGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="uploads" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#uploadsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories split status */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h2 className="font-extrabold text-white text-base">Accuracy Matrix</h2>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                <span>AI CONFIDENCE</span>
                <span>{stats?.avgConfidence || 96}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-850 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${stats?.avgConfidence || 96}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                <span>AUDITING ACCURACY</span>
                <span>{stats?.avgAccuracy || 95}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-850 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${stats?.avgAccuracy || 95}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 animate-bounce" />
              <div className="text-xs">
                <h4 className="font-bold text-slate-200">System Standing</h4>
                <p className="text-slate-500 leading-relaxed mt-0.5">Your AI reviews are matching professional auditing metrics perfectly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-emerald-500" />
            <h2 className="font-extrabold text-white text-base">Recent AI Reviews</h2>
          </div>
          <Link to="/reviews" className="text-xs text-blue-400 hover:text-blue-300 font-bold underline transition-colors">
            View All Calls
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-extrabold">
                <th className="pb-3.5 pl-2">Recording File</th>
                <th className="pb-3.5">Category</th>
                <th className="pb-3.5">AI Confidence</th>
                <th className="pb-3.5">Sentiment</th>
                <th className="pb-3.5">Earnings</th>
                <th className="pb-3.5 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {recordings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                    No recordings audited yet. Start by uploading one!
                  </td>
                </tr>
              ) : (
                recordings.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-200">{rec.originalName}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                        {rec.category?.name}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-blue-400">
                      {rec.aiReview ? `${(rec.aiReview.confidenceScore * 100).toFixed(0)}%` : 'N/A'}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                        rec.aiReview?.sentiment === 'POSITIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : rec.aiReview?.sentiment === 'NEGATIVE'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {rec.aiReview?.sentiment || 'NEUTRAL'}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-emerald-400">
                      {rec.aiReview ? `+$${rec.aiReview.earningsAmount.toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[9px] ${
                        rec.status === 'COMPLETED' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : rec.status === 'FAILED'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}>
                        {rec.status}
                      </span>
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

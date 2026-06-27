import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { Users, DollarSign, Calendar, Sparkles } from 'lucide-react';

export const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await analyticsAPI.getAdminClients();
      setClients(data);
    } catch (e) {
      console.warn("Error loading clients data", e);
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Client Tenant Manager</h1>
        <p className="text-slate-400 text-sm mt-1">Supervise corporate clients registered on CallAuditX, monitor audit volume, and adjust balances.</p>
      </div>

      {/* Grid listing */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-extrabold">
                <th className="pb-3.5 pl-2">Corporate Client</th>
                <th className="pb-3.5">Owner Contact</th>
                <th className="pb-3.5">Compensation Balance</th>
                <th className="pb-3.5">Total Call Volume</th>
                <th className="pb-3.5">AI Review Accuracy</th>
                <th className="pb-3.5 text-right pr-2">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                    No client profiles found.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/10 text-blue-400 border border-blue-500/10 rounded-lg">
                          <Users className="w-4.5 h-4.5" />
                        </div>
                        <span className="font-bold text-slate-200">{c.companyName}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-slate-200">{c.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{c.email}</p>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-emerald-400">
                      ${c.balance.toFixed(2)}
                    </td>
                    <td className="py-4 font-semibold text-slate-400">
                      {c.totalCalls} Calls Audited
                    </td>
                    <td className="py-4 font-bold text-indigo-400">
                      {c.accuracy}%
                    </td>
                    <td className="py-4 text-right pr-2 text-slate-500 font-medium">
                      {new Date(c.joinedAt).toLocaleDateString()}
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

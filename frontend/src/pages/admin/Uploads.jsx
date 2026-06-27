import React, { useState, useEffect } from 'react';
import { recordingsAPI } from '../../services/api';
import { UploadCloud, Users, Calendar, Sparkles } from 'lucide-react';

export const AdminUploads = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const data = await recordingsAPI.list();
      setRecordings(data);
    } catch (e) {
      console.warn(e);
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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Global System Uploads</h1>
        <p className="text-slate-400 text-sm mt-1">Supervise all audio recordings uploaded by corporate clients across the platform.</p>
      </div>

      {/* List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-extrabold">
                <th className="pb-3.5 pl-2">Recording File Name</th>
                <th className="pb-3.5">Category Target</th>
                <th className="pb-3.5">Uploading Client</th>
                <th className="pb-3.5">Size (MB)</th>
                <th className="pb-3.5">Review Status</th>
                <th className="pb-3.5 text-right pr-2">Uploaded Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {recordings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                    No uploads recorded yet.
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
                    <td className="py-4 font-semibold text-slate-400">
                      {rec.client?.companyName || 'Not Set'}
                    </td>
                    <td className="py-4 text-slate-500 font-semibold">
                      {(rec.size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        rec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2 text-slate-500 font-semibold">
                      {new Date(rec.createdAt).toLocaleDateString()}
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

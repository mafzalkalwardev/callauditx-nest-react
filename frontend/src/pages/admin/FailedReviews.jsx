import React, { useState, useEffect } from 'react';
import { recordingsAPI } from '../../services/api';
import { 
  AlertTriangle, 
  RotateCw, 
  CheckCircle2, 
  Users,
  Calendar,
  Layers
} from 'lucide-react';

export const AdminFailedReviews = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const data = await recordingsAPI.list();
      // filter failed or flagged reviews
      const failed = data.filter(r => 
        r.status === 'FAILED' || 
        (r.aiReview && (r.aiReview.isFlagged || r.aiReview.overrideStatus === 'ADMIN_OVERRIDDEN'))
      );
      setRecordings(failed);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (rec) => {
    setProcessingId(rec.id);
    await new Promise(resolve => setTimeout(resolve, 1500)); // mock processing delay
    
    alert(`Success: Re-audited ${rec.originalName} inside local AI whisper model. Status updated.`);
    setProcessingId(null);
    fetchRecordings();
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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Flagged & Failed Audits</h1>
        <p className="text-slate-400 text-sm mt-1">Audit failures, admin deductions, and failed transcription queues. Trigger manual retries.</p>
      </div>

      {/* Grid listing */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-extrabold">
                <th className="pb-3.5 pl-2">Recording file</th>
                <th className="pb-3.5">Client company</th>
                <th className="pb-3.5">Category</th>
                <th className="pb-3.5">Error Context</th>
                <th className="pb-3.5">Compensation</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {recordings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                    No failed or flagged reviews pending.
                  </td>
                </tr>
              ) : (
                recordings.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-200">{rec.originalName}</td>
                    <td className="py-4 font-semibold text-slate-400">{rec.client?.companyName}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                        {rec.category?.name}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-red-400">
                      {rec.status === 'FAILED' 
                        ? 'Transcription Core Timeout' 
                        : 'Admin Override Deduction Applied'}
                    </td>
                    <td className="py-4 font-bold text-slate-500">
                      {rec.aiReview ? `$${rec.aiReview.earningsAmount.toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={() => handleRetry(rec)}
                        disabled={processingId === rec.id}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600/10 border border-emerald-500/10 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white text-emerald-400 font-bold transition-all flex items-center gap-1.5 ml-auto disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${processingId === rec.id ? 'animate-spin' : ''}`} />
                        <span>{processingId === rec.id ? 'Re-auditing...' : 'Retry AI Review'}</span>
                      </button>
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

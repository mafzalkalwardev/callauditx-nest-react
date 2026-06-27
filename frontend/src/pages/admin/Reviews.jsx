import React, { useState, useEffect } from 'react';
import { recordingsAPI } from '../../services/api';
import { 
  Play, 
  Disc, 
  HelpCircle, 
  ChevronRight, 
  X, 
  CheckCircle,
  AlertTriangle,
  MessageSquareCode,
  Check,
  Save,
  Volume2
} from 'lucide-react';

export const AdminReviews = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail / Override Modal
  const [activeRec, setActiveRec] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [overrideAnswers, setOverrideAnswers] = useState([]); // tracks active overrides

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const data = await recordingsAPI.list();
      setRecordings(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (id) => {
    try {
      const details = await recordingsAPI.getById(id);
      setActiveRec(details);
      
      // Initialize answer states
      const ansArr = details.aiReview?.answers.map(ans => ({
        questionId: ans.questionId,
        answerValue: ans.answerValue,
        text: ans.question?.text || ''
      })) || [];
      setOverrideAnswers(ansArr);

      setModalOpen(true);
    } catch (e) {
      alert("Error loading review detail.");
    }
  };

  const handleOverrideValueChange = (questionId, newValue) => {
    setOverrideAnswers(prev => prev.map(ans => {
      if (ans.questionId === questionId) {
        return { ...ans, answerValue: newValue };
      }
      return ans;
    }));
  };

  const submitOverride = async (status) => {
    // status is 'ADMIN_APPROVED' or 'ADMIN_OVERRIDDEN'
    if (!activeRec.aiReview) return;
    try {
      await recordingsAPI.overrideReview(activeRec.aiReview.id, overrideAnswers, status);
      alert(`Manual Audit: Marked successfully as ${status.replace('_', ' ')}.`);
      setModalOpen(false);
      fetchRecordings();
    } catch (e) {
      alert("Error saving override settings.");
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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Global AI Reviews & Audits</h1>
        <p className="text-slate-400 text-sm mt-1">Supervise and manage all completed AI reviews, override results to apply client adjustments.</p>
      </div>

      {/* Grid Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-extrabold">
                <th className="pb-3.5 pl-2">Recording Name</th>
                <th className="pb-3.5">Client Tenant</th>
                <th className="pb-3.5">Category</th>
                <th className="pb-3.5">Accuracy Score</th>
                <th className="pb-3.5">AI Confidence</th>
                <th className="pb-3.5">Override State</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {recordings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-semibold">
                    No recordings audited yet.
                  </td>
                </tr>
              ) : (
                recordings.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-200">{rec.originalName}</td>
                    <td className="py-4 font-semibold text-slate-450">{rec.client?.companyName}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                        {rec.category?.name}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-indigo-400">
                      {rec.aiReview ? `${(rec.aiReview.reviewScore * 100).toFixed(0)}%` : 'N/A'}
                    </td>
                    <td className="py-4 font-semibold text-blue-400">
                      {rec.aiReview ? `${(rec.aiReview.confidenceScore * 100).toFixed(0)}%` : 'N/A'}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded font-extrabold text-[8px] uppercase border ${
                        rec.aiReview?.overrideStatus === 'ADMIN_OVERRIDDEN' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        rec.aiReview?.overrideStatus === 'ADMIN_APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {rec.aiReview?.overrideStatus || 'AI APPROVED'}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={() => handleOpenModal(rec.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/10 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-blue-400 font-bold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <span>Audit Override</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Override Modal */}
      {modalOpen && activeRec && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-extrabold uppercase">
                  {activeRec.category?.name}
                </span>
                <h2 className="text-lg font-extrabold text-white mt-1.5">Audit Supervision: {activeRec.originalName}</h2>
                <p className="text-slate-500 text-xs mt-0.5">Corporate Client: {activeRec.client?.companyName}</p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all border border-slate-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* simulated audio player */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-600 text-white shadow shadow-blue-500/20">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Audited Audio File</span>
                  <span>Duration: {activeRec.duration}s</span>
                </div>
                <audio 
                  controls 
                  src={`http://localhost:3000/${activeRec.filepath}`}
                  className="w-full h-8 mt-1 rounded bg-slate-900"
                />
              </div>
            </div>

            {/* Split Content: Transcript vs Override Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Transcript */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquareCode className="w-4 h-4 text-blue-500" />
                  <h3 className="font-extrabold text-slate-200 text-sm">Transcription Script</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 h-80 overflow-y-auto text-xs text-slate-350 leading-relaxed font-medium space-y-3">
                  {activeRec.transcript ? (
                    activeRec.transcript.split('Agent:').map((section, idx) => {
                      if (idx === 0 && !section.startsWith('Caller:')) return null;
                      const isCaller = !section.startsWith('Caller:');
                      const cleanText = section.replace('Caller:', '').trim();
                      if (!cleanText) return null;
                      return (
                        <div key={idx} className="flex gap-2">
                          <span className={`font-bold ${isCaller ? 'text-purple-400' : 'text-blue-400'} flex-shrink-0`}>
                            {isCaller ? 'Caller:' : 'Agent:'}
                          </span>
                          <p>{cleanText}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-500 italic text-center py-12">No transcript recorded for this session.</div>
                  )}
                </div>
              </div>

              {/* Override Checklists Panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-extrabold text-slate-200 text-sm">Questionnaire override</h3>
                  </div>

                  <span className="text-[10px] font-bold text-slate-500">Correct AI response where needed</span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {overrideAnswers.map((ans) => (
                    <div 
                      key={ans.questionId}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2.5 text-xs"
                    >
                      <p className="font-bold text-slate-200 leading-normal">{ans.text}</p>
                      
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">VALUE:</span>
                        
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
                          {['YES', 'NO'].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleOverrideValueChange(ans.questionId, val)}
                              className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${
                                ans.answerValue === val 
                                  ? val === 'YES' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions: Approve as Correct vs Invalidate & Penalty */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-xs text-slate-500 max-w-md leading-relaxed">
                <span className="font-bold text-slate-350 block">Audit Correction Penalty Terms:</span>
                Invalidating this review will withdraw the client's original earnings credit and apply a penalty deduction based on category rates.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => submitOverride('ADMIN_OVERRIDDEN')}
                  type="button"
                  className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Deduct & Penalize Client</span>
                </button>

                <button
                  onClick={() => submitOverride('ADMIN_APPROVED')}
                  type="button"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow shadow-emerald-500/15"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Complete</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

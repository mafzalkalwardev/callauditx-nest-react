import React, { useState, useEffect } from 'react';
import { recordingsAPI, categoriesAPI } from '../../services/api';
import { 
  Play, 
  Disc, 
  HelpCircle, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle,
  AlertTriangle,
  MessageSquareCode,
  Calendar,
  Volume2
} from 'lucide-react';

export const ClientReviews = () => {
  const [recordings, setRecordings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Details Modal State
  const [activeRec, setActiveRec] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const recData = await recordingsAPI.list();
      setRecordings(recData);
      
      const catData = await categoriesAPI.list();
      setCategories(catData);
    } catch (e) {
      console.warn("Could not fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (id) => {
    try {
      const details = await recordingsAPI.getById(id);
      setActiveRec(details);
      setModalOpen(true);
    } catch (e) {
      alert("Error loading recording details");
    }
  };

  const filteredRecordings = selectedCat === 'ALL' 
    ? recordings 
    : recordings.filter(r => r.categoryId === selectedCat);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Audit Reviews</h1>
          <p className="text-slate-400 text-sm mt-1">Examine individual call audit reviews, AI transcripts, and confidence matrices.</p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Reviews Grid */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-extrabold">
                <th className="pb-3.5 pl-2">Audio Recording</th>
                <th className="pb-3.5">Category</th>
                <th className="pb-3.5">Accuracy Score</th>
                <th className="pb-3.5">AI Confidence</th>
                <th className="pb-3.5">Earnings</th>
                <th className="pb-3.5">Uploaded</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filteredRecordings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-semibold">
                    No matching review records found.
                  </td>
                </tr>
              ) : (
                filteredRecordings.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-850/40 transition-all duration-200">
                    <td className="py-4 pl-2">
                      <div>
                        <p className="font-bold text-slate-200">{rec.originalName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Duration: {rec.duration ? `${rec.duration}s` : 'Processing'}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                        {rec.category?.name}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`font-bold ${
                        rec.aiReview?.reviewScore >= 0.9 ? 'text-emerald-400' :
                        rec.aiReview?.reviewScore >= 0.7 ? 'text-blue-400' : 'text-red-400'
                      }`}>
                        {rec.aiReview ? `${(rec.aiReview.reviewScore * 100).toFixed(0)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-indigo-400">
                      {rec.aiReview ? `${(rec.aiReview.confidenceScore * 100).toFixed(0)}%` : 'N/A'}
                    </td>
                    <td className="py-4 font-extrabold text-emerald-400">
                      {rec.aiReview ? `${rec.aiReview.earningsAmount >= 0 ? '+' : ''}$${rec.aiReview.earningsAmount.toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="py-4 text-slate-500 font-medium">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={() => handleOpenModal(rec.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/10 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-blue-400 font-bold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <span>Examine</span>
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

      {/* Review Details Modal */}
      {modalOpen && activeRec && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-extrabold uppercase">
                  {activeRec.category?.name}
                </span>
                <h2 className="text-lg font-extrabold text-white mt-1.5">{activeRec.originalName}</h2>
                <p className="text-slate-500 text-xs mt-0.5">Audited on {new Date(activeRec.createdAt).toLocaleDateString()}</p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all border border-slate-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Audio Player */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-600 text-white shadow shadow-blue-500/20 animate-pulse">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Audited Audio File</span>
                  <span>Duration: {activeRec.duration}s</span>
                </div>
                {/* HTML5 audio player */}
                <audio 
                  controls 
                  src={`http://localhost:3000/${activeRec.filepath}`}
                  className="w-full h-8 mt-1 rounded bg-slate-900"
                />
              </div>
            </div>

            {/* Split content: Transcript vs Questionnaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Transcript Pane */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquareCode className="w-4 h-4 text-blue-500" />
                  <h3 className="font-extrabold text-slate-200 text-sm">Whisper AI Transcript</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 h-80 overflow-y-auto text-xs text-slate-350 leading-relaxed font-medium space-y-3">
                  {activeRec.transcript ? (
                    <div className="whitespace-pre-wrap">
                      {activeRec.transcript.split(/(Agent:|Caller:)/g).map((part, idx) => {
                        if (part === 'Agent:' || part === 'Caller:') {
                          const isCaller = part === 'Caller:';
                          return (
                            <span key={idx} className={`font-bold ${isCaller ? 'text-purple-400' : 'text-blue-400'}`}>
                              {idx > 0 ? '\n\n' + part : part}
                            </span>
                          );
                        }
                        return <span key={idx}>{part}</span>;
                      })}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic text-center py-12">No transcript recorded for this session.</div>
                  )}
                </div>
              </div>

              {/* AI Questionnaire and summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-extrabold text-slate-200 text-sm">Checklist Audit Answers</h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase border ${
                    activeRec.aiReview?.overrideStatus === 'ADMIN_OVERRIDDEN'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {activeRec.aiReview?.overrideStatus || 'AI APPROVED'}
                  </span>
                </div>

                {/* Question results lists */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {activeRec.aiReview?.answers.map((ans) => (
                    <div 
                      key={ans.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2 text-xs"
                    >
                      <p className="font-bold text-slate-200 leading-normal">{ans.question?.text}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                          ans.answerValue === 'YES' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : ans.answerValue === 'NO'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {ans.answerValue}
                        </span>

                        <span className="text-[10px] text-slate-500 font-semibold">
                          Confidence: <b className="text-slate-400 font-bold">{Math.round(ans.confidenceScore * 100)}%</b>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom summary and key results */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
              <div className="md:col-span-2 space-y-1">
                <h4 className="font-bold text-slate-200">AI Call Recap & Summary:</h4>
                <p className="leading-relaxed text-slate-500">{activeRec.summary || 'Summary generation processing...'}</p>
              </div>

              <div className="space-y-2 border-l border-slate-850 pl-6 flex flex-col justify-center">
                <div className="flex justify-between font-semibold">
                  <span>Sentiment Indicator:</span>
                  <b className={`uppercase ${
                    activeRec.aiReview?.sentiment === 'POSITIVE' ? 'text-emerald-400' :
                    activeRec.aiReview?.sentiment === 'NEGATIVE' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {activeRec.aiReview?.sentiment || 'NEUTRAL'}
                  </b>
                </div>

                <div className="flex justify-between font-semibold">
                  <span>Review Compensation:</span>
                  <b className="text-emerald-400 font-extrabold">
                    {activeRec.aiReview ? `${activeRec.aiReview.earningsAmount >= 0 ? '+' : ''}$${activeRec.aiReview.earningsAmount.toFixed(2)}` : '$0.00'}
                  </b>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

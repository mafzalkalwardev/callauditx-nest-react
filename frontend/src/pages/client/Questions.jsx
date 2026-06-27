import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import { 
  HelpCircle, 
  Trash2, 
  Plus, 
  Upload, 
  Layers,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

export const ClientQuestions = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [questions, setQuestions] = useState([]);
  
  // New Question Form
  const [text, setText] = useState('');
  const [type, setType] = useState('YES_NO');
  const [options, setOptions] = useState('');

  // Bulk CSV pasting state
  const [csvPaste, setCsvPaste] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCat) {
      fetchQuestions(selectedCat);
    }
  }, [selectedCat]);

  const fetchCategories = async () => {
    try {
      const list = await categoriesAPI.list();
      setCategories(list);
      if (list.length > 0) {
        setSelectedCat(list[0].id);
      }
    } catch (e) {
      console.warn("Could not load categories", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (catId) => {
    try {
      const list = await categoriesAPI.listQuestions(catId);
      setQuestions(list);
    } catch (e) {
      console.warn("Could not load questions", e);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await categoriesAPI.createQuestion(selectedCat, text, type, options);
      setText('');
      setOptions('');
      fetchQuestions(selectedCat);
    } catch (e) {
      alert("Failed to add question");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await categoriesAPI.deleteQuestion(id);
      fetchQuestions(selectedCat);
    } catch (e) {
      alert("Failed to delete question");
    }
  };

  const handleBulkImport = async () => {
    if (!csvPaste.trim()) return;
    
    // Parse simulated CSV rows
    // Expect format: question text, type, options
    const rows = csvPaste.split('\n').map(row => {
      const parts = row.split(',');
      return {
        text: parts[0]?.trim(),
        type: parts[1]?.trim() || 'YES_NO',
        options: parts[2]?.trim() || null
      };
    }).filter(r => r.text);

    try {
      await categoriesAPI.bulkImportQuestions(selectedCat, rows);
      setCsvPaste('');
      setBulkMode(false);
      fetchQuestions(selectedCat);
    } catch (e) {
      alert("Error importing CSV templates");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Audit Checklist Questions</h1>
          <p className="text-slate-400 text-sm mt-1">Configure individual questions the AI will analyze for each recording.</p>
        </div>
        
        <button
          onClick={() => setBulkMode(!bulkMode)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>{bulkMode ? 'Add Single Question' : 'Bulk CSV Templates'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Create / CSV Import */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Target Category</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {bulkMode ? (
            /* CSV Import Form */
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulated CSV Template Paste</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Format: Question Text, Type (YES_NO | TEXT | RATING | MULTIPLE_CHOICE), Options comma separated
                </p>
                <textarea
                  value={csvPaste}
                  onChange={(e) => setCsvPaste(e.target.value)}
                  rows={6}
                  placeholder={`Was an appointment booked?,YES_NO
Rate agent politeness,RATING,1\\,2\\,3\\,4\\,5
Who answered?,MULTIPLE_CHOICE,Sales\\,Voicemail\\,Support`}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <button
                onClick={handleBulkImport}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Import CSV Checklist</span>
              </button>
            </div>
          ) : (
            /* Single Question Form */
            <form onSubmit={handleCreateQuestion} className="space-y-4.5 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Prompt</label>
                <input
                  type="text"
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Did customer confirm scheduling?"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="YES_NO">Yes / No</option>
                  <option value="RATING">Rating Scale (options/numbers)</option>
                  <option value="TEXT">Descriptive Custom Text</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice options</option>
                </select>
              </div>

              {(type === 'MULTIPLE_CHOICE' || type === 'RATING') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comma Separated Options</label>
                  <input
                    type="text"
                    required
                    value={options}
                    onChange={(e) => setOptions(e.target.value)}
                    placeholder="e.g. 1,2,3,4,5 or Inbound,Outbound,IVR"
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Checklist</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Questions Checklist Listing */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
          <div>
            <h2 className="font-extrabold text-white text-base">Active Category Questions Checklist</h2>
            <p className="text-slate-500 text-xs mt-1">These are evaluated by AI review engine when processing recordings.</p>
          </div>

          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {questions.length === 0 ? (
              <div className="p-12 text-center bg-slate-950/40 rounded-2xl border border-slate-850">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No questions configured for this category yet.</p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <div 
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between group hover:border-slate-800 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-bold text-slate-200 text-xs">{q.text}</p>
                    {q.options && (
                      <p className="text-[10px] text-slate-500 font-mono">Options: {q.options}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

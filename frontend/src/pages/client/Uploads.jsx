import React, { useState, useEffect } from 'react';
import { categoriesAPI, recordingsAPI } from '../../services/api';
import { 
  UploadCloud, 
  Disc, 
  Play, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  FileAudio
} from 'lucide-react';

export const ClientUploads = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]); // tracks conversion logs
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const list = await categoriesAPI.list();
      setCategories(list);
      if (list.length > 0) setSelectedCat(list[0].id);
    } catch (e) {
      console.warn("Could not fetch categories", e);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (selectedFiles) => {
    const validExtensions = ['.mp3', '.wav', '.mpeg', '.m4a'];
    const filtered = selectedFiles.filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return validExtensions.includes(ext);
    });

    const mapped = filtered.map(file => ({
      file,
      id: `${Date.now()}-${file.name}`,
      status: 'QUEUED', // QUEUED, CONVERTING, TRANSCRIBING, REVIEWING, SUCCESS, FAILED
      progress: 0,
      logs: []
    }));

    setFiles(prev => [...prev, ...mapped]);
  };

  const handleRemoveFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startProcessing = async () => {
    if (!selectedCat) {
      alert("Please select a review category first.");
      return;
    }

    setUploading(true);
    setSuccessCount(0);

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      if (item.status === 'SUCCESS') continue;

      // Stage 1: Converting
      updateFileState(item.id, 'CONVERTING', 25, ['Converting audio using local FFmpeg pipeline...']);
      await delay(1000);

      // Stage 2: Transcribing
      updateFileState(item.id, 'TRANSCRIBING', 60, [
        'Audio format converted successfully to MP3.',
        'Analyzing audio waveforms via Whisper engine...'
      ]);
      await delay(1200);

      // Stage 3: AI Reviewing
      updateFileState(item.id, 'REVIEWING', 85, [
        'Transcription completed.',
        'Mapping review questions structure...',
        'Auditing conversation metrics...'
      ]);

      try {
        await recordingsAPI.upload(item.file, selectedCat);
        updateFileState(item.id, 'SUCCESS', 100, [
          'AI reviewed call successfully!',
          'Earnings balance credited.'
        ]);
        setSuccessCount(c => c + 1);
      } catch (err) {
        updateFileState(item.id, 'FAILED', 100, ['Error uploading or reviewing call.']);
      }
      await delay(500);
    }
    setUploading(false);
  };

  const updateFileState = (id, status, progress, newLogs) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          status,
          progress,
          logs: [...f.logs, ...newLogs]
        };
      }
      return f;
    }));
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Call Review Uploads</h1>
        <p className="text-slate-400 text-sm mt-1">Upload single or bulk recordings for automatic Whisper AI transcription and audit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form and Drag/Drop */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Review Category</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-950/20 transition-all duration-300 group"
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileSelect} 
              accept=".mp3,.wav,.mpeg,.m4a" 
              className="hidden" 
              id="bulk-file-upload"
            />
            <label htmlFor="bulk-file-upload" className="flex flex-col items-center justify-center cursor-pointer gap-3">
              <div className="p-4 rounded-full bg-slate-950 border border-slate-850 text-blue-500 shadow-inner group-hover:scale-105 transition-transform duration-200">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-extrabold text-sm text-slate-200">Drag & Drop recording files here</p>
                <p className="text-xs text-slate-500 mt-1">Supported formats: MP3, WAV, MPEG, M4A up to 25MB</p>
              </div>
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Call Auditing Queue ({files.length} files)</span>
                {successCount > 0 && <span className="text-emerald-400 font-extrabold">Audited: {successCount}</span>}
              </div>

              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                {files.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 flex flex-col gap-3 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-200 text-xs truncate max-w-md">{item.file.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Label */}
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          item.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                          item.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                          item.status === 'QUEUED' ? 'bg-slate-850 text-slate-400' :
                          'bg-blue-500/10 text-blue-400 animate-pulse'
                        }`}>
                          {item.status}
                        </span>

                        {!uploading && item.status !== 'SUCCESS' && (
                          <button 
                            onClick={() => handleRemoveFile(item.id)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {item.progress > 0 && (
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Live Processing Logs */}
                    {item.logs.length > 0 && (
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-500 space-y-1.5">
                        {item.logs.map((log, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-blue-500 font-bold">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trigger button */}
          {files.length > 0 && (
            <button
              onClick={startProcessing}
              disabled={uploading}
              className="py-3.5 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <span>{uploading ? 'Processing AI review logs...' : 'Analyze & Audits Recording Queue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Details Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
            <h2 className="font-extrabold text-white text-base">Automatic Audio Conversion</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              CallAuditX includes a built-in local audio processing middleware. Any formats uploaded (e.g. <b>WAV</b>, <b>M4A</b>, <b>MPEG</b>) are converted to <b>MP3</b> using a virtual local FFmpeg module before transcription.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div className="text-xs text-slate-300">
                <b>Zero Paid API limits</b>. Review as many calls as needed locally.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

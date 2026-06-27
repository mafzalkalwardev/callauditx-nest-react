import React, { useState } from 'react';
import { Settings, Shield, Sliders, CheckCircle } from 'lucide-react';

export const AdminSettings = () => {
  const [inboundRate, setInboundRate] = useState('0.70');
  const [bookedRate, setBookedRate] = useState('1.20');
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Global Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure global payout schedules, Whisper transcription parameters, and system behaviors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payout rates */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-slate-200 text-sm">Platform Payout Structures</h3>
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5" />
              <span>Global payout parameters updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4.5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inbound Calls Base ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={inboundRate}
                  onChange={(e) => setInboundRate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appointment Booked ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={bookedRate}
                  onChange={(e) => setBookedRate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all w-max"
            >
              Update Payout Schedule
            </button>
          </form>
        </div>

        {/* AI Parameters */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <h3 className="font-extrabold text-slate-200 text-sm">Transcription Engine</h3>
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              Toggle global speech models. Free sandboxed speech recognition is active.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer">
                <input type="radio" defaultChecked name="whisper-model" className="accent-blue-500" />
                <span>CallAuditX Local NLP (Sandbox)</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-500 cursor-not-allowed">
                <input type="radio" disabled name="whisper-model" />
                <span>Whisper-1 Cloud (Paid API)</span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Key, CheckCircle } from 'lucide-react';

export const ClientSettings = () => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState(user?.companyName || '');
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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your corporate tenant environment parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Profile */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-slate-200 text-sm">Tenant Configuration</h3>
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4.5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Role</label>
                <input
                  type="text"
                  disabled
                  value={user?.role || ''}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-500 text-sm cursor-not-allowed uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Support LLC"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all w-max"
            >
              Save Configuration
            </button>
          </form>
        </div>

        {/* Security / API */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-500" />
              <h3 className="font-extrabold text-slate-200 text-sm">Sandbox API Key</h3>
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              Integrate CallAuditX reviews pipeline directly with your telephony systems (Asterisk, Twilio).
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-400 flex items-center justify-between">
              <span>cax_live_7384...92h7</span>
              <button 
                type="button"
                onClick={() => alert("Copied API key to clipboard")}
                className="text-[9px] text-blue-400 font-bold hover:underline"
              >
                COPY
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

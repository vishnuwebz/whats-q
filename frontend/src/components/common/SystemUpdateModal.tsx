import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Sparkles, ArrowRight, ShieldCheck, Database, RefreshCw,
  GitBranch, CheckCircle2, Clock, AlertTriangle, X
} from 'lucide-react';

export const SystemUpdateModal: React.FC = () => {
  const {
    versionInfo,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    isUpdatingSystem,
    updateProgressStep,
    triggerSystemUpdate,
    addToast
  } = useQiyamStore();

  if (!isUpdateModalOpen || !versionInfo) return null;

  const handleUpdate = async () => {
    const res = await triggerSystemUpdate();
    if (!res.success) {
      addToast(res.error || 'Update failed', 'error');
    }
  };

  const isUpToDate = !versionInfo.update_available;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden relative font-sans animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">WhatsQ System Updater</h3>
                <p className="text-emerald-100 text-xs mt-0.5">Continuous Delivery & Safe Auto-Backup</p>
              </div>
            </div>

            {!isUpdatingSystem && (
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Version Comparison Card */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
            {/* Previous / Current Version */}
            <div className="space-y-1.5 border-r border-slate-200 pr-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Current Version
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md text-xs">
                  {versionInfo.current_commit}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {versionInfo.current_date || 'Active'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                {versionInfo.current_message || 'Running production release'}
              </p>
            </div>

            {/* Target / New Version */}
            <div className="space-y-1.5 pl-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-emerald-500" /> 
                {versionInfo.update_available ? 'Available Update' : 'Latest Release'}
              </span>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                  versionInfo.update_available
                    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400/30'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {versionInfo.latest_commit}
                </span>
                {versionInfo.update_available && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-slate-700 text-[11px] font-medium line-clamp-2 leading-relaxed">
                {versionInfo.latest_message || 'Up to date with main branch'}
              </p>
            </div>
          </div>

          {/* Database Backup Guarantee Note */}
          <div className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-200/70 p-3.5 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span>Automatic PostgreSQL Database Backup</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </h4>
              <p className="text-emerald-800/80 text-[11px] mt-0.5 leading-relaxed">
                A compressed snapshot will automatically be archived in <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">/var/backups/whatsq/</code> before any files are modified.
              </p>
            </div>
          </div>

          {/* Live Progress Bar (During Update) */}
          {isUpdatingSystem && (
            <div className="space-y-2 p-4 bg-slate-900 rounded-2xl text-white">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{updateProgressStep || 'Applying system update...'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
              </div>
              <p className="text-[10px] text-slate-400">
                Please do not close this window. The application will automatically reload once ready.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isUpdatingSystem && (
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            )}

            {isUpToDate ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>System is on latest version</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isUpdatingSystem}
                onClick={handleUpdate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all disabled:opacity-50"
              >
                {isUpdatingSystem ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Applying Update...</span>
                  </>
                ) : (
                  <>
                    <span>Update System Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

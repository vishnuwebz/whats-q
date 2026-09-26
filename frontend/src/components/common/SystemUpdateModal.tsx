import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Sparkles, ArrowRight, ShieldCheck, Database, RefreshCw,
  GitBranch, CheckCircle2, Clock, AlertTriangle, X, Zap, Shield,
  Calendar, Check
} from 'lucide-react';

const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';
  if (trimmed.toLowerCase() === 'just now') return 'Just now';

  // If it already has both date and time (e.g. "Sep 14, 2026, 05:02 PM" or "Sep 14, 2026 • 05:02 PM")
  if (trimmed.includes('•') && (trimmed.includes('AM') || trimmed.includes('PM'))) {
    return trimmed;
  }
  if (trimmed.includes(', ') && (trimmed.includes('AM') || trimmed.includes('PM'))) {
    return trimmed.replace(', ', ' • ');
  }

  // Parse ISO date or standard format
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d).replace(', ', ' • ');
    }
  } catch {
    // fallback
  }

  return trimmed;
};

export const SystemUpdateModal: React.FC = () => {
  const {
    versionInfo,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    isUpdatingSystem,
    updateProgressStep,
    otaCountdown,
    pauseOtaCountdown,
    triggerSystemUpdate,
    triggerForceHardRefresh,
    snoozeUpdate,
    addToast
  } = useQiyamStore();

  if (!isUpdateModalOpen || !versionInfo) return null;

  const handleUpdateNow = async () => {
    const targetCommit = versionInfo?.latest_commit || versionInfo?.current_commit || '';
    if (targetCommit) {
      try {
        localStorage.setItem('whatsq_acknowledged_commit', targetCommit);
        localStorage.setItem('whatsq_last_hard_refresh_time', Date.now().toString());
      } catch {}
    }
    await triggerSystemUpdate();
  };

  const isUpToDate = !versionInfo.update_available;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        // Prevent accidental backdrop close if an update is critical, but allow if up to date
        if (!isUpdatingSystem && isUpToDate && e.target === e.currentTarget) {
          setIsUpdateModalOpen(false);
        }
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/90 overflow-hidden relative font-sans animate-in zoom-in-95 duration-200 select-none max-h-[92dvh] flex flex-col">
        
        {/* Modal Top Hero Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 p-4 sm:p-6 text-white relative overflow-hidden border-b border-emerald-500/20 shrink-0">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Urgent / Live Pill Badge */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] font-semibold text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${versionInfo.update_available ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${versionInfo.update_available ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                </span>
                <span>{versionInfo.update_available ? 'GLOBAL UPDATE READY' : 'SYSTEM SYNCHRONIZED'}</span>
              </div>
            </div>

            {!isUpdatingSystem && (
              <button
                onClick={() => {
                  if (versionInfo.update_available) {
                    snoozeUpdate();
                  } else {
                    setIsUpdateModalOpen(false);
                  }
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white cursor-pointer"
                title={versionInfo.update_available ? 'Update Later' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative z-10 flex items-start gap-3 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/50 shrink-0 border border-emerald-400/30">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg leading-snug tracking-tight text-white">
                {versionInfo.update_available ? 'New QBS-360 Update Available' : 'QBS-360 is Up to Date'}
              </h3>
              <p className="text-emerald-200/90 text-xs mt-1 leading-relaxed">
                {versionInfo.update_available
                  ? 'A new production release is available globally. Updating now ensures enterprise security, seamless real-time messaging, and workflow stability.'
                  : 'Your system is running the latest verified production build.'}
              </p>

              {/* Prominent Last Updated & Checked Meta Strip */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 pt-2.5 border-t border-white/10 text-[11px] text-emerald-200/90">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Last Updated: <span className="text-white font-semibold">{formatDateTime(versionInfo.last_updated || versionInfo.current_date)}</span></span>
                </span>
                {versionInfo.last_checked && (
                  <span className="inline-flex items-center gap-1 text-emerald-300/70 text-[10.5px]">
                    <span className="hidden sm:inline">•</span>
                    <span>Checked: {formatDateTime(versionInfo.last_checked)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {/* Automatic Forceful Hard-Refresh Countdown Banner */}
          {versionInfo.update_available && otaCountdown !== null && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border-2 border-emerald-500/40 rounded-2xl p-3.5 space-y-2.5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                    Automatic Hard Refresh in <span className="font-mono text-emerald-700 text-sm font-black">{otaCountdown}s</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={pauseOtaCountdown}
                  className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition cursor-pointer"
                >
                  Pause Countdown
                </button>
              </div>

              {/* Live Countdown Progress Bar */}
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (otaCountdown / 5) * 100))}%` }}
                />
              </div>

              <p className="text-[10.5px] text-slate-600 leading-snug">
                QBS-360 will automatically clear browser CacheStorage, unregister ServiceWorkers, and hard-refresh to load the new production build.
              </p>
            </div>
          )}

          {/* Version Comparison Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 text-xs">
            {/* Previous / Current Version */}
            <div className="space-y-1.5 sm:border-r border-slate-200 sm:pr-3 pb-3 sm:pb-0 border-b sm:border-b-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Current Release
                </span>
                <span className="text-[9.5px] font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  Installed
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                  {versionInfo.current_commit}
                </span>
                <span className="text-[10.5px] text-slate-600 font-semibold flex items-center gap-1">
                  {formatDateTime(versionInfo.current_date) || 'Active'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] line-clamp-1 leading-snug">
                {versionInfo.current_message || 'Running production build'}
              </p>
              {versionInfo.current_author && (
                <p className="text-[10px] text-slate-400">
                  Deployed by <span className="font-medium text-slate-600">{versionInfo.current_author}</span>
                </p>
              )}
            </div>

            {/* Target / New Version */}
            <div className="space-y-1.5 sm:pl-3 pt-2 sm:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-emerald-600" /> 
                  {versionInfo.update_available ? 'Target Release' : 'Latest Release'}
                </span>
                <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  versionInfo.update_available 
                    ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {versionInfo.update_available ? 'New' : 'Verified'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  versionInfo.update_available
                    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400/40'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {versionInfo.latest_commit}
                </span>
                <span className="text-[10.5px] text-emerald-800 font-semibold">
                  {formatDateTime(versionInfo.latest_date || versionInfo.current_date)}
                </span>
              </div>
              <p className="text-slate-700 text-[11px] font-medium line-clamp-1 leading-snug">
                {versionInfo.latest_message || 'Up to date with origin/main'}
              </p>
              {versionInfo.latest_author && (
                <p className="text-[10px] text-slate-400">
                  Release by <span className="font-medium text-slate-600">{versionInfo.latest_author}</span>
                </p>
              )}
            </div>
          </div>

          {/* Release Highlights / Features */}
          {versionInfo.update_available && (
            <div className="bg-slate-50/60 rounded-2xl p-3 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Included Enhancements
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Zero-Refresh Live Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Anti-Hacking Shields</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">360° Drag Automation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">High-Concurrency Pool</span>
                </div>
              </div>
            </div>
          )}

          {/* Database Backup Guarantee Note */}
          <div className="flex items-start gap-2.5 sm:gap-3 bg-emerald-50/90 border border-emerald-200/80 p-3 rounded-2xl">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1 text-[11px]">
                <span>Zero Data Loss Protection</span>
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              </h4>
              <p className="text-emerald-800/80 text-[10.5px] mt-0.5 leading-snug">
                An automatic compressed PostgreSQL backup is saved to <code className="bg-emerald-100/90 px-1 py-0.5 rounded font-mono text-[9.5px]">/var/backups/whatsq/</code> prior to applying updates.
              </p>
            </div>
          </div>

          {/* Live Progress Bar (During Update) */}
          {isUpdatingSystem && (
            <div className="space-y-2 p-3.5 sm:p-4 bg-slate-900 rounded-2xl text-white shadow-inner animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{updateProgressStep || 'Applying system update...'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live Execution</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-pulse w-4/5 transition-all duration-500" />
              </div>
              <p className="text-[10px] text-slate-400">
                Please do not refresh or close this window. QBS-360 will cleanly reload once finished.
              </p>
            </div>
          )}

          {/* Action Buttons (Dead-Center Modal Footer) */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2">
            {!isUpdatingSystem && versionInfo.update_available && (
              <button
                type="button"
                onClick={snoozeUpdate}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer hover:shadow-sm active:scale-95 text-center"
              >
                Update Later
              </button>
            )}

            {!versionInfo.update_available && !isUpdatingSystem && (
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Close
              </button>
            )}

            <div className="flex items-center gap-2 sm:ml-auto">
              {isUpToDate ? (
                <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>System is on latest version</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUpdatingSystem}
                  onClick={handleUpdateNow}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 hover:shadow-emerald-700/40 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingSystem ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Purging Cache & Hard-Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Hard Refresh Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

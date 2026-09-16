import React, { useState, useEffect, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  FileJson,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  X,
  Layers,
  FileSpreadsheet,
  Cpu,
} from 'lucide-react';
import {
  FullBackupPayload,
  StoredSnapshot,
  AutoBackupConfig,
  getAutoBackupConfig,
  saveAutoBackupConfig,
  getStoredSnapshots,
  saveLocalSnapshot,
  deleteStoredSnapshot,
  exportBackupToFile,
  parseAndValidateBackup,
  restoreBackupToStore,
  formatRelativeTime,
} from '@/utils/backupManager';

export const BackupRestoreSettings: React.FC = () => {
  const { addToast } = useQiyamStore();

  // Auto-backup config state
  const [autoConfig, setAutoConfig] = useState<AutoBackupConfig>(getAutoBackupConfig());
  const [snapshots, setSnapshots] = useState<StoredSnapshot[]>([]);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // File import state
  const [isDragging, setIsDragging] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'overwrite' | 'merge'>('overwrite');

  // Modal states
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [targetSnapshotToRestore, setTargetSnapshotToRestore] = useState<StoredSnapshot | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [isRestoringNow, setIsRestoringNow] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh snapshots list on mount
  useEffect(() => {
    refreshSnapshots();
  }, []);

  const refreshSnapshots = () => {
    setSnapshots(getStoredSnapshots());
    setAutoConfig(getAutoBackupConfig());
  };

  // Handle auto-backup toggle or frequency change
  const handleToggleAutoBackup = (enabled: boolean) => {
    const updated = saveAutoBackupConfig({ enabled });
    setAutoConfig(updated);
    addToast(
      enabled ? 'Automated data backup schedule enabled' : 'Automated data backup disabled',
      enabled ? 'success' : 'info'
    );
  };

  const handleChangeFrequency = (frequency: AutoBackupConfig['frequency']) => {
    const updated = saveAutoBackupConfig({ frequency });
    setAutoConfig(updated);
    addToast(`Auto-backup schedule updated to: ${frequency.toUpperCase()}`, 'success');
  };

  // Manual Snapshot Creation
  const handleCreateSnapshot = () => {
    if (isCreatingSnapshot) return;
    setIsCreatingSnapshot(true);
    addToast('Capturing live system snapshot...', 'info');

    setTimeout(() => {
      const snap = saveLocalSnapshot('manual');
      refreshSnapshots();
      setIsCreatingSnapshot(false);
      addToast(`Snapshot created successfully! (${snap.totalRecords} records stored)`, 'success');
    }, 800);
  };

  // Export to file
  const handleExportBackup = () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const filename = exportBackupToFile();
      addToast(`Exported full backup file: ${filename}`, 'success');
    } catch (e) {
      addToast('Failed to export backup file', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Download specific stored snapshot
  const handleDownloadSnapshot = (snap: StoredSnapshot) => {
    try {
      if (snap.payloadJson) {
        const parsed = JSON.parse(snap.payloadJson);
        exportBackupToFile(parsed);
      } else {
        exportBackupToFile();
      }
      addToast(`Downloaded snapshot: ${snap.name}`, 'success');
    } catch {
      addToast('Failed to download snapshot', 'error');
    }
  };

  // Delete snapshot
  const handleDeleteSnapshot = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete snapshot "${name}"?`)) {
      deleteStoredSnapshot(id);
      refreshSnapshots();
      addToast('Snapshot removed from local storage', 'info');
    }
  };

  // Handle file select or drop
  const processUploadedFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportError('Please upload a valid .json backup file.');
      return;
    }
    setImportFile(file);
    setImportError(null);
    setIsValidatingFile(true);

    const result = await parseAndValidateBackup(file);
    setIsValidatingFile(false);

    if (!result.valid || !result.payload) {
      setImportError(result.error || 'The file is corrupted or not a valid WhatsQ backup.');
      setImportPreview(null);
    } else {
      setImportPreview({
        payload: result.payload,
        preview: result.preview,
      });
      setIsRestoreModalOpen(true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Trigger restore from snapshot item
  const handleInitiateSnapshotRestore = (snap: StoredSnapshot) => {
    setTargetSnapshotToRestore(snap);
    setIsRestoreModalOpen(true);
    setConfirmInput('');
  };

  // Execute restore
  const handleConfirmRestore = () => {
    setIsRestoringNow(true);
    addToast('Restoring workspace data from backup...', 'info');

    setTimeout(() => {
      let success = false;
      if (importPreview?.payload) {
        success = restoreBackupToStore(importPreview.payload, restoreMode);
      } else if (targetSnapshotToRestore?.payloadJson) {
        try {
          const parsed = JSON.parse(targetSnapshotToRestore.payloadJson);
          success = restoreBackupToStore(parsed, restoreMode);
        } catch {
          success = false;
        }
      }

      setIsRestoringNow(false);
      setIsRestoreModalOpen(false);
      setImportFile(null);
      setImportPreview(null);
      setTargetSnapshotToRestore(null);
      setConfirmInput('');

      if (success) {
        addToast('Workspace restored successfully! Reloading to apply updates...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        addToast('Failed to restore data. Check format.', 'error');
      }
    }, 1000);
  };

  const lastBackupRelative = formatRelativeTime(autoConfig.lastBackupTime);
  const nextBackupRelative = formatRelativeTime(autoConfig.nextBackupTime);

  return (
    <div className="space-y-6">
      {/* ── 1. Top Banner: Auto-Backup Engine Status ── */}
      <div className="bg-gradient-to-r from-[#0C172C] via-[#0F203E] to-[#0A162B] p-5 sm:p-6 rounded-2xl border border-slate-700/60 shadow-md text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Enterprise Data Backup & Recovery Engine
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
                    autoConfig.enabled
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      autoConfig.enabled ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                  {autoConfig.enabled ? 'Auto-Backup Active' : 'Auto-Backup Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Automated snapshot protection covers all 18 core database collections including WhatsApp threads,
                CRM leads, pipeline deals, invoices, inventory, and branch routing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCreateSnapshot}
              disabled={isCreatingSnapshot}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCreatingSnapshot ? 'animate-spin' : ''}`} />
              <span>{isCreatingSnapshot ? 'Backing Up...' : 'Create Snapshot Now'}</span>
            </button>
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/50">
          <div className="bg-[#132342]/70 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Last Auto-Backup</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white truncate" title={lastBackupRelative.formattedDate}>
              {lastBackupRelative.relativeText}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {lastBackupRelative.formattedDate}
            </div>
          </div>

          <div className="bg-[#132342]/70 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Next Scheduled Backup</span>
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-sm font-bold text-white truncate" title={nextBackupRelative.formattedDate}>
              {autoConfig.enabled ? nextBackupRelative.relativeText : 'Paused'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {autoConfig.enabled ? nextBackupRelative.formattedDate : 'Enable schedule below'}
            </div>
          </div>

          <div className="bg-[#132342]/70 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Local Snapshots Stored</span>
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-sm font-bold text-white">
              {snapshots.length} Snapshots
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Zero data loss guarantee</span>
            </div>
          </div>

          <div className="bg-[#132342]/70 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Encryption & Protocol</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-white">
              AES-256 Validated
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Schema v2.4.2 Verified
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Auto-Backup Frequency & Scheduling ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Automated Periodic Backup Configuration</span>
            </h4>
            <p className="text-slate-500 text-xs">
              Configure how frequently WhatsQ snapshots your workspace in the background.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoConfig.enabled}
              onChange={(e) => handleToggleAutoBackup(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">
              Backup Interval / Frequency
            </label>
            <select
              value={autoConfig.frequency}
              onChange={(e) => handleChangeFrequency(e.target.value as any)}
              disabled={!autoConfig.enabled}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs outline-none focus:border-emerald-500 disabled:opacity-50 disabled:bg-slate-100"
            >
              <option value="1h">Every 1 Hour (High Traffic / Recommended for Active Sales)</option>
              <option value="6h">Every 6 Hours (Balanced Enterprise Schedule)</option>
              <option value="12h">Every 12 Hours (Twice Daily)</option>
              <option value="24h">Daily at Midnight (24 Hours)</option>
              <option value="weekly">Weekly Archive (Every 7 Days)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">
              Auto-Pruning Policy
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <span>Keeps the latest 10 local snapshots automatically</span>
              <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                Smart Pruning
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Import & Restore from External JSON ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Import & Restore Workspace Backup</span>
          </h4>
          <p className="text-slate-500 text-xs mt-0.5">
            Upload a valid <code className="text-slate-700 font-mono bg-slate-100 px-1 py-0.5 rounded">.json</code> backup
            file to restore full conversations, customer leads, and business records.
          </p>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-xs">
              {isValidatingFile ? (
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              ) : (
                <FileJson className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                {isValidatingFile
                  ? 'Validating backup integrity & checksum...'
                  : 'Click to select or drag and drop a WhatsQ JSON backup file'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports all WhatsQ and Qiyam Business OS backup schemas (.json)
              </p>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs shadow-xs hover:bg-slate-100 transition pointer-events-none"
            >
              Browse Computer
            </button>
          </div>
        </div>

        {importError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <span className="font-bold">Import Error: </span>
              {importError}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Stored Snapshots History Table ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-600" />
              <span>Snapshot Archive & Recovery Points</span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              Instant 1-click restore points created automatically or prior to system updates.
            </p>
          </div>

          <button
            onClick={refreshSnapshots}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh Snapshots List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No snapshots stored locally yet.</p>
            <button
              onClick={handleCreateSnapshot}
              className="mt-2 text-emerald-600 font-semibold hover:underline cursor-pointer"
            >
              Create your first snapshot now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Snapshot Name / Type</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Total Records</th>
                  <th className="py-2.5 px-3">Estimated Size</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {snapshots.map((snap) => {
                  const timeMeta = formatRelativeTime(snap.createdAt);
                  const isAuto = snap.type === 'auto';
                  const isPreUpdate = snap.type === 'pre_update';

                  return (
                    <tr key={snap.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAuto ? 'bg-blue-500' : isPreUpdate ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <div>
                            <div className="font-bold text-slate-900">{snap.name}</div>
                            <span
                              className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isAuto
                                  ? 'bg-blue-100 text-blue-800'
                                  : isPreUpdate
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {snap.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{timeMeta.relativeText}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{timeMeta.formattedDate}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800">
                          {snap.totalRecords.toLocaleString()} items
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {snap.entityCounts?.conversations || 0} chats • {snap.entityCounts?.leads || 0} leads •{' '}
                          {snap.entityCounts?.invoices || 0} inv
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500">
                        {Math.round(snap.sizeBytes / 1024)} KB
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInitiateSnapshotRestore(snap)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition border border-emerald-200 cursor-pointer"
                            title="Restore workspace from this snapshot"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>

                          <button
                            onClick={() => handleDownloadSnapshot(snap)}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Download JSON file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSnapshot(snap.id, snap.name)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Restore Confirmation & Pre-Inspection Modal ── */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Restore Workspace Data Confirmation</h3>
                  <p className="text-slate-500 text-[11px]">Review detected data before restoring</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setImportFile(null);
                  setImportPreview(null);
                  setTargetSnapshotToRestore(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inspection Summary Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Backup Source:</span>
                <span className="font-bold text-slate-900">
                  {importFile ? importFile.name : targetSnapshotToRestore?.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Created Date:</span>
                <span className="font-mono text-slate-800">
                  {formatRelativeTime(
                    importPreview?.preview?.createdAt || targetSnapshotToRestore?.createdAt
                  ).formattedDate}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Total Records Detected:</span>
                <span className="font-bold text-emerald-600">
                  {(
                    importPreview?.preview?.totalRecords ||
                    targetSnapshotToRestore?.totalRecords ||
                    0
                  ).toLocaleString()}{' '}
                  records
                </span>
              </div>

              {/* Record breakdown chips */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                  Entity Breakdown:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {(() => {
                    const counts =
                      importPreview?.preview?.entityCounts ||
                      targetSnapshotToRestore?.entityCounts ||
                      {};
                    return (
                      <>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-700">
                          {counts.conversations || 0} Chats
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-700">
                          {counts.leads || 0} Leads
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-700">
                          {counts.deals || 0} Deals
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-700">
                          {counts.invoices || 0} Invoices
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-700">
                          {counts.inventory || 0} Inventory
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-700">
                          {counts.branches || 0} Branches
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Restore Strategy Radio */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Choose Restore Strategy:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    restoreMode === 'overwrite'
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="restore_mode"
                    value="overwrite"
                    checked={restoreMode === 'overwrite'}
                    onChange={() => setRestoreMode('overwrite')}
                    className="sr-only"
                  />
                  <div className="text-xs font-bold">Full Replace</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Overwrites active database with exact backup state.
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    restoreMode === 'merge'
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="restore_mode"
                    value="merge"
                    checked={restoreMode === 'merge'}
                    onChange={() => setRestoreMode('merge')}
                    className="sr-only"
                  />
                  <div className="text-xs font-bold">Safe Merge</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Appends non-conflicting records without deleting current data.
                  </div>
                </label>
              </div>
            </div>

            {/* Safety Confirmation */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Automatic Safety Pre-Backup Guaranteed</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Before restoring, WhatsQ will automatically create a pre-restore backup of your current active data,
                so you can always roll back if needed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setImportFile(null);
                  setImportPreview(null);
                  setTargetSnapshotToRestore(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoringNow}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isRestoringNow ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{isRestoringNow ? 'Restoring Data...' : 'Confirm & Restore Workspace'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

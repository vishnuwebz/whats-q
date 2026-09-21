import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  X,
  Check,
  Trash2,
  User,
  Tag,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { LinkedEmployeeDevice } from '@/types';
import { useQiyamStore } from '@/store/useQiyamStore';

interface EditEmployeeDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: LinkedEmployeeDevice | null;
}

export const EditEmployeeDeviceModal: React.FC<EditEmployeeDeviceModalProps> = ({
  isOpen,
  onClose,
  device,
}) => {
  const { updateEmployeeDevice, unlinkEmployeeDevice, addToast } = useQiyamStore();

  const [deviceLabel, setDeviceLabel] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    if (device) {
      setDeviceLabel(device.device_label || '');
      setEmployeeName(device.employee_name || '');
    }
  }, [device]);

  if (!isOpen || !device) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!device) return;

    const trimmedLabel = deviceLabel.trim() || 'Employee WhatsApp Line';
    const trimmedName = employeeName.trim() || trimmedLabel;

    setIsSaving(true);
    try {
      await updateEmployeeDevice(device.id, {
        device_label: trimmedLabel,
        employee_name: trimmedName,
      });
      setIsSaving(false);
      onClose();
    } catch (err) {
      setIsSaving(false);
      addToast('Failed to update line. Please retry.', 'error');
    }
  };

  const handleUnlink = async () => {
    if (!device) return;
    if (
      window.confirm(
        `Are you sure you want to disconnect and unlink "${device.device_label}" (${device.phone_number})?`
      )
    ) {
      setIsUnlinking(true);
      try {
        await unlinkEmployeeDevice(device.id);
        setIsUnlinking(false);
        onClose();
      } catch (err) {
        setIsUnlinking(false);
        addToast('Failed to unlink device', 'error');
      }
    }
  };

  const labelPresets = [
    'Surat Wholesale Line',
    'Mumbai Shop',
    'Sales Desk - Ramesh',
    'Kozhikode Support',
    'Field Tech - Amit',
    'Customer Care Desk',
  ];

  const staffPresets = [
    'Ramesh Kumar',
    'Priya Patel',
    'Vishnu (Manager)',
    'Amit Sharma',
    'Deepak Verma',
    'Support Agent',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-600 shadow-2xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                Edit WhatsApp Line
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update staff name and channel label for this connected device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 bg-slate-50/40">
          {/* Active Device Info Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-mono font-bold text-sm">
                📱
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-slate-900">
                  {device.phone_number || '+91 94963 00233'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {device.device_type || 'WhatsApp Web Multi-Device'}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected &amp; Active</span>
            </div>
          </div>

          {/* Field: Employee / Staff Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Employee / Staff Name</span>
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs"
            />
            {/* Staff Presets */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {staffPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setEmployeeName(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    employeeName === preset
                      ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Field: Line Label / Department */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Line Label (Display Name)</span>
            </label>
            <input
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              placeholder="e.g. Surat Wholesale Line"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
            />
            {/* Label Presets */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {labelPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDeviceLabel(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    deviceLabel === preset
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hybrid Routing Notice</span>
            </div>
            <p className="text-[10.5px] leading-relaxed text-slate-500">
              When this channel is selected in the chat composer, replies and manual messages are sent directly from this employee's WhatsApp.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleUnlink}
              disabled={isUnlinking || isSaving}
              className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
              title="Unlink and disconnect this WhatsApp device"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isUnlinking ? 'Unlinking...' : 'Unlink Device'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isUnlinking}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer active:scale-95"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || isUnlinking}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

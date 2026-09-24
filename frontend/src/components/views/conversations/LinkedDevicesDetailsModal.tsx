import React, { useState } from 'react';
import {
  Smartphone,
  X,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  ShieldCheck,
  BatteryCharging,
  Clock,
  User,
  QrCode,
  Info,
  Radio,
  Sparkles,
  Phone
} from 'lucide-react';
import { LinkedEmployeeDevice } from '@/types';
import { useQiyamStore } from '@/store/useQiyamStore';

interface LinkedDevicesDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLinkModal: () => void;
  onEditDevice: (device: LinkedEmployeeDevice) => void;
}

export const LinkedDevicesDetailsModal: React.FC<LinkedDevicesDetailsModalProps> = ({
  isOpen,
  onClose,
  onOpenLinkModal,
  onEditDevice,
}) => {
  const {
    linkedDevices,
    unlinkEmployeeDevice,
    metaConfig,
    requestGeneralConfirmation,
    addToast
  } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [unlinkingId, setUnlinkingId] = useState<string | number | null>(null);

  if (!isOpen) return null;

  const filteredDevices = linkedDevices.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (d.device_label || '').toLowerCase().includes(q) ||
      (d.employee_name || '').toLowerCase().includes(q) ||
      (d.phone_number || '').includes(q)
    );
  });

  const handleUnlink = (device: LinkedEmployeeDevice) => {
    requestGeneralConfirmation({
      title: 'Disconnect & Unlink Phone?',
      message: `Are you sure you want to unlink "${device.device_label || device.employee_name || 'Device'}" (${device.phone_number || 'phone'})?`,
      description:
        'This phone will be unlinked from the Multi-Device Inbox. Any active Baileys session on this device will be logged out safely.',
      variant: 'danger',
      icon: 'unlink',
      confirmLabel: 'Disconnect & Unlink',
      cancelLabel: 'Keep Connected',
      itemBadge: {
        label: device.device_label || 'WhatsApp Line',
        sublabel: `${device.phone_number || ''}${device.employee_name ? ` • ${device.employee_name}` : ''}`,
        badgeText: 'Will Unlink',
      },
      onConfirm: async () => {
        setUnlinkingId(device.id);
        try {
          await unlinkEmployeeDevice(device.id);
        } catch {
          addToast('Failed to unlink device', 'error');
        } finally {
          setUnlinkingId(null);
        }
      },
    });
  };

  const officialLine = metaConfig?.business_phone_display || '+91 94963 00233';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="devices-details-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="devices-details-title" className="text-base sm:text-lg font-bold text-slate-900">
                  Multi-Device Inbox: Linked Phones
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {linkedDevices.length} Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of employee WhatsApp phone lines synchronized into this shared dashboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Guidance Callout (To avoid any confusions) */}
        <div className="px-4 sm:px-5 py-3 bg-amber-50/70 border-b border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-950">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900">
              How Multi-Device Inbox Works vs. Company Official Line:
            </p>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              • <strong>Employee Phone Lines:</strong> By scanning the QR code, staff phones link to this dashboard so their direct customer chats sync here for multi-agent support.
            </p>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              • <strong>Company Official Line ({officialLine}):</strong> Official marketing campaigns and automated templates always dispatch through the verified Meta Cloud API line.
            </p>
          </div>
        </div>

        {/* Filter bar & Quick Stats */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by label, employee, or phone number..."
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenLinkModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link New Phone</span>
            </button>
          </div>
        </div>

        {/* Device List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredDevices.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">
                {searchQuery ? 'No matching phone lines found' : 'No employee phones linked yet'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching with a different employee name, line label, or phone number.'
                  : 'Link your sales, support, or dispatch staff WhatsApp devices via QR code to enable multi-device collaboration.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={onOpenLinkModal}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR Code to Link Phone</span>
                </button>
              )}
            </div>
          ) : (
            filteredDevices.map((device, index) => {
              const isUnlinkingThis = unlinkingId === device.id;
              const formattedPhone = device.phone_number
                ? device.phone_number.startsWith('+')
                  ? device.phone_number
                  : `+${device.phone_number}`
                : 'Phone not specified';

              return (
                <div
                  key={device.id || index}
                  className="group relative bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-3.5 sm:p-4 transition-all hover:shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  {/* Left: Device Avatar & Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          device.status === 'connected'
                            ? 'bg-emerald-500'
                            : device.status === 'pending'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                        title={`Status: ${device.status || 'connected'}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {device.device_label || 'Employee WhatsApp Line'}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Connected</span>
                        </span>
                      </div>

                      {/* Phone & Assigned Staff */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{formattedPhone}</span>
                        </div>

                        {device.employee_name && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{device.employee_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Protocol & Metadata pill */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-emerald-500" />
                          <span>{device.device_type || 'WhatsApp Web Multi-Device'}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                          <BatteryCharging className="w-3 h-3" />
                          <span>{device.battery_level ?? 98}% Battery</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>Active now</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditDevice(device)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      title="Edit line label or assigned staff member"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUnlinkingThis}
                      onClick={() => handleUnlink(device)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                      title="Disconnect and unlink this device"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>{isUnlinkingThis ? 'Unlinking...' : 'Disconnect'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>End-to-end encrypted Multi-Device WhatsApp pairing</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

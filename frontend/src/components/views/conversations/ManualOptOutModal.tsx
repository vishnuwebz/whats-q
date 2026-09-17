import React, { useState } from 'react';
import { Conversation } from '@/types';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import {
  Ban, X, AlertTriangle, ShieldAlert,
  MegaphoneOff, MessageSquare, RotateCcw
} from 'lucide-react';

interface ManualOptOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onConfirmOptOut: (reason: string, notes?: string) => void;
}

const REASON_PRESETS = [
  'Customer explicitly requested to stop promotional messages via WhatsApp',
  'Customer requested unsubscription over phone / voice call',
  'Customer sent email or offline request to not be contacted',
  'Do Not Disturb (DND) customer preference',
  'Duplicate contact / Incorrect phone number',
  'Other / Custom compliance reason',
];

export const ManualOptOutModal: React.FC<ManualOptOutModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onConfirmOptOut,
}) => {
  const [selectedReason, setSelectedReason] = useState(REASON_PRESETS[0]);
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen || !conversation) return null;

  const contactName = conversation.contact_name || 'Customer';
  const phoneNumber = conversation.phone_number || 'Unknown Number';

  const handleConfirm = () => {
    onConfirmOptOut(selectedReason, customNotes.trim());
    onClose();
    setCustomNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer z-10"
          title="Cancel and close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-600">
          {/* Top Caution Header */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Confirm Manual Opt-Out</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Caution
                </span>
              </h3>
              <p className="text-slate-500 mt-0.5 text-[11px] leading-snug">
                Review what happens before suppressing this contact to avoid accidental changes.
              </p>
            </div>
          </div>

          {/* Contact Identity Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
            <CustomerAvatar conversation={conversation} size="md" showPresence={false} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-900 truncate">{contactName}</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {conversation.category || 'Lead'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{phoneNumber}</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
              Currently Opted In
            </span>
          </div>

          {/* Detailed Warning: What Happens After You Confirm */}
          <div className="rounded-xl bg-rose-50/80 border border-rose-200/90 p-3.5 space-y-2.5">
            <h4 className="font-bold text-rose-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>What happens after you confirm?</span>
            </h4>

            <ul className="space-y-2 text-[11px] text-rose-900 leading-relaxed">
              <li className="flex items-start gap-2">
                <MegaphoneOff className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Marketing Broadcasts Suspended:</strong> This contact is automatically excluded from all promotional campaigns, scheduled broadcasts, and bulk message blasts to prevent spam complaints.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Template Sending Restricted:</strong> Outbound promotional templates will be locked to protect your Meta Business Account quality rating.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>1-on-1 Support Stays Available:</strong> Agents can still manually chat and answer direct, incoming customer service questions without restriction.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Easily Reversible:</strong> If the customer agrees to receive promotions later, you can click <em>"Re-subscribe with Consent"</em> at any time.
                </span>
              </li>
            </ul>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-slate-700 font-bold text-[11px]">
              Select Reason for Opt-Out:
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              {REASON_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold text-[11px]">
              Internal Operator Notes (Optional):
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g., Requested during phone call with customer on 17/09"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Cancel (Keep Opted-In)
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Confirm &amp; Enforce Opt-Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

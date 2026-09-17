import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Send,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCheck,
  Phone,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export const GlobalSendConfirmationModal: React.FC = () => {
  const { sendConfirmation, closeSendConfirmation } = useQiyamStore();
  const [showFullPreview, setShowFullPreview] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!sendConfirmation) return null;

  const {
    title = 'Confirm WhatsApp Message?',
    subtitle = 'Please verify before dispatching this message to the customer.',
    recipientName,
    recipientPhone,
    badgeText = 'WHATSAPP MESSAGE',
    badgeColor = 'emerald',
    messagePreview = '',
    metadata = [],
    confirmLabel = 'Confirm & Send to Customer',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
  } = sendConfirmation;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
    } catch (err) {
      console.error('Error during send confirmation execution:', err);
    } finally {
      setIsSubmitting(false);
      closeSendConfirmation();
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    if (onCancel) {
      onCancel();
    }
    closeSendConfirmation();
  };

  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'emerald':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const initial = (recipientName || 'C').trim().charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer z-10 disabled:opacity-50"
          title="Cancel and close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Header Icon with Alert Badge */}
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50 shadow-xs">
              <Send className="w-7 h-7 stroke-[2.2] translate-x-0.5 -translate-y-0.5" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
              <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Recipient Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>Recipient Details</span>
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}
              >
                {badgeText}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    {recipientName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {recipientPhone || 'No phone number'}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Metadata Grid */}
            {metadata.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                {metadata.map((item, idx) => (
                  <div key={idx} className="bg-white/80 border border-slate-200/60 rounded-lg p-2">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="font-bold text-slate-800 break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Preview Collapsible */}
          {messagePreview && (
            <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50 text-xs">
              <button
                type="button"
                onClick={() => setShowFullPreview((prev) => !prev)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-700 hover:bg-slate-100/80 transition-colors font-semibold"
              >
                <span className="flex items-center gap-1.5 text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Message Preview</span>
                </span>
                <span className="text-slate-400 flex items-center gap-0.5 text-[10px]">
                  {showFullPreview ? (
                    <>
                      <span>Collapse</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </span>
              </button>

              {showFullPreview && (
                <div className="p-3 bg-[#EFEAE2]/60 border-t border-slate-200/60">
                  <div className="max-h-48 overflow-y-auto pr-1">
                    <div className="bg-[#D9FDD3] text-slate-800 p-3 rounded-xl rounded-tr-none shadow-xs text-xs whitespace-pre-wrap leading-relaxed font-sans border border-emerald-200/40">
                      {messagePreview}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                        <span>Just now</span>
                        <CheckCheck className="w-3 h-3 text-sky-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accidental Touch Protection Banner */}
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Accidental Touch Protection:</span>{' '}
              Confirming will deliver an outbound WhatsApp message directly to the customer. Tap Cancel if this was clicked by mistake.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 active:scale-98 transition cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Invoice } from '@/types';
import {
  Send, X, AlertTriangle,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface ConfirmShareInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  mode?: 'share' | 'reminder';
  onConfirm: () => void;
}

export const ConfirmShareInvoiceModal: React.FC<ConfirmShareInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  mode = 'share',
  onConfirm,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen || !invoice) return null;

  const isReminder = mode === 'reminder';
  const title = isReminder ? 'Send Payment Reminder?' : 'Share Invoice via WhatsApp?';
  const subtitle = isReminder
    ? 'Confirm before dispatching an automated payment reminder to this customer.'
    : 'Confirm before sharing this official tax invoice breakdown to the customer.';

  const messageText = isReminder
    ? `📄 *Payment Reminder: Invoice ${invoice.invoice_number}*

Hello *${invoice.customer_name}*,
This is a friendly reminder that invoice *${invoice.invoice_number}* for *₹${invoice.amount.toLocaleString()}* is pending.

📅 *Due Date:* ${invoice.due_date}
💰 *Total Amount:* ₹${invoice.amount.toLocaleString()}
✅ *Paid So Far:* ₹${invoice.paid_amount.toLocaleString()}
💳 *Balance Due:* ₹${Math.max(0, invoice.amount - invoice.paid_amount).toLocaleString()}

Please reply to this chat or tap here to pay securely via UPI/Cards. Thank you!`
    : `📄 *Invoice Shared: ${invoice.invoice_number}*

Hello *${invoice.customer_name}*,
Here are the complete details for your invoice *${invoice.invoice_number}*:

📅 *Due Date:* ${invoice.due_date}
💰 *Total Amount:* ₹${invoice.amount.toLocaleString()}
✅ *Paid Amount:* ₹${invoice.paid_amount.toLocaleString()}
💳 *Balance Due:* ₹${Math.max(0, invoice.amount - invoice.paid_amount).toLocaleString()}
🏦 *Payment Mode:* ${invoice.payment_method}

Please feel free to ask if you have any questions or require an itemized breakdown.`;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
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

        <div className="p-6">
          {/* Warning Icon Badge */}
          <div className="relative w-14 h-14 mx-auto mb-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50 shadow-xs">
              <Send className="w-7 h-7 stroke-[2.2] translate-x-0.5 -translate-y-0.5" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
              <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1 mb-4">
            <h3 className="text-base font-bold text-slate-900">
              {title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Recipient & Invoice Summary Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 text-xs mb-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Recipient
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-700">
                {invoice.customer_phone || 'No phone'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {invoice.customer_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-none">
                    {invoice.customer_name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {invoice.invoice_number}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-900 text-sm">
                  ₹{invoice.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Due: {invoice.due_date}
                </div>
              </div>
            </div>
          </div>

          {/* Accidental touch warning banner */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-start gap-2.5 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Confirmation required:</span> Confirming will open the WhatsApp conversation and prepare the invoice message for the customer.
            </div>
          </div>

          {/* Message Preview Toggle */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showPreview ? 'Hide message preview' : 'View message preview'}</span>
              {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPreview && (
              <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto border border-slate-800">
                {messageText}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

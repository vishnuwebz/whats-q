import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  month: string;
  totalEmployees: number;
  grossAmount: number;
  totalDeductions: number;
  netPay: number;
  sendPayslips: boolean;
}

export const RunPayrollReviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  month,
  totalEmployees,
  grossAmount,
  totalDeductions,
  netPay,
  sendPayslips,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Confirm Payroll Disbursement</h3>
              <p className="text-[11px] text-slate-500">
                Final review for {month} salary batch processing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Payroll Cycle</span>
            <span className="font-bold text-slate-900">{month}</span>
          </div>
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Eligible Employees</span>
            <span className="font-bold text-slate-900">{totalEmployees} Employees</span>
          </div>
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Total Gross Earnings</span>
            <span className="font-mono font-bold text-slate-900">₹{grossAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Total Statutory & Tax Deductions</span>
            <span className="font-mono font-bold text-rose-600">₹{totalDeductions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-slate-800 font-bold">Total Net Payout Required</span>
            <span className="font-mono font-black text-emerald-600 text-sm">₹{netPay.toLocaleString()}</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Bank batch disbursement file (.xlsx) generated for HDFC NEFT/RTGS.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tax and PF compliance entries automatically logged into General Ledger.</span>
          </div>
          {sendPayslips && (
            <div className="flex items-center gap-2 text-slate-700">
              <Send className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Digital payslips will be emailed to all {totalEmployees} employees automatically.</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Disburse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

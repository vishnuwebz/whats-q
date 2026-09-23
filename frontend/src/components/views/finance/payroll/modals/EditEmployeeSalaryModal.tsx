import React, { useState, useEffect } from 'react';
import { X, Wallet, CheckCircle2, IndianRupee, Sparkles, AlertCircle } from 'lucide-react';
import { EmployeeTaxCompliance, EmployeeSalaryBreakdown } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: EmployeeTaxCompliance;
  onSave: (updatedRecord: EmployeeTaxCompliance) => void;
}

export const EditEmployeeSalaryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  onSave,
}) => {
  const currentSalary = record.salary_breakdown || {
    gross_ctc: record.employee_id === 'EMP004' ? 45000 : 40000,
    basic: Math.round((record.employee_id === 'EMP004' ? 45000 : 40000) * 0.4),
    hra: Math.round((record.employee_id === 'EMP004' ? 45000 : 40000) * 0.2),
    conveyance: 3000,
    special_allowance: 15000,
    other_allowances: 0,
  };

  const [grossCtc, setGrossCtc] = useState<number>(currentSalary.gross_ctc);
  const [basic, setBasic] = useState<number>(currentSalary.basic);
  const [hra, setHra] = useState<number>(currentSalary.hra);
  const [conveyance, setConveyance] = useState<number>(currentSalary.conveyance);
  const [specialAllowance, setSpecialAllowance] = useState<number>(currentSalary.special_allowance);
  const [otherAllowances, setOtherAllowances] = useState<number>(currentSalary.other_allowances || 0);

  useEffect(() => {
    if (isOpen && record) {
      const sal = record.salary_breakdown || {
        gross_ctc: record.employee_id === 'EMP004' ? 45000 : 40000,
        basic: Math.round((record.employee_id === 'EMP004' ? 45000 : 40000) * 0.4),
        hra: Math.round((record.employee_id === 'EMP004' ? 45000 : 40000) * 0.2),
        conveyance: 3000,
        special_allowance: 15000,
        other_allowances: 0,
      };
      setGrossCtc(sal.gross_ctc);
      setBasic(sal.basic);
      setHra(sal.hra);
      setConveyance(sal.conveyance);
      setSpecialAllowance(sal.special_allowance);
      setOtherAllowances(sal.other_allowances || 0);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  // Real-time calculations
  const totalAllocated = basic + hra + conveyance + specialAllowance + otherAllowances;
  const difference = grossCtc - totalAllocated;

  // Statutory deductions calculation
  const monthlyTds = record.tds ? (record.monthly_tds || 0) : 0;
  const monthlyPf = record.pf ? Math.round(basic * 0.12) : 0;
  const monthlyEsi = record.esi ? Math.round(grossCtc * 0.0075) : 0;
  const monthlyPt = record.pt ? (record.pt_monthly || 200) : 0;
  const totalDeductions = monthlyTds + monthlyPf + monthlyEsi + monthlyPt;
  const netTakeHome = grossCtc - totalDeductions;

  // Preset quick calculation helpers
  const handleApplyBasicPercent = (pct: number) => {
    const newBasic = Math.round(grossCtc * pct);
    setBasic(newBasic);
  };

  const handleApplyHraPercent = (pctOfGross: number) => {
    const newHra = Math.round(grossCtc * pctOfGross);
    setHra(newHra);
  };

  const handleAutoBalanceSpecial = () => {
    const remaining = grossCtc - (basic + hra + conveyance + otherAllowances);
    setSpecialAllowance(Math.max(0, remaining));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSalary: EmployeeSalaryBreakdown = {
      gross_ctc: Number(grossCtc) || 0,
      basic: Number(basic) || 0,
      hra: Number(hra) || 0,
      conveyance: Number(conveyance) || 0,
      special_allowance: Number(specialAllowance) || 0,
      other_allowances: Number(otherAllowances) || 0,
    };

    const updatedRecord: EmployeeTaxCompliance = {
      ...record,
      salary_breakdown: updatedSalary,
      last_updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    onSave(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Edit Salary Structure — {record.employee_name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {record.employee_id}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {record.department} • Statutory Compliance Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Monthly Gross CTC Input */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Monthly Gross CTC (₹)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Annual CTC: ₹{((Number(grossCtc) || 0) * 12).toLocaleString()}
              </span>
            </div>
            <input
              type="number"
              min="0"
              value={grossCtc}
              onChange={(e) => setGrossCtc(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Breakdown Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Salary Component Breakdown
              </span>
              <button
                type="button"
                onClick={handleAutoBalanceSpecial}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 border border-blue-200"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Balance Special Allowance</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Basic Salary */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 text-[11px]">Basic Salary (₹)</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyBasicPercent(0.4)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      40%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBasicPercent(0.5)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      50%
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={basic}
                  onChange={(e) => setBasic(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* HRA */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 text-[11px]">House Rent Allowance (HRA) (₹)</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyHraPercent(0.2)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      20% CTC
                    </button>
                    <button
                      type="button"
                      onClick={() => setHra(Math.round(basic * 0.4))}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      40% Basic
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={hra}
                  onChange={(e) => setHra(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Conveyance Allowance */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 text-[11px]">Conveyance Allowance (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={conveyance}
                  onChange={(e) => setConveyance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Special Allowance */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 text-[11px]">Special Allowance (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={specialAllowance}
                  onChange={(e) => setSpecialAllowance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Other Allowances */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700 text-[11px]">Other Fixed Allowances (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={otherAllowances}
                  onChange={(e) => setOtherAllowances(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Sum Alert Check */}
            {difference !== 0 && (
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                  difference > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {difference > 0
                      ? `Components sum to ₹${totalAllocated.toLocaleString()} (₹${difference.toLocaleString()} unallocated)`
                      : `Components exceed Gross CTC by ₹${Math.abs(difference).toLocaleString()}`}
                  </span>
                </div>
                {difference > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoBalanceSpecial}
                    className="font-bold underline cursor-pointer text-[10px] ml-2 shrink-0"
                  >
                    Add to Special
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Statutory Deductions & Take-Home Preview */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Statutory Take-Home Calculation (Live Preview)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[9px] text-slate-400 font-semibold uppercase">TDS</div>
                <div className="font-mono font-bold text-slate-800 text-[11px]">
                  -₹{monthlyTds.toLocaleString()}
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[9px] text-slate-400 font-semibold uppercase">
                  PF ({record.pf ? '12%' : '0%'})
                </div>
                <div className="font-mono font-bold text-slate-800 text-[11px]">
                  -₹{monthlyPf.toLocaleString()}
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[9px] text-slate-400 font-semibold uppercase">
                  ESI ({record.esi ? '0.75%' : '0%'})
                </div>
                <div className="font-mono font-bold text-slate-800 text-[11px]">
                  -₹{monthlyEsi.toLocaleString()}
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[9px] text-slate-400 font-semibold uppercase">PT</div>
                <div className="font-mono font-bold text-slate-800 text-[11px]">
                  -₹{monthlyPt.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-emerald-200 font-bold">
              <span className="text-slate-700">Total Statutory Deductions:</span>
              <span className="font-mono text-rose-600">-₹{totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center font-black text-sm text-emerald-900">
              <span>Net Monthly Take-Home:</span>
              <span className="font-mono text-emerald-700 text-base">₹{netTakeHome.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Salary Structure</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

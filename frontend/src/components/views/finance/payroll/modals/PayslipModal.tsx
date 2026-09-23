import React from 'react';
import { X, Printer, Download, Building2, CheckCircle2 } from 'lucide-react';
import { EmployeeSalaryDetail } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeSalaryDetail | null;
  month?: string;
}

export const PayslipModal: React.FC<Props> = ({ isOpen, onClose, employee, month = 'May 2024' }) => {
  if (!isOpen || !employee) return null;

  const basic = Math.round(employee.gross_salary * 0.4);
  const hra = Math.round(employee.gross_salary * 0.2);
  const conveyance = 3000;
  const specialAllowance = employee.gross_salary - basic - hra - conveyance;

  const pf = Math.round(basic * 0.12);
  const esi = employee.gross_salary <= 21000 ? Math.round(employee.gross_salary * 0.0075) : 0;
  const pt = 200;
  const tds = employee.deductions - pf - esi - pt > 0 ? employee.deductions - pf - esi - pt : 1500;
  const totalDeductions = pf + esi + pt + tds;
  const netPay = employee.gross_salary - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-5 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">Payslip Preview — {month}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Sheet */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-5">
          {/* Company Branding */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  Q
                </div>
                <h2 className="text-base font-black text-slate-900">Qiyam Business Solutions LLP</h2>
              </div>
              <p className="text-[11px] text-slate-500">Mavoor Road, Kozhikode, Kerala — 673004</p>
              <p className="text-[11px] text-slate-500">GSTIN: 32AABCP1234D1Z5 • PAN: AABCP1234D</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                Payslip
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2">{month}</p>
            </div>
          </div>

          {/* Employee Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name</span>
              <span className="font-bold text-slate-900">{employee.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
              <span className="font-mono font-semibold text-slate-800">{employee.employee_id}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
              <span className="font-semibold text-slate-800">{employee.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Account</span>
              <span className="font-mono font-semibold text-slate-800">{employee.bank_account || 'HDFC ••••4589'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">UAN (PF)</span>
              <span className="font-mono font-semibold text-slate-800">{employee.uan_number || '100234567890'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN</span>
              <span className="font-mono font-semibold text-slate-800">{employee.pan_number || 'ABEPS1234D'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Days Paid</span>
              <span className="font-semibold text-slate-800">31 Days</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Disbursement</span>
              <span className="font-semibold text-emerald-600">Bank Transfer</span>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 text-xs flex justify-between">
                <span>Earnings</span>
                <span>Amount (₹)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-mono font-semibold">₹{basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-600">HRA</span>
                  <span className="font-mono font-semibold">₹{hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-600">Conveyance Allowance</span>
                  <span className="font-mono font-semibold">₹{conveyance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-600">Special Allowance</span>
                  <span className="font-mono font-semibold">₹{specialAllowance.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-3 py-2.5 border-t border-slate-200 flex justify-between font-bold text-xs">
                <span className="text-slate-800">Gross Earnings</span>
                <span className="font-mono text-emerald-600 font-bold">₹{employee.gross_salary.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 text-xs flex justify-between">
                <span>Deductions</span>
                <span>Amount (₹)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-600">Provident Fund (PF)</span>
                  <span className="font-mono font-semibold">₹{pf.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-600">TDS (Income Tax)</span>
                  <span className="font-mono font-semibold">₹{tds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-600">Professional Tax (PT)</span>
                  <span className="font-mono font-semibold">₹{pt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-slate-600">ESI</span>
                  <span className="font-mono font-semibold">{esi > 0 ? `₹${esi.toLocaleString()}` : '—'}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-3 py-2.5 border-t border-slate-200 flex justify-between font-bold text-xs">
                <span className="text-slate-800">Total Deductions</span>
                <span className="font-mono text-rose-600 font-bold">₹{totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-emerald-800 text-[11px] font-bold uppercase tracking-wider block">Net Take-Home Pay</span>
              <span className="text-emerald-950 font-black text-xl font-mono">₹{netPay.toLocaleString()}</span>
            </div>
            <div className="text-right text-[11px] text-emerald-800">
              <p className="font-semibold">Credited to Account</p>
              <p className="text-[10px] text-emerald-700">Ref: SAL-2024-MAY-{employee.employee_id}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-800">Authorized Signatory</p>
              <p className="text-[10px]">Qiyam Business Solutions LLP</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">Employee Signature</p>
              <p className="text-[10px]">System Generated Payslip</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

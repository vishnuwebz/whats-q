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

  const handleDownloadHtml = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${employee.name} - ${month}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #0f172a; }
    .sheet { max-width: 680px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px; }
    .grid-4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 11px; margin-bottom: 20px; }
    .table-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 700; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .callout { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
    @media print { body { padding: 0; background: #fff; } .sheet { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #0f172a;">Qiyam Business Solutions LLP</h2>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Mavoor Road, Kozhikode, Kerala — 673004</div>
        <div style="font-size: 11px; color: #64748b;">GSTIN: 32AABCP1234D1Z5 • PAN: AABCP1234D</div>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px;">PAYSLIP</span>
        <div style="font-weight: 800; font-size: 13px; margin-top: 6px;">${month}</div>
      </div>
    </div>

    <div class="grid-4">
      <div><span style="color: #64748b; font-size: 10px; text-transform: uppercase;">Employee Name</span><div style="font-weight: 700;">${employee.name}</div></div>
      <div><span style="color: #64748b; font-size: 10px; text-transform: uppercase;">Employee ID</span><div style="font-family: monospace; font-weight: 600;">${employee.employee_id}</div></div>
      <div><span style="color: #64748b; font-size: 10px; text-transform: uppercase;">Department</span><div style="font-weight: 600;">${employee.department}</div></div>
      <div><span style="color: #64748b; font-size: 10px; text-transform: uppercase;">Disbursement</span><div style="color: #059669; font-weight: 700;">Bank Transfer</div></div>
    </div>

    <div class="table-grid">
      <table>
        <thead><tr><th>Earnings</th><th class="text-right">Amount (₹)</th></tr></thead>
        <tbody>
          <tr><td>Basic Salary</td><td class="text-right" style="font-family: monospace;">₹${basic.toLocaleString()}</td></tr>
          <tr><td>HRA</td><td class="text-right" style="font-family: monospace;">₹${hra.toLocaleString()}</td></tr>
          <tr><td>Conveyance</td><td class="text-right" style="font-family: monospace;">₹${conveyance.toLocaleString()}</td></tr>
          <tr><td>Special Allowance</td><td class="text-right" style="font-family: monospace;">₹${specialAllowance.toLocaleString()}</td></tr>
          <tr style="background: #f8fafc; font-weight: 700;"><td>Gross Earnings</td><td class="text-right" style="font-family: monospace; color: #059669;">₹${employee.gross_salary.toLocaleString()}</td></tr>
        </tbody>
      </table>

      <table>
        <thead><tr><th>Deductions</th><th class="text-right">Amount (₹)</th></tr></thead>
        <tbody>
          <tr><td>Provident Fund (PF)</td><td class="text-right" style="font-family: monospace;">₹${pf.toLocaleString()}</td></tr>
          <tr><td>TDS (Income Tax)</td><td class="text-right" style="font-family: monospace;">₹${tds.toLocaleString()}</td></tr>
          <tr><td>Professional Tax</td><td class="text-right" style="font-family: monospace;">₹${pt.toLocaleString()}</td></tr>
          <tr><td>ESI</td><td class="text-right" style="font-family: monospace;">${esi > 0 ? `₹${esi.toLocaleString()}` : '—'}</td></tr>
          <tr style="background: #f8fafc; font-weight: 700;"><td>Total Deductions</td><td class="text-right" style="font-family: monospace; color: #e11d48;">₹${totalDeductions.toLocaleString()}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="callout">
      <div>
        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #047857;">Net Take-Home Pay</span>
        <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #064e3b;">₹${netPay.toLocaleString()}</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #065f46;">
        <div>Ref: SAL-${month.toUpperCase().replace(/\s+/g, '-')}-${employee.employee_id}</div>
        <div style="font-size: 10px; color: #047857;">Credited directly to Bank Account</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payslip_${employee.employee_id}_${month.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download HTML Payslip"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
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

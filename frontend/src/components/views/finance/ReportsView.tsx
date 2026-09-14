import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BarChart3, Download, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { exportTableToCsv } from '@/utils/exportCsv';

export const ReportsView: React.FC = () => {
  const store = useQiyamStore();
  const { addToast } = store;

  const handleExport = () => {
    const res = exportTableToCsv('finance-reports', store);
    addToast(`Financial P&L report exported (${res.filename})`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Financial Statements & Reports"
        subtitle="Profit & Loss Statements, Balance Sheets, Cash Flow forecasts, and Aging analyses."
        primaryActionLabel="Export Statement"
        onPrimaryAction={handleExport}
      />

      <div className="p-3 sm:p-6 max-w-4xl space-y-4 sm:space-y-6 text-xs">
        {/* P&L Statement Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Profit & Loss Statement (May 2024)</h3>
              <p className="text-slate-500 text-[11px]">Period: May 01, 2024 – May 31, 2024 • CoolFix Services</p>
            </div>
            <button
              onClick={() => addToast('Downloading PDF Statement...', 'success')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-xs text-slate-900 uppercase tracking-wider text-slate-400">Revenue</div>
            <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500">
              <div className="flex justify-between">
                <span className="text-slate-600">AC Installation & Maintenance Services:</span>
                <span className="font-bold text-slate-900">₹18,45,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Cleaning & Plumbing Contracts:</span>
                <span className="font-bold text-slate-900">₹6,40,120</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Gross Income:</span>
                <span className="text-emerald-600 text-sm">₹24,85,320</span>
              </div>
            </div>

            <div className="font-bold text-xs text-slate-900 uppercase tracking-wider text-slate-400 pt-2">Operating Expenses</div>
            <div className="space-y-1.5 pl-3 border-l-2 border-red-400">
              <div className="flex justify-between">
                <span className="text-slate-600">Salaries & Contractor Payouts:</span>
                <span className="font-bold text-slate-900">₹8,45,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Spare Parts & Warehouse Materials:</span>
                <span className="font-bold text-slate-900">₹2,45,130</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Rent, Fuel & Utilities:</span>
                <span className="font-bold text-slate-900">₹2,65,000</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Expenses:</span>
                <span className="text-red-600 text-sm">₹13,55,130</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex justify-between items-center text-sm font-black text-slate-900 mt-4">
              <span>Net Operating Profit (EBITDA):</span>
              <span className="text-emerald-700 text-lg">₹11,30,190 (45.5%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



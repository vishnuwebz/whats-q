import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, CreditCard, ReceiptText, FileText, BarChart3, Download
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { exportTableToCsv } from '@/utils/exportCsv';

export const FinanceOverviewView: React.FC = () => {
  const store = useQiyamStore();
  const { transactions, invoices, expenses, accounts, addToast, setActiveTab } = store;

  const totalRevenue = invoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0) || 2485320;
  const totalExpenses =
    expenses && expenses.length > 0
      ? expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)
      : transactions.filter((t) => t.tx_type === 'expense').reduce((acc, t) => acc + (Number(t.amount) || 0), 0) || 1355130;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '45.5';
  const liquidCash =
    accounts && accounts.length > 0
      ? accounts.reduce((acc, a) => acc + (Number(a.current_balance) || 0), 0)
      : 4562350;
  const accountsCount = accounts?.length || 5;

  const handleExport = () => {
    const res = exportTableToCsv('finance-overview', store);
    addToast(`Financial statement exported (${res.filename})`, 'success');
  };

  const financialData = [
    { month: 'Jan', income: 142000, expense: 85000 },
    { month: 'Feb', income: 165000, expense: 92000 },
    { month: 'Mar', income: 198000, expense: 110000 },
    { month: 'Apr', income: 215000, expense: 118000 },
    { month: 'May', income: Math.round(totalRevenue / 10), expense: Math.round(totalExpenses / 10) },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Financial Overview"
        subtitle="Summary of company revenue, expenses, net profit, and banking cash flows."
        primaryActionLabel="Export Financial Statement"
        onPrimaryAction={handleExport}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold truncate">Total Revenue</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{invoices.length} invoices billed</span>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold truncate">Total Expenses</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">₹{totalExpenses.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">Salaries, Rent & Ops</div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold truncate">Net Profit (EBITDA)</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-black ${netProfit >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
              ₹{netProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-purple-600 font-bold mt-1">{profitMargin}% Margin</div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold truncate">Liquid Cash</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-700">₹{liquidCash.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">{accountsCount} bank accounts</div>
          </div>
        </div>

        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Income vs Expense Comparison (2024)</h3>
              <p className="text-xs text-slate-500">Monthly breakdown of billed revenue vs operating expenses</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-red-500 ml-3">
                <span className="w-3 h-3 rounded bg-red-400" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']} />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Finance Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div
            onClick={() => setActiveTab('finance-invoices')}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition-all space-y-1"
          >
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Invoices Ledger</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-slate-500">View sent, paid & overdue invoices</div>
          </div>

          <div
            onClick={() => setActiveTab('finance-transactions')}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition-all space-y-1"
          >
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Transactions</span>
              <ReceiptText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-slate-500">Live bank sync & cash ledgers</div>
          </div>

          <div
            onClick={() => setActiveTab('finance-expenses')}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition-all space-y-1"
          >
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Expenses & Budget</span>
              <CreditCard className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-slate-500">Track vendor bills & category limits</div>
          </div>

          <div
            onClick={() => setActiveTab('finance-reports')}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition-all space-y-1"
          >
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Financial Reports</span>
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-slate-500">P&L, Cash Flow, Balance Sheets</div>
          </div>
        </div>
      </div>
    </div>
  );
};



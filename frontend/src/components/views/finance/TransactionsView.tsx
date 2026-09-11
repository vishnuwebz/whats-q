import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Receipt, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, addToast } = useQiyamStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.tx_type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.description.toLowerCase().includes(q) || t.party.toLowerCase().includes(q) || t.reference_id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Transactions"
        subtitle="Detailed financial transactions, income credits, vendor debits, and transfers."
        primaryActionLabel="Add Transaction"
        onPrimaryAction={() => addToast('Add transaction modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        {/* Filters & Search */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Income Credits
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === 'expense' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Expenses
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or description..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none w-56 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Transactions Table (Matching photo_8) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Party / Customer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account / Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((t) => {
                const isIncome = t.tx_type === 'income';

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-500">{t.date_str}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.reference_id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.description}</td>
                    <td className="py-3.5 px-4 text-slate-600">{t.party}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{t.account}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{t.payment_mode}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-black text-sm ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'} ₹{t.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



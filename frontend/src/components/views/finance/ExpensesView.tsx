import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { CreditCard, Plus, Search, Filter, TrendingDown, DollarSign, X } from 'lucide-react';
import { Expense } from '@/types';
import { isDateWithinInterval } from '@/utils/dateFilter';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, addToast, globalFilter, globalDateInterval } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    date_str: 'Today',
    description: '',
    category: 'Operations',
    vendor: '',
    amount: 2500,
    payment_mode: 'UPI',
    project: 'Field Operations',
    status: 'paid' as Expense['status'],
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    await addExpense(form);
    setIsModalOpen(false);
    setForm({
      date_str: 'Today',
      description: '',
      category: 'Operations',
      vendor: '',
      amount: 2500,
      payment_mode: 'UPI',
      project: 'Field Operations',
      status: 'paid',
    });
  };

  const filtered = expenses.filter((exp) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      if (s === 'paid' && exp.status !== 'paid') return false;
      if (s === 'pending' && exp.status !== 'pending') return false;
      if (!['paid', 'pending'].includes(s) && exp.status !== s) return false;
    }
    if (!isDateWithinInterval(exp.date_str, globalDateInterval)) {
      return false;
    }
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        exp.description.toLowerCase().includes(q) ||
        exp.vendor.toLowerCase().includes(q) ||
        exp.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Expenses & Budget Utilization"
        subtitle="Manage vendor bills, operating expenditures, salaries, and category budget caps."
        primaryActionLabel="Record Expense"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Total Expenses (May)</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">₹13,55,130</div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">Budget: ₹15,00,000</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Salaries & Wages</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">₹8,45,000</div>
            <div className="text-[11px] text-slate-500 mt-0.5">18 employees paid</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Rent & Utilities</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">₹1,85,000</div>
            <div className="text-[11px] text-slate-500 mt-0.5">HO + 4 branches</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Budget Utilization</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">90.3%</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Within forecast</div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[760px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor / Payee</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{exp.date_str}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{exp.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{exp.vendor}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{exp.payment_mode}</td>
                    <td className="py-3.5 px-4 text-right font-black text-sm text-red-600 whitespace-nowrap">
                      - ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-4 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Record Operational Expense</h3>
                  <p className="text-[11px] text-slate-500">Log vendor bills, inventory spares purchases, or utilities.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Copper Pipe Roll Restock (50m)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Vendor / Payee</label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder="e.g. Calicut Spares Mart"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Spare Parts & Inventory">Spare Parts & Inventory</option>
                    <option value="Fuel & Travel">Fuel & Travel</option>
                    <option value="Salaries & Wages">Salaries & Wages</option>
                    <option value="Marketing & WhatsApp Ads">Marketing & WhatsApp Ads</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Payment Mode</label>
                  <select
                    value={form.payment_mode}
                    onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Corporate Debit Card">Corporate Debit Card</option>
                    <option value="Petty Cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-700/20 cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

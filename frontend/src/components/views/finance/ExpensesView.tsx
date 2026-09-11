import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { CreditCard, Plus, Search, Filter, TrendingDown, DollarSign } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addToast } = useQiyamStore();

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Expenses & Budget Utilization"
        subtitle="Manage vendor bills, operating expenditures, salaries, and category budget caps."
        primaryActionLabel="Record Expense"
        onPrimaryAction={() => addToast('Record expense modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Total Expenses (May)</div>
            <div className="text-2xl font-black text-slate-900 mt-1">₹13,55,130</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Budget limit: ₹15,00,000</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Salaries & Wages</div>
            <div className="text-2xl font-black text-slate-900 mt-1">₹8,45,000</div>
            <div className="text-[11px] text-slate-500 mt-0.5">18 employees paid</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Rent & Utilities</div>
            <div className="text-2xl font-black text-slate-900 mt-1">₹1,85,000</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Head office + 4 branches</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Budget Utilization</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">90.3%</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Within projected forecast</div>
          </div>
        </div>

        {/* Expenses Table (Matching photo_11) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
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
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500">{exp.date_str}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{exp.description}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{exp.vendor}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{exp.payment_mode}</td>
                  <td className="py-3.5 px-4 text-right font-black text-sm text-red-600">
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
  );
};



import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Wallet, Search, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const PaymentsView: React.FC = () => {
  const { transactions, addToast } = useQiyamStore();

  const paymentMethodData = [
    { name: 'UPI (GPay / PhonePe)', value: 1485000, color: '#10B981' },
    { name: 'Bank Transfer / NEFT', value: 650000, color: '#3B82F6' },
    { name: 'Cards / Razorpay', value: 225320, color: '#8B5CF6' },
    { name: 'Cash in Hand', value: 125000, color: '#F59E0B' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Payments & UPI Collections"
        subtitle="Real-time UPI collection reconciliations, instant QR codes, and payment gateway webhooks."
        primaryActionLabel="Generate UPI QR"
        onPrimaryAction={() => addToast('UPI QR code generated for +91 98765 43210', 'success')}
      />

      <div className="p-6 space-y-6">
        {/* Payment Methods Chart Card (Matching photo_6) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Collections by Payment Method (May 2024)</h3>
            <p className="text-xs text-slate-500">₹24,85,320 total receipts collected</p>
          </div>

          <div className="flex items-center justify-around py-2">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={4}>
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 text-xs">
              {paymentMethodData.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="font-semibold text-slate-700">{m.name}</span>
                  </div>
                  <span className="font-black text-slate-900">₹{m.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
            Recent Payment Receipts
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Account Deposited</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tx.reference_id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{tx.party}</td>
                  <td className="py-3.5 px-4 text-slate-500">{tx.date_str}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tx.payment_mode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{tx.account}</td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">
                    ₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                      VERIFIED
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



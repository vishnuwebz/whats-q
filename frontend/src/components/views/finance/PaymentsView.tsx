import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Wallet, Search, Filter, ArrowUpRight, CheckCircle2, QrCode, Copy, Download, Share2, X } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const PaymentsView: React.FC = () => {
  const { transactions, addToast, setActiveTab, openConversationForContact } = useQiyamStore();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrForm, setQrForm] = useState({
    amount: 3500,
    customer_name: 'Priya Sharma',
    phone: '+91 98765 43210',
    note: 'Invoice #INV-2024-001 Advance'
  });

  const upiUri = `upi://pay?pa=qiyamsolutions@icici&pn=Qiyam+Ventures&am=${qrForm.amount}&cu=INR&tn=${encodeURIComponent(qrForm.note)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    addToast('UPI payment link copied to clipboard!', 'success');
  };

  const incomeTx = transactions.filter((t) => t.tx_type === 'income');
  const totalReceipts = incomeTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0) || 2485320;

  const paymentMethodData = React.useMemo(() => {
    const map: Record<string, number> = {};
    if (incomeTx.length === 0) {
      return [
        { name: 'UPI (GPay / PhonePe)', value: 1485000, color: '#10B981' },
        { name: 'Bank Transfer / NEFT', value: 650000, color: '#3B82F6' },
        { name: 'Cards / Razorpay', value: 225320, color: '#8B5CF6' },
        { name: 'Cash in Hand', value: 125000, color: '#F59E0B' },
      ];
    }
    incomeTx.forEach((t) => {
      const mode = t.payment_mode || 'UPI / GPay';
      map[mode] = (map[mode] || 0) + (Number(t.amount) || 0);
    });
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];
    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [incomeTx]);

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Payments & UPI Collections"
        subtitle="Real-time UPI collection reconciliations, instant QR codes, and payment gateway webhooks."
        primaryActionLabel="Generate UPI QR"
        onPrimaryAction={() => setIsQrModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Payment Methods Chart Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Collections by Payment Method</h3>
            <p className="text-xs text-slate-500">₹{totalReceipts.toLocaleString()} total receipts collected ({incomeTx.length || transactions.length} verified)</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            <div className="w-44 h-44 shrink-0">
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

            <div className="space-y-2.5 text-xs w-full sm:w-auto">
              {paymentMethodData.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
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
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[720px]">
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
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{tx.date_str}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        {tx.payment_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{tx.account}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
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

      {/* Dynamic UPI QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Dynamic UPI Collection QR</h3>
                <p className="text-xs text-slate-500">Generate instant QR code for client payment settlement.</p>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Customer Name / Payer</label>
                  <input
                    type="text"
                    value={qrForm.customer_name}
                    onChange={(e) => setQrForm({ ...qrForm, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount to Collect (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={qrForm.amount}
                    onChange={(e) => setQrForm({ ...qrForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-slate-900 text-sm sm:text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reference / Invoice Note</label>
                  <input
                    type="text"
                    value={qrForm.note}
                    onChange={(e) => setQrForm({ ...qrForm, note: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Visual Simulated QR Container */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100 inline-block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiUri)}`}
                    alt="UPI QR Code"
                    className="w-36 h-36 mx-auto rounded"
                  />
                </div>

                <div>
                  <div className="font-black text-emerald-600 text-lg">₹{qrForm.amount.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 font-mono">VPA: qiyamsolutions@icici</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Compatible with Google Pay, PhonePe, Paytm & BHIM</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy UPI Link</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const message = `💳 *Payment Request via UPI*
Hello *${qrForm.customer_name}*,
Please find the payment request details below:

💰 *Amount Due:* ₹${qrForm.amount.toLocaleString()}
📝 *Reference:* ${qrForm.note || 'Service Payment Settlement'}
🔗 *UPI Payment Link:* ${upiUri}
📱 *VPA:* qiyamsolutions@icici

You can settle this payment instantly via Google Pay, PhonePe, Paytm, or BHIM UPI.`;

                    await openConversationForContact({
                      name: qrForm.customer_name,
                      phone: qrForm.phone || '+91 98765 43210',
                      service: qrForm.note || 'Payment Request',
                      initialMessage: message,
                      confirmationTitle: 'Send UPI Payment Request?',
                      confirmationSubtitle: `Confirm before delivering this payment request to ${qrForm.customer_name}.`,
                      confirmationBadge: 'UPI PAYMENT',
                      confirmationBadgeColor: 'emerald',
                      confirmationMetadata: [
                        { label: 'Recipient', value: qrForm.customer_name },
                        { label: 'Amount Due', value: `₹${qrForm.amount.toLocaleString()}` },
                        { label: 'Reference Note', value: qrForm.note || 'Service Payment' },
                        { label: 'UPI VPA', value: 'qiyamsolutions@icici' },
                      ],
                    });
                    setIsQrModalOpen(false);
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send via Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



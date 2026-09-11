import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Invoice } from '@/types';
import {
  FileText, Search, Filter, Plus, Download, MessageSquare,
  CheckCircle2, AlertCircle, Clock, Send, Eye, X
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const { invoices, addToast, setActiveTab } = useQiyamStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return inv.invoice_number.toLowerCase().includes(q) || inv.customer_name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Invoices & Billing"
        subtitle="Generate itemized tax invoices, collect advance payments, and send automated WhatsApp reminders."
        primaryActionLabel="Create Invoice"
        onPrimaryAction={() => addToast('Create Invoice modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Total Invoiced (May)</div>
            <div className="text-2xl font-black text-slate-900 mt-1">₹24,85,320</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">186 total invoices</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Collected Amount</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹21,45,000</div>
            <div className="text-[11px] text-slate-500 mt-0.5">86.3% collection rate</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Outstanding Pending</div>
            <div className="text-2xl font-black text-amber-500 mt-1">₹3,40,320</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">18 partially paid</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Overdue Invoices</div>
            <div className="text-2xl font-black text-red-600 mt-1">₹1,12,400</div>
            <div className="text-[11px] text-red-600 font-bold mt-0.5">14 overdue accounts</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All (186)
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Paid (142)
            </button>
            <button
              onClick={() => setFilterStatus('partial_paid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'partial_paid' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Partially Paid (18)
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'overdue' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overdue (14)
            </button>
            <button
              onClick={() => setFilterStatus('sent')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'sent' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sent (12)
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none w-56 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Invoices Table (Matching photo_27) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((inv) => {
                const isPaid = inv.status === 'paid';
                const isOverdue = inv.status === 'overdue';

                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.invoice_date}</td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.due_date}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">₹{inv.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">₹{inv.paid_amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">{inv.payment_method}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isOverdue
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToast(`WhatsApp payment reminder link sent for ${inv.invoice_number}`, 'success');
                            setActiveTab('conversations');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-[11px] flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp Reminder</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Preview Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Tax Invoice</div>
                  <h3 className="font-bold text-lg text-slate-900">{selectedInvoice.invoice_number}</h3>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Billed To</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.customer_name}</div>
                  <div className="text-slate-600 font-mono">{selectedInvoice.customer_phone}</div>
                  <div className="text-slate-500">{selectedInvoice.customer_email}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Invoice Details</span>
                  <div className="text-slate-700 mt-0.5">Date: <strong className="text-slate-900">{selectedInvoice.invoice_date}</strong></div>
                  <div className="text-slate-700">Due: <strong className="text-slate-900">{selectedInvoice.due_date}</strong></div>
                  <div className="text-slate-700">Method: <strong className="text-slate-900">{selectedInvoice.payment_method}</strong></div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                          <td className="p-2.5 text-center">{item.qty}</td>
                          <td className="p-2.5 text-right">₹{item.unitPrice.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">₹{item.amount.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-2.5 font-medium text-slate-800">AC Installation & Maintenance Services</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right">₹{selectedInvoice.amount.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">₹{selectedInvoice.amount.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-56 space-y-1.5 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18% included):</span>
                    <span>₹{(selectedInvoice.amount * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-emerald-600">₹{selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => addToast('PDF invoice downloaded', 'success')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    addToast(`Invoice PDF sent to customer via WhatsApp!`, 'success');
                    setSelectedInvoice(null);
                    setActiveTab('conversations');
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Share via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Invoice } from '@/types';
import { isDateWithinInterval } from '@/utils/dateFilter';
import {
  FileText, Search, Filter, Plus, Download, MessageSquare,
  CheckCircle2, AlertCircle, Clock, Send, Eye, X
} from 'lucide-react';
import { ConfirmShareInvoiceModal } from './ConfirmShareInvoiceModal';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    addInvoice,
    addToast,
    setActiveTab,
    openConversationForContact,
    targetHighlightId,
    globalFilter,
    globalDateInterval,
  } = useQiyamStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmInvoice, setConfirmInvoice] = useState<{
    invoice: Invoice;
    mode: 'share' | 'reminder';
  } | null>(null);

  const handleConfirmShare = () => {
    if (!confirmInvoice) return;
    const { invoice, mode } = confirmInvoice;
    const isReminder = mode === 'reminder';

    const message = isReminder
      ? `📄 *Payment Reminder: Invoice ${invoice.invoice_number}*

Hello *${invoice.customer_name}*,
This is a friendly reminder that invoice *${invoice.invoice_number}* for *₹${invoice.amount.toLocaleString()}* is pending.

📅 *Due Date:* ${invoice.due_date}
💰 *Total Amount:* ₹${invoice.amount.toLocaleString()}
✅ *Paid So Far:* ₹${invoice.paid_amount.toLocaleString()}
💳 *Balance Due:* ₹${Math.max(0, invoice.amount - invoice.paid_amount).toLocaleString()}

Please reply to this chat or tap here to pay securely via UPI/Cards. Thank you!`
      : `📄 *Invoice Shared: ${invoice.invoice_number}*

Hello *${invoice.customer_name}*,
Here are the complete details for your invoice *${invoice.invoice_number}*:

📅 *Due Date:* ${invoice.due_date}
💰 *Total Amount:* ₹${invoice.amount.toLocaleString()}
✅ *Paid Amount:* ₹${invoice.paid_amount.toLocaleString()}
💳 *Balance Due:* ₹${Math.max(0, invoice.amount - invoice.paid_amount).toLocaleString()}
🏦 *Payment Mode:* ${invoice.payment_method}

Please feel free to ask if you have any questions or require an itemized breakdown.`;

    openConversationForContact({
      name: invoice.customer_name,
      phone: invoice.customer_phone,
      service: `Invoice ${invoice.invoice_number}`,
      initialMessage: message,
      skipConfirmation: true,
    });

    if (mode === 'share') {
      setSelectedInvoice(null);
    }
    setConfirmInvoice(null);
    addToast(isReminder ? 'Payment reminder sent to WhatsApp chat!' : 'Invoice shared to WhatsApp chat!', 'success');
  };

  const [createForm, setCreateForm] = useState({
    invoice_number: `INV-2024-${String(187 + invoices.length).padStart(4, '0')}`,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    amount: 4500,
    due_date: 'June 05, 2024',
    status: 'sent' as Invoice['status'],
    payment_method: 'UPI (GPay)',
  });

  React.useEffect(() => {
    if (targetHighlightId) {
      const match = invoices.find(
        (inv) =>
          inv.invoice_number === targetHighlightId ||
          String(inv.id) === String(targetHighlightId) ||
          inv.customer_name.toLowerCase().includes(String(targetHighlightId).toLowerCase())
      );
      if (match) {
        setSelectedInvoice(match);
        setFilterStatus('all');
      }
    }
  }, [targetHighlightId, invoices]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.customer_name.trim()) return;
    const created = await addInvoice(createForm);
    setSelectedInvoice(created);
    setIsCreateModalOpen(false);
    setCreateForm({
      invoice_number: `INV-2024-${String(188 + invoices.length).padStart(4, '0')}`,
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      amount: 4500,
      due_date: 'June 05, 2024',
      status: 'sent',
      payment_method: 'UPI (GPay)',
    });
  };

  const handleDownloadPdf = (inv: Invoice) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      addToast('Popup blocked! Please allow popups to download/print the invoice.', 'error');
      return;
    }

    const itemsHtml = (inv.items && inv.items.length > 0 ? inv.items : [
      { description: 'Professional AC Repair & Maintenance Services', qty: 1, unitPrice: inv.amount, amount: inv.amount }
    ]).map((item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">₹${item.amount.toLocaleString()}</td>
      </tr>
    `).join('');

    const subtotal = inv.amount;
    const gst = Math.round(subtotal * 0.18);
    const balance = Math.max(0, inv.amount - (inv.paid_amount || 0));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${inv.invoice_number}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
            .logo-text { font-size: 24px; font-weight: 900; color: #059669; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 16px; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; }
            .totals { float: right; width: 280px; font-size: 14px; }
            .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
            .total-row { border-top: 2px solid #0f172a; font-size: 16px; font-weight: 900; color: #059669; }
            .footer { margin-top: 60px; clear: both; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-text">QIYAM VENTURES</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Official Business Operating System • GSTIN: 32AABCU9603R1ZX</div>
              <div style="font-size: 12px; color: #64748b;">Beach Road, Kozhikode, Kerala 673032</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0 0 6px 0; font-size: 20px;">TAX INVOICE</h2>
              <div style="font-size: 14px; font-weight: 700; font-family: monospace;">${inv.invoice_number}</div>
              <div style="margin-top: 6px;"><span class="badge">${inv.status.replace('_', ' ')}</span></div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <strong style="font-size: 11px; text-transform: uppercase; color: #64748b;">Billed To:</strong>
              <div style="font-size: 15px; font-weight: 700; margin-top: 4px;">${inv.customer_name}</div>
              <div style="font-size: 13px; color: #475569;">${inv.customer_phone}</div>
              <div style="font-size: 13px; color: #475569;">${inv.customer_email || 'client@qiyamventures.com'}</div>
            </div>
            <div style="text-align: right;">
              <div><strong>Invoice Date:</strong> ${inv.invoice_date || 'May 12, 2024'}</div>
              <div><strong>Payment Due:</strong> ${inv.due_date}</div>
              <div><strong>Payment Mode:</strong> ${inv.payment_method}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal:</span><span>₹${subtotal.toLocaleString()}</span></div>
            <div><span>GST (18% included):</span><span>₹${gst.toLocaleString()}</span></div>
            <div><span>Amount Paid:</span><span style="color: #059669;">₹${(inv.paid_amount || 0).toLocaleString()}</span></div>
            <div><span>Balance Due:</span><span>₹${balance.toLocaleString()}</span></div>
            <div class="total-row"><span>Total Amount:</span><span>₹${inv.amount.toLocaleString()}</span></div>
          </div>

          <div class="footer">
            <p>Thank you for choosing Qiyam Ventures! Generated electronically from Qiyam Business OS.</p>
            <p>For billing queries, WhatsApp us at +91 98765 43210 or email billing@qiyamventures.com</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addToast(`Tax invoice ${inv.invoice_number} prepared for printing / PDF export`, 'success');
  };

  const effectiveSearch = search || globalFilter.query || '';

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== 'all') {
      if (inv.status !== filterStatus) return false;
    } else if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      const match =
        inv.status === s ||
        (s === 'open' && (inv.status === 'sent' || inv.status === 'draft')) ||
        (s === 'in_progress' && inv.status === 'partial_paid') ||
        (s === 'completed' && inv.status === 'paid') ||
        (s === 'overdue' && inv.status === 'overdue');
      if (!match) return false;
    }

    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.customer_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const kpis = React.useMemo(() => {
    const totalInvoiced = invoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const totalCollected = invoices.reduce((acc, i) => acc + (Number(i.paid_amount) || 0), 0);
    const totalOutstanding = invoices
      .filter((i) => i.status === 'sent' || i.status === 'partial_paid' || i.status === 'draft')
      .reduce((acc, i) => acc + Math.max(0, (Number(i.amount) || 0) - (Number(i.paid_amount) || 0)), 0);
    const totalOverdue = invoices
      .filter((i) => i.status === 'overdue')
      .reduce((acc, i) => acc + Math.max(0, (Number(i.amount) || 0) - (Number(i.paid_amount) || 0)), 0);
    const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
    const partialCount = invoices.filter((i) => i.status === 'partial_paid').length;
    const paidCount = invoices.filter((i) => i.status === 'paid').length;
    const sentCount = invoices.filter((i) => i.status === 'sent').length;
    const collectionRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : '0';

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      totalOverdue,
      overdueCount,
      partialCount,
      paidCount,
      sentCount,
      collectionRate,
      totalCount: invoices.length,
    };
  }, [invoices]);

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Invoices & Billing"
        subtitle="Generate itemized tax invoices, collect advance payments, and send automated WhatsApp reminders."
        primaryActionLabel="Create Invoice"
        onPrimaryAction={() => setIsCreateModalOpen(true)}
      />

      <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Invoiced</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">₹{kpis.totalInvoiced.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5">{kpis.totalCount} total invoices</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Collected Amount</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹{kpis.totalCollected.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{kpis.collectionRate}% collection rate</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Outstanding Pending</div>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">₹{kpis.totalOutstanding.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-amber-600 font-medium mt-0.5">{kpis.partialCount} partially paid</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Overdue Invoices</div>
            <div className="text-xl sm:text-2xl font-black text-red-600 mt-1">₹{kpis.totalOverdue.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-red-600 font-bold mt-0.5">{kpis.overdueCount} overdue accounts</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2.5 sm:gap-0 items-stretch sm:items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 whitespace-nowrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({kpis.totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Paid ({kpis.paidCount})
            </button>
            <button
              onClick={() => setFilterStatus('partial_paid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'partial_paid' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Partially Paid ({kpis.partialCount})
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'overdue' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overdue ({kpis.overdueCount})
            </button>
            <button
              onClick={() => setFilterStatus('sent')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'sent' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sent ({kpis.sentCount})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 outline-none w-full sm:w-56 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Invoices Table (Matching photo_27) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[780px]">
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
                              setConfirmInvoice({
                                invoice: inv,
                                mode: 'reminder',
                              });
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
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
        </div>

        {/* Invoice Preview Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Tax Invoice</div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">{selectedInvoice.invoice_number}</h3>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100">
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
              <div className="border border-slate-200 rounded-xl overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[380px]">
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

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  onClick={() => handleDownloadPdf(selectedInvoice)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    setConfirmInvoice({
                      invoice: selectedInvoice,
                      mode: 'share',
                    });
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Share via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Generate New Tax Invoice</h3>
                  <p className="text-[11px] text-slate-500">Create itemized invoice, due date, and WhatsApp payment link.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Invoice Number</label>
                  <input
                    type="text"
                    value={createForm.invoice_number}
                    onChange={(e) => setCreateForm({ ...createForm, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs font-mono font-bold text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.customer_name}
                    onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={createForm.customer_phone}
                    onChange={(e) => setCreateForm({ ...createForm, customer_phone: e.target.value })}
                    placeholder="e.g. +91 89213 56789"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Email</label>
                  <input
                    type="email"
                    value={createForm.customer_email}
                    onChange={(e) => setCreateForm({ ...createForm, customer_email: e.target.value })}
                    placeholder="e.g. client@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Due Date</label>
                  <input
                    type="text"
                    value={createForm.due_date}
                    onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="sent">Sent (Unpaid)</option>
                    <option value="partial_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Default Payment Mode</label>
                <select
                  value={createForm.payment_method}
                  onChange={(e) => setCreateForm({ ...createForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="UPI (GPay)">UPI (GPay / PhonePe)</option>
                  <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT / IMPS)</option>
                  <option value="Razorpay Payment Link">Razorpay Payment Link</option>
                  <option value="Cash in Hand">Cash in Hand</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm shadow-purple-700/20 cursor-pointer"
                >
                  Create & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Warning Modal to Prevent Accidental Touches */}
      {confirmInvoice && (
        <ConfirmShareInvoiceModal
          isOpen={!!confirmInvoice}
          onClose={() => setConfirmInvoice(null)}
          invoice={confirmInvoice.invoice}
          mode={confirmInvoice.mode}
          onConfirm={handleConfirmShare}
        />
      )}
    </div>
  );
};



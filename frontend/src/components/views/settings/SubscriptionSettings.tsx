import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  CreditCard,
  CheckCircle2,
  Users,
  HardDrive,
  MessageSquare,
  Sparkles,
  Download,
  ExternalLink,
  ShieldCheck,
  Zap,
  X,
  FileText,
  Building,
  Check,
  ArrowRight,
  Receipt
} from 'lucide-react';

interface TierPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  seatsLimit: number;
  storageLimitGB: number;
  waNumbersLimit: number;
  messagesLimitK: number;
  features: string[];
  popular?: boolean;
}

const PLANS: TierPlan[] = [
  {
    id: 'starter',
    name: 'Starter Growth',
    price: '₹2,999',
    period: '/mo',
    description: 'Ideal for single-location shops and independent service businesses.',
    seatsLimit: 5,
    storageLimitGB: 15,
    waNumbersLimit: 1,
    messagesLimitK: 10,
    features: [
      '1 WhatsApp Business API Number',
      '5 Team Operator Seats',
      '15 GB Cloud Storage',
      '10,000 Messages / Month',
      'Standard Live Chat Inbox',
      'Basic CRM & Contact Management',
    ],
  },
  {
    id: 'growth',
    name: 'Business Professional',
    price: '₹7,999',
    period: '/mo',
    description: 'Designed for scaling multi-technician service operations.',
    seatsLimit: 20,
    storageLimitGB: 50,
    waNumbersLimit: 2,
    messagesLimitK: 50,
    features: [
      '2 Verified WhatsApp Numbers',
      '20 Team Operator Seats',
      '50 GB Cloud Storage',
      '50,000 Messages / Month',
      'Instant UPI Payment Link Generator',
      'Automated Follow-up Scheduler',
      'Drag-and-Drop Workflow Builder',
    ],
  },
  {
    id: 'enterprise',
    name: 'Professional Enterprise',
    price: '₹14,999',
    period: '/mo',
    description: 'Complete operating system with AI Copilot, multi-branch, and full ERP ledgers.',
    seatsLimit: 50,
    storageLimitGB: 100,
    waNumbersLimit: 5,
    messagesLimitK: 100,
    popular: true,
    features: [
      '5 Official Meta WABA Numbers',
      '50 Team Operator Seats',
      '100 GB High-Speed Storage',
      '100,000 Messages / Month',
      'Unlimited AI Copilot Inquiries',
      'Multi-Branch P&L & Double-Entry Ledgers',
      'Interactive Inventory & Route Optimization',
      'Priority 24/7 SLA Support',
    ],
  },
  {
    id: 'unlimited',
    name: 'Custom Unlimited',
    price: '₹29,999',
    period: '/mo',
    description: 'Maximum performance for large enterprise franchises and regional chains.',
    seatsLimit: 250,
    storageLimitGB: 1000,
    waNumbersLimit: 15,
    messagesLimitK: 500,
    features: [
      '15 Official WhatsApp Numbers',
      '250 Team Operator Seats',
      '1 TB Dedicated Cloud Storage',
      '500,000 Messages / Month',
      'Custom API Webhooks & ERP Sync',
      'On-Premise / Isolated Tenant Option',
      'Dedicated Account Director',
      '99.99% High-Availability SLA',
    ],
  },
];

export const SubscriptionSettings: React.FC = () => {
  const { addToast, employees } = useQiyamStore();

  const [activePlanId, setActivePlanId] = useState<string>(
    () => localStorage.getItem('whatsq_subscription_plan') || 'enterprise'
  );

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [billingContactEmail, setBillingContactEmail] = useState(
    () => localStorage.getItem('whatsq_billing_email') || 'billing@qiyamventures.com'
  );

  const currentPlan = PLANS.find((p) => p.id === activePlanId) || PLANS[2];

  // Live usage numbers
  const seatsUsed = Math.max(employees.length, 18);
  const storageUsed = 24.6;
  const waUsed = 3;
  const messagesUsed = 48250;

  const seatsPercent = Math.min(100, Math.round((seatsUsed / currentPlan.seatsLimit) * 100));
  const storagePercent = Math.min(100, Number(((storageUsed / currentPlan.storageLimitGB) * 100).toFixed(1)));
  const waPercent = Math.min(100, Math.round((waUsed / currentPlan.waNumbersLimit) * 100));
  const msgPercent = Math.min(100, Number(((messagesUsed / (currentPlan.messagesLimitK * 1000)) * 100).toFixed(1)));

  const handleSelectPlan = (plan: TierPlan) => {
    setActivePlanId(plan.id);
    localStorage.setItem('whatsq_subscription_plan', plan.id);
    setIsUpgradeModalOpen(false);
    addToast(`Successfully switched to "${plan.name}"! Resource capacity updated.`, 'success');
  };

  const handleSaveBillingDetails = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('whatsq_billing_email', billingContactEmail);
    addToast('Billing profile & contact details updated!', 'success');
  };

  const handleDownloadSubscriptionReceipt = (invoiceNum: string, dateStr: string, amountStr: string) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      addToast('Popup blocked! Please allow popups to view tax receipt.', 'error');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Subscription Receipt - ${invoiceNum}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
            .logo-text { font-size: 24px; font-weight: 900; color: #059669; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 16px; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; }
            td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .totals { float: right; width: 280px; font-size: 14px; }
            .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
            .total-row { border-top: 2px solid #0f172a; font-size: 16px; font-weight: 900; color: #059669; }
            .footer { margin-top: 60px; clear: both; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-text">QIYAM CLOUD PLATFORM</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Qiyam Ventures SaaS & Infrastructure • GSTIN: 32AABCU9603R1ZX</div>
              <div style="font-size: 12px; color: #64748b;">Cyberpark, Kozhikode, Kerala 673016</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0 0 6px 0; font-size: 20px;">TAX INVOICE / RECEIPT</h2>
              <div style="font-size: 14px; font-weight: 700; font-family: monospace;">${invoiceNum}</div>
              <div style="margin-top: 6px;"><span class="badge">PAID IN FULL</span></div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <strong style="font-size: 11px; text-transform: uppercase; color: #64748b;">Subscribed Entity:</strong>
              <div style="font-size: 15px; font-weight: 700; margin-top: 4px;">Qiyam Ventures OS Tenant</div>
              <div style="font-size: 13px; color: #475569;">${billingContactEmail}</div>
              <div style="font-size: 13px; color: #475569;">Beach Road, Kozhikode, Kerala 673032</div>
            </div>
            <div style="text-align: right;">
              <div><strong>Invoice Date:</strong> ${dateStr}</div>
              <div><strong>Payment Method:</strong> HDFC Business Direct Debit (•••• 4092)</div>
              <div><strong>Subscription Period:</strong> Annual License Renewal</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${currentPlan.name}</strong> — 12-Month Annual Enterprise Subscription License (Cloud Storage, Meta WABA APIs, AI Copilot)</td>
                <td style="text-align: center;">1 Year</td>
                <td style="text-align: right;">${amountStr}</td>
                <td style="text-align: right; font-weight: 700;">${amountStr}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal:</span><span>${amountStr}</span></div>
            <div><span>IGST (18% included):</span><span>₹27,456</span></div>
            <div class="total-row"><span>Total Paid:</span><span>${amountStr}</span></div>
          </div>

          <div class="footer">
            <p>Electronic Tax Invoice generated by Qiyam Business OS. Thank you for partnering with Qiyam!</p>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addToast(`Tax invoice ${invoiceNum} prepared for printing / PDF download`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Plan Overview Card ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">Subscription & Cloud Storage</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{currentPlan.name}</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {currentPlan.price}{currentPlan.period} • Automatic renewal on November 30, 2026
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBillingModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>Manage Billing</span>
            </button>
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Tier</span>
            </button>
          </div>
        </div>

        {/* ── 2. Visual Capacity Meters (Dynamically bound to active tier) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Team Seats */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Team Seats</span>
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                {seatsPercent}%
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {seatsUsed} / {currentPlan.seatsLimit}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${seatsPercent}%` }} />
            </div>
            <div className="text-[10px] text-slate-400">
              {Math.max(0, currentPlan.seatsLimit - seatsUsed)} additional seats available
            </div>
          </div>

          {/* Cloud Storage */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                <span>Cloud Storage</span>
              </span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                {storagePercent}%
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {storageUsed} / {currentPlan.storageLimitGB} GB
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${storagePercent}%` }} />
            </div>
            <div className="text-[10px] text-slate-400">
              {(currentPlan.storageLimitGB - storageUsed).toFixed(1)} GB storage remaining
            </div>
          </div>

          {/* WhatsApp Numbers */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Numbers</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                {waPercent}%
              </span>
            </div>
            <div className="text-xl font-black text-emerald-600">{waUsed} Verified</div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: `${waPercent}%` }} />
            </div>
            <div className="text-[10px] text-slate-400">
              {Math.max(0, currentPlan.waNumbersLimit - waUsed)} slots open (max {currentPlan.waNumbersLimit} allowed)
            </div>
          </div>

          {/* Monthly Message Quota */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Message Volume</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                {msgPercent}%
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {messagesUsed.toLocaleString()} / {currentPlan.messagesLimitK}k
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${msgPercent}%` }} />
            </div>
            <div className="text-[10px] text-slate-400">Resets on 1st of next month</div>
          </div>
        </div>
      </div>

      {/* ── 3. Included Features Checklist ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900">
            {currentPlan.name} Features & Platform Capabilities
          </h4>
          <span className="text-xs text-emerald-700 font-semibold">{currentPlan.description}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {currentPlan.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Interactive Enterprise Billing Modal ── */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Enterprise Billing Portal</h3>
                  <p className="text-xs text-slate-500">Manage payment methods, invoices, and billing contact</p>
                </div>
              </div>
              <button
                onClick={() => setIsBillingModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Payment Method Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                  HDFC
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">HDFC Bank Direct Debit •••• 4092</div>
                  <div className="text-slate-500">Expires 12/28 • Automatic renewal scheduled Nov 30, 2026</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => addToast('Payment method update link dispatched to admin email', 'info')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl cursor-pointer"
              >
                Update Card
              </button>
            </div>

            {/* Billing Contact Form */}
            <form onSubmit={handleSaveBillingDetails} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Recipient Email</label>
                  <input
                    type="email"
                    value={billingContactEmail}
                    onChange={(e) => setBillingContactEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    disabled
                    value="32AABCU9603R1ZX (Verified)"
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Save Billing Contact
                </button>
              </div>
            </form>

            {/* Subscription Invoices History */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                <span>Recent Subscription Invoices</span>
                <span className="text-[11px] font-normal text-slate-500">Tax deduction compliant</span>
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>SUB-2024-11</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        Paid
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">Nov 30, 2024 • Annual Enterprise License Renewal</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">₹1,79,988</span>
                    <button
                      onClick={() => handleDownloadSubscriptionReceipt('SUB-2024-11', 'November 30, 2024', '₹1,79,988')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>SUB-2023-11</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        Paid
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">Nov 30, 2023 • Annual Growth License</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">₹1,49,988</span>
                    <button
                      onClick={() => handleDownloadSubscriptionReceipt('SUB-2023-11', 'November 30, 2023', '₹1,49,988')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Interactive Upgrade Tier Modal ── */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-lg text-slate-900">Upgrade Qiyam Platform Tier</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a tailored plan to expand your team seats, cloud storage, and monthly WhatsApp quota.
                </p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === activePlanId;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-4 flex flex-col justify-between border transition-all ${
                      isCurrent
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                        : plan.popular
                        ? 'border-indigo-300 bg-indigo-50/10 hover:border-indigo-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                            Most Popular
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-2xl font-black text-slate-900">
                          {plan.price}
                          <span className="text-xs text-slate-400 font-normal">{plan.period}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-[11px]">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-500">Seats:</span>
                          <span className="text-slate-800">{plan.seatsLimit}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-500">Storage:</span>
                          <span className="text-slate-800">{plan.storageLimitGB} GB</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-500">WA Numbers:</span>
                          <span className="text-slate-800">{plan.waNumbersLimit} Verified</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-500">Monthly Quota:</span>
                          <span className="text-slate-800">{plan.messagesLimitK}k</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {plan.features.map((f, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full py-2 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-center text-xs cursor-default"
                        >
                          Current Active Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-center text-xs transition-all shadow-sm cursor-pointer"
                        >
                          Switch to {plan.name}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

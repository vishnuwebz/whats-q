import React, { useState } from 'react';
import {
  X,
  Wallet,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Info,
  CheckCircle2,
  History,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';

interface MetaWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'edit' | 'info' | 'history' | 'add_funds';
}

export const MetaWalletModal: React.FC<MetaWalletModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'edit',
}) => {
  const { metaWallet, updateMetaWallet, addWalletFunds, walletTransactions } = useQiyamStore();
  const [activeTab, setActiveTab] = useState<'edit' | 'info' | 'history' | 'add_funds'>(defaultTab);

  // Form states
  const [balance, setBalance] = useState<number>(metaWallet.balance);
  const [currency, setCurrency] = useState<string>(metaWallet.currency);
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState<number>(
    metaWallet.lowBalanceThreshold
  );
  const [autoRecharge, setAutoRecharge] = useState<boolean>(metaWallet.autoRecharge);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState<number>(
    metaWallet.autoRechargeAmount
  );
  const [fundAmount, setFundAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Keep internal state synced when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setBalance(metaWallet.balance);
      setCurrency(metaWallet.currency);
      setLowBalanceThreshold(metaWallet.lowBalanceThreshold);
      setAutoRecharge(metaWallet.autoRecharge);
      setAutoRechargeAmount(metaWallet.autoRechargeAmount);
      setActiveTab(defaultTab);
      setIsSaved(false);
    }
  }, [isOpen, defaultTab, metaWallet]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMetaWallet({
      balance: Number(balance),
      currency,
      lowBalanceThreshold: Number(lowBalanceThreshold),
      autoRecharge,
      autoRechargeAmount: Number(autoRechargeAmount),
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (fundAmount <= 0) return;
    addWalletFunds(fundAmount, paymentMethod);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setActiveTab('history');
    }, 700);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Meta Business Wallet</h3>
                <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  OFFICIAL META SYNC
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official WhatsApp Cloud API balance & broadcast payment manager
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Wallet Configuration
          </button>
          <button
            onClick={() => setActiveTab('add_funds')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'add_funds'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Add Funds / Top-up
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            What is Meta Wallet?
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Deduction History
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs">
          {/* TAB 1: EDIT CONFIGURATION */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Current Wallet Balance
                  </div>
                  <div className="text-2xl font-black text-emerald-950 mt-0.5">
                    {formatMoney(metaWallet.balance)}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Synced with Meta Cloud API Account (WABA: {metaWallet.wabaId})
                  </div>
                </div>
                <div className="text-right">
                  <a
                    href="https://business.facebook.com/billing_hub/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-100/60 px-3 py-1.5 rounded-lg shadow-xs transition"
                  >
                    Meta Billing Hub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Active Balance ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Manually adjust or sync with your Meta statement if needed.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Currency Code</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                    <option value="SAR">SAR (﷼) - Saudi Riyal</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Currency registered in Meta Business Manager.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Low Balance Alert Threshold
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={lowBalanceThreshold}
                    onChange={(e) => setLowBalanceThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Alert the team when balance falls below this amount.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Auto-Recharge Top-up Amount
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={autoRechargeAmount}
                    onChange={(e) => setAutoRechargeAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Default top-up amount when auto-refill triggers.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Auto-Recharge Enabled</div>
                  <div className="text-[10px] text-slate-500">
                    Automatically charge saved corporate card when balance drops below threshold
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRecharge}
                    onChange={(e) => setAutoRecharge(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Official Meta Links */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-blue-900">
                  <span className="font-bold">Official Meta Billing Hub:</span> Meta manages all
                  WhatsApp API conversation billing centrally. You can check official invoices,
                  download tax invoices, and configure your payment credit cards directly at{' '}
                  <a
                    href="https://business.facebook.com/billing_hub/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-0.5"
                  >
                    business.facebook.com/billing_hub
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Saved Successfully!
                    </>
                  ) : (
                    'Save Wallet Settings'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ADD FUNDS */}
          {activeTab === 'add_funds' && (
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-600">Current Balance:</span>{' '}
                  <span className="font-bold text-emerald-800 text-sm">
                    {formatMoney(metaWallet.balance)}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700">Meta Account: {metaWallet.wabaId}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Top-up Amount ({currency})
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFundAmount(amt)}
                      className={`py-2 px-3 rounded-lg font-bold text-xs border transition cursor-pointer ${
                        fundAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="100"
                  min="100"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Enter custom amount"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="credit_card">Primary Corporate Visa (•••• 4242) - Instant</option>
                  <option value="upi">Direct UPI / NetBanking Gateway</option>
                  <option value="meta_direct">Official Meta Business Credit Line</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatMoney(fundAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / VAT (18%)</span>
                  <span>{formatMoney(fundAmount * 0.18)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Payable to Meta</span>
                  <span>{formatMoney(fundAmount * 1.18)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href="https://business.facebook.com/billing_hub/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                >
                  Pay via Meta Business Manager <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Confirm & Top-up Balance
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: WHAT IS META WALLET? */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  What is the Meta Business Wallet?
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  WhatsApp Business Cloud API uses a **conversation-based pricing model**. Rather
                  than charging per individual text message, Meta charges once for every **24-hour
                  conversation session** initiated between your business and a customer.
                </p>
              </div>

              <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                Official Meta Conversation Categories & Pricing (India - INR)
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">Marketing</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
                      ₹0.78 / conv
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Promotions, festive offers, announcements, product updates, and bulk marketing
                    broadcasts.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">Utility</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
                      ₹0.30 / conv
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Order confirmations, shipment tracking, billing receipts, and scheduled booking
                    reminders.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">Authentication</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                      ₹0.12 / conv
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    One-time passwords (OTP), account verification, and security verification codes.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">Service (Customer Care)</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      ₹0.00 (Free)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    User-initiated inquiries within the 24-hour service window are free of charge.
                  </p>
                </div>
              </div>

              {/* Official Documentation Links */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="font-bold text-slate-900 text-[11px]">Official Meta References:</div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <a
                    href="https://business.facebook.com/billing_hub/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-400 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Meta Business Billing Hub
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://business.facebook.com/wa/manage/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-400 transition"
                  >
                    <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    WhatsApp Manager (WABA)
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://developers.facebook.com/docs/whatsapp/pricing/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-400 transition"
                  >
                    <Info className="w-3.5 h-3.5 text-purple-600" />
                    Official WhatsApp Pricing Guide
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSACTION & DEDUCTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Recent Broadcast Charges & Top-ups</span>
                <span className="text-[11px] text-slate-500">
                  {walletTransactions.length} recorded events
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {walletTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-slate-500 whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="p-2.5 font-medium text-slate-800">
                          {tx.description}
                          {tx.campaignName && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Campaign: {tx.campaignName}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.type === 'credit'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {tx.type === 'credit' ? '+ Top-up' : '- Broadcast'}
                          </span>
                        </td>
                        <td
                          className={`p-2.5 text-right font-bold ${
                            tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'
                          }`}
                        >
                          {tx.type === 'credit' ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-slate-600">
                          {formatMoney(tx.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Meta Verified WhatsApp Business Account
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Layers, Plus, Wallet, ArrowUpRight, CheckCircle2, X } from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { accounts, addPaymentAccount, addToast, targetHighlightId } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New account form state
  const [accForm, setAccForm] = useState({
    name: '',
    account_number: '',
    account_type: 'Current Account',
    provider: 'Axis Bank',
    current_balance: 100000,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.name) {
      addToast('Please enter an account name', 'error');
      return;
    }

    addPaymentAccount({
      ...accForm,
      current_balance: Number(accForm.current_balance)
    });

    addToast(`Account "${accForm.name}" linked successfully!`, 'success');
    setIsModalOpen(false);
    setAccForm({
      name: '',
      account_number: '',
      account_type: 'Current Account',
      provider: 'Axis Bank',
      current_balance: 100000,
      status: 'Active'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Payment Accounts & Banking"
        subtitle="Connected bank accounts, PayPal balances, and Razorpay gateway settlements."
        primaryActionLabel="Link Bank Account"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {accounts.map((acc) => {
            const isTarget = targetHighlightId === acc.id || targetHighlightId === acc.name;
            return (
              <div
                key={acc.id}
                className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isTarget ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-50/30' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-sm">
                      {acc.provider[0]}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {acc.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-3 flex items-center gap-2">
                    {acc.name}
                    {isTarget && (
                      <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                        Target
                      </span>
                    )}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{acc.account_number || 'Cash Reserve'}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{acc.provider} • {acc.account_type}</div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Balance</span>
                    <span className="font-black text-slate-900 text-base">₹{acc.current_balance.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => addToast(`Reconciliation synced for ${acc.name}`, 'success')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px]"
                  >
                    Reconcile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Link Bank Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Link Bank Account</h3>
                <p className="text-xs text-slate-500">Connect corporate current account or gateway wallet.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Axis Bank Corporate"
                  value={accForm.name}
                  onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account / Virtual IBAN Number</label>
                <input
                  type="text"
                  placeholder="e.g. •••• 9812"
                  value={accForm.account_number}
                  onChange={(e) => setAccForm({ ...accForm, account_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Provider</label>
                  <select
                    value={accForm.provider}
                    onChange={(e) => setAccForm({ ...accForm, provider: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Razorpay">Razorpay</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={accForm.account_type}
                    onChange={(e) => setAccForm({ ...accForm, account_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="Current Account">Current Account</option>
                    <option value="Savings Account">Savings Account</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                    <option value="Cash Vault">Cash Vault</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={accForm.current_balance}
                  onChange={(e) => setAccForm({ ...accForm, current_balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Link Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



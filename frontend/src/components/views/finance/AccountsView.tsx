import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Layers, Plus, Wallet, ArrowUpRight, CheckCircle2, X, Building2 } from 'lucide-react';

const PREDEFINED_PROVIDERS = [
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'State Bank of India',
  'Kotak Mahindra Bank',
  'Federal Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Yes Bank',
  'Razorpay',
  'Stripe',
  'PayPal',
  'Cash Vault / Drawer',
];

export const AccountsView: React.FC = () => {
  const { accounts, addPaymentAccount, addToast, targetHighlightId, globalFilter } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customProviders, setCustomProviders] = useState<string[]>([]);
  const [isCustomProvider, setIsCustomProvider] = useState(false);
  const [customProviderInput, setCustomProviderInput] = useState('');

  // Dynamically merge predefined list with existing account providers and newly added custom providers
  const allProviders = useMemo(() => {
    const existing = accounts.map((a) => a.provider).filter(Boolean);
    const combined = [...PREDEFINED_PROVIDERS, ...existing, ...customProviders];
    return Array.from(new Set(combined));
  }, [accounts, customProviders]);

  const filteredAccounts = accounts.filter((acc) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      if (s === 'active' && acc.status?.toLowerCase() !== 'active') return false;
      if (s === 'inactive' && acc.status?.toLowerCase() !== 'inactive') return false;
    }
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        acc.name.toLowerCase().includes(q) ||
        acc.provider.toLowerCase().includes(q) ||
        acc.account_type.toLowerCase().includes(q) ||
        (acc.account_number && acc.account_number.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // New account form state
  const [accForm, setAccForm] = useState({
    name: '',
    account_number: '',
    account_type: 'Current Account',
    provider: 'Axis Bank',
    current_balance: 100000,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsCustomProvider(false);
    setCustomProviderInput('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.name.trim()) {
      addToast('Please enter an account name', 'error');
      return;
    }

    const resolvedProvider = isCustomProvider ? customProviderInput.trim() : accForm.provider;
    if (!resolvedProvider) {
      addToast('Please select or specify a provider name', 'error');
      return;
    }

    if (isCustomProvider && !customProviders.includes(resolvedProvider)) {
      setCustomProviders((prev) => [...prev, resolvedProvider]);
    }

    addPaymentAccount({
      ...accForm,
      provider: resolvedProvider,
      current_balance: Number(accForm.current_balance) || 0,
    });

    addToast(`Account "${accForm.name}" linked successfully!`, 'success');
    handleCloseModal();
    setAccForm({
      name: '',
      account_number: '',
      account_type: 'Current Account',
      provider: resolvedProvider,
      current_balance: 100000,
      status: 'Active'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Payment Accounts & Banking"
        subtitle="Connected bank accounts, PayPal balances, and Razorpay gateway settlements."
        primaryActionLabel="Link Bank Account"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-xs">
          {filteredAccounts.map((acc) => {
            const isTarget = targetHighlightId === acc.id || targetHighlightId === acc.name;
            return (
              <div
                key={acc.id}
                className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
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
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Link Bank Account</h3>
                <p className="text-xs text-slate-500">Connect corporate current account or gateway wallet.</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account / Virtual IBAN Number</label>
                <input
                  type="text"
                  placeholder="e.g. •••• 9812"
                  value={accForm.account_number}
                  onChange={(e) => setAccForm({ ...accForm, account_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-sm sm:text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={isCustomProvider ? 'col-span-1 sm:col-span-2' : ''}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Provider *</label>
                    {!isCustomProvider ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomProvider(true);
                          setCustomProviderInput('');
                        }}
                        className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        title="Add bank or provider not in dropdown"
                      >
                        <Plus className="w-3 h-3" /> Not mentioned?
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomProvider(false);
                          setAccForm((prev) => ({ ...prev, provider: allProviders[0] || 'Axis Bank' }));
                        }}
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                      >
                        ← Choose predefined
                      </button>
                    )}
                  </div>

                  {!isCustomProvider ? (
                    <select
                      value={accForm.provider}
                      onChange={(e) => {
                        if (e.target.value === '__NOT_MENTIONED__') {
                          setIsCustomProvider(true);
                          setCustomProviderInput('');
                        } else {
                          setAccForm({ ...accForm, provider: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800 font-medium cursor-pointer"
                    >
                      <optgroup label="Predefined & Active Providers">
                        {allProviders.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Not Mentioned in List?">
                        <option value="__NOT_MENTIONED__">
                          ➕ Other / Not Mentioned (Add Custom)...
                        </option>
                      </optgroup>
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <input
                          type="text"
                          required
                          autoFocus
                          placeholder="Type bank or provider name (e.g. Federal Bank, Cash Drawer, PayPal)"
                          value={customProviderInput}
                          onChange={(e) => {
                            setCustomProviderInput(e.target.value);
                            setAccForm((prev) => ({ ...prev, provider: e.target.value }));
                          }}
                          className="w-full pl-8 pr-3 py-2 bg-emerald-50/50 border border-emerald-400 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm sm:text-xs text-slate-900 font-medium"
                        />
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>New provider will be saved and linked to this account</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomProvider(false);
                            setAccForm((prev) => ({ ...prev, provider: allProviders[0] || 'Axis Bank' }));
                          }}
                          className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Cancel custom
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={isCustomProvider ? 'col-span-1 sm:col-span-2' : ''}>
                  <label className="font-semibold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={accForm.account_type}
                    onChange={(e) => setAccForm({ ...accForm, account_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800 font-medium cursor-pointer"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-sm sm:text-xs text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
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



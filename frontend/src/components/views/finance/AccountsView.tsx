import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Layers, Plus, Wallet, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { accounts, addToast } = useQiyamStore();

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Payment Accounts & Banking"
        subtitle="Connected bank accounts, PayPal balances, and Razorpay gateway settlements."
        primaryActionLabel="Link Bank Account"
        onPrimaryAction={() => addToast('Bank linking API opened', 'info')}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
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

                <h3 className="font-bold text-sm text-slate-900 mt-3">{acc.name}</h3>
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
          ))}
        </div>
      </div>
    </div>
  );
};



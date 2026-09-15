import React, { useState } from 'react';
import {
  Wallet,
  ExternalLink,
  Edit3,
  PlusCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { MetaWalletModal } from './MetaWalletModal';

interface MetaWalletCardProps {
  compact?: boolean;
  className?: string;
}

export const MetaWalletCard: React.FC<MetaWalletCardProps> = ({
  compact = false,
  className = '',
}) => {
  const { metaWallet } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'edit' | 'info' | 'history' | 'add_funds'>('edit');
  const [isSyncing, setIsSyncing] = useState(false);

  const isLowBalance = metaWallet.balance <= metaWallet.lowBalanceThreshold;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: metaWallet.currency || 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  const openModalWithTab = (tab: 'edit' | 'info' | 'history' | 'add_funds') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  if (compact) {
    return (
      <>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition shadow-xs ${
            isLowBalance
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          } ${className}`}
        >
          <div className="flex items-center gap-1.5">
            <Wallet
              className={`w-3.5 h-3.5 ${isLowBalance ? 'text-amber-600' : 'text-emerald-600'}`}
            />
            <span className="text-xs font-bold">{formatMoney(metaWallet.balance)}</span>
          </div>

          <button
            onClick={() => openModalWithTab('edit')}
            title="Edit Wallet Balance & Config"
            className="p-1 rounded-md hover:bg-emerald-200/50 text-emerald-700 transition cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          <button
            onClick={() => openModalWithTab('info')}
            title="What is Meta Wallet?"
            className="p-1 rounded-md hover:bg-emerald-200/50 text-slate-500 hover:text-emerald-700 transition cursor-pointer"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>

        <MetaWalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultTab={modalTab}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 overflow-hidden relative ${className}`}
      >
        {/* Top badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Meta Business Wallet</h4>
              <p className="text-[10px] text-slate-500">WABA: {metaWallet.wabaId}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSync}
              title="Refresh Meta Balance"
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer ${
                isSyncing ? 'animate-spin text-emerald-600' : ''
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openModalWithTab('info')}
              title="What is Meta Wallet?"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="my-3">
          <div className="text-[11px] font-medium text-slate-500">Available Broadcast Funds</div>
          <div className="flex items-baseline justify-between mt-0.5">
            <div className="text-2xl font-black tracking-tight text-slate-900">
              {formatMoney(metaWallet.balance)}
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isLowBalance
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isLowBalance ? 'Low Balance Alert' : 'Healthy Balance'}
            </span>
          </div>
        </div>

        {/* Low balance banner if applicable */}
        {isLowBalance && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Balance is below your threshold of {formatMoney(metaWallet.lowBalanceThreshold)}.
              Broadcasts may fail once depleted.
            </div>
          </div>
        )}

        {/* Breakdown details */}
        <div className="space-y-1.5 py-2.5 border-t border-b border-slate-100 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Marketing Cost:</span>
            <span className="font-semibold text-slate-800">
              {formatMoney(metaWallet.conversationPricing.marketing)} / conv
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Utility Cost:</span>
            <span className="font-semibold text-slate-800">
              {formatMoney(metaWallet.conversationPricing.utility)} / conv
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Auto-Recharge:</span>
            <span
              className={`font-semibold ${
                metaWallet.autoRecharge ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {metaWallet.autoRecharge
                ? `Enabled (${formatMoney(metaWallet.autoRechargeAmount)})`
                : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Dedicated Action Buttons */}
        <div className="pt-3 grid grid-cols-2 gap-2">
          {/* DEDICATED EDIT BUTTON REQUESTED BY USER */}
          <button
            type="button"
            onClick={() => openModalWithTab('edit')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer border border-slate-200"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            Edit Wallet
          </button>

          <button
            type="button"
            onClick={() => openModalWithTab('add_funds')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Funds
          </button>
        </div>

        {/* Real Meta Hub Link */}
        <div className="mt-3 pt-2 text-center border-t border-slate-100">
          <a
            href="https://business.facebook.com/billing_hub/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Open Official Meta Billing Hub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <MetaWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
      />
    </>
  );
};

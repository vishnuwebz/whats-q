import React from 'react';
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
} from 'lucide-react';

export const SubscriptionSettings: React.FC = () => {
  const { addToast } = useQiyamStore();

  return (
    <div className="space-y-6">
      {/* ── 1. Plan Overview Card ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">Subscription & Cloud Storage</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full">
                Active Plan
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Professional Enterprise Tier • Renews automatically on November 30, 2026
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addToast('Opening enterprise billing portal...', 'info')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Manage Billing
            </button>
            <button
              onClick={() => addToast('Plan upgrade inquiry submitted. A representative will contact you.', 'success')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
            >
              Upgrade Tier
            </button>
          </div>
        </div>

        {/* ── 2. Visual Capacity Meters (Enhanced from user screenshot) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Team Seats */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Team Seats</span>
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                36%
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">18 / 50</div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '36%' }} />
            </div>
            <div className="text-[10px] text-slate-400">32 additional seats available</div>
          </div>

          {/* Cloud Storage */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                <span>Cloud Storage</span>
              </span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                24.6%
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">24.6 / 100 GB</div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: '24.6%' }} />
            </div>
            <div className="text-[10px] text-slate-400">75.4 GB storage remaining</div>
          </div>

          {/* WhatsApp Numbers */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Numbers</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="text-xl font-black text-emerald-600">3 Verified</div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: '60%' }} />
            </div>
            <div className="text-[10px] text-slate-400">2 slots open (max 5 allowed)</div>
          </div>

          {/* Monthly Message Quota */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Message Volume</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                48.2%
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">48,250 / 100k</div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: '48.25%' }} />
            </div>
            <div className="text-[10px] text-slate-400">Resets in 14 days</div>
          </div>
        </div>
      </div>

      {/* ── 3. Included Features Checklist ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Enterprise Plan Features & Capabilities
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            'Unlimited Multi-Agent Live Chat Inbox',
            'Full Automated WhatsApp Broadcast Campaigns',
            'Enterprise Multi-Branch Isolation & Routing',
            'Deep AI Copilot & CRM Lead Scoring',
            'Scheduled Automatic Cloud & Local Backups',
            'Custom Webhook Endpoints & API Access',
            'Financial Ledger & Double-Entry Accounting',
            'Interactive Inventory & Route Optimization',
            'Dedicated 99.9% High Availability SLA',
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

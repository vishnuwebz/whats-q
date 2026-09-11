import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Briefcase, Plus, Search, DollarSign, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react';

export const DealsView: React.FC = () => {
  const { deals, setActiveTab, addToast } = useQiyamStore();
  const [search, setSearch] = useState('');

  const stages = [
    { id: 'new', label: 'New', count: deals.filter((d) => d.stage === 'new').length },
    { id: 'contacted', label: 'Contacted', count: deals.filter((d) => d.stage === 'contacted').length },
    { id: 'proposal_sent', label: 'Proposal Sent', count: deals.filter((d) => d.stage === 'proposal_sent').length },
    { id: 'negotiation', label: 'Negotiation', count: deals.filter((d) => d.stage === 'negotiation').length },
    { id: 'won', label: 'Won', count: deals.filter((d) => d.stage === 'won').length },
  ];

  const totalValue = deals.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-hidden font-sans">
      <Header
        title="Deals Pipeline"
        subtitle="Manage deal negotiations, win probabilities, and forecast revenues."
        primaryActionLabel="New Deal"
        onPrimaryAction={() => addToast('New deal creation modal opened', 'info')}
      />

      {/* Summary KPI Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Pipeline Value</div>
            <div className="text-lg font-black text-slate-900">₹{totalValue.toLocaleString()}</div>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Deals</div>
            <div className="text-lg font-black text-emerald-600">{deals.length}</div>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Avg. Win Probability</div>
            <div className="text-lg font-black text-purple-600">74%</div>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none w-56 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Kanban Pipeline */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-4 items-start scrollbar-thin">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const stageAmount = stageDeals.reduce((a, b) => a + b.amount, 0);

          return (
            <div
              key={stage.id}
              className="w-72 bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col max-h-full shrink-0 shadow-sm"
            >
              <div className="p-3.5 border-b border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                    {stage.count}
                  </span>
                  <h3 className="font-bold text-xs text-slate-800">{stage.label}</h3>
                </div>
                <span className="text-xs font-bold text-slate-600">₹{stageAmount.toLocaleString()}</span>
              </div>

              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{deal.deal_name}</h4>
                      <span className="font-bold text-xs text-emerald-600">₹{deal.amount.toLocaleString()}</span>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{deal.customer_name}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{deal.phone}</span>
                    </div>

                    {/* Win Probability Bar */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                        <span>Win Probability</span>
                        <span className="text-purple-600">{deal.probability}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${deal.probability}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};



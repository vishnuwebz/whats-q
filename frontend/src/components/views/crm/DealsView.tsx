import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Briefcase, Plus, Search, DollarSign, ArrowRight, User, Phone, CheckCircle2, X, MessageSquare, Trash2, ExternalLink, Tag, Sparkles } from 'lucide-react';
import { Deal } from '@/types';
import { isDateWithinInterval } from '@/utils/dateFilter';

export const DealsView: React.FC = () => {
  const { deals, addDeal, updateDeal, deleteDeal, openConversationForContact, setActiveTab, addToast, globalFilter, globalDateInterval, targetHighlightId } = useQiyamStore();
  const [search, setSearch] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [newDealForm, setNewDealForm] = useState({
    deal_name: '',
    customer_name: '',
    phone: '',
    email: '',
    amount: 18000,
    stage: 'proposal_sent' as Deal['stage'],
    probability: 70,
    deal_owner: 'Rahul Mehta',
    source: 'Direct Referral',
    expected_close_date: 'May 31, 2024',
    tags: ['Commercial'],
    notes: '',
  });

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealForm.deal_name.trim()) return;
    await addDeal(newDealForm);
    setIsNewDealModalOpen(false);
    setNewDealForm({
      deal_name: '',
      customer_name: '',
      phone: '',
      email: '',
      amount: 18000,
      stage: 'proposal_sent',
      probability: 70,
      deal_owner: 'Rahul Mehta',
      source: 'Direct Referral',
      expected_close_date: 'May 31, 2024',
      tags: ['Commercial'],
      notes: '',
    });
  };

  const effectiveSearch = search || globalFilter.query || '';

  const filteredDeals = deals.filter((d) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      const match =
        d.stage === s ||
        (s === 'open' && (d.stage === 'new' || d.stage === 'contacted')) ||
        (s === 'in_progress' && (d.stage === 'proposal_sent' || d.stage === 'negotiation')) ||
        (s === 'completed' && d.stage === 'won');
      if (!match) return false;
    }
    if (globalFilter.assignedTo && globalFilter.assignedTo !== 'all' && d.deal_owner !== globalFilter.assignedTo) {
      return false;
    }
    if (!isDateWithinInterval(d.expected_close_date, globalDateInterval)) {
      return false;
    }
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      return (
        d.deal_name.toLowerCase().includes(q) ||
        d.customer_name.toLowerCase().includes(q) ||
        d.phone.includes(q)
      );
    }
    return true;
  });

  const stages = [
    { id: 'new', label: 'New', count: filteredDeals.filter((d) => d.stage === 'new').length },
    { id: 'contacted', label: 'Contacted', count: filteredDeals.filter((d) => d.stage === 'contacted').length },
    { id: 'proposal_sent', label: 'Proposal Sent', count: filteredDeals.filter((d) => d.stage === 'proposal_sent').length },
    { id: 'negotiation', label: 'Negotiation', count: filteredDeals.filter((d) => d.stage === 'negotiation').length },
    { id: 'won', label: 'Won', count: filteredDeals.filter((d) => d.stage === 'won').length },
  ];

  const totalValue = filteredDeals.reduce((acc, d) => acc + d.amount, 0);
  const avgProbability =
    filteredDeals.length > 0
      ? Math.round(filteredDeals.reduce((acc, d) => acc + (d.probability || 0), 0) / filteredDeals.length)
      : 0;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-hidden font-sans">
      <Header
        title="Deals Pipeline"
        subtitle="Manage deal negotiations, win probabilities, and forecast revenues."
        primaryActionLabel="New Deal"
        onPrimaryAction={() => setIsNewDealModalOpen(true)}
      />

      {/* Summary KPI Bar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-0.5">
          <div className="shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Pipeline Value</div>
            <div className="text-base sm:text-lg font-black text-slate-900">₹{totalValue.toLocaleString()}</div>
          </div>
          <div className="h-7 w-px bg-slate-200 shrink-0" />
          <div className="shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Deals</div>
            <div className="text-base sm:text-lg font-black text-emerald-600">{filteredDeals.length}</div>
          </div>
          <div className="h-7 w-px bg-slate-200 shrink-0" />
          <div className="shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-400">Avg. Win Probability</div>
            <div className="text-base sm:text-lg font-black text-purple-600">{avgProbability}%</div>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm sm:text-xs text-slate-800 outline-none w-full sm:w-56 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Kanban Pipeline */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-5 md:p-6 flex gap-3 sm:gap-4 items-start scrollbar-thin">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const stageAmount = stageDeals.reduce((a, b) => a + b.amount, 0);

          return (
            <div
              key={stage.id}
              className="w-[85vw] sm:w-72 max-w-[320px] sm:max-w-none bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col max-h-full shrink-0 shadow-sm"
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
                    onClick={() => setSelectedDeal(deal)}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all space-y-2 cursor-pointer group active:scale-[0.99]"
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

      {/* New Deal Modal */}
      {isNewDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Create New Deal</h3>
                  <p className="text-[11px] text-slate-500">Track high-value commercial contracts and service proposals.</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewDealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deal Contract Name *</label>
                <input
                  type="text"
                  required
                  value={newDealForm.deal_name}
                  onChange={(e) => setNewDealForm({ ...newDealForm, deal_name: e.target.value })}
                  placeholder="e.g. Annual AC Maintenance - Lulu Mall"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer / Entity Name *</label>
                  <input
                    type="text"
                    required
                    value={newDealForm.customer_name}
                    onChange={(e) => setNewDealForm({ ...newDealForm, customer_name: e.target.value })}
                    placeholder="e.g. EMKE Group"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={newDealForm.phone}
                    onChange={(e) => setNewDealForm({ ...newDealForm, phone: e.target.value })}
                    placeholder="e.g. +91 94470 55443"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Deal Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newDealForm.amount}
                    onChange={(e) => setNewDealForm({ ...newDealForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pipeline Stage</label>
                  <select
                    value={newDealForm.stage}
                    onChange={(e) => setNewDealForm({ ...newDealForm, stage: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Win Probability (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={newDealForm.probability}
                    onChange={(e) => setNewDealForm({ ...newDealForm, probability: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDealModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm shadow-indigo-700/20 cursor-pointer"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deal Details & Stage Management Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    DEAL-{selectedDeal.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    selectedDeal.stage === 'won'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedDeal.stage === 'lost'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedDeal.stage.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{selectedDeal.deal_name}</h3>
                <div className="text-xl font-black text-emerald-600">₹{selectedDeal.amount.toLocaleString()}</div>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Selector */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Pipeline Stage</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'new', label: 'Discovery' },
                  { key: 'contacted', label: 'Contacted' },
                  { key: 'proposal_sent', label: 'Proposal' },
                  { key: 'negotiation', label: 'Negotiation' },
                  { key: 'won', label: 'Won 🎉' },
                  { key: 'lost', label: 'Lost' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => {
                      updateDeal(selectedDeal.id, { stage: st.key as Deal['stage'] });
                      setSelectedDeal({ ...selectedDeal, stage: st.key as Deal['stage'] });
                      addToast(`Deal stage moved to "${st.label}"`, 'success');
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-center transition-all cursor-pointer text-xs ${
                      selectedDeal.stage === st.key
                        ? st.key === 'won'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : st.key === 'lost'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client & Contact</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{selectedDeal.customer_name}</div>
                  <div className="font-mono text-slate-500 text-[11px]">{selectedDeal.phone}</div>
                  {selectedDeal.email && <div className="text-slate-500 text-[11px]">{selectedDeal.email}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    openConversationForContact({
                      name: selectedDeal.customer_name,
                      phone: selectedDeal.phone,
                      service: selectedDeal.deal_name,
                      initialMessage: `Hello *${selectedDeal.customer_name}*,\nFollowing up regarding our deal proposal *${selectedDeal.deal_name}* (₹${selectedDeal.amount.toLocaleString()}). How can we help finalize this?`,
                    });
                    setSelectedDeal(null);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </button>
              </div>
            </div>

            {/* Deal Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold">Win Probability</div>
                <div className="font-bold text-slate-900 mt-1 flex items-center justify-between">
                  <span>{selectedDeal.probability}%</span>
                  <span className="text-[10px] text-purple-600 font-semibold">Expected: {selectedDeal.expected_close_date || 'May 2024'}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold">Deal Owner</div>
                <div className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{selectedDeal.deal_owner || 'Rahul Mehta'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  deleteDeal(selectedDeal.id);
                  setSelectedDeal(null);
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Deal</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



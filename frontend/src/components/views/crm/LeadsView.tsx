import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Lead } from '@/types';
import {
  Kanban, List, Plus, Search, Filter, Phone, MessageSquare,
  Calendar, MoreVertical, X, Check, ArrowRight, UserCheck,
  Tag, Clock, UserPlus, FileText, ChevronRight
} from 'lucide-react';

export const LeadsView: React.FC = () => {
  const {
    leads,
    selectedLead,
    setSelectedLead,
    isLeadDrawerOpen,
    setIsLeadDrawerOpen,
    updateLeadStage,
    convertLeadToDeal,
    addToast,
    setActiveTab,
    addLead,
    globalFilter,
    targetHighlightId,
  } = useQiyamStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'AC Installation & Repair',
    value: 3500,
    location: 'Kozhikode, Kerala',
    stage: 'new' as Lead['stage'],
    owner: 'Rahul Mehta',
    source: 'WhatsApp Click-to-Ad',
    notes: '',
  });

  // React to targetHighlightId (from notifications or omnisearch)
  React.useEffect(() => {
    if (targetHighlightId) {
      const match = leads.find((l) => l.id === targetHighlightId || String(l.id) === String(targetHighlightId) || l.phone.includes(String(targetHighlightId)));
      if (match) {
        setSelectedLead(match);
        setIsLeadDrawerOpen(true);
      }
    }
  }, [targetHighlightId, leads, setSelectedLead, setIsLeadDrawerOpen]);

  const stages: Array<{ id: Lead['stage']; label: string; count: number; color: string }> = [
    { id: 'new', label: 'New Lead', count: leads.filter((l) => l.stage === 'new').length, color: 'border-blue-500 text-blue-700 bg-blue-50' },
    { id: 'contacted', label: 'Contacted', count: leads.filter((l) => l.stage === 'contacted').length, color: 'border-purple-500 text-purple-700 bg-purple-50' },
    { id: 'qualified', label: 'Qualified', count: leads.filter((l) => l.stage === 'qualified').length, color: 'border-amber-500 text-amber-700 bg-amber-50' },
    { id: 'proposal_sent', label: 'Proposal Sent', count: leads.filter((l) => l.stage === 'proposal_sent').length, color: 'border-indigo-500 text-indigo-700 bg-indigo-50' },
    { id: 'negotiation', label: 'Negotiation', count: leads.filter((l) => l.stage === 'negotiation').length, color: 'border-orange-500 text-orange-700 bg-orange-50' },
  ];

  const effectiveSearch = searchQuery || globalFilter.query || '';

  const filteredLeads = leads.filter((l) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      if (globalFilter.status === 'open' && l.stage !== 'new' && l.stage !== 'contacted') return false;
      if (globalFilter.status === 'in_progress' && l.stage !== 'qualified' && l.stage !== 'proposal_sent' && l.stage !== 'negotiation') return false;
      if (globalFilter.status === 'completed' && l.stage !== 'won') return false;
    }
    if (!effectiveSearch) return true;
    const q = effectiveSearch.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.service.toLowerCase().includes(q);
  });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim()) return;
    await addLead(newLeadForm);
    setIsAddLeadModalOpen(false);
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      service: 'AC Installation & Repair',
      value: 3500,
      location: 'Kozhikode, Kerala',
      stage: 'new',
      owner: 'Rahul Mehta',
      source: 'WhatsApp Click-to-Ad',
      notes: '',
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: Lead['stage']) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      updateLeadStage(Number(leadId), stageId);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-hidden font-sans">
      <Header
        title="Leads"
        subtitle="Manage and track potential customers across the conversion pipeline."
        primaryActionLabel="Add Lead"
        onPrimaryAction={() => setIsAddLeadModalOpen(true)}
      />

      {/* Control Bar: View Mode Switch & Filters */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch sm:items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-start">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-60"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Total Leads: <strong className="text-slate-800">{leads.length}</strong> (₹{leads.reduce((a, b) => a + b.value, 0).toLocaleString()} pipeline value)
        </div>
      </div>

      {/* Main Kanban Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'kanban' ? (
          <div className="flex-1 overflow-x-auto p-3 sm:p-6 flex gap-3 sm:gap-4 items-start scrollbar-thin">
            {stages.map((col) => {
              const colLeads = filteredLeads.filter((l) => l.stage === col.id);

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="w-[85vw] sm:w-72 bg-slate-100/80 rounded-2xl border border-slate-200/80 flex flex-col max-h-full shrink-0 shadow-sm"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.color}`}>
                        {col.count}
                      </span>
                      <h3 className="font-bold text-xs text-slate-800">{col.label}</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      ₹{colLeads.reduce((sum, l) => sum + l.value, 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="p-3 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
                    {colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('leadId', String(lead.id))}
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsLeadDrawerOpen(true);
                        }}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {lead.name}
                          </h4>
                          <span className="font-bold text-xs text-emerald-600">₹{lead.value.toLocaleString()}</span>
                        </div>

                        <div className="text-[11px] text-slate-600 font-medium">{lead.service}</div>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span>{lead.location}</span>
                          <span className="font-medium text-slate-500">{lead.owner}</span>
                        </div>

                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {lead.tags.map((tag, idx) => (
                              <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {colLeads.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        Drag leads here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Table */
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Lead Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Estimated Value</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Lead Owner</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsLeadDrawerOpen(true);
                      }}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">{lead.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{lead.phone}</td>
                      <td className="py-3 px-4 font-medium">{lead.service}</td>
                      <td className="py-3 px-4 text-slate-500">{lead.location}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">₹{lead.value.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                          {lead.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{lead.owner}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            convertLeadToDeal(lead.id);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-[11px]"
                        >
                          Convert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right Lead Details Drawer (Matching photo_7 drawer) */}
        {isLeadDrawerOpen && selectedLead && (
          <>
            <div
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-30 lg:hidden"
              onClick={() => setIsLeadDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 z-40 lg:relative lg:z-10 w-full sm:w-96 max-w-[100vw] sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right duration-200 p-4 sm:p-6 space-y-5 sm:space-y-6 text-xs">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedLead.phone}</p>
                </div>
                <button
                  onClick={() => setIsLeadDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            {/* Quick Action Strip */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  addToast(`Opening WhatsApp chat for ${selectedLead.name}...`, 'info');
                  setActiveTab('conversations');
                }}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Chat</span>
              </button>

              <button
                onClick={() => convertLeadToDeal(selectedLead.id)}
                className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Convert to Deal</span>
              </button>
            </div>

            {/* Stage Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Lead Stage</label>
              <select
                value={selectedLead.stage}
                onChange={(e) => updateLeadStage(selectedLead.id, e.target.value as Lead['stage'])}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Lead Specifications */}
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="font-semibold text-slate-800">{selectedLead.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Value:</span>
                <span className="font-bold text-emerald-600">₹{selectedLead.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-800">{selectedLead.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Owner:</span>
                <span className="font-semibold text-slate-800">{selectedLead.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="font-medium text-slate-800">{selectedLead.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="font-medium text-slate-800">{selectedLead.created_at_str}</span>
              </div>
            </div>

            {/* Scheduled Follow-up */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Next Scheduled Follow-up</span>
              </div>
              <p className="text-[11px] text-amber-700">
                {selectedLead.next_follow_up_date || 'Tomorrow'} at {selectedLead.next_follow_up_time || '10:00 AM'}
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Internal Notes</label>
              <textarea
                defaultValue={selectedLead.notes}
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none resize-none text-xs"
                placeholder="Add notes about this lead..."
              />
            </div>
          </div>
        </>
      )}
    </div>

      {/* Add Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-4 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Add New CRM Lead</h3>
                  <p className="text-[11px] text-slate-500">Capture customer details, required service, and pipeline stage.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLeadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    placeholder="e.g. Farhan Ali"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="e.g. +91 98470 12345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Service Needed</label>
                  <select
                    value={newLeadForm.service}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="AC Installation & Repair">AC Installation & Repair</option>
                    <option value="Split AC Deep Service">Split AC Deep Service</option>
                    <option value="Commercial HVAC Maintenance">Commercial HVAC Maintenance</option>
                    <option value="Gas Refill & Leakage Check">Gas Refill & Leakage Check</option>
                    <option value="Electrical & Plumbing">Electrical & Plumbing</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={newLeadForm.value}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={newLeadForm.location}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, location: e.target.value })}
                    placeholder="e.g. Mavoor Road, Calicut"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lead Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="WhatsApp Click-to-Ad">WhatsApp Click-to-Ad</option>
                    <option value="Website Contact Form">Website Contact Form</option>
                    <option value="Google Search Ads">Google Search Ads</option>
                    <option value="Customer Referral">Customer Referral</option>
                    <option value="Direct Walk-in">Direct Walk-in</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Initial Notes</label>
                <textarea
                  rows={2}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Additional context or requirements..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 cursor-pointer"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



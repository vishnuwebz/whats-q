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
  } = useQiyamStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');

  const stages: Array<{ id: Lead['stage']; label: string; count: number; color: string }> = [
    { id: 'new', label: 'New Lead', count: leads.filter((l) => l.stage === 'new').length, color: 'border-blue-500 text-blue-700 bg-blue-50' },
    { id: 'contacted', label: 'Contacted', count: leads.filter((l) => l.stage === 'contacted').length, color: 'border-purple-500 text-purple-700 bg-purple-50' },
    { id: 'qualified', label: 'Qualified', count: leads.filter((l) => l.stage === 'qualified').length, color: 'border-amber-500 text-amber-700 bg-amber-50' },
    { id: 'proposal_sent', label: 'Proposal Sent', count: leads.filter((l) => l.stage === 'proposal_sent').length, color: 'border-indigo-500 text-indigo-700 bg-indigo-50' },
    { id: 'negotiation', label: 'Negotiation', count: leads.filter((l) => l.stage === 'negotiation').length, color: 'border-orange-500 text-orange-700 bg-orange-50' },
  ];

  const filteredLeads = leads.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.service.toLowerCase().includes(q);
  });

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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-hidden font-sans">
      <Header
        title="Leads"
        subtitle="Manage and track potential customers across the conversion pipeline."
        primaryActionLabel="Add Lead"
        onPrimaryAction={() => addToast('New lead form opened', 'info')}
      />

      {/* Control Bar: View Mode Switch & Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1">
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
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-60"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Leads: <strong className="text-slate-800">{leads.length}</strong> (₹{leads.reduce((a, b) => a + b.value, 0).toLocaleString()} pipeline value)
        </div>
      </div>

      {/* Main Kanban Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'kanban' ? (
          <div className="flex-1 overflow-x-auto p-6 flex gap-4 items-start scrollbar-thin">
            {stages.map((col) => {
              const colLeads = filteredLeads.filter((l) => l.stage === col.id);

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="w-72 bg-slate-100/80 rounded-2xl border border-slate-200/80 flex flex-col max-h-full shrink-0 shadow-sm"
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
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
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
          <div className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col shrink-0 z-20 overflow-y-auto animate-in slide-in-from-right duration-200 p-6 space-y-6 text-xs">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedLead.phone}</p>
              </div>
              <button
                onClick={() => setIsLeadDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
        )}
      </div>
    </div>
  );
};



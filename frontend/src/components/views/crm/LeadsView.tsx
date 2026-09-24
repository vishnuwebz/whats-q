import React, { useState, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Lead, Deal } from '@/types';
import { isDateWithinInterval } from '@/utils/dateFilter';
import {
  Kanban, List, Plus, Search, Filter, Phone, MessageSquare,
  Calendar, MoreVertical, X, Check, ArrowRight, UserCheck,
  Tag, Clock, UserPlus, FileText, ChevronRight, ChevronDown,
  ArrowRightLeft, AlertTriangle, ShieldCheck, Sparkles, Building2,
  IndianRupee, CheckCircle2, RefreshCw
} from 'lucide-react';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';

export const ALL_LEAD_STAGES: Array<{
  id: Lead['stage'];
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}> = [
  { id: 'new', label: 'New Lead', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', dotColor: 'bg-blue-500', description: 'Fresh inquiry awaiting first contact' },
  { id: 'contacted', label: 'Contacted', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100', dotColor: 'bg-purple-500', description: 'Initial outreach or WhatsApp chat underway' },
  { id: 'qualified', label: 'Qualified', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', dotColor: 'bg-amber-500', description: 'Budget, authority & interest verified' },
  { id: 'proposal_sent', label: 'Proposal Sent', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100', dotColor: 'bg-indigo-500', description: 'Quote or proposal shared with prospect' },
  { id: 'negotiation', label: 'Negotiation', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100', dotColor: 'bg-orange-500', description: 'Discussing terms, pricing, or scope' },
  { id: 'won', label: 'Won', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', dotColor: 'bg-emerald-500', description: 'Successfully closed and converted' },
  { id: 'lost', label: 'Lost', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100', dotColor: 'bg-rose-500', description: 'Deal closed without conversion' },
];

export const getStageConfig = (stageId: Lead['stage']) => {
  return ALL_LEAD_STAGES.find((s) => s.id === stageId) || ALL_LEAD_STAGES[0];
};

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
    openConversationForContact,
    globalFilter,
    globalDateInterval,
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

  // Interactive Stage Popover & Accidental Touch Prevention State
  const [activeStagePopoverId, setActiveStagePopoverId] = useState<string | number | null>(null);
  const popoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pendingStageChange, setPendingStageChange] = useState<{ lead: Lead; targetStage: Lead['stage'] } | null>(null);
  const [stageNote, setStageNote] = useState('');
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Convert Lead to Deal Modal State
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertForm, setConvertForm] = useState({
    deal_name: '',
    amount: 10000,
    stage: 'proposal_sent' as Deal['stage'],
    probability: 75,
    deal_owner: 'Rahul Mehta',
    expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    notes: '',
    create_customer: true,
  });

  // Stage popover hover & click helpers
  const handleMouseEnterStage = (leadId: string | number) => {
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
      popoverTimeoutRef.current = null;
    }
    setActiveStagePopoverId(leadId);
  };

  const handleMouseLeaveStage = () => {
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
    }
    popoverTimeoutRef.current = setTimeout(() => {
      setActiveStagePopoverId(null);
    }, 250);
  };

  const handlePopoverMouseEnter = () => {
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
      popoverTimeoutRef.current = null;
    }
  };

  const handleToggleStagePopover = (leadId: string | number) => {
    if (activeStagePopoverId === leadId) {
      setActiveStagePopoverId(null);
    } else {
      setActiveStagePopoverId(leadId);
    }
  };

  const handleStageSelectClick = (lead: Lead, targetStage: Lead['stage']) => {
    setActiveStagePopoverId(null);
    if (lead.stage === targetStage) return;
    setPendingStageChange({ lead, targetStage });
    setStageNote('');
  };

  const handleConfirmStageChange = async () => {
    if (!pendingStageChange) return;
    setIsUpdatingStage(true);
    try {
      await updateLeadStage(pendingStageChange.lead.id, pendingStageChange.targetStage, stageNote);
      setPendingStageChange(null);
      setStageNote('');
    } finally {
      setIsUpdatingStage(false);
    }
  };

  // Convert Lead helpers
  const handleOpenConvertModal = (lead: Lead) => {
    setConvertingLead(lead);
    setConvertForm({
      deal_name: `${lead.name} - ${lead.service || 'Deal'}`,
      amount: lead.value || 10000,
      stage: 'proposal_sent',
      probability: 75,
      deal_owner: lead.owner || 'Rahul Mehta',
      expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      notes: lead.notes ? `Lead Notes: ${lead.notes}` : `Converted from lead ${lead.name}`,
      create_customer: true,
    });
  };

  const handleConfirmConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;
    setIsConverting(true);
    try {
      await convertLeadToDeal(convertingLead.id, convertForm);
      setConvertingLead(null);
    } finally {
      setIsConverting(false);
    }
  };

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
      const s = globalFilter.status.toLowerCase();
      const match =
        l.stage === s ||
        (s === 'open' && (l.stage === 'new' || l.stage === 'contacted')) ||
        (s === 'in_progress' && (l.stage === 'qualified' || l.stage === 'proposal_sent' || l.stage === 'negotiation')) ||
        (s === 'completed' && l.stage === 'won');
      if (!match) return false;
    }
    if (globalFilter.assignedTo && globalFilter.assignedTo !== 'all' && l.owner !== globalFilter.assignedTo) {
      return false;
    }
    if (!isDateWithinInterval(l.created_at_str, globalDateInterval)) {
      return false;
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
      const match = leads.find((l) => String(l.id) === String(leadId));
      if (match && match.stage !== stageId) {
        setPendingStageChange({ lead: match, targetStage: stageId });
        setStageNote('Moved via Kanban Board');
      }
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-thin min-h-[460px] pb-32">
              <table className="w-full text-left text-xs min-w-[700px]">
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
                  {filteredLeads.map((lead, idx) => {
                    const currentStageCfg = getStageConfig(lead.stage);
                    const isPopoverOpen = activeStagePopoverId === lead.id;
                    // If row is in the lower half (or index >= 3), open UPWARDS so the popover never gets cut off
                    const isNearBottom = idx >= 3 || (filteredLeads.length > 0 && idx >= Math.floor(filteredLeads.length / 2));

                    return (
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
                        <td
                          className="py-3 px-4 relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            className="inline-block relative"
                            onMouseEnter={() => handleMouseEnterStage(lead.id)}
                            onMouseLeave={handleMouseLeaveStage}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStagePopover(lead.id);
                              }}
                              className={`group/badge inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-2xs ${currentStageCfg.badgeClass} hover:ring-2 hover:ring-offset-1 hover:ring-slate-300`}
                              title={isPopoverOpen ? undefined : "Click or hover to change pipeline stage"}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${currentStageCfg.dotColor}`} />
                              <span className="capitalize">{currentStageCfg.label}</span>
                              <ChevronDown className="w-3 h-3 opacity-60 group-hover/badge:opacity-100 transition-opacity" />
                            </button>

                            {/* Interactive Stage Popover */}
                            {isPopoverOpen && (
                              <div
                                onMouseEnter={handlePopoverMouseEnter}
                                onMouseLeave={handleMouseLeaveStage}
                                className={`absolute left-0 ${
                                  isNearBottom ? 'bottom-full mb-2' : 'top-full mt-2'
                                } z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 ring-1 ring-black/5 p-2 animate-in fade-in zoom-in-95 duration-150`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isNearBottom ? (
                                  <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45" />
                                ) : (
                                  <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45" />
                                )}
                                <div className="px-2 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Stage</span>
                                  <span className="text-[10px] text-slate-400 font-medium">Select target</span>
                                </div>
                                <div className="space-y-0.5 max-h-[260px] overflow-y-auto scrollbar-thin pr-0.5">
                                  {ALL_LEAD_STAGES.map((s) => {
                                    const isCurrent = lead.stage === s.id;
                                    return (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => handleStageSelectClick(lead, s.id)}
                                        disabled={isCurrent}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                                          isCurrent
                                            ? 'bg-slate-50 font-bold text-slate-700 cursor-default'
                                            : 'hover:bg-slate-100/80 text-slate-700 font-medium cursor-pointer'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                                          <span>{s.label}</span>
                                        </div>
                                        {isCurrent ? (
                                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                                            <Check className="w-3 h-3 text-emerald-600" />
                                            Current
                                          </span>
                                        ) : (
                                          <ChevronRight className="w-3 h-3 text-slate-300" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="px-2 py-1.5 mt-1 border-t border-slate-100 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Accidental touch protection enabled</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{lead.owner}</td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp Chat Button */}
                            <button
                              type="button"
                              onClick={() => {
                                openConversationForContact({
                                  name: lead.name,
                                  phone: lead.phone,
                                  service: lead.service,
                                  location: lead.location,
                                });
                              }}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                              title={`Open WhatsApp chat with ${lead.name}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="hidden xl:inline text-[10px] font-bold">Chat</span>
                            </button>

                            {/* Direct Phone Call Button */}
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer shadow-2xs inline-flex items-center"
                              title={`Call ${lead.name} (${lead.phone})`}
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                            </a>

                            {/* Convert to Deal Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenConvertModal(lead)}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border border-purple-200/80 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                              title="Convert this lead to a CRM Deal"
                            >
                              <UserPlus className="w-3 h-3 text-purple-600" />
                              <span>Convert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  openConversationForContact({
                    name: selectedLead.name,
                    phone: selectedLead.phone,
                    service: selectedLead.service,
                    location: selectedLead.location,
                  });
                }}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Chat</span>
              </button>

              <button
                onClick={() => handleOpenConvertModal(selectedLead)}
                className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
                onChange={(e) => {
                  const target = e.target.value as Lead['stage'];
                  if (target !== selectedLead.stage) {
                    setPendingStageChange({ lead: selectedLead, targetStage: target });
                    setStageNote('Stage changed via Lead Details Drawer');
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
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
                  <CountryPhoneInput
                    value={newLeadForm.phone}
                    onChange={(val) => setNewLeadForm({ ...newLeadForm, phone: val })}
                    required
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

      {/* Stage Change Confirmation Modal (Accidental Touch Prevention) */}
      {pendingStageChange && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setPendingStageChange(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Confirm Stage Change</h3>
                  <p className="text-[11px] text-slate-500">Accidental touch protection enabled</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingStageChange(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lead info card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{pendingStageChange.lead.name}</span>
                <span className="font-bold text-emerald-600 font-mono">₹{pendingStageChange.lead.value.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{pendingStageChange.lead.service}</span>
                <span>{pendingStageChange.lead.phone}</span>
              </div>
            </div>

            {/* Stage Transition Visual */}
            <div className="py-1">
              <div className="text-[11px] font-bold text-slate-600 mb-2">Stage Transition</div>
              <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                {/* Current Stage */}
                <div className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Current</span>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getStageConfig(pendingStageChange.lead.stage).badgeClass}`}>
                    {getStageConfig(pendingStageChange.lead.stage).label}
                  </span>
                </div>

                <div className="px-2 text-slate-400 flex flex-col items-center">
                  <ArrowRight className="w-4 h-4" />
                </div>

                {/* Target Stage */}
                <div className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">New Stage</span>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs ${getStageConfig(pendingStageChange.targetStage).badgeClass}`}>
                    {getStageConfig(pendingStageChange.targetStage).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick transition reasons / note */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 text-[11px]">
                Reason / Note <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 pb-1">
                {[
                  'Prospect requested quote',
                  'Follow-up call completed',
                  'Budget & scope qualified',
                  'Negotiating contract terms',
                  'Client confirmed order',
                ].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setStageNote(quick)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                      stageNote === quick
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {quick}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder="e.g. Discussed proposal with client over WhatsApp"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingStageChange(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStage}
                onClick={handleConfirmStageChange}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingStage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Stage Change</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Lead to CRM Deal Modal */}
      {convertingLead && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setConvertingLead(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Convert Lead to Deal</h3>
                  <p className="text-[11px] text-slate-500">
                    Create a pipeline deal and optionally link customer in CRM directory.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source Lead Context Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">{convertingLead.name}</div>
                <div className="text-[11px] text-slate-500">{convertingLead.phone} • {convertingLead.service}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Lead Value</div>
                <div className="font-bold text-emerald-600 font-mono">₹{convertingLead.value.toLocaleString()}</div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmConvert} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={convertForm.deal_name}
                  onChange={(e) => setConvertForm({ ...convertForm, deal_name: e.target.value })}
                  placeholder="e.g. AC Installation & Maintenance Contract"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Deal Value (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={convertForm.amount}
                    onChange={(e) => setConvertForm({ ...convertForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pipeline Stage</label>
                  <select
                    value={convertForm.stage}
                    onChange={(e) => setConvertForm({ ...convertForm, stage: e.target.value as Deal['stage'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="contacted">Contacted</option>
                    <option value="won">Won / Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Win Probability ({convertForm.probability}%)</label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={convertForm.probability}
                    onChange={(e) => setConvertForm({ ...convertForm, probability: Number(e.target.value) })}
                    className="w-full accent-purple-600 mt-2 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Expected Close Date</label>
                  <input
                    type="date"
                    value={convertForm.expected_close_date}
                    onChange={(e) => setConvertForm({ ...convertForm, expected_close_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Deal Owner</label>
                  <input
                    type="text"
                    value={convertForm.deal_owner}
                    onChange={(e) => setConvertForm({ ...convertForm, deal_owner: e.target.value })}
                    placeholder="e.g. Rahul Mehta"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={convertForm.create_customer}
                      onChange={(e) => setConvertForm({ ...convertForm, create_customer: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 accent-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="font-medium text-slate-700">Sync with CRM Customers</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deal Notes</label>
                <textarea
                  rows={2}
                  value={convertForm.notes}
                  onChange={(e) => setConvertForm({ ...convertForm, notes: e.target.value })}
                  placeholder="Handover context, agreed terms, customer notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm shadow-purple-700/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Converting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Convert to Deal & Open</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



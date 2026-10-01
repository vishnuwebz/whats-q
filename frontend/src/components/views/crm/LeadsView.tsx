import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Lead, FollowUp } from '@/types';
import { qiyamApi } from '@/api/qiyamApi';
import { isDateWithinInterval } from '@/utils/dateFilter';
import {
  Kanban, List, Plus, Search, Filter, Phone, MessageSquare,
  Calendar, MoreVertical, X, Check, ArrowRight, UserCheck,
  Tag, Clock, UserPlus, FileText, ChevronRight, ChevronLeft, ChevronDown,
  ArrowRightLeft, AlertTriangle, ShieldCheck, Sparkles, Building2,
  IndianRupee, CheckCircle2, RefreshCw, Trophy, XCircle, Trash2, RotateCcw, Edit3, Compass
} from 'lucide-react';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';
import { ScheduleFollowUpModal } from '@/components/crm/ScheduleFollowUpModal';
import { AgentSelectDropdown } from '@/components/common/AgentSelectDropdown';
import { ModernDatePicker } from '@/components/common/ModernDatePicker';
import { ModernTimePicker } from '@/components/common/ModernTimePicker';

export const ALL_LEAD_STAGES: Array<{
  id: Lead['stage'];
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}> = [
  { id: 'new', label: 'New Lead', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', dotColor: 'bg-blue-500', description: 'Fresh inquiry awaiting first contact' },
  { id: 'contacted', label: 'Contacted', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100', dotColor: 'bg-purple-500', description: 'Initial outreach or WhatsApp chat underway' },
  { id: 'follow_up', label: 'Follow-up', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100', dotColor: 'bg-sky-500', description: 'Follow-up planned or scheduled with prospect' },
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
    conversations,
    trashLeads,
    followups,
    selectedLead,
    setSelectedLead,
    isLeadDrawerOpen,
    setIsLeadDrawerOpen,
    updateLeadStage,
    updateLead,
    deleteLead,
    restoreLead,
    permanentlyDeleteLead,
    restoreAllLeads,
    emptyLeadsTrash,
    addToast,
    setActiveTab,
    addLead,
    openConversationForContact,
    globalFilter,
    globalDateInterval,
    targetHighlightId,
  } = useQiyamStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'trash'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [columnSearchQueries, setColumnSearchQueries] = useState<Record<string, string>>({});
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

  // Interactive Stage Popover State
  const [activeStagePopoverId, setActiveStagePopoverId] = useState<string | number | null>(null);
  const [pendingStageChange, setPendingStageChange] = useState<{ lead: Lead; targetStage: Lead['stage'] } | null>(null);
  const [stageNote, setStageNote] = useState('');
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [followUpModalLead, setFollowUpModalLead] = useState<Lead | null>(null);

  // Edit Lead Modal State
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editLeadForm, setEditLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    value: 0,
    location: '',
    source: 'WhatsApp Click-to-Ad',
    stage: 'new' as Lead['stage'],
    owner: '',
    next_follow_up_date: '',
    next_follow_up_time: '',
    notes: '',
  });
  const [isSavingEditLead, setIsSavingEditLead] = useState(false);

  const handleOpenEditLeadModal = (lead: Lead) => {
    // Check if lead has a linked follow-up in followups store
    const cleanDigits = (p?: string) => String(p || '').replace(/\D/g, '').slice(-10);
    const lDigits = cleanDigits(lead.phone);
    const matchedFu = followups.find((f) => {
      if (f.related_to && f.related_to.includes(`Lead #${lead.id}`)) return true;
      if (lDigits && cleanDigits(f.phone) === lDigits) return true;
      return false;
    });

    const followUpDate = lead.next_follow_up_date || matchedFu?.due_date || '';
    const followUpTime = lead.next_follow_up_time || matchedFu?.due_time || '11:00 AM';

    setEditingLead(lead);
    setEditLeadForm({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      service: lead.service || 'AC Installation & Repair',
      value: lead.value || 0,
      location: lead.location || '',
      source: lead.source || 'WhatsApp Click-to-Ad',
      stage: lead.stage,
      owner: lead.owner || 'Rahul Mehta',
      next_follow_up_date: followUpDate,
      next_follow_up_time: followUpTime,
      notes: lead.notes || '',
    });
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    if (!editLeadForm.name.trim()) {
      addToast('Customer name is required', 'error');
      return;
    }

    setIsSavingEditLead(true);
    try {
      await updateLead(editingLead.id, editLeadForm);
      if (selectedLead && String(selectedLead.id) === String(editingLead.id)) {
        setSelectedLead({ ...selectedLead, ...editLeadForm });
      }
      addToast(`Lead "${editLeadForm.name}" updated successfully!`, 'success');
      setEditingLead(null);
    } catch (err: any) {
      console.error('[LeadsView] Failed to update lead:', err);
      addToast('Failed to update lead details', 'error');
    } finally {
      setIsSavingEditLead(false);
    }
  };

  // Multi-Selection State for Bulk / Respected Leads
  const [selectedLeadIds, setSelectedLeadIds] = useState<Array<string | number>>([]);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadsToDelete, setLeadsToDelete] = useState<Lead[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open Delete Modal for a Single Lead
  const handleOpenDeleteModal = (lead: Lead) => {
    setLeadsToDelete([lead]);
    setIsDeleteModalOpen(true);
  };

  // Open Delete Modal for Selected Leads
  const handleOpenDeleteSelectedModal = () => {
    const matched = leads.filter((l) => selectedLeadIds.includes(l.id));
    if (matched.length === 0) return;
    setLeadsToDelete(matched);
    setIsDeleteModalOpen(true);
  };

  // Toggle single lead selection
  const handleToggleSelectLead = (leadId: string | number, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  // Select all / Deselect all for current filtered leads
  const handleSelectAllLeads = () => {
    if (selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  // Immediate Undo Banner State
  const [recentlyDeleted, setRecentlyDeleted] = useState<{
    items: Lead[];
    count: number;
    timer?: any;
  } | null>(null);

  // Trash Multi-Selection & State
  const [selectedTrashIds, setSelectedTrashIds] = useState<Array<string | number>>([]);
  const [isEmptyTrashModalOpen, setIsEmptyTrashModalOpen] = useState(false);
  const [isRestoringAll, setIsRestoringAll] = useState(false);

  // Confirm Delete Action (Moves to Trash & Triggers Instant Undo Toast)
  const handleConfirmDelete = async () => {
    if (leadsToDelete.length === 0) return;
    setIsDeleting(true);
    const deletedItems = [...leadsToDelete];
    try {
      for (const lead of leadsToDelete) {
        await deleteLead(lead.id);
      }
      setSelectedLeadIds((prev) =>
        prev.filter((id) => !leadsToDelete.some((l) => l.id === id))
      );
      if (selectedLead && leadsToDelete.some((l) => l.id === selectedLead.id)) {
        setIsLeadDrawerOpen(false);
        setSelectedLead(null);
      }
      setIsDeleteModalOpen(false);
      setLeadsToDelete([]);

      // Trigger Floating Undo Banner (active for 10 seconds)
      if (recentlyDeleted?.timer) clearTimeout(recentlyDeleted.timer);
      const timer = setTimeout(() => {
        setRecentlyDeleted(null);
      }, 10000);

      setRecentlyDeleted({
        items: deletedItems,
        count: deletedItems.length,
        timer,
      });
    } catch (err: any) {
      console.error('[LeadsView] Failed to delete lead(s):', err);
      addToast('Failed to delete lead(s). Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // One-Click Undo Action
  const handleUndoRecentDelete = async () => {
    if (!recentlyDeleted || recentlyDeleted.items.length === 0) return;
    if (recentlyDeleted.timer) clearTimeout(recentlyDeleted.timer);

    const itemsToRestore = [...recentlyDeleted.items];
    setRecentlyDeleted(null);

    let restoredCount = 0;
    for (const item of itemsToRestore) {
      const ok = await restoreLead(item.id);
      if (ok) restoredCount++;
    }

    addToast(
      restoredCount === 1
        ? `Restored "${itemsToRestore[0]?.name}" back to pipeline`
        : `Restored ${restoredCount} leads back to pipeline`,
      'success'
    );
  };

  // Trash Selection Handlers
  const handleToggleSelectTrash = (leadId: string | number, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setSelectedTrashIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSelectAllTrash = () => {
    if (selectedTrashIds.length === filteredTrashLeads.length && filteredTrashLeads.length > 0) {
      setSelectedTrashIds([]);
    } else {
      setSelectedTrashIds(filteredTrashLeads.map((t) => t.id));
    }
  };

  const handleRestoreSelectedTrash = async () => {
    if (selectedTrashIds.length === 0) return;
    const ids = [...selectedTrashIds];
    setSelectedTrashIds([]);
    let count = 0;
    for (const id of ids) {
      const ok = await restoreLead(id);
      if (ok) count++;
    }
    addToast(`Restored ${count} selected lead(s) back to pipeline`, 'success');
  };

  const handleDeleteSelectedTrashForever = async () => {
    if (selectedTrashIds.length === 0) return;
    const ids = [...selectedTrashIds];
    setSelectedTrashIds([]);
    for (const id of ids) {
      await permanentlyDeleteLead(id);
    }
    addToast(`Permanently deleted ${ids.length} lead(s)`, 'info');
  };

  // Right-Click Context Menu State (Quick Move & Actions)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    lead: Lead;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, lead: Lead) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveStagePopoverId(null);

    const menuWidth = 270;
    const menuHeight = 440;
    const x = e.clientX + menuWidth > window.innerWidth ? Math.max(10, window.innerWidth - menuWidth - 16) : e.clientX;
    const y = e.clientY + menuHeight > window.innerHeight ? Math.max(10, window.innerHeight - menuHeight - 16) : e.clientY;

    setContextMenu({ x, y, lead });
  };

  useEffect(() => {
    const handleDismiss = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleDismiss);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dynamic synchronization: fetch fresh leads and follow-ups from backend on mount
  useEffect(() => {
    Promise.allSettled([
      qiyamApi.fetchLeads(),
      qiyamApi.fetchFollowUps(),
    ]).then(([leadsRes, fuRes]) => {
      useQiyamStore.setState((state) => {
        let nextLeads = state.leads;
        if (leadsRes.status === 'fulfilled' && Array.isArray(leadsRes.value) && leadsRes.value.length > 0) {
          const freshLeads = leadsRes.value as Lead[];
          const existingMap = new Map<string, Lead>();
          freshLeads.forEach((l) => existingMap.set(String(l.id), l));
          state.leads.forEach((l) => {
            if (!existingMap.has(String(l.id))) {
              existingMap.set(String(l.id), l);
            }
          });
          nextLeads = Array.from(existingMap.values());
          try {
            localStorage.setItem('whatsq_leads_cache', JSON.stringify(nextLeads));
          } catch {}
        }

        let nextFollowups = state.followups;
        if (fuRes.status === 'fulfilled' && Array.isArray(fuRes.value) && fuRes.value.length > 0) {
          const freshFu = fuRes.value as FollowUp[];
          const fuMap = new Map<string, FollowUp>();
          freshFu.forEach((f) => fuMap.set(String(f.id), f));
          state.followups.forEach((f) => {
            if (!fuMap.has(String(f.id))) {
              fuMap.set(String(f.id), f);
            }
          });
          nextFollowups = Array.from(fuMap.values());
          try {
            localStorage.setItem('whatsq_followups_cache', JSON.stringify(nextFollowups));
          } catch {}
        }

        return { leads: nextLeads, followups: nextFollowups };
      });
    }).catch((e) => console.warn('[LeadsView] Could not fetch fresh leads/followups:', e));
  }, []);

  // Dynamic follow-up resolver matching both lead properties and followups store
  const getLeadFollowUpInfo = (lead: Lead) => {
    const cleanDigits = (p?: string) => String(p || '').replace(/\D/g, '').slice(-10);
    const lDigits = cleanDigits(lead.phone);
    const fu = followups.find((f) => {
      if (f.related_to && f.related_to.includes(`Lead #${lead.id}`)) return true;
      if (lDigits && cleanDigits(f.phone) === lDigits) return true;
      return false;
    });

    const date = lead.next_follow_up_date || fu?.due_date;
    const time = lead.next_follow_up_time || fu?.due_time;
    const status = fu?.status || 'scheduled';
    const isCompleted = status === 'completed';

    return {
      hasFollowUp: Boolean(date),
      date,
      time,
      status,
      isCompleted,
      fu,
    };
  };

  // Stage popover toggling and updating
  const handleToggleStagePopover = (leadId: string | number) => {
    setActiveStagePopoverId((prev) => (prev === leadId ? null : leadId));
  };

  const handleStageSelectClick = async (lead: Lead, targetStage: Lead['stage']) => {
    setActiveStagePopoverId(null);
    if (lead.stage === targetStage) return;

    // Moving to follow_up: Open the dedicated Schedule Follow-up modal!
    if (targetStage === 'follow_up') {
      setFollowUpModalLead(lead);
      return;
    }

    // Terminal / critical milestones (Won or Lost) require confirmation and context
    if (targetStage === 'won' || targetStage === 'lost') {
      setPendingStageChange({ lead, targetStage });
      setStageNote(targetStage === 'won' ? 'Customer confirmed deal / booking' : 'Customer chose alternative provider');
      return;
    }

    // Standard progression: Instant 1-click update with optimistic feedback & toast
    try {
      await updateLeadStage(lead.id, targetStage);
      addToast(`Updated ${lead.name} to "${getStageConfig(targetStage).label}"`, 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update stage', 'error');
    }
  };

  const handleConfirmStageChange = async () => {
    if (!pendingStageChange) return;
    setIsUpdatingStage(true);
    try {
      await updateLeadStage(pendingStageChange.lead.id, pendingStageChange.targetStage, stageNote);
      addToast(`Updated ${pendingStageChange.lead.name} to "${getStageConfig(pendingStageChange.targetStage).label}"`, 'success');
      setPendingStageChange(null);
      setStageNote('');
    } finally {
      setIsUpdatingStage(false);
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

  const effectiveSearch = searchQuery || globalFilter.query || '';

  // Auto-reconcile any conversations marked as Lead that aren't yet in leads
  const combinedLeads = useMemo(() => {
    const existingPhones = new Set(
      leads.map((l) => String(l.phone || '').replace(/\D/g, '').slice(-10)).filter(Boolean)
    );
    const existingNames = new Set(
      leads.map((l) => (l.name || '').trim().toLowerCase()).filter(Boolean)
    );

    const synthesized: Lead[] = [];
    (conversations || []).forEach((c) => {
      const isLeadConv = c.category === 'Lead' || c.category === 'Hot Lead' || Boolean(c.lead_stage);
      if (!isLeadConv) return;

      const cPhoneDigits = String(c.phone_number || '').replace(/\D/g, '').slice(-10);
      const cName = (c.contact_name || '').trim().toLowerCase();

      if (cPhoneDigits && existingPhones.has(cPhoneDigits)) return;
      if (cName && existingNames.has(cName)) return;

      const stageMap: Record<string, Lead['stage']> = {
        'New Lead': 'new',
        'Contacted': 'contacted',
        'Follow-up': 'follow_up',
        'Appointment Confirmed': 'qualified',
        'Proposal Sent': 'proposal_sent',
        'In Negotiation': 'negotiation',
        'Negotiation': 'negotiation',
        'Won': 'won',
        'Lost': 'lost',
      };

      const resolvedStage: Lead['stage'] = stageMap[c.lead_stage || ''] || 'new';

      synthesized.push({
        id: `conv-lead-${c.id}`,
        name: c.contact_name || `Customer (+${cPhoneDigits.slice(-4)})`,
        phone: c.phone_number,
        service: c.service_needed || 'WhatsApp Inquiry',
        location: c.location || 'Koyilandy, Kerala',
        value: Number(c.estimated_value) || 2800,
        stage: resolvedStage,
        owner: c.lead_owner || 'Rahul Mehta',
        source: c.source || 'WhatsApp',
        created_at_str: c.first_contact_date || 'Today',
        last_contact_str: c.last_contact_date || 'Just now',
        notes: c.notes || 'Inbound WhatsApp conversation',
        tags: c.tags || ['WhatsApp Lead'],
      });
    });

    return [...leads, ...synthesized];
  }, [leads, conversations]);

  const filteredLeads = combinedLeads.filter((l) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      const match =
        l.stage === s ||
        (s === 'open' && (l.stage === 'new' || l.stage === 'contacted' || l.stage === 'follow_up')) ||
        (s === 'in_progress' && (l.stage === 'qualified' || l.stage === 'proposal_sent' || l.stage === 'negotiation')) ||
        (s === 'completed' && l.stage === 'won');
      if (!match) return false;
    }
    if (globalFilter.assignedTo && globalFilter.assignedTo !== 'all' && l.owner !== globalFilter.assignedTo) {
      return false;
    }
    if (!isDateWithinInterval(l.created_at_str, globalDateInterval)) {
      // Do not hide newly arrived leads, today's leads, or new stage inquiries
      const isNewOrToday =
        l.stage === 'new' ||
        l.created_at_str?.toLowerCase().includes('today') ||
        l.last_contact_str?.toLowerCase().includes('today') ||
        l.last_contact_str?.toLowerCase().includes('just now') ||
        (l.created_at_str && l.created_at_str.includes(new Date().getFullYear().toString()));
      if (!isNewOrToday) {
        return false;
      }
    }
    if (!effectiveSearch) return true;
    const q = effectiveSearch.toLowerCase();
    const cleanQ = q.replace(/\D/g, '');
    const lDigits = (l.phone || '').replace(/\D/g, '');
    return (
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      (cleanQ && lDigits.includes(cleanQ)) ||
      (l.service && l.service.toLowerCase().includes(q)) ||
      (l.location && l.location.toLowerCase().includes(q))
    );
  });

  const filteredTrashLeads = trashLeads.filter((item) => {
    if (!effectiveSearch) return true;
    const q = effectiveSearch.toLowerCase();
    return (
      item.lead.name.toLowerCase().includes(q) ||
      item.lead.phone.includes(q) ||
      item.lead.service.toLowerCase().includes(q)
    );
  });

  const stages: Array<{
    id: Lead['stage'];
    label: string;
    count: number;
    color: string;
    dotColor: string;
    badgeClass: string;
  }> = [
    { id: 'new', label: 'New Lead', count: filteredLeads.filter((l) => l.stage === 'new').length, color: 'border-blue-500 text-blue-700 bg-blue-50', dotColor: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'contacted', label: 'Contacted', count: filteredLeads.filter((l) => l.stage === 'contacted').length, color: 'border-purple-500 text-purple-700 bg-purple-50', dotColor: 'bg-purple-500', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'follow_up', label: 'Follow-up', count: filteredLeads.filter((l) => l.stage === 'follow_up').length, color: 'border-sky-500 text-sky-700 bg-sky-50', dotColor: 'bg-sky-500', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: 'qualified', label: 'Qualified', count: filteredLeads.filter((l) => l.stage === 'qualified').length, color: 'border-amber-500 text-amber-700 bg-amber-50', dotColor: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'proposal_sent', label: 'Proposal Sent', count: filteredLeads.filter((l) => l.stage === 'proposal_sent').length, color: 'border-indigo-500 text-indigo-700 bg-indigo-50', dotColor: 'bg-indigo-500', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'negotiation', label: 'Negotiation', count: filteredLeads.filter((l) => l.stage === 'negotiation').length, color: 'border-orange-500 text-orange-700 bg-orange-50', dotColor: 'bg-orange-500', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
    { id: 'won', label: 'Won', count: filteredLeads.filter((l) => l.stage === 'won').length, color: 'border-emerald-500 text-emerald-700 bg-emerald-50', dotColor: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'lost', label: 'Lost', count: filteredLeads.filter((l) => l.stage === 'lost').length, color: 'border-rose-500 text-rose-700 bg-rose-50', dotColor: 'bg-rose-500', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  // Kanban Horizontal Smooth Scroll & Quick-Jump State
  const kanbanScrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollingRef = useRef(false);
  const lastProgrammaticTimeRef = useRef(0);
  const [highlightedColumnId, setHighlightedColumnId] = useState<string | null>(null);
  const [activeScrolledStage, setActiveScrolledStage] = useState<string>('new');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Won Deals Tooltip & Quick View State
  const [isWonTooltipOpen, setIsWonTooltipOpen] = useState(false);
  const wonTooltipTimerRef = useRef<any>(null);
  const wonLeads = useMemo(() => leads.filter((l) => l.stage === 'won'), [leads]);
  const wonTotalValue = useMemo(() => wonLeads.reduce((a, b) => a + b.value, 0), [wonLeads]);

  const handleJumpToWon = () => {
    if (viewMode !== 'kanban') {
      setViewMode('kanban');
      setTimeout(() => {
        scrollToKanbanColumn('won');
      }, 150);
    } else {
      scrollToKanbanColumn('won');
    }
    setIsWonTooltipOpen(false);
  };

  const checkScrollBounds = () => {
    const container = kanbanScrollContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 20);
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 20);

    // If scrolling programmatically via a pill click or recently jumped, do not let scroll events override the active stage!
    if (isProgrammaticScrollingRef.current || (Date.now() - lastProgrammaticTimeRef.current < 1500)) return;

    const isAtRightEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 40;
    const isAtLeftEnd = container.scrollLeft <= 30;

    if (isAtLeftEnd) {
      setActiveScrolledStage(stages[0]?.id || 'new');
      return;
    }

    if (isAtRightEnd) {
      // If currently selected stage is already one of the visible rightmost stages, preserve it
      const rightStages = ['won', 'lost', 'negotiation'];
      if (rightStages.includes(activeScrolledStage)) {
        return;
      }
      setActiveScrolledStage('won');
      return;
    }

    // Determine the column closest to the center of the container viewport
    const containerRect = container.getBoundingClientRect();
    const viewportCenter = containerRect.left + containerRect.width / 2;

    let bestStage = activeScrolledStage;
    let minDistance = Infinity;

    stages.forEach((s) => {
      const colEl = document.getElementById(`kanban-col-${s.id}`);
      if (colEl) {
        const colRect = colEl.getBoundingClientRect();
        const colCenter = colRect.left + colRect.width / 2;
        const dist = Math.abs(colCenter - viewportCenter);
        if (dist < minDistance) {
          minDistance = dist;
          bestStage = s.id;
        }
      }
    });

    setActiveScrolledStage(bestStage);
  };

  const scrollToKanbanColumn = (stageId: Lead['stage']) => {
    setActiveScrolledStage(stageId);
    setHighlightedColumnId(stageId);
    isProgrammaticScrollingRef.current = true;
    lastProgrammaticTimeRef.current = Date.now();

    const container = kanbanScrollContainerRef.current;
    const colEl = document.getElementById(`kanban-col-${stageId}`);
    if (colEl && container) {
      // Calculate precise target using offsetLeft
      const scrollTarget = colEl.offsetLeft - 16;

      container.scrollTo({
        left: Math.max(0, scrollTarget),
        behavior: 'smooth',
      });

      // Keep lock active for duration of smooth scroll (1000ms), and update arrow states without overriding activeScrolledStage
      setTimeout(() => {
        isProgrammaticScrollingRef.current = false;
        if (kanbanScrollContainerRef.current) {
          const c = kanbanScrollContainerRef.current;
          setCanScrollLeft(c.scrollLeft > 20);
          setCanScrollRight(c.scrollLeft + c.clientWidth < c.scrollWidth - 20);
        }
      }, 1000);

      // Keep column card pulse effect for 2.5 seconds
      setTimeout(() => {
        setHighlightedColumnId((prev) => (prev === stageId ? null : prev));
      }, 2500);
    } else {
      isProgrammaticScrollingRef.current = false;
    }
  };

  const scrollKanbanBy = (direction: 'left' | 'right') => {
    if (kanbanScrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      kanbanScrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (viewMode === 'kanban') {
      const timer = setTimeout(() => {
        checkScrollBounds();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, filteredLeads.length]);

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
        handleStageSelectClick(match, stageId);
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('trash')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'trash' ? 'bg-white text-rose-700 shadow-sm ring-1 ring-rose-200' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="View Deleted Leads & Recycle Bin"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Trash</span>
              {trashLeads.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                  {trashLeads.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={viewMode === 'trash' ? "Search deleted leads..." : "Search leads..."}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-60"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-2.5">
          {viewMode === 'trash' ? (
            <div className="flex items-center gap-2">
              <span className="text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                <Trash2 className="w-3 h-3 text-rose-500" />
                <span>{filteredTrashLeads.length} in trash</span>
              </span>
              {filteredTrashLeads.length > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setIsEmptyTrashModalOpen(true)}
                    className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer hover:underline text-xs"
                  >
                    Empty Trash
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {selectedLeadIds.length > 0 && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-lg animate-in fade-in">
                  <span className="font-bold">{selectedLeadIds.length} selected</span>
                  <button
                    type="button"
                    onClick={handleOpenDeleteSelectedModal}
                    className="font-bold text-rose-800 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLeadIds([])}
                    className="text-slate-400 hover:text-slate-600 text-[10px] ml-1 cursor-pointer"
                  >
                    (Clear)
                  </button>
                </div>
              )}
              <span>Total: <strong className="text-slate-800">{filteredLeads.length}</strong></span>
              <span className="text-slate-300">•</span>
              <div
                className="relative inline-block"
                onMouseEnter={() => {
                  if (wonTooltipTimerRef.current) clearTimeout(wonTooltipTimerRef.current);
                  setIsWonTooltipOpen(true);
                }}
                onMouseLeave={() => {
                  wonTooltipTimerRef.current = setTimeout(() => {
                    setIsWonTooltipOpen(false);
                  }, 250);
                }}
              >
                <button
                  type="button"
                  onClick={handleJumpToWon}
                  className="group/won text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 hover:border-emerald-300 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-102"
                  title="Hover for Won deals details or click to view in Kanban"
                >
                  <Trophy className="w-3.5 h-3.5 text-emerald-600 group-hover/won:rotate-12 transition-transform" />
                  <span>Won: ₹{wonTotalValue.toLocaleString()}</span>
                  <span className="bg-emerald-200/80 text-emerald-800 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                    {wonLeads.length}
                  </span>
                </button>

                {/* Won Deals Hover Popover */}
                {isWonTooltipOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-200/80 ring-1 ring-black/5 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3"
                    onMouseEnter={() => {
                      if (wonTooltipTimerRef.current) clearTimeout(wonTooltipTimerRef.current);
                    }}
                    onMouseLeave={() => setIsWonTooltipOpen(false)}
                  >
                    {/* Popover Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">Won Closed Deals</h4>
                          <p className="text-[10px] text-slate-500">{wonLeads.length} successful conversions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-sm text-emerald-600 font-mono">₹{wonTotalValue.toLocaleString()}</div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                          Closed Revenue
                        </span>
                      </div>
                    </div>

                    {/* Won Leads Mini-List */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                      {wonLeads.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center">No won deals recorded yet.</p>
                      ) : (
                        wonLeads.map((w) => (
                          <div
                            key={w.id}
                            onClick={() => {
                              setSelectedLead(w);
                              setIsLeadDrawerOpen(true);
                              setIsWonTooltipOpen(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group/witem"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-xs text-slate-800 truncate group-hover/witem:text-emerald-900">
                                {w.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {w.service || 'Service Closed'}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-emerald-600 font-mono">₹{w.value.toLocaleString()}</span>
                              <div className="text-[9px] text-slate-400 font-mono">{w.phone}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* CTA Button to jump to Won column */}
                    <button
                      type="button"
                      onClick={handleJumpToWon}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer group/cta"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>View Won Section in Kanban</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Active Pipeline: <strong className="text-slate-900">₹{leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').reduce((a, b) => a + b.value, 0).toLocaleString()}</strong></span>
            </>
          )}
        </div>
      </div>

      {/* Kanban Stage Quick-Jump Navigation Bar */}
      {viewMode === 'kanban' && (
        <div className="bg-white border-b border-slate-200/90 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] shrink-0 select-none pr-1">
              <Compass className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Jump to Column:</span>
              <span className="sm:hidden">Jump:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {stages.map((st) => {
                const isSelected = activeScrolledStage === st.id || highlightedColumnId === st.id;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => scrollToKanbanColumn(st.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer shadow-2xs border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-900/20 scale-102'
                        : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/90 hover:border-slate-300'
                    }`}
                    title={`Click to smoothly jump directly to ${st.label} column`}
                  >
                    <span className={`w-2 h-2 rounded-full ${st.dotColor} shrink-0 ring-1 ring-white/60`} />
                    <span className="whitespace-nowrap">{st.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {st.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slide Navigation Left/Right Arrows */}
          <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-slate-100">
            <button
              type="button"
              onClick={() => scrollKanbanBy('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed"
              title="Scroll Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollKanbanBy('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed"
              title="Scroll Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Kanban Content Area */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {viewMode === 'kanban' ? (
          <div className="flex-1 relative min-h-0 flex flex-col overflow-hidden">
            {/* Floating Left Slide Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollKanbanBy('left')}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 shadow-xl border border-slate-200/90 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-slate-900/10"
                title="Slide Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Floating Right Slide Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollKanbanBy('right')}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 shadow-xl border border-slate-200/90 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-slate-900/10"
                title="Slide Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <div
              ref={kanbanScrollContainerRef}
              onScroll={checkScrollBounds}
              className="flex-1 overflow-x-auto overflow-y-hidden p-3 sm:p-5 md:p-6 flex gap-3 sm:gap-4 items-stretch scrollbar-thin min-h-0 scroll-smooth"
            >
              {stages.map((col) => {
                const colLeads = filteredLeads.filter((l) => l.stage === col.id);
                const isTargetCol = highlightedColumnId === col.id;

                const colSearchRaw = (columnSearchQueries[col.id] || '').trim().toLowerCase();
                const colSearchDigits = colSearchRaw.replace(/\D/g, '');

                const displayColLeads = colSearchRaw
                  ? colLeads.filter((l) => {
                      const matchName = l.name.toLowerCase().includes(colSearchRaw);
                      const lDigits = (l.phone || '').replace(/\D/g, '');
                      const matchPhone =
                        l.phone.toLowerCase().includes(colSearchRaw) ||
                        (colSearchDigits && lDigits.includes(colSearchDigits));
                      const matchService = (l.service || '').toLowerCase().includes(colSearchRaw);
                      const matchLoc = (l.location || '').toLowerCase().includes(colSearchRaw);
                      const matchOwner = (l.owner || '').toLowerCase().includes(colSearchRaw);
                      return matchName || matchPhone || matchService || matchLoc || matchOwner;
                    })
                  : colLeads;

                return (
                  <div
                    key={col.id}
                    id={`kanban-col-${col.id}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`w-[85vw] sm:w-72 bg-slate-100/80 rounded-2xl border transition-all duration-500 flex flex-col h-full max-h-full min-h-0 shrink-0 shadow-sm ${
                      isTargetCol
                        ? 'ring-2 ring-emerald-500 ring-offset-2 border-emerald-400 bg-emerald-50/25 shadow-lg scale-[1.015]'
                        : 'border-slate-200/80'
                    }`}
                  >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-200/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.color}`}>
                        {colSearchRaw ? `${displayColLeads.length} / ${col.count}` : col.count}
                      </span>
                      <h3 className="font-bold text-xs text-slate-800">{col.label}</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      ₹{displayColLeads.reduce((sum, l) => sum + l.value, 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Dedicated Kanban Column Search Bar */}
                  <div className="px-3 pt-2.5 pb-1 shrink-0">
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder={`Search ${col.label.toLowerCase()}... (name, phone)`}
                        value={columnSearchQueries[col.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setColumnSearchQueries((prev) => ({ ...prev, [col.id]: val }));
                        }}
                        className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-2xs"
                      />
                      {columnSearchQueries[col.id] && (
                        <button
                          type="button"
                          onClick={() => setColumnSearchQueries((prev) => ({ ...prev, [col.id]: '' }))}
                          className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                          title="Clear column search"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Column Cards */}
                  <div
                    data-vertical-scroll="true"
                    data-no-horizontal-wheel="true"
                    data-no-horizontal-drag="true"
                    className="p-3 pb-8 overflow-y-auto space-y-3 flex-1 min-h-0 scrollbar-thin overscroll-contain kanban-column-cards"
                  >
                    {colSearchRaw && displayColLeads.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 space-y-1.5 bg-white/70 rounded-xl border border-dashed border-slate-200 my-2">
                        <Search className="w-4 h-4 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold text-slate-600">No leads found in {col.label}</p>
                        <p className="text-[10px] text-slate-400 truncate">"{columnSearchQueries[col.id]}"</p>
                        <button
                          type="button"
                          onClick={() => setColumnSearchQueries((prev) => ({ ...prev, [col.id]: '' }))}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline mt-1 cursor-pointer"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      displayColLeads.map((lead) => {
                      const isWon = lead.stage === 'won';
                      const isLost = lead.stage === 'lost';
                      const isOpen = !isWon && !isLost;
                      const isSelected = selectedLeadIds.includes(lead.id);

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('leadId', String(lead.id))}
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsLeadDrawerOpen(true);
                          }}
                          onContextMenu={(e) => handleContextMenu(e, lead)}
                          className={`p-3.5 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 bg-emerald-50/30 border-emerald-400 shadow-md'
                              : contextMenu?.lead.id === lead.id
                              ? 'ring-2 ring-emerald-500 bg-emerald-50/20 border-emerald-400 shadow-md'
                              : isWon
                              ? 'bg-emerald-50/50 border-emerald-300 hover:border-emerald-500'
                              : isLost
                              ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400 opacity-80'
                              : 'bg-white border-slate-200 hover:border-emerald-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleToggleSelectLead(lead.id, e)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                                title="Select lead"
                              />
                              <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5 truncate">
                                {isWon && <Trophy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                {isLost && <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                                <span className="truncate">{lead.name}</span>
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-bold text-xs text-emerald-600 font-mono">₹{lead.value.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditLeadModal(lead);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
                                title={`Edit ${lead.name}`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteModal(lead);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                title="Delete this lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-600 font-medium">{lead.service}</div>

                          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                            <span>{lead.location}</span>
                            <span className="font-medium text-slate-500">{lead.owner}</span>
                          </div>

                          {(() => {
                            const info = getLeadFollowUpInfo(lead);
                            if (!info.hasFollowUp) return null;
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFollowUpModalLead(lead);
                                }}
                                className="w-full flex items-center justify-between text-[10px] font-semibold px-2 py-1 rounded-lg border bg-sky-50 hover:bg-sky-100/90 text-sky-700 hover:text-sky-900 border-sky-200/90 hover:border-sky-300 transition-all cursor-pointer group/fu shadow-2xs text-left"
                                title="Click to edit follow-up schedule and details"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Calendar className="w-3 h-3 text-sky-600 shrink-0 group-hover/fu:scale-110 transition-transform" />
                                  <span className="truncate">Follow-up: {info.date}{info.time ? ` @ ${info.time}` : ''}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-1">
                                  {info.isCompleted && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">Done</span>
                                  )}
                                  <span className="text-[9px] text-sky-700 font-bold bg-white/90 hover:bg-white px-1.5 py-0.5 rounded border border-sky-200/80 flex items-center gap-0.5 shadow-2xs group-hover/fu:border-sky-400">
                                    <Edit3 className="w-2.5 h-2.5 text-sky-600" />
                                    <span>Edit</span>
                                  </span>
                                </div>
                              </button>
                            );
                          })()}

                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {lead.tags.map((tag, idx) => (
                                <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Quick 1-click Won / Lost / Delete action bar for active pipeline leads */}
                          {isOpen && (
                            <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(lead)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                title="Delete lead"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <div className="flex items-center gap-1.5">
                                {lead.stage === 'follow_up' && (
                                  <button
                                    type="button"
                                    onClick={() => setFollowUpModalLead(lead)}
                                    className="px-2 py-0.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Edit follow-up schedule"
                                  >
                                    <Calendar className="w-2.5 h-2.5 text-sky-600" />
                                    Edit Schedule
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleStageSelectClick(lead, 'won')}
                                  className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Mark as Won"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  Won
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStageSelectClick(lead, 'lost')}
                                  className="px-1.5 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[10px] font-semibold transition-all flex items-center gap-0.5 cursor-pointer shadow-2xs"
                                  title="Mark as Lost"
                                >
                                  <X className="w-2.5 h-2.5" />
                                  Lost
                                </button>
                              </div>
                            </div>
                          )}

                          {isWon && (
                            <div className="pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-700 font-bold" onClick={(e) => e.stopPropagation()}>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Deal Won & Closed
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(lead)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete lead"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {isLost && (
                            <div className="pt-1.5 border-t border-rose-200/60 flex items-center justify-between text-[10px] text-rose-600 font-bold" onClick={(e) => e.stopPropagation()}>
                              <span className="flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-500" />
                                Closed as Lost
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(lead)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete lead"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }))}

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
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-thin min-h-[460px] pb-32">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                        onChange={handleSelectAllLeads}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        title={selectedLeadIds.length === filteredLeads.length ? "Deselect all" : "Select all"}
                      />
                    </th>
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
                    // Only open upwards if near the very bottom of a long list, preventing cut-off at table headers
                    const shouldOpenUpwards = filteredLeads.length > 4 && idx >= filteredLeads.length - 2;

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsLeadDrawerOpen(true);
                        }}
                        onContextMenu={(e) => handleContextMenu(e, lead)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          selectedLeadIds.includes(lead.id)
                            ? 'bg-emerald-50/40 ring-1 ring-emerald-300/60'
                            : contextMenu?.lead.id === lead.id
                            ? 'bg-emerald-50/60 ring-1 ring-emerald-400'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.includes(lead.id)}
                            onChange={() => handleToggleSelectLead(lead.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{lead.name}</div>
                          {(() => {
                            const info = getLeadFollowUpInfo(lead);
                            if (!info.hasFollowUp) return null;
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFollowUpModalLead(lead);
                                }}
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 border cursor-pointer transition-all hover:scale-102 ${
                                  info.isCompleted
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                                    : 'bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100'
                                }`}
                                title="Click to edit follow-up schedule"
                              >
                                <Calendar className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                                <span>Follow-up: {info.date}{info.time ? ` @ ${info.time}` : ''}</span>
                                {info.isCompleted && <span className="text-[9px] font-bold text-emerald-800 ml-0.5">(Done)</span>}
                                <Edit3 className="w-2.5 h-2.5 text-sky-500 ml-0.5" />
                              </button>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{lead.phone}</td>
                        <td className="py-3 px-4 font-medium">{lead.service}</td>
                        <td className="py-3 px-4 text-slate-500">{lead.location}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">₹{lead.value.toLocaleString()}</td>
                        <td
                          className="py-3 px-4 relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-block relative">
                            {/* Backdrop for instant click-outside dismiss */}
                            {isPopoverOpen && (
                              <div
                                className="fixed inset-0 z-20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveStagePopoverId(null);
                                }}
                              />
                            )}

                            {/* Trigger Badge */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStagePopover(lead.id);
                              }}
                              className={`group/badge relative ${isPopoverOpen ? 'z-20' : 'z-0'} inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-2xs ${currentStageCfg.badgeClass} ${
                                isPopoverOpen
                                  ? 'ring-2 ring-emerald-500/25 border-emerald-400 bg-white shadow-xs'
                                  : 'hover:shadow-xs hover:border-slate-300'
                              }`}
                              title="Click to update pipeline stage"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${currentStageCfg.dotColor} shrink-0 ring-1 ring-black/10`} />
                              <span className="capitalize">{currentStageCfg.label}</span>
                              <ChevronDown
                                className={`w-3 h-3 opacity-60 group-hover/badge:opacity-100 transition-transform duration-200 ${
                                  isPopoverOpen ? 'rotate-180 opacity-100 text-slate-800' : ''
                                }`}
                              />
                            </button>

                            {/* Interactive Stage Popover */}
                            {isPopoverOpen && (
                              <div
                                className={`absolute left-0 ${
                                  shouldOpenUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } z-30 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/90 ring-1 ring-black/5 p-1.5 animate-in fade-in zoom-in-95 duration-100`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Popover Header */}
                                <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-slate-700">
                                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline Stage</span>
                                  </div>
                                  <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                    1-Click Switch
                                  </span>
                                </div>

                                {/* Stage Options List */}
                                <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-thin pr-0.5">
                                  {ALL_LEAD_STAGES.map((s) => {
                                    const isCurrent = lead.stage === s.id;
                                    const isWonOrLost = s.id === 'won' || s.id === 'lost';
                                    const isFirstWonOrLost = s.id === 'won';

                                    return (
                                      <React.Fragment key={s.id}>
                                        {isFirstWonOrLost && (
                                          <div className="pt-1.5 mt-1 border-t border-slate-100 px-2 py-0.5 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                              Outcome / Closed
                                            </span>
                                          </div>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleStageSelectClick(lead, s.id)}
                                          disabled={isCurrent}
                                          className={`group/item w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                                            isCurrent
                                              ? `${s.badgeClass} border font-bold shadow-2xs cursor-default`
                                              : 'hover:bg-slate-50 text-slate-700 font-medium cursor-pointer'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className={`w-2 h-2 rounded-full ${s.dotColor} shrink-0 ring-2 ring-white shadow-2xs`} />
                                            <div className="truncate">
                                              <span className={`text-xs block ${isCurrent ? 'font-bold' : 'font-semibold text-slate-700 group-hover/item:text-slate-900'}`}>
                                                {s.label}
                                              </span>
                                              <span className="text-[10px] text-slate-400 group-hover/item:text-slate-500 block truncate font-normal">
                                                {s.description}
                                              </span>
                                            </div>
                                          </div>

                                          {isCurrent ? (
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200/80 shrink-0">
                                              <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                                              Current
                                            </span>
                                          ) : (
                                            <span className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 shrink-0 pr-0.5">
                                              {isWonOrLost ? 'Close' : 'Set'}
                                              <ArrowRight className="w-2.5 h-2.5" />
                                            </span>
                                          )}
                                        </button>
                                      </React.Fragment>
                                    );
                                  })}
                                </div>

                                {/* Popover Footer */}
                                <div className="px-2.5 py-1.5 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveStagePopoverId(null);
                                      setPendingStageChange({ lead, targetStage: lead.stage });
                                      setStageNote('');
                                    }}
                                    className="hover:text-emerald-700 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <FileText className="w-3 h-3 text-slate-400" />
                                    <span>Add note...</span>
                                  </button>
                                  <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                    Instant
                                  </span>
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

                            {/* Won / Lost Status or Quick Action Buttons */}
                            {lead.stage === 'won' ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-emerald-600" />
                                <span>Won</span>
                              </span>
                            ) : lead.stage === 'lost' ? (
                              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-500" />
                                <span>Lost</span>
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStageSelectClick(lead, 'won')}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                  title="Mark Lead as Won"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Won</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStageSelectClick(lead, 'lost')}
                                  className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-semibold text-[11px] inline-flex items-center gap-0.5 shadow-2xs transition-all cursor-pointer"
                                  title="Mark Lead as Lost"
                                >
                                  <X className="w-3 h-3 text-rose-500" />
                                  <span>Lost</span>
                                </button>
                              </div>
                            )}

                            {/* Edit Lead Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditLeadModal(lead)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs inline-flex items-center ml-0.5"
                              title={`Edit ${lead.name}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Lead Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(lead)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-2xs inline-flex items-center ml-0.5"
                              title={`Delete ${lead.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        ) : (
          /* Trash / Recycle Bin View */
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col space-y-4">
            {/* Trash Action & Stat Banner */}
            <div className="bg-white rounded-2xl border border-rose-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>Leads Trash & Recycle Bin</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                      {filteredTrashLeads.length} {filteredTrashLeads.length === 1 ? 'item' : 'items'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Deleted leads remain here so you can easily restore them at any time. Restoring a lead brings it back to its original pipeline stage.
                  </p>
                </div>
              </div>

              {/* Trash Quick Toolbar */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {selectedTrashIds.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleRestoreSelectedTrash}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Selected ({selectedTrashIds.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSelectedTrashForever}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Forever</span>
                    </button>
                  </>
                )}

                {trashLeads.length > 0 && (
                  <>
                    <button
                      type="button"
                      disabled={isRestoringAll}
                      onClick={async () => {
                        setIsRestoringAll(true);
                        try {
                          await restoreAllLeads();
                        } finally {
                          setIsRestoringAll(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title="Restore all leads back to pipeline"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isRestoringAll ? 'animate-spin' : ''}`} />
                      <span>Restore All</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmptyTrashModalOpen(true)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Empty Trash</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                >
                  Back to Pipeline
                </button>
              </div>
            </div>

            {/* Trash Table or Empty State */}
            {filteredTrashLeads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 opacity-60" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">Trash is Empty</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  {effectiveSearch
                    ? `No deleted leads match "${effectiveSearch}".`
                    : 'There are no deleted leads in the trash. Any leads you remove will be kept here for easy recovery.'}
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  View Active Leads
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedTrashIds.length === filteredTrashLeads.length && filteredTrashLeads.length > 0}
                          onChange={handleSelectAllTrash}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                          title="Select all deleted leads"
                        />
                      </th>
                      <th className="py-3 px-4">Lead Name</th>
                      <th className="py-3 px-4">Phone / WhatsApp</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Estimated Value</th>
                      <th className="py-3 px-4">Stage Before Deletion</th>
                      <th className="py-3 px-4">Deleted At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredTrashLeads.map((item) => {
                      const stageCfg = getStageConfig(item.lead.stage);
                      const isSelected = selectedTrashIds.includes(item.id);
                      const deletedDateFormatted = (() => {
                        try {
                          const d = new Date(item.deleted_at);
                          return d.toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        } catch {
                          return item.deleted_at || 'Recently';
                        }
                      })();

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-rose-50/40 ring-1 ring-rose-300/60' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleToggleSelectTrash(item.id, e)}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.lead.name}</div>
                            <div className="text-[10px] text-slate-400">{item.lead.location}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{item.lead.phone}</td>
                          <td className="py-3 px-4 font-medium">{item.lead.service}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">₹{item.lead.value.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stageCfg.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${stageCfg.dotColor}`} />
                              <span>{stageCfg.label}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{deletedDateFormatted}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Restore Button */}
                              <button
                                type="button"
                                onClick={() => restoreLead(item.id)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                title="Restore lead back to pipeline"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Restore</span>
                              </button>

                              {/* Delete Forever Button */}
                              <button
                                type="button"
                                onClick={() => permanentlyDeleteLead(item.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                                title="Permanently delete from trash"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditLeadModal(selectedLead)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-colors"
                    title={`Edit ${selectedLead.name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(selectedLead)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title={`Delete ${selectedLead.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsLeadDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

            {/* Quick Action Strip */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  openConversationForContact({
                    name: selectedLead.name,
                    phone: selectedLead.phone,
                    service: selectedLead.service,
                    location: selectedLead.location,
                  });
                }}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </button>

              {selectedLead.stage === 'won' ? (
                <div className="w-full py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center justify-center gap-1.5 text-center">
                  <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lead Won & Customer Record Active</span>
                </div>
              ) : selectedLead.stage === 'lost' ? (
                <div className="w-full py-2 px-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center justify-center gap-1.5 text-center">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Lead Closed as Lost</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStageSelectClick(selectedLead, 'won')}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Won</span>
                  </button>
                  <button
                    onClick={() => handleStageSelectClick(selectedLead, 'lost')}
                    className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Mark Lost</span>
                  </button>
                </div>
              )}
            </div>

            {/* Stage Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Lead Stage</label>
              <select
                value={selectedLead.stage}
                onChange={(e) => {
                  const target = e.target.value as Lead['stage'];
                  if (target !== selectedLead.stage) {
                    if (target === 'follow_up') {
                      setFollowUpModalLead(selectedLead);
                    } else {
                      setPendingStageChange({ lead: selectedLead, targetStage: target });
                      setStageNote('Stage changed via Lead Details Drawer');
                    }
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow-up</option>
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
            {(() => {
              const info = getLeadFollowUpInfo(selectedLead);
              return (
                <div className={`p-3 rounded-xl border ${info.hasFollowUp ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Next Scheduled Follow-up</span>
                      {info.isCompleted && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Completed
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFollowUpModalLead(selectedLead)}
                      className="text-[10px] font-bold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                    >
                      {info.hasFollowUp ? 'Reschedule' : 'Schedule'}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    {info.hasFollowUp ? `${info.date} at ${info.time || '10:00 AM'}` : 'No follow-up scheduled yet'}
                  </p>
                </div>
              );
            })()}

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

            {/* Lead Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditLeadModal(selectedLead)}
                className="flex-1 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>Edit Lead</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenDeleteModal(selectedLead)}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                title="Delete Lead"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete</span>
              </button>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Pipeline Stage</label>
                  <select
                    value={newLeadForm.stage}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, stage: e.target.value as Lead['stage'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won / Closed</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <AgentSelectDropdown
                    label="Assigned Agent / Owner"
                    value={newLeadForm.owner}
                    onChange={(val) => setNewLeadForm({ ...newLeadForm, owner: val })}
                  />
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

      {/* Edit Lead Modal */}
      {editingLead && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => !isSavingEditLead && setEditingLead(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-4 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Lead Details</h3>
                  <p className="text-[11px] text-slate-500">Update customer information, pipeline stage, and follow-up schedule.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLead} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editLeadForm.name}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, name: e.target.value })}
                    placeholder="e.g. Farhan Ali"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone / WhatsApp *</label>
                  <CountryPhoneInput
                    value={editLeadForm.phone}
                    onChange={(val) => setEditLeadForm({ ...editLeadForm, phone: val })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Service Needed</label>
                  <select
                    value={editLeadForm.service}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, service: e.target.value })}
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
                    value={editLeadForm.value}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={editLeadForm.location}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, location: e.target.value })}
                    placeholder="e.g. Mavoor Road, Calicut"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lead Source</label>
                  <select
                    value={editLeadForm.source}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, source: e.target.value })}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pipeline Stage</label>
                  <select
                    value={editLeadForm.stage}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, stage: e.target.value as Lead['stage'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won / Closed</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <AgentSelectDropdown
                    label="Assigned Agent / Owner"
                    value={editLeadForm.owner}
                    onChange={(val) => setEditLeadForm({ ...editLeadForm, owner: val })}
                  />
                </div>
              </div>

              {/* Follow-up Section (Visible when stage is follow_up or a date is already set) */}
              {(editLeadForm.stage === 'follow_up' || Boolean(editLeadForm.next_follow_up_date)) && (
                <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      Follow-up Schedule
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetLead = editingLead;
                        setEditingLead(null);
                        setFollowUpModalLead(targetLead);
                      }}
                      className="text-[10px] font-bold text-sky-700 hover:text-sky-900 bg-white/90 hover:bg-white px-2 py-0.5 rounded-lg border border-sky-200 cursor-pointer shadow-2xs transition-all"
                    >
                      Advanced Follow-up Scheduler →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <ModernDatePicker
                        label="Follow-up Date"
                        value={editLeadForm.next_follow_up_date || new Date().toISOString().split('T')[0]}
                        onChange={(d) => setEditLeadForm({ ...editLeadForm, next_follow_up_date: d })}
                      />
                    </div>
                    <div>
                      <ModernTimePicker
                        label="Follow-up Time"
                        value={editLeadForm.next_follow_up_time || '11:00 AM'}
                        onChange={(t) => setEditLeadForm({ ...editLeadForm, next_follow_up_time: t })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Internal Notes</label>
                <textarea
                  rows={2}
                  value={editLeadForm.notes}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, notes: e.target.value })}
                  placeholder="Additional context or requirements..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const targetLead = editingLead;
                    setEditingLead(null);
                    setFollowUpModalLead(targetLead);
                  }}
                  className="px-3 py-2 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>Reschedule Follow-up</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingEditLead}
                    onClick={() => setEditingLead(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEditLead}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all"
                  >
                    {isSavingEditLead ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
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
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Confirm Stage Change</h3>
                  <p className="text-[11px] text-slate-500">Pipeline transition for {pendingStageChange.lead.name}</p>
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
                {(pendingStageChange.targetStage === 'won'
                  ? [
                      'Deal signed & payment received',
                      'Service booking confirmed',
                      'Quote accepted by customer',
                      'Immediate start requested',
                    ]
                  : pendingStageChange.targetStage === 'lost'
                  ? [
                      'Chose competitor',
                      'Budget out of reach',
                      'Timing postponed by customer',
                      'Unresponsive after follow-ups',
                    ]
                  : [
                      'Prospect requested quote',
                      'Follow-up call completed',
                      'Budget & scope qualified',
                      'Negotiating contract terms',
                      'Client confirmed order',
                    ]
                ).map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setStageNote(quick)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      stageNote === quick
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isUpdatingStage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal (When dragging, selecting Follow-up stage, or rescheduling) */}
      <ScheduleFollowUpModal
        isOpen={!!followUpModalLead}
        initialLead={followUpModalLead}
        onClose={() => setFollowUpModalLead(null)}
      />

      {/* Right-Click Context Menu for Quick Stage Transition & Actions */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-50 pointer-events-auto"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
        >
          <div
            style={{
              position: 'fixed',
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 ring-1 ring-black/5 p-2 animate-in fade-in zoom-in-95 duration-100 space-y-2 select-none"
          >
            {/* Header: Lead Name, Value, Current Stage */}
            <div className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <h4 className="font-bold text-xs text-slate-900 truncate">{contextMenu.lead.name}</h4>
                <div className="text-[10px] text-slate-500 truncate">{contextMenu.lead.service}</div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-xs text-emerald-600 font-mono">₹{contextMenu.lead.value.toLocaleString()}</span>
                <div className="text-[9px] font-semibold text-slate-400 capitalize">{getStageConfig(contextMenu.lead.stage).label}</div>
              </div>
            </div>

            {/* Move to Stage Header */}
            <div className="px-2 py-0.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                <span>Move to Stage</span>
              </span>
              <span className="text-[9px] font-normal lowercase text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">1-click</span>
            </div>

            {/* List of Stages */}
            <div className="space-y-0.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-0.5">
              {ALL_LEAD_STAGES.map((s) => {
                const isCurrent = contextMenu.lead.stage === s.id;
                const isFirstOutcome = s.id === 'won';

                return (
                  <React.Fragment key={s.id}>
                    {isFirstOutcome && (
                      <div className="pt-1.5 mt-1 border-t border-slate-100 px-2 py-0.5 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Closed / Outcome
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => {
                        const targetLead = contextMenu.lead;
                        setContextMenu(null);
                        handleStageSelectClick(targetLead, s.id);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                        isCurrent
                          ? `${s.badgeClass} border font-bold shadow-2xs opacity-75 cursor-default`
                          : 'hover:bg-slate-100 text-slate-700 font-medium cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${s.dotColor} shrink-0 ring-2 ring-white shadow-2xs`} />
                        <span className="text-xs truncate">{s.label}</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-black/5 text-slate-600">
                          Current
                        </span>
                      ) : (
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 border-t border-slate-100 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  const lead = contextMenu.lead;
                  setContextMenu(null);
                  openConversationForContact({
                    name: lead.name,
                    phone: lead.phone,
                    service: lead.service,
                    location: lead.location,
                  });
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open WhatsApp Chat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const lead = contextMenu.lead;
                  setContextMenu(null);
                  setFollowUpModalLead(lead);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>{contextMenu.lead.stage === 'follow_up' ? 'Edit Follow-up Schedule' : 'Schedule Follow-up'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const lead = contextMenu.lead;
                  setContextMenu(null);
                  handleOpenEditLeadModal(lead);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Edit Lead Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const lead = contextMenu.lead;
                  setContextMenu(null);
                  setSelectedLead(lead);
                  setIsLeadDrawerOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>View Full Details</span>
              </button>

              <div className="pt-1 mt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const lead = contextMenu.lead;
                    setContextMenu(null);
                    handleOpenDeleteModal(lead);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar (Shown when leads are selected) */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
              {selectedLeadIds.length}
            </span>
            <span className="text-xs font-medium text-slate-200">
              {selectedLeadIds.length === 1 ? '1 lead selected' : `${selectedLeadIds.length} leads selected`}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenDeleteSelectedModal}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedLeadIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && leadsToDelete.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {leadsToDelete.length === 1 ? 'Delete Lead' : `Delete ${leadsToDelete.length} Leads`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {leadsToDelete.length === 1
                      ? 'Permanently delete this CRM lead'
                      : `Permanently delete ${leadsToDelete.length} selected leads`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List / Preview of leads being deleted */}
            <div className="space-y-2">
              <p className="text-slate-600 text-xs">
                Are you sure you want to delete the following {leadsToDelete.length === 1 ? 'lead' : 'leads'}? This action cannot be undone. Any linked follow-up schedules will also be removed.
              </p>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2 space-y-1 scrollbar-thin">
                {leadsToDelete.map((ld) => (
                  <div key={ld.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-slate-100 shadow-2xs">
                    <div className="font-semibold text-slate-800 truncate mr-2">
                      {ld.name}
                      <span className="text-[10px] text-slate-400 font-mono ml-2 font-normal">{ld.phone}</span>
                    </div>
                    <span className="text-emerald-700 font-bold shrink-0">₹{ld.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm shadow-rose-700/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Moving to Trash...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{leadsToDelete.length === 1 ? 'Move to Trash' : `Move to Trash (${leadsToDelete.length})`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Instant Undo Toast Banner (Visible after deletion for 10s) */}
      {recentlyDeleted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-white">
              {recentlyDeleted.count === 1
                ? `Moved "${recentlyDeleted.items[0]?.name}" to Trash`
                : `Moved ${recentlyDeleted.count} leads to Trash`}
            </span>
            <span className="text-slate-400 block text-[10px]">Easily restore anytime from Trash</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={handleUndoRecentDelete}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Undo deletion and restore back to pipeline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (recentlyDeleted.timer) clearTimeout(recentlyDeleted.timer);
                setRecentlyDeleted(null);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Empty Trash Confirmation Modal */}
      {isEmptyTrashModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsEmptyTrashModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Empty Trash</h3>
                  <p className="text-[11px] text-slate-500">Permanently purge all deleted leads</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmptyTrashModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 text-xs">
              Are you sure you want to permanently delete all {trashLeads.length} leads in the trash? This action cannot be undone and these leads cannot be restored.
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEmptyTrashModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await emptyLeadsTrash();
                  setIsEmptyTrashModalOpen(false);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm shadow-rose-700/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash Forever</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



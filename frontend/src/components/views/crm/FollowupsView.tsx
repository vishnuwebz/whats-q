import React, { useState, useEffect, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { FollowUp } from '@/types';
import { qiyamApi } from '@/api/qiyamApi';
import {
  PhoneCall, MessageSquare, Mail, Calendar, Clock, CheckCircle2,
  Plus, Search, X, Edit2, Trash2, RotateCcw, FileText, User, AlertCircle,
  LayoutGrid, List, Table, ArrowUpDown, ChevronDown
} from 'lucide-react';
import { ScheduleFollowUpModal } from '@/components/crm/ScheduleFollowUpModal';
import { isDateWithinInterval } from '@/utils/dateFilter';

export const FollowupsView: React.FC = () => {
  const {
    followups,
    leads,
    updateFollowUp,
    deleteFollowUp,
    addToast,
    openConversationForContact,
    globalFilter,
    globalDateInterval,
    targetHighlightId
  } = useQiyamStore();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'due_today' | 'scheduled' | 'overdue' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // View Mode: Cards (Grid), Stacked List, or Enterprise Table
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>(() => {
    try {
      return (localStorage.getItem('whatsq_followups_view_mode') as 'grid' | 'list' | 'table') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleViewModeChange = (mode: 'grid' | 'list' | 'table') => {
    setViewMode(mode);
    try {
      localStorage.setItem('whatsq_followups_view_mode', mode);
    } catch {}
  };

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FollowUp | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FollowUp | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Today's YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Sync fresh follow-ups and leads from backend on mount
  useEffect(() => {
    Promise.allSettled([
      qiyamApi.fetchFollowUps(),
      qiyamApi.fetchLeads(),
    ]).then(([fuRes, leadsRes]) => {
      useQiyamStore.setState((state) => {
        let nextFollowups = state.followups;
        if (fuRes.status === 'fulfilled' && Array.isArray(fuRes.value) && fuRes.value.length > 0) {
          const fresh = fuRes.value as FollowUp[];
          const existingMap = new Map<string, FollowUp>();
          fresh.forEach((f) => existingMap.set(String(f.id), f));
          state.followups.forEach((f) => {
            if (!existingMap.has(String(f.id))) {
              existingMap.set(String(f.id), f);
            }
          });
          nextFollowups = Array.from(existingMap.values());
          try {
            localStorage.setItem('whatsq_followups_cache', JSON.stringify(nextFollowups));
          } catch {}
        }

        let nextLeads = state.leads;
        if (leadsRes.status === 'fulfilled' && Array.isArray(leadsRes.value) && leadsRes.value.length > 0) {
          const freshLeads = leadsRes.value as any[];
          const leadMap = new Map<string, any>();
          freshLeads.forEach((l) => leadMap.set(String(l.id), l));
          state.leads.forEach((l) => {
            if (!leadMap.has(String(l.id))) {
              leadMap.set(String(l.id), l);
            }
          });
          nextLeads = Array.from(leadMap.values());
          try {
            localStorage.setItem('whatsq_leads_cache', JSON.stringify(nextLeads));
          } catch {}
        }

        return { followups: nextFollowups, leads: nextLeads };
      });
    }).catch((e) => console.warn('[FollowupsView] Could not fetch fresh follow-ups/leads:', e));
  }, []);

  // Dynamic effective status calculation
  const getEffectiveStatus = (f: FollowUp): 'due_today' | 'scheduled' | 'overdue' | 'completed' => {
    if (f.status === 'completed') return 'completed';
    if (f.status === 'overdue') return 'overdue';
    if (f.status === 'due_today') return 'due_today';
    if (f.status === 'scheduled') return 'scheduled';

    const dueDate = (f.due_date || '').trim();
    if (!dueDate) return 'scheduled';
    if (dueDate.toLowerCase() === 'today' || dueDate === todayStr) return 'due_today';

    try {
      const dueTime = new Date(dueDate).getTime();
      const todayTime = new Date(todayStr).getTime();
      if (!isNaN(dueTime) && !isNaN(todayTime)) {
        if (dueTime < todayTime) return 'overdue';
        if (dueTime === todayTime) return 'due_today';
        return 'scheduled';
      }
    } catch {}

    return 'scheduled';
  };

  // Accurate Tab Counts based on effective status
  const counts = useMemo(() => {
    return {
      all: followups.length,
      due_today: followups.filter((f) => getEffectiveStatus(f) === 'due_today').length,
      scheduled: followups.filter((f) => getEffectiveStatus(f) === 'scheduled').length,
      overdue: followups.filter((f) => getEffectiveStatus(f) === 'overdue').length,
      completed: followups.filter((f) => getEffectiveStatus(f) === 'completed').length,
    };
  }, [followups, todayStr]);

  // Sorting State with persistence
  const [sortBy, setSortBy] = useState<
    'recently_added' | 'due_date_asc' | 'due_date_desc' | 'priority_high' | 'customer_name_asc' | 'customer_name_desc' | 'oldest_added'
  >(() => {
    try {
      return (localStorage.getItem('whatsq_followups_sort_by') as any) || 'recently_added';
    } catch {
      return 'recently_added';
    }
  });

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    try {
      localStorage.setItem('whatsq_followups_sort_by', newSort);
    } catch {}
  };

  // Filtered & Sorted Cards: Decoupled from stale demo interval, with multi-field search and active sorting
  const filtered = useMemo(() => {
    const list = followups.filter((f) => {
      const effStatus = getEffectiveStatus(f);

      // Date Interval filter
      const fuDate = f.due_date || (f as any).scheduled_date || (f as any).date;
      if (!isDateWithinInterval(fuDate, globalDateInterval)) return false;

      // Status Tab filter
      if (activeTabFilter !== 'all' && effStatus !== activeTabFilter) return false;

      // Global status / priority / assignedTo filters (if active)
      if (globalFilter.status && globalFilter.status !== 'all' && effStatus !== globalFilter.status) return false;
      if (globalFilter.priority && globalFilter.priority !== 'all' && f.priority !== globalFilter.priority) return false;
      if (globalFilter.assignedTo && globalFilter.assignedTo !== 'all' && f.assigned_to !== globalFilter.assignedTo) return false;

      // Search matching across title, customer name, related_to, agent, notes, and raw/digits phone
      const activeSearch = (search || globalFilter.query || '').trim().toLowerCase();
      if (activeSearch) {
        const cleanSearchDigits = activeSearch.replace(/\D/g, '');
        const cleanPhoneDigits = (f.phone || '').replace(/\D/g, '');

        const matchesText =
          (f.customer_name || '').toLowerCase().includes(activeSearch) ||
          (f.title || '').toLowerCase().includes(activeSearch) ||
          (f.related_to || '').toLowerCase().includes(activeSearch) ||
          (f.assigned_to || '').toLowerCase().includes(activeSearch) ||
          (f.notes || '').toLowerCase().includes(activeSearch) ||
          (f.phone || '').toLowerCase().includes(activeSearch);

        const matchesDigits = cleanSearchDigits.length >= 3 && cleanPhoneDigits.includes(cleanSearchDigits);

        if (!matchesText && !matchesDigits) return false;
      }

      return true;
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'recently_added') {
        const numA = Number(a.id) || 0;
        const numB = Number(b.id) || 0;
        if (numA && numB) return numB - numA;
        return String(b.id).localeCompare(String(a.id));
      }
      if (sortBy === 'oldest_added') {
        const numA = Number(a.id) || 0;
        const numB = Number(b.id) || 0;
        if (numA && numB) return numA - numB;
        return String(a.id).localeCompare(String(b.id));
      }
      if (sortBy === 'due_date_asc') {
        const dateA = new Date(a.due_date || '9999-12-31').getTime();
        const dateB = new Date(b.due_date || '9999-12-31').getTime();
        return dateA - dateB;
      }
      if (sortBy === 'due_date_desc') {
        const dateA = new Date(a.due_date || '0000-01-01').getTime();
        const dateB = new Date(b.due_date || '0000-01-01').getTime();
        return dateB - dateA;
      }
      if (sortBy === 'priority_high') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'customer_name_asc') {
        return (a.customer_name || '').localeCompare(b.customer_name || '');
      }
      if (sortBy === 'customer_name_desc') {
        return (b.customer_name || '').localeCompare(a.customer_name || '');
      }
      return 0;
    });
  }, [followups, activeTabFilter, globalFilter, search, todayStr, sortBy, globalDateInterval]);

  // Open Edit Modal
  const handleOpenEdit = (item: FollowUp) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  // Delete Confirm Handler
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteFollowUp(deletingItem.id);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    } catch (err) {
      console.error('[FollowupsView] Error deleting follow-up:', err);
      addToast('Failed to delete follow-up', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Card Action Handler (WhatsApp, Call, Complete / Reopen)
  const handleAction = async (item: FollowUp, action: 'call' | 'whatsapp' | 'complete' | 'reopen') => {
    if (action === 'call') {
      const cleanPhone = (item.phone || '').replace(/\s+/g, '');
      if (!cleanPhone) {
        addToast('No phone number recorded for this follow-up', 'error');
        return;
      }
      addToast(`Calling ${item.customer_name} (${item.phone})...`, 'info');
      window.open(`tel:${cleanPhone}`, '_self');
    } else if (action === 'whatsapp') {
      openConversationForContact({
        name: item.customer_name,
        phone: item.phone,
        service: item.related_to || item.title,
        initialMessage: `👋 Hello *${item.customer_name}*,\nFollowing up regarding *${item.title}* (${item.related_to || 'Service Inquiry'}). How can our team assist you today?`,
        confirmationTitle: 'Send Follow-up Message?',
        confirmationSubtitle: `Confirm before dispatching this follow-up message to ${item.customer_name}.`,
        confirmationBadge: 'CRM FOLLOW-UP',
        confirmationBadgeColor: 'blue',
        confirmationMetadata: [
          { label: 'Follow-up Topic', value: item.title },
          { label: 'Related To', value: item.related_to || 'Service Inquiry' },
          { label: 'Scheduled Due', value: `${item.due_date} at ${item.due_time}` },
          { label: 'Priority', value: item.priority.toUpperCase() },
        ],
      });
    } else if (action === 'complete') {
      await updateFollowUp(item.id, { status: 'completed' });
      addToast(`Follow-up "${item.title}" marked as completed!`, 'success');
    } else if (action === 'reopen') {
      const newStatus = item.due_date === todayStr ? 'due_today' : 'scheduled';
      await updateFollowUp(item.id, { status: newStatus });
      addToast(`Follow-up "${item.title}" reopened!`, 'info');
    }
  };

  // Format date helper for clean card display
  const formatCardDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes(',') || isNaN(Date.parse(dateStr))) return dateStr;
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return dateStr;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Follow-ups"
        subtitle="Manage pending and upcoming customer interactions, calls, and payment reminders."
        primaryActionLabel="Schedule Follow-up"
        onPrimaryAction={() => setIsScheduleModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        {/* Filter Pills Bar & Search */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold scrollbar-none">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTabFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveTabFilter('due_today')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTabFilter === 'due_today'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Due Today ({counts.due_today})
            </button>
            <button
              onClick={() => setActiveTabFilter('scheduled')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTabFilter === 'scheduled'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Scheduled ({counts.scheduled})
            </button>
            <button
              onClick={() => setActiveTabFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTabFilter === 'overdue'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overdue ({counts.overdue})
            </button>
            <button
              onClick={() => setActiveTabFilter('completed')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTabFilter === 'completed'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Completed ({counts.completed})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search follow-ups, name, phone..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Control Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="h-8 pl-8 pr-7 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500 appearance-none shadow-2xs transition-colors"
                title="Sort follow-ups"
              >
                <option value="recently_added">Recently Added (Newest)</option>
                <option value="due_date_asc">Due Date (Urgent / Earliest)</option>
                <option value="due_date_desc">Due Date (Latest First)</option>
                <option value="priority_high">Priority (High to Low)</option>
                <option value="customer_name_asc">Customer Name (A → Z)</option>
                <option value="customer_name_desc">Customer Name (Z → A)</option>
                <option value="oldest_added">Oldest Added First</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Switcher: Cards (Default), List, Table */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Stacked List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Spreadsheet Table View"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              {search ? <Search className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                {search ? `No follow-ups matching "${search}"` : `No ${activeTabFilter.replace('_', ' ')} follow-ups found`}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {search
                  ? 'Try searching with a different term or clearing your query.'
                  : activeTabFilter === 'completed'
                  ? 'Follow-ups marked as done will appear here for record-keeping.'
                  : 'All scheduled customer interactions and reminders will appear here.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule First Follow-up</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Follow-ups Content: Grid (Cards), Stacked List, or Table */}
        {filtered.length > 0 && (
          <>
            {/* 1. Cards / Grid View (Default) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const effStatus = getEffectiveStatus(item);
              const isDueToday = effStatus === 'due_today';
              const isOverdue = effStatus === 'overdue';
              const isCompleted = effStatus === 'completed';
              const isTarget = targetHighlightId === item.id || targetHighlightId === item.customer_name;

              return (
                <div
                  key={item.id}
                  className={`bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                    isTarget
                      ? 'ring-2 ring-amber-400 bg-amber-50/40 border-amber-300'
                      : isCompleted
                      ? 'border-slate-200 bg-slate-50/50 opacity-90'
                      : isOverdue
                      ? 'border-red-200 bg-red-50/10'
                      : isDueToday
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Status & Priority Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : isOverdue
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : isDueToday
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {effStatus.replace('_', ' ').toUpperCase()}
                        </span>

                        {/* Interaction Type Icon */}
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                          {item.follow_up_type === 'whatsapp' && <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />}
                          {item.follow_up_type === 'call' && <PhoneCall className="w-2.5 h-2.5 text-blue-600" />}
                          {item.follow_up_type === 'email' && <Mail className="w-2.5 h-2.5 text-amber-600" />}
                          {item.follow_up_type === 'meeting' && <Calendar className="w-2.5 h-2.5 text-purple-600" />}
                          <span>{item.follow_up_type || 'call'}</span>
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          item.priority === 'high'
                            ? 'text-red-700 bg-red-50 border border-red-100'
                            : item.priority === 'medium'
                            ? 'text-amber-700 bg-amber-50 border border-amber-100'
                            : 'text-slate-600 bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>

                    {/* Follow-up Title & Related Deal */}
                    <h3 className={`font-bold text-sm text-slate-900 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                      {item.title}
                    </h3>
                    {item.related_to && (
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.related_to}</p>
                    )}

                    {/* Metadata Box */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Customer:</span>
                        <span className="font-semibold text-slate-800">{item.customer_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Phone:</span>
                        <a
                          href={`tel:${(item.phone || '').replace(/\s+/g, '')}`}
                          className="font-mono text-emerald-700 hover:underline"
                          title="Click to dial"
                        >
                          {item.phone || '—'}
                        </a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Assigned To:</span>
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.assigned_to || 'Rahul Mehta'}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Due:</span>
                        </span>
                        <span
                          className={`font-bold ${
                            isCompleted
                              ? 'text-slate-500'
                              : isOverdue
                              ? 'text-red-600'
                              : isDueToday
                              ? 'text-emerald-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {formatCardDate(item.due_date)} • {item.due_time || '11:00 AM'}
                        </span>
                      </div>
                    </div>

                    {/* Context Notes */}
                    {item.notes && (
                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 italic">{item.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    {/* WhatsApp Action */}
                    <button
                      onClick={() => handleAction(item, 'whatsapp')}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      title="Open WhatsApp chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Call Action */}
                    <button
                      onClick={() => handleAction(item, 'call')}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                      title={`Call ${item.phone || item.customer_name}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>

                    {/* Complete or Reopen */}
                    {isCompleted ? (
                      <button
                        onClick={() => handleAction(item, 'reopen')}
                        className="py-1.5 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                        title="Reopen Follow-up"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(item, 'complete')}
                        className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold flex items-center justify-center border border-slate-200 transition-all cursor-pointer"
                      title="Edit Follow-up"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setDeletingItem(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center border border-red-100 transition-all cursor-pointer"
                      title="Delete Follow-up"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Stacked List View */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filtered.map((item) => {
              const effStatus = getEffectiveStatus(item);
              const isDueToday = effStatus === 'due_today';
              const isOverdue = effStatus === 'overdue';
              const isCompleted = effStatus === 'completed';
              const isTarget = targetHighlightId === item.id || targetHighlightId === item.customer_name;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isTarget
                      ? 'ring-2 ring-amber-400 bg-amber-50/40 border-amber-300'
                      : isCompleted
                      ? 'border-slate-200 bg-slate-50/40 opacity-85'
                      : isOverdue
                      ? 'border-red-200/90 bg-red-50/10'
                      : isDueToday
                      ? 'border-emerald-200/90 bg-emerald-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Left: Status Badge, Type Icon, Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${
                        isCompleted
                          ? 'bg-purple-50 text-purple-600 border-purple-200'
                          : isOverdue
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : isDueToday
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}
                    >
                      {item.follow_up_type === 'whatsapp' && <MessageSquare className="w-5 h-5 text-emerald-600" />}
                      {item.follow_up_type === 'call' && <PhoneCall className="w-5 h-5 text-blue-600" />}
                      {item.follow_up_type === 'email' && <Mail className="w-5 h-5 text-amber-600" />}
                      {item.follow_up_type === 'meeting' && <Calendar className="w-5 h-5 text-purple-600" />}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : isOverdue
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : isDueToday
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {effStatus.replace('_', ' ').toUpperCase()}
                        </span>

                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            item.priority === 'high'
                              ? 'text-red-700 bg-red-50 border border-red-100'
                              : item.priority === 'medium'
                              ? 'text-amber-700 bg-amber-50 border border-amber-100'
                              : 'text-slate-600 bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {item.priority} Priority
                        </span>

                        <span className="text-[10px] text-slate-400 capitalize font-medium">
                          Via {item.follow_up_type || 'call'}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h4 className={`font-bold text-sm text-slate-900 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {item.title}
                        </h4>
                        {item.related_to && (
                          <span className="text-xs text-slate-500 font-medium">
                            • {item.related_to}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <span>{item.customer_name}</span>
                          <span className="text-slate-300">|</span>
                          <a
                            href={`tel:${(item.phone || '').replace(/\s+/g, '')}`}
                            className="font-mono text-emerald-700 hover:underline font-normal"
                          >
                            {item.phone || '—'}
                          </a>
                        </div>

                        <div className="flex items-center gap-1 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.assigned_to || 'Rahul Mehta'}</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 font-semibold ${
                            isCompleted
                              ? 'text-slate-500'
                              : isOverdue
                              ? 'text-red-600'
                              : isDueToday
                              ? 'text-emerald-700'
                              : 'text-slate-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {formatCardDate(item.due_date)} • {item.due_time || '11:00 AM'}
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1 pt-0.5 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center border-t lg:border-t-0 pt-2 lg:pt-0 w-full lg:w-auto justify-end">
                    <button
                      onClick={() => handleAction(item, 'whatsapp')}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      title="Open WhatsApp chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleAction(item, 'call')}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                      title={`Call ${item.phone || item.customer_name}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>

                    {isCompleted ? (
                      <button
                        onClick={() => handleAction(item, 'reopen')}
                        className="py-1.5 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                        title="Reopen Follow-up"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(item, 'complete')}
                        className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                        title="Mark as Completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      title="Edit Follow-up"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setDeletingItem(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Follow-up"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Structured Data Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Status & Type</th>
                    <th className="py-3 px-4">Follow-up Title</th>
                    <th className="py-3 px-4">Customer & Phone</th>
                    <th className="py-3 px-4">Assigned Agent</th>
                    <th className="py-3 px-4">Due Date & Time</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const effStatus = getEffectiveStatus(item);
                    const isDueToday = effStatus === 'due_today';
                    const isOverdue = effStatus === 'overdue';
                    const isCompleted = effStatus === 'completed';
                    const isTarget = targetHighlightId === item.id || targetHighlightId === item.customer_name;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isTarget
                            ? 'bg-amber-50/60'
                            : isCompleted
                            ? 'bg-slate-50/30 opacity-80'
                            : ''
                        }`}
                      >
                        {/* Status & Type */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                isCompleted
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : isOverdue
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : isDueToday
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {effStatus.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 capitalize">
                              {item.follow_up_type === 'whatsapp' && <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />}
                              {item.follow_up_type === 'call' && <PhoneCall className="w-2.5 h-2.5 text-blue-600" />}
                              {item.follow_up_type === 'email' && <Mail className="w-2.5 h-2.5 text-amber-600" />}
                              {item.follow_up_type === 'meeting' && <Calendar className="w-2.5 h-2.5 text-purple-600" />}
                              <span>{item.follow_up_type || 'call'}</span>
                            </span>
                          </div>
                        </td>

                        {/* Title & Context */}
                        <td className="py-3 px-4 min-w-[180px]">
                          <div className={`font-bold text-slate-900 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                            {item.title}
                          </div>
                          {item.related_to && (
                            <div className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{item.related_to}</div>
                          )}
                        </td>

                        {/* Customer & Phone */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{item.customer_name}</div>
                          <a
                            href={`tel:${(item.phone || '').replace(/\s+/g, '')}`}
                            className="font-mono text-[11px] text-emerald-700 hover:underline"
                          >
                            {item.phone || '—'}
                          </a>
                        </td>

                        {/* Assigned Agent */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.assigned_to || 'Rahul Mehta'}</span>
                          </div>
                        </td>

                        {/* Due Date & Time */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div
                            className={`font-semibold flex items-center gap-1 ${
                              isCompleted
                                ? 'text-slate-500'
                                : isOverdue
                                ? 'text-red-600 font-bold'
                                : isDueToday
                                ? 'text-emerald-700 font-bold'
                                : 'text-slate-800'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{formatCardDate(item.due_date)}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{item.due_time || '11:00 AM'}</div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              item.priority === 'high'
                                ? 'text-red-700 bg-red-50 border border-red-100'
                                : item.priority === 'medium'
                                ? 'text-amber-700 bg-amber-50 border border-amber-100'
                                : 'text-slate-600 bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-4 max-w-[200px]">
                          {item.notes ? (
                            <span className="text-[11px] text-slate-500 italic line-clamp-2" title={item.notes}>
                              {item.notes}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleAction(item, 'whatsapp')}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs"
                              title="Open WhatsApp chat"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            <button
                              onClick={() => handleAction(item, 'call')}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                              title={`Call ${item.phone || item.customer_name}`}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </button>

                            {isCompleted ? (
                              <button
                                onClick={() => handleAction(item, 'reopen')}
                                className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all cursor-pointer"
                                title="Reopen Follow-up"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(item, 'complete')}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                                title="Mark as Completed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                              title="Edit Follow-up"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setDeletingItem(item);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Delete Follow-up"
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
        )}
      </>
    )}
      </div>

      {/* 1. Schedule Follow-up Modal */}
      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      {/* 2. Edit Follow-up Modal */}
      <ScheduleFollowUpModal
        isOpen={isEditModalOpen}
        isEditMode={true}
        initialFollowUp={editingItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* 3. Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Follow-up</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to permanently delete the follow-up{' '}
              <strong className="text-slate-900">"{deletingItem.title}"</strong> for{' '}
              <strong className="text-slate-900">{deletingItem.customer_name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingItem(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Follow-up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

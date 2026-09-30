import React, { useState, useEffect, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { FollowUp } from '@/types';
import { qiyamApi } from '@/api/qiyamApi';
import {
  PhoneCall, MessageSquare, Mail, Calendar, Clock, CheckCircle2,
  Plus, Search, X, Edit2, Trash2, RotateCcw, FileText, User, AlertCircle
} from 'lucide-react';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';

export const FollowupsView: React.FC = () => {
  const {
    followups,
    customers,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp,
    addToast,
    openConversationForContact,
    globalFilter,
    targetHighlightId
  } = useQiyamStore();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'due_today' | 'scheduled' | 'overdue' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FollowUp | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FollowUp | null>(null);

  // Today's YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Form State for Scheduling New Follow-up
  const [formData, setFormData] = useState({
    title: '',
    customer_name: '',
    phone: '',
    related_to: '',
    follow_up_type: 'call' as 'call' | 'whatsapp' | 'email' | 'meeting',
    assigned_to: 'Vikram Patel',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '11:00 AM',
    status: 'due_today' as 'due_today' | 'scheduled' | 'overdue' | 'completed',
    priority: 'high' as 'high' | 'medium' | 'low',
    notes: ''
  });

  // Sync fresh follow-ups from backend on mount
  useEffect(() => {
    qiyamApi
      .fetchFollowUps()
      .then((fresh) => {
        if (Array.isArray(fresh) && fresh.length > 0) {
          useQiyamStore.setState((state) => {
            // Merge backend followups without dropping any locally added ones
            const existingMap = new Map<string, FollowUp>();
            fresh.forEach((f) => existingMap.set(String(f.id), f));
            state.followups.forEach((f) => {
              if (!existingMap.has(String(f.id))) {
                existingMap.set(String(f.id), f);
              }
            });
            const merged = Array.from(existingMap.values());
            return { followups: merged };
          });
        }
      })
      .catch((e) => console.warn('[FollowupsView] Could not fetch fresh follow-ups:', e));
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

  // Filtered Cards: Decoupled from stale demo interval, with multi-field search
  const filtered = useMemo(() => {
    return followups.filter((f) => {
      const effStatus = getEffectiveStatus(f);

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
  }, [followups, activeTabFilter, globalFilter, search, todayStr]);

  // Handle customer quick-picker in modal
  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    if (!custId) return;
    const found = (customers as any[]).find((c) => String(c.id) === String(custId) || c.phone === custId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customer_name: found.name || found.contact_name || '',
        phone: found.phone || found.phone_number || '',
        related_to: prev.related_to || found.service_needed || `Customer #${found.id} - ${found.name || 'Account'}`
      }));
    }
  };

  // Automatically adjust status when due date changes in creation form
  const handleDateChange = (dateVal: string) => {
    let suggestedStatus: 'due_today' | 'scheduled' | 'overdue' = 'scheduled';
    if (dateVal === todayStr) {
      suggestedStatus = 'due_today';
    } else if (dateVal < todayStr) {
      suggestedStatus = 'overdue';
    } else {
      suggestedStatus = 'scheduled';
    }
    setFormData((prev) => ({
      ...prev,
      due_date: dateVal,
      status: suggestedStatus
    }));
  };

  // Create Follow-up Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('Please enter a follow-up title', 'error');
      return;
    }
    if (!formData.customer_name.trim()) {
      addToast('Please enter customer name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addFollowUp({
        ...formData,
        related_to: formData.related_to.trim() || 'General Inquiry'
      });
      setIsScheduleModalOpen(false);
      setFormData({
        title: '',
        customer_name: '',
        phone: '',
        related_to: '',
        follow_up_type: 'call',
        assigned_to: 'Vikram Patel',
        due_date: todayStr,
        due_time: '11:00 AM',
        status: 'due_today',
        priority: 'high',
        notes: ''
      });
    } catch (err: any) {
      console.error('[FollowupsView] Error creating follow-up:', err);
      addToast('Could not save follow-up. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: FollowUp) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.title.trim() || !editingItem.customer_name.trim()) {
      addToast('Title and Customer Name are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateFollowUp(editingItem.id, editingItem);
      addToast(`Follow-up "${editingItem.title}" updated successfully!`, 'success');
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('[FollowupsView] Error updating follow-up:', err);
      addToast('Failed to update follow-up', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Confirm Handler
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      await deleteFollowUp(deletingItem.id);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    } catch (err) {
      console.error('[FollowupsView] Error deleting follow-up:', err);
      addToast('Failed to delete follow-up', 'error');
    } finally {
      setIsSubmitting(false);
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

        {/* Follow-up Cards Grid */}
        {filtered.length > 0 && (
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
      </div>

      {/* 1. Schedule Follow-up Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Schedule New Follow-up</h3>
                <p className="text-xs text-slate-500">Plan customer outreach, calls, or reminders with staff.</p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              {/* Optional Quick Customer Selector */}
              {customers && customers.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Select From Existing Customer Directory (Optional)
                  </label>
                  <select
                    onChange={handleSelectCustomer}
                    defaultValue=""
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="">-- Choose existing customer to auto-fill --</option>
                    {(customers as any[]).map((c) => (
                      <option key={c.id || c.phone} value={c.id || c.phone}>
                        {c.name || c.contact_name} ({c.phone || c.phone_number || 'No Phone'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Follow-up Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call back for quotation confirmation"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Related To / Service / Deal</label>
                  <input
                    type="text"
                    placeholder="e.g. AC Installation - Vikram Mehta DEAL-1024"
                    value={formData.related_to}
                    onChange={(e) => setFormData({ ...formData, related_to: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Kumar"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <CountryPhoneInput
                    value={formData.phone}
                    onChange={(val) => setFormData({ ...formData, phone: val })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Interaction Type</label>
                  <select
                    value={formData.follow_up_type}
                    onChange={(e) => setFormData({ ...formData, follow_up_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="email">Email</option>
                    <option value="meeting">In-Person Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Agent</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="e.g. Vikram Patel, Priya Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Time</label>
                  <input
                    type="text"
                    placeholder="11:30 AM"
                    value={formData.due_time}
                    onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="due_today">Due Today</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Context Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Client requested a follow-up regarding special package pricing..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Follow-up Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Edit Follow-up</h3>
                <p className="text-xs text-slate-500">Update follow-up timing, assignment, or notes.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Follow-up Title *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Related To / Service / Deal</label>
                  <input
                    type="text"
                    value={editingItem.related_to || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, related_to: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.customer_name}
                    onChange={(e) => setEditingItem({ ...editingItem, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <CountryPhoneInput
                    value={editingItem.phone}
                    onChange={(val) => setEditingItem({ ...editingItem, phone: val })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Interaction Type</label>
                  <select
                    value={editingItem.follow_up_type}
                    onChange={(e) => setEditingItem({ ...editingItem, follow_up_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="email">Email</option>
                    <option value="meeting">In-Person Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Agent</label>
                  <input
                    type="text"
                    value={editingItem.assigned_to}
                    onChange={(e) => setEditingItem({ ...editingItem, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingItem.due_date}
                    onChange={(e) => setEditingItem({ ...editingItem, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Time</label>
                  <input
                    type="text"
                    value={editingItem.due_time}
                    onChange={(e) => setEditingItem({ ...editingItem, due_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={editingItem.priority}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="due_today">Due Today</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="overdue">Overdue</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Context Notes</label>
                  <textarea
                    rows={2}
                    value={editingItem.notes}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Follow-up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

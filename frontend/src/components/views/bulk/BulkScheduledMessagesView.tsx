import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Send,
  XCircle,
  Play,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Wallet,
  ChevronRight,
  X,
  Sparkles,
  CheckCheck,
  Trash2,
  Edit3,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkScheduledMessage, BulkContact } from '../../../types';
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const BulkScheduledMessagesView: React.FC = () => {
  const {
    bulkScheduledMessages,
    cancelScheduledMessage,
    sendScheduledMessageNow,
    updateScheduledMessage,
    deleteScheduledMessage,
    checkAndDispatchDueScheduledMessages,
    createScheduledMessage,
    bulkRecipientLists,
    bulkTemplates,
    setActiveTab,
    setDraftCampaign,
    addToast,
  } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<BulkScheduledMessage | null>(
    bulkScheduledMessages[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDispatchingId, setIsDispatchingId] = useState<string | null>(null);

  // Reschedule Modal State
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [messageToReschedule, setMessageToReschedule] = useState<BulkScheduledMessage | null>(null);
  const [newScheduledDateTime, setNewScheduledDateTime] = useState('');

  // Delete Confirmation Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<BulkScheduledMessage | null>(null);

  // Quick Schedule Modal State
  const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickListId, setQuickListId] = useState('');
  const [quickTemplateId, setQuickTemplateId] = useState('');
  const [quickDateTime, setQuickDateTime] = useState('');
  const [quickCategory, setQuickCategory] = useState<'marketing' | 'utility' | 'authentication'>('marketing');

  // Periodic automatic queue check (every 30 seconds)
  useEffect(() => {
    checkAndDispatchDueScheduledMessages();
    const interval = setInterval(() => {
      checkAndDispatchDueScheduledMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, [checkAndDispatchDueScheduledMessages]);

  const filteredMessages = useMemo(() => {
    return bulkScheduledMessages.filter((msg) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        msg.campaignName.toLowerCase().includes(q) ||
        msg.recipientGroupName.toLowerCase().includes(q) ||
        msg.templateName.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || msg.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [bulkScheduledMessages, searchQuery, statusFilter]);

  const totalScheduled = bulkScheduledMessages.filter((m) => m.status === 'QUEUED').length;
  const nextScheduled = bulkScheduledMessages
    .filter((m) => m.status === 'QUEUED')
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())[0];
  const totalEstCost = bulkScheduledMessages
    .filter((m) => m.status === 'QUEUED')
    .reduce((acc, m) => acc + m.estimatedCost, 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getRelativeTime = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMs = target - now;
    if (diffMs <= 0) return 'Past due (Dispatches immediately)';
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `In ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    const diffDays = Math.round(diffHours / 24);
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const handleSendNow = async (id: string, name: string) => {
    setIsDispatchingId(id);
    try {
      const ok = await sendScheduledMessageNow(id);
      if (ok && selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: 'SENT' } : null));
      }
    } finally {
      setIsDispatchingId(null);
    }
  };

  const handleCancel = (id: string, name: string) => {
    cancelScheduledMessage(id);
    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    }
  };

  const openRescheduleModal = (msg: BulkScheduledMessage) => {
    setMessageToReschedule(msg);
    const d = new Date(msg.scheduledFor);
    let defaultTime = '';
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      defaultTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
      defaultTime = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    }
    setNewScheduledDateTime(defaultTime);
    setIsRescheduleOpen(true);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageToReschedule || !newScheduledDateTime) return;

    const isoDate = new Date(newScheduledDateTime).toISOString();
    updateScheduledMessage(messageToReschedule.id, {
      scheduledFor: isoDate,
      scheduledDateTime: newScheduledDateTime,
      status: 'QUEUED',
    });

    if (selectedMessage?.id === messageToReschedule.id) {
      setSelectedMessage((prev) =>
        prev
          ? {
              ...prev,
              scheduledFor: isoDate,
              scheduledDateTime: newScheduledDateTime,
              status: 'QUEUED',
            }
          : null
      );
    }

    setIsRescheduleOpen(false);
    setMessageToReschedule(null);
  };

  const openDeleteModal = (msg: BulkScheduledMessage) => {
    setMessageToDelete(msg);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!messageToDelete) return;
    deleteScheduledMessage(messageToDelete.id);
    if (selectedMessage?.id === messageToDelete.id) {
      setIsDrawerOpen(false);
      setSelectedMessage(null);
    }
    setIsDeleteOpen(false);
    setMessageToDelete(null);
  };

  const handleScheduleNewClick = () => {
    setDraftCampaign({ sendType: 'schedule' });
    setActiveTab('bulk-send');
  };

  const handleOpenQuickSchedule = () => {
    setQuickName(`Broadcast ${new Date().toLocaleDateString('en-GB')}`);
    setQuickListId(bulkRecipientLists[0]?.id || '');
    setQuickTemplateId(bulkTemplates[0]?.id || '');
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(10, 0, 0, 0);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    setQuickDateTime(`${year}-${month}-${day}T10:00`);
    setIsQuickScheduleOpen(true);
  };

  const handleQuickScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) {
      addToast('Please enter a campaign name', 'error');
      return;
    }
    const targetList = bulkRecipientLists.find((l) => l.id === quickListId) || bulkRecipientLists[0];
    const targetTemplate = bulkTemplates.find((t) => t.id === quickTemplateId) || bulkTemplates[0];

    const count = targetList?.contactCount || 100;
    const rate = quickCategory === 'utility' ? 0.3 : quickCategory === 'authentication' ? 0.12 : 0.78;
    const estCost = Number((count * rate).toFixed(2));

    const contacts: BulkContact[] = (targetList?.contactItems || []).map((c) => ({
      ...c,
    }));

    createScheduledMessage({
      campaignName: quickName.trim(),
      recipientGroupId: targetList?.id || 'list-1',
      recipientGroupName: targetList?.name || 'All Contacts',
      recipientCount: count,
      contacts: contacts.length > 0 ? contacts : undefined,
      scheduledFor: new Date(quickDateTime).toISOString(),
      templateName: targetTemplate?.name || 'Offer Announcement',
      templateId: targetTemplate?.id,
      messageText: targetTemplate?.bodyText || targetTemplate?.body || '',
      category: quickCategory,
      estimatedCost: estCost,
    });

    setIsQuickScheduleOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Scheduled Messages
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AUTOMATION QUEUE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Queue automated marketing broadcasts, seasonal offers, and planned reminders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenQuickSchedule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition cursor-pointer shadow-2xs"
              title="Quickly schedule from templates"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Schedule
            </button>

            <button
              onClick={handleScheduleNewClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              + Schedule Campaign
            </button>

            <MetaWalletCard compact={true} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Active Queue</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalScheduled}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-semibold">
              Campaigns pending dispatch
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Next Scheduled Run</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm font-black text-slate-900 mt-1">
              {nextScheduled
                ? new Date(nextScheduled.scheduledFor).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'No pending queue'}
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5 font-semibold flex items-center gap-1">
              <span>{nextScheduled ? nextScheduled.campaignName : 'All clear'}</span>
              {nextScheduled && (
                <span className="text-slate-400 font-normal">
                  ({getRelativeTime(nextScheduled.scheduledFor)})
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Projected Wallet Spend</span>
              <Wallet className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatMoney(totalEstCost)}
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5 font-semibold">
              Estimated Meta broadcast fee
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheduled campaigns, audience, template..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Scheduled Messages Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-800 text-sm">No scheduled campaigns found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Schedule your next broadcast to reach your customers at optimal engagement times.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleScheduleNewClick}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Schedule Your First Campaign
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Recipient Audience</th>
                    <th className="p-4">Scheduled For</th>
                    <th className="p-4">Template</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Est. Cost</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMessages.map((msg) => {
                    const isQueued = msg.status === 'QUEUED';
                    const isSent = msg.status === 'SENT';
                    const isCancelled = msg.status === 'CANCELLED';
                    const isDispatching = isDispatchingId === msg.id;

                    return (
                      <tr key={msg.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{msg.campaignName}</div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {msg.category} Broadcast
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {msg.recipientGroupName}{' '}
                          <span className="text-[10px] text-slate-400">
                            ({msg.recipientCount} contacts)
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">
                            {new Date(msg.scheduledFor).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </div>
                          {isQueued && (
                            <div className="text-[10px] text-emerald-700 font-medium">
                              {getRelativeTime(msg.scheduledFor)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {msg.templateName}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isQueued
                                ? 'bg-amber-100 text-amber-800'
                                : isSent
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {msg.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          {formatMoney(msg.estimatedCost)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isQueued && (
                              <>
                                <button
                                  onClick={() => handleSendNow(msg.id, msg.campaignName)}
                                  disabled={isDispatching}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer disabled:opacity-50"
                                  title="Send Immediately (Real WhatsApp Dispatch)"
                                >
                                  {isDispatching ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-emerald-600" />
                                  )}
                                </button>
                                <button
                                  onClick={() => openRescheduleModal(msg)}
                                  className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                                  title="Reschedule / Change Date"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCancel(msg.id, msg.campaignName)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                  title="Cancel Schedule"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {!isQueued && (
                              <>
                                <button
                                  onClick={() => openRescheduleModal(msg)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                  title="Reschedule & Re-queue"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(msg)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setSelectedMessage(msg);
                                setIsDrawerOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                              title="View Details"
                            >
                              <ChevronRight className="w-4 h-4" />
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
      </div>

      {/* SLIDEOUT DRAWER FOR SCHEDULE DETAILS */}
      {isDrawerOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Scheduled Campaign</h3>
                <p className="text-[10px] text-slate-500">{selectedMessage.campaignName}</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Timing Badge */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-amber-800 font-semibold uppercase flex items-center justify-between">
                    <span>Scheduled Dispatch Date</span>
                    <span className="font-bold text-amber-900">
                      {getRelativeTime(selectedMessage.scheduledFor)}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {new Date(selectedMessage.scheduledFor).toLocaleString('en-IN', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>

              {/* Details table */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Audience Group:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedMessage.recipientGroupName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Recipients:</span>
                  <span className="font-bold text-slate-900">
                    {selectedMessage.recipientCount.toLocaleString()} contacts
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Category:</span>
                  <span className="font-semibold text-slate-900 uppercase">
                    {selectedMessage.category}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Template Name:</span>
                  <span className="font-mono text-slate-900">{selectedMessage.templateName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Status:</span>
                  <span className="font-bold text-slate-800 uppercase">{selectedMessage.status}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                  <span>Estimated Deduction:</span>
                  <span className="font-bold text-emerald-700">
                    {formatMoney(selectedMessage.estimatedCost)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Bubble Preview */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 text-[11px]">Queued Message Preview:</span>
                <div className="bg-[#ECE5DD] p-3 rounded-2xl border border-slate-300">
                  <div className="bg-white rounded-xl shadow-xs p-3 space-y-2 text-slate-800 border border-slate-200/80">
                    <div className="font-semibold text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.messageText ||
                        'Hello Valued Customer, your scheduled special announcement is here! We are excited to share our latest offers with you.'}
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Reply STOP to unsubscribe</span>
                      <span className="text-[9px] font-mono">{selectedMessage.templateName}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400">
                      <span>{selectedMessage.status === 'QUEUED' ? 'Pending Dispatch' : selectedMessage.status}</span>
                      <Clock className="w-3 h-3 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts preview if available */}
              {selectedMessage.contacts && selectedMessage.contacts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">
                      Recipients in Queue ({selectedMessage.contacts.length}):
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Showing up to 10
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase sticky top-0">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedMessage.contacts.slice(0, 10).map((c, i) => (
                          <tr key={i}>
                            <td className="p-2 font-medium text-slate-800">{c.name || 'Customer'}</td>
                            <td className="p-2 font-mono text-slate-600">{c.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              {selectedMessage.status === 'QUEUED' ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCancel(selectedMessage.id, selectedMessage.campaignName)}
                      className="px-3 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      onClick={() => openRescheduleModal(selectedMessage)}
                      className="px-3 py-2 border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Reschedule
                    </button>
                  </div>

                  <button
                    onClick={() => handleSendNow(selectedMessage.id, selectedMessage.campaignName)}
                    disabled={isDispatchingId === selectedMessage.id}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isDispatchingId === selectedMessage.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                    Send Immediately
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => openDeleteModal(selectedMessage)}
                    className="px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                  <button
                    onClick={() => openRescheduleModal(selectedMessage)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-queue Schedule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {isRescheduleOpen && messageToReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reschedule Campaign</h3>
                <p className="text-xs text-slate-500">{messageToReschedule.campaignName}</p>
              </div>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Scheduled Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={newScheduledDateTime}
                  onChange={(e) => setNewScheduledDateTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white"
                  required
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Quick Presets:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 3600000);
                      setNewScheduledDateTime(d.toISOString().slice(0, 16));
                    }}
                    className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium text-[11px] text-center cursor-pointer"
                  >
                    +1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 86400000);
                      d.setHours(10, 0, 0, 0);
                      const year = d.getFullYear();
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setNewScheduledDateTime(`${year}-${month}-${day}T10:00`);
                    }}
                    className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium text-[11px] text-center cursor-pointer"
                  >
                    Tomorrow 10 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 86400000);
                      d.setHours(18, 0, 0, 0);
                      const year = d.getFullYear();
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setNewScheduledDateTime(`${year}-${month}-${day}T18:00`);
                    }}
                    className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium text-[11px] text-center cursor-pointer"
                  >
                    Tomorrow 6 PM
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Scheduled Record</h3>
                <p className="text-xs text-slate-500">Remove from scheduled messages queue</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete the scheduled record for{' '}
              <strong className="text-slate-900">"{messageToDelete.campaignName}"</strong>? This will
              remove it from the queue and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK SCHEDULE MODAL */}
      {isQuickScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Quick Schedule Broadcast</h3>
                  <p className="text-xs text-slate-500">Pick an audience, template, and dispatch time</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickScheduleOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickScheduleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="e.g. Weekend Flash Sale"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={quickListId}
                    onChange={(e) => setQuickListId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    {bulkRecipientLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.contactCount} contacts)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Template</label>
                  <select
                    value={quickTemplateId}
                    onChange={(e) => setQuickTemplateId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    {bulkTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campaign Category</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="marketing">Marketing (₹0.78 / msg)</option>
                    <option value="utility">Utility (₹0.30 / msg)</option>
                    <option value="authentication">Authentication (₹0.12 / msg)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dispatch Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={quickDateTime}
                    onChange={(e) => setQuickDateTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickScheduleOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

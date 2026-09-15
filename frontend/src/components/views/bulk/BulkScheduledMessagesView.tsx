import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkScheduledMessage } from '../../../types';
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const BulkScheduledMessagesView: React.FC = () => {
  const {
    bulkScheduledMessages,
    cancelScheduledMessage,
    sendScheduledMessageNow,
    setActiveTab,
    addToast,
  } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<BulkScheduledMessage | null>(
    bulkScheduledMessages[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredMessages = useMemo(() => {
    return bulkScheduledMessages.filter((msg) => {
      const matchesSearch =
        msg.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.recipientGroupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.templateName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || msg.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [bulkScheduledMessages, searchQuery, statusFilter]);

  const totalScheduled = bulkScheduledMessages.filter((m) => m.status === 'QUEUED').length;
  const nextScheduled = bulkScheduledMessages.find((m) => m.status === 'QUEUED');
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

  const handleSendNow = (id: string, name: string) => {
    sendScheduledMessageNow(id);
    addToast(`Scheduled campaign "${name}" launched immediately!`, 'success');
    if (selectedMessage?.id === id) {
      setIsDrawerOpen(false);
    }
  };

  const handleCancel = (id: string, name: string) => {
    cancelScheduledMessage(id);
    addToast(`Scheduled message "${name}" cancelled.`, 'info');
    if (selectedMessage?.id === id) {
      setIsDrawerOpen(false);
    }
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('bulk-send')}
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
            <div className="text-[10px] text-blue-700 mt-0.5 font-semibold">
              {nextScheduled ? nextScheduled.campaignName : 'All clear'}
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
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-hidden"
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
                      <td className="p-4 font-semibold text-slate-800">
                        {new Date(msg.scheduledFor).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
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
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                title="Send Immediately"
                              >
                                <Play className="w-4 h-4 fill-emerald-600" />
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
                <div>
                  <div className="text-[10px] text-amber-800 font-semibold uppercase">
                    Scheduled Dispatch Date
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
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
                    {selectedMessage.recipientCount.toLocaleString()}
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
                    <div className="font-semibold text-xs text-slate-900 leading-relaxed">
                      Hello Valued Customer, your scheduled special announcement is here! We are
                      excited to share our latest offers with you. Tap below to claim.
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      Reply STOP to unsubscribe
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400">
                      <span>Pending Dispatch</span>
                      <Clock className="w-3 h-3 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {selectedMessage.status === 'QUEUED' ? (
                <>
                  <button
                    onClick={() => handleCancel(selectedMessage.id, selectedMessage.campaignName)}
                    className="px-3.5 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>

                  <button
                    onClick={() => handleSendNow(selectedMessage.id, selectedMessage.campaignName)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Send Immediately
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

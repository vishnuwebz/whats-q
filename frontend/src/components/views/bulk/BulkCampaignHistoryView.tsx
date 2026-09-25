import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Repeat,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ChevronRight,
  X,
  TrendingUp,
  MessageSquare,
  Users,
  Wallet,
  BarChart2,
  ShieldAlert,
  Send,
  CheckCheck,
  Check,
  Loader2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  Info,
  Sparkles,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkCampaign } from '../../../types';

interface QueueInspectionTarget {
  campaign: BulkCampaign;
  recipient?: {
    id?: string;
    name?: string;
    phone: string;
    status: string;
    time?: string;
    errorReason?: string;
  };
}
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const BulkCampaignHistoryView: React.FC = () => {
  const {
    bulkCampaigns,
    fetchBulkCampaigns,
    deleteBulkCampaign,
    retryFailedCampaign,
    duplicateCampaign,
    setActiveTab,
    addToast,
  } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<BulkCampaign | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'preview' | 'recipients' | 'errors'>(
    'overview'
  );

  // Drawer Recipients Filter & Search
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientStatusFilter, setRecipientStatusFilter] = useState('ALL');

  // Deletion Modal State
  const [campaignToDelete, setCampaignToDelete] = useState<BulkCampaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Queue Diagnosis & Inspection Modal State
  const [queueInspection, setQueueInspection] = useState<QueueInspectionTarget | null>(null);

  // Fetch real campaign history from backend on mount
  useEffect(() => {
    setIsLoading(true);
    fetchBulkCampaigns().finally(() => setIsLoading(false));
  }, []);

  // Keep selectedCampaign in sync when bulkCampaigns updates
  useEffect(() => {
    if (selectedCampaign) {
      const updated = bulkCampaigns.find((c) => String(c.id) === String(selectedCampaign.id));
      if (updated) {
        setSelectedCampaign(updated);
      }
    }
  }, [bulkCampaigns]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBulkCampaigns();
      addToast('Campaign history updated from database', 'success');
    } catch {
      addToast('Failed to refresh campaigns', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return bulkCampaigns.filter((camp) => {
      const matchesSearch =
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (camp.audienceListName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (camp.templateName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        camp.status.toLowerCase() === statusFilter.toLowerCase() ||
        (statusFilter === 'running' && camp.status.toLowerCase() === 'sending');
      return matchesSearch && matchesStatus;
    });
  }, [bulkCampaigns, searchQuery, statusFilter]);

  // Aggregate Metrics — all real from DB
  const totalCampaigns = bulkCampaigns.length;
  const totalMessagesSent = bulkCampaigns.reduce((acc, c) => acc + (c.totalRecipients || 0), 0);
  const totalDelivered = bulkCampaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const avgDeliveryRate = totalMessagesSent > 0 ? (totalDelivered / totalMessagesSent) * 100 : 0;
  const totalMetaSpend = bulkCampaigns.reduce((acc, c) => acc + (c.cost || 0), 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRepeatCampaign = (camp: BulkCampaign) => {
    duplicateCampaign(camp.id);
    setActiveTab('bulk-send');
  };

  const handleExportCSV = () => {
    if (filteredCampaigns.length === 0) {
      addToast('No campaigns to export.', 'info');
      return;
    }
    const headers = [
      'Campaign ID',
      'Name',
      'Category',
      'Template',
      'Audience List',
      'Status',
      'Total Recipients',
      'Delivered',
      'Read',
      'Failed',
      'Cost (INR)',
      'Created At',
      'Completed At',
    ];
    const rows = filteredCampaigns.map((c) => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.category || c.type || '').replace(/"/g, '""')}"`,
      `"${(c.templateName || '').replace(/"/g, '""')}"`,
      `"${(c.audienceListName || '').replace(/"/g, '""')}"`,
      c.status,
      c.totalRecipients || 0,
      c.deliveredCount || 0,
      c.readCount || 0,
      c.failedCount || 0,
      c.cost || 0,
      `"${c.createdAt || c.createdOn || ''}"`,
      `"${c.completedOn || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Campaign_History_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Campaign history exported as CSV successfully!', 'success');
  };

  // Export individual campaign recipient log CSV
  const handleExportRecipientLogsCSV = (camp: BulkCampaign) => {
    const list = camp.recipientsList || [];
    if (list.length === 0) {
      addToast('No recipient logs available to export.', 'info');
      return;
    }
    const headers = ['Contact Name', 'Phone Number', 'Delivery Status', 'Error Reason', 'Sent Time'];
    const rows = list.map((r) => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      r.status,
      `"${(r.errorReason || '').replace(/"/g, '""')}"`,
      `"${r.time || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Recipients_${camp.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Recipient dispatch logs exported as CSV successfully!', 'success');
  };

  // Handle Retry Failed Recipients
  const handleRetryFailed = async (camp: BulkCampaign) => {
    setIsRetrying(true);
    try {
      await retryFailedCampaign(camp.id);
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle Delete Confirmation
  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    setIsDeleting(true);
    try {
      const ok = await deleteBulkCampaign(campaignToDelete.id);
      if (ok) {
        if (selectedCampaign?.id === campaignToDelete.id) {
          setIsDrawerOpen(false);
          setSelectedCampaign(null);
        }
        setCampaignToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered recipient logs for drawer tab 3
  const drawerRecipients = useMemo(() => {
    if (!selectedCampaign) return [];
    const list = selectedCampaign.recipientsList || [];
    return list.filter((r) => {
      const matchesSearch =
        (r.name || '').toLowerCase().includes(recipientSearch.toLowerCase()) ||
        (r.phone || '').includes(recipientSearch);
      const matchesStatus =
        recipientStatusFilter === 'ALL' ||
        r.status.toUpperCase() === recipientStatusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [selectedCampaign, recipientSearch, recipientStatusFilter]);

  // Failed recipients list for drawer tab 4
  const drawerFailedRecipients = useMemo(() => {
    if (!selectedCampaign) return [];
    return (selectedCampaign.recipientsList || []).filter(
      (r) => r.status === 'FAILED'
    );
  }, [selectedCampaign]);

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
                  Campaign History
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  REAL AUDIT LOGS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Track real WhatsApp broadcast performance, delivery rates, read rates, and cost analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer disabled:opacity-60"
              title="Refresh campaign statuses from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>

            <button
              onClick={() => setActiveTab('bulk-send')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              + New Campaign
            </button>

            <MetaWalletCard compact={true} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Total Campaigns</span>
              <History className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCampaigns}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-semibold">
              Persisted broadcast logs
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Total Messages Broadcast</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalMessagesSent.toLocaleString()}
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5 font-semibold">
              Recipients reached
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Avg Delivery Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {avgDeliveryRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-semibold">
              {totalDelivered.toLocaleString()} confirmed delivered
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Total Meta Spend</span>
              <Wallet className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatMoney(totalMetaSpend)}
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5 font-semibold">
              Official conversation charges
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by campaign name, audience, template..."
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
              <option value="completed">Completed</option>
              <option value="running">Running / Sending</option>
              <option value="queued">Queued</option>
              <option value="paused">Paused</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Campaign Name</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Template / Message</th>
                  <th className="p-4 text-center">Recipients</th>
                  <th className="p-4">Delivery Rate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Meta Cost</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        <span className="text-sm text-slate-500">Loading campaign history from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Send className="w-7 h-7 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">No campaigns found</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {searchQuery || statusFilter !== 'all'
                              ? 'No campaigns match your search or filter.'
                              : 'Launch your first real WhatsApp broadcast to view delivery performance and recipient logs.'}
                          </p>
                        </div>
                        {!searchQuery && statusFilter === 'all' && (
                          <button
                            onClick={() => setActiveTab('bulk-send')}
                            className="mt-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
                          >
                            + New Campaign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((camp) => {
                    const totalRec = camp.totalRecipients || 0;
                    const deliveredCount = camp.deliveredCount || 0;
                    const readCount = camp.readCount || 0;
                    const failedCount = camp.failedCount || 0;

                    const delRate = totalRec > 0
                      ? ((deliveredCount / totalRec) * 100).toFixed(1)
                      : '0.0';
                    const readRate = totalRec > 0
                      ? ((readCount / totalRec) * 100).toFixed(1)
                      : '0.0';

                    const statusUpper = (camp.status || 'QUEUED').toUpperCase();
                    const isCompleted = statusUpper === 'COMPLETED';
                    const isRunning = statusUpper === 'RUNNING' || statusUpper === 'SENDING';
                    const isQueued = statusUpper === 'QUEUED';
                    const isPaused = statusUpper === 'PAUSED';
                    const isFailed = statusUpper === 'FAILED';

                    return (
                      <tr key={camp.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{camp.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {camp.createdAt
                              ? new Date(camp.createdAt).toLocaleDateString('en-IN', {
                                  dateStyle: 'medium',
                                }) +
                                ' ' +
                                new Date(camp.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : camp.createdOn || '—'}
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {camp.audienceListName || 'Custom Audience'}
                        </td>
                        <td className="p-4">
                          {camp.templateName ? (
                            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {camp.templateName}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              Freeform text message
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center font-semibold text-slate-800">
                          {totalRec.toLocaleString()}
                        </td>
                        <td className="p-4 min-w-[140px]">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="font-bold text-emerald-700">{delRate}%</span>
                            <span className="text-slate-400">({readRate}% read)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${delRate}%` }}
                              className="bg-emerald-500 h-full"
                            ></div>
                            <div
                              style={{ width: `${totalRec > 0 ? (failedCount / totalRec) * 100 : 0}%` }}
                              className="bg-rose-400 h-full"
                            ></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isQueued || isFailed) {
                                setQueueInspection({ campaign: camp });
                              } else {
                                setSelectedCampaign(camp);
                                setIsDrawerOpen(true);
                                setDrawerTab('overview');
                              }
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition hover:opacity-85 ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isRunning
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : isQueued
                                ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:ring-2 hover:ring-amber-300'
                                : isPaused
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200 hover:ring-2 hover:ring-rose-300'
                            }`}
                            title={isQueued ? "Click to view why queued, reason and solution" : isFailed ? "Click to view error reason and retry" : undefined}
                          >
                            {isRunning && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                            {isQueued && <Clock className="w-2.5 h-2.5 text-amber-600" />}
                            <span>{statusUpper}</span>
                            {(isQueued || isFailed) && <HelpCircle className="w-2.5 h-2.5 opacity-70 ml-0.5" />}
                          </button>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          {formatMoney(camp.cost || 0)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedCampaign(camp);
                                setIsDrawerOpen(true);
                                setDrawerTab('overview');
                                setRecipientSearch('');
                                setRecipientStatusFilter('ALL');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                              title="View Full Audit Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRepeatCampaign(camp)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                              title="Repeat Campaign"
                            >
                              <Repeat className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCampaignToDelete(camp)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SLIDEOUT 4-TAB DETAILS DRAWER */}
      {isDrawerOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{selectedCampaign.name}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {selectedCampaign.category || selectedCampaign.type || 'Marketing'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  ID: {selectedCampaign.id} • Created{' '}
                  {selectedCampaign.createdAt
                    ? new Date(selectedCampaign.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : selectedCampaign.createdOn}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Tabs */}
            <div className="flex border-b border-slate-200 px-4 pt-2 bg-slate-50 gap-2 text-xs font-semibold">
              <button
                onClick={() => setDrawerTab('overview')}
                className={`pb-2 px-2.5 border-b-2 transition cursor-pointer ${
                  drawerTab === 'overview'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDrawerTab('preview')}
                className={`pb-2 px-2.5 border-b-2 transition cursor-pointer ${
                  drawerTab === 'preview'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Message
              </button>
              <button
                onClick={() => setDrawerTab('recipients')}
                className={`pb-2 px-2.5 border-b-2 transition cursor-pointer ${
                  drawerTab === 'recipients'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Recipients Log ({selectedCampaign.totalRecipients || (selectedCampaign.recipientsList || []).length})
              </button>
              <button
                onClick={() => setDrawerTab('errors')}
                className={`pb-2 px-2.5 border-b-2 transition cursor-pointer ${
                  drawerTab === 'errors'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Errors ({selectedCampaign.failedCount || drawerFailedRecipients.length})
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* TAB 1: OVERVIEW */}
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 uppercase font-semibold">
                        Delivered
                      </span>
                      <div className="text-xl font-black text-emerald-950 mt-0.5">
                        {(selectedCampaign.deliveredCount || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {selectedCampaign.totalRecipients > 0
                          ? ((selectedCampaign.deliveredCount / selectedCampaign.totalRecipients) * 100).toFixed(1)
                          : '0.0'}
                        % delivery rate
                      </span>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-blue-800 uppercase font-semibold">Read</span>
                      <div className="text-xl font-black text-blue-950 mt-0.5">
                        {(selectedCampaign.readCount || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-blue-700 font-semibold">
                        {selectedCampaign.totalRecipients > 0
                          ? ((selectedCampaign.readCount / selectedCampaign.totalRecipients) * 100).toFixed(1)
                          : '0.0'}
                        % open rate
                      </span>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <span className="text-[10px] text-purple-800 uppercase font-semibold">
                        Replies
                      </span>
                      <div className="text-xl font-black text-purple-950 mt-0.5">
                        {(selectedCampaign.repliedCount || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-purple-700 font-semibold">
                        {selectedCampaign.totalRecipients > 0
                          ? ((selectedCampaign.repliedCount / selectedCampaign.totalRecipients) * 100).toFixed(1)
                          : '0.0'}
                        % response rate
                      </span>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-[10px] text-rose-800 uppercase font-semibold">
                        Failed
                      </span>
                      <div className="text-xl font-black text-rose-950 mt-0.5">
                        {selectedCampaign.failedCount || 0}
                      </div>
                      <span className="text-[10px] text-rose-700 font-semibold">
                        Non-WhatsApp / DND / Network
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Audience Group:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCampaign.audienceListName || 'Custom Recipients'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Template Used:</span>
                      <span className="font-mono text-slate-800">
                        {selectedCampaign.templateName || 'None (Freeform Text)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Meta Wallet Charged:</span>
                      <span className="font-bold text-slate-900">
                        {formatMoney(selectedCampaign.cost || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Campaign Status:</span>
                      <button
                        type="button"
                        onClick={() => setQueueInspection({ campaign: selectedCampaign })}
                        className="font-bold text-slate-900 inline-flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition"
                        title="Click to view queue reason & solution"
                      >
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedCampaign.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedCampaign.status === 'RUNNING'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedCampaign.status === 'QUEUED'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {selectedCampaign.status}
                        </span>
                        {(selectedCampaign.status === 'QUEUED' || selectedCampaign.status === 'FAILED') && (
                          <span className="text-[10px] text-amber-700 underline font-normal">
                            Diagnose & Solve →
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Launched By:</span>
                      <span className="font-semibold text-slate-700">
                        {selectedCampaign.createdBy || 'Admin'}
                      </span>
                    </div>
                    {selectedCampaign.completedOn && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Completed On:</span>
                        <span className="font-semibold text-slate-700">
                          {selectedCampaign.completedOn}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MESSAGE PREVIEW */}
              {drawerTab === 'preview' && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-800 text-[11px]">
                    Dispatched Message Bubble:
                  </span>
                  <div className="bg-[#ECE5DD] p-4 rounded-2xl border border-slate-300">
                    <div className="bg-white rounded-xl shadow-xs p-3.5 space-y-2 text-slate-800 border border-slate-200/80">
                      <div className="font-normal text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
                        {selectedCampaign.messageText ||
                          (selectedCampaign.templateName
                            ? `[WhatsApp Template: ${selectedCampaign.templateName}]`
                            : selectedCampaign.description || 'No message text available')}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>
                          {selectedCampaign.createdAt
                            ? new Date(selectedCampaign.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '10:45 AM'}
                        </span>
                        {selectedCampaign.status === 'COMPLETED' || (selectedCampaign.deliveredCount || 0) > 0 ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        ) : selectedCampaign.status === 'QUEUED' ? (
                          <Clock className="w-3 h-3 text-slate-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="text-slate-500">
                      <strong>Template Name:</strong> {selectedCampaign.templateName || 'None (Direct Text)'}
                    </div>
                    <div className="text-slate-500">
                      <strong>Category:</strong> {selectedCampaign.category || selectedCampaign.type || 'Marketing'}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RECIPIENTS LOG */}
              {drawerTab === 'recipients' && (
                <div className="space-y-3">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        placeholder="Search contact or phone..."
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <select
                        value={recipientStatusFilter}
                        onChange={(e) => setRecipientStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                      >
                        <option value="ALL">All Status</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="READ">Read</option>
                        <option value="SENT">Sent</option>
                        <option value="QUEUED">Queued</option>
                        <option value="FAILED">Failed</option>
                      </select>

                      <button
                        onClick={() => handleExportRecipientLogsCSV(selectedCampaign)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        title="Export this campaign's recipient logs"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                        CSV
                      </button>
                    </div>
                  </div>

                  {/* Queue Alert Banner */}
                  {drawerRecipients.some((r) => r.status === 'QUEUED') && (
                    <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-amber-950">Messages in Queue Detected</div>
                          <div className="text-[11px] text-amber-800">
                            Click any <strong className="bg-amber-200/70 px-1 rounded text-amber-950">QUEUED</strong> badge below to view why it's held and trigger 1-click re-dispatch.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRetryFailed(selectedCampaign)}
                        disabled={isRetrying}
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shrink-0 transition inline-flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isRetrying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Repeat className="w-3.5 h-3.5" />}
                        <span>Re-dispatch Queue</span>
                      </button>
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Phone</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {drawerRecipients.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-400">
                              {(selectedCampaign.recipientsList || []).length === 0
                                ? 'No individual recipient logs recorded for this campaign.'
                                : 'No recipients match the current filter.'}
                            </td>
                          </tr>
                        ) : (
                          drawerRecipients.map((rec, i) => (
                            <tr key={rec.id || i} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-medium text-slate-800">
                                {rec.name || 'WhatsApp User'}
                              </td>
                              <td className="p-2.5 text-slate-500 font-mono text-[10px]">
                                {rec.phone}
                              </td>
                              <td className="p-2.5">
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setQueueInspection({ campaign: selectedCampaign, recipient: rec })}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold w-fit cursor-pointer transition hover:opacity-85 ${
                                      rec.status === 'READ'
                                        ? 'bg-blue-100 text-blue-800'
                                        : rec.status === 'DELIVERED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : rec.status === 'SENT'
                                        ? 'bg-cyan-100 text-cyan-800'
                                        : rec.status === 'QUEUED'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:ring-2 hover:ring-amber-300 shadow-2xs'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300 hover:ring-2 hover:ring-rose-300 shadow-2xs'
                                    }`}
                                    title={rec.status === 'QUEUED' ? "Click to view why queued, reason and solution" : rec.status === 'FAILED' ? "Click to view failure details and solution" : "Click to view status report"}
                                  >
                                    <span>{rec.status}</span>
                                    {rec.status === 'QUEUED' && <HelpCircle className="w-2.5 h-2.5 text-amber-700" />}
                                    {rec.status === 'FAILED' && <AlertCircle className="w-2.5 h-2.5 text-rose-700" />}
                                  </button>
                                  {rec.status === 'FAILED' && rec.errorReason && (
                                    <span className="text-[10px] text-rose-600 font-normal leading-tight max-w-[220px] truncate" title={rec.errorReason}>
                                      {rec.errorReason}
                                    </span>
                                  )}
                                  {rec.status === 'QUEUED' && (
                                    <span
                                      className="text-[9px] text-amber-700 font-medium cursor-pointer hover:underline inline-flex items-center gap-0.5"
                                      onClick={() => setQueueInspection({ campaign: selectedCampaign, recipient: rec })}
                                    >
                                      <span>Why queued? Click for solution</span>
                                      <span>→</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2.5 text-right text-slate-400 font-mono text-[10px]">
                                {rec.time || '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ERRORS */}
              {drawerTab === 'errors' && (
                <div className="space-y-4">
                  {drawerFailedRecipients.length === 0 && (selectedCampaign.failedCount || 0) === 0 ? (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-emerald-900 text-sm">100% Deliverability</h4>
                      <p className="text-xs text-emerald-700">
                        Zero delivery failures were recorded for this broadcast. All recipients were reached successfully!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] leading-relaxed flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>
                              {selectedCampaign.failedCount || drawerFailedRecipients.length} messages
                            </strong>{' '}
                            failed to deliver due to invalid WhatsApp numbers, DND opt-outs, or network failures.
                          </div>
                        </div>

                        <button
                          onClick={() => handleRetryFailed(selectedCampaign)}
                          disabled={isRetrying}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isRetrying ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Repeat className="w-3.5 h-3.5" />
                          )}
                          Retry Failed
                        </button>
                      </div>

                      {drawerFailedRecipients.length > 0 ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Contact</th>
                                <th className="p-2.5">Phone</th>
                                <th className="p-2.5">Error Reason</th>
                                <th className="p-2.5 text-right">Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {drawerFailedRecipients.map((rec, i) => (
                                <tr key={rec.id || i} className="hover:bg-rose-50/40">
                                  <td className="p-2.5 font-medium text-slate-800">
                                    {rec.name || 'Unknown Contact'}
                                  </td>
                                  <td className="p-2.5 text-slate-500 font-mono text-[10px]">
                                    {rec.phone}
                                  </td>
                                  <td className="p-2.5 text-rose-700 font-medium">
                                    {rec.errorReason || 'Number not registered on WhatsApp or unreachable'}
                                  </td>
                                  <td className="p-2.5 text-right text-slate-400 font-mono text-[10px]">
                                    {rec.time || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                          {selectedCampaign.failedCount} failures reported by gateway. Individual failed contact logs not available.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setCampaignToDelete(selectedCampaign)}
                className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Campaign
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRepeatCampaign(selectedCampaign)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  Repeat Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {campaignToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Campaign Audit Record?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <strong>"{campaignToDelete.name}"</strong>? This will permanently remove its dispatch logs, delivery metrics, and audit history from the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setCampaignToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCampaign}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUEUE STATUS & DIAGNOSTIC INSPECTION MODAL */}
      {queueInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Queue Diagnostic Report
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      QUEUED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Campaign: <span className="font-semibold text-slate-700">{queueInspection.campaign.name}</span> (#{queueInspection.campaign.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQueueInspection(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Snapshot */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 grid grid-cols-2 gap-2.5 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact / Recipient</span>
                  <span className="font-bold text-slate-800">
                    {queueInspection.recipient?.name || 'All Queued Recipients'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone Number</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {queueInspection.recipient?.phone || queueInspection.campaign.audienceListName || 'Audience Group'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Template Name</span>
                  <span className="font-mono text-slate-800 truncate block">
                    {queueInspection.campaign.templateName || 'None (Freeform)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current State</span>
                  <span className="font-bold text-amber-700">
                    {queueInspection.recipient?.status || queueInspection.campaign.status}
                  </span>
                </div>
              </div>

              {/* 1. Why it's been queued */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Why is this message in "QUEUED" status?</span>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950 text-[11px] leading-relaxed">
                  WhatsApp and Meta Cloud API enforce strict anti-spam rate limits. Dispatches are placed in a controlled queue so a background worker can send each contact sequentially with anti-ban jitter delays.
                </div>
              </div>

              {/* 2. What's the reason */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>What is the exact reason it is still queued?</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-700">
                  {queueInspection.campaign.status === 'RUNNING' ? (
                    <div className="flex items-start gap-2 text-blue-900">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
                      <div>
                        <strong>Worker Actively Processing:</strong> This campaign is currently running. This recipient is waiting in line and will be dispatched as soon as previous contacts finish.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2 text-slate-900">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Worker Cycle Halted Before Completion:</strong> The campaign finished its initial run, but this recipient was not delivered.
                        </div>
                      </div>
                      <div className="pl-6 text-slate-600 space-y-1">
                        <p>This happened because:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                          <li>
                            <strong>Template Parameters:</strong> Meta templates with multiple dynamic variables require an exact parameter list for all placeholders ({`{{1}}`}, {`{{2}}`}, etc.).
                          </li>
                          <li>
                            <strong>Worker Interruption:</strong> The background dispatch worker encountered a mismatch or was interrupted before processing this queue item.
                          </li>
                        </ul>
                        {queueInspection.recipient?.errorReason && (
                          <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-mono text-[10px]">
                            Gateway Error: {queueInspection.recipient.errorReason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. What's the solution */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>What is the solution?</span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-[11px] text-emerald-950">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>1. Click "Retry & Dispatch Now" Below:</strong>
                      <p className="text-emerald-800 mt-0.5">
                        Our upgraded backend worker automatically formats all template variables and auto-retries matching language codes (en / en_US). Clicking the button below will immediately re-dispatch the queued contacts!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>2. Meta WhatsApp Cloud API Ready:</strong>
                      <p className="text-emerald-800 mt-0.5">
                        Ensure your WhatsApp business account is connected under <strong>Settings</strong> with sufficient conversation wallet credits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setQueueInspection(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={async () => {
                  if (!queueInspection) return;
                  setIsRetrying(true);
                  try {
                    const success = await retryFailedCampaign(queueInspection.campaign.id);
                    if (success) {
                      addToast(`Re-dispatched campaign "${queueInspection.campaign.name}"! Logs will update live.`, 'success');
                      setQueueInspection(null);
                    }
                  } catch (err: any) {
                    addToast(err?.message || 'Failed to dispatch retry', 'error');
                  } finally {
                    setIsRetrying(false);
                  }
                }}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isRetrying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
                <span>Retry & Dispatch Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

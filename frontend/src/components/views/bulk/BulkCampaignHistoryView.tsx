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
  ShieldCheck,
  ExternalLink,
  FileText,
  Smartphone,
  Phone,
  Copy,
  Zap,
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
    bulkTemplates,
    templates,
    setSelectedTemplateId,
    metaConfig,
    fetchBulkCampaigns,
    deleteBulkCampaign,
    retryFailedCampaign,
    duplicateCampaign,
    conversations,
    setSelectedConversationId,
    setActiveTab,
    addToast,
  } = useQiyamStore();

  // Live Template Preview Modal Target
  const [previewTemplateTarget, setPreviewTemplateTarget] = useState<{
    templateName: string;
    campaign?: BulkCampaign;
  } | null>(null);

  // Meta WhatsApp Manager URL generator
  const getMetaManagerUrl = (templateName?: string) => {
    const businessId = '1029836994795053';
    const assetId = metaConfig?.waba_id || '4567067243541240';
    if (templateName) {
      const filters = encodeURIComponent(
        JSON.stringify({
          date_range: 7,
          language: [],
          quality: [],
          search_text: templateName,
          sort_direction: 'descending',
          sort_key: 'lastUpdatedTime',
          status: ['APPROVED', 'IN_APPEAL', 'PAUSED', 'PENDING', 'REJECTED'],
          tag: [],
        })
      );
      return `https://business.facebook.com/latest/whatsapp_manager/message_templates?business_id=${businessId}&asset_id=${assetId}&tab=message-templates&childRoute=templates&filters=${filters}&nav_ref=whatsapp_manager`;
    }
    return `https://business.facebook.com/latest/whatsapp_manager/message_templates?business_id=${businessId}&asset_id=${assetId}&tab=message-templates&childRoute=templates&nav_ref=whatsapp_manager`;
  };

  const handleOpenInInbox = (phone?: string) => {
    if (!phone) {
      setActiveTab('conversations');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const conv = (conversations || []).find((c) => {
      const cPhone = (c.phone_number || '').replace(/[^0-9]/g, '');
      return cleanPhone.length >= 7 && (cPhone.includes(cleanPhone) || cleanPhone.includes(cPhone));
    });
    if (conv) {
      setSelectedConversationId(conv.id);
    }
    setQueueInspection(null);
    setActiveTab('conversations');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<BulkCampaign | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(bulkCampaigns.length === 0);
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

  // Fetch real campaign history from backend on mount (non-blocking if cached)
  useEffect(() => {
    if (bulkCampaigns.length === 0) {
      setIsLoading(true);
    }
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
                {isLoading && bulkCampaigns.length === 0 ? (
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
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplateTarget({ templateName: camp.templateName, campaign: camp });
                              }}
                              className="font-mono text-[11px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 group"
                              title={`Click to preview template "${camp.templateName}"`}
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                              <span className="font-bold underline decoration-emerald-300 underline-offset-2">{camp.templateName}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplateTarget({ templateName: '', campaign: camp });
                              }}
                              className="text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 italic cursor-pointer flex items-center gap-1.5 transition"
                              title="Click to view message preview"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                              <span>Freeform text message</span>
                            </button>
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
                      {selectedCampaign.templateName ? (
                        <button
                          type="button"
                          onClick={() => setPreviewTemplateTarget({ templateName: selectedCampaign.templateName, campaign: selectedCampaign })}
                          className="font-mono text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 px-2 py-0.5 rounded border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition"
                          title="Click to preview template"
                        >
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>{selectedCampaign.templateName}</span>
                        </button>
                      ) : (
                        <span className="font-mono text-slate-800 text-xs">None (Freeform Text)</span>
                      )}
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

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                    <div className="text-slate-500">
                      <strong>Template Name:</strong> {selectedCampaign.templateName || 'None (Direct Text)'}
                    </div>
                    <div className="text-slate-500">
                      <strong>Category:</strong> {selectedCampaign.category || selectedCampaign.type || 'Marketing'}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewTemplateTarget({ templateName: selectedCampaign.templateName, campaign: selectedCampaign })}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer mt-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Open Full Smartphone Preview</span>
                    </button>
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
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200 hover:ring-2 hover:ring-blue-300'
                                        : rec.status === 'DELIVERED'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:ring-2 hover:ring-emerald-300'
                                        : rec.status === 'SENT'
                                        ? 'bg-cyan-100 text-cyan-800 border border-cyan-200 hover:ring-2 hover:ring-cyan-300'
                                        : rec.status === 'QUEUED'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:ring-2 hover:ring-amber-300 shadow-2xs'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300 hover:ring-2 hover:ring-rose-300 shadow-2xs'
                                    }`}
                                    title={
                                      rec.status === 'DELIVERED'
                                        ? 'Click to view delivery receipt & handset confirmation'
                                        : rec.status === 'READ'
                                        ? 'Click to view customer read confirmation & audit'
                                        : rec.status === 'SENT'
                                        ? 'Click to view Meta network transit report'
                                        : rec.status === 'QUEUED'
                                        ? 'Click to view why queued, reason and solution'
                                        : 'Click to view failure details, reason and solution'
                                    }
                                  >
                                    <span>{rec.status}</span>
                                    {rec.status === 'DELIVERED' && <CheckCheck className="w-2.5 h-2.5 text-emerald-700" />}
                                    {rec.status === 'READ' && <CheckCheck className="w-2.5 h-2.5 text-blue-700" />}
                                    {rec.status === 'SENT' && <Check className="w-2.5 h-2.5 text-cyan-700" />}
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
                                      <span>Why queued? Click for reason</span>
                                      <span>→</span>
                                    </span>
                                  )}
                                  {rec.status === 'DELIVERED' && (
                                    <span
                                      className="text-[9px] text-emerald-700 font-medium cursor-pointer hover:underline inline-flex items-center gap-0.5"
                                      onClick={() => setQueueInspection({ campaign: selectedCampaign, recipient: rec })}
                                    >
                                      <span>Delivery confirmed</span>
                                      <span>→</span>
                                    </span>
                                  )}
                                  {rec.status === 'READ' && (
                                    <span
                                      className="text-[9px] text-blue-700 font-medium cursor-pointer hover:underline inline-flex items-center gap-0.5"
                                      onClick={() => setQueueInspection({ campaign: selectedCampaign, recipient: rec })}
                                    >
                                      <span>Read by customer</span>
                                      <span>→</span>
                                    </span>
                                  )}
                                  {rec.status === 'SENT' && (
                                    <span
                                      className="text-[9px] text-cyan-700 font-medium cursor-pointer hover:underline inline-flex items-center gap-0.5"
                                      onClick={() => setQueueInspection({ campaign: selectedCampaign, recipient: rec })}
                                    >
                                      <span>In transit</span>
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

      {/* STATUS DIAGNOSTIC & AUDIT INSPECTION MODAL */}
      {queueInspection && (() => {
        const rawStatus = (queueInspection.recipient?.status || queueInspection.campaign.status || 'QUEUED').toUpperCase();
        const isDelivered = rawStatus === 'DELIVERED';
        const isRead = rawStatus === 'READ';
        const isSent = rawStatus === 'SENT';
        const isQueued = rawStatus === 'QUEUED';
        const isFailed = rawStatus === 'FAILED' || rawStatus === 'ERROR';

        const title = isDelivered
          ? 'Delivery Confirmation & Handset Audit'
          : isRead
          ? 'Read Receipt & Engagement Audit'
          : isSent
          ? 'Meta Dispatch & Network Transit Report'
          : isQueued
          ? 'Queue Diagnostic & Scheduling Report'
          : 'Message Failure & Error Diagnostic';

        const subtitle = isDelivered
          ? 'Confirmed received on customer device via Meta Cloud API webhook'
          : isRead
          ? 'Customer opened and read this broadcast message (Blue Tick verified)'
          : isSent
          ? 'Accepted by Meta Graph API and traversing WhatsApp global transit network'
          : isQueued
          ? 'Held safely in outbound queue with anti-ban rate limiting'
          : 'Meta Cloud API rejected delivery attempt or number unreachable';

        const headerBg = isDelivered
          ? 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200'
          : isRead
          ? 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-200'
          : isSent
          ? 'from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-200'
          : isQueued
          ? 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-200'
          : 'from-rose-500/10 via-rose-500/5 to-transparent border-rose-200';

        const iconBg = isDelivered
          ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
          : isRead
          ? 'bg-blue-100 border-blue-300 text-blue-700'
          : isSent
          ? 'bg-cyan-100 border-cyan-300 text-cyan-700'
          : isQueued
          ? 'bg-amber-100 border-amber-300 text-amber-700'
          : 'bg-rose-100 border-rose-300 text-rose-700';

        const badgeClass = isDelivered
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : isRead
          ? 'bg-blue-100 text-blue-800 border-blue-300'
          : isSent
          ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
          : isQueued
          ? 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-rose-100 text-rose-800 border-rose-300';

        const StatusIcon = isDelivered
          ? CheckCheck
          : isRead
          ? CheckCheck
          : isSent
          ? Check
          : isQueued
          ? Clock
          : AlertCircle;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className={`px-5 py-4 bg-gradient-to-r ${headerBg} border-b flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {rawStatus}
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
                      {queueInspection.recipient?.name || 'All Target Recipients'}
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
                    <span className={`font-bold ${isDelivered ? 'text-emerald-700' : isRead ? 'text-blue-700' : isSent ? 'text-cyan-700' : isQueued ? 'text-amber-700' : 'text-rose-700'}`}>
                      {rawStatus}
                    </span>
                  </div>
                </div>

                {/* 1. What does this status mean? */}
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDelivered ? 'bg-emerald-100 text-emerald-800' : isRead ? 'bg-blue-100 text-blue-800' : isSent ? 'bg-cyan-100 text-cyan-800' : isQueued ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>1</span>
                    <span>
                      {isDelivered && 'What does "DELIVERED" status mean?'}
                      {isRead && 'What does "READ" status mean?'}
                      {isSent && 'What does "SENT" status mean?'}
                      {isQueued && 'Why is this message in "QUEUED" status?'}
                      {isFailed && 'Why did this message fail to send?'}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                    isDelivered
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : isRead
                      ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                      : isSent
                      ? 'bg-cyan-50/70 border-cyan-200 text-cyan-950'
                      : isQueued
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}>
                    {isDelivered && (
                      <p>
                        The message was successfully transmitted through Meta WhatsApp Cloud API and confirmed received on the recipient's phone/handset. WhatsApp acknowledged reception with a <strong>Double Grey Tick (✓✓)</strong> delivery receipt sent back to our server.
                      </p>
                    )}
                    {isRead && (
                      <p>
                        The customer has opened and viewed this WhatsApp message on their device. Meta Cloud API delivered a real-time <strong>Blue Double Tick (✓✓)</strong> read receipt confirmation webhook.
                      </p>
                    )}
                    {isSent && (
                      <p>
                        The message was validated, accepted, and dispatched by Meta Cloud API servers (<strong>Single Tick ✓</strong>). It has left QBS-360's servers and is traversing WhatsApp's worldwide delivery network.
                      </p>
                    )}
                    {isQueued && (
                      <p>
                        WhatsApp and Meta Cloud API enforce strict anti-spam rate limits. Dispatches are placed in a controlled queue so a background worker can send each contact sequentially with anti-ban jitter delays.
                      </p>
                    )}
                    {isFailed && (
                      <div className="space-y-1.5">
                        <p>
                          Meta WhatsApp Cloud API or the cellular gateway rejected the delivery attempt.
                        </p>
                        {queueInspection.recipient?.errorReason && (
                          <div className="p-2 bg-rose-100 border border-rose-300 rounded-lg text-rose-900 font-mono text-[10px]">
                            <strong>Meta Error:</strong> {queueInspection.recipient.errorReason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Detailed Breakdown / Root Cause */}
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>
                      {isDelivered && 'Meta Cloud Delivery Pipeline Details'}
                      {isRead && 'Customer Engagement Insights'}
                      {isSent && 'Why is it in transit / not delivered yet?'}
                      {isQueued && 'What is the exact reason it is still queued?'}
                      {isFailed && 'Diagnosed Root Cause'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-700">
                    {isDelivered && (
                      <ul className="space-y-1.5 text-slate-600">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Handset Delivery Confirmed:</strong> Recipient's phone was online and WhatsApp background service received the full template payload without drops.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Meta WABA Sender:</strong> Dispatched from registered WABA (+91 94963 00233).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Encryption & Compliance:</strong> End-to-end encrypted via official WhatsApp Cloud API protocol.</span>
                        </li>
                        {queueInspection.recipient?.time && (
                          <li className="flex items-start gap-1.5 font-mono text-[10px] text-slate-500">
                            <span>• Delivery Timestamp: {queueInspection.recipient.time}</span>
                          </li>
                        )}
                      </ul>
                    )}
                    {isRead && (
                      <ul className="space-y-1.5 text-slate-600">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span><strong>High Engagement:</strong> Customer physically tapped into the chat thread and reviewed the message.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span><strong>Interactive Buttons:</strong> Template CTAs (Visit Website, Quick Reply, Call) are rendered on the customer screen.</span>
                        </li>
                        {queueInspection.recipient?.time && (
                          <li className="flex items-start gap-1.5 font-mono text-[10px] text-slate-500">
                            <span>• Read Timestamp: {queueInspection.recipient.time}</span>
                          </li>
                        )}
                      </ul>
                    )}
                    {isSent && (
                      <ul className="space-y-1.5 text-slate-600">
                        <li className="flex items-start gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span><strong>Recipient Temporarily Offline:</strong> The customer's device is currently switched off, in flight mode, or out of data coverage.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span><strong>Automated Meta Retry:</strong> WhatsApp servers hold the message in queue and will deliver it the second the handset reconnects to the network (retained for up to 30 days).</span>
                        </li>
                      </ul>
                    )}
                    {isQueued && (
                      <>
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
                      </>
                    )}
                    {isFailed && (
                      <div className="space-y-1 text-slate-600">
                        <p>Common Meta Cloud API rejection causes:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li><strong>Invalid/Unregistered Number:</strong> Phone number is not active on WhatsApp or lacks country code (+91, etc.).</li>
                          <li><strong>DND / Opt-Out:</strong> Recipient previously unsubscribed or blocked business broadcasts.</li>
                          <li><strong>Meta Conversation Credits:</strong> Insufficient conversation balance in your Meta WhatsApp Manager wallet.</li>
                          <li><strong>Template Format:</strong> Parameters mismatch in dynamic variable slots.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Next Steps / Solutions */}
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDelivered || isRead ? 'bg-emerald-100 text-emerald-800' : isSent ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>3</span>
                    <span>
                      {isDelivered && 'What happens next?'}
                      {isRead && 'Recommended Action'}
                      {isSent && 'What action is required?'}
                      {isQueued && 'What is the solution?'}
                      {isFailed && 'How to resolve and retry?'}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border space-y-2 text-[11px] ${
                    isDelivered || isRead || isQueued
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : isSent
                      ? 'bg-cyan-50/70 border-cyan-200 text-cyan-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    {isDelivered && (
                      <div className="space-y-1 text-emerald-900">
                        <p><strong>1. Live Read Transition:</strong> As soon as the customer unlocks their phone and opens this chat, Meta webhook will automatically update this badge to <strong>READ (Blue Tick)</strong>.</p>
                        <p><strong>2. Unified Inbox Replies:</strong> Any replies, questions, or button taps from this customer will appear immediately in your <strong>Unified Inbox</strong>.</p>
                      </div>
                    )}
                    {isRead && (
                      <div className="space-y-1 text-blue-950">
                        <p><strong>Lead is actively warm:</strong> The customer has viewed the message. You can open their conversation thread in the Unified Inbox to continue the discussion or trigger an automated workflow.</p>
                      </div>
                    )}
                    {isSent && (
                      <div className="space-y-1 text-cyan-950">
                        <p><strong>No manual action needed:</strong> The message is safe in WhatsApp's delivery queue and will transition to DELIVERED the moment the recipient connects to data.</p>
                      </div>
                    )}
                    {isQueued && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Click "Retry & Dispatch Now" Below:</strong>
                            <p className="text-emerald-800 mt-0.5">
                              Our upgraded backend dispatcher auto-formats variables and dispatches immediately to queued contacts!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {isFailed && (
                      <div className="space-y-1.5 text-slate-700">
                        <p>1. Check that the phone number is in international E.164 format (e.g. <code>+91 94963 00233</code>).</p>
                        <p>2. Verify your Meta WhatsApp Business Wallet in Settings.</p>
                        <p>3. Click <strong>Retry Failed Messages</strong> below to attempt re-delivery.</p>
                      </div>
                    )}
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

                <div className="flex items-center gap-2">
                  {(isDelivered || isRead) && queueInspection.recipient?.phone && (
                    <button
                      type="button"
                      onClick={() => handleOpenInInbox(queueInspection.recipient?.phone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Chat in Inbox</span>
                    </button>
                  )}

                  {(isQueued || isFailed) && (
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
                      <span>{isFailed ? 'Retry Failed Messages' : 'Retry & Dispatch Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* REAL WHATSAPP TEMPLATE PREVIEW MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {previewTemplateTarget && (() => {
        const tName = (previewTemplateTarget.templateName || '').trim();
        const activeTmpl = tName
          ? templates.find(
              (t) =>
                t.name.toLowerCase() === tName.toLowerCase() ||
                String(t.id) === tName ||
                (t.meta_template_id && t.meta_template_id === tName)
            ) ||
            bulkTemplates.find((b) => b.name.toLowerCase() === tName.toLowerCase() || b.id === tName) ||
            null
          : null;

        const camp = previewTemplateTarget.campaign;
        const metaStatus = (activeTmpl as any)?.meta_status || (activeTmpl as any)?.status || (tName ? 'APPROVED' : 'DIRECT');
        const isApproved = metaStatus === 'APPROVED' || metaStatus === 'Active';
        const category = (activeTmpl as any)?.meta_category || (activeTmpl as any)?.category || camp?.category || camp?.type || 'MARKETING';
        const language = (activeTmpl as any)?.language || 'en_US';
        const headerType = String((activeTmpl as any)?.header_type || (activeTmpl as any)?.headerType || '').toUpperCase();
        const headerText = (activeTmpl as any)?.header_text || (activeTmpl as any)?.headerText || '';
        const headerSample = (activeTmpl as any)?.header_sample || '';
        const headerUrl = (activeTmpl as any)?.header_url || (activeTmpl as any)?.headerContent || '';
        const footerText = (activeTmpl as any)?.footer_text || (activeTmpl as any)?.footerText || '';
        const buttons: Array<{ type: string; text: string; url?: string; phone_number?: string }> = (activeTmpl as any)?.buttons || [];

        // Build preview body
        let bodyRaw = '';
        if (camp?.messageText && !camp.messageText.startsWith('[WhatsApp Template')) {
          bodyRaw = camp.messageText;
        } else if (activeTmpl) {
          bodyRaw = (activeTmpl as any).body_text || (activeTmpl as any).body || '';
          const vars = (activeTmpl as any).body_variables || (activeTmpl as any).variables || {};
          if (typeof vars === 'object' && vars !== null) {
            Object.keys(vars).forEach((k) => {
              bodyRaw = bodyRaw.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(vars[k]));
            });
          }
          // Common fallbacks for remaining placeholders
          bodyRaw = bodyRaw
            .replace(/\{\{1\}\}/g, 'Vikram Mehta')
            .replace(/\{\{2\}\}/g, 'AC Deep Cleaning')
            .replace(/\{\{3\}\}/g, 'May 13, 2024')
            .replace(/\{\{4\}\}/g, '10:30 AM')
            .replace(/\{\{5\}\}/g, 'Ramesh Kumar')
            .replace(/\{\{6\}\}/g, '₹2,800');
        } else {
          bodyRaw = camp?.description || 'Broadcast message content.';
        }

        const lines = bodyRaw.split('\n');

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={() => setPreviewTemplateTarget(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-100 truncate font-mono">
                        {tName || 'Direct Freeform Broadcast'}
                      </h3>
                      {tName && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 border shrink-0 ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isApproved && <CheckCircle2 className="w-2.5 h-2.5" />}
                          <span>{metaStatus}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Live WhatsApp Preview • Dispatched in Campaign "{camp?.name || 'Broadcast'}"
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewTemplateTarget(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Meta Pipeline Specs Strip */}
              <div className="px-4 py-2 bg-slate-800/90 text-[10px] text-slate-300 flex items-center justify-between flex-wrap gap-2 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/10 font-bold uppercase tracking-wider text-slate-200">
                    {category}
                  </span>
                  <span>•</span>
                  <span>Lang: <strong className="text-white">{language}</strong></span>
                  {activeTmpl && (activeTmpl as any).meta_template_id && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-400 text-[9px]">
                        Meta ID: {(activeTmpl as any).meta_template_id}
                      </span>
                    </>
                  )}
                </div>

                {tName && (
                  <a
                    href={getMetaManagerUrl(tName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-bold rounded-lg text-[10px] shadow-xs transition cursor-pointer"
                    title="Open official template page on Facebook Meta WhatsApp Manager"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in Facebook Meta Manager</span>
                  </a>
                )}
              </div>

              {/* Smartphone Frame Preview Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100 flex flex-col items-center justify-center">
                <div className="w-[300px] sm:w-[320px] bg-slate-900 rounded-[32px] p-2.5 shadow-xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-black/10">
                  {/* Camera / Speaker Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-black rounded-full z-20 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-slate-900 ml-auto mr-1.5" />
                  </div>

                  {/* Smartphone Screen */}
                  <div className="bg-[#EFEAE2] rounded-[24px] overflow-hidden flex flex-col">
                    {/* WhatsApp Top Green Header */}
                    <div className="bg-[#075E54] text-white pt-4 pb-2 px-3 flex items-center gap-2 shadow-xs shrink-0">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[10px]">
                        CF
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-[11px] text-white truncate">CoolFix Services</h4>
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        </div>
                        <p className="text-[8px] text-white/70">Official WhatsApp Business Account</p>
                      </div>
                    </div>

                    {/* Chat Bubble Canvas */}
                    <div
                      className="p-3 space-y-2 flex flex-col justify-start max-h-[380px] overflow-y-auto"
                      style={{
                        backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                      }}
                    >
                      <div className="bg-white rounded-2xl rounded-tl-none shadow-md border border-slate-200/70 overflow-hidden max-w-[270px]">
                        {/* Header Media / Text */}
                        {headerType === 'TEXT' && headerText && (
                          <div className="p-2.5 pb-1 font-bold text-[11px] text-slate-900">
                            {headerText.includes('{{1}}')
                              ? headerText.replace('{{1}}', headerSample || 'CoolFix AC Services')
                              : headerText}
                          </div>
                        )}

                        {['IMAGE', 'VIDEO'].includes(headerType) && (
                          <div className="relative h-28 bg-slate-200 overflow-hidden">
                            <img
                              src={headerUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'}
                              alt="Header Media"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800';
                              }}
                            />
                          </div>
                        )}

                        {headerType === 'DOCUMENT' && (
                          <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-[10px] font-bold text-slate-700 truncate">Document.pdf</span>
                          </div>
                        )}

                        {/* Body Text */}
                        <div className="p-2.5 text-[10.5px] text-slate-800 space-y-1">
                          {lines.map((line, lIdx) => {
                            let parts = line;
                            parts = parts.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
                            parts = parts.replace(/_(.*?)_/g, '<em>$1</em>');
                            parts = parts.replace(/~(.*?)~/g, '<del>$1</del>');
                            parts = parts.replace(/`(.*?)`/g, '<code class="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>');
                            return (
                              <p key={lIdx} className="min-h-[1em] leading-relaxed" dangerouslySetInnerHTML={{ __html: parts || '&nbsp;' }} />
                            );
                          })}
                        </div>

                        {/* Footer Text */}
                        {footerText && (
                          <div className="px-2.5 pb-1 text-[8.5px] text-slate-400 font-medium">
                            {footerText}
                          </div>
                        )}

                        {/* Timestamp & Read Checkmarks */}
                        <div className="px-2.5 pb-1.5 flex items-center justify-end gap-1 text-[8px] text-slate-400">
                          <span>
                            {camp?.createdAt
                              ? new Date(camp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '10:30 AM'}
                          </span>
                          <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                        </div>

                        {/* Action Buttons */}
                        {buttons.length > 0 && (
                          <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/50">
                            {buttons.map((b, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => addToast(`Clicked "${b.text}" preview`, 'info')}
                                className="w-full py-1.5 px-2.5 text-[10px] font-bold text-[#00a884] hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {b.type === 'URL' && <ExternalLink className="w-3 h-3 text-[#00a884]" />}
                                {b.type === 'PHONE_NUMBER' && <Phone className="w-3 h-3 text-[#00a884]" />}
                                {b.type === 'COPY_CODE' && <Copy className="w-3 h-3 text-[#00a884]" />}
                                <span>{b.text}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 text-[11px] truncate">
                  Campaign: <strong className="text-slate-800">{camp?.name || '—'}</strong>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(bodyRaw);
                      addToast('Message text copied to clipboard!', 'success');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>

                  {activeTmpl && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(activeTmpl.id);
                        setPreviewTemplateTarget(null);
                        setActiveTab('template-hub');
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open in Template Hub</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setPreviewTemplateTarget(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition cursor-pointer text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Ban,
  UserX,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Info,
  CheckCircle2,
  Copy,
  ExternalLink,
  Search,
  MessageSquare,
  RotateCcw,
  FileDown,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  PhoneCall,
  Activity,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { SuppressionRecord } from '../../../types';

export interface SuppressionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'all' | 'blocked' | 'opted_out' | 'quality';
  onFilterChange?: (filter: 'all' | 'blocked' | 'opted_out') => void;
}

export const SuppressionDetailsModal: React.FC<SuppressionDetailsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'all',
  onFilterChange,
}) => {
  const {
    suppressionList,
    removeSuppressionRecord,
    setSelectedConversationId,
    setActiveTab,
    addToast,
    conversations,
  } = useQiyamStore();

  const [activeTab, setActiveTabState] = useState<'all' | 'blocked' | 'opted_out' | 'quality'>(
    initialTab
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isPayloadOpen, setIsPayloadOpen] = useState(true);
  const [resubscribeConfirmRecord, setResubscribeConfirmRecord] = useState<SuppressionRecord | null>(
    null
  );

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTabState(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  const totalCount = suppressionList?.length || 0;
  const blockedRecords = useMemo(
    () => (suppressionList || []).filter((s) => s.type === 'blocked'),
    [suppressionList]
  );
  const optedOutRecords = useMemo(
    () =>
      (suppressionList || []).filter(
        (s) => s.type === 'opted_out' || s.type === 'opt_out_stop' || s.type === 'opt_out_button'
      ),
    [suppressionList]
  );

  const displayedList = useMemo(() => {
    let list = suppressionList || [];
    if (activeTab === 'blocked') {
      list = blockedRecords;
    } else if (activeTab === 'opted_out') {
      list = optedOutRecords;
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        (item.campaignName && item.campaignName.toLowerCase().includes(q)) ||
        (item.metaErrorCode && String(item.metaErrorCode).includes(q))
    );
  }, [suppressionList, activeTab, blockedRecords, optedOutRecords, searchQuery]);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    addToast(`Copied ${phone} to clipboard`, 'info');
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const sampleMeta131051Payload = `{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1029836994795053",
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "+91 94963 00233",
              "phone_number_id": "4567067243541240"
            },
            "statuses": [
              {
                "id": "wamid.HBgLMzkxNTAxMTEyMjMzFQIAERgSQjE4MjI2NDNCNjExOTI4RTg4AA==",
                "status": "failed",
                "timestamp": "1789191000",
                "recipient_id": "971501112233",
                "errors": [
                  {
                    "code": 131051,
                    "title": "Message failed to send",
                    "message": "User has blocked the business phone number",
                    "error_data": {
                      "details": "The recipient has blocked this business from sending WhatsApp messages."
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}`;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(sampleMeta131051Payload);
    setCopiedPayload(true);
    addToast('Meta Error 131051 webhook payload copied to clipboard!', 'success');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleOpenChat = (phone: string) => {
    const matchingConv = (conversations || []).find(
      (c) => (c.phone_number || '').replace(/\D/g, '') === phone.replace(/\D/g, '')
    );
    if (matchingConv) {
      setSelectedConversationId(matchingConv.id);
    } else {
      setSelectedConversationId(phone);
    }
    setActiveTab('conversations');
    onClose();
  };

  const handleConfirmResubscribe = () => {
    if (!resubscribeConfirmRecord) return;
    removeSuppressionRecord(resubscribeConfirmRecord.phone);
    addToast(
      `Re-subscribed ${resubscribeConfirmRecord.name} (${resubscribeConfirmRecord.phone}) upon customer consent.`,
      'success'
    );
    setResubscribeConfirmRecord(null);
  };

  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Phone Number',
      'Suppression Type',
      'Reason',
      'Meta Error Code',
      'Campaign Origin',
      'Date Recorded',
      'Source',
    ];
    const rows = (suppressionList || []).map((r) => [
      `"${r.name}"`,
      `"${r.phone}"`,
      `"${r.type}"`,
      `"${r.reason.replace(/"/g, '""')}"`,
      r.metaErrorCode ? `"${r.metaErrorCode}"` : '""',
      `"${r.campaignName || ''}"`,
      `"${r.date}"`,
      `"${r.source || 'Automated Webhook'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WhatsApp_Suppression_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Suppression audit CSV exported successfully!', 'success');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Blocked Contacts &amp; Opt-Out Intelligence
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  META COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automated webhook delivery failure capture, keyword suppression, and sender tier protection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Interactive Tab Selectors matching the 4 summary cards */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Tab 1: Total Suppressed */}
            <button
              type="button"
              onClick={() => {
                setActiveTabState('all');
                onFilterChange?.('all');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === 'all'
                  ? 'bg-white border-rose-500 shadow-xs ring-2 ring-rose-500/20'
                  : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Suppressed
                </span>
                <Ban
                  className={`w-3.5 h-3.5 ${activeTab === 'all' ? 'text-rose-600' : 'text-slate-400'}`}
                />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl font-black text-slate-900">{totalCount}</span>
                <span className="text-[10px] text-slate-400 font-medium">contacts</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                Campaign exempt
              </span>
            </button>

            {/* Tab 2: Blocked (Meta 131051) */}
            <button
              type="button"
              onClick={() => {
                setActiveTabState('blocked');
                onFilterChange?.('blocked');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === 'blocked'
                  ? 'bg-white border-red-500 shadow-xs ring-2 ring-red-500/20'
                  : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Blocked (131051)
                </span>
                <UserX
                  className={`w-3.5 h-3.5 ${activeTab === 'blocked' ? 'text-red-600' : 'text-slate-400'}`}
                />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl font-black text-red-600">{blockedRecords.length}</span>
                <span className="text-[10px] text-red-400 font-medium">failed</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                User blocked line
              </span>
            </button>

            {/* Tab 3: Opted Out / STOP */}
            <button
              type="button"
              onClick={() => {
                setActiveTabState('opted_out');
                onFilterChange?.('opted_out');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === 'opted_out'
                  ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Opted Out / STOP
                </span>
                <AlertOctagon
                  className={`w-3.5 h-3.5 ${activeTab === 'opted_out' ? 'text-amber-600' : 'text-slate-400'}`}
                />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl font-black text-amber-600">{optedOutRecords.length}</span>
                <span className="text-[10px] text-amber-500 font-medium">unsubs</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                Keywords &amp; Buttons
              </span>
            </button>

            {/* Tab 4: Sender Quality */}
            <button
              type="button"
              onClick={() => {
                setActiveTabState('quality');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === 'quality'
                  ? 'bg-white border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Sender Quality
                </span>
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${activeTab === 'quality' ? 'text-emerald-600' : 'text-slate-400'}`}
                />
              </div>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 self-center" />
                <span className="text-sm font-black text-emerald-600">High Tier</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                100k/day limit
              </span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TOTAL SUPPRESSED OVERVIEW */}
          {activeTab === 'all' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                    Total Contacts Suppressed
                  </div>
                  <div className="text-2xl font-black text-rose-900 mt-1">{totalCount}</div>
                  <p className="text-xs text-rose-600/80 mt-1">
                    Exempted across all broadcast lists
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Delivery Budget Protected
                  </div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    ₹{(totalCount * 0.78 * 4).toFixed(2)}{' '}
                    <span className="text-xs font-semibold text-emerald-700">/ AED {(totalCount * 0.22 * 4).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-emerald-600/80 mt-1">
                    Saved on prohibited broadcast attempts
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Enforcement Latency
                  </div>
                  <div className="text-2xl font-black text-blue-900 mt-1">&lt; 100ms</div>
                  <p className="text-xs text-blue-600/80 mt-1">
                    Instant exclusion upon webhook trigger
                  </p>
                </div>
              </div>

              {/* Explanation Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                  <p className="font-bold text-slate-900">
                    How Automated Suppression Protects Your Business:
                  </p>
                  <p>
                    When preparing a bulk broadcast, our campaign compilation pipeline performs a synchronous lookup against this suppression ledger. Any phone number that has opted out via keyword, tapped an unsubscribe button, or blocked your business number on WhatsApp is immediately omitted from recipient payloads.
                  </p>
                </div>
              </div>

              {/* Search & Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone, reason, error code..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Suppression Audit CSV</span>
                </button>
              </div>

              {/* Suppressed Contacts List Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Contact</th>
                        <th className="p-3.5">Type &amp; Code</th>
                        <th className="p-3.5">Reason &amp; Campaign</th>
                        <th className="p-3.5">Recorded Date</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                            No suppressed contacts matching query.
                          </td>
                        </tr>
                      ) : (
                        displayedList.map((record) => {
                          const isBlocked = record.type === 'blocked';
                          return (
                            <tr key={record.id} className="hover:bg-slate-50/70 transition">
                              <td className="p-3.5">
                                <div className="font-bold text-slate-900">{record.name}</div>
                                <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                                  <span>{record.phone}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPhone(record.phone)}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title="Copy phone"
                                  >
                                    {copiedPhone === record.phone ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="flex flex-col items-start gap-1">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                      isBlocked
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    {isBlocked ? (
                                      <UserX className="w-3 h-3" />
                                    ) : (
                                      <Ban className="w-3 h-3" />
                                    )}
                                    <span>{isBlocked ? 'Blocked' : 'Opted Out'}</span>
                                  </span>
                                  {record.metaErrorCode && (
                                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                      Error {record.metaErrorCode}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="p-3.5 max-w-xs">
                                <div className="text-slate-800 font-medium leading-snug line-clamp-1">
                                  {record.reason}
                                </div>
                                {record.campaignName ? (
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    Origin: <span className="font-semibold text-slate-700">{record.campaignName}</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400 mt-0.5 italic">
                                    Organic / Inbound
                                  </div>
                                )}
                              </td>

                              <td className="p-3.5 text-slate-500 whitespace-nowrap">
                                <div className="font-medium text-slate-700">{record.date}</div>
                                <div className="text-[10px] text-slate-400">
                                  {record.source || 'Webhook Trigger'}
                                </div>
                              </td>

                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenChat(record.phone)}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                    title="View conversation history"
                                  >
                                    <MessageSquare className="w-3 h-3 text-slate-500" />
                                    <span>Chat</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setResubscribeConfirmRecord(record)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                    title="Re-subscribe contact"
                                  >
                                    <RotateCcw className="w-3 h-3 text-rose-600" />
                                    <span>Re-subscribe</span>
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
          )}

          {/* TAB 2: BLOCKED (META ERROR 131051) DIAGNOSTICS */}
          {activeTab === 'blocked' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Diagnostic Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white border border-red-800/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-600/30 text-red-300 border border-red-500/30">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-white">
                        Meta Graph API Error 131051: User Blocked Business
                      </h3>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
                        CRITICAL SEVERITY
                      </span>
                    </div>
                    <p className="text-xs text-red-200/80 mt-0.5">
                      Automated capture from WhatsApp Cloud API delivery status webhook
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  When an outbound WhatsApp message is sent to a user who has blocked your WhatsApp Business Account on their device, Meta Cloud API returns status <code className="text-red-300 bg-red-950/60 px-1 py-0.5 rounded">failed</code> with error code <strong className="text-white">131051</strong> (&quot;User has blocked the business phone number&quot;).
                </p>

                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Why automated suppression is crucial:</strong>
                    <span className="block mt-0.5 text-slate-300">
                      Repeated attempts to message a user who blocked your business line trigger Meta spam alarms. This drastically degrades your WABA quality rating from <strong>High (Green)</strong> to <strong>Low (Red)</strong>, and can lead to immediate reduction of messaging limits or account suspension.
                    </span>
                  </div>
                </div>
              </div>

              {/* Webhook Payload JSON Viewer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Live Meta Webhook Telemetry Payload (Error 131051)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPayload}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedPayload ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPayloadOpen(!isPayloadOpen)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {isPayloadOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isPayloadOpen && (
                  <pre className="p-4 text-[11px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed max-h-56">
                    {sampleMeta131051Payload}
                  </pre>
                )}
              </div>

              {/* Blocked Contacts Detail Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span>Blocked Contacts Enrolled ({blockedRecords.length})</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Auto-Paused
                  </span>
                </h4>

                {blockedRecords.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-slate-200 bg-white">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800">
                      0 Blocked Contacts on Record
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      No recipients have blocked your business line.
                    </p>
                  </div>
                ) : (
                  blockedRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 rounded-2xl bg-white border border-red-200/90 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{record.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-200">
                              Meta 131051
                            </span>
                          </div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">
                            {record.phone}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenChat(record.phone)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Thread</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                        <div>
                          <span className="text-slate-400 font-medium">Originating Campaign: </span>
                          <span className="font-semibold text-slate-800">
                            {record.campaignName || 'Direct Message'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Capture Timestamp: </span>
                          <span className="font-semibold text-slate-800">{record.date}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 font-medium">Resolution Protocol: </span>
                          <span className="text-slate-700">
                            Recipient must initiate conversation or unblock business number directly on their WhatsApp application before any outbound message can be delivered.
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OPTED OUT / STOP COMPLIANCE */}
          {activeTab === 'opted_out' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Compliance Overview */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-900 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      Opt-Out Compliance &amp; Anti-Spam Governance
                    </h3>
                    <p className="text-xs text-slate-600">
                      Enforcing WhatsApp Business Policy, GDPR, TCPA, and TRAI/TDRA standards
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-1">
                      1. Natural Keyword Inbound Detection
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Our system automatically intercepts inbound messages matching:
                      <code className="block mt-1 font-mono text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                        STOP, UNSUBSCRIBE, CANCEL, QUIT, END, OPTOUT, HALT
                      </code>
                      Case-insensitive detection with instantaneous exclusion from broadcast lists.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-1">
                      2. Template Quick-Reply Opt-Out Buttons
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      When recipients tap the standard Meta marketing opt-out button (e.g. &quot;Stop Promotions&quot;), a button-click webhook is received and suppression is registered in under 100ms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opted-Out Contacts List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Opted-Out Contacts ({optedOutRecords.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Excluded from all promotional templates
                  </span>
                </div>

                {optedOutRecords.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-slate-200 bg-white">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800">0 Opt-Out Contacts</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      All contacts have active promotional consent.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    {optedOutRecords.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{record.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              {record.type === 'opt_out_button' ? 'Button Click' : 'Keyword STOP'}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">
                            {record.phone}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            <strong className="text-slate-800">Trigger:</strong> {record.reason}
                          </p>
                          {record.campaignName && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Campaign: {record.campaignName}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenChat(record.phone)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                            <span>Chat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setResubscribeConfirmRecord(record)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                            title="Re-subscribe contact"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                            <span>Re-subscribe</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SENDER QUALITY & WABA HEALTH SCORECARD */}
          {activeTab === 'quality' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Quality Scorecard Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-white">High (Safe Tier)</h3>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-xs text-emerald-300/80">
                        Meta Official Phone Quality Rating: GREEN
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-400">98 / 100</div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Quality Health Index
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-500/20">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      Messaging Limit
                    </div>
                    <div className="text-sm font-bold text-white mt-1">Tier 3 (100k/day)</div>
                    <span className="text-[10px] text-emerald-400">Highest tier available</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Block Rate</div>
                    <div className="text-sm font-bold text-white mt-1">0.02%</div>
                    <span className="text-[10px] text-emerald-400">Threshold: &lt; 0.20%</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      Spam Reports
                    </div>
                    <div className="text-sm font-bold text-white mt-1">0 Reports</div>
                    <span className="text-[10px] text-emerald-400">Zero violations (30d)</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      Auto-Protection
                    </div>
                    <div className="text-sm font-bold text-white mt-1">100% Active</div>
                    <span className="text-[10px] text-emerald-400">0ms suppression leak</span>
                  </div>
                </div>
              </div>

              {/* Messaging Tier Progression Guide */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Meta Cloud API Messaging Tier Limits</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 opacity-60">
                    <div className="font-bold text-slate-700">Tier 1</div>
                    <div className="text-slate-900 font-extrabold mt-0.5">1,000 / 24h</div>
                    <p className="text-[10px] text-slate-500 mt-1">Starter verified limit</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 opacity-60">
                    <div className="font-bold text-slate-700">Tier 2</div>
                    <div className="text-slate-900 font-extrabold mt-0.5">10,000 / 24h</div>
                    <p className="text-[10px] text-slate-500 mt-1">Standard scaling tier</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500 ring-2 ring-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800">Tier 3 (Active)</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-emerald-950 font-black text-sm mt-0.5">100,000 / 24h</div>
                    <p className="text-[10px] text-emerald-700 mt-1 font-semibold">Current Account Tier</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-700">Tier 4</div>
                    <div className="text-slate-900 font-extrabold mt-0.5">Unlimited</div>
                    <p className="text-[10px] text-slate-500 mt-1">Enterprise scale</p>
                  </div>
                </div>
              </div>

              {/* Best Practices Checklist */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>4 Best Practices to Maintain Green Quality Rating</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Include Unsubscribe Buttons:</strong>
                      <span className="text-slate-600">
                        Always include an opt-out quick reply button or &quot;Reply STOP to unsubscribe&quot; in promotional templates.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Respect Suppression List:</strong>
                      <span className="text-slate-600">
                        Never manually force messages to a contact who blocked your line or sent a STOP keyword.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Audience Segmentation:</strong>
                      <span className="text-slate-600">
                        Target specific tags (e.g. AC Service, High Value) rather than blasting your full database indiscriminately.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Monitor Template Read Rates:</strong>
                      <span className="text-slate-600">
                        If a marketing template experiences low read rates (&lt;15%), discontinue it before Meta flags it as spam.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Link to Meta Business Suite */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10">
                    <ExternalLink className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-white">
                      Inspect Official Meta Phone Rating Live
                    </h5>
                    <p className="text-[11px] text-blue-200">
                      View real-time Meta Business Suite WhatsApp Manager Quality scorecard
                    </p>
                  </div>
                </div>

                <a
                  href="https://business.facebook.com/latest/whatsapp_manager/phone_numbers?business_id=1029836994795053&nav_ref=whatsapp_manager&asset_id=4567067243541240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <span>Open Meta WhatsApp Manager</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Tolerance Spam Prevention Engine • Real-time Protection</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Re-subscribing a Contact */}
      {resubscribeConfirmRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Confirm Re-subscription Consent
                </h4>
                <p className="text-xs text-slate-500">
                  Regulatory compliance requirement
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{resubscribeConfirmRecord.name}</strong> ({resubscribeConfirmRecord.phone}) from the suppression list?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
              <p className="font-bold">WhatsApp Policy Notice:</p>
              <p>
                Only re-subscribe a recipient if they have explicitly provided written consent or sent an inbound &quot;START&quot; message. Violating opt-out requests can lead to spam reports and Meta WABA suspension.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResubscribeConfirmRecord(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResubscribe}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm &amp; Re-subscribe</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  MessageSquare, Plus, Search, Filter, Copy, Sparkles,
  RefreshCw, CheckCircle2, Clock, AlertTriangle, Send,
  Globe, ExternalLink, Settings, Smartphone, Trash2, Edit3,
  ArrowRight, Phone, Check, CheckCheck, FileText, Share2, Layers,
  Image, AlertCircle, GitBranch, Zap, ShieldCheck, Loader2
} from 'lucide-react';
import { WhatsAppTemplateItem } from '@/types';
import { MetaConfigModal } from './MetaConfigModal';
import { AutoWorkflowModal } from './AutoWorkflowModal';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';

export const TemplateHubView: React.FC = () => {
  const {
    templates,
    metaConfig,
    selectedTemplateId,
    setSelectedTemplateId,
    setEditingTemplate,
    setActiveTab,
    syncTemplatesWithMeta,
    verifyMetaTemplate,
    deleteMetaTemplate,
    testSendTemplate,
    saveMetaConfig,
    testMetaConnection,
    addToast,
    requestGeneralConfirmation,
  } = useQiyamStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('ALL');
  const [previewMode, setPreviewMode] = useState<'sample' | 'raw'>('sample');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [workflowTemplateTarget, setWorkflowTemplateTarget] = useState<Partial<WhatsAppTemplateItem> | null>(null);
  const [isAutoWorkflowModalOpen, setIsAutoWorkflowModalOpen] = useState(false);

  // Test Send Modal
  const [showTestSendModal, setShowTestSendModal] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('+91 98765 43210');

  const handleLiveVerify = async (templateId: string | number) => {
    setIsVerifying(String(templateId));
    try {
      await verifyMetaTemplate(templateId);
    } finally {
      setIsVerifying(null);
    }
  };

  // Counts
  const approvedCount = templates.filter(t => (t.meta_status || t.status) === 'APPROVED' || t.status === 'Active').length;
  const pendingCount = templates.filter(t => t.meta_status === 'PENDING').length;
  const rejectedCount = templates.filter(t => t.meta_status === 'REJECTED').length;
  const draftCount = templates.filter(t => t.meta_status === 'DRAFT' || t.status === 'Draft').length;

  const filtered = templates.filter((t) => {
    if (statusFilter === 'APPROVED') {
      if (t.meta_status !== 'APPROVED' && t.status !== 'Active') return false;
    } else if (statusFilter === 'PENDING') {
      if (t.meta_status !== 'PENDING') return false;
    } else if (statusFilter === 'REJECTED') {
      if (t.meta_status !== 'REJECTED') return false;
    } else if (statusFilter === 'DRAFT') {
      if (t.meta_status !== 'DRAFT' && t.status !== 'Draft') return false;
    }

    if (categoryFilter !== 'ALL') {
      if (t.meta_category !== categoryFilter) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = t.name.toLowerCase().includes(q);
      const bodyMatch = (t.body_text || t.body || '').toLowerCase().includes(q);
      return nameMatch || bodyMatch;
    }
    return true;
  });

  // Selected Template for Live Phone Preview
  const activeTemplate = templates.find(t => String(t.id) === String(selectedTemplateId)) || filtered[0] || templates[0];

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncTemplatesWithMeta();
      addToast('Templates synchronized with Meta Graph API', 'success');
    } catch (e: any) {
      addToast(`Sync error: ${e.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEdit = (template: WhatsAppTemplateItem) => {
    setEditingTemplate(template);
    setActiveTab('template-create');
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setActiveTab('template-create');
  };

  // Render Body for Active Preview
  const renderActiveBody = () => {
    if (!activeTemplate) return null;
    let text = activeTemplate.body_text || activeTemplate.body || '';

    if (previewMode === 'sample') {
      const vars = activeTemplate.body_variables || {};
      Object.keys(vars).forEach(k => {
        text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), vars[k] || `{{${k}}}`);
      });
    }

    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      let parts = line;
      parts = parts.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      parts = parts.replace(/_(.*?)_/g, '<em>$1</em>');
      parts = parts.replace(/~(.*?)~/g, '<del>$1</del>');
      parts = parts.replace(/`(.*?)`/g, '<code class="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>');

      return (
        <p key={lIdx} className="min-h-[1em] leading-relaxed" dangerouslySetInnerHTML={{ __html: parts || '&nbsp;' }} />
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        title="Meta WhatsApp Template Hub"
        subtitle="Manage, review, test-send, and live-preview all official WhatsApp Cloud API templates."
        primaryActionLabel="Create New Template"
        onPrimaryAction={handleCreateNew}
      />

      {/* Main Two-Pane Split Layout: Left Templates List + Right Live Smartphone Preview */}
      <div className="flex-1 flex overflow-hidden border-t border-slate-200">
        {/* LEFT PANE: TEMPLATE GALLERY & FILTERS */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          {/* Top Status Banner & Actions */}
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({templates.length})
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Approved ({approvedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  statusFilter === 'PENDING' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>In Review ({pendingCount})</span>
              </button>
              {rejectedCount > 0 && (
                <button
                  onClick={() => setStatusFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    statusFilter === 'REJECTED' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Rejected ({rejectedCount})</span>
                </button>
              )}
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'DRAFT' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync with Meta</span>
              </button>

              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>Meta Setup</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by template name or message text..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>
          </div>

          {/* Scrollable Templates Cards Grid */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {filtered.map((tmpl) => {
              const isSelected = String(tmpl.id) === String(activeTemplate?.id);
              const isApproved = (tmpl.meta_status || tmpl.status) === 'APPROVED' || tmpl.status === 'Active';
              const isPending = tmpl.meta_status === 'PENDING';
              const isRejected = tmpl.meta_status === 'REJECTED';

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 font-mono flex items-center gap-1.5">
                            <span>{tmpl.name}</span>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                PREVIEWING
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 flex-wrap">
                          <span className="font-semibold uppercase tracking-wider text-slate-600">
                            {tmpl.meta_category || tmpl.category}
                          </span>
                          <span>•</span>
                          <span>Lang: {tmpl.language || 'en_US'}</span>
                          <span>•</span>
                          {tmpl.meta_template_id ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Meta #{tmpl.meta_template_id}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-500" />
                              Meta Review
                            </span>
                          )}
                          {tmpl.header_type && tmpl.header_type !== 'NONE' && (
                            <>
                              <span>•</span>
                              <span>Header: {tmpl.header_type}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : isRejected
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {tmpl.meta_status || tmpl.status}
                        </span>
                      </div>
                    </div>

                    {/* Header Thumbnail Preview if IMAGE or VIDEO */}
                    {['IMAGE', 'VIDEO'].includes(tmpl.header_type || '') && (
                      <div className="mb-2 flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={tmpl.header_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'}
                            alt="Header Media"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-700 block">
                            Header: {tmpl.header_type} Thumbnail
                          </span>
                          <span className="text-[9px] text-slate-400 block truncate">
                            Attached sample media
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Body snippet */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-700 leading-relaxed whitespace-pre-line max-h-24 overflow-hidden text-ellipsis">
                      {tmpl.body_text || tmpl.body}
                    </div>

                    {/* Rejection alert */}
                    {tmpl.rejection_reason && tmpl.meta_status === 'REJECTED' && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-700 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span className="break-words font-medium">{tmpl.rejection_reason}</span>
                      </div>
                    )}

                    {/* Buttons tags */}
                    {tmpl.buttons && tmpl.buttons.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">
                        <span className="text-[10px] font-bold text-slate-400">Buttons:</span>
                        {tmpl.buttons.map((btn, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold whitespace-nowrap"
                          >
                            {btn.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">Used {tmpl.usage_count} times • {tmpl.last_updated}</span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setWorkflowTemplateTarget(tmpl);
                          setIsAutoWorkflowModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all"
                        title="Auto-build an interactive WhatsApp flowchart from this template"
                      >
                        <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                        <span>Workflow</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(tmpl)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(tmpl.id);
                          setShowTestSendModal(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all"
                      >
                        <Send className="w-3 h-3" />
                        <span>Test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(tmpl.body_text || tmpl.body);
                          addToast('Template text copied to clipboard', 'success');
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          requestGeneralConfirmation({
                            title: 'Delete Template?',
                            message: `Are you sure you want to delete template "${tmpl.name}"?`,
                            variant: 'danger',
                            icon: 'trash',
                            confirmLabel: 'Delete Template',
                            cancelLabel: 'Cancel',
                            itemBadge: {
                              label: tmpl.name,
                              sublabel: tmpl.category || 'Template',
                              badgeText: tmpl.status || 'Meta',
                            },
                            onConfirm: async () => {
                              await deleteMetaTemplate(tmpl.id);
                              addToast('Template deleted', 'info');
                            },
                          });
                        }}
                        className="p-1 text-red-400 hover:text-red-600 rounded"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: DEDICATED STICKY SMARTPHONE PREVIEW */}
        <div className="w-[450px] bg-[#0F172A]/5 p-6 flex flex-col items-center justify-between border-l border-slate-200 shrink-0 overflow-y-auto select-none">
          {/* Top Control Bar */}
          <div className="w-full flex items-center justify-between mb-4 text-xs">
            <div>
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Live Smartphone Preview</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[200px]">
                {activeTemplate?.name || 'Select a template'}
              </span>
            </div>

            <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[10px]">
              <button
                type="button"
                onClick={() => setPreviewMode('sample')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  previewMode === 'sample' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                }`}
              >
                Sample Data
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('raw')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  previewMode === 'raw' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                }`}
              >
                Raw {"{{x}}"}
              </button>
            </div>
          </div>

          {/* Real Meta Cloud Verification Pipeline Panel */}
          {activeTemplate && (
            <div className="w-full mb-4 bg-slate-900 border border-slate-700/80 rounded-2xl p-3.5 text-white text-xs shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-[11px] flex items-center gap-1.5 text-slate-100">
                      <span>Meta Cloud API Pipeline</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-[9px] text-slate-400">
                      WABA: Qiyam Business Solutions (+91 94963 00233)
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 border ${
                    (activeTemplate.meta_status || activeTemplate.status) === 'APPROVED' || activeTemplate.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : activeTemplate.meta_status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {((activeTemplate.meta_status || activeTemplate.status) === 'APPROVED' || activeTemplate.status === 'Active') && (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  )}
                  {activeTemplate.meta_status === 'PENDING' && (
                    <Clock className="w-2.5 h-2.5 animate-spin" />
                  )}
                  {(activeTemplate.meta_status || activeTemplate.status) === 'APPROVED' || activeTemplate.status === 'Active' ? 'META APPROVED' : (activeTemplate.meta_status || activeTemplate.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2 rounded-xl border border-white/10">
                <div>
                  <span className="text-slate-400 block text-[9px] font-semibold">META TEMPLATE ID</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-200 mt-0.5">
                    <span className="truncate max-w-[100px]">{activeTemplate.meta_template_id || 'Generating...'}</span>
                    {activeTemplate.meta_template_id && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeTemplate.meta_template_id || '');
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                          addToast('Meta Template ID copied!', 'success');
                        }}
                        className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                        title="Copy Meta Template ID"
                      >
                        {copiedId ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[9px] font-semibold">META QUALITY</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">
                    {activeTemplate.quality_score === 'GREEN' ? 'High (Green)' : activeTemplate.quality_score || 'High (Green)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLiveVerify(activeTemplate.id)}
                disabled={isVerifying === String(activeTemplate.id)}
                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isVerifying === String(activeTemplate.id) ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Verifying live on Meta Graph API...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>⚡ Live Check on Meta</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Smartphone Frame Container */}
          <div className="w-[320px] h-[580px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-white/20 shrink-0">
            {/* Camera / Speaker Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-black rounded-full z-30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900 ml-auto mr-2" />
            </div>

            {/* Screen */}
            <div className="flex-1 bg-[#EFEAE2] rounded-[30px] flex flex-col overflow-hidden relative">
              {/* WhatsApp Top Header */}
              <div className="bg-[#075E54] text-white pt-6 pb-2 px-3 flex items-center gap-2 shadow-md shrink-0 z-10">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[11px]">
                  CF
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-xs truncate">CoolFix Services</h4>
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  </div>
                  <p className="text-[9px] text-white/70">WhatsApp Official Account</p>
                </div>
              </div>

              {/* Chat Wallpaper & Message Bubble Area */}
              <div
                className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col justify-end"
                style={{
                  backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              >
                {activeTemplate ? (
                  <div className="bg-white rounded-2xl rounded-tl-none shadow-md border border-slate-200/60 overflow-hidden max-w-[270px]">
                    {/* Header */}
                    {activeTemplate.header_type === 'TEXT' && activeTemplate.header_text && (
                      <div className="p-3 pb-1 font-bold text-xs text-slate-900">
                        {previewMode === 'sample' && activeTemplate.header_text.includes('{{1}}')
                          ? activeTemplate.header_text.replace('{{1}}', activeTemplate.header_sample || 'Sample Header')
                          : activeTemplate.header_text}
                      </div>
                    )}

                    {['IMAGE', 'VIDEO'].includes(activeTemplate.header_type || '') && (
                      <div className="relative h-32 bg-slate-200 overflow-hidden">
                        <img
                          src={activeTemplate.header_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'}
                          alt="Template Header Media"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800';
                          }}
                        />
                      </div>
                    )}

                    {activeTemplate.header_type === 'DOCUMENT' && (
                      <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-500 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-700 truncate">Document.pdf</span>
                      </div>
                    )}

                    {/* Body Text */}
                    <div className="p-3 text-[11px] text-slate-800 space-y-1">
                      {renderActiveBody()}
                    </div>

                    {/* Footer Text */}
                    {activeTemplate.footer_text && (
                      <div className="px-3 pb-1 text-[9px] text-slate-400 font-medium">
                        {activeTemplate.footer_text}
                      </div>
                    )}

                    {/* Timestamp & Read Ticks */}
                    <div className="px-3 pb-2 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                      <span>10:30 AM</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                    </div>

                    {/* Buttons */}
                    {activeTemplate.buttons && activeTemplate.buttons.length > 0 && (
                      <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/50">
                        {activeTemplate.buttons.map((b, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => addToast(`Clicked "${b.text}" in preview`, 'info')}
                            className="w-full py-2 px-3 text-[11px] font-bold text-[#00a884] hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5"
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
                ) : (
                  <div className="text-center p-6 text-slate-400 text-xs">
                    Select a template on the left to preview it.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar for Active Template */}
          {activeTemplate && (
            <div className="w-full mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleEdit(activeTemplate)}
                  className="flex-1 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTestSendModal(true)}
                  className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-slate-600" />
                  <span>Send Test</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setWorkflowTemplateTarget(activeTemplate);
                  setIsAutoWorkflowModalOpen(true);
                }}
                className="w-full py-2.5 bg-[#0B3B2C] bg-gradient-to-r from-[#0B3B2C] to-[#0D4B38] hover:from-[#072B1F] hover:to-[#0B3B2C] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer text-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>⚡ Auto-Build Workflow from Template</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Test Send Dialog */}
      {showTestSendModal && activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Send Test WhatsApp Message</h3>
              <button onClick={() => setShowTestSendModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-slate-500 text-[11px]">
              Delivers &quot;{activeTemplate.name}&quot; with sample values directly to your WhatsApp phone number.
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <CountryPhoneInput
                value={testPhoneNumber}
                onChange={(val) => setTestPhoneNumber(val)}
                placeholder="Enter test phone number"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTestSendModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await testSendTemplate(activeTemplate.id, testPhoneNumber, activeTemplate.body_variables || {});
                  if (res && res.success) {
                    addToast(res.message || `Test template delivered to ${testPhoneNumber}`, 'success');
                    setShowTestSendModal(false);
                  } else {
                    addToast(res?.error || `Failed to send template to ${testPhoneNumber}`, 'error');
                  }
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meta Config Modal */}
      <MetaConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={metaConfig}
        onSaveConfig={async (cfg) => {
          await saveMetaConfig(cfg);
          addToast('Meta WhatsApp credentials saved!', 'success');
          return true;
        }}
        onTestConnection={async (creds) => {
          return await testMetaConnection(creds);
        }}
      />

      {/* Auto Workflow Builder Modal */}
      {isAutoWorkflowModalOpen && workflowTemplateTarget && (
        <AutoWorkflowModal
          isOpen={isAutoWorkflowModalOpen}
          onClose={() => {
            setIsAutoWorkflowModalOpen(false);
            setWorkflowTemplateTarget(null);
          }}
          template={workflowTemplateTarget}
        />
      )}
    </div>
  );
};

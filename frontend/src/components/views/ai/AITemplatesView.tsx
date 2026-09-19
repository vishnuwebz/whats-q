import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  MessageSquare, Plus, Search, Filter, Copy, Sparkles,
  RefreshCw, CheckCircle2, Clock, AlertTriangle, Send,
  Globe, ExternalLink, Settings, Smartphone, Trash2, Edit3
} from 'lucide-react';
import { WhatsAppTemplateItem } from '@/types';
import { MetaTemplateCreatorModal } from './MetaTemplateCreatorModal';
import { MetaConfigModal } from './MetaConfigModal';

export const AITemplatesView: React.FC = () => {
  const {
    templates,
    metaConfig,
    addToast,
    saveMetaTemplate,
    submitTemplateToMeta,
    syncTemplatesWithMeta,
    testSendTemplate,
    deleteMetaTemplate,
    saveMetaConfig,
    testMetaConnection
  } = useQiyamStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('ALL');
  
  // Modals
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplateItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Counts
  const approvedCount = templates.filter(t => (t.meta_status || t.status) === 'APPROVED' || t.status === 'Active').length;
  const pendingCount = templates.filter(t => t.meta_status === 'PENDING').length;
  const rejectedCount = templates.filter(t => t.meta_status === 'REJECTED').length;
  const draftCount = templates.filter(t => t.meta_status === 'DRAFT' || t.status === 'Draft').length;

  const filtered = templates.filter((t) => {
    // Status filter
    if (statusFilter === 'APPROVED') {
      if (t.meta_status !== 'APPROVED' && t.status !== 'Active') return false;
    } else if (statusFilter === 'PENDING') {
      if (t.meta_status !== 'PENDING') return false;
    } else if (statusFilter === 'REJECTED') {
      if (t.meta_status !== 'REJECTED') return false;
    } else if (statusFilter === 'DRAFT') {
      if (t.meta_status !== 'DRAFT' && t.status !== 'Draft') return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      if (t.meta_category !== categoryFilter) return false;
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = t.name.toLowerCase().includes(q);
      const bodyMatch = (t.body_text || t.body || '').toLowerCase().includes(q);
      return nameMatch || bodyMatch;
    }
    return true;
  });

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

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="WhatsApp & AI Message Templates"
        subtitle="Meta WhatsApp Cloud API pre-approved templates with dynamic variables, sample values, and interactive CTA buttons."
        primaryActionLabel="New Meta Template"
        onPrimaryAction={() => {
          setEditingTemplate(null);
          setIsCreatorOpen(true);
        }}
      />

      <div className="p-6 space-y-6">
        {/* Meta Integration Status Banner */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Meta WhatsApp Cloud API Status:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  metaConfig?.connection_status === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  {metaConfig?.connection_status === 'connected' ? 'CONNECTED • LIVE' : 'SANDBOX / SETUP REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                WABA ID: <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{metaConfig?.waba_id || '4567067243541240'}</code> • 
                Display: <span className="font-semibold text-slate-700">{metaConfig?.business_phone_display || '+91 94963 00233'}</span> ({metaConfig?.business_name || 'Qiyam Business Solutions'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync with Meta</span>
            </button>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Meta Setup Guide</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Status Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({templates.length})
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'APPROVED' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>In Review ({pendingCount})</span>
            </button>
            {rejectedCount > 0 && (
              <button
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  statusFilter === 'REJECTED' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Rejected ({rejectedCount})</span>
              </button>
            )}
            <button
              onClick={() => setStatusFilter('DRAFT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'DRAFT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utility</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 w-56"
              />
            </div>
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {filtered.map((tmpl) => {
            const isApproved = (tmpl.meta_status || tmpl.status) === 'APPROVED' || tmpl.status === 'Active';
            const isPending = tmpl.meta_status === 'PENDING';
            const isRejected = tmpl.meta_status === 'REJECTED';

            return (
              <div
                key={tmpl.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Status & Category Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
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
                      {tmpl.meta_category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {tmpl.meta_category}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Used {tmpl.usage_count}x</span>
                  </div>

                  {/* Template Title */}
                  <h3 className="font-bold text-sm text-slate-900 font-mono">{tmpl.name}</h3>
                  <div className="text-[10px] text-slate-400 font-semibold mb-2 flex items-center gap-1">
                    <span>Lang: {tmpl.language || 'en_US'}</span>
                    {tmpl.header_type && tmpl.header_type !== 'NONE' && (
                      <span>• Header: {tmpl.header_type}</span>
                    )}
                  </div>

                  {/* Body Preview Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-700 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto">
                    {tmpl.body_text || tmpl.body}
                  </div>

                  {/* Buttons Indicator */}
                  {tmpl.buttons && tmpl.buttons.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1 overflow-x-auto pb-1">
                      {tmpl.buttons.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-[9px] font-bold whitespace-nowrap"
                        >
                          {b.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rejection notice if any */}
                  {tmpl.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-700">
                      Reason: {tmpl.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Card Bottom Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{tmpl.last_updated}</span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingTemplate(tmpl);
                        setIsCreatorOpen(true);
                      }}
                      title="Open in Meta Builder"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tmpl.body_text || tmpl.body);
                        addToast('Template text copied!', 'success');
                      }}
                      title="Copy text"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`Delete template "${tmpl.name}"?`)) {
                          await deleteMetaTemplate(tmpl.id);
                          addToast('Template deleted', 'info');
                        }
                      }}
                      title="Delete template"
                      className="p-1 text-red-400 hover:text-red-600 rounded"
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

      {/* Meta Template Creator Modal */}
      <MetaTemplateCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setEditingTemplate(null);
        }}
        initialTemplate={editingTemplate}
        onSaveDraft={async (tmpl) => {
          await saveMetaTemplate(tmpl);
          addToast('Template saved as Draft', 'success');
        }}
        onSubmitToMeta={async (tmpl) => {
          try {
            const saved = await saveMetaTemplate(tmpl);
            if (saved && saved.id) {
              await submitTemplateToMeta(saved.id);
              addToast('Template submitted to Meta Graph API for review!', 'success');
              return true;
            }
            return false;
          } catch (e: any) {
            addToast(`Submission error: ${e.message}`, 'error');
            return false;
          }
        }}
        onTestSend={async (tmpl, phone) => {
          try {
            const res = await testSendTemplate(tmpl.id || 1, phone, tmpl.body_variables || {});
            if (res && res.success) {
              addToast(res.message || `Test template sent to ${phone}`, 'success');
              return true;
            } else {
              addToast(res?.error || `Send failed`, 'error');
              return false;
            }
          } catch (e: any) {
            addToast(`Send failed: ${e.message}`, 'error');
            return false;
          }
        }}
      />

      {/* Meta Config & Setup Wizard Modal */}
      <MetaConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={metaConfig}
        onSaveConfig={async (cfg) => {
          await saveMetaConfig(cfg);
          addToast('Meta credentials saved successfully!', 'success');
          return true;
        }}
        onTestConnection={async (creds) => {
          return await testMetaConnection(creds);
        }}
      />
    </div>
  );
};

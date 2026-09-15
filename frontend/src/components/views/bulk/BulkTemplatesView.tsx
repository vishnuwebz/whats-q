import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare,
  CheckCheck,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkTemplateItem } from '../../../types';
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const BulkTemplatesView: React.FC = () => {
  const { bulkTemplates, createBulkTemplate, duplicateCampaign, setActiveTab, addToast } =
    useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<BulkTemplateItem | null>(
    bulkTemplates[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Template Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<
    'marketing' | 'utility' | 'authentication'
  >('marketing');
  const [newTemplateLang, setNewTemplateLang] = useState('en_US');
  const [newTemplateBody, setNewTemplateBody] = useState('');

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return bulkTemplates.filter((tmpl) => {
      const matchesSearch =
        tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.bodyText.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || tmpl.category.toLowerCase() === selectedCategory;
      const matchesStatus =
        selectedStatus === 'all' || tmpl.status.toLowerCase() === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [bulkTemplates, searchQuery, selectedCategory, selectedStatus]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast('WhatsApp templates successfully synced with Meta Cloud API!', 'success');
    }, 1200);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !newTemplateBody.trim()) {
      addToast('Please provide both name and message body', 'error');
      return;
    }

    createBulkTemplate({
      name: newTemplateName.trim().toLowerCase().replace(/\s+/g, '_'),
      category: newTemplateCategory,
      language: newTemplateLang,
      bodyText: newTemplateBody,
    });

    setIsCreateOpen(false);
    setNewTemplateName('');
    setNewTemplateBody('');
    addToast(
      'Template submitted to Meta for review! Typically approved within 2-15 minutes.',
      'success'
    );
  };

  const handleUseInCampaign = (tmpl: BulkTemplateItem) => {
    addToast(`Selected template "${tmpl.name}" for broadcasting`, 'info');
    setActiveTab('bulk-send');
  };

  const handleDuplicate = (tmpl: BulkTemplateItem) => {
    createBulkTemplate({
      name: `${tmpl.name}_copy`,
      category: tmpl.category,
      language: tmpl.language,
      bodyText: tmpl.bodyText,
      headerType: tmpl.headerType,
      headerContent: tmpl.headerContent,
      footerText: tmpl.footerText,
      buttons: tmpl.buttons,
    });
    addToast(`Duplicated "${tmpl.name}" successfully`, 'success');
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
                  Message Templates
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  META WABA SYNC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-approved WhatsApp message templates synced with Meta WhatsApp Manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              Sync with Meta
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Create Template
            </button>

            <MetaWalletCard compact={true} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-5">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, content..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="marketing">Marketing</option>
              <option value="utility">Utility</option>
              <option value="authentication">Authentication</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tmpl) => {
            const isApproved = tmpl.status === 'APPROVED';
            const isPending = tmpl.status === 'PENDING';
            return (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{tmpl.name}</h3>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Language: {tmpl.language} • ID: {tmpl.id}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3 h-3" />}
                      {isPending && <Clock className="w-3 h-3" />}
                      {tmpl.status}
                    </span>
                  </div>

                  {/* Category & Quality */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                      {tmpl.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Quality: {tmpl.qualityRating || 'High'}
                    </span>
                  </div>

                  {/* Body preview snippet */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed line-clamp-3 mb-4 font-mono text-[11px]">
                    {tmpl.bodyText}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setIsDrawerOpen(true);
                    }}
                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Preview Drawer
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(tmpl)}
                      title="Duplicate Template"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleUseInCampaign(tmpl)}
                      disabled={!isApproved}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      Use
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="font-bold text-slate-700">No Templates Found</h4>
            <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
          </div>
        )}
      </div>

        {/* SLIDEOUT PREVIEW DRAWER */}
      {isDrawerOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Template Details</h3>
                <p className="text-[11px] text-slate-500">{selectedTemplate.name}</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Metadata badge group */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                  <span className="font-bold text-slate-800 uppercase">
                    {selectedTemplate.category}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">STATUS</span>
                  <span className="font-bold text-emerald-700">{selectedTemplate.status}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">LANGUAGE</span>
                  <span className="font-bold text-slate-800">{selectedTemplate.language}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">QUALITY</span>
                  <span className="font-bold text-emerald-700">
                    {selectedTemplate.qualityRating || 'High'}
                  </span>
                </div>
              </div>

              {/* WhatsApp Bubble Preview */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 text-[11px]">Customer Chat Preview:</span>
                <div className="bg-[#ECE5DD] p-3 rounded-2xl border border-slate-300">
                  <div className="bg-white rounded-xl shadow-xs p-3 space-y-2 text-slate-800 border border-slate-200/80">
                    {selectedTemplate.headerType === 'IMAGE' && selectedTemplate.headerContent && (
                      <img
                        src={selectedTemplate.headerContent}
                        alt="Header"
                        className="rounded-lg w-full aspect-video object-cover"
                      />
                    )}
                    <div className="whitespace-pre-line leading-relaxed text-[12px]">
                      {selectedTemplate.bodyText}
                    </div>
                    {selectedTemplate.footerText && (
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        {selectedTemplate.footerText}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400">
                      <span>10:45 AM</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                    </div>

                    {selectedTemplate.buttons && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        {selectedTemplate.buttons.map((btn, i) => (
                          <div
                            key={i}
                            className="py-1 text-center font-bold text-emerald-600 bg-slate-50 rounded border border-slate-200 text-[11px]"
                          >
                            {btn.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Official Meta note */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  This template is registered under WhatsApp Business Account ID{' '}
                  <code className="font-bold">WABA-QIYAM-2026</code>. Template edits require
                  re-approval by Meta.
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <a
                href="https://business.facebook.com/wa/manage/message-templates/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View in Meta Manager <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleUseInCampaign(selectedTemplate)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Use in Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEMPLATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create WhatsApp Message Template</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Template Name (Lowercase, no spaces)
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. festive_offer_december"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Category</label>
                  <select
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  >
                    <option value="marketing">Marketing (Promotional)</option>
                    <option value="utility">Utility (Transactional)</option>
                    <option value="authentication">Authentication (OTP)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Language</label>
                  <select
                    value={newTemplateLang}
                    onChange={(e) => setNewTemplateLang(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  >
                    <option value="en_US">English (US)</option>
                    <option value="hi_IN">Hindi (India)</option>
                    <option value="ar_SA">Arabic (Saudi Arabia)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Body Text (Use {'{{1}}'}, {'{{2}}'} for variables)
                </label>
                <textarea
                  rows={4}
                  value={newTemplateBody}
                  onChange={(e) => setNewTemplateBody(e.target.value)}
                  placeholder="Hello {{1}}, our seasonal special is here! Enjoy 20% off with code {{2}}..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Submit to Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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
  File,
  Download,
  Upload,
  Image as ImageIcon,
  Video,
  Paperclip,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkTemplateItem } from '../../../types';
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';

const PRESET_MEDIA_OPTIONS = [
  {
    name: 'Qiyam_Comprehensive_Service_Catalog.pdf',
    type: 'DOCUMENT' as const,
    size: '2.4 MB',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    label: '📄 Corporate Service Catalog (PDF - 2.4 MB)',
  },
  {
    name: 'AC_Maintenance_Annual_Contract_Rates.pdf',
    type: 'DOCUMENT' as const,
    size: '1.8 MB',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    label: '📄 AMC Maintenance Rate Card (PDF - 1.8 MB)',
  },
  {
    name: 'Festive_Special_Mega_Discount.jpg',
    type: 'IMAGE' as const,
    size: '420 KB',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
    label: '🖼️ Festive Discount Flyer (Image - 420 KB)',
  },
  {
    name: 'Qiyam_Services_Showcase.mp4',
    type: 'VIDEO' as const,
    size: '8.5 MB',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    label: '🎬 Service Showcase Promo (Video - 8.5 MB)',
  },
];

export const BulkTemplatesView: React.FC = () => {
  const {
    bulkTemplates,
    createBulkTemplate,
    updateBulkTemplateStatus,
    duplicateCampaign,
    setActiveTab,
    addToast,
  } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<BulkTemplateItem | null>(
    bulkTemplates[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Template Modal state with Media Header Support
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<
    'marketing' | 'utility' | 'authentication'
  >('marketing');
  const [newTemplateLang, setNewTemplateLang] = useState('en_US');
  const [newTemplateHeaderType, setNewTemplateHeaderType] = useState<
    'NONE' | 'DOCUMENT' | 'IMAGE' | 'VIDEO'
  >('DOCUMENT');
  const [newTemplateHeaderContent, setNewTemplateHeaderContent] = useState(
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  );
  const [newTemplateHeaderFileName, setNewTemplateHeaderFileName] = useState(
    'Qiyam_Comprehensive_Service_Catalog.pdf'
  );
  const [newTemplateHeaderFileSize, setNewTemplateHeaderFileSize] = useState('2.4 MB');
  const [newTemplateBody, setNewTemplateBody] = useState(
    'Hello {{1}},\n\nAttached is our official corporate catalog & maintenance service guide for {{2}}.\n\nReview the brochure and reply to this message to claim your 25% corporate discount.\n\nBest regards,\n{{3}}'
  );
  const [newTemplateFooter, setNewTemplateFooter] = useState(
    'CoolFix Facilities • Reply STOP to opt out'
  );
  const [button1Text, setButton1Text] = useState('Download Brochure');
  const [button2Text, setButton2Text] = useState('Book Inspection');

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setNewTemplateHeaderFileName(file.name);
    setNewTemplateHeaderFileSize(`${sizeInMB} MB`);

    if (file.type.includes('pdf')) {
      setNewTemplateHeaderType('DOCUMENT');
      setNewTemplateHeaderContent(URL.createObjectURL(file));
      addToast(`Attached PDF Document: "${file.name}" (${sizeInMB} MB)`, 'info');
    } else if (file.type.includes('image')) {
      setNewTemplateHeaderType('IMAGE');
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewTemplateHeaderContent(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      addToast(`Attached Image Header: "${file.name}"`, 'info');
    } else if (file.type.includes('video')) {
      setNewTemplateHeaderType('VIDEO');
      setNewTemplateHeaderContent(URL.createObjectURL(file));
      addToast(`Attached Video Header: "${file.name}"`, 'info');
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_MEDIA_OPTIONS)[0]) => {
    setNewTemplateHeaderType(preset.type);
    setNewTemplateHeaderFileName(preset.name);
    setNewTemplateHeaderFileSize(preset.size);
    setNewTemplateHeaderContent(preset.url);
    addToast(`Selected media preset: ${preset.name}`, 'info');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !newTemplateBody.trim()) {
      addToast('Please provide both template name and message body', 'error');
      return;
    }

    const buttons = [];
    if (button1Text.trim()) {
      buttons.push({ type: 'URL', text: button1Text.trim() });
    }
    if (button2Text.trim()) {
      buttons.push({ type: 'QUICK_REPLY', text: button2Text.trim() });
    }

    createBulkTemplate({
      name: newTemplateName.trim().toLowerCase().replace(/\s+/g, '_'),
      category: newTemplateCategory,
      language: newTemplateLang,
      bodyText: newTemplateBody,
      headerType: newTemplateHeaderType,
      headerContent: newTemplateHeaderContent,
      headerFileName:
        newTemplateHeaderType === 'DOCUMENT' ? newTemplateHeaderFileName : undefined,
      headerFileSize:
        newTemplateHeaderType === 'DOCUMENT' ? newTemplateHeaderFileSize : undefined,
      footerText: newTemplateFooter.trim() || undefined,
      buttons,
    });

    setIsCreateOpen(false);
    setNewTemplateName('');
    addToast(
      'Template submitted to Meta Graph API for review! Automated review callback will approve it in ~8s.',
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
      headerFileName: tmpl.headerFileName,
      headerFileSize: tmpl.headerFileSize,
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
                      {isPending && <Clock className="w-3 h-3 animate-spin" />}
                      {tmpl.status}
                    </span>
                  </div>

                  {/* Category & Quality */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                      {tmpl.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Quality: {tmpl.qualityRating || 'High'}
                    </span>
                  </div>

                  {/* Media Header Badge / Preview */}
                  {tmpl.headerType === 'DOCUMENT' && (
                    <div className="mb-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                          PDF
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-800 text-[11px] truncate">
                            {tmpl.headerFileName || 'Attached_Brochure.pdf'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {tmpl.headerFileSize || '2.4 MB'} • Media Header
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md shrink-0">
                        PDF
                      </span>
                    </div>
                  )}

                  {tmpl.headerType === 'IMAGE' && tmpl.headerContent && (
                    <div className="mb-2.5 rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                      <img
                        src={tmpl.headerContent}
                        alt="Header"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {tmpl.headerType === 'VIDEO' && (
                    <div className="mb-2.5 p-2 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2 text-xs">
                      <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-indigo-900 text-[11px]">
                        Video Attachment Header (MP4)
                      </span>
                    </div>
                  )}

                  {/* Body preview snippet */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed line-clamp-3 mb-2 font-mono text-[11px]">
                    {tmpl.bodyText}
                  </div>

                  {/* Pending Review Notice & Quick Approval Button */}
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => updateBulkTemplateStatus(tmpl.id, 'APPROVED')}
                      className="mt-1 mb-2 w-full py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[10px] rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      title="Simulate Meta WhatsApp Graph API Webhook Approval"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      ⚡ Instant Approve (Meta Webhook)
                    </button>
                  )}
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
                  <span
                    className={`font-bold ${
                      selectedTemplate.status === 'APPROVED'
                        ? 'text-emerald-700'
                        : selectedTemplate.status === 'PENDING'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {selectedTemplate.status}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">HEADER TYPE</span>
                  <span className="font-bold text-slate-800">
                    {selectedTemplate.headerType || 'NONE'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">QUALITY RATING</span>
                  <span className="font-bold text-emerald-700">
                    {selectedTemplate.qualityRating || 'High'}
                  </span>
                </div>
              </div>

              {/* Instant Approval in Drawer if Pending */}
              {selectedTemplate.status === 'PENDING' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Under Meta WhatsApp Review</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    This template was submitted to Meta Cloud API. Typically takes 2-15 minutes, or
                    test immediately using instant simulation below.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      updateBulkTemplateStatus(selectedTemplate.id, 'APPROVED');
                      setSelectedTemplate({
                        ...selectedTemplate,
                        status: 'APPROVED',
                        meta_status: 'APPROVED',
                      });
                    }}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Simulate Meta Approval Webhook
                  </button>
                </div>
              )}

              {/* WhatsApp Bubble Preview */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 text-[11px]">Customer Chat Preview:</span>
                <div className="bg-[#ECE5DD] p-3 rounded-2xl border border-slate-300">
                  <div className="bg-white rounded-xl shadow-xs p-3 space-y-2 text-slate-800 border border-slate-200/80">
                    {/* DOCUMENT (PDF) Header */}
                    {selectedTemplate.headerType === 'DOCUMENT' && (
                      <div className="rounded-xl bg-[#005c4b]/10 border border-emerald-300/40 p-2.5 flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                            PDF
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                              {selectedTemplate.headerFileName || 'Official_Document.pdf'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {selectedTemplate.headerFileSize || '2.4 MB'} • PDF Document
                            </div>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    {/* IMAGE Header */}
                    {selectedTemplate.headerType === 'IMAGE' && selectedTemplate.headerContent && (
                      <img
                        src={selectedTemplate.headerContent}
                        alt="Header"
                        className="rounded-lg w-full aspect-video object-cover"
                      />
                    )}

                    {/* VIDEO Header */}
                    {selectedTemplate.headerType === 'VIDEO' && (
                      <div className="rounded-xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center text-white mb-2">
                        <Video className="w-8 h-8 text-white/80" />
                      </div>
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

                    {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
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
                disabled={selectedTemplate.status !== 'APPROVED'}
                className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 ${
                  selectedTemplate.status === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Use in Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEMPLATE MODAL WITH MEDIA HEADER SUPPORT */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-emerald-200 border border-emerald-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Create Pre-Approved WhatsApp Template</h3>
                  <p className="text-[11px] text-emerald-200">
                    Configure document (PDF), image, or video media headers with Meta compliance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto"
            >
              {/* LEFT: FORM FIELDS */}
              <div className="lg:col-span-7 p-5 space-y-4 text-xs border-r border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Template Name (Lowercase, underscores only)
                  </label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g. corporate_catalog_brochure"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden font-semibold"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden font-semibold"
                    >
                      <option value="en_US">English (US)</option>
                      <option value="hi_IN">Hindi (India)</option>
                      <option value="ar_SA">Arabic (Saudi Arabia)</option>
                    </select>
                  </div>
                </div>

                {/* HEADER MEDIA SELECTOR */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-900 text-xs">
                      Template Header Media (PDF, Image, Video)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Meta Rich Media
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { type: 'NONE' as const, label: 'None', icon: MessageSquare },
                      { type: 'DOCUMENT' as const, label: 'PDF Document', icon: File },
                      { type: 'IMAGE' as const, label: 'Image', icon: ImageIcon },
                      { type: 'VIDEO' as const, label: 'Video', icon: Video },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setNewTemplateHeaderType(item.type)}
                        className={`py-2 px-1.5 rounded-xl border font-bold text-[11px] transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                          newTemplateHeaderType === item.type
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {newTemplateHeaderType !== 'NONE' && (
                    <div className="space-y-2 pt-1">
                      {/* Upload / File select */}
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-[11px] font-semibold text-slate-700 cursor-pointer transition shadow-xs">
                          <Upload className="w-3 h-3 text-slate-500" />
                          <span>Upload {newTemplateHeaderType === 'DOCUMENT' ? 'PDF' : newTemplateHeaderType}</span>
                          <input
                            type="file"
                            accept={
                              newTemplateHeaderType === 'DOCUMENT'
                                ? '.pdf,application/pdf'
                                : newTemplateHeaderType === 'IMAGE'
                                ? 'image/*'
                                : 'video/*'
                            }
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>

                        <div className="text-[11px] text-slate-600 font-medium truncate flex-1">
                          {newTemplateHeaderFileName} ({newTemplateHeaderFileSize})
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                          Or Choose a Verified Preset:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_MEDIA_OPTIONS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectPreset(preset)}
                              className={`text-[10px] px-2 py-1 rounded-lg border transition cursor-pointer ${
                                newTemplateHeaderFileName === preset.name
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body Text */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-800">
                      Body Message Text
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Use {'{{1}}'}, {'{{2}}'}, {'{{3}}'} for variables
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={newTemplateBody}
                    onChange={(e) => setNewTemplateBody(e.target.value)}
                    placeholder="Hello {{1}}, our seasonal special is here..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Footer Text */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Footer Text (Optional, max 60 chars)
                  </label>
                  <input
                    type="text"
                    value={newTemplateFooter}
                    maxLength={60}
                    onChange={(e) => setNewTemplateFooter(e.target.value)}
                    placeholder="e.g. Reply STOP to unsubscribe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                {/* Interactive Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Button 1 (URL Call-to-Action)
                    </label>
                    <input
                      type="text"
                      value={button1Text}
                      onChange={(e) => setButton1Text(e.target.value)}
                      placeholder="e.g. Download Brochure"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Button 2 (Quick Reply)
                    </label>
                    <input
                      type="text"
                      value={button2Text}
                      onChange={(e) => setButton2Text(e.target.value)}
                      placeholder="e.g. Book Inspection"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
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
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit to Meta for Review
                  </button>
                </div>
              </div>

              {/* RIGHT: LIVE SMARTPHONE WHATSAPP PREVIEW */}
              <div className="lg:col-span-5 p-5 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Live WhatsApp Preview
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Customer Screen</span>
                  </div>

                  {/* Phone frame */}
                  <div className="rounded-2xl border-4 border-slate-800 bg-[#ECE5DD] p-3 shadow-md max-w-xs mx-auto overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#075E54] text-white p-2 -m-3 mb-2.5 flex items-center gap-2 rounded-t-xl">
                      <div className="w-6 h-6 rounded-full bg-emerald-300 text-emerald-950 font-bold flex items-center justify-center text-[10px]">
                        Q
                      </div>
                      <div>
                        <div className="font-bold text-[11px] leading-tight">Qiyam Business Solutions</div>
                        <div className="text-[8px] text-emerald-200">Official Business Account</div>
                      </div>
                    </div>

                    {/* Chat bubble */}
                    <div className="bg-white rounded-xl shadow-xs p-3 space-y-2 text-slate-800 border border-slate-200">
                      {/* Media Header Preview */}
                      {newTemplateHeaderType === 'DOCUMENT' && (
                        <div className="rounded-xl bg-[#005c4b]/10 border border-emerald-300/50 p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-extrabold text-[10px] shrink-0">
                              PDF
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-slate-900 text-[11px] truncate max-w-[140px]">
                                {newTemplateHeaderFileName}
                              </div>
                              <div className="text-[9px] text-slate-500">
                                {newTemplateHeaderFileSize} • PDF Document
                              </div>
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Download className="w-3 h-3" />
                          </div>
                        </div>
                      )}

                      {newTemplateHeaderType === 'IMAGE' && newTemplateHeaderContent && (
                        <div className="rounded-lg overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                          <img
                            src={newTemplateHeaderContent}
                            alt="Header"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {newTemplateHeaderType === 'VIDEO' && (
                        <div className="rounded-lg aspect-video bg-slate-900 flex items-center justify-center text-white">
                          <Video className="w-7 h-7 text-white/80" />
                        </div>
                      )}

                      {/* Body */}
                      <div className="whitespace-pre-line leading-relaxed text-[11px] text-slate-900">
                        {newTemplateBody
                          .replace(/\{\{1\}\}/g, 'Customer Name')
                          .replace(/\{\{2\}\}/g, 'Q3-2026')
                          .replace(/\{\{3\}\}/g, 'Team Qiyam')}
                      </div>

                      {/* Footer */}
                      {newTemplateFooter && (
                        <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-100">
                          {newTemplateFooter}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 text-[8px] text-slate-400">
                        <span>10:45 AM</span>
                        <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                      </div>

                      {/* Buttons */}
                      {(button1Text || button2Text) && (
                        <div className="pt-1.5 border-t border-slate-100 space-y-1">
                          {button1Text && (
                            <div className="py-1 text-center font-bold text-emerald-600 bg-slate-50 rounded border border-slate-200 text-[10px]">
                              {button1Text}
                            </div>
                          )}
                          {button2Text && (
                            <div className="py-1 text-center font-bold text-emerald-600 bg-slate-50 rounded border border-slate-200 text-[10px]">
                              {button2Text}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Automated Meta Review:</strong> Templates submitted here are parsed for
                    formatting and queued for Meta approval callback in real time.
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

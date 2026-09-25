import React, { useState, useEffect, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  ArrowLeft, Check, AlertCircle, Sparkles, Image, Video, FileText,
  Smartphone, Plus, Trash2, Globe, Phone, ExternalLink,
  Copy, Smile, Info, Send, CheckCheck, Save, RefreshCw, Paperclip, Mic, UploadCloud, X,
  GitBranch, Zap
} from 'lucide-react';
import { WhatsAppTemplateItem, WhatsAppTemplateButton } from '@/types';
import { SidebarToggle } from '../../layout/SidebarToggle';
import { AutoWorkflowModal } from './AutoWorkflowModal';
import { CountryPhoneInput } from '../../common/CountryPhoneInput';

const META_LANGUAGES = [
  { code: 'en_US', label: 'English (US)' },
  { code: 'en_GB', label: 'English (UK)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'ar', label: 'Arabic (العربية)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'pt_BR', label: 'Portuguese (Brazil)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
];

const POPULAR_EMOJIS = ['👋', '📅', '🛠️', '💰', '🔔', '✅', '📍', '📞', '📦', '🏷️', '💬', '⚡', '🎉', '🔥'];

export const CreateTemplateView: React.FC = () => {
  const {
    editingTemplate,
    setEditingTemplate,
    setActiveTab,
    saveMetaTemplate,
    submitTemplateToMeta,
    testSendTemplate,
    addToast
  } = useQiyamStore();

  // Form State
  const [name, setName] = useState('');
  const [metaCategory, setMetaCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('UTILITY');
  const [language, setLanguage] = useState('en_US');
  
  // Header
  const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'>('NONE');
  const [headerText, setHeaderText] = useState('');
  const [headerSample, setHeaderSample] = useState('');
  const [headerUrl, setHeaderUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800');

  // Body
  const [bodyText, setBodyText] = useState('');
  const [bodyVariables, setBodyVariables] = useState<Record<string, string>>({});

  // Footer
  const [footerText, setFooterText] = useState('');

  // Buttons
  const [buttons, setButtons] = useState<WhatsAppTemplateButton[]>([]);
  const [allowCategoryChange, setAllowCategoryChange] = useState(true);

  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTestSendModal, setShowTestSendModal] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('+91 98765 43210');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState<'sample' | 'raw'>('sample');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAutoWorkflowModalOpen, setIsAutoWorkflowModalOpen] = useState(false);

  const [mediaInputMode, setMediaInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (headerType === 'IMAGE') {
      if (!file.type.startsWith('image/')) {
        addToast('Please select a valid image file (JPG, PNG)', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image size exceeds Meta 5MB limit', 'error');
        return;
      }
    } else if (headerType === 'DOCUMENT') {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        addToast('Please select a PDF document file', 'error');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        addToast('Document exceeds Meta 100MB limit', 'error');
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setHeaderUrl(result);
      setUploadedFileName(file.name);
      addToast(`Sample ${headerType.toLowerCase()} attached successfully!`, 'success');
    };
    reader.onerror = () => {
      addToast('Failed to read selected file', 'error');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name || '');
      setMetaCategory(editingTemplate.meta_category || 'UTILITY');
      setLanguage(editingTemplate.language || 'en_US');
      setHeaderType(editingTemplate.header_type as any || 'NONE');
      setHeaderText(editingTemplate.header_text || '');
      setHeaderSample(editingTemplate.header_sample || '');
      setHeaderUrl(editingTemplate.header_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800');
      setBodyText(editingTemplate.body_text || editingTemplate.body || '');
      setBodyVariables(editingTemplate.body_variables || {});
      setFooterText(editingTemplate.footer_text || '');
      setButtons(editingTemplate.buttons || []);
      setAllowCategoryChange(editingTemplate.allow_category_change ?? true);
    } else {
      setName('service_booking_confirmed');
      setMetaCategory('UTILITY');
      setLanguage('en_US');
      setHeaderType('TEXT');
      setHeaderText('Booking Confirmed - {{1}}');
      setHeaderSample('CoolFix AC Services');
      setBodyText('Hello {{1}},\n\nYour service booking #{{2}} has been confirmed for {{3}} at {{4}}.\n\nTechnician: {{5}}\nEstimated Total: {{6}}.\n\nThank you for choosing CoolFix Services!');
      setBodyVariables({
        '1': 'Vikram Mehta',
        '2': 'SRV-8921',
        '3': 'Tomorrow, May 13',
        '4': '10:30 AM',
        '5': 'Ramesh Kumar',
        '6': '₹2,800'
      });
      setFooterText('CoolFix Services • Certified & Guaranteed');
      setButtons([
        { type: 'QUICK_REPLY', text: 'Reschedule' },
        { type: 'URL', text: 'Track Technician', url: 'https://coolfix.in/track/{{1}}', url_sample: 'SRV8921' },
        { type: 'PHONE_NUMBER', text: 'Call Helpline', phone_number: '+919876543210' }
      ]);
    }
  }, [editingTemplate]);

  // Detect variables in body
  useEffect(() => {
    const regex = /\{\{(\d+)\}\}/g;
    let match;
    const detected: string[] = [];
    while ((match = regex.exec(bodyText)) !== null) {
      if (!detected.includes(match[1])) {
        detected.push(match[1]);
      }
    }
    detected.sort((a, b) => parseInt(a) - parseInt(b));

    setBodyVariables(prev => {
      const updated: Record<string, string> = {};
      detected.forEach((idx, i) => {
        updated[idx] = prev[idx] || (
          i === 0 ? 'Vikram Mehta' :
          i === 1 ? 'AC Service' :
          i === 2 ? 'May 15, 2024' :
          i === 3 ? '10:30 AM' :
          `Sample Value ${idx}`
        );
      });
      return updated;
    });
  }, [bodyText]);

  const handleAddVariable = () => {
    const regex = /\{\{(\d+)\}\}/g;
    let maxNum = 0;
    let match;
    while ((match = regex.exec(bodyText)) !== null) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
    const nextVar = `{{${maxNum + 1}}}`;

    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = bodyText.substring(0, start) + nextVar + bodyText.substring(end);
      setBodyText(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + nextVar.length, start + nextVar.length);
        }
      }, 50);
    } else {
      setBodyText(prev => prev + ` ${nextVar}`);
    }
  };

  const applyFormatting = (wrapper: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = bodyText.substring(start, end);

    if (selected) {
      const formatted = `${wrapper}${selected}${wrapper}`;
      const newText = bodyText.substring(0, start) + formatted + bodyText.substring(end);
      setBodyText(newText);
    } else {
      const placeholder = wrapper === '`' ? '`code`' : `${wrapper}text${wrapper}`;
      const newText = bodyText.substring(0, start) + placeholder + bodyText.substring(end);
      setBodyText(newText);
    }
  };

  const handleAddButton = (type: WhatsAppTemplateButton['type']) => {
    if (buttons.length >= 10) return;
    if (type === 'QUICK_REPLY') {
      setButtons(prev => [...prev, { type: 'QUICK_REPLY', text: 'Quick Reply' }]);
    } else if (type === 'URL') {
      setButtons(prev => [...prev, { type: 'URL', text: 'Visit Website', url: 'https://coolfix.in/track' }]);
    } else if (type === 'PHONE_NUMBER') {
      setButtons(prev => [...prev, { type: 'PHONE_NUMBER', text: 'Call Us', phone_number: '+919876543210' }]);
    } else if (type === 'COPY_CODE') {
      setButtons(prev => [...prev, { type: 'COPY_CODE', text: 'Copy Code', code: 'OFFER2026' }]);
    }
  };

  const handleRemoveButton = (index: number) => {
    setButtons(prev => prev.filter((_, i) => i !== index));
  };

  const validateTemplate = (): string | null => {
    if (!name.trim()) return 'Template name is required.';
    if (!/^[a-z0-9_]+$/.test(name)) {
      return 'Template name can only contain lowercase letters, numbers, and underscores (e.g. "service_booking_reminder").';
    }
    if (!bodyText.trim()) return 'Template body text is required.';
    if (bodyText.length > 1024) return 'Body text cannot exceed 1024 characters.';

    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    const nums = matches.map(m => parseInt(m.replace(/[{}]/g, '')));
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] !== i + 1) {
        return `Variables must be sequential starting with {{1}}. Found out-of-order variable {{${nums[i]}}}.`;
      }
    }

    if (headerType === 'TEXT' && headerText.length > 60) return 'Header text cannot exceed 60 characters.';
    if (headerType === 'IMAGE' && !headerUrl) {
      return 'Please upload a sample image thumbnail or provide an image URL for the IMAGE header.';
    }
    if (footerText && footerText.length > 60) return 'Footer text cannot exceed 60 characters.';
    return null;
  };

  const buildPayload = (): Partial<WhatsAppTemplateItem> => {
    return {
      ...(editingTemplate?.id ? { id: editingTemplate.id } : {}),
      name: name.trim().toLowerCase(),
      category: metaCategory === 'MARKETING' ? 'Sales & Marketing' : metaCategory === 'UTILITY' ? 'Customer Updates' : 'Security & Auth',
      meta_category: metaCategory,
      language,
      header_type: headerType,
      header_text: headerText,
      header_sample: headerSample,
      header_url: headerUrl,
      body: bodyText,
      body_text: bodyText,
      body_variables: bodyVariables,
      footer_text: footerText,
      buttons,
      allow_category_change: allowCategoryChange,
      meta_status: 'PENDING',
      status: 'Active',
      author: 'Qiyam Admin',
      last_updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const handleSubmit = async () => {
    const err = validateTemplate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const saved = await saveMetaTemplate(payload);
      if (saved && saved.id) {
        const success = await submitTemplateToMeta(saved.id);
        if (success) {
          addToast('Template submitted to Meta Graph API for review!', 'success');
          setEditingTemplate(null);
          setActiveTab('template-hub');
        } else {
          setValidationError('Meta rejected the template submission. Please review the error message above.');
        }
      }
    } catch (e: any) {
      addToast(`Submission error: ${e.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const payload = buildPayload();
    payload.meta_status = 'DRAFT';
    payload.status = 'Draft';
    await saveMetaTemplate(payload);
    addToast('Template saved as Draft', 'success');
    setEditingTemplate(null);
    setActiveTab('template-hub');
  };

  const renderPreviewBody = () => {
    let rendered = bodyText;
    if (previewMode === 'sample') {
      Object.keys(bodyVariables).forEach(k => {
        const val = bodyVariables[k] || `{{${k}}}`;
        rendered = rendered.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), val);
      });
    }

    const lines = rendered.split('\n');
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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full min-h-0 overflow-hidden font-sans">
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <button
            onClick={() => {
              setEditingTemplate(null);
              setActiveTab('template-hub');
            }}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1.5 font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Template Hub</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <h1 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>{editingTemplate ? 'Edit Meta Template' : 'Create Custom Meta Template'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Graph API v21.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Design message format, variables, sample values, and buttons.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const err = validateTemplate();
              if (err) {
                setValidationError(err);
                addToast(err, 'warning');
                return;
              }
              setValidationError(null);
              setIsAutoWorkflowModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            title="Auto-build an interactive WhatsApp flowchart based on this template data"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>⚡ Auto-Build Workflow</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTestSendModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-slate-600" />
            <span>Test Send</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-emerald-700/20 active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting to Meta...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Submit to Meta API</span>
              </>
            )}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Split Layout: Left Form (60%) + Right Live Smartphone Screen (40%) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: TEMPLATE BUILDER FORM (SCROLLABLE) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-700 border-r border-slate-200">
          {/* Template Name */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1">
                <span>Template Name</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{name.length}/512</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. ac_service_booking_confirmed"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Only lowercase letters, numbers, and underscores are allowed. No spaces or special characters.
            </p>
          </div>

          {/* Category */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <label className="font-bold text-slate-900 text-xs block">
              Template Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMetaCategory('UTILITY')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  metaCategory === 'UTILITY'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">⚙️ Utility</span>
                  {metaCategory === 'UTILITY' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500">Order updates, booking confirmations, invoices.</p>
              </button>

              <button
                type="button"
                onClick={() => setMetaCategory('MARKETING')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  metaCategory === 'MARKETING'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">🏷️ Marketing</span>
                  {metaCategory === 'MARKETING' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500">Discounts, offers, welcome & promotional messages.</p>
              </button>

              <button
                type="button"
                onClick={() => setMetaCategory('AUTHENTICATION')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  metaCategory === 'AUTHENTICATION'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">🔐 Authentication</span>
                  {metaCategory === 'AUTHENTICATION' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500">OTP passcodes and account verification codes.</p>
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <label className="font-bold text-slate-900 text-xs block">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
            >
              {META_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          {/* Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Header (Optional)</h4>
                <p className="text-[11px] text-slate-400">Add a title or media asset to your message.</p>
              </div>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {(['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setHeaderType(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      headerType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {headerType === 'TEXT' && (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">Header Text (Max 60 chars)</span>
                  <button
                    type="button"
                    onClick={() => setHeaderText(prev => prev ? `${prev} {{1}}` : '{{1}}')}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Variable {'{{1}}'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="e.g. Booking Confirmed - {{1}}"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
                {headerText.includes('{{1}}') && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Sample value for header variable {'{{1}}'}:
                    </label>
                    <input
                      type="text"
                      value={headerSample}
                      onChange={(e) => setHeaderSample(e.target.value)}
                      placeholder="e.g. CoolFix AC Services"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            {headerType === 'IMAGE' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block">Header Thumbnail Sample</span>
                    <span className="text-[10px] text-slate-400">Required by Meta for template review</span>
                  </div>
                  <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMediaInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        mediaInputMode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaInputMode('url')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        mediaInputMode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {mediaInputMode === 'upload' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {headerUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={headerUrl}
                            alt="Sample preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {uploadedFileName || 'Thumbnail Image Attached'}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Ready for Meta Resumable Upload</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline"
                            >
                              Replace File
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                setHeaderUrl('');
                                setUploadedFileName('');
                              }}
                              className="text-[11px] font-bold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white rounded-xl text-center cursor-pointer transition-all hover:bg-emerald-50/20 group"
                      >
                        <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 mx-auto mb-1.5 transition-colors" />
                        <span className="text-xs font-bold text-slate-800 block">
                          Click to upload sample image thumbnail
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          JPEG or PNG format, max 5MB (Meta Cloud API requirement)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      value={headerUrl}
                      onChange={(e) => setHeaderUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or public image URL"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <p className="text-[10px] text-slate-500">
                      Our backend will download the image and upload it to Meta's Resumable Upload API automatically.
                    </p>
                  </div>
                )}
              </div>
            )}

            {headerType === 'DOCUMENT' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700">
                  Sample PDF Document
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={headerUrl}
                    onChange={(e) => setHeaderUrl(e.target.value)}
                    placeholder="https://example.com/sample.pdf or upload below"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload PDF</span>
                  </button>
                </div>
                {uploadedFileName && (
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    Attached: {uploadedFileName}
                  </p>
                )}
              </div>
            )}

            {headerType === 'VIDEO' && (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700">
                  Sample Video URL (MP4)
                </label>
                <input
                  type="url"
                  value={headerUrl}
                  onChange={(e) => setHeaderUrl(e.target.value)}
                  placeholder="https://example.com/sample-video.mp4"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                  <span>Body</span>
                  <span className="text-red-500">*</span>
                </h4>
                <p className="text-[11px] text-slate-400">Enter text with formatting and variables e.g. {"{{1}}"}.</p>
              </div>
              <span className="text-[11px] text-slate-400">{bodyText.length}/1024</span>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center justify-between p-1.5 bg-slate-100 rounded-t-xl border border-b-0 border-slate-200">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyFormatting('*')}
                  title="Bold (*text*)"
                  className="w-7 h-7 rounded bg-white hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center border border-slate-200"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('_')}
                  title="Italic (_text_)"
                  className="w-7 h-7 rounded bg-white hover:bg-slate-200 text-slate-800 italic font-bold text-xs flex items-center justify-center border border-slate-200"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('~')}
                  title="Strikethrough (~text~)"
                  className="w-7 h-7 rounded bg-white hover:bg-slate-200 text-slate-800 line-through font-bold text-xs flex items-center justify-center border border-slate-200"
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('`')}
                  title="Monospace (`code`)"
                  className="w-7 h-7 rounded bg-white hover:bg-slate-200 text-slate-800 font-mono text-[10px] flex items-center justify-center border border-slate-200"
                >
                  &lt;/&gt;
                </button>
                <div className="h-4 w-px bg-slate-300 mx-1" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 text-xs flex items-center gap-1 border border-slate-200"
                  >
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    <span>Emoji</span>
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-8 left-0 z-20 bg-white p-2.5 rounded-xl shadow-xl border border-slate-200 grid grid-cols-7 gap-1.5 w-56">
                      {POPULAR_EMOJIS.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            setBodyText(prev => prev + em);
                            setShowEmojiPicker(false);
                          }}
                          className="w-7 h-7 rounded hover:bg-slate-100 text-sm flex items-center justify-center"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddVariable}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variable</span>
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={6}
              maxLength={1024}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Write your message here..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-b-xl text-xs text-slate-900 leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Mandatory Variable Sample Values */}
          {Object.keys(bodyVariables).length > 0 && (
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-amber-950 text-xs">Variable Sample Values (Meta Requirement)</h5>
                  <p className="text-[11px] text-amber-800">
                    Provide realistic sample values for each variable. Meta verifies these samples during approval.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-amber-200/60">
                {Object.keys(bodyVariables).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-16 px-2 py-1 bg-amber-100 text-amber-900 font-mono font-bold rounded-lg text-center shrink-0">
                      {`{{${key}}}`}
                    </span>
                    <input
                      type="text"
                      value={bodyVariables[key]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBodyVariables(prev => ({ ...prev, [key]: val }));
                      }}
                      placeholder={`Sample value for {{${key}}}`}
                      className="flex-1 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs">Footer (Optional)</label>
              <span className="text-[11px] text-slate-400">{footerText.length}/60</span>
            </div>
            <input
              type="text"
              maxLength={60}
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="e.g. Reply STOP to unsubscribe"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Interactive Buttons */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Buttons ({buttons.length}/10)</h4>
                <p className="text-[11px] text-slate-400">Add Quick Replies, Call To Action, or Coupon Code.</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddButton('QUICK_REPLY')}
                  disabled={buttons.length >= 10}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Quick Reply</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddButton('URL')}
                  disabled={buttons.length >= 10}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Website URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddButton('PHONE_NUMBER')}
                  disabled={buttons.length >= 10}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddButton('COPY_CODE')}
                  disabled={buttons.length >= 10}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </button>
              </div>
            </div>

            {buttons.map((btn, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{btn.type.replace('_', ' ')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveButton(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    maxLength={25}
                    value={btn.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setButtons(prev => prev.map((b, i) => i === idx ? { ...b, text: val } : b));
                    }}
                    placeholder="Button Text"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />

                  {btn.type === 'URL' && (
                    <input
                      type="url"
                      value={btn.url || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setButtons(prev => prev.map((b, i) => i === idx ? { ...b, url: val } : b));
                      }}
                      placeholder="https://coolfix.in/track/{{1}}"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  )}

                  {btn.type === 'PHONE_NUMBER' && (
                    <div className="w-56">
                      <CountryPhoneInput
                        size="sm"
                        value={btn.phone_number || ''}
                        onChange={(val) => {
                          setButtons(prev => prev.map((b, i) => i === idx ? { ...b, phone_number: val } : b));
                        }}
                        placeholder="Phone number"
                      />
                    </div>
                  )}

                  {btn.type === 'COPY_CODE' && (
                    <input
                      type="text"
                      value={btn.code || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setButtons(prev => prev.map((b, i) => i === idx ? { ...b, code: val } : b));
                      }}
                      placeholder="OFFER2026"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE SMARTPHONE PREVIEW */}
        <div className="w-full lg:w-[410px] xl:w-[440px] bg-slate-100 p-4 sm:p-6 flex flex-col items-center justify-start border-t lg:border-t-0 lg:border-l border-slate-200 shrink-0 select-none overflow-y-auto h-full min-h-0">
          <div className="w-full flex items-center justify-between mb-3 text-xs shrink-0">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Real-time WhatsApp Preview</span>
            </span>
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

          {/* Smartphone Frame */}
          <div className="w-[320px] sm:w-[340px] flex-1 min-h-[460px] max-h-[640px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-white/20 shrink-0">
            {/* Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-2" />
            </div>

            {/* Screen */}
            <div className="flex-1 bg-[#EFEAE2] rounded-[30px] flex flex-col overflow-hidden relative">
              {/* WhatsApp Top Header */}
              <div className="bg-[#075E54] text-white pt-7 pb-2.5 px-3 flex items-center gap-2 shadow-md shrink-0 z-10">
                <ArrowLeft className="w-4 h-4 text-white/80" />
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                  CF
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-xs truncate">CoolFix Services</h4>
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  </div>
                  <p className="text-[9px] text-white/70">Official Business Account</p>
                </div>
              </div>

              {/* Chat Bubble Area */}
              <div
                className="flex-1 p-3 pb-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-transparent space-y-2 flex flex-col justify-start"
                style={{
                  backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              >
                <div className="bg-white rounded-2xl rounded-tl-none shadow-md border border-slate-200/60 overflow-hidden w-full max-w-[290px]">
                  {/* Header */}
                  {headerType === 'TEXT' && headerText && (
                    <div className="p-3 pb-1 font-bold text-xs text-slate-900">
                      {previewMode === 'sample' && headerText.includes('{{1}}')
                        ? headerText.replace('{{1}}', headerSample || 'Sample Header')
                        : headerText}
                    </div>
                  )}

                  {['IMAGE', 'VIDEO'].includes(headerType) && (
                    <div className="relative h-32 bg-slate-200 overflow-hidden">
                      <img
                        src={headerUrl}
                        alt="Template Header Media"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800';
                        }}
                      />
                    </div>
                  )}

                  {headerType === 'DOCUMENT' && (
                    <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 truncate">Proposal.pdf</span>
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-3 text-[11px] text-slate-800 space-y-1">
                    {renderPreviewBody()}
                  </div>

                  {/* Footer */}
                  {footerText && (
                    <div className="px-3 pb-1 text-[9px] text-slate-400 font-medium">
                      {footerText}
                    </div>
                  )}

                  {/* Timestamp & Read Ticks */}
                  <div className="px-3 pb-2 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                    <span>10:30 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>

                  {/* Buttons */}
                  {buttons.length > 0 && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/50">
                      {buttons.map((b, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full py-2.5 px-3 text-[11px] font-bold text-[#00a884] hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shrink-0"
                        >
                          {b.type === 'URL' && <ExternalLink className="w-3 h-3 text-[#00a884]" />}
                          {b.type === 'PHONE_NUMBER' && <Phone className="w-3 h-3 text-[#00a884]" />}
                          {b.type === 'COPY_CODE' && <Copy className="w-3 h-3 text-[#00a884]" />}
                          <span>{b.text || 'Button'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Mini Bottom Bar / Chat Input Simulation */}
              <div className="p-2 bg-[#F0F2F5] border-t border-slate-200 flex items-center gap-1.5 shrink-0 z-10">
                <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center gap-2 border border-slate-200/70 shadow-2xs">
                  <Smile className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] text-slate-400 truncate">Message</span>
                  <Paperclip className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
                </div>
                <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Mic className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Auto Workflow Studio Card */}
          <div className="w-[340px] mt-4 p-3.5 bg-white border border-emerald-200/90 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Auto Workflow Builder</span>
              </span>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Data-Driven
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Transform this template into a fully wired interactive WhatsApp chatbot with auto-routing branches.
            </p>
            <button
              type="button"
              onClick={() => {
                const err = validateTemplate();
                if (err) {
                  setValidationError(err);
                  addToast(err, 'warning');
                  return;
                }
                setValidationError(null);
                setIsAutoWorkflowModalOpen(true);
              }}
              className="w-full py-2 px-3 bg-[#0B3B2C] hover:bg-[#072B1F] active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>⚡ Generate Workflow Flowchart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Send Modal */}
      {showTestSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Send Test WhatsApp Message</h3>
              <button onClick={() => setShowTestSendModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-slate-500 text-[11px]">
              Enter your WhatsApp number to test how this template renders on your phone.
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
                  const res = await testSendTemplate(editingTemplate?.id || 1, testPhoneNumber, bodyVariables);
                  if (res && res.success) {
                    addToast(res.message || `Test template delivered to ${testPhoneNumber}`, 'success');
                    setShowTestSendModal(false);
                  } else {
                    addToast(res?.error || `Failed to deliver template to ${testPhoneNumber}`, 'error');
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

      {/* Auto Workflow Builder Modal */}
      {isAutoWorkflowModalOpen && (
        <AutoWorkflowModal
          isOpen={isAutoWorkflowModalOpen}
          onClose={() => setIsAutoWorkflowModalOpen(false)}
          template={buildPayload()}
        />
      )}
    </div>
  );
};

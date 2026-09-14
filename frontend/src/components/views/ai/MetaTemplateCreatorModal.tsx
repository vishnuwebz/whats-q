import React, { useState, useEffect, useRef } from 'react';
import {
  X, Check, AlertCircle, Sparkles, Image, Video, FileText,
  Smartphone, Plus, Trash2, Globe, Phone, ExternalLink,
  Copy, Smile, Info, ArrowLeft, Send, CheckCheck, HelpCircle,
  ChevronDown
} from 'lucide-react';
import { WhatsAppTemplateItem, WhatsAppTemplateButton } from '@/types';

interface MetaTemplateCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: WhatsAppTemplateItem | null;
  onSaveDraft: (template: Partial<WhatsAppTemplateItem>) => void;
  onSubmitToMeta: (template: Partial<WhatsAppTemplateItem>) => Promise<boolean>;
  onTestSend?: (template: Partial<WhatsAppTemplateItem>, phone: string) => Promise<boolean>;
}

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

export const MetaTemplateCreatorModal: React.FC<MetaTemplateCreatorModalProps> = ({
  isOpen,
  onClose,
  initialTemplate,
  onSaveDraft,
  onSubmitToMeta,
  onTestSend
}) => {
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load initial data if editing
  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name || '');
      setMetaCategory(initialTemplate.meta_category || 'UTILITY');
      setLanguage(initialTemplate.language || 'en_US');
      setHeaderType(initialTemplate.header_type as any || 'NONE');
      setHeaderText(initialTemplate.header_text || '');
      setHeaderSample(initialTemplate.header_sample || '');
      setHeaderUrl(initialTemplate.header_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800');
      setBodyText(initialTemplate.body_text || initialTemplate.body || '');
      setBodyVariables(initialTemplate.body_variables || {});
      setFooterText(initialTemplate.footer_text || '');
      setButtons(initialTemplate.buttons || []);
      setAllowCategoryChange(initialTemplate.allow_category_change ?? true);
    } else {
      // Default new template
      setName('');
      setMetaCategory('UTILITY');
      setLanguage('en_US');
      setHeaderType('NONE');
      setHeaderText('');
      setHeaderSample('');
      setBodyText('Hello {{1}}, your service booking #{{2}} has been confirmed for {{3}}.\n\nTechnician: {{4}}\nEstimated Amount: {{5}}.\n\nThank you for choosing CoolFix!');
      setBodyVariables({
        '1': 'Vikram Mehta',
        '2': 'SRV-8921',
        '3': 'Tomorrow, 10:30 AM',
        '4': 'Ramesh Kumar',
        '5': '₹2,800'
      });
      setFooterText('CoolFix Services • Fast & Certified');
      setButtons([
        { type: 'QUICK_REPLY', text: 'Reschedule' },
        { type: 'URL', text: 'Track Technician', url: 'https://coolfix.in/track/{{1}}', url_sample: 'SRV8921' }
      ]);
    }
  }, [initialTemplate, isOpen]);

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

    // Update bodyVariables preserving existing values
    setBodyVariables(prev => {
      const updated: Record<string, string> = {};
      detected.forEach((idx, i) => {
        updated[idx] = prev[idx] || (
          i === 0 ? 'John Doe' :
          i === 1 ? 'Booking #1024' :
          i === 2 ? 'May 15, 2024' :
          `Sample Value ${idx}`
        );
      });
      return updated;
    });
  }, [bodyText]);

  if (!isOpen) return null;

  // Insert Variable at cursor
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

  // Format body text helpers (bold, italic, strike, monospace)
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

  // Add Button
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

  // Remove Button
  const handleRemoveButton = (index: number) => {
    setButtons(prev => prev.filter((_, i) => i !== index));
  };

  // Validate template per Meta rules
  const validateTemplate = (): string | null => {
    if (!name.trim()) return 'Template name is required.';
    if (!/^[a-z0-9_]+$/.test(name)) {
      return 'Template name can only contain lowercase letters, numbers, and underscores (e.g. "service_booking_reminder").';
    }
    if (!bodyText.trim()) return 'Template body text is required.';
    if (bodyText.length > 1024) return 'Body text cannot exceed 1024 characters.';

    // Check variable format
    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    const nums = matches.map(m => parseInt(m.replace(/[{}]/g, '')));
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] !== i + 1) {
        return `Variables must be sequential starting with {{1}}. Found out-of-order variable {{${nums[i]}}}.`;
      }
    }

    // Check header text length
    if (headerType === 'TEXT' && headerText.length > 60) {
      return 'Header text cannot exceed 60 characters.';
    }

    // Check footer length
    if (footerText && footerText.length > 60) {
      return 'Footer text cannot exceed 60 characters.';
    }

    return null;
  };

  // Build template payload
  const buildPayload = (): Partial<WhatsAppTemplateItem> => {
    return {
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
      const success = await onSubmitToMeta(payload);
      if (success) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    const err = validateTemplate();
    if (err && !name) {
      setValidationError('Please specify a template name to save as draft.');
      return;
    }
    setValidationError(null);
    const payload = buildPayload();
    payload.meta_status = 'DRAFT';
    payload.status = 'Draft';
    onSaveDraft(payload);
    onClose();
  };

  // Render preview body text with variables replaced
  const renderPreviewBody = () => {
    let rendered = bodyText;
    if (previewMode === 'sample') {
      Object.keys(bodyVariables).forEach(k => {
        const val = bodyVariables[k] || `{{${k}}}`;
        rendered = rendered.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), val);
      });
    }

    // Simple markdown parser for preview
    const lines = rendered.split('\n');
    return lines.map((line, lIdx) => {
      let parts = line;
      // Bold *bold*
      parts = parts.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      // Italic _italic_
      parts = parts.replace(/_(.*?)_/g, '<em>$1</em>');
      // Strike ~strike~
      parts = parts.replace(/~(.*?)~/g, '<del>$1</del>');
      // Code `code`
      parts = parts.replace(/`(.*?)`/g, '<code class="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>');

      return (
        <p key={lIdx} className="min-h-[1em] leading-relaxed" dangerouslySetInnerHTML={{ __html: parts || '&nbsp;' }} />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92dvh] flex flex-col overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header matching Meta Business Suite */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-slate-900">Meta WhatsApp Template Builder</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  Graph API v21.0
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Design, preview, and submit pre-approved WhatsApp message templates directly to Meta Cloud API.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Main Content: Left Form (60%) + Right Device Preview (40%) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT FORM PANE */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs text-slate-700 border-b lg:border-b-0 lg:border-r border-slate-200">
            {/* 1. Template Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Template Name</span>
                  <span className="text-red-500">*</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Lowercase, numbers & underscores only)</span>
                </label>
                <span className="text-[11px] text-slate-400">{name.length}/512</span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g. service_booking_confirmed_v2"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                This is the unique identifier for your template in Meta WhatsApp Business Manager.
              </p>
            </div>

            {/* 2. Category Selection (Cards matching Meta) */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Category</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Marketing */}
                <button
                  type="button"
                  onClick={() => setMetaCategory('MARKETING')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    metaCategory === 'MARKETING'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>🏷️ Marketing</span>
                      </span>
                      {metaCategory === 'MARKETING' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Promotions, discounts, product announcements, and welcome messages.
                    </p>
                  </div>
                </button>

                {/* Utility */}
                <button
                  type="button"
                  onClick={() => setMetaCategory('UTILITY')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    metaCategory === 'UTILITY'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>⚙️ Utility</span>
                      </span>
                      {metaCategory === 'UTILITY' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Order confirmations, booking updates, invoices, and service reminders.
                    </p>
                  </div>
                </button>

                {/* Authentication */}
                <button
                  type="button"
                  onClick={() => setMetaCategory('AUTHENTICATION')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    metaCategory === 'AUTHENTICATION'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>🔐 Authentication</span>
                      </span>
                      {metaCategory === 'AUTHENTICATION' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      One-time passcodes (OTP), account verification, and security codes.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Language Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Template Language</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {META_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label} ({lang.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Header (Optional) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Header (Optional)</h4>
                  <p className="text-[11px] text-slate-400">Add a title or media image to catch customer attention.</p>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  {(['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setHeaderType(t)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        headerType === t
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
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

              {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType) && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Sample Media Preview URL ({headerType})
                  </label>
                  <input
                    type="url"
                    value={headerUrl}
                    onChange={(e) => setHeaderUrl(e.target.value)}
                    placeholder="https://example.com/sample-image.jpg"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Meta requires an example media file URL during submission to verify content quality.
                  </p>
                </div>
              )}
            </div>

            {/* 5. Body Text (Required with formatting toolbar) */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Body</span>
                    <span className="text-red-500">*</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Enter your message content with variables e.g. {"{{1}}"}.</p>
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
                placeholder="Write your WhatsApp message here..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-b-xl text-xs text-slate-900 leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* 6. Dynamic Variable Sample Values (MANDATORY FOR META) */}
            {Object.keys(bodyVariables).length > 0 && (
              <div className="space-y-3 bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-amber-900">Variable Sample Values (Meta Requirement)</h5>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      Meta will reject any template that lacks realistic sample values for dynamic variables.
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

            {/* 7. Footer (Optional) */}
            <div className="space-y-1.5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900">Footer (Optional)</label>
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

            {/* 8. Buttons (Optional, up to 10) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Interactive Buttons ({buttons.length}/10)</h4>
                  <p className="text-[11px] text-slate-400">Add Quick Replies, Call To Action links, or Copy Code buttons.</p>
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
                      placeholder="Button Text (Max 25 chars)"
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
                        placeholder="https://example.com/order/{{1}}"
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    )}

                    {btn.type === 'PHONE_NUMBER' && (
                      <input
                        type="tel"
                        value={btn.phone_number || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setButtons(prev => prev.map((b, i) => i === idx ? { ...b, phone_number: val } : b));
                        }}
                        placeholder="+919876543210"
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    )}

                    {btn.type === 'COPY_CODE' && (
                      <input
                        type="text"
                        value={btn.code || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setButtons(prev => prev.map((b, i) => i === idx ? { ...b, code: val } : b));
                        }}
                        placeholder="e.g. DISCOUNT2026"
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 9. Allow Category Change Toggle */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-800 text-xs block">Allow Category Change by Meta</label>
                <p className="text-[11px] text-slate-400">If Meta reviews your template and finds it matches Utility instead of Marketing, allow automatic category adjustment.</p>
              </div>
              <input
                type="checkbox"
                checked={allowCategoryChange}
                onChange={(e) => setAllowCategoryChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* RIGHT DEVICE PREVIEW PANE (Authentic WhatsApp Smartphone Frame) */}
          <div className="hidden lg:flex w-[380px] xl:w-[420px] bg-slate-100 p-4 xl:p-6 flex-col items-center justify-center border-l border-slate-200 shrink-0 overflow-hidden select-none">
            <div className="w-full flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span>Live WhatsApp Preview</span>
              </span>
              <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewMode('sample')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    previewMode === 'sample' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Samples
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('raw')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    previewMode === 'raw' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Raw {"{{x}}"}
                </button>
              </div>
            </div>

            {/* Smartphone Outer Bezel */}
            <div className="w-[310px] xl:w-[330px] h-[580px] xl:h-[600px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-white/20">
              {/* Speaker & Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-2" />
              </div>

              {/* Phone Screen Container */}
              <div className="flex-1 bg-[#EFEAE2] rounded-[30px] flex flex-col overflow-hidden relative">
                {/* WhatsApp Chat Top Header */}
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

                {/* Chat Wallpaper & Message Bubble Area */}
                <div
                  className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col justify-end"
                  style={{
                    backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
                    backgroundSize: '16px 16px',
                  }}
                >
                  {/* WhatsApp Chat Bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-none shadow-md border border-slate-200/60 overflow-hidden max-w-[280px]">
                    {/* Header Rendering */}
                    {headerType === 'TEXT' && headerText && (
                      <div className="p-3 pb-1 font-bold text-xs text-slate-900">
                        {previewMode === 'sample' && headerText.includes('{{1}}')
                          ? headerText.replace('{{1}}', headerSample || 'Sample Header')
                          : headerText}
                      </div>
                    )}
                    {headerType === 'IMAGE' && headerUrl && (
                      <div className="w-full h-36 bg-slate-200 overflow-hidden relative">
                        <img src={headerUrl} alt="Header Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {headerType === 'VIDEO' && (
                      <div className="w-full h-36 bg-slate-900 text-white flex flex-col items-center justify-center text-xs p-2">
                        <Video className="w-8 h-8 text-emerald-400 mb-1" />
                        <span>Video Header Sample</span>
                      </div>
                    )}
                    {headerType === 'DOCUMENT' && (
                      <div className="p-3 bg-slate-100 flex items-center gap-2 border-b border-slate-200 text-xs">
                        <FileText className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-slate-700">document_attachment.pdf</span>
                      </div>
                    )}

                    {/* Body Text */}
                    <div className="p-3 text-[11px] text-slate-800 font-sans space-y-1">
                      {renderPreviewBody()}
                    </div>

                    {/* Footer */}
                    {footerText && (
                      <div className="px-3 pb-2 text-[9px] text-slate-400 font-medium">
                        {footerText}
                      </div>
                    )}

                    {/* Timestamp & Double Blue Ticks */}
                    <div className="px-3 pb-2 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                      <span>10:30 AM</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.4]" />
                    </div>

                    {/* Buttons in Bubble */}
                    {buttons.length > 0 && (
                      <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {buttons.map((b, bIdx) => (
                          <button
                            key={bIdx}
                            type="button"
                            className="w-full py-2 px-3 text-center text-xs font-semibold text-[#00A884] hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {b.type === 'URL' && <ExternalLink className="w-3 h-3 text-[#00A884]" />}
                            {b.type === 'PHONE_NUMBER' && <Phone className="w-3 h-3 text-[#00A884]" />}
                            {b.type === 'COPY_CODE' && <Copy className="w-3 h-3 text-[#00A884]" />}
                            <span>{b.text || 'Button'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {initialTemplate?.meta_status || 'DRAFT'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Save as Draft
            </button>

            {onTestSend && (
              <button
                type="button"
                onClick={() => setShowTestSendModal(true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-slate-600" />
                <span>Test Send</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 transition-all cursor-pointer active:scale-95"
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
      </div>

      {/* Test Send Dialog */}
      {showTestSendModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Send Test WhatsApp Message</h3>
              <button onClick={() => setShowTestSendModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 text-[11px]">
              We will send this template with your sample variables to your WhatsApp phone number immediately.
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Recipient Phone Number</label>
              <input
                type="tel"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
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
                  if (onTestSend) {
                    await onTestSend(buildPayload(), testPhoneNumber);
                    setShowTestSendModal(false);
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
    </div>
  );
};

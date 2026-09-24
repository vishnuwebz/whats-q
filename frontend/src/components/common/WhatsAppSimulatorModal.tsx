import React, { useState, useEffect, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  X,
  Send,
  User,
  MessageSquare,
  Image,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Radio,
  FileText,
  Zap,
  Info,
  ChevronDown,
  Check,
  Building2,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { CustomerAvatar } from './CustomerAvatar';
import { CountryPhoneInput } from './CountryPhoneInput';

export const WhatsAppSimulatorModal: React.FC = () => {
  const {
    isSimulatorOpen,
    setIsSimulatorOpen,
    startOutboundWhatsAppChat,
    simulateInboundWhatsApp,
    templates,
    linkedDevices,
    metaConfig,
    setActiveTab,
    addToast
  } = useQiyamStore();

  // Mode: 'live' (Real outbound WhatsApp) vs 'simulator' (Inbound test sandbox)
  const [activeTabMode, setActiveTabMode] = useState<'live' | 'simulator'>('live');

  // Recipient details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Live Outbound options
  const [outboundMode, setOutboundMode] = useState<'direct' | 'template'>('direct');
  const [directMessage, setDirectMessage] = useState('Hello! How can we assist you today?');
  const [selectedSenderId, setSelectedSenderId] = useState<string>('meta_cloud');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | number>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  // Simulator options
  const [simulatedMessage, setSimulatedMessage] = useState('Hello, I would like to inquire about your services.');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Business phone display
  const businessPhoneDisplay = metaConfig?.business_phone_display || '+91 94963 00233';

  // Available sender lines
  const senderOptions = useMemo(() => {
    const options: Array<{ id: string; label: string; sublabel: string; isOfficial: boolean; status: string }> = [
      {
        id: 'meta_cloud',
        label: 'Meta Cloud API (Official Line)',
        sublabel: businessPhoneDisplay,
        isOfficial: true,
        status: 'Official WABA'
      }
    ];

    if (linkedDevices && linkedDevices.length > 0) {
      linkedDevices.forEach((d) => {
        options.push({
          id: String(d.id),
          label: d.device_label || d.employee_name || 'Linked WhatsApp Line',
          sublabel: d.phone_number || 'Linked Phone',
          isOfficial: false,
          status: d.status === 'connected' ? 'Connected' : 'Offline'
        });
      });
    }

    return options;
  }, [linkedDevices, businessPhoneDisplay]);

  // Set default template if none selected and templates exist
  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  // Selected template object
  const currentTemplate = useMemo(() => {
    if (!templates || templates.length === 0) return null;
    return templates.find((t) => String(t.id) === String(selectedTemplateId)) || templates[0];
  }, [templates, selectedTemplateId]);

  // Extract variables from template body (e.g. {{1}}, {{customer_name}}, etc.)
  const templateVarKeys = useMemo(() => {
    if (!currentTemplate) return [];
    const text = currentTemplate.body_text || currentTemplate.body || '';
    const matches = text.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '').trim())));
  }, [currentTemplate]);

  // Auto-prefill customer name in variables if matching
  useEffect(() => {
    if (templateVarKeys.length > 0) {
      setTemplateVariables((prev) => {
        const next = { ...prev };
        templateVarKeys.forEach((key, idx) => {
          if (!next[key]) {
            if (key === '1' || key.toLowerCase().includes('name') || key.toLowerCase().includes('customer')) {
              next[key] = name.trim() || 'Valued Customer';
            } else if (key === '2' || key.toLowerCase().includes('service')) {
              next[key] = 'General Service';
            } else if (key === '3' || key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
              next[key] = 'Tomorrow at 10:30 AM';
            } else {
              next[key] = (currentTemplate?.body_variables || {})[key] || `Value ${idx + 1}`;
            }
          }
        });
        return next;
      });
    }
  }, [templateVarKeys, currentTemplate, name]);

  // Rendered live preview of template text
  const renderedTemplatePreview = useMemo(() => {
    if (!currentTemplate) return '';
    let text = currentTemplate.body_text || currentTemplate.body || '';
    templateVarKeys.forEach((k) => {
      const val = templateVariables[k] || `{{${k}}}`;
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), val);
    });
    return text;
  }, [currentTemplate, templateVarKeys, templateVariables]);

  if (!isSimulatorOpen) return null;

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    if (!cleanPhone) {
      addToast('Please enter the customer WhatsApp phone number.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTabMode === 'live') {
        // REAL OUTBOUND DISPATCH
        if (outboundMode === 'direct') {
          const cleanDirect = directMessage.trim();
          if (!cleanDirect) {
            addToast('Please enter the message you want to dispatch to this WhatsApp number.', 'warning');
            setIsSubmitting(false);
            return;
          }

          const res = await startOutboundWhatsAppChat({
            name: cleanName || 'WhatsApp Contact',
            phone: cleanPhone,
            text: cleanDirect,
            senderDeviceId: selectedSenderId,
            avatar: avatarUrl.trim() || undefined,
          });

          if (res.success) {
            setIsSimulatorOpen(false);
            setActiveTab('conversations');
          }
        } else {
          // TEMPLATE DISPATCH
          if (!currentTemplate) {
            addToast('Please select an approved WhatsApp template to dispatch.', 'warning');
            setIsSubmitting(false);
            return;
          }

          const res = await startOutboundWhatsAppChat({
            name: cleanName || 'WhatsApp Contact',
            phone: cleanPhone,
            templateId: currentTemplate.id,
            variables: templateVariables,
            senderDeviceId: selectedSenderId,
            avatar: avatarUrl.trim() || undefined,
          });

          if (res.success) {
            setIsSimulatorOpen(false);
            setActiveTab('conversations');
          }
        }
      } else {
        // INBOUND SIMULATOR (Sandbox testing)
        const cleanSim = simulatedMessage.trim();
        if (!cleanSim) {
          addToast('Please enter a message for the incoming customer simulator.', 'warning');
          setIsSubmitting(false);
          return;
        }

        await simulateInboundWhatsApp(
          cleanName || 'WhatsApp Customer',
          cleanPhone,
          cleanSim,
          avatarUrl.trim() || undefined
        );

        setIsSimulatorOpen(false);
        setActiveTab('conversations');
      }
    } catch (err: any) {
      console.error('[WhatsApp Modal] Submit error:', err);
      addToast('Failed to complete action. Please verify network connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const directQuickChips = [
    'Hello! How can we assist you today?',
    'Hi, thank you for reaching out to Qiyam Ventures.',
    'Your requested service quotation is ready for review.',
    'Hi, confirming your scheduled technician appointment.',
  ];

  const simulatorQuickChips = [
    'I want to book an AC repair service for tomorrow',
    'What are your service packages and pricing?',
    'Can I talk to a human customer support agent?',
    'Hi, can you send me an invoice copy?',
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-150"
      onClick={() => setIsSimulatorOpen(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[94dvh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-4 text-white shrink-0 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide">New WhatsApp Chat</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/40 text-emerald-100 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>WhatsApp Live</span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 mt-0.5">
                  Dispatch a real WhatsApp message to a customer or test bot flows
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Tab Switcher: Real Outbound vs Inbound Sandbox */}
          <div className="mt-3.5 pt-3 border-t border-emerald-500/30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTabMode('live')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTabMode === 'live'
                  ? 'bg-white text-emerald-800 shadow-md shadow-emerald-950/20'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Real WhatsApp</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-extrabold uppercase tracking-wider ml-1">
                Live
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabMode('simulator')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTabMode === 'simulator'
                  ? 'bg-white text-teal-900 shadow-md shadow-emerald-950/20'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Test Bot Simulator</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 font-extrabold uppercase tracking-wider ml-1">
                Sandbox
              </span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Recipient Details: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recipient / Customer Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Phone Number <span className="text-red-500">*</span>
              </label>
              <CountryPhoneInput
                value={phone}
                onChange={(val) => setPhone(val)}
                alignDropdown="right"
                required
              />
            </div>
          </div>

          {/* Contact Live Card Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <CustomerAvatar
                name={name || 'New Customer'}
                avatar={avatarUrl}
                phone={phone}
                size="md"
                showPresence={false}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs truncate">
                    {name || 'New WhatsApp Recipient'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>WhatsApp Verified</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                  {phone || 'Enter number (e.g. +91 94963 00233)'}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                activeTabMode === 'live'
                  ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-300'
                  : 'bg-purple-100/70 text-purple-800 border border-purple-300'
              }`}>
                {activeTabMode === 'live' ? '🚀 Outbound Real' : '🧪 Inbound Test'}
              </span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: REAL OUTBOUND WHATSAPP DISPATCH                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTabMode === 'live' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Sender Line Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Send From Line / Device</span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Meta Channel</span>
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {senderOptions.map((opt) => {
                    const isSelected = selectedSenderId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedSenderId(opt.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/30'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.isOfficial ? <Building2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-[11px] truncate">{opt.label}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{opt.sublabel}</p>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center">
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Mode: Direct Message vs Approved Template */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Outbound Message Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutboundMode('direct')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      outboundMode === 'direct'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-700/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Direct Freeform Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutboundMode('template')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      outboundMode === 'template'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-700/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Meta Approved Template</span>
                  </button>
                </div>
              </div>

              {/* Direct Message Input */}
              {outboundMode === 'direct' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">
                      Message Content <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {directMessage.length} characters
                    </span>
                  </div>

                  <textarea
                    value={directMessage}
                    onChange={(e) => setDirectMessage(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition leading-relaxed shadow-2xs"
                    placeholder="Type your message to send directly to this customer's WhatsApp..."
                    required
                  />

                  {/* Quick Starter Chips */}
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-semibold">Quick message templates:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {directQuickChips.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDirectMessage(chip)}
                          className="text-[11px] bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg px-2.5 py-1 text-left transition cursor-pointer truncate max-w-full"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Informational banner about real dispatch */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2 text-emerald-800">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong className="font-semibold">Instant Real WhatsApp Dispatch:</strong> When you click Send, this message is immediately dispatched to <span className="font-mono font-semibold">{phone || 'the customer'}</span> from your active line and logged in your inbox.
                    </p>
                  </div>
                </div>
              )}

              {/* Template Selector & Dynamic Variables */}
              {outboundMode === 'template' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Choose Approved Meta Template
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition shadow-2xs appearance-none font-medium"
                      >
                        {templates && templates.map((tmpl) => (
                          <option key={tmpl.id} value={tmpl.id}>
                            {tmpl.name} ({tmpl.category || tmpl.meta_category || 'Marketing'})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Template Variable Inputs */}
                  {templateVarKeys.length > 0 && (
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">Template Variables:</span>
                        <span className="text-[10px] text-slate-500">Auto-filled & customizable</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {templateVarKeys.map((key) => (
                          <div key={key}>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                              {`{{${key}}}`}
                            </label>
                            <input
                              type="text"
                              value={templateVariables[key] || ''}
                              onChange={(e) =>
                                setTemplateVariables((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              placeholder={`Value for {{${key}}}`}
                              className="w-full p-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:border-emerald-500 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live WhatsApp Bubble Preview */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 text-[11px]">Live WhatsApp Preview:</span>
                    <div className="p-3 bg-[#EFEAE2] rounded-xl border border-[#D1D7DB] flex justify-end">
                      <div className="bg-[#D9FDD3] text-slate-900 rounded-xl rounded-tr-xs p-3 max-w-[90%] shadow-xs text-xs space-y-1">
                        <p className="whitespace-pre-line leading-relaxed text-slate-800 text-[11px]">
                          {renderedTemplatePreview}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500">
                          <span>Just now</span>
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 inline" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: INBOUND TEST SIMULATOR (Sandbox)                        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTabMode === 'simulator' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 bg-purple-50/80 border border-purple-200/80 rounded-xl text-purple-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950">
                  <Bot className="w-3.5 h-3.5 text-purple-700" />
                  <span>Interactive Bot & Workflow Sandbox</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  This simulates an incoming message from the customer into your system. Use this to verify that AI auto-responses, intent classifiers, and booking bot steps respond correctly without sending real WhatsApp messages or consuming Meta API quota.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Customer Profile Photo URL (Optional)</span>
                  <span className="text-[10px] text-slate-400">Defaults to generated avatar</span>
                </label>
                <div className="relative">
                  <Image className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Incoming Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={simulatedMessage}
                  onChange={(e) => setSimulatedMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none transition leading-relaxed shadow-2xs"
                  placeholder="Type an incoming customer question or keyword..."
                  required
                />
              </div>

              {/* Quick Simulator Test Chips */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-semibold">Quick test scenarios:</p>
                <div className="flex flex-wrap gap-1.5">
                  {simulatorQuickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSimulatedMessage(chip)}
                      className="text-[11px] bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg px-2.5 py-1 text-left transition cursor-pointer truncate max-w-full"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
            <span className="text-[10px] text-slate-400 font-medium">
              {activeTabMode === 'live' ? '⚡ Outbound to real phone' : '🧪 Simulated local sandbox'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSimulatorOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition cursor-pointer text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white transition cursor-pointer text-xs shadow-md disabled:opacity-50 ${
                  activeTabMode === 'live'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-700/25'
                    : 'bg-teal-700 hover:bg-teal-800 active:bg-teal-900 shadow-teal-900/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{activeTabMode === 'live' ? 'Dispatching...' : 'Simulating...'}</span>
                  </>
                ) : (
                  <>
                    {activeTabMode === 'live' ? <Send className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    <span>{activeTabMode === 'live' ? 'Send Real WhatsApp' : 'Simulate Inbound'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Also export alias NewWhatsAppChatModal for clearer semantic naming
export const NewWhatsAppChatModal = WhatsAppSimulatorModal;

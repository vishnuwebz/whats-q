import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ChevronDown, Check, Search } from 'lucide-react';
import { WhatsAppTemplateItem, Conversation } from '@/types';
import { useQiyamStore } from '@/store/useQiyamStore';

interface SendTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: WhatsAppTemplateItem[];
  currentConversation?: Conversation | null;
  onSendTemplate: (templateId: string | number, variables: Record<string, string>) => void;
}

export const SendTemplateModal: React.FC<SendTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  currentConversation,
  onSendTemplate
}) => {
  const { metaConfig } = useQiyamStore();
  const approvedTemplates = templates.filter(t => t.meta_status === 'APPROVED' || t.status === 'Active');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | number>(
    approvedTemplates[0]?.id || templates[0]?.id || ''
  );
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = templates.find(t => String(t.id) === String(selectedTemplateId)) || approvedTemplates[0];

  const filtered = search.trim()
    ? approvedTemplates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(search.toLowerCase())
      )
    : approvedTemplates;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      const vars: Record<string, string> = {};
      const templateVars = selectedTemplate.body_variables || {};
      const contactName = currentConversation?.contact_name || 'Customer';
      const serviceNeeded = currentConversation?.service_needed || 'AC Repair';
      const estValue = `â‚¹${currentConversation?.estimated_value || 2800}`;

      Object.keys(templateVars).forEach((k, idx) => {
        if (idx === 0) vars[k] = contactName;
        else if (idx === 1) vars[k] = serviceNeeded;
        else if (idx === 2) vars[k] = estValue;
        else vars[k] = templateVars[k] || `Value ${k}`;
      });

      const matches = (selectedTemplate.body_text || selectedTemplate.body || '').match(/\{\{(\d+)\}\}/g) || [];
      matches.forEach((m, idx) => {
        const num = m.replace(/[{}]/g, '');
        if (!vars[num]) {
          if (idx === 0) vars[num] = contactName;
          else if (idx === 1) vars[num] = serviceNeeded;
          else vars[num] = `Sample ${num}`;
        }
      });
      setVariables(vars);
    }
  }, [selectedTemplateId, currentConversation]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!selectedTemplate) return;
    onSendTemplate(selectedTemplate.id, variables);
    onClose();
  };

  const renderPreview = () => {
    if (!selectedTemplate) return '';
    let text = selectedTemplate.body_text || selectedTemplate.body || '';
    Object.keys(variables).forEach(k => {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), variables[k] || `{{${k}}}`);
    });
    return text;
  };

  const categoryColor = (cat?: string) => {
    const c = (cat || '').toUpperCase();
    if (c.includes('MARKET')) return 'bg-amber-100 text-amber-800';
    if (c.includes('AUTH')) return 'bg-blue-100 text-blue-800';
    return 'bg-emerald-100 text-emerald-800';
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col font-sans animate-in fade-in zoom-in-95 max-h-[90dvh]">

        {/* â”€â”€ Header â”€â”€ */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">Send WhatsApp Template</h3>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                To: <span className="font-semibold text-white">{currentConversation?.contact_name || 'Customer'}</span>
                {currentConversation?.phone_number && (
                  <span className="ml-1 opacity-75">({currentConversation.phone_number})</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">

          {/* Active Dispatch Route Strip (Sender -> Recipient) */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>Sending From:</span>
                  <span className="font-mono text-emerald-800 font-extrabold bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                    {metaConfig?.business_phone_display || '+91 98765 43210'}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                    Meta Cloud API
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Delivers to: <strong className="text-slate-800">{currentConversation?.contact_name || 'Customer'}</strong> ({currentConversation?.phone_number || 'Recipient'})
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs shrink-0">
              Verified Channel
            </span>
          </div>

          {/* Custom Dropdown */}
          <div ref={dropdownRef} className="relative z-50">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Approved Template
            </label>

            {/* Trigger */}
            <button
              type="button"
              onClick={() => setDropdownOpen(o => !o)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 bg-slate-50 border rounded-xl transition-all text-left cursor-pointer ${
                dropdownOpen ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              {selectedTemplate ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 truncate">{selectedTemplate.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${categoryColor(selectedTemplate.meta_category || selectedTemplate.category)}`}>
                        {selectedTemplate.meta_category || selectedTemplate.category || 'UTILITY'}
                      </span>
                      <span className="text-[10px] text-slate-400">{selectedTemplate.language || 'en_US'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 text-xs">Choose a template...</span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* Dropdown panel â€” position absolute, no overflow clipping */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[99999] overflow-hidden">
                <div className="p-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search templates..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No templates found</div>
                  ) : filtered.map(t => {
                    const isSel = String(t.id) === String(selectedTemplateId);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { setSelectedTemplateId(t.id); setDropdownOpen(false); setSearch(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${isSel ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSel ? 'bg-emerald-600' : 'bg-slate-100'}`}>
                          {isSel
                            ? <Check className="w-3.5 h-3.5 text-white" />
                            : <Sparkles className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-xs truncate ${isSel ? 'text-emerald-700' : 'text-slate-800'}`}>{t.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${categoryColor(t.meta_category || t.category)}`}>
                              {t.meta_category || t.category || 'UTILITY'}
                            </span>
                            <span className="text-[10px] text-slate-400">{t.language || 'en_US'}</span>
                          </div>
                        </div>
                        {isSel && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Template Variables */}
          {Object.keys(variables).length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Template Variables</span>
              {Object.keys(variables).map(k => (
                <div key={k} className="flex items-center gap-2.5">
                  <span className="w-12 text-center px-2 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg font-mono font-bold text-emerald-700 text-[10px] shrink-0">
                    {`{{${k}}}`}
                  </span>
                  <input
                    type="text"
                    value={variables[k]}
                    onChange={(e) => setVariables(prev => ({ ...prev, [k]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">WhatsApp Preview</span>
            <div className="bg-[#EFEAE2] p-4 rounded-xl border border-slate-200 min-h-[80px]">
              <div className="bg-white rounded-2xl rounded-tl-none px-3.5 py-3 shadow-sm border border-slate-100 max-w-[85%] space-y-1.5">
                {selectedTemplate?.header_text && (
                  <div className="font-bold text-[11px] text-slate-900 border-b border-slate-100 pb-1.5">{selectedTemplate.header_text}</div>
                )}
                <div className="text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                  {renderPreview() || <span className="text-slate-400 italic">Select a template to preview...</span>}
                </div>
                {selectedTemplate?.footer_text && (
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">{selectedTemplate.footer_text}</div>
                )}
                <div className="text-[9px] text-slate-400 text-right">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* â”€â”€ Footer â”€â”€ */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!selectedTemplate}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Template Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};

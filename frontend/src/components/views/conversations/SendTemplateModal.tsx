import React, { useState } from 'react';
import { X, Send, Sparkles, Check, AlertCircle, FileText, Phone, ExternalLink } from 'lucide-react';
import { WhatsAppTemplateItem, Conversation } from '@/types';

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
  const approvedTemplates = templates.filter(t => t.meta_status === 'APPROVED' || t.status === 'Active');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | number>(
    approvedTemplates[0]?.id || templates[0]?.id || ''
  );
  const [variables, setVariables] = useState<Record<string, string>>({});

  const selectedTemplate = templates.find(t => String(t.id) === String(selectedTemplateId)) || approvedTemplates[0];

  // Populate default variables based on customer context
  React.useEffect(() => {
    if (selectedTemplate) {
      const vars: Record<string, string> = {};
      const templateVars = selectedTemplate.body_variables || {};
      const contactName = currentConversation?.contact_name || 'Customer';
      const serviceNeeded = currentConversation?.service_needed || 'AC Repair';
      const estValue = `₹${currentConversation?.estimated_value || 2800}`;
      
      Object.keys(templateVars).forEach((k, idx) => {
        if (idx === 0) vars[k] = contactName;
        else if (idx === 1) vars[k] = serviceNeeded;
        else if (idx === 2) vars[k] = estValue;
        else vars[k] = templateVars[k] || `Value ${k}`;
      });

      // Also detect from body text if body_variables not populated
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

  // Render preview message
  const renderPreview = () => {
    if (!selectedTemplate) return '';
    let text = selectedTemplate.body_text || selectedTemplate.body || '';
    Object.keys(variables).forEach(k => {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), variables[k] || `{{${k}}}`);
    });
    return text;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden font-sans animate-in fade-in zoom-in-95 max-h-[92dvh]">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Send WhatsApp Template</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-none">
                To: <span className="font-semibold text-slate-800">{currentConversation.contact_name}</span> ({currentConversation.phone_number})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs overflow-y-auto">
          {/* Template Select */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Approved Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm sm:text-xs outline-none"
            >
              {approvedTemplates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} • {t.meta_category || t.category} ({t.language || 'en_US'})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Variables Inputs */}
          {Object.keys(variables).length > 0 && (
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 text-[11px] block">Fill Template Variables</span>
              <div className="space-y-2">
                {Object.keys(variables).map(k => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-center font-mono font-bold text-emerald-700 shrink-0">
                      {`{{${k}}}`}
                    </span>
                    <input
                      type="text"
                      value={variables[k]}
                      onChange={(e) => setVariables(prev => ({ ...prev, [k]: e.target.value }))}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm sm:text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Message Preview */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700 text-[11px] block">WhatsApp Chat Bubble Preview</span>
            <div className="bg-[#EFEAE2] p-3.5 rounded-xl border border-slate-200">
              <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm border border-slate-200/60 max-w-sm space-y-2">
                {selectedTemplate?.header_text && (
                  <div className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1">
                    {selectedTemplate.header_text}
                  </div>
                )}
                <div className="text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                  {renderPreview()}
                </div>
                {selectedTemplate?.footer_text && (
                  <div className="text-[10px] text-slate-400">
                    {selectedTemplate.footer_text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Template Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};

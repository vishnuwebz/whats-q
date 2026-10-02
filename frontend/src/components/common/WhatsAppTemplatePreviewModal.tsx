import React from 'react';
import {
  Smartphone,
  CheckCircle2,
  ExternalLink,
  FileText,
  Check,
  CheckCheck,
  Copy,
  Phone,
  Sparkles,
  X,
} from 'lucide-react';
import { useQiyamStore } from '../../store/useQiyamStore';

export interface WhatsAppTemplatePreviewModalProps {
  templateName?: string;
  templateId?: string | number;
  campaignOrMessage?: {
    name?: string;
    campaignName?: string;
    category?: string;
    type?: string;
    messageText?: string;
    description?: string;
    createdAt?: string;
  } | null;
  onClose: () => void;
}

export const WhatsAppTemplatePreviewModal: React.FC<WhatsAppTemplatePreviewModalProps> = ({
  templateName,
  templateId,
  campaignOrMessage,
  onClose,
}) => {
  const {
    templates,
    bulkTemplates,
    metaConfig,
    workspace,
    setSelectedTemplateId,
    setActiveTab,
    addToast,
  } = useQiyamStore();

  const tName = (templateName || '').trim();
  const tId = templateId ? String(templateId).trim() : '';

  // Find matching template in DB or bulk template pool
  const activeTmpl =
    (tName
      ? templates.find(
          (t) =>
            t.name.toLowerCase() === tName.toLowerCase() ||
            String(t.id) === tName ||
            (t.meta_template_id && t.meta_template_id === tName)
        ) ||
        bulkTemplates.find(
          (b) => b.name.toLowerCase() === tName.toLowerCase() || String(b.id) === tName
        )
      : null) ||
    (tId
      ? templates.find((t) => String(t.id) === tId || (t.meta_template_id && t.meta_template_id === tId)) ||
        bulkTemplates.find((b) => String(b.id) === tId)
      : null);

  const camp = campaignOrMessage;
  const metaStatus =
    (activeTmpl as any)?.meta_status ||
    (activeTmpl as any)?.status ||
    (tName ? 'APPROVED' : 'DIRECT');
  const isApproved = metaStatus === 'APPROVED' || metaStatus === 'Active';
  const category =
    (activeTmpl as any)?.meta_category ||
    (activeTmpl as any)?.category ||
    camp?.category ||
    camp?.type ||
    'MARKETING';
  const language = (activeTmpl as any)?.language || 'en_US';
  const headerType = String(
    (activeTmpl as any)?.header_type || (activeTmpl as any)?.headerType || ''
  ).toUpperCase();
  const headerText = (activeTmpl as any)?.header_text || (activeTmpl as any)?.headerText || '';
  const headerSample = (activeTmpl as any)?.header_sample || '';
  const headerUrl = (activeTmpl as any)?.header_url || (activeTmpl as any)?.headerContent || '';
  const footerText = (activeTmpl as any)?.footer_text || (activeTmpl as any)?.footerText || '';
  const buttons: Array<{ type: string; text: string; url?: string; phone_number?: string }> =
    (activeTmpl as any)?.buttons || [];

  // Generate Meta Manager URL
  const getMetaManagerUrl = (targetName?: string) => {
    const businessId = '1029836994795053';
    const assetId = metaConfig?.waba_id || '4567067243541240';
    if (targetName) {
      const filters = encodeURIComponent(
        JSON.stringify({
          date_range: 7,
          language: [],
          quality: [],
          search_text: targetName,
          sort_direction: 'descending',
          sort_key: 'lastUpdatedTime',
          status: ['APPROVED', 'IN_APPEAL', 'PAUSED', 'PENDING', 'REJECTED'],
          tag: [],
        })
      );
      return `https://business.facebook.com/latest/whatsapp_manager/message_templates?business_id=${businessId}&asset_id=${assetId}&tab=message-templates&childRoute=templates&filters=${filters}&nav_ref=whatsapp_manager`;
    }
    return `https://business.facebook.com/latest/whatsapp_manager/message_templates?business_id=${businessId}&asset_id=${assetId}&tab=message-templates&childRoute=templates&nav_ref=whatsapp_manager`;
  };

  // Build preview body
  let bodyRaw = '';
  if (camp?.messageText && !camp.messageText.startsWith('[WhatsApp Template')) {
    bodyRaw = camp.messageText;
  } else if (activeTmpl) {
    bodyRaw = (activeTmpl as any).body_text || (activeTmpl as any).body || '';
    const vars = (activeTmpl as any).body_variables || (activeTmpl as any).variables || {};
    if (typeof vars === 'object' && vars !== null) {
      Object.keys(vars).forEach((k) => {
        bodyRaw = bodyRaw.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(vars[k]));
      });
    }
    // Common fallbacks for remaining placeholders
    bodyRaw = bodyRaw
      .replace(/\{\{1\}\}/g, 'Vikram Mehta')
      .replace(/\{\{2\}\}/g, 'AC Deep Cleaning')
      .replace(/\{\{3\}\}/g, 'October 03, 2026')
      .replace(/\{\{4\}\}/g, '10:30 AM')
      .replace(/\{\{5\}\}/g, 'Ramesh Kumar')
      .replace(/\{\{6\}\}/g, '₹2,800');
  } else {
    bodyRaw = camp?.description || 'Broadcast message content.';
  }

  const lines = bodyRaw.split('\n');
  const businessDisplayName =
    workspace?.name || (activeTmpl as any)?.accountName || 'CoolFix Services';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100 truncate font-mono">
                  {tName || (activeTmpl as any)?.name || 'Direct WhatsApp Message'}
                </h3>
                {tName && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 border shrink-0 ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {isApproved && <CheckCircle2 className="w-2.5 h-2.5" />}
                    <span>{metaStatus}</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Live WhatsApp Preview • {camp?.campaignName || camp?.name || 'Scheduled Broadcast'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meta Pipeline Specs Strip */}
        <div className="px-4 py-2 bg-slate-800/90 text-[10px] text-slate-300 flex items-center justify-between flex-wrap gap-2 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/10 font-bold uppercase tracking-wider text-slate-200">
              {category}
            </span>
            <span>•</span>
            <span>
              Lang: <strong className="text-white">{language}</strong>
            </span>
            {activeTmpl && (activeTmpl as any).meta_template_id && (
              <>
                <span>•</span>
                <span className="font-mono text-slate-400 text-[9px]">
                  Meta ID: {(activeTmpl as any).meta_template_id}
                </span>
              </>
            )}
          </div>

          {tName && (
            <a
              href={getMetaManagerUrl(tName)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-bold rounded-lg text-[10px] shadow-xs transition cursor-pointer"
              title="Open official template page on Facebook Meta WhatsApp Manager"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in Facebook Meta Manager</span>
            </a>
          )}
        </div>

        {/* Smartphone Frame Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100 flex flex-col items-center justify-center">
          <div className="w-[300px] sm:w-[320px] bg-slate-900 rounded-[32px] p-2.5 shadow-xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-black/10">
            {/* Camera / Speaker Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-slate-900 ml-auto mr-1.5" />
            </div>

            {/* Smartphone Screen */}
            <div className="bg-[#EFEAE2] rounded-[24px] overflow-hidden flex flex-col">
              {/* WhatsApp Top Green Header */}
              <div className="bg-[#075E54] text-white pt-4 pb-2 px-3 flex items-center gap-2 shadow-xs shrink-0">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[10px]">
                  {businessDisplayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-[11px] text-white truncate">
                      {businessDisplayName}
                    </h4>
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  </div>
                  <p className="text-[8px] text-white/70">Official WhatsApp Business Account</p>
                </div>
              </div>

              {/* Chat Bubble Canvas */}
              <div
                className="p-3 space-y-2 flex flex-col justify-start max-h-[380px] overflow-y-auto"
                style={{
                  backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              >
                <div className="bg-white rounded-2xl rounded-tl-none shadow-md border border-slate-200/70 overflow-hidden max-w-[270px]">
                  {/* Header Media / Text */}
                  {headerType === 'TEXT' && headerText && (
                    <div className="p-2.5 pb-1 font-bold text-[11px] text-slate-900">
                      {headerText.includes('{{1}}')
                        ? headerText.replace('{{1}}', headerSample || businessDisplayName)
                        : headerText}
                    </div>
                  )}

                  {['IMAGE', 'VIDEO'].includes(headerType) && (
                    <div className="relative h-28 bg-slate-200 overflow-hidden">
                      <img
                        src={
                          headerUrl ||
                          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'
                        }
                        alt="Header Media"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800';
                        }}
                      />
                    </div>
                  )}

                  {headerType === 'DOCUMENT' && (
                    <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-700 truncate">
                        Document.pdf
                      </span>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="p-2.5 text-[10.5px] text-slate-800 space-y-1">
                    {lines.map((line, lIdx) => {
                      let parts = line;
                      parts = parts.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
                      parts = parts.replace(/_(.*?)_/g, '<em>$1</em>');
                      parts = parts.replace(/~(.*?)~/g, '<del>$1</del>');
                      parts = parts.replace(
                        /`(.*?)`/g,
                        '<code class="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>'
                      );
                      return (
                        <p
                          key={lIdx}
                          className="min-h-[1em] leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: parts || '&nbsp;' }}
                        />
                      );
                    })}
                  </div>

                  {/* Footer Text */}
                  {footerText && (
                    <div className="px-2.5 pb-1 text-[8.5px] text-slate-400 font-medium">
                      {footerText}
                    </div>
                  )}

                  {/* Timestamp & Read Checkmarks */}
                  <div className="px-2.5 pb-1.5 flex items-center justify-end gap-1 text-[8px] text-slate-400">
                    <span>
                      {camp?.createdAt
                        ? new Date(camp.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '10:30 AM'}
                    </span>
                    <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                  </div>

                  {/* Action Buttons */}
                  {buttons.length > 0 && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/50">
                      {buttons.map((b, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addToast(`Clicked "${b.text}" preview`, 'info')}
                          className="w-full py-1.5 px-2.5 text-[10px] font-bold text-[#00a884] hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 text-[11px] truncate">
            Campaign: <strong className="text-slate-800">{camp?.campaignName || camp?.name || '—'}</strong>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(bodyRaw);
                addToast('Message text copied to clipboard!', 'success');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer text-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>

            {activeTmpl && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplateId((activeTmpl as any).id);
                  onClose();
                  setActiveTab('template-hub');
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open in Template Hub</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

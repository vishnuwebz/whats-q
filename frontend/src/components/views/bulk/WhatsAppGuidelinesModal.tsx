import React from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Users,
  Clock,
} from 'lucide-react';

interface WhatsAppGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppGuidelinesModal: React.FC<WhatsAppGuidelinesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                WhatsApp Business Messaging Guidelines
              </h3>
              <p className="text-xs text-emerald-100">
                Official Meta compliance policies to ensure 100% deliverability and avoid account bans
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Section 1: Opt-in Consent */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Explicit Opt-In Consent Required
            </div>
            <p className="text-slate-700 leading-relaxed">
              Businesses must only broadcast to recipients who have explicitly consented to receive
              WhatsApp communications from your business (e.g. through a website checkbox, POS
              billing sign-up, or previous WhatsApp chat inquiry).
            </p>
            <div className="text-[11px] text-emerald-800 font-medium">
              💡 Tip: Always include an Opt-out button like &quot;Reply STOP to unsubscribe&quot; in
              promotional broadcasts.
            </div>
          </div>

          {/* Section 2: Messaging Tiers & Daily Limits */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              2. Meta Daily Messaging Limits (Tiers)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Tier 1</div>
                <div className="text-base font-black text-slate-900 mt-0.5">1,000</div>
                <div className="text-[10px] text-slate-500">users / 24 hrs</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Tier 2</div>
                <div className="text-base font-black text-slate-900 mt-0.5">10,000</div>
                <div className="text-[10px] text-slate-500">users / 24 hrs</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center ring-1 ring-emerald-500/20">
                <div className="text-[10px] text-emerald-700 font-semibold uppercase">
                  Tier 3 (Active)
                </div>
                <div className="text-base font-black text-emerald-900 mt-0.5">100,000</div>
                <div className="text-[10px] text-emerald-700">users / 24 hrs</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Tier 4</div>
                <div className="text-base font-black text-slate-900 mt-0.5">Unlimited</div>
                <div className="text-[10px] text-slate-500">users / 24 hrs</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Your tier upgrades automatically when you reach 50% of your daily limit with a High
              quality rating over 7 consecutive days.
            </p>
          </div>

          {/* Section 3: Anti-Ban & Quality Rating */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. Quality Rating & Ban Protection
            </h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">QBS-360 Anti-ban Throttling</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  PROTECTION ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                QBS-360 automatically introduces randomized dispatch delays (1.2s – 2.8s) between
                recipients and enforces Meta rate limits. Never send thousands of messages in a
                single second to prevent spam flags.
              </p>
            </div>
          </div>

          {/* Official Policy Link */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <a
              href="https://developers.facebook.com/docs/whatsapp/overview/business-terms"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              Meta WhatsApp Business Policy <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition cursor-pointer"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

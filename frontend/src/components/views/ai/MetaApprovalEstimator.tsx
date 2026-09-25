import React, { useMemo } from 'react';
import {
  Clock,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  ExternalLink,
} from 'lucide-react';

export interface MetaApprovalEstimatorProps {
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | string;
  headerType?: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | string;
  buttons?: Array<{ type: string; url?: string; text?: string }>;
  bodyText?: string;
  hasVariables?: boolean;
  variablesSampled?: boolean;
  compact?: boolean;
}

export interface ApprovalEstimate {
  minMinutes: number;
  maxMinutes: number;
  formattedDuration: string;
  tier: 'Tier 1: AI Instant Validation' | 'Tier 1: NLP Fast-Track' | 'Tier 2: Content & Policy Queue';
  confidenceScore: number; // 0 - 100
  confidenceRating: 'High' | 'Moderate' | 'Action Recommended';
  speedBadge: 'lightning' | 'fast' | 'standard';
  factors: Array<{ label: string; impact: string; type: 'neutral' | 'positive' | 'warning' }>;
  recommendations: string[];
}

export function calculateMetaApprovalDuration({
  category,
  headerType = 'NONE',
  buttons = [],
  bodyText = '',
  hasVariables = false,
  variablesSampled = true,
}: MetaApprovalEstimatorProps): ApprovalEstimate {
  const normCat = (category || 'MARKETING').toUpperCase();
  const normHeader = (headerType || 'NONE').toUpperCase();

  let baseMin = 10;
  let baseMax = 35;
  let tier: ApprovalEstimate['tier'] = 'Tier 2: Content & Policy Queue';
  let speedBadge: ApprovalEstimate['speedBadge'] = 'standard';
  let confidence = 92;
  const factors: ApprovalEstimate['factors'] = [];
  const recommendations: string[] = [];

  // 1. Category Baseline
  if (normCat === 'AUTHENTICATION') {
    baseMin = 0.5; // ~30 secs
    baseMax = 1; // ~60 secs
    tier = 'Tier 1: AI Instant Validation';
    speedBadge = 'lightning';
    confidence += 7;
    factors.push({
      label: 'Authentication Category',
      impact: '⚡ Automated AI fast-pass (30-60 secs)',
      type: 'positive',
    });
  } else if (normCat === 'UTILITY') {
    baseMin = 1;
    baseMax = 3;
    tier = 'Tier 1: NLP Fast-Track';
    speedBadge = 'lightning';
    confidence += 6;
    factors.push({
      label: 'Utility Category',
      impact: '⚡ NLP Transactional Classifier (1-3 mins)',
      type: 'positive',
    });
  } else {
    // MARKETING
    baseMin = 10;
    baseMax = 30;
    tier = 'Tier 2: Content & Policy Queue';
    speedBadge = 'standard';
    factors.push({
      label: 'Marketing Category',
      impact: 'Standard policy queue review (10-30 mins)',
      type: 'neutral',
    });
  }

  // 2. Header Asset Impact
  if (normHeader === 'IMAGE') {
    baseMin += 2;
    baseMax += 4;
    factors.push({
      label: 'Image Media Header',
      impact: '+2-4 mins for OCR text-overlay & safety scan',
      type: 'neutral',
    });
  } else if (normHeader === 'DOCUMENT') {
    baseMin += 2;
    baseMax += 5;
    factors.push({
      label: 'PDF Document Header',
      impact: '+2-5 mins for document parser verification',
      type: 'neutral',
    });
  } else if (normHeader === 'VIDEO') {
    baseMin += 4;
    baseMax += 8;
    factors.push({
      label: 'Video Media Header',
      impact: '+4-8 mins for video stream encoding analysis',
      type: 'neutral',
    });
  }

  // 3. Dynamic URLs & Buttons Impact
  const dynamicUrlButtons = buttons.filter(
    (b) => b.type === 'URL' && (b.url?.includes('{{') || b.url?.includes('http'))
  );
  if (dynamicUrlButtons.length > 0) {
    baseMin += 1;
    baseMax += 3;
    factors.push({
      label: 'Website Link / Dynamic URL',
      impact: '+1-3 mins for domain safety & redirect checks',
      type: 'neutral',
    });
  }

  // 4. Content Heuristics & Confidence Adjustment
  const uppercaseMatches = bodyText.match(/[A-Z]{4,}/g) || [];
  if (uppercaseMatches.length > 2) {
    confidence -= 8;
    recommendations.push('Avoid multiple consecutive ALL-CAPS words to prevent spam-filter delays.');
    factors.push({
      label: 'Excessive Capitalization',
      impact: 'May trigger manual spam review (+15 mins)',
      type: 'warning',
    });
  }

  const spamTriggers = [
    'free cash',
    'lottery',
    'win money',
    '100% free',
    'crypto',
    'casino',
    'guaranteed returns',
    'instant loan',
  ];
  const containsSpamWords = spamTriggers.some((w) => bodyText.toLowerCase().includes(w));
  if (containsSpamWords) {
    confidence -= 18;
    baseMin += 15;
    baseMax += 60;
    recommendations.push(
      'Contains commercial risk keywords. Meta will likely escalate to manual compliance tier.'
    );
    factors.push({
      label: 'High-Risk Keywords Detected',
      impact: 'Triggers manual human reviewer inspection (+1-2 hours)',
      type: 'warning',
    });
  }

  // Variables sampling
  if (hasVariables && !variablesSampled) {
    confidence -= 10;
    recommendations.push(
      'Always provide sample values for {{1}}, {{2}} to prevent automatic Meta Graph rejection.'
    );
  }

  // Bound confidence between 60 and 99
  const boundedConfidence = Math.min(99, Math.max(65, confidence));

  let confidenceRating: ApprovalEstimate['confidenceRating'] = 'High';
  if (boundedConfidence < 75) {
    confidenceRating = 'Action Recommended';
  } else if (boundedConfidence < 88) {
    confidenceRating = 'Moderate';
  }

  // Format Duration string
  let formattedDuration = '';
  if (baseMax <= 1) {
    formattedDuration = '⚡ ~30 - 60 seconds';
  } else if (baseMax <= 5) {
    formattedDuration = `⚡ ~${Math.round(baseMin)} - ${Math.round(baseMax)} minutes`;
  } else if (baseMax < 60) {
    formattedDuration = `⏱️ ~${Math.round(baseMin)} - ${Math.round(baseMax)} minutes`;
  } else {
    formattedDuration = `⏱️ ~${Math.round(baseMin / 60)} - ${Math.round(baseMax / 60)} hours`;
  }

  return {
    minMinutes: baseMin,
    maxMinutes: baseMax,
    formattedDuration,
    tier,
    confidenceScore: boundedConfidence,
    confidenceRating,
    speedBadge,
    factors,
    recommendations,
  };
}

export const MetaApprovalEstimator: React.FC<MetaApprovalEstimatorProps> = (props) => {
  const { compact = false } = props;
  const estimate = useMemo(() => calculateMetaApprovalDuration(props), [props]);

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          </div>
          <div className="truncate">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
              Meta Approval ETA
            </div>
            <div className="font-extrabold text-slate-900 text-xs truncate">
              {estimate.formattedDuration}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 border ${
              estimate.confidenceScore >= 90
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            {estimate.confidenceScore}% Confidence
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 p-4 shadow-xs space-y-3.5 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-slate-900 text-xs tracking-tight">
                Meta Approval Intelligence & ETA
              </h4>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300 uppercase">
                Graph v21.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Dynamic verification speed calculated based on Meta classifier heuristics
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border shadow-2xs shrink-0 ${
            estimate.speedBadge === 'lightning'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-800 text-emerald-300 border-slate-700'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
          {estimate.tier.split(':')[0]}
        </span>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Estimated Duration */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600" />
            Estimated Approval ETA
          </div>
          <div className="text-base font-black text-emerald-700 mt-1">
            {estimate.formattedDuration}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">{estimate.tier}</div>
        </div>

        {/* Approval Probability Score */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            First-Pass Approval Probability
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-black text-slate-900">
              {estimate.confidenceScore}%
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                estimate.confidenceScore >= 90
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {estimate.confidenceRating}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                estimate.confidenceScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${estimate.confidenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Heuristic Factors Breakdown */}
      {estimate.factors.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Review Factors & Speed Impact
          </div>
          <div className="space-y-1">
            {estimate.factors.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/70 border border-slate-200/60"
              >
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px]">
                  {f.type === 'positive' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : f.type === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  {f.label}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    f.type === 'positive'
                      ? 'text-emerald-700'
                      : f.type === 'warning'
                        ? 'text-amber-700'
                        : 'text-slate-600'
                  }`}
                >
                  {f.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations & Tips */}
      {estimate.recommendations.length > 0 && (
        <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Meta Speed Optimization Recommendation
          </div>
          {estimate.recommendations.map((r, i) => (
            <p key={i} className="text-[10px] leading-relaxed text-amber-800/90">
              • {r}
            </p>
          ))}
        </div>
      )}

      {/* Meta Webhook Notification Notice */}
      <div className="flex items-center gap-2 text-[10px] text-emerald-800 bg-emerald-100/60 border border-emerald-200/60 rounded-xl p-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          <strong>Real-Time Notification Armed:</strong> You will be notified instantly via in-app
          chime and desktop alert the moment Meta webhook confirms approval.
        </span>
      </div>
    </div>
  );
};

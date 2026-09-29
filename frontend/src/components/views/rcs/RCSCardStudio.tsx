import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Sparkles,
  ShieldCheck,
  Globe,
  Phone,
  MapPin,
  Calendar,
  Copy,
  Plus,
  Trash2,
  Send,
  Eye,
  Code,
  Moon,
  Sun,
  X,
  ExternalLink,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCheck,
  Smile,
  Mic,
  MoreVertical,
  ArrowLeft,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import {
  RCSTemplateItem,
  RCSCardItem,
  RCSSuggestionAction,
  RCSSuggestionType,
} from '@/types';

interface RCSCardStudioProps {
  onSendToChat?: (card: RCSCardItem, suggestions: RCSSuggestionAction[]) => void;
  onLaunchCampaign?: (card: RCSCardItem) => void;
}

export const RCSCardStudio: React.FC<RCSCardStudioProps> = ({
  onSendToChat,
  onLaunchCampaign,
}) => {
  const {
    rcsTemplates,
    saveRcsTemplate,
    deleteRcsTemplate,
    activeRcsConversationId,
    rcsConversations,
    sendRcsMessage,
    addToast,
  } = useQiyamStore();

  const activeConv = rcsConversations.find((c) => c.id === activeRcsConversationId) || rcsConversations[0];

  // Active loaded template ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(rcsTemplates[0]?.id || 'tmpl-icici-gold');

  // Studio Builder State
  const initialTmpl = rcsTemplates.find((t) => t.id === selectedTemplateId) || rcsTemplates[0];

  const [cardType, setCardType] = useState<'Rich Card' | 'Carousel'>(initialTmpl?.type || 'Rich Card');
  const [senderName, setSenderName] = useState(initialTmpl?.brandSender?.name || 'ICICI Bank Gold Loans');
  const [senderLogo, setSenderLogo] = useState(
    initialTmpl?.brandSender?.logoUrl ||
      'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=150&auto=format&fit=crop&q=80'
  );
  const [badgeColor, setBadgeColor] = useState(initialTmpl?.brandSender?.badgeColor || '#B91C1C');
  const [carrierTag, setCarrierTag] = useState('Jio • RCS');

  // Card Content
  const [cardTitle, setCardTitle] = useState(
    initialTmpl?.card?.title || 'Big plans for your business? Let our Gold Loan help! 😎'
  );
  const [cardDesc, setCardDesc] = useState(
    initialTmpl?.card?.description ||
      '🤝Funds for business? Sorted\n🔐Gold ownership? Untouched\n🔄Disbursal? Quick\n✅Backed by? ICICI Bank\n\nApply now to fuel your dreams!'
  );
  const [cardMedia, setCardMedia] = useState(
    initialTmpl?.card?.mediaUrl ||
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&auto=format&fit=crop&q=80'
  );
  const [mediaHeight, setMediaHeight] = useState<'SHORT' | 'MEDIUM' | 'TALL'>(
    initialTmpl?.card?.mediaHeight || 'MEDIUM'
  );

  // Actions inside Card (UP 2.4 supports up to 4 actions)
  const [actions, setActions] = useState<RCSSuggestionAction[]>(
    initialTmpl?.card?.actions || [
      {
        type: 'url',
        label: '👉 Explore now!',
        value: 'https://www.icicibank.com/personal-banking/loans/gold-loan?source=rcs_direct',
      },
      {
        type: 'dial',
        label: 'Call Branch Manager',
        value: '18001080',
      },
    ]
  );

  // Suggestions below message (Quick Reply Chips)
  const [suggestions, setSuggestions] = useState<RCSSuggestionAction[]>(
    initialTmpl?.suggestions || [
      { type: 'reply', label: '💰 Check Loan Eligibility' },
      { type: 'reply', label: '📍 Nearest Branch' },
      { type: 'dial', label: '📞 Helpdesk 1800-1080', value: '18001080' },
    ]
  );

  // Compliance Opt-Out Pill
  const [includeOptOut, setIncludeOptOut] = useState<boolean>(initialTmpl?.includeOptOut ?? true);

  // Carousel Cards (for Carousel mode)
  const [carouselCards, setCarouselCards] = useState<RCSCardItem[]>(
    initialTmpl?.carousel || [
      {
        id: 'car-c1',
        title: 'Silver AMC (₹2,499/yr)',
        description: '2 Deep Jet Wash services + filter replacement + standard 4-hr SLA.',
        mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
        actions: [
          { type: 'reply', label: 'Select Silver', value: 'SELECT_SILVER' },
          { type: 'url', label: 'Brochure PDF', value: 'https://qiyam.in/amc/silver' },
        ],
      },
      {
        id: 'car-c2',
        title: 'Gold AMC (₹4,499/yr)',
        description: '4 Jet Washes + gas top-up + 2-hr emergency breakdown response.',
        mediaUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
        actions: [
          { type: 'reply', label: 'Select Gold', value: 'SELECT_GOLD' },
          { type: 'url', label: 'Brochure PDF', value: 'https://qiyam.in/amc/gold' },
        ],
      },
    ]
  );
  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0);

  // Phone Simulator Theme (Dark mode matches the user's Android screenshots!)
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  // Payload Modal
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);

  // Quick Emoji Bullets
  const EMOJI_TOOLBAR = [
    { emoji: '🤝', label: 'Partnership' },
    { emoji: '🔐', label: 'Security' },
    { emoji: '🔄', label: 'Speed' },
    { emoji: '✅', label: 'Verified' },
    { emoji: '👉', label: 'Pointer' },
    { emoji: '💳', label: 'Card' },
    { emoji: '📍', label: 'Pin' },
    { emoji: '📞', label: 'Phone' },
    { emoji: '🔥', label: 'Hot' },
    { emoji: '🎉', label: 'Celebration' },
    { emoji: '⭐', label: 'Star' },
    { emoji: '⚡', label: 'Instant' },
  ];

  const handleInsertEmoji = (emoji: string) => {
    setCardDesc((prev) => {
      if (!prev) return `${emoji} `;
      if (prev.endsWith('\n')) return `${prev}${emoji} `;
      return `${prev}\n${emoji} `;
    });
  };

  // Load Preset Template
  const handleSelectTemplate = (tmpl: RCSTemplateItem) => {
    setSelectedTemplateId(tmpl.id);
    setCardType(tmpl.type);
    setSenderName(tmpl.brandSender.name);
    setSenderLogo(tmpl.brandSender.logoUrl);
    setBadgeColor(tmpl.brandSender.badgeColor || '#B91C1C');
    setCardTitle(tmpl.card.title);
    setCardDesc(tmpl.card.description);
    setCardMedia(tmpl.card.mediaUrl || '');
    setMediaHeight(tmpl.card.mediaHeight || 'MEDIUM');
    setActions([...tmpl.card.actions]);
    setSuggestions([...tmpl.suggestions]);
    setIncludeOptOut(tmpl.includeOptOut);
    if (tmpl.carousel && tmpl.carousel.length > 0) {
      setCarouselCards([...tmpl.carousel]);
      setActiveCarouselSlide(0);
    }
    addToast(`Template loaded: "${tmpl.name}"`, 'info');
  };

  // Action Button Management
  const handleAddAction = () => {
    if (actions.length >= 4) {
      addToast('GSMA Universal Profile 2.4 allows up to 4 actions per card', 'warning');
      return;
    }
    setActions((prev) => [
      ...prev,
      {
        type: 'url',
        label: '👉 Explore now!',
        value: 'https://example.com',
      },
    ]);
  };

  const handleUpdateAction = (idx: number, patch: Partial<RCSSuggestionAction>) => {
    setActions((prev) => prev.map((act, i) => (i === idx ? { ...act, ...patch } : act)));
  };

  const handleRemoveAction = (idx: number) => {
    setActions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Suggestion Chips Management
  const handleAddSuggestion = () => {
    setSuggestions((prev) => [
      ...prev,
      { type: 'reply', label: '💬 Quick Reply Option' },
    ]);
  };

  const handleUpdateSuggestion = (idx: number, patch: Partial<RCSSuggestionAction>) => {
    setSuggestions((prev) => prev.map((sug, i) => (i === idx ? { ...sug, ...patch } : sug)));
  };

  const handleRemoveSuggestion = (idx: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save current design as a new reusable template
  const handleSaveAsTemplate = () => {
    const newTmpl: RCSTemplateItem = {
      id: `tmpl-custom-${Date.now()}`,
      name: cardTitle.length > 30 ? `${cardTitle.slice(0, 30)}... (Custom)` : `${cardTitle} (Custom)`,
      category: 'Banking & Finance',
      type: cardType,
      brandSender: {
        name: senderName,
        logoUrl: senderLogo,
        badgeColor,
      },
      card: {
        id: `card-${Date.now()}`,
        title: cardTitle,
        description: cardDesc,
        mediaUrl: cardMedia,
        mediaHeight,
        actions,
      },
      carousel: cardType === 'Carousel' ? carouselCards : undefined,
      suggestions,
      includeOptOut,
    };
    saveRcsTemplate(newTmpl);
  };

  // Send directly to the active live conversation
  const handleSendToActiveChat = async () => {
    const targetCard: RCSCardItem = {
      id: `card-${Date.now()}`,
      title: cardTitle,
      description: cardDesc,
      mediaUrl: cardMedia,
      mediaHeight,
      actions,
    };

    if (onSendToChat) {
      onSendToChat(targetCard, suggestions);
    } else {
      await sendRcsMessage({
        conversationId: activeConv?.id,
        text: cardTitle,
        card: cardType === 'Rich Card' ? targetCard : undefined,
        carousel: cardType === 'Carousel' ? carouselCards : undefined,
        suggestions,
        fallbackToSms: true,
      });
      addToast(`RCS Rich Card sent to ${activeConv?.contactName || 'customer'}!`, 'success');
    }
  };

  // Interactive Click Handlers for Live Phone Preview
  const handleActionClick = (act: RCSSuggestionAction) => {
    if (act.type === 'url') {
      window.open(act.value || 'https://google.com', '_blank');
      addToast(`Opened URL: ${act.value}`, 'info');
    } else if (act.type === 'dial') {
      navigator.clipboard?.writeText(act.value || '18001080');
      addToast(`Dialer initiated: ${act.value} (Copied to clipboard)`, 'info');
    } else if (act.type === 'copy') {
      navigator.clipboard?.writeText(act.value || 'FESTIVE40');
      addToast(`Copied code "${act.value || 'FESTIVE40'}" to clipboard!`, 'success');
    } else if (act.type === 'location') {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(act.value || '11.2588,75.7804')}`, '_blank');
      addToast(`Opened Google Maps: ${act.value}`, 'info');
    } else if (act.type === 'calendar') {
      addToast(`Event scheduled in Google Calendar: ${act.value}`, 'success');
    } else if (act.type === 'reply') {
      addToast(`Quick Reply chip tapped: "${act.label}"`, 'info');
    } else if (act.type === 'unsubscribe') {
      addToast('Opt-out confirmed: Customer unsubscribed from RCS promotional messages', 'warning');
    }
  };

  // Build the authentic Google RBM REST API v1 JSON Payload
  const rbmJsonPayload = {
    contentMessage: {
      richCard:
        cardType === 'Rich Card'
          ? {
              standaloneCard: {
                cardOrientation: 'VERTICAL',
                thumbnailImageAlignment: 'RIGHT',
                cardContent: {
                  title: cardTitle,
                  description: cardDesc,
                  media: {
                    height: mediaHeight,
                    contentInfo: {
                      fileUrl: cardMedia,
                    },
                  },
                  suggestions: actions.map((act) => {
                    if (act.type === 'url') {
                      return {
                        action: {
                          text: act.label,
                          postbackData: `POSTBACK_${act.label.replace(/\s+/g, '_').toUpperCase()}`,
                          openUrlAction: { url: act.value || 'https://example.com' },
                        },
                      };
                    } else if (act.type === 'dial') {
                      return {
                        action: {
                          text: act.label,
                          postbackData: `POSTBACK_DIAL_${act.value}`,
                          dialAction: { phoneNumber: act.value || '+9118001080' },
                        },
                      };
                    } else if (act.type === 'location') {
                      return {
                        action: {
                          text: act.label,
                          postbackData: `POSTBACK_MAP_${act.value}`,
                          viewLocationAction: { query: act.value || '11.2588,75.7804' },
                        },
                      };
                    } else if (act.type === 'calendar') {
                      return {
                        action: {
                          text: act.label,
                          postbackData: `POSTBACK_CAL_${act.value}`,
                          createCalendarEventAction: {
                            startTime: act.value || new Date().toISOString(),
                            title: cardTitle,
                          },
                        },
                      };
                    } else if (act.type === 'copy') {
                      return {
                        action: {
                          text: act.label,
                          postbackData: `POSTBACK_COPY_${act.value}`,
                          clipboardAction: { copyText: act.value || 'PROMO' },
                        },
                      };
                    }
                    return {
                      reply: {
                        text: act.label,
                        postbackData: `POSTBACK_REPLY_${act.label}`,
                      },
                    };
                  }),
                },
              },
            }
          : {
              carouselCard: {
                cardWidth: 'MEDIUM',
                cardContents: carouselCards.map((c) => ({
                  title: c.title,
                  description: c.description,
                  media: {
                    height: 'MEDIUM',
                    contentInfo: { fileUrl: c.mediaUrl },
                  },
                  suggestions: c.actions.map((act) => ({
                    action: {
                      text: act.label,
                      postbackData: `POSTBACK_${act.label}`,
                    },
                  })),
                })),
              },
            },
      suggestions: suggestions.map((s) => ({
        reply: {
          text: s.label,
          postbackData: `CHIP_${s.label.replace(/\s+/g, '_').toUpperCase()}`,
        },
      })),
    },
  };

  return (
    <div className="h-full w-full bg-[#F8FAFC] text-slate-800 flex flex-col overflow-hidden">
      {/* 1. TOP TEMPLATE PRESET BAR */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Preset Library:
          </span>
          {rcsTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                selectedTemplateId === tmpl.id
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: tmpl.brandSender?.badgeColor || '#059669' }}
              />
              <span className="truncate max-w-[170px]">{tmpl.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPayloadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-slate-600" />
            <span>RBM JSON</span>
          </button>
          <button
            onClick={handleSaveAsTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Save as Template</span>
          </button>
        </div>
      </div>

      {/* 2. SPLIT WORKSPACE: BUILDER CONTROLS (LEFT) + LIVE PHONE SIMULATOR (RIGHT) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANE: VISUAL CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 overflow-y-auto p-6 space-y-6 border-r border-slate-200 bg-white">
          {/* Section 1: Message Format & Brand Sender Identity */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Sender Identity &amp; Layout
              </h3>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setCardType('Rich Card')}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition ${
                    cardType === 'Rich Card'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rich Card (Standalone)
                </button>
                <button
                  onClick={() => setCardType('Carousel')}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition ${
                    cardType === 'Carousel'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Swipeable Carousel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Brand Sender Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Sender Logo URL</label>
                <input
                  type="text"
                  value={senderLogo}
                  onChange={(e) => setSenderLogo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Badge Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-9 h-8 p-0.5 rounded border border-slate-200 bg-white cursor-pointer"
                  />
                  <input
                    type="text"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Card Banner Media & Layout */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Hero Media &amp; Aspect Ratio
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Height:</span>
                {(['SHORT', 'MEDIUM', 'TALL'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setMediaHeight(h)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                      mediaHeight === h
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <img
                src={cardMedia}
                alt="Banner Preview"
                className="w-24 h-16 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800';
                }}
              />
              <div className="flex-1">
                <label className="text-slate-700 text-xs font-semibold block mb-1">
                  Hero Image / Banner URL (Landscape 16:9 Recommended)
                </label>
                <input
                  type="text"
                  value={cardMedia}
                  onChange={(e) => setCardMedia(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Headlines, Body & Emoji Bullet Formatting */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Card Title &amp; Emoji Bulleted Description
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {cardTitle.length}/200 chars
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Card Headline / Title (Bold Heading)
                </label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">
                    Description Body (Supports Emojis, Line breaks, Bullets)
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    1-Click Bullet Insert
                  </span>
                </div>

                {/* Emoji Bullet Toolbar */}
                <div className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Bullets:</span>
                  {EMOJI_TOOLBAR.map((item) => (
                    <button
                      key={item.emoji}
                      onClick={() => handleInsertEmoji(item.emoji)}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded border border-slate-200 text-xs transition cursor-pointer shadow-2xs"
                      title={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>

                <textarea
                  value={cardDesc}
                  onChange={(e) => setCardDesc(e.target.value)}
                  rows={5}
                  placeholder="Enter message body with bullets and emojis..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-normal leading-relaxed text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Universal Action Buttons Builder (ALL 7 Types) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Full-Width Action Buttons ({actions.length}/4)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Universal Profile 2.4 compliant buttons: Open URL, Dial, Map Pin, Calendar, Copy Code &amp; Quick Reply.
                </p>
              </div>

              <button
                onClick={handleAddAction}
                disabled={actions.length >= 4}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Button</span>
              </button>
            </div>

            <div className="space-y-3">
              {actions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      Button #{idx + 1}
                    </span>

                    <button
                      onClick={() => handleRemoveAction(idx)}
                      className="text-slate-400 hover:text-red-600 transition cursor-pointer p-1"
                      title="Remove Button"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                    {/* Action Type Dropdown */}
                    <div className="sm:col-span-4">
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Action Type</label>
                      <select
                        value={act.type}
                        onChange={(e) =>
                          handleUpdateAction(idx, { type: e.target.value as RCSSuggestionType })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                      >
                        <option value="url">🌐 Open URL / Deep Link</option>
                        <option value="dial">📞 Click to Call (Phone)</option>
                        <option value="copy">📋 1-Tap Copy Code / OTP</option>
                        <option value="location">📍 View Location / Maps</option>
                        <option value="calendar">📅 Schedule Calendar Event</option>
                        <option value="reply">💬 Suggested Quick Reply</option>
                        <option value="unsubscribe">✕ Opt-Out Unsubscribe</option>
                      </select>
                    </div>

                    {/* Label Input */}
                    <div className="sm:col-span-4">
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Button Text / Label</label>
                      <input
                        type="text"
                        value={act.label}
                        onChange={(e) => handleUpdateAction(idx, { label: e.target.value })}
                        placeholder="e.g. 👉 Explore now!"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>

                    {/* Target / Value Input */}
                    <div className="sm:col-span-4">
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                        {act.type === 'url'
                          ? 'Web URL / Deep Link'
                          : act.type === 'dial'
                          ? 'Phone Number'
                          : act.type === 'copy'
                          ? 'Text to Copy to Clipboard'
                          : act.type === 'location'
                          ? 'Coordinates (Lat, Long)'
                          : act.type === 'calendar'
                          ? 'ISO Start Date'
                          : 'Trigger Text'}
                      </label>
                      <input
                        type="text"
                        value={act.value || ''}
                        onChange={(e) => handleUpdateAction(idx, { value: e.target.value })}
                        placeholder={
                          act.type === 'url'
                            ? 'https://example.com'
                            : act.type === 'dial'
                            ? '+91 18001080'
                            : act.type === 'copy'
                            ? 'FESTIVE40'
                            : act.type === 'location'
                            ? '11.2588,75.7804'
                            : '2026-10-02T10:00:00'
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Suggestions (Chips below message) & Opt-Out Pill */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Floating Suggestion Chips &amp; Compliance Opt-Out
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Quick reply chips floating below the card + Google mandatory unsubscribe pill.
                </p>
              </div>

              <button
                onClick={handleAddSuggestion}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Chip</span>
              </button>
            </div>

            {/* Chips list */}
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs"
                >
                  <input
                    type="text"
                    value={sug.label}
                    onChange={(e) => handleUpdateSuggestion(idx, { label: e.target.value })}
                    className="bg-transparent border-none text-slate-800 text-xs font-medium focus:outline-none w-36"
                  />
                  <button
                    onClick={() => handleRemoveSuggestion(idx)}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Compliance Opt-Out Toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Google Compliance Unsubscribe Pill</span>
                <span className="text-[10px] text-slate-400">("Unsubscribe to stop receiving messages ✕")</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOptOut}
                  onChange={(e) => setIncludeOptOut(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Section 6: Action Footer Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Active RCS recipient: <span className="font-bold text-slate-800">{activeConv?.contactName || 'Dr. Fathima Zahra'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onLaunchCampaign && onLaunchCampaign({
                  id: `card-${Date.now()}`,
                  title: cardTitle,
                  description: cardDesc,
                  mediaUrl: cardMedia,
                  mediaHeight,
                  actions,
                })}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                <span>Broadcast Campaign</span>
              </button>

              <button
                onClick={handleSendToActiveChat}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Customer Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: INTERACTIVE GOOGLE MESSAGES PHONE SIMULATOR (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-100/70 p-6 flex flex-col items-center justify-start overflow-y-auto">
          {/* Theme switcher bar */}
          <div className="w-full max-w-[360px] mb-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Android Google Messages</span>
            </div>

            {/* Dark / Light Toggle */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
              <button
                onClick={() => setPreviewTheme('dark')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                  previewTheme === 'dark'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark Mode</span>
              </button>

              <button
                onClick={() => setPreviewTheme('light')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                  previewTheme === 'light'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Android Device Shell */}
          <div
            className={`w-full max-w-[360px] rounded-[42px] border-[10px] border-slate-900 shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 ${
              previewTheme === 'dark' ? 'bg-[#1E1F22] text-white' : 'bg-[#F8FAFC] text-slate-900'
            }`}
            style={{ height: '760px' }}
          >
            {/* Phone Top Notch / Speaker & Status Bar */}
            <div
              className={`px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono shrink-0 ${
                previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <span>10:14</span>
              <div className="w-16 h-4 bg-slate-900 rounded-full" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>85%</span>
              </div>
            </div>

            {/* Google Messages Top App Header */}
            <div
              className={`px-4 py-2.5 flex items-center justify-between border-b shrink-0 ${
                previewTheme === 'dark'
                  ? 'bg-[#1E1F22] border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ArrowLeft className="w-4 h-4 cursor-pointer text-slate-400 hover:text-white" />
                <div className="relative shrink-0">
                  <img
                    src={senderLogo}
                    alt={senderName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-600"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=150';
                    }}
                  />
                  {/* Verified Crest Badge */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] text-white font-bold ring-1 ring-[#1E1F22]"
                    style={{ backgroundColor: badgeColor }}
                  >
                    ✓
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold truncate">{senderName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Verified Business Account
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="w-3.5 h-3.5 cursor-pointer" />
                <MoreVertical className="w-3.5 h-3.5 cursor-pointer" />
              </div>
            </div>

            {/* Conversation Area with Hero Rich Card */}
            <div
              className={`flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none ${
                previewTheme === 'dark' ? 'bg-[#141518]' : 'bg-[#F1F5F9]'
              }`}
            >
              {/* RCS Business Notice Pill */}
              <div className="text-center my-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-[10px] font-medium ${
                    previewTheme === 'dark'
                      ? 'bg-[#2B2D31] text-slate-400'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  This is an RCS for Business chat. <span className="underline cursor-pointer">Learn more</span>
                </span>
              </div>

              {/* Unread Pill Separator */}
              <div className="flex items-center justify-center my-1.5">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                  — Unread —
                </span>
              </div>

              {/* STANDALONE RICH CARD (Replicating Screenshot 1 & 2) */}
              {cardType === 'Rich Card' ? (
                <div
                  className={`rounded-2xl overflow-hidden border shadow-lg transition-all ${
                    previewTheme === 'dark'
                      ? 'bg-[#2B2D31] border-slate-700/80 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {/* Hero Media Banner */}
                  {cardMedia && (
                    <div
                      className={`w-full overflow-hidden bg-slate-800 ${
                        mediaHeight === 'SHORT'
                          ? 'h-28'
                          : mediaHeight === 'TALL'
                          ? 'h-52'
                          : 'h-40'
                      }`}
                    >
                      <img
                        src={cardMedia}
                        alt={cardTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800';
                        }}
                      />
                    </div>
                  )}

                  {/* Card Content Body */}
                  <div className="p-3.5 space-y-2">
                    <h4 className="text-xs font-bold leading-snug">
                      {cardTitle}
                    </h4>

                    <p
                      className={`text-[11px] leading-relaxed whitespace-pre-wrap ${
                        previewTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {cardDesc}
                    </p>

                    {/* FULL-WIDTH ACTION BUTTONS (Exact Match to User Screenshots) */}
                    {actions && actions.length > 0 && (
                      <div className="pt-2 space-y-2">
                        {actions.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(act)}
                            className={`w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-xs ${
                              previewTheme === 'dark'
                                ? 'bg-[#383A40] hover:bg-[#43464D] text-white border border-slate-600/50'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {act.type === 'url' && <Globe className="w-3.5 h-3.5 text-blue-400" />}
                            {act.type === 'dial' && <Phone className="w-3.5 h-3.5 text-emerald-400" />}
                            {act.type === 'copy' && <Copy className="w-3.5 h-3.5 text-purple-400" />}
                            {act.type === 'location' && <MapPin className="w-3.5 h-3.5 text-rose-400" />}
                            {act.type === 'calendar' && <Calendar className="w-3.5 h-3.5 text-amber-400" />}
                            {act.type === 'reply' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            {act.type === 'unsubscribe' && <X className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* CAROUSEL MODE */
                <div className="space-y-2">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                    {carouselCards.map((c, idx) => (
                      <div
                        key={c.id}
                        className={`w-60 shrink-0 rounded-2xl overflow-hidden border shadow-lg snap-center ${
                          previewTheme === 'dark'
                            ? 'bg-[#2B2D31] border-slate-700/80 text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        {c.mediaUrl && (
                          <img src={c.mediaUrl} alt={c.title} className="w-full h-28 object-cover" />
                        )}
                        <div className="p-3 space-y-1.5">
                          <h5 className="text-xs font-bold truncate">{c.title}</h5>
                          <p
                            className={`text-[10px] line-clamp-2 ${
                              previewTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {c.description}
                          </p>
                          {c.actions && c.actions.length > 0 && (
                            <button
                              onClick={() => handleActionClick(c.actions[0])}
                              className={`w-full py-1.5 px-3 rounded-full text-[11px] font-bold mt-2 cursor-pointer ${
                                previewTheme === 'dark'
                                  ? 'bg-[#383A40] text-white hover:bg-[#43464D]'
                                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                              }`}
                            >
                              {c.actions[0].label}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floating Compliance Unsubscribe Pill (Matches Bottom of Screenshots) */}
              {includeOptOut && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() =>
                      handleActionClick({
                        type: 'unsubscribe',
                        label: 'Unsubscribe',
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition cursor-pointer border ${
                      previewTheme === 'dark'
                        ? 'bg-[#2B2D31] text-slate-300 border-slate-700 hover:bg-[#35383F]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Unsubscribe to stop receiving messages</span>
                    <X className="w-2.5 h-2.5 text-slate-400" />
                  </button>
                </div>
              )}

              {/* Suggestions / Quick Reply Chips Below Message */}
              {suggestions && suggestions.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5 justify-end">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(sug)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                        previewTheme === 'dark'
                          ? 'bg-[#252830] text-blue-300 border border-blue-500/40 hover:bg-[#2F333E]'
                          : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {sug.type === 'dial' ? <Phone className="w-2.5 h-2.5" /> : null}
                      <span>{sug.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Google Messages Bottom Input Bar */}
            <div
              className={`p-2.5 border-t shrink-0 flex items-center gap-2 ${
                previewTheme === 'dark'
                  ? 'bg-[#1E1F22] border-slate-800 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <button className="p-1 rounded-full hover:bg-slate-800 transition cursor-pointer">
                <Plus className="w-4 h-4 text-blue-400" />
              </button>

              <div
                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-full text-xs ${
                  previewTheme === 'dark'
                    ? 'bg-[#2B2D31] text-slate-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-[11px] truncate">
                  <span className="font-semibold text-emerald-500">{carrierTag}</span> • RCS message
                </span>
                <Smile className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <button className="p-1.5 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RBM JSON PAYLOAD MODAL */}
      {isPayloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-600" />
                  Google RCS Business Messaging (RBM v1) JSON Payload
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Universal Profile 2.4 compliant wire payload sent to Google Cloud Jibe / carrier aggregator.
                </p>
              </div>
              <button
                onClick={() => setIsPayloadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-b-2xl">
              <pre className="whitespace-pre-wrap">{JSON.stringify(rbmJsonPayload, null, 2)}</pre>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Compatible with Google Jibe, Jio RBM, Airtel Business &amp; Infobip gateways
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(rbmJsonPayload, null, 2));
                  addToast('RBM JSON copied to clipboard!', 'success');
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Copy JSON Payload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

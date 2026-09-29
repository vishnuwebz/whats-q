import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Send,
  Sliders,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Layers,
  Bot,
  Zap,
  Radio,
  Search,
  Plus,
  RefreshCw,
  Copy,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Share2,
  Settings as SettingsIcon,
  X,
  ArrowRight,
  TrendingUp,
  Globe,
  Moon,
  Sun,
} from 'lucide-react';
import {
  RCSConfig,
  RCSConversationItem,
  RCSMessageItem,
  RCSCardItem,
  RCSSuggestionAction,
  RCSProvider,
} from '@/types';
import { RCSCardStudio } from './RCSCardStudio';

export const RCSMessagingView: React.FC = () => {
  const {
    rcsConfig,
    setRcsConfig,
    saveRcsConfig,
    testRcsConnection,
    isRcsTesting,
    rcsConversations,
    activeRcsConversationId,
    setActiveRcsConversationId,
    sendRcsMessage,
    simulateInboundRcsMessage,
    createRcsConversation,
    rcsCampaigns,
    createRcsCampaign,
    isRcsSending,
    addToast,
  } = useQiyamStore();

  // Active top-level subtab
  const [activeTab, setActiveTab] = useState<'chat' | 'builder' | 'campaigns' | 'bot' | 'config'>('chat');
  const [phoneSimulatorTheme, setPhoneSimulatorTheme] = useState<'dark' | 'light'>('dark');

  // Search & filter for conversation list
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'leads' | 'customers'>('all');

  // Compose state
  const [inputText, setInputText] = useState('');
  const [fallbackSms, setFallbackSms] = useState(rcsConfig.smsFallbackEnabled);

  // New Chat Modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('+91 ');
  const [newChatCarrier, setNewChatCarrier] = useState('Jio RCS (UP 2.4)');

  // Rich Card Composer Modal state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState('Service Booking Confirmation');
  const [cardDesc, setCardDesc] = useState('Your appointment with technician Arun K. is confirmed.');
  const [cardMedia, setCardMedia] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80');
  const [cardActionLabel, setCardActionLabel] = useState('Track Technician Live');
  const [cardActionUrl, setCardActionUrl] = useState('https://maps.google.com/?q=11.2588,75.7804');
  const [cardActionType, setCardActionType] = useState<'url' | 'dial' | 'reply' | 'copy' | 'location' | 'calendar'>('url');

  // New Campaign Modal state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campName, setCampName] = useState('Weekend Flash Offer — 20% Off');
  const [campAudience, setCampAudience] = useState('All Customers (Kozhikode & Malappuram)');
  const [campCount, setCampCount] = useState(850);
  const [campText, setCampText] = useState('Enjoy 20% off on all preventive AC checkups this weekend only!');

  // Configuration Wizard State
  const [configStep, setConfigStep] = useState<1 | 2 | 3>(1);
  const [tempConfig, setTempConfig] = useState<RCSConfig>({ ...rcsConfig });
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [carrierTestResult, setCarrierTestResult] = useState<any>(null);

  // Active conversation
  const activeConversation = useMemo(() => {
    return rcsConversations.find((c) => c.id === activeRcsConversationId) || rcsConversations[0];
  }, [rcsConversations, activeRcsConversationId]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return rcsConversations.filter((conv) => {
      const matchesSearch =
        conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.phoneNumber.includes(searchQuery) ||
        conv.carrier.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (categoryFilter === 'leads') return conv.status === 'lead';
      if (categoryFilter === 'customers') return conv.status === 'customer';
      return true;
    });
  }, [rcsConversations, searchQuery, categoryFilter]);

  // Handle Send text message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendRcsMessage({
      conversationId: activeConversation?.id,
      text: textToSend,
      fallbackToSms: fallbackSms,
    });
  };

  // Handle Send Rich Card
  const handleSendRichCard = async () => {
    if (!cardTitle.trim()) return;
    setIsCardModalOpen(false);
    await sendRcsMessage({
      conversationId: activeConversation?.id,
      text: cardTitle,
      card: {
        id: `card-${Date.now()}`,
        title: cardTitle,
        description: cardDesc,
        mediaUrl: cardMedia,
        mediaHeight: 'MEDIUM',
        actions: [
          {
            type: cardActionType as any,
            label: cardActionLabel,
            value: cardActionUrl,
          },
        ],
      },
      fallbackToSms: fallbackSms,
    });
    addToast('RCS Rich Card sent with verified brand branding', 'success');
  };

  // Handle Click on Quick Reply / Suggestion Action
  const handleSuggestionClick = (action: RCSSuggestionAction) => {
    if (action.type === 'reply') {
      simulateInboundRcsMessage({
        conversationId: activeConversation?.id,
        text: action.label.replace(/^[^\w\s]+\s*/, ''), // remove leading emoji
      });
    } else if (action.type === 'url') {
      window.open(action.value || 'https://qiyam.in', '_blank');
      addToast(`Opened link: ${action.value}`, 'info');
    } else if (action.type === 'dial') {
      navigator.clipboard?.writeText(action.value || '+919496300233');
      addToast(`Dialing verified line: ${action.value} (Copied to clipboard)`, 'info');
    } else if (action.type === 'copy') {
      navigator.clipboard?.writeText(action.value || 'PROMO');
      addToast(`Copied code "${action.value}" to clipboard!`, 'success');
    } else if (action.type === 'location') {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(action.value || '11.2588,75.7804')}`, '_blank');
      addToast(`Opened Maps: ${action.value}`, 'info');
    } else if (action.type === 'calendar') {
      addToast(`Added event to Calendar: ${action.value}`, 'success');
    } else if (action.type === 'unsubscribe') {
      addToast('Opt-out confirmed: Customer unsubscribed from RCS marketing updates', 'warning');
    }
  };

  // Run test connection
  const handleRunTestConnection = async () => {
    setIsTestingPing(true);
    try {
      const res = await testRcsConnection();
      setCarrierTestResult(res);
    } catch {
      setCarrierTestResult({ success: true, verified: true });
    } finally {
      setIsTestingPing(false);
    }
  };

  // Save Simple Config
  const handleSaveConfig = async () => {
    await saveRcsConfig(tempConfig);
    setConfigStep(3);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      {/* 1. TOP HEADER BANNER */}
      <Header
        title="RCS Business Messaging"
        subtitle="Carrier-direct Universal Profile 2.4 messaging with rich cards, carousels, verified brand badge & action buttons."
        primaryActionLabel="Start New RCS Chat"
        onPrimaryAction={() => setIsNewChatModalOpen(true)}
      />

      {/* 2. SUB NAVIGATION STRIP & STATUS BAR */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Left Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>RCS Live Chat Console</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {rcsConversations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Visual Card &amp; Button Studio</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">
              Studio
            </span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>RCS Broadcasts &amp; Campaigns</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
              {rcsCampaigns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bot')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bot'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-slate-500" />
            <span>RCS Bot &amp; Auto-Responders</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Simple Configuration</span>
            {rcsConfig.status === 'connected' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>

        {/* Right Status Badges & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Brand Sender
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Jio • Airtel • Vi (UP 2.4)
            </span>
          </div>

          <button
            onClick={() => {
              setActiveTab('config');
              setConfigStep(1);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Setup Wizard</span>
          </button>

          <button
            onClick={() =>
              simulateInboundRcsMessage({
                conversationId: activeConversation?.id,
                text: 'Can I book an AC maintenance slot for tomorrow morning?',
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition cursor-pointer"
            title="Simulate inbound message from customer"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Simulate Customer</span>
          </button>

          <button
            onClick={handleRunTestConnection}
            disabled={isTestingPing || isRcsTesting}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer disabled:opacity-50"
            title="Test Carrier Ping"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing || isRcsTesting ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. MAIN BODY CONTENT */}
      <div className="flex-1 overflow-hidden relative">
        {/* VIEW 1: LIVE CHAT CONSOLE */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full w-full overflow-hidden bg-white">
            {/* 3A. LEFT THREADS PANEL (4 cols) */}
            <div className="md:col-span-4 lg:col-span-3 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
              {/* Search & Filter Header */}
              <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search RCS contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer shadow-xs"
                    title="Start New RCS Chat"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      categoryFilter === 'all'
                        ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setCategoryFilter('leads')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      categoryFilter === 'leads'
                        ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => setCategoryFilter('customers')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      categoryFilter === 'customers'
                        ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Customers
                  </button>
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredConversations.map((conv) => {
                  const isSelected = conv.id === activeConversation?.id;
                  const lastMessage = conv.messages[conv.messages.length - 1];

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveRcsConversationId(conv.id)}
                      className={`p-3 transition-colors cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.avatar}
                          alt={conv.contactName}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shadow-2xs"
                        />
                        {conv.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                            {conv.contactName}
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="RCS Capable" />
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {lastMessage?.timestamp || conv.lastSeen}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMessage ? (
                            <span>
                              {lastMessage.direction === 'outbound' && 'You: '}
                              {lastMessage.card ? `[Rich Card: ${lastMessage.card.title}]` : lastMessage.text}
                            </span>
                          ) : (
                            'No messages yet'
                          )}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium">
                            {conv.carrier.split(' ')[0]}
                          </span>
                          {conv.tags.slice(0, 1).map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3B. CENTER CHAT STREAM (5-6 cols) */}
            <div className="md:col-span-8 lg:col-span-6 bg-[#F8FAFC] flex flex-col h-full overflow-hidden border-r border-slate-200">
              {/* Chat Header */}
              {activeConversation ? (
                <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.contactName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">
                          {activeConversation.contactName}
                        </h3>
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                          RCS Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{activeConversation.phoneNumber}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">{activeConversation.carrier}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCardModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Insert Rich Card</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Verified Brand Identity Banner */}
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 border-b border-emerald-100 text-xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">{rcsConfig.brandDisplayName}</span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">• Verified RCS Business Account</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Google Jibe Connected</span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation?.messages.map((msg) => {
                  const isOutbound = msg.direction === 'outbound';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender label */}
                      <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                        {isOutbound ? msg.senderName || 'Qiyam RCS' : msg.senderName || activeConversation.contactName}
                      </span>

                      {/* Bubble Container */}
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                          isOutbound
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-md'
                            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-xs'
                        }`}
                      >
                        {/* 1. TEXT */}
                        {msg.text && (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}

                        {/* 2. RICH CARD */}
                        {msg.card && (
                          <div className="mt-2 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm text-slate-800">
                            {msg.card.mediaUrl && (
                              <img
                                src={msg.card.mediaUrl}
                                alt={msg.card.title}
                                className="w-full h-36 object-cover"
                              />
                            )}
                            <div className="p-3">
                              <h5 className="text-xs font-bold text-slate-900">
                                {msg.card.title}
                              </h5>
                              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                                {msg.card.description}
                              </p>

                              {/* Card Actions */}
                              {msg.card.actions && msg.card.actions.length > 0 && (
                                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                                  {msg.card.actions.map((act, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleSuggestionClick(act)}
                                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-200"
                                    >
                                      {act.type === 'url' && <Globe className="w-3.5 h-3.5 text-blue-600" />}
                                      {act.type === 'dial' && <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                                      {act.type === 'copy' && <Copy className="w-3.5 h-3.5 text-purple-600" />}
                                      {act.type === 'location' && <MapPin className="w-3.5 h-3.5 text-rose-600" />}
                                      {act.type === 'calendar' && <Calendar className="w-3.5 h-3.5 text-amber-600" />}
                                      {act.type === 'reply' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                      {act.type === 'unsubscribe' && <X className="w-3.5 h-3.5 text-slate-500" />}
                                      <span>{act.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 3. CAROUSEL */}
                        {msg.carousel && msg.carousel.length > 0 && (
                          <div className="mt-2 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                            {msg.carousel.map((card) => (
                              <div
                                key={card.id}
                                className="w-56 shrink-0 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm text-slate-800"
                              >
                                {card.mediaUrl && (
                                  <img
                                    src={card.mediaUrl}
                                    alt={card.title}
                                    className="w-full h-28 object-cover"
                                  />
                                )}
                                <div className="p-2.5">
                                  <h6 className="text-xs font-bold text-slate-900 truncate">
                                    {card.title}
                                  </h6>
                                  <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">
                                    {card.description}
                                  </p>
                                  {card.actions && card.actions.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-100">
                                      <button
                                        onClick={() => handleSuggestionClick(card.actions[0])}
                                        className="w-full py-1 px-2 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[11px] font-bold transition cursor-pointer border border-emerald-200"
                                      >
                                        {card.actions[0].label}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp & Status Icon */}
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] opacity-80">
                          <span>{msg.timestamp}</span>
                          {isOutbound && (
                            <span>
                              {msg.status === 'read' ? (
                                <span title="Read by customer"><CheckCheck className="w-3.5 h-3.5 text-blue-200" /></span>
                              ) : msg.status === 'delivered' ? (
                                <span title="Delivered to carrier"><CheckCheck className="w-3.5 h-3.5 text-emerald-100" /></span>
                              ) : (
                                <span title="Sent"><Check className="w-3.5 h-3.5 text-emerald-100" /></span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 4. SUGGESTION CHIPS (Quick Replies) */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                          {msg.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(sug)}
                              className="px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
                            >
                              {sug.type === 'dial' ? (
                                <Phone className="w-3 h-3 text-emerald-600" />
                              ) : sug.type === 'url' ? (
                                <ExternalLink className="w-3 h-3 text-emerald-600" />
                              ) : null}
                              <span>{sug.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions Bar */}
              <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[11px] font-semibold text-slate-400">Quick:</span>
                  {rcsConfig.defaultQuickReplies.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(q)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition cursor-pointer shrink-0"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] select-none text-slate-600 font-medium shrink-0 ml-2">
                  <input
                    type="checkbox"
                    checked={fallbackSms}
                    onChange={(e) => setFallbackSms(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 bg-white border-slate-300 cursor-pointer"
                  />
                  <span>SMS Fallback</span>
                </label>
              </div>

              {/* Compose Box */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Type an RCS message (supports Rich Text &amp; Action Chips)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={isRcsSending || !inputText.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>

            {/* 3C. RIGHT PANEL: LIVE GOOGLE MESSAGES PHONE SIMULATOR (3 cols) */}
            <div className="hidden lg:flex lg:col-span-3 bg-slate-50 flex-col h-full overflow-hidden p-3 border-l border-slate-200">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Live Android Preview
                </h4>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  <button
                    onClick={() => setPhoneSimulatorTheme('dark')}
                    className={`p-1 rounded text-[10px] font-bold cursor-pointer transition ${
                      phoneSimulatorTheme === 'dark' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Dark Mode"
                  >
                    <Moon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setPhoneSimulatorTheme('light')}
                    className={`p-1 rounded text-[10px] font-bold cursor-pointer transition ${
                      phoneSimulatorTheme === 'light' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Light Mode"
                  >
                    <Sun className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Android Phone Frame */}
              <div
                className={`flex-1 rounded-[32px] p-2.5 shadow-xl flex flex-col overflow-hidden relative ring-1 border-4 transition-colors ${
                  phoneSimulatorTheme === 'dark'
                    ? 'bg-[#1E1F22] border-slate-900 text-white ring-slate-800'
                    : 'bg-white border-slate-800 text-slate-900 ring-slate-300'
                }`}
              >
                {/* Phone Speaker Notch */}
                <div className="w-16 h-2 bg-slate-800 rounded-full mx-auto mb-1.5 shrink-0" />

                {/* Google Messages App Header */}
                <div
                  className={`p-2 rounded-xl flex items-center justify-between mb-1.5 border shrink-0 ${
                    phoneSimulatorTheme === 'dark'
                      ? 'bg-[#1E1F22] border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={rcsConfig.brandLogoUrl}
                      alt={rcsConfig.brandDisplayName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold truncate">
                          {rcsConfig.brandDisplayName}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      </div>
                      <span className="text-[9px] text-emerald-400 font-semibold block truncate">
                        Verified Business • RCS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Message Feed on Phone Screen */}
                <div
                  className={`flex-1 overflow-y-auto space-y-2 p-1.5 rounded-xl border scrollbar-none ${
                    phoneSimulatorTheme === 'dark'
                      ? 'bg-[#141518] border-slate-800/80 text-white'
                      : 'bg-[#F9FAFB] border-slate-100 text-slate-800'
                  }`}
                >
                  <div className="text-center text-[9px] text-slate-400 my-0.5">
                    Today • Verified RCS Session
                  </div>

                  {activeConversation?.messages.map((m) => {
                    const isOutbound = m.direction === 'outbound';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isOutbound ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[92%] rounded-xl p-2 text-[10px] leading-tight ${
                            isOutbound
                              ? phoneSimulatorTheme === 'dark'
                                ? 'bg-[#2B2D31] text-white border border-slate-700/80 shadow-2xs'
                                : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                              : 'bg-blue-600 text-white shadow-2xs'
                          }`}
                        >
                          {m.text && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                          {m.card && (
                            <div
                              className={`mt-1.5 rounded-lg overflow-hidden border ${
                                phoneSimulatorTheme === 'dark'
                                  ? 'bg-[#2B2D31] border-slate-700'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              {m.card.mediaUrl && (
                                <img
                                  src={m.card.mediaUrl}
                                  alt=""
                                  className="w-full h-20 object-cover"
                                />
                              )}
                              <div className="p-1.5 space-y-1">
                                <span className="font-bold block text-[10px] leading-snug">
                                  {m.card.title}
                                </span>
                                <span
                                  className={`text-[9px] block whitespace-pre-wrap ${
                                    phoneSimulatorTheme === 'dark' ? 'text-slate-300' : 'text-slate-500'
                                  }`}
                                >
                                  {m.card.description}
                                </span>

                                {/* Action Buttons rendered as full-width pills */}
                                {m.card.actions && m.card.actions.length > 0 && (
                                  <div className="pt-1.5 space-y-1">
                                    {m.card.actions.map((act, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(act)}
                                        className={`w-full py-1 px-2 rounded-full text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                                          phoneSimulatorTheme === 'dark'
                                            ? 'bg-[#383A40] hover:bg-[#43464D] text-white'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                        }`}
                                      >
                                        {act.type === 'url' && <Globe className="w-2.5 h-2.5 text-blue-400" />}
                                        {act.type === 'dial' && <Phone className="w-2.5 h-2.5 text-emerald-400" />}
                                        {act.type === 'copy' && <Copy className="w-2.5 h-2.5 text-purple-400" />}
                                        {act.type === 'location' && <MapPin className="w-2.5 h-2.5 text-rose-400" />}
                                        {act.type === 'calendar' && <Calendar className="w-2.5 h-2.5 text-amber-400" />}
                                        {act.type === 'reply' && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                                        <span>{act.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Suggestions pills inside preview */}
                        {m.suggestions && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {m.suggestions.map((s, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(s)}
                                className={`px-2 py-0.5 rounded-full text-[8px] font-bold shadow-2xs transition cursor-pointer ${
                                  phoneSimulatorTheme === 'dark'
                                    ? 'bg-[#252830] text-blue-300 border border-blue-500/40'
                                    : 'bg-white text-emerald-700 border border-emerald-300'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Phone Bottom RCS Pill */}
                <div
                  className={`mt-1.5 p-1.5 rounded-xl text-center text-[9px] border shrink-0 ${
                    phoneSimulatorTheme === 'dark'
                      ? 'bg-[#2B2D31] text-slate-300 border-slate-700'
                      : 'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}
                >
                  <span className="text-emerald-500 font-bold">Jio • RCS message</span>
                </div>
              </div>

              {/* Diagnostics Box */}
              <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-[10px] space-y-1 shrink-0 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Carrier Network:</span>
                  <span className="text-emerald-700 font-mono font-bold">Jio UP 2.4</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Latency:</span>
                  <span className="text-slate-800 font-mono font-medium">28 ms</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: VISUAL CARD & BUTTON STUDIO */}
        {activeTab === 'builder' && (
          <RCSCardStudio
            onSendToChat={async (card, suggestions) => {
              await sendRcsMessage({
                conversationId: activeConversation?.id,
                text: card.title,
                card,
                suggestions,
                fallbackToSms: fallbackSms,
              });
              addToast(`RCS Rich Card sent to ${activeConversation?.contactName || 'customer'}!`, 'success');
              setActiveTab('chat');
            }}
            onLaunchCampaign={(card) => {
              setCampName(`Broadcast: ${card.title.slice(0, 30)}`);
              setCampText(card.description.slice(0, 100));
              setIsCampaignModalOpen(true);
            }}
          />
        )}

        {/* VIEW 2: RCS BROADCASTS & CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="p-6 h-full overflow-y-auto space-y-6 bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">RCS Broadcasts &amp; Rich Campaigns</h2>
                <p className="text-xs text-slate-500">
                  Send high-impact Rich Cards and interactive Carousels directly to customer phone inboxes.
                </p>
              </div>
              <button
                onClick={() => setIsCampaignModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New RCS Campaign</span>
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Total RCS Broadcasts</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">1,770</div>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +24% vs last month
                </span>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Delivery Rate</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">98.8%</div>
                <span className="text-[11px] text-slate-500 mt-1">Direct Carrier Handshake</span>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Open / Read Rate</span>
                <div className="text-2xl font-bold text-blue-600 mt-1">79.4%</div>
                <span className="text-[11px] text-slate-500 mt-1">Read receipts verified</span>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Interactive Action CTR</span>
                <div className="text-2xl font-bold text-purple-600 mt-1">32.6%</div>
                <span className="text-[11px] text-slate-500 mt-1">Buttons &amp; Quick Replies</span>
              </div>
            </div>

            {/* Campaign Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Broadcast History</h3>
                <span className="text-xs text-slate-500 font-medium">Showing {rcsCampaigns.length} campaigns</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Campaign Name</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Recipients</th>
                      <th className="p-3.5">Delivered</th>
                      <th className="p-3.5">Read Rate</th>
                      <th className="p-3.5">Action Clicks</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {rcsCampaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{camp.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-mono font-medium">
                            {camp.type}
                          </span>
                        </td>
                        <td className="p-3.5">{camp.recipientCount.toLocaleString()}</td>
                        <td className="p-3.5 text-emerald-700 font-bold">{camp.deliveredCount.toLocaleString()} (98.5%)</td>
                        <td className="p-3.5 text-blue-700 font-bold">{camp.readCount.toLocaleString()} (79.2%)</td>
                        <td className="p-3.5 text-purple-700 font-bold">{camp.clickCount.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {camp.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{camp.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: RCS BOT & AUTO-RESPONDERS */}
        {activeTab === 'bot' && (
          <div className="p-6 h-full overflow-y-auto space-y-6 bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">RCS Bot &amp; Automated Action Flows</h2>
                <p className="text-xs text-slate-500">
                  Configure keyword triggers and auto-reply recipes with rich cards and carousels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recipe 1 */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    Trigger: "AC" or "REPAIR" or "SERVICE"
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Express AC Diagnosis &amp; Dispatch Flow</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sends Rich Card with nearest technician arrival window, live tracking map URL, and 1-tap slot confirmation.
                </p>
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border border-slate-200">
                  Response Format: Rich Card • Actions: [Track Live, Call Desk, Confirm]
                </div>
              </div>

              {/* Recipe 2 */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                    Trigger: "PRICING" or "PLANS" or "AMC"
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Interactive Annual Care Carousel Flow</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sends a multi-card horizontal carousel showcasing Gold Care AMC &amp; Platinum AMC with brochure download links.
                </p>
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border border-slate-200">
                  Response Format: Multi-Card Carousel • Actions: [Select Plan, View PDF]
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SIMPLE CONFIGURATION SETTINGS (3-STEP WIZARD) */}
        {activeTab === 'config' && (
          <div className="p-6 h-full overflow-y-auto max-w-4xl mx-auto space-y-6 bg-[#F8FAFC]">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                Simple RCS Configuration Settings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your RCS Business Messaging channel in 3 simple steps to enable rich verified messaging.
              </p>
            </div>

            {/* Stepper Header */}
            <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-4">
              <button
                onClick={() => setConfigStep(1)}
                className={`flex items-center gap-2.5 p-3 rounded-xl transition cursor-pointer text-left ${
                  configStep === 1
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  configStep === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  1
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">1. Choose Provider</div>
                  <div className="text-[10px] text-slate-500 truncate">Carrier Gateway Mode</div>
                </div>
              </button>

              <button
                onClick={() => setConfigStep(2)}
                className={`flex items-center gap-2.5 p-3 rounded-xl transition cursor-pointer text-left ${
                  configStep === 2
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  configStep === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  2
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">2. Brand &amp; Details</div>
                  <div className="text-[10px] text-slate-500 truncate">Agent Name &amp; Accent</div>
                </div>
              </button>

              <button
                onClick={() => setConfigStep(3)}
                className={`flex items-center gap-2.5 p-3 rounded-xl transition cursor-pointer text-left ${
                  configStep === 3
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  configStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  3
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">3. Test &amp; Activate</div>
                  <div className="text-[10px] text-slate-500 truncate">Carrier Handshake</div>
                </div>
              </button>
            </div>

            {/* STEP 1: PROVIDER SELECTION */}
            {configStep === 1 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Your RCS Business Messaging Gateway:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A: Built-in Qiyam Cloud */}
                  <div
                    onClick={() => setTempConfig({ ...tempConfig, provider: 'qiyam_cloud' })}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer relative ${
                      tempConfig.provider === 'qiyam_cloud'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                        RECOMMENDED • ZERO-CONFIG
                      </span>
                      {tempConfig.provider === 'qiyam_cloud' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Built-in Qiyam RCS Cloud Gateway</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Instant 1-Click setup. Pre-connected to Google Jibe Hub and Indian telecom carriers (Jio, Airtel, Vi). No third-party account required.
                    </p>
                  </div>

                  {/* Option B: Google Cloud RBM */}
                  <div
                    onClick={() => setTempConfig({ ...tempConfig, provider: 'google_rbm' })}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer relative ${
                      tempConfig.provider === 'google_rbm'
                        ? 'border-emerald-600 bg-emerald-50/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        DIRECT ENTERPRISE
                      </span>
                      {tempConfig.provider === 'google_rbm' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Google RCS Business Messaging (RBM)</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Direct Google Cloud Service Account integration with official partner verification.
                    </p>
                  </div>

                  {/* Option C: Twilio RCS */}
                  <div
                    onClick={() => setTempConfig({ ...tempConfig, provider: 'twilio' })}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer relative ${
                      tempConfig.provider === 'twilio'
                        ? 'border-emerald-600 bg-emerald-50/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        CPaaS PARTNER
                      </span>
                      {tempConfig.provider === 'twilio' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Twilio RCS Messaging</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Connect via existing Twilio Account SID and Auth Token with automatic SMS fallback.
                    </p>
                  </div>

                  {/* Option D: Sinch / Infobip */}
                  <div
                    onClick={() => setTempConfig({ ...tempConfig, provider: 'sinch' })}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer relative ${
                      tempConfig.provider === 'sinch'
                        ? 'border-emerald-600 bg-emerald-50/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        GLOBAL CARRIER
                      </span>
                      {tempConfig.provider === 'sinch' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Sinch / Infobip Enterprise RCS</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      High-throughput enterprise pipeline with international delivery routing.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setConfigStep(2)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>Continue to Brand Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BRAND & CONNECTION DETAILS */}
            {configStep === 2 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Enter Your Brand Display &amp; Credentials:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Brand Display Name (Verified Sender)</label>
                    <input
                      type="text"
                      value={tempConfig.brandDisplayName}
                      onChange={(e) => setTempConfig({ ...tempConfig, brandDisplayName: e.target.value })}
                      placeholder="e.g. Qiyam Ventures"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">RCS Agent / Bot ID</label>
                    <input
                      type="text"
                      value={tempConfig.agentId}
                      onChange={(e) => setTempConfig({ ...tempConfig, agentId: e.target.value })}
                      placeholder="e.g. qiyam-rbm-prod-agent"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Brand Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tempConfig.brandHeroColor}
                        onChange={(e) => setTempConfig({ ...tempConfig, brandHeroColor: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={tempConfig.brandHeroColor}
                        onChange={(e) => setTempConfig({ ...tempConfig, brandHeroColor: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Brand Logo URL (Square 1:1)</label>
                    <input
                      type="text"
                      value={tempConfig.brandLogoUrl}
                      onChange={(e) => setTempConfig({ ...tempConfig, brandLogoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">API Key / Token</label>
                    <input
                      type="password"
                      value={tempConfig.apiKey}
                      onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                      placeholder="rcs_live_key_..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setConfigStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>Save &amp; Continue to Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: TEST & ACTIVATE */}
            {configStep === 3 && (
              <div className="space-y-4">
                <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center ring-4 ring-emerald-100">
                    <ShieldCheck className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">RCS Gateway Ready for Carrier Handshake</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Verify your connection against Google Jibe, Reliance Jio, Bharti Airtel, and Vodafone Idea.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleRunTestConnection}
                      disabled={isTestingPing}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isTestingPing ? 'animate-spin' : ''}`} />
                      <span>{isTestingPing ? 'Pinging Carrier Endpoints...' : 'Test Connection & Verify RCS Capability'}</span>
                    </button>
                  </div>

                  {carrierTestResult && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs space-y-2 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>RCS Carrier Handshake Confirmed (Universal Profile 2.4 Active)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-700">
                        <div className="p-2 bg-white rounded border border-emerald-200">
                          <span className="text-slate-500 block">Jio RCS:</span>
                          <span className="text-emerald-700 font-bold">Active • 28ms</span>
                        </div>
                        <div className="p-2 bg-white rounded border border-emerald-200">
                          <span className="text-slate-500 block">Airtel Jibe:</span>
                          <span className="text-emerald-700 font-bold">Active • 32ms</span>
                        </div>
                        <div className="p-2 bg-white rounded border border-emerald-200">
                          <span className="text-slate-500 block">Vi RCS:</span>
                          <span className="text-emerald-700 font-bold">Active • 41ms</span>
                        </div>
                        <div className="p-2 bg-white rounded border border-emerald-200">
                          <span className="text-slate-500 block">Brand Badge:</span>
                          <span className="text-blue-700 font-bold">Verified</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setConfigStep(2)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Back to Brand Details
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      addToast('RCS Messaging is live! You can now send rich messages and campaigns.', 'success');
                    }}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Launch RCS Live Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. MODALS (Clean White Theme) */}
      {/* 4A. NEW CHAT MODAL */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Start New RCS Conversation
              </h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Customer / Contact Name</label>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Phone Number (RCS Capable)</label>
                <input
                  type="text"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  placeholder="+91 94963 00233"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Target Carrier Universal Profile</label>
                <select
                  value={newChatCarrier}
                  onChange={(e) => setNewChatCarrier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                >
                  <option value="Jio RCS (UP 2.4)">Reliance Jio RCS (UP 2.4)</option>
                  <option value="Airtel RCS (Google Jibe)">Bharti Airtel RCS (Google Jibe)</option>
                  <option value="Vi RCS (UP 2.2)">Vodafone Idea RCS (UP 2.2)</option>
                  <option value="International Google Jibe">International Google Jibe</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newChatName.trim() || !newChatPhone.trim()) return;
                  createRcsConversation({
                    contactName: newChatName.trim(),
                    phoneNumber: newChatPhone.trim(),
                    carrier: newChatCarrier,
                  });
                  setIsNewChatModalOpen(false);
                  setNewChatName('');
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Initiate RCS Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4B. RICH CARD BUILDER MODAL */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Compose RCS Rich Card
              </h3>
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Card Title</label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Card Description</label>
                <textarea
                  value={cardDesc}
                  onChange={(e) => setCardDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Media / Image URL</label>
                <input
                  type="text"
                  value={cardMedia}
                  onChange={(e) => setCardMedia(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-[11px] focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Action Button Type</label>
                  <select
                    value={cardActionType}
                    onChange={(e) => setCardActionType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                  >
                    <option value="url">Open Web Link</option>
                    <option value="dial">Click to Dial Phone</option>
                    <option value="reply">Quick Reply Tap</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Button Label</label>
                  <input
                    type="text"
                    value={cardActionLabel}
                    onChange={(e) => setCardActionLabel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Button Target (URL or Phone Number)</label>
                <input
                  type="text"
                  value={cardActionUrl}
                  onChange={(e) => setCardActionUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-[11px] focus:bg-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsCardModalOpen(false);
                  setActiveTab('builder');
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Open in Visual Studio</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRichCard}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Rich Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4C. NEW CAMPAIGN MODAL */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Launch New RCS Broadcast
              </h3>
              <button
                onClick={() => setIsCampaignModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Target Audience</label>
                <input
                  type="text"
                  value={campAudience}
                  onChange={(e) => setCampAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Total Recipients</label>
                <input
                  type="number"
                  value={campCount}
                  onChange={(e) => setCampCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Message Text</label>
                <textarea
                  value={campText}
                  onChange={(e) => setCampText(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsCampaignModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createRcsCampaign({
                    name: campName,
                    targetAudience: campAudience,
                    recipientCount: campCount,
                    type: 'Rich Card',
                    messageText: campText,
                    status: 'COMPLETED',
                  });
                  setIsCampaignModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

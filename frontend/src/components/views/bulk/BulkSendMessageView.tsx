import React, { useState, useMemo } from 'react';
import {
  Send,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  Play,
  Save,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { MetaWalletCard } from './MetaWalletCard';
import { WhatsAppGuidelinesModal } from './WhatsAppGuidelinesModal';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const BulkSendMessageView: React.FC = () => {
  const {
    bulkCampaigns,
    bulkRecipientLists,
    bulkTemplates,
    metaWallet,
    sendBulkMessage,
    createScheduledMessage,
    addToast,
    setActiveTab,
  } = useQiyamStore();

  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  // Form states
  const [campaignName, setCampaignName] = useState('Diwali Mega Sale 2024');
  const [category, setCategory] = useState<'marketing' | 'utility' | 'authentication'>('marketing');
  const [sendType, setSendType] = useState<'now' | 'schedule'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState('2026-09-18T10:00');
  const [selectedListId, setSelectedListId] = useState<string>(
    bulkRecipientLists[0]?.id || 'list-1'
  );
  const [selectedTags, setSelectedTags] = useState<string>('VIP, Loyal');
  const [excludeOptOuts, setExcludeOptOuts] = useState<boolean>(true);

  // Content states
  const [messageType, setMessageType] = useState<'template' | 'freeform'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    bulkTemplates[0]?.id || 'tmpl-1'
  );
  const [variable1, setVariable1] = useState('Valued Customer');
  const [variable2, setVariable2] = useState('FESTIVE30');
  const [variable3, setVariable3] = useState('Sunday Midnight');
  const [freeformText, setFreeformText] = useState(
    'Hello {{name}}, thank you for choosing Qiyam Ventures! Enjoy 30% off today using code FESTIVE30.'
  );

  // Dispatch & safety
  const [dispatchSpeed, setDispatchSpeed] = useState<number>(60); // msgs / min
  const [isSending, setIsSending] = useState(false);

  // Active selected list
  const activeList = useMemo(() => {
    return (
      bulkRecipientLists.find((l) => l.id === selectedListId) ||
      bulkRecipientLists[0] || {
        id: 'list-default',
        name: 'All Active Contacts',
        contactCount: 500,
        validWhatsAppCount: 490,
      }
    );
  }, [bulkRecipientLists, selectedListId]);

  // Active selected template
  const activeTemplate = useMemo(() => {
    return (
      bulkTemplates.find((t) => t.id === selectedTemplateId) ||
      bulkTemplates[0] || {
        id: 'tmpl-1',
        name: 'festive_promo_v2',
        bodyText:
          'Hello {{1}}, our Diwali Super Saver is live! Use code {{2}} to get 30% OFF on all services until {{3}}. Tap below to claim.',
        headerType: 'IMAGE',
        headerContent: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
        footerText: 'Reply STOP to unsubscribe',
        buttons: [{ type: 'URL', text: 'Shop Now' }],
      }
    );
  }, [bulkTemplates, selectedTemplateId]);

  // Cost calculation
  const audienceCount = activeList.validWhatsAppCount || activeList.contactCount || 0;
  const costPerConv = metaWallet.conversationPricing[category] || 0.78;
  const estimatedCost = audienceCount * costPerConv;
  const hasEnoughFunds = metaWallet.balance >= estimatedCost;

  // Live preview text generator
  const livePreviewBody = useMemo(() => {
    if (messageType === 'freeform') {
      return freeformText.replace('{{name}}', variable1);
    }
    let text = activeTemplate.bodyText || '';
    text = text.replace(/\{\{1\}\}/g, variable1);
    text = text.replace(/\{\{2\}\}/g, variable2);
    text = text.replace(/\{\{3\}\}/g, variable3);
    return text;
  }, [messageType, freeformText, activeTemplate, variable1, variable2, variable3]);

  // Handle Launch Broadcast
  const handleLaunch = () => {
    if (!campaignName.trim()) {
      addToast('Please enter a campaign name', 'error');
      return;
    }

    if (!hasEnoughFunds) {
      addToast(
        `Insufficient Meta Wallet balance (₹${metaWallet.balance.toFixed(
          2
        )}). Requires ₹${estimatedCost.toFixed(2)}. Please top up funds.`,
        'error'
      );
      return;
    }

    setIsSending(true);

    if (sendType === 'schedule') {
      createScheduledMessage({
        campaignName,
        recipientGroupId: activeList.id,
        recipientGroupName: activeList.name,
        recipientCount: audienceCount,
        scheduledFor: scheduledDateTime,
        templateName: messageType === 'template' ? activeTemplate.name : 'Freeform Message',
        category,
        estimatedCost,
      });
      setIsSending(false);
      addToast(`Campaign scheduled successfully for ${scheduledDateTime}!`, 'success');
      setActiveTab('bulk-scheduled');
    } else {
      setTimeout(() => {
        sendBulkMessage({
          name: campaignName,
          category,
          audienceListName: activeList.name,
          totalRecipients: audienceCount,
          templateName: messageType === 'template' ? activeTemplate.name : 'Freeform Broadcast',
          cost: estimatedCost,
        });
        setIsSending(false);
        addToast(`Campaign "${campaignName}" launched successfully!`, 'success');
        setActiveTab('bulk-campaigns');
      }, 1000);
    }
  };

  const handleTestSend = () => {
    addToast('Test message dispatched to your verified admin WhatsApp number!', 'info');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  WhatsApp Bulk Messaging
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  META CLOUD API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Broadcast marketing campaigns, transactional alerts, and customer notifications at scale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              View Guidelines
            </button>

            {/* Top Compact Wallet Indicator with Edit Button */}
            <MetaWalletCard compact={true} />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: 4-STEP DISPATCH FORM */}
          <div className="lg:col-span-7 space-y-5">
            {/* STEP 1: Message Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Message Details</h3>
                  <p className="text-[11px] text-slate-500">
                    Define campaign identity, category, and delivery timing
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Diwali Mega Sale 2024"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Campaign Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="marketing">Marketing (₹0.78 / conv)</option>
                      <option value="utility">Utility (₹0.30 / conv)</option>
                      <option value="authentication">Authentication (₹0.12 / conv)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Delivery Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSendType('now')}
                        className={`py-2 px-2.5 rounded-xl font-bold border transition text-center cursor-pointer ${
                          sendType === 'now'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Send Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendType('schedule')}
                        className={`py-2 px-2.5 rounded-xl font-bold border transition text-center cursor-pointer ${
                          sendType === 'schedule'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>

                {sendType === 'schedule' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <label className="block font-semibold text-blue-900 text-[11px]">
                      Select Broadcast Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: Audience Selection */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Audience Selection</h3>
                  <p className="text-[11px] text-slate-500">
                    Target segmented recipient lists and apply anti-spam filters
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Recipient List
                    </label>
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {bulkRecipientLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name} ({list.validWhatsAppCount} active numbers)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Filter by Tags (Optional)
                    </label>
                    <input
                      type="text"
                      value={selectedTags}
                      onChange={(e) => setSelectedTags(e.target.value)}
                      placeholder="e.g. VIP, High-Value"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">Exclude Opt-Out Contacts</span>
                    <p className="text-[10px] text-slate-500">
                      Automatically skip contacts who sent STOP or revoked marketing consent
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeOptOuts}
                      onChange={(e) => setExcludeOptOuts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-emerald-950">
                      Estimated Audience: <strong>{audienceCount.toLocaleString()} contacts</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    98.6% WhatsApp Deliverability
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 3: Message Content */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Message Content</h3>
                  <p className="text-[11px] text-slate-500">
                    Choose an approved Meta template or dynamic session message
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Tabs for Template vs Freeform */}
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMessageType('template')}
                    className={`pb-2 px-3 font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      messageType === 'template'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Meta Approved Template (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageType('freeform')}
                    className={`pb-2 px-3 font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      messageType === 'freeform'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Freeform Session Message (24h Window)
                  </button>
                </div>

                {messageType === 'template' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Select Approved Template
                      </label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        {bulkTemplates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category.toUpperCase()} - {t.language}) - {t.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Template Variable Mappers */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Dynamic Template Variables
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            Variable {'{{1}}'} (Name)
                          </label>
                          <input
                            type="text"
                            value={variable1}
                            onChange={(e) => setVariable1(e.target.value)}
                            placeholder="Customer Name"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            Variable {'{{2}}'} (Offer Code)
                          </label>
                          <input
                            type="text"
                            value={variable2}
                            onChange={(e) => setVariable2(e.target.value)}
                            placeholder="e.g. FESTIVE30"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            Variable {'{{3}}'} (Expiry / Date)
                          </label>
                          <input
                            type="text"
                            value={variable3}
                            onChange={(e) => setVariable3(e.target.value)}
                            placeholder="e.g. Sunday Midnight"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Freeform Message Body
                    </label>
                    <textarea
                      rows={4}
                      value={freeformText}
                      onChange={(e) => setFreeformText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Note: Freeform broadcast is only delivered to contacts who messaged your
                      business within the past 24 hours.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 4: Dispatch & Safety */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Dispatch & Safety Controls</h3>
                  <p className="text-[11px] text-slate-500">
                    Anti-ban throttling, cost projection, and execution
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1 font-semibold text-slate-800">
                    <span>Dispatch Speed Limit:</span>
                    <span className="text-emerald-700 font-bold">{dispatchSpeed} msgs / min</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={dispatchSpeed}
                    onChange={(e) => setDispatchSpeed(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Safe Warm-up (10/min)</span>
                    <span>Standard (60/min)</span>
                    <span>High Throughput (120/min)</span>
                  </div>
                </div>

                {/* Cost Estimation Box */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Estimated Audience:</span>
                    <span className="font-bold text-white">
                      {audienceCount.toLocaleString()} recipients
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Category Conversation Rate:</span>
                    <span className="font-bold text-white">₹{costPerConv.toFixed(2)} / conv</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">Total Meta Wallet Deduction</div>
                      <div className="text-lg font-black text-emerald-400">
                        ₹{estimatedCost.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Available Wallet Balance</div>
                      <div
                        className={`text-xs font-bold ${
                          hasEnoughFunds ? 'text-emerald-300' : 'text-rose-400'
                        }`}
                      >
                        ₹{metaWallet.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleLaunch}
                    disabled={isSending || !hasEnoughFunds}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer ${
                      hasEnoughFunds
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Launching Broadcast...
                      </>
                    ) : sendType === 'schedule' ? (
                      <>
                        <Calendar className="w-4 h-4" />
                        Schedule Campaign
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        🚀 Launch Campaign
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestSend}
                    className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition cursor-pointer shadow-xs"
                  >
                    Send Test
                  </button>

                  <button
                    type="button"
                    onClick={() => addToast('Draft saved successfully', 'info')}
                    className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition cursor-pointer shadow-xs"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>

            {/* RECENT CAMPAIGNS SUMMARY TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Recent Broadcast Campaigns</h4>
                <button
                  onClick={() => setActiveTab('bulk-campaigns')}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All History <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="pb-2">Campaign</th>
                      <th className="pb-2">Recipients</th>
                      <th className="pb-2">Delivered</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulkCampaigns.slice(0, 3).map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-semibold text-slate-800">{camp.name}</td>
                        <td className="py-2.5 text-slate-500">{camp.totalRecipients.toLocaleString()}</td>
                        <td className="py-2.5 text-emerald-700 font-bold">
                          {((camp.deliveredCount / camp.totalRecipients) * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {camp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: META WALLET CARD + LIVE WHATSAPP PREVIEW */}
          <div className="lg:col-span-5 space-y-5">
            {/* Dedicated Meta Business Wallet Card with Edit button */}
            <MetaWalletCard />

            {/* Realistic WhatsApp Chat Bubble Preview */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-800">Live WhatsApp Preview</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Customer Screen View</span>
              </div>

              {/* Phone Mockup Frame */}
              <div className="rounded-2xl border-4 border-slate-800 bg-[#ECE5DD] p-3 shadow-md max-w-sm mx-auto overflow-hidden">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075E54] text-white p-2.5 -m-3 mb-3 flex items-center justify-between rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                      Q
                    </div>
                    <div>
                      <div className="font-bold text-xs leading-tight">Qiyam Business Solutions</div>
                      <div className="text-[9px] text-emerald-200">Official Business Account</div>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>

                {/* WhatsApp Message Bubble */}
                <div className="bg-white rounded-xl rounded-tl-xs shadow-xs p-3.5 space-y-2 text-slate-800 text-xs border border-slate-200/80">
                  {/* Header media */}
                  {activeTemplate.headerType === 'IMAGE' && activeTemplate.headerContent && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100 mb-2">
                      <img
                        src={activeTemplate.headerContent}
                        alt="Header"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Body text with live replacements */}
                  <div className="whitespace-pre-line leading-relaxed text-slate-900 text-[12px]">
                    {livePreviewBody}
                  </div>

                  {/* Footer */}
                  {activeTemplate.footerText && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      {activeTemplate.footerText}
                    </div>
                  )}

                  {/* Timestamp & double blue ticks */}
                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-0.5">
                    <span>10:45 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>

                  {/* Interactive CTA buttons */}
                  {activeTemplate.buttons && activeTemplate.buttons.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      {activeTemplate.buttons.map((btn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full py-1.5 text-center text-xs font-bold text-[#00a884] bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {btn.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 text-center text-[10px] text-slate-400">
                Variables like <code className="bg-slate-100 px-1 py-0.5 rounded">{'{{1}}'}</code>{' '}
                are mapped uniquely for each contact.
              </div>
            </div>

            {/* Guidelines & Anti-spam Tips Card */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Meta Broadcast Best Practices
              </div>
              <ul className="text-[11px] text-emerald-900 space-y-1 list-disc list-inside">
                <li>Keep opt-out rate under 2% to preserve High Quality Tier.</li>
                <li>Avoid URL shorteners (bit.ly); use direct branded domains.</li>
                <li>Honor Indian DND (Do Not Disturb) windows between 9 PM and 9 AM.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Guidelines Modal */}
      <WhatsAppGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />
    </div>
  );
};

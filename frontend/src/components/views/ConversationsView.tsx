import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Search, Filter, Phone, MoreVertical, Send, Paperclip,
  Smile, Mic, CheckCheck, Clock, UserCheck, Calendar,
  Receipt, Bot, Sparkles, Check, ChevronRight, Tag,
  FileText, ExternalLink, ArrowRight, UserPlus
} from 'lucide-react';

import { SendTemplateModal } from './conversations/SendTemplateModal';

export const ConversationsView: React.FC = () => {
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    markConversationAsRead,
    sendMessage,
    sendTemplateMessage,
    templates,
    convertLeadToDeal,
    setActiveTab,
    addToast,
    setIsSimulatorOpen,
  } = useQiyamStore();

  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'open' | 'in_progress' | 'waiting' | 'resolved' | 'ai_handled' | 'spam'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const { globalFilter } = useQiyamStore();

  const currentConv = conversations.find(
    (c) => String(c.id) === String(selectedConversationId) || c.contact_name === selectedConversationId
  ) || conversations[0];

  // Automatically mark currently active conversation as read
  React.useEffect(() => {
    if (currentConv && (currentConv.unread_count || 0) > 0) {
      markConversationAsRead(currentConv.id);
    }
  }, [currentConv?.id, currentConv?.unread_count, markConversationAsRead]);

  const counts = {
    all: conversations.length,
    open: conversations.filter((c) => c.status === 'open').length,
    in_progress: conversations.filter((c) => c.status === 'in_progress').length,
    waiting: conversations.filter((c) => c.status === 'waiting').length,
    resolved: conversations.filter((c) => c.status === 'resolved').length,
  };

  const filteredConversations = conversations.filter((c) => {
    if (activeFilterTab !== 'all' && c.status !== activeFilterTab) return false;
    if (globalFilter.status && globalFilter.status !== 'all' && c.status !== globalFilter.status) return false;
    
    const activeQuery = (searchQuery || globalFilter.query || '').toLowerCase();
    if (activeQuery) {
      return (
        c.contact_name.toLowerCase().includes(activeQuery) ||
        c.phone_number.includes(activeQuery) ||
        c.service_needed?.toLowerCase().includes(activeQuery)
      );
    }
    return true;
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(currentConv.id, inputText, 'agent');
    setInputText('');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Create Lead') {
      addToast(`Lead created for ${currentConv.contact_name}`, 'success');
      setActiveTab('crm-leads');
    } else if (action === 'Send Quotation') {
      sendMessage(currentConv.id, `Hello ${currentConv.contact_name}, here is the official quotation for ${currentConv.service_needed || 'AC Repair'}: ₹${currentConv.estimated_value || 2800}. Let us know if you would like to proceed!`, 'agent');
      addToast('Quotation sent to WhatsApp', 'success');
    } else if (action === 'Create Appointment') {
      addToast(`Appointment scheduled for ${currentConv.contact_name}`, 'success');
      setActiveTab('ops-appointments');
    } else if (action === 'Convert to Deal') {
      convertLeadToDeal(currentConv.id);
    } else if (action === 'Mark as Resolved') {
      addToast(`Conversation with ${currentConv.contact_name} marked as resolved`, 'info');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-screen overflow-hidden font-sans">
      <Header
        title="Conversations"
        subtitle="Manage WhatsApp multi-agent conversations, customer inquiries, and AI-assisted workflows."
        primaryActionLabel="New WhatsApp Chat"
        onPrimaryAction={() => setIsSimulatorOpen(true)}
      />

      {/* Main 3-Pane WhatsApp Shared Inbox */}
      <div className="flex-1 flex overflow-hidden border-t border-slate-200">
        {/* Pane 1: Conversation List (Left 320px) */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Filter Tabs */}
          <div className="px-3 pt-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'all' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilterTab('open')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'open' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Open ({counts.open})
            </button>
            <button
              onClick={() => setActiveFilterTab('in_progress')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'in_progress' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              In Progress ({counts.in_progress})
            </button>
            <button
              onClick={() => setActiveFilterTab('waiting')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'waiting' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Waiting ({counts.waiting})
            </button>
            <button
              onClick={() => setActiveFilterTab('resolved')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'resolved' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Resolved ({counts.resolved})
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConversationId;
              const lastMessage = conv.messages[conv.messages.length - 1];

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-3 cursor-pointer transition-all flex items-start gap-3 hover:bg-slate-50 ${
                    isSelected ? 'bg-emerald-50/50 border-l-4 border-emerald-600' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conv.avatar}
                      alt={conv.contact_name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900 truncate">{conv.contact_name}</div>
                      <span className="text-[10px] text-slate-400 font-medium">{conv.first_contact_date.split(' ')[0] || '10:30 AM'}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">{conv.phone_number}</div>

                    <div className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                      {lastMessage ? lastMessage.text : 'New message...'}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          conv.category === 'Hot Lead'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : conv.category === 'Lead'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {conv.category}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="ml-auto w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pane 2: Active Chat Canvas (Center flex-1) */}
        <div className="flex-1 flex flex-col bg-[#F0F2F5] min-w-0">
          {/* Chat Header */}
          <div className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={currentConv.avatar}
                alt={currentConv.contact_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{currentConv.contact_name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentConv.category}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">• Open</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{currentConv.phone_number}</span>
                  <span>•</span>
                  <span>Assigned to: <strong className="text-slate-700">{currentConv.lead_owner}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addToast(`Calling ${currentConv.contact_name}...`, 'info')}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-all"
                title="Initiate Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleQuickAction('Send Quotation')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Send Quotation</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentConv.messages.map((msg) => {
              const isCustomer = msg.sender === 'customer';
              const isBot = msg.sender === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                      isCustomer
                        ? 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                        : isBot
                        ? 'bg-emerald-700 text-white rounded-tr-sm shadow-md'
                        : 'bg-emerald-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {isBot && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-200 mb-1">
                        <Bot className="w-3 h-3" />
                        <span>Qiyam AI Assistant</span>
                      </div>
                    )}
                    <div>{msg.text}</div>

                    {/* Rich Confirmation Card (Matching photo_5 booking card) */}
                    {msg.richCard && msg.richCard.type === 'booking' && (
                      <div className="mt-3 p-3 rounded-xl bg-white text-slate-900 border border-emerald-100 shadow-sm space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>{msg.richCard.title}</span>
                          </div>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {msg.richCard.bookingId}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Date & Time</span>
                            <span className="font-semibold text-slate-800">{msg.richCard.date}</span>
                            <div className="text-slate-600">{msg.richCard.time}</div>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Service & Charges</span>
                            <span className="font-semibold text-slate-800">{msg.richCard.service}</span>
                            <div className="text-emerald-600 font-bold">₹{msg.richCard.amount}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('ops-appointments')}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-center text-xs flex items-center justify-center gap-1 transition-all"
                        >
                          <span>{msg.richCard.actionText || 'View Details'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                        isCustomer ? 'text-slate-400' : 'text-emerald-100'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {!isCustomer && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action Chips Bar */}
          <div className="px-5 py-2 bg-white border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick Actions:</span>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold whitespace-nowrap text-[11px] flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Use WhatsApp Template</span>
            </button>
            <button
              onClick={() => handleQuickAction('Create Lead')}
              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-purple-50 border border-slate-200 text-purple-700 font-medium whitespace-nowrap text-[11px]"
            >
              + Create Lead
            </button>
            <button
              onClick={() => handleQuickAction('Send Quotation')}
              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-emerald-700 font-medium whitespace-nowrap text-[11px]"
            >
              📄 Send Quotation
            </button>
            <button
              onClick={() => handleQuickAction('Create Appointment')}
              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 text-blue-700 font-medium whitespace-nowrap text-[11px]"
            >
              📅 Create Appointment
            </button>
            <button
              onClick={() => handleQuickAction('Convert to Deal')}
              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-amber-50 border border-slate-200 text-amber-700 font-medium whitespace-nowrap text-[11px]"
            >
              💼 Convert to Deal
            </button>
            <button
              onClick={() => handleQuickAction('Mark as Resolved')}
              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-medium whitespace-nowrap text-[11px]"
            >
              ✓ Mark Resolved
            </button>
          </div>

          {/* Chat Input Box */}
          <form onSubmit={handleSend} className="bg-white p-3 border-t border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              title="Pick WhatsApp Template"
              className="p-2 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all font-bold"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
            >
              <Paperclip className="w-5 h-5" />
            </button>


            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message or use WhatsApp template..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 transition-all active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Pane 3: Customer 360 & Lead Details Drawer (Right 320px) */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Customer Avatar Card */}
          <div className="text-center pb-4 border-b border-slate-100">
            <img
              src={currentConv.avatar}
              alt={currentConv.contact_name}
              className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-emerald-500/10 mb-2"
            />
            <h4 className="font-bold text-sm text-slate-900">{currentConv.contact_name}</h4>
            <p className="text-xs text-slate-500 font-mono">{currentConv.phone_number}</p>
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentConv.category}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {currentConv.lead_stage}
              </span>
            </div>
          </div>

          {/* Lead Information */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">
              Lead Details
            </h5>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Owner:</span>
                <span className="font-semibold text-slate-800">{currentConv.lead_owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service Needed:</span>
                <span className="font-semibold text-slate-800">{currentConv.service_needed || 'AC Repair'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Value:</span>
                <span className="font-bold text-emerald-600">₹{currentConv.estimated_value || 2800}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="font-medium text-slate-800">{currentConv.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-800">{currentConv.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Language:</span>
                <span className="font-medium text-slate-800">{currentConv.language}</span>
              </div>
            </div>
          </div>

          {/* Active Workflow Card */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-700 uppercase">Active Workflow</span>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            </div>
            <div className="font-bold text-xs text-purple-900">{currentConv.active_workflow || 'Service Booking Flow'}</div>
            <div className="text-[10px] text-purple-600 mt-1">Step 4/6: Appointment Booked</div>
          </div>

          {/* Tags */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400 mb-1.5">
              Tags
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {currentConv.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px] flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  <span>{t}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400 mb-1.5">
              Notes
            </h5>
            <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
              {currentConv.notes || 'Customer inquiry regarding AC repair services.'}
            </p>
          </div>

          {/* Drawer Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => convertLeadToDeal(currentConv.id)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-center text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Convert to Deal</span>
            </button>
            <button
              onClick={() => setActiveTab('ops-jobs')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-center text-xs transition-all"
            >
              Dispatch Job
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Template Picker & Sender Modal */}
      <SendTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={templates}
        currentConversation={currentConv}
        onSendTemplate={(tmplId, vars) => {
          sendTemplateMessage(currentConv.id, tmplId, vars);
        }}
      />
    </div>
  );
};




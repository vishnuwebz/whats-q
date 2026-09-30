import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Clock,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Send,
  Coffee,
  CheckSquare,
  Award,
  Phone,
  Building2,
  LogOut,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  RefreshCw,
  Bell,
  Star,
  Smartphone,
  Flame,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  UserCheck,
  TrendingUp,
  Tag,
  DollarSign,
  MapPin,
  FileText,
  ChevronDown,
  CheckCheck
} from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { getCurrentAuthUser, performLogout } from '@/utils/authService';
import { Lead, FollowUp, Conversation } from '@/types';
import { ScheduleFollowUpModal } from '@/components/crm/ScheduleFollowUpModal';

const cleanPhone = (p?: string) => String(p || '').replace(/\D/g, '').slice(-10);

export const EmployeePortalView: React.FC = () => {
  const {
    conversations,
    leads,
    followups,
    employees,
    attendance,
    tasks,
    updateLeadStage,
    updateLead,
    updateFollowUp,
    sendMessage,
    startOutboundWhatsAppChat,
    addToast,
    setActiveTab,
    activeTenant,
  } = useQiyamStore();

  const [currentUser, setCurrentUser] = useState(() => getCurrentAuthUser());
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>(() => {
    return currentUser?.name || employees[0]?.name || 'Rahul Mehta';
  });

  // Active sub-tab
  const [activePortalTab, setActivePortalTab] = useState<'leads' | 'chat' | 'followups' | 'duty'>('leads');

  // Duty punch state
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [onBreakType, setOnBreakType] = useState<string | null>(null);
  const [dutySeconds, setDutySeconds] = useState(14820); // ~4 hours active
  const [currentTime, setCurrentTime] = useState(new Date());

  // Lead filters
  const [leadScopeFilter, setLeadScopeFilter] = useState<'assigned' | 'all'>('assigned');
  const [leadStageFilter, setLeadStageFilter] = useState<string>('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  // Quick note modal when changing lead stage
  const [stageNoteModal, setStageNoteModal] = useState<{
    lead: Lead;
    targetStage: Lead['stage'];
  } | null>(null);
  const [stageNoteText, setStageNoteText] = useState('');

  // Follow-up modal state
  const [followUpModalLead, setFollowUpModalLead] = useState<Lead | null>(null);
  const [followUpModalFollowUp, setFollowUpModalFollowUp] = useState<FollowUp | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  // Quick Chat state
  const [selectedChatId, setSelectedChatId] = useState<number | string>(conversations[0]?.id || 1);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Selected template category
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<'all' | 'guest' | 'billing' | 'service'>('all');

  // Resolved active employee details
  const activeEmployee = useMemo(() => {
    const found = employees.find(
      (e) => e.name.toLowerCase() === selectedEmployeeName.toLowerCase()
    );
    if (found) return found;
    return {
      id: 999,
      name: selectedEmployeeName,
      phone: currentUser?.phone || '+91 98470 99881',
      role: 'Staff Agent',
      department: 'Guest Relations & CRM',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    };
  }, [employees, selectedEmployeeName, currentUser]);

  // Duty timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isOnDuty && !onBreakType) {
        setDutySeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isOnDuty, onBreakType]);

  // Format seconds to HH:MM:SS
  const formatDuration = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handlePunchToggle = () => {
    if (isOnDuty) {
      setIsOnDuty(false);
      setOnBreakType(null);
      addToast('🔴 Shift punched out successfully. Today\'s duty hours logged!', 'info');
    } else {
      setIsOnDuty(true);
      addToast('🟢 Shift punched in! You are now live on duty.', 'success');
    }
  };

  const handleBreakToggle = (type: string) => {
    if (onBreakType === type) {
      setOnBreakType(null);
      addToast(`🟢 ${type} ended. Resumed active duty.`, 'success');
    } else {
      setOnBreakType(type);
      addToast(`☕ On break: ${type}. Live chat paused for your queue.`, 'info');
    }
  };

  // Sample quick templates tailored for employees
  const QUICK_TEMPLATES = [
    {
      id: 'tmpl-1',
      title: '🏨 Check-In & WiFi Info',
      category: 'guest',
      text: 'Namaste {{1}}! Welcome to our hotel. Your room is ready. High-speed WiFi: Ambika_Guest (Password: Welcome@2026). Dial 9 for Reception.',
    },
    {
      id: 'tmpl-2',
      title: '🍽️ Room Service & Dining Menu',
      category: 'service',
      text: 'Dear {{1}}, here is our 24/7 in-room dining menu with chef specialties. Reply with your dish numbers to place an instant order.',
    },
    {
      id: 'tmpl-3',
      title: '🤝 Pricing Proposal & Quote',
      category: 'service',
      text: 'Hi {{1}}, thank you for inquiring about our services. Here is the customized quotation for your review. Let us know if you would like to proceed with the booking!',
    },
    {
      id: 'tmpl-4',
      title: '⏰ Follow-up & Availability',
      category: 'guest',
      text: 'Hello {{1}}, following up on our previous discussion. Are you available for a quick 2-minute call to finalize the schedule and details?',
    },
    {
      id: 'tmpl-5',
      title: '💳 GST Invoice & Settlement',
      category: 'billing',
      text: 'Thank you for choosing us! Your final invoice for ₹{{1}} has been confirmed. Download your official tax invoice PDF attached here.',
    },
    {
      id: 'tmpl-6',
      title: '🛎️ Housekeeping Request Acknowledged',
      category: 'service',
      text: 'Your request for Room {{1}} has been assigned to our floor supervisor. Attending within 10 minutes!',
    },
  ];

  const filteredTemplates = QUICK_TEMPLATES.filter(
    (t) => selectedTemplateCategory === 'all' || t.category === selectedTemplateCategory
  );

  // Selected conversation resolution
  const selectedConversation: Conversation | undefined = useMemo(() => {
    return conversations.find((c) => String(c.id) === String(selectedChatId)) || conversations[0];
  }, [conversations, selectedChatId]);

  // Scroll messages to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Filter Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (lead.is_deleted) return false;

      // Scope filter: Assigned to active employee vs All
      if (leadScopeFilter === 'assigned') {
        const leadOwner = (lead.owner || '').toLowerCase();
        const empName = selectedEmployeeName.toLowerCase();
        const matchesOwner = leadOwner === empName || leadOwner.includes(empName) || empName.includes(leadOwner);
        if (!matchesOwner) return false;
      }

      // Stage filter
      if (leadStageFilter !== 'all' && lead.stage !== leadStageFilter) {
        return false;
      }

      // Search query
      if (leadSearchQuery.trim()) {
        const q = leadSearchQuery.toLowerCase();
        const matchName = lead.name.toLowerCase().includes(q);
        const matchPhone = lead.phone.includes(q);
        const matchService = (lead.service || '').toLowerCase().includes(q);
        const matchLoc = (lead.location || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchService && !matchLoc) return false;
      }

      return true;
    });
  }, [leads, leadScopeFilter, leadStageFilter, leadSearchQuery, selectedEmployeeName]);

  // Filter Follow-ups for this employee
  const myAssignedFollowups = useMemo(() => {
    return followups.filter((f) => {
      const assigned = (f.assigned_to || '').toLowerCase();
      const empName = selectedEmployeeName.toLowerCase();
      return assigned === empName || assigned.includes(empName) || empName.includes(assigned);
    });
  }, [followups, selectedEmployeeName]);

  // Open Chat for a specific Lead
  const handleOpenChatForLead = async (lead: Lead) => {
    const cleanL = cleanPhone(lead.phone);
    const existingConv = conversations.find((c) => cleanPhone(c.phone_number) === cleanL);

    if (existingConv) {
      setSelectedChatId(existingConv.id);
      setActivePortalTab('chat');
      addToast(`Opened WhatsApp chat with ${lead.name}`, 'info');
    } else {
      // Start outbound chat or create conversation
      try {
        const res = await startOutboundWhatsAppChat({
          name: lead.name,
          phone: lead.phone,
          text: `Hello ${lead.name}, this is ${selectedEmployeeName} reaching out regarding your inquiry for ${lead.service || 'our services'}. How may I assist you today?`,
          assigned_to: selectedEmployeeName,
        });
        if (res && res.conversationId) {
          setSelectedChatId(res.conversationId);
          setActivePortalTab('chat');
          addToast(`Started new WhatsApp conversation with ${lead.name}`, 'success');
        } else {
          setActivePortalTab('chat');
        }
      } catch {
        setActivePortalTab('chat');
      }
    }
  };

  // Open Chat for FollowUp
  const handleOpenChatForFollowUp = (fu: FollowUp) => {
    const cleanF = cleanPhone(fu.phone);
    const existingConv = conversations.find((c) => cleanPhone(c.phone_number) === cleanF);
    if (existingConv) {
      setSelectedChatId(existingConv.id);
      setActivePortalTab('chat');
    } else {
      setActivePortalTab('chat');
    }
  };

  // Send message in current chat
  const handleSendReply = async (textToSend?: string) => {
    const text = textToSend || quickReplyText;
    if (!text.trim() || !selectedConversation) return;

    setIsSendingMessage(true);
    try {
      await sendMessage(selectedConversation.id, text, 'agent');
      setQuickReplyText('');
      addToast(`📲 WhatsApp message delivered to ${selectedConversation.contact_name || 'Customer'}!`, 'success');

      // Auto-update linked lead to 'contacted' if currently 'new'
      const convPhoneClean = cleanPhone(selectedConversation.phone_number);
      const matchingLead = leads.find((l) => cleanPhone(l.phone) === convPhoneClean);
      if (matchingLead && matchingLead.stage === 'new') {
        await updateLeadStage(matchingLead.id, 'contacted', 'Auto-transitioned: Employee sent WhatsApp message.');
      }
    } catch (e) {
      console.error('Failed to send reply:', e);
      addToast('Could not deliver message. Please retry.', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Direct Lead Stage Updater
  const handleDirectStageUpdate = async (lead: Lead, targetStage: Lead['stage'], note?: string) => {
    if (lead.stage === targetStage) {
      addToast(`Lead is already in "${targetStage.toUpperCase()}" stage`, 'info');
      return;
    }

    if (targetStage === 'follow_up') {
      // Open Follow-up scheduling modal
      setFollowUpModalLead(lead);
      setFollowUpModalFollowUp(null);
      setIsFollowUpModalOpen(true);
      return;
    }

    const success = await updateLeadStage(lead.id, targetStage, note);
    if (success) {
      const stageLabels: Record<string, string> = {
        contacted: '💬 Contacted',
        negotiation: '🤝 Negotiation',
        won: '🏆 Won 🎉',
        lost: '❌ Lost',
        qualified: '⭐ Qualified',
        new: '🆕 New Lead',
      };
      addToast(`${lead.name} moved to ${stageLabels[targetStage] || targetStage}!`, 'success');
    }
  };

  // Submit stage with custom note
  const handleSubmitStageWithNote = async () => {
    if (!stageNoteModal) return;
    const { lead, targetStage } = stageNoteModal;
    await handleDirectStageUpdate(lead, targetStage, stageNoteText.trim() || undefined);
    setStageNoteModal(null);
    setStageNoteText('');
  };

  // Helper for Stage Pill Badges
  const renderStageBadge = (stage: Lead['stage']) => {
    switch (stage) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">🆕 New Lead</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">💬 Contacted</span>;
      case 'follow_up':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">⏰ Follow-up</span>;
      case 'qualified':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">⭐ Qualified</span>;
      case 'negotiation':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">🤝 Negotiation</span>;
      case 'won':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🏆 Won Deal</span>;
      case 'lost':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">❌ Lost</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{stage}</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] text-slate-800 p-4 md:p-6 space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & EMPLOYEE PROFILE BAR WITH STAFF SWITCHER                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={(activeEmployee as any)?.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'}
              alt={activeEmployee?.name || 'Staff User'}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
            />
            <span
              className={`w-3.5 h-3.5 rounded-full ring-2 ring-white absolute -bottom-1 -right-1 ${
                isOnDuty ? (onBreakType ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                {activeEmployee?.name || 'Rahul Mehta'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                Staff Dashboard
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                {activeTenant?.businessName || currentUser?.companyName || 'Qiyam Ventures & Hospitality'}
              </span>
              <span>•</span>
              <span>{activeEmployee?.department || 'Guest Relations & CRM'}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
              <span>Mobile: {activeEmployee?.phone || '+91 98470 99881'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-sans font-semibold flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                WhatsApp Alerts Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Right Action buttons & Employee Persona Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Staff Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500">Staff:</span>
            <select
              value={selectedEmployeeName}
              onChange={(e) => {
                setSelectedEmployeeName(e.target.value);
                addToast(`Switched staff view to ${e.target.value}`, 'info');
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))
              ) : (
                <>
                  <option value="Rahul Mehta">Rahul Mehta (Agent)</option>
                  <option value="Ramesh Kumar">Ramesh Kumar (Lead Manager)</option>
                  <option value="Vikram Patel">Vikram Patel (Guest Relations)</option>
                  <option value="Neha Patel">Neha Patel (Support)</option>
                  <option value="Ananya Sharma">Ananya Sharma (Front Desk)</option>
                </>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('conversations')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Full Messenger</span>
          </button>

          <button
            type="button"
            onClick={() => {
              performLogout();
              setActiveTab('login');
              addToast('Logged out successfully from Staff Portal.', 'info');
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL-TIME WHATSAPP & CRM WORKFLOW NOTIFICATION BANNER                   */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 md:p-5 shadow-sm border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                WhatsApp Cloud Sync & Real-Time CRM Pipeline Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-200 max-w-3xl leading-relaxed">
              When customer inquiries arrive, they are instantly added to your CRM Leads. When you reply, they advance to <strong>Contacted</strong>. When follow-ups are scheduled for you, instant WhatsApp notifications are dispatched to your mobile. Review leads below, chat live on WhatsApp, and advance stages (<strong>Contacted, Follow-up, Negotiation, Won, Lost</strong>).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActivePortalTab('leads')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activePortalTab === 'leads'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Assigned Leads ({filteredLeads.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePortalTab('chat')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activePortalTab === 'chat'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LIVE DUTY CLOCK & SHIFT PUNCH CARD                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Punch Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0B1528] to-[#111C33] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Live Duty Punch Clock
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <div className="my-4">
              <div className="text-3xl font-mono font-black tracking-tight text-white">
                {formatDuration(dutySeconds)}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                Status:{' '}
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    isOnDuty
                      ? onBreakType
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isOnDuty ? (onBreakType ? `On ${onBreakType}` : '🟢 Active On Duty') : '🔴 Clocked Out'}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePunchToggle}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isOnDuty
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isOnDuty ? 'Punch Out (End Duty)' : 'Punch In (Start Duty)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleBreakToggle('Tea Break (15m)')}
                disabled={!isOnDuty}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  onBreakType === 'Tea Break (15m)'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{onBreakType === 'Tea Break (15m)' ? 'End Break' : 'Tea Break'}</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center">
              Punches sync live to {activeTenant?.businessName || 'Business'} Operations & Payroll
            </div>
          </div>
        </div>

        {/* Right: Key Performance Metric Cards */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">My Leads</div>
            <div className="my-2">
              <div className="text-2xl font-black text-slate-900">{filteredLeads.length}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Active in pipeline</div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-500" /> CRM Synced
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Follow-ups Due</div>
            <div className="my-2">
              <div className="text-2xl font-black text-amber-600">{myAssignedFollowups.length}</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Pending action</div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" /> WhatsApp alerts sent
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chats Active</div>
            <div className="my-2">
              <div className="text-2xl font-black text-blue-700">{conversations.length}</div>
              <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Meta API Connected</div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-blue-500" /> Instant replies
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rating & SLA</div>
            <div className="my-2">
              <div className="text-2xl font-black text-emerald-700 flex items-center gap-1">
                <span>4.9</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">&lt; 2 min reply avg</div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-500" /> Top Performer
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN WORKSPACE TABS                                                     */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActivePortalTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activePortalTab === 'leads'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Assigned Leads & CRM Pipeline ({filteredLeads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePortalTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activePortalTab === 'chat'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Live WhatsApp Messenger ({conversations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePortalTab('followups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activePortalTab === 'followups'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Due Follow-ups ({myAssignedFollowups.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. TAB A: ASSIGNED LEADS & PIPELINE UPDATES                                */}
      {/* ========================================================================= */}
      {activePortalTab === 'leads' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                Scope:
              </span>
              <button
                type="button"
                onClick={() => setLeadScopeFilter('assigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  leadScopeFilter === 'assigned'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Assigned to {selectedEmployeeName}
              </button>
              <button
                type="button"
                onClick={() => setLeadScopeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  leadScopeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Company Leads ({leads.length})
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              {/* Stage Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { key: 'all', label: 'All Stages' },
                  { key: 'new', label: 'New' },
                  { key: 'contacted', label: 'Contacted' },
                  { key: 'follow_up', label: 'Follow-up' },
                  { key: 'negotiation', label: 'Negotiation' },
                  { key: 'won', label: 'Won 🏆' },
                  { key: 'lost', label: 'Lost ❌' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setLeadStageFilter(st.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      leadStageFilter === st.key
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={leadSearchQuery}
                onChange={(e) => setLeadSearchQuery(e.target.value)}
                placeholder="Search leads by name, phone, service..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Leads Grid */}
          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Leads Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No leads match the current filters. Switch to "All Company Leads" or adjust your stage filter to see more inquiries.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLeadScopeFilter('all');
                  setLeadStageFilter('all');
                  setLeadSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => {
                const isAssignedToMe = (lead.owner || '').toLowerCase().includes(selectedEmployeeName.toLowerCase());
                return (
                  <div
                    key={lead.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between space-y-3 group"
                  >
                    {/* Top Row: Lead Name & Stage Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {lead.name[0] || 'L'}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                              {lead.name}
                            </h4>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{lead.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div>{renderStageBadge(lead.stage)}</div>
                      </div>

                      {/* Lead Details: Service & Budget */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[10px] font-semibold uppercase">Service:</span>
                          <span className="font-bold text-slate-800">{lead.service || 'General Inquiry'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[10px] font-semibold uppercase">Est. Value:</span>
                          <span className="font-bold text-emerald-700">₹{lead.value?.toLocaleString() || '3,500'}</span>
                        </div>
                        {lead.location && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-semibold uppercase">Location:</span>
                            <span className="text-slate-700">{lead.location}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                          <span className="text-slate-400">Assigned To:</span>
                          <span className={`font-bold ${isAssignedToMe ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {lead.owner || 'Unassigned'} {isAssignedToMe && '(You)'}
                          </span>
                        </div>
                      </div>

                      {/* Follow-up schedule alert if scheduled */}
                      {(lead.next_follow_up_date || lead.stage === 'follow_up') && (
                        <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Next Follow-up:
                          </span>
                          <span className="font-bold font-mono">
                            {lead.next_follow_up_date || 'Scheduled'} {lead.next_follow_up_time || ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stage Transition & Chat Actions */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Update CRM Pipeline Stage:
                      </div>

                      {/* Interactive Stage Buttons */}
                      <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleDirectStageUpdate(lead, 'contacted')}
                          title="Mark as Contacted"
                          className={`py-1.5 px-1 rounded-lg transition cursor-pointer text-center ${
                            lead.stage === 'contacted'
                              ? 'bg-cyan-600 text-white shadow-2xs font-extrabold'
                              : 'bg-slate-100 hover:bg-cyan-100 text-slate-700'
                          }`}
                        >
                          Contacted
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectStageUpdate(lead, 'follow_up')}
                          title="Schedule Follow-up"
                          className={`py-1.5 px-1 rounded-lg transition cursor-pointer text-center ${
                            lead.stage === 'follow_up'
                              ? 'bg-amber-500 text-slate-950 shadow-2xs font-extrabold'
                              : 'bg-slate-100 hover:bg-amber-100 text-slate-700'
                          }`}
                        >
                          Follow-up
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectStageUpdate(lead, 'negotiation')}
                          title="Move to Negotiation"
                          className={`py-1.5 px-1 rounded-lg transition cursor-pointer text-center ${
                            lead.stage === 'negotiation'
                              ? 'bg-orange-500 text-white shadow-2xs font-extrabold'
                              : 'bg-slate-100 hover:bg-orange-100 text-slate-700'
                          }`}
                        >
                          Negotiate
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectStageUpdate(lead, 'won')}
                          title="Mark Deal Won"
                          className={`py-1.5 px-1 rounded-lg transition cursor-pointer text-center ${
                            lead.stage === 'won'
                              ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                              : 'bg-slate-100 hover:bg-emerald-100 text-slate-700'
                          }`}
                        >
                          Won 🏆
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectStageUpdate(lead, 'lost')}
                          title="Mark Deal Lost"
                          className={`py-1.5 px-1 rounded-lg transition cursor-pointer text-center ${
                            lead.stage === 'lost'
                              ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                              : 'bg-slate-100 hover:bg-rose-100 text-slate-700'
                          }`}
                        >
                          Lost ❌
                        </button>
                      </div>

                      {/* Bottom Action: Open WhatsApp Chat & Add Remark */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenChatForLead(lead)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStageNoteModal({ lead, targetStage: lead.stage });
                            setStageNoteText(lead.notes || '');
                          }}
                          title="Add CRM Notes"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB B: LIVE WHATSAPP MESSENGER & PRE-APPROVED TEMPLATES                 */}
      {/* ========================================================================= */}
      {activePortalTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column (8 cols): WhatsApp Conversation Thread & Composer */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {((selectedConversation as any)?.contact_name || (selectedConversation as any)?.name)?.[0] || 'C'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      {(selectedConversation as any)?.contact_name || (selectedConversation as any)?.name || 'Guest / Customer'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Official WABA Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                    <span>{(selectedConversation as any)?.phone_number || (selectedConversation as any)?.phone}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold font-sans">
                      Stage: {(selectedConversation as any)?.lead_stage || 'Contacted'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Jump to Conversations View */}
              <button
                type="button"
                onClick={() => setActiveTab('conversations')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Full Messenger</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Conversation Selector Chips */}
            <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-thin bg-slate-50/30">
              {conversations.slice(0, 10).map((c) => {
                const isSel = String(c.id) === String(selectedChatId);
                const cName = (c as any).contact_name || (c as any).name || 'Guest';
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedChatId(c.id)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium shrink-0 text-left transition cursor-pointer flex items-center gap-2 ${
                      isSel
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {cName[0] || 'C'}
                    </div>
                    <span className="truncate max-w-[100px]">{cName}</span>
                  </button>
                );
              })}
            </div>

            {/* Chat Thread Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#EFEAE2]/30">
              {selectedConversation?.messages && selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((msg, index) => {
                  const isAgent = msg.sender === 'agent';
                  const isBot = msg.sender === 'bot';

                  if (isBot) {
                    return (
                      <div key={msg.id || index} className="flex justify-center my-1">
                        <div className="bg-slate-200/90 text-slate-700 text-[10px] px-3 py-1 rounded-full font-medium shadow-2xs">
                          🤖 {msg.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] p-3 rounded-2xl text-xs shadow-2xs relative leading-relaxed ${
                          isAgent
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                            isAgent ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp || 'Now'}</span>
                          {isAgent && (
                            <CheckCheck className="w-3 h-3 text-emerald-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <p className="text-xs">No messages yet. Send a greeting or template below!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <div className="p-3 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickReplyText}
                  onChange={(e) => setQuickReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder="Type reply to customer on official WhatsApp..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSendReply()}
                  disabled={isSendingMessage || !quickReplyText.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Press Enter to send. Replying automatically updates lead to "Contacted".</span>
                <span className="text-emerald-600 font-semibold">Verified WhatsApp Official API</span>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Pre-Approved WhatsApp Templates Hub */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col h-[650px] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>WhatsApp Quick Templates</span>
                </h3>
                <p className="text-[11px] text-slate-500">Official pre-approved Meta responses</p>
              </div>

              <div className="flex items-center gap-1">
                {(['all', 'guest', 'service'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedTemplateCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                      selectedTemplateCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 transition group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition">
                      {tmpl.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const guestName = (selectedConversation as any)?.contact_name || (selectedConversation as any)?.name || 'Valued Customer';
                        const text = tmpl.text.replace('{{1}}', guestName);
                        handleSendReply(text);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Send Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                    {tmpl.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB C: MY ASSIGNED FOLLOW-UPS & REMINDERS                               */}
      {/* ========================================================================= */}
      {activePortalTab === 'followups' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Follow-ups Assigned to {selectedEmployeeName}
                </h3>
                <p className="text-xs text-slate-500">
                  Alerts dispatched to your WhatsApp mobile number
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFollowUpModalLead(null);
                setFollowUpModalFollowUp(null);
                setIsFollowUpModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <span>+ New Follow-up</span>
            </button>
          </div>

          {myAssignedFollowups.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">All Follow-ups Completed!</h4>
              <p className="text-xs text-slate-500">
                You have no pending follow-ups scheduled for your queue. Great job!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {myAssignedFollowups.map((fu) => {
                const isCompleted = fu.status === 'completed';
                return (
                  <div
                    key={fu.id}
                    className={`p-4 rounded-xl border transition space-y-2.5 ${
                      isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          fu.priority === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : fu.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {fu.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="font-mono text-slate-400">{fu.due_date} at {fu.due_time}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{fu.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Customer: {fu.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{fu.phone}</p>
                    </div>

                    {fu.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {fu.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenChatForFollowUp(fu)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const newStatus = isCompleted ? 'due_today' : 'completed';
                          await updateFollowUp(fu.id, { status: newStatus as any });
                          addToast(`Follow-up marked as ${newStatus}!`, 'info');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isCompleted
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isCompleted ? 'Mark Pending' : 'Mark Completed ✓'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: SCHEDULE / RESCHEDULE FOLLOW-UP                                 */}
      {/* ========================================================================= */}
      {isFollowUpModalOpen && (
        <ScheduleFollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => {
            setIsFollowUpModalOpen(false);
            setFollowUpModalLead(null);
            setFollowUpModalFollowUp(null);
          }}
          initialLead={followUpModalLead}
          initialFollowUp={followUpModalFollowUp}
          onSuccess={() => {
            setIsFollowUpModalOpen(false);
            setFollowUpModalLead(null);
            setFollowUpModalFollowUp(null);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: ADD STAGE NOTE OR REMARK                                        */}
      {/* ========================================================================= */}
      {stageNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Add Note for {stageNoteModal.lead.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setStageNoteModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Context / Negotiation Note
              </label>
              <textarea
                rows={3}
                value={stageNoteText}
                onChange={(e) => setStageNoteText(e.target.value)}
                placeholder="Client requested a 10% discount on Deluxe Room package. Agreed to call back tomorrow."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStageNoteModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitStageWithNote}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

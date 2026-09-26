import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Search, Filter, Phone, MoreVertical, Send, Paperclip,
  Smile, Mic, CheckCheck, Clock, UserCheck,
  ReceiptText, Bot, Sparkles, Check, ChevronRight, ChevronLeft, ChevronDown, Tag,
  FileText, ExternalLink, ArrowRight, UserPlus, ArrowLeft, X,
  MessageSquare, Camera, Sun, Sunset, Moon, RotateCcw, CalendarDays,
  SlidersHorizontal, Trash2, Ban, AlertOctagon, ShieldAlert, CheckCircle,
  Zap, Play, Pause, GitBranch, Edit3, Edit2, QrCode, Smartphone, RefreshCw
} from 'lucide-react';

import { SendTemplateModal } from './conversations/SendTemplateModal';
import { CustomerAvatarModal } from './conversations/CustomerAvatarModal';
import { DeleteConversationModal } from './conversations/DeleteConversationModal';
import { ManualOptOutModal } from './conversations/ManualOptOutModal';
import { ChatWorkflowModal } from './conversations/ChatWorkflowModal';
import { LinkEmployeeWhatsAppModal } from './conversations/LinkEmployeeWhatsAppModal';
import { EditEmployeeDeviceModal } from './conversations/EditEmployeeDeviceModal';
import { LinkedDevicesDetailsModal } from './conversations/LinkedDevicesDetailsModal';
import { VoiceNotePlayer } from './conversations/VoiceNotePlayer';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { DraggableScrollRow } from '@/components/common/DraggableScrollRow';
import { Conversation, LinkedEmployeeDevice } from '@/types';
import { apiClient } from '@/api/client';
import {
  sortConversationsByRecency,
  formatWhatsAppChatTime,
  formatMessageDateGroup,
  getMessageDateObj,
  getMessageDayKey,
  formatFullMessageTooltip,
  getTimeOfDaySlot,
  getConversationDateBadge,
  parseAnyDate,
} from '@/utils/chatRecency';
import { normalizeToFlowGroups, SERVICE_BOOKING_FLOW_GROUPS } from '@/utils/serviceBookingFlow';

export const ConversationsView: React.FC = () => {
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    deleteConversation,
    markConversationAsRead,
    sendMessage,
    sendTemplateMessage,
    templates,
    convertLeadToDeal,
    convertConversationToDeal,
    addLead,
    addAppointment,
    addJob,
    setActiveTab,
    addToast,
    setIsSimulatorOpen,
    typingUsers,
    onlineUsers,
    setTargetHighlightId,
    metaConfig,
    suppressionList,
    removeSuppressionRecord,
    isPhoneSuppressed,
    addSuppressionRecord,
    setSuppressionSearchQuery,
    requestSendConfirmation,
    requestGeneralConfirmation,
    workflows,
    setActiveWorkflowId,
    setActiveWorkflowTitle,
    setActiveWorkflowGroups,
    toggleConversationWorkflow,
    simulateInboundWhatsApp,
    linkedDevices,
    activeSenderDeviceId,
    setActiveSenderDeviceId,
    unlinkEmployeeDevice,
    deletedConversations,
    restoreConversation,
    fetchDeletedConversations,
    employees,
    assignStaffToConversation,
    addEmployee,
    refreshConversations,
  } = useQiyamStore();

  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'open' | 'in_progress' | 'waiting' | 'resolved' | 'ai_handled' | 'spam' | 'deleted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isLinkDeviceModalOpen, setIsLinkDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<LinkedEmployeeDevice | null>(null);
  const [isDevicesDetailsModalOpen, setIsDevicesDetailsModalOpen] = useState(false);
  const [isLineSelectorOpen, setIsLineSelectorOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [isManualOptOutModalOpen, setIsManualOptOutModalOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [testSimulateInput, setTestSimulateInput] = useState('');

  // Chat header action buttons minimize/expand state (persisted)
  const [isHeaderActionsMinimized, setIsHeaderActionsMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('whatsq_chat_header_actions_minimized') === 'true';
    } catch {
      return false;
    }
  });
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  const toggleHeaderActions = () => {
    setIsHeaderActionsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('whatsq_chat_header_actions_minimized', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeFloatingDate, setActiveFloatingDate] = useState<string>('');
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);
  const [isRefreshingLatest, setIsRefreshingLatest] = useState<boolean>(false);
  const [unreadBelowCount, setUnreadBelowCount] = useState<number>(0);
  const prevMsgCountRef = React.useRef<number>(0);
  const typingTimerRef = React.useRef<any>(null);
  const isTypingEmittedRef = React.useRef<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const recordTimerRef = React.useRef<any>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioStreamRef = React.useRef<MediaStream | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Date & Time Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDatePreset, setFilterDatePreset] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'older'>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterTimeSlot, setFilterTimeSlot] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');
  const [filterCustomStart, setFilterCustomStart] = useState<string>('');
  const [filterCustomEnd, setFilterCustomEnd] = useState<string>('');

  const isAnyDateFilterActive =
    filterDatePreset !== 'all' ||
    filterMonth !== 'all' ||
    filterTimeSlot !== 'all' ||
    Boolean(filterCustomStart) ||
    Boolean(filterCustomEnd);

  const clearAllDateFilters = () => {
    setFilterDatePreset('all');
    setFilterMonth('all');
    setFilterTimeSlot('all');
    setFilterCustomStart('');
    setFilterCustomEnd('');
  };

  // Staff Assignment State & Refs
  const [isAssignStaffOpen, setIsAssignStaffOpen] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [isAssigningStaff, setIsAssigningStaff] = useState(false);
  const assignDropdownRef = useRef<HTMLDivElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Close filter popover and staff assignment dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(e.target as Node)) {
        setIsAssignStaffOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Add Staff Modal state
  const [isQuickAddStaffOpen, setIsQuickAddStaffOpen] = useState(false);
  const [quickStaffForm, setQuickStaffForm] = useState({
    name: '',
    role: 'Customer Support Lead',
    phone: '+91 ',
    department: 'Support & Sales',
    autoAssign: true,
  });
  const [isSubmittingQuickStaff, setIsSubmittingQuickStaff] = useState(false);

  const handleQuickAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStaffForm.name.trim()) {
      addToast('Please enter the staff member name', 'warning');
      return;
    }
    const cleanPhone = quickStaffForm.phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      addToast('Please enter a valid WhatsApp mobile number with country code (e.g. +91 94963 00233)', 'warning');
      return;
    }
    setIsSubmittingQuickStaff(true);
    try {
      const created = await addEmployee({
        name: quickStaffForm.name.trim(),
        role: quickStaffForm.role.trim() || 'Staff Member',
        phone: cleanPhone,
        department: quickStaffForm.department || 'Support & Sales',
        status: 'active',
        location: 'Kozhikode, Kerala',
      });

      if (quickStaffForm.autoAssign && currentConv && created?.name) {
        await assignStaffToConversation(currentConv.id, created.name);
        addToast(
          `Staff member "${created.name}" created and assigned! WhatsApp alert sent to ${created.phone}.`,
          'success'
        );
      } else {
        addToast(`Staff member "${created.name}" created successfully. Available across software.`, 'success');
      }

      setIsQuickAddStaffOpen(false);
      setQuickStaffForm({
        name: '',
        role: 'Customer Support Lead',
        phone: '+91 ',
        department: 'Support & Sales',
        autoAssign: true,
      });
    } catch (err) {
      addToast('Failed to create staff member', 'error');
    } finally {
      setIsSubmittingQuickStaff(false);
    }
  };

  const { globalFilter } = useQiyamStore();

  const allAvailableConvs = useMemo(
    () => [...conversations, ...(deletedConversations || [])],
    [conversations, deletedConversations]
  );

  const currentConv = useMemo(() => {
    if (!allAvailableConvs || allAvailableConvs.length === 0) return null;

    const pool = activeFilterTab === 'deleted'
      ? (deletedConversations || [])
      : activeFilterTab === 'all'
      ? conversations
      : conversations.filter((c) => c.status === activeFilterTab);

    if (pool.length === 0) return null;

    const match = pool.find(
      (c) => String(c.id) === String(selectedConversationId) || c.contact_name === selectedConversationId
    );
    if (match) return match;

    return pool[0] || null;
  }, [allAvailableConvs, activeFilterTab, selectedConversationId, deletedConversations, conversations]);

  const availableStaffList = useMemo(() => {
    if (employees && employees.length > 0) return employees;
    return [
      { id: 1, name: 'Amit Sharma', role: 'Senior AC Technician', phone: '+91 90000 11123', avatar_url: '' },
      { id: 2, name: 'Priya Sharma', role: 'Customer Service Lead', phone: '+91 89213 56789', avatar_url: '' },
      { id: 3, name: 'Sneha Joshi', role: 'Support Specialist', phone: '+91 88481 23456', avatar_url: '' },
      { id: 4, name: 'Rahul Singh', role: 'Field Technician', phone: '+91 98764 11122', avatar_url: '' },
      { id: 5, name: 'Vikram Patel', role: 'Plumbing Specialist', phone: '+91 97451 98765', avatar_url: '' },
      { id: 6, name: 'Ananya Rao', role: 'Operations Coordinator', phone: '+91 95441 23456', avatar_url: '' },
    ];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!staffSearchQuery.trim()) return availableStaffList;
    const q = staffSearchQuery.toLowerCase();
    return availableStaffList.filter(
      (e) => (e.name && e.name.toLowerCase().includes(q)) || (e.role && e.role.toLowerCase().includes(q))
    );
  }, [availableStaffList, staffSearchQuery]);

  const handleAssignStaff = async (staffName: string, staffPhone?: string) => {
    if (!currentConv) return;
    setIsAssigningStaff(true);
    try {
      const res = await assignStaffToConversation(currentConv.id, staffName);
      if (staffName === 'Unassigned') {
        addToast('Conversation is now Unassigned (moved to open team pool)', 'info');
      } else {
        const phoneMsg = (res as any)?.staff_phone || staffPhone || '';
        addToast(
          `Assigned to ${staffName}! ${phoneMsg ? `WhatsApp alert sent to ${phoneMsg}` : 'Software & WhatsApp notifications sent.'}`,
          'success'
        );
      }
      setIsAssignStaffOpen(false);
      setStaffSearchQuery('');
    } catch (err) {
      addToast('Failed to assign staff member', 'error');
    } finally {
      setIsAssigningStaff(false);
    }
  };

  const handleOpenWorkflowBuilder = (wfName: string = 'Service Booking Flow') => {
    const matchedWf = (workflows || []).find(
      (w) => w.name.toLowerCase() === wfName.toLowerCase() || String(w.id) === '5' || String(w.id) === '4'
    ) || (workflows && workflows.length > 0 ? workflows[0] : null);

    const activeTitle = matchedWf?.name || wfName || 'Service Booking Flow';
    setActiveWorkflowId(matchedWf?.id || 5);
    setActiveWorkflowTitle(activeTitle);

    // Normalize to guaranteed-safe FlowGroup[] format with .items
    const safeGroups = normalizeToFlowGroups(matchedWf?.nodes, activeTitle);
    setActiveWorkflowGroups(safeGroups);

    setIsWorkflowModalOpen(false);
    setActiveTab('automation-builder');
    addToast(`Loaded "${activeTitle}" in Visual Workflow Builder`, 'info');
  };

  const getSuppressionStatus = (conv: Conversation | null) => {
    if (!conv) return null;
    const isSuppressed = Boolean(
      conv.is_blocked ||
      conv.is_opted_out ||
      isPhoneSuppressed(conv.phone_number)
    );
    if (!isSuppressed) return null;

    const normalizedPhone = (conv.phone_number || '').replace(/\D/g, '');
    const matchedRecord = (suppressionList || []).find(
      (r) => (r.phone || '').replace(/\D/g, '') === normalizedPhone
    );

    const isBlocked = Boolean(conv.is_blocked || matchedRecord?.type === 'blocked');
    const isOptedOut = Boolean(
      conv.is_opted_out ||
      matchedRecord?.type === 'opt_out_stop' ||
      matchedRecord?.type === 'opt_out_button' ||
      matchedRecord?.type === 'opted_out' ||
      !isBlocked
    );

    return {
      isBlocked,
      isOptedOut,
      type: isBlocked ? ('blocked' as const) : ('opted_out' as const),
      label: isBlocked ? 'Blocked' : 'Opted Out',
      reason:
        conv.suppression_reason ||
        matchedRecord?.reason ||
        matchedRecord?.notes ||
        (isBlocked
          ? 'Customer blocked business line on WhatsApp (Meta Cloud API error 131051)'
          : 'Customer sent STOP / Unsubscribe opt-out keyword'),
      date: conv.suppression_date || matchedRecord?.date || 'Recent',
      metaErrorCode: matchedRecord?.metaErrorCode || (isBlocked ? 131051 : undefined),
      campaignName: matchedRecord?.campaignName,
      record: matchedRecord,
    };
  };

  const currentSuppression = getSuppressionStatus(currentConv);

  // Real customer WhatsApp presence calculation based on actual activity and backend data
  const isCustomerReallyOnline = Boolean(
    currentConv && (
      typingUsers[currentConv.id] ||
      (onlineUsers[String(currentConv.id)]?.isOnline ?? currentConv.is_online ?? false)
    )
  );

  const customerRealLastSeen = useMemo(() => {
    if (!currentConv) return 'Recently';
    if (isCustomerReallyOnline) return 'Active now';
    if (onlineUsers[String(currentConv.id)]?.lastSeen) {
      return onlineUsers[String(currentConv.id)]!.lastSeen;
    }
    if (currentConv.last_seen && currentConv.last_seen !== 'Online') {
      return currentConv.last_seen;
    }
    if (currentConv.last_contact_date) {
      return currentConv.last_contact_date;
    }
    return 'Recently';
  }, [currentConv, isCustomerReallyOnline, onlineUsers]);

  // Automatically mark currently active conversation as read
  React.useEffect(() => {
    if (currentConv && (currentConv.unread_count || 0) > 0) {
      markConversationAsRead(currentConv.id);
    }
  }, [currentConv?.id, currentConv?.unread_count, markConversationAsRead]);

  const prevSelectedConvIdRef = useRef<string | number | null>(selectedConversationId);

  // Helper to change active filter tab and ensure selected conversation reflects the tab
  const handleSelectFilterTab = (tab: typeof activeFilterTab) => {
    setActiveFilterTab(tab);

    const pool = tab === 'deleted'
      ? (deletedConversations || [])
      : tab === 'all'
      ? conversations
      : conversations.filter((c) => c.status === tab);

    const alreadyMatches = pool.some(
      (c) => String(c.id) === String(selectedConversationId) || c.contact_name === selectedConversationId
    );

    if (!alreadyMatches && pool.length > 0) {
      setSelectedConversationId(pool[0].id);
      prevSelectedConvIdRef.current = pool[0].id;
    }
  };

  // Open mobile chat and adjust tabs ONLY when an individual conversation is explicitly selected from outside
  React.useEffect(() => {
    if (selectedConversationId && selectedConversationId !== prevSelectedConvIdRef.current) {
      prevSelectedConvIdRef.current = selectedConversationId;
      setIsMobileChatOpen(true);

      const target = allAvailableConvs.find(
        (c) => String(c.id) === String(selectedConversationId) || c.contact_name === selectedConversationId
      );

      if (target) {
        // If an external navigation opened a deleted conversation, switch to trash tab
        if (target.is_deleted && activeFilterTab !== 'deleted') {
          setActiveFilterTab('deleted');
        } else if (!target.is_deleted && activeFilterTab === 'deleted') {
          // If an external navigation opened an active conversation while on trash tab, switch to all
          setActiveFilterTab('all');
        }
      }
    } else if (selectedConversationId) {
      prevSelectedConvIdRef.current = selectedConversationId;
    }
  }, [selectedConversationId, allAvailableConvs, activeFilterTab]);

  React.useEffect(() => {
    fetchDeletedConversations();
  }, [fetchDeletedConversations]);

  // Active real-time synchronizer: keeps conversation thread lively even across multi-worker servers
  React.useEffect(() => {
    useQiyamStore.getState().refreshConversations();

    const interval = setInterval(() => {
      useQiyamStore.getState().refreshConversations();
    }, 3000);

    const onFocus = () => {
      useQiyamStore.getState().refreshConversations();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Reset scroll and unread counter when switching conversations
  React.useEffect(() => {
    setIsScrolledUp(false);
    setUnreadBelowCount(0);
    prevMsgCountRef.current = currentConv?.messages?.length || 0;
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 50);
    return () => clearTimeout(timer);
  }, [currentConv?.id]);

  // Handle incoming messages while in active chat
  React.useEffect(() => {
    const currentCount = currentConv?.messages?.length || 0;
    const prevCount = prevMsgCountRef.current;

    if (currentCount > prevCount) {
      const diff = currentCount - prevCount;
      if (isScrolledUp) {
        setUnreadBelowCount((prev) => prev + diff);
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnreadBelowCount(0);
      }
    }
    prevMsgCountRef.current = currentCount;
  }, [currentConv?.messages?.length, isScrolledUp]);

  // Auto-align the outbound sender line when opening or switching to an employee-linked conversation
  React.useEffect(() => {
    if (!currentConv) return;
    if (
      currentConv.active_line_type === 'employee' ||
      Boolean(currentConv.active_employee_name) ||
      (Boolean(currentConv.active_line_device) && !currentConv.active_line_device?.includes('Meta Cloud'))
    ) {
      const matched = linkedDevices.find((d) =>
        (currentConv.active_line_device && (d.device_label === currentConv.active_line_device || String(d.id) === currentConv.active_line_device)) ||
        (currentConv.active_line_phone && d.phone_number?.replace(/\D/g, '').endsWith(currentConv.active_line_phone.replace(/\D/g, '').slice(-10)))
      );
      if (matched && String(activeSenderDeviceId) !== String(matched.id)) {
        setActiveSenderDeviceId(matched.id);
      }
    }
  }, [currentConv?.id, currentConv?.active_line_type, currentConv?.active_line_device, currentConv?.active_line_phone, linkedDevices]);

  // Active phone line channel for open conversation
  const conversationActiveLine = useMemo(() => {
    if (!currentConv) return null;

    const hasEmpLine =
      currentConv.active_line_type === 'employee' ||
      Boolean(currentConv.active_employee_name) ||
      (Boolean(currentConv.active_line_device) && !currentConv.active_line_device?.includes('Meta Cloud'));

    if (hasEmpLine) {
      const matchedDev = linkedDevices.find((d) =>
        (currentConv.active_line_device && (d.device_label === currentConv.active_line_device || String(d.id) === currentConv.active_line_device)) ||
        (currentConv.active_line_phone && (d.phone_number?.replace(/\D/g, '').endsWith(currentConv.active_line_phone.replace(/\D/g, '').slice(-10))))
      );

      return {
        type: 'employee' as const,
        employeeName: currentConv.active_employee_name || matchedDev?.employee_name || currentConv.active_line_device || 'Employee Line',
        deviceLabel: currentConv.active_line_device || matchedDev?.device_label || 'Employee WhatsApp',
        phone: currentConv.active_line_phone || matchedDev?.phone_number || '',
        deviceId: matchedDev?.id ? String(matchedDev.id) : undefined,
        isConnected: matchedDev ? matchedDev.status === 'connected' : true,
      };
    }

    return {
      type: 'meta_cloud' as const,
      employeeName: 'Official System Line',
      deviceLabel: 'Meta Cloud API',
      phone: currentConv.active_line_phone || metaConfig?.business_phone_display || '+91 94963 00233',
      deviceId: 'meta_cloud',
      isConnected: true,
    };
  }, [currentConv, linkedDevices, metaConfig]);

  const counts = {
    all: conversations.length,
    open: conversations.filter((c) => c.status === 'open').length,
    in_progress: conversations.filter((c) => c.status === 'in_progress').length,
    waiting: conversations.filter((c) => c.status === 'waiting').length,
    resolved: conversations.filter((c) => c.status === 'resolved').length,
    deleted: (deletedConversations || []).length,
  };

  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, { key: string; label: string; count: number }>();
    conversations.forEach((c) => {
      const lastMsg = (c.messages && c.messages.length > 0) ? c.messages[c.messages.length - 1] : null;
      const d = lastMsg ? getMessageDateObj(lastMsg, c) : (parseAnyDate(c.last_contact_date) || null);
      if (d && !isNaN(d.getTime())) {
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const existing = monthMap.get(ym);
        if (existing) {
          existing.count += 1;
        } else {
          monthMap.set(ym, { key: ym, label, count: 1 });
        }
      }
    });
    return Array.from(monthMap.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [conversations]);

  const messageGroups = useMemo(() => {
    if (!currentConv || !currentConv.messages || currentConv.messages.length === 0) {
      return [];
    }

    const groups: {
      dayKey: string;
      label: string;
      messages: typeof currentConv.messages;
    }[] = [];

    for (const msg of currentConv.messages) {
      const msgDate = getMessageDateObj(msg, currentConv);
      const dayKey = getMessageDayKey(msgDate);
      const label = formatMessageDateGroup(msgDate);

      let lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.dayKey !== dayKey) {
        lastGroup = { dayKey, label, messages: [] };
        groups.push(lastGroup);
      }
      lastGroup.messages.push(msg);
    }

    return groups;
  }, [currentConv?.id, currentConv?.messages, currentConv?.last_contact_date]);

  // Dynamically compute floating date pill strictly based on current visible scroll position
  const updateFloatingDate = React.useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const groupEls = container.querySelectorAll<HTMLElement>('.message-day-group');
    if (groupEls.length === 0) {
      setActiveFloatingDate('');
      return;
    }

    // Only if the container is genuinely scrollable and scrolled to the bottom
    const isScrollable = container.scrollHeight > container.clientHeight + 30;
    const isAtBottom = isScrollable && (container.scrollHeight - container.scrollTop - container.clientHeight < 30);

    if (isAtBottom && messageGroups.length > 0) {
      const latestLabel = messageGroups[messageGroups.length - 1].label;
      if (latestLabel) {
        setActiveFloatingDate(latestLabel);
      }
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    let matchedLabel = '';
    for (let i = 0; i < groupEls.length; i++) {
      const el = groupEls[i];
      const rect = el.getBoundingClientRect();
      if (rect.bottom >= containerTop + 35) {
        matchedLabel = el.getAttribute('data-day-label') || '';
        break;
      }
    }

    if (!matchedLabel && groupEls.length > 0) {
      matchedLabel = groupEls[0].getAttribute('data-day-label') || '';
    }

    if (matchedLabel) {
      setActiveFloatingDate(matchedLabel);
    }
  }, [messageGroups]);

  // When switching conversations, initialize floating date to visible messages after auto-scroll completes
  React.useEffect(() => {
    if (!currentConv?.id) {
      setActiveFloatingDate('');
      return;
    }
    const timer = setTimeout(() => {
      updateFloatingDate();
    }, 150);
    return () => clearTimeout(timer);
  }, [currentConv?.id, updateFloatingDate]);

  // Dynamically update floating date pill and bottom scroll distance
  const handleMessagesScroll = React.useCallback(() => {
    updateFloatingDate();

    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // Consider scrolled up if user is more than 60px away from bottom
    const scrolledUp = distanceFromBottom > 60;
    setIsScrolledUp(scrolledUp);

    // If user manually scrolled back down to the very bottom, clear unread below counter
    if (distanceFromBottom <= 30) {
      setUnreadBelowCount(0);
    }
  }, [updateFloatingDate]);

  // Jump smoothly to the latest chat message and sync latest updates from WhatsApp server
  const handleLoadLatestChat = React.useCallback(async () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    setIsScrolledUp(false);
    setUnreadBelowCount(0);

    if (currentConv?.id) {
      setIsRefreshingLatest(true);
      try {
        await Promise.allSettled([
          refreshConversations(),
          markConversationAsRead(currentConv.id),
        ]);
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
              top: messagesContainerRef.current.scrollHeight,
              behavior: 'smooth',
            });
          } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } catch (err) {
        console.error('Failed to load latest chat:', err);
      } finally {
        setIsRefreshingLatest(false);
      }
    }
  }, [currentConv?.id, refreshConversations, markConversationAsRead]);

  const sourceConvs = activeFilterTab === 'deleted' ? (deletedConversations || []) : conversations;
  const filteredConversations = sortConversationsByRecency(
    sourceConvs.filter((c) => {
      if (activeFilterTab !== 'all' && activeFilterTab !== 'deleted' && c.status !== activeFilterTab) return false;
      if (globalFilter.status && globalFilter.status !== 'all' && c.status !== globalFilter.status) return false;

      const lastMsg = (c.messages && c.messages.length > 0) ? c.messages[c.messages.length - 1] : null;
      const convDate = lastMsg ? getMessageDateObj(lastMsg, c) : (parseAnyDate(c.last_contact_date) || new Date());
      const now = new Date();

      // Date Preset Filter
      if (filterDatePreset !== 'all') {
        const isToday = convDate.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = convDate.toDateString() === yesterday.toDateString();
        const diffDays = Math.floor((now.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24));

        if (filterDatePreset === 'today' && !isToday) return false;
        if (filterDatePreset === 'yesterday' && !isYesterday) return false;
        if (filterDatePreset === 'this_week' && (diffDays > 7 || diffDays < 0)) return false;
        if (filterDatePreset === 'this_month') {
          if (convDate.getMonth() !== now.getMonth() || convDate.getFullYear() !== now.getFullYear()) return false;
        }
        if (filterDatePreset === 'last_month') {
          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (convDate.getMonth() !== lastMonthDate.getMonth() || convDate.getFullYear() !== lastMonthDate.getFullYear()) return false;
        }
        if (filterDatePreset === 'older' && diffDays <= 14) return false;
      }

      // Month Filter (e.g. '2024-05')
      if (filterMonth !== 'all') {
        const convMonthYear = `${convDate.getFullYear()}-${String(convDate.getMonth() + 1).padStart(2, '0')}`;
        if (convMonthYear !== filterMonth) return false;
      }

      // Time Slot Filter
      if (filterTimeSlot !== 'all') {
        const convSlot = getTimeOfDaySlot(convDate);
        const hasMatchingMessage = (c.messages || []).some(m => getTimeOfDaySlot(getMessageDateObj(m, c)) === filterTimeSlot);
        if (convSlot !== filterTimeSlot && !hasMatchingMessage) return false;
      }

      // Custom Range Filter
      if (filterCustomStart) {
        const start = new Date(filterCustomStart + 'T00:00:00');
        if (convDate < start) return false;
      }
      if (filterCustomEnd) {
        const end = new Date(filterCustomEnd + 'T23:59:59');
        if (convDate > end) return false;
      }

      // Search Query
      const activeQuery = (searchQuery || globalFilter.query || '').trim().toLowerCase();
      if (activeQuery) {
        const basicMatch =
          (c.contact_name || '').toLowerCase().includes(activeQuery) ||
          (c.phone_number || '').includes(activeQuery) ||
          (c.service_needed || '').toLowerCase().includes(activeQuery) ||
          (c.tags || []).some(t => t.toLowerCase().includes(activeQuery));

        if (basicMatch) return true;

        // Month names
        const monthLong = convDate.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
        const monthShort = convDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
        const yearStr = String(convDate.getFullYear());
        const dayOfWeek = convDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayOfWeekShort = convDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

        if (monthLong.includes(activeQuery) || monthShort.includes(activeQuery) || yearStr.includes(activeQuery)) {
          return true;
        }
        if (dayOfWeek.includes(activeQuery) || dayOfWeekShort.includes(activeQuery)) {
          return true;
        }

        if (activeQuery === 'today' && convDate.toDateString() === now.toDateString()) return true;
        if (activeQuery === 'yesterday') {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          if (convDate.toDateString() === yesterday.toDateString()) return true;
        }

        // Time slot keyword
        const slot = getTimeOfDaySlot(convDate);
        if (
          (activeQuery === 'morning' && slot === 'morning') ||
          (activeQuery === 'afternoon' && slot === 'afternoon') ||
          (activeQuery === 'evening' && slot === 'evening') ||
          (activeQuery === 'night' && slot === 'night')
        ) {
          return true;
        }

        // Messages content match
        const msgMatch = (c.messages || []).some(m =>
          (m.text || '').toLowerCase().includes(activeQuery) ||
          (m.timestamp || '').toLowerCase().includes(activeQuery)
        );
        if (msgMatch) return true;

        return false;
      }

      return true;
    })
  );

  const POPULAR_EMOJIS = ['😀', '😂', '👍', '❤️', '🙏', '🔥', '🎉', '🚀', '✅', '🗓️', '⏰', '📍', '💰', '🧾', '🔧', '📞', '💬', '📦', '⚡', '✨', '👋', '🤝', '💯', '⭐'];

  const handleEmojiSelect = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentConv) return;
    const sizeKB = (file.size / 1024).toFixed(0);
    const attachmentText = `📎 *Shared Document:* ${file.name} (${sizeKB} KB)`;
    sendMessage(currentConv.id, attachmentText, 'agent', activeSenderDeviceId);
    addToast(`Document "${file.name}" shared with ${currentConv.contact_name}!`, 'success');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startVoiceRecording = async () => {
    if (!currentConv) return;
    audioChunksRef.current = [];

    // Attempt real browser mic recording via MediaRecorder
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        let mimeType = '';
        if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(100);
      }
    } catch (err) {
      console.warn('Microphone permission blocked or unavailable, using simulated voice recording:', err);
    }

    setIsRecordingVoice(true);
    setRecordSeconds(1);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    addToast('Recording voice message... Speak into your mic', 'info');
  };

  const handleCancelVoiceRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecordingVoice(false);
    setRecordSeconds(0);
    addToast('Voice message discarded', 'info');
  };

  const handleSendVoiceRecording = () => {
    if (!currentConv) return;
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    const duration = Math.max(1, recordSeconds || 2);

    // Dynamic amplitude waveform
    const sampleWaveform = [
      20, 35, 60, 45, 80, 95, 70, 50, 65, 85, 90, 40, 30, 55, 75, 90, 60, 45, 30, 60, 80, 70, 50, 30, 20
    ].map((val) => Math.min(100, Math.max(15, Math.floor(val * (0.8 + Math.random() * 0.4)))));

    const finalizeAndSend = (audioUrl?: string, audioBase64?: string) => {
      sendMessage(
        currentConv.id,
        `🎙️ Voice note (${duration}s)`,
        'agent',
        activeSenderDeviceId,
        {
          audioUrl,
          audioBase64,
          audioDuration: duration,
          waveform: sampleWaveform,
          isVoiceNote: true,
        }
      );
      addToast(`Voice note (${duration}s) sent to ${currentConv.contact_name}!`, 'success');
      setIsRecordingVoice(false);
      setRecordSeconds(0);
    };

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        try {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          const audioUrl = URL.createObjectURL(blob);
          const reader = new FileReader();
          reader.onloadend = () => {
            const audioBase64 = (reader.result as string) || '';
            finalizeAndSend(audioUrl, audioBase64);
          };
          reader.onerror = () => {
            finalizeAndSend(audioUrl);
          };
          reader.readAsDataURL(blob);
        } catch {
          finalizeAndSend();
        }
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }
      };
      try {
        mediaRecorderRef.current.stop();
      } catch {
        finalizeAndSend();
      }
    } else {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
      finalizeAndSend();
    }
  };

  const handleToggleVoiceRecording = () => {
    if (!currentConv) return;
    if (isRecordingVoice) {
      handleSendVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  React.useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (!currentConv) return;

    if (text.trim().length > 0) {
      if (!isTypingEmittedRef.current) {
        isTypingEmittedRef.current = true;
        apiClient.post(`/conversations/${currentConv.id}/typing/`, { is_typing: true }).catch(() => {});
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        isTypingEmittedRef.current = false;
        apiClient.post(`/conversations/${currentConv.id}/typing/`, { is_typing: false }).catch(() => {});
      }, 3000);
    } else if (isTypingEmittedRef.current) {
      isTypingEmittedRef.current = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      apiClient.post(`/conversations/${currentConv.id}/typing/`, { is_typing: false }).catch(() => {});
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentConv) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTypingEmittedRef.current) {
      isTypingEmittedRef.current = false;
      apiClient.post(`/conversations/${currentConv.id}/typing/`, { is_typing: false }).catch(() => {});
    }

    sendMessage(currentConv.id, inputText, 'agent', activeSenderDeviceId);
    setInputText('');
  };

  const handleQuickAction = async (action: string) => {
    if (!currentConv) return;
    if (action === 'Create Lead') {
      await addLead({
        name: currentConv.contact_name,
        phone: currentConv.phone_number,
        service: currentConv.service_needed || 'Inquiry',
        stage: 'new',
        value: currentConv.estimated_value || 3000,
        source: 'WhatsApp Chat',
        notes: `Converted from WhatsApp chat. Location: ${currentConv.location || 'Kozhikode'}`,
      });
      setActiveTab('crm-leads');
    } else if (action === 'Send Quotation') {
      const quoteService = currentConv.service_needed || 'AC Repair';
      const quoteVal = currentConv.estimated_value || 2800;
      const quoteMsg = `Hello ${currentConv.contact_name}, here is the official quotation for ${quoteService}: ₹${quoteVal}. Let us know if you would like to proceed!`;
      requestSendConfirmation({
        title: 'Send Official Quotation?',
        subtitle: `Confirm before sending this price quotation to ${currentConv.contact_name} on WhatsApp.`,
        recipientName: currentConv.contact_name,
        recipientPhone: currentConv.phone_number,
        badgeText: 'QUOTATION',
        badgeColor: 'blue',
        messagePreview: quoteMsg,
        metadata: [
          { label: 'Service', value: quoteService },
          { label: 'Quotation Amount', value: `₹${quoteVal.toLocaleString()}` },
        ],
        confirmLabel: 'Confirm & Send Quotation',
        onConfirm: () => {
          sendMessage(currentConv.id, quoteMsg, 'agent', activeSenderDeviceId);
          addToast('Quotation sent to WhatsApp', 'success');
        },
      });
    } else if (action === 'Create Appointment') {
      await addAppointment({
        customer_name: currentConv.contact_name,
        phone: currentConv.phone_number,
        service: currentConv.service_needed || 'AC Inspection & Deep Service',
        employee: currentConv.lead_owner && currentConv.lead_owner !== 'Unassigned' ? currentConv.lead_owner : (employees[0]?.name || 'Unassigned'),
        date_str: 'Tomorrow',
        time_str: '11:00 AM',
        duration: '1h 30m',
        status: 'upcoming',
        location: currentConv.location || 'Kozhikode, Kerala',
        amount: currentConv.estimated_value || 2800,
        advance: Math.round((currentConv.estimated_value || 2800) * 0.3),
        payment_status: 'pending',
        source: 'WhatsApp Assistant',
        notes: `Scheduled from WhatsApp conversation`,
      });
      setActiveTab('ops-appointments');
    } else if (action === 'Convert to Deal') {
      convertConversationToDeal(currentConv.id);
    } else if (action === 'Mark as Resolved') {
      useQiyamStore.setState((s) => ({
        conversations: s.conversations.map((c) =>
          String(c.id) === String(currentConv.id) ? { ...c, status: 'resolved' } : c
        ),
      }));
      apiClient.put(`/conversations/threads/${currentConv.id}/`, { status: 'resolved' }).catch(() => {});
      addToast(`Conversation with ${currentConv.contact_name} marked as resolved!`, 'success');
    }
  };

  const renderCustomerProfile = () => {
    if (!currentConv) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="font-bold text-xs text-slate-700">No Customer Selected</h4>
          <p className="text-[11px] text-slate-400">Select a conversation from the left to view customer details.</p>
        </div>
      );
    }

    return (
      <>
        {/* Customer Avatar Card */}
        <div className="text-center pb-4 border-b border-slate-100 flex flex-col items-center">
          <div className="relative group cursor-pointer mb-2">
            <CustomerAvatar conversation={currentConv} size="xl" showPresence={true} />
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              title="Change or Upload WhatsApp Profile Picture"
              className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer shadow-lg"
            >
              <Camera size={20} className="mb-0.5 drop-shadow-sm" />
              <span className="text-[10px] font-bold">Edit DP</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h4 className="font-bold text-sm text-slate-900">{currentConv.contact_name || 'Customer'}</h4>
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              title="Upload or Update WhatsApp DP"
              className="text-slate-400 hover:text-emerald-600 p-0.5 rounded transition-colors cursor-pointer"
            >
              <Camera size={13} />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-mono">{currentConv.phone_number}</p>

          {/* Real Customer WhatsApp Presence Status Badge (Read-only real data) */}
          <div className="flex items-center justify-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full select-none">
            <span
              className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${
                isCustomerReallyOnline
                  ? 'bg-emerald-500 shadow-xs ring-2 ring-emerald-200'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-600">
              {typingUsers[currentConv.id]
                ? 'Typing...'
                : isCustomerReallyOnline
                ? 'Online on WhatsApp'
                : `Offline • Last seen ${customerRealLastSeen}`}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {currentConv.category || 'Lead'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {currentConv.lead_stage || 'New Lead'}
            </span>
          </div>
        </div>

        {/* Active WhatsApp Outbound Sender Line Card */}
        <div
          onClick={() => setActiveTab('settings-whatsapp')}
          className="p-3 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 hover:from-emerald-100/90 hover:to-teal-100/90 border border-emerald-200/90 rounded-xl transition-all cursor-pointer group shadow-2xs"
          title="Click to configure WhatsApp Cloud API credentials and sender lines in Settings"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">
                Outbound Sender Line
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 group-hover:text-emerald-950 font-semibold flex items-center gap-0.5">
              <span>Configure</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-mono font-extrabold text-sm text-emerald-950 tracking-wide">
              {metaConfig?.business_phone_display || '+91 98765 43210'}
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300/80 shadow-2xs">
              Meta Verified
            </span>
          </div>

          <p className="text-[10px] text-emerald-800/80 mt-1 leading-snug font-medium">
            All WhatsApp messages to {currentConv.contact_name || 'this customer'} originate from this line
          </p>
        </div>

        {/* WhatsApp Compliance & Suppression Status Card */}
        <div className={`p-3 rounded-xl border ${
          currentSuppression
            ? 'bg-rose-50/90 border-rose-200 text-rose-900'
            : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              WhatsApp Compliance
            </span>
            {currentSuppression ? (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 flex items-center gap-1">
                <Ban className="w-2.5 h-2.5" />
                <span>{currentSuppression.label}</span>
              </span>
            ) : (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" />
                <span>Active &amp; Opted In</span>
              </span>
            )}
          </div>
          {currentSuppression ? (
            <div className="space-y-1.5 text-xs mt-1.5">
              <p className="text-[11px] text-rose-700 leading-snug font-medium">
                {currentSuppression.reason}
              </p>
              <div className="flex items-center justify-between text-[10px] text-rose-500 font-mono pt-1 border-t border-rose-200/60">
                <span>Date: {currentSuppression.date}</span>
                {currentSuppression.metaErrorCode && <span>Code: {currentSuppression.metaErrorCode}</span>}
              </div>
              <button
                type="button"
                onClick={() => {
                  removeSuppressionRecord(currentConv.phone_number);
                }}
                className="w-full mt-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-subscribe with Consent</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentConv) {
                    const cleanPhone = currentConv.phone_number.replace(/\s+/g, '');
                    setSuppressionSearchQuery(cleanPhone || currentConv.contact_name || '');
                  }
                  setActiveTab('bulk-suppression');
                }}
                className="w-full mt-1 py-1 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 rounded-lg text-[10px] font-bold shadow-2xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View in Suppression Hub</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1 text-[11px] text-emerald-700">
              <span className="text-[10px] text-slate-500">Zero delivery violations</span>
              <button
                type="button"
                onClick={() => setIsManualOptOutModalOpen(true)}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                title="Review warning and manually enforce opt-out"
              >
                + Manual Opt-Out
              </button>
            </div>
          )}
        </div>

        {/* Lead Information */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">
            Lead Details
          </h5>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Lead Owner:</span>
              <button
                onClick={() => setIsAssignStaffOpen(true)}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-xs"
                title="Change staff assignment"
              >
                <span>{currentConv.lead_owner && currentConv.lead_owner !== 'Unassigned' ? currentConv.lead_owner : 'Unassigned'}</span>
                <Edit2 className="w-3 h-3 text-slate-400" />
              </button>
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
              <span className="font-medium text-slate-800">{currentConv.source || 'WhatsApp'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Location:</span>
              <span className="font-medium text-slate-800">{currentConv.location || 'Kozhikode, Kerala'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Language:</span>
              <span className="font-medium text-slate-800">{currentConv.language || 'English'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="text-slate-400">Sending Line:</span>
              <span
                onClick={() => setActiveTab('settings-whatsapp')}
                className="font-mono font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer flex items-center gap-0.5"
                title="Click to configure WhatsApp sender line in Settings"
              >
                <span>{metaConfig?.business_phone_display || '+91 98765 43210'}</span>
                <ChevronRight className="w-3 h-3 text-emerald-600" />
              </span>
            </div>
          </div>
        </div>

        {/* Active Workflow Interactive Control Card */}
        <div className="p-3.5 bg-gradient-to-br from-purple-50/90 to-indigo-50/70 rounded-xl border border-purple-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${currentConv.active_workflow === 'Paused' ? 'bg-amber-500' : 'bg-purple-600 animate-pulse'}`} />
              <span className="text-[10px] font-bold text-purple-950 uppercase tracking-wider">
                Active Workflow
              </span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
              currentConv.active_workflow === 'Paused'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-purple-100 text-purple-800 border-purple-300'
            }`}>
              {currentConv.active_workflow === 'Paused' ? 'Paused' : 'Running'}
            </span>
          </div>

          <div>
            <div className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">{currentConv.active_workflow || 'Service Booking Flow'}</span>
            </div>
            <p className="text-[10px] text-purple-800/80 mt-0.5 leading-snug">
              {currentConv.active_workflow === 'Paused'
                ? 'AI Bot auto-reply is currently paused. Live agent has full manual control.'
                : 'Automated 4-option WhatsApp router & CRM appointment engine.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-purple-200/60">
            <button
              type="button"
              onClick={() => {
                const isPaused = currentConv.active_workflow === 'Paused';
                toggleConversationWorkflow(currentConv.id, !isPaused, 'Service Booking Flow');
              }}
              className={`py-1 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                currentConv.active_workflow === 'Paused'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
              }`}
            >
              {currentConv.active_workflow === 'Paused' ? (
                <>
                  <Play className="w-2.5 h-2.5" />
                  <span>Resume Bot</span>
                </>
              ) : (
                <>
                  <Pause className="w-2.5 h-2.5" />
                  <span>Pause Bot</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                handleOpenWorkflowBuilder(currentConv.active_workflow || 'Service Booking Flow');
              }}
              className="py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Edit Flow</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsWorkflowModalOpen(true)}
            className="w-full py-0.5 text-center text-[10px] font-semibold text-purple-700 hover:text-purple-950 underline cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Inspect Rules &amp; Decision Paths</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Tags */}
        <div>
          <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400 mb-1.5">
            Tags
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {(currentConv.tags || []).map((t, idx) => (
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
            onClick={() => convertConversationToDeal(currentConv.id)}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-center text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Convert to Deal</span>
          </button>
          <button
            onClick={async () => {
              if (currentConv) {
                const created = await addJob({
                  customer_name: currentConv.contact_name,
                  phone: currentConv.phone_number,
                  service: currentConv.service_needed || 'AC Maintenance & Inspection',
                  location: currentConv.location || 'Kozhikode, Kerala',
                  amount: currentConv.estimated_value || 3200,
                  assigned_to: currentConv.lead_owner && currentConv.lead_owner !== 'Unassigned' ? currentConv.lead_owner : (employees[0]?.name || 'Unassigned'),
                  status: 'scheduled',
                  priority: 'high',
                });
                if (created) {
                  setTargetHighlightId(created.job_id_str || created.id);
                }
              }
              setActiveTab('ops-jobs');
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-center text-xs transition-all cursor-pointer"
          >
            Dispatch Job
          </button>
          {currentConv?.is_deleted ? (
            <button
              onClick={async () => {
                if (currentConv) await restoreConversation(currentConv.id);
              }}
              title="Retrieve this conversation back to active inbox"
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retrieve Conversation</span>
            </button>
          ) : (
            <button
              onClick={() => setConversationToDelete(currentConv)}
              title="Delete this conversation"
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-xl font-semibold text-center text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Conversation</span>
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-hidden font-sans">
      <Header
        title="Conversations"
        subtitle="Manage WhatsApp multi-agent conversations, customer inquiries, and AI-assisted workflows."
        primaryActionLabel="New WhatsApp Chat"
        onPrimaryAction={() => setIsSimulatorOpen(true)}
      />

      {/* Top Connected Employee Devices & QR Link Action Strip */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Device Inbox:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsDevicesDetailsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 hover:border-emerald-300 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs group active:scale-95"
              title="Click to view full details of all linked employee WhatsApp phones"
            >
              <span className="text-xs group-hover:scale-110 transition-transform">📱</span>
              <span className="font-bold">{linkedDevices.length} Employee Phone{linkedDevices.length === 1 ? '' : 's'} Linked</span>
              <ChevronRight className="w-3 h-3 text-emerald-600/70 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all" />
            </button>

            <span className="hidden sm:inline text-slate-300">•</span>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Company Official Line: <strong className="font-mono text-slate-800 font-semibold">{metaConfig?.business_phone_display || '+91 94963 00233'}</strong> (Meta Cloud API)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => setIsLinkDeviceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer"
            title="Scan QR code to connect an employee's WhatsApp phone to this dashboard"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Link Employee WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main 3-Pane WhatsApp Shared Inbox */}
      <div className="flex-1 flex overflow-hidden border-t border-slate-200">
        {/* Pane 1: Conversation List (Left 320px on desktop, full width on mobile) */}
        <div className={`w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
          {/* Filter Tabs */}
          <DraggableScrollRow
            showArrows={false}
            fadeEdges={true}
            className="border-b border-slate-100 shrink-0"
            innerClassName="px-3 pt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-600 scrollbar-hide scrollbar-none no-scrollbar"
            wheelMultiplier={1.2}
          >
            <button
              onClick={() => handleSelectFilterTab('all')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'all' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => handleSelectFilterTab('open')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'open' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Open ({counts.open})
            </button>
            <button
              onClick={() => handleSelectFilterTab('in_progress')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'in_progress' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              In Progress ({counts.in_progress})
            </button>
            <button
              onClick={() => handleSelectFilterTab('waiting')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'waiting' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Waiting ({counts.waiting})
            </button>
            <button
              onClick={() => handleSelectFilterTab('resolved')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeFilterTab === 'resolved' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Resolved ({counts.resolved})
            </button>
            <button
              onClick={() => handleSelectFilterTab('deleted')}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilterTab === 'deleted' ? 'border-amber-600 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              title="Deleted conversations (Trash bin)"
            >
              <Trash2 className="w-3 h-3" />
              <span>Trash ({counts.deleted})</span>
            </button>
          </DraggableScrollRow>

          {/* Search Box & Filter Controls */}
          <div ref={filterContainerRef} className="p-3 border-b border-slate-100 flex items-center gap-2 relative">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, month, time..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1.5 border rounded-lg transition-all relative cursor-pointer ${
                isAnyDateFilterActive || isFilterOpen
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Filter by Date, Month & Time"
            >
              <Filter className="w-3.5 h-3.5" />
              {isAnyDateFilterActive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Date / Month / Time Filter Popover */}
            {isFilterOpen && (
              <div className="absolute top-full left-3 right-3 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-4 space-y-3.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Filter Conversations</span>
                  </div>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Date Presets */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    {[
                      { id: 'all', label: 'All Dates' },
                      { id: 'today', label: 'Today' },
                      { id: 'yesterday', label: 'Yesterday' },
                      { id: 'this_week', label: 'This Week' },
                      { id: 'this_month', label: 'This Month' },
                      { id: 'last_month', label: 'Last Month' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setFilterDatePreset(preset.id as any)}
                        className={`px-2 py-1.5 rounded-md border text-center transition-all cursor-pointer font-medium truncate ${
                          filterDatePreset === preset.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Month & Year Filter */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span>Month & Year</span>
                    {filterMonth !== 'all' ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : availableMonths.length > 0 ? (
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({availableMonths.length} {availableMonths.length === 1 ? 'month' : 'months'})
                      </span>
                    ) : null}
                  </label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label} ({m.count} {m.count === 1 ? 'chat' : 'chats'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time of Day Slot */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Time of Day
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { id: 'all', label: 'All Day', icon: Clock },
                      { id: 'morning', label: 'Morning (6-12)', icon: Sun },
                      { id: 'afternoon', label: 'Afternoon (12-5)', icon: Sun },
                      { id: 'evening', label: 'Evening (5-10)', icon: Sunset },
                    ].map((slot) => {
                      const Icon = slot.icon;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setFilterTimeSlot(slot.id as any)}
                          className={`px-2 py-1.5 rounded-md border flex items-center gap-1.5 transition-all cursor-pointer font-medium truncate ${
                            filterTimeSlot === slot.id
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{slot.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Range */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Custom Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">From</span>
                      <input
                        type="date"
                        value={filterCustomStart}
                        onChange={(e) => setFilterCustomStart(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">To</span>
                      <input
                        type="date"
                        value={filterCustomEnd}
                        onChange={(e) => setFilterCustomEnd(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={clearAllDateFilters}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Badges Bar */}
          {isAnyDateFilterActive && (
            <div className="px-3 py-1.5 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-emerald-800 text-[10px] uppercase tracking-wider">Filtered:</span>
              {filterDatePreset !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md font-medium shadow-2xs">
                  <span>📅 {filterDatePreset === 'this_week' ? 'This Week' : filterDatePreset === 'this_month' ? 'This Month' : filterDatePreset === 'last_month' ? 'Last Month' : filterDatePreset.charAt(0).toUpperCase() + filterDatePreset.slice(1)}</span>
                  <button onClick={() => setFilterDatePreset('all')} className="hover:text-emerald-900 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {filterMonth !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md font-medium shadow-2xs">
                  <span>🗓️ {availableMonths.find(m => m.key === filterMonth)?.label || filterMonth}</span>
                  <button onClick={() => setFilterMonth('all')} className="hover:text-emerald-900 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {filterTimeSlot !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md font-medium shadow-2xs">
                  <span>⏰ {filterTimeSlot.charAt(0).toUpperCase() + filterTimeSlot.slice(1)}</span>
                  <button onClick={() => setFilterTimeSlot('all')} className="hover:text-emerald-900 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {(filterCustomStart || filterCustomEnd) && (
                <span className="inline-flex items-center gap-1 bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md font-medium shadow-2xs">
                  <span>📆 {filterCustomStart || 'Start'} to {filterCustomEnd || 'End'}</span>
                  <button onClick={() => { setFilterCustomStart(''); setFilterCustomEnd(''); }} className="hover:text-emerald-900 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              <button
                onClick={clearAllDateFilters}
                className="ml-auto text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-700">
                    {activeFilterTab === 'deleted' ? 'Trash is Empty' : 'No Conversations'}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeFilterTab === 'deleted'
                      ? 'Deleted conversations will appear here so you can retrieve them anytime.'
                      : searchQuery || isAnyDateFilterActive
                      ? 'No chats match this date/time filter.'
                      : 'Incoming WhatsApp messages will appear here.'}
                  </p>
                </div>
                {isAnyDateFilterActive && (
                  <button
                    onClick={clearAllDateFilters}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Clear Date Filters
                  </button>
                )}
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>+ Start WhatsApp Chat</span>
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected =
                  String(conv.id) === String(selectedConversationId) ||
                  (currentConv && String(conv.id) === String(currentConv.id));
                const lastMessage = (conv.messages && conv.messages.length > 0) ? conv.messages[conv.messages.length - 1] : null;
                const dateBadge = getConversationDateBadge(conv);
                const convSuppression = getSuppressionStatus(conv);

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversationId(conv.id);
                      prevSelectedConvIdRef.current = conv.id;
                      setIsMobileChatOpen(true);
                    }}
                    className={`group relative p-3 cursor-pointer transition-all flex items-start gap-3 hover:bg-slate-50 ${
                      isSelected ? 'bg-emerald-50/50 border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <CustomerAvatar conversation={conv} size="md" showPresence={true} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate">{conv.contact_name || 'Customer'}</div>
                          {convSuppression && (
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${
                                convSuppression.isBlocked
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                              title={convSuppression.reason}
                            >
                              <Ban className="w-2.5 h-2.5" />
                              <span>{convSuppression.label}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded tracking-tight ${
                              dateBadge.isToday
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                                : dateBadge.isYesterday
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                                : 'bg-slate-100 text-slate-600 border border-slate-200/70'
                            }`}
                            title={`Conversation date: ${dateBadge.dateLabel}`}
                          >
                            {dateBadge.dateLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">{dateBadge.timeLabel}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono">{conv.phone_number}</div>

                      {typingUsers[conv.id] ? (
                        <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 animate-pulse mt-0.5">
                          <span>typing</span>
                          <span className="flex gap-0.5 items-center">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 truncate mt-0.5 font-medium flex items-center gap-1">
                          {lastMessage && lastMessage.sender !== 'customer' && (
                            lastMessage.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.4] shrink-0" />
                            ) : lastMessage.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                            )
                          )}
                          <span className="truncate">{lastMessage ? lastMessage.text : 'New message...'}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            conv.category === 'Hot Lead'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : conv.category === 'Lead'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {conv.category || 'Lead'}
                        </span>
                        {(conv.active_line_type === 'employee' || Boolean(conv.active_employee_name)) && (
                          <span
                            className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200 shrink-0 max-w-[125px] truncate"
                            title={`Active on employee line: ${conv.active_employee_name || conv.active_line_device} (${conv.active_line_phone || ''})`}
                          >
                            <Smartphone className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                            <span className="truncate">{conv.active_employee_name || conv.active_line_device || 'Employee Line'}</span>
                          </span>
                        )}
                        {(conv.unread_count || 0) > 0 && (
                          <span className="ml-auto w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                        {conv.is_deleted || activeFilterTab === 'deleted' ? (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await restoreConversation(conv.id);
                            }}
                            title={`Retrieve conversation with ${conv.contact_name || 'customer'}`}
                            className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retrieve</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConversationToDelete(conv);
                            }}
                            title={`Delete conversation with ${conv.contact_name || 'customer'}`}
                            className={`opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer shrink-0 ${
                              (conv.unread_count || 0) > 0 ? 'ml-1' : 'ml-auto'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pane 2: Active Chat Canvas (Center flex-1) */}
        <div className={`flex-1 flex flex-col bg-[#F0F2F5] min-w-0 ${!isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
          {!currentConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-[#F0F2F5] space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="max-w-sm space-y-1.5">
                <h3 className="font-bold text-slate-900 text-base">WhatsApp Multi-Agent Inbox</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select an active customer conversation from the list to read messages, monitor real-time typing indicators, and send automated responses.
                </p>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Start New WhatsApp Chat</span>
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Back to conversation list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Click to view or update WhatsApp DP"
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <CustomerAvatar conversation={currentConv} size="md" showPresence={true} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{currentConv.contact_name || 'Customer'}</h3>
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {currentConv.category || 'Lead'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 hidden xs:inline">• Open</span>

                      {/* Real Customer WhatsApp Presence Status Badge (Read-only real data) */}
                      <div
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all duration-300 select-none ${
                          typingUsers[currentConv.id] || isCustomerReallyOnline
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                          typingUsers[currentConv.id] || isCustomerReallyOnline
                            ? 'bg-emerald-500 animate-pulse ring-1 ring-emerald-300'
                            : 'bg-slate-400'
                        }`} />
                        <span>
                          {typingUsers[currentConv.id]
                            ? 'Typing...'
                            : isCustomerReallyOnline
                            ? 'Online'
                            : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 flex-wrap mt-0.5">
                      {typingUsers[currentConv.id] ? (
                        <div className="text-[11px] sm:text-xs text-emerald-600 font-semibold tracking-wide flex items-center gap-1 animate-in fade-in duration-150">
                          <span>typing...</span>
                        </div>
                      ) : (
                        <>
                          <span>{currentConv.phone_number}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            {isCustomerReallyOnline
                              ? <span className="text-emerald-600 font-semibold">Active now</span>
                              : <span>Last seen {customerRealLastSeen}</span>}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <div ref={assignDropdownRef} className="relative inline-flex items-center">
                        <button
                          onClick={() => setIsAssignStaffOpen(!isAssignStaffOpen)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium border transition-all cursor-pointer ${
                            currentConv.lead_owner && currentConv.lead_owner !== 'Unassigned'
                              ? 'bg-blue-50/90 text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 ring-1 ring-amber-300/60'
                          }`}
                          title="Click to assign or reassign this chat to any staff member"
                        >
                          <UserCheck className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="text-slate-500 font-normal">Assigned:</span>
                          <strong className="font-semibold truncate max-w-[110px] sm:max-w-[140px]">
                            {currentConv.lead_owner && currentConv.lead_owner !== 'Unassigned'
                              ? currentConv.lead_owner
                              : 'Unassigned'}
                          </strong>
                          <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        </button>

                        {isAssignStaffOpen && (
                          <div className="absolute top-full left-0 sm:left-auto sm:right-auto mt-1.5 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-3 space-y-2.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Assign Staff Member</span>
                                </h4>
                                <p className="text-[10px] text-slate-400">Notifies via software & real WhatsApp</p>
                              </div>
                              <button
                                onClick={() => setIsAssignStaffOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Staff Search */}
                            <div className="relative">
                              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={staffSearchQuery}
                                onChange={(e) => setStaffSearchQuery(e.target.value)}
                                placeholder="Search staff by name or role..."
                                className="w-full pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            {/* Staff Options List */}
                            <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
                              {/* Unassigned Option */}
                              <button
                                onClick={() => handleAssignStaff('Unassigned')}
                                disabled={isAssigningStaff}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer ${
                                  !currentConv.lead_owner || currentConv.lead_owner === 'Unassigned'
                                    ? 'bg-amber-50/80 border border-amber-300 font-semibold text-amber-900'
                                    : 'hover:bg-slate-50 border border-transparent text-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                                    ⚪
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-slate-800">Unassigned</p>
                                    <p className="text-[10px] text-slate-400">Open team pool</p>
                                  </div>
                                </div>
                                {(!currentConv.lead_owner || currentConv.lead_owner === 'Unassigned') && (
                                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                )}
                              </button>

                              {/* Real Staff Members */}
                              {filteredEmployees.map((emp) => {
                                const isCurrent = currentConv.lead_owner === emp.name;
                                return (
                                  <button
                                    key={emp.id || emp.name}
                                    onClick={() => handleAssignStaff(emp.name, emp.phone)}
                                    disabled={isAssigningStaff}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer ${
                                      isCurrent
                                        ? 'bg-emerald-50 border border-emerald-300 font-semibold text-emerald-900 shadow-2xs'
                                        : 'hover:bg-slate-50 border border-transparent text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 overflow-hidden">
                                        {'avatar_url' in emp && emp.avatar_url ? (
                                          <img src={emp.avatar_url} alt={emp.name} className="w-full h-full object-cover" />
                                        ) : (
                                          emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-800 truncate">{emp.name}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                                          <span>{emp.role || 'Staff'}</span>
                                          {emp.phone && (
                                            <>
                                              <span>•</span>
                                              <span className="text-slate-500">{emp.phone}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {isCurrent && (
                                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        Active
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Footer: Quick Add New Staff Button */}
                            <div className="pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAssignStaffOpen(false);
                                  setIsQuickAddStaffOpen(true);
                                }}
                                className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-emerald-200 shadow-2xs"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                                <span>+ Onboard New Staff Member</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {isHeaderActionsMinimized ? (
                    /* Minimized State: Sleek Expand Button + Quick Actions Dropdown */
                    <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                      <button
                        onClick={toggleHeaderActions}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all shadow-2xs cursor-pointer group"
                        title="Expand chat options bar"
                        aria-label="Expand chat options bar"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Options</span>
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
                          title="Quick Actions Menu"
                          aria-label="Quick Actions Menu"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {isHeaderMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsHeaderMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                              <button
                                onClick={() => {
                                  setIsHeaderMenuOpen(false);
                                  handleLoadLatestChat();
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                              >
                                <RefreshCw className={`w-4 h-4 text-emerald-600 shrink-0 ${isRefreshingLatest ? 'animate-spin' : ''}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">Load Latest Chat</p>
                                  <p className="text-[10px] text-slate-400 truncate">Sync messages & jump to bottom</p>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setIsHeaderMenuOpen(false);
                                  addToast(`Calling ${currentConv.contact_name} (${currentConv.phone_number})...`, 'info');
                                  window.open(`tel:${currentConv.phone_number.replace(/\s+/g, '')}`, '_self');
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                              >
                                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">Call Customer</p>
                                  <p className="text-[10px] text-slate-400 truncate">{currentConv.phone_number}</p>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setIsHeaderMenuOpen(false);
                                  setIsWorkflowModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left cursor-pointer"
                              >
                                <Zap className="w-4 h-4 text-purple-600 fill-purple-100 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">Automation Workflow</p>
                                  <p className="text-[10px] text-slate-400 truncate">{currentConv.active_workflow || 'Service Booking Flow'}</p>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setIsHeaderMenuOpen(false);
                                  handleQuickAction('Send Quotation');
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                              >
                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">Send Quotation</p>
                                  <p className="text-[10px] text-slate-400">Official price quote</p>
                                </div>
                              </button>

                              {currentConv.is_deleted ? (
                                <button
                                  onClick={async () => {
                                    setIsHeaderMenuOpen(false);
                                    await restoreConversation(currentConv.id);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors text-left cursor-pointer"
                                >
                                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="font-semibold">Retrieve Conversation</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setIsHeaderMenuOpen(false);
                                    setConversationToDelete(currentConv);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                                  <span className="font-semibold">Delete Conversation</span>
                                </button>
                              )}

                              <div className="border-t border-slate-100 my-1" />

                              <button
                                onClick={() => {
                                  setIsHeaderMenuOpen(false);
                                  toggleHeaderActions();
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Expand full action bar</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Expanded State: Full Action Buttons + Minimize Button */
                    <div className="flex items-center gap-1.5 sm:gap-2 animate-in fade-in duration-200">
                      {/* Load Latest Chat & Sync */}
                      <button
                        onClick={handleLoadLatestChat}
                        disabled={isRefreshingLatest}
                        className="p-1.5 sm:p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                        title="Load latest chat & sync"
                        aria-label="Load latest chat & sync"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshingLatest ? 'animate-spin text-emerald-600' : ''}`} />
                      </button>

                      <button
                        onClick={() => {
                          addToast(`Calling ${currentConv.contact_name} (${currentConv.phone_number})...`, 'info');
                          window.open(`tel:${currentConv.phone_number.replace(/\s+/g, '')}`, '_self');
                        }}
                        className="p-1.5 sm:p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                        title={`Call ${currentConv.phone_number}`}
                      >
                        <Phone className="w-4 h-4" />
                      </button>

                      {/* Active Automation Workflow Trigger & Inspector Button (Thunder symbol only) */}
                      <button
                        onClick={() => setIsWorkflowModalOpen(true)}
                        className="p-1.5 sm:p-2 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-lg transition-all cursor-pointer shadow-2xs group"
                        title={`Workflow: ${currentConv.active_workflow || 'Service Booking Flow'} (Click to inspect & control)`}
                        aria-label="Active Automation Workflow"
                      >
                        <Zap className={`w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform fill-purple-200 ${currentConv.active_workflow === 'Paused' ? 'opacity-50' : 'animate-pulse'}`} />
                      </button>

                      <button
                        onClick={() => handleQuickAction('Send Quotation')}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Send Quotation</span>
                      </button>
                      {currentConv.is_deleted ? (
                        <button
                          onClick={async () => {
                            await restoreConversation(currentConv.id);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:border-emerald-300 rounded-lg border border-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                          title="Retrieve conversation back to active inbox"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retrieve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setConversationToDelete(currentConv)}
                          className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg border border-slate-200 transition-all cursor-pointer"
                          title="Delete Conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Minimize Options Button */}
                      <button
                        onClick={toggleHeaderActions}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer group"
                        title="Minimize options bar"
                        aria-label="Minimize options bar"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* Customer 360 info toggle for screens < xl */}
                  <button
                    onClick={() => setIsCustomerDetailsOpen(true)}
                    className="xl:hidden p-1.5 sm:p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                    title="Customer 360 Details"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Soft Deleted / Trash Notice Banner */}
              {currentConv.is_deleted && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-2xs text-xs text-amber-900">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-amber-950">This conversation is in Trash.</span>{' '}
                      <span className="text-amber-800 hidden sm:inline">
                        All previous messages are safely preserved. You can retrieve it anytime to bring it back to your active inbox.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await restoreConversation(currentConv.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retrieve Conversation</span>
                  </button>
                </div>
              )}

              {/* Suppression / Opt-Out & Blocked Live Compliance Warning Banner */}
              {currentSuppression && (
                <div className="bg-rose-50 border-b border-rose-200/90 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 shadow-2xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-700 mt-0.5 shrink-0">
                      <Ban className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-rose-950">
                          {currentSuppression.isBlocked
                            ? 'Customer Blocked Business Number'
                            : 'Customer Opted Out (Unsubscribed)'}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 uppercase tracking-wider">
                          Compliance Enforced
                        </span>
                        {currentSuppression.metaErrorCode && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-white text-rose-800 border border-rose-200">
                            Meta Error {currentSuppression.metaErrorCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-medium">
                        {currentSuppression.reason}
                      </p>
                      <div className="text-[10px] text-rose-600/80 font-mono mt-0.5">
                        Enforced on {currentSuppression.date} • Promotional broadcasts and automated marketing templates are suspended.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentConv) {
                          removeSuppressionRecord(currentConv.phone_number);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      title="Clear suppression with explicit customer opt-in consent"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-subscribe with Consent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentConv) {
                          const cleanPhone = currentConv.phone_number.replace(/\s+/g, '');
                          setSuppressionSearchQuery(cleanPhone || currentConv.contact_name || '');
                        }
                        setActiveTab('bulk-suppression');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-100/50 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
                      title="Open Compliance & Suppression List Hub"
                    >
                      <span>Suppression Hub</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Active WhatsApp Line Channel Banner */}
              {conversationActiveLine && (
                <div className={`px-4 py-2 border-b flex items-center justify-between gap-3 text-xs transition-colors shrink-0 ${
                  conversationActiveLine.type === 'employee'
                    ? 'bg-gradient-to-r from-teal-50/95 via-emerald-50/80 to-teal-50/90 border-teal-200/90 text-teal-950'
                    : 'bg-slate-50/90 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs font-bold ${
                      conversationActiveLine.type === 'employee'
                        ? 'bg-teal-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {conversationActiveLine.type === 'employee'
                            ? `Active Chat Line: ${conversationActiveLine.employeeName}`
                            : 'Active Chat Line: Meta Cloud API'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          conversationActiveLine.type === 'employee'
                            ? 'bg-teal-100 text-teal-800 border border-teal-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${conversationActiveLine.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          {conversationActiveLine.type === 'employee' ? 'Employee Linked Number' : 'Official Verified Business Line'}
                        </span>
                        {conversationActiveLine.deviceLabel && (
                          <span className="text-[10px] text-slate-600 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200/80 font-medium">
                            {conversationActiveLine.deviceLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        <span className="font-bold text-slate-800">{conversationActiveLine.phone}</span>
                        <span>•</span>
                        <span className="font-sans text-[10.5px] text-slate-600 truncate">
                          {conversationActiveLine.type === 'employee'
                            ? 'Replies directly to this employee phone appear here live. Broadcasts & templates remain sent via Meta Cloud API (+91 94963 00233).'
                            : 'Customer messages and official template broadcasts routed via Meta Cloud API.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Outbound Line Switcher Quick Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsLineSelectorOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[11px] font-semibold transition shadow-2xs cursor-pointer"
                      title="Select which WhatsApp line to send outgoing replies from"
                    >
                      <span className="text-slate-500">Outbound:</span>
                      <span className="text-teal-700 font-bold truncate max-w-[120px]">
                        {activeSenderDeviceId === 'meta_cloud'
                          ? 'Meta Cloud API'
                          : (linkedDevices.find(d => String(d.id) === String(activeSenderDeviceId))?.device_label || 'Employee Line')}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Messages Body & Floating Controls */}
              <div className="relative flex-1 min-h-0 flex flex-col">
                <div
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative"
                >
                {/* Official WhatsApp Dynamic Sticky Floating Date Header */}
                {activeFloatingDate && (
                  <div className="sticky top-1 z-20 flex justify-center pointer-events-none select-none transition-all duration-200">
                    <div className="inline-flex items-center px-3.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      {activeFloatingDate}
                    </div>
                  </div>
                )}

                {messageGroups.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500">No messages yet in this conversation.</p>
                  </div>
                ) : (
                  messageGroups.map((group) => (
                    <div
                      key={group.dayKey}
                      data-day-key={group.dayKey}
                      data-day-label={group.label}
                      className="message-day-group space-y-4"
                    >
                      {/* In-stream WhatsApp Centered Date Divider */}
                      <div className="flex justify-center my-3 select-none pointer-events-none">
                        <div className="inline-flex items-center px-3.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {group.label}
                        </div>
                      </div>

                      {group.messages.map((msg) => {
                        const isCustomer = msg.sender === 'customer';
                        const isBot = msg.sender === 'bot';
                        const allMessages = currentConv.messages || [];
                        const msgIndex = allMessages.findIndex((m) => m.id === msg.id);

                        // WhatsApp Real-Time Monotonic Read Status Rule:
                        // - Double Blue Tick ('read'): Recipient opened/read chat, replied after, or later outbound is marked read
                        // - Double Grey Tick ('delivered'): Recipient device received message (phone data/WiFi is ON)
                        // - Single Grey Tick ('sent'): Sent to WhatsApp network (phone data is OFF or in transit)
                        const hasLaterReadOutbound = allMessages.slice(msgIndex + 1).some(
                          (m) => m.sender !== 'customer' && m.status === 'read'
                        );
                        const hasCustomerReplyAfter = allMessages.slice(msgIndex + 1).some(
                          (m) => m.sender === 'customer'
                        );

                        const isRead = !isCustomer && (
                          msg.status === 'read' ||
                          hasLaterReadOutbound ||
                          hasCustomerReplyAfter
                        );

                        const isDelivered = !isCustomer && !isRead && msg.status === 'delivered';
                        const tooltipStr = formatFullMessageTooltip(msg, currentConv);

                        const isQuotation = 
                          msg.text.includes('Official Price Quotation') || 
                          msg.text.includes('Price Quotation') || 
                          msg.text.toLowerCase().includes('quotation') ||
                          msg.richCard?.type === 'quotation';

                        const isTemplateMessage = !isCustomer && (
                          isBot ||
                          Boolean(msg.isTemplate) ||
                          Boolean(msg.senderName?.toLowerCase().includes('template')) ||
                          isQuotation ||
                          Boolean(msg.richCard) ||
                          msg.text.includes('📋') ||
                          msg.text.includes('Valid Until:') ||
                          msg.text.toLowerCase().includes('booking confirmation') ||
                          msg.text.toLowerCase().includes('service booking') ||
                          msg.text.toLowerCase().includes('appointment scheduled') ||
                          msg.text.toLowerCase().includes('official invoice') ||
                          msg.text.includes('{{') ||
                          (msg.text.includes('\n') && (msg.text.includes('*') || msg.text.includes('₹') || msg.text.includes(':')))
                        );

                        const messageWorkflowName = msg.workflowName || currentConv.active_workflow || 'Service Booking Flow';

                        const outgoingSender = !isCustomer ? (() => {
                          let phone = (msg.sender_phone || '').trim();
                          let deviceLabel = (msg.sender_device || '').trim();

                          if (!phone && deviceLabel) {
                            const matchedDev = linkedDevices.find(
                              (d) => d.device_label === deviceLabel || String(d.id) === deviceLabel
                            );
                            if (matchedDev?.phone_number) {
                              phone = matchedDev.phone_number;
                            }
                          }

                          if (!phone) {
                            if (activeSenderDeviceId && activeSenderDeviceId !== 'meta_cloud') {
                              const activeDev = linkedDevices.find((d) => String(d.id) === String(activeSenderDeviceId));
                              if (activeDev?.phone_number) {
                                phone = activeDev.phone_number;
                                if (!deviceLabel) deviceLabel = activeDev.device_label;
                              }
                            }
                          }

                          if (!phone && linkedDevices.length > 0) {
                            const connectedDev = linkedDevices.find((d) => d.status === 'connected') || linkedDevices[0];
                            if (connectedDev?.phone_number) {
                              phone = connectedDev.phone_number;
                              if (!deviceLabel) deviceLabel = connectedDev.device_label;
                            }
                          }

                          if (!phone) {
                            phone = metaConfig?.business_phone_display || '+91 94963 00233';
                            if (!deviceLabel) deviceLabel = 'Meta Cloud API';
                          }

                          return {
                            phone,
                            deviceLabel: deviceLabel || (isBot ? 'Qiyam AI Assistant' : 'WhatsApp Line'),
                          };
                        })() : null;

                        const incomingRecipient = isCustomer ? (() => {
                          const lineCard = (msg.richCard as any)?.received_on_line;
                          if (lineCard) {
                            return {
                              phone: lineCard.phone_number || lineCard.phone,
                              deviceLabel: lineCard.device_label || lineCard.deviceLabel,
                              employeeName: lineCard.employee_name || lineCard.employeeName,
                              lineType: lineCard.line_type || 'employee',
                            };
                          }
                          if (msg.recipient_phone) {
                            const matchedDev = linkedDevices.find((d) => {
                              const devClean = (d.phone_number || '').replace(/\D/g, '');
                              const recipClean = (msg.recipient_phone || '').replace(/\D/g, '');
                              return devClean && recipClean && (devClean.endsWith(recipClean.slice(-10)) || recipClean.endsWith(devClean.slice(-10)));
                            });
                            return {
                              phone: msg.recipient_phone,
                              deviceLabel: matchedDev?.device_label || (msg.recipient_phone.includes('94963') ? 'Meta Cloud API' : 'Employee WhatsApp'),
                              employeeName: matchedDev?.employee_name || '',
                              lineType: matchedDev ? 'employee' : (msg.recipient_phone.includes('94963') ? 'meta_cloud' : 'employee'),
                            };
                          }
                          if (currentConv.active_line_type === 'employee' && (currentConv.active_line_phone || currentConv.active_line_device)) {
                            return {
                              phone: currentConv.active_line_phone,
                              deviceLabel: currentConv.active_line_device,
                              employeeName: currentConv.active_employee_name,
                              lineType: 'employee',
                            };
                          }
                          return {
                            phone: metaConfig?.business_phone_display || '+91 94963 00233',
                            deviceLabel: 'Meta Cloud API',
                            employeeName: '',
                            lineType: 'meta_cloud',
                          };
                        })() : null;

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                          >
                            <div
                              title={tooltipStr}
                              className={`max-w-md p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                                isCustomer
                                  ? 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                                  : isBot
                                  ? 'bg-emerald-700 text-white rounded-tr-sm shadow-md'
                                  : 'bg-emerald-600 text-white rounded-tr-sm'
                              }`}
                            >
                              {/* 1. Header: Incoming Customer Message Received Channel */}
                              {isCustomer && incomingRecipient && (
                                <div className="flex items-center justify-between gap-2 pb-1.5 mb-2.5 border-b border-slate-100 text-[10.5px]">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Smartphone className={`w-3.5 h-3.5 shrink-0 ${incomingRecipient.lineType === 'employee' ? 'text-teal-600' : 'text-slate-400'}`} />
                                    <span className="text-slate-400 text-[10px] font-medium shrink-0">Received on:</span>
                                    <span className={`font-mono font-bold tracking-wide text-[10.5px] truncate ${incomingRecipient.lineType === 'employee' ? 'text-teal-700' : 'text-slate-600'}`}>
                                      {incomingRecipient.phone}
                                    </span>
                                  </div>
                                  <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 truncate max-w-[150px] shadow-2xs ${
                                    incomingRecipient.lineType === 'employee'
                                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}>
                                    {incomingRecipient.employeeName
                                      ? `👤 ${incomingRecipient.employeeName}`
                                      : incomingRecipient.deviceLabel
                                      ? `📱 ${incomingRecipient.deviceLabel}`
                                      : 'Meta Cloud API'}
                                  </span>
                                </div>
                              )}
                              {/* 1. Header: Outgoing Sender Phone & Channel on ALL green messages to avoid any confusion */}
                              {!isCustomer && outgoingSender && (
                                <div className="flex items-center justify-between gap-2 pb-1.5 mb-2.5 border-b border-white/20 text-[10.5px]">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {isBot ? (
                                      <Bot className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                    ) : (
                                      <Smartphone className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                                    )}
                                    <span className="text-emerald-200/90 text-[10px] font-medium shrink-0">Sent from:</span>
                                    <span className="font-mono font-bold text-white tracking-wide text-[11px] drop-shadow-xs truncate">
                                      {outgoingSender.phone}
                                    </span>
                                  </div>
                                  {outgoingSender.deviceLabel && (
                                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-black/25 text-emerald-100 border border-white/15 shrink-0 max-w-[140px] truncate shadow-2xs">
                                      {outgoingSender.deviceLabel}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Service Workflow Option Bar above message template on green chat */}
                              {isTemplateMessage && (
                                <div className="mb-2.5 pb-2 border-b border-emerald-400/25">
                                  <div className="flex items-center justify-between gap-2">
                                    {/* Workflow Badge & Inspector Trigger */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsWorkflowModalOpen(true);
                                      }}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-400/30 text-emerald-100 hover:text-white transition-all cursor-pointer text-left group min-w-0 shadow-2xs"
                                      title="Click to inspect active workflow triggers, simulation & settings"
                                    >
                                      <Zap
                                        className={`w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0 group-hover:scale-110 transition-transform ${
                                          messageWorkflowName === 'Paused' ? 'opacity-50' : 'animate-pulse'
                                        }`}
                                      />
                                      <span className="text-[10px] text-emerald-200/90 font-medium">Flow:</span>
                                      <span className="text-[11px] font-bold text-white truncate max-w-[120px] sm:max-w-[170px]">
                                        {messageWorkflowName}
                                      </span>
                                      {messageWorkflowName === 'Paused' && (
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 border border-amber-400/30">
                                          Paused
                                        </span>
                                      )}
                                      <ExternalLink className="w-2.5 h-2.5 text-emerald-300/70 group-hover:text-white shrink-0 ml-0.5" />
                                    </button>

                                    {/* Action Buttons: Edit Flow & Badges */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isQuotation && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTab('finance-quotations');
                                          }}
                                          className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-400/25 text-[9px] font-semibold cursor-pointer transition-colors"
                                          title="View and manage quotations in Finance"
                                        >
                                          <FileText className="w-2.5 h-2.5" />
                                          <span>Quotation</span>
                                        </button>
                                      )}
                                      {isBot && !isQuotation && (
                                        <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-400/25 text-[9px] font-semibold">
                                          <Bot className="w-2.5 h-2.5" />
                                          <span>Bot AI</span>
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenWorkflowBuilder(messageWorkflowName);
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-900 active:scale-95 font-bold text-[10px] shadow-xs transition-all cursor-pointer"
                                        title="Open in Visual Workflow Builder to edit steps, triggers & node logic"
                                      >
                                        <Edit3 className="w-3 h-3 text-emerald-700" />
                                        <span>Edit Flow</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {isBot && !isTemplateMessage && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-200 mb-1">
                                  <Bot className="w-3 h-3" />
                                  <span>Qiyam AI Assistant</span>
                                </div>
                              )}
                              {(() => {
                                const isVoice = Boolean(
                                  msg.isVoiceNote ||
                                  msg.richCard?.type === 'voice_note' ||
                                  msg.audioUrl ||
                                  msg.text?.includes('Voice Note') ||
                                  msg.text?.includes('Voice note') ||
                                  msg.text?.includes('🎙️')
                                );

                                if (isVoice) {
                                  let durationVal = msg.audioDuration || (msg.richCard as any)?.duration;
                                  if (!durationVal && msg.text) {
                                    const match = msg.text.match(/\((\d+)\s*s(?:\s+audio)?\)/i);
                                    if (match) durationVal = parseInt(match[1], 10);
                                  }
                                  const resolvedDuration = durationVal || 4;

                                  return (
                                    <div className="py-0.5">
                                      <VoiceNotePlayer
                                        audioUrl={msg.audioUrl || (msg.richCard as any)?.audioUrl}
                                        duration={resolvedDuration}
                                        waveform={msg.waveform || (msg.richCard as any)?.waveform}
                                        isOutgoing={!isCustomer}
                                        senderAvatar={isCustomer ? currentConv?.avatar : undefined}
                                        senderName={isCustomer ? currentConv?.contact_name : (msg.senderName || 'You')}
                                      />
                                    </div>
                                  );
                                }

                                return <div className="whitespace-pre-wrap break-words">{msg.text}</div>;
                              })()}

                              {/* Rich Confirmation Card */}
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
                                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-center text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
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
                                title={tooltipStr}
                              >
                                <span>{msg.timestamp}</span>
                                {!isCustomer && (
                                  isRead ? (
                                    <span
                                      title="Read by recipient on WhatsApp (Double blue tick)"
                                      className="inline-flex items-center text-[#53bdeb] ml-0.5"
                                    >
                                      <CheckCheck className="w-3.5 h-3.5 stroke-[2.4]" />
                                    </span>
                                  ) : isDelivered ? (
                                    <button
                                      type="button"
                                      title="Delivered to recipient phone (Mobile data/WiFi ON). Click to mark as read (Double blue tick)"
                                      className="inline-flex items-center text-slate-300 hover:text-[#53bdeb] ml-0.5 transition-colors cursor-pointer"
                                      onClick={() => {
                                        useQiyamStore.getState().applyMessageStatus(currentConv.id, msg.id, 'read');
                                        apiClient.post(`/conversations/threads/${currentConv.id}/mark_read/`, {}).catch(() => {});
                                      }}
                                    >
                                      <CheckCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                                    </button>
                                  ) : (
                                    <span title="Sent to WhatsApp (Recipient mobile data is OFF or message in transit)" className="inline-flex items-center text-slate-300 ml-0.5">
                                      <Check className="w-3.5 h-3.5 stroke-[2.2]" />
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            {/* WhatsApp-style Emoji Reaction Bubbles */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className={`flex gap-1 mt-0.5 ${isCustomer ? 'justify-start pl-1' : 'justify-end pr-1'}`}>
                                {Object.entries(
                                  msg.reactions.reduce((acc, r) => {
                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>)
                                ).map(([emoji, count]) => (
                                  <span
                                    key={emoji}
                                    className="inline-flex items-center gap-0.5 bg-white border border-slate-200 shadow-sm rounded-full px-1.5 py-0.5 text-sm leading-none select-none"
                                    title={`${count} reaction${count > 1 ? 's' : ''}`}
                                  >
                                    <span>{emoji}</span>
                                    {count > 1 && <span className="text-[10px] font-semibold text-slate-500">{count}</span>}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}

                {/* Real-time WhatsApp Client Typing Bubble (Official 3-Dot Wave Animation) */}
                {typingUsers[currentConv.id] && (
                  <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-bottom-1 duration-150">
                    <div className="relative bg-white text-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs border border-slate-200/80 flex items-center">
                      <div className="flex items-center gap-1.5 h-3.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '180ms', animationDuration: '1s' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '360ms', animationDuration: '1s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Floating "Jump to Latest Chat" Downward Arrow Button (WhatsApp Web Style) */}
              {isScrolledUp && (
                <div className="absolute bottom-4 right-5 sm:right-6 z-30 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={handleLoadLatestChat}
                    disabled={isRefreshingLatest}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-600 hover:text-emerald-600 border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    title="Load latest chat"
                    aria-label="Load latest chat"
                  >
                    {isRefreshingLatest ? (
                      <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                    ) : (
                      <ChevronDown className="w-5 h-5 stroke-[2.5] transition-transform group-hover:translate-y-0.5" />
                    )}

                    {/* Unread / New Incoming Messages Count Badge */}
                    {unreadBelowCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md border-2 border-white animate-pulse">
                        {unreadBelowCount > 99 ? '99+' : unreadBelowCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

              {/* Quick Action Chips Bar */}
              <div
                data-draggable-scroll="true"
                className="px-5 py-2 bg-white border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto scrollbar-hide scrollbar-none no-scrollbar text-xs"
              >
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick Actions:</span>
                <button
                  onClick={() => {
                    if (currentSuppression) {
                      addToast(
                        `Broadcast templates are restricted for ${currentSuppression.label.toLowerCase()} contacts. Re-subscribe with consent first.`,
                        'warning'
                      );
                      return;
                    }
                    setIsTemplateModalOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-full border font-bold whitespace-nowrap text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                    currentSuppression
                      ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-700'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                  }`}
                  title={currentSuppression ? `Promotional templates restricted: ${currentSuppression.label}` : 'Use WhatsApp Template'}
                >
                  {currentSuppression ? (
                    <Ban className="w-3 h-3 text-rose-600" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{currentSuppression ? `Template Restricted (${currentSuppression.label})` : 'Use WhatsApp Template'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Create Lead')}
                  className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-purple-50 border border-slate-200 text-purple-700 font-medium whitespace-nowrap text-[11px] cursor-pointer"
                >
                  + Create Lead
                </button>
                <button
                  onClick={() => handleQuickAction('Send Quotation')}
                  className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-emerald-700 font-medium whitespace-nowrap text-[11px] cursor-pointer"
                >
                  📄 Send Quotation
                </button>
                <button
                  onClick={() => handleQuickAction('Create Appointment')}
                  className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 text-blue-700 font-medium whitespace-nowrap text-[11px] cursor-pointer"
                >
                  📅 Create Appointment
                </button>
                <button
                  onClick={() => handleQuickAction('Convert to Deal')}
                  className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-amber-50 border border-slate-200 text-amber-700 font-medium whitespace-nowrap text-[11px] cursor-pointer"
                >
                  💼 Convert to Deal
                </button>
                <button
                  onClick={() => handleQuickAction('Mark as Resolved')}
                  className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-medium whitespace-nowrap text-[11px] cursor-pointer"
                >
                  ✓ Mark Resolved
                </button>
              </div>

              {/* Active Outbound WhatsApp Business Line Strip & Multi-Employee Device Switcher */}
              <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50 border-t border-emerald-100/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-bold text-slate-800 shrink-0">Sending via:</span>

                  {/* Line Selector Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsLineSelectorOpen(!isLineSelectorOpen)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-emerald-300 rounded-lg text-slate-900 font-semibold text-xs shadow-2xs transition-all cursor-pointer"
                      title="Select which WhatsApp line to send customer replies from"
                    >
                      {activeSenderDeviceId === 'meta_cloud' ? (
                        <>
                          <span className="text-emerald-700 font-bold">🏢 Meta Cloud API</span>
                          <span className="font-mono text-slate-600">({metaConfig?.business_phone_display || '+91 94963 00233'})</span>
                        </>
                      ) : (
                        (() => {
                          const dev = linkedDevices.find((d) => String(d.id) === String(activeSenderDeviceId));
                          return (
                            <>
                              <span className="text-teal-700 font-bold">📱 {dev?.device_label || 'Employee WhatsApp'}</span>
                              <span className="font-mono text-slate-600">({dev?.phone_number || ''})</span>
                            </>
                          );
                        })()
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLineSelectorOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Popover Dropdown */}
                    {isLineSelectorOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsLineSelectorOpen(false)} />
                        <div className="absolute left-0 bottom-full mb-1.5 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Outbound Channel</span>
                            <span className="text-[10px] text-emerald-600 font-bold">{linkedDevices.length + 1} Lines Active</span>
                          </div>

                          <div className="py-1 space-y-1 max-h-56 overflow-y-auto">
                            {/* Meta Cloud API Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSenderDeviceId('meta_cloud');
                                setIsLineSelectorOpen(false);
                                addToast('Outbound line: Official Meta Cloud API', 'info');
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                                activeSenderDeviceId === 'meta_cloud' ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                                🏢
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span className="truncate">Meta Cloud API (Official)</span>
                                  {activeSenderDeviceId === 'meta_cloud' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">{metaConfig?.business_phone_display || '+91 94963 00233'}</div>
                                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Template broadcasts &amp; Verified line</div>
                              </div>
                            </button>

                            {/* Linked Employee Devices */}
                            {linkedDevices.map((dev) => {
                              const isSelected = String(activeSenderDeviceId) === String(dev.id);
                              return (
                                <div
                                  key={dev.id}
                                  className={`group relative w-full text-left p-2 rounded-xl text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                                    isSelected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50 border border-transparent'
                                  }`}
                                  onClick={() => {
                                    setActiveSenderDeviceId(dev.id);
                                    setIsLineSelectorOpen(false);
                                    addToast(`Outbound line: ${dev.device_label} (${dev.phone_number})`, 'success');
                                  }}
                                >
                                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <Smartphone className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0 pr-14">
                                    <div className="flex items-center justify-between font-bold text-slate-900">
                                      <span className="truncate">{dev.device_label}</span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-1" />}
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-500 truncate">
                                      {dev.phone_number} {dev.employee_name && dev.employee_name !== dev.device_label ? `• ${dev.employee_name}` : ''}
                                    </div>
                                    <div className="text-[10px] text-teal-600 font-semibold mt-0.5 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      <span className="truncate">{dev.employee_name ? `${dev.employee_name}'s Line` : 'Employee Connected Line'}</span>
                                    </div>
                                  </div>

                                  {/* Edit and Unlink action buttons */}
                                  <div className="absolute right-2 top-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingDevice(dev);
                                        setIsLineSelectorOpen(false);
                                      }}
                                      className="p-1 rounded-md bg-white hover:bg-teal-50 text-slate-400 hover:text-teal-700 border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-all cursor-pointer"
                                      title="Edit line name or employee name"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsLineSelectorOpen(false);
                                        requestGeneralConfirmation({
                                          title: 'Disconnect & Unlink Phone Line?',
                                          message: `Are you sure you want to disconnect and unlink this WhatsApp phone line?`,
                                          description: 'This will log out the session on the mobile phone and remove this line from active outbound channels.',
                                          variant: 'danger',
                                          icon: 'unlink',
                                          confirmLabel: 'Disconnect & Unlink',
                                          cancelLabel: 'Keep Connected',
                                          itemBadge: {
                                            label: dev.device_label || 'WhatsApp Line',
                                            sublabel: `${dev.phone_number || ''}${dev.employee_name ? ` • ${dev.employee_name}` : ''}`,
                                            badgeText: 'Will Unlink',
                                          },
                                          onConfirm: async () => {
                                            await unlinkEmployeeDevice(dev.id);
                                          },
                                        });
                                      }}
                                      className="p-1 rounded-md bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 shadow-2xs hover:border-rose-300 transition-all cursor-pointer"
                                      title="Unlink this phone line"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Link New Device Footer */}
                          <div className="pt-1.5 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setIsLineSelectorOpen(false);
                                setIsLinkDeviceModalOpen(true);
                              }}
                              className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                              <span>+ Connect Another Employee Phone</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsLinkDeviceModalOpen(true)}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    title="Scan QR code to link an employee WhatsApp phone"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link New Phone</span>
                  </button>
                </div>
              </div>

              {/* Caution strip when suppressed */}
              {currentSuppression && (
                <div className="px-4 py-1.5 bg-amber-50/90 border-t border-amber-200 flex items-center justify-between text-[11px] text-amber-900">
                  <div className="flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Compliance Notice:</strong> This contact is <strong>{currentSuppression.label}</strong>. Only respond to direct customer-initiated service queries.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentConv) {
                        removeSuppressionRecord(currentConv.phone_number);
                      }
                    }}
                    className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 ml-2 cursor-pointer"
                  >
                    Re-subscribe Contact
                  </button>
                </div>
              )}

              {/* Chat Input Box */}
              <form onSubmit={handleSend} className="bg-white p-2.5 sm:p-3 border-t border-slate-200 flex items-center gap-1.5 sm:gap-2 relative">
                {/* Hidden File Input for Paperclip */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Emoji Picker Popover */}
                {isEmojiPickerOpen && (
                  <div className="absolute bottom-full left-4 mb-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 w-72 sm:w-80">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
                      <span>Quick Emojis</span>
                      <button
                        type="button"
                        onClick={() => setIsEmojiPickerOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-8 gap-1 text-lg">
                      {POPULAR_EMOJIS.map((emoji, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleEmojiSelect(emoji)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template picker button */}
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  title="Pick WhatsApp Template"
                  className="p-1.5 sm:p-2 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all font-bold shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                </button>

                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                  title="Insert Emoji"
                  className={`hidden sm:flex p-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                    isEmojiPickerOpen ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Attachment paperclip button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach File / Document"
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Active Voice Recording UI vs Text Input */}
                {isRecordingVoice ? (
                  <div className="flex-1 flex items-center justify-between px-3 sm:px-4 py-2 bg-rose-50/90 border border-rose-200 rounded-xl text-xs">
                    {/* Pulsing red dot + Recording timer */}
                    <div className="flex items-center gap-2 font-mono font-bold text-rose-600 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                      <span>{Math.floor(recordSeconds / 60)}:{(recordSeconds % 60).toString().padStart(2, '0')}</span>
                    </div>

                    {/* Live Equalizer Waveform animation */}
                    <div className="flex items-center gap-1 px-3 h-6 flex-1 justify-center max-w-[200px]">
                      {[40, 75, 95, 30, 85, 60, 100, 45, 90, 35, 75, 55, 80, 65, 90].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            height: `${Math.max(20, (h * ((recordSeconds % 3) + 1)) % 100)}%`,
                            transition: 'height 150ms ease-in-out',
                          }}
                          className="w-[2.5px] bg-rose-500 rounded-full"
                        />
                      ))}
                    </div>

                    {/* Trash / Cancel & Send Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCancelVoiceRecording}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        title="Discard recording"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Type a message or use WhatsApp template..."
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                )}

                {/* Mic button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceRecording}
                  title={isRecordingVoice ? 'Stop & Send Voice Note' : 'Record Voice Note'}
                  className={`hidden sm:flex p-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                    isRecordingVoice ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() && !isRecordingVoice}
                  onClick={(e) => {
                    if (isRecordingVoice) {
                      e.preventDefault();
                      handleSendVoiceRecording();
                    }
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 transition-all active:scale-95 shrink-0 cursor-pointer"
                  title={isRecordingVoice ? 'Send Voice Note' : 'Send Message'}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Pane 3: Customer 360 & Lead Details Drawer (Desktop xl:flex) */}
        <div className="hidden xl:flex w-80 bg-white border-l border-slate-200 flex-col shrink-0 overflow-y-auto p-5 space-y-5 text-xs">
          {renderCustomerProfile()}
        </div>
      </div>

      {/* Mobile/Tablet Customer 360 Slide-over Drawer */}
      {isCustomerDetailsOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 xl:hidden transition-opacity"
            onClick={() => setIsCustomerDetailsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-88 max-w-[90vw] bg-white shadow-2xl flex flex-col xl:hidden animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Customer 360 Profile</h3>
              <button
                onClick={() => setIsCustomerDetailsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {renderCustomerProfile()}
            </div>
          </div>
        </>
      )}

      {/* WhatsApp Template Picker & Sender Modal */}
      {currentConv && (
        <SendTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          templates={templates}
          currentConversation={currentConv}
          onSendTemplate={(tmplId, vars) => {
            sendTemplateMessage(currentConv.id, tmplId, vars);
          }}
        />
      )}

      {/* WhatsApp Profile Picture (DP) Modal */}
      {currentConv && (
        <CustomerAvatarModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          conversation={currentConv}
        />
      )}

      {/* Delete Conversation Confirmation Modal with Warning */}
      <DeleteConversationModal
        isOpen={Boolean(conversationToDelete)}
        onClose={() => setConversationToDelete(null)}
        conversation={conversationToDelete}
        onConfirmDelete={async (id) => {
          await deleteConversation(id);
          if (currentConv && String(currentConv.id) === String(id)) {
            setIsMobileChatOpen(false);
            setIsCustomerDetailsOpen(false);
          }
        }}
      />

      {/* Manual Opt-Out Confirmation & Warning Modal (Protects against accidental taps) */}
      {currentConv && (
        <ManualOptOutModal
          isOpen={isManualOptOutModalOpen}
          onClose={() => setIsManualOptOutModalOpen(false)}
          conversation={currentConv}
          onConfirmOptOut={(reason, notes) => {
            const fullReason = notes ? `${reason} (${notes})` : reason;
            addSuppressionRecord({
              id: `supp-manual-${Date.now()}`,
              name: currentConv.contact_name,
              phone: currentConv.phone_number,
              type: 'opt_out_stop',
              reason: fullReason,
              notes: notes || undefined,
              date: new Date().toLocaleDateString('en-GB'),
              timestamp: Date.now(),
              status: 'Suppressed',
              source: 'Operator Customer 360 (Manual Enforcement)',
              canResubscribe: true,
            });
            addToast(`Compliance enforced: ${currentConv.contact_name} marked as Opted Out.`, 'warning');
          }}
        />
      )}

      {/* Active Workflow Inspector & Controller Modal */}
      {currentConv && (
        <ChatWorkflowModal
          isOpen={isWorkflowModalOpen}
          onClose={() => setIsWorkflowModalOpen(false)}
          conversation={currentConv}
          onOpenWorkflowBuilder={handleOpenWorkflowBuilder}
        />
      )}

      {/* Link Employee WhatsApp QR Code Scanner Modal */}
      <LinkEmployeeWhatsAppModal
        isOpen={isLinkDeviceModalOpen}
        onClose={() => setIsLinkDeviceModalOpen(false)}
      />

      {/* Linked Employee Devices Details Modal */}
      <LinkedDevicesDetailsModal
        isOpen={isDevicesDetailsModalOpen}
        onClose={() => setIsDevicesDetailsModalOpen(false)}
        onOpenLinkModal={() => {
          setIsDevicesDetailsModalOpen(false);
          setIsLinkDeviceModalOpen(true);
        }}
        onEditDevice={(device) => {
          setEditingDevice(device);
        }}
      />

      {/* Edit Linked Employee Device Modal */}
      <EditEmployeeDeviceModal
        isOpen={!!editingDevice}
        device={editingDevice}
        onClose={() => setEditingDevice(null)}
      />

      {/* Quick Add Staff Modal */}
      {isQuickAddStaffOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Onboard New Staff Member</h3>
                  <p className="text-[11px] text-slate-500">Add to roster &amp; enable WhatsApp task notifications</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickAddStaffOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleQuickAddStaffSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quickStaffForm.name}
                  onChange={(e) => setQuickStaffForm({ ...quickStaffForm, name: e.target.value })}
                  placeholder="e.g. Fatima Zahra, Rahul Verma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={quickStaffForm.role}
                    onChange={(e) => setQuickStaffForm({ ...quickStaffForm, role: e.target.value })}
                    placeholder="e.g. Support Specialist"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={quickStaffForm.department}
                    onChange={(e) => setQuickStaffForm({ ...quickStaffForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Support & Sales">Support &amp; Sales</option>
                    <option value="AC Services">AC Services</option>
                    <option value="Field Operations">Field Operations</option>
                    <option value="Customer Success">Customer Success</option>
                    <option value="Finance & Billing">Finance &amp; Billing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quickStaffForm.phone}
                  onChange={(e) => setQuickStaffForm({ ...quickStaffForm, phone: e.target.value })}
                  placeholder="+91 94963 00233"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>📱</span>
                  <span>Real WhatsApp task alerts and conversation updates will be sent to this number.</span>
                </p>
              </div>

              {currentConv && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickStaffForm.autoAssign}
                      onChange={(e) => setQuickStaffForm({ ...quickStaffForm, autoAssign: e.target.checked })}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-900 block">
                        Assign this conversation immediately
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Assign <strong>{currentConv.contact_name}</strong> to this new staff member and dispatch a real WhatsApp alert.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddStaffOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuickStaff}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingQuickStaff ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{quickStaffForm.autoAssign && currentConv ? 'Create & Assign Staff' : 'Create Staff Member'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




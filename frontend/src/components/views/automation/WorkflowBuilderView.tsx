import React, { useState, useRef, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  GitBranch, List, Plus, Play, Save, RotateCcw, RotateCw,
  ZoomIn, ZoomOut, Maximize2, Trash2, Edit3, X, Check,
  MessageSquare, FileText, Image, Video, Music, MapPin,
  HelpCircle, CreditCard, Layers, Bot, Zap, Smartphone,
  CheckCircle2, Clock, Calendar, Paperclip, ChevronRight,
  ExternalLink, Sparkles, AlertCircle, ArrowRight, CornerDownRight,
  Move, Sliders, DollarSign, RefreshCw, Eye, BookOpen, Info,
  ShieldCheck, ShoppingCart, Send, Compass
} from 'lucide-react';

// Types for Flow Canvas
export interface GroupChoiceOption {
  label: string;
  targetGroup?: string;
}

export interface GroupItem {
  id: string;
  type: 'message' | 'choice' | 'collect' | 'jump' | 'payment';
  content?: string;
  question?: string;
  options?: GroupChoiceOption[];
  varName?: string;
  targetGroup?: string;
  // Payment element fields matching screenshot
  provider?: 'STRIPE' | 'RAZORPAY' | 'PAYPAL' | 'UPI';
  currency?: string;
  amount?: number;
  quantity?: number;
  successTarget?: string;
  failedTarget?: string;
  footer?: string;
  buttonLabel?: string;
}

export interface FlowGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  items: GroupItem[];
}

// Types for Keyword Rules
export interface KeywordRule {
  id: string;
  title: string;
  triggered_count: number;
  active: boolean;
  keywords: string[];
  reply: string;
  attachment?: string;
}

export interface DaySchedule {
  day: string;
  time: string;
  enabled: boolean;
}

export const WorkflowBuilderView: React.FC = () => {
  const {
    addToast,
    setActiveTab,
    saveWorkflow,
    activeWorkflowId,
    activeWorkflowTitle,
    activeWorkflowGroups,
  } = useQiyamStore();

  // Top Mode Switcher: 'canvas' | 'keyword_rules'
  const [activeMode, setActiveMode] = useState<'canvas' | 'keyword_rules'>('canvas');

  // Subheader Toggles
  const [staticVariables, setStaticVariables] = useState(true);
  const [globalVariables, setGlobalVariables] = useState(false);
  const [autosave, setAutosave] = useState(true);

  // Zoom Level
  const [zoom, setZoom] = useState(1);

  // Bot Title
  const [botTitle, setBotTitle] = useState('Chatbot 1');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Canvas Scrolling & Panning State (Grab & Pan anywhere)
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  // Dragging State for Canvas Cards
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Configure Element Modal State (Matching screenshots media_1789380608034.png & media_1789380618719.png)
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    groupId: string;
    itemId: string;
    draftItem: GroupItem;
    groupTitle: string;
  } | null>(null);

  // Create Workflow / Template Tutorial Modal State
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Interactive Tutorial Banner / HUD State
  const [showTutorialHud, setShowTutorialHud] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(1);

  // Test Bot Modal State
  const [isTestBotOpen, setIsTestBotOpen] = useState(false);
  const [testMessages, setTestMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; options?: string[]; isPayment?: boolean }>>([
    {
      sender: 'bot',
      text: 'Hi Rahul! Greetings from ARC Admissions. Our smart chatbot will guide you through the process.',
    },
    {
      sender: 'bot',
      text: 'Is Rahul your correct name?',
      options: ['Yes', 'No', 'Default'],
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');
  const [currentStep, setCurrentStep] = useState<string>('group-1');

  // Create New Rule Modal
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    title: '',
    keywords: '',
    reply: '',
    attachment: '',
  });

  // Inline Add Keyword state
  const [activeKeywordInputRuleId, setActiveKeywordInputRuleId] = useState<string | null>(null);
  const [inlineKeywordText, setInlineKeywordText] = useState('');

  // Initial Flow Groups (Exact structure from Screenshot 1 & 2)
  const [groups, setGroups] = useState<FlowGroup[]>([
    {
      id: 'group-1',
      title: 'Group #1',
      x: 40,
      y: 40,
      items: [
        {
          id: 'item-1-1',
          type: 'message',
          content: 'Hi {STAT_NAME}! Greetings from ARC LLC. Our smart counselor will guide you through the process.'
        },
        {
          id: 'item-1-2',
          type: 'choice',
          question: 'Is {STAT_NAME} your correct name?',
          options: [
            { label: 'Yes', targetGroup: 'group-3' },
            { label: 'No', targetGroup: 'group-2' },
            { label: 'Default', targetGroup: 'group-4' }
          ]
        }
      ]
    },
    {
      id: 'group-2',
      title: 'Group #2',
      x: 400,
      y: 40,
      items: [
        { id: 'item-2-1', type: 'message', content: 'What is your good name ?' },
        { id: 'item-2-2', type: 'collect', varName: 'name' },
        { id: 'item-2-3', type: 'message', content: 'Okay {name}! What is your age ?' },
        { id: 'item-2-4', type: 'collect', varName: 'Age' },
        { id: 'item-2-5', type: 'message', content: 'Please enter your email address' },
        { id: 'item-2-6', type: 'collect', varName: 'mail' }
      ]
    },
    {
      id: 'group-3',
      title: 'Group #3',
      x: 760,
      y: 40,
      items: [
        {
          id: 'item-3-1',
          type: 'choice',
          question: 'What is the purpose of your travel ?',
          options: [
            { label: 'Study abroad', targetGroup: 'group-7' },
            { label: 'Work abroad', targetGroup: 'group-6' },
            { label: 'Migrate', targetGroup: 'group-5' },
            { label: 'Default', targetGroup: 'group-4' }
          ]
        }
      ]
    },
    {
      id: 'group-4',
      title: 'Group #4',
      x: 760,
      y: 420,
      items: [
        { id: 'item-4-1', type: 'message', content: 'Please select 1 from the options provided.' },
        { id: 'item-4-2', type: 'jump', targetGroup: 'group-3' }
      ]
    },
    {
      id: 'group-5',
      title: 'Group #5',
      x: 1120,
      y: 420,
      items: [
        {
          id: 'item-5-1',
          type: 'choice',
          question: 'Hello To which country ?',
          options: [
            { label: 'Canada' },
            { label: 'UK' },
            { label: 'Australia' },
            { label: 'Germany' },
            { label: 'USA' }
          ]
        }
      ]
    },
    {
      id: 'group-6',
      title: 'Group #6',
      x: 1120,
      y: 40,
      items: [
        {
          id: 'item-6-1',
          type: 'choice',
          question: 'What is your current education qualification?',
          options: [
            { label: 'Plus-two' },
            { label: 'UG' },
            { label: 'PG' },
            { label: 'Default' }
          ]
        }
      ]
    },
    {
      id: 'group-7',
      title: 'Group #7',
      x: 1480,
      y: 40,
      items: [
        {
          id: 'item-7-1',
          type: 'choice',
          question: 'Field of study',
          content: 'Select preferred field from the following list.',
          footer: 'Admissions Desk',
          buttonLabel: 'Select Course',
          varName: 'field_of_study',
          options: [
            { label: 'Computer Science', targetGroup: 'group-8' },
            { label: 'Business Studies', targetGroup: 'group-8' },
            { label: 'Medical Studies', targetGroup: 'group-8' },
            { label: 'Law & Order', targetGroup: 'group-8' },
            { label: 'Humanities', targetGroup: 'group-8' },
            { label: 'Art', targetGroup: 'group-8' }
          ]
        }
      ]
    },
    {
      id: 'group-8',
      title: 'Group #8',
      x: 1840,
      y: 40,
      items: [
        {
          id: 'item-8-1',
          type: 'payment',
          content: 'University Application Fee Checkout',
          provider: 'STRIPE',
          currency: 'USD',
          amount: 49,
          quantity: 1,
          varName: 'payment_status',
          successTarget: 'group-9',
          failedTarget: 'group-10'
        }
      ]
    },
    {
      id: 'group-9',
      title: 'Group #9',
      x: 2200,
      y: 40,
      items: [
        {
          id: 'item-9-1',
          type: 'message',
          content: '🎉 Payment of $49 confirmed via Stripe! Your application ID is #UQ-2026. A counselor will review your application.'
        }
      ]
    },
    {
      id: 'group-10',
      title: 'Group #10',
      x: 2200,
      y: 300,
      items: [
        {
          id: 'item-10-1',
          type: 'message',
          content: '⚠️ Payment was not completed or was cancelled. Please try again to reserve your slot.'
        },
        {
          id: 'item-10-2',
          type: 'jump',
          targetGroup: 'group-8'
        }
      ]
    }
  ]);

  // Load selected workflow from store if available
  useEffect(() => {
    if (activeWorkflowTitle) {
      setBotTitle(activeWorkflowTitle);
    }
    if (activeWorkflowGroups && Array.isArray(activeWorkflowGroups) && activeWorkflowGroups.length > 0) {
      setGroups(activeWorkflowGroups);
    }
  }, [activeWorkflowTitle, activeWorkflowGroups]);

  // Initial Keyword Rules
  const [keywordRules, setKeywordRules] = useState<KeywordRule[]>([
    {
      id: 'rule-1',
      title: 'Price List Auto-Reply',
      triggered_count: 0,
      active: true,
      keywords: ['price', 'catalog', 'rate'],
      reply: 'Hello! Here is our latest wholesale rate card catalog PDF.',
      attachment: 'Rate-Card-Catalog.pdf'
    },
    {
      id: 'rule-2',
      title: 'Claim ₹500 Discount Auto-Responder',
      triggered_count: 1,
      active: true,
      keywords: ['claim ₹500 discount', 'discount', 'claim 500', 'festival offer'],
      reply: '🎉 *Congratulations!* Your ₹500 discount code is: *FEST500*\n\nApply this code on your next purchase to get flat ₹500 OFF instantly!\n\n🌐 Visit Store: https://qiyam.ventures'
    },
    {
      id: 'rule-3',
      title: 'Emergency AC Service Dispatch',
      triggered_count: 24,
      active: true,
      keywords: ['ac breakdown', 'emergency', 'leakage', 'gas refill'],
      reply: 'We have received your emergency request! 🛠️ A certified technician has been notified and will call you within 5 minutes.'
    },
    {
      id: 'rule-4',
      title: 'Human Support Representative',
      triggered_count: 18,
      active: true,
      keywords: ['talk to human', 'agent', 'support', 'customer executive'],
      reply: 'Connecting you to our senior support desk. Our field coordinator will reply to you within 3 minutes! 📞'
    }
  ]);

  // Working Hours
  const [workingHours, setWorkingHours] = useState<DaySchedule[]>([
    { day: 'Monday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Tuesday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Wednesday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Thursday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Friday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Saturday', time: '10:00 AM – 8:00 PM', enabled: true },
    { day: 'Sunday', time: 'Closed', enabled: false },
  ]);

  // =========================================================================
  // CANVAS PAN & CARD DRAGGING ENGINE (Seamless 360-degree Grab & Pan)
  // =========================================================================
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // If clicked inside an interactive card, button, input, or toolbar, don't initiate canvas pan
    if ((e.target as HTMLElement).closest('.group-card, button, input, textarea, select, .no-pan')) return;

    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    if (canvasRef.current) {
      setScrollStart({
        left: canvasRef.current.scrollLeft,
        top: canvasRef.current.scrollTop,
      });
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerDownGroup = (e: React.PointerEvent, groupId: string) => {
    // If clicked inside an interactive button or element, don't initiate drag
    if ((e.target as HTMLElement).closest('button, input, textarea, select')) return;

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    setDraggedGroupId(groupId);
    setDragOffset({
      x: e.clientX / zoom - group.x,
      y: e.clientY / zoom - group.y,
    });

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    // 1. If currently dragging a group card
    if (draggedGroupId) {
      // Edge auto-pan: when dragging card close to edges, scroll canvas smoothly
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const edgeThreshold = 80;
        const scrollSpeed = 16;

        if (e.clientX > rect.right - edgeThreshold) {
          canvasRef.current.scrollLeft += scrollSpeed;
        } else if (e.clientX < rect.left + edgeThreshold) {
          canvasRef.current.scrollLeft -= scrollSpeed;
        }

        if (e.clientY > rect.bottom - edgeThreshold) {
          canvasRef.current.scrollTop += scrollSpeed;
        } else if (e.clientY < rect.top + edgeThreshold) {
          canvasRef.current.scrollTop -= scrollSpeed;
        }
      }

      const newX = Math.max(10, Math.round(e.clientX / zoom - dragOffset.x));
      const newY = Math.max(10, Math.round(e.clientY / zoom - dragOffset.y));

      setGroups((prev) =>
        prev.map((g) => (g.id === draggedGroupId ? { ...g, x: newX, y: newY } : g))
      );
      return;
    }

    // 2. If panning canvas (click & drag background)
    if (isPanning && canvasRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      canvasRef.current.scrollLeft = scrollStart.left - dx;
      canvasRef.current.scrollTop = scrollStart.top - dy;
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (draggedGroupId) {
      setDraggedGroupId(null);
    }
  };

  // Fit View: Scales and centers all nodes on screen
  const handleFitView = () => {
    if (!canvasRef.current || groups.length === 0) return;
    const minX = Math.min(...groups.map((g) => g.x));
    const maxX = Math.max(...groups.map((g) => g.x + 320));
    const minY = Math.min(...groups.map((g) => g.y));
    const maxY = Math.max(...groups.map((g) => g.y + 450));

    const containerWidth = canvasRef.current.clientWidth;
    const containerHeight = canvasRef.current.clientHeight;

    const contentWidth = maxX - minX + 120;
    const contentHeight = maxY - minY + 120;

    const fitZoom = Math.min(Math.max(Math.min(containerWidth / contentWidth, containerHeight / contentHeight), 0.45), 1);
    setZoom(Number(fitZoom.toFixed(2)));

    canvasRef.current.scrollTo({
      left: Math.max(0, minX * fitZoom - 50),
      top: Math.max(0, minY * fitZoom - 50),
      behavior: 'smooth',
    });
    addToast('Fitted all nodes to view', 'info');
  };

  // Smooth jump to specific group
  const handleJumpToGroup = (grp: FlowGroup) => {
    if (!canvasRef.current) return;
    canvasRef.current.scrollTo({
      left: Math.max(0, grp.x * zoom - 80),
      top: Math.max(0, grp.y * zoom - 60),
      behavior: 'smooth',
    });
  };

  // =========================================================================
  // WORKFLOW PERSISTENCE (Saves directly to database and Workflows list)
  // =========================================================================
  const handleSaveWorkflowToStore = async () => {
    await saveWorkflow({
      id: activeWorkflowId || undefined,
      name: botTitle,
      description: `Interactive WhatsApp bot flow with ${groups.length} node groups and configured elements.`,
      trigger_type: 'New WhatsApp Message',
      nodes: groups,
      edges: [],
    });
  };

  // Add Group to Canvas
  const handleAddGroup = () => {
    const nextIdx = groups.length + 1;
    const newGrp: FlowGroup = {
      id: `group-${Date.now()}`,
      title: `Group #${nextIdx}`,
      x: 60 + (groups.length % 5) * 360,
      y: 120 + Math.floor(groups.length / 5) * 380,
      items: [
        {
          id: `item-${Date.now()}`,
          type: 'message',
          content: `New message block in Group #${nextIdx}.`
        }
      ]
    };
    setGroups([...groups, newGrp]);
    addToast(`Added Group #${nextIdx} to canvas`, 'success');
  };

  // Add block to Group from Library
  const handleAddBlockToGroup = (blockTitle: string, category: string) => {
    if (groups.length === 0) {
      handleAddGroup();
      return;
    }
    const targetGroup = groups[groups.length - 1];
    let newItem: GroupItem;

    if (category === 'PAYMENTS') {
      newItem = {
        id: `item-${Date.now()}`,
        type: 'payment',
        content: `${blockTitle} Checkout`,
        provider: 'STRIPE',
        currency: 'USD',
        amount: 49,
        quantity: 1,
        varName: 'payment_status'
      };
    } else if (category === 'INPUTS') {
      newItem = {
        id: `item-${Date.now()}`,
        type: 'collect',
        varName: blockTitle.toLowerCase().replace(/\s+/g, '_')
      };
    } else if (category === 'CHOICES') {
      newItem = {
        id: `item-${Date.now()}`,
        type: 'choice',
        question: `Select option from ${blockTitle}`,
        options: [{ label: 'Option A' }, { label: 'Option B' }]
      };
    } else {
      newItem = {
        id: `item-${Date.now()}`,
        type: 'message',
        content: `${blockTitle} block content. Tap configure to edit.`
      };
    }

    const updated = groups.map((g) =>
      g.id === targetGroup.id ? { ...g, items: [...g.items, newItem] } : g
    );
    setGroups(updated);
    addToast(`Added "${blockTitle}" block to ${targetGroup.title}`, 'success');
  };

  // Open Configure Element Modal for any item
  const handleOpenConfigModal = (group: FlowGroup, item: GroupItem) => {
    setConfigModal({
      isOpen: true,
      groupId: group.id,
      itemId: item.id,
      draftItem: JSON.parse(JSON.stringify(item)),
      groupTitle: group.title,
    });
  };

  // Save Configured Element
  const handleSaveConfigModal = () => {
    if (!configModal) return;
    const { groupId, itemId, draftItem } = configModal;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((it) => (it.id === itemId ? draftItem : it)),
        };
      })
    );

    setConfigModal(null);
    addToast('Element configuration applied successfully!', 'success');
  };

  // Toggle Keyword Rule Active
  const handleToggleRule = (id: string) => {
    setKeywordRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  // Delete Keyword Rule
  const handleDeleteRule = (id: string) => {
    setKeywordRules((prev) => prev.filter((r) => r.id !== id));
    addToast('Keyword rule removed', 'info');
  };

  // Inline Add Keyword to Rule
  const handleAddKeywordToRule = (ruleId: string) => {
    if (!inlineKeywordText.trim()) return;
    setKeywordRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, keywords: [...r.keywords, inlineKeywordText.trim().toLowerCase()] }
          : r
      )
    );
    setInlineKeywordText('');
    setActiveKeywordInputRuleId(null);
    addToast('Keyword added', 'success');
  };

  // Remove Keyword from Rule
  const handleRemoveKeyword = (ruleId: string, kwToRemove: string) => {
    setKeywordRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, keywords: r.keywords.filter((k) => k !== kwToRemove) }
          : r
      )
    );
  };

  // Create New Rule Submit
  const handleCreateRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.title.trim() || !newRule.keywords.trim()) {
      addToast('Please fill in title and keywords', 'warning');
      return;
    }
    const kwList = newRule.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
    const created: KeywordRule = {
      id: `rule-${Date.now()}`,
      title: newRule.title.trim(),
      triggered_count: 0,
      active: true,
      keywords: kwList,
      reply: newRule.reply.trim() || 'Automated reply from WhatsQ Assistant.',
      attachment: newRule.attachment.trim() || undefined
    };
    setKeywordRules([created, ...keywordRules]);
    setIsNewRuleModalOpen(false);
    setNewRule({ title: '', keywords: '', reply: '', attachment: '' });
    addToast(`Keyword Rule "${created.title}" created`, 'success');
  };

  // Toggle Working Hour day
  const handleToggleDay = (dayName: string) => {
    setWorkingHours((prev) =>
      prev.map((d) => (d.day === dayName ? { ...d, enabled: !d.enabled } : d))
    );
  };

  // Apply Pre-built Template Flow
  const handleLoadTemplate = (templateType: 'university' | 'ac_service' | 'ecommerce' | 'blank') => {
    if (templateType === 'blank') {
      setGroups([
        {
          id: 'group-1',
          title: 'Group #1',
          x: 100,
          y: 100,
          items: [
            {
              id: 'item-1-1',
              type: 'message',
              content: 'Hi! Welcome to our WhatsApp service. How can we help you today?'
            }
          ]
        }
      ]);
      setBotTitle('Custom WhatsApp Bot');
      addToast('Blank canvas ready!', 'info');
    } else if (templateType === 'university') {
      setBotTitle('University Admissions & Stripe Checkout Bot');
      setShowTutorialHud(true);
      setTutorialStep(1);
      addToast('VIP University Admissions flow loaded!', 'success');
    } else if (templateType === 'ac_service') {
      setGroups([
        {
          id: 'group-ac-1',
          title: 'Group #1 - Welcome & Service',
          x: 40,
          y: 60,
          items: [
            {
              id: 'item-ac-1',
              type: 'message',
              content: '❄️ Welcome to CoolBreeze AC Care! What service do you require today?'
            },
            {
              id: 'item-ac-2',
              type: 'choice',
              question: 'Select Service Type:',
              options: [
                { label: 'Deep Jet Cleaning (₹499)', targetGroup: 'group-ac-2' },
                { label: 'Gas Refill & Leakage Fix (₹1,499)', targetGroup: 'group-ac-2' },
                { label: 'Emergency Breakdown', targetGroup: 'group-ac-3' }
              ]
            }
          ]
        },
        {
          id: 'group-ac-2',
          title: 'Group #2 - UPI Advance Payment',
          x: 460,
          y: 60,
          items: [
            {
              id: 'item-ac-3',
              type: 'payment',
              content: 'Slot Booking Token Advance',
              provider: 'UPI',
              currency: 'INR',
              amount: 199,
              quantity: 1,
              varName: 'booking_token',
              successTarget: 'group-ac-4'
            }
          ]
        },
        {
          id: 'group-ac-3',
          title: 'Group #3 - Emergency Dispatch',
          x: 460,
          y: 380,
          items: [
            {
              id: 'item-ac-5',
              type: 'message',
              content: '🚨 Emergency alert triggered! Our master technician is dispatched to your GPS location.'
            }
          ]
        },
        {
          id: 'group-ac-4',
          title: 'Group #4 - Booking Confirmed',
          x: 880,
          y: 60,
          items: [
            {
              id: 'item-ac-4',
              type: 'message',
              content: '✅ ₹199 Token Paid via UPI! Your appointment is confirmed for today. Technician arrives in 45 mins.'
            }
          ]
        }
      ]);
      setBotTitle('AC Repair & UPI Booking Bot');
      addToast('AC Repair & UPI Booking flow loaded!', 'success');
    } else if (templateType === 'ecommerce') {
      setGroups([
        {
          id: 'group-ec-1',
          title: 'Group #1 - Festival Offer',
          x: 40,
          y: 60,
          items: [
            {
              id: 'item-ec-1',
              type: 'message',
              content: '🛍️ Hello VIP Customer! You have won an exclusive ₹500 store voucher.'
            },
            {
              id: 'item-ec-2',
              type: 'choice',
              question: 'Claim Voucher Now?',
              options: [
                { label: 'Claim ₹500 Coupon Code', targetGroup: 'group-ec-2' },
                { label: 'Browse Latest Catalog', targetGroup: 'group-ec-3' }
              ]
            }
          ]
        },
        {
          id: 'group-ec-2',
          title: 'Group #2 - Coupon Issued',
          x: 460,
          y: 60,
          items: [
            {
              id: 'item-ec-3',
              type: 'message',
              content: '🎉 Coupon Code: FEST500 (Flat ₹500 OFF on orders above ₹1,999). Valid until midnight!'
            }
          ]
        },
        {
          id: 'group-ec-3',
          title: 'Group #3 - Catalog Dispatch',
          x: 460,
          y: 340,
          items: [
            {
              id: 'item-ec-4',
              type: 'message',
              content: '📁 Sending you our Autumn 2026 Wholesale PDF Catalog. Happy shopping!'
            }
          ]
        }
      ]);
      setBotTitle('E-Commerce Promo Voucher Flow');
      addToast('E-Commerce Promo Voucher flow loaded!', 'success');
    }

    setIsTemplatesModalOpen(false);
  };

  // Interactive Test Bot Handlers
  const handleOptionClick = (opt: string) => {
    const nextMessages = [
      ...testMessages,
      { sender: 'user' as const, text: opt },
    ];
    const optLower = opt.toLowerCase();

    if (optLower === 'yes') {
      nextMessages.push({
        sender: 'bot',
        text: 'What is the purpose of your travel ?',
        options: ['Study abroad', 'Work abroad', 'Migrate', 'Default']
      });
      setCurrentStep('group-3');
    } else if (optLower === 'no') {
      nextMessages.push({
        sender: 'bot',
        text: 'What is your good name ?'
      });
      setCurrentStep('group-2');
    } else if (optLower === 'study abroad') {
      nextMessages.push({
        sender: 'bot',
        text: 'Field of study: Select your preferred field from the list below:',
        options: ['Computer Science', 'Business Studies', 'Medical Studies', 'Law & Order']
      });
      setCurrentStep('group-7');
    } else if (['computer science', 'business studies', 'medical studies', 'law & order'].includes(optLower)) {
      nextMessages.push({
        sender: 'bot',
        text: `Great choice! "${opt}" program requires an application fee of $49 USD. Please proceed with Stripe Checkout below:`,
        isPayment: true,
        options: ['Pay $49 USD via Stripe', 'Cancel Payment']
      });
      setCurrentStep('group-8');
    } else if (optLower.includes('pay $49') || optLower.includes('stripe')) {
      nextMessages.push({
        sender: 'bot',
        text: '🎉 Payment of $49 confirmed via Stripe! Your application ID is #UQ-2026. A counselor will review your application.'
      });
      setCurrentStep('group-9');
    } else if (optLower.includes('cancel')) {
      nextMessages.push({
        sender: 'bot',
        text: '⚠️ Payment was not completed or was cancelled. Please try again to reserve your slot.',
        options: ['Pay $49 USD via Stripe']
      });
      setCurrentStep('group-10');
    } else {
      nextMessages.push({
        sender: 'bot',
        text: `Thank you! Your selection "${opt}" has been recorded. Our counselor will connect shortly.`,
      });
    }
    setTestMessages(nextMessages);
  };

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;
    const txt = userChatInput.trim();
    setUserChatInput('');
    const next = [...testMessages, { sender: 'user' as const, text: txt }];
    if (currentStep === 'group-2') {
      next.push({ sender: 'bot' as const, text: `Okay ${txt}! What is your age ?` });
    } else {
      next.push({ sender: 'bot' as const, text: `Got it: "${txt}". Checking your requirements...` });
    }
    setTestMessages(next);
  };

  // Helper function to dynamically calculate Bézier curve coordinates between nodes
  const renderDynamicConnections = () => {
    const paths: React.ReactElement[] = [];

    groups.forEach((sourceGrp) => {
      sourceGrp.items.forEach((item, itemIdx) => {
        // Choice options routing
        if (item.type === 'choice' && item.options) {
          item.options.forEach((opt, optIdx) => {
            if (!opt.targetGroup) return;
            const targetGrp = groups.find(
              (g) => g.id === opt.targetGroup || g.title.toLowerCase() === opt.targetGroup?.toLowerCase()
            );
            if (!targetGrp) return;

            const sourceX = sourceGrp.x + 300;
            const sourceY = sourceGrp.y + 110 + optIdx * 34;
            const targetX = targetGrp.x;
            const targetY = targetGrp.y + 40;

            const deltaX = Math.abs(targetX - sourceX);
            const cp1X = sourceX + Math.max(deltaX * 0.45, 60);
            const cp2X = targetX - Math.max(deltaX * 0.45, 60);

            paths.push(
              <g key={`curve-${sourceGrp.id}-${item.id}-${optIdx}`}>
                <path
                  d={`M ${sourceX} ${sourceY} C ${cp1X} ${sourceY}, ${cp2X} ${targetY}, ${targetX} ${targetY}`}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
                <circle cx={sourceX} cy={sourceY} r="4" fill="#10B981" />
                <circle cx={targetX} cy={targetY} r="4" fill="#10B981" />
              </g>
            );
          });
        }

        // Payment routing (Success & Failed ports)
        if (item.type === 'payment') {
          // Success target
          if (item.successTarget) {
            const targetGrp = groups.find(
              (g) => g.id === item.successTarget || g.title.toLowerCase() === item.successTarget?.toLowerCase()
            );
            if (targetGrp) {
              const sourceX = sourceGrp.x + 300;
              const sourceY = sourceGrp.y + 120;
              const targetX = targetGrp.x;
              const targetY = targetGrp.y + 40;
              const deltaX = Math.abs(targetX - sourceX);
              const cp1X = sourceX + Math.max(deltaX * 0.45, 60);
              const cp2X = targetX - Math.max(deltaX * 0.45, 60);

              paths.push(
                <g key={`curve-pay-success-${sourceGrp.id}`}>
                  <path
                    d={`M ${sourceX} ${sourceY} C ${cp1X} ${sourceY}, ${cp2X} ${targetY}, ${targetX} ${targetY}`}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="transition-all duration-75"
                  />
                  <circle cx={sourceX} cy={sourceY} r="5" fill="#10B981" />
                  <circle cx={targetX} cy={targetY} r="4" fill="#10B981" />
                </g>
              );
            }
          }

          // Failed target
          if (item.failedTarget) {
            const targetGrp = groups.find(
              (g) => g.id === item.failedTarget || g.title.toLowerCase() === item.failedTarget?.toLowerCase()
            );
            if (targetGrp) {
              const sourceX = sourceGrp.x + 300;
              const sourceY = sourceGrp.y + 160;
              const targetX = targetGrp.x;
              const targetY = targetGrp.y + 40;
              const deltaX = Math.abs(targetX - sourceX);
              const cp1X = sourceX + Math.max(deltaX * 0.45, 60);
              const cp2X = targetX - Math.max(deltaX * 0.45, 60);

              paths.push(
                <g key={`curve-pay-failed-${sourceGrp.id}`}>
                  <path
                    d={`M ${sourceX} ${sourceY} C ${cp1X} ${sourceY}, ${cp2X} ${targetY}, ${targetX} ${targetY}`}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    className="transition-all duration-75"
                  />
                  <circle cx={sourceX} cy={sourceY} r="5" fill="#EF4444" />
                  <circle cx={targetX} cy={targetY} r="4" fill="#EF4444" />
                </g>
              );
            }
          }
        }

        // Jump routing
        if (item.type === 'jump' && item.targetGroup) {
          const targetGrp = groups.find(
            (g) => g.id === item.targetGroup || g.title.toLowerCase() === item.targetGroup?.toLowerCase()
          );
          if (targetGrp) {
            const sourceX = sourceGrp.x + 300;
            const sourceY = sourceGrp.y + 80;
            const targetX = targetGrp.x;
            const targetY = targetGrp.y + 40;
            const deltaX = Math.abs(targetX - sourceX);
            const cp1X = sourceX + Math.max(deltaX * 0.45, 60);
            const cp2X = targetX - Math.max(deltaX * 0.45, 60);

            paths.push(
              <g key={`curve-jump-${sourceGrp.id}-${item.id}`}>
                <path
                  d={`M ${sourceX} ${sourceY} C ${cp1X} ${sourceY}, ${cp2X} ${targetY}, ${targetX} ${targetY}`}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
                <circle cx={sourceX} cy={sourceY} r="4" fill="#3B82F6" />
                <circle cx={targetX} cy={targetY} r="4" fill="#3B82F6" />
              </g>
            );
          }
        }
      });
    });

    return paths;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-screen overflow-hidden font-sans select-none">
      {/* ========================================================================= */}
      {/* TOP HEADER: CAPSULE SWITCHER (FLOW BUILDER vs KEYWORD RULES)             */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-xs z-20">
        {/* Two-Tab Segmented Capsule */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveMode('canvas')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'canvas'
                ? 'bg-[#0B3B2C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Interactive Flow Canvas</span>
          </button>
          <button
            onClick={() => setActiveMode('keyword_rules')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'keyword_rules'
                ? 'bg-[#0B3B2C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Keyword Trigger Rules</span>
          </button>
        </div>

        {/* Action Buttons: Templates & Go To Workflows */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('automation-workflows')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="View all saved workflows"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Workflows List</span>
          </button>

          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Templates & Demo Tutorials</span>
          </button>

          {activeMode === 'keyword_rules' ? (
            <button
              onClick={() => setIsNewRuleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Rule</span>
            </button>
          ) : (
            <button
              onClick={handleAddGroup}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Group</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: VISUAL CANVAS WORKFLOW BUILDER                                    */}
      {/* ========================================================================= */}
      {activeMode === 'canvas' && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Subheader: Bot Title, Toggles, Test Bot, Autosave, Real Save Button */}
          <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs shrink-0 z-10">
            {/* Left: Chatbot Title & Variable Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180 cursor-pointer" />
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={botTitle}
                    onChange={(e) => setBotTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    autoFocus
                    className="font-bold text-sm text-slate-900 border-b border-emerald-500 outline-none px-1"
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingTitle(true)}
                    className="font-bold text-sm text-slate-900 cursor-pointer hover:text-emerald-700 transition flex items-center gap-1.5"
                    title="Click to rename workflow"
                  >
                    <span>{botTitle}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                )}
              </div>

              {/* Static Variables Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Static Variables</span>
                <button
                  onClick={() => setStaticVariables(!staticVariables)}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    staticVariables ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      staticVariables ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Global Variables Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Global Variables</span>
                <button
                  onClick={() => setGlobalVariables(!globalVariables)}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    globalVariables ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      globalVariables ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Center: Test Bot Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTestBotOpen(true)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Test Bot (Live Simulator)</span>
              </button>
            </div>

            {/* Right: Autosave, Undo/Redo, Real Save */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Autosave</span>
                <button
                  onClick={() => setAutosave(!autosave)}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    autosave ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      autosave ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                <button
                  onClick={() => addToast('Action undone', 'info')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  title="Undo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => addToast('Action redone', 'info')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  title="Redo"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Real Save Workflow Button (persists to store and Workflows page) */}
              <button
                onClick={handleSaveWorkflowToStore}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-bold shadow-sm transition cursor-pointer active:scale-95"
                title="Save workflow to database and activate on Workflows page"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Floating Apple-Style Interactive Tutorial HUD */}
          {showTutorialHud && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl shadow-xl border border-slate-700/60 flex items-center gap-4 text-xs animate-in fade-in slide-in-from-top-4 duration-300 no-pan">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                {tutorialStep}
              </div>
              <div className="max-w-md leading-relaxed">
                {tutorialStep === 1 && (
                  <span>
                    <strong className="text-emerald-400">Pan Anywhere:</strong> Click and drag on the canvas background to slide across all nodes effortlessly without using scrollbars!
                  </span>
                )}
                {tutorialStep === 2 && (
                  <span>
                    <strong className="text-emerald-400">Configure Element Inspector:</strong> Click on any block (e.g. <em>Field of study</em> or <em>Stripe Checkout</em>) to edit choices & payment gateways!
                  </span>
                )}
                {tutorialStep === 3 && (
                  <span>
                    <strong className="text-emerald-400">Save to Workflows:</strong> Click <strong>Save</strong> at the top right, and your chatbot flow is permanently stored in the <strong>Workflows</strong> section!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                <button
                  onClick={() => setTutorialStep((s) => (s < 3 ? s + 1 : 1))}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                >
                  {tutorialStep < 3 ? 'Next Tip' : 'Restart'}
                </button>
                <button
                  onClick={() => setShowTutorialHud(false)}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Dismiss Guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Main Canvas & Block Library Container */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Floating Zoom & Canvas Controls Toolbar (Left) */}
            <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg p-1.5 flex flex-col gap-1.5 text-slate-600 no-pan">
              <button
                onClick={handleAddGroup}
                className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold transition cursor-pointer"
                title="Add New Group (Card)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="h-px bg-slate-200 my-0.5" />
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.1, 0.4))}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center font-mono text-[11px] font-bold text-slate-700 transition cursor-pointer"
                title="Reset Zoom (1:1)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <div className="h-px bg-slate-200 my-0.5" />
              {/* Fit All Nodes View Button */}
              <button
                onClick={handleFitView}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition cursor-pointer"
                title="Fit All Nodes in Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Canvas Scrollable & Pannable Area */}
            <div
              ref={canvasRef}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              className={`flex-1 overflow-auto bg-[#F4F6F5] relative p-12 select-none ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{
                backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
                backgroundSize: '24px 24px',
              }}
            >
              <div
                className="relative min-w-[3400px] min-h-[1400px] transition-transform origin-top-left"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* SVG Connections between Nodes dynamically rendered */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  {renderDynamicConnections()}
                </svg>

                {/* Render Group Cards with Pointer Dragging Support */}
                {groups.map((grp) => (
                  <div
                    key={grp.id}
                    style={{
                      left: `${grp.x}px`,
                      top: `${grp.y}px`,
                      cursor: draggedGroupId === grp.id ? 'grabbing' : 'default',
                    }}
                    className={`group-card absolute w-[300px] bg-white rounded-2xl border-2 transition-shadow z-10 flex flex-col ${
                      draggedGroupId === grp.id
                        ? 'border-emerald-600 shadow-2xl scale-[1.01]'
                        : 'border-emerald-400/80 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {/* Card Header (Drag Handle) */}
                    <div
                      onPointerDown={(e) => handlePointerDownGroup(e, grp.id)}
                      className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl cursor-grab active:cursor-grabbing select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Move className="w-3.5 h-3.5 text-slate-400" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-xs text-slate-800">{grp.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGroups(groups.filter((g) => g.id !== grp.id));
                            addToast(`Deleted ${grp.title}`, 'info');
                          }}
                          className="hover:text-red-500 transition p-1"
                          title="Delete Group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Items */}
                    <div className="p-3.5 space-y-3 text-xs flex-1">
                      {grp.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleOpenConfigModal(grp, item)}
                          className="space-y-1.5 cursor-pointer group/item relative transition hover:opacity-95"
                          title="Click to Configure Element"
                        >
                          {/* Hover Edit Badge */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition bg-white/90 shadow-xs border border-slate-200 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-slate-600 flex items-center gap-1 z-10">
                            <Sliders className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Configure</span>
                          </div>

                          {/* Message Item */}
                          {item.type === 'message' && (
                            <div className="bg-[#EAFBF3] border border-emerald-200/80 p-2.5 rounded-xl text-slate-800 space-y-1 hover:border-emerald-400 transition">
                              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px]">
                                <MessageSquare className="w-3 h-3" />
                                <span>Message</span>
                              </div>
                              <div className="text-[11px] leading-relaxed text-slate-700 font-medium">
                                {item.content}
                              </div>
                            </div>
                          )}

                          {/* Collect Input Item */}
                          {item.type === 'collect' && (
                            <div className="bg-purple-50 border border-purple-200/80 px-3 py-2 rounded-xl flex items-center justify-between text-purple-900 hover:border-purple-400 transition">
                              <div className="flex items-center gap-2 font-semibold text-[11px]">
                                <span className="font-mono text-[10px] text-purple-500">T:</span>
                                <span>Collect Input</span>
                                <span className="bg-purple-200/70 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                  {item.varName || 'input_var'}
                                </span>
                              </div>
                              <span className="w-2 h-2 rounded-full bg-purple-500" />
                            </div>
                          )}

                          {/* Choice / Question Item (List Menu or Buttons) */}
                          {item.type === 'choice' && (
                            <div className="space-y-2">
                              {item.question && (
                                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1 text-amber-800">
                                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>{item.question}</span>
                                </div>
                              )}
                              {item.content && (
                                <div className="text-[10px] text-slate-500 italic px-1">
                                  {item.content}
                                </div>
                              )}
                              <div className="space-y-1.5">
                                {item.options?.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 flex items-center justify-between text-slate-800 font-semibold text-[11px] transition shadow-2xs"
                                  >
                                    <span>{opt.label}</span>
                                    <div className="flex items-center gap-1.5">
                                      {opt.targetGroup && (
                                        <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                                          &gt;&gt; {opt.targetGroup}
                                        </span>
                                      )}
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {item.varName && (
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    Saved to: {item.varName}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Payment Checkout Item (Matching Screenshot media_1789380618719.png) */}
                          {item.type === 'payment' && (
                            <div className="bg-emerald-50/80 border-2 border-emerald-400 p-3 rounded-xl space-y-2.5 hover:border-emerald-600 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px]">
                                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Payment: {item.provider || 'STRIPE'}</span>
                                </div>
                                <span className="bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                  {item.currency || 'USD'} ${item.amount || 49}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-700 font-medium">
                                {item.content || 'Checkout Link'}
                              </div>
                              {/* Ports for Success and Failed */}
                              <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[10px] font-semibold">
                                <div className="flex items-center gap-1 text-emerald-700">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span>Success &gt;&gt;</span>
                                </div>
                                <div className="flex items-center gap-1 text-red-600">
                                  <span>&gt;&gt; Failed</span>
                                  <span className="w-2 h-2 rounded-full bg-red-500" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Jump to Group Item */}
                          {item.type === 'jump' && (
                            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between font-semibold text-[11px] hover:border-blue-400 transition">
                              <span>&gt;&gt; Jump to {item.targetGroup}</span>
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Floating Quick-Jump Pill Bar (Jump across nodes on the ends instantly!) */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-2 text-xs no-pan max-w-xl overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Jump:</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {groups.map((grp) => (
                  <button
                    key={grp.id}
                    onClick={() => handleJumpToGroup(grp)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-slate-700 text-[11px] font-medium transition shrink-0 cursor-pointer"
                  >
                    {grp.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Sidebar: BLOCK LIBRARY */}
            <div className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto font-sans text-xs z-10 no-pan">
              {/* Library Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-slate-800 tracking-wider text-[11px] uppercase">BLOCK LIBRARY</span>
                <button
                  onClick={handleAddGroup}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Group</span>
                </button>
              </div>

              {/* Categorized Blocks List */}
              <div className="p-3.5 space-y-4 overflow-y-auto">
                {/* MESSAGES */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">MESSAGES</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Text', icon: MessageSquare },
                      { label: 'Image', icon: Image },
                      { label: 'Video', icon: Video },
                      { label: 'YouTube', icon: Video },
                      { label: 'Media', icon: Layers },
                      { label: 'File', icon: FileText },
                      { label: 'Audio', icon: Music },
                      { label: 'Location', icon: MapPin },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'MESSAGES')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHOICES */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CHOICES</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Quick Reply', icon: MessageSquare },
                      { label: 'List Menu', icon: List },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'CHOICES')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* INPUTS */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">INPUTS</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Text', icon: MessageSquare },
                      { label: 'Number', icon: Layers },
                      { label: 'Email', icon: MessageSquare },
                      { label: 'Website', icon: ExternalLink },
                      { label: 'Date', icon: Calendar },
                      { label: 'Time', icon: Clock },
                      { label: 'Phone', icon: Smartphone },
                      { label: 'File', icon: FileText },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'INPUTS')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PAYMENTS */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PAYMENTS</div>
                  <button
                    onClick={() => handleAddBlockToGroup('Stripe Checkout', 'PAYMENTS')}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-900 flex items-center gap-2 transition text-[11px] font-semibold text-emerald-800 shadow-2xs cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Payment Checkout Link</span>
                  </button>
                </div>

                {/* LOGIC */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">LOGIC</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Condition', icon: GitBranch },
                      { label: 'Chatbot', icon: Bot },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'LOGIC')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* INTEGRATIONS */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">INTEGRATIONS</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Sheets', icon: FileText },
                      { label: 'Webhook', icon: Zap },
                      { label: 'Email', icon: MessageSquare },
                      { label: 'Zapier', icon: Zap },
                      { label: 'Make.com', icon: Sparkles },
                      { label: 'Pabbly', icon: Layers },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'INTEGRATIONS')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: KEYWORD RULES TABLE                                               */}
      {/* ========================================================================= */}
      {activeMode === 'keyword_rules' && (
        <div className="flex-1 p-6 overflow-y-auto font-sans space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Keyword Rules List */}
            <div className="lg:col-span-2 space-y-5">
              {keywordRules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Rule Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{rule.title}</h3>
                        <div className="text-xs text-slate-500 font-medium">
                          Triggered {rule.triggered_count} times
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{rule.active ? 'ON' : 'OFF'}</span>
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                            rule.active ? 'bg-[#0B3B2C]' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`block w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform transform ${
                              rule.active ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* When Customer Says... */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      WHEN CUSTOMER SAYS...
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {rule.keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="bg-slate-100 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5"
                        >
                          <span>{kw}</span>
                          <button
                            onClick={() => handleRemoveKeyword(rule.id, kw)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {activeKeywordInputRuleId === rule.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Type keyword and press Enter..."
                            value={inlineKeywordText}
                            onChange={(e) => setInlineKeywordText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddKeywordToRule(rule.id);
                              }
                            }}
                            autoFocus
                            className="text-xs px-3 py-1.5 border border-emerald-400 rounded-xl outline-none bg-white w-44"
                          />
                          <button
                            onClick={() => handleAddKeywordToRule(rule.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveKeywordInputRuleId(rule.id);
                            setInlineKeywordText('');
                          }}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 rounded-lg border border-dashed border-emerald-300 hover:bg-emerald-50 transition cursor-pointer"
                        >
                          + Add keyword
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reply With... */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      REPLY WITH...
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                      {rule.reply}
                    </div>

                    {rule.attachment && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rule.attachment}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Working Hours Card */}
            <div className="space-y-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>Working Hours</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Your chatbot prioritizes automated replies and away messages outside active hours.
                </p>

                {/* Day Schedule List */}
                <div className="divide-y divide-slate-100">
                  {workingHours.map((wh) => (
                    <div key={wh.day} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{wh.day}</div>
                        <div className="text-slate-500 text-[11px] font-mono mt-0.5">{wh.time}</div>
                      </div>

                      <input
                        type="checkbox"
                        checked={wh.enabled}
                        onChange={() => handleToggleDay(wh.day)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer accent-[#0B3B2C]"
                      />
                    </div>
                  ))}
                </div>

                {/* Away Message Box */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Outside Hours Away Message:
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Hi there! Thanks for reaching out to WhatsQ. Our team is currently away from the desk. We will get back to you promptly when we open tomorrow morning!"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => addToast('Working hours & away message saved', 'success')}
                    className="w-full py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    Save Working Hours
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIGURE ELEMENT MODAL (Matches screenshots media_1789380608034 & 1789380618719) */}
      {/* ========================================================================= */}
      {configModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setConfigModal(null)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Configure Element</h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {configModal.groupTitle} &bull; ID: {configModal.draftItem.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setConfigModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Element Type Selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Element Type</label>
                <select
                  value={configModal.draftItem.type}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setConfigModal({
                      ...configModal,
                      draftItem: {
                        ...configModal.draftItem,
                        type: newType,
                        options: newType === 'choice' ? configModal.draftItem.options || [{ label: 'Option 1' }] : undefined,
                        provider: newType === 'payment' ? 'STRIPE' : undefined,
                        currency: newType === 'payment' ? 'USD' : undefined,
                        amount: newType === 'payment' ? 49 : undefined,
                        quantity: newType === 'payment' ? 1 : undefined,
                      }
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="message">WhatsApp Message</option>
                  <option value="choice">List Menu / Choices</option>
                  <option value="payment">Payment Checkout (Stripe / Razorpay / UPI)</option>
                  <option value="collect">Collect User Input</option>
                  <option value="jump">Jump to Group</option>
                </select>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* LIST MENU / CHOICE ELEMENT CONFIG (Matching media_1789380608034.png) */}
              {/* ------------------------------------------------------------- */}
              {configModal.draftItem.type === 'choice' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Title / Header *</label>
                    <input
                      type="text"
                      placeholder="e.g. Field of study"
                      value={configModal.draftItem.question || ''}
                      onChange={(e) =>
                        setConfigModal({
                          ...configModal,
                          draftItem: { ...configModal.draftItem, question: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Body Text</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Select preferred field following list."
                      value={configModal.draftItem.content || ''}
                      onChange={(e) =>
                        setConfigModal({
                          ...configModal,
                          draftItem: { ...configModal.draftItem, content: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Footer (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Admissions Office"
                        value={configModal.draftItem.footer || ''}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, footer: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Button Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Select Course"
                        value={configModal.draftItem.buttonLabel || ''}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, buttonLabel: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Choice Items list with Target Routing */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-700 font-semibold">Menu Choices / Options</label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentOpts = configModal.draftItem.options || [];
                          setConfigModal({
                            ...configModal,
                            draftItem: {
                              ...configModal.draftItem,
                              options: [...currentOpts, { label: `New Option ${currentOpts.length + 1}` }]
                            }
                          });
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {configModal.draftItem.options?.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => {
                              const nextOpts = [...(configModal.draftItem.options || [])];
                              nextOpts[idx] = { ...nextOpts[idx], label: e.target.value };
                              setConfigModal({
                                ...configModal,
                                draftItem: { ...configModal.draftItem, options: nextOpts }
                              });
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <select
                            value={opt.targetGroup || ''}
                            onChange={(e) => {
                              const nextOpts = [...(configModal.draftItem.options || [])];
                              nextOpts[idx] = { ...nextOpts[idx], targetGroup: e.target.value || undefined };
                              setConfigModal({
                                ...configModal,
                                draftItem: { ...configModal.draftItem, options: nextOpts }
                              });
                            }}
                            className="w-36 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                          >
                            <option value="">No connection</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                Connect to {g.title}
                              </option>
                            ))}
                          </select>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Output Port" />
                          <button
                            type="button"
                            onClick={() => {
                              const nextOpts = configModal.draftItem.options?.filter((_, i) => i !== idx);
                              setConfigModal({
                                ...configModal,
                                draftItem: { ...configModal.draftItem, options: nextOpts }
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variable storage badge */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Save Answer to Variable</label>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[11px]">
                        {configModal.draftItem.varName || 'field_of_study'}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. field_of_study"
                        value={configModal.draftItem.varName || ''}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, varName: e.target.value }
                          })
                        }
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* PAYMENT CHECKOUT CONFIG (Matching media_1789380618719.png)         */}
              {/* ------------------------------------------------------------------ */}
              {configModal.draftItem.type === 'payment' && (
                <div className="space-y-3.5">
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-900">WhatsApp Payment Gateway</div>
                      <div className="text-[11px] text-emerald-700">
                        Collect instant payments via Stripe, Razorpay, or UPI with dynamic callback branches.
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Provider *</label>
                    <select
                      value={configModal.draftItem.provider || 'STRIPE'}
                      onChange={(e) =>
                        setConfigModal({
                          ...configModal,
                          draftItem: { ...configModal.draftItem, provider: e.target.value as any }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-800"
                    >
                      <option value="STRIPE">Stripe</option>
                      <option value="RAZORPAY">Razorpay</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="UPI">UPI Direct (GPay / PhonePe / Paytm)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                      <select
                        value={configModal.draftItem.currency || 'USD'}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, currency: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AED">AED (د.إ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Price Amount</label>
                      <input
                        type="number"
                        value={configModal.draftItem.amount || 49}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, amount: Number(e.target.value) }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Quantity</label>
                      <input
                        type="number"
                        value={configModal.draftItem.quantity || 1}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, quantity: Number(e.target.value) }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Item Title / Checkout Description</label>
                    <input
                      type="text"
                      placeholder="e.g. University Application Fee Checkout"
                      value={configModal.draftItem.content || ''}
                      onChange={(e) =>
                        setConfigModal({
                          ...configModal,
                          draftItem: { ...configModal.draftItem, content: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Branches for Success & Failed */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="block text-slate-700 font-semibold">Payment Outcome Routing</label>

                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-bold text-emerald-800 text-[11px] w-24">Payment Success:</span>
                      <select
                        value={configModal.draftItem.successTarget || ''}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, successTarget: e.target.value || undefined }
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">No connection</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            Connect to {g.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-red-50/60 border border-red-200 rounded-xl">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                      <span className="font-bold text-red-800 text-[11px] w-24">Payment Failed:</span>
                      <select
                        value={configModal.draftItem.failedTarget || ''}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, failedTarget: e.target.value || undefined }
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">No connection</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            Connect to {g.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MESSAGE ELEMENT CONFIG                                        */}
              {/* ------------------------------------------------------------- */}
              {configModal.draftItem.type === 'message' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Message Content *</label>
                    <textarea
                      rows={4}
                      value={configModal.draftItem.content || ''}
                      onChange={(e) =>
                        setConfigModal({
                          ...configModal,
                          draftItem: { ...configModal.draftItem, content: e.target.value }
                        })
                      }
                      placeholder="Hi {name}! Welcome to WhatsQ..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Insert Variable:</span>
                    {['{name}', '{email}', '{phone}', '{field_of_study}', '{amount}'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          const cur = configModal.draftItem.content || '';
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, content: cur + ' ' + v }
                          });
                        }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded border border-slate-200 text-[10px] font-mono transition"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* COLLECT INPUT CONFIG                                          */}
              {/* ------------------------------------------------------------- */}
              {configModal.draftItem.type === 'collect' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Variable Name *</label>
                    <input
                      type="text"
                      value={configModal.draftItem.varName || ''}
                      onChange={(e) =>
                        setConfigModal({
                          ...configModal,
                          draftItem: { ...configModal.draftItem, varName: e.target.value }
                        })
                      }
                      placeholder="e.g. user_email, phone, student_age"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* JUMP TO GROUP CONFIG                                          */}
              {/* ------------------------------------------------------------- */}
              {configModal.draftItem.type === 'jump' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Target Group *</label>
                    <select
                      value={configModal.draftItem.targetGroup || ''}
                      onChange={(e) =>
                        setConfigModal({
                          ...configModal,
                          draftItem: { ...configModal.draftItem, targetGroup: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    >
                      <option value="">Select target group</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Cancel & Apply buttons matching screenshot) */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setConfigModal(null)}
                className="px-5 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfigModal}
                className="px-6 py-2 rounded-full bg-[#00875A] hover:bg-[#00704A] text-white font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATES & DEMO TUTORIAL MODAL                                           */}
      {/* ========================================================================= */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsTemplatesModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 flex flex-col">
            <div className="p-6 bg-[#0B3B2C] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Workflow Templates & Interactive Tutorials</h3>
                <p className="text-xs text-emerald-300">
                  Select a pre-engineered workflow to instantly understand and deploy automation
                </p>
              </div>
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Template 1: University & Stripe Checkout */}
              <div
                onClick={() => handleLoadTemplate('university')}
                className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                      Recommended Demo
                    </span>
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    VIP University Admissions & Stripe Checkout
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Includes full student onboarding: name confirmation, study abroad qualification, List Menu course selection, and $49 Stripe payment.
                  </p>
                </div>
                <div className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <span>Load Tutorial & Flow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Template 2: AC Repair & UPI */}
              <div
                onClick={() => handleLoadTemplate('ac_service')}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                      Home Services
                    </span>
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    AC Repair Dispatch & ₹199 UPI Advance
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Automatic emergency breakdown routing, deep cleaning booking, and ₹199 token payment via UPI direct.
                  </p>
                </div>
                <div className="text-blue-700 font-bold flex items-center gap-1 text-[11px]">
                  <span>Load Flow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Template 3: E-Commerce ₹500 Voucher */}
              <div
                onClick={() => handleLoadTemplate('ecommerce')}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Retail & Sales
                    </span>
                    <ShoppingCart className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Festival Promo & ₹500 Coupon Claim
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Instant ₹500 discount voucher delivery, wholesale rate card catalog PDF dispatch, and store link.
                  </p>
                </div>
                <div className="text-amber-700 font-bold flex items-center gap-1 text-[11px]">
                  <span>Load Flow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Template 4: Blank Canvas */}
              <div
                onClick={() => handleLoadTemplate('blank')}
                className="p-4 rounded-2xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 cursor-pointer transition shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                      Clean Start
                    </span>
                    <Plus className="w-4 h-4 text-slate-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Blank Workflow Canvas
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Start completely from scratch with a single greeting block and build your custom logic.
                  </p>
                </div>
                <div className="text-slate-700 font-bold flex items-center gap-1 text-[11px]">
                  <span>Create Blank</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEST BOT INTERACTIVE MODAL (Live Simulator)                               */}
      {/* ========================================================================= */}
      {isTestBotOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsTestBotOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 flex flex-col h-[600px]">
            {/* Modal Header (WhatsApp style) */}
            <div className="p-4 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">WhatsQ Test Bot</h3>
                  <div className="text-[11px] text-emerald-300">Live Simulator (Testing {botTitle})</div>
                </div>
              </div>
              <button
                onClick={() => setIsTestBotOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#EFEAE2]"
              style={{
                backgroundImage: 'radial-gradient(#CBD5E1 0.7px, transparent 0.7px)',
                backgroundSize: '16px 16px',
              }}
            >
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#D9FDD3] text-slate-800 rounded-br-none'
                        : 'bg-white text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.isPayment && (
                      <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-900 text-[11px]">
                          Secure Checkout Gateway: Stripe $49 USD
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Button Choices */}
                  {msg.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionClick(opt)}
                          className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendTestMessage}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Type a message to test flow..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-bold shadow-xs transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE NEW KEYWORD RULE MODAL                                             */}
      {/* ========================================================================= */}
      {isNewRuleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsNewRuleModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200">
            <div className="p-5 bg-[#0B3B2C] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create Keyword Trigger Rule</h3>
                <p className="text-xs text-emerald-300">Auto-respond when incoming message matches keywords</p>
              </div>
              <button
                onClick={() => setIsNewRuleModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRuleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rate Card PDF Auto-Reply"
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Trigger Keywords (separated by comma) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. price, catalog, pricing, cost, rate"
                  value={newRule.keywords}
                  onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Automated Reply Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hello! Here is our latest wholesale rate card catalog..."
                  value={newRule.reply}
                  onChange={(e) => setNewRule({ ...newRule, reply: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attachment (Optional File/PDF)</label>
                <input
                  type="text"
                  placeholder="e.g. Rate-Card-Catalog.pdf"
                  value={newRule.attachment}
                  onChange={(e) => setNewRule({ ...newRule, attachment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
                >
                  Save & Enable Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  GitBranch, List, Plus, Play, Save, RotateCcw, RotateCw,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Trash2, Edit3, X, Check,
  MessageSquare, FileText, Image, Video, Music, MapPin,
  HelpCircle, CreditCard, Layers, Bot, Zap, Smartphone,
  CheckCircle2, Clock, Calendar, Paperclip, ChevronRight, ChevronDown, ChevronLeft,
  ExternalLink, Sparkles, AlertCircle, ArrowRight, CornerDownRight,
  Move, Sliders, IndianRupee, RefreshCw, Eye, BookOpen, Info,
  ShieldCheck, ShoppingCart, Send, Compass, PanelRightClose, PanelRightOpen, Globe,
  Upload, Link2, Search, GraduationCap
} from 'lucide-react';
import { generateWorkflowFromTemplate } from '@/utils/templateWorkflowGenerator';
import { SERVICE_BOOKING_FLOW_GROUPS, normalizeToFlowGroups, autoAdjustFlowGroupGaps } from '@/utils/serviceBookingFlow';
import { KeywordRule, DaySchedule } from '@/types';
export type { KeywordRule, DaySchedule };
import { KeywordTriggerRulesView } from './KeywordTriggerRulesView';

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
  // Media element fields
  mediaType?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  mediaUrl?: string;
  mediaCaption?: string;
  mediaFileName?: string;
  mediaFileSize?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export interface FlowGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  items: GroupItem[];
}

export interface BlockKnowledge {
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  description: string;
  useCase: string;
  tip: string;
}

export const getBlockKnowledge = (label: string, category: string): BlockKnowledge => {
  const lbl = (label || '').toLowerCase();
  const cat = (category || '').toUpperCase();

  // INPUTS category
  if (cat === 'INPUTS') {
    if (lbl.includes('number') || lbl.includes('quantity')) {
      return {
        name: 'Number / Quantity Input',
        tagline: 'Numeric Validation & Capture',
        badge: 'Validated Input',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Captures numeric data from the customer (e.g. quantity of ACs, PIN code, room count) and validates that the reply contains only numbers.',
        useCase: 'Best for: order quantities, area PIN code, number of appliances, age.',
        tip: 'Prevents non-numeric customer replies before proceeding to quotation or checkout.'
      };
    }
    if (lbl.includes('email')) {
      return {
        name: 'Email Address Collector',
        tagline: 'RFC Format Email Validation',
        badge: 'Validated Email',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Prompts the customer for their official email address and verifies correct format before saving to CRM and dispatching PDF invoices.',
        useCase: 'Best for: warranty registrations, invoice dispatch, email notifications.',
        tip: 'Automatically syncs to Customer CRM and Deal records.'
      };
    }
    if (lbl.includes('website') || lbl.includes('url')) {
      return {
        name: 'Website / URL Collector',
        tagline: 'Web Link Verification',
        badge: 'URL Input',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Prompts customer to provide a company website or social profile URL for lead qualification and business onboarding.',
        useCase: 'Best for: B2B partner applications, vendor registrations, portfolio links.',
        tip: 'Automatically normalizes links with https://.'
      };
    }
    if (lbl.includes('date')) {
      return {
        name: 'Date Picker Input',
        tagline: 'Appointment & Delivery Date',
        badge: 'Scheduling',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Collects the customer’s preferred date for appointments, technician visits, or delivery with smart natural language support.',
        useCase: 'Best for: booking visits, event RSVP, scheduled maintenance.',
        tip: 'Integrates with Google Calendar and technician shift rosters.'
      };
    }
    if (lbl.includes('time')) {
      return {
        name: 'Time Window Selector',
        tagline: 'Service Time Slot Picker',
        badge: 'Scheduling',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Captures the customer’s preferred hour or arrival window (e.g. 10:00 AM - 12:00 PM) to assign available field specialists.',
        useCase: 'Best for: home service arrival windows, doctor consultations, calls.',
        tip: 'Prevents specialist double-booking by locking time slots.'
      };
    }
    if (lbl.includes('phone')) {
      return {
        name: 'Phone Number Collector',
        tagline: 'Alternative Contact Number',
        badge: 'Contact Info',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Captures an alternate mobile or WhatsApp number with international country-code validation.',
        useCase: 'Best for: secondary contact on site, emergency contact, supervisor phone.',
        tip: 'Validated numbers can receive automated SMS/WhatsApp alerts.'
      };
    }
    if (lbl.includes('file')) {
      return {
        name: 'Document / Photo Request',
        tagline: 'Customer Media Upload Request',
        badge: 'Attachment',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Prompts the customer to upload a document, invoice copy, government ID, or photo of equipment damage.',
        useCase: 'Best for: KYC verification, repair inspection photos, warranty claims.',
        tip: 'Attachments are stored in media storage and linked to conversation.'
      };
    }
    return {
      name: 'Text Input Collector',
      tagline: 'Customer Text Response Capture',
      badge: 'User Input',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      description: 'Prompts the customer to type a text response (e.g., custom address, service notes, feedback) and saves it into a contact variable.',
      useCase: 'Best for: capturing special delivery instructions, problem descriptions, and custom remarks.',
      tip: 'Variables can be reused in subsequent cards using {variable_name}.'
    };
  }

  // CHOICES category
  if (cat === 'CHOICES') {
    if (lbl.includes('list')) {
      return {
        name: 'Interactive List Menu',
        tagline: 'WhatsApp Bottom-Sheet Drawer (up to 10 Rows)',
        badge: 'Interactive List',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Opens an elegant slide-up list menu in WhatsApp with section titles, row descriptions, and up to 10 selectable items.',
        useCase: 'Best for: large product catalogs, multiple branch locations, full service menus.',
        tip: 'Great when you have more than 3 options to avoid chat clutter.'
      };
    }
    return {
      name: 'Quick-Reply Choice Buttons',
      tagline: 'Interactive WhatsApp Quick Replies (1-3 Options)',
      badge: 'Interactive Buttons',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Displays tap-to-select buttons directly in WhatsApp. Customers click a button to immediately trigger the designated next group card.',
      useCase: 'Best for: Yes/No confirmation, service categories, slot choices.',
      tip: 'Click any option in the Inspector to choose which group card it routes to!'
    };
  }

  // PAYMENTS category
  if (cat === 'PAYMENTS' || lbl.includes('stripe') || lbl.includes('payment') || lbl.includes('checkout')) {
    return {
      name: 'Stripe & UPI Payment Gateway',
      tagline: 'Secure Online Payment Collection',
      badge: 'Payment Gateway',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Generates instant, authenticated checkout links for UPI (Google Pay, PhonePe, Paytm), credit/debit cards, and Stripe with real-time webhooks.',
      useCase: 'Best for: slot booking token advances (₹99-₹499), AMC renewals, product purchases.',
      tip: 'Routes automatically to Success Card or Failure Card based on payment outcome.'
    };
  }

  // LOGIC category
  if (cat === 'LOGIC') {
    if (lbl.includes('condition')) {
      return {
        name: 'Condition & Smart Branching',
        tagline: 'Dynamic Rules-Based Routing',
        badge: 'Flow Logic',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        description: 'Branches conversation flow based on customer variables, location, VIP tier, previous answers, or current business hours.',
        useCase: 'Best for: routing VIP customers, service availability check by pincode.',
        tip: 'Create If/Else logic without writing any programming code.'
      };
    }
    return {
      name: 'AI Copilot Handover',
      tagline: 'Gemini AI Assistant Integration',
      badge: 'AI Smart Agent',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      description: 'Transfers unscripted or complex customer questions to the AI Copilot grounded on your company knowledge base.',
      useCase: 'Best for: free-form FAQ answering, intelligent customer assistance.',
      tip: 'AI uses your company workspace knowledge articles for 100% accurate responses.'
    };
  }

  // INTEGRATIONS category
  if (cat === 'INTEGRATIONS') {
    if (lbl.includes('sheets')) {
      return {
        name: 'Google Sheets Integration',
        tagline: 'Instant Spreadsheet Row Appender',
        badge: 'Google Sheets',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Appends customer responses, contact details, and booking times as new rows in your live Google Spreadsheet in real-time.',
        useCase: 'Best for: team lead tracking, attendance logs, shared booking sheets.',
        tip: 'Requires zero API code—syncs in milliseconds.'
      };
    }
    if (lbl.includes('webhook')) {
      return {
        name: 'Custom Webhook Dispatcher',
        tagline: 'External API REST Integration',
        badge: 'REST Webhook',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Sends a secure HTTP POST JSON payload to your custom backend, internal CRM, or billing server when customer reaches this step.',
        useCase: 'Best for: custom ERP integration, inventory reservation, order creation.',
        tip: 'Includes full conversation payload and contact variable map.'
      };
    }
    if (lbl.includes('email')) {
      return {
        name: 'Email Notification Dispatcher',
        tagline: 'Automated Team Alert Email',
        badge: 'SMTP Email',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Sends automated HTML email notifications to managers, store staff, or technicians when high-priority bookings occur.',
        useCase: 'Best for: instant manager alerts, emergency service requests.',
        tip: 'Configure recipients and custom email templates in settings.'
      };
    }
    if (lbl.includes('zapier')) {
      return {
        name: 'Zapier Automation Trigger',
        tagline: 'Connect to 5,000+ Business Apps',
        badge: 'Zapier',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Triggers a Zapier Zap with live conversation data to automate Salesforce, HubSpot, Slack, Trello, and more.',
        useCase: 'Best for: enterprise CRM updates, team Slack alerts, task creation.',
        tip: 'Paste your Zapier Webhook URL in the inspector to activate.'
      };
    }
    if (lbl.includes('make')) {
      return {
        name: 'Make.com Scenario Trigger',
        tagline: 'Visual Multi-Step Webhook Processing',
        badge: 'Make.com',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Dispatches structured payloads to Make.com (Integromat) scenarios for complex multi-app data processing.',
        useCase: 'Best for: multi-database syncing, complex invoice generation, Airtable.',
        tip: 'Ideal for visual workflow builders who use Make.'
      };
    }
    if (lbl.includes('pabbly')) {
      return {
        name: 'Pabbly Connect Webhook',
        tagline: 'Indian & Global App Automation',
        badge: 'Pabbly',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Triggers Pabbly Connect webhooks to connect WhatsApp leads with Indian payment gateways, local ERPs, and SMS services.',
        useCase: 'Best for: Razorpay/Instamojo sync, local CRM updates, SMS alerts.',
        tip: 'Affordable, reliable webhook automation for Indian businesses.'
      };
    }
  }

  // MESSAGES category (default)
  if (lbl.includes('image')) {
    return {
      name: 'Image / Photo Card',
      tagline: 'High-Resolution Visual Media',
      badge: 'Media (JPG/PNG)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Displays promotional banners, product photos, service checklists, and before/after pictures directly in the chat with optional captions.',
      useCase: 'Best for: marketing banners, product catalogs, service proof photos.',
      tip: 'Supports JPG, PNG, and WebP up to 5MB.'
    };
  }
  if (lbl.includes('video') || lbl.includes('youtube')) {
    return {
      name: 'Video Presentation Block',
      tagline: 'Engaging MP4 Video Showcase',
      badge: 'Media (MP4)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Sends MP4 product demo videos, video tutorials, or facility walkthroughs that customers can stream or play inside WhatsApp.',
      useCase: 'Best for: onboarding videos, product demonstrations, customer testimonials.',
      tip: 'Recommended under 16MB for instant streaming on mobile networks.'
    };
  }
  if (lbl.includes('media')) {
    return {
      name: 'Rich Media Card',
      tagline: 'Multi-Format Visual Attachment',
      badge: 'Rich Media',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Combines an image or video banner with formatted text, headline, and contextual call-to-action buttons in a single bubble.',
      useCase: 'Best for: featured offers, event invites, service packages.',
      tip: 'Delivers higher click-through rates than plain text messages.'
    };
  }
  if (lbl.includes('file')) {
    return {
      name: 'Document & PDF Delivery',
      tagline: 'Downloadable File & Invoice Attachment',
      badge: 'Document (PDF)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Delivers official PDF rate cards, brochures, contracts, and GST invoices for easy one-tap viewing and offline download.',
      useCase: 'Best for: quotation summaries, PDF rate cards, terms of service.',
      tip: 'Customers can preview PDFs immediately on both iOS and Android.'
    };
  }
  if (lbl.includes('audio') || lbl.includes('music')) {
    return {
      name: 'Voice Note & Audio Message',
      tagline: 'Authentic Human Voice Recording',
      badge: 'Voice Note',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Sends voice recordings and push-to-talk audio clips that look and play like real voice notes recorded on a phone.',
      useCase: 'Best for: VIP CEO welcome notes, personal follow-ups, accessibility.',
      tip: 'Voice notes build 3x higher trust compared to plain robotic text.'
    };
  }
  if (lbl.includes('location')) {
    return {
      name: 'Interactive GPS Location Pin',
      tagline: 'Store Address & One-Tap Navigation',
      badge: 'Google Maps Pin',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Shares an interactive Google Maps location pin with coordinates, branch name, address, and instant turn-by-turn driving directions.',
      useCase: 'Best for: clinic address, retail store branches, workshop drop-off points.',
      tip: 'Tapping opens Google Maps / Apple Maps navigation instantly.'
    };
  }

  return {
    name: 'Text Message Block',
    tagline: 'Standard WhatsApp Formatted Message',
    badge: 'Native Message',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Sends WhatsApp text with support for bold (*text*), italics (_text_), emojis, and personalized dynamic tags like {STAT_NAME}.',
    useCase: 'Best for: greetings, explanations, terms of service, and direct responses.',
    tip: 'Keep messages concise and split longer content into multiple cards.'
  };
};

export const WorkflowBuilderView: React.FC = () => {
  const {
    addToast,
    setActiveTab,
    saveWorkflow,
    activeWorkflowId,
    activeWorkflowTitle,
    activeWorkflowGroups,
    deleteWorkflow,
    templates,
    metaConfig,
    keywordRules,
    workingHours,
    outsideHoursMessage,
    toggleKeywordRule,
    deleteKeywordRule,
    addKeywordRule,
    updateKeywordRule,
    addKeywordToRule,
    removeKeywordFromRule,
    toggleWorkingDay,
    updateWorkingDayTime,
    setOutsideHoursMessage,
    saveWorkingHoursConfig,
    saveAllKeywordRules,
    syncAutomationRules,
    workflows,
    setActiveWorkflowId,
    setActiveWorkflowTitle,
    setActiveWorkflowGroups,
  } = useQiyamStore();

  // Top Mode Switcher: 'canvas' | 'keyword_rules'
  const [activeMode, setActiveMode] = useState<'canvas' | 'keyword_rules'>('canvas');

  // Subheader Toggles
  const [staticVariables, setStaticVariables] = useState(true);
  const [globalVariables, setGlobalVariables] = useState(false);
  const [autosave, setAutosave] = useState(true);

  // Info Modal State for Static / Global variables
  const [activeInfoModal, setActiveInfoModal] = useState<'static' | 'global' | null>(null);

  // Block Library Sidebar Collapse / Expand state
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);

  // Accordion category collapse inside Block Library
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Zoom Level
  const [zoom, setZoom] = useState(1);

  // Full Screen Studio Mode State
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch {}
      addToast('Entered Full Screen Studio mode (Press Esc to exit)', 'info');
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
      addToast('Exited Full Screen mode', 'info');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {}
      } else if (
        (e.key === 'f' || e.key === 'F') &&
        !isTyping &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        toggleFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Bot Title
  const [botTitle, setBotTitle] = useState('Inbound Welcome & Service Flow');
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
  const [mediaSourceTab, setMediaSourceTab] = useState<'upload' | 'url'>('upload');
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Quick One-Click Media Presets
  const MEDIA_PRESETS = [
    {
      name: 'AC Inspection Photo',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      caption: '📷 Multi-point diagnostic check & service inspection overview',
      fileName: 'ac-inspection.jpg',
    },
    {
      name: 'Offer Banner',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      caption: '🖼️ Festive Discount Banner - 20% Off Annual AMC',
      fileName: 'discount-banner.jpg',
    },
    {
      name: 'Service Catalog PDF',
      type: 'document' as const,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      caption: '📄 2026 Commercial AC Service & Maintenance Catalog',
      fileName: 'Qiyam-Service-Catalog-2026.pdf',
      fileSize: '1.8 MB',
    },
    {
      name: 'Walkthrough Video MP4',
      type: 'video' as const,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      caption: '🎥 Demonstration of On-site Technician Diagnostic Routine',
      fileName: 'walkthrough.mp4',
    },
    {
      name: 'Support Voice Note MP3',
      type: 'audio' as const,
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      caption: '🎙️ Welcome Voice Note from Qiyam Support Lead',
      fileName: 'welcome-voice-note.mp3',
      fileSize: '350 KB',
    },
  ];

  // Helper to retrieve tied Inbound Keywords for each Canvas Group
  // Helper to retrieve tied Inbound Keywords for each Canvas Group
  const getGroupTriggerKeywords = (grp: FlowGroup, index: number): { keywords: string[]; ruleTitle?: string; isInitial: boolean } | null => {
    const grpTitleLower = (grp?.title || '').toLowerCase();
    const activeWfTitleLower = (activeWorkflowTitle || '').toLowerCase();

    // 1. Initial Node / Group 1 / Welcome Trigger
    if (index === 0 || grp.id === 'group-1' || grpTitleLower.includes('welcome') || grpTitleLower.includes('menu trigger')) {
      const matched = (keywordRules || []).find((r) => r.active && (
        (activeWfTitleLower && (r.workflow_name || '').toLowerCase() === activeWfTitleLower) ||
        (r.title || '').toLowerCase().includes('greeting') ||
        (r.title || '').toLowerCase().includes('welcome') ||
        (r.keywords || []).some((k) => String(k || '').toLowerCase() === 'hi')
      ));
      return {
        keywords: matched?.keywords || ['hi', 'hello', 'hey', 'start', 'greetings', 'menu'],
        ruleTitle: matched?.title || 'Inbound Greetings Trigger',
        isInitial: true,
      };
    }
    // 2. Booking / Reschedule Group
    if (grp.id === 'group-2' || grpTitleLower.includes('booking') || grpTitleLower.includes('reschedule')) {
      const matched = (keywordRules || []).find((r) => r.active && (
        (r.title || '').toLowerCase().includes('booking') ||
        (r.keywords || []).some((k) => String(k || '').toLowerCase().includes('book'))
      ));
      return {
        keywords: matched?.keywords || ['book', 'appointment', 'schedule', 'reschedule'],
        ruleTitle: matched?.title || 'Booking & Appointment Trigger',
        isInitial: false,
      };
    }
    // 3. Specialist Status & ETA Group
    if (grp.id === 'group-3' || grpTitleLower.includes('specialist') || grpTitleLower.includes('eta') || grpTitleLower.includes('status')) {
      const matched = (keywordRules || []).find((r) => r.active && (
        (r.title || '').toLowerCase().includes('specialist') ||
        (r.keywords || []).some((k) => ['track', 'technician', 'specialist', 'status', 'eta'].includes(String(k || '').toLowerCase()))
      ));
      return {
        keywords: matched?.keywords || ['track', 'technician', 'specialist', 'status', 'eta'],
        ruleTitle: matched?.title || 'Live Specialist Status & ETA',
        isInitial: false,
      };
    }
    // 4. Price Quotation Group
    if (grp.id === 'group-4' || grpTitleLower.includes('price') || grpTitleLower.includes('quotation')) {
      const matched = (keywordRules || []).find((r) => r.active && (
        (r.title || '').toLowerCase().includes('price') ||
        (r.keywords || []).some((k) => String(k || '').toLowerCase().includes('price'))
      ));
      return {
        keywords: matched?.keywords || ['price', 'rate', 'cost', 'quotation', 'pricing'],
        ruleTitle: matched?.title || 'Price List Auto-Reply',
        isInitial: false,
      };
    }
    // 5. Agent Handover Group
    if (grp.id === 'group-5' || grpTitleLower.includes('agent') || grpTitleLower.includes('handover') || grpTitleLower.includes('support')) {
      const matched = (keywordRules || []).find((r) => r.active && (
        (r.title || '').toLowerCase().includes('support') ||
        (r.keywords || []).some((k) => ['agent', 'human', 'support', 'help'].includes(String(k || '').toLowerCase()))
      ));
      return {
        keywords: matched?.keywords || ['agent', 'human', 'support', 'help'],
        ruleTitle: matched?.title || 'Live Support Desk Handover',
        isInitial: false,
      };
    }
    return null;
  };

  // Create Workflow / Template Tutorial Modal State
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isDeleteWorkflowModalOpen, setIsDeleteWorkflowModalOpen] = useState(false);
  const [isDeletingWorkflow, setIsDeletingWorkflow] = useState(false);

  // Interactive Tutorial Banner / HUD State
  const [showTutorialHud, setShowTutorialHud] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(1);

  // Test Bot Modal State
  const [isTestBotOpen, setIsTestBotOpen] = useState(false);
  const [testMessages, setTestMessages] = useState<
    Array<{
      sender: 'bot' | 'user';
      text: string;
      options?: string[];
      isPayment?: boolean;
      mediaUrl?: string;
      mediaType?: string;
      mediaFileName?: string;
    }>
  >([]);
  const [userChatInput, setUserChatInput] = useState('');
  const [currentStep, setCurrentStep] = useState<string>('group-1');
  const [simulatedVars, setSimulatedVars] = useState<Record<string, string>>({
    name: 'Ramesh Kumar',
    customer: 'Malabar Gold HQ',
    service: 'Inverter AC Servicing & Coil Wash',
    quote_no: 'QUO-2024-0037',
  });

  // Create New Rule Modal
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    title: '',
    keywords: '',
    reply: '',
    attachment: '',
    workflow_name: '',
  });

  // Edit Existing Rule Modal state
  const [editingRule, setEditingRule] = useState<KeywordRule | null>(null);

  // Search query for Keyword Rules
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');

  // Live Syncing spinner state
  const [isSyncing, setIsSyncing] = useState(false);

  // Edit Working Hour Day Time state
  const [editingDayTime, setEditingDayTime] = useState<{ day: string; time: string } | null>(null);

  // Working Hours Away Message local buffer
  const [awayMessage, setAwayMessage] = useState(outsideHoursMessage);
  useEffect(() => {
    setAwayMessage(outsideHoursMessage);
  }, [outsideHoursMessage]);

  // Inline Add Keyword state
  const [activeKeywordInputRuleId, setActiveKeywordInputRuleId] = useState<string | null>(null);
  const [inlineKeywordText, setInlineKeywordText] = useState('');

  // Initial Flow Groups (Defaults to the dynamic Service Booking / Welcome Flow with clean spacing)
  const [groups, setGroups] = useState<FlowGroup[]>(() => autoAdjustFlowGroupGaps(SERVICE_BOOKING_FLOW_GROUPS));

  // Automatically organize vertical gaps dynamically so cards and options never overlap
  const handleAutoAlignGaps = () => {
    setGroups((prev) => autoAdjustFlowGroupGaps(prev));
    addToast('Group layout & vertical gaps organized automatically!', 'success');
  };

  // Create New Workflow Modal State
  const [isCreateWorkflowModalOpen, setIsCreateWorkflowModalOpen] = useState(false);
  const [newWorkflowNameInput, setNewWorkflowNameInput] = useState('');
  const [newWorkflowTemplateChoice, setNewWorkflowTemplateChoice] = useState<
    'blank' | 'service_booking' | 'ecommerce' | 'university' | 'support_faq'
  >('blank');

  // Beginner Masterclass / Tutorial Guide Modal State
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [tutorialActiveTab, setTutorialActiveTab] = useState<'concepts' | 'steps' | 'tips'>('concepts');

  // Hover Tooltip Popover State for Block Library
  const [hoveredBlock, setHoveredBlock] = useState<{
    label: string;
    category: string;
    x: number;
    y: number;
  } | null>(null);

  // Open Create New Workflow Modal
  const handleOpenCreateNewWorkflowModal = () => {
    const nextIndex = (workflows?.length || 0) + 1;
    setNewWorkflowNameInput(`Custom Chatbot Journey #${nextIndex}`);
    setNewWorkflowTemplateChoice('blank');
    setIsCreateWorkflowModalOpen(true);
  };

  // Confirm and initialize new workflow
  const handleConfirmCreateNewWorkflow = async () => {
    const finalTitle = newWorkflowNameInput.trim() || `Custom WhatsApp Flow #${(workflows?.length || 0) + 1}`;

    // Safely auto-save the previous active workflow to database so work is never lost
    try {
      if (groups.length > 0 && botTitle) {
        await saveWorkflow({
          id: activeWorkflowId || undefined,
          name: botTitle,
          description: `Interactive WhatsApp bot flow with ${groups.length} node groups and configured elements.`,
          trigger_type: 'New WhatsApp Message',
          nodes: groups,
        });
      }
    } catch (err) {
      console.warn('Auto-save prior workflow notice:', err);
    }

    // Set new workflow identity
    setActiveWorkflowId(null);
    setActiveWorkflowTitle(finalTitle);
    setBotTitle(finalTitle);

    let starterGroups: FlowGroup[] = [];
    if (newWorkflowTemplateChoice === 'service_booking') {
      starterGroups = autoAdjustFlowGroupGaps(SERVICE_BOOKING_FLOW_GROUPS);
    } else if (newWorkflowTemplateChoice === 'ecommerce') {
      starterGroups = autoAdjustFlowGroupGaps([
        {
          id: 'group-1',
          title: 'Group #1 - Festival Catalog & Welcome',
          x: 40,
          y: 40,
          items: [
            {
              id: 'item-1-1',
              type: 'message',
              content: '🛍️ *Welcome to our WhatsApp Store!*\nHello {STAT_NAME}! What would you like to explore today?'
            },
            {
              id: 'item-1-2',
              type: 'choice',
              question: 'Choose an option:',
              options: [
                { label: '🔥 Best Sellers (50% Off)', targetGroup: 'group-2' },
                { label: '📦 Track My Order', targetGroup: 'group-3' },
                { label: '💬 Talk to Sales Team', targetGroup: 'group-4' }
              ]
            }
          ]
        },
        {
          id: 'group-2',
          title: 'Group #2 - Best Sellers & Advance Token',
          x: 440,
          y: 40,
          items: [
            {
              id: 'item-2-1',
              type: 'message',
              content: 'Trending festive items on sale! Pay a small ₹99 advance token to lock your deal.'
            },
            {
              id: 'item-2-2',
              type: 'payment',
              content: 'Deal Lock Token',
              provider: 'UPI',
              currency: 'INR',
              amount: 99,
              quantity: 1,
              varName: 'order_token',
              successTarget: 'group-5'
            }
          ]
        },
        {
          id: 'group-3',
          title: 'Group #3 - Order Tracking',
          x: 440,
          y: 380,
          items: [
            {
              id: 'item-3-1',
              type: 'message',
              content: '📦 Send your 6-digit Order ID to get live dispatch status and courier tracking.'
            }
          ]
        },
        {
          id: 'group-4',
          title: 'Group #4 - Support Handover',
          x: 440,
          y: 560,
          items: [
            {
              id: 'item-4-1',
              type: 'message',
              content: 'Connecting you with our retail team now. An agent will reply momentarily.'
            }
          ]
        },
        {
          id: 'group-5',
          title: 'Group #5 - Order Confirmed',
          x: 840,
          y: 40,
          items: [
            {
              id: 'item-5-1',
              type: 'message',
              content: '✅ Payment Received! Your order token is locked. Official receipt sent to your WhatsApp.'
            }
          ]
        }
      ]);
    } else if (newWorkflowTemplateChoice === 'university') {
      starterGroups = autoAdjustFlowGroupGaps([
        {
          id: 'group-1',
          title: 'Group #1 - Admissions Welcome',
          x: 40,
          y: 40,
          items: [
            {
              id: 'item-1-1',
              type: 'message',
              content: '🎓 Welcome to *University Admissions*! Please select your program level:'
            },
            {
              id: 'item-1-2',
              type: 'choice',
              question: 'Select Level:',
              options: [
                { label: '📘 Undergraduate (B.Tech / BBA)', targetGroup: 'group-2' },
                { label: '📗 Postgraduate (M.Tech / MBA)', targetGroup: 'group-2' },
                { label: '📞 Request Counselor Callback', targetGroup: 'group-3' }
              ]
            }
          ]
        },
        {
          id: 'group-2',
          title: 'Group #2 - Application Fee Payment',
          x: 440,
          y: 40,
          items: [
            {
              id: 'item-2-1',
              type: 'payment',
              content: 'Application Form Fee',
              provider: 'STRIPE',
              currency: 'INR',
              amount: 500,
              quantity: 1,
              varName: 'application_fee',
              buttonLabel: 'Pay Application Fee (₹500)',
              successTarget: 'group-4'
            }
          ]
        },
        {
          id: 'group-3',
          title: 'Group #3 - Counselor Callback',
          x: 440,
          y: 380,
          items: [
            {
              id: 'item-3-1',
              type: 'message',
              content: 'Our admissions counselor will call you within 30 minutes.'
            }
          ]
        },
        {
          id: 'group-4',
          title: 'Group #4 - Application Submitted',
          x: 840,
          y: 40,
          items: [
            {
              id: 'item-4-1',
              type: 'message',
              content: '🎉 Application Fee Paid! Your application number has been generated.'
            }
          ]
        }
      ]);
    } else if (newWorkflowTemplateChoice === 'support_faq') {
      starterGroups = autoAdjustFlowGroupGaps([
        {
          id: 'group-1',
          title: 'Group #1 - 24/7 Support Menu',
          x: 40,
          y: 40,
          items: [
            {
              id: 'item-1-1',
              type: 'message',
              content: '👋 Welcome to Customer Support. How can we help you right now?'
            },
            {
              id: 'item-1-2',
              type: 'choice',
              question: 'Choose assistance:',
              options: [
                { label: '❓ Instant Answers / FAQs', targetGroup: 'group-2' },
                { label: '🛠️ Report a Problem', targetGroup: 'group-3' },
                { label: '👨‍💼 Speak to Live Human Agent', targetGroup: 'group-4' }
              ]
            }
          ]
        },
        {
          id: 'group-2',
          title: 'Group #2 - Common FAQs',
          x: 440,
          y: 40,
          items: [
            {
              id: 'item-2-1',
              type: 'message',
              content: '📖 *Frequently Asked Questions:*\n1. Business Hours: 9 AM - 8 PM\n2. Service warranty: 30 days\n3. 100% money back guarantee.'
            }
          ]
        },
        {
          id: 'group-3',
          title: 'Group #3 - Ticket Created',
          x: 440,
          y: 320,
          items: [
            {
              id: 'item-3-1',
              type: 'message',
              content: 'Ticket #TK-9102 logged. A technician will review and reply within 15 minutes.'
            }
          ]
        },
        {
          id: 'group-4',
          title: 'Group #4 - Agent Handover',
          x: 440,
          y: 520,
          items: [
            {
              id: 'item-4-1',
              type: 'message',
              content: '🔔 Notification sent to live agent team. An agent is joining the chat.'
            }
          ]
        }
      ]);
    } else {
      // Clean Blank Initial Group
      starterGroups = [
        {
          id: 'group-1',
          title: 'Group #1 - Welcome & Trigger',
          x: 50,
          y: 50,
          items: [
            {
              id: 'item-1-1',
              type: 'message',
              content: `👋 *Welcome to our WhatsApp Service!*\nHello {STAT_NAME}! How can we assist you today?`
            },
            {
              id: 'item-1-2',
              type: 'choice',
              question: 'Please choose an option:',
              options: [
                { label: '1️⃣ Learn More', targetGroup: 'group-2' },
                { label: '2️⃣ Contact Support' }
              ]
            }
          ]
        }
      ];
    }

    setGroups(starterGroups);
    setSelectedGroupId(starterGroups[0]?.id || 'group-1');
    setActiveWorkflowGroups(starterGroups);
    setIsCreateWorkflowModalOpen(false);

    // Save initial version of the new workflow so it appears in Workflows list
    await saveWorkflow({
      name: finalTitle,
      description: `Interactive WhatsApp bot flow with ${starterGroups.length} node groups and configured elements.`,
      trigger_type: 'New WhatsApp Message',
      nodes: starterGroups,
    });

    addToast(`🎉 Initialized new workflow "${finalTitle}"!`, 'success');

    // Automatically open the friendly beginner masterclass guide
    setIsTutorialModalOpen(true);
  };

  // Active Selected Node & Drag-and-Drop state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>('group-1');
  const [draggingBlock, setDraggingBlock] = useState<{ blockTitle: string; category: string } | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

  // Load selected workflow from store if available
  useEffect(() => {
    if (activeWorkflowTitle) {
      setBotTitle(activeWorkflowTitle);
    }
    const safeGroups = normalizeToFlowGroups(activeWorkflowGroups, activeWorkflowTitle || 'Inbound Welcome & Service Flow');
    setGroups(safeGroups);
    if (safeGroups.length > 0) {
      setSelectedGroupId(safeGroups[0].id);
    }
  }, [activeWorkflowTitle, activeWorkflowGroups]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0] || null;

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

  // Quick-Jump Pill Bar Refs & State
  const jumpBarOuterRef = useRef<HTMLDivElement>(null);
  const jumpPillsRef = useRef<HTMLDivElement>(null);
  const [canScrollJumpLeft, setCanScrollJumpLeft] = useState(false);
  const [canScrollJumpRight, setCanScrollJumpRight] = useState(false);
  const [activeJumpGroupId, setActiveJumpGroupId] = useState<string | null>(null);

  const checkJumpPillsScroll = () => {
    const el = jumpPillsRef.current;
    if (!el) return;
    setCanScrollJumpLeft(el.scrollLeft > 4);
    setCanScrollJumpRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollJumpPills = (direction: 'left' | 'right') => {
    const el = jumpPillsRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -180 : 180;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkJumpPillsScroll, 200);
  };

  // Convert vertical mouse wheel scrolling into horizontal group pills scroll
  useEffect(() => {
    const outer = jumpBarOuterRef.current;
    const pills = jumpPillsRef.current;
    if (!outer || !pills) return;

    const onWheel = (e: WheelEvent) => {
      if (pills.scrollWidth > pills.clientWidth) {
        e.preventDefault();
        e.stopPropagation();
        const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        pills.scrollLeft += delta;
        checkJumpPillsScroll();
      }
    };

    outer.addEventListener('wheel', onWheel, { passive: false });
    pills.addEventListener('scroll', checkJumpPillsScroll, { passive: true });
    checkJumpPillsScroll();

    window.addEventListener('resize', checkJumpPillsScroll);

    return () => {
      outer.removeEventListener('wheel', onWheel);
      pills.removeEventListener('scroll', checkJumpPillsScroll);
      window.removeEventListener('resize', checkJumpPillsScroll);
    };
  }, [groups.length]);

  // Smooth jump to specific group
  const handleJumpToGroup = (grp: FlowGroup) => {
    if (!canvasRef.current) return;
    setActiveJumpGroupId(grp.id);
    setSelectedGroupId(grp.id);
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
    const newGrpId = `group-${Date.now()}`;
    const newGrp: FlowGroup = {
      id: newGrpId,
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
    setSelectedGroupId(newGrpId);
    addToast(`Added Group #${nextIdx} to canvas`, 'success');
  };

  // Helper to create appropriate GroupItem for a block
  const createBlockItem = (blockTitle: string, category: string): GroupItem => {
    const ts = Date.now();
    if (category === 'PAYMENTS') {
      return {
        id: `item-${ts}`,
        type: 'payment',
        content: `${blockTitle} Checkout`,
        provider: 'STRIPE',
        currency: 'INR',
        amount: 3999,
        quantity: 1,
        varName: 'payment_status',
      };
    }
    if (category === 'INPUTS') {
      const varMap: Record<string, string> = {
        Email: 'customer_email',
        Phone: 'phone_number',
        Date: 'appointment_date',
        Time: 'preferred_time',
        Website: 'website_url',
        Number: 'number_input',
        File: 'uploaded_document',
        Text: 'user_response',
      };
      return {
        id: `item-${ts}`,
        type: 'collect',
        varName: varMap[blockTitle] || (blockTitle || '').toLowerCase().replace(/\s+/g, '_'),
      };
    }
    if (category === 'CHOICES') {
      return {
        id: `item-${ts}`,
        type: 'choice',
        question: blockTitle === 'List Menu' ? 'Select from options list' : 'Choose an option',
        options: [
          { label: 'Option 1' },
          { label: 'Option 2' },
          ...(blockTitle === 'List Menu' ? [{ label: 'Option 3' }] : []),
        ],
      };
    }
    if (category === 'LOGIC') {
      if (blockTitle === 'Condition') {
        return {
          id: `item-${ts}`,
          type: 'choice',
          question: 'Branch Condition (If/Else Rule)',
          options: [{ label: 'Condition Met' }, { label: 'Fallback / Else' }],
        };
      }
      return {
        id: `item-${ts}`,
        type: 'message',
        content: '🤖 Chatbot Auto-Response: Process customer intent via AI model.',
      };
    }
    if (category === 'INTEGRATIONS') {
      return {
        id: `item-${ts}`,
        type: 'message',
        content: `⚡ ${blockTitle} Integration: Sync incoming data to external service.`,
      };
    }
    // MESSAGES
    if (blockTitle === 'Image') {
      return {
        id: `item-${ts}`,
        type: 'message',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        mediaCaption: 'AC Maintenance & Inspection Service Overview',
        mediaFileName: 'service-inspection.jpg',
        content: '📷 AC Maintenance & Inspection Service Overview',
      };
    }
    if (blockTitle === 'Video') {
      return {
        id: `item-${ts}`,
        type: 'message',
        mediaType: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        mediaCaption: 'Demonstration of technician on-site workflow',
        mediaFileName: 'workflow-walkthrough.mp4',
        content: '🎥 Service Walkthrough Video',
      };
    }
    if (blockTitle === 'YouTube') {
      return {
        id: `item-${ts}`,
        type: 'message',
        mediaType: 'video',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        mediaCaption: 'Watch our service introduction video on YouTube',
        content: '▶️ YouTube Video: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      };
    }
    if (blockTitle === 'Media') {
      return {
        id: `item-${ts}`,
        type: 'message',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
        mediaCaption: 'Special Festive Discount Banner (Save 20% on Annual AMC)',
        mediaFileName: 'promo-banner.jpg',
        content: '🖼️ Festive Discount Banner (Save 20% on Annual AMC)',
      };
    }
    if (blockTitle === 'File') {
      return {
        id: `item-${ts}`,
        type: 'message',
        mediaType: 'document',
        mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mediaFileName: 'Qiyam-Commercial-AC-Catalog.pdf',
        mediaFileSize: '1.4 MB',
        mediaCaption: 'Download our comprehensive 2026 Commercial Service Catalog',
        content: '📄 Document: Qiyam-Commercial-AC-Catalog.pdf (1.4 MB)',
      };
    }
    if (blockTitle === 'Audio') {
      return {
        id: `item-${ts}`,
        type: 'message',
        mediaType: 'audio',
        mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        mediaFileName: 'welcome-voice-note.mp3',
        mediaFileSize: '420 KB',
        mediaCaption: 'Welcome voice note from client support manager',
        content: '🎙️ Voice Note: welcome-voice-note.mp3',
      };
    }
    if (blockTitle === 'Location') {
      return {
        id: `item-${ts}`,
        type: 'message',
        mediaType: 'location',
        locationName: 'Qiyam Headquarters, Cyberpark Calicut',
        latitude: 11.2858,
        longitude: 75.8768,
        content: '📍 Location: Qiyam Headquarters, Cyberpark Calicut (11.2858° N, 75.8768° E)',
      };
    }
    return {
      id: `item-${ts}`,
      type: 'message',
      mediaType: 'text',
      content: 'New message block content. Click to configure message text.',
    };
  };

  // Add block to Group from Library (adds to currently selected node or target group)
  const handleAddBlockToGroup = (blockTitle: string, category: string, targetGroupId?: string) => {
    if (groups.length === 0) {
      handleAddGroup();
      return;
    }
    const targetId = targetGroupId || selectedGroupId || groups[0]?.id;
    const targetGroup = groups.find((g) => g.id === targetId) || groups[0];
    const newItem = createBlockItem(blockTitle, category);

    const updated = groups.map((g) =>
      g.id === targetGroup.id ? { ...g, items: [...(g.items || []), newItem] } : g
    );
    setGroups(autoAdjustFlowGroupGaps(updated));
    setSelectedGroupId(targetGroup.id);
    addToast(`Added "${blockTitle}" block to ${targetGroup.title}`, 'success');
  };

  // Reusable draggable block button renderer
  const renderBlockButton = (
    label: string,
    category: string,
    Icon: React.ComponentType<{ className?: string }>,
    colorScheme: 'emerald' | 'amber' | 'purple' | 'blue' = 'emerald',
    fullWidth: boolean = false
  ) => {
    const colorStyles = {
      emerald: 'hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700',
      amber: 'hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 text-slate-700',
      purple: 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 text-slate-700',
      blue: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 text-slate-700',
    }[colorScheme];

    return (
      <button
        key={`${category}-${label}`}
        type="button"
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('application/json', JSON.stringify({ blockTitle: label, category }));
          e.dataTransfer.effectAllowed = 'copy';
          setDraggingBlock({ blockTitle: label, category });
        }}
        onDragEnd={() => {
          setDraggingBlock(null);
          setDragOverGroupId(null);
        }}
        onClick={() => handleAddBlockToGroup(label, category)}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredBlock({
            label,
            category,
            x: rect.left,
            y: rect.top + rect.height / 2,
          });
        }}
        onMouseLeave={() => setHoveredBlock(null)}
        className={`${fullWidth ? 'w-full p-2.5' : 'p-2'} rounded-xl border border-slate-200 bg-white ${colorStyles} flex items-center gap-1.5 transition text-[11px] font-medium shadow-2xs cursor-grab active:cursor-grabbing select-none hover:shadow-md hover:scale-[1.02] active:scale-95 group/btn relative`}
        title={`Click to add to "${selectedGroup?.title || 'selected node'}", or Drag & Drop directly onto any node card`}
      >
        <Icon className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-emerald-600 shrink-0 transition-colors" />
        <span className="truncate flex-1 text-left">{label}</span>
        <Move className="w-2.5 h-2.5 text-slate-300 group-hover/btn:text-slate-400 shrink-0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
      </button>
    );
  };

  // Upload Media File from User's Device
  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !configModal) return;

    let detectedType: 'image' | 'video' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) detectedType = 'image';
    else if (file.type.startsWith('video/')) detectedType = 'video';
    else if (file.type.startsWith('audio/')) detectedType = 'audio';
    else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) detectedType = 'document';

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setConfigModal((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          draftItem: {
            ...prev.draftItem,
            mediaType: detectedType,
            mediaUrl: dataUrl,
            mediaFileName: file.name,
            mediaFileSize: sizeFormatted,
            mediaCaption: prev.draftItem.mediaCaption || cleanName,
            content:
              prev.draftItem.content && !prev.draftItem.content.includes('[Media File')
                ? prev.draftItem.content
                : cleanName,
          }
        };
      });
      addToast(`Attached "${file.name}" (${sizeFormatted})`, 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Open Configure Element Modal for any item
  const handleOpenConfigModal = (group: FlowGroup, item: GroupItem) => {
    const draft: GroupItem = JSON.parse(JSON.stringify(item));

    // Automatically infer mediaType if it was not explicitly saved
    if (draft.type === 'message' && !draft.mediaType) {
      const c = draft.content || '';
      if (c.includes('[Media File') || c.includes('[Image') || c.startsWith('📷') || c.startsWith('🖼️')) {
        draft.mediaType = 'image';
      } else if (c.includes('[Video') || c.includes('YouTube') || c.startsWith('🎥') || c.startsWith('▶️')) {
        draft.mediaType = 'video';
      } else if (c.includes('[Audio') || c.includes('Voice Note') || c.startsWith('🎙️')) {
        draft.mediaType = 'audio';
      } else if (c.includes('[Document') || c.includes('PDF') || c.startsWith('📄')) {
        draft.mediaType = 'document';
      } else if (c.includes('[Location') || c.startsWith('📍')) {
        draft.mediaType = 'location';
      } else {
        draft.mediaType = 'text';
      }
    }

    if (draft.mediaUrl?.startsWith('data:')) {
      setMediaSourceTab('upload');
    } else {
      setMediaSourceTab('url');
    }

    setConfigModal({
      isOpen: true,
      groupId: group.id,
      itemId: item.id,
      draftItem: draft,
      groupTitle: group.title,
    });
  };

  // Save Configured Element
  const handleSaveConfigModal = () => {
    if (!configModal) return;
    const { groupId, itemId, draftItem } = configModal;

    const finalItem: GroupItem = { ...draftItem };
    if (finalItem.type === 'message' && finalItem.mediaType && finalItem.mediaType !== 'text') {
      if (finalItem.mediaCaption) {
        finalItem.content = finalItem.mediaCaption;
      }
    }

    setGroups((prev) =>
      autoAdjustFlowGroupGaps(
        prev.map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            items: (g.items || []).map((it) => (it.id === itemId ? finalItem : it)),
          };
        })
      )
    );

    setConfigModal(null);
    addToast('Element configuration applied successfully!', 'success');
  };

  // Open Workflow in Interactive Canvas
  const handleOpenWorkflowInCanvas = (wfName: string) => {
    if (!wfName) return;
    const wfNameLower = wfName.toLowerCase().trim();

    const matchedWf = (workflows || []).find(
      (w) => (w?.name || '').toLowerCase().trim() === wfNameLower
    );

    let targetGroups: FlowGroup[] = [];

    if (matchedWf && matchedWf.nodes && Array.isArray(matchedWf.nodes)) {
      targetGroups = normalizeToFlowGroups(matchedWf.nodes, matchedWf.name);
    } else if (
      wfNameLower.includes('service') ||
      wfNameLower.includes('booking') ||
      wfNameLower.includes('welcome')
    ) {
      targetGroups = SERVICE_BOOKING_FLOW_GROUPS;
    } else if (wfNameLower.includes('price') || wfNameLower.includes('quotation')) {
      targetGroups = [
        {
          id: 'group-quo-1',
          title: 'Group #1 - Price Quotation Menu',
          x: 50,
          y: 60,
          items: [
            {
              id: 'item-quo-1',
              type: 'message',
              content: '💰 *Instant Price Quotation Generator*\nHello {STAT_NAME}! Select the service category below to view verified pricing or generate an immediate quote.'
            },
            {
              id: 'item-quo-2',
              type: 'choice',
              question: 'Choose your requirement:',
              options: [
                { label: '❄️ AC Servicing & Chemical Wash (₹799)', targetGroup: 'group-quo-2' },
                { label: '⚡ Gas Refill & Leakage Check (₹1,499)', targetGroup: 'group-quo-2' },
                { label: '🏢 Commercial AMC Packages', targetGroup: 'group-quo-3' },
                { label: '📄 Download Full PDF Rate Card', targetGroup: 'group-quo-4' }
              ]
            }
          ]
        },
        {
          id: 'group-quo-2',
          title: 'Group #2 - Quotation Summary & Book',
          x: 480,
          y: 60,
          items: [
            {
              id: 'item-quo-2-1',
              type: 'message',
              content: '✅ Selected Service: AC Maintenance\n💵 Standard Estimate: ₹799 + Taxes\n🕒 Estimated Duration: 60 Mins\n\nWould you like to book an appointment slot now?'
            },
            {
              id: 'item-quo-2-2',
              type: 'choice',
              options: [
                { label: 'Book Technician Slot', targetGroup: 'group-2' },
                { label: 'Talk to Representative', targetGroup: 'group-5' }
              ]
            }
          ]
        },
        {
          id: 'group-quo-3',
          title: 'Group #3 - Commercial AMC Inquiry',
          x: 480,
          y: 420,
          items: [
            {
              id: 'item-quo-3-1',
              type: 'message',
              content: '🏢 *Commercial Annual Maintenance Contract (AMC)*\nWe offer priority dispatch, preventive maintenance, and zero-callout charges for corporate offices and retail outlets.'
            }
          ]
        },
        {
          id: 'group-quo-4',
          title: 'Group #4 - Rate Card Delivery',
          x: 900,
          y: 60,
          items: [
            {
              id: 'item-quo-4-1',
              type: 'message',
              content: '📄 Sending complete 2026 Price Catalog & Tariff Card PDF right now!'
            }
          ]
        }
      ];
    } else {
      targetGroups = [
        {
          id: 'group-auto-1',
          title: `Group #1 - ${wfName}`,
          x: 80,
          y: 80,
          items: [
            {
              id: 'item-auto-1',
              type: 'message',
              content: `👋 Flow activated: *${wfName}*.\nHow can we help you?`
            }
          ]
        }
      ];
    }

    const adjustedGroups = autoAdjustFlowGroupGaps(targetGroups);
    setBotTitle(wfName);
    setGroups(adjustedGroups);
    if (adjustedGroups.length > 0) {
      setSelectedGroupId(adjustedGroups[0].id);
    }
    setActiveWorkflowTitle(wfName);
    if (matchedWf) {
      setActiveWorkflowId(matchedWf.id);
    }
    setActiveWorkflowGroups(adjustedGroups);
    setActiveMode('canvas');
    addToast(`⚡ Flow "${wfName}" opened in Interactive Canvas!`, 'success');
  };

  // Toggle Keyword Rule Active
  const handleToggleRule = async (id: string | number) => {
    await toggleKeywordRule(id);
  };

  // Delete Keyword Rule
  const handleDeleteRule = async (id: string | number) => {
    await deleteKeywordRule(id);
  };

  // Inline Add Keyword to Rule
  const handleAddKeywordToRule = async (ruleId: string | number) => {
    if (!inlineKeywordText.trim()) return;
    await addKeywordToRule(ruleId, inlineKeywordText.trim());
    setInlineKeywordText('');
    setActiveKeywordInputRuleId(null);
  };

  // Remove Keyword from Rule
  const handleRemoveKeyword = async (ruleId: string | number, kwToRemove: string) => {
    await removeKeywordFromRule(ruleId, kwToRemove);
  };

  // Update rule's assigned workflow
  const handleUpdateRuleWorkflow = async (ruleId: string | number, newWorkflowName: string) => {
    await updateKeywordRule(ruleId, {
      workflow_name: newWorkflowName || undefined,
      action_type: newWorkflowName ? 'workflow' : 'reply',
    });
    addToast(newWorkflowName ? `Linked to flow "${newWorkflowName}"` : 'Rule set to auto-reply only', 'info');
  };

  // Save edited rule from modal
  const handleSaveEditedRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    if (!editingRule.title.trim()) {
      addToast('Please provide a rule title', 'warning');
      return;
    }

    const hasWorkflow = Boolean(editingRule.workflow_name?.trim());
    if (!hasWorkflow && !editingRule.reply?.trim()) {
      addToast('Automated reply message is mandatory when Trigger Workflow is set to None (Auto-Reply Only)', 'warning');
      return;
    }

    const kwList = Array.isArray(editingRule.keywords)
      ? editingRule.keywords
      : String(editingRule.keywords).split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);

    await updateKeywordRule(editingRule.id, {
      title: editingRule.title.trim(),
      reply: editingRule.reply?.trim() || '',
      keywords: kwList,
      workflow_name: editingRule.workflow_name?.trim() || undefined,
      action_type: hasWorkflow ? 'workflow' : 'reply',
      attachment: editingRule.attachment?.trim() || undefined,
    });
    await saveAllKeywordRules();
    setEditingRule(null);
    addToast(`Rule "${editingRule.title}" updated successfully!`, 'success');
  };

  // Create New Rule Submit
  const handleCreateRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.title.trim() || !newRule.keywords.trim()) {
      addToast('Please fill in title and keywords', 'warning');
      return;
    }

    const hasWorkflow = Boolean(newRule.workflow_name?.trim());
    if (!hasWorkflow && !newRule.reply.trim()) {
      addToast('Automated reply message is mandatory when Trigger Workflow is set to None (Auto-Reply Only)', 'warning');
      return;
    }

    const kwList = newRule.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
    const created: Omit<KeywordRule, 'id'> = {
      title: newRule.title.trim(),
      triggered_count: 0,
      active: true,
      keywords: kwList,
      reply: newRule.reply.trim(),
      attachment: newRule.attachment.trim() || undefined,
      workflow_name: newRule.workflow_name.trim() || undefined,
      action_type: hasWorkflow ? 'workflow' : 'reply',
    };
    await addKeywordRule(created);
    await saveAllKeywordRules();
    setIsNewRuleModalOpen(false);
    setNewRule({ title: '', keywords: '', reply: '', attachment: '', workflow_name: '' });
    addToast('New keyword trigger rule created & saved successfully!', 'success');
  };

  // Toggle Working Hour day
  const handleToggleDay = (dayName: string) => {
    toggleWorkingDay(dayName);
  };

  // Apply Pre-built Template Flow
  const handleLoadTemplate = (templateType: 'university' | 'ac_service' | 'ecommerce' | 'blank' | 'service_booking') => {
    if (templateType === 'service_booking') {
      setGroups(autoAdjustFlowGroupGaps(SERVICE_BOOKING_FLOW_GROUPS));
      setBotTitle('Service Booking Flow');
      addToast('Official Service Booking flow loaded with 7 interactive node groups!', 'success');
    } else if (templateType === 'blank') {
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

  // Helper to replace workflow variables in bot text
  const replaceSimulatedVars = (rawText: string, vars: Record<string, string>) => {
    if (!rawText) return '';
    let result = rawText;
    Object.keys(vars).forEach((key) => {
      result = result.split(`{${key}}`).join(vars[key]);
      result = result.split(`{STAT_${key.toUpperCase()}}`).join(vars[key]);
    });
    // Dynamic Company Branding & Customer variables
    const companyDisplayName = metaConfig?.business_name || 'Qiyam Business Solutions';
    result = result.replace(/{COMPANY_NAME}|{company_name}|{{company_name}}/gi, companyDisplayName);
    result = result.replace(/{STAT_NAME}|{name}|{{name}}|{{customer_name}}/gi, vars.name || 'Rahul');
    result = result.replace(/{customer}|{customer_name}/gi, vars.customer || 'Customer');
    return result;
  };

  // Extract messages from any group for the test bot
  const getMessagesFromGroup = (
    grp: FlowGroup,
    vars: Record<string, string>
  ): Array<{
    sender: 'bot';
    text: string;
    options?: string[];
    isPayment?: boolean;
    mediaUrl?: string;
    mediaType?: string;
    mediaFileName?: string;
  }> => {
    const msgs: Array<{
      sender: 'bot';
      text: string;
      options?: string[];
      isPayment?: boolean;
      mediaUrl?: string;
      mediaType?: string;
      mediaFileName?: string;
    }> = [];
    if (!grp || !grp.items) return msgs;

    grp.items.forEach((item) => {
      if (item.type === 'message' && (item.content || item.mediaCaption || item.mediaUrl)) {
        msgs.push({
          sender: 'bot',
          text: replaceSimulatedVars(item.mediaCaption || item.content || '', vars),
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          mediaFileName: item.mediaFileName,
        });
      } else if (item.type === 'choice') {
        const questionText = replaceSimulatedVars(
          item.question || item.content || 'Please choose an option:',
          vars
        );
        const optionsList = (item.options || []).map((o) => o.label);
        msgs.push({
          sender: 'bot',
          text: questionText,
          options: optionsList.length > 0 ? optionsList : undefined,
        });
      } else if (item.type === 'payment') {
        const paymentText = replaceSimulatedVars(
          item.content || `Checkout Token: ₹${item.amount || 199} via ${item.provider || 'UPI'}`,
          vars
        );
        msgs.push({
          sender: 'bot',
          text: paymentText,
          isPayment: true,
          options: [
            `Pay ₹${item.amount || 199} via ${item.provider || 'UPI'}`,
            'Cancel'
          ],
        });
      }
    });

    return msgs;
  };

  // Launch or reset test bot simulator for the currently loaded workflow
  const handleOpenTestBot = () => {
    const initialVars = {
      name: 'Ramesh Kumar',
      customer: 'Malabar Gold HQ',
      service: 'Inverter AC Maintenance',
      quote_no: 'QUO-2024-0037',
    };
    setSimulatedVars(initialVars);

    const startGroup = groups[0];
    if (startGroup) {
      setCurrentStep(startGroup.id);
      const initialMsgs = getMessagesFromGroup(startGroup, initialVars);
      setTestMessages(
        initialMsgs.length > 0
          ? initialMsgs
          : [{ sender: 'bot', text: `Testing workflow: "${botTitle}". Hello! How can we assist you today?` }]
      );
    } else {
      setTestMessages([
        { sender: 'bot', text: `Flow "${botTitle}" has no groups yet. Add groups in the canvas to test.` }
      ]);
    }
    setIsTestBotOpen(true);
  };

  // Interactive Test Bot Handlers - Dynamically branches based on active flow groups
  const handleOptionClick = (opt: string) => {
    const nextMessages = [
      ...testMessages,
      { sender: 'user' as const, text: opt },
    ];
    const optLower = opt.toLowerCase().trim();

    // 1. Find current active group
    const currentGroup = groups.find((g) => g.id === currentStep) || groups[0];
    let nextTargetId: string | undefined = undefined;

    // Look for matched option in current group
    if (currentGroup && currentGroup.items) {
      for (const item of currentGroup.items) {
        if (item.type === 'choice' && Array.isArray(item.options)) {
          const matched = item.options.find(
            (o) =>
              (o.label || '').toLowerCase().trim() === optLower ||
              optLower.includes((o.label || '').toLowerCase().trim()) ||
              (o.label || '').toLowerCase().trim().includes(optLower)
          );
          if (matched && matched.targetGroup) {
            nextTargetId = matched.targetGroup;
            break;
          }
        }
        if (item.type === 'payment') {
          if (optLower.includes('pay') || optLower.includes('upi') || optLower.includes('stripe')) {
            if (item.successTarget) {
              nextTargetId = item.successTarget;
              break;
            }
          } else if (optLower.includes('cancel')) {
            if (item.failedTarget) {
              nextTargetId = item.failedTarget;
              break;
            }
          }
        }
      }
    }

    // 2. If not found in current group, search across all groups by title or clean label
    if (!nextTargetId) {
      const matchedGroup = groups.find(
        (g) =>
          (g.title || '').toLowerCase().includes(optLower) ||
          optLower.includes((g.title || '').toLowerCase().replace(/group\s*#?\d+\s*-?\s*/i, '').trim())
      );
      if (matchedGroup) {
        nextTargetId = matchedGroup.id;
      }
    }

    // 3. If target found, load that group's messages
    if (nextTargetId) {
      const nextTargetLower = (nextTargetId || '').toLowerCase();
      const targetGroup = groups.find(
        (g) => g.id === nextTargetId || (g.title || '').toLowerCase() === nextTargetLower
      );
      if (targetGroup) {
        setCurrentStep(targetGroup.id);
        const groupMsgs = getMessagesFromGroup(targetGroup, simulatedVars);
        if (groupMsgs.length > 0) {
          nextMessages.push(...groupMsgs);
        } else {
          nextMessages.push({
            sender: 'bot',
            text: `Navigated to ${targetGroup.title}.`,
          });
        }
        setTestMessages(nextMessages);
        return;
      }
    }

    // 4. Fallback for payment simulation or confirmation
    if (optLower.includes('pay') || optLower.includes('upi') || optLower.includes('stripe')) {
      nextMessages.push({
        sender: 'bot',
        text: '✅ Payment confirmation received! Your appointment is verified and recorded.',
      });
    } else if (optLower.includes('cancel')) {
      nextMessages.push({
        sender: 'bot',
        text: 'Action cancelled. How else can we assist you?',
      });
    } else {
      nextMessages.push({
        sender: 'bot',
        text: `Thank you! Your selection "${opt}" has been recorded. Processing your request...`,
      });
    }

    setTestMessages(nextMessages);
  };

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;
    const txt = userChatInput.trim();
    setUserChatInput('');

    const nextMessages = [
      ...testMessages,
      { sender: 'user' as const, text: txt },
    ];
    const txtLower = txt.toLowerCase();

    // Check if input matches any option in current group
    const currentGroup = groups.find((g) => g.id === currentStep) || groups[0];
    let matchedOptionLabel: string | null = null;

    if (currentGroup && currentGroup.items) {
      for (const item of currentGroup.items) {
        if (item.type === 'choice' && Array.isArray(item.options)) {
          // Check by number index (e.g. typing "1", "2", "3")
          const byIndex = parseInt(txt, 10);
          if (!isNaN(byIndex) && byIndex >= 1 && byIndex <= item.options.length) {
            matchedOptionLabel = item.options[byIndex - 1].label;
            break;
          }
          const matched = item.options.find(
            (o) =>
              (o.label || '').toLowerCase().includes(txtLower) ||
              txtLower.includes((o.label || '').toLowerCase())
          );
          if (matched) {
            matchedOptionLabel = matched.label;
            break;
          }
        }
        if (item.type === 'collect') {
          const varKey = item.varName || 'input';
          setSimulatedVars((prev) => ({ ...prev, [varKey]: txt }));
          nextMessages.push({
            sender: 'bot',
            text: `Noted: "${txt}". Recorded ${varKey}.`,
          });
          setTestMessages(nextMessages);
          return;
        }
      }
    }

    if (matchedOptionLabel) {
      handleOptionClick(matchedOptionLabel);
      return;
    }

    // Check keyword rules
    const matchedRule = (keywordRules || []).find((r) =>
      r.active && (r.keywords || []).some((k) => txtLower.includes(String(k || '').toLowerCase().trim()))
    );
    if (matchedRule) {
      if (matchedRule.workflow_name) {
        nextMessages.push({
          sender: 'bot',
          text: `⚡ *Workflow Triggered: [${matchedRule.workflow_name}]*\n\n${replaceSimulatedVars(matchedRule.reply, simulatedVars)}`,
        });
        const wfNameLower = (matchedRule.workflow_name || '').toLowerCase();
        if (wfNameLower.includes('booking') || wfNameLower.includes('service')) {
          const firstGroup = SERVICE_BOOKING_FLOW_GROUPS[0];
          if (firstGroup) {
            setCurrentStep(firstGroup.id);
            const extra = getMessagesFromGroup(firstGroup, simulatedVars);
            if (extra.length > 0) {
              nextMessages.push(...extra);
            }
          }
        }
      } else {
        nextMessages.push({
          sender: 'bot',
          text: replaceSimulatedVars(matchedRule.reply, simulatedVars),
        });
      }
      setTestMessages(nextMessages);
      return;
    }

    // General fallback acknowledgment
    nextMessages.push({
      sender: 'bot',
      text: `Got it: "${txt}". Our automated flow "${botTitle}" is processing your message.`,
    });
    setTestMessages(nextMessages);
  };

  // Helper function to dynamically calculate Bézier curve coordinates between nodes
  const renderDynamicConnections = () => {
    const paths: React.ReactElement[] = [];

    (groups || []).forEach((sourceGrp) => {
      (sourceGrp?.items || []).forEach((item, itemIdx) => {
        // Choice options routing
        if (item.type === 'choice' && Array.isArray(item.options)) {
          item.options.forEach((opt, optIdx) => {
            if (!opt.targetGroup) return;
            const targetGrp = groups.find(
              (g) => g.id === opt.targetGroup || (g.title || '').toLowerCase() === (opt.targetGroup || '').toLowerCase()
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
              (g) => g.id === item.successTarget || (g.title || '').toLowerCase() === (item.successTarget || '').toLowerCase()
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
              (g) => g.id === item.failedTarget || (g.title || '').toLowerCase() === (item.failedTarget || '').toLowerCase()
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
            (g) => g.id === item.targetGroup || (g.title || '').toLowerCase() === (item.targetGroup || '').toLowerCase()
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
    <div
      className={`flex flex-col bg-[#F8FAFC] overflow-hidden font-sans select-none transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen'
          : 'flex-1 h-full w-full max-w-full'
      }`}
    >
      {!isFullscreen && (
        <Header
          title="Workflow Builder"
          subtitle="Design interactive WhatsApp chatbot flows, visual group canvas, and keyword trigger rules."
          primaryActionLabel={activeMode === 'canvas' ? 'Create New Workflow' : 'Create Rule'}
          onPrimaryAction={activeMode === 'canvas' ? handleOpenCreateNewWorkflowModal : () => setIsNewRuleModalOpen(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* CAPSULE SWITCHER (FLOW BUILDER vs KEYWORD RULES)                          */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row gap-2.5 md:gap-0 items-stretch md:items-center justify-between shrink-0 shadow-xs z-20">
        {/* Two-Tab Segmented Capsule & Fullscreen Indicator */}
        <div className="flex items-center gap-3">
          {isFullscreen && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>STUDIO FULL SCREEN</span>
            </div>
          )}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveMode('canvas')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeMode === 'keyword_rules'
                  ? 'bg-[#0B3B2C] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Keyword Trigger Rules</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Full Screen, Templates & Go To Workflows */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 justify-end">
          {/* Beginner Guide Masterclass Button */}
          <button
            type="button"
            onClick={() => setIsTutorialModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            title="Interactive Beginner Guide & Workflow Masterclass"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Beginner Guide</span>
          </button>

          {/* Full Screen Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap shrink-0 border ${
              isFullscreen
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 ring-2 ring-amber-400/20'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
            title={isFullscreen ? 'Exit Full Screen Studio Mode (Esc)' : 'View in Full Screen Studio Mode (Press F)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-amber-600" />
                <span>Exit Full Screen</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-amber-300 rounded text-amber-800 shadow-2xs">Esc</kbd>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-emerald-600" />
                <span>Full Screen</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-500">F</kbd>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('automation-workflows')}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            title="View all saved workflows in workspace"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Workflows List</span>
          </button>

          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Templates</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              setIsSyncing(true);
              await syncAutomationRules();
              setIsSyncing(false);
            }}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            title="Synchronize triggers, workflows and working hours with server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
          </button>

          {activeMode === 'keyword_rules' ? (
            <button
              onClick={() => setIsNewRuleModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Rule</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateNewWorkflowModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              title="Create a new workflow journey"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Workflow</span>
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
          <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col lg:flex-row gap-2 lg:gap-0 items-stretch lg:items-center justify-between text-xs shrink-0 z-10">
            {/* Left: Chatbot Title & Variable Toggles */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-0.5">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180 cursor-pointer shrink-0" />
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
                    className="font-bold text-sm text-slate-900 cursor-pointer hover:text-emerald-700 transition flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none"
                    title="Click to rename workflow"
                  >
                    <span className="truncate">{botTitle}</span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                )}
              </div>

              {/* Static Variables Toggle (hidden on very small screens) */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-slate-600 font-medium text-xs">Static</span>
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal('static')}
                    className="p-1 rounded-full text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    title="What are Static Variables? Click for detailed scenarios"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setStaticVariables(!staticVariables)}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    staticVariables ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  title={staticVariables ? 'Static Variables Enabled' : 'Static Variables Disabled'}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      staticVariables ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Global Variables Toggle (hidden on very small screens) */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-slate-600 font-medium text-xs">Global</span>
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal('global')}
                    className="p-1 rounded-full text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    title="What are Global Variables? Click for detailed scenarios"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setGlobalVariables(!globalVariables)}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    globalVariables ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  title={globalVariables ? 'Global Variables Enabled' : 'Global Variables Disabled'}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      globalVariables ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right Group: Test Bot Button, Autosave, Undo/Redo, Real Save */}
            <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-4 overflow-x-auto scrollbar-none py-0.5">
              <button
                onClick={handleOpenTestBot}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition shadow-xs cursor-pointer active:scale-95 text-xs whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Test Bot</span>
              </button>

              <div className="hidden md:flex items-center gap-2 shrink-0">
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

              <div className="flex items-center gap-1 border-l border-slate-200 pl-2 shrink-0">
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

              {/* Quick Full Screen Studio Mode Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 shrink-0 ${
                  isFullscreen
                    ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent'
                }`}
                title={isFullscreen ? 'Exit Full Screen Studio (Esc)' : 'Expand to Full Screen Studio (F)'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-amber-700" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Dynamic Auto Spacing Button */}
              <button
                type="button"
                onClick={handleAutoAlignGaps}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 rounded-xl font-semibold text-xs shadow-xs transition cursor-pointer active:scale-95 shrink-0"
                title="Dynamically calculate vertical gaps between groups so options and buttons never overlap"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Auto Spacing</span>
              </button>

              {/* Delete Active Workflow Button */}
              {activeWorkflowId && (
                <button
                  type="button"
                  onClick={() => setIsDeleteWorkflowModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold shadow-xs transition cursor-pointer active:scale-95 shrink-0 text-xs"
                  title={`Delete workflow "${botTitle}"`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              {/* Real Save Workflow Button (persists to store and Workflows page) */}
              <button
                onClick={handleSaveWorkflowToStore}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-bold shadow-sm transition cursor-pointer active:scale-95 shrink-0"
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
                type="button"
                onClick={handleFitView}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition cursor-pointer"
                title="Fit All Nodes in View"
              >
                <Compass className="w-4 h-4" />
              </button>
              {/* Dynamic Auto Spacing Button */}
              <button
                type="button"
                onClick={handleAutoAlignGaps}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition cursor-pointer"
                title="Auto Spacing & Layout Alignment (Prevents Card Overlapping)"
              >
                <Sliders className="w-4 h-4 text-emerald-600" />
              </button>
              {/* Full Screen Mode Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                  isFullscreen
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-300'
                    : 'bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
                title={isFullscreen ? 'Exit Full Screen Studio (Esc)' : 'Full Screen Studio Mode (F)'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-amber-600" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Canvas Scrollable & Pannable Area */}
            <div
              ref={canvasRef}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                // If dropped on the canvas background (not on an existing group card)
                const isBackground = (e.target as HTMLElement).closest('.group-card') === null;
                if (isBackground && canvasRef.current) {
                  e.preventDefault();
                  const rect = canvasRef.current.getBoundingClientRect();
                  const dropX = Math.round((e.clientX - rect.left + canvasRef.current.scrollLeft) / zoom);
                  const dropY = Math.round((e.clientY - rect.top + canvasRef.current.scrollTop) / zoom);

                  let blockTitle = draggingBlock?.blockTitle || 'Text';
                  let category = draggingBlock?.category || 'MESSAGES';
                  try {
                    const rawData = e.dataTransfer.getData('application/json');
                    if (rawData) {
                      const data = JSON.parse(rawData);
                      if (data && data.blockTitle && data.category) {
                        blockTitle = data.blockTitle;
                        category = data.category;
                      }
                    }
                  } catch (err) {
                    console.error('Drop error:', err);
                  }

                  const newItem = createBlockItem(blockTitle, category);
                  const nextIdx = groups.length + 1;
                  const newGrpId = `group-${Date.now()}`;
                  const newGrp: FlowGroup = {
                    id: newGrpId,
                    title: `Group #${nextIdx}`,
                    x: Math.max(20, dropX - 150),
                    y: Math.max(20, dropY - 50),
                    items: [newItem],
                  };
                  setGroups((prev) => [...prev, newGrp]);
                  setSelectedGroupId(newGrpId);
                  setDraggingBlock(null);
                  setDragOverGroupId(null);
                  addToast(`Created Group #${nextIdx} with "${blockTitle}" at drop location`, 'success');
                }
              }}
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
                {groups.map((grp) => {
                  const isSelected = selectedGroupId === grp.id;
                  const isDragOver = dragOverGroupId === grp.id;

                  return (
                    <div
                      key={grp.id}
                      style={{
                        left: `${grp.x}px`,
                        top: `${grp.y}px`,
                        cursor: draggedGroupId === grp.id ? 'grabbing' : 'default',
                      }}
                      onClick={() => setSelectedGroupId(grp.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'copy';
                        if (dragOverGroupId !== grp.id) {
                          setDragOverGroupId(grp.id);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.stopPropagation();
                        if (dragOverGroupId === grp.id) {
                          setDragOverGroupId(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverGroupId(null);
                        setDraggingBlock(null);
                        try {
                          const rawData = e.dataTransfer.getData('application/json');
                          if (rawData) {
                            const data = JSON.parse(rawData);
                            if (data && data.blockTitle && data.category) {
                              handleAddBlockToGroup(data.blockTitle, data.category, grp.id);
                              setSelectedGroupId(grp.id);
                              return;
                            }
                          }
                        } catch (err) {
                          console.error('Drop error:', err);
                        }
                        if (draggingBlock) {
                          handleAddBlockToGroup(draggingBlock.blockTitle, draggingBlock.category, grp.id);
                          setSelectedGroupId(grp.id);
                        }
                      }}
                      className={`group-card absolute w-[300px] bg-white rounded-2xl border-2 transition-all z-10 flex flex-col ${
                        isDragOver
                          ? 'border-emerald-500 ring-4 ring-emerald-500/50 shadow-2xl scale-[1.02] bg-emerald-50/20'
                          : isSelected
                          ? 'border-emerald-500 ring-4 ring-emerald-400/30 shadow-xl'
                          : draggedGroupId === grp.id
                          ? 'border-emerald-600 shadow-2xl scale-[1.01]'
                          : 'border-slate-200/90 hover:border-emerald-300 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {/* Card Header (Drag Handle) */}
                      <div
                        onPointerDown={(e) => handlePointerDownGroup(e, grp.id)}
                        className={`p-3.5 border-b flex items-center justify-between rounded-t-2xl cursor-grab active:cursor-grabbing select-none transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-200'
                            : 'bg-slate-50/80 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Move className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className={`w-2 h-2 rounded-full transition-colors ${
                              isSelected ? 'bg-emerald-500 ring-2 ring-emerald-300' : 'bg-slate-300'
                            }`}
                          />
                          <span className="font-bold text-xs text-slate-800">{grp.title}</span>
                          {isSelected && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const remaining = groups.filter((g) => g.id !== grp.id);
                              setGroups(remaining);
                              if (selectedGroupId === grp.id) {
                                setSelectedGroupId(remaining[0]?.id || null);
                              }
                              addToast(`Deleted ${grp.title}`, 'info');
                            }}
                            className="hover:text-red-500 transition p-1 cursor-pointer"
                            title="Delete Group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Items */}
                      <div className="p-3.5 space-y-3 text-xs flex-1">
                        {/* INBOUND TRIGGER KEYWORD BADGE / BLOCK */}
                        {(() => {
                          const triggerInfo = getGroupTriggerKeywords(grp, groups.indexOf(grp));
                          if (!triggerInfo) return null;

                          if (triggerInfo.isInitial) {
                            return (
                              <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-amber-400/90 rounded-xl p-3 space-y-2 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
                                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-pulse" />
                                    <span>Trigger Keywords</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMode('keyword_rules');
                                    }}
                                    className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold bg-white/95 hover:bg-white border border-emerald-300 rounded-lg px-2 py-0.5 shadow-2xs flex items-center gap-1 cursor-pointer transition active:scale-95"
                                    title="Configure Trigger Keywords & Rules"
                                  >
                                    <span>Edit Triggers</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                </div>

                                <div className="text-[10px] text-slate-600 leading-snug">
                                  Incoming customer WhatsApp message matching any keyword below starts this flow:
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {triggerInfo.keywords.map((kw, kIdx) => (
                                    <span
                                      key={kIdx}
                                      className="inline-flex items-center gap-0.5 bg-white border border-amber-300 text-amber-950 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-2xs"
                                    >
                                      <span className="text-amber-500">#</span>
                                      <span>{kw}</span>
                                    </span>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between text-[9px] pt-1 border-t border-amber-200/50 text-slate-500">
                                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Webhook Active
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-400">{triggerInfo.ruleTitle}</span>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="bg-slate-50/90 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[10px] text-slate-600 shadow-2xs">
                                <div className="flex items-center gap-1.5 truncate">
                                  <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="font-semibold text-slate-700">Keywords:</span>
                                  <span className="font-mono text-emerald-700 truncate">
                                    {triggerInfo.keywords.slice(0, 3).join(', ')}{triggerInfo.keywords.length > 3 ? '...' : ''}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMode('keyword_rules');
                                  }}
                                  className="text-[9px] text-emerald-700 hover:underline font-bold shrink-0 ml-1 cursor-pointer"
                                >
                                  Rules
                                </button>
                              </div>
                            );
                          }
                        })()}

                        {(grp.items || []).map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGroupId(grp.id);
                              handleOpenConfigModal(grp, item);
                            }}
                            className="space-y-1.5 cursor-pointer group/item relative transition hover:opacity-95"
                            title="Click to Configure Element"
                          >
                            {/* Hover Badges: Configure & Delete */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition flex items-center gap-1 z-10">
                              <div className="bg-white/95 shadow-xs border border-slate-200 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-slate-600 flex items-center gap-1">
                                <Sliders className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Configure</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGroups((prev) =>
                                    autoAdjustFlowGroupGaps(
                                      prev.map((g) =>
                                        g.id === grp.id
                                          ? { ...g, items: (g.items || []).filter((it) => it.id !== item.id) }
                                          : g
                                      )
                                    )
                                  );
                                  addToast('Removed block from node', 'info');
                                }}
                                className="bg-white/95 shadow-xs border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md p-0.5 transition cursor-pointer"
                                title="Delete element"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Message / Media Item */}
                            {item.type === 'message' && (
                              <div className="bg-[#EAFBF3] border border-emerald-200/80 p-2.5 rounded-xl text-slate-800 space-y-1.5 hover:border-emerald-400 transition">
                                <div className="flex items-center justify-between text-[10px]">
                                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                    {item.mediaType === 'image' ? (
                                      <>
                                        <Image className="w-3 h-3 text-emerald-600" />
                                        <span>Image / Media</span>
                                      </>
                                    ) : item.mediaType === 'video' ? (
                                      <>
                                        <Video className="w-3 h-3 text-sky-600" />
                                        <span>Video Attachment</span>
                                      </>
                                    ) : item.mediaType === 'audio' ? (
                                      <>
                                        <Music className="w-3 h-3 text-purple-600" />
                                        <span>Voice Note</span>
                                      </>
                                    ) : item.mediaType === 'document' ? (
                                      <>
                                        <FileText className="w-3 h-3 text-amber-600" />
                                        <span>Document / File</span>
                                      </>
                                    ) : item.mediaType === 'location' ? (
                                      <>
                                        <MapPin className="w-3 h-3 text-rose-600" />
                                        <span>Location Pin</span>
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                                        <span>Message</span>
                                      </>
                                    )}
                                  </div>
                                  {item.mediaUrl && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.2 rounded border border-emerald-300">
                                      Attached
                                    </span>
                                  )}
                                </div>

                                {/* Media Thumbnail on Card */}
                                {item.mediaType === 'image' && item.mediaUrl && (
                                  <div className="rounded-lg overflow-hidden border border-emerald-200/60 bg-white max-h-28">
                                    <img
                                      src={item.mediaUrl}
                                      alt={item.mediaFileName || 'Media Preview'}
                                      className="w-full h-20 object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}

                                {item.mediaType === 'video' && (
                                  <div className="flex items-center gap-1.5 p-1.5 bg-sky-50 border border-sky-200 rounded-lg text-[10px] text-sky-900">
                                    <Video className="w-3 h-3 text-sky-600 shrink-0" />
                                    <span className="truncate font-mono">{item.mediaFileName || item.mediaUrl || 'Video file'}</span>
                                  </div>
                                )}

                                {item.mediaType === 'document' && (
                                  <div className="flex items-center justify-between p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <FileText className="w-3 h-3 text-amber-700 shrink-0" />
                                      <span className="truncate font-semibold">{item.mediaFileName || 'Document.pdf'}</span>
                                    </div>
                                    {item.mediaFileSize && (
                                      <span className="text-[9px] font-mono text-amber-700 shrink-0 bg-amber-100/70 px-1 py-0.2 rounded">
                                        {item.mediaFileSize}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {item.mediaType === 'audio' && (
                                  <div className="flex items-center gap-1.5 p-1.5 bg-purple-50 border border-purple-200 rounded-lg text-[10px] text-purple-900">
                                    <Music className="w-3 h-3 text-purple-600 shrink-0" />
                                    <span className="truncate font-mono">{item.mediaFileName || 'Voice-note.mp3'}</span>
                                  </div>
                                )}

                                {item.mediaType === 'location' && (
                                  <div className="flex items-center gap-1.5 p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-900">
                                    <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                                    <span className="truncate font-semibold">{item.locationName || 'Branch Location'}</span>
                                  </div>
                                )}

                                <div className="text-[11px] leading-relaxed text-slate-700 font-medium">
                                  {item.mediaCaption || item.content}
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

                            {/* Payment Checkout Item */}
                            {item.type === 'payment' && (
                              <div className="bg-emerald-50/80 border-2 border-emerald-400 p-3 rounded-xl space-y-2.5 hover:border-emerald-600 transition">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px]">
                                    <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Payment: {item.provider || 'STRIPE'}</span>
                                  </div>
                                  <span className="bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                    {item.currency || 'INR'} {item.currency === 'USD' ? '$' : '₹'}{item.amount || 3999}
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

                        {/* Animated Drop Target Indicator when dragging over this card */}
                        {isDragOver && (
                          <div className="border-2 border-dashed border-emerald-500 bg-emerald-100/70 rounded-xl p-3 text-center text-emerald-800 font-bold text-xs animate-pulse flex items-center justify-center gap-2 transition-all">
                            <Plus className="w-4 h-4 text-emerald-600 animate-bounce" />
                            <span>Drop "{draggingBlock?.blockTitle || 'Block'}" to Add</span>
                          </div>
                        )}

                        {/* Selected Hint at bottom when active and not dragging */}
                        {!isDragOver && isSelected && (
                          <div className="pt-1 text-center">
                            <span className="text-[10px] text-emerald-600/80 font-medium inline-flex items-center gap-1 bg-emerald-50/60 border border-emerald-200/50 rounded-lg px-2 py-0.5">
                              <Plus className="w-2.5 h-2.5" /> Click block in sidebar to add here
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Floating Quick-Jump Pill Bar (Jump across nodes on the ends instantly with mouse wheel scroll!) */}
            <div
              ref={jumpBarOuterRef}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-1.5 text-xs no-pan max-w-[92vw] sm:max-w-2xl select-none"
              title="Quick Jump Bar: Scroll with mouse wheel or click arrows to navigate groups"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 pr-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Jump:</span>
              </span>

              {/* Scroll Left Button */}
              {canScrollJumpLeft && (
                <button
                  type="button"
                  onClick={() => scrollJumpPills('left')}
                  className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
                  title="Scroll groups left (or scroll mouse wheel)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Scrollable Group Pills Container */}
              <div
                ref={jumpPillsRef}
                className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 scrollbar-track-slate-100/50 rounded-lg scroll-smooth"
              >
                {groups.map((grp) => (
                  <button
                    key={grp.id}
                    onClick={() => handleJumpToGroup(grp)}
                    className={`px-2.5 py-1 rounded-xl border text-[11px] font-medium transition shrink-0 cursor-pointer ${
                      activeJumpGroupId === grp.id
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold shadow-xs ring-1 ring-emerald-300'
                        : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border-slate-200 text-slate-700'
                    }`}
                    title={`Jump canvas to ${grp.title}`}
                  >
                    {grp.title}
                  </button>
                ))}
              </div>

              {/* Scroll Right Button */}
              {canScrollJumpRight && (
                <button
                  type="button"
                  onClick={() => scrollJumpPills('right')}
                  className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
                  title="Scroll groups right (or scroll mouse wheel)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Sidebar: BLOCK LIBRARY (Expandable & Minimizable) */}
            {!isLibraryOpen ? (
              /* Minimized Vertical Tab */
              <div
                onClick={() => setIsLibraryOpen(true)}
                className="w-10 bg-white border-l border-slate-200 hover:border-emerald-400 flex flex-col items-center py-4 gap-4 shrink-0 cursor-pointer shadow-xs transition-all hover:bg-emerald-50/40 z-10 select-none group"
                title="Expand Block Library"
              >
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 transition"
                  title="Expand Block Library"
                >
                  <PanelRightOpen className="w-4 h-4" />
                </button>
                <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold text-slate-600 group-hover:text-emerald-700 tracking-wider uppercase">
                  BLOCK LIBRARY
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-auto" />
              </div>
            ) : (
              /* Expanded Block Library */
              <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto font-sans text-xs z-10 no-pan transition-all">
                {/* Library Header */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsLibraryOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      title="Minimize Block Library (give canvas full width)"
                    >
                      <PanelRightClose className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="font-bold text-slate-800 tracking-wider text-[11px] uppercase">BLOCK LIBRARY</span>
                  </div>
                  <button
                    onClick={handleAddGroup}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                    title="Add a new group container to canvas"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Group</span>
                  </button>
                </div>

                {/* Active Target Node Indicator & Selector */}
                <div className="mx-3 mt-3 mb-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      Target Node:
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                      {selectedGroup ? selectedGroup.title : 'None Selected'}
                    </span>
                  </div>
                  {groups.length > 0 && (
                    <select
                      value={selectedGroupId || (groups[0]?.id || '')}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
                      title="Select target node to receive clicked blocks"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title} ({g.items?.length || 0} blocks)
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="text-[10px] text-slate-500 leading-tight">
                    💡 <span className="font-semibold text-slate-700">Click</span> to add to target, or <span className="font-semibold text-slate-700">Drag & Drop</span> onto any node card.
                  </div>
                </div>

                {/* Categorized Blocks List with Accordions */}
                <div className="p-3 space-y-3 overflow-y-auto">
                  {/* MESSAGES */}
                  <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => toggleCategory('MESSAGES')}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider mb-1.5 cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>MESSAGES</span>
                        <span className="text-[9px] font-semibold text-slate-400 bg-white px-1.5 py-0.2 rounded-full border border-slate-200">8</span>
                      </span>
                      {collapsedCategories['MESSAGES'] ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {!collapsedCategories['MESSAGES'] && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {[
                          { label: 'Text', icon: MessageSquare },
                          { label: 'Image', icon: Image },
                          { label: 'Video', icon: Video },
                          { label: 'YouTube', icon: Video },
                          { label: 'Media', icon: Layers },
                          { label: 'File', icon: FileText },
                          { label: 'Audio', icon: Music },
                          { label: 'Location', icon: MapPin },
                        ].map((b) => renderBlockButton(b.label, 'MESSAGES', b.icon, 'emerald'))}
                      </div>
                    )}
                  </div>

                  {/* CHOICES */}
                  <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => toggleCategory('CHOICES')}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider mb-1.5 cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>CHOICES</span>
                        <span className="text-[9px] font-semibold text-slate-400 bg-white px-1.5 py-0.2 rounded-full border border-slate-200">2</span>
                      </span>
                      {collapsedCategories['CHOICES'] ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {!collapsedCategories['CHOICES'] && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {[
                          { label: 'Quick Reply', icon: MessageSquare },
                          { label: 'List Menu', icon: List },
                        ].map((b) => renderBlockButton(b.label, 'CHOICES', b.icon, 'amber'))}
                      </div>
                    )}
                  </div>

                  {/* INPUTS */}
                  <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => toggleCategory('INPUTS')}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider mb-1.5 cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>INPUTS</span>
                        <span className="text-[9px] font-semibold text-slate-400 bg-white px-1.5 py-0.2 rounded-full border border-slate-200">8</span>
                      </span>
                      {collapsedCategories['INPUTS'] ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {!collapsedCategories['INPUTS'] && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {[
                          { label: 'Text', icon: MessageSquare },
                          { label: 'Number', icon: Layers },
                          { label: 'Email', icon: MessageSquare },
                          { label: 'Website', icon: ExternalLink },
                          { label: 'Date', icon: Calendar },
                          { label: 'Time', icon: Clock },
                          { label: 'Phone', icon: Smartphone },
                          { label: 'File', icon: FileText },
                        ].map((b) => renderBlockButton(b.label, 'INPUTS', b.icon, 'purple'))}
                      </div>
                    )}
                  </div>

                  {/* PAYMENTS */}
                  <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => toggleCategory('PAYMENTS')}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider mb-1.5 cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>PAYMENTS</span>
                        <span className="text-[9px] font-semibold text-slate-400 bg-white px-1.5 py-0.2 rounded-full border border-slate-200">1</span>
                      </span>
                      {collapsedCategories['PAYMENTS'] ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {!collapsedCategories['PAYMENTS'] && (
                      <div className="pt-1">
                        {renderBlockButton('Stripe Checkout', 'PAYMENTS', CreditCard, 'emerald', true)}
                      </div>
                    )}
                  </div>

                  {/* LOGIC */}
                  <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => toggleCategory('LOGIC')}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider mb-1.5 cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>LOGIC</span>
                        <span className="text-[9px] font-semibold text-slate-400 bg-white px-1.5 py-0.2 rounded-full border border-slate-200">2</span>
                      </span>
                      {collapsedCategories['LOGIC'] ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {!collapsedCategories['LOGIC'] && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {[
                          { label: 'Condition', icon: GitBranch },
                          { label: 'Chatbot', icon: Bot },
                        ].map((b) => renderBlockButton(b.label, 'LOGIC', b.icon, 'blue'))}
                      </div>
                    )}
                  </div>

                  {/* INTEGRATIONS */}
                  <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => toggleCategory('INTEGRATIONS')}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider mb-1.5 cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>INTEGRATIONS</span>
                        <span className="text-[9px] font-semibold text-slate-400 bg-white px-1.5 py-0.2 rounded-full border border-slate-200">6</span>
                      </span>
                      {collapsedCategories['INTEGRATIONS'] ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {!collapsedCategories['INTEGRATIONS'] && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {[
                          { label: 'Sheets', icon: FileText },
                          { label: 'Webhook', icon: Zap },
                          { label: 'Email', icon: MessageSquare },
                          { label: 'Zapier', icon: Zap },
                          { label: 'Make.com', icon: Sparkles },
                          { label: 'Pabbly', icon: Layers },
                        ].map((b) => renderBlockButton(b.label, 'INTEGRATIONS', b.icon, 'emerald'))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: REDESIGNED KEYWORD TRIGGER RULES & WORKING HOURS                  */}
      {/* ========================================================================= */}
      {activeMode === 'keyword_rules' && (
        <KeywordTriggerRulesView
          onOpenWorkflowInCanvas={handleOpenWorkflowInCanvas}
          onOpenTestSimulator={(kw) => {
            if (kw) setUserChatInput(kw);
            handleOpenTestBot();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* CONFIGURE ELEMENT MODAL (Matches screenshots media_1789380608034 & 1789380618719) */}
      {/* ========================================================================= */}
      {configModal && (
        <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setConfigModal(null)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 flex flex-col max-h-[92dvh]">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
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
                        currency: newType === 'payment' ? 'INR' : undefined,
                        amount: newType === 'payment' ? 3999 : undefined,
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
                        value={configModal.draftItem.currency || 'INR'}
                        onChange={(e) =>
                          setConfigModal({
                            ...configModal,
                            draftItem: { ...configModal.draftItem, currency: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="AED">AED (د.إ)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Price Amount</label>
                      <input
                        type="number"
                        value={configModal.draftItem.amount || 3999}
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
              {/* MESSAGE / MEDIA ELEMENT CONFIG                                */}
              {/* ------------------------------------------------------------- */}
              {configModal.draftItem.type === 'message' && (
                <div className="space-y-4">
                  {/* Media Format / Type Selector */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Message Format & Media Type
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {[
                        { type: 'text', label: 'Text Only', icon: MessageSquare },
                        { type: 'image', label: 'Image', icon: Image },
                        { type: 'video', label: 'Video', icon: Video },
                        { type: 'audio', label: 'Audio', icon: Music },
                        { type: 'document', label: 'Document', icon: FileText },
                        { type: 'location', label: 'Location', icon: MapPin },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSelected =
                          (configModal.draftItem.mediaType || 'text') === m.type;
                        return (
                          <button
                            key={m.type}
                            type="button"
                            onClick={() => {
                              setConfigModal({
                                ...configModal,
                                draftItem: {
                                  ...configModal.draftItem,
                                  mediaType: m.type as any,
                                  mediaCaption:
                                    configModal.draftItem.mediaCaption ||
                                    (m.type !== 'text' ? configModal.draftItem.content : ''),
                                }
                              });
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-semibold transition cursor-pointer gap-1 ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/20'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="truncate">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MEDIA FILE UPLOAD & URL CONTROLS */}
                  {configModal.draftItem.mediaType &&
                    ['image', 'video', 'audio', 'document'].includes(
                      configModal.draftItem.mediaType
                    ) && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        {/* Source Mode Switcher: Upload File vs Web URL */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Media Source & File Attachment</span>
                          </span>
                          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold">
                            <button
                              type="button"
                              onClick={() => setMediaSourceTab('upload')}
                              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                                mediaSourceTab === 'upload'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload File</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMediaSourceTab('url')}
                              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                                mediaSourceTab === 'url'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Media URL</span>
                            </button>
                          </div>
                        </div>

                        {/* TAB 1: UPLOAD FILE */}
                        {mediaSourceTab === 'upload' && (
                          <div className="space-y-2.5">
                            <input
                              type="file"
                              ref={mediaFileInputRef}
                              onChange={handleMediaFileUpload}
                              accept={
                                configModal.draftItem.mediaType === 'image'
                                  ? 'image/*'
                                  : configModal.draftItem.mediaType === 'video'
                                  ? 'video/*'
                                  : configModal.draftItem.mediaType === 'audio'
                                  ? 'audio/*'
                                  : '.pdf,.doc,.docx,.xlsx,.ppt,.txt,application/pdf'
                              }
                              className="hidden"
                            />

                            <div
                              onClick={() => mediaFileInputRef.current?.click()}
                              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 bg-white text-center cursor-pointer transition hover:bg-emerald-50/20 group"
                            >
                              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                                <Upload className="w-4 h-4" />
                              </div>
                              <p className="font-bold text-slate-800 text-xs">
                                Click to browse or drag & drop {configModal.draftItem.mediaType}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Supports {configModal.draftItem.mediaType === 'image' ? 'JPG, PNG, WEBP, GIF' : configModal.draftItem.mediaType === 'video' ? 'MP4, WebM (Max 25MB)' : configModal.draftItem.mediaType === 'audio' ? 'MP3, OGG, WAV' : 'PDF, DOC, XLSX (Max 20MB)'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: MEDIA WEB URL */}
                        {mediaSourceTab === 'url' && (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-slate-700 font-semibold text-[11px] mb-1">
                                Media File Direct URL *
                              </label>
                              <div className="relative">
                                <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="url"
                                  placeholder="https://example.com/assets/media.jpg (or mp4, pdf, mp3)"
                                  value={configModal.draftItem.mediaUrl || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setConfigModal({
                                      ...configModal,
                                      draftItem: {
                                        ...configModal.draftItem,
                                        mediaUrl: val,
                                        mediaFileName: val.split('/').pop() || 'media_asset',
                                      }
                                    });
                                  }}
                                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800 font-mono"
                                />
                              </div>
                            </div>

                            {/* Preset Samples */}
                            <div>
                              <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                                Or pick a fast sample preset:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {MEDIA_PRESETS.filter(
                                  (p) => p.type === configModal.draftItem.mediaType
                                ).map((preset) => (
                                  <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => {
                                      setConfigModal({
                                        ...configModal,
                                        draftItem: {
                                          ...configModal.draftItem,
                                          mediaUrl: preset.url,
                                          mediaCaption: preset.caption,
                                          mediaFileName: preset.fileName,
                                          mediaFileSize: preset.fileSize || 'Sample Asset',
                                          content: preset.caption,
                                        }
                                      });
                                      addToast(`Loaded preset "${preset.name}"`, 'success');
                                    }}
                                    className="px-2 py-0.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-md text-[10px] transition cursor-pointer"
                                  >
                                    + {preset.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* LIVE MEDIA PREVIEW & DETAILS */}
                        {configModal.draftItem.mediaUrl ? (
                          <div className="pt-2 border-t border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Attached Media Preview</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfigModal({
                                    ...configModal,
                                    draftItem: {
                                      ...configModal.draftItem,
                                      mediaUrl: undefined,
                                      mediaFileName: undefined,
                                      mediaFileSize: undefined,
                                    }
                                  });
                                  addToast('Removed media attachment', 'info');
                                }}
                                className="text-red-500 hover:text-red-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove Media</span>
                              </button>
                            </div>

                            {/* Image Preview */}
                            {configModal.draftItem.mediaType === 'image' && (
                              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white max-h-48 flex items-center justify-center">
                                <img
                                  src={configModal.draftItem.mediaUrl}
                                  alt="Media Attachment Preview"
                                  className="w-full max-h-44 object-contain"
                                />
                              </div>
                            )}

                            {/* Video Preview */}
                            {configModal.draftItem.mediaType === 'video' && (
                              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 max-h-48">
                                <video
                                  src={configModal.draftItem.mediaUrl}
                                  controls
                                  className="w-full max-h-44"
                                />
                              </div>
                            )}

                            {/* Audio Preview */}
                            {configModal.draftItem.mediaType === 'audio' && (
                              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-2">
                                  <Music className="w-3.5 h-3.5 text-purple-600" />
                                  <span>{configModal.draftItem.mediaFileName || 'Audio Track'}</span>
                                </div>
                                <audio
                                  src={configModal.draftItem.mediaUrl}
                                  controls
                                  className="w-full h-8"
                                />
                              </div>
                            )}

                            {/* Document Preview */}
                            {configModal.draftItem.mediaType === 'document' && (
                              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="truncate">
                                    <p className="font-bold text-slate-800 text-xs truncate">
                                      {configModal.draftItem.mediaFileName || 'Document.pdf'}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {configModal.draftItem.mediaFileSize || 'PDF Document'}
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href={configModal.draftItem.mediaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-[10px] font-semibold flex items-center gap-1 shrink-0 transition"
                                >
                                  <span>Open File</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}

                  {/* LOCATION PIN CONFIG */}
                  {configModal.draftItem.mediaType === 'location' && (
                    <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>WhatsApp Location Coordinates Pin</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold text-[11px] mb-1">
                          Location / Branch Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Qiyam Business Center, Cyberpark"
                          value={configModal.draftItem.locationName || ''}
                          onChange={(e) =>
                            setConfigModal({
                              ...configModal,
                              draftItem: {
                                ...configModal.draftItem,
                                locationName: e.target.value,
                                content: `📍 Location: ${e.target.value}`,
                              }
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-semibold text-[11px] mb-1">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={configModal.draftItem.latitude ?? 11.2858}
                            onChange={(e) =>
                              setConfigModal({
                                ...configModal,
                                draftItem: {
                                  ...configModal.draftItem,
                                  latitude: parseFloat(e.target.value),
                                }
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-semibold text-[11px] mb-1">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={configModal.draftItem.longitude ?? 75.8768}
                            onChange={(e) =>
                              setConfigModal({
                                ...configModal,
                                draftItem: {
                                  ...configModal.draftItem,
                                  longitude: parseFloat(e.target.value),
                                }
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setConfigModal({
                              ...configModal,
                              draftItem: {
                                ...configModal.draftItem,
                                locationName: 'Qiyam Headquarters, Calicut',
                                latitude: 11.2858,
                                longitude: 75.8768,
                                content: '📍 Location: Qiyam Headquarters, Cyberpark Calicut (11.2858° N, 75.8768° E)',
                              }
                            });
                            addToast('Loaded Calicut Cyberpark HQ coordinates', 'success');
                          }}
                          className="text-rose-700 hover:text-rose-900 font-semibold cursor-pointer underline"
                        >
                          Use HQ Location Preset
                        </button>
                        <a
                          href={`https://www.google.com/maps?q=${configModal.draftItem.latitude || 11.2858},${configModal.draftItem.longitude || 75.8768}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1"
                        >
                          <span>Preview on Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Message Content / Caption Textarea */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      {configModal.draftItem.mediaType &&
                      configModal.draftItem.mediaType !== 'text'
                        ? 'Caption / Accompanying Message *'
                        : 'Message Content *'}
                    </label>
                    <textarea
                      rows={3}
                      value={
                        configModal.draftItem.mediaCaption !== undefined &&
                        configModal.draftItem.mediaType !== 'text'
                          ? configModal.draftItem.mediaCaption
                          : configModal.draftItem.content || ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfigModal({
                          ...configModal,
                          draftItem: {
                            ...configModal.draftItem,
                            content: val,
                            mediaCaption: val,
                          }
                        });
                      }}
                      placeholder="Hi {name}! Welcome to QBS-360..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed text-xs"
                    />
                  </div>

                  {/* Insert Variable Buttons */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Insert Variable:</span>
                      {['{COMPANY_NAME}', '{STAT_NAME}', '{name}', '{phone}', '{service_name}', '{booking_id}'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            const cur = configModal.draftItem.mediaCaption || configModal.draftItem.content || '';
                            const next = cur + ' ' + v;
                            setConfigModal({
                              ...configModal,
                              draftItem: {
                                ...configModal.draftItem,
                                content: next,
                                mediaCaption: next,
                              }
                            });
                          }}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 text-[10px] font-mono font-semibold transition cursor-pointer"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      💡 <strong>{"{COMPANY_NAME}"}</strong> dynamically inserts your company name from Settings. <strong>{"{STAT_NAME}"}</strong> inserts the customer's WhatsApp name.
                    </p>
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
        <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsTemplatesModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 flex flex-col max-h-[92dvh]">
            <div className="p-4 sm:p-6 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base sm:text-lg">Workflow Templates & Interactive Tutorials</h3>
                <p className="text-[11px] sm:text-xs text-emerald-300">
                  Select a pre-engineered workflow to instantly understand and deploy automation
                </p>
              </div>
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs overflow-y-auto">
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
                    Includes full student onboarding: name confirmation, study abroad qualification, List Menu course selection, and ₹3,999 Stripe payment.
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
        <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsTestBotOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 flex flex-col max-h-[92dvh] h-[90vh] sm:h-[600px]">
            {/* Modal Header (WhatsApp style) */}
            <div className="p-3.5 sm:p-4 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">QBS-360 Test Bot</h3>
                  <div className="text-[11px] text-emerald-300">Live Simulator (Testing {botTitle})</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenTestBot}
                  title="Restart flow from beginning"
                  className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restart</span>
                </button>
                <button
                  onClick={() => setIsTestBotOpen(false)}
                  className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div
              className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#EFEAE2]"
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
                    {msg.mediaUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        {msg.mediaType === 'image' ? (
                          <img
                            src={msg.mediaUrl}
                            alt="media attachment"
                            className="w-full max-h-48 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : msg.mediaType === 'video' ? (
                          <video src={msg.mediaUrl} controls className="w-full max-h-48" />
                        ) : msg.mediaType === 'audio' ? (
                          <audio src={msg.mediaUrl} controls className="w-full h-8 p-1" />
                        ) : (
                          <div className="p-2.5 bg-amber-50 flex items-center gap-2 text-amber-900">
                            <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                            <span className="font-semibold text-[11px] truncate">
                              {msg.mediaFileName || 'Document.pdf'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.isPayment && (
                      <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-900 text-[11px]">
                          Secure Checkout Gateway: Stripe / UPI ₹3,999
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
              className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Type a message to test flow..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-bold shadow-xs transition cursor-pointer shrink-0"
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
        <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsNewRuleModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 max-h-[92dvh] flex flex-col">
            <div className="p-4 sm:p-5 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">Create Keyword Trigger Rule</h3>
                <p className="text-xs text-emerald-300">Auto-respond when incoming message matches keywords</p>
              </div>
              <button
                onClick={() => setIsNewRuleModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRuleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
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
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>⚡ Trigger Interactive Workflow</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {newRule.workflow_name ? 'Dynamic Canvas Flow' : 'Auto-Reply Mode'}
                  </span>
                </label>
                <select
                  value={newRule.workflow_name || ''}
                  onChange={(e) => setNewRule({ ...newRule, workflow_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="">None (Auto-Reply Only)</option>
                  <option value="Service Booking Flow">Service Booking Flow</option>
                  <option value="Inbound Welcome & Service Flow">Inbound Welcome & Service Flow</option>
                  <option value="Price Quotation Flow">Price Quotation Flow</option>
                  <option value="Live Specialist Status & ETA">Live Specialist Status & ETA</option>
                  <option value="Emergency Breakdown Service">Emergency Breakdown Service</option>
                  <option value="Human Support Escalation">Human Support Escalation</option>
                  {(workflows || [])
                    .filter(
                      (w) =>
                        ![
                          'Service Booking Flow',
                          'Inbound Welcome & Service Flow',
                          'Price Quotation Flow',
                          'Live Specialist Status & ETA',
                          'Emergency Breakdown Service',
                          'Human Support Escalation',
                        ].includes(w.name)
                    )
                    .map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {newRule.workflow_name ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Interactive workflow selected. It will execute dynamically from canvas nodes (automated reply below becomes optional).
                    </span>
                  ) : (
                    <span>
                      Selecting <strong>None</strong> requires an Automated Reply Message below.
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>
                    {newRule.workflow_name
                      ? 'Initial Reply Override (Optional)'
                      : 'Automated Reply Message *'}
                  </span>
                  {newRule.workflow_name && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                      Canvas Dynamic Execution
                    </span>
                  )}
                </label>
                <textarea
                  required={!newRule.workflow_name}
                  rows={4}
                  placeholder={
                    newRule.workflow_name
                      ? `✨ Leave empty to dynamically use initial message and options from "${newRule.workflow_name}" canvas nodes...`
                      : 'Hello! Here is our latest service catalog...'
                  }
                  value={newRule.reply}
                  onChange={(e) => setNewRule({ ...newRule, reply: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>Variables: {"{CUSTOMER_NAME}"}, {"{COMPANY_NAME}"}</span>
                  {newRule.workflow_name ? (
                    <span className="text-emerald-700 font-medium">Leave blank to use canvas nodes</span>
                  ) : (
                    <span className="text-amber-700 font-medium">* Required for auto-reply</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attachment (Optional File/PDF)</label>
                <input
                  type="text"
                  placeholder="e.g. Service-Rate-Catalog.pdf"
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

      {/* ========================================================================= */}
      {/* EDIT KEYWORD TRIGGER RULE MODAL                                           */}
      {/* ========================================================================= */}
      {editingRule && (
        <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setEditingRule(null)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 max-h-[92dvh] flex flex-col">
            <div className="p-4 sm:p-5 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">Edit Keyword Trigger Rule</h3>
                <p className="text-xs text-emerald-300">Modify triggers, assigned workflow & automated response</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedRule} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  value={editingRule.title}
                  onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>⚡ Trigger Workflow (When Keywords Match)</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {editingRule.workflow_name ? 'Dynamic Canvas Flow' : 'Auto-Reply Mode'}
                  </span>
                </label>
                <select
                  value={editingRule.workflow_name || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, workflow_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="">None (Auto-Reply Only)</option>
                  <option value="Service Booking Flow">Service Booking Flow</option>
                  <option value="Inbound Welcome & Service Flow">Inbound Welcome & Service Flow</option>
                  <option value="Price Quotation Flow">Price Quotation Flow</option>
                  <option value="Live Specialist Status & ETA">Live Specialist Status & ETA</option>
                  <option value="Emergency Breakdown Service">Emergency Breakdown Service</option>
                  <option value="Human Support Escalation">Human Support Escalation</option>
                  {(workflows || [])
                    .filter(
                      (w) =>
                        ![
                          'Service Booking Flow',
                          'Inbound Welcome & Service Flow',
                          'Price Quotation Flow',
                          'Live Specialist Status & ETA',
                          'Emergency Breakdown Service',
                          'Human Support Escalation',
                        ].includes(w.name)
                    )
                    .map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {editingRule.workflow_name ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Interactive workflow selected. When keywords match, this workflow executes dynamically from canvas nodes.
                    </span>
                  ) : (
                    <span>
                      Selecting <strong>None</strong> requires an Automated Reply Message below.
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Trigger Keywords (separated by comma) *
                </label>
                <input
                  type="text"
                  required
                  value={Array.isArray(editingRule.keywords) ? editingRule.keywords.join(', ') : editingRule.keywords}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      keywords: e.target.value.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>
                    {editingRule.workflow_name
                      ? 'Initial Reply Override (Optional)'
                      : 'Automated Reply Message *'}
                  </span>
                  {editingRule.workflow_name && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                      Canvas Dynamic Execution
                    </span>
                  )}
                </label>
                <textarea
                  required={!editingRule.workflow_name}
                  rows={4}
                  placeholder={
                    editingRule.workflow_name
                      ? `✨ Leave empty to dynamically use initial message and options from "${editingRule.workflow_name}" canvas nodes...`
                      : 'Enter automated WhatsApp response message...'
                  }
                  value={editingRule.reply || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, reply: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed text-xs"
                />
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>Variables: {"{CUSTOMER_NAME}"}, {"{COMPANY_NAME}"}</span>
                  {editingRule.workflow_name ? (
                    <span className="text-emerald-700 font-medium">Leave blank to use canvas nodes</span>
                  ) : (
                    <span className="text-amber-700 font-medium">* Required for auto-reply</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attachment (Optional File/PDF)</label>
                <input
                  type="text"
                  placeholder="e.g. Rate-Card-Catalog.pdf"
                  value={editingRule.attachment || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, attachment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATIC & GLOBAL VARIABLES INFO MODAL                                      */}
      {/* ========================================================================= */}
      {activeInfoModal && (
        <div
          className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveInfoModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    activeInfoModal === 'static'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  {activeInfoModal === 'static' ? (
                    <Layers className="w-5 h-5" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        activeInfoModal === 'static'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {activeInfoModal === 'static' ? 'Local Session Scope' : 'Workspace-Wide Scope'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">
                    {activeInfoModal === 'static'
                      ? 'Static Variables in Automation'
                      : 'Global Variables in Automation'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveInfoModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            {activeInfoModal === 'static' ? (
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                  <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>What is Static Mode?</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Static Variables</strong> are local memory slots bound strictly to this specific chatbot and a single customer's active chat session. They temporarily hold inputs collected from the user during the flow.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    📖 Real-World Business Scenario
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-[11px]">
                    <div className="font-semibold text-slate-800 font-sans">
                      Scenario: AC Repair Service Booking Flow
                    </div>
                    <div className="space-y-1 text-slate-600 pl-2 border-l-2 border-emerald-500">
                      <p><strong>1. Customer:</strong> "Hi, I need AC cleaning"</p>
                      <p><strong>2. Bot asks:</strong> "Which service?" &rarr; User selects "Jet Pump Cleaning"</p>
                      <p className="text-emerald-700 bg-emerald-50/80 p-1 rounded">
                        &rarr; Saved locally to: <code>service_type = 'Jet Pump Cleaning'</code>
                      </p>
                      <p><strong>3. Bot asks:</strong> "What time suits you?" &rarr; User replies "Tomorrow 10 AM"</p>
                      <p className="text-emerald-700 bg-emerald-50/80 p-1 rounded">
                        &rarr; Saved locally to: <code>preferred_time = 'Tomorrow 10 AM'</code>
                      </p>
                      <p><strong>4. Bot confirms:</strong> "Booking confirmed for Jet Pump Cleaning at Tomorrow 10 AM!"</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans italic pt-1">
                      💡 When the next customer chats 5 minutes later, their session starts fresh — customer data is completely isolated and never mixed!
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <h4 className="font-bold text-slate-900 text-xs">When to keep Static ON:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>When capturing customer details (Name, Address, Phone number).</li>
                    <li>When storing temporary booking dates, times, or selected menu choices.</li>
                    <li>When running multi-step questionnaire or qualification flows.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-purple-950 space-y-1">
                  <div className="font-bold text-xs flex items-center gap-1.5 text-purple-900">
                    <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>What is Global Mode?</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Global Variables</strong> are workspace-wide constants and shared parameters accessible across <em>all chatbots, workflows, trigger rules, and broadcast campaigns</em> simultaneously.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    📖 Real-World Business Scenario
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-[11px]">
                    <div className="font-semibold text-slate-800 font-sans">
                      Scenario: Seasonal Festival Discount Across 4 Different Chatbots
                    </div>
                    <div className="space-y-1 text-slate-600 pl-2 border-l-2 border-purple-500">
                      <p>You operate 4 active WhatsApp bots:</p>
                      <p>• Bot 1: Inbound Lead Generator</p>
                      <p>• Bot 2: Google / Instagram Ad Click-to-WhatsApp Flow</p>
                      <p>• Bot 3: Repeat Order & Re-engagement Bot</p>
                      <p>• Bot 4: Customer Support FAQ Bot</p>
                      <p className="text-purple-700 bg-purple-50/80 p-1.5 rounded">
                        Instead of editing coupon codes in all 4 bots manually, you define once:
                        <br />
                        <code>&#123;&#123;GLOBAL_DISCOUNT_CODE&#125;&#125; = 'FESTIVAL20'</code>
                        <br />
                        <code>&#123;&#123;GLOBAL_SUPPORT_HOTLINE&#125;&#125; = '+91 90746 40425'</code>
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans italic pt-1">
                      💡 When the festival ends, you update the code once in workspace settings. All 4 bots instantly update in real time with zero redeployments!
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <h4 className="font-bold text-slate-900 text-xs">When to keep Global ON:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>When referencing company brand info, office working hours, or hotline numbers.</li>
                    <li>When running seasonal sales, promo codes, or dynamic pricing.</li>
                    <li>When sharing centralized webhook endpoints or payment UPI links.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Current status:{' '}
                <span className="font-semibold text-slate-700">
                  {activeInfoModal === 'static'
                    ? staticVariables ? 'Enabled (Active)' : 'Disabled'
                    : globalVariables ? 'Enabled (Active)' : 'Disabled'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW TEMPLATES & AUTO-BUILDER MODAL                                   */}
      {/* ========================================================================= */}
      {isTemplatesModalOpen && (
        <div
          className="fixed inset-0 z-[75] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsTemplatesModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90dvh] font-sans animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0B3B2C] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Workflow Templates & Blueprints</h3>
                  <p className="text-xs text-emerald-200">
                    Auto-build chatbot flows from your WhatsApp templates or load starter blueprints
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Section 1: WhatsApp Templates Auto-Builder */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Auto-Build from WhatsApp Templates ({templates.length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTemplatesModalOpen(false);
                      setActiveTab('template-create');
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Template</span>
                  </button>
                </div>

                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {templates.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="p-3.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-2xl transition flex flex-col justify-between gap-2.5 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {tmpl.name}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                              {tmpl.meta_category || tmpl.category || 'UTILITY'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {tmpl.body_text || tmpl.body || 'No message text available'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400">
                            {tmpl.buttons?.length || 0} buttons • {Object.keys(tmpl.body_variables || {}).length} variables
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const result = generateWorkflowFromTemplate(tmpl);
                              setBotTitle(result.title);
                              setGroups(autoAdjustFlowGroupGaps(result.groups));
                              setIsTemplatesModalOpen(false);
                              addToast(
                                `⚡ Auto-generated workflow from "${tmpl.name}" with ${result.groups.length} node groups!`,
                                'success'
                              );
                            }}
                            className="px-3 py-1.5 bg-[#0B3B2C] group-hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 shadow-xs transition"
                          >
                            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                            <span>Auto-Build Flow</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500">
                    No WhatsApp templates found. Create one in Template Hub first!
                  </div>
                )}
              </div>

              {/* Section 2: Standard Starter Blueprints */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
                  Pre-Built Starter Blueprints
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => {
                      handleLoadTemplate('service_booking');
                      setIsTemplatesModalOpen(false);
                    }}
                    className="p-3.5 bg-emerald-50/50 border border-emerald-300 hover:border-emerald-600 rounded-2xl cursor-pointer hover:shadow-sm transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Service Booking Flow (QBS-360 Official)</span>
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">Active</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Official 7-group interactive flow: Inbound Welcome, Rescheduling, Technician Live ETA, Official Quotation, Agent Handover, Confirmation & Advance Payment.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      handleLoadTemplate('university');
                      setIsTemplatesModalOpen(false);
                    }}
                    className="p-3.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer hover:shadow-sm transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">Admissions & Stripe Flow</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">Stripe</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Multi-branch academic qualification with course selection and online card checkout.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      handleLoadTemplate('ac_service');
                      setIsTemplatesModalOpen(false);
                    }}
                    className="p-3.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer hover:shadow-sm transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">AC Repair & UPI Booking</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">UPI QR</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Service booking questionnaire with token advance payment via UPI QR.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      handleLoadTemplate('ecommerce');
                      setIsTemplatesModalOpen(false);
                    }}
                    className="p-3.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer hover:shadow-sm transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">E-Commerce Coupon Claim</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Marketing</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Promotional discount code dispenser and interactive catalog viewer.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      handleLoadTemplate('blank');
                      setIsTemplatesModalOpen(false);
                    }}
                    className="p-3.5 bg-white border border-dashed border-slate-300 hover:border-slate-500 rounded-2xl cursor-pointer hover:shadow-sm transition space-y-1"
                  >
                    <span className="font-bold text-slate-800 text-xs block">Blank Canvas</span>
                    <p className="text-[11px] text-slate-500">
                      Start fresh with a single welcome block to design custom automations from scratch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Active Workflow Confirmation Modal */}
      {isDeleteWorkflowModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !isDeletingWorkflow && setIsDeleteWorkflowModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Delete Workflow</h3>
                    <button
                      type="button"
                      disabled={isDeletingWorkflow}
                      onClick={() => setIsDeleteWorkflowModalOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to permanently delete <strong className="text-slate-900 font-semibold">"{botTitle}"</strong>?
                  </p>
                  <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 mt-3 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      This workflow will be permanently removed. The canvas will be cleared and you will be returned to the Workflows list.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeletingWorkflow}
                  onClick={() => setIsDeleteWorkflowModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingWorkflow}
                  onClick={async () => {
                    if (!activeWorkflowId) return;
                    setIsDeletingWorkflow(true);
                    try {
                      await deleteWorkflow(activeWorkflowId);
                      setIsDeleteWorkflowModalOpen(false);
                      setActiveTab('automation-workflows');
                    } catch (err) {
                      console.error('Failed to delete workflow:', err);
                    } finally {
                      setIsDeletingWorkflow(false);
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingWorkflow ? 'Deleting...' : 'Delete Workflow'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING HOVER TOOLTIP POPOVER (Block Library Info) */}
      {/* ========================================================================= */}
      {hoveredBlock && (() => {
        const knowledge = getBlockKnowledge(hoveredBlock.label, hoveredBlock.category);
        return (
          <div
            style={{
              top: Math.max(16, Math.min(window.innerHeight - 260, hoveredBlock.y - 90)),
              left: Math.max(16, hoveredBlock.x - 330),
            }}
            className="fixed z-[9999] w-80 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
          >
            <div className="bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">{knowledge.name}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${knowledge.badgeColor}`}>
                  {knowledge.badge}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-400">
                {knowledge.tagline}
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {knowledge.description}
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px]">
                <div className="text-amber-300 font-medium flex items-start gap-1.5 leading-snug">
                  <span className="shrink-0 font-bold">🎯</span>
                  <span>{knowledge.useCase}</span>
                </div>
                {knowledge.tip && (
                  <div className="text-slate-400 italic flex items-start gap-1.5 leading-snug">
                    <span className="shrink-0">💡</span>
                    <span>{knowledge.tip}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* CREATE NEW WORKFLOW MODAL */}
      {/* ========================================================================= */}
      {isCreateWorkflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Create New WhatsApp Flow</h3>
                    <p className="text-xs text-white/80">Launch a fresh automated conversational journey or start from a tested blueprint</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateWorkflowModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-700">
              {/* Safety Preservation Alert Banner */}
              <div className="p-4 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center gap-2">
                    <span>Work Safely Preserved</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-semibold">Auto-Saved</span>
                  </div>
                  <p className="text-emerald-800 mt-1 leading-relaxed">
                    Your current workflow <strong className="font-bold text-emerald-950">"{botTitle}"</strong> with <strong className="font-bold text-emerald-950">{groups.length} node groups</strong> has been safely saved to your workspace database.
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateWorkflowModalOpen(false);
                        setActiveTab('automation-workflows');
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-100/60 px-3 py-1.5 rounded-lg border border-emerald-300/70 shadow-2xs transition-all cursor-pointer"
                    >
                      <span>View in Workflows List</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] text-emerald-600">You can return to it anytime!</span>
                  </div>
                </div>
              </div>

              {/* Workflow Title Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  New Workflow Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkflowNameInput}
                  onChange={(e) => setNewWorkflowNameInput(e.target.value)}
                  placeholder="e.g., Festival Discount & Product Inquiries"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-800 transition"
                />
                <p className="text-[11px] text-slate-500">
                  This title will be displayed in your Workflows dashboard, analytics reports, and keyword trigger links.
                </p>
              </div>

              {/* Blueprint Choices */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Starting Blueprint
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">Click to select template</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Blank */}
                  <div
                    onClick={() => setNewWorkflowTemplateChoice('blank')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      newWorkflowTemplateChoice === 'blank'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">✨</span>
                        {newWorkflowTemplateChoice === 'blank' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Blank Canvas</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Start with a clean welcome message node and build your custom flow from scratch.
                      </p>
                    </div>
                    <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zero Bloat</span>
                  </div>

                  {/* Service Booking */}
                  <div
                    onClick={() => setNewWorkflowTemplateChoice('service_booking')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      newWorkflowTemplateChoice === 'service_booking'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">❄️</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">Recommended</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">AC & Home Service Booking</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        8 interactive groups with service catalog, date & time slot picker, and auto-reply.
                      </p>
                    </div>
                    <span className="mt-3 text-[10px] font-bold text-purple-600 uppercase tracking-wider">8 Groups • Ready</span>
                  </div>

                  {/* E-Commerce */}
                  <div
                    onClick={() => setNewWorkflowTemplateChoice('ecommerce')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      newWorkflowTemplateChoice === 'ecommerce'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">🛍️</span>
                        {newWorkflowTemplateChoice === 'ecommerce' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">E-Commerce & Flash Deals</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Product catalog showcase, UPI advance deal-locking token, and live order tracking.
                      </p>
                    </div>
                    <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payments Included</span>
                  </div>

                  {/* University */}
                  <div
                    onClick={() => setNewWorkflowTemplateChoice('university')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      newWorkflowTemplateChoice === 'university'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">🎓</span>
                        {newWorkflowTemplateChoice === 'university' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">School & College Admissions</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Degree course picker, prospectus PDF download, and counselor consultation booking.
                      </p>
                    </div>
                    <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lead Qualification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreateWorkflowModalOpen(false);
                  setIsTutorialModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Beginner Masterclass Guide</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateWorkflowModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreateNewWorkflow}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create & Open Flow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BEGINNER MASTERCLASS & TUTORIAL MODAL */}
      {/* ========================================================================= */}
      {isTutorialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center border border-indigo-400/30 shadow-inner">
                    <GraduationCap className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">WhatsApp Flow Builder Masterclass</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold">Zero Experience Needed</span>
                    </div>
                    <p className="text-xs text-slate-300">Master WhatsApp conversational design in 3 easy minutes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTutorialModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTutorialActiveTab('concepts')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    tutorialActiveTab === 'concepts'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>1. Core Concepts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTutorialActiveTab('steps')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    tutorialActiveTab === 'steps'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. 3-Minute Quickstart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTutorialActiveTab('tips')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    tutorialActiveTab === 'tips'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>3. Pro WhatsApp Tips</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-700 text-xs leading-relaxed">
              {tutorialActiveTab === 'concepts' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-blue-900">
                    <p className="font-semibold text-xs text-blue-950 mb-1">
                      💡 Think of your chatbot as a conversation boardgame:
                    </p>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Every box on your canvas is a <strong>Node Group</strong> (a stage in the conversation). Inside each group are <strong>Blocks</strong> (messages sent to the customer or questions asked). When customers click buttons, WhatsApp jumps to the connected node!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">1</div>
                        <span>Node Groups (Cards)</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Groups organize your chat steps. You can drag them around the canvas, and use the <strong>Auto-Align Gaps</strong> button anytime to give them neat, uncluttered spacing.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</div>
                        <span>Blocks (Elements)</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Choose from 6 block categories on the right: <strong>Messages</strong> (Text, Image, PDF, Video), <strong>Choices</strong> (Quick Reply, List Menu), <strong>Inputs</strong> (Date, Time, Phone), and <strong>Payments</strong>.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs">3</div>
                        <span>Connecting Paths</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Under each button or choice option, select the <strong>Target Node Group</strong>. When clicked in WhatsApp, the customer automatically moves forward along that path.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs">4</div>
                        <span>Dynamic Variables</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Personalize responses automatically by writing <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded font-mono">&#123;STAT_NAME&#125;</code> or <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded font-mono">&#123;STAT_PHONE&#125;</code> inside your messages!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {tutorialActiveTab === 'steps' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-1.5">
                    <span className="font-bold text-emerald-950 text-xs">Step 1: The Welcome Node (Group #1)</span>
                    <p className="text-[11px] text-emerald-800">
                      Add a Text Message with a friendly greeting and your brand name. Add a Quick Reply or List Menu choice block below it offering 2 to 3 clear options (e.g., "1️⃣ Book Service", "2️⃣ Track Specialist", "3️⃣ Quotation").
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 space-y-1.5">
                    <span className="font-bold text-blue-950 text-xs">Step 2: Collect User Details</span>
                    <p className="text-[11px] text-blue-800">
                      When the customer picks "Book Service", direct them to Group #2. Use the <strong>Date Picker</strong> and <strong>Time Slot</strong> blocks to capture their preferred appointment. WhatsApp will automatically save these to their session profile!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 space-y-1.5">
                    <span className="font-bold text-indigo-950 text-xs">Step 3: Test and Connect Keyword Trigger</span>
                    <p className="text-[11px] text-indigo-800">
                      Click the green <strong>Test Bot</strong> button at the top right to simulate your WhatsApp chatbot directly on screen! Once satisfied, switch to the <strong>Keyword Triggers</strong> tab to trigger this workflow when customers text keywords like "Hi", "Book", or "AC".
                    </p>
                  </div>
                </div>
              )}

              {tutorialActiveTab === 'tips' && (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span className="text-emerald-600">⚡</span>
                      <span>Meta's 3-Button Native Quick Reply Rule</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      WhatsApp Quick Reply buttons look great, but Meta allows a maximum of <strong>3 interactive buttons</strong> per single message. If you have 4 or more options, use the <strong>List Menu</strong> block instead (which supports up to 10 items!).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span className="text-emerald-600">⚡</span>
                      <span>The 24-Hour Customer Window</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      When a customer sends you a WhatsApp message, a 24-hour free service conversation window opens. Your chatbot can exchange unlimited text messages, images, PDFs, and flows for free during this session!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span className="text-emerald-600">⚡</span>
                      <span>Auto-Align Gaps for Clean Layout</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Whenever you add many blocks to a group, simply click the <strong>Auto-Align Gaps</strong> button in the bottom-left canvas toolbar. It dynamically calculates card heights and spaces groups cleanly with zero overlapping!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                You can reopen this guide anytime using the <span className="font-semibold text-slate-700">Beginner Guide</span> button.
              </span>
              <button
                type="button"
                onClick={() => setIsTutorialModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Got It, Let's Build!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

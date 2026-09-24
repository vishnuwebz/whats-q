import React, { useState, useEffect, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Crown,
  ShieldCheck,
  ShieldAlert,
  Server,
  Activity,
  Users,
  Building,
  Building2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Search,
  ExternalLink,
  Copy,
  Download,
  Zap,
  Smartphone,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle2,
  TrendingUp,
  Radio,
  Sliders,
  DollarSign,
  BarChart3,
  Layers,
  Settings,
  CreditCard,
  Wallet,
  Clock,
  Calendar,
  PhoneCall,
  UserCheck,
  Briefcase,
  ReceiptText,
  FileText,
  FileCheck,
  Bot,
  Sparkles,
  Puzzle,
  Database,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import { PlatformTenant, PlatformAuditLog, PlatformPlanTier, TenantSidebarModule, TenantFeatureConfig } from '@/types';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const ALL_SIDEBAR_MODULES: {
  id: TenantSidebarModule;
  label: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Executive Dashboard', description: 'System KPIs, revenue numbers & operational overview', category: 'Core', icon: BarChart3 },
  { id: 'conversations', label: 'WhatsApp Inbox', description: 'Live two-way WhatsApp chat & agent collision detection', category: 'Messenger', icon: MessageSquare },
  { id: 'messenger', label: 'Bulk Broadcasts', description: 'Bulk WhatsApp campaigns, recipient lists & scheduler', category: 'Messenger', icon: Send },
  { id: 'crm', label: 'CRM & Pipeline', description: 'Leads, customers, deals pipeline & follow-up scheduler', category: 'Sales', icon: UserCheck },
  { id: 'branches', label: 'Multi-Branch Management', description: 'Regional office locations, store branches & managers', category: 'Organization', icon: Building2 },
  { id: 'ops', label: 'Operations & Field Service', description: 'Work orders, bookings, technician roster, attendance & tasks', category: 'Operations', icon: Briefcase },
  { id: 'finance', label: 'Finance & Invoicing', description: 'GST invoices, quotations, expense ledger & payments', category: 'Finance', icon: IndianRupee },
  { id: 'automation', label: 'Workflow Automation', description: 'Visual drag-drop canvas & keyword trigger rules', category: 'Automation', icon: Zap },
  { id: 'ai', label: 'AI Copilot & Knowledge', description: 'RAG knowledge base, AI smart suggestions & templates', category: 'AI Assistant', icon: Bot },
  { id: 'analytics', label: 'Analytics & BI', description: 'Deep performance reports, charts & conversion trends', category: 'Intelligence', icon: TrendingUp },
  { id: 'integrations', label: 'Integrations & Webhooks', description: 'Meta Cloud API, REST webhook endpoints & connectors', category: 'Ecosystem', icon: Puzzle },
  { id: 'roles', label: 'Roles & Security (RBAC)', description: 'Granular permissions matrix & staff access policies', category: 'Security', icon: ShieldCheck },
  { id: 'settings-backup', label: 'Data Backup & Restore', description: 'Automated database backups & recovery snapshots', category: 'System', icon: Database },
  { id: 'settings', label: 'Workspace Settings', description: 'Company profile, branding, timezone & preferences', category: 'System', icon: Settings },
];

const INITIAL_TENANTS: PlatformTenant[] = [
  {
    id: 'TN2345',
    businessName: 'Qiyam Business Solutions',
    initials: 'QB',
    branch: 'HQ • Kozhikode',
    ownerName: 'Rahul Mehta',
    ownerEmail: 'rahul.mehta@coolfix.in',
    ownerPhone: '+91 94963 00233',
    tier: 'enterprise',
    amount: 14999,
    billingCycle: 'monthly',
    createdAt: '2026-01-10',
    lastPaymentDate: '2026-08-25',
    lastPaymentAmount: 14999,
    lastPaymentMethod: 'Razorpay UPI (pay_OP18294)',
    nextPaymentDueDate: '2026-10-01',
    paymentStatus: 'due_soon',
    metaWalletBalance: 4850,
    metaWalletCurrency: '₹',
    metaWalletStatus: 'healthy',
    metaDailyLimit: 100000,
    metaTier: 'Tier 3 (100k/day)',
    activeLicenses: 18,
    maxLicenses: 30,
    onlineStaffCount: 7,
    status: 'active',
    wabaStatus: 'connected',
    wabaPhone: '+91 73389 44799',
    wabaId: '1098915959329432',
    wabaQualityScore: 'HIGH',
    wabaLatencyMs: 38,
    lastWebhookPing: '14s ago',
    messagesSentThisMonth: 48920,
    monthlyMessageLimit: 100000,
    color: 'from-emerald-500 to-teal-600',
    features: {
      multiAccount: true,
      botBuilder: true,
      interactiveButtons: true,
      customBranding: true,
      aiAssistant: true,
      bulkCampaigns: true,
      voiceNotes: true,
      apiWebhooks: true,
    },
    sidebarModules: [
      'dashboard', 'conversations', 'messenger', 'crm', 'branches',
      'ops', 'finance', 'automation', 'ai', 'analytics', 'integrations',
      'roles', 'settings', 'settings-backup'
    ],
  },
  {
    id: 'TN2388',
    businessName: 'CoolFix Express',
    initials: 'CE',
    branch: 'Kochi Hub',
    ownerName: 'Sanjay Nair',
    ownerEmail: 'sanjay@coolfix.in',
    ownerPhone: '+91 98765 43211',
    tier: 'growth',
    amount: 5999,
    billingCycle: 'monthly',
    createdAt: '2026-03-14',
    lastPaymentDate: '2026-09-02',
    lastPaymentAmount: 5999,
    lastPaymentMethod: 'Bank Transfer NEFT',
    nextPaymentDueDate: '2026-10-02',
    paymentStatus: 'paid',
    metaWalletBalance: 1280,
    metaWalletCurrency: '₹',
    metaWalletStatus: 'healthy',
    metaDailyLimit: 10000,
    metaTier: 'Tier 2 (10k/day)',
    activeLicenses: 12,
    maxLicenses: 15,
    onlineStaffCount: 4,
    status: 'active',
    wabaStatus: 'connected',
    wabaPhone: '+91 98765 43211',
    wabaId: '1098915959329440',
    wabaQualityScore: 'HIGH',
    wabaLatencyMs: 42,
    lastWebhookPing: '32s ago',
    messagesSentThisMonth: 28400,
    monthlyMessageLimit: 50000,
    color: 'from-blue-500 to-cyan-600',
    features: {
      multiAccount: true,
      botBuilder: true,
      interactiveButtons: true,
      customBranding: false,
      aiAssistant: true,
      bulkCampaigns: true,
      voiceNotes: true,
      apiWebhooks: true,
    },
    sidebarModules: ['dashboard', 'conversations', 'crm', 'ops', 'finance', 'settings'],
  },
  {
    id: 'TN2401',
    businessName: 'CoolFix Enterprises',
    initials: 'CF',
    branch: 'Calicut Central',
    ownerName: 'Anoop Kumar',
    ownerEmail: 'anoop@coolfix.in',
    ownerPhone: '+91 98765 43212',
    tier: 'enterprise',
    amount: 14999,
    billingCycle: 'monthly',
    createdAt: '2026-02-01',
    lastPaymentDate: '2026-08-20',
    lastPaymentAmount: 14999,
    lastPaymentMethod: 'Credit Card (HDFC Corporate)',
    nextPaymentDueDate: '2026-09-20',
    paymentStatus: 'overdue',
    metaWalletBalance: 340,
    metaWalletCurrency: '₹',
    metaWalletStatus: 'low',
    metaDailyLimit: 100000,
    metaTier: 'Tier 3 (100k/day)',
    activeLicenses: 24,
    maxLicenses: 40,
    onlineStaffCount: 11,
    status: 'active',
    wabaStatus: 'connected',
    wabaPhone: '+91 98765 43212',
    wabaId: '1098915959329488',
    wabaQualityScore: 'HIGH',
    wabaLatencyMs: 40,
    lastWebhookPing: '8s ago',
    messagesSentThisMonth: 61200,
    monthlyMessageLimit: 100000,
    color: 'from-purple-500 to-indigo-600',
    features: {
      multiAccount: true,
      botBuilder: true,
      interactiveButtons: true,
      customBranding: true,
      aiAssistant: true,
      bulkCampaigns: true,
      voiceNotes: true,
      apiWebhooks: true,
    },
    sidebarModules: ['dashboard', 'conversations', 'messenger', 'crm', 'ops', 'finance', 'automation', 'roles', 'settings'],
  },
  {
    id: 'TN2455',
    businessName: 'CoolFix MEP Solutions',
    initials: 'MS',
    branch: 'Industrial Area',
    ownerName: 'Faisal Mohammed',
    ownerEmail: 'faisal@coolfixmep.com',
    ownerPhone: '+91 98765 43213',
    tier: 'starter',
    amount: 2499,
    billingCycle: 'monthly',
    createdAt: '2026-06-18',
    lastPaymentDate: '2026-08-30',
    lastPaymentAmount: 2499,
    lastPaymentMethod: 'Google Pay UPI',
    nextPaymentDueDate: '2026-09-30',
    paymentStatus: 'due_soon',
    metaWalletBalance: 90,
    metaWalletCurrency: '₹',
    metaWalletStatus: 'critical',
    metaDailyLimit: 1000,
    metaTier: 'Tier 1 (1k/day)',
    activeLicenses: 8,
    maxLicenses: 10,
    onlineStaffCount: 2,
    status: 'trial',
    wabaStatus: 'pending',
    wabaPhone: '+91 98765 43213',
    wabaId: '1098915959329501',
    wabaQualityScore: 'MEDIUM',
    wabaLatencyMs: 115,
    lastWebhookPing: '4m ago',
    messagesSentThisMonth: 6060,
    monthlyMessageLimit: 15000,
    color: 'from-amber-500 to-orange-600',
    features: {
      multiAccount: false,
      botBuilder: true,
      interactiveButtons: true,
      customBranding: false,
      aiAssistant: false,
      bulkCampaigns: true,
      voiceNotes: false,
      apiWebhooks: false,
    },
    sidebarModules: ['dashboard', 'conversations', 'crm', 'ops', 'settings'],
  },
];

const INITIAL_PLANS: PlatformPlanTier[] = [
  {
    id: 'plan_starter',
    name: 'Starter Tier',
    badge: 'Essential',
    monthlyPrice: 2499,
    annualPrice: 24990,
    currency: '₹',
    maxLicenses: 5,
    maxMessages: 15000,
    maxWabaNumbers: 1,
    features: [
      'Single WhatsApp Business API Line',
      'Up to 5 Team Agent Seats',
      '15,000 Outbound WhatsApp Messages/mo',
      'Keyword Auto-Replies & Triggers',
      'Core CRM & Customer Roster',
      'Basic Invoicing & Payments',
    ],
    popular: false,
  },
  {
    id: 'plan_growth',
    name: 'Growth Tier',
    badge: 'Popular',
    monthlyPrice: 5999,
    annualPrice: 59990,
    currency: '₹',
    maxLicenses: 15,
    maxMessages: 50000,
    maxWabaNumbers: 3,
    features: [
      'Up to 3 WhatsApp Business Numbers',
      'Up to 15 Team Agent Seats',
      '50,000 Outbound WhatsApp Messages/mo',
      'Field Service Jobs & Appointments',
      'Interactive Workflow Builder Canvas',
      'AI Knowledge Base & Copilot',
      'Voice Notes Transcription & Audio',
    ],
    popular: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise PRO',
    badge: 'Full Power',
    monthlyPrice: 14999,
    annualPrice: 149990,
    currency: '₹',
    maxLicenses: 50,
    maxMessages: 200000,
    maxWabaNumbers: 10,
    features: [
      'Unlimited WABA Phone Channels',
      'Up to 50 Dedicated Team Seats',
      '200,000+ Outbound Messages / mo',
      'Multi-Branch Organization Routing',
      'Full White-Label & Custom Branding',
      'Custom Sidebar Menu Provisioning',
      'REST Webhook API & External ERP Sync',
      '24/7 Dedicated Account Manager',
    ],
    popular: false,
  },
];

const INITIAL_AUDIT_LOGS: PlatformAuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2 mins ago',
    actor: 'Rahul Mehta',
    actorRole: 'Platform Super Admin',
    action: 'Configured custom sidebar navigation menu for "CoolFix Express" (TN2388)',
    targetTenant: 'CoolFix Express',
    severity: 'info',
    ipAddress: '103.248.112.44',
    details: 'Enabled 6 custom modules: Dashboard, Inbox, CRM, Operations, Finance, Settings.',
  },
  {
    id: 'log-02',
    timestamp: '18 mins ago',
    actor: 'Billing Engine',
    actorRole: 'Automated SaaS Ledger',
    action: 'Recorded subscription payment of ₹14,999 from Qiyam Business Solutions (TN2345)',
    targetTenant: 'Qiyam Business Solutions',
    severity: 'info',
    ipAddress: 'Razorpay Webhook (103.111.45.2)',
  },
  {
    id: 'log-03',
    timestamp: '45 mins ago',
    actor: 'Meta WABA Monitor',
    actorRole: 'Gateway Daemon',
    action: 'Low Meta Prepaid Wallet warning: CoolFix Enterprises balance at ₹340.00 (< ₹500)',
    targetTenant: 'CoolFix Enterprises',
    severity: 'warning',
    ipAddress: '31.13.88.35 (Meta Ireland)',
  },
  {
    id: 'log-04',
    timestamp: '2 hours ago',
    actor: 'Rahul Mehta',
    actorRole: 'Platform Super Admin',
    action: 'Topped up Meta Prepaid Wallet (+₹2,000) for CoolFix MEP Solutions',
    targetTenant: 'CoolFix MEP Solutions',
    severity: 'info',
    ipAddress: '103.248.112.44',
  },
  {
    id: 'log-05',
    timestamp: 'Yesterday',
    actor: 'Security Monitor',
    actorRole: 'Platform Firewall',
    action: 'System health check completed. All 4 client WABA webhooks verified and 100% operational.',
    targetTenant: 'Global Platform',
    severity: 'info',
    ipAddress: '127.0.0.1 (Localhost)',
  },
];

export const SuperAdminView: React.FC = () => {
  const { addToast } = useQiyamStore();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'clients' | 'sidebar_config' | 'meta_wallets' | 'plans' | 'audit' | 'settings'>('clients');

  // Multi-tenant state (persisted to localStorage)
  const [tenants, setTenants] = useState<PlatformTenant[]>(() => {
    try {
      const stored = localStorage.getItem('whatsq_platform_tenants');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TENANTS;
  });

  // Save helper with broadcast
  const saveTenants = (updated: PlatformTenant[]) => {
    setTenants(updated);
    try {
      localStorage.setItem('whatsq_platform_tenants', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('whatsq_tenants_updated', { detail: updated }));
    } catch (e) {
      console.error('Failed to persist tenants:', e);
    }
  };

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'enterprise' | 'growth' | 'starter'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'due_soon' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Expand / Collapse state for Top Metric KPI Cards (collapsed by default)
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(() => {
    try {
      return localStorage.getItem('whatsq_superadmin_metrics_expanded') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMetricsExpanded = () => {
    setIsMetricsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('whatsq_superadmin_metrics_expanded', String(next));
      } catch {}
      return next;
    });
  };

  // Modals state
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<PlatformTenant | null>(null);
  const [configuringSidebarTenant, setConfiguringSidebarTenant] = useState<PlatformTenant | null>(null);
  const [walletTopUpTenant, setWalletTopUpTenant] = useState<PlatformTenant | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(2000);
  const [recordPaymentTenant, setRecordPaymentTenant] = useState<PlatformTenant | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 14999,
    method: 'Razorpay UPI',
    reference: `pay_${Math.floor(100000 + Math.random() * 900000)}`,
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Diagnostics Modal state
  const [diagnosticsTenant, setDiagnosticsTenant] = useState<PlatformTenant | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(null);

  // Global Kill-Switch
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(() => {
    try {
      return localStorage.getItem('whatsq_emergency_kill_switch') === 'true';
    } catch {
      return false;
    }
  });

  const toggleEmergencyKillSwitch = () => {
    const next = !isKillSwitchActive;
    setIsKillSwitchActive(next);
    localStorage.setItem('whatsq_emergency_kill_switch', String(next));
    if (next) {
      addToast('🛑 EMERGENCY KILL-SWITCH: Outbound WhatsApp campaigns suspended globally!', 'error');
    } else {
      addToast('🟢 Outbound WhatsApp campaign engine resumed globally.', 'success');
    }
  };

  // Broadcast modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'info' | 'warning' | 'critical'>('info');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [auditSearch, setAuditSearch] = useState('');

  // New Tenant Form state
  const [newTenantForm, setNewTenantForm] = useState({
    businessName: '',
    branch: 'Calicut HQ',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    tier: 'growth' as 'starter' | 'growth' | 'enterprise',
    maxLicenses: 15,
    monthlyMessageLimit: 50000,
    wabaPhone: '',
    initialMetaBalance: 2000,
    selectedPreset: 'field_service' as 'field_service' | 'retail' | 'minimal' | 'full',
  });

  // KPI calculations
  const metrics = useMemo(() => {
    const totalClients = tenants.length;
    const activeClients = tenants.filter((t) => t.status === 'active').length;
    const trialClients = tenants.filter((t) => t.status === 'trial').length;
    const suspendedClients = tenants.filter((t) => t.status === 'suspended').length;

    const totalMRR = tenants.reduce((acc, t) => (t.status !== 'suspended' ? acc + (t.amount || 0) : acc), 0);
    const totalMetaWallets = tenants.reduce((acc, t) => acc + (t.metaWalletBalance || 0), 0);
    const lowWalletCount = tenants.filter((t) => (t.metaWalletBalance || 0) < 500).length;

    const totalLicensesAllocated = tenants.reduce((acc, t) => acc + (t.maxLicenses || 0), 0);
    const totalLicensesInUse = tenants.reduce((acc, t) => acc + (t.activeLicenses || 0), 0);
    const totalStaffOnline = tenants.reduce((acc, t) => acc + (t.onlineStaffCount || 0), 0);

    const totalMessagesThisMonth = tenants.reduce((acc, t) => acc + (t.messagesSentThisMonth || 0), 0);

    return {
      totalClients,
      activeClients,
      trialClients,
      suspendedClients,
      totalMRR,
      totalMetaWallets,
      lowWalletCount,
      totalLicensesAllocated,
      totalLicensesInUse,
      totalStaffOnline,
      totalMessagesThisMonth,
    };
  }, [tenants]);

  // Filtered clients
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      if (tierFilter !== 'all' && t.tier !== tierFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && t.paymentStatus !== paymentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = t.businessName.toLowerCase().includes(q);
        const matchId = t.id.toLowerCase().includes(q);
        const matchOwner = t.ownerName.toLowerCase().includes(q) || t.ownerEmail.toLowerCase().includes(q) || t.ownerPhone.includes(q);
        const matchBranch = (t.branch || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchOwner && !matchBranch) return false;
      }
      return true;
    });
  }, [tenants, tierFilter, statusFilter, paymentFilter, searchQuery]);

  // Handle Create Client
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantForm.businessName.trim() || !newTenantForm.ownerName.trim()) {
      addToast('Please provide a client business name and primary owner name', 'error');
      return;
    }

    const initials = newTenantForm.businessName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const priceMap = { starter: 2499, growth: 5999, enterprise: 14999 };
    const colors = [
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-violet-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
    ];
    const assignedColor = colors[tenants.length % colors.length];

    // Determine initial sidebar modules based on preset
    let initialModules: TenantSidebarModule[] = ['dashboard', 'conversations', 'crm', 'ops', 'finance', 'settings'];
    if (newTenantForm.selectedPreset === 'retail') {
      initialModules = ['dashboard', 'conversations', 'messenger', 'automation', 'finance', 'settings'];
    } else if (newTenantForm.selectedPreset === 'minimal') {
      initialModules = ['dashboard', 'conversations', 'settings'];
    } else if (newTenantForm.selectedPreset === 'full') {
      initialModules = [
        'dashboard', 'conversations', 'messenger', 'crm', 'branches',
        'ops', 'finance', 'automation', 'ai', 'analytics', 'integrations',
        'roles', 'settings', 'settings-backup'
      ];
    }

    const newTenant: PlatformTenant = {
      id: `TN${Math.floor(2500 + Math.random() * 900)}`,
      businessName: newTenantForm.businessName.trim(),
      initials,
      branch: newTenantForm.branch.trim() || 'Head Office',
      ownerName: newTenantForm.ownerName.trim(),
      ownerEmail: newTenantForm.ownerEmail.trim() || 'admin@workspace.com',
      ownerPhone: newTenantForm.ownerPhone.trim() || '+91 94963 00233',
      tier: newTenantForm.tier,
      amount: priceMap[newTenantForm.tier],
      billingCycle: 'monthly',
      createdAt: new Date().toISOString().split('T')[0],
      lastPaymentDate: new Date().toISOString().split('T')[0],
      lastPaymentAmount: priceMap[newTenantForm.tier],
      lastPaymentMethod: 'UPI / Direct Onboarding',
      nextPaymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: 'paid',
      metaWalletBalance: Number(newTenantForm.initialMetaBalance) || 2000,
      metaWalletCurrency: '₹',
      metaWalletStatus: (Number(newTenantForm.initialMetaBalance) || 2000) > 1000 ? 'healthy' : 'low',
      metaDailyLimit: newTenantForm.tier === 'starter' ? 1000 : newTenantForm.tier === 'growth' ? 10000 : 100000,
      metaTier: newTenantForm.tier === 'starter' ? 'Tier 1 (1k/day)' : newTenantForm.tier === 'growth' ? 'Tier 2 (10k/day)' : 'Tier 3 (100k/day)',
      activeLicenses: 1,
      maxLicenses: Number(newTenantForm.maxLicenses) || 10,
      onlineStaffCount: 1,
      status: 'active',
      wabaStatus: newTenantForm.wabaPhone ? 'connected' : 'pending',
      wabaPhone: newTenantForm.wabaPhone || undefined,
      wabaQualityScore: 'HIGH',
      wabaLatencyMs: 40,
      lastWebhookPing: 'Just now',
      messagesSentThisMonth: 0,
      monthlyMessageLimit: Number(newTenantForm.monthlyMessageLimit) || 50000,
      color: assignedColor,
      features: {
        multiAccount: newTenantForm.tier !== 'starter',
        botBuilder: true,
        interactiveButtons: true,
        customBranding: newTenantForm.tier === 'enterprise',
        aiAssistant: newTenantForm.tier !== 'starter',
        bulkCampaigns: true,
        voiceNotes: newTenantForm.tier !== 'starter',
        apiWebhooks: newTenantForm.tier === 'enterprise',
      },
      sidebarModules: initialModules,
    };

    const updated = [newTenant, ...tenants];
    saveTenants(updated);

    const newLog: PlatformAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Rahul Mehta',
      actorRole: 'Platform Super Admin',
      action: `Provisioned new client workspace "${newTenant.businessName}" (${newTenant.id}) with ₹${newTenant.metaWalletBalance} Meta balance`,
      targetTenant: newTenant.businessName,
      severity: 'info',
      ipAddress: '103.248.112.44',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    setIsCreateTenantOpen(false);
    setNewTenantForm({
      businessName: '',
      branch: 'Calicut HQ',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      tier: 'growth',
      maxLicenses: 15,
      monthlyMessageLimit: 50000,
      wabaPhone: '',
      initialMetaBalance: 2000,
      selectedPreset: 'field_service',
    });

    addToast(`Successfully onboarded client "${newTenant.businessName}"!`, 'success');
  };

  // Handle Switch Workspace
  const handleSwitchWorkspace = (tenant: PlatformTenant) => {
    try {
      localStorage.setItem('whatsq_workspace_name', tenant.businessName);
      localStorage.setItem('whatsq_active_tenant_id', tenant.id);
      window.dispatchEvent(new CustomEvent('whatsq_workspace_updated', { detail: tenant }));
      addToast(`Switched active organization to "${tenant.businessName}" (${tenant.id})`, 'success');
    } catch {
      addToast(`Switched to ${tenant.businessName}`, 'success');
    }
  };

  // Handle Top-Up Meta Wallet
  const handleTopUpMetaWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletTopUpTenant) return;

    const newBalance = (walletTopUpTenant.metaWalletBalance || 0) + Number(topUpAmount);
    const updatedStatus: 'healthy' | 'low' | 'critical' = newBalance > 1000 ? 'healthy' : newBalance > 500 ? 'low' : 'critical';

    const updatedTenant: PlatformTenant = {
      ...walletTopUpTenant,
      metaWalletBalance: newBalance,
      metaWalletStatus: updatedStatus,
    };

    const updatedList = tenants.map((t) => (t.id === walletTopUpTenant.id ? updatedTenant : t));
    saveTenants(updatedList);

    const log: PlatformAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Rahul Mehta',
      actorRole: 'Platform Super Admin',
      action: `Credited Meta Prepaid Wallet with +₹${Number(topUpAmount).toLocaleString()} for "${walletTopUpTenant.businessName}" (New Balance: ₹${newBalance.toLocaleString()})`,
      targetTenant: walletTopUpTenant.businessName,
      severity: 'info',
      ipAddress: '103.248.112.44',
    };
    setAuditLogs((prev) => [log, ...prev]);

    setWalletTopUpTenant(null);
    addToast(`Meta Prepaid Wallet recharged with ₹${Number(topUpAmount).toLocaleString()}!`, 'success');
  };

  // Handle Record Software Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordPaymentTenant) return;

    const updatedTenant: PlatformTenant = {
      ...recordPaymentTenant,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      lastPaymentAmount: Number(paymentForm.amount),
      lastPaymentMethod: paymentForm.method,
      lastPaymentRef: paymentForm.reference,
      nextPaymentDueDate: paymentForm.nextDueDate,
      paymentStatus: 'paid',
    };

    const updatedList = tenants.map((t) => (t.id === recordPaymentTenant.id ? updatedTenant : t));
    saveTenants(updatedList);

    const log: PlatformAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Rahul Mehta',
      actorRole: 'Platform Super Admin',
      action: `Recorded software renewal payment of ₹${Number(paymentForm.amount).toLocaleString()} for "${recordPaymentTenant.businessName}" (Ref: ${paymentForm.reference}). Next due: ${paymentForm.nextDueDate}`,
      targetTenant: recordPaymentTenant.businessName,
      severity: 'info',
      ipAddress: '103.248.112.44',
    };
    setAuditLogs((prev) => [log, ...prev]);

    setRecordPaymentTenant(null);
    addToast(`Software payment of ₹${Number(paymentForm.amount).toLocaleString()} recorded!`, 'success');
  };

  // Handle Live Diagnostics
  const handleRunDiagnostics = (tenant: PlatformTenant) => {
    setDiagnosticsTenant(tenant);
    setIsDiagnosing(true);
    setDiagnosticResult(null);

    setTimeout(() => {
      setIsDiagnosing(false);
      setDiagnosticResult({
        metaGraphApi: { status: 'pass', latency: `${tenant.wabaLatencyMs || 38}ms`, code: 200, message: 'Meta Graph API v21.0 Handshake Verified' },
        webhook: { status: 'pass', latency: '12ms', lastCallback: tenant.lastWebhookPing || '14s ago', message: 'Inbound Webhook Callback 200 OK' },
        metaWallet: {
          status: tenant.metaWalletBalance > 500 ? 'pass' : 'warn',
          balance: `₹${(tenant.metaWalletBalance || 0).toLocaleString()}`,
          tier: tenant.metaTier,
          message: tenant.metaWalletBalance > 500 ? 'Sufficient prepaid conversation reserve' : 'Low prepaid balance warning',
        },
        softwareLicense: {
          status: tenant.paymentStatus === 'overdue' ? 'warn' : 'pass',
          dueDate: tenant.nextPaymentDueDate,
          statusText: tenant.paymentStatus.toUpperCase(),
        },
        database: { status: 'pass', latency: '1.2ms', message: 'Tenant database isolate operational' },
      });
      addToast(`Live diagnostics complete for "${tenant.businessName}": 100% Operational!`, 'success');
    }, 1000);
  };

  // Preset Applier for Sidebar Config
  const handleApplyPreset = (preset: 'field_service' | 'retail' | 'minimal' | 'full') => {
    if (!configuringSidebarTenant) return;
    let selected: TenantSidebarModule[] = [];
    if (preset === 'field_service') {
      selected = ['dashboard', 'conversations', 'crm', 'ops', 'finance', 'settings'];
    } else if (preset === 'retail') {
      selected = ['dashboard', 'conversations', 'messenger', 'automation', 'finance', 'settings'];
    } else if (preset === 'minimal') {
      selected = ['dashboard', 'conversations', 'settings'];
    } else {
      selected = [
        'dashboard', 'conversations', 'messenger', 'crm', 'branches',
        'ops', 'finance', 'automation', 'ai', 'analytics', 'integrations',
        'roles', 'settings', 'settings-backup'
      ];
    }

    const updated = {
      ...configuringSidebarTenant,
      sidebarModules: selected,
    };
    setConfiguringSidebarTenant(updated);
    const updatedList = tenants.map((t) => (t.id === configuringSidebarTenant.id ? updated : t));
    saveTenants(updatedList);
    addToast(`Applied preset: ${preset.replace('_', ' ').toUpperCase()}`, 'info');
  };

  // Toggle single sidebar module for client
  const handleToggleSidebarModule = (moduleId: TenantSidebarModule) => {
    if (!configuringSidebarTenant) return;
    const current = configuringSidebarTenant.sidebarModules || [];
    const exists = current.includes(moduleId);
    const next = exists ? current.filter((m) => m !== moduleId) : [...current, moduleId];

    const updated = {
      ...configuringSidebarTenant,
      sidebarModules: next,
    };
    setConfiguringSidebarTenant(updated);
    const updatedList = tenants.map((t) => (t.id === configuringSidebarTenant.id ? updated : t));
    saveTenants(updatedList);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto font-sans">
      {/* ── 1. Minimal Signature Header ── */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SidebarToggle />
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform Super Admin</h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 tracking-wider">
                  PRO
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Meta WABA v21.0 Online
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Cluster: asia-south-1
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Client SaaS Provisioning • Meta Wallets • Custom Sidebar Planning</span>
                <span className="text-slate-300">•</span>
                <span>Owner: <strong className="text-slate-700 font-bold">Rahul Mehta</strong></span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold">99.98% Gateway SLA</span>
              </p>
            </div>
          </div>

          {/* Minimal Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleMetricsExpanded}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs cursor-pointer ${
                isMetricsExpanded
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title={isMetricsExpanded ? "Click to collapse metric cards" : "Click to expand metric cards"}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMetricsExpanded ? 'Collapse KPIs' : 'Expand KPIs'}</span>
              {isMetricsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
              title="Broadcast system announcement to all logged-in workspaces"
            >
              <Radio className="w-3.5 h-3.5 text-amber-600" />
              <span>Broadcast</span>
            </button>

            <button
              onClick={toggleEmergencyKillSwitch}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                isKillSwitchActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-white hover:bg-rose-50 border border-rose-200 text-rose-700'
              }`}
              title={isKillSwitchActive ? 'Click to Resume Campaign Engine' : 'Click to Emergency Stop Outbound Campaigns'}
            >
              {isKillSwitchActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
              <span>{isKillSwitchActive ? 'Engine Halted' : 'Outbound Gate'}</span>
            </button>

            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), tenants }, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `whatsq-tenants-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                addToast('Unified Client Database Exported!', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Backup</span>
            </button>

            <button
              onClick={() => setIsCreateTenantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Provision Client</span>
            </button>
          </div>
        </div>

        {/* Emergency Alert Banner if Active */}
        {isKillSwitchActive && (
          <div className="max-w-7xl mx-auto mt-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>CRITICAL NOTICE:</strong> Global outbound WhatsApp campaigns are currently <strong>SUSPENDED</strong>. Inbound webhooks remain functional.
              </span>
            </div>
            <button
              onClick={toggleEmergencyKillSwitch}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Resume Outbound
            </button>
          </div>
        )}
      </div>

      {/* ── 2. Top Metric KPI Strip (Expand / Collapse) ── */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-1">
        {!isMetricsExpanded ? (
          /* Collapsed State Bar - only visible when collapsed */
          <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Platform Performance Metrics</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                    {metrics.totalClients} Workspaces
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    {metrics.totalLicensesInUse} / {metrics.totalLicensesAllocated} Staff Seats
                  </span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">
                    {metrics.totalMessagesThisMonth.toLocaleString()} WhatsApp Traffic
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    ₹{metrics.totalMRR.toLocaleString()} MRR
                  </span>
                  <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                    ₹{metrics.totalMetaWallets.toLocaleString()} Wallets
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Platform KPI cards are collapsed to keep your workspace minimal. Click <strong>Expand Metrics</strong> to reveal full metric cards.
                </p>
              </div>
            </div>

            <button
              onClick={toggleMetricsExpanded}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition shadow-2xs cursor-pointer shrink-0 active:scale-95"
            >
              <ChevronDown className="w-4 h-4 text-emerald-600" />
              <span>Expand Metrics</span>
            </button>
          </div>
        ) : (
          /* Expanded State Cards - only visible when expanded */
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between bg-white/70 border border-slate-200/80 rounded-xl px-4 py-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Platform Performance KPIs</span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Sync
                </span>
              </div>
              <button
                onClick={toggleMetricsExpanded}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 transition cursor-pointer shadow-2xs active:scale-95"
                title="Collapse metrics strip"
              >
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Collapse Metrics</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Card 1: TENANT WORKSPACES */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TENANT WORKSPACES</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{metrics.totalClients}</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {metrics.activeClients} Active
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{metrics.trialClients} Trial • {metrics.suspendedClients} Suspended</span>
                  <span className="font-semibold text-blue-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    100% Online
                  </span>
                </div>
              </div>

              {/* Card 2: STAFF SEAT LICENSES */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">STAFF SEAT LICENSES</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{metrics.totalLicensesInUse}</span>
                  <span className="text-xs font-medium text-slate-500">
                    / {metrics.totalLicensesAllocated} Provisioned
                  </span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          metrics.totalLicensesAllocated > 0
                            ? Math.round((metrics.totalLicensesInUse / metrics.totalLicensesAllocated) * 100)
                            : 65
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: MONTHLY WHATSAPP TRAFFIC */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MONTHLY WHATSAPP TRAFFIC</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {metrics.totalMessagesThisMonth.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    99.4% Delivery
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Avg Latency: 42ms</span>
                  <span className="text-emerald-700 font-semibold">Zero drops</span>
                </div>
              </div>

              {/* Card 4: PLATFORM MRR */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PLATFORM MRR</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{metrics.totalMRR.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +18.4%
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Next Global Renewal: Oct 01</span>
                  <span className="text-amber-700 font-semibold">Active Subscriptions</span>
                </div>
              </div>

              {/* Card 5: META PREPAID WALLETS */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">META PREPAID WALLETS</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-teal-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{metrics.totalMetaWallets.toLocaleString()}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    metrics.lowWalletCount > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {metrics.lowWalletCount > 0 ? `⚠️ ${metrics.lowWalletCount} Low Balance` : 'All Healthy'}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Client WABA Prepaid Reserve</span>
                  <span className="text-teal-700 font-semibold">Meta Direct</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Tabbed Minimal Navigation ── */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'clients'
                  ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Building className="w-4 h-4 text-emerald-700" />
              <span>Purchased Clients & Payments</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700 font-extrabold">
                {tenants.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sidebar_config')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'sidebar_config'
                  ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Sidebar Options Matrix</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-50 text-amber-800 font-extrabold border border-amber-200">
                Customized
              </span>
            </button>

            <button
              onClick={() => setActiveTab('meta_wallets')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'meta_wallets'
                  ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Wallet className="w-4 h-4 text-blue-600" />
              <span>Meta Prepaid Wallets & WABA Health</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'plans'
                  ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>SaaS Plan Tiers</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Activity className="w-4 h-4 text-slate-600" />
              <span>Platform Audit Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Main Body ── */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: PURCHASED CLIENTS, SOFTWARE LEDGER & META WALLETS                  */}
        {/* ========================================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-5">
            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search client by business name, ID, phone or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={tierFilter}
                  onChange={(e: any) => setTierFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="enterprise">Enterprise PRO</option>
                  <option value="growth">Growth Tier</option>
                  <option value="starter">Starter Tier</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e: any) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid & Current</option>
                  <option value="due_soon">Upcoming Due Soon</option>
                  <option value="overdue">Overdue Payment</option>
                </select>

                <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Grid Cards View"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Compact Table View"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Cards View */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTenants.map((client) => {
                  const percentSeats = Math.round((client.activeLicenses / (client.maxLicenses || 1)) * 100);

                  return (
                    <div
                      key={client.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top Accent Strip */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${client.color || 'from-emerald-500 to-teal-600'}`} />

                      <div className="p-5 space-y-4">
                        {/* Header: Identity, Plan, Live Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${client.color || 'from-emerald-500 to-teal-600'} text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0`}>
                              {client.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-sm">{client.businessName}</h3>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                                  {client.id}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{client.branch || 'Head Office'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              client.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : client.status === 'trial'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {client.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                              {client.tier} PRO
                            </span>
                          </div>
                        </div>

                        {/* Exact Live Status Strip */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="font-bold text-slate-800">
                              {client.wabaStatus === 'connected' ? 'WABA Live & Sending' : 'WABA Setup Pending'}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-mono text-emerald-700">{client.wabaPhone || 'No Phone'}</span>
                          </div>
                          <button
                            onClick={() => handleRunDiagnostics(client)}
                            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                            title="Run instant ping & webhook diagnostics"
                          >
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>Diagnose</span>
                          </button>
                        </div>

                        {/* Dual Key Metrics: Meta Prepaid Wallet & Software Payment */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* 1. Meta Prepaid Wallet */}
                          <div className={`p-3 rounded-xl border space-y-1.5 ${
                            client.metaWalletStatus === 'healthy'
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : client.metaWalletStatus === 'low'
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-rose-50/50 border-rose-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                                <Wallet className="w-3.5 h-3.5 text-slate-500" />
                                <span>Meta Wallet</span>
                              </span>
                              <button
                                onClick={() => {
                                  setWalletTopUpTenant(client);
                                  setTopUpAmount(2000);
                                }}
                                className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                              >
                                + Recharge
                              </button>
                            </div>
                            <div className="text-base font-black text-slate-900">
                              ₹{(client.metaWalletBalance || 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-between">
                              <span>{client.metaTier}</span>
                              <span className={`font-bold ${
                                client.metaWalletStatus === 'healthy'
                                  ? 'text-emerald-700'
                                  : client.metaWalletStatus === 'low'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }`}>
                                {client.metaWalletStatus === 'healthy' ? 'Normal' : client.metaWalletStatus === 'low' ? 'Low Bal!' : 'Depleted'}
                              </span>
                            </div>
                          </div>

                          {/* 2. Software Subscription & Next Payment */}
                          <div className={`p-3 rounded-xl border space-y-1.5 ${
                            client.paymentStatus === 'paid'
                              ? 'bg-slate-50 border-slate-200'
                              : client.paymentStatus === 'due_soon'
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-rose-50/50 border-rose-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                <span>Next Due</span>
                              </span>
                              <button
                                onClick={() => {
                                  setRecordPaymentTenant(client);
                                  setPaymentForm({
                                    amount: client.amount,
                                    method: 'Razorpay UPI',
                                    reference: `pay_${Math.floor(100000 + Math.random() * 900000)}`,
                                    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                  });
                                }}
                                className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                              >
                                Pay Ledger
                              </button>
                            </div>
                            <div className="text-base font-black text-slate-900">
                              ₹{client.amount.toLocaleString()}
                            </div>
                            <div className="text-[10px] flex items-center justify-between">
                              <span className="text-slate-500">{client.nextPaymentDueDate}</span>
                              <span className={`font-bold ${
                                client.paymentStatus === 'paid'
                                  ? 'text-emerald-700'
                                  : client.paymentStatus === 'due_soon'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }`}>
                                {client.paymentStatus === 'paid' ? 'Paid' : client.paymentStatus === 'due_soon' ? 'Due Soon' : 'Overdue!'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Last Payment Record Strip */}
                        <div className="text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                          <span>
                            Last Paid: <strong>₹{client.lastPaymentAmount.toLocaleString()}</strong> on {client.lastPaymentDate}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px] truncate max-w-[120px]">
                            {client.lastPaymentMethod}
                          </span>
                        </div>

                        {/* Active Staff & Seat Usage */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-500 font-medium">Active Staff Seats:</span>
                            <span className="font-bold text-slate-800">
                              {client.activeLicenses} / {client.maxLicenses} Seats ({percentSeats}%) • {client.onlineStaffCount} Online Now
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, percentSeats)}%` }}
                            />
                          </div>
                        </div>

                        {/* Configured Sidebar Menu Modules */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Configured Sidebar Menu ({(client.sidebarModules || []).length}):
                            </span>
                            <button
                              onClick={() => setConfiguringSidebarTenant(client)}
                              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Customize</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(client.sidebarModules || []).map((modId) => {
                              const item = ALL_SIDEBAR_MODULES.find((m) => m.id === modId);
                              return (
                                <span
                                  key={modId}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-semibold flex items-center gap-1"
                                >
                                  {item ? item.label : modId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleSwitchWorkspace(client)}
                          className="px-3 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Switch active organization context to this workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Switch Workspace</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setConfiguringSidebarTenant(client)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Configure Sidebar Menu Options"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditingTenant(client)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Client Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              const nextStatus: 'active' | 'suspended' = client.status === 'suspended' ? 'active' : 'suspended';
                              const updated = tenants.map((t) => (t.id === client.id ? { ...t, status: nextStatus } : t));
                              saveTenants(updated);
                              addToast(`Client "${client.businessName}" is now ${nextStatus.toUpperCase()}`, nextStatus === 'suspended' ? 'warning' : 'success');
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              client.status === 'suspended' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={client.status === 'suspended' ? 'Reactivate Client' : 'Suspend Client'}
                          >
                            {client.status === 'suspended' ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Permanently remove client "${client.businessName}" (${client.id})?`)) {
                                const updated = tenants.filter((t) => t.id !== client.id);
                                saveTenants(updated);
                                addToast(`Client "${client.businessName}" removed.`, 'info');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Compact Table View */
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Client / ID</th>
                        <th className="py-3 px-4">Meta Wallet Balance</th>
                        <th className="py-3 px-4">Last Software Payment</th>
                        <th className="py-3 px-4">Upcoming Due Date</th>
                        <th className="py-3 px-4">Sidebar Options</th>
                        <th className="py-3 px-4">Live Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTenants.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.color || 'from-emerald-500 to-teal-600'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                                {c.initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{c.businessName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{c.id} • {c.ownerPhone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-slate-900 text-xs">
                              ₹{(c.metaWalletBalance || 0).toLocaleString()}
                            </div>
                            <span className={`text-[10px] font-bold ${
                              c.metaWalletStatus === 'healthy' ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {c.metaWalletStatus === 'healthy' ? '🟢 Normal' : '⚠️ Low Bal'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">₹{c.lastPaymentAmount.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400">{c.lastPaymentDate}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{c.nextPaymentDueDate}</div>
                            <span className={`text-[10px] font-bold ${
                              c.paymentStatus === 'paid' ? 'text-emerald-700' : c.paymentStatus === 'due_soon' ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                              {c.paymentStatus === 'paid' ? 'Paid' : c.paymentStatus === 'due_soon' ? 'Due Soon' : 'Overdue!'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setConfiguringSidebarTenant(c)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[10px] cursor-pointer"
                            >
                              {(c.sidebarModules || []).length} Options ⚙️
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Operational
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSwitchWorkspace(c)}
                                className="px-2.5 py-1 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                              >
                                Switch
                              </button>
                              <button
                                onClick={() => handleRunDiagnostics(c)}
                                className="p-1 text-slate-400 hover:text-amber-600 cursor-pointer"
                                title="Run Diagnostics"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SIDEBAR OPTIONS MATRIX CONFIGURATOR                               */}
        {/* ========================================================================= */}
        {activeTab === 'sidebar_config' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Client Custom Sidebar Options Matrix</h3>
                  <p className="text-xs text-slate-500">
                    Control which modules appear on each client's left navigation sidebar. Clients only see features they purchased.
                  </p>
                </div>
              </div>

              {/* Table of all clients and their assigned sidebar modules */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {tenants.map((client) => (
                  <div key={client.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${client.color || 'from-emerald-500 to-teal-600'} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
                        {client.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">{client.businessName}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {client.id}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            {client.tier.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {(client.sidebarModules || []).map((mId) => {
                            const mod = ALL_SIDEBAR_MODULES.find((m) => m.id === mId);
                            return (
                              <span key={mId} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">
                                {mod ? mod.label : mId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfiguringSidebarTenant(client)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Configure Sidebar ({(client.sidebarModules || []).length}/14)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: META PREPAID WALLETS & WABA HEALTH                                */}
        {/* ========================================================================= */}
        {activeTab === 'meta_wallets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tenants.map((client) => (
                <div key={client.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${client.color} text-white font-bold text-xs flex items-center justify-center`}>
                        {client.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{client.businessName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{client.wabaPhone || 'Pending WABA'}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      client.metaWalletStatus === 'healthy'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : client.metaWalletStatus === 'low'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {client.metaWalletStatus === 'healthy' ? '🟢 Normal Reserve' : '⚠️ Low Balance Alert'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Prepaid Conversation Balance</div>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        ₹{(client.metaWalletBalance || 0).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setWalletTopUpTenant(client);
                        setTopUpAmount(2000);
                      }}
                      className="px-3.5 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                    >
                      + Top-Up Credit
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-slate-400 text-[10px]">Daily Limit</div>
                      <div className="font-bold text-slate-800">{client.metaTier}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-slate-400 text-[10px]">Quality Rating</div>
                      <div className="font-bold text-emerald-700">{client.wabaQualityScore || 'HIGH 🟢'}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-slate-400 text-[10px]">API Latency</div>
                      <div className="font-bold text-slate-800">{client.wabaLatencyMs || 38}ms</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SAAS PLANS                                                        */}
        {/* ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {INITIAL_PLANS.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-2xs">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {plan.badge}
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-2">{plan.name}</h4>
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {plan.currency}{plan.monthlyPrice.toLocaleString()}<span className="text-xs text-slate-500 font-normal"> / mo</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AUDIT TRAIL                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Client</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{log.actor}</div>
                        <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-md">{log.action}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{log.targetTenant || 'Global'}</td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. MODAL: CONFIGURE CLIENT SIDEBAR MENU ── */}
      {configuringSidebarTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden text-xs">
            {/* Minimal Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Configure Sidebar Navigation: {configuringSidebarTenant.businessName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enable or disable sidebar options tailored specifically for this client
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfiguringSidebarTenant(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* 1-Click Planning Presets */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Apply Structured Industry Preset:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('field_service')}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-slate-800 text-[11px]">🛠️ Field Service</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Jobs, CRM, Invoices</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('retail')}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-slate-800 text-[11px]">🛍️ Retail / Shop</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Bulk, Keywords, Deals</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('minimal')}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-slate-800 text-[11px]">⚡ Inbox Only</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Clean & Minimal</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('full')}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-slate-800 text-[11px]">🏢 Full Suite</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">All 14 Modules</div>
                  </button>
                </div>
              </div>

              {/* Individual Modules Checklist */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Module Selection ({(configuringSidebarTenant.sidebarModules || []).length} enabled):
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {ALL_SIDEBAR_MODULES.map((mod) => {
                    const isChecked = (configuringSidebarTenant.sidebarModules || []).includes(mod.id);
                    const ModIcon = mod.icon;

                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleToggleSidebarModule(mod.id)}
                        className={`p-3 flex items-center justify-between cursor-pointer transition ${
                          isChecked ? 'bg-emerald-50/20' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <ModIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{mod.label}</span>
                              <span className="text-[9px] font-medium text-slate-400 px-1 py-0.2 rounded bg-slate-100">
                                {mod.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">{mod.description}</p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSidebarModule(mod.id)}
                          className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600 cursor-pointer accent-[#0B3B2C]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Settings apply immediately when this workspace is active.
                </span>
                <button
                  type="button"
                  onClick={() => setConfiguringSidebarTenant(null)}
                  className="px-4 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer"
                >
                  Save & Apply Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. MODAL: TOP-UP META PREPAID WALLET ── */}
      {walletTopUpTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Recharge Meta Wallet: {walletTopUpTenant.businessName}
                </h3>
              </div>
              <button onClick={() => setWalletTopUpTenant(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTopUpMetaWallet} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500">Current Balance:</div>
                  <div className="text-lg font-black text-slate-900">
                    ₹{(walletTopUpTenant.metaWalletBalance || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  WABA: {walletTopUpTenant.wabaPhone || 'Active'}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Top-Up Amount (₹ INR):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 rounded-xl font-bold transition cursor-pointer border ${
                        topUpAmount === amt ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWalletTopUpTenant(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer"
                >
                  Confirm Credit Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. MODAL: RECORD SOFTWARE PAYMENT ── */}
      {recordPaymentTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Record Software Payment: {recordPaymentTenant.businessName}
                </h3>
              </div>
              <button onClick={() => setRecordPaymentTenant(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Payment Amount Received (₹):</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Payment Method:</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Razorpay UPI">Razorpay UPI</option>
                  <option value="Bank NEFT / IMPS">Bank NEFT / IMPS</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash / Cheque">Cash / Cheque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Transaction Reference ID:</label>
                <input
                  type="text"
                  required
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Next Upcoming Due Date:</label>
                <input
                  type="date"
                  required
                  value={paymentForm.nextDueDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, nextDueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecordPaymentTenant(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. MODAL: LIVE DIAGNOSTICS RESULTS ── */}
      {diagnosticsTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">
                  Live Diagnostics: {diagnosticsTenant.businessName}
                </h3>
              </div>
              <button onClick={() => setDiagnosticsTenant(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {isDiagnosing ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                  <div className="font-bold text-slate-800 text-xs">Running real-time WABA & Webhook ping tests...</div>
                </div>
              ) : diagnosticResult ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900 text-xs">Meta Graph API v21.0 Handshake</div>
                      <div className="text-[11px] text-emerald-700">{diagnosticResult.metaGraphApi.message} ({diagnosticResult.metaGraphApi.latency})</div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900 text-xs">Inbound Webhook Verification</div>
                      <div className="text-[11px] text-emerald-700">{diagnosticResult.webhook.message} (Last ping: {diagnosticResult.webhook.lastCallback})</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <Wallet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Meta Prepaid Balance Check</div>
                      <div className="text-[11px] text-slate-600">Balance: {diagnosticResult.metaWallet.balance} • {diagnosticResult.metaWallet.tier}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Software Subscription License</div>
                      <div className="text-[11px] text-slate-600">Status: {diagnosticResult.softwareLicense.statusText} • Due: {diagnosticResult.softwareLicense.dueDate}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDiagnosticsTenant(null)}
                  className="px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. MODAL: PROVISION NEW CLIENT ── */}
      {isCreateTenantOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">Provision New Client Workspace</h3>
              </div>
              <button onClick={() => setIsCreateTenantOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Client / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics India"
                  value={newTenantForm.businessName}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Branch Location</label>
                  <input
                    type="text"
                    value={newTenantForm.branch}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Plan Tier</label>
                  <select
                    value={newTenantForm.tier}
                    onChange={(e: any) => setNewTenantForm({ ...newTenantForm, tier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="starter">Starter (₹2,499/mo)</option>
                    <option value="growth">Growth (₹5,999/mo)</option>
                    <option value="enterprise">Enterprise PRO (₹14,999/mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newTenantForm.ownerName}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Owner WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={newTenantForm.ownerPhone}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Initial Meta Wallet (₹)</label>
                  <input
                    type="number"
                    value={newTenantForm.initialMetaBalance}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, initialMetaBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Sidebar Preset</label>
                  <select
                    value={newTenantForm.selectedPreset}
                    onChange={(e: any) => setNewTenantForm({ ...newTenantForm, selectedPreset: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="field_service">🛠️ Field Service (Jobs, CRM, Invoices)</option>
                    <option value="retail">🛍️ Retail (Bulk, Keywords, Invoices)</option>
                    <option value="minimal">⚡ Inbox Only (Lightweight)</option>
                    <option value="full">🏢 Full Suite (All 14 Modules)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTenantOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 10. MODAL: EDIT CLIENT DETAILS ── */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">Edit Client: {editingTenant.businessName}</h3>
              </div>
              <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Business Name</label>
                <input
                  type="text"
                  value={editingTenant.businessName}
                  onChange={(e) => setEditingTenant({ ...editingTenant, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Staff Seats Limit</label>
                  <input
                    type="number"
                    value={editingTenant.maxLicenses}
                    onChange={(e) => setEditingTenant({ ...editingTenant, maxLicenses: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Software Fee (₹)</label>
                  <input
                    type="number"
                    value={editingTenant.amount}
                    onChange={(e) => setEditingTenant({ ...editingTenant, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = tenants.map((t) => (t.id === editingTenant.id ? editingTenant : t));
                    saveTenants(updated);
                    setEditingTenant(null);
                    addToast(`Updated client "${editingTenant.businessName}"`, 'success');
                  }}
                  className="px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 11. MODAL: GLOBAL BROADCAST ── */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Broadcast Alert to All Workspaces</h3>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!broadcastMessage.trim()) return;
                addToast(`Broadcast sent to all ${tenants.length} client workspaces!`, 'success');
                setIsBroadcastModalOpen(false);
                setBroadcastMessage('');
              }}
              className="p-5 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Announcement Message:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Scheduled Meta WhatsApp server maintenance tonight at 1:00 AM. Inbound chats continue as normal."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

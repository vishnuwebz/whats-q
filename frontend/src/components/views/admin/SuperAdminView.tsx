import React, { useState, useEffect, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Crown,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Server,
  Activity,
  Users,
  Building,
  Building2,
  Key,
  Lock,
  Globe,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Search,
  ExternalLink,
  Copy,
  Download,
  Zap,
  Database,
  Smartphone,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle2,
  TrendingUp,
  Radio,
  Sparkles,
  ChevronRight,
  PauseCircle,
  PlayCircle,
  Sliders,
  DollarSign,
  BarChart3,
  Layers,
  Settings,
  HelpCircle
} from 'lucide-react';
import { PlatformTenant, PlatformAuditLog, PlatformPlanTier, TenantFeatureConfig } from '@/types';
import { SidebarToggle } from '../../layout/SidebarToggle';

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
    renewalDate: '2026-10-15',
    createdAt: '2026-01-10',
    activeLicenses: 18,
    maxLicenses: 30,
    status: 'active',
    wabaStatus: 'connected',
    wabaPhone: '+91 73389 44799',
    wabaId: '1098915959329432',
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
    renewalDate: '2026-10-02',
    createdAt: '2026-03-14',
    activeLicenses: 12,
    maxLicenses: 15,
    status: 'active',
    wabaStatus: 'connected',
    wabaPhone: '+91 98765 43211',
    wabaId: '1098915959329440',
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
    renewalDate: '2026-10-20',
    createdAt: '2026-02-01',
    activeLicenses: 24,
    maxLicenses: 40,
    status: 'active',
    wabaStatus: 'connected',
    wabaPhone: '+91 98765 43212',
    wabaId: '1098915959329488',
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
    renewalDate: '2026-09-30',
    createdAt: '2026-06-18',
    activeLicenses: 8,
    maxLicenses: 10,
    status: 'trial',
    wabaStatus: 'pending',
    wabaPhone: '+91 98765 43213',
    wabaId: '1098915959329501',
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
  },
];

const INITIAL_PLANS: PlatformPlanTier[] = [
  {
    id: 'plan_starter',
    name: 'Starter Tier',
    badge: 'Standard',
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
      'Basic CRM & Contact Management',
      'Bulk Messaging & Scheduler',
      'Community & Email Support',
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
      'Full Interactive Workflow Automation Canvas',
      'AI Knowledge Base & Smart Assistant',
      'Voice Note Transcription & Audio Notes',
      'Multi-Agent Inbox with Collision Detection',
      'Priority WhatsApp Support & SLA',
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
      'Unlimited WABA Phone Number Channels',
      'Up to 50 Dedicated Team Seats (Expandable)',
      '200,000+ Outbound Messages / mo',
      'Full White-Label Branding & Custom Domain',
      'Multi-Branch Organization Routing',
      'REST Webhook API & External ERP Sync',
      'Dedicated IP & 99.99% Guaranteed SLA',
      '24/7 Dedicated Technical Account Manager',
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
    action: 'Modified global outbound rate limiter throttle from 12s to 10s',
    targetTenant: 'Global Platform',
    severity: 'info',
    ipAddress: '103.248.112.44',
    details: 'Applied across all 4 active workspace outbound queues.',
  },
  {
    id: 'log-02',
    timestamp: '28 mins ago',
    actor: 'System Engine',
    actorRole: 'Meta Webhook Listener',
    action: 'Successfully handled 1,420 incoming message callbacks without drops',
    targetTenant: 'Qiyam Business Solutions',
    severity: 'info',
    ipAddress: '31.13.88.35 (Meta Ireland)',
  },
  {
    id: 'log-03',
    timestamp: '1 hour ago',
    actor: 'Anoop Kumar',
    actorRole: 'Tenant Admin',
    action: 'Provisioned 2 new staff seats in Calicut Central branch',
    targetTenant: 'CoolFix Enterprises',
    severity: 'info',
    ipAddress: '117.218.49.201',
  },
  {
    id: 'log-04',
    timestamp: '3 hours ago',
    actor: 'Rahul Mehta',
    actorRole: 'Platform Super Admin',
    action: 'Generated and encrypted full Multi-Tenant Database Backup Snapshot',
    targetTenant: 'Global Platform',
    severity: 'security',
    ipAddress: '103.248.112.44',
  },
  {
    id: 'log-05',
    timestamp: 'Yesterday',
    actor: 'Security Monitor',
    actorRole: 'Anomaly Guard',
    action: 'Blocked 3 unauthorized JWT token renewal attempts from unknown ASN',
    targetTenant: 'Security Perimeter',
    severity: 'warning',
    ipAddress: '185.220.101.5',
    details: 'IP quarantined automatically for 24 hours.',
  },
];

export const SuperAdminView: React.FC = () => {
  const { addToast } = useQiyamStore();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'tenants' | 'gateway' | 'plans' | 'rbac' | 'audit' | 'branding'>('tenants');

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

  // Save tenants helper with broadcast
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<PlatformTenant | null>(null);
  const [selectedFeaturesTenant, setSelectedFeaturesTenant] = useState<PlatformTenant | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'info' | 'warning' | 'critical'>('info');

  // Emergency Global Outbound Kill-Switch state
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
      addToast('🛑 EMERGENCY KILL-SWITCH ACTIVATED: All outbound WhatsApp campaigns suspended globally!', 'error');
    } else {
      addToast('🟢 Outbound WhatsApp campaign engine resumed globally.', 'success');
    }
  };

  // Global Rate Limiter throttle config
  const [rateLimitMinDelay, setRateLimitMinDelay] = useState(10);
  const [revealWebhookSecret, setRevealWebhookSecret] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditSeverity, setAuditSeverity] = useState<'all' | 'info' | 'warning' | 'security' | 'critical'>('all');

  // Global Platform Settings / White-Label
  const [platformName, setPlatformName] = useState(() => localStorage.getItem('whatsq_platform_name') || 'WhatsQ Enterprise OS');
  const [platformTagline, setPlatformTagline] = useState(() => localStorage.getItem('whatsq_platform_tagline') || 'Enterprise Multi-Tenant WhatsApp Business Operating System');
  const [supportWhatsApp, setSupportWhatsApp] = useState('+91 94963 00233');
  const [supportEmail, setSupportEmail] = useState('support@qiyam.ventures');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceBannerText, setMaintenanceBannerText] = useState('Scheduled system maintenance in progress. All messages remain queued.');

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
  });

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.status === 'active').length;
    const trialTenants = tenants.filter((t) => t.status === 'trial').length;
    const suspendedTenants = tenants.filter((t) => t.status === 'suspended').length;

    const totalLicensesAllocated = tenants.reduce((acc, t) => acc + (t.maxLicenses || 0), 0);
    const totalLicensesInUse = tenants.reduce((acc, t) => acc + (t.activeLicenses || 0), 0);

    const totalMessagesThisMonth = tenants.reduce((acc, t) => acc + (t.messagesSentThisMonth || 0), 0);
    const totalMRR = tenants.reduce((acc, t) => (t.status !== 'suspended' ? acc + (t.amount || 0) : acc), 0);

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      totalLicensesAllocated,
      totalLicensesInUse,
      totalMessagesThisMonth,
      totalMRR,
    };
  }, [tenants]);

  // Filtered Tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      if (tierFilter !== 'all' && t.tier !== tierFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
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
  }, [tenants, tierFilter, statusFilter, searchQuery]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      if (auditSeverity !== 'all' && l.severity !== auditSeverity) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase().trim();
        const matchAction = l.action.toLowerCase().includes(q);
        const matchActor = l.actor.toLowerCase().includes(q);
        const matchTarget = (l.targetTenant || '').toLowerCase().includes(q);
        const matchIp = l.ipAddress.toLowerCase().includes(q);
        if (!matchAction && !matchActor && !matchTarget && !matchIp) return false;
      }
      return true;
    });
  }, [auditLogs, auditSeverity, auditSearch]);

  // Handle Create Tenant
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantForm.businessName.trim() || !newTenantForm.ownerName.trim()) {
      addToast('Please provide a business name and primary owner name', 'error');
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
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      activeLicenses: 1,
      maxLicenses: Number(newTenantForm.maxLicenses) || 10,
      status: 'active',
      wabaStatus: newTenantForm.wabaPhone ? 'connected' : 'pending',
      wabaPhone: newTenantForm.wabaPhone || undefined,
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
    };

    const updated = [newTenant, ...tenants];
    saveTenants(updated);

    // Add audit log
    const newLog: PlatformAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Rahul Mehta',
      actorRole: 'Platform Super Admin',
      action: `Provisioned new workspace "${newTenant.businessName}" (${newTenant.id}) with ${newTenant.maxLicenses} licenses on ${newTenant.tier} tier`,
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
    });

    addToast(`Successfully provisioned workspace "${newTenant.businessName}"!`, 'success');
  };

  // Handle Toggle Tenant Status (Suspend / Reactivate)
  const handleToggleTenantStatus = (tenant: PlatformTenant) => {
    const nextStatus: 'active' | 'suspended' = tenant.status === 'suspended' ? 'active' : 'suspended';
    const updated = tenants.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t));
    saveTenants(updated);

    const log: PlatformAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Rahul Mehta',
      actorRole: 'Platform Super Admin',
      action: `${nextStatus === 'suspended' ? 'Suspended' : 'Reactivated'} workspace access for "${tenant.businessName}" (${tenant.id})`,
      targetTenant: tenant.businessName,
      severity: nextStatus === 'suspended' ? 'warning' : 'info',
      ipAddress: '103.248.112.44',
    };
    setAuditLogs((prev) => [log, ...prev]);

    addToast(`Workspace "${tenant.businessName}" is now ${nextStatus.toUpperCase()}`, nextStatus === 'suspended' ? 'warning' : 'success');
  };

  // Handle Impersonate / Switch Workspace
  const handleImpersonateTenant = (tenant: PlatformTenant) => {
    try {
      localStorage.setItem('whatsq_workspace_name', tenant.businessName);
      localStorage.setItem('whatsq_active_tenant_id', tenant.id);
      window.dispatchEvent(new CustomEvent('whatsq_workspace_updated', { detail: tenant }));
      addToast(`Switched active workspace context to "${tenant.businessName}" (${tenant.id})`, 'success');
    } catch {
      addToast(`Context switched to ${tenant.businessName}`, 'success');
    }
  };

  // Handle Delete Tenant
  const handleDeleteTenant = (tenant: PlatformTenant) => {
    if (confirm(`Are you sure you want to permanently delete workspace "${tenant.businessName}" (${tenant.id})? This will detach its licenses and message history.`)) {
      const updated = tenants.filter((t) => t.id !== tenant.id);
      saveTenants(updated);

      const log: PlatformAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actor: 'Rahul Mehta',
        actorRole: 'Platform Super Admin',
        action: `Permanently deleted workspace "${tenant.businessName}" (${tenant.id})`,
        targetTenant: tenant.businessName,
        severity: 'critical',
        ipAddress: '103.248.112.44',
      };
      setAuditLogs((prev) => [log, ...prev]);

      addToast(`Workspace "${tenant.businessName}" deleted.`, 'info');
    }
  };

  // Handle Export Master Backup
  const handleExportMasterBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      platform: platformName,
      version: '2.4.3',
      cluster: 'asia-south-1',
      metrics,
      tenants,
      auditLogs,
      plans: INITIAL_PLANS,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsq-superadmin-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast('Unified Multi-Tenant Database Backup downloaded successfully!', 'success');
  };

  // Handle Send Global Broadcast
  const handleSendGlobalBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    addToast(`📢 Broadcast sent to all ${tenants.length} tenant workspaces: "${broadcastMessage}"`, 'success');

    const log: PlatformAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Rahul Mehta',
      actorRole: 'Platform Super Admin',
      action: `Sent global broadcast announcement (${broadcastSeverity.toUpperCase()}): "${broadcastMessage.substring(0, 50)}..."`,
      targetTenant: 'All Workspaces',
      severity: broadcastSeverity === 'critical' ? 'critical' : broadcastSeverity === 'warning' ? 'warning' : 'info',
      ipAddress: '103.248.112.44',
      details: broadcastMessage,
    };
    setAuditLogs((prev) => [log, ...prev]);

    setBroadcastMessage('');
    setIsBroadcastModalOpen(false);
  };

  // Handle Save Branding
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('whatsq_platform_name', platformName);
    localStorage.setItem('whatsq_platform_tagline', platformTagline);
    window.dispatchEvent(new CustomEvent('whatsq_workspace_updated'));
    addToast('Global platform branding & contact configurations saved!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto font-sans">
      {/* ── 1. Top Header Banner with Royal Super Admin Aesthetic ── */}
      <div className="bg-gradient-to-r from-[#070D18] via-[#0E1A30] to-[#0A261D] text-white border-b border-amber-500/20 px-6 py-5 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SidebarToggle />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Platform Super Admin</span>
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
                  PRO
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Cluster: asia-south-1
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Meta WABA v21.0
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Multi-Tenant SaaS Control Center</span>
                <span className="text-slate-500">•</span>
                <span>Owner: <strong>Rahul Mehta</strong></span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-semibold">99.98% Gateway SLA</span>
              </p>
            </div>
          </div>

          {/* Quick Platform Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Global Broadcast */}
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition shadow-xs cursor-pointer"
              title="Broadcast system announcement to all logged-in workspaces"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcast</span>
            </button>

            {/* Emergency Kill-Switch */}
            <button
              onClick={toggleEmergencyKillSwitch}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                isKillSwitchActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-slate-800/80 hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-rose-200'
              }`}
              title={isKillSwitchActive ? 'Click to Resume Campaign Engine' : 'Click to Emergency Stop Outbound Campaigns'}
            >
              {isKillSwitchActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
              <span>{isKillSwitchActive ? 'Engine Halted' : 'Outbound Gate'}</span>
            </button>

            {/* Master Backup */}
            <button
              onClick={handleExportMasterBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition shadow-xs cursor-pointer"
              title="Download full encrypted multi-tenant snapshot"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Backup</span>
            </button>

            {/* Provision Workspace CTA */}
            <button
              onClick={() => setIsCreateTenantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Provision Tenant</span>
            </button>
          </div>
        </div>

        {/* Emergency Kill-Switch Warning Banner if Active */}
        {isKillSwitchActive && (
          <div className="max-w-7xl mx-auto mt-3 bg-rose-500/20 border border-rose-500/40 rounded-xl px-4 py-2.5 text-xs text-rose-200 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>CRITICAL ALERT:</strong> Global outbound WhatsApp campaign dispatch is currently <strong>SUSPENDED</strong>. Inbound webhooks and interactive bots continue to function normally.
              </span>
            </div>
            <button
              onClick={toggleEmergencyKillSwitch}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Resume Now
            </button>
          </div>
        )}
      </div>

      {/* ── 2. Top Metric KPI Cards ── */}
      <div className="max-w-7xl mx-auto w-full p-6 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tenants */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Workspaces</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{metrics.totalTenants}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {metrics.activeTenants} Active
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{metrics.trialTenants} Trial • {metrics.suspendedTenants} Suspended</span>
              <span className="font-semibold text-blue-600">100% Online</span>
            </div>
          </div>

          {/* Card 2: Provisioned Licenses */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Seat Licenses</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{metrics.totalLicensesInUse}</span>
              <span className="text-xs text-slate-500 font-medium">/ {metrics.totalLicensesAllocated} Provisioned</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((metrics.totalLicensesInUse / (metrics.totalLicensesAllocated || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Card 3: Outbound Volume */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly WhatsApp Traffic</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {metrics.totalMessagesThisMonth.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                99.4% Delivery
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Avg Latency: 42ms</span>
              <span className="text-emerald-600 font-semibold">Zero drops</span>
            </div>
          </div>

          {/* Card 4: Platform MRR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform MRR</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
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
              <span className="text-amber-600 font-semibold">Active Subscriptions</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Tabbed Navigation Bar ── */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('tenants')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'tenants'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Building className="w-4 h-4 text-amber-600" />
              <span>Tenant Workspaces</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700 font-extrabold">
                {tenants.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gateway')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'gateway'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Meta Gateway & Webhooks</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'plans'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>SaaS Plan Tiers</span>
            </button>

            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'rbac'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Super Admin RBAC</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Platform Audit Trail</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'branding'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>White-Label & Global Config</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Main Body per Tab ── */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: TENANT WORKSPACES                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'tenants' && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by business name, tenant ID, owner, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
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
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Tier Filter */}
                <select
                  value={tierFilter}
                  onChange={(e: any) => setTierFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">All Plan Tiers</option>
                  <option value="enterprise">Enterprise PRO</option>
                  <option value="growth">Growth</option>
                  <option value="starter">Starter</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="trial">Trial Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>

                {/* View Switcher */}
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

            {/* Cards View */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTenants.map((tenant) => {
                  const percentSeats = Math.round((tenant.activeLicenses / (tenant.maxLicenses || 1)) * 100);
                  const percentMsgs = Math.round((tenant.messagesSentThisMonth / (tenant.monthlyMessageLimit || 1)) * 100);

                  return (
                    <div
                      key={tenant.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md flex flex-col justify-between ${
                        tenant.status === 'suspended'
                          ? 'border-rose-200 bg-rose-50/20'
                          : 'border-slate-200/90'
                      }`}
                    >
                      {/* Top Accent Gradient */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${tenant.color || 'from-emerald-500 to-teal-600'}`} />

                      <div className="p-5 space-y-4">
                        {/* Header: Avatar, Name, ID, Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tenant.color || 'from-emerald-500 to-teal-600'} text-white font-extrabold text-base flex items-center justify-center shadow-sm shrink-0`}>
                              {tenant.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-sm">{tenant.businessName}</h3>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                                  {tenant.id}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{tenant.branch || 'Head Office'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              tenant.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : tenant.status === 'trial'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {tenant.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                              {tenant.tier} PRO
                            </span>
                          </div>
                        </div>

                        {/* Owner & Contact Pill */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400 font-medium">Owner Admin:</span>
                            <span className="font-semibold text-slate-800">{tenant.ownerName}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400 font-medium">Contact:</span>
                            <span className="font-mono text-emerald-700 font-medium">{tenant.ownerPhone}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400 font-medium">Official WABA Line:</span>
                            <span className="font-mono text-slate-700 flex items-center gap-1">
                              {tenant.wabaStatus === 'connected' ? (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                              )}
                              {tenant.wabaPhone || 'Pending WABA'}
                            </span>
                          </div>
                        </div>

                        {/* Quota Progress Bars */}
                        <div className="space-y-2.5 pt-1">
                          {/* Seat License Quota */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-slate-500 font-medium">Seat Licenses Utilized:</span>
                              <span className="font-bold text-slate-800">
                                {tenant.activeLicenses} / {tenant.maxLicenses} Seats ({percentSeats}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, percentSeats)}%` }}
                              />
                            </div>
                          </div>

                          {/* Message Quota */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-slate-500 font-medium">Monthly Messages Sent:</span>
                              <span className="font-bold text-slate-800">
                                {tenant.messagesSentThisMonth.toLocaleString()} / {tenant.monthlyMessageLimit.toLocaleString()} ({percentMsgs}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-purple-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, percentMsgs)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {tenant.features.botBuilder && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-semibold">
                              Bot Builder
                            </span>
                          )}
                          {tenant.features.aiAssistant && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-semibold">
                              AI Assistant
                            </span>
                          )}
                          {tenant.features.voiceNotes && (
                            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-md text-[10px] font-semibold">
                              Voice Notes
                            </span>
                          )}
                          {tenant.features.customBranding && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-semibold">
                              White-Label
                            </span>
                          )}
                          {tenant.features.apiWebhooks && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-semibold">
                              Webhooks
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Switch Workspace */}
                        <button
                          onClick={() => handleImpersonateTenant(tenant)}
                          className="px-3 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Switch active organization view to this workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Switch Workspace</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Feature Flags */}
                          <button
                            onClick={() => setSelectedFeaturesTenant(tenant)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Toggle Feature Flags"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => setEditingTenant(tenant)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Workspace Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Suspend / Resume */}
                          <button
                            onClick={() => handleToggleTenantStatus(tenant)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              tenant.status === 'suspended'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={tenant.status === 'suspended' ? 'Reactivate Workspace' : 'Suspend Workspace'}
                          >
                            {tenant.status === 'suspended' ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteTenant(tenant)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Workspace"
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
              /* Table View */
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Workspace / ID</th>
                        <th className="py-3.5 px-4">Owner & Contact</th>
                        <th className="py-3.5 px-4">Plan & Billing</th>
                        <th className="py-3.5 px-4">Seats / Usage</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTenants.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${t.color || 'from-emerald-500 to-teal-600'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                                {t.initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{t.businessName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{t.id} • {t.branch}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{t.ownerName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{t.ownerPhone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-amber-800 uppercase text-[11px]">{t.tier} PRO</div>
                            <div className="text-[10px] text-slate-500">₹{t.amount.toLocaleString()} / mo</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{t.activeLicenses} / {t.maxLicenses} Seats</div>
                            <div className="text-[10px] text-slate-500">{t.messagesSentThisMonth.toLocaleString()} msgs</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              t.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : t.status === 'trial'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleImpersonateTenant(t)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                              >
                                Switch
                              </button>
                              <button
                                onClick={() => setEditingTenant(t)}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
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
        {/* TAB 2: META GATEWAY & WEBHOOKS                                           */}
        {/* ========================================================================= */}
        {activeTab === 'gateway' && (
          <div className="space-y-6">
            {/* Meta Cloud API Credentials & Live Webhook Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Server className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Meta WhatsApp Cloud API Engine</h3>
                    <p className="text-xs text-slate-500">Official Graph API v21.0 Gateway & Inbound Webhook Listener</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Webhook Verified & Active
                </span>
              </div>

              {/* Endpoint Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Webhook Callback URL */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Inbound Webhook Callback URL</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://api.whatsq.com/api/meta/webhook');
                        addToast('Webhook URL copied to clipboard!', 'success');
                      }}
                      className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 select-all truncate">
                    https://api.whatsq.com/api/meta/webhook
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Paste into Meta Developer App &gt; WhatsApp &gt; Configuration &gt; Callback URL
                  </p>
                </div>

                {/* Webhook Verification Token */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Webhook Verify Token</span>
                    <button
                      onClick={() => setRevealWebhookSecret(!revealWebhookSecret)}
                      className="text-slate-500 hover:text-slate-700 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {revealWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{revealWebhookSecret ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 select-all truncate">
                    {revealWebhookSecret ? 'whatsapp_bot_verify_token_2026' : '••••••••••••••••••••••••••••••••'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Used by Meta servers to verify the authenticity of your server during webhook handshakes.
                  </p>
                </div>
              </div>

              {/* Engine Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Node.js Gateway Engine</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">Port 3001 (Active)</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">WebSocket broadcaster live</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Django Business Core</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">Port 8000 (Active)</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">ORM & Multi-Tenant DB live</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-medium">WABA Account Quality</div>
                  <div className="font-bold text-emerald-600 text-sm mt-0.5">HIGH (Green 🟢)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">No quality restrictions</div>
                </div>
              </div>
            </div>

            {/* Platform Rate Limiter & Throttling Controls */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Sliders className="w-5 h-5 text-amber-600" />
                <span>Global Campaign Rate Limiting & Safety Controls</span>
              </div>
              <p className="text-xs text-slate-500">
                Protect your Meta WABA phone numbers from temporary blocks and anti-spam detection by enforcing strict inter-message delay intervals across all tenant outbound queues.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Minimum Safety Delay Between Bulk Messages (Seconds):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={rateLimitMinDelay}
                      onChange={(e) => setRateLimitMinDelay(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-sm text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                      {rateLimitMinDelay}s
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Recommended: 8–15s to simulate natural human typing speeds and maintain 100% Meta trust.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Automatic Failure Circuit Breaker:
                  </label>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Threshold: 5% consecutive delivery errors</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      If any tenant's bulk campaign encounters &gt;5% Meta API errors (e.g. invalid numbers or blocked recipients), the platform automatically pauses their queue and alerts the super admin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => addToast('Global rate limit policies applied across all tenant queues.', 'success')}
                  className="px-4 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  Save Throttle Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SAAS PLAN TIERS                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Subscription Plans & Feature Tiers</h3>
                <p className="text-xs text-slate-500">Configure licensing quotas, pricing and feature access per tier</p>
              </div>
              <button
                onClick={() => addToast('Custom Plan Builder is available in Enterprise Edition', 'info')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                + Add Custom Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {INITIAL_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-2xs transition hover:shadow-md relative ${
                    plan.popular ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/90'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {plan.badge}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 mt-2">{plan.name}</h4>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        {plan.currency}{plan.monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Max Staff Seats:</span>
                        <span className="font-bold text-slate-800">{plan.maxLicenses} Seats</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Monthly Messages:</span>
                        <span className="font-bold text-slate-800">{plan.maxMessages.toLocaleString()} msgs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">WhatsApp Lines:</span>
                        <span className="font-bold text-slate-800">{plan.maxWabaNumbers} Number(s)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Features Included:</div>
                      <div className="space-y-1.5">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <button
                      onClick={() => addToast(`Configuring ${plan.name}...`, 'info')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Edit Plan Limits
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SUPER ADMIN RBAC & PRIVILEGES                                     */}
        {/* ========================================================================= */}
        {activeTab === 'rbac' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Super Admin Role & Root Privileges</h3>
                  <p className="text-xs text-slate-500">
                    Highest platform administrative tier with omnipotent permissions across all tenant boundaries
                  </p>
                </div>
              </div>

              {/* Master Root Privileges Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    title: 'Multi-Tenant Impersonation',
                    desc: 'Instantly assume workspace identity for any tenant without requiring customer passwords.',
                  },
                  {
                    title: 'Meta WABA Token Rotation',
                    desc: 'Full authority to update System User Tokens and re-verify Meta webhook endpoints.',
                  },
                  {
                    title: 'Emergency Global Kill-Switch',
                    desc: 'Ability to halt all outbound broadcast campaigns platform-wide in emergency scenarios.',
                  },
                  {
                    title: 'Encrypted Snapshot Extraction',
                    desc: 'Direct access to multi-tenant database exports and automated backup scheduling.',
                  },
                  {
                    title: 'Tenant Quota Overrides',
                    desc: 'Manually expand staff licenses or outbound message ceilings for VIP enterprise accounts.',
                  },
                  {
                    title: 'Financial & Billing Overrides',
                    desc: 'Generate complimentary trial extensions or modify subscription billing schedules.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{item.title}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Super Admin Profiles */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ACTIVE PLATFORM SUPER ADMINS (2)
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="Rahul Mehta"
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-amber-400"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          Rahul Mehta
                          <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded uppercase">
                            Primary Owner
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">rahul.mehta@coolfix.in • 2FA Active</div>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-semibold text-[11px]">🟢 Active Session</span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                        VA
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          Vishnu Admin
                          <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded uppercase">
                            Platform Lead
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">admin@qiyam.ventures • 2FA Active</div>
                      </div>
                    </div>
                    <span className="text-slate-500 text-[11px]">Idle (Last seen 2h ago)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PLATFORM AUDIT TRAIL                                              */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter audit logs by action, actor, target or IP..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={auditSeverity}
                  onChange={(e: any) => setAuditSeverity(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="security">Security</option>
                  <option value="critical">Critical</option>
                </select>

                <button
                  onClick={() => {
                    const csvContent = 'data:text/csv;charset=utf-8,' +
                      ['Timestamp,Actor,Role,Action,Target,Severity,IP'].join(',') + '\n' +
                      auditLogs.map((l) => `"${l.timestamp}","${l.actor}","${l.actorRole}","${l.action.replace(/"/g, '""')}","${l.targetTenant}","${l.severity}","${l.ipAddress}"`).join('\n');
                    const encoded = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encoded);
                    link.setAttribute('download', `platform_audit_log_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    addToast('Audit Log exported to CSV!', 'success');
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Workspace</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4 text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{log.actor}</div>
                          <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          <div className="text-slate-800 font-medium leading-relaxed">{log.action}</div>
                          {log.details && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{log.details}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold whitespace-nowrap">
                          {log.targetTenant || 'Global'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                            log.severity === 'info'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : log.severity === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : log.severity === 'security'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: WHITE-LABEL & GLOBAL CONFIG                                       */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveBranding} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">White-Label & Global Platform Branding</h3>
                  <p className="text-xs text-slate-500">Configure global platform metadata, support endpoints and maintenance banner</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Master Platform Title:</label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Platform Subtitle / Tagline:</label>
                  <input
                    type="text"
                    value={platformTagline}
                    onChange={(e) => setPlatformTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Primary Support WhatsApp Line:</label>
                  <input
                    type="text"
                    value={supportWhatsApp}
                    onChange={(e) => setSupportWhatsApp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Primary Support Email:</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Maintenance Mode Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-800">Platform Maintenance Announcement Banner</div>
                    <div className="text-[11px] text-slate-500">Show a top banner alert across all logged-in staff sessions</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer accent-amber-500"
                  />
                </div>

                {maintenanceMode && (
                  <input
                    type="text"
                    value={maintenanceBannerText}
                    onChange={(e) => setMaintenanceBannerText(e.target.value)}
                    placeholder="Enter announcement text..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  Save Platform Configurations
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── 5. MODAL: PROVISION NEW TENANT ── */}
      {isCreateTenantOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-amber-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Provision New Tenant Workspace</h3>
                  <p className="text-[11px] text-amber-200/80">Onboard a client organization with dedicated quotas</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateTenantOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Business / Workspace Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics India"
                  value={newTenantForm.businessName}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Branch / HQ Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Calicut Central"
                    value={newTenantForm.branch}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Subscription Tier</label>
                  <select
                    value={newTenantForm.tier}
                    onChange={(e: any) => setNewTenantForm({ ...newTenantForm, tier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white cursor-pointer"
                  >
                    <option value="starter">Starter (₹2,499/mo)</option>
                    <option value="growth">Growth (₹5,999/mo)</option>
                    <option value="enterprise">Enterprise PRO (₹14,999/mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={newTenantForm.ownerName}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Owner Phone (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={newTenantForm.ownerPhone}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Owner Email Address</label>
                <input
                  type="email"
                  placeholder="admin@apexlogistics.com"
                  value={newTenantForm.ownerEmail}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Max Staff Seat Licenses</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newTenantForm.maxLicenses}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, maxLicenses: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Monthly Messages Cap</label>
                  <input
                    type="number"
                    min={1000}
                    step={5000}
                    value={newTenantForm.monthlyMessageLimit}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, monthlyMessageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                💡 <strong>Instant Multi-Tenant Provisioning:</strong> The workspace will be initialized with dedicated database isolation, default keyword triggers, and RBAC security controls.
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. MODAL: EDIT TENANT ── */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Edit Workspace: {editingTenant.businessName}</h3>
              </div>
              <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-white cursor-pointer">
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Seat Licenses Cap</label>
                  <input
                    type="number"
                    value={editingTenant.maxLicenses}
                    onChange={(e) => setEditingTenant({ ...editingTenant, maxLicenses: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Monthly Message Cap</label>
                  <input
                    type="number"
                    value={editingTenant.monthlyMessageLimit}
                    onChange={(e) => setEditingTenant({ ...editingTenant, monthlyMessageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Subscription Tier</label>
                  <select
                    value={editingTenant.tier}
                    onChange={(e: any) => setEditingTenant({ ...editingTenant, tier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Status</label>
                  <select
                    value={editingTenant.status}
                    onChange={(e: any) => setEditingTenant({ ...editingTenant, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
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
                    addToast(`Updated workspace "${editingTenant.businessName}"`, 'success');
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MODAL: TENANT FEATURE FLAGS ── */}
      {selectedFeaturesTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Feature Flags: {selectedFeaturesTenant.businessName}
                </h3>
              </div>
              <button onClick={() => setSelectedFeaturesTenant(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-500 text-[11px]">
                Toggle available modules and SaaS engine capabilities for this workspace:
              </p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                {(Object.keys(selectedFeaturesTenant.features) as (keyof TenantFeatureConfig)[]).map((featureKey) => {
                  const labelMap: Record<keyof TenantFeatureConfig, string> = {
                    multiAccount: 'Multi-Account & Multi-Line Routing',
                    botBuilder: 'Interactive Workflow Builder & Triggers',
                    interactiveButtons: 'Interactive WhatsApp Buttons & Lists',
                    customBranding: 'White-Label Branding & Custom Logo',
                    aiAssistant: 'AI Knowledge Base & LLM Assistant',
                    bulkCampaigns: 'Bulk Campaigns & Phone Grabber',
                    voiceNotes: 'Audio Transcription & Voice Messaging',
                    apiWebhooks: 'External REST API Webhook Access',
                  };

                  const isChecked = selectedFeaturesTenant.features[featureKey];

                  return (
                    <div key={featureKey} className="p-3 flex items-center justify-between">
                      <span className="font-medium text-slate-800">{labelMap[featureKey]}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updatedFeatures = {
                            ...selectedFeaturesTenant.features,
                            [featureKey]: !isChecked,
                          };
                          const updatedTenant = {
                            ...selectedFeaturesTenant,
                            features: updatedFeatures,
                          };
                          setSelectedFeaturesTenant(updatedTenant);
                          const updatedList = tenants.map((t) =>
                            t.id === selectedFeaturesTenant.id ? updatedTenant : t
                          );
                          saveTenants(updatedList);
                        }}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer accent-amber-500"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFeaturesTenant(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. MODAL: GLOBAL BROADCAST ANNOUNCEMENT ── */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-amber-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Global Workspace Broadcast</h3>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendGlobalBroadcast} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Announcement Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['info', 'warning', 'critical'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setBroadcastSeverity(sev)}
                      className={`py-2 px-2 rounded-xl font-bold uppercase text-[10px] transition cursor-pointer border ${
                        broadcastSeverity === sev
                          ? sev === 'critical'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : sev === 'warning'
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Broadcast Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. System upgrade scheduled tonight at 1:00 AM UTC. No downtime expected."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-slate-800"
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
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
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

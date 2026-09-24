import { useState, useEffect } from 'react';
import { TenantSidebarModule, PlatformTenant, TenantTrialRecord, TenantAddonPurchase } from '@/types';
import { TabType } from '@/types';
import {
  BarChart3, MessageSquare, Send, UserCheck, Building2,
  Briefcase, IndianRupee, Zap, Bot, TrendingUp,
  Puzzle, ShieldCheck, Database, Settings
} from 'lucide-react';
import { apiClient } from '@/api/client';

export interface ModulePricingInfo {
  id: TenantSidebarModule;
  label: string;
  category: string;
  description: string;
  addonMonthlyPrice: number; // in INR ₹
  addonAnnualPrice: number;
  highlightFeatures: string[];
  icon: any;
}

export const MODULE_PRICING_CATALOG: Record<TenantSidebarModule, ModulePricingInfo> = {
  dashboard: {
    id: 'dashboard',
    label: 'Executive Dashboard',
    category: 'Core',
    description: 'System KPIs, revenue numbers & operational overview',
    addonMonthlyPrice: 499,
    addonAnnualPrice: 4990,
    highlightFeatures: ['Executive KPI Cards', 'Revenue Tracking', 'Live Agent Workload', 'Daily Performance Overview'],
    icon: BarChart3,
  },
  conversations: {
    id: 'conversations',
    label: 'WhatsApp Inbox',
    category: 'Messenger',
    description: 'Live two-way WhatsApp chat & agent collision detection',
    addonMonthlyPrice: 999,
    addonAnnualPrice: 9990,
    highlightFeatures: ['Two-way WhatsApp Chat', 'Realistic Read & Delivery Ticks', 'Staff Dynamic Assignment', 'Audio/Voice Notes Player'],
    icon: MessageSquare,
  },
  messenger: {
    id: 'messenger',
    label: 'Bulk Broadcasts',
    category: 'Messenger',
    description: 'Bulk WhatsApp campaigns, recipient lists & scheduler',
    addonMonthlyPrice: 799,
    addonAnnualPrice: 7990,
    highlightFeatures: ['Meta Verified Broadcasts', 'CSV/Excel Contact Upload', 'Scheduled Dispatches', 'Opt-out Compliance Engine'],
    icon: Send,
  },
  crm: {
    id: 'crm',
    label: 'CRM & Pipeline',
    category: 'Sales',
    description: 'Leads, customers, deals pipeline & follow-up scheduler',
    addonMonthlyPrice: 999,
    addonAnnualPrice: 9990,
    highlightFeatures: ['Kanban Pipeline Stages', 'Lead Conversion Tracker', 'Automated Follow-ups', 'Customer 360 Profiles'],
    icon: UserCheck,
  },
  branches: {
    id: 'branches',
    label: 'Multi-Branch Management',
    category: 'Organization',
    description: 'Regional office locations, store branches & managers',
    addonMonthlyPrice: 1499,
    addonAnnualPrice: 14990,
    highlightFeatures: ['Multi-store Regional Hubs', 'Store Branch Targets', 'Branch Comparison Matrix', 'Live Geo Dispatch Map'],
    icon: Building2,
  },
  ops: {
    id: 'ops',
    label: 'Operations & Field Service',
    category: 'Operations',
    description: 'Work orders, bookings, technician roster, attendance & tasks',
    addonMonthlyPrice: 1999,
    addonAnnualPrice: 19990,
    highlightFeatures: ['Technician Dispatch & Jobs', 'Appointment Scheduler', 'Attendance & Duty Tracking', 'Route Optimization'],
    icon: Briefcase,
  },
  finance: {
    id: 'finance',
    label: 'Finance & Invoicing',
    category: 'Finance',
    description: 'GST invoices, quotations, expense ledger & payments',
    addonMonthlyPrice: 1299,
    addonAnnualPrice: 12990,
    highlightFeatures: ['GST-compliant Invoicing', 'Instant PDF Quotations', 'Payment Gateway Receipts', 'Staff Salary & Tax Ledger'],
    icon: IndianRupee,
  },
  automation: {
    id: 'automation',
    label: 'Workflow Automation',
    category: 'Automation',
    description: 'Visual drag-drop canvas & keyword trigger rules',
    addonMonthlyPrice: 1199,
    addonAnnualPrice: 11990,
    highlightFeatures: ['Visual Node Flow Builder', 'Instant Keyword Autoresponders', 'Drip Campaigns', 'Multi-step Logic Trees'],
    icon: Zap,
  },
  ai: {
    id: 'ai',
    label: 'AI Copilot & Knowledge',
    category: 'AI Assistant',
    description: 'RAG knowledge base, AI smart suggestions & templates',
    addonMonthlyPrice: 999,
    addonAnnualPrice: 9990,
    highlightFeatures: ['Autonomous WhatsApp AI Bot', 'Semantic Vector Knowledge Search', 'Smart Reply Generator', 'Multilingual Support'],
    icon: Bot,
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics & BI',
    category: 'Intelligence',
    description: 'Deep performance reports, charts & conversion trends',
    addonMonthlyPrice: 899,
    addonAnnualPrice: 8990,
    highlightFeatures: ['Revenue Heatmaps', 'Agent First Response Time', 'Resolution Conversion Rates', 'Automated Daily Reports'],
    icon: TrendingUp,
  },
  integrations: {
    id: 'integrations',
    label: 'Integrations & Webhooks',
    category: 'Ecosystem',
    description: 'Meta Cloud API, REST webhook endpoints & connectors',
    addonMonthlyPrice: 699,
    addonAnnualPrice: 6990,
    highlightFeatures: ['Custom REST Webhooks', 'CRM & ERP Connectors', 'Zapier/Make Gateway', 'Event Stream Logs'],
    icon: Puzzle,
  },
  roles: {
    id: 'roles',
    label: 'Roles & Security (RBAC)',
    category: 'Security',
    description: 'Granular permissions matrix & staff access policies',
    addonMonthlyPrice: 799,
    addonAnnualPrice: 7990,
    highlightFeatures: ['Granular Feature Permissions', 'Custom Role Designer', 'Data Access Scopes', 'Staff Audit Trails'],
    icon: ShieldCheck,
  },
  'settings-backup': {
    id: 'settings-backup',
    label: 'Data Backup & Restore',
    category: 'System',
    description: 'Automated database backups & recovery snapshots',
    addonMonthlyPrice: 599,
    addonAnnualPrice: 5990,
    highlightFeatures: ['Automated Cloud Snapshots', '1-Click Rollback & Restore', 'Encrypted Offsite Storage', 'Compliance Archive'],
    icon: Database,
  },
  settings: {
    id: 'settings',
    label: 'Workspace Settings',
    category: 'System',
    description: 'Company profile, branding, timezone & preferences',
    addonMonthlyPrice: 399,
    addonAnnualPrice: 3990,
    highlightFeatures: ['Custom Domain & White-label', 'Brand Logo & Colors', 'Working Hours & Holidays', 'Regional Number Config'],
    icon: Settings,
  },
};

/**
 * Maps a concrete navigation tab to its parent Module
 */
export const getModuleForTab = (tab: TabType): TenantSidebarModule | null => {
  if (tab === 'dashboard' || tab === 'super-admin' || tab === 'landing') return 'dashboard';
  if (tab === 'conversations') return 'conversations';

  if (tab.startsWith('bulk-')) return 'messenger';
  if (tab.startsWith('crm-')) return 'crm';
  if (tab === 'branches' || tab.startsWith('branches-') || tab === 'automation-branches') return 'branches';
  if (tab.startsWith('ops-') || tab === 'automation-approvals') return 'ops';
  if (tab.startsWith('finance-')) return 'finance';
  if (tab.startsWith('automation-')) return 'automation';
  if (tab.startsWith('ai-') || tab === 'template-hub' || tab === 'template-create') return 'ai';
  if (tab === 'analytics') return 'analytics';
  if (tab === 'integrations') return 'integrations';
  if (tab === 'roles') return 'roles';
  if (tab === 'settings-backup') return 'settings-backup';
  if (tab === 'settings' || tab === 'settings-whatsapp') return 'settings';

  return null;
};

/**
 * Demo Client with ALL Add-On Plans and Free Trials Expired
 */
export const DEMO_EXPIRED_TENANT: PlatformTenant = {
  id: 'TN-EXPIRED-DEMO',
  businessName: 'Apex Retail Solutions (Expired 7d Trial & Add-ons)',
  initials: 'AR',
  branch: 'Demo Outlet • Calicut',
  ownerName: 'Vikram Malhotra (Demo Account)',
  ownerEmail: 'vikram.demo@apexretail.in',
  ownerPhone: '+91 94963 00233',
  tier: 'starter',
  amount: 2499,
  billingCycle: 'monthly',
  createdAt: '2026-07-01',
  lastPaymentDate: '2026-08-01',
  lastPaymentAmount: 2499,
  lastPaymentMethod: 'UPI Autopay (Expired)',
  nextPaymentDueDate: '2026-09-01',
  paymentStatus: 'overdue',
  metaWalletBalance: 120,
  metaWalletCurrency: '₹',
  metaWalletStatus: 'low',
  metaDailyLimit: 5000,
  metaTier: 'Tier 1 (1k/day)',
  activeLicenses: 6,
  maxLicenses: 10,
  onlineStaffCount: 1,
  status: 'active',
  wabaStatus: 'connected',
  wabaPhone: '+91 94963 00233',
  wabaId: '1098915959329999',
  wabaQualityScore: 'MEDIUM',
  wabaLatencyMs: 65,
  lastWebhookPing: '5m ago',
  messagesSentThisMonth: 8200,
  monthlyMessageLimit: 15000,
  color: 'from-rose-500 to-red-600',
  trialConfigDays: 7,
  features: {
    multiAccount: false,
    botBuilder: false,
    interactiveButtons: true,
    customBranding: false,
    aiAssistant: false,
    bulkCampaigns: false,
    voiceNotes: false,
    apiWebhooks: false,
  },
  // Only the 3 base starter modules are enabled in their base plan
  sidebarModules: ['dashboard', 'conversations', 'settings'],
  activeTrials: {
    messenger: {
      moduleId: 'messenger',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    crm: {
      moduleId: 'crm',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    branches: {
      moduleId: 'branches',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    ops: {
      moduleId: 'ops',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    finance: {
      moduleId: 'finance',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    automation: {
      moduleId: 'automation',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    ai: {
      moduleId: 'ai',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    analytics: {
      moduleId: 'analytics',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    integrations: {
      moduleId: 'integrations',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    roles: {
      moduleId: 'roles',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
    'settings-backup': {
      moduleId: 'settings-backup',
      startedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-09-08T00:00:00.000Z',
      durationDays: 7,
      preExpiryNotified: true,
      expiredNotified: true,
      status: 'expired',
    },
  },
  addonPurchases: {
    messenger: {
      moduleId: 'messenger',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 799,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_MESSENGER',
    },
    crm: {
      moduleId: 'crm',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 999,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_CRM',
    },
    branches: {
      moduleId: 'branches',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 1499,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_BRANCHES',
    },
    ops: {
      moduleId: 'ops',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 1999,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_OPS',
    },
    finance: {
      moduleId: 'finance',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 1299,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_FINANCE',
    },
    automation: {
      moduleId: 'automation',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 1199,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_AUTOMATION',
    },
    ai: {
      moduleId: 'ai',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 999,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_AI',
    },
    analytics: {
      moduleId: 'analytics',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 899,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_ANALYTICS',
    },
    integrations: {
      moduleId: 'integrations',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 699,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_INTEGRATIONS',
    },
    roles: {
      moduleId: 'roles',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 799,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_ROLES',
    },
    'settings-backup': {
      moduleId: 'settings-backup',
      purchasedAt: '2026-08-15T10:00:00.000Z',
      expiresAt: '2026-09-15T10:00:00.000Z',
      billingCycle: 'monthly',
      monthlyAmount: 599,
      status: 'expired',
      paymentRef: 'pay_DEMO_EXPIRED_BACKUP',
    },
  },
};

/**
 * Initial platform tenants list
 */
export const INITIAL_PLATFORM_TENANTS: PlatformTenant[] = [
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
  DEMO_EXPIRED_TENANT,
];

/**
 * Check if a module is unlocked for the tenant
 */
export const isModuleUnlockedForTenant = (
  tenant: PlatformTenant | null,
  moduleId: TenantSidebarModule
): {
  isUnlocked: boolean;
  reason: 'plan' | 'addon' | 'trial' | 'locked';
  trialDaysLeft?: number;
  trialHoursLeft?: number;
  expiresAt?: string;
  trialRecord?: TenantTrialRecord;
  addonRecord?: TenantAddonPurchase;
} => {
  if (!tenant) return { isUnlocked: false, reason: 'locked' };

  // 1. Included in tenant's base sidebar modules
  const inBasePlan = Array.isArray(tenant.sidebarModules) && tenant.sidebarModules.includes(moduleId);
  if (inBasePlan) {
    return { isUnlocked: true, reason: 'plan' };
  }

  // 2. Active Add-on purchase
  const addon = tenant.addonPurchases?.[moduleId];
  if (addon) {
    const now = Date.now();
    const isExpired = addon.status === 'expired' || (addon.expiresAt && new Date(addon.expiresAt).getTime() <= now);
    if (!isExpired && addon.status === 'active') {
      return { isUnlocked: true, reason: 'addon', addonRecord: addon };
    }
  }

  // 3. Active Free Trial
  const trial = tenant.activeTrials?.[moduleId];
  if (trial) {
    const now = Date.now();
    const expiry = new Date(trial.expiresAt).getTime();
    if (expiry > now && trial.status !== 'expired') {
      const msLeft = expiry - now;
      const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return {
        isUnlocked: true,
        reason: 'trial',
        trialDaysLeft: daysLeft,
        trialHoursLeft: hoursLeft,
        expiresAt: trial.expiresAt,
        trialRecord: trial,
        addonRecord: addon,
      };
    }
    return {
      isUnlocked: false,
      reason: 'locked',
      trialRecord: trial,
      addonRecord: addon,
    };
  }

  return { isUnlocked: false, reason: 'locked', addonRecord: addon };
};

/**
 * Helper to dispatch real WhatsApp notification via backend webhook or Meta API
 */
const sendWhatsAppAlert = async (phone: string, text: string) => {
  if (!phone) return;
  try {
    await apiClient.post('/conversations/threads/start_whatsapp_chat/', {
      phone_number: phone,
      initial_message: text,
      assigned_to: 'Super Admin',
    });
  } catch (err) {
    console.warn('Real WhatsApp alert notice:', err);
  }
};

/**
 * Helper to read current tenants from storage
 */
export const getStoredTenants = (): PlatformTenant[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('whatsq_platform_tenants') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure the demo expired tenant is available and correctly expired
        const existingIdx = parsed.findIndex((t: any) => t.id === 'TN-EXPIRED-DEMO');
        if (existingIdx === -1) {
          const merged = [...parsed, DEMO_EXPIRED_TENANT];
          try {
            localStorage.setItem('whatsq_platform_tenants', JSON.stringify(merged));
          } catch {}
          return merged;
        } else {
          // Force update DEMO_EXPIRED_TENANT so it strictly reflects the 7-day expired trial & expired add-on configuration
          const existing = parsed[existingIdx];
          const hasUnlockedLockedModules = existing.sidebarModules && existing.sidebarModules.includes('analytics');
          const isDuration14 = existing.activeTrials && Object.values(existing.activeTrials).some((t: any) => t.durationDays === 14);
          if (
            hasUnlockedLockedModules ||
            !existing.activeTrials ||
            !existing.addonPurchases ||
            isDuration14 ||
            existing.trialConfigDays !== 7 ||
            existing.businessName !== DEMO_EXPIRED_TENANT.businessName
          ) {
            parsed[existingIdx] = {
              ...existing,
              ...DEMO_EXPIRED_TENANT,
              businessName: DEMO_EXPIRED_TENANT.businessName,
              sidebarModules: ['dashboard', 'conversations', 'settings'],
              trialConfigDays: 7,
              activeTrials: DEMO_EXPIRED_TENANT.activeTrials,
              addonPurchases: DEMO_EXPIRED_TENANT.addonPurchases,
            };
            try {
              localStorage.setItem('whatsq_platform_tenants', JSON.stringify(parsed));
            } catch {}
          }
          return parsed;
        }
      }
    }
  } catch {}
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('whatsq_platform_tenants', JSON.stringify(INITIAL_PLATFORM_TENANTS));
    }
  } catch {}
  return INITIAL_PLATFORM_TENANTS;
};

/**
 * Helper to save tenants to storage and notify UI
 */
export const saveStoredTenants = (tenants: PlatformTenant[]) => {
  try {
    localStorage.setItem('whatsq_platform_tenants', JSON.stringify(tenants));
    window.dispatchEvent(new CustomEvent('whatsq_tenants_updated', { detail: tenants }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save tenants:', err);
  }
};

/**
 * Start a Free Trial for a tenant on a specific module
 */
export const startTenantModuleTrial = async (
  tenantId: string,
  moduleId: TenantSidebarModule,
  customDays?: number
): Promise<{ success: boolean; trial: TenantTrialRecord; tenant: PlatformTenant }> => {
  const tenants = getStoredTenants();
  const idx = tenants.findIndex((t) => t.id === tenantId);
  if (idx === -1) {
    throw new Error(`Tenant with ID ${tenantId} not found`);
  }

  const tenant = tenants[idx];
  const days = customDays || tenant.trialConfigDays || 7;
  const now = new Date();
  const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const trial: TenantTrialRecord = {
    moduleId,
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    durationDays: days,
    preExpiryNotified: false,
    expiredNotified: false,
    status: 'active',
  };

  const updatedTenant: PlatformTenant = {
    ...tenant,
    activeTrials: {
      ...(tenant.activeTrials || {}),
      [moduleId]: trial,
    },
  };

  tenants[idx] = updatedTenant;
  saveStoredTenants(tenants);

  const modInfo = MODULE_PRICING_CATALOG[moduleId] || { label: moduleId };
  const ownerPhone = tenant.ownerPhone;
  const formattedExpiry = expires.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Real WhatsApp notification to client
  if (ownerPhone) {
    const alertMsg = `🎉 *Free Trial Activated: ${modInfo.label}*\n\nHello *${tenant.ownerName || 'Client'}*,\nYour *${days}-Day Free Trial* for *${modInfo.label}* on *${tenant.businessName}* has been unlocked!\n\n⏳ *Valid Until:* ${formattedExpiry}\n💡 Explore all features with zero limits.\n\nReply to this chat if you have any questions or wish to upgrade.`;
    sendWhatsAppAlert(ownerPhone, alertMsg);
  }

  return { success: true, trial, tenant: updatedTenant };
};

/**
 * Purchase an individual module as an add-on
 */
export const purchaseTenantModuleAddon = async (
  tenantId: string,
  moduleId: TenantSidebarModule
): Promise<{ success: boolean; addon: TenantAddonPurchase; tenant: PlatformTenant }> => {
  const tenants = getStoredTenants();
  const idx = tenants.findIndex((t) => t.id === tenantId);
  if (idx === -1) {
    throw new Error(`Tenant with ID ${tenantId} not found`);
  }

  const tenant = tenants[idx];
  const modInfo = MODULE_PRICING_CATALOG[moduleId];
  const amount = modInfo?.addonMonthlyPrice || 999;
  const now = new Date().toISOString();

  const addon: TenantAddonPurchase = {
    moduleId,
    purchasedAt: now,
    monthlyAmount: amount,
    status: 'active',
    paymentRef: `pay_addon_${Date.now()}`,
  };

  // Add to active modules if not present
  const currentModules = tenant.sidebarModules || [];
  const nextModules = currentModules.includes(moduleId) ? currentModules : [...currentModules, moduleId];

  // Remove or supersede any active trial
  const nextTrials = { ...(tenant.activeTrials || {}) };
  if (nextTrials[moduleId]) {
    delete nextTrials[moduleId];
  }

  const updatedTenant: PlatformTenant = {
    ...tenant,
    sidebarModules: nextModules,
    activeTrials: nextTrials,
    addonPurchases: {
      ...(tenant.addonPurchases || {}),
      [moduleId]: addon,
    },
  };

  tenants[idx] = updatedTenant;
  saveStoredTenants(tenants);

  // Real WhatsApp receipt & confirmation
  if (tenant.ownerPhone) {
    const receiptMsg = `✅ *Add-On Unlocked: ${modInfo?.label || moduleId}*\n\nHello *${tenant.ownerName || 'Client'}*,\nYou have successfully unlocked the *${modInfo?.label || moduleId}* standalone add-on for *₹${amount}/month*.\n\n✨ *No full plan bundle required!* You now have permanent access to this module on *${tenant.businessName}*.\n\nPayment Ref: ${addon.paymentRef}`;
    sendWhatsAppAlert(tenant.ownerPhone, receiptMsg);
  }

  return { success: true, addon, tenant: updatedTenant };
};

/**
 * Background checker: inspects all trials for pre-expiry (< 24h) and expiration
 */
export const checkAndNotifyTrialExpirations = (
  addToast?: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void
) => {
  const tenants = getStoredTenants();
  let hasModifications = false;
  const now = Date.now();

  const updatedTenants = tenants.map((tenant) => {
    if (!tenant.activeTrials || Object.keys(tenant.activeTrials).length === 0) {
      return tenant;
    }

    const nextTrials = { ...tenant.activeTrials };
    let tenantModified = false;

    Object.entries(nextTrials).forEach(([modKey, trial]) => {
      const moduleId = modKey as TenantSidebarModule;
      const modInfo = MODULE_PRICING_CATALOG[moduleId] || { label: moduleId, addonMonthlyPrice: 999 };
      const expiry = new Date(trial.expiresAt).getTime();
      const msRemaining = expiry - now;

      // Case A: Expired
      if (msRemaining <= 0 && trial.status !== 'expired') {
        nextTrials[moduleId] = {
          ...trial,
          status: 'expired',
          expiredNotified: true,
        };
        tenantModified = true;
        hasModifications = true;

        if (addToast) {
          addToast(`Your trial for "${modInfo.label}" has expired. Purchase add-on to restore access.`, 'warning');
        }

        // WhatsApp notification: After Trial Ended
        if (tenant.ownerPhone && !trial.expiredNotified) {
          const expiredMsg = `🔴 *Trial Expired: ${modInfo.label}*\n\nHello *${tenant.ownerName || 'Client'}*,\nYour free trial for *${modInfo.label}* has now expired.\n\nTo restore instant access, you can unlock this feature as an individual add-on for only *₹${modInfo.addonMonthlyPrice}/month* without upgrading your whole plan.\n\nContact support or open the software to purchase.`;
          sendWhatsAppAlert(tenant.ownerPhone, expiredMsg);
        }
      }
      // Case B: Pre-expiry warning (under 24 hours remaining)
      else if (msRemaining > 0 && msRemaining <= 24 * 60 * 60 * 1000 && !trial.preExpiryNotified) {
        const hoursLeft = Math.max(1, Math.round(msRemaining / (1000 * 60 * 60)));
        nextTrials[moduleId] = {
          ...trial,
          status: 'expiring_soon',
          preExpiryNotified: true,
        };
        tenantModified = true;
        hasModifications = true;

        if (addToast) {
          addToast(`Trial warning: "${modInfo.label}" will expire in ${hoursLeft} hours!`, 'info');
        }

        // WhatsApp notification: Before Trial Ending
        if (tenant.ownerPhone) {
          const preExpiryMsg = `⚠️ *Trial Expiring Soon: ${modInfo.label}*\n\nHello *${tenant.ownerName || 'Client'}*,\nYour free trial for *${modInfo.label}* expires in *${hoursLeft} hours*!\n\nWant to keep this feature? You can purchase it as a standalone add-on for just *₹${modInfo.addonMonthlyPrice}/month*.\n\nLock in your access now!`;
          sendWhatsAppAlert(tenant.ownerPhone, preExpiryMsg);
        }
      }
    });

    if (tenantModified) {
      return { ...tenant, activeTrials: nextTrials };
    }
    return tenant;
  });

  if (hasModifications) {
    saveStoredTenants(updatedTenants);
  }
};

/**
 * React hook to access active tenant with real-time trial/addon status sync
 */
export const useActiveTenant = () => {
  const [tenants, setTenants] = useState<PlatformTenant[]>(() => getStoredTenants());
  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('whatsq_active_tenant_id') || localStorage.getItem('whatsq_active_workspace_id');
      if (stored) return stored;
    } catch {}
    return 'TN2345';
  });

  useEffect(() => {
    const handleSync = (e?: any) => {
      setTenants(getStoredTenants());
      try {
        const fromEvt = e?.detail?.tenantId || e?.detail?.id;
        const stored = fromEvt || localStorage.getItem('whatsq_active_tenant_id') || localStorage.getItem('whatsq_active_workspace_id');
        if (stored) setActiveTenantId(stored);
      } catch {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('whatsq_workspace_updated', handleSync);
    window.addEventListener('whatsq_tenants_updated', handleSync);

    // Initial check on load
    checkAndNotifyTrialExpirations();

    // Check trial expiration every 60 seconds
    const interval = setInterval(() => {
      checkAndNotifyTrialExpirations();
      handleSync();
    }, 60000);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('whatsq_workspace_updated', handleSync);
      window.removeEventListener('whatsq_tenants_updated', handleSync);
      clearInterval(interval);
    };
  }, []);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || (tenants.length > 0 ? tenants[0] : null);

  return { activeTenant, activeTenantId, tenants };
};

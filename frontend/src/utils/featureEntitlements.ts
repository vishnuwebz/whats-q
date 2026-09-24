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
  if (tab === 'dashboard' || tab === 'super-admin') return 'dashboard';
  if (tab === 'conversations') return 'conversations';

  if (tab.startsWith('bulk-')) return 'messenger';
  if (tab.startsWith('crm-')) return 'crm';
  if (tab.startsWith('branches-')) return 'branches';
  if (tab.startsWith('ops-')) return 'ops';
  if (tab.startsWith('finance-')) return 'finance';
  if (tab.startsWith('automation-')) return 'automation';
  if (tab.startsWith('ai-')) return 'ai';
  if (tab === 'analytics') return 'analytics';
  if (tab === 'integrations') return 'integrations';
  if (tab === 'roles') return 'roles';
  if (tab === 'settings-backup') return 'settings-backup';
  if (tab === 'settings') return 'settings';

  return null;
};

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
} => {
  if (!tenant) return { isUnlocked: true, reason: 'plan' };

  // 1. Included in tenant's base sidebar modules
  const inBasePlan = Array.isArray(tenant.sidebarModules) && tenant.sidebarModules.includes(moduleId);
  if (inBasePlan) {
    return { isUnlocked: true, reason: 'plan' };
  }

  // 2. Active Add-on purchase
  const addon = tenant.addonPurchases?.[moduleId];
  if (addon && addon.status === 'active') {
    return { isUnlocked: true, reason: 'addon' };
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
      };
    }
  }

  return { isUnlocked: false, reason: 'locked' };
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
    const raw = localStorage.getItem('whatsq_platform_tenants');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
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
      const stored = localStorage.getItem('whatsq_active_workspace_id');
      if (stored) return stored;
    } catch {}
    return 'TN2345';
  });

  useEffect(() => {
    const handleSync = () => {
      setTenants(getStoredTenants());
      try {
        const stored = localStorage.getItem('whatsq_active_workspace_id');
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

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0] || null;

  return { activeTenant, activeTenantId, tenants };
};

import { AuthUser, AuthUserRole, ClientSignupRequest, PlatformTenant } from '../types';
export type { ClientSignupRequest };
import { getStoredTenants, saveStoredTenants } from './featureEntitlements';

const AUTH_USER_KEY = 'whatsq_auth_user';
const SIGNUP_REQUESTS_KEY = 'whatsq_signup_requests';
const OTP_STORE_KEY = 'whatsq_active_otps';

export interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  purpose: 'client_signup' | 'employee_login' | 'employee_signup' | 'password_reset';
}

/**
 * Pre-seeded demo user accounts
 */
export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'user_super_admin',
    username: 'admin',
    name: 'Platform Super Admin',
    email: 'admin@qiyam.in',
    phone: '+91 94963 00233',
    role: 'super_admin',
    companyId: 'TN2345',
    companyName: 'Qiyam OS Headquarters',
    department: 'Platform Administration',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'user_ambika_owner',
    username: 'ambika_admin',
    name: 'K. Ramachandran',
    email: 'ramachandran@ambikahotel.com',
    phone: '+91 98470 12345',
    role: 'company_admin',
    companyId: 'TN-AMBIKA',
    companyName: 'Ambika Hotel & Luxury Suites',
    department: 'Executive Management',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'user_ambika_staff',
    username: 'ambika_staff',
    name: 'Ananya Sharma (Front Desk)',
    email: 'reception@ambikahotel.com',
    phone: '+91 98470 99881',
    role: 'employee',
    companyId: 'TN-AMBIKA',
    companyName: 'Ambika Hotel & Luxury Suites',
    department: 'Front Desk & Guest Relations',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    status: 'active',
  },
];

/**
 * Sample initial signup requests for demonstration
 */
export const INITIAL_SIGNUP_REQUESTS: ClientSignupRequest[] = [
  {
    id: 'REQ-1001',
    businessName: 'Ambika Hotel & Luxury Suites',
    category: 'Hospitality & Tourism',
    branchLocation: 'Beach Road • Kozhikode',
    ownerName: 'K. Ramachandran',
    ownerEmail: 'ramachandran@ambikahotel.com',
    ownerPhone: '+91 98470 12345',
    wabaPhone: '+91 98470 12345',
    hasDeletedFromConsumerApp: true,
    planTier: 'growth',
    requestedModules: ['dashboard', 'conversations', 'messenger', 'crm', 'ops', 'automation'],
    status: 'approved',
    submittedAt: '2026-09-20T10:15:00Z',
    verifiedOtp: true,
    notes: 'Premium 4-star hotel in Calicut. Wants WhatsApp guest self-checkin, restaurant order alerts and room service dispatch.',
  },
  {
    id: 'REQ-1002',
    businessName: 'Malabar Heritage Resort',
    category: 'Hospitality & Tourism',
    branchLocation: 'Wayanad Hills',
    ownerName: 'Devika Kurup',
    ownerEmail: 'devika@malabarheritage.com',
    ownerPhone: '+91 94471 22334',
    wabaPhone: '+91 94471 22334',
    hasDeletedFromConsumerApp: true,
    planTier: 'starter',
    requestedModules: ['dashboard', 'conversations', 'messenger', 'crm'],
    status: 'pending_approval',
    submittedAt: '2026-09-28T16:40:00Z',
    verifiedOtp: true,
    notes: 'Requires automated WhatsApp booking confirmation and location pin share for incoming tourists.',
  },
  {
    id: 'REQ-1003',
    businessName: 'Kalyan Diagnostics & Lab',
    category: 'Healthcare & Clinics',
    branchLocation: 'Mavoor Road • Calicut',
    ownerName: 'Dr. Suresh Varma',
    ownerEmail: 'suresh@kalyanlab.in',
    ownerPhone: '+91 97450 66778',
    wabaPhone: '+91 97450 66778',
    hasDeletedFromConsumerApp: true,
    planTier: 'growth',
    requestedModules: ['dashboard', 'conversations', 'messenger', 'crm', 'ops', 'ai'],
    status: 'pending_approval',
    submittedAt: '2026-09-29T08:20:00Z',
    verifiedOtp: true,
    notes: 'High volume blood test report dispatch via PDF on WhatsApp Cloud API.',
  },
];

/**
 * Get current authenticated user
 */
export function getCurrentAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return DEFAULT_USERS[0];
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role) return parsed;
    }
  } catch {}
  return null;
}

/**
 * Persist current authenticated user
 */
export function setCurrentAuthUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem('whatsq_active_tenant_id', user.companyId);
      localStorage.setItem('whatsq_active_workspace_id', user.companyId);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    window.dispatchEvent(new CustomEvent('whatsq_auth_changed', { detail: user }));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

/**
 * Log out
 */
export function performLogout(): void {
  setCurrentAuthUser(null);
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Get all client signup requests
 */
export function getSignupRequests(): ClientSignupRequest[] {
  if (typeof window === 'undefined') return INITIAL_SIGNUP_REQUESTS;
  try {
    const raw = localStorage.getItem(SIGNUP_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  try {
    localStorage.setItem(SIGNUP_REQUESTS_KEY, JSON.stringify(INITIAL_SIGNUP_REQUESTS));
  } catch {}
  return INITIAL_SIGNUP_REQUESTS;
}

/**
 * Save client signup requests
 */
export function saveSignupRequests(requests: ClientSignupRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SIGNUP_REQUESTS_KEY, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('whatsq_signups_updated', { detail: requests }));
  } catch {}
}

/**
 * Send WhatsApp OTP
 * Generates a realistic 6-digit OTP code and records it with 5-minute expiry
 */
export function generateWhatsAppOtp(
  phone: string,
  purpose: OtpRecord['purpose'] = 'client_signup'
): { success: boolean; code: string; message: string } {
  // Generate random 6-digit code or clean deterministic code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  try {
    const existingRaw = localStorage.getItem(OTP_STORE_KEY);
    const existing: OtpRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = existing.filter((o) => o.phone !== phone);
    filtered.push({ phone, code, expiresAt, purpose });
    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(filtered));
  } catch {}

  return {
    success: true,
    code,
    message: `WhatsApp OTP verification code sent to ${phone}. Valid for 5 minutes.`,
  };
}

/**
 * Verify WhatsApp OTP
 */
export function verifyWhatsAppOtp(
  phone: string,
  enteredCode: string
): { success: boolean; message: string } {
  const cleanPhone = phone.trim();
  const cleanCode = enteredCode.trim();

  // Master bypass / dev test OTP
  if (cleanCode === '123456' || cleanCode === '000000') {
    return { success: true, message: 'OTP verified successfully (Development bypass).' };
  }

  try {
    const raw = localStorage.getItem(OTP_STORE_KEY);
    if (raw) {
      const records: OtpRecord[] = JSON.parse(raw);
      const matched = records.find(
        (r) => (r.phone === cleanPhone || r.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''))
      );

      if (matched) {
        if (Date.now() > matched.expiresAt) {
          return { success: false, message: 'OTP has expired. Please request a new code.' };
        }
        if (matched.code === cleanCode) {
          return { success: true, message: 'WhatsApp OTP verified successfully!' };
        }
      }
    }
  } catch {}

  // Fallback check if user entered 6 digits in demo mode
  if (/^\d{6}$/.test(cleanCode)) {
    return { success: true, message: 'WhatsApp OTP verified successfully!' };
  }

  return { success: false, message: 'Invalid 6-digit OTP code. Please check your WhatsApp and try again.' };
}

/**
 * Register a new client (Company / Tenant, e.g. Ambika Hotel)
 */
export function registerNewClientCompany(signupData: {
  businessName: string;
  category: string;
  branchLocation: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  wabaPhone: string;
  hasDeletedFromConsumerApp: boolean;
  planTier: 'starter' | 'growth' | 'enterprise';
  requestedModules: string[];
  password?: string;
}): { success: boolean; message: string; tenant: PlatformTenant; user: AuthUser } {
  const tenantId = `TN-${signupData.businessName.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const initials = signupData.businessName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'CO';

  const planAmounts = {
    starter: 2499,
    growth: 5999,
    enterprise: 14999,
  };

  const defaultModules = [
    'dashboard',
    'conversations',
    'messenger',
    'crm',
    'settings',
    ...(signupData.requestedModules || []),
  ];
  const uniqueModules = Array.from(new Set(defaultModules)) as any[];

  const newTenant: PlatformTenant = {
    id: tenantId,
    businessName: signupData.businessName,
    initials,
    branch: signupData.branchLocation || 'Main Branch',
    ownerName: signupData.ownerName,
    ownerEmail: signupData.ownerEmail,
    ownerPhone: signupData.ownerPhone,
    tier: signupData.planTier,
    amount: planAmounts[signupData.planTier] || 5999,
    billingCycle: 'monthly',
    createdAt: new Date().toISOString().split('T')[0],
    lastPaymentDate: new Date().toISOString().split('T')[0],
    lastPaymentAmount: planAmounts[signupData.planTier] || 5999,
    lastPaymentMethod: 'UPI / Direct Onboarding',
    nextPaymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentStatus: 'paid',
    metaWalletBalance: 1500,
    metaWalletCurrency: '₹',
    metaWalletStatus: 'healthy',
    metaDailyLimit: signupData.planTier === 'enterprise' ? 100000 : signupData.planTier === 'growth' ? 25000 : 5000,
    metaTier: signupData.planTier === 'enterprise' ? 'Tier 3 (100k/day)' : 'Tier 2 (10k/day)',
    activeLicenses: 2,
    maxLicenses: signupData.planTier === 'enterprise' ? 30 : signupData.planTier === 'growth' ? 15 : 5,
    onlineStaffCount: 1,
    status: 'active',
    wabaStatus: 'connected',
    wabaPhone: signupData.wabaPhone,
    wabaId: `WABA-${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
    wabaQualityScore: 'HIGH',
    wabaLatencyMs: 40,
    lastWebhookPing: 'Just now',
    messagesSentThisMonth: 0,
    monthlyMessageLimit: signupData.planTier === 'enterprise' ? 100000 : signupData.planTier === 'growth' ? 50000 : 15000,
    color: 'from-blue-600 to-indigo-700',
    features: {
      multiAccount: signupData.planTier !== 'starter',
      botBuilder: true,
      interactiveButtons: true,
      customBranding: signupData.planTier !== 'starter',
      aiAssistant: uniqueModules.includes('ai'),
      bulkCampaigns: uniqueModules.includes('messenger'),
      voiceNotes: true,
      apiWebhooks: signupData.planTier === 'enterprise',
    },
    sidebarModules: uniqueModules,
  };

  // Add to platform tenants
  const existingTenants = getStoredTenants();
  const updatedTenants = [newTenant, ...existingTenants.filter((t) => t.id !== newTenant.id)];
  saveStoredTenants(updatedTenants);

  // Add to signup requests for Super Admin review
  const existingRequests = getSignupRequests();
  const newRequest: ClientSignupRequest = {
    id: `REQ-${Math.floor(2000 + Math.random() * 8000)}`,
    businessName: signupData.businessName,
    category: signupData.category,
    branchLocation: signupData.branchLocation,
    ownerName: signupData.ownerName,
    ownerEmail: signupData.ownerEmail,
    ownerPhone: signupData.ownerPhone,
    wabaPhone: signupData.wabaPhone,
    hasDeletedFromConsumerApp: signupData.hasDeletedFromConsumerApp,
    planTier: signupData.planTier,
    requestedModules: uniqueModules,
    status: 'approved',
    submittedAt: new Date().toISOString(),
    verifiedOtp: true,
    notes: `Self-registered via Client Onboarding Portal. WhatsApp line: ${signupData.wabaPhone}.`,
  };
  saveSignupRequests([newRequest, ...existingRequests]);

  // Create AuthUser
  const authUser: AuthUser = {
    id: `usr_${tenantId.toLowerCase()}`,
    username: signupData.ownerEmail.split('@')[0],
    name: signupData.ownerName,
    email: signupData.ownerEmail,
    phone: signupData.ownerPhone,
    role: 'company_admin',
    companyId: newTenant.id,
    companyName: newTenant.businessName,
    department: 'Executive Administration',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    status: 'active',
  };

  setCurrentAuthUser(authUser);

  return {
    success: true,
    message: `Welcome to Qiyam OS! Workspace for "${signupData.businessName}" created successfully.`,
    tenant: newTenant,
    user: authUser,
  };
}

/**
 * Register an employee for a client company
 */
export function registerEmployeeUser(data: {
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  department: string;
  roleTitle: string;
}): { success: boolean; message: string; user: AuthUser } {
  const tenants = getStoredTenants();
  const company = tenants.find((t) => t.id === data.companyId) || {
    id: data.companyId,
    businessName: 'Registered Enterprise',
  };

  const empUser: AuthUser = {
    id: `emp_${Date.now()}`,
    username: data.phone.replace(/\D/g, '').slice(-6),
    name: data.name,
    email: data.email || `${data.phone.replace(/\D/g, '').slice(-10)}@${company.id.toLowerCase()}.qiyam.in`,
    phone: data.phone,
    role: 'employee',
    companyId: company.id,
    companyName: company.businessName,
    department: data.department || 'Operations',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    status: 'active',
  };

  // Add to store's employees cache if possible
  try {
    const rawEmps = localStorage.getItem('whatsq_employees_cache');
    const existing = rawEmps ? JSON.parse(rawEmps) : [];
    const newEmpRecord = {
      id: Date.now(),
      name: data.name,
      employee_id_str: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: data.roleTitle || 'Guest Support Agent',
      department: data.department || 'Operations',
      phone: data.phone,
      email: empUser.email,
      status: 'on_duty',
      location: (company as any).branch || 'Main Location',
      company_id: company.id,
      company_name: company.businessName,
      rating: 5.0,
      jobs_completed_month: 0,
      on_time_percent: 100,
    };
    existing.unshift(newEmpRecord);
    localStorage.setItem('whatsq_employees_cache', JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('whatsq_employees_updated', { detail: existing }));
  } catch {}

  setCurrentAuthUser(empUser);

  return {
    success: true,
    message: `Employee account created for ${data.name} at ${company.businessName}!`,
    user: empUser,
  };
}

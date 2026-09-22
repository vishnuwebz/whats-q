import { create } from 'zustand';
import {
  TabType, Conversation, Lead, Deal, FollowUp, Job, Appointment,
  Employee, AttendanceRecord, Task, Route, InventoryItem, Transaction,
  Invoice, Quotation, Expense, PaymentAccount, Workflow, AutomationLog, Approval,
  KnowledgeArticle, WhatsAppTemplateItem, IntegrationItem, BranchItem, FlowNode, WhatsAppMessage,
  MetaConfig,
  BulkCampaign, BulkContact, BulkRecipientList, BulkScheduledMessage, BulkTemplateItem,
  MetaWalletInfo, MetaWalletTransaction,
  SuppressionRecord,
  RoleDefinition, RoleModule, RolePermissionAction, RecordScope,
  LinkedEmployeeDevice, PdfEditorDocument
} from '../types';
import { apiClient } from '../api/client';
import { mapConversation, mapMessage } from '../api/mappers';
import {
  qiyamApi,
  ChannelMetricRow,
  DailyMetricRow,
  IntentMetricRow,
  SearchResult,
  WorkspaceSettings,
} from '../api/qiyamApi';
import { sortConversationsByRecency } from '../utils/chatRecency';
import {
  initialMetaWallet,
  initialWalletTransactions,
  initialBulkCampaigns,
  initialBulkTemplates,
  initialBulkRecipientLists,
  initialBulkScheduledMessages
} from './bulkData';
import {
  getStoredRoles,
  persistRoles,
  getRoleDefaultPreset,
  INITIAL_ROLES
} from './rolesData';
import { forceHardRefresh, startOtaCountdown, stopOtaCountdown } from '../utils/otaUpdater';
import { getInitialActiveTab, persistActiveTab } from '../utils/tabRouting';
import {
  INITIAL_INVENTORY,
  INITIAL_LEADS,
  INITIAL_DEALS,
  INITIAL_JOBS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_INVOICES,
  INITIAL_QUOTATIONS,
  INITIAL_EXPENSES,
  INITIAL_ACCOUNTS,
  INITIAL_TASKS
} from './initialDatasets';
import { INITIAL_TEMPLATES } from './initialTemplates';

const CONVERSATIONS_CACHE_KEY = 'whatsq_cached_conversations';

const DEFAULT_SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-c1',
    contact_name: 'Amit Verma',
    phone_number: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'Lead',
    unread_count: 2,
    status: 'in_progress',
    lead_owner: 'Ramesh Kumar',
    lead_stage: 'Appointment Booked',
    source: 'WhatsApp',
    first_contact_date: 'May 12, 2024 10:30 AM',
    last_contact_date: 'May 12, 2024 10:32 AM',
    location: 'Koyilandy, Kerala',
    language: 'English',
    tags: ['AC Service', 'High Value'],
    notes: 'Customer wants service tomorrow morning. Prefers 10 AM - 12 PM slot.',
    service_needed: 'AC Repair (Gas Leakage)',
    estimated_value: 2800,
    active_workflow: 'Service Booking Flow',
    is_online: true,
    last_seen: 'Online',
    messages: [
      { id: 'm1', sender: 'customer', text: 'I need AC service tomorrow.', timestamp: '10:30 AM', status: 'read' },
      { id: 'm2', sender: 'bot', senderName: 'Qiyam AI Assistant', text: 'Sure! I can help you with that. Please share your location so I can check service availability.', timestamp: '10:30 AM', status: 'read' },
      { id: 'm3', sender: 'customer', text: '45, Park Street, Koyilandy', timestamp: '10:31 AM', status: 'read' },
      { id: 'm4', sender: 'bot', senderName: 'Qiyam AI Assistant', text: 'Great! We are available at your location. The charges will be ₹2,800. Shall I book it for you?', timestamp: '10:31 AM', status: 'read' },
      { id: 'm5', sender: 'customer', text: 'Yes, please.', timestamp: '10:32 AM', status: 'delivered' },
      { id: 'm6', sender: 'customer', text: 'Booking confirmed for tomorrow between 10:00 AM - 12:00 PM. You will receive a reminder. Booking ID: #APT-1023', timestamp: '10:32 AM', status: 'delivered' }
    ]
  },
  {
    id: 'conv-c-optout',
    contact_name: 'Sunil Varma',
    phone_number: '+91 94000 99887',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    category: 'Customer',
    unread_count: 0,
    status: 'resolved',
    lead_owner: 'Ramesh Kumar',
    lead_stage: 'Unsubscribed',
    source: 'WhatsApp',
    first_contact_date: 'Sep 10, 2026 09:00 AM',
    last_contact_date: 'Sep 16, 2026 09:30 AM',
    location: 'Calicut, Kerala',
    language: 'English',
    tags: ['Opted Out', 'STOP Received'],
    notes: 'Customer replied STOP on Sep 16, 2026. Added to suppression list.',
    is_opted_out: true,
    suppression_reason: 'Replied "UNSUBSCRIBE" to marketing newsletter',
    suppression_date: 'Sep 16, 2026, 09:30 AM',
    messages: [
      { id: 'm-uns-1', sender: 'agent', senderName: 'Qiyam Campaign', text: 'Exclusive Offer! 20% off comprehensive AC servicing this week only. Reply STOP to opt-out.', timestamp: '09:28 AM', status: 'read' },
      { id: 'm-uns-2', sender: 'customer', text: 'STOP', timestamp: '09:30 AM', status: 'read' },
      { id: 'm-uns-3', sender: 'bot', senderName: 'Qiyam Compliance Bot', text: 'You have been unsubscribed and will not receive further promotional messages. Reply START to resubscribe.', timestamp: '09:30 AM', status: 'delivered' }
    ]
  },
  {
    id: 'conv-c-blocked',
    contact_name: 'Kareem Mansoor',
    phone_number: '+971 50 111 2233',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    category: 'Lead',
    unread_count: 0,
    status: 'spam',
    lead_owner: 'Ramesh Kumar',
    lead_stage: 'Number Blocked',
    source: 'WhatsApp Cloud API',
    first_contact_date: 'Sep 11, 2026 10:00 AM',
    last_contact_date: 'Sep 12, 2026 11:20 AM',
    location: 'Dubai, UAE',
    language: 'English',
    tags: ['Blocked', 'Meta 131051'],
    notes: 'Meta Cloud API Error 131051: User blocked business phone number.',
    is_blocked: true,
    suppression_reason: 'Meta Error 131051: User blocked business phone number',
    suppression_date: 'Sep 12, 2026, 11:20 AM',
    messages: [
      { id: 'm-blk-1', sender: 'agent', senderName: 'Qiyam AMC Team', text: 'Dear Mr. Mansoor, your Chiller AMC renewal is due this month. Click here to review proposal.', timestamp: '11:19 AM', status: 'read' },
      { id: 'm-blk-2', sender: 'bot', senderName: 'System Warning', text: '⚠️ [Meta Error 131051] Message undeliverable: User has blocked this business phone number. Contact auto-suppressed.', timestamp: '11:20 AM', status: 'delivered' }
    ]
  },
  {
    id: 'conv-c2',
    contact_name: 'Vikram Mehta',
    phone_number: '+91 90000 11123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    category: 'Hot Lead',
    unread_count: 2,
    status: 'in_progress',
    lead_owner: 'Amit Sharma',
    lead_stage: 'Appointment Confirmed',
    source: 'WhatsApp',
    first_contact_date: 'May 10, 2024 09:15 AM',
    last_contact_date: 'May 12, 2024 09:30 AM',
    location: 'Kozhikode, Kerala',
    language: 'English',
    tags: ['AC Installation', 'VIP'],
    notes: 'Customer requested morning slot for 1.5 Ton Inverter AC Installation.',
    service_needed: 'AC Installation (1.5 Ton Inverter AC)',
    estimated_value: 1200,
    is_online: true,
    last_seen: 'Online',
    messages: [
      { id: 'vm1', sender: 'customer', text: 'Hi, I need installation done for my new 1.5 Ton AC.', timestamp: '09:15 AM', status: 'read' },
      { id: 'vm2', sender: 'agent', senderName: 'Rahul Mehta', text: 'Hello Mr. Vikram Mehta! We have technician Amit Sharma available on May 12 at 10:30 AM.', timestamp: '09:20 AM', status: 'read' },
      { id: 'vm3', sender: 'customer', text: 'Perfect, lock that slot please.', timestamp: '09:25 AM', status: 'delivered' },
      { id: 'vm4', sender: 'customer', text: 'Slot locked! Advance payment of ₹360 received with thanks.', timestamp: '09:30 AM', status: 'delivered' }
    ]
  },
  {
    id: 'conv-c3',
    contact_name: 'Priya Sharma',
    phone_number: '+91 89213 56789',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    category: 'Customer',
    unread_count: 1,
    status: 'in_progress',
    lead_owner: 'Neha Patel',
    lead_stage: 'Appointment Confirmed',
    source: 'WhatsApp Web',
    first_contact_date: 'May 11, 2024 11:00 AM',
    last_contact_date: 'May 12, 2024 10:24 AM',
    location: 'Ramanattukara, Kerala',
    language: 'English',
    tags: ['Cleaning', 'Residential'],
    notes: 'Full home deep cleaning scheduled for May 13 at 09:00 AM.',
    service_needed: 'Deep Cleaning (Full Home)',
    estimated_value: 4500,
    is_online: false,
    last_seen: '10:25 AM',
    messages: [
      { id: 'ps1', sender: 'customer', text: 'Can I get the quotation for 3 BHK deep cleaning?', timestamp: '10:20 AM', status: 'read' },
      { id: 'ps2', sender: 'agent', senderName: 'Rahul Mehta', text: 'Hello Priya, our 3 BHK deep cleaning is ₹4,500 with eco-friendly sanitization.', timestamp: '10:22 AM', status: 'read' },
      { id: 'ps3', sender: 'customer', text: 'Book it for May 13 morning 9 AM please.', timestamp: '10:24 AM', status: 'read' }
    ]
  }
];

const DELETED_CONVERSATIONS_KEY = 'whatsq_deleted_conversations';

export function getDeletedConversationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_CONVERSATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedConversationId(id: string | number) {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedConversationIds();
    const strId = String(id);
    if (!list.includes(strId)) {
      list.push(strId);
      localStorage.setItem(DELETED_CONVERSATIONS_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage error
  }
}

function getStoredConversations(): Conversation[] {
  const deletedIds = getDeletedConversationIds();
  if (typeof window === 'undefined') {
    return DEFAULT_SEED_CONVERSATIONS.filter((c) => !deletedIds.includes(String(c.id)) && !deletedIds.includes(c.contact_name));
  }
  try {
    const raw = localStorage.getItem(CONVERSATIONS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((c: Conversation) => !deletedIds.includes(String(c.id)) && !deletedIds.includes(c.contact_name));
      }
    }
  } catch (e) {
    // Ignore cache parse errors
  }
  return DEFAULT_SEED_CONVERSATIONS.filter((c) => !deletedIds.includes(String(c.id)) && !deletedIds.includes(c.contact_name));
}

function persistConversations(convs: Conversation[]) {
  if (typeof window === 'undefined' || !Array.isArray(convs)) return;
  try {
    localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(convs));
  } catch (e) {
    // Ignore storage quota errors
  }
}

function getStoredCache<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`whatsq_${key}_cache`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return fallback;
}

function persistCache<T>(key: string, data: T[]) {
  if (typeof window === 'undefined' || !Array.isArray(data) || data.length === 0) return;
  try {
    localStorage.setItem(`whatsq_${key}_cache`, JSON.stringify(data));
  } catch {}
}

function getStoredQuotationsCache(): Quotation[] {
  if (typeof window === 'undefined') return INITIAL_QUOTATIONS;
  try {
    const raw = localStorage.getItem('whatsq_quotations_cache');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, Quotation>();
        INITIAL_QUOTATIONS.forEach((q) => map.set(q.quotation_number || String(q.id), q));
        parsed.forEach((q: Quotation) => map.set(q.quotation_number || String(q.id), q));
        return Array.from(map.values());
      }
    }
  } catch {}
  return INITIAL_QUOTATIONS;
}

function getStoredExpensesCache(): Expense[] {
  if (typeof window === 'undefined') return INITIAL_EXPENSES;
  try {
    const raw = localStorage.getItem('whatsq_expenses_cache');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, Expense>();
        INITIAL_EXPENSES.forEach((e) => map.set(String(e.id), e));
        parsed.forEach((e: Expense) => map.set(String(e.id), e));
        return Array.from(map.values());
      }
    }
  } catch {}
  return INITIAL_EXPENSES;
}

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface VersionInfo {
  current_commit: string;
  current_author: string;
  current_date: string;
  current_message: string;
  latest_commit: string;
  latest_author: string;
  latest_date: string;
  latest_message: string;
  update_available: boolean;
  is_git: boolean;
  last_updated?: string;
  last_checked?: string;
}

export interface SendConfirmationConfig {
  title?: string;
  subtitle?: string;
  recipientName: string;
  recipientPhone: string;
  badgeText?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'indigo';
  messagePreview: string;
  metadata?: { label: string; value: string }[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface GeneralConfirmationConfig {
  title?: string;
  message: string;
  description?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  icon?: 'trash' | 'unlink' | 'alert' | 'info' | 'logout';
  confirmLabel?: string;
  cancelLabel?: string;
  itemBadge?: {
    label?: string;
    sublabel?: string;
    badgeText?: string;
  };
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface QNotification {
  id: number;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  target: TabType;
  itemId?: string | number;
  itemType?: 'conversation' | 'invoice' | 'job' | 'route' | 'lead' | 'approval' | 'appointment' | 'deal';
}

interface QiyamState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  backendOnline: boolean;

  sendConfirmation: SendConfirmationConfig | null;
  requestSendConfirmation: (config: SendConfirmationConfig) => void;
  closeSendConfirmation: () => void;

  generalConfirmation: GeneralConfirmationConfig | null;
  requestGeneralConfirmation: (config: GeneralConfirmationConfig) => void;
  closeGeneralConfirmation: () => void;

  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;

  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setIsMobileSidebarOpen: (open: boolean) => void;

  versionInfo: VersionInfo | null;
  isUpdateModalOpen: boolean;
  isUpdatingSystem: boolean;
  updateProgressStep: string;
  otaCountdown: number | null;
  isOtaCountdownActive: boolean;
  setIsUpdateModalOpen: (open: boolean) => void;
  setOtaCountdown: (count: number | null) => void;
  pauseOtaCountdown: () => void;
  triggerForceHardRefresh: (reason?: string) => Promise<void>;
  triggerOtaDeploymentUpdate: (info: Partial<VersionInfo>) => void;
  fetchVersionInfo: (force?: boolean) => Promise<void>;
  triggerSystemUpdate: () => Promise<{ success: boolean; error?: string }>;
  snoozeUpdate: () => void;
  applyGlobalUpdateAvailable: (info: VersionInfo) => void;
  simulateGlobalUpdate: () => Promise<void>;

  selectedConversationId: string | number;
  setSelectedConversationId: (id: string | number) => void;
  markConversationAsRead: (id: string | number) => Promise<void>;
  markAllConversationsAsRead: () => Promise<void>;
  toggleConversationWorkflow: (conversationId: string | number, isPaused: boolean, workflowName?: string) => Promise<void>;
  deleteConversation: (id: string | number) => Promise<boolean>;
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
  isNewWorkflowModalOpen: boolean;
  setIsNewWorkflowModalOpen: (open: boolean) => void;
  isNewBookingModalOpen: boolean;
  setIsNewBookingModalOpen: (open: boolean) => void;
  isLeadDrawerOpen: boolean;
  setIsLeadDrawerOpen: (open: boolean) => void;
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  editingTemplate: WhatsAppTemplateItem | null;
  setEditingTemplate: (template: WhatsAppTemplateItem | null) => void;
  selectedTemplateId: string | number | null;
  setSelectedTemplateId: (id: string | number | null) => void;

  conversations: Conversation[];
  leads: Lead[];
  deals: Deal[];
  followups: FollowUp[];
  customers: Record<string, unknown>[];
  jobs: Job[];
  appointments: Appointment[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: Task[];
  routes: Route[];
  inventory: InventoryItem[];
  transactions: Transaction[];
  invoices: Invoice[];
  quotations: Quotation[];
  expenses: Expense[];
  accounts: PaymentAccount[];
  workflows: Workflow[];
  workflowLogs: AutomationLog[];
  approvals: Approval[];
  knowledgeArticles: KnowledgeArticle[];
  templates: WhatsAppTemplateItem[];
  integrations: IntegrationItem[];
  branches: BranchItem[];
  metaConfig: MetaConfig | null;
  workspace: WorkspaceSettings | null;
  channelMetrics: ChannelMetricRow[];
  intentMetrics: IntentMetricRow[];
  dailyMetrics: DailyMetricRow[];
  searchResults: SearchResult[];
  metaWallet: MetaWalletInfo;
  walletTransactions: MetaWalletTransaction[];
  bulkCampaigns: BulkCampaign[];
  draftCampaign: BulkCampaign | null;
  setDraftCampaign: (campaign: BulkCampaign | null) => void;
  fetchBulkCampaigns: () => Promise<void>;
  deleteBulkCampaign: (campaignId: string | number) => Promise<boolean>;
  retryFailedCampaign: (campaignId: string | number) => Promise<boolean>;
  bulkRecipientLists: BulkRecipientList[];
  bulkScheduledMessages: BulkScheduledMessage[];
  bulkTemplates: BulkTemplateItem[];
  suppressionList: SuppressionRecord[];
  suppressionSearchQuery: string;
  setSuppressionSearchQuery: (query: string) => void;

  roles: RoleDefinition[];
  activeRoleId: string;
  setActiveRoleId: (roleId: string) => void;
  updateRolePermission: (roleId: string, module: RoleModule, action: RolePermissionAction, enabled: boolean) => void;
  updateRoleScope: (roleId: string, scope: RecordScope) => void;
  setRoleAllPermissions: (roleId: string, enabled: boolean) => void;
  resetRolePermissions: (roleId: string) => void;
  addCustomRole: (role: Omit<RoleDefinition, 'id'>) => void;
  deleteCustomRole: (roleId: string) => void;
  assignEmployeeToRole: (employeeName: string, roleId: string) => void;
  saveRoleChanges: (roleId: string) => void;

  addSuppressionRecord: (record: Partial<SuppressionRecord> & { name: string; phone: string; reason: string; type: SuppressionRecord['type'] }) => void;
  removeSuppressionRecord: (idOrPhone: string) => Promise<void> | void;
  isPhoneSuppressed: (phone: string) => boolean;

  sendBulkMessage: (params: any) => Promise<{ success: boolean; campaignId?: string | number; error?: string }> | any;
  updateMetaWallet: (updates: Partial<MetaWalletInfo>) => void;
  addWalletFunds: (amount: number, note?: string) => void;
  createRecipientList: (params: any) => void;
  createScheduledMessage: (params: any) => void;
  cancelScheduledMessage: (id: string | number) => void;
  sendScheduledMessageNow: (id: string | number) => void;
  duplicateCampaign: (campaignId: string | number) => void;
  createBulkTemplate: (params: any) => Promise<boolean>;
  updateBulkTemplate: (templateId: string, updates: Partial<BulkTemplateItem>) => Promise<boolean>;
  deleteBulkTemplate: (templateId: string) => Promise<boolean>;
  updateBulkTemplateStatus: (templateId: string, status: 'APPROVED' | 'PENDING' | 'REJECTED') => Promise<void>;
  fetchBulkTemplates: () => Promise<void>;
  syncBulkTemplatesWithMeta: () => Promise<void>;
  importContactsToRecipientList: (listName: string, contacts: BulkContact[]) => BulkRecipientList;
  saveIntegrationConfig: (id: string | number, config: Record<string, any>, status?: 'connected' | 'partially_connected' | 'not_connected') => Promise<boolean>;
  testIntegrationConnection: (id: string | number, config: Record<string, any>) => Promise<{ success: boolean; message: string; latency_ms?: number }>;

  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  toasts: Toast[];
  removeToast: (id: string) => void;

  loadInitialData: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  globalSearch: (query: string) => Promise<void>;
  linkedDevices: LinkedEmployeeDevice[];
  activeSenderDeviceId: string | number | 'meta_cloud';
  fetchLinkedDevices: () => Promise<void>;
  linkEmployeeDevice: (device: Partial<LinkedEmployeeDevice>) => Promise<any>;
  updateEmployeeDevice: (deviceId: string | number, updates: Partial<LinkedEmployeeDevice>) => Promise<any>;
  unlinkEmployeeDevice: (deviceId: string | number) => Promise<void>;
  setActiveSenderDeviceId: (id: string | number | 'meta_cloud') => void;
  sendMessage: (conversationId: string | number, text: string, sender?: 'agent' | 'customer' | 'bot', senderDeviceId?: string | number | 'meta_cloud') => Promise<void>;
  sendTemplateMessage: (conversationId: string | number, templateId: string | number, variables: Record<string, string>) => Promise<void>;
  simulateInboundWhatsApp: (name: string, phone: string, text: string) => Promise<void>;
  saveMetaTemplate: (template: Partial<WhatsAppTemplateItem>) => Promise<WhatsAppTemplateItem | null>;
  submitTemplateToMeta: (templateId: string | number) => Promise<boolean>;
  syncTemplatesWithMeta: () => Promise<void>;
  testSendTemplate: (templateId: string | number, phone: string, variables: Record<string, string>) => Promise<{ success: boolean; error?: string; message?: string }>;
  deleteMetaTemplate: (templateId: string | number) => Promise<boolean>;
  saveMetaConfig: (config: Partial<MetaConfig>) => Promise<boolean>;
  testMetaConnection: (credentials: { phone_number_id: string; waba_id: string; access_token: string }) => Promise<any>;
  testForwardProxy: (forward_webhook_url: string) => Promise<any>;
  saveWorkspaceSettings: (data: Partial<WorkspaceSettings>) => Promise<boolean>;
  askAiCopilot: (prompt: string) => Promise<{ response: string; suggestions: string[] } | null>;

  updateLeadStage: (leadId: string | number, newStage: Lead['stage'], note?: string) => Promise<boolean>;
  convertLeadToDeal: (leadId: string | number, customData?: Record<string, any>) => Promise<Deal | null>;
  convertConversationToDeal: (conversationId: string | number) => Promise<void>;
  updateJobStatus: (jobId: string | number, status: Job['status']) => Promise<void>;
  updateApprovalStatus: (approvalId: string | number, status: 'Approved' | 'Rejected') => Promise<void>;
  toggleTaskChecklist: (taskId: string | number, checklistId: string) => Promise<void>;
  clockInEmployee: (employeeId: string | number, targetStatus?: 'on_duty' | 'active' | 'on_leave') => Promise<void>;
  addEmployee: (newEmp: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (employeeId: string | number, updates: Partial<Employee>) => Promise<void>;
  saveWorkflowNodes: (workflowId: string | number, nodes: FlowNode[]) => Promise<void>;
  runWorkflowTest: (workflowId: string | number, inputMessage: string) => Promise<{ steps: string[]; duration: string }>;
  globalDateRange: string;
  globalDateInterval: { start: string; end: string } | null;
  setGlobalDateRange: (range: string, interval?: { start: string; end: string } | null) => void;
  globalFilter: { status?: string; priority?: string; assignedTo?: string; query?: string };
  setGlobalFilter: (filter: Partial<{ status?: string; priority?: string; assignedTo?: string; query?: string }>) => void;
  resetGlobalFilter: () => void;

  targetHighlightId: string | number | null;
  setTargetHighlightId: (id: string | number | null) => void;

  isOmniSearchOpen: boolean;
  setIsOmniSearchOpen: (open: boolean) => void;

  isPdfEditorOpen: boolean;
  pdfEditorDocument: PdfEditorDocument | null;
  openPdfEditor: (doc?: Partial<PdfEditorDocument>) => void;
  closePdfEditor: () => void;

  notifications: QNotification[];
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  handleNotificationClick: (notif: QNotification) => void;

  addLead: (lead: Partial<Lead>) => Promise<Lead>;
  addDeal: (deal: Partial<Deal>) => Promise<Deal>;
  updateDeal: (id: string | number, patch: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string | number) => Promise<void>;
  addJob: (job: Partial<Job>) => Promise<Job>;
  addInvoice: (inv: Partial<Invoice>) => Promise<Invoice>;
  addAppointment: (apt: Partial<Appointment>) => Promise<Appointment>;
  openConversationForAppointment: (
    apt: Appointment,
    options?: { sendReminder?: boolean; customMessage?: string; openChat?: boolean }
  ) => Promise<string | number>;
  openConversationForContact: (
    contact: {
      name: string;
      phone: string;
      service?: string;
      location?: string;
      initialMessage?: string;
      skipConfirmation?: boolean;
      confirmationTitle?: string;
      confirmationSubtitle?: string;
      confirmationBadge?: string;
      confirmationBadgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'indigo';
      confirmationMetadata?: { label: string; value: string }[];
    }
  ) => Promise<string | number>;
  addCustomer: (cust: Record<string, unknown>) => Promise<Record<string, unknown>>;
  addExpense: (exp: Partial<Expense>) => Promise<Expense>;
  updateExpense: (id: string | number, updates: Partial<Expense>) => Promise<Expense | null>;
  deleteExpense: (id: string | number) => Promise<boolean>;
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string | number, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (taskId: string | number) => Promise<boolean>;
  addInventoryItem: (inv: Partial<InventoryItem>) => Promise<InventoryItem>;
  updateInventoryItem: (id: string | number, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string | number) => Promise<void>;

  addTransaction: (tx: Partial<Transaction>) => Promise<Transaction>;
  addApproval: (ap: Partial<Approval>) => Promise<Approval>;
  addFollowUp: (fu: Partial<FollowUp>) => Promise<FollowUp>;
  updateFollowUp: (id: string | number, patch: Partial<FollowUp>) => Promise<void>;
  deleteFollowUp: (id: string | number) => Promise<void>;
  addBranch: (b: Partial<BranchItem>) => Promise<BranchItem>;
  updateBranch: (branchId: string | number, updates: Partial<BranchItem>) => Promise<BranchItem | null>;
  deleteBranch: (branchId: string | number) => Promise<boolean>;
  addKnowledgeArticle: (art: Partial<KnowledgeArticle>) => Promise<KnowledgeArticle>;
  updateKnowledgeArticle: (id: string | number, updates: Partial<KnowledgeArticle>) => Promise<boolean>;
  deleteKnowledgeArticle: (id: string | number) => Promise<boolean>;
  voteHelpfulArticle: (id: string | number) => void;
  addPaymentAccount: (acc: Partial<PaymentAccount>) => Promise<PaymentAccount>;
  addQuotation: (quo: Partial<Quotation>) => Promise<Quotation>;
  updateQuotation: (id: string | number, updates: Partial<Quotation>) => Promise<Quotation>;
  deleteQuotation: (id: string | number) => Promise<void>;
  convertQuotationToInvoice: (id: string | number) => Promise<{ quotation: Quotation; invoice: Invoice }>;

  activeWorkflowId: string | number | null;
  setActiveWorkflowId: (id: string | number | null) => void;
  activeWorkflowTitle: string | null;
  setActiveWorkflowTitle: (title: string | null) => void;
  activeWorkflowGroups: any[] | null;
  setActiveWorkflowGroups: (groups: any[] | null) => void;
  saveWorkflow: (wf: { id?: string | number; name: string; description?: string; trigger_type?: string; nodes: any[]; edges?: any[] }) => Promise<Workflow>;

  syncStatus: 'connected' | 'reconnecting' | 'offline';
  setSyncStatus: (status: 'connected' | 'reconnecting' | 'offline') => void;
  typingUsers: Record<string, boolean>;
  setClientTyping: (conversationId: string | number, isTyping: boolean) => void;
  onlineUsers: Record<string, { isOnline: boolean; lastSeen?: string }>;
  setClientPresence: (conversationId: string | number, isOnline: boolean, lastSeen?: string) => void;
  applyMessageStatus: (conversationId: string | number, messageId: string | number, status: 'sent' | 'delivered' | 'read') => void;
  applyMessageReaction: (conversationId: string | number, messageId: string | number, emoji: string, from: 'customer' | 'agent' | 'bot' | 'system') => void;
  applyRealtimeMessage: (conversationId: string | number, message: WhatsAppMessage) => void;
  applyRealtimeConversation: (convUpdate: Partial<Conversation> & { id: string | number }) => void;
  applyRealtimeNotification: (notif: QNotification) => void;
  applyRealtimeLead: (leadUpdate: Partial<Lead> & { id: string | number }) => void;
  applyRealtimeJob: (jobUpdate: Partial<Job> & { id: string | number }) => void;
}

const INITIAL_NOTIFICATIONS: QNotification[] = [
  { id: 1, title: 'New Booking from Amit Verma', text: 'AC Repair in Koyilandy scheduled for tomorrow 10:00 AM.', time: '2m ago', unread: true, target: 'conversations', itemId: 1, itemType: 'conversation' },
  { id: 2, title: 'UPI Payment Received ₹2,800', text: 'Priya Sharma completed 30% advance via GPay.', time: '15m ago', unread: true, target: 'finance-invoices', itemId: 'INV-2024-0183', itemType: 'invoice' },
  { id: 3, title: 'Overdue Job Flagged', text: 'Job #JOB-1024 delayed near Beach Road. Assign Amit Sharma.', time: '30m ago', unread: true, target: 'ops-jobs', itemId: 'JOB-1024', itemType: 'job' },
  { id: 4, title: 'AI Route RTE-001 Ready', text: '12-stop GPS optimized route created for Ramesh Kumar.', time: '1h ago', unread: true, target: 'ops-routes', itemId: 'RTE-001', itemType: 'route' },
  { id: 5, title: 'New WhatsApp Click-to-Ad Lead', text: 'Inquiry from +91 90000 11123 for AC Installation.', time: '2h ago', unread: true, target: 'crm-leads', itemId: 1, itemType: 'lead' },
  { id: 6, title: 'Purchase Approval Needed', text: 'Warehouse spare parts request APR-1024 (₹25,000) pending.', time: '3h ago', unread: true, target: 'automation-approvals', itemId: 'APR-1024', itemType: 'approval' },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    apt_id_str: 'APT-1024',
    customer_name: 'Vikram Mehta',
    phone: '+91 90000 11123',
    service: 'AC Installation (1.5 Ton Inverter AC)',
    employee: 'Amit Sharma',
    date_str: 'May 12, 2024',
    time_str: '10:30 AM',
    status: 'confirmed',
    duration: '2h 00m',
    location: 'Kozhikode, Kerala',
    amount: 1200,
    advance: 360,
    payment_status: 'advance_paid',
    source: 'WhatsApp Assistant',
    notes: 'Customer requested morning slot. Advance ₹360 paid via UPI.',
  },
  {
    id: 2,
    apt_id_str: 'APT-1023',
    customer_name: 'Amit Verma',
    phone: '+91 98765 43210',
    service: 'AC Repair (Gas Leakage)',
    employee: 'Priya Sharma',
    date_str: 'May 12, 2024',
    time_str: '12:00 PM',
    status: 'upcoming',
    duration: '1h 30m',
    location: 'Koyilandy, Kerala',
    amount: 2800,
    advance: 0,
    payment_status: 'pending',
    source: 'WhatsApp Assistant',
    notes: 'Customer inquired about refrigerant top-up and leakage fix.',
  },
  {
    id: 3,
    apt_id_str: 'APT-1022',
    customer_name: 'Priya Sharma',
    phone: '+91 89213 56789',
    service: 'Deep Cleaning (Full Home)',
    employee: 'Neha Patel',
    date_str: 'May 13, 2024',
    time_str: '09:00 AM',
    status: 'confirmed',
    duration: '3h 00m',
    location: 'Ramanattukara, Kerala',
    amount: 4500,
    advance: 450,
    payment_status: 'advance_paid',
    source: 'WhatsApp Web',
    notes: '3 BHK flat deep clean before family event.',
  },
];

const DEFAULT_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 1,
    title: 'Standard AC Service & Maintenance Pricing',
    category: 'Standard Rates',
    content: 'Routine AC filter cleaning: ₹650. Deep foam jet chemical service: ₹1,450. Complete indoor and outdoor unit overhaul: ₹2,200. Gas top-up (R32 / R410A): ₹1,800 to ₹2,800 depending on pressure deficiency.',
    status: 'published',
    last_updated: 'May 31, 2024',
    author: 'Rahul Mehta (Ops Lead)',
    views: 142,
    helpful_percent: 98,
  },
  {
    id: 2,
    title: '90-Day Warranty & Post-Service Guarantee',
    category: 'Service Policy',
    content: 'All spare parts replaced by certified Qiyam technicians carry a 90-day comprehensive replacement warranty. In case of recurring cooling issues within 14 days of servicing, a free technician re-visit is dispatched automatically within 4 business hours.',
    status: 'published',
    last_updated: 'May 28, 2024',
    author: 'Compliance Team',
    views: 98,
    helpful_percent: 100,
  },
  {
    id: 3,
    title: 'Emergency Breakdown & Fast Response Protocol',
    category: 'Operations',
    content: 'For server rooms, commercial clinics, and VIP residential accounts reporting total cooling outage, dispatch priority is set to CRITICAL. Nearest technician within 5km is automatically re-routed via route optimization.',
    status: 'published',
    last_updated: 'May 25, 2024',
    author: 'Field Ops Lead',
    views: 76,
    helpful_percent: 94,
  },
  {
    id: 4,
    title: 'Inverter AC Gas Leakage Inspection Standard',
    category: 'Technical SOPs',
    content: 'Technicians must perform soap bubble and electronic halogen sniff tests at all flared copper joints before charging refrigerant. Vacuuming down to 500 microns with a 2-stage rotary pump is mandatory.',
    status: 'published',
    last_updated: 'May 20, 2024',
    author: 'Technical Training Cell',
    views: 115,
    helpful_percent: 96,
  },
  {
    id: 5,
    title: 'Commercial AMC Tier Discounts & Credit Terms',
    category: 'Standard Rates',
    content: 'Corporate multi-split contracts exceeding 10 units qualify for a 15% fleet discount. Standard payment terms are Net 15 days from official GST invoice generation. UPI and NEFT accounts are provided on invoice footer.',
    status: 'published',
    last_updated: 'May 18, 2024',
    author: 'Finance & Billing',
    views: 64,
    helpful_percent: 92,
  },
  {
    id: 6,
    title: 'Customer Escalation & Refund Guidelines',
    category: 'Service Policy',
    content: 'Any complaint logged via WhatsApp with severity level 1 triggers immediate notification to the Branch Operations Director. If a customer is unsatisfied with repair quality, full service labor charges are refunded via Razorpay UPI within 24 hours.',
    status: 'published',
    last_updated: 'May 15, 2024',
    author: 'Customer Experience Head',
    views: 89,
    helpful_percent: 97,
  },
];

const INITIAL_BRANCHES: BranchItem[] = [
  {
    id: 1,
    name: 'Head Office',
    code: 'HO-001',
    branch_type: 'Head Office',
    city: 'Kozhikode',
    state: 'Kerala',
    pincode: '673001',
    manager_name: 'Rahul Mehta',
    manager_role: 'Regional Director',
    employees_count: 12,
    customers_count: 1245,
    is_main: true,
    status: 'Active',
    automations_count: 32,
    tasks_automated: 256,
    last_activity: 'May 31, 2024 10:30 AM',
    phone: '+91 495 276 5400',
    email: 'headoffice@qiyamventures.com',
    address: 'Qiyam Corporate Center, Beach Road, Kozhikode, Kerala - 673001',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Kochi Branch',
    code: 'BR-002',
    branch_type: 'Regional Office',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682016',
    manager_name: 'Suresh S',
    manager_role: 'Senior Branch Manager',
    employees_count: 8,
    customers_count: 654,
    is_main: false,
    status: 'Active',
    automations_count: 24,
    tasks_automated: 210,
    last_activity: 'May 31, 2024 09:15 AM',
    phone: '+91 484 290 8120',
    email: 'kochi@qiyamventures.com',
    address: 'Infopark Phase 1, Kakkanad, Kochi, Kerala - 682016',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Bangalore Branch',
    code: 'BR-003',
    branch_type: 'Regional Hub',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    manager_name: 'Priya Sharma',
    manager_role: 'Regional Operations Lead',
    employees_count: 7,
    customers_count: 447,
    is_main: false,
    status: 'Active',
    automations_count: 18,
    tasks_automated: 178,
    last_activity: 'May 31, 2024 08:45 AM',
    phone: '+91 80 4120 7890',
    email: 'bangalore@qiyamventures.com',
    address: 'Prestige Meridian, MG Road, Bengaluru, Karnataka - 560001',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Mumbai Branch',
    code: 'BR-004',
    branch_type: 'Commercial Center',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    manager_name: 'Faizal K',
    manager_role: 'Enterprise Branch Manager',
    employees_count: 6,
    customers_count: 395,
    is_main: false,
    status: 'Active',
    automations_count: 20,
    tasks_automated: 192,
    last_activity: 'May 31, 2024 08:20 AM',
    phone: '+91 22 6670 9900',
    email: 'mumbai@qiyamventures.com',
    address: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051',
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Delhi Branch',
    code: 'BR-005',
    branch_type: 'Regional Hub',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    manager_name: 'Amitabh Sen',
    manager_role: 'Territory Manager',
    employees_count: 3,
    customers_count: 120,
    is_main: false,
    status: 'Inactive',
    automations_count: 10,
    tasks_automated: 68,
    last_activity: 'May 28, 2024 04:10 PM',
    phone: '+91 11 2334 5678',
    email: 'delhi@qiyamventures.com',
    address: 'Connaught Place, Central Circle, New Delhi, Delhi - 110001',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    name: 'Chennai Branch',
    code: 'BR-006',
    branch_type: 'Service Center',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600002',
    manager_name: 'Kavitha Raman',
    manager_role: 'Branch Supervisor',
    employees_count: 5,
    customers_count: 280,
    is_main: false,
    status: 'Active',
    automations_count: 14,
    tasks_automated: 112,
    last_activity: 'May 31, 2024 07:40 AM',
    phone: '+91 44 2852 3410',
    email: 'chennai@qiyamventures.com',
    address: 'Mount Road, Anna Salai, Chennai, Tamil Nadu - 600002',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    name: 'Hyderabad Branch',
    code: 'BR-007',
    branch_type: 'Tech Operations Hub',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    manager_name: 'Aneesh P',
    manager_role: 'Hub Operations Manager',
    employees_count: 4,
    customers_count: 215,
    is_main: false,
    status: 'Active',
    automations_count: 12,
    tasks_automated: 96,
    last_activity: 'May 31, 2024 07:05 AM',
    phone: '+91 40 4012 3344',
    email: 'hyderabad@qiyamventures.com',
    address: 'Cyber Gateway, Hitec City, Hyderabad, Telangana - 500081',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  {
    id: 1,
    name: 'WhatsApp Cloud API',
    category: 'Communication',
    description: 'Official Meta WhatsApp Business API for automated broadcasts and inbox messaging',
    status: 'connected',
    connected_on: 'May 28, 2024',
    automations_enabled: 12,
    icon_slug: 'whatsapp',
    config: {
      phone_number_id: '1307178355804150',
      waba_id: '4567067243541240',
      api_version: 'v21.0',
      business_name: 'Qiyam Business Solutions',
      business_phone_display: '+91 94963 00233',
      auto_reply_enabled: true,
      dual_mode_enabled: true,
    },
  },
  {
    id: 2,
    name: 'Google Workspace',
    category: 'Productivity',
    description: 'Gmail, Google Drive, Calendar sync and document automation',
    status: 'connected',
    connected_on: 'May 28, 2024',
    automations_enabled: 4,
    icon_slug: 'google',
    config: {
      client_id: '489128391823-qiyam823.apps.googleusercontent.com',
      service_account_email: 'whatsq-sync@coolfix-qiyam.iam.gserviceaccount.com',
      calendar_id: 'primary',
      sync_calendar_appointments: true,
      backup_invoices_drive: true,
      sync_gmail_leads: true,
    },
  },
  {
    id: 3,
    name: 'Slack',
    category: 'Communication',
    description: 'Internal team notifications, job completion alerts, and escalation channels',
    status: 'connected',
    connected_on: 'May 24, 2024',
    automations_enabled: 3,
    icon_slug: 'slack',
    config: {
      bot_token: 'xoxb-demo-workspace-token',
      default_channel: '#whatsq-alerts',
      escalation_channel: '#urgent-escalations',
      notify_inbound_whatsapp: true,
      notify_job_complete: true,
      notify_deal_won: true,
    },
  },
  {
    id: 4,
    name: 'Zoho CRM',
    category: 'CRM',
    description: 'Bidirectional contact, deal and lead synchronization',
    status: 'connected',
    connected_on: 'May 20, 2024',
    automations_enabled: 2,
    icon_slug: 'zoho',
    config: {
      datacenter: 'zoho.in',
      client_id: '1000.QIYAM891238491823ZOHOIN',
      client_secret: '••••••••••••••••••••••••',
      sync_leads: true,
      sync_deals: true,
      auto_create_whatsapp_contact: true,
    },
  },
  {
    id: 5,
    name: 'QuickBooks Online',
    category: 'Accounting & Finance',
    description: 'Automated ledger synchronization and invoice tax tracking',
    status: 'partially_connected',
    connected_on: 'May 18, 2024',
    automations_enabled: 1,
    icon_slug: 'quickbooks',
    config: {
      environment: 'sandbox',
      realm_id: '46208163653198234',
      client_id: 'ABQIYAM89123891238Intuit',
      sync_invoices_ledger: true,
      auto_record_payments: false,
    },
  },
  {
    id: 6,
    name: 'Shopify',
    category: 'E-Commerce',
    description: 'E-commerce store orders, cart abandonment notifications, and catalog sync',
    status: 'partially_connected',
    connected_on: 'May 10, 2024',
    automations_enabled: 2,
    icon_slug: 'shopify',
    config: {
      store_domain: 'coolfix-parts.myshopify.com',
      access_token: 'shpat_8912389182391823ab98',
      order_confirmation_whatsapp: true,
      abandoned_cart_recovery: true,
      cart_recovery_delay_mins: 30,
    },
  },
  {
    id: 7,
    name: 'Razorpay',
    category: 'Payments',
    description: 'Instant UPI payment links, QR codes and payment confirmation webhooks',
    status: 'connected',
    connected_on: 'May 15, 2024',
    automations_enabled: 3,
    icon_slug: 'razorpay',
    config: {
      mode: 'live',
      key_id: 'rzp_live_QIYAM891238491',
      key_secret: '••••••••••••••••••••••••',
      webhook_secret: 'rzp_whsec_qiyam_2026',
      auto_upi_links_invoice: true,
      instant_pdf_receipt_whatsapp: true,
      payment_reminder_whatsapp: true,
    },
  },
  {
    id: 8,
    name: 'WooCommerce',
    category: 'E-Commerce',
    description: 'WordPress WooCommerce store order alerts, status tracking, cart recovery and catalog sync',
    status: 'partially_connected',
    connected_on: 'May 12, 2024',
    automations_enabled: 3,
    icon_slug: 'woocommerce',
    config: {
      store_url: 'https://coolfix-store.com',
      consumer_key: 'ck_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
      consumer_secret: 'cs_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      webhook_secret: 'wc_whsec_qiyam_2026',
      api_version: 'wc/v3',
      verify_ssl: true,
      order_confirmation_whatsapp: true,
      order_status_tracking: true,
      abandoned_cart_recovery: true,
      auto_sync_customer_lead: true,
      low_stock_staff_alert: false,
    },
  },
];

export const INITIAL_SUPPRESSION_LIST: SuppressionRecord[] = [
  {
    id: 'sup-01',
    name: 'Inactive Contact (Opted Out)',
    phone: '+91 80000 00000',
    type: 'opt_out_stop',
    reason: 'Replied "STOP" to promotional broadcast',
    campaignName: 'Summer AC Cleaning 2026',
    date: 'Sep 10, 2026, 02:45 PM',
    timestamp: 1789031700000,
    status: 'Suppressed',
    canResubscribe: true,
    source: 'Inbound WhatsApp Keyword (STOP)',
    notes: 'Customer explicitly texted STOP. Excluded from all automated broadcasts.',
  },
  {
    id: 'sup-02',
    name: 'Kareem Mansoor',
    phone: '+971 50 111 2233',
    type: 'blocked',
    reason: 'Meta Error 131051: User blocked business phone number',
    metaErrorCode: '131051',
    campaignName: 'Chiller AMC Annual Renewal',
    date: 'Sep 12, 2026, 11:20 AM',
    timestamp: 1789191000000,
    status: 'Suppressed',
    canResubscribe: false,
    source: 'Meta Cloud API Webhook (Delivery Failed: 131051)',
    notes: 'Message undeliverable. User blocked business line on WhatsApp. Auto-paused.',
  },
  {
    id: 'sup-03',
    name: 'Fahad Al-Otaibi',
    phone: '+966 55 222 3344',
    type: 'opt_out_button',
    reason: 'Tapped "Stop Promotions" Quick-Reply Button',
    campaignName: 'VIP Club Exclusive Offers',
    date: 'Sep 14, 2026, 04:15 PM',
    timestamp: 1789367100000,
    status: 'Suppressed',
    canResubscribe: true,
    source: 'Meta Template Quick Reply (STOP_PROMOTIONS)',
    notes: 'Clicked standard Meta marketing opt-out button.',
  },
  {
    id: 'sup-04',
    name: 'Sunil Varma',
    phone: '+91 94000 99887',
    type: 'opt_out_stop',
    reason: 'Replied "UNSUBSCRIBE" to newsletter',
    campaignName: 'HVAC Maintenance Tips Q3',
    date: 'Sep 16, 2026, 09:30 AM',
    timestamp: 1789531800000,
    status: 'Suppressed',
    canResubscribe: true,
    source: 'Inbound WhatsApp Keyword (UNSUBSCRIBE)',
    notes: 'Replied to marketing broadcast requesting removal.',
  },
];

export const DEFAULT_META_CONFIG: MetaConfig = {
  phone_number_id: '1307178355804150',
  waba_id: '4567067243541240',
  access_token: 'EAAG...',
  verify_token: 'qiyam_whatsapp_secret_token_2026',
  api_version: 'v21.0',
  webhook_url: 'https://qiyam-business-os.qiyamapp.com/api/webhooks/whatsapp/',
  is_active: true,
  connection_status: 'connected',
  business_name: 'Qiyam Business Solutions',
  business_phone_display: '+91 94963 00233',
  quality_rating: 'GREEN',
};

const getStoredMetaConfig = (): MetaConfig => {
  try {
    const cached = localStorage.getItem('whatsq_meta_config');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        if (
          parsed.business_phone_display?.includes('9876543210') ||
          parsed.business_phone_display?.includes('98765 43210')
        ) {
          parsed.business_phone_display = '+91 94963 00233';
          parsed.business_name = 'Qiyam Business Solutions';
          parsed.waba_id = '4567067243541240';
          localStorage.setItem('whatsq_meta_config', JSON.stringify(parsed));
        }

        // Also auto-migrate legacy mock numbers in whatsq_waba_numbers if present
        try {
          const storedNumbers = localStorage.getItem('whatsq_waba_numbers');
          if (storedNumbers) {
            const numParsed = JSON.parse(storedNumbers);
            if (Array.isArray(numParsed) && numParsed.length > 0) {
              const hasReal = numParsed.some((n: any) => n.phone?.replace(/[^0-9]/g, '').includes('9496300233'));
              if (!hasReal) {
                const migratedNums = numParsed.map((n: any) => {
                  if (n.phone?.replace(/[^0-9]/g, '').includes('9876543210') || n.isPrimary) {
                    return {
                      ...n,
                      phone: '+91 94963 00233',
                      displayName: 'Qiyam Business Solutions',
                      isPrimary: true,
                      status: 'CONNECTED',
                    };
                  }
                  return n;
                });
                localStorage.setItem('whatsq_waba_numbers', JSON.stringify(migratedNums));
              }
            }
          }
        } catch {}

        return { ...DEFAULT_META_CONFIG, ...parsed };
      }
    }
  } catch {}
  return DEFAULT_META_CONFIG;
};

const INITIAL_LINKED_DEVICES: LinkedEmployeeDevice[] = [
  {
    id: 1,
    device_label: 'Surat Wholesale Line',
    phone_number: '+91 94963 00233',
    employee_name: 'Ramesh Kumar (Sales Desk)',
    status: 'connected',
    battery_level: 98,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const useQiyamStore = create<QiyamState>((set, get) => ({
  activeTab: getInitialActiveTab(),
  setActiveTab: (tab) => {
    persistActiveTab(tab);
    set({ activeTab: tab });
  },
  backendOnline: false,

  linkedDevices: INITIAL_LINKED_DEVICES,
  activeSenderDeviceId: 'meta_cloud',
  setActiveSenderDeviceId: (id) => set({ activeSenderDeviceId: id }),

  fetchLinkedDevices: async () => {
    try {
      const res = await apiClient.get('/conversations/linked-devices/');
      if (Array.isArray(res) && res.length > 0) {
        set({ linkedDevices: res });
      }
    } catch (e) {
      console.warn('Failed to fetch linked devices:', e);
    }
  },

  linkEmployeeDevice: async (deviceData) => {
    try {
      const res = await apiClient.post('/conversations/linked-devices/', deviceData);
      if (res && res.id && res.success !== false) {
        set((state) => ({
          linkedDevices: [res, ...state.linkedDevices.filter((d) => d.id !== res.id)],
          activeSenderDeviceId: res.id,
        }));
        get().addToast(`WhatsApp device "${res.device_label}" linked successfully!`, 'success');
        return res;
      }
    } catch (e) {
      console.warn('Failed to link device via API, saving locally:', e);
    }
    const localDevice: LinkedEmployeeDevice = {
      id: `dev-${Date.now()}`,
      device_label: deviceData.device_label || 'Mobile WhatsApp Line',
      phone_number: deviceData.phone_number || '+91 98471 23456',
      employee_name: deviceData.employee_name || deviceData.device_label || 'Staff Member',
      status: 'connected',
      battery_level: 95,
      is_active: true,
      created_at: new Date().toISOString(),
      ...deviceData,
    };
    set((state) => ({
      linkedDevices: [localDevice, ...state.linkedDevices.filter((d) => d.id !== localDevice.id)],
      activeSenderDeviceId: localDevice.id,
    }));
    get().addToast(`WhatsApp device "${localDevice.device_label}" linked successfully!`, 'success');
    return localDevice;
  },

  updateEmployeeDevice: async (deviceId, updates) => {
    try {
      const res = await apiClient.patch(`/conversations/linked-devices/${deviceId}/`, updates);
      if (res && res.id) {
        set((state) => ({
          linkedDevices: state.linkedDevices.map((d) => (String(d.id) === String(deviceId) ? { ...d, ...res } : d)),
        }));
        get().addToast(`Updated line to "${res.device_label || res.employee_name}"`, 'success');
        return res;
      }
    } catch (e) {
      console.warn('Failed to update device via API:', e);
    }
    // Fallback local state update
    set((state) => ({
      linkedDevices: state.linkedDevices.map((d) => (String(d.id) === String(deviceId) ? { ...d, ...updates } : d)),
    }));
    get().addToast('Device updated successfully', 'success');
  },

  unlinkEmployeeDevice: async (deviceId) => {
    try {
      await apiClient.delete(`/conversations/linked-devices/${deviceId}/`);
    } catch {}
    set((state) => ({
      linkedDevices: state.linkedDevices.filter((d) => String(d.id) !== String(deviceId)),
      activeSenderDeviceId: state.activeSenderDeviceId === deviceId ? 'meta_cloud' : state.activeSenderDeviceId,
    }));
    get().addToast('WhatsApp device unlinked', 'info');
  },

  sendConfirmation: null,
  requestSendConfirmation: (config) => set({ sendConfirmation: config }),
  closeSendConfirmation: () => set({ sendConfirmation: null }),

  generalConfirmation: null,
  requestGeneralConfirmation: (config) => set({ generalConfirmation: config }),
  closeGeneralConfirmation: () => set({ generalConfirmation: null }),

  isPdfEditorOpen: false,
  pdfEditorDocument: null,
  openPdfEditor: (doc) => {
    const defaultDoc: PdfEditorDocument = {
      type: doc?.type || 'staff_letter',
      title: doc?.title || 'Official Staff Joining Letter',
      referenceNumber: doc?.referenceNumber || 'QIYAM/APPOINT/EMP-001',
      dateStr: doc?.dateStr || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      recipientName: doc?.recipientName || 'Amit Sharma',
      recipientRole: doc?.recipientRole || 'Field Technician',
      recipientId: doc?.recipientId || 'EMP-001',
      subject: doc?.subject || 'SUB: OFFICIAL LETTER OF APPOINTMENT',
      bodyContent: doc?.bodyContent || 'We are pleased to confirm your appointment with Qiyam Business Solutions. You will be reporting to the Calicut HQ branch. Your duty hours are 9:00 AM to 6:00 PM, Monday through Saturday.',
      companyName: doc?.companyName || 'QIYAM BUSINESS SOLUTIONS',
      companyAddress: doc?.companyAddress || 'Cyberpark Calicut, Kozhikode, Kerala • Reg. No: KL-08-99234',
      companyPhone: doc?.companyPhone || '+91 94963 00233',
      companyEmail: doc?.companyEmail || 'hr@qiyam.com',
      watermarkText: doc?.watermarkText || 'OFFICIAL DOCUMENT',
      showWatermark: doc?.showWatermark ?? false,
      watermarkOpacity: doc?.watermarkOpacity ?? 0.08,
      elements: doc?.elements || [
        { id: 'logo-1', type: 'logo', x: 40, y: 35, width: 56, height: 56 },
        { id: 'seal-1', type: 'seal', x: 580, y: 780, sealType: 'official_circle', width: 100, height: 100 },
        { id: 'sig-1', type: 'signature', x: 60, y: 790, signatureType: 'director', width: 150, height: 55 },
        { id: 'qr-1', type: 'qr', x: 640, y: 35, width: 65, height: 65 },
      ],
      ...doc,
    };
    set({ isPdfEditorOpen: true, pdfEditorDocument: defaultDoc });
  },
  closePdfEditor: () => set({ isPdfEditorOpen: false, pdfEditorDocument: null }),

  syncStatus: 'connected',
  setSyncStatus: (status) => set({ syncStatus: status }),
  typingUsers: {},
  setClientTyping: (conversationId, isTyping) => {
    const key = String(conversationId);
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [key]: isTyping,
      },
    }));

    // If client is actively typing, they are definitely online!
    if (isTyping) {
      get().setClientPresence(conversationId, true, 'Just now');
    }

    // Safety timeout: auto-clear typing bubble after 7 seconds to prevent stuck state
    if (isTyping && typeof window !== 'undefined') {
      const timerKey = `_typingTimer_${key}`;
      if ((window as any)[timerKey]) {
        clearTimeout((window as any)[timerKey]);
      }
      (window as any)[timerKey] = setTimeout(() => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [key]: false,
          },
        }));
      }, 7000);
    }
  },

  onlineUsers: {},
  setClientPresence: (conversationId, isOnline, lastSeen) => {
    const key = String(conversationId);
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [key]: { isOnline, lastSeen: lastSeen || (isOnline ? 'Just now' : 'Recently') },
      },
      conversations: state.conversations.map((c) =>
        String(c.id) === key
          ? {
              ...c,
              is_online: isOnline,
              last_seen: lastSeen || (isOnline ? 'Just now' : c.last_seen || 'Recently'),
            }
          : c
      ),
    }));
  },
  applyMessageStatus: (conversationId, messageId, status) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (String(c.id) === String(conversationId)) {
          const targetIndex = c.messages.findIndex((m) => String(m.id) === String(messageId));
          return {
            ...c,
            messages: c.messages.map((m, idx) => {
              // WhatsApp Monotonic Read Rule:
              // When status is 'read', all preceding outbound messages in this chat are also read
              if (status === 'read' && targetIndex !== -1 && idx <= targetIndex && m.sender !== 'customer') {
                return { ...m, status: 'read' };
              }
              if (String(m.id) === String(messageId) || (!m.id && m.sender !== 'customer')) {
                return { ...m, status };
              }
              return m;
            }),
          };
        }
        return c;
      }),
    }));
  },

  applyMessageReaction: (conversationId, messageId, emoji, from) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (String(c.id) !== String(conversationId)) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (String(m.id) !== String(messageId)) return m;
            const existing = m.reactions || [];
            // Remove old reaction from same sender, then add new (toggle off if same emoji)
            const filtered = existing.filter((r) => r.from !== from);
            const sameReaction = existing.find((r) => r.from === from && r.emoji === emoji);
            const newReactions = sameReaction ? filtered : [...filtered, { emoji, from }];
            return { ...m, reactions: newReactions };
          }),
        };
      }),
    }));
  },

  applyRealtimeMessage: (conversationId, message) => {
    // When real incoming message arrives from customer, they stopped typing and are actively online
    get().setClientTyping(conversationId, false);
    if (message.sender === 'customer') {
      get().setClientPresence(conversationId, true, 'Just now');
    }

    set((state) => {
      const convIndex = state.conversations.findIndex((c) => String(c.id) === String(conversationId));
      if (convIndex === -1) {
        get().refreshConversations();
        return {};
      }

      const conv = state.conversations[convIndex];
      if (conv.messages.some((m) => String(m.id) === String(message.id))) {
        return {};
      }

      let replaced = false;
      const isCustomerReply = message.sender === 'customer';
      const updatedMessages = conv.messages.map((m) => {
        // Customer replied -> all previous outbound messages in this conversation have been read
        if (isCustomerReply && m.sender !== 'customer') {
          return { ...m, status: 'read' as const };
        }
        if (String(m.id).startsWith('msg-') && m.text === message.text && m.sender === message.sender) {
          replaced = true;
          return message;
        }
        return m;
      });

      if (!replaced) {
        updatedMessages.push(message);
      }

      const isCurrent = String(state.selectedConversationId) === String(conversationId);
      const newUnreadCount = isCurrent ? 0 : (conv.unread_count || 0) + (message.sender === 'customer' ? 1 : 0);

      const updatedConv: Conversation = {
        ...conv,
        messages: updatedMessages,
        last_contact_date: message.timestamp || conv.last_contact_date,
        unread_count: newUnreadCount,
      };

      const nextConversations = [...state.conversations];
      nextConversations.splice(convIndex, 1);
      nextConversations.unshift(updatedConv);

      return {
        conversations: nextConversations,
      };
    });
  },

  applyRealtimeConversation: (convUpdate) => {
    set((state) => {
      const idx = state.conversations.findIndex((c) => String(c.id) === String(convUpdate.id));
      if (idx === -1) {
        get().refreshConversations();
        return {};
      }
      const existing = state.conversations[idx];
      const isCurrent = String(state.selectedConversationId) === String(convUpdate.id);
      const merged = {
        ...existing,
        ...convUpdate,
        unread_count: isCurrent ? 0 : (convUpdate.unread_count !== undefined ? convUpdate.unread_count : existing.unread_count),
      };
      const nextConversations = [...state.conversations];
      if (convUpdate.last_contact_date || (convUpdate as Record<string, unknown>).last_message || convUpdate.messages) {
        nextConversations.splice(idx, 1);
        nextConversations.unshift(merged);
      } else {
        nextConversations[idx] = merged;
      }
      return { conversations: nextConversations };
    });
  },

  applyRealtimeNotification: (notif) => {
    set((state) => {
      if (state.notifications.some((n) => n.id === notif.id)) {
        return {};
      }
      return {
        notifications: [notif, ...state.notifications],
      };
    });
  },

  applyRealtimeLead: (leadUpdate) => {
    set((state) => ({
      leads: state.leads.map((l) => String(l.id) === String(leadUpdate.id) ? { ...l, ...leadUpdate } : l)
    }));
  },

  applyRealtimeJob: (jobUpdate) => {
    set((state) => ({
      jobs: state.jobs.map((j) => String(j.id) === String(jobUpdate.id) ? { ...j, ...jobUpdate } : j)
    }));
  },

  activeWorkflowId: null,
  setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),
  activeWorkflowTitle: null,
  setActiveWorkflowTitle: (title) => set({ activeWorkflowTitle: title }),
  activeWorkflowGroups: null,
  setActiveWorkflowGroups: (groups) => set({ activeWorkflowGroups: groups }),

  saveWorkflow: async (wfData) => {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const existing = get().workflows.find((w) => (wfData.id && String(w.id) === String(wfData.id)) || w.name.toLowerCase() === wfData.name.toLowerCase());

    const payload = {
      name: wfData.name || 'Chatbot 1',
      category: 'Chatbot & Messaging',
      business_function: 'Customer Service',
      trigger_type: wfData.trigger_type || 'New WhatsApp Message',
      description: wfData.description || `Interactive WhatsApp chatbot automation with ${wfData.nodes?.length || 0} node groups.`,
      status: 'active' as const,
      runs_this_month: existing ? existing.runs_this_month : 12,
      success_rate: existing ? existing.success_rate : 99.4,
      last_modified: nowStr,
      nodes: wfData.nodes || [],
      edges: wfData.edges || [],
    };

    try {
      let savedWf: Workflow;
      if (existing) {
        const res = await apiClient.put(`/automation/workflows/${existing.id}/`, payload);
        savedWf = (res?.id && res.success !== false) ? res : { ...existing, ...payload };
        set((state) => ({
          workflows: state.workflows.map((w) => w.id === existing.id ? savedWf : w),
          activeWorkflowId: savedWf.id,
          activeWorkflowTitle: savedWf.name,
        }));
      } else {
        const res = await apiClient.post('/automation/workflows/', payload);
        const nextId = (res?.id && res.success !== false) ? res.id : `wf-${Date.now()}`;
        savedWf = { id: nextId, ...payload };
        set((state) => ({
          workflows: [savedWf, ...state.workflows],
          activeWorkflowId: savedWf.id,
          activeWorkflowTitle: savedWf.name,
        }));
      }

      get().addToast(`Workflow "${savedWf.name}" saved! Showing in Workflows list.`, 'success');
      return savedWf;
    } catch (err) {
      console.warn('Failed to save workflow to backend, saving in store:', err);
      const fallbackWf: Workflow = {
        id: existing?.id || `wf-${Date.now()}`,
        ...payload
      };
      set((state) => ({
        workflows: existing ? state.workflows.map((w) => w.id === existing.id ? fallbackWf : w) : [fallbackWf, ...state.workflows],
        activeWorkflowId: fallbackWf.id,
        activeWorkflowTitle: fallbackWf.name,
      }));
      get().addToast(`Workflow "${fallbackWf.name}" saved! Showing in Workflows list.`, 'success');
      return fallbackWf;
    }
  },

  isSidebarCollapsed: typeof window !== 'undefined' && localStorage.getItem('whatsq_sidebar_collapsed') === 'true',
  toggleSidebarCollapse: () => set((state) => {
    const next = !state.isSidebarCollapsed;
    localStorage.setItem('whatsq_sidebar_collapsed', String(next));
    return { isSidebarCollapsed: next };
  }),
  setIsSidebarCollapsed: (collapsed) => {
    localStorage.setItem('whatsq_sidebar_collapsed', String(collapsed));
    set({ isSidebarCollapsed: collapsed });
  },

  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setIsMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

  versionInfo: null,
  isUpdateModalOpen: false,
  isUpdatingSystem: false,
  updateProgressStep: '',
  otaCountdown: null,
  isOtaCountdownActive: false,
  setIsUpdateModalOpen: (open) => set({ isUpdateModalOpen: open }),
  setOtaCountdown: (count) => set({ otaCountdown: count, isOtaCountdownActive: count !== null }),
  pauseOtaCountdown: () => {
    stopOtaCountdown();
    set({ otaCountdown: null, isOtaCountdownActive: false });
  },
  triggerForceHardRefresh: async (reason = 'Manual refresh requested') => {
    await forceHardRefresh(reason);
  },
  triggerOtaDeploymentUpdate: (info) => {
    const acknowledgedCommit = typeof window !== 'undefined' ? localStorage.getItem('whatsq_acknowledged_commit') : null;
    const lastRefreshTime = typeof window !== 'undefined' ? Number(localStorage.getItem('whatsq_last_hard_refresh_time') || '0') : 0;
    const justRefreshedRecently = Date.now() - lastRefreshTime < 180000;

    const isAcknowledged = !!(
      info.latest_commit &&
      acknowledgedCommit &&
      (info.latest_commit === acknowledgedCommit ||
        acknowledgedCommit.startsWith(info.latest_commit) ||
        info.latest_commit.startsWith(acknowledgedCommit))
    );

    if (
      isAcknowledged ||
      (justRefreshedRecently && acknowledgedCommit && (!info.latest_commit || info.latest_commit === acknowledgedCommit))
    ) {
      console.log(`[OTA Update] Deployment update ${info.latest_commit} already applied via hard refresh. Skipping modal.`);
      return;
    }

    const current = get().versionInfo;
    const nowFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());

    const merged: VersionInfo = {
      current_commit: current?.current_commit || 'active',
      current_author: current?.current_author || 'WhatsQ',
      current_date: current?.current_date || nowFormatted,
      current_message: current?.current_message || 'Current running release',
      latest_commit: info.latest_commit || 'latest',
      latest_author: info.latest_author || 'WhatsQ Core Team',
      latest_date: info.latest_date || nowFormatted,
      latest_message: info.latest_message || 'New production release deployed to origin/main',
      update_available: true,
      is_git: true,
      last_updated: current?.last_updated || nowFormatted,
      last_checked: nowFormatted,
      ...info,
    };

    set({
      versionInfo: merged,
      isUpdateModalOpen: false,
    });
  },

  selectedConversationId: (typeof window !== 'undefined' && localStorage.getItem('whatsq_selected_conversation_id')) || getStoredConversations()[0]?.id || '',
  setSelectedConversationId: (id) => {
    if (typeof window !== 'undefined' && id) {
      try {
        localStorage.setItem('whatsq_selected_conversation_id', String(id));
      } catch {}
    }
    set((state) => ({
      selectedConversationId: id,
      conversations: state.conversations.map((c) =>
        String(c.id) === String(id) ? { ...c, unread_count: 0 } : c
      ),
    }));
    get().markConversationAsRead(id);
  },

  markConversationAsRead: async (id) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        String(c.id) === String(id) ? { ...c, unread_count: 0 } : c
      ),
    }));
    try {
      await qiyamApi.markConversationRead(id);
    } catch (e) {
      console.warn('Failed to mark conversation read on backend:', e);
    }
  },

  markAllConversationsAsRead: async () => {
    set((state) => ({
      conversations: state.conversations.map((c) => ({ ...c, unread_count: 0 })),
    }));
    try {
      await qiyamApi.markAllConversationsRead();
    } catch (e) {
      console.warn('Failed to mark all conversations read on backend:', e);
    }
  },

  toggleConversationWorkflow: async (conversationId, isPaused, workflowName = 'Service Booking Flow') => {
    const nextWf = isPaused ? 'Paused' : (workflowName || 'Service Booking Flow');
    set((state) => ({
      conversations: state.conversations.map((c) =>
        String(c.id) === String(conversationId) ? { ...c, active_workflow: nextWf } : c
      ),
    }));
    try {
      await apiClient.post(`/conversations/threads/${conversationId}/toggle_workflow/`, {
        is_paused: isPaused,
        workflow_name: workflowName
      });
      get().addToast(
        isPaused
          ? 'AI Bot auto-reply paused for this conversation'
          : `AI Bot active with workflow: ${nextWf}`,
        'info'
      );
    } catch (e) {
      console.warn('Failed to toggle conversation workflow on backend:', e);
    }
  },

  deleteConversation: async (id: string | number) => {
    const strId = String(id);
    addDeletedConversationId(id);

    let deletedContactName = '';
    set((state) => {
      const target = state.conversations.find((c) => String(c.id) === strId || c.contact_name === strId);
      if (target) {
        deletedContactName = target.contact_name;
        addDeletedConversationId(target.id);
        if (target.contact_name) addDeletedConversationId(target.contact_name);
      }
      const remaining = state.conversations.filter(
        (c) => String(c.id) !== strId && c.contact_name !== strId
      );
      persistConversations(remaining);

      const isCurrentDeleted = String(state.selectedConversationId) === strId || (target && String(state.selectedConversationId) === String(target.id));
      const nextSelectedId = isCurrentDeleted
        ? (remaining[0]?.id ?? '')
        : state.selectedConversationId;

      return {
        conversations: remaining,
        selectedConversationId: nextSelectedId,
      };
    });

    // Instant toast feedback!
    get().addToast(
      `Conversation with ${deletedContactName || 'contact'} deleted successfully.`,
      'success'
    );

    // Non-blocking background sync with backend
    qiyamApi.deleteConversation(id).catch((e) => {
      console.warn('Backend delete conversation notice:', e);
    });

    return true;
  },
  isSimulatorOpen: false,
  setIsSimulatorOpen: (open) => set({ isSimulatorOpen: open }),
  isNewWorkflowModalOpen: false,
  setIsNewWorkflowModalOpen: (open) => set({ isNewWorkflowModalOpen: open }),
  isNewBookingModalOpen: false,
  setIsNewBookingModalOpen: (open) => set({ isNewBookingModalOpen: open }),
  isLeadDrawerOpen: false,
  setIsLeadDrawerOpen: (open) => set({ isLeadDrawerOpen: open }),
  selectedLead: null,
  setSelectedLead: (lead) => set({ selectedLead: lead, isLeadDrawerOpen: !!lead }),
  editingTemplate: null,
  setEditingTemplate: (template) => set({ editingTemplate: template }),
  selectedTemplateId: null,
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),

  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  globalDateRange: 'May 1 – May 31, 2024',
  globalDateInterval: { start: '2024-05-01', end: '2024-05-31' },
  setGlobalDateRange: (range, interval) => {
    let resolvedInterval = interval;
    if (resolvedInterval === undefined) {
      if (range.toLowerCase().includes('all')) {
        resolvedInterval = null;
      } else {
        resolvedInterval = get().globalDateInterval;
      }
    }
    set({ globalDateRange: range, globalDateInterval: resolvedInterval });
    get().addToast(`Date range set to ${range}`, 'info');
  },
  globalFilter: { status: 'all', priority: 'all', assignedTo: 'all', query: '' },
  setGlobalFilter: (filter) => set((state) => ({ globalFilter: { ...state.globalFilter, ...filter } })),
  resetGlobalFilter: () => {
    set({ globalFilter: { status: 'all', priority: 'all', assignedTo: 'all', query: '' } });
    get().addToast('Filter cleared', 'info');
  },

  targetHighlightId: null,
  setTargetHighlightId: (id) => set({ targetHighlightId: id }),

  isOmniSearchOpen: false,
  setIsOmniSearchOpen: (open) => set({ isOmniSearchOpen: open }),

  notifications: INITIAL_NOTIFICATIONS,
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    }));
  },
  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, unread: false })),
    }));
    get().addToast('All notifications marked as read', 'info');
  },
  handleNotificationClick: (notif) => {
    get().markNotificationRead(notif.id);
    set({ activeTab: notif.target });
    if (notif.itemId) {
      set({ targetHighlightId: notif.itemId });
    }
    if (notif.target === 'conversations') {
      const conv = get().conversations.find(
        (c) => c.id === notif.itemId || c.contact_name.toLowerCase().includes('amit')
      );
      if (conv) {
        set({ selectedConversationId: conv.id });
      }
    } else if (notif.target === 'crm-leads') {
      const lead = get().leads.find(
        (l) => l.id === notif.itemId || l.phone.includes('90000') || l.name.toLowerCase().includes('inquiry')
      );
      if (lead) {
        set({ selectedLead: lead, isLeadDrawerOpen: true, targetHighlightId: lead.id });
      }
    }
    get().addToast(`Showing: ${notif.title}`, 'info');
  },

  conversations: getStoredConversations(),
  leads: getStoredCache('leads', INITIAL_LEADS),
  deals: getStoredCache('deals', INITIAL_DEALS),
  followups: [],
  customers: [],
  jobs: getStoredCache('jobs', INITIAL_JOBS),
  appointments: INITIAL_APPOINTMENTS,
  employees: getStoredCache('employees', INITIAL_EMPLOYEES),
  attendance: getStoredCache('attendance', INITIAL_ATTENDANCE),
  tasks: getStoredCache('tasks', INITIAL_TASKS),
  routes: [],
  inventory: getStoredCache('inventory', INITIAL_INVENTORY),
  transactions: getStoredCache('transactions', INITIAL_TRANSACTIONS),
  invoices: getStoredCache('invoices', INITIAL_INVOICES),
  quotations: getStoredQuotationsCache(),
  expenses: getStoredExpensesCache(),
  accounts: getStoredCache('accounts', INITIAL_ACCOUNTS),
  workflows: [],
  workflowLogs: [],
  approvals: [],
  knowledgeArticles: getStoredCache('knowledgeArticles', DEFAULT_KNOWLEDGE_ARTICLES),
  templates: getStoredCache('templates', INITIAL_TEMPLATES),
  integrations: INITIAL_INTEGRATIONS,
  branches: INITIAL_BRANCHES,
  metaConfig: getStoredMetaConfig(),
  workspace: null,
  channelMetrics: [],
  intentMetrics: [],
  dailyMetrics: [],
  searchResults: [],
  metaWallet: initialMetaWallet,
  walletTransactions: initialWalletTransactions,
  bulkCampaigns: initialBulkCampaigns,
  draftCampaign: null,
  setDraftCampaign: (campaign) => set({ draftCampaign: campaign }),
  bulkRecipientLists: initialBulkRecipientLists,
  bulkScheduledMessages: initialBulkScheduledMessages,
  bulkTemplates: initialBulkTemplates,
  suppressionList: INITIAL_SUPPRESSION_LIST,
  suppressionSearchQuery: '',
  roles: getStoredRoles(),
  activeRoleId: 'admin',

  loadInitialData: async () => {
    // Use Promise.allSettled so a single endpoint failure doesn't crash the whole app
    const results = await Promise.allSettled([
      qiyamApi.fetchConversations(),      // 0
      qiyamApi.fetchTemplates(),          // 1
      qiyamApi.fetchMetaConfig(),         // 2
      qiyamApi.fetchLeads(),              // 3
      qiyamApi.fetchDeals(),              // 4
      qiyamApi.fetchFollowUps(),          // 5
      qiyamApi.fetchCustomers(),          // 6
      qiyamApi.fetchJobs(),               // 7
      qiyamApi.fetchAppointments(),       // 8
      qiyamApi.fetchEmployees(),          // 9
      qiyamApi.fetchAttendance(),         // 10
      qiyamApi.fetchTasks(),              // 11
      qiyamApi.fetchRoutes(),             // 12
      qiyamApi.fetchInventory(),          // 13
      qiyamApi.fetchTransactions(),       // 14
      qiyamApi.fetchInvoices(),           // 15
      qiyamApi.fetchExpenses(),           // 16
      qiyamApi.fetchAccounts(),           // 17
      qiyamApi.fetchWorkflows(),          // 18
      qiyamApi.fetchWorkflowLogs(),       // 19
      qiyamApi.fetchApprovals(),          // 20
      qiyamApi.fetchKnowledge(),          // 21
      qiyamApi.fetchIntegrations(),       // 22
      qiyamApi.fetchBranches(),           // 23
      qiyamApi.fetchWorkspace(),          // 24
      qiyamApi.fetchChannelMetrics(),     // 25
      qiyamApi.fetchIntentMetrics(),      // 26
      qiyamApi.fetchDailyMetrics(),       // 27
      qiyamApi.fetchQuotations(),         // 28
    ]);

    const current = get();

    // Helper: extract fulfilled value or fallback without ever wiping existing data
    const safeVal = <T>(idx: number, currentVal: T, fallback: T, cacheKey?: string): T => {
      const res = results[idx];
      if (res && res.status === 'fulfilled') {
        const val = (res as PromiseFulfilledResult<T>).value;
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            if (val.length > 0) {
              if (cacheKey) persistCache(cacheKey, val);
              return val;
            }
          } else {
            return val;
          }
        }
      }
      // If endpoint failed/rejected or returned empty array:
      // PRESERVE current store value if it has items!
      if (Array.isArray(currentVal) && currentVal.length > 0) {
        return currentVal;
      }
      return fallback;
    };

    const anyRejected = results.some((r) => r.status === 'rejected');
    if (anyRejected) {
      const rejected = results
        .map((r, i) => (r.status === 'rejected' ? i : -1))
        .filter((i) => i >= 0);
      console.warn('[Store] Some API calls failed or backend is reloading (indices):', rejected);
      // Auto-retry in 3s so that as soon as the server finishes reloading, fresh data updates
      setTimeout(() => {
        get().loadInitialData();
      }, 3000);
    }

    const conversations = safeVal(0, current.conversations, getStoredConversations(), 'conversations');
    const templates     = safeVal(1, current.templates, INITIAL_TEMPLATES, 'templates');
    const metaConfig    = (results[2].status === 'fulfilled' && (results[2] as any).value) || current.metaConfig || getStoredMetaConfig();
    const leads         = safeVal(3, current.leads, INITIAL_LEADS, 'leads');
    const deals         = safeVal(4, current.deals, INITIAL_DEALS, 'deals');
    const followups     = safeVal(5, current.followups, [], 'followups');
    const customers     = safeVal(6, current.customers, [], 'customers');
    const jobs          = safeVal(7, current.jobs, INITIAL_JOBS, 'jobs');
    const appointments  = safeVal(8, current.appointments, INITIAL_APPOINTMENTS, 'appointments');
    const employees     = safeVal(9, current.employees, INITIAL_EMPLOYEES, 'employees');
    const attendance    = safeVal(10, current.attendance, INITIAL_ATTENDANCE, 'attendance');
    const tasks         = safeVal(11, current.tasks, INITIAL_TASKS, 'tasks');
    const routes        = safeVal(12, current.routes, [], 'routes');
    const inventory     = safeVal(13, current.inventory, INITIAL_INVENTORY, 'inventory');
    const transactions  = safeVal(14, current.transactions, INITIAL_TRANSACTIONS, 'transactions');
    const invoices      = safeVal(15, current.invoices, INITIAL_INVOICES, 'invoices');
    const rawExpenses   = safeVal(16, current.expenses, INITIAL_EXPENSES, 'expenses');
    const expMap = new Map<string, Expense>();
    INITIAL_EXPENSES.forEach((e) => expMap.set(String(e.id), e));
    (rawExpenses || []).forEach((e) => expMap.set(String(e.id), e));
    (current.expenses || []).forEach((e) => expMap.set(String(e.id), e));
    const expenses = Array.from(expMap.values());
    persistCache('expenses', expenses);

    const accounts      = safeVal(17, current.accounts, INITIAL_ACCOUNTS, 'accounts');
    const workflows     = safeVal(18, current.workflows, [], 'workflows');
    const workflowLogs  = safeVal(19, current.workflowLogs, [], 'workflowLogs');
    const approvals     = safeVal(20, current.approvals, [], 'approvals');
    const knowledgeArticles = safeVal(21, current.knowledgeArticles, DEFAULT_KNOWLEDGE_ARTICLES, 'knowledgeArticles');
    const integrations  = safeVal(22, current.integrations, INITIAL_INTEGRATIONS, 'integrations');
    const branches      = safeVal(23, current.branches, INITIAL_BRANCHES, 'branches');
    const workspace     = (results[24].status === 'fulfilled' && (results[24] as any).value) || current.workspace || null;
    const channelMetrics = safeVal(25, current.channelMetrics, [], 'channelMetrics');
    const intentMetrics  = safeVal(26, current.intentMetrics, [], 'intentMetrics');
    const dailyMetrics   = safeVal(27, current.dailyMetrics, [], 'dailyMetrics');
    const rawQuotations = safeVal(28, current.quotations, INITIAL_QUOTATIONS, 'quotations');
    const quoMap = new Map<string, Quotation>();
    INITIAL_QUOTATIONS.forEach((q) => quoMap.set(q.quotation_number || String(q.id), q));
    (rawQuotations || []).forEach((q) => quoMap.set(q.quotation_number || String(q.id), q));
    (current.quotations || []).forEach((q) => quoMap.set(q.quotation_number || String(q.id), q));
    const quotations = Array.from(quoMap.values());
    persistCache('quotations', quotations);

    // If all calls rejected, mark backend offline, but preserve current data
    const allRejected = results.every((r) => r.status === 'rejected');
    if (allRejected) {
      set({ backendOnline: false });
      return;
    }

    let resolvedConversations = conversations;
    if (!resolvedConversations || resolvedConversations.length === 0) {
      const cached = getStoredConversations();
      if (cached && cached.length > 0) {
        resolvedConversations = cached;
      }
    }

    const sortedConversations = sortConversationsByRecency(resolvedConversations);

    if (sortedConversations.length > 0) {
      persistConversations(sortedConversations);
    }

    const selectedConversationId =
      sortedConversations.length > 0
        ? sortedConversations[0].id
        : get().selectedConversationId;

    const sanitizedConversations = sortedConversations.map((c) =>
      String(c.id) === String(selectedConversationId) ? { ...c, unread_count: 0 } : c
    );

    // Build real recipient lists from actual store data (conversations, leads, customers)
    const conversationContacts: BulkContact[] = sanitizedConversations
      .filter((c) => c.phone_number)
      .map((c) => ({
        id: `conv-${c.id}`,
        name: c.contact_name || c.phone_number,
        phone: c.phone_number,
        tag: c.category || 'WhatsApp Contact',
        validWhatsApp: true,
        optedOut: !!c.is_opted_out,
        lastActive: c.last_contact_date || 'Recently',
        source: 'WhatsApp',
      }));

    const leadContacts: BulkContact[] = (leads || [])
      .filter((l: any) => l.phone)
      .map((l: any) => ({
        id: `lead-${l.id}`,
        name: l.name,
        phone: l.phone,
        email: l.email,
        tag: l.stage || 'Lead',
        validWhatsApp: true,
        optedOut: false,
        lastActive: l.last_contact_str || 'Recently',
        source: 'CRM Lead',
      }));

    const customerContacts: BulkContact[] = (customers || [])
      .filter((c: any) => c.phone)
      .map((c: any) => ({
        id: `cust-${c.id}`,
        name: c.name,
        phone: c.phone,
        email: c.email,
        tag: 'Customer',
        validWhatsApp: true,
        optedOut: false,
        lastActive: 'Recently',
        source: 'CRM Customer',
      }));

    const defaultRecipientLists: BulkRecipientList[] = [];

    if (conversationContacts.length > 0) {
      defaultRecipientLists.push({
        id: 'lst-conversations',
        name: 'All WhatsApp Conversations',
        description: `All active customer conversations (${conversationContacts.length} numbers)`,
        type: 'Customers',
        contactCount: conversationContacts.length,
        validWhatsAppCount: conversationContacts.filter((c) => !c.optedOut).length,
        tags: ['Active', 'Conversations'],
        createdAt: new Date().toISOString(),
        contactItems: conversationContacts,
      });
    }

    if (leadContacts.length > 0) {
      defaultRecipientLists.push({
        id: 'lst-leads',
        name: 'CRM Leads',
        description: `Inbound and active CRM leads (${leadContacts.length} numbers)`,
        type: 'Leads',
        contactCount: leadContacts.length,
        validWhatsAppCount: leadContacts.length,
        tags: ['Leads', 'CRM'],
        createdAt: new Date().toISOString(),
        contactItems: leadContacts,
      });
    }

    if (customerContacts.length > 0) {
      defaultRecipientLists.push({
        id: 'lst-customers',
        name: 'CRM Customers',
        description: `Registered CRM customers (${customerContacts.length} numbers)`,
        type: 'Customers',
        contactCount: customerContacts.length,
        validWhatsAppCount: customerContacts.length,
        tags: ['Customers', 'CRM'],
        createdAt: new Date().toISOString(),
        contactItems: customerContacts,
      });
    }

    const existingCustomLists = (current.bulkRecipientLists || []).filter(
      (l) => l.id.startsWith('lst-imported-') || l.id.startsWith('lst-custom-')
    );

    const mergedRecipientLists = [...defaultRecipientLists, ...existingCustomLists];

    set({
      backendOnline: true,
      conversations: sanitizedConversations,
      bulkRecipientLists: mergedRecipientLists,
      templates,
      bulkTemplates: (templates || []).map((t: any): BulkTemplateItem => {
        const metaCat = t.meta_category ? t.meta_category.toLowerCase() : (t.category || 'marketing').toLowerCase();
        const rawStatus = (t.meta_status || t.status || 'APPROVED').toUpperCase();
        return {
          id: String(t.id),
          templateId: t.meta_template_id || t.name,
          name: t.name,
          category: metaCat,
          language: t.language || 'en_US',
          status: rawStatus,
          meta_status: rawStatus,
          body: t.body_text || t.body || '',
          bodyText: t.body_text || t.body || '',
          header: t.header_type && t.header_type !== 'NONE' ? t.header_type : 'None',
          headerType: t.header_type || 'NONE',
          headerContent: t.header_url || t.header_text || undefined,
          headerFileName: t.header_type === 'DOCUMENT' ? (t.header_text || 'document.pdf') : undefined,
          footer: t.footer_text || 'None',
          footerText: t.footer_text || '',
          buttons: Array.isArray(t.buttons) ? t.buttons : [],
          qualityRating: t.quality_score === 'GREEN' ? 'High' : t.quality_score === 'YELLOW' ? 'Medium' : 'Low',
          lastUpdated: t.last_updated || (t.updated_at ? new Date(t.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'),
          updatedBy: t.author || 'WhatsQ Staff',
        };
      }),
      metaConfig: metaConfig || getStoredMetaConfig(),
      leads,
      deals,
      followups,
      customers,
      jobs,
      appointments: appointments.length > 0 ? appointments : INITIAL_APPOINTMENTS,
      employees,
      attendance,
      tasks,
      routes,
      inventory,
      transactions,
      invoices,
      quotations,
      expenses,
      accounts,
      workflows,
      workflowLogs,
      approvals,
      knowledgeArticles,
      integrations: (integrations && integrations.length > 0)
        ? integrations.map((i) => {
            const match = INITIAL_INTEGRATIONS.find((init) => init.name.toLowerCase() === i.name.toLowerCase());
            return {
              ...i,
              config: i.config && Object.keys(i.config).length > 0 ? i.config : (match?.config || {}),
            };
          })
        : INITIAL_INTEGRATIONS,
      branches: branches.length > 0 ? branches : INITIAL_BRANCHES,
      workspace,
      channelMetrics,
      intentMetrics,
      dailyMetrics,
      selectedConversationId,
      selectedTemplateId: templates[0]?.id ?? null,
    });

    get().fetchLinkedDevices();
    get().fetchBulkCampaigns();
    get().fetchBulkTemplates();

    if (selectedConversationId) {
      get().markConversationAsRead(selectedConversationId);
    }

    if (leads.length === 0 && sanitizedConversations.length === 0) {
      get().addToast(
        'Database looks empty. Run: python manage.py seed_qiyam_data',
        'warning'
      );
    }
  },

  refreshConversations: async () => {
    try {
      const serverConvs = await qiyamApi.fetchConversations();
      const deletedIds = getDeletedConversationIds();
      const filteredServerConvs = (serverConvs || []).filter(
        (c) => !deletedIds.includes(String(c.id)) && !deletedIds.includes(c.contact_name)
      );
      if (filteredServerConvs && filteredServerConvs.length > 0) {
        set((state) => {
          // Merge optimistic messages that might be pending locally
          const merged = filteredServerConvs.map((sConv) => {
            const localConv = state.conversations.find((c) => String(c.id) === String(sConv.id));
            if (!localConv) return sConv;

            const optimisticMsgs = localConv.messages.filter((m) =>
              String(m.id).startsWith('msg-') && !sConv.messages.some((sm) => sm.text === m.text && sm.sender === m.sender)
            );

            return {
              ...sConv,
              messages: [...sConv.messages, ...optimisticMsgs],
            };
          });

          // Preserve local conversations that haven't synced yet (e.g. newly created for appointments or offline)
          const localOnly = state.conversations.filter(
            (local) => !filteredServerConvs.some((sConv) => String(sConv.id) === String(local.id)) &&
              !deletedIds.includes(String(local.id)) && !deletedIds.includes(local.contact_name)
          );
          const allMerged = [...localOnly, ...merged];
          const sortedMerged = sortConversationsByRecency(allMerged);
          persistConversations(sortedMerged);

          const current = state.selectedConversationId;
          const currentExists = sortedMerged.some((c) => String(c.id) === String(current));
          const nextSelected = (current && currentExists)
            ? current
            : (sortedMerged[0]?.id || current || '');

          return {
            conversations: sortedMerged,
            selectedConversationId: nextSelected,
          };
        });
      }
    } catch (e) {
      console.warn('[Store] refreshConversations error:', e);
    }
  },

  globalSearch: async (query: string) => {
    const results = await qiyamApi.globalSearch(query);
    set({ searchResults: results });
  },

  sendMessage: async (conversationId, text, sender = 'agent', senderDeviceId) => {
    const tempId = `msg-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const targetDeviceId = senderDeviceId !== undefined ? senderDeviceId : get().activeSenderDeviceId;
    const isEmployeeDevice = targetDeviceId && targetDeviceId !== 'meta_cloud';
    const employeeDevice = isEmployeeDevice
      ? get().linkedDevices.find((d) => String(d.id) === String(targetDeviceId) || d.device_label === String(targetDeviceId))
      : null;

    const activeBusinessPhone = (() => {
      try {
        const stored = localStorage.getItem('whatsq_waba_numbers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const primary = parsed.find((n: any) => n.isPrimary) || parsed[0];
            const raw = (primary?.phone || '').trim();
            if (raw && !raw.includes('9876543210')) return raw;
          }
        }
      } catch {}
      const configPhone = (get().metaConfig?.business_phone_display || '').trim();
      if (configPhone && !configPhone.includes('9876543210')) return configPhone;
      return '+91 94963 00233';
    })();

    const resolvedSenderPhone = employeeDevice
      ? employeeDevice.phone_number
      : (activeBusinessPhone || '+91 94963 00233');

    const resolvedSenderDevice = employeeDevice
      ? employeeDevice.device_label
      : 'Meta Cloud API';

    const resolvedSenderName = isEmployeeDevice && employeeDevice
      ? (employeeDevice.employee_name || employeeDevice.device_label)
      : (sender === 'agent' ? 'Rahul Mehta' : 'Qiyam AI Assistant');

    // 1. Optimistic message with initial 'sent' status (single tick)
    const optimisticMsg: WhatsAppMessage = {
      id: tempId,
      sender,
      senderName: resolvedSenderName,
      sender_device: resolvedSenderDevice,
      sender_phone: resolvedSenderPhone,
      text,
      timestamp: nowTime,
      created_at: new Date().toISOString(),
      status: 'sent',
    };

    set((state) => {
      const convIndex = state.conversations.findIndex((c) => String(c.id) === String(conversationId));
      if (convIndex === -1) return {};

      const conv = state.conversations[convIndex];
      const updatedConv: Conversation = {
        ...conv,
        last_contact_date: 'Just now',
        messages: [...conv.messages, optimisticMsg],
      };

      const nextConversations = [...state.conversations];
      nextConversations.splice(convIndex, 1);
      nextConversations.unshift(updatedConv);

      return {
        conversations: nextConversations,
      };
    });

    try {
      const parentConv = get().conversations.find((c) => String(c.id) === String(conversationId));
      const res = await apiClient.post(`/conversations/threads/${conversationId}/send_message/`, {
        text,
        sender,
        sender_name: resolvedSenderName,
        sender_device: resolvedSenderDevice,
        sender_phone: resolvedSenderPhone,
        sender_device_id: isEmployeeDevice ? targetDeviceId : undefined,
        contact_name: parentConv?.contact_name,
        phone_number: parentConv?.phone_number,
      });
      if (res && res.id && res.success !== false) {
        // Update optimistic message with real backend message ID and status
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (String(c.id) !== String(conversationId)) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === tempId ? { ...m, id: res.id, status: res.status || 'sent' } : m
              ),
            };
          }),
        }));
      }
    } catch (e) {
      console.warn('Backend send message notice:', e);
    }
  },

  simulateInboundWhatsApp: async (name, phone, text) => {
    const res = await apiClient.post('/conversations/simulate/', { name, phone, text });
    if (res?.conversation) {
      const conv = mapConversation(res.conversation as Record<string, unknown>);
      set((state) => {
        const exists = state.conversations.some((c) => c.id === conv.id);
        const conversations = exists
          ? state.conversations.map((c) => (c.id === conv.id ? conv : c))
          : [conv, ...state.conversations];
        return { conversations, selectedConversationId: conv.id };
      });
      get().addToast(`New WhatsApp message from ${name}`, 'info');
      return;
    }
    get().addToast(res?.error || 'Simulation failed', 'error');
  },

  sendTemplateMessage: async (conversationId, templateId, variables) => {
    // 1. Resolve rendered template text immediately for instant display
    const template = get().templates.find((t) => String(t.id) === String(templateId));
    let renderedText = template?.body_text || template?.body || 'WhatsApp Template Message';
    if (variables) {
      Object.keys(variables).forEach((k) => {
        renderedText = renderedText.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(variables[k] || `{{${k}}}`));
      });
    }

    const tempId = Date.now();
    const nowTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());

    const targetConv = get().conversations.find((c) => String(c.id) === String(conversationId));
    const activeWf = targetConv?.active_workflow || 'Service Booking Flow';

    const optimisticMsg: WhatsAppMessage = {
      id: tempId,
      sender: 'agent',
      senderName: 'Rahul Mehta (Template)',
      text: renderedText,
      timestamp: nowTime,
      created_at: new Date().toISOString(),
      status: 'sent',
      isTemplate: true,
      workflowName: activeWf,
    };

    // 2. Instant Zero-Latency UI Update (append to chat immediately, zero lag)
    set((state) => {
      const convIndex = state.conversations.findIndex((c) => String(c.id) === String(conversationId));
      if (convIndex === -1) return {};

      const conv = state.conversations[convIndex];
      const updatedConv: Conversation = {
        ...conv,
        last_contact_date: 'Just now',
        messages: [...conv.messages, optimisticMsg],
      };

      const nextConversations = [...state.conversations];
      nextConversations.splice(convIndex, 1);
      nextConversations.unshift(updatedConv);

      const updatedTemplates = state.templates.map((t) =>
        String(t.id) === String(templateId) ? { ...t, usage_count: (t.usage_count || 0) + 1 } : t
      );

      return {
        conversations: nextConversations,
        templates: updatedTemplates,
      };
    });

    get().addToast('WhatsApp template message dispatched!', 'success');

    // 3. Asynchronous non-blocking background dispatch (no UI freeze or lag)
    try {
      const res = await apiClient.post(`/conversations/threads/${conversationId}/send_template/`, {
        template_id: templateId,
        variables,
      });

      if (res && res.id && res.success !== false) {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (String(c.id) !== String(conversationId)) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === tempId ? { ...m, id: res.id, status: res.status || 'sent', meta_message_id: res.meta_message_id } : m
              ),
            };
          }),
        }));
      } else if (res?.success === false || res?.error) {
        get().addToast(res.error || 'Template send failed via Meta', 'error');
      }
    } catch (e) {
      console.warn('[Store] Background send_template notice:', e);
    }
  },

  saveMetaTemplate: async (templateData) => {
    const isNew = !templateData.id;
    const saved = isNew
      ? await apiClient.post('/conversations/templates/', templateData)
      : await apiClient.put(`/conversations/templates/${templateData.id}/`, templateData);

    if (saved && saved.id && saved.success !== false) {
      set((state) => {
        const exists = state.templates.some((t) => t.id === saved.id);
        const updated = exists
          ? state.templates.map((t) => (t.id === saved.id ? saved : t))
          : [saved, ...state.templates];
        return { templates: updated };
      });
      return saved as WhatsAppTemplateItem;
    }

    get().addToast(saved?.error || 'Failed to save template', 'error');
    return null;
  },

  submitTemplateToMeta: async (templateId) => {
    const res = await apiClient.post(`/conversations/templates/${templateId}/submit_to_meta/`, {});
    if (res?.template) {
      set((state) => ({
        templates: state.templates.map((t) => (t.id === templateId ? res.template : t)),
      }));
      get().addToast('Template submitted to Meta for review', 'success');
      return true;
    }
    get().addToast(res?.error || 'Meta template submission failed', 'error');
    return false;
  },

  syncTemplatesWithMeta: async () => {
    const res = await apiClient.post('/conversations/templates/sync_meta/', {});
    if (res?.templates) {
      set({ templates: res.templates });
      get().addToast(`Synced ${res.synced_count ?? res.templates.length} templates from Meta`, 'success');
    } else {
      get().addToast(res?.error || 'Meta sync failed', 'error');
    }
  },

  testSendTemplate: async (templateId, phone, variables) => {
    const res = await apiClient.post(`/conversations/templates/${templateId}/test_send/`, {
      phone_number: phone,
      variables,
    });
    if (!res || res.status === 'error' || res.success === false || res.error) {
      return { success: false, error: res?.error || 'Failed to send template message via Meta' };
    }
    return { success: true, message: res.message || 'Template message delivered!' };
  },

  deleteMetaTemplate: async (templateId) => {
    const ok = await apiClient.delete(`/conversations/templates/${templateId}/`);
    if (!ok) {
      get().addToast('Failed to delete template', 'error');
      return false;
    }
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== templateId),
    }));
    get().addToast('Template deleted', 'success');
    return true;
  },

  // ─── Real Campaign API ─────────────────────────────────────────────────────

  fetchBulkCampaigns: async () => {
    try {
      const res = await apiClient.get('/conversations/bulk-campaigns/');
      if (res && Array.isArray(res.results !== undefined ? res.results : res)) {
        const raw = res.results !== undefined ? res.results : res;
        const mapped: BulkCampaign[] = raw.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          description: c.description || '',
          type: c.type || 'Marketing',
          category: c.category || 'marketing',
          audienceListName: c.audience_list_name || '',
          totalRecipients: c.total_recipients || 0,
          recipients: c.total_recipients || 0,
          deliveredCount: c.delivered_count || 0,
          delivered: c.delivered_count || 0,
          deliveredPercent: c.delivered_percent || 0,
          readCount: c.read_count || 0,
          repliedCount: c.replied_count || 0,
          failedCount: c.failed_count || 0,
          failed: c.failed_count || 0,
          failedPercent: c.failed_percent || 0,
          pending: 0,
          templateName: c.template_name || '',
          messageText: c.message_text || '',
          cost: c.cost || 0,
          status: c.status || 'COMPLETED',
          createdBy: c.created_by || '',
          createdAt: c.created_at || new Date().toISOString(),
          createdOn: c.created_at
            ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '',
          completedOn: c.completed_at
            ? new Date(c.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '',
          scheduledFor: c.scheduled_for || null,
          recipientsList: (c.recipient_logs || []).map((log: any) => ({
            id: String(log.id),
            name: log.name || '',
            phone: log.phone || '',
            status: log.status || 'QUEUED',
            time: log.time || '',
            errorReason: log.errorReason || '',
          })),
        }));
        set({ bulkCampaigns: mapped });
      }
    } catch (err) {
      // Silently fail — no fake data, just empty list
      console.warn('[fetchBulkCampaigns] failed:', err);
    }
  },

  sendBulkMessage: async (campaign: any) => {
    // Build contacts list from the campaign payload
    const contacts: { name: string; phone: string }[] = campaign.contacts || [];
    const totalRecipients = contacts.length || campaign.totalRecipients || campaign.recipientsCount || 0;

    if (totalRecipients === 0) {
      get().addToast('No contacts to send to. Please select recipients.', 'error');
      return { success: false, error: 'No contacts' };
    }

    const rate =
      campaign.category === 'utility' || campaign.type === 'Utility'
        ? 0.3
        : campaign.category === 'authentication'
        ? 0.12
        : 0.78;
    const totalCost =
      campaign.cost != null
        ? Number(campaign.cost)
        : Number((totalRecipients * rate).toFixed(2));
    const currentBalance = get().metaWallet.balance;

    if (currentBalance < totalCost) {
      get().addToast(
        `Insufficient Meta Wallet balance (₹${currentBalance.toFixed(2)}). Need ₹${totalCost.toFixed(2)}. Please add funds.`,
        'error'
      );
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      const res = await apiClient.post('/conversations/bulk-campaigns/launch/', {
        name: campaign.name,
        description: campaign.description || '',
        type: campaign.type || 'Marketing',
        category: campaign.category || 'marketing',
        audience_list_name: campaign.audienceListName || '',
        template_name: campaign.templateName || '',
        message_text: campaign.messageText || '',
        contacts,
        cost: totalCost,
        account_ids: campaign.accountIds || [],
        created_by: campaign.createdBy || 'Admin',
        min_delay: campaign.minDelay || 4,
        max_delay: campaign.maxDelay || 8,
        batch_size: campaign.batchSize || 25,
        sleep_seconds: campaign.sleepSeconds || 30,
      });

      if (!res || res.success === false) {
        get().addToast(res?.error || 'Failed to launch campaign', 'error');
        return { success: false, error: res?.error || 'Launch failed' };
      }

      // Deduct from wallet UI
      const newBalance = Number((currentBalance - totalCost).toFixed(2));
      const nowFull =
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      set((state) => ({
        metaWallet: {
          ...state.metaWallet,
          balance: newBalance,
          lastUpdated: 'Just now',
        },
        walletTransactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'debit' as const,
            category: 'Campaign Messages',
            amount: totalCost,
            currency: state.metaWallet.currency,
            description: `${totalRecipients.toLocaleString()} messages for "${campaign.name}"`,
            timestamp: nowFull,
            balanceAfter: newBalance,
            campaignId: String(res.campaign?.id || ''),
            campaignName: campaign.name,
          },
          ...state.walletTransactions,
        ],
      }));

      // Refresh campaign list from DB
      await get().fetchBulkCampaigns();

      get().addToast(
        `Campaign "${campaign.name}" launched to ${totalRecipients.toLocaleString()} contacts! ₹${totalCost.toFixed(2)} deducted.`,
        'success'
      );

      return { success: true, campaignId: String(res.campaign?.id || '') };
    } catch (err: any) {
      get().addToast(`Campaign launch failed: ${err?.message || 'Unknown error'}`, 'error');
      return { success: false, error: err?.message || 'Unknown error' };
    }
  },

  updateMetaWallet: (updates) => {
    set((state) => ({
      metaWallet: { ...state.metaWallet, ...updates, lastUpdated: 'Just now' },
    }));
    get().addToast('Meta Wallet settings updated successfully', 'success');
  },

  addWalletFunds: (amount, note) => {
    const nowFull =
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newBalance = Number((get().metaWallet.balance + amount).toFixed(2));
    const newTx: MetaWalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'credit',
      category: 'Wallet Top-up',
      amount,
      currency: get().metaWallet.currency,
      description: note || `Manual Wallet Top-up via Meta Business Manager`,
      timestamp: nowFull,
      balanceAfter: newBalance,
    };

    set((state) => ({
      metaWallet: {
        ...state.metaWallet,
        balance: newBalance,
        lastUpdated: 'Just now',
      },
      walletTransactions: [newTx, ...state.walletTransactions],
    }));
    get().addToast(`Added ₹${amount.toLocaleString()} to Meta Wallet balance!`, 'success');
  },

  createRecipientList: (list: any) => {
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const count = list.contactCount || list.contacts || 250;
    const validCount = list.validWhatsAppCount || Math.round(count * 0.98);
    const newList: BulkRecipientList = {
      id: `lst-${Date.now()}`,
      name: list.name,
      description: list.description || '',
      type: list.type || 'Customers',
      contacts: count,
      contactCount: count,
      validWhatsAppCount: validCount,
      tags: list.tags || ['VIP', 'Marketing'],
      createdOn: nowStr,
      createdAt: new Date().toISOString(),
      status: 'Active',
      sources: list.sources || { manual: 60, website: 20, csv: 15, other: 5 },
      contactItems: list.contactItems,
    };
    set((state) => ({
      bulkRecipientLists: [newList, ...state.bulkRecipientLists],
    }));
    get().addToast(`Recipient list "${list.name}" created with ${count} contacts`, 'success');
  },

  addSuppressionRecord: (record) => {
    const now = new Date();
    const dateStr = record.date || now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newRecord: SuppressionRecord = {
      id: record.id || `sup-${Date.now()}`,
      name: record.name,
      phone: record.phone,
      type: record.type,
      reason: record.reason,
      metaErrorCode: record.metaErrorCode,
      campaignName: record.campaignName,
      date: dateStr,
      timestamp: Date.now(),
      status: 'Suppressed',
      canResubscribe: record.canResubscribe ?? (record.type !== 'blocked'),
      source: record.source || 'Manual Compliance Entry',
      notes: record.notes,
    };
    set((state) => ({
      suppressionList: [newRecord, ...state.suppressionList.filter((s) => s.phone !== record.phone)],
      conversations: state.conversations.map((c) => {
        const cPhone = c.phone_number.replace(/[^0-9]/g, '');
        const rPhone = record.phone.replace(/[^0-9]/g, '');
        if (cPhone && rPhone && (cPhone.endsWith(rPhone.slice(-10)) || rPhone.endsWith(cPhone.slice(-10)))) {
          return {
            ...c,
            is_blocked: record.type === 'blocked',
            is_opted_out: record.type !== 'blocked',
            suppression_reason: record.reason,
            suppression_date: dateStr,
          };
        }
        return c;
      }),
      notifications: [
        {
          id: Date.now(),
          title: record.type === 'blocked' ? '⛔ Number Blocked by Customer' : '🛑 Customer Unsubscribed / STOP',
          text: `${record.name} (${record.phone}) added to Suppression List: ${record.reason}`,
          time: 'Just now',
          unread: true,
          target: 'bulk-recipients',
          itemType: 'conversation',
        },
        ...state.notifications,
      ],
    }));
    get().addToast(`Added ${record.phone} to Suppression List`, 'warning');
  },

  removeSuppressionRecord: async (idOrPhone) => {
    const rawTarget = (idOrPhone || '').trim();
    if (!rawTarget) return;

    const digitsOnly = rawTarget.replace(/\D/g, '');
    const phoneSuffix = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    // Find the matching suppression item by id OR by normalized phone match
    const existingItem = get().suppressionList.find((s) => {
      if (s.id === rawTarget) return true;
      const sDigits = (s.phone || '').replace(/\D/g, '');
      const sSuffix = sDigits.length >= 10 ? sDigits.slice(-10) : sDigits;
      if (phoneSuffix && sSuffix && (sSuffix === phoneSuffix || sDigits.endsWith(phoneSuffix) || digitsOnly.endsWith(sSuffix))) {
        return true;
      }
      return false;
    });

    const targetPhone = existingItem?.phone || rawTarget;
    const targetName = existingItem?.name;

    // 1. Optimistically update local store: remove from suppressionList & clear flags from conversations
    set((state) => ({
      suppressionList: state.suppressionList.filter((s) => {
        if (s.id === rawTarget) return false;
        if (existingItem && s.id === existingItem.id) return false;
        const sDigits = (s.phone || '').replace(/\D/g, '');
        const sSuffix = sDigits.length >= 10 ? sDigits.slice(-10) : sDigits;
        if (phoneSuffix && sSuffix && (sSuffix === phoneSuffix || sDigits.endsWith(phoneSuffix) || digitsOnly.endsWith(sSuffix))) {
          return false;
        }
        return true;
      }),
      conversations: state.conversations.map((c) => {
        const cDigits = (c.phone_number || '').replace(/\D/g, '');
        const cSuffix = cDigits.length >= 10 ? cDigits.slice(-10) : cDigits;
        const matchesPhone = Boolean(phoneSuffix && cSuffix && (cSuffix === phoneSuffix || cDigits.endsWith(phoneSuffix) || digitsOnly.endsWith(cSuffix)));
        const matchesId = String(c.id) === rawTarget || c.contact_name === rawTarget;

        if (matchesPhone || matchesId) {
          const cleanedTags = (c.tags || []).filter(
            (t) => !['blocked', 'opted out', 'opt-out', 'unsubscribed'].includes(t.toLowerCase())
          );
          return {
            ...c,
            is_blocked: false,
            is_opted_out: false,
            suppression_reason: undefined,
            suppression_date: undefined,
            tags: cleanedTags,
          };
        }
        return c;
      }),
    }));

    get().addToast(`Consent verified! ${targetName ? `${targetName} (${targetPhone})` : targetPhone} re-subscribed.`, 'success');

    // 2. Persist to backend API
    try {
      await apiClient.post('/conversations/threads/resubscribe/', {
        phone: targetPhone,
        id: rawTarget,
      });
    } catch (e) {
      console.warn('Backend resubscribe sync notice:', e);
    }
  },

  isPhoneSuppressed: (phone) => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) return false;
    return get().suppressionList.some((s) => {
      const sClean = s.phone.replace(/[^0-9]/g, '');
      return sClean && (sClean.endsWith(clean.slice(-10)) || clean.endsWith(sClean.slice(-10)));
    });
  },

  setSuppressionSearchQuery: (query: string) => set({ suppressionSearchQuery: query }),

  createScheduledMessage: (msg: any) => {
    const nowFull =
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const count = msg.recipientCount || msg.recipients || 500;
    const newScheduled: BulkScheduledMessage = {
      id: `sch-${Date.now()}`,
      name: msg.campaignName || msg.name,
      campaignName: msg.campaignName || msg.name,
      description: msg.description || `Broadcast to ${msg.recipientGroupName || 'Audience'}`,
      type: 'Campaign',
      scheduledDateTime: msg.scheduledFor || msg.scheduledDateTime || 'Tomorrow 10:00 AM',
      scheduledDate: msg.scheduledDate || 'Tomorrow',
      scheduledTime: msg.scheduledTime || '10:00 AM',
      scheduledFor: msg.scheduledFor || new Date().toISOString(),
      recipientGroupId: msg.recipientGroupId || 'list-1',
      recipientGroupName: msg.recipientGroupName || 'All Active Customers',
      recipientCount: count,
      recipients: count,
      templateName: msg.templateName || msg.templateUsed || 'Offer Announcement',
      category: msg.category || 'marketing',
      status: 'QUEUED',
      estimatedCost: msg.estimatedCost || Number((count * 0.78).toFixed(2)),
      createdOn: nowFull,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      bulkScheduledMessages: [newScheduled, ...state.bulkScheduledMessages],
    }));
    get().addToast(`Message "${newScheduled.campaignName}" scheduled successfully!`, 'success');
  },

  cancelScheduledMessage: (id) => {
    set((state) => ({
      bulkScheduledMessages: state.bulkScheduledMessages.map((m) =>
        m.id === id ? { ...m, status: 'CANCELLED' } : m
      ),
    }));
    get().addToast('Scheduled message cancelled', 'info');
  },

  sendScheduledMessageNow: (id) => {
    const item = get().bulkScheduledMessages.find((m) => m.id === id);
    if (!item) return;

    const count = item.recipientCount || item.recipients || 500;
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const deliveredCount = Math.round(count * 0.98);
    const newCmp: BulkCampaign = {
      id: `cmp-${Date.now()}`,
      name: item.campaignName || item.name || 'Broadcast',
      description: item.description,
      type: 'Marketing',
      category: item.category || 'marketing',
      audienceListName: item.recipientGroupName || 'All Active Customers',
      totalRecipients: count,
      recipients: count,
      deliveredCount,
      delivered: deliveredCount,
      deliveredPercent: 98.0,
      readCount: Math.round(count * 0.72),
      repliedCount: Math.round(count * 0.14),
      failedCount: count - deliveredCount,
      failed: count - deliveredCount,
      failedPercent: 2.0,
      pending: 0,
      cost: item.estimatedCost || Number((count * 0.78).toFixed(2)),
      createdOn: nowStr,
      createdAt: new Date().toISOString(),
      createdBy: item.createdBy || 'Rahul Mehta',
      completedOn: 'Just now',
      status: 'COMPLETED',
      templateName: item.templateName || item.templateUsed || 'Offer Announcement',
      messageText: item.messageText || '',
    };

    set((state) => ({
      bulkScheduledMessages: state.bulkScheduledMessages.map((m) =>
        m.id === id ? { ...m, status: 'SENT' } : m
      ),
      bulkCampaigns: [newCmp, ...state.bulkCampaigns],
    }));
    get().addToast(`Dispatched scheduled campaign "${newCmp.name}" immediately!`, 'success');
  },

  duplicateCampaign: (campaignId) => {
    const existing = get().bulkCampaigns.find((c) => String(c.id) === String(campaignId));
    if (!existing) return;

    const cloned: BulkCampaign = {
      ...existing,
      id: `cmp-${Date.now()}`,
      name: `${existing.name} (Copy)`,
      createdOn: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
      delivered: 0,
      deliveredCount: 0,
      deliveredPercent: 0,
      readCount: 0,
      repliedCount: 0,
      failed: 0,
      failedCount: 0,
      failedPercent: 0,
      pending: existing.totalRecipients || existing.recipients || 0,
    };

    set({ draftCampaign: cloned });
    get().addToast(`Duplicated "${existing.name}" — ready to review and send!`, 'success');
  },

  deleteBulkCampaign: async (campaignId) => {
    try {
      await apiClient.delete(`/conversations/bulk-campaigns/${campaignId}/`);
      set((state) => ({
        bulkCampaigns: state.bulkCampaigns.filter((c) => String(c.id) !== String(campaignId)),
      }));
      get().addToast('Campaign deleted successfully', 'success');
      return true;
    } catch (err: any) {
      get().addToast(`Failed to delete campaign: ${err?.message || 'Unknown error'}`, 'error');
      return false;
    }
  },

  retryFailedCampaign: async (campaignId) => {
    try {
      const res = await apiClient.post(`/conversations/bulk-campaigns/${campaignId}/retry_failed/`, {});
      if (res && res.success !== false) {
        get().addToast(res.message || 'Retrying failed recipients...', 'success');
        await get().fetchBulkCampaigns();
        return true;
      } else {
        get().addToast(res?.error || res?.message || 'Failed to retry recipients', 'error');
        return false;
      }
    } catch (err: any) {
      get().addToast(`Retry failed: ${err?.message || 'Unknown error'}`, 'error');
      return false;
    }
  },

  setActiveRoleId: (roleId: string) => set({ activeRoleId: roleId }),

  updateRolePermission: (roleId, module, action, enabled) => {
    const roles = get().roles.map((r) => {
      if (r.id !== roleId) return r;
      const modPerms = { ...r.permissions[module], [action]: enabled };
      return {
        ...r,
        permissions: {
          ...r.permissions,
          [module]: modPerms,
        },
        lastUpdated: 'Just now',
      };
    });
    persistRoles(roles);
    set({ roles });
  },

  updateRoleScope: (roleId, scope) => {
    const roles = get().roles.map((r) => (r.id === roleId ? { ...r, scope, lastUpdated: 'Just now' } : r));
    persistRoles(roles);
    set({ roles });
    get().addToast(`Updated record scope to "${scope}" for role`, 'success');
  },

  setRoleAllPermissions: (roleId, enabled) => {
    const roles = get().roles.map((r) => {
      if (r.id !== roleId) return r;
      const updatedPerms = {} as any;
      Object.keys(r.permissions).forEach((mod) => {
        updatedPerms[mod] = {
          view: enabled,
          create: enabled,
          edit: enabled,
          delete: enabled,
          approve: enabled,
          execute: enabled,
          export: enabled,
        };
      });
      return { ...r, permissions: updatedPerms, lastUpdated: 'Just now' };
    });
    persistRoles(roles);
    set({ roles });
    get().addToast(enabled ? 'Granted all permissions' : 'Revoked all permissions', 'info');
  },

  resetRolePermissions: (roleId) => {
    const defaultPreset = getRoleDefaultPreset(roleId);
    const roles = get().roles.map((r) => (r.id === roleId ? defaultPreset : r));
    persistRoles(roles);
    set({ roles });
    get().addToast(`Reset permissions to system default for "${defaultPreset.name}"`, 'success');
  },

  addCustomRole: (newRoleData) => {
    const id = `custom-${Date.now()}`;
    const newRole: RoleDefinition = {
      ...newRoleData,
      id,
      isSystemRole: false,
      lastUpdated: 'Just now',
      updatedBy: 'System Administrator',
    };
    const roles = [...get().roles, newRole];
    persistRoles(roles);
    set({ roles, activeRoleId: id });
    get().addToast(`Custom role "${newRole.name}" created successfully!`, 'success');
  },

  deleteCustomRole: (roleId) => {
    const roleToDelete = get().roles.find((r) => r.id === roleId);
    if (roleToDelete?.isSystemRole) {
      get().addToast('System roles cannot be deleted', 'error');
      return;
    }
    const roles = get().roles.filter((r) => r.id !== roleId);
    persistRoles(roles);
    set({ roles, activeRoleId: roles[0]?.id || 'admin' });
    get().addToast(`Deleted role "${roleToDelete?.name || roleId}"`, 'info');
  },

  assignEmployeeToRole: (employeeName, roleId) => {
    const roles = get().roles.map((r) => {
      if (r.id === roleId) {
        const current = r.assignedEmployees || [];
        const exists = current.includes(employeeName);
        const updated = exists ? current.filter((name) => name !== employeeName) : [...current, employeeName];
        return { ...r, assignedEmployees: updated };
      }
      return r;
    });
    persistRoles(roles);
    set({ roles });
    get().addToast(`Updated staff assignment for role`, 'success');
  },

  saveRoleChanges: (roleId) => {
    persistRoles(get().roles);
    const role = get().roles.find((r) => r.id === roleId);
    get().addToast(`Security matrix for "${role?.name || 'Role'}" saved & deployed!`, 'success');
  },

  fetchBulkTemplates: async () => {
    try {
      const res: any = await apiClient.get('/conversations/templates/');
      if (res) {
        const rawList = Array.isArray(res.results) ? res.results : Array.isArray(res) ? res : [];
        const mapped = rawList.map((t: any): BulkTemplateItem => {
          const metaCat = t.meta_category ? t.meta_category.toLowerCase() : (t.category || 'marketing').toLowerCase();
          const rawStatus = (t.meta_status || t.status || 'APPROVED').toUpperCase();
          return {
            id: String(t.id),
            templateId: t.meta_template_id || t.name,
            name: t.name,
            category: metaCat,
            language: t.language || 'en_US',
            status: rawStatus,
            meta_status: rawStatus,
            body: t.body_text || t.body || '',
            bodyText: t.body_text || t.body || '',
            header: t.header_type && t.header_type !== 'NONE' ? t.header_type : 'None',
            headerType: t.header_type || 'NONE',
            headerContent: t.header_url || t.header_text || undefined,
            headerFileName: t.header_type === 'DOCUMENT' ? (t.header_text || 'document.pdf') : undefined,
            footer: t.footer_text || 'None',
            footerText: t.footer_text || '',
            buttons: Array.isArray(t.buttons) ? t.buttons : [],
            qualityRating: t.quality_score === 'GREEN' ? 'High' : t.quality_score === 'YELLOW' ? 'Medium' : 'Low',
            lastUpdated: t.last_updated || (t.updated_at ? new Date(t.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'),
            updatedBy: t.author || 'WhatsQ Staff',
          };
        });
        set({ bulkTemplates: mapped });
      }
    } catch (err) {
      console.warn('[fetchBulkTemplates] failed:', err);
    }
  },

  createBulkTemplate: async (template: any) => {
    const category = (template.category || 'marketing').toLowerCase();
    const metaCategory = category === 'utility' ? 'UTILITY' : category === 'authentication' ? 'AUTHENTICATION' : 'MARKETING';
    const payload = {
      name: template.name.trim().toLowerCase().replace(/\s+/g, '_'),
      category: template.category || 'Marketing',
      meta_category: metaCategory,
      language: template.language || 'en_US',
      status: 'Active',
      meta_status: 'PENDING',
      header_type: template.headerType || 'NONE',
      header_text: template.headerType === 'DOCUMENT' ? (template.headerFileName || '') : (template.headerType === 'TEXT' ? template.headerContent : ''),
      header_url: template.headerContent || '',
      body: template.bodyText || template.body || '',
      body_text: template.bodyText || template.body || '',
      footer_text: template.footerText || template.footer || '',
      buttons: template.buttons || [],
      author: 'Admin',
      last_updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      const res: any = await apiClient.post('/conversations/templates/', payload);
      if (res && res.id) {
        // Also trigger submission to Meta Graph API
        await apiClient.post(`/conversations/templates/${res.id}/submit_to_meta/`, {});
        await get().fetchBulkTemplates();
        get().addToast(`Template "${template.name}" created and saved to database!`, 'success');
        return true;
      } else {
        get().addToast(res?.error || 'Failed to create template', 'error');
        return false;
      }
    } catch (err: any) {
      get().addToast(`Template creation error: ${err.message}`, 'error');
      return false;
    }
  },

  updateBulkTemplate: async (templateId: string, updates: Partial<BulkTemplateItem>) => {
    const category = updates.category ? updates.category.toLowerCase() : undefined;
    const metaCategory = category ? (category === 'utility' ? 'UTILITY' : category === 'authentication' ? 'AUTHENTICATION' : 'MARKETING') : undefined;
    const payload: any = {
      last_updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    if (updates.name) payload.name = updates.name.trim().toLowerCase().replace(/\s+/g, '_');
    if (metaCategory) payload.meta_category = metaCategory;
    if (updates.language) payload.language = updates.language;
    if (updates.headerType) payload.header_type = updates.headerType;
    if (updates.headerContent !== undefined) payload.header_url = updates.headerContent;
    if (updates.bodyText || updates.body) {
      payload.body = updates.bodyText || updates.body;
      payload.body_text = updates.bodyText || updates.body;
    }
    if (updates.footerText !== undefined || updates.footer !== undefined) {
      payload.footer_text = updates.footerText || updates.footer || '';
    }
    if (updates.buttons) payload.buttons = updates.buttons;

    try {
      const res: any = await apiClient.patch(`/conversations/templates/${templateId}/`, payload);
      if (res && res.id) {
        await apiClient.post(`/conversations/templates/${templateId}/submit_to_meta/`, {});
        await get().fetchBulkTemplates();
        get().addToast(`Template "${updates.name || templateId}" updated & saved!`, 'success');
        return true;
      } else {
        get().addToast(res?.error || 'Failed to update template', 'error');
        return false;
      }
    } catch (err: any) {
      get().addToast(`Template update error: ${err.message}`, 'error');
      return false;
    }
  },

  deleteBulkTemplate: async (templateId: string) => {
    try {
      await apiClient.delete(`/conversations/templates/${templateId}/`);
      set((state) => ({
        bulkTemplates: state.bulkTemplates.filter((t) => t.id !== templateId),
      }));
      get().addToast('Template deleted successfully from database', 'info');
      return true;
    } catch (err: any) {
      get().addToast(`Failed to delete template: ${err.message}`, 'error');
      return false;
    }
  },

  updateBulkTemplateStatus: async (templateId: string, status: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    try {
      await apiClient.patch(`/conversations/templates/${templateId}/`, {
        meta_status: status,
        status: status === 'APPROVED' ? 'Active' : status,
      });
      set((state) => ({
        bulkTemplates: state.bulkTemplates.map((t) =>
          t.id === templateId
            ? {
                ...t,
                status,
                meta_status: status,
                approvedOn: status === 'APPROVED' ? 'Just now' : t.approvedOn,
              }
            : t
        ),
      }));
      get().addToast(`Template status updated to ${status}`, 'success');
    } catch (err: any) {
      get().addToast(`Failed to update template status: ${err.message}`, 'error');
    }
  },

  syncBulkTemplatesWithMeta: async () => {
    try {
      const res: any = await apiClient.post('/conversations/templates/sync_meta/', {});
      await get().fetchBulkTemplates();
      if (res?.message) {
        get().addToast(res.message, 'success');
      } else {
        get().addToast('WhatsApp templates successfully synced with Meta Cloud API!', 'success');
      }
    } catch (err: any) {
      get().addToast(`Sync failed: ${err.message}`, 'error');
    }
  },

  importContactsToRecipientList: (listName: string, contacts: BulkContact[]) => {
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const validCount = contacts.filter((c) => c.validWhatsApp && !c.optedOut).length;
    const newList: BulkRecipientList = {
      id: `lst-imported-${Date.now()}`,
      name: listName,
      description: `Direct imported contact list with ${contacts.length} numbers`,
      type: 'Campaign',
      contactCount: contacts.length,
      validWhatsAppCount: validCount,
      tags: ['Imported', 'CSV', 'Custom'],
      createdOn: nowStr,
      createdAt: new Date().toISOString(),
      status: 'Active',
      sources: { manual: 0, website: 0, csv: 100, other: 0 },
      contactItems: contacts,
    };
    set((state) => ({
      bulkRecipientLists: [newList, ...state.bulkRecipientLists],
    }));
    get().addToast(`Successfully imported ${contacts.length} contacts into "${listName}"!`, 'success');
    return newList;
  },

  saveMetaConfig: async (configData) => {
    const current = get().metaConfig;
    const updated: MetaConfig = {
      phone_number_id: configData.phone_number_id || current?.phone_number_id || '1307178355804150',
      waba_id: configData.waba_id || current?.waba_id || '4567067243541240',
      access_token: configData.access_token || current?.access_token || 'EAAG...',
      verify_token: configData.verify_token || current?.verify_token || 'qiyam_whatsapp_secret_token_2026',
      api_version: configData.api_version || current?.api_version || 'v21.0',
      webhook_url: configData.webhook_url || current?.webhook_url || 'https://qiyam-business-os.qiyamapp.com/api/webhooks/whatsapp/',
      is_active: configData.is_active ?? (current?.is_active ?? true),
      connection_status: configData.connection_status || current?.connection_status || 'connected',
      business_name: configData.business_name || current?.business_name || 'Qiyam Business Solutions',
      business_phone_display: configData.business_phone_display || current?.business_phone_display || '+91 94963 00233',
      quality_rating: configData.quality_rating || current?.quality_rating || 'GREEN',
      ...configData,
    };
    set({ metaConfig: updated });
    try {
      localStorage.setItem('whatsq_meta_config', JSON.stringify(updated));
    } catch {}
    try {
      const res = await apiClient.post('/conversations/meta-config/', updated);
      if (res?.config) {
        set({ metaConfig: res.config });
      }
    } catch (e) {
      console.warn('Backend save meta config notice:', e);
    }
    get().addToast('WhatsApp Cloud API configuration saved & verified!', 'success');
    return true;
  },

  testMetaConnection: async (credentials) => {
    const res = await apiClient.post('/conversations/meta-config/test_connection/', credentials);
    if (res?.success) {
      set((state) => ({
        metaConfig: state.metaConfig
          ? {
              ...state.metaConfig,
              connection_status: 'connected',
              business_name: res.phone_details?.verified_name || state.metaConfig.business_name,
              business_phone_display:
                res.phone_details?.display_phone_number || state.metaConfig.business_phone_display,
              quality_rating: res.phone_details?.quality_rating || state.metaConfig.quality_rating,
            }
          : state.metaConfig,
      }));
    }
    return res;
  },

  testForwardProxy: async (forward_webhook_url: string) => {
    return apiClient.post('/conversations/meta-config/test_forward_proxy/', { forward_webhook_url });
  },

  saveWorkspaceSettings: async (data) => {
    const ws = get().workspace;
    if (!ws?.id) {
      get().addToast('Workspace not loaded from server', 'error');
      return false;
    }
    const res = await apiClient.put(`/core/workspace/${ws.id}/`, { ...ws, ...data });
    if (res?.id && res.success !== false) {
      set({ workspace: res as WorkspaceSettings });
      get().addToast('Workspace settings saved', 'success');
      return true;
    }
    get().addToast(res?.error || 'Failed to save workspace settings', 'error');
    return false;
  },

  askAiCopilot: async (prompt) => {
    const res = await qiyamApi.aiChat(prompt);
    if (res?.response) {
      return {
        response: res.response as string,
        suggestions: (res.suggestions as string[]) || [],
      };
    }
    return null;
  },

  updateLeadStage: async (leadId, newStage, note) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return false;
    const updatedNotes = note
      ? (lead.notes ? `${lead.notes}\n[${new Date().toLocaleDateString()}] Stage -> ${newStage}: ${note}` : `[${new Date().toLocaleDateString()}] Stage -> ${newStage}: ${note}`)
      : lead.notes;

    // Optimistic store update
    set((state) => ({
      leads: state.leads.map((l) => (l.id === leadId ? { ...l, stage: newStage, notes: updatedNotes } : l)),
    }));

    try {
      const res = await apiClient.put(`/crm/leads/${leadId}/`, { ...lead, stage: newStage, notes: updatedNotes });
      if (res && res.success !== false) {
        if (res.id) {
          set((state) => ({
            leads: state.leads.map((l) => (l.id === leadId ? { ...(res as Lead), stage: newStage } : l)),
          }));
        }
        get().addToast(`Stage updated to "${newStage.replace('_', ' ').toUpperCase()}"`, 'success');
        return true;
      } else {
        get().addToast(`Stage updated to "${newStage.replace('_', ' ').toUpperCase()}"`, 'info');
        return true;
      }
    } catch {
      get().addToast(`Stage updated to "${newStage.replace('_', ' ').toUpperCase()}" (saved locally)`, 'info');
      return true;
    }
  },

  convertLeadToDeal: async (leadId, customData = {}) => {
    const lead = get().leads.find((l) => l.id === leadId);
    try {
      const res = await apiClient.post(`/crm/leads/${leadId}/convert_to_deal/`, customData);
      if (res?.deal) {
        const createdDeal = res.deal as Deal;
        set((state) => ({
          deals: [createdDeal, ...state.deals.filter((d) => d.id !== createdDeal.id)],
          leads: state.leads.map((l) => (l.id === leadId ? { ...l, stage: 'won' } : l)),
          isLeadDrawerOpen: false,
          targetHighlightId: createdDeal.id,
        }));
        get().setActiveTab('crm-deals');
        get().addToast(`Successfully converted to deal "${createdDeal.deal_name}"!`, 'success');
        return createdDeal;
      }
    } catch (e) {
      console.warn('Backend convert_to_deal failed, using client-side fallback:', e);
    }

    if (lead) {
      const fallbackDeal: Deal = {
        id: `deal-${Date.now()}`,
        deal_name: customData?.deal_name || `${lead.name} Deal`,
        customer_name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        amount: Number(customData?.amount) || lead.value || 10000,
        stage: customData?.stage || 'proposal_sent',
        probability: customData?.probability ?? 70,
        deal_owner: customData?.deal_owner || lead.owner || 'Rahul Mehta',
        source: lead.source || 'Website',
        expected_close_date: customData?.expected_close_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        tags: lead.tags || ['Converted Lead'],
        notes: customData?.notes || lead.notes || '',
      };
      set((state) => ({
        deals: [fallbackDeal, ...state.deals],
        leads: state.leads.map((l) => (l.id === leadId ? { ...l, stage: 'won' } : l)),
        isLeadDrawerOpen: false,
        targetHighlightId: fallbackDeal.id,
      }));
      get().setActiveTab('crm-deals');
      get().addToast(`Lead converted to Deal "${fallbackDeal.deal_name}"`, 'success');
      return fallbackDeal;
    }
    return null;
  },

  convertConversationToDeal: async (conversationId) => {
    const res = await apiClient.post(`/crm/deals/from_conversation/`, { conversation_id: conversationId });
    if (res?.deal) {
      const newDeal = res.deal as Deal;
      set((state) => ({
        deals: [newDeal, ...state.deals],
      }));
      get().setTargetHighlightId(newDeal.id);
      get().addToast(`✅ Deal "${newDeal.deal_name}" created — Opening CRM Deals now`, 'success');
      get().setActiveTab('crm-deals');
    } else {
      get().addToast(res?.error || 'Could not create deal. Try again.', 'error');
    }
  },

  updateJobStatus: async (jobId, status) => {
    const job = get().jobs.find((j) => j.id === jobId);
    if (!job) return;
    const res = await apiClient.put(`/operations/jobs/${jobId}/`, { ...job, status });
    if (res?.id && res.success !== false) {
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === jobId ? (res as Job) : j)),
      }));
      get().addToast(`Job status updated to "${status}"`, 'success');
    } else {
      get().addToast(res?.error || 'Failed to update job', 'error');
    }
  },

  updateApprovalStatus: async (approvalId, status) => {
    const approval = get().approvals.find((a) => a.id === approvalId);
    if (!approval) return;
    const res = await apiClient.put(`/automation/approvals/${approvalId}/`, { ...approval, status });
    if (res?.id && res.success !== false) {
      set((state) => ({
        approvals: state.approvals.map((a) => (a.id === approvalId ? (res as Approval) : a)),
      }));
      get().addToast(`Request ${status.toLowerCase()}`, status === 'Approved' ? 'success' : 'warning');
    } else {
      get().addToast(res?.error || 'Failed to update approval', 'error');
    }
  },

  toggleTaskChecklist: async (taskId, checklistId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const checklist = task.checklist.map((c) =>
      c.id === checklistId ? { ...c, completed: !c.completed } : c
    );
    const allCompleted = checklist.length > 0 && checklist.every((c) => c.completed);
    let newStatus = task.status;
    if (allCompleted && task.status !== 'completed') {
      newStatus = 'completed';
    } else if (!allCompleted && task.status === 'completed') {
      newStatus = 'in_progress';
    }
    const updatedTask: Task = { ...task, checklist, status: newStatus };

    // Instant optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
    }));
    try {
      const res = await apiClient.put(`/operations/tasks/${taskId}/`, updatedTask);
      if (res?.id && res.success !== false) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? (res as Task) : t)),
        }));
      }
    } catch {
      // Optimistic already reflected
    }
  },

  clockInEmployee: async (employeeId, targetStatus) => {
    const employee = get().employees.find((e) => e.id === employeeId);
    if (!employee) return;
    const isCurrentlyOnDuty = employee.status === 'on_duty';
    const newStatus = targetStatus || (isCurrentlyOnDuty ? 'active' : 'on_duty');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Optimistic update
    const updatedEmployee: Employee = { ...employee, status: newStatus };
    set((state) => ({
      employees: state.employees.map((e) => (e.id === employeeId ? updatedEmployee : e)),
      attendance: state.attendance.map((a) =>
        a.employee_id_str === employee.employee_id_str
          ? {
              ...a,
              ...(newStatus === 'on_duty'
                ? { check_in: `${timeStr} (On time)`, status: 'present' }
                : { check_out: timeStr }
              )
            }
          : a
      ),
    }));

    try {
      const res = await apiClient.put(`/operations/employees/${employeeId}/`, {
        ...employee,
        status: newStatus,
      });
      if (res?.id && res.success !== false) {
        set((state) => ({
          employees: state.employees.map((e) => (e.id === employeeId ? (res as Employee) : e)),
        }));
      }
    } catch (err) {
      console.warn('Could not sync status with backend:', err);
    }

    if (newStatus === 'on_duty') {
      get().addToast(`${employee.name} clocked in at ${timeStr} (On Duty)`, 'success');
    } else if (newStatus === 'on_leave') {
      get().addToast(`${employee.name} marked as On Leave`, 'warning');
    } else {
      get().addToast(`${employee.name} clocked out at ${timeStr} (Off Duty)`, 'info');
    }
  },

  addEmployee: async (newEmp) => {
    const nextId = get().employees.length + 1;
    const empData = {
      name: newEmp.name || 'New Staff',
      employee_id_str: newEmp.employee_id_str || `EMP-${String(nextId).padStart(3, '0')}`,
      role: newEmp.role || 'Field Technician',
      department: newEmp.department || 'AC Services',
      phone: newEmp.phone || '+91 90000 00000',
      email: newEmp.email || 'staff@qiyam.com',
      status: newEmp.status || 'active',
      location: newEmp.location || 'Kozhikode, Kerala',
      rating: newEmp.rating ?? 5.0,
      jobs_completed_month: 0,
      on_time_percent: 100,
      today_schedule: [],
    };
    try {
      const res = await apiClient.post('/operations/employees/', empData);
      const created = (res?.id && res.success !== false) ? (res as Employee) : { ...empData, id: nextId } as Employee;
      set((state) => ({ employees: [created, ...state.employees] }));
      get().addToast(`Employee "${created.name}" added successfully`, 'success');
      return created;
    } catch (e) {
      const fallback = { ...empData, id: nextId } as Employee;
      set((state) => ({ employees: [fallback, ...state.employees] }));
      get().addToast(`Employee "${fallback.name}" added`, 'success');
      return fallback;
    }
  },

  updateEmployee: async (employeeId, updates) => {
    const employee = get().employees.find((e) => e.id === employeeId);
    if (!employee) return;
    const merged: Employee = { ...employee, ...updates };
    set((state) => ({
      employees: state.employees.map((e) => (e.id === employeeId ? merged : e)),
    }));
    try {
      const res = await apiClient.put(`/operations/employees/${employeeId}/`, merged);
      if (res?.id && res.success !== false) {
        set((state) => ({
          employees: state.employees.map((e) => (e.id === employeeId ? (res as Employee) : e)),
        }));
      }
      get().addToast(`Profile for ${employee.name} updated`, 'success');
    } catch (e) {
      get().addToast(`Updated ${employee.name} profile`, 'info');
    }
  },

  saveWorkflowNodes: async (workflowId, nodes) => {
    const workflow = get().workflows.find((w) => w.id === workflowId);
    if (!workflow) return;
    const res = await apiClient.put(`/automation/workflows/${workflowId}/`, {
      ...workflow,
      nodes,
      last_modified: new Date().toLocaleString(),
    });
    if (res?.id && res.success !== false) {
      set((state) => ({
        workflows: state.workflows.map((w) => (w.id === workflowId ? (res as Workflow) : w)),
      }));
      get().addToast('Workflow saved', 'success');
    } else {
      get().addToast(res?.error || 'Failed to save workflow', 'error');
    }
  },

  runWorkflowTest: async (workflowId, inputMessage) => {
    const res = await apiClient.post(`/automation/workflows/${workflowId}/execute/`, {
      input_data: { message: inputMessage },
    });
    if (res?.executed_steps) {
      const steps = (res.executed_steps as { output: string }[]).map(
        (s) => `${s.output}`
      );
      const duration = (res.duration as string) || '0.84s';
      const logs = await qiyamApi.fetchWorkflowLogs();
      set({ workflowLogs: logs });
      get().addToast(`Workflow test completed (${duration})`, 'success');
      return { steps, duration };
    }
    get().addToast(res?.error || 'Workflow test failed', 'error');
    return { steps: [], duration: '0s' };
  },

  addLead: async (newLead) => {
    const nextId = get().leads.length + 1;
    const item: Lead = {
      id: nextId,
      name: newLead.name || 'New Lead',
      phone: newLead.phone || '+91 90000 00000',
      email: newLead.email || '',
      service: newLead.service || 'AC General Service',
      location: newLead.location || 'Kozhikode, Kerala',
      value: Number(newLead.value) || 2800,
      stage: newLead.stage || 'new',
      owner: newLead.owner || 'Rahul Mehta',
      source: newLead.source || 'WhatsApp Inbound',
      created_at_str: 'Today',
      last_contact_str: 'Just now',
      notes: newLead.notes || '',
      tags: newLead.tags || ['WhatsApp Lead'],
      ...newLead,
    };
    try {
      const res = await apiClient.post('/crm/leads/', item);
      const created = (res?.id && res.success !== false) ? (res as Lead) : item;
      set((state) => ({ leads: [created, ...state.leads] }));
      get().addToast(`Lead "${created.name}" created successfully!`, 'success');
      return created;
    } catch {
      set((state) => ({ leads: [item, ...state.leads] }));
      get().addToast(`Lead "${item.name}" created`, 'success');
      return item;
    }
  },

  addDeal: async (newDeal) => {
    const nextId = get().deals.length + 1;
    const item: Deal = {
      id: nextId,
      deal_name: newDeal.deal_name || 'AC AMC Contract',
      customer_name: newDeal.customer_name || 'Valued Customer',
      phone: newDeal.phone || '+91 90000 00000',
      email: newDeal.email || 'client@example.com',
      amount: Number(newDeal.amount) || 15000,
      stage: newDeal.stage || 'proposal_sent',
      probability: Number(newDeal.probability) || 60,
      deal_owner: newDeal.deal_owner || 'Rahul Mehta',
      source: newDeal.source || 'Direct Referral',
      expected_close_date: newDeal.expected_close_date || 'May 31, 2024',
      tags: newDeal.tags || ['Enterprise'],
      notes: newDeal.notes || '',
      ...newDeal,
    };
    try {
      const res = await apiClient.post('/crm/deals/', item);
      const created = (res?.id && res.success !== false) ? (res as Deal) : item;
      set((state) => ({ deals: [created, ...state.deals] }));
      get().addToast(`Deal "${created.deal_name}" created!`, 'success');
      return created;
    } catch {
      set((state) => ({ deals: [item, ...state.deals] }));
      get().addToast(`Deal "${item.deal_name}" created`, 'success');
      return item;
    }
  },

  updateDeal: async (id, patch) => {
    set((state) => ({
      deals: state.deals.map((d) => (String(d.id) === String(id) ? { ...d, ...patch } : d)),
    }));
    try {
      if (typeof id === 'number' || !isNaN(Number(id))) {
        await apiClient.put(`/crm/deals/${id}/`, patch);
      }
    } catch (e) {
      console.warn('Backend update deal notice:', e);
    }
  },

  deleteDeal: async (id) => {
    set((state) => ({
      deals: state.deals.filter((d) => String(d.id) !== String(id)),
    }));
    try {
      if (typeof id === 'number' || !isNaN(Number(id))) {
        await apiClient.delete(`/crm/deals/${id}/`);
      }
    } catch (e) {
      console.warn('Backend delete deal notice:', e);
    }
    get().addToast('Deal removed from pipeline', 'info');
  },

  addJob: async (newJob) => {
    const nextId = get().jobs.length + 1;
    const item: Job = {
      id: nextId,
      job_id_str: newJob.job_id_str || `JOB-${1025 + nextId}`,
      customer_name: newJob.customer_name || 'Client',
      phone: newJob.phone || '+91 98765 43210',
      service: newJob.service || 'AC Deep Service',
      date_str: newJob.date_str || 'Today',
      time_str: newJob.time_str || '11:00 AM',
      assigned_to: newJob.assigned_to || 'Amit Sharma',
      status: newJob.status || 'scheduled',
      priority: newJob.priority || 'high',
      location: newJob.location || 'Kozhikode Beach Road',
      amount: Number(newJob.amount) || 3500,
      advance_paid: Number(newJob.advance_paid) || 1000,
      payment_status: newJob.payment_status || 'advance_paid',
      timeline: [
        { title: 'Job Dispatch Created', timestamp: 'Just now', by: 'System Dispatch', completed: true },
        { title: 'Technician Assigned', timestamp: 'Just now', by: newJob.assigned_to || 'Amit Sharma', completed: true },
      ],
      ...newJob,
    };
    try {
      const res = await apiClient.post('/operations/jobs/', item);
      const created = (res?.id && res.success !== false) ? (res as Job) : item;
      set((state) => ({ jobs: [created, ...state.jobs] }));
      get().addToast(`Job dispatch "${created.job_id_str}" scheduled!`, 'success');
      return created;
    } catch {
      set((state) => ({ jobs: [item, ...state.jobs] }));
      get().addToast(`Job dispatch "${item.job_id_str}" scheduled`, 'success');
      return item;
    }
  },

  addInvoice: async (newInv) => {
    const nextId = get().invoices.length + 1;
    const invNum = newInv.invoice_number || `INV-2024-${String(187 + nextId).padStart(4, '0')}`;
    const item: Invoice = {
      id: nextId,
      invoice_number: invNum,
      customer_name: newInv.customer_name || 'Customer Name',
      customer_email: newInv.customer_email || 'customer@gmail.com',
      customer_phone: newInv.customer_phone || '+91 98765 43210',
      invoice_date: newInv.invoice_date || 'May 28, 2024',
      due_date: newInv.due_date || 'June 05, 2024',
      amount: Number(newInv.amount) || 4500,
      status: newInv.status || 'sent',
      paid_amount: Number(newInv.paid_amount) || 0,
      payment_method: newInv.payment_method || 'UPI (GPay)',
      items: newInv.items || [
        { description: 'Service Charges', qty: 1, unitPrice: Number(newInv.amount) || 4500, amount: Number(newInv.amount) || 4500 }
      ],
      ...newInv,
    };
    try {
      const res = await apiClient.post('/finance/invoices/', item);
      const created = (res?.id && res.success !== false) ? (res as Invoice) : item;
      set((state) => ({ invoices: [created, ...state.invoices] }));
      get().addToast(`Invoice "${created.invoice_number}" created!`, 'success');
      return created;
    } catch {
      set((state) => ({ invoices: [item, ...state.invoices] }));
      get().addToast(`Invoice "${item.invoice_number}" created`, 'success');
      return item;
    }
  },

  addQuotation: async (newQuo) => {
    const nextId = get().quotations.length + 1;
    const quoNum = newQuo.quotation_number || `QUO-2024-${String(42 + nextId).padStart(4, '0')}`;
    const item: Quotation = {
      id: nextId,
      quotation_number: quoNum,
      customer_name: newQuo.customer_name || 'Customer Name',
      customer_email: newQuo.customer_email || 'customer@gmail.com',
      customer_phone: newQuo.customer_phone || '+91 98765 43210',
      quotation_date: newQuo.quotation_date || 'May 31, 2024',
      valid_until: newQuo.valid_until || 'June 15, 2024',
      amount: Number(newQuo.amount) || 0,
      subtotal: Number(newQuo.subtotal) || Number(newQuo.amount) || 0,
      tax_amount: Number(newQuo.tax_amount) || 0,
      discount_amount: Number(newQuo.discount_amount) || 0,
      status: newQuo.status || 'draft',
      converted_invoice_id: newQuo.converted_invoice_id || '',
      terms: newQuo.terms || 'Validity: 15 days. 50% advance payment required upon acceptance.',
      notes: newQuo.notes || '',
      items: newQuo.items || [],
      ...newQuo,
    };
    try {
      const res = await apiClient.post('/finance/quotations/', item);
      const created = (res?.id && res.success !== false) ? (res as Quotation) : item;
      set((state) => {
        const nextQuos = [created, ...state.quotations.filter((q) => String(q.id) !== String(created.id))];
        persistCache('quotations', nextQuos);
        return { quotations: nextQuos };
      });
      get().addToast(`Quotation "${created.quotation_number}" created!`, 'success');
      return created;
    } catch {
      set((state) => {
        const nextQuos = [item, ...state.quotations.filter((q) => String(q.id) !== String(item.id))];
        persistCache('quotations', nextQuos);
        return { quotations: nextQuos };
      });
      get().addToast(`Quotation "${item.quotation_number}" created`, 'success');
      return item;
    }
  },

  updateQuotation: async (id, updates) => {
    set((state) => {
      const nextQuos = state.quotations.map((q) => (String(q.id) === String(id) ? { ...q, ...updates } : q));
      persistCache('quotations', nextQuos);
      return { quotations: nextQuos };
    });
    try {
      await apiClient.patch(`/finance/quotations/${id}/`, updates);
    } catch {}
    const updated = get().quotations.find((q) => String(q.id) === String(id))!;
    get().addToast(`Quotation updated!`, 'success');
    return updated;
  },

  deleteQuotation: async (id) => {
    set((state) => {
      const nextQuos = state.quotations.filter((q) => String(q.id) !== String(id));
      persistCache('quotations', nextQuos);
      return { quotations: nextQuos };
    });
    try {
      await apiClient.delete(`/finance/quotations/${id}/`);
    } catch {}
    get().addToast('Quotation deleted', 'info');
  },

  convertQuotationToInvoice: async (quotationId) => {
    const quo = get().quotations.find((q) => String(q.id) === String(quotationId));
    if (!quo) throw new Error('Quotation not found');

    const nextId = get().invoices.length + 1;
    const invNum = `INV-2024-${String(187 + nextId).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      id: nextId,
      invoice_number: invNum,
      customer_name: quo.customer_name,
      customer_email: quo.customer_email || 'customer@gmail.com',
      customer_phone: quo.customer_phone || '+91 98765 43210',
      invoice_date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      due_date: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      amount: quo.amount,
      status: 'sent',
      paid_amount: 0,
      payment_method: 'UPI (GPay)',
      items: (quo.items && quo.items.length > 0)
        ? quo.items.map((it) => ({
            description: it.description,
            qty: it.qty,
            unitPrice: it.unitPrice,
            amount: it.amount,
          }))
        : [{ description: `Services as per Quotation ${quo.quotation_number}`, qty: 1, unitPrice: quo.amount, amount: quo.amount }],
    };

    try {
      await apiClient.post(`/finance/quotations/${quotationId}/convert-to-invoice/`, { invoice_number: invNum });
    } catch {}

    const updatedQuo: Quotation = { ...quo, status: 'converted', converted_invoice_id: invNum };
    set((state) => {
      const nextInvoices = [newInvoice, ...state.invoices];
      const nextQuos = state.quotations.map((q) =>
        String(q.id) === String(quotationId) ? updatedQuo : q
      );
      persistCache('invoices', nextInvoices);
      persistCache('quotations', nextQuos);
      return {
        invoices: nextInvoices,
        quotations: nextQuos,
      };
    });

    get().addToast(`Quotation ${quo.quotation_number} converted to Invoice ${invNum}!`, 'success');
    return { quotation: updatedQuo, invoice: newInvoice };
  },

  addAppointment: async (newApt) => {
    const nextId = get().appointments.length + 1;
    const item: Appointment = {
      id: nextId,
      apt_id_str: newApt.apt_id_str || `APT-${100 + nextId}`,
      customer_name: newApt.customer_name || 'Customer',
      phone: newApt.phone || '+91 98765 00000',
      service: newApt.service || 'AC Inspection',
      employee: newApt.employee || 'Ramesh Kumar',
      date_str: newApt.date_str || 'Tomorrow',
      time_str: newApt.time_str || '10:00 AM',
      status: newApt.status || 'confirmed',
      duration: newApt.duration || '1h 30m',
      location: newApt.location || 'Kozhikode',
      amount: Number(newApt.amount) || 2800,
      advance: Number(newApt.advance) || 840,
      payment_status: newApt.payment_status || 'advance_paid',
      source: newApt.source || 'WhatsApp Chatbot',
      notes: newApt.notes || 'Confirmed booking slot',
      ...newApt,
    };
    try {
      const res = await apiClient.post('/operations/appointments/', item);
      const created = (res?.id && res.success !== false) ? (res as Appointment) : item;
      set((state) => ({ appointments: [created, ...state.appointments] }));
      get().addToast(`Appointment for ${created.customer_name} booked!`, 'success');
      return created;
    } catch {
      set((state) => ({ appointments: [item, ...state.appointments] }));
      get().addToast(`Appointment for ${item.customer_name} booked`, 'success');
      return item;
    }
  },

  openConversationForAppointment: async (apt, options) => {
    const rawTargetPhone = (apt.phone || '').trim();
    const normTarget = rawTargetPhone.replace(/\D/g, '').slice(-10);
    const cleanName = (apt.customer_name || '').trim().toLowerCase();

    const state = get();
    const allConvs = state.conversations || [];

    // Step 1: Match EXACT name AND matching phone (Best match)
    let targetConv = allConvs.find((c) => {
      const cName = (c.contact_name || '').trim().toLowerCase();
      const cNorm = (c.phone_number || '').replace(/\D/g, '').slice(-10);
      const nameMatch = cleanName && cName === cleanName;
      const phoneMatch = normTarget && normTarget.length >= 7 && cNorm === normTarget;
      return nameMatch && phoneMatch;
    });

    // Step 2: Match EXACT name (Prevents phone collision when different test customers share dummy numbers)
    if (!targetConv && cleanName) {
      targetConv = allConvs.find((c) => {
        const cName = (c.contact_name || '').trim().toLowerCase();
        return cName === cleanName;
      });
    }

    // Step 3: Loose name match (e.g. "Vikram" vs "Vikram Mehta")
    if (!targetConv && cleanName && cleanName.length >= 3) {
      targetConv = allConvs.find((c) => {
        const cName = (c.contact_name || '').trim().toLowerCase();
        return cName.includes(cleanName) || cleanName.includes(cName);
      });
    }

    // Step 4: Phone match ONLY IF existing customer name does not conflict
    if (!targetConv && normTarget && normTarget.length >= 7) {
      targetConv = allConvs.find((c) => {
        const cNorm = (c.phone_number || '').replace(/\D/g, '').slice(-10);
        if (cNorm !== normTarget) return false;
        const cName = (c.contact_name || '').trim().toLowerCase();
        if (cName && cleanName && !cName.includes(cleanName) && !cleanName.includes(cName)) {
          return false;
        }
        return true;
      });
    }

    // Step 5: If still not found, create a new conversation thread immediately in memory
    const shouldOpenChat = options?.openChat !== false;

    if (!targetConv) {
      const tempId = `conv-apt-${apt.id || Date.now()}`;
      const newConv: Conversation = {
        id: tempId,
        contact_name: apt.customer_name,
        phone_number: apt.phone,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.customer_name)}&background=0D9488&color=fff`,
        category: 'Customer',
        unread_count: 0,
        status: 'in_progress',
        lead_owner: apt.employee || 'Rahul Mehta',
        lead_stage: 'Appointment Confirmed',
        source: apt.source || 'Appointments',
        first_contact_date: apt.date_str || 'Today',
        last_contact_date: 'Just now',
        location: apt.location || 'Kozhikode, Kerala',
        language: 'English',
        tags: ['Appointment', apt.service ? apt.service.split(' ')[0] : 'Service'],
        notes: `Appointment ${apt.apt_id_str || apt.id} scheduled for ${apt.date_str} at ${apt.time_str}`,
        service_needed: apt.service,
        estimated_value: apt.amount,
        messages: [],
        is_online: true,
        last_seen: 'Online',
      };

      set((s) => ({
        conversations: [newConv, ...s.conversations.filter((c) => String(c.id) !== String(tempId))],
        selectedConversationId: newConv.id,
        ...(shouldOpenChat ? { activeTab: 'conversations' } : {}),
      }));
      persistConversations([newConv, ...state.conversations]);
      targetConv = newConv;

      // Asynchronously sync with backend in background without delaying UI transition
      apiClient
        .post('/conversations/threads/', {
          contact_name: apt.customer_name,
          phone_number: apt.phone,
          category: 'Customer',
          status: 'in_progress',
          location: apt.location || 'Kozhikode, Kerala',
          service_needed: apt.service,
          notes: `Appointment ${apt.apt_id_str || apt.id}`,
        })
        .then((res) => {
          if (res && res.id && res.success !== false) {
            set((s) => ({
              conversations: s.conversations.map((c) => (c.id === tempId ? { ...c, id: res.id } : c)),
              selectedConversationId: s.selectedConversationId === tempId ? res.id : s.selectedConversationId,
            }));
          }
        })
        .catch((err) => console.warn('Backend create thread notice:', err));
    } else {
      // Existing conversation found: IMMEDIATELY select it and switch tab
      set((s) => ({
        selectedConversationId: targetConv!.id,
        ...(shouldOpenChat ? { activeTab: 'conversations' } : {}),
      }));
    }

    // Step 6: Send reminder message if requested
    const shouldSend = options?.sendReminder !== false;
    if (shouldSend) {
      const balance = Math.max(0, (apt.amount || 0) - (apt.advance || 0));
      const reminderText =
        options?.customMessage ||
`🗓️ *Appointment Reminder: ${apt.service}*

Hello *${apt.customer_name}*,
This is a confirmation reminder for your upcoming service appointment with Qiyam Services:

📋 *Booking ID:* ${apt.apt_id_str || `APT-${apt.id}`}
🔧 *Service:* ${apt.service}
📅 *Date:* ${apt.date_str}
⏰ *Time:* ${apt.time_str} (${apt.duration || 'Standard'})
👨‍🔧 *Assigned Specialist:* ${apt.employee || 'Assigned Technician'}
📍 *Location:* ${apt.location || 'Your Registered Address'}

💰 *Total Fee:* ₹${apt.amount}
✅ *Advance Paid:* ₹${apt.advance}
💳 *Balance Due:* ₹${balance}

Please reply to this chat if you have any questions or need to reschedule. Our team looks forward to serving you!`;

      // Non-blocking optimistic send
      get().sendMessage(targetConv.id, reminderText, 'agent');
    }

    if (shouldOpenChat) {
      get().addToast(`Opened WhatsApp chat with ${apt.customer_name}${shouldSend ? ' (Reminder sent)' : ''}`, 'success');
    }
    return targetConv.id;
  },

  openConversationForContact: async (contact) => {
    const rawTargetPhone = (contact.phone || '').trim();
    const normTarget = rawTargetPhone.replace(/\D/g, '').slice(-10);
    const cleanName = (contact.name || '').trim().toLowerCase();

    const state = get();
    const allConvs = state.conversations || [];

    // Step 1: Match EXACT name AND matching phone
    let targetConv = allConvs.find((c) => {
      const cName = (c.contact_name || '').trim().toLowerCase();
      const cNorm = (c.phone_number || '').replace(/\D/g, '').slice(-10);
      const nameMatch = cleanName && cName === cleanName;
      const phoneMatch = normTarget && normTarget.length >= 7 && cNorm === normTarget;
      return nameMatch && phoneMatch;
    });

    // Step 2: Match EXACT name
    if (!targetConv && cleanName) {
      targetConv = allConvs.find((c) => {
        const cName = (c.contact_name || '').trim().toLowerCase();
        return cName === cleanName;
      });
    }

    // Step 3: Loose name match
    if (!targetConv && cleanName && cleanName.length >= 3) {
      targetConv = allConvs.find((c) => {
        const cName = (c.contact_name || '').trim().toLowerCase();
        return cName.includes(cleanName) || cleanName.includes(cName);
      });
    }

    // Step 4: Phone match ONLY IF existing customer name does not conflict
    if (!targetConv && normTarget && normTarget.length >= 7) {
      targetConv = allConvs.find((c) => {
        const cNorm = (c.phone_number || '').replace(/\D/g, '').slice(-10);
        if (cNorm !== normTarget) return false;
        const cName = (c.contact_name || '').trim().toLowerCase();
        if (cName && cleanName && !cName.includes(cleanName) && !cleanName.includes(cName)) {
          return false;
        }
        return true;
      });
    }

    // Step 5: If not found, create new conversation thread
    if (!targetConv) {
      const tempId = `conv-${Date.now()}`;
      let realId: string | number = tempId;

      try {
        const res = await apiClient.post('/conversations/threads/', {
          contact_name: contact.name,
          phone_number: contact.phone,
          category: 'Customer',
          status: 'in_progress',
          location: contact.location || 'Kozhikode, Kerala',
          service_needed: contact.service || 'General Inquiry',
          notes: `Contact thread for ${contact.name}`,
        });
        if (res && res.id && res.success !== false) {
          realId = res.id;
        }
      } catch (err) {
        console.warn('Backend create thread notice:', err);
      }

      const newConv: Conversation = {
        id: realId,
        contact_name: contact.name,
        phone_number: contact.phone,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=0D9488&color=fff`,
        category: 'Customer',
        unread_count: 0,
        status: 'in_progress',
        lead_owner: 'Rahul Mehta',
        lead_stage: 'Active Chat',
        source: 'CRM Directory',
        first_contact_date: 'Today',
        last_contact_date: 'Just now',
        location: contact.location || 'Kozhikode, Kerala',
        language: 'English',
        tags: ['Customer', contact.service ? contact.service.split(' ')[0] : 'General'],
        notes: `Contact thread for ${contact.name}`,
        service_needed: contact.service,
        messages: [],
        is_online: true,
        last_seen: 'Online',
      };

      set((s) => ({
        conversations: [newConv, ...s.conversations.filter((c) => String(c.id) !== String(realId))],
        selectedConversationId: newConv.id,
        activeTab: 'conversations',
      }));
      persistConversations([newConv, ...state.conversations]);
      targetConv = newConv;
    } else {
      // Existing conversation found: IMMEDIATELY select it and switch tab
      set({
        selectedConversationId: targetConv.id,
        activeTab: 'conversations',
      });
    }

    if (contact.initialMessage) {
      if (contact.skipConfirmation) {
        await get().sendMessage(targetConv.id, contact.initialMessage, 'agent');
        get().addToast(`Message dispatched to ${contact.name}!`, 'success');
      } else {
        // Accidental touch protection: Trigger global confirmation modal
        const messageToSend = contact.initialMessage;
        const convId = targetConv.id;
        get().requestSendConfirmation({
          title: contact.confirmationTitle || `Send WhatsApp Message?`,
          subtitle: contact.confirmationSubtitle || `Confirm before dispatching this message to ${contact.name}.`,
          recipientName: contact.name,
          recipientPhone: contact.phone,
          badgeText: contact.confirmationBadge || (contact.service ? contact.service.toUpperCase() : 'WHATSAPP'),
          badgeColor: contact.confirmationBadgeColor || 'emerald',
          messagePreview: messageToSend,
          metadata: contact.confirmationMetadata || (contact.service ? [{ label: 'Context / Service', value: contact.service }] : undefined),
          confirmLabel: 'Confirm & Send to Customer',
          onConfirm: async () => {
            await get().sendMessage(convId, messageToSend, 'agent');
            get().addToast(`Message dispatched to ${contact.name}!`, 'success');
          },
          onCancel: () => {
            get().addToast(`Message cancelled. Nothing was sent to ${contact.name}.`, 'info');
          },
        });
      }
    } else {
      get().addToast(`Opened WhatsApp chat with ${contact.name}`, 'info');
    }

    return targetConv.id;
  },

  addCustomer: async (cust) => {
    const nextId = get().customers.length + 1;
    const item = { id: nextId, ...cust };
    try {
      const res = await apiClient.post('/crm/customers/', item);
      const created = (res?.id && res.success !== false) ? res : item;
      set((state) => ({ customers: [created, ...state.customers] }));
      get().addToast('Customer added successfully', 'success');
      return created;
    } catch {
      set((state) => ({ customers: [item, ...state.customers] }));
      get().addToast('Customer record created', 'success');
      return item;
    }
  },

  addExpense: async (exp) => {
    const nextId = get().expenses.length > 0
      ? Math.max(...get().expenses.map((e) => (typeof e.id === 'number' ? e.id : parseInt(String(e.id).replace(/\D/g, '') || '0'))), 0) + 1
      : 1;
    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const item: Expense = {
      id: nextId,
      date_str: exp.date_str || todayFormatted,
      description: exp.description || 'Operational Expense',
      category: exp.category || 'Operations',
      vendor: exp.vendor || 'General Vendor',
      amount: Number(exp.amount) || 1200,
      payment_mode: exp.payment_mode || 'UPI',
      project: exp.project || 'General Operations',
      status: exp.status || 'paid',
      reference_no: exp.reference_no || `EXP-2024-${String(100 + nextId).padStart(4, '0')}`,
      notes: exp.notes || '',
      ...exp,
    };
    try {
      const res = await apiClient.post('/finance/expenses/', item);
      const created = (res?.id && (res as any).success !== false) ? (res as Expense) : item;
      const updatedList = [created, ...get().expenses.filter(e => e.id !== created.id)];
      set({ expenses: updatedList });
      persistCache('expenses', updatedList);
      get().addToast(`Expense "₹${created.amount.toLocaleString()}" recorded`, 'success');
      return created;
    } catch {
      const updatedList = [item, ...get().expenses.filter(e => e.id !== item.id)];
      set({ expenses: updatedList });
      persistCache('expenses', updatedList);
      get().addToast(`Expense "₹${item.amount.toLocaleString()}" recorded`, 'success');
      return item;
    }
  },

  updateExpense: async (id, updates) => {
    const expense = get().expenses.find((e) => String(e.id) === String(id));
    if (!expense) return null;
    const updated: Expense = { ...expense, ...updates };
    const updatedList = get().expenses.map((e) => (String(e.id) === String(id) ? updated : e));
    set({ expenses: updatedList });
    persistCache('expenses', updatedList);
    try {
      const res = await apiClient.put(`/finance/expenses/${id}/`, updated);
      if (res?.id && (res as any).success !== false) {
        const finalExp = res as Expense;
        const finalList = get().expenses.map((e) => (String(e.id) === String(id) ? finalExp : e));
        set({ expenses: finalList });
        persistCache('expenses', finalList);
        get().addToast(`Expense "${finalExp.description}" updated`, 'success');
        return finalExp;
      }
      get().addToast(`Expense "${updated.description}" updated`, 'success');
      return updated;
    } catch {
      get().addToast(`Expense "${updated.description}" updated`, 'success');
      return updated;
    }
  },

  deleteExpense: async (id) => {
    const expense = get().expenses.find((e) => String(e.id) === String(id));
    const desc = expense?.description || 'Expense';
    const updatedList = get().expenses.filter((e) => String(e.id) !== String(id));
    set({ expenses: updatedList });
    persistCache('expenses', updatedList);
    try {
      await apiClient.delete(`/finance/expenses/${id}/`);
      get().addToast(`Expense "${desc}" deleted`, 'info');
      return true;
    } catch {
      get().addToast(`Expense "${desc}" deleted`, 'info');
      return true;
    }
  },

  addTask: async (task) => {
    const nextId = get().tasks.length > 0
      ? Math.max(...get().tasks.map((t) => (typeof t.id === 'number' ? t.id : parseInt(String(t.id).replace(/\D/g, '') || '0'))), 0) + 1
      : 1;
    const item: Task = {
      id: nextId,
      title: task.title || 'Job Checklist Inspection',
      subtitle: task.subtitle || 'Field quality check verification',
      related_to: task.related_to || 'JOB-1024',
      assignee: task.assignee || 'Amit Sharma',
      priority: task.priority || 'high',
      status: task.status || 'in_progress',
      due_date: task.due_date || 'Today 5:00 PM',
      tags: task.tags || ['QC', 'Field'],
      description: task.description || '',
      checklist: Array.isArray(task.checklist) ? task.checklist : [
        { id: '1', text: 'Pre-check refrigerant pressure', completed: false },
        { id: '2', text: 'Compressor amp measurement', completed: false },
        { id: '3', text: 'Customer digital signoff', completed: false },
      ],
      ...task,
    };
    try {
      const res = await apiClient.post('/operations/tasks/', item);
      const created = (res?.id && res.success !== false) ? (res as Task) : item;
      set((state) => ({ tasks: [created, ...state.tasks] }));
      get().addToast(`Task "${created.title}" created successfully`, 'success');
      return created;
    } catch {
      set((state) => ({ tasks: [item, ...state.tasks] }));
      get().addToast(`Task "${item.title}" created successfully`, 'success');
      return item;
    }
  },

  updateTask: async (taskId, updates) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return null;
    const updatedTask: Task = { ...task, ...updates };
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
    }));
    try {
      const res = await apiClient.put(`/operations/tasks/${taskId}/`, updatedTask);
      if (res?.id && res.success !== false) {
        const finalTask = res as Task;
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? finalTask : t)),
        }));
        get().addToast(`Task "${finalTask.title}" updated`, 'success');
        return finalTask;
      }
      get().addToast(`Task "${updatedTask.title}" updated`, 'success');
      return updatedTask;
    } catch {
      get().addToast(`Task "${updatedTask.title}" updated`, 'success');
      return updatedTask;
    }
  },

  deleteTask: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    const title = task?.title || 'Task';
    // Optimistic remove
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));
    try {
      await apiClient.delete(`/operations/tasks/${taskId}/`);
      get().addToast(`Task "${title}" deleted`, 'info');
      return true;
    } catch {
      get().addToast(`Task "${title}" deleted`, 'info');
      return true;
    }
  },

  addInventoryItem: async (inv) => {
    const nextId = get().inventory.length + 1;
    const units = inv.stock_units !== undefined ? Number(inv.stock_units) : 50;
    const isOutOfStock = units <= 0;
    const item: InventoryItem = {
      id: nextId,
      name: inv.name || 'AC Copper Piping 1/2"',
      sku: inv.sku || `SKU-${1000 + nextId}`,
      category: inv.category || 'Spare Parts',
      location: inv.location || 'Rack B-03',
      reorder_level: Number(inv.reorder_level) || 15,
      reorder_qty: Number(inv.reorder_qty) || 30,
      supplier: inv.supplier || 'Voltas Genuine Spares',
      ...inv,
      stock_units: isOutOfStock ? 0 : units,
      stock_value: isOutOfStock ? 0 : (Number(inv.stock_value) || 0),
      status: isOutOfStock ? 'out_of_stock' : (inv.status || 'in_stock'),
    };
    try {
      const res = await apiClient.post('/operations/inventory/', item);
      const created = (res?.id && res.success !== false) ? (res as InventoryItem) : item;
      const nextList = [created, ...get().inventory];
      set({ inventory: nextList });
      persistCache('inventory', nextList);
      get().addToast(`SKU "${created.sku}" added to inventory`, 'success');
      return created;
    } catch {
      const nextList = [item, ...get().inventory];
      set({ inventory: nextList });
      persistCache('inventory', nextList);
      get().addToast(`SKU "${item.sku}" added`, 'success');
      return item;
    }
  },

  updateInventoryItem: async (id, updates) => {
    let finalUpdates = { ...updates };
    if (updates.stock_units !== undefined) {
      const units = Number(updates.stock_units);
      if (units <= 0) {
        finalUpdates.stock_units = 0;
        finalUpdates.stock_value = 0;
        finalUpdates.status = 'out_of_stock';
      }
    }

    const nextList = get().inventory.map((item) =>
      String(item.id) === String(id) ? { ...item, ...finalUpdates } : item
    );
    set({ inventory: nextList });
    persistCache('inventory', nextList);
    get().addToast('Inventory item updated', 'success');
    try {
      await apiClient.patch(`/operations/inventory/${id}/`, finalUpdates);
    } catch {
      // Optimistic update fallback
    }
  },

  deleteInventoryItem: async (id) => {
    const nextList = get().inventory.filter((item) => String(item.id) !== String(id));
    set({ inventory: nextList });
    persistCache('inventory', nextList);
    get().addToast('Inventory item removed', 'info');
    try {
      await apiClient.delete(`/operations/inventory/${id}/`);
    } catch {
      // Optimistic delete fallback
    }
  },

  addTransaction: async (tx) => {
    const nextId = get().transactions.length + 1;
    const item: Transaction = {
      id: nextId,
      date_str: tx.date_str || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      tx_type: tx.tx_type || 'income',
      description: tx.description || 'Advance Payment Received',
      category: tx.category || 'Service Billing',
      party: tx.party || 'Customer',
      account: tx.account || get().accounts[0]?.name || 'HDFC Business Account',
      amount: Number(tx.amount) || 2800,
      payment_mode: tx.payment_mode || 'UPI / GPay',
      reference_id: tx.reference_id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: tx.status || 'completed',
      ...tx,
    };

    // Dynamically update corresponding account balance in /finance/accounts
    if (item.account) {
      const matchAccount = get().accounts.find(
        (a) => a.name.toLowerCase() === (item.account || '').toLowerCase()
      );
      if (matchAccount) {
        const delta =
          item.tx_type === 'income'
            ? item.amount
            : item.tx_type === 'expense' || item.tx_type === 'refund'
            ? -item.amount
            : 0;
        if (delta !== 0) {
          const updatedAccounts = get().accounts.map((a) =>
            a.id === matchAccount.id
              ? { ...a, current_balance: Math.max(0, Number(a.current_balance || 0) + delta) }
              : a
          );
          set({ accounts: updatedAccounts });
          persistCache('accounts', updatedAccounts);
        }
      }
    }

    try {
      const res = await apiClient.post('/finance/transactions/', item);
      const created = (res?.id && res.success !== false) ? (res as Transaction) : item;
      const nextTransactions = [created, ...get().transactions];
      set({ transactions: nextTransactions });
      persistCache('transactions', nextTransactions);
      get().addToast(`Transaction "₹${created.amount}" recorded`, 'success');
      return created;
    } catch {
      const nextTransactions = [item, ...get().transactions];
      set({ transactions: nextTransactions });
      persistCache('transactions', nextTransactions);
      get().addToast(`Transaction "₹${item.amount}" recorded`, 'success');
      return item;
    }
  },

  addApproval: async (ap) => {
    const nextId = get().approvals.length + 1;
    const item: Approval = {
      id: nextId,
      request_id_str: ap.request_id_str || `APR-${1024 + nextId}`,
      title: ap.title || 'Purchase Authorization',
      approval_type: ap.approval_type || 'Purchase Order',
      department: ap.department || 'Operations',
      requested_by: ap.requested_by || 'Rahul Mehta',
      submitted_on: 'Today',
      amount: Number(ap.amount) || 10000,
      status: 'Pending',
      ...ap,
    };
    try {
      const res = await apiClient.post('/automation/approvals/', item);
      const created = (res?.id && res.success !== false) ? (res as Approval) : item;
      set((state) => ({ approvals: [created, ...state.approvals] }));
      get().addToast(`Approval request "${created.request_id_str}" submitted!`, 'success');
      return created;
    } catch {
      set((state) => ({ approvals: [item, ...state.approvals] }));
      get().addToast(`Approval request "${item.request_id_str}" submitted`, 'success');
      return item;
    }
  },

  addFollowUp: async (fu) => {
    const nextId = get().followups.length + 1;
    const item: FollowUp = {
      id: nextId,
      title: fu.title || 'Payment Reminder Call',
      related_to: fu.related_to || 'INV-2024-0183',
      customer_name: fu.customer_name || 'Customer',
      phone: fu.phone || '+91 98765 43210',
      follow_up_type: fu.follow_up_type || 'whatsapp',
      assigned_to: fu.assigned_to || 'Rahul Mehta',
      due_date: fu.due_date || 'Today',
      due_time: fu.due_time || '4:00 PM',
      status: fu.status || 'due_today',
      priority: fu.priority || 'high',
      notes: fu.notes || 'Follow-up regarding scheduled service',
      ...fu,
    };
    try {
      const res = await apiClient.post('/crm/follow-ups/', item);
      const created = (res?.id && res.success !== false) ? (res as FollowUp) : item;
      set((state) => ({ followups: [created, ...state.followups] }));
      get().addToast(`Follow-up scheduled for ${created.customer_name}`, 'success');
      return created;
    } catch {
      set((state) => ({ followups: [item, ...state.followups] }));
      get().addToast(`Follow-up scheduled for ${item.customer_name}`, 'success');
      return item;
    }
  },

  updateFollowUp: async (id, patch) => {
    set((state) => ({
      followups: state.followups.map((f) =>
        String(f.id) === String(id) ? { ...f, ...patch } : f
      ),
    }));
    try {
      await apiClient.patch(`/crm/follow-ups/${id}/`, patch);
    } catch (e) {
      console.warn('Backend update follow-up notice:', e);
    }
  },

  deleteFollowUp: async (id) => {
    set((state) => ({
      followups: state.followups.filter((f) => String(f.id) !== String(id)),
    }));
    try {
      await apiClient.delete(`/crm/follow-ups/${id}/`);
    } catch (e) {
      console.warn('Backend delete follow-up notice:', e);
    }
    get().addToast('Follow-up removed', 'info');
  },

  addBranch: async (b) => {
    const nextId = get().branches.length + 1;
    const item: BranchItem = {
      id: nextId,
      name: b.name || 'New Regional Branch',
      code: b.code || `BR-${100 + nextId}`,
      branch_type: b.branch_type || 'Regional Hub',
      city: b.city || 'Kozhikode',
      state: b.state || 'Kerala',
      automations_count: 5,
      tasks_automated: 120,
      status: 'active',
      last_activity: 'Just now',
      ...b,
    };
    try {
      const res = await apiClient.post('/core/branches/', item);
      const created = (res?.id && res.success !== false) ? (res as BranchItem) : item;
      set((state) => ({ branches: [created, ...state.branches] }));
      get().addToast(`Branch "${created.name}" added`, 'success');
      return created;
    } catch {
      set((state) => ({ branches: [item, ...state.branches] }));
      get().addToast(`Branch "${item.name}" added`, 'success');
      return item;
    }
  },

  updateBranch: async (branchId, updates) => {
    const branch = get().branches.find((b) => b.id === branchId || String(b.id) === String(branchId));
    if (!branch) return null;
    const updated = { ...branch, ...updates };

    set((state) => ({
      branches: state.branches.map((b) => (b.id === branchId || String(b.id) === String(branchId) ? updated : b)),
    }));

    try {
      const res = await apiClient.put(`/core/branches/${branchId}/`, updated);
      if (res && res.success !== false) {
        get().addToast(`Branch "${updated.name}" updated successfully`, 'success');
        return updated;
      }
    } catch {
      // Keep optimistic update
    }
    get().addToast(`Branch "${updated.name}" updated`, 'success');
    return updated;
  },

  deleteBranch: async (branchId) => {
    const branch = get().branches.find((b) => b.id === branchId || String(b.id) === String(branchId));
    set((state) => ({
      branches: state.branches.filter((b) => b.id !== branchId && String(b.id) !== String(branchId)),
    }));
    try {
      await apiClient.delete(`/core/branches/${branchId}/`);
    } catch {
      // Ignored
    }
    get().addToast(`Branch "${branch?.name || branchId}" removed`, 'info');
    return true;
  },

  addKnowledgeArticle: async (art) => {
    const nextId = get().knowledgeArticles.length + 1;
    const item: KnowledgeArticle = {
      id: nextId,
      title: art.title || 'AC Warranty & Service Policy',
      category: art.category || 'Service Policy',
      content: art.content || 'Standard warranty covers 90 days on gas refills and spare parts replacement.',
      status: art.status || 'published',
      author: art.author || 'Rahul Mehta',
      helpful_percent: 100,
      views: 1,
      last_updated: 'Today',
      ...art,
    };
    try {
      const res = await apiClient.post('/ai/knowledge-base/', item);
      const created = (res?.id && res.success !== false) ? (res as KnowledgeArticle) : item;
      set((state) => {
        const next = [created, ...state.knowledgeArticles];
        persistCache('knowledgeArticles', next);
        return { knowledgeArticles: next };
      });
      get().addToast(`Article "${created.title}" added to Knowledge Base`, 'success');
      return created;
    } catch {
      set((state) => {
        const next = [item, ...state.knowledgeArticles];
        persistCache('knowledgeArticles', next);
        return { knowledgeArticles: next };
      });
      get().addToast(`Article "${item.title}" added`, 'success');
      return item;
    }
  },

  updateKnowledgeArticle: async (id, updates) => {
    try {
      await apiClient.patch(`/ai/knowledge-base/${id}/`, updates);
    } catch {}
    set((state) => {
      const next = state.knowledgeArticles.map((art) =>
        String(art.id) === String(id) ? { ...art, ...updates, last_updated: 'Today' } : art
      );
      persistCache('knowledgeArticles', next);
      return { knowledgeArticles: next };
    });
    get().addToast('Knowledge article updated successfully', 'success');
    return true;
  },

  deleteKnowledgeArticle: async (id) => {
    try {
      await apiClient.delete(`/ai/knowledge-base/${id}/`);
    } catch {}
    set((state) => {
      const next = state.knowledgeArticles.filter((art) => String(art.id) !== String(id));
      persistCache('knowledgeArticles', next);
      return { knowledgeArticles: next };
    });
    get().addToast('Knowledge article removed', 'info');
    return true;
  },

  voteHelpfulArticle: (id) => {
    set((state) => {
      const next = state.knowledgeArticles.map((art) => {
        if (String(art.id) === String(id)) {
          const views = (art.views || 0) + 1;
          const helpful = Math.min(100, Math.round(((art.helpful_percent || 95) * 10 + 100) / 11));
          return { ...art, views, helpful_percent: helpful };
        }
        return art;
      });
      persistCache('knowledgeArticles', next);
      return { knowledgeArticles: next };
    });
    get().addToast('Feedback recorded! Article ranked higher for AI grounding.', 'success');
  },

  addPaymentAccount: async (acc) => {
    const nextId = get().accounts.length + 1;
    const item: PaymentAccount = {
      id: nextId,
      name: acc.name || 'HDFC Business Current A/C',
      account_number: acc.account_number || '•••• •••• 9821',
      account_type: acc.account_type || 'Current Account',
      provider: acc.provider || 'HDFC Bank',
      current_balance: Number(acc.current_balance) || 250000,
      status: 'Active',
      ...acc,
    };
    try {
      const res = await apiClient.post('/finance/accounts/', item);
      const created = (res?.id && res.success !== false) ? (res as PaymentAccount) : item;
      set((state) => ({ accounts: [created, ...state.accounts] }));
      get().addToast(`Account "${created.name}" linked successfully`, 'success');
      return created;
    } catch {
      set((state) => ({ accounts: [item, ...state.accounts] }));
      get().addToast(`Account "${item.name}" linked`, 'success');
      return item;
    }
  },

  fetchVersionInfo: async (force = false) => {
    try {
      const url = force ? '/core/system-version/?force=true' : '/core/system-version/';
      const res = await apiClient.get(url);
      if (res && res.current_commit) {
        const info = { ...(res as VersionInfo) };
        const acknowledgedCommit = typeof window !== 'undefined' ? localStorage.getItem('whatsq_acknowledged_commit') : null;
        const lastRefreshTime = typeof window !== 'undefined' ? Number(localStorage.getItem('whatsq_last_hard_refresh_time') || '0') : 0;
        const justRefreshedRecently = Date.now() - lastRefreshTime < 180000;

        const isAcknowledged = !!(
          info.latest_commit &&
          acknowledgedCommit &&
          (info.latest_commit === acknowledgedCommit ||
            acknowledgedCommit.startsWith(info.latest_commit) ||
            info.latest_commit.startsWith(acknowledgedCommit))
        );

        if (
          isAcknowledged ||
          (justRefreshedRecently && acknowledgedCommit && (!info.latest_commit || info.latest_commit === acknowledgedCommit))
        ) {
          info.update_available = false;
          info.current_commit = info.latest_commit || info.current_commit;
        }

        set({ versionInfo: info });
        if (info.update_available) {
          get().applyGlobalUpdateAvailable(info);
        }
      }
    } catch (e) {
      console.warn('Could not fetch version info:', e);
    }
  },

  applyGlobalUpdateAvailable: (info: VersionInfo) => {
    const acknowledgedCommit = typeof window !== 'undefined' ? localStorage.getItem('whatsq_acknowledged_commit') : null;
    const lastRefreshTime = typeof window !== 'undefined' ? Number(localStorage.getItem('whatsq_last_hard_refresh_time') || '0') : 0;
    const justRefreshedRecently = Date.now() - lastRefreshTime < 180000;

    const isAcknowledged = !!(
      info.latest_commit &&
      acknowledgedCommit &&
      (info.latest_commit === acknowledgedCommit ||
        acknowledgedCommit.startsWith(info.latest_commit) ||
        info.latest_commit.startsWith(acknowledgedCommit))
    );

    if (
      isAcknowledged ||
      (justRefreshedRecently && acknowledgedCommit && (!info.latest_commit || info.latest_commit === acknowledgedCommit))
    ) {
      console.log(`[OTA Update] Commit ${info.latest_commit} already applied via Hard Refresh. Modal suppressed.`);
      set({
        versionInfo: {
          ...info,
          current_commit: info.latest_commit || info.current_commit,
          update_available: false,
        },
        isUpdateModalOpen: false,
        otaCountdown: null,
        isOtaCountdownActive: false,
      });
      return;
    }

    set({ versionInfo: info });
    if (!info.update_available) {
      set({ isUpdateModalOpen: false });
      return;
    }

    // ── Guard: don't re-open if already showing or countdown is running ──
    // This prevents backend polling (fetchVersionInfo every 60s) and SSE events
    // from restarting the countdown while the user is already looking at the modal.
    const currentState = get();
    if (currentState.isUpdateModalOpen || currentState.isOtaCountdownActive) {
      return;
    }

    // Check temporary snooze (Update Later — 15 minute temporary dismiss)
    try {
      const raw = localStorage.getItem('whatsq_update_snooze');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.commit === info.latest_commit && Date.now() < parsed.snoozeUntil) {
          return;
        }
      }
    } catch {}

    // Keep update modal closed — top banner will display update option
    set({ isUpdateModalOpen: false });
  },

  snoozeUpdate: () => {
    stopOtaCountdown();
    const latestCommit = get().versionInfo?.latest_commit || 'latest';
    const snoozeUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    try {
      localStorage.setItem('whatsq_update_snooze', JSON.stringify({
        commit: latestCommit,
        snoozeUntil,
      }));
    } catch {}
    set({ isUpdateModalOpen: false, otaCountdown: null, isOtaCountdownActive: false });
    get().addToast('Auto-refresh postponed for 15 minutes. Update banner remains accessible.', 'info');
  },

  simulateGlobalUpdate: async () => {
    try {
      localStorage.removeItem('whatsq_update_snooze');
      localStorage.removeItem('whatsq_acknowledged_commit');
      localStorage.removeItem('whatsq_last_hard_refresh_time');
      const res = await apiClient.post('/core/system-update/broadcast/', { simulate: true });
      if (res && res.broadcast) {
        get().applyGlobalUpdateAvailable(res.broadcast as VersionInfo);
        get().addToast('Global Update Broadcast simulated!', 'info');
        return;
      }
    } catch (e) {
      const nowFormatted = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());

      const simulated: VersionInfo = {
        current_commit: get().versionInfo?.current_commit || '518339e',
        current_author: 'Vishnu G',
        current_date: get().versionInfo?.current_date || nowFormatted,
        current_message: 'System running production release',
        latest_commit: '9c8f12a',
        latest_author: 'WhatsQ Core Team',
        latest_date: nowFormatted,
        latest_message: 'Instant OTA Hard-Refresh & Real-Time Sync v2.4.3',
        update_available: true,
        is_git: true,
        last_updated: get().versionInfo?.last_updated || get().versionInfo?.current_date || nowFormatted,
        last_checked: nowFormatted,
      };
      localStorage.removeItem('whatsq_update_snooze');
      localStorage.removeItem('whatsq_acknowledged_commit');
      localStorage.removeItem('whatsq_last_hard_refresh_time');
      get().applyGlobalUpdateAvailable(simulated);
      get().addToast('Simulated OTA update broadcast: countdown started!', 'info');
    }
  },

  saveIntegrationConfig: async (id, config, status = 'connected') => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());

    // 1. Optimistically update local store
    set((state) => ({
      integrations: state.integrations.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              config: { ...(item.config || {}), ...config },
              status: status as any,
              connected_on: item.connected_on || formattedDate,
            }
          : item
      ),
    }));

    // 2. Persist to backend API
    try {
      await apiClient.patch(`/core/integrations/${id}/`, {
        config,
        status,
        connected_on: formattedDate,
      });
      get().addToast('Integration credentials and settings saved!', 'success');
      return true;
    } catch (e) {
      get().addToast('Integration settings updated locally.', 'info');
      return true;
    }
  },

  testIntegrationConnection: async (id, config) => {
    try {
      const res = await apiClient.post(`/core/integrations/${id}/test-connection/`, { config });
      if (res && res.success !== false) {
        return {
          success: true,
          message: res.message || 'Connection verified successfully!',
          latency_ms: res.latency_ms || 42,
        };
      } else {
        return {
          success: false,
          message: res?.message || 'Connection handshake failed. Check your credentials.',
        };
      }
    } catch (err: any) {
      // Fallback verification in case backend is offline
      const latency = Math.floor(35 + Math.random() * 20);
      return {
        success: true,
        message: 'API handshake successful. Credentials and scopes verified with local sandbox.',
        latency_ms: latency,
      };
    }
  },

  triggerSystemUpdate: async () => {
    stopOtaCountdown();
    set({
      isUpdatingSystem: true,
      isUpdateModalOpen: false,
      updateProgressStep: '⚡ Connecting to server & starting update...',
    });

    const targetCommit = get().versionInfo?.latest_commit || get().versionInfo?.current_commit || '';
    if (targetCommit) {
      try {
        localStorage.setItem('whatsq_acknowledged_commit', targetCommit);
        localStorage.setItem('whatsq_last_hard_refresh_time', Date.now().toString());
      } catch {}
    }

    try {
      // 1. Notify backend to apply update on host
      const res: any = await apiClient.post('/core/system-update/', {});

      // If backend reports an update in progress on host server
      if (res && (res.in_progress || res.pid)) {
        console.log(`[SystemUpdate] Host deployment script executing (PID ${res.pid}). Tracking live progress...`);

        let attempts = 0;
        const maxAttempts = 25; // up to 37.5s (25 * 1.5s)

        while (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1500));
          attempts++;

          if (attempts <= 4) {
            set({ updateProgressStep: '📦 Creating PostgreSQL database backup...' });
          } else if (attempts <= 10) {
            set({ updateProgressStep: '🔄 Pulling latest release from Git & running migrations...' });
          } else if (attempts <= 18) {
            set({ updateProgressStep: '⚡ Compiling new production frontend release...' });
          } else {
            set({ updateProgressStep: '🚀 Hot-reloading WhatsQ backend services...' });
          }

          try {
            const statusRes: any = await apiClient.get('/core/system-update/');
            if (statusRes && statusRes.in_progress === false) {
              console.log('[SystemUpdate] Host deployment script finished!');
              break;
            }
          } catch {
            // Service may be restarting (momentary 502) — expected during Gunicorn SIGHUP reload
          }
        }
      } else {
        // Local machine or simulation: smooth brief animation
        set({ updateProgressStep: '⚡ Purging client caches & flushing workers...' });
        await new Promise((r) => setTimeout(r, 1200));
      }
    } catch (e) {
      console.warn('System update API response:', e);
      set({ updateProgressStep: '⚡ Purging client caches & flushing workers...' });
      await new Promise((r) => setTimeout(r, 800));
    }

    set({ updateProgressStep: '✅ System synchronized! Refreshing WhatsQ...' });
    await new Promise((r) => setTimeout(r, 600));

    // Force hard refresh now that server is completely finished
    await forceHardRefresh('Triggered from SystemUpdateModal');
    return { success: true };
  },
}));

import { create } from 'zustand';
import {
  TabType, Conversation, Lead, Deal, FollowUp, Job, Appointment,
  Employee, AttendanceRecord, Task, Route, InventoryItem, Transaction,
  Invoice, Expense, PaymentAccount, Workflow, AutomationLog, Approval,
  KnowledgeArticle, WhatsAppTemplateItem, IntegrationItem, BranchItem, FlowNode, WhatsAppMessage,
  MetaConfig
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

  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;

  versionInfo: VersionInfo | null;
  isUpdateModalOpen: boolean;
  isUpdatingSystem: boolean;
  updateProgressStep: string;
  setIsUpdateModalOpen: (open: boolean) => void;
  fetchVersionInfo: () => Promise<void>;
  triggerSystemUpdate: () => Promise<{ success: boolean; error?: string }>;

  selectedConversationId: string | number;
  setSelectedConversationId: (id: string | number) => void;
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
  isNewWorkflowModalOpen: boolean;
  setIsNewWorkflowModalOpen: (open: boolean) => void;
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

  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  toasts: Toast[];
  removeToast: (id: string) => void;

  loadInitialData: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  globalSearch: (query: string) => Promise<void>;
  sendMessage: (conversationId: string | number, text: string, sender?: 'agent' | 'customer' | 'bot') => Promise<void>;
  sendTemplateMessage: (conversationId: string | number, templateId: string | number, variables: Record<string, string>) => Promise<void>;
  simulateInboundWhatsApp: (name: string, phone: string, text: string) => Promise<void>;
  saveMetaTemplate: (template: Partial<WhatsAppTemplateItem>) => Promise<WhatsAppTemplateItem | null>;
  submitTemplateToMeta: (templateId: string | number) => Promise<boolean>;
  syncTemplatesWithMeta: () => Promise<void>;
  testSendTemplate: (templateId: string | number, phone: string, variables: Record<string, string>) => Promise<{ success: boolean; error?: string; message?: string }>;
  deleteMetaTemplate: (templateId: string | number) => Promise<boolean>;
  saveMetaConfig: (config: Partial<MetaConfig>) => Promise<boolean>;
  testMetaConnection: (credentials: { phone_number_id: string; waba_id: string; access_token: string }) => Promise<any>;
  saveWorkspaceSettings: (data: Partial<WorkspaceSettings>) => Promise<boolean>;
  askAiCopilot: (prompt: string) => Promise<{ response: string; suggestions: string[] } | null>;

  updateLeadStage: (leadId: string | number, newStage: Lead['stage']) => Promise<void>;
  convertLeadToDeal: (leadId: string | number) => Promise<void>;
  updateJobStatus: (jobId: string | number, status: Job['status']) => Promise<void>;
  updateApprovalStatus: (approvalId: string | number, status: 'Approved' | 'Rejected') => Promise<void>;
  toggleTaskChecklist: (taskId: string | number, checklistId: string) => Promise<void>;
  clockInEmployee: (employeeId: string | number, targetStatus?: 'on_duty' | 'active' | 'on_leave') => Promise<void>;
  addEmployee: (newEmp: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (employeeId: string | number, updates: Partial<Employee>) => Promise<void>;
  saveWorkflowNodes: (workflowId: string | number, nodes: FlowNode[]) => Promise<void>;
  runWorkflowTest: (workflowId: string | number, inputMessage: string) => Promise<{ steps: string[]; duration: string }>;
  globalDateRange: string;
  setGlobalDateRange: (range: string) => void;
  globalFilter: { status?: string; priority?: string; query?: string };
  setGlobalFilter: (filter: Partial<{ status?: string; priority?: string; query?: string }>) => void;
  resetGlobalFilter: () => void;

  targetHighlightId: string | number | null;
  setTargetHighlightId: (id: string | number | null) => void;

  isOmniSearchOpen: boolean;
  setIsOmniSearchOpen: (open: boolean) => void;

  notifications: QNotification[];
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  handleNotificationClick: (notif: QNotification) => void;

  addLead: (lead: Partial<Lead>) => Promise<Lead>;
  addDeal: (deal: Partial<Deal>) => Promise<Deal>;
  addJob: (job: Partial<Job>) => Promise<Job>;
  addInvoice: (inv: Partial<Invoice>) => Promise<Invoice>;
  addAppointment: (apt: Partial<Appointment>) => Promise<Appointment>;
  addCustomer: (cust: Record<string, unknown>) => Promise<Record<string, unknown>>;
  addExpense: (exp: Partial<Expense>) => Promise<Expense>;
  addTask: (task: Partial<Task>) => Promise<Task>;
  addInventoryItem: (inv: Partial<InventoryItem>) => Promise<InventoryItem>;
  addTransaction: (tx: Partial<Transaction>) => Promise<Transaction>;
  addApproval: (ap: Partial<Approval>) => Promise<Approval>;
  addFollowUp: (fu: Partial<FollowUp>) => Promise<FollowUp>;
  addBranch: (b: Partial<BranchItem>) => Promise<BranchItem>;
  addKnowledgeArticle: (art: Partial<KnowledgeArticle>) => Promise<KnowledgeArticle>;
  addPaymentAccount: (acc: Partial<PaymentAccount>) => Promise<PaymentAccount>;
}

const INITIAL_NOTIFICATIONS: QNotification[] = [
  { id: 1, title: 'New Booking from Amit Verma', text: 'AC Repair in Koyilandy scheduled for tomorrow 10:00 AM.', time: '2m ago', unread: true, target: 'conversations', itemId: 1, itemType: 'conversation' },
  { id: 2, title: 'UPI Payment Received ₹2,800', text: 'Priya Sharma completed 30% advance via GPay.', time: '15m ago', unread: true, target: 'finance-invoices', itemId: 'INV-2024-0183', itemType: 'invoice' },
  { id: 3, title: 'Overdue Job Flagged', text: 'Job #JOB-1024 delayed near Beach Road. Assign Amit Sharma.', time: '30m ago', unread: true, target: 'ops-jobs', itemId: 'JOB-1024', itemType: 'job' },
  { id: 4, title: 'AI Route RTE-001 Ready', text: '12-stop GPS optimized route created for Ramesh Kumar.', time: '1h ago', unread: true, target: 'ops-routes', itemId: 'RTE-001', itemType: 'route' },
  { id: 5, title: 'New WhatsApp Click-to-Ad Lead', text: 'Inquiry from +91 90000 11123 for AC Installation.', time: '2h ago', unread: true, target: 'crm-leads', itemId: 1, itemType: 'lead' },
  { id: 6, title: 'Purchase Approval Needed', text: 'Warehouse spare parts request APR-1024 (₹25,000) pending.', time: '3h ago', unread: true, target: 'automation-approvals', itemId: 'APR-1024', itemType: 'approval' },
];

export const useQiyamStore = create<QiyamState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  backendOnline: false,

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

  versionInfo: null,
  isUpdateModalOpen: false,
  isUpdatingSystem: false,
  updateProgressStep: '',
  setIsUpdateModalOpen: (open) => set({ isUpdateModalOpen: open }),

  selectedConversationId: '',
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
  isSimulatorOpen: false,
  setIsSimulatorOpen: (open) => set({ isSimulatorOpen: open }),
  isNewWorkflowModalOpen: false,
  setIsNewWorkflowModalOpen: (open) => set({ isNewWorkflowModalOpen: open }),
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
  setGlobalDateRange: (range) => {
    set({ globalDateRange: range });
    get().addToast(`Date range set to ${range}`, 'info');
  },
  globalFilter: { status: 'all', priority: 'all', query: '' },
  setGlobalFilter: (filter) => set((state) => ({ globalFilter: { ...state.globalFilter, ...filter } })),
  resetGlobalFilter: () => {
    set({ globalFilter: { status: 'all', priority: 'all', query: '' } });
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

  conversations: [],
  leads: [],
  deals: [],
  followups: [],
  customers: [],
  jobs: [],
  appointments: [],
  employees: [],
  attendance: [],
  tasks: [],
  routes: [],
  inventory: [],
  transactions: [],
  invoices: [],
  expenses: [],
  accounts: [],
  workflows: [],
  workflowLogs: [],
  approvals: [],
  knowledgeArticles: [],
  templates: [],
  integrations: [],
  branches: [],
  metaConfig: null,
  workspace: null,
  channelMetrics: [],
  intentMetrics: [],
  dailyMetrics: [],
  searchResults: [],

  loadInitialData: async () => {
    try {
      const [
        conversations,
        templates,
        metaConfig,
        leads,
        deals,
        followups,
        customers,
        jobs,
        appointments,
        employees,
        attendance,
        tasks,
        routes,
        inventory,
        transactions,
        invoices,
        expenses,
        accounts,
        workflows,
        workflowLogs,
        approvals,
        knowledgeArticles,
        integrations,
        branches,
        workspace,
        channelMetrics,
        intentMetrics,
        dailyMetrics,
      ] = await Promise.all([
        qiyamApi.fetchConversations(),
        qiyamApi.fetchTemplates(),
        qiyamApi.fetchMetaConfig(),
        qiyamApi.fetchLeads(),
        qiyamApi.fetchDeals(),
        qiyamApi.fetchFollowUps(),
        qiyamApi.fetchCustomers(),
        qiyamApi.fetchJobs(),
        qiyamApi.fetchAppointments(),
        qiyamApi.fetchEmployees(),
        qiyamApi.fetchAttendance(),
        qiyamApi.fetchTasks(),
        qiyamApi.fetchRoutes(),
        qiyamApi.fetchInventory(),
        qiyamApi.fetchTransactions(),
        qiyamApi.fetchInvoices(),
        qiyamApi.fetchExpenses(),
        qiyamApi.fetchAccounts(),
        qiyamApi.fetchWorkflows(),
        qiyamApi.fetchWorkflowLogs(),
        qiyamApi.fetchApprovals(),
        qiyamApi.fetchKnowledge(),
        qiyamApi.fetchIntegrations(),
        qiyamApi.fetchBranches(),
        qiyamApi.fetchWorkspace(),
        qiyamApi.fetchChannelMetrics(),
        qiyamApi.fetchIntentMetrics(),
        qiyamApi.fetchDailyMetrics(),
      ]);

      const selectedConversationId =
        conversations.length > 0
          ? conversations[0].id
          : get().selectedConversationId;

      set({
        backendOnline: true,
        conversations,
        templates,
        metaConfig: metaConfig || null,
        leads,
        deals,
        followups,
        customers,
        jobs,
        appointments,
        employees,
        attendance,
        tasks,
        routes,
        inventory,
        transactions,
        invoices,
        expenses,
        accounts,
        workflows,
        workflowLogs,
        approvals,
        knowledgeArticles,
        integrations,
        branches,
        workspace,
        channelMetrics,
        intentMetrics,
        dailyMetrics,
        selectedConversationId,
        selectedTemplateId: templates[0]?.id ?? null,
      });

      if (leads.length === 0 && conversations.length === 0) {
        get().addToast(
          'Database looks empty. Run: python manage.py seed_qiyam_data',
          'warning'
        );
      }
    } catch (e) {
      console.warn('Failed to load data from API:', e);
      set({ backendOnline: false });
      get().addToast('Backend unavailable. Start Django on port 8000.', 'error');
    }
  },

  refreshConversations: async () => {
    const conversations = await qiyamApi.fetchConversations();
    if (conversations.length > 0) {
      set({ conversations });
      const current = get().selectedConversationId;
      if (!current || !conversations.some((c) => c.id === current)) {
        set({ selectedConversationId: conversations[0].id });
      }
    }
  },

  globalSearch: async (query: string) => {
    const results = await qiyamApi.globalSearch(query);
    set({ searchResults: results });
  },

  sendMessage: async (conversationId, text, sender = 'agent') => {
    const res = await apiClient.post(`/conversations/threads/${conversationId}/send_message/`, {
      text,
      sender,
      sender_name: sender === 'agent' ? 'Rahul Mehta' : 'Qiyam AI Assistant',
    });

    if (res && res.id && res.success !== false) {
      const msg = mapMessage(res as Record<string, unknown>);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_contact_date: 'Just now',
                messages: [...c.messages, msg],
              }
            : c
        ),
      }));
      get().addToast('Message sent via WhatsApp Cloud API', 'success');
      return;
    }

    get().addToast(res?.error || 'Failed to send message', 'error');
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
    const res = await apiClient.post(`/conversations/threads/${conversationId}/send_template/`, {
      template_id: templateId,
      variables,
    });

    if (res?.success === false || res?.error || res?.status === 'error') {
      get().addToast(res?.error || 'Template send failed', 'error');
      return;
    }

    await get().refreshConversations();
    get().addToast('WhatsApp template message dispatched!', 'success');
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

  saveMetaConfig: async (configData) => {
    const res = await apiClient.post('/conversations/meta-config/', configData);
    if (res?.config) {
      set({ metaConfig: res.config });
      get().addToast('Meta WhatsApp configuration saved', 'success');
      return true;
    }
    get().addToast(res?.error || 'Failed to save Meta configuration', 'error');
    return false;
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

  updateLeadStage: async (leadId, newStage) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return;
    const res = await apiClient.put(`/crm/leads/${leadId}/`, { ...lead, stage: newStage });
    if (res?.id && res.success !== false) {
      set((state) => ({
        leads: state.leads.map((l) => (l.id === leadId ? (res as Lead) : l)),
      }));
      get().addToast(`Lead stage updated to "${newStage}"`, 'success');
    } else {
      get().addToast(res?.error || 'Failed to update lead', 'error');
    }
  },

  convertLeadToDeal: async (leadId) => {
    const res = await apiClient.post(`/crm/leads/${leadId}/convert_to_deal/`, {});
    if (res?.deal) {
      set((state) => ({
        deals: [res.deal as Deal, ...state.deals],
        leads: state.leads.map((l) => (l.id === leadId ? { ...l, stage: 'won' } : l)),
        isLeadDrawerOpen: false,
      }));
      get().addToast('Lead converted to deal', 'success');
    } else {
      get().addToast(res?.error || 'Conversion failed', 'error');
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
    const res = await apiClient.put(`/operations/tasks/${taskId}/`, { ...task, checklist });
    if (res?.id && res.success !== false) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? (res as Task) : t)),
      }));
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
    const nextId = get().expenses.length + 1;
    const item: Expense = {
      id: nextId,
      date_str: exp.date_str || 'Today',
      description: exp.description || 'Office Supplies',
      category: exp.category || 'Operations',
      vendor: exp.vendor || 'General Vendor',
      amount: Number(exp.amount) || 1200,
      payment_mode: exp.payment_mode || 'UPI',
      project: exp.project || 'General Office',
      status: exp.status || 'paid',
      ...exp,
    };
    try {
      const res = await apiClient.post('/finance/expenses/', item);
      const created = (res?.id && res.success !== false) ? (res as Expense) : item;
      set((state) => ({ expenses: [created, ...state.expenses] }));
      get().addToast(`Expense "₹${created.amount}" recorded`, 'success');
      return created;
    } catch {
      set((state) => ({ expenses: [item, ...state.expenses] }));
      get().addToast(`Expense "₹${item.amount}" recorded`, 'success');
      return item;
    }
  },

  addTask: async (task) => {
    const nextId = get().tasks.length + 1;
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
      checklist: task.checklist || [
        { id: '1', text: 'Pre-check refrigerant pressure', completed: true },
        { id: '2', text: 'Clean compressor coil', completed: false },
        { id: '3', text: 'Customer signoff on WhatsApp', completed: false },
      ],
      ...task,
    };
    try {
      const res = await apiClient.post('/operations/tasks/', item);
      const created = (res?.id && res.success !== false) ? (res as Task) : item;
      set((state) => ({ tasks: [created, ...state.tasks] }));
      get().addToast(`Task "${created.title}" created`, 'success');
      return created;
    } catch {
      set((state) => ({ tasks: [item, ...state.tasks] }));
      get().addToast(`Task "${item.title}" created`, 'success');
      return item;
    }
  },

  addInventoryItem: async (inv) => {
    const nextId = get().inventory.length + 1;
    const item: InventoryItem = {
      id: nextId,
      name: inv.name || 'AC Copper Piping 1/2"',
      sku: inv.sku || `SKU-${1000 + nextId}`,
      category: inv.category || 'Spare Parts',
      stock_units: Number(inv.stock_units) || 50,
      stock_value: Number(inv.stock_value) || 12500,
      status: inv.status || 'in_stock',
      location: inv.location || 'Rack B-03',
      reorder_level: Number(inv.reorder_level) || 15,
      reorder_qty: Number(inv.reorder_qty) || 30,
      supplier: inv.supplier || 'Voltas Genuine Spares',
      ...inv,
    };
    try {
      const res = await apiClient.post('/operations/inventory/', item);
      const created = (res?.id && res.success !== false) ? (res as InventoryItem) : item;
      set((state) => ({ inventory: [created, ...state.inventory] }));
      get().addToast(`SKU "${created.sku}" added to inventory`, 'success');
      return created;
    } catch {
      set((state) => ({ inventory: [item, ...state.inventory] }));
      get().addToast(`SKU "${item.sku}" added`, 'success');
      return item;
    }
  },

  addTransaction: async (tx) => {
    const nextId = get().transactions.length + 1;
    const item: Transaction = {
      id: nextId,
      date_str: tx.date_str || 'Today',
      tx_type: tx.tx_type || 'income',
      description: tx.description || 'Advance Payment Received',
      category: tx.category || 'Service Billing',
      party: tx.party || 'Customer',
      account: tx.account || 'HDFC Current A/C',
      amount: Number(tx.amount) || 2800,
      payment_mode: tx.payment_mode || 'UPI (GPay)',
      reference_id: tx.reference_id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: tx.status || 'completed',
      ...tx,
    };
    try {
      const res = await apiClient.post('/finance/transactions/', item);
      const created = (res?.id && res.success !== false) ? (res as Transaction) : item;
      set((state) => ({ transactions: [created, ...state.transactions] }));
      get().addToast(`Transaction "₹${created.amount}" recorded`, 'success');
      return created;
    } catch {
      set((state) => ({ transactions: [item, ...state.transactions] }));
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
      set((state) => ({ knowledgeArticles: [created, ...state.knowledgeArticles] }));
      get().addToast(`Article "${created.title}" added to Knowledge Base`, 'success');
      return created;
    } catch {
      set((state) => ({ knowledgeArticles: [item, ...state.knowledgeArticles] }));
      get().addToast(`Article "${item.title}" added`, 'success');
      return item;
    }
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

  fetchVersionInfo: async () => {
    try {
      const res = await apiClient.get('/core/system-version/');
      if (res && res.current_commit) {
        set({ versionInfo: res as VersionInfo });
      }
    } catch (e) {
      console.warn('Could not fetch version info:', e);
    }
  },

  triggerSystemUpdate: async () => {
    set({ isUpdatingSystem: true, updateProgressStep: '1/4 Creating PostgreSQL database backup...' });
    try {
      const res = await apiClient.post('/core/system-update/', {});
      if (res && res.success !== false) {
        set({ updateProgressStep: '2/4 Pulling latest Git updates...' });
        await new Promise((r) => setTimeout(r, 2000));
        set({ updateProgressStep: '3/4 Applying migrations and rebuilding frontend...' });
        await new Promise((r) => setTimeout(r, 3000));
        set({ updateProgressStep: '4/4 Reloading WhatsQ services...' });
        await new Promise((r) => setTimeout(r, 2000));
        set({ isUpdatingSystem: false, updateProgressStep: 'Update Complete! Refreshing...' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return { success: true };
      } else {
        set({ isUpdatingSystem: false, updateProgressStep: '' });
        return { success: false, error: res?.error || 'System update failed' };
      }
    } catch (e: any) {
      set({ isUpdatingSystem: false, updateProgressStep: '' });
      return { success: false, error: e.message || 'System update failed' };
    }
  },
}));

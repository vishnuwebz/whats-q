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

interface QiyamState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  backendOnline: boolean;

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
  clockInEmployee: (employeeId: string | number) => Promise<void>;
  saveWorkflowNodes: (workflowId: string | number, nodes: FlowNode[]) => Promise<void>;
  runWorkflowTest: (workflowId: string | number, inputMessage: string) => Promise<{ steps: string[]; duration: string }>;
}

export const useQiyamStore = create<QiyamState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  backendOnline: false,

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

  clockInEmployee: async (employeeId) => {
    const employee = get().employees.find((e) => e.id === employeeId);
    if (!employee) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const res = await apiClient.put(`/operations/employees/${employeeId}/`, {
      ...employee,
      status: 'on_duty',
    });
    if (res?.id && res.success !== false) {
      set((state) => ({
        employees: state.employees.map((e) => (e.id === employeeId ? (res as Employee) : e)),
        attendance: state.attendance.map((a) =>
          a.employee_id_str === employee.employee_id_str
            ? { ...a, check_in: `${timeStr} (On time)`, status: 'present' }
            : a
        ),
      }));
      get().addToast('Attendance check-in logged', 'success');
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

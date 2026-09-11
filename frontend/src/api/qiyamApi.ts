import { apiClient } from './client';
import { mapAutomationLog, mapConversation } from './mappers';
import type {
  Approval,
  AutomationLog,
  BranchItem,
  Conversation,
  Deal,
  Employee,
  FollowUp,
  IntegrationItem,
  InventoryItem,
  Invoice,
  Job,
  KnowledgeArticle,
  Lead,
  MetaConfig,
  PaymentAccount,
  Route,
  Task,
  Transaction,
  WhatsAppTemplateItem,
  Workflow,
  Appointment,
  AttendanceRecord,
  Expense,
} from '../types';

async function list<T>(endpoint: string): Promise<T[]> {
  const data = await apiClient.get(endpoint);
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray((data as { results?: T[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export interface WorkspaceSettings {
  id: number;
  workspace_id: string;
  name: string;
  workspace_url: string;
  time_zone: string;
  date_format: string;
  enable_ai_assistant: boolean;
  enable_desktop_notifications: boolean;
  allow_file_uploads: boolean;
  plan: string;
  members_count: number;
  storage_used_gb: number;
  storage_limit_gb: number;
}

export interface ChannelMetricRow {
  id: number;
  channel_name: string;
  total_conversations: number;
  percentage: number;
  color: string;
}

export interface IntentMetricRow {
  id: number;
  intent_name: string;
  count: number;
  percentage: number;
}

export interface DailyMetricRow {
  id: number;
  date_str: string;
  conversations_count: number;
  response_time_sec: number;
  resolution_rate_percent: number;
}

export interface SearchResult {
  type: string;
  id: number;
  title: string;
  subtitle: string;
  tab: string;
}

export const qiyamApi = {
  list,

  async fetchConversations(): Promise<Conversation[]> {
    const rows = await list<Record<string, unknown>>('/conversations/threads/');
    return rows.map(mapConversation);
  },

  async fetchTemplates(): Promise<WhatsAppTemplateItem[]> {
    return list<WhatsAppTemplateItem>('/conversations/templates/');
  },

  async fetchMetaConfig(): Promise<MetaConfig | null> {
    return apiClient.get('/conversations/meta-config/');
  },

  async fetchLeads(): Promise<Lead[]> {
    return list<Lead>('/crm/leads/');
  },

  async fetchDeals(): Promise<Deal[]> {
    return list<Deal>('/crm/deals/');
  },

  async fetchFollowUps(): Promise<FollowUp[]> {
    return list<FollowUp>('/crm/follow-ups/');
  },

  async fetchCustomers() {
    return list<Record<string, unknown>>('/crm/customers/');
  },

  async fetchJobs(): Promise<Job[]> {
    return list<Job>('/operations/jobs/');
  },

  async fetchAppointments(): Promise<Appointment[]> {
    return list<Appointment>('/operations/appointments/');
  },

  async fetchEmployees(): Promise<Employee[]> {
    return list<Employee>('/operations/employees/');
  },

  async fetchAttendance(): Promise<AttendanceRecord[]> {
    return list<AttendanceRecord>('/operations/attendance/');
  },

  async fetchTasks(): Promise<Task[]> {
    return list<Task>('/operations/tasks/');
  },

  async fetchRoutes(): Promise<Route[]> {
    return list<Route>('/operations/routes/');
  },

  async fetchInventory(): Promise<InventoryItem[]> {
    return list<InventoryItem>('/operations/inventory/');
  },

  async fetchTransactions(): Promise<Transaction[]> {
    return list<Transaction>('/finance/transactions/');
  },

  async fetchInvoices(): Promise<Invoice[]> {
    return list<Invoice>('/finance/invoices/');
  },

  async fetchExpenses(): Promise<Expense[]> {
    return list<Expense>('/finance/expenses/');
  },

  async fetchAccounts(): Promise<PaymentAccount[]> {
    return list<PaymentAccount>('/finance/accounts/');
  },

  async fetchWorkflows(): Promise<Workflow[]> {
    return list<Workflow>('/automation/workflows/');
  },

  async fetchWorkflowLogs(): Promise<AutomationLog[]> {
    const rows = await list<Record<string, unknown>>('/automation/logs/');
    return rows.map(mapAutomationLog);
  },

  async fetchApprovals(): Promise<Approval[]> {
    return list<Approval>('/automation/approvals/');
  },

  async fetchKnowledge(): Promise<KnowledgeArticle[]> {
    return list<KnowledgeArticle>('/ai/knowledge-base/');
  },

  async fetchIntegrations(): Promise<IntegrationItem[]> {
    return list<IntegrationItem>('/core/integrations/');
  },

  async fetchBranches(): Promise<BranchItem[]> {
    return list<BranchItem>('/core/branches/');
  },

  async fetchWorkspace(): Promise<WorkspaceSettings | null> {
    const rows = await list<WorkspaceSettings>('/core/workspace/');
    return rows[0] || null;
  },

  async fetchChannelMetrics(): Promise<ChannelMetricRow[]> {
    return list<ChannelMetricRow>('/analytics/channels/');
  },

  async fetchIntentMetrics(): Promise<IntentMetricRow[]> {
    return list<IntentMetricRow>('/analytics/intents/');
  },

  async fetchDailyMetrics(): Promise<DailyMetricRow[]> {
    return list<DailyMetricRow>('/analytics/daily/');
  },

  async globalSearch(query: string): Promise<SearchResult[]> {
    const q = encodeURIComponent(query.trim());
    if (!q) return [];
    const data = await apiClient.get(`/core/search/?q=${q}`);
    return Array.isArray(data) ? data : [];
  },

  async aiChat(prompt: string) {
    return apiClient.post('/ai/chat/', { prompt });
  },
};

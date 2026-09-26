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
  Quotation,
  Route,
  Task,
  Transaction,
  WhatsAppTemplateItem,
  Workflow,
  Appointment,
  AttendanceRecord,
  Expense,
  KeywordRule,
  WorkingHoursConfig,
  SuppressionRecord,
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

  async markConversationRead(id: string | number): Promise<void> {
    try {
      await apiClient.post(`/conversations/threads/${id}/mark_read/`, {});
    } catch (e) {
      console.warn('Could not mark conversation read on backend:', e);
    }
  },

  async markAllConversationsRead(): Promise<void> {
    try {
      await apiClient.post('/conversations/threads/mark_all_read/', {});
    } catch (e) {
      console.warn('Could not mark all conversations read on backend:', e);
    }
  },

  async deleteConversation(id: string | number, permanent: boolean = false): Promise<boolean> {
    try {
      await apiClient.delete(`/conversations/threads/${id}/${permanent ? '?permanent=true' : ''}`);
      return true;
    } catch (e) {
      console.warn('Could not delete conversation on backend:', e);
      return false;
    }
  },

  async restoreConversation(id: string | number): Promise<any> {
    try {
      const res = await apiClient.post(`/conversations/threads/${id}/restore/`, {});
      return res;
    } catch (e) {
      console.warn('Could not restore conversation on backend:', e);
      return null;
    }
  },

  async fetchDeletedConversations(): Promise<Conversation[]> {
    try {
      const res: any = await apiClient.get('/conversations/threads/deleted_threads/');
      return Array.isArray(res) ? res : res?.results || [];
    } catch (e) {
      console.warn('Could not fetch deleted conversations:', e);
      return [];
    }
  },

  async fetchSuppressionList(): Promise<SuppressionRecord[]> {
    try {
      const rows = await list<SuppressionRecord>('/conversations/suppression/');
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      console.warn('Could not fetch suppression list from backend:', e);
      return [];
    }
  },

  async createSuppressionRecord(data: Partial<SuppressionRecord>): Promise<SuppressionRecord | null> {
    try {
      const res = await apiClient.post('/conversations/suppression/', data);
      return res as SuppressionRecord;
    } catch (e) {
      console.warn('Could not create suppression record on backend:', e);
      return null;
    }
  },

  async resubscribeSuppressionRecord(phoneOrId: string, convId?: string | number): Promise<boolean> {
    try {
      await apiClient.post('/conversations/suppression/resubscribe/', {
        phone: phoneOrId,
        id: phoneOrId,
        conv_id: convId,
      });
      return true;
    } catch (e) {
      console.warn('Could not resubscribe suppression record on backend:', e);
      return false;
    }
  },

  async updateSuppressionRecord(id: string, updates: Partial<SuppressionRecord>): Promise<SuppressionRecord | null> {
    try {
      const cleanId = id.replace(/^sup-/, '');
      const res = await apiClient.patch(`/conversations/suppression/${cleanId}/`, updates);
      return res as SuppressionRecord;
    } catch (e) {
      console.warn('Could not update suppression record on backend:', e);
      return null;
    }
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

  async fetchQuotations(): Promise<Quotation[]> {
    return list<Quotation>('/finance/quotations/');
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

  async fetchKeywordRules(): Promise<KeywordRule[]> {
    return list<KeywordRule>('/automation/keyword-rules/');
  },

  async createKeywordRule(data: Partial<KeywordRule>): Promise<KeywordRule> {
    return apiClient.post('/automation/keyword-rules/', data);
  },

  async updateKeywordRule(id: string | number, data: Partial<KeywordRule>): Promise<KeywordRule> {
    return apiClient.patch(`/automation/keyword-rules/${id}/`, data);
  },

  async bulkSaveKeywordRules(rules: Partial<KeywordRule>[]): Promise<KeywordRule[]> {
    return apiClient.post('/automation/keyword-rules/bulk_save/', { rules });
  },

  async deleteKeywordRule(id: string | number): Promise<boolean> {
    return apiClient.delete(`/automation/keyword-rules/${id}/`);
  },

  async toggleKeywordRule(id: string | number): Promise<KeywordRule> {
    return apiClient.post(`/automation/keyword-rules/${id}/toggle/`, {});
  },

  async fetchWorkingHours(): Promise<WorkingHoursConfig> {
    return apiClient.get('/automation/working-hours/');
  },

  async saveWorkingHours(data: Partial<WorkingHoursConfig>): Promise<WorkingHoursConfig> {
    return apiClient.put('/automation/working-hours/', data);
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

export type TabType = 
  | 'dashboard'
  | 'conversations'
  | 'crm-leads'
  | 'crm-customers'
  | 'crm-deals'
  | 'crm-followups'
  | 'ops-jobs'
  | 'ops-appointments'
  | 'ops-employees'
  | 'ops-schedule'
  | 'ops-attendance'
  | 'ops-tasks'
  | 'ops-routes'
  | 'ops-inventory'
  | 'finance-overview'
  | 'finance-transactions'
  | 'finance-invoices'
  | 'finance-expenses'
  | 'finance-payments'
  | 'finance-accounts'
  | 'finance-reports'
  | 'finance-budget'
  | 'automation-builder'
  | 'automation-workflows'
  | 'automation-templates'
  | 'automation-branches'
  | 'automation-logs'
  | 'automation-approvals'
  | 'ai-overview'
  | 'ai-branches'
  | 'ai-knowledgebase'
  | 'ai-templates'
  | 'template-hub'
  | 'template-create'
  | 'ai-settings'
  | 'analytics'
  | 'integrations'
  | 'settings';

export interface WhatsAppMessage {
  id: string | number;
  sender: 'customer' | 'agent' | 'system' | 'bot';
  senderName?: string;
  text: string;
  timestamp: string;
  created_at?: string;
  status: 'sent' | 'delivered' | 'read' | 'pending';
  reactions?: { emoji: string; from: 'customer' | 'agent' | 'bot' | 'system' }[];
  richCard?: {
    type: 'booking' | 'payment' | 'quotation';
    title: string;
    date?: string;
    time?: string;
    service?: string;
    amount?: number;
    bookingId?: string;
    invoiceId?: string;
    actionText?: string;
  };
}

export interface Conversation {
  id: string | number;
  contact_name: string;
  phone_number: string;
  avatar: string;
  category: 'Lead' | 'Customer' | 'Hot Lead' | 'Vendor';
  unread_count: number;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'ai_handled' | 'spam';
  lead_owner: string;
  lead_stage: string;
  source: string;
  first_contact_date: string;
  last_contact_date: string;
  location: string;
  language: string;
  tags: string[];
  notes: string;
  service_needed?: string;
  estimated_value?: number;
  active_workflow?: string;
  messages: WhatsAppMessage[];
  is_online?: boolean;
  last_seen?: string;
  updated_at?: string;
}

export interface Lead {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  location: string;
  value: number;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  owner: string;
  source: string;
  created_at_str: string;
  last_contact_str: string;
  notes: string;
  tags: string[];
  next_follow_up_date?: string;
  next_follow_up_time?: string;
}

export interface Deal {
  id: string | number;
  deal_name: string;
  customer_name: string;
  phone: string;
  email?: string;
  amount: number;
  stage: 'new' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  probability: number;
  deal_owner: string;
  source: string;
  expected_close_date: string;
  tags: string[];
  notes: string;
}

export interface FollowUp {
  id: string | number;
  title: string;
  related_to: string;
  customer_name: string;
  phone: string;
  follow_up_type: 'call' | 'whatsapp' | 'email' | 'meeting';
  assigned_to: string;
  due_date: string;
  due_time: string;
  status: 'due_today' | 'scheduled' | 'overdue' | 'completed';
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

export interface Job {
  id: string | number;
  job_id_str: string;
  customer_name: string;
  phone: string;
  service: string;
  date_str: string;
  time_str: string;
  assigned_to: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  location: string;
  amount: number;
  advance_paid: number;
  payment_status: 'paid' | 'advance_paid' | 'partially_paid' | 'pending';
  timeline: {
    title: string;
    timestamp: string;
    by: string;
    completed: boolean;
  }[];
}

export interface Appointment {
  id: string | number;
  apt_id_str: string;
  customer_name: string;
  phone: string;
  service: string;
  employee: string;
  date_str: string;
  time_str: string;
  status: 'confirmed' | 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  duration: string;
  location: string;
  amount: number;
  advance: number;
  payment_status: 'advance_paid' | 'pending' | 'paid' | 'refunded';
  source: string;
  notes: string;
}

export interface Employee {
  id: string | number;
  name: string;
  employee_id_str: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  status: 'on_duty' | 'active' | 'on_leave' | 'inactive';
  location: string;
  rating: number;
  jobs_completed_month: number;
  on_time_percent: number;
  today_schedule?: {
    time: string;
    task: string;
    location: string;
    status: 'in_progress' | 'upcoming' | 'completed';
  }[];
}

export interface AttendanceRecord {
  id: string | number;
  employee_id_str: string;
  employee_name: string;
  department: string;
  shift: string;
  check_in: string;
  check_out?: string;
  work_hours: string;
  status: 'present' | 'late' | 'absent' | 'on_leave';
  location: string;
  device: string;
}

export interface Task {
  id: string | number;
  title: string;
  subtitle: string;
  related_to: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'in_progress' | 'pending' | 'completed' | 'overdue';
  due_date: string;
  tags: string[];
  description: string;
  checklist: {
    id: string;
    text: string;
    completed: boolean;
  }[];
}

export interface RouteStop {
  id: number;
  address: string;
  customerName: string;
  timeWindow: string;
  isPriority?: boolean;
  isCompleted?: boolean;
  type: 'start' | 'stop' | 'priority' | 'end';
}

export interface Route {
  id: string | number;
  route_id_str: string;
  driver_name: string;
  phone: string;
  vehicle: string;
  status: 'in_progress' | 'completed' | 'planned' | 'delayed';
  stops_count: number;
  distance_km: number;
  duration: string;
  estimated_end: string;
  fuel_cost: number;
  completed_stops: number;
  stops: RouteStop[];
}

export interface InventoryItem {
  id: string | number;
  name: string;
  sku: string;
  category: string;
  stock_units: number;
  stock_value: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  location: string;
  reorder_level: number;
  reorder_qty: number;
  supplier: string;
}

export interface Transaction {
  id: string | number;
  date_str: string;
  tx_type: 'income' | 'expense' | 'transfer' | 'refund';
  description: string;
  category: string;
  party: string;
  account: string;
  amount: number;
  payment_mode: string;
  reference_id: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Invoice {
  id: string | number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  status: 'paid' | 'partial_paid' | 'overdue' | 'sent' | 'draft' | 'cancelled';
  paid_amount: number;
  payment_method: string;
  payment_date?: string;
  items?: {
    description: string;
    qty: number;
    unitPrice: number;
    amount: number;
  }[];
}

export interface Expense {
  id: string | number;
  date_str: string;
  description: string;
  category: string;
  vendor: string;
  amount: number;
  payment_mode: string;
  project: string;
  status: 'paid' | 'pending';
}

export interface PaymentAccount {
  id: string | number;
  name: string;
  account_number?: string;
  account_type: string;
  provider: string;
  current_balance: number;
  status: 'Active' | 'Inactive';
}

export interface FlowNode {
  id: string;
  type: 'trigger' | 'ai_agent' | 'action' | 'condition' | 'delay';
  title: string;
  subtitle: string;
  category: string;
  iconName: string;
  color: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface Workflow {
  id: string | number;
  name: string;
  category: string;
  business_function: string;
  trigger_type: string;
  description: string;
  status: 'active' | 'paused' | 'inactive';
  runs_this_month: number;
  success_rate: number;
  last_modified: string;
  nodes: FlowNode[];
}

export interface AutomationLog {
  id: string | number;
  time_str: string;
  workflow_action: string;
  branch: string;
  status: 'success' | 'warning' | 'failed';
  logLevel: string;
  message: string;
  triggered_by: string;
  duration: string;
}

export interface Approval {
  id: string | number;
  request_id_str: string;
  title: string;
  approval_type: string;
  department: string;
  requested_by: string;
  submitted_on: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  amount?: number;
}

export interface KnowledgeArticle {
  id: string | number;
  title: string;
  category: string;
  content: string;
  status: 'published' | 'draft' | 'archived';
  last_updated: string;
  author: string;
  views: number;
  helpful_percent: number;
}

export interface WhatsAppTemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
  text: string;
  url?: string;
  url_sample?: string;
  phone_number?: string;
  code?: string;
}

export interface WhatsAppTemplateItem {
  id: string | number;
  name: string;
  category: string;
  meta_category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: string;
  meta_status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED' | 'DRAFT';
  language?: string;
  usage_count: number;
  last_updated: string;
  author: string;
  body: string;
  body_text?: string;
  body_variables?: Record<string, string>;
  header_type?: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
  header_text?: string;
  header_url?: string;
  header_sample?: string;
  footer_text?: string;
  buttons?: WhatsAppTemplateButton[];
  quality_score?: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  rejection_reason?: string;
  meta_template_id?: string;
  allow_category_change?: boolean;
}

export interface MetaConfig {
  id?: number;
  phone_number_id: string;
  waba_id: string;
  access_token: string;
  access_token_masked?: string;
  verify_token: string;
  app_secret?: string;
  api_version: string;
  webhook_url: string;
  is_active: boolean;
  connection_status: 'connected' | 'disconnected' | 'invalid_token' | 'error';
  business_name: string;
  business_phone_display: string;
  quality_rating: string;
  last_tested_at?: string;
  auto_reply_enabled?: boolean;
  dual_mode_enabled?: boolean;
  forward_webhook_url?: string;
  staff_numbers?: string;
  staff_keywords?: string;
}


export interface IntegrationItem {
  id: string | number;
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'partially_connected' | 'not_connected';
  connected_on?: string;
  automations_enabled: number;
  icon_slug: string;
}

export interface BranchItem {
  id: string | number;
  name: string;
  code: string;
  branch_type: string;
  city: string;
  state: string;
  status: string;
  automations_count: number;
  tasks_automated: number;
  last_activity: string;
}

export type TabType = 
  | 'landing'
  | 'dashboard'
  | 'conversations'
  | 'bulk-overview'
  | 'bulk-send'
  | 'bulk-templates'
  | 'bulk-campaigns'
  | 'bulk-recipients'
  | 'bulk-suppression'
  | 'bulk-scheduled'
  | 'crm-leads'
  | 'crm-customers'
  | 'crm-deals'
  | 'crm-followups'
  | 'branches'
  | 'ops-jobs'
  | 'ops-appointments'
  | 'ops-employees'
  | 'ops-emp-directory'
  | 'ops-emp-profiles'
  | 'ops-emp-attendance'
  | 'ops-emp-leaves'
  | 'ops-emp-monitoring'
  | 'ops-emp-breaks'
  | 'ops-emp-performance'
  | 'ops-emp-productivity'
  | 'ops-emp-rewards'
  | 'ops-emp-vouchers'
  | 'ops-emp-overtime'
  | 'ops-emp-onboarding'
  | 'ops-schedule'
  | 'ops-attendance'
  | 'ops-tasks'
  | 'ops-routes'
  | 'ops-inventory'
  | 'finance-overview'
  | 'finance-transactions'
  | 'finance-invoices'
  | 'finance-quotations'
  | 'finance-expenses'
  | 'finance-payments'
  | 'finance-accounts'
  | 'finance-reports'
  | 'finance-budget'
  | 'finance-payroll'
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
  | 'settings'
  | 'settings-backup'
  | 'settings-whatsapp'
  | 'roles';

export interface WhatsAppMessage {
  id: string | number;
  sender: 'customer' | 'agent' | 'system' | 'bot';
  senderName?: string;
  sender_device?: string;
  sender_phone?: string;
  text: string;
  timestamp: string;
  created_at?: string;
  status: 'sent' | 'delivered' | 'read' | 'pending';
  isTemplate?: boolean;
  workflowName?: string;
  isVoiceNote?: boolean;
  audioUrl?: string;
  audioDuration?: number;
  waveform?: number[];
  reactions?: { emoji: string; from: 'customer' | 'agent' | 'bot' | 'system' }[];
  richCard?: {
    type: 'booking' | 'payment' | 'quotation' | 'voice_note' | string;
    title?: string;
    date?: string;
    time?: string;
    service?: string;
    amount?: number;
    bookingId?: string;
    invoiceId?: string;
    actionText?: string;
    audioUrl?: string;
    duration?: number;
    waveform?: number[];
  };
}

export interface LinkedEmployeeDevice {
  id: string | number;
  device_label: string;
  phone_number: string;
  employee_name?: string;
  session_token?: string;
  status: 'connected' | 'pending' | 'disconnected';
  device_type?: string;
  battery_level?: number;
  is_active?: boolean;
  last_active?: string;
  created_at?: string;
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
  is_blocked?: boolean;
  is_opted_out?: boolean;
  suppression_reason?: string;
  suppression_date?: string;
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
  branch?: string;
  joining_date?: string;
  shift?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  address?: string;
  avatar_url?: string;
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
  image_url?: string;
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

export interface QuotationItem {
  description: string;
  qty: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  amount: number;
}

export interface Quotation {
  id: string | number;
  quotation_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_gstin?: string;
  quotation_date: string;
  valid_until: string;
  amount: number;
  subtotal?: number;
  tax_rate?: number;
  tax_type?: 'intra_state' | 'inter_state' | 'exempt';
  tax_amount?: number;
  discount_amount?: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';
  converted_invoice_id?: string;
  terms?: string;
  notes?: string;
  items?: QuotationItem[];
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
  receipt_url?: string;
  reference_no?: string;
  notes?: string;
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

export interface GroupChoiceOption {
  label: string;
  targetGroup?: string;
}

export interface GroupItem {
  id: string;
  type: 'message' | 'choice' | 'collect' | 'jump' | 'payment';
  content?: string;
  question?: string;
  options?: GroupChoiceOption[];
  varName?: string;
  targetGroup?: string;
  provider?: 'STRIPE' | 'RAZORPAY' | 'PAYPAL' | 'UPI';
  currency?: string;
  amount?: number;
  quantity?: number;
  successTarget?: string;
  failedTarget?: string;
  footer?: string;
  buttonLabel?: string;
}

export interface FlowGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  items: GroupItem[];
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

export interface KeywordRule {
  id: string | number;
  title: string;
  triggered_count: number;
  active: boolean;
  keywords: string[];
  reply: string;
  attachment?: string;
  action_type?: 'reply' | 'workflow' | 'both';
  workflow?: string | number | null;
  workflow_name?: string;
}

export interface DaySchedule {
  day: string;
  time: string;
  enabled: boolean;
}

export interface WorkingHoursConfig {
  id?: number;
  schedule: DaySchedule[];
  away_message: string;
  is_active: boolean;
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
  id?: string;
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
  quality_rating?: string;
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
  config?: Record<string, any>;
}

export interface BranchItem {
  id: string | number;
  name: string;
  code: string;
  branch_type: string;
  city: string;
  state: string;
  pincode?: string;
  status: string;
  automations_count: number;
  tasks_automated: number;
  last_activity: string;
  image?: string;
  manager_name?: string;
  manager_role?: string;
  employees_count?: number;
  customers_count?: number;
  is_main?: boolean;
  phone?: string;
  email?: string;
  address?: string;
}

export interface BulkCampaignRecipient {
  id?: string;
  name: string;
  phone: string;
  status: 'DELIVERED' | 'READ' | 'FAILED' | 'PENDING' | 'SENT' | 'QUEUED' | string;
  time: string;
  errorReason?: string;
}

export interface BulkCampaign {
  id: string;
  name: string;
  description?: string;
  type?: 'Marketing' | 'Utility' | 'Engagement' | 'Security' | string;
  category?: 'marketing' | 'utility' | 'authentication' | string;
  audienceListName: string;
  audienceListId?: string;
  totalRecipients: number;
  recipients?: number;
  deliveredCount: number;
  delivered?: number;
  deliveredPercent?: number;
  readCount: number;
  repliedCount: number;
  failedCount: number;
  failed?: number;
  failedPercent?: number;
  pending?: number;
  cost: number;
  createdOn?: string;
  createdAt: string;
  createdBy?: string;
  scheduledOn?: string;
  completedOn?: string;
  status: 'Completed' | 'In Progress' | 'Failed' | 'Scheduled' | 'COMPLETED' | 'SENDING' | 'SCHEDULED' | 'FAILED' | 'DRAFT' | string;
  templateName: string;
  templateId?: string;
  messageText?: string;
  sendType?: 'now' | 'schedule';
  scheduledDateTime?: string;
  recipientsList?: BulkCampaignRecipient[];
}

export interface BulkRecipientList {
  id: string;
  name: string;
  description?: string;
  type?: 'Customers' | 'Leads' | 'Campaign' | 'VIP' | 'General' | 'Follow-up' | string;
  contacts?: number;
  contactCount: number;
  validWhatsAppCount: number;
  tags: string[];
  createdOn?: string;
  createdAt: string;
  createdBy?: string;
  lastUpdated?: string;
  status?: 'Active' | 'Inactive' | string;
  sources?: {
    manual: number;
    website: number;
    csv: number;
    other: number;
  };
  contactItems?: BulkContact[];
}

export interface BulkContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tag?: string;
  validWhatsApp?: boolean;
  optedOut?: boolean;
  lastActive?: string;
  source?: string;
}

export interface BulkScheduledMessage {
  id: string;
  name?: string;
  campaignName: string;
  description?: string;
  type?: 'Campaign' | 'Transactional' | string;
  recipientGroupId?: string;
  recipientGroupName: string;
  recipientCount: number;
  recipients?: number;
  scheduledDateTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledFor: string;
  templateName: string;
  templateUsed?: string;
  category: 'marketing' | 'utility' | 'authentication' | string;
  status: 'Pending' | 'Sent' | 'Failed' | 'Cancelled' | 'QUEUED' | 'SENT' | 'CANCELLED' | string;
  estimatedCost: number;
  createdBy?: string;
  createdOn?: string;
  createdAt?: string;
  messageText?: string;
  contacts?: Array<{ name?: string; phone: string }>;
  templateId?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface BulkTemplateItem {
  id: string;
  name: string;
  templateId?: string;
  category: 'Appointments' | 'Payments' | 'Marketing' | 'General' | 'Operations' | 'Customer Support' | 'Security' | 'Billing' | 'Other' | 'marketing' | 'utility' | 'authentication' | string;
  language: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'APPROVED' | 'PENDING' | 'REJECTED' | string;
  meta_status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED' | 'DRAFT' | string;
  lastUpdated?: string;
  updatedBy?: string;
  approvedOn?: string;
  header?: string;
  body?: string;
  bodyText: string;
  footer?: string;
  footerText?: string;
  qualityRating?: 'High' | 'Medium' | 'Low' | string;
  headerType?: 'NONE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'TEXT' | string;
  headerContent?: string;
  headerFileName?: string;
  headerFileSize?: string;
  buttons?: { type: string; text: string; url?: string }[];
  variables?: string[];
}

export interface MetaWalletInfo {
  balance: number;
  currency: string;
  autoDeduct?: boolean;
  lowBalanceThreshold: number;
  autoRecharge: boolean;
  autoRechargeAmount: number;
  conversationPricing: {
    marketing: number;
    utility: number;
    authentication: number;
    service: number;
  };
  lastUpdated: string;
  wabaId: string;
  paymentMethod?: string;
  officialBillingUrl: string;
}

export interface MetaWalletTransaction {
  id: string;
  type: 'debit' | 'credit';
  category?: 'Campaign Messages' | 'Utility Messages' | 'Wallet Top-up' | 'Service Fee' | 'Refund' | string;
  amount: number;
  currency?: string;
  description: string;
  timestamp: string;
  balanceAfter: number;
  campaignId?: string;
  campaignName?: string;
  receiptUrl?: string;
}

export interface WhatsAppGroupContact {
  id: string;
  name: string;
  phone: string;
  cleanPhone?: string;
  whatsappId: string;
  role: 'admin' | 'member';
  country: string;
  avatar?: string;
  isValidWhatsApp: boolean;
  isProtected?: boolean;
  statusMessage?: string;
  joinedAt?: string;
}

export interface WhatsAppGroup {
  id: string;
  jid: string;
  name: string;
  description: string;
  avatar: string;
  category: 'Customer Community' | 'VIP Club' | 'Industry & Vendors' | 'Regional Network' | 'Internal Ops' | string;
  memberCount: number;
  isAdmin: boolean;
  createdAt: string;
  members: WhatsAppGroupContact[];
}

export interface SuppressionRecord {
  id: string;
  name: string;
  phone: string;
  type: 'blocked' | 'opt_out_stop' | 'opt_out_button' | 'opted_out' | 'manual';
  reason: string;
  metaErrorCode?: string | number;
  campaignName?: string;
  date: string;
  timestamp: string | number;
  status: 'Suppressed' | 'Active' | 'active' | 'suppressed';
  notes?: string;
  canResubscribe: boolean;
  source?: string;
}

export type RolePermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'execute' | 'export';
export type RoleModule = 'crm' | 'inbox' | 'operations' | 'finance' | 'workflows' | 'campaigns' | 'analytics' | 'settings';
export type RecordScope = 'all' | 'department' | 'team' | 'own' | 'assigned';

export interface RoleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  scope: RecordScope;
  isSystemRole?: boolean;
  permissions: Record<RoleModule, Record<RolePermissionAction, boolean>>;
  assignedEmployees?: string[];
  mfaRequired?: boolean;
  sessionTimeoutMins?: number;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface PdfCanvasElement {
  id: string;
  type: 'logo' | 'seal' | 'signature' | 'text' | 'watermark' | 'qr' | 'table';
  x: number;
  y: number;
  content?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  isBold?: boolean;
  sealType?: 'official_circle' | 'approved' | 'paid' | 'verified' | 'confidential';
  signatureType?: 'director' | 'manager' | 'custom_drawn';
  signeeName?: string;
  signeeRole?: string;
  sealTitle?: string;
  sealSubtext?: string;
  sealBottomText?: string;
  qrLabel?: string;
  logoText?: string;
  imageUrl?: string;
}

export interface PdfEditorDocument {
  type: 'staff_letter' | 'invoice' | 'quotation' | 'id_card' | 'voucher' | 'financial_report' | 'compensation_letter' | 'custom';
  title: string;
  referenceNumber: string;
  dateStr: string;
  recipientName: string;
  recipientRole?: string;
  recipientPhone?: string;
  recipientId?: string;
  department?: string;
  bloodGroup?: string;
  emergencyPhone?: string;
  emergencyName?: string;
  validTill?: string;
  shift?: string;
  branch?: string;
  avatarInitials?: string;
  avatarUrl?: string;
  amount?: number | string;
  previousCtc?: number | string;
  newCtc?: number | string;
  incrementPercent?: number | string;
  effectiveDate?: string;
  appraisalRationale?: string;
  approvedBy?: string;
  invoiceNumber?: string;
  items?: any[];
  subject?: string;
  bodyContent: string;
  companyName: string;
  companyAddress: string;
  companyPhone?: string;
  companyEmail?: string;
  paymentStatus?: string;
  dueDate?: string;
  taxRate?: number;
  notes?: string;
  watermarkText?: string;
  showWatermark?: boolean;
  watermarkOpacity?: number;
  elements: PdfCanvasElement[];
}

export type PayrollSubView =
  | 'overview'
  | 'run-payroll'
  | 'manage-salary'
  | 'reimbursements'
  | 'tax-compliance'
  | 'off-cycle'
  | 'reports'
  | 'settings';

export interface PayrollRunItem {
  id: string | number;
  month: string;
  employees_count: number;
  gross_amount: number;
  deductions: number;
  net_amount: number;
  payment_status: 'Processing' | 'Paid' | 'Pending' | 'Failed';
  processed_on: string;
  notes?: string;
}

export interface EmployeeSalaryDetail {
  id: string | number;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  payroll_group: string;
  gross_salary: number;
  deductions: number;
  net_pay: number;
  status: 'Ready' | 'Warning' | 'Processed' | 'Held' | 'Pending';
  warning_reason?: string;
  bank_account?: string;
  pan_number?: string;
  uan_number?: string;
  // Extended fields for master payroll matrix (matching media_1790147717219.jpg)
  role?: string;
  full_day?: number;
  half_day?: number;
  wfh_days?: number;
  paid_leave?: number;
  paid_days?: number;
  unpaid_days?: number;
  daily_wage?: number;
  gross_wages?: number;
  earned_wages?: number;
  other_earnings?: number;
  overtime_amount?: number;
  extras?: number;
  gross_earnings?: number;
  tds?: number;
  penalties?: number;
  other_deductions?: number;
  finalized_amount?: number;
}

export interface SalaryComponentItem {
  name: string;
  type: 'Fixed %' | 'Fixed Amount';
  value: string | number;
}

export interface SalaryStructure {
  id: string | number;
  name: string;
  department: string;
  employees_count: number;
  ctc_range: string;
  pay_frequency: string;
  status: 'Active' | 'Inactive';
  components: SalaryComponentItem[];
}

export interface EmployeeSalaryAssignment {
  id: string | number;
  employee_name: string;
  employee_id: string;
  department: string;
  salary_structure: string;
  current_ctc: number;
  effective_from: string;
  status: 'Active' | 'Inactive';
}

export interface ReimbursementItem {
  id: string | number;
  employee_name: string;
  employee_id: string;
  purpose: string;
  category: 'Travel' | 'Internet' | 'Food' | 'Stationery' | 'Training' | 'Transport' | 'Software' | 'Communication' | 'Other';
  amount: number;
  submitted_on: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Draft';
  department?: string;
  notes?: string;
}

export interface EmployeeSalaryBreakdown {
  gross_ctc: number;
  basic: number;
  hra: number;
  conveyance: number;
  special_allowance: number;
  other_allowances?: number;
}

export interface ComplianceDocumentItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  uploaded_at: string;
  file_size?: string;
}

export interface ComplianceHistoryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'regime' | 'pf' | 'esi' | 'return' | 'audit' | 'general';
}

export interface EmployeeTaxCompliance {
  id: string | number;
  employee_name: string;
  employee_id: string;
  department: string;
  tds: boolean;
  pf: boolean;
  esi: boolean;
  pt: boolean;
  status: 'Compliant' | 'Pending' | 'Non-Compliant';
  tds_regime?: 'Old Regime' | 'New Regime';
  estimated_annual_tax?: number;
  monthly_tds?: number;
  pf_number?: string;
  pf_rate?: string;
  esi_number?: string;
  esi_status?: string;
  pt_number?: string;
  pt_monthly?: number;
  pt_state?: string;
  verification_notes?: string;
  last_updated?: string;
  salary_breakdown?: EmployeeSalaryBreakdown;
  documents?: ComplianceDocumentItem[];
  history?: ComplianceHistoryItem[];
}

export interface OffCyclePaymentItem {
  id: string | number;
  run_id: string;
  employee_name: string;
  employee_id: string;
  department: string;
  payment_type: 'Bonus' | 'Incentive' | 'Arrears' | 'Project Bonus' | 'Reimbursement' | 'Retention Bonus' | 'Overtime' | 'Commission' | 'Referral Bonus';
  amount: number;
  processed_on: string;
  status: 'Paid' | 'Pending' | 'Processing';
  notes?: string;
}

export interface PayrollReportItem {
  id: string | number;
  name: string;
  type: string;
  period: string;
  generated_on: string;
  generated_by: string;
  status: 'Completed' | 'Processing' | 'Failed';
  file_url?: string;
}

export interface PayrollSettingsState {
  frequency: string;
  month_start: string;
  cutoff_date: string;
  credit_date: string;
  financial_year: string;
  include_new_joinees: boolean;
  calculate_partial_attendance: boolean;
  round_off_salary: boolean;
  send_payslip_email: boolean;
  enable_payroll_approval: boolean;
  company_name_payslip: string;
  payslip_template: string;
  include_company_logo: boolean;
  include_employee_signature: boolean;
  include_company_address: boolean;
  include_statutory_details: boolean;
  salary_payment_method: string;
  default_bank: string;
  upload_bank_file_format: string;
  overtime_calc: string;
  leave_deduction: string;
  arrears_processing: string;
  reimbursement_approval: string;
  bonus_policy: string;
  [key: string]: any;
}



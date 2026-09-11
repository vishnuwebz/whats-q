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
  | 'ai-settings'
  | 'analytics'
  | 'integrations'
  | 'settings';

export interface WhatsAppMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system' | 'bot';
  senderName?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'pending';
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
  id: string;
  contactName: string;
  phoneNumber: string;
  avatar: string;
  category: 'Lead' | 'Customer' | 'Hot Lead' | 'Vendor';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'ai_handled' | 'spam';
  leadOwner?: string;
  leadStage?: string;
  source: string;
  firstContactDate: string;
  location: string;
  language: string;
  tags: string[];
  notes: string;
  serviceNeeded?: string;
  estimatedValue?: number;
  activeWorkflow?: string;
  messages: WhatsAppMessage[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  location: string;
  value: number;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  owner: string;
  source: string;
  createdAt: string;
  lastContact: string;
  notes: string;
  tags: string[];
  nextFollowUp?: {
    date: string;
    time: string;
  };
}

export interface Deal {
  id: string;
  dealName: string;
  customerName: string;
  phone: string;
  email: string;
  amount: number;
  stage: 'new' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  probability: number;
  dealOwner: string;
  source: string;
  expectedCloseDate: string;
  tags: string[];
  notes: string;
}

export interface FollowUp {
  id: string;
  title: string;
  relatedTo: string;
  customerName: string;
  phone: string;
  type: 'call' | 'whatsapp' | 'email' | 'meeting';
  assignedTo: string;
  dueDate: string;
  dueTime: string;
  status: 'due_today' | 'scheduled' | 'overdue' | 'completed';
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

export interface Job {
  id: string;
  customerName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  assignedTo: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  location: string;
  amount: number;
  advancePaid: number;
  paymentStatus: 'paid' | 'advance_paid' | 'partially_paid' | 'pending';
  timeline: {
    title: string;
    timestamp: string;
    by: string;
    completed: boolean;
  }[];
}

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  service: string;
  employee: string;
  date: string;
  time: string;
  status: 'confirmed' | 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  duration: string;
  location: string;
  amount: number;
  advance: number;
  paymentStatus: 'advance_paid' | 'pending' | 'paid' | 'refunded';
  source: string;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  status: 'on_duty' | 'active' | 'on_leave' | 'inactive';
  location: string;
  rating: number;
  jobsCompletedMonth: number;
  onTimePercent: number;
  todaySchedule: {
    time: string;
    task: string;
    location: string;
    status: 'in_progress' | 'upcoming' | 'completed';
  }[];
}

export interface ScheduleShift {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  shifts: {
    [day: string]: {
      time: string;
      department: string;
      isOff?: boolean;
    };
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shift: string;
  checkIn: string;
  checkOut?: string;
  workHours: string;
  status: 'present' | 'late' | 'absent' | 'on_leave';
  location: string;
  device: string;
}

export interface Task {
  id: string;
  title: string;
  subtitle: string;
  relatedTo: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'in_progress' | 'pending' | 'completed' | 'overdue';
  dueDate: string;
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
  id: string;
  driverName: string;
  phone: string;
  vehicle: string;
  status: 'in_progress' | 'completed' | 'planned' | 'delayed';
  stopsCount: number;
  distanceKm: number;
  duration: string;
  estimatedEnd: string;
  fuelCost: number;
  completedStops: number;
  stops: RouteStop[];
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockUnits: number;
  stockValue: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  location: string;
  reorderLevel: number;
  reorderQty: number;
  supplier: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'partial_paid' | 'overdue' | 'sent' | 'draft' | 'cancelled';
  paidAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
  items: {
    description: string;
    qty: number;
    unitPrice: number;
    amount: number;
  }[];
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer' | 'refund';
  description: string;
  category: string;
  party: string;
  account: string;
  amount: number;
  paymentMode: 'UPI' | 'Bank Transfer' | 'Net Banking' | 'Card' | 'Cash' | 'NEFT';
  referenceId: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  vendor: string;
  amount: number;
  paymentMode: string;
  project: string;
  status: 'paid' | 'pending';
}

export interface PaymentAccount {
  id: string;
  name: string;
  accountNumber?: string;
  type: 'bank' | 'cash' | 'payment_gateway';
  provider: string;
  balance: number;
  status: 'active' | 'inactive';
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
  outputs?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  businessFunction: string;
  trigger: string;
  status: 'active' | 'paused' | 'inactive';
  runsThisMonth: number;
  successRate: number;
  lastModified: string;
  nodes: FlowNode[];
}

export interface ApprovalRequest {
  id: string;
  title: string;
  type: string;
  department: string;
  requestedBy: string;
  submittedOn: string;
  status: 'pending' | 'approved' | 'rejected';
  amount?: number;
}

export interface AutomationLog {
  id: string;
  time: string;
  workflowAction: string;
  branch: string;
  status: 'success' | 'warning' | 'failed';
  logLevel: 'info' | 'warning' | 'error';
  message: string;
  triggeredBy: 'system' | 'user' | 'schedule';
  duration: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  status: 'published' | 'draft' | 'archived';
  lastUpdated: string;
  author: string;
  views: number;
  helpfulPercent: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'draft' | 'scheduled';
  usageCount: number;
  lastUpdated: string;
  author: string;
  body: string;
  language: string;
  variables: string[];
}

export interface IntegrationService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: 'connected' | 'partially_connected' | 'not_connected';
  connectedOn?: string;
  automationsEnabled: number;
}

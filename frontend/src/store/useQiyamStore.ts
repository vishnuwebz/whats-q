import { create } from 'zustand';
import {
  TabType, Conversation, Lead, Deal, FollowUp, Job, Appointment,
  Employee, AttendanceRecord, Task, Route, InventoryItem, Transaction,
  Invoice, Expense, PaymentAccount, Workflow, AutomationLog, Approval,
  KnowledgeArticle, WhatsAppTemplateItem, IntegrationItem, BranchItem, FlowNode, WhatsAppMessage,
  MetaConfig
} from '../types';
import { apiClient } from '../api/client';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface QiyamState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Modals & Drawers
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
  
  // Data lists
  conversations: Conversation[];
  leads: Lead[];
  deals: Deal[];
  followups: FollowUp[];
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

  // Actions
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  toasts: Toast[];
  removeToast: (id: string) => void;

  loadInitialData: () => Promise<void>;
  sendMessage: (conversationId: string | number, text: string, sender?: 'agent' | 'customer' | 'bot') => void;
  sendTemplateMessage: (conversationId: string | number, templateId: string | number, variables: Record<string, string>) => Promise<void>;
  simulateInboundWhatsApp: (name: string, phone: string, text: string) => void;
  saveMetaTemplate: (template: Partial<WhatsAppTemplateItem>) => Promise<WhatsAppTemplateItem | null>;
  submitTemplateToMeta: (templateId: string | number) => Promise<boolean>;
  syncTemplatesWithMeta: () => Promise<void>;
  testSendTemplate: (templateId: string | number, phone: string, variables: Record<string, string>) => Promise<{ success: boolean; error?: string; message?: string }>;
  deleteMetaTemplate: (templateId: string | number) => Promise<boolean>;
  saveMetaConfig: (config: Partial<MetaConfig>) => Promise<boolean>;
  testMetaConnection: (credentials: { phone_number_id: string; waba_id: string; access_token: string }) => Promise<any>;

  updateLeadStage: (leadId: string | number, newStage: Lead['stage']) => void;
  convertLeadToDeal: (leadId: string | number) => void;
  updateJobStatus: (jobId: string | number, status: Job['status']) => void;
  updateApprovalStatus: (approvalId: string | number, status: 'Approved' | 'Rejected') => void;
  toggleTaskChecklist: (taskId: string | number, checklistId: string) => void;
  clockInEmployee: (employeeId: string | number) => void;
  saveWorkflowNodes: (workflowId: string | number, nodes: FlowNode[]) => void;
  runWorkflowTest: (workflowId: string | number, inputMessage: string) => { steps: string[]; duration: string };
}


export const useQiyamStore = create<QiyamState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedConversationId: 1,
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
  selectedTemplateId: 1,
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),

  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  conversations: [
    {
      id: 1,
      contact_name: 'Amit Verma',
      phone_number: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      category: 'Lead',
      unread_count: 2,
      status: 'in_progress',
      lead_owner: 'Ramesh Kumar',
      lead_stage: 'New Lead',
      source: 'WhatsApp',
      first_contact_date: 'May 12, 2024 10:30 AM',
      last_contact_date: 'May 12, 2024 10:32 AM',
      location: 'Koyilandy, Kerala',
      language: 'English',
      tags: ['AC Service', 'High Value'],
      notes: 'Customer wants service tomorrow morning. Prefers 10 AM - 12 PM slot.',
      service_needed: 'AC Repair',
      estimated_value: 2800.0,
      active_workflow: 'Service Booking Flow',
      messages: [
        { id: 101, sender: 'customer', text: 'I need AC service tomorrow.', timestamp: '10:30 AM', status: 'read' },
        { id: 102, sender: 'bot', senderName: 'Qiyam AI Assistant', text: 'Sure! I can help you with that. Please share your location so I can check service availability.', timestamp: '10:30 AM', status: 'read' },
        { id: 103, sender: 'customer', text: '45, Park Street, Koyilandy', timestamp: '10:31 AM', status: 'read' },
        { id: 104, sender: 'bot', senderName: 'Qiyam AI Assistant', text: 'Great! We are available at your location. The charges will be ₹2,800. Shall I book it for you?', timestamp: '10:31 AM', status: 'read' },
        { id: 105, sender: 'customer', text: 'Yes, please.', timestamp: '10:32 AM', status: 'read' },
        {
          id: 106,
          sender: 'bot',
          senderName: 'Qiyam AI Assistant',
          text: 'Booking confirmed for tomorrow between 10:00 AM - 12:00 PM. You will receive a reminder. Booking ID: #B4821',
          timestamp: '10:32 AM',
          status: 'delivered',
          richCard: {
            type: 'booking',
            title: 'Booking Confirmed',
            date: 'May 13, 2024 (Mon)',
            time: '10:00 AM - 12:00 PM',
            service: 'AC Repair',
            amount: 2800,
            bookingId: '#B4821',
            actionText: 'View Details',
          },
        },
      ],
    },
    {
      id: 2,
      contact_name: 'Priya Sharma',
      phone_number: '+91 89213 56789',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      category: 'Customer',
      unread_count: 1,
      status: 'open',
      lead_owner: 'Ramesh Kumar',
      lead_stage: 'New Lead',
      source: 'WhatsApp',
      first_contact_date: 'May 12, 2024 10:24 AM',
      last_contact_date: 'May 12, 2024 10:24 AM',
      location: 'Kozhikode, Kerala',
      language: 'English',
      tags: ['Cleaning'],
      notes: 'Customer requested quote for 3 BHK deep cleaning.',
      service_needed: 'Home Cleaning',
      estimated_value: 1200.0,
      active_workflow: 'Lead Follow-up Flow',
      messages: [
        { id: 201, sender: 'customer', text: 'Can I get the quotation?', timestamp: '10:24 AM', status: 'read' },
        { id: 202, sender: 'agent', senderName: 'Rahul Mehta', text: 'Hello Priya! Our team is preparing the detailed cleaning estimate.', timestamp: '10:25 AM', status: 'delivered' },
      ],
    },
    {
      id: 3,
      contact_name: 'Rahul Singh',
      phone_number: '+91 98764 11122',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      category: 'Lead',
      unread_count: 2,
      status: 'in_progress',
      lead_owner: 'Ramesh Kumar',
      lead_stage: 'Contacted',
      source: 'WhatsApp',
      first_contact_date: 'Yesterday',
      last_contact_date: 'Yesterday',
      location: 'Koyilandy, Kerala',
      language: 'English',
      tags: ['Electrical'],
      notes: 'Full house wiring check.',
      service_needed: 'Electrical Work',
      estimated_value: 3500.0,
      messages: [
        { id: 301, sender: 'customer', text: 'I want to book an appointment', timestamp: 'Yesterday', status: 'read' },
        { id: 302, sender: 'agent', senderName: 'Ramesh Kumar', text: 'Sure Rahul, would Thursday 11:30 AM work for you?', timestamp: 'Yesterday', status: 'delivered' },
      ],
    },
    {
      id: 4,
      contact_name: 'Neha Patel',
      phone_number: '+91 96789 11223',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      category: 'Customer',
      unread_count: 1,
      status: 'waiting',
      lead_owner: 'Ramesh Kumar',
      lead_stage: 'Won',
      source: 'WhatsApp',
      first_contact_date: 'Yesterday',
      last_contact_date: 'Yesterday',
      location: 'Kozhikode, Kerala',
      language: 'English',
      tags: ['Support', 'Plumbing'],
      notes: 'Payment verification needed.',
      messages: [
        { id: 401, sender: 'customer', text: 'Payment issue on invoice INV-2024-0182', timestamp: 'Yesterday', status: 'read' },
      ],
    },
    {
      id: 5,
      contact_name: 'Vikram Mehta',
      phone_number: '+91 90000 11123',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      category: 'Hot Lead',
      unread_count: 0,
      status: 'in_progress',
      lead_owner: 'Ramesh Kumar',
      lead_stage: 'Proposal Sent',
      source: 'WhatsApp',
      first_contact_date: 'May 10',
      last_contact_date: 'May 10',
      location: 'Calicut, Kerala',
      language: 'English',
      tags: ['AC Service', 'VIP'],
      notes: 'Commercial installation.',
      messages: [
        { id: 501, sender: 'customer', text: 'When will the job be done?', timestamp: 'May 10', status: 'read' },
        { id: 502, sender: 'agent', senderName: 'Rahul Mehta', text: 'Technician Amit Sharma is arriving at 10:30 AM today.', timestamp: 'May 10', status: 'read' },
      ],
    },
    {
      id: 6,
      contact_name: 'Sneha Joshi',
      phone_number: '+91 96789 66771',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      category: 'Customer',
      unread_count: 0,
      status: 'resolved',
      lead_owner: 'Priya Sharma',
      lead_stage: 'Won',
      source: 'WhatsApp',
      first_contact_date: 'May 10',
      last_contact_date: 'May 10',
      location: 'Koyilandy, Kerala',
      language: 'English',
      tags: ['Feedback'],
      notes: 'Service successfully completed.',
      messages: [
        { id: 601, sender: 'customer', text: 'Thanks for the service!', timestamp: 'May 10', status: 'read' },
        { id: 602, sender: 'agent', text: 'You are welcome Sneha! Please rate us when you have a moment.', timestamp: 'May 10', status: 'delivered' },
      ],
    },
  ],

  leads: [
    { id: 1, name: 'Amit Verma', phone: '+91 98765 43210', service: 'AC Repair', location: 'Koyilandy, Kerala', value: 2800, stage: 'new', owner: 'Ramesh Kumar', source: 'WhatsApp', created_at_str: 'May 12, 2024 10:30 AM', last_contact_str: 'May 12, 2024 10:30 AM', notes: 'Customer needs AC repair tomorrow morning. Prefers 10 AM - 12 PM slot.', tags: ['AC Service', 'Urgent'], next_follow_up_date: 'May 13, 2024', next_follow_up_time: '10:00 AM' },
    { id: 2, name: 'Priya Sharma', phone: '+91 89213 56789', service: 'Home Cleaning', location: 'Kozhikode, Kerala', value: 1200, stage: 'new', owner: 'Ramesh Kumar', source: 'WhatsApp', created_at_str: 'May 12, 2024 10:15 AM', last_contact_str: 'May 12, 2024 10:15 AM', notes: 'Interested in regular bi-weekly flat cleaning.', tags: ['Cleaning'] },
    { id: 3, name: 'Rahul Singh', phone: '+91 98764 11122', service: 'Electrical Work', location: 'Koyilandy, Kerala', value: 3500, stage: 'new', owner: 'Ramesh Kumar', source: 'WhatsApp', created_at_str: 'May 12, 2024 09:30 AM', last_contact_str: 'May 12, 2024 09:30 AM', notes: 'Main switch board replacement and earthing check.', tags: ['Electrical'] },
    { id: 4, name: 'Neha Patel', phone: '+91 96789 11223', service: 'Plumbing', location: 'Kozhikode, Kerala', value: 2200, stage: 'new', owner: 'Ramesh Kumar', source: 'WhatsApp', created_at_str: 'May 12, 2024 08:00 AM', last_contact_str: 'May 12, 2024 08:00 AM', notes: 'Kitchen sink pipe blockage.', tags: ['Plumbing'] },
    { id: 5, name: 'Vikram Mehta', phone: '+91 90000 11123', service: 'AC Installation', location: 'Calicut, Kerala', value: 4500, stage: 'contacted', owner: 'Priya Sharma', source: 'WhatsApp', created_at_str: 'May 11, 2024', last_contact_str: 'May 12, 2024', notes: 'Contacted regarding split AC indoor & outdoor copper piping.', tags: ['AC Service'] },
    { id: 6, name: 'Sneha Joshi', phone: '+91 96789 66771', service: 'Pest Control', location: 'Koyilandy, Kerala', value: 2000, stage: 'contacted', owner: 'Priya Sharma', source: 'WhatsApp', created_at_str: 'May 11, 2024', last_contact_str: 'May 12, 2024', notes: 'General pest control for 2 BHK residence.', tags: ['Pest Control'] },
    { id: 7, name: 'Anita Singh', phone: '+91 98765 11199', service: 'AC Repair (Split Unit)', location: 'Koyilandy, Kerala', value: 2800, stage: 'qualified', owner: 'Anita Singh', source: 'WhatsApp', created_at_str: 'May 10, 2024', last_contact_str: 'May 11, 2024', notes: 'Gas leak detected and capacitor replaced.', tags: ['AC Service'] },
    { id: 8, name: 'Pooja Iyer', phone: '+91 96789 12345', service: 'Electrical Wiring', location: 'Calicut, Kerala', value: 6500, stage: 'qualified', owner: 'Arjun Nair', source: 'WhatsApp', created_at_str: 'May 10, 2024', last_contact_str: 'May 11, 2024', notes: '3-phase wiring inspection.', tags: ['Electrical'] },
    { id: 9, name: 'Deepak Patel', phone: '+91 85471 22330', service: 'AC Servicing (3 Units)', location: 'Calicut, Kerala', value: 5600, stage: 'proposal_sent', owner: 'Ramesh Kumar', source: 'WhatsApp', created_at_str: 'May 09, 2024', last_contact_str: 'May 10, 2024', notes: 'Sent quotation with AMC discount for 3 split units.', tags: ['AC Service', 'AMC'] },
    { id: 10, name: 'Kiran Kumar', phone: '+91 81234 55667', service: 'AC Installation + Ducting', location: 'Kozhikode, Kerala', value: 12000, stage: 'negotiation', owner: 'Rahul Mehta', source: 'WhatsApp', created_at_str: 'May 08, 2024', last_contact_str: 'May 09, 2024', notes: 'Commercial building VRV system negotiation.', tags: ['Commercial', 'High Value'] },
  ],

  deals: [
    { id: 1, deal_name: 'AC Installation - Vikram Mehta', customer_name: 'Vikram Mehta', phone: '+91 90000 11123', amount: 12000, stage: 'proposal_sent', probability: 60, deal_owner: 'Ramesh Kumar', source: 'WhatsApp', expected_close_date: 'May 20, 2024', tags: ['AC Service', 'High Value'], notes: 'Customer interested in 1.5 ton inverter AC installation. Shared quotation.' },
    { id: 2, deal_name: 'AC Service AMC - Pooja Iyer', customer_name: 'Pooja Iyer', phone: '+91 96789 12345', amount: 18000, stage: 'proposal_sent', probability: 75, deal_owner: 'Priya Sharma', source: 'WhatsApp', expected_close_date: 'May 22, 2024', tags: ['AMC', 'VIP'], notes: 'Annual maintenance contract for 5 AC units.' },
    { id: 3, deal_name: 'Full Home Cleaning - Anil Gupta', customer_name: 'Anil Gupta', phone: '+91 98765 22334', amount: 15000, stage: 'negotiation', probability: 85, deal_owner: 'Ramesh Kumar', source: 'Website', expected_close_date: 'May 21, 2024', tags: ['Cleaning'], notes: 'Deep cleaning prior to house warming event.' },
    { id: 4, deal_name: 'AC Duct Cleaning - Kiran Kumar', customer_name: 'Kiran Kumar', phone: '+91 81234 55667', amount: 7200, stage: 'negotiation', probability: 80, deal_owner: 'Rahul Mehta', source: 'Referral', expected_close_date: 'May 24, 2024', tags: ['AC Service'], notes: 'Commercial office ducting.' },
    { id: 5, deal_name: 'AC Repair - Deepak Patel', customer_name: 'Deepak Patel', phone: '+91 85471 22330', amount: 2800, stage: 'won', probability: 100, deal_owner: 'Ramesh Kumar', source: 'WhatsApp', expected_close_date: 'May 12, 2024', tags: ['AC Service'], notes: 'Service completed and invoice paid via UPI.' },
    { id: 6, deal_name: 'Home Cleaning - Amit Verma', customer_name: 'Amit Verma', phone: '+91 98765 43210', amount: 1500, stage: 'won', probability: 100, deal_owner: 'Ramesh Kumar', source: 'WhatsApp', expected_close_date: 'May 11, 2024', tags: ['Cleaning'], notes: 'Bathroom deep cleaning completed.' },
  ],

  followups: [
    { id: 1, title: 'Confirm AC Installation', related_to: 'AC Installation - Vikram Mehta DEAL-1024', customer_name: 'Vikram Mehta', phone: '+91 90000 11123', follow_up_type: 'call', assigned_to: 'Amit Sharma', due_date: 'May 12, 2024', due_time: '10:30 AM', status: 'due_today', priority: 'high', notes: 'Confirm installation slot & address.' },
    { id: 2, title: 'Share Quotation', related_to: 'AC Repair - Amit Verma DEAL-1023', customer_name: 'Amit Verma', phone: '+91 98765 43210', follow_up_type: 'whatsapp', assigned_to: 'Priya Sharma', due_date: 'May 12, 2024', due_time: '12:00 PM', status: 'due_today', priority: 'high', notes: 'Share breakdown for repair.' },
    { id: 3, title: 'Payment Reminder', related_to: 'Home Cleaning - Priya Sharma DEAL-1018', customer_name: 'Priya Sharma', phone: '+91 89213 56789', follow_up_type: 'whatsapp', assigned_to: 'Neha Patel', due_date: 'May 13, 2024', due_time: '09:00 AM', status: 'scheduled', priority: 'medium', notes: 'Remind about pending invoice.' },
    { id: 4, title: 'Follow-up on Quote', related_to: 'Deep Cleaning - Sneha Joshi DEAL-1014', customer_name: 'Sneha Joshi', phone: '+91 96789 11223', follow_up_type: 'call', assigned_to: 'Priya Sharma', due_date: 'May 10, 2024', due_time: '02:00 PM', status: 'overdue', priority: 'high', notes: 'Check if quotation was accepted.' },
    { id: 5, title: 'Service Feedback', related_to: 'Plumbing Work - Arjun Nair DEAL-1016', customer_name: 'Arjun Nair', phone: '+91 85471 22330', follow_up_type: 'whatsapp', assigned_to: 'Sneha Joshi', due_date: 'May 13, 2024', due_time: '04:00 PM', status: 'scheduled', priority: 'low', notes: 'Collect feedback after service.' },
  ],

  jobs: [
    {
      id: 1,
      job_id_str: 'JOB-1024',
      customer_name: 'Vikram Mehta',
      phone: '+91 90000 11123',
      service: 'AC Installation - 1.5 Ton Inverter AC',
      date_str: 'May 12, 2024',
      time_str: '10:30 AM',
      assigned_to: 'Amit Sharma',
      status: 'in_progress',
      priority: 'high',
      location: 'Kozhikode, Kerala',
      amount: 1200,
      advance_paid: 360,
      payment_status: 'partially_paid',
      timeline: [
        { title: 'Job Created', timestamp: 'May 10, 10:15 AM', by: 'System', completed: true },
        { title: 'Assigned to Amit Sharma', timestamp: 'May 10, 10:20 AM', by: 'System', completed: true },
        { title: 'Customer Confirmed', timestamp: 'May 10, 11:05 AM', by: 'Customer', completed: true },
        { title: 'Job Started', timestamp: 'May 12, 10:35 AM', by: 'Amit Sharma', completed: true },
        { title: 'Job Completed', timestamp: 'Pending', by: 'Technician', completed: false },
      ],
    },
    { id: 2, job_id_str: 'JOB-1023', customer_name: 'Amit Verma', phone: '+91 98765 43210', service: 'AC Repair (Gas Leakage)', date_str: 'May 12, 2024', time_str: '12:00 PM', assigned_to: 'Priya Sharma', status: 'scheduled', priority: 'high', location: 'Kozhikode, Kerala', amount: 2800, advance_paid: 840, payment_status: 'advance_paid', timeline: [] },
    { id: 3, job_id_str: 'JOB-1022', customer_name: 'Priya Sharma', phone: '+91 89213 56789', service: 'Deep Cleaning (Full Home)', date_str: 'May 13, 2024', time_str: '09:00 AM', assigned_to: 'Neha Patel', status: 'scheduled', priority: 'medium', location: 'Ramanattukara, Kerala', amount: 4500, advance_paid: 1350, payment_status: 'advance_paid', timeline: [] },
    { id: 4, job_id_str: 'JOB-1021', customer_name: 'Rahul Singh', phone: '+91 98764 11122', service: 'Plumbing Work (Pipe Fitting)', date_str: 'May 13, 2024', time_str: '11:30 AM', assigned_to: 'Rahul Mehta', status: 'in_progress', priority: 'medium', location: 'Kozhikode, Kerala', amount: 2200, advance_paid: 660, payment_status: 'partially_paid', timeline: [] },
    { id: 5, job_id_str: 'JOB-1020', customer_name: 'Sneha Joshi', phone: '+91 96789 66771', service: 'AC Maintenance (General Service)', date_str: 'May 13, 2024', time_str: '04:00 PM', assigned_to: 'Arjun Nair', status: 'completed', priority: 'low', location: 'Vadakara, Kerala', amount: 1500, advance_paid: 1500, payment_status: 'paid', timeline: [] },
  ],

  appointments: [
    { id: 1, apt_id_str: 'APT-1024', customer_name: 'Vikram Mehta', phone: '+91 90000 11123', service: 'AC Installation (1.5 Ton Inverter AC)', employee: 'Amit Sharma', date_str: 'May 12, 2024', time_str: '10:30 AM', status: 'confirmed', duration: '2h 00m', location: 'Kozhikode, Kerala', amount: 1200, advance: 360, payment_status: 'advance_paid', source: 'WhatsApp', notes: 'Customer requested morning slot.' },
    { id: 2, apt_id_str: 'APT-1023', customer_name: 'Amit Verma', phone: '+91 98765 43210', service: 'AC Repair (Gas Leakage)', employee: 'Priya Sharma', date_str: 'May 12, 2024', time_str: '12:00 PM', status: 'upcoming', duration: '1h 30m', location: 'Kozhikode, Kerala', amount: 2800, advance: 0, payment_status: 'pending', source: 'WhatsApp', notes: 'Check gas pressure.' },
    { id: 3, apt_id_str: 'APT-1022', customer_name: 'Priya Sharma', phone: '+91 89213 56789', service: 'Deep Cleaning (Full Home)', employee: 'Neha Patel', date_str: 'May 13, 2024', time_str: '09:00 AM', status: 'confirmed', duration: '3h 00m', location: 'Ramanattukara, Kerala', amount: 4500, advance: 450, payment_status: 'advance_paid', source: 'WhatsApp', notes: 'Bring floor scrubbing machine.' },
    { id: 4, apt_id_str: 'APT-1021', customer_name: 'Rahul Singh', phone: '+91 98764 11122', service: 'Plumbing Work (Pipe Fitting)', employee: 'Rahul Mehta', date_str: 'May 13, 2024', time_str: '11:30 AM', status: 'confirmed', duration: '1h 00m', location: 'Kozhikode, Kerala', amount: 1200, advance: 1200, payment_status: 'paid', source: 'WhatsApp', notes: 'Full payment made upfront.' },
  ],

  employees: [
    { id: 1, name: 'Amit Sharma', employee_id_str: 'EMP-001', role: 'Field Technician', department: 'AC Services', phone: '+91 90000 11123', email: 'amit.sharma@qiyam.com', status: 'on_duty', location: 'Kozhikode, Kerala', rating: 4.8, jobs_completed_month: 28, on_time_percent: 96 },
    { id: 2, name: 'Priya Sharma', employee_id_str: 'EMP-002', role: 'Customer Support', department: 'Support', phone: '+91 89213 56789', email: 'priya.sharma@qiyam.com', status: 'active', location: 'Kozhikode Office', rating: 4.6, jobs_completed_month: 120, on_time_percent: 98 },
    { id: 3, name: 'Rahul Singh', employee_id_str: 'EMP-003', role: 'Plumbing Technician', department: 'Plumbing', phone: '+91 98764 11122', email: 'rahul.singh@qiyam.com', status: 'on_duty', location: 'Vadakara, Kerala', rating: 4.7, jobs_completed_month: 22, on_time_percent: 94 },
    { id: 4, name: 'Neha Patel', employee_id_str: 'EMP-004', role: 'Housekeeper Lead', department: 'Cleaning', phone: '+91 96789 11223', email: 'neha.patel@qiyam.com', status: 'on_leave', location: 'Kozhikode, Kerala', rating: 4.5, jobs_completed_month: 18, on_time_percent: 90 },
    { id: 5, name: 'Arjun Nair', employee_id_str: 'EMP-005', role: 'Electrician', department: 'Electrical', phone: '+91 85471 22330', email: 'arjun.nair@qiyam.com', status: 'on_duty', location: 'Ramanattukara, Kerala', rating: 4.6, jobs_completed_month: 31, on_time_percent: 95 },
    { id: 6, name: 'Sneha Joshi', employee_id_str: 'EMP-006', role: 'Team Lead', department: 'AC Services', phone: '+91 96789 66771', email: 'sneha.joshi@qiyam.com', status: 'active', location: 'Kozhikode Office', rating: 4.9, jobs_completed_month: 56, on_time_percent: 99 },
  ],

  attendance: [
    { id: 1, employee_id_str: 'EMP-001', employee_name: 'Amit Sharma', department: 'AC Services', shift: '9:00 AM - 6:00 PM', check_in: '9:02 AM (On time)', check_out: '6:01 PM', work_hours: '8h 59m', status: 'present', location: 'Kozhikode, Kerala', device: 'Mobile App (Android)' },
    { id: 2, employee_id_str: 'EMP-002', employee_name: 'Priya Sharma', department: 'Support', shift: '9:00 AM - 6:00 PM', check_in: '9:18 AM (18m late)', check_out: '6:05 PM', work_hours: '8h 47m', status: 'late', location: 'Kozhikode Office', device: 'Web Dashboard' },
    { id: 3, employee_id_str: 'EMP-003', employee_name: 'Rahul Singh', department: 'Plumbing', shift: '9:00 AM - 6:00 PM', check_in: '9:01 AM (On time)', check_out: '6:02 PM', work_hours: '9h 01m', status: 'present', location: 'Vadakara, Kerala', device: 'Mobile App (Android)' },
    { id: 4, employee_id_str: 'EMP-004', employee_name: 'Neha Patel', department: 'Cleaning', shift: '9:00 AM - 6:00 PM', check_in: '-', work_hours: '-', status: 'absent', location: '-', device: '-' },
    { id: 5, employee_id_str: 'EMP-005', employee_name: 'Arjun Nair', department: 'Electrical', shift: '9:00 AM - 6:00 PM', check_in: '8:55 AM (On time)', check_out: '5:58 PM', work_hours: '9h 03m', status: 'present', location: 'Ramanattukara, Kerala', device: 'Mobile App (Android)' },
  ],

  tasks: [
    {
      id: 1,
      title: 'Install AC Unit (1.5 Ton Inverter AC)',
      subtitle: 'Complete outdoor bracket mounting and vacuum purge',
      related_to: 'JOB-1024 (Vikram Mehta)',
      assignee: 'Amit Sharma',
      priority: 'high',
      status: 'in_progress',
      due_date: 'May 16, 2024 10:30 AM',
      tags: ['Installation', 'AC Services'],
      description: 'Install 1.5 Ton Inverter AC in master bedroom. Ensure proper vacuum and wiring check.',
      checklist: [
        { id: 'c1', text: 'Site inspection', completed: true },
        { id: 'c2', text: 'Check electrical point', completed: true },
        { id: 'c3', text: 'Install indoor unit', completed: false },
        { id: 'c4', text: 'Install outdoor unit', completed: false },
      ],
    },
    {
      id: 2,
      title: 'Follow up with customer regarding quotation',
      subtitle: 'Quotation sent for AC repair',
      related_to: 'APT-1023 (Amit Verma)',
      assignee: 'Priya Sharma',
      priority: 'medium',
      status: 'pending',
      due_date: 'May 16, 2024 12:00 PM',
      tags: ['Follow Up'],
      description: 'Call Amit Verma to confirm 12:00 PM gas leakage repair slot.',
      checklist: [
        { id: 'c1', text: 'Review gas price breakdown', completed: true },
        { id: 'c2', text: 'Confirm technician arrival', completed: false },
      ],
    },
  ],

  routes: [
    {
      id: 1,
      route_id_str: 'RTE-001',
      driver_name: 'Rahul Mehta',
      phone: '+91 98765 43210',
      vehicle: 'KL 11 AB 1234',
      status: 'in_progress',
      stops_count: 12,
      distance_km: 65.4,
      duration: '3h 15m',
      estimated_end: '12:15 PM',
      fuel_cost: 1120,
      completed_stops: 9,
      stops: [
        { id: 1, address: 'Main Hub, Kozhikode', customerName: 'Head Office', timeWindow: '09:00 AM', type: 'start' },
        { id: 2, address: '45 Park Street, Koyilandy', customerName: 'Amit Verma', timeWindow: '09:30 AM', type: 'stop', isCompleted: true },
        { id: 3, address: '12 Beach Road, Calicut', customerName: 'Vikram Mehta', timeWindow: '10:15 AM', type: 'stop', isCompleted: true },
        { id: 6, address: '88 Highway Junction, Vadakara', customerName: 'Sneha Joshi', timeWindow: '11:00 AM', type: 'priority', isPriority: true, isCompleted: true },
        { id: 10, address: 'Airport Road, Ramanattukara', customerName: 'Priya Sharma', timeWindow: '12:00 PM', type: 'end' },
      ],
    },
  ],

  inventory: [
    { id: 1, name: 'Basmati Rice 5kg', sku: 'GROC-001', category: 'Grocery', stock_units: 245, stock_value: 12250, status: 'in_stock', location: 'Main Warehouse Aisle 01 - Rack 02', reorder_level: 50, reorder_qty: 100, supplier: 'Fresh Supplies Pvt. Ltd.' },
    { id: 2, name: 'Sunflower Oil 1L', sku: 'GROC-002', category: 'Grocery', stock_units: 28, stock_value: 1960, status: 'low_stock', location: 'Main Warehouse Aisle 02 - Rack 01', reorder_level: 30, reorder_qty: 80, supplier: 'Fresh Supplies Pvt. Ltd.' },
    { id: 3, name: 'Milk Powder 500g', sku: 'DAIRY-001', category: 'Dairy', stock_units: 0, stock_value: 0, status: 'out_of_stock', location: 'Main Warehouse Aisle 03 - Rack 01', reorder_level: 20, reorder_qty: 50, supplier: 'Milma Dairy' },
    { id: 4, name: 'Colgate Toothpaste 100g', sku: 'HPC-001', category: 'Personal Care', stock_units: 156, stock_value: 3120, status: 'in_stock', location: 'Main Warehouse Aisle 04 - Rack 03', reorder_level: 40, reorder_qty: 100, supplier: 'Colgate Palmolive' },
  ],

  transactions: [
    { id: 1, date_str: 'May 31, 2024', tx_type: 'income', description: 'Payment from AC Services', category: 'AC Services', party: 'Amit Sharma', account: 'HDFC Bank - 1234', amount: 12500, payment_mode: 'UPI', reference_id: 'INV-2024-0521', status: 'completed' },
    { id: 2, date_str: 'May 30, 2024', tx_type: 'expense', description: 'Salary - May 2024', category: 'Salaries & Wages', party: 'Payroll', account: 'ICICI Bank - 5678', amount: 265000, payment_mode: 'Bank Transfer', reference_id: 'EXP-2024-0311', status: 'completed' },
    { id: 3, date_str: 'May 29, 2024', tx_type: 'income', description: 'Digital Marketing Project', category: 'Marketing', party: 'Digital Ads Pvt. Ltd.', account: 'HDFC Bank - 1234', amount: 18750, payment_mode: 'UPI', reference_id: 'INV-2024-0518', status: 'completed' },
    { id: 4, date_str: 'May 28, 2024', tx_type: 'expense', description: 'Office Rent - May', category: 'Rent & Utilities', party: 'Landlord', account: 'Axis Bank - 9012', amount: 55000, payment_mode: 'NEFT', reference_id: 'EXP-2024-0308', status: 'completed' },
    { id: 5, date_str: 'May 27, 2024', tx_type: 'income', description: 'Website Development', category: 'Web Services', party: 'Rahul Singh', account: 'HDFC Bank - 1234', amount: 75000, payment_mode: 'Bank Transfer', reference_id: 'INV-2024-0512', status: 'completed' },
  ],

  invoices: [
    { id: 1, invoice_number: 'INV-2024-0186', customer_name: 'AC Services', customer_email: 'acservices@gmail.com', customer_phone: '+91 98765 43210', invoice_date: 'May 31, 2024', due_date: 'Jun 14, 2024', amount: 12500, status: 'paid', paid_amount: 12500, payment_method: 'UPI', payment_date: 'May 31, 2024', items: [{ description: 'AC Repair & Gas Refill', qty: 2, unitPrice: 6250, amount: 12500 }] },
    { id: 2, invoice_number: 'INV-2024-0185', customer_name: 'Digital Ads Pvt. Ltd.', customer_email: 'info@digitalads.com', customer_phone: '+91 89213 56789', invoice_date: 'May 30, 2024', due_date: 'Jun 13, 2024', amount: 18750, status: 'paid', paid_amount: 18750, payment_method: 'Bank Transfer', payment_date: 'May 30, 2024' },
    { id: 3, invoice_number: 'INV-2024-0184', customer_name: 'Zoho Corp', customer_email: 'accounts@zohocorp.com', customer_phone: '+91 90000 11123', invoice_date: 'May 29, 2024', due_date: 'Jun 12, 2024', amount: 4200, status: 'partial_paid', paid_amount: 2100, payment_method: 'Card', payment_date: 'May 30, 2024' },
    { id: 4, invoice_number: 'INV-2024-0183', customer_name: 'Priya Sharma', customer_email: 'priya.sharma@gmail.com', customer_phone: '+91 89213 56789', invoice_date: 'May 28, 2024', due_date: 'Jun 11, 2024', amount: 32000, status: 'overdue', paid_amount: 0, payment_method: '-' },
    { id: 5, invoice_number: 'INV-2024-0182', customer_name: 'Rahul Singh', customer_email: 'rahulsingh@gmail.com', customer_phone: '+91 98764 11122', invoice_date: 'May 27, 2024', due_date: 'Jun 10, 2024', amount: 7600, status: 'sent', paid_amount: 0, payment_method: '-' },
  ],

  expenses: [
    { id: 1, date_str: 'May 31, 2024', description: 'Office Rent - May', category: 'Rent & Utilities', vendor: 'Landlord', amount: 55000, payment_mode: 'Bank Transfer', project: '-', status: 'paid' },
    { id: 2, date_str: 'May 31, 2024', description: 'Internet Bill', category: 'Utilities', vendor: 'BSNL', amount: 2500, payment_mode: 'UPI', project: '-', status: 'paid' },
    { id: 3, date_str: 'May 30, 2024', description: 'Google Workspace', category: 'Software', vendor: 'Google LLC', amount: 1680, payment_mode: 'Card', project: 'Digital Marketing', status: 'paid' },
    { id: 4, date_str: 'May 30, 2024', description: 'Facebook Ads', category: 'Marketing', vendor: 'Meta Platforms', amount: 18750, payment_mode: 'UPI', project: 'Digital Marketing', status: 'paid' },
  ],

  accounts: [
    { id: 1, name: 'Qiyam Business Current A/c', account_number: '50200012345678', account_type: 'Bank Account', provider: 'Federal Bank', current_balance: 2478350, status: 'Active' },
    { id: 2, name: 'HDFC Business Account', account_number: '50100234567890', account_type: 'Bank Account', provider: 'HDFC Bank', current_balance: 1245600, status: 'Active' },
    { id: 3, name: 'Axis Current Account', account_number: '917020123456789', account_type: 'Bank Account', provider: 'Axis Bank', current_balance: 838400, status: 'Active' },
    { id: 4, name: 'Razorpay Online Payments', account_number: 'rzp_a1b2c3d4e5f6', account_type: 'Payment Gateway', provider: 'Razorpay', current_balance: 350000, status: 'Active' },
    { id: 5, name: 'PayPal Business', account_number: 'paypal.me/qiyambs', account_type: 'Payment Gateway', provider: 'PayPal', current_balance: 525200, status: 'Active' },
  ],

  workflows: [
    {
      id: 1,
      name: 'Service Booking Flow',
      category: 'CRM',
      business_function: 'Operations & Booking',
      trigger_type: 'New WhatsApp Message',
      description: 'Automated inbound WhatsApp intent parsing, lead creation, service availability check, payment request, and technician assignment.',
      status: 'active',
      runs_this_month: 156,
      success_rate: 98.7,
      last_modified: 'May 31, 2024 10:30 AM',
      nodes: [
        { id: '1', type: 'trigger', title: 'New WhatsApp Message', subtitle: 'When a new message is received', category: 'TRIGGERS', iconName: 'MessageSquare', color: 'emerald', config: {}, position: { x: 400, y: 50 } },
        { id: '2', type: 'ai_agent', title: 'Understand Intent (AI Agent)', subtitle: 'Extract intent, service, location, customer details', category: 'AI', iconName: 'Bot', color: 'purple', config: {}, position: { x: 400, y: 150 } },
        { id: '3', type: 'action', title: 'Create / Update Lead', subtitle: 'Create new lead or update existing lead in CRM', category: 'ACTIONS', iconName: 'UserCheck', color: 'blue', config: {}, position: { x: 400, y: 250 } },
        { id: '4', type: 'condition', title: 'Service Available?', subtitle: 'Check if service is available in customer location', category: 'CONDITIONS', iconName: 'Filter', color: 'amber', config: {}, position: { x: 400, y: 350 } },
        { id: '5', type: 'action', title: 'Send Availability Message', subtitle: 'Share service availability and ask for confirmation', category: 'ACTIONS', iconName: 'Send', color: 'emerald', config: {}, position: { x: 250, y: 480 } },
        { id: '6', type: 'action', title: 'Create Appointment', subtitle: 'Create appointment based on customer preference', category: 'ACTIONS', iconName: 'Calendar', color: 'purple', config: {}, position: { x: 250, y: 580 } },
        { id: '7', type: 'action', title: 'Request Payment (30% Advance)', subtitle: 'Request advance payment to confirm booking', category: 'ACTIONS', iconName: 'CreditCard', color: 'emerald', config: {}, position: { x: 250, y: 680 } },
        { id: '8', type: 'action', title: 'Assign Nearest Employee', subtitle: 'Assign nearest available technician (Ramesh Kumar)', category: 'ACTIONS', iconName: 'Users', color: 'purple', config: {}, position: { x: 600, y: 480 } },
      ],
    },
    {
      id: 2,
      name: 'Invoice Generation Flow',
      category: 'Finance',
      business_function: 'Accounting',
      trigger_type: 'Order Confirmed',
      description: 'Automatically generate and send invoices for confirmed orders via WhatsApp.',
      status: 'active',
      runs_this_month: 128,
      success_rate: 99.2,
      last_modified: 'May 31, 2024 09:15 AM',
      nodes: [],
    },
    {
      id: 3,
      name: 'Payment Reminder Sequence',
      category: 'Finance',
      business_function: 'Collections',
      trigger_type: 'Payment Due Date',
      description: 'Send automated reminder WhatsApp messages for overdue or pending payments.',
      status: 'active',
      runs_this_month: 96,
      success_rate: 97.6,
      last_modified: 'May 31, 2024 08:45 AM',
      nodes: [],
    },
  ],

  workflowLogs: [
    { id: 1, time_str: 'May 31, 2024 10:30:45 AM', workflow_action: 'Invoice Generation (Create Invoice)', branch: 'Kochi Branch', status: 'success', logLevel: 'Info', message: 'Invoice INV-2024-1056 generated successfully.', triggered_by: 'System', duration: '1.23s' },
    { id: 2, time_str: 'May 31, 2024 10:25:18 AM', workflow_action: 'Payment Reminder (Send Reminder)', branch: 'Head Office', status: 'success', logLevel: 'Info', message: 'Payment reminder sent to customer (3 accounts).', triggered_by: 'Schedule', duration: '2.15s' },
    { id: 3, time_str: 'May 31, 2024 10:22:09 AM', workflow_action: 'Lead Follow-up (Assign Lead)', branch: 'Mumbai Branch', status: 'success', logLevel: 'Info', message: 'Lead assigned to sales team successfully.', triggered_by: 'User', duration: '0.89s' },
    { id: 4, time_str: 'May 31, 2024 10:18:34 AM', workflow_action: 'Employee Onboarding (Create Account)', branch: 'Bangalore Branch', status: 'warning', logLevel: 'Warning', message: 'Employee document missing: PAN Card.', triggered_by: 'System', duration: '1.45s' },
  ],

  approvals: [
    { id: 1, request_id_str: 'APR-1024', title: 'Purchase Order ₹25,000', approval_type: 'Purchase', department: 'Operations', requested_by: 'Aneesh K', submitted_on: 'May 31, 2024 10:24 AM', status: 'Pending', amount: 25000 },
    { id: 2, request_id_str: 'APR-1023', title: 'Leave Application 3 Days', approval_type: 'Leave', department: 'HR', requested_by: 'Sneha P', submitted_on: 'May 31, 2024 09:48 AM', status: 'Approved' },
    { id: 3, request_id_str: 'APR-1022', title: 'Budget Release Marketing Campaign', approval_type: 'Finance', department: 'Marketing', requested_by: 'Rahul T', submitted_on: 'May 30, 2024 04:12 PM', status: 'Pending', amount: 50000 },
  ],

  knowledgeArticles: [
    { id: 1, title: 'Welcome to Qiyam Business OS', category: 'Getting Started', content: 'Overview of the unified ecosystem, shared WhatsApp inbox, and visual workflow builders.', status: 'published', last_updated: 'May 28, 2024', author: 'Faris Usman', views: 1245, helpful_percent: 96 },
    { id: 2, title: 'How to Connect WhatsApp Cloud API', category: 'Getting Started', content: 'Configure Meta developer App ID, System User token, and register verified phone numbers.', status: 'published', last_updated: 'May 26, 2024', author: 'Ayesha K.', views: 2134, helpful_percent: 94 },
    { id: 3, title: 'Navigating Executive Dashboard & Real-Time Alerts', category: 'Getting Started', content: 'Monitor business revenue, technician workloads, overdue invoices, and conversion funnels.', status: 'published', last_updated: 'May 24, 2024', author: 'Tech Team', views: 1876, helpful_percent: 95 },
  ],

  metaConfig: {
    phone_number_id: '105439876543210',
    waba_id: '109876543210987',
    access_token: '',
    access_token_masked: 'EAAG...9821',
    verify_token: 'qiyam_whatsapp_secret_token_2026',
    api_version: 'v21.0',
    webhook_url: 'https://your-domain.com/api/conversations/webhook/',
    is_active: true,
    connection_status: 'connected',
    business_name: 'CoolFix Services',
    business_phone_display: '+91 98765 43210',
    quality_rating: 'GREEN (High Tier)'
  },

  templates: [
    {
      id: 1,
      name: 'service_booking_confirmed',
      category: 'Customer Updates',
      meta_category: 'UTILITY',
      status: 'Active',
      meta_status: 'APPROVED',
      quality_score: 'GREEN',
      language: 'en_US',
      usage_count: 542,
      last_updated: 'May 28, 2024',
      author: 'Ayesha K.',
      header_type: 'TEXT',
      header_text: 'Booking Confirmed - {{1}}',
      header_sample: 'CoolFix AC Services',
      body: 'Hello {{1}},\n\nYour booking for {{2}} has been confirmed for {{3}} at {{4}}.\n\nOur certified technician {{5}} will arrive at your address.\n\nTotal Estimated Amount: {{6}}.\n\nThank you for choosing CoolFix!',
      body_text: 'Hello {{1}},\n\nYour booking for {{2}} has been confirmed for {{3}} at {{4}}.\n\nOur certified technician {{5}} will arrive at your address.\n\nTotal Estimated Amount: {{6}}.\n\nThank you for choosing CoolFix!',
      body_variables: {
        '1': 'Vikram Mehta',
        '2': 'AC Deep Cleaning',
        '3': 'Tomorrow (Mon)',
        '4': '10:30 AM',
        '5': 'Ramesh Kumar',
        '6': '₹2,800'
      },
      footer_text: 'CoolFix Services • 24/7 Helpline',
      buttons: [
        { type: 'QUICK_REPLY', text: 'Reschedule' },
        { type: 'URL', text: 'Track Technician', url: 'https://coolfix.in/track/{{1}}', url_sample: 'B4821' },
        { type: 'PHONE_NUMBER', text: 'Call Technician', phone_number: '+919876543210' }
      ]
    },
    {
      id: 2,
      name: 'summer_flash_sale_2026',
      category: 'Sales & Marketing',
      meta_category: 'MARKETING',
      status: 'Active',
      meta_status: 'APPROVED',
      quality_score: 'GREEN',
      language: 'en_US',
      usage_count: 318,
      last_updated: 'May 25, 2024',
      author: 'Faris Usman',
      header_type: 'TEXT',
      header_text: '🔥 Summer Special Discount',
      body: 'Dear {{1}},\n\nBeat the heat with our 30% discount on all AC maintenance & gas refill services this week!\n\nUse coupon code at checkout before {{2}}.',
      body_text: 'Dear {{1}},\n\nBeat the heat with our 30% discount on all AC maintenance & gas refill services this week!\n\nUse coupon code at checkout before {{2}}.',
      body_variables: {
        '1': 'Valued Customer',
        '2': 'May 25, 2024'
      },
      footer_text: 'T&C Apply • Valid on first 2 units',
      buttons: [
        { type: 'COPY_CODE', text: 'Copy Coupon Code', code: 'SUMMER30' },
        { type: 'URL', text: 'Book Service Now', url: 'https://coolfix.in/book' }
      ]
    },
    {
      id: 3,
      name: 'payment_reminder_urgent',
      category: 'Notifications & Alerts',
      meta_category: 'UTILITY',
      status: 'Active',
      meta_status: 'APPROVED',
      quality_score: 'GREEN',
      language: 'en_US',
      usage_count: 298,
      last_updated: 'May 24, 2024',
      author: 'Sneha Pillai',
      header_type: 'TEXT',
      header_text: 'Payment Reminder: Invoice #{{1}}',
      header_sample: 'INV-2024-902',
      body: 'Hello {{1}},\n\nThis is a gentle reminder that payment of {{2}} for {{3}} was due on {{4}}.\n\nPlease click the button below to complete secure payment via UPI or Card.',
      body_text: 'Hello {{1}},\n\nThis is a gentle reminder that payment of {{2}} for {{3}} was due on {{4}}.\n\nPlease click the button below to complete secure payment via UPI or Card.',
      body_variables: {
        '1': 'Priya Sharma',
        '2': '₹12,500',
        '3': 'Commercial AC Maintenance',
        '4': 'May 10, 2024'
      },
      footer_text: 'Accounts Department • CoolFix',
      buttons: [
        { type: 'URL', text: 'Pay Now Securely', url: 'https://coolfix.in/pay/{{1}}', url_sample: 'INV902' },
        { type: 'QUICK_REPLY', text: 'Already Paid' }
      ]
    },
    {
      id: 4,
      name: 'otp_verification_code',
      category: 'Security & Auth',
      meta_category: 'AUTHENTICATION',
      status: 'Active',
      meta_status: 'APPROVED',
      quality_score: 'GREEN',
      language: 'en_US',
      usage_count: 412,
      last_updated: 'May 26, 2024',
      author: 'Tech Team',
      header_type: 'NONE',
      body: '{{1}} is your Qiyam Business OS verification code. For your security, do not share this code with anyone. Valid for 10 minutes.',
      body_text: '{{1}} is your Qiyam Business OS verification code. For your security, do not share this code with anyone. Valid for 10 minutes.',
      body_variables: {
        '1': '482019'
      },
      footer_text: 'Security notification',
      buttons: [
        { type: 'COPY_CODE', text: 'Copy Code', code: '482019' }
      ]
    }
  ],


  integrations: [
    { id: 1, name: 'WhatsApp Cloud API', category: 'Communication', description: 'Official Meta WhatsApp Business Cloud API with multi-agent inbox and bulk broadcast.', status: 'connected', connected_on: 'May 28, 2024', automations_enabled: 12, icon_slug: 'whatsapp' },
    { id: 2, name: 'Google Workspace', category: 'Productivity', description: 'Gmail, Drive, and Google Calendar synchronization.', status: 'connected', connected_on: 'May 28, 2024', automations_enabled: 4, icon_slug: 'google' },
    { id: 3, name: 'Slack', category: 'Communication', description: 'Team notifications, dispatch alerts, and escalation channels.', status: 'connected', connected_on: 'May 24, 2024', automations_enabled: 3, icon_slug: 'slack' },
    { id: 4, name: 'Zoho CRM', category: 'CRM', description: 'Bidirectional contact, deal, and lead synchronization.', status: 'connected', connected_on: 'May 20, 2024', automations_enabled: 2, icon_slug: 'zoho' },
    { id: 5, name: 'QuickBooks Online', category: 'Accounting & Finance', description: 'Automated ledger synchronization and invoice tax tracking.', status: 'partially_connected', connected_on: 'May 18, 2024', automations_enabled: 1, icon_slug: 'quickbooks' },
    { id: 6, name: 'Shopify', category: 'E-Commerce', description: 'E-commerce store orders, cart abandonment notifications, and catalog sync.', status: 'partially_connected', connected_on: 'May 10, 2024', automations_enabled: 2, icon_slug: 'shopify' },
    { id: 7, name: 'Razorpay', category: 'Payments', description: 'Instant UPI payment links, QR codes, and payment confirmation webhooks.', status: 'connected', connected_on: 'May 15, 2024', automations_enabled: 3, icon_slug: 'razorpay' },
  ],

  branches: [
    { id: 1, name: 'Head Office', code: 'HO-001', branch_type: 'Head Office', city: 'Kozhikode', state: 'Kerala', status: 'Active', automations_count: 32, tasks_automated: 256, last_activity: 'May 31, 2024 10:30 AM' },
    { id: 2, name: 'Kochi Branch', code: 'BR-002', branch_type: 'Regional Office', city: 'Kochi', state: 'Kerala', status: 'Active', automations_count: 24, tasks_automated: 210, last_activity: 'May 31, 2024 09:15 AM' },
    { id: 3, name: 'Bangalore Branch', code: 'BR-003', branch_type: 'Branch Office', city: 'Bangalore', state: 'Karnataka', status: 'Active', automations_count: 18, tasks_automated: 178, last_activity: 'May 31, 2024 08:45 AM' },
    { id: 4, name: 'Mumbai Branch', code: 'BR-004', branch_type: 'Branch Office', city: 'Mumbai', state: 'Maharashtra', status: 'Active', automations_count: 20, tasks_automated: 192, last_activity: 'May 31, 2024 08:20 AM' },
    { id: 5, name: 'Delhi Branch', code: 'BR-005', branch_type: 'Branch Office', city: 'New Delhi', state: 'Delhi', status: 'Inactive', automations_count: 10, tasks_automated: 68, last_activity: 'May 28, 2024 04:10 PM' },
  ],

  sendMessage: (conversationId, text, sender = 'agent') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => {
      const convs = state.conversations.map((c) => {
        if (c.id === conversationId) {
          const newMsg: WhatsAppMessage = {
            id: Date.now(),
            sender,
            senderName: sender === 'agent' ? 'Rahul Mehta' : 'AI Assistant',
            text,
            timestamp,
            status: 'delivered',
          };
          return {
            ...c,
            last_contact_date: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      });
      return { conversations: convs };
    });
  },

  simulateInboundWhatsApp: (name, phone, text) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => {
      let existingConv = state.conversations.find((c) => c.phone_number === phone);
      const userMsg: WhatsAppMessage = {
        id: Date.now(),
        sender: 'customer',
        text,
        timestamp,
        status: 'read',
      };

      // AI Intent handling & Rich booking generation
      let botReplyText = `Hello ${name}! Thank you for reaching out to CoolFix Services. How can we assist you today?`;
      let richCard = undefined;
      const lower = text.toLowerCase();

      if (lower.includes('ac') || lower.includes('service') || lower.includes('repair') || lower.includes('install')) {
        botReplyText = `Sure! I can help you with your AC inquiry. We have certified technicians available in your area tomorrow. Service charge is ₹2,800.`;
        richCard = {
          type: 'booking' as const,
          title: 'Booking Confirmed',
          date: 'May 13, 2024 (Mon)',
          time: '10:00 AM - 12:00 PM',
          service: 'AC Repair',
          amount: 2800,
          bookingId: `#B${Math.floor(1000 + Math.random() * 9000)}`,
          actionText: 'View Details',
        };
      }

      const botMsg: WhatsAppMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Qiyam AI Assistant',
        text: botReplyText,
        timestamp,
        status: 'delivered',
        richCard,
      };

      if (existingConv) {
        const updated = state.conversations.map((c) =>
          c.id === existingConv?.id
            ? {
                ...c,
                unread_count: c.unread_count + 1,
                last_contact_date: 'Just now',
                messages: [...c.messages, userMsg, botMsg],
              }
            : c
        );
        return { conversations: updated };
      } else {
        const newConv: Conversation = {
          id: Date.now(),
          contact_name: name,
          phone_number: phone,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          category: 'Lead',
          unread_count: 1,
          status: 'in_progress',
          lead_owner: 'Ramesh Kumar',
          lead_stage: 'New Lead',
          source: 'WhatsApp',
          first_contact_date: 'Just now',
          last_contact_date: 'Just now',
          location: 'Koyilandy, Kerala',
          language: 'English',
          tags: ['AC Service', 'New WhatsApp'],
          notes: `Inbound WhatsApp lead: "${text}"`,
          service_needed: 'AC Repair',
          estimated_value: 2800,
          active_workflow: 'Service Booking Flow',
          messages: [userMsg, botMsg],
        };
        return { conversations: [newConv, ...state.conversations], selectedConversationId: newConv.id };
      }
    });

    get().addToast(`New WhatsApp message from ${name}: "${text}"`, 'info');
  },

  updateLeadStage: (leadId, newStage) => {
    set((state) => ({
      leads: state.leads.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)),
    }));
    get().addToast(`Lead stage updated to "${newStage}"`, 'success');
  },

  convertLeadToDeal: (leadId) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return;

    const newDeal: Deal = {
      id: Date.now(),
      deal_name: `${lead.service} - ${lead.name}`,
      customer_name: lead.name,
      phone: lead.phone,
      email: lead.email || `${lead.name.toLowerCase().replace(' ', '')}@gmail.com`,
      amount: lead.value,
      stage: 'proposal_sent',
      probability: 65,
      deal_owner: lead.owner,
      source: lead.source,
      expected_close_date: 'May 25, 2024',
      tags: lead.tags,
      notes: lead.notes,
    };

    set((state) => ({
      deals: [newDeal, ...state.deals],
      leads: state.leads.map((l) => (l.id === leadId ? { ...l, stage: 'won' } : l)),
      isLeadDrawerOpen: false,
    }));
    get().addToast(`Converted lead "${lead.name}" to Deal (₹${lead.value})!`, 'success');
  },

  updateJobStatus: (jobId, status) => {
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, status } : j)),
    }));
    get().addToast(`Job status updated to "${status}"`, 'success');
  },

  updateApprovalStatus: (approvalId, status) => {
    set((state) => ({
      approvals: state.approvals.map((a) => (a.id === approvalId ? { ...a, status } : a)),
    }));
    get().addToast(`Request ${status === 'Approved' ? 'approved' : 'rejected'} successfully`, status === 'Approved' ? 'success' : 'warning');
  },

  toggleTaskChecklist: (taskId, checklistId) => {
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: t.checklist.map((c) => (c.id === checklistId ? { ...c, completed: !c.completed } : c)),
          };
        }
        return t;
      }),
    }));
  },

  clockInEmployee: (employeeId) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      employees: state.employees.map((e) => (e.id === employeeId ? { ...e, status: 'on_duty' } : e)),
      attendance: state.attendance.map((a) => (a.id === employeeId ? { ...a, check_in: `${timeStr} (On time)`, status: 'present' } : a)),
    }));
    get().addToast('Attendance check-in logged successfully', 'success');
  },

  saveWorkflowNodes: (workflowId, nodes) => {
    set((state) => ({
      workflows: state.workflows.map((w) => (w.id === workflowId ? { ...w, nodes, last_modified: 'Just now' } : w)),
    }));
    get().addToast('Workflow changes saved & activated!', 'success');
  },

  runWorkflowTest: (workflowId, inputMessage) => {
    const steps = [
      `Trigger: Inbound WhatsApp message received "${inputMessage}"`,
      `AI Agent: Extracted intent -> Service Booking (AC Repair), Location -> Koyilandy`,
      `CRM: Created/Updated Lead for +91 98765 43210 (Amit Verma)`,
      `Condition: Location check passed (Koyilandy in coverage zone)`,
      `Action: Sent WhatsApp availability confirmation & advance payment link`,
      `Action: Assigned nearest technician (Amit Sharma, EMP-001)`,
    ];

    const logEntry: AutomationLog = {
      id: Date.now(),
      time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      workflow_action: 'Service Booking Flow',
      branch: 'Head Office',
      status: 'success',
      logLevel: 'Info',
      message: `Workflow test completed successfully for: "${inputMessage}"`,
      triggered_by: 'User (Test)',
      duration: '0.78s',
    };

    set((state) => ({
      workflowLogs: [logEntry, ...state.workflowLogs],
    }));

    get().addToast('Workflow test executed successfully (0.78s)!', 'success');
    return { steps, duration: '0.78s' };
  },

  loadInitialData: async () => {
    try {
      const [threadsRes, tmplRes, cfgRes] = await Promise.all([
        apiClient.get('/conversations/threads/'),
        apiClient.get('/conversations/templates/'),
        apiClient.get('/conversations/meta-config/')
      ]);
      if (threadsRes && Array.isArray(threadsRes) && threadsRes.length > 0) {
        set({ conversations: threadsRes });
      }
      if (tmplRes && Array.isArray(tmplRes) && tmplRes.length > 0) {
        set({ templates: tmplRes });
      }
      if (cfgRes) {
        set({ metaConfig: cfgRes });
      }
    } catch (e) {
      console.warn('Backend offline, using store initial state:', e);
    }
  },

  sendTemplateMessage: async (conversationId, templateId, variables) => {
    const template = get().templates.find(t => String(t.id) === String(templateId));
    let rendered = template ? (template.body_text || template.body) : '';
    Object.keys(variables).forEach(k => {
      rendered = rendered.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), variables[k]);
    });

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => {
      const convs = state.conversations.map((c) => {
        if (c.id === conversationId) {
          const newMsg: WhatsAppMessage = {
            id: Date.now(),
            sender: 'agent',
            senderName: 'Rahul Mehta (Template)',
            text: rendered,
            timestamp,
            status: 'sent',
          };
          return {
            ...c,
            last_contact_date: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      });
      return { conversations: convs };
    });

    get().addToast('WhatsApp template message dispatched!', 'success');
    await apiClient.post(`/conversations/threads/${conversationId}/send_template/`, { template_id: templateId, variables });
  },

  saveMetaTemplate: async (templateData) => {
    const isNew = !templateData.id;
    let saved: any = null;
    if (isNew) {
      saved = await apiClient.post('/conversations/templates/', templateData);
    } else {
      saved = await apiClient.put(`/conversations/templates/${templateData.id}/`, templateData);
    }

    if (saved && saved.id) {
      set((state) => {
        const exists = state.templates.some(t => t.id === saved.id);
        const updated = exists
          ? state.templates.map(t => t.id === saved.id ? saved : t)
          : [saved, ...state.templates];
        return { templates: updated };
      });
      return saved;
    } else {
      // Local fallback
      const localTemplate: WhatsAppTemplateItem = {
        id: templateData.id || Date.now(),
        name: templateData.name || 'custom_template',
        category: templateData.category || 'Customer Updates',
        meta_category: templateData.meta_category || 'UTILITY',
        status: templateData.status || 'Active',
        meta_status: templateData.meta_status || 'DRAFT',
        quality_score: 'GREEN',
        language: templateData.language || 'en_US',
        usage_count: templateData.usage_count || 0,
        last_updated: 'Just now',
        author: 'Qiyam Admin',
        body: templateData.body_text || templateData.body || '',
        body_text: templateData.body_text || templateData.body || '',
        body_variables: templateData.body_variables || {},
        header_type: templateData.header_type || 'NONE',
        header_text: templateData.header_text || '',
        header_sample: templateData.header_sample || '',
        header_url: templateData.header_url || '',
        footer_text: templateData.footer_text || '',
        buttons: templateData.buttons || [],
      };
      set((state) => {
        const exists = state.templates.some(t => t.id === localTemplate.id);
        const updated = exists
          ? state.templates.map(t => t.id === localTemplate.id ? localTemplate : t)
          : [localTemplate, ...state.templates];
        return { templates: updated };
      });
      return localTemplate;
    }
  },

  submitTemplateToMeta: async (templateId) => {
    const res = await apiClient.post(`/conversations/templates/${templateId}/submit_to_meta/`, {});
    if (res && res.template) {
      set((state) => ({
        templates: state.templates.map(t => t.id === templateId ? res.template : t)
      }));
      return true;
    } else {
      set((state) => ({
        templates: state.templates.map(t => t.id === templateId ? { ...t, meta_status: 'PENDING' } : t)
      }));
      return true;
    }
  },

  syncTemplatesWithMeta: async () => {
    const res = await apiClient.post('/conversations/templates/sync_meta/', {});
    if (res && res.templates) {
      set({ templates: res.templates });
    }
  },

  testSendTemplate: async (templateId, phone, variables) => {
    const res = await apiClient.post(`/conversations/templates/${templateId}/test_send/`, { phone_number: phone, variables });
    if (!res || res.status === 'error' || res.success === false || res.error) {
      return { success: false, error: res?.error || 'Failed to send template message via Meta' };
    }
    return { success: true, message: res.message || 'Template message delivered!' };
  },

  deleteMetaTemplate: async (templateId) => {
    await apiClient.delete(`/conversations/templates/${templateId}/`);
    set((state) => ({
      templates: state.templates.filter(t => t.id !== templateId)
    }));
    return true;
  },

  saveMetaConfig: async (configData) => {
    const res = await apiClient.post('/conversations/meta-config/', configData);
    if (res && res.config) {
      set({ metaConfig: res.config });
    } else {
      set((state) => ({
        metaConfig: { ...(state.metaConfig || {} as any), ...configData }
      }));
    }
    return true;
  },

  testMetaConnection: async (credentials) => {
    const res = await apiClient.post('/conversations/meta-config/test_connection/', credentials);
    if (res && res.success) {
      set((state) => ({
        metaConfig: state.metaConfig ? {
          ...state.metaConfig,
          connection_status: 'connected',
          business_name: res.phone_details?.verified_name || state.metaConfig.business_name,
          business_phone_display: res.phone_details?.display_phone_number || state.metaConfig.business_phone_display,
          quality_rating: res.phone_details?.quality_rating || state.metaConfig.quality_rating
        } : null
      }));
    }
    return res;
  },
}));


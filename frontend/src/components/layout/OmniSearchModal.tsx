import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Search, X, ArrowRight, MessageSquare, User, Briefcase, FileText,
  Users, Package, Zap, ChevronRight, Navigation, LayoutDashboard,
  Calendar, CheckCircle2, Clock, Building2, ReceiptText, ShieldCheck,
  IndianRupee, Globe, Send, BookOpen, Layers, Ban, UserCheck,
  CreditCard, Wallet, BarChart3, Bot, Sparkles, Settings as SettingsIcon,
  Database, Puzzle, Award, FileCheck, CheckSquare, Plus, GitBranch,
  ShieldAlert, CornerDownLeft, Sparkle
} from 'lucide-react';
import { TabType } from '@/types';

interface OmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SearchFilter = 'all' | 'pages' | 'crm' | 'ops' | 'finance';

interface SystemPageItem {
  tab: TabType;
  title: string;
  subtitle: string;
  category: 'Main' | 'Messenger' | 'CRM' | 'Operations' | 'Finance' | 'Automation' | 'AI Assistant' | 'Intelligence' | 'Settings';
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
}

const ALL_SYSTEM_PAGES: SystemPageItem[] = [
  // Operations & HR
  { tab: 'ops-emp-leaves', title: 'Leave Management', subtitle: 'Operations • Leave requests, approvals, balance ledger & holiday calendar', category: 'Operations', icon: Calendar, keywords: 'leave management leaves time off holidays sick leave casual leave vacation paid leave approval balance hr ops-emp-leaves' },
  { tab: 'ops-emp-attendance', title: 'Attendance & Work Hours', subtitle: 'Operations • Daily shift duty hours, punch-in logs, check-outs & work time tracker', category: 'Operations', icon: Clock, keywords: 'attendance work hours punch in check in check out shift hours daily duty' },
  { tab: 'ops-attendance', title: 'Attendance Ledger', subtitle: 'Operations • Geofenced attendance check-ins, late markings & presence roster', category: 'Operations', icon: Clock, keywords: 'check-in check-out hours leaves presence geo punch' },
  { tab: 'ops-employees', title: 'Employee Management', subtitle: 'Operations • Staff team roster, agent profiles, technicians & HR hub', category: 'Operations', icon: Users, keywords: 'staff team agents workers roster hr employees' },
  { tab: 'ops-emp-directory', title: 'Employee Directory', subtitle: 'Operations • Full staff phone directory, employee ID cards & team contacts', category: 'Operations', icon: Users, keywords: 'employee directory staff team members roster list phone contacts' },
  { tab: 'ops-emp-profiles', title: 'Employee Profiles', subtitle: 'Operations • Staff profile details, emergency contacts, photos & identity verification', category: 'Operations', icon: User, keywords: 'employee profile id card staff details emergency contact photo' },
  { tab: 'ops-emp-breaks', title: 'Work Breaks & Alerts', subtitle: 'Operations • Tea breaks, lunch pause timers, break compliance & duty alert triggers', category: 'Operations', icon: Clock, keywords: 'work breaks alerts tea break lunch break reminder pause duty' },
  { tab: 'ops-emp-performance', title: 'Performance & Reviews', subtitle: 'Operations • Technician star ratings, customer review scores, staff KPIs & reviews', category: 'Operations', icon: Award, keywords: 'performance reviews ratings customer feedback staff score star rating' },
  { tab: 'ops-emp-productivity', title: 'Goals & Productivity', subtitle: 'Operations • Monthly technician targets, daily job quotas, work speed & productivity', category: 'Operations', icon: Briefcase, keywords: 'goals productivity monthly targets daily target quota work speed output' },
  { tab: 'ops-emp-rewards', title: 'Rewards & Perks', subtitle: 'Operations • Staff incentives, festival bonuses, fuel perks & star worker rewards', category: 'Operations', icon: Sparkles, keywords: 'rewards perks bonuses diwali eid incentive fuel allowance gift star worker' },
  { tab: 'ops-emp-vouchers', title: 'Voucher Claims', subtitle: 'Operations • Fuel expense claims, tool purchases, bill reimbursements & receipts', category: 'Operations', icon: ReceiptText, keywords: 'voucher claims petrol bill diesel tool expense reimbursement refund' },
  { tab: 'ops-emp-overtime', title: 'Extra Work / Overtime', subtitle: 'Operations • Overtime duty hours, OT payout calculation, extra shifts & rates', category: 'Operations', icon: Clock, keywords: 'extra work overtime ot hours extra pay duty rate payout calculation' },
  { tab: 'ops-emp-onboarding', title: 'Onboarding & Documents', subtitle: 'Operations • Joining letters, Aadhaar, PAN card, driving license verification', category: 'Operations', icon: FileCheck, keywords: 'onboarding documents aadhaar pan card driving license verification joining letter' },
  { tab: 'ops-jobs', title: 'Jobs & Work Orders', subtitle: 'Operations • Field service tickets, technician assignment & job card tracking', category: 'Operations', icon: Briefcase, keywords: 'work orders field service tickets assignment jobs tasks dispatch' },
  { tab: 'ops-appointments', title: 'Appointments Calendar', subtitle: 'Operations • Customer service booking slots, technician calendar & advance collections', category: 'Operations', icon: Calendar, keywords: 'bookings customer visits scheduled meetings calendar appointments' },
  { tab: 'ops-schedule', title: 'Schedule & Roster', subtitle: 'Operations • Weekly timetable, shift roster planning & dispatch calendar', category: 'Operations', icon: Calendar, keywords: 'roster shifts dispatch planning timetable schedule' },
  { tab: 'ops-routes', title: 'Route Optimization', subtitle: 'Operations • AI GPS dispatch routes, multi-stop technician navigation & travel efficiency', category: 'Operations', icon: Navigation, keywords: 'gps dispatch map delivery logistics navigation route stops ai route' },
  { tab: 'ops-inventory', title: 'Inventory & Spare Parts', subtitle: 'Operations • Stock levels, SKU catalog, reorder alerts & parts warehouse', category: 'Operations', icon: Package, keywords: 'stock warehouse products spare parts items inventory sku' },
  { tab: 'ops-tasks', title: 'Tasks & Checklists', subtitle: 'Operations • Action checklists, task assignments & operational to-dos', category: 'Operations', icon: CheckSquare, keywords: 'to-do assignments checklists todo tasks' },

  // Finance & Payroll
  { tab: 'finance-payroll', title: 'Payroll & Salary Wizard', subtitle: 'Finance • Run Payroll Wizard, salary payslips, quick adjust, statutory tax, TDS, PF, ESI', category: 'Finance', icon: CreditCard, keywords: 'payroll salary payslip wages reimbursements deductions compliance tax tds pf esi off-cycle structures statutory run payroll wizard quick adjust' },
  { tab: 'finance-overview', title: 'Finance Overview', subtitle: 'Finance • Revenue ledger, cash flow trends, gross margins & financial balance', category: 'Finance', icon: IndianRupee, keywords: 'revenue profit cash flow ledger balance finance overview' },
  { tab: 'finance-invoices', title: 'Invoices & Billing', subtitle: 'Finance • GST tax statements, itemized invoices, receivables & PDF receipts', category: 'Finance', icon: FileText, keywords: 'billing tax gst statements pdf receivables invoices payment collection' },
  { tab: 'finance-quotations', title: 'Quotations & Estimates', subtitle: 'Finance • Price estimates, commercial proposals, quotation PDF & invoice conversion', category: 'Finance', icon: FileCheck, keywords: 'quotations estimates quotes proposals pricing convert invoice' },
  { tab: 'finance-expenses', title: 'Expenses & Receipts', subtitle: 'Finance • Operational disbursements, vendor bills, spending records & receipts', category: 'Finance', icon: CreditCard, keywords: 'bills receipts disbursements spending expenses finance' },
  { tab: 'finance-transactions', title: 'Transactions Ledger', subtitle: 'Finance • Bank entries, payment records, debit/credit log & settlement history', category: 'Finance', icon: ReceiptText, keywords: 'payments bank entries debits credits log transactions' },
  { tab: 'finance-payments', title: 'Payments & Collections', subtitle: 'Finance • UPI payment links, gateway settlements, advance deposits & collections', category: 'Finance', icon: Wallet, keywords: 'collections payout gateway settlement upi payments' },
  { tab: 'finance-accounts', title: 'Chart of Accounts', subtitle: 'Finance • General ledger, account codes, assets, liabilities, equity & banks', category: 'Finance', icon: Layers, keywords: 'banking general ledger assets liabilities accounts chart' },
  { tab: 'finance-reports', title: 'Financial Reports', subtitle: 'Finance • Profit & Loss (P&L), balance sheet, trial balance & tax statements', category: 'Finance', icon: BarChart3, keywords: 'p&l balance sheet cash statement financial reports' },
  { tab: 'finance-budget', title: 'Budget Planning', subtitle: 'Finance • Quarterly financial allocation, departmental budgets & forecast limits', category: 'Finance', icon: IndianRupee, keywords: 'forecast limits quarterly targets allocation budget planning' },

  // CRM & Conversations
  { tab: 'conversations', title: 'WhatsApp Live Chat', subtitle: 'Messenger • Multi-agent WhatsApp inbox, real-time messaging & customer support', category: 'Messenger', icon: MessageSquare, keywords: 'chats messages inbox whatsapp live customer conversations support' },
  { tab: 'crm-leads', title: 'Leads Pipeline', subtitle: 'CRM • Inbound WhatsApp prospects, qualification stages & conversion funnel', category: 'CRM', icon: UserCheck, keywords: 'prospects pipeline inquiries conversion funnel leads crm' },
  { tab: 'crm-customers', title: 'Customer Directory', subtitle: 'CRM • Client directory, purchase history, profiles & lifetime value', category: 'CRM', icon: Users, keywords: 'clients directory accounts profiles customers crm' },
  { tab: 'crm-deals', title: 'Pipeline Deals', subtitle: 'CRM • Revenue opportunities, sales deal stages & revenue forecast', category: 'CRM', icon: IndianRupee, keywords: 'stages revenue opportunities sales forecast deals pipeline' },
  { tab: 'crm-followups', title: 'Follow-ups & Reminders', subtitle: 'CRM • Scheduled reminder calls, pending customer tasks & touchpoints', category: 'CRM', icon: Clock, keywords: 'reminders scheduled calls pending tasks followups crm' },

  // Bulk Messaging
  { tab: 'bulk-overview', title: 'Bulk Campaign Analytics', subtitle: 'Messenger • Broadcast delivery stats, open rates, click-through & engagement KPIs', category: 'Messenger', icon: BarChart3, keywords: 'broadcast dashboard stats metrics analytics reach bulk overview' },
  { tab: 'bulk-send', title: 'Send Bulk Message', subtitle: 'Messenger • Broadcast mass marketing campaigns, targeted blasts & audience dispatch', category: 'Messenger', icon: Send, keywords: 'broadcast mass marketing campaigns blast dispatch bulk send' },
  { tab: 'bulk-templates', title: 'Message Templates', subtitle: 'Messenger • Meta approved WhatsApp templates, media buttons & quick replies', category: 'Messenger', icon: BookOpen, keywords: 'meta templates approved quick replies bulk templates whatsapp' },
  { tab: 'bulk-campaigns', title: 'Campaign History', subtitle: 'Messenger • Past broadcast campaigns, sent logs, delivery tracking & status', category: 'Messenger', icon: Layers, keywords: 'broadcast analytics sent delivered open rates bulk campaigns' },
  { tab: 'bulk-recipients', title: 'Recipient Lists', subtitle: 'Messenger • Audience segmentation, contact groups, custom tags & filters', category: 'Messenger', icon: Users, keywords: 'contacts audience segments groups tags bulk recipients' },
  { tab: 'bulk-suppression', title: 'Blocked Contacts & Opt-outs', subtitle: 'Messenger • DND lists, opt-out compliance, stop keyword suppression & blacklists', category: 'Messenger', icon: Ban, keywords: 'blocked contacts opt-out stop unsubscribe dnd suppression compliance blacklisted' },
  { tab: 'bulk-scheduled', title: 'Scheduled Messages', subtitle: 'Messenger • Timed future automated broadcasts, recurring queues & dispatch calendar', category: 'Messenger', icon: Clock, keywords: 'timed future automated queue calendar bulk scheduled' },

  // Automation & Workflows
  { tab: 'automation-builder', title: 'Workflow Builder', subtitle: 'Automation • Visual drag-and-drop bot flow canvas, trigger nodes & action sequences', category: 'Automation', icon: Zap, keywords: 'no-code visual trigger node action flow automation builder' },
  { tab: 'automation-workflows', title: 'Active Workflows', subtitle: 'Automation • Automated rules, sequence triggers, auto-responders & WhatsApp bots', category: 'Automation', icon: GitBranch, keywords: 'active rules automated sequences triggers automation workflows' },
  { tab: 'automation-templates', title: 'Automation Templates', subtitle: 'Automation • Pre-built bot flow recipes, customer support blueprints & auto-replies', category: 'Automation', icon: BookOpen, keywords: 'bot flows auto-reply recipes blueprints automation templates' },
  { tab: 'automation-approvals', title: 'Approvals & Sign-offs', subtitle: 'Automation • Pending purchase orders, expense releases, employee leaves & authorizations', category: 'Automation', icon: ShieldCheck, keywords: 'authorization sign-off purchase orders leave requests approvals' },
  { tab: 'automation-logs', title: 'Automation Logs', subtitle: 'Automation • Real-time trigger history, automation execution audits & debug traces', category: 'Automation', icon: Clock, keywords: 'execution history audit debug runs automation logs' },

  // AI Assistant & Intelligence
  { tab: 'ai-overview', title: 'AI Copilot Overview', subtitle: 'AI Assistant • Conversational AI engine, autonomous agent actions & copilot insights', category: 'AI Assistant', icon: Bot, keywords: 'smart bot copilot suggestions intelligence ai overview' },
  { tab: 'ai-knowledgebase', title: 'Knowledge Base (RAG)', subtitle: 'AI Assistant • Internal training articles, RAG document repository & business FAQ', category: 'AI Assistant', icon: BookOpen, keywords: 'rag articles documentation training articles knowledge base faq' },
  { tab: 'ai-templates', title: 'AI Prompt Templates', subtitle: 'AI Assistant • System prompts, instruction tuning, response style guidelines & recipes', category: 'AI Assistant', icon: Layers, keywords: 'prompts system message tuning instructions ai templates' },
  { tab: 'template-hub', title: 'Template Hub', subtitle: 'AI Assistant • Curated marketplace for WhatsApp automations, prompt cards & flows', category: 'AI Assistant', icon: Sparkles, keywords: 'marketplace pre-built community templates template hub' },
  { tab: 'ai-settings', title: 'AI Engine Settings', subtitle: 'AI Assistant • LLM model selection, temperature tuning, max tokens & provider keys', category: 'AI Assistant', icon: SettingsIcon, keywords: 'model temperature tokens provider config ai settings' },
  { tab: 'analytics', title: 'Executive Analytics', subtitle: 'Intelligence • Executive reporting, revenue analytics, customer retention & operational KPIs', category: 'Intelligence', icon: BarChart3, keywords: 'reports bi performance trends kpi metrics analytics' },

  // Core Management & Settings
  { tab: 'dashboard', title: 'Dashboard', subtitle: 'Main • System overview, revenue numbers, job status & real-time activity metrics', category: 'Main', icon: LayoutDashboard, keywords: 'home overview analytics metrics dashboard' },
  { tab: 'branches', title: 'Branch Management', subtitle: 'Main • Multi-branch locations (Calicut, Kochi, Malappuram, Wayanad) & managers', category: 'Main', icon: Building2, keywords: 'locations outlets offices stores calicut kochi branches' },
  { tab: 'integrations', title: 'Integrations & Webhooks', subtitle: 'Settings • Meta Cloud API, webhook endpoints, REST API credentials & connectors', category: 'Settings', icon: Puzzle, keywords: 'webhooks crm zapier apps rest api meta integrations' },
  { tab: 'settings', title: 'Workspace Settings', subtitle: 'Settings • Company branding, business profile, default currency & business timezone', category: 'Settings', icon: SettingsIcon, keywords: 'workspace general preferences business brand organization profile settings' },
  { tab: 'settings-backup', title: 'Data Backup & Restore', subtitle: 'Settings • Automated database backups, manual JSON snapshots, restore & recovery', category: 'Settings', icon: Database, keywords: 'backup restore data auto-backup last backup import export snapshot database disaster recovery postgresql sqlite' },
  { tab: 'settings-whatsapp', title: 'WhatsApp Cloud API Config', subtitle: 'Settings • Meta Business phone numbers, webhook verification token & access keys', category: 'Settings', icon: MessageSquare, keywords: 'whatsapp cloud api meta configuration webhook token access settings' },
  { tab: 'roles', title: 'Roles & Security (RBAC)', subtitle: 'Settings • RBAC security permissions matrix, user role assignments & access control', category: 'Settings', icon: ShieldCheck, keywords: 'roles permissions rbac security access control admin users matrix privileges superadmin' },
  { tab: 'landing', title: 'Landing Showcase', subtitle: 'Main • Public landing page, features showcase & customer portal', category: 'Main', icon: Globe, keywords: 'landing website marketing showcase public portal' },
];

// Sample leave requests index for deep search
const SAMPLE_LEAVE_SEARCH_DATA = [
  { id: 1, employee: 'Neha Patel', role: 'Housekeeping Lead', type: 'Sick Leave (SL)', days: '2 days', dates: 'May 31 - Jun 01', reason: 'Severe fever and doctor advised rest', status: 'Approved' },
  { id: 2, employee: 'Rahul Singh', role: 'Plumbing Technician', type: 'Casual Leave (CL)', days: '2 days', dates: 'Jun 03 - Jun 04', reason: 'Family wedding function in native village', status: 'Pending' },
  { id: 3, employee: 'Arjun Nair', role: 'Electrician', type: 'Emergency Leave', days: '1 day', dates: 'Jun 05 - Jun 05', reason: 'Urgent home electricity repair and family work', status: 'Pending' },
  { id: 4, employee: 'Priya Sharma', role: 'AC Senior Technician', type: 'Earned Leave', days: '3 days', dates: 'Jun 10 - Jun 12', reason: 'Annual family vacation leave', status: 'Pending' },
];

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Pages' | 'CRM' | 'Operations' | 'Finance' | 'Automation' | 'AI' | 'Settings';
  typeBadge: string;
  typeBadgeColor: string;
  icon: React.ReactNode;
  score: number;
  onClick: () => void;
}

export const OmniSearchModal: React.FC<OmniSearchModalProps> = ({ isOpen, onClose }) => {
  const store = useQiyamStore();
  const {
    conversations,
    leads,
    deals,
    jobs,
    invoices,
    quotations,
    employees,
    inventory,
    appointments,
    tasks,
    expenses,
    transactions,
    branches,
    followups,
    approvals,
    knowledgeArticles,
    templates,
    setActiveTab,
    setTargetHighlightId,
    setSelectedConversationId,
    setSelectedLead,
    setIsLeadDrawerOpen,
    addToast,
  } = store;

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Keyboard navigation: Escape, ArrowUp, ArrowDown, Enter, Tab
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredResults.length ? prev + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
          filteredResults[selectedIndex].onClick();
        }
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const filters: SearchFilter[] = ['all', 'pages', 'crm', 'ops', 'finance'];
        const currentIdx = filters.indexOf(activeFilter);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + filters.length) % filters.length
          : (currentIdx + 1) % filters.length;
        setActiveFilter(filters[nextIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, activeFilter, onClose]);

  // Auto-scroll the selected element into view
  useEffect(() => {
    if (!resultsListRef.current) return;
    const selectedEl = resultsListRef.current.querySelector('[data-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const q = query.toLowerCase().trim();
  const tokens = useMemo(() => q.split(/\s+/).filter(Boolean), [q]);

  // Calculate match score
  const calculateScore = (title: string, subtitle: string, keywords: string = ''): number => {
    if (!q) return 0;
    const lowerTitle = title.toLowerCase();
    const lowerSubtitle = subtitle.toLowerCase();
    const lowerKeywords = keywords.toLowerCase();

    // 1. Exact match on title
    if (lowerTitle === q) return 300;

    // 2. Title starts with query
    if (lowerTitle.startsWith(q)) return 220;

    // 3. Title contains full query
    if (lowerTitle.includes(q)) return 160;

    // 4. Keywords contain full query
    if (lowerKeywords.includes(q)) return 120;

    // 5. Token match scoring
    let score = 0;
    let allTokensMatched = true;

    for (const token of tokens) {
      if (lowerTitle.includes(token)) {
        score += 40;
      } else if (lowerKeywords.includes(token)) {
        score += 25;
      } else if (lowerSubtitle.includes(token)) {
        score += 15;
      } else {
        allTokensMatched = false;
      }
    }

    if (allTokensMatched && tokens.length > 1) {
      score += 80;
    }

    return score;
  };

  // Compile all search results
  const allResults = useMemo((): SearchResultItem[] => {
    if (!q) return [];

    const items: SearchResultItem[] = [];

    // 1. Search ALL System Pages & Modules (e.g. Leave Management, Payroll, Attendance, Settings)
    ALL_SYSTEM_PAGES.forEach((page) => {
      const score = calculateScore(page.title, page.subtitle, page.keywords);
      if (score > 0) {
        const PageIcon = page.icon;
        items.push({
          id: `page-${page.tab}`,
          title: page.title,
          subtitle: page.subtitle,
          category: 'Pages',
          typeBadge: 'Page',
          typeBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <PageIcon className="w-4 h-4 text-emerald-600" />,
          score: score + 50, // Prioritize direct page navigation
          onClick: () => {
            setActiveTab(page.tab);
            onClose();
            addToast(`Opened ${page.title}`, 'info');
          },
        });
      }
    });

    // 2. Search Leave Requests (specifically requested by user)
    SAMPLE_LEAVE_SEARCH_DATA.forEach((leave) => {
      const textToSearch = `${leave.employee} ${leave.role} ${leave.type} ${leave.reason} ${leave.status} leave management`;
      const score = calculateScore(`Leave: ${leave.employee}`, `${leave.type} • ${leave.days}`, textToSearch);
      if (score > 0) {
        items.push({
          id: `leave-${leave.id}`,
          title: `${leave.employee} (${leave.role})`,
          subtitle: `${leave.type} • ${leave.days} (${leave.dates}) • Status: ${leave.status}`,
          category: 'Operations',
          typeBadge: 'Leave',
          typeBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <Calendar className="w-4 h-4 text-rose-600" />,
          score: score + 40,
          onClick: () => {
            setActiveTab('ops-emp-leaves');
            onClose();
            addToast(`Viewing leave request for ${leave.employee}`, 'info');
          },
        });
      }
    });

    // 3. Search CRM Leads
    leads.forEach((l) => {
      const score = calculateScore(l.name, `${l.service} ${l.location}`, `${l.phone} ${l.stage}`);
      if (score > 0) {
        items.push({
          id: `lead-${l.id}`,
          title: l.name,
          subtitle: `${l.service} • ₹${l.value.toLocaleString()} • ${l.location || 'Direct Lead'} • ${l.stage.toUpperCase()}`,
          category: 'CRM',
          typeBadge: 'Lead',
          typeBadgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <User className="w-4 h-4 text-blue-600" />,
          score,
          onClick: () => {
            setSelectedLead(l);
            setIsLeadDrawerOpen(true);
            setTargetHighlightId(l.id);
            setActiveTab('crm-leads');
            onClose();
            addToast(`Showing lead: ${l.name}`, 'info');
          },
        });
      }
    });

    // 4. Search WhatsApp Live Chats
    conversations.forEach((c) => {
      const score = calculateScore(c.contact_name, c.phone_number, `${c.service_needed || ''} ${c.unread_count || ''}`);
      if (score > 0) {
        items.push({
          id: `conv-${c.id}`,
          title: c.contact_name,
          subtitle: `${c.phone_number} • ${c.service_needed || 'WhatsApp Inquiry'}`,
          category: 'CRM',
          typeBadge: 'Chat',
          typeBadgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: <MessageSquare className="w-4 h-4 text-teal-600" />,
          score,
          onClick: () => {
            setSelectedConversationId(c.id);
            setActiveTab('conversations');
            onClose();
            addToast(`Opened conversation with ${c.contact_name}`, 'info');
          },
        });
      }
    });

    // 5. Search CRM Deals
    deals.forEach((d) => {
      const score = calculateScore(d.deal_name, d.customer_name, `${d.stage} ${d.amount}`);
      if (score > 0) {
        items.push({
          id: `deal-${d.id}`,
          title: d.deal_name,
          subtitle: `${d.customer_name} • ₹${d.amount.toLocaleString()} • Stage: ${d.stage.toUpperCase()}`,
          category: 'CRM',
          typeBadge: 'Deal',
          typeBadgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <Briefcase className="w-4 h-4 text-indigo-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(d.id);
            setActiveTab('crm-deals');
            onClose();
            addToast(`Showing deal: ${d.deal_name}`, 'info');
          },
        });
      }
    });

    // 6. Search Operations Jobs
    jobs.forEach((j) => {
      const score = calculateScore(`${j.job_id_str} — ${j.customer_name}`, j.service, `${j.status} ${j.assigned_to}`);
      if (score > 0) {
        items.push({
          id: `job-${j.id}`,
          title: `${j.job_id_str} — ${j.customer_name}`,
          subtitle: `${j.service} • Assigned: ${j.assigned_to} • Status: ${j.status.toUpperCase()}`,
          category: 'Operations',
          typeBadge: 'Job',
          typeBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Briefcase className="w-4 h-4 text-amber-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(j.job_id_str || j.id);
            setActiveTab('ops-jobs');
            onClose();
            addToast(`Selected job ${j.job_id_str}`, 'info');
          },
        });
      }
    });

    // 7. Search Employees / Staff
    employees.forEach((e) => {
      const score = calculateScore(e.name, `${e.employee_id_str} • ${e.role}`, `${e.department} ${e.status} ${e.phone}`);
      if (score > 0) {
        items.push({
          id: `emp-${e.id}`,
          title: e.name,
          subtitle: `${e.employee_id_str} • ${e.role} • ${e.department || 'Operations'} • ${e.status}`,
          category: 'Operations',
          typeBadge: 'Staff',
          typeBadgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: <Users className="w-4 h-4 text-teal-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(e.id);
            setActiveTab('ops-employees');
            onClose();
            addToast(`Viewing staff profile: ${e.name}`, 'info');
          },
        });
      }
    });

    // 8. Search Invoices
    invoices.forEach((inv) => {
      const score = calculateScore(`${inv.invoice_number} — ${inv.customer_name}`, `₹${inv.amount}`, `${inv.status} ${inv.due_date}`);
      if (score > 0) {
        items.push({
          id: `inv-${inv.id}`,
          title: `${inv.invoice_number} — ${inv.customer_name}`,
          subtitle: `₹${inv.amount.toLocaleString()} • Status: ${inv.status.toUpperCase()} • Due: ${inv.due_date}`,
          category: 'Finance',
          typeBadge: 'Invoice',
          typeBadgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <FileText className="w-4 h-4 text-purple-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(inv.invoice_number || inv.id);
            setActiveTab('finance-invoices');
            onClose();
            addToast(`Viewing invoice ${inv.invoice_number}`, 'info');
          },
        });
      }
    });

    // 9. Search Quotations
    (quotations || []).forEach((qItem) => {
      const score = calculateScore(`${qItem.quotation_number} — ${qItem.customer_name}`, `₹${qItem.amount}`, `${qItem.status}`);
      if (score > 0) {
        items.push({
          id: `quo-${qItem.id}`,
          title: `${qItem.quotation_number} — ${qItem.customer_name}`,
          subtitle: `₹${qItem.amount.toLocaleString()} • Status: ${qItem.status.toUpperCase()}`,
          category: 'Finance',
          typeBadge: 'Quote',
          typeBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <FileCheck className="w-4 h-4 text-emerald-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(qItem.quotation_number || qItem.id);
            setActiveTab('finance-quotations');
            onClose();
            addToast(`Viewing quotation ${qItem.quotation_number}`, 'info');
          },
        });
      }
    });

    // 10. Search Appointments
    appointments.forEach((a) => {
      const score = calculateScore(`${a.apt_id_str || `APT-${a.id}`} — ${a.customer_name}`, a.service, `${a.date_str} ${a.time_str} ${a.employee}`);
      if (score > 0) {
        items.push({
          id: `apt-${a.id}`,
          title: `${a.apt_id_str || `APT-${a.id}`} — ${a.customer_name}`,
          subtitle: `${a.service} • ${a.date_str} at ${a.time_str} • Technician: ${a.employee}`,
          category: 'Operations',
          typeBadge: 'Appointment',
          typeBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <Calendar className="w-4 h-4 text-rose-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(a.id);
            setActiveTab('ops-appointments');
            onClose();
            addToast(`Viewing appointment for ${a.customer_name}`, 'info');
          },
        });
      }
    });

    // 11. Search Inventory SKUs
    inventory.forEach((item) => {
      const score = calculateScore(item.name, item.sku, `${item.stock_units} ${item.category || ''}`);
      if (score > 0) {
        items.push({
          id: `sku-${item.id}`,
          title: item.name,
          subtitle: `SKU: ${item.sku} • Stock: ${item.stock_units} units • Value: ₹${item.stock_value.toLocaleString()}`,
          category: 'Operations',
          typeBadge: 'SKU',
          typeBadgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Package className="w-4 h-4 text-slate-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(item.sku || item.id);
            setActiveTab('ops-inventory');
            onClose();
            addToast(`Selected SKU: ${item.name}`, 'info');
          },
        });
      }
    });

    // 12. Search Expenses & Transactions
    expenses.forEach((exp) => {
      const score = calculateScore(exp.description, exp.vendor, `${exp.category} ${exp.amount}`);
      if (score > 0) {
        items.push({
          id: `exp-${exp.id}`,
          title: exp.description,
          subtitle: `₹${exp.amount.toLocaleString()} • Vendor: ${exp.vendor} • Category: ${exp.category}`,
          category: 'Finance',
          typeBadge: 'Expense',
          typeBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <CreditCard className="w-4 h-4 text-rose-600" />,
          score,
          onClick: () => {
            setActiveTab('finance-expenses');
            onClose();
            addToast(`Viewing expense: ${exp.description}`, 'info');
          },
        });
      }
    });

    transactions.forEach((tx) => {
      const score = calculateScore(`${tx.reference_id} — ${tx.description}`, tx.party, `${tx.amount} ${tx.tx_type}`);
      if (score > 0) {
        items.push({
          id: `tx-${tx.id}`,
          title: `${tx.reference_id} — ${tx.description}`,
          subtitle: `₹${tx.amount.toLocaleString()} • Party: ${tx.party} • Type: ${tx.tx_type.toUpperCase()}`,
          category: 'Finance',
          typeBadge: 'Txn',
          typeBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <ReceiptText className="w-4 h-4 text-emerald-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(tx.id || tx.reference_id);
            setActiveTab('finance-transactions');
            onClose();
            addToast(`Viewing transaction ${tx.reference_id}`, 'info');
          },
        });
      }
    });

    // 13. Search Branches
    branches.forEach((b) => {
      const score = calculateScore(`${b.name} (${b.code})`, `${b.city}, ${b.state}`, `${b.manager_name}`);
      if (score > 0) {
        items.push({
          id: `branch-${b.id}`,
          title: `${b.name} (${b.code})`,
          subtitle: `${b.city}, ${b.state} • Manager: ${b.manager_name || 'Rahul Mehta'}`,
          category: 'Operations',
          typeBadge: 'Branch',
          typeBadgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <Building2 className="w-4 h-4 text-sky-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(b.id || b.code);
            setActiveTab('branches');
            onClose();
            addToast(`Viewing branch: ${b.name}`, 'info');
          },
        });
      }
    });

    // 14. Search Approvals
    (approvals || []).forEach((ap) => {
      const score = calculateScore(`${ap.request_id_str} — ${ap.title}`, ap.requested_by, `${ap.amount || ''} ${ap.status}`);
      if (score > 0) {
        items.push({
          id: `ap-${ap.id}`,
          title: `${ap.request_id_str} — ${ap.title}`,
          subtitle: `Requester: ${ap.requested_by} • ₹${(ap.amount || 0).toLocaleString()} • Status: ${ap.status.toUpperCase()}`,
          category: 'Automation',
          typeBadge: 'Approval',
          typeBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <ShieldAlert className="w-4 h-4 text-amber-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(ap.request_id_str || ap.id);
            setActiveTab('automation-approvals');
            onClose();
            addToast(`Viewing approval: ${ap.request_id_str}`, 'info');
          },
        });
      }
    });

    // 15. Search Knowledge Articles
    (knowledgeArticles || []).forEach((art) => {
      const score = calculateScore(art.title, art.category, art.content || '');
      if (score > 0) {
        items.push({
          id: `kb-${art.id}`,
          title: art.title,
          subtitle: `Knowledge Base • Category: ${art.category} • Read time: 3 mins`,
          category: 'AI',
          typeBadge: 'Article',
          typeBadgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <BookOpen className="w-4 h-4 text-purple-600" />,
          score,
          onClick: () => {
            setTargetHighlightId(art.id);
            setActiveTab('ai-knowledgebase');
            onClose();
            addToast(`Opening article: ${art.title}`, 'info');
          },
        });
      }
    });

    // Sort descending by score
    return items.sort((a, b) => b.score - a.score).slice(0, 30);
  }, [
    q,
    tokens,
    leads,
    conversations,
    deals,
    jobs,
    employees,
    invoices,
    quotations,
    appointments,
    inventory,
    expenses,
    transactions,
    branches,
    approvals,
    knowledgeArticles,
    setActiveTab,
    onClose,
    addToast,
    setIsLeadDrawerOpen,
    setSelectedConversationId,
    setSelectedLead,
    setTargetHighlightId,
  ]);

  // Apply active category filter
  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') return allResults;
    if (activeFilter === 'pages') return allResults.filter((r) => r.typeBadge === 'Page');
    if (activeFilter === 'crm') return allResults.filter((r) => r.category === 'CRM' || r.typeBadge === 'Chat' || r.typeBadge === 'Lead' || r.typeBadge === 'Deal');
    if (activeFilter === 'ops') return allResults.filter((r) => r.category === 'Operations' || r.typeBadge === 'Job' || r.typeBadge === 'Staff' || r.typeBadge === 'Leave' || r.typeBadge === 'Appointment' || r.typeBadge === 'SKU');
    if (activeFilter === 'finance') return allResults.filter((r) => r.category === 'Finance' || r.typeBadge === 'Invoice' || r.typeBadge === 'Quote' || r.typeBadge === 'Expense' || r.typeBadge === 'Txn');
    return allResults;
  }, [allResults, activeFilter]);

  // Suggested popular shortcuts when query is empty
  const defaultQuickPicks = [
    { title: 'Leave Management', subtitle: 'Time off requests, approvals & holiday calendar', tab: 'ops-emp-leaves' as TabType, icon: Calendar, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { tab: 'finance-payroll' as TabType, title: 'Run Payroll Wizard', subtitle: 'Monthly salary, payslips, deductions & statutory compliance', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { tab: 'conversations' as TabType, title: 'WhatsApp Live Chat', subtitle: 'Multi-agent customer inbox & chat messaging', icon: MessageSquare, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { tab: 'ops-jobs' as TabType, title: 'Jobs Dispatch', subtitle: 'Field tickets, work orders & assignment schedule', icon: Briefcase, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { tab: 'finance-invoices' as TabType, title: 'Invoices & Billing', subtitle: 'Itemized invoices, GST statements & UPI collections', icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { tab: 'ops-routes' as TabType, title: 'Route Optimization', subtitle: 'AI GPS route dispatch & technician stops', icon: Navigation, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { tab: 'ops-appointments' as TabType, title: 'Appointments Calendar', subtitle: 'Service booking slots & advance payment tracker', icon: Calendar, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { tab: 'automation-builder' as TabType, title: 'Workflow Builder', subtitle: 'Visual automation trigger canvas & keyword bot rules', icon: Zap, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { tab: 'settings-backup' as TabType, title: 'Data Backup & Restore', subtitle: 'Database snapshot export, JSON backups & recovery', icon: Database, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { tab: 'roles' as TabType, title: 'Roles & Security Matrix', subtitle: 'RBAC permissions, superadmin & access policies', icon: ShieldCheck, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  ];

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-6 sm:pt-16 p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[82vh] animate-in zoom-in-95 duration-100"
      >
        
        {/* ── TOP SEARCH INPUT & MODERN CLOSE BAR ── */}
        <div className="px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-slate-200 flex items-center gap-2.5 sm:gap-3 bg-white">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages (e.g. Leave Management, Payroll), leads, jobs, staff, invoices..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-xs sm:placeholder:text-[13px] placeholder:font-normal placeholder:text-slate-400 outline-none"
          />

          {/* Quick Clear Button if search query entered */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Clear search text"
              aria-label="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Modern Top-Right Close Bar */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 shrink-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer group shadow-2xs active:scale-95"
              title="Close Search (Esc)"
              aria-label="Close search modal"
            >
              <span className="text-xs font-semibold hidden sm:inline">Close</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs group-hover:border-rose-200">
                ESC
              </kbd>
              <X className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:rotate-90 transition-all" />
            </button>
          </div>
        </div>

        {/* ── CATEGORY FILTER PILLS ── */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs font-semibold text-slate-600 bg-slate-50/60 whitespace-nowrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            All Results {q ? `(${allResults.length})` : ''}
          </button>
          <button
            onClick={() => setActiveFilter('pages')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'pages'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            Pages & Navigation {q ? `(${allResults.filter((r) => r.typeBadge === 'Page').length})` : ''}
          </button>
          <button
            onClick={() => setActiveFilter('crm')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'crm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            CRM & Chats
          </button>
          <button
            onClick={() => setActiveFilter('ops')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'ops'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            Operations & Leaves
          </button>
          <button
            onClick={() => setActiveFilter('finance')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'finance'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            Finance & Payroll
          </button>
        </div>

        {/* ── RESULTS BODY ── */}
        <div ref={resultsListRef} className="flex-1 overflow-y-auto custom-scrollbar p-2.5 sm:p-3 text-xs">
          {!q ? (
            /* EMPTY QUERY STATE: QUICK NAV + COMMON ACTIONS */
            <div className="space-y-4 p-1">
              <div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Frequently Used Pages & Tools
                  </span>
                  <span className="text-[10px] text-slate-400">Jump directly in 1 click</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {defaultQuickPicks.map((pick) => {
                    const PickIcon = pick.icon;
                    return (
                      <div
                        key={pick.tab}
                        onClick={() => {
                          setActiveTab(pick.tab);
                          onClose();
                          addToast(`Navigating to ${pick.title}`, 'info');
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 cursor-pointer transition-all group"
                      >
                        <div className={`p-2 rounded-lg border shadow-xs shrink-0 ${pick.color}`}>
                          <PickIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                            {pick.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {pick.subtitle}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QUICK SHORTCUTS STRIP */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Quick Actions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('crm-leads');
                      setIsLeadDrawerOpen(true);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-slate-700 text-xs font-semibold cursor-pointer transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>New CRM Lead</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ops-jobs');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-amber-300 text-slate-700 text-xs font-semibold cursor-pointer transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>Create Job</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('finance-invoices');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-purple-300 text-slate-700 text-xs font-semibold cursor-pointer transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                    <span>Create Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ops-emp-leaves');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-rose-300 text-slate-700 text-xs font-semibold cursor-pointer transition-all shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-600" />
                    <span>Leave Requests</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('finance-payroll');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-300 text-slate-700 text-xs font-semibold cursor-pointer transition-all shadow-2xs"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Run Payroll</span>
                  </button>
                </div>
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            /* ACTIVE QUERY RESULTS LIST */
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400">
                <span>Found {filteredResults.length} matches</span>
                <span>Press ↵ to open • ↑ ↓ to navigate</span>
              </div>
              {filteredResults.map((res, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={res.id}
                    data-selected={isSelected}
                    onClick={res.onClick}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/20 shadow-xs'
                        : 'bg-white border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200/80 shadow-xs shrink-0">
                        {res.icon}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold truncate text-xs ${isSelected ? 'text-emerald-950 font-bold' : 'text-slate-900'}`}>
                            {res.title}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border uppercase shrink-0 ${res.typeBadgeColor}`}>
                            {res.typeBadge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate leading-snug">
                          {res.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                          <span>Open</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* NO RESULTS STATE */
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-800 text-sm">
                  No matching results for &ldquo;{query}&rdquo;
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Try searching for <strong>Leave Management</strong>, <strong>Payroll</strong>, customer names, job numbers (e.g. <code>JOB-1024</code>), or invoices.
                </p>
              </div>
              <button
                onClick={() => setQuery('')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Clear search query
              </button>
            </div>
          )}
        </div>

        {/* ── FOOTER BAR WITH KEYBOARD HINTS ── */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">↑</kbd>
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">↵</kbd>
              <span>select</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">tab</kbd>
              <span>filter</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">esc</kbd>
              <span>close</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Qiyam Deep Search OS</span>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

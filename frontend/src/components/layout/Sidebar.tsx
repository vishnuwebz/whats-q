import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { TabType } from '../../types';
import {
  LayoutDashboard, MessageSquare, MessagesSquare, Users, Briefcase, DollarSign,
  Zap, Bot, BarChart3, Puzzle, Settings as SettingsIcon,
  ChevronDown, ChevronRight, UserCheck, Calendar, Clock,
  CheckSquare, Navigation, Package, Receipt, FileText,
  CreditCard, Wallet, BookOpen, Layers, GitBranch,
  ShieldCheck, HelpCircle, PhoneCall, Sparkles, Plus,
  PanelLeftClose, PanelLeftOpen, X, Building2, Check,
  User, Shield, LogOut, ArrowRight, ExternalLink, Send,
  RefreshCw, Search, Database
} from 'lucide-react';

interface SidebarMenuItem {
  tab: TabType;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
}

const ALL_SIDEBAR_ITEMS: SidebarMenuItem[] = [
  { tab: 'dashboard', title: 'Dashboard', category: 'Main', icon: LayoutDashboard, keywords: 'home overview analytics metrics' },
  { tab: 'conversations', title: 'Conversations', category: 'Messenger', icon: MessageSquare, keywords: 'chats messages inbox whatsapp live customer' },
  { tab: 'bulk-overview', title: 'Bulk Message Overview', category: 'Messenger', icon: BarChart3, keywords: 'broadcast dashboard stats metrics analytics reach' },
  { tab: 'bulk-send', title: 'Send Bulk Message', category: 'Messenger', icon: Send, keywords: 'broadcast mass marketing campaigns blast dispatch' },
  { tab: 'bulk-templates', title: 'Message Templates', category: 'Messenger', icon: BookOpen, keywords: 'meta templates approved quick replies' },
  { tab: 'bulk-campaigns', title: 'Campaign History', category: 'Messenger', icon: Layers, keywords: 'broadcast analytics sent delivered open rates' },
  { tab: 'bulk-recipients', title: 'Recipient Lists', category: 'Messenger', icon: Users, keywords: 'contacts audience segments groups tags' },
  { tab: 'bulk-scheduled', title: 'Scheduled Messages', category: 'Messenger', icon: Clock, keywords: 'timed future automated queue calendar' },
  { tab: 'crm-leads', title: 'Leads', category: 'CRM', icon: Users, keywords: 'prospects pipeline inquiries conversion funnel' },
  { tab: 'crm-customers', title: 'Customers', category: 'CRM', icon: UserCheck, keywords: 'clients directory accounts profiles' },
  { tab: 'crm-deals', title: 'Pipeline Deals', category: 'CRM', icon: DollarSign, keywords: 'stages revenue opportunities sales forecast' },
  { tab: 'crm-followups', title: 'Follow-ups', category: 'CRM', icon: Clock, keywords: 'reminders scheduled calls pending tasks' },
  { tab: 'branches', title: 'Branches', category: 'Main', icon: Building2, keywords: 'locations outlets offices stores calicut kochi' },
  { tab: 'ops-jobs', title: 'Jobs', category: 'Operations', icon: Briefcase, keywords: 'work orders field service tickets assignment' },
  { tab: 'ops-appointments', title: 'Appointments', category: 'Operations', icon: Calendar, keywords: 'bookings customer visits scheduled meetings' },
  { tab: 'ops-employees', title: 'Employee Management', category: 'Operations', icon: Users, keywords: 'staff team agents workers roster' },
  { tab: 'ops-schedule', title: 'Schedule', category: 'Operations', icon: Calendar, keywords: 'roster shifts dispatch planning timetable' },
  { tab: 'ops-attendance', title: 'Attendance', category: 'Operations', icon: Clock, keywords: 'check-in check-out hours leaves presence' },
  { tab: 'ops-tasks', title: 'Tasks', category: 'Operations', icon: CheckSquare, keywords: 'to-do assignments checklists todo' },
  { tab: 'ops-routes', title: 'Route Optimization', category: 'Operations', icon: Navigation, keywords: 'gps dispatch map delivery logistics navigation' },
  { tab: 'ops-inventory', title: 'Inventory', category: 'Operations', icon: Package, keywords: 'stock warehouse products spare parts items' },
  { tab: 'automation-approvals', title: 'Approvals', category: 'Operations', icon: ShieldCheck, keywords: 'authorization sign-off purchase orders leave requests' },
  { tab: 'finance-overview', title: 'Finance Overview', category: 'Finance', icon: DollarSign, keywords: 'revenue profit cash flow ledger balance' },
  { tab: 'finance-transactions', title: 'Transactions', category: 'Finance', icon: Receipt, keywords: 'payments bank entries debits credits log' },
  { tab: 'finance-invoices', title: 'Invoices', category: 'Finance', icon: FileText, keywords: 'billing tax gst statements pdf receivables' },
  { tab: 'finance-expenses', title: 'Expenses', category: 'Finance', icon: CreditCard, keywords: 'bills receipts disbursements spending' },
  { tab: 'finance-payments', title: 'Payments', category: 'Finance', icon: Wallet, keywords: 'collections payout gateway settlement' },
  { tab: 'finance-accounts', title: 'Chart of Accounts', category: 'Finance', icon: Layers, keywords: 'banking general ledger assets liabilities' },
  { tab: 'finance-reports', title: 'Financial Reports', category: 'Finance', icon: BarChart3, keywords: 'p&l balance sheet cash statement' },
  { tab: 'finance-budget', title: 'Budget Planning', category: 'Finance', icon: DollarSign, keywords: 'forecast limits quarterly targets allocation' },
  { tab: 'automation-builder', title: 'Workflow Builder', category: 'Automation', icon: Zap, keywords: 'no-code visual trigger node action flow' },
  { tab: 'automation-workflows', title: 'Workflows', category: 'Automation', icon: GitBranch, keywords: 'active rules automated sequences triggers' },
  { tab: 'automation-templates', title: 'Templates', category: 'Automation', icon: BookOpen, keywords: 'bot flows auto-reply recipes blueprints' },
  { tab: 'automation-logs', title: 'Logs', category: 'Automation', icon: Clock, keywords: 'execution history audit debug runs' },
  { tab: 'ai-overview', title: 'AI Copilot Overview', category: 'AI Assistant', icon: Bot, keywords: 'smart bot copilot suggestions intelligence' },
  { tab: 'ai-knowledgebase', title: 'Knowledge Base', category: 'AI Assistant', icon: BookOpen, keywords: 'rag articles documentation training articles' },
  { tab: 'ai-templates', title: 'AI Prompt Templates', category: 'AI Assistant', icon: Layers, keywords: 'prompts system message tuning instructions' },
  { tab: 'template-hub', title: 'Template Hub', category: 'AI Assistant', icon: Sparkles, keywords: 'marketplace pre-built community templates' },
  { tab: 'ai-settings', title: 'AI Engine Settings', category: 'AI Assistant', icon: SettingsIcon, keywords: 'model temperature tokens provider config' },
  { tab: 'analytics', title: 'Analytics', category: 'Intelligence', icon: BarChart3, keywords: 'reports bi performance trends kpi metrics' },
  { tab: 'integrations', title: 'Integrations', category: 'Ecosystem', icon: Puzzle, keywords: 'webhooks crm zapier apps rest api meta' },
  { tab: 'settings', title: 'Workspace Settings', category: 'Settings', icon: SettingsIcon, keywords: 'workspace general preferences business brand organization profile' },
  { tab: 'settings-backup', title: 'Data Backup & Restore', category: 'Settings', icon: Database, keywords: 'backup restore data auto-backup last backup import export snapshot database disaster recovery postgresql sqlite' },
];

export type AccordionSection = 'messenger' | 'crm' | 'ops' | 'finance' | 'automation' | 'ai' | null;

export const getTabAccordionSection = (tab: string): AccordionSection => {
  if ([
    'conversations',
    'bulk-overview',
    'bulk-send',
    'bulk-templates',
    'bulk-campaigns',
    'bulk-recipients',
    'bulk-scheduled',
  ].includes(tab)) {
    return 'messenger';
  }
  if (['crm-leads', 'crm-customers', 'crm-deals', 'crm-followups'].includes(tab)) {
    return 'crm';
  }
  if ([
    'ops-jobs',
    'ops-appointments',
    'ops-employees',
    'ops-schedule',
    'ops-attendance',
    'ops-tasks',
    'ops-routes',
    'ops-inventory',
    'automation-approvals',
  ].includes(tab)) {
    return 'ops';
  }
  if ([
    'finance-overview',
    'finance-transactions',
    'finance-invoices',
    'finance-expenses',
    'finance-payments',
    'finance-accounts',
    'finance-reports',
    'finance-budget',
  ].includes(tab)) {
    return 'finance';
  }
  if (['automation-builder', 'automation-workflows', 'automation-templates', 'automation-logs'].includes(tab)) {
    return 'automation';
  }
  if ([
    'ai-overview',
    'ai-branches',
    'ai-knowledgebase',
    'ai-templates',
    'template-hub',
    'template-create',
    'ai-settings',
  ].includes(tab)) {
    return 'ai';
  }
  return null;
};

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsSimulatorOpen,
    setEditingTemplate,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    conversations,
    addToast,
    versionInfo,
    fetchVersionInfo,
    triggerSystemUpdate,
    simulateGlobalUpdate,
    metaConfig
  } = useQiyamStore();

  // Tenant / Organization Switcher state
  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [tenants, setTenants] = useState([
    {
      id: 'TN2345',
      name: 'CoolFix Services',
      branch: 'HQ • Kozhikode',
      status: 'Active',
      phone: '+91 98765 43210',
      initial: 'Q',
      color: 'from-emerald-500 to-teal-600',
      staffCount: 18,
    },
    {
      id: 'TN2388',
      name: 'CoolFix Express',
      branch: 'Kochi Hub',
      status: 'Online',
      phone: '+91 98765 43211',
      initial: 'E',
      color: 'from-blue-500 to-cyan-600',
      staffCount: 12,
    },
    {
      id: 'TN2401',
      name: 'CoolFix Enterprises',
      branch: 'Calicut Central',
      status: 'Online',
      phone: '+91 98765 43212',
      initial: 'C',
      color: 'from-purple-500 to-indigo-600',
      staffCount: 24,
    },
    {
      id: 'TN2455',
      name: 'CoolFix MEP Solutions',
      branch: 'Industrial Area',
      status: 'Ready',
      phone: '+91 98765 43213',
      initial: 'M',
      color: 'from-amber-500 to-orange-600',
      staffCount: 8,
    },
  ]);
  const [activeTenantId, setActiveTenantId] = useState('TN2345');
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const handleSelectTenant = (tenant: (typeof tenants)[0]) => {
    setActiveTenantId(tenant.id);
    setIsTenantOpen(false);
    addToast(`Switched active organization to ${tenant.name} (${tenant.id})`, 'success');
  };

  // Profile & Help Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Version Update & Auto-Backup State (Antigravity Style)
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [checkResult, setCheckResult] = useState<'latest' | 'available' | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);

  const handleBackupAllData = () => {
    try {
      const store = useQiyamStore.getState();
      const backupPayload = {
        timestamp: new Date().toISOString(),
        version: store.versionInfo?.current_commit || 'v2.4.2',
        conversations: store.conversations || [],
        leads: store.leads || [],
        deals: store.deals || [],
        appointments: store.appointments || [],
        customers: store.customers || [],
        jobs: store.jobs || [],
        employees: store.employees || [],
        attendance: store.attendance || [],
        tasks: store.tasks || [],
        routes: store.routes || [],
        inventory: store.inventory || [],
        transactions: store.transactions || [],
        invoices: store.invoices || [],
        expenses: store.expenses || [],
        accounts: store.accounts || [],
        workflows: store.workflows || [],
        branches: store.branches || [],
        bulkCampaigns: store.bulkCampaigns || [],
        bulkRecipientLists: store.bulkRecipientLists || [],
        bulkScheduledMessages: store.bulkScheduledMessages || [],
      };
      const serialized = JSON.stringify(backupPayload);
      localStorage.setItem('whatsq_pre_update_backup', serialized);
      localStorage.setItem(`whatsq_backup_archive_${Date.now()}`, serialized);
      // Clean up older archive backups, keeping at most 5
      try {
        const allKeys = Object.keys(localStorage).filter((k) => k.startsWith('whatsq_backup_archive_'));
        if (allKeys.length > 5) {
          allKeys.sort().slice(0, allKeys.length - 5).forEach((k) => localStorage.removeItem(k));
        }
      } catch {}
      return true;
    } catch (err) {
      console.error('Backup error:', err);
      return false;
    }
  };

  const handleCheckForUpdates = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isCheckingUpdates || isRestarting) return;
    setIsCheckingUpdates(true);
    setCheckResult(null);

    // If Alt key or Shift key is held during click, simulate an update available state for testing
    const forceSimulate = e && (e.altKey || e.shiftKey);

    try {
      if (forceSimulate) {
        await simulateGlobalUpdate();
        await new Promise((r) => setTimeout(r, 1200));
        setCheckResult('available');
        addToast('New version update detected!', 'info');
      } else {
        await fetchVersionInfo();
        await new Promise((r) => setTimeout(r, 1200));
        const updatedInfo = useQiyamStore.getState().versionInfo;
        if (updatedInfo?.update_available) {
          setCheckResult('available');
          addToast('New version update detected!', 'info');
        } else {
          setCheckResult('latest');
          setTimeout(() => {
            setCheckResult(null);
          }, 3500);
        }
      }
    } catch (err) {
      setCheckResult('latest');
      setTimeout(() => {
        setCheckResult(null);
      }, 3000);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleBackupAndRestart = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isRestarting) return;
    setIsRestarting(true);

    addToast('Safely backing up all application data...', 'info');

    // 1. Perform automated backup of all state
    const backedUp = handleBackupAllData();
    if (backedUp) {
      addToast('All data backed up successfully! Force hard-refreshing WhatsQ...', 'success');
    }

    // 2. Trigger forceful hard refresh & backend update
    try {
      await triggerSystemUpdate();
    } catch {
      window.location.reload();
    }
  };

  const isUpdateAvailable = (versionInfo?.update_available || checkResult === 'available') && !isRestarting;
  const currentVersion = versionInfo?.current_commit
    ? (versionInfo.current_commit.length > 7 ? versionInfo.current_commit.slice(0, 7) : versionInfo.current_commit)
    : 'v2.4.2';

  const isCollapsed = isSidebarCollapsed && !isMobileSidebarOpen;

  const sidebarNavRef = React.useRef<HTMLElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const clickedFromSidebarRef = React.useRef(false);

  // Dedicated Sidebar Menu Search state
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  const filteredMenuItems = React.useMemo(() => {
    const q = menuSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_SIDEBAR_ITEMS.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q) ||
      item.tab.toLowerCase().includes(q)
    );
  }, [menuSearchQuery]);

  // Mutually exclusive single-accordion state: opening one automatically collapses all others to save space & scrolling
  const [expandedSection, setExpandedSection] = useState<AccordionSection>(null);

  const toggleSection = (section: AccordionSection) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const openSection = (section: AccordionSection) => {
    setExpandedSection(section);
  };

  const messengerOpen = expandedSection === 'messenger';
  const crmOpen = expandedSection === 'crm';
  const opsOpen = expandedSection === 'ops';
  const financeOpen = expandedSection === 'finance';
  const automationOpen = expandedSection === 'automation';
  const aiOpen = expandedSection === 'ai';

  const handleTabClick = (tab: TabType) => {
    clickedFromSidebarRef.current = true;
    setActiveTab(tab);
    // Mutually exclusive single-accordion: collapse accordion if clicking a standalone tab,
    // or keep only this tab's parent accordion open if clicking a sub-tab
    setExpandedSection(getTabAccordionSection(tab));
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      // Reset scroll position ONLY for main content view containers, keeping sidebar scroll intact
      const scrollContainers = document.querySelectorAll('.overflow-y-auto');
      scrollContainers.forEach((el) => {
        // Exclude sidebar navigation and any container inside the sidebar aside
        if (el.closest('aside') || (sidebarNavRef.current && (el === sidebarNavRef.current || sidebarNavRef.current.contains(el)))) {
          return;
        }
        el.scrollTop = 0;
      });
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  const totalUnread = (conversations || []).reduce(
    (sum, c) => sum + (c.unread_count || 0),
    0
  );
  const unreadConversationsCount = totalUnread > 0 ? totalUnread : (conversations && conversations.length > 0 ? 5 : 0);

  // Keyboard shortcut Ctrl+B / Cmd+B for collapse & Ctrl+/ or / for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
      // Focus sidebar search on Ctrl + / or when pressing '/' outside inputs
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key.toLowerCase() === 'k')) {
        const target = e.target as HTMLElement;
        if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (isSidebarCollapsed) {
            toggleSidebarCollapse();
          }
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 80);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse, isSidebarCollapsed]);

  // Accordion active group indicators
  const isMessengerActive = [
    'conversations',
    'bulk-overview',
    'bulk-send',
    'bulk-templates',
    'bulk-campaigns',
    'bulk-recipients',
    'bulk-scheduled',
  ].includes(activeTab);
  const isCrmActive = ['crm-leads', 'crm-customers', 'crm-deals', 'crm-followups'].includes(activeTab);
  const isOpsActive = ['ops-jobs', 'ops-appointments', 'ops-employees', 'ops-schedule', 'ops-attendance', 'ops-tasks', 'ops-routes', 'ops-inventory', 'automation-approvals'].includes(activeTab);
  const isFinanceActive = ['finance-overview', 'finance-transactions', 'finance-invoices', 'finance-expenses', 'finance-payments', 'finance-accounts', 'finance-reports', 'finance-budget'].includes(activeTab);
  const isAutomationActive = ['automation-builder', 'automation-workflows', 'automation-templates', 'automation-logs'].includes(activeTab);
  const isAiActive = ['ai-overview', 'ai-branches', 'ai-knowledgebase', 'ai-templates', 'template-hub', 'template-create', 'ai-settings'].includes(activeTab);

  const initialMountRef = React.useRef(true);

  // If navigation was triggered from outside the sidebar and the active element is visible in the DOM, scroll it into view
  React.useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    if (!clickedFromSidebarRef.current && sidebarNavRef.current) {
      setExpandedSection(getTabAccordionSection(activeTab));
      const timer = setTimeout(() => {
        if (sidebarNavRef.current) {
          const activeBtn = sidebarNavRef.current.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
          if (activeBtn) {
            activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
    clickedFromSidebarRef.current = false;
  }, [activeTab]);

  const isActive = (tab: TabType) => activeTab === tab;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 ${
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 md:relative md:z-auto
          ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl ring-1 ring-white/10' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-72 md:w-64'} max-w-[85vw] md:max-w-none
          bg-[#0B1528] text-slate-300 flex flex-col h-screen shrink-0 border-r border-[#1E293B] select-none font-sans overflow-hidden transition-transform duration-300 ease-in-out
        `}
      >
        {/* Brand Header */}
        <div className={`p-3.5 flex items-center ${isCollapsed ? 'flex-col gap-2.5 justify-center' : 'justify-between'} border-b border-[#1E293B]/60 transition-all`}>
          <div
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
            onClick={() => handleTabClick('dashboard')}
            title="WhatsQ Dashboard"
          >
            {(() => {
              const brandLogo = typeof window !== 'undefined' ? localStorage.getItem('whatsq_brand_logo') : null;
              const workspaceName = typeof window !== 'undefined' ? localStorage.getItem('whatsq_workspace_name') || 'WhatsQ' : 'WhatsQ';
              return (
                <>
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/30 overflow-hidden">
                    {brandLogo ? (
                      <img src={brandLogo} alt="Tenant Logo" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="truncate">
                      <div className="font-bold text-white tracking-wide text-base leading-tight truncate">{workspaceName}</div>
                      <div className="text-[11px] text-emerald-400 font-medium truncate">Qiyam Business OS</div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title={isSidebarCollapsed ? "Expand sidebar (Ctrl + B)" : "Collapse sidebar (Ctrl + B)"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-emerald-400" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dedicated Sidebar Menu Search Bar */}
        {!isCollapsed ? (
          <div className="px-3 pt-2.5 pb-1 border-b border-[#1E293B]/40">
            <div className="relative flex items-center bg-[#070D18] hover:bg-[#0E182A] border border-[#1E293B] focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 rounded-lg transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-2.5 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                placeholder="Search menu... (Ctrl + /)"
                className="w-full bg-transparent px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none font-normal"
              />
              {menuSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setMenuSearchQuery('')}
                  className="mr-2 text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer transition"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <span className="mr-2 text-[9px] font-mono text-slate-500 bg-[#16233B]/80 px-1.5 py-0.5 rounded border border-slate-700/50 select-none">
                  /
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="px-3 pt-2.5 pb-1 flex justify-center border-b border-[#1E293B]/40">
            <button
              type="button"
              onClick={() => {
                toggleSidebarCollapse();
                setTimeout(() => {
                  searchInputRef.current?.focus();
                }, 100);
              }}
              title="Search menu (Ctrl + /)"
              className="w-9 h-9 rounded-lg hover:bg-[#16233B] text-slate-400 hover:text-emerald-400 flex items-center justify-center transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Links (Scrollable) */}
        <nav
          ref={sidebarNavRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-800"
        >
          {menuSearchQuery.trim() !== '' ? (
            <div className="space-y-1 animate-in fade-in duration-150">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Matching Menu Items ({filteredMenuItems.length})</span>
                <button
                  type="button"
                  onClick={() => setMenuSearchQuery('')}
                  className="text-emerald-400 hover:underline cursor-pointer lowercase text-[10px]"
                >
                  clear
                </button>
              </div>

              {filteredMenuItems.length === 0 ? (
                <div className="py-8 px-3 text-center text-slate-500">
                  <Search className="w-6 h-6 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="text-xs font-medium text-slate-400">No matching menu items</p>
                  <p className="text-[10px] text-slate-600 mt-1">Try searching for leads, jobs, deals, or backup</p>
                </div>
              ) : (
                filteredMenuItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isItemActive = isActive(item.tab);
                  return (
                    <button
                      key={item.tab}
                      data-tab={item.tab}
                      onClick={() => {
                        handleTabClick(item.tab);
                        setMenuSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left cursor-pointer group ${
                        isItemActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-[#16233B] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isItemActive ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'}`} />
                        <div className="truncate">
                          <div className="text-xs truncate font-medium">{item.title}</div>
                          <div className={`text-[10px] truncate ${isItemActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-3 h-3 shrink-0 ${isItemActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <>
              {/* Dashboard */}
              <button
                data-tab="dashboard"
            onClick={() => handleTabClick('dashboard')}
            title="Dashboard"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-lg transition-all ${
              isActive('dashboard')
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'hover:bg-[#16233B] text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </button>

          {/* Messenger (Accordion containing Conversations, Bulk Message Overview, Send Bulk Message, etc.) */}
          <div>
            {isCollapsed ? (
              <button
                onClick={() => {
                  toggleSidebarCollapse();
                  openSection('messenger');
                }}
                title={`Messenger (Conversations, Bulk Messages)${unreadConversationsCount > 0 ? ` (${unreadConversationsCount} unread)` : ''}`}
                className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all relative cursor-pointer ${
                  isMessengerActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:bg-[#16233B] text-slate-300'
                }`}
              >
                <MessagesSquare className="w-4 h-4 shrink-0" />
                {unreadConversationsCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => toggleSection('messenger')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    !messengerOpen && isMessengerActive
                      ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : isMessengerActive
                      ? 'text-white font-semibold hover:bg-[#16233B]'
                      : 'text-slate-300 hover:bg-[#16233B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessagesSquare className={`w-4 h-4 ${isMessengerActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>Messenger</span>
                    {!messengerOpen && isMessengerActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadConversationsCount > 0 && (
                      <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                        {unreadConversationsCount}
                      </span>
                    )}
                    {messengerOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </button>

                {messengerOpen && (
                  <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-1 mt-1">
                    {/* Conversations */}
                    <button
                      data-tab="conversations"
                      onClick={() => handleTabClick('conversations')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        isActive('conversations')
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-[#16233B] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className={`w-4 h-4 shrink-0 ${isActive('conversations') ? 'text-white' : 'text-slate-400'}`} />
                        <span>Conversations</span>
                      </div>
                      {unreadConversationsCount > 0 && (
                        <span className="bg-emerald-950/80 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {unreadConversationsCount}
                        </span>
                      )}
                    </button>

                    {/* Bulk Message Overview */}
                    <button
                      data-tab="bulk-overview"
                      onClick={() => handleTabClick('bulk-overview')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        isActive('bulk-overview')
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-[#16233B] text-slate-300'
                      }`}
                    >
                      <BarChart3 className={`w-4 h-4 shrink-0 ${isActive('bulk-overview') ? 'text-white' : 'text-slate-400'}`} />
                      <span>Bulk Message Overview</span>
                    </button>

                    {/* Send Bulk Message */}
                    <button
                      data-tab="bulk-send"
                      onClick={() => handleTabClick('bulk-send')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        isActive('bulk-send')
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-[#16233B] text-slate-300'
                      }`}
                    >
                      <Send className={`w-4 h-4 shrink-0 ${isActive('bulk-send') ? 'text-white' : 'text-slate-400'}`} />
                      <span>Send Bulk Message</span>
                    </button>

                    {/* Message Templates */}
                    <button
                      data-tab="bulk-templates"
                      onClick={() => handleTabClick('bulk-templates')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        isActive('bulk-templates')
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-[#16233B] text-slate-300'
                      }`}
                    >
                      <FileText className={`w-4 h-4 shrink-0 ${isActive('bulk-templates') ? 'text-white' : 'text-slate-400'}`} />
                      <span>Message Templates</span>
                    </button>

                    {/* Campaign History */}
                    <button
                      data-tab="bulk-campaigns"
                      onClick={() => handleTabClick('bulk-campaigns')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        isActive('bulk-campaigns')
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-[#16233B] text-slate-300'
                      }`}
                    >
                      <Layers className={`w-4 h-4 shrink-0 ${isActive('bulk-campaigns') ? 'text-white' : 'text-slate-400'}`} />
                      <span>Campaign History</span>
                    </button>

                    {/* Recipient Lists */}
                    <button
                      data-tab="bulk-recipients"
                      onClick={() => handleTabClick('bulk-recipients')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        isActive('bulk-recipients')
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-[#16233B] text-slate-300'
                      }`}
                    >
                      <Users className={`w-4 h-4 shrink-0 ${isActive('bulk-recipients') ? 'text-white' : 'text-slate-400'}`} />
                      <span>Recipient Lists</span>
                    </button>

                    {/* Scheduled Messages */}
                    <button
                      data-tab="bulk-scheduled"
                      onClick={() => handleTabClick('bulk-scheduled')}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        isActive('bulk-scheduled')
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'hover:bg-[#16233B] text-slate-300'
                      }`}
                    >
                      <Clock className={`w-4 h-4 shrink-0 ${isActive('bulk-scheduled') ? 'text-white' : 'text-slate-400'}`} />
                      <span>Scheduled Messages</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        {/* CRM */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => {
                toggleSidebarCollapse();
                openSection('crm');
              }}
              title="CRM (Leads, Customers, Deals, Follow-ups)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                isCrmActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={() => toggleSection('crm')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  !crmOpen && isCrmActive
                    ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : isCrmActive
                    ? 'text-white font-semibold hover:bg-[#16233B]'
                    : 'text-slate-300 hover:bg-[#16233B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${isCrmActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>CRM</span>
                  {!crmOpen && isCrmActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                {crmOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {crmOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    data-tab="crm-leads"
                    onClick={() => handleTabClick('crm-leads')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('crm-leads') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Leads</span>
                  </button>
                  <button
                    data-tab="crm-customers"
                    onClick={() => handleTabClick('crm-customers')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('crm-customers') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Customers</span>
                  </button>
                  <button
                    data-tab="crm-deals"
                    onClick={() => handleTabClick('crm-deals')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('crm-deals') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Deals</span>
                  </button>
                  <button
                    data-tab="crm-followups"
                    onClick={() => handleTabClick('crm-followups')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('crm-followups') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Follow-ups</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Branches */}
        <button
          data-tab="branches"
          onClick={() => handleTabClick('branches')}
          title="Branches - Manage all business branches"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-lg transition-all cursor-pointer ${
            isActive('branches')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <Building2 className={`w-4 h-4 shrink-0 ${isActive('branches') ? 'text-white' : 'text-emerald-400'}`} />
          {!isCollapsed && <span>Branches</span>}
        </button>

        {/* Operations */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => {
                toggleSidebarCollapse();
                openSection('ops');
              }}
              title="Operations (Jobs, Appointments, Employees, Schedule, Attendance, Tasks, Routes, Inventory, Approvals)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                isOpsActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={() => toggleSection('ops')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  !opsOpen && isOpsActive
                    ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : isOpsActive
                    ? 'text-white font-semibold hover:bg-[#16233B]'
                    : 'text-slate-300 hover:bg-[#16233B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className={`w-4 h-4 ${isOpsActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Operations</span>
                  {!opsOpen && isOpsActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                {opsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {opsOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    data-tab="ops-jobs"
                    onClick={() => handleTabClick('ops-jobs')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ops-jobs') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Jobs</span>
                  </button>
                  <button
                    data-tab="ops-appointments"
                    onClick={() => handleTabClick('ops-appointments')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ops-appointments') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Appointments</span>
                  </button>
                  <button
                    data-tab="ops-employees"
                    onClick={() => handleTabClick('ops-employees')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ops-employees') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Employee Management</span>
                  </button>
                  <button
                    data-tab="ops-schedule"
                    onClick={() => handleTabClick('ops-schedule')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ops-schedule') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>
                  <button
                    data-tab="ops-attendance"
                    onClick={() => handleTabClick('ops-attendance')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ops-attendance') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Attendance</span>
                  </button>
                  <button
                    data-tab="ops-tasks"
                    onClick={() => handleTabClick('ops-tasks')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ops-tasks') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Tasks</span>
                  </button>
                  <button
                    data-tab="ops-routes"
                    onClick={() => handleTabClick('ops-routes')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ops-routes') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route Optimization</span>
                  </button>
                  <button
                    data-tab="ops-inventory"
                    onClick={() => handleTabClick('ops-inventory')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ops-inventory') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Inventory</span>
                  </button>
                  <button
                    data-tab="automation-approvals"
                    onClick={() => handleTabClick('automation-approvals')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('automation-approvals') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approvals</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Finance */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => {
                toggleSidebarCollapse();
                openSection('finance');
              }}
              title="Finance (Overview, Transactions, Invoices, Expenses, Payments, Accounts, Reports)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                isFinanceActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={() => toggleSection('finance')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  !financeOpen && isFinanceActive
                    ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : isFinanceActive
                    ? 'text-white font-semibold hover:bg-[#16233B]'
                    : 'text-slate-300 hover:bg-[#16233B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <DollarSign className={`w-4 h-4 ${isFinanceActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Finance</span>
                  {!financeOpen && isFinanceActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                {financeOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {financeOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    data-tab="finance-overview"
                    onClick={() => handleTabClick('finance-overview')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('finance-overview') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </button>
                  <button
                    data-tab="finance-transactions"
                    onClick={() => handleTabClick('finance-transactions')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('finance-transactions') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Transactions</span>
                  </button>
                  <button
                    data-tab="finance-invoices"
                    onClick={() => handleTabClick('finance-invoices')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('finance-invoices') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Invoices</span>
                  </button>
                  <button
                    data-tab="finance-expenses"
                    onClick={() => handleTabClick('finance-expenses')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('finance-expenses') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Expenses</span>
                  </button>
                  <button
                    data-tab="finance-payments"
                    onClick={() => handleTabClick('finance-payments')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('finance-payments') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Payments</span>
                  </button>
                  <button
                    data-tab="finance-accounts"
                    onClick={() => handleTabClick('finance-accounts')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('finance-accounts') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Accounts</span>
                  </button>
                  <button
                    data-tab="finance-reports"
                    onClick={() => handleTabClick('finance-reports')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('finance-reports') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Reports</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Automation */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => {
                toggleSidebarCollapse();
                openSection('automation');
              }}
              title="Automation (Workflow Builder, Workflows, Templates, Logs)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                isAutomationActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={() => toggleSection('automation')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  !automationOpen && isAutomationActive
                    ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : isAutomationActive
                    ? 'text-white font-semibold hover:bg-[#16233B]'
                    : 'text-slate-300 hover:bg-[#16233B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Zap className={`w-4 h-4 ${isAutomationActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Automation</span>
                  {!automationOpen && isAutomationActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                {automationOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {automationOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    data-tab="automation-builder"
                    onClick={() => handleTabClick('automation-builder')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('automation-builder') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Workflow Builder</span>
                  </button>
                  <button
                    data-tab="automation-workflows"
                    onClick={() => handleTabClick('automation-workflows')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('automation-workflows') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Workflows</span>
                  </button>
                  <button
                    data-tab="automation-templates"
                    onClick={() => handleTabClick('automation-templates')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('automation-templates') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Templates</span>
                  </button>
                  <button
                    data-tab="automation-logs"
                    onClick={() => handleTabClick('automation-logs')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('automation-logs') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Logs</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Assistant */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => {
                toggleSidebarCollapse();
                openSection('ai');
              }}
              title="AI Assistant (Overview, Knowledge Base, Templates, Settings)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all relative ${
                isAiActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-purple-400" />
            </button>
          ) : (
            <>
              <button
                onClick={() => toggleSection('ai')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  !aiOpen && isAiActive
                    ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                    : isAiActive
                    ? 'text-white font-semibold hover:bg-[#16233B]'
                    : 'text-slate-300 hover:bg-[#16233B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bot className={`w-4 h-4 ${isAiActive ? 'text-purple-400' : 'text-purple-400/70'}`} />
                  <span>AI Assistant</span>
                  {!aiOpen && isAiActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-purple-500/30">
                    New
                  </span>
                  {aiOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>
              {aiOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    data-tab="ai-overview"
                    onClick={() => handleTabClick('ai-overview')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ai-overview') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </button>
                  <button
                    data-tab="ai-knowledgebase"
                    onClick={() => handleTabClick('ai-knowledgebase')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ai-knowledgebase') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Knowledge Base</span>
                  </button>
                  <button
                    data-tab="template-hub"
                    onClick={() => handleTabClick('template-hub')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('template-hub') || isActive('ai-templates') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Template Hub</span>
                  </button>
                  <button
                    data-tab="template-create"
                    onClick={() => {
                      setEditingTemplate(null);
                      handleTabClick('template-create');
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('template-create') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Template</span>
                  </button>
                  <button
                    data-tab="ai-settings"
                    onClick={() => handleTabClick('ai-settings')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive('ai-settings') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Analytics */}
        <button
          data-tab="analytics"
          onClick={() => handleTabClick('analytics')}
          title="Analytics"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-lg transition-all ${
            isActive('analytics')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Analytics</span>}
        </button>

        {/* Integrations */}
        <button
          data-tab="integrations"
          onClick={() => handleTabClick('integrations')}
          title="Integrations"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-lg transition-all ${
            isActive('integrations')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <Puzzle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Integrations</span>}
        </button>

        {/* Settings */}
        <button
          data-tab="settings"
          onClick={() => handleTabClick('settings')}
          title="Workspace Settings"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-lg transition-all cursor-pointer ${
            isActive('settings')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* Data Backup & Restore */}
        <button
          data-tab="settings-backup"
          onClick={() => handleTabClick('settings-backup')}
          title="Data Backup & Restore (Zero-Loss Engine, Auto-Backup, Dynamic Database Sync)"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-lg transition-all cursor-pointer ${
            isActive('settings-backup')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <Database className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Data Backup</span>
              <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                Live
              </span>
            </div>
          )}
        </button>

        {/* API Endpoints & Swagger Hub */}
        <a
          href="/api/docs/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setExpandedSection(null)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-lg transition-all text-slate-400 hover:text-emerald-400 hover:bg-[#16233B] border border-dashed border-slate-700/60 my-1 group`}
          title="Open WhatsQ Cloud API Docs & Swagger UI"
        >
          {isCollapsed ? (
            <span className="font-mono text-xs font-bold text-emerald-400">&lt;/&gt;</span>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">&lt;/&gt;</span>
                <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-300">API Endpoints</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono group-hover:bg-emerald-950 group-hover:text-emerald-300">
                Swagger
              </span>
            </>
          )}
        </a>
            </>
          )}
      </nav>

      {/* WhatsApp Connection Card & Simulator Trigger */}
      <div className={`px-3 py-2.5 border-t border-[#1E293B]/70 bg-[#070D18] ${isCollapsed ? 'flex justify-center' : ''}`}>
        {isCollapsed ? (
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="w-9 h-9 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition border border-emerald-500/30 cursor-pointer"
            title={`Active Outbound Sender: ${metaConfig?.business_phone_display || '+91 98765 43210'} (Click to Simulate)`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        ) : (
          <div className="bg-[#111C33] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between">
            <div
              onClick={() => setActiveTab('settings-whatsapp')}
              className="flex items-center gap-2 cursor-pointer group flex-1 mr-2"
              title="Click to configure WhatsApp sender line in Settings"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 group-hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Outbound Sender Line</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-white group-hover:underline tracking-wide">
                  {metaConfig?.business_phone_display || '+91 98765 43210'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded font-medium shadow transition-all cursor-pointer"
              title="Simulate Inbound WhatsApp Message"
            >
              Simulate
            </button>
          </div>
        )}
      </div>

      {/* Tenant Selector & Profile Footer */}
      <div className={`p-3 border-t border-[#1E293B] bg-[#09101F] ${isCollapsed ? 'flex flex-col items-center gap-3' : 'space-y-2'}`}>
        {isCollapsed ? (
          <>
            <button
              type="button"
              onClick={() => setIsTenantOpen(true)}
              title={`${activeTenant.name} (ID: ${activeTenant.id}) - Click to Switch Branch`}
              className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30 transition shadow-2xs active:scale-95"
            >
              {activeTenant.initial}
            </button>
            <div
              onClick={() => setIsProfileOpen(true)}
              title="Rahul Mehta (Owner) - Click for Account & Profile"
              className="cursor-pointer relative group"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Rahul Mehta"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50 group-hover:ring-2 group-hover:ring-emerald-400 transition"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#09101F] absolute -bottom-0.5 -right-0.5" />
            </div>
          </>
        ) : (
          <>
            <div
              onClick={() => setIsTenantOpen(true)}
              className="flex items-center justify-between bg-[#111C33]/80 p-2 rounded-lg border border-[#1E293B] hover:border-emerald-500/40 cursor-pointer hover:bg-[#16233B] transition-all group shadow-2xs"
              title="Click to Switch Organization / Branch"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  {activeTenant.initial}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                    {activeTenant.name}
                  </div>
                  <div className="text-[9px] text-slate-400">ID: {activeTenant.id}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2.5 cursor-pointer group hover:bg-slate-800/40 p-1 -m-1 rounded-lg transition"
                title="Click for Profile & Account Settings"
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Rahul Mehta"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50 group-hover:ring-2 group-hover:ring-emerald-400 transition"
                  />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#09101F] absolute -bottom-0.5 -right-0.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                    Rahul Mehta
                  </div>
                  <div className="text-[10px] text-slate-400">Owner</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                title="Qiyam OS Help & Shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Version & Update Section (Antigravity Style at End of Sidebar) ── */}
      {!isCollapsed ? (
        <div className="px-3 py-2 bg-[#060C18] border-t border-[#1E293B]/80 select-none">
          {isRestarting ? (
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px] animate-pulse py-0.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Backing up data & restarting...</span>
            </div>
          ) : isUpdateAvailable ? (
            <div className="space-y-1.5 py-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Update Available
                </span>
                <span className="text-slate-500 font-mono">v{versionInfo?.latest_commit ? versionInfo.latest_commit.slice(0, 7) : '2.4.3'}</span>
              </div>
              <button
                onClick={handleBackupAndRestart}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-md shadow-emerald-950/50 cursor-pointer group animate-pulse"
                title="All data will be automatically backed up before restarting"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Click here to restart</span>
                </div>
                <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded font-mono text-emerald-100">
                  Auto-backup
                </span>
              </button>
            </div>
          ) : isCheckingUpdates ? (
            <div className="flex items-center justify-between text-slate-300 text-[11px] py-0.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-400 shrink-0" />
                <span>Checking for updates...</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{currentVersion}</span>
            </div>
          ) : checkResult === 'latest' ? (
            <div className="flex items-center justify-between text-[11px] py-0.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>You're up to date</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{currentVersion}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] py-0.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-[10px] text-slate-300 font-medium">WhatsQ {currentVersion}</span>
              </div>
              <button
                onClick={handleCheckForUpdates}
                className="text-[10px] text-slate-400 hover:text-emerald-400 hover:underline font-medium transition cursor-pointer flex items-center gap-1"
                title="Check for updates (Shift-click to simulate)"
              >
                <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                <span>Check for updates</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-2.5 bg-[#060C18] border-t border-[#1E293B]/80 flex flex-col items-center justify-center select-none">
          {isRestarting ? (
            <span title="Backing up and restarting...">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
            </span>
          ) : isUpdateAvailable ? (
            <button
              onClick={handleBackupAndRestart}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/40 transition cursor-pointer relative animate-pulse"
              title="Update available! Click here to backup data and restart"
            >
              <Sparkles className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </button>
          ) : isCheckingUpdates ? (
            <span title="Checking for updates...">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
            </span>
          ) : checkResult === 'latest' ? (
            <span title={`WhatsQ ${currentVersion} is up to date`}>
              <Check className="w-4 h-4 text-emerald-400" />
            </span>
          ) : (
            <button
              onClick={handleCheckForUpdates}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-[#16233B] transition cursor-pointer"
              title={`WhatsQ ${currentVersion} • Click to check for updates`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </aside>

    {/* ── 1. Organization / Tenant Switcher Modal ── */}
    {isTenantOpen && (
      <div
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        onClick={() => setIsTenantOpen(false)}
      >
        <div
          className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#111C33]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Switch Organization & Branch</h3>
                <p className="text-[11px] text-slate-400">Multi-tenant Cloud Workspace</p>
              </div>
            </div>
            <button
              onClick={() => setIsTenantOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Organizations List */}
          <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
            {tenants.map((t) => {
              const isCurrent = t.id === activeTenantId;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTenant(t)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                      : 'bg-[#111C33]/50 hover:bg-[#162544] border-[#1E293B] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${t.color} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                    >
                      {t.initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {t.name}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>ID: {t.id}</span>
                        <span>•</span>
                        <span className="font-sans text-slate-300">{t.branch}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{t.phone}</span>
                        <span>•</span>
                        <span>{t.staffCount} Staff Members</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 group-hover:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                        Switch <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-[#1E293B] bg-[#070D18] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setIsTenantOpen(false);
                handleTabClick('settings');
              }}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Workspace Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const newName = prompt('Enter new Organization / Branch name:', 'CoolFix Calicut North');
                if (newName && newName.trim()) {
                  const newId = `TN${Math.floor(1000 + Math.random() * 9000)}`;
                  const newTenant = {
                    id: newId,
                    name: newName.trim(),
                    branch: 'Regional Hub',
                    status: 'Active',
                    phone: '+91 98765 43299',
                    initial: newName.trim().charAt(0).toUpperCase(),
                    color: 'from-teal-500 to-emerald-600',
                    staffCount: 1,
                  };
                  setTenants((prev) => [...prev, newTenant]);
                  handleSelectTenant(newTenant);
                }
              }}
              className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Branch</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── 2. User Profile & Account Settings Modal ── */}
    {isProfileOpen && (
      <div
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        onClick={() => setIsProfileOpen(false)}
      >
        <div
          className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="relative p-5 bg-gradient-to-r from-emerald-950/80 to-[#111C33] border-b border-[#1E293B]">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Rahul Mehta"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-md"
                />
                <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0F172A] absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Rahul Mehta</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Owner & Super Admin
                  </span>
                  <span className="text-[11px] text-slate-400">Kozhikode, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 space-y-3">
            <div className="bg-[#111C33]/60 rounded-xl p-3 border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Email Address</span>
                <span className="text-white font-medium font-mono">rahul.mehta@coolfix.in</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">WhatsApp Phone</span>
                <span className="text-emerald-400 font-medium font-mono">+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Current Workspace</span>
                <span className="text-white font-medium">{activeTenant.name}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Two-Factor Auth</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active (WhatsApp OTP)
                </span>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  handleTabClick('settings');
                }}
                className="w-full p-2.5 rounded-xl bg-[#111C33]/40 hover:bg-[#162544] border border-[#1E293B] hover:border-slate-600 transition flex items-center justify-between text-left text-slate-300 hover:text-white cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <SettingsIcon className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-xs">Account & Workspace Settings</div>
                    <div className="text-[10px] text-slate-400">Configure business profile, billing and team</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  handleTabClick('automation-logs');
                }}
                className="w-full p-2.5 rounded-xl bg-[#111C33]/40 hover:bg-[#162544] border border-[#1E293B] hover:border-slate-600 transition flex items-center justify-between text-left text-slate-300 hover:text-white cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-xs">Security & Audit Logs</div>
                    <div className="text-[10px] text-slate-400">View live employee sessions and login audit trails</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#1E293B] bg-[#070D18] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(false);
                addToast('Profile state authenticated as Rahul Mehta (Owner).', 'info');
              }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Verify Session
            </button>

            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(false);
                addToast('Signed out of session. Session safely saved.', 'info');
              }}
              className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition cursor-pointer flex items-center gap-1.5 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── 3. Qiyam OS Help & Shortcuts Modal ── */}
    {isHelpOpen && (
      <div
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        onClick={() => setIsHelpOpen(false)}
      >
        <div
          className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#111C33]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Qiyam Business OS Help</h3>
                <p className="text-[11px] text-slate-400">Documentation & Shortcuts</p>
              </div>
            </div>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {/* Keyboard shortcuts */}
            <div className="bg-[#111C33]/60 rounded-xl p-3 border border-[#1E293B] space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Keyboard Shortcuts</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Omni Universal Search</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[10px]">Ctrl + /</kbd>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Toggle Sidebar Collapse</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[10px]">Ctrl + B</kbd>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Close Open Modal / Dialog</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[10px]">Esc</kbd>
              </div>
            </div>

            {/* Quick Knowledge Links */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsHelpOpen(false);
                  handleTabClick('ai-knowledgebase');
                }}
                className="w-full p-2.5 rounded-xl bg-[#111C33]/40 hover:bg-[#162544] border border-[#1E293B] hover:border-slate-600 transition flex items-center justify-between text-left text-slate-300 hover:text-white cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-xs">Knowledge Base & Guides</div>
                    <div className="text-[10px] text-slate-400">Access operating SOPs, FAQs and training docs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsSimulatorOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-[#111C33]/40 hover:bg-[#162544] border border-[#1E293B] hover:border-slate-600 transition flex items-center justify-between text-left text-slate-300 hover:text-white cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <div>
                    <div className="font-semibold text-xs">WhatsApp Cloud Simulator</div>
                    <div className="text-[10px] text-slate-400">Simulate incoming customer queries & AI bots</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#1E293B] bg-[#070D18] flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};


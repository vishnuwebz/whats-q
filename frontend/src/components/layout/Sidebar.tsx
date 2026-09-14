import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { TabType } from '../../types';
import {
  LayoutDashboard, MessageSquare, Users, Briefcase, DollarSign,
  Zap, Bot, BarChart3, Puzzle, Settings as SettingsIcon,
  ChevronDown, ChevronRight, UserCheck, Calendar, Clock,
  CheckSquare, Navigation, Package, Receipt, FileText,
  CreditCard, Wallet, BookOpen, Layers, GitBranch,
  ShieldCheck, HelpCircle, PhoneCall, Sparkles, Plus,
  PanelLeftClose, PanelLeftOpen, X
} from 'lucide-react';

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
    conversations
  } = useQiyamStore();

  const isCollapsed = isSidebarCollapsed && !isMobileSidebarOpen;

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  const unreadConversationsCount = (conversations || []).reduce(
    (sum, c) => sum + (c.unread_count || 0),
    0
  );

  // Keyboard shortcut Ctrl+B / Cmd+B for collapse
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse]);

  // Accordion states
  const [crmOpen, setCrmOpen] = useState(true);
  const [opsOpen, setOpsOpen] = useState(true);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);

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
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-bold text-white tracking-wide text-base leading-tight">WhatsQ</div>
                <div className="text-[11px] text-emerald-400 font-medium truncate">Qiyam Business Solutions</div>
              </div>
            )}
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

        {/* Navigation Links (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-800">
          {/* Dashboard */}
          <button
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

        {/* Conversations */}
        <button
          onClick={() => handleTabClick('conversations')}
          title={`Conversations${unreadConversationsCount > 0 ? ` (${unreadConversationsCount} unread)` : ''}`}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5 relative' : 'justify-between px-3 py-2'} rounded-lg transition-all ${
            isActive('conversations')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Conversations</span>}
          </div>
          {unreadConversationsCount > 0 && (
            isCollapsed ? (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {unreadConversationsCount}
              </span>
            )
          )}
        </button>

        {/* CRM */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => {
                toggleSidebarCollapse();
                setCrmOpen(true);
              }}
              title="CRM (Leads, Customers, Deals, Follow-ups)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                ['crm-leads', 'crm-customers', 'crm-deals', 'crm-followups'].includes(activeTab)
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setCrmOpen(!crmOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>CRM</span>
                </div>
                {crmOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {crmOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    onClick={() => handleTabClick('crm-leads')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('crm-leads') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Leads</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('crm-customers')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('crm-customers') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Customers</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('crm-deals')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('crm-deals') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Deals</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('crm-followups')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
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

        {/* Operations */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => {
                toggleSidebarCollapse();
                setOpsOpen(true);
              }}
              title="Operations (Jobs, Appointments, Employees, Schedule, Attendance, Tasks, Routes, Inventory)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                ['ops-jobs', 'ops-appointments', 'ops-employees', 'ops-schedule', 'ops-attendance', 'ops-tasks', 'ops-routes', 'ops-inventory'].includes(activeTab)
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setOpsOpen(!opsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4" />
                  <span>Operations</span>
                </div>
                {opsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {opsOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    onClick={() => handleTabClick('ops-jobs')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ops-jobs') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Jobs</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ops-appointments')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ops-appointments') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Appointments</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ops-employees')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ops-employees') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Employee Management</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ops-schedule')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ops-schedule') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ops-attendance')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ops-attendance') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Attendance</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ops-tasks')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ops-tasks') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Tasks</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ops-routes')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ops-routes') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route Optimization</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ops-inventory')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ops-inventory') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Inventory</span>
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
                setFinanceOpen(true);
              }}
              title="Finance (Overview, Transactions, Invoices, Expenses, Payments, Accounts, Reports)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                ['finance-overview', 'finance-transactions', 'finance-invoices', 'finance-expenses', 'finance-payments', 'finance-accounts', 'finance-reports', 'finance-budget'].includes(activeTab)
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setFinanceOpen(!financeOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4" />
                  <span>Finance</span>
                </div>
                {financeOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {financeOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    onClick={() => handleTabClick('finance-overview')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('finance-overview') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('finance-transactions')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('finance-transactions') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Transactions</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('finance-invoices')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('finance-invoices') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Invoices</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('finance-expenses')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('finance-expenses') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Expenses</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('finance-payments')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('finance-payments') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Payments</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('finance-accounts')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('finance-accounts') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Accounts</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('finance-reports')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
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
                setAutomationOpen(true);
              }}
              title="Automation (Workflow Builder, Workflows, Templates, Branches, Logs, Approvals)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                ['automation-builder', 'automation-workflows', 'automation-templates', 'automation-branches', 'automation-logs', 'automation-approvals'].includes(activeTab)
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-[#16233B] text-slate-300'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setAutomationOpen(!automationOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4" />
                  <span>Automation</span>
                </div>
                {automationOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {automationOpen && (
                <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-0.5 mt-1">
                  <button
                    onClick={() => handleTabClick('automation-builder')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('automation-builder') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Workflow Builder</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('automation-workflows')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('automation-workflows') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Workflows</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('automation-templates')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('automation-templates') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Templates</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('automation-branches')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('automation-branches') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Branches</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('automation-logs')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('automation-logs') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Logs</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('automation-approvals')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
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

        {/* AI Assistant */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => {
                toggleSidebarCollapse();
                setAiOpen(true);
              }}
              title="AI Assistant (Overview, Knowledge Base, Templates, Settings)"
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all relative ${
                ['ai-overview', 'ai-branches', 'ai-knowledgebase', 'ai-templates', 'template-hub', 'template-create', 'ai-settings'].includes(activeTab)
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
                onClick={() => setAiOpen(!aiOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>AI Assistant</span>
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
                    onClick={() => handleTabClick('ai-overview')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ai-overview') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ai-knowledgebase')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('ai-knowledgebase') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Knowledge Base</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('template-hub')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('template-hub') || isActive('ai-templates') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Template Hub</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      handleTabClick('template-create');
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                      isActive('template-create') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Template</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('ai-settings')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
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
          onClick={() => handleTabClick('settings')}
          title="Settings"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-lg transition-all ${
            isActive('settings')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* API Endpoints & Swagger Hub */}
        <a
          href="/api/docs/"
          target="_blank"
          rel="noopener noreferrer"
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
      </nav>

      {/* WhatsApp Connection Card & Simulator Trigger */}
      <div className={`px-3 py-2.5 border-t border-[#1E293B]/70 bg-[#070D18] ${isCollapsed ? 'flex justify-center' : ''}`}>
        {isCollapsed ? (
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="w-9 h-9 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition border border-emerald-500/30 cursor-pointer"
            title="WhatsApp Cloud API (+91 98765 43210) - Click to Simulate"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        ) : (
          <div className="bg-[#111C33] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">WhatsApp Cloud API</div>
                <div className="text-[11px] font-semibold text-white">+91 98765 43210</div>
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
            <div
              title="CoolFix Services (ID: TN2345)"
              className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30 transition"
            >
              Q
            </div>
            <div
              title="Rahul Mehta (Owner)"
              className="cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Rahul Mehta"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between bg-[#111C33]/80 p-2 rounded-lg border border-[#1E293B] cursor-pointer hover:bg-[#16233B] transition-all">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  Q
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight">CoolFix Services</div>
                  <div className="text-[9px] text-slate-400">ID: TN2345</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Rahul Mehta"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
                />
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">Rahul Mehta</div>
                  <div className="text-[10px] text-slate-400">Owner</div>
                </div>
              </div>
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-200 cursor-pointer" />
            </div>
          </>
        )}
      </div>
    </aside></>
  );
};


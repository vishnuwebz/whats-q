import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { TabType } from '../../types';
import {
  LayoutDashboard, MessageSquare, Users, Briefcase, DollarSign,
  Zap, Bot, BarChart3, Puzzle, Settings as SettingsIcon,
  ChevronDown, ChevronRight, UserCheck, Calendar, Clock,
  CheckSquare, Navigation, Package, Receipt, FileText,
  CreditCard, Wallet, BookOpen, Layers, GitBranch,
  ShieldCheck, HelpCircle, PhoneCall, Sparkles, Plus
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSimulatorOpen, setEditingTemplate } = useQiyamStore();

  // Accordion states
  const [crmOpen, setCrmOpen] = useState(true);
  const [opsOpen, setOpsOpen] = useState(true);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);

  const isActive = (tab: TabType) => activeTab === tab;

  return (
    <aside className="w-64 bg-[#0B1528] text-slate-300 flex flex-col h-screen shrink-0 border-r border-[#1E293B] select-none font-sans overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-[#1E293B]/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/30">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div className="font-bold text-white tracking-wide text-base leading-tight">WhatsQ</div>
          <div className="text-[11px] text-emerald-400 font-medium">Qiyam Business Solutions</div>
        </div>
      </div>

      {/* Navigation Links (Scrollable) */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-800">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            isActive('dashboard')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        {/* Conversations */}
        <button
          onClick={() => setActiveTab('conversations')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
            isActive('conversations')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4" />
            <span>Conversations</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            24
          </span>
        </button>

        {/* CRM */}
        <div>
          <button
            onClick={() => setCrmOpen(!crmOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all"
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
                onClick={() => setActiveTab('crm-leads')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('crm-leads') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Leads</span>
              </button>
              <button
                onClick={() => setActiveTab('crm-customers')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('crm-customers') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Customers</span>
              </button>
              <button
                onClick={() => setActiveTab('crm-deals')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('crm-deals') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Deals</span>
              </button>
              <button
                onClick={() => setActiveTab('crm-followups')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('crm-followups') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Follow-ups</span>
              </button>
            </div>
          )}
        </div>

        {/* Operations */}
        <div>
          <button
            onClick={() => setOpsOpen(!opsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all"
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
                onClick={() => setActiveTab('ops-jobs')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ops-jobs') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Jobs</span>
              </button>
              <button
                onClick={() => setActiveTab('ops-appointments')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ops-appointments') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Appointments</span>
              </button>
              <button
                onClick={() => setActiveTab('ops-employees')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ops-employees') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Employee Management</span>
              </button>
              <button
                onClick={() => setActiveTab('ops-schedule')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ops-schedule') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </button>
              <button
                onClick={() => setActiveTab('ops-attendance')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ops-attendance') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Attendance</span>
              </button>
              <button
                onClick={() => setActiveTab('ops-tasks')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ops-tasks') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks</span>
              </button>
              <button
                onClick={() => setActiveTab('ops-routes')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ops-routes') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Route Optimization</span>
              </button>
              <button
                onClick={() => setActiveTab('ops-inventory')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ops-inventory') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Inventory</span>
              </button>
            </div>
          )}
        </div>

        {/* Finance */}
        <div>
          <button
            onClick={() => setFinanceOpen(!financeOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all"
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
                onClick={() => setActiveTab('finance-overview')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('finance-overview') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('finance-transactions')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('finance-transactions') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Transactions</span>
              </button>
              <button
                onClick={() => setActiveTab('finance-invoices')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('finance-invoices') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices</span>
              </button>
              <button
                onClick={() => setActiveTab('finance-expenses')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('finance-expenses') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Expenses</span>
              </button>
              <button
                onClick={() => setActiveTab('finance-payments')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('finance-payments') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Payments</span>
              </button>
              <button
                onClick={() => setActiveTab('finance-accounts')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('finance-accounts') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Accounts</span>
              </button>
              <button
                onClick={() => setActiveTab('finance-reports')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('finance-reports') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Reports</span>
              </button>
            </div>
          )}
        </div>

        {/* Automation */}
        <div>
          <button
            onClick={() => setAutomationOpen(!automationOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all"
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
                onClick={() => setActiveTab('automation-builder')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('automation-builder') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Workflow Builder</span>
              </button>
              <button
                onClick={() => setActiveTab('automation-workflows')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('automation-workflows') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Workflows</span>
              </button>
              <button
                onClick={() => setActiveTab('automation-templates')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('automation-templates') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => setActiveTab('automation-branches')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('automation-branches') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Branches</span>
              </button>
              <button
                onClick={() => setActiveTab('automation-logs')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('automation-logs') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Logs</span>
              </button>
              <button
                onClick={() => setActiveTab('automation-approvals')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('automation-approvals') ? 'bg-emerald-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approvals</span>
              </button>
            </div>
          )}
        </div>

        {/* AI Assistant */}
        <div>
          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#16233B] text-slate-300 transition-all"
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
                onClick={() => setActiveTab('ai-overview')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ai-overview') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('ai-knowledgebase')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ai-knowledgebase') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge Base</span>
              </button>
              <button
                onClick={() => setActiveTab('template-hub')}
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
                  setActiveTab('template-create');
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('template-create') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Template</span>
              </button>
              <button
                onClick={() => setActiveTab('ai-settings')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all ${
                  isActive('ai-settings') ? 'bg-purple-600/90 text-white font-semibold' : 'hover:bg-[#16233B] text-slate-400'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Analytics */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            isActive('analytics')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        {/* Integrations */}
        <button
          onClick={() => setActiveTab('integrations')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            isActive('integrations')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <Puzzle className="w-4 h-4" />
          <span>Integrations</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            isActive('settings')
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'hover:bg-[#16233B] text-slate-300'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* WhatsApp Connection Card & Simulator Trigger */}
      <div className="px-3 py-2.5 border-t border-[#1E293B]/70 bg-[#070D18]">
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
            className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded font-medium shadow transition-all"
            title="Simulate Inbound WhatsApp Message"
          >
            Simulate
          </button>
        </div>
      </div>

      {/* Tenant Selector & Profile Footer */}
      <div className="p-3 border-t border-[#1E293B] bg-[#09101F] space-y-2">
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
      </div>
    </aside>
  );
};


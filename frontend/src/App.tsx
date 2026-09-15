import React from 'react';
import { useQiyamStore } from './store/useQiyamStore';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { WhatsAppSimulatorModal } from './components/common/WhatsAppSimulatorModal';
import { SystemUpdateModal } from './components/common/SystemUpdateModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { realtimeSyncManager } from './api/realtimeSync';
import { ChevronRight } from 'lucide-react';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ConversationsView } from './components/views/ConversationsView';

// CRM Views
import { LeadsView } from './components/views/crm/LeadsView';
import { DealsView } from './components/views/crm/DealsView';
import { FollowupsView } from './components/views/crm/FollowupsView';
import { CustomersView } from './components/views/crm/CustomersView';

// Operations Views
import { JobsView } from './components/views/operations/JobsView';
import { AppointmentsView } from './components/views/operations/AppointmentsView';
import { EmployeesView } from './components/views/operations/EmployeesView';
import { ScheduleView } from './components/views/operations/ScheduleView';
import { AttendanceView } from './components/views/operations/AttendanceView';
import { TasksView } from './components/views/operations/TasksView';
import { RouteOptimizationView } from './components/views/operations/RouteOptimizationView';
import { InventoryView } from './components/views/operations/InventoryView';

// Finance Views
import { FinanceOverviewView } from './components/views/finance/FinanceOverviewView';
import { TransactionsView } from './components/views/finance/TransactionsView';
import { InvoicesView } from './components/views/finance/InvoicesView';
import { ExpensesView } from './components/views/finance/ExpensesView';
import { PaymentsView } from './components/views/finance/PaymentsView';
import { AccountsView } from './components/views/finance/AccountsView';
import { ReportsView } from './components/views/finance/ReportsView';

// Automation Views
import { WorkflowBuilderView } from './components/views/automation/WorkflowBuilderView';
import { WorkflowsView } from './components/views/automation/WorkflowsView';
import { AutomationTemplatesView } from './components/views/automation/AutomationTemplatesView';
import { BranchesView } from './components/views/automation/BranchesView';
import { AutomationLogsView } from './components/views/automation/AutomationLogsView';
import { ApprovalsView } from './components/views/automation/ApprovalsView';

// AI Views
import { AIAssistantView } from './components/views/ai/AIAssistantView';
import { KnowledgeBaseView } from './components/views/ai/KnowledgeBaseView';
import { AITemplatesView } from './components/views/ai/AITemplatesView';
import { TemplateHubView } from './components/views/ai/TemplateHubView';
import { CreateTemplateView } from './components/views/ai/CreateTemplateView';
import { AISettingsView } from './components/views/ai/AISettingsView';

// Other Views
import { AnalyticsView } from './components/views/AnalyticsView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { SettingsView } from './components/views/SettingsView';

// Bulk Messaging Views
import { BulkSendMessageView } from './components/views/bulk/BulkSendMessageView';
import { BulkTemplatesView } from './components/views/bulk/BulkTemplatesView';
import { BulkCampaignHistoryView } from './components/views/bulk/BulkCampaignHistoryView';
import { BulkRecipientListsView } from './components/views/bulk/BulkRecipientListsView';
import { BulkScheduledMessagesView } from './components/views/bulk/BulkScheduledMessagesView';
import { TabType } from './types';

const TAB_TO_PATH: Record<TabType, string> = {
  'dashboard': '/dashboard',
  'conversations': '/conversations',
  'bulk-send': '/bulk/send',
  'bulk-templates': '/bulk/templates',
  'bulk-campaigns': '/bulk/campaigns',
  'bulk-recipients': '/bulk/recipients',
  'bulk-scheduled': '/bulk/scheduled',
  'crm-leads': '/crm/leads',
  'crm-deals': '/crm/deals',
  'crm-followups': '/crm/followups',
  'crm-customers': '/crm/customers',
  'ops-jobs': '/operations/jobs',
  'ops-appointments': '/operations/appointments',
  'ops-employees': '/operations/employees',
  'ops-schedule': '/operations/schedule',
  'ops-attendance': '/operations/attendance',
  'ops-tasks': '/operations/tasks',
  'ops-routes': '/operations/routes',
  'ops-inventory': '/operations/inventory',
  'finance-overview': '/finance/overview',
  'finance-transactions': '/finance/transactions',
  'finance-invoices': '/finance/invoices',
  'finance-expenses': '/finance/expenses',
  'finance-budget': '/finance/budget',
  'finance-payments': '/finance/payments',
  'finance-accounts': '/finance/accounts',
  'finance-reports': '/finance/reports',
  'automation-builder': '/automation/builder',
  'automation-workflows': '/automation/workflows',
  'automation-templates': '/automation/templates',
  'automation-branches': '/automation/branches',
  'automation-logs': '/automation/logs',
  'automation-approvals': '/automation/approvals',
  'ai-overview': '/ai/overview',
  'ai-branches': '/ai/branches',
  'ai-knowledgebase': '/ai/knowledgebase',
  'ai-templates': '/ai/templates',
  'template-hub': '/template-hub',
  'template-create': '/template-create',
  'ai-settings': '/ai/settings',
  'analytics': '/analytics',
  'integrations': '/integrations',
  'settings': '/settings',
};

const resolveTabFromPath = (path: string): TabType => {
  const normalized = path.toLowerCase().replace(/\/$/, '') || '/dashboard';
  for (const [tab, p] of Object.entries(TAB_TO_PATH)) {
    if (p === normalized || `/${tab}` === normalized) {
      return tab as TabType;
    }
  }
  return 'dashboard';
};

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    loadInitialData,
    fetchVersionInfo,
    isSidebarCollapsed,
    toggleSidebarCollapse,
  } = useQiyamStore();

  // 1. Initial URL routing on mount + popstate listener for browser back/forward buttons
  React.useEffect(() => {
    loadInitialData();
    fetchVersionInfo();
    realtimeSyncManager.start();

    const initialTab = resolveTabFromPath(window.location.pathname);
    setActiveTab(initialTab);

    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState(null, '', TAB_TO_PATH[initialTab]);
    }

    const handlePopState = () => {
      const poppedTab = resolveTabFromPath(window.location.pathname);
      setActiveTab(poppedTab);
    };

    window.addEventListener('popstate', handlePopState);
    const timer = setInterval(() => {
      fetchVersionInfo();
    }, 60000);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(timer);
      realtimeSyncManager.stop();
    };
  }, [loadInitialData, fetchVersionInfo, setActiveTab]);

  // 2. Sync URL address bar whenever activeTab changes
  React.useEffect(() => {
    const canonicalPath = TAB_TO_PATH[activeTab] || '/dashboard';
    const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const altPath = `/${activeTab}`;
    if (currentPath !== canonicalPath && currentPath !== altPath) {
      window.history.pushState(null, '', canonicalPath);
    }
  }, [activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'conversations':
        return <ConversationsView />;

      // Bulk Messaging
      case 'bulk-send':
        return <BulkSendMessageView />;
      case 'bulk-templates':
        return <BulkTemplatesView />;
      case 'bulk-campaigns':
        return <BulkCampaignHistoryView />;
      case 'bulk-recipients':
        return <BulkRecipientListsView />;
      case 'bulk-scheduled':
        return <BulkScheduledMessagesView />;

      // CRM
      case 'crm-leads':
        return <LeadsView />;
      case 'crm-deals':
        return <DealsView />;
      case 'crm-followups':
        return <FollowupsView />;
      case 'crm-customers':
        return <CustomersView />;

      // Operations
      case 'ops-jobs':
        return <JobsView />;
      case 'ops-appointments':
        return <AppointmentsView />;
      case 'ops-employees':
        return <EmployeesView />;
      case 'ops-schedule':
        return <ScheduleView />;
      case 'ops-attendance':
        return <AttendanceView />;
      case 'ops-tasks':
        return <TasksView />;
      case 'ops-routes':
        return <RouteOptimizationView />;
      case 'ops-inventory':
        return <InventoryView />;

      // Finance
      case 'finance-overview':
        return <FinanceOverviewView />;
      case 'finance-transactions':
        return <TransactionsView />;
      case 'finance-invoices':
        return <InvoicesView />;
      case 'finance-expenses':
      case 'finance-budget':
        return <ExpensesView />;
      case 'finance-payments':
        return <PaymentsView />;
      case 'finance-accounts':
        return <AccountsView />;
      case 'finance-reports':
        return <ReportsView />;

      // Automation
      case 'automation-builder':
        return <WorkflowBuilderView />;
      case 'automation-workflows':
        return <WorkflowsView />;
      case 'automation-templates':
        return <AutomationTemplatesView />;
      case 'automation-branches':
        return <BranchesView />;
      case 'automation-logs':
        return <AutomationLogsView />;
      case 'automation-approvals':
        return <ApprovalsView />;

      // AI Assistant
      case 'ai-overview':
      case 'ai-branches':
        return <AIAssistantView />;
      case 'ai-knowledgebase':
        return <KnowledgeBaseView />;
      case 'ai-templates':
      case 'template-hub':
        return <TemplateHubView />;
      case 'template-create':
        return <CreateTemplateView />;
      case 'ai-settings':
        return <AISettingsView />;

      // Analytics, Integrations, Settings
      case 'analytics':
        return <AnalyticsView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'settings':
        return <SettingsView />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-hidden relative">
        {/* Floating edge expander when sidebar is collapsed on desktop */}
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebarCollapse}
            className="hidden md:flex items-center justify-center fixed left-20 top-1/2 -translate-y-1/2 z-40 bg-[#0B1528] text-emerald-400 border border-[#1E293B] hover:bg-slate-800 px-1 py-3 rounded-r-lg shadow-lg transition-all hover:scale-105 cursor-pointer opacity-80 hover:opacity-100 group"
            title="Expand Sidebar (Ctrl + B)"
            aria-label="Expand Sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        <ErrorBoundary>
          {renderActiveView()}
        </ErrorBoundary>
      </main>

      <WhatsAppSimulatorModal />
      <SystemUpdateModal />
      <ToastContainer />
    </div>
  );
};

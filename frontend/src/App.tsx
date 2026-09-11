import React from 'react';
import { useQiyamStore } from './store/useQiyamStore';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { WhatsAppSimulatorModal } from './components/common/WhatsAppSimulatorModal';

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

export const App: React.FC = () => {
  const { activeTab, loadInitialData } = useQiyamStore();

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'conversations':
        return <ConversationsView />;

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
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {renderActiveView()}
      </main>

      <WhatsAppSimulatorModal />
      <ToastContainer />
    </div>
  );
};

import React from 'react';
import { useQiyamStore } from './store/useQiyamStore';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { WhatsAppSimulatorModal } from './components/common/WhatsAppSimulatorModal';
import { SystemUpdateModal } from './components/common/SystemUpdateModal';
import { GlobalSendConfirmationModal } from './components/common/GlobalSendConfirmationModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { realtimeSyncManager } from './api/realtimeSync';
import { checkAndRunAutoBackup } from './utils/backupManager';
import { initOtaUpdater } from './utils/otaUpdater';
import { ChevronRight, Zap } from 'lucide-react';

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
import { QuotationsView } from './components/views/finance/QuotationsView';
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
import { LandingPageView } from './components/views/LandingPageView';

// Bulk Messaging Views
import { BulkOverviewView } from './components/views/bulk/BulkOverviewView';
import { BulkSendMessageView } from './components/views/bulk/BulkSendMessageView';
import { BulkTemplatesView } from './components/views/bulk/BulkTemplatesView';
import { BulkCampaignHistoryView } from './components/views/bulk/BulkCampaignHistoryView';
import { BulkRecipientListsView } from './components/views/bulk/BulkRecipientListsView';
import { BulkScheduledMessagesView } from './components/views/bulk/BulkScheduledMessagesView';
import { MobileGroupGrabberPortal } from './components/views/bulk/MobileGroupGrabberPortal';
import { TabType } from './types';
import {
  TAB_TO_PATH,
  resolveTabFromPath,
  persistActiveTab,
  getInitialActiveTab,
} from './utils/tabRouting';

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    loadInitialData,
    fetchVersionInfo,
    versionInfo,
    otaCountdown,
    setIsUpdateModalOpen,
    triggerSystemUpdate,
    isSidebarCollapsed,
    toggleSidebarCollapse,
  } = useQiyamStore();

  // Check if opened via mobile QR code scan for WhatsApp Group Grabber sync
  const [mobileGrabberToken, setMobileGrabberToken] = React.useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryToken = params.get('wa_grabber_token') || params.get('wa_sync') || params.get('token');
      if (queryToken) return queryToken;

      const hash = window.location.hash;
      if (hash.includes('wa-sync')) {
        const match = hash.match(/wa-sync(?:=([a-zA-Z0-9_-]+))?/);
        return match && match[1] ? match[1] : 'qiyam_live_session';
      }
    } catch {}
    return null;
  });

  // 1. Initial URL routing on mount + popstate listener for browser back/forward buttons
  React.useEffect(() => {
    loadInitialData();
    fetchVersionInfo();
    realtimeSyncManager.start();
    const stopOta = initOtaUpdater();

    // Check if the current URL has a specific path that takes precedence
    const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (currentPath && currentPath !== '' && currentPath !== '/' && currentPath !== '/index.html') {
      const tabFromPath = resolveTabFromPath(window.location.pathname, window.location.search, window.location.hash);
      if (tabFromPath && tabFromPath !== activeTab) {
        setActiveTab(tabFromPath);
      }
    } else {
      // If root '/' or empty, ensure the browser URL reflects the restored activeTab
      const canonical = TAB_TO_PATH[activeTab] || '/dashboard';
      window.history.replaceState(null, '', canonical);
    }

    const handlePopState = () => {
      const poppedTab = resolveTabFromPath(window.location.pathname, window.location.search, window.location.hash);
      setActiveTab(poppedTab);
    };

    window.addEventListener('popstate', handlePopState);
    const timer = setInterval(() => {
      fetchVersionInfo();
    }, 60000);

    // Initial check and periodic background check for scheduled auto-backups
    try {
      checkAndRunAutoBackup();
    } catch {}
    const autoBackupTimer = setInterval(() => {
      try {
        checkAndRunAutoBackup();
      } catch {}
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(timer);
      clearInterval(autoBackupTimer);
      realtimeSyncManager.stop();
      stopOta();
    };
  }, [loadInitialData, fetchVersionInfo, setActiveTab]);

  // 2. Sync URL address bar and localStorage whenever activeTab changes
  React.useEffect(() => {
    const canonicalPath = TAB_TO_PATH[activeTab] || '/dashboard';
    const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const altPath = `/${activeTab}`;
    if (currentPath !== canonicalPath && currentPath !== altPath) {
      window.history.pushState(null, '', canonicalPath);
    }
    persistActiveTab(activeTab);
  }, [activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'conversations':
        return <ConversationsView />;

      // Bulk Messaging
      case 'bulk-overview':
        return <BulkOverviewView />;
      case 'bulk-send':
        return <BulkSendMessageView />;
      case 'bulk-templates':
        return <BulkTemplatesView />;
      case 'bulk-campaigns':
        return <BulkCampaignHistoryView />;
      case 'bulk-recipients':
        return <BulkRecipientListsView initialViewMode="lists" />;
      case 'bulk-suppression':
        return <BulkRecipientListsView initialViewMode="suppression" />;
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
      case 'finance-quotations':
        return <QuotationsView />;
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
      case 'branches':
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
        return <AITemplatesView />;
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
        return <SettingsView initialTab="general" />;
      case 'settings-backup':
        return <SettingsView initialTab="backup" />;
      case 'settings-whatsapp':
        return <SettingsView initialTab="whatsapp" />;

      default:
        return <DashboardView />;
    }
  };

  if (mobileGrabberToken) {
    return (
      <MobileGroupGrabberPortal
        sessionToken={mobileGrabberToken}
        onExit={() => {
          setMobileGrabberToken(null);
          window.history.replaceState(null, '', '/');
        }}
      />
    );
  }

  if (activeTab === 'landing') {
    return (
      <LandingPageView
        onLaunchApp={() => {
          setActiveTab('dashboard');
          window.history.pushState(null, '', '/dashboard');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-hidden relative">
        {/* Sticky OTA Update Banner */}
        {versionInfo?.update_available && (
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-b border-emerald-500/30 text-white px-3 sm:px-4 py-2 flex items-center justify-between z-30 shrink-0 text-xs shadow-md animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold text-emerald-300 shrink-0">New Production Update Deployed</span>
              <span className="text-slate-300 truncate hidden md:inline">• {versionInfo.latest_message || 'Latest release ready'}</span>
              {otaCountdown !== null && (
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold text-[11px] border border-emerald-500/30 shrink-0">
                  Hard refreshing in {otaCountdown}s
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                onClick={() => triggerSystemUpdate()}
                className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Hard Refresh Now</span>
              </button>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-[11px] transition cursor-pointer"
              >
                Details
              </button>
            </div>
          </div>
        )}

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
      <GlobalSendConfirmationModal />
      <ToastContainer />
    </div>
  );
};

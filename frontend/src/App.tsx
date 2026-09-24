import React from 'react';
import { useQiyamStore } from './store/useQiyamStore';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { WhatsAppSimulatorModal } from './components/common/WhatsAppSimulatorModal';
import { GlobalSendConfirmationModal } from './components/common/GlobalSendConfirmationModal';
import { GlobalGeneralConfirmationModal } from './components/common/GlobalGeneralConfirmationModal';
import { AdvancedPdfEditorModal } from './components/common/AdvancedPdfEditorModal';
import { UserProfileModal } from './components/common/UserProfileModal';
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
import { EmployeeDirectoryView } from './components/views/operations/employee/EmployeeDirectoryView';
import { EmployeeProfilesView } from './components/views/operations/employee/EmployeeProfilesView';
import { EmployeeAttendanceView } from './components/views/operations/employee/EmployeeAttendanceView';
import { EmployeeLeavesView } from './components/views/operations/employee/EmployeeLeavesView';
import { EmployeeMonitoringView } from './components/views/operations/employee/EmployeeMonitoringView';
import { EmployeeBreaksView } from './components/views/operations/employee/EmployeeBreaksView';
import { EmployeePerformanceView } from './components/views/operations/employee/EmployeePerformanceView';
import { EmployeeProductivityView } from './components/views/operations/employee/EmployeeProductivityView';
import { EmployeeRewardsView } from './components/views/operations/employee/EmployeeRewardsView';
import { EmployeeVouchersView } from './components/views/operations/employee/EmployeeVouchersView';
import { EmployeeOvertimeView } from './components/views/operations/employee/EmployeeOvertimeView';
import { EmployeeOnboardingView } from './components/views/operations/employee/EmployeeOnboardingView';
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
import { PayrollView } from './components/views/finance/payroll/PayrollView';

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
import { RolesSecurityView } from './components/views/roles/RolesSecurityView';
import { SuperAdminView } from './components/views/admin/SuperAdminView';

// Bulk Messaging Views
import { BulkOverviewView } from './components/views/bulk/BulkOverviewView';
import { BulkSendMessageView } from './components/views/bulk/BulkSendMessageView';
import { BulkTemplatesView } from './components/views/bulk/BulkTemplatesView';
import { BulkCampaignHistoryView } from './components/views/bulk/BulkCampaignHistoryView';
import { BulkRecipientListsView } from './components/views/bulk/BulkRecipientListsView';
import { BulkScheduledMessagesView } from './components/views/bulk/BulkScheduledMessagesView';
import { MobileGroupGrabberPortal } from './components/views/bulk/MobileGroupGrabberPortal';
import { FeaturePaywallGate } from './components/common/FeaturePaywallGate';
import { getModuleForTab, useActiveTenant } from './utils/featureEntitlements';
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
    triggerForceHardRefresh,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    activeTenant,
    reloadPlatformTenants,
  } = useQiyamStore();

  // Run periodic trial expiration checks and WhatsApp alerts in background
  useActiveTenant();

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
    const rawView = (() => {
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
      case 'ops-emp-directory':
        return <EmployeeDirectoryView />;
      case 'ops-emp-profiles':
        return <EmployeeProfilesView />;
      case 'ops-emp-attendance':
        return <EmployeeAttendanceView />;
      case 'ops-emp-leaves':
        return <EmployeeLeavesView />;
      case 'ops-emp-monitoring':
        return <EmployeeMonitoringView />;
      case 'ops-emp-breaks':
        return <EmployeeBreaksView />;
      case 'ops-emp-performance':
        return <EmployeePerformanceView />;
      case 'ops-emp-productivity':
        return <EmployeeProductivityView />;
      case 'ops-emp-rewards':
        return <EmployeeRewardsView />;
      case 'ops-emp-vouchers':
        return <EmployeeVouchersView />;
      case 'ops-emp-overtime':
        return <EmployeeOvertimeView />;
      case 'ops-emp-onboarding':
        return <EmployeeOnboardingView />;
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
      case 'finance-payroll':
        return <PayrollView />;

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
      case 'roles':
        return <RolesSecurityView />;
      case 'super-admin':
        return <SuperAdminView />;

      default:
        return <DashboardView />;
    }
  })();

  const targetModule = getModuleForTab(activeTab);
  if (targetModule && activeTab !== 'super-admin' && activeTab !== 'dashboard') {
    return (
      <FeaturePaywallGate
        key={`${activeTenant?.id || 'TN2345'}-${targetModule}-${activeTab}`}
        moduleId={targetModule}
        activeTenant={activeTenant}
        onUnlocked={() => {
          reloadPlatformTenants();
        }}
      >
        {rawView}
      </FeaturePaywallGate>
    );
  }

  return rawView;
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
        {/* Real-time System Update Banner — Only placed at the top when update available */}
        {versionInfo && versionInfo.update_available && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-4 py-2.5 text-xs flex items-center justify-between border-b border-emerald-500/30 shadow-md shrink-0 animate-in slide-in-from-top duration-300 z-30">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold text-emerald-300 shrink-0">New Production Update Available</span>
              <span className="text-slate-300 truncate hidden md:inline">• {versionInfo.latest_message || 'Latest release ready'}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                onClick={() => triggerForceHardRefresh('Top update banner clicked')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Hard Refresh Now</span>
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
      <GlobalSendConfirmationModal />
      <GlobalGeneralConfirmationModal />
      <AdvancedPdfEditorModal />
      <UserProfileModal />
      <ToastContainer />
    </div>
  );
};

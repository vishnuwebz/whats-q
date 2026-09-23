import React, { useState, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  LayoutDashboard, Play, Layers, Receipt, ShieldCheck,
  Zap, BarChart3, Settings, ArrowLeft, Plus, CheckCircle2,
  Calendar, FileText, ChevronRight, X, Users, Wallet
} from 'lucide-react';
import {
  PayrollSubView,
  PayrollRunItem,
  EmployeeSalaryDetail,
  SalaryStructure,
  EmployeeSalaryAssignment,
  ReimbursementItem,
  EmployeeTaxCompliance,
  OffCyclePaymentItem,
  PayrollReportItem,
  PayrollSettingsState
} from '@/types';
import {
  INITIAL_PAYROLL_RUNS,
  INITIAL_EMPLOYEE_SALARY_DETAILS,
  INITIAL_SALARY_STRUCTURES,
  INITIAL_EMPLOYEE_ASSIGNMENTS,
  INITIAL_REIMBURSEMENTS,
  INITIAL_TAX_COMPLIANCE,
  INITIAL_OFF_CYCLE_RUNS,
  INITIAL_PAYROLL_REPORTS,
  INITIAL_PAYROLL_SETTINGS,
  getPayrollCache,
  setPayrollCache
} from './payrollData';

import { PayrollDashboardView } from './PayrollDashboardView';
import { RunPayrollView } from './RunPayrollView';
import { ManageSalaryView } from './ManageSalaryView';
import { ReimbursementsView } from './ReimbursementsView';
import { TaxComplianceView } from './TaxComplianceView';
import { OffCyclePayrollView } from './OffCyclePayrollView';
import { PayrollReportsView } from './PayrollReportsView';
import { PayrollSettingsView } from './PayrollSettingsView';

export const PayrollView: React.FC = () => {
  const store = useQiyamStore();
  const { addToast, employees: storeEmployees } = store;

  // Navigation State
  const [currentView, setCurrentView] = useState<PayrollSubView>('overview');

  // Master State with LocalStorage Persistence
  const [runs, setRuns] = useState<PayrollRunItem[]>(() =>
    getPayrollCache('runs', INITIAL_PAYROLL_RUNS)
  );

  // Sync with store employees if available
  const [employees, setEmployees] = useState<EmployeeSalaryDetail[]>(() => {
    let cached = getPayrollCache('employees', INITIAL_EMPLOYEE_SALARY_DETAILS);
    if (!cached || cached.length < 32 || !cached[0]?.daily_wage) {
      cached = INITIAL_EMPLOYEE_SALARY_DETAILS;
      setPayrollCache('employees', INITIAL_EMPLOYEE_SALARY_DETAILS);
    }
    if (storeEmployees && storeEmployees.length > 0) {
      // Ensure all store employees are mapped
      const existingIds = new Set(cached.map((e) => e.employee_id));
      const newItems: EmployeeSalaryDetail[] = storeEmployees
        .filter((se) => !existingIds.has(se.employee_id_str || `EMP-${se.id}`))
        .map((se, idx) => ({
          id: cached.length + idx + 1,
          employee_id: se.employee_id_str || `EMP0${se.id}`,
          name: se.name,
          email: se.email || `${se.name.toLowerCase().replace(/\s+/g, '.')}@qiyam.com`,
          department: se.department || 'Operations',
          payroll_group: `${se.department || 'Operations'} Team`,
          gross_salary: 35000 + (Number(se.id) * 3000),
          deductions: 5000,
          net_pay: 30000 + (Number(se.id) * 3000),
          status: 'Ready',
          bank_account: 'HDFC ••••' + (1000 + Number(se.id)),
          pan_number: 'ABCPS' + (1000 + Number(se.id)) + 'Z',
          uan_number: '100234567' + (100 + Number(se.id)),
        }));
      if (newItems.length > 0) {
        const merged = [...cached, ...newItems];
        setPayrollCache('employees', merged);
        return merged;
      }
    }
    return cached;
  });

  const [structures, setStructures] = useState<SalaryStructure[]>(() =>
    getPayrollCache('structures', INITIAL_SALARY_STRUCTURES)
  );
  const [assignments, setAssignments] = useState<EmployeeSalaryAssignment[]>(() =>
    getPayrollCache('assignments', INITIAL_EMPLOYEE_ASSIGNMENTS)
  );
  const [reimbursements, setReimbursements] = useState<ReimbursementItem[]>(() =>
    getPayrollCache('reimbursements', INITIAL_REIMBURSEMENTS)
  );
  const [taxRecords, setTaxRecords] = useState<EmployeeTaxCompliance[]>(() =>
    getPayrollCache('tax', INITIAL_TAX_COMPLIANCE)
  );
  const [offCyclePayments, setOffCyclePayments] = useState<OffCyclePaymentItem[]>(() =>
    getPayrollCache('offcycle', INITIAL_OFF_CYCLE_RUNS)
  );
  const [reports, setReports] = useState<PayrollReportItem[]>(() =>
    getPayrollCache('reports', INITIAL_PAYROLL_REPORTS)
  );
  const [settings, setSettings] = useState<PayrollSettingsState>(() =>
    getPayrollCache('settings', INITIAL_PAYROLL_SETTINGS)
  );

  // Inspector state for viewing past runs
  const [viewingRun, setViewingRun] = useState<PayrollRunItem | null>(null);

  // Scroll ref for horizontal tab bar
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Enable PC mouse wheel horizontal scrolling on the sub-nav tab bar
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Smooth scroll active tab into view when switched
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentView]);

  // Pending reimbursements count
  const pendingReimbursementsCount = reimbursements.filter((r) => r.status === 'Pending').length;

  // Navigation tabs config aligned with Qiyam style
  const navTabs: {
    id: PayrollSubView;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'run-payroll', label: 'Run Payroll', icon: Play },
    { id: 'manage-salary', label: 'Manage Salary', icon: Layers },
    {
      id: 'reimbursements',
      label: 'Reimbursements',
      icon: Receipt,
      badge: pendingReimbursementsCount > 0 ? pendingReimbursementsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    { id: 'tax-compliance', label: 'Tax & Compliance', icon: ShieldCheck },
    { id: 'off-cycle', label: 'Off-Cycle Payroll', icon: Zap },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Dynamic header actions
  const getHeaderDetails = () => {
    switch (currentView) {
      case 'overview':
        return {
          title: 'Payroll & Compensation Management',
          subtitle: 'Automate salary disbursements, verify attendance deductions, and maintain statutory compliance.',
          actionLabel: 'Run Monthly Payroll',
          onAction: () => setCurrentView('run-payroll'),
        };
      case 'run-payroll':
        return {
          title: 'Run Payroll Wizard',
          subtitle: '4-step guided payroll calculation, employee verification, exception alerts, and batch credit.',
          actionLabel: 'Back to Dashboard',
          onAction: () => setCurrentView('overview'),
        };
      case 'manage-salary':
        return {
          title: 'Manage Salary Structures',
          subtitle: 'Define flexible CTC structures, salary components, employee assignments, and increments.',
          actionLabel: 'Run Payroll',
          onAction: () => setCurrentView('run-payroll'),
        };
      case 'reimbursements':
        return {
          title: 'Employee Reimbursements',
          subtitle: 'Track travel, food, internet, and office expenses with 1-click approvals and policy limits.',
          actionLabel: 'Run Payroll',
          onAction: () => setCurrentView('run-payroll'),
        };
      case 'tax-compliance':
        return {
          title: 'Statutory Tax & Compliance',
          subtitle: 'Monthly TDS calculations, New vs Old Regime tracking, PF UAN, ESI, and Professional Tax.',
          actionLabel: 'Export Statement',
          onAction: () => addToast('Tax compliance statement exported', 'success'),
        };
      case 'off-cycle':
        return {
          title: 'Off-Cycle Disbursements',
          subtitle: 'Process performance bonuses, sales incentives, retroactive arrears, and one-off rewards.',
          actionLabel: 'Run Payroll',
          onAction: () => setCurrentView('run-payroll'),
        };
      case 'reports':
        return {
          title: 'Payroll Analytics & Reports',
          subtitle: 'In-depth cost trends, department allocations, CSV statements, and custom report exports.',
          actionLabel: 'Run Payroll',
          onAction: () => setCurrentView('run-payroll'),
        };
      case 'settings':
        return {
          title: 'Payroll Settings & Rules',
          subtitle: 'Configure pay schedules, statutory registration numbers, payslip templates, and bank formats.',
          actionLabel: 'Run Payroll',
          onAction: () => setCurrentView('run-payroll'),
        };
    }
  };

  const headerInfo = getHeaderDetails();

  // Handlers for updating master state
  const handlePayrollCompleted = (newRun: PayrollRunItem) => {
    const updated = [newRun, ...runs.filter((r) => r.id !== newRun.id)];
    setRuns(updated);
    setPayrollCache('runs', updated);
    setCurrentView('overview');
    addToast(`Payroll for ${newRun.month} processed and disbursed successfully!`, 'success');
  };

  const handleAddStructure = (newStructure: SalaryStructure) => {
    const updated = [newStructure, ...structures];
    setStructures(updated);
    setPayrollCache('structures', updated);
    addToast(`Salary structure "${newStructure.name}" created!`, 'success');
  };

  const handleUpdateStructure = (updatedStructure: SalaryStructure) => {
    const updated = structures.map((s) => (s.id === updatedStructure.id ? updatedStructure : s));
    setStructures(updated);
    setPayrollCache('structures', updated);
    addToast(`Salary structure "${updatedStructure.name}" updated!`, 'success');
  };

  const handleUpdateAssignments = (updatedAssignments: EmployeeSalaryAssignment[]) => {
    setAssignments(updatedAssignments);
    setPayrollCache('assignments', updatedAssignments);
    addToast('Employee salary assignments updated!', 'success');
  };

  const handleAddReimbursement = (newItem: ReimbursementItem) => {
    const updated = [newItem, ...reimbursements];
    setReimbursements(updated);
    setPayrollCache('reimbursements', updated);
    addToast(`Reimbursement claim of ₹${newItem.amount.toLocaleString()} submitted for ${newItem.employee_name}!`, 'success');
  };

  const handleUpdateReimbursementStatus = (id: string | number, status: ReimbursementItem['status']) => {
    const updated = reimbursements.map((r) => (r.id === id ? { ...r, status } : r));
    setReimbursements(updated);
    setPayrollCache('reimbursements', updated);
    addToast(`Claim marked as ${status}!`, 'success');
  };

  const handleUpdateTaxRecord = (updatedRecord: EmployeeTaxCompliance) => {
    const updated = taxRecords.map((t) => (t.id === updatedRecord.id ? updatedRecord : t));
    setTaxRecords(updated);
    setPayrollCache('tax', updated);
    addToast(`Tax & compliance details updated for ${updatedRecord.employee_name}!`, 'success');
  };

  const handleAddOffCyclePayment = (newItem: OffCyclePaymentItem) => {
    const updated = [newItem, ...offCyclePayments];
    setOffCyclePayments(updated);
    setPayrollCache('offcycle', updated);
    addToast(`Off-cycle payment of ₹${newItem.amount.toLocaleString()} disbursed to ${newItem.employee_name}!`, 'success');
  };

  const handleGenerateReport = (newReport: PayrollReportItem) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    setPayrollCache('reports', updated);
    addToast(`Generated ${newReport.name} for ${newReport.period}!`, 'success');
  };

  const handleUpdateSettings = (newSettings: PayrollSettingsState) => {
    setSettings(newSettings);
    setPayrollCache('settings', newSettings);
    addToast('Payroll settings saved successfully!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      {/* Pinned Top Navigation Bar & Sub-Nav Toolbar */}
      <div className="sticky top-0 z-30 bg-white shadow-xs shrink-0">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          primaryActionLabel={headerInfo.actionLabel}
          onPrimaryAction={headerInfo.onAction}
        />

        {/* Unified Secondary Sub-Navigation Bar matching Qiyam design pattern */}
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="px-4 sm:px-6">
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2.5"
            >
              {navTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = currentView === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-active={isActive ? 'true' : undefined}
                    onClick={() => {
                      setViewingRun(null);
                      setCurrentView(tab.id);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full border ${
                          isActive
                            ? 'bg-white text-emerald-800 border-white/60'
                            : tab.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-3 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {currentView === 'overview' && (
          <PayrollDashboardView
            runs={runs}
            onNavigate={(view) => setCurrentView(view)}
            onViewRun={(run) => setViewingRun(run)}
          />
        )}

        {currentView === 'run-payroll' && (
          <RunPayrollView
            employees={employees}
            onBackToDashboard={() => setCurrentView('overview')}
            onPayrollCompleted={handlePayrollCompleted}
          />
        )}

        {currentView === 'manage-salary' && (
          <ManageSalaryView
            structures={structures}
            assignments={assignments}
            onAddStructure={handleAddStructure}
            onUpdateStructure={handleUpdateStructure}
            onUpdateAssignments={handleUpdateAssignments}
          />
        )}

        {currentView === 'reimbursements' && (
          <ReimbursementsView
            reimbursements={reimbursements}
            onAddReimbursement={handleAddReimbursement}
            onUpdateStatus={handleUpdateReimbursementStatus}
          />
        )}

        {currentView === 'tax-compliance' && (
          <TaxComplianceView
            records={taxRecords}
            onUpdateRecord={handleUpdateTaxRecord}
          />
        )}

        {currentView === 'off-cycle' && (
          <OffCyclePayrollView
            payments={offCyclePayments}
            onAddPayment={handleAddOffCyclePayment}
          />
        )}

        {currentView === 'reports' && (
          <PayrollReportsView
            reports={reports}
            onNavigate={(view) => setCurrentView(view)}
            onGenerateReport={handleGenerateReport}
          />
        )}

        {currentView === 'settings' && (
          <PayrollSettingsView
            settings={settings}
            onNavigate={(view) => setCurrentView(view)}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* View Run Detail Modal */}
      {viewingRun && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Payroll Cycle Details</h3>
                <p className="text-xs text-slate-500">{viewingRun.month} • {viewingRun.processed_on}</p>
              </div>
              <button
                onClick={() => setViewingRun(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block">Employees</span>
                <span className="text-base font-black text-slate-900 font-mono">{viewingRun.employees_count}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block">Payment Status</span>
                <span className={`inline-flex px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold ${
                  viewingRun.payment_status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {viewingRun.payment_status}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block">Gross Amount</span>
                <span className="text-base font-black text-slate-900 font-mono">₹{viewingRun.gross_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block">Net Amount Disbursed</span>
                <span className="text-base font-black text-emerald-600 font-mono">₹{viewingRun.net_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {viewingRun.notes && (
              <div className="text-xs text-slate-600 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                <span className="font-bold text-emerald-900 block mb-0.5">Notes:</span>
                {viewingRun.notes}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingRun(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewingRun(null);
                  setCurrentView('reports');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                View Statements in Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

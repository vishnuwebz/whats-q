import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Play, Layers, Receipt, ShieldCheck,
  Zap, BarChart3, Settings, ArrowLeft, Plus, CheckCircle2,
  Calendar, FileText, ChevronRight, X
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
  // Navigation State
  const [currentView, setCurrentView] = useState<PayrollSubView>('overview');

  // Master State with LocalStorage Persistence
  const [runs, setRuns] = useState<PayrollRunItem[]>(() =>
    getPayrollCache('runs', INITIAL_PAYROLL_RUNS)
  );
  const [employees, setEmployees] = useState<EmployeeSalaryDetail[]>(() =>
    getPayrollCache('employees', INITIAL_EMPLOYEE_SALARY_DETAILS)
  );
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

  // Navigation tabs config
  const navTabs: { id: PayrollSubView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'run-payroll', label: 'Run Payroll', icon: Play },
    { id: 'manage-salary', label: 'Manage Salary', icon: Layers },
    { id: 'reimbursements', label: 'Reimbursements', icon: Receipt },
    { id: 'tax-compliance', label: 'Tax & Compliance', icon: ShieldCheck },
    { id: 'off-cycle', label: 'Off-Cycle Payroll', icon: Zap },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Handlers for updating master state
  const handlePayrollCompleted = (newRun: PayrollRunItem) => {
    const updated = [newRun, ...runs.filter((r) => r.id !== newRun.id)];
    setRuns(updated);
    setPayrollCache('runs', updated);
    setCurrentView('overview');
  };

  const handleAddStructure = (newStructure: SalaryStructure) => {
    const updated = [newStructure, ...structures];
    setStructures(updated);
    setPayrollCache('structures', updated);
  };

  const handleUpdateStructure = (updatedStructure: SalaryStructure) => {
    const updated = structures.map((s) => (s.id === updatedStructure.id ? updatedStructure : s));
    setStructures(updated);
    setPayrollCache('structures', updated);
  };

  const handleAddReimbursement = (newItem: ReimbursementItem) => {
    const updated = [newItem, ...reimbursements];
    setReimbursements(updated);
    setPayrollCache('reimbursements', updated);
  };

  const handleUpdateReimbursementStatus = (id: string | number, status: ReimbursementItem['status']) => {
    const updated = reimbursements.map((r) => (r.id === id ? { ...r, status } : r));
    setReimbursements(updated);
    setPayrollCache('reimbursements', updated);
  };

  const handleUpdateTaxRecord = (updatedRecord: EmployeeTaxCompliance) => {
    const updated = taxRecords.map((t) => (t.id === updatedRecord.id ? updatedRecord : t));
    setTaxRecords(updated);
    setPayrollCache('tax', updated);
  };

  const handleAddOffCyclePayment = (newItem: OffCyclePaymentItem) => {
    const updated = [newItem, ...offCyclePayments];
    setOffCyclePayments(updated);
    setPayrollCache('offcycle', updated);
  };

  const handleGenerateReport = (newReport: PayrollReportItem) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    setPayrollCache('reports', updated);
  };

  const handleUpdateSettings = (newSettings: PayrollSettingsState) => {
    setSettings(newSettings);
    setPayrollCache('settings', newSettings);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16">
      {/* Secondary Top Navigation Bar (Module Sub-Header) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto py-2.5">
          {/* Subview Tabs */}
          <div className="flex items-center gap-1.5 shrink-0">
            {navTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setViewingRun(null);
                    setCurrentView(tab.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            {currentView !== 'run-payroll' && (
              <button
                onClick={() => setCurrentView('run-payroll')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Payroll</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
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
              <div className="text-xs text-slate-600 bg-blue-50/60 border border-blue-100 rounded-xl p-3">
                <span className="font-bold text-blue-900 block mb-0.5">Notes:</span>
                {viewingRun.notes}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingRun(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewingRun(null);
                  setCurrentView('reports');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs"
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

import React, { useState, useMemo, useEffect } from 'react';
import {
  Settings, Building2, ShieldCheck, FileText, Landmark,
  Sliders, Check, Info, Save, RefreshCw,
  TrendingUp, Users, Calendar, AlertCircle, CheckCircle2,
  DollarSign, ArrowRight, Shield, Award, Edit2, X, Plus,
  Clock, Bell, MessageSquare, Mail, Lock,
  Download, RotateCcw, Building, Percent, Sparkles, CheckSquare,
  Search, ExternalLink
} from 'lucide-react';
import { PayrollSettingsState, PayrollSubView } from '@/types';
import { INITIAL_PAYROLL_SETTINGS, INITIAL_EMPLOYEE_SALARY_DETAILS, setPayrollCache } from './payrollData';
import { getInitialPayrollSubtab, updatePayrollNavigation } from './payrollRouting';

interface Props {
  settings: PayrollSettingsState;
  onNavigate: (view: PayrollSubView) => void;
  onUpdateSettings?: (settings: PayrollSettingsState) => void;
}

interface SalaryComponentItem {
  id: string;
  name: string;
  code: string;
  type: 'Earning' | 'Deduction';
  category: 'Fixed' | 'Variable' | 'Statutory';
  calculation: string;
  taxable: boolean;
  pf_eligible: boolean;
  esi_eligible: boolean;
  enabled: boolean;
}

const DEFAULT_SALARY_COMPONENTS: SalaryComponentItem[] = [
  { id: 'c1', name: 'Basic Salary', code: 'BASIC', type: 'Earning', category: 'Fixed', calculation: '50% of CTC', taxable: true, pf_eligible: true, esi_eligible: true, enabled: true },
  { id: 'c2', name: 'House Rent Allowance (HRA)', code: 'HRA', type: 'Earning', category: 'Fixed', calculation: '20% of CTC', taxable: true, pf_eligible: false, esi_eligible: true, enabled: true },
  { id: 'c3', name: 'Dearness Allowance (DA)', code: 'DA', type: 'Earning', category: 'Fixed', calculation: '10% of CTC', taxable: true, pf_eligible: true, esi_eligible: true, enabled: true },
  { id: 'c4', name: 'Conveyance Allowance', code: 'CONV', type: 'Earning', category: 'Fixed', calculation: 'Flat ₹1,600 / mo', taxable: true, pf_eligible: false, esi_eligible: false, enabled: true },
  { id: 'c5', name: 'Special Allowance', code: 'SPL_ALW', type: 'Earning', category: 'Fixed', calculation: 'Balancing Figure (CTC Remainder)', taxable: true, pf_eligible: false, esi_eligible: true, enabled: true },
  { id: 'c6', name: 'Overtime Allowance', code: 'OT_PAY', type: 'Earning', category: 'Variable', calculation: '1.5x Hourly Base Rate', taxable: true, pf_eligible: false, esi_eligible: false, enabled: true },
  { id: 'c7', name: 'Employee Provident Fund (EPF)', code: 'EPF', type: 'Deduction', category: 'Statutory', calculation: '12% of (Basic + DA)', taxable: false, pf_eligible: false, esi_eligible: false, enabled: true },
  { id: 'c8', name: 'TDS (Income Tax)', code: 'TDS', type: 'Deduction', category: 'Statutory', calculation: 'As per Tax Regime & Slabs', taxable: false, pf_eligible: false, esi_eligible: false, enabled: true },
  { id: 'c9', name: 'Employee State Insurance (ESI)', code: 'ESI', type: 'Deduction', category: 'Statutory', calculation: '0.75% of Gross (≤ ₹21k)', taxable: false, pf_eligible: false, esi_eligible: false, enabled: true },
  { id: 'c10', name: 'Professional Tax (PT)', code: 'PT', type: 'Deduction', category: 'Statutory', calculation: 'Kerala Slab (₹1,250 half-yearly)', taxable: false, pf_eligible: false, esi_eligible: false, enabled: true },
  { id: 'c11', name: 'Loan & Advance Recovery', code: 'LOAN_EMI', type: 'Deduction', category: 'Fixed', calculation: 'Monthly EMI Schedule', taxable: false, pf_eligible: false, esi_eligible: false, enabled: true },
  { id: 'c12', name: 'Labour Welfare Fund (LWF)', code: 'LWF', type: 'Deduction', category: 'Statutory', calculation: '₹20/yr employee + ₹40/yr employer', taxable: false, pf_eligible: false, esi_eligible: false, enabled: true },
];

export const SETTINGS_TABS = [
  'General',
  'Salary Components',
  'Deductions & Contributions',
  'Tax Settings',
  'Pay Schedule',
  'Bank & Payment',
  'Approval Workflow',
  'Notifications',
  'Other Settings',
] as const;

export const PayrollSettingsView: React.FC<Props> = ({
  settings: initialSettings,
  onNavigate,
  onUpdateSettings,
}) => {
  const [settings, setSettings] = useState<PayrollSettingsState>(initialSettings);
  const [activeTab, setActiveTab] = useState<string>(() => {
    return getInitialPayrollSubtab('settings', 'General', SETTINGS_TABS);
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Components state
  const [components, setComponents] = useState<SalaryComponentItem[]>(DEFAULT_SALARY_COMPONENTS);
  const [editingComponent, setEditingComponent] = useState<SalaryComponentItem | null>(null);
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [newCompForm, setNewCompForm] = useState({
    name: '',
    code: '',
    type: 'Earning' as 'Earning' | 'Deduction',
    category: 'Fixed' as 'Fixed' | 'Variable' | 'Statutory',
    calculation: '',
    taxable: true,
    pf_eligible: false,
    esi_eligible: false,
  });

  // Statutory Config Modal
  const [configModalItem, setConfigModalItem] = useState<string | null>(null);

  // Reset confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);

  // Active Scenario KPI Card States
  const [selectedKpi, setSelectedKpi] = useState<'frequency' | 'employees' | 'components' | 'compliance' | null>(null);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmpDept, setSelectedEmpDept] = useState('All Departments');

  const isFrequencyActive = selectedKpi === 'frequency' || activeTab === 'Pay Schedule';
  const isEmployeesActive = selectedKpi === 'employees' || showEmployeesModal;
  const isComponentsActive = selectedKpi === 'components' || activeTab === 'Salary Components' || activeTab === 'Deductions & Contributions';
  const isComplianceActive = selectedKpi === 'compliance' || activeTab === 'Tax Settings';

  const filteredStaff = useMemo(() => {
    return INITIAL_EMPLOYEE_SALARY_DETAILS.filter((emp) => {
      if (selectedEmpDept !== 'All Departments' && emp.department !== selectedEmpDept) return false;
      if (employeeSearch.trim() !== '') {
        const q = employeeSearch.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.employee_id.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q) ||
          (emp.role && emp.role.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [employeeSearch, selectedEmpDept]);

  const tabs = SETTINGS_TABS;

  const handleSelectTab = (tab: string, push = true) => {
    setActiveTab(tab);
    updatePayrollNavigation('settings', tab, undefined, push);
    if (tab === 'Pay Schedule') setSelectedKpi('frequency');
    else if (tab === 'Salary Components' || tab === 'Deductions & Contributions') setSelectedKpi('components');
    else if (tab === 'Tax Settings') setSelectedKpi('compliance');
    else setSelectedKpi(null);
  };

  // Sync URL on initial mount and when activeTab updates
  useEffect(() => {
    updatePayrollNavigation('settings', activeTab, undefined, false);
  }, [activeTab]);

  // Sync activeTab on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const restored = getInitialPayrollSubtab('settings', 'General', SETTINGS_TABS);
      setActiveTab(restored);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPayrollCache('settings', settings);
      if (onUpdateSettings) onUpdateSettings(settings);
      showToast('Payroll settings & rules saved successfully!');
    }, 400);
  };

  const toggleSetting = (key: keyof PayrollSettingsState) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setPayrollCache('settings', updated);
      if (onUpdateSettings) onUpdateSettings(updated);
      return updated;
    });
    showToast(`Setting updated`);
  };

  const updateField = (key: keyof PayrollSettingsState, value: any) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      setPayrollCache('settings', updated);
      if (onUpdateSettings) onUpdateSettings(updated);
      return updated;
    });
  };

  const toggleComponent = (id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
    showToast('Salary component status updated');
  };

  const handleSaveEditedComponent = () => {
    if (!editingComponent) return;
    setComponents((prev) =>
      prev.map((c) => (c.id === editingComponent.id ? editingComponent : c))
    );
    setEditingComponent(null);
    showToast(`Component "${editingComponent.name}" updated successfully!`);
  };

  const handleCreateComponent = () => {
    if (!newCompForm.name || !newCompForm.code) {
      showToast('Please provide component name and code');
      return;
    }
    const newId = `c_${Date.now()}`;
    const comp: SalaryComponentItem = {
      id: newId,
      name: newCompForm.name,
      code: newCompForm.code.toUpperCase().replace(/\s+/g, '_'),
      type: newCompForm.type,
      category: newCompForm.category,
      calculation: newCompForm.calculation || 'Flat Rate',
      taxable: newCompForm.taxable,
      pf_eligible: newCompForm.pf_eligible,
      esi_eligible: newCompForm.esi_eligible,
      enabled: true,
    };
    setComponents((prev) => [...prev, comp]);
    setIsAddingComponent(false);
    setNewCompForm({
      name: '',
      code: '',
      type: 'Earning',
      category: 'Fixed',
      calculation: '',
      taxable: true,
      pf_eligible: false,
      esi_eligible: false,
    });
    showToast(`Added component "${comp.name}" successfully!`);
  };

  const handleResetDefaults = () => {
    setSettings(INITIAL_PAYROLL_SETTINGS);
    setComponents(DEFAULT_SALARY_COMPONENTS);
    setPayrollCache('settings', INITIAL_PAYROLL_SETTINGS);
    if (onUpdateSettings) onUpdateSettings(INITIAL_PAYROLL_SETTINGS);
    setShowResetModal(false);
    showToast('Reset all payroll settings to company defaults');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top 4 KPI Metric Cards (Interactive, Scenario-Border Themed, Never Black) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Payroll Frequency (Blue Scenario Border) */}
        <button
          type="button"
          onClick={() => {
            setSelectedKpi('frequency');
            handleSelectTab('Pay Schedule');
            showToast('Showing Pay Schedule & Cutoff Frequency Rules');
          }}
          className={`bg-white rounded-2xl p-5 text-left transition-all cursor-pointer relative group ${
            isFrequencyActive
              ? 'border-2 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
              : 'border border-slate-200/90 hover:border-blue-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isFrequencyActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-100/70'
              }`}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              {isFrequencyActive && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              <span className="text-xs font-semibold text-slate-400">Next: 30 Sep 2026</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Payroll Frequency</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 flex items-baseline justify-between">
              <span>{settings.frequency || 'Monthly'}</span>
              <span className="text-[11px] font-semibold text-blue-600 group-hover:underline">Configure &rarr;</span>
            </div>
          </div>
        </button>

        {/* Card 2: Active Employees (Emerald Scenario Border) */}
        <button
          type="button"
          onClick={() => {
            setSelectedKpi('employees');
            setShowEmployeesModal(true);
          }}
          className={`bg-white rounded-2xl p-5 text-left transition-all cursor-pointer relative group ${
            isEmployeesActive
              ? 'border-2 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
              : 'border border-slate-200/90 hover:border-emerald-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isEmployeesActive
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-emerald-100/70'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              100% active
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Employees</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-mono flex items-baseline justify-between">
              <span>32</span>
              <span className="text-[11px] font-semibold text-emerald-600 group-hover:underline font-sans">View Roster &rarr;</span>
            </div>
          </div>
        </button>

        {/* Card 3: Salary Components (Rose Scenario Border) */}
        <button
          type="button"
          onClick={() => {
            setSelectedKpi('components');
            handleSelectTab('Salary Components');
            showToast('Showing 12 Salary Earnings & Deductions Components');
          }}
          className={`bg-white rounded-2xl p-5 text-left transition-all cursor-pointer relative group ${
            isComponentsActive
              ? 'border-2 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
              : 'border border-slate-200/90 hover:border-rose-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isComponentsActive
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 border border-rose-100 text-rose-600 group-hover:bg-rose-100/70'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              {isComponentsActive && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              <span className="text-xs font-semibold text-slate-400">
                {components.filter(c => c.type === 'Earning' && c.enabled).length} earnings, {components.filter(c => c.type === 'Deduction' && c.enabled).length} ded
              </span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Salary Components</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-mono flex items-baseline justify-between">
              <span>{components.filter(c => c.enabled).length}</span>
              <span className="text-[11px] font-semibold text-rose-600 group-hover:underline font-sans">Manage &rarr;</span>
            </div>
          </div>
        </button>

        {/* Card 4: Compliance Status (Teal Scenario Border) */}
        <button
          type="button"
          onClick={() => {
            setSelectedKpi('compliance');
            handleSelectTab('Tax Settings');
            showToast('Showing Statutory Tax & Compliance Configuration');
          }}
          className={`bg-white rounded-2xl p-5 text-left transition-all cursor-pointer relative group ${
            isComplianceActive
              ? 'border-2 border-teal-500 shadow-sm ring-2 ring-teal-500/20'
              : 'border border-slate-200/90 hover:border-teal-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isComplianceActive
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-teal-50 border border-teal-100 text-teal-600 group-hover:bg-teal-100/70'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              {isComplianceActive && (
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              <span className="text-xs font-semibold text-slate-400">TDS, PF, ESI, PT, LWF</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Compliance Status</span>
            <div className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5 flex items-baseline justify-between">
              <span>Configured</span>
              <span className="text-[11px] font-semibold text-teal-600 group-hover:underline">Audit Rules &rarr;</span>
            </div>
          </div>
        </button>
      </div>

      {/* 9 Tabs Navigation Bar (Matching Screenshot media_1790148105878.png) */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-2 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleSelectTab(tab)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: GENERAL ── */}
      {activeTab === 'General' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Company & Legal Entity */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Company & Tax Identity</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Company Legal Name on Payslip</label>
                  <input
                    type="text"
                    value={settings.company_name_payslip || 'Qiyam Business Solutions LLP'}
                    onChange={(e) => updateField('company_name_payslip', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Financial Year</label>
                  <select
                    value={settings.financial_year || 'April - March (FY 2026-27)'}
                    onChange={(e) => updateField('financial_year', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="April - March (FY 2026-27)">April - March (FY 2026-27)</option>
                    <option value="April - March (FY 2025-26)">April - March (FY 2025-26)</option>
                    <option value="April - March (FY 2024-25)">April - March (FY 2024-25)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Corporate PAN</label>
                  <input
                    type="text"
                    value={settings.company_pan || 'AAACB1234F'}
                    onChange={(e) => updateField('company_pan', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-semibold outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Corporate TAN</label>
                  <input
                    type="text"
                    value={settings.company_tan || 'CALP12345F'}
                    onChange={(e) => updateField('company_tan', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-semibold outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Core Processing Defaults */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Processing Defaults</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">Auto-include new joinees</p>
                    <p className="text-[11px] text-slate-400">Joinees before cutoff are queued in cycle.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('include_new_joinees')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                      settings.include_new_joinees ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.include_new_joinees ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">Calculate partial attendance (LOP)</p>
                    <p className="text-[11px] text-slate-400">Daily wage = Monthly Gross ÷ 26 days.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('calculate_partial_attendance')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                      settings.calculate_partial_attendance ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.calculate_partial_attendance ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">Round off net payable amounts</p>
                    <p className="text-[11px] text-slate-400">Round net pay to the nearest ₹1.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('round_off_salary')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                      settings.round_off_salary ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.round_off_salary ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">Require payroll approval</p>
                    <p className="text-[11px] text-slate-400">Sign-off required before batch disbursement.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('enable_payroll_approval')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                      settings.enable_payroll_approval ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.enable_payroll_approval ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Work Calendar & Working Hours */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Work Calendar & Shifts</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Standard Monthly Base Days</label>
                  <select
                    value={settings.monthly_base_days || '26 Days (Mon - Sat excl. Sundays)'}
                    onChange={(e) => updateField('monthly_base_days', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="26 Days (Mon - Sat excl. Sundays)">26 Days (Mon - Sat excl. Sundays)</option>
                    <option value="Calendar Days in Month (30/31)">Calendar Days in Month (30/31)</option>
                    <option value="22 Days (5-day work week)">22 Days (5-day work week)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Daily Standard Work Hours</label>
                  <input
                    type="text"
                    defaultValue="8 Hours / Day"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Half-Day Minimum Hours</label>
                  <input
                    type="text"
                    defaultValue="4.5 Hours"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Late In Grace Period</label>
                  <input
                    type="text"
                    defaultValue="15 Minutes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SALARY COMPONENTS ── */}
      {activeTab === 'Salary Components' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Salary Components & Allowances</h3>
                <p className="text-[11px] text-slate-500">Configure CTC breakdown ratios, earnings, allowances, and taxability rules</p>
              </div>
              <button
                onClick={() => setIsAddingComponent(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Earning Component</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Component Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Calculation / Basis</th>
                    <th className="py-3 px-4">Taxability</th>
                    <th className="py-3 px-4">Statutory Basis</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {components.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${comp.type === 'Earning' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{comp.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{comp.code}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          comp.type === 'Earning'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {comp.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{comp.calculation}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          comp.taxable ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {comp.taxable ? 'Taxable' : 'Tax Exempt'}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-x-1">
                        {comp.pf_eligible && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">PF</span>}
                        {comp.esi_eligible && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">ESI</span>}
                        {!comp.pf_eligible && !comp.esi_eligible && <span className="text-slate-400 text-[11px]">—</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleComponent(comp.id)}
                          className={`w-9 h-5 inline-flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                            comp.enabled ? 'bg-emerald-600' : 'bg-slate-200'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                              comp.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setEditingComponent(comp)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: DEDUCTIONS & CONTRIBUTIONS ── */}
      {activeTab === 'Deductions & Contributions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* EPF Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Provident Fund (EPF)</h3>
                    <p className="text-[10px] text-slate-400">EPFO Act 1952</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Employee Contribution</span>
                  <span className="font-bold text-slate-900 font-mono">12.0% (Basic + DA)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Employer Contribution</span>
                  <span className="font-bold text-slate-900 font-mono">12.0% (3.67% PF + 8.33% EPS)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">EPF Wage Ceiling</span>
                  <span className="font-bold text-blue-600 font-mono">₹15,000 / month</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                  Establishment Code: <strong className="font-mono text-slate-700">KL/CAL/100459/REG</strong>
                </div>
              </div>

              <button
                onClick={() => setConfigModalItem('Provident Fund (PF)')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
              >
                Configure EPF Rules & Caps
              </button>
            </div>

            {/* ESI Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">State Insurance (ESI)</h3>
                    <p className="text-[10px] text-slate-400">ESIC Regulations</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Employee Share</span>
                  <span className="font-bold text-slate-900 font-mono">0.75% of Gross</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Employer Share</span>
                  <span className="font-bold text-slate-900 font-mono">3.25% of Gross</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Wage Eligibility Limit</span>
                  <span className="font-bold text-orange-600 font-mono">≤ ₹21,000 / month</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                  Sub-code: <strong className="font-mono text-slate-700">55-00-123456-000-0001</strong>
                </div>
              </div>

              <button
                onClick={() => setConfigModalItem('Employee State Insurance (ESI)')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
              >
                Configure ESI Thresholds
              </button>
            </div>

            {/* Professional Tax (PT) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Professional Tax (PT)</h3>
                    <p className="text-[10px] text-slate-400">State Statutory</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Kerala
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">State Jurisdictions</span>
                  <span className="font-bold text-slate-900">Kerala (Half-Yearly)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Deduction Schedule</span>
                  <span className="font-bold text-slate-900">September & March</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Max Annual Cap</span>
                  <span className="font-bold text-purple-600 font-mono">₹2,500 / year</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                  Current Slab: <strong className="text-slate-700">Gross &gt; ₹15,000 = ₹1,250 / cycle</strong>
                </div>
              </div>

              <button
                onClick={() => setConfigModalItem('Professional Tax (PT)')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
              >
                Configure State Slabs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: TAX SETTINGS ── */}
      {activeTab === 'Tax Settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tax Regime & Slabs */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Default Tax Regime</h3>
                  <p className="text-[10px] text-slate-400">Finance Act 2024-26 Rules</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1.5">Default Regime for Employees</label>
                  <select
                    value={settings.default_tax_regime || 'New Tax Regime (Section 115BAC)'}
                    onChange={(e) => updateField('default_tax_regime', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="New Tax Regime (Section 115BAC)">New Tax Regime (Section 115BAC - Default)</option>
                    <option value="Old Tax Regime (With Chapter VI-A Deductions)">Old Tax Regime (With Chapter VI-A Deductions)</option>
                  </select>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5">
                  <div className="font-bold text-emerald-900 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>New Regime Benefit Active</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Standard deduction of <strong>₹75,000</strong> applied. Zero tax under Sec 87A rebate for taxable income up to <strong>₹7,00,000</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div>
                    <span className="font-bold text-slate-800 block">Allow regime switching</span>
                    <span className="text-[11px] text-slate-400">Employees can declare preferred regime</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* TDS Form 24Q Filing Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">TDS & Form 24Q Schedule</h3>
                  <p className="text-[10px] text-slate-400">Quarterly Return Deadlines</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Q1 (Apr - Jun)</span>
                  <span className="font-mono font-bold text-slate-900">Due: 31 July</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Q2 (Jul - Sep)</span>
                  <span className="font-mono font-bold text-emerald-700">Due: 31 October</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Q3 (Oct - Dec)</span>
                  <span className="font-mono font-bold text-slate-900">Due: 31 January</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Q4 (Jan - Mar)</span>
                  <span className="font-mono font-bold text-slate-900">Due: 31 May</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[11px] text-slate-500">Challan 281 deposit due on 7th of every succeeding month.</span>
              </div>
            </div>

            {/* Proof Submission Window */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Proof Verification Window</h3>
                  <p className="text-[10px] text-slate-400">Chapter VI-A Investments</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Declaration Window Opens</label>
                  <input
                    type="text"
                    defaultValue="1st April"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Final Proof Submission Cut-off</label>
                  <input
                    type="text"
                    defaultValue="20th February"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" defaultChecked id="lockProof" className="rounded text-purple-600" />
                  <label htmlFor="lockProof" className="text-slate-700 font-medium cursor-pointer">
                    Auto-lock declarations after cutoff date
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: PAY SCHEDULE ── */}
      {activeTab === 'Pay Schedule' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pay Cycle Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Cycle Dates</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Payroll Cycle Duration</label>
                  <select
                    value={settings.month_start}
                    onChange={(e) => updateField('month_start', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="1st of the month">1st of the month to End of month</option>
                    <option value="26th of previous month">26th of previous month to 25th</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Attendance & Leave Cut-off Date</label>
                  <select
                    value={settings.cutoff_date}
                    onChange={(e) => updateField('cutoff_date', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="25th of the month">25th of the month</option>
                    <option value="20th of the month">20th of the month</option>
                    <option value="28th of the month">28th of the month</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Salary Credit / Disbursement Date</label>
                  <select
                    value={settings.credit_date}
                    onChange={(e) => updateField('credit_date', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="Last working day">Last working day of the month</option>
                    <option value="1st of next month">1st of next month</option>
                    <option value="5th of next month">5th of next month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Holiday Rule */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Holiday & Weekend Handling</h3>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  If the scheduled salary disbursement date falls on a Sunday or official Bank Holiday:
                </p>

                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                    <input type="radio" name="holidayRule" defaultChecked className="mt-0.5 text-emerald-600" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Pay on the preceding working day</strong>
                      <span className="text-[11px] text-slate-500">Salaries are released early to ensure timely employee receipt.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input type="radio" name="holidayRule" className="mt-0.5 text-emerald-600" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Pay on the following working day</strong>
                      <span className="text-[11px] text-slate-500">Salaries are processed on the next business day.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Visual Timeline for September 2026 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">September 2026 Timeline</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">1</span>
                  <div>
                    <strong className="text-slate-800 block">1 Sep: Cycle Starts</strong>
                    <span className="text-[10px] text-slate-400">Attendance tracking starts</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-[10px]">22</span>
                  <div>
                    <strong className="text-slate-800 block">22 Sep: Reimbursements Cutoff</strong>
                    <span className="text-[10px] text-slate-400">Claim receipts verification</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">25</span>
                  <div>
                    <strong className="text-slate-800 block">25 Sep: Attendance Freeze</strong>
                    <span className="text-[10px] text-slate-400">LOP & overtime calculation locked</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">30</span>
                  <div>
                    <strong className="text-emerald-700 block">30 Sep: Batch Credit & Payslips</strong>
                    <span className="text-[10px] text-slate-400">HDFC disbursement completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: BANK & PAYMENT ── */}
      {activeTab === 'Bank & Payment' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Corporate Account */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Corporate Payout Account</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Disbursement Bank</label>
                  <select
                    value={settings.default_bank}
                    onChange={(e) => updateField('default_bank', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank (Primary Corporate)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    defaultValue="Qiyam Business Solutions LLP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 font-medium block mb-1">Account Number</label>
                    <input
                      type="text"
                      defaultValue="•••• •••• •••• 4092"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      defaultValue="HDFC0001234"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-semibold outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-700">
                  Cyberpark Calicut Corporate Branch • Verified
                </div>
              </div>
            </div>

            {/* Batch Export Format */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Batch Disbursement Format</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Salary Payment Method</label>
                  <select
                    value={settings.salary_payment_method}
                    onChange={(e) => updateField('salary_payment_method', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS Batch)</option>
                    <option value="Direct UPI Payout">Direct Corporate UPI Instant</option>
                    <option value="Corporate Cheque">Corporate Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Bank Batch File Template</label>
                  <select
                    value={settings.upload_bank_file_format}
                    onChange={(e) => updateField('upload_bank_file_format', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="HDFC Enet / CMS Format (.txt)">HDFC Enet / CMS Format (.txt)</option>
                    <option value="Standard CSV Template (.csv)">Standard CSV Template (.csv)</option>
                    <option value="Excel (.xlsx)">Excel (.xlsx)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>Include batch hash checksum verification</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>Mask beneficiary account in downloaded logs</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Verification & Safeguards */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Safety & Verification</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Penny Drop Verification</strong>
                    <span className="text-[11px] text-slate-400">Test ₹1 credit before first disbursement</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-purple-600" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Dual Sign-Off for Release</strong>
                    <span className="text-[11px] text-slate-400">Requires CFO OTP verification</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-purple-600" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Auto-Retry Failed Transfers</strong>
                    <span className="text-[11px] text-slate-400">Retry IMPS/NEFT failures up to 2x</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-purple-600" />
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500">
                  All payment actions are cryptographically signed and logged for RBI audit compliance.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: APPROVAL WORKFLOW ── */}
      {activeTab === 'Approval Workflow' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Multi-Level Approval Pipeline */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">3-Stage Payroll Approval Chain</h3>
                    <p className="text-[11px] text-slate-400">Sequential verification required prior to bank release</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Enforced
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Stage 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">1</div>
                    <div>
                      <h4 className="font-bold text-slate-900">HR & Attendance Verification</h4>
                      <p className="text-[11px] text-slate-500">Verifies biometric attendance, LOP unpaid days, and salary revisions</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg">HR Operations Lead</span>
                </div>

                {/* Stage 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">2</div>
                    <div>
                      <h4 className="font-bold text-slate-900">Manager & Incentive Audit</h4>
                      <p className="text-[11px] text-slate-500">Validates performance bonuses and reimbursement expense claims</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg">Department Managers</span>
                </div>

                {/* Stage 3 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">3</div>
                    <div>
                      <h4 className="font-bold text-emerald-950">Finance Head & CFO Final Release</h4>
                      <p className="text-[11px] text-emerald-800">Verifies statutory deductions (TDS, PF, ESI), bank balance, and signs token</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-1 rounded-lg">Vishnu (Director / CFO)</span>
                </div>
              </div>
            </div>

            {/* Threshold Rules */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Exception Triggers</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Flag MoM Variance &gt; 10%</strong>
                    <span className="text-[11px] text-slate-400">Alert if total gross exceeds budget</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Flag Increments &gt; 20%</strong>
                    <span className="text-[11px] text-slate-400">Special approval for high revisions</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Escalation Timeout</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none">
                    <option>Auto-escalate if pending &gt; 48 hours</option>
                    <option>Auto-escalate if pending &gt; 24 hours</option>
                    <option>No auto-escalation</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: NOTIFICATIONS ── */}
      {activeTab === 'Notifications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* WhatsApp Payslip Delivery */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">WhatsApp Delivery</h3>
                    <p className="text-[10px] text-slate-400">Meta Business API</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Connected
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Instant WhatsApp Payslip</strong>
                    <span className="text-[11px] text-slate-400">Send PDF download link via WhatsApp</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1 text-[11px] text-slate-600 font-sans">
                  <span className="font-bold text-slate-800 block">Template Preview:</span>
                  <p className="italic bg-white p-2 rounded-lg border border-slate-100 text-slate-700">
                    &ldquo;Dear &#123;Employee_Name&#125;, your salary of ₹&#123;Net_Pay&#125; for September 2026 has been credited to &#123;Bank_Account&#125;. Tap here to view payslip: &#123;Secure_Link&#125;&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Email Dispatch */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Email Dispatch</h3>
                  <p className="text-[10px] text-slate-400">Encrypted PDF Delivery</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Email Payslip Automatically</strong>
                    <span className="text-[11px] text-slate-400">Send PDF to registered employee email</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('send_payslip_email')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                      settings.send_payslip_email ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.send_payslip_email ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Password Protect PDF</strong>
                    <span className="text-[11px] text-slate-400">First 4 letters of PAN + Year of Birth</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Sender Email Address</label>
                  <input
                    type="text"
                    defaultValue="payroll@qiyam.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Admin Reminders */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Admin Cutoff Reminders</h3>
                  <p className="text-[10px] text-slate-400">Finance & HR Notifications</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Attendance cutoff alert</strong>
                    <span className="text-[11px] text-slate-400">Notify HR 3 days before 25th</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-amber-600" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Low Bank Balance Warning</strong>
                    <span className="text-[11px] text-slate-400">Alert if balance &lt; net payroll total</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-amber-600" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-slate-800 block">Statutory Filing Reminders</strong>
                    <span className="text-[11px] text-slate-400">Alert 3 days before TDS 7th &amp; PF 15th</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 9: OTHER SETTINGS ── */}
      {activeTab === 'Other Settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overtime & Shift Rules */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Overtime Calculation</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Overtime Multiplier</label>
                  <select
                    value={settings.overtime_calc}
                    onChange={(e) => updateField('overtime_calc', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="As per company policy">As per company policy (1.5x Hourly Rate)</option>
                    <option value="1.5x Hourly Rate">1.5x Hourly Rate</option>
                    <option value="2.0x Hourly Rate">2.0x Hourly Rate</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Minimum Qualifying OT</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none">
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                    <option>15 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Monthly Overtime Cap</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none">
                    <option>32 Hours / Month</option>
                    <option>48 Hours / Month</option>
                    <option>No Cap</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Leave & Arrears */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Leave Deduction & Arrears</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Leave Deduction Policy</label>
                  <select
                    value={settings.leave_deduction}
                    onChange={(e) => updateField('leave_deduction', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="Deduct for unpaid leave">Deduct for unpaid leave (LOP)</option>
                    <option value="Deduct for all unapproved leave">Deduct for all unapproved leave</option>
                    <option value="No deduction">No deduction</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Arrears Processing</label>
                  <select
                    value={settings.arrears_processing}
                    onChange={(e) => updateField('arrears_processing', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="Include in next payroll">Include in next monthly payroll</option>
                    <option value="Process immediately in off-cycle">Process immediately in off-cycle</option>
                    <option value="Manual approval required">Manual approval required</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-medium block mb-1">Reimbursement Approval Rule</label>
                  <select
                    value={settings.reimbursement_approval}
                    onChange={(e) => updateField('reimbursement_approval', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                  >
                    <option value="Require manager approval">Require manager approval</option>
                    <option value="Auto approve below ₹2000">Auto approve below ₹2000</option>
                    <option value="Require finance head approval">Require finance head approval</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Backup & System Reset */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Backup & Defaults</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Export payroll configurations or restore system settings to company standard baseline.
                </p>

                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `qiyam_payroll_settings_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    showToast('Configuration backup JSON exported!');
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Settings Backup (JSON)</span>
                </button>

                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Defaults</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          Settings are automatically synced across all payroll cycles upon saving.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('overview')}
            className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Payroll Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── EDIT COMPONENT MODAL ── */}
      {editingComponent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Component: {editingComponent.name}</h3>
              <button
                onClick={() => setEditingComponent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Component Name</label>
                <input
                  type="text"
                  value={editingComponent.name}
                  onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Calculation Method / Formula</label>
                <input
                  type="text"
                  value={editingComponent.calculation}
                  onChange={(e) => setEditingComponent({ ...editingComponent, calculation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingComponent.taxable}
                    onChange={(e) => setEditingComponent({ ...editingComponent, taxable: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Taxable under Income Tax (TDS)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingComponent.pf_eligible}
                    onChange={(e) => setEditingComponent({ ...editingComponent, pf_eligible: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Include in PF Wage calculation base</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingComponent.esi_eligible}
                    onChange={(e) => setEditingComponent({ ...editingComponent, esi_eligible: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Include in ESI Gross Wage ceiling</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingComponent(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedComponent}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Save Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW COMPONENT MODAL ── */}
      {isAddingComponent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Salary Component</h3>
              <button
                onClick={() => setIsAddingComponent(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Component Name</label>
                <input
                  type="text"
                  placeholder="e.g. Internet Allowance, Remote Stipend"
                  value={newCompForm.name}
                  onChange={(e) => setNewCompForm({ ...newCompForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Component Code</label>
                <input
                  type="text"
                  placeholder="e.g. INTERNET_ALW"
                  value={newCompForm.code}
                  onChange={(e) => setNewCompForm({ ...newCompForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={newCompForm.type}
                    onChange={(e) => setNewCompForm({ ...newCompForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCompForm.category}
                    onChange={(e) => setNewCompForm({ ...newCompForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Variable">Variable</option>
                    <option value="Statutory">Statutory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Calculation Formula / Amount</label>
                <input
                  type="text"
                  placeholder="e.g. Flat ₹1,500 / mo or 5% of Basic"
                  value={newCompForm.calculation}
                  onChange={(e) => setNewCompForm({ ...newCompForm, calculation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCompForm.taxable}
                    onChange={(e) => setNewCompForm({ ...newCompForm, taxable: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Taxable Component</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCompForm.pf_eligible}
                    onChange={(e) => setNewCompForm({ ...newCompForm, pf_eligible: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Include in PF Base</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddingComponent(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateComponent}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Create Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATUTORY CONFIG MODAL ── */}
      {configModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{configModalItem} Settings</h3>
              </div>
              <button
                onClick={() => setConfigModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Registration / Establishment Code</label>
                <input
                  type="text"
                  defaultValue="KL/CAL/100459/REG"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contribution Rates</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Employee Share</span>
                    <input
                      type="text"
                      defaultValue={configModalItem.includes('ESI') ? '0.75%' : '12%'}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Employer Share</span>
                    <input
                      type="text"
                      defaultValue={configModalItem.includes('ESI') ? '3.25%' : '12%'}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" defaultChecked id="restrictCap" className="rounded text-blue-600" />
                <label htmlFor="restrictCap" className="text-slate-700 font-medium">
                  Enforce statutory ceiling limits
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfigModalItem(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(`${configModalItem} rules updated!`);
                  setConfigModalItem(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
              >
                Save Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET CONFIRMATION MODAL ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Reset to Defaults?</h3>
              <p className="text-xs text-slate-500">
                This will reset all payroll settings, tax preferences, and salary component rules back to standard system defaults.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Yes, Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ACTIVE EMPLOYEES ENROLLED IN PAYROLL (Card 2) ── */}
      {showEmployeesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Active Employees in Payroll ({INITIAL_EMPLOYEE_SALARY_DETAILS.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    All 32 employees enrolled and eligible for current month payroll disbursal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmployeesModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search by name, employee code, or role..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none w-full focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <select
                value={selectedEmpDept}
                onChange={(e) => setSelectedEmpDept(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option>All Departments</option>
                <option>Operations</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>Technology</option>
                <option>HR</option>
                <option>Finance</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-right">Gross Salary</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStaff.map((emp, idx) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                            {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{emp.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{emp.department}</td>
                      <td className="py-2.5 px-3 text-slate-600">{emp.role || 'Staff'}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{(emp.gross_salary || 30000).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Showing {filteredStaff.length} of {INITIAL_EMPLOYEE_SALARY_DETAILS.length} active employees
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeesModal(false);
                    onNavigate('manage-salary');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Manage Salary Structures &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmployeesModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

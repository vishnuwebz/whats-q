import React, { useState } from 'react';
import {
  Settings, Building2, ShieldCheck, FileText, Landmark,
  Sliders, Check, ChevronDown, Info, Save, RefreshCw,
  TrendingUp, Users, Calendar, AlertCircle, CheckCircle2,
  DollarSign, ArrowRight, Shield, Award, Edit2, X
} from 'lucide-react';
import { PayrollSettingsState, PayrollSubView } from '@/types';
import { setPayrollCache } from './payrollData';

interface Props {
  settings: PayrollSettingsState;
  onNavigate: (view: PayrollSubView) => void;
  onUpdateSettings?: (settings: PayrollSettingsState) => void;
}

export const PayrollSettingsView: React.FC<Props> = ({
  settings: initialSettings,
  onNavigate,
  onUpdateSettings,
}) => {
  const [settings, setSettings] = useState<PayrollSettingsState>(initialSettings);
  const [activeTab, setActiveTab] = useState<string>('General');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Config Modal for Statutory Compliance
  const [configModalItem, setConfigModalItem] = useState<string | null>(null);

  const tabs = [
    'General',
    'Salary Components',
    'Deductions & Contributions',
    'Tax Settings',
    'Pay Schedule',
    'Bank & Payment',
    'Approval Workflow',
    'Notifications',
    'Other Settings',
  ];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPayrollCache('settings', settings);
      if (onUpdateSettings) onUpdateSettings(settings);
      showToast('Payroll settings saved successfully!');
    }, 500);
  };

  const toggleSetting = (key: keyof PayrollSettingsState) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setPayrollCache('settings', updated);
      return updated;
    });
  };

  const updateField = (key: keyof PayrollSettingsState, value: any) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      setPayrollCache('settings', updated);
      return updated;
    });
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

      {/* Top Banner Card (Screenshot 1 / Qiyam OS pattern) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-100/80 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700">
              Payroll Automation & Governance
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Payroll Settings</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Configure pay schedules, statutory registration numbers, payslip templates, and bank payment formats.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-2xs shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Configure once. Payroll on autopilot.</h4>
            <p className="text-[11px] text-slate-500">Rules and tax formulas are applied automatically to every run.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-emerald-600/20">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Payroll Frequency */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Next Run: 30 May 2024</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payroll Frequency</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{settings.frequency}</div>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              3 from last month
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Employees</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-mono">32</div>
          </div>
        </div>

        {/* Salary Components */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Including 6 earnings, 6 deductions</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salary Components</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-mono">12</div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-400">TDS, PF, ESI, Professional Tax</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Status</span>
            <div className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5">Configured</div>
          </div>
        </div>
      </div>

      {/* 9 Tabs Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-2 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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

      {/* Main Settings 6-Card Grid (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Company Payroll Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Company Payroll Settings</h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Payroll Frequency</label>
                <select
                  value={settings.frequency}
                  onChange={(e) => updateField('frequency', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Payroll Month Start Date</label>
                <select
                  value={settings.month_start}
                  onChange={(e) => updateField('month_start', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="1st of the month">1st of the month</option>
                  <option value="26th of previous month">26th of previous month</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Payroll Cut-off Date</label>
                <select
                  value={settings.cutoff_date}
                  onChange={(e) => updateField('cutoff_date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="25th of the month">25th of the month</option>
                  <option value="20th of the month">20th of the month</option>
                  <option value="28th of the month">28th of the month</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Salary Credit Date</label>
                <select
                  value={settings.credit_date}
                  onChange={(e) => updateField('credit_date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Last working day">Last working day</option>
                  <option value="1st of next month">1st of next month</option>
                  <option value="5th of next month">5th of next month</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Financial Year</label>
                <select
                  value={settings.financial_year}
                  onChange={(e) => updateField('financial_year', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="April - March (FY 2024-25)">April - March (FY 2024-25)</option>
                  <option value="April - March (FY 2025-26)">April - March (FY 2025-26)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Default Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Default Settings</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">Include new joinees in payroll automatically</p>
                <p className="text-[11px] text-slate-400">Employees who join before cut-off will be included.</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting('include_new_joinees')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                  settings.include_new_joinees ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.include_new_joinees ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">Calculate salary for partial attendance</p>
                <p className="text-[11px] text-slate-400">Auto calculation based on working days.</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting('calculate_partial_attendance')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                  settings.calculate_partial_attendance ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.calculate_partial_attendance ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">Round off salary amounts</p>
                <p className="text-[11px] text-slate-400">Round to nearest rupee.</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting('round_off_salary')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                  settings.round_off_salary ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.round_off_salary ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">Send payslip to employees</p>
                <p className="text-[11px] text-slate-400">Automatically email payslips after payroll is processed.</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting('send_payslip_email')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                  settings.send_payslip_email ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.send_payslip_email ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5 */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">Enable payroll approval</p>
                <p className="text-[11px] text-slate-400">Require approval before final processing.</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting('enable_payroll_approval')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                  settings.enable_payroll_approval ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.enable_payroll_approval ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Statutory Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Statutory Compliance</h3>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* TDS */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50 pb-2">
              <div>
                <p className="font-bold text-slate-800">TDS (Income Tax)</p>
                <p className="text-[11px] text-slate-400">Configure TDS rules and slabs.</p>
              </div>
              <button
                onClick={() => setConfigModalItem('TDS (Income Tax)')}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 font-bold transition-all text-xs"
              >
                Configure
              </button>
            </div>

            {/* PF */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50 pb-2">
              <div>
                <p className="font-bold text-slate-800">Provident Fund (PF)</p>
                <p className="text-[11px] text-slate-400">Set PF rates and account details.</p>
              </div>
              <button
                onClick={() => setConfigModalItem('Provident Fund (PF)')}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 font-bold transition-all text-xs"
              >
                Configure
              </button>
            </div>

            {/* ESI */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50 pb-2">
              <div>
                <p className="font-bold text-slate-800">Employee State Insurance (ESI)</p>
                <p className="text-[11px] text-slate-400">Set ESI rates and eligibility.</p>
              </div>
              <button
                onClick={() => setConfigModalItem('Employee State Insurance (ESI)')}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 font-bold transition-all text-xs"
              >
                Configure
              </button>
            </div>

            {/* PT */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50 pb-2">
              <div>
                <p className="font-bold text-slate-800">Professional Tax</p>
                <p className="text-[11px] text-slate-400">Configure state-wise professional tax.</p>
              </div>
              <button
                onClick={() => setConfigModalItem('Professional Tax (PT)')}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 font-bold transition-all text-xs"
              >
                Configure
              </button>
            </div>

            {/* LWF */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-bold text-slate-800">Labour Welfare Fund</p>
                <p className="text-[11px] text-slate-400">Configure LWF settings.</p>
              </div>
              <button
                onClick={() => setConfigModalItem('Labour Welfare Fund (LWF)')}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 font-bold transition-all text-xs"
              >
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Payslip Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payslip Settings</h3>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Company Name on Payslip</label>
              <input
                type="text"
                value={settings.company_name_payslip}
                onChange={(e) => updateField('company_name_payslip', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Payslip Template</label>
              <select
                value={settings.payslip_template}
                onChange={(e) => updateField('payslip_template', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Default Template">Default Template</option>
                <option value="Modern Clean">Modern Clean</option>
                <option value="Classic Formal">Classic Formal</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-2">Include in Payslip</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.include_company_logo}
                    onChange={() => toggleSetting('include_company_logo')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Company Logo</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.include_employee_signature}
                    onChange={() => toggleSetting('include_employee_signature')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Employee Signature</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.include_company_address}
                    onChange={() => toggleSetting('include_company_address')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Company Address</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.include_statutory_details}
                    onChange={() => toggleSetting('include_statutory_details')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Statutory Details (PF, ESI, TDS)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Bank & Payment Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bank & Payment Settings</h3>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Salary Payment Method</label>
              <select
                value={settings.salary_payment_method}
                onChange={(e) => updateField('salary_payment_method', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                <option value="Direct UPI Payout">Direct UPI Payout</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Default Bank</label>
              <select
                value={settings.default_bank}
                onChange={(e) => updateField('default_bank', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="Axis Bank">Axis Bank</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Upload Bank File Format</label>
              <select
                value={settings.upload_bank_file_format}
                onChange={(e) => updateField('upload_bank_file_format', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Excel (.xlsx)">Excel (.xlsx)</option>
                <option value="CSV (.csv)">CSV (.csv)</option>
                <option value="TXT (CMS format)">TXT (CMS format)</option>
              </select>
            </div>

            {/* Info notice box */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-700 text-xs">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Make sure employee bank details are updated to avoid payment failures.</span>
            </div>
          </div>
        </div>

        {/* Card 6: Other Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Other Settings</h3>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Overtime Calculation</label>
              <select
                value={settings.overtime_calc}
                onChange={(e) => updateField('overtime_calc', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="As per company policy">As per company policy</option>
                <option value="1.5x Hourly Rate">1.5x Hourly Rate</option>
                <option value="2.0x Hourly Rate">2.0x Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Leave Deduction</label>
              <select
                value={settings.leave_deduction}
                onChange={(e) => updateField('leave_deduction', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Deduct for unpaid leave">Deduct for unpaid leave</option>
                <option value="Deduct for all unapproved leave">Deduct for all unapproved leave</option>
                <option value="No deduction">No deduction</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Arrears Processing</label>
              <select
                value={settings.arrears_processing}
                onChange={(e) => updateField('arrears_processing', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Include in next payroll">Include in next payroll</option>
                <option value="Process immediately in off-cycle">Process immediately in off-cycle</option>
                <option value="Manual approval required">Manual approval required</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Reimbursement Approval</label>
              <select
                value={settings.reimbursement_approval}
                onChange={(e) => updateField('reimbursement_approval', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Require manager approval">Require manager approval</option>
                <option value="Auto approve below ₹2000">Auto approve below ₹2000</option>
                <option value="Require finance head approval">Require finance head approval</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Bonus & Incentives</label>
              <select
                value={settings.bonus_policy}
                onChange={(e) => updateField('bonus_policy', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Process as per policy">Process as per policy</option>
                <option value="Include in monthly run">Include in monthly run</option>
                <option value="Separate off-cycle run">Separate off-cycle run</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          Settings are automatically synced across all payroll cycles upon saving.
        </div>
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

      {/* Statutory Config Modal */}
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
                <label className="font-bold text-slate-700 block mb-1">Statutory Code / Registration No.</label>
                <input
                  type="text"
                  defaultValue="KL/CAL/100459/REG"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contribution Rate (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Employee Share</span>
                    <input
                      type="text"
                      defaultValue="12%"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Employer Share</span>
                    <input
                      type="text"
                      defaultValue="12%"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" defaultChecked id="restrictCap" className="rounded text-blue-600" />
                <label htmlFor="restrictCap" className="text-slate-700 font-medium">
                  Restrict PF Contribution to ₹15,000 statutory wage ceiling
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
                Save Statutory Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Users, Wallet, PieChart, Landmark, AlertTriangle, ArrowRight, Search,
  Filter, Eye, MoreVertical, CheckCircle2, ChevronLeft, ChevronRight,
  Calendar, Check, Send, AlertCircle, ArrowLeft, Download, ShieldCheck
} from 'lucide-react';
import { EmployeeSalaryDetail, PayrollRunItem } from '@/types';
import { PayslipModal } from './modals/PayslipModal';
import { RunPayrollReviewModal } from './modals/RunPayrollReviewModal';

interface Props {
  employees: EmployeeSalaryDetail[];
  onBackToDashboard: () => void;
  onPayrollCompleted: (newRun: PayrollRunItem) => void;
}

export const RunPayrollView: React.FC<Props> = ({
  employees,
  onBackToDashboard,
  onPayrollCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState('May 2024');
  const [selectedGroup, setSelectedGroup] = useState('All Groups');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedType, setSelectedType] = useState('Active Employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>(() => employees.map((e) => e.id));
  const [sendPayslips, setSendPayslips] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [inspectEmployee, setInspectEmployee] = useState<EmployeeSalaryDetail | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedDept !== 'All Departments' && emp.department !== selectedDept) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.employee_id.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, selectedDept, searchQuery]);

  // Paginated employees for step 2
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Computed summary metrics
  const activeSelectedEmployees = employees.filter((e) => selectedIds.includes(e.id));
  const totalGross = activeSelectedEmployees.reduce((sum, e) => sum + e.gross_salary, 0);
  const totalDeductions = activeSelectedEmployees.reduce((sum, e) => sum + e.deductions, 0);
  const totalNet = totalGross - totalDeductions;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string | number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleFinalConfirm = () => {
    setIsReviewModalOpen(false);
    const newRun: PayrollRunItem = {
      id: Date.now(),
      month: selectedMonth,
      employees_count: activeSelectedEmployees.length,
      gross_amount: totalGross,
      deductions: totalDeductions,
      net_amount: totalNet,
      payment_status: 'Paid',
      processed_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: `${selectedMonth} monthly salary cycle disbursed via HDFC Bank NEFT/RTGS batch.`,
    };
    onPayrollCompleted(newRun);
  };

  const handleExportBatchCsv = () => {
    const headers = ['#', 'Employee ID', 'Employee Name', 'Department', 'Bank Account', 'PAN', 'Gross Salary', 'Total Deductions', 'Net Payable'];
    const rows = activeSelectedEmployees.map((e, idx) => [
      idx + 1,
      `"${e.employee_id}"`,
      `"${e.name}"`,
      `"${e.department}"`,
      `"${e.bank_account || 'Pending'}"`,
      `"${e.pan_number || 'Pending'}"`,
      e.gross_salary,
      e.deductions,
      e.net_pay,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `qiyam_payroll_batch_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Top Header & Previous Runs Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Run Payroll</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Process salaries, verify attendance deductions, and disburse payments in 4 simple steps.
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>View Previous Payroll Runs</span>
        </button>
      </div>

      {/* 4-Step Stepper (Interactive & Connected to currentStep) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-hidden"
          >
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                currentStep === 1
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : currentStep > 1
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
            </div>
            <span className={`font-bold text-xs ${currentStep === 1 ? 'text-emerald-700' : 'text-slate-600'}`}>
              Select Period
            </span>
          </button>
          <div className={`h-0.5 flex-1 mx-3 ${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-hidden"
          >
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                currentStep === 2
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : currentStep > 2
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
            </div>
            <span className={`font-bold text-xs ${currentStep === 2 ? 'text-emerald-700' : 'text-slate-600'}`}>
              Verify & Adjust
            </span>
          </button>
          <div className={`h-0.5 flex-1 mx-3 ${currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 3 */}
          <button
            onClick={() => setCurrentStep(3)}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-hidden"
          >
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                currentStep === 3
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : currentStep > 3
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {currentStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
            </div>
            <span className={`font-bold text-xs ${currentStep === 3 ? 'text-emerald-700' : 'text-slate-600'}`}>
              Review Deductions
            </span>
          </button>
          <div className={`h-0.5 flex-1 mx-3 ${currentStep > 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 4 */}
          <button
            onClick={() => setCurrentStep(4)}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-hidden"
          >
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                currentStep === 4
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              4
            </div>
            <span className={`font-bold text-xs ${currentStep === 4 ? 'text-emerald-700' : 'text-slate-600'}`}>
              Disburse
            </span>
          </button>
        </div>
      </div>

      {/* STEP 1: SELECT PERIOD & SCOPE */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Select Payroll Scope & Calendar Month
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Payroll Cycle Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>May 2024</option>
                  <option>June 2024</option>
                  <option>April 2024</option>
                  <option>March 2024</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Payroll Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>All Groups</option>
                  <option>Operations Team</option>
                  <option>Sales Team</option>
                  <option>Technology Team</option>
                  <option>HR & Management</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Filter Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Employment Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>Active Employees</option>
                  <option>Probation</option>
                  <option>Contractors</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Metrics Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Selected Staff</span>
              <div className="text-2xl font-black text-slate-900 font-mono">{activeSelectedEmployees.length}</div>
              <p className="text-[11px] text-slate-400">Ready for cycle verification</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Estimated Gross</span>
              <div className="text-2xl font-black text-slate-900 font-mono">₹{totalGross.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Includes fixed + incentives</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Statutory Deductions</span>
              <div className="text-2xl font-black text-rose-600 font-mono">₹{totalDeductions.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-400">TDS, PF, ESI & PT</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Total Net Disbursement</span>
              <div className="text-2xl font-black text-emerald-600 font-mono">₹{totalNet.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-400">Scheduled for 30 May 2024</p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <span>Continue to Verify & Adjust</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VERIFY & ADJUST EMPLOYEES */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Filters Bar (Search & Department) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employee by name, ID or role..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
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

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">
                {selectedIds.length} of {filteredEmployees.length} staff selected
              </span>
              <button
                onClick={handleExportBatchCsv}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Batch
              </button>
            </div>
          </div>

          {/* Main Table + Summary Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Table (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Employee Salary & Attendance Verification</h3>
                  <p className="text-[11px] text-slate-500">Uncheck any employees you wish to exclude or hold from this run.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                          onChange={handleSelectAll}
                          className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3">Employee</th>
                      <th className="py-3 px-3">Dept</th>
                      <th className="py-3 px-3">Gross</th>
                      <th className="py-3 px-3">Deductions</th>
                      <th className="py-3 px-3">Net Pay</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedEmployees.map((emp) => {
                      const isSelected = selectedIds.includes(emp.id);
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(emp.id)}
                              className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{emp.employee_id} • {emp.bank_account || 'No Bank Acc'}</div>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">{emp.department}</td>
                          <td className="py-3 px-3 font-mono font-semibold">₹{emp.gross_salary.toLocaleString()}</td>
                          <td className="py-3 px-3 font-mono text-rose-600 font-semibold">-₹{emp.deductions.toLocaleString()}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">₹{emp.net_pay.toLocaleString()}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                emp.status === 'Ready'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {emp.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setInspectEmployee(emp)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="View Official Payslip"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {paginatedEmployees.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                  {Math.min(currentPage * pageSize, filteredEmployees.length)} of {filteredEmployees.length} employees
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-2.5 py-0.5 rounded font-bold text-xs cursor-pointer ${
                        currentPage === i + 1
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Payroll Summary</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Selected Staff</span>
                    <span className="font-bold text-slate-900">{activeSelectedEmployees.length}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Total Gross</span>
                    <span className="font-mono font-bold text-slate-900">₹{totalGross.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 font-medium">Total Deductions</span>
                    <span className="font-mono font-bold text-rose-600">-₹{totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-900 font-black">Net Pay</span>
                    <span className="font-mono font-black text-emerald-600 text-base">₹{totalNet.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Warnings Card */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Warnings & Exceptions (2)</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-amber-200 text-slate-800">
                    <span className="font-bold">Priya Mehta:</span> Missing bank details
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200 text-slate-800">
                    <span className="font-bold">Devika L:</span> Pending CTC increment review
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>Review Deductions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW DEDUCTIONS & STATUTORY TAXES */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Statutory Tax & Compliance Deductions Review</h3>
                <p className="text-[11px] text-slate-500">Auto-calculated Provident Fund (PF), TDS, ESI and Professional Tax for {selectedMonth}.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Deductions</span>
                <span className="text-lg font-black text-rose-600 font-mono">-₹{totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">Provident Fund (PF 12%)</span>
                <span className="text-lg font-black text-slate-900 font-mono">₹62,300</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Matched 100% by employer</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">Income Tax TDS</span>
                <span className="text-lg font-black text-slate-900 font-mono">₹48,500</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Under New & Old Regimes</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">Employee State Insurance (ESI)</span>
                <span className="text-lg font-black text-slate-900 font-mono">₹18,750</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Eligible employees &lt; ₹21,000</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">Professional Tax (PT Kerala)</span>
                <span className="text-lg font-black text-slate-900 font-mono">₹8,600</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Local municipality half-yearly</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs"
            >
              Back to Employee List
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Continue to Final Disbursement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FINAL DISBURSEMENT & PROCESS */}
      {currentStep === 4 && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
            <div className="text-center space-y-1 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Confirm {selectedMonth} Payroll Disbursement</h3>
              <p className="text-xs text-slate-500">
                All employee attendance, salary structures, and statutory deductions have been validated.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Total Staff</span>
                <span className="text-xl font-black text-slate-900 font-mono">{activeSelectedEmployees.length}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Payment Method</span>
                <span className="text-sm font-bold text-slate-900">HDFC Bank NEFT/RTGS Batch</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Gross Payable</span>
                <span className="text-xl font-black text-slate-900 font-mono">₹{totalGross.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Net Bank Disbursement</span>
                <span className="text-xl font-black text-emerald-600 font-mono">₹{totalNet.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Email Payslips Toggle */}
            <label className="flex items-center gap-3 cursor-pointer bg-emerald-50/60 border border-emerald-200/70 p-3.5 rounded-xl select-none">
              <input
                type="checkbox"
                checked={sendPayslips}
                onChange={(e) => setSendPayslips(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 text-xs block">Email PDF Payslips to Employees</span>
                <span className="text-[11px] text-slate-500">Automatically sends password-protected salary slips to verified employee emails upon disbursement.</span>
              </div>
            </label>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs"
              >
                Back to Deductions
              </button>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <span>Authorize & Disburse Payroll</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Inspection Modal */}
      {inspectEmployee && (
        <PayslipModal
          isOpen={true}
          employee={inspectEmployee}
          onClose={() => setInspectEmployee(null)}
          month={selectedMonth}
        />
      )}

      {/* Run Payroll Review & Final Modal */}
      {isReviewModalOpen && (
        <RunPayrollReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onConfirm={handleFinalConfirm}
          totalEmployees={activeSelectedEmployees.length}
          grossAmount={totalGross}
          totalDeductions={totalDeductions}
          netPay={totalNet}
          month={selectedMonth}
          sendPayslips={sendPayslips}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users, Wallet, PieChart, Landmark, AlertTriangle, ArrowRight, Search,
  Filter, Eye, MoreVertical, CheckCircle2, ChevronLeft, ChevronRight,
  Calendar, Check, Send, AlertCircle
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
  const [selectedMonth, setSelectedMonth] = useState('May 2024');
  const [selectedGroup, setSelectedGroup] = useState('All Groups');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedType, setSelectedType] = useState('Active Employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [sendPayslips, setSendPayslips] = useState(true);

  // Modals state
  const [inspectEmployee, setInspectEmployee] = useState<EmployeeSalaryDetail | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
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
      employees_count: 32,
      gross_amount: 1245000,
      deductions: 182500,
      net_amount: 1062500,
      payment_status: 'Paid',
      processed_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: `${selectedMonth} payroll processed and paid successfully.`,
    };
    onPayrollCompleted(newRun);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Previous Runs Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Run Payroll</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Process salaries, ensure compliance and make payments — all in one place.
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

      {/* 4-Step Stepper (Screenshot 3) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              1
            </div>
            <span className="font-bold text-xs text-blue-700">Select Period</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-200" />

          {/* Step 2 */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center border border-slate-200">
              2
            </div>
            <span className="font-semibold text-xs text-slate-500">Review & Edit</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-200" />

          {/* Step 3 */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center border border-slate-200">
              3
            </div>
            <span className="font-semibold text-xs text-slate-500">Confirm & Process</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-200" />

          {/* Step 4 */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center border border-slate-200">
              4
            </div>
            <span className="font-semibold text-xs text-slate-500">Complete</span>
          </div>
        </div>
      </div>

      {/* Filters Bar (Screenshot 3) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Payroll Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
            >
              <option>May 2024</option>
              <option>June 2024</option>
              <option>April 2024</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Payroll Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
            >
              <option>All Groups</option>
              <option>Operations Team</option>
              <option>Sales Team</option>
              <option>Technology Team</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
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

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Employee Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
            >
              <option>Active Employees</option>
              <option>Probation</option>
              <option>Contractors</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {}}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-700/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Load Employees</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (Screenshot 3) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Employees</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">32</div>
          <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>2 with warnings</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Earnings (Gross)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹12,45,000</div>
          <div className="text-[11px] text-slate-400 font-medium">Pre-deductions total</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Deductions</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹1,82,500</div>
          <div className="text-[11px] text-slate-400 font-medium">TDS, PF, ESI, Loans</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Net Pay</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹10,62,500</div>
          <div className="text-[11px] text-purple-600 font-bold">Disbursement amount</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Exceptions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">2</div>
          <div className="text-[11px] text-amber-600 font-bold">Needs attention</div>
        </div>
      </div>

      {/* Main Grid: Table (Left 8 cols) & Summary Sidebar (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Employee Salary Details Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-slate-900">Employee Salary Details</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, employee ID..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-48 sm:w-60 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                      className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 w-8">#</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Employee ID</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Payroll Group</th>
                  <th className="py-3 px-3">Gross Salary</th>
                  <th className="py-3 px-3">Deductions</th>
                  <th className="py-3 px-3">Net Pay</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmployees.map((emp, idx) => {
                  const isChecked = selectedIds.includes(emp.id);
                  const initials = emp.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(emp.id)}
                          className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 uppercase">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="text-[10px] text-slate-400">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-600">{emp.employee_id}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{emp.department}</td>
                      <td className="py-3 px-3 text-slate-500 font-medium">{emp.payroll_group}</td>
                      <td className="py-3 px-3 font-mono font-semibold">₹{emp.gross_salary.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-rose-600">₹{emp.deductions.toLocaleString()}</td>
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
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Payslip"
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
            <span>Showing 1 to 10 of 32 employees</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">1</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">2</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">3</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">4</button>
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary & Action Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Payroll Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Payroll Summary</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 font-medium">Employees</span>
                <span className="font-bold text-slate-900">32</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 font-medium">Gross Salary</span>
                <span className="font-mono font-bold text-slate-900">₹12,45,000</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 font-medium">Total Deductions</span>
                <span className="font-mono font-bold text-rose-600">₹1,82,500</span>
              </div>
              <div className="py-2 flex justify-between text-sm pt-2">
                <span className="text-slate-800 font-bold">Net Pay</span>
                <span className="font-mono font-black text-slate-900">₹10,62,500</span>
              </div>
            </div>
          </div>

          {/* Deduction Breakdown Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Deduction Breakdown</h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Employee PF
                </span>
                <span className="font-bold text-slate-800 font-mono">₹62,300 (34.1%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> TDS
                </span>
                <span className="font-bold text-slate-800 font-mono">₹48,500 (26.6%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> ESI
                </span>
                <span className="font-bold text-slate-800 font-mono">₹18,750 (10.3%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Professional Tax
                </span>
                <span className="font-bold text-slate-800 font-mono">₹8,600 (4.7%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-pink-500" /> Loan / Advance
                </span>
                <span className="font-bold text-slate-800 font-mono">₹22,000 (12.1%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Other Deductions
                </span>
                <span className="font-bold text-slate-800 font-mono">₹22,350 (12.2%)</span>
              </div>
            </div>
          </div>

          {/* Warnings & Exceptions Card (Screenshot 3) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Warnings & Exceptions</span>
              </div>
              <span className="text-[11px] font-bold text-amber-800 cursor-pointer">View All</span>
            </div>
            <p className="text-[11px] text-amber-700 font-medium">
              2 employees need attention before processing:
            </p>
            <div className="space-y-2">
              <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 text-[11px]">
                <div className="font-bold text-slate-900">Priya Mehta (EMP003)</div>
                <div className="text-rose-600 font-medium">Missing bank account details</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 text-[11px]">
                <div className="font-bold text-slate-900">Devika L (EMP007)</div>
                <div className="text-amber-700 font-medium">Salary structure not updated</div>
              </div>
            </div>
          </div>

          {/* Payslip auto-send Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 select-none text-xs">
            <input
              type="checkbox"
              checked={sendPayslips}
              onChange={(e) => setSendPayslips(e.target.checked)}
              className="rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <span className="font-bold text-slate-800">Send payslips after processing</span>
          </label>

          {/* Big Proceed to Review Button */}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inspect Payslip Modal */}
      <PayslipModal
        isOpen={inspectEmployee !== null}
        onClose={() => setInspectEmployee(null)}
        employee={inspectEmployee}
        month={selectedMonth}
      />

      {/* Final Review & Confirmation Modal */}
      <RunPayrollReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleFinalConfirm}
        month={selectedMonth}
        totalEmployees={32}
        grossAmount={1245000}
        totalDeductions={182500}
        netPay={1062500}
        sendPayslips={sendPayslips}
      />
    </div>
  );
};

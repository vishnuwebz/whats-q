import React, { useState } from 'react';
import {
  Users, IndianRupee, FileText, Clock, Plus, Search, Filter,
  MoreVertical, CheckCircle2, ChevronLeft, ChevronRight, Eye,
  ArrowUpRight, ArrowDownRight, Zap, Sparkles, ChevronRight as RightArrow,
  Check, X, Download, ShieldCheck
} from 'lucide-react';
import { OffCyclePaymentItem } from '@/types';
import { NewOffCycleModal } from './modals/NewOffCycleModal';

interface Props {
  payments: OffCyclePaymentItem[];
  onAddPayment: (item: OffCyclePaymentItem) => void;
}

export const OffCyclePayrollView: React.FC<Props> = ({ payments, onAddPayment }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedType, setSelectedType] = useState('All Payment Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectPayment, setInspectPayment] = useState<OffCyclePaymentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic Metrics from live payments
  const totalRuns = payments.length;
  const totalAmountPaid = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const uniqueEmployeesPaid = new Set(
    payments.filter((p) => p.status === 'Paid').map((p) => p.employee_id)
  ).size;
  const pendingRequests = payments.filter((p) => p.status === 'Pending').length;

  // Breakdown by Type
  const bonusCount = payments.filter((p) => p.payment_type === 'Bonus' || p.payment_type === 'Project Bonus' || p.payment_type === 'Retention Bonus').length;
  const incentiveCount = payments.filter((p) => p.payment_type === 'Incentive').length;
  const reimbursementCount = payments.filter((p) => p.payment_type === 'Reimbursement').length;
  const arrearsCount = payments.filter((p) => p.payment_type === 'Arrears').length;
  const commissionCount = payments.filter((p) => p.payment_type === 'Commission').length;
  const overtimeCount = payments.filter((p) => p.payment_type === 'Overtime').length;

  const filteredPayments = payments.filter((p) => {
    if (selectedDept !== 'All Departments' && p.department !== selectedDept) return false;
    if (selectedType !== 'All Payment Types' && p.payment_type !== selectedType) return false;
    if (selectedStatus !== 'All Status' && p.status !== selectedStatus) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        p.employee_name.toLowerCase().includes(q) ||
        p.employee_id.toLowerCase().includes(q) ||
        p.run_id.toLowerCase().includes(q) ||
        p.payment_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['#', 'Run ID', 'Employee', 'Employee ID', 'Department', 'Payment Type', 'Amount (INR)', 'Processed On', 'Status', 'Notes'];
    const rows = filteredPayments.map((p, i) => [
      i + 1,
      `"${p.run_id}"`,
      `"${p.employee_name}"`,
      `"${p.employee_id}"`,
      `"${p.department}"`,
      `"${p.payment_type}"`,
      p.amount,
      `"${p.processed_on}"`,
      p.status,
      `"${p.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `qiyam_offcycle_disbursements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Off-cycle payroll records exported to CSV!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card (Screenshot 7 / Qiyam OS pattern) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-100/80 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700">
              One-time Disbursements
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Off-cycle Payroll</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Process bonuses, sales incentives, retroactive arrears, or any one-time disbursements on demand.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-2xs shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Pay Anytime. Keep Your Team Happy.</h4>
            <p className="text-[11px] text-slate-500">Quick and accurate off-cycle payments whenever you need.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Dynamic Metric Cards (Screenshot 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Off-cycle Runs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalRuns}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Executed batches</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Amount Paid</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{totalAmountPaid.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Direct account credits</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees Paid</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{uniqueEmployeesPaid}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Beneficiaries</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Batches</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{pendingRequests}</div>
          <div className="text-[11px] text-slate-400 font-medium">
            {pendingRequests > 0 ? 'Awaiting authorization' : 'All runs reconciled'}
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="text-xs font-bold text-slate-700">
          Disbursement Registry ({filteredPayments.length} records)
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Off-cycle Disbursement</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Runs Table (Left 8 cols) & Breakdown / Activity (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 cols: Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee, run ID, or purpose..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-full focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
            >
              <option>All Departments</option>
              <option>Operations</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>Technology</option>
              <option>HR</option>
              <option>Finance</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
            >
              <option>All Payment Types</option>
              <option>Bonus</option>
              <option>Incentive</option>
              <option>Arrears</option>
              <option>Project Bonus</option>
              <option>Reimbursement</option>
              <option>Retention Bonus</option>
              <option>Overtime</option>
              <option>Commission</option>
              <option>Referral Bonus</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
            >
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Processing</option>
            </select>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input type="checkbox" className="rounded text-emerald-600 accent-emerald-600" />
                  </th>
                  <th className="py-3 px-2 w-8">#</th>
                  <th className="py-3 px-3">Run ID</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Payment Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Processed On</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map((p, idx) => {
                  const initials = p.employee_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setInspectPayment(p)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded text-emerald-600 accent-emerald-600 cursor-pointer" />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">{p.run_id}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.employee_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600">{p.department}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {p.payment_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">₹{p.amount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-500 font-medium">{p.processed_on}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            p.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setInspectPayment(p)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {filteredPayments.length} of {payments.length} runs</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
              Click any row for full disbursal details
            </span>
          </div>
        </div>

        {/* Right 4 cols: Payment Type breakdown & Recent Activity */}
        <div className="lg:col-span-4 space-y-4">
          {/* Dynamic Payment Type Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Payment Breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-purple-50 text-purple-600 rounded">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>Bonus & Milestone</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{bonusCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Performance Incentive</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{incentiveCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-blue-50 text-blue-600 rounded">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span>Expense Reimbursement</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{reimbursementCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-amber-50 text-amber-600 rounded">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span>Salary Arrears</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{arrearsCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-sky-50 text-sky-600 rounded">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <span>Sales Commission</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{commissionCount}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-orange-50 text-orange-600 rounded">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>Overtime Duty</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{overtimeCount}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Recent Activity</h3>
            <div className="space-y-2.5 text-[11px]">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-emerald-50 text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Off-cycle payroll processed</div>
                  <div className="text-[10px] text-slate-500">Amit Sharma • ₹25,000 (Bonus)</div>
                  <div className="text-[9px] text-slate-400">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-emerald-50 text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Payment completed</div>
                  <div className="text-[10px] text-slate-500">Rahul Singh • ₹18,500 (Incentive)</div>
                  <div className="text-[9px] text-slate-400">2 days ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI / Quick Note Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Direct Bank Credit Format</h4>
                <p className="text-[11px] text-slate-300">
                  All off-cycle payouts can be immediately exported as HDFC / ICICI NEFT batch files.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Off-cycle Modal */}
      <NewOffCycleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddPayment}
      />

      {/* Inspect Payment Modal */}
      {inspectPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Off-cycle Run #{inspectPayment.run_id}</h3>
              <button
                onClick={() => setInspectPayment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-bold text-slate-900">{inspectPayment.employee_name} ({inspectPayment.employee_id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800">{inspectPayment.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Type:</span>
                <span className="font-semibold text-slate-800">{inspectPayment.payment_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">₹{inspectPayment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processed On:</span>
                <span className="font-medium text-slate-700">{inspectPayment.processed_on}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-900">{inspectPayment.status}</span>
              </div>
              {inspectPayment.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Reason / Notes:</span>
                  <p className="text-slate-700 italic">{inspectPayment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectPayment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

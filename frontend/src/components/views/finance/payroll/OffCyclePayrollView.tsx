import React, { useState } from 'react';
import {
  Users, IndianRupee, FileText, Clock, Plus, Search, Filter,
  MoreVertical, CheckCircle2, ChevronLeft, ChevronRight, Eye,
  ArrowUpRight, ArrowDownRight, Zap, Sparkles, ChevronRight as RightArrow,
  Check, X
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

  return (
    <div className="space-y-6">
      {/* Top Banner Card (Screenshot 7) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Off-cycle Payroll</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Process bonuses, reimbursements, arrears or any one-time payments.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-xs shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Pay Anytime. Keep Your Team Happy.</h4>
            <p className="text-[11px] text-slate-500">Quick and accurate off-cycle payments whenever you need.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-amber-600/30">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Metric Cards (Screenshot 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Off-cycle Runs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">12</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>20% from last 6 months</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Amount Paid</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹4,85,000</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>32% from last 6 months</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees Paid</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">28</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>27% from last 6 months</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">5</div>
          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>17% from last 6 months</span>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-700/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Off-cycle Payroll</span>
        </button>
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
                placeholder="Search by employee name, run ID or purpose..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-full"
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
            <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input type="checkbox" className="rounded text-blue-600 accent-blue-600" />
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
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <input type="checkbox" className="rounded text-blue-600 accent-blue-600" />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{p.run_id}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.employee_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600">{p.department}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{p.payment_type}</td>
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
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setInspectPayment(p)}
                          className="px-2 py-1 text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg cursor-pointer"
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
            <span>Showing 1 to {filteredPayments.length} of 12 runs</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">1</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">2</button>
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Payment Type breakdown, Recent Activity, AI Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Payment Type Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Payment Type</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-purple-50 text-purple-600 rounded">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>Bonus</span>
                </div>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  4 <RightArrow className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Incentive</span>
                </div>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  3 <RightArrow className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-blue-50 text-blue-600 rounded">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span>Reimbursement</span>
                </div>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  2 <RightArrow className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-amber-50 text-amber-600 rounded">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span>Arrears</span>
                </div>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  1 <RightArrow className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-sky-50 text-sky-600 rounded">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <span>Commission</span>
                </div>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  1 <RightArrow className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 bg-orange-50 text-orange-600 rounded">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>Overtime</span>
                </div>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  1 <RightArrow className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Recent Activity</h3>
              <span className="text-[11px] font-bold text-blue-600 cursor-pointer">View All</span>
            </div>
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
                <div className="p-1 rounded bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Off-cycle payroll created</div>
                  <div className="text-[10px] text-slate-500">Priya Mehta • ₹12,000 (Arrears)</div>
                  <div className="text-[9px] text-slate-400">1 day ago</div>
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
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-blue-50 text-blue-600 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">New reimbursement request</div>
                  <div className="text-[10px] text-slate-500">Nazia A • ₹8,750</div>
                  <div className="text-[9px] text-slate-400">3 days ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Help Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Need Help with Off-cycle Payroll?</h4>
                <p className="text-[11px] text-slate-300">
                  Our AI Assistant can help you process payments, check status or resolve issues.
                </p>
              </div>
            </div>
            <RightArrow className="w-4 h-4 text-slate-400" />
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Off-cycle Run #{inspectPayment.run_id}</h3>
              <button
                onClick={() => setInspectPayment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-slate-900">{inspectPayment.employee_name} ({inspectPayment.employee_id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-medium text-slate-800">{inspectPayment.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Type:</span>
                <span className="font-semibold text-slate-800">{inspectPayment.payment_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">₹{inspectPayment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processed On:</span>
                <span className="font-medium text-slate-700">{inspectPayment.processed_on}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-slate-900">{inspectPayment.status}</span>
              </div>
              {inspectPayment.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block mb-1">Reason / Notes:</span>
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

import React, { useState } from 'react';
import {
  Users, Wallet, PieChart, Landmark, Calendar, ArrowUpRight, Play,
  FileText, ShieldCheck, Zap, ChevronRight,
  Clock, ArrowRight, Building, Check, Shield
} from 'lucide-react';
import { PayrollRunItem, PayrollSubView } from '@/types';

interface Props {
  runs: PayrollRunItem[];
  onNavigate: (view: PayrollSubView) => void;
  onViewRun: (run: PayrollRunItem) => void;
}

export const PayrollDashboardView: React.FC<Props> = ({ runs, onNavigate, onViewRun }) => {
  const [trendRange, setTrendRange] = useState('Last 6 Months');

  // Trend data points (Apr to Sep 2026)
  const trendData = [
    { month: 'Apr', gross: 1180, ded: 175, net: 1005 },
    { month: 'May', gross: 1210, ded: 178, net: 1032 },
    { month: 'Jun', gross: 1225, ded: 180, net: 1045 },
    { month: 'Jul', gross: 1235, ded: 181, net: 1054 },
    { month: 'Aug', gross: 1240, ded: 182, net: 1058 },
    { month: 'Sep', gross: 1245, ded: 182.5, net: 1062.5 },
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. Top 5 Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Employees */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Employees</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">32</div>
          <div className="text-[11px] text-slate-500 font-medium">All active in payroll cycle</div>
        </div>

        {/* Gross Payroll */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Gross Payroll</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹12,45,000</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8% from last month</span>
          </div>
        </div>

        {/* Total Deductions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Deductions</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹1,82,500</div>
          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>14.6% of gross wages</span>
          </div>
        </div>

        {/* Net Payroll */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Net Payroll</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹10,62,500</div>
          <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Disbursement ready</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Payments</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">4</div>
          <div className="text-[11px] text-amber-600 font-bold font-mono">₹1,32,000 pending</div>
        </div>
      </div>

      {/* ── 2. Operations & Approvals Hub (3 Balanced Columns) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Upcoming Payroll Cycle */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Upcoming Payroll</h3>
                  <p className="text-[11px] text-slate-500">September 2026 Cycle</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </span>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Scheduled Payout:</span>
                <span className="font-bold text-slate-900 font-mono">30 Sep 2026</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Employees Enrolled:</span>
                <span className="font-bold text-slate-900">32 Staff</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Est. Net Disbursal:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">₹10,62,500</span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> HDFC Corp A/c
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Funded
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('run-payroll')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start September Payroll Run</span>
          </button>
        </div>

        {/* Tasks & Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Tasks & Approvals</h3>
                  <p className="text-[11px] text-slate-500">Pending review before disbursement</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                11 Pending
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div
                onClick={() => onNavigate('manage-salary')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Salary Revisions</span>
                    <p className="text-[10px] text-slate-400">2 increments, 1 grade update</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                  3 <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div
                onClick={() => onNavigate('reimbursements')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 group-hover:text-pink-600 transition-colors">Reimbursements</span>
                    <p className="text-[10px] text-slate-400">₹24,800 travel & utility claims</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                  5 <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div
                onClick={() => onNavigate('off-cycle')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Off-Cycle Payroll</span>
                    <p className="text-[10px] text-slate-400">Quarterly incentive payout</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                  1 <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div
                onClick={() => onNavigate('tax-compliance')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Tax Declarations</span>
                    <p className="text-[10px] text-slate-400">Sec 80C & HRA proofs submitted</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                  2 <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('manage-salary')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span>Review All Pending Approvals</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Statutory Compliance Deadlines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Compliance Status</h3>
                  <p className="text-[11px] text-slate-500">September 2026 Deadlines</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('tax-compliance')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View Details
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">TDS (Form 24Q)</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">Ready</span>
                </div>
                <div className="font-mono font-bold text-slate-900">₹48,500</div>
                <div className="text-[10px] text-slate-400">Due: 7 Oct 2026</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">EPF (ECR)</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">Ready</span>
                </div>
                <div className="font-mono font-bold text-slate-900">₹62,300</div>
                <div className="text-[10px] text-slate-400">Due: 15 Oct 2026</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">ESI (Monthly)</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">Ready</span>
                </div>
                <div className="font-mono font-bold text-slate-900">₹18,750</div>
                <div className="text-[10px] text-slate-400">Due: 15 Oct 2026</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">PT (Kerala)</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">Pending</span>
                </div>
                <div className="font-mono font-bold text-slate-900">₹8,600</div>
                <div className="text-[10px] text-slate-400">Due: 30 Sep 2026</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('tax-compliance')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span>Manage Tax & Compliance</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── 3. Financial Analytics (Payroll Trend & Deduction Breakdown) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Payroll Trend Card (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Payroll Expense Trend</h3>
              <p className="text-[11px] text-slate-400">Monthly expense & deduction growth over the past 6 cycles</p>
            </div>
            <select
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option>Last 6 Months</option>
              <option>FY 2026-27</option>
            </select>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Gross Payroll
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Deductions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-500" /> Net Disbursed
            </span>
          </div>

          {/* Bar Graph */}
          <div className="h-48 flex items-end justify-between pt-4 px-3 border-b border-slate-100">
            {trendData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-end gap-1.5 h-36 w-full justify-center">
                  {/* Gross Bar */}
                  <div
                    style={{ height: `${(d.gross / 1300) * 100}%` }}
                    className="w-3.5 sm:w-5 bg-blue-500 rounded-t-sm hover:brightness-110 transition-all cursor-pointer relative group"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                      Gross: ₹{(d.gross * 1000).toLocaleString('en-IN')}
                    </div>
                  </div>
                  {/* Deductions Bar */}
                  <div
                    style={{ height: `${(d.ded / 1300) * 100 * 3.8}%` }}
                    className="w-3.5 sm:w-5 bg-rose-400 rounded-t-sm hover:brightness-110 transition-all cursor-pointer relative group"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                      Ded: ₹{(d.ded * 1000).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>

          {/* Summary stats row */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold block">Avg Monthly Payroll</span>
              <span className="text-xs font-bold text-slate-800 font-mono">₹12,18,000</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold block">MoM Cost Growth</span>
              <span className="text-xs font-bold text-emerald-600 font-mono">+8.2%</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold block">Avg CTC / Employee</span>
              <span className="text-xs font-bold text-blue-600 font-mono">₹38,906</span>
            </div>
          </div>
        </div>

        {/* Deduction Breakdown Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Deduction Breakdown (September 2026)</h3>
            <p className="text-[11px] text-slate-400">Total ₹1,82,500 statutory & policy deductions</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Donut graphic */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Ring background */}
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* PF (34.1%) */}
                <path
                  className="text-blue-500"
                  strokeDasharray="34.1, 100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* TDS (26.6%) */}
                <path
                  className="text-emerald-500"
                  strokeDasharray="26.6, 100"
                  strokeDashoffset="-34.1"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* ESI (10.3%) */}
                <path
                  className="text-orange-500"
                  strokeDasharray="10.3, 100"
                  strokeDashoffset="-60.7"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Loan & Other (29%) */}
                <path
                  className="text-purple-500"
                  strokeDasharray="29, 100"
                  strokeDashoffset="-71"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-slate-800 font-mono">₹1,82,500</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Total Ded</span>
              </div>
            </div>

            {/* Items breakdown list */}
            <div className="space-y-2 flex-1 text-[11px] w-full">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Employee PF
                </span>
                <span className="font-bold text-slate-800 font-mono">₹62,300 (34.1%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> TDS / Tax
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
        </div>
      </div>

      {/* ── 4. Full-Width Recent Payroll Runs Ledger Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Payroll Runs</h3>
            <p className="text-[11px] text-slate-500">History of monthly salary cycles, batch disbursements, and payment reconciliation</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('reports')}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => onNavigate('run-payroll')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Payroll</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Payroll Month</th>
                <th className="py-3 px-4">Employees</th>
                <th className="py-3 px-4">Gross Amount</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Processed On</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {runs.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.month}</td>
                  <td className="py-3 px-4 font-medium text-slate-600">{r.employees_count}</td>
                  <td className="py-3 px-4 font-mono font-semibold">₹{r.gross_amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-mono text-rose-600">₹{r.deductions.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{r.net_amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.payment_status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.payment_status === 'Processing'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{r.processed_on}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onViewRun(r)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer mr-1"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

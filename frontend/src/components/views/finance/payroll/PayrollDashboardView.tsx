import React, { useState } from 'react';
import {
  Users, Wallet, PieChart, Landmark, Calendar, ArrowUpRight, Play,
  FileText, Receipt, ShieldCheck, Zap, BarChart3, Settings, ChevronRight,
  Clock, AlertCircle, CheckCircle2, MoreVertical, Eye,
  ArrowRight, Shield, Award, HelpCircle
} from 'lucide-react';
import { PayrollRunItem, PayrollSubView } from '@/types';

interface Props {
  runs: PayrollRunItem[];
  onNavigate: (view: PayrollSubView) => void;
  onViewRun: (run: PayrollRunItem) => void;
}

export const PayrollDashboardView: React.FC<Props> = ({ runs, onNavigate, onViewRun }) => {
  const [trendRange, setTrendRange] = useState('Last 6 Months');

  // Trend data points (Jan to May)
  const trendData = [
    { month: 'Jan', gross: 1040, ded: 156, net: 884 },
    { month: 'Feb', gross: 1095, ded: 162, net: 932 },
    { month: 'Mar', gross: 1120, ded: 168, net: 952 },
    { month: 'Apr', gross: 1180, ded: 175, net: 1004 },
    { month: 'May', gross: 1245, ded: 182, net: 1062 },
  ];

  return (
    <div className="space-y-6">
      {/* Top 5 Metric Cards */}
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
          <div className="text-[11px] text-slate-500 font-medium">From Employee Management</div>
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
            <span>6% from last month</span>
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
            <span>8% from last month</span>
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
          <div className="text-[11px] text-amber-600 font-bold font-mono">₹1,32,000</div>
        </div>
      </div>

      {/* Charts & Right Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Payroll Trend & Deduction Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Payroll Trend Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Payroll Trend</h3>
                  <p className="text-[11px] text-slate-400">Monthly expense & deduction growth</p>
                </div>
                <select
                  value={trendRange}
                  onChange={(e) => setTrendRange(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none"
                >
                  <option>Last 6 Months</option>
                  <option>FY 2024-25</option>
                </select>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Gross Payroll
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Deductions
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-emerald-500" /> Net Payroll
                </span>
              </div>

              {/* Bar & Line Graph Mockup matching Screenshot */}
              <div className="h-44 flex items-end justify-between pt-4 px-2 border-b border-slate-100">
                {trendData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="flex items-end gap-1 h-32 w-full justify-center">
                      {/* Gross Bar */}
                      <div
                        style={{ height: `${(d.gross / 1300) * 100}%` }}
                        className="w-3 sm:w-4 bg-blue-500 rounded-t-sm"
                        title={`Gross: ₹${d.gross * 1000}`}
                      />
                      {/* Deductions Bar */}
                      <div
                        style={{ height: `${(d.ded / 1300) * 100 * 4}%` }}
                        className="w-3 sm:w-4 bg-rose-400 rounded-t-sm"
                        title={`Deductions: ₹${d.ded * 1000}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deduction Breakdown (May 2024) Donut Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Deduction Breakdown (May 2024)</h3>
                <p className="text-[11px] text-slate-400">Total ₹1,82,500 statutory & policy deductions</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Donut graphic */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
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
                    <span className="text-[11px] font-black text-slate-800 font-mono">₹1,82,500</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">Total</span>
                  </div>
                </div>

                {/* Items breakdown list */}
                <div className="space-y-1.5 flex-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Employee PF
                    </span>
                    <span className="font-bold text-slate-800 font-mono">₹62,300 (34.1%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> TDS
                    </span>
                    <span className="font-bold text-slate-800 font-mono">₹48,500 (26.6%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-orange-500" /> ESI
                    </span>
                    <span className="font-bold text-slate-800 font-mono">₹18,750 (10.3%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-purple-500" /> Professional Tax
                    </span>
                    <span className="font-bold text-slate-800 font-mono">₹8,600 (4.7%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-pink-500" /> Loan / Advance
                    </span>
                    <span className="font-bold text-slate-800 font-mono">₹22,000 (12.1%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Strip (Screenshot 4) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              <button
                onClick={() => onNavigate('run-payroll')}
                className="p-3 bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-emerald-200/80 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <span>Run Payroll</span>
              </button>

              <button
                onClick={() => onNavigate('manage-salary')}
                className="p-3 bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-700 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-emerald-200/80 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Manage Salary</span>
              </button>

              <button
                onClick={() => onNavigate('reimbursements')}
                className="p-3 bg-pink-50/70 hover:bg-pink-100/90 text-pink-700 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-pink-200/80 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-pink-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Receipt className="w-4 h-4" />
                </div>
                <span>Reimbursements</span>
              </button>

              <button
                onClick={() => onNavigate('tax-compliance')}
                className="p-3 bg-sky-50/70 hover:bg-sky-100/90 text-sky-700 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-sky-200/80 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-sky-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Tax & Compliance</span>
              </button>

              <button
                onClick={() => onNavigate('off-cycle')}
                className="p-3 bg-amber-50/70 hover:bg-amber-100/90 text-amber-700 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-amber-200/80 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-amber-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Off-cycle Payroll</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="p-3 bg-purple-50/70 hover:bg-purple-100/90 text-purple-700 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-purple-200/80 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-purple-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span>Reports</span>
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="p-3 bg-teal-50/70 hover:bg-teal-100/90 text-teal-700 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-teal-200/80 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-teal-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Settings className="w-4 h-4" />
                </div>
                <span>Payroll Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming, Approvals, Compliance & AI Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Upcoming Payroll */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Upcoming Payroll</h3>
              <button
                onClick={() => onNavigate('run-payroll')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">June 2024 Payroll</h4>
                  <p className="text-[11px] text-slate-500">30 Jun 2024 • 32 Employees</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('run-payroll')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Start Processing
              </button>
            </div>
          </div>

          {/* Tasks & Approvals */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Tasks & Approvals</h3>
              <span className="text-[11px] font-bold text-blue-600">View All</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <div
                onClick={() => onNavigate('manage-salary')}
                className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded px-1"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Salary Revisions</span>
                </div>
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  3 <ChevronRight className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div
                onClick={() => onNavigate('reimbursements')}
                className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded px-1"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-pink-600" />
                  <span>Reimbursement Requests</span>
                </div>
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  5 <ChevronRight className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div
                onClick={() => onNavigate('off-cycle')}
                className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded px-1"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Off-cycle Payroll</span>
                </div>
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  1 <ChevronRight className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div
                onClick={() => onNavigate('tax-compliance')}
                className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded px-1"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Compliance Due</span>
                </div>
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  2 <ChevronRight className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </div>
          </div>

          {/* Compliance Status (May 2024) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Compliance Status (May 2024)</h3>
              <button
                onClick={() => onNavigate('tax-compliance')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">TDS</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">Ready</span>
                </div>
                <div className="font-mono font-bold text-slate-900">₹48,500</div>
                <div className="text-[10px] text-slate-400">Due: 7 Jun 2024</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">PF</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">Ready</span>
                </div>
                <div className="font-mono font-bold text-slate-900">₹62,300</div>
                <div className="text-[10px] text-slate-400">Due: 15 Jun 2024</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">ESI</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">Ready</span>
                </div>
                <div className="font-mono font-bold text-slate-900">₹18,750</div>
                <div className="text-[10px] text-slate-400">Due: 15 Jun 2024</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">PT</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">Pending</span>
                </div>
                <div className="font-mono font-bold text-slate-900">₹8,600</div>
                <div className="text-[10px] text-slate-400">Due: 30 Jun 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payroll Runs Table (Matching Screenshot 4) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Payroll Runs</h3>
            <p className="text-[11px] text-slate-500">History of monthly salary cycles and disbursements</p>
          </div>
          <button
            onClick={() => onNavigate('run-payroll')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All Runs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
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
                  <td className="py-3 px-4 font-mono font-semibold">₹{r.gross_amount.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-rose-600">₹{r.deductions.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{r.net_amount.toLocaleString()}</td>
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

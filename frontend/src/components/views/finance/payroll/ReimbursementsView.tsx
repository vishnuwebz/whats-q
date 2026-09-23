import React, { useState } from 'react';
import {
  Users, Wallet, Clock, XCircle, Calendar, Plus, Search, Filter,
  MoreVertical, CheckCircle2, ChevronLeft, ChevronRight, FileText,
  Eye, Check, X, ArrowUpRight, ArrowDownRight, Minus, AlertCircle
} from 'lucide-react';
import { ReimbursementItem } from '@/types';
import { NewReimbursementModal } from './modals/NewReimbursementModal';

interface Props {
  reimbursements: ReimbursementItem[];
  onAddReimbursement: (item: ReimbursementItem) => void;
  onUpdateStatus: (id: string | number, status: ReimbursementItem['status']) => void;
}

export const ReimbursementsView: React.FC<Props> = ({
  reimbursements,
  onAddReimbursement,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<ReimbursementItem | null>(null);

  const filteredItems = reimbursements.filter((r) => {
    if (activeTab === 'pending' && r.status !== 'Pending') return false;
    if (activeTab === 'approved' && r.status !== 'Approved') return false;
    if (activeTab === 'rejected' && r.status !== 'Rejected') return false;
    if (activeTab === 'draft' && r.status !== 'Draft') return false;

    if (selectedCategory !== 'All Categories' && r.category !== selectedCategory) return false;
    if (selectedStatusFilter !== 'All Status' && r.status !== selectedStatusFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        r.employee_name.toLowerCase().includes(q) ||
        r.employee_id.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Card (Screenshot 5) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Reimbursements</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Manage employee reimbursements with a simple and transparent process.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-xs shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Hassle-free Reimbursements</h4>
            <p className="text-[11px] text-slate-500">Allow employees to submit, track, and get reimbursed faster.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/30">
            ₹
          </div>
        </div>
      </div>

      {/* 5 Metric Cards (Screenshot 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Requests</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">28</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Approved Amount</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹48,250</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>18% from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">6</div>
          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
            <Minus className="w-3.5 h-3.5" />
            <span>0% from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rejected Requests</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">2</div>
          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>33% from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Reimbursed</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹1,24,600</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>15% from last month</span>
          </div>
        </div>
      </div>

      {/* Tabs & New Reimbursement Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Pending (6)
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Approved (18)
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Rejected (2)
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'draft'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Drafts (2)
          </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-700/20 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Reimbursement</span>
        </button>
      </div>

      {/* Main Grid: Requests Table (Left 8 cols) & Policy / Activity (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 cols: Requests Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee, purpose, or request ID..."
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
            >
              <option>All Categories</option>
              <option>Travel</option>
              <option>Food</option>
              <option>Internet</option>
              <option>Stationery</option>
              <option>Software</option>
              <option>Training</option>
              <option>Transport</option>
              <option>Communication</option>
            </select>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
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
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Purpose</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Submitted On</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((r, idx) => {
                  const initials = r.employee_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <input type="checkbox" className="rounded text-blue-600 accent-blue-600" />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{r.employee_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{r.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{r.purpose}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{r.category}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">₹{r.amount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-500 font-medium">{r.submitted_on}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            r.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInspectItem(r)}
                            className="px-2 py-1 text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg cursor-pointer"
                          >
                            View
                          </button>
                          {r.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => onUpdateStatus(r.id, 'Approved')}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                title="Approve"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onUpdateStatus(r.id, 'Rejected')}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {filteredItems.length} of 28 requests</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">1</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">2</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">3</button>
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Policy, Top Categories, Recent Activity (Screenshot 5) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reimbursement Policy Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">Reimbursement Policy</h3>
              </div>
              <span className="text-[11px] font-bold text-blue-600 cursor-pointer">View Policy</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Read the company reimbursement policy, eligible expense categories and monthly limits.
            </p>
          </div>

          {/* Top Categories (This Month) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Top Categories (This Month)</h3>
              <span className="text-[11px] font-bold text-blue-600 cursor-pointer">View All</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Travel</span>
                <span className="font-mono font-bold text-slate-900">₹18,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Food</span>
                <span className="font-mono font-bold text-slate-900">₹12,800</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Software</span>
                <span className="font-mono font-bold text-slate-900">₹8,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Communication</span>
                <span className="font-mono font-bold text-slate-900">₹6,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Stationery</span>
                <span className="font-mono font-bold text-slate-900">₹4,350</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
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
                  <div className="font-bold text-slate-900">Rahul Singh's request approved</div>
                  <div className="text-[10px] text-slate-400">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-rose-50 text-rose-600 shrink-0">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Nazia A's request rejected</div>
                  <div className="text-[10px] text-slate-400">4 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-blue-50 text-blue-600 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">New request from Priya Mehta</div>
                  <div className="text-[10px] text-slate-400">6 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-emerald-50 text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Vikram Kumar's request approved</div>
                  <div className="text-[10px] text-slate-400">1 day ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Arjun R's request submitted</div>
                  <div className="text-[10px] text-slate-400">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Reimbursement Modal */}
      <NewReimbursementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddReimbursement}
      />

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Reimbursement Details</h3>
              <button
                onClick={() => setInspectItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-slate-900">{inspectItem.employee_name} ({inspectItem.employee_id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purpose:</span>
                <span className="font-semibold text-slate-800">{inspectItem.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-medium text-slate-700">{inspectItem.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">₹{inspectItem.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submitted:</span>
                <span className="font-medium text-slate-700">{inspectItem.submitted_on}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-slate-900">{inspectItem.status}</span>
              </div>
              {inspectItem.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block mb-1">Notes:</span>
                  <p className="text-slate-700 italic">{inspectItem.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {inspectItem.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      onUpdateStatus(inspectItem.id, 'Rejected');
                      setInspectItem(null);
                    }}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg border border-rose-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(inspectItem.id, 'Approved');
                      setInspectItem(null);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-lg"
                  >
                    Approve
                  </button>
                </>
              )}
              <button
                onClick={() => setInspectItem(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-lg"
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

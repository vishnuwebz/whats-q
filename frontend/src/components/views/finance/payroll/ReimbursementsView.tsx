import React, { useState } from 'react';
import {
  Users, Wallet, Clock, XCircle, Calendar, Plus, Search, Filter,
  CheckCircle2, ChevronLeft, ChevronRight, FileText,
  Eye, Check, X, ArrowUpRight, ArrowDownRight, Minus, AlertCircle,
  Download, Receipt, Building2, Tag, FileDown, ExternalLink
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
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<ReimbursementItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic calculations from live reimbursements array
  const totalRequestsCount = reimbursements.length;
  const pendingCount = reimbursements.filter((r) => r.status === 'Pending').length;
  const approvedCount = reimbursements.filter((r) => r.status === 'Approved').length;
  const rejectedCount = reimbursements.filter((r) => r.status === 'Rejected').length;
  const draftCount = reimbursements.filter((r) => r.status === 'Draft').length;

  const approvedAmount = reimbursements
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalReimbursedAmount = approvedAmount;

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

  const handleApprove = (item: ReimbursementItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateStatus(item.id, 'Approved');
    if (inspectItem && inspectItem.id === item.id) {
      setInspectItem({ ...inspectItem, status: 'Approved' });
    }
    showToast(`Claim of ₹${item.amount.toLocaleString()} for ${item.employee_name} approved!`);
  };

  const handleReject = (item: ReimbursementItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateStatus(item.id, 'Rejected');
    if (inspectItem && inspectItem.id === item.id) {
      setInspectItem({ ...inspectItem, status: 'Rejected' });
    }
    showToast(`Claim of ₹${item.amount.toLocaleString()} rejected.`);
  };

  const handleExportClaims = () => {
    const headers = ['#', 'Employee', 'Employee ID', 'Purpose', 'Category', 'Amount (INR)', 'Submitted On', 'Status', 'Notes'];
    const rows = filteredItems.map((r, i) => [
      i + 1,
      `"${r.employee_name}"`,
      `"${r.employee_id}"`,
      `"${r.purpose}"`,
      `"${r.category}"`,
      r.amount,
      `"${r.submitted_on}"`,
      r.status,
      `"${r.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `qiyam_reimbursements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reimbursements exported to CSV!');
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

      {/* Top Banner Card (Screenshot 5 / Qiyam OS pattern) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-100/80 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700">
              Expense Verification & Disbursal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Reimbursements</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Manage employee travel, internet, client entertainment, and operational claims with fast audit controls.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-2xs shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Hassle-free Reimbursements</h4>
            <p className="text-[11px] text-slate-500">Fast 1-click approvals and direct payroll integration.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-emerald-600/20">
            ₹
          </div>
        </div>
      </div>

      {/* 5 Dynamic Metric Cards (Calculated from live reimbursements state) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Requests</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalRequestsCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">Across all categories</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Approved Amount</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{approvedAmount.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Ready for disbursement</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Action required</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rejected Claims</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{rejectedCount}</div>
          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <span>Policy limit exceeded</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Settled</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{totalReimbursedAmount.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Audited by Finance</span>
          </div>
        </div>
      </div>

      {/* Tabs & New Reimbursement Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>All Requests</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'all' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalRequestsCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'pending' ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Approved</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'approved' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {approvedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rejected'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Rejected</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'rejected' ? 'bg-white text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {rejectedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'draft'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Drafts</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'draft' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {draftCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportClaims}
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
            <span>New Reimbursement</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Requests Table (Left 8 cols) & Policy / Activity (Right 4 cols) */}
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
                placeholder="Search by employee, purpose, category..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-full focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
            >
              <option>All Categories</option>
              <option>Travel</option>
              <option>Internet</option>
              <option>Food</option>
              <option>Stationery</option>
              <option>Training</option>
              <option>Transport</option>
              <option>Software</option>
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
              <option>Draft</option>
            </select>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-8">#</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Purpose & Notes</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Date</th>
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
                    <tr
                      key={r.id}
                      onClick={() => setInspectItem(r)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{r.employee_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{r.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900">{r.purpose}</div>
                        {r.notes && <div className="text-[10px] text-slate-400 truncate">{r.notes}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        ₹{r.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">{r.submitted_on}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            r.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : r.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {r.status === 'Pending' && (
                            <>
                              <button
                                onClick={(e) => handleApprove(r, e)}
                                title="Approve Claim"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleReject(r, e)}
                                title="Reject Claim"
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setInspectItem(r)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {filteredItems.length} of {reimbursements.length} claims</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
              Click any row for complete voucher details
            </span>
          </div>
        </div>

        {/* Right 4 cols: Expense Policies & Recent Disbursals */}
        <div className="lg:col-span-4 space-y-4">
          {/* Policy Guidelines Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Expense Policy Guidelines</h3>
            <div className="space-y-2 text-slate-600">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>Travel & Lodging</span>
                  <span className="text-emerald-700 font-mono">Up to ₹5,000 / day</span>
                </div>
                <p className="text-[11px] text-slate-500">Receipts mandatory for air, intercity rail, and hotel booking.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>Work from Home Internet</span>
                  <span className="text-emerald-700 font-mono">₹1,500 / month</span>
                </div>
                <p className="text-[11px] text-slate-500">Directly reimbursed with monthly telecom invoice copy.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>Client Entertainment & Food</span>
                  <span className="text-emerald-700 font-mono">Manager Approval</span>
                </div>
                <p className="text-[11px] text-slate-500">Requires client meeting agenda and tax invoice copy.</p>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Automation Promo */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs">Instant Payroll Credit</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Approved claims are automatically added to the upcoming monthly payroll cycle as non-taxable earnings.
            </p>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Expense Claim Voucher</h3>
                  <p className="text-[11px] text-slate-500">
                    Claim #{inspectItem.id} • Submitted on {inspectItem.submitted_on}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-bold text-slate-900">{inspectItem.employee_name} ({inspectItem.employee_id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expense Category:</span>
                <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {inspectItem.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose / Title:</span>
                <span className="font-bold text-slate-900">{inspectItem.purpose}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Claim Amount:</span>
                <span className="text-base font-black font-mono text-emerald-700">₹{inspectItem.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    inspectItem.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : inspectItem.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {inspectItem.status}
                </span>
              </div>
              {inspectItem.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Employee Justification:</span>
                  <p className="italic text-slate-800">{inspectItem.notes}</p>
                </div>
              )}
            </div>

            {/* Receipt Preview Simulator */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">tax_invoice_receipt_{inspectItem.id}.pdf</div>
                  <div className="text-[10px] text-slate-400">PDF Document • 245 KB • Verified</div>
                </div>
              </div>
              <button
                onClick={() => showToast('Receipt downloaded')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>

              {inspectItem.status === 'Pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(inspectItem)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl cursor-pointer"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => handleApprove(inspectItem)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Claim</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

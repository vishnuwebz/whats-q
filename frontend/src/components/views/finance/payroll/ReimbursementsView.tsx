import React, { useState, useMemo } from 'react';
import {
  Users, Wallet, Clock, XCircle, Calendar, Plus, Search, Filter,
  CheckCircle2, ChevronLeft, ChevronRight, FileText,
  Eye, Check, X, ArrowUpRight, ArrowDownRight, Minus, AlertCircle,
  Download, Receipt, Building2, Tag, FileDown, ExternalLink,
  ShieldCheck, HelpCircle, Info, Sparkles, TrendingUp, RefreshCw, Paperclip
} from 'lucide-react';
import { ReimbursementItem } from '@/types';
import { NewReimbursementModal } from './modals/NewReimbursementModal';

interface Props {
  reimbursements: ReimbursementItem[];
  onAddReimbursement: (item: ReimbursementItem) => void;
  onUpdateStatus: (id: string | number, status: ReimbursementItem['status']) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Travel: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  Internet: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  Food: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Stationery: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  Training: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  Transport: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  Software: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Communication: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
};

export const ReimbursementsView: React.FC<Props> = ({
  reimbursements,
  onAddReimbursement,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');
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

  const pendingAmount = reimbursements
    .filter((r) => r.status === 'Pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalReimbursedAmount = approvedAmount;

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    const items = reimbursements.filter((r) => {
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
          r.category.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });

    return items.sort((a, b) => {
      if (sortBy === 'amount-high') return b.amount - a.amount;
      if (sortBy === 'amount-low') return a.amount - b.amount;
      if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
      return Number(b.id) - Number(a.id); // default newest
    });
  }, [reimbursements, activeTab, selectedCategory, selectedStatusFilter, searchQuery, sortBy]);

  // Category breakdown for analytics card
  const categoryAnalytics = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    reimbursements.forEach((r) => {
      if (!map[r.category]) {
        map[r.category] = { count: 0, total: 0 };
      }
      map[r.category].count += 1;
      map[r.category].total += r.amount;
    });

    const totalClaimsAmount = reimbursements.reduce((sum, r) => sum + r.amount, 0) || 1;
    return Object.entries(map)
      .map(([cat, data]) => ({
        category: cat,
        count: data.count,
        total: data.total,
        percentage: Math.round((data.total / totalClaimsAmount) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [reimbursements]);

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
    showToast(`Claim of ₹${item.amount.toLocaleString()} for ${item.employee_name} rejected.`);
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedStatusFilter('All Status');
    setSortBy('newest');
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

      {/* 5 Dynamic Metric Cards (Calculated from live reimbursements state) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
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
            <span>Ready for payroll credit</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>₹{pendingAmount.toLocaleString()} awaiting sign-off</span>
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
            <span>Policy limit / receipts void</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Disbursed Total</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{totalReimbursedAmount.toLocaleString()}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Audited & verified</span>
          </div>
        </div>
      </div>

      {/* Tabs & Top Controls Bar */}
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

      {/* FULL-WIDTH Reimbursements Master Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {/* Search, Filter & Sorter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee, ID, purpose, notes..."
                className="pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none w-full focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
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
              <option>Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Draft</option>
            </select>

            {/* Sort Sorter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>

            {(searchQuery || selectedCategory !== 'All Categories' || selectedStatusFilter !== 'All Status' || activeTab !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-md text-[11px]">
              {filteredItems.length} of {reimbursements.length} Claims
            </span>
          </div>
        </div>

        {/* Full Width Table Layout */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center font-mono text-slate-400">#</th>
                <th className="py-3 px-3.5 min-w-[180px]">Employee</th>
                <th className="py-3 px-3.5 min-w-[120px]">Category</th>
                <th className="py-3 px-3.5 min-w-[240px]">Expense Purpose & Description</th>
                <th className="py-3 px-3.5 min-w-[120px]">Amount</th>
                <th className="py-3 px-3.5 min-w-[110px]">Submitted Date</th>
                <th className="py-3 px-3.5 min-w-[110px]">Receipt Proof</th>
                <th className="py-3 px-3.5 min-w-[110px]">Status</th>
                <th className="py-3 px-3.5 min-w-[160px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">No reimbursement claims match your criteria</h4>
                      <p className="text-xs text-slate-500">
                        Try changing the status tab, resetting your filters, or search terms to inspect other vouchers.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((r, idx) => {
                  const initials = r.employee_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  const catStyle = CATEGORY_STYLES[r.category] || CATEGORY_STYLES.Other;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setInspectItem(r)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* # Index */}
                      <td className="py-3.5 px-3.5 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Employee Details */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 uppercase shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {r.employee_name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{r.employee_id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                          {r.category}
                        </span>
                      </td>

                      {/* Expense Purpose & Justification */}
                      <td className="py-3.5 px-3.5">
                        <div className="max-w-md">
                          <div className="font-bold text-slate-900">{r.purpose}</div>
                          {r.notes ? (
                            <div className="text-[11px] text-slate-500 truncate mt-0.5" title={r.notes}>
                              {r.notes}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">No additional notes provided</div>
                          )}
                        </div>
                      </td>

                      {/* Claim Amount */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          ₹{r.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Non-taxable</div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-3.5 text-slate-600 font-medium text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.submitted_on}</span>
                        </div>
                      </td>

                      {/* Receipt Proof */}
                      <td className="py-3.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setInspectItem(r)}
                          title="Click to view full voucher receipt"
                          className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          <Paperclip className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                          <span>Receipt #{r.id}</span>
                        </button>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
                            r.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : r.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {r.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {r.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          {r.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                          {r.status === 'Draft' && <FileText className="w-3 h-3 text-slate-500" />}
                          <span>{r.status}</span>
                        </span>
                      </td>

                      {/* Actions Column (100% visible, no cut-off) */}
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'Pending' && (
                            <>
                              <button
                                onClick={(e) => handleApprove(r, e)}
                                title="Approve Claim for Payroll Credit"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={(e) => handleReject(r, e)}
                                title="Reject Claim"
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setInspectItem(r)}
                            title="Inspect Voucher & Tax Invoices"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-emerald-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats & Direct Pagination Info */}
        <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-slate-800">{filteredItems.length}</strong> of <strong className="text-slate-800">{reimbursements.length}</strong> claims</span>
            {pendingCount > 0 && (
              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                {pendingCount} claims awaiting approval
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Click any claim row to open the complete expense audit voucher
            </span>
          </div>
        </div>
      </div>

      {/* COMPANION 3-COLUMN SECTION: Policies, Category Breakdown & Payroll Integration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Expense Policy & Threshold Limits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Expense Policy Thresholds</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">FY 2024-25</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-colors space-y-1">
                <div className="font-bold text-slate-900 flex justify-between items-center">
                  <span>Travel & Lodging</span>
                  <span className="text-emerald-700 font-mono font-bold">Up to ₹5,000 / day</span>
                </div>
                <p className="text-[11px] text-slate-500">Boarding passes and GST hotel bills mandatory.</p>
              </div>

              <div className="p-2.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-colors space-y-1">
                <div className="font-bold text-slate-900 flex justify-between items-center">
                  <span>WFH Broadband Internet</span>
                  <span className="text-emerald-700 font-mono font-bold">₹1,500 / month</span>
                </div>
                <p className="text-[11px] text-slate-500">Reimbursed directly with monthly telecom invoice copy.</p>
              </div>

              <div className="p-2.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-colors space-y-1">
                <div className="font-bold text-slate-900 flex justify-between items-center">
                  <span>Client Entertainment & Food</span>
                  <span className="text-amber-700 font-mono font-bold">Director Sign-off</span>
                </div>
                <p className="text-[11px] text-slate-500">Requires client meeting agenda and itemized tax invoice.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Standard SLA: <strong>48 Hours</strong></span>
            <button
              onClick={() => showToast('Policy document downloaded')}
              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Download Policy PDF</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Spend Distribution by Expense Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Spend Distribution</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                ₹{reimbursements.reduce((sum, r) => sum + r.amount, 0).toLocaleString()} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {categoryAnalytics.slice(0, 4).map((cat) => {
                const style = CATEGORY_STYLES[cat.category] || CATEGORY_STYLES.Other;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                        {cat.category}
                      </span>
                      <div className="font-mono text-slate-900 font-semibold flex items-center gap-2">
                        <span>₹{cat.total.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.dot}`}
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{categoryAnalytics.length} active spending heads</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Tax Exempt
            </span>
          </div>
        </div>

        {/* Card 3: Instant Payroll Credit & Compliance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Payroll Settlement
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Automated Sync
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Approved claims are automatically added to the upcoming monthly payroll cycle as non-taxable earnings under <strong className="text-white">Section 10(14)</strong> of the Income Tax Act.
            </p>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Monthly Cutoff Date:</span>
                <span className="font-bold text-white font-mono">25th of every month</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Disbursement Channel:</span>
                <span className="font-bold text-emerald-400">Direct Bank NEFT</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>Next Cycle: <strong>30 May 2024</strong></span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Compliant</span>
            </span>
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
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Employee:</span>
                <span className="font-bold text-slate-900">{inspectItem.employee_name} ({inspectItem.employee_id})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Expense Category:</span>
                <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {inspectItem.category}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Purpose / Title:</span>
                <span className="font-bold text-slate-900">{inspectItem.purpose}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Claim Amount:</span>
                <span className="text-base font-black font-mono text-emerald-700">₹{inspectItem.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
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
                  <span className="text-slate-500 block mb-0.5 font-medium">Employee Justification / Description:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    {inspectItem.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Receipt Preview Simulator */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">tax_invoice_receipt_{inspectItem.id}.pdf</div>
                  <div className="text-[10px] text-slate-400">PDF Document • 245 KB • Digitally Verified</div>
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
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => handleApprove(inspectItem)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
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

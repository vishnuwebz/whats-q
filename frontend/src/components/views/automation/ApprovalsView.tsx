import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { ShieldCheck, CheckCircle2, XCircle, Clock, User, Plus, X } from 'lucide-react';
import { Approval } from '@/types';

export const ApprovalsView: React.FC = () => {
  const { approvals, updateApprovalStatus, addApproval, addToast, targetHighlightId, globalFilter } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    request_id_str: `APR-${1025 + approvals.length}`,
    title: '',
    approval_type: 'Purchase Order',
    department: 'Operations & Maintenance',
    requested_by: 'Rahul Mehta',
    amount: 15000,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addApproval(form);
    setIsModalOpen(false);
    setForm({
      request_id_str: `APR-${1026 + approvals.length}`,
      title: '',
      approval_type: 'Purchase Order',
      department: 'Operations & Maintenance',
      requested_by: 'Rahul Mehta',
      amount: 15000,
    });
  };

  const filtered = approvals.filter((ap) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      if ((s === 'pending' || s === 'open') && ap.status !== 'Pending') return false;
      if ((s === 'approved' || s === 'completed') && ap.status !== 'Approved') return false;
      if (s === 'rejected' && ap.status !== 'Rejected') return false;
    }
    if (globalFilter.assignedTo && globalFilter.assignedTo !== 'all' && ap.requested_by !== globalFilter.assignedTo) {
      return false;
    }
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        ap.title.toLowerCase().includes(q) ||
        ap.request_id_str.toLowerCase().includes(q) ||
        ap.department.toLowerCase().includes(q) ||
        ap.requested_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Approvals Center"
        subtitle="Manage pending purchase orders, expense releases, employee leaves, and authorizations."
        primaryActionLabel="New Request"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[840px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Title / Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Submitted On</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((ap) => {
                const isPending = ap.status === 'Pending';
                const isApproved = ap.status === 'Approved';
                const isHighlighted =
                  targetHighlightId &&
                  (targetHighlightId === ap.request_id_str || String(targetHighlightId) === String(ap.id));

                return (
                  <tr
                    key={ap.id}
                    className={`transition-colors ${
                      isHighlighted
                        ? 'bg-amber-50/80 border-l-4 border-amber-500 ring-2 ring-amber-400/30'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                      <span>{ap.request_id_str}</span>
                      {isHighlighted && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                          Highlighted
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{ap.title}</td>
                    <td className="py-3.5 px-4 font-semibold">{ap.approval_type}</td>
                    <td className="py-3.5 px-4 text-slate-600">{ap.department}</td>
                    <td className="py-3.5 px-4 text-slate-800">{ap.requested_by}</td>
                    <td className="py-3.5 px-4 text-slate-500">{ap.submitted_on}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{ap.amount ? `₹${ap.amount.toLocaleString()}` : '-'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {ap.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateApprovalStatus(ap.id, 'Approved')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateApprovalStatus(ap.id, 'Rejected')}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold text-[11px] cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* New Approval Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-4 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">New Approval Request</h3>
                  <p className="text-[11px] text-slate-500">Submit authorization for purchase order or leave.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Request Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Warehouse Spares Restock APR-1025"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Request Type</label>
                  <select
                    value={form.approval_type}
                    onChange={(e) => setForm({ ...form, approval_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Purchase Order">Purchase Order</option>
                    <option value="Expense Release">Expense Release</option>
                    <option value="Employee Leave">Employee Leave</option>
                    <option value="Discount Authorization">Discount Authorization</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Amount (₹)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Requested By</label>
                  <input
                    type="text"
                    value={form.requested_by}
                    onChange={(e) => setForm({ ...form, requested_by: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm shadow-amber-700/20 cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { ShieldCheck, CheckCircle2, XCircle, Clock, User } from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { approvals, updateApprovalStatus, addToast } = useQiyamStore();

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Approvals Center"
        subtitle="Manage pending purchase orders, expense releases, employee leaves, and authorizations."
        primaryActionLabel="New Request"
        onPrimaryAction={() => addToast('New approval request modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
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
              {approvals.map((ap) => {
                const isPending = ap.status === 'Pending';
                const isApproved = ap.status === 'Approved';

                return (
                  <tr key={ap.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ap.request_id_str}</td>
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
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateApprovalStatus(ap.id, 'Rejected')}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold text-[11px]"
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
  );
};



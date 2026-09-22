import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  Calendar, CheckCircle2, XCircle, Clock, Plus,
  Search, Filter, User, AlertCircle, FileText, Check,
  X, ChevronRight, MessageSquare
} from 'lucide-react';

interface LeaveRequest {
  id: string | number;
  employee_id_str: string;
  employee_name: string;
  role: string;
  leave_type: 'Casual Leave (CL)' | 'Sick Leave (SL)' | 'Festival Leave' | 'Emergency Leave';
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_on: string;
}

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 1,
    employee_id_str: 'EMP-004',
    employee_name: 'Neha Patel',
    role: 'Housekeeper Lead',
    leave_type: 'Sick Leave (SL)',
    start_date: '2024-05-31',
    end_date: '2024-06-01',
    days_count: 2,
    reason: 'Severe fever and doctor advised rest for 2 days.',
    status: 'approved',
    applied_on: '2024-05-30',
  },
  {
    id: 2,
    employee_id_str: 'EMP-003',
    employee_name: 'Rahul Singh',
    role: 'Plumbing Technician',
    leave_type: 'Casual Leave (CL)',
    start_date: '2024-06-03',
    end_date: '2024-06-04',
    days_count: 2,
    reason: 'Family wedding function in native village.',
    status: 'pending',
    applied_on: '2024-05-31',
  },
  {
    id: 3,
    employee_id_str: 'EMP-005',
    employee_name: 'Arjun Nair',
    role: 'Electrician',
    leave_type: 'Emergency Leave',
    start_date: '2024-06-05',
    end_date: '2024-06-05',
    days_count: 1,
    reason: 'Urgent home electricity repair and family work.',
    status: 'pending',
    applied_on: '2024-05-31',
  },
];

export const EmployeeLeavesView: React.FC = () => {
  const { employees, updateEmployee, addToast } = useQiyamStore();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // New leave form
  const [newLeave, setNewLeave] = useState({
    employee_id_str: employees[0]?.employee_id_str || 'EMP-001',
    leave_type: 'Casual Leave (CL)' as LeaveRequest['leave_type'],
    start_date: '2024-06-05',
    end_date: '2024-06-06',
    days_count: 2,
    reason: '',
  });

  const handleApprove = (reqId: string | number) => {
    setLeaveRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          const emp = employees.find((e) => e.employee_id_str === r.employee_id_str);
          if (emp) {
            updateEmployee(emp.id, { status: 'on_leave' });
          }
          return { ...r, status: 'approved' };
        }
        return r;
      })
    );
    addToast('Leave request approved successfully!', 'success');
  };

  const handleReject = (reqId: string | number) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'rejected' } : r))
    );
    addToast('Leave request rejected', 'info');
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employee_id_str === newLeave.employee_id_str);
    if (!emp) return;

    const request: LeaveRequest = {
      id: Date.now(),
      employee_id_str: emp.employee_id_str,
      employee_name: emp.name,
      role: emp.role,
      leave_type: newLeave.leave_type,
      start_date: newLeave.start_date,
      end_date: newLeave.end_date,
      days_count: Number(newLeave.days_count) || 1,
      reason: newLeave.reason || 'Personal work / leave application',
      status: 'pending',
      applied_on: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests([request, ...leaveRequests]);
    setIsApplyModalOpen(false);
    setNewLeave({
      employee_id_str: employees[0]?.employee_id_str || 'EMP-001',
      leave_type: 'Casual Leave (CL)',
      start_date: '2024-06-05',
      end_date: '2024-06-06',
      days_count: 2,
      reason: '',
    });
    addToast(`Leave request submitted for ${emp.name}`, 'success');
  };

  const filtered = leaveRequests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    const q = search.toLowerCase().trim();
    if (q) {
      return (
        r.employee_name.toLowerCase().includes(q) ||
        r.employee_id_str.toLowerCase().includes(q) ||
        r.leave_type.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = leaveRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Leave Management"
        subtitle="Manage casual leaves, sick leaves, emergency time-off, and one-click leave approvals."
        activeSubTab="ops-emp-leaves"
        primaryActionLabel="Apply for Leave"
        primaryActionIcon={Calendar}
        onPrimaryAction={() => setIsApplyModalOpen(true)}
        badgeCount={`${pendingCount} Pending`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Pending Leave Requests</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Awaiting manager approval</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">On Leave Today</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {employees.filter((e) => e.status === 'on_leave').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Approved staff leaves</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Approved This Month</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {leaveRequests.filter((r) => r.status === 'approved').length}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Sanctioned leaves</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Annual Quota per Staff</div>
            <div className="text-2xl font-black text-slate-900 mt-1">18 Days</div>
            <div className="text-[11px] text-slate-500 mt-0.5">12 Casual + 6 Sick leaves</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff, leave type, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                All ({leaveRequests.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  filterStatus === 'approved' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Approved ({leaveRequests.filter((r) => r.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  filterStatus === 'rejected' ? 'bg-white text-red-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Rejected ({leaveRequests.filter((r) => r.status === 'rejected').length})
              </button>
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Staff Leave Applications</h3>
            <span className="text-xs text-slate-400">Click Approve or Reject to update status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Leave Type</th>
                  <th className="p-3.5">Duration & Dates</th>
                  <th className="p-3.5">Days</th>
                  <th className="p-3.5">Reason for Leave</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => {
                  const isPending = req.status === 'pending';
                  const isApproved = req.status === 'approved';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{req.employee_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{req.employee_id_str} • {req.role}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {req.leave_type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 font-mono text-[11px]">
                        {req.start_date} → {req.end_date}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{req.days_count} day(s)</td>
                      <td className="p-3.5 text-slate-600 max-w-xs">{req.reason}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                            >
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">
                            {isApproved ? 'Approved ✔' : 'Rejected ✖'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Leave Balances Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Staff Leave Balance Summary</h3>
              <p className="text-xs text-slate-400">Total remaining casual and sick leaves for each employee</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees.map((emp) => {
              const usedLeaves = emp.status === 'on_leave' ? 3 : 1;
              const clLeft = 12 - usedLeaves;
              const slLeft = 6 - (usedLeaves > 2 ? 1 : 0);

              return (
                <div key={emp.id} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.role}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {emp.employee_id_str}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Casual Leave (CL)</span>
                      <span className="font-bold text-emerald-700">{clLeft} Days Left</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sick Leave (SL)</span>
                      <span className="font-bold text-blue-700">{slLeft} Days Left</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Apply for Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Apply for Staff Leave</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Staff Member *</label>
                <select
                  required
                  value={newLeave.employee_id_str}
                  onChange={(e) => setNewLeave({ ...newLeave, employee_id_str: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employee_id_str}>
                      {emp.name} ({emp.employee_id_str}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Leave Type *</label>
                <select
                  value={newLeave.leave_type}
                  onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Casual Leave (CL)">Casual Leave (CL) - Personal work</option>
                  <option value="Sick Leave (SL)">Sick Leave (SL) - Health / Doctor</option>
                  <option value="Festival Leave">Festival Leave - Eid / Diwali / Onam</option>
                  <option value="Emergency Leave">Emergency Leave - Urgent work</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.start_date}
                    onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.end_date}
                    onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Number of Days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newLeave.days_count}
                  onChange={(e) => setNewLeave({ ...newLeave, days_count: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason for Leave *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Attending sister's wedding in Kannur"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

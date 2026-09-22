import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  Timer, Clock, IndianRupee, CheckCircle2, Plus,
  Search, Filter, Check, X, Calendar, AlertCircle
} from 'lucide-react';

interface OvertimeRecord {
  id: string | number;
  employee_id_str: string;
  name: string;
  role: string;
  date_str: string;
  regular_shift: string;
  ot_hours: number;
  rate_per_hour: number;
  total_pay: number;
  reason: string;
  status: 'pending' | 'approved_paid' | 'rejected';
}

const INITIAL_OVERTIME: OvertimeRecord[] = [
  {
    id: 1,
    employee_id_str: 'EMP-001',
    name: 'Amit Sharma',
    role: 'Field Technician',
    date_str: '30 May 2024',
    regular_shift: '9:00 AM - 6:00 PM',
    ot_hours: 2.5,
    rate_per_hour: 150,
    total_pay: 375,
    reason: 'Emergency AC breakdown service at hospital after 6 PM.',
    status: 'pending',
  },
  {
    id: 2,
    employee_id_str: 'EMP-003',
    name: 'Rahul Singh',
    role: 'Plumbing Technician',
    date_str: '29 May 2024',
    regular_shift: '9:00 AM - 6:00 PM',
    ot_hours: 3.0,
    rate_per_hour: 150,
    total_pay: 450,
    reason: 'Urgent main pipeline burst repair in commercial complex.',
    status: 'pending',
  },
  {
    id: 3,
    employee_id_str: 'EMP-005',
    name: 'Arjun Nair',
    role: 'Electrician',
    date_str: '26 May 2024',
    regular_shift: 'Sunday Off-Day',
    ot_hours: 6.0,
    rate_per_hour: 180,
    total_pay: 1080,
    reason: 'Sunday full-day electrical substation overhaul duty.',
    status: 'approved_paid',
  },
  {
    id: 4,
    employee_id_str: 'EMP-006',
    name: 'Sneha Joshi',
    role: 'Team Lead',
    date_str: '25 May 2024',
    regular_shift: '9:00 AM - 6:00 PM',
    ot_hours: 2.0,
    rate_per_hour: 200,
    total_pay: 400,
    reason: 'Late evening dispatch scheduling for next day jobs.',
    status: 'approved_paid',
  },
];

export const EmployeeOvertimeView: React.FC = () => {
  const { employees, addToast } = useQiyamStore();

  const [otRecords, setOtRecords] = useState<OvertimeRecord[]>(INITIAL_OVERTIME);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved_paid' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Overtime modal form
  const [otForm, setOtForm] = useState({
    employee_id_str: employees[0]?.employee_id_str || 'EMP-001',
    date_str: '2024-05-31',
    ot_hours: 2.5,
    rate_per_hour: 150,
    reason: '',
  });

  const pendingOtHours = otRecords
    .filter((r) => r.status === 'pending')
    .reduce((acc, r) => acc + r.ot_hours, 0);

  const pendingPayDue = otRecords
    .filter((r) => r.status === 'pending')
    .reduce((acc, r) => acc + r.total_pay, 0);

  const totalPaid = otRecords
    .filter((r) => r.status === 'approved_paid')
    .reduce((acc, r) => acc + r.total_pay, 0);

  const handleApprovePayout = (id: string | number) => {
    setOtRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved_paid' } : r))
    );
    addToast('Overtime pay approved and processed!', 'success');
  };

  const handleRejectOt = (id: string | number) => {
    setOtRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
    addToast('Overtime record rejected', 'info');
  };

  const handleLogOvertime = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employee_id_str === otForm.employee_id_str);
    if (!emp) return;

    const hours = Number(otForm.ot_hours) || 1;
    const rate = Number(otForm.rate_per_hour) || 150;
    const total = Math.round(hours * rate);

    const newRecord: OvertimeRecord = {
      id: Date.now(),
      employee_id_str: emp.employee_id_str,
      name: emp.name,
      role: emp.role,
      date_str: otForm.date_str,
      regular_shift: '9:00 AM - 6:00 PM',
      ot_hours: hours,
      rate_per_hour: rate,
      total_pay: total,
      reason: otForm.reason || 'Extra evening work after regular shift hours.',
      status: 'pending',
    };

    setOtRecords([newRecord, ...otRecords]);
    setIsLogModalOpen(false);
    addToast(`${hours} hours overtime logged for ${emp.name}`, 'success');
  };

  const filtered = otRecords.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    const q = search.toLowerCase().trim();
    if (q) {
      return (
        r.name.toLowerCase().includes(q) ||
        r.employee_id_str.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Extra Work / Overtime (OT)"
        subtitle="Track extra hours worked beyond 8-hour shift, overtime hourly rate calculations, and payout approvals."
        activeSubTab="ops-emp-overtime"
        primaryActionLabel="Log Overtime"
        primaryActionIcon={Timer}
        onPrimaryAction={() => setIsLogModalOpen(true)}
        badgeCount={`₹${pendingPayDue.toLocaleString('en-IN')} Due`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Pending OT Extra Pay</div>
            <div className="text-2xl font-black text-amber-500 mt-1">₹{pendingPayDue.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">{pendingOtHours} hours pending approval</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total OT Settled (Month)</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalPaid.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Paid with salary / advance</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Standard OT Rate</div>
            <div className="text-2xl font-black text-slate-900 mt-1">₹150 / hr</div>
            <div className="text-[11px] text-slate-500 mt-0.5">1.5x regular technician wage</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Weekend / Sunday Rate</div>
            <div className="text-2xl font-black text-purple-600 mt-1">₹180 - ₹200 / hr</div>
            <div className="text-[11px] text-purple-600 mt-0.5">Holiday duty incentive</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff, date, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              All ({otRecords.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Pending ({otRecords.filter((r) => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved_paid')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterStatus === 'approved_paid' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Paid ({otRecords.filter((r) => r.status === 'approved_paid').length})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterStatus === 'rejected' ? 'bg-white text-red-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Rejected ({otRecords.filter((r) => r.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Overtime Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Overtime (OT) Duty Log</h3>
            <span className="text-xs text-slate-400">Click Approve OT to disburse extra payment</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Duty Date</th>
                  <th className="p-3.5">Regular Shift</th>
                  <th className="p-3.5">Extra OT Hours</th>
                  <th className="p-3.5">OT Rate (₹/hr)</th>
                  <th className="p-3.5">Total Extra Pay</th>
                  <th className="p-3.5">Reason for OT</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const isPending = r.status === 'pending';
                  const isPaid = r.status === 'approved_paid';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{r.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{r.employee_id_str} • {r.role}</div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-mono text-[11px]">{r.date_str}</td>
                      <td className="p-3.5 text-slate-500">{r.regular_shift}</td>
                      <td className="p-3.5 font-bold text-slate-900 font-mono">{r.ot_hours} hrs</td>
                      <td className="p-3.5 text-slate-600 font-mono">₹{r.rate_per_hour}</td>
                      <td className="p-3.5 font-black text-emerald-600 font-mono text-sm">
                        ₹{r.total_pay.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs">{r.reason}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPaid ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                          {isPaid ? 'PAID' : isPending ? 'PENDING' : 'REJECTED'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprovePayout(r.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve OT</span>
                            </button>
                            <button
                              onClick={() => handleRejectOt(r.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                            >
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">
                            {isPaid ? 'Settled ✔' : 'Rejected ✖'}
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
      </div>

      {/* Log Overtime Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Log Extra Work / Overtime</h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogOvertime} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Staff Member *</label>
                <select
                  value={otForm.employee_id_str}
                  onChange={(e) => setOtForm({ ...otForm, employee_id_str: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employee_id_str}>
                      {emp.name} ({emp.employee_id_str}) - {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Overtime Duty Date *</label>
                <input
                  type="date"
                  required
                  value={otForm.date_str}
                  onChange={(e) => setOtForm({ ...otForm, date_str: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Extra OT Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    required
                    value={otForm.ot_hours}
                    onChange={(e) => setOtForm({ ...otForm, ot_hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hourly Rate (₹/hr)</label>
                  <input
                    type="number"
                    step="10"
                    min="100"
                    value={otForm.rate_per_hour}
                    onChange={(e) => setOtForm({ ...otForm, rate_per_hour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Calculated Extra Pay:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  ₹{Math.round(otForm.ot_hours * otForm.rate_per_hour)}
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason for Overtime *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Late evening customer emergency call at Kozhikode flat."
                  value={otForm.reason}
                  onChange={(e) => setOtForm({ ...otForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Save Overtime Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

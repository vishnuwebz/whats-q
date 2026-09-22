import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import { AttendanceRecord } from '@/types';
import {
  Clock, CheckCircle2, AlertCircle, MapPin, Smartphone,
  User, Search, Filter, Plus, Download, ShieldCheck,
  Check, X, Calendar, LogOut, RefreshCw
} from 'lucide-react';
import { exportTableToCsv } from '@/utils/exportCsv';

export const EmployeeAttendanceView: React.FC = () => {
  const {
    attendance,
    employees,
    clockInEmployee,
    addToast,
  } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'late' | 'absent' | 'on_leave'>('all');
  const [isManualPunchOpen, setIsManualPunchOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [manualStatus, setManualStatus] = useState<'present' | 'late' | 'on_leave'>('present');

  // Fallback demo data if attendance array in store is small
  const records = useMemo(() => {
    if (attendance && attendance.length > 0) return attendance;
    return employees.map((emp, i) => ({
      id: emp.id,
      employee_id_str: emp.employee_id_str,
      employee_name: emp.name,
      department: emp.department,
      shift: '9:00 AM - 6:00 PM',
      check_in: emp.status === 'on_duty' || emp.status === 'active' ? '8:58 AM' : '-',
      check_out: undefined,
      work_hours: emp.status === 'on_duty' || emp.status === 'active' ? '8h 55m' : '0h 00m',
      status: emp.status === 'on_leave' ? ('on_leave' as const) : emp.status === 'on_duty' || emp.status === 'active' ? ('present' as const) : ('absent' as const),
      location: emp.location,
      device: 'WhatsApp Geo-Punch (Android)',
    }));
  }, [attendance, employees]);

  const filteredRecords = records.filter((rec) => {
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      return (
        rec.employee_name.toLowerCase().includes(q) ||
        rec.employee_id_str.toLowerCase().includes(q) ||
        rec.department.toLowerCase().includes(q) ||
        rec.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const presentCount = records.filter((r) => r.status === 'present').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const leaveCount = records.filter((r) => r.status === 'on_leave').length;

  const handleManualPunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employee_id_str === selectedEmpId || String(e.id) === selectedEmpId);
    if (!emp) {
      addToast('Please select an employee', 'warning');
      return;
    }
    clockInEmployee(emp.id, manualStatus === 'on_leave' ? 'on_leave' : 'on_duty');
    setIsManualPunchOpen(false);
    addToast(`Attendance recorded for ${emp.name} as ${manualStatus.toUpperCase()}`, 'success');
  };

  const handleExportCsv = () => {
    exportTableToCsv('ops-attendance', { attendance: records } as any);
    addToast('Attendance CSV report downloaded', 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Attendance & Work Hours"
        subtitle="Daily staff punch in/out records, work shift hours, late arrival alerts, and duty tracking."
        activeSubTab="ops-emp-attendance"
        primaryActionLabel="Mark Punch In"
        primaryActionIcon={Clock}
        onPrimaryAction={() => setIsManualPunchOpen(true)}
        badgeCount={`${presentCount} Present Today`}
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Present Today</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{presentCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">On time & duty active</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Late Arrivals</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{lateCount}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Checked in after 9:15 AM</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Absent / Not Punched</div>
            <div className="text-2xl font-black text-red-500 mt-1">{absentCount}</div>
            <div className="text-[11px] text-red-600 mt-0.5">No punch record today</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Approved Leave (Chutti)</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{leaveCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Sanctioned time off</div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff, ID, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                All ({records.length})
              </button>
              <button
                onClick={() => setStatusFilter('present')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  statusFilter === 'present' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Present ({presentCount})
              </button>
              <button
                onClick={() => setStatusFilter('late')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  statusFilter === 'late' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Late ({lateCount})
              </button>
              <button
                onClick={() => setStatusFilter('absent')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  statusFilter === 'absent' ? 'bg-white text-red-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Absent ({absentCount})
              </button>
              <button
                onClick={() => setStatusFilter('on_leave')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  statusFilter === 'on_leave' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Leave ({leaveCount})
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Download Attendance Sheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Staff Name & ID</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Shift Timing</th>
                  <th className="p-3.5">Punch In</th>
                  <th className="p-3.5">Punch Out</th>
                  <th className="p-3.5">Duty Hours</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Punch Method / Device</th>
                  <th className="p-3.5 text-right">Duty Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isPresent = rec.status === 'present';
                  const isLate = rec.status === 'late';
                  const isLeave = rec.status === 'on_leave';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{rec.employee_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{rec.employee_id_str}</div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">{rec.department}</td>
                      <td className="p-3.5 text-slate-600 font-mono">{rec.shift || '9:00 AM - 6:00 PM'}</td>
                      <td className="p-3.5 font-mono font-semibold text-slate-800">{rec.check_in || '-'}</td>
                      <td className="p-3.5 font-mono text-slate-500">{rec.check_out || 'Active on Duty'}</td>
                      <td className="p-3.5 font-bold text-emerald-700">{rec.work_hours || '0h 00m'}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isLate
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isLeave
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPresent ? 'bg-emerald-500' : isLate ? 'bg-amber-500' : isLeave ? 'bg-blue-500' : 'bg-red-500'
                            }`}
                          />
                          {rec.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 flex items-center gap-1.5 pt-4">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{rec.device || 'WhatsApp Punch'}</span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            const emp = employees.find((e) => e.employee_id_str === rec.employee_id_str);
                            if (emp) clockInEmployee(emp.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                            isPresent
                              ? 'bg-slate-800 hover:bg-red-600 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isPresent ? 'Punch Out' : 'Punch In'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Punch In Modal */}
      {isManualPunchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Staff Punch In / Attendance</h3>
              <button
                onClick={() => setIsManualPunchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualPunchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Employee *</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employee_id_str}>
                      {emp.name} ({emp.employee_id_str}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Attendance Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualStatus('present')}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      manualStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus('late')}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      manualStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Late
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus('on_leave')}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      manualStatus === 'on_leave'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    On Leave
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Check-in Time</label>
                <input
                  type="text"
                  defaultValue="09:00 AM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualPunchOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Save Punch Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

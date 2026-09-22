import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import { AttendanceRecord } from '@/types';
import {
  Clock, CheckCircle2, AlertCircle, MapPin, Smartphone,
  User, Search, Filter, Plus, Download, ShieldCheck,
  Check, X, Calendar, LogOut, Edit3, Trash2, Save,
  RotateCcw, Coffee, UserCheck
} from 'lucide-react';
import { exportTableToCsv } from '@/utils/exportCsv';
import { calculateDutyHours } from '@/utils/dutyHours';

export const EmployeeAttendanceView: React.FC = () => {
  const {
    attendance,
    employees,
    clockInEmployee,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    addToast,
  } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'late' | 'absent' | 'on_leave'>('all');

  // Manual Punch In / Add Record Modal State
  const [isManualPunchOpen, setIsManualPunchOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [manualStatus, setManualStatus] = useState<'present' | 'late' | 'on_leave' | 'absent'>('present');
  const [manualCheckIn, setManualCheckIn] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [manualCheckOut, setManualCheckOut] = useState('');
  const [manualShift, setManualShift] = useState('9:00 AM - 6:00 PM');
  const [manualDevice, setManualDevice] = useState('WhatsApp Geo-Punch (Android)');
  const [manualLocation, setManualLocation] = useState('Kozhikode, Kerala');

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editForm, setEditForm] = useState({
    employee_name: '',
    employee_id_str: '',
    department: '',
    shift: '9:00 AM - 6:00 PM',
    status: 'present' as AttendanceRecord['status'],
    check_in: '',
    check_out: '',
    work_hours: '',
    location: '',
    device: '',
  });

  // Delete Confirmation State
  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(null);

  // Synchronize all employees and attendance records
  const records = useMemo(() => {
    const attendanceMap = new Map<string, AttendanceRecord>();
    (attendance || []).forEach((att) => {
      attendanceMap.set(att.employee_id_str, att);
    });

    // Merge each employee with their attendance record or generate a clean daily row
    const mergedList: AttendanceRecord[] = employees.map((emp) => {
      const existing = attendanceMap.get(emp.employee_id_str);
      if (existing) {
        return {
          ...existing,
          employee_name: emp.name || existing.employee_name,
          department: emp.department || existing.department,
          location: existing.location || emp.location,
        };
      }

      // If no attendance record exists for this employee, display based on employee status
      const isDuty = emp.status === 'on_duty';
      const isLeave = emp.status === 'on_leave';
      return {
        id: emp.id,
        employee_id_str: emp.employee_id_str,
        employee_name: emp.name,
        department: emp.department,
        shift: emp.shift || '9:00 AM - 6:00 PM',
        check_in: isDuty ? '8:58 AM' : '-',
        check_out: undefined,
        work_hours: isDuty ? '8h 55m' : '0h 00m',
        status: isLeave ? 'on_leave' : isDuty ? 'present' : 'absent',
        location: emp.location || 'Kozhikode, Kerala',
        device: 'WhatsApp Geo-Punch (Android)',
      };
    });

    // Also include any standalone attendance records that don't match active employee IDs
    const empIdSet = new Set(employees.map((e) => e.employee_id_str));
    (attendance || []).forEach((att) => {
      if (!empIdSet.has(att.employee_id_str)) {
        mergedList.push(att);
      }
    });

    return mergedList;
  }, [attendance, employees]);

  // Filtered records
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

  // KPI computations
  const presentCount = records.filter((r) => r.status === 'present').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const leaveCount = records.filter((r) => r.status === 'on_leave').length;
  const onDutyCount = records.filter((r) => {
    const hasIn = r.check_in && r.check_in !== '-';
    const noOut = !r.check_out || r.check_out === '-' || r.check_out === 'Active on Duty';
    return hasIn && noOut && r.status !== 'on_leave' && r.status !== 'absent';
  }).length;

  // Duty action: punch in / punch out toggle
  const handleToggleDuty = async (rec: AttendanceRecord) => {
    const emp = employees.find((e) => e.employee_id_str === rec.employee_id_str || String(e.id) === String(rec.id));
    const empId = emp ? emp.id : rec.id;

    const isCurrentlyIn = Boolean(
      rec.check_in &&
      rec.check_in !== '-' &&
      (!rec.check_out || rec.check_out === '-' || rec.check_out === 'Active on Duty') &&
      rec.status !== 'absent' &&
      rec.status !== 'on_leave'
    );

    if (isCurrentlyIn) {
      // Punch out
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await clockInEmployee(empId, 'active', {
        punchType: 'out',
        time: timeStr,
        device: rec.device,
        location: rec.location,
      });
    } else {
      // Punch in
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await clockInEmployee(empId, 'on_duty', {
        punchType: 'in',
        time: timeStr,
        status: 'present',
        device: rec.device,
        location: rec.location,
      });
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditForm({
      employee_name: rec.employee_name,
      employee_id_str: rec.employee_id_str,
      department: rec.department,
      shift: rec.shift || '9:00 AM - 6:00 PM',
      status: rec.status,
      check_in: rec.check_in || '',
      check_out: rec.check_out || '',
      work_hours: rec.work_hours || calculateDutyHours(rec.check_in, rec.check_out),
      location: rec.location || 'Kozhikode, Kerala',
      device: rec.device || 'WhatsApp Geo-Punch (Android)',
    });
  };

  // Save Edit Record
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const computedHours =
      editForm.work_hours || calculateDutyHours(editForm.check_in, editForm.check_out);

    await updateAttendanceRecord(editingRecord.id, {
      ...editForm,
      work_hours: computedHours,
    });

    setEditingRecord(null);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (rec: AttendanceRecord) => {
    setDeletingRecord(rec);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    await deleteAttendanceRecord(deletingRecord.id);
    setDeletingRecord(null);
  };

  // Manual Punch In Submit (Top Right Button)
  const handleManualPunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employee_id_str === selectedEmpId || String(e.id) === selectedEmpId);
    if (!emp) {
      addToast('Please select an employee', 'warning');
      return;
    }

    const calculatedHours =
      manualCheckOut && manualCheckOut !== '-'
        ? calculateDutyHours(manualCheckIn, manualCheckOut)
        : manualStatus === 'present' || manualStatus === 'late'
        ? '0h 01m'
        : '0h 00m';

    await clockInEmployee(emp.id, manualStatus === 'on_leave' ? 'on_leave' : 'on_duty', {
      time: manualCheckIn,
      status: manualStatus,
      punchType: manualCheckOut ? 'out' : 'in',
      shift: manualShift,
      location: manualLocation || emp.location,
      device: manualDevice,
    });

    setIsManualPunchOpen(false);
    setSelectedEmpId('');
  };

  // CSV Export
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
        onPrimaryAction={() => {
          setManualCheckIn(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setIsManualPunchOpen(true);
        }}
        badgeCount={`${presentCount} Present Today`}
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs transition-all hover:border-emerald-300">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Present Today</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {onDutyCount} Active
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{presentCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">On time & duty active</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs transition-all hover:border-amber-300">
            <div className="text-xs font-semibold text-slate-500">Late Arrivals</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{lateCount}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Checked in after 9:15 AM</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs transition-all hover:border-red-300">
            <div className="text-xs font-semibold text-slate-500">Absent / Not Punched</div>
            <div className="text-2xl font-black text-red-500 mt-1">{absentCount}</div>
            <div className="text-[11px] text-red-600 mt-0.5">No punch record today</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs transition-all hover:border-blue-300">
            <div className="text-xs font-semibold text-slate-500">Approved Leave</div>
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
                  <th className="p-3.5 text-right">Duty Action & Edits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isPunchedIn = Boolean(
                    rec.check_in &&
                    rec.check_in !== '-' &&
                    (!rec.check_out || rec.check_out === '-' || rec.check_out === 'Active on Duty') &&
                    rec.status !== 'absent' &&
                    rec.status !== 'on_leave'
                  );
                  const isPunchedOut = Boolean(
                    rec.check_out && rec.check_out !== '-' && rec.check_out !== 'Active on Duty'
                  );
                  const isLate = rec.status === 'late';
                  const isLeave = rec.status === 'on_leave';
                  const isAbsent = rec.status === 'absent' || (!isPunchedIn && !isPunchedOut && !isLeave);

                  // Calculate live accurate duty hours
                  const liveHours =
                    rec.work_hours && rec.work_hours !== '0h 00m'
                      ? rec.work_hours
                      : calculateDutyHours(rec.check_in, rec.check_out);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{rec.employee_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{rec.employee_id_str}</div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">{rec.department}</td>
                      <td className="p-3.5 text-slate-600 font-mono">{rec.shift || '9:00 AM - 6:00 PM'}</td>
                      <td className="p-3.5 font-mono font-semibold text-slate-800">
                        {rec.check_in || '-'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {isPunchedIn ? (
                          <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active on Duty
                          </span>
                        ) : rec.check_out ? (
                          rec.check_out
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-700">{liveHours}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isPunchedIn
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPunchedOut
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : isLate
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isLeave
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPunchedIn
                                ? 'bg-emerald-500'
                                : isPunchedOut
                                ? 'bg-slate-500'
                                : isLate
                                ? 'bg-amber-500'
                                : isLeave
                                ? 'bg-blue-500'
                                : 'bg-red-500'
                            }`}
                          />
                          {isPunchedIn
                            ? 'ON DUTY'
                            : isPunchedOut
                            ? 'PUNCHED OUT'
                            : isLate
                            ? 'LATE'
                            : isLeave
                            ? 'ON LEAVE'
                            : 'ABSENT'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 flex items-center gap-1.5 pt-4">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{rec.device || 'WhatsApp Geo-Punch'}</span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Duty Action Button */}
                          <button
                            onClick={() => handleToggleDuty(rec)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 ${
                              isPunchedIn
                                ? 'bg-slate-900 hover:bg-rose-600 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title={isPunchedIn ? 'Punch out for today' : 'Punch in staff for duty'}
                          >
                            {isPunchedIn ? (
                              <>
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Punch Out</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Punch In</span>
                              </>
                            )}
                          </button>

                          {/* Edit Attendance Record Button */}
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                            title="Edit attendance details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Attendance Record Button */}
                          <button
                            onClick={() => handleOpenDeleteModal(rec)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                            title="Delete this attendance record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Punch In / Add Attendance Modal */}
      {isManualPunchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Staff Punch In / Attendance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Saves directly to database without refreshing</p>
              </div>
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
                <div className="grid grid-cols-4 gap-2">
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
                    Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus('absent')}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      manualStatus === 'absent'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Punch In Time</label>
                  <input
                    type="text"
                    value={manualCheckIn}
                    onChange={(e) => setManualCheckIn(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Punch Out Time (Optional)</label>
                  <input
                    type="text"
                    value={manualCheckOut}
                    onChange={(e) => setManualCheckOut(e.target.value)}
                    placeholder="06:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Shift Timing</label>
                  <input
                    type="text"
                    value={manualShift}
                    onChange={(e) => setManualShift(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Punch Method / Device</label>
                  <select
                    value={manualDevice}
                    onChange={(e) => setManualDevice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="WhatsApp Geo-Punch (Android)">WhatsApp Geo-Punch (Android)</option>
                    <option value="WhatsApp Geo-Punch (iOS)">WhatsApp Geo-Punch (iOS)</option>
                    <option value="WhatsApp Web (Chrome)">WhatsApp Web (Chrome)</option>
                    <option value="Desktop Terminal">Desktop Terminal</option>
                    <option value="GPS Biometric Terminal">GPS Biometric Terminal</option>
                    <option value="Leave Portal (Approved)">Leave Portal (Approved)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Kozhikode, Kerala"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Attendance Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Attendance Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editForm.employee_name} ({editForm.employee_id_str}) - {editForm.department}
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Status</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'present' })}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      editForm.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'late' })}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      editForm.status === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Late
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'on_leave' })}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      editForm.status === 'on_leave'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'absent' })}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      editForm.status === 'absent'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Punch In Time</label>
                  <input
                    type="text"
                    value={editForm.check_in}
                    onChange={(e) => setEditForm({ ...editForm, check_in: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Punch Out Time</label>
                  <input
                    type="text"
                    value={editForm.check_out}
                    onChange={(e) => setEditForm({ ...editForm, check_out: e.target.value })}
                    placeholder="06:00 PM (or leave empty)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Shift Timing</label>
                  <input
                    type="text"
                    value={editForm.shift}
                    onChange={(e) => setEditForm({ ...editForm, shift: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Duty Hours</label>
                  <input
                    type="text"
                    value={editForm.work_hours}
                    onChange={(e) => setEditForm({ ...editForm, work_hours: e.target.value })}
                    placeholder="e.g. 8h 30m"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Punch Method / Device</label>
                  <input
                    type="text"
                    value={editForm.device}
                    onChange={(e) => setEditForm({ ...editForm, device: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update & Save to DB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Attendance Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to remove attendance for {deletingRecord.employee_name}?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
              <div><span className="text-slate-400">Staff:</span> {deletingRecord.employee_name} ({deletingRecord.employee_id_str})</div>
              <div><span className="text-slate-400">Punch In:</span> {deletingRecord.check_in || '-'}</div>
              <div><span className="text-slate-400">Duty Hours:</span> {deletingRecord.work_hours || '0h 00m'}</div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

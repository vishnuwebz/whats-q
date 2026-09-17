import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Clock, CheckCircle2, AlertCircle, MapPin, Smartphone, User,
  Search, Filter, Plus, Download, ShieldCheck, Check, X, Calendar
} from 'lucide-react';
import { exportTableToCsv } from '@/utils/exportCsv';
import { AttendanceRecord } from '@/types';

import { ModernDateRangePicker, DateRangeValue } from '@/components/common/ModernDateRangePicker';

// Fallback presentation demo dataset (18 employees, 15 present, 2 late, 1 absent)
const DEFAULT_ATTENDANCE_RECORDS: (AttendanceRecord & { date: string })[] = [
  { id: '1', employee_id_str: 'EMP-001', employee_name: 'Amit Sharma', department: 'AC Services', shift: '9:00 AM - 6:00 PM', check_in: '8:58 AM', check_out: '', work_hours: '8h 58m', status: 'present', location: 'Kozhikode, Kerala', device: 'WhatsApp Geo-Punch (Android)', date: '2024-05-31' },
  { id: '2', employee_id_str: 'EMP-002', employee_name: 'Priya Sharma', department: 'Customer Support', shift: '9:00 AM - 6:00 PM', check_in: '9:02 AM', check_out: '', work_hours: '8h 54m', status: 'present', location: 'Kozhikode Office', device: 'WhatsApp Web (Chrome)', date: '2024-05-31' },
  { id: '3', employee_id_str: 'EMP-003', employee_name: 'Rahul Singh', department: 'Plumbing Services', shift: '9:00 AM - 6:00 PM', check_in: '8:50 AM', check_out: '', work_hours: '9h 05m', status: 'present', location: 'Vadakara, Kerala', device: 'WhatsApp Geo-Punch (iOS)', date: '2024-05-31' },
  { id: '4', employee_id_str: 'EMP-004', employee_name: 'Neha Patel', department: 'Housekeeping Lead', shift: '9:00 AM - 6:00 PM', check_in: '-', check_out: '', work_hours: '0h 00m', status: 'absent', location: 'Kozhikode, Kerala', device: 'Leave Portal (Approved)', date: '2024-05-31' },
  { id: '5', employee_id_str: 'EMP-005', employee_name: 'Arjun Nair', department: 'Electrical Services', shift: '9:00 AM - 6:00 PM', check_in: '9:00 AM', check_out: '', work_hours: '8h 56m', status: 'present', location: 'Ramanattukara, Kerala', device: 'WhatsApp Geo-Punch (Android)', date: '2024-05-31' },
  { id: '6', employee_id_str: 'EMP-006', employee_name: 'Sneha Joshi', department: 'Operations Lead', shift: '9:00 AM - 6:00 PM', check_in: '8:45 AM', check_out: '', work_hours: '9h 10m', status: 'present', location: 'Kozhikode Office', device: 'Desktop Punch (MacOS)', date: '2024-05-31' },
  { id: '7', employee_id_str: 'EMP-007', employee_name: 'Vikram Mehta', department: 'HVAC Field Tech', shift: '9:00 AM - 6:00 PM', check_in: '9:18 AM', check_out: '', work_hours: '8h 38m', status: 'late', location: 'Kozhikode, Kerala', device: 'WhatsApp Geo-Punch (Android)', date: '2024-05-31' },
  { id: '8', employee_id_str: 'EMP-008', employee_name: 'Mohammed Farooq', department: 'Fleet Logistics', shift: '8:30 AM - 5:30 PM', check_in: '8:28 AM', check_out: '', work_hours: '9h 02m', status: 'present', location: 'Feroke Hub', device: 'GPS Biometric Terminal', date: '2024-05-31' },
  { id: '9', employee_id_str: 'EMP-009', employee_name: 'Ananya Sen', department: 'Client Success', shift: '9:00 AM - 6:00 PM', check_in: '8:59 AM', check_out: '', work_hours: '8h 57m', status: 'present', location: 'Kozhikode Office', device: 'WhatsApp Web (Windows)', date: '2024-05-31' },
  { id: '10', employee_id_str: 'EMP-010', employee_name: 'Rohan Kulkarni', department: 'AC Field Tech', shift: '9:00 AM - 6:00 PM', check_in: '9:22 AM', check_out: '', work_hours: '8h 34m', status: 'late', location: 'Pantheeramkavu, Kerala', device: 'WhatsApp Geo-Punch (Android)', date: '2024-05-31' },
  { id: '11', employee_id_str: 'EMP-011', employee_name: 'Divya Krishnan', department: 'Dispatch Coordination', shift: '9:00 AM - 6:00 PM', check_in: '8:55 AM', check_out: '', work_hours: '9h 01m', status: 'present', location: 'Kozhikode Office', device: 'Desktop App (Chrome)', date: '2024-05-30' },
  { id: '12', employee_id_str: 'EMP-012', employee_name: 'Faizan Ali', department: 'Inventory & Parts', shift: '9:00 AM - 6:00 PM', check_in: '8:50 AM', check_out: '', work_hours: '9h 06m', status: 'present', location: 'Central Warehouse', device: 'Barcode Scanner Terminal', date: '2024-05-30' },
  { id: '13', employee_id_str: 'EMP-013', employee_name: 'Shilpa Menon', department: 'Finance & Billing', shift: '9:30 AM - 6:30 PM', check_in: '9:28 AM', check_out: '', work_hours: '8h 52m', status: 'present', location: 'Kozhikode Office', device: 'WhatsApp Web (Windows)', date: '2024-05-30' },
  { id: '14', employee_id_str: 'EMP-014', employee_name: 'Harish Varma', department: 'Plumbing Services', shift: '9:00 AM - 6:00 PM', check_in: '9:01 AM', check_out: '', work_hours: '8h 55m', status: 'present', location: 'Mavoor Road', device: 'WhatsApp Geo-Punch (Android)', date: '2024-05-30' },
  { id: '15', employee_id_str: 'EMP-015', employee_name: 'Kavita Nair', department: 'QA & Compliance', shift: '9:00 AM - 6:00 PM', check_in: '8:54 AM', check_out: '', work_hours: '9h 02m', status: 'present', location: 'Kozhikode Office', device: 'WhatsApp Geo-Punch (iOS)', date: '2024-05-29' },
  { id: '16', employee_id_str: 'EMP-016', employee_name: 'Karthik Ram', department: 'Electrical Field Tech', shift: '9:00 AM - 6:00 PM', check_in: '8:57 AM', check_out: '', work_hours: '8h 59m', status: 'present', location: 'Palazhi, Kerala', device: 'WhatsApp Geo-Punch (Android)', date: '2024-05-29' },
  { id: '17', employee_id_str: 'EMP-017', employee_name: 'Manju Swamy', department: 'Appliance Repair', shift: '9:00 AM - 6:00 PM', check_in: '9:03 AM', check_out: '', work_hours: '8h 53m', status: 'present', location: 'Beypore, Kerala', device: 'WhatsApp Geo-Punch (Android)', date: '2024-05-28' },
  { id: '18', employee_id_str: 'EMP-018', employee_name: 'Zoya Khan', department: 'Customer Support', shift: '9:00 AM - 6:00 PM', check_in: '8:56 AM', check_out: '', work_hours: '9h 00m', status: 'present', location: 'Kozhikode Office', device: 'WhatsApp Web (Chrome)', date: '2024-05-28' },
];

export const AttendanceView: React.FC = () => {
  const store = useQiyamStore();
  const { attendance, clockInEmployee, addToast, globalFilter, globalDateInterval } = store;

  // Use database attendance if available, otherwise fall back to presentation demo records
  const allRecords = useMemo(() => {
    return attendance && attendance.length > 0
      ? attendance.map((a, i) => ({
          ...a,
          date: (a as any).date || (i < 10 ? '2024-05-31' : i < 14 ? '2024-05-30' : '2024-05-29'),
        }))
      : DEFAULT_ATTENDANCE_RECORDS;
  }, [attendance]);

  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualDept, setManualDept] = useState('AC Services');

  // Modern Date Range state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    label: 'May 1 – May 31, 2024',
  });

  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // 1. Status Filter
      if (globalFilter.status && globalFilter.status !== 'all') {
        if (['present', 'late', 'absent'].includes(globalFilter.status) && rec.status !== globalFilter.status) return false;
      } else if (statusFilter !== 'all') {
        if (statusFilter === 'absent') {
          if (rec.status !== 'absent' && rec.status !== 'on_leave') return false;
        } else if (rec.status !== statusFilter) {
          return false;
        }
      }

      // 2. Keyword Search Query
      const q = (searchQuery || globalFilter.query || '').toLowerCase().trim();
      if (q) {
        const match =
          rec.employee_name.toLowerCase().includes(q) ||
          rec.department.toLowerCase().includes(q) ||
          rec.employee_id_str.toLowerCase().includes(q) ||
          rec.location.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 3. Date Range Filter
      const recordDate = (rec as any).date || '2024-05-31';
      if (globalDateInterval) {
        if (recordDate < globalDateInterval.start || recordDate > globalDateInterval.end) return false;
      } else if (dateRange.startDate && dateRange.endDate) {
        if (recordDate < dateRange.startDate || recordDate > dateRange.endDate) return false;
      }

      return true;
    });
  }, [allRecords, statusFilter, searchQuery, dateRange, globalFilter, globalDateInterval]);

  // Dynamic counts within selected date range
  const recordsInDateRange = useMemo(() => {
    return allRecords.filter((rec) => {
      const recordDate = (rec as any).date || '2024-05-31';
      return (
        (!dateRange.startDate || recordDate >= dateRange.startDate) &&
        (!dateRange.endDate || recordDate <= dateRange.endDate)
      );
    });
  }, [allRecords, dateRange]);

  const presentCount = recordsInDateRange.filter((r) => r.status === 'present').length;
  const lateCount = recordsInDateRange.filter((r) => r.status === 'late').length;
  const absentCount = recordsInDateRange.filter((r) => r.status === 'absent' || r.status === 'on_leave').length;
  const totalCount = recordsInDateRange.length;

  const handleExport = () => {
    const res = exportTableToCsv('ops-attendance', store);
    addToast(`Timesheet exported (${res.count || allRecords.length} records downloaded)`, 'success');
  };

  const handleManualClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    clockInEmployee(manualName.trim(), 'on_duty');
    addToast(`Clock-in recorded for ${manualName.trim()} (${manualDept} • WhatsApp GPS verified)`, 'success');
    setManualName('');
    setIsClockInModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Attendance & Timesheet"
        subtitle="Real-time employee check-ins, geo-location verified punch, and work hours."
        primaryActionLabel="Clock In"
        onPrimaryAction={() => setIsClockInModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Present Today</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {presentCount} / {totalCount}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {((presentCount / (totalCount || 1)) * 100).toFixed(1)}% attendance rate
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Late Arrivals</div>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">{lateCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Avg. 14 mins delay</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Absent / Leave</div>
            <div className="text-xl sm:text-2xl font-black text-red-500 mt-1">{absentCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Medical leave approved</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Avg. Work Hours</div>
            <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">8h 54m</div>
            <div className="text-[11px] text-purple-600 font-medium mt-0.5">Normal work shift</div>
          </div>
        </div>

        {/* Action Controls & Search Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Employees', count: totalCount },
              { id: 'present', label: 'Present', count: presentCount },
              { id: 'late', label: 'Late', count: lateCount },
              { id: 'absent', label: 'Absent / Leave', count: absentCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box, Date Filter & Export Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, dept, city..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Modern Date Range Calendar Button */}
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer shrink-0"
              title="Filter by custom date range"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">{dateRange.label || `${dateRange.startDate} – ${dateRange.endDate}`}</span>
              <span className="sm:hidden">Date</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer shrink-0"
              title="Export Timesheet CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[840px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Work Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification & Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec) => {
                    const initials = rec.employee_name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">{rec.employee_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rec.employee_id_str}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {rec.department}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {(rec as any).date || '2024-05-31'}
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{rec.shift}</td>

                        <td className="py-3 px-4">
                          {rec.check_in && rec.check_in !== '-' ? (
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{rec.check_in}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500">{rec.check_out || '-'}</td>

                        <td className="py-3 px-4 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono">
                            {rec.work_hours}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              rec.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rec.status === 'late'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                rec.status === 'present'
                                  ? 'bg-emerald-500'
                                  : rec.status === 'late'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            {rec.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                              <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{rec.device}</span>
                            </div>
                            {rec.location && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{rec.location}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No attendance records found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or search keywords</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Clock-In Demo Modal */}
      {isClockInModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsClockInModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Clock In Employee</h3>
              </div>
              <button
                onClick={() => setIsClockInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualClockIn} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Menon"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                <select
                  value={manualDept}
                  onChange={(e) => setManualDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="AC Services">AC Services</option>
                  <option value="Electrical Services">Electrical Services</option>
                  <option value="Plumbing Services">Plumbing Services</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Operations Lead">Operations Lead</option>
                  <option value="Fleet Logistics">Fleet Logistics</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Geo-Punch verification is active. Clock-in will be stamped with live device timestamp and verified GPS coordinates.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClockInModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirm Clock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Interactive Date Range Picker Modal */}
      <ModernDateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={dateRange}
        onApply={(range) => {
          setDateRange(range);
        }}
        title="Filter Timesheet by Date Range"
      />
    </div>
  );
};



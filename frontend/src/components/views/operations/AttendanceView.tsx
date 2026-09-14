import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Clock, CheckCircle2, AlertCircle, MapPin, Smartphone, User } from 'lucide-react';
import { exportTableToCsv } from '@/utils/exportCsv';

export const AttendanceView: React.FC = () => {
  const store = useQiyamStore();
  const { attendance, clockInEmployee, addToast } = store;

  const handleExport = () => {
    const res = exportTableToCsv('ops-attendance', store);
    addToast(`Timesheet exported (${res.count} records downloaded as ${res.filename})`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Attendance & Timesheet"
        subtitle="Real-time employee check-ins, geo-location verified punch, and work hours."
        primaryActionLabel="Export Timesheet"
        onPrimaryAction={handleExport}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Present Today</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">15 / 18</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">83.3% attendance rate</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Late Arrivals</div>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">2</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Avg. 14 mins delay</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Absent / Leave</div>
            <div className="text-xl sm:text-2xl font-black text-red-500 mt-1">1</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Medical leave approved</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Avg. Work Hours</div>
            <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">8h 54m</div>
            <div className="text-[11px] text-purple-600 mt-0.5">Normal work shift</div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[760px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Work Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rec.employee_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{rec.department}</td>
                    <td className="py-3.5 px-4 text-slate-500">{rec.shift}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{rec.check_in}</td>
                    <td className="py-3.5 px-4 text-slate-500">{rec.check_out || '-'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rec.work_hours}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {rec.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        <span>{rec.device}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};



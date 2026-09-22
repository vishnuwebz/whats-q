import React, { useState, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  Coffee, Clock, AlertTriangle, CheckCircle2, User,
  Plus, MessageSquare, Play, Square, Bell, Search, X
} from 'lucide-react';

interface StaffBreak {
  id: string | number;
  employee_id_str: string;
  name: string;
  role: string;
  phone: string;
  break_type: 'Morning Tea (15 min)' | 'Lunch Break (45 min)' | 'Evening Tea (15 min)' | 'Short Break (10 min)';
  started_at: string;
  duration_minutes: number;
  remaining_seconds: number;
  status: 'active' | 'completed' | 'overdue';
}

const INITIAL_BREAKS: StaffBreak[] = [
  {
    id: 1,
    employee_id_str: 'EMP-001',
    name: 'Amit Sharma',
    role: 'Field Technician',
    phone: '+91 90000 11123',
    break_type: 'Morning Tea (15 min)',
    started_at: '11:15 AM',
    duration_minutes: 15,
    remaining_seconds: 420, // 7 mins left
    status: 'active',
  },
  {
    id: 2,
    employee_id_str: 'EMP-002',
    name: 'Priya Sharma',
    role: 'Customer Support',
    phone: '+91 89213 56789',
    break_type: 'Lunch Break (45 min)',
    started_at: '01:00 PM',
    duration_minutes: 45,
    remaining_seconds: 1350, // 22 mins left
    status: 'active',
  },
  {
    id: 3,
    employee_id_str: 'EMP-003',
    name: 'Rahul Singh',
    role: 'Plumbing Technician',
    phone: '+91 98764 11122',
    break_type: 'Morning Tea (15 min)',
    started_at: '10:45 AM',
    duration_minutes: 15,
    remaining_seconds: 0,
    status: 'completed',
  },
];

export const EmployeeBreaksView: React.FC = () => {
  const { employees, addToast, openConversationForContact } = useQiyamStore();

  const [breaks, setBreaks] = useState<StaffBreak[]>(INITIAL_BREAKS);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.employee_id_str || 'EMP-001');
  const [breakType, setBreakType] = useState<StaffBreak['break_type']>('Morning Tea (15 min)');

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setBreaks((prev) =>
        prev.map((b) => {
          if (b.status === 'active' && b.remaining_seconds > 0) {
            const next = b.remaining_seconds - 1;
            return {
              ...b,
              remaining_seconds: next,
              status: next === 0 ? 'overdue' : 'active',
            };
          }
          return b;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleEndBreak = (id: string | number) => {
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'completed', remaining_seconds: 0 } : b))
    );
    addToast('Break completed, staff returned to duty', 'success');
  };

  const handleSendReminder = (b: StaffBreak) => {
    openConversationForContact({
      name: b.name,
      phone: b.phone,
      service: `Break Alert: ${b.break_type}`,
      initialMessage: `Hi ${b.name}, your ${b.break_type} is ending soon. Please resume your assigned field duty. Thank you!`,
      skipConfirmation: true,
    });
    addToast(`WhatsApp reminder sent to ${b.name}`, 'info');
  };

  const handleStartBreakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employee_id_str === selectedEmpId);
    if (!emp) return;

    const duration = breakType.includes('45') ? 45 : breakType.includes('10') ? 10 : 15;
    const newBreak: StaffBreak = {
      id: Date.now(),
      employee_id_str: emp.employee_id_str,
      name: emp.name,
      role: emp.role,
      phone: emp.phone,
      break_type: breakType,
      started_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration_minutes: duration,
      remaining_seconds: duration * 60,
      status: 'active',
    };

    setBreaks([newBreak, ...breaks]);
    setIsStartModalOpen(false);
    addToast(`${breakType} started for ${emp.name}`, 'success');
  };

  const activeBreaks = breaks.filter((b) => b.status === 'active' || b.status === 'overdue');

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Work Breaks & Duty Alerts"
        subtitle="Track tea and lunch breaks, live countdown timers, and WhatsApp reminders to resume duty."
        activeSubTab="ops-emp-breaks"
        primaryActionLabel="Start Staff Break"
        primaryActionIcon={Coffee}
        onPrimaryAction={() => setIsStartModalOpen(true)}
        badgeCount={`${activeBreaks.length} on Break`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Currently on Break</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{activeBreaks.length} Staff</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Timer running</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Tea Breaks Allowed</div>
            <div className="text-2xl font-black text-slate-900 mt-1">2 x 15 Mins</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Morning & evening tea</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Lunch Break Window</div>
            <div className="text-2xl font-black text-slate-900 mt-1">45 Mins</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Between 1:00 PM - 2:30 PM</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Overdue / Long Breaks</div>
            <div className="text-2xl font-black text-red-500 mt-1">
              {breaks.filter((b) => b.status === 'overdue').length}
            </div>
            <div className="text-[11px] text-red-600 mt-0.5">Exceeded allowed minutes</div>
          </div>
        </div>

        {/* Live Active Breaks Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-600" />
              <span>Active Breaks Right Now ({activeBreaks.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Live countdown updates automatically</span>
          </div>

          {activeBreaks.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              All staff members are actively on duty. No breaks currently in progress.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBreaks.map((b) => {
                const isOverdue = b.status === 'overdue' || b.remaining_seconds === 0;

                return (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl border shadow-xs transition-all space-y-4 ${
                      isOverdue
                        ? 'bg-red-50/70 border-red-200'
                        : 'bg-white border-amber-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                          <Coffee className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{b.name}</div>
                          <div className="text-[11px] text-slate-500">{b.role}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOverdue
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isOverdue ? 'OVERDUE' : 'ON BREAK'}
                      </span>
                    </div>

                    {/* Timer Box */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{b.break_type}</span>
                        <span className="text-xs text-slate-600 font-medium">Started at {b.started_at}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Time Left</span>
                        <span className={`text-lg font-black font-mono ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                          {isOverdue ? '00:00' : formatSeconds(b.remaining_seconds)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleEndBreak(b.id)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resume Duty</span>
                      </button>

                      <button
                        onClick={() => handleSendReminder(b)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                        title="Send WhatsApp Break Over Alert"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Break Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Today's Break History Log</h3>
            <span className="text-xs text-slate-400">Total {breaks.length} breaks recorded today</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Break Type</th>
                  <th className="p-3.5">Start Time</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Duty Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {breaks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{b.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{b.employee_id_str} • {b.role}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{b.break_type}</td>
                    <td className="p-3.5 font-mono text-slate-600">{b.started_at}</td>
                    <td className="p-3.5 font-bold text-slate-700">{b.duration_minutes} mins</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'overdue'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {b.status === 'active' || b.status === 'overdue' ? (
                        <button
                          onClick={() => handleEndBreak(b.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          End Break
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Completed ✔</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Start Break Modal */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Start Break for Staff Member</h3>
              <button
                onClick={() => setIsStartModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartBreakSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Staff Member *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
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
                <label className="block text-slate-600 font-semibold mb-1">Break Type *</label>
                <select
                  value={breakType}
                  onChange={(e) => setBreakType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Morning Tea (15 min)">Morning Tea Break (15 minutes)</option>
                  <option value="Lunch Break (45 min)">Lunch Break (45 minutes)</option>
                  <option value="Evening Tea (15 min)">Evening Tea Break (15 minutes)</option>
                  <option value="Short Break (10 min)">Short Rest Break (10 minutes)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Start Break Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

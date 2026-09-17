import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Calendar, ChevronLeft, ChevronRight, Plus, User, Clock, X } from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const { employees, addToast, targetHighlightId, globalFilter } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEmployees = employees.filter((emp) => {
    if (globalFilter.assignedTo && globalFilter.assignedTo !== 'all' && emp.name !== globalFilter.assignedTo) {
      return false;
    }
    if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      if (s === 'active' && emp.status?.toLowerCase() !== 'active') return false;
      if (s === 'on_duty' && emp.status?.toLowerCase() !== 'on_duty') return false;
      if (s === 'on_leave' && emp.status?.toLowerCase() !== 'on_leave') return false;
    }
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.employee_id_str.toLowerCase().includes(q)
      );
    }
    return true;
  });
  const [shiftForm, setShiftForm] = useState({
    employee_id: employees[0]?.id || 1,
    day_idx: 0,
    shift_type: 'morning'
  });

  const [weekOffset, setWeekOffset] = useState(0);
  const [roster, setRoster] = useState<Record<string, 'morning' | 'evening' | 'night' | 'off'>>({});

  const getShiftFor = (empId: string | number, dayIdx: number): 'morning' | 'evening' | 'night' | 'off' => {
    const key = `${empId}-${weekOffset}-${dayIdx}`;
    if (roster[key]) return roster[key];
    if (dayIdx === 6 || (Number(empId) === 4 && dayIdx === 4)) return 'off';
    return dayIdx % 2 === 0 ? 'morning' : 'evening';
  };

  const { weekTitle, days } = React.useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon + weekOffset * 7);

    const weekDays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      weekDays.push(`${dayName}, ${monthDay}`);
    }

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startMonth = monday.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const endMonth = sunday.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const title = `${startMonth} – ${endMonth}`;

    return { weekTitle: title, days: weekDays };
  }, [weekOffset]);

  const handleAssignShift = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === Number(shiftForm.employee_id)) || employees[0];
    const selectedDay = days[shiftForm.day_idx];
    const shiftType = shiftForm.shift_type as 'morning' | 'evening' | 'night' | 'off';
    const key = `${shiftForm.employee_id}-${weekOffset}-${shiftForm.day_idx}`;
    setRoster((prev) => ({ ...prev, [key]: shiftType }));
    addToast(`Shift assigned to ${emp?.name || 'Employee'} for ${selectedDay} (${shiftType.toUpperCase()})!`, 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Team Shift Schedule"
        subtitle="Weekly work shifts, on-call assignments, and technician field roster."
        primaryActionLabel="Assign Shift"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Team Shift KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Roster Headcount</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{employees.length}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5">Full team scheduled</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">On Duty (Field)</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {employees.filter((e) => e.status === 'on_duty').length}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Active shift active</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Active Staff</div>
            <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
              {employees.filter((e) => e.status === 'active' || e.status === 'on_duty').length}
            </div>
            <div className="text-[10px] sm:text-[11px] text-blue-600 font-medium mt-0.5">Available for dispatch</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">On Leave / Off</div>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
              {employees.filter((e) => e.status === 'on_leave').length}
            </div>
            <div className="text-[10px] sm:text-[11px] text-amber-600 font-medium mt-0.5">Rest day rotation</div>
          </div>
        </div>

        {/* Schedule Controls */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              title="Previous Week"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800 text-sm min-w-[170px] text-center">{weekTitle}</span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              title="Next Week"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition cursor-pointer"
              >
                Current Week
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-slate-500 font-medium">Legend:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold whitespace-nowrap">Morning (9 AM - 6 PM)</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold whitespace-nowrap">Evening (1 PM - 10 PM)</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold whitespace-nowrap">Off</span>
          </div>
        </div>

        {/* Schedule Grid Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[720px]">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-48">Employee</th>
                  {days.map((day, idx) => (
                    <th key={idx} className="py-3 px-3 text-center whitespace-nowrap">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmployees.map((emp) => {
                  const isTarget = targetHighlightId === emp.id || targetHighlightId === emp.name;
                  return (
                    <tr
                      key={emp.id}
                      className={`transition-colors ${
                        isTarget ? 'bg-amber-50 ring-2 ring-amber-400 font-medium' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {emp.name}
                          {isTarget && (
                            <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                              Target
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{emp.role}</div>
                      </td>
                      {days.map((_, idx) => {
                        const shiftType = getShiftFor(emp.id, idx);
                        const isOff = shiftType === 'off';
                        const label = isOff
                          ? 'Off'
                          : shiftType === 'morning'
                          ? '09:00 - 18:00'
                          : shiftType === 'evening'
                          ? '13:00 - 22:00'
                          : '22:00 - 06:00';
                        return (
                          <td key={idx} className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setShiftForm({
                                  employee_id: emp.id,
                                  day_idx: idx,
                                  shift_type: shiftType,
                                });
                                setIsModalOpen(true);
                              }}
                              title={`Click to reassign shift for ${emp.name} on ${days[idx]}`}
                              className={`w-full p-2 rounded-xl text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${
                                isOff
                                  ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                  : shiftType === 'morning'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : shiftType === 'evening'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                              }`}
                            >
                              {label}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Assign Work Shift</h3>
                <p className="text-xs text-slate-500">Allocate day and shift timings for field technicians.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignShift} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Employee *</label>
                <select
                  value={shiftForm.employee_id}
                  onChange={(e) => setShiftForm({ ...shiftForm, employee_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Roster Day</label>
                <select
                  value={shiftForm.day_idx}
                  onChange={(e) => setShiftForm({ ...shiftForm, day_idx: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                >
                  {days.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shift Timing</label>
                <select
                  value={shiftForm.shift_type}
                  onChange={(e) => setShiftForm({ ...shiftForm, shift_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                >
                  <option value="morning">Morning (09:00 AM – 06:00 PM)</option>
                  <option value="evening">Evening (01:00 PM – 10:00 PM)</option>
                  <option value="night">Night On-Call (10:00 PM – 06:00 AM)</option>
                  <option value="off">Day Off (Rest Day)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Confirm Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



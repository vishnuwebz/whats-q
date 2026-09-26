import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  Target, TrendingUp, CheckCircle2, AlertCircle, Plus,
  Search, Filter, Clock, BarChart3, Zap, X
} from 'lucide-react';

interface StaffGoal {
  id: string | number;
  employee_id_str: string;
  name: string;
  department: string;
  role: string;
  monthly_target: number;
  completed_jobs: number;
  daily_quota: number;
  on_time_rate: number;
  status: 'ahead' | 'on_track' | 'needs_support';
}

export const EmployeeProductivityView: React.FC = () => {
  const { employees, addToast } = useQiyamStore();

  const [goals, setGoals] = useState<StaffGoal[]>(() => {
    return employees.map((emp) => {
      const completed = emp.jobs_completed_month || 20;
      const target = completed > 40 ? 60 : completed > 25 ? 35 : 25;
      const pct = (completed / target) * 100;
      const status: StaffGoal['status'] = pct >= 90 ? 'ahead' : pct >= 70 ? 'on_track' : 'needs_support';

      return {
        id: emp.id,
        employee_id_str: emp.employee_id_str,
        name: emp.name,
        department: emp.department,
        role: emp.role,
        monthly_target: target,
        completed_jobs: completed,
        daily_quota: Math.round(target / 24),
        on_time_rate: Number(emp.on_time_percent) || 95,
        status,
      };
    });
  });

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Target modal form
  const [targetForm, setTargetForm] = useState({
    employee_id_str: employees[0]?.employee_id_str || 'EMP-001',
    monthly_target: 35,
    daily_quota: 2,
  });

  const totalCompleted = goals.reduce((acc, g) => acc + g.completed_jobs, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.monthly_target, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 85;

  const handleUpdateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals((prev) =>
      prev.map((g) => {
        if (g.employee_id_str === targetForm.employee_id_str) {
          const completed = g.completed_jobs;
          const target = Number(targetForm.monthly_target);
          const pct = (completed / target) * 100;
          const status: StaffGoal['status'] = pct >= 90 ? 'ahead' : pct >= 70 ? 'on_track' : 'needs_support';
          return {
            ...g,
            monthly_target: target,
            daily_quota: Number(targetForm.daily_quota),
            status,
          };
        }
        return g;
      })
    );
    setIsTargetModalOpen(false);
    addToast('Target updated successfully!', 'success');
  };

  const departments = ['all', ...Array.from(new Set(goals.map((g) => g.department)))];

  const filteredGoals = goals.filter((g) => {
    if (selectedDept !== 'all' && g.department !== selectedDept) return false;
    const q = search.toLowerCase().trim();
    if (q) {
      return (
        (g.name || '').toLowerCase().includes(q) ||
        (g.employee_id_str || '').toLowerCase().includes(q) ||
        (g.department || '').toLowerCase().includes(q) ||
        (g.role || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Goals & Productivity"
        subtitle="Monthly job targets, daily quotas, work speed, and target completion tracking."
        activeSubTab="ops-emp-productivity"
        primaryActionLabel="Set Staff Target"
        primaryActionIcon={Target}
        onPrimaryAction={() => setIsTargetModalOpen(true)}
        badgeCount={`${overallPercentage}% Achieved`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Overall Progress Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0B1528] to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Monthly Target Overview
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                {totalCompleted} of {totalTarget} Jobs Completed ({overallPercentage}%)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The entire team is currently on track to exceed the monthly target of {totalTarget} service orders.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xl font-black text-emerald-400">{overallPercentage}%</span>
              <span className="text-xs text-slate-400 block">Overall Pace</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total Jobs Done (Month)</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{totalCompleted} Jobs</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Across all branches</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Ahead of Target</div>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {goals.filter((g) => g.status === 'ahead').length} Staff
            </div>
            <div className="text-[11px] text-purple-600 mt-0.5">&gt; 90% target achieved</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">On Track</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {goals.filter((g) => g.status === 'on_track').length} Staff
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5">Steady daily progress</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Needs Support</div>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {goals.filter((g) => g.status === 'needs_support').length} Staff
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Below 70% of quota</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff, department, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Goals Progress Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((g) => {
            const percentage = Math.round((g.completed_jobs / g.monthly_target) * 100);
            const isAhead = g.status === 'ahead';
            const isSupport = g.status === 'needs_support';

            return (
              <div
                key={g.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{g.name}</h4>
                    <div className="text-[11px] text-slate-500">{g.role} • {g.department}</div>
                    <span className="text-[10px] font-mono text-slate-400">{g.employee_id_str}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isAhead
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : isSupport
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isAhead ? 'AHEAD' : isSupport ? 'NEEDS SUPPORT' : 'ON TRACK'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Completed vs Target</span>
                    <span className="font-bold text-slate-900">
                      {g.completed_jobs} / {g.monthly_target} Jobs ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAhead ? 'bg-purple-600' : isSupport ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Details Strip */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Daily Quota:</span>
                    <span className="font-semibold text-slate-800">{g.daily_quota} jobs/day</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">On-Time Arrival:</span>
                    <span className="font-semibold text-purple-600">{g.on_time_rate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Staff Target Modal */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Set Monthly Staff Target</h3>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTarget} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Staff Member *</label>
                <select
                  value={targetForm.employee_id_str}
                  onChange={(e) => setTargetForm({ ...targetForm, employee_id_str: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.employee_id_str}>
                      {g.name} ({g.employee_id_str}) - {g.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Monthly Target (Jobs)</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    required
                    value={targetForm.monthly_target}
                    onChange={(e) => setTargetForm({ ...targetForm, monthly_target: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Daily Target (Jobs/Day)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={targetForm.daily_quota}
                    onChange={(e) => setTargetForm({ ...targetForm, daily_quota: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

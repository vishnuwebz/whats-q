import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Employee } from '@/types';
import {
  Users, Search, Filter, Plus, Phone, Mail, MapPin,
  Star, CheckCircle2, Clock, Calendar, Award
} from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { employees, clockInEmployee, addToast } = useQiyamStore();
  const [search, setSearch] = useState('');

  const filtered = employees.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Employee Management"
        subtitle="Manage field technicians, support staff, performance ratings, and shifts."
        primaryActionLabel="Add Employee"
        onPrimaryAction={() => addToast('Add new employee modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total Staff</div>
            <div className="text-2xl font-black text-slate-900 mt-1">18</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Across 4 departments</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">On Duty (Field)</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">12</div>
            <div className="text-[11px] text-slate-500 mt-0.5">GPS Tracking active</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">On-Time Rate</div>
            <div className="text-2xl font-black text-purple-600 mt-1">96.4%</div>
            <div className="text-[11px] text-purple-600 mt-0.5">↑ 2.1% this month</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Avg. Rating</div>
            <div className="text-2xl font-black text-amber-500 mt-1">4.8 ⭐</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Based on 320 reviews</div>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          {filtered.map((emp) => {
            const isOnDuty = emp.status === 'on_duty';
            const isOnLeave = emp.status === 'on_leave';

            return (
              <div
                key={emp.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm ring-2 ring-emerald-500/20">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{emp.name}</h4>
                        <div className="text-[11px] text-slate-500 font-medium">{emp.role}</div>
                        <span className="text-[10px] font-mono text-slate-400">{emp.employee_id_str}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOnDuty
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOnLeave
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {emp.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800">{emp.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono text-slate-700">{emp.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rating:</span>
                      <span className="font-bold text-amber-500">{emp.rating} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jobs Completed (Month):</span>
                      <span className="font-bold text-emerald-600">{emp.jobs_completed_month} jobs</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => clockInEmployee(emp.id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm text-center transition-all"
                  >
                    Check In / Clock
                  </button>
                  <button
                    onClick={() => addToast(`Viewing performance analytics for ${emp.name}`, 'info')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
                  >
                    Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};



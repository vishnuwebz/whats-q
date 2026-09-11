import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Calendar, ChevronLeft, ChevronRight, Plus, User, Clock } from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const { employees, addToast } = useQiyamStore();
  const days = ['Mon, May 27', 'Tue, May 28', 'Wed, May 29', 'Thu, May 30', 'Fri, May 31', 'Sat, Jun 01', 'Sun, Jun 02'];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Team Shift Schedule"
        subtitle="Weekly work shifts, on-call assignments, and technician field roster."
        primaryActionLabel="Assign Shift"
        onPrimaryAction={() => addToast('Shift assignment modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        {/* Schedule Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-bold text-slate-800 text-sm">May 27 – June 02, 2024</span>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Legend:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Morning (9 AM - 6 PM)</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Evening (1 PM - 10 PM)</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Off</span>
          </div>
        </div>

        {/* Schedule Grid Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-48">Employee</th>
                {days.map((day, idx) => (
                  <th key={idx} className="py-3 px-3 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-[10px] text-slate-400">{emp.role}</div>
                  </td>
                  {days.map((_, idx) => {
                    const isOff = idx === 6 || (emp.id === 4 && idx === 4);
                    return (
                      <td key={idx} className="p-2 text-center">
                        <div
                          className={`p-2 rounded-xl text-[10px] font-semibold ${
                            isOff
                              ? 'bg-slate-100 text-slate-400'
                              : idx % 2 === 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isOff ? 'Off' : '09:00 - 18:00'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



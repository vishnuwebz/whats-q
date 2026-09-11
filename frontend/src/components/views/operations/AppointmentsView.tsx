import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Appointment } from '@/types';
import {
  Calendar, Clock, MapPin, User, Search, Filter, Plus,
  CheckCircle2, AlertCircle, MoreVertical, DollarSign, MessageSquare
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const { appointments, addToast, setActiveTab } = useQiyamStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = appointments.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Appointments"
        subtitle="Manage customer booking slots, 30% advance UPI collections, and service reminders."
        primaryActionLabel="Book Appointment"
        onPrimaryAction={() => addToast('Appointment booking modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total Bookings</div>
            <div className="text-2xl font-black text-slate-900 mt-1">31</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">↑ 10.3% this week</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Confirmed (Advance Paid)</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">24</div>
            <div className="text-[11px] text-slate-500 mt-0.5">₹21,600 collected</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Awaiting Advance</div>
            <div className="text-2xl font-black text-amber-600 mt-1">5</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Reminder sent via WhatsApp</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Avg. Duration</div>
            <div className="text-2xl font-black text-purple-600 mt-1">1h 45m</div>
            <div className="text-[11px] text-purple-600 mt-0.5">Standard service slot</div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Scheduled Appointments</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterStatus === 'confirmed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilterStatus('upcoming')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterStatus === 'upcoming' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Slot</th>
                <th className="py-3 px-4">Amount / Advance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{apt.apt_id_str}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{apt.customer_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{apt.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{apt.service}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.employee}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{apt.date_str}</div>
                    <div className="text-[11px] text-slate-500">{apt.time_str} ({apt.duration})</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">₹{apt.amount}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Advance: ₹{apt.advance}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        addToast(`WhatsApp reminder sent to ${apt.customer_name}`, 'success');
                        setActiveTab('conversations');
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-[11px]"
                    >
                      Remind
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



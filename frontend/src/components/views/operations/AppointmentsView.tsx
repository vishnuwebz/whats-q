import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Appointment } from '@/types';
import {
  Calendar, Clock, MapPin, User, Search, Filter, Plus,
  CheckCircle2, AlertCircle, MoreVertical, DollarSign, MessageSquare, X
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    employees,
    addAppointment,
    addToast,
    setActiveTab,
    globalFilter,
    targetHighlightId,
  } = useQiyamStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookForm, setBookForm] = useState({
    apt_id_str: `APT-${100 + appointments.length + 1}`,
    customer_name: '',
    phone: '',
    service: 'AC Inspection & Deep Service',
    employee: 'Ramesh Kumar',
    date_str: 'Tomorrow',
    time_str: '10:00 AM',
    duration: '1h 30m',
    status: 'confirmed' as Appointment['status'],
    location: 'Kozhikode City',
    amount: 2800,
    advance: 840,
    payment_status: 'advance_paid' as Appointment['payment_status'],
    source: 'WhatsApp Assistant',
    notes: 'Booking confirmed with 30% advance',
  });

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.customer_name.trim()) return;
    await addAppointment(bookForm);
    setIsBookModalOpen(false);
    setBookForm({
      apt_id_str: `APT-${100 + appointments.length + 2}`,
      customer_name: '',
      phone: '',
      service: 'AC Inspection & Deep Service',
      employee: 'Ramesh Kumar',
      date_str: 'Tomorrow',
      time_str: '10:00 AM',
      duration: '1h 30m',
      status: 'confirmed',
      location: 'Kozhikode City',
      amount: 2800,
      advance: 840,
      payment_status: 'advance_paid',
      source: 'WhatsApp Assistant',
      notes: 'Booking confirmed with 30% advance',
    });
  };

  const filtered = appointments.filter((a) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      if (globalFilter.status === 'open' && a.status !== 'upcoming') return false;
      if (globalFilter.status === 'completed' && a.status !== 'completed') return false;
    } else if (filterStatus !== 'all' && a.status !== filterStatus) {
      return false;
    }
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        a.customer_name.toLowerCase().includes(q) ||
        a.service.toLowerCase().includes(q) ||
        a.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Appointments"
        subtitle="Manage customer booking slots, 30% advance UPI collections, and service reminders."
        primaryActionLabel="Book Appointment"
        onPrimaryAction={() => setIsBookModalOpen(true)}
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

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Book Customer Appointment</h3>
                  <p className="text-[11px] text-slate-500">Lock time slot, assign service staff, and request 30% UPI advance.</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.customer_name}
                    onChange={(e) => setBookForm({ ...bookForm, customer_name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.phone}
                    onChange={(e) => setBookForm({ ...bookForm, phone: e.target.value })}
                    placeholder="e.g. +91 98470 33221"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Service</label>
                  <input
                    type="text"
                    value={bookForm.service}
                    onChange={(e) => setBookForm({ ...bookForm, service: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Staff</label>
                  <select
                    value={bookForm.employee}
                    onChange={(e) => setBookForm({ ...bookForm, employee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                    ))}
                    {employees.length === 0 && <option value="Ramesh Kumar">Ramesh Kumar</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date</label>
                  <input
                    type="text"
                    value={bookForm.date_str}
                    onChange={(e) => setBookForm({ ...bookForm, date_str: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Time Slot</label>
                  <input
                    type="text"
                    value={bookForm.time_str}
                    onChange={(e) => setBookForm({ ...bookForm, time_str: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={bookForm.duration}
                    onChange={(e) => setBookForm({ ...bookForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Fee (₹)</label>
                  <input
                    type="number"
                    value={bookForm.amount}
                    onChange={(e) => {
                      const amt = Number(e.target.value);
                      setBookForm({ ...bookForm, amount: amt, advance: Math.round(amt * 0.3) });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">30% Advance (₹)</label>
                  <input
                    type="number"
                    value={bookForm.advance}
                    onChange={(e) => setBookForm({ ...bookForm, advance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm shadow-rose-700/20 cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



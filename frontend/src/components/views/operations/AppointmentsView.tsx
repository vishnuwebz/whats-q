import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Appointment } from '@/types';
import {
  Calendar, Clock, MapPin, User, Search, Filter, Plus,
  CheckCircle2, AlertCircle, MoreVertical, DollarSign, MessageSquare, X,
  Phone, Send, ExternalLink, ShieldCheck, ChevronRight, FileText, Check,
  CreditCard, Sparkles, ArrowRight
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    employees,
    addAppointment,
    openConversationForAppointment,
    openConversationForContact,
    addToast,
    setActiveTab,
    globalFilter,
    targetHighlightId,
    isNewBookingModalOpen,
    setIsNewBookingModalOpen,
  } = useQiyamStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  React.useEffect(() => {
    if (isNewBookingModalOpen) {
      setIsBookModalOpen(true);
      setIsNewBookingModalOpen(false);
    }
  }, [isNewBookingModalOpen, setIsNewBookingModalOpen]);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  const handleRemindAppointment = async (apt: Appointment) => {
    addToast(`Dispatching WhatsApp reminder to ${apt.customer_name}...`, 'info');
    await openConversationForAppointment(apt, { sendReminder: true });
  };

  const handleOpenChat = async (apt: Appointment) => {
    addToast(`Opening WhatsApp chat with ${apt.customer_name}...`, 'info');
    await openConversationForAppointment(apt, { sendReminder: false });
  };
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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Appointments"
        subtitle="Manage customer booking slots, 30% advance UPI collections, and service reminders."
        primaryActionLabel="Book Appointment"
        onPrimaryAction={() => setIsBookModalOpen(true)}
      />

      <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Total Bookings</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">31</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5">↑ 10.3% this week</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Confirmed (Advance)</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">24</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">₹21,600 collected</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Awaiting Advance</div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">5</div>
            <div className="text-[10px] sm:text-[11px] text-amber-600 mt-0.5">Reminder sent</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Avg. Duration</div>
            <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">1h 45m</div>
            <div className="text-[10px] sm:text-[11px] text-purple-600 mt-0.5">Standard slot</div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Scheduled Appointments</h3>
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
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

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[720px]">
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
                {filtered.map((apt) => {
                  const isSelected = selectedAppointment?.id === apt.id;
                  const isHighlighted = targetHighlightId === apt.id || targetHighlightId === apt.apt_id_str;
                  return (
                    <tr
                      key={apt.id}
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsDetailsDrawerOpen(true);
                      }}
                      className={`hover:bg-slate-50/90 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-rose-50/50 ring-1 ring-rose-200' : isHighlighted ? 'bg-amber-50 ring-2 ring-amber-400' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{apt.apt_id_str}</span>
                          <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{apt.customer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{apt.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{apt.service}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {apt.employee ? apt.employee.charAt(0) : 'U'}
                          </div>
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : apt.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRemindAppointment(apt)}
                            title={`Send WhatsApp reminder to ${apt.customer_name} and open exact chat`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] shadow-sm shadow-emerald-700/20 cursor-pointer transition-all active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Remind</span>
                          </button>
                          <button
                            onClick={() => handleOpenChat(apt)}
                            title={`Open ${apt.customer_name}'s WhatsApp chat`}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
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

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.customer_name}
                    onChange={(e) => setBookForm({ ...bookForm, customer_name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Service</label>
                  <input
                    type="text"
                    value={bookForm.service}
                    onChange={(e) => setBookForm({ ...bookForm, service: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Staff</label>
                  <select
                    value={bookForm.employee}
                    onChange={(e) => setBookForm({ ...bookForm, employee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                    ))}
                    {employees.length === 0 && <option value="Ramesh Kumar">Ramesh Kumar</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date</label>
                  <input
                    type="text"
                    value={bookForm.date_str}
                    onChange={(e) => setBookForm({ ...bookForm, date_str: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Time Slot</label>
                  <input
                    type="text"
                    value={bookForm.time_str}
                    onChange={(e) => setBookForm({ ...bookForm, time_str: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={bookForm.duration}
                    onChange={(e) => setBookForm({ ...bookForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Fee (₹)</label>
                  <input
                    type="number"
                    value={bookForm.amount}
                    onChange={(e) => {
                      const amt = Number(e.target.value);
                      setBookForm({ ...bookForm, amount: amt, advance: Math.round(amt * 0.3) });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">30% Advance (₹)</label>
                  <input
                    type="number"
                    value={bookForm.advance}
                    onChange={(e) => setBookForm({ ...bookForm, advance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-rose-500"
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

      {/* Appointment Depth Details Slide-over Drawer */}
      {isDetailsDrawerOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-white border border-white/15">
                    {selectedAppointment.apt_id_str}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    selectedAppointment.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{selectedAppointment.service}</h2>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{selectedAppointment.date_str} at {selectedAppointment.time_str} ({selectedAppointment.duration})</span>
                </p>
              </div>
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Customer Contact Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Information</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      {selectedAppointment.customer_name ? selectedAppointment.customer_name.charAt(0) : 'C'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{selectedAppointment.customer_name}</div>
                      <div className="font-mono text-slate-500 text-[11px]">{selectedAppointment.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${selectedAppointment.phone}`}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-xs"
                      title="Call Customer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleOpenChat(selectedAppointment)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors shadow-xs cursor-pointer"
                      title="Open WhatsApp Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 pt-1 border-t border-slate-200/60">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedAppointment.location || 'Kozhikode, Kerala'}</span>
                </div>
              </div>

              {/* Specialist & Assignment */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Field Specialist</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-semibold">Specialist</div>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-rose-500" />
                      <span>{selectedAppointment.employee}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-semibold">Duration</div>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{selectedAppointment.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700">Source: </span>
                  <span>{selectedAppointment.source || 'WhatsApp Assistant'}</span>
                  {selectedAppointment.notes && (
                    <div className="mt-1 text-slate-500 italic">"{selectedAppointment.notes}"</div>
                  )}
                </div>
              </div>

              {/* Financial Breakdown & Advance */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment & Advance Status</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500">Total Fee</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">₹{selectedAppointment.amount}</div>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-emerald-700 font-semibold">Advance (30%)</div>
                    <div className="font-bold text-emerald-800 text-sm mt-0.5">₹{selectedAppointment.advance}</div>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                    <div className="text-[10px] text-amber-700 font-semibold">Balance Due</div>
                    <div className="font-bold text-amber-800 text-sm mt-0.5">
                      ₹{Math.max(0, selectedAppointment.amount - selectedAppointment.advance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Reminder Preview */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Reminder Preview</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Direct Sync
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100 text-[11px] text-slate-700 font-mono whitespace-pre-line shadow-xs leading-relaxed">
{`🗓️ Appointment Reminder: ${selectedAppointment.service}
Hello ${selectedAppointment.customer_name}, your appointment is scheduled on ${selectedAppointment.date_str} at ${selectedAppointment.time_str}.
Specialist: ${selectedAppointment.employee}
Location: ${selectedAppointment.location}
Total Fee: ₹${selectedAppointment.amount} | Advance Paid: ₹${selectedAppointment.advance}`}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenChat(selectedAppointment);
                    setIsDetailsDrawerOpen(false);
                  }}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open Chat</span>
                </button>
                <button
                  onClick={() => {
                    handleRemindAppointment(selectedAppointment);
                    setIsDetailsDrawerOpen(false);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reminder & Open Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



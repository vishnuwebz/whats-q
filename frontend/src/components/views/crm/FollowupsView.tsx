import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { FollowUp } from '@/types';
import { isDateWithinInterval } from '@/utils/dateFilter';
import {
  PhoneCall, MessageSquare, Mail, Calendar, Clock, CheckCircle2,
  AlertCircle, MoreVertical, Plus, User, Search, Filter, X
} from 'lucide-react';

export const FollowupsView: React.FC = () => {
  const { followups, addFollowUp, addToast, setActiveTab, globalFilter, globalDateInterval, targetHighlightId } = useQiyamStore();
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'due_today' | 'scheduled' | 'overdue' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New follow-up form state
  const [formData, setFormData] = useState({
    title: '',
    customer_name: '',
    phone: '',
    related_to: 'Service Inquiry',
    follow_up_type: 'call' as 'call' | 'whatsapp' | 'email' | 'meeting',
    assigned_to: 'Vikram Patel',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '11:00 AM',
    status: 'scheduled' as 'due_today' | 'scheduled' | 'overdue' | 'completed',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: ''
  });

  const filtered = followups.filter((f) => {
    if (activeTabFilter !== 'all' && f.status !== activeTabFilter) return false;
    if (globalFilter.status && globalFilter.status !== 'all' && f.status !== globalFilter.status) return false;
    if (globalFilter.priority && globalFilter.priority !== 'all' && f.priority !== globalFilter.priority) return false;
    if (globalFilter.assignedTo && globalFilter.assignedTo !== 'all' && f.assigned_to !== globalFilter.assignedTo) return false;
    if (!isDateWithinInterval(f.due_date, globalDateInterval)) return false;
    
    const activeSearch = (search || globalFilter.query || '').toLowerCase();
    if (activeSearch) {
      return (
        f.customer_name.toLowerCase().includes(activeSearch) ||
        f.title.toLowerCase().includes(activeSearch) ||
        f.phone.includes(activeSearch)
      );
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.customer_name) {
      addToast('Please enter both title and customer name', 'error');
      return;
    }

    addFollowUp(formData);
    addToast(`Follow-up scheduled with ${formData.customer_name}!`, 'success');
    setIsModalOpen(false);
    setFormData({
      title: '',
      customer_name: '',
      phone: '',
      related_to: 'Service Inquiry',
      follow_up_type: 'call',
      assigned_to: 'Vikram Patel',
      due_date: new Date().toISOString().split('T')[0],
      due_time: '11:00 AM',
      status: 'scheduled',
      priority: 'medium',
      notes: ''
    });
  };

  const handleAction = (item: FollowUp, action: 'call' | 'whatsapp' | 'complete') => {
    if (action === 'call') {
      addToast(`Calling ${item.customer_name} (${item.phone})...`, 'info');
    } else if (action === 'whatsapp') {
      addToast(`Opening WhatsApp chat for ${item.customer_name}...`, 'info');
      setActiveTab('conversations');
    } else if (action === 'complete') {
      addToast(`Follow-up "${item.title}" marked as completed!`, 'success');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Follow-ups"
        subtitle="Manage pending and upcoming customer interactions, calls, and payment reminders."
        primaryActionLabel="Schedule Follow-up"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        {/* Filter Pills Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTabFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({followups.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('due_today')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTabFilter === 'due_today' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Due Today (2)
            </button>
            <button
              onClick={() => setActiveTabFilter('scheduled')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTabFilter === 'scheduled' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Scheduled (1)
            </button>
            <button
              onClick={() => setActiveTabFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTabFilter === 'overdue' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overdue (1)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search follow-ups..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none w-52 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Follow-up Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isDueToday = item.status === 'due_today';
            const isOverdue = item.status === 'overdue';
            const isTarget = targetHighlightId === item.id || targetHighlightId === item.customer_name;

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isTarget
                    ? 'ring-2 ring-amber-400 bg-amber-50/40 border-amber-300'
                    : isOverdue
                    ? 'border-red-200'
                    : isDueToday
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isDueToday
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>

                    <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded-md">
                      {item.priority} Priority
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.related_to}</p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Customer:</span>
                      <span className="font-semibold text-slate-800">{item.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono text-slate-700">{item.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned To:</span>
                      <span className="font-medium text-slate-700">{item.assigned_to}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Due:</span>
                      </span>
                      <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                        {item.due_date} • {item.due_time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleAction(item, 'whatsapp')}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleAction(item, 'call')}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
                    title="Call"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleAction(item, 'complete')}
                    className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
                    title="Mark Done"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Schedule New Follow-up</h3>
                <p className="text-xs text-slate-500">Plan customer outreach, calls, or reminders with staff.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Follow-up Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call back for quotation confirmation"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Kumar"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Interaction Type</label>
                  <select
                    value={formData.follow_up_type}
                    onChange={(e) => setFormData({ ...formData, follow_up_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="email">Email</option>
                    <option value="meeting">In-Person Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Agent</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Time</label>
                  <input
                    type="text"
                    placeholder="11:30 AM"
                    value={formData.due_time}
                    onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="due_today">Due Today</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Context Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Client wanted a discount on the 3-unit package..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



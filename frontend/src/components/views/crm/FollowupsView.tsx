import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { FollowUp } from '@/types';
import {
  PhoneCall, MessageSquare, Mail, Calendar, Clock, CheckCircle2,
  AlertCircle, MoreVertical, Plus, User, Search, Filter
} from 'lucide-react';

export const FollowupsView: React.FC = () => {
  const { followups, addToast, setActiveTab } = useQiyamStore();
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'due_today' | 'scheduled' | 'overdue' | 'completed'>('all');

  const filtered = followups.filter((f) => {
    if (activeTabFilter === 'all') return true;
    return f.status === activeTabFilter;
  });

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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Follow-ups"
        subtitle="Manage pending and upcoming customer interactions, calls, and payment reminders."
        primaryActionLabel="Schedule Follow-up"
        onPrimaryAction={() => addToast('Schedule follow-up modal opened', 'info')}
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

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isOverdue ? 'border-red-200' : isDueToday ? 'border-emerald-200' : 'border-slate-200'
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
    </div>
  );
};



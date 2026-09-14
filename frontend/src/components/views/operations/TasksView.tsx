import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { CheckSquare, Clock, User, Plus, Tag, Check, X } from 'lucide-react';
import { Task } from '@/types';

export const TasksView: React.FC = () => {
  const { tasks, toggleTaskChecklist, addTask, addToast, employees, globalFilter } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    related_to: 'JOB-1024',
    assignee: 'Amit Sharma',
    priority: 'high' as Task['priority'],
    due_date: 'Today 5:00 PM',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addTask({
      title: form.title,
      subtitle: form.subtitle || 'Field quality check verification',
      related_to: form.related_to,
      assignee: form.assignee,
      priority: form.priority,
      status: 'in_progress',
      due_date: form.due_date,
      tags: ['QC', 'Operations'],
      checklist: [
        { id: '1', text: 'Pre-check refrigerant pressure', completed: false },
        { id: '2', text: 'Compressor amp measurement', completed: false },
        { id: '3', text: 'Customer digital signoff', completed: false },
      ],
    });
    setIsModalOpen(false);
    setForm({
      title: '',
      subtitle: '',
      related_to: 'JOB-1024',
      assignee: 'Amit Sharma',
      priority: 'high',
      due_date: 'Today 5:00 PM',
    });
  };

  const filtered = tasks.filter((t) => {
    if (globalFilter.priority && globalFilter.priority !== 'all' && t.priority !== globalFilter.priority) {
      return false;
    }
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.related_to.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Operations Tasks & Checklists"
        subtitle="Track field job operational checklists, quality assurance, and priority milestones."
        primaryActionLabel="New Task"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded">
                      {task.priority} Priority
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-2">{task.title}</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">{task.subtitle}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Related Job:</span>
                  <span className="font-semibold text-slate-800">{task.related_to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assignee:</span>
                  <span className="font-semibold text-slate-800">{task.assignee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Due Date:</span>
                  <span className="font-bold text-slate-800">{task.due_date}</span>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wider text-[10px]">
                  Task Checklist ({task.checklist.filter((c) => c.completed).length} / {task.checklist.length})
                </h4>
                <div className="space-y-1.5">
                  {task.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleTaskChecklist(task.id, item.id)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          item.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Create Operations Task</h3>
                  <p className="text-[11px] text-slate-500">Define field inspection or technician QA checklist.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Compressor Gas Charging Inspection"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subtitle / Milestone</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Verify R32 pressure and pipe brazing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Related Job</label>
                  <input
                    type="text"
                    value={form.related_to}
                    onChange={(e) => setForm({ ...form, related_to: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assignee</label>
                  <select
                    value={form.assignee}
                    onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.name}>{e.name}</option>
                    ))}
                    {employees.length === 0 && <option value="Amit Sharma">Amit Sharma</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Due Date</label>
                  <input
                    type="text"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm shadow-purple-700/20 cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

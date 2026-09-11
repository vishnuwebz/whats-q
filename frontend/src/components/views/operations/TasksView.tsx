import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { CheckSquare, Clock, User, Plus, Tag, Check } from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, toggleTaskChecklist, addToast } = useQiyamStore();

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Operations Tasks & Checklists"
        subtitle="Track field job operational checklists, quality assurance, and priority milestones."
        primaryActionLabel="New Task"
        onPrimaryAction={() => addToast('Create task modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {tasks.map((task) => (
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
    </div>
  );
};



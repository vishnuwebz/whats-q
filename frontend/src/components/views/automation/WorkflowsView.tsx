import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { GitBranch, Play, Plus, CheckCircle2, Clock, Zap, ArrowRight } from 'lucide-react';

export const WorkflowsView: React.FC = () => {
  const { workflows, setActiveTab, addToast } = useQiyamStore();

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Workflows"
        subtitle="Active and scheduled automation workflows running across your branches."
        primaryActionLabel="Create Workflow"
        onPrimaryAction={() => setActiveTab('automation-builder')}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => setActiveTab('automation-builder')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {wf.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{wf.name}</h3>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{wf.description}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Trigger:</span>
                  <span className="font-semibold text-slate-800">{wf.trigger_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Runs (Month):</span>
                  <span className="font-bold text-slate-900">{wf.runs_this_month} runs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Success Rate:</span>
                  <span className="font-bold text-emerald-600">{wf.success_rate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-400 text-[11px]">
                <span>Modified: {wf.last_modified}</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span>Edit Flow</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



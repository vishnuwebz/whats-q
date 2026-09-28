import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { GitBranch, Play, Plus, CheckCircle2, Clock, Zap, ArrowRight, Trash2, AlertTriangle, X } from 'lucide-react';

export const WorkflowsView: React.FC = () => {
  const {
    workflows,
    setActiveTab,
    setActiveWorkflowId,
    setActiveWorkflowTitle,
    setActiveWorkflowGroups,
    deleteWorkflow,
    globalFilter
  } = useQiyamStore();

  const [workflowToDelete, setWorkflowToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredWorkflows = workflows.filter((wf) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      if (wf.status?.toLowerCase() !== s) return false;
    }
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        (wf?.name || '').toLowerCase().includes(q) ||
        (wf?.description || '').toLowerCase().includes(q) ||
        (wf?.business_function && (wf.business_function || '').toLowerCase().includes(q)) ||
        (wf?.trigger_type && (wf.trigger_type || '').toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleEditWorkflow = (wf: any) => {
    setActiveWorkflowId(wf.id);
    setActiveWorkflowTitle(wf.name);
    if (wf.nodes && Array.isArray(wf.nodes) && wf.nodes.length > 0) {
      setActiveWorkflowGroups(wf.nodes);
    } else {
      setActiveWorkflowGroups(null);
    }
    setActiveTab('automation-builder');
  };

  const handleCreateNewWorkflow = () => {
    setActiveWorkflowId(null);
    setActiveWorkflowTitle('New Chatbot Flow');
    setActiveWorkflowGroups(null);
    setActiveTab('automation-builder');
  };

  const confirmDelete = async () => {
    if (!workflowToDelete) return;
    setIsDeleting(true);
    try {
      await deleteWorkflow(workflowToDelete.id);
      setWorkflowToDelete(null);
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Workflows"
        subtitle="Active and scheduled automation workflows running across your branches."
        primaryActionLabel="Create Workflow"
        onPrimaryAction={handleCreateNewWorkflow}
      />

      <div className="p-6 space-y-6">
        {/* Dynamic Workflow KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Automations</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{workflows.length}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5">Custom bots & triggers</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Active Workflows</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {workflows.filter((w) => w.status === 'active').length}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Live WhatsApp engine</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Runs (Month)</div>
            <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">
              {workflows.reduce((acc, w) => acc + (Number(w.runs_this_month) || 0), 0).toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-purple-600 font-medium mt-0.5">Zero manual overhead</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Avg. Success Rate</div>
            <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
              {workflows.length
                ? Math.round(workflows.reduce((acc, w) => acc + (Number(w.success_rate) || 0), 0) / workflows.length)
                : 98}
              %
            </div>
            <div className="text-[10px] sm:text-[11px] text-blue-600 font-medium mt-0.5">Reliable execution</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {filteredWorkflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => handleEditWorkflow(wf)}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {wf.status}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkflowToDelete(wf);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                    title={`Delete "${wf.name}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">{wf.name}</h3>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed line-clamp-2">{wf.description}</p>
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

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-slate-400 text-[11px]">
                <span className="truncate max-w-[120px] sm:max-w-[150px]">Modified: {wf.last_modified}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkflowToDelete(wf);
                    }}
                    className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 font-semibold flex items-center gap-1 transition-all text-[11px] cursor-pointer"
                    title={`Delete "${wf.name}"`}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                    <span>Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditWorkflow(wf);
                    }}
                    className="px-2.5 py-1 rounded-lg font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-all text-[11px] cursor-pointer"
                  >
                    <span>Edit Flow</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {workflowToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !isDeleting && setWorkflowToDelete(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Delete Workflow</h3>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setWorkflowToDelete(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to permanently delete <strong className="text-slate-900 font-semibold">"{workflowToDelete.name}"</strong>?
                  </p>
                  <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 mt-3 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      This flow and its interactive canvas node groups will be permanently removed. Any keyword rules linked to this workflow will safely fall back to automated reply mode.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setWorkflowToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Workflow'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



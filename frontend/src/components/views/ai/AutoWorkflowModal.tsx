import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { WhatsAppTemplateItem } from '@/types';
import {
  analyzeTemplateData,
  generateWorkflowFromTemplate,
  WorkflowGenerationResult
} from '@/utils/templateWorkflowGenerator';
import {
  Sparkles, GitBranch, ArrowRight, Check, X, Layers,
  CreditCard, UserCheck, MessageSquare, Bot, AlertCircle,
  Zap, CornerDownRight, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';

interface AutoWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Partial<WhatsAppTemplateItem> | null;
}

export const AutoWorkflowModal: React.FC<AutoWorkflowModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const {
    saveWorkflow,
    setActiveWorkflowId,
    setActiveWorkflowTitle,
    setActiveWorkflowGroups,
    setActiveTab,
    addToast
  } = useQiyamStore();

  if (!isOpen || !template) return null;

  // Initial analysis
  const initialAnalysis = useMemo(() => analyzeTemplateData(template), [template]);

  // Form customizer state
  const [workflowTitle, setWorkflowTitle] = useState(initialAnalysis.suggestedTitle);
  const [includePayment, setIncludePayment] = useState(initialAnalysis.hasPaymentIntent);
  const [includeAgentHandoff, setIncludeAgentHandoff] = useState(true);
  const [triggerMode, setTriggerMode] = useState<'template_send' | 'inbound_message' | 'keyword'>('template_send');
  const [isBuilding, setIsBuilding] = useState(false);

  // Dynamically recompute the generated flow graph based on user configuration
  const generatedFlow: WorkflowGenerationResult = useMemo(() => {
    return generateWorkflowFromTemplate(template, {
      customTitle: workflowTitle,
      includePayment,
      includeAgentHandoff,
      triggerMode
    });
  }, [template, workflowTitle, includePayment, includeAgentHandoff, triggerMode]);

  const handleLaunchWorkflow = async () => {
    setIsBuilding(true);
    try {
      const savedWf = await saveWorkflow({
        name: generatedFlow.title,
        description: generatedFlow.description,
        trigger_type:
          triggerMode === 'template_send'
            ? `WhatsApp Template (${template.name})`
            : triggerMode === 'keyword'
            ? 'Keyword Auto-Responder'
            : 'New WhatsApp Message',
        nodes: generatedFlow.groups,
        edges: []
      });

      if (savedWf) {
        setActiveWorkflowId(savedWf.id);
        setActiveWorkflowTitle(savedWf.name);
        setActiveWorkflowGroups(generatedFlow.groups);
      }

      addToast(
        `🎉 Auto-generated workflow "${generatedFlow.title}" with ${generatedFlow.groups.length} interactive node groups!`,
        'success'
      );
      onClose();
      setActiveTab('automation-builder');
    } catch (err: any) {
      addToast(`Failed to initialize workflow: ${err.message}`, 'error');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150 font-sans">
        {/* Top Header */}
        <div className="bg-linear-to-r from-[#0B3B2C] via-[#0D4B38] to-[#0B3B2C] text-white p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/20">
                  AI Auto-Builder Engine
                </span>
                <span className="text-[11px] text-emerald-300 font-mono">
                  {template.name || 'unnamed_template'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Auto-Build WhatsApp Chatbot Workflow
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Template Data Intelligence Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Detected Intent</span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {initialAnalysis.intentLabel}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Template Variables</span>
              <p className="text-xs font-bold text-slate-800 truncate">
                {initialAnalysis.variableNames.length > 0
                  ? `${initialAnalysis.variableNames.length} Variables Found (${initialAnalysis.variableNames.join(', ')})`
                  : 'Static Text (0 Vars)'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Interactive Buttons</span>
              <p className="text-xs font-bold text-slate-800 truncate">
                {template.buttons && template.buttons.length > 0
                  ? `${template.buttons.length} Buttons Configured`
                  : 'Auto-Generating Smart Choices'}
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Generated Topology</span>
              <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>{generatedFlow.groups.length} Flow Groups</span>
              </p>
            </div>
          </div>

          {/* Workflow Blueprint Visual Architecture Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                <span>Generated Flow Architecture Blueprint</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Wired with branching routes & fallback loop
              </span>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 overflow-x-auto shadow-inner border border-slate-800">
              <div className="flex items-start gap-3 min-w-[700px]">
                {generatedFlow.groups.map((grp, idx) => {
                  const isFirst = idx === 0;
                  const isFallback = grp.id === 'group-fallback';
                  const isPayment = grp.id.includes('pay');

                  return (
                    <div key={grp.id} className="flex items-center gap-3">
                      <div
                        className={`w-48 rounded-xl p-3 text-xs border flex flex-col gap-2 shrink-0 transition-all ${
                          isFirst
                            ? 'bg-emerald-950/80 border-emerald-500/60 ring-2 ring-emerald-500/20'
                            : isFallback
                            ? 'bg-amber-950/50 border-amber-600/50'
                            : isPayment
                            ? 'bg-purple-950/50 border-purple-500/50'
                            : 'bg-slate-800/90 border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isFirst
                                ? 'bg-emerald-500 text-slate-950'
                                : isFallback
                                ? 'bg-amber-400 text-slate-950'
                                : isPayment
                                ? 'bg-purple-400 text-slate-950'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isFirst ? 'Trigger' : `Node ${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {grp.items.length} blocks
                          </span>
                        </div>

                        <h5 className="font-bold text-white text-xs truncate" title={grp.title}>
                          {grp.title.replace(/^Group #\d+:\s*/, '')}
                        </h5>

                        <div className="space-y-1 pt-1 border-t border-white/10 text-[10px] text-slate-300">
                          {grp.items.map((item, itIdx) => (
                            <div key={itIdx} className="flex items-center gap-1.5 truncate">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  item.type === 'message'
                                    ? 'bg-sky-400'
                                    : item.type === 'choice'
                                    ? 'bg-emerald-400'
                                    : item.type === 'collect'
                                    ? 'bg-amber-400'
                                    : item.type === 'payment'
                                    ? 'bg-purple-400'
                                    : 'bg-rose-400'
                                }`}
                              />
                              <span className="capitalize font-mono text-[9px] text-slate-400">
                                [{item.type}]
                              </span>
                              <span className="truncate">
                                {item.type === 'choice'
                                  ? `${item.options?.length || 0} Routes`
                                  : item.type === 'collect'
                                  ? `{${item.varName}}`
                                  : item.type === 'payment'
                                  ? `UPI (₹${item.amount})`
                                  : item.type === 'jump'
                                  ? `Loop to Group 1`
                                  : 'WhatsApp Message'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {idx < generatedFlow.groups.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Workflow Customization Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Workflow Settings & Customization
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={workflowTitle}
                  onChange={(e) => setWorkflowTitle(e.target.value)}
                  placeholder="e.g. Service Booking Flow"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Primary Trigger Mode
                </label>
                <select
                  value={triggerMode}
                  onChange={(e) => setTriggerMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="template_send">
                    WhatsApp Template Dispatch (When template message is sent)
                  </option>
                  <option value="keyword">
                    Keyword Auto-Responder (When customer replies with matching keyword)
                  </option>
                  <option value="inbound_message">
                    Inbound WhatsApp Message (Default starter flow)
                  </option>
                </select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition">
                <input
                  type="checkbox"
                  checked={includePayment}
                  onChange={(e) => setIncludePayment(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    Attach Instant UPI / Card Payment Block
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Inserts checkout element ({initialAnalysis.estimatedAmount ? `₹${initialAnalysis.estimatedAmount}` : '₹499'}) with Success & Retry handlers
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition">
                <input
                  type="checkbox"
                  checked={includeAgentHandoff}
                  onChange={(e) => setIncludeAgentHandoff(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    Include Human Agent Escalation
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Creates dedicated support queue handoff branch with agent assignment
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Generated flow will be saved directly into your Workflows and loaded into the visual canvas.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isBuilding}
              onClick={handleLaunchWorkflow}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20 transition cursor-pointer disabled:opacity-50"
            >
              {isBuilding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Flowchart...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>⚡ Launch in Visual Workflow Studio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

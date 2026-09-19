import React, { useState } from 'react';
import { Conversation } from '@/types';
import {
  X, Zap, Play, Pause, ExternalLink, Calendar, MapPin,
  IndianRupee, UserCheck, CheckCircle2, ChevronRight, Send,
  Sliders, MessageSquare, ArrowRight, Sparkles, FileText
} from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';

interface ChatWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  onOpenWorkflowBuilder: (workflowName: string) => void;
}

export const ChatWorkflowModal: React.FC<ChatWorkflowModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onOpenWorkflowBuilder,
}) => {
  const { toggleConversationWorkflow, simulateInboundWhatsApp, setActiveTab, addToast } = useQiyamStore();
  const [customInput, setCustomInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const isPaused = conversation.active_workflow === 'Paused';
  const workflowName = isPaused ? 'Service Booking Flow' : (conversation.active_workflow || 'Service Booking Flow');

  const handleSimulate = async (text: string) => {
    if (!text.trim() || isSimulating) return;
    setIsSimulating(true);
    try {
      await simulateInboundWhatsApp(
        conversation.contact_name || 'Customer',
        conversation.phone_number,
        text
      );
      addToast(`Simulated customer sending: "${text}"`, 'success');
      setCustomInput('');
    } catch (e) {
      addToast('Simulation error', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const routes = [
    {
      option: 'Option 1',
      badge: '1️⃣',
      title: 'Reschedule Booking',
      icon: Calendar,
      color: 'blue',
      triggerKeywords: ["'1'", "'1️⃣'", "'reschedule'", "'change date'", "'postpone'"],
      actionDescription: 'Checks customer appointment slot and offers upcoming open slots (Tomorrow 2 PM, Friday 10:30 AM, Saturday 11 AM) with prompt to confirm.',
      sampleSimulateText: '1',
      outputPreview: '📅 Reschedule Your Appointment: Hi {name}, your service is scheduled for {time}. Reply with your preferred new slot...',
    },
    {
      option: 'Option 2',
      badge: '2️⃣',
      title: 'Live Technician Status & ETA',
      icon: MapPin,
      color: 'emerald',
      triggerKeywords: ["'2'", "'2️⃣'", "'track'", "'technician'", "'status'", "'eta'", "'map'"],
      actionDescription: 'Queries assigned service specialist ({technician}), calculates 15-20 min arrival ETA, and provides live GPS tracking link.',
      sampleSimulateText: '2',
      outputPreview: '📍 Live Technician Status: Specialist Ramesh Kumar is en route 🛵. Estimated arrival: 15-20 minutes. Track live map...',
    },
    {
      option: 'Option 3',
      badge: '3️⃣',
      title: 'Quotation & Pricing Breakdown',
      icon: IndianRupee,
      color: 'amber',
      triggerKeywords: ["'3'", "'3️⃣'", "'price'", "'cost'", "'quote'", "'charges'", "'quotation'"],
      actionDescription: 'Pulls official service estimate: Inspection (₹800) + Labour (₹2,000) = ₹2,800 total, prompting customer with CONFIRM instruction.',
      sampleSimulateText: '3',
      outputPreview: '💰 Service Quotation: Inspection ₹800 + Labour ₹2,000. Total Estimated: ₹2,800. Reply CONFIRM to reserve slot!',
    },
    {
      option: 'Option 4',
      badge: '4️⃣',
      title: 'Speak with an Agent (Human Handover)',
      icon: UserCheck,
      color: 'purple',
      triggerKeywords: ["'4'", "'4️⃣'", "'agent'", "'human'", "'speak'", "'call'", "'support'"],
      actionDescription: 'Assigns senior operations agent, sets chat status to In Progress, updates CRM stage to Agent Assigned, and alerts specialist.',
      sampleSimulateText: '4',
      outputPreview: '👨‍💼 Connecting with Support: Specialist Ramesh Kumar has been assigned to your chat. Priority Helpline: 1800-QIYAM-FIX.',
    },
    {
      option: 'Confirm',
      badge: '✅',
      title: 'Direct Booking Confirmation',
      icon: CheckCircle2,
      color: 'teal',
      triggerKeywords: ["'confirm'", "'yes'", "'approve'", "'proceed'", "'book'"],
      actionDescription: 'Confirms technician visit, locks slot on operations schedule, and dispatches confirmed booking card.',
      sampleSimulateText: 'confirm',
      outputPreview: '✅ Booking Confirmed! Thank you {name}. Booking {id} for {slot} is confirmed. Specialist will arrive on time.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Zap className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Active Workflow: {workflowName}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isPaused
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isPaused ? 'Paused' : 'Active & Auto-replying'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Controlling inbound WhatsApp replies for <strong>{conversation.contact_name}</strong> ({conversation.phone_number})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
          {/* Top Control Strip */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              <div className="text-xs">
                <span className="font-semibold text-slate-700">Bot Status: </span>
                <strong className={isPaused ? 'text-amber-700' : 'text-emerald-700'}>
                  {isPaused ? 'Paused (Manual Agent Control)' : 'Active (Automated Response Engine)'}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleConversationWorkflow(conversation.id, !isPaused, workflowName);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPaused
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume Auto-Reply</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Auto-Reply</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenWorkflowBuilder(workflowName)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Open in Workflow Builder</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('automation-logs');
                }}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer"
                title="View live execution logs"
              >
                <span>Logs ↗</span>
              </button>
            </div>
          </div>

          {/* Workflow Decision Tree & Routes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Interactive Decision Tree &amp; Menu Options
              </h4>
              <span className="text-[11px] text-slate-500">
                Click <strong>Simulate</strong> to test any route live on this chat
              </span>
            </div>

            <div className="space-y-2">
              {routes.map((route, idx) => {
                const Icon = route.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-100">
                        {route.badge}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-purple-600" />
                            <span>{route.title}</span>
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Triggers on: {route.triggerKeywords.join(', ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {route.actionDescription}
                        </p>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-700 font-mono leading-snug">
                          {route.outputPreview}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-1.5 self-end sm:self-start">
                      <button
                        type="button"
                        disabled={isSimulating}
                        onClick={() => handleSimulate(route.sampleSimulateText)}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs group-hover:border-purple-400"
                        title={`Simulate customer sending "${route.sampleSimulateText}"`}
                      >
                        <Send className="w-3 h-3 text-purple-600" />
                        <span>Simulate "{route.sampleSimulateText}"</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Custom Simulation Console */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50/50 to-purple-50/50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Custom Inbound Message Tester</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSimulate(customInput);
                  }
                }}
                placeholder="Try sending '1', '2', 'Tomorrow 2 PM', 'reschedule', 'confirm'..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                disabled={!customInput.trim() || isSimulating}
                onClick={() => handleSimulate(customInput)}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Test Inbound</span>
              </button>
            </div>
          </div>

          {/* Workflow Builder Callout */}
          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-700 shrink-0" />
              <div className="text-[11px] text-purple-900">
                Want to customize text templates, add Razorpay payment buttons, or branch logic? Edit this flow in the visual canvas.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenWorkflowBuilder(workflowName)}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shrink-0 transition shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span>Go to Workflow Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Changes made in Workflow Builder take effect immediately across all live WhatsApp inbound chats.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

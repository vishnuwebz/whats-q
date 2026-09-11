import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { FlowNode } from '@/types';
import {
  Zap, Play, Save, Plus, MessageSquare, Bot, Filter, Send,
  Calendar, CreditCard, Users, CheckCircle2, ChevronRight,
  Sparkles, Layers, ArrowDown, X, Settings, RefreshCw, AlertCircle
} from 'lucide-react';

export const WorkflowBuilderView: React.FC = () => {
  const { workflows, saveWorkflowNodes, runWorkflowTest, addToast } = useQiyamStore();
  const currentWorkflow = workflows[0];

  const [nodes, setNodes] = useState<FlowNode[]>(currentWorkflow.nodes);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(currentWorkflow.nodes[1] || currentWorkflow.nodes[0]);
  const [testInput, setTestInput] = useState('I need AC service tomorrow in Koyilandy.');
  const [testResult, setTestResult] = useState<{ steps: string[]; duration: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const nodeLibrary = [
    { type: 'trigger' as const, title: 'New WhatsApp Message', subtitle: 'Inbound message trigger', category: 'TRIGGERS', iconName: 'MessageSquare', color: 'emerald' },
    { type: 'ai_agent' as const, title: 'Understand Intent (AI Agent)', subtitle: 'Extract intent, service, entity', category: 'AI', iconName: 'Bot', color: 'purple' },
    { type: 'condition' as const, title: 'Service Available?', subtitle: 'Zone & branch availability check', category: 'CONDITIONS', iconName: 'Filter', color: 'amber' },
    { type: 'action' as const, title: 'Create / Update Lead', subtitle: 'CRM lead record', category: 'ACTIONS', iconName: 'UserCheck', color: 'blue' },
    { type: 'action' as const, title: 'Create Appointment', subtitle: 'Book slot & technician', category: 'ACTIONS', iconName: 'Calendar', color: 'purple' },
    { type: 'action' as const, title: 'Request Payment (30% Advance)', subtitle: 'UPI payment link generation', category: 'ACTIONS', iconName: 'CreditCard', color: 'emerald' },
    { type: 'action' as const, title: 'Assign Nearest Employee', subtitle: 'Dispatch field tech', category: 'ACTIONS', iconName: 'Users', color: 'purple' },
  ];

  const handleAddNode = (libNode: typeof nodeLibrary[0]) => {
    const newNode: FlowNode = {
      id: String(Date.now()),
      type: libNode.type,
      title: libNode.title,
      subtitle: libNode.subtitle,
      category: libNode.category,
      iconName: libNode.iconName,
      color: libNode.color,
      config: {},
      position: { x: 400, y: nodes.length * 100 + 50 },
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    addToast(`Added node "${libNode.title}" to canvas`, 'success');
  };

  const handleRunTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      const result = runWorkflowTest(currentWorkflow.id, testInput);
      setTestResult(result);
      setIsTesting(false);
    }, 600);
  };

  const handleSave = () => {
    saveWorkflowNodes(currentWorkflow.id, nodes);
  };

  const renderNodeIcon = (color: string) => {
    if (color === 'emerald') return <MessageSquare className="w-4 h-4 text-emerald-600" />;
    if (color === 'purple') return <Bot className="w-4 h-4 text-purple-600" />;
    if (color === 'amber') return <Filter className="w-4 h-4 text-amber-600" />;
    if (color === 'blue') return <Users className="w-4 h-4 text-blue-600" />;
    return <Zap className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-hidden font-sans">
      <Header
        title="Workflow Builder: Service Booking Flow"
        subtitle="Automated inbound WhatsApp intent parsing, lead creation, service check, and technician assignment."
        primaryActionLabel="Save & Activate"
        onPrimaryAction={handleSave}
      />

      {/* Control Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 text-xs font-semibold">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-800 font-bold">Status: Active</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">Runs this month: <strong className="text-slate-800">156</strong></span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">Success Rate: <strong className="text-emerald-600">98.7%</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTesting ? 'Simulating Run...' : 'Run Test Execution'}</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Workflow</span>
          </button>
        </div>
      </div>

      {/* 3-Pane Visual Builder Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Palette / Library (260px) */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col shrink-0 overflow-y-auto space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
              Node Palette (Click to Add)
            </h4>
            <div className="space-y-2">
              {nodeLibrary.map((libNode, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAddNode(libNode)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm bg-slate-50 hover:bg-white cursor-pointer transition-all space-y-0.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 group-hover:text-emerald-700">{libNode.title}</span>
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-slate-400">{libNode.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Visual Graph Canvas (Matching photo_1) */}
        <div className="flex-1 bg-[#F1F5F9] relative overflow-y-auto p-10 flex flex-col items-center space-y-4">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />

          {nodes.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;

            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`w-96 bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all space-y-1 relative z-10 ${
                    isSelected ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        {renderNodeIcon(node.color)}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{node.category}</div>
                        <h4 className="font-bold text-xs text-slate-900">{node.title}</h4>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 pl-9">{node.subtitle}</div>
                </div>

                {/* Connecting Arrow */}
                {index < nodes.length - 1 && (
                  <div className="flex flex-col items-center text-slate-400 z-10">
                    <div className="h-4 w-0.5 bg-slate-300" />
                    <ArrowDown className="w-4 h-4 -my-1 text-slate-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Configuration & Test Drawer (320px) */}
        <div className="w-80 bg-white border-l border-slate-200 p-5 flex flex-col shrink-0 overflow-y-auto space-y-5 text-xs">
          {selectedNode ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedNode.category}</span>
                  <h3 className="font-bold text-sm text-slate-900">{selectedNode.title}</h3>
                </div>
                <Settings className="w-4 h-4 text-slate-400" />
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Node Title</label>
                  <input
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) => {
                      const updated = nodes.map((n) => (n.id === selectedNode.id ? { ...n, title: e.target.value } : n));
                      setNodes(updated);
                      setSelectedNode({ ...selectedNode, title: e.target.value });
                    }}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description / Subtitle</label>
                  <input
                    type="text"
                    value={selectedNode.subtitle}
                    onChange={(e) => {
                      const updated = nodes.map((n) => (n.id === selectedNode.id ? { ...n, subtitle: e.target.value } : n));
                      setNodes(updated);
                      setSelectedNode({ ...selectedNode, subtitle: e.target.value });
                    }}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                {selectedNode.type === 'ai_agent' && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                    <div className="font-bold text-purple-900 text-xs">AI Model Configuration</div>
                    <div className="text-[11px] text-purple-700">Model: <strong>Qiyam Intent Engine (Fine-tuned)</strong></div>
                    <div className="text-[10px] text-purple-600 font-mono">
                      Output Variables: {'{{intent}}, {{service}}, {{location}}, {{price}}'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-10">Select a node to configure properties</div>
          )}

          {/* Test Runner Simulator Card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Execution Runner</span>
              </span>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Simulated Incoming Message</label>
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none"
              />
            </div>

            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
            >
              <span>{isTesting ? 'Running Execution...' : 'Run Simulation'}</span>
            </button>

            {testResult && (
              <div className="pt-2 border-t border-slate-800 space-y-1 text-[10px] font-mono">
                <div className="text-emerald-400 font-bold">Execution Passed ({testResult.duration}):</div>
                {testResult.steps.map((step, idx) => (
                  <div key={idx} className="text-slate-300">✓ {step}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



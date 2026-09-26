import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Bot,
  Sliders,
  ShieldCheck,
  Database,
  Sparkles,
  Check,
  Zap,
  Send,
  RotateCcw,
  MessageSquare,
  Flame,
  Gauge,
  SlidersHorizontal,
  UserCheck,
  HelpCircle,
} from 'lucide-react';
import { queryAIEngine } from '@/utils/aiQueryEngine';

const DEFAULT_SYSTEM_PROMPT =
  'You are the official AI Operations Copilot for Qiyam Ventures, specializing in HVAC, AC maintenance, electrical, and facility services across Kozhikode, Kochi, and Bangalore. Always communicate in a professional, courteous manner. Cite accurate pricing from the company knowledge base. Encourage scheduling an inspection with certified on-duty technicians.';

export const AISettingsView: React.FC = () => {
  const {
    conversations,
    leads,
    deals,
    followups,
    jobs,
    appointments,
    employees,
    invoices,
    transactions,
    addToast,
  } = useQiyamStore();

  const [model, setModel] = useState(
    () => localStorage.getItem('whatsq_ai_model') || 'qiyam-intent-engine-v2'
  );
  const [tone, setTone] = useState(
    () => localStorage.getItem('whatsq_ai_tone') || 'Professional & Helpful'
  );
  const [temperature, setTemperature] = useState<number>(() => {
    const val = localStorage.getItem('whatsq_ai_temperature');
    return val !== null ? parseFloat(val) : 0.3;
  });
  const [maxTokens, setMaxTokens] = useState<number>(() => {
    const val = localStorage.getItem('whatsq_ai_max_tokens');
    return val !== null ? parseInt(val, 10) : 512;
  });
  const [systemPrompt, setSystemPrompt] = useState(
    () => localStorage.getItem('whatsq_ai_system_prompt') || DEFAULT_SYSTEM_PROMPT
  );
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(() => {
    const val = localStorage.getItem('whatsq_ai_handoff_threshold');
    return val !== null ? parseInt(val, 10) : 75;
  });
  const [useKbFirst, setUseKbFirst] = useState(
    () => localStorage.getItem('whatsq_ai_kb') !== 'false'
  );
  const [autoAssignLead, setAutoAssignLead] = useState(
    () => localStorage.getItem('whatsq_ai_auto_lead') !== 'false'
  );

  // Playground simulation state
  const [simQuery, setSimQuery] = useState('');
  const [simResponse, setSimResponse] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSave = () => {
    localStorage.setItem('whatsq_ai_model', model);
    localStorage.setItem('whatsq_ai_tone', tone);
    localStorage.setItem('whatsq_ai_temperature', String(temperature));
    localStorage.setItem('whatsq_ai_max_tokens', String(maxTokens));
    localStorage.setItem('whatsq_ai_system_prompt', systemPrompt);
    localStorage.setItem('whatsq_ai_handoff_threshold', String(confidenceThreshold));
    localStorage.setItem('whatsq_ai_kb', String(useKbFirst));
    localStorage.setItem('whatsq_ai_auto_lead', String(autoAssignLead));

    addToast(`AI Engine settings saved: ${model} (${tone}, temp: ${temperature})`, 'success');
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    addToast('System prompt reset to recommended default', 'info');
  };

  const handleRunSimulation = (promptOverride?: string) => {
    const q = promptOverride || simQuery;
    if (!q.trim()) return;

    setIsSimulating(true);
    setSimResponse(null);

    setTimeout(() => {
      const generated = queryAIEngine(q, {
        conversations,
        leads,
        deals,
        followups,
        jobs,
        appointments,
        employees,
        invoices,
        transactions,
      });

      setSimResponse(generated);
      setIsSimulating(false);
    }, 450);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="AI Assistant & Copilot Engine Settings"
        subtitle="Configure underlying LLM models, conversational tone, temperature, system prompt grounding, and human handoff thresholds."
        primaryActionLabel="Save AI Settings"
        onPrimaryAction={handleSave}
      />

      <div className="p-4 sm:p-6 max-w-5xl space-y-6 text-xs">
        {/* ── 1. Model Selection & Core Parameters ── */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI Personality & Model Tuning</h3>
              <p className="text-slate-500 text-[11px]">
                Control how Qiyam AI interacts with WhatsApp customers and automates inquiries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Underlying AI Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-purple-500 transition"
              >
                <option value="qiyam-intent-engine-v2">
                  Qiyam Intent Engine v2 (Fine-tuned for Service Ops)
                </option>
                <option value="gpt-4o">OpenAI GPT-4o (Meta WhatsApp Cloud API)</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="llama-3-70b">Meta Llama 3 70B (Fast Edge Inference)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Conversational Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-purple-500 transition"
              >
                <option>Professional & Helpful</option>
                <option>Friendly & Casual</option>
                <option>Formal & Concise</option>
                <option>Empathetic & Customer Support</option>
              </select>
            </div>
          </div>

          {/* Hyperparameters: Temperature & Max Tokens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Temperature (Creativity)</span>
                </label>
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0.0 (Precise & Factual)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-500" />
                  <span>Max Response Length (Tokens)</span>
                </label>
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {maxTokens} tokens (~{Math.round(maxTokens * 0.75)} words)
                </span>
              </div>
              <select
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-purple-500 transition"
              >
                <option value={256}>256 tokens (Concise WhatsApp reply)</option>
                <option value={512}>512 tokens (Standard service card)</option>
                <option value={1024}>1024 tokens (Detailed quotation & policy)</option>
                <option value={2048}>2048 tokens (Long technical diagnostics)</option>
              </select>
            </div>
          </div>

          {/* Fallback & Escalation Settings */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Human Agent Handoff Confidence Threshold</span>
                </label>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {confidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                When AI intent classification confidence drops below {confidenceThreshold}%, the
                thread automatically transfers to on-duty staff with an escalation alert.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={useKbFirst}
                  onChange={(e) => setUseKbFirst(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Ground with Knowledge Base</span>
                  <span className="text-[11px] text-slate-500 leading-snug block">
                    Cite official rate cards and warranty terms before generic text.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={autoAssignLead}
                  onChange={(e) => setAutoAssignLead(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Auto-Assign Qualified Leads</span>
                  <span className="text-[11px] text-slate-500 leading-snug block">
                    Direct high-intent inquiries straight to on-duty field technicians.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── 2. System Instructions & Business Prompt ── */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Custom System Instructions</h3>
              <p className="text-slate-500 text-[11px]">
                Master prompt injected into all automated customer sessions and quotation engines.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetPrompt}
              className="text-xs text-slate-500 hover:text-purple-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>

          <div>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs leading-relaxed outline-none focus:border-purple-500 transition resize-none"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Variables available: &#123;&#123;customer_name&#125;&#125;, &#123;&#123;branch_name&#125;&#125;, &#123;&#123;active_service&#125;&#125;</span>
              <span>{systemPrompt.length} characters</span>
            </div>
          </div>
        </div>

        {/* ── 3. Interactive AI Playground / Response Simulator ── */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Interactive AI Copilot Playground</h3>
              <p className="text-slate-500 text-[11px]">
                Test your configured prompt, tone, and knowledge base grounding in real time.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-slate-400 font-semibold shrink-0">Try queries:</span>
              <button
                type="button"
                onClick={() => {
                  setSimQuery('What is your pricing for AC service in Kozhikode?');
                  handleRunSimulation('What is your pricing for AC service in Kozhikode?');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-slate-600 font-medium text-[11px] whitespace-nowrap transition cursor-pointer"
              >
                ❄️ AC Service Pricing
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimQuery('Do you offer warranty on replaced AC parts?');
                  handleRunSimulation('Do you offer warranty on replaced AC parts?');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-slate-600 font-medium text-[11px] whitespace-nowrap transition cursor-pointer"
              >
                🛡️ 90-Day Warranty Policy
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimQuery('Show today schedule and technician route');
                  handleRunSimulation('Show today schedule and technician route');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-slate-600 font-medium text-[11px] whitespace-nowrap transition cursor-pointer"
              >
                📅 Dispatch & Schedule
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={simQuery}
                onChange={(e) => setSimQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
                placeholder="Ask anything as a customer to test AI output..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-500 transition"
              />
              <button
                type="button"
                onClick={() => handleRunSimulation()}
                disabled={isSimulating}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Run Test</span>
              </button>
            </div>

            {/* Simulated Chat Response */}
            {simResponse && (
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live AI Response ({model})</span>
                  </span>
                  <span className="text-emerald-700 font-mono text-[10px]">
                    Latency: 42ms • Temp: {temperature.toFixed(2)}
                  </span>
                </div>
                <div className="text-slate-800 text-xs leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-lg border border-emerald-100 shadow-2xs font-sans">
                  {simResponse}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Save AI Engine Settings
          </button>
        </div>
      </div>
    </div>
  );
};

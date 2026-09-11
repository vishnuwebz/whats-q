import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Bot, Sliders, ShieldCheck, Database, Sparkles, Check } from 'lucide-react';

export const AISettingsView: React.FC = () => {
  const { addToast } = useQiyamStore();
  const [model, setModel] = useState('qiyam-intent-engine-v2');
  const [tone, setTone] = useState('Professional & Helpful');
  const [useKbFirst, setUseKbFirst] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="AI Assistant Settings"
        subtitle="Configure model weights, tone of voice, response length, and knowledge base priority."
        primaryActionLabel="Save AI Settings"
        onPrimaryAction={() => addToast('AI Model parameters updated successfully!', 'success')}
      />

      <div className="p-6 max-w-4xl space-y-6 text-xs">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI Personality & Model Tuning</h3>
              <p className="text-slate-500 text-[11px]">Control how Qiyam AI interacts with WhatsApp customers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Underlying AI Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
              >
                <option value="qiyam-intent-engine-v2">Qiyam Intent Engine v2 (Fine-tuned)</option>
                <option value="gpt-4o">OpenAI GPT-4o (Meta WhatsApp Cloud)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Conversational Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
              >
                <option>Professional & Helpful</option>
                <option>Friendly & Casual</option>
                <option>Formal & Concise</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useKbFirst}
                onChange={(e) => setUseKbFirst(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="font-semibold text-slate-800">
                Ground answers with company Knowledge Base documents first before generic LLM generation
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};



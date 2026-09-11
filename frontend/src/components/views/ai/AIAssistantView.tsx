import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Bot, Sparkles, Send, RefreshCw, Zap, TrendingUp, Users, ShieldAlert } from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { addToast } = useQiyamStore();
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "Hello Rahul! 👋 I am your Qiyam AI Operations Copilot.\nI monitor all WhatsApp communications, leads, jobs, and financial transactions across your branches.\nHow can I help you today?",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const query = promptOverride || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query, time: 'Just now' }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = `I've analyzed your data regarding "${query}". Everything is in order across all active WhatsApp inboxes and CRM pipelines.`;
      const lower = query.toLowerCase();

      if (lower.includes('revenue') || lower.includes('profit')) {
        reply = "May 2024 Revenue Summary:\n• Total Billed: ₹24,85,320 (↑ 15.8%)\n• Net Profit: ₹11,30,190 (45.5% margin)\n• Outstanding: ₹3,40,320 across 18 accounts.";
      } else if (lower.includes('lead') || lower.includes('high value')) {
        reply = "There are 7 high-value leads currently requiring attention. Vikram Mehta (₹12,000 AC Installation) and Pooja Iyer (₹18,000 AMC) are the top candidates.";
      } else if (lower.includes('schedule') || lower.includes('today')) {
        reply = "Today you have 15 appointments scheduled. All 18 field technicians are checked in and route RTE-001 is on track.";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply, time: 'Just now' }]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="AI Assistant Hub"
        subtitle="Conversational business intelligence, workflow orchestration, and anomaly detection."
        primaryActionLabel="Clear History"
        onPrimaryAction={() => setMessages([messages[0]])}
      />

      <div className="p-6 space-y-6">
        {/* Real-time AI Anomaly Insights (Matching photo_20) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Demand Surge Detected</span>
              </span>
              <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Kozhikode</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              34% surge in AC Servicing inquiries in Koyilandy & Kozhikode over the last 48 hours. Suggesting adding 2 extra field slots.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Top Staff Efficiency</span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">98% Score</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Ramesh Kumar completed 23 jobs this week with zero customer escalations and an average rating of 4.9 ⭐.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Payment Escalation</span>
              </span>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Action Needed</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              2 enterprise invoices (₹44,500) exceeded 14-day credit terms. Automatic WhatsApp reminders have been queued.
            </p>
          </div>
        </div>

        {/* AI Chat Console */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Qiyam AI Copilot</h3>
                <div className="text-[10px] text-emerald-600 font-semibold">Synced with SQLite Backend & Meta WhatsApp Webhook</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-lg p-4 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white font-medium rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200/60'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{m.text}</div>
                  <div className={`text-[9px] mt-1 text-right ${m.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 max-w-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
                <span>Thinking & querying knowledge base...</span>
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">Suggestions:</span>
            <button
              onClick={() => handleSend(undefined, 'Show revenue breakdown for May')}
              className="px-3 py-1 bg-white hover:bg-purple-50 border border-slate-200 rounded-full font-medium text-slate-700 whitespace-nowrap text-[11px]"
            >
              💰 Revenue breakdown
            </button>
            <button
              onClick={() => handleSend(undefined, 'Which leads need follow up?')}
              className="px-3 py-1 bg-white hover:bg-purple-50 border border-slate-200 rounded-full font-medium text-slate-700 whitespace-nowrap text-[11px]"
            >
              👥 High-value leads
            </button>
            <button
              onClick={() => handleSend(undefined, 'Show today schedule and technician route')}
              className="px-3 py-1 bg-white hover:bg-purple-50 border border-slate-200 rounded-full font-medium text-slate-700 whitespace-nowrap text-[11px]"
            >
              📅 Today's schedule
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => handleSend(e)} className="p-3 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your leads, technicians, revenue, or automations..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};



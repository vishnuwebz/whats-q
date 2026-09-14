import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { X, Send, Sparkles, Phone, User, MessageSquare } from 'lucide-react';

export const WhatsAppSimulatorModal: React.FC = () => {
  const {
    isSimulatorOpen,
    setIsSimulatorOpen,
    simulateInboundWhatsApp,
    simulateGlobalUpdate,
    setActiveTab
  } = useQiyamStore();
  const [name, setName] = useState('Amit Verma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [message, setMessage] = useState('I need AC service tomorrow in Koyilandy.');

  if (!isSimulatorOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    simulateInboundWhatsApp(name, phone, message);
    setIsSimulatorOpen(false);
    setActiveTab('conversations');
  };

  const quickPrompts = [
    { label: 'AC Repair Inquiry', text: 'I need AC service tomorrow in Koyilandy.' },
    { label: 'Deep Cleaning Quote', text: 'Can I get the quotation for full 3 BHK cleaning?' },
    { label: 'Electrical Emergency', text: 'Power trip issue on main circuit breaker. Can technician visit now?' },
    { label: 'Confirm Booking Slot', text: 'Yes, please confirm the 10:00 AM AC repair booking.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-3.5 sm:p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">WhatsApp Inbound Message Simulator</h3>
              <p className="text-[11px] text-emerald-100">Simulate incoming customer WhatsApp webhook & AI triggers</p>
            </div>
          </div>
          <button
            onClick={() => setIsSimulatorOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSend} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 text-xs overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-sm sm:text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-sm sm:text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Incoming Message Body</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-lg text-slate-800 text-sm sm:text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
              placeholder="Type incoming customer message..."
              required
            />
          </div>

          {/* Quick Pre-filled Prompts */}
          <div>
            <label className="block font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Or pick a test scenario:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(qp.text)}
                  className="text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-all text-[11px] cursor-pointer"
                >
                  <div className="font-semibold">{qp.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{qp.text}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsSimulatorOpen(false);
                simulateGlobalUpdate();
              }}
              className="px-3 py-2 sm:py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Test global update detection and dead-center modal"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Global Update</span>
            </button>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSimulatorOpen(false)}
                className="px-3.5 py-2 sm:py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all cursor-pointer flex-1 sm:flex-initial text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm shadow-emerald-700/20 transition-all cursor-pointer flex-1 sm:flex-initial"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send & Trigger</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


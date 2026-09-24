import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { X, Send, Phone, User, MessageSquare, Image, CheckCircle2 } from 'lucide-react';
import { CustomerAvatar } from './CustomerAvatar';
import { CountryPhoneInput } from './CountryPhoneInput';

export const WhatsAppSimulatorModal: React.FC = () => {
  const {
    isSimulatorOpen,
    setIsSimulatorOpen,
    simulateInboundWhatsApp,
    setActiveTab,
    addToast
  } = useQiyamStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSimulatorOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanMessage = message.trim();

    if (!cleanPhone) {
      addToast('Please enter the customer WhatsApp phone number.', 'warning');
      return;
    }

    if (!cleanMessage) {
      addToast('Please enter an initial message to start the conversation.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await simulateInboundWhatsApp(cleanName || 'WhatsApp Customer', cleanPhone, cleanMessage, avatarUrl.trim() || undefined);
      setName('');
      setPhone('');
      setAvatarUrl('');
      setMessage('');
      setIsSimulatorOpen(false);
      setActiveTab('conversations');
    } catch {
      addToast('Failed to start WhatsApp chat. Please check connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={() => setIsSimulatorOpen(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">New WhatsApp Chat</h3>
              <p className="text-[11px] text-emerald-100">Start a conversation with a customer or client via WhatsApp</p>
            </div>
          </div>
          <button
            onClick={() => setIsSimulatorOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSend} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          {/* Customer Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer / Contact Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma or Priya Patel"
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm sm:text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Phone Number <span className="text-red-500">*</span>
              </label>
              <CountryPhoneInput
                value={phone}
                onChange={(val) => setPhone(val)}
                required
              />
            </div>
          </div>

          {/* Contact Live Card Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
            <CustomerAvatar
              name={name || 'New Customer'}
              avatar={avatarUrl}
              phone={phone}
              size="lg"
              showPresence={false}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs truncate">
                  {name || 'New Customer'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>WhatsApp Verified</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                {phone || 'Enter phone number with country code'}
              </p>
            </div>
          </div>

          {/* Optional Profile Photo URL */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Profile Photo URL (Optional)</span>
              <span className="text-[10px] text-slate-400 font-normal">Defaults to initials badge</span>
            </label>
            <div className="relative">
              <Image className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/customer-photo.jpg"
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm sm:text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Initial Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-lg text-slate-800 text-sm sm:text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition leading-relaxed"
              placeholder="Type your message to start the WhatsApp conversation..."
              required
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-semibold shadow-sm shadow-emerald-700/20 transition cursor-pointer text-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Starting Chat...' : 'Start WhatsApp Chat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

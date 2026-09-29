import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Send,
  Coffee,
  CheckSquare,
  Award,
  Phone,
  Building2,
  LogOut,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  RefreshCw,
  Bell,
  Star,
  Smartphone,
  Flame,
  Search,
} from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { getCurrentAuthUser, performLogout } from '@/utils/authService';

export const EmployeePortalView: React.FC = () => {
  const {
    conversations,
    employees,
    attendance,
    tasks,
    addToast,
    setActiveTab,
    activeTenant,
  } = useQiyamStore();

  const [currentUser, setCurrentUser] = useState(() => getCurrentAuthUser());

  // Duty punch state
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [onBreakType, setOnBreakType] = useState<string | null>(null);
  const [dutySeconds, setDutySeconds] = useState(14820); // ~4 hours active
  const [currentTime, setCurrentTime] = useState(new Date());

  // Quick Chat message input
  const [selectedChatId, setSelectedChatId] = useState<number | string>(conversations[0]?.id || 1);
  const [quickReplyText, setQuickReplyText] = useState('');

  // Selected template category
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<'all' | 'guest' | 'billing' | 'service'>('all');

  // Duty timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isOnDuty && !onBreakType) {
        setDutySeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isOnDuty, onBreakType]);

  // Format seconds to HH:MM:SS
  const formatDuration = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handlePunchToggle = () => {
    if (isOnDuty) {
      setIsOnDuty(false);
      setOnBreakType(null);
      addToast('🔴 Shift punched out successfully. Today\'s duty hours logged!', 'info');
    } else {
      setIsOnDuty(true);
      addToast('🟢 Shift punched in! You are now live on duty.', 'success');
    }
  };

  const handleBreakToggle = (type: string) => {
    if (onBreakType === type) {
      setOnBreakType(null);
      addToast(`🟢 ${type} ended. Resumed active duty.`, 'success');
    } else {
      setOnBreakType(type);
      addToast(`☕ On break: ${type}. Live chat paused for your queue.`, 'info');
    }
  };

  // Sample quick templates tailored for employees (hotels & service)
  const QUICK_TEMPLATES = [
    {
      id: 'tmpl-1',
      title: '🏨 Hotel Check-In & WiFi Info',
      category: 'guest',
      text: 'Namaste {{1}}! Welcome to Ambika Hotel. Your Deluxe Room is ready. High-speed WiFi: Ambika_Guest (Password: Welcome@2026). Dial 9 for Reception.',
    },
    {
      id: 'tmpl-2',
      title: '🍽️ Room Service & Dining Menu',
      category: 'service',
      text: 'Dear {{1}}, here is our 24/7 in-room dining menu with Malabar specialties. Reply with your dish numbers to place an instant order.',
    },
    {
      id: 'tmpl-3',
      title: '🚕 Airport Cab / Travel Pickup',
      category: 'guest',
      text: 'Hi {{1}}, your cab has been arranged for airport transfer at {{2}}. Driver Name: Rajesh (+91 94470 11223). Vehicle: White Innova KL-11-AX-4421.',
    },
    {
      id: 'tmpl-4',
      title: '💳 GST Invoice & Settlement',
      category: 'billing',
      text: 'Thank you for staying with us! Your final GST bill of ₹{{1}} has been settled. Download your official tax invoice PDF attached here.',
    },
    {
      id: 'tmpl-5',
      title: '🛎️ Housekeeping Request Acknowledged',
      category: 'service',
      text: 'Your request for fresh linen and towels for Room {{1}} has been assigned to our floor supervisor. Attending within 10 minutes!',
    },
  ];

  const filteredTemplates = QUICK_TEMPLATES.filter(
    (t) => selectedTemplateCategory === 'all' || t.category === selectedTemplateCategory
  );

  const selectedConversation = conversations.find((c) => c.id === selectedChatId) || conversations[0];

  const handleSendQuickReply = (textToSend?: string) => {
    const text = textToSend || quickReplyText;
    if (!text.trim()) return;

    addToast(`📲 WhatsApp message sent to ${(selectedConversation as any)?.contact_name || (selectedConversation as any)?.name || 'Guest'}!`, 'success');
    setQuickReplyText('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] text-slate-800 p-4 md:p-6 space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & EMPLOYEE PROFILE BAR                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'Staff User'}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
            />
            <span
              className={`w-3.5 h-3.5 rounded-full ring-2 ring-white absolute -bottom-1 -right-1 ${
                isOnDuty ? (onBreakType ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                {currentUser?.name || 'Ananya Sharma'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                Staff Portal
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                {currentUser?.companyName || activeTenant?.businessName || 'Ambika Hotel & Luxury Suites'}
              </span>
              <span>•</span>
              <span>{currentUser?.department || 'Front Desk & Guest Relations'}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
              <span>Mobile: {currentUser?.phone || '+91 98470 99881'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-sans font-semibold">Verified WhatsApp Employee</span>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('conversations')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Full WhatsApp Inbox</span>
          </button>

          <button
            type="button"
            onClick={() => {
              performLogout();
              setActiveTab('login');
              addToast('Logged out successfully from Staff Portal.', 'info');
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LIVE DUTY CLOCK & SHIFT PUNCH CARD                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Punch Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0B1528] to-[#111C33] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Live Duty Punch Clock
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <div className="my-4">
              <div className="text-3xl font-mono font-black tracking-tight text-white">
                {formatDuration(dutySeconds)}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                Status:{' '}
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    isOnDuty
                      ? onBreakType
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isOnDuty ? (onBreakType ? `On ${onBreakType}` : '🟢 Active On Duty') : '🔴 Clocked Out'}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePunchToggle}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isOnDuty
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isOnDuty ? 'Punch Out (End Duty)' : 'Punch In (Start Duty)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleBreakToggle('Tea Break (15m)')}
                disabled={!isOnDuty}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  onBreakType === 'Tea Break (15m)'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{onBreakType === 'Tea Break (15m)' ? 'End Break' : 'Tea Break'}</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center">
              Punches sync live to {activeTenant?.businessName || 'Ambika Hotel'} Manager Dashboard
            </div>
          </div>
        </div>

        {/* Right: Key Performance Metric Cards */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chats Today</div>
            <div className="my-2">
              <div className="text-2xl font-black text-slate-900">18</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ 4 more than avg</div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-emerald-500" /> WhatsApp live
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Response Time</div>
            <div className="my-2">
              <div className="text-2xl font-black text-emerald-700">1.4m</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Top 5% staff</div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-500" /> SLA: &lt; 3 mins
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guest Rating</div>
            <div className="my-2">
              <div className="text-2xl font-black text-amber-600 flex items-center gap-1">
                <span>4.9</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">32 reviews</div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-500" /> Hotel Staff Star
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Duty Days</div>
            <div className="my-2">
              <div className="text-2xl font-black text-blue-700">24 / 26</div>
              <div className="text-[10px] text-blue-600 font-semibold mt-0.5">92.3% presence</div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500" /> September 2026
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ASSIGNED WHATSAPP CHATS & PRE-APPROVED TEMPLATES HUB                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Assigned Chats Quick Messenger */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>My Assigned WhatsApp Conversations</span>
              </h3>
              <p className="text-xs text-slate-500">Live guest inquiries assigned to you</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {conversations.length} Active
            </span>
          </div>

          {/* Conversation List Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {conversations.slice(0, 6).map((c) => {
              const isSel = c.id === selectedChatId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChatId(c.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium shrink-0 text-left transition cursor-pointer flex items-center gap-2 ${
                    isSel
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {((c as any).contact_name || (c as any).name)?.[0] || 'G'}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{(c as any).contact_name || (c as any).name || 'Guest'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{(c as any).phone_number || (c as any).phone}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Conversation Quick Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{(selectedConversation as any)?.contact_name || (selectedConversation as any)?.name || 'Guest'}</span>
                <span className="text-xs font-mono text-slate-500">{(selectedConversation as any)?.phone_number || (selectedConversation as any)?.phone}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Official WABA Connected
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 max-h-36 overflow-y-auto space-y-2">
              <div className="text-slate-400 text-[10px] font-semibold uppercase">Last Message:</div>
              <div className="bg-slate-100 p-2.5 rounded-lg text-slate-800">
                {(selectedConversation as any)?.lastMessage || selectedConversation?.messages?.[selectedConversation.messages.length - 1]?.text || selectedConversation?.service_needed || 'Hello, I would like to check-in early around 11:00 AM.'}
              </div>
            </div>

            {/* Quick send input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={quickReplyText}
                onChange={(e) => setQuickReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendQuickReply();
                }}
                placeholder="Type reply to guest on official WhatsApp..."
                className="flex-1 px-3 py-2 bg-white border border-slate-300 focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendQuickReply()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Pre-Approved Templates Hub */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Quick WhatsApp Templates</span>
              </h3>
              <p className="text-xs text-slate-500">Official pre-approved Meta templates</p>
            </div>

            <div className="flex items-center gap-1">
              {(['all', 'guest', 'service'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedTemplateCategory(cat)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    selectedTemplateCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition">
                    {tmpl.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSendQuickReply(tmpl.text.replace('{{1}}', (selectedConversation as any)?.contact_name || (selectedConversation as any)?.name || 'Guest'))}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Send Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {tmpl.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TODAY'S ASSIGNED TASKS & DUTIES CHECKLIST                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Today's Duty Checklist & Guest Requests</h3>
              <p className="text-xs text-slate-500">Tasks assigned by your shift supervisor</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Auto-synced with Hotel Operations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'task-1',
              title: 'Confirm Deluxe Suite 304 Late Checkout',
              guest: 'Vikram Malhotra',
              priority: 'High',
              time: '11:30 AM',
              done: false,
            },
            {
              id: 'task-2',
              title: 'Dispatch Airport Cab for Dr. Suresh Varma',
              guest: 'Dr. Suresh Varma',
              priority: 'Urgent',
              time: '01:15 PM',
              done: true,
            },
            {
              id: 'task-3',
              title: 'Verify Aadhaar & Passport Copies for Suite 208',
              guest: 'Farhan & Family',
              priority: 'Medium',
              time: '03:00 PM',
              done: false,
            },
          ].map((t) => (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border transition ${
                t.done ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    t.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : t.priority === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {t.priority}
                </span>
                <span className="font-mono text-slate-400">{t.time}</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 leading-tight">{t.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1">Guest: {t.guest}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Status: {t.done ? '✅ Completed' : '⏳ In Progress'}</span>
                <button
                  type="button"
                  onClick={() => addToast(`Task "${t.title}" status toggled!`, 'info')}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                >
                  {t.done ? 'Mark Pending' : 'Mark Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  TrendingUp, TrendingDown, Users, Calendar, CheckCircle2,
  AlertTriangle, DollarSign, Zap, Bot, ArrowRight,
  Clock, ShieldAlert, Sparkles, Send, Eye, RefreshCw, X,
  Check, Phone, MapPin, ExternalLink, ShieldCheck, CheckCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardView: React.FC = () => {
  const { setActiveTab, conversations, leads, jobs, appointments, invoices, addToast } = useQiyamStore();

  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isRecentActivityModalOpen, setIsRecentActivityModalOpen] = useState(false);

  // AI Copilot local chat state
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "Good morning, Rahul! 👋\nHere's a summary of your business:\n• 7 leads need follow-up\n• 3 jobs are overdue\n• 2 payments awaiting reminder\n• You have 15 appointments today",
      time: 'Just now',
    },
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const aiChatScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    aiChatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages.length, isAiThinking]);

  const revenueData = [
    { day: 'Mon', revenue: 26000 },
    { day: 'Tue', revenue: 32000 },
    { day: 'Wed', revenue: 45000 },
    { day: 'Thu', revenue: 51000 },
    { day: 'Fri', revenue: 48000 },
    { day: 'Sat', revenue: 68000 },
    { day: 'Sun', revenue: 86400 },
  ];

  const handleAskAi = (promptText?: string) => {
    const query = promptText || aiInput;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query, time: 'Just now' };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();
      if (lower.includes('schedule') || lower.includes('today')) {
        reply = `Today's schedule has 15 active appointments. 4 high-priority AC installations in Kozhikode and 3 plumbing visits. Technicians Amit Sharma and Ramesh Kumar are dispatched on route RTE-001.`;
      } else if (lower.includes('payment') || lower.includes('reminder')) {
        reply = `I have flagged 2 overdue payments totaling ₹19,400 (AC Services: ₹12,500 and Priya Sharma: ₹32,000). Automated WhatsApp reminder links are ready to trigger.`;
      } else if (lower.includes('job') || lower.includes('overdue')) {
        reply = `There are 3 jobs flagged as delayed/overdue in Kozhikode & Vadakara. I have notified field managers for priority dispatch.`;
      } else if (lower.includes('lead') || lower.includes('high value')) {
        reply = `Top 7 high-value leads are active. Vikram Mehta (₹12,000 AC Installation) and Pooja Iyer (₹18,000 AMC) are currently in proposal review.`;
      } else {
        reply = `I analyzed your Qiyam OS real-time data for "${query}". All WhatsApp incoming webhooks, active jobs, and CRM lead pipelines are operating at 98.7% automation efficiency.`;
      }

      setAiMessages((prev) => [...prev, { sender: 'ai', text: reply, time: 'Just now' }]);
      setIsAiThinking(false);
    }, 700);
  };

  const allAlerts = [
    {
      id: 'A1',
      code: 'A',
      severity: 'high',
      title: '7 high-value leads need follow-up',
      subtitle: '2m ago • Lead score > 85 • Pipeline value ₹48,000',
      actionLabel: 'Review Leads',
      tabTarget: 'crm-leads' as const,
      color: 'red',
      description: 'Top hot leads (Vikram Mehta, Pooja Iyer, Deepak Patel) have been idle for >24h. Suggested action: Trigger 1-click WhatsApp quotation sequence.',
    },
    {
      id: 'B1',
      code: 'B',
      severity: 'medium',
      title: '3 jobs are overdue for dispatch',
      subtitle: '15m ago • Calicut Zone • Delayed tech arrival',
      actionLabel: 'Dispatch Jobs',
      tabTarget: 'ops-jobs' as const,
      color: 'amber',
      description: 'Jobs JOB-1024, JOB-1023 are delayed due to high traffic near Beach Road. Re-assign nearest technician Amit Sharma.',
    },
    {
      id: 'B2',
      code: 'B',
      severity: 'medium',
      title: '₹18,400 payments are overdue',
      subtitle: '32m ago • 2 accounts • Credit period exceeded',
      actionLabel: 'Send Reminders',
      tabTarget: 'finance-invoices' as const,
      color: 'amber',
      description: 'Invoices INV-2024-0183 (Priya Sharma: ₹32,000) and INV-2024-0182 (Rahul Singh: ₹7,600) have passed their due dates.',
    },
    {
      id: 'D1',
      code: 'D',
      severity: 'info',
      title: "Tomorrow's appointments exceed capacity",
      subtitle: '1h ago • Suggesting route re-optimization',
      actionLabel: 'Optimize Route',
      tabTarget: 'ops-routes' as const,
      color: 'blue',
      description: '18 scheduled visits across Kozhikode exceed standard 8h technician shifts. Running AI Route Optimization can balance workloads.',
    },
    {
      id: 'S1',
      code: 'S',
      severity: 'info',
      title: 'Surge in AC Maintenance bookings (+34%)',
      subtitle: '2h ago • Kozhikode & Koyilandy branch',
      actionLabel: 'View Analytics',
      tabTarget: 'analytics' as const,
      color: 'purple',
      description: 'High weather temperature triggered 34% increase in WhatsApp inbound inquiries. Stock spare gas kits in Main Warehouse.',
    },
    {
      id: 'P1',
      code: 'P',
      severity: 'medium',
      title: '2 Purchase Approvals Pending',
      subtitle: '3h ago • Operations & Marketing budget',
      actionLabel: 'Open Approvals',
      tabTarget: 'automation-approvals' as const,
      color: 'amber',
      description: 'Purchase order APR-1024 (₹25,000) and Marketing budget APR-1022 (₹50,000) are awaiting owner authorization.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Dashboard"
        subtitle="Good morning, Rahul! Here's what's happening in your business today."
        primaryActionLabel="New Booking"
        onPrimaryAction={() => setActiveTab('conversations')}
      />

      <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* Top 6 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Revenue */}
          <div
            onClick={() => setActiveTab('finance-overview')}
            className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900">₹86,400</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12.6% vs last week</span>
            </div>
          </div>

          {/* New Leads */}
          <div
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveTab('crm-leads')}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">New Leads</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900">48</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% vs last week</span>
            </div>
          </div>

          {/* Appointments */}
          <div
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveTab('ops-appointments')}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Appointments</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900">31</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+10.3% vs last week</span>
            </div>
          </div>

          {/* Jobs Completed */}
          <div
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveTab('ops-jobs')}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Jobs Completed</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900">54</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14.7% vs last week</span>
            </div>
          </div>

          {/* Pending Payments */}
          <div
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveTab('finance-payments')}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Pending Payments</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900">₹19,400</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 mt-1">
              <TrendingDown className="w-3 h-3" />
              <span>-6.1% vs last week</span>
            </div>
          </div>

          {/* Automation Rate */}
          <div
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveTab('automation-workflows')}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Automation Rate</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900">81%</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+8% vs last week</span>
            </div>
          </div>
        </div>

        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left + Center Area (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* AI Alerts & Conversations Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Alerts Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-900">AI Alerts</h2>
                  </div>
                  <button
                    onClick={() => setIsAlertsModalOpen(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Alert A */}
                  <div
                    onClick={() => {
                      setActiveTab('crm-leads');
                      addToast('Navigating to High-Value Leads pipeline', 'info');
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-red-50/70 border border-red-100 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer group"
                  >
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      A
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-red-800 flex items-center justify-between">
                        <span>7 high-value leads need follow-up</span>
                        <ArrowRight className="w-3 h-3 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-slate-500">2m ago • Lead score &gt; 85 • Click to view</div>
                    </div>
                  </div>

                  {/* Alert B1 */}
                  <div
                    onClick={() => {
                      setActiveTab('ops-jobs');
                      addToast('Navigating to Overdue Jobs for dispatch', 'warning');
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer group"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      B
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-amber-900 flex items-center justify-between">
                        <span>3 jobs are overdue for dispatch</span>
                        <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-slate-500">15m ago • Calicut Zone • Click to view</div>
                    </div>
                  </div>

                  {/* Alert B2 */}
                  <div
                    onClick={() => {
                      setActiveTab('finance-invoices');
                      addToast('Navigating to Overdue Invoices & Reminders', 'warning');
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer group"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      B
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-amber-900 flex items-center justify-between">
                        <span>₹18,400 payments are overdue</span>
                        <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-slate-500">32m ago • 2 accounts • Click to view</div>
                    </div>
                  </div>

                  {/* Alert D */}
                  <div
                    onClick={() => {
                      setActiveTab('ops-routes');
                      addToast('Navigating to Route Optimization for capacity balance', 'info');
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      D
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-900 flex items-center justify-between">
                        <span>Tomorrow's appointments exceed capacity</span>
                        <ArrowRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-slate-500">1h ago • Suggesting re-route • Click to view</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversations Donut Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-900">Conversations</h2>
                  <button
                    onClick={() => setActiveTab('conversations')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="flex items-center justify-around py-2">
                  {/* Visual Donut Ring */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-[10px] border-emerald-500 border-t-blue-500 border-r-purple-500 border-b-amber-500 flex items-center justify-center shadow-inner">
                      <div className="text-center">
                        <div className="text-2xl font-black text-slate-900">178</div>
                        <div className="text-[10px] font-medium text-slate-400">Total</div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-slate-600">Open:</span>
                      <span className="font-bold text-slate-900">24 (13.5%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="text-slate-600">In Progress:</span>
                      <span className="font-bold text-slate-900">67 (37.6%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-slate-600">Waiting:</span>
                      <span className="font-bold text-slate-900">25 (14.0%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">Resolved:</span>
                      <span className="font-bold text-slate-900">62 (34.8%)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('conversations')}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all mt-2 cursor-pointer"
                >
                  <span>Open WhatsApp Inbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recent Activity Stream & Top Employees Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
                  <button
                    onClick={() => setIsRecentActivityModalOpen(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div
                    onClick={() => {
                      setActiveTab('conversations');
                      addToast('Opened booking conversation with Amit Verma', 'info');
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-slate-800">New booking received from Amit Verma</div>
                        <div className="text-[10px] text-slate-400">AC Repair • Koyilandy</div>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full">New Booking</span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('finance-invoices');
                      addToast('Opened invoice for Priya Sharma', 'info');
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <div className="font-semibold text-slate-800">Payment of ₹2,800 received from Priya Sharma</div>
                        <div className="text-[10px] text-slate-400">UPI • HDFC 1234</div>
                      </div>
                    </div>
                    <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-full">Payment Received</span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('ops-jobs');
                      addToast('Viewing completed job #4821', 'info');
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div>
                        <div className="font-semibold text-slate-800">Job #4821 marked as completed by Ramesh</div>
                        <div className="text-[10px] text-slate-400">Rating: 5.0 ⭐</div>
                      </div>
                    </div>
                    <span className="bg-purple-50 text-purple-700 font-bold text-[10px] px-2 py-0.5 rounded-full">Job Completed</span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('crm-leads');
                      addToast('Viewing new WhatsApp lead', 'info');
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <div className="font-semibold text-slate-800">New WhatsApp lead from +91 98765 43210</div>
                        <div className="text-[10px] text-slate-400">Source: Click to WhatsApp Ad</div>
                      </div>
                    </div>
                    <span className="bg-amber-50 text-amber-700 font-bold text-[10px] px-2 py-0.5 rounded-full">New Lead</span>
                  </div>
                </div>
              </div>

              {/* Top Employees (This Week) & Jobs Status */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-900">Top Employees (This Week)</h2>
                    <button onClick={() => setActiveTab('ops-employees')} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer">View all</button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div
                      onClick={() => setActiveTab('ops-employees')}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Ramesh" className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-semibold text-slate-800">Ramesh Kumar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[90%]" />
                        </div>
                        <span className="font-bold text-slate-900">23 Jobs</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('ops-employees')}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Suresh" className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-semibold text-slate-800">Suresh Yadav</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[75%]" />
                        </div>
                        <span className="font-bold text-slate-900">18 Jobs</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('ops-employees')}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Anita" className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-semibold text-slate-800">Anita Singh</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[60%]" />
                        </div>
                        <span className="font-bold text-slate-900">14 Jobs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Jobs Status Table */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
                  <div onClick={() => setActiveTab('ops-jobs')} className="bg-blue-50/60 p-2 rounded-lg cursor-pointer hover:bg-blue-100/60 transition-colors">
                    <div className="text-[10px] text-blue-600 font-semibold">Scheduled</div>
                    <div className="text-sm font-bold text-slate-900">31</div>
                  </div>
                  <div onClick={() => setActiveTab('ops-jobs')} className="bg-purple-50/60 p-2 rounded-lg cursor-pointer hover:bg-purple-100/60 transition-colors">
                    <div className="text-[10px] text-purple-600 font-semibold">In Progress</div>
                    <div className="text-sm font-bold text-slate-900">28</div>
                  </div>
                  <div onClick={() => setActiveTab('ops-jobs')} className="bg-emerald-50/60 p-2 rounded-lg cursor-pointer hover:bg-emerald-100/60 transition-colors">
                    <div className="text-[10px] text-emerald-600 font-semibold">Completed</div>
                    <div className="text-sm font-bold text-slate-900">54</div>
                  </div>
                  <div onClick={() => setActiveTab('ops-jobs')} className="bg-red-50/60 p-2 rounded-lg cursor-pointer hover:bg-red-100/60 transition-colors">
                    <div className="text-[10px] text-red-600 font-semibold">Overdue</div>
                    <div className="text-sm font-bold text-slate-900">7</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Overview Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Revenue Overview</div>
                  <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span>₹86,400</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ↑ 12.6% vs last week
                    </span>
                  </div>
                </div>
                <select className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Sidebar: AI Assistant Copilot (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-full min-h-[560px] max-h-[720px] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900">Qiyam AI Copilot</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-full">v2.5</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time Business Sync</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setAiMessages([
                      {
                        sender: 'ai',
                        text: "Good morning, Rahul! 👋\nHere's a summary of your business:\n• 7 leads need follow-up\n• 3 jobs are overdue\n• 2 payments awaiting reminder\n• You have 15 appointments today",
                        time: 'Just now',
                      },
                    ]);
                    addToast('AI chat history refreshed', 'info');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                  title="Clear & Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs scrollbar-thin">
              {aiMessages.map((msg, i) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAi && (
                      <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-[10px]">
                        <Bot className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                    )}
                    <div
                      className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                        isAi
                          ? 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs ml-auto font-medium shadow-sm shadow-emerald-700/20'
                      }`}
                    >
                      <div className="whitespace-pre-line text-[11px] sm:text-xs">{msg.text}</div>
                      <div
                        className={`text-[9px] mt-1 flex items-center gap-1 ${
                          isAi ? 'text-slate-400' : 'text-emerald-100 justify-end'
                        }`}
                      >
                        <span>{msg.time}</span>
                        {!isAi && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                      </div>
                    </div>
                    {!isAi && (
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        RM
                      </div>
                    )}
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                  </div>
                  <div className="bg-purple-50/80 border border-purple-100 text-purple-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs flex items-center gap-2">
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="text-[11px] font-medium text-purple-700 italic">Analyzing operations & pipeline...</span>
                  </div>
                </div>
              )}
              <div ref={aiChatScrollRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-3 pt-2 pb-1 border-t border-slate-100 bg-slate-50/40">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</span>
                <span className="text-[9px] text-purple-600 font-semibold">1-Click Prompts</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <button
                  onClick={() => handleAskAi("Show today's schedule")}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 font-medium transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Calendar className="w-3 h-3 text-purple-500" />
                  <span>Today's Schedule</span>
                </button>
                <button
                  onClick={() => handleAskAi('Send payment reminders')}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 font-medium transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <DollarSign className="w-3 h-3 text-emerald-500" />
                  <span>Payment Reminders</span>
                </button>
                <button
                  onClick={() => handleAskAi('Show overdue jobs')}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700 font-medium transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Overdue Jobs</span>
                </button>
                <button
                  onClick={() => handleAskAi('High value leads')}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-medium transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Users className="w-3 h-3 text-blue-500" />
                  <span>High-Value Leads</span>
                </button>
                <button
                  onClick={() => handleAskAi('Generate sales report')}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 font-medium transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Sales Report</span>
                </button>
              </div>
            </div>

            {/* AI Query Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="p-3 border-t border-slate-200/80 bg-white"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask anything about jobs, revenue, leads..."
                  className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!aiInput.trim() || isAiThinking}
                  className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 mt-1.5">
                <span>Enterprise Copilot</span>
                <span>Press Enter ↵</span>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Quick Feature Strip (Matching photo_3 bottom row) */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Module Navigation</h3>
            <span className="text-xs text-slate-400">Click any card to jump to its module</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Conversations Mini */}
            <div
              onClick={() => setActiveTab('conversations')}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Conversations</span>
                <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">WhatsApp team shared inbox & chat</div>
            </div>

            {/* Leads Mini */}
            <div
              onClick={() => setActiveTab('crm-leads')}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Lead Pipeline</span>
                <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">Kanban stages & follow-ups</div>
            </div>

            {/* Jobs Mini */}
            <div
              onClick={() => setActiveTab('ops-jobs')}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Job Dispatch</span>
                <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">54 completed • 31 scheduled</div>
            </div>

            {/* Invoices Mini */}
            <div
              onClick={() => setActiveTab('finance-invoices')}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Invoices & Payments</span>
                <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">₹24,85,320 total billed</div>
            </div>

            {/* Workflow Builder Mini */}
            <div
              onClick={() => setActiveTab('automation-builder')}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Workflow Builder</span>
                <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">Visual drag-and-drop flow canvas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Alerts Full Modal */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Active AI Business Alerts & Anomalies</h3>
                  <p className="text-[11px] sm:text-xs text-purple-200">Real-time proactive monitoring across CRM, Jobs, and Finance</p>
                </div>
              </div>
              <button
                onClick={() => setIsAlertsModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-3.5 text-xs">
              {allAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    alert.color === 'red'
                      ? 'bg-red-50/70 border-red-200'
                      : alert.color === 'amber'
                      ? 'bg-amber-50/70 border-amber-200'
                      : alert.color === 'purple'
                      ? 'bg-purple-50/70 border-purple-200'
                      : 'bg-blue-50/70 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.color === 'red'
                          ? 'bg-red-600'
                          : alert.color === 'amber'
                          ? 'bg-amber-500'
                          : alert.color === 'purple'
                          ? 'bg-purple-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {alert.code}
                    </span>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">{alert.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            alert.severity === 'high'
                              ? 'bg-red-100 text-red-700'
                              : alert.severity === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {alert.severity} Priority
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{alert.subtitle}</div>
                      <p className="text-[11px] text-slate-700 leading-relaxed pt-0.5">{alert.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAlertsModalOpen(false);
                      setActiveTab(alert.tabTarget);
                      addToast(`Navigating to ${alert.title}`, 'info');
                    }}
                    className={`px-4 py-2 rounded-xl text-white font-bold text-xs shrink-0 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                      alert.color === 'red'
                        ? 'bg-red-600 hover:bg-red-700'
                        : alert.color === 'amber'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : alert.color === 'purple'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <span>{alert.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch sm:items-center justify-between text-xs">
              <span className="text-slate-500 font-medium text-[11px] sm:text-xs">6 active business insights generated by AI Copilot</span>
              <button
                onClick={() => {
                  setIsAlertsModalOpen(false);
                  addToast('All notifications acknowledged', 'success');
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer text-center"
              >
                Dismiss All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Recent Activity Modal */}
      {isRecentActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="bg-slate-900 p-3.5 sm:p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Full Activity Audit Log</h3>
              </div>
              <button
                onClick={() => setIsRecentActivityModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 text-xs">
              <div
                onClick={() => {
                  setIsRecentActivityModalOpen(false);
                  setActiveTab('conversations');
                }}
                className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">New booking received from Amit Verma</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">New Booking</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">AC Repair • Koyilandy • 2m ago</div>
              </div>

              <div
                onClick={() => {
                  setIsRecentActivityModalOpen(false);
                  setActiveTab('finance-invoices');
                }}
                className="p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Payment of ₹2,800 received from Priya Sharma</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Payment Received</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">UPI • HDFC 1234 • 15m ago</div>
              </div>

              <div
                onClick={() => {
                  setIsRecentActivityModalOpen(false);
                  setActiveTab('ops-jobs');
                }}
                className="p-3 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Job #4821 marked as completed by Ramesh</span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Job Completed</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">Rating: 5.0 ⭐ • 1h ago</div>
              </div>

              <div
                onClick={() => {
                  setIsRecentActivityModalOpen(false);
                  setActiveTab('crm-leads');
                }}
                className="p-3 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 hover:border-amber-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">New WhatsApp lead from +91 98765 43210</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">New Lead</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">Source: Click to WhatsApp Ad • 2h ago</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

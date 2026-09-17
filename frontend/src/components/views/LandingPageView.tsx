import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Zap,
  GitBranch,
  Bot,
  ShieldCheck,
  Navigation,
  Receipt,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  Building2,
  TrendingUp,
  DollarSign,
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink,
  Shield,
  Smartphone,
  Layers,
  Cpu,
  RefreshCw,
  Globe,
  Lock,
  Phone,
  Sliders,
  Award,
  BarChart3,
  Search,
  ChevronRight,
  Flame,
  CheckCheck
} from 'lucide-react';

interface LandingPageViewProps {
  onLaunchApp?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onLaunchApp }) => {
  // Interactive Simulator State
  const [activeSimStep, setActiveSimStep] = useState<number>(0);
  const [simPlaying, setSimPlaying] = useState<boolean>(true);

  // ROI Calculator State
  const [monthlyConversations, setMonthlyConversations] = useState<number>(12000);
  const [averageDealValue, setAverageDealValue] = useState<number>(3500);
  const [conversionRate, setConversionRate] = useState<number>(18);

  // Pricing Toggle: 'monthly' | 'annual'
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // FAQ Open State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Live Phone Demo Input
  const [demoPhone, setDemoPhone] = useState<string>('');
  const [demoSubmitted, setDemoSubmitted] = useState<boolean>(false);

  // Simulation steps auto-runner
  React.useEffect(() => {
    if (!simPlaying) return;
    const interval = setInterval(() => {
      setActiveSimStep((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, [simPlaying]);

  // Calculations for ROI Calculator
  const roiCalculations = useMemo(() => {
    const dealsWon = Math.round(monthlyConversations * (conversionRate / 100));
    const totalRevenueGenerated = dealsWon * averageDealValue;
    const hoursSavedPerMonth = Math.round((monthlyConversations * 4.5) / 60); // 4.5 mins saved per automated chat
    const laborCostSaved = hoursSavedPerMonth * 350; // avg tech hourly rate in INR
    const metaUtilityCost = Math.round(monthlyConversations * 0.42); // avg utility conversation cost
    const netValueGained = laborCostSaved + Math.round(totalRevenueGenerated * 0.12);

    return {
      dealsWon,
      totalRevenueGenerated,
      hoursSavedPerMonth,
      laborCostSaved,
      metaUtilityCost,
      netValueGained,
    };
  }, [monthlyConversations, averageDealValue, conversionRate]);

  const simSteps = [
    {
      step: 1,
      title: 'Customer WhatsApp Inquiry',
      chatSender: 'Amit Verma (Customer)',
      chatText: 'Hi CoolFix, my 2-Ton Inverter AC in Koyilandy stopped cooling. Can you send a technician tomorrow morning 10 AM?',
      time: '10:30 AM',
      nodeState: 'Trigger: New WhatsApp Message',
      crmStatus: 'New Lead Auto-Captured',
      techDispatch: 'Awaiting Intent & Location Check',
      invoiceStatus: 'Not Generated',
    },
    {
      step: 2,
      title: 'AI Intent Parsing & Service Qualification',
      chatSender: 'Qiyam Autonomous AI Copilot',
      chatText: 'Hello Amit! 👋 We can service your 2-Ton Inverter AC tomorrow at 10:00 AM in Koyilandy. Inspection & gas recharge is ₹2,800. Shall I confirm your booking?',
      time: '10:30 AM',
      nodeState: 'AI Agent: Understand Intent & Check Roster',
      crmStatus: 'Lead Qualified: ₹2,800 Potential',
      techDispatch: 'Technician Amit Sharma (98% match) reserved',
      invoiceStatus: 'Pro-forma Prepared',
    },
    {
      step: 3,
      title: 'Instant Confirmation & Smart GPS Dispatch',
      chatSender: 'Amit Verma (Customer)',
      chatText: 'Yes, please confirm! 45, Park Street, Koyilandy.',
      time: '10:31 AM',
      nodeState: 'Action: Create Job #JOB-1024 & Optimize Route',
      crmStatus: 'Deal Won & Moved to Active Operations',
      techDispatch: 'Amit Sharma Dispatched • ETA: 10:00 AM (Route #RTE-001)',
      invoiceStatus: 'Advance Invoice ₹840 Dispatched with UPI Link',
    },
    {
      step: 4,
      title: 'Automated Invoicing & UPI Collection',
      chatSender: 'Qiyam Financial Bot',
      chatText: 'Booking #JOB-1024 confirmed! 🛠️ Invoice INV-2024-0186 generated. Tap below to pay advance via UPI / GPay: https://upi.qiyam.link/pay/840',
      time: '10:32 AM',
      nodeState: 'Action: Reconcile Ledger & Update Accounting',
      crmStatus: 'Paid Advance • Customer Lifetime Value Updated',
      techDispatch: 'Technician Job Card Auto-Synced to Mobile App',
      invoiceStatus: 'Paid ₹840 • Ledger Updated in HDFC Bank Account',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[35%] right-[-10%] w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-[70%] left-[-10%] w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP STICKY NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070B14]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#09101F] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">QIYAM</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  BUSINESS OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wider font-mono">
                META CLOUD API v21.0 CERTIFIED
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-emerald-400 transition-colors">Live Flow Demo</a>
            <a href="#workflow-builder" className="hover:text-emerald-400 transition-colors">Workflow Builder</a>
            <a href="#roi-calculator" className="hover:text-emerald-400 transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono">Meta Graph API v21.0 Online</span>
            </div>

            {onLaunchApp && (
              <button
                onClick={onLaunchApp}
                className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-medium mb-8 shadow-inner shadow-emerald-500/10">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>The #1 WhatsApp-Native Autonomous Enterprise OS</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 hidden sm:inline">Dual-Workspace Coexistence</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Turn WhatsApp Into Your Entire{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Autonomous Business Engine.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Stop stitching together 7 fragmented SaaS tools. <strong className="text-white">Qiyam Business OS</strong> natively unifies official
          Meta WhatsApp Cloud API, visual drag-and-drop workflow automations, CRM pipelines, technician dispatch, GPS routing, and instant WhatsApp GST invoicing into one unified cockpit.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
          {onLaunchApp ? (
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-95 transition duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Deploy Business OS Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          )}

          <a
            href="#simulator"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 border border-white/10 hover:border-emerald-500/40 font-semibold text-base transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Interactive Flow Simulation</span>
          </a>
        </div>

        {/* Hero Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Official Meta Cloud API (v21.0)
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Anti-Ban Throttling & Suppression Lists
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" /> Sub-second Realtime Webhooks
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-400" /> Multi-Branch Federation Ready
          </span>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE HERO SIMULATOR: LIVE CONVERSATION TO REVENUE PIPELINE */}
        {/* ========================================================================= */}
        <div id="simulator" className="mt-16 text-left rounded-3xl p-1 bg-gradient-to-b from-emerald-500/30 via-slate-800/50 to-transparent shadow-2xl">
          <div className="bg-[#09101F] rounded-[22px] border border-white/10 p-4 sm:p-7 backdrop-blur-2xl">
            {/* Top Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  LIVE WORKSPACE TELEMETRY: <strong className="text-emerald-400 font-semibold">CoolFix Services [TN2345]</strong>
                </span>
              </div>

              {/* Simulation Step Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium mr-1">Live Simulation Flow:</span>
                {simSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveSimStep(idx);
                      setSimPlaying(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeSimStep === idx
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Step {step.step}: {step.title.split(' ')[0]}
                  </button>
                ))}
                <button
                  onClick={() => setSimPlaying(!simPlaying)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  title={simPlaying ? 'Pause Auto-Simulation' : 'Resume Auto-Simulation'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${simPlaying ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Split Screen Grid: WhatsApp Input -> Qiyam Workflow Engine -> Operations Cockpit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Col 1: Customer WhatsApp Experience (4 cols) */}
              <div className="lg:col-span-4 rounded-2xl bg-[#0F172A] border border-slate-700/60 p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                        WA
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">WhatsApp Business Chat</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Official Meta Cloud API
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{simSteps[activeSimStep].time}</span>
                  </div>

                  {/* WhatsApp Messages Thread */}
                  <div className="space-y-3 my-2 text-xs">
                    {/* Previous Context Message */}
                    <div className="bg-[#1E293B] rounded-2xl rounded-tl-sm p-3 border border-slate-700/40 text-slate-200">
                      <div className="font-semibold text-emerald-400 text-[11px] mb-1">
                        {simSteps[activeSimStep].chatSender}
                      </div>
                      <p className="leading-relaxed">{simSteps[activeSimStep].chatText}</p>
                    </div>

                    {/* Meta Rich Action Card (simulated) */}
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 text-[11px] text-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Instant Webhook Event Triggered: <strong>0.18s</strong></span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300">
                        wamid.HBgL...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Contact: <strong>Amit Verma (+91 98765 43210)</strong></span>
                  <span className="text-emerald-400 font-mono">Status: Verified</span>
                </div>
              </div>

              {/* Col 2: The Qiyam Workflow Automation Heart (4 cols) */}
              <div className="lg:col-span-4 rounded-2xl bg-[#091528] border border-emerald-500/40 p-4 flex flex-col justify-between shadow-xl shadow-emerald-500/5 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Visual Workflow Engine</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Executing Node {activeSimStep + 1} of 4
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Active Flow Step
                      </div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>{simSteps[activeSimStep].nodeState}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">AI Intent</span>
                        <span className="font-semibold text-emerald-300">AC Repair Service</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Auto Geo-Fence</span>
                        <span className="font-semibold text-emerald-300">Koyilandy Branch</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-slate-300 text-[11px] flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>RAG Knowledge Base: Verified price ₹2,800 + technician slot 10 AM</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Logic Recipe: <strong>Service Booking Flow</strong></span>
                  <span className="text-emerald-400 font-mono">100% Success Rate</span>
                </div>
              </div>

              {/* Col 3: Operations & Cashflow Cockpit (4 cols) */}
              <div className="lg:col-span-4 rounded-2xl bg-[#0F172A] border border-slate-700/60 p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">ERP & Field Operations</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Live Synchronized
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* CRM Deal Status */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <div>
                          <div className="text-[10px] text-slate-400">CRM Pipeline</div>
                          <div className="font-semibold text-slate-200">{simSteps[activeSimStep].crmStatus}</div>
                        </div>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">₹2,800</span>
                    </div>

                    {/* Field Tech Dispatch */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                          <div className="text-[10px] text-slate-400">GPS Route Dispatch</div>
                          <div className="font-semibold text-slate-200">{simSteps[activeSimStep].techDispatch}</div>
                        </div>
                      </div>
                    </div>

                    {/* GST Invoicing & Payment */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                        <div>
                          <div className="text-[10px] text-slate-400">GST Invoice & UPI</div>
                          <div className="font-semibold text-slate-200">{simSteps[activeSimStep].invoiceStatus}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total System Latency:</span>
                  <span className="font-mono font-bold text-emerald-400">1.24 seconds</span>
                </div>
              </div>
            </div>

            {/* Bottom Stepper Indicator */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div>
                <span className="text-emerald-400 font-bold">Step {activeSimStep + 1} / 4:</span>{' '}
                <span className="text-slate-300">{simSteps[activeSimStep].title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSimStep((prev) => (prev > 0 ? prev - 1 : 3))}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setActiveSimStep((prev) => (prev + 1) % 4)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INFINITE TELEMETRY MARQUEE */}
      {/* ========================================================================= */}
      <div className="w-full border-y border-white/10 bg-[#09101F]/80 backdrop-blur-md py-4 overflow-hidden relative">
        <div className="flex items-center gap-12 whitespace-nowrap overflow-x-auto scrollbar-hide px-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 shrink-0">
            <span className="text-emerald-400 font-bold font-mono text-base">98.4%</span> Average WhatsApp Open Rate
          </div>
          <span className="text-slate-600 shrink-0">•</span>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 shrink-0">
            <span className="text-emerald-400 font-bold font-mono text-base">14.2x</span> Faster Deal Closing Speed
          </div>
          <span className="text-slate-600 shrink-0">•</span>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 shrink-0">
            <span className="text-emerald-400 font-bold font-mono text-base">₹59,40,000+</span> Annual Automated Revenue Processed
          </div>
          <span className="text-slate-600 shrink-0">•</span>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 shrink-0">
            <span className="text-emerald-400 font-bold font-mono text-base">Zero</span> Meta 131051 Account Bans Guaranteed
          </div>
          <span className="text-slate-600 shrink-0">•</span>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 shrink-0">
            <span className="text-emerald-400 font-bold font-mono text-base">1.2s</span> Average AI Resolution Time
          </div>
          <span className="text-slate-600 shrink-0">•</span>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 shrink-0">
            <span className="text-emerald-400 font-bold font-mono text-base">100%</span> Meta Graph API v21.0 Certified
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MASTER BENTO GRID: THE 6 PILLARS */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono uppercase tracking-wider mb-3">
            Architected for Modern Enterprise
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Six Autonomous Engines. One Single Cockpit.
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Every customer conversation, employee shift, inventory item, and invoice stays synchronized in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Visual Drag-and-Drop Workflow Builder (2 columns wide) */}
          <div id="workflow-builder" className="md:col-span-2 rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0B1528] border border-white/10 p-8 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
                <GitBranch className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Visual Automation Canvas
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-3">
                Drag-and-Drop Node Automation Builder
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                Build sophisticated workflows without writing a single line of code. Connect WhatsApp trigger events to AI classification, conditional availability checks, employee dispatching, advance UPI payment requests, and automatic feedback loops.
              </p>
            </div>

            {/* Visual Node Flow Mockup */}
            <div className="mt-8 p-4 rounded-2xl bg-[#070B14] border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-mono">Workflow: Service Booking & Advance Payment</span>
                <span className="text-emerald-400 font-bold">Status: Active (98.7% Success)</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
                <div className="flex-1 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
                  Trigger: New WhatsApp
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                <div className="flex-1 p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-medium">
                  AI: Extract Intent & City
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                <div className="flex-1 p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 font-medium">
                  Condition: Tech Available?
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                <div className="flex-1 p-2.5 rounded-lg bg-teal-950/60 border border-teal-500/30 text-teal-300 font-medium">
                  Action: Collect UPI Advance
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: WhatsApp Group Grabber & Extractor */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0B1528] border border-white/10 p-8 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between shadow-2xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Lead Generation Machine
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-3">
                WhatsApp Group Grabber & Contact Extractor
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Scan with any phone camera or Google Lens to sync WhatsApp groups instantly. Automatically extract members, standardize phone numbers to international E.164 format, remove duplicates, and build targeted recipient lists.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-[#070B14] border border-slate-800 text-xs flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                Mobile QR Pairing Portal
              </span>
              <span className="text-emerald-400 font-mono font-bold">1-Click Sync</span>
            </div>
          </div>

          {/* Card 3: Full Conversational CRM Pipeline */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0B1528] border border-white/10 p-8 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between shadow-2xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
                Full-Funnel Sales
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-3">
                Conversational CRM & Kanban Pipeline
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Convert WhatsApp chat threads directly into Leads, Deals, or Service Tickets with a single tap. Track deal probabilities, stage movements, customer lifetime value, and automated follow-up matrices.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-[#070B14] border border-slate-800 text-xs flex items-center justify-between text-slate-300">
              <span>Pipeline Velocity:</span>
              <span className="text-blue-400 font-bold font-mono">14.2 Days ➔ 2.1 Days</span>
            </div>
          </div>

          {/* Card 4: Field Operations & GPS Route Optimization */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0B1528] border border-white/10 p-8 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between shadow-2xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-6">
                <Navigation className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Fleet & Technicians
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-3">
                Field Ops & GPS Route Optimization
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dispatch field engineers with automated multi-stop GPS routing. Reduce fuel expenditure by up to 32%, monitor geo-tagged attendance, and automatically notify customers with live ETA updates via WhatsApp.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-[#070B14] border border-slate-800 text-xs flex items-center justify-between text-slate-300">
              <span>Route KL 11 AB 1234:</span>
              <span className="text-amber-400 font-bold font-mono">12 Stops Optimized</span>
            </div>
          </div>

          {/* Card 5: Finance & Instant WhatsApp Invoicing */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0B1528] border border-white/10 p-8 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between shadow-2xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Cashflow Acceleration
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-3">
                WhatsApp GST Invoicing & UPI Collection
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Send professional GST tax invoices directly to the customer's WhatsApp. Embed one-click UPI, GPay, Razorpay, or Stripe links with instant automatic ledger reconciliation and overdue reminder sequences.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-[#070B14] border border-slate-800 text-xs flex items-center justify-between text-slate-300">
              <span>Average Collection Speed:</span>
              <span className="text-emerald-400 font-bold font-mono">Under 4 Minutes</span>
            </div>
          </div>

          {/* Card 6: Autonomous AI Copilot & Custom Knowledge Base (2 cols wide on desktop) */}
          <div className="md:col-span-2 lg:col-span-3 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1528] to-slate-900 border border-white/10 p-8 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                Autonomous 24/7 Intelligence
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-3">
                Enterprise RAG AI Copilot & Knowledge Base Hub
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Train an autonomous AI agent on your exact service catalogs, rate cards, branch policies, and customer FAQs. The copilot handles 80%+ of incoming inquiries, qualifies leads, schedules appointments, and seamlessly transfers complex cases to human agents without missing a beat.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300 font-medium">
                  Zero Hallucination Guardrails
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                  Multilingual Malayalam, Hindi, Arabic & English
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                  Instant Human Agent Escalation
                </span>
              </div>
            </div>

            <div className="w-full lg:w-96 rounded-2xl bg-[#070B14] border border-slate-800 p-4 text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Knowledge Match (99.4% confidence)</span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="p-2 rounded bg-slate-900 text-slate-300">
                  <strong>Query:</strong> "How much for inverter AC gas leak repair?"
                </div>
                <div className="p-2 rounded bg-purple-950/40 border border-purple-500/30 text-purple-200">
                  <strong>Copilot:</strong> "Inspection + full nitrogen gas top-up is ₹2,800 with 90-day warranty. Shall I book your technician?"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE ROI & META WALLET CALCULATOR */}
      {/* ========================================================================= */}
      <section id="roi-calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-b from-[#091528] to-[#070B14] border border-emerald-500/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono uppercase tracking-wider mb-3">
              Interactive Value Modeler
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Calculate Your Enterprise ROI on WhatsApp Autopilot
            </h2>
            <p className="mt-3 text-slate-300 text-base">
              Slide to see how much manual labor, deal slippage, and Meta conversation expenditure your business saves each month with Qiyam Business OS.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Slider 1: Monthly WhatsApp Conversations */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-slate-300">Monthly Customer Conversations:</span>
                  <span className="text-emerald-400 font-mono font-bold text-lg">
                    {monthlyConversations.toLocaleString()} chats
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={60000}
                  step={1000}
                  value={monthlyConversations}
                  onChange={(e) => setMonthlyConversations(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>1,000</span>
                  <span>30,000</span>
                  <span>60,000+</span>
                </div>
              </div>

              {/* Slider 2: Average Deal / Service Job Value */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-slate-300">Average Deal / Service Ticket Value:</span>
                  <span className="text-emerald-400 font-mono font-bold text-lg">
                    ₹{averageDealValue.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={25000}
                  step={500}
                  value={averageDealValue}
                  onChange={(e) => setAverageDealValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>₹500</span>
                  <span>₹12,500</span>
                  <span>₹25,000+</span>
                </div>
              </div>

              {/* Slider 3: Conversion Rate */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-slate-300">WhatsApp Deal Closing Rate:</span>
                  <span className="text-emerald-400 font-mono font-bold text-lg">
                    {conversionRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>5% (Industry Avg)</span>
                  <span>18% (Qiyam Avg)</span>
                  <span>45% (High Intent)</span>
                </div>
              </div>
            </div>

            {/* Right Live Summary Box (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-[#0B1528] border border-emerald-500/40 p-6 sm:p-8 shadow-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Estimated Monthly Value Unlocked
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight mb-6">
                +₹{roiCalculations.netValueGained.toLocaleString()} <span className="text-sm font-sans font-medium text-slate-400">/ month</span>
              </div>

              <div className="space-y-4 text-sm pb-6 border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Staff Time Recovered:</span>
                  <span className="font-mono font-bold text-white">{roiCalculations.hoursSavedPerMonth} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Automated Deals Closed:</span>
                  <span className="font-mono font-bold text-emerald-400">{roiCalculations.dealsWon.toLocaleString()} sales</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Labor Expense Saved:</span>
                  <span className="font-mono font-bold text-white">₹{roiCalculations.laborCostSaved.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Estimated Meta Wallet Cost:</span>
                  <span className="font-mono font-bold text-amber-400">₹{roiCalculations.metaUtilityCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs text-slate-400 mb-3">
                  Includes Meta anti-ban warmup, 99.8% inbox delivery, and smart opt-out suppression.
                </div>
                {onLaunchApp && (
                  <button
                    onClick={onLaunchApp}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Deploy This Setup Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MULTI-BRANCH FEDERATION & CENTRAL CONTROL */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono uppercase tracking-wider mb-3">
              Multi-Location Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Manage 10+ Outlets & Regional Branches from One Master Cockpit
            </h2>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              Whether you run service centers in Kozhikode and Kochi, or retail franchise stores across the Middle East and India, Qiyam Business OS keeps branches autonomous while giving leadership centralized visibility.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Automated Branch Routing</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Customers are geo-routed to the nearest branch technician or store inventory automatically via WhatsApp location pins.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Role-Based Staff Access (RBAC)</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Branch managers see only their technicians and cash drawers, while HQ executive owners see company-wide consolidated P&L and metrics.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Real-time Stock Balancing</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Check inventory availability across all branches instantly and initiate inter-branch stock transfers right from the WhatsApp admin panel.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual: Branch Cards Mockup */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-700/60 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  HO
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Head Office — Kozhikode</div>
                  <div className="text-xs text-slate-400 font-mono">HO-001 • 32 Automations • 256 Tasks Automated</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                Active HQ
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-700/60 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  BR
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Regional Branch — Kochi</div>
                  <div className="text-xs text-slate-400 font-mono">BR-002 • 24 Automations • 210 Tasks Automated</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-500/30">
                Regional Hub
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-700/60 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  DXB
                </div>
                <div>
                  <div className="font-bold text-white text-sm">International Outlet — Dubai</div>
                  <div className="text-xs text-slate-400 font-mono">AE-004 • Dual Currency AED/INR • 18 Staff</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-purple-950/80 text-purple-400 border border-purple-500/30">
                Overseas Hub
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TRANSPARENT ENTERPRISE PRICING MATRIX */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono uppercase tracking-wider mb-3">
            Predictable & Transparent
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Simple Pricing That Scales With Your Revenue
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            No surprise add-ons. Connect your existing Meta Cloud API account or start with our managed WABA setup.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-extrabold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: Starter */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-8 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <h3 className="text-xl font-bold text-white">Starter</h3>
              <p className="text-slate-400 text-xs mt-1">For single-location businesses digitizing WhatsApp.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-white font-mono">
                  {billingCycle === 'annual' ? '₹3,199' : '₹3,999'}
                </span>
                <span className="text-slate-400 text-xs"> / month</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Official Meta WhatsApp Cloud API (1 Number)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Shared Team Inbox (Up to 3 Agents)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Conversational CRM & Deal Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Up to 2,500 Bulk Broadcasts / Month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard GST WhatsApp Invoices</span>
                </div>
              </div>
            </div>

            {onLaunchApp && (
              <button
                onClick={onLaunchApp}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Choose Starter
              </button>
            )}
          </div>

          {/* Tier 2: Professional (Featured) */}
          <div className="rounded-3xl bg-gradient-to-b from-[#091528] to-[#070B14] border-2 border-emerald-500 p-8 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow">
              MOST POPULAR
            </div>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Professional</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-slate-400 text-xs mt-1">The complete autonomous operating system for growth.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-white font-mono">
                  {billingCycle === 'annual' ? '₹7,999' : '₹9,999'}
                </span>
                <span className="text-slate-400 text-xs"> / month</span>
              </div>

              <div className="space-y-3 text-xs text-slate-200 mb-8">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Everything in Starter +</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Full Visual Drag-and-Drop Workflow Builder</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>WhatsApp Group Grabber & Extractor</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Field Ops & GPS Route Optimization</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Autonomous 24/7 AI Copilot & Knowledge Base</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Anti-Ban Throttling & Meta Wallet Manager</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Team Agents & Role Permissions</span>
                </div>
              </div>
            </div>

            {onLaunchApp && (
              <button
                onClick={onLaunchApp}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
            )}
          </div>

          {/* Tier 3: Enterprise */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-8 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <h3 className="text-xl font-bold text-white">Enterprise</h3>
              <p className="text-slate-400 text-xs mt-1">Multi-branch franchises, retail chains & large fleets.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-white font-mono">Custom</span>
                <span className="text-slate-400 text-xs"> / annual contract</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-Branch Federation & Centralized HQ Cockpit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multiple Meta WABAs & Dedicated Phone Numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom ERP, Tally, SAP & REST Webhook Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated Solutions Engineer & 99.99% SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>On-Premise / Private Cloud Deployment Options</span>
                </div>
              </div>
            </div>

            <a
              href="mailto:contact@qiyamventures.com?subject=Qiyam%20Business%20OS%20Enterprise%20Inquiry"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center font-semibold text-xs transition block cursor-pointer"
            >
              Contact Enterprise Sales
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm mt-2">Everything you need to know about setup, Meta compliance, and architecture.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Will using Qiyam Business OS risk my WhatsApp number being banned?',
              a: 'No. Qiyam Business OS connects exclusively through the official Meta WhatsApp Cloud API (Graph API v21.0), which is 100% compliant with Meta Business terms. We do not use unauthorized scraping, unofficial browser automation, or reverse-engineered protocols. Furthermore, our built-in Anti-Ban engine enforces warmup pacing, automatically manages STOP/UNSUBSCRIBE keywords, and maintains real-time suppression lists.',
            },
            {
              q: 'What is Dual-Workspace Coexistence mode?',
              a: 'If your business already uses another tool or CRM on WhatsApp, Qiyam can run alongside it! In Dual Mode, our webhook dispatcher mirrors events to your legacy endpoints and checks staff keyword rules (like clock-in, duty, shift) before processing customer workflows.',
            },
            {
              q: 'How does the WhatsApp Group Grabber work without violating privacy?',
              a: 'The Group Extractor connects using official QR pairing sessions directly authorized by your device. It scans public and private groups you legitimately administer or belong to, formats member contacts into standard E.164 phone numbers, and imports them into opt-in verified campaign lists.',
            },
            {
              q: 'Can we generate GST-compliant invoices and collect UPI payments?',
              a: 'Yes! Qiyam Business OS includes a full financial ledger with GST itemization, PDF invoice dispatch directly in the chat thread, and instant payment links for UPI, Google Pay, PhonePe, Razorpay, and Stripe. Receipts are auto-generated the second payment lands in your bank account.',
            },
            {
              q: 'How does the AI Assistant know my company pricing and services?',
              a: 'Our integrated RAG Knowledge Base allows you to upload or write custom SOPs, price lists, warranty policies, and service descriptions. The AI references these verified documents before responding, ensuring zero hallucination.',
            },
            {
              q: 'Can my field technicians use the system from their smartphones?',
              a: 'Absolutely. Technicians receive their job cards, customer addresses, and optimized GPS routing directly via WhatsApp or the mobile-responsive field portal. They can clock in, upload site photos, and mark jobs as completed on the move.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-white text-sm hover:text-emerald-400 transition cursor-pointer"
              >
                <span>{item.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL CALL TO ACTION ("THE POWER CLOSE") */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0B1528] to-slate-900 border border-emerald-500/40 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-2">
            Instant Deployment
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto">
            Ready to Run Your Entire Business on WhatsApp Autopilot?
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Join forward-thinking field services, clinics, real estate firms, and retail operators automating their sales, dispatch, and cash collections.
          </p>

          {/* Interactive Quick Phone Demo Box */}
          <div className="mt-8 max-w-md mx-auto">
            {demoSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Demo request received! A test WhatsApp workflow has been initiated.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (demoPhone.trim()) setDemoSubmitted(true);
                }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Enter your WhatsApp number..."
                    value={demoPhone}
                    onChange={(e) => setDemoPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition whitespace-nowrap cursor-pointer"
                >
                  Send Live Demo 🚀
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs">
            {onLaunchApp && (
              <button
                onClick={onLaunchApp}
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition shadow cursor-pointer flex items-center gap-2"
              >
                <span>Direct Access to App Cockpit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="mt-6 text-[11px] text-slate-400">
            Setup takes under 5 minutes • Official Meta Graph API v21.0 • Zero credit card required
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. COMPREHENSIVE FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/10 bg-[#050811] py-14 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">QIYAM BUSINESS OS</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed mb-4">
              The autonomous operating system powering high-velocity enterprises natively through official Meta WhatsApp Cloud API.
            </p>
            <div className="font-mono text-[11px] text-emerald-400">
              Graph API v21.0 • Calicut • Kochi • Dubai
            </div>
          </div>

          {/* Col 2: Modules */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Core Modules</h5>
            <ul className="space-y-2">
              <li><a href="#workflow-builder" className="hover:text-emerald-400 transition">Workflow Builder</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition">Team Shared Inbox</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition">Group Grabber</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition">Conversational CRM</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition">Route Optimization</a></li>
            </ul>
          </div>

          {/* Col 3: Operations & AI */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Intelligence</h5>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-emerald-400 transition">24/7 AI Copilot</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition">RAG Knowledge Base</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition">WhatsApp GST Invoicing</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition">Anti-Ban Suppression</a></li>
              <li><a href="#roi-calculator" className="hover:text-emerald-400 transition">ROI Calculator</a></li>
            </ul>
          </div>

          {/* Col 4: Platform & Compliance */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Compliance</h5>
            <ul className="space-y-2">
              <li className="text-slate-300">Meta WABA Certified</li>
              <li className="text-slate-300">End-to-End Encryption</li>
              <li className="text-slate-300">GDPR & DPDP Ready</li>
              <li className="text-slate-300">Automated Daily Backups</li>
              <li className="text-slate-300">Silent OTA Updates</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Qiyam Ventures Private Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Meta API Policy</span>
            {onLaunchApp && (
              <button
                onClick={onLaunchApp}
                className="text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Switch to Cockpit
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

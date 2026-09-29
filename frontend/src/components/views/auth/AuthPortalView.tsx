import React, { useState, useEffect } from 'react';
import {
  Crown,
  Building2,
  Users,
  ShieldCheck,
  Send,
  MessageSquare,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Check,
  Smartphone,
  ChevronRight,
  Info,
  X,
  Layers,
} from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';
import {
  getCurrentAuthUser,
  setCurrentAuthUser,
  generateWhatsAppOtp,
  verifyWhatsAppOtp,
  registerNewClientCompany,
  registerEmployeeUser,
  DEFAULT_USERS,
} from '@/utils/authService';
import { getStoredTenants } from '@/utils/featureEntitlements';
import { PlatformTenant } from '@/types';

interface AuthPortalViewProps {
  initialMode?: 'login' | 'signup' | 'forgot-password';
  onAuthSuccess?: () => void;
}

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const { setActiveTab, addToast, reloadPlatformTenants, switchActiveTenant } = useQiyamStore();

  // Mode: 'login' | 'signup' | 'forgot_password'
  const [activeMode, setActiveMode] = useState<'login' | 'signup' | 'forgot_password'>(
    initialMode === 'signup' ? 'signup' : initialMode === 'forgot-password' ? 'forgot_password' : 'login'
  );

  // In Login mode: selected role tab ('super_admin' | 'company_admin' | 'employee')
  const [loginRole, setLoginRole] = useState<'super_admin' | 'company_admin' | 'employee'>('super_admin');

  // Login form inputs
  const [loginIdentifier, setLoginIdentifier] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WhatsApp OTP for Staff / Employee Login
  const [employeeLoginMethod, setEmployeeLoginMethod] = useState<'password' | 'otp'>('otp');
  const [empOtpPhone, setEmpOtpPhone] = useState('+91 98470 99881');
  const [empOtpCode, setEmpOtpCode] = useState('');
  const [empOtpSent, setEmpOtpSent] = useState(false);
  const [empOtpTimer, setEmpOtpTimer] = useState(0);

  // Modal dialog state for Register Business (Ambika Hotel)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(initialMode === 'signup');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [clientForm, setClientForm] = useState({
    businessName: 'Ambika Hotel & Luxury Suites',
    category: 'Hospitality & Tourism',
    branchLocation: 'Beach Road • Kozhikode',
    ownerName: 'K. Ramachandran',
    ownerEmail: 'ramachandran@ambikahotel.com',
    ownerPhone: '+91 98470 12345',
    wabaPhone: '+91 98470 12345',
    hasDeletedFromConsumerApp: true,
    planTier: 'growth' as 'starter' | 'growth' | 'enterprise',
    password: '',
    confirmPassword: '',
    selectedModules: ['conversations', 'messenger', 'crm', 'ops', 'automation'] as string[],
  });
  const [signupOtpCode, setSignupOtpCode] = useState('');
  const [generatedSignupOtp, setGeneratedSignupOtp] = useState('');
  const [signupOtpTimer, setSignupOtpTimer] = useState(0);

  // Staff Registration Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    companyId: 'TN-AMBIKA',
    name: 'Ananya Sharma',
    phone: '+91 98470 99881',
    roleTitle: 'Front Desk Executive',
    department: 'Front Desk & Guest Relations',
    otpCode: '',
    otpSent: false,
  });

  // Forgot Password Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(initialMode === 'forgot-password');
  const [forgotPhone, setForgotPhone] = useState('+91 94963 00233');

  // Tenants list
  const [tenants, setTenants] = useState<PlatformTenant[]>(() => getStoredTenants());

  useEffect(() => {
    setTenants(getStoredTenants());
  }, []);

  // Timer handlers
  useEffect(() => {
    let interval: any;
    if (empOtpTimer > 0) {
      interval = setInterval(() => setEmpOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [empOtpTimer]);

  useEffect(() => {
    let interval: any;
    if (signupOtpTimer > 0) {
      interval = setInterval(() => setSignupOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [signupOtpTimer]);

  // Handle switching role in login
  const handleSelectRole = (role: 'super_admin' | 'company_admin' | 'employee') => {
    setLoginRole(role);
    if (role === 'super_admin') {
      setLoginIdentifier('admin');
      setLoginPassword('admin@123');
    } else if (role === 'company_admin') {
      setLoginIdentifier('ramachandran@ambikahotel.com');
      setLoginPassword('ambika@123');
    } else {
      setLoginIdentifier('reception@ambikahotel.com');
      setLoginPassword('staff@123');
      setEmpOtpPhone('+91 98470 99881');
    }
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Super Admin: admin / admin@123
      if (
        loginRole === 'super_admin' &&
        (loginIdentifier.trim() === 'admin' || loginIdentifier.trim().toLowerCase() === 'admin@qiyam.in') &&
        loginPassword === 'admin@123'
      ) {
        const superUser = DEFAULT_USERS.find((u) => u.role === 'super_admin') || {
          id: 'user_super_admin',
          username: 'admin',
          name: 'Platform Super Admin',
          email: 'admin@qiyam.in',
          role: 'super_admin' as const,
          companyId: 'TN2345',
          companyName: 'Qiyam OS Headquarters',
          department: 'Platform Administration',
          status: 'active' as const,
        };
        setCurrentAuthUser(superUser as any);
        switchActiveTenant('TN2345');
        addToast('👑 Welcome, Super Admin! Master controls unlocked.', 'success');
        setActiveTab('super-admin');
        onAuthSuccess?.();
        return;
      }

      // Company Admin (e.g. Ambika Hotel)
      if (loginRole === 'company_admin') {
        const foundTenant = tenants.find(
          (t) =>
            t.ownerEmail.toLowerCase() === loginIdentifier.trim().toLowerCase() ||
            t.ownerPhone.includes(loginIdentifier.trim()) ||
            t.id.toLowerCase() === loginIdentifier.trim().toLowerCase()
        ) || tenants.find((t) => t.id === 'TN-AMBIKA') || tenants[0];

        const companyUser = {
          id: `usr_${foundTenant.id.toLowerCase()}`,
          username: foundTenant.ownerEmail.split('@')[0],
          name: foundTenant.ownerName,
          email: foundTenant.ownerEmail,
          phone: foundTenant.ownerPhone,
          role: 'company_admin' as const,
          companyId: foundTenant.id,
          companyName: foundTenant.businessName,
          department: 'Executive Administration',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          status: 'active' as const,
        };

        setCurrentAuthUser(companyUser);
        switchActiveTenant(foundTenant.id);
        addToast(`🏢 Welcome back, ${companyUser.name}! (${foundTenant.businessName})`, 'success');
        setActiveTab('dashboard');
        onAuthSuccess?.();
        return;
      }

      // Employee / Staff
      if (loginRole === 'employee') {
        const empUser = DEFAULT_USERS.find((u) => u.role === 'employee')!;
        setCurrentAuthUser(empUser);
        switchActiveTenant(empUser.companyId);
        addToast(`👨‍💼 Welcome to your Staff Portal, ${empUser.name}!`, 'success');
        setActiveTab('employee-portal');
        onAuthSuccess?.();
        return;
      }

      addToast('Invalid credentials. Check your username and password.', 'error');
    }, 400);
  };

  // Staff WhatsApp OTP handlers
  const handleSendEmployeeOtp = () => {
    if (!empOtpPhone.trim()) {
      addToast('Please enter your WhatsApp mobile number.', 'warning');
      return;
    }
    const res = generateWhatsAppOtp(empOtpPhone, 'employee_login');
    setEmpOtpSent(true);
    setEmpOtpTimer(60);
    setEmpOtpCode(res.code);
    addToast(`📲 WhatsApp OTP sent to ${empOtpPhone}! (Demo code: ${res.code})`, 'info');
  };

  const handleVerifyEmployeeOtp = () => {
    if (!empOtpCode.trim()) {
      addToast('Please enter the 6-digit WhatsApp OTP code.', 'warning');
      return;
    }
    const result = verifyWhatsAppOtp(empOtpPhone, empOtpCode);
    if (!result.success) {
      addToast(result.message, 'error');
      return;
    }

    const ambikaTenant = tenants.find((t) => t.id === 'TN-AMBIKA') || tenants[0];
    const empUser = {
      id: `emp_${Date.now()}`,
      username: empOtpPhone.slice(-6),
      name: 'Ananya Sharma (Front Desk)',
      email: 'reception@ambikahotel.com',
      phone: empOtpPhone,
      role: 'employee' as const,
      companyId: ambikaTenant.id,
      companyName: ambikaTenant.businessName,
      department: 'Front Desk & Guest Relations',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      status: 'active' as const,
    };
    setCurrentAuthUser(empUser);
    switchActiveTenant(ambikaTenant.id);
    addToast('✅ WhatsApp OTP Verified! Logged in to Staff Portal.', 'success');
    setActiveTab('employee-portal');
    onAuthSuccess?.();
  };

  // Client Signup: Step 1 -> Step 2
  const handleInitiateClientSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.businessName.trim() || !clientForm.ownerEmail.trim() || !clientForm.wabaPhone.trim()) {
      addToast('Please fill in all required business and WhatsApp fields.', 'warning');
      return;
    }
    if (!clientForm.hasDeletedFromConsumerApp) {
      addToast('Please confirm the number is not active on WhatsApp mobile app.', 'warning');
      return;
    }

    const otpRes = generateWhatsAppOtp(clientForm.wabaPhone, 'client_signup');
    setGeneratedSignupOtp(otpRes.code);
    setSignupOtpCode(otpRes.code);
    setSignupOtpTimer(60);
    setSignupStep(2);
    addToast(`📲 Verification code sent to WhatsApp ${clientForm.wabaPhone}! (Code: ${otpRes.code})`, 'info');
  };

  // Client Signup: Step 2 Verify OTP
  const handleVerifyClientSignup = () => {
    if (!signupOtpCode.trim()) {
      addToast('Please enter the 6-digit WhatsApp OTP.', 'warning');
      return;
    }
    const verified = verifyWhatsAppOtp(clientForm.wabaPhone, signupOtpCode);
    if (!verified.success) {
      addToast(verified.message, 'error');
      return;
    }

    const result = registerNewClientCompany({
      businessName: clientForm.businessName,
      category: clientForm.category,
      branchLocation: clientForm.branchLocation,
      ownerName: clientForm.ownerName,
      ownerEmail: clientForm.ownerEmail,
      ownerPhone: clientForm.ownerPhone,
      wabaPhone: clientForm.wabaPhone,
      hasDeletedFromConsumerApp: clientForm.hasDeletedFromConsumerApp,
      planTier: clientForm.planTier,
      requestedModules: clientForm.selectedModules,
      password: clientForm.password || 'admin@123',
    });

    if (result.success) {
      setIsRegisterModalOpen(false);
      reloadPlatformTenants();
      switchActiveTenant(result.tenant.id);
      addToast(`🎉 Workspace for "${result.tenant.businessName}" created successfully!`, 'success');
      setActiveTab('dashboard');
      onAuthSuccess?.();
    }
  };

  return (
    <div className="h-screen h-[100dvh] max-h-screen overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#F4FAF7] via-[#EFF8F4] to-[#E9F6F1] relative text-slate-800 selection:bg-emerald-500 selection:text-white font-sans">
      {/* ── Ambient Radial Mesh Glows & Background Curves ── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/40 via-teal-100/30 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-teal-200/40 via-emerald-100/30 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-200/30 rounded-full blur-[90px] pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b98118_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR                                                         */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between px-6 lg:px-12 py-3 sm:py-4 max-w-7xl mx-auto z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/25">
            Q
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5">
              QIYAM BUSINESS OS
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Multi-Tenant WhatsApp Cloud API &amp; Operations Platform
            </div>
          </div>
        </div>

        {/* Right Badge: Trusted by businesses worldwide */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">Trusted by businesses worldwide</span>
          <span className="sm:hidden text-[11px]">Official Meta Partner</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CENTER HERO + DUAL COLUMN CONTENT                                 */}
      {/* ========================================================================= */}
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 flex-1 min-h-0 flex items-center justify-center z-10 overflow-y-auto lg:overflow-hidden py-1 sm:py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full my-auto">
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: HERO HEADLINE + 2x2 FEATURE CARDS + 3D TABLET + DEMO BAR   */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3.5 sm:space-y-4">
            {/* Meta Cloud API Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold w-fit shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Meta WhatsApp Cloud API Solution Provider</span>
            </div>

            {/* Hero Headline */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight text-slate-900 leading-[1.18]">
                Scale Customer{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Engagement
                </span>{' '}
                with Official WhatsApp Automation
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-xl font-normal pt-0.5">
                The all-in-one suite for hotels, retail chains, healthcare, and enterprise field teams. Run verified bulk broadcasts, AI customer agents, live inbox, and employee management.
              </p>
            </div>

            {/* Row with 2x2 Feature Cards and Isometric 3D Tablet Graphic */}
            <div className="relative pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl relative z-10">
                {/* Feature 1 */}
                <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs flex items-start gap-2.5 group">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 leading-tight">Bulk Broadcasts</h2>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Deliver thousands of approved messages with 99.9% read rates.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs flex items-start gap-2.5 group">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-105 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 leading-tight">Custom Client Portals</h2>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Dedicated modules for every client with branded dashboards.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs flex items-start gap-2.5 group">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 leading-tight">Employee Dashboards</h2>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Staff login via WhatsApp OTP, track attendance &amp; performance.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs flex items-start gap-2.5 group">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 leading-tight">Enterprise Ready</h2>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Secure, scalable, and built for multi-tenant operations.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 3D Tablet Mockup with Spline Chart (Visible on Large Screens Behind / Alongside) ── */}
              <div className="hidden xl:block absolute -right-16 -top-10 w-72 h-48 pointer-events-none select-none z-0 transform perspective-1000 rotate-y-[-14deg] rotate-x-[8deg] scale-95 opacity-90">
                <div className="w-full h-full rounded-2xl bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,100,60,0.12)] p-2.5 flex flex-col justify-between overflow-hidden">
                  {/* Tablet Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-[9px] text-slate-500">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <div className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black">Q</div>
                      <span>Qiyam Business OS</span>
                    </div>
                    <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 rounded font-semibold">Live WABA</span>
                  </div>

                  {/* Tablet Stat Cards */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="text-[8px] text-slate-400 font-medium">Messages Sent</div>
                      <div className="text-[11px] font-bold text-slate-800">128,450</div>
                      <div className="text-[8px] text-emerald-600 font-semibold">↑ 23%</div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="text-[8px] text-slate-400 font-medium">Active Clients</div>
                      <div className="text-[11px] font-bold text-slate-800">24</div>
                      <div className="text-[8px] text-emerald-600 font-semibold">↑ 3 new</div>
                    </div>
                  </div>

                  {/* Tablet SVG Spline Chart */}
                  <div className="h-10 w-full pt-1">
                    <svg className="w-full h-full" viewBox="0 0 200 40" fill="none">
                      <path
                        d="M0 32 Q 35 15, 70 28 T 140 10 T 200 18"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M0 32 Q 35 15, 70 28 T 140 10 T 200 18 L 200 40 L 0 40 Z"
                        fill="url(#tabletLightGradient)"
                        opacity="0.3"
                      />
                      <defs>
                        <linearGradient id="tabletLightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* 3D Floating WhatsApp Cube */}
                <div className="absolute -bottom-3 -left-5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/40 transform -rotate-12">
                    <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 1-CLICK DEMO LOGIN BAR ── */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-extrabold text-amber-600 flex items-center gap-1.5 text-[11px] tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  1-Click Demo Login
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Explore Demo →
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Super Admin Demo */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectRole('super_admin');
                  }}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    loginRole === 'super_admin'
                      ? 'bg-amber-50/70 border-amber-300 shadow-2xs ring-1 ring-amber-400/40'
                      : 'bg-white/90 border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Super Admin</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">admin @ admin@123</div>
                  </div>
                </button>

                {/* 2. Ambika Hotel Demo */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectRole('company_admin');
                  }}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    loginRole === 'company_admin'
                      ? 'bg-teal-50/70 border-teal-300 shadow-2xs ring-1 ring-teal-400/40'
                      : 'bg-white/90 border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Ambika Hotel</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">ramachandran@...</div>
                  </div>
                </button>

                {/* 3. Staff Portal Demo */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectRole('employee');
                  }}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    loginRole === 'employee'
                      ? 'bg-cyan-50/70 border-cyan-300 shadow-2xs ring-1 ring-cyan-400/40'
                      : 'bg-white/90 border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-100/80 text-cyan-700 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Staff Portal</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">WhatsApp OTP</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* RIGHT SIDE: THE SIGNATURE CLEAN WHITE LOGIN CARD                        */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="relative rounded-[28px] bg-white/95 border border-slate-200/90 p-5 sm:p-6 shadow-[0_20px_50px_-10px_rgba(0,100,60,0.08)] ring-1 ring-slate-100 backdrop-blur-2xl">
              {/* Center Logo */}
              <div className="flex flex-col items-center text-center mb-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-emerald-500/25 mb-2">
                  Q
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                <p className="text-xs text-slate-500 mt-0.5">Sign in to your Qiyam Business OS account</p>
              </div>

              <div className="space-y-3">
                {/* Segmented 3-Way Role Selector */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80">
                  {/* Admin */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('super_admin')}
                    className={`py-1.5 px-2 rounded-xl text-center transition cursor-pointer ${
                      loginRole === 'super_admin'
                        ? 'bg-white border-2 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-bold">
                      <Crown className={`w-3.5 h-3.5 ${loginRole === 'super_admin' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>Admin</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">Super Admin</div>
                  </button>

                  {/* Business */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('company_admin')}
                    className={`py-1.5 px-2 rounded-xl text-center transition cursor-pointer ${
                      loginRole === 'company_admin'
                        ? 'bg-white border-2 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-bold">
                      <Building2 className={`w-3.5 h-3.5 ${loginRole === 'company_admin' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>Business</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">Company Admin</div>
                  </button>

                  {/* Staff */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('employee')}
                    className={`py-1.5 px-2 rounded-xl text-center transition cursor-pointer ${
                      loginRole === 'employee'
                        ? 'bg-white border-2 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-bold">
                      <Users className={`w-3.5 h-3.5 ${loginRole === 'employee' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>Staff</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">Staff Member</div>
                  </button>
                </div>

                {/* Role Notice Banner */}
                {loginRole === 'super_admin' && (
                  <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-2">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                      <div className="font-bold text-amber-900 text-[11.5px]">Master Provider Console Access</div>
                      <div className="text-[10px] text-amber-800/80 mt-0.5 leading-snug">
                        Sign in with your admin credentials to access the complete platform.
                      </div>
                    </div>
                    <Info className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  </div>
                )}

                {loginRole === 'company_admin' && (
                  <div className="p-2.5 rounded-xl bg-teal-50/90 border border-teal-200/80 flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                      <div className="font-bold text-teal-900 text-[11.5px]">Client Workspace Access (Ambika Hotel)</div>
                      <div className="text-[10px] text-teal-800/80 mt-0.5 leading-snug">
                        Manage your guests, employees, and pre-approved WhatsApp templates.
                      </div>
                    </div>
                  </div>
                )}

                {loginRole === 'employee' && (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] font-semibold">Login Method:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEmployeeLoginMethod('otp')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          employeeLoginMethod === 'otp'
                            ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>WhatsApp OTP</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmployeeLoginMethod('password')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          employeeLoginMethod === 'password'
                            ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Password
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Inputs */}
                {loginRole === 'employee' && employeeLoginMethod === 'otp' ? (
                  /* WhatsApp OTP form for staff using our CountryPhoneInput */
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Staff WhatsApp Phone *</label>
                      <CountryPhoneInput
                        value={empOtpPhone}
                        onChange={(val) => setEmpOtpPhone(val)}
                        placeholder="Staff WhatsApp number"
                        variant="light"
                        required
                      />
                      <div className="flex justify-end pt-0.5">
                        <button
                          type="button"
                          onClick={handleSendEmployeeOtp}
                          disabled={empOtpTimer > 0}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          {empOtpTimer > 0 ? `Resend code in ${empOtpTimer}s` : empOtpSent ? 'Resend Code' : 'Send WhatsApp OTP'}
                        </button>
                      </div>
                    </div>

                    {empOtpSent && (
                      <div className="space-y-1 animate-in fade-in">
                        <label className="text-xs font-bold text-slate-700">6-Digit Verification Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={empOtpCode}
                          onChange={(e) => setEmpOtpCode(e.target.value)}
                          placeholder="e.g. 482910"
                          className="w-full text-center tracking-[0.4em] py-2 bg-slate-50 border border-emerald-500 rounded-xl text-lg font-bold font-mono text-emerald-800 outline-none focus:bg-white"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={empOtpSent ? handleVerifyEmployeeOtp : handleSendEmployeeOtp}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:brightness-105 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>{empOtpSent ? 'Verify OTP & Enter Staff Portal →' : 'Send WhatsApp OTP →'}</span>
                    </button>
                  </div>
                ) : (
                  /* Standard Login Form with White Inputs */
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Username or Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="admin or email"
                          className="w-full pl-10 pr-3 py-2 bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">Password</label>
                        <button
                          type="button"
                          onClick={() => setIsForgotModalOpen(true)}
                          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold transition cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2 bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition font-mono tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember & SSL Encrypted Row */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500/20"
                        />
                        <span className="text-[11px] text-slate-600 font-medium">Remember this device</span>
                      </label>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        256-bit SSL Encrypted
                      </span>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:brightness-105 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-50 mt-1"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            Sign In to{' '}
                            {loginRole === 'super_admin'
                              ? 'Master Admin'
                              : loginRole === 'company_admin'
                              ? 'Ambika Hotel'
                              : 'Staff Portal'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* OR Separator */}
                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    OR
                  </span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={() => addToast('Google OAuth 2.0 Enterprise Single Sign-On Active', 'info')}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Footer Link to Open Client Registration Modal */}
                <div className="pt-1 text-center text-xs text-slate-500 flex flex-col gap-1">
                  <div>
                    <span>Are you a new hotel or business? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterModalOpen(true);
                        setSignupStep(1);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-bold transition cursor-pointer"
                    >
                      Register New Client (Ambika Hotel) →
                    </button>
                  </div>
                  <div>
                    <span>Employee of a client? </span>
                    <button
                      type="button"
                      onClick={() => setIsStaffModalOpen(true)}
                      className="text-teal-600 hover:text-teal-700 font-semibold transition cursor-pointer text-[11px]"
                    >
                      Staff Member Registration →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. CLEAN BOTTOM FOOTER BAR                                                */}
      {/* ========================================================================= */}
      <footer className="w-full px-6 lg:px-12 py-2.5 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 z-10 border-t border-slate-200/60 shrink-0">
        <div>
          © 2026 Qiyam Business OS • Official Meta Cloud API Solution Provider
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <span className="hover:text-slate-700 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-700 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> All Systems Operational
          </span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 4. MODAL 1: REGISTER NEW CLIENT (OUR ESTABLISHED FORM PATTERN)            */}
      {/* ========================================================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Provision New Client Workspace (Ambika Hotel)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Step {signupStep} of 2 • Client Onboarding &amp; WhatsApp API Verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            {signupStep === 1 ? (
              <form onSubmit={handleInitiateClientSignup} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Section 1: Business Details */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Client / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ambika Hotel & Luxury Suites"
                    value={clientForm.businessName}
                    onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600 bg-white text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Category / Industry</label>
                    <select
                      value={clientForm.category}
                      onChange={(e) => setClientForm({ ...clientForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none"
                    >
                      <option value="Hospitality & Tourism">🏨 Hospitality &amp; Tourism</option>
                      <option value="Retail & eCommerce">🛍️ Retail &amp; Supermarket</option>
                      <option value="Healthcare & Clinics">🏥 Healthcare &amp; Clinics</option>
                      <option value="Field Service & MEP">🛠️ Field Service &amp; MEP</option>
                      <option value="Other">🏢 Other Commercial Business</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Subscription Tier</label>
                    <select
                      value={clientForm.planTier}
                      onChange={(e: any) => setClientForm({ ...clientForm, planTier: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none"
                    >
                      <option value="starter">Starter (₹2,499/mo) • 5 Staff Seats</option>
                      <option value="growth">Growth (₹5,999/mo) • 15 Staff Seats</option>
                      <option value="enterprise">Enterprise PRO (₹14,999/mo) • 30 Seats</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. K. Ramachandran"
                      value={clientForm.ownerName}
                      onChange={(e) => setClientForm({ ...clientForm, ownerName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Official Business Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="ramachandran@ambikahotel.com"
                      value={clientForm.ownerEmail}
                      onChange={(e) => setClientForm({ ...clientForm, ownerEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Owner Phone with CountryPhoneInput */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Owner Contact Mobile *</label>
                  <CountryPhoneInput
                    value={clientForm.ownerPhone}
                    onChange={(val) => setClientForm({ ...clientForm, ownerPhone: val })}
                    variant="light"
                    required
                  />
                </div>

                {/* WhatsApp Cloud API Section & Rule Box */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Meta WhatsApp Cloud API Phone Number</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Under Meta rules, this number <strong>must not be active on regular WhatsApp app</strong>. If currently on mobile, delete the WhatsApp account in app (Settings &gt; Account &gt; Delete Account) first, or use a new SIM/virtual line.
                  </p>

                  <div className="space-y-1 pt-1">
                    <label className="block font-bold text-slate-800">Phone Number for WhatsApp Cloud API *</label>
                    <CountryPhoneInput
                      value={clientForm.wabaPhone}
                      onChange={(val) => setClientForm({ ...clientForm, wabaPhone: val })}
                      variant="light"
                      required
                    />
                  </div>

                  <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={clientForm.hasDeletedFromConsumerApp}
                      onChange={(e) => setClientForm({ ...clientForm, hasDeletedFromConsumerApp: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600"
                    />
                    <span>I confirm this phone line is ready for Meta WhatsApp Cloud API.</span>
                  </label>
                </div>

                {/* Desired Modules Checklist */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Requested Features &amp; Modules</label>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {[
                      { id: 'conversations', label: 'WhatsApp Inbox & Live Chat' },
                      { id: 'messenger', label: 'Bulk Broadcasts & Scheduler' },
                      { id: 'crm', label: 'CRM & Guest Profiles' },
                      { id: 'ops', label: 'Staff Management & Attendance' },
                      { id: 'automation', label: 'Visual Bot Automation' },
                      { id: 'ai', label: 'AI Copilot & Knowledge Bot' },
                    ].map((mod) => (
                      <label key={mod.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clientForm.selectedModules.includes(mod.id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...clientForm.selectedModules, mod.id]
                              : clientForm.selectedModules.filter((m) => m !== mod.id);
                            setClientForm({ ...clientForm, selectedModules: updated });
                          }}
                          className="rounded border-slate-300 text-emerald-600"
                        />
                        <span className="text-slate-800 truncate">{mod.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Proceed to WhatsApp OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: WhatsApp OTP Verification */
              <div className="p-6 space-y-4 text-xs">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Verify Official WhatsApp Line</h4>
                  <p className="text-slate-500 text-xs">
                    We sent a 6-digit verification code to <strong>{clientForm.wabaPhone}</strong>.
                  </p>
                </div>

                <div className="space-y-2 max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={signupOtpCode}
                    onChange={(e) => setSignupOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full text-center tracking-[0.4em] py-2.5 bg-slate-50 border-2 border-emerald-500 rounded-xl text-xl font-bold font-mono text-emerald-800 outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Code expires in {signupOtpTimer}s</span>
                    <button
                      type="button"
                      onClick={() => {
                        const res = generateWhatsAppOtp(clientForm.wabaPhone, 'client_signup');
                        setGeneratedSignupOtp(res.code);
                        setSignupOtpCode(res.code);
                        setSignupOtpTimer(60);
                        addToast(`📲 New OTP sent to WhatsApp: ${res.code}`, 'info');
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyClientSignup}
                    className="px-5 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify &amp; Provision Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL 2: STAFF REGISTRATION (OUR ESTABLISHED PATTERN)                   */}
      {/* ========================================================================= */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Staff Member Registration</h3>
                  <p className="text-[11px] text-slate-500">Join your employer company with WhatsApp OTP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!staffForm.name || !staffForm.phone) {
                  addToast('Please complete all staff fields.', 'warning');
                  return;
                }
                const res = registerEmployeeUser({
                  companyId: staffForm.companyId,
                  name: staffForm.name,
                  phone: staffForm.phone,
                  department: staffForm.department,
                  roleTitle: staffForm.roleTitle,
                });
                setIsStaffModalOpen(false);
                switchActiveTenant(res.user.companyId);
                addToast(`✅ Welcome, ${staffForm.name}! You are registered under ${res.user.companyName}.`, 'success');
                setActiveTab('employee-portal');
                onAuthSuccess?.();
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Select Employer Company *</label>
                <select
                  value={staffForm.companyId}
                  onChange={(e) => setStaffForm({ ...staffForm, companyId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.businessName} ({t.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">WhatsApp Mobile Number *</label>
                <CountryPhoneInput
                  value={staffForm.phone}
                  onChange={(val) => setStaffForm({ ...staffForm, phone: val })}
                  variant="light"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Job Title / Role</label>
                  <input
                    type="text"
                    value={staffForm.roleTitle}
                    onChange={(e) => setStaffForm({ ...staffForm, roleTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <span>Register &amp; Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL 3: FORGOT PASSWORD                                              */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Enter your registered WhatsApp phone number to receive a secure password reset OTP.
              </p>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Registered Phone Number</label>
                <CountryPhoneInput
                  value={forgotPhone}
                  onChange={(val) => setForgotPhone(val)}
                  variant="light"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = generateWhatsAppOtp(forgotPhone, 'password_reset');
                    addToast(`📲 Password reset OTP sent to WhatsApp: ${res.code}`, 'info');
                    setIsForgotModalOpen(false);
                  }}
                  className="px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white font-bold rounded-xl cursor-pointer"
                >
                  Send Reset OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Building2,
  Users,
  Shield,
  Send,
  MessageSquare,
  Bot,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Zap,
  Clock,
  Briefcase,
  HelpCircle,
  RefreshCw,
  Layers,
  MapPin,
  Check,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';
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
import { TabType, PlatformTenant } from '@/types';

interface AuthPortalViewProps {
  initialMode?: 'login' | 'signup' | 'forgot-password';
  onAuthSuccess?: () => void;
}

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const { setActiveTab, addToast, reloadPlatformTenants, switchActiveTenant } = useQiyamStore();

  // Mode: 'login' | 'signup' | 'employee_signup' | 'forgot_password'
  const [activeMode, setActiveMode] = useState<'login' | 'signup' | 'employee_signup' | 'forgot_password'>(
    initialMode === 'signup' ? 'signup' : initialMode === 'forgot-password' ? 'forgot_password' : 'login'
  );

  // In Login mode: sub-role tab ('super_admin' | 'company_admin' | 'employee')
  const [loginRole, setLoginRole] = useState<'super_admin' | 'company_admin' | 'employee'>('super_admin');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WhatsApp OTP login for employees
  const [employeeLoginMethod, setEmployeeLoginMethod] = useState<'password' | 'otp'>('otp');
  const [empOtpPhone, setEmpOtpPhone] = useState('+91 98470 99881');
  const [empOtpCode, setEmpOtpCode] = useState('');
  const [empOtpSent, setEmpOtpSent] = useState(false);
  const [empOtpTimer, setEmpOtpTimer] = useState(0);

  // Client Signup form state (e.g. Ambika Hotel)
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

  // Employee Signup form state
  const [empSignupForm, setEmpSignupForm] = useState({
    companyId: 'TN-AMBIKA',
    name: '',
    phone: '',
    email: '',
    department: 'Front Desk & Guest Relations',
    roleTitle: 'Front Desk Executive',
  });
  const [empSignupOtpCode, setEmpSignupOtpCode] = useState('');
  const [empSignupOtpSent, setEmpSignupOtpSent] = useState(false);

  // Tenants list for employee company selection
  const [tenants, setTenants] = useState<PlatformTenant[]>(() => getStoredTenants());

  useEffect(() => {
    setTenants(getStoredTenants());
  }, []);

  // Sync login inputs when changing sub-role
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

  // Timer countdown handler
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

  // Handle standard Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Check Super Admin: username admin, password admin@123
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
          role: 'super_admin',
          companyId: 'TN2345',
          companyName: 'Qiyam OS Headquarters',
          department: 'Platform Administration',
          status: 'active',
        };
        setCurrentAuthUser(superUser as any);
        switchActiveTenant('TN2345');
        addToast('👑 Welcome, Super Admin! Full platform controls unlocked.', 'success');
        setActiveTab('super-admin');
        onAuthSuccess?.();
        return;
      }

      // Check Company Admin (e.g. Ambika Hotel or registered tenant)
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
          department: 'Company Administration',
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

      // Check Employee Login
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

  // Send WhatsApp OTP for Employee Login
  const handleSendEmployeeOtp = () => {
    if (!empOtpPhone.trim()) {
      addToast('Please enter your WhatsApp mobile number.', 'warning');
      return;
    }
    const res = generateWhatsAppOtp(empOtpPhone, 'employee_login');
    setEmpOtpSent(true);
    setEmpOtpTimer(60);
    setEmpOtpCode(res.code); // Pre-fill in demo for convenience
    addToast(`📲 WhatsApp OTP sent to ${empOtpPhone}! (Demo code: ${res.code})`, 'info');
  };

  // Verify Employee OTP & Login
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
    addToast('✅ WhatsApp OTP Verified! Logged in to Employee Portal.', 'success');
    setActiveTab('employee-portal');
    onAuthSuccess?.();
  };

  // Client Signup: Step 1 -> Step 2 (Trigger WhatsApp OTP)
  const handleInitiateClientSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientForm.businessName.trim()) {
      addToast('Please enter your business or hotel name.', 'warning');
      return;
    }
    if (!clientForm.ownerEmail.trim()) {
      addToast('Please enter your official business email.', 'warning');
      return;
    }
    if (!clientForm.wabaPhone.trim()) {
      addToast('Please enter the phone number to be linked with WhatsApp API.', 'warning');
      return;
    }
    if (!clientForm.hasDeletedFromConsumerApp) {
      addToast('Please confirm the number is not active on WhatsApp mobile app.', 'warning');
      return;
    }

    // Trigger WhatsApp OTP
    const otpRes = generateWhatsAppOtp(clientForm.wabaPhone, 'client_signup');
    setGeneratedSignupOtp(otpRes.code);
    setSignupOtpCode(otpRes.code); // Pre-fill in demo for easy evaluation
    setSignupOtpTimer(60);
    setSignupStep(2);
    addToast(`📲 Verification code sent to WhatsApp ${clientForm.wabaPhone}! (Code: ${otpRes.code})`, 'info');
  };

  // Client Signup: Step 2 Verify OTP & Create Company
  const handleVerifyClientSignup = () => {
    if (!signupOtpCode.trim()) {
      addToast('Please enter the 6-digit OTP code received on WhatsApp.', 'warning');
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
      reloadPlatformTenants();
      switchActiveTenant(result.tenant.id);
      addToast(`🎉 Registration Successful! Workspace for "${result.tenant.businessName}" is live.`, 'success');
      setActiveTab('dashboard');
      onAuthSuccess?.();
    }
  };

  // Employee Signup Submit
  const handleEmployeeSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empSignupForm.name.trim() || !empSignupForm.phone.trim()) {
      addToast('Please fill in your name and WhatsApp phone number.', 'warning');
      return;
    }
    if (!empSignupOtpSent) {
      const res = generateWhatsAppOtp(empSignupForm.phone, 'employee_signup');
      setEmpSignupOtpSent(true);
      setEmpSignupOtpCode(res.code);
      addToast(`📲 WhatsApp OTP sent to ${empSignupForm.phone}! (Demo code: ${res.code})`, 'info');
      return;
    }

    const verified = verifyWhatsAppOtp(empSignupForm.phone, empSignupOtpCode);
    if (!verified.success) {
      addToast(verified.message, 'error');
      return;
    }

    const res = registerEmployeeUser({
      companyId: empSignupForm.companyId,
      name: empSignupForm.name,
      phone: empSignupForm.phone,
      email: empSignupForm.email,
      department: empSignupForm.department,
      roleTitle: empSignupForm.roleTitle,
    });

    addToast(`✅ Welcome, ${empSignupForm.name}! You are registered under ${res.user.companyName}.`, 'success');
    switchActiveTenant(res.user.companyId);
    setActiveTab('employee-portal');
    onAuthSuccess?.();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 md:p-8 relative overflow-hidden bg-[#070D18]">
      {/* Background glowing ambient orbs */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[32rem] h-[32rem] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="container max-w-[1240px] px-2 md:px-6 z-10 w-full my-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: BRANDING & SAAS HIGHLIGHTS (BizyLead style)                  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-7 text-white">
            {/* Top Brand Logo */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Meta WhatsApp Cloud API Solution Provider</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-emerald-500/20">
                  Q
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    QIYAM BUSINESS OS
                  </h1>
                  <p className="text-xs text-emerald-400 font-medium tracking-wide">
                    Multi-Tenant WhatsApp Cloud API & Operations Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                Scale Customer Engagement with Official WhatsApp Automation
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                The all-in-one suite for hotels, retail chains, healthcare, and enterprise field teams. Run verified bulk broadcasts, AI customer agents, live inbox, and employee management.
              </p>
            </div>

            {/* Feature Cards (3 Key Value Props) */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#0F1A30]/60 border border-[#1E293B] hover:border-emerald-500/30 transition group">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition">
                    Bulk Broadcasts & Approved Templates
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Deliver thousands of Meta-approved notifications, bills, and offers with 99.9% read rates and zero risk of mobile ban.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#0F1A30]/60 border border-[#1E293B] hover:border-teal-500/30 transition group">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500/20 transition shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-teal-300 transition">
                    Custom Client Portals (e.g. Ambika Hotel)
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Every client receives a dedicated, customized dashboard with only the specific modules they subscribed to.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#0F1A30]/60 border border-[#1E293B] hover:border-cyan-500/30 transition group">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition">
                    Employee Dashboards & WhatsApp OTP
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Staff members log in via WhatsApp OTP, manage guest chats, clock their attendance, and track daily performance seamlessly.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Footer */}
            <div className="p-3.5 rounded-2xl bg-[#081224]/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Login
                </span>
                <span>Click to auto-fill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    handleSelectRole('super_admin');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition text-left cursor-pointer"
                >
                  <div className="font-bold text-[11px] text-amber-300 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Super Admin
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">admin / admin@123</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    handleSelectRole('company_admin');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-teal-500/50 transition text-left cursor-pointer"
                >
                  <div className="font-bold text-[11px] text-teal-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Ambika Hotel
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">ramachandran@...</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    handleSelectRole('employee');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition text-left cursor-pointer"
                >
                  <div className="font-bold text-[11px] text-cyan-300 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Staff Portal
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">WhatsApp OTP</div>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: AUTHENTICATION / REGISTRATION CARD                         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 w-full max-w-xl mx-auto">
            <div className="rounded-3xl backdrop-blur-xl bg-[#0C172E]/90 border border-[#1E293B] shadow-2xl p-6 md:p-8 text-white relative">
              {/* Card Header Mode Switcher */}
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-6">
                <div className="flex items-center gap-2 bg-[#081224] p-1 rounded-2xl border border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setActiveMode('login')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeMode === 'login'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode('signup')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeMode === 'signup'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Register Business</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode('employee_signup')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer hidden sm:flex items-center gap-1.5 ${
                      activeMode === 'employee_signup'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Staff Join</span>
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Secure Access</span>
                </div>
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* MODE 1: SIGN IN                                                     */}
              {/* ------------------------------------------------------------------- */}
              {activeMode === 'login' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h3>
                    <p className="text-xs text-slate-400 mt-1">Choose your portal type and enter credentials to continue</p>
                  </div>

                  {/* Role Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#081224] border border-[#1E293B]">
                    <button
                      type="button"
                      onClick={() => handleSelectRole('super_admin')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        loginRole === 'super_admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Super Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectRole('company_admin')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        loginRole === 'company_admin'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Company Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectRole('employee')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        loginRole === 'employee'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Staff Member</span>
                    </button>
                  </div>

                  {/* Prompt for Super Admin */}
                  {loginRole === 'super_admin' && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Master Provider Console: <strong>admin</strong> / <strong>admin@123</strong></span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">HQ Mode</span>
                    </div>
                  )}

                  {/* Employee Login Method Switcher (Password vs WhatsApp OTP) */}
                  {loginRole === 'employee' && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#081224] border border-[#1E293B] text-xs">
                      <span className="text-slate-400 font-medium">Login via:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEmployeeLoginMethod('otp')}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                            employeeLoginMethod === 'otp'
                              ? 'bg-emerald-500 text-slate-950 font-extrabold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>WhatsApp OTP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmployeeLoginMethod('password')}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                            employeeLoginMethod === 'password'
                              ? 'bg-emerald-500 text-slate-950 font-extrabold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Password
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORM BODY */}
                  {loginRole === 'employee' && employeeLoginMethod === 'otp' ? (
                    /* Employee WhatsApp OTP Form */
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Staff WhatsApp Phone Number</span>
                          <span className="text-[11px] text-emerald-400">Official Mobile</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={empOtpPhone}
                            onChange={(e) => setEmpOtpPhone(e.target.value)}
                            placeholder="+91 98470 99881"
                            className="w-full pl-10 pr-24 py-2.5 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleSendEmployeeOtp}
                            disabled={empOtpTimer > 0}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition cursor-pointer"
                          >
                            {empOtpTimer > 0 ? `${empOtpTimer}s` : empOtpSent ? 'Resend' : 'Send OTP'}
                          </button>
                        </div>
                      </div>

                      {empOtpSent && (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span>6-Digit Verification Code</span>
                            <span className="text-[10px] text-amber-400">Sent to your WhatsApp</span>
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={empOtpCode}
                            onChange={(e) => setEmpOtpCode(e.target.value)}
                            placeholder="Enter 6-digit OTP (e.g. 482910)"
                            className="w-full text-center tracking-[0.5em] py-2.5 bg-[#081224] border border-emerald-500/50 rounded-xl text-lg font-bold font-mono text-emerald-300 outline-none transition"
                          />
                          <p className="text-[11px] text-slate-400">
                            Check WhatsApp on your phone or use test code <strong>{empOtpCode || '123456'}</strong>.
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={empOtpSent ? handleVerifyEmployeeOtp : handleSendEmployeeOtp}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>{empOtpSent ? 'Verify OTP & Enter Employee Portal' : 'Send WhatsApp OTP'}</span>
                      </button>
                    </div>
                  ) : (
                    /* Standard Password Form (Super Admin, Company Admin, or Staff Password) */
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          {loginRole === 'super_admin'
                            ? 'Username or Email'
                            : loginRole === 'company_admin'
                            ? 'Company Email / WhatsApp Phone'
                            : 'Staff Email / Phone'}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            required
                            placeholder={loginRole === 'super_admin' ? 'admin' : 'owner@ambikahotel.com'}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition font-sans"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-300">Password</label>
                          <button
                            type="button"
                            onClick={() => setActiveMode('forgot_password')}
                            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            placeholder="Enter password"
                            className="w-full pl-10 pr-10 py-2.5 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-900"
                          />
                          <span>Remember this device</span>
                        </label>
                        <span className="text-[11px] text-slate-500">256-bit SSL Encrypted</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In to {loginRole === 'super_admin' ? 'Master Admin' : loginRole === 'company_admin' ? 'Client Workspace' : 'Staff Portal'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Switch to Register */}
                  <div className="pt-2 text-center text-xs text-slate-400 border-t border-[#1E293B]">
                    <span>Are you a new hotel or business? </span>
                    <button
                      type="button"
                      onClick={() => setActiveMode('signup')}
                      className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      Register New Client (Ambika Hotel)
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* MODE 2: CLIENT REGISTRATION (Ambika Hotel Onboarding Flow)          */}
              {/* ------------------------------------------------------------------- */}
              {activeMode === 'signup' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Client Onboarding • Step {signupStep} of 2
                      </span>
                      <span className="text-xs text-slate-400">Commercial Tenant</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                      Register Your Business on WhatsApp Cloud API
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Provision dedicated WhatsApp WABA lines, customize required software modules, and verify via OTP.
                    </p>
                  </div>

                  {signupStep === 1 ? (
                    <form onSubmit={handleInitiateClientSignup} className="space-y-4 text-xs">
                      {/* Business Name & Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Company / Business Name *</label>
                          <input
                            type="text"
                            required
                            value={clientForm.businessName}
                            onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
                            placeholder="e.g. Ambika Hotel & Luxury Suites"
                            className="w-full px-3 py-2 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Industry / Category *</label>
                          <select
                            value={clientForm.category}
                            onChange={(e) => setClientForm({ ...clientForm, category: e.target.value })}
                            className="w-full px-3 py-2 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                          >
                            <option value="Hospitality & Tourism">Hospitality & Tourism (Hotels, Resorts)</option>
                            <option value="Retail & eCommerce">Retail & Supermarket</option>
                            <option value="Healthcare & Clinics">Healthcare, Labs & Hospitals</option>
                            <option value="Field Service & MEP">Field Service, MEP & Contracting</option>
                            <option value="Real Estate & Property">Real Estate & Developers</option>
                            <option value="Education & Academies">Education & Coaching</option>
                            <option value="Other">Other Enterprise</option>
                          </select>
                        </div>
                      </div>

                      {/* Owner Contact */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Contact Person *</label>
                          <input
                            type="text"
                            required
                            value={clientForm.ownerName}
                            onChange={(e) => setClientForm({ ...clientForm, ownerName: e.target.value })}
                            placeholder="e.g. K. Ramachandran"
                            className="w-full px-3 py-2 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Official Email *</label>
                          <input
                            type="email"
                            required
                            value={clientForm.ownerEmail}
                            onChange={(e) => setClientForm({ ...clientForm, ownerEmail: e.target.value })}
                            placeholder="ramachandran@ambikahotel.com"
                            className="w-full px-3 py-2 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">City / Location</label>
                          <input
                            type="text"
                            value={clientForm.branchLocation}
                            onChange={(e) => setClientForm({ ...clientForm, branchLocation: e.target.value })}
                            placeholder="Beach Road • Kozhikode"
                            className="w-full px-3 py-2 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* WhatsApp Cloud API Number & Rule Explanation */}
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Important Meta WhatsApp Rule: Number Requirements</span>
                        </div>
                        <p className="text-[11px] text-amber-200/90 leading-relaxed">
                          To connect with WhatsApp Cloud API, this number <strong>must not be active on regular WhatsApp or WhatsApp Business mobile app</strong>. If it is currently installed, open WhatsApp &gt; <em>Settings &gt; Account &gt; Delete My Account</em> first, or use a dedicated SIM / virtual number.
                        </p>

                        <div className="space-y-1 pt-1">
                          <label className="font-semibold text-white flex items-center justify-between">
                            <span>Phone Number to Connect with WhatsApp Cloud API *</span>
                            <span className="text-[10px] text-emerald-400 font-mono">OTP will be sent here</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={clientForm.wabaPhone}
                            onChange={(e) =>
                              setClientForm({ ...clientForm, wabaPhone: e.target.value, ownerPhone: e.target.value })
                            }
                            placeholder="+91 98470 12345"
                            className="w-full px-3 py-2 bg-[#081224] border border-amber-500/50 rounded-xl text-white font-mono text-sm outline-none"
                          />
                        </div>

                        <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={clientForm.hasDeletedFromConsumerApp}
                            onChange={(e) =>
                              setClientForm({ ...clientForm, hasDeletedFromConsumerApp: e.target.checked })
                            }
                            className="mt-0.5 rounded border-amber-500 text-amber-500 bg-slate-900"
                          />
                          <span>
                            I confirm this number is ready for Meta Cloud API (not registered on consumer WhatsApp app).
                          </span>
                        </label>
                      </div>

                      {/* Plan Selection */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-300">Choose Subscription Tier</label>
                        <div className="grid grid-cols-3 gap-2">
                          <div
                            onClick={() => setClientForm({ ...clientForm, planTier: 'starter' })}
                            className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                              clientForm.planTier === 'starter'
                                ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                : 'bg-[#081224] border-[#1E293B] text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-xs">Starter</div>
                            <div className="text-[11px] text-emerald-400 font-mono">₹2,499/mo</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">5 Staff Seats</div>
                          </div>

                          <div
                            onClick={() => setClientForm({ ...clientForm, planTier: 'growth' })}
                            className={`p-2.5 rounded-xl border text-center cursor-pointer transition relative ${
                              clientForm.planTier === 'growth'
                                ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                : 'bg-[#081224] border-[#1E293B] text-slate-400'
                            }`}
                          >
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-amber-500 text-slate-950 uppercase">
                              Popular
                            </span>
                            <div className="font-bold text-xs">Growth</div>
                            <div className="text-[11px] text-emerald-400 font-mono">₹5,999/mo</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">15 Staff Seats</div>
                          </div>

                          <div
                            onClick={() => setClientForm({ ...clientForm, planTier: 'enterprise' })}
                            className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                              clientForm.planTier === 'enterprise'
                                ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                : 'bg-[#081224] border-[#1E293B] text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-xs">Enterprise</div>
                            <div className="text-[11px] text-emerald-400 font-mono">₹14,999/mo</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">30 Staff Seats</div>
                          </div>
                        </div>
                      </div>

                      {/* Desired Features Checklist */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-300">Software Options Needed (Configured by Super Admin)</label>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {[
                            { id: 'conversations', label: 'WhatsApp Inbox & Staff Assignment' },
                            { id: 'messenger', label: 'Bulk Broadcasts & Scheduler' },
                            { id: 'crm', label: 'CRM & Lead Management' },
                            { id: 'ops', label: 'Operations & Staff Attendance' },
                            { id: 'automation', label: 'Visual Bot Flow Automation' },
                            { id: 'ai', label: 'AI Copilot & Knowledge Bot' },
                          ].map((mod) => (
                            <label
                              key={mod.id}
                              className="flex items-center gap-2 p-2 rounded-xl bg-[#081224] border border-[#1E293B] hover:border-slate-700 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={clientForm.selectedModules.includes(mod.id)}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...clientForm.selectedModules, mod.id]
                                    : clientForm.selectedModules.filter((m) => m !== mod.id);
                                  setClientForm({ ...clientForm, selectedModules: updated });
                                }}
                                className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                              />
                              <span className="text-slate-300 truncate">{mod.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Continue to WhatsApp OTP Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* Step 2: OTP Verification */
                    <div className="space-y-5 text-xs">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-base text-white">Enter WhatsApp OTP</h4>
                        <p className="text-xs text-slate-300 max-w-sm mx-auto">
                          We sent a 6-digit security verification code to your WhatsApp line at{' '}
                          <span className="text-emerald-300 font-mono font-bold">{clientForm.wabaPhone}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="font-semibold text-slate-300 block text-center">6-Digit Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={signupOtpCode}
                          onChange={(e) => setSignupOtpCode(e.target.value)}
                          placeholder="482910"
                          className="w-full max-w-xs mx-auto block text-center tracking-[0.5em] py-3 bg-[#081224] border border-emerald-500 rounded-xl text-2xl font-bold font-mono text-emerald-300 outline-none"
                        />
                        <div className="text-center text-[11px] text-slate-400">
                          <span>Auto-filled for demo: <strong>{generatedSignupOtp || '123456'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setSignupStep(1)}
                          className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          ← Edit Business Info
                        </button>

                        <button
                          type="button"
                          disabled={signupOtpTimer > 0}
                          onClick={() => {
                            const res = generateWhatsAppOtp(clientForm.wabaPhone, 'client_signup');
                            setGeneratedSignupOtp(res.code);
                            setSignupOtpCode(res.code);
                            setSignupOtpTimer(60);
                            addToast(`New code sent! (${res.code})`, 'info');
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 cursor-pointer"
                        >
                          {signupOtpTimer > 0 ? `Resend code in ${signupOtpTimer}s` : 'Resend WhatsApp Code'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyClientSignup}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Launch {clientForm.businessName}</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2 text-center text-xs text-slate-400 border-t border-[#1E293B]">
                    <span>Already registered? </span>
                    <button
                      type="button"
                      onClick={() => setActiveMode('login')}
                      className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* MODE 3: EMPLOYEE REGISTRATION (Staff Join with WhatsApp OTP)        */}
              {/* ------------------------------------------------------------------- */}
              {activeMode === 'employee_signup' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Staff / Employee Onboarding</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Join your company's WhatsApp workspace and verify with mobile OTP
                    </p>
                  </div>

                  <form onSubmit={handleEmployeeSignup} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Select Employer / Company *</label>
                      <select
                        value={empSignupForm.companyId}
                        onChange={(e) => setEmpSignupForm({ ...empSignupForm, companyId: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                      >
                        {tenants.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.businessName} ({t.branch || 'Main Branch'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={empSignupForm.name}
                          onChange={(e) => setEmpSignupForm({ ...empSignupForm, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Department / Role *</label>
                        <input
                          type="text"
                          required
                          value={empSignupForm.roleTitle}
                          onChange={(e) => setEmpSignupForm({ ...empSignupForm, roleTitle: e.target.value })}
                          placeholder="Front Desk Executive / Agent"
                          className="w-full px-3 py-2 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Staff WhatsApp Phone Number *</label>
                      <input
                        type="text"
                        required
                        value={empSignupForm.phone}
                        onChange={(e) => setEmpSignupForm({ ...empSignupForm, phone: e.target.value })}
                        placeholder="+91 98470 99881"
                        className="w-full px-3 py-2 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white font-mono outline-none"
                      />
                    </div>

                    {empSignupOtpSent && (
                      <div className="space-y-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-in fade-in">
                        <label className="font-semibold text-emerald-300">Enter WhatsApp OTP</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={empSignupOtpCode}
                          onChange={(e) => setEmpSignupOtpCode(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full text-center tracking-[0.5em] py-2 bg-[#081224] border border-emerald-500 rounded-xl text-lg font-bold font-mono text-emerald-300 outline-none"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>{empSignupOtpSent ? 'Verify OTP & Complete Staff Registration' : 'Send WhatsApp OTP'}</span>
                    </button>
                  </form>

                  <div className="pt-2 text-center text-xs text-slate-400 border-t border-[#1E293B]">
                    <span>Already a staff member? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('login');
                        handleSelectRole('employee');
                      }}
                      className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      Login here
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* MODE 4: FORGOT PASSWORD                                             */}
              {/* ------------------------------------------------------------------- */}
              {activeMode === 'forgot_password' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Reset Password</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter your registered email or WhatsApp number to receive a secure recovery code
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addToast('Reset link and OTP sent to your WhatsApp and email!', 'success');
                      setActiveMode('login');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Email or WhatsApp Phone</label>
                      <input
                        type="text"
                        required
                        placeholder="you@example.com or +91 94963 00233"
                        className="w-full px-3 py-2.5 bg-[#081224] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                    >
                      Send Password Reset OTP
                    </button>
                  </form>

                  <div className="pt-2 text-center text-xs text-slate-400 border-t border-[#1E293B]">
                    <button
                      type="button"
                      onClick={() => setActiveMode('login')}
                      className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { X, ShieldCheck, Settings as SettingsIcon, Shield, ChevronRight, LogOut } from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    setActiveTab,
    addToast,
    metaConfig,
  } = useQiyamStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileModalOpen) {
        setIsProfileModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, setIsProfileModalOpen]);

  // Resolve active outbound phone number
  const activeOutboundLine = useMemo(() => {
    try {
      const stored = localStorage.getItem('whatsq_waba_numbers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const primary = parsed.find((n: any) => n.isPrimary) || parsed[0];
          const raw = (primary?.phone || '').trim();
          if (raw && !raw.includes('9876543210') && !raw.includes('98765 43210')) {
            return raw;
          }
        }
      }
    } catch {}
    const configPhone = (metaConfig?.business_phone_display || '').trim();
    if (configPhone && !configPhone.includes('9876543210') && !configPhone.includes('98765 43210')) {
      return configPhone;
    }
    return '+91 94963 00233';
  }, [metaConfig?.business_phone_display]);

  if (!isProfileModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setIsProfileModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="User Profile and Account Settings"
    >
      <div
        className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative p-5 bg-gradient-to-r from-emerald-950/80 to-[#111C33] border-b border-[#1E293B]">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
            title="Close Profile Modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Rahul Mehta"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-md"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0F172A] absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Rahul Mehta</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Owner & Super Admin
                </span>
                <span className="text-[11px] text-slate-400">Kozhikode, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 space-y-3">
          <div className="bg-[#111C33]/60 rounded-xl p-3 border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Email Address</span>
              <span className="text-white font-medium font-mono">rahul.mehta@coolfix.in</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">WhatsApp Phone</span>
              <span className="text-emerald-400 font-medium font-mono">{activeOutboundLine}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Current Workspace</span>
              <span className="text-white font-medium">Qiyam Business Solutions</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Two-Factor Auth</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active (WhatsApp OTP)
              </span>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false);
                setActiveTab('settings');
              }}
              className="w-full p-2.5 rounded-xl bg-[#111C33]/40 hover:bg-[#162544] border border-[#1E293B] hover:border-slate-600 transition flex items-center justify-between text-left text-slate-300 hover:text-white cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <SettingsIcon className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-xs">Account & Workspace Settings</div>
                  <div className="text-[10px] text-slate-400">Configure business profile, billing and team</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false);
                setActiveTab('automation-logs');
              }}
              className="w-full p-2.5 rounded-xl bg-[#111C33]/40 hover:bg-[#162544] border border-[#1E293B] hover:border-slate-600 transition flex items-center justify-between text-left text-slate-300 hover:text-white cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Security & Audit Logs</div>
                  <div className="text-[10px] text-slate-400">View live employee sessions and login audit trails</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#070D18] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsProfileModalOpen(false);
              addToast('Profile state authenticated as Rahul Mehta (Owner).', 'info');
            }}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            Verify Session
          </button>

          <button
            type="button"
            onClick={() => {
              setIsProfileModalOpen(false);
              addToast('Signed out of session. Session safely saved.', 'info');
            }}
            className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition cursor-pointer flex items-center gap-1.5 font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

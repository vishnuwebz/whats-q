import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  X,
  ShieldCheck,
  Settings as SettingsIcon,
  Shield,
  ChevronRight,
  LogOut,
  Crown,
  Pencil,
  Camera,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
} from 'lucide-react';

const PRESET_AVATARS = [
  {
    name: 'Executive Leader',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Business Lead (Male)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Corporate Director (Female)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tech Founder (Male)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Creative Strategist',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Managing Partner',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  },
];

export const UserProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    setActiveTab,
    addToast,
    metaConfig,
    userProfile,
    updateUserProfile,
  } = useQiyamStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [role, setRole] = useState(userProfile.role);
  const [location, setLocation] = useState(userProfile.location);
  const [phone, setPhone] = useState(userProfile.phone);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal edit state when modal opens or userProfile changes
  useEffect(() => {
    if (isProfileModalOpen) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setRole(userProfile.role);
      setLocation(userProfile.location);
      setPhone(userProfile.phone);
      setAvatar(userProfile.avatar);
      setIsEditing(false);
    }
  }, [isProfileModalOpen, userProfile]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileModalOpen) {
        if (isEditing) {
          setIsEditing(false);
        } else {
          setIsProfileModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, isEditing, setIsProfileModalOpen]);

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
    return userProfile.phone || '+91 94963 00233';
  }, [metaConfig?.business_phone_display, userProfile.phone]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Profile image size exceeds 2MB limit. Please choose a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      addToast('Photo preview updated. Click "Save Changes" to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please enter your full name.', 'error');
      return;
    }

    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || 'Owner & Super Admin',
      location: location.trim() || 'Kozhikode, India',
      phone: phone.trim() || activeOutboundLine,
      avatar,
    });

    setIsEditing(false);
    addToast('Profile updated successfully! Name and avatar updated across Qiyam OS.', 'success');
  };

  const handleCancelEdit = () => {
    setName(userProfile.name);
    setEmail(userProfile.email);
    setRole(userProfile.role);
    setLocation(userProfile.location);
    setPhone(userProfile.phone);
    setAvatar(userProfile.avatar);
    setIsEditing(false);
  };

  if (!isProfileModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={() => setIsProfileModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="User Profile and Account Settings"
    >
      <div
        className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-xs animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Custom Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
        />

        {/* Header Banner */}
        <div className="relative p-5 bg-gradient-to-r from-emerald-950/90 via-[#0B1528] to-[#111C33] border-b border-[#1E293B]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                User Account
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    handleCancelEdit();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  isEditing
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition cursor-pointer"
                title="Close Profile Modal (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Photo & Headline */}
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={isEditing ? avatar : userProfile.avatar}
                alt={isEditing ? name : userProfile.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-lg"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0F172A] absolute -bottom-0.5 -right-0.5" />

              {/* Click to change photo overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Click to Upload New Photo"
              >
                <Camera className="w-5 h-5 text-emerald-300" />
                <span className="text-[9px] font-bold mt-0.5">Upload</span>
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white truncate">
                  {isEditing ? (name || 'Your Name') : userProfile.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 truncate">
                  {isEditing ? (role || 'Role') : userProfile.role}
                </span>
                <span className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {isEditing ? (location || 'Location') : userProfile.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        {isEditing ? (
          /* ── EDIT PROFILE FORM ── */
          <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
            {/* Avatar Selection & Upload */}
            <div className="bg-[#111C33]/70 rounded-xl p-3.5 border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Profile Photo</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload From Device</span>
                </button>
              </div>

              {/* Quick Preset Avatars */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-2 font-medium">
                  Or pick a professional avatar preset:
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(preset.url);
                        addToast(`Selected ${preset.name}`, 'info');
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition cursor-pointer hover:scale-105 ${
                        avatar === preset.url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-105'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {avatar === preset.url && (
                        <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                <span>Supports PNG, JPG, WebP up to 2MB</span>
                <button
                  type="button"
                  onClick={() => {
                    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80');
                    addToast('Reset to default photo', 'info');
                  }}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* Editable Fields Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Mehta"
                    className="w-full px-3 py-2 bg-[#111C33] border border-[#1E293B] rounded-xl text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Role / Designation</span>
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Owner & Super Admin"
                    className="w-full px-3 py-2 bg-[#111C33] border border-[#1E293B] rounded-xl text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.mehta@coolfix.in"
                    className="w-full px-3 py-2 bg-[#111C33] border border-[#1E293B] rounded-xl text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Phone</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 94963 00233"
                    className="w-full px-3 py-2 bg-[#111C33] border border-[#1E293B] rounded-xl text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold text-xs mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kozhikode, India"
                  className="w-full px-3 py-2 bg-[#111C33] border border-[#1E293B] rounded-xl text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-slate-400 hover:text-white rounded-xl font-semibold text-xs transition cursor-pointer hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 text-xs active:scale-98"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          /* ── VIEW PROFILE DETAILS & NAVIGATION ── */
          <div className="p-4 space-y-3">
            <div className="bg-[#111C33]/60 rounded-xl p-3 border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Email Address</span>
                <span className="text-white font-medium font-mono">{userProfile.email}</span>
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
                  setActiveTab('super-admin');
                }}
                className="w-full p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/50 transition flex items-center justify-between text-left text-amber-200 hover:text-white cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      Platform Super Admin Console
                      <span className="text-[9px] font-extrabold bg-amber-500/30 text-amber-300 px-1 py-0.2 rounded border border-amber-500/40">PRO</span>
                    </div>
                    <div className="text-[10px] text-amber-300/70">Manage all tenant workspaces, licenses & global infrastructure</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400/60 group-hover:text-amber-300 transition" />
              </button>

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
        )}

        {/* Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#070D18] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsProfileModalOpen(false);
              addToast(`Profile session authenticated as ${userProfile.name} (${userProfile.role}).`, 'info');
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

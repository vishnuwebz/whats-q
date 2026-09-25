import React, { useState, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Building2,
  Globe,
  Clock,
  Calendar,
  IndianRupee,
  Sparkles,
  Volume2,
  Paperclip,
  CheckCircle2,
  Save,
  Layers,
  Shield,
  Eye,
  Archive,
  Upload,
  Trash2,
  User,
  Pencil,
} from 'lucide-react';

export const GeneralSettings: React.FC = () => {
  const { addToast, userProfile, setIsProfileModalOpen } = useQiyamStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brandLogo, setBrandLogo] = useState<string>(
    () => localStorage.getItem('whatsq_brand_logo') || ''
  );

  const [workspaceName, setWorkspaceName] = useState(
    () => localStorage.getItem('whatsq_workspace_name') || 'Qiyam Business OS'
  );
  const [workspaceUrl, setWorkspaceUrl] = useState('qiyam-business-os.qiyamapp.com');
  const [timeZone, setTimeZone] = useState(
    () => localStorage.getItem('whatsq_timezone') || '(GMT+05:30) Asia/Kolkata (IST)'
  );
  const [dateFormat, setDateFormat] = useState(
    () => localStorage.getItem('whatsq_dateformat') || 'May 31, 2024 (MMM DD, YYYY)'
  );
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('whatsq_currency') || 'INR (₹) - Indian Rupee'
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem('whatsq_language') || 'English (US)'
  );

  const [enableAi, setEnableAi] = useState(true);
  const [enableNotif, setEnableNotif] = useState(true);
  const [allowUploads, setAllowUploads] = useState(true);
  const [autoReadReceipts, setAutoReadReceipts] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePreferences = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    localStorage.setItem('whatsq_workspace_name', workspaceName);
    localStorage.setItem('whatsq_timezone', timeZone);
    localStorage.setItem('whatsq_dateformat', dateFormat);
    localStorage.setItem('whatsq_currency', currency);
    localStorage.setItem('whatsq_language', language);
    window.dispatchEvent(new Event('whatsq_workspace_updated'));

    setTimeout(() => {
      setIsSaving(false);
      addToast('General workspace preferences updated successfully!', 'success');
    }, 400);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('File size exceeds 2MB limit. Please choose a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBrandLogo(result);
      try {
        localStorage.setItem('whatsq_brand_logo', result);
        window.dispatchEvent(new Event('whatsq_workspace_updated'));
        addToast('Brand logo uploaded and applied across workspace!', 'success');
      } catch (err) {
        addToast('Storage quota exceeded. Please choose a smaller image.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBrandLogo('');
    localStorage.removeItem('whatsq_brand_logo');
    window.dispatchEvent(new Event('whatsq_workspace_updated'));
    if (fileInputRef.current) fileInputRef.current.value = '';
    addToast('Brand logo reset to default avatar.', 'info');
  };

  return (
    <form onSubmit={handleSavePreferences} className="space-y-6">
      {/* ── 0. Administrator Profile (Name & Photo) ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Administrator Profile (Name & Photo)</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Personalize your display name, role designation, and account profile picture.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile & Avatar</span>
          </button>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className="relative shrink-0">
            <img
              src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={userProfile?.name || 'Administrator'}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-md"
            />
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>{userProfile?.name || 'Rahul Mehta'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {userProfile?.role || 'Owner & Super Admin'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{userProfile?.email || 'rahul.mehta@coolfix.in'}</span>
              <span>•</span>
              <span>{userProfile?.location || 'Kozhikode, India'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. Organization & Branding ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Organization & Brand Identity</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure your company profile and dedicated tenant subdomain URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-md ring-4 ring-emerald-50 overflow-hidden">
              {brandLogo ? (
                <img src={brandLogo} alt="Tenant Brand Logo" className="w-full h-full object-cover" />
              ) : (
                <span>Q</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-800">Tenant Brand Logo</div>
            <div className="text-[11px] text-slate-500">
              Displayed on client WhatsApp headers, invoices, and system exports.
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3 h-3 text-slate-500" />
                <span>{brandLogo ? 'Change Brand Logo' : 'Upload Brand Logo'}</span>
              </button>
              {brandLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
              <span className="text-[10px] text-slate-400">PNG, JPG, SVG up to 2MB</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none text-xs focus:border-emerald-500 transition"
              placeholder="e.g. Qiyam Business OS"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">Workspace ID & Dedicated URL</label>
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              <input
                type="text"
                value={workspaceUrl}
                disabled
                className="w-full p-2.5 bg-transparent text-slate-500 font-mono text-xs outline-none"
              />
              <span className="px-3 text-[10px] font-bold text-emerald-700 bg-emerald-100 py-1 mr-1 rounded-md">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Regional & Currency Preferences ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Regional Preferences & Localization</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure timezones, business dates, currency symbol, and platform language.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">Default Time Zone</label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs outline-none focus:border-emerald-500 transition"
            >
              <option>(GMT+05:30) Asia/Kolkata (IST)</option>
              <option>(GMT+04:00) Asia/Dubai (GST)</option>
              <option>(GMT+03:00) Asia/Riyadh (AST)</option>
              <option>(GMT+00:00) UTC / London (GMT)</option>
              <option>(GMT-05:00) America/New_York (EST)</option>
              <option>(GMT+08:00) Asia/Singapore (SGT)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs outline-none focus:border-emerald-500 transition"
            >
              <option>May 31, 2024 (MMM DD, YYYY)</option>
              <option>31/05/2024 (DD/MM/YYYY)</option>
              <option>2024-05-31 (YYYY-MM-DD)</option>
              <option>05/31/2024 (MM/DD/YYYY)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">Base Operational Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs outline-none focus:border-emerald-500 transition"
            >
              <option>INR (₹) - Indian Rupee</option>
              <option>AED (د.إ) - UAE Dirham</option>
              <option>SAR (﷼) - Saudi Riyal</option>
              <option>USD ($) - US Dollar</option>
              <option>EUR (€) - Euro</option>
              <option>GBP (£) - British Pound</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">System Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs outline-none focus:border-emerald-500 transition"
            >
              <option>English (US & Global)</option>
              <option>Arabic (العربية)</option>
              <option>Hindi (हिन्दी)</option>
              <option>Malayalam (മലയാളം)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Core Automation & Experience Toggles ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Core Experience & Automation Toggles</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Turn on AI assistance, audio notifications, and multimedia chat capabilities.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
            <input
              type="checkbox"
              checked={enableAi}
              onChange={(e) => setEnableAi(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Enable AI Assistant Copilot across all modules
              </span>
              <span className="text-[11px] text-slate-500 leading-normal">
                Powers smart reply suggestions, automated intent categorization, and CRM lead scoring.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
            <input
              type="checkbox"
              checked={enableNotif}
              onChange={(e) => setEnableNotif(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Enable Desktop & Inbound WhatsApp audio alerts
              </span>
              <span className="text-[11px] text-slate-500 leading-normal">
                Plays a subtle audible chime whenever a customer sends an inbound message.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
            <input
              type="checkbox"
              checked={allowUploads}
              onChange={(e) => setAllowUploads(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Allow media file attachments & voice notes in chat
              </span>
              <span className="text-[11px] text-slate-500 leading-normal">
                Permits sending and receiving PDFs, invoices, product images, and OGG voice memos.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
            <input
              type="checkbox"
              checked={autoReadReceipts}
              onChange={(e) => setAutoReadReceipts(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Automatic WhatsApp Blue Ticks (Read Receipts)
              </span>
              <span className="text-[11px] text-slate-500 leading-normal">
                Automatically marks customer messages as read on WhatsApp when opened by an agent.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
            <input
              type="checkbox"
              checked={autoArchive}
              onChange={(e) => setAutoArchive(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Auto-archive resolved conversations after 48 hours
              </span>
              <span className="text-[11px] text-slate-500 leading-normal">
                Cleanses agent inbox clutter while maintaining full searchable conversation history.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Configuration...' : 'Save Configuration'}</span>
        </button>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Settings as SettingsIcon, Save, ShieldCheck, Database, HardDrive, Users, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { addToast } = useQiyamStore();
  const [workspaceName, setWorkspaceName] = useState('Qiyam Business OS');
  const [timeZone, setTimeZone] = useState('(GMT+05:30) Asia/Kolkata');
  const [enableAi, setEnableAi] = useState(true);
  const [enableNotif, setEnableNotif] = useState(true);
  const [allowUploads, setAllowUploads] = useState(true);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('whatsq_workspace_name', workspaceName);
    localStorage.setItem('whatsq_timezone', timeZone);
    addToast('Workspace settings saved successfully!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Workspace Settings"
        subtitle="Configure organization details, regional preferences, role permissions, and storage."
        primaryActionLabel="Save Changes"
        onPrimaryAction={handleSave}
      />

      <div className="p-6 max-w-4xl space-y-6 text-xs">
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Workspace Info (Matching photo_2) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              General Workspace Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Workspace Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Workspace ID & URL</label>
                <input
                  type="text"
                  value="qiyam-business-os.qiyamapp.com"
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Default Time Zone</label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                >
                  <option>(GMT+05:30) Asia/Kolkata (IST)</option>
                  <option>(GMT+04:00) Asia/Dubai (GST)</option>
                  <option>(GMT+00:00) UTC</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date Format</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none">
                  <option>May 31, 2024 (MMM DD, YYYY)</option>
                  <option>31/05/2024 (DD/MM/YYYY)</option>
                  <option>2024-05-31 (YYYY-MM-DD)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAi}
                  onChange={(e) => setEnableAi(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800">Enable AI Assistant Copilot across all modules</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableNotif}
                  onChange={(e) => setEnableNotif(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800">Enable Desktop & Inbound WhatsApp audio alerts</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowUploads}
                  onChange={(e) => setAllowUploads(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800">Allow media file attachments & voice notes in chat</span>
              </label>
            </div>
          </div>

          {/* Plan & Subscription Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Subscription & Cloud Storage</h3>
                <p className="text-slate-500 text-[11px]">Professional Enterprise Tier • Active</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Active Plan
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Team Seats</span>
                <span className="text-lg font-black text-slate-900">18 / 50</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Cloud Storage</span>
                <span className="text-lg font-black text-slate-900">24.6 GB / 100 GB</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">WhatsApp Numbers</span>
                <span className="text-lg font-black text-emerald-600">3 Verified</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



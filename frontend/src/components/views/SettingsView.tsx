import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Settings as SettingsIcon,
  Database,
  Building2,
  MessageSquare,
  CreditCard,
  Lock,
  Bell,
  Download,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { GeneralSettings } from './settings/GeneralSettings';
import { BackupRestoreSettings } from './settings/BackupRestoreSettings';
import { WhatsAppChannelSettings } from './settings/WhatsAppChannelSettings';
import { SubscriptionSettings } from './settings/SubscriptionSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { exportBackupToFile } from '@/utils/backupManager';

export type SettingsTab = 'general' | 'backup' | 'whatsapp' | 'subscription' | 'security' | 'notifications';

interface SettingsViewProps {
  initialTab?: SettingsTab;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'general' }) => {
  const { addToast, activeTab } = useQiyamStore();
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>(() => {
    if (activeTab === 'settings-notifications') return 'notifications';
    if (activeTab === 'settings-whatsapp') return 'whatsapp';
    if (activeTab === 'settings-backup') return 'backup';
    return initialTab;
  });
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (activeTab === 'settings-notifications') {
      setActiveSettingsTab('notifications');
    } else if (activeTab === 'settings-whatsapp') {
      setActiveSettingsTab('whatsapp');
    } else if (activeTab === 'settings-backup') {
      setActiveSettingsTab('backup');
    } else if (initialTab) {
      setActiveSettingsTab(initialTab);
    }
  }, [initialTab, activeTab]);

  const handleExportQuickBackup = () => {
    try {
      const filename = exportBackupToFile();
      addToast(`Downloaded system backup: ${filename}`, 'success');
    } catch {
      addToast('Failed to export backup', 'error');
    }
  };

  const navTabs = [
    {
      id: 'general' as SettingsTab,
      label: 'General Workspace',
      shortLabel: 'General',
      icon: Building2,
      description: 'Brand identity, timezone, currency & regional formats',
      badge: null,
    },
    {
      id: 'backup' as SettingsTab,
      label: 'Data Backup & Restore',
      shortLabel: 'Data Backup',
      icon: Database,
      description: 'Auto-backups, last backup status, JSON import/export & snapshot archive',
      badge: 'Zero-Loss Engine',
      highlight: true,
    },
    {
      id: 'whatsapp' as SettingsTab,
      label: 'WhatsApp API & Channels',
      shortLabel: 'WhatsApp API',
      icon: MessageSquare,
      description: 'Meta Cloud API credentials, webhook endpoints & SLA health',
      badge: 'Live',
    },
    {
      id: 'subscription' as SettingsTab,
      label: 'Subscription & Quotas',
      shortLabel: 'Subscription',
      icon: CreditCard,
      description: 'Enterprise tier, seats allocation & cloud storage meters',
      badge: null,
    },
    {
      id: 'security' as SettingsTab,
      label: 'Security & Privacy',
      shortLabel: 'Security',
      icon: Lock,
      description: '2FA authentication, session timeouts & encryption standards',
      badge: null,
    },
    {
      id: 'notifications' as SettingsTab,
      label: 'Notifications & Sounds',
      shortLabel: 'Notifications',
      icon: Bell,
      description: 'WhatsApp audio chimes, push alerts & quiet hours',
      badge: null,
    },
  ];

  // Filter tabs based on search
  const filteredTabs = navTabs.filter(
    (t) =>
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Workspace Settings"
        subtitle="Configure organization details, regional preferences, automated backups, and WhatsApp Cloud APIs."
        primaryActionLabel="Export Full Backup"
        onPrimaryAction={handleExportQuickBackup}
      />

      <div className="p-3 sm:p-6 max-w-6xl mx-auto w-full space-y-6 text-xs">
        {/* ── Sub-navigation Header & Search Bar ── */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs Scroll Container */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSettingsTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1528] text-white shadow-sm ring-1 ring-[#1E293B]'
                      : tab.highlight
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-emerald-400'
                        : tab.highlight
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{tab.shortLabel}</span>

                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md uppercase tracking-wider font-extrabold ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : tab.highlight
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input for Quick Navigation */}
          <div className="relative w-full md:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Results Drawer if user is searching */}
        {searchQuery.trim() && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Matching Settings Categories ({filteredTabs.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <div
                    key={tab.id}
                    onClick={() => {
                      setActiveSettingsTab(tab.id);
                      setSearchQuery('');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-xs text-slate-800">{tab.label}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{tab.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Active Tab View Content ── */}
        <div className="transition-all duration-150">
          {activeSettingsTab === 'general' && <GeneralSettings />}
          {activeSettingsTab === 'backup' && <BackupRestoreSettings />}
          {activeSettingsTab === 'whatsapp' && <WhatsAppChannelSettings />}
          {activeSettingsTab === 'subscription' && <SubscriptionSettings />}
          {activeSettingsTab === 'security' && <SecuritySettings />}
          {activeSettingsTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
};

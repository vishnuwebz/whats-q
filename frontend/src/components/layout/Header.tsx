import React, { useState, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Search, Calendar, Filter, Download, Plus, Bell, HelpCircle,
  X, Check, ExternalLink, Sparkles, MessageSquare, AlertCircle, ArrowRight,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { OmniSearchModal } from './OmniSearchModal';
import { UniversalFilterPopover } from './UniversalFilterPopover';
import { exportTableToCsv } from '@/utils/exportCsv';

interface HeaderProps {
  title: string;
  subtitle?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  primaryActionLabel,
  onPrimaryAction,
}) => {
  const store = useQiyamStore();
  const {
    activeTab,
    setActiveTab,
    setIsSimulatorOpen,
    addToast,
    versionInfo,
    setIsUpdateModalOpen,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    globalDateRange,
    setGlobalDateRange,
    globalFilter,
    notifications,
    markAllNotificationsRead,
    handleNotificationClick,
    isOmniSearchOpen,
    setIsOmniSearchOpen,
  } = store;

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => n.unread).length;
  const isFilterActive =
    (globalFilter.status && globalFilter.status !== 'all') ||
    (globalFilter.priority && globalFilter.priority !== 'all') ||
    Boolean(globalFilter.query);

  // Global Keyboard listener for OmniSearch (Ctrl + / or Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === 'k')) {
        e.preventDefault();
        setIsOmniSearchOpen(!isOmniSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOmniSearchOpen, setIsOmniSearchOpen]);

  const handleExport = () => {
    const result = exportTableToCsv(activeTab, store);
    addToast(`Exported ${result.count} records to ${result.filename}`, 'success');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Title & Subtitle with Sidebar Toggle */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={toggleSidebarCollapse}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all border border-slate-200/80 shadow-xs cursor-pointer"
            title={isSidebarCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar (Ctrl + B)'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          {/* Global Search Input triggering OmniSearch */}
          <div className="relative">
            <button
              onClick={() => setIsOmniSearchOpen(true)}
              className="flex items-center justify-between pl-3 pr-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-lg text-xs text-slate-400 hover:text-slate-600 transition-all w-52 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-slate-500 group-hover:text-slate-700">Search (Ctrl + /)</span>
              </div>
              <kbd className="text-[10px] font-mono font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/80 shadow-2xs">
                /
              </kbd>
            </button>
          </div>

          {/* Date Range Selector Popover */}
          <div className="relative">
            <button
              onClick={() => setIsDateOpen(!isDateOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{globalDateRange}</span>
            </button>

            {isDateOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
                {['Today', 'Yesterday', 'This Week', 'May 1 – May 31, 2024', 'Last Month', 'Year to Date (2024)'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setGlobalDateRange(p);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      globalDateRange === p ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{p}</span>
                    {globalDateRange === p && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Button with UniversalFilterPopover */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all cursor-pointer relative ${
                isFilterActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${isFilterActive ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>Filter</span>
              {isFilterActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              )}
            </button>

            <UniversalFilterPopover
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              pageTitle={title}
            />
          </div>

          {/* Export Button (Real CSV File Download) */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all cursor-pointer"
            title="Download CSV report of current tab"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          {/* Primary Action Button (Optional) */}
          {primaryActionLabel && (
            <button
              onClick={onPrimaryAction}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{primaryActionLabel}</span>
            </button>
          )}

          {/* System Version & Live Update Button */}
          {versionInfo && (
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                versionInfo.update_available
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/30 hover:brightness-105 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="WhatsQ System Update"
            >
              <Sparkles className={`w-3.5 h-3.5 ${versionInfo.update_available ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{versionInfo.update_available ? 'Update Available' : `v${versionInfo.current_commit}`}</span>
            </button>
          )}

          {/* Simulator Shortcut Button */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Simulate Customer Inbound WhatsApp"
          >
            <span>💬 WhatsApp Sim</span>
          </button>

          {/* Help Icon */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            title="Help & Knowledge Base"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Live Real-time Sync Status Capsule */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              store.syncStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : store.syncStatus === 'reconnecting'
                ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
            title={`Real-time sync engine: ${
              store.syncStatus === 'connected'
                ? 'Connected and streaming live updates with zero page refresh'
                : store.syncStatus === 'reconnecting'
                ? 'Reconnecting to event stream...'
                : 'Offline'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                store.syncStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : store.syncStatus === 'reconnecting'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="hidden sm:inline">
              {store.syncStatus === 'connected'
                ? 'Live Sync'
                : store.syncStatus === 'reconnecting'
                ? 'Reconnecting'
                : 'Offline'}
            </span>
          </div>

          {/* Notifications Icon with Interactive Dropdown & Item Routing */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                    {unreadNotifsCount > 0 && (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {unreadNotifsCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[11px] text-emerald-600 hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        handleNotificationClick(n);
                      }}
                      className={`pt-2.5 pb-2 px-2.5 rounded-xl cursor-pointer transition-colors space-y-1 ${
                        n.unread ? 'bg-emerald-50/40 hover:bg-emerald-50/80 border border-emerald-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                          <span className={n.unread ? 'text-slate-950 font-bold' : 'text-slate-700'}>{n.title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">{n.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug pl-3.5">{n.text}</div>
                      <div className="flex items-center justify-end text-[10px] font-semibold text-emerald-600 pt-0.5">
                        <span className="flex items-center gap-1">Open record <ArrowRight className="w-3 h-3" /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer"
            title="Account Settings"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Rahul Mehta"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 hover:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Quick Help Modal */}
        {isHelpOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">Qiyam OS Quick Help</h3>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-slate-600 leading-relaxed">
                <p>Welcome to <strong>Qiyam Business OS</strong> — your end-to-end WhatsApp CRM, dispatch operations, and financial management suite.</p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1.5 font-medium">
                  <div>• <strong>Omni Search:</strong> Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">Ctrl + /</kbd> anywhere to search all records.</div>
                  <div>• <strong>Real Export:</strong> Click "Export" to download a CSV file of any page.</div>
                  <div>• <strong>Page Filters:</strong> Click "Filter" to filter by status or priority.</div>
                  <div>• <strong>Simulate Messages:</strong> Click "💬 WhatsApp Sim" in the top header.</div>
                  <div>• <strong>Automation Builder:</strong> Navigate to Automation → Workflow Builder.</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsHelpOpen(false);
                    setActiveTab('ai-knowledgebase');
                  }}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Browse Knowledge Base →
                </button>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global OmniSearch Modal */}
      <OmniSearchModal
        isOpen={isOmniSearchOpen}
        onClose={() => setIsOmniSearchOpen(false)}
      />
    </>
  );
};

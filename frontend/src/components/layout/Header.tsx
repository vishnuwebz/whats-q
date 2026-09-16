import React, { useState, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Search, Calendar, Filter, Download, Plus, Bell, HelpCircle,
  X, Check, ExternalLink, Sparkles, MessageSquare, AlertCircle, ArrowRight,
  PanelLeftClose, PanelLeftOpen, Menu, RefreshCw
} from 'lucide-react';
import { OmniSearchModal } from './OmniSearchModal';
import { UniversalFilterPopover } from './UniversalFilterPopover';
import { exportTableToCsv } from '@/utils/exportCsv';
import { ModernDateRangePicker, DateRangeValue } from '@/components/common/ModernDateRangePicker';

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
    isUpdatingSystem,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    toggleMobileSidebar,
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

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Enable PC mouse wheel vertical-to-horizontal scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Translate vertical mouse wheel scrolling (deltaY) into horizontal scroll
      if (e.deltaY !== 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Mouse drag-to-scroll support for desktop
  const isDownRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a, select')) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftRef.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

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
      <header className="bg-white border-b border-slate-200/80 px-3 sm:px-5 py-2.5 flex items-center gap-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* ── LEFT: Always visible — toggle + title + subtitle ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Desktop sidebar collapse */}
          <button
            onClick={toggleSidebarCollapse}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all border border-slate-200/80 shadow-xs cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar (Ctrl + B)'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Title + Subtitle — always fully visible, no truncation */}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">{subtitle}</p>
            )}
          </div>

          {/* Search — Pinned, not scrollable */}
          <button
            onClick={() => setIsOmniSearchOpen(true)}
            className="flex items-center justify-between pl-3 pr-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-lg text-xs text-slate-400 hover:text-slate-600 transition-all w-36 sm:w-44 text-left cursor-pointer group shrink-0 ml-1 sm:ml-1.5"
            title="Search (Ctrl + /)"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
              <span className="text-slate-500 group-hover:text-slate-700 truncate">Search (Ctrl + /)</span>
            </div>
            <kbd className="text-[10px] font-mono font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/80 shadow-2xs">/</kbd>
          </button>

          {/* Primary Action (e.g. + New Booking, + Clock In) — Pinned, constant with search bar */}
          {primaryActionLabel && (
            <button
              onClick={onPrimaryAction}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{primaryActionLabel}</span>
            </button>
          )}
        </div>

        {/* ── RIGHT: Horizontally swipeable & mouse-wheel-scrollable action strip ── */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex-1 overflow-x-auto scrollbar-hide min-w-0"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 w-max ml-auto pr-1 shrink-0">

          {/* Date Range */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsDateOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all cursor-pointer whitespace-nowrap"
              title="Filter by custom date range"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{globalDateRange}</span>
            </button>
          </div>

          {/* Filter */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all cursor-pointer relative whitespace-nowrap ${
                isFilterActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 shrink-0 ${isFilterActive ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>Filter</span>
              {isFilterActive && <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />}
            </button>
            <UniversalFilterPopover isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} pageTitle={title} />
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            title="Download CSV report of current tab"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Export</span>
          </button>

          {/* Version / Update badge */}
          {versionInfo && (() => {
            const dismissKey = `whatsq_update_dismissed_${versionInfo.current_commit}_${versionInfo.latest_commit}`;
            const wasDismissed = (() => { try { return localStorage.getItem(dismissKey) === 'true'; } catch { return false; } })();
            const showUpdateReady = versionInfo.update_available && !isUpdatingSystem && !wasDismissed;
            const showUpdating = isUpdatingSystem;
            return (
              <button
                onClick={() => { if (!isUpdatingSystem) setIsUpdateModalOpen(true); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  showUpdating
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md animate-pulse ring-2 ring-amber-400/50'
                    : showUpdateReady
                    ? 'bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 hover:brightness-110 animate-pulse ring-2 ring-emerald-400/50'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
                title={showUpdating ? 'Applying update...' : showUpdateReady ? `Update available (${versionInfo.latest_commit})` : `WhatsQ v${versionInfo.current_commit} • Up to date`}
              >
                {showUpdating ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Updating...</span></>) :
                 showUpdateReady ? (<><Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" /><span>Update Ready</span></>) :
                 (<><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Up to date ✓</span></>)}
              </button>
            );
          })()}

          {/* WhatsApp Simulator */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap"
            title="Simulate Customer Inbound WhatsApp"
          >
            <span>💬 WhatsApp Sim</span>
          </button>

          {/* Help */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer shrink-0"
            title="Help & Knowledge Base"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Live Sync */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border shrink-0 whitespace-nowrap ${
              store.syncStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : store.syncStatus === 'reconnecting'
                ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
            title={`Real-time sync: ${store.syncStatus === 'connected' ? 'Connected' : store.syncStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              store.syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse'
              : store.syncStatus === 'reconnecting' ? 'bg-amber-500'
              : 'bg-rose-500'
            }`} />
            <span>
              {store.syncStatus === 'connected' ? 'Live Sync' : store.syncStatus === 'reconnecting' ? 'Reconnecting' : 'Offline'}
            </span>
          </div>

        </div>{/* end w-max inner */}
        </div>{/* end overflow-x-auto */}

        {/* ── PINNED RIGHT: Notifications + Profile Avatar ── */}
        <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l border-slate-200 shrink-0">
          {/* Notifications */}
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
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-84 max-w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                      {unreadNotifsCount > 0 && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">{unreadNotifsCount} new</span>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button onClick={() => markAllNotificationsRead()} className="text-[11px] text-emerald-600 hover:underline font-semibold cursor-pointer">Mark all read</button>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { setIsNotifOpen(false); handleNotificationClick(n); }}
                        className={`pt-2.5 pb-2 px-2.5 rounded-xl cursor-pointer transition-colors space-y-1 ${n.unread ? 'bg-emerald-50/40 hover:bg-emerald-50/80 border border-emerald-100' : 'hover:bg-slate-50'}`}
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
              </>
            )}
          </div>

          {/* Profile Avatar */}
          <div
            onClick={() => setActiveTab('settings')}
            className="flex items-center cursor-pointer shrink-0"
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

      {/* Global Modern Interactive Date Range Picker Modal */}
      <ModernDateRangePicker
        isOpen={isDateOpen}
        onClose={() => setIsDateOpen(false)}
        value={{
          startDate: '2024-05-01',
          endDate: '2024-05-31',
          label: globalDateRange,
        }}
        onApply={(range) => {
          setGlobalDateRange(range.label || `${range.startDate} – ${range.endDate}`);
        }}
        title="Filter Workspace by Date Range"
      />
    </>
  );
};

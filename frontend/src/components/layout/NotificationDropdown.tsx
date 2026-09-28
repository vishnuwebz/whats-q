import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQiyamStore, QNotification } from '@/store/useQiyamStore';
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  X,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Calendar,
  IndianRupee,
  UserPlus,
  ShieldAlert,
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}

type TabFilter = 'all' | 'unread' | 'alerts';

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  anchorRef,
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    clearAllNotifications,
    resetNotificationsToDefault,
    handleNotificationClick,
    setActiveTab,
    addToast,
  } = useQiyamStore();

  const [activeFilter, setActiveFilter] = useState<TabFilter>('all');
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset pagination when dropdown opens or filter changes
  useEffect(() => {
    if (isOpen) {
      setVisibleCount(20);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, activeFilter]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        (!anchorRef?.current || !anchorRef.current.contains(target))
      ) {
        onClose();
      }
    };
    // Delay slightly to prevent immediate closing from the opening click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  const safeNotifications = useMemo(() => {
    return Array.isArray(notifications) ? notifications : [];
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return safeNotifications.filter((n) => n && n.unread).length;
  }, [safeNotifications]);

  const alertsCount = useMemo(() => {
    return safeNotifications.filter(
      (n) => n && (n.severity === 'error' || n.severity === 'warning' || n.category === 'alerts')
    ).length;
  }, [safeNotifications]);

  const filteredNotifications = useMemo(() => {
    return safeNotifications.filter((n) => {
      if (!n) return false;
      if (activeFilter === 'unread') return Boolean(n.unread);
      if (activeFilter === 'alerts') {
        return n.severity === 'error' || n.severity === 'warning' || n.category === 'alerts';
      }
      return true;
    });
  }, [safeNotifications, activeFilter]);

  const displayedNotifications = useMemo(() => {
    return filteredNotifications.slice(0, visibleCount);
  }, [filteredNotifications, visibleCount]);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      if (visibleCount < filteredNotifications.length) {
        setVisibleCount((prev) => Math.min(prev + 20, filteredNotifications.length));
      }
    }
  };

  const handleLoadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleCount((prev) => Math.min(prev + 25, filteredNotifications.length));
  };

  const getVisualConfig = (item: QNotification) => {
    const title = String(item?.title || '').toLowerCase();
    const severity = item?.severity;
    const itemType = item?.itemType;
    const category = item?.category;

    // 1. By itemType or severity or title keywords
    if (
      severity === 'error' ||
      itemType === 'job' ||
      category === 'alerts' ||
      title.includes('overdue') ||
      title.includes('delayed') ||
      title.includes('blocked')
    ) {
      return {
        icon: AlertTriangle,
        iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/80',
        tagBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
        tagLabel: title.includes('blocked') ? 'Blocked' : 'Alert',
        unreadBorder: 'border-l-4 border-l-rose-500 bg-rose-50/30 hover:bg-rose-50/60',
      };
    }

    if (
      severity === 'ai' ||
      itemType === 'route' ||
      title.includes('route') ||
      title.includes('ai')
    ) {
      return {
        icon: Sparkles,
        iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/80',
        tagBg: 'bg-purple-50 text-purple-700 border border-purple-200/60',
        tagLabel: 'AI Route',
        unreadBorder: 'border-l-4 border-l-purple-500 bg-purple-50/30 hover:bg-purple-50/60',
      };
    }

    if (
      itemType === 'invoice' ||
      category === 'finance' ||
      title.includes('upi') ||
      title.includes('payment') ||
      title.includes('received')
    ) {
      return {
        icon: IndianRupee,
        iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80',
        tagBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
        tagLabel: 'Payment',
        unreadBorder: 'border-l-4 border-l-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60',
      };
    }

    if (
      itemType === 'approval' ||
      severity === 'warning' ||
      title.includes('approval')
    ) {
      return {
        icon: ShieldAlert,
        iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/80',
        tagBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
        tagLabel: 'Approval',
        unreadBorder: 'border-l-4 border-l-amber-500 bg-amber-50/30 hover:bg-amber-50/60',
      };
    }

    if (
      itemType === 'lead' ||
      title.includes('lead') ||
      title.includes('ad')
    ) {
      return {
        icon: UserPlus,
        iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/80',
        tagBg: 'bg-teal-50 text-teal-700 border border-teal-200/60',
        tagLabel: 'WhatsApp Lead',
        unreadBorder: 'border-l-4 border-l-teal-500 bg-teal-50/30 hover:bg-teal-50/60',
      };
    }

    if (
      itemType === 'conversation' ||
      itemType === 'appointment' ||
      title.includes('booking')
    ) {
      return {
        icon: Calendar,
        iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/80',
        tagBg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
        tagLabel: 'Booking',
        unreadBorder: 'border-l-4 border-l-blue-500 bg-blue-50/30 hover:bg-blue-50/60',
      };
    }

    // Default system
    return {
      icon: Bell,
      iconBg: 'bg-slate-100 text-slate-600 border border-slate-200',
      tagBg: 'bg-slate-100 text-slate-700 border border-slate-200/60',
      tagLabel: 'System',
      unreadBorder: 'border-l-4 border-l-slate-400 bg-slate-50 hover:bg-slate-100/70',
    };
  };

  const handleOpenRecord = (e: React.MouseEvent, item: QNotification) => {
    e.stopPropagation();
    onClose();
    handleNotificationClick(item);
  };

  const handleDismiss = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    dismissNotification(id);
  };

  const handleNavigateToSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    setActiveTab('settings-notifications');
  };

  return (
    <>
      {/* Background backdrop click surface */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/10 cursor-default"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown Container */}
      <div
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute -right-2 sm:right-[-6px] top-full mt-2.5 w-[360px] sm:w-[410px] max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200 z-50 text-xs overflow-hidden flex flex-col select-none"
      >
        {/* Caret pointing directly at Bell icon */}
        <div className="absolute -top-1.5 right-4.5 w-3.5 h-3.5 bg-white border-t border-l border-slate-200 rotate-45 z-20 shadow-xs pointer-events-none" />

        {/* ── TOP HEADER ── */}
        <div className="relative z-10 px-4 pt-3.5 pb-2.5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4 text-slate-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="bg-rose-500/10 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-rose-200">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 text-slate-400">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllNotificationsRead()}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
              {safeNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAllNotifications()}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleNavigateToSettings}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notification Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer sm:hidden"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── FILTER TABS ── */}
          <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-100/80">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>All</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    activeFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {safeNotifications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'unread'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      activeFilter === 'unread'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-rose-100 text-rose-700 font-bold'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('alerts')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'alerts'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>Alerts</span>
                {alertsCount > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      activeFilter === 'alerts'
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-amber-100 text-amber-800 font-bold'
                    }`}
                  >
                    {alertsCount}
                  </span>
                )}
              </button>
            </div>

            {filteredNotifications.length > visibleCount && (
              <span className="text-[10px] text-slate-400 font-medium">
                {visibleCount} of {filteredNotifications.length}
              </span>
            )}
          </div>
        </div>

        {/* ── NOTIFICATION LIST (High-Performance Windowed Rendering) ── */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1.5 bg-slate-50/50"
        >
          {filteredNotifications.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-800 text-xs">
                  {activeFilter === 'unread'
                    ? 'All caught up!'
                    : activeFilter === 'alerts'
                    ? 'No active alerts'
                    : 'No notifications'}
                </div>
                <div className="text-[11px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                  {activeFilter === 'unread'
                    ? 'You have read all received updates.'
                    : activeFilter === 'alerts'
                    ? 'No urgent delays or pending approvals.'
                    : 'Incoming leads, jobs, and payments will appear here.'}
                </div>
              </div>

              {safeNotifications.length === 0 && (
                <button
                  type="button"
                  onClick={() => resetNotificationsToDefault()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer mt-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restore sample alerts</span>
                </button>
              )}
            </div>
          ) : (
            displayedNotifications.map((n, idx) => {
              const config = getVisualConfig(n);
              const IconComp = config.icon;
              const safeId = n?.id != null ? n.id : idx;
              const safeKey = `notif-${safeId}-${idx}`;

              return (
                <div
                  key={safeKey}
                  onClick={(e) => handleOpenRecord(e, n)}
                  className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                    n.unread
                      ? `${config.unreadBorder} border-slate-200/80 shadow-xs`
                      : 'bg-white border-slate-200/60 hover:bg-slate-50/90 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Left Icon Badge */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${config.iconBg}`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Top meta row */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${config.tagBg}`}
                          >
                            {config.tagLabel}
                          </span>
                          {n.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 inline" />
                            {n.time || 'Recent'}
                          </span>

                          {/* Dismiss Button on Hover */}
                          <button
                            type="button"
                            onClick={(e) => handleDismiss(e, n.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Dismiss notification"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <div
                        className={`text-xs font-semibold leading-snug line-clamp-1 ${
                          n.unread ? 'text-slate-900 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {n.title || 'Notification'}
                      </div>

                      {/* Text */}
                      {n.text && (
                        <div className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {n.text}
                        </div>
                      )}

                      {/* Bottom action row */}
                      <div className="pt-0.5 flex items-center justify-end">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group-hover:translate-x-0.5 transform duration-150">
                          <span>Open record</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Load More Button for large notification counts */}
          {visibleCount < filteredNotifications.length && (
            <div className="pt-1.5 pb-1 px-1">
              <button
                type="button"
                onClick={handleLoadMore}
                className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Load More ({filteredNotifications.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="px-3.5 py-2.5 border-t border-slate-100 bg-white flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="text-[10px] text-slate-400">
            {safeNotifications.length} total alert{safeNotifications.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={handleNavigateToSettings}
            className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            <span>Alerts & Sound Settings</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </>
  );
};

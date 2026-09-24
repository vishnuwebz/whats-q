import React, { useState, useEffect, useRef } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;
  const alertsCount = notifications.filter(
    (n) => n.severity === 'error' || n.severity === 'warning' || n.category === 'alerts'
  ).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return n.unread;
    if (activeFilter === 'alerts') {
      return n.severity === 'error' || n.severity === 'warning' || n.category === 'alerts';
    }
    return true;
  });

  const getVisualConfig = (item: QNotification) => {
    // 1. By itemType or severity or title keywords
    if (
      item.severity === 'error' ||
      item.itemType === 'job' ||
      item.category === 'alerts' ||
      item.title.toLowerCase().includes('overdue') ||
      item.title.toLowerCase().includes('delayed')
    ) {
      return {
        icon: AlertTriangle,
        iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/80',
        tagBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
        tagLabel: 'Alert',
        unreadBorder: 'border-l-4 border-l-rose-500 bg-rose-50/30 hover:bg-rose-50/60',
      };
    }

    if (
      item.severity === 'ai' ||
      item.itemType === 'route' ||
      item.title.toLowerCase().includes('route') ||
      item.title.toLowerCase().includes('ai')
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
      item.itemType === 'invoice' ||
      item.category === 'finance' ||
      item.title.toLowerCase().includes('upi') ||
      item.title.toLowerCase().includes('payment') ||
      item.title.toLowerCase().includes('received')
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
      item.itemType === 'approval' ||
      item.severity === 'warning' ||
      item.title.toLowerCase().includes('approval')
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
      item.itemType === 'lead' ||
      item.title.toLowerCase().includes('lead') ||
      item.title.toLowerCase().includes('ad')
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
      item.itemType === 'conversation' ||
      item.itemType === 'appointment' ||
      item.title.toLowerCase().includes('booking')
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

  const handleNavigateToSettings = () => {
    onClose();
    setActiveTab('settings');
  };

  return (
    <>
      {/* Background backdrop click surface */}
      <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[0.5px]" onClick={onClose} />

      {/* Dropdown Container */}
      <div
        ref={dropdownRef}
        className="absolute -right-2 sm:right-[-6px] top-full mt-2.5 w-[360px] sm:w-[395px] max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200 z-50 text-xs overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
      >
        {/* Caret pointing directly at Bell icon */}
        <div className="absolute -top-1.5 right-4.5 w-3.5 h-3.5 bg-white border-t border-l border-slate-200 rotate-45 z-20 shadow-xs" />

        {/* ── TOP HEADER ── */}
        <div className="relative z-10 px-4 pt-3.5 pb-2.5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
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
                  onClick={() => markAllNotificationsRead()}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => clearAllNotifications()}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleNavigateToSettings}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notification Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer sm:hidden"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── FILTER TABS ── */}
          <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-slate-100/80">
            <button
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
                {notifications.length}
              </span>
            </button>

            <button
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
        </div>

        {/* ── NOTIFICATION LIST ── */}
        <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2 space-y-1.5 bg-slate-50/50">
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

              {notifications.length === 0 && (
                <button
                  onClick={() => resetNotificationsToDefault()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer mt-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restore sample alerts</span>
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const config = getVisualConfig(n);
              const IconComp = config.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    onClose();
                    handleNotificationClick(n);
                  }}
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
                            {n.time}
                          </span>

                          {/* Dismiss Button on Hover */}
                          <button
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
                        {n.title}
                      </div>

                      {/* Text */}
                      <div className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {n.text}
                      </div>

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
        </div>

        {/* ── FOOTER ── */}
        <div className="px-3.5 py-2.5 border-t border-slate-100 bg-white flex items-center justify-between text-[11px] text-slate-500">
          <span className="text-[10px] text-slate-400">
            {notifications.length} total alert{notifications.length === 1 ? '' : 's'}
          </span>
          <button
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

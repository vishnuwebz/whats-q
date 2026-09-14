import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Search, Calendar, Filter, Download, Plus, Bell, HelpCircle,
  X, Check, ExternalLink, Sparkles, MessageSquare, AlertCircle, ArrowRight,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

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
  const {
    activeTab,
    setActiveTab,
    setIsSimulatorOpen,
    addToast,
    versionInfo,
    setIsUpdateModalOpen,
    isSidebarCollapsed,
    toggleSidebarCollapse
  } = useQiyamStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('May 1 – May 31, 2024');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(6);

  const notifications = [
    { id: 1, title: 'New Booking from Amit Verma', text: 'AC Repair in Koyilandy scheduled for tomorrow 10:00 AM.', time: '2m ago', unread: true, target: 'conversations' as const },
    { id: 2, title: 'UPI Payment Received ₹2,800', text: 'Priya Sharma completed 30% advance via GPay.', time: '15m ago', unread: true, target: 'finance-invoices' as const },
    { id: 3, title: 'Overdue Job Flagged', text: 'Job #JOB-1024 delayed near Beach Road. Assign Amit Sharma.', time: '30m ago', unread: true, target: 'ops-jobs' as const },
    { id: 4, title: 'AI Route RTE-001 Ready', text: '12-stop GPS optimized route created for Ramesh Kumar.', time: '1h ago', unread: true, target: 'ops-routes' as const },
    { id: 5, title: 'New WhatsApp Click-to-Ad Lead', text: 'Inquiry from +91 90000 11123 for AC Installation.', time: '2h ago', unread: true, target: 'crm-leads' as const },
    { id: 6, title: 'Purchase Approval Needed', text: 'Warehouse spare parts request APR-1024 (₹25,000) pending.', time: '3h ago', unread: true, target: 'automation-approvals' as const },
  ];

  const handleExport = () => {
    addToast('Data exported successfully (CSV / XLSX)', 'success');
  };

  const handleFilter = () => {
    addToast('Filter options applied for ' + title, 'info');
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Title & Subtitle with Sidebar Toggle */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={toggleSidebarCollapse}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all border border-slate-200/80 shadow-xs cursor-pointer"
          title={isSidebarCollapsed ? "Expand sidebar (Ctrl + B)" : "Collapse sidebar (Ctrl + B)"}
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
        {/* Global Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search (Ctrl + /)"
            className="pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-52"
          />
        </div>

        {/* Date Range Selector Popover */}
        <div className="relative">
          <button
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{selectedPeriod}</span>
          </button>

          {isDateOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
              {['Today', 'This Week', 'May 1 – May 31, 2024', 'Last Month', 'Year to Date (2024)'].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    setIsDateOpen(false);
                    addToast(`Date filter updated: ${p}`, 'info');
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedPeriod === p ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{p}</span>
                  {selectedPeriod === p && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={handleFilter}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter</span>
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all cursor-pointer"
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

        {/* Notifications Icon with Interactive Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={() => {
                      setUnreadNotifsCount(0);
                      addToast('All notifications marked as read', 'info');
                    }}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setIsNotifOpen(false);
                      setActiveTab(n.target);
                      addToast(`Opened ${n.title}`, 'info');
                    }}
                    className="pt-2 pb-1 hover:bg-slate-50 p-2 rounded-xl cursor-pointer transition-colors space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-snug">{n.text}</div>
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs">
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
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1 font-medium">
                <div>• <strong>Simulate Messages:</strong> Click "💬 WhatsApp Sim" in the top header.</div>
                <div>• <strong>Automation Builder:</strong> Navigate to Automation → Workflow Builder.</div>
                <div>• <strong>Route Optimizer:</strong> Check Operations → Route Optimization.</div>
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
  );
};

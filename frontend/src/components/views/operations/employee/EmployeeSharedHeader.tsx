import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { TabType } from '@/types';
import {
  Users, User, Clock, Calendar, Navigation, Coffee,
  Award, Target, Sparkles, ReceiptText, Timer, FileCheck,
  ChevronRight, ArrowLeft, Plus, ShieldCheck
} from 'lucide-react';

export interface EmployeeSharedHeaderProps {
  title: string;
  subtitle: string;
  activeSubTab: TabType;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionIcon?: React.ComponentType<{ className?: string }>;
  badgeCount?: number | string;
}

export const EMPLOYEE_NAV_TABS: {
  id: TabType;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  simpleDesc: string;
  badgeKey?: string;
}[] = [
  { id: 'ops-employees', label: 'Overview Hub', shortLabel: 'Hub', icon: Users, simpleDesc: 'Main Summary & Shortcuts' },
  { id: 'ops-emp-directory', label: 'Employee Directory', shortLabel: 'Directory', icon: Users, simpleDesc: 'Staff List & Contacts' },
  { id: 'ops-emp-profiles', label: 'Employee Profiles', shortLabel: 'Profiles', icon: User, simpleDesc: 'Staff Details & ID Cards' },
  { id: 'ops-emp-attendance', label: 'Attendance & Work Hours', shortLabel: 'Attendance', icon: Clock, simpleDesc: 'Daily Duty & Punch Records' },
  { id: 'ops-emp-leaves', label: 'Leave Management', shortLabel: 'Leaves', icon: Calendar, simpleDesc: 'Leave Requests & Balance' },
  { id: 'ops-emp-monitoring', label: 'Employee Monitoring', shortLabel: 'Monitoring', icon: Navigation, simpleDesc: 'Live Duty & Location Tracking' },
  { id: 'ops-emp-breaks', label: 'Work Breaks & Alerts', shortLabel: 'Breaks', icon: Coffee, simpleDesc: 'Tea/Lunch Breaks & Alerts' },
  { id: 'ops-emp-performance', label: 'Performance & Reviews', shortLabel: 'Performance', icon: Award, simpleDesc: 'Star Ratings & Customer Reviews' },
  { id: 'ops-emp-productivity', label: 'Goals & Productivity', shortLabel: 'Goals', icon: Target, simpleDesc: 'Daily Targets & Work Speed' },
  { id: 'ops-emp-rewards', label: 'Rewards & Perks', shortLabel: 'Rewards', icon: Sparkles, simpleDesc: 'Bonuses, Gifts & Star Worker' },
  { id: 'ops-emp-vouchers', label: 'Voucher Claims', shortLabel: 'Vouchers', icon: ReceiptText, simpleDesc: 'Bill Claims & Petrol Expenses' },
  { id: 'ops-emp-overtime', label: 'Extra Work / Overtime', shortLabel: 'Overtime', icon: Timer, simpleDesc: 'OT Hours & Extra Duty Pay' },
  { id: 'ops-emp-onboarding', label: 'Onboarding & Documents', shortLabel: 'Documents', icon: FileCheck, simpleDesc: 'Aadhaar, PAN & Joining Records' },
];

export const EmployeeSharedHeader: React.FC<EmployeeSharedHeaderProps> = ({
  title,
  subtitle,
  activeSubTab,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionIcon: PrimaryIcon = Plus,
  badgeCount,
}) => {
  const { setActiveTab } = useQiyamStore();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const activeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (activeButtonRef.current) {
      activeButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSubTab]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Bar with Breadcrumbs and Main Action */}
      <div className="px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
        <div className="space-y-1">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button
              onClick={() => {
                setActiveTab('ops-employees');
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1 text-slate-600"
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Employee Management</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold truncate">{title}</span>
            {badgeCount !== undefined && (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {badgeCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeSubTab !== 'ops-employees' && (
              <button
                onClick={() => {
                  setActiveTab('ops-employees');
                  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-1.5 -ml-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Back to Employee Hub"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        {primaryActionLabel && onPrimaryAction && (
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={onPrimaryAction}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PrimaryIcon className="w-4 h-4" />
              <span>{primaryActionLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Nav Switcher with Mouse-Wheel Scroll & Auto Active Centering */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="px-4 sm:px-6 bg-slate-50/70 overflow-x-auto scrollbar-none select-none"
      >
        <div className="flex items-center gap-1.5 py-2 min-w-max">
          {EMPLOYEE_NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                ref={isActive ? activeButtonRef : undefined}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-bold scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title={tab.simpleDesc}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown,
  Check, X, ArrowRight, Clock, ChevronsLeft, ChevronsRight, RotateCcw
} from 'lucide-react';

export interface DateRangeValue {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  label?: string;
}

export interface ModernDateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  value?: DateRangeValue;
  onApply: (range: DateRangeValue) => void;
  title?: string;
}

export const ModernDateRangePicker: React.FC<ModernDateRangePickerProps> = ({
  isOpen,
  onClose,
  value,
  onApply,
  title = 'Select Date Range',
}) => {
  const now = new Date();
  const getPad = (n: number) => String(n).padStart(2, '0');
  const formatYMD = (d: Date) => `${d.getFullYear()}-${getPad(d.getMonth() + 1)}-${getPad(d.getDate())}`;

  const todayStr = formatYMD(now);
  const yestStr = formatYMD(new Date(now.getTime() - 86400000));
  const weekStartStr = formatYMD(new Date(now.getTime() - 7 * 86400000));
  const month30StartStr = formatYMD(new Date(now.getTime() - 30 * 86400000));
  const monthStartStr = `${now.getFullYear()}-${getPad(now.getMonth() + 1)}-01`;
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEndStr = `${now.getFullYear()}-${getPad(now.getMonth() + 1)}-${getPad(lastDayOfMonth)}`;

  const isAllTimeVal = !value?.startDate || value.startDate <= '2020-01-01';
  const initialStart = value?.startDate || monthStartStr;
  const initialEnd = value?.endDate || monthEndStr;

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [activePreset, setActivePreset] = useState<string>(value?.label || (isAllTimeVal ? 'All Time' : 'This Month'));

  // Calendar view navigation (Year and Month) defaults to real current year & month (e.g. Oct 2026)
  const [viewYear, setViewYear] = useState(() => {
    if (!isAllTimeVal && value?.startDate) {
      const parsed = Number(value.startDate.slice(0, 4));
      if (!isNaN(parsed) && parsed >= 2020 && parsed <= 2030) return parsed;
    }
    return now.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (!isAllTimeVal && value?.startDate) {
      const parsed = Number(value.startDate.slice(5, 7));
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) return parsed - 1;
    }
    return now.getMonth();
  });

  // Range selection state (click 1 = start, click 2 = end)
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Active selection target: 'start' | 'end'
  const [activeTarget, setActiveTarget] = useState<'start' | 'end'>('start');
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const [fromInputText, setFromInputText] = useState(startDate);
  const [toInputText, setToInputText] = useState(endDate);

  useEffect(() => {
    setFromInputText(startDate);
  }, [startDate]);

  useEffect(() => {
    setToInputText(endDate);
  }, [endDate]);

  // Sync state whenever modal opens or value changes
  useEffect(() => {
    if (isOpen) {
      const allTime = !value?.startDate || value.startDate <= '2020-01-01';
      const s = value?.startDate || monthStartStr;
      const e = value?.endDate || monthEndStr;
      setStartDate(s);
      setEndDate(e);
      setActivePreset(value?.label || (allTime ? 'All Time' : 'This Month'));

      if (!allTime && s) {
        const parts = s.split('-');
        if (parts.length >= 2) {
          const y = Number(parts[0]);
          const m = Number(parts[1]);
          if (y >= 2020 && y <= 2030 && m >= 1 && m <= 12) {
            setViewYear(y);
            setViewMonth(m - 1);
            return;
          }
        }
      }
      // For All Time or no start date, always default calendar view to current month (October 2026)
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }
  }, [isOpen, value?.startDate, value?.endDate, value?.label]);

  const presets = [
    { label: 'All Time', start: '2020-01-01', end: '2030-12-31' },
    { label: 'This Month', start: monthStartStr, end: monthEndStr },
    { label: 'Today', start: todayStr, end: todayStr },
    { label: 'Yesterday', start: yestStr, end: yestStr },
    { label: 'Last 7 Days', start: weekStartStr, end: todayStr },
    { label: 'Last 30 Days', start: month30StartStr, end: todayStr },
    { label: 'Custom Range', start: startDate, end: endDate },
  ];

  const handleSelectPreset = (p: { label: string; start: string; end: string }) => {
    setActivePreset(p.label);
    setStartDate(p.start);
    setEndDate(p.end);
    if (p.label === 'All Time') {
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    } else {
      const [y, m] = p.start.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePrevYear = () => {
    setViewYear((y) => y - 1);
  };

  const handleNextYear = () => {
    setViewYear((y) => y + 1);
  };

  // Generate calendar days for viewYear & viewMonth
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' });
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleDayClick = (dayStr: string) => {
    setActivePreset('Custom Range');
    if (activeTarget === 'start') {
      setStartDate(dayStr);
      if (endDate && dayStr > endDate) {
        setEndDate(dayStr);
      }
      setActiveTarget('end');
    } else {
      if (dayStr < startDate) {
        setEndDate(startDate);
        setStartDate(dayStr);
      } else {
        setEndDate(dayStr);
      }
    }
  };

  const isDaySelected = (dayStr: string) => {
    return dayStr === startDate || dayStr === endDate;
  };

  const isDayInRange = (dayStr: string) => {
    if (startDate && endDate) {
      return dayStr > startDate && dayStr < endDate;
    }
    if (startDate && !endDate && hoverDate) {
      const min = startDate < hoverDate ? startDate : hoverDate;
      const max = startDate < hoverDate ? hoverDate : startDate;
      return dayStr > min && dayStr < max;
    }
    return false;
  };

  const formatDateHuman = (d: string) => {
    if (!d) return '';
    try {
      const parts = d.split('-');
      if (parts.length === 3) {
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return d;
    } catch {
      return d;
    }
  };

  const formatDateDisplay = (d: string) => {
    if (!d) return 'Select Date';
    try {
      const parts = d.split('-');
      if (parts.length === 3) {
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      }
      return d;
    } catch {
      return d;
    }
  };

  const formatWeekday = (d: string) => {
    if (!d) return '';
    try {
      const parts = d.split('-');
      if (parts.length === 3) {
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { weekday: 'long' });
        }
      }
      return '';
    } catch {
      return '';
    }
  };

  const handleApply = () => {
    const finalEnd = endDate || startDate;
    const finalStart = startDate <= finalEnd ? startDate : finalEnd;
    const finalEndDate = startDate <= finalEnd ? finalEnd : startDate;

    const isAllTime = activePreset === 'All Time' || (finalStart <= '2020-01-01' && finalEndDate >= '2030-12-31');

    const label = isAllTime
      ? 'All Time'
      : activePreset !== 'Custom Range'
      ? activePreset
      : `${formatDateHuman(finalStart)} – ${formatDateHuman(finalEndDate)}`;

    onApply({
      startDate: finalStart,
      endDate: finalEndDate,
      label,
    });
    onClose();
  };

  const handleResetAllTime = () => {
    setActivePreset('All Time');
    setStartDate('2020-01-01');
    setEndDate('2030-12-31');
    onApply({
      startDate: '2020-01-01',
      endDate: '2030-12-31',
      label: 'All Time',
    });
    onClose();
  };

  const handleQuickToday = () => {
    setActivePreset('Custom Range');
    setStartDate(todayStr);
    setEndDate(todayStr);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setActiveTarget('end');
  };

  const handleQuickThisMonth = () => {
    setActivePreset('This Month');
    setStartDate(monthStartStr);
    setEndDate(monthEndStr);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setActiveTarget('start');
  };

  const handleQuickClear = () => {
    setActivePreset('Custom Range');
    setStartDate(todayStr);
    setEndDate('');
    setActiveTarget('start');
  };

  const handleManualDateChange = (val: string, target: 'start' | 'end') => {
    if (target === 'start') {
      setFromInputText(val);
    } else {
      setToInputText(val);
    }

    // Try parsing YYYY-MM-DD or DD-MM-YYYY
    const trimmed = val.trim();
    const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    let parsed: string | null = null;
    if (isoMatch) {
      const [_, y, m, d] = isoMatch;
      parsed = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else {
      const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (dmyMatch) {
        const [_, d, m, y] = dmyMatch;
        parsed = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }

    if (parsed) {
      setActivePreset('Custom Range');
      if (target === 'start') {
        setStartDate(parsed);
        const [y, m] = parsed.split('-').map(Number);
        if (y && m) {
          setViewYear(y);
          setViewMonth(m - 1);
        }
      } else {
        setEndDate(parsed);
        const [y, m] = parsed.split('-').map(Number);
        if (y && m) {
          setViewYear(y);
          setViewMonth(m - 1);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col md:flex-row text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: Quick Presets */}
        <div className="w-full md:w-56 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick Presets</span>
            </div>
            <div className="space-y-1">
              {presets.map((p) => {
                const isSelected = activePreset === p.label;
                return (
                  <button
                    key={p.label}
                    onClick={() => handleSelectPreset(p)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{p.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block pt-4 border-t border-slate-200 text-[11px] text-slate-500">
            Click on From or To date cards to switch selection, or click directly on the calendar days below.
          </div>
        </div>

        {/* Right Column: Custom Calendar & From-To Inputs */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Custom Modern From - To Range Cards (Zero Native Browser UI) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            {/* FROM DATE CARD */}
            <div
              onClick={() => {
                setActiveTarget('start');
                if (startDate) {
                  const [y, m] = startDate.split('-').map(Number);
                  if (y && m) {
                    setViewYear(y);
                    setViewMonth(m - 1);
                  }
                }
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                activeTarget === 'start'
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  From Date
                </span>
                {activeTarget === 'start' ? (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active Pick
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-400">Click to set</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  {formatDateDisplay(startDate)}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 font-mono">
                  {startDate}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-medium">
                <span>{formatWeekday(startDate) || 'Start date'}</span>
                <input
                  type="text"
                  value={fromInputText}
                  placeholder="YYYY-MM-DD"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTarget('start');
                  }}
                  onChange={(e) => handleManualDateChange(e.target.value, 'start')}
                  className="w-20 text-[10px] font-mono text-right bg-transparent text-slate-500 hover:text-slate-800 focus:outline-none focus:text-emerald-700"
                  title="Manual input (YYYY-MM-DD or DD-MM-YYYY)"
                />
              </div>
            </div>

            {/* TO DATE CARD */}
            <div
              onClick={() => {
                setActiveTarget('end');
                const targetDate = endDate || startDate;
                if (targetDate) {
                  const [y, m] = targetDate.split('-').map(Number);
                  if (y && m) {
                    setViewYear(y);
                    setViewMonth(m - 1);
                  }
                }
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                activeTarget === 'end'
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  To Date
                </span>
                {activeTarget === 'end' ? (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active Pick
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-400">Click to set</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  {formatDateDisplay(endDate || startDate)}
                </span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100 font-mono">
                  {endDate || startDate}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-medium">
                <span>{formatWeekday(endDate || startDate) || 'End date'}</span>
                <input
                  type="text"
                  value={toInputText}
                  placeholder="YYYY-MM-DD"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTarget('end');
                  }}
                  onChange={(e) => handleManualDateChange(e.target.value, 'end')}
                  className="w-20 text-[10px] font-mono text-right bg-transparent text-slate-500 hover:text-slate-800 focus:outline-none focus:text-emerald-700"
                  title="Manual input (YYYY-MM-DD or DD-MM-YYYY)"
                />
              </div>
            </div>
          </div>

          {/* Visual Interactive Month Calendar */}
          <div className="space-y-2">
            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevYear}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Previous Year"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Month/Year Header Button with Dropdown Indicator */}
              <button
                type="button"
                onClick={() => setShowMonthSelect(!showMonthSelect)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-xs transition cursor-pointer"
                title="Click to quickly pick month or year"
              >
                <span>{monthName}</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                  {viewYear}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showMonthSelect ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextYear}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Next Year"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Month / Year Picker Matrix */}
            {showMonthSelect ? (
              <div className="py-2 px-1 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Month & Year
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y - 1)}
                      className="px-2 py-0.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 text-[10px] font-bold cursor-pointer"
                    >
                      -1 Y
                    </button>
                    <span className="font-bold text-slate-900 text-xs px-1.5">{viewYear}</span>
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y + 1)}
                      className="px-2 py-0.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 text-[10px] font-bold cursor-pointer"
                    >
                      +1 Y
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {shortMonthNames.map((mName, mIdx) => {
                    const isCurrent = mIdx === viewMonth;
                    return (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => {
                          setViewMonth(mIdx);
                          setShowMonthSelect(false);
                        }}
                        className={`py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
                          isCurrent
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        {mName}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Days of week header */}
                <div className="grid grid-cols-7 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Day Cells Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Previous month leading days */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                    const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
                    const prevM = viewMonth === 0 ? 12 : viewMonth;
                    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
                    const targetStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    return (
                      <button
                        key={`prev-${i}`}
                        type="button"
                        onClick={() => {
                          handlePrevMonth();
                          handleDayClick(targetStr);
                        }}
                        className="py-1.5 text-slate-300 hover:text-slate-500 rounded-lg transition text-[11px] cursor-pointer"
                        title={`Go to ${targetStr}`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}

                  {/* Current month days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const mStr = String(viewMonth + 1).padStart(2, '0');
                    const dStr = String(dayNum).padStart(2, '0');
                    const dayDateStr = `${viewYear}-${mStr}-${dStr}`;

                    const isSelected = isDaySelected(dayDateStr);
                    const inRange = isDayInRange(dayDateStr);
                    const isStart = dayDateStr === startDate;
                    const isEnd = dayDateStr === endDate;
                    const isToday = dayDateStr === todayStr;

                    return (
                      <button
                        key={dayDateStr}
                        type="button"
                        onClick={() => handleDayClick(dayDateStr)}
                        onMouseEnter={() => setHoverDate(dayDateStr)}
                        className={`h-8 rounded-lg text-xs font-semibold transition relative cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-xs z-10 scale-105'
                            : inRange
                            ? 'bg-emerald-100/70 text-emerald-950 rounded-none font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        } ${isStart ? 'rounded-l-lg' : ''} ${isEnd ? 'rounded-r-lg' : ''}`}
                      >
                        <span>{dayNum}</span>
                        {isToday && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Shortcuts Bar below Calendar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleQuickClear}
                      className="px-2 py-0.5 text-slate-400 hover:text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickToday}
                      className="px-2 py-0.5 text-emerald-700 hover:text-emerald-800 font-bold rounded-lg hover:bg-emerald-50 transition cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickThisMonth}
                      className="px-2 py-0.5 text-slate-600 hover:text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      This Month
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {activeTarget === 'start' ? 'Next click: From Date' : 'Next click: To Date'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Active Range Summary */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                {formatDateHuman(startDate)}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">
                {endDate ? formatDateHuman(endDate) : formatDateHuman(startDate)}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              {activePreset}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetAllTime}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold rounded-xl text-xs transition cursor-pointer"
              title="Show all records across all time"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Time</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

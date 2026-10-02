import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface ModernDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  required?: boolean;
  align?: 'left' | 'right';
}

export const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  placeholder = 'Select date',
  className = '',
  compact = false,
  disabled = false,
  required = false,
  align = 'left',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showMonthSelect, setShowMonthSelect] = useState(false);

  // Today's Date
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  // Initial Year & Month view
  const initialDate = useMemo(() => {
    if (value && !isNaN(Date.parse(value))) {
      return new Date(value);
    }
    return today;
  }, [value, today]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Sync view when opened
  useEffect(() => {
    if (isOpen) {
      setShowMonthSelect(false);
      if (value && !isNaN(Date.parse(value))) {
        const d = new Date(value);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [isOpen, value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowMonthSelect(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Presets
  const presets = useMemo(() => {
    const addDays = (num: number) => {
      const d = new Date();
      d.setDate(d.getDate() + num);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return [
      { label: 'Today', date: todayStr },
      { label: 'Tomorrow', date: addDays(1) },
      { label: 'In 3 Days', date: addDays(3) },
      { label: 'Next Week', date: addDays(7) },
    ];
  }, [todayStr]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Calendar Grid computation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }> = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 12 : viewMonth;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isDisabled = Boolean((minDate && dStr < minDate) || (maxDate && dStr > maxDate));
      days.push({
        dateStr: dStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
        isDisabled,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = Boolean((minDate && dStr < minDate) || (maxDate && dStr > maxDate));
      days.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
        isDisabled,
      });
    }

    // Next month padding to fill complete weeks
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 1 : viewMonth + 2;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = Boolean((minDate && dStr < minDate) || (maxDate && dStr > maxDate));
      days.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
        isDisabled,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr, value, minDate, maxDate]);

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

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    onChange(todayStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Formatted trigger label
  const displayLabel = useMemo(() => {
    if (!value) return placeholder;
    if (value === todayStr) {
      const d = new Date(value);
      return `Today (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    // Check if tomorrow
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const tomStr = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(
      tom.getDate()
    ).padStart(2, '0')}`;

    if (value === tomStr) {
      return `Tomorrow (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    }

    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [value, todayStr, placeholder]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="font-semibold text-slate-700 block mb-1 text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer group shadow-2xs ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''} ${
          isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className={`font-semibold truncate ${value ? 'text-slate-800' : 'text-slate-400 font-normal'}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Modern Popover Calendar */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 text-xs w-76 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1 mb-2.5 pb-2.5 border-b border-slate-100">
            {presets.map((p) => {
              const isSelected = value === p.date;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectDay(p.date)}
                  className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Month / Year Navigation & Switcher */}
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowMonthSelect(!showMonthSelect)}
              className="px-2 py-0.5 rounded-lg hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <span>{monthNames[viewMonth]} {viewYear}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showMonthSelect ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Month Select Matrix */}
          {showMonthSelect ? (
            <div className="py-2 space-y-2">
              <div className="flex items-center justify-between pb-1 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Month ({viewYear})</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewYear((y) => y - 1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 text-[10px] font-bold"
                  >
                    -1 Y
                  </button>
                  <span className="font-bold text-slate-800 text-[11px] px-1">{viewYear}</span>
                  <button
                    type="button"
                    onClick={() => setViewYear((y) => y + 1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 text-[10px] font-bold"
                  >
                    +1 Y
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
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
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
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
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1 py-0.5 border-b border-slate-100">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((d, idx) => {
                  return (
                    <button
                      key={`${d.dateStr}-${idx}`}
                      type="button"
                      disabled={d.isDisabled || !d.isCurrentMonth}
                      onClick={() => !d.isDisabled && d.isCurrentMonth && handleSelectDay(d.dateStr)}
                      className={`h-7 w-7 mx-auto rounded-lg text-[11px] font-medium flex items-center justify-center transition-all ${
                        d.isDisabled
                          ? 'opacity-25 cursor-not-allowed text-slate-300'
                          : !d.isCurrentMonth
                          ? 'text-slate-300 opacity-40 cursor-default'
                          : d.isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs scale-105 cursor-pointer'
                          : d.isToday
                          ? 'border border-emerald-500 text-emerald-700 font-bold bg-emerald-50/50 cursor-pointer'
                          : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
                      }`}
                    >
                      {d.dayNum}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Action Bar with Clear and Today */}
          <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-700 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-emerald-700 hover:text-emerald-800 font-bold px-2 py-1 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface ModernDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  label?: string;
  minDate?: string;
  placeholder?: string;
  className?: string;
}

export const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  value,
  onChange,
  label,
  minDate,
  placeholder = 'Select date',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

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
    if (isOpen && value && !isNaN(Date.parse(value))) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [isOpen, value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
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
      { label: 'In 2 Days', date: addDays(2) },
      { label: 'Next Week', date: addDays(7) },
    ];
  }, [todayStr]);

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
    }> = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 12 : viewMonth;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
      });
    }

    // Next month padding to fill complete weeks (up to 35 or 42 cells)
    const remaining = 42 - days.length;
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextM = viewMonth === 11 ? 1 : viewMonth + 2;
        const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
        const dStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({
          dateStr: dStr,
          dayNum: d,
          isCurrentMonth: false,
          isToday: dStr === todayStr,
          isSelected: dStr === value,
        });
      }
    }

    return days;
  }, [viewYear, viewMonth, todayStr, value]);

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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="font-semibold text-slate-700 block mb-1">{label}</label>}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between text-left text-xs transition-all focus:ring-1 focus:ring-emerald-500 focus:bg-white cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Modern Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 text-xs w-72 animate-in fade-in zoom-in-95 duration-100">
          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1 mb-2.5 pb-2 border-b border-slate-100">
            {presets.map((p) => {
              const isSelected = value === p.date;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectDay(p.date)}
                  className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Month / Year Navigation */}
          <div className="flex items-center justify-between mb-2 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs text-slate-800">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1">
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
                  disabled={!d.isCurrentMonth}
                  onClick={() => d.isCurrentMonth && handleSelectDay(d.dateStr)}
                  className={`h-7 w-7 mx-auto rounded-lg text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer ${
                    !d.isCurrentMonth
                      ? 'text-slate-300 opacity-40 cursor-default'
                      : d.isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : d.isToday
                      ? 'border border-emerald-500 text-emerald-700 font-bold bg-emerald-50/50'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {d.dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

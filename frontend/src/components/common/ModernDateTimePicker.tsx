import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  Check,
  X,
} from 'lucide-react';

export interface ModernDateTimePickerProps {
  value: string; // ISO string or 'YYYY-MM-DDTHH:mm:ss' or 'YYYY-MM-DDTHH:mm'
  onChange: (value: string) => void;
  minDateTime?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const ModernDateTimePicker: React.FC<ModernDateTimePickerProps> = ({
  value,
  onChange,
  minDateTime,
  placeholder = 'Select dispatch date & time',
  className = '',
  disabled = false,
  required = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // Helper to parse input value
  const parseValue = (valStr: string) => {
    let d = new Date(valStr);
    if (isNaN(d.getTime())) {
      d = new Date(Date.now() + 3600000); // 1 hour from now default
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours24 = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    const meridiem = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

    return {
      dateStr: `${year}-${month}-${day}`,
      viewYear: year,
      viewMonth: d.getMonth(),
      hour: hours12,
      minute: minutes,
      second: seconds,
      meridiem: meridiem as 'AM' | 'PM',
    };
  };

  const initial = parseValue(value);

  const [viewYear, setViewYear] = useState(initial.viewYear);
  const [viewMonth, setViewMonth] = useState(initial.viewMonth);
  const [selectedDate, setSelectedDate] = useState(initial.dateStr);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [second, setSecond] = useState(initial.second);
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>(initial.meridiem);

  // Input text states for typing smoothly with two-digit formatting
  const [hourInput, setHourInput] = useState(String(initial.hour).padStart(2, '0'));
  const [minInput, setMinInput] = useState(String(initial.minute).padStart(2, '0'));
  const [secInput, setSecInput] = useState(String(initial.second).padStart(2, '0'));

  // Sync internal state when external value changes while closed
  useEffect(() => {
    if (!isOpen && value) {
      const parsed = parseValue(value);
      setViewYear(parsed.viewYear);
      setViewMonth(parsed.viewMonth);
      setSelectedDate(parsed.dateStr);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setSecond(parsed.second);
      setMeridiem(parsed.meridiem);
      setHourInput(String(parsed.hour).padStart(2, '0'));
      setMinInput(String(parsed.minute).padStart(2, '0'));
      setSecInput(String(parsed.second).padStart(2, '0'));
    }
  }, [value, isOpen]);

  // Construct ISO-like string: YYYY-MM-DDTHH:mm:ss
  const buildCurrentDateTimeString = (
    dStr: string,
    h12: number,
    m: number,
    s: number,
    mer: 'AM' | 'PM'
  ) => {
    let h24 = h12 % 12;
    if (mer === 'PM') h24 += 12;
    const hh = String(h24).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${dStr}T${hh}:${mm}:${ss}`;
  };

  const currentConstructedString = buildCurrentDateTimeString(
    selectedDate,
    hour,
    minute,
    second,
    meridiem
  );

  // Fixed viewport positioning calculation with strict clamping
  useEffect(() => {
    if (!isOpen) return;

    const compute = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = Math.min(340, window.innerWidth - 24);
      const popoverHeight = 510;

      // Preferred position: below the trigger
      let idealTop = rect.bottom + 8;
      const spaceBelow = window.innerHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;

      if (spaceBelow < popoverHeight) {
        if (spaceAbove >= popoverHeight) {
          // Fits cleanly above
          idealTop = rect.top - popoverHeight - 8;
        } else {
          // In between: center vertically in the viewport with safe margins
          idealTop = Math.max(16, (window.innerHeight - popoverHeight) / 2);
        }
      }

      // CRITICAL CLAMP: top is NEVER less than 16px! (Prevents top clipping completely)
      const maxAllowedTop = Math.max(16, window.innerHeight - popoverHeight - 16);
      const clampedTop = Math.max(16, Math.min(idealTop, maxAllowedTop));

      // Horizontal clamp:
      let idealLeft = rect.right - popoverWidth;
      if (idealLeft < 12) idealLeft = 12;
      if (idealLeft + popoverWidth > window.innerWidth - 12) {
        idealLeft = window.innerWidth - popoverWidth - 12;
      }

      setCoords({ top: clampedTop, left: idealLeft });
    };

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [isOpen]);

  // Calendar generation logic (identical to Screenshot 2 & ModernDateRangePicker)
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' });
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

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

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectDay = (dayDateStr: string) => {
    setSelectedDate(dayDateStr);
    const updated = buildCurrentDateTimeString(dayDateStr, hour, minute, second, meridiem);
    onChange(updated);
  };

  const handleTimeChange = (
    newHour: number,
    newMinute: number,
    newSecond: number,
    newMeridiem: 'AM' | 'PM',
    syncInputs: boolean = true
  ) => {
    setHour(newHour);
    setMinute(newMinute);
    setSecond(newSecond);
    setMeridiem(newMeridiem);
    if (syncInputs) {
      setHourInput(String(newHour).padStart(2, '0'));
      setMinInput(String(newMinute).padStart(2, '0'));
      setSecInput(String(newSecond).padStart(2, '0'));
    }

    const updated = buildCurrentDateTimeString(
      selectedDate,
      newHour,
      newMinute,
      newSecond,
      newMeridiem
    );
    onChange(updated);
  };

  // Steppers for hour, minute, second
  const handleHourStep = (delta: number) => {
    let next = hour + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    handleTimeChange(next, minute, second, meridiem, true);
  };

  const handleMinuteStep = (delta: number) => {
    let next = minute + delta;
    if (next > 59) next = 0;
    if (next < 0) next = 59;
    handleTimeChange(hour, next, second, meridiem, true);
  };

  const handleSecondStep = (delta: number) => {
    let next = second + delta;
    if (next > 59) next = 0;
    if (next < 0) next = 59;
    handleTimeChange(hour, minute, next, meridiem, true);
  };

  // Quick preset helpers
  const handleSetNow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(dateStr);

    const hours24 = now.getHours();
    const mer = hours24 >= 12 ? 'PM' : 'AM';
    const h12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    handleTimeChange(h12, now.getMinutes(), now.getSeconds(), mer);
  };

  const handleAddMinutes = (mins: number) => {
    const curDate = new Date(currentConstructedString);
    const target = new Date(curDate.getTime() + mins * 60000);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    setSelectedDate(dateStr);

    const hours24 = target.getHours();
    const mer = hours24 >= 12 ? 'PM' : 'AM';
    const h12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    handleTimeChange(h12, target.getMinutes(), target.getSeconds(), mer);
  };

  const handleSetPresetTime = (h12: number, m: number, s: number, mer: 'AM' | 'PM') => {
    handleTimeChange(h12, m, s, mer);
  };

  const handleResetToToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    handleSelectDay(`${year}-${month}-${day}`);
  };

  // Human formatted label for bottom bar
  const formatHumanDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const formatHumanTime = () => {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    const s = String(second).padStart(2, '0');
    return `${h}:${m}:${s} ${meridiem}`;
  };

  // Live countdown relative badge
  const getRelativeCountdown = () => {
    const target = new Date(currentConstructedString).getTime();
    const now = Date.now();
    const diffMs = target - now;
    if (diffMs <= 0) return 'Past due';
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `In ${diffSecs}s`;
    const diffMins = Math.floor(diffSecs / 60);
    const remSecs = diffSecs % 60;
    if (diffMins < 60) {
      return `In ${diffMins}m ${remSecs}s`;
    }
    const diffHours = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    if (diffHours < 24) {
      return `In ${diffHours}h ${remMins}m`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  // Display value for input trigger button
  const formattedDisplay = (() => {
    if (!value) return placeholder;
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  })();

  const todayStr = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button styled like input */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 border rounded-xl bg-white flex items-center justify-between text-xs transition shadow-2xs cursor-pointer ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${className}`}
      >
        <div className="flex items-center gap-2 text-slate-800 font-semibold truncate">
          <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className={!value ? 'text-slate-400 font-normal' : ''}>
            {formattedDisplay}
          </span>
        </div>
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          readOnly
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Floating Popover Container */}
      {isOpen && (
        <>
          {/* Backdrop for click outside */}
          <div
            className="fixed inset-0 z-[998] bg-black/15 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Fixed Floating Container clamped safely in viewport */}
          <div
            style={
              coords
                ? {
                    position: 'fixed',
                    top: `${coords.top}px`,
                    left: `${coords.left}px`,
                    width: '340px',
                    maxHeight: 'calc(100vh - 32px)',
                  }
                : {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '340px',
                    maxHeight: 'calc(100vh - 32px)',
                  }
            }
            className="z-[999] bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 space-y-3 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Visual Interactive Month Calendar matching Screenshot 2 */}
            <div className="space-y-2">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800 text-sm">
                  {monthName} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Days of week header matching Screenshot 2 */}
              <div className="grid grid-cols-7 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100">
                <span>SU</span>
                <span>MO</span>
                <span>TU</span>
                <span>WE</span>
                <span>TH</span>
                <span>FR</span>
                <span>SA</span>
              </div>

              {/* Day Cells Grid (matching Screenshot 2 design) */}
              <div className="grid grid-cols-7 gap-1 text-center pt-1">
                {/* Previous month leading days */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                  const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
                  return (
                    <div
                      key={`prev-${i}`}
                      className="h-8 flex items-center justify-center text-slate-300 select-none text-[11px] font-normal"
                    >
                      {dayNum}
                    </div>
                  );
                })}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const mStr = String(viewMonth + 1).padStart(2, '0');
                  const dStr = String(dayNum).padStart(2, '0');
                  const dayDateStr = `${viewYear}-${mStr}-${dStr}`;

                  const isSelected = dayDateStr === selectedDate;
                  const isToday = dayDateStr === todayStr;

                  return (
                    <button
                      key={dayDateStr}
                      type="button"
                      onClick={() => handleSelectDay(dayDateStr)}
                      className={`h-8 rounded-lg text-xs font-semibold transition relative cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105 z-10'
                          : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950'
                      } ${isToday && !isSelected ? 'ring-1 ring-emerald-500 font-bold' : ''}`}
                    >
                      <span>{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Picker Section (Hours, Minutes, Seconds + AM/PM) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dispatch Time (HH : MM : SS)</span>
                </span>

                {/* AM / PM Segmented Control */}
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleTimeChange(hour, minute, second, 'AM', true)}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      meridiem === 'AM'
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTimeChange(hour, minute, second, 'PM', true)}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      meridiem === 'PM'
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Time Digits Inputs with Steppers and 2-digit values */}
              <div className="flex items-center justify-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Hour</span>
                  <button
                    type="button"
                    onClick={() => handleHourStep(1)}
                    className="p-0.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 rounded cursor-pointer transition"
                    title="Increment Hour"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={hourInput}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        handleHourStep(1);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        handleHourStep(-1);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                      setHourInput(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 1 && num <= 12) {
                        handleTimeChange(num, minute, second, meridiem, false);
                      }
                    }}
                    onBlur={() => {
                      const num = parseInt(hourInput, 10);
                      const valid = isNaN(num) || num < 1 ? 12 : Math.min(12, num);
                      setHourInput(String(valid).padStart(2, '0'));
                      handleTimeChange(valid, minute, second, meridiem, true);
                    }}
                    className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded-lg py-1 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleHourStep(-1)}
                    className="p-0.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 rounded cursor-pointer transition"
                    title="Decrement Hour"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="font-bold text-slate-400 text-sm mt-3">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Min</span>
                  <button
                    type="button"
                    onClick={() => handleMinuteStep(1)}
                    className="p-0.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 rounded cursor-pointer transition"
                    title="Increment Minute"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={minInput}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        handleMinuteStep(1);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        handleMinuteStep(-1);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                      setMinInput(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 0 && num <= 59) {
                        handleTimeChange(hour, num, second, meridiem, false);
                      }
                    }}
                    onBlur={() => {
                      const num = parseInt(minInput, 10);
                      const valid = isNaN(num) || num < 0 ? 0 : Math.min(59, num);
                      setMinInput(String(valid).padStart(2, '0'));
                      handleTimeChange(hour, valid, second, meridiem, true);
                    }}
                    className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded-lg py-1 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleMinuteStep(-1)}
                    className="p-0.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 rounded cursor-pointer transition"
                    title="Decrement Minute"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="font-bold text-slate-400 text-sm mt-3">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Sec</span>
                  <button
                    type="button"
                    onClick={() => handleSecondStep(1)}
                    className="p-0.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 rounded cursor-pointer transition"
                    title="Increment Second"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={secInput}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        handleSecondStep(1);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        handleSecondStep(-1);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                      setSecInput(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 0 && num <= 59) {
                        handleTimeChange(hour, minute, num, meridiem, false);
                      }
                    }}
                    onBlur={() => {
                      const num = parseInt(secInput, 10);
                      const valid = isNaN(num) || num < 0 ? 0 : Math.min(59, num);
                      setSecInput(String(valid).padStart(2, '0'));
                      handleTimeChange(hour, minute, valid, meridiem, true);
                    }}
                    className="w-12 text-center font-mono font-bold text-xs bg-white border border-emerald-300 rounded-lg py-1 text-emerald-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleSecondStep(-1)}
                    className="p-0.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 rounded cursor-pointer transition"
                    title="Decrement Second"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Time Presets */}
              <div className="flex items-center justify-between gap-1 pt-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={handleSetNow}
                  className="px-2 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold border border-slate-200/80 transition cursor-pointer"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMinutes(15)}
                  className="px-2 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold border border-slate-200/80 transition cursor-pointer"
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMinutes(60)}
                  className="px-2 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold border border-slate-200/80 transition cursor-pointer"
                >
                  +1h
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetTime(10, 0, 0, 'AM')}
                  className="px-2 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold border border-slate-200/80 transition cursor-pointer"
                >
                  10:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetTime(6, 0, 0, 'PM')}
                  className="px-2 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold border border-slate-200/80 transition cursor-pointer"
                >
                  06:00 PM
                </button>
              </div>
            </div>

            {/* Active Date & Time Summary (matching Screenshot 2) */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {formatHumanDate(selectedDate)}
                </span>
                <span className="text-slate-400 font-bold">•</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatHumanTime()}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                {getRelativeCountdown()}
              </span>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResetToToday}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Today
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalStr = buildCurrentDateTimeString(
                      selectedDate,
                      hour,
                      minute,
                      second,
                      meridiem
                    );
                    onChange(finalStr);
                    setIsOpen(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

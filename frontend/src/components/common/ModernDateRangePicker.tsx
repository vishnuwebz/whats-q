import React, { useState } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Check, X, ArrowRight, Clock
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
  // Default to May 2024 to match the demo workspace time anchor
  const initialStart = value?.startDate || '2024-05-01';
  const initialEnd = value?.endDate || '2024-05-31';

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [activePreset, setActivePreset] = useState<string>(value?.label || 'This Month (May 2024)');

  // Calendar view navigation (Year and Month)
  const [viewYear, setViewYear] = useState(2024);
  const [viewMonth, setViewMonth] = useState(4); // 0-indexed (4 = May)

  // Range selection state (click 1 = start, click 2 = end)
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    { label: 'Today', start: '2024-05-31', end: '2024-05-31' },
    { label: 'Yesterday', start: '2024-05-30', end: '2024-05-30' },
    { label: 'This Week', start: '2024-05-26', end: '2024-05-31' },
    { label: 'This Month (May 2024)', start: '2024-05-01', end: '2024-05-31' },
    { label: 'Last Month (April 2024)', start: '2024-04-01', end: '2024-04-30' },
    { label: 'Last 30 Days', start: '2024-05-01', end: '2024-05-31' },
    { label: 'Year to Date (2024)', start: '2024-01-01', end: '2024-05-31' },
    { label: 'Custom Range', start: startDate, end: endDate },
  ];

  const handleSelectPreset = (p: { label: string; start: string; end: string }) => {
    setActivePreset(p.label);
    setStartDate(p.start);
    setEndDate(p.end);
    const [y, m] = p.start.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
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

  // Generate calendar days for viewYear & viewMonth
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' });
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handleDayClick = (dayStr: string) => {
    setActivePreset('Custom Range');
    if (!startDate || (startDate && endDate)) {
      // First click: select start date
      setStartDate(dayStr);
      setEndDate('');
    } else if (startDate && !endDate) {
      // Second click: select end date
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

  const handleApply = () => {
    const finalEnd = endDate || startDate;
    const finalStart = startDate <= finalEnd ? startDate : finalEnd;
    const finalEndDate = startDate <= finalEnd ? finalEnd : startDate;

    const label =
      activePreset !== 'Custom Range'
        ? activePreset
        : `${formatDateHuman(finalStart)} – ${formatDateHuman(finalEndDate)}`;

    onApply({
      startDate: finalStart,
      endDate: finalEndDate,
      label,
    });
    onClose();
  };

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
            Select a preset or click custom dates on the calendar to filter records.
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
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* From - To Date Inputs */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset('Custom Range');
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate || startDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset('Custom Range');
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Visual Interactive Month Calendar */}
          <div className="space-y-2">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800 text-sm">
                {monthName} {viewYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

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
                return (
                  <div key={`prev-${i}`} className="py-2 text-slate-300 select-none text-[11px]">
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

                const isSelected = isDaySelected(dayDateStr);
                const inRange = isDayInRange(dayDateStr);
                const isStart = dayDateStr === startDate;
                const isEnd = dayDateStr === endDate;

                return (
                  <button
                    key={dayDateStr}
                    type="button"
                    onClick={() => handleDayClick(dayDateStr)}
                    onMouseEnter={() => setHoverDate(dayDateStr)}
                    className={`h-8 rounded-lg text-xs font-semibold transition relative cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs z-10 scale-105'
                        : inRange
                        ? 'bg-emerald-50 text-emerald-900 rounded-none'
                        : 'text-slate-700 hover:bg-slate-100'
                    } ${isStart ? 'rounded-l-lg' : ''} ${isEnd ? 'rounded-r-lg' : ''}`}
                  >
                    <span>{dayNum}</span>
                  </button>
                );
              })}
            </div>
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
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
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
  );
};

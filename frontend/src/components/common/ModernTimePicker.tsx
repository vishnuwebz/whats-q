import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

interface ModernTimePickerProps {
  value: string; // e.g. '11:00 AM'
  onChange: (timeStr: string) => void;
  label?: string;
  className?: string;
}

const COMMON_TIMES = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '07:00 PM'
];

export const ModernTimePicker: React.FC<ModernTimePickerProps> = ({
  value,
  onChange,
  label,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [customTime, setCustomTime] = useState(value || '11:00 AM');

  useEffect(() => {
    setCustomTime(value || '11:00 AM');
  }, [value]);

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

  const handleSelectTime = (t: string) => {
    onChange(t);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTime.trim()) {
      onChange(customTime.trim());
      setIsOpen(false);
    }
  };

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
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{value || '11:00 AM'}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 text-xs w-64 animate-in fade-in zoom-in-95 duration-100">
          {/* Custom Time Form */}
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-slate-100">
            <input
              type="text"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              placeholder="e.g. 11:15 AM"
              className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Set
            </button>
          </form>

          {/* Preset Time Slots Grid */}
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto scrollbar-thin pr-0.5">
            {COMMON_TIMES.map((t) => {
              const isSelected = (value || '').toLowerCase() === t.toLowerCase();
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelectTime(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{t}</span>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

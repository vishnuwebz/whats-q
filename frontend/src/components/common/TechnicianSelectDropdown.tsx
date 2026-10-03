import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Check, ChevronDown, User, Phone, X, ShieldCheck } from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';

export interface TechnicianOption {
  id: string | number;
  name: string;
  phone: string;
  role: string;
  department: string;
  status: 'on_duty' | 'active' | 'on_leave' | 'inactive';
}

interface TechnicianSelectDropdownProps {
  value: string;
  phoneValue?: string;
  onChange: (name: string, phone: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const DEFAULT_TECHNICIANS: TechnicianOption[] = [
  { id: 'tech-1', name: 'Amit Sharma', phone: '+91 90000 11123', role: 'Field Technician', department: 'AC Services', status: 'on_duty' },
  { id: 'tech-2', name: 'habeebu', phone: '+91 80895 64046', role: 'Specialist Technician', department: 'Watch & Electronics', status: 'on_duty' },
  { id: 'tech-3', name: 'Priya Sharma', phone: '+91 89213 56789', role: 'Customer Support Lead', department: 'Support', status: 'active' },
  { id: 'tech-4', name: 'Rahul Singh', phone: '+91 98764 11122', role: 'Plumbing Specialist', department: 'Plumbing', status: 'on_duty' },
  { id: 'tech-5', name: 'Neha Patel', phone: '+91 96789 11223', role: 'Housekeeping Lead', department: 'Cleaning', status: 'active' },
  { id: 'tech-6', name: 'Arjun Nair', phone: '+91 85471 22330', role: 'Electrical Services Lead', department: 'Electrical', status: 'on_duty' },
  { id: 'tech-7', name: 'Sneha Joshi', phone: '+91 96789 66771', role: 'General Maintenance Specialist', department: 'Maintenance', status: 'active' },
  { id: 'tech-8', name: 'arshil pk', phone: '+91 80895 64046', role: 'Field Operations Specialist', department: 'Field Operations', status: 'active' },
];

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-emerald-100 text-emerald-700 border-emerald-300',
    'bg-blue-100 text-blue-700 border-blue-300',
    'bg-purple-100 text-purple-700 border-purple-300',
    'bg-amber-100 text-amber-700 border-amber-300',
    'bg-rose-100 text-rose-700 border-rose-300',
    'bg-indigo-100 text-indigo-700 border-indigo-300',
    'bg-teal-100 text-teal-700 border-teal-300',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  if (!name) return 'TC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper component to highlight matched letters or numbers
const HighlightMatch: React.FC<{ text: string; query: string; isPhone?: boolean }> = ({ text, query, isPhone }) => {
  const trimmed = query.trim();
  if (!trimmed || !text) return <>{text}</>;

  if (isPhone) {
    const qDigits = trimmed.replace(/\D/g, '');
    if (!qDigits) return <>{text}</>;

    // Direct substring match
    const lowerText = text.toLowerCase();
    const lowerTrimmed = trimmed.toLowerCase();
    const directIdx = lowerText.indexOf(lowerTrimmed);
    if (directIdx !== -1) {
      return (
        <>
          {text.slice(0, directIdx)}
          <mark className="bg-amber-200/90 text-amber-950 font-bold px-0.5 rounded">{text.slice(directIdx, directIdx + trimmed.length)}</mark>
          {text.slice(directIdx + trimmed.length)}
        </>
      );
    }

    // Match digits across non-digit characters in formatted phone
    const digitsOnly = text.replace(/\D/g, '');
    const dIdx = digitsOnly.indexOf(qDigits);
    if (dIdx !== -1) {
      let digitCount = 0;
      let startChar = -1;
      let endChar = -1;
      for (let i = 0; i < text.length; i++) {
        if (/\d/.test(text[i])) {
          if (digitCount === dIdx && startChar === -1) {
            startChar = i;
          }
          digitCount++;
          if (digitCount === dIdx + qDigits.length) {
            endChar = i + 1;
            break;
          }
        }
      }
      if (startChar !== -1 && endChar !== -1) {
        return (
          <>
            {text.slice(0, startChar)}
            <mark className="bg-amber-200/90 text-amber-950 font-bold px-0.5 rounded">{text.slice(startChar, endChar)}</mark>
            {text.slice(endChar)}
          </>
        );
      }
    }
    return <>{text}</>;
  }

  // Letters match
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) {
    // Check individual words if multi-word query
    const words = lowerQuery.split(/\s+/).filter((w) => w.length > 1);
    for (const w of words) {
      const wIdx = lowerText.indexOf(w);
      if (wIdx !== -1) {
        return (
          <>
            {text.slice(0, wIdx)}
            <mark className="bg-amber-200/90 text-amber-950 font-bold px-0.5 rounded">{text.slice(wIdx, wIdx + w.length)}</mark>
            {text.slice(wIdx + w.length)}
          </>
        );
      }
    }
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200/90 text-amber-950 font-bold px-0.5 rounded">{text.slice(idx, idx + trimmed.length)}</mark>
      {text.slice(idx + trimmed.length)}
    </>
  );
};

export const TechnicianSelectDropdown: React.FC<TechnicianSelectDropdownProps> = ({
  value,
  phoneValue,
  onChange,
  label,
  placeholder = 'Select Assigned Technician...',
  className = '',
}) => {
  const { employees } = useQiyamStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Aggregate and deduplicate technicians from store employees & default list
  const uniqueTechnicians = useMemo<TechnicianOption[]>(() => {
    const map = new Map<string, TechnicianOption>();

    // 1. Add defaults
    DEFAULT_TECHNICIANS.forEach((t) => {
      map.set(t.name.toLowerCase().trim(), t);
    });

    // 2. Add / override from store employees
    (employees || []).forEach((e) => {
      if (e.name) {
        const key = e.name.toLowerCase().trim();
        const existing = map.get(key);
        map.set(key, {
          id: e.id || existing?.id || `tech-${key}`,
          name: e.name,
          phone: e.phone || existing?.phone || '+91 90000 11123',
          role: e.role || existing?.role || 'Field Technician',
          department: e.department || existing?.department || 'Operations',
          status: (e.status as TechnicianOption['status']) || existing?.status || 'on_duty',
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      // Prioritize on_duty, then alphabetical
      if (a.status === 'on_duty' && b.status !== 'on_duty') return -1;
      if (b.status === 'on_duty' && a.status !== 'on_duty') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [employees]);

  // Selected technician details
  const selectedTech = useMemo(() => {
    if (!value) return null;
    return uniqueTechnicians.find(
      (t) => t.name.toLowerCase().trim() === value.toLowerCase().trim()
    );
  }, [uniqueTechnicians, value]);

  // Filtered and dynamically sorted list based on search query (letters or numbers)
  const filteredTechnicians = useMemo(() => {
    const raw = search.trim();
    if (!raw) return uniqueTechnicians;

    const q = raw.toLowerCase();
    const qDigits = raw.replace(/\D/g, '');
    const hasDigits = qDigits.length > 0;
    const qWords = q.split(/\s+/).filter(Boolean);

    const scored = uniqueTechnicians
      .map((tech) => {
        let score = 0;
        const nameLower = tech.name.toLowerCase();
        const phoneClean = tech.phone.replace(/\D/g, '');
        const roleLower = (tech.role || '').toLowerCase();
        const deptLower = (tech.department || '').toLowerCase();
        const nameWords = nameLower.split(/\s+/).filter(Boolean);

        // --- 1. Letter / Text Matching ---
        if (nameLower === q) {
          score += 10000; // Exact full name match
        } else if (nameLower.startsWith(q)) {
          // Starts with query (e.g. "habeeb" -> "habeebu")
          // Shorter surplus length gets higher priority
          score += 5000 + Math.max(0, 100 - (nameLower.length - q.length));
        } else if (nameWords.some((w) => w.startsWith(q))) {
          // Word inside name starts with query (e.g. "sharma" in "Amit Sharma", "pk" in "arshil pk")
          score += 4000;
        } else if (nameLower.includes(q)) {
          score += 2500;
        } else if (qWords.length > 1 && qWords.every((w) => nameLower.includes(w))) {
          score += 3000;
        }

        // --- 2. Number / Phone Matching ---
        // ONLY triggers if user explicitly typed digits
        if (hasDigits) {
          if (phoneClean === qDigits) {
            score += 9500; // Exact phone digits
          } else if (phoneClean.endsWith(qDigits)) {
            // Typing the last 4, 5, or 6 digits of mobile
            score += 7500 + Math.min(1000, qDigits.length * 200);
          } else if (phoneClean.startsWith(qDigits)) {
            score += 6000 + Math.min(500, qDigits.length * 100);
          } else if (qDigits.length >= 3 && phoneClean.includes(qDigits)) {
            score += 4000;
          } else if (qDigits.length < 3 && phoneClean.includes(qDigits) && !/[a-z]/i.test(raw)) {
            score += 500;
          }

          // Formatted match (e.g. "+91 808" or "80895")
          if (tech.phone.toLowerCase().includes(q)) {
            score += 1500;
          }
        }

        // --- 3. Role & Department Matching ---
        if (roleLower === q || deptLower === q) {
          score += 3500;
        } else if (roleLower.startsWith(q) || deptLower.startsWith(q)) {
          score += 2200;
        } else if (roleLower.includes(q) || deptLower.includes(q)) {
          score += 1200;
        }

        // --- 4. Availability Tie-Breaker ---
        if (score > 0 && tech.status === 'on_duty') {
          score += 50;
        }

        return { tech, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.tech.status === 'on_duty' && b.tech.status !== 'on_duty') return -1;
        if (b.tech.status === 'on_duty' && a.tech.status !== 'on_duty') return 1;
        return a.tech.name.localeCompare(b.tech.name);
      })
      .map((item) => item.tech);

    return scored;
  }, [uniqueTechnicians, search]);

  // Reset active index whenever search query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Close on outside click
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

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (tech: TechnicianOption) => {
    onChange(tech.name, tech.phone);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < filteredTechnicians.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : Math.max(0, filteredTechnicians.length - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTechnicians.length > 0) {
        const target = filteredTechnicians[activeIndex] || filteredTechnicians[0];
        handleSelect(target);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="font-bold text-slate-700 block mb-1">{label}</label>}

      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between text-left text-xs transition-all focus:ring-1 focus:ring-amber-500 focus:bg-white cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedTech ? (
            <>
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs ${getAvatarColor(
                  selectedTech.name
                )}`}
              >
                {getInitials(selectedTech.name)}
              </div>
              <div className="min-w-0 flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 truncate">{selectedTech.name}</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1 shrink-0">
                  <Phone className="w-2.5 h-2.5 text-emerald-600" />
                  {selectedTech.phone}
                </span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                    selectedTech.status === 'on_duty'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedTech.status === 'on_duty' ? '🟢 On Duty' : '⚪ Active'}
                </span>
              </div>
            </>
          ) : value ? (
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-900 truncate">{value}</span>
              {phoneValue && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {phoneValue}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-amber-600' : 'group-hover:text-slate-600'
          }`}
        />
      </button>

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/60 sticky top-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search technician by letters or numbers..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 px-1 flex items-center justify-between">
              {search.trim() ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {filteredTechnicians.length} match{filteredTechnicians.length === 1 ? '' : 'es'} dynamically sorted
                </span>
              ) : (
                <span>{filteredTechnicians.length} technician(s) available</span>
              )}
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified Field Staff
              </span>
            </div>
          </div>

          {/* Technicians List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredTechnicians.length > 0 ? (
              filteredTechnicians.map((tech, idx) => {
                const isSelected = tech.name.toLowerCase().trim() === (value || '').toLowerCase().trim();
                const isOnDuty = tech.status === 'on_duty';
                const isFocused = idx === activeIndex;

                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => handleSelect(tech)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/90 text-amber-950 font-semibold ring-1 ring-amber-300'
                        : isFocused
                        ? 'bg-slate-100/90 text-slate-900 ring-1 ring-slate-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs ${getAvatarColor(
                          tech.name
                        )}`}
                      >
                        {getInitials(tech.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate text-xs">
                            <HighlightMatch text={tech.name} query={search} />
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                              isOnDuty
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {isOnDuty ? '🟢 On Duty' : '⚪ Active'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-emerald-700 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <HighlightMatch text={tech.phone} query={search} isPhone />
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="truncate">
                            <HighlightMatch text={tech.department || tech.role} query={search} />
                          </span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-slate-400">
                <User className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="text-xs">No technicians matching "{search}"</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Try searching by letters, numbers, or trade</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

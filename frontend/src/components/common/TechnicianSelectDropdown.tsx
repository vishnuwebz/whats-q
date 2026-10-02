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

  // Filtered list based on search query
  const filteredTechnicians = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return uniqueTechnicians;
    return uniqueTechnicians.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        t.role.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
    );
  }, [uniqueTechnicians, search]);

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
    }
  }, [isOpen]);

  const handleSelect = (tech: TechnicianOption) => {
    onChange(tech.name, tech.phone);
    setIsOpen(false);
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
                placeholder="Search technician by name, phone, or skill..."
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
              <span>{filteredTechnicians.length} technician(s) available</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified Field Staff
              </span>
            </div>
          </div>

          {/* Technicians List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredTechnicians.length > 0 ? (
              filteredTechnicians.map((tech) => {
                const isSelected = tech.name.toLowerCase().trim() === (value || '').toLowerCase().trim();
                const isOnDuty = tech.status === 'on_duty';

                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => handleSelect(tech)}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 text-amber-950 font-semibold'
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
                          <span className="font-bold text-slate-900 truncate text-xs">{tech.name}</span>
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
                            {tech.phone}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="truncate">{tech.department || tech.role}</span>
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
                <p className="text-[10px] text-slate-400 mt-0.5">Try searching by mobile number or trade</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

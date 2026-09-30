import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Check, ChevronDown, User, X, Briefcase } from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';

export interface AgentOption {
  name: string;
  role: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
}

interface AgentSelectDropdownProps {
  value: string;
  onChange: (agentName: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const DEFAULT_AGENTS: AgentOption[] = [
  { name: 'Vikram Patel', role: 'Field Services Lead', department: 'Operations' },
  { name: 'Rahul Mehta', role: 'Sales & CRM Lead', department: 'Sales' },
  { name: 'Priya Sharma', role: 'Customer Success Specialist', department: 'Support' },
  { name: 'Amit Sharma', role: 'Senior Field Technician', department: 'AC Services' },
  { name: 'Ramesh Kumar', role: 'Operations Manager', department: 'Management' },
  { name: 'Neha Patel', role: 'Housekeeping Lead', department: 'Cleaning' },
  { name: 'Rahul Singh', role: 'Plumbing Specialist', department: 'Plumbing' },
  { name: 'Arjun Nair', role: 'Electrical Services Lead', department: 'Electrical' },
  { name: 'Sneha Joshi', role: 'CRM Team Lead', department: 'CRM' },
  { name: 'Anita Singh', role: 'Customer Support Executive', department: 'Support' },
];

// Helper for consistent avatar color
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
  if (!name) return 'AG';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AgentSelectDropdown: React.FC<AgentSelectDropdownProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select Assigned Agent',
  className = '',
}) => {
  const { employees, leads, deals } = useQiyamStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Aggregate all unique agents from database & store
  const allAgents = useMemo<AgentOption[]>(() => {
    const map = new Map<string, AgentOption>();

    // 1. Add known default agents
    DEFAULT_AGENTS.forEach((a) => map.set(a.name.toLowerCase(), a));

    // 2. Add from store employees
    (employees || []).forEach((e) => {
      if (e.name) {
        map.set(e.name.toLowerCase(), {
          name: e.name,
          role: e.role || 'Staff Member',
          department: e.department || 'Operations',
          phone: e.phone,
          avatar_url: e.avatar_url,
        });
      }
    });

    // 3. Add owners from leads and deals
    (leads || []).forEach((l) => {
      if (l.owner && !map.has(l.owner.toLowerCase())) {
        map.set(l.owner.toLowerCase(), {
          name: l.owner,
          role: 'Lead Owner',
          department: 'Sales',
        });
      }
    });

    (deals || []).forEach((d) => {
      if (d.deal_owner && !map.has(d.deal_owner.toLowerCase())) {
        map.set(d.deal_owner.toLowerCase(), {
          name: d.deal_owner,
          role: 'Deal Owner',
          department: 'Sales',
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, leads, deals]);

  // Selected agent details
  const selectedAgent = useMemo(() => {
    return allAgents.find((a) => a.name.toLowerCase() === (value || '').toLowerCase());
  }, [allAgents, value]);

  // Filtered agents based on search query
  const filteredAgents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allAgents;
    return allAgents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.department && a.department.toLowerCase().includes(q))
    );
  }, [allAgents, search]);

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = (agentName: string) => {
    onChange(agentName);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="font-semibold text-slate-700 block mb-1">{label}</label>}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between text-left text-xs transition-all focus:ring-1 focus:ring-emerald-500 focus:bg-white cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {value ? (
            <>
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs ${getAvatarColor(
                  value
                )}`}
              >
                {getInitials(value)}
              </div>
              <div className="truncate">
                <span className="font-semibold text-slate-800 block truncate">{value}</span>
                {selectedAgent?.role && (
                  <span className="text-[10px] text-slate-500 block truncate -mt-0.5">
                    {selectedAgent.role}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-400 font-normal">{placeholder}</span>
            </>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 text-xs animate-in fade-in zoom-in-95 duration-100 max-h-72 flex flex-col">
          {/* Search Box */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agent name, department..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Agent Options List */}
          <div className="overflow-y-auto space-y-1 scrollbar-thin flex-1 pr-0.5">
            {filteredAgents.map((agent) => {
              const isSelected = value?.toLowerCase() === agent.name.toLowerCase();
              return (
                <button
                  key={agent.name}
                  type="button"
                  onClick={() => handleSelect(agent.name)}
                  className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-900'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${getAvatarColor(
                        agent.name
                      )}`}
                    >
                      {getInitials(agent.name)}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                        <span>{agent.name}</span>
                        {agent.department && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200/70 text-slate-600 font-normal">
                            {agent.department}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{agent.role}</p>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              );
            })}

            {/* Custom agent option if search has no exact match */}
            {search.trim() &&
              !allAgents.some((a) => a.name.toLowerCase() === search.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => handleSelect(search.trim())}
                  className="w-full px-2.5 py-2 mt-1 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-dashed border-slate-300 hover:border-emerald-300 text-left flex items-center gap-2 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">
                    Use custom agent: <strong>"{search.trim()}"</strong>
                  </span>
                </button>
              )}

            {filteredAgents.length === 0 && !search.trim() && (
              <div className="py-4 text-center text-slate-400 text-xs">No agents found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

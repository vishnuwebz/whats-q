import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Filter, X, Check, RefreshCw } from 'lucide-react';

interface UniversalFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
}

export const UniversalFilterPopover: React.FC<UniversalFilterPopoverProps> = ({
  isOpen,
  onClose,
  pageTitle,
}) => {
  const { globalFilter, setGlobalFilter, resetGlobalFilter, addToast } = useQiyamStore();

  const [status, setStatus] = useState(globalFilter.status || 'all');
  const [priority, setPriority] = useState(globalFilter.priority || 'all');
  const [query, setQuery] = useState(globalFilter.query || '');

  if (!isOpen) return null;

  const handleApply = () => {
    setGlobalFilter({ status, priority, query });
    addToast(`Filters applied for ${pageTitle}`, 'success');
    onClose();
  };

  const handleReset = () => {
    setStatus('all');
    setPriority('all');
    setQuery('');
    resetGlobalFilter();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-4 animate-in fade-in duration-100">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter {pageTitle}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Keyword Filter */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700">Keyword Search</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by customer, phone, SKU..."
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700">Status</label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'open', label: 'Open / Scheduled' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed / Won' },
            { id: 'overdue', label: 'Overdue / Pending' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatus(st.id)}
              className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors font-medium ${
                status === st.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700">Priority Level</label>
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low' },
          ].map((pr) => (
            <button
              key={pr.id}
              onClick={() => setPriority(pr.id)}
              className={`flex-1 py-1 rounded-lg border text-center transition-colors font-medium ${
                priority === pr.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

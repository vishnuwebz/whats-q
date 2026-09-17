import React, { useState, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Filter, X, RefreshCw, Check } from 'lucide-react';

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
  const { activeTab, globalFilter, setGlobalFilter, resetGlobalFilter, addToast, employees } = useQiyamStore();

  const [status, setStatus] = useState(globalFilter.status || 'all');
  const [priority, setPriority] = useState(globalFilter.priority || 'all');
  const [assignedTo, setAssignedTo] = useState(globalFilter.assignedTo || 'all');
  const [query, setQuery] = useState(globalFilter.query || '');

  // Synchronize local popover state when globalFilter changes
  useEffect(() => {
    setStatus(globalFilter.status || 'all');
    setPriority(globalFilter.priority || 'all');
    setAssignedTo(globalFilter.assignedTo || 'all');
    setQuery(globalFilter.query || '');
  }, [globalFilter, isOpen]);

  if (!isOpen) return null;

  const getStatusOptionsForTab = (tab: string) => {
    switch (tab) {
      case 'ops-inventory':
        return [
          { id: 'all', label: 'All Stock' },
          { id: 'in_stock', label: 'In Stock' },
          { id: 'low_stock', label: 'Low Stock' },
          { id: 'out_of_stock', label: 'Out of Stock' },
          { id: 'discontinued', label: 'Discontinued' },
        ];
      case 'ops-jobs':
        return [
          { id: 'all', label: 'All Jobs' },
          { id: 'scheduled', label: 'Scheduled' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'overdue', label: 'Overdue' },
        ];
      case 'ops-appointments':
        return [
          { id: 'all', label: 'All Bookings' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ];
      case 'ops-employees':
        return [
          { id: 'all', label: 'All Staff' },
          { id: 'on_duty', label: 'On Duty' },
          { id: 'active', label: 'Active' },
          { id: 'on_leave', label: 'On Leave' },
          { id: 'inactive', label: 'Inactive' },
        ];
      case 'ops-attendance':
        return [
          { id: 'all', label: 'All Records' },
          { id: 'present', label: 'Present' },
          { id: 'late', label: 'Late' },
          { id: 'absent', label: 'Absent' },
        ];
      case 'ops-tasks':
        return [
          { id: 'all', label: 'All Tasks' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'pending', label: 'Pending' },
          { id: 'completed', label: 'Completed' },
          { id: 'overdue', label: 'Overdue' },
        ];
      case 'ops-routes':
        return [
          { id: 'all', label: 'All Routes' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'planned', label: 'Planned' },
        ];
      case 'crm-leads':
        return [
          { id: 'all', label: 'All Leads' },
          { id: 'new', label: 'New' },
          { id: 'contacted', label: 'Contacted' },
          { id: 'qualified', label: 'Qualified' },
          { id: 'proposal_sent', label: 'Proposal Sent' },
          { id: 'negotiation', label: 'Negotiation' },
          { id: 'won', label: 'Won' },
          { id: 'lost', label: 'Lost' },
        ];
      case 'crm-deals':
        return [
          { id: 'all', label: 'All Deals' },
          { id: 'proposal_sent', label: 'Proposal Sent' },
          { id: 'negotiation', label: 'Negotiation' },
          { id: 'won', label: 'Won' },
          { id: 'lost', label: 'Lost' },
        ];
      case 'crm-followups':
        return [
          { id: 'all', label: 'All Follow-ups' },
          { id: 'due_today', label: 'Due Today' },
          { id: 'scheduled', label: 'Scheduled' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'completed', label: 'Completed' },
        ];
      case 'finance-invoices':
        return [
          { id: 'all', label: 'All Invoices' },
          { id: 'paid', label: 'Paid' },
          { id: 'partial_paid', label: 'Partially Paid' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'sent', label: 'Sent' },
          { id: 'draft', label: 'Draft' },
        ];
      case 'finance-expenses':
      case 'finance-budget':
        return [
          { id: 'all', label: 'All Expenses' },
          { id: 'paid', label: 'Paid' },
          { id: 'pending', label: 'Pending' },
        ];
      case 'finance-transactions':
      case 'finance-payments':
      case 'finance-overview':
      case 'finance-reports':
        return [
          { id: 'all', label: 'All Transactions' },
          { id: 'income', label: 'Income' },
          { id: 'expense', label: 'Expense' },
          { id: 'transfer', label: 'Transfer' },
        ];
      case 'finance-accounts':
        return [
          { id: 'all', label: 'All Accounts' },
          { id: 'Active', label: 'Active' },
          { id: 'Inactive', label: 'Inactive' },
        ];
      case 'automation-approvals':
        return [
          { id: 'all', label: 'All Requests' },
          { id: 'Pending', label: 'Pending' },
          { id: 'Approved', label: 'Approved' },
          { id: 'Rejected', label: 'Rejected' },
        ];
      case 'automation-workflows':
      case 'automation-builder':
        return [
          { id: 'all', label: 'All Workflows' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
          { id: 'draft', label: 'Draft' },
        ];
      case 'branches':
      case 'automation-branches':
        return [
          { id: 'all', label: 'All Branches' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
        ];
      case 'conversations':
        return [
          { id: 'all', label: 'All Chats' },
          { id: 'active', label: 'Active' },
          { id: 'pending', label: 'Pending' },
          { id: 'resolved', label: 'Resolved' },
        ];
      default:
        return [
          { id: 'all', label: 'All Statuses' },
          { id: 'open', label: 'Open / Scheduled' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed / Won' },
          { id: 'overdue', label: 'Overdue / Pending' },
        ];
    }
  };

  const statusOptions = getStatusOptionsForTab(activeTab);
  const supportsPriority = ['ops-jobs', 'ops-tasks', 'crm-followups', 'crm-leads', 'ops-routes', 'ops-appointments'].includes(activeTab);
  const supportsAssignee = ['ops-jobs', 'ops-appointments', 'ops-tasks', 'ops-schedule', 'crm-leads', 'crm-deals', 'crm-followups', 'automation-approvals'].includes(activeTab);

  const handleApply = () => {
    setGlobalFilter({ status, priority, assignedTo, query });
    addToast(`Filters applied for ${pageTitle}`, 'success');
    onClose();
  };

  const handleReset = () => {
    setStatus('all');
    setPriority('all');
    setAssignedTo('all');
    setQuery('');
    resetGlobalFilter();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-slate-900/30 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filter {pageTitle}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Keyword Filter */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 text-xs">Keyword Search</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, SKU, phone, service..."
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 text-xs">Status</label>
          <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
            {statusOptions.map((st) => (
              <button
                key={st.id}
                onClick={() => setStatus(st.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors text-xs font-medium cursor-pointer ${
                  status === st.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assignee Filter (context-aware) */}
        {supportsAssignee && (
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 text-xs">Assigned Team Member</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
            >
              <option value="all">All Team Members</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Priority Filter (context-aware) */}
        {supportsPriority && (
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 text-xs">Priority Level</label>
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
                  className={`flex-1 py-1 rounded-lg border text-center transition-colors text-xs font-medium cursor-pointer ${
                    priority === pr.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

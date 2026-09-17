import React, { useState, useEffect, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Search, X, ArrowRight, MessageSquare, User, Briefcase, FileText,
  Users, Package, Zap, ChevronRight, Navigation, LayoutDashboard,
  Calendar, CheckCircle2, Clock, Building2, Receipt
} from 'lucide-react';
import { TabType } from '@/types';

interface OmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OmniSearchModal: React.FC<OmniSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    conversations,
    leads,
    deals,
    jobs,
    invoices,
    employees,
    inventory,
    appointments,
    tasks,
    expenses,
    transactions,
    branches,
    followups,
    setActiveTab,
    setTargetHighlightId,
    setSelectedConversationId,
    setSelectedLead,
    setIsLeadDrawerOpen,
    addToast,
  } = useQiyamStore();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'conversations' | 'crm' | 'ops' | 'finance'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Navigation items
  const navShortcuts: Array<{ title: string; subtitle: string; tab: TabType; icon: React.ReactNode }> = [
    { title: 'Conversations Inbox', subtitle: 'WhatsApp multi-agent live chat', tab: 'conversations', icon: <MessageSquare className="w-4 h-4 text-emerald-600" /> },
    { title: 'Leads Pipeline', subtitle: 'CRM lead tracking and qualification', tab: 'crm-leads', icon: <User className="w-4 h-4 text-blue-600" /> },
    { title: 'Jobs Dispatch', subtitle: 'Field service orders and dispatch schedule', tab: 'ops-jobs', icon: <Briefcase className="w-4 h-4 text-amber-600" /> },
    { title: 'Invoices & Billing', subtitle: 'Itemized invoices and UPI collections', tab: 'finance-invoices', icon: <FileText className="w-4 h-4 text-purple-600" /> },
    { title: 'Route Optimization', subtitle: 'GPS route planning and technician stops', tab: 'ops-routes', icon: <Navigation className="w-4 h-4 text-emerald-600" /> },
    { title: 'Workflow Builder', subtitle: 'Visual automation builder and keyword bot', tab: 'automation-builder', icon: <Zap className="w-4 h-4 text-indigo-600" /> },
    { title: 'Employee Directory', subtitle: 'Technician profiles, status, and shifts', tab: 'ops-employees', icon: <Users className="w-4 h-4 text-teal-600" /> },
    { title: 'Appointments Calendar', subtitle: 'Service booking slots and advance payments', tab: 'ops-appointments', icon: <Calendar className="w-4 h-4 text-rose-600" /> },
  ];

  interface ResultItem {
    id: string | number;
    title: string;
    subtitle: string;
    type: string;
    typeBadgeColor: string;
    tab: TabType;
    icon: React.ReactNode;
    onClick: () => void;
  }

  const results: ResultItem[] = [];

  if (q) {
    // Search Conversations
    if (activeFilter === 'all' || activeFilter === 'conversations') {
      conversations
        .filter((c) => c.contact_name.toLowerCase().includes(q) || c.phone_number.includes(q) || (c.service_needed && c.service_needed.toLowerCase().includes(q)))
        .slice(0, 5)
        .forEach((c) => {
          results.push({
            id: `conv-${c.id}`,
            title: c.contact_name,
            subtitle: `${c.phone_number} • ${c.service_needed || 'WhatsApp Inquiry'}`,
            type: 'Chat',
            typeBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            tab: 'conversations',
            icon: <MessageSquare className="w-4 h-4 text-emerald-600" />,
            onClick: () => {
              setSelectedConversationId(c.id);
              setActiveTab('conversations');
              onClose();
              addToast(`Opened conversation with ${c.contact_name}`, 'info');
            },
          });
        });
    }

    // Search CRM Leads & Deals
    if (activeFilter === 'all' || activeFilter === 'crm') {
      leads
        .filter((l) => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.service.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((l) => {
          results.push({
            id: `lead-${l.id}`,
            title: l.name,
            subtitle: `${l.service} • ₹${l.value.toLocaleString()} • ${l.location}`,
            type: 'Lead',
            typeBadgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
            tab: 'crm-leads',
            icon: <User className="w-4 h-4 text-blue-600" />,
            onClick: () => {
              setSelectedLead(l);
              setIsLeadDrawerOpen(true);
              setTargetHighlightId(l.id);
              setActiveTab('crm-leads');
              onClose();
              addToast(`Showing lead: ${l.name}`, 'info');
            },
          });
        });

      deals
        .filter((d) => d.deal_name.toLowerCase().includes(q) || d.customer_name.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach((d) => {
          results.push({
            id: `deal-${d.id}`,
            title: d.deal_name,
            subtitle: `${d.customer_name} • ₹${d.amount.toLocaleString()} • ${d.stage}`,
            type: 'Deal',
            typeBadgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            tab: 'crm-deals',
            icon: <Briefcase className="w-4 h-4 text-indigo-600" />,
            onClick: () => {
              setTargetHighlightId(d.id);
              setActiveTab('crm-deals');
              onClose();
              addToast(`Showing deal: ${d.deal_name}`, 'info');
            },
          });
        });
    }

    // Search Operations Jobs & Employees
    if (activeFilter === 'all' || activeFilter === 'ops') {
      jobs
        .filter((j) => j.job_id_str.toLowerCase().includes(q) || j.customer_name.toLowerCase().includes(q) || j.service.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((j) => {
          results.push({
            id: `job-${j.id}`,
            title: `${j.job_id_str} — ${j.customer_name}`,
            subtitle: `${j.service} • ${j.status.toUpperCase()} • ${j.assigned_to}`,
            type: 'Job',
            typeBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
            tab: 'ops-jobs',
            icon: <Briefcase className="w-4 h-4 text-amber-600" />,
            onClick: () => {
              setTargetHighlightId(j.job_id_str || j.id);
              setActiveTab('ops-jobs');
              onClose();
              addToast(`Selected job ${j.job_id_str}`, 'info');
            },
          });
        });

      employees
        .filter((e) => e.name.toLowerCase().includes(q) || e.employee_id_str.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach((e) => {
          results.push({
            id: `emp-${e.id}`,
            title: e.name,
            subtitle: `${e.employee_id_str} • ${e.role} • ${e.status}`,
            type: 'Staff',
            typeBadgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
            tab: 'ops-employees',
            icon: <Users className="w-4 h-4 text-teal-600" />,
            onClick: () => {
              setTargetHighlightId(e.id);
              setActiveTab('ops-employees');
              onClose();
              addToast(`Viewing employee profile for ${e.name}`, 'info');
            },
          });
        });
    }

    // Search Invoices
    if (activeFilter === 'all' || activeFilter === 'finance') {
      invoices
        .filter((inv) => inv.invoice_number.toLowerCase().includes(q) || inv.customer_name.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((inv) => {
          results.push({
            id: `inv-${inv.id}`,
            title: `${inv.invoice_number} — ${inv.customer_name}`,
            subtitle: `₹${inv.amount.toLocaleString()} • ${inv.status.toUpperCase()} • Due ${inv.due_date}`,
            type: 'Invoice',
            typeBadgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
            tab: 'finance-invoices',
            icon: <FileText className="w-4 h-4 text-purple-600" />,
            onClick: () => {
              setTargetHighlightId(inv.invoice_number || inv.id);
              setActiveTab('finance-invoices');
              onClose();
              addToast(`Viewing invoice ${inv.invoice_number}`, 'info');
            },
          });
        });
    }

    // Search Inventory
    inventory
      .filter((item) => item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((item) => {
        results.push({
          id: `inv-sku-${item.id}`,
          title: item.name,
          subtitle: `${item.sku} • Stock: ${item.stock_units} • ₹${item.stock_value.toLocaleString()}`,
          type: 'SKU',
          typeBadgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
          tab: 'ops-inventory',
          icon: <Package className="w-4 h-4 text-slate-600" />,
          onClick: () => {
            setActiveTab('ops-inventory');
            onClose();
          },
        });
      });

    // Search Appointments, Tasks & Branches
    if (activeFilter === 'all' || activeFilter === 'ops') {
      appointments
        .filter((a) => a.customer_name.toLowerCase().includes(q) || a.phone.includes(q) || a.service.toLowerCase().includes(q) || (a.apt_id_str && a.apt_id_str.toLowerCase().includes(q)))
        .slice(0, 4)
        .forEach((a) => {
          results.push({
            id: `apt-${a.id}`,
            title: `${a.apt_id_str || `APT-${a.id}`} — ${a.customer_name}`,
            subtitle: `${a.service} • ${a.date_str} at ${a.time_str} • ${a.status.toUpperCase()}`,
            type: 'Appointment',
            typeBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
            tab: 'ops-appointments',
            icon: <Calendar className="w-4 h-4 text-rose-600" />,
            onClick: () => {
              setTargetHighlightId(a.id);
              setActiveTab('ops-appointments');
              onClose();
              addToast(`Viewing appointment ${a.apt_id_str || a.id}`, 'info');
            },
          });
        });

      tasks
        .filter((t) => t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q) || t.related_to.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((t) => {
          results.push({
            id: `task-${t.id}`,
            title: t.title,
            subtitle: `${t.related_to} • ${t.assignee} • ${t.priority.toUpperCase()}`,
            type: 'Task',
            typeBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
            tab: 'ops-tasks',
            icon: <CheckCircle2 className="w-4 h-4 text-amber-600" />,
            onClick: () => {
              setActiveTab('ops-tasks');
              onClose();
              addToast(`Viewing task: ${t.title}`, 'info');
            },
          });
        });

      branches
        .filter((b) => b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.code.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((b) => {
          results.push({
            id: `branch-${b.id}`,
            title: `${b.name} (${b.code})`,
            subtitle: `${b.city}, ${b.state} • Manager: ${b.manager_name || 'Rahul Mehta'}`,
            type: 'Branch',
            typeBadgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
            tab: 'branches',
            icon: <Building2 className="w-4 h-4 text-sky-600" />,
            onClick: () => {
              setActiveTab('branches');
              onClose();
              addToast(`Navigating to branch ${b.name}`, 'info');
            },
          });
        });
    }

    // Search CRM Follow-ups
    if (activeFilter === 'all' || activeFilter === 'crm') {
      followups
        .filter((f) => f.title.toLowerCase().includes(q) || f.customer_name.toLowerCase().includes(q) || f.phone.includes(q))
        .slice(0, 3)
        .forEach((f) => {
          results.push({
            id: `followup-${f.id}`,
            title: f.title,
            subtitle: `${f.customer_name} • Due ${f.due_date} • ${f.status.replace('_', ' ').toUpperCase()}`,
            type: 'Follow-up',
            typeBadgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            tab: 'crm-followups',
            icon: <Clock className="w-4 h-4 text-indigo-600" />,
            onClick: () => {
              setActiveTab('crm-followups');
              onClose();
              addToast(`Viewing follow-up with ${f.customer_name}`, 'info');
            },
          });
        });
    }

    // Search Expenses & Transactions
    if (activeFilter === 'all' || activeFilter === 'finance') {
      expenses
        .filter((exp) => exp.description.toLowerCase().includes(q) || exp.vendor.toLowerCase().includes(q) || exp.category.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((exp) => {
          results.push({
            id: `exp-${exp.id}`,
            title: exp.description,
            subtitle: `₹${exp.amount.toLocaleString()} • ${exp.vendor} • ${exp.category}`,
            type: 'Expense',
            typeBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
            tab: 'finance-expenses',
            icon: <FileText className="w-4 h-4 text-rose-600" />,
            onClick: () => {
              setActiveTab('finance-expenses');
              onClose();
              addToast(`Viewing expense: ${exp.description}`, 'info');
            },
          });
        });

      transactions
        .filter((t) => t.description.toLowerCase().includes(q) || t.party.toLowerCase().includes(q) || t.reference_id.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((t) => {
          results.push({
            id: `txn-${t.id}`,
            title: `${t.reference_id} — ${t.description}`,
            subtitle: `₹${t.amount.toLocaleString()} • ${t.party} • ${t.tx_type.toUpperCase()}`,
            type: 'Transaction',
            typeBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            tab: 'finance-transactions',
            icon: <Receipt className="w-4 h-4 text-emerald-600" />,
            onClick: () => {
              setActiveTab('finance-transactions');
              onClose();
              addToast(`Viewing transaction ${t.reference_id}`, 'info');
            },
          });
        });
    }

    // Match navigation shortcuts too
    navShortcuts
      .filter((n) => n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((n, idx) => {
        results.push({
          id: `nav-${idx}`,
          title: n.title,
          subtitle: n.subtitle,
          type: 'Navigation',
          typeBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          tab: n.tab,
          icon: n.icon,
          onClick: () => {
            setActiveTab(n.tab);
            onClose();
          },
        });
      });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-8 sm:pt-20 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[80vh]">
        {/* Search Header */}
        <div className="px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-slate-200 flex items-center gap-2.5 sm:gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records, leads, jobs, invoices, chats..."
            className="w-full bg-transparent text-base sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-semibold text-slate-600 bg-white whitespace-nowrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeFilter === 'all' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveFilter('conversations')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeFilter === 'conversations' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Chats ({conversations.length})
          </button>
          <button
            onClick={() => setActiveFilter('crm')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeFilter === 'crm' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Leads & Deals ({leads.length + deals.length})
          </button>
          <button
            onClick={() => setActiveFilter('ops')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeFilter === 'ops' ? 'bg-amber-600 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Jobs & Staff ({jobs.length + employees.length})
          </button>
          <button
            onClick={() => setActiveFilter('finance')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeFilter === 'finance' ? 'bg-purple-600 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Invoices ({invoices.length})
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 text-xs">
          {!q ? (
            <div className="space-y-4 p-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navShortcuts.map((nav) => (
                  <div
                    key={nav.tab}
                    onClick={() => {
                      setActiveTab(nav.tab);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white border border-slate-200/60 shadow-xs">
                      {nav.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                        {nav.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {nav.subtitle}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400">
                Found {results.length} matches
              </div>
              {results.map((res) => (
                <div
                  key={res.id}
                  onClick={res.onClick}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white border border-slate-200/80 shadow-xs">
                      {res.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-2 truncate">
                        <span>{res.title}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${res.typeBadgeColor}`}>
                          {res.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {res.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700">No results found for &ldquo;{query}&rdquo;</div>
              <p className="text-[11px] text-slate-400">Try searching for a customer name, phone number, service, or job code.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Tip: Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">Ctrl + /</kbd> anywhere to search</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

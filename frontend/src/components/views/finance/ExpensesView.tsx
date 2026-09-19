import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  IndianRupee,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  FileText,
  Building2,
  AlertTriangle,
  Printer,
  ChevronDown,
  ArrowUpDown,
  Tag,
  Sparkles,
  Wallet
} from 'lucide-react';
import { Expense } from '@/types';
import { exportTableToCsv } from '@/utils/exportCsv';
import { INITIAL_EXPENSES } from '@/store/initialDatasets';

// Custom Official Payment Voucher Icon with Indian Rupee (₹) Symbol
const ReceiptRupee: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M8.5 7.5h6.5" />
    <path d="M8.5 10.5h6.5" />
    <path d="M8.5 13.5h1.8" />
    <path d="M10.3 13.5c3.6 0 3.6-6 0-6" />
    <path d="m9.8 13.5 4.5 4.5" />
  </svg>
);

const EXPENSE_CATEGORIES = [
  'Operations',
  'Spare Parts & Inventory',
  'Rent & Utilities',
  'Salaries & Wages',
  'Fuel & Travel',
  'Marketing & WhatsApp Ads',
  'IT & Cloud Subscriptions',
];

const PAYMENT_MODES = [
  'UPI',
  'Bank Transfer',
  'Corporate Debit Card',
  'Petty Cash',
  'Net Banking',
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Operations': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Spare Parts & Inventory': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Rent & Utilities': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Salaries & Wages': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Fuel & Travel': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Marketing & WhatsApp Ads': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'IT & Cloud Subscriptions': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

const getCategoryStyle = (cat: string) => {
  return (
    CATEGORY_STYLES[cat] || {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
    }
  );
};

export const ExpensesView: React.FC = () => {
  const store = useQiyamStore();
  const {
    expenses,
    accounts,
    addExpense,
    updateExpense,
    deleteExpense,
    addToast,
    globalFilter,
  } = store;

  // Filter & Search States
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'vendor'>('newest');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form State for Record / Edit
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }, []);

  const [form, setForm] = useState<{
    date_str: string;
    description: string;
    category: string;
    vendor: string;
    amount: number | string;
    payment_mode: string;
    project: string;
    status: 'paid' | 'pending';
    reference_no: string;
    notes: string;
  }>({
    date_str: todayFormatted,
    description: '',
    category: 'Operations',
    vendor: '',
    amount: 2500,
    payment_mode: 'UPI',
    project: 'Field Operations',
    status: 'paid',
    reference_no: `EXP-2024-${String(100 + expenses.length + 1).padStart(4, '0')}`,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic KPI Calculations
  const kpis = useMemo(() => {
    const totalCount = expenses.length;
    const totalExpensesValue = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const paidExpenses = expenses.filter((e) => e.status === 'paid');
    const pendingExpenses = expenses.filter((e) => e.status === 'pending');

    const totalPaidValue = paidExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const totalPendingValue = pendingExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const salariesValue = expenses
      .filter((e) => e.category === 'Salaries & Wages' || e.description.toLowerCase().includes('salary') || e.description.toLowerCase().includes('payroll'))
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const rentValue = expenses
      .filter((e) => e.category === 'Rent & Utilities')
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const sparesValue = expenses
      .filter((e) => e.category === 'Spare Parts & Inventory')
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    // Monthly Budget: ₹15,00,000 benchmark
    const monthlyBudget = 1500000;
    const budgetUtilization = Math.min(100, (totalExpensesValue / monthlyBudget) * 100).toFixed(1);

    return {
      totalCount,
      totalExpensesValue,
      paidCount: paidExpenses.length,
      totalPaidValue,
      pendingCount: pendingExpenses.length,
      totalPendingValue,
      salariesValue,
      rentValue,
      sparesValue,
      monthlyBudget,
      budgetUtilization,
    };
  }, [expenses]);

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    const effectiveSearch = (searchQuery || globalFilter.query || '').trim().toLowerCase();

    const result = expenses.filter((exp) => {
      // 1. Status Filter
      if (filterStatus !== 'all') {
        if (exp.status !== filterStatus) return false;
      } else if (globalFilter.status && globalFilter.status !== 'all') {
        const s = globalFilter.status.toLowerCase();
        if (['paid', 'pending'].includes(s) && exp.status !== s) return false;
      }

      // 2. Category Filter
      if (filterCategory !== 'all' && exp.category !== filterCategory) {
        return false;
      }

      // 3. Payment Mode Filter
      if (filterPaymentMode !== 'all' && exp.payment_mode !== filterPaymentMode) {
        return false;
      }

      // 4. Search Query
      if (effectiveSearch) {
        const desc = (exp.description || '').toLowerCase();
        const vendor = (exp.vendor || '').toLowerCase();
        const category = (exp.category || '').toLowerCase();
        const mode = (exp.payment_mode || '').toLowerCase();
        const project = (exp.project || '').toLowerCase();
        const refNo = (exp.reference_no || '').toLowerCase();
        const notes = (exp.notes || '').toLowerCase();
        const amountStr = String(exp.amount || '');

        const matches =
          desc.includes(effectiveSearch) ||
          vendor.includes(effectiveSearch) ||
          category.includes(effectiveSearch) ||
          mode.includes(effectiveSearch) ||
          project.includes(effectiveSearch) ||
          refNo.includes(effectiveSearch) ||
          notes.includes(effectiveSearch) ||
          amountStr.includes(effectiveSearch);

        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'amount_high') return Number(b.amount) - Number(a.amount);
      if (sortBy === 'amount_low') return Number(a.amount) - Number(b.amount);
      if (sortBy === 'vendor') return (a.vendor || '').localeCompare(b.vendor || '');
      if (sortBy === 'oldest') {
        return Number(a.id) - Number(b.id);
      }
      // default: newest first
      return Number(b.id) - Number(a.id);
    });
  }, [expenses, filterStatus, filterCategory, filterPaymentMode, searchQuery, globalFilter.query, globalFilter.status, sortBy]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setForm({
      date_str: todayFormatted,
      description: '',
      category: 'Operations',
      vendor: '',
      amount: 2500,
      payment_mode: 'UPI',
      project: 'Field Operations',
      status: 'paid',
      reference_no: `EXP-2024-${String(100 + expenses.length + 1).padStart(4, '0')}`,
      notes: '',
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (exp: Expense) => {
    setSelectedExpense(exp);
    setForm({
      date_str: exp.date_str || todayFormatted,
      description: exp.description || '',
      category: exp.category || 'Operations',
      vendor: exp.vendor || '',
      amount: exp.amount || 0,
      payment_mode: exp.payment_mode || 'UPI',
      project: exp.project || '',
      status: exp.status || 'paid',
      reference_no: exp.reference_no || `EXP-2024-${String(exp.id).padStart(4, '0')}`,
      notes: exp.notes || '',
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (exp: Expense) => {
    setSelectedExpense(exp);
    setIsDeleteModalOpen(true);
  };

  // Open Voucher Modal
  const handleOpenVoucherModal = (exp: Expense) => {
    setSelectedExpense(exp);
    setIsVoucherModalOpen(true);
  };

  // Quick 1-Click Status Flip
  const handleToggleStatus = async (exp: Expense) => {
    const nextStatus: 'paid' | 'pending' = exp.status === 'paid' ? 'pending' : 'paid';
    await updateExpense(exp.id, { status: nextStatus });
  };

  // Submit Create Expense
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      addToast('Please enter an expense description', 'error');
      return;
    }
    const numAmount = Number(form.amount) || 0;
    if (numAmount <= 0) {
      addToast('Please enter a valid expense amount', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        date_str: form.date_str,
        description: form.description.trim(),
        category: form.category,
        vendor: form.vendor.trim() || 'General Vendor',
        amount: numAmount,
        payment_mode: form.payment_mode,
        project: form.project.trim() || 'General Operations',
        status: form.status,
        reference_no: form.reference_no.trim(),
        notes: form.notes.trim(),
      });
      setIsCreateModalOpen(false);
    } catch {
      addToast('Failed to record expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Expense
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    if (!form.description.trim()) {
      addToast('Please enter an expense description', 'error');
      return;
    }
    const numAmount = Number(form.amount) || 0;
    if (numAmount <= 0) {
      addToast('Please enter a valid expense amount', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateExpense(selectedExpense.id, {
        date_str: form.date_str,
        description: form.description.trim(),
        category: form.category,
        vendor: form.vendor.trim() || 'General Vendor',
        amount: numAmount,
        payment_mode: form.payment_mode,
        project: form.project.trim() || 'General Operations',
        status: form.status,
        reference_no: form.reference_no.trim(),
        notes: form.notes.trim(),
      });
      setIsEditModalOpen(false);
      setSelectedExpense(null);
    } catch {
      addToast('Failed to update expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Expense
  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;
    setIsSubmitting(true);
    try {
      await deleteExpense(selectedExpense.id);
      setIsDeleteModalOpen(false);
      setSelectedExpense(null);
    } catch {
      addToast('Failed to delete expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Table to CSV
  const handleExportCsv = () => {
    exportTableToCsv('finance-expenses', store);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterCategory('all');
    setFilterPaymentMode('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  // Print Official Voucher
  const handlePrintVoucher = (exp: Expense) => {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      addToast('Popup blocked! Please allow popups to print vouchers.', 'warning');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Voucher - ${exp.reference_no || `EXP-${exp.id}`}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; font-size: 13px; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 24px; }
            .logo-text { font-size: 24px; font-weight: 900; color: #ef4444; letter-spacing: -0.5px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .badge-paid { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
            .badge-pending { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .voucher-box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
            .amount-callout { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: right; }
            .amount-val { font-size: 28px; font-weight: 900; color: #b91c1c; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
            .sign-line { border-bottom: 1px solid #94a3b8; height: 40px; margin-bottom: 8px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-text">QIYAM VENTURES</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Qiyam Business OS • Financial Accounts & Disbursements</div>
              <div style="font-size: 11px; color: #64748b;">Cyberpark 4th Floor, Kozhikode, Kerala 673016</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 18px; color: #0f172a;">OFFICIAL PAYMENT VOUCHER</h2>
              <div style="font-weight: 700; color: #ef4444; font-size: 13px; margin: 4px 0;">#${exp.reference_no || `EXP-2024-${exp.id}`}</div>
              <div class="badge ${exp.status === 'paid' ? 'badge-paid' : 'badge-pending'}">${exp.status === 'paid' ? 'PAID / DISBURSED' : 'PENDING APPROVAL'}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Payment Voucher Date</div>
              <div style="font-weight: 700; font-size: 14px; margin-top: 2px;">${exp.date_str}</div>
              <div style="margin-top: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Category / Ledger</div>
              <div style="font-weight: 600;">${exp.category}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Payee / Vendor</div>
              <div style="font-weight: 700; font-size: 14px; margin-top: 2px;">${exp.vendor}</div>
              <div style="margin-top: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Payment Channel</div>
              <div style="font-weight: 600;">${exp.payment_mode}</div>
            </div>
          </div>

          <div class="voucher-box">
            <h4 style="margin: 0 0 8px 0; font-size: 14px;">Voucher Purpose & Particulars:</h4>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #334155; font-weight: 600;">${exp.description}</p>
            <div style="font-size: 12px; color: #64748b;"><strong>Cost Center / Project:</strong> ${exp.project || 'General Operations'}</div>
            ${exp.notes ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;"><strong>Memo:</strong> ${exp.notes}</div>` : ''}

            <div class="amount-callout">
              <div style="font-size: 11px; text-transform: uppercase; color: #7f1d1d; font-weight: 700;">Net Disbursed Amount</div>
              <div class="amount-val">₹${exp.amount.toLocaleString()}</div>
            </div>
          </div>

          <div class="signatures">
            <div>
              <div class="sign-line"></div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">Prepared By / Accounts Executive</div>
              <div style="font-size: 10px; color: #94a3b8;">Faris Usman (Accounts Lead)</div>
            </div>
            <div style="text-align: right;">
              <div class="sign-line"></div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">Authorized Signatory / Finance Director</div>
              <div style="font-size: 10px; color: #94a3b8;">Qiyam Ventures Management</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 400);
  };

  const isFilteringActive =
    filterStatus !== 'all' ||
    filterCategory !== 'all' ||
    filterPaymentMode !== 'all' ||
    Boolean(searchQuery.trim()) ||
    sortBy !== 'newest';

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Expenses & Budget Utilization"
        subtitle="Manage vendor bills, operating expenditures, salaries, and category budget caps."
        primaryActionLabel="Record Expense"
        onPrimaryAction={handleOpenCreateModal}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Dynamic KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          {/* Card 1: Total Expenses */}
          <div
            onClick={() => setFilterStatus('all')}
            className={`bg-white p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              filterStatus === 'all' ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Total Expenses</span>
              <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
                <TrendingDown className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{kpis.totalExpensesValue.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>{kpis.totalCount} operational bills</span>
              <span className="font-bold text-emerald-600">₹{kpis.totalPaidValue.toLocaleString()} paid</span>
            </div>
          </div>

          {/* Card 2: Salaries & Wages */}
          <div
            onClick={() => {
              setFilterCategory('Salaries & Wages');
              setFilterStatus('all');
            }}
            className={`bg-white p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              filterCategory === 'Salaries & Wages' ? 'border-purple-300 ring-2 ring-purple-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Salaries & Payroll</span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <IndianRupee className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{kpis.salariesValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Technicians & Support staff</span>
              <span className="font-semibold text-purple-600">Disbursed</span>
            </div>
          </div>

          {/* Card 3: Rent & Utilities */}
          <div
            onClick={() => {
              setFilterCategory('Rent & Utilities');
              setFilterStatus('all');
            }}
            className={`bg-white p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              filterCategory === 'Rent & Utilities' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Rent & Utilities</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{kpis.rentValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>HO Suite + Leased Fiber</span>
              <span className="font-semibold text-blue-600">Active</span>
            </div>
          </div>

          {/* Card 4: Budget Cap Utilization */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Budget Cap Utilization</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {kpis.budgetUtilization}%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">of ₹15L cap</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(kpis.budgetUtilization))}%` }}
              />
            </div>
            <div className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center justify-between">
              <span>Within monthly forecast</span>
              <span>{kpis.pendingCount} pending</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar & Actions */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                All Expenses ({kpis.totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('paid')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'paid'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid ({kpis.paidCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Pending Approval ({kpis.pendingCount})
              </button>
            </div>

            {/* Quick Actions (Export CSV & Record Expense) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Export filtered expenses to CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-red-700/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Expense</span>
              </button>
            </div>
          </div>

          {/* Secondary Filters Bar: Category, Payment Mode, Sort, Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor, memo, amount..."
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-red-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-red-500 cursor-pointer appearance-none pr-8"
              >
                <option value="all">All Categories ({expenses.length})</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({expenses.filter((e) => e.category === cat).length})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Payment Mode Dropdown */}
            <div className="relative">
              <select
                value={filterPaymentMode}
                onChange={(e) => setFilterPaymentMode(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-red-500 cursor-pointer appearance-none pr-8"
              >
                <option value="all">All Payment Modes</option>
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode} ({expenses.filter((e) => e.payment_mode === mode).length})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Selector & Reset */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-red-500 cursor-pointer appearance-none pr-8"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="amount_high">Sort: Amount (High to Low)</option>
                  <option value="amount_low">Sort: Amount (Low to High)</option>
                  <option value="vendor">Sort: Vendor (A-Z)</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {isFilteringActive && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[840px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description & Project</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor / Payee</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 px-4 text-center text-slate-500">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">No expenses found</h4>
                        <p className="text-xs text-slate-500">
                          {isFilteringActive
                            ? 'No operational expenses match your active filter or search criteria.'
                            : 'No expense records exist in the database.'}
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {isFilteringActive && (
                            <button
                              type="button"
                              onClick={handleClearFilters}
                              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                            >
                              Clear Filters
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="px-3.5 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Record Expense
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => {
                    const catStyle = getCategoryStyle(exp.category);
                    const isPaid = exp.status === 'paid';

                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-medium">
                          {exp.date_str}
                        </td>

                        {/* Description & Project */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{exp.description}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            {exp.reference_no && (
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                #{exp.reference_no}
                              </span>
                            )}
                            {exp.project && <span>{exp.project}</span>}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {exp.category}
                          </span>
                        </td>

                        {/* Vendor / Payee */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-700 font-semibold">{exp.vendor}</div>
                        </td>

                        {/* Payment Mode */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px]">
                            <Wallet className="w-3 h-3 text-slate-400" />
                            {exp.payment_mode}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right font-black text-sm text-red-600 whitespace-nowrap">
                          - ₹{Number(exp.amount).toLocaleString()}
                        </td>

                        {/* Status with 1-Click Toggle */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(exp)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase transition-all flex items-center gap-1 mx-auto cursor-pointer ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                            title={`Click to mark as ${isPaid ? 'Pending' : 'Paid'}`}
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Paid</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions Column */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Voucher */}
                            <button
                              type="button"
                              onClick={() => handleOpenVoucherModal(exp)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View official voucher"
                            >
                              <ReceiptRupee className="w-4 h-4" />
                            </button>

                            {/* Edit Expense */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(exp)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit expense details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Expense */}
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(exp)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          {filteredExpenses.length > 0 && (
            <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <div>
                Showing <strong className="text-slate-800">{filteredExpenses.length}</strong> of{' '}
                <strong className="text-slate-800">{expenses.length}</strong> recorded operational expenses
              </div>
              <div className="flex items-center gap-3">
                <span>
                  Filtered Sum:{' '}
                  <strong className="text-red-600 font-bold">
                    ₹{filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0).toLocaleString()}
                  </strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Paid:{' '}
                  <strong className="text-emerald-700 font-bold">
                    ₹
                    {filteredExpenses
                      .filter((e) => e.status === 'paid')
                      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0)
                      .toLocaleString()}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Expense Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-4 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Record Operational Expense</h3>
                  <p className="text-[11px] text-slate-500">Log vendor bills, inventory spares purchases, or utilities.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Copper Pipe Roll Restock (50m coils)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Vendor & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Vendor / Payee *</label>
                  <input
                    type="text"
                    required
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder="e.g. Calicut Spares Mart"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount with Stepper & Quick Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Amount (₹) *</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, amount: (Number(form.amount) || 0) + 500 })}
                      className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                    >
                      +₹500
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, amount: (Number(form.amount) || 0) + 1000 })}
                      className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                    >
                      +₹1K
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, amount: (Number(form.amount) || 0) + 5000 })}
                      className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                    >
                      +₹5K
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, amount: Math.max(0, (Number(form.amount) || 0) - 500) })}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm cursor-pointer"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs font-bold text-red-600 outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, amount: (Number(form.amount) || 0) + 500 })}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Payment Mode & Bank Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Payment Mode</label>
                  <select
                    value={form.payment_mode}
                    onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Disbursement Account</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name} ({acc.provider})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project / Tag & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cost Center / Project</label>
                  <input
                    type="text"
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    placeholder="e.g. Field Operations, Cyberpark HQ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date</label>
                  <input
                    type="text"
                    value={form.date_str}
                    onChange={(e) => setForm({ ...form, date_str: e.target.value })}
                    placeholder="e.g. May 31, 2024"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Voucher Reference & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Voucher / Ref #</label>
                  <input
                    type="text"
                    value={form.reference_no}
                    onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
                    placeholder="e.g. EXP-2024-0089"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Disbursement Status</label>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={form.status === 'paid'}
                        onChange={() => setForm({ ...form, status: 'paid' })}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="font-semibold text-slate-700">Paid</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                      <input
                        type="radio"
                        name="status"
                        checked={form.status === 'pending'}
                        onChange={() => setForm({ ...form, status: 'pending' })}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="font-semibold text-slate-700">Pending Approval</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notes / Memo (Optional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional particulars, invoice invoice reference, or payment notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-red-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-700/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {isEditModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-4 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Operational Expense</h3>
                  <p className="text-[11px] text-slate-500">
                    Modifying #{selectedExpense.reference_no || `EXP-${selectedExpense.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedExpense(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Copper Pipe Roll Restock"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Vendor & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Vendor / Payee *</label>
                  <input
                    type="text"
                    required
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount with Stepper */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Amount (₹) *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, amount: Math.max(0, (Number(form.amount) || 0) - 500) })}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm cursor-pointer"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs font-bold text-red-600 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, amount: (Number(form.amount) || 0) + 500 })}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Payment Mode & Cost Center */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Payment Mode</label>
                  <select
                    value={form.payment_mode}
                    onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cost Center / Project</label>
                  <input
                    type="text"
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date & Ref No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date</label>
                  <input
                    type="text"
                    value={form.date_str}
                    onChange={(e) => setForm({ ...form, date_str: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Voucher / Ref #</label>
                  <input
                    type="text"
                    value={form.reference_no}
                    onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Disbursement Status</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-status"
                      checked={form.status === 'paid'}
                      onChange={() => setForm({ ...form, status: 'paid' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-700">Paid</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-status"
                      checked={form.status === 'pending'}
                      onChange={() => setForm({ ...form, status: 'pending' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-700">Pending Approval</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notes / Memo</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedExpense(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm shadow-blue-700/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {isDeleteModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Expense?</h3>
                <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 text-sm">{selectedExpense.description}</div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Vendor: {selectedExpense.vendor}</span>
                <span className="font-bold text-red-600">- ₹{Number(selectedExpense.amount).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-slate-600 text-[11px]">
              Are you sure you want to permanently delete this expense voucher? It will be removed from your financial ledger.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedExpense(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-700/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Official Voucher Drawer / Modal */}
      {isVoucherModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <ReceiptRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Official Payment Voucher</h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    #{selectedExpense.reference_no || `EXP-${selectedExpense.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVoucherModalOpen(false);
                  setSelectedExpense(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voucher Body */}
            <div className="space-y-3">
              {/* Amount Highlight */}
              <div className="bg-red-50/70 border border-red-200 p-4 rounded-xl text-center">
                <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Disbursed Amount</div>
                <div className="text-2xl font-black text-red-700 mt-0.5">
                  - ₹{Number(selectedExpense.amount).toLocaleString()}
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white text-emerald-700 border-emerald-200 uppercase">
                  {selectedExpense.status === 'paid' ? 'Paid / Completed' : 'Pending Approval'}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400">Particulars:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[220px]">
                    {selectedExpense.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payee / Vendor:</span>
                  <span className="font-semibold text-slate-800">{selectedExpense.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-slate-800">{selectedExpense.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{selectedExpense.payment_mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost Center:</span>
                  <span className="font-semibold text-slate-800">{selectedExpense.project || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="font-semibold text-slate-800">{selectedExpense.date_str}</span>
                </div>
                {selectedExpense.notes && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Notes:</span>
                    <span className="text-slate-700 text-xs">{selectedExpense.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handlePrintVoucher(selectedExpense)}
                className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print PDF</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVoucherModalOpen(false);
                    handleOpenEditModal(selectedExpense);
                  }}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVoucherModalOpen(false);
                    setSelectedExpense(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

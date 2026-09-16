import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  BarChart3, Download, FileSpreadsheet, TrendingUp, TrendingDown,
  DollarSign, ArrowUpRight, ArrowDownRight, Wallet, CreditCard,
  Receipt, FileText, Calendar, Filter, CheckCircle2, AlertTriangle,
  Building2, Printer, ChevronRight, MessageSquare, Phone, ExternalLink,
  ShieldCheck, RefreshCw, X, ArrowRight, Eye, PieChart as PieIcon, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { exportTableToCsv } from '@/utils/exportCsv';

type ReportTab = 'pnl' | 'balance_sheet' | 'cash_flow' | 'ar_aging' | 'branches';
type PeriodType = 'may_2024' | 'apr_2024' | 'q1_2024' | 'fy_2024';

interface LedgerItem {
  code: string;
  category: string;
  name: string;
  currentAmount: number;
  prevAmount: number;
  type: 'income' | 'expense' | 'cogs';
  notes: string;
  vouchersCount: number;
}

export const ReportsView: React.FC = () => {
  const store = useQiyamStore();
  const {
    addToast,
    branches,
    invoices,
    openConversationForContact,
    setActiveTab,
  } = store;

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('pnl');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('may_2024');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedLedgerItem, setSelectedLedgerItem] = useState<LedgerItem | null>(null);

  const handleExport = (format: 'csv' | 'pdf' | 'print' = 'csv') => {
    if (format === 'csv') {
      const res = exportTableToCsv('finance-reports', store);
      addToast(`Financial report exported successfully (${res.filename})`, 'success');
    } else if (format === 'print') {
      window.print();
    } else {
      addToast('Generating executive audit PDF statement...', 'info');
      setTimeout(() => {
        addToast('Financial Audit Statement (May 2024) downloaded', 'success');
      }, 1000);
    }
    setIsExportModalOpen(false);
  };

  // 6-Month Comparative Performance Data for Recharts
  const monthlyComparativeData = [
    { month: 'Dec 23', revenue: 1680000, expenses: 1040000, ebitda: 640000, margin: 38.1 },
    { month: 'Jan 24', revenue: 1820000, expenses: 1110000, ebitda: 710000, margin: 39.0 },
    { month: 'Feb 24', revenue: 1950000, expenses: 1180000, ebitda: 770000, margin: 39.5 },
    { month: 'Mar 24', revenue: 2120000, expenses: 1220000, ebitda: 900000, margin: 42.5 },
    { month: 'Apr 24', revenue: 2175000, expenses: 1260000, ebitda: 915000, margin: 42.1 },
    { month: 'May 24', revenue: 2485320, expenses: 1355130, ebitda: 1130190, margin: 45.5 },
  ];

  // Cash Runway Projection Data
  const cashForecastData = [
    { week: 'Week 1', opening: 4210000, inflows: 580000, outflows: 290000, closing: 4500000 },
    { week: 'Week 2', opening: 4500000, inflows: 620000, outflows: 520000, closing: 4600000 },
    { week: 'Week 3', opening: 4600000, inflows: 710000, outflows: 310000, closing: 5000000 },
    { week: 'Week 4', opening: 5000000, inflows: 575320, outflows: 235130, closing: 5340190 },
  ];

  // AR Aging Records
  const arAgingRecords = [
    {
      invoice_number: 'INV-2024-0183',
      customer_name: 'Priya Sharma',
      phone: '+91 89213 56789',
      service: 'Commercial AMC & Deep Clean',
      amount: 32000,
      paid: 0,
      due_date: 'May 10, 2024',
      days_overdue: 21,
      bucket: '61-90',
      risk: 'high',
    },
    {
      invoice_number: 'INV-2024-0182',
      customer_name: 'Rahul Singh',
      phone: '+91 98764 11122',
      service: 'Full House Electrical Wiring',
      amount: 7600,
      paid: 0,
      due_date: 'May 20, 2024',
      days_overdue: 11,
      bucket: '31-60',
      risk: 'medium',
    },
    {
      invoice_number: 'INV-2024-0184',
      customer_name: 'Zoho Corp Hub',
      phone: '+91 80 4120 7890',
      service: 'Quarterly AC Ducting Service',
      amount: 4200,
      paid: 2100,
      due_date: 'May 28, 2024',
      days_overdue: 3,
      bucket: '0-30',
      risk: 'low',
    },
    {
      invoice_number: 'INV-2024-0187',
      customer_name: 'Vikram Mehta',
      phone: '+91 90000 11123',
      service: '1.5 Ton Inverter AC Installation',
      amount: 1200,
      paid: 360,
      due_date: 'May 29, 2024',
      days_overdue: 2,
      bucket: '0-30',
      risk: 'low',
    },
    {
      invoice_number: 'INV-2024-0188',
      customer_name: 'Sneha Joshi',
      phone: '+91 96789 66771',
      service: 'Pest Control Sanitization',
      amount: 2000,
      paid: 0,
      due_date: 'May 30, 2024',
      days_overdue: 1,
      bucket: '0-30',
      risk: 'low',
    },
  ];

  // Branch P&L Matrix
  const branchPnlMatrix = [
    {
      code: 'HO-001',
      name: 'Head Office (Kozhikode)',
      city: 'Kozhikode',
      revenue: 1145200,
      expenses: 580000,
      ebitda: 565200,
      margin: 49.4,
      share: 46.1,
      status: 'High Performer',
    },
    {
      code: 'BR-002',
      name: 'Kochi Regional Office',
      city: 'Kochi',
      revenue: 612000,
      expenses: 340000,
      ebitda: 272000,
      margin: 44.4,
      share: 24.6,
      status: 'Healthy Growth',
    },
    {
      code: 'BR-003',
      name: 'Bangalore Regional Hub',
      city: 'Bangalore',
      revenue: 385000,
      expenses: 220000,
      ebitda: 165000,
      margin: 42.9,
      share: 15.5,
      status: 'Profitable',
    },
    {
      code: 'BR-004',
      name: 'Mumbai Commercial Center',
      city: 'Mumbai',
      revenue: 210000,
      expenses: 135000,
      ebitda: 75000,
      margin: 35.7,
      share: 8.4,
      status: 'Expanding',
    },
    {
      code: 'BR-005',
      name: 'Delhi Northern Branch',
      city: 'New Delhi',
      revenue: 78000,
      expenses: 45000,
      ebitda: 33000,
      margin: 42.3,
      share: 3.1,
      status: 'Stable',
    },
    {
      code: 'BR-006',
      name: 'Chennai Hub',
      city: 'Chennai',
      revenue: 42000,
      expenses: 25000,
      ebitda: 17000,
      margin: 40.5,
      share: 1.7,
      status: 'Active',
    },
    {
      code: 'BR-007',
      name: 'Hyderabad Tech Hub',
      city: 'Hyderabad',
      revenue: 13120,
      expenses: 10130,
      ebitda: 2990,
      margin: 22.8,
      share: 0.6,
      status: 'Early Stage',
    },
  ];

  const handleSendPaymentReminder = async (record: typeof arAgingRecords[0]) => {
    const balance = record.amount - record.paid;
    const msg =
`💳 *Payment Reminder - CoolFix Services*

Dear *${record.customer_name}*,
This is a gentle reminder that invoice *#${record.invoice_number}* for *${record.service}* has an outstanding balance of *₹${balance.toLocaleString()}* (Due Date: ${record.due_date}).

📱 *Instant UPI Payment Link:*
https://upi.qiyam.in/pay?inv=${record.invoice_number}&amt=${balance}

Please ignore this message if you have already completed the transfer. If you require an updated statement or have questions, feel free to reply directly here. Thank you!`;

    addToast(`Dispatching payment reminder to ${record.customer_name}...`, 'info');
    await openConversationForContact({
      name: record.customer_name,
      phone: record.phone,
      service: record.service,
      initialMessage: msg,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Financial Statements & Reports"
        subtitle="Audited Profit & Loss Statements, Balance Sheets, Cash Flow forecasts, and Aging analyses."
        primaryActionLabel="Export Statement"
        onPrimaryAction={() => setIsExportModalOpen(true)}
      />

      <div className="p-3 sm:p-5 md:p-6 space-y-5 sm:space-y-6">
        {/* Top Control Strip: Period Presets & Branch Filter */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Period:</span>
            </span>
            {[
              { id: 'may_2024', label: 'May 2024 (Current)' },
              { id: 'apr_2024', label: 'April 2024' },
              { id: 'q1_2024', label: 'Q1 2024 (Jan - Mar)' },
              { id: 'fy_2024', label: 'FY 2023-24' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPeriod(p.id as PeriodType);
                  addToast(`Loaded statement for ${p.label}`, 'info');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  selectedPeriod === p.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedBranchFilter}
                onChange={(e) => {
                  setSelectedBranchFilter(e.target.value);
                  addToast(`Filtered statements by: ${e.target.value === 'all' ? 'All Entities' : e.target.value}`, 'info');
                }}
                className="bg-transparent font-semibold text-slate-700 outline-none text-xs cursor-pointer"
              >
                <option value="all">All Branches (Consolidated)</option>
                <option value="HO-001">Head Office (Kozhikode)</option>
                <option value="BR-002">Kochi Regional Office</option>
                <option value="BR-003">Bangalore Regional Hub</option>
                <option value="BR-004">Mumbai Commercial Center</option>
              </select>
            </div>
            <button
              onClick={() => handleExport('print')}
              title="Print Audited Statement"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Executive KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold">Gross Revenue</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900">₹24,85,320</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <span>↑ 14.2% MoM</span>
              <span className="text-slate-400 font-normal">| 99.4% target</span>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold">Total OPEX</span>
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900">₹13,55,130</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">
              <span>54.5% of Revenue</span>
              <span className="text-emerald-600 ml-1 font-bold">(-3.1%)</span>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold">Net Profit (EBITDA)</span>
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-700">₹11,30,190</div>
            <div className="text-[10px] sm:text-[11px] text-purple-600 font-bold mt-0.5">
              <span>45.5% Margin</span>
              <span className="text-slate-400 font-normal"> (Top 5%)</span>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold">Operating Cash Flow</span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-blue-700">₹9,82,450</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-0.5">
              <span>86.9% collected</span>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold">AR Aging / Overdue</span>
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-700">₹1,47,800</div>
            <div className="text-[10px] sm:text-[11px] text-amber-600 font-bold mt-0.5">
              <span>5 pending invoices</span>
            </div>
          </div>
        </div>

        {/* Report Tabs Navigation */}
        <div className="flex items-center border-b border-slate-200 space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveReportTab('pnl')}
            className={`pb-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReportTab === 'pnl'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Profit & Loss (P&L)</span>
          </button>

          <button
            onClick={() => setActiveReportTab('balance_sheet')}
            className={`pb-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReportTab === 'balance_sheet'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Balance Sheet</span>
          </button>

          <button
            onClick={() => setActiveReportTab('cash_flow')}
            className={`pb-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReportTab === 'cash_flow'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Cash Flow & Forecast</span>
          </button>

          <button
            onClick={() => setActiveReportTab('ar_aging')}
            className={`pb-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReportTab === 'ar_aging'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>AR Aging Analysis</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">5</span>
          </button>

          <button
            onClick={() => setActiveReportTab('branches')}
            className={`pb-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReportTab === 'branches'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Branch P&L Matrix</span>
          </button>
        </div>

        {/* TAB 1: PROFIT & LOSS (P&L) */}
        {activeReportTab === 'pnl' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Left: Main P&L Statement (Cols 1-7) */}
            <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">Profit & Loss Statement (May 2024)</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      Audited
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Period: May 01, 2024 – May 31, 2024 • CoolFix Services Ltd. • Accrual Accounting
                  </p>
                </div>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer shrink-0 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>

              {/* REVENUE SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-black text-xs uppercase tracking-wider text-slate-400">
                  <span>Operating Revenue (Gross Income)</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="space-y-2 pl-3 border-l-2 border-emerald-500">
                  <div
                    onClick={() =>
                      setSelectedLedgerItem({
                        code: '4010',
                        category: 'Revenue',
                        name: 'AC Installation & Maintenance Services',
                        currentAmount: 1845200,
                        prevAmount: 1585000,
                        type: 'income',
                        notes: 'Billed client invoices across 184 AC service contracts and 24 commercial site installs.',
                        vouchersCount: 184,
                      })
                    }
                    className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">
                        AC Installation & Maintenance Services
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">#4010 • 74.2%</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">₹18,45,200</span>
                  </div>

                  <div
                    onClick={() =>
                      setSelectedLedgerItem({
                        code: '4020',
                        category: 'Revenue',
                        name: 'Cleaning & Plumbing Contracts',
                        currentAmount: 640120,
                        prevAmount: 590000,
                        type: 'income',
                        notes: 'Deep residential cleaning, pipe fixes and AMC contracts in Kozhikode and Kochi.',
                        vouchersCount: 78,
                      })
                    }
                    className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">
                        Cleaning & Plumbing Contracts
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">#4020 • 25.8%</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">₹6,40,120</span>
                  </div>

                  <div className="flex justify-between items-center font-black text-slate-900 pt-2 border-t border-slate-100 px-2">
                    <span className="text-slate-800">Total Gross Income:</span>
                    <span className="text-emerald-600 text-sm font-mono font-bold">₹24,85,320</span>
                  </div>
                </div>
              </div>

              {/* COST OF GOODS & DIRECT SPARES */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between font-black text-xs uppercase tracking-wider text-slate-400">
                  <span>Direct Cost of Materials & Spares (COGS)</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="space-y-2 pl-3 border-l-2 border-amber-400">
                  <div className="flex justify-between items-center py-1 px-2">
                    <div>
                      <span className="text-slate-600">Refrigerant (R32/R410A) & Copper Piping:</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">#5010</span>
                    </div>
                    <span className="font-semibold text-slate-800 font-mono">₹1,45,130</span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2">
                    <div>
                      <span className="text-slate-600">Sanitization Chemical Solutions & Consumables:</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">#5020</span>
                    </div>
                    <span className="font-semibold text-slate-800 font-mono">₹65,000</span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2">
                    <div>
                      <span className="text-slate-600">Technician PPE & Diagnostic Tool Wear:</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">#5030</span>
                    </div>
                    <span className="font-semibold text-slate-800 font-mono">₹35,000</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-slate-900 pt-1.5 border-t border-slate-100 px-2">
                    <span className="text-slate-700">Gross Margin (Gross Profit):</span>
                    <span className="text-emerald-700 font-mono font-bold">₹22,40,190 (90.1%)</span>
                  </div>
                </div>
              </div>

              {/* OPERATING EXPENSES */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between font-black text-xs uppercase tracking-wider text-slate-400">
                  <span>Operating Expenses (OPEX)</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="space-y-2 pl-3 border-l-2 border-rose-500">
                  <div
                    onClick={() =>
                      setSelectedLedgerItem({
                        code: '6010',
                        category: 'Operating Expense',
                        name: 'Salaries & Contractor Payouts',
                        currentAmount: 845000,
                        prevAmount: 820000,
                        type: 'expense',
                        notes: '34 technicians, customer support staff, and regional managers direct payroll.',
                        vouchersCount: 34,
                      })
                    }
                    className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-700 group-hover:text-rose-700 transition-colors">
                        Salaries & Contractor Payouts:
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">#6010 • 62.4%</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">₹8,45,000</span>
                  </div>

                  <div className="flex justify-between items-center py-1 px-2">
                    <div>
                      <span className="text-slate-600">Spare Parts & Warehouse Materials:</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">#6020</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">₹2,45,130</span>
                  </div>

                  <div className="flex justify-between items-center py-1 px-2">
                    <div>
                      <span className="text-slate-600">Rent, Fuel & Utilities:</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">#6030</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">₹2,65,000</span>
                  </div>

                  <div className="flex justify-between items-center font-black text-slate-900 pt-2 border-t border-slate-100 px-2">
                    <span>Total Operating Expenses:</span>
                    <span className="text-rose-600 text-sm font-mono">₹13,55,130</span>
                  </div>
                </div>
              </div>

              {/* EBITDA / NET PROFIT CARD */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/60 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Earnings Before Interest, Taxes & Depreciation
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    Net Operating Profit (EBITDA):
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                    ₹11,30,190
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800">45.5% Margin</div>
                </div>
              </div>

              {/* Tax & Net Retained Profit */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Less: Estimated Tax Provision (GST & Corporate Tax):</span>
                  <span className="font-mono text-slate-800">-₹1,85,000</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Net Retained Earnings for Period:</span>
                  <span className="font-mono text-emerald-700 font-bold">₹9,45,190 (38.0%)</span>
                </div>
              </div>
            </div>

            {/* Right: Visual Analytics & Breakdown (Cols 8-12) */}
            <div className="lg:col-span-5 space-y-5">
              {/* 6-Month Income vs Expense Trend */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      6-Month Revenue vs Expense Trend
                    </h4>
                    <p className="text-[11px] text-slate-500">Dec 2023 – May 2024</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +14.2% MoM
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyComparativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickFormatter={(v) => `₹${v / 100000}L`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                        contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                      <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Operating Costs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Expenses
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-purple-500" /> EBITDA Margin
                  </span>
                </div>
              </div>

              {/* OPEX Distribution Donut */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    Operating Expense Breakdown
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">₹13.55 Lakhs</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Salaries & Contractor Payouts</span>
                      <span className="font-bold text-slate-900">₹8,45,000 (62.4%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '62.4%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Rent, Fuel & Utilities</span>
                      <span className="font-bold text-slate-900">₹2,65,000 (19.6%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '19.6%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Spare Parts & Warehouse Materials</span>
                      <span className="font-bold text-slate-900">₹2,45,130 (18.0%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '18.0%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-600 mt-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cost-to-Income Ratio:</span>
                  </span>
                  <span className="font-bold text-emerald-700 font-mono">54.5% (Safe)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BALANCE SHEET */}
        {activeReportTab === 'balance_sheet' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">Corporate Balance Sheet</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Balanced
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  As of May 31, 2024 • CoolFix Services Ltd. • Consolidated All Entities
                </p>
              </div>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer shrink-0 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Balance Sheet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ASSETS COLUMN */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-black text-xs uppercase tracking-wider text-slate-700 flex justify-between">
                  <span>Assets</span>
                  <span>Value (₹)</span>
                </div>

                <div className="space-y-2.5">
                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Current Assets</div>
                  <div className="space-y-1.5 pl-3 border-l-2 border-blue-500">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Cash & Liquid Bank Accounts (5 accounts):</span>
                      <span className="font-bold font-mono text-slate-900">₹45,62,350</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Accounts Receivable (AR Billed):</span>
                      <span className="font-bold font-mono text-slate-900">₹1,47,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Warehouse Spares & AC Inventory:</span>
                      <span className="font-bold font-mono text-slate-900">₹5,20,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Prepaid Rent & Service Deposits:</span>
                      <span className="font-bold font-mono text-slate-900">₹85,000</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Current Assets:</span>
                      <span className="text-blue-700 font-mono">₹53,15,150</span>
                    </div>
                  </div>

                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider pt-3">
                    Fixed & Non-Current Assets
                  </div>
                  <div className="space-y-1.5 pl-3 border-l-2 border-indigo-500">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Service Fleet (3 Vans, 2 Bikes - Net of Dep):</span>
                      <span className="font-bold font-mono text-slate-900">₹16,40,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">HVAC Recovery & Diagnostic Hardware:</span>
                      <span className="font-bold font-mono text-slate-900">₹3,85,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Office IT, Servers & Lab Infrastructure:</span>
                      <span className="font-bold font-mono text-slate-900">₹2,60,000</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Fixed Assets:</span>
                      <span className="text-indigo-700 font-mono">₹22,85,000</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 flex justify-between items-center font-black text-slate-900 text-sm">
                  <span>TOTAL ASSETS:</span>
                  <span className="text-blue-800 text-base font-mono">₹76,00,150</span>
                </div>
              </div>

              {/* LIABILITIES & EQUITY COLUMN */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-black text-xs uppercase tracking-wider text-slate-700 flex justify-between">
                  <span>Liabilities & Equity</span>
                  <span>Value (₹)</span>
                </div>

                <div className="space-y-2.5">
                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Current Liabilities</div>
                  <div className="space-y-1.5 pl-3 border-l-2 border-rose-500">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Accounts Payable (Vendor Spare Supply):</span>
                      <span className="font-bold font-mono text-slate-900">₹3,45,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Statutory Tax Payable (GST & TDS):</span>
                      <span className="font-bold font-mono text-slate-900">₹1,85,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Accrued Technician Salaries (Due June 5):</span>
                      <span className="font-bold font-mono text-slate-900">₹4,20,000</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Current Liabilities:</span>
                      <span className="text-rose-700 font-mono">₹9,50,000</span>
                    </div>
                  </div>

                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider pt-3">
                    Long-Term Liabilities
                  </div>
                  <div className="space-y-1.5 pl-3 border-l-2 border-amber-500">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Equipment & Vehicle Term Loan (HDFC):</span>
                      <span className="font-bold font-mono text-slate-900">₹7,50,000</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Long-Term Liabilities:</span>
                      <span className="text-amber-700 font-mono">₹7,50,000</span>
                    </div>
                  </div>

                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider pt-3">Shareholder Equity</div>
                  <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Partner Paid-up Capital:</span>
                      <span className="font-bold font-mono text-slate-900">₹35,00,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Retained Earnings (Accumulated):</span>
                      <span className="font-bold font-mono text-slate-900">₹14,99,960</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Current Period Net Income (May):</span>
                      <span className="font-bold font-mono text-emerald-700">₹9,00,190</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Equity:</span>
                      <span className="text-emerald-700 font-mono">₹59,00,150</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex justify-between items-center font-black text-slate-900 text-sm">
                  <span>TOTAL LIABILITIES & EQUITY:</span>
                  <span className="text-emerald-800 text-base font-mono">₹76,00,150</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CASH FLOW & FORECAST */}
        {activeReportTab === 'cash_flow' && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Cash Flow Statement */}
              <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Cash Flow Statement (May 2024)</h3>
                    <p className="text-slate-500 text-[11px]">Direct Cash Inflows & Outflows</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    Net Cash: +₹8,29,890
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl font-bold">
                    <span>Cash Balance at Beginning of Period (May 01):</span>
                    <span className="font-mono text-slate-900">₹37,32,460</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Cash Flow from Operations</div>
                    <div className="pl-3 border-l-2 border-emerald-500 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-700">Receipts from Client Invoices Billed:</span>
                        <span className="font-mono text-emerald-700 font-bold">+₹19,25,400</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">30% UPI Advance Deposits for Appointments:</span>
                        <span className="font-mono text-emerald-700 font-bold">+₹4,12,120</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Payments to Spare Parts Suppliers:</span>
                        <span className="font-mono text-rose-600">-₹2,45,130</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Salaries & Contractor Wage Disbursals:</span>
                        <span className="font-mono text-rose-600">-₹8,45,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Rent, Fuel & Facility Utilities:</span>
                        <span className="font-mono text-rose-600">-₹2,65,000</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                        <span>Net Operating Cash Generated:</span>
                        <span className="font-mono text-emerald-700">+₹9,27,390</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Cash Flow from Investing & Financing</div>
                    <div className="pl-3 border-l-2 border-blue-500 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-700">Purchase of Diagnostic Tools & Equipment:</span>
                        <span className="font-mono text-rose-600">-₹65,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Vehicle Term Loan Principal & Interest:</span>
                        <span className="font-mono text-rose-600">-₹32,500</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                        <span>Net Non-Operating Cash Outflow:</span>
                        <span className="font-mono text-slate-800">-₹97,500</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center font-bold text-slate-900 text-sm">
                    <span>Cash Balance at End of Period (May 31):</span>
                    <span className="text-emerald-800 font-mono text-base font-black">₹45,62,350</span>
                  </div>
                </div>
              </div>

              {/* 30-Day Predictive Runway Card */}
              <div className="lg:col-span-5 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    30-Day Predictive Cash Runway
                  </h3>
                  <p className="text-[11px] text-slate-500">Based on scheduled appointments & recurring contracts</p>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total Fixed OPEX Coverage</span>
                    <span className="text-xs font-bold text-emerald-400">Safe Runway</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">18.6 Months</div>
                  <p className="text-[11px] text-slate-400">
                    Business holds sufficient cash reserves to fund 18+ months of full operations without new debt.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-700">Weekly Forecast Milestones:</div>
                  {cashForecastData.map((wf) => (
                    <div
                      key={wf.week}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-[11px]"
                    >
                      <div className="font-bold text-slate-800">{wf.week}</div>
                      <div className="text-slate-500 font-mono">
                        +{`₹${(wf.inflows / 1000).toFixed(0)}k`} / -{`₹${(wf.outflows / 1000).toFixed(0)}k`}
                      </div>
                      <div className="font-bold font-mono text-emerald-700">₹{(wf.closing / 100000).toFixed(2)}L</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACCOUNTS RECEIVABLE (AR) AGING ANALYSIS */}
        {activeReportTab === 'ar_aging' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">Accounts Receivable (AR) Aging Analysis</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                    Total Pending: ₹1,47,800
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Overdue aging buckets with 1-click WhatsApp payment reminders and automated payment links.
                </p>
              </div>
              <button
                onClick={() => addToast('Exporting Aging Schedule...', 'info')}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer shrink-0 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Aging Schedule</span>
              </button>
            </div>

            {/* Aging Buckets Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                <div className="text-[10px] font-bold uppercase text-emerald-700">0 - 30 Days (Current)</div>
                <div className="text-lg font-black text-emerald-900 font-mono mt-0.5">₹78,200</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">52.9% of total AR • Healthy</div>
              </div>

              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                <div className="text-[10px] font-bold uppercase text-blue-700">31 - 60 Days</div>
                <div className="text-lg font-black text-blue-900 font-mono mt-0.5">₹37,600</div>
                <div className="text-[10px] text-blue-700 font-semibold mt-0.5">25.4% of total AR • Follow-up</div>
              </div>

              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                <div className="text-[10px] font-bold uppercase text-amber-700">61 - 90 Days (Overdue)</div>
                <div className="text-lg font-black text-amber-900 font-mono mt-0.5">₹32,000</div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">21.7% of total AR • Action req.</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-600">90+ Days (Doubtful)</div>
                <div className="text-lg font-black text-slate-800 font-mono mt-0.5">₹0</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">0.0% • Zero Bad Debts</div>
              </div>
            </div>

            {/* Overdue Debtors Table */}
            <div className="overflow-x-auto scrollbar-thin border border-slate-200 rounded-xl">
              <table className="w-full text-left min-w-[760px]">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Debtor / Customer</th>
                    <th className="py-3 px-4">Billed Service</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Days Overdue</th>
                    <th className="py-3 px-4">Outstanding (₹)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {arAgingRecords.map((rec) => {
                    const balance = rec.amount - rec.paid;
                    return (
                      <tr key={rec.invoice_number} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{rec.invoice_number}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{rec.customer_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{rec.phone}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{rec.service}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{rec.due_date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              rec.days_overdue > 14
                                ? 'bg-rose-100 text-rose-800'
                                : rec.days_overdue > 7
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rec.days_overdue} days
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                          ₹{balance.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSendPaymentReminder(rec)}
                            title="Open WhatsApp chat and send payment reminder link"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm shadow-emerald-700/20 cursor-pointer transition-all active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Link</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BRANCH FINANCIAL PERFORMANCE */}
        {activeReportTab === 'branches' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">Branch Financial Performance & Contribution</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                    7 Corporate Hubs
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Consolidated revenue, operating costs, and EBITDA margins across all operational hubs.
                </p>
              </div>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer shrink-0 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Branch CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto scrollbar-thin border border-slate-200 rounded-xl">
              <table className="w-full text-left min-w-[780px]">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Branch Code</th>
                    <th className="py-3 px-4">Hub Name & City</th>
                    <th className="py-3 px-4">Revenue (₹)</th>
                    <th className="py-3 px-4">Expenses (₹)</th>
                    <th className="py-3 px-4">EBITDA Profit (₹)</th>
                    <th className="py-3 px-4">Profit Margin</th>
                    <th className="py-3 px-4">Group Share</th>
                    <th className="py-3 px-4">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {branchPnlMatrix.map((b) => (
                    <tr key={b.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {b.name}
                        <div className="text-[10px] text-slate-400 font-normal">{b.city}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        ₹{b.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-rose-600">
                        ₹{b.expenses.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        ₹{b.ebitda.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-purple-700 font-mono">{b.margin}%</td>
                      <td className="py-3 px-4">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${b.share}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500">{b.share}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            b.margin > 45
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.margin > 35
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-black text-slate-900 border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-slate-800">
                      Consolidated Group Total:
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700">₹24,85,320</td>
                    <td className="py-3 px-4 font-mono text-rose-600">₹13,55,130</td>
                    <td className="py-3 px-4 font-mono text-slate-900">₹11,30,190</td>
                    <td className="py-3 px-4 font-mono text-purple-700">45.5%</td>
                    <td className="py-3 px-4">100.0%</td>
                    <td className="py-3 px-4 text-emerald-700">Optimal</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Itemized Ledger Detail Modal */}
      {selectedLedgerItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    selectedLedgerItem.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {selectedLedgerItem.code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {selectedLedgerItem.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">{selectedLedgerItem.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedLedgerItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-sm font-black">
                  <span>Current Period Total:</span>
                  <span className="font-mono text-emerald-700">₹{selectedLedgerItem.currentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Previous Period:</span>
                  <span className="font-mono">₹{selectedLedgerItem.prevAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Period Variance:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    +₹{(selectedLedgerItem.currentAmount - selectedLedgerItem.prevAmount).toLocaleString()} (
                    {(
                      ((selectedLedgerItem.currentAmount - selectedLedgerItem.prevAmount) / selectedLedgerItem.prevAmount) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-700">Auditor Notes & Breakdown:</div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] leading-relaxed">
                  {selectedLedgerItem.notes}
                </p>
              </div>

              <div className="p-2.5 bg-blue-50/70 text-blue-800 rounded-xl border border-blue-200 flex items-center justify-between text-[11px]">
                <span className="font-medium">Total Supporting Vouchers / Records:</span>
                <span className="font-bold font-mono">{selectedLedgerItem.vouchersCount} verified</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLedgerItem(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Statement Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Export Financial Statement</h3>
                  <p className="text-[11px] text-slate-500">Choose export format and audit configuration.</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleExport('csv')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700">
                      Excel / CSV Spreadsheet (.csv)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Raw transactional ledger data for accountants & ERP import.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                onClick={() => handleExport('pdf')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <FileText className="w-5 h-5 text-rose-600" />
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700">
                      Executive Audit PDF Report
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Formatted statement with corporate letterhead, charts & EBITDA seal.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                onClick={() => handleExport('print')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Printer className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-bold text-slate-900">Direct Print View</div>
                    <div className="text-[11px] text-slate-500">
                      Clean print stylesheet optimized for A4 paper and PDF printers.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



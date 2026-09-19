import React, { useState, useMemo, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Receipt, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, X, Wallet } from 'lucide-react';
import { INITIAL_ACCOUNTS } from '@/store/initialDatasets';

export const TransactionsView: React.FC = () => {
  const { transactions, accounts, addTransaction, addToast, globalFilter, targetHighlightId, setActiveTab } = useQiyamStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamically resolve payment accounts from /finance/accounts store
  const dynamicAccounts = useMemo(() => {
    const list = accounts && accounts.length > 0 ? accounts : INITIAL_ACCOUNTS;
    const active = list.filter((acc) => acc.status?.toLowerCase() !== 'inactive');
    return active.length > 0 ? active : list;
  }, [accounts]);

  // Form state
  const [txForm, setTxForm] = useState({
    date_str: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    tx_type: 'income' as 'income' | 'expense' | 'transfer' | 'refund',
    description: '',
    category: 'Sales Receipt',
    party: '',
    account: '',
    amount: 5000,
    payment_mode: 'UPI / GPay',
    reference_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'completed' as 'completed' | 'pending' | 'failed'
  });

  // Ensure default account is selected when opening modal
  useEffect(() => {
    if (isModalOpen && (!txForm.account || !dynamicAccounts.some((a) => a.name === txForm.account))) {
      if (dynamicAccounts.length > 0) {
        setTxForm((prev) => ({ ...prev, account: dynamicAccounts[0].name }));
      }
    }
  }, [isModalOpen, dynamicAccounts]);

  const selectedAccountInfo = useMemo(() => {
    return dynamicAccounts.find((a) => a.name === txForm.account) || dynamicAccounts[0];
  }, [dynamicAccounts, txForm.account]);

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.tx_type !== filterType) return false;
    if (accountFilter !== 'all' && t.account !== accountFilter) return false;
    if (globalFilter.status && globalFilter.status !== 'all') {
      const s = globalFilter.status.toLowerCase();
      if (['income', 'expense', 'transfer'].includes(s)) {
        if (t.tx_type !== s) return false;
      } else {
        if (t.status !== s) return false;
      }
    }
    
    const activeSearch = (search || globalFilter.query || '').toLowerCase();
    if (activeSearch) {
      return (
        t.description.toLowerCase().includes(activeSearch) ||
        t.party.toLowerCase().includes(activeSearch) ||
        t.reference_id.toLowerCase().includes(activeSearch) ||
        (t.account || '').toLowerCase().includes(activeSearch)
      );
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.description || !txForm.party) {
      addToast('Please enter both description and party name', 'error');
      return;
    }

    const resolvedAccount = txForm.account || dynamicAccounts[0]?.name || 'HDFC Business Account';

    addTransaction({
      ...txForm,
      account: resolvedAccount,
      amount: Number(txForm.amount)
    });

    addToast(`Transaction ${txForm.reference_id} recorded successfully!`, 'success');
    setIsModalOpen(false);
    setTxForm({
      date_str: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      tx_type: 'income',
      description: '',
      category: 'Sales Receipt',
      party: '',
      account: dynamicAccounts[0]?.name || 'HDFC Business Account',
      amount: 5000,
      payment_mode: 'UPI / GPay',
      reference_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'completed'
    });
  };

  const incomeCount = transactions.filter((t) => t.tx_type === 'income').length;
  const expenseCount = transactions.filter((t) => t.tx_type === 'expense').length;
  const transferCount = transactions.filter((t) => t.tx_type === 'transfer').length;
  const refundCount = transactions.filter((t) => t.tx_type === 'refund').length;

  const totalIncome = transactions
    .filter((t) => t.tx_type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.tx_type === 'expense' || t.tx_type === 'refund')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Transactions"
        subtitle="Detailed financial transactions, income credits, vendor debits, and transfers."
        primaryActionLabel="Add Transaction"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Credits (Income)</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹{totalIncome.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{incomeCount} incoming transfers</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Debits (Expense)</div>
            <div className="text-xl sm:text-2xl font-black text-red-600 mt-1">₹{totalExpense.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {expenseCount} vendor payouts{refundCount > 0 ? ` • ${refundCount} refunds` : ''}
            </div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Net Cash Flow</div>
            <div className={`text-xl sm:text-2xl font-black mt-1 ${netCashFlow >= 0 ? 'text-blue-700' : 'text-amber-600'}`}>
              ₹{netCashFlow.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {transactions.length} total entries{transferCount > 0 ? ` (${transferCount} transfers)` : ''}
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 text-xs font-semibold">
          {/* Transaction Type Filter Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Income Credits ({incomeCount})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'expense' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Expenses ({expenseCount})
            </button>
            <button
              onClick={() => setFilterType('transfer')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'transfer' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Transfers ({transferCount})
            </button>
            <button
              onClick={() => setFilterType('refund')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'refund' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Refunds ({refundCount})
            </button>
          </div>

          {/* Right Side Dropdown Filters & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            {/* Transaction Type Filter Dropdown */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                title="Filter by Transaction Type"
              >
                <option value="all">All Types ({transactions.length})</option>
                <option value="income">Income (Credit) ({incomeCount})</option>
                <option value="expense">Expense (Debit) ({expenseCount})</option>
                <option value="transfer">Account Transfer ({transferCount})</option>
                <option value="refund">Customer Refund ({refundCount})</option>
              </select>
            </div>

            {/* Dynamic Account Filter Dropdown */}
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
              title="Filter transactions by account"
            >
              <option value="all">All Accounts ({dynamicAccounts.length})</option>
              {dynamicAccounts.map((acc) => (
                <option key={acc.id} value={acc.name}>{acc.name}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, party, account..."
                className="w-full sm:w-52 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[780px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Party / Customer</th>
                <th className="py-3 px-4">Category & Type</th>
                <th className="py-3 px-4">Account / Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((t) => {
                const isIncome = t.tx_type === 'income';
                const isExpense = t.tx_type === 'expense';
                const isTransfer = t.tx_type === 'transfer';
                const isRefund = t.tx_type === 'refund';
                const isTarget = targetHighlightId === t.id || targetHighlightId === t.reference_id;

                return (
                  <tr
                    key={t.id}
                    className={`transition-colors ${
                      isTarget
                        ? 'bg-amber-50 ring-2 ring-amber-400 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-500">{t.date_str}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                      {t.reference_id}
                      {isTarget && (
                        <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">
                          Target
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.description}</td>
                    <td className="py-3.5 px-4 text-slate-600">{t.party}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {t.category}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isExpense
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isTransfer
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {isIncome
                            ? 'Income'
                            : isExpense
                            ? 'Expense'
                            : isTransfer
                            ? 'Transfer'
                            : 'Refund'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{t.account}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{t.payment_mode}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-black text-sm ${
                          isIncome
                            ? 'text-emerald-600'
                            : isExpense
                            ? 'text-red-600'
                            : isTransfer
                            ? 'text-blue-600'
                            : 'text-purple-600'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '↔' : '-'} ₹{t.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No transactions match the selected filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching transaction type, account, or clearing search query.</p>
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setAccountFilter('all');
                        setSearch('');
                      }}
                      className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Record New Transaction</h3>
                <p className="text-xs text-slate-500">Post income credit, vendor debit, or balance transfer.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Transaction Type</label>
                  <select
                    value={txForm.tx_type}
                    onChange={(e) => setTxForm({ ...txForm, tx_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  >
                    <option value="income">Income (Credit)</option>
                    <option value="expense">Expense (Debit)</option>
                    <option value="transfer">Account Transfer</option>
                    <option value="refund">Customer Refund</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800 font-bold"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Description / Narration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AC Installation Invoice #INV-2024-001 Settlement"
                    value={txForm.description}
                    onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Party / Customer / Vendor *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma or Daikin India"
                    value={txForm.party}
                    onChange={(e) => setTxForm({ ...txForm, party: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Bank / Cash Account *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setActiveTab('finance-accounts');
                      }}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      title="Manage payment accounts in /finance/accounts"
                    >
                      <span>View Accounts ({dynamicAccounts.length})</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <select
                    value={txForm.account}
                    onChange={(e) => setTxForm({ ...txForm, account: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800 font-medium cursor-pointer"
                    required
                  >
                    {dynamicAccounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name} ({acc.provider || acc.account_type} • ₹{Number(acc.current_balance || 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                  {selectedAccountInfo && (
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      <span>Type: <strong className="text-slate-700">{selectedAccountInfo.account_type}</strong></span>
                      <span>Available: <strong className="text-emerald-600 font-bold">₹{Number(selectedAccountInfo.current_balance || 0).toLocaleString()}</strong></span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Mode</label>
                  <select
                    value={txForm.payment_mode}
                    onChange={(e) => setTxForm({ ...txForm, payment_mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Net Banking / NEFT">Net Banking / NEFT</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



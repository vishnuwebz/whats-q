import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  ReceiptText, IndianRupee, CheckCircle2, XCircle,
  Plus, Search, Filter, Fuel, Wrench, Utensils,
  FileText, Check, X, ChevronRight, Eye, PenTool
} from 'lucide-react';

interface VoucherClaim {
  id: string | number;
  employee_id_str: string;
  name: string;
  role: string;
  category: 'Petrol / Diesel' | 'Tools & Hardware' | 'Customer Site Travel' | 'Meals / Tea on Site';
  amount: number;
  bill_number: string;
  date_str: string;
  description: string;
  status: 'pending' | 'approved_paid' | 'rejected';
}

const INITIAL_VOUCHERS: VoucherClaim[] = [
  {
    id: 1,
    employee_id_str: 'EMP-001',
    name: 'Amit Sharma',
    role: 'Field Technician',
    category: 'Petrol / Diesel',
    amount: 450,
    bill_number: 'IOC-88234',
    date_str: '30 May 2024',
    description: 'Petrol bill for traveling to 4 customer AC repairs in Kozhikode.',
    status: 'pending',
  },
  {
    id: 2,
    employee_id_str: 'EMP-003',
    name: 'Rahul Singh',
    role: 'Plumbing Technician',
    category: 'Tools & Hardware',
    amount: 1850,
    bill_number: 'HDW-9012',
    date_str: '29 May 2024',
    description: 'Purchased 2 CPVC ball valves and Teflon seal tapes from Calicut Hardware.',
    status: 'pending',
  },
  {
    id: 3,
    employee_id_str: 'EMP-005',
    name: 'Arjun Nair',
    role: 'Electrician',
    category: 'Customer Site Travel',
    amount: 120,
    bill_number: 'TOLL-3341',
    date_str: '28 May 2024',
    description: 'Highway toll & parking charges at customer apartment complex.',
    status: 'approved_paid',
  },
  {
    id: 4,
    employee_id_str: 'EMP-001',
    name: 'Amit Sharma',
    role: 'Field Technician',
    category: 'Petrol / Diesel',
    amount: 500,
    bill_number: 'BP-1120',
    date_str: '26 May 2024',
    description: 'Bike fuel for Vadakara emergency visit.',
    status: 'approved_paid',
  },
];

export const EmployeeVouchersView: React.FC = () => {
  const { employees, addToast, openPdfEditor } = useQiyamStore();

  const [vouchers, setVouchers] = useState<VoucherClaim[]>(INITIAL_VOUCHERS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved_paid' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Submit modal form
  const [claimForm, setClaimForm] = useState({
    employee_id_str: employees[0]?.employee_id_str || 'EMP-001',
    category: 'Petrol / Diesel' as VoucherClaim['category'],
    amount: 450,
    bill_number: 'BILL-',
    description: '',
  });

  const pendingAmount = vouchers
    .filter((v) => v.status === 'pending')
    .reduce((acc, v) => acc + v.amount, 0);

  const settledAmount = vouchers
    .filter((v) => v.status === 'approved_paid')
    .reduce((acc, v) => acc + v.amount, 0);

  const handleApproveAndPay = (id: string | number) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'approved_paid' } : v))
    );
    addToast('Claim approved and reimbursement processed via UPI!', 'success');
  };

  const handleRejectClaim = (id: string | number) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'rejected' } : v))
    );
    addToast('Claim rejected', 'info');
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employee_id_str === claimForm.employee_id_str);
    if (!emp) return;

    const newClaim: VoucherClaim = {
      id: Date.now(),
      employee_id_str: emp.employee_id_str,
      name: emp.name,
      role: emp.role,
      category: claimForm.category,
      amount: Number(claimForm.amount),
      bill_number: claimForm.bill_number || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      date_str: 'Today',
      description: claimForm.description || 'Expense incurred on duty',
      status: 'pending',
    };

    setVouchers([newClaim, ...vouchers]);
    setIsSubmitModalOpen(false);
    addToast(`Voucher claim of ₹${claimForm.amount} submitted for ${emp.name}`, 'success');
  };

  const filtered = vouchers.filter((v) => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    const q = search.toLowerCase().trim();
    if (q) {
      return (
        (v.name || '').toLowerCase().includes(q) ||
        (v.employee_id_str || '').toLowerCase().includes(q) ||
        (v.category || '').toLowerCase().includes(q) ||
        (v.bill_number || '').toLowerCase().includes(q) ||
        (v.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Voucher Claims & Reimbursements"
        subtitle="Staff petrol bills, spare parts receipts, customer travel expenses, and instant UPI reimbursement approval."
        activeSubTab="ops-emp-vouchers"
        primaryActionLabel="Submit Bill Claim"
        primaryActionIcon={ReceiptText}
        onPrimaryAction={() => setIsSubmitModalOpen(true)}
        badgeCount={`₹${pendingAmount.toLocaleString('en-IN')} Pending`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Pending Reimbursements</div>
            <div className="text-2xl font-black text-amber-500 mt-1">₹{pendingAmount.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">
              {vouchers.filter((v) => v.status === 'pending').length} claims awaiting approval
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Settled This Month</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹{settledAmount.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Paid out to technicians</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Top Claim Category</div>
            <div className="text-2xl font-black text-slate-900 mt-1">Petrol / Fuel</div>
            <div className="text-[11px] text-slate-500 mt-0.5">68% of all field claims</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Average Payout Speed</div>
            <div className="text-2xl font-black text-purple-600 mt-1">Same Day</div>
            <div className="text-[11px] text-purple-600 mt-0.5">Direct UPI bank transfer</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff, bill #, category, details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              All ({vouchers.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Pending ({vouchers.filter((v) => v.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved_paid')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterStatus === 'approved_paid' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Paid ({vouchers.filter((v) => v.status === 'approved_paid').length})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterStatus === 'rejected' ? 'bg-white text-red-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Rejected ({vouchers.filter((v) => v.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Submitted Expense Claims</h3>
            <span className="text-xs text-slate-400">Click Approve & Pay to disburse reimbursement</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Expense Category</th>
                  <th className="p-3.5">Bill Number</th>
                  <th className="p-3.5">Claim Amount</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Description / Purpose</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => {
                  const isPending = v.status === 'pending';
                  const isPaid = v.status === 'approved_paid';

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{v.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{v.employee_id_str} • {v.role}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {v.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{v.bill_number}</td>
                      <td className="p-3.5 font-black text-slate-900 font-mono text-sm">
                        ₹{v.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-slate-600">{v.date_str}</td>
                      <td className="p-3.5 text-slate-600 max-w-xs">{v.description}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPaid ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                          {isPaid ? 'PAID (UPI)' : isPending ? 'PENDING' : 'REJECTED'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApproveAndPay(v.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleRejectClaim(v.id)}
                                className="px-2 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                              >
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400 font-medium text-[11px] mr-1">
                              {isPaid ? 'Settled ✔' : 'Rejected ✖'}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              openPdfEditor({
                                type: 'voucher',
                                title: `Expense Claim Voucher - ${v.bill_number}`,
                                recipientName: v.name,
                                recipientRole: v.role,
                                recipientId: v.employee_id_str,
                                amount: v.amount,
                                dateStr: v.date_str,
                                invoiceNumber: v.bill_number,
                                items: [
                                  { description: `${v.category}: ${v.description}`, qty: 1, unitPrice: v.amount, amount: v.amount }
                                ],
                              });
                            }}
                            className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 border border-indigo-200 shadow-2xs"
                            title="Edit Voucher in 2026 PDF Editor"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Edit PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submit Voucher Claim Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Submit Staff Bill Claim</h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Staff Member *</label>
                <select
                  value={claimForm.employee_id_str}
                  onChange={(e) => setClaimForm({ ...claimForm, employee_id_str: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employee_id_str}>
                      {emp.name} ({emp.employee_id_str}) - {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Expense Category *</label>
                <select
                  value={claimForm.category}
                  onChange={(e) => setClaimForm({ ...claimForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Petrol / Diesel">Petrol / Diesel (Bike/Van)</option>
                  <option value="Tools & Hardware">Tools & Spare Parts Purchase</option>
                  <option value="Customer Site Travel">Customer Site Travel & Tolls</option>
                  <option value="Meals / Tea on Site">Meals & Tea on Field Site</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Claim Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={claimForm.amount}
                    onChange={(e) => setClaimForm({ ...claimForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bill / Receipt Number</label>
                  <input
                    type="text"
                    placeholder="e.g. IOC-88234"
                    value={claimForm.bill_number}
                    onChange={(e) => setClaimForm({ ...claimForm, bill_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description / Bill Details *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Filled 4.5 litres petrol for traveling to Vadakara customer visits."
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Submit Voucher Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

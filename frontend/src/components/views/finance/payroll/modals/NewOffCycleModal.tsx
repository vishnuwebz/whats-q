import React, { useState } from 'react';
import { X, Zap, CheckCircle2 } from 'lucide-react';
import { OffCyclePaymentItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: OffCyclePaymentItem) => void;
}

export const NewOffCycleModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [employeeName, setEmployeeName] = useState('Amit Sharma');
  const [employeeId, setEmployeeId] = useState('EMP001');
  const [department, setDepartment] = useState('Operations');
  const [paymentType, setPaymentType] = useState<OffCyclePaymentItem['payment_type']>('Bonus');
  const [amount, setAmount] = useState<number>(15000);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const employees = [
    { id: 'EMP001', name: 'Amit Sharma', dept: 'Operations' },
    { id: 'EMP002', name: 'Rahul Singh', dept: 'Sales' },
    { id: 'EMP003', name: 'Priya Mehta', dept: 'Marketing' },
    { id: 'EMP004', name: 'Vikram Kumar', dept: 'Technology' },
    { id: 'EMP005', name: 'Nazia A', dept: 'HR' },
    { id: 'EMP006', name: 'Sameer K', dept: 'Finance' },
    { id: 'EMP007', name: 'Devika L', dept: 'Operations' },
    { id: 'EMP008', name: 'Irshad Rahman', dept: 'Sales' },
    { id: 'EMP009', name: 'Sana N', dept: 'Marketing' },
    { id: 'EMP010', name: 'Arjun R', dept: 'Technology' },
  ];

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = employees.find((emp) => emp.id === e.target.value);
    if (selected) {
      setEmployeeId(selected.id);
      setEmployeeName(selected.name);
      setDepartment(selected.dept);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const runNum = Math.floor(Math.random() * 900) + 100;
    const newOffCycle: OffCyclePaymentItem = {
      id: Date.now(),
      run_id: `OC-2024-${runNum}`,
      employee_name: employeeName,
      employee_id: employeeId,
      department,
      payment_type: paymentType,
      amount: Number(amount) || 0,
      processed_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Paid',
      notes,
    };

    onSave(newOffCycle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">New Off-cycle Payment</h3>
              <p className="text-[11px] text-slate-500">Disburse one-time bonuses, incentives, or arrears.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Select Employee *</label>
            <select
              value={employeeId}
              onChange={handleEmployeeChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id}) — {emp.dept}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Bonus">Bonus</option>
                <option value="Incentive">Incentive</option>
                <option value="Project Bonus">Project Bonus</option>
                <option value="Retention Bonus">Retention Bonus</option>
                <option value="Commission">Commission</option>
                <option value="Arrears">Arrears</option>
                <option value="Overtime">Overtime</option>
                <option value="Referral Bonus">Referral Bonus</option>
                <option value="Reimbursement">Reimbursement</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Amount (₹) *</label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Reason / Memo</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Q1 Sales quota achievement milestone bonus"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Process Disbursement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

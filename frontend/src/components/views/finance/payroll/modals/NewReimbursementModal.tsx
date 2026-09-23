import React, { useState } from 'react';
import { X, Receipt, CheckCircle2 } from 'lucide-react';
import { ReimbursementItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reimbursement: ReimbursementItem) => void;
}

export const NewReimbursementModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [employeeName, setEmployeeName] = useState('Amit Sharma');
  const [employeeId, setEmployeeId] = useState('EMP001');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState<ReimbursementItem['category']>('Travel');
  const [amount, setAmount] = useState<number>(1500);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const employees = [
    { id: 'EMP001', name: 'Amit Sharma' },
    { id: 'EMP002', name: 'Rahul Singh' },
    { id: 'EMP003', name: 'Priya Mehta' },
    { id: 'EMP004', name: 'Vikram Kumar' },
    { id: 'EMP005', name: 'Nazia A' },
    { id: 'EMP006', name: 'Sameer K' },
    { id: 'EMP007', name: 'Devika L' },
    { id: 'EMP008', name: 'Irshad Rahman' },
    { id: 'EMP009', name: 'Sana N' },
    { id: 'EMP010', name: 'Arjun R' },
  ];

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = employees.find((emp) => emp.id === e.target.value);
    if (selected) {
      setEmployeeId(selected.id);
      setEmployeeName(selected.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    const newReimbursement: ReimbursementItem = {
      id: Date.now(),
      employee_name: employeeName,
      employee_id: employeeId,
      purpose: purpose.trim(),
      category,
      amount: Number(amount) || 0,
      submitted_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
      notes,
    };

    onSave(newReimbursement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">New Reimbursement Request</h3>
              <p className="text-[11px] text-slate-500">Submit employee business expense for approval.</p>
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-pink-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Purpose / Expense Title *</label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Client visit travel allowance"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Internet">Internet</option>
                <option value="Stationery">Stationery</option>
                <option value="Software">Software</option>
                <option value="Training">Training</option>
                <option value="Transport">Transport</option>
                <option value="Communication">Communication</option>
                <option value="Other">Other</option>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Receipt / Proof Details</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Invoice # or voucher details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none focus:ring-1 focus:ring-pink-500"
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
              className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-sm shadow-pink-700/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

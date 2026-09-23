import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, Building2 } from 'lucide-react';
import { SalaryStructure, SalaryComponentItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (structure: SalaryStructure) => void;
}

export const NewSalaryStructureModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [ctcRange, setCtcRange] = useState('₹30,000 – ₹55,000');
  const [payFrequency, setPayFrequency] = useState('Monthly');
  const [components, setComponents] = useState<SalaryComponentItem[]>([
    { name: 'Basic Salary', type: 'Fixed %', value: '40%' },
    { name: 'HRA', type: 'Fixed %', value: '20%' },
    { name: 'Conveyance Allowance', type: 'Fixed Amount', value: 3000 },
    { name: 'Special Allowance', type: 'Fixed %', value: '15%' },
    { name: 'Others', type: 'Fixed %', value: '25%' },
  ]);

  if (!isOpen) return null;

  const handleAddComponent = () => {
    setComponents([
      ...components,
      { name: 'New Component', type: 'Fixed %', value: '10%' },
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleUpdateComponent = (
    index: number,
    field: keyof SalaryComponentItem,
    val: any
  ) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: val };
    setComponents(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStruct: SalaryStructure = {
      id: Date.now(),
      name: name.trim(),
      department,
      employees_count: 0,
      ctc_range: ctcRange,
      pay_frequency: payFrequency,
      status: 'Active',
      components,
    };

    onSave(newStruct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Add Salary Structure</h3>
              <p className="text-[11px] text-slate-500">
                Define earnings, allowances, and statutory rules for this grade.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Structure Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Field Engineering Grade A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Technology">Technology</option>
                <option value="HR">HR & Admin</option>
                <option value="Finance">Finance & Accounts</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">CTC Range</label>
              <input
                type="text"
                value={ctcRange}
                onChange={(e) => setCtcRange(e.target.value)}
                placeholder="e.g. ₹35,000 – ₹60,000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Pay Frequency</label>
              <select
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Salary Components Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">Salary Components</label>
              <button
                type="button"
                onClick={handleAddComponent}
                className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Component</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {components.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => handleUpdateComponent(i, 'name', e.target.value)}
                    placeholder="Component name"
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                  <select
                    value={c.type}
                    onChange={(e) => handleUpdateComponent(i, 'type', e.target.value)}
                    className="w-28 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  >
                    <option value="Fixed %">Fixed %</option>
                    <option value="Fixed Amount">Fixed Amount</option>
                  </select>
                  <input
                    type="text"
                    value={c.value}
                    onChange={(e) => handleUpdateComponent(i, 'value', e.target.value)}
                    placeholder="Value (e.g. 40% or 3000)"
                    className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none text-right font-mono"
                  />
                  {components.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(i)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm shadow-blue-700/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Create Structure</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

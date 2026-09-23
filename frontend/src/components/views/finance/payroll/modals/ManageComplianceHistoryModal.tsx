import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { EmployeeTaxCompliance, ComplianceHistoryItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: EmployeeTaxCompliance;
  editingHistory?: ComplianceHistoryItem | null;
  onSave: (updatedRecord: EmployeeTaxCompliance) => void;
}

export const ManageComplianceHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  editingHistory,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ComplianceHistoryItem['type']>('general');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingHistory) {
        setTitle(editingHistory.title);
        setType(editingHistory.type);
        setDescription(editingHistory.description || '');
        setDate(editingHistory.date);
      } else {
        setTitle('');
        setType('general');
        setDescription('');
        setDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
      }
    }
  }, [isOpen, editingHistory]);

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const existingHistory: ComplianceHistoryItem[] = record.history ? [...record.history] : [
      {
        id: `${record.id}-hist-1`,
        title: `Tax Regime Selected: ${record.tds_regime || 'New Regime'}`,
        description: 'Opted on 01 Apr 2024 by employee',
        date: '01 Apr 2024',
        type: 'regime',
      },
      {
        id: `${record.id}-hist-2`,
        title: 'EPFO UAN Linked & Seeded',
        description: 'Verified with Aadhaar OTP on 15 Jan 2024',
        date: '15 Jan 2024',
        type: 'pf',
      },
      {
        id: `${record.id}-hist-3`,
        title: 'Form 24Q Q4 Return Filed',
        description: 'TDS deducted successfully remitted to Traces',
        date: '10 May 2024',
        type: 'return',
      },
    ];

    let updatedHistory: ComplianceHistoryItem[];
    if (editingHistory) {
      updatedHistory = existingHistory.map((h) =>
        h.id === editingHistory.id
          ? {
              ...h,
              title,
              type,
              description,
              date: date || h.date,
            }
          : h
      );
    } else {
      const newEntry: ComplianceHistoryItem = {
        id: `hist-${Date.now()}`,
        title,
        type,
        description,
        date: date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      updatedHistory = [newEntry, ...existingHistory];
    }

    const updatedRecord: EmployeeTaxCompliance = {
      ...record,
      history: updatedHistory,
      last_updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    onSave(updatedRecord);
    onClose();
  };

  const handleDelete = () => {
    if (!editingHistory || !record.history) return;
    const updatedHistory = record.history.filter((h) => h.id !== editingHistory.id);
    const updatedRecord: EmployeeTaxCompliance = {
      ...record,
      history: updatedHistory,
    };
    onSave(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {editingHistory ? 'Edit Compliance Event' : 'Add Compliance Event / Audit Note'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {record.employee_name} ({record.employee_id}) — {record.department}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 text-[11px]">Event / Note Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Form 16 Issued, TDS Exemption Verified, UAN Linked..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Event Type / Tag</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="regime">Tax Regime Update</option>
                <option value="pf">PF / EPFO Seeding</option>
                <option value="esi">ESI Registration / Update</option>
                <option value="return">Tax Return / Form 24Q</option>
                <option value="audit">Statutory Audit Check</option>
                <option value="general">General Compliance Note</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Event Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 01 May 2024"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 text-[11px]">Description / Audit Log Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context on changes made, approval reference, or verification details..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {editingHistory ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingHistory ? 'Save Changes' : 'Add Event'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

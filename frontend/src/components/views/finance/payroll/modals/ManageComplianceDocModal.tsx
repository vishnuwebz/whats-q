import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { EmployeeTaxCompliance, ComplianceDocumentItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: EmployeeTaxCompliance;
  editingDoc?: ComplianceDocumentItem | null;
  onSave: (updatedRecord: EmployeeTaxCompliance) => void;
}

export const ManageComplianceDocModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  editingDoc,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tax Certificate');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ComplianceDocumentItem['status']>('Verified');
  const [uploadedAt, setUploadedAt] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');

  useEffect(() => {
    if (isOpen) {
      if (editingDoc) {
        setName(editingDoc.name);
        setCategory(editingDoc.category || 'Tax Certificate');
        setDescription(editingDoc.description || '');
        setStatus(editingDoc.status);
        setUploadedAt(editingDoc.uploaded_at);
        setFileSize(editingDoc.file_size || '1.5 MB');
      } else {
        setName('');
        setCategory('Tax Certificate');
        setDescription('');
        setStatus('Verified');
        setUploadedAt(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
        setFileSize('1.8 MB');
      }
    }
  }, [isOpen, editingDoc]);

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const existingDocs: ComplianceDocumentItem[] = record.documents ? [...record.documents] : [
      {
        id: `${record.id}-doc-1`,
        name: 'Form 16 (FY 2023-24)',
        category: 'Tax Certificate',
        description: 'Part A & Part B digitally signed',
        status: 'Verified',
        uploaded_at: '01 May 2024',
        file_size: '2.4 MB',
      },
      {
        id: `${record.id}-doc-2`,
        name: 'PAN & Aadhaar Verification',
        category: 'KYC & Identity',
        description: 'e-KYC verified via NSDL',
        status: record.status === 'Compliant' ? 'Verified' : 'Pending',
        uploaded_at: '15 Jan 2024',
        file_size: '1.1 MB',
      },
      {
        id: `${record.id}-doc-3`,
        name: 'Form 12BB Declaration',
        category: 'Declaration',
        description: '80C, 80D, HRA proof submitted',
        status: record.status === 'Compliant' ? 'Verified' : 'Pending',
        uploaded_at: '10 Apr 2024',
        file_size: '3.8 MB',
      },
    ];

    let updatedDocs: ComplianceDocumentItem[];
    if (editingDoc) {
      updatedDocs = existingDocs.map((d) =>
        d.id === editingDoc.id
          ? {
              ...d,
              name,
              category,
              description,
              status,
              uploaded_at: uploadedAt || d.uploaded_at,
              file_size: fileSize || d.file_size,
            }
          : d
      );
    } else {
      const newDoc: ComplianceDocumentItem = {
        id: `doc-${Date.now()}`,
        name,
        category,
        description,
        status,
        uploaded_at: uploadedAt || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        file_size: fileSize,
      };
      updatedDocs = [newDoc, ...existingDocs];
    }

    const updatedRecord: EmployeeTaxCompliance = {
      ...record,
      documents: updatedDocs,
      last_updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    onSave(updatedRecord);
    onClose();
  };

  const handleDelete = () => {
    if (!editingDoc || !record.documents) return;
    const updatedDocs = record.documents.filter((d) => d.id !== editingDoc.id);
    const updatedRecord: EmployeeTaxCompliance = {
      ...record,
      documents: updatedDocs,
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {editingDoc ? 'Edit Compliance Document' : 'Upload / Add Compliance Document'}
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
            <label className="font-bold text-slate-700 text-[11px]">Document Name / Certificate Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Form 16 (FY 2024-25), HRA Rent Agreement..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Tax Certificate">Tax Certificate (Form 16/16A)</option>
                <option value="KYC & Identity">KYC & Identity (PAN / Aadhaar)</option>
                <option value="Declaration">Declaration (Form 12BB)</option>
                <option value="Exemption Proof">Exemption Proof (80C, 80D, HRA)</option>
                <option value="Other">Other Compliance Document</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Verification Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Verified">Verified (Compliant)</option>
                <option value="Pending">Pending Review</option>
                <option value="Rejected">Rejected / Incomplete</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 text-[11px]">Description / Verification Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Part A & Part B signed by finance officer; verified with PAN database..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 text-[11px]">Upload Date</label>
              <input
                type="text"
                value={uploadedAt}
                onChange={(e) => setUploadedAt(e.target.value)}
                placeholder="e.g. 01 May 2024"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 text-[11px]">File Size</label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="e.g. 2.4 MB"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {editingDoc ? (
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingDoc ? 'Save Changes' : 'Add Document'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

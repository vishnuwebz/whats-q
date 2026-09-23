import React, { useState, useEffect } from 'react';
import {
  Users, FileText, ShieldCheck, ArrowUpRight, Search, Filter,
  Download, MoreVertical, ChevronLeft, ChevronRight, X, Edit2,
  CheckCircle2, AlertCircle, Building2, HelpCircle, FileDown,
  Info, ExternalLink, Calendar, Check, Landmark, Shield, Eye, Printer,
  Plus, Wallet, Trash2, SlidersHorizontal
} from 'lucide-react';
import {
  EmployeeTaxCompliance,
  EmployeeSalaryBreakdown,
  ComplianceDocumentItem,
  ComplianceHistoryItem,
} from '@/types';
import { TaxUpdateModal } from './modals/TaxUpdateModal';
import { EditEmployeeSalaryModal } from './modals/EditEmployeeSalaryModal';
import { ManageComplianceDocModal } from './modals/ManageComplianceDocModal';
import { ManageComplianceHistoryModal } from './modals/ManageComplianceHistoryModal';
import { DraggableScrollRow } from '@/components/common/DraggableScrollRow';

interface Props {
  records: EmployeeTaxCompliance[];
  onUpdateRecord: (updated: EmployeeTaxCompliance) => void;
}

export const getSalaryBreakdown = (record: EmployeeTaxCompliance): EmployeeSalaryBreakdown => {
  if (record.salary_breakdown) return record.salary_breakdown;
  const gross = record.employee_id === 'EMP004' ? 45000 : 40000;
  const basic = Math.round(gross * 0.4);
  const hra = Math.round(gross * 0.2);
  const conveyance = 3000;
  const special = Math.max(0, gross - basic - hra - conveyance);
  return {
    gross_ctc: gross,
    basic,
    hra,
    conveyance,
    special_allowance: special,
    other_allowances: 0,
  };
};

export const getDocuments = (record: EmployeeTaxCompliance): ComplianceDocumentItem[] => {
  if (record.documents && record.documents.length > 0) return record.documents;
  return [
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
};

export const getHistory = (record: EmployeeTaxCompliance): ComplianceHistoryItem[] => {
  if (record.history && record.history.length > 0) return record.history;
  return [
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
};

export const TaxComplianceView: React.FC<Props> = ({ records, onUpdateRecord }) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'tds' | 'pf' | 'esi' | 'pt' | 'other'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Compliance Status');
  const [selectedRecord, setSelectedRecord] = useState<EmployeeTaxCompliance>(
    records.find((r) => r.employee_id === 'EMP004') || records[0]
  );

  // Sync selectedRecord when records list updates
  useEffect(() => {
    if (selectedRecord) {
      const fresh = records.find((r) => r.id === selectedRecord.id || r.employee_id === selectedRecord.employee_id);
      if (fresh) setSelectedRecord(fresh);
    }
  }, [records]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateModalSection, setUpdateModalSection] = useState<'all' | 'tds' | 'pf' | 'esi' | 'pt'>('all');
  const [rightTab, setRightTab] = useState<'tax' | 'salary' | 'docs' | 'history'>('tax');
  const [previewDoc, setPreviewDoc] = useState<{ type: 'form16' | 'form12bb'; record: EmployeeTaxCompliance } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New states for editing Salary, Documents, and History
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ComplianceDocumentItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<ComplianceHistoryItem | null>(null);

  const handleOpenUpdateModal = (
    section: 'all' | 'tds' | 'pf' | 'esi' | 'pt' = 'all',
    recordToEdit?: EmployeeTaxCompliance
  ) => {
    if (recordToEdit) {
      setSelectedRecord(recordToEdit);
    }
    setUpdateModalSection(section);
    setIsUpdateModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSalary = (updatedRecord: EmployeeTaxCompliance) => {
    setSelectedRecord(updatedRecord);
    onUpdateRecord(updatedRecord);
    showToast(`Salary structure updated for ${updatedRecord.employee_name}!`);
  };

  const handleSaveDoc = (updatedRecord: EmployeeTaxCompliance) => {
    setSelectedRecord(updatedRecord);
    onUpdateRecord(updatedRecord);
    showToast(`Compliance documents updated for ${updatedRecord.employee_name}!`);
  };

  const handleSaveHistory = (updatedRecord: EmployeeTaxCompliance) => {
    setSelectedRecord(updatedRecord);
    onUpdateRecord(updatedRecord);
    showToast(`Compliance history updated for ${updatedRecord.employee_name}!`);
  };

  const handleToggleDocStatus = (doc: ComplianceDocumentItem) => {
    const currentDocs = getDocuments(selectedRecord);
    const newStatus: ComplianceDocumentItem['status'] =
      doc.status === 'Verified' ? 'Pending' : 'Verified';
    const updatedDocs = currentDocs.map((d) => (d.id === doc.id ? { ...d, status: newStatus } : d));
    const updatedRecord: EmployeeTaxCompliance = {
      ...selectedRecord,
      documents: updatedDocs,
      last_updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setSelectedRecord(updatedRecord);
    onUpdateRecord(updatedRecord);
    showToast(`Document "${doc.name}" marked as ${newStatus}!`);
  };

  // Dynamic metrics from records
  const totalEmployees = records.length;
  const tdsCount = records.filter((r) => r.tds).length;
  const pfCount = records.filter((r) => r.pf).length;
  const esiCount = records.filter((r) => r.esi).length;

  const filteredRecords = records.filter((r) => {
    if (selectedDept !== 'All Departments' && r.department !== selectedDept) return false;
    if (selectedStatus !== 'All Compliance Status' && r.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        r.employee_name.toLowerCase().includes(q) ||
        r.employee_id.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExport = () => {
    const headers = ['#', 'Employee', 'Employee ID', 'Department', 'TDS', 'PF', 'ESI', 'PT', 'Status', 'UAN', 'ESI No', 'Monthly TDS'];
    const rows = filteredRecords.map((r, i) => [
      i + 1,
      `"${r.employee_name}"`,
      `"${r.employee_id}"`,
      `"${r.department}"`,
      r.tds ? 'Yes' : 'No',
      r.pf ? 'Yes' : 'No',
      r.esi ? 'Yes' : 'No',
      r.pt ? 'Yes' : 'No',
      r.status,
      `"${r.pf_number || ''}"`,
      `"${r.esi_number || ''}"`,
      r.monthly_tds || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `qiyam_tax_compliance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tax compliance statement exported to CSV!');
  };

  const triggerHtmlDownload = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateForm16Html = (record: EmployeeTaxCompliance) => {
    const grossSalary = 540000;
    const standardDeduction = 50000;
    const annualTds = (record.monthly_tds || 6500) * 12;
    const pan = record.employee_id === 'EMP004' ? 'ABEPS1234D' : `ABCDE${record.employee_id.replace(/\D/g, '') || '7890'}K`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Form 16 - Certificate under Section 203 of the Income-tax Act, 1961 - ${record.employee_name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; color: #0f172a; background: #f8fafc; }
    .doc-card { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 18px; font-weight: 900; margin: 0; text-transform: uppercase; }
    .subtitle { font-size: 12px; color: #475569; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 11px; }
    .meta-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
    .meta-label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    td { border: 1px solid #e2e8f0; padding: 8px 10px; }
    .text-right { text-align: right; }
    .bold { font-weight: 700; }
    .seal-box { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; padding-top: 24px; border-top: 1px solid #cbd5e1; font-size: 11px; }
    @media print { body { padding: 0; background: #fff; } .doc-card { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="doc-card">
    <div class="header">
      <div class="title">FORM NO. 16</div>
      <div class="subtitle">[See rule 31(1)(a)]</div>
      <div class="subtitle" style="font-weight: 600; margin-top: 6px;">Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary</div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">Employer Name & Address</div>
        <div class="bold">QIYAM BUSINESS SOLUTIONS LLP</div>
        <div>Mavoor Road, Kozhikode, Kerala — 673004</div>
        <div style="margin-top: 4px;">PAN: <strong>AABCP1234D</strong> • TAN: <strong>CALQ12345E</strong></div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Employee Details</div>
        <div class="bold">${record.employee_name}</div>
        <div>Department: ${record.department} • ID: ${record.employee_id}</div>
        <div style="margin-top: 4px;">PAN: <strong>${pan}</strong> • Status: Employed</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">Assessment Year</div>
        <div class="bold">2024-2025</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Period with Employer</div>
        <div class="bold">01-Apr-2023 to 31-Mar-2024</div>
      </div>
    </div>

    <div style="font-weight: 800; font-size: 12px; margin-top: 20px; text-transform: uppercase;">
      PART B: Details of Salary Paid and any other income and tax deducted
    </div>

    <table>
      <thead>
        <tr>
          <th>Particulars</th>
          <th class="text-right">Amount (₹)</th>
          <th class="text-right">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1. Gross Salary under section 17(1)</td>
          <td class="text-right">₹${grossSalary.toLocaleString()}</td>
          <td class="text-right">₹${grossSalary.toLocaleString()}</td>
        </tr>
        <tr>
          <td>2. Less: Standard Deduction under section 16(ia)</td>
          <td class="text-right">₹${standardDeduction.toLocaleString()}</td>
          <td class="text-right"></td>
        </tr>
        <tr>
          <td>3. Less: Professional Tax under section 16(iii)</td>
          <td class="text-right">₹2,400</td>
          <td class="text-right">₹52,400</td>
        </tr>
        <tr style="background: #f8fafc;" class="bold">
          <td>4. Income chargeable under the head 'Salaries' (1 - 2 - 3)</td>
          <td></td>
          <td class="text-right">₹${(grossSalary - 52400).toLocaleString()}</td>
        </tr>
        <tr>
          <td>5. Deductions under Chapter VI-A (80C, 80D, 80CCD)</td>
          <td class="text-right">₹1,50,000</td>
          <td class="text-right">₹1,50,000</td>
        </tr>
        <tr style="background: #ecfdf5;" class="bold">
          <td>6. Total Taxable Income</td>
          <td></td>
          <td class="text-right" style="color: #065f46;">₹${(grossSalary - 52400 - 150000).toLocaleString()}</td>
        </tr>
        <tr class="bold">
          <td>7. Total Tax Deducted at Source (TDS) and deposited</td>
          <td></td>
          <td class="text-right">₹${annualTds.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11px; margin-top: 16px;">
      <strong>Verification Statement:</strong> I, Finance Controller, on behalf of Qiyam Business Solutions LLP, certify that a sum of ₹${annualTds.toLocaleString()} has been deducted and credited to the Central Government Account through Challan Ref CALQ/2024/Q4.
    </div>

    <div class="seal-box">
      <div>
        <div class="bold">Place: Kozhikode</div>
        <div>Date: 15-May-2024</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Digitally signed using ITD USB Token</div>
      </div>
      <div style="text-align: right;">
        <div style="border: 2px dashed #059669; padding: 8px 16px; border-radius: 8px; color: #059669; font-weight: 800; font-size: 11px; text-align: center; display: inline-block;">
          ✓ DIGITALLY SIGNED<br>
          <span style="font-size: 9px; font-weight: normal;">QIYAM BUSINESS SOLUTIONS</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const generateForm12BBHtml = (record: EmployeeTaxCompliance) => {
    const pan = record.employee_id === 'EMP004' ? 'ABEPS1234D' : `ABCDE${record.employee_id.replace(/\D/g, '') || '7890'}K`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Form 12BB Declaration - ${record.employee_name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; color: #0f172a; background: #f8fafc; }
    .doc-card { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 18px; font-weight: 900; margin: 0; text-transform: uppercase; }
    .subtitle { font-size: 12px; color: #475569; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 11px; }
    .meta-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
    .meta-label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    td { border: 1px solid #e2e8f0; padding: 8px 10px; }
    .text-right { text-align: right; }
    .bold { font-weight: 700; }
    @media print { body { padding: 0; background: #fff; } .doc-card { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="doc-card">
    <div class="header">
      <div class="title">FORM NO. 12BB</div>
      <div class="subtitle">(See rule 26C)</div>
      <div class="subtitle" style="font-weight: 600; margin-top: 6px;">Statement of claims by an employee for deduction of tax under section 192</div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">Employee Information</div>
        <div class="bold">${record.employee_name}</div>
        <div>Employee ID: ${record.employee_id} • Dept: ${record.department}</div>
        <div style="margin-top: 4px;">Permanent Account Number (PAN): <strong>${pan}</strong></div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Employer & Financial Year</div>
        <div class="bold">QIYAM BUSINESS SOLUTIONS LLP</div>
        <div>Financial Year: <strong>2023-2024</strong></div>
        <div style="margin-top: 4px;">Assessment Year: <strong>2024-2025</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Sl.</th>
          <th>Nature of Claim / Section</th>
          <th>Particulars / Landlord / Policy</th>
          <th class="text-right">Claim Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td class="bold">House Rent Allowance (HRA) [Sec 10(13A)]</td>
          <td>Rent paid: ₹15,000/mo (Landlord PAN: BKMPL5582K)</td>
          <td class="text-right font-mono">₹1,80,000</td>
        </tr>
        <tr>
          <td>2</td>
          <td class="bold">Leave Travel Concession (LTC) [Sec 10(5)]</td>
          <td>Approved domestic travel ticket receipts</td>
          <td class="text-right font-mono">₹25,000</td>
        </tr>
        <tr>
          <td>3</td>
          <td class="bold">Deduction under Section 80C</td>
          <td>EPF Contribution + ELSS Mutual Funds + LIC Premium</td>
          <td class="text-right font-mono">₹1,50,000</td>
        </tr>
        <tr>
          <td>4</td>
          <td class="bold">Deduction under Section 80D</td>
          <td>Mediclaim Insurance (Self, Spouse, Children & Parents)</td>
          <td class="text-right font-mono">₹25,000</td>
        </tr>
        <tr>
          <td>5</td>
          <td class="bold">Deduction under Section 80CCD(1B)</td>
          <td>National Pension System (NPS) voluntary contribution</td>
          <td class="text-right font-mono">₹50,000</td>
        </tr>
        <tr style="background: #ecfdf5;" class="bold">
          <td colspan="3" class="text-right">Total Deductions Claimed:</td>
          <td class="text-right font-mono text-emerald-800">₹4,30,000</td>
        </tr>
      </tbody>
    </table>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11px; margin-top: 16px;">
      <strong>Declaration:</strong> I, ${record.employee_name}, do hereby declare that the particulars given above are complete, true, and correct according to the best of my knowledge and belief. I have submitted supporting documentary proofs to the payroll department.
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; padding-top: 24px; border-top: 1px solid #cbd5e1; font-size: 11px;">
      <div>
        <div class="bold">Date: 12-Apr-2024</div>
        <div>Place: Kozhikode</div>
      </div>
      <div style="text-align: right;">
        <div class="bold">${record.employee_name}</div>
        <div style="color: #64748b;">Signature of Employee (e-Signed)</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handleDownloadForm16 = (record: EmployeeTaxCompliance) => {
    const html = generateForm16Html(record);
    triggerHtmlDownload(html, `Form16_FY2023_24_${record.employee_id}.html`);
    showToast(`Form 16 downloaded for ${record.employee_name}!`);
  };

  const handleDownloadForm12BB = (record: EmployeeTaxCompliance) => {
    const html = generateForm12BBHtml(record);
    triggerHtmlDownload(html, `Form12BB_Declaration_${record.employee_id}.html`);
    showToast(`Form 12BB downloaded for ${record.employee_name}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-Tabs (Screenshot 6) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none py-1">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'employees'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab('tds')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'tds'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
          }`}
        >
          <span>TDS Rules</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'tds' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {tdsCount} Enrolled
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pf')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'pf'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
          }`}
        >
          <span>EPFO (PF)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'pf' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {pfCount} Enrolled
          </span>
        </button>
        <button
          onClick={() => setActiveTab('esi')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'esi'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
          }`}
        >
          <span>ESIC (ESI)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'esi' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {esiCount} Enrolled
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pt')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pt'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
          }`}
        >
          Professional Tax
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'other'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
          }`}
        >
          Other Compliance
        </button>
      </div>

      {/* 4 Dynamic Metric Cards (Screenshot 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Employees</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalEmployees}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active workforce</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees with TDS</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{tdsCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            {totalEmployees > 0 ? Math.round((tdsCount / totalEmployees) * 100) : 0}% of total staff
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees with PF</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{pfCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {totalEmployees > 0 ? Math.round((pfCount / totalEmployees) * 100) : 0}% coverage (EPFO registered)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees with ESI</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{esiCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Eligible below ₹21,000 threshold
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPLOYEES COMPLIANCE REGISTER (Matching Screenshot 6)              */}
      {/* ========================================================================= */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 8 cols: Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID or department..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-full focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option>All Departments</option>
                <option>Operations</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>Technology</option>
                <option>HR</option>
                <option>Finance</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option>All Compliance Status</option>
                <option>Compliant</option>
                <option>Pending</option>
              </select>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input type="checkbox" className="rounded text-emerald-600 accent-emerald-600" />
                    </th>
                    <th className="py-3 px-2 w-8">#</th>
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Employee ID</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-2 text-center">TDS</th>
                    <th className="py-3 px-2 text-center">PF</th>
                    <th className="py-3 px-2 text-center">ESI</th>
                    <th className="py-3 px-2 text-center">PT</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.map((r, idx) => {
                    const isSelected = selectedRecord?.id === r.id;
                    const initials = r.employee_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2);

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRecord(r)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedRecord(r)}
                            className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900">{r.employee_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-600">{r.employee_id}</td>
                        <td className="py-3 px-3 font-medium text-slate-700">{r.department}</td>
                        <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenUpdateModal('tds', r)}
                            title={`Click to edit TDS parameters for ${r.employee_name}`}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all hover:scale-105 ${
                              r.tds ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            {r.tds ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenUpdateModal('pf', r)}
                            title={`Click to edit PF parameters for ${r.employee_name}`}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all hover:scale-105 ${
                              r.pf ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            {r.pf ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenUpdateModal('esi', r)}
                            title={`Click to edit ESI parameters for ${r.employee_name}`}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all hover:scale-105 ${
                              r.esi ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            {r.esi ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenUpdateModal('pt', r)}
                            title={`Click to edit PT parameters for ${r.employee_name}`}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all hover:scale-105 ${
                              r.pt ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            {r.pt ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUpdateModal('all', r);
                            }}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer hover:shadow-2xs transition-colors ${
                              r.status === 'Compliant'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                            title="Click to edit compliance status"
                          >
                            {r.status}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUpdateModal('all', r);
                            }}
                            title={`Update statutory compliance parameters for ${r.employee_name}`}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 1 to {filteredRecords.length} of {records.length} employees</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                Click any row to inspect compliance records
              </span>
            </div>
          </div>

          {/* Right 4 cols: Employee Inspector Panel (Screenshot 6) */}
          {selectedRecord && (
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 text-xs">
              {/* Employee Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                    {selectedRecord.employee_name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900">{selectedRecord.employee_name}</h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {selectedRecord.employee_id} • {selectedRecord.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-tabs inside Inspector */}
              <div className="border-b border-slate-100 pb-1">
                <DraggableScrollRow showArrows={false} fadeEdges={false} className="w-full">
                  <button
                    type="button"
                    onClick={() => setRightTab('tax')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors text-xs shrink-0 ${
                      rightTab === 'tax' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Tax & Statutory
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightTab('salary')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors text-xs shrink-0 ${
                      rightTab === 'salary' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Salary Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightTab('docs')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors text-xs shrink-0 ${
                      rightTab === 'docs' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Documents
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightTab('history')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors text-xs shrink-0 ${
                      rightTab === 'history' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    History
                  </button>
                </DraggableScrollRow>
              </div>

              {/* TAB CONTENT: Tax & Statutory */}
              {rightTab === 'tax' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {/* TDS Card */}
                    <div
                      onClick={() => handleOpenUpdateModal('tds')}
                      title="Click to edit TDS compliance parameters"
                      className="p-3 bg-slate-50 hover:bg-blue-50/70 rounded-xl border border-slate-200 hover:border-blue-300 space-y-1 cursor-pointer transition-all hover:shadow-xs group"
                    >
                      <div className="flex items-center justify-between text-blue-600 font-bold">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>TDS</span>
                        </div>
                        <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {selectedRecord.tds ? 'Applicable' : 'Not Applicable'}
                      </div>
                      <div className="font-bold text-slate-900 font-mono">
                        {selectedRecord.tds ? `₹${(selectedRecord.monthly_tds || 5166).toLocaleString()} / mo` : '₹0'}
                      </div>
                    </div>

                    {/* PF Card */}
                    <div
                      onClick={() => handleOpenUpdateModal('pf')}
                      title="Click to edit PF / EPFO compliance parameters"
                      className="p-3 bg-slate-50 hover:bg-emerald-50/70 rounded-xl border border-slate-200 hover:border-emerald-300 space-y-1 cursor-pointer transition-all hover:shadow-xs group"
                    >
                      <div className="flex items-center justify-between text-emerald-600 font-bold">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>PF</span>
                        </div>
                        <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {selectedRecord.pf ? 'Applicable' : 'Not Applicable'}
                      </div>
                      <div className="font-bold text-slate-900 font-mono text-[10px]">
                        {selectedRecord.pf_rate || '12% Employee + 12% Employer'}
                      </div>
                    </div>

                    {/* ESI Card */}
                    <div
                      onClick={() => handleOpenUpdateModal('esi')}
                      title="Click to edit ESIC compliance parameters"
                      className="p-3 bg-slate-50 hover:bg-amber-50/70 rounded-xl border border-slate-200 hover:border-amber-300 space-y-1 cursor-pointer transition-all hover:shadow-xs group"
                    >
                      <div className="flex items-center justify-between text-amber-600 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>ESI</span>
                        </div>
                        <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-amber-600 transition-colors" />
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {selectedRecord.esi ? 'Applicable' : 'Not Applicable'}
                      </div>
                      <div className="font-bold text-slate-900 font-mono text-[10px]">
                        {selectedRecord.esi_status || (selectedRecord.esi ? '0.75% + 3.25%' : 'Exempt (> ₹21k)')}
                      </div>
                    </div>

                    {/* PT Card */}
                    <div
                      onClick={() => handleOpenUpdateModal('pt')}
                      title="Click to edit Professional Tax parameters"
                      className="p-3 bg-slate-50 hover:bg-purple-50/70 rounded-xl border border-slate-200 hover:border-purple-300 space-y-1 cursor-pointer transition-all hover:shadow-xs group"
                    >
                      <div className="flex items-center justify-between text-purple-600 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5" />
                          <span>Professional Tax</span>
                        </div>
                        <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {selectedRecord.pt ? 'Applicable' : 'Not Applicable'}
                      </div>
                      <div className="font-bold text-slate-900 font-mono">
                        ₹{(selectedRecord.pt_monthly || 200).toLocaleString()} / month
                      </div>
                    </div>
                  </div>

                  {/* Compliance Details List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center justify-between font-bold text-slate-800 uppercase tracking-wider">
                      <span>Compliance Details</span>
                      <span className="text-[10px] text-emerald-600 normal-case font-medium">Click row to edit</span>
                    </div>
                    <div className="space-y-1.5">
                      <div
                        onClick={() => handleOpenUpdateModal('tds')}
                        className="flex justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                        title="Click to edit TDS Regime"
                      >
                        <span className="text-slate-500 group-hover:text-blue-600 flex items-center gap-1">
                          <span>TDS Regime</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                        </span>
                        <span className="font-semibold text-slate-900">{selectedRecord.tds_regime || 'New Regime'}</span>
                      </div>
                      <div
                        onClick={() => handleOpenUpdateModal('tds')}
                        className="flex justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                        title="Click to edit Estimated Annual Tax"
                      >
                        <span className="text-slate-500 group-hover:text-blue-600 flex items-center gap-1">
                          <span>Estimated Annual Tax</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{(selectedRecord.estimated_annual_tax || 62000).toLocaleString()}
                        </span>
                      </div>
                      <div
                        onClick={() => handleOpenUpdateModal('pf')}
                        className="flex justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                        title="Click to edit PF Number / UAN"
                      >
                        <span className="text-slate-500 group-hover:text-emerald-600 flex items-center gap-1">
                          <span>PF Number (UAN)</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
                        </span>
                        <span className="font-mono font-medium text-slate-900">
                          {selectedRecord.pf_number || '1002 3456 7891'}
                        </span>
                      </div>
                      <div
                        onClick={() => handleOpenUpdateModal('esi')}
                        className="flex justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                        title="Click to edit ESI Insurance Number"
                      >
                        <span className="text-slate-500 group-hover:text-amber-600 flex items-center gap-1">
                          <span>ESI Insurance Number</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity" />
                        </span>
                        <span className="font-mono font-medium text-slate-900">
                          {selectedRecord.esi_number || '4400 1234 5678'}
                        </span>
                      </div>
                      <div
                        onClick={() => handleOpenUpdateModal('pt')}
                        className="flex justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                        title="Click to edit PT Registration"
                      >
                        <span className="text-slate-500 group-hover:text-purple-600 flex items-center gap-1">
                          <span>PT Registration</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-purple-500 transition-opacity" />
                        </span>
                        <span className="font-mono font-medium text-slate-900">
                          {selectedRecord.pt_number || 'KL/PT/1234501'}
                        </span>
                      </div>
                      <div
                        onClick={() => handleOpenUpdateModal('all')}
                        className="flex justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                        title="Click to update verification date"
                      >
                        <span className="text-slate-500 group-hover:text-emerald-600 flex items-center gap-1">
                          <span>Last Verified</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
                        </span>
                        <span className="font-medium text-slate-900">{selectedRecord.last_updated || '01 May 2024'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Salary Info */}
              {rightTab === 'salary' && (() => {
                const sal = getSalaryBreakdown(selectedRecord);
                const monthlyTds = selectedRecord.tds ? (selectedRecord.monthly_tds || 0) : 0;
                const monthlyPf = selectedRecord.pf ? Math.round(sal.basic * 0.12) : 0;
                const monthlyEsi = selectedRecord.esi ? Math.round(sal.gross_ctc * 0.0075) : 0;
                const monthlyPt = selectedRecord.pt ? (selectedRecord.pt_monthly || 200) : 0;
                const totalStatutoryDeductions = monthlyTds + monthlyPf + monthlyEsi + monthlyPt;
                const netMonthlyTakeHome = sal.gross_ctc - totalStatutoryDeductions;

                return (
                  <div className="space-y-2.5 text-[11px]">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Monthly CTC Breakdown
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSalaryModalOpen(true)}
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors border border-emerald-200"
                        title="Edit Salary Structure"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Edit Values</span>
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Monthly Gross CTC:</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ₹{sal.gross_ctc.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">
                          Basic Salary ({Math.round((sal.basic / sal.gross_ctc) * 100)}%):
                        </span>
                        <span className="font-mono text-slate-700">₹{sal.basic.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">
                          HRA ({Math.round((sal.hra / sal.gross_ctc) * 100)}%):
                        </span>
                        <span className="font-mono text-slate-700">₹{sal.hra.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Conveyance Allowance:</span>
                        <span className="font-mono text-slate-700">₹{sal.conveyance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Special Allowance:</span>
                        <span className="font-mono text-slate-700">₹{sal.special_allowance.toLocaleString()}</span>
                      </div>
                      {Boolean(sal.other_allowances && sal.other_allowances > 0) && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Other Allowances:</span>
                          <span className="font-mono text-slate-700">₹{sal.other_allowances.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Total Statutory Deductions:</span>
                        <span className="font-mono text-rose-600">-₹{totalStatutoryDeductions.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                        <span>(TDS: ₹{monthlyTds.toLocaleString()} • PF: ₹{monthlyPf.toLocaleString()} • ESI: ₹{monthlyEsi.toLocaleString()} • PT: ₹{monthlyPt.toLocaleString()})</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-900 pt-1 border-t border-emerald-200">
                        <span>Net Monthly Take-home:</span>
                        <span className="font-mono text-emerald-700 text-xs">₹{netMonthlyTakeHome.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB CONTENT: Documents */}
              {rightTab === 'docs' && (() => {
                const docs = getDocuments(selectedRecord);
                return (
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Compliance Documents ({docs.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDoc(null);
                          setIsDocModalOpen(true);
                        }}
                        className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                        title="Upload or Add Document"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Add Document</span>
                      </button>
                    </div>

                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{doc.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {doc.description || doc.category} • {doc.uploaded_at}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Interactive Status Pill */}
                          <button
                            type="button"
                            onClick={() => handleToggleDocStatus(doc)}
                            title="Click to toggle Verified / Pending status"
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                              doc.status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : doc.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {doc.status}
                          </button>

                          {/* Preview if Form 16 or 12BB */}
                          {(doc.name.includes('Form 16') || doc.name.includes('12BB')) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (doc.name.includes('Form 16')) {
                                  setPreviewDoc({ type: 'form16', record: selectedRecord });
                                } else {
                                  setPreviewDoc({ type: 'form12bb', record: selectedRecord });
                                }
                              }}
                              title="Preview Document"
                              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDoc(doc);
                              setIsDocModalOpen(true);
                            }}
                            title="Edit Document Parameters"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* TAB CONTENT: History */}
              {rightTab === 'history' && (() => {
                const historyItems = getHistory(selectedRecord);
                return (
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Compliance Audit Trail ({historyItems.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHistory(null);
                          setIsHistoryModalOpen(true);
                        }}
                        className="text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 px-2 py-0.5 rounded-md hover:bg-purple-100 transition-colors border border-purple-200"
                        title="Add Compliance Event"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Add Event</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {historyItems.map((h) => {
                        const dotColor =
                          h.type === 'regime'
                            ? 'bg-emerald-500'
                            : h.type === 'pf'
                            ? 'bg-blue-500'
                            : h.type === 'return'
                            ? 'bg-amber-500'
                            : h.type === 'audit'
                            ? 'bg-purple-500'
                            : 'bg-slate-400';

                        return (
                          <div
                            key={h.id}
                            className="p-2 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 flex items-start justify-between group transition-colors"
                          >
                            <div className="flex items-start gap-2 min-w-0 pr-2">
                              <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900">{h.title}</div>
                                <div className="text-[10px] text-slate-500">{h.description}</div>
                                <div className="text-[9px] text-slate-400 font-mono mt-0.5">{h.date}</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingHistory(h);
                                setIsHistoryModalOpen(true);
                              }}
                              title="Edit Audit Event"
                              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-slate-200 rounded cursor-pointer transition-colors opacity-70 group-hover:opacity-100 shrink-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {rightTab === 'tax' && (
                  <button
                    type="button"
                    onClick={() => handleOpenUpdateModal('all')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Update Compliance Parameters</span>
                  </button>
                )}

                {rightTab === 'salary' && (
                  <button
                    type="button"
                    onClick={() => setIsSalaryModalOpen(true)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Salary Structure & CTC</span>
                  </button>
                )}

                {rightTab === 'docs' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDoc(null);
                      setIsDocModalOpen(true);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload / Add Compliance Document</span>
                  </button>
                )}

                {rightTab === 'history' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHistory(null);
                      setIsHistoryModalOpen(true);
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-center cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Compliance Event / Note</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TDS SLAB & REGIME GUIDE                                            */}
      {/* ========================================================================= */}
      {activeTab === 'tds' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* New Tax Regime 115BAC Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">New Tax Regime (u/s 115BAC)</h3>
                  <p className="text-[11px] text-slate-500">Default regime with lower tax rates & standard deduction of ₹75,000</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  Recommended Default
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Up to ₹3,00,000</span>
                  <span className="font-mono font-bold text-emerald-600">Nil (0%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">₹3,00,001 to ₹7,00,000</span>
                  <span className="font-mono font-bold text-slate-800">5% (Full rebate u/s 87A)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">₹7,00,001 to ₹10,00,000</span>
                  <span className="font-mono font-bold text-slate-800">10%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">₹10,00,001 to ₹12,00,000</span>
                  <span className="font-mono font-bold text-slate-800">15%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">₹12,00,001 to ₹15,00,000</span>
                  <span className="font-mono font-bold text-slate-800">20%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Above ₹15,00,000</span>
                  <span className="font-mono font-bold text-slate-800">30%</span>
                </div>
              </div>
            </div>

            {/* Old Tax Regime Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Old Tax Regime (With Deductions)</h3>
                  <p className="text-[11px] text-slate-500">Allows Section 80C (₹1.5L), 80D (Health Insurance), and HRA exemption</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  Optional
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Up to ₹2,50,000</span>
                  <span className="font-mono font-bold text-emerald-600">Nil (0%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">₹2,50,001 to ₹5,00,000</span>
                  <span className="font-mono font-bold text-slate-800">5%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">₹5,00,001 to ₹10,00,000</span>
                  <span className="font-mono font-bold text-slate-800">20%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Above ₹10,00,000</span>
                  <span className="font-mono font-bold text-slate-800">30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EPFO PF REGULATIONS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'pf' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Employees' Provident Fund (EPFO) Regulations</h3>
              <p className="text-[11px] text-slate-500">Statutory breakdown of Employee and Employer contributions.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              EPF Wage Ceiling: ₹15,000/month
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Employee Contribution (12%)</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                12% of (Basic + DA) is deducted directly from the employee's gross monthly pay and remitted to their EPF account.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Employer Contribution (12%)</h4>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>EPF (Provident Fund):</span>
                  <span className="font-mono font-bold">3.67%</span>
                </div>
                <div className="flex justify-between">
                  <span>EPS (Pension Scheme - capped at ₹1,250):</span>
                  <span className="font-mono font-bold">8.33%</span>
                </div>
                <div className="flex justify-between">
                  <span>EDLI (Insurance):</span>
                  <span className="font-mono font-bold">0.50%</span>
                </div>
                <div className="flex justify-between">
                  <span>EPF Administrative Charges:</span>
                  <span className="font-mono font-bold">0.50%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ESIC GUIDELINES                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'esi' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Employees' State Insurance (ESIC)</h3>
              <p className="text-[11px] text-slate-500">Comprehensive social security & medical healthcare scheme.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              Wage Threshold: ₹21,000/month
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Employee Contribution: 0.75%</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Deducted from gross salary for employees earning up to ₹21,000 per month.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Employer Contribution: 3.25%</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Remitted monthly by Qiyam Business Solutions to the ESIC portal by the 15th of each month.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PROFESSIONAL TAX SLABS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'pt' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">State-wise Professional Tax Slabs</h3>
            <p className="text-[11px] text-slate-500">Applicable municipal tax deducted based on workplace jurisdiction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Kerala (Half-Yearly)</div>
              <p className="text-[11px] text-slate-600">
                ₹1,250 semi-annually (average ₹208/month) for salaries exceeding ₹12,000/month.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Karnataka (Monthly)</div>
              <p className="text-[11px] text-slate-600">
                ₹200 per month for gross salaries above ₹15,000 per month.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Maharashtra (Monthly)</div>
              <p className="text-[11px] text-slate-600">
                ₹200 per month (₹300 in the month of February) above ₹10,000 threshold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: OTHER COMPLIANCE                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'other' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Additional Statutory Compliances</h3>
            <p className="text-[11px] text-slate-500">Labour laws, gratuity calculations, and statutory bonus mandates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Payment of Gratuity Act, 1972</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Payable after 5 continuous years of service at 15 days' last drawn basic salary for every completed year of service.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Labour Welfare Fund (LWF)</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Nominal half-yearly / annual employee & employer contribution to the state labour welfare board.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tax Update Modal */}
      <TaxUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        record={selectedRecord}
        initialSection={updateModalSection}
        onSave={(updated) => {
          setSelectedRecord(updated);
          onUpdateRecord(updated);
          showToast(`Successfully updated statutory compliance parameters for ${updated.employee_name}!`);
        }}
      />

      {/* Edit Salary Modal */}
      {isSalaryModalOpen && selectedRecord && (
        <EditEmployeeSalaryModal
          isOpen={isSalaryModalOpen}
          onClose={() => setIsSalaryModalOpen(false)}
          record={selectedRecord}
          onSave={handleSaveSalary}
        />
      )}

      {/* Manage Compliance Document Modal */}
      {isDocModalOpen && selectedRecord && (
        <ManageComplianceDocModal
          isOpen={isDocModalOpen}
          onClose={() => {
            setIsDocModalOpen(false);
            setEditingDoc(null);
          }}
          record={selectedRecord}
          editingDoc={editingDoc}
          onSave={handleSaveDoc}
        />
      )}

      {/* Manage Compliance History Modal */}
      {isHistoryModalOpen && selectedRecord && (
        <ManageComplianceHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setEditingHistory(null);
          }}
          record={selectedRecord}
          editingHistory={editingHistory}
          onSave={handleSaveHistory}
        />
      )}

      {/* ========================================================================= */}
      {/* STATUTORY DOCUMENT PREVIEW MODAL (FORM 16 / FORM 12BB)                   */}
      {/* ========================================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {previewDoc.type === 'form16' ? 'Form 16 Certificate Preview (FY 2023-24)' : 'Form 12BB Declaration Preview'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {previewDoc.record.employee_name} ({previewDoc.record.employee_id}) • {previewDoc.record.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (previewDoc.type === 'form16') {
                      handleDownloadForm16(previewDoc.record);
                    } else {
                      handleDownloadForm12BB(previewDoc.record);
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Download Document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs bg-slate-50/40">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 font-sans">
                {previewDoc.type === 'form16' ? (
                  <>
                    <div className="text-center border-b border-slate-900 pb-3">
                      <h2 className="text-base font-black text-slate-900 tracking-wider">FORM NO. 16</h2>
                      <p className="text-[10px] text-slate-500">[See rule 31(1)(a)]</p>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1">
                        Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employer</span>
                        <div className="font-bold text-slate-900">QIYAM BUSINESS SOLUTIONS LLP</div>
                        <div className="text-[11px] text-slate-500">Mavoor Road, Kozhikode, Kerala — 673004</div>
                        <div className="text-[11px] text-slate-700 font-mono">
                          PAN: <strong>AABCP1234D</strong> • TAN: <strong>CALQ12345E</strong>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employee</span>
                        <div className="font-bold text-slate-900">{previewDoc.record.employee_name}</div>
                        <div className="text-[11px] text-slate-500">
                          {previewDoc.record.department} • {previewDoc.record.employee_id}
                        </div>
                        <div className="text-[11px] text-slate-700 font-mono">
                          PAN: <strong>{previewDoc.record.employee_id === 'EMP004' ? 'ABEPS1234D' : 'BNMPK9876E'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] block">Assessment Year</span>
                        <span className="font-bold text-slate-900">2024-2025</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] block">Period Covered</span>
                        <span className="font-bold text-slate-900">01-Apr-2023 to 31-Mar-2024</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Particulars (Summary of Salary & Tax)</th>
                            <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2 px-3 text-slate-700">1. Gross Salary under section 17(1)</td>
                            <td className="py-2 px-3 text-right font-mono font-medium">₹5,40,000</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-slate-700">2. Standard Deduction under section 16(ia)</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">-₹50,000</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-slate-700">3. Professional Tax under section 16(iii)</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">-₹2,400</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 text-slate-700">4. Deductions under Chapter VI-A (80C/80D)</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">-₹1,50,000</td>
                          </tr>
                          <tr className="bg-emerald-50/80 font-bold text-emerald-950">
                            <td className="py-2.5 px-3">5. Total Taxable Income</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">₹3,37,600</td>
                          </tr>
                          <tr className="bg-slate-50 font-bold text-slate-900">
                            <td className="py-2.5 px-3">6. Total Tax Deducted & Deposited (FY 2023-24)</td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                              ₹{((previewDoc.record.monthly_tds || 6500) * 12).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[11px]">
                      <div>
                        <div className="font-bold text-slate-800">Qiyam Payroll Finance Division</div>
                        <div className="text-slate-400">Challan Ref: CALQ/2024/Q4-NSDL-VERIFIED</div>
                      </div>
                      <div className="border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-lg text-center text-[10px]">
                        ✓ DIGITALLY SIGNED CERTIFICATE
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center border-b border-slate-900 pb-3">
                      <h2 className="text-base font-black text-slate-900 tracking-wider">FORM NO. 12BB</h2>
                      <p className="text-[10px] text-slate-500">(See rule 26C)</p>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1">
                        Statement of claims by an employee for deduction of tax under section 192
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employee Details</span>
                        <div className="font-bold text-slate-900">{previewDoc.record.employee_name}</div>
                        <div className="text-[11px] text-slate-500">ID: {previewDoc.record.employee_id} • {previewDoc.record.department}</div>
                        <div className="text-[11px] text-slate-700 font-mono">
                          PAN: <strong>{previewDoc.record.employee_id === 'EMP004' ? 'ABEPS1234D' : 'BNMPK9876E'}</strong>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employer & Fiscal Period</span>
                        <div className="font-bold text-slate-900">QIYAM BUSINESS SOLUTIONS LLP</div>
                        <div className="text-[11px] text-slate-500">FY: 2023-2024 • AY: 2024-2025</div>
                        <div className="text-[11px] text-slate-700 font-semibold">Regime: {previewDoc.record.tds_regime || 'New Regime'}</div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Nature of Claim / Section</th>
                            <th className="py-2.5 px-3">Particulars & Proofs Submitted</th>
                            <th className="py-2.5 px-3 text-right">Claim (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">House Rent Allowance (HRA) [Sec 10(13A)]</td>
                            <td className="py-2 px-3 text-slate-600">Rent receipts attached (Landlord PAN: BKMPL5582K)</td>
                            <td className="py-2 px-3 text-right font-mono font-medium">₹1,80,000</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">Leave Travel Concession [Sec 10(5)]</td>
                            <td className="py-2 px-3 text-slate-600">Approved domestic flight tickets & boarding pass</td>
                            <td className="py-2 px-3 text-right font-mono font-medium">₹25,000</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">Section 80C Deductions</td>
                            <td className="py-2 px-3 text-slate-600">EPF contribution, ELSS statement, Term LIC receipt</td>
                            <td className="py-2 px-3 text-right font-mono font-medium">₹1,50,000</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">Section 80D Health Insurance</td>
                            <td className="py-2 px-3 text-slate-600">Comprehensive Family Floater policy premium receipt</td>
                            <td className="py-2 px-3 text-right font-mono font-medium">₹25,000</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">Section 80CCD(1B) Tier 1 NPS</td>
                            <td className="py-2 px-3 text-slate-600">PRAN voluntary contribution statement</td>
                            <td className="py-2 px-3 text-right font-mono font-medium">₹50,000</td>
                          </tr>
                          <tr className="bg-emerald-50/80 font-bold text-emerald-950">
                            <td colSpan={2} className="py-2.5 px-3 text-right uppercase tracking-wider text-[11px]">
                              Total Statutory Exemptions Claimed:
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">₹4,30,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[11px]">
                      <div>
                        <div className="font-bold text-slate-800">Submitted by: {previewDoc.record.employee_name}</div>
                        <div className="text-slate-400">e-Signature Timestamp: 12 Apr 2024, 11:42 IST</div>
                      </div>
                      <div className="border border-purple-300 bg-purple-50 text-purple-800 font-bold px-3 py-1.5 rounded-lg text-center text-[10px]">
                        ✓ DECLARATION LOCKED & VERIFIED
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  if (previewDoc.type === 'form16') {
                    handleDownloadForm16(previewDoc.record);
                  } else {
                    handleDownloadForm12BB(previewDoc.record);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>
                  {previewDoc.type === 'form16' ? 'Download Form 16 (HTML)' : 'Download Form 12BB (HTML)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

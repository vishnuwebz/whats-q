import React, { useState } from 'react';
import {
  Layers, Users, IndianRupee, ArrowUpRight, Plus, Search, Filter,
  Edit2, Download, ChevronLeft, ChevronRight, FileText,
  Clock, CheckCircle2, ArrowRight, ShieldCheck, ToggleLeft, ToggleRight,
  TrendingUp, RefreshCw, X, Eye, FileDown, Check, Percent, Sparkles, Building2
} from 'lucide-react';
import { SalaryStructure, EmployeeSalaryAssignment, SalaryComponentItem } from '@/types';
import { NewSalaryStructureModal } from './modals/NewSalaryStructureModal';

interface Props {
  structures: SalaryStructure[];
  assignments: EmployeeSalaryAssignment[];
  onAddStructure: (struct: SalaryStructure) => void;
  onUpdateStructure: (struct: SalaryStructure) => void;
  onUpdateAssignments?: (assignments: EmployeeSalaryAssignment[]) => void;
}

interface ComponentMasterItem {
  id: string;
  name: string;
  type: 'Earning' | 'Deduction';
  calcType: 'Fixed %' | 'Fixed Amount' | 'Statutory';
  value: string | number;
  taxable: boolean;
  active: boolean;
  description: string;
}

interface RevisionHistoryItem {
  id: string | number;
  employee_id: string;
  employee_name: string;
  department: string;
  previous_ctc: number;
  new_ctc: number;
  increment_percent: number;
  effective_date: string;
  revision_type: string;
  approved_by: string;
  reason: string;
}

export const ManageSalaryView: React.FC<Props> = ({
  structures,
  assignments,
  onAddStructure,
  onUpdateStructure,
  onUpdateAssignments,
}) => {
  const [activeTab, setActiveTab] = useState<'structures' | 'components' | 'salaries' | 'revisions' | 'bulk'>('structures');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStructurePreview, setSelectedStructurePreview] = useState<string>(
    structures[0]?.name || 'Operations Standard'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter states for Structures tab
  const [structSearch, setStructSearch] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStructFilter, setSelectedStructFilter] = useState('All Structures');
  const [empCurrentPage, setEmpCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Single Employee Revision Modal
  const [reviseEmp, setReviseEmp] = useState<EmployeeSalaryAssignment | null>(null);
  const [newCtcInput, setNewCtcInput] = useState<number>(0);
  const [revisionReasonInput, setRevisionReasonInput] = useState('Annual Appraisal 2024');
  const [revisionDateInput, setRevisionDateInput] = useState('01 Jun 2024');

  // Letter Preview Modal
  const [viewLetterItem, setViewLetterItem] = useState<RevisionHistoryItem | null>(null);

  // New Component Modal
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<'Earning' | 'Deduction'>('Earning');
  const [newCompCalc, setNewCompCalc] = useState<'Fixed %' | 'Fixed Amount' | 'Statutory'>('Fixed %');
  const [newCompVal, setNewCompVal] = useState('10%');
  const [newCompTaxable, setNewCompTaxable] = useState(true);
  const [newCompDesc, setNewCompDesc] = useState('');

  // Bulk update states
  const [bulkDept, setBulkDept] = useState('All Departments');
  const [bulkHikeType, setBulkHikeType] = useState<'percent' | 'fixed'>('percent');
  const [bulkHikeValue, setBulkHikeValue] = useState<number>(10);
  const [bulkEffectiveDate, setBulkEffectiveDate] = useState('01 Jul 2024');
  const [bulkReason, setBulkReason] = useState('Mid-year Performance Increment');
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Record<string | number, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pre-populated components state
  const [salaryComponents, setSalaryComponents] = useState<ComponentMasterItem[]>([
    { id: 'c1', name: 'Basic Salary', type: 'Earning', calcType: 'Fixed %', value: '40% of CTC', taxable: true, active: true, description: 'Core base salary component required for PF calculation.' },
    { id: 'c2', name: 'House Rent Allowance (HRA)', type: 'Earning', calcType: 'Fixed %', value: '20% of CTC', taxable: false, active: true, description: 'Tax-exempt housing benefit under Section 10(13A).' },
    { id: 'c3', name: 'Conveyance Allowance', type: 'Earning', calcType: 'Fixed Amount', value: '₹3,000 / mo', taxable: true, active: true, description: 'Monthly fixed commuting & transport allowance.' },
    { id: 'c4', name: 'Special Allowance', type: 'Earning', calcType: 'Fixed %', value: '15% of CTC', taxable: true, active: true, description: 'Balancing component in salary structure.' },
    { id: 'c5', name: 'Performance Bonus', type: 'Earning', calcType: 'Fixed %', value: '10% of CTC', taxable: true, active: true, description: 'Discretionary KPI-linked monthly variable.' },
    { id: 'c6', name: 'Medical Allowance', type: 'Earning', calcType: 'Fixed Amount', value: '₹1,250 / mo', taxable: true, active: true, description: 'Medical expenses reimbursement allowance.' },
    { id: 'c7', name: 'Internet & Mobile Subsidy', type: 'Earning', calcType: 'Fixed Amount', value: '₹1,500 / mo', taxable: false, active: true, description: 'Official connectivity reimbursement.' },
    { id: 'c8', name: 'Provident Fund (Employee)', type: 'Deduction', calcType: 'Statutory', value: '12% of Basic', taxable: false, active: true, description: 'Statutory EPFO contribution u/s 80C.' },
    { id: 'c9', name: 'ESI (Employee)', type: 'Deduction', calcType: 'Statutory', value: '0.75% of Gross', taxable: false, active: true, description: 'Applicable for wages up to ₹21,000/month.' },
    { id: 'c10', name: 'Professional Tax (PT)', type: 'Deduction', calcType: 'Statutory', value: '₹200 / mo', taxable: false, active: true, description: 'State municipal professional tax deduction.' },
    { id: 'c11', name: 'Tax Deducted at Source (TDS)', type: 'Deduction', calcType: 'Statutory', value: 'As per Slab', taxable: false, active: true, description: 'Monthly withholding tax as per New/Old regime.' },
    { id: 'c12', name: 'Labour Welfare Fund (LWF)', type: 'Deduction', calcType: 'Statutory', value: '₹20 / mo', taxable: false, active: true, description: 'Statutory state welfare fund contribution.' },
  ]);

  // Revision History state
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistoryItem[]>([
    { id: 'r1', employee_id: 'EMP001', employee_name: 'Amit Sharma', department: 'Operations', previous_ctc: 38000, new_ctc: 42000, increment_percent: 10.5, effective_date: '01 Jan 2024', revision_type: 'Annual Appraisal', approved_by: 'Faris Usman (Director)', reason: 'Excellent client retention and field HVAC operations lead.' },
    { id: 'r2', employee_id: 'EMP002', employee_name: 'Rahul Singh', department: 'Sales', previous_ctc: 42000, new_ctc: 48000, increment_percent: 14.3, effective_date: '01 Feb 2024', revision_type: 'Promotion', approved_by: 'Faris Usman (Director)', reason: 'Promotion to Senior Business Development Manager.' },
    { id: 'r3', employee_id: 'EMP004', employee_name: 'Vikram Kumar', department: 'Technology', previous_ctc: 48000, new_ctc: 55000, increment_percent: 14.6, effective_date: '01 Mar 2024', revision_type: 'Market Correction', approved_by: 'HR Committee', reason: 'Full-stack WhatsApp Cloud API architectural delivery.' },
    { id: 'r4', employee_id: 'EMP006', employee_name: 'Sameer K', department: 'Finance', previous_ctc: 50000, new_ctc: 55000, increment_percent: 10.0, effective_date: '01 Jan 2024', revision_type: 'Annual Appraisal', approved_by: 'Faris Usman (Director)', reason: 'Accurate compliance, audit closure, and tax savings.' },
    { id: 'r5', employee_id: 'EMP008', employee_name: 'Irshad Rahman', department: 'Sales', previous_ctc: 40000, new_ctc: 45000, increment_percent: 12.5, effective_date: '01 Feb 2024', revision_type: 'Performance Increment', approved_by: 'Sales VP', reason: 'Surpassed Q4 institutional contract target.' },
  ]);

  // Filtered Structures
  const filteredStructures = structures.filter((s) => {
    if (structSearch.trim() !== '') {
      const q = structSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Employee Assignments
  const filteredAssignments = assignments.filter((a) => {
    if (selectedDept !== 'All Departments' && a.department !== selectedDept) return false;
    if (selectedStructFilter !== 'All Structures' && a.salary_structure !== selectedStructFilter) return false;
    if (empSearch.trim() !== '') {
      const q = empSearch.toLowerCase();
      return (
        a.employee_name.toLowerCase().includes(q) ||
        a.employee_id.toLowerCase().includes(q) ||
        a.salary_structure.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Pagination for Employee Assignments Table
  const totalEmpPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const paginatedAssignments = filteredAssignments.slice(
    (empCurrentPage - 1) * itemsPerPage,
    empCurrentPage * itemsPerPage
  );

  const currentPreview =
    structures.find((s) => s.name === selectedStructurePreview) || structures[0];

  // Dynamic KPI calculations from live assignments
  const totalEmployeesCount = assignments.length;
  const totalPayrollGross = assignments.reduce((acc, a) => acc + (a.current_ctc || 0), 0);
  const averageCtc = totalEmployeesCount > 0 ? Math.round(totalPayrollGross / totalEmployeesCount) : 0;

  // Toggle Component Active state
  const handleToggleComponent = (id: string) => {
    setSalaryComponents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = !c.active;
          showToast(`${c.name} marked as ${updated ? 'Active' : 'Inactive'}`);
          return { ...c, active: updated };
        }
        return c;
      })
    );
  };

  // Create New Component
  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    const item: ComponentMasterItem = {
      id: `c_${Date.now()}`,
      name: newCompName.trim(),
      type: newCompType,
      calcType: newCompCalc,
      value: newCompVal,
      taxable: newCompTaxable,
      active: true,
      description: newCompDesc.trim() || 'Custom salary component.',
    };
    setSalaryComponents((prev) => [...prev, item]);
    setIsAddComponentOpen(false);
    setNewCompName('');
    setNewCompDesc('');
    showToast(`Salary component "${item.name}" added successfully!`);
  };

  // Export CSV of Assignments
  const handleExportAssignments = () => {
    const headers = ['#', 'Employee', 'Employee ID', 'Department', 'Salary Structure', 'Current CTC (Monthly)', 'Annual CTC', 'Effective From', 'Status'];
    const rows = filteredAssignments.map((a, i) => [
      i + 1,
      `"${a.employee_name}"`,
      `"${a.employee_id}"`,
      `"${a.department}"`,
      `"${a.salary_structure}"`,
      a.current_ctc,
      a.current_ctc * 12,
      `"${a.effective_from}"`,
      a.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `qiyam_employee_salaries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Employee salary assignments exported to CSV!');
  };

  // Open single employee revision modal
  const handleOpenReviseModal = (emp: EmployeeSalaryAssignment) => {
    setReviseEmp(emp);
    setNewCtcInput(Math.round(emp.current_ctc * 1.1));
    setRevisionReasonInput('Annual Appraisal 2024');
    setRevisionDateInput(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  };

  // Submit single employee revision
  const handleSaveReviseSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviseEmp || newCtcInput <= 0) return;

    const hikePercent = Number((((newCtcInput - reviseEmp.current_ctc) / reviseEmp.current_ctc) * 100).toFixed(1));
    const newRevisionRecord: RevisionHistoryItem = {
      id: `r_${Date.now()}`,
      employee_id: reviseEmp.employee_id,
      employee_name: reviseEmp.employee_name,
      department: reviseEmp.department,
      previous_ctc: reviseEmp.current_ctc,
      new_ctc: newCtcInput,
      increment_percent: hikePercent,
      effective_date: revisionDateInput,
      revision_type: 'Appraisal Revision',
      approved_by: 'Faris Usman (Director)',
      reason: revisionReasonInput,
    };

    const updatedAssignments = assignments.map((a) =>
      a.id === reviseEmp.id ? { ...a, current_ctc: newCtcInput, effective_from: revisionDateInput } : a
    );

    if (onUpdateAssignments) {
      onUpdateAssignments(updatedAssignments);
    }
    setRevisionHistory((prev) => [newRevisionRecord, ...prev]);
    setReviseEmp(null);
    showToast(`Salary revised for ${reviseEmp.employee_name} to ₹${newCtcInput.toLocaleString()} (${hikePercent > 0 ? '+' : ''}${hikePercent}%)!`);
  };

  // Bulk Increment Simulation calculation
  const bulkEligibleList = assignments.filter((a) => {
    if (bulkDept === 'All Departments') return true;
    return a.department === bulkDept;
  });

  const getProposedCtc = (current: number) => {
    if (bulkHikeType === 'percent') {
      return Math.round(current * (1 + bulkHikeValue / 100));
    }
    return current + Number(bulkHikeValue);
  };

  const handleApplyBulkIncrement = () => {
    const selectedCount = Object.keys(bulkSelectedIds).filter((k) => bulkSelectedIds[k]).length;
    if (selectedCount === 0) {
      showToast('Please select at least one employee for bulk increment.');
      return;
    }

    const newRevisions: RevisionHistoryItem[] = [];
    const updatedAssignments = assignments.map((a) => {
      if (bulkSelectedIds[a.id]) {
        const proposed = getProposedCtc(a.current_ctc);
        const hikePercent = Number((((proposed - a.current_ctc) / a.current_ctc) * 100).toFixed(1));
        newRevisions.push({
          id: `r_bulk_${Date.now()}_${a.id}`,
          employee_id: a.employee_id,
          employee_name: a.employee_name,
          department: a.department,
          previous_ctc: a.current_ctc,
          new_ctc: proposed,
          increment_percent: hikePercent,
          effective_date: bulkEffectiveDate,
          revision_type: 'Bulk Increment',
          approved_by: 'Faris Usman (Director)',
          reason: bulkReason,
        });
        return {
          ...a,
          current_ctc: proposed,
          effective_from: bulkEffectiveDate,
        };
      }
      return a;
    });

    if (onUpdateAssignments) {
      onUpdateAssignments(updatedAssignments);
    }
    setRevisionHistory((prev) => [...newRevisions, ...prev]);
    setBulkSelectedIds({});
    showToast(`Bulk salary increment applied to ${selectedCount} employees successfully!`);
    setActiveTab('salaries');
  };

  const handleSelectAllBulk = (checked: boolean) => {
    const newMap: Record<string | number, boolean> = {};
    if (checked) {
      bulkEligibleList.forEach((e) => {
        newMap[e.id] = true;
      });
    }
    setBulkSelectedIds(newMap);
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

      {/* Sub-Tabs & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveTab('structures')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'structures'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            Salary Structures
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'components'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Salary Components</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'components' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {salaryComponents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('salaries')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'salaries'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Employee Salaries</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'salaries' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {assignments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'revisions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Salary Revisions</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'revisions' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {revisionHistory.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bulk'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bulk Increment</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'structures' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Salary Structure</span>
            </button>
          )}

          {activeTab === 'components' && (
            <button
              onClick={() => setIsAddComponentOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Component</span>
            </button>
          )}

          {(activeTab === 'salaries' || activeTab === 'structures') && (
            <button
              onClick={handleExportAssignments}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Salary Structures</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{structures.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Across all departments</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees Assigned</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalEmployeesCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">100% of workforce enrolled</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average Monthly CTC</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{averageCtc.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8.4% annual growth</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Monthly Payroll (Gross)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{totalPayrollGross.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Disbursed via automated batch</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: SALARY STRUCTURES (Matches Image 2 exactly)                     */}
      {/* ========================================================================= */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 8 cols: Structures Table + Employees Table */}
          <div className="lg:col-span-8 space-y-6">
            {/* Salary Structures Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Salary Structures</h3>
                  <p className="text-[11px] text-slate-500">
                    Create and manage different salary structures for various departments and roles.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={structSearch}
                      onChange={(e) => setStructSearch(e.target.value)}
                      placeholder="Search structure, department..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-48 sm:w-56 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-8">#</th>
                      <th className="py-3 px-3">Structure Name</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Employees</th>
                      <th className="py-3 px-3">CTC Range</th>
                      <th className="py-3 px-3">Pay Frequency</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStructures.map((s, idx) => (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedStructurePreview(s.name)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          selectedStructurePreview === s.name ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 px-3 font-medium text-slate-600">{s.department}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{s.employees_count}</td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">{s.ctc_range}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{s.pay_frequency}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Structure "${s.name}" selected for editing`);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg cursor-pointer mr-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Showing 1 to {filteredStructures.length} of {structures.length} structures</span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Click any row to preview breakdown
                </span>
              </div>
            </div>

            {/* Employees & Their Salary Structure Table (Screenshot 2) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Employees & Their Salary Structure</h3>
                  <p className="text-[11px] text-slate-500">
                    View and manage which employees are assigned to which salary structure.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={empSearch}
                      onChange={(e) => {
                        setEmpSearch(e.target.value);
                        setEmpCurrentPage(1);
                      }}
                      placeholder="Search employee..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-36 sm:w-44 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setEmpCurrentPage(1);
                    }}
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
                    value={selectedStructFilter}
                    onChange={(e) => {
                      setSelectedStructFilter(e.target.value);
                      setEmpCurrentPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option>All Structures</option>
                    {structures.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-8">#</th>
                      <th className="py-3 px-3">Employee</th>
                      <th className="py-3 px-3">Employee ID</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Salary Structure</th>
                      <th className="py-3 px-3">Current CTC</th>
                      <th className="py-3 px-3">Effective From</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedAssignments.map((emp, idx) => {
                      const actualIdx = (empCurrentPage - 1) * itemsPerPage + idx + 1;
                      const initials = emp.employee_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2);

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-mono text-slate-400">{actualIdx}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                                {initials}
                              </div>
                              <span className="font-bold text-slate-900">{emp.employee_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-600">{emp.employee_id}</td>
                          <td className="py-3 px-3 font-medium text-slate-700">{emp.department}</td>
                          <td className="py-3 px-3 font-medium text-emerald-700 font-semibold">{emp.salary_structure}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-900">₹{emp.current_ctc.toLocaleString()}</td>
                          <td className="py-3 px-3 font-medium text-slate-500">{emp.effective_from}</td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {emp.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenReviseModal(emp)}
                              className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-lg border border-slate-200 cursor-pointer transition-colors text-[11px]"
                            >
                              Revise
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {(empCurrentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(empCurrentPage * itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} employees
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={empCurrentPage === 1}
                    onClick={() => setEmpCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalEmpPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setEmpCurrentPage(p)}
                      className={`px-2.5 py-0.5 rounded font-bold text-xs cursor-pointer transition-all ${
                        empCurrentPage === p
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={empCurrentPage === totalEmpPages}
                    onClick={() => setEmpCurrentPage((p) => Math.min(totalEmpPages, p + 1))}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 cols: Component Preview & Recent Changes (Screenshot 2) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Component Preview Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Component Preview</h3>
                <select
                  value={selectedStructurePreview}
                  onChange={(e) => setSelectedStructurePreview(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
                >
                  {structures.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 px-3 py-2 font-bold text-slate-700 flex justify-between border-b border-slate-200">
                  <span>Component</span>
                  <span>Type</span>
                  <span>Value / %</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {currentPreview.components.map((c, i) => (
                    <div key={i} className="flex justify-between items-center px-3 py-2 text-[11px]">
                      <span className="font-semibold text-slate-800">{c.name}</span>
                      <span className="text-slate-500">{c.type}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {typeof c.value === 'number' ? `₹${c.value.toLocaleString()}` : c.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-50/50 px-3 py-2.5 border-t border-slate-200 flex justify-between font-bold text-xs">
                  <span className="text-emerald-900">Total (CTC)</span>
                  <span className="font-mono text-emerald-700 font-bold">100%</span>
                </div>
              </div>
            </div>

            {/* Recent Changes Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Recent Changes</h3>
                <span
                  onClick={() => setActiveTab('revisions')}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  View All
                </span>
              </div>
              <div className="space-y-2.5 text-[11px]">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Revised salary for Rahul Singh</div>
                    <div className="text-[10px] text-slate-400">Sales Team • +14.3% Increment</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Updated Technology Structure</div>
                    <div className="text-[10px] text-slate-400">Technology Team • Tech Allowance added</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Added Performance Allowance</div>
                    <div className="text-[10px] text-slate-400">Operations Team • Grade A Rule</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Update Promo Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">Need to make salary changes for multiple employees?</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Use our bulk increment simulator to apply percentage hikes or flat increments across teams.
              </p>
              <button
                onClick={() => setActiveTab('bulk')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Launch Bulk Increment Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: SALARY COMPONENTS (12 Earnings & Deductions with toggles)       */}
      {/* ========================================================================= */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Salary Components Master</h3>
                <p className="text-[11px] text-slate-500">
                  Configure active earnings, statutory deductions, calculation formulas, and tax rules.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {salaryComponents.filter((c) => c.active).length} of {salaryComponents.length} Active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-8">#</th>
                    <th className="py-3 px-3">Component Name</th>
                    <th className="py-3 px-3">Classification</th>
                    <th className="py-3 px-3">Calculation Type</th>
                    <th className="py-3 px-3">Standard Value / Formula</th>
                    <th className="py-3 px-3">Taxability</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {salaryComponents.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400">{i + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.description}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            c.type === 'Earning'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{c.calcType}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900">{c.value}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.taxable ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {c.taxable ? 'Taxable' : 'Tax Exempt'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleComponent(c.id)}
                          className={`flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors ${
                            c.active ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {c.active ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                          <span>{c.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => showToast(`Edit formula for ${c.name}`)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: EMPLOYEE SALARIES (Full Compensation Master)                    */}
      {/* ========================================================================= */}
      {activeTab === 'salaries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Employee Compensation Register</h3>
                <p className="text-[11px] text-slate-500">
                  View full salary breakdowns, monthly CTC, and perform individual salary revisions.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Search by name or ID..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-44 focus:ring-1 focus:ring-emerald-500"
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
                <button
                  onClick={handleExportAssignments}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-8">#</th>
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Employee ID</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Assigned Structure</th>
                    <th className="py-3 px-3">Monthly CTC</th>
                    <th className="py-3 px-3">Annual CTC</th>
                    <th className="py-3 px-3">Effective Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAssignments.map((emp, idx) => {
                    const initials = emp.employee_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900">{emp.employee_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-600">{emp.employee_id}</td>
                        <td className="py-3 px-3 font-medium text-slate-700">{emp.department}</td>
                        <td className="py-3 px-3 font-medium text-emerald-700 font-semibold">{emp.salary_structure}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">₹{emp.current_ctc.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">₹{(emp.current_ctc * 12).toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-500 font-medium">{emp.effective_from}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenReviseModal(emp)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 cursor-pointer transition-colors"
                          >
                            Revise Salary
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: SALARY REVISIONS (Audit log of all increments)                  */}
      {/* ========================================================================= */}
      {activeTab === 'revisions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Salary Revision History</h3>
                <p className="text-[11px] text-slate-500">
                  Comprehensive audit trail of promotions, increments, appraisal letters, and CTC updates.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  Average Increment: +12.4%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-8">#</th>
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Previous CTC</th>
                    <th className="py-3 px-3">New CTC</th>
                    <th className="py-3 px-3">Increment %</th>
                    <th className="py-3 px-3">Effective Date</th>
                    <th className="py-3 px-3">Revision Type</th>
                    <th className="py-3 px-3">Approved By</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {revisionHistory.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400">{i + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{r.employee_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.employee_id}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{r.department}</td>
                      <td className="py-3 px-3 font-mono text-slate-500 line-through">₹{r.previous_ctc.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">₹{r.new_ctc.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>+{r.increment_percent}%</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600">{r.effective_date}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{r.revision_type}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-500">{r.approved_by}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setViewLetterItem(r)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors text-[11px] flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>View Letter</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: BULK UPDATE SIMULATOR                                          */}
      {/* ========================================================================= */}
      {activeTab === 'bulk' && (
        <div className="space-y-5">
          {/* Controls Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Bulk Salary Revision Simulator</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simulate and batch-apply CTC increments across entire departments or individual staff.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Target Department</label>
                <select
                  value={bulkDept}
                  onChange={(e) => setBulkDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option>All Departments</option>
                  <option>Operations</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>Technology</option>
                  <option>HR</option>
                  <option>Finance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Increment Method</label>
                <select
                  value={bulkHikeType}
                  onChange={(e) => setBulkHikeType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="percent">Percentage Hike (%)</option>
                  <option value="fixed">Flat Amount Addition (₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {bulkHikeType === 'percent' ? 'Hike Percentage (%)' : 'Flat Amount (₹)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkHikeValue}
                  onChange={(e) => setBulkHikeValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Effective From</label>
                <input
                  type="text"
                  value={bulkEffectiveDate}
                  onChange={(e) => setBulkEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Revision Reason</label>
                <input
                  type="text"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Simulation Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Simulation Preview ({bulkEligibleList.length} Eligible Employees)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Review before and after monthly CTC. Uncheck individuals to exclude them from the batch.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSelectAllBulk(true)}
                  className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={() => handleSelectAllBulk(false)}
                  className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Deselect All
                </button>
                <button
                  onClick={handleApplyBulkIncrement}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Increment to Selected</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={bulkEligibleList.length > 0 && bulkEligibleList.every((e) => bulkSelectedIds[e.id])}
                        onChange={(e) => handleSelectAllBulk(e.target.checked)}
                        className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Current CTC</th>
                    <th className="py-3 px-3">Proposed CTC</th>
                    <th className="py-3 px-3">Difference</th>
                    <th className="py-3 px-3">Annual Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bulkEligibleList.map((emp) => {
                    const proposed = getProposedCtc(emp.current_ctc);
                    const diff = proposed - emp.current_ctc;
                    const isChecked = !!bulkSelectedIds[emp.id];

                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isChecked ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setBulkSelectedIds((prev) => ({
                                ...prev,
                                [emp.id]: e.target.checked,
                              }));
                            }}
                            className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{emp.employee_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{emp.employee_id}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">{emp.department}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">₹{emp.current_ctc.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">₹{proposed.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-emerald-600">
                          +₹{diff.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          +₹{(diff * 12).toLocaleString()} / yr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Single Employee Salary Revision                                    */}
      {/* ========================================================================= */}
      {reviseEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Revise Salary</h3>
                  <p className="text-[11px] text-slate-500">
                    {reviseEmp.employee_name} ({reviseEmp.employee_id}) — {reviseEmp.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviseEmp(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReviseSalary} className="space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Monthly CTC</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">₹{reviseEmp.current_ctc.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Annual CTC</span>
                  <span className="font-mono text-slate-600 text-xs">₹{(reviseEmp.current_ctc * 12).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">New Monthly CTC (₹) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={newCtcInput}
                  onChange={(e) => setNewCtcInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {newCtcInput > reviseEmp.current_ctc && (
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>
                      Hike of {(((newCtcInput - reviseEmp.current_ctc) / reviseEmp.current_ctc) * 100).toFixed(1)}% (+₹
                      {(newCtcInput - reviseEmp.current_ctc).toLocaleString()}/mo)
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Effective Date *</label>
                <input
                  type="text"
                  required
                  value={revisionDateInput}
                  onChange={(e) => setRevisionDateInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Revision Reason *</label>
                <input
                  type="text"
                  required
                  value={revisionReasonInput}
                  onChange={(e) => setRevisionReasonInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviseEmp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Save Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Salary Revision Letter Preview                                     */}
      {/* ========================================================================= */}
      {viewLetterItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Compensation Revision Letter</h3>
              </div>
              <button
                onClick={() => setViewLetterItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 font-serif text-slate-800 leading-relaxed text-xs">
              <div className="flex justify-between items-start font-sans pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">QIYAM BUSINESS SOLUTIONS LLP</h4>
                  <p className="text-[10px] text-slate-500">Corporate HQ, Cyberpark, Calicut, Kerala, India</p>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  Date: {viewLetterItem.effective_date}
                </div>
              </div>

              <div className="font-sans font-bold text-slate-900 pt-1">
                To: {viewLetterItem.employee_name} ({viewLetterItem.employee_id})<br />
                <span className="font-normal text-slate-500">Department: {viewLetterItem.department}</span>
              </div>

              <p className="italic">Dear {viewLetterItem.employee_name},</p>

              <p>
                In recognition of your continued dedication, professional excellence, and invaluable contribution
                towards our organizational growth, the Management is pleased to revise your monthly compensation as outlined below:
              </p>

              <div className="font-sans bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Previous Monthly CTC:</span>
                  <span className="font-mono line-through text-slate-500">₹{viewLetterItem.previous_ctc.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Revised Monthly CTC:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">₹{viewLetterItem.new_ctc.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Percentage Hike:</span>
                  <span className="font-bold text-emerald-600">+{viewLetterItem.increment_percent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Effective Date:</span>
                  <span className="font-medium text-slate-800">{viewLetterItem.effective_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Appraisal Rationale:</span>
                  <span className="font-medium text-slate-800 italic">{viewLetterItem.reason}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 pt-2">
                We thank you for your ongoing commitment and look forward to scaling new milestones together.
              </p>

              <div className="pt-4 font-sans flex justify-between items-end border-t border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">{viewLetterItem.approved_by}</p>
                  <p className="text-[10px] text-slate-500">Authorized Signatory</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                  Digitally Authenticated
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4 text-slate-500" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setViewLetterItem(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Add New Salary Component                                           */}
      {/* ========================================================================= */}
      {isAddComponentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Add Salary Component</h3>
                  <p className="text-[11px] text-slate-500">Define custom allowances, perks, or deduction formulas.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddComponentOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateComponent} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Component Name *</label>
                <input
                  type="text"
                  required
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  placeholder="e.g. Fuel Allowance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Component Type *</label>
                  <select
                    value={newCompType}
                    onChange={(e) => setNewCompType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Calculation Method *</label>
                  <select
                    value={newCompCalc}
                    onChange={(e) => setNewCompCalc(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="Fixed %">Fixed % of CTC</option>
                    <option value="Fixed Amount">Fixed Monthly Amount</option>
                    <option value="Statutory">Statutory Formula</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Default Value / Formula *</label>
                <input
                  type="text"
                  required
                  value={newCompVal}
                  onChange={(e) => setNewCompVal(e.target.value)}
                  placeholder="e.g. 10% or ₹2,500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description / Statutory Reference</label>
                <input
                  type="text"
                  value={newCompDesc}
                  onChange={(e) => setNewCompDesc(e.target.value)}
                  placeholder="e.g. Applicable under company travel policy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Tax Treatment</span>
                  <span className="text-[10px] text-slate-500">Should this component be considered for TDS calculation?</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCompTaxable}
                    onChange={(e) => setNewCompTaxable(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600"
                  />
                  <span className="font-bold text-slate-800 text-xs">Taxable</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddComponentOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Create Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Salary Structure Modal */}
      <NewSalaryStructureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddStructure}
      />
    </div>
  );
};

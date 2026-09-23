import React, { useState } from 'react';
import {
  Users, FileText, ShieldCheck, ArrowUpRight, Search, Filter,
  Download, MoreVertical, ChevronLeft, ChevronRight, X, Edit2,
  CheckCircle2, AlertCircle, Building2, HelpCircle, FileDown,
  Info, ExternalLink, Calendar, Check, Landmark, Shield
} from 'lucide-react';
import { EmployeeTaxCompliance } from '@/types';
import { TaxUpdateModal } from './modals/TaxUpdateModal';

interface Props {
  records: EmployeeTaxCompliance[];
  onUpdateRecord: (updated: EmployeeTaxCompliance) => void;
}

export const TaxComplianceView: React.FC<Props> = ({ records, onUpdateRecord }) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'tds' | 'pf' | 'esi' | 'pt' | 'other'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Compliance Status');
  const [selectedRecord, setSelectedRecord] = useState<EmployeeTaxCompliance>(
    records.find((r) => r.employee_id === 'EMP004') || records[0]
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [rightTab, setRightTab] = useState<'tax' | 'salary' | 'docs' | 'history'>('tax');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card (Screenshot 6 / Qiyam OS pattern) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-100/80 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700">
              Statutory Compliance & Filings
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Tax & Compliance</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Monitor and automate employee TDS withholding, EPFO provident fund, ESIC health coverage, and professional tax.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-2xs shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Stay Compliant, Always</h4>
            <p className="text-[11px] text-slate-500">Automated TDS, PF, ESI, PT — for every team member.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-emerald-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

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
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.tds ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {r.tds ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.pf ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {r.pf ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.esi ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {r.esi ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.pt ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {r.pt ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              r.status === 'Compliant'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(r);
                              setIsUpdateModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg cursor-pointer"
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
              <div className="flex items-center gap-1 border-b border-slate-100 pb-1 text-[11px] font-semibold text-slate-500">
                <button
                  onClick={() => setRightTab('tax')}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    rightTab === 'tax' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'hover:text-slate-800'
                  }`}
                >
                  Tax & Statutory
                </button>
                <button
                  onClick={() => setRightTab('salary')}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    rightTab === 'salary' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'hover:text-slate-800'
                  }`}
                >
                  Salary Info
                </button>
                <button
                  onClick={() => setRightTab('docs')}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    rightTab === 'docs' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'hover:text-slate-800'
                  }`}
                >
                  Documents
                </button>
                <button
                  onClick={() => setRightTab('history')}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    rightTab === 'history' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'hover:text-slate-800'
                  }`}
                >
                  History
                </button>
              </div>

              {/* TAB CONTENT: Tax & Statutory */}
              {rightTab === 'tax' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {/* TDS Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>TDS</span>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {selectedRecord.tds ? 'Applicable' : 'Not Applicable'}
                      </div>
                      <div className="font-bold text-slate-900 font-mono">
                        {selectedRecord.tds ? `₹${(selectedRecord.monthly_tds || 6500).toLocaleString()} / mo` : '₹0'}
                      </div>
                    </div>

                    {/* PF Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>PF</span>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {selectedRecord.pf ? 'Applicable' : 'Not Applicable'}
                      </div>
                      <div className="font-bold text-slate-900 font-mono text-[10px]">
                        12% Employee + 12% Employer
                      </div>
                    </div>

                    {/* ESI Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>ESI</span>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {selectedRecord.esi ? 'Applicable' : 'Not Applicable'}
                      </div>
                      <div className="font-bold text-slate-900 font-mono text-[10px]">
                        {selectedRecord.esi ? '0.75% + 3.25%' : 'Exempt (> ₹21k)'}
                      </div>
                    </div>

                    {/* PT Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-600 font-bold">
                        <Landmark className="w-3.5 h-3.5" />
                        <span>Professional Tax</span>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {selectedRecord.pt ? 'Applicable' : 'Not Applicable'}
                      </div>
                      <div className="font-bold text-slate-900 font-mono">₹200 / month</div>
                    </div>
                  </div>

                  {/* Compliance Details List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="font-bold text-slate-800 uppercase tracking-wider">Compliance Details</div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">TDS Regime</span>
                        <span className="font-semibold text-slate-900">{selectedRecord.tds_regime || 'New Regime'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Estimated Annual Tax</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{(selectedRecord.estimated_annual_tax || 78000).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">PF Number (UAN)</span>
                        <span className="font-mono font-medium text-slate-900">
                          {selectedRecord.pf_number || '1002 3456 7890'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ESI Insurance Number</span>
                        <span className="font-mono font-medium text-slate-900">
                          {selectedRecord.esi_number || '4400 1234 5678'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">PT Registration</span>
                        <span className="font-mono font-medium text-slate-900">
                          {selectedRecord.pt_number || 'KL/PT/1234567'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Verified</span>
                        <span className="font-medium text-slate-900">{selectedRecord.last_updated || '01 May 2024'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Salary Info */}
              {rightTab === 'salary' && (
                <div className="space-y-2.5 text-[11px]">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Gross CTC:</span>
                      <span className="font-mono font-bold text-slate-900">₹45,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Basic Salary (40%):</span>
                      <span className="font-mono text-slate-700">₹18,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">HRA (20%):</span>
                      <span className="font-mono text-slate-700">₹9,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Conveyance Allowance:</span>
                      <span className="font-mono text-slate-700">₹3,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Special Allowance:</span>
                      <span className="font-mono text-slate-700">₹15,000</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Total Statutory Deductions:</span>
                      <span className="font-mono text-rose-600">-₹8,860</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-900 pt-1 border-t border-emerald-200">
                      <span>Net Monthly Take-home:</span>
                      <span className="font-mono text-emerald-700 text-xs">₹36,140</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Documents */}
              {rightTab === 'docs' && (
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-bold text-slate-900">Form 16 (FY 2023-24)</div>
                        <div className="text-[10px] text-slate-400">Part A & Part B digitally signed</div>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Form 16 downloaded')}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-200 rounded cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-bold text-slate-900">PAN & Aadhaar Verification</div>
                        <div className="text-[10px] text-slate-400">e-KYC verified via NSDL</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Verified
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-bold text-slate-900">Form 12BB Declaration</div>
                        <div className="text-[10px] text-slate-400">80C, 80D, HRA proof submitted</div>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Form 12BB downloaded')}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-200 rounded cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: History */}
              {rightTab === 'history' && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
                    <div>
                      <div className="font-bold text-slate-900">Tax Regime Selected: New Regime</div>
                      <div className="text-[10px] text-slate-400">Opted on 01 Apr 2024 by employee</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                    <div>
                      <div className="font-bold text-slate-900">EPFO UAN Linked & Seeded</div>
                      <div className="text-[10px] text-slate-400">Verified with Aadhaar OTP on 15 Jan 2024</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />
                    <div>
                      <div className="font-bold text-slate-900">Form 24Q Q4 Return Filed</div>
                      <div className="text-[10px] text-slate-400">TDS deducted successfully remitted to Traces</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Compliance Parameters</span>
                </button>
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
        onSave={onUpdateRecord}
      />
    </div>
  );
};

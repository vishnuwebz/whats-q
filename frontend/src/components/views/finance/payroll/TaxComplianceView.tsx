import React, { useState } from 'react';
import {
  Users, FileText, ShieldCheck, ArrowUpRight, Search, Filter,
  Download, MoreVertical, ChevronLeft, ChevronRight, X, Edit2,
  CheckCircle2, AlertCircle, Building2, HelpCircle
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
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card (Screenshot 6) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Tax & Compliance</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            View and manage tax and statutory compliance for each employee.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-xs shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Stay Compliant, Always</h4>
            <p className="text-[11px] text-slate-500">Automated TDS, PF, ESI, PT and more — for every employee.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs (Screenshot 6) */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab('tds')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tds'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          TDS
        </button>
        <button
          onClick={() => setActiveTab('pf')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pf'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          PF
        </button>
        <button
          onClick={() => setActiveTab('esi')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'esi'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ESI
        </button>
        <button
          onClick={() => setActiveTab('pt')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pt'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Professional Tax
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'other'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Other Compliance
        </button>
      </div>

      {/* 4 Metric Cards (Screenshot 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Employees</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">32</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>3 from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees with TDS</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">18</div>
          <div className="text-[11px] text-slate-500 font-medium">56% of total</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees with PF</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">32</div>
          <div className="text-[11px] text-emerald-600 font-semibold">100% of total</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees with ESI</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">12</div>
          <div className="text-[11px] text-slate-500 font-medium">37% of total</div>
        </div>
      </div>

      {/* Main Grid: Compliance Table (Left 8 cols) & Inspector Drawer (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 cols: Employees Compliance Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID or department..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-full"
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
            <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
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
                    <input type="checkbox" className="rounded text-blue-600 accent-blue-600" />
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
                        isSelected ? 'bg-blue-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setSelectedRecord(r)}
                          className="rounded text-blue-600 accent-blue-600"
                        />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
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
                            r.tds ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {r.tds ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.pf ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {r.pf ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.esi ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {r.esi ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.pt ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
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
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {filteredRecords.length} of 32 employees</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">1</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">2</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">3</button>
              <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">4</button>
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Employee Inspector Panel (Screenshot 6) */}
        {selectedRecord && (
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 text-xs">
            {/* Employee Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
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
                    {selectedRecord.employee_id} | {selectedRecord.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-tabs inside Inspector */}
            <div className="flex items-center gap-1 border-b border-slate-100 pb-1 text-[11px] font-semibold text-slate-500">
              <button
                onClick={() => setRightTab('tax')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  rightTab === 'tax' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-slate-800'
                }`}
              >
                Tax & Compliance
              </button>
              <button
                onClick={() => setRightTab('salary')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  rightTab === 'salary' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-slate-800'
                }`}
              >
                Salary Info
              </button>
              <button
                onClick={() => setRightTab('docs')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  rightTab === 'docs' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-slate-800'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => setRightTab('history')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  rightTab === 'history' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-slate-800'
                }`}
              >
                History
              </button>
            </div>

            {/* 4 Cards: TDS, PF, ESI, PT (Screenshot 6) */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                Tax & Compliance Overview
              </div>
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
                    {selectedRecord.tds ? `₹${(selectedRecord.monthly_tds || 6500).toLocaleString()} / month` : '₹0'}
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
                    ₹3,600 (Employee)
                    <br />
                    ₹3,600 (Employer)
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
                    {selectedRecord.esi ? (
                      <>
                        ₹1,125 (Employee)
                        <br />
                        ₹1,125 (Employer)
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                {/* PT Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-600 font-bold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Professional Tax</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    {selectedRecord.pt ? 'Applicable' : 'Not Applicable'}
                  </div>
                  <div className="font-bold text-slate-900 font-mono">₹200 / month</div>
                </div>
              </div>
            </div>

            {/* Compliance Details List (Screenshot 6) */}
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
                  <span className="text-slate-500">Monthly TDS</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{(selectedRecord.monthly_tds || 6500).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PF Number (UAN)</span>
                  <span className="font-mono font-medium text-slate-900">
                    {selectedRecord.pf_number || '1002 3456 7890'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ESI Number</span>
                  <span className="font-mono font-medium text-slate-900">
                    {selectedRecord.esi_number || '4400 1234 5678'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Professional Tax Number</span>
                  <span className="font-mono font-medium text-slate-900">
                    {selectedRecord.pt_number || 'KL/PT/1234567'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="font-medium text-slate-900">{selectedRecord.last_updated || '01 May 2024'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-center cursor-pointer transition-colors"
              >
                View Full Details
              </button>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center cursor-pointer shadow-sm shadow-blue-700/20 transition-colors"
              >
                Edit / Update
              </button>
            </div>
          </div>
        )}
      </div>

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

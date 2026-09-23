import React, { useState } from 'react';
import {
  Layers, Users, IndianRupee, ArrowUpRight, Plus, Search, Filter,
  Edit2, MoreVertical, Download, ChevronLeft, ChevronRight, FileText,
  Clock, CheckCircle2, ArrowRight
} from 'lucide-react';
import { SalaryStructure, EmployeeSalaryAssignment } from '@/types';
import { NewSalaryStructureModal } from './modals/NewSalaryStructureModal';

interface Props {
  structures: SalaryStructure[];
  assignments: EmployeeSalaryAssignment[];
  onAddStructure: (struct: SalaryStructure) => void;
  onUpdateStructure: (struct: SalaryStructure) => void;
}

export const ManageSalaryView: React.FC<Props> = ({
  structures,
  assignments,
  onAddStructure,
  onUpdateStructure,
}) => {
  const [activeTab, setActiveTab] = useState<'structures' | 'components' | 'salaries' | 'revisions' | 'bulk'>('structures');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStructurePreview, setSelectedStructurePreview] = useState<string>('Operations Standard');
  const [structSearch, setStructSearch] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStructFilter, setSelectedStructFilter] = useState('All Structures');

  const filteredStructures = structures.filter((s) => {
    if (structSearch.trim() !== '') {
      const q = structSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
    }
    return true;
  });

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

  const currentPreview =
    structures.find((s) => s.name === selectedStructurePreview) || structures[0];

  const handleExportAssignments = () => {
    const headers = ['#', 'Employee', 'Employee ID', 'Department', 'Salary Structure', 'Current CTC', 'Effective From', 'Status'];
    const rows = filteredAssignments.map((a, i) => [
      i + 1,
      `"${a.employee_name}"`,
      `"${a.employee_id}"`,
      `"${a.department}"`,
      `"${a.salary_structure}"`,
      a.current_ctc,
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
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card (Screenshot 2) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Manage Salary</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Create and manage salary structures, components, and employee salaries.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-xs shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Flexible Salary Structures</h4>
            <p className="text-[11px] text-slate-500">Design, assign and update salaries with ease.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/30">
            ₹
          </div>
        </div>
      </div>

      {/* Sub Tabs & Add Structure Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('structures')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'structures'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Salary Structures
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'components'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Salary Components
          </button>
          <button
            onClick={() => setActiveTab('salaries')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'salaries'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Employee Salaries
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'revisions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Salary Revisions
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Bulk Update
          </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-700/20 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Salary Structure</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Salary Structures</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">6</div>
          <div className="text-[11px] text-slate-400 font-medium">Across all departments</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Employees Assigned</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">32</div>
          <div className="text-[11px] text-blue-600 font-semibold">100% of total employees</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average CTC</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹38,906</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8% from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Monthly Payroll (Gross)</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹12,45,000</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8% from last month</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Tables (Left 8 cols) & Component Preview / Recent Changes (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 cols: Salary Structures & Employee Table */}
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
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-48 sm:w-56"
                  />
                </div>
                <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>
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
                        selectedStructurePreview === s.name ? 'bg-blue-50/40' : ''
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
                        <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer mr-1">
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
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">1</button>
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
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
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Search employee..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-36 sm:w-44"
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
                  value={selectedStructFilter}
                  onChange={(e) => setSelectedStructFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                >
                  <option>All Structures</option>
                  <option>Operations Standard</option>
                  <option>Sales Incentive Based</option>
                  <option>Marketing Standard</option>
                  <option>Technology Premium</option>
                  <option>HR & Admin</option>
                </select>
                <button
                  onClick={handleExportAssignments}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
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
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0 uppercase">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900">{emp.employee_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-600">{emp.employee_id}</td>
                        <td className="py-3 px-3 font-medium text-slate-700">{emp.department}</td>
                        <td className="py-3 px-3 font-medium text-blue-700">{emp.salary_structure}</td>
                        <td className="py-3 px-3 font-mono font-semibold">₹{emp.current_ctc.toLocaleString()}</td>
                        <td className="py-3 px-3 font-medium text-slate-500">{emp.effective_from}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer mr-1">
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
              <span>Showing 1 to 5 of 32 employees</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">1</button>
                <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">2</button>
                <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">3</button>
                <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">4</button>
                <button className="px-2.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium text-xs">5</button>
                <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
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
              <div className="bg-slate-50 px-3 py-2.5 border-t border-slate-200 flex justify-between font-bold text-xs">
                <span>Total (CTC)</span>
                <span className="font-mono text-emerald-600 font-bold">100%</span>
              </div>
            </div>
          </div>

          {/* Recent Changes Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Recent Changes</h3>
              <span className="text-[11px] font-bold text-blue-600 cursor-pointer">View All</span>
            </div>
            <div className="space-y-2.5 text-[11px]">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Revised salary for Rahul Singh</div>
                  <div className="text-[10px] text-slate-400">Sales Team • 2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Updated Marketing Structure</div>
                  <div className="text-[10px] text-slate-400">Marketing Team • 6 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Added new component: Performance Allowance</div>
                  <div className="text-[10px] text-slate-400">Technology Team • 1 day ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Salary revision for 3 employees</div>
                  <div className="text-[10px] text-slate-400">Operations Team • 2 days ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Update Promo Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-300" />
              <span className="font-bold text-xs">Need to make salary changes for multiple employees?</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Use bulk update to save time and apply percentage increments across departments.
            </p>
            <button
              onClick={() => setActiveTab('bulk')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer pt-1"
            >
              <span>Go to Bulk Update</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Salary Structure Modal */}
      <NewSalaryStructureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddStructure}
      />
    </div>
  );
};

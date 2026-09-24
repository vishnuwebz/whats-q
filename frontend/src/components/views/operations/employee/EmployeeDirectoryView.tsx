import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import { Employee } from '@/types';
import {
  Users, Search, Filter, Plus, Phone, Mail, MapPin,
  Star, MessageSquare, ExternalLink, ShieldCheck, Check,
  X, Briefcase, ChevronRight, CheckCircle2, UserCheck,
  Building2, PhoneCall
} from 'lucide-react';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';

export const EmployeeDirectoryView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    clockInEmployee,
    addToast,
    openConversationForContact,
    setActiveTab,
  } = useQiyamStore();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_duty' | 'active' | 'on_leave'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    role: 'Field Technician',
    department: 'AC Services',
    phone: '+91 ',
    email: '',
    location: 'Kozhikode, Kerala',
    branch: 'Calicut Central HQ',
    shift: '9:00 AM – 6:00 PM',
    blood_group: 'O+',
    emergency_contact_name: '',
    emergency_contact_phone: '+91 ',
    status: 'active',
  });

  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filteredEmployees = employees.filter((emp) => {
    if (selectedDept !== 'all' && emp.department !== selectedDept) return false;
    if (statusFilter !== 'all' && emp.status !== statusFilter) return false;
    const q = search.toLowerCase().trim();
    if (q) {
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.employee_id_str.toLowerCase().includes(q) ||
        emp.phone.includes(q) ||
        emp.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name?.trim()) {
      addToast('Please enter employee name', 'warning');
      return;
    }
    await addEmployee(newEmployee);
    setIsAddModalOpen(false);
    setNewEmployee({
      name: '',
      role: 'Field Technician',
      department: 'AC Services',
      phone: '+91 ',
      email: '',
      location: 'Kozhikode, Kerala',
      branch: 'Calicut Central HQ',
      shift: '9:00 AM – 6:00 PM',
      blood_group: 'O+',
      emergency_contact_name: '',
      emergency_contact_phone: '+91 ',
      status: 'active',
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Employee Directory"
        subtitle="Complete staff contact list, department roster, and direct phone/WhatsApp calling."
        activeSubTab="ops-emp-directory"
        primaryActionLabel="Add New Staff"
        onPrimaryAction={() => setIsAddModalOpen(true)}
        badgeCount={`${filteredEmployees.length} Staff`}
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total Staff Members</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{employees.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Across {departments.length - 1} departments</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Currently On Duty</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {employees.filter((e) => e.status === 'on_duty').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active on field / duty</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">In Office / Active</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {employees.filter((e) => e.status === 'active').length}
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5">Support & coordination</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">On Leave</div>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {employees.filter((e) => e.status === 'on_leave').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Approved time-off</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, role, ID, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                All ({employees.length})
              </button>
              <button
                onClick={() => setStatusFilter('on_duty')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'on_duty' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                On Duty ({employees.filter((e) => e.status === 'on_duty').length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'active' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Active ({employees.filter((e) => e.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('on_leave')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'on_leave' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                On Leave ({employees.filter((e) => e.status === 'on_leave').length})
              </button>
            </div>

            {/* Department Selector */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs font-bold' : ''}`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : ''}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Directory Content */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => {
              const isOnDuty = emp.status === 'on_duty';
              const isOnLeave = emp.status === 'on_leave';

              return (
                <div
                  key={emp.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
                            {emp.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          {isOnDuty && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {emp.name}
                          </h3>
                          <div className="text-[11px] text-slate-500 font-medium">{emp.role}</div>
                          <span className="text-[10px] font-mono text-slate-400">{emp.employee_id_str}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isOnDuty
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isOnLeave
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnDuty ? 'bg-emerald-500' : isOnLeave ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        {emp.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Department:</span>
                        <span className="font-semibold text-slate-800">{emp.department}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Phone:</span>
                        <a href={`tel:${emp.phone}`} className="font-mono font-medium text-slate-800 hover:text-emerald-600">
                          {emp.phone}
                        </a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">City / Location:</span>
                        <span className="text-slate-700 truncate max-w-[160px]">{emp.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Customer Rating:</span>
                        <span className="font-bold text-amber-500">{emp.rating} ⭐</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() =>
                        openConversationForContact({
                          name: emp.name,
                          phone: emp.phone,
                          service: `Staff: ${emp.role}`,
                          skipConfirmation: true,
                        })
                      }
                      className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Open WhatsApp Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <a
                      href={`tel:${emp.phone}`}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Direct Phone Call"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                      <span>Call</span>
                    </a>

                    <button
                      onClick={() => setActiveTab('ops-emp-profiles')}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="View ID Card & Details"
                    >
                      <span>ID Card</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Staff Name & ID</th>
                  <th className="p-3.5">Role & Dept</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Duty Status</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{emp.employee_id_str}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{emp.role}</div>
                      <div className="text-[10px] text-slate-400">{emp.department}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">{emp.phone}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          emp.status === 'on_duty'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : emp.status === 'on_leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {emp.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{emp.location}</td>
                    <td className="p-3.5 font-bold text-amber-500">{emp.rating} ⭐</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            openConversationForContact({
                              name: emp.name,
                              phone: emp.phone,
                              service: `Staff: ${emp.role}`,
                              skipConfirmation: true,
                            })
                          }
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
                          title="WhatsApp Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`tel:${emp.phone}`}
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg"
                          title="Phone Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Staff Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Job Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Field Technician"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department</label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="AC Services">AC Services</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Support">Support</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mobile Phone *</label>
                  <CountryPhoneInput
                    value={newEmployee.phone}
                    onChange={(val) => setNewEmployee({ ...newEmployee, phone: val })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@qiyam.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Kozhikode, Kerala"
                    value={newEmployee.location}
                    onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assigned Branch HQ</label>
                  <input
                    type="text"
                    placeholder="e.g. Calicut Central HQ"
                    value={newEmployee.branch}
                    onChange={(e) => setNewEmployee({ ...newEmployee, branch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                  <select
                    value={newEmployee.blood_group}
                    onChange={(e) => setNewEmployee({ ...newEmployee, blood_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Shift Timings</label>
                  <input
                    type="text"
                    placeholder="09:00 AM – 06:00 PM"
                    value={newEmployee.shift}
                    onChange={(e) => setNewEmployee({ ...newEmployee, shift: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

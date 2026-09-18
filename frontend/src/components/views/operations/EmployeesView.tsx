import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Employee } from '@/types';
import {
  Users, Search, Filter, Plus, Phone, Mail, MapPin,
  Star, CheckCircle2, Clock, Calendar, Award, X,
  LogOut, MessageSquare, ExternalLink, ShieldCheck,
  Briefcase, Smartphone, Edit3, Check, ChevronRight,
  TrendingUp, AlertCircle
} from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    attendance,
    clockInEmployee,
    addEmployee,
    updateEmployee,
    addToast,
    setActiveTab,
    openConversationForContact,
    globalFilter,
  } = useQiyamStore();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_duty' | 'active' | 'on_leave'>('all');

  // Selected employee for Profile Drawer
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | number | null>(null);

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<{
    name: string;
    role: string;
    department: string;
    phone: string;
    email: string;
    location: string;
    status: 'active' | 'on_duty';
  }>({
    name: '',
    role: 'Field Technician',
    department: 'AC Services',
    phone: '+91 ',
    email: '',
    location: 'Kozhikode, Kerala',
    status: 'active',
  });

  // Assign Task inline state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('02:00 PM');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Active employee object from store (keeps in sync when status changes)
  const activeEmployee = employees.find((e) => e.id === selectedEmployeeId) || null;

  // Filtered list
  const filtered = employees.filter((e) => {
    if (selectedDept !== 'all' && e.department !== selectedDept) return false;
    if (globalFilter.status && globalFilter.status !== 'all') {
      if (globalFilter.status === 'open' && e.status !== 'on_duty' && e.status !== 'active') return false;
      if (['on_duty', 'active', 'on_leave', 'inactive'].includes(globalFilter.status) && e.status !== globalFilter.status) return false;
    } else if (statusFilter !== 'all' && e.status !== statusFilter) {
      return false;
    }
    const q = (search || globalFilter.query || '').toLowerCase();
    if (q) {
      return (
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.employee_id_str.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        e.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Departments list for filter
  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))];

  // Handle Add Employee Submit
  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name.trim()) {
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
      status: 'active',
    });
  };

  // Handle Adding a task/schedule to employee
  const handleAssignTask = async (emp: Employee) => {
    if (!newTaskText.trim()) return;
    const updatedSchedule = [
      ...(emp.today_schedule || []),
      {
        time: newTaskTime || '02:00 PM',
        task: newTaskText,
        location: emp.location || 'Kozhikode',
        status: 'upcoming' as const,
      }
    ];
    await updateEmployee(emp.id, { today_schedule: updatedSchedule });
    setNewTaskText('');
    setIsAddingTask(false);
    addToast(`New assignment added for ${emp.name}`, 'success');
  };

  // Find attendance record for selected employee
  const employeeAttendance = activeEmployee
    ? attendance.find((a) => a.employee_id_str === activeEmployee.employee_id_str)
    : null;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans relative">
      <Header
        title="Employee Management"
        subtitle="Manage field technicians, support staff, performance ratings, and shifts."
        primaryActionLabel="Add Employee"
        onPrimaryAction={() => setIsAddModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total Staff</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{employees.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 truncate">Across {departments.length - 1} depts</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">On Duty (Field)</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {employees.filter((e) => e.status === 'on_duty').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">GPS Tracking active</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">On-Time Rate</div>
            <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">
              {employees.length > 0
                ? (employees.reduce((acc, e) => acc + (Number(e.on_time_percent) || 0), 0) / employees.length).toFixed(1)
                : '96.0'}%
            </div>
            <div className="text-[11px] text-purple-600 mt-0.5">
              {employees.reduce((acc, e) => acc + (Number(e.jobs_completed_month) || 0), 0)} jobs this month
            </div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Avg. Rating</div>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
              {employees.length > 0
                ? (employees.reduce((acc, e) => acc + (Number(e.rating) || 0), 0) / employees.length).toFixed(1)
                : '4.8'}{' '}
              ⭐
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Performance rating</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff, role, ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 scrollbar-none">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                All ({employees.length})
              </button>
              <button
                onClick={() => setStatusFilter('on_duty')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'on_duty' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                On Duty ({employees.filter((e) => e.status === 'on_duty').length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'active' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Active ({employees.filter((e) => e.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('on_leave')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'on_leave' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                On Leave ({employees.filter((e) => e.status === 'on_leave').length})
              </button>
            </div>

            {/* Department Selector */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          {filtered.map((emp) => {
            const isOnDuty = emp.status === 'on_duty';
            const isOnLeave = emp.status === 'on_leave';

            return (
              <div
                key={emp.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      title="Click to view full profile"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition-all">
                          {emp.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        {isOnDuty && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                          {emp.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-medium">{emp.role}</div>
                        <span className="text-[10px] font-mono text-slate-400">{emp.employee_id_str}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isOnDuty
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOnLeave
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isOnDuty ? 'bg-emerald-500' : isOnLeave ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      {emp.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800">{emp.department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Phone:</span>
                      <a
                        href={`tel:${emp.phone}`}
                        className="font-mono text-slate-700 hover:text-emerald-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {emp.phone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rating:</span>
                      <span className="font-bold text-amber-500">{emp.rating} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jobs Completed (Month):</span>
                      <span className="font-bold text-emerald-600">{emp.jobs_completed_month} jobs</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Dynamic Clock In / Clock Out Button */}
                  <button
                    onClick={() => clockInEmployee(emp.id)}
                    className={`flex-1 py-2 px-3 rounded-xl font-semibold shadow-sm text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isOnDuty
                        ? 'bg-slate-800 hover:bg-red-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    title={isOnDuty ? "Click to Clock Out" : "Click to Check In"}
                  >
                    {isOnDuty ? (
                      <>
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Clock Out</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Check In / Clock</span>
                      </>
                    )}
                  </button>

                  {/* Profile Button - Opens Profile Drawer */}
                  <button
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-1 border border-slate-200/80 cursor-pointer"
                    title="View full employee profile and performance analytics"
                  >
                    <span>Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No employees match your search</h3>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER EMPLOYEE PROFILE DRAWER                                       */}
      {/* ========================================================================= */}
      {activeEmployee && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedEmployeeId(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto font-sans transition-transform duration-300">
            {/* Drawer Header */}
            <div className="p-6 bg-[#0B1528] text-white border-b border-slate-800 relative shrink-0">
              <button
                onClick={() => setSelectedEmployeeId(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-2xl text-white shadow-lg ring-4 ring-white/10">
                    {activeEmployee.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  {activeEmployee.status === 'on_duty' && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0B1528] animate-pulse" />
                  )}
                </div>

                <div className="flex-1 pr-6">
                  <h3 className="text-lg font-bold text-white leading-snug">{activeEmployee.name}</h3>
                  <div className="text-xs text-slate-300 font-medium">{activeEmployee.role}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                      {activeEmployee.employee_id_str}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {activeEmployee.department}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeEmployee.status === 'on_duty'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : activeEmployee.status === 'on_leave'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {activeEmployee.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Communication & Duty Action Bar */}
              <div className="grid grid-cols-3 gap-2.5 mt-5">
                <button
                  onClick={() => {
                    openConversationForContact({
                      name: activeEmployee.name,
                      phone: activeEmployee.phone,
                      service: `Staff: ${activeEmployee.role} (${activeEmployee.department})`,
                      skipConfirmation: true,
                    });
                    setSelectedEmployeeId(null);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                  title="Open direct WhatsApp chat with employee"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <a
                  href={`tel:${activeEmployee.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Staff</span>
                </a>

                <button
                  onClick={() => clockInEmployee(activeEmployee.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold shadow transition cursor-pointer ${
                    activeEmployee.status === 'on_duty'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {activeEmployee.status === 'on_duty' ? (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Clock Out</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Clock In</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs">
              {/* Performance & Quality Metrics */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Performance & Quality Score
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Customer Rating</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{activeEmployee.rating} / 5.0</div>
                    <div className="text-[10px] text-emerald-600 mt-0.5">Top 10% technician</div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Completed Jobs</span>
                      <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{activeEmployee.jobs_completed_month}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">During current month</div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">On-Time Arrival</span>
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-xl font-bold text-purple-600 mt-1">{activeEmployee.on_time_percent}%</div>
                    <div className="text-[10px] text-purple-600 mt-0.5">High reliability</div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Base Station</span>
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1 truncate">{activeEmployee.location}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">GPS Tracking active</div>
                  </div>
                </div>
              </div>

              {/* Attendance & Shift Status */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Attendance & Shift Details
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Today's Shift:</span>
                    <span className="font-semibold text-slate-800">
                      {employeeAttendance ? employeeAttendance.shift : '09:00 AM – 06:00 PM (Regular)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Punch In / Check In:</span>
                    <span className="font-semibold text-emerald-700">
                      {employeeAttendance ? employeeAttendance.check_in : (activeEmployee.status === 'on_duty' ? '09:12 AM (On time)' : 'Not checked in yet')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Punch Out / Check Out:</span>
                    <span className="font-semibold text-slate-800">
                      {employeeAttendance?.check_out || (activeEmployee.status === 'on_duty' ? 'Currently on field duty' : 'Shift ended')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Punch Device / Verification:</span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{employeeAttendance?.device || 'Mobile GPS (Geo-verified)'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Schedule & Job Assignments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Today's Job Assignments & Schedule
                  </h4>
                  <button
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingTask ? 'Cancel' : 'Assign Job'}</span>
                  </button>
                </div>

                {/* Inline Add Task Form */}
                {isAddingTask && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-3 space-y-2">
                    <div className="font-semibold text-emerald-900 text-xs">Assign Task or Work Order</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. AC Filter Replacement at Beach Road"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="flex-1 bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        placeholder="Time"
                        className="w-24 bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleAssignTask(activeEmployee)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-sm transition cursor-pointer"
                    >
                      Confirm Assignment
                    </button>
                  </div>
                )}

                {/* Schedule List */}
                <div className="space-y-2">
                  {activeEmployee.today_schedule && activeEmployee.today_schedule.length > 0 ? (
                    activeEmployee.today_schedule.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{item.task}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{item.time}</span>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
                      <div>No jobs scheduled for this staff today.</div>
                      <button
                        onClick={() => setIsAddingTask(true)}
                        className="mt-2 text-emerald-600 font-semibold hover:underline cursor-pointer"
                      >
                        Click to assign first job
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Contact Information & Official Records
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone Number:</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-800">{activeEmployee.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address:</span>
                    </span>
                    <span className="font-medium text-slate-800">{activeEmployee.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned Territory:</span>
                    </span>
                    <span className="font-medium text-slate-800">{activeEmployee.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  const newLeaveStatus = activeEmployee.status === 'on_leave' ? 'active' : 'on_leave';
                  clockInEmployee(activeEmployee.id, newLeaveStatus);
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
              >
                {activeEmployee.status === 'on_leave' ? 'Resume from Leave' : 'Mark On Leave'}
              </button>

              <button
                onClick={() => setSelectedEmployeeId(null)}
                className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW EMPLOYEE MODAL                                                   */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 max-h-[92dvh] overflow-y-auto font-sans border border-slate-200">
            <div className="p-4 sm:p-5 bg-[#0B1528] text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-base">Add New Employee</h3>
                <p className="text-xs text-slate-400">Onboard a field technician or support staff member</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm sm:text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-sm sm:text-xs"
                  >
                    <option value="AC Services">AC Services</option>
                    <option value="Support">Support</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role / Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Field Technician"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm sm:text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">WhatsApp / Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-sm sm:text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@qiyam.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm sm:text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Base Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. Kozhikode, Kerala"
                  value={newEmployee.location}
                  onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm sm:text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Initial Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newEmployee.status === 'active'}
                      onChange={() => setNewEmployee({ ...newEmployee, status: 'active' })}
                    />
                    <span>Active (Off Duty)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newEmployee.status === 'on_duty'}
                      onChange={() => setNewEmployee({ ...newEmployee, status: 'on_duty' })}
                    />
                    <span>On Duty (Immediate Clock In)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



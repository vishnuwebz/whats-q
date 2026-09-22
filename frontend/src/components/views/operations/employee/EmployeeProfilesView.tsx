import React, { useState, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import { Employee } from '@/types';
import {
  User, Phone, Mail, MapPin, Calendar, ShieldCheck,
  Edit3, Printer, Download, CheckCircle2, AlertCircle,
  Building2, Heart, Award, Star, ChevronRight, X, PenTool,
  Plus, Trash2, Clock, Briefcase, Activity, Check, FileText
} from 'lucide-react';

export const EmployeeProfilesView: React.FC = () => {
  const { employees, updateEmployee, addEmployee, deleteEmployee, addToast, openPdfEditor } = useQiyamStore();

  const [selectedEmpId, setSelectedEmpId] = useState<string | number>(employees[0]?.id || 1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editTab, setEditTab] = useState<'job' | 'contact' | 'emergency' | 'performance'>('job');
  const [addTab, setAddTab] = useState<'job' | 'contact' | 'emergency' | 'performance'>('job');

  const selectedEmployee = employees.find((e) => String(e.id) === String(selectedEmpId)) || employees[0];

  // Comprehensive Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    employee_id_str: '',
    role: '',
    department: '',
    status: 'active' as Employee['status'],
    phone: '',
    email: '',
    location: '',
    branch: '',
    joining_date: '',
    shift: '',
    blood_group: 'O+',
    emergency_contact_name: '',
    emergency_contact_relation: '',
    emergency_contact_phone: '',
    address: '',
    rating: 5.0,
    jobs_completed_month: 0,
    on_time_percent: 100,
  });

  // Comprehensive Add form state
  const initialAddFormState = {
    name: '',
    employee_id_str: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
    role: 'Field Technician',
    department: 'AC Services',
    status: 'active' as Employee['status'],
    phone: '+91 ',
    email: '',
    location: 'Kozhikode, Kerala',
    branch: 'Calicut Central HQ',
    joining_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    shift: '9:00 AM – 6:00 PM',
    blood_group: 'O+',
    emergency_contact_name: '',
    emergency_contact_relation: 'Family / Relative',
    emergency_contact_phone: '+91 ',
    address: '',
    rating: 5.0,
    jobs_completed_month: 0,
    on_time_percent: 100,
  };
  const [addForm, setAddForm] = useState(initialAddFormState);

  // Synchronize form when selected employee changes
  useEffect(() => {
    if (selectedEmployee) {
      setEditForm({
        name: selectedEmployee.name || '',
        employee_id_str: selectedEmployee.employee_id_str || '',
        role: selectedEmployee.role || '',
        department: selectedEmployee.department || '',
        status: selectedEmployee.status || 'active',
        phone: selectedEmployee.phone || '',
        email: selectedEmployee.email || '',
        location: selectedEmployee.location || '',
        branch: selectedEmployee.branch || 'Calicut Central HQ',
        joining_date: selectedEmployee.joining_date || '15 March 2023',
        shift: selectedEmployee.shift || '9:00 AM – 6:00 PM',
        blood_group: selectedEmployee.blood_group || 'O+',
        emergency_contact_name: selectedEmployee.emergency_contact_name || '',
        emergency_contact_relation: selectedEmployee.emergency_contact_relation || 'Family / Relative',
        emergency_contact_phone: selectedEmployee.emergency_contact_phone || '',
        address: selectedEmployee.address || '',
        rating: selectedEmployee.rating ?? 4.8,
        jobs_completed_month: selectedEmployee.jobs_completed_month ?? 20,
        on_time_percent: selectedEmployee.on_time_percent ?? 96,
      });
    }
  }, [selectedEmployee]);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmpId(emp.id);
  };

  const handleOpenEditModal = () => {
    if (selectedEmployee) {
      setEditForm({
        name: selectedEmployee.name || '',
        employee_id_str: selectedEmployee.employee_id_str || '',
        role: selectedEmployee.role || '',
        department: selectedEmployee.department || '',
        status: selectedEmployee.status || 'active',
        phone: selectedEmployee.phone || '',
        email: selectedEmployee.email || '',
        location: selectedEmployee.location || '',
        branch: selectedEmployee.branch || 'Calicut Central HQ',
        joining_date: selectedEmployee.joining_date || '15 March 2023',
        shift: selectedEmployee.shift || '9:00 AM – 6:00 PM',
        blood_group: selectedEmployee.blood_group || 'O+',
        emergency_contact_name: selectedEmployee.emergency_contact_name || '',
        emergency_contact_relation: selectedEmployee.emergency_contact_relation || 'Family / Relative',
        emergency_contact_phone: selectedEmployee.emergency_contact_phone || '',
        address: selectedEmployee.address || '',
        rating: selectedEmployee.rating ?? 4.8,
        jobs_completed_month: selectedEmployee.jobs_completed_month ?? 20,
        on_time_percent: selectedEmployee.on_time_percent ?? 96,
      });
      setEditTab('job');
      setIsEditModalOpen(true);
    }
  };

  const handleOpenAddModal = () => {
    setAddForm({
      ...initialAddFormState,
      employee_id_str: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
    });
    setAddTab('job');
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    await updateEmployee(selectedEmployee.id, editForm);
    setIsEditModalOpen(false);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      addToast('Please enter the employee full name', 'warning');
      return;
    }
    const created = await addEmployee(addForm);
    if (created?.id) {
      setSelectedEmpId(created.id);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    const name = selectedEmployee.name;
    await deleteEmployee(selectedEmployee.id);
    setIsDeleteConfirmOpen(false);
    if (employees.length > 1) {
      const remaining = employees.filter((e) => String(e.id) !== String(selectedEmployee.id));
      if (remaining[0]) {
        setSelectedEmpId(remaining[0].id);
      }
    }
  };

  const handlePrintIdCard = () => {
    if (!selectedEmployee) return;
    openPdfEditor({
      type: 'id_card',
      title: `Digital ID Card - ${selectedEmployee.name}`,
      recipientName: selectedEmployee.name,
      recipientRole: selectedEmployee.role,
      recipientId: selectedEmployee.employee_id_str,
      recipientPhone: selectedEmployee.phone,
      department: selectedEmployee.department,
      bloodGroup: selectedEmployee.blood_group || 'O+',
      emergencyPhone: selectedEmployee.emergency_contact_phone || '+91 94471 10045',
      emergencyName: selectedEmployee.emergency_contact_name || 'Emergency Contact',
      shift: selectedEmployee.shift || '9:00 AM – 6:00 PM',
      branch: selectedEmployee.branch || 'Calicut Central HQ',
      validTill: '31 Dec 2026',
      avatarInitials: selectedEmployee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      avatarUrl: selectedEmployee.avatar_url || '',
      companyName: 'QIYAM BUSINESS OS',
      companyAddress: `${selectedEmployee.branch || 'Calicut Central HQ'} • Kozhikode, Kerala`,
    });
  };

  if (!selectedEmployee && employees.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans p-8 text-center text-slate-500">
        <EmployeeSharedHeader
          title="Employee Profiles & ID Cards"
          subtitle="Staff personal details, emergency contacts, blood group, and digital employee ID cards."
          activeSubTab="ops-emp-profiles"
          primaryActionLabel="Add First Staff"
          primaryActionIcon={Plus}
          onPrimaryAction={handleOpenAddModal}
        />
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No Staff Profiles Found</h3>
          <p className="text-xs text-slate-500">Get started by creating your first employee profile in the database.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Staff Profile</span>
          </button>
        </div>
      </div>
    );
  }

  const bloodGroup = selectedEmployee?.blood_group || 'O+';
  const emergencyContactName = selectedEmployee?.emergency_contact_name || 'Emergency Contact';
  const emergencyContactRelation = selectedEmployee?.emergency_contact_relation || 'Family / Relative';
  const emergencyContactPhone = selectedEmployee?.emergency_contact_phone || '+91 94471 10045';
  const branchName = selectedEmployee?.branch || 'Calicut Central HQ';
  const joiningDateStr = selectedEmployee?.joining_date || '15 March 2023';
  const shiftHoursStr = selectedEmployee?.shift || '9:00 AM – 6:00 PM';
  const addressStr = selectedEmployee?.address || selectedEmployee?.location || 'Cyberpark Calicut, Kozhikode, Kerala';

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Employee Profiles & ID Cards"
        subtitle="Staff personal details, emergency contacts, blood group, and digital employee ID cards."
        activeSubTab="ops-emp-profiles"
        primaryActionLabel="Print ID Card"
        primaryActionIcon={Printer}
        onPrimaryAction={handlePrintIdCard}
        badgeCount={selectedEmployee?.name || 'Staff Profile'}
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Staff List (Selector) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Select Staff Member ({employees.length})
              </h3>
              <button
                onClick={handleOpenAddModal}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Add New Staff Member"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Staff</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {employees.map((emp) => {
                const isSelected = String(emp.id) === String(selectedEmployee?.id);
                return (
                  <button
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border border-emerald-300 shadow-xs'
                        : 'bg-slate-50/70 hover:bg-slate-100/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-xs shadow-2xs">
                        {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">{emp.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{emp.role}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-400">{emp.employee_id_str}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-200/60 text-slate-600">
                            {emp.blood_group || 'O+'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Staff Profile & ID Card Preview */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-2xl text-white shadow-md">
                    {selectedEmployee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedEmployee.role} • {selectedEmployee.department}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {selectedEmployee.employee_id_str}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                        selectedEmployee.status === 'on_duty'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : selectedEmployee.status === 'on_leave'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : selectedEmployee.status === 'inactive'
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {selectedEmployee.status === 'on_duty' ? '🟢 On Duty' : selectedEmployee.status === 'on_leave' ? '🟡 On Leave' : selectedEmployee.status === 'inactive' ? '⚪ Inactive' : '🔵 Active / In Office'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                        Verified Staff
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={handleOpenEditModal}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold flex items-center cursor-pointer transition-colors"
                    title="Delete Staff Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Contact & Address */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 mb-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Contact & Address
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Mobile Phone:</span>
                    <a href={`tel:${selectedEmployee.phone}`} className="font-semibold text-slate-800 font-mono hover:text-emerald-600">
                      {selectedEmployee.phone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Email Address:</span>
                    <span className="text-slate-800 font-medium">{selectedEmployee.email || 'None registered'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">City / Location:</span>
                    <span className="text-slate-800 font-medium">{selectedEmployee.location}</span>
                  </div>
                  <div className="flex justify-between items-start pt-1">
                    <span className="text-slate-400">Full Address:</span>
                    <span className="text-slate-800 font-medium text-right max-w-[210px] truncate" title={addressStr}>
                      {addressStr}
                    </span>
                  </div>
                </div>

                {/* Emergency & Medical */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 mb-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-600" />
                      Emergency & Medical
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Blood Group:</span>
                    <span className="font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200 shadow-2xs font-mono">
                      {bloodGroup}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Emergency Contact:</span>
                    <span className="font-semibold text-slate-800">
                      {emergencyContactName} ({emergencyContactRelation})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <a href={`tel:${emergencyContactPhone}`} className="font-mono font-semibold text-slate-800 hover:text-rose-600">
                      {emergencyContactPhone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400">Medical Status:</span>
                    <span className="text-emerald-700 font-medium">Fit for Duty ✔</span>
                  </div>
                </div>

                {/* Job & Branch Information */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 mb-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      Job & Branch Information
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Assigned Branch:</span>
                    <span className="font-semibold text-slate-800">{branchName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Joining Date:</span>
                    <span className="text-slate-800">{joiningDateStr}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Shift Timings:</span>
                    <span className="font-semibold text-emerald-700">{shiftHoursStr}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-800 font-medium">{selectedEmployee.department}</span>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 mb-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Performance Summary
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Customer Rating:</span>
                    <span className="font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 inline" />
                      {selectedEmployee.rating} (Top Rated)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Jobs Completed (Month):</span>
                    <span className="font-bold text-emerald-600">{selectedEmployee.jobs_completed_month} jobs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">On-Time Arrival:</span>
                    <span className="font-semibold text-purple-600">{selectedEmployee.on_time_percent}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400">Verification:</span>
                    <span className="text-emerald-700 font-medium">Identity & Police Clear ✔</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital ID Card Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Official Digital ID Card</h3>
                  <p className="text-xs text-slate-400">Real-time printable photo identification card for staff</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openPdfEditor({
                        type: 'id_card',
                        title: `Digital ID Card - ${selectedEmployee.name}`,
                        recipientName: selectedEmployee.name,
                        recipientRole: selectedEmployee.role,
                        recipientId: selectedEmployee.employee_id_str,
                        recipientPhone: selectedEmployee.phone,
                        department: selectedEmployee.department,
                        bloodGroup: bloodGroup,
                        emergencyPhone: emergencyContactPhone,
                        emergencyName: emergencyContactName,
                        shift: shiftHoursStr,
                        branch: branchName,
                        validTill: '31 Dec 2026',
                        avatarInitials: selectedEmployee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
                        avatarUrl: selectedEmployee.avatar_url || '',
                        companyName: 'QIYAM BUSINESS OS',
                        companyAddress: `${branchName} • Kozhikode, Kerala`,
                      });
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>✏️ Edit in PDF Editor</span>
                  </button>
                  <button
                    onClick={handlePrintIdCard}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Card</span>
                  </button>
                </div>
              </div>

              {/* Printable Card Layout */}
              <div className="max-w-sm mx-auto bg-gradient-to-br from-slate-900 via-[#0B1528] to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 space-y-4 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-xs shadow-sm">
                      Q
                    </div>
                    <div>
                      <div className="font-bold text-xs tracking-wider">QIYAM BUSINESS OS</div>
                      <div className="text-[9px] text-emerald-400 font-mono">STAFF IDENTITY CARD</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {selectedEmployee.employee_id_str}
                  </span>
                </div>

                <div className="flex items-center gap-4 py-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-2xl text-white shadow-lg ring-2 ring-white/20">
                    {selectedEmployee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-base text-white">{selectedEmployee.name}</div>
                    <div className="text-xs text-emerald-400 font-medium">{selectedEmployee.role}</div>
                    <div className="text-[10px] text-slate-400">{selectedEmployee.department} • {branchName}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block">Mobile:</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedEmployee.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Blood Group:</span>
                    <span className="text-red-400 font-bold font-mono">{bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Shift Timing:</span>
                    <span className="text-slate-200 font-medium">{shiftHoursStr}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Emergency No:</span>
                    <span className="font-mono text-slate-200">{emergencyContactPhone}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-700/80 text-[9px] text-slate-400">
                  <span>Authorised Signature: ✔ Verified</span>
                  <span className="font-mono text-emerald-400">{branchName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Staff Profile</h3>
                <p className="text-xs text-slate-400">
                  Updating: <span className="font-semibold text-slate-700">{selectedEmployee?.name}</span> ({selectedEmployee?.employee_id_str})
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEditTab('job')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  editTab === 'job'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Job & Role</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('contact')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  editTab === 'contact'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact & Location</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('emergency')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  editTab === 'emergency'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Emergency & Blood Group</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('performance')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  editTab === 'performance'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span>Performance Stats</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Tab 1: Job & Role */}
              {editTab === 'job' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Employee ID Code *</label>
                      <input
                        type="text"
                        required
                        value={editForm.employee_id_str}
                        onChange={(e) => setEditForm({ ...editForm, employee_id_str: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Job Role / Designation</label>
                      <input
                        type="text"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Department</label>
                      <select
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="AC Services">AC Services</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Support">Support</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Management">Management</option>
                        <option value="Logistics">Logistics</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Assigned Branch / Location HQ</label>
                      <input
                        type="text"
                        value={editForm.branch}
                        onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                        placeholder="e.g. Calicut Central HQ"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Employment Duty Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Employee['status'] })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="active">Active (Office / Normal)</option>
                        <option value="on_duty">On Duty (Field / Dispatched)</option>
                        <option value="on_leave">On Leave (Approved Time-off)</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Joining Date</label>
                      <input
                        type="text"
                        value={editForm.joining_date}
                        onChange={(e) => setEditForm({ ...editForm, joining_date: e.target.value })}
                        placeholder="e.g. 15 March 2023"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Shift Timings</label>
                      <input
                        type="text"
                        value={editForm.shift}
                        onChange={(e) => setEditForm({ ...editForm, shift: e.target.value })}
                        placeholder="e.g. 09:00 AM – 06:00 PM"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Contact & Location */}
              {editTab === 'contact' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Mobile Phone *</label>
                      <input
                        type="text"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+91 90000 11123"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="staff@qiyam.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">City / Home Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g. Kozhikode, Kerala"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Full Residential Address / Notes</label>
                    <textarea
                      rows={2}
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="Building, street, landmark, pincode..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Emergency & Blood Group */}
              {editTab === 'emergency' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Blood Group *</label>
                      <select
                        value={editForm.blood_group}
                        onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="A+">A+ (A Positive)</option>
                        <option value="A-">A- (A Negative)</option>
                        <option value="B+">B+ (B Positive)</option>
                        <option value="B-">B- (B Negative)</option>
                        <option value="O+">O+ (O Positive)</option>
                        <option value="O-">O- (O Negative)</option>
                        <option value="AB+">AB+ (AB Positive)</option>
                        <option value="AB-">AB- (AB Negative)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Phone *</label>
                      <input
                        type="text"
                        value={editForm.emergency_contact_phone}
                        onChange={(e) => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })}
                        placeholder="+91 94471 10045"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={editForm.emergency_contact_name}
                        onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })}
                        placeholder="e.g. Suresh Sharma"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Relationship</label>
                      <input
                        type="text"
                        value={editForm.emergency_contact_relation}
                        onChange={(e) => setEditForm({ ...editForm, emergency_contact_relation: e.target.value })}
                        placeholder="e.g. Family / Relative, Spouse, Father"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Performance Stats */}
              {editTab === 'performance' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Customer Rating (0.0 – 5.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Jobs Completed (Month)</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.jobs_completed_month}
                        onChange={(e) => setEditForm({ ...editForm, jobs_completed_month: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">On-Time Arrival (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.on_time_percent}
                        onChange={(e) => setEditForm({ ...editForm, on_time_percent: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Data persists automatically to Django backend database
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save to Database</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Staff Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Staff Member</h3>
                <p className="text-xs text-slate-400">Create a new staff profile that persists immediately in the database.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAddTab('job')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  addTab === 'job'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Job & Role</span>
              </button>
              <button
                type="button"
                onClick={() => setAddTab('contact')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  addTab === 'contact'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact & Location</span>
              </button>
              <button
                type="button"
                onClick={() => setAddTab('emergency')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  addTab === 'emergency'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Emergency & Blood Group</span>
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              {/* Add Tab 1: Job & Role */}
              {addTab === 'job' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={addForm.name}
                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Employee ID Code *</label>
                      <input
                        type="text"
                        required
                        value={addForm.employee_id_str}
                        onChange={(e) => setAddForm({ ...addForm, employee_id_str: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Job Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Field Technician"
                        value={addForm.role}
                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Department</label>
                      <select
                        value={addForm.department}
                        onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="AC Services">AC Services</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Support">Support</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Management">Management</option>
                        <option value="Logistics">Logistics</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Assigned Branch / Location HQ</label>
                      <input
                        type="text"
                        placeholder="e.g. Calicut Central HQ"
                        value={addForm.branch}
                        onChange={(e) => setAddForm({ ...addForm, branch: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Duty Status</label>
                      <select
                        value={addForm.status}
                        onChange={(e) => setAddForm({ ...addForm, status: e.target.value as Employee['status'] })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="active">Active (Office / Normal)</option>
                        <option value="on_duty">On Duty (Field / Dispatched)</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Joining Date</label>
                      <input
                        type="text"
                        value={addForm.joining_date}
                        onChange={(e) => setAddForm({ ...addForm, joining_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Shift Timings</label>
                      <input
                        type="text"
                        value={addForm.shift}
                        onChange={(e) => setAddForm({ ...addForm, shift: e.target.value })}
                        placeholder="09:00 AM – 06:00 PM"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Add Tab 2: Contact & Location */}
              {addTab === 'contact' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Mobile Phone *</label>
                      <input
                        type="text"
                        required
                        placeholder="+91 98765 43210"
                        value={addForm.phone}
                        onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="ramesh@qiyam.com"
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">City / Home Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Kozhikode, Kerala"
                      value={addForm.location}
                      onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Residential Address</label>
                    <textarea
                      rows={2}
                      placeholder="Building, street, landmark..."
                      value={addForm.address}
                      onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Add Tab 3: Emergency & Blood Group */}
              {addTab === 'emergency' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Blood Group *</label>
                      <select
                        value={addForm.blood_group}
                        onChange={(e) => setAddForm({ ...addForm, blood_group: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="A+">A+ (A Positive)</option>
                        <option value="A-">A- (A Negative)</option>
                        <option value="B+">B+ (B Positive)</option>
                        <option value="B-">B- (B Negative)</option>
                        <option value="O+">O+ (O Positive)</option>
                        <option value="O-">O- (O Negative)</option>
                        <option value="AB+">AB+ (AB Positive)</option>
                        <option value="AB-">AB- (AB Negative)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Phone</label>
                      <input
                        type="text"
                        placeholder="+91 94471 00000"
                        value={addForm.emergency_contact_phone}
                        onChange={(e) => setAddForm({ ...addForm, emergency_contact_phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Relative or Guardian"
                        value={addForm.emergency_contact_name}
                        onChange={(e) => setAddForm({ ...addForm, emergency_contact_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Relationship</label>
                      <input
                        type="text"
                        placeholder="e.g. Spouse / Relative"
                        value={addForm.emergency_contact_relation}
                        onChange={(e) => setAddForm({ ...addForm, emergency_contact_relation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  New employee record will be saved permanently to database
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create & Save Staff</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Staff Profile?</h3>
                <p className="text-xs text-slate-500">This action will remove the record from the database.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete profile for <span className="font-semibold text-slate-900">{selectedEmployee.name}</span> ({selectedEmployee.employee_id_str})?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import { Employee } from '@/types';
import {
  User, Phone, Mail, MapPin, Calendar, ShieldCheck,
  Edit3, Printer, Download, CheckCircle2, AlertCircle,
  Building2, Heart, Award, Star, ChevronRight, X, PenTool
} from 'lucide-react';

export const EmployeeProfilesView: React.FC = () => {
  const { employees, updateEmployee, addToast, openPdfEditor } = useQiyamStore();

  const [selectedEmpId, setSelectedEmpId] = useState<string | number>(employees[0]?.id || 1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: selectedEmployee?.name || '',
    role: selectedEmployee?.role || '',
    department: selectedEmployee?.department || '',
    phone: selectedEmployee?.phone || '',
    email: selectedEmployee?.email || '',
    location: selectedEmployee?.location || '',
  });

  // Keep form updated when selected employee changes
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmpId(emp.id);
    setEditForm({
      name: emp.name,
      role: emp.role,
      department: emp.department,
      phone: emp.phone,
      email: emp.email,
      location: emp.location,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    await updateEmployee(selectedEmployee.id, editForm);
    setIsEditModalOpen(false);
    addToast(`Profile updated for ${editForm.name}`, 'success');
  };

  const handlePrintIdCard = () => {
    window.print();
  };

  if (!selectedEmployee) {
    return (
      <div className="p-8 text-center text-slate-500">
        No employees found. Add employees in the Employee Directory first.
      </div>
    );
  }

  // Simulated Indian HR profile details for rich display
  const bloodGroup = ['O+', 'B+', 'A+', 'AB+', 'O+'][Number(selectedEmployee.id) % 5] || 'O+';
  const emergencyContact = {
    name: 'Suresh ' + selectedEmployee.name.split(' ')[1] || 'Kumar',
    relation: 'Family / Relative',
    phone: '+91 94471 ' + (10000 + Number(selectedEmployee.id) * 45).toString().slice(0, 5),
  };
  const joiningDate = `15 March 202${(Number(selectedEmployee.id) % 3) + 2}`;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Employee Profiles & ID Cards"
        subtitle="Staff personal details, emergency contacts, blood group, and digital employee ID cards."
        activeSubTab="ops-emp-profiles"
        primaryActionLabel="Print ID Card"
        primaryActionIcon={Printer}
        onPrimaryAction={handlePrintIdCard}
        badgeCount={selectedEmployee.name}
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Staff List (Selector) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Select Staff Member ({employees.length})
              </h3>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {employees.map((emp) => {
                const isSelected = emp.id === selectedEmployee.id;
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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-xs">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-500">{emp.role}</div>
                        <div className="text-[10px] font-mono text-slate-400">{emp.employee_id_str}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
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
                    {selectedEmployee.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">{selectedEmployee.role} • {selectedEmployee.department}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {selectedEmployee.employee_id_str}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Verified Staff
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Contact & Address
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile Phone:</span>
                    <span className="font-semibold text-slate-800 font-mono">{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email Address:</span>
                    <span className="text-slate-800">{selectedEmployee.email || 'None registered'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Home City / Location:</span>
                    <span className="text-slate-800 font-medium">{selectedEmployee.location}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Emergency & Medical
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Group:</span>
                    <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {bloodGroup}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Contact:</span>
                    <span className="font-semibold text-slate-800">{emergencyContact.name} ({emergencyContact.relation})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-mono text-slate-800">{emergencyContact.phone}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Job & Branch Information
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Branch:</span>
                    <span className="font-semibold text-slate-800">Calicut Central HQ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Joining Date:</span>
                    <span className="text-slate-800">{joiningDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shift Timings:</span>
                    <span className="font-semibold text-emerald-700">9:00 AM – 6:00 PM</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Performance Summary
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer Rating:</span>
                    <span className="font-bold text-amber-500">{selectedEmployee.rating} ⭐ (Very Good)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jobs Completed (Month):</span>
                    <span className="font-bold text-emerald-600">{selectedEmployee.jobs_completed_month} jobs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">On-Time Arrival:</span>
                    <span className="font-semibold text-purple-600">{selectedEmployee.on_time_percent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital ID Card Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Official Digital ID Card</h3>
                  <p className="text-xs text-slate-400">Ready to print or show on mobile screen</p>
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
                      });
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>✏️ Edit in PDF Editor</span>
                  </button>
                  <button
                    onClick={handlePrintIdCard}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-xs">
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
                    {selectedEmployee.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-base text-white">{selectedEmployee.name}</div>
                    <div className="text-xs text-emerald-400 font-medium">{selectedEmployee.role}</div>
                    <div className="text-[10px] text-slate-400">{selectedEmployee.department}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block">Mobile:</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedEmployee.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Blood Group:</span>
                    <span className="text-red-400 font-bold">{bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Valid Till:</span>
                    <span className="text-slate-200">31 Dec 2026</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Emergency No:</span>
                    <span className="font-mono text-slate-200">{emergencyContact.phone}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-700/80 text-[9px] text-slate-400">
                  <span>Authorised Signature: ✔ Verified</span>
                  <span className="font-mono text-emerald-400">HQ • Kozhikode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Staff Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Role</label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">City / Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

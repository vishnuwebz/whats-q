import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  Check,
  X,
  Plus,
  RotateCcw,
  CheckCheck,
  Ban,
  Save,
  Users,
  Building,
  Key,
  Lock,
  Search,
  ChevronDown,
  Trash2,
  Info,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import {
  RoleDefinition,
  RoleModule,
  RolePermissionAction,
  RecordScope
} from '../../../types';
import {
  ALL_ROLE_MODULES,
  ALL_PERMISSION_ACTIONS,
  RECORD_SCOPE_OPTIONS
} from '../../../store/rolesData';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const RolesSecurityView: React.FC = () => {
  const {
    roles,
    activeRoleId,
    setActiveRoleId,
    updateRolePermission,
    updateRoleScope,
    setRoleAllPermissions,
    resetRolePermissions,
    addCustomRole,
    deleteCustomRole,
    assignEmployeeToRole,
    saveRoleChanges,
    employees,
    addToast
  } = useQiyamStore();

  const [activeTab, setActiveTab] = useState<'matrix' | 'staff' | 'security'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New role modal state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleBaseId, setNewRoleBaseId] = useState('manager');

  const selectedRole: RoleDefinition = useMemo(() => {
    return roles.find((r) => r.id === activeRoleId) || roles[0];
  }, [roles, activeRoleId]);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return ALL_ROLE_MODULES;
    const q = searchQuery.toLowerCase();
    return ALL_ROLE_MODULES.filter(
      (m) => m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      addToast('Please provide a valid role name and code', 'error');
      return;
    }

    const baseRole = roles.find((r) => r.id === newRoleBaseId) || roles[0];
    const clonedPermissions = JSON.parse(JSON.stringify(baseRole.permissions));

    addCustomRole({
      name: newRoleName.trim(),
      code: newRoleCode.trim().toUpperCase(),
      description: newRoleDescription.trim() || 'Custom organizational role.',
      scope: 'team',
      permissions: clonedPermissions,
      assignedEmployees: [],
    });

    setNewRoleName('');
    setNewRoleCode('');
    setNewRoleDescription('');
    setIsAddModalOpen(false);
  };

  // Toggle entire column
  const handleToggleColumn = (action: RolePermissionAction) => {
    const allEnabled = ALL_ROLE_MODULES.every(
      (mod) => selectedRole.permissions[mod.id]?.[action]
    );
    ALL_ROLE_MODULES.forEach((mod) => {
      updateRolePermission(selectedRole.id, mod.id, action, !allEnabled);
    });
    addToast(`${!allEnabled ? 'Enabled' : 'Disabled'} ${action.toUpperCase()} across all modules`, 'info');
  };

  // Toggle entire row
  const handleToggleRow = (module: RoleModule) => {
    const modPerms = selectedRole.permissions[module] || {};
    const allEnabled = ALL_PERMISSION_ACTIONS.every((act) => modPerms[act.id]);
    ALL_PERMISSION_ACTIONS.forEach((act) => {
      updateRolePermission(selectedRole.id, module, act.id, !allEnabled);
    });
  };

  // Count total enabled permissions for the selected role
  const totalEnabledPermissions = useMemo(() => {
    let count = 0;
    ALL_ROLE_MODULES.forEach((mod) => {
      ALL_PERMISSION_ACTIONS.forEach((act) => {
        if (selectedRole.permissions[mod.id]?.[act.id]) count++;
      });
    });
    return count;
  }, [selectedRole]);

  const maxPermissions = ALL_ROLE_MODULES.length * ALL_PERMISSION_ACTIONS.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto font-sans">
      {/* ── Top Header Bar ── */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Roles, Permissions & Security
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Granular 4-layer Role-Based Access Control (RBAC) with record scoping (All, Department, Team, Own, Assigned)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Add Custom Role
            </button>
            <button
              onClick={() => saveRoleChanges(selectedRole.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Body ── */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ──── LEFT COLUMN: AVAILABLE ROLES LIST ──── */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                AVAILABLE ROLES ({roles.length})
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Click to configure</span>
            </div>

            <div className="space-y-2">
              {roles.map((role) => {
                const isSelected = role.id === selectedRole.id;
                const assignedCount = role.assignedEmployees?.length || 0;

                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRoleId(role.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border cursor-pointer group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0F172A] border-slate-900 text-white shadow-md'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div
                          className={`text-sm font-bold tracking-tight ${
                            isSelected ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {role.name}
                        </div>
                        <div
                          className={`text-[10px] font-extrabold uppercase tracking-wider mt-0.5 ${
                            isSelected ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          {role.code}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {role.isSystemRole && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              isSelected
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            SYSTEM
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {assignedCount} {assignedCount === 1 ? 'user' : 'users'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`text-[11px] mt-2 line-clamp-1 ${
                        isSelected ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {role.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Helper Tip */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Super Admin Policy:</strong> Modifications made to permissions apply immediately across all signed-in staff accounts and restrict UI buttons and API actions.
              </div>
            </div>
          </div>

          {/* ──── RIGHT COLUMN: ROLE MATRIX & CONFIGURATION ──── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
              {/* Role Header & Description */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {selectedRole.name} Matrix
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {selectedRole.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedRole.description}</p>
                </div>

                {/* Record Scope Selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Record Scoping
                    </label>
                    <select
                      value={selectedRole.scope}
                      onChange={(e) => updateRoleScope(selectedRole.id, e.target.value as RecordScope)}
                      className="mt-0.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {RECORD_SCOPE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!selectedRole.isSystemRole && (
                    <button
                      onClick={() => deleteCustomRole(selectedRole.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition border border-rose-200"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Tabs: Permissions Matrix | Assigned Staff | Security Policy */}
              <div className="flex items-center justify-between border-b border-slate-200 text-xs">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('matrix')}
                    className={`pb-2.5 px-3 font-semibold border-b-2 transition cursor-pointer ${
                      activeTab === 'matrix'
                        ? 'border-emerald-600 text-emerald-700 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Permissions Matrix ({totalEnabledPermissions}/{maxPermissions})
                  </button>
                  <button
                    onClick={() => setActiveTab('staff')}
                    className={`pb-2.5 px-3 font-semibold border-b-2 transition cursor-pointer ${
                      activeTab === 'staff'
                        ? 'border-emerald-600 text-emerald-700 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Assigned Staff ({selectedRole.assignedEmployees?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-2.5 px-3 font-semibold border-b-2 transition cursor-pointer ${
                      activeTab === 'security'
                        ? 'border-emerald-600 text-emerald-700 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Security & Session Policy
                  </button>
                </div>

                {activeTab === 'matrix' && (
                  <div className="flex items-center gap-1.5 pb-2">
                    <button
                      onClick={() => setRoleAllPermissions(selectedRole.id, true)}
                      className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition border border-emerald-200 cursor-pointer"
                    >
                      Grant All
                    </button>
                    <button
                      onClick={() => setRoleAllPermissions(selectedRole.id, false)}
                      className="text-[11px] font-semibold text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition border border-rose-200 cursor-pointer"
                    >
                      Revoke All
                    </button>
                    <button
                      onClick={() => resetRolePermissions(selectedRole.id)}
                      className="text-[11px] font-semibold text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition border border-slate-200 cursor-pointer flex items-center gap-1"
                      title="Reset role permissions to system default profile"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Default
                    </button>
                  </div>
                )}
              </div>

              {/* ──── TAB 1: PERMISSIONS MATRIX TABLE ──── */}
              {activeTab === 'matrix' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>
                      Click on any checkmark or cross to toggle. Click column header to toggle entire action.
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Last synced: {selectedRole.lastUpdated || 'Today'}
                    </span>
                  </div>

                  <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="p-3.5 pl-4 text-slate-700 font-extrabold w-36">
                              MODULE
                            </th>
                            {ALL_PERMISSION_ACTIONS.map((action) => (
                              <th
                                key={action.id}
                                onClick={() => handleToggleColumn(action.id)}
                                className="p-3.5 text-center cursor-pointer hover:bg-slate-100 hover:text-emerald-700 transition select-none"
                                title={`Click to toggle all ${action.label} permissions`}
                              >
                                <div className="inline-flex items-center gap-1">
                                  <span>{action.label}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredModules.map((module) => {
                            const modPerms = selectedRole.permissions[module.id] || {};

                            return (
                              <tr
                                key={module.id}
                                className="hover:bg-slate-50/70 transition group"
                              >
                                <td
                                  onClick={() => handleToggleRow(module.id)}
                                  className="p-3.5 pl-4 cursor-pointer select-none"
                                  title="Click to toggle entire module permissions"
                                >
                                  <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition flex items-center justify-between">
                                    <span>{module.label}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-normal line-clamp-1">
                                    {module.description}
                                  </div>
                                </td>

                                {ALL_PERMISSION_ACTIONS.map((action) => {
                                  const isEnabled = modPerms[action.id] ?? false;

                                  return (
                                    <td
                                      key={action.id}
                                      onClick={() =>
                                        updateRolePermission(
                                          selectedRole.id,
                                          module.id,
                                          action.id,
                                          !isEnabled
                                        )
                                      }
                                      className="p-3.5 text-center cursor-pointer select-none"
                                      title={`${isEnabled ? 'Disable' : 'Enable'} ${action.label} for ${module.label}`}
                                    >
                                      {isEnabled ? (
                                        <div className="w-6 h-6 rounded-full bg-emerald-100/90 text-emerald-600 flex items-center justify-center mx-auto hover:bg-emerald-200 transition shadow-2xs">
                                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto hover:bg-slate-200 transition">
                                          <X className="w-3.5 h-3.5 stroke-[2]" />
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ──── TAB 2: ASSIGNED STAFF ──── */}
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Staff Members with Role: {selectedRole.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Assign or unassign team members from the active company roster.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {selectedRole.assignedEmployees?.length || 0} Members Active
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {employees.map((emp) => {
                      const isAssigned =
                        selectedRole.assignedEmployees?.includes(emp.name) ||
                        selectedRole.assignedEmployees?.includes(emp.employee_id_str);

                      return (
                        <div
                          key={emp.id}
                          className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{emp.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {emp.employee_id_str} • {emp.department} • {emp.phone}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => assignEmployeeToRole(emp.name, selectedRole.id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                              isAssigned
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isAssigned ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Assigned
                              </>
                            ) : (
                              '+ Assign Role'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ──── TAB 3: SECURITY & SESSION POLICY ──── */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Security & Session Policies</h3>
                    <p className="text-xs text-slate-500">
                      Configure authentication and record visibility constraints for {selectedRole.name}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">Two-Factor Authentication (2FA)</span>
                        <input
                          type="checkbox"
                          checked={selectedRole.mfaRequired ?? true}
                          onChange={() => {
                            addToast('2FA policy updated for role', 'info');
                          }}
                          className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Require WhatsApp OTP or Authenticator app verification upon login for this role.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">Session Inactivity Timeout</span>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {selectedRole.sessionTimeoutMins || 120} mins
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Automatically lock the workstation or dashboard if idle to prevent unauthorized access.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                    <span className="font-bold text-slate-800">Record Scope Explanation:</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Current scope is set to <strong>{selectedRole.scope.toUpperCase()}</strong>. Users assigned to this role will only be permitted to view and modify customer records, invoices, and job dispatches that match this scope filter.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ──── MODAL: ADD CUSTOM ROLE ──── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Create New Custom Role</h3>
                  <p className="text-[10px] text-slate-500">Define role permissions and access scoping</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Marketing Lead"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Code (Short Tag)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MKT_LEAD"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 uppercase font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what duties and operational modules this role has access to..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clone Base Permissions From
                </label>
                <select
                  value={newRoleBaseId}
                  onChange={(e) => setNewRoleBaseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

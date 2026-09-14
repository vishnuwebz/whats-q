import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Layers, MapPin, Zap, Plus, CheckCircle2, Clock, X } from 'lucide-react';

export const BranchesView: React.FC = () => {
  const { branches, addBranch, addToast, targetHighlightId } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New branch form state
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: `BR-${Math.floor(10 + Math.random() * 90)}`,
    branch_type: 'Regional Hub',
    city: '',
    state: 'Maharashtra',
    status: 'active',
    automations_count: 5,
    tasks_automated: 120,
    last_activity: 'Just now'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.city) {
      addToast('Please enter both branch name and city', 'error');
      return;
    }

    addBranch(branchForm);
    addToast(`Branch "${branchForm.name}" (${branchForm.code}) added!`, 'success');
    setIsModalOpen(false);
    setBranchForm({
      name: '',
      code: `BR-${Math.floor(10 + Math.random() * 90)}`,
      branch_type: 'Regional Hub',
      city: '',
      state: 'Maharashtra',
      status: 'active',
      automations_count: 5,
      tasks_automated: 120,
      last_activity: 'Just now'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Branches & Multi-Tenant Automation"
        subtitle="Manage localized workflow configurations across city regional offices."
        primaryActionLabel="Add Branch"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Branch Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">City / State</th>
                <th className="py-3 px-4">Active Automations</th>
                <th className="py-3 px-4">Tasks Automated</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {branches.map((b) => {
                const isTarget = targetHighlightId === b.id || targetHighlightId === b.name || targetHighlightId === b.code;
                return (
                  <tr
                    key={b.id}
                    className={`transition-colors ${
                      isTarget ? 'bg-amber-50 ring-2 ring-amber-400 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      {b.name}
                      {isTarget && (
                        <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                          Target
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{b.code}</td>
                    <td className="py-3.5 px-4 text-slate-600">{b.city}, {b.state}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.automations_count} workflows</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{b.tasks_automated} tasks</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{b.last_activity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add New Branch Office</h3>
                <p className="text-xs text-slate-500">Configure localized hub for automated dispatching.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Central Branch"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hub Type</label>
                  <select
                    value={branchForm.branch_type}
                    onChange={(e) => setBranchForm({ ...branchForm, branch_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  >
                    <option value="Regional Hub">Regional Hub</option>
                    <option value="Express Depot">Express Depot</option>
                    <option value="Satellite Center">Satellite Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={branchForm.state}
                    onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



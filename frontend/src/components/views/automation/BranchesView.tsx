import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Layers, MapPin, Zap, Plus, CheckCircle2, Clock } from 'lucide-react';

export const BranchesView: React.FC = () => {
  const { branches, addToast } = useQiyamStore();

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Branches & Multi-Tenant Automation"
        subtitle="Manage localized workflow configurations across city regional offices."
        primaryActionLabel="Add Branch"
        onPrimaryAction={() => addToast('Add new branch office modal opened', 'info')}
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
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.name}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



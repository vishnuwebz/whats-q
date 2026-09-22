import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  Sparkles, Award, Gift, IndianRupee, Star,
  CheckCircle2, Plus, Fuel, Heart, Clock, X
} from 'lucide-react';

interface StaffRewardRecord {
  id: string | number;
  employee_id_str: string;
  name: string;
  reward_title: string;
  reward_type: 'bonus' | 'fuel_perk' | 'award' | 'festival';
  amount: number;
  date_str: string;
  reason: string;
  status: 'disbursed' | 'processing';
}

const INITIAL_REWARDS: StaffRewardRecord[] = [
  {
    id: 1,
    employee_id_str: 'EMP-006',
    name: 'Sneha Joshi',
    reward_title: 'Star Worker of the Month',
    reward_type: 'award',
    amount: 5000,
    date_str: '31 May 2024',
    reason: 'Highest job completion rate (56 jobs) and 99% punctuality score.',
    status: 'disbursed',
  },
  {
    id: 2,
    employee_id_str: 'EMP-001',
    name: 'Amit Sharma',
    reward_title: 'Monthly Fuel Allowance Perk',
    reward_type: 'fuel_perk',
    amount: 2000,
    date_str: '28 May 2024',
    reason: 'Field bike petrol allowance for 28 customer site visits in Kozhikode.',
    status: 'disbursed',
  },
  {
    id: 3,
    employee_id_str: 'EMP-003',
    name: 'Rahul Singh',
    reward_title: '100% Punctuality Spot Bonus',
    reward_type: 'bonus',
    amount: 1000,
    date_str: '25 May 2024',
    reason: 'Zero late arrivals for 4 consecutive weeks in Vadakara branch.',
    status: 'disbursed',
  },
];

export const EmployeeRewardsView: React.FC = () => {
  const { employees, addToast } = useQiyamStore();

  const [rewards, setRewards] = useState<StaffRewardRecord[]>(INITIAL_REWARDS);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  // Form state
  const [grantForm, setGrantForm] = useState({
    employee_id_str: employees[0]?.employee_id_str || 'EMP-001',
    reward_title: 'Customer Delight Spot Bonus',
    reward_type: 'bonus' as StaffRewardRecord['reward_type'],
    amount: 1000,
    reason: 'Excellent customer feedback and prompt service completion.',
  });

  const totalDisbursed = rewards.reduce((acc, r) => acc + r.amount, 0);

  const handleGrantReward = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employee_id_str === grantForm.employee_id_str);
    if (!emp) return;

    const newRecord: StaffRewardRecord = {
      id: Date.now(),
      employee_id_str: emp.employee_id_str,
      name: emp.name,
      reward_title: grantForm.reward_title,
      reward_type: grantForm.reward_type,
      amount: Number(grantForm.amount),
      date_str: 'Today',
      reason: grantForm.reason,
      status: 'disbursed',
    };

    setRewards([newRecord, ...rewards]);
    setIsGrantModalOpen(false);
    addToast(`₹${grantForm.amount} reward granted to ${emp.name}! 🎉`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Rewards & Perks"
        subtitle="Employee of the month, cash incentives, petrol allowances, and festival bonuses."
        activeSubTab="ops-emp-rewards"
        primaryActionLabel="Give Bonus / Perk"
        primaryActionIcon={Sparkles}
        onPrimaryAction={() => setIsGrantModalOpen(true)}
        badgeCount={`₹${totalDisbursed.toLocaleString('en-IN')} Given`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Star Worker Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-3xl text-white shadow-inner border border-white/30">
              🏆
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                Star Worker of the Month
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Sneha Joshi (Team Lead)</h2>
              <p className="text-xs text-amber-100 mt-0.5">
                56 Completed Jobs • 99% Punctuality • ₹5,000 Cash Award Disbursed
              </p>
            </div>
          </div>

          <div className="z-10 shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setGrantForm({
                  employee_id_str: 'EMP-006',
                  reward_title: 'Excellence Certificate & Bonus',
                  reward_type: 'award',
                  amount: 2500,
                  reason: 'Special leadership recognition for AC service team.',
                });
                setIsGrantModalOpen(true);
              }}
              className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              Add Extra Bonus
            </button>
          </div>
        </div>

        {/* Available Perks Catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Fuel className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Fuel & Petrol Allowance</div>
            <div className="text-lg font-black text-emerald-600">₹2,000 / mo</div>
            <p className="text-[11px] text-slate-400">Monthly petrol allowance for field technicians</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">100% Punctuality Award</div>
            <div className="text-lg font-black text-purple-600">₹1,000</div>
            <p className="text-[11px] text-slate-400">Zero late punches throughout the entire month</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Customer Delight Bonus</div>
            <div className="text-lg font-black text-amber-600">₹500 / job</div>
            <p className="text-[11px] text-slate-400">Awarded for receiving direct 5-star customer review</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Gift className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Festival Bonus (Eid/Diwali)</div>
            <div className="text-lg font-black text-blue-600">₹2,500</div>
            <p className="text-[11px] text-slate-400">Festive allowance for staff and sweet box</p>
          </div>
        </div>

        {/* Granted Rewards Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Disbursed Bonuses & Perks</h3>
              <p className="text-xs text-slate-400">Total ₹{totalDisbursed.toLocaleString('en-IN')} paid out to staff</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Reward Title</th>
                  <th className="p-3.5">Amount (₹)</th>
                  <th className="p-3.5">Date Granted</th>
                  <th className="p-3.5">Reason / Recognition</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rewards.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{r.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{r.employee_id_str}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {r.reward_title}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-emerald-600 font-mono text-sm">
                      ₹{r.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-slate-600">{r.date_str}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs">{r.reason}</td>
                    <td className="p-3.5 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        DISBURSED ✔
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grant Bonus Modal */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Grant Staff Bonus or Perk</h3>
              <button
                onClick={() => setIsGrantModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantReward} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Staff Member *</label>
                <select
                  value={grantForm.employee_id_str}
                  onChange={(e) => setGrantForm({ ...grantForm, employee_id_str: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employee_id_str}>
                      {emp.name} ({emp.employee_id_str}) - {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Perk / Bonus Title *</label>
                <select
                  value={grantForm.reward_title}
                  onChange={(e) => setGrantForm({ ...grantForm, reward_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Customer Delight Spot Bonus">Customer Delight Spot Bonus (₹500)</option>
                  <option value="100% Punctuality Spot Bonus">100% Punctuality Spot Bonus (₹1,000)</option>
                  <option value="Monthly Fuel Allowance Perk">Monthly Fuel Allowance Perk (₹2,000)</option>
                  <option value="Festival Bonus (Eid/Diwali)">Festival Bonus (Eid/Diwali) (₹2,500)</option>
                  <option value="Star Worker of the Month">Star Worker of the Month Award (₹5,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Rupee Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  step="100"
                  value={grantForm.amount}
                  onChange={(e) => setGrantForm({ ...grantForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason / Recognition Note *</label>
                <textarea
                  rows={2}
                  required
                  value={grantForm.reason}
                  onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Disburse Perk (₹{grantForm.amount})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

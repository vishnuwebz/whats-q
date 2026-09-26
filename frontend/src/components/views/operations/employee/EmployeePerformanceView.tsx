import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  Award, Star, ThumbsUp, MessageSquare, Plus,
  TrendingUp, CheckCircle2, User, Search, Filter, X
} from 'lucide-react';

interface StaffReview {
  id: string | number;
  employee_id_str: string;
  employee_name: string;
  customer_name: string;
  service: string;
  rating: number;
  review_text: string;
  date_str: string;
  review_type: 'customer' | 'manager';
}

const INITIAL_REVIEWS: StaffReview[] = [
  {
    id: 1,
    employee_id_str: 'EMP-001',
    employee_name: 'Amit Sharma',
    customer_name: 'Zameel Ahmed',
    service: 'AC Deep Clean & Gas Refill',
    rating: 5.0,
    review_text: 'Arrived exactly at 10:00 AM. Very polite technician and cleaned the room completely after servicing the AC. Cooling is super fast now!',
    date_str: '30 May 2024',
    review_type: 'customer',
  },
  {
    id: 2,
    employee_id_str: 'EMP-006',
    employee_name: 'Sneha Joshi',
    customer_name: 'Operations Manager',
    service: 'Monthly Team Leadership Review',
    rating: 4.9,
    review_text: 'Led the Kozhikode AC service team with 99% on-time resolution rate this month. Excellent coordination on WhatsApp.',
    date_str: '29 May 2024',
    review_type: 'manager',
  },
  {
    id: 3,
    employee_id_str: 'EMP-003',
    employee_name: 'Rahul Singh',
    customer_name: 'Dr. Hashim V',
    service: 'Bathroom Pipeline Leakage Repair',
    rating: 4.8,
    review_text: 'Solved emergency pipe leak within 45 minutes in Vadakara. Very fair spare parts pricing and prompt work.',
    date_str: '28 May 2024',
    review_type: 'customer',
  },
  {
    id: 4,
    employee_id_str: 'EMP-005',
    employee_name: 'Arjun Nair',
    customer_name: 'Fathima Noor',
    service: 'Main MCB & Inverter Wiring Fix',
    rating: 4.7,
    review_text: 'Quickly identified short circuit in the electrical panel. Safe and clean work.',
    date_str: '27 May 2024',
    review_type: 'customer',
  },
];

export const EmployeePerformanceView: React.FC = () => {
  const { employees, updateEmployee, addToast } = useQiyamStore();

  const [reviews, setReviews] = useState<StaffReview[]>(INITIAL_REVIEWS);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // New review form
  const [newReview, setNewReview] = useState({
    employee_id_str: employees[0]?.employee_id_str || 'EMP-001',
    rating: 5,
    review_text: '',
    reviewer: 'Branch Manager',
  });

  const avgRating =
    employees.length > 0
      ? (employees.reduce((acc, e) => acc + (Number(e.rating) || 0), 0) / employees.length).toFixed(1)
      : '4.8';

  const sortedLeaderboard = [...employees].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employee_id_str === newReview.employee_id_str);
    if (!emp) return;

    const review: StaffReview = {
      id: Date.now(),
      employee_id_str: emp.employee_id_str,
      employee_name: emp.name,
      customer_name: newReview.reviewer,
      service: `Manager Monthly Review`,
      rating: Number(newReview.rating),
      review_text: newReview.review_text || 'Very satisfactory performance and great work ethic.',
      date_str: 'Today',
      review_type: 'manager',
    };

    setReviews([review, ...reviews]);
    setIsReviewModalOpen(false);
    addToast(`Review submitted for ${emp.name}`, 'success');
  };

  const filteredReviews = reviews.filter((r) => {
    const q = search.toLowerCase().trim();
    if (q) {
      return (
        (r.employee_name || '').toLowerCase().includes(q) ||
        (r.customer_name || '').toLowerCase().includes(q) ||
        (r.review_text || '').toLowerCase().includes(q) ||
        (r.service || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Performance & Reviews"
        subtitle="Customer star ratings, verified job reviews, top performer leaderboard, and manager assessments."
        activeSubTab="ops-emp-performance"
        primaryActionLabel="Add Manager Review"
        primaryActionIcon={Star}
        onPrimaryAction={() => setIsReviewModalOpen(true)}
        badgeCount={`${avgRating} ⭐ Avg`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Average Staff Rating</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{avgRating} ⭐</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Top 5% customer satisfaction</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total Customer Reviews</div>
            <div className="text-2xl font-black text-slate-900 mt-1">142 Reviews</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Verified after completed jobs</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">5-Star Feedback Rate</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">94.2%</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Rated 4.5 or higher</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Top Performer of Month</div>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {sortedLeaderboard[0]?.name.split(' ')[0] || 'Sneha'}
            </div>
            <div className="text-[11px] text-purple-600 mt-0.5">
              {sortedLeaderboard[0]?.rating || 4.9} ⭐ ({sortedLeaderboard[0]?.jobs_completed_month || 56} jobs)
            </div>
          </div>
        </div>

        {/* Top Leaderboard Strip */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Top Staff Leaderboard (By Customer Rating)</span>
              </h3>
              <p className="text-xs text-slate-400">Based on punctuality, job quality, and customer star reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedLeaderboard.slice(0, 3).map((emp, index) => {
              const medal = index === 0 ? '🥇 1st Place' : index === 1 ? '🥈 2nd Place' : '🥉 3rd Place';
              const medalColor = index === 0 ? 'text-amber-600 bg-amber-50 border-amber-200' : index === 1 ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-orange-700 bg-orange-50 border-orange-200';

              return (
                <div key={emp.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-xs">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-500">{emp.role}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${medalColor}`}>
                      {medal}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Customer Rating</span>
                      <span className="font-bold text-amber-500">{emp.rating} ⭐</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Jobs This Month</span>
                      <span className="font-bold text-emerald-700">{emp.jobs_completed_month} Jobs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Reviews & Feedback Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Customer & Manager Reviews</h3>
              <p className="text-xs text-slate-400">Direct feedback collected via WhatsApp and supervisor checks</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-64 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{rev.employee_name}</div>
                    <div className="text-[11px] text-slate-500">Service: {rev.service}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-xs text-amber-700">{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed italic">
                  "{rev.review_text}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Reviewed by: <strong className="text-slate-700">{rev.customer_name}</strong></span>
                  <span>{rev.date_str}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Manager Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Staff Performance Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Staff Member *</label>
                <select
                  value={newReview.employee_id_str}
                  onChange={(e) => setNewReview({ ...newReview, employee_id_str: e.target.value })}
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
                <label className="block text-slate-600 font-semibold mb-1">Performance Star Rating (1 - 5) *</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5.0 - Outstanding)</option>
                  <option value={4}>⭐⭐⭐⭐ (4.0 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3.0 - Satisfactory)</option>
                  <option value={2}>⭐⭐ (2.0 - Needs Improvement)</option>
                  <option value={1}>⭐ (1.0 - Unsatisfactory)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Manager Review / Feedback Note *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Excellent attention to customer queries, punctuality has improved significantly."
                  value={newReview.review_text}
                  onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Save Performance Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Job } from '@/types';
import {
  Briefcase, Search, Filter, Plus, Calendar, Clock, MapPin,
  CheckCircle2, AlertTriangle, User, MoreVertical, X, Phone,
  FileText, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';

export const JobsView: React.FC = () => {
  const {
    jobs,
    employees,
    updateJobStatus,
    addJob,
    addToast,
    setActiveTab,
    targetHighlightId,
    globalFilter,
  } = useQiyamStore();

  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    job_id_str: `JOB-${1025 + jobs.length}`,
    customer_name: '',
    phone: '',
    service: 'AC Split Deep Cleaning & Gas Refill',
    assigned_to: 'Amit Sharma',
    date_str: 'Today',
    time_str: '02:00 PM',
    priority: 'high' as Job['priority'],
    status: 'scheduled' as Job['status'],
    location: 'Kozhikode City, Beach Road',
    amount: 3200,
    advance_paid: 1000,
    payment_status: 'advance_paid' as Job['payment_status'],
  });

  React.useEffect(() => {
    if (targetHighlightId) {
      const match = jobs.find(
        (j) => j.job_id_str === targetHighlightId || String(j.id) === String(targetHighlightId)
      );
      if (match) {
        setSelectedJob(match);
        setIsDetailsOpen(true);
        setActiveStatus('all');
      }
    }
  }, [targetHighlightId, jobs]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.customer_name.trim()) return;
    const created = await addJob(newJobForm);
    setSelectedJob(created);
    setIsAddModalOpen(false);
    setNewJobForm({
      job_id_str: `JOB-${1026 + jobs.length}`,
      customer_name: '',
      phone: '',
      service: 'AC Split Deep Cleaning & Gas Refill',
      assigned_to: 'Amit Sharma',
      date_str: 'Today',
      time_str: '02:00 PM',
      priority: 'high',
      status: 'scheduled',
      location: 'Kozhikode City, Beach Road',
      amount: 3200,
      advance_paid: 1000,
      payment_status: 'advance_paid',
    });
  };

  const filteredJobs = jobs.filter((j) => {
    if (globalFilter.status && globalFilter.status !== 'all') {
      if (globalFilter.status === 'open' && j.status !== 'scheduled') return false;
      if (globalFilter.status === 'in_progress' && j.status !== 'in_progress') return false;
      if (globalFilter.status === 'completed' && j.status !== 'completed') return false;
      if (globalFilter.status === 'overdue' && j.status !== 'overdue') return false;
    } else if (activeStatus !== 'all' && j.status !== activeStatus) {
      return false;
    }
    if (globalFilter.priority && globalFilter.priority !== 'all' && j.priority !== globalFilter.priority) {
      return false;
    }
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        j.job_id_str.toLowerCase().includes(q) ||
        j.customer_name.toLowerCase().includes(q) ||
        j.service.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderJobDetailsContent = () => {
    if (!selectedJob) return null;
    return (
      <>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400">{selectedJob.job_id_str}</span>
            <h3 className="font-bold text-base text-slate-900">{selectedJob.service}</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
            {selectedJob.status}
          </span>
        </div>

        {/* Customer Contact */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
          <div className="font-bold text-slate-900 text-sm">{selectedJob.customer_name}</div>
          <div className="text-slate-500 font-mono">{selectedJob.phone}</div>
          <div className="text-slate-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedJob.location}</span>
          </div>
        </div>

        {/* Payment & Charges Card */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Total Amount:</span>
            <span className="font-black text-slate-900 text-sm">₹{selectedJob.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Advance Paid (30%):</span>
            <span className="font-bold text-emerald-700">₹{selectedJob.advance_paid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Balance Due:</span>
            <span className="font-bold text-amber-700">₹{(selectedJob.amount - selectedJob.advance_paid).toLocaleString()}</span>
          </div>
        </div>

        {/* Lifecycle Timeline */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[10px] text-slate-400">
            Job Lifecycle Timeline
          </h4>
          <div className="space-y-3 pl-2 border-l-2 border-slate-200">
            {selectedJob.timeline && selectedJob.timeline.length > 0 ? (
              selectedJob.timeline.map((step, idx) => (
                <div key={idx} className="relative pl-4">
                  <span
                    className={`w-2.5 h-2.5 rounded-full absolute -left-[1.35rem] top-1 ring-4 ring-white ${
                      step.completed ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <div className="font-bold text-slate-800 text-xs">{step.title}</div>
                  <div className="text-[10px] text-slate-400">{step.timestamp} • {step.by}</div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-xs italic">No timeline recorded yet.</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <button
            onClick={() => updateJobStatus(selectedJob.id, 'completed')}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all text-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Job as Completed</span>
          </button>

          <button
            onClick={() => setActiveTab('ops-routes')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
          >
            <span>View Route on GPS Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-hidden font-sans">
      <Header
        title="Jobs Dispatch"
        subtitle="Manage field technician work orders, scheduling, and on-site job completion."
        primaryActionLabel="New Job Dispatch"
        onPrimaryAction={() => setIsAddModalOpen(true)}
      />

      {/* Filter Tabs & Stats Bar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch sm:items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold overflow-x-auto scrollbar-none whitespace-nowrap py-0.5">
          <button
            onClick={() => setActiveStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveStatus('scheduled')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeStatus === 'scheduled' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Scheduled (31)
          </button>
          <button
            onClick={() => setActiveStatus('in_progress')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeStatus === 'in_progress' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            In Progress (28)
          </button>
          <button
            onClick={() => setActiveStatus('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeStatus === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed (54)
          </button>
          <button
            onClick={() => setActiveStatus('overdue')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeStatus === 'overdue' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overdue (7)
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Active Technicians on Duty: <strong className="text-slate-900">18 / 24</strong>
        </div>
      </div>

      {/* 2-Pane View (Jobs List on Left, Job Details & Timeline on Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List */}
        {/* Left List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isCompleted = job.status === 'completed';
              const isInProgress = job.status === 'in_progress';

              return (
                <div
                  key={job.id}
                  onClick={() => {
                    setSelectedJob(job);
                    setIsDetailsOpen(true);
                  }}
                  className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 ${
                    isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {job.job_id_str}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isInProgress
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {job.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{job.service}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{job.customer_name} ({job.phone})</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="font-bold text-emerald-600 shrink-0 ml-2">₹{job.amount.toLocaleString()}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.assigned_to}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">{job.date_str} • {job.time_str}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Right Details Panel */}
        {selectedJob && (
          <div className="hidden lg:flex w-80 xl:w-96 bg-white border-l border-slate-200 shadow-xl flex-col shrink-0 overflow-y-auto p-5 xl:p-6 space-y-5 text-xs">
            {renderJobDetailsContent()}
          </div>
        )}

        {/* Mobile / Tablet Drawer */}
        {isDetailsOpen && selectedJob && (
          <>
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setIsDetailsOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl flex flex-col p-5 overflow-y-auto space-y-5 text-xs lg:hidden animate-in slide-in-from-right duration-200">
              <div className="flex justify-end pb-1 border-b border-slate-100">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 flex items-center gap-1 font-semibold text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
              {renderJobDetailsContent()}
            </div>
          </>
        )}
      </div>

      {/* New Job Dispatch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">New Field Job Dispatch</h3>
                  <p className="text-[11px] text-slate-500">Assign technician, scheduled time, service requirements, and address.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Job Reference ID</label>
                  <input
                    type="text"
                    value={newJobForm.job_id_str}
                    onChange={(e) => setNewJobForm({ ...newJobForm, job_id_str: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs font-mono font-bold text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newJobForm.customer_name}
                    onChange={(e) => setNewJobForm({ ...newJobForm, customer_name: e.target.value })}
                    placeholder="e.g. Vikram Mehta"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newJobForm.phone}
                    onChange={(e) => setNewJobForm({ ...newJobForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Technician</label>
                  <select
                    value={newJobForm.assigned_to}
                    onChange={(e) => setNewJobForm({ ...newJobForm, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.status === 'on_duty' ? '🟢 On Duty' : '⚪ Active'})
                      </option>
                    ))}
                    {employees.length === 0 && <option value="Amit Sharma">Amit Sharma (Field Lead)</option>}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Service Required</label>
                <input
                  type="text"
                  value={newJobForm.service}
                  onChange={(e) => setNewJobForm({ ...newJobForm, service: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Amount (₹)</label>
                  <input
                    type="number"
                    value={newJobForm.amount}
                    onChange={(e) => setNewJobForm({ ...newJobForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={newJobForm.advance_paid}
                    onChange={(e) => setNewJobForm({ ...newJobForm, advance_paid: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority</label>
                  <select
                    value={newJobForm.priority}
                    onChange={(e) => setNewJobForm({ ...newJobForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Service Location / Landmark</label>
                <input
                  type="text"
                  value={newJobForm.location}
                  onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                  placeholder="e.g. Kozhikode Beach Road near Light House"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm shadow-amber-700/20 cursor-pointer"
                >
                  Dispatch Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



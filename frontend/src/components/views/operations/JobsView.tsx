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
  const { jobs, updateJobStatus, addToast, setActiveTab } = useQiyamStore();
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null);

  const filteredJobs = jobs.filter((j) => {
    if (activeStatus === 'all') return true;
    return j.status === activeStatus;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-hidden font-sans">
      <Header
        title="Jobs Dispatch"
        subtitle="Manage field technician work orders, scheduling, and on-site job completion."
        primaryActionLabel="New Job Dispatch"
        onPrimaryAction={() => addToast('New job dispatch modal opened', 'info')}
      />

      {/* Filter Tabs & Stats Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold">
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isCompleted = job.status === 'completed';
              const isInProgress = job.status === 'in_progress';

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 ${
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
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="font-bold text-emerald-600">₹{job.amount.toLocaleString()}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.assigned_to}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{job.date_str} • {job.time_str}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Job Details Panel (Matching photo_35) */}
        {selectedJob && (
          <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col shrink-0 overflow-y-auto p-6 space-y-6 text-xs">
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
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Job as Completed</span>
              </button>

              <button
                onClick={() => setActiveTab('ops-routes')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <span>View Route on GPS Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



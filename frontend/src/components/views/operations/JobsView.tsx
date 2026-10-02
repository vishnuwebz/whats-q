import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Job } from '@/types';
import { isDateWithinInterval } from '@/utils/dateFilter';
import {
  Briefcase, Search, Filter, Plus, Calendar, Clock, MapPin,
  CheckCircle2, AlertTriangle, User, MoreVertical, X, Phone,
  FileText, ArrowRight, ShieldCheck, ChevronRight, LayoutGrid,
  List, Table as TableIcon
} from 'lucide-react';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';
import { TechnicianSelectDropdown } from '@/components/common/TechnicianSelectDropdown';

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
    globalDateInterval,
  } = useQiyamStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getTechnicianPhone = (techName: string, job?: Job): string => {
    if (job?.assigned_phone) return job.assigned_phone;
    if (!techName) return '';
    const clean = techName.trim().toLowerCase();
    const match = employees.find(
      (e) => e.name.trim().toLowerCase() === clean || clean.includes(e.name.trim().toLowerCase())
    );
    if (match?.phone) return match.phone;
    const DEMO_STAFF_PHONES: Record<string, string> = {
      'habeebu': '+91 80895 64046',
      'amit sharma': '+91 90000 11123',
      'priya sharma': '+91 89213 56789',
      'rahul singh': '+91 98764 11122',
      'neha patel': '+91 96789 11223',
      'arjun nair': '+91 85471 22330',
      'sneha joshi': '+91 96789 66771',
      'sunil joseph': '+91 90321 45000',
      'arshil pk': '+91 80895 64046',
      'arshil': '+91 80895 64046',
    };
    return DEMO_STAFF_PHONES[clean] || '';
  };

  const [newJobForm, setNewJobForm] = useState({
    job_id_str: `JOB-${1025 + jobs.length}`,
    customer_name: '',
    phone: '',
    service: 'AC Split Deep Cleaning & Gas Refill',
    assigned_to: 'Amit Sharma',
    assigned_phone: '+91 90000 11123',
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
      assigned_phone: '+91 90000 11123',
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
    // 1. Date Interval Filtering
    if (!isDateWithinInterval(j.date_str, globalDateInterval)) return false;

    // 2. Status Filtering (Global & Local)
    if (globalFilter.status && globalFilter.status !== 'all') {
      if (globalFilter.status === 'open' && j.status !== 'scheduled') return false;
      if (globalFilter.status === 'in_progress' && j.status !== 'in_progress') return false;
      if (globalFilter.status === 'completed' && j.status !== 'completed') return false;
      if (globalFilter.status === 'overdue' && j.status !== 'overdue') return false;
      if (['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'].includes(globalFilter.status) && j.status !== globalFilter.status) return false;
    } else if (activeStatus !== 'all' && j.status !== activeStatus) {
      return false;
    }

    // 3. Priority Filtering
    if (globalFilter.priority && globalFilter.priority !== 'all' && j.priority !== globalFilter.priority) {
      return false;
    }

    // 4. Keyword Query Filtering
    if (globalFilter.query) {
      const q = globalFilter.query.toLowerCase();
      return (
        j.job_id_str.toLowerCase().includes(q) ||
        j.customer_name.toLowerCase().includes(q) ||
        j.phone.includes(q) ||
        j.service.toLowerCase().includes(q) ||
        j.assigned_to.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderJobDetailsContent = () => {
    if (!selectedJob) return null;
    const assignedPhone = getTechnicianPhone(selectedJob.assigned_to, selectedJob);

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
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Details</span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Verified</span>
          </div>
          <div className="font-bold text-slate-900 text-sm">{selectedJob.customer_name}</div>
          <div className="text-slate-600 font-mono text-xs flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a href={`tel:${selectedJob.phone.replace(/\s+/g, '')}`} className="hover:text-emerald-700 hover:underline">
              {selectedJob.phone}
            </a>
          </div>
          <div className="text-slate-600 flex items-center gap-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{selectedJob.location}</span>
          </div>
        </div>

        {/* Assigned Technician / Staff */}
        <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Assigned Technician</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Field Staff
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {selectedJob.assigned_to.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">{selectedJob.assigned_to}</div>
                <div className="text-slate-600 font-mono text-xs flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                  {assignedPhone ? (
                    <a
                      href={`tel:${assignedPhone.replace(/\s+/g, '')}`}
                      className="hover:text-emerald-700 hover:underline font-semibold text-emerald-800"
                    >
                      {assignedPhone}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No phone registered</span>
                  )}
                </div>
              </div>
            </div>
            {assignedPhone && (
              <a
                href={`tel:${assignedPhone.replace(/\s+/g, '')}`}
                className="p-2 bg-white hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                title="Call Technician"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
              </a>
            )}
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

  const scheduledCount = jobs.filter((j) => j.status === 'scheduled').length;
  const inProgressCount = jobs.filter((j) => j.status === 'in_progress').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const overdueCount = jobs.filter((j) => j.status === 'overdue').length;

  const onDutyTechs = employees.filter((e) => e.status === 'on_duty' || e.status === 'active').length;
  const totalTechs = employees.length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-hidden font-sans">
      <Header
        title="Jobs Dispatch"
        subtitle="Manage field technician work orders, scheduling, and on-site job completion."
        primaryActionLabel="New Job Dispatch"
        onPrimaryAction={() => setIsAddModalOpen(true)}
      />

      {/* Filter Tabs & Stats Bar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row gap-2.5 md:gap-0 items-stretch md:items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold overflow-x-auto scrollbar-none whitespace-nowrap py-0.5">
          <button
            onClick={() => setActiveStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveStatus('scheduled')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeStatus === 'scheduled' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Scheduled ({scheduledCount})
          </button>
          <button
            onClick={() => setActiveStatus('in_progress')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeStatus === 'in_progress' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setActiveStatus('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeStatus === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setActiveStatus('overdue')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeStatus === 'overdue' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overdue ({overdueCount})
          </button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Active Technicians: <strong className="text-slate-900">{onDutyTechs} / {totalTechs}</strong>
          </div>

          {/* View Mode Toggle: Grid / List / Table */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Pane View (Jobs View on Left, Job Details & Timeline on Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3 shadow-2xs">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
              <div className="font-bold text-slate-700 text-sm">No jobs found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no job dispatches matching the selected status or search query. Click "New Job Dispatch" to schedule one.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                + New Job Dispatch
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* 1. Grid View (Cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const isCompleted = job.status === 'completed';
                const isInProgress = job.status === 'in_progress';
                const techPhone = getTechnicianPhone(job.assigned_to, job);

                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      setIsDetailsOpen(true);
                    }}
                    className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-3 ${
                      isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 hover:border-slate-300'
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
                            : job.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
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
                      <div className="font-black text-emerald-600 shrink-0 ml-2">₹{job.amount.toLocaleString()}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-slate-700 truncate min-w-0">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-900 truncate">{job.assigned_to}</span>
                        {techPhone && (
                          <a
                            href={`tel:${techPhone.replace(/\s+/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-mono font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1 shrink-0 transition-colors"
                            title={`Call technician: ${techPhone}`}
                          >
                            <Phone className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{techPhone}</span>
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">{job.date_str} • {job.time_str}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'list' ? (
            /* 2. List View */
            <div className="space-y-2.5">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const techPhone = getTechnicianPhone(job.assigned_to, job);
                const isCompleted = job.status === 'completed';
                const isInProgress = job.status === 'in_progress';

                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      setIsDetailsOpen(true);
                    }}
                    className={`bg-white p-3.5 sm:p-4 rounded-xl border shadow-2xs hover:shadow-sm cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isSelected ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/15' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0 w-20 text-center">
                        <span className="text-[11px] font-mono font-bold text-slate-800">{job.job_id_str}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{job.priority}</span>
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{job.service}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isInProgress
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : job.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {job.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                          <span className="font-semibold text-slate-800">{job.customer_name}</span>
                          <span className="font-mono text-slate-500">({job.phone})</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-slate-500 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <div className="flex items-center md:justify-end gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-bold text-xs text-slate-900">{job.assigned_to}</span>
                        </div>
                        {techPhone ? (
                          <a
                            href={`tel:${techPhone.replace(/\s+/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-mono font-medium text-emerald-700 hover:text-emerald-800 flex items-center md:justify-end gap-1 mt-0.5"
                          >
                            <Phone className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{techPhone}</span>
                          </a>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">No phone</div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-black text-emerald-600 text-sm">₹{job.amount.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-400">{job.date_str} • {job.time_str}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 3. Table View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5 sm:px-4">Job ID</th>
                      <th className="py-3 px-3.5 sm:px-4">Service</th>
                      <th className="py-3 px-3.5 sm:px-4">Customer</th>
                      <th className="py-3 px-3.5 sm:px-4">Assigned Staff & Phone</th>
                      <th className="py-3 px-3.5 sm:px-4">Schedule</th>
                      <th className="py-3 px-3.5 sm:px-4">Location</th>
                      <th className="py-3 px-3.5 sm:px-4">Amount</th>
                      <th className="py-3 px-3.5 sm:px-4">Status</th>
                      <th className="py-3 px-3.5 sm:px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.map((job) => {
                      const isSelected = selectedJob?.id === job.id;
                      const techPhone = getTechnicianPhone(job.assigned_to, job);
                      const isCompleted = job.status === 'completed';
                      const isInProgress = job.status === 'in_progress';

                      return (
                        <tr
                          key={job.id}
                          onClick={() => {
                            setSelectedJob(job);
                            setIsDetailsOpen(true);
                          }}
                          className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/40 ring-1 ring-inset ring-emerald-500' : ''
                          }`}
                        >
                          <td className="py-3 px-3.5 sm:px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {job.job_id_str}
                          </td>
                          <td className="py-3 px-3.5 sm:px-4">
                            <div className="font-bold text-slate-900 max-w-[200px] truncate" title={job.service}>
                              {job.service}
                            </div>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded mt-0.5 inline-block ${
                              job.priority === 'high'
                                ? 'text-red-700 bg-red-50 border border-red-200'
                                : job.priority === 'medium'
                                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                                : 'text-slate-600 bg-slate-100'
                            }`}>
                              {job.priority}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{job.customer_name}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{job.phone}</div>
                          </td>
                          <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{job.assigned_to}</span>
                            </div>
                            {techPhone ? (
                              <a
                                href={`tel:${techPhone.replace(/\s+/g, '')}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[11px] font-mono text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{techPhone}</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No phone</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                            <div className="font-medium text-slate-800">{job.date_str}</div>
                            <div className="text-[11px] text-slate-400">{job.time_str}</div>
                          </td>
                          <td className="py-3 px-3.5 sm:px-4">
                            <div className="flex items-center gap-1 text-slate-600 max-w-[150px] truncate" title={job.location}>
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                            <div className="font-black text-emerald-600 text-sm">₹{job.amount.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400">Adv: ₹{job.advance_paid.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isInProgress
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : job.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {job.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setIsDetailsOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                  <CountryPhoneInput
                    value={newJobForm.phone}
                    onChange={(val) => setNewJobForm({ ...newJobForm, phone: val })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Technician *</label>
                  <TechnicianSelectDropdown
                    value={newJobForm.assigned_to}
                    phoneValue={newJobForm.assigned_phone}
                    onChange={(name, phone) => {
                      setNewJobForm((prev) => ({
                        ...prev,
                        assigned_to: name,
                        assigned_phone: phone,
                      }));
                    }}
                  />
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



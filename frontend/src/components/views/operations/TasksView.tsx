import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  CheckSquare, Clock, User, Plus, Tag, Check, X,
  Edit3, Trash2, AlertCircle, Filter, Download, ListChecks,
  Briefcase, Calendar, ChevronDown, Sparkles, CheckCircle2,
  Search, ArrowUpDown, MoreVertical
} from 'lucide-react';
import { Task } from '@/types';
import { isDateWithinInterval } from '@/utils/dateFilter';
import { exportTableToCsv } from '@/utils/exportCsv';

type StatusFilter = 'all' | 'in_progress' | 'pending' | 'completed' | 'overdue';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

// Predefined Checklist Templates for rapid 1-click creation
const CHECKLIST_TEMPLATES: Record<string, { label: string; icon: string; items: string[] }> = {
  hvac: {
    label: 'HVAC Inspection',
    icon: '❄️',
    items: [
      'Pre-check refrigerant operating pressure & vacuum holding',
      'Compressor amp measurement and terminal tightness check',
      'Airflow CFM & indoor coil delta-T temperature verification',
      'Customer digital signoff on WhatsApp & report handover',
    ],
  },
  electrical: {
    label: 'Electrical QA',
    icon: '⚡',
    items: [
      'Isolate mains voltage and apply Lockout/Tagout (LOTO)',
      'Inspect distribution board busbar terminals & thermal scan',
      'Measure earth loop impedance and ground wire continuity',
      'Phase load balance test and restore main power supply',
    ],
  },
  ductwork: {
    label: 'Duct Sanitization',
    icon: '💨',
    items: [
      'Seal all supply and return ceiling diffusers',
      'Deploy negative air vacuum unit and high-speed rotary brush',
      'Conduct aerosol antimicrobial fogging treatment',
      'Particulate matter laser test and airflow rate signoff',
    ],
  },
  delivery: {
    label: 'Delivery & Setup',
    icon: '📦',
    items: [
      'Verify appliance serial number against original invoice',
      'Unbox, position, and level appliance with vibration pads',
      'Customer demonstration, warranty registration, and run test',
      'Collect signed delivery receipt & photo confirmation',
    ],
  },
};

export const TasksView: React.FC = () => {
  const store = useQiyamStore();
  const {
    tasks,
    toggleTaskChecklist,
    addTask,
    updateTask,
    deleteTask,
    addToast,
    employees,
    jobs,
    globalFilter,
    globalDateInterval,
  } = store;

  // Local View States
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'title' | 'progress'>('due_date');

  // Quick inline add checklist item state for cards: { [taskId]: string }
  const [cardQuickChecklistInput, setCardQuickChecklistInput] = useState<Record<string | number, string>>({});

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | number | null>(null);

  // Form state for Create Modal
  const [createForm, setCreateForm] = useState({
    title: '',
    subtitle: '',
    related_to: 'JOB-1024',
    assignee: 'Amit Sharma',
    priority: 'high' as Task['priority'],
    status: 'in_progress' as Task['status'],
    due_date: 'Today 5:00 PM',
    tags: 'QC, Operations',
    description: '',
    checklist: [
      { id: '1', text: 'Pre-check refrigerant pressure & vacuum holding', completed: false },
      { id: '2', text: 'Compressor amp measurement and electrical test', completed: false },
      { id: '3', text: 'Customer digital signoff & billing confirmation', completed: false },
    ],
    newChecklistText: '',
  });

  // Form state for Edit Modal
  const [editForm, setEditForm] = useState({
    id: '' as string | number,
    title: '',
    subtitle: '',
    related_to: '',
    assignee: '',
    priority: 'high' as Task['priority'],
    status: 'in_progress' as Task['status'],
    due_date: '',
    tags: '',
    description: '',
    checklist: [] as Array<{ id: string; text: string; completed: boolean }>,
    newChecklistText: '',
  });

  // Open Edit Modal and prefill data
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      id: task.id,
      title: task.title,
      subtitle: task.subtitle || '',
      related_to: task.related_to || 'JOB-1024',
      assignee: task.assignee || 'Amit Sharma',
      priority: task.priority || 'high',
      status: task.status || 'in_progress',
      due_date: task.due_date || 'Today 5:00 PM',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
      description: task.description || '',
      checklist: (task.checklist || []).map((c) => ({ ...c })),
      newChecklistText: '',
    });
    setIsEditModalOpen(true);
  };

  // Create Task Submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      addToast('Please enter a task title', 'warning');
      return;
    }

    const tagsArray = createForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await addTask({
      title: createForm.title.trim(),
      subtitle: createForm.subtitle.trim() || 'Field quality check verification',
      related_to: createForm.related_to.trim() || 'JOB-1024',
      assignee: createForm.assignee,
      priority: createForm.priority,
      status: createForm.status,
      due_date: createForm.due_date.trim() || 'Today 5:00 PM',
      tags: tagsArray.length > 0 ? tagsArray : ['QC', 'Operations'],
      description: createForm.description.trim(),
      checklist: createForm.checklist.length > 0 ? createForm.checklist : [
        { id: '1', text: 'Pre-check operational condition', completed: false },
        { id: '2', text: 'Customer handover signoff', completed: false },
      ],
    });

    setIsCreateModalOpen(false);
    // Reset form
    setCreateForm({
      title: '',
      subtitle: '',
      related_to: 'JOB-1024',
      assignee: employees[0]?.name || 'Amit Sharma',
      priority: 'high',
      status: 'in_progress',
      due_date: 'Today 5:00 PM',
      tags: 'QC, Operations',
      description: '',
      checklist: [
        { id: '1', text: 'Pre-check refrigerant pressure & vacuum holding', completed: false },
        { id: '2', text: 'Compressor amp measurement and electrical test', completed: false },
        { id: '3', text: 'Customer digital signoff & billing confirmation', completed: false },
      ],
      newChecklistText: '',
    });
  };

  // Edit Task Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.id) {
      addToast('Task title cannot be empty', 'warning');
      return;
    }

    const tagsArray = editForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await updateTask(editForm.id, {
      title: editForm.title.trim(),
      subtitle: editForm.subtitle.trim(),
      related_to: editForm.related_to.trim(),
      assignee: editForm.assignee,
      priority: editForm.priority,
      status: editForm.status,
      due_date: editForm.due_date.trim(),
      tags: tagsArray,
      description: editForm.description.trim(),
      checklist: editForm.checklist,
    });

    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  // Confirm Delete Task
  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;
    await deleteTask(deletingTaskId);
    setDeletingTaskId(null);
    if (isEditModalOpen && editForm.id === deletingTaskId) {
      setIsEditModalOpen(false);
      setEditingTask(null);
    }
  };

  // Quick Inline Add Checklist item on task card
  const handleQuickAddCardChecklist = async (taskId: string | number) => {
    const text = (cardQuickChecklistInput[taskId] || '').trim();
    if (!text) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newItem = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text,
      completed: false,
    };

    const updatedChecklist = [...(task.checklist || []), newItem];
    await updateTask(taskId, { checklist: updatedChecklist });

    setCardQuickChecklistInput((prev) => ({ ...prev, [taskId]: '' }));
    addToast(`Checklist item added to "${task.title}"`, 'success');
  };

  // Inline delete checklist item from card
  const handleRemoveChecklistItemFromCard = async (taskId: string | number, checklistItemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.filter((c) => c.id !== checklistItemId);
    await updateTask(taskId, { checklist: updatedChecklist });
    addToast('Checklist item removed', 'info');
  };

  // Quick Change Task Status on card
  const handleQuickChangeStatus = async (taskId: string | number, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
  };

  // Create Modal Checklist helpers
  const handleAddCreateChecklistItem = () => {
    const text = createForm.newChecklistText.trim();
    if (!text) return;
    setCreateForm((prev) => ({
      ...prev,
      checklist: [
        ...prev.checklist,
        { id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, text, completed: false },
      ],
      newChecklistText: '',
    }));
  };

  const handleRemoveCreateChecklistItem = (id: string) => {
    setCreateForm((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((c) => c.id !== id),
    }));
  };

  const handleApplyPresetTemplateToCreate = (key: string) => {
    const tpl = CHECKLIST_TEMPLATES[key];
    if (!tpl) return;
    const items = tpl.items.map((text, idx) => ({
      id: `tpl_${Date.now()}_${idx}`,
      text,
      completed: false,
    }));
    setCreateForm((prev) => ({
      ...prev,
      checklist: items,
    }));
    addToast(`Loaded ${tpl.label} checklist template`, 'info');
  };

  // Edit Modal Checklist helpers
  const handleAddEditChecklistItem = () => {
    const text = editForm.newChecklistText.trim();
    if (!text) return;
    setEditForm((prev) => ({
      ...prev,
      checklist: [
        ...prev.checklist,
        { id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, text, completed: false },
      ],
      newChecklistText: '',
    }));
  };

  const handleRemoveEditChecklistItem = (id: string) => {
    setEditForm((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((c) => c.id !== id),
    }));
  };

  const handleToggleEditChecklistItem = (id: string) => {
    setEditForm((prev) => ({
      ...prev,
      checklist: prev.checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)),
    }));
  };

  const handleEditChecklistItemText = (id: string, newText: string) => {
    setEditForm((prev) => ({
      ...prev,
      checklist: prev.checklist.map((c) => (c.id === id ? { ...c, text: newText } : c)),
    }));
  };

  // Export to CSV handler
  const handleExport = () => {
    const res = exportTableToCsv('ops-tasks', store);
    addToast(`Exported ${res.count} tasks to CSV (${res.filename})`, 'success');
  };

  // Calculate high-level stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const overdue = tasks.filter((t) => t.status === 'overdue').length;

    let totalChecklistItems = 0;
    let completedChecklistItems = 0;
    tasks.forEach((t) => {
      if (Array.isArray(t.checklist)) {
        totalChecklistItems += t.checklist.length;
        completedChecklistItems += t.checklist.filter((c) => c.completed).length;
      }
    });

    const completionRate = totalChecklistItems > 0
      ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
      : 0;

    return { total, inProgress, completed, pending, overdue, totalChecklistItems, completedChecklistItems, completionRate };
  }, [tasks]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Tab Status filter
        if (activeTab !== 'all' && t.status !== activeTab) return false;

        // Global status filter if present
        if (globalFilter.status && globalFilter.status !== 'all') {
          const s = globalFilter.status.toLowerCase();
          if (s === 'in_progress' && t.status !== 'in_progress') return false;
          if (s === 'completed' && t.status !== 'completed') return false;
          if (s === 'pending' && t.status !== 'pending') return false;
          if (s === 'overdue' && t.status !== 'overdue') return false;
          if (!['in_progress', 'completed', 'pending', 'overdue'].includes(s) && t.status !== s) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (globalFilter.priority && globalFilter.priority !== 'all' && t.priority !== globalFilter.priority) return false;

        // Assignee filter
        if (assigneeFilter !== 'all' && t.assignee !== assigneeFilter) return false;
        if (globalFilter.assignedTo && globalFilter.assignedTo !== 'all' && t.assignee !== globalFilter.assignedTo) return false;

        // Date interval filter
        if (!isDateWithinInterval(t.due_date, globalDateInterval)) return false;

        // Local & Global search query filter
        const q = (searchQuery || globalFilter.query || '').trim().toLowerCase();
        if (q) {
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchSubtitle = (t.subtitle || '').toLowerCase().includes(q);
          const matchAssignee = (t.assignee || '').toLowerCase().includes(q);
          const matchJob = (t.related_to || '').toLowerCase().includes(q);
          const matchTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
          const matchChecklist = (t.checklist || []).some((c) => c.text.toLowerCase().includes(q));
          if (!matchTitle && !matchSubtitle && !matchAssignee && !matchJob && !matchTags && !matchChecklist) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'priority') {
          const weight = { high: 3, medium: 2, low: 1 };
          return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        }
        if (sortBy === 'progress') {
          const aRatio = a.checklist.length > 0 ? a.checklist.filter((c) => c.completed).length / a.checklist.length : 0;
          const bRatio = b.checklist.length > 0 ? b.checklist.filter((c) => c.completed).length / b.checklist.length : 0;
          return bRatio - aRatio;
        }
        return String(a.due_date).localeCompare(String(b.due_date));
      });
  }, [tasks, activeTab, priorityFilter, assigneeFilter, searchQuery, sortBy, globalFilter, globalDateInterval]);

  // Unique assignees for filter dropdown
  const uniqueAssignees = useMemo(() => {
    const list = new Set<string>();
    tasks.forEach((t) => { if (t.assignee) list.add(t.assignee); });
    employees.forEach((e) => { if (e.name) list.add(e.name); });
    return Array.from(list);
  }, [tasks, employees]);

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Operations Tasks & Checklists"
        subtitle="Track field job operational checklists, quality assurance, and priority milestones."
        primaryActionLabel="New Task"
        onPrimaryAction={() => setIsCreateModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* KPI Stat Cards Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          {/* Card 1: Total Tasks */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span>Total Tasks</span>
              <ListChecks className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Operations queue</span>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span>In Progress</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-600">{stats.inProgress}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Active in the field</span>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">{stats.completed}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              QA verified & signed off
            </div>
          </div>

          {/* Card 4: Overall Checklist Health */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span>Checklist Progress</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.completedChecklistItems} <span className="text-sm font-semibold text-slate-400">/ {stats.totalChecklistItems}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Strip & Interactive Controls */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Status Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('in_progress')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'in_progress'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'completed'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({stats.completed})
              </button>
              {stats.overdue > 0 && (
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'overdue'
                      ? 'bg-white text-rose-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overdue ({stats.overdue})
                </button>
              )}
            </div>

            {/* Actions: Export & New Task shortcut */}
            <div className="flex items-center gap-2 text-xs w-full md:w-auto justify-end">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                title="Export operational tasks to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Dropdowns Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs pt-1 border-t border-slate-100">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, job ID, assignee, or checklist item..."
                className="w-full px-3 py-1.5 pl-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <div className="sm:col-span-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div className="sm:col-span-3">
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Assignees</option>
                {uniqueAssignees.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="due_date">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="progress">Sort: Checklist %</option>
                <option value="title">Sort: Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Cards Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-800">No Operations Tasks Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No tasks matched your current filter criteria. You can clear your search or create a new inspection task.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              {(searchQuery || priorityFilter !== 'all' || assigneeFilter !== 'all' || activeTab !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriorityFilter('all');
                    setAssigneeFilter('all');
                    setActiveTab('all');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                + Create Operations Task
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {filteredTasks.map((task) => {
              const checklistItems = task.checklist || [];
              const completedCount = checklistItems.filter((c) => c.completed).length;
              const totalCount = checklistItems.length;
              const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              const isAllDone = totalCount > 0 && completedCount === totalCount;

              return (
                <div
                  key={task.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Top: Badges & Edit/Delete Action Icons */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Dropdown Picker */}
                        <div className="relative inline-block">
                          <select
                            value={task.status}
                            onChange={(e) => handleQuickChangeStatus(task.id, e.target.value as Task['status'])}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer appearance-none pr-5 outline-none transition ${
                              task.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : task.status === 'in_progress'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : task.status === 'overdue'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="in_progress">IN PROGRESS</option>
                            <option value="pending">PENDING</option>
                            <option value="completed">COMPLETED</option>
                            <option value="overdue">OVERDUE</option>
                          </select>
                          <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            task.priority === 'high'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : task.priority === 'medium'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority} Priority
                        </span>

                        {isAllDone && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 stroke-3" />
                            <span>100% QA Passed</span>
                          </span>
                        )}
                      </div>

                      {/* Card Action Buttons: Edit & Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          title="Edit task & checklists"
                          className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTaskId(task.id)}
                          title="Delete task"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Task Title & Subtitle */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-900 transition-colors">
                        {task.title}
                      </h3>
                      {task.subtitle && (
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                          {task.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Task Metadata Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>Related Job:</span>
                        </span>
                        <span className="font-semibold text-slate-800 font-mono">{task.related_to}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Assignee:</span>
                        </span>
                        <span className="font-semibold text-slate-800">{task.assignee}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Due Date:</span>
                        </span>
                        <span className="font-bold text-slate-800">{task.due_date}</span>
                      </div>
                    </div>

                    {/* Interactive Checklist Section */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <CheckSquare className="w-3 h-3 text-purple-600" />
                          <span>Task Checklist ({completedCount} / {totalCount})</span>
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          {pct}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isAllDone ? 'bg-emerald-500' : 'bg-purple-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Checklist Items List */}
                      <div className="space-y-1 pt-1 max-h-56 overflow-y-auto pr-1">
                        {checklistItems.map((item) => (
                          <div
                            key={item.id}
                            className="group/item flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div
                              onClick={() => toggleTaskChecklist(task.id, item.id)}
                              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                  item.completed
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 bg-white hover:border-purple-500'
                                }`}
                              >
                                {item.completed && <Check className="w-3 h-3" />}
                              </div>
                              <span
                                className={`text-xs truncate ${
                                  item.completed
                                    ? 'line-through text-slate-400 font-normal'
                                    : 'text-slate-800 font-medium'
                                }`}
                              >
                                {item.text}
                              </span>
                            </div>

                            {/* Remove item button (visible on hover) */}
                            <button
                              onClick={() => handleRemoveChecklistItemFromCard(task.id, item.id)}
                              title="Delete checklist step"
                              className="opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-rose-500 p-1 rounded transition-opacity cursor-pointer shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Inline Quick Add Checklist Item Bar */}
                      <div className="pt-1.5 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={cardQuickChecklistInput[task.id] || ''}
                          onChange={(e) =>
                            setCardQuickChecklistInput({
                              ...cardQuickChecklistInput,
                              [task.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleQuickAddCardChecklist(task.id);
                            }
                          }}
                          placeholder="+ Add new checklist step..."
                          className="flex-1 px-2.5 py-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickAddCardChecklist(task.id)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Tags and Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex flex-wrap items-center gap-1">
                      {(task.tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="text-purple-600 hover:text-purple-800 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                    >
                      <span>Edit details</span>
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL (with full Checklist Builder) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Create Operations Task</h3>
                  <p className="text-[11px] text-slate-500">Define field inspection or technician QA checklist.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Compressor Gas Charging Inspection"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subtitle / Milestone Details</label>
                <input
                  type="text"
                  value={createForm.subtitle}
                  onChange={(e) => setCreateForm({ ...createForm, subtitle: e.target.value })}
                  placeholder="e.g. Verify R32 pressure and pipe brazing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Related Job & Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Related Job</label>
                  <input
                    type="text"
                    value={createForm.related_to}
                    onChange={(e) => setCreateForm({ ...createForm, related_to: e.target.value })}
                    placeholder="e.g. JOB-1024"
                    list="jobOptions"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                  <datalist id="jobOptions">
                    {jobs.map((j) => (
                      <option key={j.id} value={j.job_id_str}>
                        {j.service} ({j.customer_name})
                      </option>
                    ))}
                    <option value="JOB-1024">JOB-1024 - AC Repair</option>
                    <option value="JOB-1025">JOB-1025 - PAC Servicing</option>
                    <option value="JOB-1026">JOB-1026 - Duct Cleaning</option>
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assignee</label>
                  <select
                    value={createForm.assignee}
                    onChange={(e) => setCreateForm({ ...createForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                    ))}
                    {employees.length === 0 && (
                      <>
                        <option value="Amit Sharma">Amit Sharma (Field Technician)</option>
                        <option value="Priya Sharma">Priya Sharma (Support Lead)</option>
                        <option value="Rahul Singh">Rahul Singh (Plumber)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Priority, Status & Due Date */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Due Date</label>
                  <input
                    type="text"
                    value={createForm.due_date}
                    onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                    placeholder="Today 5:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Tags & Description */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={createForm.tags}
                    onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                    placeholder="QC, HVAC, Operations"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Description / Notes</label>
                  <input
                    type="text"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Optional technician guidance notes..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* CHECKLIST BUILDER SECTION */}
              <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900">Task Checklist Items</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {createForm.checklist.length} steps
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, checklist: [] }))}
                    className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Preset Templates Quick Load */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Preset Templates:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(CHECKLIST_TEMPLATES).map(([key, tpl]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPresetTemplateToCreate(key)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-purple-100/70 border border-purple-200 rounded-lg text-[11px] font-semibold text-purple-900 transition cursor-pointer shadow-2xs"
                      >
                        <span>{tpl.icon}</span>
                        <span>{tpl.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add New Step Input Row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={createForm.newChecklistText}
                    onChange={(e) => setCreateForm({ ...createForm, newChecklistText: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCreateChecklistItem();
                      }
                    }}
                    placeholder="Type inspection step or checklist item..."
                    className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCreateChecklistItem}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
                  >
                    + Add Step
                  </button>
                </div>

                {/* Checklist Steps List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {createForm.checklist.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs italic bg-white/60 rounded-xl border border-dashed border-purple-200">
                      No checklist steps added yet. Click a preset template above or type a step.
                    </div>
                  ) : (
                    createForm.checklist.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200/80 rounded-xl shadow-2xs"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-purple-600 font-mono w-4 shrink-0">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              const newText = e.target.value;
                              setCreateForm((prev) => ({
                                ...prev,
                                checklist: prev.checklist.map((c) => (c.id === item.id ? { ...c, text: newText } : c)),
                              }));
                            }}
                            className="w-full text-xs text-slate-800 bg-transparent outline-none focus:underline"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCreateChecklistItem(item.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded transition cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm shadow-purple-700/20 cursor-pointer transition active:scale-95"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL (with full Checklist Editor) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Operations Task & Checklists</h3>
                  <p className="text-[11px] text-slate-500">Modify task parameters, status, and checklist items.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTask(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subtitle / Milestone Details</label>
                <input
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  placeholder="Task subtitle"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Related Job & Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Related Job</label>
                  <input
                    type="text"
                    value={editForm.related_to}
                    onChange={(e) => setEditForm({ ...editForm, related_to: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assignee</label>
                  <select
                    value={editForm.assignee}
                    onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                    ))}
                    {employees.length === 0 && (
                      <option value="Amit Sharma">Amit Sharma</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Priority, Status & Due Date */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Due Date</label>
                  <input
                    type="text"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Tags & Description */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Description / Notes</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* CHECKLIST EDITOR IN EDIT MODAL */}
              <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900">Manage Checklist Steps</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {editForm.checklist.filter((c) => c.completed).length} / {editForm.checklist.length} done
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const allDone = editForm.checklist.every((c) => c.completed);
                      setEditForm((prev) => ({
                        ...prev,
                        checklist: prev.checklist.map((c) => ({ ...c, completed: !allDone })),
                      }));
                    }}
                    className="text-[10px] font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    Toggle All
                  </button>
                </div>

                {/* Add new item in edit modal */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editForm.newChecklistText}
                    onChange={(e) => setEditForm({ ...editForm, newChecklistText: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditChecklistItem();
                      }
                    }}
                    placeholder="+ Add another checklist item..."
                    className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditChecklistItem}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {/* Existing Checklist Items List */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {editForm.checklist.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs italic bg-white/60 rounded-xl border border-dashed border-purple-200">
                      No checklist steps defined for this task. Add one above!
                    </div>
                  ) : (
                    editForm.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200/80 rounded-xl shadow-2xs"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleEditChecklistItem(item.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition cursor-pointer ${
                              item.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white hover:border-purple-500'
                            }`}
                          >
                            {item.completed && <Check className="w-3 h-3" />}
                          </button>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => handleEditChecklistItemText(item.id, e.target.value)}
                            className={`w-full text-xs bg-transparent outline-none focus:underline ${
                              item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveEditChecklistItem(item.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded transition cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setDeletingTaskId(editForm.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm shadow-purple-700/20 cursor-pointer transition active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Delete Operations Task?</h3>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Are you sure you want to permanently delete this task and all of its inspection checklist items?
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

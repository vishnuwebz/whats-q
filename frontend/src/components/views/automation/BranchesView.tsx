import React, { useState, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BranchItem } from '@/types';
import {
  Building2, Users, UserCheck, MapPin, Search, Filter, ArrowUpDown,
  MoreVertical, Plus, CheckCircle2, Clock, X, Camera, Upload,
  Image as ImageIcon, Trash2, Edit3, Settings, BarChart3, HelpCircle,
  TrendingUp, Check, RefreshCw, ChevronRight, SlidersHorizontal,
  ArrowLeft, Phone, Mail, Globe, ExternalLink, ShieldCheck, Zap,
  Activity, Award, UserPlus, MessageSquare, AlertCircle, Eye,
  Sparkles, CheckCircle, Smartphone
} from 'lucide-react';

export const BRANCH_IMAGE_PRESETS = [
  {
    id: 'p1',
    label: 'Modern Glass Tower (HQ)',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    label: 'Corporate Office Complex',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    label: 'Commercial Business Center',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p4',
    label: 'City Retail Storefront',
    url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p5',
    label: 'Urban Regional Hub',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p6',
    label: 'Tech Park Campus',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80',
  },
];

export const getBranchStaff = (branch: BranchItem) => {
  return [
    {
      name: branch.manager_name || 'Rahul Mehta',
      role: branch.manager_role || 'Branch Manager',
      department: 'Management',
      phone: branch.phone || '+91 495 276 5400',
      email: branch.email || 'manager@qiyamventures.com',
      status: 'On Duty',
      rating: 4.9,
    },
    {
      name: 'Anjali Nair',
      role: 'Senior WhatsApp Specialist',
      department: 'Customer Support',
      phone: '+91 98470 11223',
      email: 'anjali.n@qiyamventures.com',
      status: 'On Duty',
      rating: 4.8,
    },
    {
      name: 'Mohammed Rizwan',
      role: 'Key Account Executive',
      department: 'Sales',
      phone: '+91 97451 99882',
      email: 'rizwan.m@qiyamventures.com',
      status: 'On Duty',
      rating: 4.7,
    },
    {
      name: 'Karthik Varma',
      role: 'Field Service Lead',
      department: 'Operations',
      phone: '+91 94472 44331',
      email: 'karthik.v@qiyamventures.com',
      status: 'Available',
      rating: 4.9,
    },
  ];
};

export const getBranchWorkflows = (branch: BranchItem) => {
  return [
    {
      id: 'wf-1',
      name: 'Regional Inbound Lead Router',
      description: `Auto-routes incoming WhatsApp leads from ${branch.city} to local sales reps`,
      trigger: 'New WhatsApp Message',
      status: true,
      runs: 142,
      successRate: '99.4%',
    },
    {
      id: 'wf-2',
      name: 'Multilingual Regional Auto-Responder',
      description: `Instant greeting in English & regional language for ${branch.state} timezone`,
      trigger: 'First Contact',
      status: true,
      runs: 98,
      successRate: '100%',
    },
    {
      id: 'wf-3',
      name: 'High-Priority Service SLA Alert',
      description: `Escalates pending customer queries > 2 hours to ${branch.manager_name || 'Manager'}`,
      trigger: 'SLA Breach (> 2 hrs)',
      status: true,
      runs: 12,
      successRate: '98.2%',
    },
    {
      id: 'wf-4',
      name: 'UPI Invoice & Payment Reminder Bot',
      description: 'Sends Razorpay link with automated follow-up before job completion',
      trigger: 'Pending Invoice',
      status: branch.status?.toLowerCase() === 'active',
      runs: 64,
      successRate: '99.1%',
    },
  ];
};

export const getBranchActivity = (branch: BranchItem) => {
  return [
    {
      id: 'act-1',
      title: 'WhatsApp Broadcast Campaign Delivered',
      desc: `Monthly newsletter delivered to ${branch.customers_count || 450} branch contacts with 98.6% read rate.`,
      time: '10m ago',
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      id: 'act-2',
      title: 'New Lead Auto-Assigned',
      desc: `Lead #1048 routed to ${branch.name} sales desk from Meta Click-to-Ad.`,
      time: '35m ago',
      icon: Zap,
      color: 'text-amber-500 bg-amber-50',
    },
    {
      id: 'act-3',
      title: 'Branch Shift Check-in Completed',
      desc: `${branch.employees_count || 8} staff checked in on time via WhatsApp Biometric GPS.`,
      time: '2h ago',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 'act-4',
      title: 'Regional Revenue Milestone',
      desc: `Branch achieved 94% of monthly target (₹${((branch.customers_count || 450) * 85).toLocaleString()}).`,
      time: 'Yesterday',
      icon: TrendingUp,
      color: 'text-purple-500 bg-purple-50',
    },
  ];
};

export const BranchesView: React.FC = () => {
  const {
    branches,
    employees,
    customers,
    addBranch,
    updateBranch,
    deleteBranch,
    addToast,
    setActiveTab,
    targetHighlightId
  } = useQiyamStore();

  // Sub-pages triggered by Top Shortcuts
  const [activeSubPage, setActiveSubPage] = useState<'overview' | 'fleet-network' | 'workforce-roster' | 'customer-analytics' | 'operational-health'>('overview');

  // Branch Depth Details Drawer State
  const [selectedBranchForDepth, setSelectedBranchForDepth] = useState<BranchItem | null>(null);
  const [depthActiveTab, setDepthActiveTab] = useState<'overview' | 'staff' | 'automations' | 'activity'>('overview');

  // Table Columns Mode: 'automation' (matching screenshot) or 'executive'
  const [tableMode, setTableMode] = useState<'automation' | 'executive'>('automation');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'employees' | 'customers' | 'code'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Actions menu state (per row)
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | number | null>(null);

  // Edit Image Modal State
  const [editingImageBranch, setEditingImageBranch] = useState<BranchItem | null>(null);
  const [imageTab, setImageTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSavingImage, setIsSavingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add / Edit Branch Form Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    branch_type: 'Branch Office',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682016',
    manager_name: 'Rahul Mehta',
    manager_role: 'Branch Manager',
    employees_count: 8,
    customers_count: 450,
    status: 'Active',
    is_main: false,
    image: BRANCH_IMAGE_PRESETS[0].url,
  });

  // Calculate top metric stats
  const totalBranchesCount = branches.length;
  const totalEmployeesCount = branches.reduce((sum, b) => sum + (Number(b.employees_count) || 8), 0);
  const totalCustomersCount = branches.reduce((sum, b) => sum + (Number(b.customers_count) || 450), 0);
  const activeBranchesCount = branches.filter((b) => b.status?.toLowerCase() === 'active').length;

  // Filter & Sort branches
  const filteredBranches = branches
    .filter((b) => {
      if (statusFilter !== 'all') {
        const isActive = b.status?.toLowerCase() === 'active';
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        (b.manager_name && b.manager_name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') comp = a.name.localeCompare(b.name);
      else if (sortBy === 'employees') comp = (a.employees_count || 8) - (b.employees_count || 8);
      else if (sortBy === 'customers') comp = (a.customers_count || 450) - (b.customers_count || 450);
      else if (sortBy === 'code') comp = a.code.localeCompare(b.code);
      return sortOrder === 'asc' ? comp : -comp;
    });

  // Open Add Branch Modal
  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      code: `BR-${Math.floor(100 + Math.random() * 900)}`,
      branch_type: 'Branch Office',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682016',
      manager_name: 'Rahul Mehta',
      manager_role: 'Branch Manager',
      employees_count: 8,
      customers_count: 450,
      status: 'Active',
      is_main: false,
      image: BRANCH_IMAGE_PRESETS[Math.floor(Math.random() * BRANCH_IMAGE_PRESETS.length)].url,
    });
    setIsBranchModalOpen(true);
  };

  // Open Edit Branch Modal
  const handleOpenEditModal = (branch: BranchItem) => {
    setActiveActionMenuId(null);
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      code: branch.code,
      branch_type: branch.branch_type || 'Branch Office',
      city: branch.city || 'Kochi',
      state: branch.state || 'Kerala',
      pincode: branch.pincode || '682016',
      manager_name: branch.manager_name || 'Rahul Mehta',
      manager_role: branch.manager_role || 'Branch Manager',
      employees_count: branch.employees_count || 8,
      customers_count: branch.customers_count || 450,
      status: branch.status || 'Active',
      is_main: Boolean(branch.is_main),
      image: branch.image || BRANCH_IMAGE_PRESETS[0].url,
    });
    setIsBranchModalOpen(true);
  };

  // Open Edit Image Modal
  const handleOpenImageModal = (branch: BranchItem) => {
    setActiveActionMenuId(null);
    setEditingImageBranch(branch);
    setPreviewImageUrl(branch.image || BRANCH_IMAGE_PRESETS[0].url);
    setCustomUrlInput(branch.image || '');
    setImageTab('presets');
  };

  // Save Image from Image Modal
  const handleSaveImage = async () => {
    if (!editingImageBranch || !previewImageUrl) return;
    setIsSavingImage(true);
    try {
      await updateBranch(editingImageBranch.id, { image: previewImageUrl });
      setEditingImageBranch(null);
      addToast(`Updated photo for "${editingImageBranch.name}"`, 'success');
    } finally {
      setIsSavingImage(false);
    }
  };

  // Handle local file upload for branch image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB limit. Please choose a smaller file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewImageUrl(dataUrl);
      addToast('Image uploaded successfully! Click Save to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Save Branch Form (Create / Update)
  const handleSaveBranchForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) {
      addToast('Please enter a branch name', 'error');
      return;
    }

    if (editingBranch) {
      await updateBranch(editingBranch.id, branchForm);
    } else {
      await addBranch(branchForm);
    }
    setIsBranchModalOpen(false);
    setEditingBranch(null);
  };

  // Toggle Main Branch
  const handleToggleMainBranch = async (branch: BranchItem) => {
    setActiveActionMenuId(null);
    const newStatus = !branch.is_main;
    await updateBranch(branch.id, { is_main: newStatus });
    addToast(`${branch.name} ${newStatus ? 'set as Main Branch' : 'unset from Main Branch'}`, 'success');
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (branch: BranchItem) => {
    setActiveActionMenuId(null);
    const newStatus = branch.status?.toLowerCase() === 'active' ? 'Inactive' : 'Active';
    await updateBranch(branch.id, { status: newStatus });
    addToast(`${branch.name} marked as ${newStatus}`, 'info');
  };

  // Delete Branch with confirmation
  const handleDeleteBranch = async (branch: BranchItem) => {
    setActiveActionMenuId(null);
    if (window.confirm(`Are you sure you want to remove the branch "${branch.name}"?`)) {
      await deleteBranch(branch.id);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans"
      onClick={() => {
        if (activeActionMenuId) setActiveActionMenuId(null);
        if (isFilterDropdownOpen) setIsFilterDropdownOpen(false);
      }}
    >
      {/* View Header */}
      <Header
        title="Branches"
        subtitle="Manage all your business branches from one place."
        primaryActionLabel="Add Branch"
        onPrimaryAction={handleOpenAddModal}
      />

      <div className="p-3 sm:p-6 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* ── Sub-Page Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Branches', icon: Building2 },
            { id: 'fleet-network', label: 'Regional Network', icon: Globe, count: totalBranchesCount },
            { id: 'workforce-roster', label: 'Workforce Roster', icon: Users, count: totalEmployeesCount },
            { id: 'customer-analytics', label: 'Customer Reach', icon: UserCheck, count: totalCustomersCount },
            { id: 'operational-health', label: 'Operational Health', icon: Activity, count: `${activeBranchesCount} Active` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubPage(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeSubPage === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeSubPage === tab.id
                      ? 'bg-slate-800 text-emerald-400'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 1: OVERVIEW & BRANCHES (MAIN DASHBOARD)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'overview' && (
          <>
            {/* ── 1. Top 4 Stat Metric Cards (Clickable Shortcuts) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Branches */}
              <div
                onClick={() => {
                  setActiveSubPage('fleet-network');
                  addToast('Opening Regional Branch Network...', 'info');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-blue-400 cursor-pointer group"
                title="Click to view full Regional Network Directory"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 truncate">Total Branches</div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight">{totalBranchesCount}</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+1 from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Employees */}
              <div
                onClick={() => {
                  setActiveSubPage('workforce-roster');
                  addToast('Opening Branch Workforce Roster...', 'info');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-purple-400 cursor-pointer group"
                title="Click to view Staff Roster across branches"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 truncate">Total Employees</div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight">{totalEmployeesCount}</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Total Customers */}
              <div
                onClick={() => {
                  setActiveSubPage('customer-analytics');
                  addToast('Opening Customer Distribution Analytics...', 'info');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-emerald-400 cursor-pointer group"
                title="Click to view Customer concentration by branch"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 truncate">Total Customers</div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight">
                    {totalCustomersCount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18% from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Active Branches */}
              <div
                onClick={() => {
                  setActiveSubPage('operational-health');
                  addToast('Opening Operational Health & Uptime Monitor...', 'info');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-rose-400 cursor-pointer group"
                title="Click to view Branch Uptime & System Health"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 truncate">Active Branches</div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight">{activeBranchesCount}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>100% operational</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Branch List Container ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              {/* Table Header Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">Branch List</h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Click branch name for depth details
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    View and manage your branches, operational automations, contacts and settings.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* View Mode Toggle: Operations vs Executive */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTableMode('automation')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tableMode === 'automation'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Operations View
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableMode('executive')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tableMode === 'executive'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Executive View
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 sm:w-52">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search branches..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Filter Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFilterDropdownOpen(!isFilterDropdownOpen);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        statusFilter !== 'all'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filter</span>
                      {statusFilter !== 'all' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>

                    {isFilterDropdownOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 animate-in fade-in duration-100"
                      >
                        <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                          Status Filter
                        </div>
                        {(['all', 'active', 'inactive'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setStatusFilter(st);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs capitalize ${
                              statusFilter === st
                                ? 'bg-emerald-50 text-emerald-700 font-bold'
                                : 'hover:bg-slate-100 text-slate-700 font-medium'
                            }`}
                          >
                            <span>{st === 'all' ? 'All Statuses' : st}</span>
                            {statusFilter === st && <Check className="w-3 h-3 text-emerald-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sort Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextSort: Record<string, typeof sortBy> = {
                        name: 'employees',
                        employees: 'customers',
                        customers: 'code',
                        code: 'name',
                      };
                      setSortBy(nextSort[sortBy]);
                      addToast(`Sorted by ${nextSort[sortBy]}`, 'info');
                    }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={`Click to change sorting (current: ${sortBy})`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span className="capitalize">Sort: {sortBy}</span>
                  </button>
                </div>
              </div>

              {/* Table Render */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[760px]">
                  {/* Table Header: Changes depending on tableMode */}
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                    {tableMode === 'automation' ? (
                      /* Columns exactly matching Image 1 */
                      <tr>
                        <th className="py-3 px-4">Branch Name</th>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">City / State</th>
                        <th className="py-3 px-4">Active Automations</th>
                        <th className="py-3 px-4">Tasks Automated</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Last Activity</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    ) : (
                      /* Executive View Columns */
                      <tr>
                        <th className="py-3 px-4 w-10 text-center">#</th>
                        <th className="py-3 px-4">Branch Name</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Manager</th>
                        <th className="py-3 px-4">Employees</th>
                        <th className="py-3 px-4">Customers</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredBranches.map((b, idx) => {
                      const isMain = b.is_main || b.branch_type === 'Head Office' || idx === 0;
                      const branchImage = b.image || BRANCH_IMAGE_PRESETS[idx % BRANCH_IMAGE_PRESETS.length].url;
                      const isTarget = targetHighlightId === b.id || targetHighlightId === b.code || targetHighlightId === b.name;
                      const managerName = b.manager_name || (idx === 0 ? 'Rahul Mehta' : idx === 1 ? 'Suresh S' : 'Aneesh P');
                      const initials = managerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <tr
                          key={b.id}
                          className={`transition-colors hover:bg-slate-50/90 ${
                            isTarget ? 'bg-amber-50/60 ring-1 ring-amber-400' : ''
                          }`}
                        >
                          {/* ── Table Mode: Automation & Operations (Matching Image 1) ── */}
                          {tableMode === 'automation' ? (
                            <>
                              {/* 1. Branch Name (Clickable -> Depth Details) */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {/* Photo with 1-click edit */}
                                  <div
                                    className="relative group/thumb w-12 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenImageModal(b);
                                    }}
                                    title="Click to edit photo"
                                  >
                                    <img
                                      src={branchImage}
                                      alt={b.name}
                                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = BRANCH_IMAGE_PRESETS[0].url;
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                      <Camera className="w-3.5 h-3.5" />
                                    </div>
                                  </div>

                                  {/* Clickable Branch Title */}
                                  <div
                                    className="cursor-pointer group/name select-none"
                                    onClick={() => setSelectedBranchForDepth(b)}
                                    title="Click to view depth details"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover/name:text-emerald-600 transition-colors flex items-center gap-1.5">
                                        {b.name}
                                        <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                      </span>
                                      {isMain && (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.2 rounded-md text-[10px]">
                                          Main Branch
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {b.branch_type || 'Regional Hub'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Code */}
                              <td className="py-3.5 px-4 font-mono font-medium text-slate-600 text-xs">
                                {b.code}
                              </td>

                              {/* 3. City / State */}
                              <td className="py-3.5 px-4 font-medium text-slate-800 text-xs">
                                {b.city}, {b.state}
                              </td>

                              {/* 4. Active Automations */}
                              <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                                {b.automations_count || 18} workflows
                              </td>

                              {/* 5. Tasks Automated (Bold Emerald) */}
                              <td className="py-3.5 px-4 font-bold text-emerald-600 text-xs">
                                {b.tasks_automated || 120} tasks
                              </td>

                              {/* 6. Status */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border tracking-wide uppercase ${
                                    b.status?.toLowerCase() === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      b.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span>{b.status || 'Active'}</span>
                                </span>
                              </td>

                              {/* 7. Last Activity */}
                              <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                                {b.last_activity || 'May 31, 2024 10:30 AM'}
                              </td>
                            </>
                          ) : (
                            /* ── Table Mode: Executive View ── */
                            <>
                              <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="relative group/thumb w-12 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenImageModal(b);
                                    }}
                                  >
                                    <img
                                      src={branchImage}
                                      alt={b.name}
                                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                      <Camera className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                  <div
                                    className="cursor-pointer group/name"
                                    onClick={() => setSelectedBranchForDepth(b)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover/name:text-emerald-600 transition-colors">
                                        {b.name}
                                      </span>
                                      {isMain && (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.2 rounded-md text-[10px]">
                                          Main
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400">{b.code} • {b.branch_type || 'Branch'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-start gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-semibold text-slate-800">{b.city}, {b.state}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{b.pincode || '682016'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 leading-tight">{managerName}</div>
                                    <div className="text-[10px] text-slate-400">{b.manager_role || 'Manager'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 font-bold text-slate-800">
                                {b.employees_count || 8}
                              </td>

                              <td className="py-3 px-4 font-bold text-slate-800">
                                {(b.customers_count || 450).toLocaleString()}
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                    b.status?.toLowerCase() === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      b.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span>{b.status || 'Active'}</span>
                                </span>
                              </td>
                            </>
                          )}

                          {/* 8. Actions (Common to both modes) */}
                          <td className="py-3 px-4 text-right relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuId(activeActionMenuId === b.id ? null : b.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeActionMenuId === b.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-3 top-full mt-1 z-40 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1 animate-in fade-in zoom-in-95 duration-100 text-left"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setSelectedBranchForDepth(b);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>View Depth Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenImageModal(b)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Change Photo</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(b)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Edit Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleMainBranch(b)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>{b.is_main ? 'Unset Main Branch' : 'Set as Main Branch'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(b)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Toggle Status</span>
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBranch(b)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Branch</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredBranches.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No branches found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Showing 1 to {filteredBranches.length} of {branches.length} branches
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    disabled
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* ── 3. Bottom Section: Quick Actions & Need Help? ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Quick Actions Grid */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Quick Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Add Branch</div>
                    <div className="text-[11px] text-slate-500">Create a new branch</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addToast('Opening Employee Management...', 'info');
                      setActiveTab('ops-employees');
                    }}
                    className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 hover:bg-purple-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Manage Employees</div>
                    <div className="text-[11px] text-slate-500">View and assign staff</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (branches[0]) handleOpenEditModal(branches[0]);
                      else handleOpenAddModal();
                    }}
                    className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 hover:bg-blue-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Branch Settings</div>
                    <div className="text-[11px] text-slate-500">Configure branch details</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addToast('Opening Financial Branch Reports...', 'info');
                      setActiveTab('finance-reports');
                    }}
                    className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Branch Reports</div>
                    <div className="text-[11px] text-slate-500">View performance reports</div>
                  </button>
                </div>
              </div>

              {/* Need Help? Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm">Need Help?</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Learn more about branch management, multi-tenant employee assignment, and regional office configurations.
                  </p>
                </div>

                <div className="pt-4">
                  <a
                    href="/api/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
                  >
                    <span>View Documentation</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 2: REGIONAL NETWORK (TOTAL BRANCHES SHORTCUT)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'fleet-network' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Back Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubPage('overview')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch Network & Regional Distribution</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive operational directory of all {totalBranchesCount} business branches across India.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>
            </div>

            {/* Regional Territory Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { state: 'Kerala', count: branches.filter((b) => b.state === 'Kerala').length, cities: 'Kozhikode, Kochi, Thrissur', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800' },
                { state: 'Karnataka', count: branches.filter((b) => b.state === 'Karnataka').length || 1, cities: 'Bengaluru Hub', color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
                { state: 'Maharashtra', count: branches.filter((b) => b.state === 'Maharashtra').length || 1, cities: 'Mumbai BKC', color: 'border-purple-200 bg-purple-50/50 text-purple-800' },
                { state: 'Delhi NCR', count: branches.filter((b) => b.state === 'Delhi').length || 1, cities: 'New Delhi', color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
                { state: 'Tamil Nadu', count: branches.filter((b) => b.state === 'Tamil Nadu').length || 1, cities: 'Chennai Mount Rd', color: 'border-rose-200 bg-rose-50/50 text-rose-800' },
                { state: 'Telangana', count: branches.filter((b) => b.state === 'Telangana').length || 1, cities: 'Hyderabad Hitec', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-800' },
              ].map((reg) => (
                <div key={reg.state} className={`p-3.5 rounded-2xl border ${reg.color} space-y-1`}>
                  <div className="text-[10px] uppercase tracking-wider font-bold opacity-75">{reg.state}</div>
                  <div className="text-xl font-extrabold">{reg.count} <span className="text-xs font-medium">branches</span></div>
                  <div className="text-[10px] opacity-75 truncate">{reg.cities}</div>
                </div>
              ))}
            </div>

            {/* Network Table (Image 1 Format) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="font-bold text-slate-800">All Network Branches ({branches.length})</div>
                <div className="text-[11px] text-slate-500">Click any branch name to open complete dossiers</div>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[760px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Branch Name</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">City / State</th>
                      <th className="py-3 px-4">Active Automations</th>
                      <th className="py-3 px-4">Tasks Automated</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Last Activity</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {branches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedBranchForDepth(b)}
                            className="text-left font-bold text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{b.name}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <div className="text-[10px] text-slate-400 font-medium">{b.branch_type || 'Branch Office'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{b.code}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{b.city}, {b.state}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{b.automations_count || 18} workflows</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">{b.tasks_automated || 120} tasks</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border uppercase ${
                            b.status?.toLowerCase() === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${b.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{b.status || 'Active'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{b.last_activity || 'May 31, 2024 10:30 AM'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBranchForDepth(b)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-[11px] text-slate-700 transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 3: WORKFORCE ROSTER (TOTAL EMPLOYEES SHORTCUT)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'workforce-roster' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Back Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubPage('overview')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch Workforce & Human Capital</h3>
                  <p className="text-xs text-slate-500">
                    Distribution of {totalEmployeesCount} active staff members across management, sales, and operations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ops-employees');
                  addToast('Opening Employee Management...', 'info');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Open Full HR Suite</span>
              </button>
            </div>

            {/* Department Split Progress & KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Total Workforce</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{totalEmployeesCount}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">100% active contracts</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">On Duty Today</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{Math.round(totalEmployeesCount * 0.85)}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Checked in via GPS</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Avg Rating</div>
                <div className="text-2xl font-bold text-amber-500 mt-1">4.85 ★</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Based on 1,420 customer reviews</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Attendance SLA</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">98.4%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">On-time rate this month</div>
              </div>
            </div>

            {/* Department Breakdown Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Workforce Department Allocation</span>
                <span className="text-slate-400 font-normal">Sales • Support • Operations</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div style={{ width: '45%' }} className="bg-blue-500" title="Sales: 45%" />
                <div style={{ width: '30%' }} className="bg-purple-500" title="WhatsApp Support: 30%" />
                <div style={{ width: '25%' }} className="bg-emerald-500" title="Field Operations: 25%" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="text-slate-600"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5" />Sales (45%)</div>
                <div className="text-slate-600"><span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5" />Support & Chat (30%)</div>
                <div className="text-slate-600"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />Operations (25%)</div>
              </div>
            </div>

            {/* Branch Roster Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-800">
                Staff Roster by Branch Location
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Employee / Leader</th>
                      <th className="py-3 px-4">Branch Location</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Shift Status</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4 text-right">Direct Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {branches.map((b, idx) => {
                      const staff = getBranchStaff(b)[0];
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {staff.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{staff.name}</div>
                                <div className="text-[10px] text-slate-400">{staff.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">{b.name} ({b.city})</td>
                          <td className="py-3.5 px-4 font-medium text-slate-600">{staff.department}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{staff.phone}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{staff.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-600">{staff.rating} ★</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedBranchForDepth(b)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 font-bold text-[11px] text-slate-700 transition-colors cursor-pointer"
                            >
                              View Team
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 4: CUSTOMER REACH (TOTAL CUSTOMERS SHORTCUT)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'customer-analytics' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Back Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubPage('overview')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch Customer Distribution & Regional Reach</h3>
                  <p className="text-xs text-slate-500">
                    Territory breakdown of {totalCustomersCount.toLocaleString()} active customer accounts across branches.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('crm-customers');
                  addToast('Opening CRM Customers...', 'info');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Open Full CRM Directory</span>
              </button>
            </div>

            {/* 4 Customer KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Active Accounts</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{totalCustomersCount.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">+18% expansion rate</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">VIP Clients</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">{Math.round(totalCustomersCount * 0.12)}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">High lifetime value</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Average Contract</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">₹28,500</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Per service cycle</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">WhatsApp Retention</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">94.2%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Repeat booking score</div>
              </div>
            </div>

            {/* Customer Territory Progress */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Customer Volume Concentration by Branch</span>
                <span className="text-emerald-600 font-semibold">Total: {totalCustomersCount.toLocaleString()} Accounts</span>
              </div>
              <div className="space-y-2.5">
                {branches.slice(0, 5).map((b) => {
                  const share = Math.round(((b.customers_count || 450) / Math.max(totalCustomersCount, 1)) * 100);
                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{b.name} ({b.city})</span>
                        <span className="text-slate-500 font-mono">{(b.customers_count || 450).toLocaleString()} clients ({share}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div style={{ width: `${share}%` }} className="h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 5: OPERATIONAL HEALTH (ACTIVE BRANCHES SHORTCUT)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'operational-health' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Back Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubPage('overview')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch Operational Health & System Uptime</h3>
                  <p className="text-xs text-slate-500">
                    Live telemetry across branch automation nodes, Cloud API connections, and sync latency.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('active');
                  setActiveSubPage('overview');
                  addToast('Filtered to active branches on dashboard', 'success');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Show Active Branches Only</span>
              </button>
            </div>

            {/* Health KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Fleet Uptime</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">99.98%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Zero downtime this week</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Webhook Latency</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">42 ms</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Cloud API ping response</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Automation Success</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">99.6%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Across 1,226 tasks</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Active Nodes</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">{activeBranchesCount} of {totalBranchesCount}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Live synchronized</div>
              </div>
            </div>

            {/* Branch Health Telemetry Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-800">
                Live Branch Sync & Automation Telemetry
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Branch Node</th>
                      <th className="py-3 px-4">Operational Status</th>
                      <th className="py-3 px-4">Cloud API Latency</th>
                      <th className="py-3 px-4">Active Workflows</th>
                      <th className="py-3 px-4">Automated Tasks</th>
                      <th className="py-3 px-4">Last Telemetry Ping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {branches.map((b, idx) => {
                      const isActive = b.status?.toLowerCase() === 'active';
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{b.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{b.code} • {b.city}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                              isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              <span>{isActive ? 'Operational' : 'Offline / Inactive'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            {isActive ? `${38 + (idx * 3)} ms` : '—'}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{b.automations_count || 18} workflows</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">{b.tasks_automated || 120} tasks</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">Just now</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          BRANCH DEPTH DETAILS DRAWER (CLICKING BRANCH NAME)
          ══════════════════════════════════════════════════════ */}
      {selectedBranchForDepth && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedBranchForDepth(null)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Hero Header with Banner & Building Thumbnail */}
            <div className="relative h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedBranchForDepth.image || BRANCH_IMAGE_PRESETS[0].url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              {/* Top Drawer Controls */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 font-bold">
                    {selectedBranchForDepth.code}
                  </span>
                  {selectedBranchForDepth.is_main && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Headquarters
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBranchForDepth(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Quick Status */}
              <div className="relative z-10 flex items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="relative group/thumb w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-slate-800 shrink-0 cursor-pointer"
                    onClick={() => handleOpenImageModal(selectedBranchForDepth)}
                    title="Click to edit branch photo"
                  >
                    <img
                      src={selectedBranchForDepth.image || BRANCH_IMAGE_PRESETS[0].url}
                      alt={selectedBranchForDepth.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{selectedBranchForDepth.name}</h2>
                    <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedBranchForDepth.city}, {selectedBranchForDepth.state}</span>
                      <span>•</span>
                      <span>{selectedBranchForDepth.branch_type || 'Regional Hub'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedBranchForDepth)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    selectedBranchForDepth.status?.toLowerCase() === 'active'
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedBranchForDepth.status?.toLowerCase() === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  <span>{selectedBranchForDepth.status || 'Active'}</span>
                </button>
              </div>
            </div>

            {/* 4 Top KPI Tiles */}
            <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/70 p-3 text-center divide-x divide-slate-200/80">
              <div className="px-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Employees</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">{selectedBranchForDepth.employees_count || 8}</div>
                <div className="text-[10px] text-emerald-600 font-bold">On Duty</div>
              </div>
              <div className="px-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Customers</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">{(selectedBranchForDepth.customers_count || 450).toLocaleString()}</div>
                <div className="text-[10px] text-purple-600 font-bold">Active CRM</div>
              </div>
              <div className="px-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Workflows</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">{selectedBranchForDepth.automations_count || 18}</div>
                <div className="text-[10px] text-blue-600 font-bold">Active Flows</div>
              </div>
              <div className="px-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Tasks Run</div>
                <div className="text-base font-extrabold text-emerald-600 mt-0.5">{selectedBranchForDepth.tasks_automated || 120}</div>
                <div className="text-[10px] text-slate-500 font-medium">Automated</div>
              </div>
            </div>

            {/* Drawer Tabs Header */}
            <div className="flex border-b border-slate-200 bg-white px-5 pt-2 gap-4">
              {[
                { id: 'overview', label: 'Overview & Location' },
                { id: 'staff', label: 'Staff Roster' },
                { id: 'automations', label: 'Active Workflows' },
                { id: 'activity', label: 'Live Audit Log' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDepthActiveTab(t.id as any)}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    depthActiveTab === t.id
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Drawer Tabs Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white text-xs">
              {/* TAB 1: OVERVIEW & LOCATION */}
              {depthActiveTab === 'overview' && (
                <div className="space-y-4">
                  {/* Location & Address Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Physical Location & Address</span>
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedBranchForDepth.name} ${selectedBranchForDepth.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Open Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-slate-700 leading-relaxed font-medium">
                      {selectedBranchForDepth.address || `${selectedBranchForDepth.name}, Central Business District, ${selectedBranchForDepth.city}, ${selectedBranchForDepth.state} - ${selectedBranchForDepth.pincode || '682016'}`}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-500 font-mono">
                      <div>City: <strong className="text-slate-800">{selectedBranchForDepth.city}</strong></div>
                      <div>State: <strong className="text-slate-800">{selectedBranchForDepth.state}</strong></div>
                      <div>PIN: <strong className="text-slate-800">{selectedBranchForDepth.pincode || '682016'}</strong></div>
                      <div>Country: <strong className="text-slate-800">India</strong></div>
                    </div>
                  </div>

                  {/* Branch Leadership Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Branch Leadership & Management</span>
                    </div>

                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                          {(selectedBranchForDepth.manager_name || 'RM').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {selectedBranchForDepth.manager_name || 'Rahul Mehta'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {selectedBranchForDepth.manager_role || 'Branch Manager'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${selectedBranchForDepth.phone || '+914952765400'}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Call Manager"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`mailto:${selectedBranchForDepth.email || 'manager@qiyamventures.com'}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Email Manager"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Communication & Operating Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>Branch Contact</span>
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div>Phone: <strong className="text-slate-800">{selectedBranchForDepth.phone || '+91 495 276 5400'}</strong></div>
                        <div>Email: <strong className="text-slate-800">{selectedBranchForDepth.email || 'branch@qiyamventures.com'}</strong></div>
                        <div>WhatsApp: <strong className="text-emerald-700">+91 98765 43210 (Active)</strong></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>Working Schedule</span>
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div>Days: <strong className="text-slate-800">Monday — Saturday</strong></div>
                        <div>Hours: <strong className="text-slate-800">08:30 AM — 07:00 PM</strong></div>
                        <div>Sunday: <strong className="text-slate-500">Emergency Support Only</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STAFF ROSTER */}
              {depthActiveTab === 'staff' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800">
                      Assigned Branch Staff ({getBranchStaff(selectedBranchForDepth).length})
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('ops-employees');
                        setSelectedBranchForDepth(null);
                      }}
                      className="text-emerald-700 hover:underline font-bold text-xs flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Manage in HR</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {getBranchStaff(selectedBranchForDepth).map((st, i) => (
                      <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-[11px] text-slate-500">{st.role} • {st.department}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{st.status}</span>
                          </span>
                          <span className="text-amber-600 font-bold text-xs">{st.rating} ★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WORKFLOWS & AUTOMATIONS */}
              {depthActiveTab === 'automations' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800">Active Automations for {selectedBranchForDepth.name}</div>
                    <span className="text-emerald-600 font-bold text-xs">{selectedBranchForDepth.automations_count || 18} Active Workflows</span>
                  </div>

                  <div className="space-y-2.5">
                    {getBranchWorkflows(selectedBranchForDepth).map((wf) => (
                      <div key={wf.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold text-slate-900">{wf.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{wf.description}</p>
                          <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                            <span>Trigger: {wf.trigger}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold">{wf.runs} runs this month</span>
                            <span>•</span>
                            <span>Success: {wf.successRate}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: LIVE ACTIVITY & AUDIT */}
              {depthActiveTab === 'activity' && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-800">Recent Branch Activity & System Events</div>
                  <div className="space-y-2.5">
                    {getBranchActivity(selectedBranchForDepth).map((act) => (
                      <div key={act.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                          <act.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{act.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{act.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const b = selectedBranchForDepth;
                  setSelectedBranchForDepth(null);
                  handleDeleteBranch(b);
                }}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Branch</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('finance-reports');
                    setSelectedBranchForDepth(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Branch Financials</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const b = selectedBranchForDepth;
                    setSelectedBranchForDepth(null);
                    handleOpenEditModal(b);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Dedicated Edit Branch Photo Modal ── */}
      {editingImageBranch && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setEditingImageBranch(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Branch Photo</h3>
                  <p className="text-[11px] text-slate-500">
                    Update the building image for <strong className="text-slate-800">{editingImageBranch.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingImageBranch(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-40 shadow-inner group">
              <img
                src={previewImageUrl || BRANCH_IMAGE_PRESETS[0].url}
                alt={editingImageBranch.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BRANCH_IMAGE_PRESETS[0].url;
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{editingImageBranch.name}</div>
                  <div className="text-[10px] text-slate-300">{editingImageBranch.city}, {editingImageBranch.state}</div>
                </div>
                <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold">
                  Photo Preview
                </span>
              </div>
            </div>

            {/* Photo Selection Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setImageTab('presets')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  imageTab === 'presets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Curated Presets
              </button>
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  imageTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  imageTab === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Custom URL
              </button>
            </div>

            {/* Tab 1: Presets Grid */}
            {imageTab === 'presets' && (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                {BRANCH_IMAGE_PRESETS.map((preset) => {
                  const isSelected = previewImageUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setPreviewImageUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-4/3 group ${
                        isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 p-1 flex items-end">
                        <span className="text-[9px] font-bold text-white leading-tight truncate">
                          {preset.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Upload File */}
            {imageTab === 'upload' && (
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-700">Choose a photo from your computer</div>
                <p className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP up to 5MB</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Browse Files
                </button>
              </div>
            )}

            {/* Tab 3: Custom URL */}
            {imageTab === 'url' && (
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Direct Image Link</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/building.jpg"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) setPreviewImageUrl(customUrlInput.trim());
                    }}
                    className="px-3 py-2 bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
                  >
                    Preview
                  </button>
                </div>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingImageBranch(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingImage || !previewImageUrl}
                onClick={handleSaveImage}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Photo...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Add / Edit Branch Form Modal ── */}
      {isBranchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsBranchModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingBranch ? `Edit ${editingBranch.name}` : 'Add New Branch'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure branch office details, location, manager, and staff capacity.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranchForm} className="space-y-3.5">
              {/* Branch Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    placeholder="e.g. Calicut South Hub"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    placeholder="e.g. BR-008"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Branch Type & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch Type</label>
                  <select
                    value={branchForm.branch_type}
                    onChange={(e) => setBranchForm({ ...branchForm, branch_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Head Office">Head Office</option>
                    <option value="Regional Office">Regional Office</option>
                    <option value="Branch Office">Branch Office</option>
                    <option value="Service Center">Service Center</option>
                    <option value="Satellite Depot">Satellite Depot</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Postal Code (PIN)</label>
                  <input
                    type="text"
                    value={branchForm.pincode}
                    onChange={(e) => setBranchForm({ ...branchForm, pincode: e.target.value })}
                    placeholder="e.g. 682016"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    placeholder="e.g. Kochi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.state}
                    onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                    placeholder="e.g. Kerala"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Manager Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch Manager Name</label>
                  <input
                    type="text"
                    value={branchForm.manager_name}
                    onChange={(e) => setBranchForm({ ...branchForm, manager_name: e.target.value })}
                    placeholder="e.g. Suresh S"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Manager Role</label>
                  <input
                    type="text"
                    value={branchForm.manager_role}
                    onChange={(e) => setBranchForm({ ...branchForm, manager_role: e.target.value })}
                    placeholder="e.g. Branch Manager"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Capacity: Employees & Customers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Employees</label>
                  <input
                    type="number"
                    min={1}
                    value={branchForm.employees_count}
                    onChange={(e) => setBranchForm({ ...branchForm, employees_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Active Customers</label>
                  <input
                    type="number"
                    min={0}
                    value={branchForm.customers_count}
                    onChange={(e) => setBranchForm({ ...branchForm, customers_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Photo Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Branch Building Photo</label>
                <div className="flex items-center gap-3">
                  <img
                    src={branchForm.image || BRANCH_IMAGE_PRESETS[0].url}
                    alt="Preview"
                    className="w-14 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {BRANCH_IMAGE_PRESETS.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setBranchForm({ ...branchForm, image: p.url })}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          branchForm.image === p.url
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkboxes: Main Branch & Status */}
              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={branchForm.is_main}
                    onChange={(e) => setBranchForm({ ...branchForm, is_main: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-700">Mark as Main Branch / Headquarters</span>
                </label>

                <select
                  value={branchForm.status}
                  onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value })}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 cursor-pointer"
                >
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



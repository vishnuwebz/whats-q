import React, { useState, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BranchItem } from '@/types';
import {
  Building2, Users, UserCheck, MapPin, Search, Filter, ArrowUpDown,
  MoreVertical, Plus, CheckCircle2, Clock, X, Camera, Upload,
  Image as ImageIcon, Trash2, Edit3, Settings, BarChart3, HelpCircle,
  TrendingUp, Check, RefreshCw, ChevronRight, SlidersHorizontal
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

export const BranchesView: React.FC = () => {
  const {
    branches,
    addBranch,
    updateBranch,
    deleteBranch,
    addToast,
    setActiveTab,
    targetHighlightId
  } = useQiyamStore();

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
        {/* ── 1. Top 4 Stat Metric Cards (Matching Screenshot) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Branches */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-500 truncate">Total Branches</div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">{totalBranchesCount}</div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+1 from last month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Employees */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-500 truncate">Total Employees</div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">{totalEmployeesCount}</div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+12% from last month</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Customers */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-500 truncate">Total Customers</div>
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
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-500 truncate">Active Branches</div>
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
              <h3 className="font-bold text-sm sm:text-base text-slate-900">Branch List</h3>
              <p className="text-slate-500 text-[11px]">
                View and manage your branches, branch details, contacts and settings.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-60">
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

          {/* Table */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[760px]">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
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
                      {/* Row # */}
                      <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>

                      {/* Branch Name & Editable Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* Photo with 1-click edit badge */}
                          <div
                            className="relative group/thumb w-14 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs cursor-pointer"
                            onClick={() => handleOpenImageModal(b)}
                            title="Click to edit/change branch photo"
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
                              <Camera className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Titles */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">{b.name}</span>
                              {isMain && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md text-[10px]">
                                  Main Branch
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">{b.code} • {b.branch_type || 'Branch Office'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-800">
                              {b.city}, {b.state}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {b.pincode || (idx === 0 ? '682016' : idx === 1 ? '673001' : '680001')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Manager */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 leading-tight">{managerName}</div>
                            <div className="text-[10px] text-slate-400">{b.manager_role || 'Branch Manager'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Employees */}
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {b.employees_count || (idx === 0 ? 12 : 8)}
                      </td>

                      {/* Customers */}
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {(b.customers_count || (idx === 0 ? 1245 : idx === 1 ? 654 : 447)).toLocaleString()}
                      </td>

                      {/* Status */}
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

                      {/* Actions */}
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

        {/* ── 3. Bottom Section: Quick Actions & Need Help? (Matching Screenshot) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions Grid (2 cols on lg) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Quick Actions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Add Branch */}
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

              {/* Manage Employees */}
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

              {/* Branch Settings */}
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

              {/* Branch Reports */}
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
      </div>

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



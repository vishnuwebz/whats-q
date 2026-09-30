import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Users,
  Search,
  MessageSquare,
  X,
  UserPlus,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowDownAZ,
  ArrowUpAZ,
  TrendingUp,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
} from 'lucide-react';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';
import { qiyamApi } from '@/api/qiyamApi';

export type CustomerSortOption =
  | 'recent'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'spent_desc'
  | 'jobs_desc';

const SORT_OPTIONS: { id: CustomerSortOption; label: string; icon: any }[] = [
  { id: 'recent', label: 'Recently Added (Newest First)', icon: Calendar },
  { id: 'oldest', label: 'Oldest Added (Earliest First)', icon: Calendar },
  { id: 'name_asc', label: 'Customer Name (A → Z)', icon: ArrowDownAZ },
  { id: 'name_desc', label: 'Customer Name (Z → A)', icon: ArrowUpAZ },
  { id: 'spent_desc', label: 'Lifetime Revenue (High to Low)', icon: TrendingUp },
  { id: 'jobs_desc', label: 'Total Jobs (Most Completed)', icon: Briefcase },
];

export const CustomersView: React.FC = () => {
  const {
    conversations,
    customers: storeCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setActiveTab,
    setSelectedConversationId,
    addToast,
    globalFilter,
  } = useQiyamStore();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor'>('all');
  const [sortBy, setSortBy] = useState<CustomerSortOption>('recent');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: 'Kozhikode, Kerala',
    category: 'Customer' as 'Customer' | 'Hot Lead' | 'Lead' | 'Vendor',
  });

  // Edit Customer Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<{
    id: string | number;
    name: string;
    phone: string;
    location: string;
    category: 'Customer' | 'Hot Lead' | 'Lead' | 'Vendor';
  } | null>(null);

  // Delete Customer Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<{
    id: string | number;
    name: string;
    phone: string;
  } | null>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  // Sync fresh customers from backend on view mount
  useEffect(() => {
    qiyamApi
      .fetchCustomers()
      .then((custs) => {
        if (Array.isArray(custs) && custs.length > 0) {
          useQiyamStore.setState({ customers: custs });
        }
      })
      .catch((e) => console.warn('[CustomersView] Could not fetch fresh customers:', e));
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      addToast('Please enter customer full name', 'warning');
      return;
    }
    const cleanDigits = form.phone.replace(/\D/g, '');
    if (cleanDigits.length < 5) {
      addToast('Please enter a valid phone number', 'warning');
      return;
    }

    await addCustomer({
      contact_name: trimmedName,
      name: trimmedName,
      phone_number: form.phone.trim(),
      phone: form.phone.trim(),
      location: form.location.trim() || 'Kozhikode, Kerala',
      address: form.location.trim() || 'Kozhikode, Kerala',
      category: form.category,
      tags: [form.category],
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=100&auto=format&fit=crop&q=80`,
      estimated_value: 3000,
      total_spent: 5600,
      jobs_count: 1,
      last_contact_date: 'Just now',
    });

    setIsAddModalOpen(false);
    setForm({
      name: '',
      phone: '',
      location: 'Kozhikode, Kerala',
      category: 'Customer',
    });
  };

  const handleOpenEdit = (cust: any) => {
    setEditingCustomer({
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
      location: cust.location,
      category: cust.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const trimmedName = editingCustomer.name.trim();
    if (!trimmedName) {
      addToast('Please enter customer full name', 'warning');
      return;
    }
    const cleanDigits = editingCustomer.phone.replace(/\D/g, '');
    if (cleanDigits.length < 5) {
      addToast('Please enter a valid phone number', 'warning');
      return;
    }

    await updateCustomer(editingCustomer.id, {
      id: editingCustomer.id,
      name: trimmedName,
      contact_name: trimmedName,
      phone: editingCustomer.phone.trim(),
      phone_number: editingCustomer.phone.trim(),
      location: editingCustomer.location.trim() || 'Kozhikode, Kerala',
      address: editingCustomer.location.trim() || 'Kozhikode, Kerala',
      category: editingCustomer.category,
      tags: [editingCustomer.category],
    });

    setIsEditModalOpen(false);
    setEditingCustomer(null);
  };

  const handleOpenDelete = (cust: any) => {
    setDeletingCustomer({
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
    });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;
    await deleteCustomer(deletingCustomer.id, deletingCustomer.phone);
    setIsDeleteModalOpen(false);
    setDeletingCustomer(null);
  };

  // Primary source of truth: storeCustomers. Secondary: unsaved conversation contacts.
  const customers = useMemo(() => {
    const list: Array<{
      id: string | number;
      conversationId?: string | number;
      name: string;
      phone: string;
      location: string;
      avatar?: string;
      totalSpent: number;
      jobsCount: number;
      status: 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor';
      lastSeen: string;
      createdAtNum: number;
      rawId: number;
    }> = [];

    const seenPhones = new Set<string>();

    // Map conversations by clean 10-digit phone
    const convByPhone = new Map<string, any>();
    (conversations || []).forEach((c) => {
      const cleanPhone = String(c.phone_number || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone) convByPhone.set(cleanPhone, c);
    });

    // 1. Process storeCustomers first (source of truth for directory)
    (storeCustomers || []).forEach((sc: any) => {
      const rawPhone = String(sc.phone || sc.phone_number || '').trim();
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
      if (cleanPhone) seenPhones.add(cleanPhone);

      const matchedConv = cleanPhone ? convByPhone.get(cleanPhone) : null;
      const cat = (sc.category ||
        (Array.isArray(sc.tags) &&
          sc.tags.find((t: string) => ['Customer', 'Lead', 'Hot Lead', 'Vendor'].includes(t))) ||
        matchedConv?.category ||
        'Customer') as any;

      const numId = typeof sc.id === 'number' ? sc.id : parseInt(String(sc.id).replace(/\D/g, '') || '0');
      let createdTime = 0;
      if (sc.created_at) {
        createdTime = new Date(sc.created_at).getTime() || 0;
      }
      if (!createdTime && sc.timestamp) {
        createdTime = Number(sc.timestamp) || 0;
      }
      if (!createdTime && numId > 0) {
        createdTime = numId * 1000;
      }

      list.push({
        id: sc.id || `cust_${Date.now()}_${Math.random()}`,
        conversationId: matchedConv?.id,
        name: sc.name || sc.contact_name || matchedConv?.contact_name || 'Unnamed',
        phone: rawPhone || matchedConv?.phone_number || '',
        location: sc.address || sc.location || matchedConv?.location || 'Kozhikode, Kerala',
        avatar: sc.avatar || matchedConv?.avatar,
        totalSpent:
          Number(sc.total_spent || sc.total_spend || 0) ||
          (matchedConv?.estimated_value ? matchedConv.estimated_value * 2 : 5600),
        jobsCount: Number(sc.jobs_count || sc.orders_count || 1),
        status: ['Customer', 'Lead', 'Hot Lead', 'Vendor'].includes(cat) ? cat : 'Customer',
        lastSeen: sc.first_seen || sc.last_contact_date || matchedConv?.last_contact_date || 'Just now',
        createdAtNum: createdTime,
        rawId: numId,
      });
    });

    // 2. Add contacts from conversations that don't yet have an explicit customer record
    (conversations || []).forEach((c) => {
      const cleanPhone = String(c.phone_number || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone && seenPhones.has(cleanPhone)) {
        return;
      }
      if (cleanPhone) seenPhones.add(cleanPhone);

      const cat = (c.category ||
        (c.lead_stage === 'Customer'
          ? 'Customer'
          : c.lead_stage === 'Vendor'
          ? 'Vendor'
          : 'Lead')) as any;

      list.push({
        id: c.id,
        conversationId: c.id,
        name: c.contact_name || 'Unnamed',
        phone: c.phone_number || '',
        location: c.location || 'Kozhikode, Kerala',
        avatar: c.avatar,
        totalSpent: (c.estimated_value || 2800) * 2,
        jobsCount: 1,
        status: ['Customer', 'Lead', 'Hot Lead', 'Vendor'].includes(cat) ? cat : 'Customer',
        lastSeen: c.last_contact_date || 'Recent',
        createdAtNum: 0,
        rawId: 0,
      });
    });

    return list;
  }, [storeCustomers, conversations]);

  const effectiveSearch = search || globalFilter.query || '';

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    const result = customers.filter((cust) => {
      if (categoryFilter !== 'all' && cust.status !== categoryFilter) return false;
      if (globalFilter.status && globalFilter.status !== 'all') {
        if (globalFilter.status === 'open' && cust.status !== 'Hot Lead' && cust.status !== 'Lead')
          return false;
        if (globalFilter.status === 'completed' && cust.status !== 'Customer') return false;
      }
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        return (
          cust.name.toLowerCase().includes(q) ||
          cust.phone.toLowerCase().includes(q) ||
          cust.location.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // Sort newest first by created timestamp, then raw ID
          if (b.createdAtNum !== a.createdAtNum) return b.createdAtNum - a.createdAtNum;
          return b.rawId - a.rawId;

        case 'oldest':
          // Sort earliest first by created timestamp, then raw ID
          if (a.createdAtNum !== b.createdAtNum) return a.createdAtNum - b.createdAtNum;
          return a.rawId - b.rawId;

        case 'name_asc':
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

        case 'name_desc':
          return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });

        case 'spent_desc':
          return b.totalSpent - a.totalSpent;

        case 'jobs_desc':
          return b.jobsCount - a.jobsCount;

        default:
          return 0;
      }
    });
  }, [customers, categoryFilter, globalFilter, effectiveSearch, sortBy]);

  const totalLifetimeRev = customers.reduce((acc, c) => acc + (Number(c.totalSpent) || 0), 0);
  const totalFulfilledJobs = customers.reduce((acc, c) => acc + (Number(c.jobsCount) || 0), 0);
  const verifiedCount = customers.filter((c) => c.status === 'Customer').length;
  const leadsCount = customers.filter((c) => c.status === 'Lead').length;
  const hotLeadsCount = customers.filter((c) => c.status === 'Hot Lead').length;
  const vendorsCount = customers.filter((c) => c.status === 'Vendor').length;

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Customer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Vendor':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hot Lead':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Lead':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleOpenChat = (cust: any) => {
    if (cust.conversationId) {
      setSelectedConversationId(cust.conversationId);
    } else {
      const cleanP = cust.phone.replace(/\D/g, '').slice(-10);
      const existing = conversations.find(
        (c) => cleanP && String(c.phone_number || '').replace(/\D/g, '').slice(-10) === cleanP
      );
      if (existing) {
        setSelectedConversationId(existing.id);
      } else {
        setSelectedConversationId(cust.id);
      }
    }
    setActiveTab('conversations');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Customers 360 Directory"
        subtitle="Complete database of verified customers, vendors, interaction timelines, and lifetime revenues."
        primaryActionLabel="Add Customer"
        onPrimaryAction={() => setIsAddModalOpen(true)}
      />

      <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Contacts</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{customers.length}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5">360 Directory profiles</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Verified Customers</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{verifiedCount}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Active accounts</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Vendors</div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{vendorsCount}</div>
            <div className="text-[10px] sm:text-[11px] text-amber-600 font-medium mt-0.5">Suppliers & partners</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Lifetime Revenue</div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">₹{totalLifetimeRev.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-blue-600 font-medium mt-0.5">Across all services</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Jobs Fulfilled</div>
            <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">{totalFulfilledJobs}</div>
            <div className="text-[10px] sm:text-[11px] text-purple-600 font-medium mt-0.5">{hotLeadsCount} hot prospects</div>
          </div>
        </div>

        {/* Search, Sort & Filter Toolbar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          <div className="flex flex-1 items-center gap-2 max-w-full lg:max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers by name, phone, or location..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Menu Dropdown */}
            <div className="relative shrink-0" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 transition cursor-pointer"
                title="Sort customers"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline text-xs">
                  {SORT_OPTIONS.find((s) => s.id === sortBy)?.label.split(' ')[0] || 'Sort'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isSortDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-40 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sort Customers By
                  </div>
                  {SORT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <span className="text-slate-400 font-medium whitespace-nowrap text-[11px] hidden xl:inline">
              {filteredCustomers.length} of {customers.length}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 lg:pb-0">
            {[
              { id: 'all', label: `All (${customers.length})` },
              { id: 'Customer', label: `Customers (${verifiedCount})` },
              { id: 'Lead', label: `Leads (${leadsCount})` },
              { id: 'Hot Lead', label: `Hot Leads (${hotLeadsCount})` },
              { id: 'Vendor', label: `Vendors (${vendorsCount})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap text-xs ${
                  categoryFilter === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[720px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 select-none">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                    onClick={() => setSortBy((prev) => (prev === 'name_asc' ? 'name_desc' : 'name_asc'))}
                    title="Click to sort by Name"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer Name</span>
                      {sortBy === 'name_asc' && <ArrowDownAZ className="w-3.5 h-3.5 text-emerald-600" />}
                      {sortBy === 'name_desc' && <ArrowUpAZ className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  </th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Location</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                    onClick={() => setSortBy((prev) => (prev === 'jobs_desc' ? 'recent' : 'jobs_desc'))}
                    title="Click to sort by Total Jobs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Total Jobs</span>
                      {sortBy === 'jobs_desc' && <Briefcase className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                    onClick={() => setSortBy((prev) => (prev === 'spent_desc' ? 'recent' : 'spent_desc'))}
                    title="Click to sort by Lifetime Revenue"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Lifetime Revenue</span>
                      {sortBy === 'spent_desc' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  </th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-600 text-xs">No contacts found</span>
                        <span className="text-[11px] text-slate-400">
                          {search ? 'Try adjusting your search criteria' : 'Click "Add Customer" to create a new profile'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar
                            name={cust.name}
                            avatar={cust.avatar}
                            phone={cust.phone}
                            id={cust.id}
                            size="sm"
                            showPresence={true}
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{cust.name}</span>
                            <span className="text-[10px] text-slate-400">{cust.lastSeen}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{cust.phone}</td>
                      <td className="py-3.5 px-4 text-slate-500">{cust.location}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{cust.jobsCount} completed</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">₹{cust.totalSpent.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(cust.status)}`}>
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenChat(cust)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chat</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Contact"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(cust)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-4 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Add New Contact</h3>
                  <p className="text-[11px] text-slate-500">Register customer or vendor profile and phone.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Anand Varma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone / WhatsApp *</label>
                <CountryPhoneInput
                  value={form.phone}
                  onChange={(val) => setForm({ ...form, phone: val })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Calicut"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Hot Lead">Hot Lead</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-4 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Customer / Vendor</h3>
                  <p className="text-[11px] text-slate-500">Update client profile and location.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  placeholder="e.g. Anand Varma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone / WhatsApp *</label>
                <CountryPhoneInput
                  value={editingCustomer.phone}
                  onChange={(val) => setEditingCustomer({ ...editingCustomer, phone: val })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={editingCustomer.location}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, location: e.target.value })}
                    placeholder="e.g. Calicut"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={editingCustomer.category}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Hot Lead">Hot Lead</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm shadow-blue-700/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Contact?</h3>
                <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-bold text-slate-900">{deletingCustomer.name}</span> (
              {deletingCustomer.phone}) from the directory?
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingCustomer(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm shadow-rose-700/20 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;

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
  ChevronRight,
  ChevronLeft,
  Building2,
  MapPin,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';
import { qiyamApi } from '@/api/qiyamApi';
import { INITIAL_MULTI_BRANCH_CUSTOMERS, syncCustomersWithBranches } from '@/store/customerSeedData';
import { isDateWithinInterval } from '@/utils/dateFilter';

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

export interface CustomerDirectoryItem {
  id: string | number;
  uniqueKey: string;
  source: 'customer' | 'conversation';
  conversationId?: string | number;
  name: string;
  company?: string;
  phone: string;
  cleanPhone: string;
  location: string;
  address?: string;
  branch?: string;
  tags?: string[];
  avatar?: string;
  totalSpent: number;
  jobsCount: number;
  status: 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor';
  lastSeen: string;
  createdAtNum: number;
  rawId: number;
}

const renderPaginationNumbers = (
  current: number,
  total: number,
  onSelect: (page: number) => void
) => {
  if (total <= 1) return null;
  const pages: (number | string)[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('ellipsis-start');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (current < total - 2) pages.push('ellipsis-end');
    if (!pages.includes(total)) pages.push(total);
  }

  return pages.map((p, idx) => {
    if (typeof p === 'string') {
      return (
        <span key={`ellipsis-${idx}`} className="px-1 py-1 text-slate-400 font-bold select-none text-xs">
          ...
        </span>
      );
    }
    const isActive = p === current;
    return (
      <button
        key={`page-${p}`}
        type="button"
        onClick={() => onSelect(p as number)}
        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${
          isActive
            ? 'bg-emerald-600 text-white shadow-2xs'
            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
        }`}
      >
        {p}
      </button>
    );
  });
};

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
    customerBranchFilter,
    setCustomerBranchFilter,
    globalDateInterval,
    branches,
  } = useQiyamStore();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor'>('all');
  const [sortBy, setSortBy] = useState<CustomerSortOption>('recent');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: 'Kozhikode, Kerala',
    category: 'Customer' as 'Customer' | 'Hot Lead' | 'Lead' | 'Vendor',
  });

  // Duplicate Phone Number Conflict Resolution State
  const [duplicateConflict, setDuplicateConflict] = useState<{
    isOpen: boolean;
    existing: CustomerDirectoryItem;
    pendingForm: {
      name: string;
      phone: string;
      location: string;
      category: 'Customer' | 'Hot Lead' | 'Lead' | 'Vendor';
    };
  } | null>(null);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);

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

  // Close sort and branch dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    if (isSortDropdownOpen || isBranchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen, isBranchDropdownOpen]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, customerBranchFilter, sortBy]);

  // Ensure all registered branches have customer records, and sync fresh backend records
  useEffect(() => {
    const state = useQiyamStore.getState();
    const currentCustomers = state.customers || [];
    const allBranchesRepresented = (state.branches || []).every((b) =>
      currentCustomers.some(
        (c: any) =>
          c.branch === b.name ||
          (Array.isArray(c.tags) && c.tags.includes(b.name))
      )
    );

    if (!allBranchesRepresented || currentCustomers.length < 500) {
      const synced = syncCustomersWithBranches(currentCustomers, state.branches);
      useQiyamStore.setState({ customers: synced });
    }

    qiyamApi
      .fetchCustomers()
      .then((custs) => {
        if (Array.isArray(custs) && custs.length > 0) {
          const current = useQiyamStore.getState();
          const synced = syncCustomersWithBranches(custs, current.branches);
          useQiyamStore.setState({ customers: synced });
        }
      })
      .catch((e) => console.warn('[CustomersView] Could not fetch fresh customers:', e));
  }, [branches]);

  // Primary source of truth: storeCustomers. Secondary: unsaved conversation contacts.
  // Guaranteed UNIQUE and stable keys for React reconciliation.
  const customers = useMemo<CustomerDirectoryItem[]>(() => {
    const list: CustomerDirectoryItem[] = [];
    const seenPhones = new Set<string>();

    // Map conversations by clean 10-digit phone
    const convByPhone = new Map<string, any>();
    (conversations || []).forEach((c) => {
      const cleanPhone = String(c.phone_number || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone) convByPhone.set(cleanPhone, c);
    });

    // 1. Process storeCustomers first (source of truth for directory)
    (storeCustomers || []).forEach((sc: any, idx: number) => {
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

      const stableId = sc.id ?? `sc_${cleanPhone || idx}`;
      const uniqueKey = `cust_sc_${stableId}_${cleanPhone || idx}`;
      const loc = sc.address || sc.location || matchedConv?.location || 'Kozhikode, Kerala';
      const locLower = loc.toLowerCase();
      const resolvedBranch = sc.branch ||
        (Array.isArray(sc.tags) && sc.tags.find((t: string) => branches.some((b) => b.name.toLowerCase() === String(t).toLowerCase()))) ||
        branches.find((b) => locLower.includes(b.name.toLowerCase()) || (b.city && locLower.includes(b.city.toLowerCase())))?.name ||
        (locLower.includes('delhi') ? 'Delhi Branch' :
         locLower.includes('kashmir') ? 'kashmir' :
         locLower.includes('chennai') ? 'Chennai Branch' :
         locLower.includes('hyderabad') ? 'Hyderabad Branch' :
         locLower.includes('calicut') ? 'calicut' :
         locLower.includes('bangalore') ? 'Bangalore Branch' :
         locLower.includes('kochi') ? 'Kochi Branch' :
         locLower.includes('mumbai') ? 'Mumbai Branch' : 'Head Office');

      list.push({
        id: stableId,
        uniqueKey,
        source: 'customer',
        conversationId: matchedConv?.id,
        name: sc.name || sc.contact_name || matchedConv?.contact_name || 'Unnamed',
        company: sc.company,
        phone: rawPhone || matchedConv?.phone_number || '',
        cleanPhone,
        location: loc,
        branch: resolvedBranch,
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
    (conversations || []).forEach((c, idx: number) => {
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

      const stableId = c.id ?? `conv_${cleanPhone || idx}`;
      const uniqueKey = `cust_conv_${stableId}_${cleanPhone || idx}`;
      const cLoc = c.location || 'Kozhikode, Kerala';
      const cLocLower = cLoc.toLowerCase();
      const resolvedCBranch = (Array.isArray(c.tags) && c.tags.find((t: string) => branches.some((b) => b.name.toLowerCase() === String(t).toLowerCase()))) ||
        branches.find((b) => cLocLower.includes(b.name.toLowerCase()) || (b.city && cLocLower.includes(b.city.toLowerCase())))?.name ||
        (cLocLower.includes('delhi') ? 'Delhi Branch' :
         cLocLower.includes('kashmir') ? 'kashmir' :
         cLocLower.includes('chennai') ? 'Chennai Branch' :
         cLocLower.includes('hyderabad') ? 'Hyderabad Branch' :
         cLocLower.includes('calicut') ? 'calicut' :
         cLocLower.includes('bangalore') ? 'Bangalore Branch' :
         cLocLower.includes('kochi') ? 'Kochi Branch' :
         cLocLower.includes('mumbai') ? 'Mumbai Branch' : 'Head Office');

      list.push({
        id: stableId,
        uniqueKey,
        source: 'conversation',
        conversationId: c.id,
        name: c.contact_name || 'Unnamed',
        company: (c as any).company,
        phone: c.phone_number || '',
        cleanPhone,
        location: cLoc,
        branch: resolvedCBranch,
        avatar: c.avatar,
        totalSpent: (c.estimated_value || 2800) * 2,
        jobsCount: 1,
        status: ['Customer', 'Lead', 'Hot Lead', 'Vendor'].includes(cat) ? cat : 'Customer',
        lastSeen: c.last_contact_date || 'Recent',
        createdAtNum: 0,
        rawId: typeof c.id === 'number' ? c.id : 0,
      });
    });

    return list;
  }, [storeCustomers, conversations]);

  // Live detection of duplicate phone number while typing in Add Contact modal
  const detectedDuplicate = useMemo(() => {
    const cleanDigits = form.phone.replace(/\D/g, '');
    if (cleanDigits.length < 7) return null;
    const last10 = cleanDigits.slice(-10);
    return (
      (customers as CustomerDirectoryItem[]).find(
        (c) => c.cleanPhone && c.cleanPhone.length >= 7 && c.cleanPhone === last10
      ) || null
    );
  }, [form.phone, customers]);

  const proceedCreateCustomer = async (formData: typeof form) => {
    const trimmedName = formData.name.trim();
    await addCustomer({
      contact_name: trimmedName,
      name: trimmedName,
      phone_number: formData.phone.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim() || 'Kozhikode, Kerala',
      address: formData.location.trim() || 'Kozhikode, Kerala',
      category: formData.category,
      tags: [formData.category],
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
    setDuplicateConflict(null);
  };

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

    const last10 = cleanDigits.slice(-10);
    const existing = (customers as CustomerDirectoryItem[]).find(
      (c) => c.cleanPhone && c.cleanPhone.length >= 7 && c.cleanPhone === last10
    );

    if (existing) {
      setDuplicateConflict({
        isOpen: true,
        existing,
        pendingForm: { ...form },
      });
      return;
    }

    await proceedCreateCustomer(form);
  };

  // Conflict Resolution: Update existing contact with pending name/category
  const handleResolveUpdateExisting = async () => {
    if (!duplicateConflict) return;
    const { existing, pendingForm } = duplicateConflict;
    setIsResolvingConflict(true);
    try {
      await updateCustomer(existing.id, {
        id: existing.id,
        name: pendingForm.name.trim(),
        contact_name: pendingForm.name.trim(),
        phone: existing.phone,
        phone_number: existing.phone,
        location: pendingForm.location.trim() || existing.location,
        address: pendingForm.location.trim() || existing.location,
        category: pendingForm.category,
        tags: [pendingForm.category],
      });
      setDuplicateConflict(null);
      setIsAddModalOpen(false);
      setForm({ name: '', phone: '', location: 'Kozhikode, Kerala', category: 'Customer' });
      addToast(`Updated ${existing.name}'s profile to "${pendingForm.name}"`, 'success');
    } catch (err) {
      console.error('Failed to update contact:', err);
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // Conflict Resolution: Delete existing contact and replace with new
  const handleResolveDeleteAndReplace = async () => {
    if (!duplicateConflict) return;
    const { existing, pendingForm } = duplicateConflict;
    setIsResolvingConflict(true);
    try {
      await deleteCustomer(existing.id, existing.phone);
      await proceedCreateCustomer(pendingForm);
      addToast(
        `Deleted old contact "${existing.name}" and registered new profile "${pendingForm.name}"`,
        'success'
      );
    } catch (err) {
      console.error('Failed to replace contact:', err);
      addToast('Failed to replace contact', 'error');
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // Conflict Resolution: Open existing in Edit Modal
  const handleResolveEditExisting = () => {
    if (!duplicateConflict) return;
    const existing = duplicateConflict.existing;
    setDuplicateConflict(null);
    setIsAddModalOpen(false);
    handleOpenEdit(existing);
    addToast(`Editing existing contact: ${existing.name}`, 'info');
  };

  const handleCancelConflict = () => {
    setDuplicateConflict(null);
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

  // Robust Search, Category and Status filtering
  const filteredCustomers = useMemo<CustomerDirectoryItem[]>(() => {
    const q = (search || globalFilter.query || '').trim().toLowerCase();
    const cleanQ = q.replace(/\D/g, '');

    const result = customers.filter((cust) => {
      // 0. Date Interval Filter
      const custDate = cust.createdAtNum || cust.lastSeen || (cust as any).createdOn || (cust as any).createdAt;
      if (!isDateWithinInterval(custDate, globalDateInterval)) return false;

      // 1. Branch Filter
      if (customerBranchFilter && customerBranchFilter !== 'all') {
        const target = customerBranchFilter.trim().toLowerCase();
        const cBranch = (cust.branch || '').toLowerCase();
        const cTags = Array.isArray((cust as any).tags) ? (cust as any).tags.map((t: string) => String(t).toLowerCase()) : [];
        const cLoc = (cust.location || cust.address || '').toLowerCase();

        const branchMatch =
          cBranch === target ||
          (cBranch && (cBranch.includes(target) || target.includes(cBranch))) ||
          cTags.some((t: string) => t === target || t.includes(target) || target.includes(t));

        const cityKeyword = target.replace(' branch', '').replace(' head office', 'kozhikode').trim();
        const locMatch = cLoc && (
          (cityKeyword.length > 2 && cLoc.includes(cityKeyword)) ||
          (target.includes('bangalore') && cLoc.includes('bangalore')) ||
          (target.includes('kochi') && (cLoc.includes('kochi') || cLoc.includes('kakkanad') || cLoc.includes('infopark'))) ||
          (target.includes('head office') && (cLoc.includes('kozhikode') || cLoc.includes('koyilandy') || cLoc.includes('calicut'))) ||
          (target.includes('calicut') && (cLoc.includes('calicut') || cLoc.includes('kozhikode') || cLoc.includes('koyilandy'))) ||
          (target.includes('kashmir') && (cLoc.includes('kashmir') || cLoc.includes('ladakh') || cLoc.includes('leh'))) ||
          (target.includes('mumbai') && (cLoc.includes('mumbai') || cLoc.includes('bkc') || cLoc.includes('bandra'))) ||
          (target.includes('chennai') && cLoc.includes('chennai')) ||
          (target.includes('hyderabad') && cLoc.includes('hyderabad')) ||
          (target.includes('delhi') && (cLoc.includes('delhi') || cLoc.includes('noida') || cLoc.includes('gurugram')))
        );

        if (!branchMatch && !locMatch) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all' && cust.status !== categoryFilter) return false;

      // 3. Global status filter (if any)
      if (globalFilter.status && globalFilter.status !== 'all') {
        if (globalFilter.status === 'open' && cust.status !== 'Hot Lead' && cust.status !== 'Lead')
          return false;
        if (globalFilter.status === 'completed' && cust.status !== 'Customer') return false;
      }

      // 4. Search query matching across name, location, status, raw phone and stripped digits
      if (q) {
        const nameMatch = cust.name.toLowerCase().includes(q);
        const locMatch = cust.location.toLowerCase().includes(q);
        const catMatch = cust.status.toLowerCase().includes(q);
        const phoneMatch = cust.phone.toLowerCase().includes(q);
        const phoneClean = cust.cleanPhone || cust.phone.replace(/\D/g, '');
        const phoneDigitsMatch = cleanQ.length >= 2 && phoneClean.includes(cleanQ);

        return nameMatch || locMatch || catMatch || phoneMatch || phoneDigitsMatch;
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
  }, [customers, categoryFilter, globalFilter, search, sortBy, customerBranchFilter, globalDateInterval]);

  // Scoped customers represent either all customers or customers in the currently selected branch
  const scopedCustomers = useMemo(() => {
    if (!customerBranchFilter || customerBranchFilter === 'all') return customers;
    const target = customerBranchFilter.toLowerCase();
    const cityKeyword = target.replace(' branch', '').replace(' head office', 'kozhikode');
    return customers.filter((cust) => {
      const branchMatch = cust.branch && cust.branch.toLowerCase().includes(target);
      const locMatch = cust.location && (
        cust.location.toLowerCase().includes(cityKeyword) ||
        (target.includes('bangalore') && cust.location.toLowerCase().includes('bangalore')) ||
        (target.includes('kochi') && (cust.location.toLowerCase().includes('kochi') || cust.location.toLowerCase().includes('kakkanad') || cust.location.toLowerCase().includes('infopark'))) ||
        (target.includes('head office') && (cust.location.toLowerCase().includes('kozhikode') || cust.location.toLowerCase().includes('koyilandy') || cust.location.toLowerCase().includes('calicut'))) ||
        (target.includes('mumbai') && (cust.location.toLowerCase().includes('mumbai') || cust.location.toLowerCase().includes('bkc') || cust.location.toLowerCase().includes('bandra'))) ||
        (target.includes('chennai') && cust.location.toLowerCase().includes('chennai')) ||
        (target.includes('hyderabad') && cust.location.toLowerCase().includes('hyderabad')) ||
        (target.includes('delhi') && (cust.location.toLowerCase().includes('delhi') || cust.location.toLowerCase().includes('noida') || cust.location.toLowerCase().includes('gurugram')))
      );
      return branchMatch || locMatch;
    });
  }, [customers, customerBranchFilter]);

  const totalLifetimeRev = scopedCustomers.reduce((acc, c) => acc + (Number(c.totalSpent) || 0), 0);
  const totalFulfilledJobs = scopedCustomers.reduce((acc, c) => acc + (Number(c.jobsCount) || 0), 0);
  const verifiedCount = scopedCustomers.filter((c) => c.status === 'Customer').length;
  const leadsCount = scopedCustomers.filter((c) => c.status === 'Lead').length;
  const hotLeadsCount = scopedCustomers.filter((c) => c.status === 'Hot Lead').length;
  const vendorsCount = scopedCustomers.filter((c) => c.status === 'Vendor').length;

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

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
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{scopedCustomers.length}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5">
              {customerBranchFilter && customerBranchFilter !== 'all'
                ? `${customerBranchFilter} territory`
                : '360 Directory profiles'}
            </div>
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
          <div className="flex flex-1 items-center gap-2 max-w-full lg:max-w-2xl">
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

            {/* Branch Selector Dropdown */}
            <div className="relative shrink-0" ref={branchDropdownRef}>
              <button
                type="button"
                onClick={() => setIsBranchDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl font-semibold transition cursor-pointer text-xs ${
                  customerBranchFilter && customerBranchFilter !== 'all'
                    ? 'bg-purple-50 border-purple-300 text-purple-800'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title="Filter by Branch / Territory"
              >
                <Building2
                  className={`w-3.5 h-3.5 ${
                    customerBranchFilter && customerBranchFilter !== 'all'
                      ? 'text-purple-600'
                      : 'text-slate-500'
                  }`}
                />
                <span className="hidden sm:inline">
                  {customerBranchFilter && customerBranchFilter !== 'all'
                    ? customerBranchFilter
                    : 'All Branches'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isBranchDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isBranchDropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-40 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Territory / Branch
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerBranchFilter(null);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                      !customerBranchFilter || customerBranchFilter === 'all'
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>All Branches ({customers.length})</span>
                    </div>
                    {(!customerBranchFilter || customerBranchFilter === 'all') && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  {branches.map((b) => {
                    const isSelected = customerBranchFilter === b.name;
                    const bTarget = b.name.trim().toLowerCase();
                    const bCity = (b.city || '').trim().toLowerCase();
                    const bCount = customers.filter((c) => {
                      const cBranch = (c.branch || '').toLowerCase();
                      const cTags = Array.isArray((c as any).tags)
                        ? (c as any).tags.map((t: string) => String(t).toLowerCase())
                        : [];
                      const cLoc = (c.location || c.address || '').toLowerCase();
                      return (
                        cBranch === bTarget ||
                        (cBranch && (cBranch.includes(bTarget) || bTarget.includes(cBranch))) ||
                        cTags.some((t: string) => t === bTarget || t.includes(bTarget) || bTarget.includes(t)) ||
                        (bCity.length > 2 && cLoc.includes(bCity))
                      );
                    }).length;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setCustomerBranchFilter(b.name);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 text-purple-800 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-purple-600' : 'text-slate-400'
                            }`}
                          />
                          <div>
                            <div>{b.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {b.city}, {b.state}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {bCount}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
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

            <span className="text-slate-400 font-medium whitespace-nowrap text-[11px] hidden sm:inline">
              {filteredCustomers.length} of {scopedCustomers.length}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 lg:pb-0">
            {[
              { id: 'all', label: `All (${scopedCustomers.length})` },
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

        {/* Active Branch Filter Banner */}
        {customerBranchFilter && customerBranchFilter !== 'all' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 via-indigo-50/40 to-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-purple-950">
                  Viewing {customerBranchFilter} Accounts
                </div>
                <div className="text-[11px] text-purple-700">
                  Showing <strong>{filteredCustomers.length}</strong> active customer accounts in territory.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('branches');
                  addToast(`Returning to Branches view...`, 'info');
                }}
                className="px-2.5 py-1 bg-white hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Branch Hub</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomerBranchFilter(null)}
                className="px-2.5 py-1 bg-purple-200 hover:bg-purple-300 text-purple-900 rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <X className="w-3 h-3" />
                <span>Show All Branches</span>
              </button>
            </div>
          </div>
        )}

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
                        <span className="font-semibold text-slate-600 text-xs">
                          {search.trim() ? `No contacts matching "${search.trim()}"` : 'No contacts found'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {search.trim() ? (
                            <button
                              type="button"
                              onClick={() => setSearch('')}
                              className="text-emerald-600 font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Clear search query</span>
                              <X className="w-3 h-3" />
                            </button>
                          ) : (
                            'Click "Add Customer" to create a new profile'
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((cust) => (
                    <tr key={cust.uniqueKey} className="hover:bg-slate-50/80 transition-colors">
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
                            {cust.company && cust.company !== cust.name && (
                              <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                                {cust.company}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">{cust.lastSeen}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{cust.phone}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="font-medium text-slate-800">{cust.location}</div>
                        {cust.branch && (
                          <div className="text-[10px] text-purple-700 font-bold inline-flex items-center gap-1 mt-0.5 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100">
                            <Building2 className="w-2.5 h-2.5" />
                            <span>{cust.branch}</span>
                          </div>
                        )}
                      </td>
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

          {/* Pagination Controls */}
          {filteredCustomers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 border-t border-slate-200 text-xs select-none">
              <div className="flex items-center gap-3 text-slate-500 font-medium">
                <span>
                  Showing <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                  <strong className="text-slate-800">
                    {Math.min(currentPage * pageSize, filteredCustomers.length)}
                  </strong>{' '}
                  of <strong className="text-slate-800">{filteredCustomers.length}</strong> accounts
                </span>
                <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200">
                  <span className="text-[11px] text-slate-400">Rows:</span>
                  {[25, 50, 100].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                        pageSize === size
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 flex items-center gap-1 cursor-pointer transition text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {renderPaginationNumbers(
                    currentPage,
                    Math.ceil(filteredCustomers.length / pageSize),
                    setCurrentPage
                  )}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= Math.ceil(filteredCustomers.length / pageSize)}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(Math.ceil(filteredCustomers.length / pageSize), p + 1)
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 flex items-center gap-1 cursor-pointer transition text-xs"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
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
                {detectedDuplicate && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between gap-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">
                        Already exists: <strong>{detectedDuplicate.name}</strong> ({detectedDuplicate.status})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDuplicateConflict({
                          isOpen: true,
                          existing: detectedDuplicate,
                          pendingForm: { ...form },
                        })
                      }
                      className="px-2 py-0.5 bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold rounded-md shrink-0 cursor-pointer transition-colors"
                    >
                      Resolve Conflict
                    </button>
                  </div>
                )}
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

      {/* Duplicate Phone Number Conflict Resolution Modal */}
      {duplicateConflict && duplicateConflict.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Phone Number Already Exists</h3>
                  <p className="text-[11px] text-slate-500">
                    A directory profile already uses this phone number.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelConflict}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Contact Card */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-950 space-y-2">
              <p className="font-semibold text-xs">
                Phone number{' '}
                <span className="font-mono font-bold text-amber-900">
                  {duplicateConflict.pendingForm.phone}
                </span>{' '}
                is already registered to:
              </p>
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <CustomerAvatar
                    name={duplicateConflict.existing.name}
                    avatar={duplicateConflict.existing.avatar}
                    phone={duplicateConflict.existing.phone}
                    id={duplicateConflict.existing.id}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {duplicateConflict.existing.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                          duplicateConflict.existing.status
                        )}`}
                      >
                        {duplicateConflict.existing.status}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2 truncate">
                      <span className="font-mono">{duplicateConflict.existing.phone}</span>
                      <span>•</span>
                      <span>{duplicateConflict.existing.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-800 text-xs">
                    ₹{duplicateConflict.existing.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {duplicateConflict.existing.jobsCount} completed jobs
                  </div>
                </div>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              You are attempting to add{' '}
              <strong className="text-slate-900">{duplicateConflict.pendingForm.name}</strong> as a{' '}
              <strong>{duplicateConflict.pendingForm.category}</strong>. Choose how you would like to
              handle this conflict:
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleResolveUpdateExisting}
                disabled={isResolvingConflict}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Pencil className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="font-bold block text-xs">
                      Update Existing Profile to "{duplicateConflict.pendingForm.name}"
                    </span>
                    <span className="text-[11px] text-blue-700/80">
                      Keeps interaction history and updates details to {duplicateConflict.pendingForm.name} (
                      {duplicateConflict.pendingForm.category})
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleResolveDeleteAndReplace}
                disabled={isResolvingConflict}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="font-bold block text-xs">
                      Delete Existing "{duplicateConflict.existing.name}" & Save New
                    </span>
                    <span className="text-[11px] text-rose-700/80">
                      Deletes {duplicateConflict.existing.name} and registers a clean new profile for{' '}
                      {duplicateConflict.pendingForm.name}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleResolveEditExisting}
                disabled={isResolvingConflict}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs">
                      Open Existing Profile in Edit Modal
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Review and manually edit existing contact fields
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleCancelConflict}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel & Change Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;

import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Users, Search, MessageSquare, X, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';

export const CustomersView: React.FC = () => {
  const { conversations, customers: storeCustomers, addCustomer, updateCustomer, deleteCustomer, setActiveTab, setSelectedConversationId, addToast, globalFilter } = useQiyamStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor'>('all');
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
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=100&auto=format&fit=crop&q=80`,
      estimated_value: 3000,
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

  // Merge conversations and store customers deduplicated by phone/name
  const customers = useMemo(() => {
    const list: Array<{
      id: string | number;
      name: string;
      phone: string;
      location: string;
      avatar?: string;
      totalSpent: number;
      jobsCount: number;
      status: 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor';
      lastSeen: string;
    }> = [];

    const seenPhones = new Set<string>();

    // 1. From conversations
    (conversations || []).forEach((c) => {
      const cleanPhone = String(c.phone_number || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone) seenPhones.add(cleanPhone);
      list.push({
        id: c.id,
        name: c.contact_name || 'Unnamed',
        phone: c.phone_number || '',
        location: c.location || 'Kozhikode, Kerala',
        avatar: c.avatar,
        totalSpent: (c.estimated_value || 2800) * 2,
        jobsCount: 3,
        status: (c.category as any) || 'Customer',
        lastSeen: c.last_contact_date || 'Recent',
      });
    });

    // 2. From storeCustomers (if any not already in conversations)
    (storeCustomers || []).forEach((sc: any) => {
      const rawPhone = String(sc.phone || sc.phone_number || '');
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
      if (cleanPhone && seenPhones.has(cleanPhone)) {
        return;
      }
      if (cleanPhone) seenPhones.add(cleanPhone);

      const cat = (sc.category || (Array.isArray(sc.tags) && sc.tags.find((t: string) => ['Customer', 'Lead', 'Hot Lead', 'Vendor'].includes(t))) || 'Customer') as any;
      list.unshift({
        id: sc.id || `sc_${Date.now()}_${Math.random()}`,
        name: sc.name || sc.contact_name || 'Unnamed',
        phone: rawPhone,
        location: sc.address || sc.location || 'Kozhikode, Kerala',
        avatar: sc.avatar,
        totalSpent: Number(sc.total_spent || sc.total_spend || 0) || 5600,
        jobsCount: Number(sc.jobs_count || sc.orders_count || 1),
        status: cat,
        lastSeen: sc.first_seen || sc.last_contact_date || 'Just now',
      });
    });

    return list;
  }, [conversations, storeCustomers]);

  const effectiveSearch = search || globalFilter.query || '';

  const filteredCustomers = customers.filter((cust) => {
    if (categoryFilter !== 'all' && cust.status !== categoryFilter) return false;
    if (globalFilter.status && globalFilter.status !== 'all') {
      if (globalFilter.status === 'open' && cust.status !== 'Hot Lead' && cust.status !== 'Lead') return false;
      if (globalFilter.status === 'completed' && cust.status !== 'Customer') return false;
    }
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      return cust.name.toLowerCase().includes(q) || cust.phone.includes(q) || cust.location.toLowerCase().includes(q);
    }
    return true;
  });

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
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5">360 Directory profile</div>
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

        {/* Search & Filter Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
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
            <span className="text-slate-400 font-medium whitespace-nowrap text-[11px] hidden sm:inline">
              {filteredCustomers.length} of {customers.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All Contacts (${customers.length})` },
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[720px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Total Jobs</th>
                  <th className="py-3 px-4">Lifetime Revenue</th>
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
                          <CustomerAvatar name={cust.name} avatar={cust.avatar} phone={cust.phone} id={cust.id} size="sm" showPresence={true} />
                          <span className="font-bold text-slate-900">{cust.name}</span>
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
                            onClick={() => {
                              setSelectedConversationId(cust.id);
                              setActiveTab('conversations');
                            }}
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
                  <h3 className="font-bold text-base text-slate-900">Add New Customer</h3>
                  <p className="text-[11px] text-slate-500">Register verified client profile and location.</p>
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
                <label className="font-bold text-slate-700">Customer Full Name *</label>
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
                    <option value="Hot Lead">Hot Lead</option>
                    <option value="Lead">Lead</option>
                    <option value="Vendor">Vendor</option>
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
                  Save Customer
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
                  <p className="text-[11px] text-slate-500">Update verified client profile and location.</p>
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
                <label className="font-bold text-slate-700">Customer Full Name *</label>
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
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Hot Lead">Hot Lead</option>
                    <option value="Lead">Lead</option>
                    <option value="Vendor">Vendor</option>
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
              Are you sure you want to delete <span className="font-bold text-slate-900">{deletingCustomer.name}</span> ({deletingCustomer.phone}) from the directory?
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

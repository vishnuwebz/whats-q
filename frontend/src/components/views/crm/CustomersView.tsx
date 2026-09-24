import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Users, Search, Filter, Plus, Phone, Mail, MapPin, MessageSquare, X, UserPlus } from 'lucide-react';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';

export const CustomersView: React.FC = () => {
  const { conversations, addCustomer, setActiveTab, setSelectedConversationId, addToast, globalFilter } = useQiyamStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Customer' | 'Lead' | 'Hot Lead'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: 'Kozhikode, Kerala',
    category: 'Customer',
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addCustomer({
      contact_name: form.name,
      name: form.name,
      phone_number: form.phone,
      phone: form.phone,
      location: form.location,
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

  const customers = conversations.map((c) => ({
    id: c.id,
    name: c.contact_name,
    phone: c.phone_number,
    location: c.location,
    avatar: c.avatar,
    totalSpent: (c.estimated_value || 2800) * 2,
    jobsCount: 3,
    status: c.category,
    lastSeen: c.last_contact_date,
  }));

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

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Customers 360 Directory"
        subtitle="Complete database of verified customers, interaction timelines, and lifetime revenues."
        primaryActionLabel="Add Customer"
        onPrimaryAction={() => setIsAddModalOpen(true)}
      />

      <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
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
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Lifetime Revenue</div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">₹{totalLifetimeRev.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] text-blue-600 font-medium mt-0.5">Across all services</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
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
                {filteredCustomers.map((cust) => (
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedConversationId(cust.id);
                          setActiveTab('conversations');
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </td>
                  </tr>
                ))}
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
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
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
    </div>
  );
};

import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Users, Search, Filter, Plus, Phone, Mail, MapPin, MessageSquare, X, UserPlus } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { conversations, addCustomer, setActiveTab, setSelectedConversationId, addToast, globalFilter } = useQiyamStore();
  const [search, setSearch] = useState('');
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

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Customers 360 Directory"
        subtitle="Complete database of verified customers, interaction timelines, and lifetime revenues."
        primaryActionLabel="Add Customer"
        onPrimaryAction={() => setIsAddModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
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
                      <img src={cust.avatar} alt={cust.name} className="w-8 h-8 rounded-full object-cover" />
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

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
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
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 97450 11223"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Calicut"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
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
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
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

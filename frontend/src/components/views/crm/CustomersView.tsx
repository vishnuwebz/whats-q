import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Users, Search, Filter, Plus, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { conversations, setActiveTab, setSelectedConversationId, addToast } = useQiyamStore();
  const [search, setSearch] = useState('');

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

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Customers 360 Directory"
        subtitle="Complete database of verified customers, interaction timelines, and lifetime revenues."
        primaryActionLabel="Add Customer"
        onPrimaryAction={() => addToast('Add customer modal opened', 'info')}
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
              {customers.map((cust) => (
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
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 ml-auto"
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
  );
};



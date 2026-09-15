import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Send,
  Trash2,
  Edit2,
  ChevronRight,
  X,
  PieChart,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkRecipientList } from '../../../types';
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const BulkRecipientListsView: React.FC = () => {
  const { bulkRecipientLists, createRecipientList, setActiveTab, addToast } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState<BulkRecipientList | null>(
    bulkRecipientLists[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Create List Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListTags, setNewListTags] = useState('Marketing, Q3');

  const filteredLists = useMemo(() => {
    return bulkRecipientLists.filter((list) => {
      const matchesSearch =
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [bulkRecipientLists, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      addToast('Please enter a list name', 'error');
      return;
    }

    createRecipientList({
      name: newListName.trim(),
      description: newListDesc.trim(),
      contactCount: 250,
      validWhatsAppCount: 246,
      tags: newListTags.split(',').map((t) => t.trim()),
    });

    setIsCreateOpen(false);
    setNewListName('');
    setNewListDesc('');
    addToast(`Recipient list "${newListName}" created!`, 'success');
  };

  const handleSendToList = (list: BulkRecipientList) => {
    addToast(`Selected list "${list.name}" for broadcasting!`, 'info');
    setActiveTab('bulk-send');
  };

  const handleCleanList = () => {
    addToast('Contact numbers validated against Meta WhatsApp Phone API!', 'success');
  };

  // Mock individual contacts for the drawer
  const sampleContacts = [
    { name: 'Dr. Tariq Al-Mansoor', phone: '+966 50 123 4567', tag: 'VIP', valid: true },
    { name: 'Rahul Sharma', phone: '+91 98765 43210', tag: 'Retail', valid: true },
    { name: 'Amina Al-Balushi', phone: '+968 9123 4567', tag: 'VIP', valid: true },
    { name: 'Vikram Menon', phone: '+91 94470 12345', tag: 'Corporate', valid: true },
    { name: 'Zainab Qasim', phone: '+971 52 345 6789', tag: 'Retail', valid: true },
    { name: 'Inactive Contact', phone: '+91 80000 00000', tag: 'Unverified', valid: false },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Recipient Lists & Segments
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AUDIENCE MANAGER
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage audience segments, imported contact sheets, and dynamic broadcast groups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                addToast('Importing contacts via CSV/Excel file...', 'info')
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Import CSV / Excel
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Create List
            </button>

            <MetaWalletCard compact={true} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-5">
        {/* Search & Summary Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lists by title, description, or tags..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong>{filteredLists.length}</strong> recipient lists
          </div>
        </div>

        {/* Recipient Lists Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">List Name</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-center">Total Contacts</th>
                  <th className="p-4">WhatsApp Validated</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLists.map((list) => {
                  const validityPct = ((list.validWhatsAppCount / list.contactCount) * 100).toFixed(
                    1
                  );
                  return (
                    <tr key={list.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{list.name}</div>
                        {list.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {list.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {list.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-800">
                        {list.contactCount.toLocaleString()}
                      </td>
                      <td className="p-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-bold text-emerald-700">{validityPct}%</span>
                          <span className="text-slate-400">
                            ({list.validWhatsAppCount.toLocaleString()} numbers)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${validityPct}%` }}
                            className="bg-emerald-500 h-full"
                          ></div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(list.createdAt).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedList(list);
                              setIsDrawerOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleSendToList(list)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Broadcast
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SLIDEOUT RECIPIENT LIST DRAWER WITH CONTACT SOURCE DONUT CHART */}
      {isDrawerOpen && selectedList && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedList.name}</h3>
                <p className="text-[10px] text-slate-500">
                  {selectedList.contactCount.toLocaleString()} total contacts •{' '}
                  {selectedList.validWhatsAppCount.toLocaleString()} verified WhatsApp users
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* CONTACT SOURCE DONUT CHART / BREAKDOWN (MATCHING SCREENSHOT 4) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    Contact Source Breakdown
                  </span>
                  <span className="text-[10px] text-slate-400">Audience Attribution</span>
                </div>

                {/* Donut representation */}
                <div className="flex items-center gap-5 pt-1">
                  {/* Visual CSS Donut */}
                  <div className="relative w-20 h-20 rounded-full bg-[conic-gradient(#059669_0%_42%,#2563eb_42%_70%,#d97706_70%_88%,#9333ea_88%_100%)] flex items-center justify-center shrink-0 shadow-xs">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[11px] text-slate-800">
                      100%
                    </div>
                  </div>

                  {/* Donut Legends */}
                  <div className="space-y-1 text-[11px] flex-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        CRM Leads
                      </span>
                      <span className="font-bold text-slate-900">42%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        Website Signups
                      </span>
                      <span className="font-bold text-slate-900">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        Manual Import (CSV)
                      </span>
                      <span className="font-bold text-slate-900">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        POS Billing Sync
                      </span>
                      <span className="font-bold text-slate-900">12%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation & Clean tools */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    WhatsApp Validation Health
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    {selectedList.validWhatsAppCount} of {selectedList.contactCount} numbers active
                    on WhatsApp
                  </div>
                </div>
                <button
                  onClick={handleCleanList}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Verify Active
                </button>
              </div>

              {/* Sample Contacts in this list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Contacts Sample Preview:</span>
                  <span className="text-[10px] text-slate-400">First 6 records</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">WhatsApp Number</th>
                        <th className="p-2.5">Tag</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sampleContacts.map((c, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-medium text-slate-800">{c.name}</td>
                          <td className="p-2.5 font-mono text-[10px] text-slate-600">{c.phone}</td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-semibold">
                              {c.tag}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                c.valid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {c.valid ? 'Verified' : 'Invalid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => addToast('Exporting cleaned recipient sheet (.csv)...', 'info')}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>

              <button
                onClick={() => handleSendToList(selectedList)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast to this List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LIST MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create New Recipient List</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">List Name</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. VIP Customers - Kerala"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Description</label>
                <input
                  type="text"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="e.g. High-value repeat customers with > ₹10,000 spend"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={newListTags}
                  onChange={(e) => setNewListTags(e.target.value)}
                  placeholder="VIP, Retail, High-Value"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

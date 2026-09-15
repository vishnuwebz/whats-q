import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Repeat,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ChevronRight,
  X,
  TrendingUp,
  MessageSquare,
  Users,
  Wallet,
  BarChart2,
  ShieldAlert,
  Send,
  CheckCheck,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkCampaign } from '../../../types';
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const BulkCampaignHistoryView: React.FC = () => {
  const { bulkCampaigns, duplicateCampaign, setActiveTab, addToast } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<BulkCampaign | null>(
    bulkCampaigns[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'preview' | 'recipients' | 'errors'>(
    'overview'
  );

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return bulkCampaigns.filter((camp) => {
      const matchesSearch =
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.audienceListName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.templateName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || camp.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [bulkCampaigns, searchQuery, statusFilter]);

  // Aggregate Metrics
  const totalCampaigns = bulkCampaigns.length;
  const totalMessagesSent = bulkCampaigns.reduce((acc, c) => acc + c.totalRecipients, 0);
  const totalDelivered = bulkCampaigns.reduce((acc, c) => acc + c.deliveredCount, 0);
  const avgDeliveryRate = totalMessagesSent > 0 ? (totalDelivered / totalMessagesSent) * 100 : 98.4;
  const totalMetaSpend = bulkCampaigns.reduce((acc, c) => acc + c.cost, 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRepeatCampaign = (camp: BulkCampaign) => {
    duplicateCampaign(camp.id);
    addToast(`Duplicated "${camp.name}" into a new campaign!`, 'success');
    setActiveTab('bulk-send');
  };

  const handleExportCSV = () => {
    addToast('Downloading detailed campaign audit report (.csv)...', 'info');
  };

  // Mock recipients for campaign details tab 3
  const sampleRecipients = [
    { name: 'Dr. Faisal Al-Zahrani', phone: '+966 50 123 4567', status: 'READ', time: '10:46 AM' },
    { name: 'Ananya Sharma', phone: '+91 98765 43210', status: 'READ', time: '10:45 AM' },
    { name: 'Mohammed Tariq', phone: '+971 55 987 6543', status: 'DELIVERED', time: '10:45 AM' },
    { name: 'Pooja Varma', phone: '+91 98200 11223', status: 'READ', time: '10:48 AM' },
    { name: 'Kareem Mansour', phone: '+966 54 888 7766', status: 'DELIVERED', time: '10:47 AM' },
    { name: 'Invalid Contact 104', phone: '+91 90000 00000', status: 'FAILED', time: '10:45 AM' },
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
                  Campaign History
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AUDIT LOGS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Track broadcast performance, delivery rates, read rates, and cost analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>

            <button
              onClick={() => setActiveTab('bulk-send')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              + New Campaign
            </button>

            <MetaWalletCard compact={true} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Total Campaigns</span>
              <History className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCampaigns}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-semibold">
              All-time broadcast logs
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Total Messages Broadcast</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalMessagesSent.toLocaleString()}
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5 font-semibold">
              Recipients reached
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Avg Delivery Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {avgDeliveryRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-semibold">
              High tier deliverability
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Total Meta Spend</span>
              <Wallet className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatMoney(totalMetaSpend)}
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5 font-semibold">
              Cloud API deductions
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by campaign name, audience list, template..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="sending">Sending</option>
              <option value="scheduled">Scheduled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Campaign Name</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Template</th>
                  <th className="p-4 text-center">Recipients</th>
                  <th className="p-4">Delivery Rate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Meta Cost</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampaigns.map((camp) => {
                  const delRate = ((camp.deliveredCount / camp.totalRecipients) * 100).toFixed(1);
                  const readRate = ((camp.readCount / camp.totalRecipients) * 100).toFixed(1);
                  const isCompleted = camp.status === 'COMPLETED';
                  const isSending = camp.status === 'SENDING';
                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{camp.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(camp.createdAt).toLocaleDateString('en-IN', {
                            dateStyle: 'medium',
                          })}
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{camp.audienceListName}</td>
                      <td className="p-4">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {camp.templateName}
                        </span>
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-800">
                        {camp.totalRecipients.toLocaleString()}
                      </td>
                      <td className="p-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-bold text-emerald-700">{delRate}%</span>
                          <span className="text-slate-400">({readRate}% read)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${delRate}%` }}
                            className="bg-emerald-500 h-full"
                          ></div>
                          <div
                            style={{ width: `${(camp.failedCount / camp.totalRecipients) * 100}%` }}
                            className="bg-rose-400 h-full"
                          ></div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isSending
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900">
                        {formatMoney(camp.cost)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCampaign(camp);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRepeatCampaign(camp)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                            title="Repeat Campaign"
                          >
                            <Repeat className="w-4 h-4" />
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

      {/* SLIDEOUT 4-TAB DETAILS DRAWER */}
      {isDrawerOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedCampaign.name}</h3>
                <p className="text-[10px] text-slate-500">
                  ID: {selectedCampaign.id} • Created{' '}
                  {new Date(selectedCampaign.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Tabs */}
            <div className="flex border-b border-slate-200 px-4 pt-2 bg-slate-50 gap-2 text-xs font-semibold">
              <button
                onClick={() => setDrawerTab('overview')}
                className={`pb-2 px-2.5 border-b-2 transition ${
                  drawerTab === 'overview'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDrawerTab('preview')}
                className={`pb-2 px-2.5 border-b-2 transition ${
                  drawerTab === 'preview'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Message
              </button>
              <button
                onClick={() => setDrawerTab('recipients')}
                className={`pb-2 px-2.5 border-b-2 transition ${
                  drawerTab === 'recipients'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Recipients Log
              </button>
              <button
                onClick={() => setDrawerTab('errors')}
                className={`pb-2 px-2.5 border-b-2 transition ${
                  drawerTab === 'errors'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Errors ({selectedCampaign.failedCount})
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* TAB 1: OVERVIEW */}
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 uppercase font-semibold">
                        Delivered
                      </span>
                      <div className="text-xl font-black text-emerald-950 mt-0.5">
                        {selectedCampaign.deliveredCount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-emerald-700">
                        {(
                          (selectedCampaign.deliveredCount / selectedCampaign.totalRecipients) *
                          100
                        ).toFixed(1)}
                        % rate
                      </span>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-blue-800 uppercase font-semibold">Read</span>
                      <div className="text-xl font-black text-blue-950 mt-0.5">
                        {selectedCampaign.readCount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-blue-700">
                        {(
                          (selectedCampaign.readCount / selectedCampaign.totalRecipients) *
                          100
                        ).toFixed(1)}
                        % open rate
                      </span>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <span className="text-[10px] text-purple-800 uppercase font-semibold">
                        Replies
                      </span>
                      <div className="text-xl font-black text-purple-950 mt-0.5">
                        {selectedCampaign.repliedCount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-purple-700">
                        {(
                          (selectedCampaign.repliedCount / selectedCampaign.totalRecipients) *
                          100
                        ).toFixed(1)}
                        % response rate
                      </span>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-[10px] text-rose-800 uppercase font-semibold">
                        Failed
                      </span>
                      <div className="text-xl font-black text-rose-950 mt-0.5">
                        {selectedCampaign.failedCount}
                      </div>
                      <span className="text-[10px] text-rose-700">Non-WhatsApp / DND</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Audience Group:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCampaign.audienceListName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Template Used:</span>
                      <span className="font-mono text-slate-800">
                        {selectedCampaign.templateName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Meta Wallet Charged:</span>
                      <span className="font-bold text-slate-900">
                        {formatMoney(selectedCampaign.cost)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MESSAGE PREVIEW */}
              {drawerTab === 'preview' && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-800 text-[11px]">
                    Dispatched Message Bubble:
                  </span>
                  <div className="bg-[#ECE5DD] p-4 rounded-2xl border border-slate-300">
                    <div className="bg-white rounded-xl shadow-xs p-3.5 space-y-2 text-slate-800 border border-slate-200/80">
                      <div className="font-semibold text-xs text-slate-900 leading-relaxed">
                        Hello Valued Customer, our Diwali Super Saver is live! Use code FESTIVE30 to
                        get 30% OFF on all services until Sunday Midnight. Tap below to claim.
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        Reply STOP to unsubscribe
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400">
                        <span>10:45 AM</span>
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RECIPIENTS LOG */}
              {drawerTab === 'recipients' && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 text-[11px]">
                    Individual Contact Dispatch Log:
                  </span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Phone</th>
                          <th className="p-2">Status</th>
                          <th className="p-2 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sampleRecipients.map((rec, i) => (
                          <tr key={i}>
                            <td className="p-2 font-medium text-slate-800">{rec.name}</td>
                            <td className="p-2 text-slate-500 font-mono text-[10px]">
                              {rec.phone}
                            </td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  rec.status === 'READ'
                                    ? 'bg-blue-100 text-blue-800'
                                    : rec.status === 'DELIVERED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td className="p-2 text-right text-slate-400">{rec.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ERRORS */}
              {drawerTab === 'errors' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>{selectedCampaign.failedCount} messages</strong> could not be delivered
                      due to invalid WhatsApp accounts or recipient DND preferences.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="font-semibold text-slate-800">Failure Breakdown:</div>
                    <div className="flex justify-between text-slate-600">
                      <span>Recipient number not on WhatsApp:</span>
                      <span className="font-bold text-slate-800">
                        {Math.floor(selectedCampaign.failedCount * 0.7)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>User opted out (STOP):</span>
                      <span className="font-bold text-slate-800">
                        {Math.ceil(selectedCampaign.failedCount * 0.3)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleRepeatCampaign(selectedCampaign)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Repeat className="w-3.5 h-3.5" />
                Repeat Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BarChart3, TrendingUp, Clock, CheckCircle2, MessageSquare, PieChart } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartPie, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { exportTableToCsv } from '@/utils/exportCsv';

export const AnalyticsView: React.FC = () => {
  const store = useQiyamStore();
  const { addToast } = store;

  const handleExport = () => {
    const res = exportTableToCsv('analytics', store);
    addToast(`Analytics report exported (${res.filename})`, 'success');
  };

  const channelData = [
    { name: 'Web Chat', value: 5801, color: '#3B82F6', percent: '45.2%' },
    { name: 'Mobile App', value: 3688, color: '#8B5CF6', percent: '28.7%' },
    { name: 'WhatsApp', value: 2003, color: '#10B981', percent: '15.6%' },
    { name: 'Email', value: 964, color: '#F59E0B', percent: '7.5%' },
    { name: 'Others', value: 389, color: '#64748B', percent: '3.0%' },
  ];

  const intentData = [
    { intent: 'Getting Info', count: 3254, percent: 25.3 },
    { intent: 'How To / Guide', count: 2487, percent: 19.3 },
    { intent: 'Account & Access', count: 1934, percent: 15.0 },
    { intent: 'Orders & Delivery', count: 1742, percent: 13.6 },
    { intent: 'Billing & Payments', count: 1328, percent: 10.3 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Analytics & Intent Intelligence"
        subtitle="Multi-channel conversation breakdown, resolution rates, and AI customer intent analytics."
        primaryActionLabel="Export Analytics"
        onPrimaryAction={handleExport}
      />

      <div className="p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Total Conversations</div>
            <div className="text-2xl font-black text-slate-900 mt-1">12,845</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">↑ 18.2% vs last month</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Avg. AI Response Time</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">2.6 sec</div>
            <div className="text-[11px] text-slate-500 mt-1">Instant bot replies</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">First Contact Resolution</div>
            <div className="text-2xl font-black text-purple-600 mt-1">92.6%</div>
            <div className="text-[11px] text-purple-600 font-bold mt-1">Resolved in 1 session</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold">Customer CSAT</div>
            <div className="text-2xl font-black text-amber-500 mt-1">4.9 / 5.0</div>
            <div className="text-[11px] text-slate-500 mt-1">98.4% satisfaction</div>
          </div>
        </div>

        {/* 2 Chart Cards (Matching photo_23) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Channel Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Conversations by Channel</h3>
              <p className="text-xs text-slate-500">Distribution across WhatsApp, Web Chat, and Mobile</p>
            </div>

            <div className="flex items-center justify-around py-2">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPie>
                    <Pie data={channelData} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={4}>
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartPie>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {channelData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value.toLocaleString()} ({item.percent})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Intent Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Customer Intent Classification</h3>
              <p className="text-xs text-slate-500">Top extracted inquiry categories by AI bot</p>
            </div>

            <div className="space-y-3 text-xs">
              {intentData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{item.intent}</span>
                    <span className="font-bold">{item.count.toLocaleString()} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.percent * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



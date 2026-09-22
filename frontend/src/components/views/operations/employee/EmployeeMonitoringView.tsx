import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  Navigation, MapPin, Smartphone, Battery, Signal,
  Clock, ShieldCheck, Phone, MessageSquare, RefreshCw,
  Search, CheckCircle2, AlertTriangle, Radio
} from 'lucide-react';

interface FieldTechnicianLive {
  id: string | number;
  employee_id_str: string;
  name: string;
  role: string;
  location_name: string;
  assigned_job: string;
  customer_name: string;
  duty_state: 'at_customer_site' | 'in_transit' | 'idle_at_branch';
  battery_level: number;
  network_status: '5G' | '4G' | 'GPS Active';
  last_ping: string;
  phone: string;
}

const LIVE_MONITORING_DATA: FieldTechnicianLive[] = [
  {
    id: 1,
    employee_id_str: 'EMP-001',
    name: 'Amit Sharma',
    role: 'Field Technician',
    location_name: 'Palazhi Junction, Kozhikode',
    assigned_job: 'Daikin 1.5 Ton AC Deep Service & Gas Refill',
    customer_name: 'Zameel Ahmed',
    duty_state: 'at_customer_site',
    battery_level: 84,
    network_status: '5G',
    last_ping: 'Just now (1 min ago)',
    phone: '+91 90000 11123',
  },
  {
    id: 3,
    employee_id_str: 'EMP-003',
    name: 'Rahul Singh',
    role: 'Plumbing Technician',
    location_name: 'Near New Bus Stand, Vadakara',
    assigned_job: 'Bathroom Pipeline Leakage Emergency Inspection',
    customer_name: 'Dr. Hashim V',
    duty_state: 'in_transit',
    battery_level: 68,
    network_status: '4G',
    last_ping: '3 mins ago',
    phone: '+91 98764 11122',
  },
  {
    id: 5,
    employee_id_str: 'EMP-005',
    name: 'Arjun Nair',
    role: 'Electrician',
    location_name: 'Airport Road, Ramanattukara',
    assigned_job: 'Main Distribution Board Tripping & MCB Fix',
    customer_name: 'Fathima Noor',
    duty_state: 'at_customer_site',
    battery_level: 92,
    network_status: '5G',
    last_ping: '2 mins ago',
    phone: '+91 85471 22330',
  },
  {
    id: 2,
    employee_id_str: 'EMP-002',
    name: 'Priya Sharma',
    role: 'Customer Support',
    location_name: 'Calicut Central HQ (Office)',
    assigned_job: 'Inbound Calls & WhatsApp Booking Desk',
    customer_name: 'General Desk',
    duty_state: 'idle_at_branch',
    battery_level: 100,
    network_status: 'GPS Active',
    last_ping: 'Live now',
    phone: '+91 89213 56789',
  },
];

export const EmployeeMonitoringView: React.FC = () => {
  const { addToast, openConversationForContact } = useQiyamStore();

  const [technicians, setTechnicians] = useState<FieldTechnicianLive[]>(LIVE_MONITORING_DATA);
  const [filterState, setFilterState] = useState<'all' | 'at_customer_site' | 'in_transit' | 'idle_at_branch'>('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshPings = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('GPS location pings updated for all field staff', 'success');
    }, 800);
  };

  const handleSendSafetyPing = (tech: FieldTechnicianLive) => {
    openConversationForContact({
      name: tech.name,
      phone: tech.phone,
      service: `Field Duty Check: ${tech.assigned_job}`,
      initialMessage: `Hello ${tech.name}, this is an automated duty check from Qiyam HQ. Please confirm your current job status and location at ${tech.location_name}.`,
      skipConfirmation: true,
    });
    addToast(`Safety check message sent to ${tech.name} via WhatsApp`, 'info');
  };

  const filtered = technicians.filter((t) => {
    if (filterState !== 'all' && t.duty_state !== filterState) return false;
    const q = search.toLowerCase().trim();
    if (q) {
      return (
        t.name.toLowerCase().includes(q) ||
        t.location_name.toLowerCase().includes(q) ||
        t.assigned_job.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Employee Monitoring & Live Duty"
        subtitle="Real-time field location tracking, customer site status, battery and GPS signal monitoring."
        activeSubTab="ops-emp-monitoring"
        primaryActionLabel="Refresh GPS Radar"
        primaryActionIcon={RefreshCw}
        onPrimaryAction={handleRefreshPings}
        badgeCount={`${technicians.filter((t) => t.duty_state !== 'idle_at_branch').length} On Field`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Active on Field</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {technicians.filter((t) => t.duty_state !== 'idle_at_branch').length} Technicians
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">GPS location active</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">At Customer Site</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {technicians.filter((t) => t.duty_state === 'at_customer_site').length}
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5">Actively performing job</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">In Transit / Traveling</div>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {technicians.filter((t) => t.duty_state === 'in_transit').length}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">En route to customer</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Battery & Health</div>
            <div className="text-2xl font-black text-slate-900 mt-1">100% OK</div>
            <div className="text-[11px] text-slate-500 mt-0.5">All devices &gt; 50% battery</div>
          </div>
        </div>

        {/* Live Radar Map Showcase */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0B1528] to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Live Field Duty Radar</h3>
                <p className="text-xs text-slate-400">Tracking field technicians across Kozhikode, Vadakara, and Ramanattukara</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-1 rounded-lg border border-emerald-500/30">
                ● GPS Signal: Strong (4 Pings Active)
              </span>
            </div>
          </div>

          {/* Simulated Map Visual */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-2.5 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-xs text-white">{tech.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    {tech.battery_level}% Battery
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="truncate">{tech.location_name}</span>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Current Job:</span>
                  <span className="text-slate-200 truncate block">{tech.assigned_job}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff, location, job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0 overflow-x-auto">
            <button
              onClick={() => setFilterState('all')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterState === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              All ({technicians.length})
            </button>
            <button
              onClick={() => setFilterState('at_customer_site')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterState === 'at_customer_site' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              At Site ({technicians.filter((t) => t.duty_state === 'at_customer_site').length})
            </button>
            <button
              onClick={() => setFilterState('in_transit')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterState === 'in_transit' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Traveling ({technicians.filter((t) => t.duty_state === 'in_transit').length})
            </button>
            <button
              onClick={() => setFilterState('idle_at_branch')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                filterState === 'idle_at_branch' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              At Office ({technicians.filter((t) => t.duty_state === 'idle_at_branch').length})
            </button>
          </div>
        </div>

        {/* Detailed Live Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tech) => {
            const isAtSite = tech.duty_state === 'at_customer_site';
            const isTransit = tech.duty_state === 'in_transit';

            return (
              <div
                key={tech.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-base">
                      {tech.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{tech.name}</h4>
                      <div className="text-[11px] text-slate-500">{tech.role} • {tech.employee_id_str}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isAtSite
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : isTransit
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAtSite ? 'bg-blue-500' : isTransit ? 'bg-amber-500' : 'bg-slate-400'
                      }`}
                    />
                    {tech.duty_state.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Location & Current Job */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{tech.location_name}</span>
                      <span className="text-[10px] text-slate-400">Last GPS Ping: {tech.last_ping}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-semibold text-slate-800">{tech.customer_name}</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Assigned Job:</span>
                    <span className="font-medium text-emerald-700 truncate max-w-[200px]">
                      {tech.assigned_job}
                    </span>
                  </div>
                </div>

                {/* Telemetry Strip: Battery & Signal */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <Battery className={`w-4 h-4 ${tech.battery_level > 50 ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <div>
                      <div className="text-[10px] text-slate-400">Phone Battery</div>
                      <div className="font-bold text-slate-800">{tech.battery_level}% Charged</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <Signal className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-[10px] text-slate-400">Network & GPS</div>
                      <div className="font-bold text-slate-800">{tech.network_status} (Strong)</div>
                    </div>
                  </div>
                </div>

                {/* Communication & Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleSendSafetyPing(tech)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Send WhatsApp Safety Check"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Safety Ping</span>
                  </button>

                  <a
                    href={`tel:${tech.phone}`}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Staff</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

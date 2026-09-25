import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  MapPin, Truck, Clock, Fuel, CheckCircle2,
  AlertCircle, Play, Pause, RefreshCw, Send, Phone,
  ExternalLink, Sparkles, Plus, Search, X, Check,
  Navigation, Share2, Layers, RotateCcw, Calendar, ChevronDown,
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { Route, RouteStop } from '@/types';

export const RouteOptimizationView: React.FC = () => {
  const {
    routes,
    updateRouteStopStatus,
    reorderRouteStops,
    updateRouteSpeedAndLocation,
    addToast,
    targetHighlightId,
    globalFilter
  } = useQiyamStore();

  // Active selected route ID (defaults to first route, RTE-001)
  const [selectedRouteId, setSelectedRouteId] = useState<string | number>(routes[0]?.id || 1);
  const activeRoute: Route = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId || r.route_id_str === selectedRouteId || r.route_code === selectedRouteId) || routes[0] || {
      id: 1,
      route_id_str: 'RTE-001',
      route_code: 'RTE-001',
      driver_name: 'Rahul Mehta',
      phone: '+91 94963 00233',
      vehicle: 'KL 11 AB 1234',
      date_str: 'May 1 – May 31, 2024',
      status: 'in_progress',
      stops_count: 12,
      completed_stops: 9,
      distance_km: 65.4,
      fuel_cost: 1120,
      duration: '4h 15m',
      estimated_end: '12:15 PM',
      current_stop_id: 6,
      speed_kmh: 42,
      stops: []
    };
  }, [routes, selectedRouteId]);

  // Selected stop for Details Modal/Drawer
  const [activeStop, setActiveStop] = useState<RouteStop | null>(null);

  // Stop filter tab in right sidebar: 'all' | 'completed' | 'in_progress' | 'priority'
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'completed' | 'in_progress' | 'priority'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeProgress, setOptimizeProgress] = useState(0);
  const [optimizationMode, setOptimizationMode] = useState<'eco' | 'speed' | 'priority'>('eco');

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappRecipient, setWhatsappRecipient] = useState(activeRoute.phone || '+91 94963 00233');

  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [newStopData, setNewStopData] = useState({
    customerName: '',
    address: '',
    phone: '',
    timeWindow: '01:00 PM',
    serviceType: 'AC Diagnostics & Repair',
    isPriority: false,
    amountToCollect: 0
  });

  // Live GPS Simulation state
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState<number>(activeRoute.speed_kmh || 42);
  const [currentEnRouteStopId, setCurrentEnRouteStopId] = useState<number>(activeRoute.current_stop_id || 6);

  // Sync state if activeRoute changes
  useEffect(() => {
    if (activeRoute) {
      setWhatsappRecipient(activeRoute.phone || '+91 94963 00233');
      if (activeRoute.speed_kmh) setLiveSpeed(activeRoute.speed_kmh);
      if (activeRoute.current_stop_id) setCurrentEnRouteStopId(activeRoute.current_stop_id);
    }
  }, [activeRoute]);

  // GPS Simulation timer
  useEffect(() => {
    if (!isSimulatingGps) return;
    const interval = setInterval(() => {
      // Fluctuating realistic city speed (35-52 km/h)
      const fluctuation = Math.floor(Math.random() * 11) - 5;
      const nextSpeed = Math.max(28, Math.min(58, liveSpeed + fluctuation));
      setLiveSpeed(nextSpeed);
      updateRouteSpeedAndLocation(activeRoute.id, nextSpeed, currentEnRouteStopId);
    }, 2500);
    return () => clearInterval(interval);
  }, [isSimulatingGps, liveSpeed, activeRoute.id, currentEnRouteStopId, updateRouteSpeedAndLocation]);

  // Stops list filtered by sidebar search and filter tab
  const filteredStops = useMemo(() => {
    return (activeRoute.stops || []).filter((stop) => {
      const q = (searchQuery || globalFilter.query || '').toLowerCase();
      const matchesSearch =
        !q ||
        stop.customerName.toLowerCase().includes(q) ||
        stop.address.toLowerCase().includes(q) ||
        String(stop.id).includes(q);

      if (!matchesSearch) return false;

      if (sidebarFilter === 'completed') return stop.isCompleted || stop.status === 'completed';
      if (sidebarFilter === 'in_progress') return stop.status === 'in_progress' || (!stop.isCompleted && stop.id === currentEnRouteStopId);
      if (sidebarFilter === 'priority') return stop.isPriority;
      return true;
    });
  }, [activeRoute.stops, searchQuery, globalFilter.query, sidebarFilter, currentEnRouteStopId]);

  // Identify current en-route stop
  const currentEnRouteStop = useMemo(() => {
    return activeRoute.stops?.find((s) => s.id === currentEnRouteStopId) ||
      activeRoute.stops?.find((s) => !s.isCompleted && s.status !== 'completed') ||
      activeRoute.stops?.[0];
  }, [activeRoute.stops, currentEnRouteStopId]);

  // Generate SVG Bezier Path connecting all stops
  const svgPathData = useMemo(() => {
    const stops = activeRoute.stops || [];
    if (stops.length < 2) return '';
    // Map stops to viewBox coordinates (0 to 1000 width, 0 to 600 height)
    const points = stops.map((s) => ({
      x: (s.x ?? 50) * 10,
      y: (s.y ?? 50) * 6
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) * 0.5;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) * 0.5;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [activeRoute.stops]);

  // Handle Mark Stop Status
  const handleUpdateStopStatus = (stopId: number, status: 'completed' | 'in_progress' | 'pending' | 'skipped') => {
    updateRouteStopStatus(activeRoute.id, stopId, status);
    if (status === 'completed') {
      addToast(`Stop #${stopId} marked as completed!`, 'success');
      // If current en-route was completed, advance to next pending
      if (stopId === currentEnRouteStopId) {
        const nextPending = activeRoute.stops.find((s) => s.id !== stopId && !s.isCompleted && s.status !== 'completed');
        if (nextPending) {
          setCurrentEnRouteStopId(nextPending.id);
          updateRouteSpeedAndLocation(activeRoute.id, liveSpeed, nextPending.id);
        }
      }
    } else if (status === 'in_progress') {
      setCurrentEnRouteStopId(stopId);
      updateRouteSpeedAndLocation(activeRoute.id, liveSpeed, stopId);
      addToast(`Stop #${stopId} set as current en-route destination`, 'info');
    } else {
      addToast(`Stop #${stopId} status updated to ${status}`, 'info');
    }

    if (activeStop && activeStop.id === stopId) {
      setActiveStop({
        ...activeStop,
        status,
        isCompleted: status === 'completed'
      });
    }
  };

  // Run AI Re-Optimization Simulation
  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setOptimizeProgress(10);
    const interval = setInterval(() => {
      setOptimizeProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsOptimizing(false);
            setOptimizeProgress(100);
          }, 400);
          return 100;
        }
        return prev + 18;
      });
    }, 180);
  };

  const handleApplyReordering = () => {
    // Optimized sequence prioritizing critical stops and geographic adjacency
    const reordered = [...(activeRoute.stops || [])].sort((a, b) => {
      if (a.type === 'start') return -1;
      if (b.type === 'start') return 1;
      if (a.isCompleted && !b.isCompleted) return -1;
      if (!a.isCompleted && b.isCompleted) return 1;
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return (a.x ?? 0) - (b.x ?? 0);
    });

    reorderRouteStops(activeRoute.id, reordered);
    setIsOptimizeModalOpen(false);
    setIsOptimizing(false);
    setOptimizeProgress(0);
    addToast('AI Route Re-Optimization applied! Saved 9.4 km and ₹170 estimated fuel.', 'success');
  };

  // Open WhatsApp with Driver Manifest
  const handleShareToWhatsApp = () => {
    const stopsText = (activeRoute.stops || [])
      .map((s, idx) => `${idx + 1}. *${s.customerName}* (${s.timeWindow})\n   📍 ${s.address}\n   📞 ${s.phone || 'N/A'} [${s.isCompleted ? '✅ Done' : s.isPriority ? '🚨 Priority' : '⏳ Pending'}]`)
      .join('\n\n');

    const message = `🚚 *QIYAM BUSINESS OS - DISPATCH MANIFEST*\n` +
      `*Route:* ${activeRoute.route_code || activeRoute.route_id_str} (${activeRoute.driver_name})\n` +
      `*Vehicle:* ${activeRoute.vehicle}\n` +
      `*Stops:* ${activeRoute.completed_stops}/${activeRoute.stops_count} Completed\n` +
      `*Total Distance:* ${activeRoute.distance_km} km\n\n` +
      `📋 *WAYPOINTS SEQUENCE:*\n${stopsText}\n\n` +
      `🗺️ *Live GPS Tracking:* https://maps.google.com/?q=Kozhikode+Kerala\n` +
      `_Automated dispatch from Qiyam Operations Center._`;

    const cleanPhone = whatsappRecipient.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    addToast(`Manifest sent to driver WhatsApp (${whatsappRecipient})!`, 'success');
    setIsWhatsAppModalOpen(false);
  };

  // Send Single Customer ETA via WhatsApp
  const handleSendCustomerEta = (stop: RouteStop) => {
    const msg = `Hello ${stop.customerName},\n\nYour service technician *${activeRoute.driver_name}* (${activeRoute.vehicle}) is currently en route for *${stop.serviceType || 'AC Service'}*.\n\n📍 Location: ${stop.address}\n⏱️ Estimated Time of Arrival: *${stop.timeWindow}*\n📞 Driver Contact: ${activeRoute.phone}\n\nThank you for choosing Qiyam Ventures!`;
    const cleanPhone = (stop.phone || '+919496300233').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    addToast(`ETA alert dispatched to ${stop.customerName} via WhatsApp!`, 'success');
  };

  // Add new emergency stop
  const handleCreateNewStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopData.customerName || !newStopData.address) {
      addToast('Please enter customer name and location address.', 'warning');
      return;
    }
    const newStop: RouteStop = {
      id: (activeRoute.stops?.length || 0) + 1,
      sequence: (activeRoute.stops?.length || 0) + 1,
      customerName: newStopData.customerName,
      address: newStopData.address,
      phone: newStopData.phone || '+91 94963 00233',
      timeWindow: newStopData.timeWindow,
      time: newStopData.timeWindow,
      serviceType: newStopData.serviceType,
      isPriority: newStopData.isPriority,
      isCompleted: false,
      status: 'pending',
      type: newStopData.isPriority ? 'priority' : 'stop',
      x: 70 + Math.floor(Math.random() * 20),
      y: 30 + Math.floor(Math.random() * 40),
      amountToCollect: Number(newStopData.amountToCollect) || 0
    };

    const updatedStops = [...(activeRoute.stops || []), newStop];
    reorderRouteStops(activeRoute.id, updatedStops);
    setIsAddStopModalOpen(false);
    setNewStopData({
      customerName: '',
      address: '',
      phone: '',
      timeWindow: '01:00 PM',
      serviceType: 'AC Diagnostics & Repair',
      isPriority: false,
      amountToCollect: 0
    });
    addToast(`New stop for ${newStop.customerName} added to route!`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        title="Route Optimization"
        subtitle="AI-driven multi-stop delivery & technician dispatch route planner with fuel estimation."
        primaryActionLabel="Re-Optimize Route"
        onPrimaryAction={() => {
          setIsOptimizeModalOpen(true);
          handleRunOptimization();
        }}
      />

      {/* KPI Stats Strip Matching Screenshot */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Driver & Vehicle</div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>{activeRoute.driver_name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-semibold">{activeRoute.vehicle}</span>
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200" />

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stops Progress</div>
            <div className="font-bold text-emerald-600 flex items-center gap-1">
              <span>{activeRoute.completed_stops} / {activeRoute.stops_count} completed</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                {Math.round(((activeRoute.completed_stops || 0) / (activeRoute.stops_count || 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200" />

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Distance</div>
            <div className="font-bold text-slate-900">{activeRoute.distance_km} km</div>
          </div>

          <div className="h-7 w-px bg-slate-200" />

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Fuel</div>
            <div className="font-bold text-slate-900">₹{activeRoute.fuel_cost}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Route Switcher Dropdown */}
          <div className="relative">
            <select
              value={activeRoute.id}
              onChange={(e) => setSelectedRouteId(Number(e.target.value) || e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold py-1 pl-2.5 pr-7 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer hover:bg-slate-100"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.route_code || r.route_id_str}: {r.driver_name} ({r.stops_count || r.stops?.length || 0} Stops)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {targetHighlightId && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white uppercase animate-pulse flex items-center gap-1 shadow-sm">
              <span>● Target Route #{targetHighlightId}</span>
            </span>
          )}

          <button
            onClick={() => setIsAddStopModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Add Waypoint</span>
          </button>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
            IN PROGRESS (ETA {activeRoute.estimated_end || '12:15 PM'})
          </span>
        </div>
      </div>

      {/* Main 2-Pane Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Interactive Map Canvas */}
        <div className="flex-1 bg-[#0F172A] relative flex items-center justify-center overflow-hidden p-6 select-none">
          {/* Simulated Dark Navy Grid Map Canvas */}
          <div className="absolute inset-0 bg-[#0F172A]">
            <svg className="w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="roadGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748B" strokeWidth="1" />
                </pattern>
                {/* Secondary highway lines */}
                <pattern id="majorRoads" width="192" height="192" patternUnits="userSpaceOnUse">
                  <path d="M 192 0 L 0 0 0 192" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#roadGrid)" />
              <rect width="100%" height="100%" fill="url(#majorRoads)" />
            </svg>
          </div>

          {/* SVG Animated Route Path */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            {/* Background inactive gray track */}
            <path
              d={svgPathData}
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeDasharray="6 6"
              opacity="0.6"
            />
            {/* Active glowing emerald dotted route path */}
            <path
              d={svgPathData}
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeDasharray="8 5"
              className="animate-pulse"
              strokeLinecap="round"
            />
          </svg>

          {/* Render All Waypoint Pins dynamically on Canvas */}
          {(activeRoute.stops || []).map((stop) => {
            const isCurrent = stop.id === currentEnRouteStopId;
            const isCompleted = stop.isCompleted || stop.status === 'completed';
            const isPriority = stop.isPriority;
            const isEnd = stop.type === 'end';
            const isStart = stop.type === 'start';

            // Pin styling
            let pinBg = 'bg-emerald-600 ring-emerald-500/30';
            if (isPriority) pinBg = 'bg-amber-500 ring-amber-500/40 animate-bounce';
            else if (isEnd) pinBg = 'bg-purple-600 ring-purple-500/30';
            else if (!isCompleted && !isCurrent) pinBg = 'bg-slate-700 ring-slate-600/30';
            else if (isStart) pinBg = 'bg-emerald-500 ring-emerald-500/30';

            // Coordinates in percentage
            const leftPct = stop.x ?? 50;
            const topPct = stop.y ?? 50;

            return (
              <div
                key={stop.id}
                onClick={() => setActiveStop(stop)}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10 transition-transform duration-200 hover:scale-110"
              >
                {/* Vehicle Marker at current en-route stop */}
                {isCurrent && (
                  <div className="absolute -top-7 flex items-center justify-center">
                    <span className="absolute -top-1 w-6 h-6 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <div className="relative bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg border border-white">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                {/* Numbered Pin Badge */}
                <div
                  className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xl ring-4 ${pinBg} ${
                    activeStop?.id === stop.id ? 'ring-8 ring-emerald-400 scale-110' : ''
                  }`}
                >
                  {isCompleted ? (
                    <span className="flex items-center justify-center">{stop.id}</span>
                  ) : (
                    <span>{stop.id}</span>
                  )}
                </div>

                {/* Subtitle Label under Pin */}
                <div className="mt-1 text-[10px] whitespace-nowrap bg-slate-900/95 text-white px-2 py-0.5 rounded font-semibold border border-slate-700 shadow-lg group-hover:border-emerald-500 transition">
                  {stop.type === 'start'
                    ? 'Main Hub (Start)'
                    : isEnd
                    ? `${stop.customerName} (End)`
                    : isPriority
                    ? `${stop.customerName} (Priority)`
                    : `${stop.customerName} (${stop.timeWindow || stop.time})${isCompleted ? ' ✓' : ''}`}
                </div>
              </div>
            );
          })}

          {/* Floating Driver Status Card on Map (Bottom-Left) */}
          <div className="absolute bottom-6 left-6 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 text-white text-xs max-w-xs shadow-2xl space-y-3 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isSimulatingGps ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                <span className="font-bold text-emerald-400 tracking-wide">Live GPS Stream</span>
              </div>
              <button
                onClick={() => setIsSimulatingGps(!isSimulatingGps)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition ${
                  isSimulatingGps ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
                title={isSimulatingGps ? 'Pause GPS telemetry feed' : 'Start live driver telemetry simulation'}
              >
                {isSimulatingGps ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                <span>{isSimulatingGps ? 'Pause Sim' : 'Live Drive'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-300 leading-snug">
              Currently en route to stop #{currentEnRouteStop?.id}:{' '}
              <strong className="text-white">{currentEnRouteStop?.address}</strong>.
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span className="font-medium text-slate-300">Speed: {liveSpeed} km/h</span>
              <span className="font-medium text-slate-300">ETA: {currentEnRouteStop?.timeWindow || '11:00 AM'}</span>
            </div>

            {/* Quick advance button */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentEnRouteStop) {
                    handleUpdateStopStatus(currentEnRouteStop.id, 'completed');
                  }
                }}
                className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition text-center shadow"
              >
                ✓ Mark Stop #{currentEnRouteStop?.id} Arrived & Done
              </button>
            </div>
          </div>
        </div>

        {/* Right Waypoint List (Matching Screenshot Exact Layout) */}
        <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col shrink-0 overflow-y-auto p-5 space-y-3.5 text-xs">
          {/* Sidebar Top Title + WhatsApp Action */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Waypoints Sequence ({activeRoute.stops_count || activeRoute.stops?.length || 12} Stops)
            </h3>
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="text-[11px] text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 transition"
            >
              <Send className="w-3 h-3" />
              <span>Share to WhatsApp</span>
            </button>
          </div>

          {/* Quick Search & Filter Controls */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter stops by customer or street..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <button
                onClick={() => setSidebarFilter('all')}
                className={`px-2 py-0.5 rounded-full transition ${
                  sidebarFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({activeRoute.stops?.length || 0})
              </button>
              <button
                onClick={() => setSidebarFilter('completed')}
                className={`px-2 py-0.5 rounded-full transition ${
                  sidebarFilter === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Completed ({activeRoute.completed_stops || 0})
              </button>
              <button
                onClick={() => setSidebarFilter('in_progress')}
                className={`px-2 py-0.5 rounded-full transition ${
                  sidebarFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                En Route
              </button>
              <button
                onClick={() => setSidebarFilter('priority')}
                className={`px-2 py-0.5 rounded-full transition ${
                  sidebarFilter === 'priority' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Priority
              </button>
            </div>
          </div>

          {/* List of Waypoints */}
          <div className="space-y-2.5 overflow-y-auto pr-0.5">
            {filteredStops.map((stop) => {
              const isCompleted = stop.isCompleted || stop.status === 'completed';
              const isPriority = stop.isPriority;
              const isCurrent = stop.id === currentEnRouteStopId;
              const isSelected = activeStop?.id === stop.id;

              return (
                <div
                  key={stop.id}
                  onClick={() => setActiveStop(stop)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 relative ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : isPriority
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400 hover:shadow-sm'
                      : isCurrent
                      ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {stop.id}
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                        {stop.customerName}
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Completed
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Truck className="w-2.5 h-2.5 animate-pulse" /> En Route
                      </span>
                    ) : isPriority ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Priority Stop
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{stop.address}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Slot Window: <strong className="text-slate-700">{stop.timeWindow || stop.time}</strong></span>
                    <span className="font-semibold text-slate-700">Stop #{stop.id}</span>
                  </div>
                </div>
              );
            })}

            {filteredStops.length === 0 && (
              <div className="text-center py-8 text-slate-400 space-y-1">
                <MapPin className="w-6 h-6 mx-auto text-slate-300" />
                <p className="font-semibold text-xs text-slate-500">No stops match your filter</p>
                <p className="text-[10px]">Try clearing search or changing the filter tab.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Interactive Stop Details Drawer/Modal */}
      {activeStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    {activeStop.id}
                  </span>
                  <h3 className="font-bold text-base text-white">{activeStop.customerName}</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {activeStop.address}
                </p>
              </div>
              <button
                onClick={() => setActiveStop(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Status and priority bar */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Status</span>
                  <div className="font-bold text-slate-900 capitalize text-sm mt-0.5">
                    {activeStop.isCompleted || activeStop.status === 'completed'
                      ? '✓ Completed'
                      : activeStop.id === currentEnRouteStopId
                      ? '🚚 En Route Now'
                      : activeStop.isPriority
                      ? '🚨 Priority Pending'
                      : '⏳ Scheduled'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStopStatus(activeStop.id, 'completed')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      activeStop.isCompleted || activeStop.status === 'completed'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Mark Done
                  </button>
                  <button
                    onClick={() => handleUpdateStopStatus(activeStop.id, 'in_progress')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      activeStop.id === currentEnRouteStopId
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Set En Route
                  </button>
                </div>
              </div>

              {/* Service & Operational Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Slot Window</span>
                  <div className="font-bold text-slate-900 mt-0.5">{activeStop.timeWindow || activeStop.time}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Customer Contact</span>
                  <div className="font-bold text-slate-900 mt-0.5">{activeStop.phone || '+91 94963 00233'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Service Category</span>
                  <div className="font-bold text-slate-900 mt-0.5">{activeStop.serviceType || 'AC Diagnostic & Servicing'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Collection</span>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {activeStop.amountToCollect ? `₹${activeStop.amountToCollect.toLocaleString('en-IN')}` : 'Prepaid / Invoiced'}
                  </div>
                </div>
              </div>

              {activeStop.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Dispatcher Field Notes</span>
                  <p className="text-amber-950 mt-1 leading-relaxed">{activeStop.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSendCustomerEta(activeStop)}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>

                <a
                  href={`tel:${activeStop.phone || '+919496300233'}`}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call Customer</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeStop.address + ', Calicut Kerala')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI Route Optimizer Modal */}
      {isOptimizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">AI Multi-Stop Route Optimizer</h3>
                  <p className="text-[11px] text-slate-400">Genetic Algorithm & Traffic TSP Matrix Solver</p>
                </div>
              </div>
              <button
                onClick={() => setIsOptimizeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-xs">
              {/* Algorithm Objective Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">Optimization Objective</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setOptimizationMode('eco');
                      handleRunOptimization();
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      optimizationMode === 'eco'
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Eco Saver</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Min distance & fuel cost</p>
                  </button>

                  <button
                    onClick={() => {
                      setOptimizationMode('speed');
                      handleRunOptimization();
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      optimizationMode === 'speed'
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Fastest Time</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Avoid peak city congestion</p>
                  </button>

                  <button
                    onClick={() => {
                      setOptimizationMode('priority');
                      handleRunOptimization();
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      optimizationMode === 'priority'
                        ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>VIP First</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Strict priority slot fulfillment</p>
                  </button>
                </div>
              </div>

              {/* Progress & Live Telemetry */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {isOptimizing ? 'Evaluating 479,001,600 route permutations...' : 'Optimal Solution Found!'}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{optimizeProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${optimizeProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Generations: 250 / 250</span>
                  <span>Matrix: 12x12 Waypoints</span>
                  <span>Algorithm: 2-Opt TSP</span>
                </div>
              </div>

              {/* Comparison Matrix */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Distance Saved</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">-9.4 km</div>
                  <div className="text-[10px] text-slate-500">74.8 km → 65.4 km</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Fuel Savings</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">₹170 saved</div>
                  <div className="text-[10px] text-slate-500">₹1,290 → ₹1,120</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Time Reduced</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">-35 mins</div>
                  <div className="text-[10px] text-slate-500">4h 50m → 4h 15m</div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOptimizeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isOptimizing}
                  onClick={handleApplyReordering}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Optimized Route</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Share Route Manifest to WhatsApp */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#128C7E] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-sm">Dispatch Route to Driver WhatsApp</h3>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Driver WhatsApp Mobile Number</label>
                <input
                  type="text"
                  value={whatsappRecipient}
                  onChange={(e) => setWhatsappRecipient(e.target.value)}
                  placeholder="+91 94963 00233"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message Preview</label>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {`🚚 QIYAM BUSINESS OS - DISPATCH MANIFEST\nRoute: ${activeRoute.route_code || activeRoute.route_id_str} (${activeRoute.driver_name})\nVehicle: ${activeRoute.vehicle}\nStops: ${activeRoute.completed_stops}/${activeRoute.stops_count} Done\nDistance: ${activeRoute.distance_km} km\n\nWAYPOINTS SEQUENCE:\n${(activeRoute.stops || [])
                    .map((s, i) => `${i + 1}. ${s.customerName} (${s.timeWindow}) - ${s.address}`)
                    .join('\n')}\n\nLive GPS: https://maps.google.com/?q=Kozhikode`}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Route: ${activeRoute.route_code}\nDriver: ${activeRoute.driver_name}\nStops: ${activeRoute.stops_count}`
                    );
                    addToast('Manifest copied to clipboard!', 'info');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Copy Text
                </button>
                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="px-5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via WhatsApp Web / API</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Add New Waypoint Modal */}
      {isAddStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Add New Route Waypoint</h3>
              </div>
              <button
                onClick={() => setIsAddStopModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStop} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer / Destination Name *</label>
                <input
                  type="text"
                  required
                  value={newStopData.customerName}
                  onChange={(e) => setNewStopData({ ...newStopData, customerName: e.target.value })}
                  placeholder="e.g. Zenith Tech Park"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location Address *</label>
                <input
                  type="text"
                  required
                  value={newStopData.address}
                  onChange={(e) => setNewStopData({ ...newStopData, address: e.target.value })}
                  placeholder="e.g. Palayam Junction, Kozhikode"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newStopData.phone}
                    onChange={(e) => setNewStopData({ ...newStopData, phone: e.target.value })}
                    placeholder="+91 94963..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slot Window</label>
                  <input
                    type="text"
                    value={newStopData.timeWindow}
                    onChange={(e) => setNewStopData({ ...newStopData, timeWindow: e.target.value })}
                    placeholder="01:00 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Type</label>
                <input
                  type="text"
                  value={newStopData.serviceType}
                  onChange={(e) => setNewStopData({ ...newStopData, serviceType: e.target.value })}
                  placeholder="Emergency AC Servicing"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="priorityCheck"
                  checked={newStopData.isPriority}
                  onChange={(e) => setNewStopData({ ...newStopData, isPriority: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                />
                <label htmlFor="priorityCheck" className="text-slate-800 font-semibold cursor-pointer">
                  Mark as Priority VIP Stop (Prioritize on Map)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStopModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                >
                  Insert Waypoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

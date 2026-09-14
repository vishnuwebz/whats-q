import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Navigation, MapPin, Truck, Clock, Fuel, CheckCircle2,
  AlertCircle, ChevronRight, Play, RefreshCw, Send
} from 'lucide-react';

export const RouteOptimizationView: React.FC = () => {
  const { routes, addToast, targetHighlightId } = useQiyamStore();
  const fallbackRoute = {
    id: 1,
    route_code: 'RTE-001',
    driver_name: 'Ramesh Kumar',
    vehicle: 'Honda Activa (KL-11-BV-4021)',
    date_str: 'Today, May 12',
    stops_count: 8,
    completed_stops: 5,
    distance_km: 34.2,
    fuel_cost: 210,
    status: 'in_progress' as const,
    stops: [
      { id: 1, sequence: 1, customer: 'Amit Verma', address: 'Beach Road, Kozhikode', time: '09:30 AM', status: 'completed' as const },
      { id: 2, sequence: 2, customer: 'Priya Sharma', address: 'Mavoor Road, Kozhikode', time: '11:15 AM', status: 'in_progress' as const },
      { id: 3, sequence: 3, customer: 'Rahul Mehta', address: 'Koyilandy, Kerala', time: '02:00 PM', status: 'pending' as const },
    ]
  };
  const currentRoute = routes[0] || fallbackRoute;
  const [activeStopId, setActiveStopId] = useState<number>(2);

  const handleOptimize = () => {
    addToast('AI Route Re-Optimization completed! Saved 4.2 km & ₹140 fuel.', 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-hidden font-sans">
      <Header
        title="Route Optimization"
        subtitle="AI-driven multi-stop delivery & technician dispatch route planner with fuel estimation."
        primaryActionLabel="Re-Optimize Route"
        onPrimaryAction={handleOptimize}
      />

      {/* KPI Stats Strip */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Driver & Vehicle</div>
            <div className="font-bold text-slate-900">{currentRoute.driver_name} • {currentRoute.vehicle}</div>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Stops Progress</div>
            <div className="font-bold text-emerald-600">{currentRoute.completed_stops} / {currentRoute.stops_count} completed</div>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Distance</div>
            <div className="font-bold text-slate-900">{currentRoute.distance_km} km</div>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Estimated Fuel</div>
            <div className="font-bold text-slate-900">₹{currentRoute.fuel_cost}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {targetHighlightId && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white uppercase animate-pulse flex items-center gap-1 shadow-sm">
              <span>● Target Route #{targetHighlightId}</span>
            </span>
          )}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
            In Progress (ETA 12:15 PM)
          </span>
        </div>
      </div>

      {/* Main 2-Pane Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Interactive Map Canvas */}
        <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden p-6">
          {/* Simulated Map Canvas */}
          <div className="absolute inset-0 bg-[#0F172A] opacity-90">
            {/* Grid Lines simulating city roads */}
            <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748B" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* SVG Animated Route Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M 180 200 Q 320 150 420 280 T 650 220 T 780 400"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeDasharray="8 4"
              className="animate-pulse"
            />
          </svg>

          {/* Map Waypoint Pins */}
          <div className="absolute top-[180px] left-[160px] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
              1
            </div>
            <span className="mt-1 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-semibold border border-slate-700 shadow">
              Main Hub (Start)
            </span>
          </div>

          <div className="absolute top-[130px] left-[310px] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
              2
            </div>
            <span className="mt-1 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-semibold border border-slate-700 shadow">
              Amit Verma (09:30 AM) ✓
            </span>
          </div>

          <div className="absolute top-[260px] left-[400px] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
              3
            </div>
            <span className="mt-1 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-semibold border border-slate-700 shadow">
              Vikram Mehta (10:15 AM) ✓
            </span>
          </div>

          <div className="absolute top-[200px] left-[630px] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-lg ring-4 ring-amber-500/30 animate-bounce">
              6
            </div>
            <span className="mt-1 text-[10px] bg-amber-900 text-amber-100 px-2 py-0.5 rounded font-semibold border border-amber-600 shadow">
              Sneha Joshi (Priority)
            </span>
          </div>

          <div className="absolute top-[380px] left-[760px] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-lg ring-4 ring-purple-500/30">
              10
            </div>
            <span className="mt-1 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-semibold border border-slate-700 shadow">
              Priya Sharma (End)
            </span>
          </div>

          {/* Floating Driver Status Card on Map */}
          <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 text-white text-xs max-w-xs shadow-2xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-emerald-400">Live GPS Stream</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Currently en route to stop #6: <strong>88 Highway Junction, Vadakara</strong>.
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700">
              <span>Speed: 42 km/h</span>
              <span>ETA: 11:00 AM</span>
            </div>
          </div>
        </div>

        {/* Right Waypoint List (Matching photo_31) */}
        <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col shrink-0 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Waypoints Sequence (12 Stops)</h3>
            <button
              onClick={() => addToast('Live route link sent to driver WhatsApp', 'success')}
              className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Share to WhatsApp</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentRoute.stops.map((stop) => (
              <div
                key={stop.id}
                onClick={() => setActiveStopId(stop.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  stop.isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : stop.isPriority
                    ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                      {stop.id}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{stop.customerName}</span>
                  </div>

                  {stop.isCompleted && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                      ✓ Completed
                    </span>
                  )}
                  {stop.isPriority && !stop.isCompleted && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full">
                      Priority Stop
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{stop.address}</span>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Slot Window: {stop.timeWindow}</span>
                  <span className="font-semibold text-slate-700">Stop #{stop.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



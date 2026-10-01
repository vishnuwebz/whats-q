import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Users,
  UserCheck,
  Activity,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  ShieldCheck,
  Zap,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Settings,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Plus,
  HelpCircle,
  ArrowUpRight,
  ExternalLink,
  PhoneCall,
  Smartphone,
  Send,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';

interface BranchDocumentationViewProps {
  onBack: () => void;
  onNavigateSubPage?: (subPage: 'overview' | 'fleet-network' | 'workforce-roster' | 'customer-analytics' | 'operational-health') => void;
  onOpenAddBranch?: () => void;
}

interface DocSection {
  id: string;
  category: 'hierarchy' | 'workforce' | 'georouting' | 'automations' | 'health' | 'faq';
  title: string;
  shortDesc: string;
  badge?: string;
  readTime: string;
  content: React.ReactNode;
}

export const BranchDocumentationView: React.FC<BranchDocumentationViewProps> = ({
  onBack,
  onNavigateSubPage,
  onOpenAddBranch,
}) => {
  const { addToast, branches } = useQiyamStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    addToast('Configuration snippet copied to clipboard', 'info');
    setTimeout(() => {
      setCopiedSnippetId(null);
    }, 2000);
  };

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'hierarchy', label: '1. Hierarchy & Setup', icon: Building2 },
    { id: 'workforce', label: '2. Multi-Tenant Workforce', icon: Users },
    { id: 'georouting', label: '3. Regional Geo-Routing', icon: MapPin },
    { id: 'automations', label: '4. Localized Automations', icon: Zap },
    { id: 'health', label: '5. Fleet Health & SLA', icon: Activity },
    { id: 'faq', label: '6. FAQs & Best Practices', icon: HelpCircle },
  ];

  const sampleBranchJson = `{
  "branch_code": "KL-CC-02",
  "name": "Kozhikode Central Outlet",
  "branch_type": "Regional Hub",
  "is_main": false,
  "status": "Active",
  "address": {
    "city": "Kozhikode",
    "state": "Kerala",
    "pincode": "673004",
    "territory_radius_km": 35
  },
  "leadership": {
    "manager_name": "Arun Kumar",
    "manager_role": "Branch General Manager",
    "contact_phone": "+91 98470 11223"
  },
  "whatsapp_routing": {
    "enabled": true,
    "assigned_phone_id": "phone_kl_02",
    "fallback_to_hq": true,
    "primary_language": "ml",
    "secondary_language": "en"
  },
  "sla_config": {
    "max_lead_unattended_minutes": 120,
    "escalate_to_manager": true
  }
}`;

  const sampleGeoRoutingRule = `// QBS-360 Geofenced WhatsApp Lead Routing Logic
export function resolveTargetBranch(inboundLead: { pincode?: string; coordinates?: [number, number]; state?: string }) {
  // Step 1: Exact Pincode Matching against Branch Delivery Clusters
  if (inboundLead.pincode) {
    const branch = findBranchByPincode(inboundLead.pincode);
    if (branch && branch.status === 'Active') return branch;
  }

  // Step 2: Haversine Geolocation Proximity Match (< 40km)
  if (inboundLead.coordinates) {
    const nearest = findNearestOperationalBranch(inboundLead.coordinates);
    if (nearest && nearest.distanceKm <= nearest.territoryRadiusKm) {
      return nearest;
    }
  }

  // Step 3: State-Level Regional Hub Fallback
  if (inboundLead.state) {
    const stateHub = getRegionalHubForState(inboundLead.state);
    if (stateHub) return stateHub;
  }

  // Step 4: Central Enterprise Headquarters Fallback Desk
  return getHeadquartersBranch();
}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Top Header Navigation ── */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
            title="Back to Branches Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                QBS-360 Architecture Guide
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Multi-Tenant Enterprise SOP
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Updated v2.4.59</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Branch Management & Regional Configuration
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive operational manual for branch network deployment, multi-tenant employee assignment, geofenced WhatsApp auto-routing, and regional SLA management.
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onOpenAddBranch && (
            <button
              type="button"
              onClick={onOpenAddBranch}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Branch</span>
            </button>
          )}
          {onNavigateSubPage && (
            <>
              <button
                type="button"
                onClick={() => onNavigateSubPage('fleet-network')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Regional Network</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateSubPage('workforce-roster')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Workforce Roster</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Search & Filter Pill Bar ── */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation (e.g. multi-tenant, SLA, geo-routing, branch manager, Kerala, pincode, fallback)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Highlight Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Multi-Tenant Isolation</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900">Role-Based (RBAC)</div>
          <p className="text-xs text-slate-600 leading-snug">
            Branch managers only see local customer leads, chats, and field work orders.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Geo-Fenced Auto-Routing</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">Pincode & GPS</div>
          <p className="text-xs text-slate-600 leading-snug">
            Incoming WhatsApp inquiries automatically route to the customer's nearest outlet.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50/50 border border-purple-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Regional Languages</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900">Multilingual Bots</div>
          <p className="text-xs text-slate-600 leading-snug">
            Auto-replies in Malayalam, Hindi, Tamil, Kannada, Marathi & English per branch.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">SLA Escalation Tree</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900">&lt; 2 Hours Target</div>
          <p className="text-xs text-slate-600 leading-snug">
            Queries unassigned over 120 minutes trigger automated branch manager WhatsApp alerts.
          </p>
        </div>
      </div>

      {/* ── SECTION 1: HIERARCHY & SETUP ── */}
      {(activeCategory === 'all' || activeCategory === 'hierarchy') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                1
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Branch Hierarchy, Operational Types & Setup
                </h3>
                <p className="text-xs text-slate-500">
                  How QBS-360 organizes physical locations, administrative designations, and branch codes.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              5 min read
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {/* Classification Table */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2.5 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Branch Operational Classifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Headquarters (HQ)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Primary
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    The central command hub holding root compliance records, global WhatsApp routing desks, and executive financial ledgers.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">Code: HQ-001 / COR-01</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      Regional Hub
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Multi-City
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    A major territory center (e.g. Kozhikode Central, Bengaluru Hub, Mumbai BKC) that oversees smaller satellite service kiosks.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">Code: KL-CC-02 / KA-BLR-03</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      Branch Office / Kiosk
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Local Outlet
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Standard physical outlet or customer service center with dedicated sales staff, technician rosters, and localized inventory.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500">Code: KL-KOC-03 / TN-CHN-05</div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Setup */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Step-by-Step: Adding and Provisioning a New Branch
              </h4>
              <ol className="list-decimal list-inside space-y-2.5 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <li>
                  <strong className="text-slate-900">Launch Branch Creation:</strong> Click the <code className="px-1.5 py-0.5 bg-white border rounded text-xs text-emerald-700 font-mono">+ Add Branch</code> button from the Branches overview or this documentation header.
                </li>
                <li>
                  <strong className="text-slate-900">Define Identifiers:</strong> Enter the official business location name (e.g., <em>Thrissur East Outlet</em>) and unique alphanumeric code (e.g., <code>KL-TCR-04</code>).
                </li>
                <li>
                  <strong className="text-slate-900">Pin Geographic Territory:</strong> Specify City, State (e.g. <em>Kerala</em>), and 6-digit Pincode (e.g. <code>680001</code>). This enables geofenced lead routing.
                </li>
                <li>
                  <strong className="text-slate-900">Assign Leadership:</strong> Designate the Branch Manager and contact telephone number for high-priority escalations.
                </li>
                <li>
                  <strong className="text-slate-900">Visual Identity:</strong> Select a high-resolution storefront preset or upload your actual branch building photo to help staff recognize the hub.
                </li>
              </ol>
            </div>

            {/* Code Snippet */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Sample Branch Schema (JSON / API Payload)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode('json-schema', sampleBranchJson)}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSnippetId === 'json-schema' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                {sampleBranchJson}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: MULTI-TENANT WORKFORCE ── */}
      {(activeCategory === 'all' || activeCategory === 'workforce') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                2
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Multi-Tenant Employee Assignment & Workforce Roster
                </h3>
                <p className="text-xs text-slate-500">
                  Delegating staff roles, security scoping, shift check-ins, and cross-branch mobility.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              6 min read
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Role-Based Access Control (RBAC)
                </h4>
                <p className="text-xs text-slate-600">
                  Every employee profile in QBS-360 is linked to a primary branch. When a staff member logs in:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  <li><strong>Branch Sales Reps:</strong> View only leads, deals, and WhatsApp conversations routed to their branch desk.</li>
                  <li><strong>Field Technicians:</strong> Receive dispatch tickets and service appointments localized to their branch territory.</li>
                  <li><strong>Branch Managers:</strong> Can approve leave requests, review attendance, and monitor branch-specific revenue targets.</li>
                  <li><strong>Super Admins:</strong> Hold unrestricted pan-India visibility across all locations via the global switcher.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Biometric & GPS Shift Check-in via WhatsApp
                </h4>
                <p className="text-xs text-slate-600">
                  Staff can clock into their branch directly from WhatsApp without installing extra heavy apps:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  <li>Staff sends <code>#checkin</code> to the company WhatsApp bot.</li>
                  <li>The bot requests a live location drop via WhatsApp GPS.</li>
                  <li>The system verifies if the coordinate falls within the branch's designated geofence radius.</li>
                  <li>Upon verification, attendance is recorded instantly in the Operations module.</li>
                </ul>
              </div>
            </div>

            {/* Cross-Branch Transfers */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Cross-Branch Mobility & Transfer Protocol
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When an employee is transferred or assigned temporary duty at another branch, edit their profile under <code className="px-1.5 py-0.5 bg-white border rounded text-xs font-mono">Operations &gt; Employees</code> and update the <strong>Assigned Branch</strong>. Historical service logs, closed deals, and invoices remain intact and linked to their original branches for accurate audit compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3: REGIONAL GEO-ROUTING ── */}
      {(activeCategory === 'all' || activeCategory === 'georouting') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                3
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Regional Office Configurations & WhatsApp Geo-Routing
                </h3>
                <p className="text-xs text-slate-500">
                  How customer inquiries from Meta ads, website widgets, and inbound chats reach the nearest branch.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              7 min read
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {/* Visual Workflow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-[10px] font-bold text-blue-600 uppercase">Step 1</div>
                <div className="font-bold text-slate-900 text-xs">Customer Contact</div>
                <p className="text-[11px] text-slate-500">
                  Customer taps WhatsApp ad or messages official WhatsApp number.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Step 2</div>
                <div className="font-bold text-slate-900 text-xs">AI Territory Check</div>
                <p className="text-[11px] text-slate-500">
                  Bot parses customer pincode, GPS location drop, or city preference.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-[10px] font-bold text-purple-600 uppercase">Step 3</div>
                <div className="font-bold text-slate-900 text-xs">Branch Dispatch</div>
                <p className="text-[11px] text-slate-500">
                  Lead assigned directly to the regional branch queue and local sales team.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="text-[10px] font-bold text-amber-600 uppercase">Step 4</div>
                <div className="font-bold text-slate-900 text-xs">Regional Response</div>
                <p className="text-[11px] text-slate-500">
                  Customer greeted in regional language with local store contact details.
                </p>
              </div>
            </div>

            {/* Code Snippet */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  QBS-360 Geofenced Auto-Router Code Reference
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode('routing-logic', sampleGeoRoutingRule)}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSnippetId === 'routing-logic' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Logic</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                {sampleGeoRoutingRule}
              </pre>
            </div>

            {/* Fallback mechanics */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Automated Queue Overflow & After-Hours Fallback
              </div>
              <p className="text-xs leading-relaxed text-amber-950">
                If a regional branch is closed for local holidays or all branch agents are busy, QBS-360 automatically routes customer inquiries to the <strong>Central Enterprise Headquarters</strong> desk with a high-priority <code>Regional Overflow</code> tag, ensuring no prospect inquiry is missed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 4: LOCALIZED AUTOMATIONS ── */}
      {(activeCategory === 'all' || activeCategory === 'automations') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                4
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Localized Automations & Regional Workflows
                </h3>
                <p className="text-xs text-slate-500">
                  Configuring language auto-responders, branch SLA alerts, and localized UPI billing bots.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              5 min read
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Multilingual Auto-Responder
                </div>
                <p className="text-xs text-slate-600">
                  Custom greetings triggered by branch state. Kerala branches respond in Malayalam & English, Karnataka branches in Kannada & English, Maharashtra branches in Marathi & Hindi.
                </p>
                <div className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Trigger: First Inbound Contact
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  High-Priority SLA Escalation
                </div>
                <p className="text-xs text-slate-600">
                  If any inquiry assigned to a branch sits without agent response for &gt; 120 minutes, the bot sends an urgent push alert to the Branch Manager's mobile WhatsApp.
                </p>
                <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                  Trigger: SLA Delay (&gt; 2 hrs)
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Send className="w-4 h-4 text-emerald-600" />
                  Branch UPI Payment Bots
                </div>
                <p className="text-xs text-slate-600">
                  Generates instant Razorpay & UPI dynamic payment links branded with the specific branch outlet name and local GST invoice numbering.
                </p>
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Trigger: Pending Invoice / Service Done
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 5: OPERATIONAL HEALTH & SLA ── */}
      {(activeCategory === 'all' || activeCategory === 'health') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                5
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Operational Health, Uptime Telemetry & Live Telemetry
                </h3>
                <p className="text-xs text-slate-500">
                  Monitoring Cloud API connection latency, WhatsApp webhook status, and branch KPIs.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              4 min read
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              QBS-360 runs automated background liveness health checks across each branch's communication infrastructure every 60 seconds:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-900 text-xs">WhatsApp Cloud API Latency</div>
                <div className="text-lg font-black text-emerald-600">~18ms - 32ms</div>
                <div className="text-[11px] text-slate-500">Direct webhook ingestion without third-party delay.</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-900 text-xs">Multi-Tenant Database Sync</div>
                <div className="text-lg font-black text-blue-600">Real-Time (PostgreSQL)</div>
                <div className="text-[11px] text-slate-500">Instant cross-device updates using WebSocket sync.</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-900 text-xs">Branch Uptime SLA</div>
                <div className="text-lg font-black text-purple-600">99.98% Guaranteed</div>
                <div className="text-[11px] text-slate-500">High-availability failover across all regional nodes.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 6: FAQS & BEST PRACTICES ── */}
      {(activeCategory === 'all' || activeCategory === 'faq') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
                6
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Frequently Asked Questions (FAQ) & Best Practices
                </h3>
                <p className="text-xs text-slate-500">
                  Quick solutions to common branch administration, employee assignment, and routing questions.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              Interactive FAQ
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            {[
              {
                id: 'faq-1',
                q: 'How do I designate a branch as the Central Headquarters?',
                a: 'Open the edit modal for your intended branch (or click its card in Overview), locate the "Headquarters / Main Branch" switch, enable it, and save. QBS-360 will designate this branch with the gold Headquarters badge and use it as the ultimate fallback desk for unassigned inquiries.',
              },
              {
                id: 'faq-2',
                q: 'Can an employee be assigned to multiple branches simultaneously?',
                a: 'Yes. While each employee profile has a primary branch for payroll and statutory tax filing, enterprise tier accounts allow multi-branch roaming. Staff members can be granted cross-branch access in the Roles & Permissions matrix (RBAC).',
              },
              {
                id: 'faq-3',
                q: 'What happens if a customer messages from an unmapped pin code or state?',
                a: 'If a customer\'s postal code does not match any registered regional territory radius, QBS-360 routes the conversation directly to the Headquarters Central Dispatch desk with an "Unassigned Territory" badge so central dispatchers can triage or assign it.',
              },
              {
                id: 'faq-4',
                q: 'How do I archive a branch that is temporarily closed for renovation?',
                a: 'Edit the branch and change its status from "Active" to "Inactive". Existing historical leads, past invoices, and employee records remain 100% preserved in your audit history, but new automated WhatsApp lead routing will bypass this branch until re-activated.',
              },
              {
                id: 'faq-5',
                q: 'How can I export regional branch performance and employee rosters to Excel/CSV?',
                a: 'Use the "Export CSV" option from the top control bar in Branches overview, or visit the Workforce Roster sub-page to download individual branch staffing directories.',
              },
            ].map((faq) => {
              const isOpen = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom Helpful Resource Banner ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm sm:text-base">Need custom multi-tenant configuration assistance?</h4>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Our enterprise solutions engineering team can help set up custom geofence clusters, dedicated WhatsApp Phone IDs per branch, and ERP integrations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Return to Branches Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

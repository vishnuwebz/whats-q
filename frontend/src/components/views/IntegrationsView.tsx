import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Puzzle, CheckCircle2, AlertCircle, Plus, ExternalLink,
  Search, BookOpen, Key, Zap, ShieldCheck, RefreshCw, ArrowRight
} from 'lucide-react';
import { MetaConfigModal } from './ai/MetaConfigModal';
import { IntegrationConfigModal } from './integrations/IntegrationConfigModal';
import { IntegrationItem } from '@/types';

const CATEGORIES = ['All', 'Communication', 'Productivity', 'CRM', 'Accounting & Finance', 'Payments', 'E-Commerce'] as const;

export const IntegrationsView: React.FC = () => {
  const {
    integrations,
    metaConfig,
    saveMetaConfig,
    testMetaConnection,
    saveIntegrationConfig,
    testIntegrationConnection,
    addToast
  } = useQiyamStore();

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [integrations, selectedCategory, searchQuery]);

  const handleOpenConfigure = (app: IntegrationItem) => {
    if (app.name.toLowerCase().includes('whatsapp')) {
      setIsMetaModalOpen(true);
    } else {
      setSelectedIntegration(app);
      setIsConfigModalOpen(true);
    }
  };

  const getBrandColors = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('whatsapp')) return { bg: 'bg-emerald-500/15', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (n.includes('google')) return { bg: 'bg-blue-500/15', text: 'text-blue-700', border: 'border-blue-200' };
    if (n.includes('slack')) return { bg: 'bg-purple-500/15', text: 'text-purple-700', border: 'border-purple-200' };
    if (n.includes('zoho')) return { bg: 'bg-red-500/15', text: 'text-red-700', border: 'border-red-200' };
    if (n.includes('quickbooks')) return { bg: 'bg-green-500/15', text: 'text-green-700', border: 'border-green-200' };
    if (n.includes('shopify')) return { bg: 'bg-teal-500/15', text: 'text-teal-700', border: 'border-teal-200' };
    if (n.includes('razorpay')) return { bg: 'bg-indigo-500/15', text: 'text-indigo-700', border: 'border-indigo-200' };
    if (n.includes('woocommerce')) return { bg: 'bg-purple-600/15', text: 'text-purple-700', border: 'border-purple-200' };
    return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' };
  };

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Integrations & API Hub"
        subtitle="Connect official Meta WhatsApp Cloud API, payment gateways, accounting, and CRMs with full developer setup tutorials."
        primaryActionLabel="Configure Meta WhatsApp API"
        onPrimaryAction={() => setIsMetaModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-5 sm:space-y-6">
        
        {/* ── Top Hero Stats Bar ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 leading-tight">Connected Integrations &amp; Automation Services</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {connectedCount} of {integrations.length} integrations connected • Real-time webhooks &amp; automated dispatch active
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations, APIs, keys..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800 placeholder-slate-400 transition"
            />
          </div>
        </div>

        {/* ── Category Filter Pills ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide text-xs font-semibold py-1">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' ? integrations.length : integrations.filter((i) => i.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Integrations Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-xs">
          {filteredIntegrations.map((app) => {
            const isConnected = app.status === 'connected';
            const colors = getBrandColors(app.name);

            return (
              <div
                key={app.id}
                className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-2xl ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center font-bold text-base shadow-xs`}>
                      {app.name[0]}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-400/20'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isConnected ? 'CONNECTED' : 'PARTIAL / PENDING'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mt-3.5 group-hover:text-emerald-700 transition-colors">
                    {app.name}
                  </h3>
                  <div className="text-[10.5px] text-slate-400 font-semibold mb-1.5">{app.category}</div>
                  <p className="text-slate-600 text-[11.5px] leading-relaxed line-clamp-2">{app.description}</p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-slate-400 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{app.automations_enabled} active flows</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenConfigure(app)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-700 font-bold border border-slate-200 hover:border-emerald-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>Configure &amp; Tutorial</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 space-y-2">
            <Puzzle className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-700 text-sm">No Integrations Found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search query or selected category filter.</p>
          </div>
        )}

      </div>

      {/* ── Meta WhatsApp Cloud API Configuration Modal ── */}
      <MetaConfigModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        config={metaConfig}
        onSaveConfig={async (cfg) => {
          await saveMetaConfig(cfg);
          addToast('Meta WhatsApp credentials saved!', 'success');
          return true;
        }}
        onTestConnection={async (creds) => {
          return await testMetaConnection(creds);
        }}
      />

      {/* ── Master Third-Party Integration Configuration Modal ── */}
      <IntegrationConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        integration={selectedIntegration}
        onSave={async (id, config, status) => {
          return await saveIntegrationConfig(id, config, status);
        }}
        onTest={async (id, config) => {
          return await testIntegrationConnection(id, config);
        }}
      />

    </div>
  );
};

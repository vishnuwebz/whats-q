import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Puzzle, CheckCircle2, AlertCircle, Plus, ExternalLink } from 'lucide-react';
import { MetaConfigModal } from './ai/MetaConfigModal';

export const IntegrationsView: React.FC = () => {
  const { integrations, metaConfig, saveMetaConfig, testMetaConnection, addToast } = useQiyamStore();
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Integrations & API Hub"
        subtitle="Connect official Meta WhatsApp Cloud API, payment gateways, accounting, and CRMs."
        primaryActionLabel="Configure Meta WhatsApp API"
        onPrimaryAction={() => setIsMetaModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {integrations.map((app) => {
            const isConnected = app.status === 'connected';

            return (
              <div
                key={app.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-sm">
                      {app.name[0]}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isConnected ? 'CONNECTED' : 'PARTIAL'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-3">{app.name}</h3>
                  <div className="text-[10px] text-slate-400 font-semibold mb-1">{app.category}</div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{app.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">{app.automations_enabled} active flows</span>
                  <button
                    onClick={() => {
                      if (app.name.includes('WhatsApp')) {
                        setIsMetaModalOpen(true);
                      } else {
                        addToast(`Configuration settings opened for ${app.name}`, 'info');
                      }
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    <span>Configure</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meta WhatsApp Cloud API Configuration Modal */}
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
    </div>
  );
};




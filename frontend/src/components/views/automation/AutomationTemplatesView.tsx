import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BookOpen, Zap, Plus, ArrowRight } from 'lucide-react';

export const AutomationTemplatesView: React.FC = () => {
  const { setActiveTab, addToast } = useQiyamStore();

  const templates = [
    { name: 'WhatsApp Inbound Service Booking', desc: 'Captures incoming customer request, parses intent via AI, creates CRM lead, schedules slot, and sends payment request.', category: 'CRM & Booking', type: 'Official' },
    { name: 'Automated Payment Due Reminder', desc: 'Monitors invoice due dates and sends personalized WhatsApp payment reminders with UPI deep link 3 days prior.', category: 'Finance', type: 'Official' },
    { name: 'Lead Nurturing & Follow-up Sequence', desc: 'Multi-day automated drip follow-ups for cold and lukewarm leads across WhatsApp and Email.', category: 'Marketing', type: 'Official' },
    { name: 'Technician Job Auto-Dispatch', desc: 'Assigns closest field tech based on GPS distance and shifts, sends Google Maps dispatch card on WhatsApp.', category: 'Operations', type: 'Official' },
    { name: 'Customer Satisfaction (CSAT) Survey', desc: 'Triggers 2 hours after job completion to collect 1-click 5-star rating on WhatsApp.', category: 'Support', type: 'Official' },
    { name: 'Low Stock Auto-Purchase Request', desc: 'Creates internal approval request whenever warehouse SKU falls below reorder threshold.', category: 'Inventory', type: 'Official' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Automation Templates Gallery"
        subtitle="Pre-built 1-click workflow blueprints tested for service businesses."
        primaryActionLabel="Create Custom Template"
        onPrimaryAction={() => setActiveTab('automation-builder')}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {templates.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {t.category}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    {t.type}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{t.name}</h3>
                <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">{t.desc}</p>
              </div>

              <button
                onClick={() => {
                  addToast(`Template "${t.name}" imported to Workflow Builder!`, 'success');
                  setActiveTab('automation-builder');
                }}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl font-bold text-center transition-all flex items-center justify-center gap-1.5"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



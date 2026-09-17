import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BookOpen, Zap, Plus, ArrowRight } from 'lucide-react';

export const AutomationTemplatesView: React.FC = () => {
  const { setActiveTab, setActiveWorkflowTitle, setActiveWorkflowGroups, addToast } = useQiyamStore();

  const TEMPLATE_BLUEPRINTS: Record<string, any[]> = {
    'WhatsApp Inbound Service Booking': [
      {
        id: 'group-1',
        title: '1. Inbound Welcome & Intent',
        x: 50,
        y: 50,
        items: [
          { id: 'item-1-1', type: 'message', content: '👋 Welcome to Qiyam Services! How may we assist you today?' },
          { id: 'item-1-2', type: 'choice', question: 'Please select a service category:', options: [
            { label: 'AC Repair & Gas Refill', targetGroup: 'group-2' },
            { label: 'Routine Maintenance', targetGroup: 'group-2' },
            { label: 'Emergency Breakdown', targetGroup: 'group-2' },
          ] }
        ]
      },
      {
        id: 'group-2',
        title: '2. Preferred Slot & Location',
        x: 420,
        y: 50,
        items: [
          { id: 'item-2-1', type: 'message', content: 'Great! Please provide your preferred date & time for inspection.' },
          { id: 'item-2-2', type: 'collect', varName: 'preferred_slot' },
          { id: 'item-2-3', type: 'message', content: 'Please share your service location / address.' },
          { id: 'item-2-4', type: 'collect', varName: 'customer_address' },
        ]
      },
      {
        id: 'group-3',
        title: '3. Booking Confirmed & Dispatch',
        x: 780,
        y: 50,
        items: [
          { id: 'item-3-1', type: 'message', content: '✅ Booking Confirmed! A certified technician has been scheduled for your slot.' },
        ]
      }
    ],
    'Automated Payment Due Reminder': [
      {
        id: 'group-1',
        title: '1. Invoice Due Alert',
        x: 50,
        y: 50,
        items: [
          { id: 'item-1-1', type: 'message', content: '📄 Hello {customer_name}, this is a gentle reminder that invoice #{invoice_id} of ₹{amount} is due on {due_date}.' },
          { id: 'item-1-2', type: 'choice', question: 'Would you like to settle this now via UPI?', options: [
            { label: 'Pay via UPI Now', targetGroup: 'group-2' },
            { label: 'Already Paid', targetGroup: 'group-3' },
            { label: 'Need Assistance', targetGroup: 'group-3' }
          ] }
        ]
      },
      {
        id: 'group-2',
        title: '2. 1-Click UPI Payment',
        x: 420,
        y: 50,
        items: [
          { id: 'item-2-1', type: 'payment', provider: 'UPI', amount: 2800, currency: 'INR', buttonLabel: 'Pay with GPay / PhonePe' },
        ]
      },
      {
        id: 'group-3',
        title: '3. Status Updated',
        x: 780,
        y: 50,
        items: [
          { id: 'item-3-1', type: 'message', content: 'Thank you! Our finance desk has been notified to verify your transaction.' }
        ]
      }
    ],
    'Lead Nurturing & Follow-up Sequence': [
      {
        id: 'group-1',
        title: '1. Day 1: Welcome & Value Catalog',
        x: 50,
        y: 50,
        items: [
          { id: 'item-1-1', type: 'message', content: 'Hi {first_name}! Thanks for showing interest in Qiyam Ventures enterprise solutions.' },
          { id: 'item-1-2', type: 'choice', question: 'Would you like our product overview brochure?', options: [
            { label: 'Send Brochure PDF', targetGroup: 'group-2' },
            { label: 'Book Demo Call', targetGroup: 'group-3' }
          ] }
        ]
      },
      {
        id: 'group-2',
        title: '2. Day 3: Case Study & Social Proof',
        x: 420,
        y: 50,
        items: [
          { id: 'item-2-1', type: 'message', content: '📈 Here is how we helped businesses scale service operations by 40% with zero downtime.' },
          { id: 'item-2-2', type: 'choice', question: 'Ready to speak with an executive consultant?', options: [
            { label: 'Yes, Connect Now', targetGroup: 'group-3' },
            { label: 'Not Right Now' }
          ] }
        ]
      },
      {
        id: 'group-3',
        title: '3. Day 7: Exclusive Proposal Offer',
        x: 780,
        y: 50,
        items: [
          { id: 'item-3-1', type: 'message', content: '🎯 Special offer: Complete consultation with tailored CRM blueprint at zero initial setup fee.' }
        ]
      }
    ],
    'Technician Job Auto-Dispatch': [
      {
        id: 'group-1',
        title: '1. New Work Order Received',
        x: 50,
        y: 50,
        items: [
          { id: 'item-1-1', type: 'message', content: '🚨 Dispatch Alert: New job #{job_id} assigned in your zone ({location}).' },
          { id: 'item-1-2', type: 'choice', question: 'Please confirm job acceptance:', options: [
            { label: 'Accept & Navigate', targetGroup: 'group-2' },
            { label: 'Decline / Busy', targetGroup: 'group-3' }
          ] }
        ]
      },
      {
        id: 'group-2',
        title: '2. GPS Route & Job Details',
        x: 420,
        y: 50,
        items: [
          { id: 'item-2-1', type: 'message', content: '📍 Client: {customer_name}\n📞 Phone: {customer_phone}\n🗺️ Google Maps: https://maps.google.com/?q={lat},{lng}' },
        ]
      },
      {
        id: 'group-3',
        title: '3. Re-route to Next Technician',
        x: 780,
        y: 50,
        items: [
          { id: 'item-3-1', type: 'message', content: 'Job released. Central dispatch notified to assign next nearest technician.' }
        ]
      }
    ],
    'Customer Satisfaction (CSAT) Survey': [
      {
        id: 'group-1',
        title: '1. Post-Service Feedback Request',
        x: 50,
        y: 50,
        items: [
          { id: 'item-1-1', type: 'message', content: '🌟 Hi {customer_name}, how was your experience with technician {technician_name} today?' },
          { id: 'item-1-2', type: 'choice', question: 'Rate your service experience:', options: [
            { label: '⭐⭐⭐⭐⭐ Excellent', targetGroup: 'group-2' },
            { label: '⭐⭐⭐⭐ Good', targetGroup: 'group-2' },
            { label: '⭐⭐⭐ Average', targetGroup: 'group-3' },
            { label: '⭐ Needs Attention', targetGroup: 'group-3' }
          ] }
        ]
      },
      {
        id: 'group-2',
        title: '2. Thank You & Google Review',
        x: 420,
        y: 50,
        items: [
          { id: 'item-2-1', type: 'message', content: '🎉 Thank you so much for your kind words! Would you mind sharing a quick review on Google?' }
        ]
      },
      {
        id: 'group-3',
        title: '3. Escalate to Support Desk',
        x: 780,
        y: 50,
        items: [
          { id: 'item-3-1', type: 'message', content: 'We apologize for any inconvenience. An operations supervisor has been notified and will contact you shortly.' }
        ]
      }
    ],
    'Low Stock Auto-Purchase Request': [
      {
        id: 'group-1',
        title: '1. Inventory Threshold Trigger',
        x: 50,
        y: 50,
        items: [
          { id: 'item-1-1', type: 'message', content: '⚠️ Warehouse Alert: SKU {sku_name} has fallen below threshold ({current_stock} units left).' },
          { id: 'item-1-2', type: 'choice', question: 'Choose manager action:', options: [
            { label: 'Create PO (₹25,000)', targetGroup: 'group-2' },
            { label: 'Dismiss Alert' }
          ] }
        ]
      },
      {
        id: 'group-2',
        title: '2. Purchase Approval Generated',
        x: 420,
        y: 50,
        items: [
          { id: 'item-2-1', type: 'message', content: '✅ Purchase Order APR-1024 submitted to Finance for approval.' }
        ]
      }
    ]
  };

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
                  const blueprint = TEMPLATE_BLUEPRINTS[t.name] || [];
                  setActiveWorkflowTitle(t.name);
                  setActiveWorkflowGroups(blueprint);
                  addToast(`Template "${t.name}" loaded into Workflow Builder!`, 'success');
                  setActiveTab('automation-builder');
                }}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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



import { FlowGroup } from '@/types';

export const SERVICE_BOOKING_FLOW_GROUPS: FlowGroup[] = [
  {
    id: 'group-1',
    title: 'Group #1 - Welcome & Menu Trigger',
    x: 40,
    y: 40,
    items: [
      {
        id: 'item-1-1',
        type: 'message',
        content: '🤖 *WhatsQ Intelligent Service Assistant*\nHello {STAT_NAME}! Welcome to Qiyam Ventures. We provide certified HVAC, electrical, and appliance care across Kerala.\n\nHow can we help you today?'
      },
      {
        id: 'item-1-2',
        type: 'choice',
        question: 'Please select an option from our service menu:',
        options: [
          { label: '1️⃣ Reschedule Booking', targetGroup: 'group-2' },
          { label: '2️⃣ Live Technician ETA', targetGroup: 'group-3' },
          { label: '3️⃣ Price Quotation', targetGroup: 'group-4' },
          { label: '4️⃣ Speak with Agent', targetGroup: 'group-5' },
          { label: '✅ Confirm Booking', targetGroup: 'group-6' }
        ]
      }
    ]
  },
  {
    id: 'group-2',
    title: 'Group #2 - Reschedule Booking',
    x: 420,
    y: 40,
    items: [
      {
        id: 'item-2-1',
        type: 'message',
        content: '📅 *Reschedule Your Appointment*\nPlease select an upcoming available slot from our operations schedule:'
      },
      {
        id: 'item-2-2',
        type: 'choice',
        question: 'Available open slots for your area:',
        options: [
          { label: 'Tomorrow 2:00 PM', targetGroup: 'group-6' },
          { label: 'Friday 10:30 AM', targetGroup: 'group-6' },
          { label: 'Saturday 11:00 AM', targetGroup: 'group-6' },
          { label: 'Custom Slot / Contact Support', targetGroup: 'group-5' }
        ]
      }
    ]
  },
  {
    id: 'group-3',
    title: 'Group #3 - Live Technician Status & ETA',
    x: 420,
    y: 400,
    items: [
      {
        id: 'item-3-1',
        type: 'message',
        content: '📍 *Live Technician Status & ETA*\nSenior Specialist Ramesh Kumar is en route 🛵.\nEstimated Arrival: 15-20 minutes.\nLive GPS Tracking: https://coolfix.in/track/QUO-2024-0037\nPriority Contact: +91 98765 43210'
      },
      {
        id: 'item-3-2',
        type: 'choice',
        question: 'Need immediate adjustments?',
        options: [
          { label: 'I am Available at Location', targetGroup: 'group-6' },
          { label: 'Delay by 30 mins', targetGroup: 'group-5' },
          { label: 'Back to Menu', targetGroup: 'group-1' }
        ]
      }
    ]
  },
  {
    id: 'group-4',
    title: 'Group #4 - Official Price Quotation',
    x: 800,
    y: 40,
    items: [
      {
        id: 'item-4-1',
        type: 'message',
        content: '📋 *Official Price Quotation: QUO-2024-0037*\n\n1. Inverter AC Sensor Board & PCB Testing (Qty: 1) - ₹5,500\n2. Full System Labor & Outdoor Unit Cleaning (Qty: 1) - ₹3,000\n\n💰 Subtotal: ₹8,500\n📊 GST / Tax: ₹1,530\n💎 Total Quoted Amount: ₹9,500\n📅 Valid Until: May 20, 2024\n📝 Terms: 50% advance upon confirmation. 50% on completion.'
      },
      {
        id: 'item-4-2',
        type: 'choice',
        question: 'Would you like to accept this quotation?',
        options: [
          { label: 'CONFIRM & Lock Slot', targetGroup: 'group-6' },
          { label: 'Pay Token Advance (₹500)', targetGroup: 'group-7' },
          { label: 'Request Revision', targetGroup: 'group-5' }
        ]
      }
    ]
  },
  {
    id: 'group-5',
    title: 'Group #5 - Human Agent Handover',
    x: 800,
    y: 400,
    items: [
      {
        id: 'item-5-1',
        type: 'message',
        content: '👨‍💼 *Connecting with Operations Support*\nSenior Specialist Ramesh Kumar has been assigned to your chat thread.\nStatus: In Progress • CRM Stage: Agent Assigned\nPriority Helpline: 1800-QIYAM-FIX.'
      },
      {
        id: 'item-5-2',
        type: 'jump',
        targetGroup: 'group-1'
      }
    ]
  },
  {
    id: 'group-6',
    title: 'Group #6 - Booking Confirmed',
    x: 1180,
    y: 40,
    items: [
      {
        id: 'item-6-1',
        type: 'message',
        content: '✅ *Booking Confirmed!*\nThank you for choosing Qiyam Ventures. Your service appointment is locked on our schedule.\n\nBooking ID: QUO-2024-0037\nAssigned Specialist: Ramesh Kumar\nOur certified technician will arrive on time.'
      }
    ]
  },
  {
    id: 'group-7',
    title: 'Group #7 - Token Advance Payment',
    x: 1180,
    y: 400,
    items: [
      {
        id: 'item-7-1',
        type: 'payment',
        content: 'Slot Booking Token Advance',
        provider: 'UPI',
        currency: 'INR',
        amount: 500,
        quantity: 1,
        varName: 'advance_token',
        successTarget: 'group-6',
        buttonLabel: 'Pay ₹500 via UPI QR'
      }
    ]
  }
];

export const normalizeToFlowGroups = (
  rawNodes: any[] | null | undefined,
  workflowTitle?: string
): FlowGroup[] => {
  const isServiceBooking = Boolean(
    workflowTitle &&
    (workflowTitle.toLowerCase().includes('service booking') ||
     workflowTitle.toLowerCase().includes('service flow') ||
     workflowTitle.toLowerCase().includes('booking flow'))
  );

  if (isServiceBooking) {
    return SERVICE_BOOKING_FLOW_GROUPS;
  }

  if (!rawNodes || !Array.isArray(rawNodes) || rawNodes.length === 0) {
    return SERVICE_BOOKING_FLOW_GROUPS;
  }

  // Check if rawNodes is already in FlowGroup[] format (each has .items array)
  const isFlowGroupFormat = rawNodes.every(
    (n) => n && typeof n === 'object' && Array.isArray(n.items)
  );

  if (isFlowGroupFormat) {
    return rawNodes.map((g, idx) => ({
      id: g.id || `group-${idx + 1}`,
      title: g.title || `Group #${idx + 1}`,
      x: typeof g.x === 'number' ? g.x : 40 + idx * 360,
      y: typeof g.y === 'number' ? g.y : 40,
      items: Array.isArray(g.items)
        ? g.items.map((it: any, itIdx: number) => ({
            id: it.id || `item-${idx + 1}-${itIdx + 1}`,
            type: it.type || 'message',
            content: it.content,
            question: it.question,
            options: Array.isArray(it.options) ? it.options : undefined,
            varName: it.varName,
            targetGroup: it.targetGroup,
            provider: it.provider,
            currency: it.currency,
            amount: it.amount,
            quantity: it.quantity,
            successTarget: it.successTarget,
            failedTarget: it.failedTarget,
            footer: it.footer,
            buttonLabel: it.buttonLabel,
          }))
        : [],
    }));
  }

  // Convert legacy node list (like { id, type, title, subtitle, position }) to visual FlowGroup[]
  return rawNodes.map((node, idx) => ({
    id: `group-${node.id || idx + 1}`,
    title: node.title || `Step #${idx + 1}`,
    x: node.position?.x ?? 40 + idx * 360,
    y: node.position?.y ?? (40 + (idx % 2) * 120),
    items: [
      {
        id: `item-${node.id || idx + 1}-1`,
        type: node.type === 'payment' ? 'payment' : node.type === 'condition' ? 'choice' : 'message',
        content: node.subtitle || node.title || `Action step for ${node.category || 'Workflow'}`,
        question: node.type === 'condition' ? node.title || 'Choose option:' : undefined,
        options:
          node.type === 'condition'
            ? [
                { label: 'Option 1', targetGroup: `group-${idx + 2}` },
                { label: 'Option 2' },
              ]
            : undefined,
      },
    ],
  }));
};

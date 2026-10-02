import { FlowGroup, GroupItem } from '@/types';

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
        content: '👋 *Welcome to {COMPANY_NAME}!* \nHello {STAT_NAME}! Welcome to our customer support. How can we assist you today?'
      },
      {
        id: 'item-1-2',
        type: 'choice',
        question: 'Please select an option from our service menu:',
        options: [
          { label: '1️⃣ Reschedule / Book Service', targetGroup: 'group-2' },
          { label: '2️⃣ Live Specialist ETA', targetGroup: 'group-3' },
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
    title: 'Group #3 - Live Specialist Status & ETA',
    x: 420,
    y: 690,
    items: [
      {
        id: 'item-3-1',
        type: 'message',
        content: '📍 *Live Specialist Status & ETA*\nSenior Specialist Ramesh Kumar is en route 🛵.\nEstimated Arrival: 15-20 minutes.\nLive GPS Tracking: https://track.whatsq.in/QUO-2026-0037\nPriority Contact: +91 98471 23456'
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
        content: '📋 *Official Price Quotation: QUO-2026-0037*\n\n1. Inverter AC Sensor Board & PCB Testing (Qty: 1) - ₹5,500\n2. Full System Labor & Outdoor Unit Cleaning (Qty: 1) - ₹3,000\n\n💰 Subtotal: ₹8,500\n📊 GST / Tax: ₹1,530\n💎 Total Quoted Amount: ₹9,500\n📅 Valid Until: October 20, 2026\n📝 Terms: 50% advance upon confirmation. 50% on completion.'
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
    y: 720,
    items: [
      {
        id: 'item-5-1',
        type: 'message',
        content: '👨‍💼 *Connecting with Operations Support*\nSenior Specialist Ramesh Kumar has been assigned to your chat thread.\nStatus: In Progress • CRM Stage: Agent Assigned\nPriority Helpline: +91 98471 23456.'
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
        content: '✅ *Booking Confirmed!*\nThank you for choosing {COMPANY_NAME}. Your service appointment is locked on our schedule.\n\nBooking ID: QUO-2026-0037\nAssigned Specialist: Ramesh Kumar\nOur certified technician will arrive on time.'
      }
    ]
  },
  {
    id: 'group-7',
    title: 'Group #7 - Token Advance Payment',
    x: 1180,
    y: 460,
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

/**
 * Accurately estimates the rendered height (in pixels) of a FlowGroup card on the canvas
 * based on its header, keyword trigger banner, messages, choices, options count, etc.
 */
export const estimateGroupHeight = (grp: FlowGroup): number => {
  if (!grp) return 260;

  // Base card shell: header (~52px) + top/bottom padding & borders (~32px)
  let h = 84;

  const titleLower = (grp.title || '').toLowerCase();
  const isInitial = grp.id === 'group-1' || titleLower.includes('welcome') || titleLower.includes('menu trigger');
  
  if (isInitial) {
    // Initial group has large trigger keywords banner with tags & webhooks
    h += 140;
  } else if (
    titleLower.includes('booking') ||
    titleLower.includes('reschedule') ||
    titleLower.includes('specialist') ||
    titleLower.includes('eta') ||
    titleLower.includes('price') ||
    titleLower.includes('quotation') ||
    titleLower.includes('agent') ||
    titleLower.includes('support')
  ) {
    // Inbound keyword tag preview banner
    h += 68;
  }

  for (const item of (grp.items || [])) {
    if (item.type === 'message') {
      const text = item.content || '';
      const lines = text.split('\n').length;
      // ~32 chars per line inside 300px card width
      const wrappedLines = Math.max(lines, Math.ceil(text.length / 32));
      const textHeight = Math.max(26, wrappedLines * 19);
      h += 34 + textHeight + 18;
    } else if (item.type === 'choice') {
      const q = item.question || '';
      const qLines = Math.max(1, Math.ceil(q.length / 28));
      const qHeight = qLines * 18;
      const optCount = Array.isArray(item.options) ? item.options.length : 0;
      // Each option button is ~42px height + 8px gap = 50px
      h += 34 + qHeight + (optCount * 50) + 18;
    } else if (item.type === 'payment') {
      h += 145;
    } else if (item.type === 'collect') {
      h += 80;
    } else if (item.type === 'jump') {
      h += 65;
    } else {
      h += 85;
    }
  }

  // "+ Add Step" action button at bottom + card footer margin
  h += 52;
  return Math.max(240, Math.round(h));
};

/**
 * Dynamically and automatically calculates collision-free vertical gaps between groups.
 * Clusters groups into columns by X position and pushes any overlapping or tightly-spaced
 * lower group down with a clean minimum gap of 80px so all options remain 100% visible.
 */
export const autoAdjustFlowGroupGaps = (
  groups: FlowGroup[],
  minGapY: number = 80
): FlowGroup[] => {
  if (!groups || !Array.isArray(groups) || groups.length === 0) return [];

  // Deep clone groups to avoid mutating source objects
  const result: FlowGroup[] = groups.map((g) => ({
    ...g,
    items: Array.isArray(g.items) ? [...g.items] : []
  }));

  // Cluster groups into columns by horizontal proximity (card width is 300px, so within 220px is same column)
  const columns: FlowGroup[][] = [];
  const sortedByX = [...result].sort((a, b) => a.x - b.x);

  for (const grp of sortedByX) {
    let targetCol: FlowGroup[] | null = null;
    for (const col of columns) {
      const avgColX = col.reduce((sum, g) => sum + g.x, 0) / col.length;
      if (Math.abs(grp.x - avgColX) < 220) {
        targetCol = col;
        break;
      }
    }
    if (targetCol) {
      targetCol.push(grp);
    } else {
      columns.push([grp]);
    }
  }

  // In each column, sort vertically by Y and dynamically enforce generous gap
  for (const col of columns) {
    col.sort((a, b) => a.y - b.y);

    for (let i = 1; i < col.length; i++) {
      const prevGrp = col[i - 1];
      const currentGrp = col[i];

      const prevHeight = estimateGroupHeight(prevGrp);
      const requiredMinY = prevGrp.y + prevHeight + minGapY;

      // If current group starts before requiredMinY, push it down dynamically!
      if (currentGrp.y < requiredMinY) {
        currentGrp.y = requiredMinY;
      }
    }
  }

  return result;
};

export const normalizeToFlowGroups = (
  rawNodes: any[] | null | undefined,
  workflowTitle?: string
): FlowGroup[] => {
  // If rawNodes already contains valid flow groups (saved by user), ALWAYS prioritize them!
  if (rawNodes && Array.isArray(rawNodes) && rawNodes.length > 0) {
    const isFlowGroupFormat = rawNodes.every(
      (n) => n && typeof n === 'object' && Array.isArray(n.items)
    );
    if (isFlowGroupFormat) {
      const groups = rawNodes.map((g, idx) => ({
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
      return autoAdjustFlowGroupGaps(groups);
    }
  }

  const isServiceBooking = Boolean(
    workflowTitle &&
    (workflowTitle.toLowerCase().includes('service booking') ||
     workflowTitle.toLowerCase().includes('welcome') ||
     workflowTitle.toLowerCase().includes('inbound') ||
     workflowTitle.toLowerCase().includes('service flow') ||
     workflowTitle.toLowerCase().includes('booking flow'))
  );

  if (isServiceBooking || !rawNodes || !Array.isArray(rawNodes) || rawNodes.length === 0) {
    return autoAdjustFlowGroupGaps(SERVICE_BOOKING_FLOW_GROUPS);
  }

  // Check if rawNodes is already in FlowGroup[] format (each has .items array)
  const isFlowGroupFormat = rawNodes.every(
    (n) => n && typeof n === 'object' && Array.isArray(n.items)
  );

  if (isFlowGroupFormat) {
    const groups = rawNodes.map((g, idx) => ({
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
    return autoAdjustFlowGroupGaps(groups);
  }

  // Convert legacy node list (like { id, type, title, subtitle, position }) to visual FlowGroup[]
  const groups: FlowGroup[] = rawNodes.map((node, idx) => ({
    id: `group-${node.id || idx + 1}`,
    title: node.title || `Step #${idx + 1}`,
    x: node.position?.x ?? 40 + idx * 360,
    y: node.position?.y ?? (40 + (idx % 2) * 120),
    items: [
      {
        id: `item-${node.id || idx + 1}-1`,
        type: (node.type === 'payment' ? 'payment' : node.type === 'condition' ? 'choice' : 'message') as GroupItem['type'],
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
  return autoAdjustFlowGroupGaps(groups);
};

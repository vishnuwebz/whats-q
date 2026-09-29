import { RCSConfig, RCSConversationItem, RCSCampaign } from '../types';

export const DEFAULT_RCS_CONFIG: RCSConfig = {
  provider: 'qiyam_cloud',
  agentName: 'Qiyam Business Solutions',
  agentId: 'qiyam-rbm-prod-agent-778',
  brandDisplayName: 'Qiyam Ventures (Verified)',
  brandLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  brandHeroColor: '#059669',
  apiKey: 'rcs_live_key_qiyam_2026_active',
  apiSecret: 'sk_rcs_sec_99482716301_rbm',
  webhookUrl: `${window.location.origin}/api/conversations/rcs/webhook/`,
  webhookVerifyToken: 'qiyam_rcs_secret_webhook_verify_2026',
  smsFallbackEnabled: true,
  status: 'connected',
  verifiedSender: true,
  carrierStatus: {
    jio: true,
    airtel: true,
    vi: true,
    international: true,
  },
  lastTestedAt: 'Just now • Carrier Handshake UP 2.4 OK',
  autoReplyEnabled: true,
  defaultQuickReplies: ['📅 Book Service', '📍 Our Locations', '💳 Pay Invoice', '👨‍💼 Speak to Human Agent'],
};

export const INITIAL_RCS_CONVERSATIONS: RCSConversationItem[] = [
  {
    id: 'rcs-conv-1',
    contactName: 'Dr. Fathima Zahra',
    phoneNumber: '+91 94471 22334',
    avatar: 'https://images.unsplash.com/photo-1594824813637-295b93ff5149?w=150&auto=format&fit=crop&q=80',
    carrier: 'Jio RCS (Universal Profile 2.4)',
    rcsCapable: true,
    unreadCount: 0,
    status: 'customer',
    lastSeen: 'Online',
    isOnline: true,
    tags: ['VIP Customer', 'Medical Clinic', 'Annual Care'],
    messages: [
      {
        id: 'rcs-m1',
        conversationId: 'rcs-conv-1',
        sender: 'customer',
        senderName: 'Dr. Fathima Zahra',
        text: 'Hello Qiyam team, my clinic AC in Kozhikode is leaking water. Need emergency service.',
        timestamp: '10:14 AM',
        status: 'read',
        direction: 'inbound',
      },
      {
        id: 'rcs-m2',
        conversationId: 'rcs-conv-1',
        sender: 'bot',
        senderName: 'Qiyam RCS Assistant',
        text: 'Hello Dr. Fathima! We have prioritized your clinic request under VIP SLA.',
        timestamp: '10:14 AM',
        status: 'read',
        direction: 'outbound',
        card: {
          id: 'card-service-1',
          title: 'Emergency Clinic HVAC Dispatch',
          description: 'Technician Arun K. is assigned. Arrival estimated between 11:30 AM - 12:15 PM today.',
          mediaUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
          mediaHeight: 'MEDIUM',
          actions: [
            {
              type: 'url',
              label: 'Track Technician Live',
              value: 'https://maps.google.com/?q=11.2588,75.7804',
            },
            {
              type: 'dial',
              label: 'Call Field Coordinator',
              value: '+919496300233',
            },
            {
              type: 'reply',
              label: 'Confirm Slot (11:30 AM)',
              value: 'SLOT_CONFIRMED_1130',
            },
          ],
        },
        suggestions: [
          { type: 'reply', label: '✅ Slot Confirmed' },
          { type: 'reply', label: '⏰ Reschedule to 2 PM' },
          { type: 'dial', label: '📞 Helpdesk Direct', value: '+919496300233' },
        ],
      },
      {
        id: 'rcs-m3',
        conversationId: 'rcs-conv-1',
        sender: 'customer',
        senderName: 'Dr. Fathima Zahra',
        text: 'Confirmed for 11:30 AM. Clinic reception will let Arun in. Thank you!',
        timestamp: '10:16 AM',
        status: 'read',
        direction: 'inbound',
      },
      {
        id: 'rcs-m4',
        conversationId: 'rcs-conv-1',
        sender: 'agent',
        senderName: 'Rahul Mehta (Support Desk)',
        text: 'Noted with thanks! Arun has been briefed with gate pass instructions.',
        timestamp: '10:17 AM',
        status: 'read',
        direction: 'outbound',
      },
    ],
  },
  {
    id: 'rcs-conv-2',
    contactName: 'Rahul Nair',
    phoneNumber: '+91 98950 11223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    carrier: 'Airtel RCS (Google Jibe Network)',
    rcsCapable: true,
    unreadCount: 1,
    status: 'lead',
    lastSeen: '15 mins ago',
    isOnline: false,
    tags: ['Commercial Lead', 'Villa Project', 'Kochi'],
    messages: [
      {
        id: 'rcs-m5',
        conversationId: 'rcs-conv-2',
        sender: 'customer',
        senderName: 'Rahul Nair',
        text: 'Hi, can you send your multi-split VRV maintenance catalog with pricing?',
        timestamp: '09:40 AM',
        status: 'read',
        direction: 'inbound',
      },
      {
        id: 'rcs-m6',
        conversationId: 'rcs-conv-2',
        sender: 'bot',
        senderName: 'Qiyam RCS Assistant',
        text: 'Certainly, Rahul! Here are our certified HVAC maintenance packages for residential and commercial villas:',
        timestamp: '09:41 AM',
        status: 'delivered',
        direction: 'outbound',
        carousel: [
          {
            id: 'car-1',
            title: 'Gold Care AMC (₹4,499/yr)',
            description: '3 Deep Jet Wash services + gas top-up + priority 2-hr breakdown emergency cover.',
            mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
            actions: [
              { type: 'reply', label: 'Select Gold Plan', value: 'SELECT_GOLD_AMC' },
              { type: 'url', label: 'View Brochure PDF', value: 'https://example.com/gold-amc.pdf' },
            ],
          },
          {
            id: 'car-2',
            title: 'Platinum Care AMC (₹7,999/yr)',
            description: 'Comprehensive parts warranty, anti-bacterial fogging, 6 visits & zero service fees.',
            mediaUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
            actions: [
              { type: 'reply', label: 'Select Platinum Plan', value: 'SELECT_PLATINUM_AMC' },
              { type: 'url', label: 'View Terms', value: 'https://example.com/platinum.pdf' },
            ],
          },
        ],
        suggestions: [
          { type: 'reply', label: '💬 Talk to Engineer' },
          { type: 'url', label: '🌐 Book Inspection', value: 'https://qiyam.in/book' },
          { type: 'dial', label: '📞 Call Sales Desk', value: '+919496300233' },
        ],
      },
      {
        id: 'rcs-m7',
        conversationId: 'rcs-conv-2',
        sender: 'customer',
        senderName: 'Rahul Nair',
        text: 'The Platinum plan looks great. Can an engineer visit my Marine Drive site tomorrow at 3 PM?',
        timestamp: '10:50 AM',
        status: 'delivered',
        direction: 'inbound',
      },
    ],
  },
  {
    id: 'rcs-conv-3',
    contactName: 'Amina Al-Mansoor',
    phoneNumber: '+91 97455 88990',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    carrier: 'Vi RCS (Vodafone Idea)',
    rcsCapable: true,
    unreadCount: 0,
    status: 'customer',
    lastSeen: 'Yesterday',
    isOnline: true,
    tags: ['Completed Job', 'Feedback Pending'],
    messages: [
      {
        id: 'rcs-m8',
        conversationId: 'rcs-conv-3',
        sender: 'agent',
        senderName: 'Qiyam Business OS',
        text: 'Dear Amina, your inverter AC repair at Calicut Beach Road is marked COMPLETED.',
        timestamp: 'Yesterday 4:10 PM',
        status: 'read',
        direction: 'outbound',
        card: {
          id: 'card-inv-1',
          title: 'Invoice #INV-2026-904',
          description: 'Amount Paid: ₹1,850 • GST Paid • 90 Days Service Warranty Active.',
          mediaUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
          mediaHeight: 'SHORT',
          actions: [
            { type: 'url', label: 'Download Tax Invoice', value: 'https://qiyam.in/inv/904.pdf' },
            { type: 'reply', label: '⭐️ Rate 5 Stars', value: 'RATING_5_STARS' },
          ],
        },
        suggestions: [
          { type: 'reply', label: '⭐️ Excellent Service' },
          { type: 'reply', label: '📄 Email Receipt' },
          { type: 'dial', label: '📞 Help Desk', value: '+919496300233' },
        ],
      },
      {
        id: 'rcs-m9',
        conversationId: 'rcs-conv-3',
        sender: 'customer',
        senderName: 'Amina Al-Mansoor',
        text: 'Technician was punctual and very professional. 5 stars from my side!',
        timestamp: 'Yesterday 4:30 PM',
        status: 'read',
        direction: 'inbound',
      },
    ],
  },
];

export const INITIAL_RCS_CAMPAIGNS: RCSCampaign[] = [
  {
    id: 'camp-rcs-1',
    name: 'Festive Season AMC Blast (Rich Card)',
    targetAudience: 'All Residential AC Owners (Kozhikode & Kochi)',
    recipientCount: 1450,
    deliveredCount: 1428,
    readCount: 1184,
    clickCount: 462,
    failedCount: 22,
    status: 'COMPLETED',
    type: 'Rich Card',
    messageText: 'Claim 25% festive discount on annual maintenance with guaranteed 2-hour breakdown assistance.',
    createdAt: 'Sep 25, 2026',
    fallbackSmsCount: 18,
    card: {
      id: 'festive-card-1',
      title: 'Festive Home Comfort Offer — 25% Off',
      description: 'Pre-book your seasonal service before rates revise. Includes complimentary indoor air sanitation.',
      mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      actions: [
        { type: 'reply', label: 'Claim 25% Coupon' },
        { type: 'url', label: 'Instant Booking', value: 'https://qiyam.in/festive' },
      ],
    },
  },
  {
    id: 'camp-rcs-2',
    name: 'Commercial VRV Chiller Maintenance Alert',
    targetAudience: 'Hotels, Hospitals & Commercial Establishments',
    recipientCount: 320,
    deliveredCount: 318,
    readCount: 295,
    clickCount: 114,
    failedCount: 2,
    status: 'COMPLETED',
    type: 'Carousel',
    messageText: 'Mandatory monsoon chiller maintenance and condenser inspection packages.',
    createdAt: 'Sep 27, 2026',
    fallbackSmsCount: 2,
  },
];

const RCS_CONFIG_STORAGE_KEY = 'whatsq_rcs_config_v2';
const RCS_CONVERSATIONS_STORAGE_KEY = 'whatsq_rcs_conversations_v2';
const RCS_CAMPAIGNS_STORAGE_KEY = 'whatsq_rcs_campaigns_v2';

export const getStoredRcsConfig = (): RCSConfig => {
  try {
    const raw = localStorage.getItem(RCS_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_RCS_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to parse stored RCS config:', err);
  }
  return DEFAULT_RCS_CONFIG;
};

export const persistRcsConfig = (config: RCSConfig) => {
  try {
    localStorage.setItem(RCS_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to persist RCS config:', err);
  }
};

export const getStoredRcsConversations = (): RCSConversationItem[] => {
  try {
    const raw = localStorage.getItem(RCS_CONVERSATIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse stored RCS conversations:', err);
  }
  return INITIAL_RCS_CONVERSATIONS;
};

export const persistRcsConversations = (conversations: RCSConversationItem[]) => {
  try {
    localStorage.setItem(RCS_CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.warn('Failed to persist RCS conversations:', err);
  }
};

export const getStoredRcsCampaigns = (): RCSCampaign[] => {
  try {
    const raw = localStorage.getItem(RCS_CAMPAIGNS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse stored RCS campaigns:', err);
  }
  return INITIAL_RCS_CAMPAIGNS;
};

export const persistRcsCampaigns = (campaigns: RCSCampaign[]) => {
  try {
    localStorage.setItem(RCS_CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
  } catch (err) {
    console.warn('Failed to persist RCS campaigns:', err);
  }
};

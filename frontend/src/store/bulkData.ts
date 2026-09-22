import {
  BulkCampaign,
  BulkCampaignRecipient,
  BulkContact,
  BulkRecipientList,
  BulkScheduledMessage,
  BulkTemplateItem,
  MetaWalletInfo,
  MetaWalletTransaction,
} from '../types';

export const initialMetaWallet: MetaWalletInfo = {
  balance: 0,
  currency: 'INR',
  autoDeduct: true,
  lowBalanceThreshold: 500.00,
  autoRecharge: true,
  autoRechargeAmount: 1000.00,
  conversationPricing: {
    marketing: 0.78,
    utility: 0.30,
    authentication: 0.12,
    service: 0.00,
  },
  lastUpdated: '',
  wabaId: '',
  paymentMethod: '',
  officialBillingUrl: 'https://business.facebook.com/billing_hub/',
};

// Wallet transactions are now loaded from real campaign history — no seed data.
export const initialWalletTransactions: MetaWalletTransaction[] = [];

export const SAMPLE_CONTACTS_POOL: Omit<BulkContact, 'id'>[] = [
  { name: 'Dr. Tariq Al-Mansoor', phone: '+966 50 123 4567', email: 'tariq.mansoor@almansoor.med', tag: 'VIP', validWhatsApp: true, optedOut: false, lastActive: '2 hours ago', source: 'Website' },
  { name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul.sharma@techcorp.in', tag: 'VIP', validWhatsApp: true, optedOut: false, lastActive: 'Yesterday', source: 'CRM' },
  { name: 'Amina Al-Balushi', phone: '+968 9123 4567', email: 'amina.b@muscatlogistics.om', tag: 'Loyal', validWhatsApp: true, optedOut: false, lastActive: '3 days ago', source: 'WhatsApp' },
  { name: 'Vikram Menon', phone: '+91 94470 12345', email: 'vikram.menon@koyilandy.com', tag: 'Corporate', validWhatsApp: true, optedOut: false, lastActive: 'Today', source: 'Referral' },
  { name: 'Zainab Qasim', phone: '+971 52 345 6789', email: 'zainab.q@dubaifacilities.ae', tag: 'Loyal', validWhatsApp: true, optedOut: false, lastActive: '5 hours ago', source: 'Website' },
  { name: 'Sneha Joshi', phone: '+91 98234 56789', email: 'sneha.j@punehomes.com', tag: 'Retail', validWhatsApp: true, optedOut: false, lastActive: '1 day ago', source: 'Campaign' },
  { name: 'Mohammed Al-Fayed', phone: '+966 55 987 6543', email: 'alfayed@jeddahproperties.sa', tag: 'VIP', validWhatsApp: true, optedOut: false, lastActive: 'Today', source: 'CRM' },
  { name: 'Arjun Nair', phone: '+91 97456 12389', email: 'arjun.nair@kochicooling.in', tag: 'Corporate', validWhatsApp: true, optedOut: false, lastActive: '2 days ago', source: 'Website' },
  { name: 'Fatima Zahra', phone: '+971 50 789 0123', email: 'fatima.z@alzahra.ae', tag: 'VIP', validWhatsApp: true, optedOut: false, lastActive: '4 hours ago', source: 'WhatsApp' },
  { name: 'Rajesh Pillai', phone: '+91 98471 99887', email: 'rajesh.p@calicutmarine.com', tag: 'Retail', validWhatsApp: true, optedOut: false, lastActive: 'Just now', source: 'Direct' },
  { name: 'Nasser Al-Harthy', phone: '+968 9234 5678', email: 'nasser@omanindustrial.com', tag: 'Corporate', validWhatsApp: true, optedOut: false, lastActive: 'Yesterday', source: 'Manual' },
  { name: 'Pooja Hegde', phone: '+91 91234 88776', email: 'pooja.h@bangalorelifestyle.com', tag: 'Loyal', validWhatsApp: true, optedOut: false, lastActive: '3 days ago', source: 'Website' },
  { name: 'Abdulrahman Al-Nuaimi', phone: '+971 56 443 2211', email: 'nuaimi@sharjahholdings.ae', tag: 'VIP', validWhatsApp: true, optedOut: false, lastActive: 'Today', source: 'CRM' },
  { name: 'Kavita Sundaram', phone: '+91 94462 33445', email: 'kavita.s@chennaibuilders.in', tag: 'Retail', validWhatsApp: true, optedOut: false, lastActive: '4 days ago', source: 'WhatsApp' },
  { name: 'Omar Bin Rashid', phone: '+966 54 332 1100', email: 'omar.rashid@riyadhtrading.com', tag: 'VIP', validWhatsApp: true, optedOut: false, lastActive: 'Yesterday', source: 'Referral' },
  { name: 'Siddharth Rao', phone: '+91 99887 76655', email: 'siddharth@hyderabadrealtors.com', tag: 'Corporate', validWhatsApp: true, optedOut: false, lastActive: '2 days ago', source: 'Website' },
  { name: 'Laila Al-Kuwari', phone: '+974 5512 3456', email: 'laila@dohaservices.qa', tag: 'Loyal', validWhatsApp: true, optedOut: false, lastActive: '5 days ago', source: 'Campaign' },
  { name: 'Ananya Deshmukh', phone: '+91 98200 11223', email: 'ananya@mumbaidesign.in', tag: 'Retail', validWhatsApp: true, optedOut: false, lastActive: 'Today', source: 'Website' },
  { name: 'Faisal Al-Otaibi', phone: '+966 53 111 2233', email: 'faisal.otaibi@riyadh.sa', tag: 'VIP', validWhatsApp: true, optedOut: false, lastActive: '1 hour ago', source: 'Direct' },
  { name: 'Deepa Varma', phone: '+91 94477 88990', email: 'deepa.varma@calicutlaw.in', tag: 'Retail', validWhatsApp: true, optedOut: false, lastActive: '3 hours ago', source: 'WhatsApp' },
  { name: 'Inactive Contact (Opted Out)', phone: '+91 80000 00000', email: 'optout@sample.com', tag: 'Opt-Out', validWhatsApp: false, optedOut: true, lastActive: '6 months ago', source: 'Unsubscribe' },
  { name: 'Unverified Lead', phone: '+91 70000 11111', email: 'unverified@test.com', tag: 'Unverified', validWhatsApp: false, optedOut: false, lastActive: '1 month ago', source: 'CSV' },
];

export const generateCampaignRecipients = (
  campaignId: string,
  total: number,
  delivered: number,
  failed: number,
  timeStr: string = '10:30 AM'
): BulkCampaignRecipient[] => {
  const failureReasons = [
    'Phone number not registered on WhatsApp',
    'User opted out (STOP reply received)',
    'Meta Cloud API timeout (Temporary carrier error)',
    'DND / Suppression list active',
  ];

  const pool = SAMPLE_CONTACTS_POOL;
  const list: BulkCampaignRecipient[] = [];
  const actualListSize = Math.min(total, 40);
  const failedCountToInclude = Math.min(failed, Math.ceil(actualListSize * 0.08));

  for (let i = 0; i < actualListSize; i++) {
    const contact = pool[i % pool.length];
    const isFailed = failed > 0 && i < failedCountToInclude;
    const isRead = !isFailed && i % 3 !== 0;

    list.push({
      id: `rec-${campaignId}-${i + 1}`,
      name: isFailed && i === 0 ? 'Unregistered Contact' : contact.name,
      phone: isFailed && i === 0 ? '+91 90000 00000' : contact.phone,
      status: isFailed ? 'FAILED' : isRead ? 'READ' : 'DELIVERED',
      time: timeStr,
      errorReason: isFailed ? failureReasons[i % failureReasons.length] : undefined,
    });
  }

  return list;
};


// Campaigns are now persisted in the Django DB and fetched from
// GET /api/conversations/bulk-campaigns/  — no fake seed data.
export const initialBulkCampaigns: BulkCampaign[] = [];

// Templates are now persisted in the Django DB and fetched from
// GET /api/conversations/templates/ — no fake seed data.
export const initialBulkTemplates: BulkTemplateItem[] = [];

const rawBulkRecipientLists = [
  {
    id: 'lst-1',
    name: 'Active Customers',
    description: 'Regular customers who made at least one purchase in last 6 months',
    type: 'Customers',
    contacts: 1245,
    createdOn: 'Sep 10, 2026, 10:15 AM',
    createdBy: 'Rahul Mehta',
    lastUpdated: 'Sep 18, 2026, 11:30 AM',
    status: 'Active',
    sources: { manual: 45, website: 30, csv: 20, other: 5 },
  },
  {
    id: 'lst-2',
    name: 'New Leads - September',
    description: 'Inbound leads from website contact forms and WhatsApp ad campaigns',
    type: 'Leads',
    contacts: 856,
    createdOn: 'Sep 08, 2026',
    createdBy: 'Priya Sharma',
    status: 'Active',
    sources: { manual: 20, website: 60, csv: 15, other: 5 },
  },
  {
    id: 'lst-3',
    name: 'Commercial AMC Clients',
    description: 'Corporate & enterprise service maintenance accounts',
    type: 'Customers',
    contacts: 2340,
    createdOn: 'Sep 05, 2026',
    createdBy: 'Amit Verma',
    status: 'Active',
    sources: { manual: 50, website: 20, csv: 25, other: 5 },
  },
  {
    id: 'lst-4',
    name: 'Seasonal Promo Segment',
    description: 'Special seasonal campaign segment for business promotions',
    type: 'Campaign',
    contacts: 1890,
    createdOn: 'Sep 02, 2026',
    createdBy: 'Neha Patel',
    status: 'Active',
    sources: { manual: 30, website: 40, csv: 20, other: 10 },
  },
  {
    id: 'lst-5',
    name: 'Inactive Customers',
    description: 'No bookings or inquiries in the last 6 months',
    type: 'Customers',
    contacts: 980,
    createdOn: 'Aug 28, 2026',
    createdBy: 'Suresh Yadav',
    status: 'Inactive',
    sources: { manual: 60, website: 10, csv: 25, other: 5 },
  },
  {
    id: 'lst-6',
    name: 'VIP Clients',
    description: 'Commercial & priority clients with orders above ₹10,000',
    type: 'VIP',
    contacts: 520,
    createdOn: 'Aug 20, 2026',
    createdBy: 'Rahul Mehta',
    status: 'Active',
    sources: { manual: 70, website: 15, csv: 10, other: 5 },
  },
  {
    id: 'lst-7',
    name: 'Newsletter Subscribers',
    description: 'Opted-in marketing and tips email/WhatsApp subscribers',
    type: 'General',
    contacts: 3450,
    createdOn: 'Aug 15, 2026',
    createdBy: 'Priya Sharma',
    status: 'Active',
    sources: { manual: 10, website: 75, csv: 10, other: 5 },
  },
  {
    id: 'lst-8',
    name: 'Service AMC Clients',
    description: 'Customers with active annual maintenance agreements',
    type: 'Leads',
    contacts: 1120,
    createdOn: 'Aug 10, 2026',
    createdBy: 'Amit Verma',
    status: 'Active',
    sources: { manual: 35, website: 45, csv: 15, other: 5 },
  },
  {
    id: 'lst-9',
    name: 'Payment Pending',
    description: 'Customers with unpaid invoices or pending quotation approvals',
    type: 'Follow-up',
    contacts: 640,
    createdOn: 'Aug 05, 2026',
    createdBy: 'Neha Patel',
    status: 'Active',
    sources: { manual: 80, website: 5, csv: 10, other: 5 },
  },
  {
    id: 'lst-10',
    name: 'Test List',
    description: 'Internal QA & test phone numbers for previewing campaigns',
    type: 'General',
    contacts: 100,
    createdOn: 'Aug 01, 2026',
    createdBy: 'Rahul Mehta',
    status: 'Active',
    sources: { manual: 100, website: 0, csv: 0, other: 0 },
  },
];

export const getSampleContactsForList = (listId: string, listName: string): BulkContact[] => {
  return SAMPLE_CONTACTS_POOL.map((c, index) => ({
    ...c,
    id: `cnt-${listId}-${index + 1}`,
  }));
};

export const initialBulkRecipientLists: BulkRecipientList[] = rawBulkRecipientLists.map((l) => ({
  ...l,
  contactCount: l.contacts,
  validWhatsAppCount: Math.round(l.contacts * 0.98),
  tags: ['VIP', 'Active', 'Marketing'],
  createdAt: l.createdOn,
  lastUsedAt: l.lastUpdated,
  contactItems: getSampleContactsForList(l.id, l.name),
}));

const rawBulkScheduledMessages = [
  {
    id: 'sch-1',
    name: 'May Offers Campaign',
    description: 'Promotional offers for May',
    type: 'Campaign',
    scheduledDateTime: 'May 12, 2024 10:00 AM',
    scheduledDate: 'May 12, 2024',
    scheduledTime: '10:00 AM',
    recipients: 1240,
    status: 'Pending',
    createdBy: 'Rahul Mehta',
    createdOn: 'May 10, 2024, 02:15 PM',
    templateUsed: 'May Offer - Template',
    messageText: '🎉 Special May Offers!\nGet up to 50% off on our services.\n\nBook now and make the most of this limited time offer!\n\nFor more details, visit our website.',
  },
  {
    id: 'sch-2',
    name: 'Appointment Reminders',
    description: 'Salon appointments reminder blast',
    type: 'Transactional',
    scheduledDateTime: 'May 10, 2024 09:00 AM',
    scheduledDate: 'May 10, 2024',
    scheduledTime: '09:00 AM',
    recipients: 856,
    status: 'Pending',
    createdBy: 'Amit Verma',
    createdOn: 'May 8, 2024',
    templateUsed: 'Appointment Reminder',
    messageText: 'Friendly reminder about your scheduled visit tomorrow.',
  },
  {
    id: 'sch-3',
    name: 'Festival Greetings',
    description: 'Onam special wishes to all customers',
    type: 'Campaign',
    scheduledDateTime: 'May 15, 2024 08:00 AM',
    scheduledDate: 'May 15, 2024',
    scheduledTime: '08:00 AM',
    recipients: 1890,
    status: 'Pending',
    createdBy: 'Neha Patel',
    createdOn: 'May 9, 2024',
    templateUsed: 'Festival Greeting Card',
    messageText: 'Warm wishes on this festive season from CoolFix team!',
  },
  {
    id: 'sch-4',
    name: 'Payment Follow-up',
    description: 'Pending payments reminder',
    type: 'Transactional',
    scheduledDateTime: 'May 11, 2024 11:30 AM',
    scheduledDate: 'May 11, 2024',
    scheduledTime: '11:30 AM',
    recipients: 412,
    status: 'Sent',
    createdBy: 'Suresh Yadav',
    createdOn: 'May 5, 2024',
    templateUsed: 'Payment Reminder',
    messageText: 'Gentle reminder regarding pending invoice due this week.',
  },
  {
    id: 'sch-5',
    name: 'New Service Launch',
    description: 'Service announcement blast',
    type: 'Campaign',
    scheduledDateTime: 'May 5, 2024 09:00 AM',
    scheduledDate: 'May 5, 2024',
    scheduledTime: '09:00 AM',
    recipients: 2346,
    status: 'Sent',
    createdBy: 'Priya Sharma',
    createdOn: 'Apr 30, 2024',
    templateUsed: 'Offer Announcement',
    messageText: 'Introducing our brand new 24/7 HVAC care service.',
  },
  {
    id: 'sch-6',
    name: 'Feedback Request',
    description: 'Customer feedback survey',
    type: 'Transactional',
    scheduledDateTime: 'May 8, 2024 04:00 PM',
    scheduledDate: 'May 8, 2024',
    scheduledTime: '04:00 PM',
    recipients: 980,
    status: 'Pending',
    createdBy: 'Arjun Nair',
    createdOn: 'May 6, 2024',
    templateUsed: 'Feedback Request',
    messageText: 'Please share your quick feedback on our technician service.',
  },
  {
    id: 'sch-7',
    name: 'Newsletter - May',
    description: 'Monthly updates & maintenance tips',
    type: 'Campaign',
    scheduledDateTime: 'May 18, 2024 10:00 AM',
    scheduledDate: 'May 18, 2024',
    scheduledTime: '10:00 AM',
    recipients: 3450,
    status: 'Pending',
    createdBy: 'Priya Sharma',
    createdOn: 'May 11, 2024',
    templateUsed: 'Welcome Message',
    messageText: 'Your monthly guide to energy saving and AC health.',
  },
  {
    id: 'sch-8',
    name: 'Inactive Customer Re-engagement',
    description: 'Win back campaign with special 30% discount',
    type: 'Campaign',
    scheduledDateTime: 'May 20, 2024 09:30 AM',
    scheduledDate: 'May 20, 2024',
    scheduledTime: '09:30 AM',
    recipients: 640,
    status: 'Pending',
    createdBy: 'Suresh Yadav',
    createdOn: 'May 12, 2024',
    templateUsed: 'Offer Announcement',
    messageText: 'We miss you! Here is an exclusive 30% discount on your next booking.',
  },
  {
    id: 'sch-9',
    name: 'Welcome Series - Part 1',
    description: 'New user onboarding sequence',
    type: 'Transactional',
    scheduledDateTime: 'May 22, 2024 11:00 AM',
    scheduledDate: 'May 22, 2024',
    scheduledTime: '11:00 AM',
    recipients: 520,
    status: 'Pending',
    createdBy: 'Rahul Mehta',
    createdOn: 'May 14, 2024',
    templateUsed: 'Welcome Message',
    messageText: 'Getting started with CoolFix: how to request emergency visits on WhatsApp.',
  },
  {
    id: 'sch-10',
    name: 'Year End Offer Reminder',
    description: 'Last chance deals',
    type: 'Campaign',
    scheduledDateTime: 'May 28, 2024 02:00 PM',
    scheduledDate: 'May 28, 2024',
    scheduledTime: '02:00 PM',
    recipients: 1120,
    status: 'Pending',
    createdBy: 'Rahul Mehta',
    createdOn: 'May 15, 2024',
    templateUsed: 'Offer Announcement',
    messageText: 'Final reminder: Annual maintenance promo ends in 48 hours!',
  },
];

export const initialBulkScheduledMessages: BulkScheduledMessage[] = rawBulkScheduledMessages.map(
  (s) => ({
    ...s,
    campaignName: s.name,
    recipientGroupName: 'All Active Customers',
    recipientCount: s.recipients,
    scheduledFor: s.scheduledDateTime,
    templateName: s.templateUsed || 'Offer Announcement',
    category: 'marketing',
    status: s.status === 'Pending' ? 'QUEUED' : 'SENT',
    estimatedCost: Number((s.recipients * 0.78).toFixed(2)),
  })
);

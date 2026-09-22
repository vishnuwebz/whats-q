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

export const SAMPLE_CONTACTS_POOL: Omit<BulkContact, 'id'>[] = [];

export const generateCampaignRecipients = (
  _campaignId: string,
  _total: number,
  _delivered: number,
  _failed: number,
  _timeStr: string = '10:30 AM'
): BulkCampaignRecipient[] => {
  return [];
};


// Campaigns are now persisted in the Django DB and fetched from
// GET /api/conversations/bulk-campaigns/  — no fake seed data.
export const initialBulkCampaigns: BulkCampaign[] = [];

// Templates are now persisted in the Django DB and fetched from
// GET /api/conversations/templates/ — no fake seed data.
export const initialBulkTemplates: BulkTemplateItem[] = [];

export const getSampleContactsForList = (_listId: string, _listName: string): BulkContact[] => {
  return [];
};

// Recipient lists are dynamically populated from real conversations, leads, and customers.
export const initialBulkRecipientLists: BulkRecipientList[] = [];

// Scheduled messages are persisted and loaded from real campaign schedule.
export const initialBulkScheduledMessages: BulkScheduledMessage[] = [];


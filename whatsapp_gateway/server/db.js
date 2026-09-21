import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/store.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default store initial structure
const defaultStore = {
  accounts: [],
  contacts: [],
  templates: [
    {
      id: 'tpl-1',
      title: 'Wholesale Special Offer',
      messageText: 'Hello {{Name}}! Exclusive wholesale discounts available for {{Company}}.',
      buttons: [
        { id: 'btn-1', type: 'url', text: 'View Catalog', value: 'https://qiyam.ventures' },
      ],
      createdAt: '2026-02-12',
    },
  ],
  campaigns: [],
  campaignLogs: [],
  chatbotRules: [
    {
      id: 'rule-1',
      title: 'Price List Auto-Reply',
      triggerKeywords: ['price', 'catalog', 'rate'],
      matchType: 'contains',
      replyText: 'Hello! Here is our latest wholesale rate card catalog PDF.',
      mediaName: 'Rate-Card-Catalog.pdf',
      timesTriggered: 0,
      isActive: true,
    },
  ],
  tenants: [
    {
      id: 'tenant-1',
      businessName: 'My Business Workspace',
      initials: 'MB',
      activeLicenses: 1,
      maxLicenses: 50,
      status: 'active',
      features: { multiAccount: true, botBuilder: true, interactiveButtons: true, customBranding: true },
    },
  ],
  settings: {
    companyName: 'WhatsQ',
    subtitle: 'Business Operating System',
    primaryColor: '#006b53',
    primaryContainerColor: '#00a884',
    globalSafetyMinDelay: 10,
    emergencyStopActive: false,
  },
  stats: {
    totalSent: 0,
    delivered: 0,
    failed: 0,
  },
};

export function getDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultStore, null, 2), 'utf-8');
      return defaultStore;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[DB Read Error]:', err.message);
    return defaultStore;
  }
}

export function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DB Write Error]:', err.message);
    return false;
  }
}

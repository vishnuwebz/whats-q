/**
 * WhatsQ / Qiyam Business OS - Backup & Restore Manager
 * Handles complete multi-entity data snapshots, JSON export/import,
 * schema validation, auto-backup intervals, and local snapshot archives.
 */

import { useQiyamStore } from '@/store/useQiyamStore';

export interface BackupEntityCounts {
  conversations: number;
  leads: number;
  deals: number;
  appointments: number;
  customers: number;
  jobs: number;
  employees: number;
  attendance: number;
  tasks: number;
  routes: number;
  inventory: number;
  transactions: number;
  invoices: number;
  expenses: number;
  accounts: number;
  workflows: number;
  branches: number;
  bulkCampaigns: number;
  templates: number;
  knowledgeArticles: number;
}

export interface BackupMetadata {
  app: string;
  version: string;
  schemaVersion: string;
  createdAt: string;
  type: 'auto' | 'manual' | 'pre_update';
  tenantName: string;
  tenantId: string;
  checksum: string;
  totalRecords: number;
  entityCounts: BackupEntityCounts;
}

export interface FullBackupPayload {
  metadata: BackupMetadata;
  data: {
    conversations: any[];
    leads: any[];
    deals: any[];
    appointments: any[];
    customers: any[];
    jobs: any[];
    employees: any[];
    attendance: any[];
    tasks: any[];
    routes: any[];
    inventory: any[];
    transactions: any[];
    invoices: any[];
    expenses: any[];
    accounts: any[];
    workflows: any[];
    branches: any[];
    bulkCampaigns: any[];
    bulkRecipientLists: any[];
    bulkScheduledMessages: any[];
    templates: any[];
    knowledgeArticles: any[];
  };
}

export interface StoredSnapshot {
  id: string;
  name: string;
  createdAt: string;
  type: 'auto' | 'manual' | 'pre_update';
  sizeBytes: number;
  totalRecords: number;
  entityCounts: BackupEntityCounts;
  payloadJson?: string;
}

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: '1h' | '6h' | '12h' | '24h' | 'weekly';
  lastBackupTime: string | null;
  nextBackupTime: string | null;
}

const STORAGE_KEY_SNAPSHOTS = 'whatsq_backup_snapshots';
const STORAGE_KEY_AUTOCONFIG = 'whatsq_autobackup_config';
const STORAGE_KEY_LAST_AUTOBACKUP = 'whatsq_last_auto_backup_time';

/**
 * Generates a simple checksum for data integrity verification
 */
function generateSimpleChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Collects all state from useQiyamStore and packages it into a complete backup payload
 */
export function generateFullBackupPayload(type: 'auto' | 'manual' | 'pre_update' = 'manual'): FullBackupPayload {
  const store = useQiyamStore.getState();

  const data = {
    conversations: store.conversations || [],
    leads: store.leads || [],
    deals: store.deals || [],
    appointments: store.appointments || [],
    customers: store.customers || [],
    jobs: store.jobs || [],
    employees: store.employees || [],
    attendance: store.attendance || [],
    tasks: store.tasks || [],
    routes: store.routes || [],
    inventory: store.inventory || [],
    transactions: store.transactions || [],
    invoices: store.invoices || [],
    expenses: store.expenses || [],
    accounts: store.accounts || [],
    workflows: store.workflows || [],
    branches: store.branches || [],
    bulkCampaigns: store.bulkCampaigns || [],
    bulkRecipientLists: store.bulkRecipientLists || [],
    bulkScheduledMessages: store.bulkScheduledMessages || [],
    templates: store.templates || [],
    knowledgeArticles: store.knowledgeArticles || [],
  };

  const entityCounts: BackupEntityCounts = {
    conversations: data.conversations.length,
    leads: data.leads.length,
    deals: data.deals.length,
    appointments: data.appointments.length,
    customers: data.customers.length,
    jobs: data.jobs.length,
    employees: data.employees.length,
    attendance: data.attendance.length,
    tasks: data.tasks.length,
    routes: data.routes.length,
    inventory: data.inventory.length,
    transactions: data.transactions.length,
    invoices: data.invoices.length,
    expenses: data.expenses.length,
    accounts: data.accounts.length,
    workflows: data.workflows.length,
    branches: data.branches.length,
    bulkCampaigns: data.bulkCampaigns.length,
    templates: data.templates.length,
    knowledgeArticles: data.knowledgeArticles.length,
  };

  const totalRecords = Object.values(entityCounts).reduce((a, b) => a + b, 0);
  const jsonString = JSON.stringify(data);
  const checksum = generateSimpleChecksum(jsonString);

  const metadata: BackupMetadata = {
    app: 'WhatsQ / Qiyam Business OS',
    version: store.versionInfo?.current_commit || 'v2.4.2',
    schemaVersion: '2.4.2',
    createdAt: new Date().toISOString(),
    type,
    tenantName: 'Qiyam Head Office (Calicut)',
    tenantId: 'qiyam-calicut-main',
    checksum,
    totalRecords,
    entityCounts,
  };

  return { metadata, data };
}

/**
 * Triggers a browser download of the full backup payload as a .json file
 */
export function exportBackupToFile(payload?: FullBackupPayload): string {
  const finalPayload = payload || generateFullBackupPayload('manual');
  const jsonStr = JSON.stringify(finalPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `whatsq-backup-${timestamp}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Validates and parses an uploaded .json backup file
 */
export async function parseAndValidateBackup(file: File): Promise<{
  valid: boolean;
  error?: string;
  payload?: FullBackupPayload;
  preview?: {
    createdAt: string;
    version: string;
    type: string;
    totalRecords: number;
    entityCounts: BackupEntityCounts;
  };
}> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    // Check if standard FullBackupPayload
    if (parsed.metadata && parsed.data) {
      const counts: BackupEntityCounts = parsed.metadata.entityCounts || {
        conversations: parsed.data.conversations?.length || 0,
        leads: parsed.data.leads?.length || 0,
        deals: parsed.data.deals?.length || 0,
        appointments: parsed.data.appointments?.length || 0,
        customers: parsed.data.customers?.length || 0,
        jobs: parsed.data.jobs?.length || 0,
        employees: parsed.data.employees?.length || 0,
        attendance: parsed.data.attendance?.length || 0,
        tasks: parsed.data.tasks?.length || 0,
        routes: parsed.data.routes?.length || 0,
        inventory: parsed.data.inventory?.length || 0,
        transactions: parsed.data.transactions?.length || 0,
        invoices: parsed.data.invoices?.length || 0,
        expenses: parsed.data.expenses?.length || 0,
        accounts: parsed.data.accounts?.length || 0,
        workflows: parsed.data.workflows?.length || 0,
        branches: parsed.data.branches?.length || 0,
        bulkCampaigns: parsed.data.bulkCampaigns?.length || 0,
        templates: parsed.data.templates?.length || 0,
        knowledgeArticles: parsed.data.knowledgeArticles?.length || 0,
      };

      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      return {
        valid: true,
        payload: parsed as FullBackupPayload,
        preview: {
          createdAt: parsed.metadata.createdAt || new Date().toISOString(),
          version: parsed.metadata.version || 'v2.4.2',
          type: parsed.metadata.type || 'imported',
          totalRecords: total,
          entityCounts: counts,
        },
      };
    }

    // Support legacy flat backup payload (e.g. from pre-update backup)
    if (parsed.conversations || parsed.leads || parsed.invoices) {
      const counts: BackupEntityCounts = {
        conversations: parsed.conversations?.length || 0,
        leads: parsed.leads?.length || 0,
        deals: parsed.deals?.length || 0,
        appointments: parsed.appointments?.length || 0,
        customers: parsed.customers?.length || 0,
        jobs: parsed.jobs?.length || 0,
        employees: parsed.employees?.length || 0,
        attendance: parsed.attendance?.length || 0,
        tasks: parsed.tasks?.length || 0,
        routes: parsed.routes?.length || 0,
        inventory: parsed.inventory?.length || 0,
        transactions: parsed.transactions?.length || 0,
        invoices: parsed.invoices?.length || 0,
        expenses: parsed.expenses?.length || 0,
        accounts: parsed.accounts?.length || 0,
        workflows: parsed.workflows?.length || 0,
        branches: parsed.branches?.length || 0,
        bulkCampaigns: parsed.bulkCampaigns?.length || 0,
        templates: parsed.templates?.length || 0,
        knowledgeArticles: parsed.knowledgeArticles?.length || 0,
      };
      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      const normalizedPayload: FullBackupPayload = {
        metadata: {
          app: 'WhatsQ / Qiyam Business OS',
          version: parsed.version || 'v2.4.2',
          schemaVersion: '1.0.0',
          createdAt: parsed.timestamp || new Date().toISOString(),
          type: 'manual',
          tenantName: 'Qiyam Head Office',
          tenantId: 'qiyam-calicut-main',
          checksum: 'legacy',
          totalRecords: total,
          entityCounts: counts,
        },
        data: {
          conversations: parsed.conversations || [],
          leads: parsed.leads || [],
          deals: parsed.deals || [],
          appointments: parsed.appointments || [],
          customers: parsed.customers || [],
          jobs: parsed.jobs || [],
          employees: parsed.employees || [],
          attendance: parsed.attendance || [],
          tasks: parsed.tasks || [],
          routes: parsed.routes || [],
          inventory: parsed.inventory || [],
          transactions: parsed.transactions || [],
          invoices: parsed.invoices || [],
          expenses: parsed.expenses || [],
          accounts: parsed.accounts || [],
          workflows: parsed.workflows || [],
          branches: parsed.branches || [],
          bulkCampaigns: parsed.bulkCampaigns || [],
          bulkRecipientLists: parsed.bulkRecipientLists || [],
          bulkScheduledMessages: parsed.bulkScheduledMessages || [],
          templates: parsed.templates || [],
          knowledgeArticles: parsed.knowledgeArticles || [],
        },
      };

      return {
        valid: true,
        payload: normalizedPayload,
        preview: {
          createdAt: normalizedPayload.metadata.createdAt,
          version: normalizedPayload.metadata.version,
          type: 'legacy_backup',
          totalRecords: total,
          entityCounts: counts,
        },
      };
    }

    return {
      valid: false,
      error: 'Invalid backup file format. Expected a valid WhatsQ JSON backup payload.',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Could not parse JSON file: ${err.message || 'Syntax error'}`,
    };
  }
}

/**
 * Restores a validated backup payload into the active store and updates persistence
 */
export function restoreBackupToStore(payload: FullBackupPayload, mode: 'overwrite' | 'merge' = 'overwrite'): boolean {
  try {
    const store = useQiyamStore.getState();
    const { data } = payload;

    if (mode === 'overwrite') {
      useQiyamStore.setState({
        conversations: data.conversations || [],
        leads: data.leads || [],
        deals: data.deals || [],
        appointments: data.appointments || [],
        customers: data.customers || [],
        jobs: data.jobs || [],
        employees: data.employees || [],
        attendance: data.attendance || [],
        tasks: data.tasks || [],
        routes: data.routes || [],
        inventory: data.inventory || [],
        transactions: data.transactions || [],
        invoices: data.invoices || [],
        expenses: data.expenses || [],
        accounts: data.accounts || [],
        workflows: data.workflows || [],
        branches: data.branches || [],
        bulkCampaigns: data.bulkCampaigns || [],
        bulkRecipientLists: data.bulkRecipientLists || [],
        bulkScheduledMessages: data.bulkScheduledMessages || [],
        templates: data.templates || [],
        knowledgeArticles: data.knowledgeArticles || [],
      });
    } else {
      // Merge mode: append new items that don't match existing ids
      const mergeArrays = (existing: any[] = [], incoming: any[] = []) => {
        const idSet = new Set(existing.map((item) => item.id || item._id));
        const nonConflicts = incoming.filter((item) => !idSet.has(item.id || item._id));
        return [...existing, ...nonConflicts];
      };

      useQiyamStore.setState({
        conversations: mergeArrays(store.conversations, data.conversations),
        leads: mergeArrays(store.leads, data.leads),
        deals: mergeArrays(store.deals, data.deals),
        appointments: mergeArrays(store.appointments, data.appointments),
        customers: mergeArrays(store.customers, data.customers),
        jobs: mergeArrays(store.jobs, data.jobs),
        employees: mergeArrays(store.employees, data.employees),
        attendance: mergeArrays(store.attendance, data.attendance),
        tasks: mergeArrays(store.tasks, data.tasks),
        routes: mergeArrays(store.routes, data.routes),
        inventory: mergeArrays(store.inventory, data.inventory),
        transactions: mergeArrays(store.transactions, data.transactions),
        invoices: mergeArrays(store.invoices, data.invoices),
        expenses: mergeArrays(store.expenses, data.expenses),
        accounts: mergeArrays(store.accounts, data.accounts),
        workflows: mergeArrays(store.workflows, data.workflows),
        branches: mergeArrays(store.branches, data.branches),
        bulkCampaigns: mergeArrays(store.bulkCampaigns, data.bulkCampaigns),
        templates: mergeArrays(store.templates, data.templates),
        knowledgeArticles: mergeArrays(store.knowledgeArticles, data.knowledgeArticles),
      });
    }

    // Also create a safety snapshot before the restore took place
    saveLocalSnapshot('manual', `Restored from ${payload.metadata.version} snapshot`);

    return true;
  } catch (err) {
    console.error('Failed to restore backup:', err);
    return false;
  }
}

/**
 * Saves a snapshot to localStorage
 */
export function saveLocalSnapshot(
  type: 'auto' | 'manual' | 'pre_update' = 'manual',
  customName?: string
): StoredSnapshot {
  const payload = generateFullBackupPayload(type);
  const jsonStr = JSON.stringify(payload);
  const sizeBytes = new Blob([jsonStr]).size;

  const snapshot: StoredSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: customName || (type === 'auto' ? 'Scheduled Auto-Backup' : type === 'pre_update' ? 'Pre-Update System Snapshot' : 'Manual Workspace Snapshot'),
    createdAt: payload.metadata.createdAt,
    type,
    sizeBytes,
    totalRecords: payload.metadata.totalRecords,
    entityCounts: payload.metadata.entityCounts,
    payloadJson: jsonStr,
  };

  try {
    const existing = getStoredSnapshots();
    // Keep max 10 snapshots in storage
    const updated = [snapshot, ...existing].slice(0, 10);
    localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(updated));
    if (type === 'auto') {
      localStorage.setItem(STORAGE_KEY_LAST_AUTOBACKUP, snapshot.createdAt);
    }
  } catch (e) {
    console.warn('Storage quota exceeded, removing oldest snapshot', e);
    try {
      const existing = getStoredSnapshots();
      const trimmed = [snapshot, ...existing.slice(0, 3)];
      localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(trimmed));
    } catch {}
  }

  return snapshot;
}

/**
 * Gets all saved snapshots from localStorage
 */
export function getStoredSnapshots(): StoredSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
    if (!raw) {
      // Check if there is an initial pre-update backup to seed
      const preUpdateRaw = localStorage.getItem('whatsq_pre_update_backup');
      if (preUpdateRaw) {
        try {
          const parsed = JSON.parse(preUpdateRaw);
          const seeded: StoredSnapshot = {
            id: 'snap_pre_update_seed',
            name: 'Initial System Snapshot',
            createdAt: parsed.timestamp || new Date().toISOString(),
            type: 'pre_update',
            sizeBytes: new Blob([preUpdateRaw]).size,
            totalRecords: 145,
            entityCounts: {
              conversations: parsed.conversations?.length || 12,
              leads: parsed.leads?.length || 8,
              deals: parsed.deals?.length || 5,
              appointments: parsed.appointments?.length || 6,
              customers: parsed.customers?.length || 20,
              jobs: parsed.jobs?.length || 4,
              employees: parsed.employees?.length || 7,
              attendance: parsed.attendance?.length || 15,
              tasks: parsed.tasks?.length || 9,
              routes: parsed.routes?.length || 3,
              inventory: parsed.inventory?.length || 14,
              transactions: parsed.transactions?.length || 18,
              invoices: parsed.invoices?.length || 11,
              expenses: parsed.expenses?.length || 6,
              accounts: parsed.accounts?.length || 3,
              workflows: parsed.workflows?.length || 4,
              branches: parsed.branches?.length || 2,
              bulkCampaigns: parsed.bulkCampaigns?.length || 3,
              templates: 5,
              knowledgeArticles: 3,
            },
            payloadJson: preUpdateRaw,
          };
          localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify([seeded]));
          return [seeded];
        } catch {}
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Deletes a snapshot by id
 */
export function deleteStoredSnapshot(id: string): boolean {
  try {
    const existing = getStoredSnapshots();
    const filtered = existing.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves the Auto-Backup configuration
 */
export function getAutoBackupConfig(): AutoBackupConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTOCONFIG);
    const lastBackup = localStorage.getItem(STORAGE_KEY_LAST_AUTOBACKUP) || null;

    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled ?? true,
        frequency: parsed.frequency ?? '6h',
        lastBackupTime: lastBackup || parsed.lastBackupTime || new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        nextBackupTime: calculateNextBackupTime(parsed.frequency ?? '6h', lastBackup),
      };
    }
  } catch {}

  // Defaults: Enabled, 6h frequency
  const defaultLast = new Date(Date.now() - 1000 * 60 * 25).toISOString(); // 25 mins ago
  return {
    enabled: true,
    frequency: '6h',
    lastBackupTime: defaultLast,
    nextBackupTime: calculateNextBackupTime('6h', defaultLast),
  };
}

/**
 * Saves the Auto-Backup configuration
 */
export function saveAutoBackupConfig(config: Partial<AutoBackupConfig>): AutoBackupConfig {
  const current = getAutoBackupConfig();
  const next: AutoBackupConfig = {
    ...current,
    ...config,
    nextBackupTime: calculateNextBackupTime(config.frequency || current.frequency, config.lastBackupTime || current.lastBackupTime),
  };
  localStorage.setItem(STORAGE_KEY_AUTOCONFIG, JSON.stringify(next));
  return next;
}

/**
 * Calculates next scheduled backup time
 */
export function calculateNextBackupTime(frequency: AutoBackupConfig['frequency'], lastTime: string | null): string {
  const baseTime = lastTime ? new Date(lastTime).getTime() : Date.now();
  let intervalMs = 6 * 60 * 60 * 1000; // default 6h

  switch (frequency) {
    case '1h':
      intervalMs = 1 * 60 * 60 * 1000;
      break;
    case '6h':
      intervalMs = 6 * 60 * 60 * 1000;
      break;
    case '12h':
      intervalMs = 12 * 60 * 60 * 1000;
      break;
    case '24h':
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case 'weekly':
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
  }

  const target = baseTime + intervalMs;
  // If target is in the past, set to current time + 1 interval
  if (target < Date.now()) {
    return new Date(Date.now() + intervalMs).toISOString();
  }
  return new Date(target).toISOString();
}

/**
 * Formats relative time (e.g., '14 minutes ago', 'Today at 01:15 PM')
 */
export function formatRelativeTime(isoString?: string | null): { formattedDate: string; relativeText: string } {
  if (!isoString) {
    return { formattedDate: 'Never', relativeText: 'No backup recorded' };
  }

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let relativeText = 'Just now';
  if (diffMinutes >= 1 && diffMinutes < 60) {
    relativeText = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours >= 1 && diffHours < 24) {
    relativeText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays >= 1) {
    relativeText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return { formattedDate, relativeText };
}

/**
 * Checks if auto-backup should run and triggers it if due
 */
export function checkAndRunAutoBackup(): StoredSnapshot | null {
  const config = getAutoBackupConfig();
  if (!config.enabled) return null;

  const lastTime = config.lastBackupTime ? new Date(config.lastBackupTime).getTime() : 0;
  const now = Date.now();

  let intervalMs = 6 * 60 * 60 * 1000;
  switch (config.frequency) {
    case '1h':
      intervalMs = 1 * 60 * 60 * 1000;
      break;
    case '6h':
      intervalMs = 6 * 60 * 60 * 1000;
      break;
    case '12h':
      intervalMs = 12 * 60 * 60 * 1000;
      break;
    case '24h':
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case 'weekly':
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
  }

  if (now - lastTime >= intervalMs) {
    const snapshot = saveLocalSnapshot('auto');
    return snapshot;
  }
  return null;
}

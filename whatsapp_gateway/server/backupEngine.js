import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, saveDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.join(__dirname, '../data/backups');
const CONFIG_FILE = path.join(__dirname, '../data/backup_config.json');

// Ensure backups directory exists
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Default Backup Configuration
const DEFAULT_CONFIG = {
  enabled: true,
  frequency: 'daily', // 'hourly' | '6hours' | 'daily' | 'weekly'
  intervalMinutes: 1440, // 24 hours
  maxRetention: 20, // Keep last 20 snapshots
  lastRunAt: null,
  nextRunAt: null,
};

class BackupEngine {
  constructor() {
    this.schedulerTimer = null;
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('[BackupEngine] Could not load backup config, using defaults:', e.message);
    }
    return { ...DEFAULT_CONFIG };
  }

  saveConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      this.reschedule();
      return this.config;
    } catch (e) {
      console.error('[BackupEngine] Could not save config:', e.message);
      return this.config;
    }
  }

  /**
   * Get Storage Statistics & Record Counts of Current Active DB
   */
  getStorageHealth() {
    const db = getDb();
    const dbFilePath = path.join(__dirname, '../data/store.json');
    let sizeBytes = 0;
    try {
      if (fs.existsSync(dbFilePath)) {
        const stat = fs.statSync(dbFilePath);
        sizeBytes = stat.size;
      }
    } catch (e) {}

    const totalBackups = this.listBackups().length;

    return {
      success: true,
      sizeBytes,
      sizeFormatted: sizeBytes > 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(sizeBytes / 1024).toFixed(1)} KB`,
      totalBackups,
      counts: {
        accounts: (db.accounts || []).length,
        contacts: (db.contacts || []).length,
        templates: (db.templates || []).length,
        campaigns: (db.campaigns || []).length,
        campaignLogs: (db.campaignLogs || []).length,
        chatbotRules: (db.chatbotRules || []).length,
        tenants: (db.tenants || []).length,
        employees: (db.employees || []).length,
        jobs: (db.jobs || []).length,
        invoices: (db.invoices || []).length,
      },
      lastSaved: new Date().toISOString(),
    };
  }

  /**
   * Create a Snapshot Backup File
   * @param {'manual' | 'auto' | 'pre_restore' | 'imported'} type
   * @param {Object} [customData] Optional custom data object to backup
   * @param {string} [customLabel] Optional label for the backup
   */
  createBackup(type = 'manual', customData = null, customLabel = '') {
    try {
      const dataToSave = customData || getDb();
      const timestamp = new Date();
      const dateStr = timestamp.toISOString().replace(/[:.]/g, '-');
      const cleanLabel = customLabel ? `_${customLabel.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
      const filename = `whatsq_backup_${dateStr}_${type}${cleanLabel}.json`;
      const filePath = path.join(BACKUPS_DIR, filename);

      const metadata = {
        app: 'WhatsQ WhatsApp Automation Suite',
        version: '1.0.0',
        createdAt: timestamp.toISOString(),
        type,
        label: customLabel || (type === 'manual' ? 'Manual Backup' : type === 'auto' ? 'Scheduled Auto-Backup' : 'Safety Pre-Restore Snapshot'),
        summary: {
          accountsCount: (dataToSave.accounts || []).length,
          contactsCount: (dataToSave.contacts || []).length,
          templatesCount: (dataToSave.templates || []).length,
          campaignsCount: (dataToSave.campaigns || []).length,
          logsCount: (dataToSave.campaignLogs || []).length,
          botRulesCount: (dataToSave.chatbotRules || []).length,
          tenantsCount: (dataToSave.tenants || []).length,
        },
      };

      const payload = {
        metadata,
        data: dataToSave,
      };

      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');

      const stat = fs.statSync(filePath);
      const backupInfo = {
        filename,
        filepath: filePath,
        sizeBytes: stat.size,
        sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
        metadata,
      };

      console.log(`[BackupEngine] Created ${type} backup: ${filename} (${backupInfo.sizeFormatted})`);

      // Prune old backups if retention limit reached
      this.pruneOldBackups();

      return { success: true, backup: backupInfo };
    } catch (err) {
      console.error('[BackupEngine Error] Failed to create backup:', err);
      throw new Error(`Backup creation failed: ${err.message}`);
    }
  }

  /**
   * List all saved backups in descending chronological order
   */
  listBackups() {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) return [];

      const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith('.json'));
      const backups = [];

      for (const file of files) {
        try {
          const filePath = path.join(BACKUPS_DIR, file);
          const stat = fs.statSync(filePath);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw);

          const metadata = parsed.metadata || {
            app: 'WhatsQ',
            version: '1.0.0',
            createdAt: stat.mtime.toISOString(),
            type: file.includes('auto') ? 'auto' : file.includes('pre_restore') ? 'pre_restore' : 'manual',
            label: file,
            summary: {
              contactsCount: (parsed.data?.contacts || parsed.contacts || []).length,
              campaignsCount: (parsed.data?.campaigns || parsed.campaigns || []).length,
              logsCount: (parsed.data?.campaignLogs || parsed.campaignLogs || []).length,
            },
          };

          backups.push({
            filename: file,
            sizeBytes: stat.size,
            sizeFormatted: stat.size > 1024 * 1024
              ? `${(stat.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(stat.size / 1024).toFixed(1)} KB`,
            createdAt: metadata.createdAt || stat.mtime.toISOString(),
            type: metadata.type || 'manual',
            label: metadata.label || file,
            summary: metadata.summary || {},
          });
        } catch (readErr) {
          console.warn(`[BackupEngine] Skipping invalid backup file: ${file}`, readErr.message);
        }
      }

      // Sort newest first
      return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('[BackupEngine] Failed to list backups:', err);
      return [];
    }
  }

  /**
   * Safe Database Restore:
   * 1. Creates a safety 'pre_restore' snapshot of active DB.
   * 2. Writes the chosen snapshot to data/store.json.
   * 3. Returns the restored summary.
   */
  restoreBackup(filename = null, uploadedPayload = null) {
    try {
      let payloadToRestore = null;

      if (uploadedPayload) {
        payloadToRestore = uploadedPayload.data ? uploadedPayload.data : uploadedPayload;
      } else if (filename) {
        const filePath = path.join(BACKUPS_DIR, filename);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Backup file not found: "${filename}"`);
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        payloadToRestore = parsed.data ? parsed.data : parsed;
      } else {
        throw new Error('No backup filename or uploaded payload provided for restore.');
      }

      // Validation
      this.validateDatabaseSchema(payloadToRestore);

      // STEP 1: Create automatic safety pre-restore snapshot
      console.log('[BackupEngine] Generating safety pre-restore snapshot...');
      this.createBackup('pre_restore', null, 'Before Restore');

      // STEP 2: Overwrite active store.json
      const success = saveDb(payloadToRestore);
      if (!success) {
        throw new Error('Failed to write restored data to store.json');
      }

      console.log(`[BackupEngine] Successfully restored database from: ${filename || 'Imported Payload'}`);

      return {
        success: true,
        message: 'Database successfully restored.',
        restoredAt: new Date().toISOString(),
        counts: {
          accounts: (payloadToRestore.accounts || []).length,
          contacts: (payloadToRestore.contacts || []).length,
          templates: (payloadToRestore.templates || []).length,
          campaigns: (payloadToRestore.campaigns || []).length,
          campaignLogs: (payloadToRestore.campaignLogs || []).length,
          chatbotRules: (payloadToRestore.chatbotRules || []).length,
        },
      };
    } catch (err) {
      console.error('[BackupEngine Error] Restore failed:', err);
      throw new Error(`Restore failed: ${err.message}`);
    }
  }

  /**
   * Import external backup JSON file
   */
  importBackupFile(fileContent, originalName = 'imported_backup.json') {
    try {
      const parsed = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
      const data = parsed.data ? parsed.data : parsed;

      // Validate schema
      this.validateDatabaseSchema(data);

      const timestamp = new Date();
      const dateStr = timestamp.toISOString().replace(/[:.]/g, '-');
      const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '');
      const filename = `whatsq_backup_${dateStr}_imported_${cleanName}`;
      const filePath = path.join(BACKUPS_DIR, filename);

      const metadata = parsed.metadata || {
        app: 'WhatsQ WhatsApp Automation Suite',
        version: '1.0.0',
        createdAt: timestamp.toISOString(),
        type: 'imported',
        label: `Imported (${originalName})`,
        summary: {
          accountsCount: (data.accounts || []).length,
          contactsCount: (data.contacts || []).length,
          templatesCount: (data.templates || []).length,
          campaignsCount: (data.campaigns || []).length,
          logsCount: (data.campaignLogs || []).length,
          botRulesCount: (data.chatbotRules || []).length,
        },
      };

      const payload = {
        metadata,
        data,
      };

      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
      const stat = fs.statSync(filePath);

      return {
        success: true,
        filename,
        sizeBytes: stat.size,
        sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
        metadata,
        data,
      };
    } catch (err) {
      console.error('[BackupEngine] Import error:', err);
      throw new Error(`Import invalid: ${err.message}`);
    }
  }

  /**
   * Delete a snapshot
   */
  deleteBackup(filename) {
    try {
      const filePath = path.join(BACKUPS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[BackupEngine] Deleted backup: ${filename}`);
        return { success: true, filename };
      }
      throw new Error('Backup file does not exist');
    } catch (err) {
      throw new Error(`Delete failed: ${err.message}`);
    }
  }

  /**
   * Validate DB schema integrity before restore/import
   */
  validateDatabaseSchema(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON structure: Root must be a valid JSON object.');
    }
    // Check essential keys
    const expectedKeys = ['contacts', 'templates', 'campaigns', 'accounts'];
    const hasAnyEssential = expectedKeys.some((k) => Array.isArray(data[k]));
    if (!hasAnyEssential) {
      throw new Error('Invalid database format: Missing essential arrays (contacts, templates, campaigns, accounts).');
    }
    return true;
  }

  /**
   * Prune oldest backups according to maxRetention
   */
  pruneOldBackups() {
    try {
      const max = this.config.maxRetention || 20;
      const all = this.listBackups();
      if (all.length > max) {
        const toDelete = all.slice(max);
        for (const item of toDelete) {
          // Never auto-prune pre_restore backups within 24h
          const isRecentSafety = item.type === 'pre_restore' && (Date.now() - new Date(item.createdAt).getTime() < 86400000);
          if (!isRecentSafety) {
            try {
              fs.unlinkSync(path.join(BACKUPS_DIR, item.filename));
              console.log(`[BackupEngine] Pruned old backup: ${item.filename}`);
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn('[BackupEngine] Pruning warning:', e.message);
    }
  }

  /**
   * Initialize Automatic Backup Scheduler
   */
  initAutoBackupScheduler() {
    this.reschedule();
    console.log('[BackupEngine] Automated Backup Scheduler initialized.');
  }

  reschedule() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    if (!this.config.enabled) {
      console.log('[BackupEngine] Auto-backups currently disabled.');
      return;
    }

    let intervalMs = 24 * 60 * 60 * 1000; // Default daily
    if (this.config.frequency === 'hourly') {
      intervalMs = 60 * 60 * 1000;
    } else if (this.config.frequency === '6hours') {
      intervalMs = 6 * 60 * 60 * 1000;
    } else if (this.config.frequency === 'weekly') {
      intervalMs = 7 * 24 * 60 * 60 * 1000;
    }

    // Set initial auto-backup run check
    this.schedulerTimer = setInterval(() => {
      try {
        console.log('[BackupEngine] Running scheduled auto-backup...');
        this.createBackup('auto', null, 'Scheduled Snapshot');
        this.config.lastRunAt = new Date().toISOString();
        this.config.nextRunAt = new Date(Date.now() + intervalMs).toISOString();
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      } catch (err) {
        console.error('[BackupEngine] Auto-backup schedule run failed:', err.message);
      }
    }, intervalMs);

    this.config.nextRunAt = new Date(Date.now() + intervalMs).toISOString();
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (e) {}

    console.log(`[BackupEngine] Scheduled auto-backups every ${this.config.frequency} (interval: ${intervalMs / 60000} mins).`);
  }
}

export const backupEngine = new BackupEngine();

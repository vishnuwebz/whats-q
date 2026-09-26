import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';
import { getDb, saveDb } from './db.js';
import { baileysEngine } from './baileysEngine.js';
import { metaCloudApiEngine } from './metaCloudApiEngine.js';
import { campaignRunner } from './campaignRunner.js';
import { backupEngine } from './backupEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Create HTTP Server & WebSocket Server
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const connectedWsClients = new Set();

wss.on('connection', (ws) => {
  connectedWsClients.add(ws);
  console.log('[WebSocket Server] Client connected. Total clients:', connectedWsClients.size);

  ws.on('close', () => {
    connectedWsClients.delete(ws);
    console.log('[WebSocket Server] Client disconnected.');
  });
});

// Broadcast event to all WebSocket clients
function broadcastWsEvent(type, payload) {
  const message = JSON.stringify({ type, payload });
  for (const ws of connectedWsClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

// Listen to Baileys Engine events and forward to WebSockets & database
baileysEngine.onEvent((type, payload) => {
  broadcastWsEvent(type, payload);

  if (type === 'incoming_message') {
    broadcastWsEvent('new_inbox_message', payload);
  }

  if (type === 'session_ready') {
    const db = getDb();
    const acc = db.accounts.find((a) => a.id === payload.accountId);
    if (acc) {
      acc.status = 'online';
      if (payload.phoneNumber) acc.phoneNumber = payload.phoneNumber;
      saveDb(db);
    }
  }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'WhatsApp Automation Suite Production Server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    activeSockets: baileysEngine.sessions.size,
  });
});

// 1. Get Global Dashboard Overview & Telemetry
app.get('/api/stats', (req, res) => {
  const db = getDb();
  res.json({
    success: true,
    stats: db.stats,
    accountsCount: db.accounts.length,
    activeCampaigns: db.campaigns.filter((c) => c.status === 'running').length,
  });
});

// 2. Connected Phones / Accounts API
app.get('/api/accounts', (req, res) => {
  const db = getDb();
  const accountsMap = new Map();

  // 1. Process db.accounts and merge live status
  db.accounts.forEach((acc) => {
    const live = baileysEngine.getSessionStatus(acc.id);
    accountsMap.set(acc.id, {
      ...acc,
      status: live?.status || acc.status || 'disconnected',
      liveStatus: live?.status || acc.status || 'disconnected',
      phoneNumber: live?.phoneNumber || acc.phoneNumber || '',
      qrCode: live?.qrCode || acc.qrCode || null,
    });
  });

  // 2. Merge any active sessions in memory that are online
  for (const [sId, session] of baileysEngine.sessions.entries()) {
    if (!accountsMap.has(sId)) {
      accountsMap.set(sId, {
        id: sId,
        phoneNumber: session.phoneNumber || '',
        displayName: session.displayName || 'WhatsApp Line',
        status: session.status || 'disconnected',
        liveStatus: session.status || 'disconnected',
        dailyLimit: 2500,
        sentToday: 0,
        createdAt: session.startedAt || new Date().toISOString(),
        warmupScore: 95,
        qrCode: session.qrCode || null,
      });
    }
  }

  res.json({ success: true, accounts: Array.from(accountsMap.values()) });
});

app.post('/api/accounts/pair', async (req, res) => {
  const { id, phone, displayName } = req.body;
  const db = getDb();
  const accountId = id || `acc-${Date.now()}`;

  let existing = db.accounts.find((a) => a.id === accountId);
  if (!existing) {
    existing = {
      id: accountId,
      phoneNumber: phone || '',
      displayName: displayName || 'WhatsApp Line',
      status: 'connecting',
      dailyLimit: 2500,
      sentToday: 0,
      createdAt: new Date().toISOString(),
      warmupScore: 90,
    };
    db.accounts.push(existing);
    saveDb(db);
  }

  const sessionResult = await baileysEngine.startSession(
    existing.id,
    existing.phoneNumber,
    existing.displayName
  );

  res.json({
    success: true,
    account: existing,
    qrCode: sessionResult.qrCode || null,
  });
});

app.get('/api/accounts/qr/:id', (req, res) => {
  const { id } = req.params;
  const session = baileysEngine.getSessionStatus(id);
  res.json({
    success: true,
    accountId: id,
    qrCode: session?.qrCode || null,
    status: session?.status || 'disconnected',
  });
});

// Disconnect and unpair WhatsApp account (sends logout stanza to phone)
app.post('/api/accounts/:id/disconnect', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await baileysEngine.disconnectSession(id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/disconnect', '/api/accounts/disconnect'], async (req, res) => {
  const accountId = req.body?.id || req.body?.accountId || req.query?.id || 'all';
  try {
    const result = await baileysEngine.disconnectSession(accountId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch participating WhatsApp groups for an account (or any active account)
app.get('/api/accounts/:id/groups', async (req, res) => {
  const { id } = req.params;
  try {
    const groups = await baileysEngine.fetchGroups(id);
    res.json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, groups: [] });
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const groups = await baileysEngine.fetchGroups('any');
    res.json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, groups: [] });
  }
});

app.get('/api/groups/:jid', async (req, res) => {
  const { jid } = req.params;
  try {
    const group = await baileysEngine.fetchGroupDetails('any', jid);
    res.json({
      success: true,
      group,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.accounts = db.accounts.filter((a) => a.id !== id);
  saveDb(db);
  await baileysEngine.disconnectSession(id);
  res.json({ success: true });
});

// 3. Campaigns & Bulk Dispatch API
app.get('/api/campaigns', (req, res) => {
  const db = getDb();
  res.json({ success: true, campaigns: db.campaigns });
});

app.post('/api/campaigns/start', (req, res) => {
  const db = getDb();
  const newCamp = {
    ...req.body,
    id: req.body.id || `camp-${Date.now()}`,
    status: 'running',
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.campaigns.unshift(newCamp);
  saveDb(db);

  broadcastWsEvent('campaign_started', newCamp);

  // Trigger background runner
  campaignRunner.runCampaign(
    newCamp,
    (progress) => {
      const currentDb = getDb();
      const target = currentDb.campaigns.find((c) => c.id === newCamp.id);
      if (target) {
        target.sentCount = progress.sent;
        target.deliveredCount = progress.delivered;
        target.failedCount = progress.failed;
        saveDb(currentDb);
      }
      broadcastWsEvent('campaign_progress', { campaignId: newCamp.id, ...progress });
    },
    (finalResult) => {
      const currentDb = getDb();
      const target = currentDb.campaigns.find((c) => c.id === newCamp.id);
      if (target) {
        target.status = 'completed';
        target.completedAt = new Date().toISOString();
        saveDb(currentDb);
      }
      broadcastWsEvent('campaign_completed', { campaignId: newCamp.id, ...finalResult });
    }
  );

  res.json({ success: true, campaign: newCamp });
});

app.post('/api/campaigns/:id/pause', (req, res) => {
  const { id } = req.params;
  campaignRunner.pause();
  const db = getDb();
  const target = db.campaigns.find((c) => c.id === id);
  if (target) target.status = 'paused';
  saveDb(db);
  broadcastWsEvent('campaign_paused', { campaignId: id });
  res.json({ success: true });
});

// 4. Direct WhatsApp Message Send API (Dual Engine: Meta Cloud API + Baileys Socket)
app.post('/api/messages/send-direct', async (req, res) => {
  const { accountId, recipientPhone, messageText, buttons, mediaUrl, mediaName, mediaType } = req.body;
  const db = getDb();
  const targetAcc = (db.accounts || []).find((a) => a.id === accountId);
  const isMetaRequested =
    accountId === 'meta' ||
    accountId === 'acc-1787312440050' ||
    targetAcc?.phoneNumber?.includes('9496300233') ||
    targetAcc?.displayName?.toLowerCase().includes('meta');

  const savedMeta = db.metaConfig || {};
  const hasMeta = Boolean(savedMeta.accessToken && savedMeta.accessToken.length > 20);

  // If Meta explicitly requested or primary line, route to Meta Cloud API
  if (isMetaRequested && hasMeta) {
    try {
      const result = await metaCloudApiEngine.sendMessage(
        {
          phoneNumberId: savedMeta.phoneNumberId || '1307178355804150',
          accessToken: savedMeta.accessToken,
        },
        recipientPhone,
        messageText,
        buttons,
        mediaUrl,
        mediaType || 'image',
        mediaName
      );
      return res.json({ success: true, result, channel: 'meta_cloud_api' });
    } catch (metaErr) {
      console.error('[Meta Direct Send Error]:', metaErr.message);
      return res.status(500).json({ success: false, error: metaErr.message });
    }
  }

  // Otherwise try Baileys with automatic Meta Cloud API fallback
  try {
    const result = await baileysEngine.sendMessage(
      accountId || 'acc-1',
      recipientPhone,
      messageText,
      buttons,
      mediaUrl,
      mediaName
    );
    res.json({ success: true, result, channel: 'baileys_socket' });
  } catch (err) {
    // If Baileys fails and Meta Cloud API is configured, auto-fallback to Meta!
    if (hasMeta) {
      console.warn(`[Direct Send] Baileys failed (${err.message}). Auto-routing via Meta Cloud API (+91 94963 00233)...`);
      try {
        const metaResult = await metaCloudApiEngine.sendMessage(
          {
            phoneNumberId: savedMeta.phoneNumberId || '1307178355804150',
            accessToken: savedMeta.accessToken,
          },
          recipientPhone,
          messageText,
          buttons,
          mediaUrl,
          mediaType || 'image',
          mediaName
        );
        return res.json({ success: true, result: metaResult, channel: 'meta_cloud_api' });
      } catch (fallbackErr) {
        return res.status(500).json({ success: false, error: fallbackErr.message });
      }
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Delivery Logs & Telemetry API
app.get('/api/campaigns/logs', (req, res) => {
  const db = getDb();
  res.json({ success: true, logs: db.campaignLogs || [] });
});

app.get('/api/delivery/logs', (req, res) => {
  const db = getDb();
  res.json({ success: true, logs: db.campaignLogs || [] });
});

app.get('/api/campaigns/:id/logs', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const logs = (db.campaignLogs || []).filter((l) => l.campaignId === id);
  res.json({ success: true, logs });
});

// 6. Templates API
app.get('/api/templates', (req, res) => {
  const db = getDb();
  res.json({ success: true, templates: db.templates || [] });
});

app.post('/api/templates', (req, res) => {
  const db = getDb();
  if (!db.templates) db.templates = [];
  const templateData = req.body;
  const existingIdx = db.templates.findIndex((t) => t.id === templateData.id);
  if (existingIdx >= 0) {
    db.templates[existingIdx] = { ...db.templates[existingIdx], ...templateData };
  } else {
    const newTpl = {
      ...templateData,
      id: templateData.id || `tpl-${Date.now()}`,
      createdAt: templateData.createdAt || new Date().toISOString().split('T')[0],
    };
    db.templates.unshift(newTpl);
  }
  saveDb(db);
  broadcastWsEvent('templates_updated', db.templates);
  res.json({ success: true, templates: db.templates });
});

app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.templates) db.templates = [];
  db.templates = db.templates.filter((t) => t.id !== id);
  saveDb(db);
  broadcastWsEvent('templates_updated', db.templates);
  res.json({ success: true, templates: db.templates });
});

// 7. Contacts API
app.get('/api/contacts', (req, res) => {
  const db = getDb();
  res.json({ success: true, contacts: db.contacts || [] });
});

app.post('/api/contacts', (req, res) => {
  const db = getDb();
  if (!db.contacts) db.contacts = [];
  const body = req.body;

  // Support both single contact and bulk array of contacts
  if (Array.isArray(body)) {
    const newContacts = body.map((c, idx) => ({
      ...c,
      id: c.id || `c-${Date.now()}-${idx}`,
      createdAt: c.createdAt || new Date().toISOString().split('T')[0],
    }));
    db.contacts.unshift(...newContacts);
    saveDb(db);
    broadcastWsEvent('contacts_updated', db.contacts);
    return res.json({ success: true, contacts: db.contacts });
  }

  const newContact = {
    ...body,
    id: body.id || `c-${Date.now()}`,
    createdAt: body.createdAt || new Date().toISOString().split('T')[0],
  };
  db.contacts.unshift(newContact);
  saveDb(db);
  broadcastWsEvent('contacts_updated', db.contacts);
  res.json({ success: true, contact: newContact, contacts: db.contacts });
});

app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.contacts) db.contacts = [];
  db.contacts = db.contacts.filter((c) => c.id !== id);
  saveDb(db);
  broadcastWsEvent('contacts_updated', db.contacts);
  res.json({ success: true, contacts: db.contacts });
});

app.post('/api/contacts/:id/blacklist', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.contacts) db.contacts = [];
  const contact = db.contacts.find((c) => c.id === id);
  if (contact) {
    contact.isBlacklisted = !contact.isBlacklisted;
    saveDb(db);
    broadcastWsEvent('contacts_updated', db.contacts);
  }
  res.json({ success: true, contacts: db.contacts });
});

app.post('/api/upload/media', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, fileName: req.file.originalname, fileUrl });
});

// 8. Chatbot Rules API
app.get('/api/chatbots', (req, res) => {
  const db = getDb();
  res.json({ success: true, chatbotRules: db.chatbotRules || [] });
});

app.get('/api/chatbot/rules', (req, res) => {
  const db = getDb();
  res.json({ success: true, rules: db.chatbotRules || [] });
});

app.post('/api/chatbot/rules', (req, res) => {
  const db = getDb();
  if (!db.chatbotRules) db.chatbotRules = [];
  const ruleData = req.body;
  const existingIdx = db.chatbotRules.findIndex((r) => r.id === ruleData.id);
  if (existingIdx >= 0) {
    db.chatbotRules[existingIdx] = { ...db.chatbotRules[existingIdx], ...ruleData };
  } else {
    const newRule = {
      ...ruleData,
      id: ruleData.id || `rule-${Date.now()}`,
      timesTriggered: 0,
      isActive: true,
    };
    db.chatbotRules.unshift(newRule);
  }
  saveDb(db);
  broadcastWsEvent('chatbots_updated', db.chatbotRules);
  res.json({ success: true, rules: db.chatbotRules });
});

app.delete('/api/chatbot/rules/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.chatbotRules) db.chatbotRules = [];
  db.chatbotRules = db.chatbotRules.filter((r) => r.id !== id);
  saveDb(db);
  broadcastWsEvent('chatbots_updated', db.chatbotRules);
  res.json({ success: true, rules: db.chatbotRules });
});

// 9. Stats API
app.get('/api/stats', (req, res) => {
  const db = getDb();
  res.json({ success: true, stats: db.stats || { totalSent: 0, delivered: 0, failed: 0 } });
});

// 8. Super Admin & Tenants API
app.get('/api/tenants', (req, res) => {
  const db = getDb();
  res.json({ success: true, tenants: db.tenants || [] });
});

app.post('/api/tenants', (req, res) => {
  const { businessName, maxLicenses } = req.body;
  const db = getDb();

  const newTenant = {
    id: `tenant-${Date.now()}`,
    businessName: businessName || 'New Client',
    initials: (businessName || 'NC').substring(0, 2).toUpperCase(),
    activeLicenses: 1,
    maxLicenses: maxLicenses || 10,
    status: 'active',
    features: { multiAccount: true, botBuilder: true, interactiveButtons: true, customBranding: true },
  };

  if (!db.tenants) db.tenants = [];
  db.tenants.unshift(newTenant);
  saveDb(db);
  res.json({ success: true, tenant: newTenant });
});

// 9. White-Label Settings API
app.get('/api/settings', (req, res) => {
  const db = getDb();
  res.json({ success: true, settings: db.settings });
});

app.post('/api/settings', (req, res) => {
  const db = getDb();
  db.settings = { ...db.settings, ...req.body };
  saveDb(db);
  broadcastWsEvent('settings_updated', db.settings);
  res.json({ success: true, settings: db.settings });
});

// 10. Meta WhatsApp Cloud API Webhook & Send Endpoints
app.get('/api/meta/webhook', (req, res) => {
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'whatsapp_bot_verify_token_2026';
  const result = metaCloudApiEngine.verifyWebhook(req.query, verifyToken);
  if (result.status === 200) {
    res.status(200).send(result.challenge);
  } else {
    res.status(result.status).send(result.error);
  }
});

app.post('/api/meta/webhook', async (req, res) => {
  try {
    const event = metaCloudApiEngine.parseWebhookPayload(req.body);
    if (event) {
      if (event.type === 'delivery_status') {
        broadcastWsEvent('meta_delivery_update', event);
      } else if (event.type === 'incoming_message') {
        broadcastWsEvent('new_inbox_message', event);

        // Intelligent Auto-Reply Assistant: Match Chatbot Rules
        try {
          const db = getDb();
          const incomingText = (event.text || '').toLowerCase().trim();
          const matchingRule = (db.chatbotRules || []).find((rule) => {
            if (!rule.isActive) return false;
            return (rule.triggerKeywords || []).some((kw) =>
              incomingText.includes(kw.toLowerCase().trim())
            );
          });

          if (matchingRule) {
            console.log(`[Auto-Reply Assistant] Matched rule "${matchingRule.title}" for incoming text "${event.text}". Dispatching response...`);
            const savedMeta = db.metaConfig || {};
            await metaCloudApiEngine.sendMessage(
              {
                phoneNumberId: savedMeta.phoneNumberId || '1307178355804150',
                accessToken: savedMeta.accessToken,
              },
              event.senderPhone,
              matchingRule.replyText,
              matchingRule.buttons || [],
              matchingRule.mediaPath || matchingRule.mediaUrl || null,
              'image',
              matchingRule.mediaName
            );
            matchingRule.timesTriggered = (matchingRule.timesTriggered || 0) + 1;
            saveDb(db);
          }
        } catch (botErr) {
          console.warn('[Auto-Reply Dispatch Error]:', botErr.message);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('[Meta Webhook Handling Error]:', err);
    res.status(500).send('Webhook Error');
  }
});

app.get('/api/meta/config', (req, res) => {
  const db = getDb();
  res.json({
    success: true,
    metaConfig: db.metaConfig || {
      phoneNumberId: '1307178355804150',
      wabaId: '4567057243541240',
      phoneNumber: '+91 94963 00233',
      accessToken: '',
      isActive: true,
    },
  });
});

app.post('/api/meta/config', (req, res) => {
  const db = getDb();
  db.metaConfig = {
    ...(db.metaConfig || {}),
    ...req.body,
  };
  saveDb(db);
  res.json({ success: true, metaConfig: db.metaConfig });
});

app.post('/api/meta/send', async (req, res) => {
  try {
    const db = getDb();
    const savedMeta = db.metaConfig || {};
    const { phoneNumberId, accessToken, recipientPhone, messageText, buttons, mediaUrl, mediaType, mediaName, templateName, languageCode } = req.body;
    const activePhoneId = (phoneNumberId && phoneNumberId.length > 5) ? phoneNumberId : (savedMeta.phoneNumberId || '1352203304637120');
    const activeToken = (savedMeta.accessToken && savedMeta.accessToken.length > 20)
      ? savedMeta.accessToken
      : ((accessToken && accessToken.length > 20) ? accessToken : process.env.META_ACCESS_TOKEN);

    const effectiveTemplate = (templateName === 'meta_template' || templateName === 'qiyam_promotional_broadcast' || !templateName)
      ? 'qiyam_promotional_broadcast'
      : templateName;

    const result = await metaCloudApiEngine.sendMessage(
      { phoneNumberId: activePhoneId, accessToken: activeToken },
      recipientPhone,
      messageText,
      buttons,
      mediaUrl || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      mediaType || 'image',
      mediaName || 'Special_Offer.png',
      effectiveTemplate,
      languageCode || 'en'
    );
    res.json(result);
  } catch (err) {
    console.error('[Meta Send API Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Direct Chat Send from Unified Inbox
app.post('/api/chat/send', async (req, res) => {
  const { conversationId, recipientPhone, messageText, mediaName } = req.body;

  try {
    const result = await baileysEngine.sendMessage(
      'acc-1',
      recipientPhone,
      messageText,
      [],
      null,
      mediaName
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Enterprise Database Backup, Restore, Auto-Backup & Export API
app.get('/api/backup/health', (req, res) => {
  try {
    const health = backupEngine.getStorageHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backup/create', (req, res) => {
  try {
    const { type, label } = req.body;
    const result = backupEngine.createBackup(type || 'manual', null, label);
    broadcastWsEvent('backup_created', result.backup);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/backup/list', (req, res) => {
  try {
    const backups = backupEngine.listBackups();
    res.json({ success: true, backups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/backup/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../data/backups', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Backup file not found' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/backup/export-active', (req, res) => {
  try {
    const db = getDb();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `whatsq_active_database_${dateStr}.json`;
    const payload = {
      metadata: {
        app: 'WhatsQ WhatsApp Automation Suite',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        type: 'direct_export',
      },
      data: db,
    };
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(payload, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backup/import', (req, res) => {
  try {
    const { fileContent, filename } = req.body;
    if (!fileContent) {
      return res.status(400).json({ success: false, error: 'Missing file content' });
    }
    const result = backupEngine.importBackupFile(fileContent, filename || 'imported_backup.json');
    broadcastWsEvent('backup_imported', result);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/backup/restore', (req, res) => {
  try {
    const { filename, payload } = req.body;
    const result = backupEngine.restoreBackup(filename, payload);
    // Broadcast real-time database restored event so all connected clients reload
    broadcastWsEvent('database_restored', {
      restoredAt: result.restoredAt,
      counts: result.counts,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/backup/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const result = backupEngine.deleteBackup(filename);
    broadcastWsEvent('backup_deleted', { filename });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/backup/config', (req, res) => {
  try {
    res.json({ success: true, config: backupEngine.config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backup/config', (req, res) => {
  try {
    const updated = backupEngine.saveConfig(req.body);
    broadcastWsEvent('backup_config_updated', updated);
    res.json({ success: true, config: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Serve Static Production Frontend Build & SPA Routing
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
  console.log('[Static Server] Serving production frontend build from:', DIST_DIR);
}

// Auto-restore saved sessions on startup & init auto-backup scheduler
baileysEngine.initExistingSessions();
backupEngine.initAutoBackupScheduler();

// Process-level Crash Prevention
process.on('uncaughtException', (err) => {
  console.error('[Server Uncaught Exception Caught]:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('[Server Unhandled Rejection Caught]:', reason);
});

// Start Server
server.listen(PORT, () => {
  console.log(`[WhatsApp Production Server] REST & WS Running at http://localhost:${PORT}`);
});

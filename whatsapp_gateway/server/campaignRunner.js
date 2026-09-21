import PQueue from 'p-queue';
import { getDb, saveDb } from './db.js';
import { baileysEngine } from './baileysEngine.js';
import { metaCloudApiEngine } from './metaCloudApiEngine.js';

export class CampaignRunner {
  constructor() {
    this.queue = new PQueue({ concurrency: 1 });
    this.activeCampaignId = null;
    this.isPaused = false;
  }

  // Spintax parser: resolves {Hello|Hi|Greetings} randomly
  parseSpintax(text) {
    if (!text) return '';
    return text.replace(/\{([^{}]+)\}/g, (match, choices) => {
      const options = choices.split('|');
      return options[Math.floor(Math.random() * options.length)] || '';
    });
  }

  // Personalization variable replacer
  personalizeText(text, contact) {
    if (!text) return '';
    const name = contact?.name || 'Customer';
    const company = contact?.company || 'Business';
    let result = text
      .replace(/\[Name\]|\{\{Name\}\}|\{\{name\}\}/gi, name)
      .replace(/\[Company\]|\{\{Company\}\}|\{\{company\}\}/gi, company)
      .replace(/\[Phone\]|\{\{Phone\}\}|\{\{phone\}\}/gi, contact?.phone || '');
    return this.parseSpintax(result);
  }

  async runCampaign(campaign, onProgress, onComplete) {
    this.activeCampaignId = campaign.id;
    this.isPaused = false;

    const {
      minDelay = 4,
      maxDelay = 8,
      batchSize = 25,
      sleepSeconds = 30,
      accountIds = [],
      template = {},
      targetContacts = [],
    } = campaign;

    const db = getDb();
    const activeAccounts = db.accounts.filter((a) => accountIds.length === 0 || accountIds.includes(a.id));

    // Determine target list
    let recipients = [];
    if (Array.isArray(targetContacts) && targetContacts.length > 0) {
      recipients = targetContacts;
    } else if (db.contacts && db.contacts.length > 0) {
      recipients = db.contacts.filter((c) => !c.isBlacklisted);
    } else {
      recipients = [];
    }

    const total = recipients.length;
    let sent = campaign.sentCount || 0;
    let delivered = campaign.deliveredCount || 0;
    let failed = campaign.failedCount || 0;

    console.log(`[Campaign Runner] Starting campaign "${campaign.name}" with ${total} recipients.`);

    for (let i = sent; i < total; i++) {
      if (this.isPaused) {
        console.log(`[Campaign Runner] Campaign ${campaign.id} paused by operator.`);
        break;
      }

      // Batch sleep cycle check
      if (i > 0 && i % batchSize === 0) {
        console.log(`[Safety Engine] Anti-ban sleep cycle: Pausing for ${sleepSeconds}s`);
        await new Promise((res) => setTimeout(res, sleepSeconds * 1000));
      }

      if (this.isPaused) break;

      // Jitter delay between messages
      const jitterMs = (Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay) * 1000;
      if (i > 0) {
        await new Promise((res) => setTimeout(res, jitterMs));
      }

      if (this.isPaused) break;

      // Round-robin pick active sender account
      const senderAcc = activeAccounts[i % (activeAccounts.length || 1)] || db.accounts[0];
      const recipient = recipients[i];

      // Personalize message content
      const customizedText = this.personalizeText(
        template?.messageText || 'Hello! Welcome to our store.',
        recipient
      );

      console.log(`[Campaign Runner] Sending [${i + 1}/${total}] to ${recipient.phone} (${recipient.name})...`);

      const isMetaSender = Boolean(
        senderAcc?.phoneNumber?.includes('7338944799') ||
        senderAcc?.phoneNumber?.includes('9496300233') ||
        senderAcc?.displayName?.toLowerCase().includes('meta') ||
        senderAcc?.id === 'meta' ||
        senderAcc?.id === 'acc-1787312440050' ||
        !baileysEngine.isSessionConnected(senderAcc?.id)
      );

      let sendResult;
      try {
        if (isMetaSender) {
          const savedMeta = db.metaConfig || {};
          const metaRes = await metaCloudApiEngine.sendMessage(
            {
              phoneNumberId: savedMeta.phoneNumberId || '1352203304637120',
              accessToken: savedMeta.accessToken || process.env.META_ACCESS_TOKEN,
            },
            recipient.phone,
            customizedText,
            template?.buttons || [],
            template?.mediaPath || template?.mediaUrl || null,
            template?.mediaType || 'image',
            template?.mediaName || null,
            template?.metaTemplateName || 'qiyam_promotional_broadcast',
            'en'
          );
          sendResult = {
            success: true,
            status: 'delivered',
            channel: 'meta_cloud_api',
            senderPhone: savedMeta.phoneNumber || '+917338944799',
            messageId: metaRes?.messageId || `meta-${Date.now()}`,
          };
        } else {
          sendResult = await baileysEngine.sendMessage(
            senderAcc?.id || 'acc-1',
            recipient.phone,
            customizedText,
            template?.buttons || [],
            template?.mediaPath || template?.mediaUrl || null,
            template?.mediaName || null,
            template?.mediaType || 'image'
          );
        }

        if (sendResult?.success) {
          sent++;
          delivered++;
        } else {
          sent++;
          failed++;
        }
      } catch (err) {
        console.error(`[Campaign Runner] Dispatch error for ${recipient.phone}:`, err.message);
        failed++;
        sent++;
        sendResult = { success: false, error: err.message, status: 'failed', channel: isMetaSender ? 'meta_cloud_api' : 'baileys_socket' };
      }

      // Create delivery log record
      const newLog = {
        id: `log-${Date.now()}-${i}`,
        campaignId: campaign.id,
        recipientPhone: recipient.phone,
        recipientName: recipient.name,
        senderPhone: sendResult?.senderPhone || senderAcc?.phoneNumber || 'Connected Device',
        status: sendResult?.status || (sendResult?.success ? 'delivered' : 'failed'),
        channel: sendResult?.channel || 'baileys_socket',
        error: sendResult?.error || null,
        messageId: sendResult?.messageId || null,
        latency: `${(jitterMs / 1000).toFixed(1)}s`,
        timestamp: new Date().toISOString(),
      };

      const currentDb = getDb();
      if (!currentDb.campaignLogs) currentDb.campaignLogs = [];
      currentDb.campaignLogs.unshift(newLog);

      // Update aggregate stats
      currentDb.stats.totalSent += 1;
      if (sendResult?.success) {
        currentDb.stats.delivered += 1;
      } else {
        currentDb.stats.failed += 1;
      }

      // Update account sent count
      if (senderAcc) {
        const accTarget = currentDb.accounts.find((a) => a.id === senderAcc.id);
        if (accTarget) accTarget.sentToday += 1;
      }

      saveDb(currentDb);

      if (onProgress) {
        onProgress({
          sent,
          delivered,
          failed,
          totalContacts: total,
          currentLog: newLog,
        });
      }
    }

    if (sent >= total) {
      this.activeCampaignId = null;
      console.log(`[Campaign Runner] Campaign "${campaign.name}" completed successfully! Total: ${sent}`);
      if (onComplete) {
        onComplete({ sent, delivered, failed, status: 'completed' });
      }
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume(campaign, onProgress, onComplete) {
    this.isPaused = false;
    this.runCampaign(campaign, onProgress, onComplete);
  }

  stop() {
    this.isPaused = true;
    this.activeCampaignId = null;
  }
}

export const campaignRunner = new CampaignRunner();

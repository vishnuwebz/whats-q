import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import pino from 'pino';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { metaCloudApiEngine } from './metaCloudApiEngine.js';
import { getDb, saveDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_DIR = path.join(__dirname, '../data/sessions');

if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

let cachedBaileysVersion = [2, 3000, 1015901307];
try {
  fetchLatestBaileysVersion()
    .then((v) => {
      if (v?.version) cachedBaileysVersion = v.version;
    })
    .catch(() => {});
} catch {}

export function normalizeWhatsAppNumber(rawPhone, defaultCountryCode = '91') {
  if (!rawPhone) return '';
  let clean = String(rawPhone).replace(/[^\d]/g, '');
  clean = clean.replace(/^0+/, ''); // remove leading zeros
  // If 10 digits (Standard Indian Mobile starting with 6, 7, 8, 9), prepend default country code (91)
  if (clean.length === 10 && /^[6-9]/.test(clean)) {
    clean = defaultCountryCode + clean;
  }
  return clean;
}

export function resolveCountryFromPhone(cleanDigits) {
  if (!cleanDigits) return { country: 'Global', flag: '🌐', formatted: '' };

  if (cleanDigits.startsWith('91')) {
    const formatted = cleanDigits.length === 12
      ? `+91 ${cleanDigits.slice(2, 7)} ${cleanDigits.slice(7)}`
      : `+${cleanDigits}`;
    return { country: 'India', flag: '🇮🇳', formatted };
  }
  if (cleanDigits.startsWith('1')) {
    const formatted = cleanDigits.length === 11
      ? `+1 (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7)}`
      : `+${cleanDigits}`;
    return { country: 'USA/Canada', flag: '🇺🇸', formatted };
  }
  if (cleanDigits.startsWith('44')) return { country: 'United Kingdom', flag: '🇬🇧', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('971')) return { country: 'UAE', flag: '🇦🇪', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('966')) return { country: 'Saudi Arabia', flag: '🇸🇦', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('968')) return { country: 'Oman', flag: '🇴🇲', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('974')) return { country: 'Qatar', flag: '🇶🇦', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('965')) return { country: 'Kuwait', flag: '🇰🇼', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('973')) return { country: 'Bahrain', flag: '🇧🇭', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('60')) return { country: 'Malaysia', flag: '🇲🇾', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('65')) return { country: 'Singapore', flag: '🇸🇬', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('61')) return { country: 'Australia', flag: '🇦🇺', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('49')) return { country: 'Germany', flag: '🇩🇪', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('33')) return { country: 'France', flag: '🇫🇷', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('39')) return { country: 'Italy', flag: '🇮🇹', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('34')) return { country: 'Spain', flag: '🇪🇸', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('92')) return { country: 'Pakistan', flag: '🇵🇰', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('880')) return { country: 'Bangladesh', flag: '🇧🇩', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('94')) return { country: 'Sri Lanka', flag: '🇱🇰', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('977')) return { country: 'Nepal', flag: '🇳🇵', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('86')) return { country: 'China', flag: '🇨🇳', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('81')) return { country: 'Japan', flag: '🇯🇵', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('82')) return { country: 'South Korea', flag: '🇰🇷', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('62')) return { country: 'Indonesia', flag: '🇮🇩', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('55')) return { country: 'Brazil', flag: '🇧🇷', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('27')) return { country: 'South Africa', flag: '🇿🇦', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('234')) return { country: 'Nigeria', flag: '🇳🇬', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('254')) return { country: 'Kenya', flag: '🇰🇪', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('20')) return { country: 'Egypt', flag: '🇪🇬', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('90')) return { country: 'Turkey', flag: '🇹🇷', formatted: `+${cleanDigits}` };
  if (cleanDigits.startsWith('7')) return { country: 'Russia/Kazakhstan', flag: '🇷🇺', formatted: `+${cleanDigits}` };

  return { country: 'International', flag: '🌐', formatted: `+${cleanDigits}` };
}

export function parseParticipantMember(p, contactsMap, myJid, sock) {
  const rawId = p.id || '';
  const isLid = Boolean(p.lid || rawId.endsWith('@lid'));
  const lid = p.lid || (rawId.endsWith('@lid') ? rawId : null);

  let cleanPhone = '';
  let whatsappJid = '';
  let contactName = p.notify || p.name || '';

  // 1. Direct phone number extracted by patched Baileys Socket
  if (p.phoneNumber && /^\d{7,15}$/.test(p.phoneNumber)) {
    cleanPhone = p.phoneNumber;
  }

  // 2. p.jid is an explicit @s.whatsapp.net phone JID
  if (!cleanPhone && p.jid && p.jid.includes('@s.whatsapp.net')) {
    cleanPhone = p.jid.split('@')[0].split(':')[0].replace(/[^\d]/g, '');
  }

  // 3. rawId itself is a phone JID (NOT @lid)
  if (!cleanPhone && rawId && rawId.includes('@s.whatsapp.net')) {
    cleanPhone = rawId.split('@')[0].split(':')[0].replace(/[^\d]/g, '');
  }

  // 4. Look up in synced WhatsApp contacts by LID or ID
  if (!cleanPhone && lid && contactsMap) {
    const cached = contactsMap.get(lid);
    if (cached) {
      if (cached.phone) cleanPhone = cached.phone;
      if (cached.name && !contactName) contactName = cached.name;
    }
  }

  // 5. Look up in Baileys signalRepository lidMapping if available
  if (!cleanPhone && lid && sock?.signalRepository?.lidMapping?.getPNForLID) {
    try {
      const mapped = sock.signalRepository.lidMapping.getPNForLID(lid);
      if (mapped) {
        cleanPhone = mapped.split('@')[0].replace(/[^\d]/g, '');
      }
    } catch (e) {}
  }

  // 6. Check raw attributes if WhatsApp returned pn/phone_number in attrs
  if (!cleanPhone && p.attrs) {
    const attrPn = p.attrs.phone_number || p.attrs.pn || p.attrs.participant_pn;
    if (attrPn) {
      cleanPhone = String(attrPn).split('@')[0].split(':')[0].replace(/[^\d]/g, '');
    }
  }

  const role = (p.admin === 'admin' || p.admin === 'superadmin') ? 'admin' : 'member';
  const isAdmin = Boolean(p.admin);

  // If a valid phone number (>= 8 digits) was found, return genuine mobile phone member!
  if (cleanPhone && cleanPhone.length >= 8) {
    whatsappJid = `${cleanPhone}@s.whatsapp.net`;
    const { country, flag, formatted } = resolveCountryFromPhone(cleanPhone);
    const displayName = contactName && contactName !== cleanPhone ? contactName : formatted;

    return {
      id: whatsappJid,
      whatsappId: whatsappJid,
      phone: formatted,
      cleanPhone,
      name: displayName,
      role,
      country: `${flag} ${country}`,
      isAdmin,
      isValidWhatsApp: true,
      isProtected: false,
      statusMessage: 'Verified Mobile Phone',
      joinedAt: 'Active',
    };
  }

  // WhatsApp Community Privacy Mode: member phone number is masked by Meta
  const lidShort = (lid || rawId).split('@')[0].slice(-6);
  const protectedPhone = `Protected (${lidShort})`;
  const protectedJid = lid || rawId || `user_${lidShort}@lid`;
  const displayName = contactName || `Community Member ${lidShort}`;

  return {
    id: protectedJid,
    whatsappId: protectedJid,
    phone: protectedPhone,
    cleanPhone: '',
    name: displayName,
    role,
    country: '🛡️ Community Protected',
    isAdmin,
    isValidWhatsApp: true,
    isProtected: true,
    statusMessage: 'Phone Protected by Meta Community Privacy',
    joinedAt: 'Active',
  };
}

export class BaileysEngine {
  constructor() {
    this.sessions = new Map(); // accountId -> { sock, qrCode, qrRaw, status, phoneNumber, displayName, contacts }
    this.eventListeners = new Set();
  }

  loadContactsCache(accountId) {
    const contactsMap = new Map();
    try {
      const cachePath = path.join(SESSIONS_DIR, accountId, 'contacts_cache.json');
      if (fs.existsSync(cachePath)) {
        const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item.lid) contactsMap.set(item.lid, item);
            if (item.id) contactsMap.set(item.id, item);
            if (item.phone) contactsMap.set(item.phone, item);
          }
        }
      }
    } catch (e) {
      console.warn(`[Baileys Engine] Note loading contacts cache for ${accountId}:`, e.message);
    }
    return contactsMap;
  }

  saveContactsCache(accountId, contactsMap) {
    try {
      const cachePath = path.join(SESSIONS_DIR, accountId, 'contacts_cache.json');
      const data = Array.from(contactsMap.values());
      const unique = Array.from(new Map(data.map((item) => [item.id || item.lid, item])).values());
      fs.writeFileSync(cachePath, JSON.stringify(unique, null, 2), 'utf8');
    } catch (e) {
      console.warn(`[Baileys Engine] Note saving contacts cache for ${accountId}:`, e.message);
    }
  }

  // Register listener for real-time socket events
  onEvent(listener) {
    this.eventListeners.add(listener);
  }

  isSessionConnected(accountId) {
    const session = this.sessions.get(accountId);
    return Boolean(session && session.sock && session.status === 'online');
  }

  getSessionStatus(accountId) {
    const session = this.sessions.get(accountId);
    if (!session) return null;
    return {
      status: session.status || 'disconnected',
      qrCode: session.qrCode || null,
      phoneNumber: session.phoneNumber || '',
      displayName: session.displayName || '',
      startedAt: session.startedAt,
    };
  }

  emitEvent(type, payload) {
    for (const listener of this.eventListeners) {
      try {
        listener(type, payload);
      } catch (err) {
        console.error('[Baileys Engine] Event listener error:', err);
      }
    }
  }

  async initExistingSessions() {
    try {
      if (!fs.existsSync(SESSIONS_DIR)) return;
      const entries = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const accountId = entry.name;
          const credsFile = path.join(SESSIONS_DIR, accountId, 'creds.json');
          if (fs.existsSync(credsFile)) {
            console.log(`[Baileys Engine] Auto-restoring existing session: ${accountId}`);
            this.startSession(accountId).catch((err) => {
              console.warn(`[Baileys Engine] Could not restore session ${accountId}:`, err.message);
            });
          }
        }
      }
    } catch (e) {
      console.warn('[Baileys Engine] Error restoring sessions:', e);
    }
  }

  async startSession(accountId, phoneNumber = '', displayName = '') {
    try {
      const existing = this.sessions.get(accountId);
      if (existing && existing.sock && existing.status === 'online') {
        return {
          success: true,
          accountId,
          status: 'online',
          phoneNumber: existing.phoneNumber,
          displayName: existing.displayName,
          qrCode: null,
        };
      }
      if (existing && existing.sock) {
        try {
          existing.sock.ev.removeAllListeners();
          existing.sock.end(undefined);
        } catch {}
      }

      console.log(`[Baileys Engine] Initializing WhatsApp session for: ${accountId} (${phoneNumber || 'Auto'})`);

      const sessionPath = path.join(SESSIONS_DIR, accountId);
      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const version = cachedBaileysVersion;

      const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['WhatsQ', 'Chrome', '122.0.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
      });

      const contactsCache = this.loadContactsCache(accountId);

      const sessionMeta = {
        id: accountId,
        sock,
        phoneNumber: phoneNumber || '',
        displayName: displayName || 'WhatsApp Line',
        status: 'connecting',
        qrCode: null,
        qrRaw: null,
        startedAt: new Date().toISOString(),
        contacts: contactsCache,
      };

      this.sessions.set(accountId, sessionMeta);

      sock.ev.on('creds.update', saveCreds);

      // Cache synced contacts from WhatsApp address book
      sock.ev.on('contacts.upsert', (contacts) => {
        console.log(`[Baileys Engine] 📇 Synced ${contacts.length} contacts from WhatsApp for ${accountId}`);
        for (const c of contacts) {
          const rawId = c.id || '';
          const phone = rawId.includes('@s.whatsapp.net') ? rawId.split('@')[0].split(':')[0].replace(/[^\d]/g, '') : '';
          const name = c.name || c.notify || '';
          const entry = { id: rawId, phone, name, lid: c.lid };
          if (c.lid) sessionMeta.contacts.set(c.lid, entry);
          if (rawId) sessionMeta.contacts.set(rawId, entry);
          if (phone) sessionMeta.contacts.set(phone, entry);
        }
        this.saveContactsCache(accountId, sessionMeta.contacts);
      });

      sock.ev.on('contacts.update', (updates) => {
        for (const u of updates) {
          const existing = sessionMeta.contacts.get(u.id) || {};
          const merged = { ...existing, ...u };
          sessionMeta.contacts.set(u.id, merged);
          if (merged.lid) sessionMeta.contacts.set(merged.lid, merged);
        }
        this.saveContactsCache(accountId, sessionMeta.contacts);
      });

      sock.ev.on('chats.upsert', (chats) => {
        for (const ch of chats) {
          if (ch.id && ch.name) {
            const rawId = ch.id;
            const phone = rawId.includes('@s.whatsapp.net') ? rawId.split('@')[0].split(':')[0].replace(/[^\d]/g, '') : '';
            sessionMeta.contacts.set(rawId, { id: rawId, phone, name: ch.name });
            if (phone) sessionMeta.contacts.set(phone, { id: rawId, phone, name: ch.name });
          }
        }
      });

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            const qrDataUrl = await QRCode.toDataURL(qr, {
              width: 280,
              margin: 1,
              color: { dark: '#006b53', light: '#ffffff' },
            });
            sessionMeta.qrCode = qrDataUrl;
            sessionMeta.qrRaw = qr;
            sessionMeta.status = 'pairing';

            console.log(`[Baileys Engine] QR Generated for ${accountId}. Waiting for phone scan...`);

            this.emitEvent('session_qr', {
              accountId,
              qrCode: qrDataUrl,
              qrRaw: qr,
              phoneNumber: sessionMeta.phoneNumber,
              displayName: sessionMeta.displayName,
            });
          } catch (qrErr) {
            console.error('[Baileys Engine] Error generating QR data URL:', qrErr);
          }
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const isLoggedOut =
            statusCode === DisconnectReason.loggedOut ||
            statusCode === 401 ||
            String(lastDisconnect?.error?.message).toLowerCase().includes('logged out') ||
            String(lastDisconnect?.error).toLowerCase().includes('logged out');
          const shouldReconnect = !isLoggedOut && statusCode !== DisconnectReason.loggedOut;

          console.log(`[Baileys Engine] Connection closed for ${accountId}. Reason code: ${statusCode}. isLoggedOut: ${isLoggedOut}. Reconnecting: ${shouldReconnect}`);

          sessionMeta.status = shouldReconnect ? 'connecting' : 'disconnected';
          sessionMeta.qrCode = null;
          sessionMeta.qrRaw = null;

          if (!shouldReconnect) {
            // Phone explicitly logged out from device or unlinked
            try {
              const db = getDb();
              const acc = db.accounts.find((a) => a.id === accountId);
              if (acc) {
                acc.status = 'disconnected';
                saveDb(db);
              }
            } catch (dbErr) {
              console.warn('[Baileys Engine] Error updating db on disconnect:', dbErr.message);
            }

            // Remove auth credentials from disk so clean state is preserved
            try {
              const sessionPath = path.join(SESSIONS_DIR, accountId);
              if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                console.log(`[Baileys Engine] Removed invalidated session credentials for ${accountId}`);
              }
            } catch (rmErr) {
              console.warn('[Baileys Engine] Error removing session credentials:', rmErr.message);
            }

            this.sessions.delete(accountId);

            this.emitEvent('session_disconnected', {
              accountId,
              statusCode,
              isLoggedOut: true,
              shouldReconnect: false,
              status: 'disconnected',
            });
          } else {
            console.log(`[Baileys Engine] Session ${accountId} restarting stream / reconnecting (Reason ${statusCode}). NOT a logout.`);
            this.emitEvent('session_reconnecting', {
              accountId,
              statusCode,
              isLoggedOut: false,
              shouldReconnect: true,
              status: 'connecting',
            });

            // Fast reconnect for reason 515 (stream restart required after QR scan)
            const delay = (statusCode === DisconnectReason.restartRequired || statusCode === 515) ? 400 : 2500;
            setTimeout(() => {
              this.startSession(accountId, sessionMeta.phoneNumber, sessionMeta.displayName);
            }, delay);
          }
        } else if (connection === 'open') {
          console.log(`[Baileys Engine] 🎉 WhatsApp Web CONNECTED for ${accountId}! User phone is ready.`);
          sessionMeta.status = 'online';
          sessionMeta.qrCode = null;
          sessionMeta.qrRaw = null;

          const userJid = sock.user?.id || '';
          if (userJid) {
            const detectedPhone = '+' + userJid.split(':')[0].replace(/[^\d]/g, '');
            sessionMeta.phoneNumber = detectedPhone;
          }

          // Update database store with real online state and detected phone
          try {
            const db = getDb();
            const existingAcc = db.accounts.find((a) => a.id === accountId);
            if (existingAcc) {
              existingAcc.status = 'online';
              if (sessionMeta.phoneNumber) existingAcc.phoneNumber = sessionMeta.phoneNumber;
              saveDb(db);
            } else {
              db.accounts.push({
                id: accountId,
                phoneNumber: sessionMeta.phoneNumber,
                displayName: sessionMeta.displayName || 'WhatsApp Line',
                status: 'online',
                dailyLimit: 2500,
                sentToday: 0,
                createdAt: new Date().toISOString(),
                warmupScore: 95,
              });
              saveDb(db);
            }
          } catch (dbErr) {
            console.warn('[Baileys Engine] Error updating db on open:', dbErr);
          }

          this.emitEvent('session_ready', {
            accountId,
            phoneNumber: sessionMeta.phoneNumber,
            displayName: sessionMeta.displayName,
            status: 'online',
          });

          // Immediately sync linked device to Django backend
          const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
          fetch(`${backendUrl}/api/conversations/linked-devices/pair_session/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: accountId,
              phone: sessionMeta.phoneNumber,
              device_label: sessionMeta.displayName || 'Employee WhatsApp Line',
              employee_name: sessionMeta.displayName || 'Employee Line',
            }),
          }).catch((syncErr) => {
            console.warn('[Baileys Engine] Notice syncing linked device to Django:', syncErr.message);
          });
        }
      });

      // Handle incoming & outgoing messages on linked companion socket
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        for (const msg of messages) {
          if (!msg.message) continue;
          const remoteJid = msg.key.remoteJid || '';
          if (!remoteJid || remoteJid === 'status@broadcast' || remoteJid.endsWith('@broadcast')) continue;

          // If group message, skip for 1-on-1 customer chat
          if (remoteJid.endsWith('@g.us')) continue;

          const isFromMe = Boolean(msg.key.fromMe);

          // 1. Resolve Employee Phone & Name from sessionMeta / db.accounts / sock credentials
          let employeePhone = sessionMeta.phoneNumber || '';
          let employeeName = sessionMeta.displayName || '';

          if (!employeePhone || !employeeName || employeeName === 'WhatsApp Line') {
            try {
              const db = getDb();
              const acc = (db.accounts || []).find((a) => a.id === accountId);
              if (acc) {
                if (!employeePhone && acc.phoneNumber) employeePhone = acc.phoneNumber;
                if (!employeeName && acc.displayName) employeeName = acc.displayName;
              }
            } catch {}
          }
          if (!employeePhone) {
            const userJid = sock.user?.id || sock.authState?.creds?.me?.id || '';
            if (userJid) {
              const dPhone = userJid.split('@')[0].split(':')[0].replace(/[^\d]/g, '');
              if (dPhone) employeePhone = '+' + dPhone;
            }
          }
          if (!employeeName || employeeName === 'WhatsApp Line') {
            employeeName = sessionMeta.displayName || 'Employee Line';
          }
          sessionMeta.phoneNumber = employeePhone;
          sessionMeta.displayName = employeeName;

          // 2. Resolve Customer Phone Number (handling WhatsApp @lid privacy IDs, remoteJidAlt, senderPn, participantPn)
          let customerJid = remoteJid;
          let customerLid = remoteJid.endsWith('@lid') ? remoteJid : (msg.key.senderLid || '');

          const rawPnCandidate = msg.key.senderPn || msg.key.participantPn || msg.key.remoteJidAlt || msg.key.cleanedParticipant || '';
          const cleanedPn = String(rawPnCandidate).replace(/\D/g, '');
          if (cleanedPn && cleanedPn.length >= 7) {
            customerJid = `${cleanedPn}@s.whatsapp.net`;
            if (customerLid) {
              sessionMeta.contacts.set(customerLid, {
                id: customerJid,
                phone: cleanedPn,
                lid: customerLid,
              });
              this.saveContactsCache(accountId, sessionMeta.contacts);
            }
          } else if (customerJid.endsWith('@lid')) {
            // Check contacts cache
            if (sessionMeta.contacts.has(customerJid)) {
              const cached = sessionMeta.contacts.get(customerJid);
              if (cached?.phone) {
                customerJid = `${cached.phone}@s.whatsapp.net`;
              } else if (cached?.id && cached.id.endsWith('@s.whatsapp.net')) {
                customerJid = cached.id;
              }
            } else {
              // Iterate all entries in contacts cache
              for (const entry of sessionMeta.contacts.values()) {
                if (entry.lid === customerJid && entry.phone) {
                  customerJid = `${entry.phone}@s.whatsapp.net`;
                  break;
                }
              }
            }
          }

          let rawCustomer = customerJid.split('@')[0].split(':')[0].replace(/[^\d]/g, '');
          if (!rawCustomer || rawCustomer.length < 7) {
            const fallbackNum = remoteJid.split('@')[0].split(':')[0].replace(/[^\d]/g, '');
            if (fallbackNum && fallbackNum.length >= 7) {
              rawCustomer = fallbackNum;
            } else {
              continue;
            }
          }
          const customerPhone = '+' + rawCustomer;

          // Cache in contacts map
          if (customerJid.endsWith('@s.whatsapp.net')) {
            sessionMeta.contacts.set(rawCustomer, { id: customerJid, phone: rawCustomer });
            if (customerLid) {
              sessionMeta.contacts.set(customerLid, { id: customerJid, phone: rawCustomer, lid: customerLid });
            }
          }

          // 3. Unwrap nested message wrappers (ephemeral, viewOnce, caption)
          let innerMsg = msg.message;
          while (
            innerMsg?.ephemeralMessage?.message ||
            innerMsg?.viewOnceMessage?.message ||
            innerMsg?.viewOnceMessageV2?.message ||
            innerMsg?.documentWithCaptionMessage?.message
          ) {
            innerMsg =
              innerMsg.ephemeralMessage?.message ||
              innerMsg.viewOnceMessage?.message ||
              innerMsg.viewOnceMessageV2?.message ||
              innerMsg.documentWithCaptionMessage?.message;
          }

          const text =
            innerMsg.conversation ||
            innerMsg.extendedTextMessage?.text ||
            innerMsg.imageMessage?.caption ||
            innerMsg.videoMessage?.caption ||
            innerMsg.documentMessage?.title ||
            innerMsg.documentMessage?.fileName ||
            innerMsg.buttonsResponseMessage?.selectedDisplayText ||
            innerMsg.templateButtonReplyMessage?.selectedDisplayText ||
            innerMsg.listResponseMessage?.title ||
            (innerMsg.audioMessage ? '🎙️ Voice note' : '') ||
            (innerMsg.imageMessage ? '📷 Photo' : '') ||
            (innerMsg.videoMessage ? '🎥 Video' : '') ||
            (innerMsg.documentMessage ? '📄 Document' : '') ||
            (innerMsg.locationMessage ? '📍 Location' : '') ||
            '';

          const msgType = innerMsg.audioMessage
            ? 'audio'
            : innerMsg.imageMessage
            ? 'image'
            : innerMsg.videoMessage
            ? 'video'
            : innerMsg.documentMessage
            ? 'document'
            : 'text';

          console.log(`[Baileys Engine] ${isFromMe ? '📤 Outbound (from mobile phone)' : '📩 Inbound (customer reply)'}: Customer ${customerPhone} <-> Employee ${employeeName} (${employeePhone}): "${text}"`);

          const incomingPayload = {
            accountId,
            senderPhone: isFromMe ? employeePhone : customerPhone,
            recipientPhone: isFromMe ? customerPhone : employeePhone,
            text,
            messageType: msgType,
            employeePhone,
            employeeName,
            deviceLabel: employeeName,
            fromMe: isFromMe,
            timestamp: new Date().toISOString(),
          };

          this.emitEvent(isFromMe ? 'outbound_message' : 'incoming_message', incomingPayload);

          // 4. Forward message to Django backend webhook
          const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
          try {
            fetch(`${backendUrl}/api/conversations/webhook/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Internal-Gateway': 'baileys',
                'X-Gateway-Account': accountId,
              },
              body: JSON.stringify({
                entry: [{
                  changes: [{
                    field: 'messages',
                    value: {
                      messaging_product: 'whatsapp',
                      from_me: isFromMe,
                      customer_phone: customerPhone,
                      customer_jid: customerJid,
                      customer_lid: customerLid,
                      employee_phone: employeePhone,
                      employee_name: employeeName,
                      metadata: {
                        display_phone_number: employeePhone ? employeePhone.replace(/[^\d]/g, '') : '',
                        phone_number_id: accountId,
                        line_type: 'employee',
                      },
                      recipient_line: {
                        phone_number: employeePhone,
                        customer_phone: customerPhone,
                        customer_jid: customerJid,
                        customer_lid: customerLid,
                        device_label: employeeName,
                        employee_name: employeeName,
                        account_id: accountId,
                        line_type: 'employee',
                      },
                      messages: [{
                        from: isFromMe ? (employeePhone.replace(/[^\d]/g, '') || accountId) : rawCustomer,
                        to: isFromMe ? rawCustomer : (employeePhone.replace(/[^\d]/g, '') || ''),
                        id: msg.key.id || `baileys-${Date.now()}`,
                        type: msgType,
                        text: { body: text },
                        from_me: isFromMe,
                        customer_phone: customerPhone,
                        customer_jid: customerJid,
                        customer_lid: customerLid,
                        timestamp: String(Math.floor(Date.now() / 1000)),
                      }],
                      contacts: [{
                        profile: { name: isFromMe ? employeeName : (msg.pushName || sessionMeta.contacts.get(customerJid)?.name || customerPhone) },
                        wa_id: isFromMe ? (employeePhone.replace(/[^\d]/g, '') || accountId) : rawCustomer,
                      }],
                    },
                  }],
                }],
              }),
            }).then(async (res) => {
              if (!res.ok) {
                const errText = await res.text().catch(() => '');
                console.warn(`[Baileys Engine] Django webhook error HTTP ${res.status}:`, errText);
              } else {
                console.log(`[Baileys Engine] ✅ Message synced to Django: ${isFromMe ? 'Employee Outbound' : 'Customer Inbound'} (${customerPhone}) on line [${employeeName}]`);
              }
            }).catch((err) => {
              console.warn('[Baileys Engine] Failed to dispatch message to Django:', err.message);
            });
          } catch (e) {
            console.warn('[Baileys Engine] Webhook dispatch exception:', e.message);
          }
        }
      });

      // Real-time WhatsApp Client Presence & Typing Updates
      sock.ev.on('presence.update', async ({ id, presences }) => {
        try {
          if (!id) return;
          const cleanId = id.split('@')[0].split(':')[0].replace(/[^\d]/g, '');
          if (!cleanId) return;
          const senderPhone = '+' + cleanId;
          let isTyping = false;
          let state = 'available';

          if (presences) {
            for (const [pKey, pVal] of Object.entries(presences)) {
              const pState = pVal?.lastKnownPresence;
              if (pState === 'composing' || pState === 'recording') {
                isTyping = true;
                state = pState;
                break;
              }
            }
          }

          this.emitEvent('presence_update', {
            accountId,
            phone: senderPhone,
            isTyping,
            state,
          });

          // Forward to Django backend webhook
          const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
          fetch(`${backendUrl}/api/conversations/webhook/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Gateway': 'baileys',
              'X-Gateway-Account': accountId,
            },
            body: JSON.stringify({
              event: 'presence.update',
              phone: senderPhone,
              is_typing: isTyping,
              state,
            }),
          }).catch(() => {});
        } catch (err) {
          console.warn('[Baileys Engine] Error handling presence.update:', err);
        }
      });

      // Real-time WhatsApp Message Status Receipts (Delivery & Read receipts)
      sock.ev.on('messages.update', async (updates) => {
        try {
          if (!Array.isArray(updates)) return;
          for (const u of updates) {
            const statusNum = u.update?.status;
            let mappedStatus = null;
            if (statusNum === 4 || statusNum === 5) {
              mappedStatus = 'read';
            } else if (statusNum === 3) {
              mappedStatus = 'delivered';
            } else if (statusNum === 2) {
              mappedStatus = 'sent';
            }

            if (mappedStatus && u.key?.id) {
              this.emitEvent('message_status_update', {
                accountId,
                messageId: u.key.id,
                status: mappedStatus,
              });

              // Forward to Django webhook
              const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
              fetch(`${backendUrl}/api/conversations/webhook/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Internal-Gateway': 'baileys',
                  'X-Gateway-Account': accountId,
                },
                body: JSON.stringify({
                  event: 'messages.update',
                  status_id: u.key.id,
                  status: mappedStatus,
                }),
              }).catch(() => {});
            }
          }
        } catch (err) {
          console.warn('[Baileys Engine] Error handling messages.update:', err);
        }
      });

      // Ultra-fast wait for initial QR code (up to 2500ms) so caller gets QR in the initial response!
      let qrCode = sessionMeta.qrCode;
      if (!qrCode) {
        qrCode = await new Promise((resolve) => {
          let resolved = false;
          let listener = null;
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              if (listener) this.eventListeners.delete(listener);
              resolve(sessionMeta.qrCode || null);
            }
          }, 2500);
          listener = (type, payload) => {
            if (!resolved && type === 'session_qr' && payload.accountId === accountId && payload.qrCode) {
              resolved = true;
              clearTimeout(timeout);
              this.eventListeners.delete(listener);
              resolve(payload.qrCode);
            }
          };
          this.eventListeners.add(listener);
        });
      }

      return {
        success: true,
        accountId,
        status: sessionMeta.status || 'pairing',
        qrCode: qrCode || sessionMeta.qrCode || null,
      };
    } catch (err) {
      console.error(`[Baileys Engine] Error starting session ${accountId}:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Universal message dispatcher:
   * 1. If real Baileys socket is connected and open -> sends via Baileys Web socket.
   * 2. If Meta Cloud API is configured -> sends via Meta Graph API.
   * 3. If in test/development mode with no active socket -> logs delivery clearly and returns detailed payload.
   */
  async sendMessage(accountId, recipientPhone, text, buttons = [], mediaUrl = null, mediaName = null, mediaType = 'image', senderPhone = null) {
    const normalizedPhone = normalizeWhatsAppNumber(recipientPhone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      throw new Error(`Invalid recipient phone number: "${recipientPhone}". Please enter a valid 10-digit mobile number.`);
    }

    console.log(`[Baileys Engine] Dispatching WhatsApp message to +${normalizedPhone} (raw: "${recipientPhone}")... Requested Account: ${accountId}, SenderPhone: ${senderPhone || 'None'}`);

    // 1. Try to find session by exact accountId
    let targetSession = this.sessions.get(accountId);

    // 2. If targetSession is not found by ID, look for session matching senderPhone or account's phone number
    if (!targetSession || targetSession.status !== 'online') {
      const allOnlineSessions = Array.from(this.sessions.values()).filter((s) => s.status === 'online' && s.sock);
      
      // Check senderPhone first if passed
      if (senderPhone) {
        const cleanSender = String(senderPhone).replace(/\D/g, '');
        if (cleanSender.length >= 7) {
          const matchBySenderPhone = allOnlineSessions.find(
            (s) => s.phoneNumber && s.phoneNumber.replace(/\D/g, '').endsWith(cleanSender.slice(-10))
          );
          if (matchBySenderPhone) targetSession = matchBySenderPhone;
        }
      }

      if (!targetSession && accountId && accountId !== 'auto' && accountId !== 'all') {
        // Look for session with matching phone digits
        const cleanReq = String(accountId).replace(/\D/g, '');
        const matchingPhoneSession = allOnlineSessions.find(
          (s) => s.phoneNumber && s.phoneNumber.replace(/\D/g, '').endsWith(cleanReq.slice(-10))
        );

        if (matchingPhoneSession) {
          targetSession = matchingPhoneSession;
        } else if (allOnlineSessions.length === 0) {
          throw new Error(`WhatsApp sender phone line is not connected. Please go to Connected Phones and scan the QR code to link your phone before sending.`);
        } else {
          // The user specifically selected a phone that is offline
          const requestedAcc = getDb().accounts.find((a) => a.id === accountId);
          const requestedLabel = requestedAcc ? `${requestedAcc.phoneNumber || requestedAcc.displayName}` : accountId;
          throw new Error(`Selected sender phone "${requestedLabel}" is disconnected (needs QR scan). Please scan its QR code on Connected Phones or select an active online line.`);
        }
      } else if (!targetSession && allOnlineSessions.length > 0) {
        targetSession = allOnlineSessions[0];
      } else if (!targetSession) {
        throw new Error(`No active WhatsApp sender phone is connected. Please scan QR Code on Connected Phones.`);
      }
    }

    // If an online Baileys session is active -> dispatch directly via WhatsApp Web socket
    if (targetSession && targetSession.sock && targetSession.status === 'online') {
      try {
        let jid = `${normalizedPhone}@s.whatsapp.net`;

        // Check if on WhatsApp and obtain canonical JID
        try {
          const results = await targetSession.sock.onWhatsApp(jid);
          if (Array.isArray(results) && results.length > 0 && results[0]?.exists && results[0]?.jid) {
            jid = results[0].jid;
            console.log(`[Baileys Engine] Verified WhatsApp recipient JID: ${jid}`);
            if (targetSession.contacts) {
              const entry = { id: jid, phone: normalizedPhone, lid: results[0].lid || null };
              targetSession.contacts.set(normalizedPhone, entry);
              targetSession.contacts.set(jid, entry);
              if (results[0].lid) {
                targetSession.contacts.set(results[0].lid, entry);
              }
              this.saveContactsCache(targetSession.id || accountId, targetSession.contacts);
            }
          }
        } catch (onWaErr) {
          console.warn(`[Baileys Engine] onWhatsApp check note for ${jid}:`, onWaErr.message);
        }

        if (targetSession.contacts && !targetSession.contacts.has(normalizedPhone)) {
          targetSession.contacts.set(normalizedPhone, { id: jid, phone: normalizedPhone });
          targetSession.contacts.set(jid, { id: jid, phone: normalizedPhone });
          this.saveContactsCache(targetSession.id || accountId, targetSession.contacts);
        }

        let sentResult;

        // Format interactive buttons and 1-tap action links for WhatsApp Web client
        let finalMessageText = text || '';
        if (buttons && Array.isArray(buttons) && buttons.length > 0) {
          const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
          const buttonLines = buttons.map((btn, idx) => {
            const num = numberEmojis[idx] || `[${idx + 1}]`;
            const label = btn.text || `Option ${idx + 1}`;
            if (btn.type === 'url' && btn.value) {
              return `${num} 🔗 *${label}*\n   👉 ${btn.value}`;
            }
            if (btn.type === 'call' && btn.value) {
              return `${num} 📞 *${label}*\n   👉 ${btn.value}`;
            }
            return `${num} 💬 *${label}* (Reply "${idx + 1}" or "${label}")`;
          });

          finalMessageText = `${finalMessageText.trim()}\n\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `👉 *QUICK ACTIONS:*\n` +
            buttonLines.join('\n\n') + `\n` +
            `━━━━━━━━━━━━━━━━━━`;
        }

        if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
          sentResult = await targetSession.sock.sendMessage(jid, {
            image: { url: mediaUrl },
            caption: finalMessageText,
          });
        } else if (mediaUrl && fs.existsSync(mediaUrl)) {
          const buffer = fs.readFileSync(mediaUrl);
          sentResult = await targetSession.sock.sendMessage(jid, {
            image: buffer,
            caption: finalMessageText,
          });
        } else {
          sentResult = await targetSession.sock.sendMessage(jid, {
            text: finalMessageText,
          });
        }

        const messageId = sentResult?.key?.id || `WA_${Date.now()}`;
        console.log(`[Baileys Engine] ✅ Real WhatsApp message SENT to ${jid} (+${normalizedPhone}) from ${targetSession.phoneNumber || targetSession.id}! ID: ${messageId}`);

        const payload = {
          success: true,
          messageId,
          channel: 'baileys_socket',
          accountId: targetSession.id,
          senderPhone: targetSession.phoneNumber || 'Connected Device',
          recipientPhone: '+' + normalizedPhone,
          text,
          status: 'delivered',
          timestamp: new Date().toISOString(),
        };

        this.emitEvent('message_sent', payload);
        return payload;
      } catch (baileysErr) {
        console.error(`[Baileys Socket Send Error for ${normalizedPhone}]:`, baileysErr.message);
        throw new Error(`WhatsApp socket error sending to ${normalizedPhone}: ${baileysErr.message}`);
      }
    }

    // 2. Check for Meta Cloud API if configured
    if (process.env.META_PHONE_NUMBER_ID && process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN.length > 20) {
      try {
        console.log(`[Baileys Engine] Dispatching via Meta Cloud API to ${cleanPhone}...`);
        const metaRes = await metaCloudApiEngine.sendMessage(
          {
            phoneNumberId: process.env.META_PHONE_NUMBER_ID,
            accessToken: process.env.META_ACCESS_TOKEN,
          },
          cleanPhone,
          text,
          buttons,
          mediaUrl,
          mediaType,
          mediaName
        );

        const payload = {
          success: true,
          messageId: metaRes.messageId,
          channel: 'meta_cloud_api',
          senderPhone: 'Meta Cloud API',
          recipientPhone: '+' + cleanPhone,
          text,
          status: 'delivered',
          timestamp: new Date().toISOString(),
        };

        this.emitEvent('message_sent', payload);
        return payload;
      } catch (metaErr) {
        console.error(`[Meta Cloud API Dispatch Failed]:`, metaErr.message);
        throw new Error(`Meta Cloud API dispatch failed: ${metaErr.message}`);
      }
    }

    // 3. Neither socket nor Meta API is connected -> Throw clear error!
    const errorMsg = `WhatsApp phone line is not connected. Please scan the QR Code on the "Connected Phones" page to link your physical WhatsApp account before sending.`;
    console.error(`[Baileys Engine] ❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  async disconnectSession(accountId) {
    let targets = [];
    if (accountId && accountId !== 'all' && accountId !== 'any') {
      if (this.sessions.has(accountId)) {
        targets.push(this.sessions.get(accountId));
      } else {
        const cleanTarget = String(accountId).replace(/[^\d]/g, '');
        for (const [id, s] of this.sessions.entries()) {
          const sClean = String(s.phoneNumber || '').replace(/[^\d]/g, '');
          if (id === accountId || (cleanTarget && sClean && sClean.includes(cleanTarget))) {
            targets.push(s);
          }
        }
      }
    }

    // If no specific match found or accountId was 'all'/'any', disconnect all active sessions
    if (targets.length === 0) {
      for (const [id, s] of this.sessions.entries()) {
        if (s.status === 'online' || s.sock) {
          targets.push(s);
        }
      }
    }

    console.log(`[Baileys Engine] Disconnecting ${targets.length} session(s) for query '${accountId}'`);

    for (const session of targets) {
      const sId = session.id;
      if (session.sock) {
        console.log(`[Baileys Engine] Dispatching WhatsApp logout stanza (<remove-companion-device>) for ${sId}...`);
        try {
          // Explicit Baileys logout tells WhatsApp servers to immediately revoke companion device
          await Promise.race([
            session.sock.logout('User logged out from web dashboard'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timed out')), 4000))
          ]);
          console.log(`[Baileys Engine] ✅ Logout stanza successfully acknowledged for ${sId}`);
        } catch (logoutErr) {
          console.warn(`[Baileys Engine] sock.logout fallback for ${sId}:`, logoutErr.message);
          try {
            session.sock.end(new Error('Manual disconnect fallback'));
          } catch (endErr) {}
        }
      }

      // Remove session credentials from disk so clean state is preserved
      try {
        const sessionPath = path.join(SESSIONS_DIR, sId);
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          console.log(`[Baileys Engine] Cleaned auth files for ${sId}`);
        }
      } catch (rmErr) {
        console.warn(`[Baileys Engine] Error removing session dir for ${sId}:`, rmErr.message);
      }

      // Update DB
      try {
        const db = getDb();
        const acc = db.accounts.find((a) => a.id === sId);
        if (acc) {
          acc.status = 'disconnected';
          saveDb(db);
        }
      } catch (dbErr) {
        console.warn('[Baileys Engine] Error updating db on disconnect:', dbErr.message);
      }

      session.status = 'disconnected';
      session.qrCode = null;
      session.qrRaw = null;
      this.sessions.delete(sId);
      this.emitEvent('session_disconnected', {
        accountId: sId,
        isLoggedOut: true,
        status: 'disconnected',
      });
    }

    return { success: true, count: targets.length };
  }

  getSessionStatus(accountId) {
    const session = this.sessions.get(accountId);
    if (!session) return null;
    return {
      id: session.id,
      phoneNumber: session.phoneNumber,
      displayName: session.displayName,
      status: session.status,
      qrCode: session.qrCode,
    };
  }

  async fetchGroups(accountId) {
    let session = this.sessions.get(accountId);
    if (!session || session.status !== 'online' || !session.sock) {
      // Look for any connected online session in memory
      for (const [sId, s] of this.sessions.entries()) {
        if (s.status === 'online' && s.sock) {
          session = s;
          break;
        }
      }
    }

    if (!session || !session.sock) {
      throw new Error('WhatsApp device is not connected. Please scan the QR code to link your phone.');
    }

    const now = Date.now();
    if (session.cachedGroups && Array.isArray(session.cachedGroups) && session.cachedGroups.length > 0 && session.cachedGroupsTime && (now - session.cachedGroupsTime < 30000)) {
      return session.cachedGroups;
    }

    if (session._fetchingGroupsPromise) {
      return await session._fetchingGroupsPromise;
    }

    session._fetchingGroupsPromise = (async () => {
      try {
        console.log(`[Baileys Engine] 🔍 Fetching real participating groups from WhatsApp for session ${session.id} (${session.phoneNumber})...`);
        const groupsMap = await session.sock.groupFetchAllParticipating();
        const groupsList = [];

        const myRawId = session.sock.user?.id || '';
        const myJid = myRawId ? myRawId.split(':')[0] + '@s.whatsapp.net' : '';

        for (const [jid, groupData] of Object.entries(groupsMap)) {
          const rawParticipants = groupData.participants || [];
          const members = rawParticipants.map((p) => parseParticipantMember(p, session.contacts, myJid, session.sock));

          const amIAdmin = rawParticipants.some((p) => (p.id === myJid || (p.id && myJid && p.id.startsWith(myJid.split('@')[0]))) && Boolean(p.admin));

          let description = '';
          if (typeof groupData.desc === 'string') {
            description = groupData.desc;
          } else if (groupData.desc && Buffer.isBuffer(groupData.desc)) {
            description = groupData.desc.toString('utf-8');
          }

          const groupName = groupData.subject || 'WhatsApp Group';

          groupsList.push({
            id: groupData.id,
            jid: groupData.id,
            name: groupName,
            category: groupData.isCommunity ? 'WhatsApp Community' : 'Customer Community',
            memberCount: rawParticipants.length,
            creation: groupData.creation ? new Date(groupData.creation * 1000).toISOString() : null,
            owner: groupData.owner ? '+' + groupData.owner.split('@')[0].split(':')[0] : '',
            description,
            isAdmin: amIAdmin,
            isCommunity: Boolean(groupData.isCommunity),
            isLiveGrabbed: true,
            grabbedAt: new Date().toISOString(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=00a884&color=fff&size=128&bold=true`,
            members,
          });
        }

        // Sort groups with largest member counts first
        groupsList.sort((a, b) => b.memberCount - a.memberCount);

        session.cachedGroups = groupsList;
        session.cachedGroupsTime = Date.now();

        console.log(`[Baileys Engine] ✅ Successfully retrieved ${groupsList.length} real groups from phone!`);
        return groupsList;
      } catch (err) {
        console.error('[Baileys Engine] ❌ Error fetching groups from WhatsApp socket:', err);
        throw err;
      } finally {
        session._fetchingGroupsPromise = null;
      }
    })();

    return await session._fetchingGroupsPromise;
  }

  async fetchGroupDetails(accountId, groupJid) {
    let session = this.sessions.get(accountId);
    if (!session || session.status !== 'online' || !session.sock) {
      for (const [sId, s] of this.sessions.entries()) {
        if (s.status === 'online' && s.sock) {
          session = s;
          break;
        }
      }
    }

    if (!session || !session.sock) {
      throw new Error('WhatsApp device is not connected. Please scan QR code to link your phone.');
    }

    try {
      console.log(`[Baileys Engine] 🔍 Fetching interactive group metadata for ${groupJid}...`);
      const groupData = await session.sock.groupMetadata(groupJid);
      const rawParticipants = groupData.participants || [];
      const myRawId = session.sock.user?.id || '';
      const myJid = myRawId ? myRawId.split(':')[0] + '@s.whatsapp.net' : '';

      const members = rawParticipants.map((p) => parseParticipantMember(p, session.contacts, myJid, session.sock));
      const amIAdmin = rawParticipants.some((p) => (p.id === myJid || (p.id && myJid && p.id.startsWith(myJid.split('@')[0]))) && Boolean(p.admin));

      let description = '';
      if (typeof groupData.desc === 'string') {
        description = groupData.desc;
      } else if (groupData.desc && Buffer.isBuffer(groupData.desc)) {
        description = groupData.desc.toString('utf-8');
      }

      const groupName = groupData.subject || 'WhatsApp Group';

      return {
        id: groupData.id,
        jid: groupData.id,
        name: groupName,
        category: groupData.isCommunity ? 'WhatsApp Community' : 'Customer Community',
        memberCount: rawParticipants.length,
        creation: groupData.creation ? new Date(groupData.creation * 1000).toISOString() : null,
        owner: groupData.owner ? '+' + groupData.owner.split('@')[0].split(':')[0] : '',
        description,
        isAdmin: amIAdmin,
        isCommunity: Boolean(groupData.isCommunity),
        isLiveGrabbed: true,
        grabbedAt: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=00a884&color=fff&size=128&bold=true`,
        members,
      };
    } catch (err) {
      console.error(`[Baileys Engine] ❌ Error fetching group metadata for ${groupJid}:`, err);
      throw err;
    }
  }
}

export const baileysEngine = new BaileysEngine();

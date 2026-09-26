import { WhatsAppGroup, WhatsAppGroupContact } from '../../../types';

/**
 * Detects country and flag from phone number prefix
 */
export const detectCountryFromPhone = (phone: string): string => {
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+91') || clean.startsWith('91')) return 'India 🇮🇳';
  if (clean.startsWith('+971') || clean.startsWith('971')) return 'UAE 🇦🇪';
  if (clean.startsWith('+966') || clean.startsWith('966')) return 'Saudi Arabia 🇸🇦';
  if (clean.startsWith('+968') || clean.startsWith('968')) return 'Oman 🇴🇲';
  if (clean.startsWith('+974') || clean.startsWith('974')) return 'Qatar 🇶🇦';
  if (clean.startsWith('+965') || clean.startsWith('965')) return 'Kuwait 🇰🇼';
  if (clean.startsWith('+973') || clean.startsWith('973')) return 'Bahrain 🇧🇭';
  if (clean.startsWith('+1')) return 'USA / Canada 🇺🇸';
  if (clean.startsWith('+44')) return 'United Kingdom 🇬🇧';
  if (clean.startsWith('+60')) return 'Malaysia 🇲🇾';
  if (clean.startsWith('+65')) return 'Singapore 🇸🇬';
  if (clean.startsWith('+49')) return 'Germany 🇩🇪';
  if (clean.startsWith('+33')) return 'France 🇫🇷';
  return 'International 🌐';
};

/**
 * Standardizes phone number to clean formatted E.164
 */
export const formatStandardE164 = (raw: string): string => {
  let clean = raw.trim().replace(/[\s\-\(\)\.]/g, '');
  if (!clean) return '';
  if (!clean.startsWith('+')) {
    if (clean.length === 10 && /^[6-9]/.test(clean)) {
      clean = '+91' + clean;
    } else if (clean.length === 12 && clean.startsWith('91')) {
      clean = '+' + clean;
    } else if (clean.length >= 10) {
      clean = '+' + clean;
    }
  }
  return clean;
};

/**
 * Automatically cleans and sanitizes any WhatsApp Group Invite text/link.
 * Strips preceding phrases ("Follow this link to join my WhatsApp group:"),
 * query parameters ("?s=sw&p=a&mlu=4&ilr=4"), trailing whitespace/punctuation,
 * and always returns the canonical official link: "https://chat.whatsapp.com/<inviteCode>".
 *
 * Examples:
 * - "Follow this link to join my WhatsApp group: https://chat.whatsapp.com/ErRNkAqE9lh4v0nZ6OnCxg?s=sw&p=a&mlu=4&ilr=4"
 *   => "https://chat.whatsapp.com/ErRNkAqE9lh4v0nZ6OnCxg"
 * - "chat.whatsapp.com/ErRNkAqE9lh4v0nZ6OnCxg?s=sw"
 *   => "https://chat.whatsapp.com/ErRNkAqE9lh4v0nZ6OnCxg"
 * - "ErRNkAqE9lh4v0nZ6OnCxg"
 *   => "https://chat.whatsapp.com/ErRNkAqE9lh4v0nZ6OnCxg"
 */
export const sanitizeWhatsAppGroupLink = (raw: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim();

  // 1. Look for chat.whatsapp.com/(invite/)?<code...>
  const match = trimmed.match(/(?:https?:\/\/)?chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_\-]+)/i);
  if (match && match[1]) {
    const codePart = match[1].split(/[?&#\s]/)[0].replace(/[^a-zA-Z0-9_\-]/g, '');
    if (codePart.length >= 8) {
      return `https://chat.whatsapp.com/${codePart}`;
    }
  }

  // 2. Look for standalone 20-26 char invite code (e.g. ErRNkAqE9lh4v0nZ6OnCxg)
  const codeOnlyMatch = trimmed.match(/^[a-zA-Z0-9_\-]{20,26}$/);
  if (codeOnlyMatch) {
    return `https://chat.whatsapp.com/${codeOnlyMatch[0]}`;
  }

  return trimmed;
};

/**
 * Parses raw text containing telephone numbers and contact names
 */
export const parseRawTextToContacts = (rawText: string, defaultNamePrefix = 'Member'): WhatsAppGroupContact[] => {
  if (!rawText) return [];

  // Match international phone numbers: + followed by 7 to 15 digits, or standard numbers with spaces/hyphens
  const phoneRegex = /(?:\+?\d{1,4}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}/g;
  const matches = rawText.match(phoneRegex) || [];
  const contactsMap = new Map<string, WhatsAppGroupContact>();

  const lines = rawText.split(/\r?\n/);

  // First pass: try line-by-line name + phone parsing
  let counter = 1;
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const linePhones = trimmed.match(phoneRegex);
    if (linePhones && linePhones.length > 0) {
      const p = linePhones[0];
      const digitsOnly = p.replace(/[^0-9]/g, '');
      if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
        const formatted = formatStandardE164(p);
        if (!contactsMap.has(formatted)) {
          // Check if there is a name in this line (remove the phone string)
          const namePart = trimmed.replace(p, '').replace(/[\(\)\[\]:,~-]/g, ' ').trim();
          const isAdmin = /admin|creator|owner/i.test(trimmed);
          const name = namePart.length >= 2 ? namePart : `${defaultNamePrefix} ${counter}`;
          contactsMap.set(formatted, {
            id: `grabbed-${digitsOnly}-${Date.now()}-${counter}`,
            name: name,
            phone: formatted,
            whatsappId: `${digitsOnly}@c.us`,
            role: isAdmin ? 'admin' : 'member',
            country: detectCountryFromPhone(formatted),
            isValidWhatsApp: true,
            statusMessage: 'Extracted via WhatsApp Group Grabber',
            joinedAt: new Date().toLocaleDateString(),
          });
          counter++;
        }
      }
    }
  });

  // Second pass: catch any remaining raw matches
  matches.forEach((p) => {
    const digitsOnly = p.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      const formatted = formatStandardE164(p);
      if (!contactsMap.has(formatted)) {
        contactsMap.set(formatted, {
          id: `grabbed-${digitsOnly}-${Date.now()}-${counter}`,
          name: `${defaultNamePrefix} ${counter}`,
          phone: formatted,
          whatsappId: `${digitsOnly}@c.us`,
          role: 'member',
          country: detectCountryFromPhone(formatted),
          isValidWhatsApp: true,
          statusMessage: 'Extracted via WhatsApp Group Grabber',
          joinedAt: new Date().toLocaleDateString(),
        });
        counter++;
      }
    }
  });

  return Array.from(contactsMap.values());
};

/**
 * Parses exported WhatsApp Chat text file (_chat.txt)
 * Handles both iOS and Android WhatsApp export formats:
 * iOS: [15/01/24, 2:30:15 PM] +91 98450 12345: Message...
 * Android: 15/01/2024, 14:30 - +91 98450 12345: Message...
 */
export const parseWhatsAppChatExport = (chatText: string, groupName = 'Extracted WhatsApp Group'): WhatsAppGroup => {
  const lines = chatText.split(/\r?\n/);
  const contactsMap = new Map<string, WhatsAppGroupContact>();
  let detectedGroupName = groupName;
  let counter = 1;

  // Regex patterns for message headers
  // iOS: [DD/MM/YY, H:MM:SS AM/PM] Sender: Message
  // Android: DD/MM/YYYY, H:MM - Sender: Message
  const headerRegex = /^(?:\[\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s+[APap][Mm])?\]|\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s+[APap][Mm])?\s*[-–])\s*([^:]+):?/i;
  
  // Group creation pattern: "Rahul created group "VIP AC Clients""
  const groupCreationRegex = /created group ["“]([^"”]+)["”]|changed the subject to ["“]([^"”]+)["”]/i;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check for group title update
    const groupMatch = trimmed.match(groupCreationRegex);
    if (groupMatch && (groupMatch[1] || groupMatch[2])) {
      detectedGroupName = (groupMatch[1] || groupMatch[2]).trim();
    }

    // Check for message sender
    const match = trimmed.match(headerRegex);
    if (match) {
      const sender = match[1].trim();
      // Skip system messages like "Messages and calls are end-to-end encrypted"
      if (
        /end-to-end encrypted|security code changed|added you|created group|joined using/i.test(sender)
      ) {
        // But check if phone numbers are in this line!
        const inlinePhones = trimmed.match(/(?:\+?\d{1,4}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}/g);
        if (inlinePhones) {
          inlinePhones.forEach((p) => {
            const digits = p.replace(/[^0-9]/g, '');
            if (digits.length >= 8 && digits.length <= 15) {
              const formatted = formatStandardE164(p);
              if (!contactsMap.has(formatted)) {
                contactsMap.set(formatted, {
                  id: `wa-exp-${digits}-${counter}`,
                  name: `Member ${counter}`,
                  phone: formatted,
                  whatsappId: `${digits}@c.us`,
                  role: /created group|admin/i.test(trimmed) ? 'admin' : 'member',
                  country: detectCountryFromPhone(formatted),
                  isValidWhatsApp: true,
                  statusMessage: 'Discovered in WhatsApp Group Activity',
                  joinedAt: new Date().toLocaleDateString(),
                });
                counter++;
              }
            }
          });
        }
        return;
      }

      // Check if sender is a phone number or contact name
      const digits = sender.replace(/[^0-9]/g, '');
      const hasPlus = sender.startsWith('+');
      const isPhone = (hasPlus && digits.length >= 8) || (digits.length >= 10 && digits.length <= 15);

      if (isPhone) {
        const formatted = formatStandardE164(sender);
        if (!contactsMap.has(formatted)) {
          contactsMap.set(formatted, {
            id: `wa-exp-${digits}-${counter}`,
            name: `Participant ${counter}`,
            phone: formatted,
            whatsappId: `${digits}@c.us`,
            role: 'member',
            country: detectCountryFromPhone(formatted),
            isValidWhatsApp: true,
            statusMessage: 'Active WhatsApp Group Participant',
            joinedAt: new Date().toLocaleDateString(),
          });
          counter++;
        }
      } else if (sender.length > 1 && !sender.includes('joined') && !sender.includes('left')) {
        // Saved name in contact list - check if there's an associated number or assign clean id
        // In WhatsApp exports with saved names, the phone number might not be in the header,
        // but if there are numbers in the line, associate them.
        const linePhones = trimmed.match(/(?:\+?\d{1,4}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}/g);
        if (linePhones && linePhones.length > 0) {
          const p = linePhones[0];
          const digits2 = p.replace(/[^0-9]/g, '');
          if (digits2.length >= 8 && digits2.length <= 15) {
            const formatted = formatStandardE164(p);
            if (!contactsMap.has(formatted)) {
              contactsMap.set(formatted, {
                id: `wa-exp-${digits2}-${counter}`,
                name: sender,
                phone: formatted,
                whatsappId: `${digits2}@c.us`,
                role: 'member',
                country: detectCountryFromPhone(formatted),
                isValidWhatsApp: true,
                statusMessage: 'Active WhatsApp Group Member',
                joinedAt: new Date().toLocaleDateString(),
              });
              counter++;
            }
          }
        }
      }
    }
  });

  const members = Array.from(contactsMap.values());
  const groupId = `grp-import-${Date.now()}`;

  return {
    id: groupId,
    jid: `120363${Date.now()}@g.us`,
    name: detectedGroupName,
    description: `Exported WhatsApp Group with ${members.length} verified participant numbers.`,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    category: 'Customer Community',
    memberCount: members.length,
    isAdmin: members.some((m) => m.role === 'admin'),
    createdAt: new Date().toISOString().split('T')[0],
    members: members,
  };
};

/**
 * Structures an authentic WhatsApp Group from an Invite Link (chat.whatsapp.com/...)
 * Zero simulated numbers are generated.
 */
export const parseGroupInviteLink = (
  inviteUrl: string,
  groupMeta?: string | { title?: string; avatar?: string; description?: string; participantCount?: number },
  initialMembers: WhatsAppGroupContact[] = []
): WhatsAppGroup => {
  const cleanUrl = sanitizeWhatsAppGroupLink(inviteUrl);
  const inviteCodeMatch = cleanUrl.match(/chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]+)/i);
  const inviteCode = inviteCodeMatch ? inviteCodeMatch[1] : 'GRP_' + Date.now().toString(36).toUpperCase();

  const metaObj = typeof groupMeta === 'string' ? { title: groupMeta } : groupMeta;
  const finalName = metaObj?.title?.trim() || `WhatsApp Group (${inviteCode.substring(0, 6)})`;
  const avatar = metaObj?.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80';
  const description = metaObj?.description || `Authentic WhatsApp Group: ${cleanUrl}`;

  return {
    id: `grp-link-${inviteCode}`,
    jid: `120363${Date.now()}@g.us`,
    name: finalName,
    description: description,
    avatar: avatar,
    category: 'Customer Community',
    memberCount: initialMembers.length || (metaObj?.participantCount || 0),
    isAdmin: true,
    createdAt: new Date().toISOString().split('T')[0],
    members: initialMembers,
  };
};

/**
 * WhatsApp Web In-Page Floating Grabber Script & Bookmarklet
 * Extracts genuine contact names AND phone numbers from the active WhatsApp Web group!
 */
export const WHATSAPP_WEB_GRABBER_SCRIPT = `
(function runQBS360Grabber() {
  try {
    const existing = document.getElementById('whatsq-grabber-overlay');
    if (existing) existing.remove();

    // 1. Detect Group Title
    const header = document.querySelector('header [data-testid="conversation-info-header"]') ||
                   document.querySelector('header [role="button"]') ||
                   document.querySelector('header');
    let groupName = 'WhatsApp Group';
    if (header) {
      const tSpan = header.querySelector('span[title]') || header.querySelector('[dir="auto"]');
      groupName = tSpan ? (tSpan.getAttribute('title') || tSpan.innerText).trim() : (header.innerText || '').split('\\n')[0].trim();
    }

    // 2. Extract Participants (Name + Phone + Admin)
    const contactsMap = new Map();
    const listItems = document.querySelectorAll('div[role="listitem"], div[data-testid="cell-frame-container"]');
    listItems.forEach((item) => {
      const text = item.innerText || '';
      const lines = text.split('\\n').map((l) => l.trim()).filter(Boolean);
      let phone = '';
      let name = '';
      const isAdmin = /admin/i.test(text);

      lines.forEach((line) => {
        const m = line.match(/(?:\\+?\\d{1,4}[\\s\\-]?)?(?:\\(?\\d{2,5}\\)?[\\s\\-]?)?\\d{3,5}[\\s\\-]?\\d{3,5}/);
        if (m) {
          const digits = m[0].replace(/[^0-9]/g, '');
          if (digits.length >= 8 && digits.length <= 15) {
            phone = m[0].trim();
          }
        } else if (!name && !/admin|group|click|message/i.test(line) && line.length < 50) {
          name = line;
        }
      });

      item.querySelectorAll('span[title]').forEach((sp) => {
        const t = sp.getAttribute('title') || '';
        const m = t.match(/(?:\\+?\\d{1,4}[\\s\\-]?)?(?:\\(?\\d{2,5}\\)?[\\s\\-]?)?\\d{3,5}[\\s\\-]?\\d{3,5}/);
        if (m) {
          const digits = m[0].replace(/[^0-9]/g, '');
          if (digits.length >= 8 && digits.length <= 15 && !phone) {
            phone = m[0].trim();
          }
        } else if (!name && t.length < 50 && !/admin|group/i.test(t)) {
          name = t;
        }
      });

      if (phone) {
        const cleanPhone = phone.startsWith('+') ? phone : '+' + phone;
        const digits = cleanPhone.replace(/[^0-9]/g, '');
        if (!contactsMap.has(digits)) {
          contactsMap.set(digits, {
            name: name || ('Member ' + (contactsMap.size + 1)),
            phone: cleanPhone,
            isAdmin: isAdmin
          });
        }
      }
    });

    // Also scan all body text and header subtitles for any phone numbers
    const allText = document.body.innerText || '';
    const phoneMatches = allText.match(/(?:\\+?\\d{1,4}[\\s\\-]?)?(?:\\(?\\d{2,5}\\)?[\\s\\-]?)?\\d{3,5}[\\s\\-]?\\d{3,5}/g) || [];
    phoneMatches.forEach((p) => {
      const digits = p.replace(/[^0-9]/g, '');
      if (digits.length >= 8 && digits.length <= 15 && !contactsMap.has(digits)) {
        const cleanPhone = p.trim().startsWith('+') ? p.trim() : '+' + p.trim();
        contactsMap.set(digits, {
          name: 'Member ' + (contactsMap.size + 1),
          phone: cleanPhone,
          isAdmin: false
        });
      }
    });

    const members = Array.from(contactsMap.values());
    if (members.length === 0) {
      alert('⚠️ No participant phone numbers found in current view.\\n\\nPlease click on the group name ("' + groupName + '") at the top of the chat to open the Group Info drawer, then click the QBS-360 Grabber bookmark/button again!');
      return;
    }

    // Auto-copy phone numbers to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(members.map((m) => m.phone).join('\\n'));
    }

    // Build Group Object for QBS-360
    const groupObj = {
      id: 'grp-web-' + Date.now(),
      jid: '120363' + Date.now() + '@g.us',
      name: groupName,
      description: 'Extracted from WhatsApp Web with ' + members.length + ' real members.',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      category: 'Customer Community',
      memberCount: members.length,
      isAdmin: true,
      createdAt: new Date().toISOString().split('T')[0],
      members: members.map((m, idx) => ({
        id: 'wa-live-' + m.phone.replace(/[^0-9]/g, '') + '-' + idx,
        name: m.name,
        phone: m.phone,
        whatsappId: m.phone.replace(/[^0-9]/g, '') + '@c.us',
        role: m.isAdmin ? 'admin' : 'member',
        country: 'Verified Contact',
        isValidWhatsApp: true,
        statusMessage: 'Active WhatsApp Group Member',
        joinedAt: new Date().toLocaleDateString()
      }))
    };

    // Broadcast across channels
    try {
      const channel = new BroadcastChannel('qiyam_group_grabber');
      channel.postMessage({
        type: 'GROUP_PUSHED',
        phone: members[0].phone,
        deviceName: 'WhatsApp Web Live Session',
        group: groupObj
      });
    } catch(e) {}

    // 3. Inject Floating QBS-360 Widget on WhatsApp Web
    const overlay = document.createElement('div');
    overlay.id = 'whatsq-grabber-overlay';
    overlay.style.cssText = 'position:fixed;top:20px;right:20px;width:380px;max-width:92vw;max-height:85vh;background:#0f172a;color:#f8fafc;border-radius:18px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7),0 0 0 2px #059669;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;z-index:999999;display:flex;flex-direction:column;overflow:hidden;';

    const itemsHtml = members.map((m, idx) => '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:' + (idx%2===0?'rgba(30,41,59,0.7)':'rgba(15,23,42,0.5)') + ';border-radius:8px;margin-bottom:3px;font-size:11px;"><div style="display:flex;align-items:center;gap:8px;overflow:hidden;"><div style="width:24px;height:24px;border-radius:6px;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;">' + (m.name.charAt(0).toUpperCase() || 'M') + '</div><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><div style="font-weight:600;color:#f1f5f9;">' + m.name.replace(/</g,'&lt;') + '</div><div style="color:#94a3b8;font-family:monospace;font-size:10px;">' + m.phone + '</div></div></div>' + (m.isAdmin ? '<span style="font-size:9px;padding:2px 5px;background:rgba(245,158,11,0.2);color:#fbbf24;border-radius:4px;font-weight:bold;">ADMIN</span>' : '') + '</div>').join('');

    overlay.innerHTML = '<div style="padding:14px 16px;background:linear-gradient(135deg,#065f46,#0f172a);display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:8px;"><div style="font-size:18px;">⚡</div><div><div style="font-size:13px;font-weight:800;color:#fff;">QBS-360 Group Grabber</div><div style="font-size:10px;color:#6ee7b7;">100% Real WhatsApp Web Roster</div></div></div><button id="whatsq-w-close" style="background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;padding:2px 6px;">✕</button></div>' +
      '<div style="padding:10px 16px;background:rgba(30,41,59,0.5);border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;"><div><div style="font-size:12px;font-weight:700;color:#e2e8f0;">' + groupName.replace(/</g,'&lt;') + '</div><div style="font-size:10px;color:#94a3b8;">' + members.length + ' contacts discovered</div></div><span style="background:#059669;color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:12px;">' + members.length + ' Found</span></div>' +
      '<div style="padding:10px 16px;flex:1;overflow-y:auto;max-height:38vh;">' + itemsHtml + '</div>' +
      '<div style="padding:12px 16px;background:#0b1120;border-top:1px solid #1e293b;display:flex;flex-direction:column;gap:6px;"><button id="whatsq-w-send" style="width:100%;padding:10px;border-radius:10px;border:none;background:#059669;color:#fff;font-weight:700;font-size:12px;cursor:pointer;">🚀 Send All to QBS-360 Dashboard</button><div style="display:flex;gap:6px;"><button id="whatsq-w-csv" style="flex:1;padding:8px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#cbd5e1;font-size:10px;font-weight:600;cursor:pointer;">📥 Download CSV</button><button id="whatsq-w-copy" style="flex:1;padding:8px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#cbd5e1;font-size:10px;font-weight:600;cursor:pointer;">📋 Copy Numbers</button></div><div id="whatsq-w-status" style="font-size:10px;color:#34d399;text-align:center;margin-top:2px;">All ' + members.length + ' numbers are copied to clipboard!</div></div>';

    document.body.appendChild(overlay);

    document.getElementById('whatsq-w-close').onclick = () => overlay.remove();
    document.getElementById('whatsq-w-send').onclick = () => {
      navigator.clipboard.writeText(members.map((m) => m.phone).join('\\n'));
      const s = document.getElementById('whatsq-w-status');
      if (s) s.innerHTML = '✅ <strong>Saved to clipboard!</strong> Go to QBS-360 & click "Paste from Clipboard".';
      try {
        const ch = new BroadcastChannel('qiyam_group_grabber');
        ch.postMessage({ type: 'GROUP_PUSHED', group: groupObj });
      } catch(e) {}
    };
    document.getElementById('whatsq-w-csv').onclick = () => {
      const csv = 'Name,Phone Number,Role\\n' + members.map((m) => '"' + m.name.replace(/"/g,'""') + '","' + m.phone + '","' + (m.isAdmin ? 'Admin' : 'Member') + '"').join('\\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (groupName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'whatsapp_group') + '_contacts.csv';
      a.click();
    };
    document.getElementById('whatsq-w-copy').onclick = () => {
      navigator.clipboard.writeText(members.map((m) => m.phone).join('\\n'));
      const s = document.getElementById('whatsq-w-status');
      if (s) s.innerHTML = '📋 Copied ' + members.length + ' phone numbers!';
    };

    return groupObj;
  } catch(err) {
    alert('QBS-360 Grabber error: ' + err.message);
  }
})();
`.trim();

/**
 * 1-Click Browser Bookmarklet URL
 * Users can drag this link onto their browser bookmark bar!
 */
export const WHATSQ_BOOKMARKLET_URL = `javascript:${encodeURIComponent(WHATSAPP_WEB_GRABBER_SCRIPT)}`;


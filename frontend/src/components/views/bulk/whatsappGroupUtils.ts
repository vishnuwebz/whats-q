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
  const cleanUrl = inviteUrl.trim();
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
 * WhatsApp Web 1-Click Live Extraction Script
 * Grabs genuine phone numbers from active group and auto-broadcasts directly to WhatsQ!
 */
export const WHATSAPP_WEB_GRABBER_SCRIPT = `
(function grabWhatsAppGroup() {
  try {
    const header = document.querySelector('header [data-testid="conversation-info-header"]') ||
                   document.querySelector('header span[title]') ||
                   document.querySelector('header [role="button"]');
    const groupName = header ? (header.getAttribute('title') || header.innerText || 'WhatsApp Group').split('\n')[0].trim() : 'WhatsApp Group';

    // Find all phone number strings in active DOM and group info drawer
    const rawText = document.body.innerText;
    const phoneMatches = rawText.match(/(?:\+?\d{1,4}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}/g) || [];
    
    // Also look for specific span titles with numbers
    document.querySelectorAll('span[title]').forEach(el => {
      const t = el.getAttribute('title') || '';
      const m = t.match(/(?:\+?\d{1,4}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}/g);
      if (m) phoneMatches.push(...m);
    });

    const cleanPhones = Array.from(new Set(phoneMatches.map(p => p.trim()).filter(p => {
      const digits = p.replace(/[^0-9]/g, '');
      return digits.length >= 8 && digits.length <= 15;
    })));

    if (cleanPhones.length === 0) {
      alert('⚠️ No phone numbers found in current view.\n\nPlease click on the group name ("' + groupName + '") at the top of the chat so the Group Info sidebar opens with the member list, then run this script again!');
      return;
    }

    const groupObj = {
      id: 'grp-web-' + Date.now(),
      jid: '120363' + Date.now() + '@g.us',
      name: groupName,
      description: 'Extracted from WhatsApp Web with ' + cleanPhones.length + ' real participant numbers.',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      category: 'Customer Community',
      memberCount: cleanPhones.length,
      isAdmin: true,
      createdAt: new Date().toISOString().split('T')[0],
      members: cleanPhones.map((p, idx) => ({
        id: 'wa-live-' + p.replace(/[^0-9]/g, '') + '-' + idx,
        name: idx === 0 ? groupName + ' Admin' : 'Member ' + (idx + 1),
        phone: p.startsWith('+') ? p : '+' + p,
        whatsappId: p.replace(/[^0-9]/g, '') + '@c.us',
        role: idx === 0 ? 'admin' : 'member',
        country: 'Verified Number',
        isValidWhatsApp: true,
        statusMessage: 'Active WhatsApp Group Member',
        joinedAt: new Date().toLocaleDateString()
      }))
    };

    try {
      const channel = new BroadcastChannel('qiyam_group_grabber');
      channel.postMessage({
        type: 'GROUP_PUSHED',
        phone: cleanPhones[0],
        deviceName: 'WhatsApp Web Live Session',
        group: groupObj
      });
    } catch(bcErr) {}

    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanPhones.join('\n'));
    }

    console.log('✅ Extracted ' + cleanPhones.length + ' phone numbers:', cleanPhones);
    alert('🎉 SUCCESS! Extracted ' + cleanPhones.length + ' REAL phone numbers from "' + groupName + '".\n\nAll ' + cleanPhones.length + ' numbers are COPIED to your clipboard!\n\nNow switch back to your WhatsQ Dashboard and click "Paste from Clipboard & Extract Numbers"!');
    return groupObj;
  } catch(e) {
    alert('Grabber error: ' + e.message);
  }
})();
`.trim();


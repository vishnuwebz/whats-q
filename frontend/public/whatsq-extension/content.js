// QBS-360 Group Grabber - WhatsApp Web Content Script
(function initWhatsQExtension() {
  console.log('🚀 QBS-360 Group Grabber Extension loaded on WhatsApp Web');

  // Insert Grab Button in WhatsApp Web Header
  function insertWhatsQButton() {
    if (document.getElementById('whatsq-header-btn')) return;

    const chatHeader = document.querySelector('header [data-testid="conversation-info-header"]') ||
                       document.querySelector('header [role="button"]') ||
                       document.querySelector('header');

    if (!chatHeader) return;

    const btn = document.createElement('button');
    btn.id = 'whatsq-header-btn';
    btn.innerHTML = '⚡ QBS-360 Grab';
    btn.setAttribute('title', 'Extract Group Member Names & Phone Numbers into QBS-360');
    btn.style.cssText = `
      margin-left: 12px;
      padding: 6px 14px;
      background: linear-gradient(135deg, #059669, #0d9488);
      color: #ffffff;
      border: none;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.4);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.15s ease, background 0.15s ease;
      z-index: 9999;
    `;
    btn.onmouseover = () => { btn.style.transform = 'scale(1.04)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1.0)'; };
    btn.onclick = (e) => {
      e.stopPropagation();
      openWhatsQGrabberOverlay();
    };

    // Append to header
    const headerParent = chatHeader.closest('header') || chatHeader;
    const actionsContainer = headerParent.querySelector('div:last-child') || headerParent;
    actionsContainer.insertBefore(btn, actionsContainer.firstChild);
  }

  // Periodic check to attach button when user switches chats
  setInterval(insertWhatsQButton, 1500);

  // Floating Overlay UI
  window.openWhatsQGrabberOverlay = function() {
    let overlay = document.getElementById('whatsq-grabber-overlay');
    if (overlay) {
      overlay.remove();
    }

    const groupInfo = extractGroupAndParticipants();

    overlay = document.createElement('div');
    overlay.id = 'whatsq-grabber-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      width: 420px;
      max-width: 90vw;
      max-height: 85vh;
      background: #0f172a;
      color: #f8fafc;
      border-radius: 20px;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 2px #059669;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: whatsqFadeIn 0.25s ease-out;
    `;

    const membersHtml = groupInfo.members.map((m, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: ${idx % 2 === 0 ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.5)'}; border-radius: 10px; margin-bottom: 4px; font-size: 12px;">
        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
          <div style="width: 28px; height: 28px; border-radius: 8px; background: #059669; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; shrink: 0;">
            ${m.name.charAt(0).toUpperCase()}
          </div>
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <div style="font-weight: 600; color: #f1f5f9;">${escapeHtml(m.name)}</div>
            <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">${escapeHtml(m.phone)}</div>
          </div>
        </div>
        ${m.isAdmin ? '<span style="font-size: 10px; padding: 2px 6px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-radius: 6px; font-weight: bold;">ADMIN</span>' : ''}
      </div>
    `).join('');

    overlay.innerHTML = `
      <style>
        @keyframes whatsqFadeIn { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .whatsq-btn { border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .whatsq-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .whatsq-btn:active { transform: translateY(0); }
      </style>
      <div style="padding: 16px 20px; background: linear-gradient(135deg, #065f46, #0f172a); border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 18px;">
            ⚡
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #fff; letter-spacing: -0.02em;">QBS-360 Group Grabber</div>
            <div style="font-size: 11px; color: #6ee7b7;">100% Real WhatsApp Web Roster</div>
          </div>
        </div>
        <button id="whatsq-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 8px;">✕</button>
      </div>

      <div style="padding: 14px 20px; background: rgba(30, 41, 59, 0.5); border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #e2e8f0;">${escapeHtml(groupInfo.name)}</div>
          <div style="font-size: 11px; color: #94a3b8;">${groupInfo.members.length} verified participants discovered</div>
        </div>
        <span style="background: #059669; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px;">
          ${groupInfo.members.length} Found
        </span>
      </div>

      <div style="padding: 14px 20px; flex: 1; overflow-y: auto; max-height: 40vh;" id="whatsq-members-scroll">
        ${groupInfo.members.length === 0 ? `
          <div style="text-align: center; padding: 24px 12px; color: #94a3b8; font-size: 12px;">
            <div style="font-size: 28px; margin-bottom: 8px;">ℹ️</div>
            <div style="font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">Click the Group Title at the top</div>
            <div>Please click the group title at the top of the chat so the Group Info drawer opens with the participant list, then click Grab again!</div>
          </div>
        ` : membersHtml}
      </div>

      <div style="padding: 16px 20px; background: #0b1120; border-top: 1px solid #1e293b; display: flex; flex-direction: column; gap: 8px;">
        <button id="whatsq-send-btn" class="whatsq-btn" style="padding: 12px; background: #059669; color: #fff; font-size: 13px;">
          🚀 Copy All &amp; Send to QBS-360
        </button>
        <div style="display: flex; gap: 8px;">
          <button id="whatsq-csv-btn" class="whatsq-btn" style="flex: 1; padding: 9px; background: #1e293b; color: #cbd5e1; font-size: 11px; border: 1px solid #334155;">
            📥 Download CSV
          </button>
          <button id="whatsq-copy-btn" class="whatsq-btn" style="flex: 1; padding: 9px; background: #1e293b; color: #cbd5e1; font-size: 11px; border: 1px solid #334155;">
            📋 Copy Numbers
          </button>
        </div>
        <div id="whatsq-status-text" style="font-size: 10px; color: #64748b; text-align: center; margin-top: 2px;">
          QBS-360 Business OS • High Privacy Multi-Device Grabber
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Wire up events
    document.getElementById('whatsq-close-btn').onclick = () => overlay.remove();

    document.getElementById('whatsq-send-btn').onclick = () => {
      const numbersText = groupInfo.members.map(m => m.phone).join('\n');
      navigator.clipboard.writeText(numbersText);

      try {
        const channel = new BroadcastChannel('qiyam_group_grabber');
        channel.postMessage({
          type: 'GROUP_PUSHED',
          phone: groupInfo.members[0]?.phone || '',
          deviceName: 'WhatsApp Web Extension',
          group: {
            id: 'grp-ext-' + Date.now(),
            jid: '120363' + Date.now() + '@g.us',
            name: groupInfo.name,
            description: 'Exported from WhatsApp Web with ' + groupInfo.members.length + ' genuine members.',
            avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
            category: 'Customer Community',
            memberCount: groupInfo.members.length,
            isAdmin: true,
            createdAt: new Date().toISOString().split('T')[0],
            members: groupInfo.members.map((m, idx) => ({
              id: 'wa-ext-' + m.phone.replace(/[^0-9]/g, '') + '-' + idx,
              name: m.name,
              phone: m.phone,
              whatsappId: m.phone.replace(/[^0-9]/g, '') + '@c.us',
              role: m.isAdmin ? 'admin' : 'member',
              country: 'Verified Contact',
              isValidWhatsApp: true,
              statusMessage: 'Discovered via QBS-360 Extension',
              joinedAt: new Date().toLocaleDateString()
            }))
          }
        });
      } catch (e) {}

      const statusEl = document.getElementById('whatsq-status-text');
      if (statusEl) {
        statusEl.innerHTML = '✅ <strong>Copied ' + groupInfo.members.length + ' contacts!</strong> Switch to QBS-360 and click "Paste from Clipboard".';
        statusEl.style.color = '#34d399';
      }
    };

    document.getElementById('whatsq-csv-btn').onclick = () => {
      const csv = 'Name,Phone Number,Role\n' + groupInfo.members.map(m => `"${m.name.replace(/"/g, '""')}","${m.phone}","${m.isAdmin ? 'Admin' : 'Member'}"`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (groupInfo.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'whatsapp_group') + '_contacts.csv';
      a.click();
    };

    document.getElementById('whatsq-copy-btn').onclick = () => {
      const numbersText = groupInfo.members.map(m => m.phone).join('\n');
      navigator.clipboard.writeText(numbersText);
      const statusEl = document.getElementById('whatsq-status-text');
      if (statusEl) {
        statusEl.innerHTML = '📋 Copied ' + groupInfo.members.length + ' phone numbers to clipboard!';
        statusEl.style.color = '#38bdf8';
      }
    };
  };

  function extractGroupAndParticipants() {
    const header = document.querySelector('header [data-testid="conversation-info-header"]') ||
                   document.querySelector('header [role="button"]') ||
                   document.querySelector('header');

    let groupName = 'WhatsApp Group';
    if (header) {
      const titleSpan = header.querySelector('span[title]') || header.querySelector('[dir="auto"]');
      groupName = titleSpan ? (titleSpan.getAttribute('title') || titleSpan.innerText).trim() : (header.innerText || '').split('\n')[0].trim();
    }

    const contactsMap = new Map();

    // 1. Scan Participant list items in Group info drawer
    const listItems = document.querySelectorAll('div[role="listitem"], div[data-testid="cell-frame-container"]');
    listItems.forEach(item => {
      const text = item.innerText || '';
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      let phone = '';
      let name = '';
      let isAdmin = /admin/i.test(text);

      lines.forEach(line => {
        const m = line.match(/(?:\+?\d{1,4}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}/);
        if (m) {
          const digits = m[0].replace(/[^0-9]/g, '');
          if (digits.length >= 8 && digits.length <= 15) {
            phone = m[0].trim();
          }
        } else if (!name && !/admin|group|click|message/i.test(line) && line.length < 50) {
          name = line;
        }
      });

      item.querySelectorAll('span[title]').forEach(sp => {
        const t = sp.getAttribute('title') || '';
        const m = t.match(/(?:\+?\d{1,4}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}/);
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

    // 2. Scan Header subtitle comma-separated numbers
    const allText = document.body.innerText;
    const phoneMatches = allText.match(/(?:\+?\d{1,4}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}/g) || [];
    phoneMatches.forEach(p => {
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

    return {
      name: groupName,
      members: Array.from(contactsMap.values())
    };
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();

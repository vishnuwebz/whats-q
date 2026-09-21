/**
 * Meta WhatsApp Cloud API Service Engine
 * Integrates directly with Meta Developer Graph API v18.0
 */
export class MetaCloudApiEngine {
  constructor() {
    this.apiVersion = process.env.META_API_VERSION || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Send WhatsApp Message via Meta Cloud API
   * Supports Text, Media (Image/Video/Document), and Interactive Quick Reply Buttons
   */
  async sendMessage(credentials, recipientPhone, messageText, buttons = [], mediaUrl = null, mediaType = 'image', mediaName = null, templateName = null, languageCode = 'en_US') {
    const { phoneNumberId, accessToken } = credentials;

    if (!phoneNumberId || !accessToken) {
      throw new Error('Meta Cloud API credentials missing: phoneNumberId or accessToken not configured.');
    }

    let cleanPhone = (recipientPhone || '').replace(/[^\d]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      throw new Error(`Invalid recipient phone: "${recipientPhone}"`);
    }

    // Auto-normalize standard 10-digit Indian numbers with country code (91)
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const url = `${this.baseUrl}/${phoneNumberId}/messages`;

    // Detect mediaType if not explicitly passed
    let effectiveMediaType = mediaType || 'image';
    if (mediaUrl) {
      const lowerUrl = (mediaUrl + ' ' + (mediaName || '')).toLowerCase();
      if (lowerUrl.includes('.pdf') || lowerUrl.includes('.doc') || lowerUrl.includes('.xlsx') || lowerUrl.includes('catalog')) {
        effectiveMediaType = 'document';
      } else if (lowerUrl.includes('.mp4') || lowerUrl.includes('.mov')) {
        effectiveMediaType = 'video';
      }
    }

    let payload;

    // 0. Official Meta Approved Template Payload (Delivers to cold leads outside 24h window)
    if (templateName) {
      const components = [];

      // If template uses Image Header (e.g. qiyam_promotional_broadcast)
      const headerImageUrl =
        mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))
          ? mediaUrl
          : 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800';

      if (templateName.includes('broadcast') || templateName.includes('promo') || mediaUrl) {
        components.push({
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: { link: headerImageUrl },
            },
          ],
        });
      }

      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode || 'en' },
          ...(components.length > 0 ? { components } : {}),
        },
      };
    }
    // 1. Interactive Button Message Payload (Up to 3 quick reply buttons)
    else if (buttons && Array.isArray(buttons) && buttons.length > 0) {
      const formattedButtons = buttons.slice(0, 3).map((btn, idx) => {
        // Meta enforces max 20 chars on button title
        let title = (btn.text || `Option ${idx + 1}`).trim();
        if (title.length > 20) {
          title = title.substring(0, 20);
        }
        const cleanId = (btn.id || `btn_${idx}_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 256);
        return {
          type: 'reply',
          reply: {
            id: cleanId,
            title: title || `Option ${idx + 1}`,
          },
        };
      });

      // Append any URL / Call button links into message text so links are fully clickable
      let enhancedText = messageText || 'Hello!';
      const linkButtons = buttons.filter((b) => b.value && (b.type === 'url' || b.type === 'call'));
      if (linkButtons.length > 0) {
        enhancedText += '\n\n' + linkButtons.map((b) => `${b.text}: ${b.value}`).join('\n');
      }

      let header = undefined;
      if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
        if (effectiveMediaType === 'document') {
          header = {
            type: 'document',
            document: { link: mediaUrl, filename: mediaName || 'Document.pdf' },
          };
        } else if (effectiveMediaType === 'video') {
          header = {
            type: 'video',
            video: { link: mediaUrl },
          };
        } else {
          header = {
            type: 'image',
            image: { link: mediaUrl },
          };
        }
      }

      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'interactive',
        interactive: {
          type: 'button',
          ...(header ? { header } : {}),
          body: { text: enhancedText.substring(0, 1024) },
          action: { buttons: formattedButtons },
        },
      };
    }
    // 2. Media Message Payload (Image, Document, Video)
    else if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
      const typeKey = effectiveMediaType === 'document' ? 'document' : effectiveMediaType === 'video' ? 'video' : 'image';
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: typeKey,
        [typeKey]: {
          link: mediaUrl,
          caption: messageText || undefined,
          ...(typeKey === 'document' ? { filename: mediaName || 'Document.pdf' } : {}),
        },
      };
    }
    // 3. Simple Text Message Payload
    else {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: true,
          body: messageText || 'Hello!',
        },
      };
    }

    console.log(`[Meta Cloud API Engine] Sending ${payload.type} message to ${cleanPhone}...`);

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data = await response.json();

    // If interactive button rejected, retry as standard media/text message
    if (!response.ok && payload.type === 'interactive') {
      console.warn('[Meta Cloud API] Interactive button failed, falling back to standard media/text message...');
      let fallbackPayload;
      if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
        const typeKey = effectiveMediaType === 'document' ? 'document' : effectiveMediaType === 'video' ? 'video' : 'image';
        fallbackPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: typeKey,
          [typeKey]: {
            link: mediaUrl,
            caption: messageText,
            ...(typeKey === 'document' ? { filename: mediaName || 'Document.pdf' } : {}),
          },
        };
      } else {
        fallbackPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: messageText,
          },
        };
      }

      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fallbackPayload),
      });
      data = await response.json();
    }

    if (!response.ok) {
      console.error('[Meta Cloud API Engine Error]:', data);
      const code = data.error?.code;
      const subcode = data.error?.error_subcode;
      const rawMsg = data.error?.message || 'Failed to send message via Meta Cloud API';

      let friendlyReason = rawMsg;
      if (code === 131030 || code === 131047 || subcode === 2494010) {
        friendlyReason = '24-Hour Window Closed: Customer has not messaged +91 94963 00233 yet. Send via Linked SIM line to deliver instantly without window restrictions!';
      } else if (code === 131026) {
        friendlyReason = 'Number Not on WhatsApp: This phone number is not registered on WhatsApp.';
      } else if (code === 190) {
        friendlyReason = 'Meta Token Expired: Please update your permanent access token in Connected Phones.';
      } else if (code === 130429) {
        friendlyReason = 'Meta Rate Limit: Too many messages sent in a short period. System automatically pacing.';
      } else if (code === 100) {
        friendlyReason = 'Invalid Parameters / Development Mode: Ensure number is in Meta Console test list or toggle App Mode to Live.';
      }

      throw new Error(friendlyReason);
    }

    console.log(`[Meta Cloud API Engine Success] Message ID: ${data.messages?.[0]?.id}`);
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      metaResponse: data,
    };
  }

  /**
   * Verify Webhook Challenge from Meta Developer Dashboard
   */
  verifyWebhook(query, verifyToken) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Meta Webhook Verified] Verification successful with Meta.');
      return { status: 200, challenge };
    }
    return { status: 403, error: 'Forbidden: Verification token mismatch' };
  }

  /**
   * Parse Incoming Webhook Events (Status updates & Customer messages)
   */
  parseWebhookPayload(body) {
    if (!body || body.object !== 'whatsapp_business_account') return null;

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) return null;

    // Delivery Status Event (sent, delivered, read, failed)
    if (value.statuses && value.statuses.length > 0) {
      const statusObj = value.statuses[0];
      let errorReason = null;
      if (statusObj.errors && statusObj.errors.length > 0) {
        const err = statusObj.errors[0];
        if (err.code === 131030 || err.code === 131047) {
          errorReason = '24h Window Closed (Customer has not messaged +91 94963 00233 yet)';
        } else if (err.code === 131026) {
          errorReason = 'Recipient number not registered on WhatsApp';
        } else {
          errorReason = err.title || err.message || `Meta Error ${err.code}`;
        }
      }

      return {
        type: 'delivery_status',
        messageId: statusObj.id,
        status: statusObj.status, // 'delivered' | 'read' | 'failed' | 'sent'
        recipientPhone: '+' + statusObj.recipient_id,
        timestamp: statusObj.timestamp,
        errorReason,
        errors: statusObj.errors || null,
      };
    }

    // Incoming Customer Message
    if (value.messages && value.messages.length > 0) {
      const messageObj = value.messages[0];
      const contactObj = value.contacts?.[0];

      let text = '';
      if (messageObj.type === 'text') {
        text = messageObj.text?.body || '';
      } else if (messageObj.type === 'interactive') {
        text = messageObj.interactive?.button_reply?.title || messageObj.interactive?.list_reply?.title || '';
      }

      return {
        type: 'incoming_message',
        messageId: messageObj.id,
        senderPhone: '+' + messageObj.from,
        senderName: contactObj?.profile?.name || 'Customer',
        text,
        timestamp: messageObj.timestamp,
      };
    }

    return null;
  }
}

export const metaCloudApiEngine = new MetaCloudApiEngine();

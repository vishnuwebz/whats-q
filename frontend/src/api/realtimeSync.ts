import { useQiyamStore, removeDeletedConversationId } from '../store/useQiyamStore';
import { mapMessage } from './mappers';
import { API_BASE } from './client';

export interface RealtimeEvent {
  id?: string;
  type: string;
  data: any;
  timestamp?: number;
}

export type SyncStatus = 'connected' | 'reconnecting' | 'offline';

class RealtimeSyncManager {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: any = null;
  private pollFallbackTimer: any = null;
  private lastTimestamp: number = Date.now() / 1000;
  private isRunning = false;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.connect();
    this.startActiveDeltaPolling();
    this.setupWindowListeners();
  }

  public stop() {
    this.isRunning = false;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pollFallbackTimer) clearInterval(this.pollFallbackTimer);
    useQiyamStore.getState().setSyncStatus('offline');
  }

  private setupWindowListeners() {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && this.isRunning) {
        this.pollDeltaEvents();
      }
    };
    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);
  }

  private connect() {
    if (!this.isRunning) return;

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      useQiyamStore.getState().setSyncStatus('reconnecting');
      this.eventSource = new EventSource(`${API_BASE}/core/events/stream/`);

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        useQiyamStore.getState().setSyncStatus('connected');
        console.log('[RealtimeSync] Connected to live event stream');
      };

      this.eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Could not parse SSE message:', err);
        }
      };

      // Custom event listener for typed events
      this.eventSource.addEventListener('message.created', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing message.created event:', err);
        }
      });

      this.eventSource.addEventListener('conversation.created', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing conversation.created event:', err);
        }
      });

      this.eventSource.addEventListener('conversation.updated', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing conversation.updated event:', err);
        }
      });

      this.eventSource.addEventListener('contact.resubscribed', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload.type ? payload : { type: 'contact.resubscribed', data: payload.data || payload });
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing contact.resubscribed event:', err);
        }
      });

      this.eventSource.addEventListener('contact.opted_out', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload.type ? payload : { type: 'contact.opted_out', data: payload.data || payload });
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing contact.opted_out event:', err);
        }
      });

      this.eventSource.addEventListener('notification.new', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing notification.new event:', err);
        }
      });

      this.eventSource.addEventListener('message.status_updated', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing message.status_updated event:', err);
        }
      });

      this.eventSource.addEventListener('conversation.typing', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing conversation.typing event:', err);
        }
      });

      this.eventSource.addEventListener('system.update_available', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing system.update_available event:', err);
        }
      });

      this.eventSource.addEventListener('system.deployed', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing system.deployed event:', err);
        }
      });

      this.eventSource.addEventListener('message.reaction', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing message.reaction event:', err);
        }
      });

      this.eventSource.addEventListener('conversation.presence', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing conversation.presence event:', err);
        }
      });

      this.eventSource.addEventListener('presence.update', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing presence.update event:', err);
        }
      });

      this.eventSource.addEventListener('campaign.updated', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing campaign.updated event:', err);
        }
      });

      this.eventSource.addEventListener('template.status_updated', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          this.handleEvent(payload);
        } catch (err) {
          console.warn('[RealtimeSync] Error parsing template.status_updated event:', err);
        }
      });

      this.eventSource.onerror = () => {
        console.warn('[RealtimeSync] Event stream connection dropped. Reconnecting with exponential backoff...');
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        useQiyamStore.getState().setSyncStatus('reconnecting');
        this.scheduleReconnect();
      };
    } catch (err) {
      console.warn('[RealtimeSync] Failed to initialize EventSource:', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.isRunning) return;

    this.reconnectAttempts++;
    // Exponential backoff: 1s, 2s, 4s, 8s up to 10s max
    const delay = Math.min(1000 * Math.pow(1.8, this.reconnectAttempts), 10000);

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      // Run a delta poll to catch any missed events while disconnected
      this.pollDeltaEvents();
      this.connect();
    }, delay);

    // Ensure background delta polling is running
    if (!this.pollFallbackTimer) {
      this.startActiveDeltaPolling();
    }
  }

  private startActiveDeltaPolling() {
    if (this.pollFallbackTimer) return;
    // Immediate initial sync on start
    this.pollDeltaEvents();
    this.pollFallbackTimer = setInterval(() => {
      if (this.isRunning) {
        this.pollDeltaEvents();
      }
    }, 3000);
  }

  private async pollDeltaEvents() {
    try {
      const res = await fetch(`${API_BASE}/core/events/sync/?since=${this.lastTimestamp}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        for (const evt of data.events) {
          this.handleEvent(evt);
        }
      }
      if (data.server_time) {
        this.lastTimestamp = data.server_time;
      }
    } catch (err) {
      console.warn('[RealtimeSync] Delta sync poll error:', err);
    }
  }

  private handleEvent(event: RealtimeEvent) {
    if (!event || !event.type) return;
    if (event.timestamp) {
      this.lastTimestamp = Math.max(this.lastTimestamp, event.timestamp);
    }

    const store = useQiyamStore.getState();

    switch (event.type) {
      case 'message.created': {
        const { conversation_id, message } = event.data || {};
        if (conversation_id && message) {
          const mapped = mapMessage(message);
          store.applyRealtimeMessage(conversation_id, mapped);
        }
        break;
      }

      case 'conversation.created': {
        if (event.data && event.data.id) {
          removeDeletedConversationId(event.data.id);
          store.refreshConversations();
        }
        break;
      }

      case 'conversation.updated': {
        if (event.data && event.data.id) {
          removeDeletedConversationId(event.data.id);
          store.applyRealtimeConversation(event.data);
          if (event.data.is_opted_out === false && event.data.is_blocked === false && event.data.phone_number) {
            store.removeSuppressionRecord(event.data.phone_number, event.data.id);
          } else if ((event.data.is_opted_out === true || event.data.is_blocked === true) && event.data.phone_number) {
            store.addSuppressionRecord({
              id: `sup-conv-${event.data.id}`,
              name: event.data.contact_name || 'Customer',
              phone: event.data.phone_number,
              type: event.data.is_blocked ? 'blocked' : 'opt_out_stop',
              reason: event.data.suppression_reason || (event.data.is_blocked ? 'Blocked by customer' : 'Customer opted out (STOP)'),
              metaErrorCode: event.data.is_blocked ? '131051' : undefined,
              date: event.data.last_contact_date || 'Recent',
              status: 'Suppressed',
              canResubscribe: true,
              source: event.data.is_blocked ? 'WhatsApp Block' : 'Inbound WhatsApp Keyword (STOP)',
              conversation_id: event.data.id,
            });
          }
        }
        break;
      }

      case 'contact.resubscribed': {
        const { conversation_id, phone } = event.data || {};
        if (phone || conversation_id) {
          store.removeSuppressionRecord(phone || String(conversation_id), conversation_id);
        }
        break;
      }

      case 'contact.opted_out': {
        const { conversation_id, phone, name, reason, date, record } = event.data || {};
        if (phone) {
          store.addSuppressionRecord({
            id: record?.id || `sup-${Date.now()}`,
            name: name || record?.name || 'Customer',
            phone,
            type: record?.type || 'opt_out_stop',
            reason: reason || record?.reason || 'Replied "STOP" on WhatsApp',
            date: date || record?.date || 'Recent',
            status: 'Suppressed',
            canResubscribe: true,
            source: record?.source || 'Inbound WhatsApp Keyword (STOP)',
            conversation_id,
          });
        }
        break;
      }

      case 'contact.blocked': {
        const { conversation_id, phone, name, reason, date, code, record } = event.data || {};
        if (phone) {
          store.addSuppressionRecord({
            id: record?.id || `sup-${Date.now()}`,
            name: name || record?.name || 'Customer',
            phone,
            type: 'blocked',
            reason: reason || record?.reason || `Meta Error ${code || '131051'}: User blocked business line`,
            metaErrorCode: code || record?.metaErrorCode || '131051',
            date: date || record?.date || 'Recent',
            status: 'Suppressed',
            canResubscribe: false,
            source: record?.source || 'Meta Cloud API Webhook (Delivery Failed: 131051)',
            conversation_id,
          });
        }
        break;
      }

      case 'campaign.updated': {
        store.fetchBulkCampaigns();
        break;
      }

      case 'template.status_updated': {
        if (event.data) {
          store.applyRealtimeTemplateStatus(event.data);
        }
        break;
      }

      case 'notification.new': {
        if (event.data) {
          store.applyRealtimeNotification(event.data);
        }
        break;
      }

      case 'lead.updated': {
        if (event.data && event.data.id) {
          store.applyRealtimeLead(event.data);
        }
        break;
      }

      case 'job.updated': {
        if (event.data && event.data.id) {
          store.applyRealtimeJob(event.data);
        }
        break;
      }

      case 'system.connected': {
        store.setSyncStatus('connected');
        break;
      }

      case 'message.status_updated': {
        const { conversation_id, message_id, status } = event.data || {};
        if (conversation_id && message_id && status) {
          store.applyMessageStatus(conversation_id, message_id, status);
        }
        break;
      }

      case 'message.reaction': {
        const { conversation_id, message_id, emoji, from } = event.data || {};
        if (conversation_id && message_id && emoji) {
          store.applyMessageReaction(conversation_id, message_id, emoji, from || 'customer');
        }
        break;
      }

      case 'conversation.typing': {
        const { conversation_id, is_typing } = event.data || {};
        if (conversation_id !== undefined) {
          store.setClientTyping(conversation_id, !!is_typing);
        }
        break;
      }

      case 'conversation.presence':
      case 'presence.update': {
        const { conversation_id, is_online, last_seen } = event.data || {};
        if (conversation_id !== undefined) {
          store.setClientPresence(conversation_id, !!is_online, last_seen);
        }
        break;
      }

      case 'system.update_available':
      case 'system.deployed': {
        if (event.data) {
          store.applyGlobalUpdateAvailable(event.data);
        }
        break;
      }

      default:
        // Handle generic updates
        break;
    }
  }
}

export const realtimeSyncManager = new RealtimeSyncManager();

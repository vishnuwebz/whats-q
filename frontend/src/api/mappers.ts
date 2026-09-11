import type {
  AutomationLog,
  Conversation,
  WhatsAppMessage,
} from '../types';

export function mapMessage(raw: Record<string, unknown>): WhatsAppMessage {
  const status = String(raw.status || 'sent').toLowerCase() as WhatsAppMessage['status'];
  return {
    id: raw.id as string | number,
    sender: raw.sender as WhatsAppMessage['sender'],
    senderName: (raw.senderName as string) || (raw.sender_name as string) || undefined,
    text: String(raw.text || ''),
    timestamp: String(raw.timestamp || ''),
    status: ['sent', 'delivered', 'read', 'pending'].includes(status) ? status : 'sent',
    richCard: (raw.rich_card || raw.richCard) as WhatsAppMessage['richCard'],
  };
}

export function mapConversation(raw: Record<string, unknown>): Conversation {
  const messages = Array.isArray(raw.messages)
    ? raw.messages.map((m) => mapMessage(m as Record<string, unknown>))
    : [];
  return { ...(raw as unknown as Conversation), messages };
}

export function mapAutomationLog(raw: Record<string, unknown>): AutomationLog {
  return {
    ...(raw as unknown as AutomationLog),
    logLevel: String(raw.logLevel || raw.log_level || 'Info'),
  };
}

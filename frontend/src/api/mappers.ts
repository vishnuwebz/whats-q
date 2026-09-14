import type {
  AutomationLog,
  Conversation,
  WhatsAppMessage,
} from '../types';

export function mapMessage(raw: Record<string, unknown>): WhatsAppMessage {
  const status = String(raw.status || 'sent').toLowerCase() as WhatsAppMessage['status'];
  const richCardRaw = (raw.rich_card || raw.richCard) as Record<string, unknown> | undefined;
  // Reactions are stored inside rich_card.reactions on the backend
  const reactionsRaw = richCardRaw?.reactions as { emoji: string; from: string }[] | undefined;
  const reactions: WhatsAppMessage['reactions'] = reactionsRaw?.length
    ? reactionsRaw.map((r) => ({
        emoji: r.emoji,
        from: (r.from || 'customer') as WhatsAppMessage['reactions'][0]['from'],
      }))
    : undefined;
  // Strip reactions out of richCard before passing to frontend richCard type
  const richCard = richCardRaw
    ? (Object.fromEntries(Object.entries(richCardRaw).filter(([k]) => k !== 'reactions')) as WhatsAppMessage['richCard'])
    : undefined;
  return {
    id: raw.id as string | number,
    sender: raw.sender as WhatsAppMessage['sender'],
    senderName: (raw.senderName as string) || (raw.sender_name as string) || undefined,
    text: String(raw.text || ''),
    timestamp: String(raw.timestamp || ''),
    status: ['sent', 'delivered', 'read', 'pending'].includes(status) ? status : 'sent',
    richCard,
    reactions,
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

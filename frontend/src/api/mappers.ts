import type {
  AutomationLog,
  Conversation,
  WhatsAppMessage,
} from '../types';
import {
  getDeletedMessageIds,
  getDeletedForEveryoneMessageIds,
} from '../utils/deletedMessagesStorage';

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
  const rawText = String(raw.text || '');

  const isDeletedForEveryone =
    raw.deletedScope === 'everyone' ||
    richCardRaw?.deleted_scope === 'everyone' ||
    rawText === 'This message was deleted' ||
    getDeletedForEveryoneMessageIds().includes(String(raw.id));

  const isVoice = !isDeletedForEveryone && Boolean(
    raw.isVoiceNote ||
    raw.is_voice_note ||
    richCardRaw?.type === 'voice_note' ||
    richCardRaw?.is_voice ||
    rawText.includes('🎙️') ||
    rawText.toLowerCase().includes('voice note')
  );
  const audioDuration = isDeletedForEveryone ? undefined : (
    (raw.audioDuration as number) ||
    (raw.audio_duration as number) ||
    (richCardRaw?.duration as number) ||
    (richCardRaw?.audioDuration as number) ||
    (() => {
      const match = rawText.match(/\((\d+)\s*s(?:\s+audio)?\)/i);
      return match ? parseInt(match[1], 10) : undefined;
    })()
  );

  return {
    id: raw.id as string | number,
    sender: raw.sender as WhatsAppMessage['sender'],
    senderName: (raw.senderName as string) || (raw.sender_name as string) || undefined,
    sender_device: (raw.sender_device as string) || undefined,
    sender_phone: (raw.sender_phone as string) || undefined,
    recipient_phone: (raw.recipient_phone as string) || (raw.recipientPhone as string) || undefined,
    isTemplate: Boolean(raw.is_template || raw.isTemplate),
    workflowName: (raw.workflow_name as string) || (raw.workflowName as string) || undefined,
    text: isDeletedForEveryone ? 'This message was deleted' : rawText,
    timestamp: String(raw.timestamp || ''),
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    status: ['sent', 'delivered', 'read', 'pending'].includes(status) ? status : 'sent',
    isVoiceNote: isVoice,
    audioUrl: isDeletedForEveryone ? undefined : ((raw.audioUrl as string) || (raw.audio_url as string) || (richCardRaw?.audioUrl as string) || (richCardRaw?.audio_url as string) || undefined),
    audioDuration,
    waveform: isDeletedForEveryone ? undefined : ((raw.waveform as number[]) || (richCardRaw?.waveform as number[]) || undefined),
    deletedScope: isDeletedForEveryone ? 'everyone' : ((raw.deletedScope as any) || (richCardRaw?.deleted_scope as any) || undefined),
    richCard: isDeletedForEveryone ? undefined : richCard,
    reactions: isDeletedForEveryone ? undefined : reactions,
  };
}

export function mapConversation(raw: Record<string, unknown>): Conversation {
  const deletedMsgIds = getDeletedMessageIds();
  const messages = Array.isArray(raw.messages)
    ? raw.messages
        .filter((m) => !deletedMsgIds.includes(String((m as Record<string, unknown>)?.id)))
        .map((m) => mapMessage(m as Record<string, unknown>))
    : [];
  return {
    ...(raw as unknown as Conversation),
    messages,
    is_online: Boolean(raw.is_online),
    last_seen: String(raw.last_seen || ''),
    avatar: String(raw.avatar || ''),
    updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
  };
}

export function mapAutomationLog(raw: Record<string, unknown>): AutomationLog {
  return {
    ...(raw as unknown as AutomationLog),
    logLevel: String(raw.logLevel || raw.log_level || 'Info'),
  };
}

import { Conversation } from '../types';

/**
 * Computes a numerical epoch timestamp (in milliseconds) representing the
 * conversation's most recent activity/message time for WhatsApp-style descending sort.
 */
export function getConversationRecencyScore(conv: Conversation): number {
  if (!conv) return 0;

  // 1. Inspect the latest message in the conversation (if any exist)
  if (conv.messages && conv.messages.length > 0) {
    const lastMsg = conv.messages[conv.messages.length - 1];

    // Optimistic local message timestamp (e.g. msg-1726388912345)
    if (typeof lastMsg.id === 'string' && lastMsg.id.startsWith('msg-')) {
      const parsedMs = parseInt(lastMsg.id.replace('msg-', ''), 10);
      if (!isNaN(parsedMs) && parsedMs > 0) {
        return parsedMs;
      }
    }

    // Backend ISO created_at (e.g. 2026-09-15T06:47:00Z)
    if (lastMsg.created_at) {
      const t = Date.parse(lastMsg.created_at);
      if (!isNaN(t)) return t;
    }

    // Text timestamp (e.g. "12:17 PM", "10:30 AM", or "Sep 15, 2026 12:17 PM")
    if (lastMsg.timestamp) {
      const timeMatch = lastMsg.timestamp.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
      if (timeMatch) {
        const today = new Date();
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[4]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        today.setHours(hours, minutes, 0, 0);
        return today.getTime();
      }

      const t = Date.parse(lastMsg.timestamp);
      if (!isNaN(t)) return t;
    }
  }

  // 2. Inspect conv.last_contact_date (e.g. "Just now", "May 12, 2024 10:32 AM", "12:17 PM")
  if (conv.last_contact_date) {
    const trimmed = conv.last_contact_date.trim();
    if (trimmed.toLowerCase() === 'just now') {
      return Date.now();
    }

    const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (timeMatch) {
      const today = new Date();
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[4]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      today.setHours(hours, minutes, 0, 0);
      return today.getTime();
    }

    const t = Date.parse(trimmed);
    if (!isNaN(t)) return t;
  }

  // 3. Inspect conv.updated_at
  if (conv.updated_at) {
    const t = Date.parse(conv.updated_at);
    if (!isNaN(t)) return t;
  }

  // 4. Fallback: conv.first_contact_date
  if (conv.first_contact_date) {
    const t = Date.parse(conv.first_contact_date);
    if (!isNaN(t)) return t;
  }

  // 5. Fallback: numeric ID
  const numId = typeof conv.id === 'number' ? conv.id : parseInt(String(conv.id), 10);
  return !isNaN(numId) ? numId : 0;
}

/**
 * Sorts an array of conversations so that the most recently active chat
 * is at the top (index 0), exactly matching WhatsApp behavior.
 */
export function sortConversationsByRecency(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort(
    (a, b) => getConversationRecencyScore(b) - getConversationRecencyScore(a)
  );
}

/**
 * Formats the timestamp display for a conversation preview in the sidebar:
 * - "Just now" if active right now
 * - "12:17 PM" if today
 * - "Yesterday" if yesterday
 * - "Sunday" / weekday if within the last 6 days
 * - "May 12" or "12/05/2024" if older
 */
export function formatWhatsAppChatTime(conv: Conversation): string {
  const lastMsg = (conv.messages && conv.messages.length > 0)
    ? conv.messages[conv.messages.length - 1]
    : null;

  // Check last message timestamp
  if (lastMsg) {
    if (lastMsg.created_at) {
      const d = new Date(lastMsg.created_at);
      if (!isNaN(d.getTime())) {
        return formatRelativeDate(d);
      }
    }

    if (lastMsg.timestamp) {
      const trimmed = lastMsg.timestamp.trim();
      if (/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(trimmed)) {
        return trimmed;
      }
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return formatRelativeDate(d);
      }
      return trimmed;
    }
  }

  // Check conversation last_contact_date
  if (conv.last_contact_date) {
    const trimmed = conv.last_contact_date.trim();
    if (trimmed.toLowerCase() === 'just now') {
      return 'Just now';
    }
    if (/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(trimmed)) {
      return trimmed;
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return formatRelativeDate(d);
    }
    return trimmed.split(' ')[0] || trimmed;
  }

  // Fallback to first_contact_date
  if (conv.first_contact_date) {
    const d = new Date(conv.first_contact_date);
    if (!isNaN(d.getTime())) {
      return formatRelativeDate(d);
    }
    return conv.first_contact_date.split(' ')[0] || '10:30 AM';
  }

  return '10:30 AM';
}

function formatRelativeDate(d: Date): string {
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= 2 && diffDays <= 6) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }

  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

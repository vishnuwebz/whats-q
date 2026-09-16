import { Conversation, WhatsAppMessage } from '../types';

/**
 * Parses any date/time string representation from messages, conversations, or ISO timestamps.
 */
export function parseAnyDate(raw?: string | null): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.toLowerCase() === 'just now') {
    return new Date();
  }

  if (trimmed.toLowerCase() === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  if (trimmed.toLowerCase() === 'today') {
    return new Date();
  }

  // Check for time-only format: "10:30 AM", "12:17 PM", "14:30"
  const timeOnly = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (timeOnly) {
    const d = new Date();
    let hours = parseInt(timeOnly[1], 10);
    const minutes = parseInt(timeOnly[2], 10);
    const ampm = timeOnly[4]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  // Try standard Date.parse
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }

  // Handle month names without year (e.g. "May 10", "May 9") -> infer year 2024 (matching demo seed)
  const monthDayMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2})(?:\s+(\d{4}))?(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM)?)?$/i);
  if (monthDayMatch) {
    const month = monthDayMatch[1];
    const day = monthDayMatch[2];
    const year = monthDayMatch[3] || '2024';
    const timeStr = monthDayMatch[4] ? ` ${monthDayMatch[4]}:${monthDayMatch[5]} ${monthDayMatch[6] || ''}` : ' 10:30 AM';
    const fallbackDate = Date.parse(`${month} ${day}, ${year}${timeStr}`);
    if (!isNaN(fallbackDate)) {
      return new Date(fallbackDate);
    }
  }

  return null;
}

/**
 * Resolves the most accurate Date object for a message, taking into account
 * parent conversation context if the message timestamp is only a time.
 */
export function getMessageDateObj(msg: WhatsAppMessage, conv?: Conversation | null): Date {
  if (!msg) return new Date();

  // 1. If message timestamp has full date information (e.g. "May 12, 2024 10:30 AM")
  if (msg.timestamp) {
    const trimmed = msg.timestamp.trim();
    if (/[a-zA-Z]{3,}|\d{4}|\/|-/.test(trimmed) && !/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(trimmed)) {
      const d = parseAnyDate(trimmed);
      if (d) return d;
    }
  }

  // 2. If parent conversation has an explicit historical contact date (e.g. "May 12, 2024 10:32 AM" or "May 10")
  if (conv?.last_contact_date || conv?.first_contact_date) {
    const convDateRaw = conv.last_contact_date || conv.first_contact_date;
    const convDate = parseAnyDate(convDateRaw);
    if (convDate) {
      // If msg.timestamp has a time component (e.g. "10:30 AM"), merge the conversation's date with the message time
      if (msg.timestamp) {
        const timeMatch = msg.timestamp.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3]?.toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          const merged = new Date(convDate);
          merged.setHours(hours, minutes, 0, 0);
          return merged;
        }
      }
      return convDate;
    }
  }

  // 3. Inspect msg.created_at ISO timestamp
  if (msg.created_at) {
    const d = parseAnyDate(msg.created_at);
    if (d) return d;
  }

  // 4. Message timestamp fallback
  if (msg.timestamp) {
    const d = parseAnyDate(msg.timestamp);
    if (d) return d;
  }

  return new Date();
}

/**
 * Returns a day key (YYYY-MM-DD) for grouping messages by day.
 */
export function getMessageDayKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats the centered WhatsApp date chip label:
 * - "Today"
 * - "Yesterday"
 * - "Monday, May 13, 2024"
 */
export function formatMessageDateGroup(d: Date): string {
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const currentYear = now.getFullYear();
  const msgYear = d.getFullYear();

  if (currentYear === msgYear) {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns full date & time tooltip, e.g.:
 * "Monday, May 13, 2024 • 10:32 AM"
 */
export function formatFullMessageTooltip(msg: WhatsAppMessage, conv?: Conversation | null): string {
  const d = getMessageDateObj(msg, conv);
  const dateLabel = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeLabel = msg.timestamp || d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${dateLabel} • ${timeLabel}`;
}

/**
 * Categorizes a date into time of day:
 * - morning: 06:00 - 11:59
 * - afternoon: 12:00 - 16:59
 * - evening: 17:00 - 21:59
 * - night: 22:00 - 05:59
 */
export function getTimeOfDaySlot(d: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hours = d.getHours();
  if (hours >= 6 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 22) return 'evening';
  return 'night';
}

/**
 * Computes a numerical epoch timestamp (in milliseconds) representing the
 * conversation's most recent activity/message time for WhatsApp-style descending sort.
 */
export function getConversationRecencyScore(conv: Conversation): number {
  if (!conv) return 0;

  // 1. Inspect the latest message in the conversation
  if (conv.messages && conv.messages.length > 0) {
    const lastMsg = conv.messages[conv.messages.length - 1];

    if (typeof lastMsg.id === 'string' && lastMsg.id.startsWith('msg-')) {
      const parsedMs = parseInt(lastMsg.id.replace('msg-', ''), 10);
      if (!isNaN(parsedMs) && parsedMs > 0) return parsedMs;
    }

    const d = getMessageDateObj(lastMsg, conv);
    if (d && !isNaN(d.getTime())) {
      return d.getTime();
    }
  }

  // 2. Inspect conv.last_contact_date
  if (conv.last_contact_date) {
    const d = parseAnyDate(conv.last_contact_date);
    if (d && !isNaN(d.getTime())) return d.getTime();
  }

  // 3. Inspect conv.updated_at
  if (conv.updated_at) {
    const d = parseAnyDate(conv.updated_at);
    if (d && !isNaN(d.getTime())) return d.getTime();
  }

  // 4. Fallback: conv.first_contact_date
  if (conv.first_contact_date) {
    const d = parseAnyDate(conv.first_contact_date);
    if (d && !isNaN(d.getTime())) return d.getTime();
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
 * - "Sun" / weekday if within the last 6 days
 * - "May 12" or "12/05/2024" if older
 */
export function formatWhatsAppChatTime(conv: Conversation): string {
  const lastMsg = (conv.messages && conv.messages.length > 0)
    ? conv.messages[conv.messages.length - 1]
    : null;

  if (lastMsg) {
    const d = getMessageDateObj(lastMsg, conv);
    if (d && !isNaN(d.getTime())) {
      return formatRelativeChatDate(d, lastMsg.timestamp);
    }
  }

  if (conv.last_contact_date) {
    const trimmed = conv.last_contact_date.trim();
    if (trimmed.toLowerCase() === 'just now') return 'Just now';
    const d = parseAnyDate(trimmed);
    if (d && !isNaN(d.getTime())) {
      return formatRelativeChatDate(d, trimmed);
    }
    return trimmed;
  }

  if (conv.first_contact_date) {
    const d = parseAnyDate(conv.first_contact_date);
    if (d && !isNaN(d.getTime())) {
      return formatRelativeChatDate(d);
    }
  }

  return '10:30 AM';
}

function formatRelativeChatDate(d: Date, originalTimeStr?: string): string {
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    if (originalTimeStr && /^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(originalTimeStr.trim())) {
      return originalTimeStr.trim();
    }
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= 2 && diffDays <= 6) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  const isCurrentYear = d.getFullYear() === now.getFullYear();
  if (isCurrentYear) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

/**
 * Returns a full badge representation for a conversation preview:
 * { dateLabel: 'Today' | 'Yesterday' | 'May 12, 2024', timeLabel: '10:30 AM', isToday: boolean, isYesterday: boolean }
 */
export function getConversationDateBadge(conv: Conversation): {
  dateLabel: string;
  timeLabel: string;
  isToday: boolean;
  isYesterday: boolean;
  dateObj: Date;
} {
  const lastMsg = (conv.messages && conv.messages.length > 0)
    ? conv.messages[conv.messages.length - 1]
    : null;

  const d = lastMsg ? getMessageDateObj(lastMsg, conv) : (parseAnyDate(conv.last_contact_date) || new Date());
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  let dateLabel = '';
  if (isToday) {
    dateLabel = 'Today';
  } else if (isYesterday) {
    dateLabel = 'Yesterday';
  } else {
    dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const timeLabel = lastMsg?.timestamp && /^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(lastMsg.timestamp.trim())
    ? lastMsg.timestamp.trim()
    : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return { dateLabel, timeLabel, isToday, isYesterday, dateObj: d };
}

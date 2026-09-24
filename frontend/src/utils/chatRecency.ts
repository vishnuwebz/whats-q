import { Conversation, WhatsAppMessage } from '../types';

/**
 * Checks if a string contains an explicit calendar date (e.g. "Yesterday", "May 12", "2026-09-23", etc.)
 * rather than only a time ("10:30 AM") or a relative transient string ("Just now").
 */
export function hasExplicitDate(raw?: string | null): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toLowerCase() === 'just now') return false;
  // If it's time-only, it has no explicit date
  if (/^\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)?$/i.test(trimmed)) {
    return false;
  }
  return true;
}

/**
 * Merges time from a time string into an existing Date object.
 */
export function mergeTimeIntoDate(baseDate: Date, timeStr?: string | null): Date {
  const result = new Date(baseDate);
  if (!timeStr) return result;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[4]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    result.setHours(hours, minutes, 0, 0);
  }
  return result;
}

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

  // Handle "Yesterday" with optional time, e.g. "Yesterday", "Yesterday 05:34 PM", "yesterday, 5:34 pm", "yesterday at 10:30 AM"
  const yesterdayMatch = trimmed.match(/^yesterday(?:[,\s]+at)?[,\s]*(?:(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
  if (yesterdayMatch) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    if (yesterdayMatch[1] && yesterdayMatch[2]) {
      let hours = parseInt(yesterdayMatch[1], 10);
      const minutes = parseInt(yesterdayMatch[2], 10);
      const ampm = yesterdayMatch[4]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      d.setHours(hours, minutes, 0, 0);
    }
    return d;
  }

  // Handle "Today" with optional time, e.g. "Today", "Today 05:34 PM", "today at 10:30 AM"
  const todayMatch = trimmed.match(/^today(?:[,\s]+at)?[,\s]*(?:(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
  if (todayMatch) {
    const d = new Date();
    if (todayMatch[1] && todayMatch[2]) {
      let hours = parseInt(todayMatch[1], 10);
      const minutes = parseInt(todayMatch[2], 10);
      const ampm = todayMatch[4]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      d.setHours(hours, minutes, 0, 0);
    }
    return d;
  }

  // Handle weekday names with optional time: "Monday 10:30 AM", "Wed 05:34 PM"
  const weekdayMatch = trimmed.match(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat)(?:[,\s]+at)?[,\s]*(?:(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
  if (weekdayMatch) {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const targetIdx = dayNames.findIndex(n => weekdayMatch[1].toLowerCase().startsWith(n));
    if (targetIdx !== -1) {
      const d = new Date();
      const currentDay = d.getDay();
      let diff = currentDay - targetIdx;
      if (diff <= 0) diff += 7; // Previous occurrence within past week
      d.setDate(d.getDate() - diff);
      if (weekdayMatch[2] && weekdayMatch[3]) {
        let hours = parseInt(weekdayMatch[2], 10);
        const minutes = parseInt(weekdayMatch[3], 10);
        const ampm = weekdayMatch[5]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        d.setHours(hours, minutes, 0, 0);
      }
      return d;
    }
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
 * parent conversation context and sibling messages in the same thread.
 */
export function getMessageDateObj(msg: WhatsAppMessage, conv?: Conversation | null): Date {
  if (!msg) return new Date();

  // 1. If message.timestamp itself has an explicit date (e.g. "Yesterday", "Yesterday 05:34 PM", "May 12, 2024 10:30 AM")
  if (msg.timestamp && hasExplicitDate(msg.timestamp)) {
    const d = parseAnyDate(msg.timestamp);
    if (d && !isNaN(d.getTime())) return d;
  }

  // 2. Inspect msg.created_at ISO timestamp
  if (msg.created_at) {
    const d = parseAnyDate(msg.created_at);
    if (d && !isNaN(d.getTime())) {
      // Guard: If conversation was explicitly marked as 'yesterday', but created_at on server happened today
      // (e.g. from seed or re-sync), respect the conversation's explicit 'yesterday' status!
      if (conv?.last_contact_date?.trim().toLowerCase() === 'yesterday') {
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
          const yest = new Date(now);
          yest.setDate(now.getDate() - 1);
          return mergeTimeIntoDate(yest, msg.timestamp);
        }
      }
      return d;
    }
  }

  // 3. Look at sibling messages in the SAME conversation thread!
  // If adjacent messages in the same conversation have an explicit date or created_at,
  // this message belongs to the exact same thread timeline!
  if (conv?.messages && conv.messages.length > 0) {
    const msgIdx = conv.messages.findIndex((m) => m === msg || String(m.id) === String(msg.id));
    // Check preceding messages first (closest earlier message)
    if (msgIdx > 0) {
      for (let i = msgIdx - 1; i >= 0; i--) {
        const prev = conv.messages[i];
        if (prev.created_at) {
          const d = parseAnyDate(prev.created_at);
          if (d && !isNaN(d.getTime())) return mergeTimeIntoDate(d, msg.timestamp);
        }
        if (prev.timestamp && hasExplicitDate(prev.timestamp)) {
          const d = parseAnyDate(prev.timestamp);
          if (d && !isNaN(d.getTime())) return mergeTimeIntoDate(d, msg.timestamp);
        }
      }
    }
    // Check subsequent messages (closest next message)
    if (msgIdx >= 0 && msgIdx < conv.messages.length - 1) {
      for (let i = msgIdx + 1; i < conv.messages.length; i++) {
        const next = conv.messages[i];
        if (next.created_at) {
          const d = parseAnyDate(next.created_at);
          if (d && !isNaN(d.getTime())) return mergeTimeIntoDate(d, msg.timestamp);
        }
        if (next.timestamp && hasExplicitDate(next.timestamp)) {
          const d = parseAnyDate(next.timestamp);
          if (d && !isNaN(d.getTime())) return mergeTimeIntoDate(d, msg.timestamp);
        }
      }
    }
  }

  // 4. Conversation candidates: Prioritize conv.last_contact_date over first_contact_date!
  // Note: Django models default first_contact_date to 'May 12, 2024', so we check last_contact_date first.
  const candidates: (string | undefined | null)[] = [
    conv?.last_contact_date,
  ];
  if (conv?.first_contact_date && !conv.first_contact_date.includes('May 12, 2024')) {
    candidates.push(conv.first_contact_date);
  }

  for (const cand of candidates) {
    if (cand && hasExplicitDate(cand)) {
      const d = parseAnyDate(cand);
      if (d && !isNaN(d.getTime())) {
        return mergeTimeIntoDate(d, msg.timestamp);
      }
    }
  }

  // Fallback check on first_contact_date if no last_contact_date existed
  if (conv?.first_contact_date && hasExplicitDate(conv.first_contact_date)) {
    const d = parseAnyDate(conv.first_contact_date);
    if (d && !isNaN(d.getTime())) {
      return mergeTimeIntoDate(d, msg.timestamp);
    }
  }

  // 5. Message timestamp fallback
  if (msg.timestamp) {
    const d = parseAnyDate(msg.timestamp);
    if (d && !isNaN(d.getTime())) return d;
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
 * - "TODAY"
 * - "YESTERDAY"
 * - "MONDAY", "TUESDAY", etc. (within 7 days)
 * - "14 SEPTEMBER 2026" / "12 MAY 2024"
 */
export function formatMessageDateGroup(d: Date): string {
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return 'TODAY';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY';

  const diffTime = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If within last 6 days, official WhatsApp shows uppercase weekday name (e.g. "MONDAY", "TUESDAY")
  if (diffDays >= 0 && diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  }

  const currentYear = now.getFullYear();
  const msgYear = d.getFullYear();

  if (currentYear === msgYear) {
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
    }).toUpperCase();
  }

  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();
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

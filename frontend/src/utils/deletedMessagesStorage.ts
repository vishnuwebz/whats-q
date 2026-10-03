const DELETED_MESSAGES_KEY = 'whatsq_deleted_messages';
const DELETED_FOR_EVERYONE_KEY = 'whatsq_deleted_for_everyone_messages';

export function getDeletedMessageIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedMessageId(id: string | number): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedMessageIds();
    const strId = String(id);
    if (!list.includes(strId)) {
      list.push(strId);
      localStorage.setItem(DELETED_MESSAGES_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage error
  }
}

export function getDeletedForEveryoneMessageIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_FOR_EVERYONE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedForEveryoneMessageId(id: string | number): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedForEveryoneMessageIds();
    const strId = String(id);
    if (!list.includes(strId)) {
      list.push(strId);
      localStorage.setItem(DELETED_FOR_EVERYONE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage error
  }
}

/**
 * Utility helper to determine if a record's date string falls within a start/end interval.
 */

export function parseDateToYMD(dateVal?: string | number | Date | null, fallbackYear?: number): string | null {
  if (!dateVal) return null;

  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return null;
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (typeof dateVal === 'number') {
    // If epoch timestamp in seconds vs milliseconds
    const ms = dateVal < 10000000000 ? dateVal * 1000 : dateVal;
    const dt = new Date(ms);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const s = String(dateVal).trim();
  if (!s || s === '-' || s.toLowerCase() === 'pending' || s.toLowerCase() === 'n/a') return null;

  const lower = s.toLowerCase();
  const now = new Date();
  const getPad = (n: number) => String(n).padStart(2, '0');
  const formatYMD = (dt: Date) => `${dt.getFullYear()}-${getPad(dt.getMonth() + 1)}-${getPad(dt.getDate())}`;

  if (lower.startsWith('today') || lower.includes('just now')) {
    return formatYMD(now);
  }
  if (lower.startsWith('yesterday')) {
    const yest = new Date(now.getTime() - 86400000);
    return formatYMD(yest);
  }

  // 1. Direct YYYY-MM-DD match (avoids UTC timezone day shifting)
  const ymdMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
  }

  // 2. DD/MM/YYYY or DD-MM-YYYY match
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${getPad(Number(dmyMatch[2]))}-${getPad(Number(dmyMatch[1]))}`;
  }

  // 3. Clean string by removing time suffixes like ", 10:30 AM" or "at 5:00 PM"
  const cleanedStr = s.replace(/,\s*\d{1,2}:\d{2}.*$/i, '').replace(/\s+at\s+\d{1,2}:\d{2}.*$/i, '').trim();

  // Try parsing cleaned string
  try {
    const parsed = new Date(cleanedStr);
    if (!isNaN(parsed.getTime())) {
      // If year is suspiciously default 2001 or missing and we have a fallback year
      let y = parsed.getFullYear();
      if (fallbackYear && (y === 2001 || !s.match(/\b20\d{2}\b/))) {
        y = fallbackYear;
      }
      return `${y}-${getPad(parsed.getMonth() + 1)}-${getPad(parsed.getDate())}`;
    }
  } catch {}

  // 4. Fallback to raw string Date parsing
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return formatYMD(d);
    }
  } catch {}

  return null;
}

export function isDateWithinInterval(
  dateVal?: string | number | Date | null,
  interval?: { start: string; end: string } | null
): boolean {
  if (!interval || !interval.start || !interval.end) return true;
  if (!dateVal) return true;

  // 'All Time' check (2020 to 2030 encompasses all records)
  if (interval.start <= '2020-01-01' && interval.end >= '2030-12-31') return true;

  const fallbackYear = interval.start ? Number(interval.start.slice(0, 4)) : undefined;
  const ymd = parseDateToYMD(dateVal, fallbackYear);
  if (!ymd) {
    return true;
  }

  return ymd >= interval.start && ymd <= interval.end;
}

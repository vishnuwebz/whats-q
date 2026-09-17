/**
 * Utility helper to determine if a record's date string falls within a start/end interval.
 */
export function isDateWithinInterval(
  dateStr?: string | null,
  interval?: { start: string; end: string } | null
): boolean {
  if (!interval || !interval.start || !interval.end) return true;
  if (!dateStr || !dateStr.trim() || dateStr === '-') return true;

  // 'All Time' check
  if (interval.start <= '2020-01-01' && interval.end >= '2030-12-31') return true;

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return true;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    return formatted >= interval.start && formatted <= interval.end;
  } catch {
    return true;
  }
}

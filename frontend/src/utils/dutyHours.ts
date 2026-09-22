/**
 * Utility to calculate duty hours between check-in and check-out times.
 * Handles formats like: "8:58 AM", "09:05 AM (On time)", "15:17", "5:30 PM".
 * If check-out is missing or 'Active on Duty', calculates live elapsed time to now.
 */
export function calculateDutyHours(checkIn?: string, checkOut?: string): string {
  if (!checkIn || checkIn === '-' || checkIn.trim() === '') return '0h 00m';

  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr || timeStr === '-' || timeStr === 'Active on Duty') return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const inMins = parseTimeToMinutes(checkIn);
  if (inMins === null) return '0h 00m';

  let outMins = parseTimeToMinutes(checkOut || '');
  if (outMins === null) {
    const now = new Date();
    outMins = now.getHours() * 60 + now.getMinutes();
  }

  let diff = outMins - inMins;
  if (diff < 0) diff += 24 * 60; // Cross-midnight shifts
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

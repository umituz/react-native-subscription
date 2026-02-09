/**
 * Date Utilities
 */

/**
 * Checks if a date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  const d = new Date(date);
  return d.getTime() < Date.now();
}

/**
 * Converts various timestamp formats to a safe Date object
 */
export function toSafeDate(ts: any): Date | null {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts instanceof Date) return ts;
  if (typeof ts === "string" || typeof ts === "number") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Formats a date to ISO string safely
 */
export function formatISO(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

/**
 * Date Utilities - Core Operations
 * Basic date manipulation and validation functions
 */

export type DateLike = Date | string | number;

/**
 * Checks if a date is in the past
 */
export function isPast(date: DateLike): boolean {
  const d = new Date(date);
  return d.getTime() < Date.now();
}

/**
 * Checks if a date is in the future
 */
export function isFuture(date: DateLike): boolean {
  const d = new Date(date);
  return d.getTime() > Date.now();
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: DateLike): boolean {
  const d = date instanceof Date ? date : new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Converts various timestamp formats to a safe Date object
 */
export function toSafeDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (typeof ts === "object" && ts !== null && "toDate" in ts && typeof ts.toDate === "function") {
    return (ts as { toDate: () => Date }).toDate();
  }
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

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

/**
 * Get current date
 */
export function currentDate(): Date {
  return new Date();
}

/**
 * Date Converter Utilities
 * Centralized date conversion and validation logic
 * Handles Date objects, ISO strings, timestamps, and null values safely
 */

/**
 * Safely converts any date-like value to a Date object or null
 * Handles: Date objects, ISO strings, timestamps, null, undefined, invalid values
 */
export function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return isValidDate(parsed) ? parsed : null;
  }

  return null;
}

/**
 * Safely converts any date-like value to an ISO string or null
 * Handles: Date objects, ISO strings, timestamps, null, undefined, invalid values
 */
export function toISOString(value: Date | string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  // If already a string, validate it
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isValidDate(parsed) ? value : null;
  }

  // Convert to Date and then to ISO string
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

/**
 * Checks if a Date object is valid (not Invalid Date)
 * @internal - Use for internal validation only
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Safely converts a Date or string to a Firestore Timestamp
 * Returns null if the value is invalid
 */
export function toTimestamp(value: Date | string | number | null | undefined): any {
  const date = toDate(value);
  if (!date) return null;

  // Lazy import to avoid circular dependencies
  const { Timestamp } = require('firebase/firestore');
  return Timestamp.fromDate(date);
}

/**
 * Gets current date as ISO string
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

/**
 * Gets current date as Date object
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Compares two dates and returns if first is before second
 */
export function isBefore(date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);

  if (!d1 || !d2) return false;
  return d1.getTime() < d2.getTime();
}

/**
 * Compares two dates and returns if first is after second
 */
export function isAfter(date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);

  if (!d1 || !d2) return false;
  return d1.getTime() > d2.getTime();
}

/**
 * Checks if a date is in the past
 */
export function isInPast(date: Date | string | null | undefined): boolean {
  const d = toDate(date);
  if (!d) return false;
  return d.getTime() < Date.now();
}

/**
 * Checks if a date is in the future
 */
export function isInFuture(date: Date | string | null | undefined): boolean {
  const d = toDate(date);
  if (!d) return false;
  return d.getTime() > Date.now();
}

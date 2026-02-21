import { Timestamp } from "@umituz/react-native-firebase";

type FirestoreTimestamp = ReturnType<typeof Timestamp.fromDate>;

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

export function toISOString(value: Date | string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isValidDate(parsed) ? parsed.toISOString() : null;
  }

  const date = toDate(value);
  return date ? date.toISOString() : null;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function toTimestamp(value: Date | string | number | null | undefined): FirestoreTimestamp | null {
  const date = toDate(value);
  if (!date) return null;

  return Timestamp.fromDate(date);
}

export function getCurrentISOString(): string {
  return new Date().toISOString();
}

export function getCurrentDate(): Date {
  return new Date();
}

export function isBefore(date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);

  if (!d1 || !d2) return false;
  return d1.getTime() < d2.getTime();
}

export function isAfter(date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);

  if (!d1 || !d2) return false;
  return d1.getTime() > d2.getTime();
}

export function isInPast(date: Date | string | null | undefined): boolean {
  const d = toDate(date);
  if (!d) return false;
  return d.getTime() < Date.now();
}

export function isInFuture(date: Date | string | null | undefined): boolean {
  const d = toDate(date);
  if (!d) return false;
  return d.getTime() > Date.now();
}

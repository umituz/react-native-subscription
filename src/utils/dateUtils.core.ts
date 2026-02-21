export type DateLike = Date | string | number;

export function isPast(date: DateLike): boolean {
  const d = new Date(date);
  return d.getTime() < Date.now();
}

export function isFuture(date: DateLike): boolean {
  const d = new Date(date);
  return d.getTime() > Date.now();
}

export function isNow(date: DateLike, marginMs: number = 1000): boolean {
  const d = new Date(date);
  const diff = Math.abs(d.getTime() - Date.now());
  return diff <= marginMs;
}

export function isValidDate(date: DateLike): boolean {
  const d = date instanceof Date ? date : new Date(date);
  return !isNaN(d.getTime());
}

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

export function formatISO(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export function now(): number {
  return Date.now();
}

export function currentDate(): Date {
  return new Date();
}

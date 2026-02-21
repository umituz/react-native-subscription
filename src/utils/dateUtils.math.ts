import type { DateLike } from "./dateUtils.core";

export function addDays(date: DateLike, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: DateLike, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function addMinutes(date: DateLike, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

export function addMonths(date: DateLike, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addYears(date: DateLike, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function subtractDays(date: DateLike, days: number): Date {
  return addDays(date, -days);
}

export function startOfDay(date: DateLike): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: DateLike): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: DateLike): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function endOfWeek(date: DateLike): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6;
  return new Date(d.setDate(diff));
}

export function startOfMonth(date: DateLike): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(date: DateLike): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

import { isValidDate, isPast, currentDate } from "./dateUtils.core";
import { addDays } from "./dateUtils.math";

export function daysBetween(date1: Date | string | number, date2: Date | string | number): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function daysUntil(date: Date | string | number): number | null {
  const target = new Date(date);
  if (!isValidDate(target) || isPast(target)) {
    return null;
  }
  return daysBetween(currentDate(), target);
}

export function isSameDay(date1: Date | string | number, date2: Date | string | number): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(date: Date | string | number): boolean {
  return isSameDay(date, currentDate());
}

export function isYesterday(date: Date | string | number): boolean {
  const yesterday = addDays(currentDate(), -1);
  return isSameDay(date, yesterday);
}

export function isTomorrow(date: Date | string | number): boolean {
  const tomorrow = addDays(currentDate(), 1);
  return isSameDay(date, tomorrow);
}

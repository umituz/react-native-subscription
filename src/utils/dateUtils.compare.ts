/**
 * Date Utilities - Comparison Operations
 * Date comparison and calculation functions
 */

import { isValidDate, isPast, currentDate } from "./dateUtils.core";
import { addDays } from "./dateUtils.math";

/**
 * Calculate difference in days between two dates
 */
export function daysBetween(date1: Date | string | number, date2: Date | string | number): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days remaining until a date
 * Returns null if date is in the past or invalid
 */
export function daysUntil(date: Date | string | number): number | null {
  const target = new Date(date);
  if (!isValidDate(target) || isPast(target)) {
    return null;
  }
  return daysBetween(currentDate(), target);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string | number, date2: Date | string | number): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | number): boolean {
  return isSameDay(date, currentDate());
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const yesterday = addDays(currentDate(), -1);
  return isSameDay(date, yesterday);
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date | string | number): boolean {
  const tomorrow = addDays(currentDate(), 1);
  return isSameDay(date, tomorrow);
}

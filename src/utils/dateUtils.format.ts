import type { DateLike } from "./dateUtils.core";

export function formatLocale(
  date: DateLike,
  options?: Intl.DateTimeFormatOptions,
  locale: string = "en-US"
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString(locale, options);
}

export function formatRelative(date: DateLike, now: Date = new Date()): string {
  const target = new Date(date);
  if (isNaN(target.getTime())) {
    return "";
  }

  const diffMs = target.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffDays) > 0) {
    return rtf.format(diffDays, "day");
  }
  if (Math.abs(diffHours) > 0) {
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffMins) > 0) {
    return rtf.format(diffMins, "minute");
  }
  return rtf.format(diffSecs, "second");
}

export function formatShort(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(date, { month: "numeric", day: "numeric", year: "numeric" }, locale);
}

export function formatMedium(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(date, { month: "short", day: "numeric", year: "numeric" }, locale);
}

export function formatLong(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(date, { month: "long", day: "numeric", year: "numeric" }, locale);
}

export function formatTime(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(date, { hour: "numeric", minute: "numeric" }, locale);
}

export function formatDateTime(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(
    date,
    { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" },
    locale
  );
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function formatWeekday(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(date, { weekday: "long" }, locale);
}

export function formatWeekdayShort(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(date, { weekday: "short" }, locale);
}

export function formatMonth(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(date, { month: "long" }, locale);
}

export function formatMonthShort(date: DateLike, locale: string = "en-US"): string {
  return formatLocale(date, { month: "short" }, locale);
}

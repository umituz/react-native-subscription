import {
  isNonEmptyString,
  isValidNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  isInteger,
} from "./validators";

export function isValidCreditAmount(value: unknown): value is number {
  return isInteger(value) && isNonNegativeNumber(value);
}

export function isValidPrice(value: unknown): value is number {
  if (!isPositiveNumber(value)) return false;
  const decimalPlaces = (value.toString().split(".")[1] || "").length;
  return decimalPlaces <= 2;
}

export function isValidProductId(value: unknown): value is string {
  return isNonEmptyString(value) && /^[a-zA-Z0-9._-]+$/.test(value);
}

export function isValidUserId(value: unknown): value is string {
  return isNonEmptyString(value);
}

export function sanitizeString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value).trim().replace(/\s+/g, " ");
}

export function sanitizeNumber(value: unknown, defaultValue: number = 0): number {
  return isValidNumber(value) ? value : defaultValue;
}

export function isOneOf<T>(value: unknown, allowedValues: readonly T[]): value is T {
  return allowedValues.includes(value as T);
}

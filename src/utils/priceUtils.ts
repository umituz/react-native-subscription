export function formatPrice(price: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(price);
  } catch {
    return `${currencyCode} ${price.toFixed(2)}`;
  }
}

import { detectPackageType } from './packageTypeDetector';

const PERIOD_SUFFIX_MAP: Record<string, string> = {
  weekly: '/week',
  monthly: '/month',
  yearly: '/year',
};

export function getBillingPeriodSuffix(identifier: string): string {
  const packageType = detectPackageType(identifier);
  return PERIOD_SUFFIX_MAP[packageType] ?? '';
}

export function formatPriceWithPeriod(
  price: number,
  currencyCode: string,
  identifier: string
): string {
  const formattedPrice = formatPrice(price, currencyCode);
  const periodSuffix = getBillingPeriodSuffix(identifier);
  return `${formattedPrice}${periodSuffix}`;
}

/**
 * Price Formatting Utilities
 * Apple App Store Guideline 3.1.2 Compliance
 */

/**
 * Format price for display
 * @param price - Price value
 * @param currencyCode - Currency code (e.g., 'USD', 'EUR')
 * @returns Formatted price string
 */
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

/**
 * Extract billing period suffix from package identifier
 * Apple App Store Guideline 3.1.2 Compliance:
 * - Displays billing frequency clearly and conspicuously
 * - Format: /week, /month, /year
 *
 * @param identifier - RevenueCat package identifier (e.g., "$rc_weekly", "$rc_monthly", "$rc_annual")
 * @returns Billing period suffix (e.g., "/week", "/month", "/year") or empty string
 */
export function getBillingPeriodSuffix(identifier: string): string {
  const lowerIdentifier = identifier.toLowerCase();

  if (lowerIdentifier.includes('weekly') || lowerIdentifier.includes('week')) {
    return '/week';
  }

  if (lowerIdentifier.includes('monthly') || lowerIdentifier.includes('month')) {
    return '/month';
  }

  if (lowerIdentifier.includes('annual') || lowerIdentifier.includes('year') || lowerIdentifier.includes('yearly')) {
    return '/year';
  }

  return '';
}

/**
 * Format price with billing period
 * Apple App Store Guideline 3.1.2 Compliance:
 * - Combines price with billing frequency for clear display
 * - Format: $2.99/week, $14.99/month, $39.99/year
 *
 * RevenueCat Best Practice:
 * - Follows recommended price_per_period format
 * - Clear and conspicuous billing frequency display
 *
 * @param price - Price value
 * @param currencyCode - Currency code (e.g., 'USD', 'EUR')
 * @param identifier - RevenueCat package identifier
 * @returns Formatted price with billing period (e.g., "$2.99/week")
 */
export function formatPriceWithPeriod(
  price: number,
  currencyCode: string,
  identifier: string
): string {
  const formattedPrice = formatPrice(price, currencyCode);
  const periodSuffix = getBillingPeriodSuffix(identifier);
  return `${formattedPrice}${periodSuffix}`;
}
